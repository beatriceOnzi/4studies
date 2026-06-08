const sequelize = require("./database.js");
const app = require("./app.js");

require("./models/TimeWeek");
require("./models/TimeToday");
require("./models/TotalHours");

sequelize.sync().then(() => {
  app.listen(1805, () => {
    console.log("Running on http://localhost:1805");
  });
});