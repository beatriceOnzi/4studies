const Notes = require("./Notes");
const WeeklyGoals = require("./WeeklyGoals");
const DailyGoals = require("./DailyGoals");
const TimeWeek = require("./TimeWeek");
const TimeToday = require("./TimeToday");
const TotalHours = require("./TotalHours");

function add_stuff(){
    let note = new Notes({
        note: "eu amo o murilo amor da minha vida"
    })
    note.save()

    let weeklyGoals = new WeeklyGoals({
        weekly_goals: "refatorar 4studies"
    })
    weeklyGoals.save()

    let weeklyGoals2 = new WeeklyGoals({
        weekly_goals: "js avancado"
    })
    weeklyGoals2.save()

    let dailyGoals = new DailyGoals({
        daily_goals: "html css avancado"
    })
    dailyGoals.save()
}
    
module.exports = add_stuff