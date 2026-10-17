import { describe, expect, it } from 'vitest';
import { cumulativeDistances } from './algorithm';

const point = (Distance: number) => ({ Radius: 1, FreeRadius: 1, T: 0, Distance, X: 0, Y: 0, Z: 0, Charge: 0 });

describe('cumulativeDistances', () => {
    it('turns the steps of a Caver profile into the distance along the tunnel', () => {
        expect(cumulativeDistances([point(0), point(0.91), point(0.97), point(0.74)]).map(p => +p.Distance.toFixed(2))).toEqual([0, 0.91, 1.88, 2.62]);
    });

    it('leaves the channel data as it was, so rendering again gives the same', () => {
        const profile = [point(0), point(1), point(2)];
        const first = cumulativeDistances(profile);
        const again = cumulativeDistances(profile);
        expect(profile.map(p => p.Distance)).toEqual([0, 1, 2]);
        expect(again).toEqual(first);
    });
});
