import React from 'react';
import { TerminalColors, TerminalEnvironment } from './terminal.tsx'
import '../styles/tab.css';
import FormattedContent from './formattedContent.tsx';

const Prompt: React.FC<{environment: TerminalEnvironment, colors: TerminalColors}> = ({environment, colors}) => {
    return (
        <FormattedContent content={colors.success.formatted+environment.user+"@"+environment.server+
                                   colors.default.formatted+": "+
                                   colors.primary.formatted+environment.dir+
                                   colors.default.formatted+" $ " }
        />
    );
};

export default Prompt;
