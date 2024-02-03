import React from 'react';
import Terminal from './terminal'
import Page from './page'

import '../styles/view.css';

interface ViewProps {
    activeTab: string
    setActiveTab: (label: string) => void;
}

const View: React.FC<ViewProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className='view'>
            <Terminal
                user='default.user'
                dir={activeTab}
                changeDir={setActiveTab}
            />
            <Page pageName={activeTab} />
        </div>
    );
};

export default View;