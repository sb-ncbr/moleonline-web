// import Service = MoleOnlineWebUI.Service.MoleAPI;

import { MoleConfig, MoleConfigCavity, MoleConfigInput, MoleConfigOrigin, MoleConfigPoint, MoleConfigResidue, MoleConfigTunnel, PoresConfig } from "../../../MoleAPIService";
import { Point, Residue, StartingPoint, StartingPointQuery, StartingPointResidue, StartingPointXYZ } from "../Common/Controls/FromLiteMol";

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
    public ReadAllModels: boolean
    public SpecificChains: string

    public constructor() {
        this.ReadAllModels = false;
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

    public constructor(data?: MoleConfig) {
        if (data !== void 0 && data.Cavity !== null && data.Cavity !== void 0) {
            this.Cavity = {
                IgnoreHETAtoms: data.Cavity.IgnoreHETAtoms,
                InteriorThreshold: data.Cavity.InteriorThreshold,
                IgnoreHydrogens: data.Cavity.IgnoreHydrogens,
                ProbeRadius: data.Cavity.ProbeRadius
            };
        }
        else {
            this.Cavity = null;
        }

        if (data !== void 0 && data.CustomExits !== null && data.CustomExits !== void 0) {
            this.CustomExits = {
                Points: (data.CustomExits.Points !== null) ? data.CustomExits.Points.slice() : null,
                QueryExpression: data.CustomExits.QueryExpression,
                Residues: (data.CustomExits.Residues !== null) ? data.CustomExits.Residues.slice() : null
            }
        }
        else {
            this.CustomExits = null;
        }

        if (data !== void 0 && data.Input !== null && data.Input !== void 0) {
            this.Input = {
                ReadAllModels: data.Input.ReadAllModels,
                SpecificChains: data.Input.SpecificChains
            }
        }
        else {
            this.Input = null;
        }

        if (data !== void 0 && data.NonActiveResidues !== null && data.NonActiveResidues !== void 0) {
            this.NonActiveResidues = data.NonActiveResidues.slice();
        }
        else {
            this.NonActiveResidues = null;
        }

        if (data !== void 0 && data.Origin !== null && data.Origin !== void 0) {
            this.Origin = {
                Points: (data.Origin.Points !== null) ? data.Origin.Points.slice() : null,
                QueryExpression: data.Origin.QueryExpression,
                Residues: (data.Origin.Residues !== null) ? data.Origin.Residues.slice() : null
            }
        }
        else {
            this.Origin = null;
        }

        if (data !== void 0 && data.PoresAuto !== null && data.PoresAuto !== void 0) {
            this.PoresAuto = data.PoresAuto;
        }
        else {
            this.PoresAuto = false;
        }

        if (data !== void 0 && data.PoresMerged !== null && data.PoresMerged !== void 0) {
            this.PoresMerged = data.PoresMerged;
        }
        else {
            this.PoresMerged = false;
        }

        if (data !== void 0 && data.QueryFilter !== null && data.QueryFilter !== void 0) {
            this.QueryFilter = data.QueryFilter;
        }
        else {
            this.QueryFilter = null;
        }

        if (data !== void 0 && data.Tunnel !== null && data.Tunnel !== void 0) {
            this.Tunnel = {
                BottleneckRadius: data.Tunnel.BottleneckRadius,
                BottleneckTolerance: data.Tunnel.BottleneckTolerance,
                MaxTunnelSimilarity: data.Tunnel.MaxTunnelSimilarity,
                OriginRadius: data.Tunnel.OriginRadius,
                SurfaceCoverRadius: data.Tunnel.SurfaceCoverRadius,
                UseCustomExitsOnly: data.Tunnel.UseCustomExitsOnly,
                WeightFunction: data.Tunnel.WeightFunction
            }
        }
        else {
            this.Tunnel = null;
        }
    }

    public setIgnoreHETATMs(value: boolean) {
        if (this.Cavity === null) {
            this.Cavity = new Cavity();
        }
        this.Cavity.IgnoreHETAtoms = value;
    }

    public getIgnoreHETATMs() {
        if (this.Cavity === null) {
            return null;
        }

        return this.Cavity.IgnoreHETAtoms;
    }

    public setIgnoreHydrogens(value: boolean) {
        if (this.Cavity === null) {
            this.Cavity = new Cavity();
        }
        this.Cavity.IgnoreHydrogens = value;
    }

    public getIgnoreHydrogens() {
        if (this.Cavity === null) {
            return null;
        }

        return this.Cavity.IgnoreHydrogens;
    }

    public setInteriorThreshold(value: number) {
        if (this.Cavity === null) {
            this.Cavity = new Cavity();
        }
        this.Cavity.InteriorThreshold = value;
    }

    public getInteriorThreshold() {
        if (this.Cavity === null) {
            return null;
        }
        return this.Cavity.InteriorThreshold;
    }

    public setProbeRadius(value: number) {
        if (this.Cavity === null) {
            this.Cavity = new Cavity();
        }
        this.Cavity.ProbeRadius = value;
    }

    public getProbeRadius() {
        if (this.Cavity === null) {
            return null;
        }
        return this.Cavity.ProbeRadius;
    }

    public setReadAllModels(value: boolean) {
        if (this.Input === null) {
            this.Input = new Input();
        }
        this.Input.ReadAllModels = value;
    }

    public getReadAllModels() {
        if (this.Input === null) {
            return null;
        }
        return this.Input.ReadAllModels;
    }

    public setSpecificChains(value: string) {
        if (this.Input === null) {
            this.Input = new Input();
        }
        this.Input.SpecificChains = value;
    }

    public getSpecificChains() {
        if (this.Input === null) {
            return null;
        }
        return this.Input.SpecificChains;
    }

    public setOriginRadius(value: number) {
        if (this.Tunnel === null) {
            this.Tunnel = new Tunnel();
        }
        this.Tunnel.OriginRadius = value;
    }

    public getOriginRadius() {
        if (this.Tunnel === null) {
            return null;
        }
        return this.Tunnel.OriginRadius;
    }

    public setSurfaceCoverRadius(value: number) {
        if (this.Tunnel === null) {
            this.Tunnel = new Tunnel();
        }
        this.Tunnel.SurfaceCoverRadius = value;
    }

    public getSurfaceCoverRadius() {
        if (this.Tunnel === null) {
            return null;
        }
        return this.Tunnel.SurfaceCoverRadius;
    }

    public setWeightFunction(value: string) {
        if (this.Tunnel === null) {
            this.Tunnel = new Tunnel();
        }
        this.Tunnel.WeightFunction = value;
    }

    public getWeightFunction() {
        if (this.Tunnel === null) {
            return null;
        }
        return this.Tunnel.WeightFunction;
    }

    public setBottleneckRadius(value: number) {
        if (this.Tunnel === null) {
            this.Tunnel = new Tunnel();
        }
        this.Tunnel.BottleneckRadius = value;
    }

    public getBottleneckRadius() {
        if (this.Tunnel === null) {
            return null;
        }
        return this.Tunnel.BottleneckRadius;
    }

    public setBottleneckTolerance(value: number) {
        if (this.Tunnel === null) {
            this.Tunnel = new Tunnel();
        }
        this.Tunnel.BottleneckTolerance = value;
    }

    public getBottleneckTollerance() {
        if (this.Tunnel === null) {
            return null;
        }
        return this.Tunnel.BottleneckTolerance;
    }

    public setMaxTunnelSimilarity(value: number) {
        if (this.Tunnel === null) {
            this.Tunnel = new Tunnel();
        }
        this.Tunnel.MaxTunnelSimilarity = value;
    }

    public getMaxTunnelSimilarity() {
        if (this.Tunnel === null) {
            return null;
        }
        return this.Tunnel.MaxTunnelSimilarity;
    }

    public setMergePores(value: boolean) {
        this.PoresMerged = value;
    }

    public getMergePores() {
        return this.PoresMerged;
    }

    public setAutomaticPores(value: boolean) {
        this.PoresAuto = value;
    }

    public getAutomaticPores() {
        return this.PoresAuto;
    }

    public setIgnoredResidues(value: MoleConfigResidue[]) {
        this.NonActiveResidues = value.slice();
    }

    public getIgnoredResidues() {
        return this.NonActiveResidues;
    }

    public setQueryFilter(value: string) {
        this.QueryFilter = value;
    }

    public getQueryFilter() {
        return this.QueryFilter;
    }

    private setPoints(value: StartingPoint[], isStart: boolean) {
        let points: MoleConfigPoint[] = [];
        let residues: MoleConfigResidue[][] = [];
        let query = null;

        for (let p of value) {
            switch (p.type) {
                case "Point":
                    let point = p.value as Point;
                    points.push({ X: Number(point.x), Y: Number(point.y), Z: Number(point.z.toString()) });
                    break;
                case "Residue":
                    let rp = (p as StartingPointResidue);
                    rp.value
                    residues.push(rp.value.map((val, idx, arr) => {
                        return {
                            SequenceNumber: val.seqId,
                            Chain: val.chain
                        } as MoleConfigResidue
                    }));
                    break;
                case "Query":
                    query = p.value;
            }
        }

        if (isStart) {
            if (this.Origin === null) {
                this.Origin = new Origin();
            }

            this.Origin.Points = (points.length > 0) ? points : null;
            this.Origin.Residues = (residues.length > 0) ? residues : null;
            this.Origin.QueryExpression = query;
        }
        else {
            if (this.CustomExits === null) {
                this.CustomExits = new Origin();
            }

            this.CustomExits.Points = (points.length > 0) ? points : null;
            this.CustomExits.Residues = (residues.length > 0) ? residues : null;
            this.CustomExits.QueryExpression = query;
        }
    }

    public setStartingPoints(value: StartingPoint[]) {
        this.setPoints(value, true);
    }

    public setEndPoints(value: StartingPoint[]) {
        this.setPoints(value, false);
    }

    public getStartingPoints(): StartingPoint[] {
        if (this.Origin === null) {
            return [];
        }

        let result: StartingPoint[] = [];
        if (this.Origin.Points !== null) {
            result = result.concat(this.Origin.Points.map((val, idx, arr) => {
                return {
                    type: "Point",
                    uiType: "3D Point",
                    value: new Point(val.X.toString(), val.Y.toString(), val.Z.toString())
                } as StartingPointXYZ;
            }));
        }

        if (this.Origin.Residues !== null) {
            result = result.concat(this.Origin.Residues.map((val, idx, arr) => {
                return {
                    type: "Residue",
                    uiType: "Residue List",
                    value: val.map((v, i, a) => {
                        return new Residue(v.SequenceNumber, v.Chain)
                    })
                } as StartingPointResidue
            }));
        }

        if (this.Origin.QueryExpression !== null) {
            result.push({
                type: "Query",
                uiType: "PatternQuery",
                residue: "",
                value: this.Origin.QueryExpression
            } as StartingPointQuery);
        }

        return result;
    }

    public getEndingPoints(): StartingPoint[] {
        if (this.CustomExits === null) {
            return [];
        }

        let result: StartingPoint[] = [];
        if (this.CustomExits.Points !== null) {
            result = result.concat(this.CustomExits.Points.map((val, idx, arr) => {
                return {
                    type: "Point",
                    uiType: "3D Point",
                    value: new Point(val.X.toString(), val.Y.toString(), val.Z.toString())
                } as StartingPointXYZ;
            }));
        }

        if (this.CustomExits.Residues !== null) {
            result = result.concat(this.CustomExits.Residues.map((val, idx, arr) => {
                return {
                    type: "Residue",
                    uiType: "Residue List",
                    value: val.map((v, i, a) => {
                        return new Residue(v.SequenceNumber, v.Chain)
                    })
                } as StartingPointResidue
            }));
        }

        if (this.CustomExits.QueryExpression !== null) {
            result.push({
                type: "Query",
                uiType: "PatternQuery",
                residue: "",
                value: this.CustomExits.QueryExpression
            } as StartingPointQuery);
        }

        return result;
    }

    //--

    public getPackage(): MoleConfig {
        return {
            Cavity: (this.Cavity === null) ? void 0 : this.Cavity,
            CustomExits: this.CustomExits,
            Input: (this.Input === null) ? void 0 : this.Input,
            NonActiveResidues: this.NonActiveResidues,
            Origin: this.Origin,
            PoresAuto: this.PoresAuto,
            PoresMerged: this.PoresMerged,
            QueryFilter: this.QueryFilter,
            Tunnel: (this.Tunnel === null) ? void 0 : this.Tunnel
        }
    }
}

export class PoresFormData {
    private InMembrane: boolean;
    private IsBetaBarel: boolean;
    private Chains: string | null;
    private ProbeRadius: number | null;
    private InteriorThreshold: number | null;

    public constructor(data?: PoresConfig) {
        if (data !== void 0 && data.InMembrane !== null && data.InMembrane !== void 0) {
            this.InMembrane = data.InMembrane;
        }
        else {
            this.InMembrane = false;
        }

        if (data !== void 0 && data.IsBetaBarel !== null && data.IsBetaBarel !== void 0) {
            this.IsBetaBarel = data.IsBetaBarel;
        }
        else {
            this.IsBetaBarel = false;
        }

        if (data !== void 0 && data.Chains !== null && data.Chains !== void 0) {
            this.Chains = data.Chains;
        }
        else {
            this.Chains = null;
        }

        if (data !== void 0 && data.InteriorThreshold !== null && data.InteriorThreshold !== void 0) {
            this.InteriorThreshold = data.InteriorThreshold;
        }
        else {
            this.InteriorThreshold = null;
        }

        if (data !== void 0 && data.ProbeRadius !== null && data.ProbeRadius !== void 0) {
            this.ProbeRadius = data.ProbeRadius;
        }
        else {
            this.ProbeRadius = null;
        }
    }

    public setBetaStructure(value: boolean) {
        this.IsBetaBarel = value;
    }

    public getBetaStructure() {
        return this.IsBetaBarel;
    }

    public setMembraneRegion(value: boolean) {
        this.InMembrane = value;
    }

    public getMembraneRegion() {
        return this.InMembrane;
    }

    public setSpecificChains(value: string) {
        this.Chains = value;
    }

    public getSpecificChains() {
        return this.Chains;
    }

    public setProbeRadius(value: number) {
        this.ProbeRadius = value;
    }

    public getProbeRadius() {
        return this.ProbeRadius;
    }

    public setInteriorThreshold(value: number) {
        this.InteriorThreshold = value;
    }

    public getInteriorThreshold() {
        return this.InteriorThreshold;
    }

    //--

    public getPackage(): PoresConfig {
        return {
            Chains: this.Chains,
            InMembrane: this.InMembrane,
            IsBetaBarel: this.IsBetaBarel,
            InteriorThreshold: this.InteriorThreshold,
            ProbeRadius: this.ProbeRadius
        }
    }
}
