const express = require('express');
const router = express.Router();

const {
  load_page,
  get_notes,
  create_notes,
  delete_weekly_goal,
  delete_daily_goal,
  create_weekly_goal,
  create_daily_goal,
} = require("../services/notes_service");

// -- Daily Goals --

router.get("/daily_goals", async (req, res) => {
  let notes = await get_notes()
  if (notes == null){
    notes = await create_notes()
  }
  daily_page_data = await load_page("daily")
  res.render("notes", { notes: daily_page_data.notes, goals: daily_page_data.goals, daily_goals_selected: 1});

});

router.post("/daily_goals/new", async (req, res) => {
  const newDailyGoal = await create_daily_goal(req.body.value)
  res.json(newDailyGoal);
});

router.delete("/daily_goals/:id", async (req, res) => {
  delete_daily_goal(req.params.id)
});

// -- Weekly Goals --

router.get("/weekly_goals", async (req, res) => {
  let notes = await get_notes()
  if (!notes){
    notes = await create_notes();
  }
  weekly_page_data = await load_page("weekly")
  res.render("notes", { notes: weekly_page_data.notes, goals: weekly_page_data.goals, weekly_goals_selected: 1});

});

router.post("/weekly_goals/new", async (req, res) => {
  const newWeeklyGoal = await create_weekly_goal(req.body.value)
  res.json(newWeeklyGoal);
});

router.delete("/weekly_goals/:id", async (req, res) => {
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