import React from 'react';

import '../styles/view.css';
import FormattedContent from './formattedContent';

const Page: React.FC<{ content: string }> = ({ content }) => {
    return (
        <>
            <div className="window page">
                <FormattedContent content={content}/>
            </div>
        </>
    );
};

export default Page;