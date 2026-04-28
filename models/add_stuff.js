const Notes = require("./Notes");
const WeeklyGoals = require("./WeeklyGoals");
const DailyGoals = require("./DailyGoals");
const TimeWeek = require("./TimeWeek");
const TimeToday = require("./TimeToday");
const TotalHours = require("./TotalHours");

function add_stuff(){
    let note = new Notes({
        note: "fazer a página de anotações"
    })
    note.save()

    let weeklyGoals = new WeeklyGoals({
        weekly_goals: "terminar a apresentação de slides"
    })
    weeklyGoals.save()

    let weeklyGoals2 = new WeeklyGoals({
        weekly_goals: "fundamentos do js"
    })
    weeklyGoals2.save()

    let dailyGoals = new DailyGoals({
        daily_goals: "termiinar html css básico"
    })
    dailyGoals.save()
}
    
module.exports = add_stuff