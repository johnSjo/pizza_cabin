import React from 'react';

const Time = (props) => {
    const time = props.date.toLocaleTimeString('en-US');

    return (
        <div>
            {time}
        </div>
    );
};

export default Time;
