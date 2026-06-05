const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const WeeklyGoals = sequelize.define("WeeklyGoals", {
  weekly_goals: {
    type: DataTypes.TEXT,
    defaultValue: ""
  }
});

module.exports = WeeklyGoals;