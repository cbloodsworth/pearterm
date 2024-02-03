import React from 'react';
import Terminal from './terminal'
import Page from './page'

import '../styles/view.css';

interface ViewProps {
    activeTab: string
}

const View: React.FC<ViewProps> = ({activeTab}) => {
    return (
        <div className='view'>
            <Terminal user='default.user' dir={activeTab}/>
            <Page/>
        </div>
    );
};

export default View;