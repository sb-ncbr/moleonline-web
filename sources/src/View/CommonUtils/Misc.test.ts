import { describe, expect, it } from 'vitest';
import { flattenPoints, flattenResidues, flattenResiduesArray, parsePoint, parseResidues } from './Misc';

describe('parseResidues', () => {
    it('reads "chain number" items in either order, separated by commas', () => {
        expect(parseResidues('A 69, 386 A,B-2 12')).toEqual([
            { Chain: 'A', SequenceNumber: 69, OperatorName: '', Name: '' },
            { Chain: 'A', SequenceNumber: 386, OperatorName: '', Name: '' },
            { Chain: 'B-2', SequenceNumber: 12, OperatorName: '', Name: '' },
        ]);
    });

    it('skips items without a chain or a number', () => {
        expect(parseResidues('A, 12, A 5')).toEqual([{ Chain: 'A', SequenceNumber: 5, OperatorName: '', Name: '' }]);
        expect(parseResidues(undefined)).toEqual([]);
    });

    it('reads back what flattenResidues writes', () => {
        const residues = [{ Chain: 'A', SequenceNumber: 69 }, { Chain: 'B', SequenceNumber: 386 }];
        expect(flattenResidues(residues)).toBe('A 69, B 386');
        expect(parseResidues(flattenResidues(residues)).map(r => [r.Chain, r.SequenceNumber])).toEqual([['A', 69], ['B', 386]]);
    });
});

describe('flattening', () => {
    it('writes groups of residues and points', () => {
        const r = (Chain: string, SequenceNumber: number) => ({ Chain, SequenceNumber, OperatorName: '', Name: '' });
        expect(flattenResiduesArray([[r('A', 1)], [r('B', 2), r('B', 3)]]))
            .toBe('[A 1], [B 2, B 3]');
        expect(flattenPoints([{ x: '1', y: '2.5', z: '-3' }, { x: '0', y: '0', z: '0' }])).toBe('[1,2.5,-3],[0,0,0]');
    });
});

describe('parsePoint', () => {
    it('reads three decimal numbers separated by commas', () => {
        expect(parsePoint('1, 2.5 ,-3')).toEqual({ x: '1', y: '2.5', z: '-3' });
        expect(parsePoint(' .5,+1e2,3. ')).toEqual({ x: '.5', y: '+1e2', z: '3.' });
    });

    it('refuses anything that is not exactly three finite decimal numbers', () => {
        for (const value of ['1,a,3', '1,2', '1,2,3,4', '1,,3', ',,', '', 'Infinity,1,2', '1e400,0,0', '0x10,1,2', '1 2,3,4']) {
            expect(parsePoint(value), value).toBeUndefined();
        }
        expect(parsePoint(undefined)).toBeUndefined();
    });
});
