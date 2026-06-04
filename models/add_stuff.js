const Notes = require("./Notes");
const WeeklyGoals = require("./WeeklyGoals");
const DailyGoals = require("./DailyGoals");
const TimeWeek = require("./TimeWeek");
const TimeToday = require("./TimeToday");
const TotalHours = require("./TotalHours");

function add_stuff(){
    let total = new TotalHours({
        totalHoursCompletedInMs: 0,
        goalHoursInMs: 3600000000
    })
    total.save()

}
    
module.exports = add_stuff