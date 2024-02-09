import React from 'react';
import '../styles/tab.css';


interface PromptProps {
    server: string;
    user: string;
    pwd: string;
}

const Prompt: React.FC<PromptProps> = ({ server, user, pwd}) => {
    return (
        <>
            <span style={{ color: '#2DE02D' }}> {user}@{server} </span>
            <span style={{ color: '#6262E0' }}> {pwd} </span>
        </>
    );
};

export default Prompt;