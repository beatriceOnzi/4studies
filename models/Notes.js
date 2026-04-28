const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Notes = sequelize.define("Notes", {
  note: {
    type: DataTypes.TEXT,
    defaultValue: ""
  }
});

module.exports = Notes;