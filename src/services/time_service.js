const TotalHours = require("../models/TotalHours");

const { get_total_hours } = require("./clock_service");


async function get_totalHours() {
    return TotalHours.findOne();
}

async function get_hours_completed() {
    const totalHours = await get_total_hours();
    return msToHours(totalHours.totalHoursCompletedInMs);
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
    get_totalHours,
    get_goal_hours,
    get_hours_completed,
    msToHours,
    msToOnlyHours
}
