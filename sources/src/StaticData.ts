import { Color } from "molstar/lib/mol-util/color";
import { getPalette } from "molstar/lib/mol-util/color/palette";

export class Bundle {
    public static get(key: string) {
        let value = this.bundle[key];
        if (value === void 0) {
            return key;
        }
        return value;
    }

    private static bundle: any = {
        /* Submit Form */
        "VoronoiScale": "Voronoi scale",
        "Length": "Length",
        "LengthAndRadius": "Length and radius",
        /* LV Labels */
        "NumPositives": "Charge(+)",
        "NumNegatives": "Charge(-)",
        "MinRadius": "Radius",
        "MinBRadius": "BRadius",
        "MinFreeRadius": "Free Radius",
        /* Tooltips data */
        "tooltip-MinRadius": "Radius of sphere within channel limited by three closest atoms",
        "tooltip-MinBRadius": "BRadius",
        "tooltip-MinFreeRadius": "Radius of sphere within channel limited by three closest main chain atoms in order to allow sidechain flexibility",
        "tooltip-Bottleneck": "Radius of channel bottleneck",
        "tooltip-Length": "Length of the channel",
        "tooltip-Hydropathy": "Hydropathy index of amino acid according to Kyte and Doolittle J.Mol.Biol.(1982) 157, 105-132. Range from the most hydrophilic (Arg = -4.5) to the most hydrophobic (Ile = 4.5)",
        "tooltip-Hydrophobicity": "Normalized hydrophobicity scale by Cid et al. J. Protein Engineering (1992) 5, 373-375. Range from the most hydrophilic (Glu = -1.140) to the most hydrophobic (Ile = 1.810)",
        "tooltip-Polarity": "Lining amino acid polarity by Zimmermann et al. J. Theor. Biol. (1968) 21, 170-201. Polarity ranges from nonpolar (Ala, Gly = 0) tthrough polar (e.g. Ser = 1.67) to charged (Glu = 49.90, Arg = 52.00)",
        "tooltip-Mutability": "Relative mutability index by Jones, D.T. et al. Compur. Appl. Biosci. (1992) 8(3): 275-282. Realtive mutability based on empirical substitution matrices between similar protein sequences. High for easily substitutable amino acids, e.g. polars (Ser = 117, Thr = 107, Asn = 104) or aliphatics (Ala = 100, Val = 98, Ile = 103). Low for important structural amino acids, e.g. aromatics (Trp = 25, Phe = 51, Tyr = 50) or specials (Cys = 44, Pro = 58, Gly = 50).",
        "tooltip-LogP": "Lipophilicity - octanol/water partition coefficient (logP) of channel-surrounding fragments",
        "tooltip-LogD": "Lipophilicity - octanol/water distribution coefficient (logD) of channel-surrounding fragments",
        "tooltip-LogS": "Solubility - water solubility (logS) of channel-surrounding fragments",
        "tooltip-Ionizable": "Ionizable residues",
        "tooltip-BRadius": "Flexible radius taking into account local flexibility (RMSF) from B factors",
        "tooltip-agl-Hydropathy": "Average of hydropathy index per each amino acid according to Kyte and Doolittle J.Mol.Biol.(1982) 157, 105-132. Range from the most hydrophilic (Arg = -4.5) to the most hydrophobic (Ile = 4.5)",
        "tooltip-agl-Hydrophobicity": "Average of normalized hydrophobicity scales by Cid et al. J. Protein Engineering (1992) 5, 373-375. Range from the most hydrophilic (Glu = -1.140) to the most hydrophobic (Ile = 1.810)",
        "tooltip-agl-Polarity": "Average of lining amino acid polarities by Zimmermann et al. J. Theor. Biol. (1968) 21, 170-201. Polarity ranges from nonpolar (Ala, Gly = 0) tthrough polar (e.g. Ser = 1.67) to charged (Glu = 49.90, Arg = 52.00)",
        "tooltip-agl-Mutability": "Average of relative mutability index by Jones, D.T. et al. Compur. Appl. Biosci. (1992) 8(3): 275-282. Realtive mutability based on empirical substitution matrices between similar protein sequences. High for easily substitutable amino acids, e.g. polars (Ser = 117, Thr = 107, Asn = 104) or aliphatics (Ala = 100, Val = 98, Ile = 103). Low for important structural amino acids, e.g. aromatics (Trp = 25, Phe = 51, Tyr = 50) or specials (Cys = 44, Pro = 58, Gly = 50).",
        "tooltip-agl-Charge": "Charge",
        "tooltip-agl-LogP": "Lipophilicity - octanol/water partition coefficient (logP) of channel-surrounding fragments",
        "tooltip-agl-LogD": "Lipophilicity - octanol/water distribution coefficient (logD) of channel-surrounding fragments",
        "tooltip-agl-LogS": "Solubility - water solubility (logS) of channel-surrounding fragments",
        "tooltip-agl-Ionizable": "Ionizable residues",
        "tooltip-agl-BRadius": "Flexible radius taking into account local flexibility (RMSF) from B factors",
        "tooltip-NumPositives": "",
        "tooltip-NumNegatives": "",
        "tooltip-Charge": "",
        "tooltip-specificChains": "Specific chains - Select chains to be included in computation. No value, all is included.",
        "tooltip-nonActiveResidues": "Ignored residues - List residues to be discarded prior to the calculation.",
        "tooltip-queryFilter": "Query filter - Enter PatternQuery expression for discarding parts of the structure.",
        "tooltip-readAllModels": "Read all models - If not checked just a first model is considered for computation.",
        "tooltip-ignoreHydrogens": "Ignore hydrogens - All hydrogens will be discarded from the computation.",
        "tooltip-ignoreAllHetatm": "Ignore HETATMs - All HETATMs will be discarded from the computation.",
        "tooltip-probeRadius": "Probe radius - Used to determine the molecular surface. Upper bound of a channel radius",
        "tooltip-interiorTreshold": "Interior threshold - Used to determine individual cavities. Lower bound of a channel radius",
        "tooltip-originRadius": "Origin radius - Determines how far to search for cavity from a starting point.",
        "tooltip-surfaceCoverRadius": "Surface cover radius - The density of the tunnel exits on the molecular surface.",
        "tooltip-tunnelWeightFunction": "Weight function - Weight function to compute channels. See documentation for details.",
        "tooltip-bottleneckRadius": "Bottleneck radius - Minimum radius of a channel",
        "tooltip-bottleneckTolerance": "Bottleneck tolerance - Maximum length of a channel segment narrower than bottleneck radius",
        "tooltip-maxTunnelSimilarity": "Max tunnel similarity - Determine when to remove channels that are too similar. The longer is discarded",
        "tooltip-mergePores": "Merge pores - Merge computed tunnels into pores.",
        "tooltip-automaticPores": "Automatic pores - Compute pores from exits in all cavities.",
        "tooltip-csaActiveSites": "Active sites from CSA - List of annotated active sites from the CSA database",
        "tooltip-startingPoint": "Starting point - Select one or many channel starting points",
        "tooltip-endPoint": "End point - (Optional) Select one or many channel end points",
        "tooltip-queryExpresion": "Query - Define start points with PatternQuery language expression",
        "tooltip-poresIsBetaStructure": "Beta structure - is this protein formed largely from beta sheets?",
        "tooltip-poresInMembrane": "Membrane region - Calculate pore in the transmembrane region only",
        "tooltip-poresChains": "Specific chains - Select chains to be included in computation. No value, all is included.",
        "tooltip-cofactorActiveSites": "Posible starting points based on cofactors.",
        "validation-error-message-default": "Value you entered has invalid format!",
        "validation-error-message-not-empty": "This field is required!",
        "validation-error-message-residue-invalid-format": "Residue Id is in invalid format! Correct format: 142 A",
        "placeholder-annotate-email": "(optional for further contact) jon.snow@uni.ac.uk",
        "placeholder-annotate-message": "(optional) Explanation, notes to the authors, whatever",

    }
}

export interface WeightFunctionsType {
    label: string,
    value: string
}
export class WeightFunctions {
    private static cache: WeightFunctionsType[] | undefined = void 0;
    private static functions = ["VoronoiScale", "Length", "LengthAndRadius"];
    public static getFunctions(): string[] {
        return this.functions;
    }
    public static get(): WeightFunctionsType[] {
        if (this.cache !== void 0) {
            return this.cache;
        }

        let rv: WeightFunctionsType[] = [];
        for (let key of this.functions) {
            rv.push({ label: Bundle.get(key), value: key });
        }
        this.cache = rv;

        return rv;
    }
}

export class TooltipText {
    public static get(key: string) {
        let bundleKey = `tooltip-${key}`;
        let text = Bundle.get(bundleKey);
        if (text === bundleKey) {
            return key;
        }
        return text;
    }
}

export class Colors {
    private static excludedColors = [3, 5, 8, 9, 10, 16, 19, 24/**/, 25/**/, 28, 30, 31, 32, 33, 37, 44, 51, 54, 56, 65, 73/**/, 76/**/, 81, 90, 92];
    private static colorIndex = -1;

    public static get(key: Enum): Color {
        switch (key) {
            case Enum.CSAOrigin: return Color.fromRgb(128, 255, 128);
            case Enum.ComputedOrigin: return Color.fromRgb(128, 128, 255);
            case Enum.OtherOrigin: return Color.fromRgb(255, 128, 128);

            case Enum.CavityBoundary: return Color(0x90ee90);
            case Enum.CavityInner: return Color(0x999999);
            case Enum.CavitySelectable: return Color(0x90ee90);

            case Enum.SyntethicSelect: return Color.fromRgb(191, 82, 204);
            case Enum.TPoint: return Color.fromRgb(255, 0, 105);

            case Enum.MembraneBlue: return Color.fromRgb(0, 0, 255);
            case Enum.MembraneRed: return Color.fromRgb(255, 0, 0);

            case Enum.DefaultColor: return Color.fromRgb(0, 0, 0);
            default: return this.get(Enum.DefaultColor);
        }
    }

    private static shouldExcludeColor(colorIdx: number) {
        return !(this.excludedColors.indexOf(colorIdx) < 0);
    }
    // public static getRandomUnused() {
    //     // getPalette()
    //     do {
    //         this.colorIndex = (this.colorIndex + 1) % LiteMol.Visualization.Molecule.Colors.DefaultPallete.length;
    //     } while (this.shouldExcludeColor(this.colorIndex));
    //     return LiteMol.Visualization.Molecule.Colors.DefaultPallete[this.colorIndex];
    // }
}

export enum Enum {
    CSAOrigin,
    ComputedOrigin,
    OtherOrigin,
    CavityBoundary,
    CavityInner,
    CavitySelectable,
    TPoint,
    SyntethicSelect,
    DefaultColor,
    MembraneBlue,
    MembraneRed,
}
