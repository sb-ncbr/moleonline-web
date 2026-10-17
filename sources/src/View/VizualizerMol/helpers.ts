/*
* Following code is based on 'PDBe Molstar'. See https://github.com/molstar/pdbe-molstar for more info.
*/
import { Queries, StructureProperties, StructureSelection } from 'molstar/lib/mol-model/structure';
import { AtomsQueryParams } from 'molstar/lib/mol-model/structure/query/queries/generators';
import { StructureQuery } from 'molstar/lib/mol-model/structure/query/query';
import Expression from 'molstar/lib/mol-script/language/expression';

/** RGB color (r, g, b values 0-255) */
export interface ColorParams { r: number, g: number, b: number }

/** Residues to select: a range of auth residue numbers in a chain, optionally in one copy (operator) */
export type QueryParam = {
    struct_asym_id?: string,
    start_auth_residue_number?: number,
    end_auth_residue_number?: number,
    operator_name?: string,
    color?: ColorParams,
    sideChain?: boolean,
    focus?: boolean,
};

export namespace QueryHelper {

    export function getQueryObject(params: QueryParam[]): Expression.Expression {
        const atmGroupsQueries = params.map(param => {
            const selection: Partial<AtomsQueryParams> = {};

            if (param.struct_asym_id) {
                selection['chainTest'] = l => StructureProperties.chain.label_asym_id(l.element) === param.struct_asym_id;
            }

            if (param.start_auth_residue_number !== undefined && param.end_auth_residue_number !== undefined) {
                selection['residueTest'] = l => {
                    const authSeqId = StructureProperties.residue.auth_seq_id(l.element);
                    return authSeqId >= param.start_auth_residue_number! && authSeqId <= param.end_auth_residue_number!;
                };
            }

            if (param.operator_name) {
                selection['unitTest'] = l => param.operator_name!.includes(StructureProperties.unit.operator_name(l.element));
            }

            return Queries.generators.atoms(selection);
        });

        return Queries.combinators.merge(atmGroupsQueries);
    }

    export function getInteractivityLoci(params: QueryParam[], contextData: any) {
        const sel = StructureQuery.run(QueryHelper.getQueryObject(params) as any, contextData);
        return StructureSelection.toLociWithSourceUnits(sel);
    }
}
