const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const DailyGoals = sequelize.define("DailyGoals", {
  daily_goals: {
    type: DataTypes.TEXT,
    defaultValue: ""
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = DailyGoals;