const Notes = require("./Notes");
const WeeklyGoals = require("./WeeklyGoals");
const DailyGoals = require("./DailyGoals");
const TimeWeek = require("./TimeWeek");
const TimeToday = require("./TimeToday");
const TotalHours = require("./TotalHours");

function add_stuff(){
    let notes = new Notes({
        note: "fazer a página de anotações"
    })
    notes.save()

    let notes2 = new Notes({
        note: "fazer os goals"
    })
    notes2.save()

    let notes3 = new Notes({
        note: "fazer a lalalal"
    })
    notes3.save()
}
    
module.exports = add_stuff