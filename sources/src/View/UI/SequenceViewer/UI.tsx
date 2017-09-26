namespace SequenceViewer.UI{

    import React = LiteMol.Plugin.React
    import LiteMoleEvent = LiteMol.Bootstrap.Event;
    import Transformer = LiteMol.Bootstrap.Entity.Transformer;
    
    declare function $(p:any): any;

    type DataType = DataInterface.ProteinData;

    interface State{
        data: DataType | null,
        app: App,
        hasSelection: boolean
    };

    export function render(target: Element, plugin: LiteMol.Plugin.Controller) {
        LiteMol.Plugin.ReactDOM.render(<App controller={plugin} />, target);
    }

    export class App extends React.Component<{controller: LiteMol.Plugin.Controller }, State> {

        state:State = {
            data: null,
            app: this,
            hasSelection: false
        };        

        componentDidMount() {
            MoleOnlineWebUI.Bridge.Events.subscribeProteinDataLoaded((data)=>{
                this.setState({
                    data,
                    app:this,
                    hasSelection:false
                })
            });
        }

        componentWillUnmount(){
        }

        render() {
            return <div className="seq-container">
                    <Header />
                    <div>
                        {(this.state.data===null)?<div className="seq-waiting-for-data">Waiting for protein data...</div>:<Sequence data={this.state.data} app={this}/>}
                    </div>
                </div>
        }
    }
    
    class Header extends React.Component<{},{}>{
        render(){
            return <div className="sequence-viewer-header">
                Protein Sequence
            </div>
        }
    }

    interface GroupBounds{start:Number,end:Number};
    class Sequence extends React.Component<{data:DataType,app: App},{}>{
        
        private groupByChains(data:DataType){
            let groups:Map<String,GroupBounds[]> = new Map<String,GroupBounds[]>();

            for(let chIdx=0;chIdx<data.data.chains.count;chIdx++){
                let currentBounds = {
                    start:data.data.chains.residueStartIndex[chIdx],
                    end:data.data.chains.residueEndIndex[chIdx]
                }
                let currentName = data.data.chains.authAsymId[chIdx];
                
                let bounds = groups.get(currentName);
                if(bounds===void 0){
                    bounds = [];
                }
                bounds.push(currentBounds);
                groups.set(currentName,bounds);
            }

            return groups;
        }
        
        render(){
            let chains:JSX.Element[] = [];
            let chainGroups = this.groupByChains(this.props.data);
            chainGroups.forEach((val,key,map)=>{
                chains.push(<Chain chainName={key} chainBounds={val} data={this.props.data} app={this.props.app}/>);
            });

            return <div>
                {chains}
            </div>
        }
    }

    class Chain extends React.Component<{chainBounds:GroupBounds[],chainName:String,data:DataType, app: App},{}>{  
        render(){
            let seqResidues:JSX.Element[] = [];
            let lastSeqNumber = -1;
            for(let bounds of this.props.chainBounds){
                for(let idx=bounds.start.valueOf();idx<bounds.end.valueOf();idx++){
                    let residueName = this.props.data.data.residues.authName[idx];
                    let chainName = this.props.data.data.residues.authAsymId[idx];
                    let seqLetter = CommonUtils.Residues.getSequenceLetterByName(residueName);
                    let seqNumber = this.props.data.data.residues.authSeqNumber[idx];

                    let showSeqNumber = String(seqNumber)!==String(lastSeqNumber+1);
                    lastSeqNumber = seqNumber.valueOf();
                    seqResidues.push(
                        <SeqResidue residueName={residueName} chainName={chainName} seqLetter={seqLetter} seqNumber={seqNumber} showSeqNumber={showSeqNumber} data={this.props.data} app={this.props.app}/>
                    );                    
                }
            }

            return <div className="seq-chain">
                    <div className="seq-header">Chain {this.props.chainName}</div>
                    <div className="seq-content">
                        {seqResidues}
                    </div>
                </div>
        }
    }

    interface SeqResidueProps{
        residueName:string, 
        chainName:String, 
        seqNumber:Number, 
        seqLetter:string, 
        showSeqNumber:boolean, 
        data:DataType, 
        app: App, 
    }
    interface SeqResidueState{selected:boolean}
    class SeqResidue extends React.Component<SeqResidueProps,SeqResidueState>{
        state:SeqResidueState={selected:false};

        componentDidMount(){
            CommonUtils.Selection.SelectionHelper.attachOnClearSelectionHandler(()=>{
                this.setState({selected:false});
                let s = this.props.app.state;
                if(s.hasSelection){
                    s.hasSelection = false;
                    this.props.app.setState(s);
                }
            });

            CommonUtils.Selection.SelectionHelper.attachOnResidueBulkSelectHandler(residues=>{
                this.setState({
                    selected:residues.some((val,idx,arr)=>{
                        return val.authSeqNumber===this.props.seqNumber && val.chain.authAsymId === this.props.chainName;
                    })
                })
            });
        }

        render(){
            return <div className="seq-residue">
                <div className="seq-number">{(this.props.showSeqNumber)?this.props.seqNumber:""}</div>
                <div className={`seq-letter${(this.state.selected)?" selected":""}`} onMouseDown={(e)=>{
                        CommonUtils.Selection.SelectionHelper.addResidueToSelection(this.props.seqNumber.valueOf(),this.props.chainName.valueOf());
                    }} onMouseMove={(e)=>{
                        highlightResiude(this.props.seqNumber,this.props.chainName.valueOf(),true);
                    }} onMouseOut={(e)=>{
                        highlightResiude(this.props.seqNumber,this.props.chainName.valueOf(),false);
                    }} title={`${this.props.residueName} ${this.props.chainName} ${this.props.seqNumber}`}>{this.props.seqLetter}</div>
            </div>
        }
    }

    function clearSelection(){
        let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
        CommonUtils.Selection.SelectionHelper.clearSelection(plugin);
    }

    function highlightResiude(seqNumber:Number, chain:string, isOn:boolean){
        let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
        let model = plugin.selectEntities("polymer-visual")[0] as LiteMol.Bootstrap.Entity.Molecule.Model;
        let query = LiteMol.Core.Structure.Query.residuesById(seqNumber.valueOf()).intersectWith(LiteMol.Core.Structure.Query.chainsById(chain));
        LiteMol.Bootstrap.Command.Molecule.Highlight.dispatch(plugin.context,{model,query,isOn});        
    }

}