const express = require('express');
const router = express.Router();

const {
  delete_weekly_goal,
  delete_daily_goal,
  create_weekly_goal,
  create_daily_goal,
  toggleState_dailyGoals,
  toggleState_weeklyGoals,
} = require("../services/goals_service");

const {
  get_notes,
  create_notes,
  save_notes
} = require("../services/notes_service");


// -- Daily Goals --

router.post("/daily_goals/new", async (req, res) => {
  const newDailyGoal = await create_daily_goal(req.body.value)
  res.json(newDailyGoal);
});

router.post("/daily_goals/switch/:id", async (req, res) => {
  const new_state = await toggleState_dailyGoals(req.params.id)
  res.json(new_state);
});

router.delete("/daily_goals/:id", async (req, res) => {
  delete_daily_goal(req.params.id)
});


// -- Weekly Goals --

router.post("/weekly_goals/new", async (req, res) => {
  const newWeeklyGoal = await create_weekly_goal(req.body.value)
  res.json(newWeeklyGoal);
});

router.post("/weekly_goals/switch/:id", async (req, res) => {
  const new_state = await toggleState_weeklyGoals(req.params.id)
  res.json(new_state);
});

router.delete("/weekly_goals/:id", async (req, res) => {
  delete_weekly_goal(req.params.id)
});

// -- Notes --

router.post("/notes/save", async (req, res) => {
  const notes = await save_notes(req.body.notes);

  res.json(notes);
});

// implement list of notes
router.get("/notes/new", async (req, res) => {
});

router.delete("/notes/:id", async (req, res) => {
});

module.exports = router