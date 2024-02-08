import React, { useState } from 'react'
import TabList from './components/tablist'
import View from './components/view'

import FileSystemNode from './system/filetree';

import './styles/view.css';

const App: React.FC = () => {
  const tabDirs = ['main', 'projects', 'links'];
  const tabThumbnails = 'https://upload.wikimedia.org/wikipedia/commons/9/9e/UbuntuCoF.svg'

  const [pwd, changeDir] = useState<string>(tabDirs[0]);

  const [rootFS, modifyFS] = useState<FileSystemNode>( (): FileSystemNode => {
    let root = new FileSystemNode(null, '~', true)
    tabDirs.forEach((dir_name) => {root.addDirectory(dir_name)})
    return root;
  })

  return (
    <>
      <TabList
        tabLabels={tabDirs}
        tabThumbnails={tabThumbnails}
        pwd={pwd}
        changeDir={changeDir}
      />
      <View
        pwd={pwd}
        changeDir={changeDir}
      />
    </>
  )
}

export default App
