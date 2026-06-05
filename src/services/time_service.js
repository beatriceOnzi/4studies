const TimeToday = require("../models/TimeToday");

async function get_time_today() {
    const today = getToday();

    return await TimeToday.findOne({
        where: { today }
    });
}

module.exports = { get_time_today }
