const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const TimeToday = sequelize.define("TimeToday", {
  timeInMsToday: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  today: {
    type: DataTypes.DATEONLY,
    defaultValue: () => new Date().toISOString().split('T')[0]
  }
});

module.exports = TimeToday;