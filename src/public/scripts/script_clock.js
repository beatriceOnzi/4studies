const clock_btn = document.getElementById('clock_button');
const clock_text = document.getElementById('clock_time');
const clockIn_list_btn = document.getElementById('clockIn_list_btn');

let running_display = null;

document.addEventListener("DOMContentLoaded", async function() {
    let is_running = await get_is_running()
    handle_clock_display(is_running)
});

clock_btn.addEventListener('click', handle_clock_press);
clockIn_list_btn.addEventListener('click', open_list)


async function handle_clock_display(is_running){
    
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

async function handle_clock_press(){
    let is_running = await get_is_running()

    if (!is_running) {
        start_clock()

        clock_btn.textContent = "Stop";

    } else {

        stop_clock();

        clock_btn.textContent = "Start";
        
    }
}

async function start_clock(){
    handle_clock_display(true)
    enable_clock_running()
}

async function stop_clock(){
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
    const table_data = await get_clockIn_table_data()

    var clockIn_table = new Tabulator("#clockIn_table", {
        height: "100%",
        data: table_data,
        layout: "fitColumns",
        columns: [
            { title: "ClockIn", field: "clockIn", hozAlign: "center", headerSort: false },
            { title: "ClockOut", field: "clockOut", hozAlign: "left", headerSort: false },
            { title: "Total Time", field: "time", hozAlign: "left", headerSort: false },
        ],
    });
}

async function get_clockIn_table_data() {
    let clockIn_table_data = await get_clockIns()

    const clockIn_data = clockIn_table_data.map(record => ({
        id: record.id,
        clockIn: record.clockInTS,
        clockOut: record.clockOutTS,
        time: record.time
    }));

    return clockIn_data
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


async function edit_clockIn() {
    const response = await fetch("/edit_clockIn", {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            id: 1,
            new_clockIn: 1782763967652
        })
    });

    console.log(await response.json())
}


async function edit_clockOut() {
    const response = await fetch("/edit_clockOut", {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            id: 1,
            new_clockOut: 1782763967652
        })
    });

    console.log(await response.json())
}
