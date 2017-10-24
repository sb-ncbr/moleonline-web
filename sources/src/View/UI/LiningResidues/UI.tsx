namespace LiningResidues.UI{

    import DGComponents = Datagrid.Components;
    import React = LiteMol.Plugin.React
    import LiteMoleEvent = LiteMol.Bootstrap.Event;
    import TunnelUtils = CommonUtils.Tunnels;
    
    let DGTABLE_COLS_COUNT = 1;
    let NO_DATA_MESSAGE = "Select channel in 3D view for details...";

    declare function $(p:any): any;
    declare function datagridOnResize(str:string,str1:string,str2:string):any;

    interface State{
        data: string[] | null,
        app: App,
        isWaitingForData: boolean
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
            isWaitingForData: false
        };

        layerIdx = -1;

        componentDidMount() {
            CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler((data)=>{
                let state = this.state;
                state.data = CommonUtils.Residues.sort(data.ResidueFlow,void 0, true, true);
                this.setState(state);
                setTimeout(function(){
                    $( window ).trigger('contentResize');
                },1);
            });

            CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(()=>{
                let state = this.state;
                state.data = null;
                this.setState(state);
            });

            MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(()=>{
                let state = this.state;
                state.data = null;
                this.setState(state);
            });
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
        }*/

        componentWillUnmount(){
        }

        render() {
            if (this.state.data !== null) {
                return(
                    <div>
                        <DGTable {...this.state} />
                        <Controls {...this.state} />
                    </div>
                    );
            } 
            
            return <div>
                        <DGNoData {...this.state} />
                    </div>
        }
    }  
    function residueStringToResidueLight(residue:string):CommonUtils.Selection.LightResidueInfo{
        /*
        [0 , 1 ,2 ,  3   ]
        VAL 647 A Backbone
        */
        let residueParts = residue.split(" ");
        let rv = {
            authSeqNumber:Number(residueParts[1]),
            chain:{
                authAsymId:residueParts[2]
            }
        };

        return rv;
    }

    class Controls extends React.Component<State,{}>{

        clearSelection(){
            CommonUtils.Selection.SelectionHelper.clearSelection(this.props.app.props.controller);
        }

        selectAll(){
            let residues = [];
            if(this.props.app.state.data === null){
                return;
            }

            for(let residue of this.props.app.state.data){
                residues.push(residueStringToResidueLight(residue));
            }

            //CommonUtils.Selection.SelectionHelper.clearSelection(this.props.app.props.controller);
            CommonUtils.Selection.SelectionHelper.addResiduesToSelection(residues,false);
        }

        selectIonizable(){
            if(this.props.data === null){
                return;
            }
            let allResidues = CommonUtils.Residues.parseResidues(this.props.data,true);
            let ionizableResidues = [];
            for(let residue of allResidues){
                let rClass:string="";
                if(residue.name!==void 0){
                    rClass = CommonUtils.Residues.getResidueClassByName(residue.name);
                }
                else{
                    rClass = CommonUtils.Residues.getName(residue.authSeqNumber,this.props.app.props.controller);
                }
                
                if(rClass.indexOf("blue")!==-1||rClass.indexOf("red")!==-1){
                    ionizableResidues.push(residue);
                }
            }

            //CommonUtils.Selection.SelectionHelper.clearSelection(this.props.app.props.controller);
            CommonUtils.Selection.SelectionHelper.addResiduesToSelection(ionizableResidues,false);
        }

        render(){
            return <div className="lining-residues select-controls">
                <span className="btn-xs btn-default bt-ionizable hand" onClick={this.selectIonizable.bind(this)}>Select ionizable</span>
                <span className="btn-xs btn-default bt-all hand" onClick={this.selectAll.bind(this)}>Select all</span>
            </div>
            //<span className="btn-xs btn-default bt-none hand" onClick={this.clearSelection.bind(this)}>Clear selection</span>
        }
    }

    class DGNoData extends React.Component<State,{}>{
        render(){
            return (<div className="datagrid" id="dg-lining-residues">
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
            return (<div className="datagrid" id="dg-lining-residues">
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

        /*
        private generateLink(annotation:Annotation.ResidueAnnotation){
            if(annotation.reference===""){
                return (annotation.text!== void 0 && annotation.text !== null)?<span>{annotation.text}</span>:<span className="no-annotation"/>;
            }
            return <a target="_blank" href={annotation.link} dangerouslySetInnerHTML={{__html:annotation.text}}></a>
        }*/   

        private shortenBackbone(residue:string){
            return residue.replace(/Backbone/g,'');
        }

        private isBackbone(residue:string){
            return residue.indexOf("Backbone") >= 0;
        }

        private selectResidue(residue:string){
            let residueLightEntity = residueStringToResidueLight(residue);
            CommonUtils.Selection.SelectionHelper.addResidueToSelection(residueLightEntity.authSeqNumber,residueLightEntity.chain.authAsymId);
        }

        private getSelect3DLink(residue:string){           
            let residueEl = (this.isBackbone(residue))?<i><strong>{this.shortenBackbone(residue)}</strong></i>:<span>{residue}</span>;
            return <a className="hand" onClick={(e)=>{this.selectResidue(residue)}}>{residueEl}</a>
        }
/*
        private generateSpannedRows(residue:string, annotations: Annotation.ResidueAnnotation[]){
            let trs:JSX.Element[] = [];

            let residueNameEl = this.getSelect3DLink(residue);//(this.isBackbone(residue))?<i><strong>{this.shortenBackbone(residue)}</strong></i>:<span>{residue}</span>;

            let first = true;
            for(let annotation of annotations){
                if(first === true){
                    first = false;
                    trs.push(
                        <tr title={(this.isBackbone(residue)?residue:"")} className={(this.isBackbone(residue)?"help":"")}>
                            <td className={`col col-1`} rowSpan={(annotations.length>1)?annotations.length:void 0}>
                                {residueNameEl}
                            </td>    
                            <td className={`col col-2`} >
                                {this.generateLink(annotation)}
                            </td>
                        </tr>
                    );
                }
                else{
                   trs.push(
                        <tr>    
                            <td className={`col col-2`} >
                                {this.generateLink(annotation)}
                            </td>
                        </tr>
                    ); 
                }
            }
            return trs;
        }*/

        private generateRows(){
            if(this.props.data === null){
                return <DGComponents.DGNoDataInfoRow columnsCount={DGTABLE_COLS_COUNT} infoText={NO_DATA_MESSAGE}/>;
            }

            let rows:JSX.Element[] = [];
            
            for(let residue of this.props.data){
                let residueId = residue.split(" ").slice(1,3).join(" ");
                /*
                let annotation;
                let annotationText = "";
                let annotationSource = "";

                annotation = Annotation.AnnotationDataProvider.getResidueAnnotations(residueId);
                //let residueNameEl = (this.isBackbone(residue))?<i><strong>{this.shortenBackbone(residue)}</strong></i>:<span>{residue}</span>;
                if(annotation === void 0){
                    this.props.app.invokeDataWait();
                    rows.push(
                        <DGComponents.DGElementRow columns={[this.getSelect3DLink(residue),<span>Annotation data still loading...</span>]} title={[(this.isBackbone(residue)?residue:""),""]} trClass={(this.isBackbone(residue)?"help":"")} />
                    );
                }
                else if(annotation !== null && annotation.length>0){
                    rows = rows.concat(
                        this.generateSpannedRows(residue,annotation)
                    );
                }
                else{*/
                    let trClass = (this.isBackbone(residue)?"help":"");
                    let residueInfo = CommonUtils.Residues.parseResidues([residue],true);
                    if(residueInfo.length>0){
                        let authName = residueInfo[0].name;
                        
                        trClass += (authName===void 0)?'':" "+CommonUtils.Residues.getResidueClassByName(authName);
                    }
                    
                    rows.push(
                        <DGComponents.DGElementRow columns={[this.getSelect3DLink(residue)]} title={[(this.isBackbone(residue)?residue:"")]} trClass={trClass} />
                    );
                /*}*/
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