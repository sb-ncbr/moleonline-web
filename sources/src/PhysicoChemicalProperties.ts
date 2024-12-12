import { roundToDecimal } from "./Common/Util/Numbers"

export interface PdbResidue {
    Name: string,
    Chain: string,
    SeqNumber: number
}
export interface TunnelLayer {
    NonBackboneLining: PdbResidue[]
    BackboneLining: PdbResidue[],
    Length: number
}
export interface CalculateHydrophibilicyPolarityHydropathyResult {
    hydrophobicity: number, polarity: number, hydropathy: number, logP: number, logD: number, logS: number
};

interface TunnelPhysicoChemicalPropertiesParams {
    Charge: number, Ionizable: number, Hydropathy: number, Hydrophobicity: number,
    Polarity: number, Mutability: number, LogP: number, LogD: number, LogS: number, NumPositives?: number,
    NumNegatives?: number
};

export class TunnelPhysicoChemicalProperties {
    public static readonly NumLayerProperties: number = 4;

    public Charge: number;
    public Ionizable: number;
    public NumPositives: number;
    public NumNegatives: number;
    public Hydropathy: number;
    public Hydrophobicity: number;
    public Polarity: number;
    public LogP: number;
    public LogD: number;
    public LogS: number;
    public Mutability: number;

    public constructor(params: TunnelPhysicoChemicalPropertiesParams) {
        this.Charge = params.Charge;
        this.Ionizable = params.Ionizable;
        this.Hydropathy = params.Hydropathy;
        this.Hydrophobicity = params.Hydrophobicity;
        this.Polarity = params.Polarity;
        this.LogP = params.LogP;
        this.LogD = params.LogD;
        this.LogS = params.LogS;
        this.Mutability = params.Mutability;
        this.NumNegatives = (params.NumNegatives === void 0) ? 0 : params.NumNegatives;
        this.NumPositives = (params.NumPositives === void 0) ? 0 : params.NumPositives;
    }

    public ToJson() {
        return {
            Charge: this.Charge,
            Ionizable: this.Ionizable,
            NumPositives: this.NumPositives,
            NumNegatives: this.NumNegatives,
            Hydrophobicity: roundToDecimal(this.Hydrophobicity, 2),
            Hydropathy: roundToDecimal(this.Hydropathy, 2),
            Polarity: roundToDecimal(this.Polarity, 2),
            LogP: roundToDecimal(this.LogP, 2),
            LogD: roundToDecimal(this.LogD, 2),
            LogS: roundToDecimal(this.LogS, 2),
            Mutability: this.Mutability
        };
    }
}

class PdbResidueImpl implements PdbResidue {
    public Chain: string;
    public Name: string;
    public SeqNumber: number;

    public constructor(chain: string, name: string, seqNumber: number) {
        this.Chain = chain;
        this.Name = name;
        this.SeqNumber = seqNumber;
    }

    public equals(o: PdbResidueImpl) {
        return this.toString() == o.toString();
    }

    public toString() {
        return `${this.Name} ${this.SeqNumber} ${this.Chain}`;
    }
}

export class PhysicoChemicalPropertyCalculation {

    private static makeUnique(residues: PdbResidue[]): PdbResidue[] {
        let map: Map<string, PdbResidueImpl> = new Map<string, PdbResidueImpl>();

        for (let r of residues) {
            let res = new PdbResidueImpl(r.Chain, r.Name, r.SeqNumber);
            map.set(res.toString(), res);
        }

        return Array.from(map.values());
    }

    public static CalculateResidueProperties(residues: PdbResidue[]): TunnelPhysicoChemicalProperties | null {
        let count = 0;
        let charge = 0;
        let ionizable = 0;
        let hydropathy = 0.0;
        let hydrophobicity = 0.0;
        let polarity = 0.0;
        let logP = 0.0;
        let logD = 0.0;
        let logS = 0.0;
        let mutability = 0.0;
        let positives = 0;
        let negatives = 0;

        // count only side-chain residues
        for (let residue of residues) {
            let info = TunnelPhysicoChemicalPropertyTable.GetResidueProperties(residue);
            if (info == null) continue;

            count++;
            let pc = info.Charge;
            ionizable += info.Ionizable;
            charge += pc;
            if (pc > 0) {
                positives++;
            }
            else if (pc < 0) {
                negatives++;
            }

            mutability += info.Mutability;
        }

        if (count == 0) {
            mutability = 0;
        }
        else {
            mutability /= count;
        }

        let props = PhysicoChemicalPropertyCalculation.CalculateHydrophibilicyPolarityHydropathy(residues);

        if (props === null) {
            return null;
        }

        return new TunnelPhysicoChemicalProperties({
            Charge: charge,
            Ionizable: ionizable,
            Polarity: props.polarity,
            Hydrophobicity: props.hydrophobicity,
            Hydropathy: props.hydropathy,
            LogP: props.logP,
            LogS: props.logS,
            LogD: props.logD,
            Mutability: mutability,
            NumNegatives: negatives,
            NumPositives: positives
        });
    }

    public static CalculateAgregatedLayersProperties(layers: TunnelLayer[]): TunnelPhysicoChemicalProperties | null {
        let count = 0;
        let charge = 0;
        let ionizable = 0;
        let hydropathy = 0.0;
        let hydrophobicity = 0.0;
        let polarity = 0.0;
        let logP = 0.0;
        let logD = 0.0;
        let logS = 0.0;
        let mutability = 0.0;
        let positives = 0;
        let negatives = 0;

        let residues = this.getNonBackboneLining(layers);
        let unique = this.makeUnique(residues);

        for (let residue of unique) {
            let info = TunnelPhysicoChemicalPropertyTable.GetResidueProperties(residue);
            if (info == null) continue;

            count++;
            let pc = info.Charge;
            ionizable += info.Ionizable;
            charge += pc;
            if (pc > 0) {
                positives++;
            }
            else if (pc < 0) {
                negatives++;
            }

            mutability += info.Mutability;
        }

        if (count == 0) {
            mutability = 0;
        }
        else {
            mutability /= count;
        }

        let props = PhysicoChemicalPropertyCalculation.CalculateHydrophibilicyPolarityHydropathyByLayers(layers);

        if (props === null) {
            return null;
        }

        return new TunnelPhysicoChemicalProperties({
            Charge: charge,
            Ionizable: ionizable,
            Polarity: props.polarity,
            Hydrophobicity: props.hydrophobicity,
            Hydropathy: props.hydropathy,
            LogP: props.logP,
            LogS: props.logS,
            LogD: props.logD,
            Mutability: Math.trunc(mutability),
            NumNegatives: negatives,
            NumPositives: positives
        });
    }

    public static CalculateHydrophibilicyPolarityHydropathy(residues: PdbResidue[]): CalculateHydrophibilicyPolarityHydropathyResult | null {
        let hydrophobicity = 0;
        let polarity = 0;
        let hydropathy = 0;
        let logP = 0;
        let logD = 0;
        let logS = 0;

        let count = 0;

        for (let residue of residues) {
            let info = TunnelPhysicoChemicalPropertyTable.GetResidueProperties(residue);
            if (info == null) continue;

            count++;
            hydropathy += info.Hydropathy;
            hydrophobicity += info.Hydrophobicity;
            polarity += info.Polarity;
            logP += info.LogP;
            logD += info.LogD;
            logS += info.LogS;
        }

        let infoGLY = TunnelPhysicoChemicalPropertyTable.GetResiduePropertiesByName("GLY");
        let infoASN = TunnelPhysicoChemicalPropertyTable.GetResiduePropertiesByName("ASN");
        let infoBB = TunnelPhysicoChemicalPropertyTable.GetResiduePropertiesByName("BACKBONE");

        if (infoASN === null || infoBB === null || infoGLY === null) {
            return null;
        }

        for (let residue of residues) {
            count++;
            polarity += infoASN.Polarity;
            hydrophobicity += infoGLY.Hydrophobicity;
            hydropathy += infoGLY.Hydropathy;
            logP += infoBB.LogP;
            logD += infoBB.LogD;
            logS += infoBB.LogS;
        }

        if (count == 0) {
            hydropathy = hydrophobicity = polarity = 0;
        }
        else {
            hydropathy /= count;
            hydrophobicity /= count;
            polarity /= count;
            logP /= count;
            logD /= count;
            logS /= count;
        }

        return {
            hydropathy,
            hydrophobicity,
            logD,
            logP,
            logS,
            polarity
        } as CalculateHydrophibilicyPolarityHydropathyResult
    }

    private static getNonBackboneLining(layers: TunnelLayer[]): PdbResidue[] {
        let rv: PdbResidue[] = [];
        for (let layer of layers) {
            rv = rv.concat(layer.NonBackboneLining);
        }

        return rv;
    }

    private static getBackboneLining(layers: TunnelLayer[]): PdbResidue[] {
        let rv: PdbResidue[] = [];
        for (let layer of layers) {
            rv = rv.concat(layer.BackboneLining);
        }

        return rv;
    }

    public static CalculateHydrophibilicyPolarityHydropathyByLayers(layers: TunnelLayer[]): CalculateHydrophibilicyPolarityHydropathyResult | null {
        let hydrophobicity = 0;
        let polarity = 0;
        let hydropathy = 0;
        let logP = 0;
        let logD = 0;
        let logS = 0;

        let count = 0;

        for (let residue of this.getNonBackboneLining(layers)) {
            let info = TunnelPhysicoChemicalPropertyTable.GetResidueProperties(residue);
            if (info == null) continue;

            count++;
            hydropathy += info.Hydropathy;
            hydrophobicity += info.Hydrophobicity;
            polarity += info.Polarity;
            logP += info.LogP;
            logD += info.LogD;
            logS += info.LogS;
        }

        let infoGLY = TunnelPhysicoChemicalPropertyTable.GetResiduePropertiesByName("GLY");
        let infoASN = TunnelPhysicoChemicalPropertyTable.GetResiduePropertiesByName("ASN");
        let infoBB = TunnelPhysicoChemicalPropertyTable.GetResiduePropertiesByName("BACKBONE");

        if (infoASN === null || infoBB === null || infoGLY === null) {
            return null;
        }

        for (let residue of this.getBackboneLining(layers)) {
            count++;
            polarity += infoASN.Polarity;
            hydrophobicity += infoGLY.Hydrophobicity;
            hydropathy += infoGLY.Hydropathy;
            logP += infoBB.LogP;
            logD += infoBB.LogD;
            logS += infoBB.LogS;
        }

        if (count == 0) {
            hydropathy = hydrophobicity = polarity = logP = logD = logS = 0;
        }
        else {
            hydropathy /= count;
            hydrophobicity /= count;
            polarity /= count;
            logP /= count;
            logD /= count;
            logS /= count;
        }

        return {
            polarity,
            logS,
            logP,
            logD,
            hydrophobicity,
            hydropathy
        } as CalculateHydrophibilicyPolarityHydropathyResult;
    }
}

/*
 * Information about physico chemical properties of a tunnel
 */
export class TunnelPhysicoChemicalPropertyTable {
    private static info: Map<string, TunnelPhysicoChemicalProperties> = new Map<string, TunnelPhysicoChemicalProperties>([
        ["ALA", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: 1.8,
            Hydrophobicity: 0.02,
            Polarity: 0,
            LogP: 1.08,
            LogD: 1.08,
            LogS: 0.59,
            Mutability: 100
        })
        ],

        ["ARG", new TunnelPhysicoChemicalProperties({
            Charge: 1,
            Ionizable: 1,
            Hydropathy: -4.5,
            Hydrophobicity: -0.42,
            Polarity: 52,
            LogP: -0.08,
            LogD: -2.49,
            LogS: 1.63,
            //Hydratation: 2.3,
            Mutability: 83
        })
        ],

        ["ASN", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: -3.5,
            Hydrophobicity: -0.77,
            Polarity: 3.38,
            LogP: -1.03,
            LogD: -1.03,
            LogS: 0.54,
            //Hydratation: 2.2,
            Mutability: 104
        })
        ],

        ["ASP", new TunnelPhysicoChemicalProperties({
            Charge: -1,
            Ionizable: 1,
            Hydropathy: -3.5,
            Hydrophobicity: -1.04,
            Polarity: 49.7,
            LogP: -0.22,
            LogD: -3,
            LogS: 2.63,
            //Hydratation: 6.5,
            Mutability: 86
        })
        ],

        ["CYS", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: 2.5,
            Hydrophobicity: 0.77,
            Polarity: 1.48,
            LogP: 0.84,
            LogD: 0.84,
            LogS: 0.16,
            //Hydratation: 0.1,
            Mutability: 44
        })
        ],

        ["GLU", new TunnelPhysicoChemicalProperties({
            Charge: -1,
            Ionizable: 1,
            Hydropathy: -3.5,
            Hydrophobicity: -1.14,
            Polarity: 49.9,
            LogP: 0.48,
            LogD: -2.12,
            LogS: 2.23,
            //Hydratation: 6.2,
            Mutability: 77
        })
        ],

        ["GLN", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: -3.5,
            Hydrophobicity: -1.1,
            Polarity: 3.53,
            LogP: -0.33,
            LogD: -0.33,
            LogS: 0.13,
            //Hydratation: 2.1,
            Mutability: 84
        })
        ],

        ["GLY", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: -0.4,
            Hydrophobicity: -0.8,
            Polarity: 0,
            LogP: 0,
            LogD: 0,
            LogS: 0,
            //Hydratation: 1.1,
            Mutability: 50
        })
        ],

        ["HIS", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: -3.2,
            Hydrophobicity: 0.26,
            Polarity: 51.6,
            LogP: -0.01,
            LogD: -0.11,
            LogS: -0.2,
            //Hydratation: 2.8,
            Mutability: 91
        })
        ],

        ["ILE", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: 4.5,
            Hydrophobicity: 1.81,
            Polarity: 0.13,
            LogP: 2.24,
            LogD: 2.24,
            LogS: -1.85,
            //Hydratation: 0.8,
            Mutability: 103
        })
        ],

        ["LEU", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: 3.8,
            Hydrophobicity: 1.14,
            Polarity: 0.13,
            LogP: 2.08,
            LogD: 2.08,
            LogS: -1.79,
            //Hydratation: 0.8,
            Mutability: 54
        })
        ],

        ["LYS", new TunnelPhysicoChemicalProperties({
            Charge: 1,
            Ionizable: 1,
            Hydropathy: -3.9,
            Hydrophobicity: -0.41,
            Polarity: 49.5,
            LogP: 0.7,
            LogD: -1.91,
            LogS: 1.46,
            //Hydratation: 5.3,
            Mutability: 72
        })
        ],

        ["MET", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: 1.9,
            Hydrophobicity: 1,
            Polarity: 1.43,
            LogP: 1.48,
            LogD: 1.48,
            LogS: -0.72,
            //Hydratation: 0.7,
            Mutability: 93
        })
        ],

        ["PHE", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: 2.8,
            Hydrophobicity: 1.35,
            Polarity: 0.35,
            LogP: 2.49,
            LogD: 2.49,
            LogS: -1.81,
            //Hydratation: 1.4,
            Mutability: 51
        })
        ],

        ["PRO", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: -1.6,
            Hydrophobicity: -0.09,
            Polarity: 1.58,
            LogP: 1.8,
            LogD: 1.8,
            LogS: -1.3,
            //Hydratation: 0.9,
            Mutability: 58
        })
        ],

        ["SER", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: -0.8,
            Hydrophobicity: -0.97,
            Polarity: 1.67,
            LogP: -0.52,
            LogD: -0.52,
            LogS: 1.11,
            //Hydratation: 1.7,
            Mutability: 117
        })
        ],

        ["THR", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: -0.7,
            Hydrophobicity: -0.77,
            Polarity: 1.66,
            LogP: -0.16,
            LogD: -0.16,
            LogS: 0.77,
            //Hydratation: 1.5,
            Mutability: 107
        })
        ],

        ["TRP", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: -0.9,
            Hydrophobicity: 1.71,
            Polarity: 2.1,
            LogP: 2.59,
            LogD: 2.59,
            LogS: -2.48,
            //Hydratation: 1.9,
            Mutability: 25
        })
        ],

        ["TYR", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: -1.3,
            Hydrophobicity: 1.11,
            Polarity: 1.61,
            LogP: 2.18,
            LogD: 2.18,
            LogS: -1.44,
            //Hydratation: 2.1,
            Mutability: 50
        })
        ],

        ["VAL", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: 4.2,
            Hydrophobicity: 1.13,
            Polarity: 0.13,
            LogP: 1.8,
            LogD: 1.8,
            LogS: -1.3,
            //Hydratation: 0.9,
            Mutability: 98
        })
        ],

        ["BACKBONE", new TunnelPhysicoChemicalProperties({
            Charge: 0,
            Ionizable: 0,
            Hydropathy: -0.4,
            Hydrophobicity: 0.0, // not defined for backbone
            Polarity: 3.5,
            Mutability: 0, // not defined for backobe
            LogP: -0.86,
            LogD: -0.86,
            LogS: 0.81
        })
        ]
    ]);

    public static GetResidueProperties(residue: PdbResidue): TunnelPhysicoChemicalProperties | null {
        let ret: TunnelPhysicoChemicalProperties | undefined = this.info.get(residue.Name);
        if (ret === void 0) {
            return null;
        }

        return ret;
    }

    public static GetResiduePropertiesByName(name: string): TunnelPhysicoChemicalProperties | null {
        let ret: TunnelPhysicoChemicalProperties | undefined = this.info.get(name);
        if (ret === void 0) {
            return null;
        }

        return ret;
    }
}
