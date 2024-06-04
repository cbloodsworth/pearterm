import { colorMap } from '../../data/colors';

type Style = { 
    fontWeight?: 'bold' | 'lighter'; 
    fontStyle?: 'italic'; 
    textDecoration?: 'underline' | 'line-through';
} | Record<string, never>;

type Color = Record<'color', string> | Record<string, never>;
type Font = Record<'fontFamily', string>;

export interface FormattedColor {
    ansiCode: number;
    formatted: string;
    htmlCode: string;
    r: number;
    g: number;
    b: number;
}

const fontMap: {[key: string]: Font} = {
    'default': { fontFamily: 'JetBrainsMono' },
    '0': { fontFamily: 'JetBrainsMono' },
    '1': { fontFamily: 'Arial' }
}

// I really don't know if this is the best way to do it...I wish I was better with TS
const styleMap: {[key: string]: Style} = {
    'default': {},
    'bold': {fontWeight: 'bold'},
    'lighter': {fontWeight: 'lighter'},
    'italic': {fontStyle: 'italic'},
    'underline': {textDecoration: 'underline'},
    'strikethrough': {textDecoration: 'line-through'}
}

interface RawContentElement {
    content: string;
    color: Color;
    style: Style;
    font: Font;
}

const ANSI_ESCAPE = "\\e[";
const ANSI_DELIMETER = ";";
const END_CODE = "m";

const convertToHex = (colorCode: string | number): string | null => {
    // Is it a string? Could be hex or decimal in that case
    if (typeof colorCode === 'string') {
        // Same deal here, but with 0x
        if (colorCode.startsWith("0x")) colorCode.slice(2);
        // In this case, it's decimal - slice the 0d off, convert to hex
        else if (colorCode.startsWith("0d")) {
            colorCode.slice(2);
            colorCode = parseInt(colorCode).toString(16);
        }
    }
    // Must be number, then, which is in decimal
    else { 
        colorCode = colorCode.toString(16); 
        while (colorCode.length < 2) {
            colorCode = "0" + colorCode;
        }
    }

    // colorCode should be length 2, since only codes 00-FF are supported
    if (colorCode.length != 2) return null;

    return colorCode;
}

/**
 * Factory method to create FormattedColors.
 * HTML color code to FormattedColor object.
 * @param colorCode Color code in the format (example) #FFFFFF or FFFFFF.
 * @returns FormattedColor object.
 */
export const htmlToColor = (colorCode: string): FormattedColor | null => {
    // Extract unimportant stuff out
    if (colorCode.startsWith("#")) colorCode = colorCode.slice(1);
    else if (colorCode.startsWith("0x")) colorCode = colorCode.slice(2);

    // Verify correctness
    if (colorCode.length !== 6) return null;
    if (!colorCode.match(/([\d]|[A-Fa-f]){6}/)) return null;

    const r = Number("0x"+colorCode.slice(0,2));
    const g = Number("0x"+colorCode.slice(2,4));
    const b = Number("0x"+colorCode.slice(4,6));

    return {
        htmlCode: "#"+colorCode,
        ansiCode: -1,
        r: r,
        g: g,
        b: b,
        formatted: `${ANSI_ESCAPE}38;2;${r};${g};${b}${END_CODE}`
    }
}

/**
 * Factory method to create FormattedColors.
 * ANSI color code to FormattedColor object.
 * @param ansiCode Color code in the range 0-255.
 * @returns FormattedColor object.
 */
export const ansiToColor = (ansiCode: number): FormattedColor | null => {
    // If colorcode isn't valid, it won't be in the map (ex. 0xRR), return null
    const htmlCode: string = colorMap[ansiCode].color;
    if (htmlCode === undefined) return null;
    return {
        htmlCode: htmlCode,
        ansiCode: ansiCode,
        r: Number("0x"+htmlCode.slice(1,3)),
        g: Number("0x"+htmlCode.slice(3,5)),
        b: Number("0x"+htmlCode.slice(5,7)),
        formatted: ANSI_ESCAPE+"38;5;"+ansiCode+END_CODE
    }
}

/**
 * Determines if a string is a valid integer of range 0-255.
 * @param input String that may or may not be a valid integer of range 0-255.
 * @returns Whether or not that string, when casted to a number, is both valid and in range 0-255.
 */
const isValidByte = (input: string): boolean => {
    const num = Number(input);
    return (Number.isInteger(num)) && (num >= 0) && (num <= 255);
}

/**
 * Converts decimal to hex in a format this library expects. Internal use only
 * @param decimal Decimal value as a string, expected 0-255
 * @returns Hex value in format "4a" for instance. Pads zeroes so "11" maps to "0b"
 */
const stringDecToHex = (decimal: string): string | null => {
    if (!isValidByte(decimal)) return null;
    const hex = parseInt(decimal).toString(16);
    return (hex.length == 1) 
        ? "0"+hex
        : hex;
}

/**
 * Parses a string that may contain ANSI escape codes into JSX elements.
 * @param content Raw content that may contain ANSI escape codes (i.e. \e[<0..255>;<0..255>..<0..255>m)
 * @returns An array of JSX spans with the proper color, styling, etc.
 */
export const parseANSICodeStyles = (content: string): JSX.Element[] => {
    let color = colorMap.default;
    let style = styleMap.default;
    let font = fontMap.default;

    const rawElements: RawContentElement[] = [];

    let i = 0;
    while (content.length > 0 && i++ < 1000) {
        // Find next index of style code -- if one doesn't exist, break
        const codeIdx = content.indexOf(ANSI_ESCAPE);
        if (codeIdx === -1) { break; }

        // Save the content before the color escape code 
        const prevContent = content.slice(0, codeIdx);
        rawElements.push({content: prevContent, color: color, style: style, font: font})

        // Do some slicing to extract the data
        // TODO: Do some error checking.
        content = content.slice(codeIdx);
        const endCodesIdx = content.indexOf(END_CODE);
        const codes = content.slice(ANSI_ESCAPE.length, endCodesIdx).split(ANSI_DELIMETER);
        content = content.slice(endCodesIdx+END_CODE.length);

        if (!codes.every(isValidByte)) continue;

        // SGR (Select Graphic Rendition) parameters
        for (let i = 0; i < codes.length; i++) {
            const code = Number(codes[i]);
            switch (code) {
                // Reset or normal
                case 0: { color = colorMap.default; style = styleMap.default; break; }
                // Bold or increased intensity
                case 1: { style = styleMap.bold; break; }
                // Faint, decreased intensity
                case 2: { style = styleMap.lighter; break; }
                // Italic
                case 3: { style = styleMap.italic; break; }
                // Underline
                case 4: { style = styleMap.underline; break; }
                // Crossed-out / strikethrough
                case 9: { style = styleMap.strikethrough; break; }
                // Primary / default font
                case 10: { font = fontMap.default; break; }
                // Alternative font n-10
                case 11: case 12: case 13: case 14: 
                case 15: case 16: case 17: case 18: 
                case 19: { font = fontMap[code % 10]; break;}
                //// Set foreground color
                // Basic cases
                case 30: case 31: case 32: case 33:
                case 34: case 35: case 36: case 37: { color = colorMap[code % 10]; break;}
                // Next arguments must be 5;n or 2;r;g;b
                case 38: {
                    // Checks if there are enough arguments ahead (2, at minimum)
                    if (i >= codes.length - 2) { continue; }
                    // 5;n
                    if (codes[i+1] === '5') { 
                        color = colorMap[codes[i+2]]; 
                        i += 2;
                    }
                    // 2;r;g;b
                    else if (codes[i+1] === '2') {
                        // Must have space for 4 more byte values. (2,r,g,b)
                        if (i >= codes.length - 4) { continue; }
                        const r = stringDecToHex(codes[i+2]);
                        const g = stringDecToHex(codes[i+3]);
                        const b = stringDecToHex(codes[i+4]);
                        color = {color: "#"+r+g+b};
                        i += 4;
                    }
                    else { continue; }
                    break;
                }
            }
        }
    }

    if (i >= 900) console.log("While loop likely terminated due to endless loop");

    rawElements.push({content: content, color: color, style: style, font: font});

    return rawElements.map((rawElement) => {
                return <span 
                    style={{
                        ...rawElement.style,
                        ...rawElement.color,
                        ...rawElement.font,
                        }}>
                    {rawElement.content}
                    </span>
    });
}
