const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const ClockIn = sequelize.define("ClockIn", {
  clockInTS: {
    type: DataTypes.INTEGER
  },
  clockOutTS: {
    type: DataTypes.INTEGER
  },
  day: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
});

module.exports = ClockIn;