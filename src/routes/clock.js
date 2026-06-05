const express = require('express');
const router = express.Router();

const ClockIn = require("../models/ClockIn")

const {
    is_running,
    create_clock_in,
    save_clock_out,
    add_ms_to_TotalHours,
    add_ms_to_TimeToday
} = require('../services/clock_service');

const { get_time_today } = require('../services/time_service.js');

// salvar os milisegundos no timeWeek para já contar na estatistica

// -- Routes --
router.get("/", async (req, res) => {
    if (await service.checkIfIsFirstClockIn()) {
        await createTimeToday();
    }

    const study_today = await getStudyToday();
    let time = msToHours(study_today.timeInMsToday);
    let isRunning = await is_running();

    res.render("clock", { clock: 1, time: time, is_running:  isRunning});
});

router.get("/get_ms_today", async (req, res) => { // done +-
    const time_today = await get_time_today();
    res.json(time_today.timeInMsToday);
})

router.get("/get_last_clock_in", async (req, res) => { // done
    const last_clock_record = await ClockIn.findOne({ order: [ [ 'createdAt', 'DESC' ] ]});
    if (last_clock_record.clockOutTS){
        res.json("Clock is not running. get_last_clock_in")
    }
    res.json(last_clock_record.clockInTS);
})

router.get("/get_is_running", async (req, res) => { //done
    res.json(is_running());
});

router.post("/create_clock_in", async (req, res) => { //done
    const updated_today = await create_clock_in(req.body.timestamp);

    res.json(updated_today);
});

router.post("/save_clock_out", async (req, res) => { //done
    await save_clock_out(req.body.timestamp);

})

router.post("/add_ms_to_database", async (req, res) => { //done
    const interval = req.body.interval_in_ms
    add_ms_to_TimeToday(interval)
    add_ms_to_TotalHous(interval)
});