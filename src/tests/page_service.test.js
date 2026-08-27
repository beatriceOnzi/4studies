// tests/page_service.test.js

const clockService = require('../services/clock_service');
const notesService = require('../services/notes_service');
const goalsService = require('../services/goals_service');
const timeService  = require('../services/time_service');

const { get_data } = require('../services/page_service');

jest.mock('../services/clock_service');
jest.mock('../services/notes_service');
jest.mock('../services/goals_service');
jest.mock('../services/time_service');

beforeEach(() => {
    jest.clearAllMocks();
});

function setupDefaultMocks() {
    clockService.is_running.mockResolvedValue(false);
    clockService.getStudyToday.mockResolvedValue({ timeInMsToday: 3661000 });

    goalsService.get_daily_goals.mockResolvedValue([{ id: 1, daily_goals: 'estudar' }]);
    goalsService.get_weekly_goals.mockResolvedValue([{ id: 1, weekly_goals: 'terminar módulo' }]);
    notesService.get_notes.mockResolvedValue({ id: 1, note: 'minhas notas' });

    timeService.get_hours_completed.mockResolvedValue('05:00:00');
    timeService.get_goal_hours.mockResolvedValue('10');
    timeService.msToHours.mockReturnValue('01:01:01');
}

// get_data
describe('get_data', () => {
    test('agrega em um único objeto os dados de clock, notas, metas e horas', async () => {
        setupDefaultMocks();

        const data = await get_data();

        expect(data).toEqual({
            time: '01:01:01',
            is_running: false,
            notes: 'minhas notas',
            daily_goals: [{ id: 1, daily_goals: 'estudar' }],
            weekly_goals: [{ id: 1, weekly_goals: 'terminar módulo' }],
            hours_completed: '05:00:00',
            goal_hours: '10',
        });
    });

    test('reflete is_running = true quando o relógio está em execução', async () => {
        setupDefaultMocks();
        clockService.is_running.mockResolvedValue(true);

        const data = await get_data();

        expect(data.is_running).toBe(true);
    });

    test('converte o tempo estudado hoje (timeInMsToday) usando msToHours', async () => {
        setupDefaultMocks();
        clockService.getStudyToday.mockResolvedValue({ timeInMsToday: 7200000 });
        timeService.msToHours.mockReturnValue('02:00:00');

        const data = await get_data();

        expect(timeService.msToHours).toHaveBeenCalledWith(7200000);
        expect(data.time).toBe('02:00:00');
    });

    test('extrai apenas o campo "note" do registro retornado por get_notes', async () => {
        setupDefaultMocks();
        notesService.get_notes.mockResolvedValue({ id: 2, note: 'texto salvo' });

        const data = await get_data();

        expect(data.notes).toBe('texto salvo');
    });

    test('repassa as listas de metas diárias e semanais vindas do notes_service', async () => {
        setupDefaultMocks();
        const dailyGoals = [{ id: 1, daily_goals: 'a' }, { id: 2, daily_goals: 'b' }];
        const weeklyGoals = [{ id: 1, weekly_goals: 'c' }];
        goalsService.get_daily_goals.mockResolvedValue(dailyGoals);
        goalsService.get_weekly_goals.mockResolvedValue(weeklyGoals);

        const data = await get_data();

        expect(data.daily_goals).toEqual(dailyGoals);
        expect(data.weekly_goals).toEqual(weeklyGoals);
    });

    test('repassa horas completadas e meta de horas vindas do time_service', async () => {
        setupDefaultMocks();
        timeService.get_hours_completed.mockResolvedValue('07:30:00');
        timeService.get_goal_hours.mockResolvedValue('36');

        const data = await get_data();

        expect(data.hours_completed).toBe('07:30:00');
        expect(data.goal_hours).toBe('36');
    });
});
