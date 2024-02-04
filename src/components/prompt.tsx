import React from 'react';
import '../styles/tab.css';


interface PromptProps {
    prompt: string;
}

const Prompt: React.FC<PromptProps> = ({ prompt }) => {
    if (prompt.includes('[list.directory]')) {
        // Special coloring if we did ls (very bad TODO CHANGE)
        return <div style={{ color: '#6262E0' }}>{prompt.slice('[list.directory]'.length)}</div>
    }
    else if (!prompt.includes('$')) {
        return <div>{prompt}</div>
    }

    let colonIndex = prompt.indexOf(':');
    let shellIndex = prompt.indexOf('$');
    const user = prompt.slice(0, colonIndex + 1);
    const dir = prompt.slice(colonIndex + 2, shellIndex);
    const cmd = prompt.slice(shellIndex)
    return (
        <>
            <span style={{ color: '#2DE02D' }}> {user} </span>
            <span style={{ color: '#6262E0' }}> ~/{dir} </span>
            <span>{cmd}</span>
        </>
    );
};

export default Prompt;