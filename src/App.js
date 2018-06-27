import React, { Component } from 'react';
import './App.css';

import testSchedules from './testSchedules.json';
import EmployeeSelector from './EmployeeSelector';
import Time from './Time';

// find all available windows where a minimum of x people are on work but not on lunch or break

const MEETING_LENGTH = 15;
const MEETING_START_TIMES = [0, 15, 30, 45];
const INCOMPATIBLE_ACTIVITIES = ['Lunch', 'Short break'];
class App extends Component {
    constructor () {
        super();

        this.state = {
            meetingTimes: this.processSchedule(testSchedules.ScheduleResult.Schedules),
            teamSize: testSchedules.ScheduleResult.Schedules.length,
            minTeam: 0,
            availableTimes: []
        };
    }

    processSchedule (schedules) {
        // find number of free employees per time slot

        // extract all free times per employee
        const employees = schedules.reduce((acc, employee) => {
            acc.push({
                name: employee.Name,
                times: this.findAvailableTimes(employee.Projection)
            });

            return acc;
        }, []);

        // on each time slot add all available employees
        const meetingTimes = employees.reduce((acc, employee) => {

            employee.times.forEach((time) => {
                const slot = acc.find((meeting) => meeting.time.getTime() === time.getTime());
                
                if (slot) {
                    slot.employees.push(employee.name);
                } else {
                    acc.push({
                        employees: [employee.name],
                        time
                    });
                }
            });

            return acc;
        }, []);

        meetingTimes.sort((a, b) => a.time.valueOf() - b.time.valueOf());
        
        return meetingTimes;
    }

    findAvailableTimes (projection) {

        // let's start by merging all continuous accepted activity

        const activities = projection.reduce((acc, activitie) => {
            const currentSlot = acc[acc.length - 1];

            if (!INCOMPATIBLE_ACTIVITIES.includes(activitie.Description)) {
                if(currentSlot) {
                    currentSlot.minutes += activitie.minutes;
                } else {
                    acc.push({
                        start: activitie.Start,
                        minutes: activitie.minutes
                    });
                }
            } else {
                acc.push(null);
            }

            return acc;
        }, []).filter((slot) => slot);

        return activities.reduce((acc, slot) => {

            let msStartTime = parseInt(slot.start.replace('/Date(', '').replace('+0000)/', ''), 10);
            const msPerMeeting = MEETING_LENGTH * 1000 * 60;
            const startTimeMinute = new Date(msStartTime).getMinutes();
            let activitieDuration = slot.minutes;

            if (!MEETING_START_TIMES.includes(startTimeMinute)) {
                // if not on a valid start time -> find the nearest
                // move up start time to nearest and remove same amount of duration
                const nearest = MEETING_START_TIMES.findIndex((time) => time > startTimeMinute);
                let diff;

                if (nearest === -1) {
                    diff = 60 - startTimeMinute;
                } else {
                    diff = MEETING_START_TIMES[nearest] - startTimeMinute;
                }

                msStartTime += (diff * 1000 * 60);
                activitieDuration -= diff;

            }

            const nrOfMeetingSlots = Math.floor(activitieDuration / MEETING_LENGTH);

            Array(nrOfMeetingSlots).fill(null).forEach((na, index) => {
                acc.push(new Date(msStartTime + index * msPerMeeting));
            });

            return acc;
        }, []);

    }

    handleOptionChange (changeEvent) {
        const minEnployees = changeEvent.target.value;

        const availableTimes = this.state.meetingTimes.filter((meeting) => meeting.employees.length >= minEnployees)
            .map((meeting, index) => <Time date={meeting.time} key={index} />);

        this.setState({ ...this.state, availableTimes, minTeam: minEnployees });
    }

    render () {

        const { availableTimes } = this.state;
        const header = availableTimes.length > 0 
            ? 'Available times for a meeting'
            : 'No times available for the required number of participants';

        return (
            <div>
                <EmployeeSelector
                    teamSize={this.state.teamSize}
                    minTeam={this.state.minTeam}
                    handleOptionChange={this.handleOptionChange.bind(this)}
                />
                <h1>{header}</h1>
                {this.state.availableTimes}
            </div>
        );
    }
}

export default App;
