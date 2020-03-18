import React from 'react';

import Display from './display';
import helpers from './helpers';
import Modifier from './modifier';

//import './terminal.css';

// resources:
// https://www.xfree86.org/current/ctlseqs.html
// https://vt100.net/docs/vt510-rm/contents.html

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
            display.toggleMode('DECPAM');
            return {i: offset + 1};
        }
        if (data[offset] === '>') {
            display.toggleMode('DECPNM');
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
        let keyDown = this.props.onKeyDown;
        if (keyDown === undefined || keyDown === null)
            keyDown = ()=>{}

        return (
            this.display.toSections(this.props.cursorVisible).map((s, i) => {
                return helpers.toSpan(i, s, this.defaultForeground, this.defaultBackground, keyDown);
            })
        )
    }

    getMode() {
        return this.display.mode;
    }

    render() {
        return (
            <div 
                tabIndex={this.props.cursorVisible ? "0" : undefined}
                className='terminalTextBox'
                onClick={(e) => {
                    console.log('hi');
                    e.stopPropagation();
                }}
                onKeyDown={(e) => {
                    this.props.onKeyDown(e);
                    e.stopPropagation();
                }}
                style={{
                    outline: 'none'
                }}
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

        this.onModeUpdate = (mode) => {
            if (props.onModeUpdate)
                props.onModeUpdate(mode);
        }

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
                if (this.props.disabled || this.props.inputOnCursor)
                    return this.props.disabledColor ? this.props.disabledColor : '#880000';
                return undefined;
            })()
        }
    }

    getMode = () => {
        return this.terminalText.getMode();
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
                    contentEditable={false}
                >
                    <TerminalData
                        ref={(databox) => {this.terminalText = databox;}}
                        index={0}
                        data={this.props.data}
                        onInput={() => {this.input.focus()}}
                        displayDimensions={this.bounds}
                        onScroll={this.onScroll}
                        cursorVisible={this.props.inputOnCursor}
                        onKeyDown={(e) => {
                            if (!this.props.inputOnCursor)
                                return;

                            //console.log(e.keyCode);

                            this.keyDownBasics(e);
                            this.onKeyDown(e);
                        }}
                        onModeUpdate={this.onModeUpdate}
                    >
                    </TerminalData>
                    <div className='terminalInputContainer' style={{
                        visibility: this.props.inputOnCursor ? 'hidden' : 'visible'
                    }}>
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