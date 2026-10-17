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

// The API answers with every field filled in; a request may leave out the optional ones
export interface PoresConfig {
    InMembrane?: boolean,
    IsBetaBarrel?: boolean,
    Chains?: string[] | null, // chain names as in the structure, e.g. ["A", "A_2"]; null or []: all chains
    InteriorThreshold: number | null, // null: the default (0.8)
    ProbeRadius: number | null // null: the default (13)
};

// Chain names typed as "A, B": one name per comma, blanks dropped
export function parseChains(text: string): string[] {
    return text.split(",").map(c => c.trim()).filter(c => c.length > 0);
}

export function formatChains(chains: string[] | null | undefined): string {
    return (chains ?? []).join(", ");
}

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

    // assembly: "preferred" = the entry's preferred (biological) assembly, which the API looks up (Init/Pores);
    // "asymmetric" = the asymmetric unit; otherwise the ID of the assembly to load
    public static initWithPdbId(pdbid: string, assembly: "preferred" | "asymmetric" | string): Promise<InitResponse> {
        const id = encodeURIComponent(pdbid);
        let url = assembly === "preferred" ? `${this.baseUrl}/Init/Pores/${id}`
            : assembly === "asymmetric" ? `${this.baseUrl}/Init/${id}`
            : `${this.baseUrl}/Init/${id}?assemblyId=${encodeURIComponent(assembly)}`;
        if (this.DEBUG_MODE) {
            console.log(url);
        }
        return postEmpty(url).then(r => checkReport(r, url));
    }
    public static initWithFile(formData: FormData): Promise<InitResponse> {
        let url = `${this.baseUrl}/Init/`;
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
            for (const submission of val.Submissions) {
                checkSubmitId(submission.SubmitId, url);
            }
            return val;
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

        // exactly these fields: the API refuses unknown ones
        const body: PoresConfig = {
            InMembrane: data.InMembrane,
            IsBetaBarrel: data.IsBetaBarrel,
            Chains: data.Chains,
            InteriorThreshold: data.InteriorThreshold,
            ProbeRadius: data.ProbeRadius
        };

        return postJson(url, body).then(r => checkReport(r, url));
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
