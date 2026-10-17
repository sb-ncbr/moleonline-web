
import { formatChains, MoleConfig, MoleConfigCavity, MoleConfigInput, MoleConfigOrigin, MoleConfigPoint, MoleConfigResidue, MoleConfigTunnel, parseChains, PoresConfig } from "../../../MoleAPIService";
import { Point, Residue, StartingPoint, StartingPointQuery, StartingPointResidue, StartingPointXYZ } from "./StartingPoints";
import { flattenResidues } from "../../CommonUtils/Misc";

export class Cavity implements MoleConfigCavity {
    public IgnoreHETAtoms: boolean
    public IgnoreHydrogens: boolean
    public InteriorThreshold: number
    public ProbeRadius: number

    public constructor() {
        this.IgnoreHETAtoms = false;
        this.IgnoreHydrogens = false;
        this.InteriorThreshold = 1.1;
        this.ProbeRadius = 5;
    }
}

export class Input implements MoleConfigInput {
    public SpecificChains: string

    public constructor() {
        this.SpecificChains = "";
    }
}

export class Tunnel implements MoleConfigTunnel {
    public WeightFunction: string;
    public BottleneckRadius: number;
    public BottleneckTolerance: number;
    public MaxTunnelSimilarity: number;
    public OriginRadius: number;
    public SurfaceCoverRadius: number;
    public UseCustomExitsOnly: boolean;

    public constructor() {
        this.WeightFunction = "VoronoiScale";
        this.BottleneckRadius = 1.2;
        this.BottleneckTolerance = 3;
        this.MaxTunnelSimilarity = 0.7;
        this.OriginRadius = 5;
        this.SurfaceCoverRadius = 10;
        this.UseCustomExitsOnly = false;
    }
}

export class Origin implements MoleConfigOrigin {
    Points: MoleConfigPoint[] | null;
    Residues: MoleConfigResidue[][] | null;
    QueryExpression: string | null;

    public constructor() {
        this.Points = null;
        this.Residues = null;
        this.QueryExpression = null;
    }
}

// A copy of an origin, its lists too
function copyOrigin(o: MoleConfigOrigin): MoleConfigOrigin {
    return { Points: o.Points?.slice() ?? null, QueryExpression: o.QueryExpression, Residues: o.Residues?.slice() ?? null };
}

function toStartingPoints(origin: MoleConfigOrigin | null): StartingPoint[] {
    if (origin === null) {
        return [];
    }
    const result: StartingPoint[] = [];
    for (const p of origin.Points ?? []) {
        result.push({ type: "Point", uiType: "3D Point", value: new Point(p.X.toString(), p.Y.toString(), p.Z.toString()) } as StartingPointXYZ);
    }
    for (const residues of origin.Residues ?? []) {
        result.push({ type: "Residue", uiType: "Residue List", value: residues.map(r => new Residue(r.SequenceNumber, r.Chain)) } as StartingPointResidue);
    }
    if (origin.QueryExpression !== null) {
        result.push({ type: "Query", uiType: "PatternQuery", residue: "", value: origin.QueryExpression } as StartingPointQuery);
    }
    return result;
}

function toOrigin(value: StartingPoint[]): MoleConfigOrigin {
    const points: MoleConfigPoint[] = [];
    const residues: MoleConfigResidue[][] = [];
    let query = null;
    for (const p of value) {
        switch (p.type) {
            case "Point":
                const point = p.value as Point;
                points.push({ X: Number(point.x), Y: Number(point.y), Z: Number(point.z) });
                break;
            case "Residue":
                residues.push((p as StartingPointResidue).value.map(r => ({ SequenceNumber: r.seqId, Chain: r.chain }) as MoleConfigResidue));
                break;
            case "Query":
                query = p.value;
        }
    }
    return { Points: points.length > 0 ? points : null, Residues: residues.length > 0 ? residues : null, QueryExpression: query };
}

// The MOLE settings of the form. A section (Cavity, Input, Tunnel) is sent only once one of its values is set,
// with the defaults for the others.
export class MoleFormData {
    private Input: MoleConfigInput | null
    private Cavity: MoleConfigCavity | null
    private Tunnel: MoleConfigTunnel | null
    private NonActiveResidues: MoleConfigResidue[] | null
    private QueryFilter: string | null
    private Origin: MoleConfigOrigin | null
    private CustomExits: MoleConfigOrigin | null
    private PoresMerged: boolean
    private PoresAuto: boolean
    private IgnoredResidues: string

    // Copies the known fields only: the API refuses unknown ones
    public constructor(data?: MoleConfig) {
        const c = data?.Cavity, i = data?.Input, t = data?.Tunnel;
        this.Cavity = c ? { IgnoreHETAtoms: c.IgnoreHETAtoms, InteriorThreshold: c.InteriorThreshold, IgnoreHydrogens: c.IgnoreHydrogens, ProbeRadius: c.ProbeRadius } : null;
        this.Input = i ? { SpecificChains: i.SpecificChains } : null;
        this.Tunnel = t ? {
            BottleneckRadius: t.BottleneckRadius, BottleneckTolerance: t.BottleneckTolerance, MaxTunnelSimilarity: t.MaxTunnelSimilarity,
            OriginRadius: t.OriginRadius, SurfaceCoverRadius: t.SurfaceCoverRadius, UseCustomExitsOnly: t.UseCustomExitsOnly, WeightFunction: t.WeightFunction
        } : null;
        this.Origin = data?.Origin ? copyOrigin(data.Origin) : null;
        this.CustomExits = data?.CustomExits ? copyOrigin(data.CustomExits) : null;
        this.NonActiveResidues = data?.NonActiveResidues?.slice() ?? null;
        // the text of the Ignored Residues box, e.g. for copied parameters
        this.IgnoredResidues = (this.NonActiveResidues === null) ? "" : flattenResidues(this.NonActiveResidues);
        this.QueryFilter = data?.QueryFilter ?? null;
        this.PoresAuto = data?.PoresAuto ?? false;
        this.PoresMerged = data?.PoresMerged ?? false;
    }

    private cavity() { return this.Cavity ??= new Cavity(); }
    private input() { return this.Input ??= new Input(); }
    private tunnel() { return this.Tunnel ??= new Tunnel(); }

    public setIgnoreHETATMs(value: boolean) { this.cavity().IgnoreHETAtoms = value; }
    public getIgnoreHETATMs() { return this.Cavity?.IgnoreHETAtoms ?? null; }

    public setIgnoreHydrogens(value: boolean) { this.cavity().IgnoreHydrogens = value; }
    public getIgnoreHydrogens() { return this.Cavity?.IgnoreHydrogens ?? null; }

    public setInteriorThreshold(value: number) { this.cavity().InteriorThreshold = value; }
    public getInteriorThreshold() { return this.Cavity?.InteriorThreshold ?? null; }

    public setProbeRadius(value: number) { this.cavity().ProbeRadius = value; }
    public getProbeRadius() { return this.Cavity?.ProbeRadius ?? null; }

    public setSpecificChains(value: string) { this.input().SpecificChains = value; }
    public getSpecificChains() { return this.Input?.SpecificChains ?? null; }

    public setOriginRadius(value: number) { this.tunnel().OriginRadius = value; }
    public getOriginRadius() { return this.Tunnel?.OriginRadius ?? null; }

    public setSurfaceCoverRadius(value: number) { this.tunnel().SurfaceCoverRadius = value; }
    public getSurfaceCoverRadius() { return this.Tunnel?.SurfaceCoverRadius ?? null; }

    public setWeightFunction(value: string) { this.tunnel().WeightFunction = value; }
    public getWeightFunction() { return this.Tunnel?.WeightFunction ?? null; }

    public setBottleneckRadius(value: number) { this.tunnel().BottleneckRadius = value; }
    public getBottleneckRadius() { return this.Tunnel?.BottleneckRadius ?? null; }

    public setBottleneckTolerance(value: number) { this.tunnel().BottleneckTolerance = value; }
    public getBottleneckTolerance() { return this.Tunnel?.BottleneckTolerance ?? null; }

    public setMaxTunnelSimilarity(value: number) { this.tunnel().MaxTunnelSimilarity = value; }
    public getMaxTunnelSimilarity() { return this.Tunnel?.MaxTunnelSimilarity ?? null; }

    public setMergePores(value: boolean) { this.PoresMerged = value; }
    public getMergePores() { return this.PoresMerged; }

    public setAutomaticPores(value: boolean) { this.PoresAuto = value; }
    public getAutomaticPores() { return this.PoresAuto; }

    public setIgnoredResidues(value: MoleConfigResidue[]) { this.NonActiveResidues = value.slice(); }

    public setIgnoredResiduesStr(value: string) { this.IgnoredResidues = value; }
    public getIgnoredResiduesStr() { return this.IgnoredResidues; }

    public setQueryFilter(value: string) { this.QueryFilter = value; }
    public getQueryFilter() { return this.QueryFilter; }

    public setStartingPoints(value: StartingPoint[]) { this.Origin = toOrigin(value); }
    public getStartingPoints() { return toStartingPoints(this.Origin); }

    public setEndPoints(value: StartingPoint[]) { this.CustomExits = toOrigin(value); }
    public getEndingPoints() { return toStartingPoints(this.CustomExits); }

    public getPackage(): MoleConfig {
        return {
            Cavity: this.Cavity ?? void 0,
            CustomExits: this.CustomExits,
            Input: this.Input ?? void 0,
            NonActiveResidues: this.NonActiveResidues,
            Origin: this.Origin,
            PoresAuto: this.PoresAuto,
            PoresMerged: this.PoresMerged,
            QueryFilter: this.QueryFilter,
            Tunnel: this.Tunnel ?? void 0
        }
    }
}

export class PoresFormData {
    private InMembrane: boolean;
    private IsBetaBarrel: boolean;
    // as typed in the form ("A, B"); the request gets the list
    private ChainsText: string;
    private ProbeRadius: number | null;
    private InteriorThreshold: number | null;

    public constructor(data?: PoresConfig) {
        this.InMembrane = data?.InMembrane ?? false;
        this.IsBetaBarrel = data?.IsBetaBarrel ?? false;
        this.ChainsText = formatChains(data?.Chains);
        this.InteriorThreshold = data?.InteriorThreshold ?? null;
        this.ProbeRadius = data?.ProbeRadius ?? null;
    }

    public setBetaStructure(value: boolean) { this.IsBetaBarrel = value; }
    public getBetaStructure() { return this.IsBetaBarrel; }

    public setMembraneRegion(value: boolean) { this.InMembrane = value; }
    public getMembraneRegion() { return this.InMembrane; }

    public setSpecificChains(value: string) { this.ChainsText = value; }
    public getSpecificChains() { return this.ChainsText; }

    public setProbeRadius(value: number) { this.ProbeRadius = value; }
    public getProbeRadius() { return this.ProbeRadius; }

    public setInteriorThreshold(value: number) { this.InteriorThreshold = value; }
    public getInteriorThreshold() { return this.InteriorThreshold; }

    public getPackage(): PoresConfig {
        return {
            Chains: parseChains(this.ChainsText),
            InMembrane: this.InMembrane,
            IsBetaBarrel: this.IsBetaBarrel,
            InteriorThreshold: this.InteriorThreshold,
            ProbeRadius: this.ProbeRadius
        }
    }
}
