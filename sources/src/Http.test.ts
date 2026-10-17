import { describe, expect, it } from 'vitest';
import { describeError, isNotFound, isRefused, requestError, RequestError } from './Http';

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
