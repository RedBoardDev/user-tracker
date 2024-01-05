import React, { useState } from 'react';

const ErrorBanner = () => {
    const [showBanner] = useState(true);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                backgroundColor: 'red',
                color: 'white',
                padding: '1rem',
                textAlign: 'center',
                fontWeight: 'bold',
                zIndex: 9999,
                display: showBanner ? 'block' : 'none',
            }}
        >
            API down, please try again later.
        </div>
    );
};

export default ErrorBanner;
