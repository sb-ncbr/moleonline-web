// import DGComponents = Datagrid.Components;

import React from "react";
import { ChannelsDBChannels, MoleChannels, Tunnel } from "../../../DataInterface";
import { Events } from "../../../Bridge";
import { Tunnels } from "../../CommonUtils/Tunnels";
import { SelectionHelper } from "../../CommonUtils/Selection";
import { DGElementRow, DGNoDataInfoRow, DGRowEmpty } from "../Common/Datagrid/Components";
import { roundToDecimal } from "../../../Common/Util/Numbers";

let DGTABLE_COLS_COUNT = 2;
let NO_DATA_MESSAGE = "Select channel in 3D view for details...";

declare function $(p: any): any;

interface State {
    data: Map<string, Tunnel[]> | null,
    currentTunnel: string | null,
    currentSubmission: string | null,
    app: ChannelParameters
};

export class ChannelParameters extends React.Component<{ }, State> {

    state: State = {
        data: null,
        currentTunnel: null,
        currentSubmission: null,
        app: this,
    };

    layerIdx = -1;

    concatTunnels(tunnels: ChannelsDBChannels) {
        let concatTunnels: Tunnel[] = [];

        concatTunnels = Tunnels.concatTunnelsSafe(concatTunnels, tunnels.Tunnels);
        concatTunnels = Tunnels.concatTunnelsSafe(concatTunnels, tunnels.Paths);
        concatTunnels = Tunnels.concatTunnelsSafe(concatTunnels, tunnels.Pores);
        concatTunnels = Tunnels.concatTunnelsSafe(concatTunnels, tunnels.MergedPores);

        concatTunnels = Tunnels.concatTunnelsSafe(concatTunnels, tunnels.ReviewedChannels_MOLE);
        concatTunnels = Tunnels.concatTunnelsSafe(concatTunnels, tunnels.ReviewedChannels_Caver);
        concatTunnels = Tunnels.concatTunnelsSafe(concatTunnels, tunnels.CSATunnels_MOLE);
        concatTunnels = Tunnels.concatTunnelsSafe(concatTunnels, tunnels.CSATunnels_Caver);
        concatTunnels = Tunnels.concatTunnelsSafe(concatTunnels, tunnels.TransmembranePores_MOLE);
        concatTunnels = Tunnels.concatTunnelsSafe(concatTunnels, tunnels.TransmembranePores_Caver);
        concatTunnels = Tunnels.concatTunnelsSafe(concatTunnels, tunnels.CofactorTunnels_MOLE);
        concatTunnels = Tunnels.concatTunnelsSafe(concatTunnels, tunnels.CofactorTunnels_Caver);
        concatTunnels = Tunnels.concatTunnelsSafe(concatTunnels, tunnels.ProcognateTunnels_MOLE);
        concatTunnels = Tunnels.concatTunnelsSafe(concatTunnels, tunnels.ProcognateTunnels_Caver);
        concatTunnels = Tunnels.concatTunnelsSafe(concatTunnels, tunnels.AlphaFillTunnels_MOLE);
        concatTunnels = Tunnels.concatTunnelsSafe(concatTunnels, tunnels.AlphaFillTunnels_Caver);

        return concatTunnels;
    }

    componentDidMount() {
        Tunnels.attachOnTunnelsLoaded(() => {
            const submissionsMap: Map<string, Tunnel[]> = new Map();
            const channelsDB = Tunnels.getChannelsDB();
            if (channelsDB) {
                const concatChannelsDB = this.concatTunnels(channelsDB);
                submissionsMap.set('ChannelsDB', concatChannelsDB);
            }
            const submissions = Tunnels.getChannels();
            for (const submission of Array.from(submissions.keys())) {
                const channels = submissions.get(submission);
                if (channels) {
                    const concatDataChannels = this.concatTunnels(channels);
                    submissionsMap.set(submission.toString(), concatDataChannels);
                }
            }
            this.setState({data: submissionsMap});
        })

        // Events.subscribeChannelDataLoaded((data) => {
        //     let toShow: Tunnel[] = [];

        //     let channelsDbTunnels = data.Channels as ChannelsDBChannels;
        //     let moleTunnels = data.Channels as MoleChannels;

        //     toShow = Tunnels.concatTunnelsSafe(toShow, moleTunnels.Tunnels);
        //     toShow = Tunnels.concatTunnelsSafe(toShow, moleTunnels.Paths);
        //     toShow = Tunnels.concatTunnelsSafe(toShow, moleTunnels.Pores);
        //     toShow = Tunnels.concatTunnelsSafe(toShow, moleTunnels.MergedPores);

        //     toShow = Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.ReviewedChannels_MOLE);
        //     toShow = Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.ReviewedChannels_Caver);
        //     toShow = Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.CSATunnels_MOLE);
        //     toShow = Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.CSATunnels_Caver);
        //     toShow = Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.TransmembranePores_MOLE);
        //     toShow = Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.TransmembranePores_Caver);
        //     toShow = Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.CofactorTunnels_MOLE);
        //     toShow = Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.CofactorTunnels_Caver);
        //     toShow = Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.ProcognateTunnels_MOLE);
        //     toShow = Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.ProcognateTunnels_Caver);
        //     toShow = Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.AlphaFillTunnels_MOLE);
        //     toShow = Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.AlphaFillTunnels_Caver);

        //     let state = this.state;
        //     state.data = toShow;
        //     this.setState(state);
        //     $(window).trigger("contentResize");
        // });
        SelectionHelper.attachOnChannelSelectHandler((data, channelId, submissionId) => {
            if (channelId === void 0 || submissionId === void 0) {
                return;
            }
            let state = this.state;
            state.currentTunnel = channelId;
            state.currentSubmission = submissionId;
            this.setState(state);
            setTimeout(function () {
                $(window).trigger('contentResize');
            }, 1);
        });

        SelectionHelper.attachOnChannelDeselectHandler(() => {
            let state = this.state;
            state.currentTunnel = null;
            this.setState(state);
        });

        // Events.subscribeChangeSubmitId(() => {
        //     let state = this.state;
        //     state.currentTunnel = null;
        //     this.setState(state);
        // });
    }

    componentWillUnmount() {
    }

    render() {
        if (this.state.data !== null && this.state.currentTunnel !== null) {
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
        return (<div className="datagrid" id="dg-channel-parameters">
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
        return (<div className="datagrid" id="dg-channel-parameters">
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

    private generateRows() {
        let columnsCount = DGTABLE_COLS_COUNT;
        if (this.props.data === null) {
            return <DGNoDataInfoRow columnsCount={DGTABLE_COLS_COUNT} infoText={NO_DATA_MESSAGE} />;
        }

        let rows: JSX.Element[] = [];

        let data = this.props.data;

        for (const submissionId of Array.from(this.props.data.keys())) {
            if (submissionId === this.props.currentSubmission) {
                const tunnels = this.props.data.get(submissionId);
                if (tunnels) {
                    for (let t of tunnels) {
                        if (t.Id === this.props.currentTunnel) {
                            let length = [
                                <span><span className="bi bi-arrows-expand properties-icon" />{"Length"}</span>,
                                <span>{roundToDecimal(Tunnels.getLength(t), 2).toString()}</span>
                            ];
                            let bottleneck = [
                                <span><span className="icon bottleneck black properties-icon" />{"Bottleneck"}</span>,
                                <span>{Tunnels.getBottleneck(t)}</span>
                            ];
                            let hydropathy = [
                                <span><span className="bi bi-droplet properties-icon" />{"Hydropathy"}</span>,
                                <span>{roundToDecimal(t.Properties.Hydropathy, 2).toString()}</span>
                            ];
                            let charge = [
                                <span><span className="bi bi-lightning properties-icon" />{"Charge"}</span>,
                                <span>{roundToDecimal(t.Properties.Charge, 2).toString()}</span>
                            ];
                            let polarity = [
                                <span><span className="bi bi-plus properties-icon" />{"Polarity"}</span>,
                                <span>{roundToDecimal(t.Properties.Polarity, 2).toString()}</span>
                            ];
                            let mutability = [
                                <span><span className="bi bi-scissors properties-icon" />{"Mutability"}</span>,
                                <span>{roundToDecimal(t.Properties.Mutability, 2).toString()}</span>
                            ];
                            let logP = [
                                <span><span className="icon logp black properties-icon" />{"LogP"}</span>,
                                <span>{(t.Properties.LogP) ? roundToDecimal(t.Properties.LogP, 2) : 'N/A'}</span>
                            ];
                            let logD = [
                                <span><span className="icon logd black properties-icon" />{"LogD"}</span>,
                                <span>{(t.Properties.LogD) ? roundToDecimal(t.Properties.LogD, 2) : 'N/A'}</span>
                            ];
                            let logS = [
                                <span><span className="icon logs black properties-icon" />{"LogS"}</span>,
                                <span>{(t.Properties.LogS) ? roundToDecimal(t.Properties.LogS, 2) : 'N/A'}</span>
                            ];
                            let ionizable = [
                                <span><span className="icon ionizable black properties-icon" />{"Ionizable"}</span>,
                                <span>{(t.Properties.Ionizable) ? roundToDecimal(t.Properties.Ionizable, 2) : 'N/A'}</span>
                            ];
                            //Length
                            rows.push(
                                <DGElementRow columnsCount={columnsCount} columns={length} />
                            )
                            //Bottleneck
                            rows.push(
                                <DGElementRow columnsCount={columnsCount} columns={bottleneck} />
                            )
                            //Hydropathy
                            rows.push(
                                <DGElementRow columnsCount={columnsCount} columns={hydropathy} />
                            )
                            //Charge
                            rows.push(
                                <DGElementRow columnsCount={columnsCount} columns={charge} />
                            )
                            //Polarity
                            rows.push(
                                <DGElementRow columnsCount={columnsCount} columns={polarity} />
                            )
                            //Mutability
                            rows.push(
                                <DGElementRow columnsCount={columnsCount} columns={mutability} />
                            )
                            //LogP
                            rows.push(
                                <DGElementRow columnsCount={columnsCount} columns={logP} />
                            )
                            //LogD
                            rows.push(
                                <DGElementRow columnsCount={columnsCount} columns={logD} />
                            )
                            //LogS
                            rows.push(
                                <DGElementRow columnsCount={columnsCount} columns={logS} />
                            )
                            //Ionizable
                            rows.push(
                                <DGElementRow columnsCount={columnsCount} columns={ionizable} />
                            )
                        }
                    }
                }
            }
        }

        // for (let t of data) {
        //     if (t.Id === this.props.currentTunnel) {
        //         let length = [
        //             <span><span className="bi bi-arrows-expand properties-icon" />{"Length"}</span>,
        //             <span>{roundToDecimal(Tunnels.getLength(t), 2).toString()}</span>
        //         ];
        //         let bottleneck = [
        //             <span><span className="icon bottleneck black properties-icon" />{"Bottleneck"}</span>,
        //             <span>{Tunnels.getBottleneck(t)}</span>
        //         ];
        //         let hydropathy = [
        //             <span><span className="bi bi-droplet properties-icon" />{"Hydropathy"}</span>,
        //             <span>{roundToDecimal(t.Properties.Hydropathy, 2).toString()}</span>
        //         ];
        //         let charge = [
        //             <span><span className="bi bi-lightning properties-icon" />{"Charge"}</span>,
        //             <span>{roundToDecimal(t.Properties.Charge, 2).toString()}</span>
        //         ];
        //         let polarity = [
        //             <span><span className="bi bi-plus properties-icon" />{"Polarity"}</span>,
        //             <span>{roundToDecimal(t.Properties.Polarity, 2).toString()}</span>
        //         ];
        //         let mutability = [
        //             <span><span className="bi bi-scissors properties-icon" />{"Mutability"}</span>,
        //             <span>{roundToDecimal(t.Properties.Mutability, 2).toString()}</span>
        //         ];
        //         let logP = [
        //             <span><span className="icon logp black properties-icon" />{"LogP"}</span>,
        //             <span>{(t.Properties.LogP) ? roundToDecimal(t.Properties.LogP, 2) : 'N/A'}</span>
        //         ];
        //         let logD = [
        //             <span><span className="icon logd black properties-icon" />{"LogD"}</span>,
        //             <span>{(t.Properties.LogD) ? roundToDecimal(t.Properties.LogD, 2) : 'N/A'}</span>
        //         ];
        //         let logS = [
        //             <span><span className="icon logs black properties-icon" />{"LogS"}</span>,
        //             <span>{(t.Properties.LogS) ? roundToDecimal(t.Properties.LogS, 2) : 'N/A'}</span>
        //         ];
        //         let ionizable = [
        //             <span><span className="icon ionizable black properties-icon" />{"Ionizable"}</span>,
        //             <span>{(t.Properties.Ionizable) ? roundToDecimal(t.Properties.Ionizable, 2) : 'N/A'}</span>
        //         ];
        //         //Length
        //         rows.push(
        //             <DGElementRow columnsCount={columnsCount} columns={length} />
        //         )
        //         //Bottleneck
        //         rows.push(
        //             <DGElementRow columnsCount={columnsCount} columns={bottleneck} />
        //         )
        //         //Hydropathy
        //         rows.push(
        //             <DGElementRow columnsCount={columnsCount} columns={hydropathy} />
        //         )
        //         //Charge
        //         rows.push(
        //             <DGElementRow columnsCount={columnsCount} columns={charge} />
        //         )
        //         //Polarity
        //         rows.push(
        //             <DGElementRow columnsCount={columnsCount} columns={polarity} />
        //         )
        //         //Mutability
        //         rows.push(
        //             <DGElementRow columnsCount={columnsCount} columns={mutability} />
        //         )
        //         //LogP
        //         rows.push(
        //             <DGElementRow columnsCount={columnsCount} columns={logP} />
        //         )
        //         //LogD
        //         rows.push(
        //             <DGElementRow columnsCount={columnsCount} columns={logD} />
        //         )
        //         //LogS
        //         rows.push(
        //             <DGElementRow columnsCount={columnsCount} columns={logS} />
        //         )
        //         //Ionizable
        //         rows.push(
        //             <DGElementRow columnsCount={columnsCount} columns={ionizable} />
        //         )
        //     }
        // }

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
