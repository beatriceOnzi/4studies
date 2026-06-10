// tests/notes_routes.test.js

jest.mock('../models/Notes');
jest.mock('../models/WeeklyGoals');
jest.mock('../models/DailyGoals');
jest.mock('../services/notes_service');

const notesService = require('../services/notes_service');

function fakeRes() {
    const res = {
        statusCode: 200,
        body: undefined,
        status(code) { this.statusCode = code; return this; },
        json(data)   { this.body = data; return this; },
        render(_v, _d) { this.body = {}; return this; }
    };
    return res;
}

function getHandler(router, path) {
    const layer = router.stack.find(l => l.route && l.route.path === path);
    return layer.route.stack[0].handle;
}

beforeEach(() => jest.clearAllMocks());

// ─── POST /notes/daily_goals/new ──────────────
describe('POST /notes/daily_goals/new', () => {
    test('retorna o novo objetivo diário criado', async () => {
        const fakeGoal = { id: 1, daily_goals: 'estudar 2h' };
        notesService.create_daily_goal.mockResolvedValue(fakeGoal);

        const router = require('../routes/notes');
        const handle = getHandler(router, '/daily_goals/new');
        const req = { body: { value: 'estudar 2h' } };
        const res = fakeRes();

        await handle(req, res, () => {});

        expect(res.body).toMatchObject(fakeGoal);
    });

    test('chama create_daily_goal com o valor do body', async () => {
        notesService.create_daily_goal.mockResolvedValue({ id: 2, daily_goals: 'ler' });

        const router = require('../routes/notes');
        const handle = getHandler(router, '/daily_goals/new');
        await handle({ body: { value: 'ler' } }, fakeRes(), () => {});

        expect(notesService.create_daily_goal).toHaveBeenCalledWith('ler');
    });
});

// ─── POST /notes/weekly_goals/new ─────────────
describe('POST /notes/weekly_goals/new', () => {
    test('retorna o novo objetivo semanal criado', async () => {
        const fakeGoal = { id: 1, weekly_goals: 'terminar módulo' };
        notesService.create_weekly_goal.mockResolvedValue(fakeGoal);

        const router = require('../routes/notes');
        const handle = getHandler(router, '/weekly_goals/new');
        const res = fakeRes();

        await handle({ body: { value: 'terminar módulo' } }, res, () => {});

        expect(res.body).toMatchObject(fakeGoal);
    });
});

// ─── POST /notes/save ─────────────────────────
describe('POST /notes/save', () => {
    test('salva o texto da nota e retorna o registro atualizado', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        const fakeNote = { id: 1, note: '', save: saveMock };
        notesService.get_notes.mockResolvedValue(fakeNote);

        const router = require('../routes/notes');
        const handle = getHandler(router, '/save');
        const res = fakeRes();

        await handle({ body: { notes: 'novo texto' } }, res, () => {});

        expect(res.body.note).toBe('novo texto');
    });

    test('chama save no objeto retornado por get_notes', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        notesService.get_notes.mockResolvedValue({ id: 1, note: '', save: saveMock });

        const router = require('../routes/notes');
        const handle = getHandler(router, '/save');
        await handle({ body: { notes: 'qualquer' } }, fakeRes(), () => {});

        expect(saveMock).toHaveBeenCalledTimes(1);
    });
});