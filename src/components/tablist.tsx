import React from 'react';
import Tab from './tab';

interface TabListProps {
    tabLabels: string[];
    tabThumbnails: string;
    selectedTab: string;
    handleTabClick: (label: string) => void;
}

const TabList: React.FC<TabListProps> = ({ tabLabels, tabThumbnails, selectedTab, handleTabClick }) => {

    return (
        <div className='tabList'>
            {tabLabels.map((label) => (
                <Tab
                    key={label}
                    label={label}
                    thumbnail={tabThumbnails}
                    selected={label === selectedTab}
                    onClick={() => handleTabClick(label)}
                />
            ))}
        </div>
    );
};

export default TabList;