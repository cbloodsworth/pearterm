import React from 'react';

import '../styles/view.css';
import FormattedContent from './formattedContent';
import { themes } from '../../data/themes';
import { CONSTANTS } from '../../data/constants';

const Page: React.FC<{ content: string }> = ({ content }) => {
    return (
        <>
            <div className="window page">
                <FormattedContent content={content} colors={themes[CONSTANTS.DEFAULT_THEME]}/>
            </div>
        </>
    );
};

export default Page;