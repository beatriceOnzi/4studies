const clock_btn = document.getElementById('clock_button');
const clock_text = document.getElementById('clock_time');
const clockIn_list_btn = document.getElementById('clockIn_list_btn');

const table_box = document.getElementById('table_box');
const buttons_list = document.getElementById('buttons_list');
const button = document.querySelector('.button')

let running_display = null;

document.addEventListener("DOMContentLoaded", async function() {
    let is_running = await get_is_running()
    handle_clock_display(is_running)
});

clock_btn.addEventListener('click', handle_clock_press);
clockIn_list_btn.addEventListener('click', open_list)

buttons_list.addEventListener("click", (event) => {
    if (event.target.matches(".button")) {
        const day = event.target.textContent;        
        apply_filters(day)
    }
});

async function handle_clock_display(is_running) {
    
    if (is_running){
        const current_saved_time = await get_ms_today();
        clock_text.textContent = msToHours(current_saved_time);

        const last_clock_in_timestamp = await get_last_clock_in()
        const ms_today = await get_ms_today()

        running_display = setInterval(() => {
            const timestamp_now = get_timestamp_now()

            const elapsed_since_clock_in = timestamp_now - last_clock_in_timestamp
            const total_ms_today = ms_today + elapsed_since_clock_in

            clock_text.textContent = msToHours(total_ms_today);
        }, 1000);
    }

}

async function handle_clock_press() {
    let is_running = await get_is_running()

    if (!is_running) {
        start_clock()

        clock_btn.textContent = "Stop";

    } else {

        stop_clock();

        clock_btn.textContent = "Start";
        
    }
}

async function start_clock() {
    handle_clock_display(true)
    enable_clock_running()
}

async function stop_clock() {
    const current_timestamp = get_timestamp_now()
    const last_clock_in_timestamp = await get_last_clock_in();
    
    const interval = current_timestamp - last_clock_in_timestamp 

    await Promise.all([
        save_interval_to_database(interval),
        save_clock_out(current_timestamp)
    ]);

    clearInterval(running_display);
    clock_text.textContent = msToHours(await get_ms_today());
}

async function open_list() {
    const table_data = await get_clockIn_table_data();
    display_days_buttons(table_data)

    clockIn_table = new Tabulator("#clockIn_table", {
        height: "100%",
        data: table_data,
        height:'100%',
        layout: "fitColumns",
        columns: [
            { title: "Clock In", field: "clockIn", hozAlign: "center", headerSort: false, editor:"input", cellEdited: edit_clockIn},
            { title: "Clock Out", field: "clockOut", hozAlign: "center", headerSort: false, editor:"input",  cellEdited: edit_clockOut},
            { title: "Total Time", field: "time", hozAlign: "center", headerSort: false },
        ],
    });

    table_box.classList.remove('hidden');

    document.addEventListener("click", (event) => {
        if (!table_box.contains(event.target)) {
            table_box.classList.add('hidden');
        }
    });
}

async function get_clockIn_table_data() {
    let clockIn_table_data = await get_clockIns();

    const clockIn_data = clockIn_table_data.map(record => ({
        id: record.id,
        clockInTS: record.clockInTS,
        clockOutTS: record.clockOutTS,
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        time: record.time,
        day: record.day
    }));

    return clockIn_data
}


function display_days_buttons(table_data) {
    const all_clockIn_days = Object.values(table_data).map(obj => obj.day);
    const days = [...new Set(all_clockIn_days)];

    days.reverse()

    button.textContent = "All"

    for (day of days){
        const div = button.cloneNode();
        div.textContent = day
        buttons_list.appendChild(div)
    }
}

function apply_filters(day) {
    if(day == "All"){
        clockIn_table.clearFilter();
        return
    }

    const filtros = [];
    filtros.push({ field: "day", type: "like", value: day });

    clockIn_table.setFilter(filtros);
}

function get_timestamp_now() {
    return Date.now();
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

// -- Fetch --

async function get_is_running() {
    const response = await fetch("/get_is_running");
    const data = await response.json()
    return data
}

async function get_ms_today() {
    const response = await fetch("/get_ms_today")
    const data = await response.json();
    return data
    
}

async function get_last_clock_in() {
    const response = await fetch("/get_last_clock_in")
    const data = await response.json();
    return data
}

async function get_clockIns() {
    const response = await fetch("/get_clockIns")
    const data = await response.json();
    return data
}

async function save_clock_out(timestamp) {
    const response = await fetch("/save_clock_out", {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            timestamp
        })
    });
}

async function enable_clock_running() {
    timestamp = get_timestamp_now()
    const response = await fetch("/create_clock_in", {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            timestamp
        })
    });

}

async function save_interval_to_database(interval_in_ms) {
    const response = await fetch("/add_ms_to_database", {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            interval_in_ms
        })
    });
}


async function edit_clockIn(cell) {
    const new_hour = cell.getValue()

    const current_clockInTS = cell.getRow().getData().clockInTS
    const old_hour = cell.getOldValue()

    const id = cell.getRow().getData().id
    const new_clockInTS = calculate_new_clockIn(current_clockInTS, old_hour, new_hour)

    const response = await fetch("/edit_clockIn", {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            id,
            new_clockInTS
        })
    });

    const data = await response.json()

    clockIn_table.updateData([{id: id, time: data}]);

}

async function edit_clockOut(cell) {
    const new_hour = cell.getValue()

    const current_clockOutTS = cell.getRow().getData().clockOutTS
    const old_hour = cell.getOldValue()

    const id = cell.getRow().getData().id
    const new_clockOutTS = calculate_new_clockOut(current_clockOutTS, old_hour, new_hour)

    const response = await fetch("/edit_clockOut", {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            id,
            new_clockOutTS
        })
    });

    const data = await response.json()

    clockIn_table.updateData([{id: id, time: data}]);

}

function calculate_new_clockIn(current_clockInTS, current_hour, new_hour){
    time_difference = toMS(new_hour) - toMS(current_hour)
    new_clockInTS = current_clockInTS + time_difference
    return new_clockInTS
}

function calculate_new_clockOut(current_clockOutTS, current_hour, new_hour){
    time_difference = toMS(new_hour) - toMS(current_hour)
    new_clockOutTS = current_clockOutTS + time_difference
    return new_clockOutTS
}

function validate_hour(cell, hour){
    const regex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    return (regex.test(hour)); 
}

function toMS(hour){
    const [hours, minutes] = hour.split(":").map(Number);
    return (hours * 60 * 60 + minutes * 60) * 1000;
}