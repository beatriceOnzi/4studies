const express = require('express');
const router = express.Router();

const ClockIn = require("../models/ClockIn")
const add_stuff = require("../models/add_stuff")

const { 
    get_data
} = require("../services/page_service")


const {
    is_running,
    create_clock_in,
    save_clock_out,
    add_ms_to_TotalHours,
    add_ms_to_TimeToday,
    checkIfIsFirstClockIn,
    createTimeToday,
    getStudyToday,
    get_time_today,
    create_total_hours_if_needed,
    get_clockIns,
    edit_clockIn,
    edit_clockOut
} = require('../services/clock_service');


// salvar os milisegundos no timeWeek para já contar na estatistica

// -- Routes --
router.get("/", async (req, res) => { // sem teste
    if (await checkIfIsFirstClockIn()) {
        await createTimeToday();
    }
    create_total_hours_if_needed()

    const data = await get_data()
    res.render("index", {data: data});
});

router.get("/get_ms_today", async (req, res) => { // done
    const time_today = await get_time_today();
    res.json(time_today.timeInMsToday);
})

router.get("/get_last_clock_in", async (req, res) => { // sem teste
    const last_clock_record = await ClockIn.findOne({ order: [ [ 'createdAt', 'DESC' ] ]});
    if (last_clock_record.clockOutTS){
        return res.json("Clock is not running. get_last_clock_in")
    }
    res.json(last_clock_record.clockInTS);
})

router.get("/get_is_running", async (req, res) => { //done
    res.json(await is_running());
});

router.post("/create_clock_in", async (req, res) => { //done
    const new_clock = await create_clock_in(req.body.timestamp);

    res.json(new_clock);
});

router.post("/save_clock_out", async (req, res) => {
    try {
        await save_clock_out(req.body.timestamp);
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post("/add_ms_to_database", async (req, res) => {
    const interval = req.body.interval_in_ms;
    await add_ms_to_TimeToday(interval);
    await add_ms_to_TotalHours(interval);
    res.json({ ok: true });
});

// router.get("/get_clockIns_today", async (req, res) => {
//     const today = req.body.today;
//     const clockIns_today = await get_clockIns_today(today)
//     res.json(clockIns_today)
// });

router.get("/get_clockIns", async (req, res) => {
    const clockIns = await get_clockIns()
    res.json(clockIns)
});

router.post("/edit_clockIn", async (req, res) => {
    const data = await edit_clockIn(req.body.id, req.body.new_clockInTS);
    res.json({
        new_time: data.new_time, 
        new_timeToday: data.new_timeToday, 
        new_totalHours: data.new_totalHours
    });
});

router.post("/edit_clockOut", async (req, res) => {
    const data = await edit_clockOut(req.body.id, req.body.new_clockOutTS);
    res.json({
        new_time: data.new_time, 
        new_timeToday: data.new_timeToday, 
        new_totalHours: data.new_totalHours
    });
});


module.exports = router