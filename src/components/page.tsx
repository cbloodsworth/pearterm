import React from 'react';

import '../styles/view.css';

interface PageProps {
    pageName: string;
}

const Page: React.FC<PageProps> = ({ pageName }) => {
    return (
        <>
            <div className="window page">
                Welcome to {pageName}!
            </div>
        </>
    );
};

export default Page;