const express = require('express');
const router = express.Router();

const TimeToday = require("../models/TimeToday");
const TimeWeek = require("../models/TimeWeek");
const TotalHours = require("../models/TotalHours");
// const add_stuff = require("../models/add_stuff.js");
 
// salvar os milisegundos no timeWeek e TotalHours para já contar na estatistica


// -- Routes --
router.get("/", async (req, res) => {
    if (await checkIfIsFirstClockIn()) {
        await createTimeToday();
    }

    const study_today = await getStudyToday();
    let time = msToHours(study_today.timeInMsToday);
    let isRunning = await is_running()

    res.render("clock", { clock: 1, time: time, is_running:  isRunning});
});

router.get("/get_ms_today", async (req, res) => {
    const time_today = await get_time_today()
    res.json(time_today.timeInMsToday);
})

router.get("/get_last_clock_in", async (req, res) => {
    const time_today = await get_time_today()
    res.json(time_today.lastClockIn);
})

router.get("/get_is_running", async (req, res) => {
    const time_today = await get_time_today();
    res.json(time_today.lastClockIn != 0);
});

router.post("/save_last_clock_in", async (req, res) => {
    const today = await getToday();
    const updated_today = save_last_clock_in(req.body.timestamp, today)

    res.json(updated_today);
});

router.get("/desable_clock_running", async (req, res) => {
    const updated_today = desable_clock_running()

    res.json(updated_today);
})

router.post("/add_ms_today", async (req, res) => {
    const time_today = await get_time_today();
    time_today.timeInMsToday = time_today.timeInMsToday + req.body.interval_in_ms
    time_today.save();

    res.json(time_today);
});


// -- Helper Functions --

async function getStudyToday() {
    const today = getToday();
    const study_today = await TimeToday.findOne({ where: { today: today } });
    return study_today;
}

function getToday(){
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    return today;
}

async function get_id_by_date(date) {
    const today = await TimeToday.findOne({ where: {today: date}})
    return today.id
}

async function get_time_today() {
    const today = getToday();
    const id_today = await get_id_by_date(today);
    const time_today = await TimeToday.findByPk(id_today);
    return time_today
}

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

async function is_running() {
    const date = getToday();
    const today = await TimeToday.findOne({ where: {today: date}})

    return today ? today.lastClockIn != 0: false;
    
}

async function desable_clock_running() {
    const date = await getToday();
    const today = await TimeToday.findOne({ where: {today: date}});
    today.lastClockIn = 0;
    today.save()
    return today
}

async function save_last_clock_in(timestamp, date) {
    const today = await TimeToday.findOne({ where: {today: date}});
    today.lastClockIn = timestamp;
    today.save()
    return today
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
