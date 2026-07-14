const TimeToday = require("../models/TimeToday");
const TimeWeek = require("../models/TimeWeek");
const TotalHours = require("../models/TotalHours");
const ClockIn = require("../models/ClockIn")

async function getStudyToday() {
    const today = getToday();
    const study_today = await TimeToday.findOne({ where: { today: today } });
    return study_today;
}

function getToday(){
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    return today;
}

async function get_time_today() {
    const today = getToday();

    return await TimeToday.findOne({
        where: { today }
    });
}

async function get_id_by_date(date) {
    const today = await TimeToday.findOne({ where: {today: date}});
    if (!today) {
        throw new Error(`Nenhum registro encontrado para ${date}`);
    }
    return today.id;
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
    await TimeToday.create({});
}

async function createTotalHours() {
    return await TotalHours.create({
        goalHoursInMs: 36000000000
    });
}

async function create_total_hours_if_needed() {
    let totalHours = await TotalHours.findOne();
    
    if (totalHours == null) {
        totalHours = await createTotalHours();
    }
}

async function is_running() {
    const last_clock_record = await ClockIn.findOne({ order: [['createdAt', 'DESC']] });

    if (!last_clock_record) return false;

    return last_clock_record.clockInTS ? last_clock_record.clockOutTS == null: false;
    
}

async function save_clock_out(timestamp) {
    const last_clock_record = await ClockIn.findOne({ order: [ [ 'createdAt', 'DESC' ] ]});
    if (last_clock_record.clockOutTS) {
        // criar um novo
        return "o ultimo registro já possiu um clockOut"

    }
    last_clock_record.clockOutTS = timestamp;
    await last_clock_record.save()
}

async function add_ms_to_TimeToday(interval) {
    const time_today = await get_time_today();
    time_today.timeInMsToday += interval
    await time_today.save();
}

async function add_ms_to_TotalHours(interval) {
    let totalHours = await TotalHours.findOne();
    totalHours.totalHoursCompletedInMs += interval;
    await totalHours.save();
}

async function create_clock_in(timestamp) {
    const date = getToday();
    return await ClockIn.create({
        clockInTS: timestamp,
        clockOutTS: null,
        day: date
    });
}

async function get_clockIns_today(today) {
    return await ClockIn.findOne({ where: {day: today}});
}

async function edit_clockIn(id, new_clockIn) {
    let record = await ClockIn.findByPk(id);
    if (record){
        record.clockInTS = new_clockIn
        await record.save()
        return record.clockInTS
    }
    return "Não Encontrado"
}

async function edit_clockOut(id, new_clockOut) {
    let record = await ClockIn.findByPk(id);
    if (record){
        record.clockOutTS = new_clockOut
        await record.save()
        return record.clockOutTS
    }
    return "Não Encontrado"
}

module.exports = {
    is_running,
    create_clock_in,
    save_clock_out,
    add_ms_to_TimeToday,
    add_ms_to_TotalHours,
    get_time_today,
    getToday,
    checkIfIsFirstClockIn,
    createTimeToday,
    getStudyToday,
    create_total_hours_if_needed,
    get_clockIns_today,
    edit_clockIn,
    edit_clockOut
};