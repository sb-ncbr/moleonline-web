import { ChannelsDBChannels, MoleChannels, MoleData, Tunnel } from "../../../DataInterface";
// import LiteMoleEvent = LiteMol.Bootstrap.Event;
import { Events } from "../../../Bridge";
import { Tunnels } from "../../CommonUtils/Tunnels";
import { TooltipText as Tooltips } from "../../../StaticData";
import { ChannelsDBData, TunnelName } from "../../../Cache";
import React from "react";
import { DGRowEmpty } from "../Common/Datagrid/Components";
import { roundToDecimal } from "../../../Common/Util/Numbers";
import { getParameters, isInChannelsDBMode } from "../../../Common/Util/Router";
import { ComputationInfo, JobStatus } from "../../../DataProxy";
import { ChannelsDBData as ChannelsDBDataCache } from "../../../Cache"
import { ApiService, CompInfo } from "../../../MoleAPIService";
import { generateGuidAll } from "../../State";

let DGTABLE_COLS_COUNT = 12;

declare function $(p: any): any;

interface State {
    data: Map<string, Tunnel[]> | null,
    app: AglomeredParameters,
};


export class AglomeredParameters extends React.Component<{}, State> {

    state: State = {
        data: null,
        app: this,
    };

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
        
        //TODO
        // $(window).on("contentResize", this.forceUpdate());

        // $(window).on("resize", (() => {
        //     this.forceUpdate();
        // }).bind(this));

        this.forceUpdate();
    }

    componentWillUnmount() {
    }

    componentDidUpdate(prevState: State) {
        $('.init-agp-tooltip').tooltip({ container: 'body' });
    }

    render() {
        return (
            <div>
                <DGTable {...this.state} />
            </div>
        );
    }
}

class DGTable extends React.Component<State, {}> {
    render() {
        return (<div className="datagrid" id="dg-aglomered-parameters">
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
                    <th title={Tooltips.get("Submission")} className="col col-1 ATable-header-identifier init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                        Submission
                    </th>
                    <th title={Tooltips.get("Name")} className="col col-2 ATable-header-identifier init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                        Name
                    </th>
                    <th title={Tooltips.get("Length")} className="col col-3 ATable-header-length init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                        <span className="bi bi-arrows-expand" /> <span className="ATable-label">Length</span>
                    </th>
                    <th title={Tooltips.get("Bottleneck")} className="col col-4 ATable-header-bottleneck init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                        <span className="icon bottleneck" /> <span className="ATable-label">Bottleneck</span>
                    </th>
                    <th title={Tooltips.get("agl-Hydropathy")} className="col col-5 ATable-header-hydropathy init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                        <span className="bi bi-droplet" /> <span className="ATable-label">Hydropathy</span>
                    </th>
                    <th title={Tooltips.get("agl-Charge")} className="col col-6 ATable-header-charge init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                        <span className="bi bi-lightning" /> <span className="ATable-label">Charge</span>
                    </th>
                    <th title={Tooltips.get("agl-Polarity")} className="col col-7 ATable-header-polarity init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                        <span className="bi bi-plus" /> <span className="ATable-label">Polarity</span>
                    </th>
                    <th title={Tooltips.get("agl-Mutability")} className="col col-8 ATable-header-mutability init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                        <span className="bi bi-scissors" /> <span className="ATable-label">Mutability</span>
                    </th>
                    <th title={Tooltips.get("agl-LogP")} className="col col-9 ATable-header-logp init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                        <span className="icon logp" /> <span className="ATable-label">LogP</span>
                    </th>
                    <th title={Tooltips.get("agl-LogD")} className="col col-10 ATable-header-logd init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                        <span className="icon logd" /> <span className="ATable-label">LogD</span>
                    </th>
                    <th title={Tooltips.get("agl-LogS")} className="col col-11 ATable-header-logs init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                        <span className="icon logs" /> <span className="ATable-label">LogS</span>
                    </th>
                    <th title={Tooltips.get("agl-Ionizable")} className="col col-12 ATable-header-ionizable init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                        <span className="icon ionizable" /> <span className="ATable-label">Ionizable</span>
                    </th>
                </tr>
            </table>
        );
    };
}

class DGBody extends React.Component<State, {}> {

    private generateRows() {
        let rows = [];
        if (this.props.data === null || this.props.data.size === 0) {
            rows.push(
                <tr><td colSpan={DGTABLE_COLS_COUNT} >There are no data to be displayed...</td></tr>
            );
        }

        if (this.props.data !== null) {
            for (const submission of Array.from(this.props.data.keys())) {
                const tunnels = this.props.data.get(submission);
                if (tunnels) {
                    for (let tunnel of tunnels) {
                        rows.push(
                            <DGRow tunnel={tunnel} submissionId={submission} app={this.props.app} />
                        );
                    }
                }
            }
        }

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

class DGRow extends React.Component<{ tunnel: Tunnel, submissionId: string, app: AglomeredParameters }, {}> {

    render() {
        let name = TunnelName.get(this.props.tunnel.GUID);
        let namePart = (name === void 0) ? '' : ` (${name})`; //(name === void 0) ? 'X' : ` (${name})`;
        let tunnelID = this.props.tunnel.Type + namePart;

        if (isInChannelsDBMode()) {
            let annotations = ChannelsDBData.getChannelAnnotationsImmediate(this.props.tunnel.Id);
            if (annotations !== null && annotations.length > 0) {
                tunnelID = annotations[0].name;
            }
            else {
                tunnelID = this.props.tunnel.Type;
            }
        }

        return (
            <tr>
                <td className="col col-1">
                    {this.props.submissionId}
                </td>
                <td className="col col-2">
                    {tunnelID}
                </td>
                <td className="col col-3">
                    {Tunnels.getLength(this.props.tunnel)} Å
                </td>
                <td className="col col-4">
                    {Tunnels.getBottleneck(this.props.tunnel)} Å
                </td>
                <td className="col col-5">
                    {roundToDecimal(this.props.tunnel.Properties.Hydropathy, 2)}
                </td>
                <td className="col col-6">
                    {roundToDecimal(this.props.tunnel.Properties.Charge, 2)}
                </td>
                <td className="col col-7">
                    {roundToDecimal(this.props.tunnel.Properties.Polarity, 2)}
                </td>
                <td className="col col-8">
                    {roundToDecimal(this.props.tunnel.Properties.Mutability, 2)}
                </td>
                <td className="col col-9">
                    {(this.props.tunnel.Properties.LogP) ? roundToDecimal(this.props.tunnel.Properties.LogP, 2) : 'N/A'}
                </td>
                <td className="col col-10">
                    {(this.props.tunnel.Properties.LogD) ? roundToDecimal(this.props.tunnel.Properties.LogD, 2) : 'N/A'}
                </td>
                <td className="col col-11">
                    {(this.props.tunnel.Properties.LogS) ? roundToDecimal(this.props.tunnel.Properties.LogS, 2) : 'N/A'}
                </td>
                <td className="col col-12">
                    {(this.props.tunnel.Properties.Ionizable) ? roundToDecimal(this.props.tunnel.Properties.Ionizable, 2) : 'N/A'}
                </td>
            </tr>);
    }
}
