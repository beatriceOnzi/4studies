const express = require('express');
const router = express.Router();

const TimeToday = require("../models/TimeToday");
const TimeWeek = require("../models/TimeWeek");
const TotalHours = require("../models/TotalHours");

// se sair do site e estiver decorrendo tempo -> guardar info em algum lugar 

// salvar os milisegundos no timeWeek e TotalHours para já contar na estatistica


// -- Routes --
router.get("/", async (req, res) => {
    if (await checkIfIsFirstClockIn()) {
        await createTimeToday();
    }

    const study_today = await getStudyToday();
    let time = msToHours(study_today.timeInMsToday);

    res.render("clock", { clock: 1, time: time });
});

router.post("/add_ms_today", async (req, res) => {
    const time_today = await get_time_today();
    time_today.timeInMsToday = time_today.timeInMsToday + req.body.interval_in_ms
    time_today.save();

    res.json(time_today);
});

router.get("/get_ms_today", async (req, res) => {
    const time_today = await get_time_today()
    res.json(time_today.timeInMsToday);
})

// -- Helper Functions --

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
