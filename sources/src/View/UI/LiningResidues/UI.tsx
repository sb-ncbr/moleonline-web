import React from "react";
import { LightResidueInfo, SelectionHelper } from "../../CommonUtils/Selection";
import { Residues } from "../../CommonUtils/Residues";
import { Tunnels } from "../../CommonUtils/Tunnels";
import { annotatedResidueRows, annotationCell, Datagrid, DGElementRow, DGNoDataInfoRow, DGRowEmpty, headCell, isBackbone } from "../Common/Datagrid/Components";
import { ChannelsDBData } from "../../../Cache";

let DGTABLE_COLS_COUNT = 2;
let NO_DATA_MESSAGE = "Select channel in 3D view for details...";

declare function $(p: any): any;

interface State {
    data: string[] | null,
    labelChains: boolean, // the channel names its chains by label ID
};

export class LiningResidues extends React.Component<{}, State> {

    state: State = {
        data: null,
        labelChains: false,
    };


    componentDidMount() {
        SelectionHelper.attachOnChannelSelectHandler2((channel) => {
            this.setState({ labelChains: Tunnels.chainsByLabel(channel) });
        });
        SelectionHelper.attachOnChannelSelectHandler((data) => {
            this.setState({ data: Residues.sort(data.ResidueFlow) });
            setTimeout(function () {
                $(window).trigger('contentResize');
            }, 1);
        });

        SelectionHelper.attachOnChannelDeselectHandler(() => {
            this.setState({ data: null });
        });
    }

    render() {
        return <Datagrid id="dg-lining-residues" columnsCount={DGTABLE_COLS_COUNT} noDataText={NO_DATA_MESSAGE}
                head={<>{headCell('Residue', 1)}<th><Controls {...this.state} /></th></>}
                body={(this.state.data !== null) ? <DGBody {...this.state} /> : null} />;
    }
}

function residueStringToResidueLight(residue: string, labelChain: boolean): LightResidueInfo {
    const r = Residues.parseResidues([residue])[0];
    return { authSeqNumber: r.authSeqNumber, chain: r.chain, labelChain, operatorName: r.operatorName, loci: undefined, residueName: r.name };
}

class Controls extends React.Component<State, {}> {

    selectAll() {
        let residues = [];
        if (this.props.data === null) {
            return;
        }

        for (let residue of this.props.data) {
            residues.push(residueStringToResidueLight(residue, this.props.labelChains));
        }

        SelectionHelper.addResiduesToSelection(residues);
    }

    selectIonizable() {
        if (this.props.data === null) {
            return;
        }
        let allResidues = Residues.parseResidues(this.props.data);
        let ionizableResidues = [];
        for (let residue of allResidues) {
            let rClass: string = "";
            if (residue.name !== void 0) {
                rClass = Residues.getResidueClassByName(residue.name);
            }
            else {
                //TODO
            }

            if (rClass.indexOf("blue") !== -1 || rClass.indexOf("red") !== -1) {
                ionizableResidues.push({ ...residue, labelChain: this.props.labelChains, residueName: residue.name });
            }
        }

        SelectionHelper.addResiduesToSelection(ionizableResidues);
    }

    render() {
        return <div className="lining-residues select-controls">
            <span className="btn btn-sm btn-outline-light bt-ionizable hand" onClick={this.selectIonizable.bind(this)}>Select ionizable</span>
            <span className="btn btn-sm btn-outline-light bt-all hand" onClick={this.selectAll.bind(this)}>Select all</span>
        </div>
    }
}

class DGBody extends React.Component<State, {}> {

    private shortenBackbone(residue: string) {
        return residue.replace(/Backbone/g, '');
    }

    private selectResidue(residue: string) {
        const r = Residues.parseResidues([residue])[0];
        SelectionHelper.addResidueToSelection(r.authSeqNumber, r.chain.authAsymId, r.operatorName, undefined, r.name, this.props.labelChains);
    }

    private getSelect3DLink(residue: string) {
        let residueEl = (isBackbone(residue)) ? <i><strong>{this.shortenBackbone(residue)}</strong></i> : <span>{residue}</span>;
        return <a className="hand" onClick={(e) => { this.selectResidue(residue) }}>{residueEl}</a>
    }

    private generateRows() {
        let columnsCount = DGTABLE_COLS_COUNT;
        if (this.props.data === null) {
            return <DGNoDataInfoRow columnsCount={DGTABLE_COLS_COUNT} infoText={NO_DATA_MESSAGE} />;
        }

        let rows: JSX.Element[] = [];
        for (let residue of this.props.data) {
            let residueInfo = Residues.parseResidues([residue]);

            let trClass = (isBackbone(residue) ? "help" : "");
            if (residueInfo.length > 0) {
                let authName = residueInfo[0].name;

                trClass += (authName === void 0) ? '' : " " + Residues.getResidueClassByName(authName);
            }

            let seqNumberAndChain = `${residueInfo[0].authSeqNumber} ${residueInfo[0].chain.authAsymId}`;
            let annotations = ChannelsDBData.getResidueAnnotationsImmediate(seqNumberAndChain);
            if (annotations !== null && annotations.length > 0) {
                if (annotations.length > 1) {
                    rows = rows.concat(annotatedResidueRows(residue, this.getSelect3DLink(residue), annotations));
                }
                else {
                    rows.push(
                        <DGElementRow key={residue} columnsCount={columnsCount} columns={[this.getSelect3DLink(residue), annotationCell(annotations[0])]} title={[(isBackbone(residue) ? residue : "")]} trClass={trClass} />
                    )
                }
            }
            else {
                rows.push(
                    <DGElementRow key={residue} columnsCount={columnsCount} columns={[this.getSelect3DLink(residue)]} title={[(isBackbone(residue) ? residue : "")]} trClass={trClass} />
                );
            }
        }
        rows.push(<DGRowEmpty key={'empty'} columnsCount={columnsCount} />);

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
