// tests/clock_routes.test.js

jest.mock('../models/ClockIn');
jest.mock('../models/TimeToday');
jest.mock('../models/TotalHours');
jest.mock('../models/add_stuff');
jest.mock('../services/clock_service');
jest.mock('../services/page_service');

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => jest.restoreAllMocks());

const express      = require('express');
const clockService = require('../services/clock_service');
const pageService  = require('../services/page_service');

function buildApp() {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/', require('../routes/clock'));
    return app;
}

function fakeReq(method, path, body = {}) {
    return Object.assign(Object.create(require('events').EventEmitter.prototype), {
        method, path, body,
        headers: { 'content-type': 'application/json' },
        params: {}, query: {}
    });
}

function fakeRes() {
    const res = {
        statusCode: 200,
        body: undefined,
        view: undefined,
        renderData: undefined,
        status(code) { this.statusCode = code; return this; },
        json(data)   { this.body = data; return this; },
        render(view, data) { this.view = view; this.renderData = data; this.body = {}; return this; }
    };
    return res;
}

beforeEach(() => jest.clearAllMocks());

// ─── GET
describe('GET', () => {
    function getIndexHandler() {
        const router = require('../routes/clock');
        const layer = router.stack.find(l => l.route && l.route.path === '/');
        return layer.route.stack[0].handle;
    }

    const fakeData = {
        time: '01:30:00',
        is_running: true,
        notes: 'minhas notas',
        daily_goals: [{ id: 1, daily_goals: 'estudar' }],
        weekly_goals: [{ id: 1, weekly_goals: 'projeto' }],
        hours_completed: '10:00:00',
        goal_hours: '36',
    };

    test('cria o TimeToday quando é o primeiro clock-in do dia', async () => {
        clockService.checkIfIsFirstClockIn.mockResolvedValue(true);
        clockService.createTimeToday.mockResolvedValue();
        clockService.create_total_hours_if_needed.mockResolvedValue();
        pageService.get_data.mockResolvedValue(fakeData);

        const handle = getIndexHandler();
        await handle(fakeReq('GET', '/'), fakeRes(), () => {});

        expect(clockService.createTimeToday).toHaveBeenCalledTimes(1);
    });

    test('NÃO cria o TimeToday quando já existe registro de hoje', async () => {
        clockService.checkIfIsFirstClockIn.mockResolvedValue(false);
        clockService.createTimeToday.mockResolvedValue();
        clockService.create_total_hours_if_needed.mockResolvedValue();
        pageService.get_data.mockResolvedValue(fakeData);

        const handle = getIndexHandler();
        await handle(fakeReq('GET', '/'), fakeRes(), () => {});

        expect(clockService.createTimeToday).not.toHaveBeenCalled();
    });

    test('garante que o registro de TotalHours existe', async () => {
        clockService.checkIfIsFirstClockIn.mockResolvedValue(false);
        clockService.create_total_hours_if_needed.mockResolvedValue();
        pageService.get_data.mockResolvedValue(fakeData);

        const handle = getIndexHandler();
        await handle(fakeReq('GET', '/'), fakeRes(), () => {});

        expect(clockService.create_total_hours_if_needed).toHaveBeenCalledTimes(1);
    });

    test('renderiza "index" com os dados agregados de todas as seções (clock, notas, metas e tempo)', async () => {
        clockService.checkIfIsFirstClockIn.mockResolvedValue(false);
        clockService.create_total_hours_if_needed.mockResolvedValue();
        pageService.get_data.mockResolvedValue(fakeData);

        const res = fakeRes();
        const handle = getIndexHandler();
        await handle(fakeReq('GET', '/'), res, () => {});

        expect(res.view).toBe('index');
        expect(res.renderData).toEqual({ data: fakeData });
    });
});

// is_running
describe('GET /get_is_running', () => {
    test('retorna true quando rodando', async () => {
        clockService.is_running.mockResolvedValue(true);
        const req = fakeReq('GET', '/get_is_running');
        const res = fakeRes();
        const router = require('../routes/clock');
        const layer = router.stack.find(l => l.route && l.route.path === '/get_is_running');
        await layer.route.stack[0].handle(req, res, () => {});
        expect(res.body).toBe(true);
    });

    test('retorna false quando parado', async () => {
        clockService.is_running.mockResolvedValue(false);
        const req = fakeReq('GET', '/get_is_running');
        const res = fakeRes();
        const router = require('../routes/clock');
        const layer = router.stack.find(l => l.route && l.route.path === '/get_is_running');
        await layer.route.stack[0].handle(req, res, () => {});
        expect(res.body).toBe(false);
    });
});

// get_ms_today 
describe('GET /get_ms_today', () => {
    test('retorna timeInMsToday como número', async () => {
        clockService.get_time_today.mockResolvedValue({ timeInMsToday: 12345 });
        const req = fakeReq('GET', '/get_ms_today');
        const res = fakeRes();
        const router = require('../routes/clock');
        const layer = router.stack.find(l => l.route && l.route.path === '/get_ms_today');
        await layer.route.stack[0].handle(req, res, () => {});
        expect(res.body).toBe(12345);
    });
});

// create_clock_in 
describe('POST /create_clock_in', () => {
    test('retorna o novo registro criado', async () => {
        const fakeRecord = { id: 1, clockInTS: 999, clockOutTS: null };
        clockService.create_clock_in.mockResolvedValue(fakeRecord);
        const req = fakeReq('POST', '/create_clock_in', { timestamp: 999 });
        const res = fakeRes();
        const router = require('../routes/clock');
        const layer = router.stack.find(l => l.route && l.route.path === '/create_clock_in');
        await layer.route.stack[0].handle(req, res, () => {});
        expect(res.body).toMatchObject(fakeRecord);
    });
});

// save_clock_out
describe('POST /save_clock_out', () => {
    test('retorna { ok: true } em sucesso', async () => {
        clockService.save_clock_out.mockResolvedValue(undefined);
        const req = fakeReq('POST', '/save_clock_out', { timestamp: 1000 });
        const res = fakeRes();
        const router = require('../routes/clock');
        const layer = router.stack.find(l => l.route && l.route.path === '/save_clock_out');
        await layer.route.stack[0].handle(req, res, () => {});
        expect(res.body).toEqual({ ok: true });
    });

    test('retorna status 500 quando lança erro', async () => {
        clockService.save_clock_out.mockRejectedValue(new Error('falha'));
        const req = fakeReq('POST', '/save_clock_out', { timestamp: 1000 });
        const res = fakeRes();
        const router = require('../routes/clock');
        const layer = router.stack.find(l => l.route && l.route.path === '/save_clock_out');
        await layer.route.stack[0].handle(req, res, () => {});
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

// add_ms_to_database 
describe('POST /add_ms_to_database', () => {
    test('chama ambos os serviços com o intervalo correto', async () => {
        clockService.add_ms_to_TimeToday.mockResolvedValue();
        clockService.add_ms_to_TotalHours.mockResolvedValue();
        const req = fakeReq('POST', '/add_ms_to_database', { interval_in_ms: 500 });
        const res = fakeRes();
        const router = require('../routes/clock');
        const layer = router.stack.find(l => l.route && l.route.path === '/add_ms_to_database');
        await layer.route.stack[0].handle(req, res, () => {});
        expect(res.body).toEqual({ ok: true });
        expect(clockService.add_ms_to_TimeToday).toHaveBeenCalledWith(500);
        expect(clockService.add_ms_to_TotalHours).toHaveBeenCalledWith(500);
    });
});