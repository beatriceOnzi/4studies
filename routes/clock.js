const express = require('express');
const router = express.Router();

const TimeToday = require("../models/TimeToday");
const TimeWeek = require("../models/TimeWeek");
const TotalHours = require("../models/TotalHours");

// -- Routes --
router.get("/", (req, res) => {
  res.render("clock", { clock: 1});
});


// -- Helper Functions --
async function checkIfIsFirstClockIn() {
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    study_today = await TimeToday.findOne({ where: { today: today } })

    if (study_today) {
        return false;
    }
    return true;
}

function getToday(){
    const date = new Intl.DateTimeFormat('en-CA').format(new Date());
    return today;
}

module.exports = router;
