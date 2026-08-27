export async function get_clockIn_table_data(clockIn_table_data) {
    const clockIn_data = clockIn_table_data.map(record => ({
        id: record.id,
        clockInTS: record.clockInTS,
        clockOutTS: record.clockOutTS,
        clockIn: format_datetime(record.clockInTS),
        clockOut: format_datetime(record.clockOutTS),
        time: get_time(record.time, record.clockOutTS),
        day: record.day,
        formated_day: format_day(record.day)
    }));

    return clockIn_data
}

export function calculate_new_clockIn(new_value, clockOutTS) {
    const new_ts = parse_datetime(new_value);

    if (new_ts === null || new_ts >= clockOutTS) {
        return "Invalid";
    }
    return new_ts;
}

export function calculate_new_clockOut(new_value, clockInTS) {
    const new_ts = parse_datetime(new_value);

    if (new_ts === null || new_ts <= clockInTS) {
        return "Invalid";
    }
    return new_ts;
}

export function validate_datetime(cell, value) {
    const values = value.split(" ");
    const day = values[0];
    const hour = values[1];

    const day_isValid = isValidDate(day);
    const hour_isValid = isValidHour(hour);

    if (day_isValid && hour_isValid) {
        return true;
    }
    return false;
}

export function get_timestamp_now() {
    return Date.now();
}

export function msToHours(ms) {

    let seconds = Math.floor((ms / 1000) % 60);
    let minutes = Math.floor((ms / (1000 * 60)) % 60);
    let hours = Math.floor((ms / (1000 * 60 * 60)));

    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

function isValidDate(dateStr) {
  const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  if (!regex.test(dateStr)) return false;

  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function isValidHour(hour){
    const regex_hour = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    return regex_hour.test(hour);
}

function format_day(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}`;
}

function format_datetime(ts) {
    if (!ts){
        return ""
    }
    const date = new Date(ts);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function get_time(time, ts){
    if (!ts){
        return ""
    }
    return time
}

function parse_datetime(str) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;
    const match = str.match(regex);
    if (!match) return null;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const hours = Number(match[4]);
    const minutes = Number(match[5]);

    const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

    if (isNaN(date.getTime())) return null;
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
        return null;
    }

    return date.getTime();
}