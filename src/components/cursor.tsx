import React, { useState, useEffect } from 'react';

const BlinkingCursor = () => {
    const [cursorVisible, setCursorVisible] = useState(true);
    const speed = 500; // Blinking speed in milliseconds

    useEffect(() => {
        const interval = setInterval(() => {
            setCursorVisible(prevVisible => !prevVisible);
        }, speed);

            // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [speed]);

    return (
        <span id="cursor" style={{ opacity: cursorVisible ? 1 : 0 }}>|</span>
    );
};

export default BlinkingCursor;
