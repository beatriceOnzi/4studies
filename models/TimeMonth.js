const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const TimeMonth = sequelize.define("TimeMonth", {
  timeInMsThisMonth: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  today: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
});

module.exports = TimeMonth;