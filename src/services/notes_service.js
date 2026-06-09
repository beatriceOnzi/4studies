const Notes = require("../models/Notes");
const WeeklyGoals = require("../models/WeeklyGoals");
const DailyGoals = require("../models/DailyGoals");


async function load_page(goals_type) {
    const data = { notes: "", goals: "" };

    data.notes = await get_notes()

    if (goals_type === "daily") {
        data.goals = await DailyGoals.findAll();
    }
    if (goals_type === "weekly") {
        data.goals = await WeeklyGoals.findAll();
    }

    return data;
}

async function get_notes() {
    return await Notes.findOne();
}

async function create_notes() {
  return await Notes.create({})
}

async function delete_weekly_goal(id) {
    await WeeklyGoals.destroy({
            where: {
                id: id
            }
    });
}

async function delete_daily_goal(id) {
    await DailyGoals.destroy({
            where: {
                id: id
            }
    });
}

async function create_daily_goal(new_goal) {
    const newDailyGoal = await new DailyGoals({
            daily_goals: new_goal
        });
      await newDailyGoal.save();
      return newDailyGoal
}
async function create_weekly_goal(new_goal) {
    const newWeeklyGoal = await new WeeklyGoals({
            weekly_goals: new_goal
        });
      await newWeeklyGoal.save();
      return newWeeklyGoal
}

module.exports = {
    load_page,
    get_notes,
    create_notes,
    delete_weekly_goal,
    delete_daily_goal,
    create_daily_goal,
    create_weekly_goal
}