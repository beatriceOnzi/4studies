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
        sendStatus(code) { this.statusCode = code; return this; },
        render(_v, _d) { this.body = {}; return this; }
    };
    return res;
}

function getHandler(router, path, method) {
    const layer = router.stack.find(
        l => l.route && l.route.path === path && l.route.methods[method]
    );

    if (!layer) {
        throw new Error(`Rota "${method.toUpperCase()} ${path}" não encontrada`);
    }

    return layer.route.stack[0].handle;
}

beforeEach(() => jest.clearAllMocks());

// -- DAILY GOALS --

describe('POST /daily_goals/new', () => {
    test('retorna o novo objetivo diário criado', async () => {
        const fakeGoal = { id: 1, daily_goals: 'estudar 2h' };
        goalsService.create_daily_goal.mockResolvedValue(fakeGoal);

        const router = require('../routes/notes');
        const handle = getHandler(router, '/daily_goals/new', 'post');
        const res = fakeRes();

        await handle({ body: { value: 'estudar 2h' } }, res, () => {});

        expect(res.body).toMatchObject(fakeGoal);
    });

    test('chama create_daily_goal com o valor do body', async () => {
        goalsService.create_daily_goal.mockResolvedValue({ id: 2, daily_goals: 'ler' });

        const router = require('../routes/notes');
        const handle = getHandler(router, '/daily_goals/new', 'post');
        await handle({ body: { value: 'ler' } }, fakeRes(), () => {});

        expect(goalsService.create_daily_goal).toHaveBeenCalledWith('ler');
    });
});

describe('POST /daily_goals/switch/:id', () => {
    test('chama toggleState_dailyGoals com o id da rota', async () => {
        goalsService.toggleState_dailyGoals.mockResolvedValue({ id: 4, done: true });

        const router = require('../routes/notes');
        const handle = getHandler(router, '/daily_goals/switch/:id', 'post');
        await handle({ params: { id: '4' } }, fakeRes(), () => {});

        expect(goalsService.toggleState_dailyGoals).toHaveBeenCalledWith('4');
    });

    test('retorna o novo estado do objetivo', async () => {
        const newState = { id: 4, done: true };
        goalsService.toggleState_dailyGoals.mockResolvedValue(newState);

        const router = require('../routes/notes');
        const handle = getHandler(router, '/daily_goals/switch/:id', 'post');
        const res = fakeRes();

        await handle({ params: { id: '4' } }, res, () => {});

        expect(res.body).toEqual(newState);
    });
});

describe('DELETE /daily_goals/:id', () => {
    test('chama delete_daily_goal com o id da rota', async () => {
        goalsService.delete_daily_goal.mockResolvedValue();

        const router = require('../routes/notes');
        const handle = getHandler(router, '/daily_goals/:id', 'delete');
        await handle({ params: { id: '5' }, body: {} }, fakeRes(), () => {});

        expect(goalsService.delete_daily_goal).toHaveBeenCalledWith('5');
    });
});

// -- WEEKLY GOALS --

describe('POST /weekly_goals/new', () => {
    test('retorna o novo objetivo semanal criado', async () => {
        const fakeGoal = { id: 1, weekly_goals: 'terminar módulo' };
        goalsService.create_weekly_goal.mockResolvedValue(fakeGoal);

        const router = require('../routes/notes');
        const handle = getHandler(router, '/weekly_goals/new', 'post');
        const res = fakeRes();

        await handle({ body: { value: 'terminar módulo' } }, res, () => {});

        expect(res.body).toMatchObject(fakeGoal);
    });

    test('chama create_weekly_goal com o valor do body', async () => {
        goalsService.create_weekly_goal.mockResolvedValue({ id: 2 });

        const router = require('../routes/notes');
        const handle = getHandler(router, '/weekly_goals/new', 'post');
        await handle({ body: { value: 'revisar' } }, fakeRes(), () => {});

        expect(goalsService.create_weekly_goal).toHaveBeenCalledWith('revisar');
    });
});

describe('POST /weekly_goals/switch/:id', () => {
    test('chama toggleState_weeklyGoals com o id da rota', async () => {
        goalsService.toggleState_weeklyGoals.mockResolvedValue({ id: 6, done: false });

        const router = require('../routes/notes');
        const handle = getHandler(router, '/weekly_goals/switch/:id', 'post');
        await handle({ params: { id: '6' } }, fakeRes(), () => {});

        expect(goalsService.toggleState_weeklyGoals).toHaveBeenCalledWith('6');
    });

    test('retorna o novo estado do objetivo', async () => {
        const newState = { id: 6, done: false };
        goalsService.toggleState_weeklyGoals.mockResolvedValue(newState);

        const router = require('../routes/notes');
        const handle = getHandler(router, '/weekly_goals/switch/:id', 'post');
        const res = fakeRes();

        await handle({ params: { id: '6' } }, res, () => {});

        expect(res.body).toEqual(newState);
    });
});

describe('DELETE /weekly_goals/:id', () => {
    test('chama delete_weekly_goal com o id da rota', async () => {
        goalsService.delete_weekly_goal.mockResolvedValue();

        const router = require('../routes/notes');
        const handle = getHandler(router, '/weekly_goals/:id', 'delete');
        await handle({ params: { id: '3' }, body: {} }, fakeRes(), () => {});

        expect(goalsService.delete_weekly_goal).toHaveBeenCalledWith('3');
    });
});

// -- NOTES --

describe('GET /notes/new', () => {
    test('retorna a nota criada pelo serviço', async () => {
        const fakeNote = { id: 10 };
        notesService.create_note.mockResolvedValue(fakeNote);

        const router = require('../routes/notes');
        const handle = getHandler(router, '/notes/new', 'get');
        const res = fakeRes();

        await handle({}, res, () => {});

        expect(notesService.create_note).toHaveBeenCalled();
        expect(res.body).toEqual(fakeNote);
    });
});

describe('POST /notes/save/:id', () => {
    test('retorna o registro de notas atualizado pelo serviço', async () => {
        const fakeNote = { id: 1, note: 'novo texto' };
        notesService.save_note.mockResolvedValue(fakeNote);

        const router = require('../routes/notes');
        const handle = getHandler(router, '/notes/save/:id', 'post');
        const res = fakeRes();

        await handle({ body: { note: 'novo texto' }, params: { id: '1' } }, res, () => {});

        expect(res.body).toEqual(fakeNote);
    });

    test('chama save_note com o texto do body e o id da rota', async () => {
        notesService.save_note.mockResolvedValue({ id: 7, note: 'qualquer' });

        const router = require('../routes/notes');
        const handle = getHandler(router, '/notes/save/:id', 'post');
        await handle({ body: { note: 'qualquer' }, params: { id: '7' } }, fakeRes(), () => {});

        expect(notesService.save_note).toHaveBeenCalledWith('qualquer', '7');
    });
});

describe('POST /notes/save_title/:id', () => {
    test('retorna o resultado do serviço', async () => {
        const fakeNote = { id: 1, title: 'novo título' };
        notesService.save_title.mockResolvedValue(fakeNote);

        const router = require('../routes/notes');
        const handle = getHandler(router, '/notes/save_title/:id', 'post');
        const res = fakeRes();

        await handle({ body: { title: 'novo título' }, params: { id: '1' } }, res, () => {});

        expect(res.body).toEqual(fakeNote);
    });

    test('chama save_title com o título do body e o id da rota', async () => {
        notesService.save_title.mockResolvedValue({ id: 4, title: 'x' });

        const router = require('../routes/notes');
        const handle = getHandler(router, '/notes/save_title/:id', 'post');
        await handle({ body: { title: 'x' }, params: { id: '4' } }, fakeRes(), () => {});

        expect(notesService.save_title).toHaveBeenCalledWith('x', '4');
    });
});

describe('DELETE /notes/delete/:id', () => {
    test('chama delete_note com o id da rota', async () => {
        notesService.delete_note.mockResolvedValue();

        const router = require('../routes/notes');
        const handle = getHandler(router, '/notes/delete/:id', 'delete');
        await handle({ params: { id: '9' } }, fakeRes(), () => {});

        expect(notesService.delete_note).toHaveBeenCalledWith('9');
    });

    test('responde com status 204', async () => {
        notesService.delete_note.mockResolvedValue();

        const router = require('../routes/notes');
        const handle = getHandler(router, '/notes/delete/:id', 'delete');
        const res = fakeRes();

        await handle({ params: { id: '9' } }, res, () => {});

        expect(res.statusCode).toBe(204);
    });
});