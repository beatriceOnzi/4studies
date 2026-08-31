// tests/time_service.test.js

const TotalHours = require('../models/TotalHours');

const { 
    get_totalHours,
    get_goal_hours,
    get_hours_completed,
    msToHours,
    msToOnlyHours
} = require('../services/time_service');

jest.mock('../models/TotalHours');

beforeEach(() => {
    jest.resetAllMocks();
});

function setupDefaultMocks() {
    TotalHours.findOne.mockResolvedValue({ totalHoursCompletedInMs: 60000, goalHoursInMs: 3600000 });
}


describe('get_totalHours', () => {
    test('get_totalHours', async () => {
        setupDefaultMocks();

        const total_hours = await get_totalHours()
        
        expect(total_hours.totalHoursCompletedInMs).toEqual(60000)
        expect(total_hours.goalHoursInMs).toEqual(3600000)
    });

    test('get_hours_completed', async () => {
        setupDefaultMocks();

        const hours_completed = await get_hours_completed()
        
        expect(hours_completed).toEqual('00:01:00')
    });

    test('get_goal_hours', async () => {
        setupDefaultMocks();

        const goal_hours = await get_goal_hours()
        
        expect(goal_hours).toEqual('01')
    });

});

