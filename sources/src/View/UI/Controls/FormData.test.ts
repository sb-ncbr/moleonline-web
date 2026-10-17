import { describe, expect, it } from 'vitest';
import { MoleConfig, PoresConfig } from '../../../MoleAPIService';
import { MoleFormData, PoresFormData } from './FormData';

const fullMole: MoleConfig = {
    Input: { SpecificChains: 'A, B' },
    Cavity: { IgnoreHETAtoms: true, IgnoreHydrogens: false, InteriorThreshold: 1.2, ProbeRadius: 4 },
    Tunnel: { WeightFunction: 'LengthAndRadius', BottleneckRadius: 1.1, BottleneckTolerance: 2, MaxTunnelSimilarity: 0.8, OriginRadius: 4, SurfaceCoverRadius: 9, UseCustomExitsOnly: true },
    NonActiveResidues: [{ Chain: 'A', SequenceNumber: 69 }, { Chain: 'A', SequenceNumber: 386 }] as any,
    QueryFilter: 'Residues("HEM")',
    Origin: { Points: [{ X: 1, Y: 2, Z: 3 }], Residues: [[{ Chain: 'A', SequenceNumber: 212 }]] as any, QueryExpression: 'Atoms("Fe")' },
    CustomExits: { Points: null, Residues: [[{ Chain: 'B', SequenceNumber: 5 }, { Chain: 'B', SequenceNumber: 6 }]] as any, QueryExpression: null },
    PoresMerged: true,
    PoresAuto: true,
};

describe('MoleFormData', () => {
    it('starts empty: only what the form sets is sent', () => {
        const f = new MoleFormData();
        expect(f.getPackage()).toEqual({
            Cavity: undefined, CustomExits: null, Input: undefined, NonActiveResidues: null, Origin: null,
            PoresAuto: false, PoresMerged: false, QueryFilter: null, Tunnel: undefined,
        });
        expect([f.getProbeRadius(), f.getWeightFunction(), f.getSpecificChains(), f.getQueryFilter(), f.getIgnoredResiduesStr()]).toEqual([null, null, null, null, '']);
        expect(f.getStartingPoints()).toEqual([]);
        expect(f.getEndingPoints()).toEqual([]);
    });

    it('creates a section with its defaults when one of its values is set', () => {
        const f = new MoleFormData();
        f.setProbeRadius(3);
        f.setBottleneckTolerance(4);
        f.setSpecificChains('C');
        const p = f.getPackage();
        expect(p.Cavity).toEqual({ IgnoreHETAtoms: false, IgnoreHydrogens: false, InteriorThreshold: 1.1, ProbeRadius: 3 });
        expect(p.Tunnel).toEqual({ WeightFunction: 'VoronoiScale', BottleneckRadius: 1.2, BottleneckTolerance: 4, MaxTunnelSimilarity: 0.7, OriginRadius: 5, SurfaceCoverRadius: 10, UseCustomExitsOnly: false });
        expect(p.Input).toEqual({ SpecificChains: 'C' });
        expect(f.getBottleneckTolerance()).toBe(4);
    });

    it('sends back a copied configuration as it was, without unknown fields', () => {
        const withExtra = { ...fullMole, Cavity: { ...fullMole.Cavity, Extra: 1 } } as any;
        const f = new MoleFormData(withExtra);
        expect(f.getPackage()).toEqual(fullMole);
        expect(f.getIgnoredResiduesStr()).toBe('A 69, A 386');
        expect([f.getIgnoreHETATMs(), f.getInteriorThreshold(), f.getOriginRadius(), f.getMergePores(), f.getAutomaticPores()]).toEqual([true, 1.2, 4, true, true]);
    });

    it('does not share arrays with the configuration it was made from', () => {
        const config = structuredClone(fullMole);
        const f = new MoleFormData(config);
        config.Origin!.Points!.push({ X: 0, Y: 0, Z: 0 });
        config.NonActiveResidues!.pop();
        expect(f.getPackage().Origin!.Points).toHaveLength(1);
        expect(f.getPackage().NonActiveResidues).toHaveLength(2);
    });

    it('turns the origin and the exits into starting points and back', () => {
        const f = new MoleFormData(fullMole);
        const start = f.getStartingPoints();
        expect(start.map(p => p.type)).toEqual(['Point', 'Residue', 'Query']);
        expect(start[0].value).toEqual({ x: '1', y: '2', z: '3' });
        expect(start[1].value).toEqual([{ seqId: 212, chain: 'A' }]);
        expect(f.getEndingPoints().map(p => p.type)).toEqual(['Residue']);

        const g = new MoleFormData();
        g.setStartingPoints(start);
        g.setEndPoints(f.getEndingPoints());
        expect(g.getPackage().Origin).toEqual(fullMole.Origin);
        expect(g.getPackage().CustomExits).toEqual(fullMole.CustomExits);
    });
});

describe('PoresFormData', () => {
    it('starts with the defaults', () => {
        expect(new PoresFormData().getPackage()).toEqual({ Chains: [], InMembrane: false, IsBetaBarrel: false, InteriorThreshold: null, ProbeRadius: null });
    });

    it('sends back a copied configuration, the chains as a list', () => {
        const config: PoresConfig = { Chains: ['A', 'B'], InMembrane: true, IsBetaBarrel: true, InteriorThreshold: 0.8, ProbeRadius: 13 };
        const f = new PoresFormData(config);
        expect(f.getSpecificChains()).toBe('A, B');
        f.setSpecificChains(' C ,D,');
        expect(f.getPackage()).toEqual({ ...config, Chains: ['C', 'D'] });
    });
});
