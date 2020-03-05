import React from 'react';

//import './terminal.css';

let helpers = {
    _16color1: ["#000000", "#CD0000", "#00CD00", "#CDCD00", "#0000CD", "#CD00CD", "#00CDCD", "#E5E5E5"],
    _16color2: ["#0C0C0C", "#FF0000", "#00FF00", "#FFFF00", "#0000FF", "#FF00FF", "#00FFFF", "#FFFFFF"],
    isForeground: (num) => {
        return [39, 30, 31, 32, 33, 34, 35, 36, 37, 90, 91, 92, 93, 94, 95, 96, 97].indexOf(num) > -1
    },
    isBackground: (num) => {
        return [49, 40, 41, 42, 43, 44, 45, 46, 47, 100, 101, 102, 103, 104, 105, 106, 107].indexOf(num) > -1;
    },
    to256Color: (num, def) => {
        if (num < 0 || num > 255)
            return def;

        return ["#000000", "#800000", "#008000", "#808000", "#000080", "#800080", "#008080", "#c0c0c0", "#808080", "#ff0000",
            "#00ff00", "#ffff00", "#0000ff", "#ff00ff", "#00ffff", "#ffffff", "#000000", "#00005f", "#000087", "#0000af",
            "#0000d7", "#0000ff", "#005f00", "#005f5f", "#005f87", "#005faf", "#005fd7", "#005fff", "#008700", "#00875f",
            "#008787", "#0087af", "#0087d7", "#0087ff", "#00af00", "#00af5f", "#00af87", "#00afaf", "#00afd7", "#00afff",
            "#00d700", "#00d75f", "#00d787", "#00d7af", "#00d7d7", "#00d7ff", "#00ff00", "#00ff5f", "#00ff87", "#00ffaf",
            "#00ffd7", "#00ffff", "#5f0000", "#5f005f", "#5f0087", "#5f00af", "#5f00d7", "#5f00ff", "#5f5f00", "#5f5f5f",
            "#5f5f87", "#5f5faf", "#5f5fd7", "#5f5fff", "#5f8700", "#5f875f", "#5f8787", "#5f87af", "#5f87d7", "#5f87ff",
            "#5faf00", "#5faf5f", "#5faf87", "#5fafaf", "#5fafd7", "#5fafff", "#5fd700", "#5fd75f", "#5fd787", "#5fd7af",
            "#5fd7d7", "#5fd7ff", "#5fff00", "#5fff5f", "#5fff87", "#5fffaf", "#5fffd7", "#5fffff", "#870000", "#87005f",
            "#870087", "#8700af", "#8700d7", "#8700ff", "#875f00", "#875f5f", "#875f87", "#875faf", "#875fd7", "#875fff",
            "#878700", "#87875f", "#878787", "#8787af", "#8787d7", "#8787ff", "#87af00", "#87af5f", "#87af87", "#87afaf",
            "#87afd7", "#87afff", "#87d700", "#87d75f", "#87d787", "#87d7af", "#87d7d7", "#87d7ff", "#87ff00", "#87ff5f",
            "#87ff87", "#87ffaf", "#87ffd7", "#87ffff", "#af0000", "#af005f", "#af0087", "#af00af", "#af00d7", "#af00ff",
            "#af5f00", "#af5f5f", "#af5f87", "#af5faf", "#af5fd7", "#af5fff", "#af8700", "#af875f", "#af8787", "#af87af",
            "#af87d7", "#af87ff", "#afaf00", "#afaf5f", "#afaf87", "#afafaf", "#afafd7", "#afafff", "#afd700", "#afd75f",
            "#afd787", "#afd7af", "#afd7d7", "#afd7ff", "#afff00", "#afff5f", "#afff87", "#afffaf", "#afffd7", "#afffff",
            "#d70000", "#d7005f", "#d70087", "#d700af", "#d700d7", "#d700ff", "#d75f00", "#d75f5f", "#d75f87", "#d75faf",
            "#d75fd7", "#d75fff", "#d78700", "#d7875f", "#d78787", "#d787af", "#d787d7", "#d787ff", "#d7af00", "#d7af5f",
            "#d7af87", "#d7afaf", "#d7afd7", "#d7afff", "#d7d700", "#d7d75f", "#d7d787", "#d7d7af", "#d7d7d7", "#d7d7ff",
            "#d7ff00", "#d7ff5f", "#d7ff87", "#d7ffaf", "#d7ffd7", "#d7ffff", "#ff0000", "#ff005f", "#ff0087", "#ff00af",
            "#ff00d7", "#ff00ff", "#ff5f00", "#ff5f5f", "#ff5f87", "#ff5faf", "#ff5fd7", "#ff5fff", "#ff8700", "#ff875f",
            "#ff8787", "#ff87af", "#ff87d7", "#ff87ff", "#ffaf00", "#ffaf5f", "#ffaf87", "#ffafaf", "#ffafd7", "#ffafff",
            "#ffd700", "#ffd75f", "#ffd787", "#ffd7af", "#ffd7d7", "#ffd7ff", "#ffff00", "#ffff5f", "#ffff87", "#ffffaf",
            "#ffffd7", "#ffffff", "#080808", "#121212", "#1c1c1c", "#262626", "#303030", "#3a3a3a", "#444444", "#4e4e4e",
            "#585858", "#626262", "#6c6c6c", "#767676", "#808080", "#8a8a8a", "#949494", "#9e9e9e", "#a8a8a8", "#b2b2b2",
            "#bcbcbc", "#c6c6c6", "#d0d0d0", "#dadada", "#e4e4e4", "#eeeeee"][num];
    },
    foregroundTo16Color: (num, def) => {
        if (num === 39)
            return def;

        if (num >= 30 && num <= 37)
            return helpers._16color1[num - 30]

        if (num >= 90 && num <= 97)
            return helpers._16color2[num - 90]

        return def;
    },
    backgroundTo16Color: (num, def) => {
        if (num === 49)
            return def;

        if (num >= 40 && num <= 47)
            return helpers._16color1[num - 40]

        if (num >= 100 && num <= 107)
            return helpers._16color2[num - 100]

        return def;
    },
    toSpan: (index, mod, data, defaultForeground, defaultBackground) => {
        let fg = (def) => {
            let colStr = '';
            if (mod.foreground256 !== -1)
                colStr = helpers.to256Color(mod.foreground256, def);
            else
                colStr = helpers.foregroundTo16Color(mod.foreground, def);
            if (!mod.bold && !mod.dim)
                return colStr

            let hsl = helpers.rgbToHsl(
                parseInt(colStr.substr(1, 2), 16),
                parseInt(colStr.substr(3, 2), 16),
                parseInt(colStr.substr(5, 2), 16)
            )
            if (mod.bold) {
                hsl[1] = 0.8 * hsl[1];
                hsl[2] = Math.min(1.2 * hsl[2], 1);
                let rgb = helpers.hslToRgb(hsl[0], hsl[1], hsl[2]);
                return "#" + rgb[0].toString(16).padStart(2, '0') + rgb[1].toString(16).padStart(2, '0') + rgb[2].toString(16).padStart(2, '0')       
            }
            if (mod.dim) {
                //hsl[1] = 0.8 * hsl[1];
                hsl[2] = 0.7 * hsl[2];
                let rgb = helpers.hslToRgb(hsl[0], hsl[1], hsl[2]);
                return "#" + rgb[0].toString(16).padStart(2, '0') + rgb[1].toString(16).padStart(2, '0') + rgb[2].toString(16).padStart(2, '0')   
            }
        }

        let bg = (def) => {
            if (mod.background256 !== -1)
                return helpers.to256Color(mod.background256, def);
            else
                return helpers.backgroundTo16Color(mod.background, def);
        }

        if (mod === undefined || data === undefined)
            return <br key={index}></br>;

        return (
            <span key={index} style={{
                backgroundColor: (() => {
                    if (mod.reverse)
                        return fg(defaultForeground)
                    else
                        return bg(defaultBackground)
                })()
            }}
            >
                <span style={{
                    color: (() => {
                        if (mod.reverse)
                            return bg(defaultBackground)
                        else
                            return fg(defaultForeground)
                    })(),
                    background: 'transparent',
                    fontWeight: mod.bold ? 'bold' : undefined,
                    textDecoration: mod.underlined ? 'underline' : undefined,
                    animation: mod.blink ? 'terminalBlink 1s infinite' : undefined,
                    whiteSpace: 'pre'
                }}>{(() => {
                    if (!mod.hidden)
                        return data;
                    return '';
            })()}</span>
            </span>
        );
    },
    rgbToHsl: (r, g, b) => {
        r /= 255.;
        g /= 255.;
        b /= 255.;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
                default: break;
            }
            h /= 6;
        }

        return [h, s, l];
    },
    hslToRgb: (h, s, l) => {
        let r;
        let g;
        let b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            var hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1. / 6) return p + (q - p) * 6. * t;
                if (t < 1. / 2) return q;
                if (t < 2. / 3) return p + (q - p) * (2. / 3 - t) * 6.;
                return p;
            }

            var q = l < 0.5 ? l * (1. + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1. / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1. / 3);
        }

        return [Math.round(r * 255.), Math.round(g * 255.), Math.round(b * 255.)];
    }
}

class Modifier {
    bold = false;
    underlined = false;
    reverse = false;
    hidden = false;

    // unhandled
    dim = false;
    blink = false;

    foreground = 39;
    background = 49;

    foreground256 = -1;
    background256 = -1;

    clone() {
        let mod = new Modifier();
        mod.bold = this.bold;
        mod.underlined = this.underlined;
        mod.reverse = this.reverse;
        mod.hidden = this.hidden;
        mod.dim = this.dim;
        mod.blink = this.blink;
        mod.foreground = this.foreground;
        mod.background = this.background;
        mod.foreground256 = this.foreground256;
        mod.background256 = this.background256;
        return mod;
    }
}

class Display {
    /// Cursor position within the viewscreen
    cursor = {x: 0, y: 0};

    /// There might be data off the screen
    /// The scroll offset is in lines.
    scrollOffset = 0;

    /// Actual size of the terminal window
    dimension = {width: 1, height: 1};

    /// Current active modifier for writing with the cursor
    currentModifierIndex = 0;

    // Saved cursor
    cursorStore = {x: 0, y: 0};

    /// The ENTIRE data, including data outside the view.
    data = {
        lines: [''],
        modifierLineIndices: [[]]
    }

    mode = 0;

    /// The data modifiers that modify text appearance.
    modifiers = [new Modifier()]

    constructor(dimension) {
        this.dimension = {
            width: dimension.width + 1,
            height: dimension.height + 1
        }
    }

    warn = (msg, moreInfo) => {
        console.error(msg, moreInfo)
    }

    toSections = () => {
        if (this.data.lines.length === 0)
            return [];

        let sections = [];

        let lastModifier = 0;
        let currentSection = {
            data: '',
            modifier: this.modifiers[lastModifier]
        }
        let push = (x, y) => {
            if (currentSection.modifier === undefined)
                return;    

            sections.push({
                data: currentSection.data,
                modifier: currentSection.modifier.clone()
            });
            currentSection.data = '';
            currentSection.modifier = this.modifiers[this.data.modifierLineIndices[y][x]];
            lastModifier = this.data.modifierLineIndices[y][x];
        }
        for (let y = this.scrollOffset; y < this.data.modifierLineIndices.length; ++y) {
            for (let x = 0; x !== this.data.modifierLineIndices[y].length; ++x) {
                if (lastModifier !== this.data.modifierLineIndices[y][x]) {
                    push(x, y);
                }
                currentSection.data += this.data.lines[y][x];
            }
            if (this.data.modifierLineIndices[y].length > 0)
                push(this.data.modifierLineIndices[y].length - 1, y);
            if (y + 1 !== this.data.modifierLineIndices.length)
                sections.push({newline: true});
        }
        return sections;
    }

    _getLineOffset = () => {
        return this.scrollOffset + this.cursor.y
    }

    _extendLines = () => {
        let y = this._getLineOffset();
        while (this.data.lines.length <= y) {
            this.data.lines.push('');
            this.data.modifierLineIndices.push([]);
        }

        for (let i = this.cursor.x - this.data.lines[y].length; i > 0; --i) {
            this.data.lines[y] += ' ';
            //this.data.modifierLineIndices[y].push(this.currentModifierIndex);
            this.data.modifierLineIndices[y].push(0);
        }
    }

    _insertInArr = (arr, data) => {
        let y = this.cursor.y + this.scrollOffset;
        if (this.cursor.x < arr[y].length - 1)
            arr[y] = arr[y].slice(0, this.cursor.x).concat([data], arr[y].slice(this.cursor.x));
        else if (this.cursor.x === 0)
            arr[y].unshift(data);
        else
            arr[y].push(data);
    }

    _insertInStr = (arr, data) => {
        let y = this.cursor.y + this.scrollOffset;
        if (this.cursor.x < arr[y].length - 1)
            arr[y] = [arr[y].slice(0, this.cursor.x), data, arr[y].slice(this.cursor.x)].join('');
        else if (this.cursor.x === 0)
            arr[y] = data + arr[y];
        else
            arr[y] += data;
    }

    _insertInLine = (data) => {
        this._insertInStr(this.data.lines, data);
    }

    _insertInModifier = () => {
        this._insertInArr(this.data.modifierLineIndices, this.currentModifierIndex);
    }

    _insert = (data) => {
        this._insertInLine(data);
        this._insertInModifier();
    }

    setMode = (mode) => {
        this.mode += mode;
    }

    resetMode = (mode) => {
        this.mode -= mode;
    }

    /**
     * Move cursor relative to its current position.
     */
    moveCursor = (xyParam) => {
        if (!xyParam)
            return;
        if (xyParam.x !== undefined) {
            this.cursor.x = this.cursor.x + xyParam.x;
            if (this.cursor.x >= this.dimension.width) {
                let over = (this.cursor.x - this.dimension.width);
                this.moveCursor({y: (over / this.dimension.width) + 1});
                this.cursor.x = this.cursor.x % this.dimension.width;
            }
        }
        if (xyParam.y !== undefined) {
            this.cursor.y = this.cursor.y + xyParam.y;
            if (this.cursor.y >= this.dimension.height) {
                this.scrollOffset += (this.dimension.height - this.cursor.y + 1);
                this.cursor.y = this.dimension.height - 1;
            }
        }
        this._extendLines();
    }

    /**
     * Set cursor to supplied parameters
     */
    setCursor = (xyParam) => {
        if (!xyParam)
            return;
        if (xyParam.x !== undefined) {
            this.cursor.x = Math.min(xyParam.x, this.dimension.width);
        }
        if (xyParam.y !== undefined) {
            this.cursor.y = Math.min(xyParam.y, this.dimension.height);
        }
        this._extendLines();
    }

    putChar = (c) => {
        if (c === '\n') {
            this.moveCursor({y: 1});
            this.setCursor({x: 0});
            return;
        }

        if (this.cursor.x === this.dimension.width - 1) {
            this.moveCursor({y: 1});
            this.setCursor({x: 0});
        }

        this._insert(c);
        this.moveCursor({x: 1});
    }

    changeModifier = (modifier) => {
        this.modifiers.push(modifier.clone());
        this.currentModifierIndex = this.modifiers.length - 1;
    }

    setKeypadMode = (keypadMode) => {
        this.keypadMode = keypadMode;
    }

    _strsplice = (str, index, count, add) => {
        if (index < 0) {
            index = str.length + index;
            if (index < 0) {
                index = 0;
            }
        }

        return str.slice(0, index) + (add || "") + str.slice(index + count);
    }

    eraseFromTo = (from, to) => {
        from.y += this.scrollOffset;
        to.y += this.scrollOffset;

        if (from.x === to.x && from.y === to.y)
            return;

        if (Math.max(from.y, to.y) >= this.data.modifierLineIndices.length) {
            this.warn('tried to erase outside of terminal range', {from, to});
            return;
        }
        if (Math.min(from.y, to.y) < 0) {
            this.warn('tried to erase outside of terminal range', {from, to});
            return;
        }

        let deltaY = to.y - from.y;
        if (deltaY === 0) {
            let x1 = Math.min(from.x, to.x);
            let x2 = Math.max(from.x, to.x);

            if (x1 < 0 || x2 < 0) {
                this.warn('tried to erase outside of terminal range', {from, to});
                return;
            }
            this.data.modifierLineIndices[from.y].splice(x1, x2-x1);
            this.data.lines[from.y].splice(x1, x2-x1);
            return;
        } 

        if (deltaY > 1) {
            // remove all lines inbetween.
            let y = from.y;
            this.data.modifierLineIndices.splice(y + 1, deltaY - 1);
            this.data.lines.splice(y + 1, deltaY - 1);
        }

        // when i end up here, there are 2 lines that need cutting end (first line) and front (last line)
        let toInFirstLine = this.data.modifierLineIndices[from.y].length - from.x;
        this.data.modifierLineIndices[from.y].splice(from.x, toInFirstLine);
        this.data.modifierLineIndices[to.y - deltaY + 1].splice(0, to.x);
        this.data.lines[from.y] = this._strsplice(this.data.lines[from.y], from.x, toInFirstLine);
        this.data.lines[to.y - deltaY + 1] = this._strsplice(this.data.lines[to.y - deltaY + 1], 0, to.x);
    }

    beginCursor = () => {
        return {
            x: 0,
            y: 0
        }
    }

    endCursor = () => {
        let y = this.scrollOffset + this.data.modifierLineIndices.length - 1
        return {
            x: this.data.modifierLineIndices[y].length,
            y: y
        }
    }

    clear = (scrollBuffer) => {
        if (!scrollBuffer)
            this.eraseFromTo(this.beginCursor(), this.endCursor());
        else {
            this.data.modifierLineIndices = [[]];
            this.data.lines = [''];
            this.scrollOffset = 0;
        }
    }

    storeCursor = () => {
        this.cursorStore = this.cursor;
    }

    restoreCursor = () => {
        this.setCursor(this.cursorStore);
    }

    // if 0 -> erase from cursor to end of display
    // if 1 -> erase from start to cursor
    // if 2 -> erase all visible
    // if 3 -> erase all including scrollback buffer
    erase = (mode) => {
        switch (mode) {
            default:
            case 0: {
                this.eraseFromTo(this.cursor, this.endCursor());
                break;
            }
            case 1: {
                this.eraseFromTo(this.beginCursor(), this.cursor);
                break;
            }
            case 2: {
                this.clear(false);
                break;
            }
            case 3: {
                this.clear(true);
            }
        }
    }
}

class TerminalData extends React.Component {
    analyzeEscapeSequence = (display, data, offset) => {
        let checkBounds = (j) => {
            return offset + j < data.length;
        } 

        if (!checkBounds(0))
            return {i: offset};
        
        // Set codeset
        if (data[offset] === '(') {
            if (!checkBounds(1))
                return {i: offset};
            
            //ctx.codeSet = data[offset + 1];
            return {i: offset + 2};
        }
        if (data[offset] === ')') {
            if (!checkBounds(1))
                return {i: offset};
            
            //ctx.codeSet = data[offset + 1];
            return {i: offset + 2};
        }
        if (data[offset] === '=') {
            display.setKeypadMode(true);
            return {i: offset + 1};
        }
        if (data[offset] === '[') {
            // CSI
            if (!checkBounds(1))
                return {i: offset};

            let hasQuestionmark = data[offset + 1] === '?';

            let numberList = [];
            let num = 0;
            let accumNum = 0;

            let pushNum = () => {
                if (accumNum === 0)
                    return;

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

            for (let i = offset + 1 + (hasQuestionmark ? 1 : 0); i !== data.length; ++i) {
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
                        i: i + 1,
                        csi: {
                            numberList: numberList,
                            hasQuestionmark: hasQuestionmark,
                            mode: data[i]
                        }
                    }
                }
            }
        }

        return {i: offset}
    }

    parse = (data, displayDimensions) => {
        let display = new Display(displayDimensions);

        let applyCsi = (csi) => {
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

                    display.changeModifier(modus);
                    break;
                } 
                case '@': {
                    let redu = csi.numberList.reduce(reducer, 0);
                    for (let i = 0; i !== redu; ++i)
                        display.putChar(' ');
                    break;
                }
                case 'A': {
                    // TODO Box checking
                    let redu = csi.numberList.reduce(reducer, 0);
                    display.moveCursor({y: -redu});
                    break;
                }
                case 'B': {
                    // TODO Box checking
                    let redu = csi.numberList.reduce(reducer, 0);
                    display.moveCursor({y: redu});
                    break;
                }
                case 'C': {
                    // TODO Box checking
                    let redu = csi.numberList.reduce(reducer, 0);
                    display.moveCursor({x: redu});
                    break;
                }
                case 'D': {
                    // TODO Box checking
                    let redu = csi.numberList.reduce(reducer, 0);
                    display.moveCursor({x: -redu});
                    break;
                }
                case 'E': {
                    // TODO Box checking
                    let redu = csi.numberList.reduce(reducer, 0);
                    display.moveCursor({y: redu});
                    display.setCursor({x: 0});
                    break;
                }
                case 'F': {
                    // TODO Box checking
                    let redu = csi.numberList.reduce(reducer, 0);
                    display.moveCursor({y: -redu});
                    display.setCursor({x: 0});
                    break;
                }
                case 'G': {
                    // TODO Box checking
                    let redu = csi.numberList.reduce(reducer, 0);
                    display.setCursor({x: redu});
                    break;
                }
                case 'H': {
                    // TODO Box checking                        
                    let cursor = {
                        x: csi.numberList[1] ? csi.numberList[1] : 0,
                        y: csi.numberList[0] ? csi.numberList[0] : 0
                    }
                    display.setCursor(cursor);
                    break;
                }
                case 'J': {
                    // erase characters
                    display.erase(csi.numberList.reduce(reducer, 0));
                    break;
                }
                case 'K': {
                    // TODO!
                    // erases lines
                    //let redu = csi.numberList.reduce(reducer, 0);
                    // if 0 -> erase from cursor to end of line
                    // if 1 -> erase line from start to cursor
                    // if 2 -> erase whole line
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
                    display.moveCursor({x});
                    break;
                }
                case 'c': {
                    // Answer ESC [ ? 6 c: "I am a VT102".
                    break;
                }
                case 'd': {
                    // d   VPA       Move cursor to the indicated row, current column.
                    let y = csi.numberList.reduce(reducer, 0);
                    display.setCursor({y: y});
                    break;
                }
                case 'e': {
                    // e   VPR       Move cursor down the indicated # of rows.
                    let y = csi.numberList.reduce(reducer, 0);
                    display.moveCursor({y: y});
                    break;
                }
                case 'f': {
                    // f   HVP       Move cursor to the indicated row, column.               
                    let cursor = {
                        x: csi.numberList[1] ? csi.numberList[1] : 0,
                        y: csi.numberList[0] ? csi.numberList[0] : 0
                    }
                    display.setCursor(cursor);
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
                    display.scrollingRegion = {top: csi.numberList[0], bottom: csi.numberList[1]};
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
                    this.setCursor({x});
                    break;
                }
                case 'h': {
                    // Set mode - no supported right now.
                    display.setMode(csi.numberList[0]);
                    break;
                }
                case 'l': {
                    display.resetMode(csi.numberList[0]);
                }
                default:
                    break;
            }
        }

        for (let i = 0; i !== data.length; ++i) {
            let code  = data.charCodeAt(i);
            if (code === 0x1B) {
                // other control sequences
                let res = this.analyzeEscapeSequence(display, data, i+1, display.cursor);

                if (res.csi) {
                    applyCsi(res.csi);
                }

                // there was an understood sequence, can continue parse
                if (res.i !== i) {
                    i = res.i - 1;
                    continue;
                }
            } else if (code < 32 && code != '\n'.charCodeAt(0)) {
                // control characters with special purpose
            } else {
                display.putChar(data[i]);
            }
        }
        return display;
    }

    constructor(props) {
        super(props);
        this.onInput = this.props.onInput ? this.props.onInput : ()=>{};
        if (this.props.defaultBackground)
            this.defaultBackground = this.props.defaultBackground;
        else
            this.defaultBackground = 'var(--terminal-default-background)';
        if (this.props.defaultForeground)
            this.defaultForeground = this.props.defaultForeground;
        else
            this.defaultForeground = 'var(--terminal-default-foreground)';
    }

    renderDisplay(data, displayDimensions) {
        this.display = this.parse(data, displayDimensions);

        /*
        return (
            this.display.sections.map((s, i) => {
                return helpers.toSpan(i, s.mod, s.data, this.defaultForeground, this.defaultBackground);
            })
        )
        */
        return (
            this.display.toSections().map((s, i) => {
                return helpers.toSpan(i, s.modifier, s.data, this.defaultForeground, this.defaultBackground);
            })
        )
    }

    render() {
        return (
            <div 
                className='terminalTextBox'
                onClick={(e) => {e.stopPropagation();}}
            >
                {this.renderDisplay(this.props.data, this.props.displayDimensions)}
            </div>
        )
    }
}

/**
 * props are:
 *  - font, example: {size: 12, family: 'Consolas'}
 *  - onSubmit: A function called with (ps1, text)
 *      example: () => {this.setState({data: this.state.data + ps1 + ' ' + dat + "\n"})}
 *  -data: The terminal is fully controlled. data is supplied from outside.
 */
class Terminal extends React.Component {
    constructor(props) {
        super(props);
        this.font = props.font;
        if (!this.font)
            this.font = {}
        if (!this.font.size)
            this.font.size = 'var(--terminal-font-size)';
        if (!this.font.family)
            this.font.family = "Consolas";
        if (props.historyMax)
            this.historyMax = 500;
        if (props.showLineNumbers === true)
            this.showLineNumbers = true;
        else
            this.showLineNumbers = false;

        if (this.props.bounds)
            this.bounds = this.props.bounds;
        else {
            this.bounds = {
                height: props.size.height ? (props.size.height / this.font.size) : (120), 
                width: props.size.width / (this.font.size * 2 / 3)
            };
        }

        this.history = [];
        this.historyOffset = 0;
        this.perservedCurrent = '';

        this.onSubmit = (ps1, text) => {
            this.history.push(text);
            if (this.history.length > this.historyMax)
                this.history.shift();

            if (props.onSubmit)
           
            props.onSubmit(ps1, text);
        }

        this.onKeyDown = (e) => {
            if (props.onKeyDown)
                props.onKeyDown(e);
        }

        this.onTab = (text) => {
            if (props.onTab)
                props.onTab(text);
        }
    }
    
    componentDidMount() {
        this.input.focus();
    }

    style = () => {
        return {
            background: (() => {
                if (this.props.disabled || this.props.indicator)
                    return this.props.disabledColor ? this.props.disabledColor : '#880000';
                return undefined;
            })()
        }
    }

    commandline = () => {
        return this.input.value;
    }

    setCommandline = (text) => {
        this.input.value = text;
    }

    focus = () => {
        this.input.focus();
    }

    historyUp = () => {
        if (this.history.length - this.historyOffset <= 0)
            return;
            
        if (this.historyOffset === 0 && this.input.value.length > 0)
            this.perservedCurrent = this.input.value;

        this.input.value = this.history[this.history.length - this.historyOffset - 1];
        ++this.historyOffset;
    }

    historyDown = () => {
        if (this.historyOffset === 0) {
            this.input.value = this.perservedCurrent;
            return;
        }

        --this.historyOffset;
        this.input.value = this.history[this.history.length - this.historyOffset - 1];
    }

    ctrl_C = () => {
        if (this.historyOffset !== 0) {
            this.historyOffset = 0;
        }
        if (this.input.value.length > 0)
            this.input.value = '';
    }

    keyDownBasics = (e) => {
        if (e.keyCode === 9) {   
            e.preventDefault();
            return;
        }
        if (e.keyCode === 38) {
            // up arrow
            this.historyUp();
            e.preventDefault();
            return;
        }
        if (e.keyCode === 40) {
            // down arrow
            this.historyDown();
            e.preventDefault();
            return;
        }
        if (e.keyCode === 67 && e.ctrlKey) {
            console.log('abort');
            this.ctrl_C();
            return;
        }
    }

    onScroll = (e) => {
        console.log('scroll')
    }

    render = () => {
        return (
            <div className='terminalContainer'>
                <div 
                    className='terminalLineNumbers'
                    style={{ 
                        fontFamily: this.font.family, 
                        fontSize: this.font.size, 
                        visibility: this.showLineNumbers ? 'visible' : 'hidden',
                        width: this.showLineNumbers ? 30 : 0
                    }}
                >
                    {(() => {
                        if (!this.showLineNumbers)
                            return <></>;

                        let count = 0;
                        let res = [];
                        /*
                        for (let i = 0; i != this.props.data.length; ++i) {
                            if (this.props.data[i] === '\n') {
                                ++count;
                                res.push(count);
                            }
                        }
                        */
                        for (let i = 0; i != this.bounds.height; ++i)
                            res.push(i + 1);

                        if (res.length === 0)
                            return <></>;

                        return res.map((elem) => {
                            return (
                                <div key={elem}>
                                    {elem}
                                </div>
                            )
                        });
                    })()}
                </div>
                <div 
                    className='terminalFrame' 
                    style={{ fontFamily: this.font.family, fontSize: this.font.size }}
                    onClick={() => {this.input.focus()}}
                >
                    <TerminalData
                        data={this.props.data}
                        onInput={() => {this.input.focus()}}
                        displayDimensions={this.bounds}
                        onScroll={this.onScroll}
                    >
                    </TerminalData>
                    <div className='terminalInputContainer'>
                        <div className='terminalPs1'>
                            <TerminalData 
                                data={this.props.PS1 ? this.props.PS1 : '>'}
                                displayDimensions={{width: (this.props.PS1 ? this.props.PS1 : '>').length + 1, height: 1}}
                            />
                        </div>
                        <input 
                            ref={(input) => { this.input = input; }} 
                            type='text' 
                            className='terminalInput'
                            disabled={this.props.disabled ? this.props.disabled : false}
                            style={this.style()}
                            onKeyDown={(e) => {
                                this.keyDownBasics(e);
                                this.onKeyDown(e);
                            }}
                            onKeyUp={(e) => {
                                if (e.keyCode === 13 && this.input.value.length > 0) {
                                    let ps1 = (this.props.PS1 ? this.props.PS1 : '>');
                                    this.onSubmit(ps1, this.input.value);
                                    this.input.value = '';
                                } else if (e.keyCode === 9) {
                                    this.onTab(this.input.value);
                                }
                            }}
                        >
                        </input>
                    </div>
                </div>
            </div>
        )
    }
}

export default Terminal;