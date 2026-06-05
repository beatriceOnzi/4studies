const TimeToday = require("../models/TimeToday");
const TimeWeek = require("../models/TimeWeek");
const TotalHours = require("../models/TotalHours");
const ClockIn = require("../models/ClockIn")

const { get_time_today } = require('../services/time_service.js');

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
    const today = await TimeToday.findOne({ where: {today: date}});
    if (!today) {
        throw new Error(`Nenhum registro encontrado para ${date}`);
    }
    return today.id;
}

async function checkIfIsFirstClockIn() { // importante de testar
    const today = getToday();
    const study_today = await getStudyToday();

    if (study_today) {
        return false;
    }
    return true;
}

async function createTimeToday() {
    await TimeToday.create({});
}

async function is_running() { // done
    const last_clock_record = await ClockIn.findOne({ order: [ [ 'createdAt', 'DESC' ] ]});

    return last_clock_record.clockInTS ? last_clock_record.clockOutTS == null: false;
    
}

async function save_clock_out(timestamp) { //done
    const last_clock_record = await ClockIn.findOne({ order: [ [ 'createdAt', 'DESC' ] ]});
    if (last_clock_record.clockOutTS) {
        return "o ultimo registro já possiu um clockOut"
    }
    last_clock_record.clockOutTS = timestamp;
    await last_clock_record.save()
}

async function add_ms_to_TimeToday(interval) {
    const time_today = await get_time_today();
    time_today.timeInMsToday += interval
    time_today.save();
}

async function add_ms_to_TotalHours(interval) {
    const totalHours = await TotalHours.findByPk(1);
    totalHours.totalHoursCompletedInMs +=  interval
    totalHours.save();
}

async function create_clock_in(timestamp) {
    const date = getToday();
    return await ClockIn.create({
        clockInTS: timestamp,
        clockOutTS: null,
        day: date
    });
}

function msToHours(ms) { // done
    let seconds = Math.floor((ms / 1000) % 60);
    let minutes = Math.floor((ms / (1000 * 60)) % 60);
    let hours = Math.floor((ms / (1000 * 60 * 60)));

    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

module.exports = {
    is_running,
    create_clock_in,
    save_clock_out,
    add_ms_to_TimeToday,
    add_ms_to_TotalHours,
};