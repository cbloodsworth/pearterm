import React from 'react';
import '../styles/tab.css';


interface TabProps {
    label: string;
    selected: boolean;
    thumbnail: string; // source to image
    onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, thumbnail, selected, onClick }) => {
    return (
        <div className={`tab ${selected ? 'selected' : ''}`} onClick={onClick}>
            <img className='thumbnail' src={thumbnail} />
            {label}
            <div className='closebutton'>✖</div>
        </div>
    );
};

export default Tab;