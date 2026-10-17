import { getStructureOptions } from "molstar/lib/mol-plugin-ui/sequence";
import { Context } from "../Context";
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects';
import { StructureElement, StructureSelection, StructureQuery, StructureProperties } from "molstar/lib/mol-model/structure";
import { Loci } from "molstar/lib/mol-model/loci";
import { atoms } from 'molstar/lib/mol-model/structure/query/queries/generators';

interface RType { chain: { authAsymId: string }, authSeqNumber: number, operatorName: string, isHet: boolean, loci: Loci | undefined, name?: string, backbone?: boolean };
export interface Point {
    X: number,
    Y: number,
    Z: number
}

export class Residues {
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

    // Whether the loaded structure contains a residue of this name (e.g. a cofactor such as HEM)
    public static currentContextHasResidue(residueName: string): boolean {
        const plugin = Context.getInstance().plugin;
        const structureRef = getStructureOptions(plugin.state.data).options[0][0];
        const cell = structureRef ? plugin.state.data.select(structureRef)[0] : void 0;
        if (!cell || !cell.obj) return false;

        const structure = (cell.obj as PluginStateObject.Molecule.Structure).data;
        const loci = StructureQuery.loci(atoms({
            residueTest: ctx => StructureProperties.atom.label_comp_id(ctx.element) === residueName
        }), structure);
        return !StructureElement.Loci.isEmpty(loci);
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

    // Residues without an operator (CSA) match the first copy of their chain
    public static getCenterOfMass(residues: { Chain: string, SequenceNumber: number, OperatorName?: string }[]): Point | null {
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
                    return residue.OperatorName === void 0 || StructureProperties.unit.operator_name(ctx.element) === residue.OperatorName;
                },
                chainTest: ctx => {
                    return StructureProperties.chain.label_asym_id(ctx.element) === residue.Chain || StructureProperties.chain.auth_asym_id(ctx.element) === residue.Chain;
                },
                residueTest: ctx => {
                    return StructureProperties.residue.auth_seq_id(ctx.element) === residue.SequenceNumber;
                }
            }), structure)
            const location = StructureElement.Loci.getFirstLocation(loci);
            if (!location) {
                continue; // the residue is not in the structure
            }
            positions.push({
                X: StructureProperties.atom.x(location),
                Y: StructureProperties.atom.y(location),
                Z: StructureProperties.atom.z(location),
            })
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
