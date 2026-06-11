const express = require('express');
const router = express.Router();

const { get_data } = require("../services/page_service")

const {
  get_notes,
  create_notes,
  delete_weekly_goal,
  delete_daily_goal,
  create_weekly_goal,
  create_daily_goal,
} = require("../services/notes_service");

// -- Daily Goals --

router.get("/daily_goals", async (req, res) => { // untested
  let notes = await get_notes()
  if (notes == null){
    notes = await create_notes()
  }
  data = await get_data()
  res.render("index", {data: data});

});

router.post("/daily_goals/new", async (req, res) => {
  const newDailyGoal = await create_daily_goal(req.body.value)
  res.json(newDailyGoal);
});

router.delete("/daily_goals/:id", async (req, res) => { // untested
  delete_daily_goal(req.params.id)
});

// -- Weekly Goals --

router.get("/weekly_goals", async (req, res) => { // untested
  let notes = await get_notes()
  if (!notes){
    notes = await create_notes();
  }
  data = await get_data()
  res.render("index", {data: data});
});

router.post("/weekly_goals/new", async (req, res) => {
  const newWeeklyGoal = await create_weekly_goal(req.body.value)
  res.json(newWeeklyGoal);
});

router.delete("/weekly_goals/:id", async (req, res) => { // untested
  delete_weekly_goal(req.params.id)
});

// -- Notes --

router.post("/save", async (req, res) => {
  let notes = await get_notes()
  if (!notes.note){
    notes.note= ""
  }
  notes.note = req.body.notes

  await notes.save();

  res.json(notes);
});

module.exports = router