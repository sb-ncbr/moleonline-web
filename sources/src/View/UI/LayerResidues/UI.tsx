namespace LayerResidues.UI{

    import DGComponents = Datagrid.Components;
    import React = LiteMol.Plugin.React
    import LiteMoleEvent = LiteMol.Bootstrap.Event;
    import TunnelUtils = CommonUtils.Tunnels;
    
    let DGTABLE_COLS_COUNT = 1;
    let NO_DATA_MESSAGE = "Hover over channel(2D) for details...";

    declare function $(p:any): any;
    declare function datagridOnResize(str:string,str1:string,str2:string):any;

    interface State{
        data: DataInterface.LayersInfo[] | null,
        app: App,
        layerIdx: number,
        /*isWaitingForData: boolean*/
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
            app: this,
            layerIdx: -1,
            /*isWaitingForData: false*/
        };

        layerIdx = -1;

        componentDidMount() {
            CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(()=>{
                let state = this.state;
                state.layerIdx = -1;
                state.data = null;
                this.setState(state);
            });
            CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler((data)=>{
                let state = this.state;
                state.data = data.LayersInfo;
                this.setState(state);
            });
            
            $( window ).on('layerTriggered', this.layerTriggerHandler.bind(this));
        }

        private layerTriggerHandler(event:any,layerIdx:number){

            this.layerIdx = layerIdx;
            
            let state = this.state;
            state.layerIdx = layerIdx;
            this.setState(state);

            setTimeout(function(){
                $( window ).trigger('contentResize');
            },1);
        }

        componentWillUnmount(){
        }

        render() {
            if (this.state.data !== null && this.state.layerIdx>=0) {
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
            return (<div className="datagrid" id="dg-layer-residues">
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
            return (<div className="datagrid" id="dg-layer-residues">
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
                        <th title="Residue" className="col col-1">
                            Residue
                        </th>                           
                    </tr>
                </table>
            );
        };
    }

    class DGBody extends React.Component<State,{}>{ 

        private shortenBackbone(residue:string){
            return residue.replace(/Backbone/g,'BB');
        }

        private isBackbone(residue:string){
            return residue.indexOf("Backbone") >= 0;
        }
        
        private generateRows(){
            if(this.props.data === null){
                return <DGComponents.DGNoDataInfoRow columnsCount={DGTABLE_COLS_COUNT} infoText={NO_DATA_MESSAGE}/>;
            }

            let layerData = CommonUtils.Residues.sort(this.props.data[this.props.layerIdx].Residues,void 0, true, true);
            let rows:JSX.Element[] = [];
            
            for(let residue of layerData){
                let residueId = residue.split(" ").slice(1,3).join(" ");
                let residueNameEl = (this.isBackbone(residue))?<span>{residue}</span>:<strong>{residue}</strong>;
                rows.push(
                        <DGComponents.DGElementRow columns={[residueNameEl]} title={[(this.isBackbone(residue)?residue:""),""]} trClass={(this.isBackbone(residue)?"help":"")} />
                    );
            }            
            rows.push(<DGComponents.DGRowEmpty columnsCount={DGTABLE_COLS_COUNT} />);

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