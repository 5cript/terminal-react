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

    cursorify() {
        let mod = this.clone();
        mod.reverse = true;
        mod.blink = true;
        return mod;
    }
}

export default Modifier;