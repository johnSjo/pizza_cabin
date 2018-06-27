import React from 'react';

const EmployeeSelector = (props) => {
    const minTeam = parseInt(props.minTeam, 10);
    const buttons = Array(props.teamSize).fill(null).map((na, index) => {
        const value = index + 1;

        return (
            <div key={index} className='radioButton'>
                <label>
                    <input type='radio' value={value}
                        checked={minTeam === value}
                        onChange={props.handleOptionChange}
                    />
                    <div>{value}</div>
                </label>
            </div>
        );
    });

    return (
        <form>
            Minimum number of employees required for meeting:
            <div className='radioButtons'>
                {buttons}
            </div>
        </form>
    );
};

export default EmployeeSelector;
