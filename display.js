import Modifier from './modifier.js';
import Mode from './mode.js';

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

    /// Mode switches and controls.
    mode = new Mode;

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

    toSections = (cursorVisible) => {
        if (this.data.lines.length === 0)
            return [];

        let sections = [];

        let lastModifier = 0;
        let currentSection = {
            data: '',
            modifier: this.modifiers[lastModifier]
        }
        let push = (x, y, cursor) => {
            if (currentSection.modifier === undefined)
                return;    

            if (!cursor)
                sections.push({
                    data: currentSection.data,
                    modifier: currentSection.modifier.clone()
                });
            else 
                sections.push({
                    data: currentSection.data,
                    modifier: currentSection.modifier.cursorify()
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
                if (cursorVisible && x === this.cursor.x && y === this.cursor.y) {
                    push(x, y);
                    currentSection.data += this.data.lines[y][x];
                    push(x, y, true);
                }
                currentSection.data += this.data.lines[y][x];
            }
            if (cursorVisible && this.data.modifierLineIndices[y].length === 0 && y === this.cursor.y) {
                sections.push({
                    data: ' ',
                    modifier: currentSection.modifier.cursorify()
                })
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

    /**
     *  @param options Come from setCursor.
     */
    _extendLines = (options) => {
        if (options === undefined || options === null)
            options = {};

        let y = this._getLineOffset();
        while (this.data.lines.length <= y) {
            this.data.lines.push('');
            this.data.modifierLineIndices.push([]);
        }

        if (!options.noExtendX) {
            for (let i = this.cursor.x - this.data.lines[y].length; i > 0; --i) {
                this.data.lines[y] += ' ';
                //this.data.modifierLineIndices[y].push(this.currentModifierIndex);
                this.data.modifierLineIndices[y].push(0);
            }
        } else {
            if (this.cursor.x >= this.data.lines[y].length)
                this.cursor.x = this.data.lines[y].length - 1;
            if (this.cursor.x < 0)
                this.cursor.x = 0;
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

    /*
    setMode = (mode) => {
        this.mode['' + mode] = 1;
    }

    resetMode = (mode) => {
        this.mode['' + mode] = 0;
    }

    toggleMode = (mode, initWith = 1) => {
        if (this.mode['' + mode]) {
            let i = this.mode['' + mode];
            if (i === 1)
                this.mode['' + mode] = 0;
            else 
                this.mode['' + mode] = 1;
        }
        this.mode['' + mode] = initWith;
    }
    */

    /**
     * Move cursor relative to its current position.
     */
    moveCursor = (xyParam, options) => {
        if (!xyParam)
            return;

        if (options === undefined || options === null)
            options = {}

        if (xyParam.x !== undefined) {
            this.cursor.x = this.cursor.x + xyParam.x;
            if (this.cursor.x >= this.dimension.width) {
                if (options.dontRollOver)
                    this.cursor.x = this.dimension.width - 1;
                else {
                    let over = (this.cursor.x - this.dimension.width);
                    this.moveCursor({y: (over / this.dimension.width) + 1});
                    this.cursor.x = this.cursor.x % this.dimension.width;
                }
            }
        }
        if (xyParam.y !== undefined) {
            this.cursor.y = this.cursor.y + xyParam.y;
            if (this.cursor.y >= this.dimension.height) {
                if (options.dontRollOver)
                    this.cursor.y = this.dimension.height - 1;
                else {
                    this.scrollOffset += (this.dimension.height - this.cursor.y + 1);
                    this.cursor.y = this.dimension.height - 1;
                }
            }
        }
        if (this.cursor.x < 0)
            this.cursor.x = 0;
        if (this.cursor.y < 0)
            this.cursor.y = 0;
        this._extendLines(options);
    }

    /**
     * Set cursor to supplied parameters
     * @param options 
     *  Possible members:
     *      - noExtendX: if there is no data in x in the line, dont extend the line, but move to front instead.
     */
    setCursor = (xyParam, options) => {
        if (!xyParam)
            return;
        if (options === null || options === undefined)
            options = {};
        if (xyParam.x !== undefined) {
            this.cursor.x = Math.min(xyParam.x, this.dimension.width);
        }
        if (xyParam.y !== undefined) {
            this.cursor.y = Math.min(xyParam.y, this.dimension.height);
        }
        if (this.cursor.x < 0)
            this.cursor.x = 0;
        if (this.cursor.y < 0)
            this.cursor.y = 0;
        this._extendLines(options);
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
            this.data.lines[from.y] = this._strsplice(this.data.lines[from.y], x1, x2-x1);
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

    /**
     *  Returns a cursor to the very beginning of data.
     */
    beginCursor = () => {
        return {
            x: 0,
            y: 0
        }
    }


    /**
     *  Returns a cursor to the very end of data.
     */
    endCursor = () => {
        let y = this.data.modifierLineIndices.length - 1;
        return {
            x: this.data.modifierLineIndices[y].length,
            y: y
        }
    }

    /**
     *  Returns the end of the line where the cursor is at.
     */
    endOfCursorLine = () => {
        return {
            x: this.data.lines[this.cursor.y].length,
            y: this.cursor.y
        }
    }

    beginOfCursorLine = () => {
        return {
            x: 0,
            y: this.cursor.y
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

    /**
     * Erase in display.
     */
    erase = (mode) => {
        // if 0 -> erase from cursor to end of display
        // if 1 -> erase from start to cursor
        // if 2 -> erase all visible
        // if 3 -> erase all including scrollback buffer
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
                break;
            }
        }
    }

    /**
     * Scroll in display.
     * @param y if positive scroll down, if negative scroll up. Will hit 0 if scrolling to beginning.
     */
    scroll = (y) => {
        this.scrollOffset += y;
        if (this.scrollOffset < 0)
            this.scrollOffset = 0;
    }

    getCursor = () => {
        return {
            x: this.cursor.x,
            y: this.cursor.y
        };
    }

    /**
     *  Erase in current line.
     */
    eraseLine = (mode) => {
        // if 0 -> erase from cursor to end of line
        // if 1 -> erase line from start to cursor
        // if 2 -> erase whole line
        switch (mode) {
            default:
            case 0: {
                this.eraseFromTo(this.cursor, this.endOfCursorLine());
                break;
            }
            case 1: {
                this.eraseFromTo(this.beginOfCursorLine(), this.cursor);
                break;
            }
            case 2: {
                this.eraseFromTo(this.beginOfCursorLine(), this.endOfCursorLine());
                break;
            }
        }
    }
}

export default Display;