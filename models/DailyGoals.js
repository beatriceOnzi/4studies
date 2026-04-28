const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const DailyGoals = sequelize.define("DailyGoals", {
  daily_goals: {
    type: DataTypes.TEXT,
    defaultValue: ""
  }
});

module.exports = DailyGoals;