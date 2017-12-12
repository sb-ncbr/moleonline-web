namespace SequenceViewer.UI{

    import React = LiteMol.Plugin.React
    import LiteMoleEvent = LiteMol.Bootstrap.Event;
    import Transformer = LiteMol.Bootstrap.Entity.Transformer;
    
    declare function $(p:any): any;

    type DataType = DataInterface.ProteinData;

    interface State{
        data: DataType | null,
    };

    export function render(target: Element, plugin: LiteMol.Plugin.Controller) {
        LiteMol.Plugin.ReactDOM.render(<App controller={plugin} />, target);
    }

    export class App extends React.Component<{controller: LiteMol.Plugin.Controller }, State> {

        state:State = {
            data: null,
        };        

        componentDidMount() {
            MoleOnlineWebUI.Bridge.Events.subscribeProteinDataLoaded((data)=>{
                this.setState({
                    data,                    
                })
            });
        }

        componentWillUnmount(){
        }

        render() {
            return <div className="">
                    <Header />
                    <div className="seq-container">
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

        private getAllHETResiduesIdxes(data:DataType){
            let rv = [];

            for(let idx=0;idx<data.data.residues.count;idx++){
                if(data.data.residues.isHet[idx]===1&&data.data.residues.authName[idx]!=="HOH"){
                    rv.push(idx);
                }
            }

            return rv;
        }
        
        render(){
            let chains:JSX.Element[] = [];
            let chainGroups = this.groupByChains(this.props.data);
            chainGroups.forEach((val,key,map)=>{
                chains.push(<Chain chainName={key} chainBounds={val} data={this.props.data} app={this.props.app}/>);
            });

            let hetResidues = this.getAllHETResiduesIdxes(this.props.data);
            if(hetResidues.length>0){
                chains.push(
                    <HETChain idxes={hetResidues} data={this.props.data} app={this.props.app}/>
                );
            }

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
                let seqNumberShowCounter = 0;
                for(let idx=bounds.start.valueOf();idx<bounds.end.valueOf();idx++){
                    let residueName = this.props.data.data.residues.authName[idx];
                    let chainName = this.props.data.data.residues.authAsymId[idx];
                    let isHet = this.props.data.data.residues.isHet[idx]===1;

                    if(residueName==="HOH"||isHet===true){
                        continue;
                    }

                    let seqLetter = CommonUtils.Residues.getSequenceLetterByName(residueName);
                    let seqNumber = this.props.data.data.residues.authSeqNumber[idx];
                    
                    let nextSeqNumber = (idx+1<bounds.end.valueOf())?this.props.data.data.residues.authSeqNumber[idx+1]:-1;

                    let showSeqNumber = String(seqNumber)!==String(lastSeqNumber+1);
                    let nextShowSeqNumber = String(nextSeqNumber)!==String(seqNumber.valueOf()+1);

                    seqNumberShowCounter = (showSeqNumber)?0:seqNumberShowCounter+1;

                    if(seqNumberShowCounter%20===0&&seqNumberShowCounter>0&&!nextShowSeqNumber){
                        showSeqNumber=true;
                        seqNumberShowCounter=0;
                    }

                    lastSeqNumber = seqNumber.valueOf();
                    seqResidues.push(
                        <SeqResidue residueName={residueName} chainName={chainName} seqLetter={seqLetter} seqNumber={seqNumber} showSeqNumber={showSeqNumber} isHET={false} data={this.props.data} app={this.props.app}/>
                    );                    
                }
            }

            if(seqResidues.length===0){
                return <div/>
            }

            return <div className="seq-chain">
                    <div className="seq-header">Chain {this.props.chainName}</div>
                    <div className="seq-content">
                        {seqResidues}
                    </div>
                </div>
        }
    }

    class HETChain extends React.Component<{idxes:number[],data:DataType, app: App},{}>{  
        render(){
            let seqResidues:JSX.Element[] = [];
            let lastSeqNumber = -1;
            for(let idx=0;idx<this.props.idxes.length;idx++){
                let residueName = this.props.data.data.residues.authName[this.props.idxes[idx]];
                let chainName = this.props.data.data.residues.authAsymId[this.props.idxes[idx]];
                let isHet = this.props.data.data.residues.isHet[this.props.idxes[idx]]===1;

                if(residueName==="HOH"){
                    continue;
                }

                let seqLetter = residueName;
                let seqNumber = this.props.data.data.residues.authSeqNumber[this.props.idxes[idx]];

                let showSeqNumber = String(seqNumber)!==String(lastSeqNumber+1);
                lastSeqNumber = seqNumber.valueOf();
                seqResidues.push(
                    <SeqResidue residueName={residueName} chainName={chainName} seqLetter={seqLetter} seqNumber={seqNumber} showSeqNumber={showSeqNumber} isHET={true} data={this.props.data} app={this.props.app}/>
                );                    
            }

            if(seqResidues.length===0){
                return <div/>
            }

            return <div className="seq-chain">
                    <div className="seq-header">HET</div>
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
        isHET:boolean,
        showSeqNumber:boolean, 
        data:DataType, 
        app: App, 
    }
    interface SeqResidueState{selected:boolean}
    class SeqResidue extends React.Component<SeqResidueProps,SeqResidueState>{
        state:SeqResidueState={selected:false};

        componentDidMount(){
            CommonUtils.Selection.SelectionHelper.attachOnClearSelectionHandler(()=>{
                if(this.state.selected){
                    this.setState({selected:false});
                }
            });

            CommonUtils.Selection.SelectionHelper.attachOnResidueBulkSelectHandler(residues=>{
                let futureSelected = residues.some((val,idx,arr)=>{
                    return val.authSeqNumber===this.props.seqNumber && val.chain.authAsymId === this.props.chainName;
                });

                if(futureSelected!==this.state.selected){
                    this.setState({
                        selected:futureSelected
                    })
                }
            });
        }

        render(){
            return <div className={`seq-residue${(this.props.isHET)?' het':''}`}>
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