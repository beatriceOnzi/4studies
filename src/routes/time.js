const express = require('express');
const router = express.Router();

const { get_data } = require("../services/page_service")

router.get("/time", async (req, res) => {
    const data = get_data()

    res.status(200).render("time", {
        timeNav: 1,
        totalHours: data.total_hours,
        hoursCompleted: data.hoursCompleted
    });
})


module.exports = router;