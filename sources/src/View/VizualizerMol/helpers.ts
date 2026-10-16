/*
* Following code is based on 'PDBe Molstar'. See https://github.com/molstar/pdbe-molstar for more info.
*/
import { Queries, StructureProperties, StructureSelection } from 'molstar/lib/mol-model/structure';
import { AtomsQueryParams } from 'molstar/lib/mol-model/structure/query/queries/generators';
import { StructureQuery } from 'molstar/lib/mol-model/structure/query/query';
import Expression from 'molstar/lib/mol-script/language/expression';
import { SIFTSMapping, SIFTSMappingMapping } from './sifts-mapping';

export type MapParams = {
    'em'?: MapStyle,
    '2fo-fc'?: MapStyle,
    'fo-fc(+ve)'?: MapStyle,
    'fo-fc(-ve)'?: MapStyle,
}
interface MapStyle {
    opacity?: number,
    wireframe?: boolean,
}

export type LigandQueryParam = {
    label_comp_id_list?: any,
    auth_asym_id?: string,
    struct_asym_id?: string,
    label_comp_id?: string,
    auth_seq_id?: number,
    show_all?: boolean
};

export type QueryParam = {
    auth_seq_id?: number,
    entity_id?: string,
    auth_asym_id?: string,
    struct_asym_id?: string,
    residue_number?: number,
    start_residue_number?: number,
    end_residue_number?: number,
    auth_residue_number?: number,
    auth_ins_code_id?: string,
    start_auth_residue_number?: number,
    start_auth_ins_code_id?: string,
    end_auth_residue_number?: number,
    end_auth_ins_code_id?: string,
    atoms?: string[],
    label_comp_id?: string,
    color?: any,
    sideChain?: boolean,
    representation?: string,
    representationColor?: any,
    focus?: boolean,
    tooltip?: string,
    start?: any,
    end?: any,
    atom_id?: number[],
    uniprot_accession?: string,
    uniprot_residue_number?: number,
    start_uniprot_residue_number?: number,
    end_uniprot_residue_number?: number,
    operator_name?: string,
};

export namespace QueryHelper {

    export function getQueryObject(params: QueryParam[], contextData: any): Expression.Expression {
        const selections: Partial<AtomsQueryParams>[] = [];
        let siftMappings: SIFTSMappingMapping | undefined;
        let currentAccession: string;

        params.forEach(param => {
            const selection: Partial<AtomsQueryParams> = {};

            // entity
            if (param.entity_id) selection['entityTest'] = l => StructureProperties.entity.id(l.element) === param.entity_id;

            // chain
            if (param.struct_asym_id) {
                selection['chainTest'] = l => StructureProperties.chain.label_asym_id(l.element) === param.struct_asym_id;
            } else if (param.auth_asym_id) {
                selection['chainTest'] = l => StructureProperties.chain.auth_asym_id(l.element) === param.auth_asym_id;
            }

            // residues
            if (param.label_comp_id) {
                selection['residueTest'] = l => StructureProperties.atom.label_comp_id(l.element) === param.label_comp_id;
            } else if (param.uniprot_accession && param.uniprot_residue_number !== undefined) {
                selection['residueTest'] = l => {
                    if (!siftMappings || currentAccession !== param.uniprot_accession) {
                        siftMappings = SIFTSMapping.Provider.get(contextData.models[0]).value;
                        currentAccession = param.uniprot_accession!;
                    }
                    const rI = StructureProperties.residue.key(l.element);
                    return !!siftMappings && param.uniprot_accession === siftMappings.accession[rI] && param.uniprot_residue_number === +siftMappings.num[rI];
                };
            } else if (param.uniprot_accession && param.start_uniprot_residue_number !== undefined && param.end_uniprot_residue_number !== undefined) {
                selection['residueTest'] = l => {
                    if (!siftMappings || currentAccession !== param.uniprot_accession) {
                        siftMappings = SIFTSMapping.Provider.get(contextData.models[0]).value;
                        currentAccession = param.uniprot_accession!;
                    }
                    const rI = StructureProperties.residue.key(l.element);
                    return !!siftMappings && param.uniprot_accession === siftMappings.accession[rI] && (param.start_uniprot_residue_number! <= +siftMappings.num[rI] && param.end_uniprot_residue_number! >= +siftMappings.num[rI]);
                };
            } else if (param.residue_number !== undefined) {
                selection['residueTest'] = l => StructureProperties.residue.label_seq_id(l.element) === param.residue_number;
            } else if (param.start_residue_number !== undefined && param.end_residue_number !== undefined && param.end_residue_number > param.start_residue_number) {
                selection['residueTest'] = l => {
                    const labelSeqId = StructureProperties.residue.label_seq_id(l.element);
                    return labelSeqId >= param.start_residue_number! && labelSeqId <= param.end_residue_number!;
                };

            } else if (param.start_residue_number !== undefined && param.end_residue_number !== undefined && param.end_residue_number === param.start_residue_number) {
                selection['residueTest'] = l => StructureProperties.residue.label_seq_id(l.element) === param.start_residue_number;
            } else if (param.auth_seq_id !== undefined) {
                selection['residueTest'] = l => StructureProperties.residue.auth_seq_id(l.element) === param.auth_seq_id;
            } else if (param.auth_residue_number !== undefined && !param.auth_ins_code_id) {
                selection['residueTest'] = l => StructureProperties.residue.auth_seq_id(l.element) === param.auth_residue_number;
            } else if (param.auth_residue_number !== undefined && param.auth_ins_code_id) {
                selection['residueTest'] = l => StructureProperties.residue.auth_seq_id(l.element) === param.auth_residue_number;
            } else if (param.start_auth_residue_number !== undefined && param.end_auth_residue_number !== undefined && param.end_auth_residue_number > param.start_auth_residue_number) {
                selection['residueTest'] = l => {
                    const authSeqId = StructureProperties.residue.auth_seq_id(l.element);
                    return authSeqId >= param.start_auth_residue_number! && authSeqId <= param.end_auth_residue_number!;
                };
            } else if (param.start_auth_residue_number !== undefined && param.end_auth_residue_number !== undefined && param.end_auth_residue_number === param.start_auth_residue_number) {
                selection['residueTest'] = l => StructureProperties.residue.auth_seq_id(l.element) === param.start_auth_residue_number;
            }

            // atoms
            if (param.atoms) {
                selection['atomTest'] = l => param.atoms!.includes(StructureProperties.atom.label_atom_id(l.element));
            }

            if (param.atom_id) {
                selection['atomTest'] = l => param.atom_id!.includes(StructureProperties.atom.id(l.element));
            }

            // unit
            if (param.operator_name) {
                selection['unitTest'] = l => param.operator_name!.includes(StructureProperties.unit.operator_name(l.element));
            }

            selections.push(selection);
        });

        const atmGroupsQueries: StructureQuery[] = [];
        selections.forEach(selection => {
            atmGroupsQueries.push(Queries.generators.atoms(selection));
        });

        return Queries.combinators.merge(atmGroupsQueries);
    }

    export function getInteractivityLoci(params: any, contextData: any) {
        const sel = StructureQuery.run(QueryHelper.getQueryObject(params, contextData) as any, contextData);
        return StructureSelection.toLociWithSourceUnits(sel);
    }
}
