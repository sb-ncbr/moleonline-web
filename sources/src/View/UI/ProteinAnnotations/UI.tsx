namespace ProteinAnnotations.UI{

    import React = LiteMol.Plugin.React
    import LiteMoleEvent = LiteMol.Bootstrap.Event;
    import TunnelUtils = CommonUtils.Tunnels;
    
    import DGComponents = Datagrid.Components;

    let DGTABLE_COLS_COUNT = 3;

    declare function $(p:any): any;
    declare function datagridOnResize(str:string,str1:string,str2:string):any;

    interface State{
        data: Annotation.ProteinAnnotation[] | null,
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

        //private interactionEventStream: LiteMol.Bootstrap.Rx.IDisposable | undefined = void 0;

        state:State = {
            data: null,
            app: this
        };

        layerIdx = -1;

        private handleData(){
            let annotations = Annotation.AnnotationDataProvider.getProteinAnnotations();
            if(annotations !== void 0){
                let state = this.state;
                state.data = annotations;
                this.setState(state);
                setTimeout(function(){
                    $( window ).trigger('contentResize');
                },1);
            }
        }

        componentDidMount() {
            if(!Annotation.AnnotationDataProvider.isDataReady()){
                Annotation.AnnotationDataProvider.subscribeForData(this.handleData.bind(this));
            }
            else{
                this.handleData();
            }
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
            
            return <div>
                        <DGNoData {...this.state} />
                    </div>
        }
    }  

    class DGNoData extends React.Component<State,{}>{
        render(){
            return (<div className="datagrid" id="dg-protein-annotations">
						<div className="header">
							<DGHead {...this.props}/>			
						</div>
						<div className="body">
                            <table>
                                <DGComponents.DGNoDataInfoRow columnsCount={DGTABLE_COLS_COUNT}/>
                                <DGComponents.DGRowEmpty columnsCount={DGTABLE_COLS_COUNT}/>
                            </table>
						</div>
					</div>);
        }
    }

    class DGTable extends React.Component<State,{}>{
        render(){
            return (<div className="datagrid" id="dg-protein-annotations">
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
                <table></table>
            );
        };
    }

    class DGBody extends React.Component<State,{}>{ 
        private generateLink(annotation:Annotation.ResidueAnnotation){
            if(annotation.reference===""){
                return "";
            }
            return <a target="_blank" href={annotation.link}>{annotation.reference}</a>
        }    
        private generateSpannedRows(residue:string, annotations: Annotation.ResidueAnnotation[]){
            let trs:JSX.Element[] = [];

            let first = true;
            for(let annotation of annotations){
                if(first === true){
                    first = false;
                    trs.push(
                        <tr className={(annotation.isLining)?"highlight":""}>
                            <td className={`col col-1`}>
                                {residue}
                            </td>    
                            <td className={`col col-2`} >
                                {annotation.text}
                            </td>    
                            <td className={`col col-3`} >
                                {this.generateLink(annotation)}
                            </td>
                        </tr>
                    );
                }
                else{
                   trs.push(
                        <tr className={(annotation.isLining)?"highlight":""}>    
                            <td className={`col col-2`} >
                                {annotation.text}
                            </td>    
                            <td className={`col col-3`} >
                                {this.generateLink(annotation)}
                            </td>
                        </tr>
                    ); 
                }
            }
            return trs;
        }

        private generateRows(){
            if(this.props.data === null){
                return <DGComponents.DGNoDataInfoRow columnsCount={DGTABLE_COLS_COUNT}/>;
            }

            let annotations = this.props.data;
            let rows:JSX.Element[] = [];
            
            for(let annotation of annotations){
                let noDataText = "No data provided";
                
                rows.push(
                        <DGComponents.DGRow columns={["Name:",annotation.name]} trClass="highlight hl-main"/>
                    );

                rows.push(
                        <DGComponents.DGElementRow columns={[<span>UniProt Id:</span>,<a href={annotation.link} target="_blank">{annotation.uniProtId}</a>]} />
                    );

                rows.push(
                        <DGComponents.DGRow columns={["Function:"]} columnsCount={DGTABLE_COLS_COUNT} trClass="highlight"/>
                    );
                rows.push(
                        <DGComponents.DGRow columns={[(annotation.function!==null && annotation.function!=="")?annotation.function:noDataText]} columnsCount={DGTABLE_COLS_COUNT} trClass="justify"/>
                    );

                rows.push(
                        <DGComponents.DGRow columns={["Catalytic activity:"]} columnsCount={DGTABLE_COLS_COUNT} trClass="highlight"/>
                    );
                if(annotation.catalytics.length==0){
                    rows.push(
                            <DGComponents.DGRow columns={["No data provided"]} columnsCount={DGTABLE_COLS_COUNT} />
                        );
                }
                /*
                let catalytics:JSX.Element[] = [];
                for(let entry of annotation.catalytics){
                    catalytics.push(<li><span dangerouslySetInnerHTML={{__html:entry}}></span></li>);
                }
                rows.push(
                    <DGComponents.DGElementRow columns={[<ul>{catalytics}</ul>]} columnsCount={DGTABLE_COLS_COUNT} trClass="catalytics" />
                );
                */
                for(let entry of annotation.catalytics){
                    rows.push(
                            <DGComponents.DGRow columns={[entry]} columnsCount={DGTABLE_COLS_COUNT} forceHtml={true} trClass="catalytics" />
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
}