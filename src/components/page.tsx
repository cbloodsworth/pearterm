import React, {useState} from 'react';

import '../styles/view.css';

const Page: React.FC = () => {
    const [count, setCount] = useState(0)
    return (
        <>
            <div className="page">
            <button onClick={() => setCount((count) => count + 1)}>
                count is {count}
            </button>
            <p>
                Edit <code>src/App.tsx</code> and save to test HMR
            </p>
            </div>
        </>
    );
};

export default Page;