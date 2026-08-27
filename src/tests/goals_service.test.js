// tests/notes_service.test.js

const WeeklyGoals = require('../models/WeeklyGoals');
const DailyGoals  = require('../models/DailyGoals');

const {
    delete_weekly_goal,
    delete_daily_goal,
    create_daily_goal,
    create_weekly_goal,
} = require('../services/goals_service');


jest.mock('../models/WeeklyGoals');
jest.mock('../models/DailyGoals');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('create_daily_goal', () => {
    test('instancia DailyGoals com o valor e chama save', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        const fakeGoal = { id: 1, daily_goals: 'ler 30 min', save: saveMock };
        DailyGoals.mockImplementation(() => fakeGoal);

        const result = await create_daily_goal('ler 30 min');

        expect(saveMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(fakeGoal);
    });
});

describe('create_weekly_goal', () => {
    test('instancia WeeklyGoals com o valor e chama save', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        const fakeGoal = { id: 1, weekly_goals: 'terminar módulo', save: saveMock };

        WeeklyGoals.mockImplementation(() => fakeGoal);

        const result = await create_weekly_goal('terminar módulo');

        expect(saveMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(fakeGoal);
    });
});


describe('delete_daily_goal', () => {
    test('chama DailyGoals.destroy com o id correto', async () => {
        DailyGoals.destroy.mockResolvedValue(1);

        await delete_daily_goal(5);

        expect(DailyGoals.destroy).toHaveBeenCalledWith({ where: { id: 5 } });
    });
});

describe('delete_weekly_goal', () => {
    test('chama WeeklyGoals.destroy com o id correto', async () => {
        WeeklyGoals.destroy.mockResolvedValue(1);

        await delete_weekly_goal(3);

        expect(WeeklyGoals.destroy).toHaveBeenCalledWith({ where: { id: 3 } });
    });
});
