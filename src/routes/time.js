const express = require('express');
const router = express.Router();

const TimeToday = require("../models/TimeToday");
const TimeWeek = require("../models/TimeWeek");
const TotalHours = require("../models/TotalHours");

router.get("/time", async (req, res) => {
    const totalHours = await TotalHours.findByPk(1);
    const total_hours = msToHours(totalHours.goalHoursInMs)
    const hoursCompleted = msToHours(totalHours.totalHoursCompletedInMs)

    res.render("time", {
        timeNav: 1,
        totalHours: total_hours,
        hoursCompleted: hoursCompleted
    });
})

// -- Helper Functions --
function msToHours(ms) {
    let seconds = Math.floor((ms / 1000) % 60);
    let minutes = Math.floor((ms / (1000 * 60)) % 60);
    let hours = Math.floor((ms / (1000 * 60 * 60)));

    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}


module.exports = router;