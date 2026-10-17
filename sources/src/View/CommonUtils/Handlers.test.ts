import { describe, expect, it } from 'vitest';
import { Handlers } from './Handlers';

describe('Handlers', () => {
    it('invokes every attached handler with the arguments', () => {
        const h = new Handlers<[number, string]>();
        const calls: string[] = [];
        h.attach((n, s) => calls.push(`a ${n} ${s}`));
        h.attach((n, s) => calls.push(`b ${n} ${s}`));
        h.invoke(1, 'x');
        expect(calls).toEqual(['a 1 x', 'b 1 x']);
    });

    it('detaches only its own registration, also of a handler attached twice', () => {
        const h = new Handlers<[]>();
        let count = 0;
        const handler = () => count++;
        const detachFirst = h.attach(handler);
        h.attach(handler);
        detachFirst();
        detachFirst(); // a second call does nothing
        h.invoke();
        expect(count).toBe(1);
    });

    it('delivers the event to all handlers when one detaches itself', () => {
        const h = new Handlers<[]>();
        const calls: string[] = [];
        const detach = h.attach(() => { calls.push('once'); detach(); });
        h.attach(() => calls.push('always'));
        h.invoke();
        h.invoke();
        expect(calls).toEqual(['once', 'always', 'always']);
    });
});
