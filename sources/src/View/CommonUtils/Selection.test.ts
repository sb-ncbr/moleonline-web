import { describe, expect, it } from 'vitest';
import { isSameResidue, LightResidueInfo } from './Selection';

const residue = (chain: string, operatorName: string, labelChain?: boolean): LightResidueInfo =>
    ({ authSeqNumber: 188, chain: { authAsymId: chain }, labelChain, operatorName, loci: undefined, residueName: 'ARG' });

describe('isSameResidue', () => {
    it('matches the number, chain and copy', () => {
        expect(isSameResidue(residue('B', '1_555'), residue('B', '1_555', false))).toBe(true);
        expect(isSameResidue(residue('B', '1_555'), residue('B', 'ASM_2'))).toBe(false);
        expect(isSameResidue(residue('B', '1_555'), residue('C', '1_555'))).toBe(false);
    });

    it('tells an author chain ID from a label one', () => {
        expect(isSameResidue(residue('A', '1_555'), residue('A', '1_555', true))).toBe(false);
        expect(isSameResidue(residue('A', '1_555', true), residue('A', '1_555', true))).toBe(true);
    });
});
