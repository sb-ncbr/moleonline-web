import { CommonOptions, DataSources } from "../config/common";
import { MembranePoint } from "./DataInterface";
import { deleteJson, getJson, postEmpty, postForm, postJson } from "./Http";


export type ComputationStatus =
    "Initializing" |
    "Initialized" |
    "FailedInitialization" |
    "Running" |
    "Finished" |
    "Error" |
    "Deleted" |
    "Aborted";
export interface InitResponse {
    ComputationId: string,
    SubmitId: number,
    Status: ComputationStatus,
    ErrorMsg: string
};
export interface CompInfo {
    ComputationId: string,
    UserStructure: boolean,
    PdbId: string,
    AssemblyId: string | null,
    Submissions: Submission[]
};

export interface Submission {
    SubmitId: number,
    Mode: "Mole" | "Pores" | null, // null: no parameters were submitted
    Status: ComputationStatus,
    ErrorMsg: string,
    MoleConfig: MoleConfig,
    PoresConfig: PoresConfig
};

export interface MoleConfig {
    Input?: MoleConfigInput,
    Cavity?: MoleConfigCavity,
    Tunnel?: MoleConfigTunnel,
    NonActiveResidues?: MoleConfigNonActiveResidues[] | null,
    QueryFilter?: string | null,
    Origin?: MoleConfigOrigin | null,
    CustomExits?: MoleConfigOrigin | null,
    PoresMerged?: boolean,
    PoresAuto?: boolean
};
export interface MoleConfigInput {
    SpecificChains: string
};
export interface MoleConfigCavity {
    IgnoreHETAtoms: boolean,
    IgnoreHydrogens: boolean,
    InteriorThreshold: number,
    ProbeRadius: number
};
export interface MoleConfigTunnel {
    WeightFunction: string,
    BottleneckRadius: number,
    BottleneckTolerance: number,
    MaxTunnelSimilarity: number,
    OriginRadius: number,
    SurfaceCoverRadius: number,
    UseCustomExitsOnly: boolean
};
export type MoleConfigNonActiveResidues = MoleConfigResidue;
export interface MoleConfigOrigin {
    Points: MoleConfigPoint[] | null,
    QueryExpression: string | null,
    Residues: MoleConfigResidue[][] | null
};
export interface MoleConfigPoint {
    X: number,
    Y: number,
    Z: number
};
export interface MoleConfigResidue { Chain: string, SequenceNumber: number, OperatorName: string, Name: string };

export interface PoresConfig {
    InMembrane?: boolean,
    IsBetaBarel?: boolean,
    Chains?: any | null //TODO:...
    InteriorThreshold: number | null,
    ProbeRadius: number | null
};

// CSA residues come without an operator: they refer to the chain in any copy of it
export interface CSAResidue { Name: string, Chain: string, SequenceNumber: number };
export type CSAResidues = CSAResidue[][];
export type ResidueName = string;
export type PatternQueryExpression = string;
export type Cofactors = Map<ResidueName, PatternQueryExpression>;
export type MembranePoints = MembranePoint[];

// The API sends SubmitId as a number. Anything else is an API bug: fail instead of converting it.
function checkSubmitId(submitId: unknown, url: string) {
    if (typeof submitId !== "number") {
        throw new Error(`${url}: SubmitId must be a number, got ${JSON.stringify(submitId)}`);
    }
}

function checkReport(report: any, url: string): InitResponse {
    checkSubmitId(report.SubmitId, url);
    return report;
}

export class ApiService {
    private static DEBUG_MODE = CommonOptions.DEBUG_MODE;

    private static baseUrl = DataSources.API_URL;

    private static prepareInitUrl(pdbid: string, usePores: boolean, assemblyId?: string) {
        const pores = usePores ? 'Pores/' : '';
        const optional = assemblyId ? `?assemblyId=${assemblyId}` : '';
        return `${this.baseUrl}/Init/${pores}${pdbid}${optional}`;
    }

    public static initWithParams(pdbid: string, usePores: boolean, assemblyId?: string): Promise<InitResponse> {
        let url = this.prepareInitUrl(pdbid, usePores, assemblyId);
        if (this.DEBUG_MODE) {
            console.log(url);
        }
        return postEmpty(url).then(r => checkReport(r, url));
    }
    public static initWithFile(formData: FormData): Promise<InitResponse> {
        let url = this.prepareInitUrl("", false);
        if (this.DEBUG_MODE) {
            console.log(url);
        }
        return postForm(url, formData).then(r => checkReport(r, url));
    }

    public static getStatus(computationId: string, submitId?: number): Promise<InitResponse> {
        let optional = "";
        if (submitId !== void 0) {
            optional = `?submitId=${submitId}`;
        }
        let url = `${this.baseUrl}/Status/${computationId}${optional}`;
        if (this.DEBUG_MODE) {
            console.log(url);
        }
        return getJson(url).then(r => checkReport(r, url));
    }

    public static getComputationInfoList(computationId: string): Promise<CompInfo> {
        let url = `${this.baseUrl}/Compinfo/${computationId}`;
        if (this.DEBUG_MODE) {
            console.log(url);
        }

        return getJson(url).then((val) => {
            if (val.Status === "Error") {
                return null;
            }
            else {
                for (const submission of val.Submissions) {
                    checkSubmitId(submission.SubmitId, url);
                }
                return val;
            }
        })
    }

    public static submitMoleJob(computationId: string, data: MoleConfig) {
        let url = `${this.baseUrl}/Submit/Mole/${computationId}`;
        if (this.DEBUG_MODE) {
            console.log(url);
        }
        return postJson(url, data).then(r => checkReport(r, url));
    }

    public static submitPoresJob(computationId: string, data: PoresConfig) {
        let url = `${this.baseUrl}/Submit/Pores/${computationId}`;
        if (this.DEBUG_MODE) {
            console.log(url);
        }

        let jsonRequestData = {
            IsBetaBarel: data.IsBetaBarel,
            InMembrane: data.InMembrane,
            Chains: (data.Chains === null) ? "" : data.Chains,
            InteriorThreshold: (data.InteriorThreshold === void 0 || data.InteriorThreshold === null) ? null : data.InteriorThreshold,
            ProbeRadius: (data.ProbeRadius === void 0 || data.ProbeRadius === null) ? null : data.ProbeRadius
        }

        return postJson(url, jsonRequestData).then(r => checkReport(r, url));
    }

    public static getFilenameFromResponseHeader(r: Response) {
        let contentDisposition = r.headers.get("Content-Disposition");
        //https://regex101.com/r/hJ7tS6/1
        let regExp = /filename[^;\n=]*=(?:(['"])(.*?)\1|([^;\n]*))/;
        let filename: string | null = null;

        if (contentDisposition !== null) {
            let result = regExp.exec(contentDisposition);
            if (result !== null) {
                filename = result[2] || result[3];
            }
        }

        return filename;
    }

    public static getChannelsData(computationId: string, submitId: number): Promise<string> {
        let url = `${this.baseUrl}/Data/${computationId}?submitId=${submitId}`;
        if (this.DEBUG_MODE) {
            console.log(url);
        }
        if (this.DEBUG_MODE)
            console.time("getChannelsData");
        return getJson(url).then((v) => JSON.stringify(v)).then((s) => {
            if (this.DEBUG_MODE)
                console.timeEnd("getChannelsData");
            return s;
        });
    }

    public static getMembraneData(computationId: string): Promise<MembranePoints> {
        let url = `${this.baseUrl}/Data/${computationId}?format=membrane`;
        if (this.DEBUG_MODE) {
            console.log(url);
        }
        if (this.DEBUG_MODE)
            console.time("getMembraneData");
        return getJson(url).then((s) => {
            if (this.DEBUG_MODE)
                console.timeEnd("getMembraneData");
            return s as MembranePoints;
        });
    }

    public static killRunningJob(computationId: string) {
        let url = `${this.baseUrl}/Kill/${computationId}`;
        if (this.DEBUG_MODE) {
            console.log(url);
        }
        return postEmpty(url).then(r => checkReport(r, url));
    }

    public static deleteProject(computationId: string) {
        let url = `${this.baseUrl}/Delete/${computationId}`;
        if (this.DEBUG_MODE) {
            console.log(url);
        }
        return deleteJson(url).then(r => checkReport(r, url));
    }

    public static getCSAResidues(computationId: string): Promise<CSAResidues> {
        let url = `${this.baseUrl}/CSA/${computationId}`;
        if (this.DEBUG_MODE) {
            console.log(url);
        }
        return getJson(url);
    }

    public static getCofactors(): Promise<Cofactors> {
        let url = `${this.baseUrl}/inputs/cofactors.json`;
        if (this.DEBUG_MODE) {
            console.log(url);
        }
        if (this.DEBUG_MODE)
            console.time("getCofactors");
        return getJson(url).then((s) => {
            let rv = new Map<ResidueName, PatternQueryExpression>();
            for (let key in s) {
                if (!s.hasOwnProperty(key)) {
                    continue;
                }
                rv.set(key, (s as any)[key] as PatternQueryExpression);
            }
            if (this.DEBUG_MODE)
                console.timeEnd("getCofactors");
            return rv;
        });
    }
}
