import React, { useState } from 'react'
import TabList from './components/tablist'

import View from './components/view'
import './styles/view.css';

const App: React.FC = () => {
  const tabLabels = ['Main Page', 'Projects', 'Other'];
  const tabThumbnails = 'https://upload.wikimedia.org/wikipedia/commons/9/9e/UbuntuCoF.svg'

  const [selectedTab, setSelectedTab] = useState<string>(tabLabels[0]);
  const handleTabClick = (label: string) => {
      setSelectedTab(label);
  };

  return (
    <>
      <TabList 
        tabLabels={tabLabels} 
        tabThumbnails={tabThumbnails} 
        selectedTab={selectedTab}
        handleTabClick={handleTabClick}
      />
      <View activeTab={selectedTab}/>
    </>
  )
}

export default App
