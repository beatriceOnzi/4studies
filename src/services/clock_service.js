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

async function get_total_hours() {
    return TotalHours.findOne()
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
    let totalHours = await get_total_hours();
    
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
        return "o ultimo registro já possiu um clockOut"

    }
    last_clock_record.clockOutTS = timestamp;
    await last_clock_record.save()
}

async function add_ms_to_db(interval) {
    await add_ms_to_TimeToday(interval)
    await add_ms_to_TotalHours(interval)
}

async function remove_ms_from_db(interval) {
    await remove_ms_from_TimeToday(interval)
    await remove_ms_from_TotalHours(interval)
}

async function add_ms_to_TimeToday(interval) {
    let time_today = await get_time_today();
    time_today.timeInMsToday += interval
    await time_today.save();
}

async function remove_ms_from_TimeToday(interval) {
    let time_today = await get_time_today();
    time_today.timeInMsToday -= interval
    await time_today.save();
}


async function add_ms_to_TotalHours(interval) {
    let totalHours = await get_total_hours()
    totalHours.totalHoursCompletedInMs += interval;
    await totalHours.save();
}

async function remove_ms_from_TotalHours(interval) {
    let totalHours = await get_total_hours()
    totalHours.totalHoursCompletedInMs -= interval;
    await totalHours.save();
}

async function get_new_data(new_time) {
    let time_today = await get_time_today();
    let total_hours = await get_total_hours();
    let data ={
        new_time: set_formated_inteval(new_time),
        new_timeToday: set_formated_inteval(time_today.timeInMsToday), 
        new_totalHours: set_formated_inteval(total_hours.totalHoursCompletedInMs)
    }
    return data
}

async function create_clock_in(timestamp) {
    const date = getToday();
    return await ClockIn.create({
        clockInTS: timestamp,
        clockOutTS: null,
        day: date
    });
}

async function get_clockIns() {
    clockIns = await ClockIn.findAll()
    formated_clockIns = format_clockIns(clockIns)
    return formated_clockIns
}

async function edit_clockIn(id, new_clockInTS) {
    let record = await ClockIn.findByPk(id);
    await remove_ms_from_db(record.clockOutTS - record.clockInTS);
    if (record) {
        record.clockInTS = new_clockInTS;

        record.day = new Date(new_clockInTS).toISOString().split('T')[0];

        await record.save();
        await add_ms_to_db(record.clockOutTS - record.clockInTS);

        let data = await get_new_data(record.clockOutTS - record.clockInTS)
        return data
    }
    return "Não Encontrado";
}

async function edit_clockOut(id, new_clockOutTS) {
    let record = await ClockIn.findByPk(id);
    await remove_ms_from_db(record.clockOutTS - record.clockInTS);
    if (record) {
        record.clockOutTS = new_clockOutTS;

        await record.save();
        await add_ms_to_db(record.clockOutTS - record.clockInTS);
        return set_formated_inteval(record.clockOutTS - record.clockInTS);
    }
    return "Não Encontrado";
}

function format_clockIns(clockIns) {
    return clockIns.map(record => ({
        id: record.id,
        clockInTS: record.clockInTS,
        clockOutTS: record.clockOutTS,
        clockIn: format_timestamp(record.clockInTS),
        clockOut: format_timestamp(record.clockOutTS),
        time: set_formated_inteval(record.clockOutTS - record.clockInTS),
        day: record.day
    }));
}

function format_timestamp(timestamp){
    time = new Date(timestamp).toLocaleTimeString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    return time
}

function set_formated_inteval(interval) {
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
    add_ms_to_TimeToday,
    add_ms_to_TotalHours,
    get_time_today,
    getToday,
    checkIfIsFirstClockIn,
    createTimeToday,
    getStudyToday,
    create_total_hours_if_needed,
    get_clockIns,
    edit_clockIn,
    edit_clockOut
};