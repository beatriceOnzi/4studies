// tests/clock.test.js

const ClockIn = require('../models/ClockIn');
const TimeToday = require('../models/TimeToday');
const TotalHours = require('../models/TotalHours');

const {
    is_running,
    create_clock_in,
    save_clock_out,
    add_ms_to_TotalHours,
    add_ms_to_TimeToday,
    get_time_today,
    getToday
} = require('../services/clock_service');

jest.mock('../models/ClockIn');
jest.mock('../models/TimeToday');
jest.mock('../models/TotalHours');


describe('is_running', () => {

    test('deve retornar true quando existe clockIn e não existe clockOut', async () => {

        ClockIn.findOne.mockResolvedValue({
            clockInTS: new Date(),
            clockOutTS: null
        });

        const result = await is_running();

        expect(result).toBe(true);
    });

    test('deve retornar false quando existe clockOut', async () => {

        ClockIn.findOne.mockResolvedValue({
            clockInTS: new Date(),
            clockOutTS: new Date()
        });

        const result = await is_running();

        expect(result).toBe(false);
    });

    test('deve retornar false quando não existe clockIn nem clockOut', async () => {

        ClockIn.findOne.mockResolvedValue({
            clockInTS: null,
            clockOutTS: null
        });

        const result = await is_running();

        expect(result).toBe(false);
    });

});

describe('create_clock_in', () => {

    test('deve criar um clock in com clockOutTS nulo', async () => {

        const timestamp = 123456;
        const today = getToday()

        ClockIn.create.mockResolvedValue({
            clockInTS: timestamp,
            clockOutTS: null,
            day: today
        });

        const result = await create_clock_in(timestamp);

        expect(ClockIn.create).toHaveBeenCalledWith({
            clockInTS: timestamp,
            clockOutTS: null,
            day: today
        });

        expect(result.clockOutTS).toBeNull();
        expect(result.day).toBe(today);
    });

});



describe('save_clock_out', () => {

    test('deve buscar o último registro', async () => {
        ClockIn.findOne.mockResolvedValue({
            clockInTS: 1780693714,
            clockOutTS: null,
            save: jest.fn()
        });

        await save_clock_out(1780699999);

        expect(ClockIn.findOne).toHaveBeenCalledWith({
            order: [['createdAt', 'DESC']]
        });
    });

    test('salvar o timestamp em clockout no ultimo registro de ClockIn', async () => {

        const saveMock = jest.fn();

        const fakeRecord = {
            clockInTS: 1780693714,
            clockOutTS: null,
            save: saveMock
        };

        ClockIn.findOne.mockResolvedValue(fakeRecord);

        await save_clock_out(1780699999);

        expect(fakeRecord.clockOutTS).toBe(1780699999);

        expect(saveMock).toHaveBeenCalled();
    });


    test('retornar "o ultimo registro já possiu um clockOut"', async () => {
        const saveMock = jest.fn();

        const fakeRecord = {
            clockInTS: 1780693714,
            clockOutTS: 1780699999,
            save: saveMock
        };
        const response = await save_clock_out(1780699999);

        expect(response).toBe('o ultimo registro já possiu um clockOut');
        
    });


});

describe('add_ms_to_TimeToday', () => {

    test('deve somar milisegundos no registro do dia correto', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);

        const fakeRecord = {
            timeInMsToday: 100,
            today: getToday(),
            save: saveMock,
        };

        TimeToday.findOne.mockResolvedValue(fakeRecord);

        await add_ms_to_TimeToday(100);

        expect(TimeToday.findOne).toHaveBeenCalledTimes(1);
        expect(fakeRecord.timeInMsToday).toBe(200);
        expect(saveMock).toHaveBeenCalledTimes(1);
    });
});

describe('add_ms_to_TotalHours', () => {
    test('salvar milisegundos em TotalHours', async () => { // unfinshed

        const fakeRecord = {
            totalHoursCompletedInMs: 100,
            goalHoursInMs: 500,
            save: jest.fn().mockResolvedValue(true),
        };

        TotalHours.findOne.mockResolvedValue(fakeRecord);

        await add_ms_to_TotalHours(100);

        expect(TotalHours.findOne).toHaveBeenCalledTimes(1);
        expect(fakeRecord.totalHoursCompletedInMs).toBe(200);
    });

})