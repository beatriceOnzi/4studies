const WeeklyGoals = require("../models/WeeklyGoals");
const DailyGoals = require("../models/DailyGoals");


async function get_weekly_goals() {
    return await WeeklyGoals.findAll();
}

async function get_daily_goals() {
    return await DailyGoals.findAll();
}

async function get_daily_goal_by_id(id) {
    return DailyGoals.findByPk(id)
}

async function get_weekly_goal_by_id(id) {
    return WeeklyGoals.findByPk(id)
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

async function toggleState_dailyGoals(id) {
    let goal = await get_daily_goal_by_id(id);
    if (!goal) return;

    if (goal.status == 0) {
        goal.status = 1;
    } else if (goal.status == 1) {
        goal.status = 0;
    }

    await goal.save();
    return goal.status;
}

async function toggleState_weeklyGoals(id) {
    let goal = await get_weekly_goal_by_id(id);
    if (!goal) return;

    if (goal.status == 0) {
        goal.status = 1;
    } else if (goal.status == 1) {
        goal.status = 0;
    }

    await goal.save();
    return goal.status;
}

module.exports = {
    get_daily_goals,
    get_weekly_goals,
    delete_weekly_goal,
    delete_daily_goal,
    create_daily_goal,
    create_weekly_goal,
    toggleState_dailyGoals,
    toggleState_weeklyGoals
}