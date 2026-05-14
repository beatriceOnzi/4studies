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

app.get("/", (req, res) => {
  res.render("home", { home: 1});
});

// -- Daily Goals --

app.get("/notes/daily_goals", (req, res) => {
  Notes.findByPk(1).then((notes) => {
    DailyGoals.findAll().then((goals) => {
        res.render("notes", { notes: notes, goals: goals, daily_goals_selected: 1});
    })
  }).catch((e) => {
      console.log(e)
  })
});

app.post("/notes/daily_goals/new", async (req, res) => {
  const newDailyGoal = await new DailyGoals({
        daily_goals: req.body.value
    });
  await newDailyGoal.save();

  res.json(newDailyGoal);
});

app.delete("/notes/daily_goals/:id", async (req, res) => {
  await DailyGoals.destroy({
        where: {
            id: req.params.id
        }
    });
});

// -- Weekly Goals --

app.get("/notes/weekly_goals", (req, res) => {
  Notes.findByPk(1).then((notes) => {
    WeeklyGoals.findAll().then((goals) => {
        res.render("notes", { notes: notes, goals: goals, weekly_goals_selected: 1});
    })
  }).catch((e) => {
      console.log(e);
  })
});

app.post("/notes/weekly_goals/new", async (req, res) => {
  const newWeeklyGoal = await new WeeklyGoals({
        weekly_goals: req.body.value
    });
  await newWeeklyGoal.save();

  res.json(newWeeklyGoal);
});

app.delete("/notes/weekly_goals/:id", async (req, res) => {
  await WeeklyGoals.destroy({
        where: {
            id: req.params.id
        }
    });
});

// -- Notes --
app.post("/notes/save", async (req, res) => {
  const notes = await Notes.findByPk(1)
  notes.note = req.body.notes

  await notes.save();

  res.json(notes);
});

app.get("/time", (req, res) => {
  res.render("home", { time: 1});
});

app.listen(3000, ()=>{
  console.log("Running on http://localhost:3000");
});
