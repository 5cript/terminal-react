import Display from './display'
import { ControlBits, DECDHL, LineWidth, CountryEncoding } from './mode';
import { readSync } from 'fs';

class ParserParts
{
    constructor(mode, errorReporter, warningReporter)
    {
        this.mode = mode;
        this.errorReporter = errorReporter;
        this.warningReporter = warningReporter;
    }

    frontIs = (data, offset, what) => {
        if (what.length + offset >= data.length)
            return false;
        return data.substr(0, what.length) == what;
    }

    bitnessDo = (s7b, s8b) => {
        if (this.mode.bits === ControlBits.S8C1T)
            return s8b();
        else
            return s7b();
    }

    frontIsCsi = (data, offset) => {
        return this.bitnessDo(
            ()=>{return this.frontIs(data, offset, '\x1b[')},
            ()=>{return this.frontIs(data, offset, '\x9b')}
        )
    }

    tryParseCsi = (data, offset) => {
        if (!this.frontIsCsi(data, offset))
            return;

        this.bitnessDo(
            ()=>{offset += 2;},
            ()=>{offset += 1;}
        );

        let hasQuestionmark = data[offset] === '?';

        let numberList = [];
        let num = 0;
        let accumNum = 0;

        let pushNum = () => {
            if (accumNum === 0)
                numberList.push(undefined);

            var y = 0;
            for(; num; num = Math.floor(num / 10)) {
                y *= 10;
                y += num % 10;
            }
            num = y;

            numberList.push(num);
            accumNum = 0;
            num = 0;
        }

        for (let i = offset + (hasQuestionmark ? 1 : 0); i !== data.length; ++i) {
            let code = data.charCodeAt(i);
            if (code >= '0'.charCodeAt(0) && code <= '9'.charCodeAt(0)) {
                num += (code - '0'.charCodeAt(0)) * Math.pow(10, accumNum);
                ++accumNum;                    
            }
            else if (code === ';'.charCodeAt(0)) {
                pushNum();
            } else {
                pushNum();
                return {
                    offset: i + 1,
                    csi: {
                        numberList: numberList,
                        hasQuestionmark: hasQuestionmark,
                        mode: data[i]
                    }
                }
            }
        }
    }

    controlAlternative = (data, offset, s7b, s8b, res) => {
        let o = 0;
        if (this.bitnessDo(
            ()=>{
                o = 2;
                return this.frontIs(data, offset, s7b);
            },
            ()=>{
                o = 1;
                return this.frontIs(data, offset, s8b);
            }
        )) {
            return {offset: offset + o, ctrl: res}
        }
        return /*undefined*/;
    }

    tryParseSingleCharacterFunctions = (data, offset) => {
        switch(data[offset])
        {
            case '\x07': return {offset: offset + 1, ctrl: 'BEL'};
            case '\x08': return {offset: offset + 1, ctrl: 'BS'};
            case '\x0d': return {offset: offset + 1, ctrl: 'CR'};
            case '\x05': return {offset: offset + 1, ctrl: 'ENQ'};
            case '\x0c': return {offset: offset + 1, ctrl: 'FF'};
            case '\x0a': return {offset: offset + 1, ctrl: 'LF'};
            case '\x0f': return {offset: offset + 1, ctrl: 'SI'};
            case '\x0e': return {offset: offset + 1, ctrl: 'SO'};
            case '\x09': return {offset: offset + 1, ctrl: 'TAB'};
            case '\x0b': return {offset: offset + 1, ctrl: 'VT'};
        }
    }

    tryParseSimpleEscapes = (data, offset) => {
        if (this.mode.bits === ControlBits.S7C1T && data[offset] !== '\x1b')
            return;

        return tryParseAnyInOrder(data, offset)(
            (data, offset)=>{this.controlAlternative(data, offset, '\x1bD', '\x84', 'IND')},
            (data, offset)=>{this.controlAlternative(data, offset, '\x1bE', '\x85', 'NEL')},
            (data, offset)=>{this.controlAlternative(data, offset, '\x1bH', '\x88', 'HTS')},
            (data, offset)=>{this.controlAlternative(data, offset, '\x1bM', '\x8d', 'RI')},
            (data, offset)=>{this.controlAlternative(data, offset, '\x1bN', '\x8e', 'SS2')},
            (data, offset)=>{this.controlAlternative(data, offset, '\x1bO', '\x8f', 'SS3')},
            (data, offset)=>{this.controlAlternative(data, offset, '\x1bP', '\x90', 'DCS')},
            (data, offset)=>{this.controlAlternative(data, offset, '\x1bV', '\x96', 'SPA')},
            (data, offset)=>{this.controlAlternative(data, offset, '\x1bW', '\x97', 'EPA')},
            (data, offset)=>{this.controlAlternative(data, offset, '\x1bX', '\x98', 'SOS')},
            (data, offset)=>{this.controlAlternative(data, offset, '\x1bZ', '\x9a', 'DECID')},
            (data, offset)=>{this.controlAlternative(data, offset, '\x1b\\', '\x9c', 'ST')},
            (data, offset)=>{this.controlAlternative(data, offset, '\x1b^', '\x9e', 'PM')},
            (data, offset)=>{this.controlAlternative(data, offset, '\x1b_', '\x9f', 'APC')}
        )
    }

    determineLanguageCharset = (data, offset) => {
        switch (data[offset + 2])
        {
            case 'A': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.UnitedKingdom}
            }
            case 'B': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.UnitedStates}
            }
            case '5':
            case 'C': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.Finnish}
            }
            case '7':
            case 'H': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.Swedish}
            }
            case 'K': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.German}
            }
            case '9':
            case 'Q': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.FrenchCanadian}
            }
            case 'f':
            case 'R': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.French}
            }
            case 'Y': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.Italian}
            }
            case 'Z': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.Spanish}
            }
            case '4': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.Dutch}
            }
            case '\"': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.Greek}
            }
            case '%': 
            {
                if (data[offset +3] === '2')
                    return {
                        offset: offset + 4, 
                        action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.Turkish}
                    }
                if (data[offset + 3] === '6')
                    return {
                        offset: offset + 4, 
                        action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.Portuguese}
                    }
                if (data[offset + 3] === '=')
                    return {
                        offset: offset + 4, 
                        action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.Hebrew}
                    }
            }
            case '=':
            {
                return {
                    offset: offset + 3,
                    action: (parser) => {parser.display.mode.Swiss}
                }
            }
            case '`':
            case 'E':
            case '6': return  {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.NorwegianDanish}
            }
            case '<': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.Supplemental}
            }
            case '>': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.Technical}
            }
            case '&': {
                if (data[offset +3] === '5')
                    return {
                        offset: offset + 4, 
                        action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.Russian}
                    }
            }
        }
        this.errorReporter('unknown sequence in country encoding selector');
        return;
    }

    determineLanguageCharsetVt300 = (data, offset) => {
        switch (data[offset + 2])
        {
            case 'A': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.ISO_Latin_1_Supplemental}
            }
            case 'F': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.ISO_Greek_Supplemental}
            }
            case 'H': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.ISO_Hebrew_Supplemental}
            }
            case 'L': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.ISO_Latin_Cyrillic}
            }
            case 'M': return {
                offset: offset + 3, 
                action: (parser) => {parser.display.mode.countryEnc = CountryEncoding.ISO_Latin_5_Supplemental}
            }
        }
        this.errorReporter('unknown sequence in country encoding selector');
        return;
    }

    /**
     * Controls that arent categorized under a special category, like CSI (Control Sequence Introducer)
     */
    tryParseControls = (data, offset) => {
        if (this.frontIs(data, offset, '\x1b F'))
            return {offset: offset + 3, action: (parser) => {
                parser.display.mode.bits = ControlBits.S7C1T;
            }};

        if (this.frontIs(data, offset, '\x1b G'))
            return {offset: offset + 3, action: (parser) => {
                parser.display.mode.bits = ControlBits.S8C1T;
            }};

        if (this.frontIs(data, offset, '\x1b L'))
            return {offset: offset + 3, action: (parser) => {
                parser.display.mode.ansiConformanceLevel = 1;
            }}

        if (this.frontIs(data, offset, '\x1b M'))
            return {offset: offset + 3, action: (parser) => {
                parser.display.mode.ansiConformanceLevel = 2;
            }}

        if (this.frontIs(data, offset, '\x1b N'))
            return {offset: offset + 3, action: (parser) => {
                parser.display.mode.ansiConformanceLevel = 3;
            }}

        if (this.frontIs(data, offset, '\x1b#3'))
            return {offset: offset +3, action: (parser) => {
                parser.display.mode.decdhl = DECDHL.Top;
            }}
            
        if (this.frontIs(data, offset, '\x1b#4'))
            return {offset: offset +3, action: (parser) => {
                parser.display.mode.decdhl = DECDHL.Bottom;
            }}

        if (this.frontIs(data, offset, '\x1b#5'))
            return {offset: offset +3, action: (parser) => {
                parser.display.mode.lineWidth = LineWidth.DECSWL;
            }}

        if (this.frontIs(data, offset, '\x1b#6'))
            return {offset: offset +3, action: (parser) => {
                parser.display.mode.lineWidth = LineWidth.DECDWL;
            }}

        if (this.frontIs(data, offset, '\x1b#8'))
            return {offset: offset + 3, action: (parser) => {
                parser.display.mode.screenAlignmentTest = true;
            }}

        if (this.frontIs(data, offset, '\x1b%@'))
            return {offset: offset + 3, action: (parser) => {
                parser.display.mode.charSet = CharacterSet.ISO8859_1;
            }}

        if (this.frontIs(data, offset, '\x1b%G'))
            return {offset: offset + 3, action: (parser) => {
                parser.display.mode.charSet = CharacterSet.UTF8;
            }}

        if (this.frontIs(data, offset, '\x1b(')) {
            let res = this.determineLanguageCharset(data, offset);
            return {offset: res.offset, action: (parser) => {
                res.action(parser);
                parser.display.mode.charSet = CharacterSet.G0;
            }}
        }

        if (this.frontIs(data, offset, '\x1b)')) {
            let res = this.determineLanguageCharset(data, offset);
            return {offset: res.offset, action: (parser) => {
                res.action(parser);
                parser.display.mode.charSet = CharacterSet.G1;
            }}
        }

        if (this.frontIs(data, offset, '\x1b*')) {
            let res = this.determineLanguageCharset(data, offset);
            return {offset: res.offset, action: (parser) => {
                res.action(parser);
                parser.display.mode.charSet = CharacterSet.G2;
            }}            
        }

        if (this.frontIs(data, offset, '\x1b-')) {
            let res = thisdetermineLanguageCharsetVt300(data, offset);
            return {offset: res.offset, action: (parser) => {
                res.action(parser);
                parser.display.mode.charSet = CharacterSet.G1;
            }}            
        }

        if (this.frontIs(data, offset, '\x1b.')) {
            let res = thisdetermineLanguageCharsetVt300(data, offset);
            return {offset: res.offset, action: (parser) => {
                res.action(parser);
                parser.display.mode.charSet = CharacterSet.G2;
            }}            
        }

        if (this.frontIs(data, offset, '\x1b/')) {
            let res = thisdetermineLanguageCharsetVt300(data, offset);
            return {offset: res.offset, action: (parser) => {
                res.action(parser);
                parser.display.mode.charSet = CharacterSet.G3;
            }}            
        }
        
        if (this.frontIs(data, offset, '\x1b6'))
            return {offset: offset + 2, ctrl: 'DECBI'}

        if (this.frontIs(data, offset, '\x1b7'))
            return {offset: offset + 2, ctrl: 'DECSC'}

        if (this.frontIs(data, offset, '\x1b8'))
            return {offset: offset + 2, ctrl: 'DECRC'}

        if (this.frontIs(data, offset, '\x1b9'))
            return {offset: offset + 2, ctrl: 'DECFI'}

        if (this.frontIs(data, offset, '\x1b='))
            return {offset: offset + 2, ctrl: 'DECKPAM'}
            
        if (this.frontIs(data, offset, '\x1b>'))
            return {offset: offset + 2, ctrl: 'DECKPNM'}
            
        if (this.frontIs(data, offset, '\x1bF'))
            return {offset: offset + 2, ctrl: 'CURLL'}
            
        if (this.frontIs(data, offset, '\x1bc'))
            return {offset: offset + 2, ctrl: 'RIS'}
            
        if (this.frontIs(data, offset, '\x1bl'))
            return {offset: offset + 2, ctrl: 'MEMLOCK'}
            
        if (this.frontIs(data, offset, '\x1bm'))
            return {offset: offset + 2, ctrl: 'MEMULOCK'}
            
        if (this.frontIs(data, offset, '\x1bn')) {
            this.warningReporter('this character set switch is not properly supported');
            return {offset: offset + 2, action: (parser) => {parser.display.mode.charSet = CharacterSet.G2;}}
        }

        if (this.frontIs(data, offset, '\x1bo')) {
            this.warningReporter('this character set switch is not properly supported');
            return {offset: offset + 2, action: (parser) => {parser.display.mode.charSet = CharacterSet.G3;}}
        }
        
        if (this.frontIs(data, offset, '\x1b|')) {
            this.warningReporter('this character set switch is not properly supported');
            return {offset: offset + 2, action: (parser) => {parser.display.mode.charSet = CharacterSet.G3;}}
        }

        if (this.frontIs(data, offset, '\x1b}')) {
            this.warningReporter('this character set switch is not properly supported');
            return {offset: offset + 2, action: (parser) => {parser.display.mode.charSet = CharacterSet.G2;}}
        }
            
        if (this.frontIs(data, offset, '\x1b~')) {
            this.warningReporter('this character set switch is not properly supported');
            return {offset: offset + 2, action: (parser) => {parser.display.mode.charSet = CharacterSet.G1;}}   
        }
    }

    tryParseAnyInOrder = (data, offset) => {
        return () => {
            for (const parserPart of arguments) {
                let res = parserPart(data, offset);
                if (res !== undefined && res.offset !== undefined && res.offset !== offset)
                    return res;
            }
            return {offset: offset};
        }
    }
}

class Parser
{
    constructor(display, errorReporter, warningReporter)
    {
        this.display = display;
        this.parts = new ParserParts(this.display.mode, errorReporter, warningReporter);
    }

    /**
     *  Consider dall data that is passed to this consumed.
     *  Dont pass consumed data again.
     */
    parse = (data) => 
    {
        for (let offset = 0; offset != data.length; ++offset) {
            let partResult = tryParseAnyInOrder(
                data, i
            )(
                this.parts.tryParseSingleCharacterFunctions,
                this.parts.tryParseSimpleEscapes,
                this.parts.tryParseCsi
            );

            if (partResult.ctrl)
                this.applySimpleControl(partResult.ctrl);

            if (partResult.csi)
                this.applyCsi(partResult.csi);

            // if nothing special was parsed: push the stuff into the display.
            if (partResult.offset === offset) {
                this.display.putChar(data[offset]);
                ++offset;
            } else {
                // something special was found, advance offset.
                offset = this.partResult.offset;
            }    
        }
    }

    applySimpleControl = (ctrl) => {
        switch (ctrl) {
            case 'IND': {
                // Index ???
                return
            }
            case 'NEL': {
                // Next Line
                break;
            }
            case 'HTS': {
                // Tab Set
                break;
            }
            case 'RI': {
                // Reverse Index
                break;
            }
            case 'SS2': {
                // Single Select G2
                break;
            }
            case 'SS3': {
                // Single Select G3
                break;
            }
            case 'DCS': {
                // Device Control String
                break;
            }
            case 'SPA': {
                // Start of guarded Area
                break;
            }
            case 'EPA': {
                // End of guarded Area
                break;
            }
            case 'SOS': {
                // Start of String
                break;
            }
            case 'DECID': {
                // Return Terminal ID
                break;
            }
            case 'ST': {
                // String Terminator
                break;
            }
            case 'PM': {
                // Privacy Message
                break;
            }
            case 'APC': {
                // Application Program Command
                break;
            }
            case 'BEL': {
                // BELL
                break;
            }
            case 'BS': {
                // backspace
                break;
            }
            case 'CR': {
                // carriage return, return cursor back to index 0 of current line
                break;
            }
            case 'ENQ': {
                // Enquiry - Return Terminal Status
                break;
            }
            case 'FF': {
                // Form Feed, treat like LF
                break;
            }
            case 'LF': {
                // Line Feed / New Line
                break;
            }
            case 'SI': {
                // Switch to G0
                break;
            }
            case 'SO': {
                // Switch to G1
                break;
            }
            /*case 'SP'* == space */
            case 'TAB': {
                // Horizontal Tab
                break;
            }
            case 'VT': {
                // Vertical Tab, treat like LF
                break;
            }
            case 'DECBI': {
                // Back Index
                break;
            }
            case 'DECSC': {
                // Save Cursor
                break;
            }
            case 'DECRC': {
                // Restore Cursor
                break;
            }
            case 'DECFI': {
                // Forward Index
                break;
            }
            case 'DECKPAM': {
                // Application Keypad
                this.display.keypadMode = Keypad.Application;
                break;
            }
            case 'DECPNM': {
                // Normal Keypad
                this.display.keypadMode = Keypad.Normal;
                break;
            }
            case 'CURLL': {
                // Cursor Lower Left
                break;
            }
            case 'RIS': {
                // Full Reset
                break;
            }
            case 'MEMLOCK': {
                // Memory Lock
                break;
            }
            case 'MEMULOCK': {
                // Memory Unlock
                break;
            }
            default:
                break;
        }
    }

    /**
     *  Apply parsed csi to display.
     */
    applyCsi = (csi) => {
        const reducer = (accumulator, currentValue) => accumulator + currentValue;

        switch (csi.mode)
        {
            case 'm': {
                let modus = new Modifier();
                let split = csi.numberList;
                for (let s = 0; s < split.length; ++s) {
                    let cur = 0;
                    try {
                        cur = split[s];
                    }
                    catch (e) {
                        continue;
                    }
                    if (cur === 0) {
                        modus = new Modifier();
                    }
                    else if (helpers.isForeground(cur)) {
                        modus.foreground = cur;
                    }
                    else if (helpers.isBackground(cur)) {
                        modus.background = cur;
                    }
                    else if (cur === 1) {
                        modus.bold = true;
                    }
                    else if (cur === 2)
                        modus.dim = true;
                    else if (cur === 4)
                        modus.underlined = true;
                    else if (cur === 5)
                        modus.blink = true;
                    else if (cur === 7)
                        modus.reverse = true;
                    else if (cur === 8)
                        modus.hidden = true;
                    else if (cur === 21)
                        modus.bold = false;
                    else if (cur === 22)
                        modus.dim = false;
                    else if (cur === 24)
                        modus.underlined = false;
                    else if (cur === 25)
                        modus.blink = false;
                    else if (cur === 27)
                        modus.reverse = false;
                    else if (cur === 28)
                        modus.hidden = false;
                    else if (cur === 38 && s + 2 < split.length && split[s + 1] === 5) {
                        modus.foreground256 = split[s + 2];
                        s+=2;
                    } else if (cur === 48 && s + 2 < split.length && split[s + 1] === 5) {
                        modus.background256 = split[s + 2];
                        s+=2;
                    }
                }

                this.display.changeModifier(modus);
                break;
            } 
            case '@': {
                let redu = csi.numberList.reduce(reducer, 0);
                for (let i = 0; i !== redu; ++i)
                    this.display.putChar(' ');
                break;
            }
            case 'A': {
                let redu = csi.numberList.reduce(reducer, 0);
                this.display.moveCursor({y: -redu}, {dontRollOver: true});
                break;
            }
            case 'B': {
                let redu = csi.numberList.reduce(reducer, 0);
                this.display.moveCursor({y: redu}, {dontRollOver: true});
                break;
            }
            case 'C': {
                let redu = csi.numberList.reduce(reducer, 0);
                this.display.moveCursor({x: redu}, {dontRollOver: true});
                break;
            }
            case 'D': {
                let redu = csi.numberList.reduce(reducer, 0);
                this.display.moveCursor({x: -redu}, {dontRollOver: true});
                break;
            }
            case 'E': {
                let redu = csi.numberList.reduce(reducer, 0);
                this.display.moveCursor({y: redu});
                this.display.setCursor({x: 0});
                break;
            }
            case 'F': {
                let redu = csi.numberList.reduce(reducer, 0);
                this.display.moveCursor({y: -redu});
                this.display.setCursor({x: 0});
                break;
            }
            case 'G': {
                let redu = csi.numberList.reduce(reducer, 0);
                this.display.setCursor({x: redu - 1});
                break;
            }
            case 'H': {                   
                let cursor = {
                    x: csi.numberList[1] ? (csi.numberList[1] - 1) : 0,
                    y: csi.numberList[0] ? (csi.numberList[0] - 1) : 0
                }
                this.display.setCursor(cursor);
                break;
            }
            case 'J': {
                // erase characters
                this.display.erase(csi.numberList.reduce(reducer, 0));
                break;
            }
            case 'K': {
                // erases lines
                let redu = csi.numberList.reduce(reducer, 0);
                this.display.eraseLine(redu);
                break;
            }
            case 'S': {
                // scroll up
                let redu = csi.numberList.reduce(reducer, 0);
                this.display.scroll(redu);
                break;
            }
            case 'T': {
                // scroll down
                let redu = csi.numberList.reduce(reducer, 0);
                this.display.scroll(-redu);
                break;
            }
            case 'L': {
                // TODO 
                // insert number of blank lines
                break;
            }
            case 'M': {
                // TODO 
                // delete indicated number of lines
                break;
            }
            case 'P': {
                // TODO 
                // delete the indicated number of characters on the line
                break;
            }
            case 'X': {
                // TODO
                // erase the indicated number of characters on the line
                // difference to P ????
                break;
            }
            case 'a': {
                // Move cursor right the indicated # of columns.
                let x = csi.numberList.reduce(reducer, 0);
                this.display.moveCursor({x});
                break;
            }
            case 'c': {
                // Answer ESC [ ? 6 c: "I am a VT102".
                break;
            }
            case 'd': {
                // d   VPA       Move cursor to the indicated row, current column.
                let y = csi.numberList.reduce(reducer, 0);
                this.display.setCursor({y: y - 1}, {noExtendX: true});
                break;
            }
            case 'e': {
                // e   VPR       Move cursor down the indicated # of rows.
                let y = csi.numberList.reduce(reducer, 0);
                this.display.moveCursor({y: y - 1}, {noExtendX: true});
                break;
            }
            case 'f': {
                // f   HVP       Move cursor to the indicated row, column.               
                let cursor = {
                    x: csi.numberList[1] ? (csi.numberList[1] - 1) : 0,
                    y: csi.numberList[0] ? (csi.numberList[0] - 1) : 0
                }
                this.display.setCursor(cursor);
                break;
            }
            case 'g': {
                /*
                g   TBC       Without parameter: clear tab stop at current position.
                 ESC [ 3 g: delete all tab stops.
                */
                break;
            }
            // q for keyboard leds, ignore for now
            case  'r': {
                // set scrolling region, parameters are top and bottom row
                this.display.scrollingRegion = {top: csi.numberList[0], bottom: csi.numberList[1]};
                break;
            }
            case 's': {
                // save cursor location
                this.storeCursor();
                break;
            }
            case 'u': {
                // restore cursor location
                this.restoreCursor();
                break;
            }
            case '`': {
                // move cursor to indicated column in current row
                let x = csi.numberList.reduce(reducer, 0);
                this.setCursor({x: x - 1});
                break;
            }
            case 'h': {
                // Set mode - no supported right now.
                //this.display.setMode(csi.numberList[0]);
                break;
            }
            case 'l': {
                //this.display.resetMode(csi.numberList[0]);
            }
            default:
                break;
        }
    }
}