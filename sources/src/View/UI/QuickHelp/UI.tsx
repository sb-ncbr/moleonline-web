import React from "react";
import { SelectionHelper } from "../../CommonUtils/Selection";
import { ComputationInfo, JobStatus } from "../../../DataProxy";
import { CompInfo } from "../../../MoleAPIService";
import { TunnelName } from "../../../Cache";
import { Events } from "../../../Bridge";
import { MoleChannels, Tunnel } from "../../../DataInterface";
import { Tunnels } from "../../CommonUtils/Tunnels";
import { getParameters } from "../../../Common/Util/Router";

interface State {
    app: QuickHelp,
    channelSelected: boolean,
    hasSubmissions: boolean,
    fromPDBID: boolean,
    hasChannels: boolean,
    failure: string | null // why the current submission failed
};

export class QuickHelp extends React.Component<{}, State> {

    state: State = {
        app: this,
        channelSelected: false,
        hasSubmissions: false,
        fromPDBID: false,
        hasChannels: false,
        failure: null
    };

    private compInfo: CompInfo | null = null;
    private currentSubmitId: number | null = null;

    // Shows why the current submission failed: from CompInfo, or from the status of a job still running
    private checkCurrentSubmission() {
        const submitId = this.currentSubmitId;
        const submission = this.compInfo?.Submissions.find(s => s.SubmitId === submitId);
        if (this.compInfo === null || submitId === null || submission === undefined) {
            return;
        }
        if (submission.Status === "Error") {
            this.setState({ failure: submission.ErrorMsg });
        }
        else if (submission.Status === "Running" || submission.Status === "Initializing") {
            JobStatus.Watcher.registerOnChangeHandler(this.compInfo.ComputationId, submitId, (status) => {
                if (status.Status === "Error" && this.currentSubmitId === submitId) {
                    this.setState({ failure: status.ErrorMsg });
                }
            }, () => { });
        }
    }

    componentDidMount() {
        let channelSelected = SelectionHelper.isSelectedAnyChannel();
        if (channelSelected !== this.state.channelSelected) {
            this.setState({ channelSelected });
        }
        // Each handler updates only its own keys, so that updates in the same tick do not overwrite each other
        SelectionHelper.attachOnChannelDeselectHandler(() => {
            this.setState({ channelSelected: false });
        });
        SelectionHelper.attachOnChannelSelectHandler((data) => {
            this.setState({ channelSelected: true });
        });

        let params = getParameters();
        if (params !== null) {
            this.currentSubmitId = params.isChannelsDB ? null : params.submitId;
            Events.subscribeChangeSubmitId((submitId) => {
                this.currentSubmitId = submitId;
                this.setState({ failure: null });
                this.checkCurrentSubmission();
            });
            ComputationInfo.DataProvider.subscribe(params.computationId, (compid, info) => {
                this.compInfo = info;
                this.setState({
                    fromPDBID: !(info.PdbId === null || info.PdbId === void 0 || info.PdbId === ''),
                    hasSubmissions: info.Submissions.length > 0,
                    hasChannels: TunnelName.getCachedItemsCount() > 0,
                });
                this.checkCurrentSubmission();
            });
            Events.subscribeChannelDataLoaded((data) => {
                let channelsData = (data.Channels as MoleChannels);
                let tunnels: Tunnel[] = [];
                
                tunnels = Tunnels.concatTunnelsSafe(tunnels, channelsData.MergedPores);
                tunnels = Tunnels.concatTunnelsSafe(tunnels, channelsData.Paths);
                tunnels = Tunnels.concatTunnelsSafe(tunnels, channelsData.Pores);
                tunnels = Tunnels.concatTunnelsSafe(tunnels, channelsData.Tunnels);

                this.setState({ hasChannels: tunnels.length > 0 });
            })
        }
    }

    componentWillUnmount() {
    }

    render() {
        let hints: JSX.Element[] = [];

        if (!this.state.hasSubmissions) { //has no submissions
            hints.push(<div key={'start'}>
                <b>How to start? Try this:</b>
                <ul>
                    <li>For automatic start just press Submit button</li>
                    <li>
                        Or select specific <b>Start or End points</b>
                        <ul>
                            <li>by <b>XYZ</b> coordinate or <b>residue</b> selection in 3D or from sequence,</li>
                            <li>or try to use the Catalytic Active Sites from <b>CSA</b> or <b>cofactors</b> (Panel <b>Selection</b>),</li>
                            <li>or use facet selection on <b>Surface</b> in 3D viewer using Ctrl+left mouse click,</li>
                            <li>Or in the structure from precomputed <b>Origin</b> points,</li>
                        </ul>
                        and press Submit button.
                    </li>
                    <li>For transmembrane pores switch to <b>Pore mode</b></li>
                </ul>
                <b>To calculate transmembrane pore:</b>
                <ul>
                    <li>If you want only transmembrane part of pore - use <b>Membrane region</b> parameter</li>
                    <li>If structure is beta-sheet transmembrane porin - use <b>Beta structure</b> parameter</li>
                    <li>Press <b>Submit button</b></li>
                    <li>For channels and other types of pores switch to <b>Channel mode</b></li>
                </ul>
            </div>
            );
        }
        else { //has submissions
            if (this.state.failure !== null) { //the current submission failed; hasChannels counts other submissions too
                hints.push(<div key={'failure'}>
                    <b>The submission failed:</b>
                    <p>{this.state.failure}</p>
                </div>);
            } else if (this.state.hasChannels) { //has submissions and channels were computed
                hints.push(<div key={'channel-visibility'}>
                    <b>To see channel results:</b>
                    <ul>
                        <li>
                            You can:
                            <ul>
                                <li>
                                    Pick one of available channels either in <b>list of channels</b> or <b>in 3D view</b> window
                                    to see <b>Channel profile</b> with mapped physicochemical properties and residues
                                    associated with tunnel <b>layers</b> or <b>lining residues</b> of selected tunnel.
                                </li>
                                <li>
                                    See summary of properties of all available channels upon switch to <b>Channels
                                        properties</b> tab in bottom-left part of screen.
                                </li>
                            </ul>
                        </li>
                        <li>
                            Try to compare your data with channels from <a target="_blank" href="https://channelsdb2.biodata.ceitec.cz/">ChannelsDB</a>
                            &nbsp;- click on <b>#ChDB</b> submission located on <b>Submission tab</b> in the bottom right side of the screen.
                        </li>
                    </ul>
                </div>);
            } else {  //has submissions and channels were not computed
                hints.push(<div key={'no-channels'}>
                    <b>No channels were computed – Tips:</b>
                    <ul>
                        <li>Switch on the box - <b>Ignore HETATMs</b> (discard all the heteroatom from the channel computation).</li>
                        <li>Set the <b>lower value of Interior Threshold</b> to work with channels with almost closed bottlenecks
                            (in Cavity parameters; e.g. from 1.5 to 0.7)</li>
                        <li>Set the <b>higher value of Probe Radius</b> to detect larger channels which are otherwise taken
                            as parts of the surface (in Cavity parameters; e.g. from 5 to 20)</li>
                        <li>
                            Change the starting and end points
                            <ul>
                                <li>try to use the <b>Active Sites from CSA</b> or <b>cofactors</b>(Panel Selection)</li>
                                <li>Or choose your own exact point by setting the exact values of <b>XYZ</b> coordinates</li>
                                <li>or choose end point on surface with Ctrl + left mouse click</li>
                            </ul>
                        </li>
                        <li>Press <b>Submit button</b></li>
                    </ul>
                </div>);
            }
        }
        hints.push(<div key={'information'}>
            For more information see <a target="blank" href="https://github.com/sb-ncbr/moleonline-web/wiki">documentation page</a>.
        </div>);
        return <div>
            <h3>Quick help</h3>
            {hints}
        </div>
    }
}  
