import React from 'react';
import Terminal from './terminal'
import Page from './page'

import '../styles/view.css';

import FileSystemNode from '../system/filetree';

interface ViewProps {
    pwd: FileSystemNode;
    changeDir: (dir: FileSystemNode) => void;
    rootFS: FileSystemNode;
}

const View: React.FC<ViewProps> = ({ pwd, changeDir, rootFS }) => {
    return (
        <div className='view'>
            <Terminal
                user='default.user'
                pwd={pwd}
                changeDir={changeDir}
                rootFS={rootFS}
            />
            <Page pageName={pwd.filename} />
        </div>
    );
};

export default View;