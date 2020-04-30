import React from 'react';

import Display from './display';
import helpers from './helpers';
import Modifier from './modifier';
import Parser from './parser';

//import './terminal.css';

// resources:
// https://www.xfree86.org/current/ctlseqs.html
// https://vt100.net/docs/vt510-rm/contents.html

class TerminalData extends React.Component 
{
    /**
     * Creates the display if it doesn't exist.
     */
    initialize = (initialData, displayDimensions) => {
        if (this.display === undefined || this.display === null)
            this.display = new Display(displayDimensions);

        if (this.parser === undefined || this.parser === null) {
            this.parser = new Parser(
                this.display, 
                this.warningReporter,
                this.errorReporter
            );

            if (initialData !== undefined && initialData !== null)
                this.parser.parse(initialData);
        }
    }

    constructor(props) {
        super(props);
        this.onInput = this.props.onInput ? this.props.onInput : ()=>{};

        if (this.props.defaultBackground !== undefined)
            this.defaultBackground = this.props.defaultBackground;
        else
            //this.defaultBackground = 'var(--terminal-default-background)';
            this.defaultBackground = '#303030';

        if (this.props.defaultForeground !== undefined)
            this.defaultForeground = this.props.defaultForeground;
        else
            //this.defaultForeground = 'var(--terminal-default-foreground)';
            this.defaultForeground = '#DDDDDD';

        if (this.props.warningReporter)
            this.warningReporter = this.props.warningReporter;
        else
            this.warningReporter = (w) => {console.log('TERMINAL_WARNING: ' + w)};

        if (this.props.errorReporter)
            this.errorReporter = this.props.errorReporter;
        else
            this.errorReporter = (e) => {console.error('TERMINAL_ERROR: ' + e)};
        
    }

    renderDisplay(initialData, displayDimensions) {
        this.initialize(initialData, displayDimensions);
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
                        defaultBackground={this.props.defaultBackground}
                        defaultForeground={this.props.defaultForeground}
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
                            defaultBackground={this.props.defaultBackground}
                            defaultForeground={this.props.defaultForeground}
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

export {TerminalData, Terminal};