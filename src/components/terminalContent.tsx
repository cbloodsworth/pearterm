import React from 'react';
import FormattedContent from './formattedContent';

interface ContentProps {
    content: string;
    formatted: boolean;
}

const TerminalContent: React.FC<ContentProps> = ({content, formatted}) => {
    return (formatted ? <FormattedContent content={content}/> : <span>{content}</span>);
};

export default TerminalContent;
