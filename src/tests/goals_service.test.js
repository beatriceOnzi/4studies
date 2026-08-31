// tests/goals_service.test.js

const WeeklyGoals = require('../models/WeeklyGoals');
const DailyGoals  = require('../models/DailyGoals');

const {
    delete_weekly_goal,
    delete_daily_goal,
    create_daily_goal,
    create_weekly_goal,
    toggleState_dailyGoals,
    toggleState_weeklyGoals
} = require('../services/goals_service');


jest.mock('../models/WeeklyGoals');
jest.mock('../models/DailyGoals');

beforeEach(() => {
    jest.resetAllMocks();
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


describe('toggleState_dailyGoals', () => {
    test('alterna status de 0 para 1', async () => {
        const mockGoal = {
            id: 1,
            status: 0,
            save: jest.fn().mockResolvedValue(true),
        };

        DailyGoals.findByPk.mockResolvedValue(mockGoal);

        const result = await toggleState_dailyGoals(1);

        expect(mockGoal.status).toBe(1);
        expect(mockGoal.save).toHaveBeenCalledTimes(1);
        expect(result).toBe(1);
    });

    test('alterna status de 1 para 0', async () => {
        const mockGoal = {
            id: 1,
            status: 1,
            save: jest.fn().mockResolvedValue(true),
        };

        DailyGoals.findByPk.mockResolvedValue(mockGoal);

        const result = await toggleState_dailyGoals(1);

        expect(mockGoal.status).toBe(0);
        expect(mockGoal.save).toHaveBeenCalledTimes(1);
        expect(result).toBe(0);
    });

    test('chama save exatamente uma vez', async () => {
        const mockGoal = {
            id: 1,
            status: 0,
            save: jest.fn().mockResolvedValue(true),
        };

        DailyGoals.findByPk.mockResolvedValue(mockGoal);

        await toggleState_dailyGoals(1);

        expect(mockGoal.save).toHaveBeenCalledTimes(1);
    });
});


describe('toggleState_weeklyGoals', () => {
    test('alterna status de 0 para 1', async () => {
        const mockGoal = {
            id: 1,
            status: 0,
            save: jest.fn().mockResolvedValue(true),
        };

        WeeklyGoals.findByPk.mockResolvedValue(mockGoal);

        const result = await toggleState_weeklyGoals(1);

        expect(mockGoal.status).toBe(1);
        expect(mockGoal.save).toHaveBeenCalledTimes(1);
        expect(result).toBe(1);
    });

    test('alterna status de 1 para 0', async () => {
        const mockGoal = {
            id: 1,
            status: 1,
            save: jest.fn().mockResolvedValue(true),
        };

        WeeklyGoals.findByPk.mockResolvedValue(mockGoal);

        const result = await toggleState_weeklyGoals(1);

        expect(mockGoal.status).toBe(0);
        expect(mockGoal.save).toHaveBeenCalledTimes(1);
        expect(result).toBe(0);
    });

    test('chama save exatamente uma vez', async () => {
        const mockGoal = {
            id: 1,
            status: 0,
            save: jest.fn().mockResolvedValue(true),
        };

        WeeklyGoals.findByPk.mockResolvedValue(mockGoal);

        await toggleState_weeklyGoals(1);

        expect(mockGoal.save).toHaveBeenCalledTimes(1);
    });
});