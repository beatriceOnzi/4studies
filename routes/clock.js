const express = require('express');
const router = express.Router();

const TimeToday = require("../models/TimeToday");
const TimeWeek = require("../models/TimeWeek");
const TotalHours = require("../models/TotalHours");

// -- Routes --
router.get("/", async (req, res) => {
    if (await checkIfIsFirstClockIn()) {
        await createTimeToday();
    }

    const study_today = await getStudyToday();
    let time = msToHours(study_today.timeInMsToday);

    res.render("clock", { clock: 1, time: time });
});


// -- Helper Functions --
async function checkIfIsFirstClockIn() {
    const today = getToday();
    const study_today = await getStudyToday();

    if (study_today) {
        return false;
    }
    return true;
}
async function createTimeToday() {
    const datetest = new TimeToday({});
    await datetest.save();
}
async function getStudyToday() {
    const today = getToday();
    const study_today = await TimeToday.findOne({ where: { today: today } });
    return study_today;
}

function getToday(){
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    return today;
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


module.exports = router;
