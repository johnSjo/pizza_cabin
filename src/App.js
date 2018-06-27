import React, { Component } from 'react';
import './App.css';

import Temp from './temp.json';

// find all available windows where a minimum of x people are on work but not on lunch or break

const MEETING_LENGTH = 15;
const MEETING_START_TIMES = [0, 15, 30, 45];
const INCOMPATIBLE_ACTIVITIES = ['Lunch', 'Short break'];
class App extends Component {
    constructor () {
        super();

        this.state = {
            rawSchedule: Temp
        };
        

        const meetingTimes = this.processSchedule(this.state.rawSchedule.ScheduleResult.Schedules);

        meetingTimes.forEach((meeting) => {
            if (meeting.employees.length > 6) {
                console.log(meeting.time);
            }
        });
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

        console.log(employees);
        
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
        
        return meetingTimes;
    }

    findAvailableTimes (projection) {
        return projection.reduce((acc, slot) => {

            if (!INCOMPATIBLE_ACTIVITIES.includes(slot.Description)) {
                const msStartTime = parseInt(slot.Start.replace('/Date(', '').replace('+0000)/', ''), 10);
                const activitieStartTime = new Date(msStartTime);
                const activitieDuration = slot.minutes;
                const startMinute = activitieStartTime.getMinutes();
                
                let usedTime = 0;

                // if not on a valid start time -> find the nearest
                if (!MEETING_START_TIMES.includes(startMinute)) {
                    // TODO
                } else {
                    // TODO: consider overflow time if next activitie is ok for meeting
                    const nrOfMeetingSlots = Math.floor(activitieDuration / MEETING_LENGTH);
                    const msPerMeeting = MEETING_LENGTH * 1000 * 60;

                    Array(nrOfMeetingSlots).fill(null).forEach((na, index) => {
                        acc.push(new Date(msStartTime + index * msPerMeeting));
                    });
                }
            }

            return acc;
        }, []);

    }

    render () {
        return (
            <div>
            </div>
        );
    }
}

export default App;
