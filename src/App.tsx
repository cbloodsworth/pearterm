import React from 'react'
import TabList from './components/tablist'

import View from './components/view'
import './styles/view.css';

const App: React.FC = () => {
  const tabLabels = ['Main Page', 'Projects', 'Other'];
  const tabThumbnails = 'https://upload.wikimedia.org/wikipedia/commons/9/9e/UbuntuCoF.svg'

  return (
    <>
      <TabList tabLabels={tabLabels} tabThumbnails={tabThumbnails} />
      <View/>
    </>
  )
}

export default App
