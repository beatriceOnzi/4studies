const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const TimeWeek = sequelize.define("TimeWeek", {
  timeInMsThisWeek: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  today: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
});

module.exports = TimeWeek;