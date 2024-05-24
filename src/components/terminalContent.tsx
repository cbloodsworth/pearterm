import React from 'react';
import '../styles/tab.css';

interface ContentProps {
    content: string;
}

type Color = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'default';
type Brightness = '' | 'light';

type FontWeight = 'bold' | 'lighter';
type FontStyle = 'italic'; // Note: corrected to 'italic'
type TextDecoration = 'underline';

const colorMap: {[key: string]: { color: Color }} = {
    '0': {color: 'black'},
    '1': {color: 'red'},
    '2': {color: 'green'},
    '3': {color: 'yellow'},
    '4': {color: 'blue'},
    '5': {color: 'magenta'},
    '6': {color: 'cyan'},
    '7': {color: 'white'},
    '8': {color: 'default'},
}

const brightnessMap: {[key: string]: Brightness} = {
    '3': '',
    '9': 'light'
}

const styleMap = {
    '0': {},
    '1': {fontWeight: 'bold'},
    '2': {fontWeight: 'lighter'},
    '3': {fontStyle: 'italic'},
    '4': {textDecoration: 'underline'}
}

type something = 'fontWeight' | 'fontStyle' | 'textDecoration';

interface RawContentElement {
    content: string;
    color: {'color': string};
    style: {something: string};
}

const parseANSICodeStyles = (content: string): RawContentElement[] => {
    let color = {color: 'default'};
    let brightness = '';
    let style = {};

    const rawElements: RawContentElement[] = [];

    let i = 0;
    let prevContent = content;
    while (content.length > 0 && i++ < 1000) {
        // Find next index of style code -- if one doesn't exist, break
        const codeIdx = content.indexOf("\\e[");
        if (codeIdx === -1) { break; }

        const prevContent = content.slice(0, codeIdx);
        rawElements.push({content: prevContent, color: color, style: style})

        content = content.slice(codeIdx);
        const endCodesIdx = content.indexOf("m");
        const codes = content.slice(3, endCodesIdx).split(";");
        content = content.slice(endCodesIdx+1);

        for (const code of codes) {
            // Style code
            if (code.length === 1) {
                style = styleMap[code];
            }
            // Color code
            else if (code.length === 2) {
                brightness = brightnessMap[code[0]];
                color = colorMap[code[1]];
            }
        }
    }

    rawElements.push({content: content, color: color, style: style});

    console.log(rawElements);
    return rawElements;
}

const TerminalContent: React.FC<ContentProps> = ({content}) => {
    return (
        <>
            {parseANSICodeStyles(content).map((rawElement) => {
                return <span style={{...rawElement.color, ...rawElement.style}}>{rawElement.content}</span>
            })}
        </>
    );
};

export default TerminalContent;
