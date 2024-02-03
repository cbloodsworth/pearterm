import React from 'react';

import '../styles/view.css';

interface TerminalProps {
    user: string,
    dir: string,
}

const Terminal: React.FC<TerminalProps> = ({ user, dir }) => {
    return (
        <div className='terminal'>
            {user} @ portfolio → {dir} $
        </div>
    );
};

export default Terminal;