// tests/clock_service.test.js

const ClockIn    = require('../models/ClockIn');
const TimeToday  = require('../models/TimeToday');
const TotalHours = require('../models/TotalHours');

const { msToHours } = require("../services/time_service")

const {
    is_running,
    create_clock_in,
    save_clock_out,
    add_ms_to_TotalHours,
    add_ms_to_TimeToday,
    remove_ms_from_TimeToday,
    get_time_today,
    getToday,
    checkIfIsFirstClockIn,
    createTimeToday,
    getStudyToday,
    create_total_hours_if_needed,
    createTimeToday_by_day,
    get_time_today_by_day,
    get_clockIns,
    edit_clockIn
} = require('../services/clock_service');

jest.mock('../models/ClockIn');
jest.mock('../models/TimeToday');
jest.mock('../models/TotalHours');

beforeEach(() => {
    jest.clearAllMocks();
});

function setupMocks() {
    ClockIn.create.mockResolvedValue({ clockInTS: 1000, clockOutTS: null, day: '2026-08-27' });
    ClockIn.create.mockResolvedValue({ clockInTS: 1000, clockOutTS: 100, day: '2026-08-27' });

    TotalHours.create.mockResolvedValue({ goalHoursInMs: 100 });

    TimeToday.create.mockResolvedValue({ timeInMsToday: 0 });
}

describe('is_running', () => {
    test('retorna true quando existe clockIn e NÃO existe clockOut', async () => {
        ClockIn.findOne.mockResolvedValue({ clockInTS: Date.now(), clockOutTS: null });
        expect(await is_running()).toBe(true);
    });

    test('retorna false quando clockOut está preenchido', async () => {
        ClockIn.findOne.mockResolvedValue({ clockInTS: Date.now(), clockOutTS: Date.now() });
        expect(await is_running()).toBe(false);
    });

    test('retorna false quando clockIn é null', async () => {
        ClockIn.findOne.mockResolvedValue({ clockInTS: null, clockOutTS: null });
        expect(await is_running()).toBe(false);
    });

    test('retorna false quando não existe nenhum registro', async () => {
        ClockIn.findOne.mockResolvedValue(null);
        expect(await is_running()).toBe(false);
    });
});


describe('create_clock_in', () => {
    test('cria registro com clockOutTS nulo e day = hoje', async () => {
        const timestamp = 123456;
        const today = getToday();

        ClockIn.create.mockResolvedValue({ clockInTS: timestamp, clockOutTS: null, day: today });

        const result = await create_clock_in(timestamp);

        expect(ClockIn.create).toHaveBeenCalledWith({
            clockInTS: timestamp,
            clockOutTS: null,
            day: today,
        });
        expect(result.clockOutTS).toBeNull();
        expect(result.day).toBe(today);
    });

    test('cria registro com clockOutTS nulo e day = day fornecido', async () => {
        const timestamp = 123456;
        const today = "2026-08-27";

        ClockIn.create.mockResolvedValue({ clockInTS: timestamp, clockOutTS: null, day: today });

        const result = await create_clock_in(timestamp);

        expect(ClockIn.create).toHaveBeenCalledWith({
            clockInTS: timestamp,
            clockOutTS: null,
            day: today,
        });
        expect(result.clockOutTS).toBeNull();
        expect(result.day).toBe(today);
    });

    test('passa o timestamp fornecido para clockInTS', async () => {
        const timestamp = 9999999;
        ClockIn.create.mockResolvedValue({ clockInTS: timestamp, clockOutTS: null, day: getToday() });

        const result = await create_clock_in(timestamp);
        expect(result.clockInTS).toBe(timestamp);
    });
});

describe('get_clockIns', () => {
    test('Gets all clockIns registered', async () => {
        const timestamp = 1782345876;
        const today = getToday();

        ClockIn.findAll.mockResolvedValue([
            {
                clockInTS: timestamp,
                clockOutTS: null,
                day: today
            }
        ]);

        const result = await get_clockIns();

        expect(result).toHaveLength(1);
        expect(result[0].clockInTS).toBe(timestamp);
        expect(result[0].clockOutTS).toBeNull();
        expect(result[0].day).toBe(today);
    });
})


describe('save_clock_out', () => {
    test('busca o último registro por ordem decrescente de createdAt', async () => {
        ClockIn.findOne.mockResolvedValue({
            clockInTS: 100,
            clockOutTS: null,
            save: jest.fn(),
        });

        await save_clock_out(200);

        expect(ClockIn.findOne).toHaveBeenCalledWith({ order: [['createdAt', 'DESC']] });
    });

    test('salva o timestamp no campo clockOutTS do último registro', async () => {
        const saveMock = jest.fn();
        const fakeRecord = { clockInTS: 100, clockOutTS: null, save: saveMock };

        ClockIn.findOne.mockResolvedValue(fakeRecord);

        await save_clock_out(999);

        expect(fakeRecord.clockOutTS).toBe(999);
        expect(saveMock).toHaveBeenCalledTimes(1);
    });

    test('retorna mensagem de aviso se clockOut já existe', async () => {
        ClockIn.findOne.mockResolvedValue({
            clockInTS: 100,
            clockOutTS: 200,
            save: jest.fn(),
        });

        const result = await save_clock_out(300);

        expect(result).toBe('o ultimo registro já possiu um clockOut');
    });

    test('NÃO chama save quando clockOut já existe', async () => {
        const saveMock = jest.fn();
        ClockIn.findOne.mockResolvedValue({
            clockInTS: 100,
            clockOutTS: 200,
            save: saveMock,
        });

        await save_clock_out(300);

        expect(saveMock).not.toHaveBeenCalled();
    });
});


describe('add_ms_to_TimeToday', () => {
    test('soma os milissegundos no registro do dia', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        const fakeRecord = { timeInMsToday: 100, today: getToday(), save: saveMock };

        TimeToday.findOne.mockResolvedValue(fakeRecord);

        await add_ms_to_TimeToday(undefined, 50);

        expect(fakeRecord.timeInMsToday).toBe(150);
        expect(saveMock).toHaveBeenCalledTimes(1);
    });

    test('add milisseconds from time today when in different day', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        const day = '2026-08-27'
        const fakeRecord = { timeInMsToday: 100, today: day, save: saveMock };

        TimeToday.findOne.mockResolvedValue(fakeRecord);

        await add_ms_to_TimeToday(day, 50);

        expect(fakeRecord.timeInMsToday).toBe(150);
        expect(saveMock).toHaveBeenCalledTimes(1);
    });

    test('remove milisseconds from time today in the same day', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        const fakeRecord = { timeInMsToday: 100, today: getToday(), save: saveMock };

        TimeToday.findOne.mockResolvedValue(fakeRecord);

        await remove_ms_from_TimeToday(undefined, 50);

        expect(fakeRecord.timeInMsToday).toBe(50);
        expect(saveMock).toHaveBeenCalledTimes(1);
    });

    test('remove milisseconds from time today when in different day', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        const day = '2026-08-27'
        const fakeRecord = { timeInMsToday: 100, today: day, save: saveMock };

        TimeToday.findOne.mockResolvedValue(fakeRecord);

        await remove_ms_from_TimeToday(day, 50);

        expect(fakeRecord.timeInMsToday).toBe(50);
        expect(saveMock).toHaveBeenCalledTimes(1);
    });

    test('chama TimeToday.findOne exatamente uma vez', async () => {
        TimeToday.findOne.mockResolvedValue({
            timeInMsToday: 0,
            today: getToday(),
            save: jest.fn(),
        });

        await add_ms_to_TimeToday(10);

        expect(TimeToday.findOne).toHaveBeenCalledTimes(1);
    });
    
});


describe('add_ms_to_TotalHours', () => {
    test('soma os milissegundos em totalHoursCompletedInMs', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        const fakeRecord = { totalHoursCompletedInMs: 100, goalHoursInMs: 500, save: saveMock };

        TotalHours.findOne.mockResolvedValue(fakeRecord);

        await add_ms_to_TotalHours(100);

        expect(fakeRecord.totalHoursCompletedInMs).toBe(200);
        expect(saveMock).toHaveBeenCalledTimes(1);
    });
});


describe('get_time_today', () => {
    test('retorna o registro do dia atual', async () => {
        const today = getToday();
        const fakeRecord = { timeInMsToday: 300, today };

        TimeToday.findOne.mockResolvedValue(fakeRecord);

        const result = await get_time_today();

        expect(result).toEqual(fakeRecord);
        expect(TimeToday.findOne).toHaveBeenCalledWith({ where: { today } });
    });

    test('retorna o registro do dia fornecido', async () => {
        const today = '2026-08-27'
        const fakeRecord = { timeInMsToday: 300, today };

        TimeToday.findOne.mockResolvedValue(fakeRecord);

        const result = await get_time_today_by_day(today);

        expect(result).toEqual(fakeRecord);
        expect(TimeToday.findOne).toHaveBeenCalledWith({ where: { today } });
    });
    test('cria TimeToday se today é null', async () => {
        const today = null
        const fakeRecord = { timeInMsToday: 300, today: today };

        TimeToday.findOne.mockResolvedValue(fakeRecord);

        const result = await get_time_today_by_day(today);

        expect(result).toEqual(fakeRecord);
        expect(TimeToday.findOne).toHaveBeenCalledWith({ where: { today } });
    });

    test('retorna null se não há registro para hoje', async () => {
        TimeToday.findOne.mockResolvedValue(null);
        const result = await get_time_today();
        expect(result).toBeNull();
    });
});


describe('getStudyToday', () => {
    test('retorna o registro de estudo de hoje', async () => {
        const today = getToday();
        const fakeRecord = { timeInMsToday: 500, today };

        TimeToday.findOne.mockResolvedValue(fakeRecord);

        const result = await getStudyToday();

        expect(result).toEqual(fakeRecord);
        expect(TimeToday.findOne).toHaveBeenCalledWith({ where: { today } });
    });
});


describe('checkIfIsFirstClockIn', () => {
    test('retorna true quando não existe registro de TimeToday para hoje', async () => {
        TimeToday.findOne.mockResolvedValue(null);
        expect(await checkIfIsFirstClockIn()).toBe(true);
    });

    test('retorna false quando já existe um registro de TimeToday para hoje', async () => {
        TimeToday.findOne.mockResolvedValue({ timeInMsToday: 0, today: getToday() });
        expect(await checkIfIsFirstClockIn()).toBe(false);
    });
});


describe('createTimeToday', () => {
    test('chama TimeToday.create uma vez', async () => {
        TimeToday.create.mockResolvedValue({ timeInMsToday: 0 });
        await createTimeToday();
        expect(TimeToday.create).toHaveBeenCalledTimes(1);
        expect(TimeToday.create).toHaveBeenCalledWith({});
    });
});


describe('create_total_hours_if_needed', () => {
    test('cria TotalHours quando não existe nenhum registro', async () => {
        TotalHours.findOne.mockResolvedValue(null);
        TotalHours.create.mockResolvedValue({ goalHoursInMs: 36000000000 });

        await create_total_hours_if_needed();

        expect(TotalHours.create).toHaveBeenCalledTimes(1);
    });

    test('NÃO cria TotalHours quando já existe um registro', async () => {
        TotalHours.findOne.mockResolvedValue({ totalHoursCompletedInMs: 0, goalHoursInMs: 36000000000 });

        await create_total_hours_if_needed();

        expect(TotalHours.create).not.toHaveBeenCalled();
    });
});


describe('getToday', () => {
    test('retorna uma string no formato YYYY-MM-DD', () => {
        const result = getToday();
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

// describe('editClockIn', () => {
//     test('edita um clockIn', async () => {
//         setupMocks()
        
//         const timestamp = 123456;
//         const today = '2026-08-27';
//         const new_timestamp = 100;

//         const result = ClockIn.create.mockResolvedValue({ clockInTS: timestamp, clockOutTS: 20000, day: today });

//         const data = await edit_clockIn(result.id, new_timestamp)

//         expect(data.clockInTS).toBe(100)

//     });
// });


describe('msToHours', () => {
    test('converte 0ms em 00:00:00', () => {
        expect(msToHours(0)).toBe('00:00:00');
    });

    test('converte 1000ms em 00:00:01', () => {
        expect(msToHours(1000)).toBe('00:00:01');
    });

    test('preenche horas com zero à esquerda quando < 10', () => {
        expect(msToHours(7200000)).toBe('02:00:00');
    });

    test('lida com valores grandes (10h)', () => {
        expect(msToHours(36000000)).toBe('10:00:00');
    });
});
