import { describe, expect, it } from 'vitest';
import { Vizualizer } from './Vizualizer';

const getColor = Vizualizer.prototype.getColor;
const rgb = (s: string) => s.match(/\d+/g)!.map(Number);

describe('getColor', () => {
    // Polarity on its absolute scale: 0, centre 5, 52
    const settings = {
        minVal: 0, maxVal: 52, centerPosition: 5, centerAbsolute: true, skipMiddle: false,
        minColor: { r: 0, g: 0, b: 255 }, maxColorMiddle: { r: 255, g: 255, b: 255 },
        minColorMiddle: { r: 255, g: 255, b: 255 }, maxColor: { r: 255, g: 255, b: 0 },
    };

    it('grades a value above the centre between the centre and the maximum colour', () => {
        // 20 is below the midpoint of 0 and 52, but above the centre
        expect(rgb(getColor(20, settings))).toEqual([255, 255, Math.floor(255 * (1 - 15 / 47))]);
    });

    it('keeps the ends and the centre', () => {
        expect(getColor(0, settings)).toBe('rgb(0,0,255)');
        expect(getColor(5, settings)).toBe('rgb(255,255,255)');
        expect(getColor(52, settings)).toBe('rgb(255,255,0)');
    });
});
