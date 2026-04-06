const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Goals = sequelize.define("Goals", {
  daily_goals: {
    type: DataTypes.TEXT,
    defaultValue: ""
  },
  weekly_goals: {
    type: DataTypes.TEXT,
    defaultValue: ""
  }
});

module.exports = Goals;