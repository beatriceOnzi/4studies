// tests/clock_service.test.js

jest.mock('../models/ClockIn');
jest.mock('../models/TimeToday');
jest.mock('../models/TotalHours');

const { Op } = require('sequelize');

const ClockIn    = require('../models/ClockIn');
const TimeToday  = require('../models/TimeToday');
const TotalHours = require('../models/TotalHours');

const {
    is_running,
    create_clock_in,
    save_clock_out,
    get_time_today,
    get_time_today_by_day,
    get_total_hours,
    getToday,
    checkIfIsFirstClockIn,
    createTimeToday,
    createTimeToday_by_day,
    create_total_hours_if_needed,
    get_clockIns,
    get_last_clock_in,
    delete_clockIn,
    edit_clockIn,
    edit_clockOut,
    get_new_data,
    set_formated_interval
} = require('../services/clock_service');

const HOUR = 60 * 60 * 1000;

// timestamp (ms) de um horário de Brasília (UTC-3): br('2026-11-05T23:00:00')
const br = (local) => new Date(`${local}-03:00`).getTime();

beforeEach(() => {
    jest.resetAllMocks();
});

afterEach(() => {
    jest.restoreAllMocks();
});

// ─── helpers ────────────────────────────────────────────────────────────────

// fixa o "agora" (getToday usa Date.now)
function freezeNow(ts) {
    jest.spyOn(Date, 'now').mockReturnValue(ts);
}

// sessões FECHADAS que "estão no banco": sessions([in, out], [in, out])
function sessions(...list) {
    ClockIn.findAll.mockResolvedValue(
        list.map(([clockInTS, clockOutTS]) => ({ clockInTS, clockOutTS }))
    );
}

// TimeToday "em memória": uma linha por dia, criada sob demanda
function fakeTimeTodayStore() {
    const store = {};
    const row = (day) => ({ timeInMsToday: 0, today: day, save: jest.fn().mockResolvedValue(true) });

    TimeToday.findOne.mockImplementation(async ({ where }) => store[where.today] ?? null);
    TimeToday.create.mockImplementation(async ({ today }) => (store[today] = row(today)));

    return store;
}

function fakeTotalHours(total = 0) {
    const record = {
        totalHoursCompletedInMs: total,
        goalHoursInMs: 1000,
        save: jest.fn().mockResolvedValue(true),
    };
    TotalHours.findOne.mockResolvedValue(record);
    return record;
}

// ─── getToday ───────────────────────────────────────────────────────────────

describe('getToday', () => {
    test('retorna uma string no formato YYYY-MM-DD', () => {
        expect(getToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('usa o fuso de Brasília, não UTC (22:30 local ainda é o mesmo dia)', () => {
        // 22:30 em Brasília = 01:30 UTC do dia seguinte
        freezeNow(br('2026-11-05T22:30:00'));
        expect(getToday()).toBe('2026-11-05');
    });

    test('vira o dia à meia-noite de Brasília', () => {
        freezeNow(br('2026-11-06T00:30:00'));
        expect(getToday()).toBe('2026-11-06');
    });
});

// ─── is_running ─────────────────────────────────────────────────────────────

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

// ─── create_clock_in ────────────────────────────────────────────────────────

describe('create_clock_in', () => {
    test('cria registro com clockOutTS nulo e day = dia do timestamp (Brasília)', async () => {
        // 22:30 em Brasília já é o dia seguinte em UTC: o day tem que ser o local
        const timestamp = br('2026-11-05T22:30:00');
        ClockIn.create.mockResolvedValue({ clockInTS: timestamp, clockOutTS: null, day: '2026-11-05' });

        const result = await create_clock_in(timestamp);

        expect(ClockIn.create).toHaveBeenCalledWith({
            clockInTS: timestamp,
            clockOutTS: null,
            day: '2026-11-05',
        });
        expect(result.clockOutTS).toBeNull();
        expect(result.day).toBe('2026-11-05');
    });

    test('passa o timestamp fornecido para clockInTS', async () => {
        const timestamp = br('2026-11-05T10:00:00');
        ClockIn.create.mockResolvedValue({ clockInTS: timestamp, clockOutTS: null, day: '2026-11-05' });

        await create_clock_in(timestamp);

        expect(ClockIn.create).toHaveBeenCalledWith(
            expect.objectContaining({ clockInTS: timestamp })
        );
    });
});

// ─── get_clockIns / get_last_clock_in ───────────────────────────────────────

describe('get_clockIns', () => {
    test('Gets all clockIns registered', async () => {
        const timestamp = 1782345876;
        const today = getToday();

        ClockIn.findAll.mockResolvedValue([
            { clockInTS: timestamp, clockOutTS: null, day: today }
        ]);

        const result = await get_clockIns();

        expect(result).toHaveLength(1);
        expect(result[0].clockInTS).toBe(timestamp);
        expect(result[0].clockOutTS).toBeNull();
        expect(result[0].day).toBe(today);
    });

    test('ordena pelo clockInTS decrescente', async () => {
        ClockIn.findAll.mockResolvedValue([]);

        await get_clockIns();

        expect(ClockIn.findAll).toHaveBeenCalledWith({ order: [['clockInTS', 'DESC']] });
    });

    test('formata horários em Brasília e o tempo total da sessão', async () => {
        ClockIn.findAll.mockResolvedValue([{
            id: 1,
            clockInTS: br('2026-11-05T09:05:00'),
            clockOutTS: br('2026-11-05T10:35:00'),
            day: '2026-11-05',
        }]);

        const result = await get_clockIns();

        expect(result[0]).toMatchObject({
            id: 1,
            clockIn: '09:05',
            clockOut: '10:35',
            time: '01:30:00',
            day: '2026-11-05',
        });
    });

    test('sessão aberta: clockOut nulo e tempo 00:00:00 (nunca negativo)', async () => {
        ClockIn.findAll.mockResolvedValue([{
            id: 2,
            clockInTS: br('2026-11-05T09:05:00'),
            clockOutTS: null,
            day: '2026-11-05',
        }]);

        const result = await get_clockIns();

        expect(result[0].clockOut).toBeNull();
        expect(result[0].time).toBe('00:00:00');
    });
});

describe('get_last_clock_in', () => {
    test('busca o último registro por ordem decrescente de createdAt', async () => {
        const record = { clockInTS: 100, clockOutTS: null };
        ClockIn.findOne.mockResolvedValue(record);

        const result = await get_last_clock_in();

        expect(ClockIn.findOne).toHaveBeenCalledWith({ order: [['createdAt', 'DESC']] });
        expect(result).toBe(record);
    });
});

// ─── TimeToday: recalculado a partir dos ClockIn ────────────────────────────

describe('get_time_today_by_day (recalcula em vez de somar)', () => {
    test('soma a sessão fechada que está dentro do dia', async () => {
        const store = fakeTimeTodayStore();
        sessions([br('2026-11-05T10:00:00'), br('2026-11-05T11:30:00')]);

        const result = await get_time_today_by_day('2026-11-05');

        expect(result.timeInMsToday).toBe(1.5 * HOUR);
        expect(result).toBe(store['2026-11-05']);
        expect(result.save).toHaveBeenCalledTimes(1);
    });

    test('chamar de novo NÃO duplica o tempo (idempotente)', async () => {
        fakeTimeTodayStore();
        sessions([br('2026-11-05T10:00:00'), br('2026-11-05T11:30:00')]);

        await get_time_today_by_day('2026-11-05');
        const result = await get_time_today_by_day('2026-11-05');

        expect(result.timeInMsToday).toBe(1.5 * HOUR);
    });

    test('corrige um valor negativo que já estava salvo', async () => {
        const record = { timeInMsToday: -5000, today: '2026-11-05', save: jest.fn().mockResolvedValue(true) };
        TimeToday.findOne.mockResolvedValue(record);
        sessions([br('2026-11-05T10:00:00'), br('2026-11-05T11:00:00')]);

        const result = await get_time_today_by_day('2026-11-05');

        expect(result.timeInMsToday).toBe(HOUR);
    });

    test('sessão que atravessa a meia-noite é dividida entre os dois dias', async () => {
        fakeTimeTodayStore();
        sessions([br('2026-11-05T23:00:00'), br('2026-11-06T01:00:00')]);

        const dia1 = await get_time_today_by_day('2026-11-05');
        const dia2 = await get_time_today_by_day('2026-11-06');

        expect(dia1.timeInMsToday).toBe(HOUR);
        expect(dia2.timeInMsToday).toBe(HOUR);
    });

    test('sessão de outro dia não conta (e nunca fica negativo)', async () => {
        fakeTimeTodayStore();
        sessions([br('2026-11-04T10:00:00'), br('2026-11-04T11:00:00')]);

        const result = await get_time_today_by_day('2026-11-05');

        expect(result.timeInMsToday).toBe(0);
    });

    test('consulta só sessões fechadas (clockOutTS diferente de null)', async () => {
        fakeTimeTodayStore();
        sessions();

        await get_time_today_by_day('2026-11-05');

        const { where } = ClockIn.findAll.mock.calls[0][0];
        expect(where.clockOutTS[Op.ne]).toBeNull();
    });

    test('cria a linha do dia quando ela não existe', async () => {
        const store = fakeTimeTodayStore();
        sessions();

        const result = await get_time_today_by_day('2025-08-18');

        expect(TimeToday.create).toHaveBeenCalledWith({ timeInMsToday: 0, today: '2025-08-18' });
        expect(result.today).toBe('2025-08-18');
        expect(store['2025-08-18']).toBe(result);
    });
});

describe('get_time_today', () => {
    test('retorna o registro do dia atual (fuso de Brasília), já recalculado', async () => {
        freezeNow(br('2026-11-05T22:30:00'));
        const store = fakeTimeTodayStore();
        sessions([br('2026-11-05T21:00:00'), br('2026-11-05T22:00:00')]);

        const result = await get_time_today();

        expect(TimeToday.findOne).toHaveBeenCalledWith({ where: { today: '2026-11-05' } });
        expect(result).toBe(store['2026-11-05']);
        expect(result.timeInMsToday).toBe(HOUR);
    });

    test('cria o TimeToday de hoje na primeira leitura do dia', async () => {
        freezeNow(br('2026-11-05T09:00:00'));
        fakeTimeTodayStore();
        sessions();

        const result = await get_time_today();

        expect(TimeToday.create).toHaveBeenCalledWith({ timeInMsToday: 0, today: '2026-11-05' });
        expect(result.timeInMsToday).toBe(0);
    });

    test('depois da meia-noite, o "hoje" começa do zero (tempo de ontem não entra)', async () => {
        freezeNow(br('2026-11-06T00:10:00'));
        fakeTimeTodayStore();
        sessions([br('2026-11-05T20:00:00'), br('2026-11-05T22:00:00')]);

        const result = await get_time_today();

        expect(result.today).toBe('2026-11-06');
        expect(result.timeInMsToday).toBe(0);
    });
});

describe('checkIfIsFirstClockIn', () => {
    test('retorna true quando não há tempo registrado hoje', async () => {
        freezeNow(br('2026-11-05T09:00:00'));
        sessions();

        expect(await checkIfIsFirstClockIn()).toBe(true);
    });

    test('retorna true quando só há sessões de outros dias', async () => {
        freezeNow(br('2026-11-05T09:00:00'));
        sessions([br('2026-11-04T10:00:00'), br('2026-11-04T11:00:00')]);

        expect(await checkIfIsFirstClockIn()).toBe(true);
    });

    test('retorna false quando já há tempo registrado hoje', async () => {
        freezeNow(br('2026-11-05T12:00:00'));
        sessions([br('2026-11-05T10:00:00'), br('2026-11-05T11:00:00')]);

        expect(await checkIfIsFirstClockIn()).toBe(false);
    });
});

describe('createTimeToday', () => {
    test('cria o registro com day = hoje (Brasília)', async () => {
        freezeNow(br('2026-11-05T22:30:00'));
        TimeToday.create.mockResolvedValue({ timeInMsToday: 0, today: '2026-11-05' });

        const record = await createTimeToday();

        expect(TimeToday.create).toHaveBeenCalledWith({ today: '2026-11-05' });
        expect(record.timeInMsToday).toEqual(0);
    });
});

describe('createTimeToday_by_day', () => {
    test('create time today with 0 ms and day equals to the day provided', async () => {
        const day = '2026-08-18';
        TimeToday.create.mockResolvedValue({ timeInMsToday: 0, today: day });

        const record = await createTimeToday_by_day(day);

        expect(record.timeInMsToday).toEqual(0);
        expect(record.today).toEqual(day);
        expect(TimeToday.create).toHaveBeenCalledWith({ timeInMsToday: 0, today: day });
    });
});

// ─── TotalHours: recalculado a partir dos ClockIn ───────────────────────────

describe('get_total_hours', () => {
    test('soma todas as sessões fechadas', async () => {
        fakeTotalHours(0);
        sessions(
            [br('2026-11-04T10:00:00'), br('2026-11-04T12:00:00')],
            [br('2026-11-05T10:00:00'), br('2026-11-05T11:00:00')],
        );

        const result = await get_total_hours();

        expect(result.totalHoursCompletedInMs).toBe(3 * HOUR);
        expect(result.save).toHaveBeenCalledTimes(1);
    });

    test('corrige um total negativo que já estava salvo', async () => {
        fakeTotalHours(-999);
        sessions([br('2026-11-05T10:00:00'), br('2026-11-05T11:00:00')]);

        const result = await get_total_hours();

        expect(result.totalHoursCompletedInMs).toBe(HOUR);
    });

    test('mantém a meta (goalHoursInMs) intacta', async () => {
        const record = fakeTotalHours(0);
        sessions();

        await get_total_hours();

        expect(record.goalHoursInMs).toBe(1000);
    });

    test('cria o TotalHours quando não existe nenhum registro', async () => {
        const created = { totalHoursCompletedInMs: 0, goalHoursInMs: 36000000000, save: jest.fn().mockResolvedValue(true) };
        TotalHours.findOne.mockResolvedValue(null);
        TotalHours.create.mockResolvedValue(created);
        sessions([br('2026-11-05T10:00:00'), br('2026-11-05T11:00:00')]);

        const result = await get_total_hours();

        expect(TotalHours.create).toHaveBeenCalledWith({ goalHoursInMs: 36000000000 });
        expect(result.totalHoursCompletedInMs).toBe(HOUR);
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

// ─── save_clock_out ─────────────────────────────────────────────────────────

describe('save_clock_out', () => {
    function setupOpenRecord(clockInTS = 100) {
        const record = { clockInTS, clockOutTS: null, save: jest.fn().mockResolvedValue(true) };
        ClockIn.findOne.mockResolvedValue(record);
        sessions();
        fakeTimeTodayStore();
        fakeTotalHours(0);
        return record;
    }

    test('busca o último registro por ordem decrescente de createdAt', async () => {
        setupOpenRecord();

        await save_clock_out(200);

        expect(ClockIn.findOne).toHaveBeenCalledWith({ order: [['createdAt', 'DESC']] });
    });

    test('salva o timestamp no campo clockOutTS do último registro', async () => {
        const record = setupOpenRecord();

        await save_clock_out(999);

        expect(record.clockOutTS).toBe(999);
        expect(record.save).toHaveBeenCalledTimes(1);
    });

    test('retorna mensagem de aviso se clockOut já existe', async () => {
        ClockIn.findOne.mockResolvedValue({ clockInTS: 100, clockOutTS: 200, save: jest.fn() });

        const result = await save_clock_out(300);

        expect(result).toBe('Last record has a clock out');
    });

    test('NÃO chama save nem recalcula quando clockOut já existe', async () => {
        const save = jest.fn();
        ClockIn.findOne.mockResolvedValue({ clockInTS: 100, clockOutTS: 200, save });

        await save_clock_out(300);

        expect(save).not.toHaveBeenCalled();
        expect(ClockIn.findAll).not.toHaveBeenCalled();
    });

    test('retorna aviso quando não existe nenhum registro', async () => {
        ClockIn.findOne.mockResolvedValue(null);

        const result = await save_clock_out(300);

        expect(result).toBe('No clock records');
    });

    test('devolve o tempo da sessão, o tempo de hoje e o total já recalculados', async () => {
        const clockIn  = br('2026-11-05T10:00:00');
        const clockOut = br('2026-11-05T11:00:00');
        freezeNow(br('2026-11-05T11:00:00'));

        const record = { clockInTS: clockIn, clockOutTS: null, save: jest.fn().mockResolvedValue(true) };
        ClockIn.findOne.mockResolvedValue(record);
        sessions([clockIn, clockOut]);
        fakeTimeTodayStore();
        const total = fakeTotalHours(0);

        const data = await save_clock_out(clockOut);

        expect(data).toEqual({
            new_time: '01:00:00',
            new_timeToday: '01:00:00',
            new_totalHours: '01:00:00',
        });
        expect(total.totalHoursCompletedInMs).toBe(HOUR);
    });

    test('parar depois da meia-noite divide a sessão entre os dois dias (sem negativo)', async () => {
        const clockIn  = br('2026-11-05T23:00:00');
        const clockOut = br('2026-11-06T01:00:00');
        freezeNow(clockOut);

        const record = { clockInTS: clockIn, clockOutTS: null, save: jest.fn().mockResolvedValue(true) };
        ClockIn.findOne.mockResolvedValue(record);
        sessions([clockIn, clockOut]);
        const store = fakeTimeTodayStore();
        fakeTotalHours(0);

        const data = await save_clock_out(clockOut);

        expect(store['2026-11-05'].timeInMsToday).toBe(HOUR);
        expect(store['2026-11-06'].timeInMsToday).toBe(HOUR);
        expect(data).toEqual({
            new_time: '02:00:00',
            new_timeToday: '01:00:00',
            new_totalHours: '02:00:00',
        });
    });
});

// ─── delete_clockIn ─────────────────────────────────────────────────────────

describe('delete_clockIn', () => {
    test('apaga o registro e recalcula o dia e o total depois', async () => {
        freezeNow(br('2026-11-05T12:00:00'));
        const record = {
            clockInTS: br('2026-11-05T10:00:00'),
            clockOutTS: br('2026-11-05T11:00:00'),
            destroy: jest.fn().mockResolvedValue(true),
        };
        ClockIn.findByPk.mockResolvedValue(record);
        sessions(); // depois de apagar não sobra nenhuma sessão
        const store = fakeTimeTodayStore();
        const total = fakeTotalHours(HOUR);

        await delete_clockIn(1);

        expect(record.destroy).toHaveBeenCalledTimes(1);
        expect(store['2026-11-05'].timeInMsToday).toBe(0);
        expect(total.totalHoursCompletedInMs).toBe(0);
        // o recálculo acontece DEPOIS do destroy
        expect(record.destroy.mock.invocationCallOrder[0])
            .toBeLessThan(ClockIn.findAll.mock.invocationCallOrder[0]);
    });

    test('apagar uma sessão aberta não quebra nem deixa o total negativo', async () => {
        freezeNow(br('2026-11-05T12:00:00'));
        const record = {
            clockInTS: br('2026-11-05T10:00:00'),
            clockOutTS: null,
            destroy: jest.fn().mockResolvedValue(true),
        };
        ClockIn.findByPk.mockResolvedValue(record);
        sessions();
        fakeTimeTodayStore();
        const total = fakeTotalHours(0);

        await delete_clockIn(1);

        expect(record.destroy).toHaveBeenCalledTimes(1);
        expect(total.totalHoursCompletedInMs).toBe(0);
    });

    test('retorna "Not Found" quando o registro não existe', async () => {
        ClockIn.findByPk.mockResolvedValue(null);

        const result = await delete_clockIn(999);

        expect(result).toBe('Not Found');
    });
});

// ─── edit_clockIn ───────────────────────────────────────────────────────────

describe('editClockIn', () => {
    function setupRecord({ clockInTS, clockOutTS, day = '2026-11-05' }) {
        const record = { id: 1, clockInTS, clockOutTS, day, save: jest.fn().mockResolvedValue(true) };
        ClockIn.findByPk.mockResolvedValue(record);
        return record;
    }

    test('edita um clockIn e devolve os dados recalculados', async () => {
        freezeNow(br('2026-11-05T15:00:00'));
        const clockOut = br('2026-11-05T12:00:00');
        const newClockIn = br('2026-11-05T11:00:00');
        const record = setupRecord({ clockInTS: br('2026-11-05T10:00:00'), clockOutTS: clockOut });
        sessions([newClockIn, clockOut]);
        fakeTimeTodayStore();
        fakeTotalHours(0);

        const data = await edit_clockIn(record.id, newClockIn);

        expect(record.clockInTS).toBe(newClockIn);
        expect(record.day).toBe('2026-11-05');
        expect(record.save).toHaveBeenCalled();
        expect(data).toEqual({
            new_time: '01:00:00',
            new_timeToday: '01:00:00',
            new_totalHours: '01:00:00',
        });
    });

    test('o day usa o fuso de Brasília, não UTC', async () => {
        freezeNow(br('2026-11-05T23:30:00'));
        // 22:30 em Brasília = 01:30 UTC do dia 06
        const newClockIn = br('2026-11-05T22:30:00');
        const record = setupRecord({
            clockInTS: br('2026-11-05T21:00:00'),
            clockOutTS: br('2026-11-05T23:00:00'),
            day: '2026-11-05',
        });
        sessions();
        fakeTimeTodayStore();
        fakeTotalHours(0);

        await edit_clockIn(record.id, newClockIn);

        expect(record.day).toBe('2026-11-05');
    });

    test('mudar a entrada para outro dia recalcula os dois dias (dividindo na meia-noite)', async () => {
        freezeNow(br('2026-11-05T15:00:00'));
        const clockOut = br('2026-11-05T11:00:00');
        const newClockIn = br('2026-11-04T10:00:00');
        const record = setupRecord({ clockInTS: br('2026-11-05T10:00:00'), clockOutTS: clockOut });
        sessions([newClockIn, clockOut]);
        const store = fakeTimeTodayStore();
        fakeTotalHours(0);

        await edit_clockIn(record.id, newClockIn);

        expect(record.day).toBe('2026-11-04');
        expect(store['2026-11-04'].timeInMsToday).toBe(14 * HOUR); // 10:00 até 24:00
        expect(store['2026-11-05'].timeInMsToday).toBe(11 * HOUR); // 00:00 até 11:00
    });

    test('editar a entrada de uma sessão aberta não gera valor negativo', async () => {
        freezeNow(br('2026-11-05T15:00:00'));
        const record = setupRecord({ clockInTS: br('2026-11-05T10:00:00'), clockOutTS: null });
        sessions();
        fakeTimeTodayStore();
        fakeTotalHours(0);

        const data = await edit_clockIn(record.id, br('2026-11-05T11:00:00'));

        expect(data).toEqual({
            new_time: '00:00:00',
            new_timeToday: '00:00:00',
            new_totalHours: '00:00:00',
        });
    });

    test('returns "Not Found"', async () => {
        ClockIn.findByPk.mockResolvedValue(null);

        const data = await edit_clockIn(999, 30000);

        expect(data).toBe('Not Found');
    });
});

// ─── edit_clockOut ──────────────────────────────────────────────────────────

describe('editClockOut', () => {
    function setupRecord({ clockInTS, clockOutTS, day = '2026-11-05' }) {
        const record = { id: 1, clockInTS, clockOutTS, day, save: jest.fn().mockResolvedValue(true) };
        ClockIn.findByPk.mockResolvedValue(record);
        return record;
    }

    test('edita um clockOut e devolve os dados recalculados', async () => {
        freezeNow(br('2026-11-05T15:00:00'));
        const clockIn = br('2026-11-05T10:00:00');
        const newClockOut = br('2026-11-05T13:00:00');
        const record = setupRecord({ clockInTS: clockIn, clockOutTS: br('2026-11-05T12:00:00') });
        sessions([clockIn, newClockOut]);
        fakeTimeTodayStore();
        fakeTotalHours(0);

        const data = await edit_clockOut(record.id, newClockOut);

        expect(record.clockOutTS).toBe(newClockOut);
        expect(record.day).toBe('2026-11-05');
        expect(record.save).toHaveBeenCalled();
        expect(data).toEqual({
            new_time: '03:00:00',
            new_timeToday: '03:00:00',
            new_totalHours: '03:00:00',
        });
    });

    test('estender a saída para depois da meia-noite divide o tempo entre os dois dias', async () => {
        freezeNow(br('2026-11-06T09:00:00'));
        const clockIn = br('2026-11-05T23:00:00');
        const newClockOut = br('2026-11-06T01:00:00');
        const record = setupRecord({ clockInTS: clockIn, clockOutTS: br('2026-11-05T23:30:00') });
        sessions([clockIn, newClockOut]);
        const store = fakeTimeTodayStore();
        fakeTotalHours(0);

        await edit_clockOut(record.id, newClockOut);

        expect(store['2026-11-05'].timeInMsToday).toBe(HOUR);
        expect(store['2026-11-06'].timeInMsToday).toBe(HOUR);
    });

    test('fechar uma sessão aberta pela edição do clockOut soma o tempo', async () => {
        freezeNow(br('2026-11-05T15:00:00'));
        const clockIn = br('2026-11-05T10:00:00');
        const newClockOut = br('2026-11-05T11:00:00');
        const record = setupRecord({ clockInTS: clockIn, clockOutTS: null });
        sessions([clockIn, newClockOut]);
        fakeTimeTodayStore();
        fakeTotalHours(0);

        const data = await edit_clockOut(record.id, newClockOut);

        expect(data.new_time).toBe('01:00:00');
        expect(data.new_totalHours).toBe('01:00:00');
    });

    test('returns "Not Found!"', async () => {
        ClockIn.findByPk.mockResolvedValue(null);

        const data = await edit_clockOut(999, 30000);

        expect(data).toBe('Not Found!');
    });
});

// ─── get_new_data / set_formated_interval ───────────────────────────────────

describe('get_new_data', () => {
    test('get correct data after change', async () => {
        freezeNow(br('2026-11-05T12:00:00'));
        sessions([br('2026-11-05T10:00:00'), br('2026-11-05T11:00:00')]);
        fakeTimeTodayStore();
        fakeTotalHours(0);

        const data = await get_new_data(200);

        expect(data.new_time).toEqual(set_formated_interval(200));
        expect(data.new_timeToday).toEqual(set_formated_interval(HOUR));
        expect(data.new_totalHours).toEqual(set_formated_interval(HOUR));
    });
});

describe('set_formated_interval', () => {
    test('0 ms vira 00:00:00', () => {
        expect(set_formated_interval(0)).toBe('00:00:00');
    });

    test('1h 1min 1s', () => {
        expect(set_formated_interval(3661000)).toBe('01:01:01');
    });

    test('não zera as horas depois de 24h', () => {
        expect(set_formated_interval(25 * HOUR)).toBe('25:00:00');
    });
});
