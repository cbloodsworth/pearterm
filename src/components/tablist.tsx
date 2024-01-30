import React, { useState } from 'react';
import Tab from './tab';

interface TabListProps {
    tabLabels: string[];
    tabThumbnails: string;
}

const TabList: React.FC<TabListProps> = ({ tabLabels, tabThumbnails }) => {
    const [selectedTab, setSelectedTab] = useState<string | null>(tabLabels[0]);

    const handleTabClick = (label: string) => {
        setSelectedTab(label);
    };

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