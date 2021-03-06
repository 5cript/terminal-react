import React from 'react';

let Helpers = {
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
            return Helpers._16color1[num - 30]

        if (num >= 90 && num <= 97)
            return Helpers._16color2[num - 90]

        return def;
    },
    backgroundTo16Color: (num, def) => {
        if (num === 49)
            return def;

        if (num >= 40 && num <= 47)
            return Helpers._16color1[num - 40]

        if (num >= 100 && num <= 107)
            return Helpers._16color2[num - 100]

        return def;
    },
    toSpan: (index, section, defaultForeground, defaultBackground, keyDown) => {
        let data = section.data;
        let mod = section.modifier;

        let fg = (def) => {
            let colStr = '';
            if (mod.foreground256 !== -1)
                colStr = Helpers.to256Color(mod.foreground256, def);
            else
                colStr = Helpers.foregroundTo16Color(mod.foreground, def);
            if (!mod.bold && !mod.dim)
                return colStr

            let hsl = Helpers.rgbToHsl(
                parseInt(colStr.substr(1, 2), 16),
                parseInt(colStr.substr(3, 2), 16),
                parseInt(colStr.substr(5, 2), 16)
            )
            if (mod.bold) {
                hsl[1] = 0.8 * hsl[1];
                hsl[2] = Math.min(1.2 * hsl[2], 1);
                let rgb = Helpers.hslToRgb(hsl[0], hsl[1], hsl[2]);
                return "#" + rgb[0].toString(16).padStart(2, '0') + rgb[1].toString(16).padStart(2, '0') + rgb[2].toString(16).padStart(2, '0')       
            }
            if (mod.dim) {
                //hsl[1] = 0.8 * hsl[1];
                hsl[2] = 0.7 * hsl[2];
                let rgb = Helpers.hslToRgb(hsl[0], hsl[1], hsl[2]);
                return "#" + rgb[0].toString(16).padStart(2, '0') + rgb[1].toString(16).padStart(2, '0') + rgb[2].toString(16).padStart(2, '0')   
            }
        }

        let bg = (def) => {
            if (mod.background256 !== -1)
                return Helpers.to256Color(mod.background256, def);
            else
                return Helpers.backgroundTo16Color(mod.background, def);
        }

        if (mod === undefined || data === undefined)
            return <br key={index}></br>;

        if (section.cursor === true) {
            return (
                <input key={index} style={{
                    backgroundColor: (() => {
                        if (mod.reverse)
                            return fg(defaultForeground)
                        else
                            return bg(defaultBackground)
                    })()
                }}></input>
            )
        }

        return (
            <span 
                key={index} 
                style={{
                backgroundColor: (() => {
                    if (mod.reverse)
                        return fg(defaultForeground)
                    else
                        return bg(defaultBackground)
                })()}}
                /*contentEditable={true}*/
                onKeyDown={(e) => {
                    keyDown(e);
                    e.preventDefault();
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

export default Helpers;