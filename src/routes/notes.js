const express = require('express');
const router = express.Router();

const Notes = require("../models/Notes");
const WeeklyGoals = require("../models/WeeklyGoals");
const DailyGoals = require("../models/DailyGoals");

// -- Daily Goals --

router.get("/daily_goals", (req, res) => {
  Notes.findByPk(1).then((notes) => {
    DailyGoals.findAll().then((goals) => {
        res.render("notes", { notes: notes, goals: goals, daily_goals_selected: 1});
    })
  }).catch((e) => {
      console.log(e)
  })

});

router.post("/daily_goals/new", async (req, res) => {
  const newDailyGoal = await new DailyGoals({
        daily_goals: req.body.value
    });
  await newDailyGoal.save();

  res.json(newDailyGoal);
});

router.delete("/daily_goals/:id", async (req, res) => {
  await DailyGoals.destroy({
        where: {
            id: req.params.id
        }
    });
});

// -- Weekly Goals --

router.get("/weekly_goals", (req, res) => {
  Notes.findByPk(1).then((notes) => {
    WeeklyGoals.findAll().then((goals) => {
        res.render("notes", { notes: notes, goals: goals, weekly_goals_selected: 1});
    })
  }).catch((e) => {
      console.log(e);
  })
});

router.post("/weekly_goals/new", async (req, res) => {
  const newWeeklyGoal = await new WeeklyGoals({
        weekly_goals: req.body.value
    });
  await newWeeklyGoal.save();

  res.json(newWeeklyGoal);
});

router.delete("/weekly_goals/:id", async (req, res) => {
  await WeeklyGoals.destroy({
        where: {
            id: req.params.id
        }
    });
});

// -- Notes --

router.post("/save", async (req, res) => {
  const notes = await Notes.findByPk(1)
  if (notes.note){
    notes.note= ""
  }
  
  notes.note = req.body.notes

  await notes.save();

  res.json(notes);
});

module.exports = router