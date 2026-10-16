import { MoleConfig, PoresConfig } from "../../../MoleAPIService";

// The top-level fields of each configuration; like the API, a file with any other field is refused
const MOLE_FIELDS = ["Input", "Cavity", "Tunnel", "NonActiveResidues", "QueryFilter", "Origin", "CustomExits", "PoresMerged", "PoresAuto"];
const PORES_FIELDS = ["InMembrane", "IsBetaBarrel", "Chains", "ProbeRadius", "InteriorThreshold"];
// Fields only a pore configuration has (MOLE has its radius and threshold inside Cavity)
const PORES_ONLY_FIELDS = ["InMembrane", "IsBetaBarrel", "Chains"];

// At least one field of its own kind: an object without any (e.g. {}) is neither configuration
function hasAnyField(obj: any, fields: string[]) {
    return fields.some(f => obj[f] !== undefined);
}

function isMoleConfig(obj: any): obj is MoleConfig {
    if (obj == null || typeof obj !== 'object' || !hasAnyField(obj, MOLE_FIELDS)) return false;

    if (obj.Input !== undefined) {
        if (typeof obj.Input.SpecificChains !== 'string') {
            return false;
        }
    }

    if (obj.Cavity !== undefined) {
        if (
            typeof obj.Cavity.IgnoreHETAtoms !== 'boolean' ||
            typeof obj.Cavity.IgnoreHydrogens !== 'boolean' ||
            typeof obj.Cavity.InteriorThreshold !== 'number' ||
            typeof obj.Cavity.ProbeRadius !== 'number'
        ) {
            return false;
        }
    }

    if (obj.Tunnel !== undefined) {
        if (
            typeof obj.Tunnel.WeightFunction !== 'string' ||
            typeof obj.Tunnel.BottleneckRadius !== 'number' ||
            typeof obj.Tunnel.BottleneckTolerance !== 'number' ||
            typeof obj.Tunnel.MaxTunnelSimilarity !== 'number' ||
            typeof obj.Tunnel.OriginRadius !== 'number' ||
            typeof obj.Tunnel.SurfaceCoverRadius !== 'number' ||
            (obj.Tunnel.UseCustomExitsOnly !== undefined && typeof obj.Tunnel.UseCustomExitsOnly !== 'boolean')
        ) {
            return false;
        }
    }

    if (obj.NonActiveResidues != null) { // null: none
        if (!Array.isArray(obj.NonActiveResidues)) return false;
        for (const residue of obj.NonActiveResidues) {
            if (
                typeof residue.Chain !== 'string' ||
                typeof residue.SequenceNumber !== 'number'
            ) {
                return false;
            }
        }
    }

    if (obj.Origin != null) { // null: none
        if (obj.Origin.Points !== null && !Array.isArray(obj.Origin.Points)) return false;
        if (obj.Origin.Residues !== null && !Array.isArray(obj.Origin.Residues)) return false;
    }

    if (obj.CustomExits != null) { // null: none
        if (obj.CustomExits.Points !== null && !Array.isArray(obj.CustomExits.Points)) return false;
    }

    if (obj.PoresMerged !== undefined && typeof obj.PoresMerged !== 'boolean') return false;
    if (obj.PoresAuto !== undefined && typeof obj.PoresAuto !== 'boolean') return false;

    if (obj.QueryFilter !== undefined && typeof obj.QueryFilter !== 'string') return false;

    return true;
}

function isPoresConfig(obj: any): obj is PoresConfig {
    if (obj == null || typeof obj !== 'object' || !hasAnyField(obj, PORES_ONLY_FIELDS)) return false;

    return (
        (obj.InMembrane === undefined || typeof obj.InMembrane === 'boolean') &&
        (obj.IsBetaBarrel === undefined || typeof obj.IsBetaBarrel === 'boolean') &&
        (obj.Chains === undefined || obj.Chains === null || (Array.isArray(obj.Chains) && obj.Chains.every((c: unknown) => typeof c === 'string'))) &&
        (obj.InteriorThreshold == null || typeof obj.InteriorThreshold === 'number') &&
        (obj.ProbeRadius == null || typeof obj.ProbeRadius === 'number')
    );
}

// The kind of an imported parameter file; throws an Error saying what is wrong with it
export function getParamsKind(obj: any): 'MoleConfig' | 'PoresConfig' {
    const invalid = "The file is not in the required format";
    if (obj == null || typeof obj !== 'object' || Array.isArray(obj)) throw new Error(invalid);

    const pores = hasAnyField(obj, PORES_ONLY_FIELDS);
    const unknown = Object.keys(obj).filter(f => !(pores ? PORES_FIELDS : MOLE_FIELDS).includes(f));
    if (unknown.length > 0) throw new Error(`${invalid}: unknown field ${unknown.join(", ")}`);

    if (pores ? !isPoresConfig(obj) : !isMoleConfig(obj)) throw new Error(invalid);
    return pores ? 'PoresConfig' : 'MoleConfig';
}