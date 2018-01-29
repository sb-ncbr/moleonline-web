namespace AglomeredParameters.UI{

    import React = LiteMol.Plugin.React
    import LiteMoleEvent = LiteMol.Bootstrap.Event;

    import DGComponents = Datagrid.Components;
    import Tooltips = MoleOnlineWebUI.StaticData.TooltipText;
    
    let DGTABLE_COLS_COUNT = 11;

    declare function $(p:any): any;
    declare function datagridOnResize(str:string):any;

    interface State{
        data: DataInterface.Tunnel[] | null,
        app: App,
        isWaitingForData: boolean
    };

    export function render(target: Element, plugin: LiteMol.Plugin.Controller) {
        LiteMol.Plugin.ReactDOM.render(<App controller={plugin} />, target);
    }

    interface Props{controller: LiteMol.Plugin.Controller}
    export class App extends React.Component<Props, State> {

        private interactionEventStream: LiteMol.Bootstrap.Rx.IDisposable | undefined = void 0;

        state:State = {
            data: null,
            app: this,
            isWaitingForData: false
        };

        componentDidMount() {
            MoleOnlineWebUI.Bridge.Events.subscribeChannelDataLoaded((data)=>{
                let toShow:DataInterface.Tunnel[] = [];
                /*let data = e.data.props.data as DataInterface.MoleOnlineData;*/
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
            /*
            LiteMoleEvent.Tree.NodeAdded.getStream(this.props.controller.context).subscribe(e => {
                if(e.data.tree !== void 0 && e.data.ref === "mole-data"){
                    let toShow:DataInterface.Tunnel[] = [];
                    let data = e.data.props.data as DataInterface.MoleOnlineData;
                    toShow = toShow.concat(data.Channels.Tunnels);
                    toShow = toShow.concat(data.Channels.Paths);
                    toShow = toShow.concat(data.Channels.Pores);
                    toShow = toShow.concat(data.Channels.MergedPores);
                    let state = this.state;
                    state.data = toShow;
                    this.setState(state);
                    $( window ).trigger("contentResize");
                }
            });*/
            LiteMoleEvent.Tree.NodeRemoved.getStream(this.props.controller.context).subscribe(e => {
                if(e.data.tree !== void 0 && e.data.ref === "mole-data"){
                    let state = this.state;
                    state.data = null;
                    this.setState(state);
                }
            });
            this.forceUpdate();
        }
/*
        private dataWaitHandler(){
            this.setState({isWaitingForData:false});
        }

        public invokeDataWait(){
            if(this.state.isWaitingForData){
                return;
            }

            this.setState({isWaitingForData: true});
            Annotation.AnnotationDataProvider.subscribeForData(this.dataWaitHandler.bind(this));
        }
*/
        componentWillUnmount(){
        }

        componentDidUpdate(prevProps:Props, prevState:State){
            $('.init-agp-tooltip').tooltip({container:'body'});
        }

        render() {
            return(
                <div>
                    <DGTable {...this.state} />
                </div>
                );
        }
    }  

    class DGTable extends React.Component<State,{}>{
        render(){
            return (<div className="datagrid" id="dg-aglomered-parameters">
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
                        <th title={Tooltips.get("Name")} className="col col-1 ATable-header-identifier init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                            Name
                        </th>
                        <th title={Tooltips.get("Length")} className="col col-2 ATable-header-length init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                            <span className="glyphicon glyphicon-resize-horizontal" /> <span className="ATable-label">Length</span>
                        </th>
                        <th title={Tooltips.get("Bottleneck")} className="col col-3 ATable-header-bottleneck init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                            <span className="icon bottleneck" /> <span className="ATable-label">Bottleneck</span>
                        </th>
                        <th title={Tooltips.get("agl-Hydropathy")} className="col col-4 ATable-header-hydropathy init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                            <span className="glyphicon glyphicon-tint" /> <span className="ATable-label">Hydropathy</span>
                        </th>
                        <th title={Tooltips.get("agl-Charge")} className="col col-5 ATable-header-charge init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                            <span className="glyphicon glyphicon-flash" /> <span className="ATable-label">Charge</span>
                        </th>
                        <th title={Tooltips.get("agl-Polarity")} className="col col-6 ATable-header-polarity init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                            <span className="glyphicon glyphicon-plus" /> <span className="ATable-label">Polarity</span>
                        </th>
                        <th title={Tooltips.get("agl-Mutability")} className="col col-7 ATable-header-mutability init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                            <span className="glyphicon glyphicon-scissors" /> <span className="ATable-label">Mutability</span>
                        </th>  
                        <th title={Tooltips.get("agl-LogP")} className="col col-8 ATable-header-logp init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                            <span className="icon logp" /> <span className="ATable-label">LogP</span>
                        </th>    
                        <th title={Tooltips.get("agl-LogD")} className="col col-9 ATable-header-logd init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                            <span className="icon logd" /> <span className="ATable-label">LogD</span>
                        </th>                    
                        <th title={Tooltips.get("agl-LogS")} className="col col-10 ATable-header-logs init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                            <span className="icon logs" /> <span className="ATable-label">LogS</span>
                        </th>   
                        <th title={Tooltips.get("agl-Ionizable")} className="col col-11 ATable-header-ionizable init-agp-tooltip" data-toggle="tooltip" data-placement="bottom">
                            <span className="icon ionizable" /> <span className="ATable-label">Ionizable</span>
                        </th>   
                    </tr>
                </table>
            );
        };
    }

    class DGBody extends React.Component<State,{}>{
        
        private generateRows(){
            let rows = [];
            if(this.props.data === null||this.props.data.length===0){
                rows.push(
                    <tr><td colSpan={DGTABLE_COLS_COUNT} >There are no data to be displayed...</td></tr>
                );
            }

            if(this.props.data!==null){
                for(let tunnel of this.props.data){
                    rows.push(
                        <DGRow tunnel={tunnel} app={this.props.app}/>
                    );
                }
            }

            rows.push(<DGComponents.DGRowEmpty columnsCount={DGTABLE_COLS_COUNT}/>);

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
		
    class DGRow extends React.Component<{tunnel: DataInterface.Tunnel, app: App},{}>{
        
        render(){
            let name = MoleOnlineWebUI.Cache.TunnelName.get(this.props.tunnel.GUID);
            let namePart = (name===void 0)?'X':` (${name})`;
            let tunnelID = this.props.tunnel.Type+namePart;

            if(Common.Util.Router.isInChannelsDBMode()){
                let annotations = MoleOnlineWebUI.Cache.ChannelsDBData.getChannelAnnotationsImmediate(this.props.tunnel.Id);
                if(annotations!==null&&annotations.length>0){
                    tunnelID = annotations[0].name;
                }
                else{
                    tunnelID = this.props.tunnel.Type;
                }
            }

            return (
                    <tr>
                        <td className="col col-1">
                            {tunnelID}
                        </td>
                        <td className="col col-2">
                            {CommonUtils.Tunnels.getLength(this.props.tunnel)} Å
                        </td>
                        <td className="col col-3">
                            {CommonUtils.Tunnels.getBottleneck(this.props.tunnel)} Å
                        </td>
                        <td className="col col-4">
                            {CommonUtils.Numbers.roundToDecimal(this.props.tunnel.Properties.Hydropathy,2)}
                        </td>
                        <td className="col col-5">
                            {CommonUtils.Numbers.roundToDecimal(this.props.tunnel.Properties.Charge,2)}
                        </td>
                        <td className="col col-6">
                            {CommonUtils.Numbers.roundToDecimal(this.props.tunnel.Properties.Polarity,2)}
                        </td>
                        <td className="col col-7">
                            {CommonUtils.Numbers.roundToDecimal(this.props.tunnel.Properties.Mutability,2)}
                        </td>        
                        <td className="col col-8">
                            {(this.props.tunnel.Properties.LogP)?CommonUtils.Numbers.roundToDecimal(this.props.tunnel.Properties.LogP,2):'N/A'}
                        </td>               
                        <td className="col col-9">
                            {(this.props.tunnel.Properties.LogD)?CommonUtils.Numbers.roundToDecimal(this.props.tunnel.Properties.LogD,2):'N/A'}
                        </td>               
                        <td className="col col-10">
                            {(this.props.tunnel.Properties.LogS)?CommonUtils.Numbers.roundToDecimal(this.props.tunnel.Properties.LogS,2):'N/A'}
                        </td>               
                        <td className="col col-11">
                            {(this.props.tunnel.Properties.Ionizable)?CommonUtils.Numbers.roundToDecimal(this.props.tunnel.Properties.Ionizable,2):'N/A'}
                        </td>               
                    </tr>);
        }
    }

}