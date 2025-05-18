import React from 'react';
import FormattedContent from './formattedContent';
import { FONT_MONO } from '../constants';

interface ContentProps {
    content: string;
    formatted: boolean;
}

const TerminalContent: React.FC<ContentProps> = ({content, formatted}) => {
    return (formatted ? <FormattedContent content={content}/> : <span style={{ fontFamily: FONT_MONO }}>{content}</span>);
};

export default TerminalContent;
