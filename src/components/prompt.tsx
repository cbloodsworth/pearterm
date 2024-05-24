import React from 'react';
import { TerminalEnvironment } from './terminal.tsx'
import '../styles/tab.css';

const Prompt: React.FC<{environment: TerminalEnvironment}> = ({environment}) => {
    return (
        <>
            <span style={{ color: '#2DE02D' }}>{environment.user}@{environment.server}</span>
            <span >: </span>
            <span style={{ color: '#6262E0' }}>{environment.dir} </span>
            <span >$ </span>
        </>
    );
};

export default Prompt;
