import React from 'react';
import Tab from './tab';

interface TabListProps {
    tabLabels: string[];
    tabThumbnails: string;
    pwd: string;
    changeDir: (label: string) => void;
}

const TabList: React.FC<TabListProps> = ({ tabLabels, tabThumbnails, pwd, changeDir }) => {
    return (
        <div className='tabList'>
            {tabLabels.map((label) => (
                <Tab
                    key={label}
                    label={label}
                    thumbnail={tabThumbnails}
                    isSelected={label === pwd}
                    onClick={() => changeDir(label)}
                />
            ))}
        </div>
    );
};

export default TabList;