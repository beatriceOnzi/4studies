const Notes = require("./Notes");
const WeeklyGoals = require("./WeeklyGoals");
const DailyGoals = require("./DailyGoals");
const TimeToday = require("./TimeToday");
const TotalHours = require("./TotalHours");
const ClockIn = require("./ClockIn");

const { Op } = require('sequelize');

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

    await ClockIn.destroy({
        where: {
            day: {
                [Op.gte]: '2026-06-01',
                [Op.lt]: '2026-10-17'
            }
        }
    });

    // ClockIn.destroy({where: {id: 52}})
    // ClockIn.destroy({where: {id: 51}})
}
    
module.exports = add_stuff