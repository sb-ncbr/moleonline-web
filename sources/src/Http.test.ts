import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommonOptions } from '../config/common';
import { describeError, getJson, getText, isNotFound, isRefused, postJson, requestError, RequestError } from './Http';

const response = (status: number, body: unknown, statusText = 'Status') =>
    new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, statusText });

describe('requestError', () => {
    it("uses the API's ErrorMsg when its report says why", async () => {
        const e = await requestError('POST', '/api/Init', response(413, { ErrorMsg: ' The file is too large. ' }));
        expect(e).toBeInstanceOf(RequestError);
        expect(e.message).toBe('The file is too large.');
        expect(e.status).toBe(413);
        expect(e.fromApi).toBe(true);
    });

    it('falls back to the method, URL and status without a report', async () => {
        const e = await requestError('GET', '/api/Data/x', response(502, '<html>Bad Gateway</html>', 'Bad Gateway'));
        expect(e.message).toBe('GET: /api/Data/x 502: Bad Gateway');
        expect(e.fromApi).toBe(false);
    });
});

describe('describeError', () => {
    it("shows the API's own message as is", () => {
        expect(describeError(new RequestError('Computation was deleted.', 410, true), 'Could not load')).toBe('Computation was deleted.');
    });

    it('adds the reason to the fallback otherwise', () => {
        expect(describeError(new TypeError('Failed to fetch'), 'Could not load')).toBe('Could not load (Failed to fetch)');
        expect(describeError('timeout', 'Could not load')).toBe('Could not load (timeout)');
    });
});

describe('isNotFound and isRefused', () => {
    const err = (status: number) => new RequestError('x', status, false);

    it('recognises 404', () => {
        expect(isNotFound(err(404))).toBe(true);
        expect(isNotFound(err(410))).toBe(false);
        expect(isNotFound(new Error('404'))).toBe(false);
    });

    it('counts 4xx as refused, except a timeout or too many requests', () => {
        expect([400, 404, 410, 413].map(s => isRefused(err(s)))).toEqual([true, true, true, true]);
        expect([408, 429, 500, 503].map(s => isRefused(err(s)))).toEqual([false, false, false, false]);
        expect(isRefused(new TypeError('Failed to fetch'))).toBe(false);
    });
});

describe('requests', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        CommonOptions.DEBUG_MODE = false;
    });

    it('returns the parsed JSON or the text', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => response(200, { a: 1 })));
        await expect(getJson('/api/x')).resolves.toEqual({ a: 1 });
        await expect(getText('/api/x')).resolves.toBe('{"a":1}');
    });

    it('sends JSON bodies with their content type', async () => {
        const fetch = vi.fn(async (_url: string, _init: RequestInit) => response(200, { ok: true }));
        vi.stubGlobal('fetch', fetch);
        await postJson('/api/Submit', { b: 2 });
        const init = fetch.mock.calls[0][1];
        expect(init.method).toBe('POST');
        expect(init.body).toBe('{"b":2}');
        expect(new Headers(init.headers).get('Content-Type')).toBe('application/json');
    });

    it("rejects with the API's message", async () => {
        vi.stubGlobal('fetch', vi.fn(async () => response(410, { ErrorMsg: 'Computation was deleted.' })));
        await expect(getJson('/api/Status/x')).rejects.toMatchObject({ message: 'Computation was deleted.', status: 410, fromApi: true });
    });

    it('times a request in debug mode until its body is read', async () => {
        CommonOptions.DEBUG_MODE = true;
        const events: string[] = [];
        vi.spyOn(console, 'time').mockImplementation(() => { events.push('time'); });
        vi.spyOn(console, 'timeEnd').mockImplementation(label => { events.push('timeEnd ' + label); });
        vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => { events.push('body read'); return {}; } })));
        await getJson('/api/x');
        expect(events).toEqual(['time', 'body read', 'timeEnd GET /api/x']);
    });
});
