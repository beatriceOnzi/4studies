import {validate_datetime} from '../public/scripts/clock_utils';

describe('validate_datetime', () => {
    test('valida um horario correto', async () => {
        cell = null;
        const valid_hour ='31/08/2026 09:44';
        expect(validate_datetime(cell, valid_hour)).toBe(true);
    });

    test('valida um horario correto', async () => {
        const valid_hour ='26/03/2026 23:54';
        expect(validate_datetime(cell, valid_hour)).toBe(true);
    });

    test('nao valida horario com mais algarismos', async () => {
        const invalid_hour = '26/08/2026 09:454';
        expect(validate_datetime(cell, invalid_hour)).toBe(false);
    });

    test('nao valida horario com algarismos invalidos para Horas', async () => {
        const invalid_hour = '26/08/2026 09:94';
        expect(validate_datetime(cell, invalid_hour)).toBe(false);
    });
    test('nao valida horario com letras', async () => {
        const invalid_hour = '26/08/2026 09:f4';
        expect(validate_datetime(cell, invalid_hour)).toBe(false);
    });
    test('nao valida data invalida', async () => {
        const invalid_hour = '26/98/2026 09:44';
        expect(validate_datetime(cell, invalid_hour)).toBe(false);
    });
    test('nao valida data com letras ', async () => {
        const invalid_hour = '2w/98/2026 09:34';
        expect(validate_datetime(cell, invalid_hour)).toBe(false);
    });
    test('nao valida data invalida ', async () => {
        const invalid_hour = '26/982026 09:04';
        expect(validate_datetime(cell, invalid_hour)).toBe(false);
    });

});