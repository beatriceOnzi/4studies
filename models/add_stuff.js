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

    let datetest = new TimeToday({})
    datetest.save()

}
    
module.exports = add_stuff