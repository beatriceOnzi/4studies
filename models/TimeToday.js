const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const TimeToday = sequelize.define("TimeToday", {
  timeInMsToday: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  today: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
});

module.exports = TimeToday;