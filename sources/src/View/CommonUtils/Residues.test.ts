import { describe, expect, it, vi } from 'vitest';
import { Residues } from './Residues';

// the operator needs the loaded structure
vi.spyOn(Residues, 'getOperatorName').mockImplementation(copy => 'ASM_' + copy);

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

    it('keeps the assembly copy of a residue', () => {
        const parsed = Residues.parseResidues(['ASN 221 C', 'ASN 221 C_2 Backbone']);
        expect(parsed.map(r => [r.chain.authAsymId, r.copy, r.operatorName, r.backbone])).toEqual([
            ['C', '1', 'ASM_1', false],
            ['C', '2', 'ASM_2', true],
        ]);
    });

    it('sorts the copies of a chain apart and keeps their suffix', () => {
        expect(Residues.sort(['HIS 220 C_2', 'ASN 221 C', 'HIS 220 B', 'ASN 221 C_2', 'ASP 118 C_2'])).toEqual([
            'HIS 220 B', 'ASN 221 C', 'ASP 118 C_2', 'HIS 220 C_2', 'ASN 221 C_2',
        ]);
    });

    it('accepts negative residue numbers and chain IDs with digits', () => {
        const parsed = Residues.parseResidues(['ASP -1 A', 'GLY 12 1', 'SER 5 AA1_3 Backbone']);
        expect(parsed.map(r => [r.authSeqNumber, r.chain.authAsymId, r.copy, r.backbone])).toEqual([
            [-1, 'A', '1', false],
            [12, '1', '1', false],
            [5, 'AA1', '3', true],
        ]);
        expect(Residues.sort(['GLY 12 1', 'ASP -1 A', 'LEU -5 A'])).toEqual(['GLY 12 1', 'LEU -5 A', 'ASP -1 A']);
    });
});
