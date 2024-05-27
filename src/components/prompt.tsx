import React from 'react';
import { TerminalEnvironment } from './terminal.tsx'
import '../styles/tab.css';
import FormattedContent from './formattedContent.tsx';
import { getColorCode } from '../system/formatContentParser.tsx';

const Prompt: React.FC<{environment: TerminalEnvironment}> = ({environment}) => {
    return (
        <FormattedContent content={getColorCode(40)+environment.user+"@"+environment.server+
                                   getColorCode(255)+": "+
                                   getColorCode(33)+environment.dir+
                                   getColorCode(255)+" $ " }
        />
    );
};

export default Prompt;
