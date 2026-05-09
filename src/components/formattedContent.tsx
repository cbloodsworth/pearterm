import React from 'react';
import { parseANSICodeStyles } from '../system/formatContentParser';
import { TerminalColors } from './terminal';

const FormattedContent: React.FC<{content: string, colors: TerminalColors}> = ({content, colors}) => {
    return (parseANSICodeStyles(content, colors));
};

export default FormattedContent;
