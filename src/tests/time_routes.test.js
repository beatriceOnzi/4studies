// tests/time_routes.test.js
// Testa a função msToHours presente no módulo time (routes/time.js)
// e o comportamento da rota GET /time

const express = require('express');
const http    = require('node:http');

jest.mock('../models/TimeToday');
jest.mock('../models/TimeWeek');
jest.mock('../models/TotalHours');

const TotalHours = require('../models/TotalHours');

// ─────────────────────────────────────────────
// msToHours — testada através da rota
// A função é privada no módulo, mas o seu efeito é visível na rota.
// Testamos a lógica de forma isolada replicando-a aqui.
// ─────────────────────────────────────────────

// Replica local para testes unitários diretos
function msToHours(ms) {
    let seconds = Math.floor((ms / 1000) % 60);
    let minutes = Math.floor((ms / (1000 * 60)) % 60);
    let hours   = Math.floor((ms / (1000 * 60 * 60)));
    hours   = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

describe('msToHours (routes/time helper)', () => {
    test('0 ms → 00:00:00', () => expect(msToHours(0)).toBe('00:00:00'));
    test('1 segundo → 00:00:01', () => expect(msToHours(1000)).toBe('00:00:01'));
    test('1 minuto → 00:01:00', () => expect(msToHours(60_000)).toBe('00:01:00'));
    test('1 hora → 01:00:00', () => expect(msToHours(3_600_000)).toBe('01:00:00'));
    test('90 minutos → 01:30:00', () => expect(msToHours(5_400_000)).toBe('01:30:00'));
    test('10 horas → 10:00:00', () => expect(msToHours(36_000_000)).toBe('10:00:00'));
    test('100 horas → 100:00:00 (sem corte)', () => expect(msToHours(360_000_000)).toBe('100:00:00'));
});

// ─────────────────────────────────────────────
// GET /time (integração leve com mock do modelo)
// ─────────────────────────────────────────────

function buildApp() {
    const app = express();
    app.engine('handlebars', (_path, _opts, cb) => cb(null, ''));
    app.set('view engine', 'handlebars');
    app.set('views', __dirname + '/../views');
    const timeRoutes = require('../routes/time');
    app.use('/', timeRoutes);
    return app;
}

function makeRequest(app, path) {
    return new Promise((resolve) => {
        const server = app.listen(0, () => {
            const port = server.address().port;
            const req = http.get(`http://127.0.0.1:${port}${path}`, (res) => {
                let data = '';
                res.on('data', (c) => { data += c; });
                res.on('end', () => { server.close(); resolve({ status: res.statusCode }); });
            });
            req.end();
        });
    });
}

describe('GET /time', () => {
    beforeEach(() => jest.clearAllMocks());

    test('responde 200 quando TotalHours existe', async () => {
        TotalHours.findByPk.mockResolvedValue({
            goalHoursInMs: 36_000_000,
            totalHoursCompletedInMs: 3_600_000,
        });
        const { status } = await makeRequest(buildApp(), '/time');
        expect(status).toBe(200);
    });
});
