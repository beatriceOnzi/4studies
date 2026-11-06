// tests/notes_service.test.js

const Notes = require('../models/Notes');

const {
    get_notes,
    get_note_by_id,
    create_note,
    save_note,
    save_title,
    delete_note,
} = require('../services/notes_service');

jest.mock('../models/Notes');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('get_notes', () => {
    test('retorna todos os registros de Notes', async () => {
        const fakeNotes = [
            { id: 1, note: 'minha nota' },
            { id: 2, note: 'outra nota' },
        ];
        Notes.findAll.mockResolvedValue(fakeNotes);

        const result = await get_notes();

        expect(Notes.findAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual(fakeNotes);
    });

    test('retorna lista vazia quando não há notas', async () => {
        Notes.findAll.mockResolvedValue([]);

        const result = await get_notes();

        expect(result).toEqual([]);
    });
});

describe('create_note', () => {
    test('cria e retorna um novo registro de Notes', async () => {
        const fakeNote = { id: 1, note: '' };
        Notes.create.mockResolvedValue(fakeNote);

        const result = await create_note();

        expect(Notes.create).toHaveBeenCalledWith({});
        expect(result).toEqual(fakeNote);
    });
});

describe('save_note', () => {
    test('atualiza o texto e salva a nota existente', async () => {
        const note = { id: 1, note: 'antigo', save: jest.fn().mockResolvedValue('salvo') };
        Notes.findByPk.mockResolvedValue(note);

        const result = await save_note('novo', 1);

        expect(Notes.findByPk).toHaveBeenCalledWith(1);
        expect(Notes.create).not.toHaveBeenCalled();
        expect(note.note).toBe('novo');
        expect(note.save).toHaveBeenCalledTimes(1);
        expect(result).toBe('salvo');
    });

    test('cria uma nota nova quando o id não existe', async () => {
        const created = { note: '', save: jest.fn().mockResolvedValue('criado') };
        Notes.findByPk.mockResolvedValue(null);
        Notes.create.mockResolvedValue(created);

        const result = await save_note('texto', 99);

        expect(Notes.create).toHaveBeenCalledWith({});
        expect(created.note).toBe('texto');
        expect(created.save).toHaveBeenCalledTimes(1);
        expect(result).toBe('criado');
    });
});

describe('save_title', () => {
    test('atualiza o título e salva a nota existente', async () => {
        const note = { id: 1, title: 'a', save: jest.fn().mockResolvedValue('salvo') };
        Notes.findByPk.mockResolvedValue(note);

        const result = await save_title('b', 1);

        expect(Notes.findByPk).toHaveBeenCalledWith(1);
        expect(Notes.create).not.toHaveBeenCalled();
        expect(note.title).toBe('b');
        expect(note.save).toHaveBeenCalledTimes(1);
        expect(result).toBe('salvo');
    });

    test('cria uma nota nova quando o id não existe', async () => {
        const created = { title: '', save: jest.fn().mockResolvedValue('criado') };
        Notes.findByPk.mockResolvedValue(null);
        Notes.create.mockResolvedValue(created);

        const result = await save_title('título', 42);

        expect(Notes.create).toHaveBeenCalledWith({});
        expect(created.title).toBe('título');
        expect(created.save).toHaveBeenCalledTimes(1);
        expect(result).toBe('criado');
    });
});

describe('delete_note', () => {
    test('destrói a nota quando ela existe', async () => {
        const note = { destroy: jest.fn().mockResolvedValue() };
        Notes.findByPk.mockResolvedValue(note);

        await delete_note(1);

        expect(Notes.findByPk).toHaveBeenCalledWith(1);
        expect(note.destroy).toHaveBeenCalledTimes(1);
    });

    test('não faz nada quando a nota não existe', async () => {
        Notes.findByPk.mockResolvedValue(null);

        await expect(delete_note(1)).resolves.toBeUndefined();
    });
});