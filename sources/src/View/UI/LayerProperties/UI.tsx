import React from "react";
import { LayersInfo } from "../../../DataInterface";
import { SelectionHelper } from "../../CommonUtils/Selection";
import { Datagrid, DGNoDataInfoRow, DGRowEmpty, headCell, propertyRow } from "../Common/Datagrid/Components";
import { roundToDecimal } from "../../../Common/Util/Numbers";

let DGTABLE_COLS_COUNT = 2;
let NO_DATA_MESSAGE = "Hover over channel(2D) for details...";

declare function $(p: any): any;

interface State {
    data: LayersInfo[] | null,
    app: LayerProperties,
    layerIds: number[],
    selectionOn: boolean
};

export class LayerProperties extends React.Component<{}, State> {

    state: State = {
        data: null,
        app: this,
        layerIds: [],
        selectionOn: false
    };

    componentDidMount() {
        SelectionHelper.attachOnChannelDeselectHandler(() => {
            let state = this.state;
            state.layerIds = [];
            state.data = null;
            state.selectionOn = false;
            this.setState(state);
        });
        SelectionHelper.attachOnChannelSelectHandler((data) => {
            let state = this.state;
            state.layerIds = [];
            state.data = data.LayersInfo;
            state.selectionOn = false;
            this.setState(state);
        });

        $(window).on('layerTriggered', this.layerTriggerHandler.bind(this));
        $(window).on('layerSelected', this.layerSelectedHandler.bind(this));
    }

    private layerTriggerHandler(event: any, layerIdx: number) {
        let state = this.state;

        if (state.selectionOn) {
            return;
        }

        state.layerIds = [layerIdx];

        this.setState(state);

        setTimeout(function () {
            $(window).trigger('contentResize');
        }, 1);
    }

    private layerSelectedHandler(event: any, data: { layerIds: number[] }) {
        let state = this.state;

        state.layerIds = data.layerIds;

        state.selectionOn = state.layerIds.length > 0;

        this.setState(state);

        setTimeout(function () {
            $(window).trigger('contentResize');
        }, 1);
    }

    componentWillUnmount() {
    }

    render() {
        return <div>
            <Datagrid id="dg-layer-properties" columnsCount={DGTABLE_COLS_COUNT} noDataText={NO_DATA_MESSAGE}
                head={<>{headCell('Property', 1)}{headCell('Value', 2)}</>}
                body={(this.state.data !== null && this.state.layerIds.length > 0) ? <DGBody {...this.state} /> : null} />
        </div>;
    }
}

class DGBody extends React.Component<State, {}> {
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
        const optional = (value: number | undefined) => (p && value) ? roundToDecimal(value, 2) : 'N/A';
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
