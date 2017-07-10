namespace LayerProperties.UI{

    import React = LiteMol.Plugin.React
    import LiteMoleEvent = LiteMol.Bootstrap.Event;

    import DGComponents = Datagrid.Components;

    let DGTABLE_COLS_COUNT = 2;
    let NO_DATA_MESSAGE = "Hover over channel(2D) for details...";

    declare function $(p:any): any;
    declare function datagridOnResize(str:string):any;

    interface State{
        data: DataInterface.LayersInfo[] | null,
        app: App,
        layerIdx: number
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

        state = {
            data: null,
            app: this,
            layerIdx: -1
        };

        layerIdx = -1;

        componentDidMount() {
            var interactionHandler = function showInteraction(type: string, i: ChannelEventInfo | undefined, app: App) {
                if (!i || i.source == null || i.source.props.tag === void 0 || i.source.props.tag.type === void 0) {
                    return;    
                }

                if(i.source.props.tag.type == "Tunnel" 
                    || i.source.props.tag.type == "Path"
                    || i.source.props.tag.type == "Pore"
                    || i.source.props.tag.type == "MergedPore"){
                    
                    let layers = i.source.props.tag.element.Layers;
                    app.setState({data:layers.LayersInfo});
                }
                
            }

            this.interactionEventStream = LiteMoleEvent.Visual.VisualSelectElement.getStream(this.props.controller.context)
                .subscribe(e => interactionHandler('select', e.data as ChannelEventInfo, this));

            $( window ).on('layerTriggered', this.layerTriggerHandler.bind(this));
        }

        private layerTriggerHandler(event:any,layerIdx:number){

            this.layerIdx = layerIdx;

            this.setState({layerIdx});
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
            return (<div className="datagrid" id="dg-layer-properties">
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
            return (<div className="datagrid" id="dg-layer-properties">
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
            if(this.props.data === null){
                return <DGComponents.DGNoDataInfoRow columnsCount={DGTABLE_COLS_COUNT} infoText={NO_DATA_MESSAGE}/>;
            }

            let layerData = this.props.data[this.props.layerIdx].Properties;
            let rows = [];
            
            let charge = `${CommonUtils.Numbers.roundToDecimal(layerData.Charge,2).toString()} (+${CommonUtils.Numbers.roundToDecimal(layerData.NumPositives,2).toString()}/-${CommonUtils.Numbers.roundToDecimal(layerData.NumNegatives,2).toString()})`;
            /*
            rows.push(
                    <DGRow columns={["Charged(+)",CommonUtils.Numbers.roundToDecimal(layerData.NumPositives,2).toString()]} />
                );
            rows.push(
                    <DGRow columns={["Charged(-)",CommonUtils.Numbers.roundToDecimal(layerData.NumNegatives,2).toString()]} />
                );
                */
            rows.push(
                    <DGComponents.DGElementRow columns={[<span><span className="glyphicon glyphicon-tint properties-icon" />{"Hydropathy"}</span>,<span>{CommonUtils.Numbers.roundToDecimal(layerData.Hydropathy,2).toString()}</span>]} />
                );
            rows.push(
                    <DGComponents.DGElementRow columns={[<span><span className="glyphicon glyphicon-plus properties-icon" />{"Polarity"}</span>,<span>{CommonUtils.Numbers.roundToDecimal(layerData.Polarity,2).toString()}</span>]} />
                    /*<DGRow columns={["Polarity",CommonUtils.Numbers.roundToDecimal(layerData.Polarity,2).toString()]} />*/
                );
            rows.push(
                    <DGComponents.DGElementRow columns={[<span><span className="glyphicon glyphicon-tint properties-icon upside-down" />{"Hydrophobicity"}</span>,<span>{CommonUtils.Numbers.roundToDecimal(layerData.Hydrophobicity,2).toString()}</span>]} />
                    /*<DGRow columns={["Hydrophobicity",CommonUtils.Numbers.roundToDecimal(layerData.Hydrophobicity,2).toString()]} />*/
                );
            rows.push(
                    <DGComponents.DGElementRow columns={[<span><span className="glyphicon glyphicon-scissors properties-icon" />{"Mutability"}</span>,<span>{CommonUtils.Numbers.roundToDecimal(layerData.Mutability,2).toString()}</span>]} />
                    /*<DGRow columns={["Mutability",CommonUtils.Numbers.roundToDecimal(layerData.Mutability,2).toString()]} />*/
                );
            rows.push(
                    <DGComponents.DGElementRow columns={[<span><span className="glyphicon glyphicon-flash properties-icon" />{"Charge"}</span>,<span>{charge}</span>]} />
                    /*<DGRow columns={["Charge",/*CommonUtils.Numbers.roundToDecimal(layerData.Charge,2).toString()*//*charge]} />*/
            );
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
		
    class DGRow extends React.Component<{columns: string[]},{}>{
        
        private generateRow(columns: string[]){
            let tds = [];
            for(let i=0;i<columns.length;i++){
                tds.push(
                    <td className={`col col-${i+1}`}>
                        {columns[i]}
                    </td>    
                );
            }

            return tds;
        }

        render(){
            return (
                    <tr>
                        {this.generateRow(this.props.columns)}                     
                    </tr>);
        }
    }

}