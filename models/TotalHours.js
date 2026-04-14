const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const TotalHours = sequelize.define("TotalHous", {
  totalHoursCompletedInMs: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  goalHoursInMs: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = TotalHours;