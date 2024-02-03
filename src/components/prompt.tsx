import React from 'react';
import '../styles/tab.css';


interface PromptProps {
    prompt: string;
}

const Prompt: React.FC<PromptProps> = ({ prompt }) => {
    if (!prompt.includes('$')) {
        return <div>{prompt}</div>
    }

    const user = prompt.slice(0, prompt.indexOf(':') + 1);
    const dir = prompt.slice(prompt.indexOf(':') + 1, prompt.indexOf('$'));
    const cmd = prompt.slice(prompt.indexOf('$'))
    return (
        <>
            <span style={{ color: '#2DE02D' }}> {user} </span>
            <span style={{ color: '#6262E0' }}> {dir} </span>
            <span>{cmd}</span>
        </>
    );
};

export default Prompt;