import colorMap from '../data/colors.json';

type Style = { 
    fontWeight?: 'bold' | 'lighter'; 
    fontStyle?: 'italic'; 
    textDecoration?: 'underline';
} | Record<string, never>;

type Color = Record<string, string>;

// I really don't know if this is the best way to do it...I wish I was better with TS
const styleMap: {[key: string]: Style} = {
    'default': {},
    '1': {fontWeight: 'bold'},
    '2': {fontWeight: 'lighter'},
    '3': {fontStyle: 'italic'},
    '4': {textDecoration: 'underline'}
}

interface RawContentElement {
    content: string;
    color: Color;
    style: Style;
}

const ANSI_ESCAPE = "\\e[";
const ANSI_DELIMETER = ";";
const END_CODE = "m";

export const getColorCode = (colorCode: string | number): string | null => {
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
    else { colorCode = colorCode.toString(16); }

    // colorCode should be length 2, since only codes 00-FF are supported
    if (colorCode.length != 2) return null;

    // If colorcode isn't valid, it won't be in the map (ex. 0xRR), return null
    console.log(ANSI_ESCAPE+colorCode+END_CODE || null);
    return ANSI_ESCAPE+colorCode+END_CODE || null;
}

export const parseANSICodeStyles = (content: string): JSX.Element[] => {
    let color = colorMap.default;
    let style = styleMap.default;

    const rawElements: RawContentElement[] = [];

    let i = 0;
    while (content.length > 0 && i++ < 1000) {
        // Find next index of style code -- if one doesn't exist, break
        const codeIdx = content.indexOf(ANSI_ESCAPE);
        if (codeIdx === -1) { break; }

        // Save the content before the color escape code 
        const prevContent = content.slice(0, codeIdx);
        rawElements.push({content: prevContent, color: color, style: style})

        // Do some slicing to extract the data
        // TODO: Do some error checking.
        content = content.slice(codeIdx);
        const endCodesIdx = content.indexOf(END_CODE);
        const codes = content.slice(ANSI_ESCAPE.length, endCodesIdx).split(ANSI_DELIMETER);
        content = content.slice(endCodesIdx+END_CODE.length);

        for (let code of codes) {
            // Style code
            if (code.length === 1) {
                style = styleMap[code] || styleMap.default;
            }
            // Color code
            else if (code.length === 2) {
                code = code.toLowerCase();  // In case user is using hex
                color = colorMap[code] || colorMap.default;
            }
        }
    }

    if (i >= 900) console.log("While loop likely terminated due to endless loop");

    rawElements.push({content: content, color: color, style: style});

    return rawElements.map((rawElement) => {
                return <span style={{
                        ...rawElement.style,
                        ...rawElement.color,
                        }}>
                    {rawElement.content}
                    </span>
    });
}
