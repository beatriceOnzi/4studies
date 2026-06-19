const { 
    is_running,
    getStudyToday,
} = require("../services/clock_service")

const { 
    get_daily_goals,
    get_weekly_goals,    
} = require("./goals_service")

const { 
    get_notes,    
} = require("./notes_service")

const { 
    get_goal_hours,
    get_hours_completed,
    msToHours
} = require("../services/time_service")


async function get_data() {
    let data = {
        time: null,
        is_running: await is_running(),
        notes: null,
        daily_goals: await get_daily_goals(),
        weekly_goals: await get_weekly_goals(),
        hours_completed: await get_hours_completed(),
        goal_hours: await get_goal_hours()
    }
    const study_today = await getStudyToday();
    data.time = msToHours(study_today.timeInMsToday);
    notes = await get_notes();
    data.notes = notes.note ?? "";
    return data 
}


module.exports = { 
    get_data
}