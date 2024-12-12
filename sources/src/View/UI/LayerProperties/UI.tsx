// import DGComponents = Datagrid.Components;
// import WebChemistryCore = WebChemistry.Tunnels.Core;

import React from "react";
import { LayersInfo, Properties } from "../../../DataInterface";
import { SelectionHelper } from "../../CommonUtils/Selection";
import { Events } from "../../../Bridge";
import { DGElementRow, DGNoDataInfoRow, DGRowEmpty } from "../Common/Datagrid/Components";
import { PdbResidue, PhysicoChemicalPropertyCalculation, TunnelLayer } from "../../../PhysicoChemicalProperties";
import { Residues } from "../../CommonUtils/Residues";
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

export class LayerProperties extends React.Component<{ }, State> {

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

        // Events.subscribeChangeSubmitId(() => {
        //     let state = this.state;
        //     state.layerIds = [];
        //     state.data = null;
        //     state.selectionOn = false;
        //     this.setState(state);
        // });

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
        if (this.state.data !== null && this.state.layerIds.length > 0) {
            return (
                <div>
                    <DGTable {...this.state} />
                </div>
            );
        }

        return <div>
            <DGNoData {...this.state} />
        </div>
    }
}

class DGNoData extends React.Component<State, {}> {
    render() {
        return (<div className="datagrid" id="dg-layer-properties">
            <div className="header">
                <DGHead {...this.props} />
            </div>
            <div className="body">
                <table>
                    <DGNoDataInfoRow columnsCount={DGTABLE_COLS_COUNT} infoText={NO_DATA_MESSAGE} />
                    <DGRowEmpty columnsCount={DGTABLE_COLS_COUNT} />
                </table>
            </div>
        </div>);
    }
}

class DGTable extends React.Component<State, {}> {
    render() {
        return (<div className="datagrid" id="dg-layer-properties">
            <div className="header">
                <DGHead {...this.props} />
            </div>
            <div className="body">
                <DGBody {...this.props} />
            </div>
        </div>);
    }
}

class DGHead extends React.Component<State, {}> {
    render() {
        return (
            <table>
                <tr>
                    <th title="Property" className="col col-1">
                        Property
                    </th>
                    <th title="Value" className="col col-2">
                        Value
                    </th>
                </tr>
            </table>
        );
    };
}

class DGBody extends React.Component<State, {}> {
    private getPropertiesData(layerIds: number[]) {

        let layersData = this.props.data;
        if (layersData === null) {
            return null;
        }

        let layers: TunnelLayer[] = [];
        for (let layerIdx of layerIds) {
            let layer = layersData[layerIdx];
            let residues = Residues.parseResidues(layer.Residues, true);
            let backboneLining = residues.filter(r => { return r.backbone === true }).map((v, i, arr) => {
                return {
                    Name: v.name,
                    SeqNumber: v.authSeqNumber,
                    Chain: v.chain.authAsymId
                } as PdbResidue
            });
            let nonBackboneLining = residues.filter(r => { return r.backbone === false }).map((v, i, arr) => {
                return {
                    Name: v.name,
                    SeqNumber: v.authSeqNumber,
                    Chain: v.chain.authAsymId
                } as PdbResidue
            });

            layers.push({
                NonBackboneLining: nonBackboneLining,
                BackboneLining: backboneLining,
                Length: Math.abs(layer.LayerGeometry.EndDistance - layer.LayerGeometry.StartDistance)
            } as TunnelLayer);
        }

        let data = PhysicoChemicalPropertyCalculation.CalculateAgregatedLayersProperties(layers);
        if (data === null) {
            return null;
        }

        return {
            Charge: data.Charge,
            Hydropathy: data.Hydropathy,
            Hydrophobicity: data.Hydrophobicity,
            Ionizable: data.Ionizable,
            LogD: data.LogD,
            LogP: data.LogP,
            LogS: data.LogS,
            Mutability: data.Mutability,
            NumNegatives: data.NumNegatives,
            NumPositives: data.NumPositives,
            Polarity: data.Polarity
        } as Properties;
    }

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

        let layerData = this.getPropertiesData(this.props.layerIds);
        let rows = [];

        let charge = (layerData === null) ? 'N/A' : `${roundToDecimal(layerData.Charge, 2).toString()} (+${roundToDecimal(layerData.NumPositives, 2).toString()}/-${roundToDecimal(layerData.NumNegatives, 2).toString()})`;
        let bottleneck = this.getBottleneck(this.props.layerIds);


        let hydropathy = (layerData === null) ? 'N/A' : roundToDecimal(layerData.Hydropathy, 2).toString()
        let polarity = (layerData === null) ? 'N/A' : roundToDecimal(layerData.Polarity, 2).toString();
        let hydrophobicity = (layerData === null) ? 'N/A' : roundToDecimal(layerData.Hydrophobicity, 2).toString();
        let mutability = (layerData === null) ? 'N/A' : roundToDecimal(layerData.Mutability, 2).toString();
        let length = this.getLength(this.props.layerIds);
        rows.push(
            <DGElementRow columns={[<span><span className="glyphicon glyphicon-tint properties-icon" />{"Hydropathy"}</span>, <span>{hydropathy}</span>]} />
        );
        rows.push(
            <DGElementRow columns={[<span><span className="glyphicon glyphicon-plus properties-icon" />{"Polarity"}</span>, <span>{polarity}</span>]} />
        );
        rows.push(
            <DGElementRow columns={[<span><span className="glyphicon glyphicon-tint properties-icon upside-down" />{"Hydrophobicity"}</span>, <span>{hydrophobicity}</span>]} />
        );
        rows.push(
            <DGElementRow columns={[<span><span className="glyphicon glyphicon-scissors properties-icon" />{"Mutability"}</span>, <span>{mutability}</span>]} />
        );
        rows.push(
            <DGElementRow columns={[<span><span className="glyphicon glyphicon-flash properties-icon" />{"Charge"}</span>, <span>{charge}</span>]} />
        );
        rows.push(
            <DGElementRow columns={[<span><span className="icon bottleneck black properties-icon" />{(this.props.layerIds.length > 1) ? "Bottleneck" : "Radius"}</span>, <span>{roundToDecimal(bottleneck, 1)}</span>]} />
        );
        rows.push(
            <DGElementRow columns={[<span><span className="icon logp black properties-icon" />{"LogP"}</span>, <span>{(layerData !== null && layerData.LogP !== null && layerData.LogP !== void 0) ? roundToDecimal(layerData.LogP, 2) : 'N/A'}</span>]} />
        );
        rows.push(
            <DGElementRow columns={[<span><span className="icon logd black properties-icon" />{"LogD"}</span>, <span>{(layerData !== null && layerData.LogD !== null && layerData.LogD !== void 0) ? roundToDecimal(layerData.LogD, 2) : 'N/A'}</span>]} />
        );
        rows.push(
            <DGElementRow columns={[<span><span className="icon logs black properties-icon" />{"LogS"}</span>, <span>{(layerData !== null && layerData.LogS !== null && layerData.LogS !== void 0) ? roundToDecimal(layerData.LogS, 2) : 'N/A'}</span>]} />
        );
        rows.push(
            <DGElementRow columns={[<span><span className="icon ionizable black properties-icon" />{"Ionizable"}</span>, <span>{(layerData !== null && layerData.Ionizable !== null && layerData.Ionizable !== void 0) ? roundToDecimal(layerData.Ionizable, 2) : 'N/A'}</span>]} />
        );
        rows.push(
            <DGElementRow columns={[<span><span className="glyphicon glyphicon-resize-horizontal properties-icon" />{"Length"}</span>, <span>{roundToDecimal(length, 1).toString()}</span>]} />
        );
        rows.push(<DGRowEmpty columnsCount={DGTABLE_COLS_COUNT} />);

        return rows;
    }

    render() {
        let rows = this.generateRows();

        return (
            <table>
                {rows}
            </table>
        );
    };
}

class DGRow extends React.Component<{ columns: string[] }, {}> {

    private generateRow(columns: string[]) {
        let tds = [];
        for (let i = 0; i < columns.length; i++) {
            tds.push(
                <td className={`col col-${i + 1}`}>
                    {columns[i]}
                </td>
            );
        }

        return tds;
    }

    render() {
        return (
            <tr>
                {this.generateRow(this.props.columns)}
            </tr>);
    }
}
