const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Notes = sequelize.define("Notes", {
  title: {
    type: DataTypes.TEXT,
    defaultValue: ""
  },
  note: {
    type: DataTypes.TEXT,
    defaultValue: ""
  }
});

module.exports = Notes;