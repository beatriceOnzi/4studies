const express = require('express');
const router = express.Router();

const { get_data } = require("../services/page_service")

router.get("/time", async (req, res) => {
    const data = get_data()

    res.render("time", {
        timeNav: 1,
        totalHours: total_hours,
        hoursCompleted: hoursCompleted
    });
})


module.exports = router;