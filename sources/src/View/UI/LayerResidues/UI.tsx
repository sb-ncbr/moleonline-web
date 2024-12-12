// import DGComponents = Datagrid.Components;

import React from "react";
import { LayersInfo } from "../../../DataInterface";
import { SelectionHelper } from "../../CommonUtils/Selection";
import { Events } from "../../../Bridge";
import { DGElementRow, DGNoDataInfoRow, DGRowEmpty } from "../Common/Datagrid/Components";
import { ResidueAnnotation } from "../../../ChannelsDBAPIService";
import { Residues } from "../../CommonUtils/Residues";
import { ChannelsDBData } from "../../../Cache";

let DGTABLE_COLS_COUNT = 2;
let NO_DATA_MESSAGE = "Hover over channel(2D) for details...";

declare function $(p: any): any;

interface State {
    data: LayersInfo[] | null,
    app: LayerResidues,
    layerIds: number[],
    selectionOn: boolean
};

export class LayerResidues extends React.Component<{ }, State> {

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
            this.setState(state);
        });
        SelectionHelper.attachOnChannelSelectHandler((data) => {
            let state = this.state;
            state.layerIds = [];
            state.data = data.LayersInfo;
            this.setState(state);
        });
        // Events.subscribeChangeSubmitId(() => {
        //     let state = this.state;
        //     state.layerIds = [];
        //     state.data = null;
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
        return (<div className="datagrid" id="dg-layer-residues">
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
        return (<div className="datagrid" id="dg-layer-residues">
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
                    <th title="Residue" className="col col-1">
                        Residue
                    </th>
                </tr>
            </table>
        );
    };
}

class DGBody extends React.Component<State, {}> {

    private shortenBackbone(residue: string) {
        return residue.replace(/Backbone/g, 'BB');
    }

    private isBackbone(residue: string) {
        return residue.indexOf("Backbone") >= 0;
    }

    private getAnnotationLinkOrText(annotation: ResidueAnnotation) {
        if (annotation.reference === "") {
            return (annotation.text !== void 0 && annotation.text !== null) ? <span>{annotation.text}</span> : <span className="no-annotation" />;
        }
        return <a target="_blank" href={annotation.link} dangerouslySetInnerHTML={{ __html: annotation.text }}></a>
    }

    private generateSpannedRows(residue: string, annotations: ResidueAnnotation[]) {
        let trs: JSX.Element[] = [];

        let residueNameEl = residue;

        let first = true;
        for (let annotation of annotations) {
            if (first === true) {
                first = false;
                trs.push(
                    <tr title={(this.isBackbone(residue) ? residue : "")} className={(this.isBackbone(residue) ? "help" : "")}>
                        <td className={`col col-1`} rowSpan={(annotations.length > 1) ? annotations.length : void 0}>
                            {residueNameEl}
                        </td>
                        <td className={`col col-2`} >
                            {this.getAnnotationLinkOrText(annotation)}
                        </td>
                    </tr>
                );
            }
            else {
                trs.push(
                    <tr>
                        <td className={`col col-2`} >
                            {this.getAnnotationLinkOrText(annotation)}
                        </td>
                    </tr>
                );
            }
        }
        return trs;
    }

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

        let layerData = Residues.sort(this.getResidues(this.props.layerIds), void 0, true, true);
        let rows: JSX.Element[] = [];

        for (let residue of layerData) {
            let residueId = residue.split(" ").slice(1, 3).join(" ");
            let residueInfo = Residues.parseResidues([residue], true);
            let columns = [];
            columns.push(
                (this.isBackbone(residue)) ? <span>{residue}</span> : <strong>{residue}</strong>
            );
            let seqNumberAndChain = `${residueInfo[0].authSeqNumber} ${residueInfo[0].chain.authAsymId}`;
            let annotations = ChannelsDBData.getResidueAnnotationsImmediate(seqNumberAndChain);
            if (annotations !== null && annotations.length > 0) {
                if (annotations.length > 1) {
                    rows = rows.concat(this.generateSpannedRows(residueId, annotations));
                }
                else {
                    columns.push(
                        this.getAnnotationLinkOrText(annotations[0])
                    );
                    rows.push(
                        <DGElementRow columns={columns} columnsCount={columnCount} title={[(this.isBackbone(residue) ? residue : ""), ""]} trClass={(this.isBackbone(residue) ? "help" : "")} />
                    );
                }
            }
            else {
                rows.push(
                    <DGElementRow columns={columns} columnsCount={columnCount} title={[(this.isBackbone(residue) ? residue : ""), ""]} trClass={(this.isBackbone(residue) ? "help" : "")} />
                );
            }
        }
        rows.push(<DGRowEmpty columnsCount={columnCount} />);

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
