
const clock_btn = document.getElementById('clock_button');
const clock_text = document.getElementById('clock_time');

let start_end_timestamp = [];
let interval_in_ms = 0;

let running_display = null;


document.addEventListener("DOMContentLoaded", async function() {
    let is_running = await get_is_running()
    handle_clock_display(is_running)
    start_clock();
});

clock_btn.addEventListener('click', handle_clock_press);


async function handle_clock_press(){

    clock_btn.textContent = clock_btn.textContent.trim();

    is_running = await get_is_running()

    if (!is_running) {
        start_clock(start_end_timestamp[0])

        clock_btn.textContent = "Stop";

    } else {
        stop_clock();

        clock_btn.textContent = "Start";
        
    }
}

async function get_is_running() {
    const response = await fetch("/get_is_running");
    console.log(response)
    data = await response.json()
    console.log(data)
    return data
}

async function desable_clock_running() {
    const response = await fetch("/desable_clock_running");
}

async function save_last_clock_in(timestamp) {
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

async function start_clock(){
    start_end_timestamp.length = 0;
    start_end_timestamp[0] = get_current_timestamp();
    save_last_clock_in(start_end_timestamp[0])
}

async function stop_clock(){
    interval = start_end_timestamp[1] - start_end_timestamp[0]
    save_interval_to_database(interval);
    desable_clock_running();
    clock_text.textContent = msToHours(await get_ms_today())
    clearInterval(running_display)
}


async function handle_clock_display(is_running){
    if (is_running){
        const current_saved_time = await get_ms_today();
        clock_text.textContent = msToHours(current_saved_time);

        const last_clock_in_timestamp = await get_last_clock_in()
        const ms_today = await get_ms_today()

        running_display = setInterval(() => {
            const a = get_current_timestamp()

            const current_timestamp = get_current_timestamp()
            const elapsed_since_clock_in = current_timestamp - last_clock_in_timestamp
            const total_ms_today = ms_today + elapsed_since_clock_in

            console.log(`current_timestamp ${current_timestamp} 
                elapsed_since_clock_in ${elapsed_since_clock_in} 
                tottal_ms_today ${total_ms_today}`)

            const elapsed_ms = a - start_end_timestamp[0];
            console.log("elapsed", elapsed_ms)
            const final = total_ms_today + elapsed_ms
            console.log("final", final)

            clock_text.textContent = msToHours(final);


        }, 1000);
    }

}

function get_current_timestamp() {
    return Date.now();
}

function get_interval(start_end_timestamp) {
    return start_end_timestamp[1] - start_end_timestamp[0];
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

async function save_interval_to_database(interval_in_ms) {
    const response = await fetch("/add_ms_today", {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            interval_in_ms
        })
    });

    
}
