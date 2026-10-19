import React from "react";
import { LayerSelectionPanel, LayerSelectionState } from "../Common/LayerSelection";
import { Datagrid, DGNoDataInfoRow, DGRowEmpty, headCell, propertyRow } from "../Common/Datagrid/Components";
import { roundToDecimal } from "../../../Common/Util/Numbers";

let DGTABLE_COLS_COUNT = 2;
let NO_DATA_MESSAGE = "Hover over channel(2D) for details...";

export class LayerProperties extends LayerSelectionPanel {

    render() {
        return <div>
            <Datagrid id="dg-layer-properties" columnsCount={DGTABLE_COLS_COUNT} noDataText={NO_DATA_MESSAGE}
                head={<>{headCell('Property', 1)}{headCell('Value', 2)}</>}
                body={(this.state.data !== null && this.state.layerIds.length > 0) ? <DGBody {...this.state} /> : null} />
        </div>;
    }
}

class DGBody extends React.Component<LayerSelectionState, {}> {
    private getBottleneck(layerdIds: number[]) {
        if (this.props.data === null) {
            return 0;
        }
        let minRadiusArr = [];
        for (let layerIdx of layerdIds) {
            minRadiusArr.push(this.props.data[layerIdx].LayerGeometry.MinRadius);
        }

        return Math.min(...minRadiusArr);
    }

    private getLength(layerdIds: number[]) {
        let length = 0;
        if (this.props.data === null) {
            return 0;
        }

        for (let layerIdx of layerdIds) {
            let geometry = this.props.data[layerIdx].LayerGeometry;
            length += Math.abs(geometry.EndDistance - geometry.StartDistance);
        }

        return length;
    }

    private generateRows() {
        if (this.props.data === null) {
            return <DGNoDataInfoRow columnsCount={DGTABLE_COLS_COUNT} infoText={NO_DATA_MESSAGE} />;
        }

        const p = this.props.data[this.props.layerIds[0]].Properties;
        const round = (value: number) => roundToDecimal(value, 2).toString();
        const optional = (value: number | null | undefined) => (value != null) ? roundToDecimal(value, 2) : 'N/A'; // 0 is a value
        return [
            propertyRow('hydropathy', 'bi bi-droplet', 'Hydropathy', (p === null) ? 'N/A' : round(p.Hydropathy)),
            propertyRow('polarity', 'bi bi-plus', 'Polarity', (p === null) ? 'N/A' : round(p.Polarity)),
            propertyRow('hydrophobicity', 'bi bi-droplet upside-down', 'Hydrophobicity', (p === null) ? 'N/A' : round(p.Hydrophobicity)),
            propertyRow('mutability', 'bi bi-scissors', 'Mutability', (p === null) ? 'N/A' : round(p.Mutability)),
            propertyRow('charge', 'bi bi-lightning', 'Charge', (p === null) ? 'N/A' : `${round(p.Charge)} (+${round(p.NumPositives)}/-${round(p.NumNegatives)})`),
            propertyRow('bottlenec', 'icon bottleneck black', (this.props.layerIds.length > 1) ? "Bottleneck" : "Radius", roundToDecimal(this.getBottleneck(this.props.layerIds), 1)),
            propertyRow('logP', 'icon logp black', 'LogP', optional(p?.LogP)),
            propertyRow('logD', 'icon logd black', 'LogD', optional(p?.LogD)),
            propertyRow('logS', 'icon logs black', 'LogS', optional(p?.LogS)),
            propertyRow('ionizable', 'icon ionizable black', 'Ionizable', optional(p?.Ionizable)),
            propertyRow('length', 'bi bi-arrows-expand', 'Length', roundToDecimal(this.getLength(this.props.layerIds), 1).toString()),
            <DGRowEmpty key={'empty'} columnsCount={DGTABLE_COLS_COUNT} />,
        ];
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
