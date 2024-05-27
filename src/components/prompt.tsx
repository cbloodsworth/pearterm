import React from 'react';
import { TerminalEnvironment } from './terminal.tsx'
import '../styles/tab.css';
import FormattedContent from './formattedContent.tsx';

const Prompt: React.FC<{environment: TerminalEnvironment}> = ({environment}) => {
    return (
        <FormattedContent content={environment.termColors.serverColor+environment.user+"@"+environment.server+
                                   environment.termColors.default+": "+
                                   environment.termColors.dirColor+environment.dir+
                                   environment.termColors.default+" $ " }
        />
    );
};

export default Prompt;
