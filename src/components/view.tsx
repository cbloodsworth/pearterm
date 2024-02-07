import React from 'react';
import Terminal from './terminal'
import Page from './page'

import '../styles/view.css';

interface ViewProps {
    pwd: string
    changeDir: (label: string) => void;
}

const View: React.FC<ViewProps> = ({ pwd, changeDir }) => {
    return (
        <div className='view'>
            <Terminal
                user='default.user'
                pwd={pwd}
                changeDir={changeDir}
            />
            <Page pageName={pwd} />
        </div>
    );
};

export default View;