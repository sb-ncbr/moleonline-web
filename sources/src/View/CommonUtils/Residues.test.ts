import { describe, expect, it, vi } from 'vitest';
import { Residues } from './Residues';

// the operator needs the loaded structure
vi.spyOn(Residues, 'getOperatorName').mockReturnValue('ASM_1');

describe('Residues', () => {
    it('marks only the residues lining with their backbone', () => {
        const parsed = Residues.parseResidues(['LEU 456 A Backbone', 'ILE 317 A', 'ARG 65 B_2']);
        expect(parsed.map(r => [r.name, r.authSeqNumber, r.chain.authAsymId, r.backbone])).toEqual([
            ['LEU', 456, 'A', true],
            ['ILE', 317, 'A', false],
            ['ARG', 65, 'B', false],
        ]);
    });

    it('sorts by chain and number, the backbone ones last, and keeps their mark', () => {
        expect(Residues.sort(['LEU 456 A Backbone', 'LEU 321 A', 'ILE 317 A', 'GLY 12 B', 'ILE 335 A Backbone'])).toEqual([
            'ILE 317 A', 'LEU 321 A', 'GLY 12 B', 'ILE 335 A Backbone', 'LEU 456 A Backbone',
        ]);
    });
});
