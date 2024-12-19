import { MoleConfig, PoresConfig } from "../../../MoleAPIService";

function isMoleConfig(obj: any): obj is MoleConfig {
    if (obj == null || typeof obj !== 'object') return false;

    if (obj.Input !== undefined) {
        if (typeof obj.Input.SpecificChains !== 'string' || typeof obj.Input.ReadAllModels !== 'boolean') {
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

    if (obj.NonActiveResidues !== undefined) {
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

    if (obj.Origin !== undefined) {
        if (obj.Origin.Points !== null && !Array.isArray(obj.Origin.Points)) return false;
        if (obj.Origin.Residues !== null && !Array.isArray(obj.Origin.Residues)) return false;
    }

    if (obj.CustomExits !== undefined) {
        if (obj.CustomExits.Points !== null && !Array.isArray(obj.CustomExits.Points)) return false;
    }

    if (obj.PoresMerged !== undefined && typeof obj.PoresMerged !== 'boolean') return false;
    if (obj.PoresAuto !== undefined && typeof obj.PoresAuto !== 'boolean') return false;

    if (obj.QueryFilter !== undefined && typeof obj.QueryFilter !== 'string') return false;

    return true;
}

function isPoresConfig(obj: any): obj is PoresConfig {
    if (obj == null || typeof obj !== 'object') return false;

    return (
        (obj.InMembrane === undefined || typeof obj.InMembrane === 'boolean') &&
        (obj.IsBetaBarel === undefined || typeof obj.IsBetaBarel === 'boolean') &&
        (obj.Chains === undefined || obj.Chains === null || typeof obj.Chains === 'string') &&
        (obj.InteriorThreshold === null || typeof obj.InteriorThreshold === 'number') &&
        (obj.ProbeRadius === null || typeof obj.ProbeRadius === 'number')
    );
}

export function isMoleConfigOrPoresConfig(obj: any): 'MoleConfig' | 'PoresConfig' | null {
    if (isPoresConfig(obj)) return 'PoresConfig';
    if (isMoleConfig(obj)) return 'MoleConfig';
    return null;
}