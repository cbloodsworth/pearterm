import React, { useState } from 'react';
import Terminal from './terminal'
import Page from './page'

import '../styles/view.css';

import FileSystemNode from '../system/filetree';

interface ViewProps {
    pwd: FileSystemNode;
    setPwd: (dir: FileSystemNode) => void;
    rootFS: FileSystemNode;
}

const View: React.FC<ViewProps> = ({ pwd, setPwd, rootFS }) => {
    const [viewContent, setViewContent] = useState("Welcome to pearterm! \u{1f350} \n\nMany Unix/Linux commands are supported.\n\nTry `help` for more info.");
    return (
        <div className='view'>
            <Terminal
                user='default.user'
                pwd={pwd}
                setPwd={setPwd}
                rootFS={rootFS}
                viewContent={viewContent}
                setViewContent={setViewContent}
            />
            <Page content={viewContent} />
        </div>
    );
};

export default View;
