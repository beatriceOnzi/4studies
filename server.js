const express = require("express");
const handlebars = require('express-handlebars');
const path = require("path");
const sequelize = require("./database.js");

const notes_routes = require("./routes/notes");
const clock_routes = require("./routes/clock.js");

const TimeWeek = require("./models/TimeWeek");
const TimeToday = require("./models/TimeToday");
const TotalHours = require("./models/TotalHours");

// const { notDeepEqual } = require("assert");

sequelize.sync();
module.exports = sequelize;

const app = express();

//config
    //body parser
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    //template engine
    app.engine("handlebars", handlebars.engine({ 
      defaultLayout: "main",
      runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
      }
    }));
    app.set("view engine", "handlebars");
    app.set("views", path.join(__dirname, "views"));

    app.use(express.static(path.join(__dirname, "public")));

// routes
  // imported routes
    app.use('/notes', notes_routes)
    app.use(clock_routes)


app.listen(1805, ()=>{
  console.log("Running on http://localhost:1805");
});
