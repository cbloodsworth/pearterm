import React from 'react';
import { parseANSICodeStyles } from '../system/formatContentParser';

const FormattedContent: React.FC<{content: string}> = ({content}) => {
    return (parseANSICodeStyles(content));
};

export default FormattedContent;
