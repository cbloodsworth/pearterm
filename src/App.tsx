import React, { useState } from 'react'
import TabList from './components/tablist'

import './styles/App.css'

const App: React.FC = () => {
  const [count, setCount] = useState(0)
  const tabLabels = ['Main Page', 'Projects', 'Other'];
  const tabThumbnails = 'https://upload.wikimedia.org/wikipedia/commons/9/9e/UbuntuCoF.svg'

  return (
    <>
      <TabList tabLabels={tabLabels} tabThumbnails={tabThumbnails} />
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
