import React from "react";
import { SelectionHelper } from "../../CommonUtils/Selection";
import { ComputationInfo } from "../../../DataProxy";
import { TunnelName } from "../../../Cache";
import { Events } from "../../../Bridge";
import { MoleChannels, Tunnel } from "../../../DataInterface";
import { Tunnels } from "../../CommonUtils/Tunnels";
import { getParameters } from "../../../Common/Util/Router";

declare function $(p: any): any;

interface State {
    app: QuickHelp,
    channelSelected: boolean,
    hasSubmissions: boolean,
    fromPDBID: boolean,
    hasChannels: boolean
};

export class QuickHelp extends React.Component<{}, State> {

    state: State = {
        app: this,
        channelSelected: false,
        hasSubmissions: false,
        fromPDBID: false,
        hasChannels: false
    };

    componentDidMount() {
        let channelSelected = SelectionHelper.isSelectedAnyChannel();
        if (channelSelected !== this.state.channelSelected) {
            let s = this.state;
            s.channelSelected = channelSelected;
            this.setState(s);
        }
        SelectionHelper.attachOnChannelDeselectHandler(() => {
            let state = this.state;
            state.channelSelected = false;
            this.setState(state);
        });
        SelectionHelper.attachOnChannelSelectHandler((data) => {
            let state = this.state;
            state.channelSelected = true;
            this.setState(state);
        });

        let params = getParameters();
        if (params !== null) {
            ComputationInfo.DataProvider.subscribe(params.computationId, (compid, info) => {
                let s1 = this.state;

                if (info.PdbId === null || info.PdbId === void 0 || info.PdbId === "") {
                    s1.fromPDBID = false;
                }
                else {
                    s1.fromPDBID = true;
                }

                if (info.Submissions.length > 0) {
                    s1.hasSubmissions = true;
                }
                else {
                    s1.hasSubmissions = false;
                }

                if (TunnelName.getCachedItemsCount() > 0) {
                    s1.hasChannels = true;
                }
                else {
                    s1.hasChannels = false;
                }

                this.setState(s1);
            });
            Events.subscribeChannelDataLoaded((data) => {
                let channelsData = (data.Channels as MoleChannels);
                let tunnels: Tunnel[] = [];
                
                tunnels = Tunnels.concatTunnelsSafe(tunnels, channelsData.MergedPores);
                tunnels = Tunnels.concatTunnelsSafe(tunnels, channelsData.Paths);
                tunnels = Tunnels.concatTunnelsSafe(tunnels, channelsData.Pores);
                tunnels = Tunnels.concatTunnelsSafe(tunnels, channelsData.Tunnels);

                let s2 = this.state;
                s2.hasChannels = tunnels.length > 0;
                this.setState(s2);
            })
        }
    }

    componentWillUnmount() {
    }

    render() {
        let hints: JSX.Element[] = [];

        if (!this.state.hasSubmissions) { //has no submissions
            hints.push(<div>
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
            if (this.state.hasChannels) { //has submissions and channels were computed
                hints.push(<div>
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
                            Try to compare your data with channels from <a target="_blank" href="http://ncbr.muni.cz/ChannelsDB/">ChannelsDB</a>
                            &nbsp;- click on <b>#ChDB</b> submission located on <b>Submission tab</b> in the bottom right side of the screen.
                        </li>
                    </ul>
                </div>);
            } else {  //has submissions and channels were not computed
                hints.push(<div>
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
        hints.push(<div>
            For more information see <a target="blank" href="/documentation/">documentation page</a>.
        </div>);
        return <div>
            <h3>Quick help</h3>
            {hints}
        </div>
    }
}  
