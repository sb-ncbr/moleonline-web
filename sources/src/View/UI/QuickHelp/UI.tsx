namespace QuickHelp.UI{

    import React = LiteMol.Plugin.React
    import LiteMoleEvent = LiteMol.Bootstrap.Event;

    declare function $(p:any): any;

    interface State{
        app: App,
        channelSelected: boolean,
        hasSubmissions: boolean,
        fromPDBID: boolean
    };

    export function render(target: Element) {
        LiteMol.Plugin.ReactDOM.render(<App />, target);
    }

    export class App extends React.Component<{}, State> {

        state:State = {
            app: this,
            channelSelected: false,
            hasSubmissions: false,
            fromPDBID: false
        };

        componentDidMount() {
            let channelSelected = CommonUtils.Selection.SelectionHelper.isSelectedAnyChannel();
            if(channelSelected!==this.state.channelSelected){
                let s = this.state;
                s.channelSelected=channelSelected;
                this.setState(s);
            }
            CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(()=>{
                let state = this.state;
                state.channelSelected = false;
                this.setState(state);
            });
            CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler((data)=>{
                let state = this.state;
                state.channelSelected = true;
                this.setState(state);
            });
            
            let params = CommonUtils.Router.getParameters();
            if(params!==null){
                MoleOnlineWebUI.DataProxy.ComputationInfo.DataProvider.subscribe(params.computationId,(compid,info)=>{
                    let s1 = this.state;
                    if(info.PdbId===null||info.PdbId===void 0||info.PdbId===""){
                        s1.fromPDBID = false;
                    }
                    else{
                        s1.fromPDBID = true;
                    }
                    if(info.Submissions.length>0){
                        s1.hasSubmissions = true;
                    }
                    else{
                        s1.hasSubmissions = false;
                    }
                    this.setState(s1);
                });
            }
        }

        componentWillUnmount(){
        }

        render() {
            let hints:JSX.Element[] = [];

            if(this.state.fromPDBID){
                hints.push(<li>
                    To visualize data from <a href="https://webchemdev.ncbr.muni.cz/ChannelsDB/">ChannelsDB</a>, click on <b>#ChannelsDB</b> submission located on <b>Submission tab</b> in the right side of the screen.
                    </li>);
            }

            if(!this.state.hasSubmissions){
                hints.push(<li>
                    To start your own calculation job(submission) fill in submission form located in the Submission settings tab at the right side of the screen. <b>For&nbsp;automatic starting points</b> skip filling the form and click on submit. Or you can choose starting points from available options: 
                    <ul>
                        <li>Active sites from CSA</li>
                        <li>Cofactor starting points</li>
                        <li>By picking some residues from 3D view/protein sequence</li>
                        <li>By picking from available starting points(Origins section in top-right part of the screen and then by clicking in 3D view on available points represented by balls)</li>
                        <li>By cavities - Cavities section in the top-right part of the screen, select one or more cavities and then while holding CTRL key left click on highlighted parts of cavities in 3D view</li>
                    </ul>
                    Selected points or residues can be used in submission form by <b>Use current selection</b> buttons.
                </li>);
            }
            else{
                if(!this.state.channelSelected){
                    hints.push(<li>
                        You can:
                        <ul> 
                            <li>Pick one of available channels to view its properties mapped on 2D representation of tunnel(bottom-left part of screen), properties and residues asociated with tunnel layers or lining residues of selected tunnel.</li>
                            <li>See summary of properties of all available channels switch to <b>Channels properties</b> tab in bottom-left part of screen.</li>
                            <li>Or start new submission.</li>
                        </ul>
                    </li>);
                }
                else{
                    hints.push(<li>
                        You can: 
                        <ul>
                            <li>View properties of selected channel mapped on 2D representation of tunnel(bottom-left part of screen), properties and residues asociated with tunnel layers or lining residues of selected tunnel.</li>
                            <li>Select another channel</li>
                            <li>Or start new submission</li>
                        </ul>
                    </li>);
                }
            }
            hints.push(<li>
                For more information see <a href="/documentation/">documentation page</a>.
            </li>);
            return <div>
                <h3>Quick help</h3>
                <ul>{hints}</ul>
            </div>
        }
    }  
}