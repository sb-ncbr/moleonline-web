import { getStructureOptions } from "molstar/lib/mol-plugin-ui/sequence";
import { Context } from "../Context";
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects';
import { StructureElement, StructureSelection, StructureQuery, StructureProperties } from "molstar/lib/mol-model/structure";
import { Loci } from "molstar/lib/mol-model/loci";
import { atoms } from 'molstar/lib/mol-model/structure/query/queries/generators';

// copy: the number of the assembly copy the residue is in ("2" in "B_2"), operatorName: its operator in the structure
interface RType { chain: { authAsymId: string }, authSeqNumber: number, copy: string, operatorName: string, loci: Loci | undefined, name?: string, backbone?: boolean };
export interface Point {
    X: number,
    Y: number,
    Z: number
}

// The structure shown in the plugin, if any
function currentStructure() {
    const state = Context.getInstance().plugin.state.data;
    const structureRef = getStructureOptions(state).options[0][0];
    const cell = structureRef ? state.select(structureRef)[0] : void 0;
    return cell?.obj ? (cell.obj as PluginStateObject.Molecule.Structure).data : null;
}

export class Residues {
    // Sorts "NAME SEQ CHAIN[_COPY][ Backbone]" residues: by chain, copy and number, the backbone ones last
    public static sort(residues: string[]) {
        return this.parseResidues(residues).sort(this.getSortFunctionBackboneChainSeq())
            .map(val => `${val.name} ${val.authSeqNumber} ${val.chain.authAsymId}${val.copy === '1' ? '' : '_' + val.copy}${val.backbone ? ' Backbone' : ''}`);
    }

    public static getOperatorName(number: string) {
        const structure = currentStructure();
        if (structure === null) return '';

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

    // Parses "NAME SEQ CHAIN[_COPY][ Backbone]" residues; without a copy number it is the first copy
    public static parseResidues(residues: string[]): RType[] {
        // residue numbers can be negative, chain IDs can have digits (they never have "_", which starts the copy)
        const regex = /^(\w+)\s+(-?\d+)\s+([A-Za-z0-9]+)(?:_(\d+))?(?:\s+(\w+))?$/;

        return residues.map(residue => {
            const match = residue.match(regex);
            if (!match) {
                throw new Error("Invalid format");
            }
            const [, residueName, seqNumber, chain, copy = '1', backbone] = match;
            return {
                authSeqNumber: Number(seqNumber),
                chain: {
                    authAsymId: chain
                },
                copy,
                operatorName: Residues.getOperatorName(copy),
                loci: undefined,
                name: residueName,
                backbone: backbone === "Backbone"
            };
        });
    }

    public static getSortFunctionBackboneChainSeq() {
        return (a: RType, b: RType) => {
            if (a.backbone === b.backbone) {
                if (a.chain.authAsymId === b.chain.authAsymId) {
                    return (Number(a.copy) - Number(b.copy)) || (a.authSeqNumber - b.authSeqNumber);
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
        const structure = currentStructure();
        if (structure === null) return false;

        const loci = StructureQuery.loci(atoms({
            residueTest: ctx => StructureProperties.atom.label_comp_id(ctx.element) === residueName
        }), structure);
        return !StructureElement.Loci.isEmpty(loci);
    }

    public static getResiudeName(authSeqNumber: number, authAsymId: string, operatorName: string) {
        const structure = currentStructure();
        if (structure === null) return null;

        const loci = StructureQuery.loci(atoms({
            unitTest: ctx => {
                return StructureProperties.unit.operator_name(ctx.element) === operatorName;
            },
            chainTest: ctx => {
                return StructureProperties.chain.auth_asym_id(ctx.element) === authAsymId;
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
        const structure = currentStructure();
        if (structure === null) return null;

        let positions: Point[] = [];

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

        if (positions.length === 0) {
            return null;
        }
        const mean = (key: keyof Point) => positions.reduce((sum, p) => sum + p[key], 0) / positions.length;
        return { X: mean('X'), Y: mean('Y'), Z: mean('Z') };
    }
}
