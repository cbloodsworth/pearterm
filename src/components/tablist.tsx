import React from 'react';
import Tab from './tab';

import FileSystemNode from '../system/filetree';

interface TabListProps {
    tabLabels: string[];
    tabThumbnails: string;
    pwd: FileSystemNode;
    changeDir: (dir: FileSystemNode) => void;
}

const TabList: React.FC<TabListProps> = ({ tabLabels, tabThumbnails, pwd, changeDir }) => {
    return (
        <div className='tabList'>
            {tabLabels.map((label) => (
                <Tab
                    key={label}
                    label={label}
                    thumbnail={tabThumbnails}
                    isSelected={label === pwd.filename}
                    onClick={() => changeDir(pwd)}
                />
            ))}
        </div>
    );
};

export default TabList;