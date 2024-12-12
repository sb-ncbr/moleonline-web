import { getChainOptions, getModelEntityOptions, getOperatorOptions, getSequenceWrapper, getStructureOptions } from "molstar/lib/mol-plugin-ui/sequence";
import { Instances } from "../../Bridge";
// import Model = LiteMol.Core.Structure.Molecule.Model;
// import Controller = LiteMol.Plugin.Controller;
//TODO Molstar
import { MoleConfigResidue } from "../../MoleAPIService";
import { Context } from "../Context";
import { PluginStateObject, PluginStateObject as PSO } from 'molstar/lib/mol-plugin-state/objects';
import { StructureElement, StructureProperties as SP, Unit, Queries, StructureSelection, StructureQuery, StructureProperties } from "molstar/lib/mol-model/structure";
import { StateSelection } from "molstar/lib/mol-state";
import { Loci } from "molstar/lib/mol-model/loci";

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

    public static parseResidues(residues: string[], hasName?: boolean) {
        if (hasName === void 0) {
            hasName = false;
        }

        let resParsed: RType[] = [];
        for (let residue of residues) {
            let residueParts = this.parseResidue(residue);
            if (hasName) {
                resParsed.push(
                    {
                        chain: { authAsymId: residueParts[2].replace(/-/g, "_") },
                        authSeqNumber: Number(residueParts[1]),
                        name: residueParts[0],
                        backbone: (residueParts.length === 4),
                        operatorName: "",
                        isHet: false,
                        loci: undefined
                    }
                );
            }
            else {
                resParsed.push(
                    {
                        chain: { authAsymId: residueParts[1] },
                        authSeqNumber: Number(residueParts[0]),
                        backbone: (residueParts.length === 3),
                        operatorName: "",
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

    private static createResidueQuery(chainGroupId: number, operatorName: string, label_seq_id: number) {
        return Queries.generators.atoms({
            unitTest: ctx => {
                return (
                    SP.unit.chainGroupId(ctx.element) === chainGroupId &&
                    SP.unit.operator_name(ctx.element) === operatorName
                );
            },
            residueTest: ctx => {
                if (ctx.element.unit.kind === 0) { //Unit.Kind.Atomic
                    return SP.residue.label_seq_id(ctx.element) === label_seq_id;
                } else {
                    return (
                        SP.coarse.seq_id_begin(ctx.element) <= label_seq_id &&
                        SP.coarse.seq_id_end(ctx.element) >= label_seq_id
                    );
                }
            }
        });
    }

    public static getResiudeNameold(authSeqNumber: number, authAsymId: string, operatorName: string) {
        let plugin = Context.getInstance().plugin;
        const cell = plugin.state.data.select(StateSelection.first('protein-data'))[0];
            let moleculeStructure = null;
            if (cell && cell.obj) {
                moleculeStructure = (cell.obj as PSO.Molecule.Structure).data;
            }
            if (moleculeStructure === null) {
                console.log("protein data not ready!");
                return "";
            }

            for (let unit of moleculeStructure.units) {
                const l = StructureElement.Location.create(moleculeStructure, unit, unit.elements[0])
                const asymId = Unit.isAtomic(unit) ? SP.chain.label_asym_id(l) : SP.coarse.asym_id(l);
                const operatorName = SP.unit.operator_name(l);
                if (asymId === authAsymId && (operatorName === "" || operatorName === operatorName)) {
                    const entitySeq = unit.model.sequence.byEntityKey[SP.entity.key(l)];
                    for (let i = 0; i < entitySeq.sequence.length; i++) {
                        const query = this.createResidueQuery(unit.chainGroupId, unit.conformation.operator.name, entitySeq.sequence.seqId.value(i));
                        const loci = StructureSelection.toLociWithSourceUnits(StructureQuery.run(query, moleculeStructure));
                        const location = StructureElement.Loci.getFirstLocation(loci, StructureElement.Location.create(moleculeStructure, unit));
                        if (location && SP.residue.auth_seq_id(location) === authSeqNumber) {
                            if (location) {
                                return SP.atom.label_comp_id(location);
                            }
                        }
                    }
                    break;
                }
            }
    }

    public static getResiudeName(authSeqNumber: number, authAsymId: string, operatorName: string) {
        const plugin = Context.getInstance().plugin;
        const structureOptions = getStructureOptions(plugin.state.data);
        const structureRef = structureOptions.options[0][0];
        const state = plugin.state.data;
        const cell = state.select(structureRef)[0];
        if (!structureRef || !cell || !cell.obj) return null;

        const structure = (cell.obj as PluginStateObject.Molecule.Structure).data;
        const l = StructureElement.Location.create(structure);

        for (const [modelEntityId, eLabel] of getModelEntityOptions(structure, false)) {
            for (const [chainGroupId, cLabel] of getChainOptions(structure, modelEntityId)) {
                let [modelIdx, entityId] = modelEntityId.split('|');
                for (const unit of structure.units) {
                    StructureElement.Location.set(l, structure, unit, unit.elements[0]);
                    const asymId = Unit.isAtomic(unit) ? StructureProperties.chain.label_asym_id(l) : StructureProperties.coarse.asym_id(l);
                    if (structure.getModelIndex(unit.model) !== parseInt(modelIdx)) continue;
                    // if (StructureProperties.entity.id(l) !== entityId) continue;
                    if (asymId !== authAsymId) continue;
                    for (const [operatorKey, operator_name] of getOperatorOptions(structure, modelEntityId, chainGroupId)) {
                        if (operatorName !== "" && operator_name !== operatorName) continue;
                        const wrapper = getSequenceWrapper({
                            structure,
                            modelEntityId,
                            chainGroupId,
                            operatorKey
                        }, plugin.managers.structure.selection)
                        if (typeof wrapper !== "string") {
                            for (let i = 0, il = wrapper.length; i < il; ++i) {
                                const loci = wrapper.getLoci(i);
                                if (loci.elements.length > 0) {
                                    const location = StructureElement.Loci.getFirstLocation(loci, StructureElement.Location.create(void 0));
                                    if (location && StructureProperties.residue.auth_seq_id(location) === authSeqNumber) {
                                        return SP.atom.label_comp_id(location);
                                    }
                                }
                            }
                        }
                    } 
                }
            }
        }
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
        const l = StructureElement.Location.create(structure);
        
        for (let residue of residues) {
            for (const [modelEntityId, eLabel] of getModelEntityOptions(structure, false)) {
                for (const [chainGroupId, cLabel] of getChainOptions(structure, modelEntityId)) {
                    let [modelIdx, entityId] = modelEntityId.split('|');
                    for (const unit of structure.units) {
                        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
                        const asymId = Unit.isAtomic(unit) ? StructureProperties.chain.label_asym_id(l) : StructureProperties.coarse.asym_id(l);
                        if (structure.getModelIndex(unit.model) !== parseInt(modelIdx)) continue;
                        // if (StructureProperties.entity.id(l) !== entityId) continue;
                        if (asymId !== residue.Chain) continue;
                        for (const [operatorKey, operator_name] of getOperatorOptions(structure, modelEntityId, chainGroupId)) {
                            if (residue.OperatorName !== "" && operator_name !== residue.OperatorName) continue;
                            const wrapper = getSequenceWrapper({
                                structure,
                                modelEntityId,
                                chainGroupId,
                                operatorKey
                            }, plugin.managers.structure.selection)
                            if (typeof wrapper !== "string") {
                                for (let i = 0, il = wrapper.length; i < il; ++i) {
                                    const loci = wrapper.getLoci(i);
                                    if (loci.elements.length > 0) {
                                        const location = StructureElement.Loci.getFirstLocation(loci, StructureElement.Location.create(void 0));
                                        if (location && StructureProperties.residue.auth_seq_id(location) === residue.SequenceNumber) {
                                            positions.push({
                                                X: SP.coarse.x(location),
                                                Y: SP.coarse.y(location),
                                                Z: SP.coarse.z(location)
                                            })
                                            break;
                                        }
                                    }
                                }
                            }
                        } 
                    }
                }
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

    public static getCenterOfMassOld(residues: MoleConfigResidue[]): Point | null {
        let positions: Point[] = [];
        let plugin = Context.getInstance().plugin;


        for (let residue of residues) {
            const cell = plugin.state.data.select(StateSelection.first('protein-data'))[0];
            let moleculeStructure = null;
            if (cell && cell.obj) {
                moleculeStructure = (cell.obj as PSO.Molecule.Structure).data;
            }
            if (moleculeStructure === null || moleculeStructure === undefined) {
                console.log("protein data not ready!");
                return null;
            }

            for (let unit of moleculeStructure.units) {
                const l = StructureElement.Location.create(moleculeStructure, unit, unit.elements[0])
                const asymId = Unit.isAtomic(unit) ? SP.chain.label_asym_id(l) : SP.coarse.asym_id(l);
                // const operatorName = SP.unit.operator_name(l);
                if (asymId === residue.Chain) {
                    const entitySeq = unit.model.sequence.byEntityKey[SP.entity.key(l)];
                    for (let i = 0; i < entitySeq.sequence.length; i++) {
                        const query = this.createResidueQuery(unit.chainGroupId, unit.conformation.operator.name, entitySeq.sequence.seqId.value(i));
                        const queryRun = StructureQuery.run(query, moleculeStructure);
                        const loci = StructureSelection.toLociWithSourceUnits(queryRun);
                        const location = StructureElement.Loci.getFirstLocation(loci, StructureElement.Location.create(moleculeStructure, unit));
                        if (location && SP.residue.auth_seq_id(location) === residue.SequenceNumber && SP.atom.label_comp_id(location) === residue.Name.toUpperCase()) {
                            positions.push({
                                X: SP.coarse.x(location),
                                Y: SP.coarse.y(location),
                                Z: SP.coarse.z(location)
                            })
                            break;
                        }
                    }
                    break;
                }
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

// function getNodeFromTree(root: LiteMol.Bootstrap.Entity.Any, ref: string): LiteMol.Bootstrap.Entity.Any | null {
//     if (root.ref === ref) {
//         return root;
//     }
//     for (let c of root.children) {
//         let n = getNodeFromTree(c, ref);
//         if (n !== null) {
//             return n;
//         }
//     }

//     return null;
// }

// function removeNodeFromTree(plugin: LiteMol.Plugin.Controller, nodeRef: string) {
//     let obj = getNodeFromTree(plugin.root, nodeRef);
//     if (obj !== null) {
//         LiteMol.Bootstrap.Tree.remove(obj);
//     }
// }
