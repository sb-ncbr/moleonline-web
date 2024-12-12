// import DGComponents = Datagrid.Components;

import React from "react";
import { LightResidueInfo, SelectionHelper } from "../../CommonUtils/Selection";
import { Residues } from "../../CommonUtils/Residues";
import { Events } from "../../../Bridge";
import { DGElementRow, DGNoDataInfoRow, DGRowEmpty } from "../Common/Datagrid/Components";
import { ResidueAnnotation } from "../../../ChannelsDBAPIService";
import { ChannelsDBData } from "../../../Cache";

let DGTABLE_COLS_COUNT = 2;
let NO_DATA_MESSAGE = "Select channel in 3D view for details...";

declare function $(p: any): any;

interface State {
    data: string[] | null,
    app: LiningResidues,
};

export class LiningResidues extends React.Component<{ }, State> {

    state: State = {
        data: null,
        app: this,
    };

    layerIdx = -1;

    componentDidMount() {
        SelectionHelper.attachOnChannelSelectHandler((data) => {
            let state = this.state;
            state.data = Residues.sort(data.ResidueFlow, void 0, true, true);
            this.setState(state);
            setTimeout(function () {
                $(window).trigger('contentResize');
            }, 1);
        });

        SelectionHelper.attachOnChannelDeselectHandler(() => {
            let state = this.state;
            state.data = null;
            this.setState(state);
        });

        // Events.subscribeChangeSubmitId(() => {
        //     let state = this.state;
        //     state.data = null;
        //     this.setState(state);
        // });
    }

    componentWillUnmount() {
    }

    render() {
        if (this.state.data !== null) {
            return (
                <div>
                    <DGTable {...this.state} />
                    {/* <Controls {...this.state} /> */}
                </div>
            );
        }

        return <div>
            <DGNoData {...this.state} />
        </div>
    }
}
function residueStringToResidueLight(residue: string): LightResidueInfo {
    /*
    [0 , 1 ,2 ,  3   ]
    VAL 647 A Backbone
    */
    let residueParts = residue.split(" ");
    let rv = {
        authSeqNumber: Number(residueParts[1]),
        chain: {
            authAsymId: residueParts[2]
        },
        operatorName: "",
        isHet: false,
        loci: undefined,
    };

    return rv;
}

class Controls extends React.Component<State, {}> {

    clearSelection() {
        SelectionHelper.clearSelection();
    }

    selectAll() {
        let residues = [];
        if (this.props.app.state.data === null) {
            return;
        }

        for (let residue of this.props.app.state.data) {
            residues.push(residueStringToResidueLight(residue));
        }

        SelectionHelper.addResiduesToSelection(residues, false);
    }

    selectIonizable() {
        if (this.props.data === null) {
            return;
        }
        let allResidues = Residues.parseResidues(this.props.data, true);
        let ionizableResidues = [];
        for (let residue of allResidues) {
            let rClass: string = "";
            if (residue.name !== void 0) {
                rClass = Residues.getResidueClassByName(residue.name);
            }
            else {
                //TODO
                // rClass = Residues.getName(residue.authSeqNumber, this.props.app.props.controller!);
            }

            if (rClass.indexOf("blue") !== -1 || rClass.indexOf("red") !== -1) {
                ionizableResidues.push(residue);
            }
        }

        SelectionHelper.addResiduesToSelection(ionizableResidues, false);
    }

    render() {
        return <div className="lining-residues select-controls">
            <span className="btn btn-sm btn-outline-light bt-ionizable hand" onClick={this.selectIonizable.bind(this)}>Select ionizable</span>
            <span className="btn btn-sm btn-outline-light bt-all hand" onClick={this.selectAll.bind(this)}>Select all</span>
        </div>
    }
}

class DGNoData extends React.Component<State, {}> {
    render() {
        return (<div className="datagrid" id="dg-lining-residues">
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
        return (<div className="datagrid" id="dg-lining-residues">
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
                    <th>
                        <Controls {...this.props} />
                    </th>
                </tr>
            </table>
        );
    };
}

class DGBody extends React.Component<State, {}> {

    private getAnnotationLinkOrText(annotation: ResidueAnnotation) {
        if (annotation.reference === "") {
            return (annotation.text !== void 0 && annotation.text !== null) ? <span>{annotation.text}</span> : <span className="no-annotation" />;
        }
        return <a target="_blank" href={annotation.link} dangerouslySetInnerHTML={{ __html: annotation.text }}></a>
    }

    private shortenBackbone(residue: string) {
        return residue.replace(/Backbone/g, '');
    }

    private isBackbone(residue: string) {
        return residue.indexOf("Backbone") >= 0;
    }

    private selectResidue(residue: string) {
        let residueLightEntity = residueStringToResidueLight(residue);
        let operatorName = '';
        if (/\d/.test(residueLightEntity.chain.authAsymId)) { // since we're using always 'Assembly' structure type the operator name always would be 'ASM_1', 'ASM_2', ...
            operatorName = 'ASM_' + residueLightEntity.chain.authAsymId.replace(/.*?(\d+).*/, "$1");
        } else {
            operatorName = 'ASM_1';
        }
        const asymId = residueLightEntity.chain.authAsymId.split('_')[0];
        SelectionHelper.addResidueToSelection(residueLightEntity.authSeqNumber, asymId, operatorName);
    }

    private getSelect3DLink(residue: string) {
        let residueEl = (this.isBackbone(residue)) ? <i><strong>{this.shortenBackbone(residue)}</strong></i> : <span>{residue}</span>;
        return <a className="hand" onClick={(e) => { this.selectResidue(residue) }}>{residueEl}</a>
    }

    private generateSpannedRows(residue: string, annotations: ResidueAnnotation[]) {
        let trs: JSX.Element[] = [];

        let residueNameEl = this.getSelect3DLink(residue);

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

    private generateRows() {
        let columnsCount = DGTABLE_COLS_COUNT;
        if (this.props.data === null) {
            return <DGNoDataInfoRow columnsCount={DGTABLE_COLS_COUNT} infoText={NO_DATA_MESSAGE} />;
        }

        let rows: JSX.Element[] = [];
        for (let residue of this.props.data) {
            let residueId = residue.split(" ").slice(1, 3).join(" ");
            let residueInfo = Residues.parseResidues([residue], true);

            let trClass = (this.isBackbone(residue) ? "help" : "");
            if (residueInfo.length > 0) {
                let authName = residueInfo[0].name;

                trClass += (authName === void 0) ? '' : " " + Residues.getResidueClassByName(authName);
            }

            let seqNumberAndChain = `${residueInfo[0].authSeqNumber} ${residueInfo[0].chain.authAsymId}`;
            let annotations = ChannelsDBData.getResidueAnnotationsImmediate(seqNumberAndChain);
            if (annotations !== null && annotations.length > 0) {
                if (annotations.length > 1) {
                    rows = rows.concat(
                        this.generateSpannedRows(residue, annotations)
                    );
                }
                else {
                    rows.push(
                        <DGElementRow columnsCount={columnsCount} columns={[this.getSelect3DLink(residue), this.getAnnotationLinkOrText(annotations[0])]} title={[(this.isBackbone(residue) ? residue : "")]} trClass={trClass} />
                    )
                }
            }
            else {
                rows.push(
                    <DGElementRow columnsCount={columnsCount} columns={[this.getSelect3DLink(residue)]} title={[(this.isBackbone(residue) ? residue : "")]} trClass={trClass} />
                );
            }
        }
        rows.push(<DGRowEmpty columnsCount={columnsCount} />);

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
