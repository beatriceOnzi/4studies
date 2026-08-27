// tests/notes_routes.test.js

jest.mock('../models/Notes');
jest.mock('../models/WeeklyGoals');
jest.mock('../models/DailyGoals');
jest.mock('../services/notes_service');
jest.mock('../services/goals_service');

const notesService = require('../services/notes_service');
const goalsService = require('../services/goals_service');

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
    const layer = router.stack.find(
        l => l.route && l.route.path === path
    );

    if (!layer) {
        throw new Error(`Rota "${path}" não encontrada`);
    }

    return layer.route.stack[0].handle;
}

beforeEach(() => jest.clearAllMocks());

describe('POST /notes/daily_goals/new', () => {
    test('retorna o novo objetivo diário criado', async () => {
        const fakeGoal = { id: 1, daily_goals: 'estudar 2h' };
        goalsService.create_daily_goal.mockResolvedValue(fakeGoal);

        const router = require('../routes/notes');
        const handle = getHandler(router, '/daily_goals/new');
        const req = { body: { value: 'estudar 2h' } };
        const res = fakeRes();

        await handle(req, res, () => {});

        expect(res.body).toMatchObject(fakeGoal);
    });

    test('chama create_daily_goal com o valor do body', async () => {
        goalsService.create_daily_goal.mockResolvedValue({ id: 2, daily_goals: 'ler' });

        const router = require('../routes/notes');
        const handle = getHandler(router, '/daily_goals/new');
        await handle({ body: { value: 'ler' } }, fakeRes(), () => {});

        expect(goalsService.create_daily_goal).toHaveBeenCalledWith('ler');
    });
});

describe('POST /notes/weekly_goals/new', () => {
    test('retorna o novo objetivo semanal criado', async () => {
        const fakeGoal = { id: 1, weekly_goals: 'terminar módulo' };
        goalsService.create_weekly_goal.mockResolvedValue(fakeGoal);

        const router = require('../routes/notes');
        const handle = getHandler(router, '/weekly_goals/new');
        const res = fakeRes();

        await handle({ body: { value: 'terminar módulo' } }, res, () => {});

        expect(res.body).toMatchObject(fakeGoal);
    });
});

// NOTES
describe('POST /notes/save', () => {
    test('retorna o registro de notas atualizado pelo serviço', async () => {
        const fakeNote = { id: 1, note: 'novo texto' };
        notesService.save_notes.mockResolvedValue(fakeNote);

        const router = require('../routes/notes');
        const handle = getHandler(router, '/notes/save');
        const res = fakeRes();

        await handle({ body: { notes: 'novo texto' } }, res, () => {});

        expect(res.body).toEqual(fakeNote);
    });

    test('chama save_notes com o texto enviado no body', async () => {
        notesService.save_notes.mockResolvedValue({ id: 1, note: 'qualquer' });

        const router = require('../routes/notes');
        const handle = getHandler(router, '/notes/save');
        await handle({ body: { notes: 'qualquer' } }, fakeRes(), () => {});

        expect(notesService.save_notes).toHaveBeenCalledWith('qualquer');
    });
});

describe('DELETE /notes/daily_goals/:id', () => {
    test('chama delete_daily_goal com o id da rota', async () => {
        goalsService.delete_daily_goal.mockResolvedValue();

        const router = require('../routes/notes');
        const handle = getHandler(router, '/daily_goals/:id');
        await handle({ params: { id: '5' }, body: {} }, fakeRes(), () => {});

        expect(goalsService.delete_daily_goal).toHaveBeenCalledWith('5');
    });
});

describe('DELETE /notes/weekly_goals/:id', () => {
    test('chama delete_weekly_goal com o id da rota', async () => {
        goalsService.delete_weekly_goal.mockResolvedValue();

        const router = require('../routes/notes');
        const handle = getHandler(router, '/weekly_goals/:id');
        await handle({ params: { id: '3' }, body: {} }, fakeRes(), () => {});

        expect(goalsService.delete_weekly_goal).toHaveBeenCalledWith('3');
    });
});