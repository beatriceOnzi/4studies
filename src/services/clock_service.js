const { Op } = require("sequelize");
const TimeToday = require("../models/TimeToday");
const TotalHours = require("../models/TotalHours");
const ClockIn = require("../models/ClockIn");

const TZ = "America/Sao_Paulo";
const DAY_MS = 24 * 60 * 60 * 1000;


function getToday() {
    return day_from_timestamp(Date.now());
}

function day_from_timestamp(ts) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(Number(ts)));
}

function day_bounds(day) {
    const start = new Date(`${day}T00:00:00-03:00`).getTime();
    return [start, start + DAY_MS];
}

async function sum_ms(from, to) {
    const clocks = await ClockIn.findAll({
        where: {
            clockInTS: { [Op.lt]: to },
            clockOutTS: { [Op.ne]: null, [Op.gt]: from },
        },
    });

    return clocks.reduce((acc, c) => {
        const clockIn = Number(c.clockInTS);
        const clockOut = Number(c.clockOutTS);

        if (clockOut < clockIn) return acc;

        const start = Math.max(clockIn, from);
        const end = Math.min(clockOut, to);
        return acc + Math.max(0, end - start);
    }, 0);
}

async function refresh_time_today(day) {
    const [from, to] = day_bounds(day);
    const total = await sum_ms(from, to);

    let time_today = await TimeToday.findOne({ where: { today: day } });
    if (!time_today) {
        return false
    }
    time_today.timeInMsToday = total;
    await time_today.save();
    return time_today;
}

async function get_ms_today() {
    const time_today = await refresh_time_today(getToday());
    if (!time_today){
        return 0
    }
    return time_today.timeInMsToday
}

async function get_time_today_by_day(day) {
    return await refresh_time_today(day);
}

async function createTimeToday_by_day(day) {
    return await TimeToday.create({
        timeInMsToday: 0,
        today: day
    });
}

async function checkIfIsFirstClockIn() {
    const [from, to] = day_bounds(getToday());
    return (await sum_ms(from, to)) === 0;
}

async function createTotalHours() {
    return await TotalHours.create({
        goalHoursInMs: 36000000000
    });
}

async function refresh_total_hours() {
    const total = await sum_ms(0, Number.MAX_SAFE_INTEGER);

    let total_hours = await TotalHours.findOne();
    if (!total_hours) {
        total_hours = await createTotalHours();
    }
    total_hours.totalHoursCompletedInMs = total;
    await total_hours.save();
    return total_hours;
}

async function get_total_hours() {
    return refresh_total_hours();
}

async function create_total_hours_if_needed() {
    const totalHours = await TotalHours.findOne();
    if (totalHours == null) {
        await createTotalHours();
    }
}

async function refresh_all(...timestamps) {
    const days = new Set([getToday(), ...timestamps.filter(Boolean).map(day_from_timestamp)]);
    for (const day of days) {
        await refresh_time_today(day);
    }
    await refresh_total_hours();
}

async function is_running() {
    const last_clock_record = await ClockIn.findOne({ order: [['createdAt', 'DESC']] });

    if (!last_clock_record) return false;

    return last_clock_record.clockInTS ? last_clock_record.clockOutTS == null : false;
}

async function create_clock_in(timestamp) {
    const day = day_from_timestamp(timestamp)

    let time_today = await TimeToday.findOne({ where: { today: day } });
    if (!time_today) {
        await createTimeToday_by_day(day);
    }

    return await ClockIn.create({
        clockInTS: timestamp,
        clockOutTS: null,
        day: day_from_timestamp(timestamp)
    });
}

async function save_clock_out(timestamp) {
    const last_clock_record = await ClockIn.findOne({ order: [['createdAt', 'DESC']] });
    if (!last_clock_record) {
        return "No clock records";
    }
    if (last_clock_record.clockOutTS) {
        return "Last record has a clock out";
    }
    last_clock_record.clockOutTS = timestamp;
    await last_clock_record.save();
    await refresh_all(last_clock_record.clockInTS, timestamp);

    return await get_new_data(last_clock_record);;
}

async function get_clockIns() {
    const clockIns = await ClockIn.findAll({
        order: [
            ['clockInTS', 'DESC']
        ]
    });
    return format_clockIns(clockIns);
}

async function get_last_clock_in() {
    return await ClockIn.findOne({ order: [ [ 'createdAt', 'DESC' ] ]});
}

async function delete_clockIn(id) {
    const clockIn = await ClockIn.findByPk(id);
    if (!clockIn) return "Not Found";

    const { clockInTS, clockOutTS, day } = clockIn;
    await clockIn.destroy();

    const remaining = await ClockIn.count({ where: { day:day } });
    if (remaining === 0) await delete_time_today(day);

    await refresh_all(clockInTS, clockOutTS);
}

async function edit_clockIn(id, new_clockInTS) {
    const record = await ClockIn.findByPk(id);
    if (!record) return "Not Found";

    const old_day = record.day;
    const old_clockInTS = record.clockInTS;
    const new_day = day_from_timestamp(new_clockInTS);

    const existing = await TimeToday.findOne({ where: { today: new_day } });
    if (!existing) await createTimeToday_by_day(new_day);

    record.day = new_day;
    record.clockInTS = new_clockInTS;
    await record.save();

    await refresh_all(old_clockInTS, new_clockInTS, record.clockOutTS);

    if (old_day !== new_day) {
        const remaining = await ClockIn.count({ where: { day: old_day } });
        if (remaining === 0) await delete_time_today(old_day);
    }

    return await get_new_data(record);
}

async function delete_time_today(day) {
    const time_today = await TimeToday.findOne({ where: { today: day } });
    if (time_today) await time_today.destroy();
}

async function edit_clockOut(id, new_clockOutTS) {
    const record = await ClockIn.findByPk(id);
    if (!record) return "Not Found!";

    const old_clockOutTS = record.clockOutTS;

    record.clockOutTS = new_clockOutTS;
    await record.save();

    await refresh_all(record.clockInTS, old_clockOutTS, new_clockOutTS);

    return await get_new_data(record);
}

// ---------- formatação ----------

function is_impossible(record) {
    return record.clockOutTS != null &&
        Number(record.clockOutTS) <= Number(record.clockInTS);
}

function interval_of(record) {
    if (record.clockOutTS == null || is_impossible(record)) return 0;
    return Number(record.clockOutTS) - Number(record.clockInTS);
}

function format_record_time(record) {
    return is_impossible(record)
        ? "Invalid"
        : set_formated_interval(interval_of(record));
}

async function get_new_data(record) {
    const ms_today = await get_ms_today();
    const total_hours = await get_total_hours();
    return {
        new_time: format_record_time(record),
        new_timeToday: set_formated_interval(ms_today),
        new_totalHours: set_formated_interval(total_hours.totalHoursCompletedInMs)
    };
}

function format_clockIns(clockIns) {
    return clockIns.map(record => ({
        id: record.id,
        clockInTS: record.clockInTS,
        clockOutTS: record.clockOutTS,
        clockIn: format_timestamp(record.clockInTS),
        clockOut: record.clockOutTS == null ? null : format_timestamp(record.clockOutTS),
        time: format_record_time(record),
        day: record.day
    }));
}

function format_timestamp(timestamp) {
    return new Date(timestamp).toLocaleTimeString("pt-BR", {
        timeZone: TZ,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

function set_formated_interval(interval) {
    let seconds = Math.floor((interval / 1000) % 60);
    let minutes = Math.floor((interval / (1000 * 60)) % 60);
    let hours = Math.floor((interval / (1000 * 60 * 60)));

    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}


module.exports = {
    is_running,
    create_clock_in,
    save_clock_out,
    get_ms_today,
    get_total_hours,
    get_clockIns,
    get_last_clock_in,
    get_new_data,
    get_time_today_by_day,
    getToday,
    checkIfIsFirstClockIn,
    create_total_hours_if_needed,
    delete_clockIn,
    delete_time_today,
    edit_clockIn,
    edit_clockOut
};