const express = require('express');
const router = express.Router();
const add_stuff = require("../models/add_stuff")

const { 
    get_data
} = require("../services/page_service")


const {
    is_running,
    create_clock_in,
    save_clock_out,
    get_time_today,
    get_clockIns,
    get_last_clock_in,
    create_total_hours_if_needed,
    delete_clockIn,
    edit_clockIn,
    edit_clockOut,
} = require('../services/clock_service');
const { get_all_TimeToday } = require('../services/time_service');


// -- Routes --
router.get("/", async (req, res) => {
    await create_total_hours_if_needed();
    const data = await get_data()
    res.render("index", {data: data});
});

router.get("/get_ms_today", async (req, res) => {
    const time_today = await get_time_today();
    res.json(time_today.timeInMsToday);
})

router.get("/get_all_TimeToday", async (req, res) => {
    const all_tt = await get_all_TimeToday();
    res.json(all_tt)
})

router.get("/get_last_clock_in", async (req, res) => {
    const last = await get_last_clock_in();
    if (!last || last.clockOutTS) {
        return res.json("Clock is not running. get_last_clock_in");
    }
    res.json(last.clockInTS);
});

router.get("/get_is_running", async (req, res) => {
    res.json(await is_running());
});

router.post("/create_clock_in", async (req, res) => {
    const new_clock = await create_clock_in(req.body.timestamp);

    res.json(new_clock);
});

router.post("/save_clock_out", async (req, res) => {
    try {
        const data = await save_clock_out(req.body.timestamp);
        if (typeof data === "string") {
            return res.status(409).json({ error: data });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/get_clockIns", async (req, res) => {
    const clockIns = await get_clockIns()
    res.json(clockIns)
});

router.post("/delete_clockIn", async (req, res) => {
    try {
        await delete_clockIn(req.body.id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/edit_clockIn", async (req, res) => {
    try {
        const data = await edit_clockIn(req.body.id, req.body.new_clockInTS);
        if (typeof data === "string") {
            return res.status(404).json({ error: data });
        }
        res.json({
            new_time: data.new_time,
            new_timeToday: data.new_timeToday,
            new_totalHours: data.new_totalHours
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/edit_clockOut", async (req, res) => {
    try {
        const data = await edit_clockOut(req.body.id, req.body.new_clockOutTS);
        if (typeof data === "string") {
            return res.status(404).json({ error: data });
        }
        res.json({
            new_time: data.new_time,
            new_timeToday: data.new_timeToday,
            new_totalHours: data.new_totalHours
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router