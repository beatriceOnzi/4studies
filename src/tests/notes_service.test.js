// tests/notes_service.test.js

const Notes       = require('../models/Notes');

const {
    get_notes,
    create_notes,
} = require('../services/notes_service');


jest.mock('../models/Notes');

beforeEach(() => {
    jest.clearAllMocks();
});


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

describe('create_notes', () => {
    test('cria e retorna um novo registro de Notes', async () => {
        const fakeNote = { id: 1, note: '' };
        Notes.create.mockResolvedValue(fakeNote);

        const result = await create_notes();

        expect(Notes.create).toHaveBeenCalledWith({});
        expect(result).toEqual(fakeNote);
    });
});
