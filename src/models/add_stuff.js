const Notes = require("./Notes");
const WeeklyGoals = require("./WeeklyGoals");
const DailyGoals = require("./DailyGoals");
const TimeWeek = require("./TimeWeek");
const TimeToday = require("./TimeToday");
const TotalHours = require("./TotalHours");
const ClockIn = require("./ClockIn");

async function add_stuff(){
    // let total = await TotalHours.findByPk(1);
    // total.totalHoursCompletedInMs = 0;
    // await total.save()
    // let a = new TotalHours({
    //     totalHoursCompletedInMs: 0,
    //     goalHoursInMs: 3600000000
    // })
    // a.save()

    // let b = new DailyGoals({
    //     daily_goals: "ksm"
    // })
    // b.save()

    // let ew = new WeeklyGoals({
    //     weekly_goals: "ssas"
    // })
    // ew.save()

    // let bq = new Notes({
    //     note: "ksmsssss"
    // })
    // bq.save()

    // TimeToday.destroy({where: { id: 3 }})
    // ClockIn.destroy({where: {id: 2}})
}
    
module.exports = add_stuff