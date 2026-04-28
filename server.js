const express = require("express");
const handlebars = require('express-handlebars');
const path = require("path");
const sequelize = require("./database.js");

const Notes = require("./models/Notes");
const WeeklyGoals = require("./models/WeeklyGoals");
const DailyGoals = require("./models/DailyGoals");
const TimeWeek = require("./models/TimeWeek");
const TimeToday = require("./models/TimeToday");
const TotalHours = require("./models/TotalHours");

const add_stuff = require("./models/add_stuff.js");
const { notDeepEqual } = require("assert");

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

app.get("/", (req, res) => {
  res.render("home", { home: 1});
});

app.get("/notes", (req, res) => {
  Notes.findAll().then((notes) => {
    DailyGoals.findAll().then((goals) => {
        res.render("notes", { notes: notes, goals: goals, daily_goals_selected: 1});
    })
  }).catch((e) => {
      console.log(e)
  })
});

app.get("/notes/weekly_goals", (req, res) => {
  Notes.findAll().then((notes) => {
    WeeklyGoals.findAll().then((goals) => {
        res.render("notes", { notes: notes, goals: goals, weekly_goals_selected: 1});
    })
  }).catch((e) => {
      console.log(e)
  })
});

app.get("/time", (req, res) => {
  res.render("home", { time: 1});
});

// app.get("/api/data", async (req,res)=>{
//   const data = await getData();
//   res.json(data);
// });

// app.post("/api/tasks", async (req,res)=>{
//   const data = await getData();
//   data.tasks = req.body.tasks;
//   await data.save();
//   res.sendStatus(200);
// });

// app.post("/api/notes", async (req,res)=>{
//   const data = await getData();
//   data.notes = req.body.text;
//   await data.save();
//   res.sendStatus(200);
// });

app.listen(3000, ()=>{
  console.log("Running on http://localhost:3000");
});
