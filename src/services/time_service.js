const TimeToday = require("../models/TimeToday");
const TimeWeek = require("../models/TimeWeek");
const TotalHours = require("../models/TotalHours");


async function get_totalHours() {
    let totalHours = await TotalHours.findOne()
    return totalHours
}

async function get_hours_completed() {
    const totalHours = await get_totalHours()
    const hours_completed = msToHours(totalHours.totalHoursCompletedInMs)
    return hours_completed
}

async function get_goal_hours() {
    const totalHours = await get_totalHours()
    const goal_hours = msToOnlyHours(totalHours.goalHoursInMs)
    return goal_hours
}


function msToHours(ms) {
    let seconds = Math.floor((ms / 1000) % 60);
    let minutes = Math.floor((ms / (1000 * 60)) % 60);
    let hours = Math.floor((ms / (1000 * 60 * 60)));

    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

function msToOnlyHours(ms) {
    let hours = Math.floor((ms / (1000 * 60 * 60)));

    hours = String(hours).padStart(2, '0');

    return hours
}

module.exports = {
    get_goal_hours,
    get_hours_completed,
    msToHours
}
