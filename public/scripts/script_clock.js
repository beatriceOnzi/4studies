
const clock_btn = document.getElementById('clock_button');
const clock_text = document.getElementById('clock_time');

let start_end_timestamp = [];
let interval_in_ms = 0;

let hour_display = null;

clock_btn.addEventListener('click', handle_clock_press);

async function handle_clock_press(){

    clock_btn.textContent = clock_btn.textContent.trim();

    if (clock_btn.textContent == "Start") {

        const current_time = await get_ms_today();

        start_end_timestamp.length = 0;

        start_end_timestamp[0] = get_current_timestamp();

        start_clock_display(current_time);

        clock_btn.textContent = "Stop";

    } else {

        start_end_timestamp[1] = get_current_timestamp();
        console.log("entrou no else", interval_in_ms, hour_display)

        interval_in_ms = get_interval(start_end_timestamp);

        stop_clock_display();

        await add_interval_to_database(interval_in_ms);

        clock_btn.textContent = "Start";
    }
}

async function start_clock_display(current_time){
    console.log(current_time, "     aa")
    clock_text.textContent = msToHours(current_time);

    hour_display = setInterval(() => {
        const a = get_current_timestamp()

        const elapsed_ms = a - start_end_timestamp[0];
        // const ms_today = await get_ms_today()
        // const final = ms_today + elapsed_ms
        console.log("elapsed", elapsed_ms)

        clock_text.textContent = msToHours(elapsed_ms);

    }, 1000);
}

async function stop_clock_display(){
    clock_text.textContent = msToHours(await get_ms_today())
    clearInterval(hour_display)

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

async function add_interval_to_database(interval_in_ms) {
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
