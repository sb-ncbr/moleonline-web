import { MoleConfig, MoleConfigCavity, MoleConfigInput, MoleConfigOrigin, MoleConfigPoint, MoleConfigResidue, MoleConfigTunnel, PoresConfig } from "../../../MoleAPIService";

export function parseToMoleConfigOrPoresConfig(jsonObject: any): MoleConfig | PoresConfig | null {
    try {
        if (isMoleJobResult(jsonObject)) {
            // Parsing MoleConfig
            const activeAtomsResidues = jsonObject.Active_Atoms_Resiudes;
            const cavityParameters = jsonObject.Cavity_Parameters;
            const channelParameters = jsonObject.Channel_Parameters;
            const selection = jsonObject.Selection;

            const moleConfig: MoleConfig = {
                Input: {
                    SpecificChains: activeAtomsResidues.Specific_Chains,
                    ReadAllModels: activeAtomsResidues.Read_All_Models,
                },
                Cavity: {
                    IgnoreHETAtoms: activeAtomsResidues.Ignore_HETATMs,
                    IgnoreHydrogens: activeAtomsResidues.Ignore_Hydrogens,
                    ProbeRadius: cavityParameters.Probe_Radius,
                    InteriorThreshold: cavityParameters.Interior_Threshold,
                },
                Tunnel: {
                    WeightFunction: channelParameters.Weight_Function,
                    BottleneckRadius: channelParameters.Bottleneck_Radius,
                    BottleneckTolerance: channelParameters.Bottleneck_Tolerance,
                    MaxTunnelSimilarity: channelParameters.Max_Tunnel_Similarity,
                    OriginRadius: channelParameters.Origin_Radius,
                    SurfaceCoverRadius: channelParameters.Surface_Cover_Radius,
                    UseCustomExitsOnly: false, // Not available in the result object
                },
                NonActiveResidues: activeAtomsResidues.Ignored_Residues
                    ? parseFlattenedResidues(activeAtomsResidues.Ignored_Residues)
                    : null,
                QueryFilter: activeAtomsResidues.Query_Filter || null,
                Origin: {
                    Points: selection.Starting_Point_xyz
                        ? parsePointsString(selection.Starting_Point_xyz)
                        : null,
                    Residues: selection.Starting_Point
                        ? parseFlattenedResiduesArray(selection.Starting_Point)
                        : null,
                    QueryExpression: selection.Query || null, 
                },
                CustomExits: {
                    Points: selection.End_Point_xyz
                        ? parsePointsString(selection.End_Point_xyz)
                        : null,
                    Residues: selection.End_Point
                        ? parseFlattenedResiduesArray(selection.End_Point)
                        : null,
                    QueryExpression: selection.Query || null,
                },
                PoresMerged: channelParameters.Merge_Pores,
                PoresAuto: channelParameters.Automatic_Pores,
            };

            return moleConfig;
        } else if (isPoresJobResult(jsonObject)) {
            // Parsing PoresConfig
            const poresConfig: PoresConfig = {
                InMembrane: jsonObject.Membrane_Region,
                IsBetaBarel: jsonObject.Beta_Structure,
                Chains: jsonObject.Specific_Chains || null,
                ProbeRadius: jsonObject.Probe_Radius,
                InteriorThreshold: jsonObject.Interior_Threshold,
            };

            return poresConfig;
        } else {
            console.error("Invalid JSON format for MoleConfig or PoresConfig");
            return null;
        }
    } catch (error) {
        console.error("Error parsing JSON object:", error);
        return null;
    }
}

// Helper Functions

export function isMoleJobResult(jsonObject: any): boolean {
    return jsonObject.Active_Atoms_Resiudes !== undefined;
}

function isPoresJobResult(jsonObject: any): boolean {
    return jsonObject.Beta_Structure !== undefined;
}

function parseFlattenedResidues(residueString: string): MoleConfigResidue[] {
    const residues: MoleConfigResidue[] = [];
    const residueParts = residueString.split(", ");
    for (const part of residueParts) {
        const [chain, sequenceNumber] = part.split(" ");
        residues.push({
            Chain: chain,
            SequenceNumber: parseInt(sequenceNumber, 10),
            OperatorName: "",
            Name: "",
        });
    }
    return residues;
}

function parseFlattenedResiduesArray(arrayString: string): MoleConfigResidue[][] {
    const residuesArray: MoleConfigResidue[][] = [];
    const arrayParts = arrayString.split("], ");
    for (const part of arrayParts) {
        const trimmed = part.replace("[", "").replace("]", "");
        const residues = parseFlattenedResidues(trimmed);
        residuesArray.push(residues);
    }
    return residuesArray;
}

function parsePointsString(pointsString: string): MoleConfigPoint[] {
    const points: MoleConfigPoint[] = [];
    const pointParts = pointsString.split("],[");
    for (const part of pointParts) {
        const [x, y, z] = part.replace("[", "").replace("]", "").split(",").map(Number);
        points.push({ X: x, Y: y, Z: z });
    }
    return points;
}


function isMoleConfig(obj: any): obj is MoleConfig {
    return obj && 
           typeof obj === "object" &&
           (obj.Input === undefined || isMoleConfigInput(obj.Input)) &&
           (obj.Cavity === undefined || isMoleConfigCavity(obj.Cavity)) &&
           (obj.Tunnel === undefined || isMoleConfigTunnel(obj.Tunnel)) &&
           (obj.NonActiveResidues === undefined || Array.isArray(obj.NonActiveResidues)) &&
           (obj.QueryFilter === undefined || typeof obj.QueryFilter === "string") &&
           (obj.Origin === undefined || isMoleConfigOrigin(obj.Origin)) &&
           (obj.CustomExits === undefined || isMoleConfigOrigin(obj.CustomExits)) &&
           (obj.PoresMerged === undefined || typeof obj.PoresMerged === "boolean") &&
           (obj.PoresAuto === undefined || typeof obj.PoresAuto === "boolean");
}

// Deep type guard for PoresConfig
function isPoresConfig(obj: any): obj is PoresConfig {
    return obj && 
           typeof obj === "object" &&
           (obj.InMembrane === undefined || typeof obj.InMembrane === "boolean") &&
           (obj.IsBetaBarel === undefined || typeof obj.IsBetaBarel === "boolean") &&
           (obj.Chains === undefined || obj.Chains === null) &&
           (obj.InteriorThreshold === undefined || typeof obj.InteriorThreshold === "number") &&
           (obj.ProbeRadius === undefined || typeof obj.ProbeRadius === "number");
}

// Deep type guard for MoleConfigInput
function isMoleConfigInput(obj: any): obj is MoleConfigInput {
    return obj && 
           typeof obj === "object" &&
           typeof obj.SpecificChains === "string" &&
           typeof obj.ReadAllModels === "boolean";
}

// Deep type guard for MoleConfigCavity
function isMoleConfigCavity(obj: any): obj is MoleConfigCavity {
    return obj && 
           typeof obj === "object" &&
           typeof obj.IgnoreHETAtoms === "boolean" &&
           typeof obj.IgnoreHydrogens === "boolean" &&
           typeof obj.InteriorThreshold === "number" &&
           typeof obj.ProbeRadius === "number";
}

// Deep type guard for MoleConfigTunnel
function isMoleConfigTunnel(obj: any): obj is MoleConfigTunnel {
    return obj && 
           typeof obj === "object" &&
           typeof obj.WeightFunction === "string" &&
           typeof obj.BottleneckRadius === "number" &&
           typeof obj.BottleneckTolerance === "number" &&
           typeof obj.MaxTunnelSimilarity === "number" &&
           typeof obj.OriginRadius === "number" &&
           typeof obj.SurfaceCoverRadius === "number" &&
           typeof obj.UseCustomExitsOnly === "boolean";
}

// Deep type guard for MoleConfigOrigin
function isMoleConfigOrigin(obj: any): obj is MoleConfigOrigin {
    return obj && 
           typeof obj === "object" &&
           (obj.Points === null || Array.isArray(obj.Points)) &&
           (obj.QueryExpression === null || typeof obj.QueryExpression === "string") &&
           (obj.Residues === null || Array.isArray(obj.Residues));
}

// Function to check the type of a JSON object
export function checkConfigType(jsonObject: any): string {
    if (isMoleConfig(jsonObject)) {
        return "MoleConfig";
    } else if (isPoresConfig(jsonObject)) {
        return "PoresConfig";
    } else {
        return "Unknown type";
    }
}