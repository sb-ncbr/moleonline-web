import { getStructureOptions } from "molstar/lib/mol-plugin-ui/sequence";
import { Instances } from "../../Bridge";
import { MoleConfigResidue } from "../../MoleAPIService";
import { Context } from "../Context";
import { PluginStateObject, PluginStateObject as PSO } from 'molstar/lib/mol-plugin-state/objects';
import { StructureElement, Unit, Queries, StructureSelection, StructureQuery, StructureProperties } from "molstar/lib/mol-model/structure";
import { Loci } from "molstar/lib/mol-model/loci";
import { atoms } from 'molstar/lib/mol-model/structure/query/queries/generators';

interface RType { chain: { authAsymId: string }, authSeqNumber: number, operatorName: string, isHet: boolean, loci: Loci | undefined, name?: string, backbone?: boolean };
export interface Point {
    X: number,
    Y: number,
    Z: number
}

export class Residues {
    private static cache: Map<number, string>;

    private static initCache() {
        if (this.cache !== void 0) {
            return;
        }

        this.cache = new Map<number, string>();
    }

    // private static getNameDirect(residueSeqNumber: number, plugin: Controller) {
    //     if (plugin.context.select('polymer-visual')[0].props !== void 0) {
    //         let props = plugin.context.select('polymer-visual')[0].props as any;
    //         if (props.model === void 0 || props.model.model === void 0) {
    //             return "";
    //         }
    //         let model = props.model.model as Model;
    //         let params = LiteMol.Core.Structure.Query.residuesById(residueSeqNumber).compile()(
    //             LiteMol.Core.Structure.Query.Context.ofStructure(
    //                 model
    //             )
    //         );

    //         let fragment = params.fragments[0];
    //         let residueInd = fragment.residueIndices[0];
    //         let residueData = params.context.structure.data.residues;

    //         let resIdx = residueData.indices[residueInd];

    //         let name = residueData.name[resIdx];

    //         return name;
    //     }
    //     return "";
    // }

    // public static getName(residueSeqNumber: number): string {
    //     this.initCache();
    //     if (this.cache.has(residueSeqNumber)) {
    //         let name = this.cache.get(residueSeqNumber);
    //         if (name === void 0) {
    //             return "";
    //         }
    //         return name;
    //     }

    //     let name = this.getNameDirect(residueSeqNumber, plugin);
    //     this.cache.set(residueSeqNumber, name);

    //     return name;
    // }

    public static sort(residues: string[], groupFunction?: (residues: RType[]) => RType[][], hasName?: boolean, includeBackbone?: boolean) {

        if (includeBackbone === void 0) {
            includeBackbone = false;
        }

        if (hasName === void 0) {
            hasName = false;
        }

        if (residues.length === 0) {
            return residues;
        }

        let resParsed: RType[] = this.parseResidues(residues, hasName);
        let groups = [];

        if (groupFunction !== void 0) {
            groups = groupFunction(resParsed);
        }
        else {
            groups.push(
                resParsed
            );
        }

        let sortFn = this.getSortFunctionBackboneChainSeq();
        let all: RType[] = [];
        for (let group of groups) {
            all = all.concat(group.sort(sortFn));
        }

        return all.map((val, idx, array) => {
            if (hasName) {
                return `${val.name} ${val.authSeqNumber} ${val.chain.authAsymId}${(includeBackbone && val.backbone) ? ' Backbone' : ''}`;
            }
            else {
                return `${val.authSeqNumber} ${val.chain.authAsymId}${(includeBackbone && val.backbone) ? ' Backbone' : ''}`;
            }
        });
    }

    private static parseResidue(residue: string) {
        return residue.split(" ");
    }

    public static getOperatorName(number: string) {
        let plugin = Context.getInstance().plugin;
        const structureOptions = getStructureOptions(plugin.state.data);
        const structureRef = structureOptions.options[0][0];
        const state = plugin.state.data;
        const cell = state.select(structureRef)[0];
        if (!structureRef || !cell || !cell.obj) return '';

        const structure = (cell.obj as PluginStateObject.Molecule.Structure).data;
        let operatorName = 'ASM_' + number; // Files obtained from API may be older and some structures does not include data for structure to be loaded as assembly, therefore type 'model' is used and the first chain has operator name '1_555'
        const query = StructureSelection.unionStructure(StructureQuery.run(atoms({
            unitTest: ctx => {
                return StructureProperties.unit.operator_name(ctx.element) === operatorName;
            },
        }), structure))

        if (query.elementCount === 0) {
            return '1_555';
        }
        return operatorName;
    }

    public static parseResidues(residues: string[], hasName?: boolean) {
        if (hasName === void 0) {
            hasName = false;
        }

        const regex = /^(\w+)\s+(\d+)\s+([A-Za-z]+)(?:_(\d+))?(?:\s+(\w+))?$/;

        let resParsed: RType[] = [];
        for (let residue of residues) {
            let residueParts = this.parseResidue(residue);
            if (hasName) {
                const match = residue.match(regex);
                if (!match) {
                    throw new Error("Invalid format");
                }
                const [, residueName, seqNumber, chain, operatorNumber, backbone] = match;

                let rv = {
                    authSeqNumber: Number(seqNumber),
                    chain: {
                        authAsymId: chain
                    },
                    operatorName: Residues.getOperatorName(operatorNumber),
                    isHet: false,
                    loci: undefined,
                    name: residueName,
                    backbone: backbone !== null
                };

                resParsed.push(rv)
            }
            else {
                let operatorNumber = residueParts[1].split('_')[1]
                resParsed.push(
                    {
                        chain: { authAsymId: residueParts[1] },
                        authSeqNumber: Number(residueParts[0]),
                        backbone: (residueParts.length === 3),
                        operatorName: Residues.getOperatorName(operatorNumber ?? '1'),
                        isHet: false,
                        loci: undefined,
                    }
                );
            }
        }

        return resParsed;
    }

    public static getSortFunctionBackboneChainSeq() {
        return (a: RType, b: RType) => {
            if (a.backbone === b.backbone) {
                if (a.chain.authAsymId === b.chain.authAsymId) {
                    return a.authSeqNumber - b.authSeqNumber;
                }
                return (a.chain.authAsymId < b.chain.authAsymId) ? -1 : 1;
            }
            if (a.backbone === true) {
                return 1;
            }
            else {
                return -1;
            }
        }
    }

    public static getSortFunctionChainSeqBackbone() {
        return (a: RType, b: RType) => {
            if (a.chain.authAsymId < b.chain.authAsymId) {
                return -1;
            }
            else if (a.chain.authAsymId > b.chain.authAsymId) {
                return 1;
            }
            else {
                if (a.authSeqNumber === b.authSeqNumber) {
                    if (a.backbone && b.backbone) {
                        return 0;
                    }
                    else if (a.backbone && !b.backbone) {
                        return -1;
                    }
                    else {
                        return 1;
                    }
                }

                return a.authSeqNumber - b.authSeqNumber;
            }
        };
    }

    private static sequenceLetters: string[] = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'Y',
        'Z'
    ];

    private static residueNames: string[] = [
        'ALA',
        'ASP/ASN',
        'CYS',
        'ASP',
        'GLU',
        'PHE',
        'GLY',
        'HIS',
        'ILE',
        'LEU/ISO',
        'LYS',
        'LEU',
        'MET',
        'ASN',
        'PYL',
        'PRO',
        'GLN',
        'ARG',
        'SER',
        'THR',
        'SEC',
        'VAL',
        'TRP',
        'TYR',
        'GLU/GLN'
    ];

    private static codelistSearch(whereToSearch: string[], results: string[], query: string) {
        for (let idx = 0; idx < whereToSearch.length; idx++) {
            if (whereToSearch[idx] === query) {
                return results[idx];
            }
        }

        return "";
    }

    public static getSequenceLetterByName(name: string) {
        let rv = this.codelistSearch(this.residueNames, this.sequenceLetters, name);
        return (rv === "") ? "~" : rv;
    }

    public static getNameBySequenceLetter(letter: string) {
        let rv = this.codelistSearch(this.sequenceLetters, this.residueNames, letter);
        return (rv === "") ? "<Unknown>" : rv;
    }

    public static getResidueClassByName(authName: string) {
        switch (authName.toUpperCase()) {
            case 'GLU':
            case 'ASP': return "residue-class-red";
            case 'ARG':
            case 'LYS':
            case 'HIS': return "residue-class-blue";
            case 'PHE':
            case 'TYR':
            case 'TRP': return "residue-class-purple";
            case 'SER':
            case 'THR': return "residue-class-green";
            case 'CYS':
            case 'MET': return "residue-class-yellow";
            default: return "";
        }
    }

    public static currentContextHasResidue(residueName: string): boolean {
        let plugin = Instances.getPlugin();
        // if (plugin.context.select('polymer-visual')[0].props !== void 0) {
        //     let props = plugin.context.select('polymer-visual')[0].props as any;
        //     if (props.model === void 0 || props.model.model === void 0) {
        //         return false;
        //     }
        //     let model = props.model.model as Model;
        //     let params = LiteMol.Core.Structure.Query.residuesByName(residueName.toUpperCase()).compile()(
        //         LiteMol.Core.Structure.Query.Context.ofStructure(
        //             model
        //         )
        //     );

        //     return params.fragments.length > 0;
        // }
        return false;
    }

    public static getResiudeName(authSeqNumber: number, authAsymId: string, operatorName: string) {
        let plugin = Context.getInstance().plugin;

        const structureOptions = getStructureOptions(plugin.state.data);
        const structureRef = structureOptions.options[0][0];
        const state = plugin.state.data;
        const cell = state.select(structureRef)[0];
        if (!structureRef || !cell || !cell.obj) return null;

        const structure = (cell.obj as PluginStateObject.Molecule.Structure).data;

        const loci = StructureQuery.loci(atoms({
            unitTest: ctx => {
                return StructureProperties.unit.operator_name(ctx.element) === operatorName;
            },
            chainTest: ctx => {
                return StructureProperties.chain.label_asym_id(ctx.element) === authAsymId;
            },
            residueTest: ctx => {
                return StructureProperties.residue.auth_seq_id(ctx.element) === authSeqNumber;
            }
        }), structure)
        const location = StructureElement.Loci.getFirstLocation(loci);
        if (location)
            return StructureProperties.atom.label_comp_id(location);
    }

    public static getCenterOfMass(residues: MoleConfigResidue[]): Point | null {
        let positions: Point[] = [];
        let plugin = Context.getInstance().plugin;

        const structureOptions = getStructureOptions(plugin.state.data);
        const structureRef = structureOptions.options[0][0];
        const state = plugin.state.data;
        const cell = state.select(structureRef)[0];
        if (!structureRef || !cell || !cell.obj) return null;

        const structure = (cell.obj as PluginStateObject.Molecule.Structure).data;

        for (let residue of residues) {
            const loci = StructureQuery.loci(atoms({
                unitTest: ctx => {
                    return StructureProperties.unit.operator_name(ctx.element) === residue.OperatorName;
                },
                chainTest: ctx => {
                    return StructureProperties.chain.label_asym_id(ctx.element) === residue.Chain;
                },
                residueTest: ctx => {
                    return StructureProperties.residue.auth_seq_id(ctx.element) === residue.SequenceNumber;
                }
            }), structure)
            const boundary = StructureElement.Loci.getBoundary(loci);
            const location = StructureElement.Loci.getFirstLocation(loci);
            if (location) {
                positions.push({
                    X: StructureProperties.atom.x(location),
                    Y: StructureProperties.atom.y(location),
                    Z: StructureProperties.atom.z(location),
                })
            } else {
                positions.push({
                    X: (boundary.box.max[0] + boundary.box.min[0]) / 2,
                    Y: (boundary.box.max[1] + boundary.box.min[1]) / 2,
                    Z: (boundary.box.max[2] + boundary.box.min[2]) / 2,
                })
            }
        }

        if (positions.length === 1) {
            return positions[0];
        }

        if (positions.length === 0) {
            return null;
        }

        let sum = positions.reduce((prev, cur, idx, array) => {
            return {
                X: prev.X + cur.X,
                Y: prev.Y + cur.Y,
                Z: prev.Z + cur.Z
            }
        });

        let centerOfMass = {
            X: sum.X / positions.length,
            Y: sum.Y / positions.length,
            Z: sum.Z / positions.length,
        } as Point;

        return centerOfMass;
    }
}
