import React from 'react';
import FormattedContent from './formattedContent';
import { FONT_MONO } from '../constants';
import { TerminalColors } from './terminal';

interface ContentProps {
    content: string;
    colors?: TerminalColors;
}

const TerminalContent: React.FC<ContentProps> = ({content, colors}) => {
    return (
        colors
            ? <FormattedContent colors={colors} content={content}/>
            : <span style={{ fontFamily: FONT_MONO }}>
        {content}</span>);
};

export default TerminalContent;
