namespace LayerProperties.UI{

    import React = LiteMol.Plugin.React

    import DGComponents = Datagrid.Components;

    let DGTABLE_COLS_COUNT = 2;
    let NO_DATA_MESSAGE = "Hover over channel(2D) for details...";

    declare function $(p:any): any;

    interface State{
        data: DataInterface.LayersInfo[] | null,
        app: App,
        layerIdx: number
    };

    export function render(target: Element, plugin: LiteMol.Plugin.Controller) {
        LiteMol.Plugin.ReactDOM.render(<App controller={plugin} />, target);
    }

    export class App extends React.Component<{controller: LiteMol.Plugin.Controller }, State> {

        state:State = {
            data: null,
            app: this,
            layerIdx: -1
        };

        componentDidMount() {
            CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(()=>{
                let state = this.state;
                state.layerIdx = -1;
                state.data = null;
                this.setState(state);
            });
            CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler((data)=>{
                let state = this.state;
                state.layerIdx = -1;
                state.data = data.LayersInfo;
                this.setState(state);
            });
            
            MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(()=>{
                let state = this.state;
                state.layerIdx = -1;
                state.data = null;
                this.setState(state);
            });

            $( window ).on('layerTriggered', this.layerTriggerHandler.bind(this));
        }

        private layerTriggerHandler(event:any,layerIdx:number){
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
            let minRadius = this.props.data[this.props.layerIdx].LayerGeometry.MinRadius;

            rows.push(
                    <DGComponents.DGElementRow columns={[<span><span className="glyphicon glyphicon-tint properties-icon" />{"Hydropathy"}</span>,<span>{CommonUtils.Numbers.roundToDecimal(layerData.Hydropathy,2).toString()}</span>]} />
                );
            rows.push(
                    <DGComponents.DGElementRow columns={[<span><span className="glyphicon glyphicon-plus properties-icon" />{"Polarity"}</span>,<span>{CommonUtils.Numbers.roundToDecimal(layerData.Polarity,2).toString()}</span>]} />
                );
            rows.push(
                    <DGComponents.DGElementRow columns={[<span><span className="glyphicon glyphicon-tint properties-icon upside-down" />{"Hydrophobicity"}</span>,<span>{CommonUtils.Numbers.roundToDecimal(layerData.Hydrophobicity,2).toString()}</span>]} />
                );
            rows.push(
                    <DGComponents.DGElementRow columns={[<span><span className="glyphicon glyphicon-scissors properties-icon" />{"Mutability"}</span>,<span>{CommonUtils.Numbers.roundToDecimal(layerData.Mutability,2).toString()}</span>]} />
                );
            rows.push(
                    <DGComponents.DGElementRow columns={[<span><span className="glyphicon glyphicon-flash properties-icon" />{"Charge"}</span>,<span>{charge}</span>]} />
            );
            rows.push(
                    <DGComponents.DGElementRow columns={[<span><span className="icon bottleneck black properties-icon" />{"Radius"}</span>,<span>{CommonUtils.Numbers.roundToDecimal(minRadius,1)}</span>]} />
            );
            rows.push(
                <DGComponents.DGElementRow columns={[<span><span className="icon logp black properties-icon" />{"LogP"}</span>,<span>{(layerData.LogP!==null&&layerData.LogP!==void 0)?CommonUtils.Numbers.roundToDecimal(layerData.LogP,2):'N/A'}</span>]} />
            );
            rows.push(
                <DGComponents.DGElementRow columns={[<span><span className="icon logd black properties-icon" />{"LogD"}</span>,<span>{(layerData.LogD!==null&&layerData.LogD!==void 0)?CommonUtils.Numbers.roundToDecimal(layerData.LogD,2):'N/A'}</span>]} />
            );
            rows.push(
                <DGComponents.DGElementRow columns={[<span><span className="icon logs black properties-icon" />{"LogS"}</span>,<span>{(layerData.LogS!==null&&layerData.LogS!==void 0)?CommonUtils.Numbers.roundToDecimal(layerData.LogS,2):'N/A'}</span>]} />
            );
            rows.push(
                <DGComponents.DGElementRow columns={[<span><span className="icon ionizable black properties-icon" />{"Ionizable"}</span>,<span>{(layerData.Ionizable!==null&&layerData.Ionizable!==void 0)?CommonUtils.Numbers.roundToDecimal(layerData.Ionizable,2):'N/A'}</span>]} />
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