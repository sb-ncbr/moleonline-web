import React from "react";
import { LayerSelectionPanel, LayerSelectionState } from "../Common/LayerSelection";
import { annotatedResidueRows, annotationCell, Datagrid, DGElementRow, DGNoDataInfoRow, DGRowEmpty, headCell, isBackbone } from "../Common/Datagrid/Components";
import { Residues } from "../../CommonUtils/Residues";
import { ChannelsDBData } from "../../../Cache";

let DGTABLE_COLS_COUNT = 2;
let NO_DATA_MESSAGE = "Hover over channel(2D) for details...";

export class LayerResidues extends LayerSelectionPanel {

    render() {
        return <div>
            <Datagrid id="dg-layer-residues" columnsCount={DGTABLE_COLS_COUNT} noDataText={NO_DATA_MESSAGE}
                head={headCell('Residue', 1)}
                body={(this.state.data !== null && this.state.layerIds.length > 0) ? <DGBody {...this.state} /> : null} />
        </div>;
    }
}

export class DGBody extends React.Component<LayerSelectionState, {}> {

    private getResidues(layerIds: number[]): string[] {
        if (this.props.data === null) {
            return [];
        }

        let residuesSet: Set<string> = new Set();
        for (let idx of layerIds) {
            for (let r of this.props.data[idx].Residues) {
                residuesSet.add(r);
            }
        }

        return Array.from(residuesSet.values());
    }

    private generateRows() {

        let columnCount = DGTABLE_COLS_COUNT;

        if (this.props.data === null) {
            return <DGNoDataInfoRow columnsCount={columnCount} infoText={NO_DATA_MESSAGE} />;
        }

        let layerData = Residues.sort(this.getResidues(this.props.layerIds));
        let rows: JSX.Element[] = [];

        for (let residue of layerData) {
            let residueInfo = Residues.parseResidues([residue]);
            let columns = [];
            columns.push(
                (isBackbone(residue)) ? <span key={residue}>{residue}</span> : <strong key={residue}>{residue}</strong>
            );
            let seqNumberAndChain = `${residueInfo[0].authSeqNumber} ${residueInfo[0].chain.authAsymId}`;
            let annotations = ChannelsDBData.getResidueAnnotationsImmediate(seqNumberAndChain);
            if (annotations !== null && annotations.length > 0) {
                if (annotations.length > 1) {
                    rows = rows.concat(annotatedResidueRows(residue, columns[0], annotations));
                }
                else {
                    columns.push(
                        annotationCell(annotations[0])
                    );
                    rows.push(
                        <DGElementRow key={residue} columns={columns} columnsCount={columnCount} title={[(isBackbone(residue) ? residue : ""), ""]} trClass={(isBackbone(residue) ? "help" : "")} />
                    );
                }
            }
            else {
                rows.push(
                    <DGElementRow key={residue} columns={columns} columnsCount={columnCount} title={[(isBackbone(residue) ? residue : ""), ""]} trClass={(isBackbone(residue) ? "help" : "")} />
                );
            }
        }
        rows.push(<DGRowEmpty key={'empty'} columnsCount={columnCount} />);

        return rows;
    }

    render() {
        let rows = this.generateRows();

        return (
            <table>
                <tbody>
                    {rows}
                </tbody>
            </table>
        );
    };
}    
