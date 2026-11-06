// tests/time_service.test.js

jest.mock('../models/TotalHours');
jest.mock('../services/clock_service', () => ({ get_total_hours: jest.fn() }));

const TotalHours   = require('../models/TotalHours');
const clockService = require('../services/clock_service');

const {
    get_totalHours,
    get_goal_hours,
    get_hours_completed,
    msToHours,
    msToOnlyHours
} = require('../services/time_service');

beforeEach(() => {
    jest.resetAllMocks();
});

function setupDefaultMocks() {
    TotalHours.findOne.mockResolvedValue({ totalHoursCompletedInMs: 60000, goalHoursInMs: 3600000 });
    clockService.get_total_hours.mockResolvedValue({ totalHoursCompletedInMs: 60000, goalHoursInMs: 3600000 });
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

    test('get_hours_completed usa o total recalculado, não o valor salvo no banco', async () => {
        // valor "velho" salvo no banco: 1 min. Total recalculado a partir dos ClockIn: 2 min.
        TotalHours.findOne.mockResolvedValue({ totalHoursCompletedInMs: 60000, goalHoursInMs: 3600000 });
        clockService.get_total_hours.mockResolvedValue({ totalHoursCompletedInMs: 120000, goalHoursInMs: 3600000 });

        const hours_completed = await get_hours_completed()

        expect(clockService.get_total_hours).toHaveBeenCalledTimes(1);
        expect(hours_completed).toEqual('00:02:00')
    });

    test('get_goal_hours', async () => {
        setupDefaultMocks();

        const goal_hours = await get_goal_hours()

        expect(goal_hours).toEqual('01')
    });
});


describe('msToHours', () => {
    test('converts 0ms to 00:00:00', () => {
        expect(msToHours(0)).toBe('00:00:00');
    });

    test('converts 1000ms to 00:00:01', () => {
        expect(msToHours(1000)).toBe('00:00:01');
    });

    test('preenche horas com zero à esquerda quando < 10', () => {
        expect(msToHours(7200000)).toBe('02:00:00');
    });

    test('lida com valores grandes (10h)', () => {
        expect(msToHours(36000000)).toBe('10:00:00');
    });
});


describe('msToOnlyHours', () => {
    test('retorna só as horas com dois dígitos', () => {
        expect(msToOnlyHours(3600000)).toBe('01');
        expect(msToOnlyHours(36000000)).toBe('10');
    });
});
