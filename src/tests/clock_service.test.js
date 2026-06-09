// tests/clock_service.test.js
// Testes do clock_service — funções de negócio do relógio de estudos

const ClockIn    = require('../models/ClockIn');
const TimeToday  = require('../models/TimeToday');
const TotalHours = require('../models/TotalHours');

const {
    is_running,
    create_clock_in,
    save_clock_out,
    add_ms_to_TotalHours,
    add_ms_to_TimeToday,
    get_time_today,
    getToday,
    checkIfIsFirstClockIn,
    createTimeToday,
    getStudyToday,
    msToHours,
    create_total_hours_if_needed,
} = require('../services/clock_service');

jest.mock('../models/ClockIn');
jest.mock('../models/TimeToday');
jest.mock('../models/TotalHours');

// Limpa todos os mocks entre os testes
beforeEach(() => {
    jest.clearAllMocks();
});

// ─────────────────────────────────────────────
// is_running
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// create_clock_in
// ─────────────────────────────────────────────
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

    test('passa o timestamp fornecido para clockInTS', async () => {
        const timestamp = 9999999;
        ClockIn.create.mockResolvedValue({ clockInTS: timestamp, clockOutTS: null, day: getToday() });

        const result = await create_clock_in(timestamp);
        expect(result.clockInTS).toBe(timestamp);
    });
});

// ─────────────────────────────────────────────
// save_clock_out
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// add_ms_to_TimeToday
// ─────────────────────────────────────────────
describe('add_ms_to_TimeToday', () => {
    test('soma os milissegundos no registro do dia', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        const fakeRecord = { timeInMsToday: 100, today: getToday(), save: saveMock };

        TimeToday.findOne.mockResolvedValue(fakeRecord);

        await add_ms_to_TimeToday(50);

        expect(fakeRecord.timeInMsToday).toBe(150);
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

// ─────────────────────────────────────────────
// add_ms_to_TotalHours
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// get_time_today
// ─────────────────────────────────────────────
describe('get_time_today', () => {
    test('retorna o registro do dia atual', async () => {
        const today = getToday();
        const fakeRecord = { timeInMsToday: 300, today };

        TimeToday.findOne.mockResolvedValue(fakeRecord);

        const result = await get_time_today();

        expect(result).toEqual(fakeRecord);
        expect(TimeToday.findOne).toHaveBeenCalledWith({ where: { today } });
    });

    test('retorna null se não há registro para hoje', async () => {
        TimeToday.findOne.mockResolvedValue(null);
        const result = await get_time_today();
        expect(result).toBeNull();
    });
});

// ─────────────────────────────────────────────
// getStudyToday
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// checkIfIsFirstClockIn
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// createTimeToday
// ─────────────────────────────────────────────
describe('createTimeToday', () => {
    test('chama TimeToday.create uma vez', async () => {
        TimeToday.create.mockResolvedValue({ timeInMsToday: 0 });
        await createTimeToday();
        expect(TimeToday.create).toHaveBeenCalledTimes(1);
        expect(TimeToday.create).toHaveBeenCalledWith({});
    });
});

// ─────────────────────────────────────────────
// create_total_hours_if_needed
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// getToday
// ─────────────────────────────────────────────
describe('getToday', () => {
    test('retorna uma string no formato YYYY-MM-DD', () => {
        const result = getToday();
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

// ─────────────────────────────────────────────
// msToHours
// ─────────────────────────────────────────────
describe('msToHours', () => {
    test('converte 0ms em 00:00:00', () => {
        expect(msToHours(0)).toBe('00:00:00');
    });

    test('converte 1000ms em 00:00:01', () => {
        expect(msToHours(1000)).toBe('00:00:01');
    });

    test('converte 60000ms em 00:01:00', () => {
        expect(msToHours(60000)).toBe('00:01:00');
    });

    test('converte 3600000ms em 01:00:00', () => {
        expect(msToHours(3600000)).toBe('01:00:00');
    });

    test('converte 3661000ms em 01:01:01', () => {
        expect(msToHours(3661000)).toBe('01:01:01');
    });

    test('preenche horas com zero à esquerda quando < 10', () => {
        expect(msToHours(7200000)).toBe('02:00:00');
    });

    test('lida com valores grandes (10h)', () => {
        expect(msToHours(36000000)).toBe('10:00:00');
    });
});
