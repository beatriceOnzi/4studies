const { 
    is_running,
    getStudyToday,
} = require("../services/clock_service")

const { 
    get_notes,
    get_daily_goals,
    get_weekly_goals,    
} = require("../services/notes_service")


const { 
    get_goal_hours,
    get_hours_completed,
    msToHours
} = require("../services/time_service")


async function get_data() {
    let data = {
        time: null,
        isRunning: await is_running(),
        notes: await get_notes(),
        daily_goals: await get_daily_goals(),
        weekly_goals: await get_weekly_goals(),
        hours_completed: await get_hours_completed(),
        goal_hours: await get_goal_hours()
    }
    const study_today = await getStudyToday();
    data.time = msToHours(study_today.timeInMsToday);
    console.log(data.goal_hours)
    return data 
}


module.exports = { 
    get_data
}