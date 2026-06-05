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
  },
  lastClockIn: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
  
  // last clock in = 0 -> timer está parado = "Start"
  // last clock in > 0 -> tempo está correndo "Stop"
});

module.exports = TimeToday;