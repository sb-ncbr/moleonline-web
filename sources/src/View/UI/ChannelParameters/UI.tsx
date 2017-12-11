namespace ChannelParameters.UI{

    import DGComponents = Datagrid.Components;
    import React = LiteMol.Plugin.React
    import LiteMoleEvent = LiteMol.Bootstrap.Event;
    import TunnelUtils = CommonUtils.Tunnels;
    
    let DGTABLE_COLS_COUNT = 2;
    let NO_DATA_MESSAGE = "Select channel in 3D view for details...";

    declare function $(p:any): any;
    declare function datagridOnResize(str:string,str1:string,str2:string):any;

    interface State{
        data: DataInterface.Tunnel[] | null,
        currentTunnel:string|null,
        app: App
    };

    interface ChannelEventInfo { 
        kind: LiteMol.Bootstrap.Interactivity.Info.__Kind.Selection | LiteMol.Bootstrap.Interactivity.Info.__Kind.Empty,
        source : {
            props: {
                tag: {
                    element: DataInterface.Tunnel,
                    type: String
                }
            },
            ref: string
        }
        
    };

    export function render(target: Element, plugin: LiteMol.Plugin.Controller) {
        LiteMol.Plugin.ReactDOM.render(<App controller={plugin} />, target);
    }

    export class App extends React.Component<{controller: LiteMol.Plugin.Controller }, State> {

        private interactionEventStream: LiteMol.Bootstrap.Rx.IDisposable | undefined = void 0;

        state:State = {
            data: null,
            currentTunnel:null,
            app: this,
        };

        layerIdx = -1;

        componentDidMount() {
            MoleOnlineWebUI.Bridge.Events.subscribeChannelDataLoaded((data)=>{
                let toShow:DataInterface.Tunnel[] = [];

                let channelsDbTunnels = data.Channels as DataInterface.ChannelsDBChannels;
                let moleTunnels = data.Channels as DataInterface.MoleChannels;

                toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow,moleTunnels.Tunnels);
                toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow,moleTunnels.Paths);
                toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow,moleTunnels.Pores);
                toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow,moleTunnels.MergedPores);

                toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow,channelsDbTunnels.ReviewedChannels);
                toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow,channelsDbTunnels.CSATunnels);                
                toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow,channelsDbTunnels.TransmembranePores);
                toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow,channelsDbTunnels.CofactorTunnels);

                let state = this.state;
                state.data = toShow;
                this.setState(state);
                $( window ).trigger("contentResize");
            });
            CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler((data,channelId)=>{
                if(channelId===void 0){
                    return;
                }
                let state = this.state;
                state.currentTunnel = channelId;
                this.setState(state);
                setTimeout(function(){
                    $( window ).trigger('contentResize');
                },1);
            });

            CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(()=>{
                let state = this.state;
                state.currentTunnel = null;
                this.setState(state);
            });

            MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(()=>{
                let state = this.state;
                state.currentTunnel = null;
                this.setState(state);
            });
        }

        componentWillUnmount(){
        }

        render() {
            if (this.state.data !== null&&this.state.currentTunnel!==null) {
                return(
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

    class DGNoData extends React.Component<State,{}>{
        render(){
            return (<div className="datagrid" id="dg-channel-parameters">
						<div className="header">
							<DGHead {...this.props}/>			
						</div>
						<div className="body">
                            <table>
                                <DGComponents.DGNoDataInfoRow columnsCount={DGTABLE_COLS_COUNT} infoText={NO_DATA_MESSAGE}/>
                                <DGComponents.DGRowEmpty columnsCount={DGTABLE_COLS_COUNT}/>
                            </table>
						</div>
					</div>);
        }
    }

    class DGTable extends React.Component<State,{}>{
        render(){
            return (<div className="datagrid" id="dg-channel-parameters">
						<div className="header">
							<DGHead {...this.props}/>			
						</div>
						<div className="body">
                            <DGBody {...this.props} />
						</div>
					</div>);
        }
    }

    class DGHead extends React.Component<State,{}>{
        render(){
            return(
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

    class DGBody extends React.Component<State,{}>{ 

        private generateRows(){
            let columnsCount = DGTABLE_COLS_COUNT;
            if(this.props.data === null){
                return <DGComponents.DGNoDataInfoRow columnsCount={DGTABLE_COLS_COUNT} infoText={NO_DATA_MESSAGE}/>;
            }

            let rows:JSX.Element[] = [];  

            let data = this.props.data;
            
            for(let t of data){
                if(t.Id===this.props.currentTunnel){
                    let length = [
                        <span><span className="glyphicon glyphicon-resize-horizontal properties-icon" />{"Length"}</span>,
                        <span>{CommonUtils.Numbers.roundToDecimal(CommonUtils.Tunnels.getLength(t),2).toString()}</span>
                    ];
                    let bottleneck = [
                        <span><span className="icon bottleneck black properties-icon" />{"Bottleneck"}</span>,
                        <span>{CommonUtils.Tunnels.getBottleneck(t)}</span>
                    ];
                    let hydropathy = [
                        <span><span className="glyphicon glyphicon-tint properties-icon" />{"Hydropathy"}</span>,
                        <span>{CommonUtils.Numbers.roundToDecimal(t.Properties.Hydropathy,2).toString()}</span>
                    ];
                    let charge = [
                        <span><span className="glyphicon glyphicon-flash properties-icon" />{"Charge"}</span>,
                        <span>{CommonUtils.Numbers.roundToDecimal(t.Properties.Charge,2).toString()}</span>
                    ];
                    let polarity = [
                        <span><span className="glyphicon glyphicon-plus properties-icon" />{"Polarity"}</span>,
                        <span>{CommonUtils.Numbers.roundToDecimal(t.Properties.Polarity,2).toString()}</span>
                    ];
                    let mutability = [
                        <span><span className="glyphicon glyphicon-scissors properties-icon" />{"Mutability"}</span>,
                        <span>{CommonUtils.Numbers.roundToDecimal(t.Properties.Mutability,2).toString()}</span>
                    ];
                    //Length
                    rows.push(
                        <DGComponents.DGElementRow columnsCount={columnsCount} columns={length} />
                    )
                    //Bottleneck
                    rows.push(
                        <DGComponents.DGElementRow columnsCount={columnsCount} columns={bottleneck} />
                    )
                    //Hydropathy
                    rows.push(
                        <DGComponents.DGElementRow columnsCount={columnsCount} columns={hydropathy} />
                    )
                    //Charge
                    rows.push(
                        <DGComponents.DGElementRow columnsCount={columnsCount} columns={charge} />
                    )
                    //Polarity
                    rows.push(
                        <DGComponents.DGElementRow columnsCount={columnsCount} columns={polarity} />
                    )
                    //Mutability
                    rows.push(
                        <DGComponents.DGElementRow columnsCount={columnsCount} columns={mutability} />
                    )
                }
            }
            
            rows.push(<DGComponents.DGRowEmpty columnsCount={columnsCount} />);

            return rows;
        }

        render(){
            let rows = this.generateRows();
            
            return(
                <table>
                    {rows}
                </table>
            );
        };
    }    

}