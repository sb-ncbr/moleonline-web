namespace AglomeredParameters.UI{

    import React = LiteMol.Plugin.React
    import LiteMoleEvent = LiteMol.Bootstrap.Event;

    import DGComponents = Datagrid.Components;
    
    let DGTABLE_COLS_COUNT = 7;

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

    export class App extends React.Component<{controller: LiteMol.Plugin.Controller }, State> {

        private interactionEventStream: LiteMol.Bootstrap.Rx.IDisposable | undefined = void 0;

        state = {
            data: null,
            app: this,
            isWaitingForData: false
        };

        componentDidMount() {
            LiteMoleEvent.Tree.NodeAdded.getStream(this.props.controller.context).subscribe(e => {
                if(e.data.tree !== void 0 && e.data.ref === "mole-data"){
                    let toShow:DataInterface.Tunnel[] = [];
                    let data = e.data.props.data as DataInterface.ChannelsDBData;
                    toShow = toShow.concat(data.Channels.ReviewedChannels);
                    toShow = toShow.concat(data.Channels.CSATunnels);
                    toShow = toShow.concat(data.Channels.TransmembranePores);
                    this.setState({
                        data: toShow
                    });
                }
            });
        }

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

        componentWillUnmount(){
        }

        render() {
            if (this.state.data !== null) {
                return(
                    <div>
                        <DGTable {...this.state} />
                    </div>
                    );
            } 
            
            return <div/>
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
                        <th title="Identifier" className="col col-1 ATable-header-identifier">
                            Name
                        </th>
                        <th title="Length" className="col col-2 ATable-header-length">
                            <span className="glyphicon glyphicon-resize-horizontal" /> <span className="ATable-label">Length</span>
                        </th>
                        <th title="Bottleneck" className="col col-3 ATable-header-bottleneck">
                            <span className="icon bottleneck" /> <span className="ATable-label">Bottleneck</span>
                        </th>
                        <th title="Hydropathy" className="col col-4 ATable-header-hydropathy">
                            <span className="glyphicon glyphicon-tint" /> <span className="ATable-label">Hydropathy</span>
                        </th>
                        <th title="Charge" className="col col-5 ATable-header-charge">
                            <span className="glyphicon glyphicon-flash" /> <span className="ATable-label">Charge</span>
                        </th>
                        <th title="Polarity" className="col col-6 ATable-header-polarity">
                            <span className="glyphicon glyphicon-plus" /> <span className="ATable-label">Polarity</span>
                        </th>
                        <th title="Mutability" className="col col-7 ATable-header-mutability">
                            <span className="glyphicon glyphicon-scissors" /> <span className="ATable-label">Mutability</span>
                        </th>                     
                    </tr>
                </table>
            );
        };
    }

    class DGBody extends React.Component<State,{}>{
        
        private generateMockData(){
            if(this.props.data === null){
                return <tr><td colSpan={DGTABLE_COLS_COUNT} >There are no data to be displayed...</td></tr>;
            }

            let rows = [];

            for(let tunnel of this.props.data){
                rows.push(
                    <DGRow tunnel={tunnel} app={this.props.app} />
                );
            }

            if(rows.length===0){
                return rows;
            }

            for(let i=rows.length;i<100;i++){
                rows.push(rows[0]);
            }            

            rows.push(<DGComponents.DGRowEmpty columnsCount={DGTABLE_COLS_COUNT}/>);

            return rows;
        }
        
        private generateRows(){
            if(this.props.data === null){
                return <tr><td colSpan={DGTABLE_COLS_COUNT} >There are no data to be displayed...</td></tr>;
            }

            let rows = [];

            for(let tunnel of this.props.data){
                rows.push(
                    <DGRow tunnel={tunnel} app={this.props.app}/>
                );
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
            let tunnelID = this.props.tunnel.Type;
            let annotation = Annotation.AnnotationDataProvider.getChannelAnnotation(this.props.tunnel.Id);
            if(annotation!== void 0 && annotation !== null){
                tunnelID = annotation.text;
            }

            if(annotation === void 0){
                this.props.app.invokeDataWait();
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
                    </tr>);
        }
    }

}