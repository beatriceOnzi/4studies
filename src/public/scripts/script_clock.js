
const clock_btn = document.getElementById('clock_button');
const clock_text = document.getElementById('clock_time');

let running_display = null;

document.addEventListener("DOMContentLoaded", async function() {
    let is_running = await get_is_running()
    handle_clock_display(is_running)
});

clock_btn.addEventListener('click', handle_clock_press);


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
        start_clock(is_running)

        clock_btn.textContent = "Stop";

    } else {
        stop_clock();

        clock_btn.textContent = "Start";
        
    }
}

async function start_clock(){
    handle_clock_display(true)
    const last_clock_in_timestamp = await get_timestamp_now();
    enable_clock_running(last_clock_in_timestamp)
}

async function stop_clock(){
    const current_timestamp = get_timestamp_now()
    const last_clock_in_timestamp = await get_last_clock_in();
    
    const interval = current_timestamp - last_clock_in_timestamp 

    await save_interval_to_database(interval);
    await desable_clock_running();
    clearInterval(running_display)

    clock_text.textContent = msToHours(await get_ms_today())
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

async function desable_clock_running() {
    const response = await fetch("/desable_clock_running");
}

async function enable_clock_running(timestamp) {
    const response = await fetch("/save_last_clock_in", {

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
    const response = await fetch("/add_ms", {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            interval_in_ms
        })
    });

    
}
