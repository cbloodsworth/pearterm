import React from 'react';

import '../styles/view.css';

interface TerminalProps {
    user: string,
    dir: string,
}

const Terminal: React.FC<TerminalProps> = ({ user, dir }) => {
    return (
        <div className='window terminal'>
            {user}@portfolio: ~/{dir.toLowerCase().replace(' ','_')} $
        </div>
    );
};

export default Terminal;