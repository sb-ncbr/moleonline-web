import React from "react";
import { LayersInfo } from "../../../DataInterface";
import { SelectionHelper } from "../../CommonUtils/Selection";
import { Datagrid, DGElementRow, DGNoDataInfoRow, DGRowEmpty, headCell } from "../Common/Datagrid/Components";
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

        let layerData = this.props.data[this.props.layerIds[0]].Properties;
        let rows = [];

        let charge = (layerData === null) ? 'N/A' : `${roundToDecimal(layerData.Charge, 2).toString()} (+${roundToDecimal(layerData.NumPositives, 2).toString()}/-${roundToDecimal(layerData.NumNegatives, 2).toString()})`;
        let bottleneck = this.getBottleneck(this.props.layerIds);


        let hydropathy = (layerData === null) ? 'N/A' : roundToDecimal(layerData.Hydropathy, 2).toString()
        let polarity = (layerData === null) ? 'N/A' : roundToDecimal(layerData.Polarity, 2).toString();
        let hydrophobicity = (layerData === null) ? 'N/A' : roundToDecimal(layerData.Hydrophobicity, 2).toString();
        let mutability = (layerData === null) ? 'N/A' : roundToDecimal(layerData.Mutability, 2).toString();
        let length = this.getLength(this.props.layerIds);
        rows.push(
            <DGElementRow key={'hydropathy'} columns={[<span><span className="bi bi-droplet properties-icon" />{"Hydropathy"}</span>, <span>{hydropathy}</span>]} />
        );
        rows.push(
            <DGElementRow key={'polarity'} columns={[<span><span className="bi bi-plus properties-icon" />{"Polarity"}</span>, <span>{polarity}</span>]} />
        );
        rows.push(
            <DGElementRow key={'hydrophobicity'} columns={[<span><span className="bi bi-droplet properties-icon upside-down" />{"Hydrophobicity"}</span>, <span>{hydrophobicity}</span>]} />
        );
        rows.push(
            <DGElementRow key={'mutability'} columns={[<span><span className="bi bi-scissors properties-icon" />{"Mutability"}</span>, <span>{mutability}</span>]} />
        );
        rows.push(
            <DGElementRow key={'charge'} columns={[<span><span className="bi bi-lightning properties-icon" />{"Charge"}</span>, <span>{charge}</span>]} />
        );
        rows.push(
            <DGElementRow key={'bottlenec'} columns={[<span><span className="icon bottleneck black properties-icon" />{(this.props.layerIds.length > 1) ? "Bottleneck" : "Radius"}</span>, <span>{roundToDecimal(bottleneck, 1)}</span>]} />
        );
        rows.push(
            <DGElementRow key={'logP'} columns={[<span><span className="icon logp black properties-icon" />{"LogP"}</span>, <span>{(layerData && layerData.LogP) ? roundToDecimal(layerData.LogP, 2) : 'N/A'}</span>]} />
        );
        rows.push(
            <DGElementRow key={'logD'} columns={[<span><span className="icon logd black properties-icon" />{"LogD"}</span>, <span>{(layerData && layerData.LogD) ? roundToDecimal(layerData.LogD, 2) : 'N/A'}</span>]} />
        );
        rows.push(
            <DGElementRow key={'logS'} columns={[<span><span className="icon logs black properties-icon" />{"LogS"}</span>, <span>{(layerData && layerData.LogS) ? roundToDecimal(layerData.LogS, 2) : 'N/A'}</span>]} />
        );
        rows.push(
            <DGElementRow key={'ionizable'} columns={[<span><span className="icon ionizable black properties-icon" />{"Ionizable"}</span>, <span>{(layerData && layerData.Ionizable) ? roundToDecimal(layerData.Ionizable, 2) : 'N/A'}</span>]} />
        );
        rows.push(
            <DGElementRow key={'length'} columns={[<span><span className="bi bi-arrows-expand properties-icon" />{"Length"}</span>, <span>{roundToDecimal(length, 1).toString()}</span>]} />
        );
        rows.push(<DGRowEmpty key={'empty'} columnsCount={DGTABLE_COLS_COUNT} />);

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
