import { afterEach, describe, expect, it, vi } from 'vitest';
import { JSON2CIF } from './converter';
import { loadCifTunnels } from './converter2json';

// A structure whose chain has different author and label IDs ("L" and "A", as in 2bfu)
const atomSite = `data_test
loop_
_atom_site.group_PDB
_atom_site.id
_atom_site.label_asym_id
_atom_site.auth_asym_id
_atom_site.auth_comp_id
_atom_site.auth_seq_id
ATOM 1 A L ILE 72
ATOM 2 A L TRP 136
`;

const properties = { Charge: 0, Hydropathy: 1, Hydrophobicity: 1, Mutability: 70, NumNegatives: 0, NumPositives: 0, Polarity: 1 };
const tunnel = {
    Id: '1', Type: 'Tunnel', Auto: true, Cavity: 1, Properties: properties,
    Profile: [{ Radius: 1, FreeRadius: 1, Distance: 0, T: 0, X: 0, Y: 0, Z: 0, Charge: 0 }],
    Layers: {
        LayerWeightedProperties: { Hydropathy: 1, Hydrophobicity: 1, Mutability: 70, Polarity: 1 },
        LayersInfo: [{
            Properties: properties,
            LayerGeometry: { MinRadius: 1, MinFreeRadius: 1, StartDistance: 0, EndDistance: 1, LocalMinimum: false, Bottleneck: true },
            Residues: ['ILE 72 L', 'TRP 136 L Backbone'],
            FlowIndices: ['0', '1'],
        }],
    },
};

afterEach(() => { vi.unstubAllGlobals(); });

describe('mmCIF tunnels', () => {
    it('name the lining residues by author chain ID, as the tunnels dictionary does, both ways', async () => {
        const cif = atomSite + JSON2CIF('tunnels', JSON.stringify({ Channels: { Tunnels_MOLE: [tunnel] }, Annotations: [] }));
        expect(cif).toMatch(/^1 1 NO L 72 /m);
        vi.stubGlobal('fetch', async () => new Response(cif));
        const data = await loadCifTunnels('/structure.cif');
        const loaded = Object.values(data!.Channels).flat() as any[];
        expect(loaded[0].Layers.LayersInfo[0].Residues).toEqual(['ILE 72 L', 'TRP 136 L Backbone']);
    });
});
