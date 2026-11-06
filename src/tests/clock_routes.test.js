// tests/clock_routes.test.js

jest.mock('../models/ClockIn');
jest.mock('../models/TimeToday');
jest.mock('../models/TotalHours');
jest.mock('../models/add_stuff');
jest.mock('../services/clock_service');
jest.mock('../services/page_service');

const clockService = require('../services/clock_service');
const pageService  = require('../services/page_service');

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => jest.restoreAllMocks());

beforeEach(() => jest.clearAllMocks());

function fakeRes() {
    return {
        statusCode: 200,
        body: undefined,
        view: undefined,
        renderData: undefined,
        status(code) { this.statusCode = code; return this; },
        json(data)   { this.body = data; return this; },
        render(view, data) { this.view = view; this.renderData = data; this.body = {}; return this; }
    };
}

// acha o handler da rota no router e executa
async function call(method, path, body = {}) {
    const router = require('../routes/clock');
    const layer = router.stack.find(
        l => l.route && l.route.path === path && l.route.methods[method]
    );
    const res = fakeRes();
    await layer.route.stack[0].handle({ method, path, body, params: {}, query: {} }, res, () => {});
    return res;
}

// ─── GET /
describe('GET /', () => {
    const fakeData = {
        time: '01:30:00',
        is_running: true,
        notes: 'minhas notas',
        daily_goals: [{ id: 1, daily_goals: 'estudar' }],
        weekly_goals: [{ id: 1, weekly_goals: 'projeto' }],
        hours_completed: '10:00:00',
        goal_hours: '36',
    };

    test('garante que o registro de TotalHours existe', async () => {
        clockService.create_total_hours_if_needed.mockResolvedValue();
        pageService.get_data.mockResolvedValue(fakeData);

        await call('get', '/');

        expect(clockService.create_total_hours_if_needed).toHaveBeenCalledTimes(1);
    });

    test('garante o TotalHours ANTES de montar os dados da página', async () => {
        clockService.create_total_hours_if_needed.mockResolvedValue();
        pageService.get_data.mockResolvedValue(fakeData);

        await call('get', '/');

        expect(clockService.create_total_hours_if_needed.mock.invocationCallOrder[0])
            .toBeLessThan(pageService.get_data.mock.invocationCallOrder[0]);
    });

    test('renderiza "index" com os dados agregados de todas as seções (clock, notas, metas e tempo)', async () => {
        clockService.create_total_hours_if_needed.mockResolvedValue();
        pageService.get_data.mockResolvedValue(fakeData);

        const res = await call('get', '/');

        expect(res.view).toBe('index');
        expect(res.renderData).toEqual({ data: fakeData });
    });
});

// ─── GET /get_is_running
describe('GET /get_is_running', () => {
    test('retorna true quando rodando', async () => {
        clockService.is_running.mockResolvedValue(true);
        const res = await call('get', '/get_is_running');
        expect(res.body).toBe(true);
    });

    test('retorna false quando parado', async () => {
        clockService.is_running.mockResolvedValue(false);
        const res = await call('get', '/get_is_running');
        expect(res.body).toBe(false);
    });
});

// ─── GET /get_ms_today
describe('GET /get_ms_today', () => {
    test('retorna timeInMsToday como número', async () => {
        clockService.get_time_today.mockResolvedValue({ timeInMsToday: 12345 });
        const res = await call('get', '/get_ms_today');
        expect(res.body).toBe(12345);
    });
});

// ─── GET /get_last_clock_in
describe('GET /get_last_clock_in', () => {
    test('retorna o clockInTS quando o relógio está rodando', async () => {
        clockService.get_last_clock_in.mockResolvedValue({ clockInTS: 555, clockOutTS: null });
        const res = await call('get', '/get_last_clock_in');
        expect(res.body).toBe(555);
    });

    test('avisa que não está rodando quando o último registro já tem clockOut', async () => {
        clockService.get_last_clock_in.mockResolvedValue({ clockInTS: 555, clockOutTS: 999 });
        const res = await call('get', '/get_last_clock_in');
        expect(res.body).toBe('Clock is not running. get_last_clock_in');
    });

    test('não quebra quando ainda não existe nenhum registro', async () => {
        clockService.get_last_clock_in.mockResolvedValue(null);
        const res = await call('get', '/get_last_clock_in');
        expect(res.statusCode).toBe(200);
        expect(res.body).toBe('Clock is not running. get_last_clock_in');
    });
});

// ─── POST /create_clock_in
describe('POST /create_clock_in', () => {
    test('retorna o novo registro criado', async () => {
        const fakeRecord = { id: 1, clockInTS: 999, clockOutTS: null };
        clockService.create_clock_in.mockResolvedValue(fakeRecord);

        const res = await call('post', '/create_clock_in', { timestamp: 999 });

        expect(clockService.create_clock_in).toHaveBeenCalledWith(999);
        expect(res.body).toMatchObject(fakeRecord);
    });
});

// ─── POST /save_clock_out
describe('POST /save_clock_out', () => {
    test('retorna os totais recalculados devolvidos pelo service', async () => {
        const data = { new_time: '01:00:00', new_timeToday: '02:00:00', new_totalHours: '10:00:00' };
        clockService.save_clock_out.mockResolvedValue(data);

        const res = await call('post', '/save_clock_out', { timestamp: 1000 });

        expect(clockService.save_clock_out).toHaveBeenCalledWith(1000);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(data);
    });

    test('retorna status 409 quando o service recusa o clock out (ex.: já tinha saída)', async () => {
        clockService.save_clock_out.mockResolvedValue('Last record has a clock out');

        const res = await call('post', '/save_clock_out', { timestamp: 1000 });

        expect(res.statusCode).toBe(409);
        expect(res.body).toEqual({ error: 'Last record has a clock out' });
    });

    test('retorna status 500 quando lança erro', async () => {
        clockService.save_clock_out.mockRejectedValue(new Error('falha'));

        const res = await call('post', '/save_clock_out', { timestamp: 1000 });

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

// ─── GET /get_clockIns
describe('GET /get_clockIns', () => {
    test('retorna a lista formatada', async () => {
        const list = [{ id: 1, clockIn: '09:00', clockOut: '10:00', time: '01:00:00', day: '2026-11-05' }];
        clockService.get_clockIns.mockResolvedValue(list);

        const res = await call('get', '/get_clockIns');

        expect(res.body).toEqual(list);
    });
});

// ─── POST /delete_clockIn
describe('POST /delete_clockIn', () => {
    test('apaga e retorna { ok: true }', async () => {
        clockService.delete_clockIn.mockResolvedValue();

        const res = await call('post', '/delete_clockIn', { id: 7 });

        expect(clockService.delete_clockIn).toHaveBeenCalledWith(7);
        expect(res.body).toEqual({ ok: true });
    });

    test('retorna status 500 quando lança erro', async () => {
        clockService.delete_clockIn.mockRejectedValue(new Error('falha'));

        const res = await call('post', '/delete_clockIn', { id: 7 });

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

// ─── POST /edit_clockIn e /edit_clockOut
describe.each([
    ['/edit_clockIn',  'edit_clockIn',  'new_clockInTS'],
    ['/edit_clockOut', 'edit_clockOut', 'new_clockOutTS'],
])('POST %s', (path, serviceFn, field) => {
    test('retorna new_time, new_timeToday e new_totalHours', async () => {
        clockService[serviceFn].mockResolvedValue({
            new_time: '01:00:00',
            new_timeToday: '02:00:00',
            new_totalHours: '10:00:00',
        });

        const res = await call('post', path, { id: 3, [field]: 1234 });

        expect(clockService[serviceFn]).toHaveBeenCalledWith(3, 1234);
        expect(res.body).toEqual({
            new_time: '01:00:00',
            new_timeToday: '02:00:00',
            new_totalHours: '10:00:00',
        });
    });

    test('retorna status 404 quando o registro não existe', async () => {
        clockService[serviceFn].mockResolvedValue('Not Found');

        const res = await call('post', path, { id: 999, [field]: 1234 });

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ error: 'Not Found' });
    });

    test('retorna status 500 quando lança erro', async () => {
        clockService[serviceFn].mockRejectedValue(new Error('falha'));

        const res = await call('post', path, { id: 3, [field]: 1234 });

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});
