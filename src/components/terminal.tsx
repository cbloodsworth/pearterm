import React from 'react';
import '../styles/terminal.css';

interface TerminalProps {
    user: string,
    dir: string,
}

const Terminal: React.FC<TerminalProps> = ({ user, dir }) => {
    return (
        <div>
            {user} @ portfolio → {dir} $
        </div>
    );
};

export default Terminal;