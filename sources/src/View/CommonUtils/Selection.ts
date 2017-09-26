namespace CommonUtils.Selection{
    import Transformer = LiteMol.Bootstrap.Entity.Transformer;

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

    export interface LightResidueInfo{
        authSeqNumber: number, 
        chain:{
            authAsymId:string
        }
    };
    
    export interface SelectionObject{
        elements: number[]
    };
    
    
    export interface ResidueLight{type:"light", info:LightResidueInfo};
    export interface Residue{type:"full",info:LiteMol.Bootstrap.Interactivity.Molecule.ResidueInfo};

    export class SelectionHelper{
        private static SELECTION_VISUAL_REF = "res_visual";
        private static SELECTION_ALT_VISUAL_REF = "alt_res_visual";

        private static interactionEventStream: LiteMol.Bootstrap.Rx.IDisposable | undefined = void 0;

        private static selectedChannelRef: string|undefined;
        private static selectedBulkResidues:LightResidueInfo[]|undefined;

        private static selectedChannelData: DataInterface.Layers|undefined;

        private static onResidueSelectHandlers:{handler:(residue:LiteMol.Bootstrap.Interactivity.Molecule.ResidueInfo)=>void}[];
        private static onResidueLightSelectHandlers:{handler:(residue:LightResidueInfo)=>void}[];
        private static onResidueBulkSelectHandlers:{handler:(residues:LightResidueInfo[])=>void}[];
        private static onClearSelectionHandlers:{handler:()=>void}[];
        private static onChannelSelectHandlers:{handler:(data:DataInterface.Layers)=>void}[];
        private static onChannelDeselectHandlers:{handler:()=>void}[];

        public static attachOnResidueBulkSelectHandler(handler:(residues:LightResidueInfo[])=>void){
            if(this.onResidueBulkSelectHandlers===void 0){
                this.onResidueBulkSelectHandlers = [];
            }

            this.onResidueBulkSelectHandlers.push({handler});
        }
        private static invokeOnResidueBulkSelectHandlers(residues:LightResidueInfo[]){
            if(this.onResidueBulkSelectHandlers === void 0){
                return;
            }

            for(let h of this.onResidueBulkSelectHandlers){
                h.handler(residues);
            }
        }

        public static attachOnClearSelectionHandler(handler:()=>void){
            if(this.onClearSelectionHandlers===void 0){
                this.onClearSelectionHandlers = [];
            }

            this.onClearSelectionHandlers.push({handler});
        }
        private static invokeOnClearSelectionHandlers(){
            if(this.onClearSelectionHandlers === void 0){
                return;
            }

            for(let h of this.onClearSelectionHandlers){
                h.handler();
            }
        }

        public static attachOnChannelSelectHandler(handler:(data:DataInterface.Layers)=>void){
            if(this.onChannelSelectHandlers===void 0){
                this.onChannelSelectHandlers = [];
            }

            this.onChannelSelectHandlers.push({handler});
        }
        private static invokeOnChannelSelectHandlers(data: DataInterface.Layers){
            if(this.onChannelSelectHandlers === void 0){
                return;
            }

            for(let h of this.onChannelSelectHandlers){
                h.handler(data);
            }
        }

        public static attachOnChannelDeselectHandler(handler:()=>void){
            if(this.onChannelDeselectHandlers===void 0){
                this.onChannelDeselectHandlers = [];
            }

            this.onChannelDeselectHandlers.push({handler});
        }
        private static invokeOnChannelDeselectHandlers(){
            if(this.onChannelDeselectHandlers === void 0){
                return;
            }

            for(let h of this.onChannelDeselectHandlers){
                h.handler();
            }
        }

        public static getSelectionVisualRef(){
            return this.SELECTION_VISUAL_REF;
        }

        public static getAltSelectionVisualRef(){
            return this.SELECTION_ALT_VISUAL_REF;
        }

        public static clearSelection(plugin:LiteMol.Plugin.Controller){
            this.clearSelectionPrivate(plugin);
            this.selectedBulkResidues = void 0;
            this.selectedChannelRef = void 0;
            this.selectedChannelData = void 0;
            //this.resetScene(plugin);
        }

        private static clearSelectionPrivate(plugin:LiteMol.Plugin.Controller){
            LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, this.SELECTION_VISUAL_REF);
            if(this.selectedChannelRef!==void 0){
                deselectTunnelByRef(plugin,this.selectedChannelRef);
            }
            LiteMol.Bootstrap.Event.Visual.VisualSelectElement.dispatch(plugin.context, LiteMol.Bootstrap.Interactivity.Info.empty);
            this.clearAltSelection(plugin);
            this.invokeOnClearSelectionHandlers();
        }

        public static clearAltSelection(plugin:LiteMol.Plugin.Controller){
            LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, this.SELECTION_ALT_VISUAL_REF);
        }

        
        public static resetScene(plugin:LiteMol.Plugin.Controller){
            LiteMol.Bootstrap.Command.Visual.ResetScene.dispatch(plugin.context,void 0);
        }
        

        private static chainEquals(c1:LiteMol.Bootstrap.Interactivity.Molecule.ChainInfo,c2:LiteMol.Bootstrap.Interactivity.Molecule.ChainInfo){
            if((c1.asymId!==c2.asymId)
                ||(c1.authAsymId!==c2.authAsymId)
                ||(c1.index!==c2.index)){
                    return false;
                }
            return true;
        }

        private static residueEquals(r1:LiteMol.Bootstrap.Interactivity.Molecule.ResidueInfo|undefined, r2:LiteMol.Bootstrap.Interactivity.Molecule.ResidueInfo|undefined){
            if(r1 === void 0 && r2 === void 0){
                return true;
            }           
            if(r1 === void 0 || r2 === void 0){
                return false;
            }

            if((r1.authName !== r2.authName)
                ||(r1.authSeqNumber !== r2.authSeqNumber)
                ||(!this.chainEquals(r1.chain,r2.chain))
                ||(r1.index !== r2.index)
                ||(r1.insCode !== r2.insCode)
                ||(r1.isHet !== r2.isHet)
                ||(r1.name !== r2.name)
                ||(r1.seqNumber !== r2.seqNumber)
                ){
                return false;
            }

            return true;
        }

        private static residueBulkSort(bulk: LightResidueInfo[]){
            bulk.sort((a,b)=>{
                if(a.chain.authAsymId<b.chain.authAsymId){
                    return -1;  
                }
                else if(a.chain.authAsymId==b.chain.authAsymId){
                    return a.authSeqNumber-b.authSeqNumber;
                }
                else{
                    return 1;
                }
            });
        }

        private static residueBulkEquals(r1:LightResidueInfo[],r2:LightResidueInfo[]){
            if(r1.length!==r2.length){
                return false;
            }

            this.residueBulkSort(r1);
            this.residueBulkSort(r2);

            for(let idx=0;idx<r1.length;idx++){
                if(this.residueLightEquals({type:"light",info:r1[idx]},{type:"light",info:r2[idx]})){
                    return false;
                }
            }

            return true;
        }

        private static selectResiduesBulkWithBallsAndSticks(plugin:LiteMol.Plugin.Controller,residues:LightResidueInfo[]){
            CommonUtils.Selection.SelectionHelper.clearSelectionPrivate(plugin);
            this.selectedChannelRef = void 0;
            this.selectedChannelData = void 0;
            this.selectedBulkResidues = void 0;
            //this.resetScene(plugin);           
            
            if(this.selectedBulkResidues!==void 0){
                if(this.residueBulkEquals(residues,this.selectedBulkResidues)){
                    return;
                }
            }

            let queries = [];
            for(let residue of residues){
                queries.push(
                    LiteMol.Core.Structure.Query.chainsById(...[residue.chain.authAsymId]).intersectWith(
                        LiteMol.Core.Structure.Query.residues(
                            ...[{authSeqNumber:residue.authSeqNumber}]
                        )
                    ).compile()
                );
            }

            let query = LiteMol.Core.Structure.Query.or(...queries);

            let t = plugin.createTransform();
            const visualStyle = LiteMol.Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks');
            if(visualStyle!==void 0){
                visualStyle.taskType = "Silent";
            }
            t.add('polymer-visual', Transformer.Molecule.CreateSelectionFromQuery, { query, name: 'Residues', silent:true }, { ref: CommonUtils.Selection.SelectionHelper.getSelectionVisualRef(), isHidden: true })
                .then(Transformer.Molecule.CreateVisual, { style: visualStyle }, {isHidden:true});

            plugin.applyTransform(t)

            /*.then(()=>{
                //LiteMol.Bootstrap.Command.Entity.Focus.dispatch(plugin.context, plugin.context.select(CommonUtils.Selection.SelectionHelper.getSelectionVisualRef()));
            }); */ 
            
            this.selectedBulkResidues = residues;

            this.invokeOnResidueBulkSelectHandlers(residues);
            
        }

        public static getSelectedResidues():(ResidueLight|Residue)[]{
            if(this.selectedBulkResidues!==void 0){
                return this.selectedBulkResidues.map((val,idx,arr)=>{
                    return {type: "light", info:val} as ResidueLight;
                });
            }
            
            return [];
        }

        private static residueToLight(residue:Residue):ResidueLight{
            return {
                type:"light",
                info: {
                    chain: residue.info.chain,
                    authSeqNumber: residue.info.authSeqNumber
                }
            };
        }

        private static residueLightEquals(r1:ResidueLight,r2:ResidueLight){
            if((!this.chainLightEquals(r1.info.chain,r2.info.chain))
                ||r1.info.authSeqNumber!==r2.info.authSeqNumber){
                    return false;
                }
            return true;
        }

        private static chainLightEquals(c1:{authAsymId:string},c2:{authAsymId:string}){
            return (c1.authAsymId===c2.authAsymId);
        }
        
        public static isSelectedAnyChannel(){
            return this.selectedChannelRef !== void 0;
        }

        public static isSelectedAny(){
            return this.isSelectedAnyChannel() /*|| this.selectedResidue !== void 0*/ || this.selectedBulkResidues !== void 0;
        }

        /**
         * 
         * @param seqNumber 
         * @param chain 
         * @return True - residue selected | False - residue deselected
         */
        public static addResidueToSelection(seqNumber:number, chain:string):boolean{
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            let residues = CommonUtils.Selection.SelectionHelper.getSelectedResidues();
            let newSelection:LightResidueInfo[] = [];
            let deselectMode = false;
            for(let r of residues){
                if(r.info.authSeqNumber===seqNumber&&r.info.chain.authAsymId===chain){
                    deselectMode = true;
                    continue;
                }
                newSelection.push(r.info);
            }

            if(!deselectMode){
                newSelection.push({authSeqNumber:seqNumber,chain:{authAsymId:chain}});
            }
            
            if(newSelection.length>0){
                this.selectResiduesBulkWithBallsAndSticks(plugin,newSelection);
            }
            else{
                this.clearSelection(plugin);
            }

            return !deselectMode;
        }

        /**
         * 
         * @param residues
         * @param doRemove specifies wheter or not remove residues contained in both current selection and new selection. By default - true
         */
        public static addResiduesToSelection(residues:LightResidueInfo[], doRemove?:boolean){
            doRemove = (doRemove===void 0)?true:doRemove;
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            let currentResidues = CommonUtils.Selection.SelectionHelper.getSelectedResidues();
            let newSelection:LightResidueInfo[] = [];
            
            let contains = (res:LightResidueInfo,array:(ResidueLight | Residue)[])=>{
                for(let i of array){
                    if(i.info.authSeqNumber===res.authSeqNumber&&i.info.chain.authAsymId===res.chain.authAsymId){
                        return true;
                    }
                }

                return false;
            }

            let toRemove:(ResidueLight | Residue)[] = [];
            for(let r of residues){
                if(contains(r,currentResidues)){
                    toRemove.push({type:"light",info:r});
                    continue;
                }
                newSelection.push(r);
            }        
            
            if(toRemove.length>0&&doRemove){
                for(let r of currentResidues){
                    if(!contains(r.info,toRemove)){
                        newSelection.push({authSeqNumber: r.info.authSeqNumber, chain:{authAsymId:r.info.chain.authAsymId}});
                    }
                }
            }
            else{
                newSelection=newSelection.concat(currentResidues.map((val,idx,arr)=>{
                    return val.info;
                }));
            }   

            if(newSelection.length>0){
                this.selectResiduesBulkWithBallsAndSticks(plugin,newSelection);
            }
            else{
                this.clearSelection(plugin);
            }
        }

        public static isSelected(residue:LiteMol.Bootstrap.Interactivity.Molecule.ResidueInfo){
            if(this.selectedBulkResidues===void 0){
                return false;
            }

            for(let r of this.selectedBulkResidues){
                if(this.residueLightEquals(this.residueToLight({type:"full",info:residue}),{type:"light", info:r})){
                    return true;
                }
            }

            return false;
        }

        public static getSelectedChannelData(){
            return (this.selectedChannelData===void 0)?null:this.selectedChannelData;
        }

        public static getSelectedChannelRef(){
            return (this.selectedChannelRef===void 0)?"":this.selectedChannelRef;
        }

        public static attachClearSelectionToEventHandler(plugin:LiteMol.Plugin.Controller){
            this.interactionEventStream = LiteMol.Bootstrap.Event.Visual.VisualSelectElement.getStream(plugin.context)
                    .subscribe(e => this.interactionHandler('select', e.data as ChannelEventInfo, plugin));
        }

        private static interactionHandler(type: string, i: ChannelEventInfo | undefined, plugin: LiteMol.Plugin.Controller) {
            //console.log("SelectionHelper: Caught-SelectEvent");
            if (!i || i.source == null || i.source.ref === void 0 || i.source.props === void 0 || i.source.props.tag === void 0) {
                //console.log("SelectionHelper: Event incomplete - ignoring");
                return;    
            }

            //Unsupported types
            if(i.source.props.tag.type === "Origins"){
                return;
            }

            if(this.selectedBulkResidues !== void 0){
                //console.log("selected channel - clearing residues");
                this.clearSelectionPrivate(plugin);
                LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, this.SELECTION_VISUAL_REF);
                this.selectedBulkResidues = void 0;
                //return;
            }

            if((this.selectedChannelRef !== void 0)&&(this.selectedChannelRef === i.source.ref)){
                //console.log("double clicked on tunel - deselecting");
                this.clearSelectionPrivate(plugin);
                this.selectedChannelRef = void 0;
                this.selectedChannelData = void 0;
                this.invokeOnChannelDeselectHandlers();
                //return;
            }
            else{
                //console.log("Channel selected");
                if(this.selectedChannelRef!==void 0 && this.selectedChannelRef !== i.source.ref){
                    deselectTunnelByRef(plugin,this.selectedChannelRef);    
                }
                this.selectedChannelRef = i.source.ref;
                this.selectedChannelData = i.source.props.tag.element.Layers;
                selectTunnelByRef(plugin,this.selectedChannelRef);
                this.clearAltSelection(plugin);
                this.invokeOnChannelSelectHandlers(this.selectedChannelData);
                //return;
            }
            
            //console.log("SelectionHelper: SelectEvent from code - ignoring ");
        }

    }

    export function getIndices(v:LiteMol.Bootstrap.Entity.Visual.Any){
        if((v as any).props.model.surface === void 0){
            return [] as number[];
        }
        return (v as any).props.model.surface.triangleIndices;
    }

    function selectTunnelByRef(plugin:LiteMol.Plugin.Controller,ref:string){
        let entities = plugin.selectEntities(ref);        
        let v = <any>entities[0] as LiteMol.Bootstrap.Entity.Visual.Any;   
        if (LiteMol.Bootstrap.Entity.isVisual(entities[0])&&v.props.isSelectable) {
            v.props.model.applySelection(getIndices(v), LiteMol.Visualization.Selection.Action.Select);
        }
    }

    function deselectTunnelByRef(plugin:LiteMol.Plugin.Controller,ref:string){
        let entities = plugin.selectEntities(ref);        
        let v = <any>entities[0] as LiteMol.Bootstrap.Entity.Visual.Any;   
        if (LiteMol.Bootstrap.Entity.isVisual(entities[0])&&v.props.isSelectable) {
            v.props.model.applySelection(getIndices(v), LiteMol.Visualization.Selection.Action.RemoveSelect);
        }
    }
}