// tests/notes_service.test.js
// Testes do notes_service — notas, metas diárias e semanais

const Notes       = require('../models/Notes');
const WeeklyGoals = require('../models/WeeklyGoals');
const DailyGoals  = require('../models/DailyGoals');

const {
    load_page,
    get_notes,
    create_notes,
    delete_weekly_goal,
    delete_daily_goal,
    create_daily_goal,
    create_weekly_goal,
} = require('../services/notes_service');

jest.mock('../models/Notes');
jest.mock('../models/WeeklyGoals');
jest.mock('../models/DailyGoals');

beforeEach(() => {
    jest.clearAllMocks();
});

// ─────────────────────────────────────────────
// get_notes
// ─────────────────────────────────────────────
describe('get_notes', () => {
    test('retorna o primeiro registro de Notes', async () => {
        const fakeNote = { id: 1, note: 'minha nota' };
        Notes.findOne.mockResolvedValue(fakeNote);

        const result = await get_notes();

        expect(Notes.findOne).toHaveBeenCalledTimes(1);
        expect(result).toEqual(fakeNote);
    });

    test('retorna null quando não há notas', async () => {
        Notes.findOne.mockResolvedValue(null);
        const result = await get_notes();
        expect(result).toBeNull();
    });
});

// ─────────────────────────────────────────────
// create_notes
// ─────────────────────────────────────────────
describe('create_notes', () => {
    test('cria e retorna um novo registro de Notes', async () => {
        const fakeNote = { id: 1, note: '' };
        Notes.create.mockResolvedValue(fakeNote);

        const result = await create_notes();

        expect(Notes.create).toHaveBeenCalledWith({});
        expect(result).toEqual(fakeNote);
    });
});

// ─────────────────────────────────────────────
// load_page — daily
// ─────────────────────────────────────────────
describe('load_page', () => {
    test('"daily" retorna notes + metas diárias', async () => {
        const fakeNote  = { id: 1, note: 'texto' };
        const fakeGoals = [{ id: 1, daily_goals: 'estudar' }];

        Notes.findOne.mockResolvedValue(fakeNote);
        DailyGoals.findAll.mockResolvedValue(fakeGoals);

        const result = await load_page('daily');

        expect(result.notes).toEqual(fakeNote);
        expect(result.goals).toEqual(fakeGoals);
        expect(DailyGoals.findAll).toHaveBeenCalledTimes(1);
        expect(WeeklyGoals.findAll).not.toHaveBeenCalled();
    });

    test('"weekly" retorna notes + metas semanais', async () => {
        const fakeNote  = { id: 1, note: 'texto' };
        const fakeGoals = [{ id: 1, weekly_goals: 'terminar projeto' }];

        Notes.findOne.mockResolvedValue(fakeNote);
        WeeklyGoals.findAll.mockResolvedValue(fakeGoals);

        const result = await load_page('weekly');

        expect(result.notes).toEqual(fakeNote);
        expect(result.goals).toEqual(fakeGoals);
        expect(WeeklyGoals.findAll).toHaveBeenCalledTimes(1);
        expect(DailyGoals.findAll).not.toHaveBeenCalled();
    });

    test('tipo desconhecido retorna goals vazio', async () => {
        Notes.findOne.mockResolvedValue({ id: 1, note: '' });

        const result = await load_page('unknown');

        expect(result.goals).toBe('');
    });
});

// ─────────────────────────────────────────────
// create_daily_goal
// ─────────────────────────────────────────────
describe('create_daily_goal', () => {
    test('instancia DailyGoals com o valor e chama save', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        const fakeGoal = { id: 1, daily_goals: 'ler 30 min', save: saveMock };

        // O serviço usa `new DailyGoals(...)` — mockamos o construtor
        DailyGoals.mockImplementation(() => fakeGoal);

        const result = await create_daily_goal('ler 30 min');

        expect(saveMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(fakeGoal);
    });
});

// ─────────────────────────────────────────────
// create_weekly_goal
// ─────────────────────────────────────────────
describe('create_weekly_goal', () => {
    test('instancia WeeklyGoals com o valor e chama save', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        const fakeGoal = { id: 1, weekly_goals: 'terminar módulo', save: saveMock };

        WeeklyGoals.mockImplementation(() => fakeGoal);

        const result = await create_weekly_goal('terminar módulo');

        expect(saveMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(fakeGoal);
    });
});

// ─────────────────────────────────────────────
// delete_daily_goal
// ─────────────────────────────────────────────
describe('delete_daily_goal', () => {
    test('chama DailyGoals.destroy com o id correto', async () => {
        DailyGoals.destroy.mockResolvedValue(1);

        await delete_daily_goal(5);

        expect(DailyGoals.destroy).toHaveBeenCalledWith({ where: { id: 5 } });
    });
});

// ─────────────────────────────────────────────
// delete_weekly_goal
// ─────────────────────────────────────────────
describe('delete_weekly_goal', () => {
    test('chama WeeklyGoals.destroy com o id correto', async () => {
        WeeklyGoals.destroy.mockResolvedValue(1);

        await delete_weekly_goal(3);

        expect(WeeklyGoals.destroy).toHaveBeenCalledWith({ where: { id: 3 } });
    });
});
