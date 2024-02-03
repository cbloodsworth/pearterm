import React from 'react';
import Terminal from './terminal'
import Page from './page'

import '../styles/view.css';

const View: React.FC = () => {
    return (
        <div className='view'>
            <Terminal user='default.user' dir='~'/>
            <Page/>
        </div>
    );
};

export default View;