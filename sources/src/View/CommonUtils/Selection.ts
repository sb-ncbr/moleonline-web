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

        private static selectedResidue:ResidueLight|Residue|undefined;
        private static selectedChannelRef: string|undefined;
        private static selectedBulkResidues:LightResidueInfo[]|undefined;

        private static selectedChannelData: DataInterface.Layers|undefined;

        private static onResidueSelectHandlers:{handler:(residue:LiteMol.Bootstrap.Interactivity.Molecule.ResidueInfo)=>void}[];
        private static onResidueLightSelectHandlers:{handler:(residue:LightResidueInfo)=>void}[];
        private static onResidueBulkSelectHandlers:{handler:(residues:LightResidueInfo[])=>void}[];
        private static onClearSelectionHandlers:{handler:()=>void}[];
        private static onChannelSelectHandlers:{handler:(data:DataInterface.Layers)=>void}[];
        private static onChannelDeselectHandlers:{handler:()=>void}[];

        public static attachOnResidueSelectHandler(handler:(residue:LiteMol.Bootstrap.Interactivity.Molecule.ResidueInfo)=>void){
            if(this.onResidueSelectHandlers===void 0){
                this.onResidueSelectHandlers = [];
            }

            this.onResidueSelectHandlers.push({handler});
        }
        private static invokeOnResidueSelectHandlers(residue: LiteMol.Bootstrap.Interactivity.Molecule.ResidueInfo){
            if(this.onResidueSelectHandlers === void 0){
                return;
            }

            for(let h of this.onResidueSelectHandlers){
                h.handler(residue);
            }
        }

        public static attachOnResidueLightSelectHandler(handler:(residue:LightResidueInfo)=>void){
            if(this.onResidueLightSelectHandlers===void 0){
                this.onResidueLightSelectHandlers = [];
            }

            this.onResidueLightSelectHandlers.push({handler});
        }
        private static invokeOnResidueLightSelectHandlers(residue:LightResidueInfo){
            if(this.onResidueLightSelectHandlers === void 0){
                return;
            }

            for(let h of this.onResidueLightSelectHandlers){
                h.handler(residue);
            }
        }

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
            this.selectedResidue = void 0;
            this.selectedChannelRef = void 0;
            this.selectedChannelData = void 0;
            this.resetScene(plugin);
        }

        private static clearSelectionPrivate(plugin:LiteMol.Plugin.Controller){
            LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, this.SELECTION_VISUAL_REF);
            if(this.selectedChannelRef!==void 0){
                deselectTunnelByRef(plugin,this.selectedChannelRef);
            }
            setTimeout(() => LiteMol.Bootstrap.Event.Visual.VisualSelectElement.dispatch(plugin.context, LiteMol.Bootstrap.Interactivity.Info.empty), 0);
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

        public static selectResiduesBulkWithBallsAndSticks(plugin:LiteMol.Plugin.Controller,residues:LightResidueInfo[]){
            CommonUtils.Selection.SelectionHelper.clearSelectionPrivate(plugin);
            this.selectedChannelRef = void 0;
            this.selectedChannelData = void 0;
            this.selectedBulkResidues = void 0;
            this.resetScene(plugin);
            
            if(this.selectedBulkResidues!==void 0){
                if(this.residueBulkEquals(residues,this.selectedBulkResidues)){
                    this.selectedResidue = undefined;
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
            t.add('polymer-visual', Transformer.Molecule.CreateSelectionFromQuery, { query, name: 'Residues' }, { ref: CommonUtils.Selection.SelectionHelper.getSelectionVisualRef(), isHidden: true })
                .then(Transformer.Molecule.CreateVisual, { style: LiteMol.Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks') }, {isHidden:true});

            plugin.applyTransform(t)
                .then(()=>{
                    LiteMol.Bootstrap.Command.Entity.Focus.dispatch(plugin.context, plugin.context.select(CommonUtils.Selection.SelectionHelper.getSelectionVisualRef()));
                });   
            this.selectedBulkResidues = residues;

            this.invokeOnResidueBulkSelectHandlers(residues);
        }

        public static isBulkResiduesSelected(residues:LightResidueInfo[]):boolean{
            return this.selectedBulkResidues !== void 0;
        }

        public static selectResidueByAuthAsymIdAndAuthSeqNumberWithBallsAndSticks(plugin:LiteMol.Plugin.Controller,residue:LightResidueInfo){
            let query = LiteMol.Core.Structure.Query.chainsById(residue.chain.authAsymId).intersectWith(
                LiteMol.Core.Structure.Query.residues(
                    ...[{authSeqNumber:residue.authSeqNumber}]
                )
            );

            CommonUtils.Selection.SelectionHelper.clearSelectionPrivate(plugin);
            this.selectedChannelRef = void 0;
            this.selectedChannelData = void 0;
            this.selectedBulkResidues = void 0;
            this.resetScene(plugin);

            if(this.selectedResidue!==void 0){
                if((this.selectedResidue.type==="full" && this.residueLightEquals({type:"light", info:residue},this.residueToLight(this.selectedResidue)))
                    ||(this.selectedResidue.type==="light" && this.residueLightEquals({type:"light", info:residue}, this.selectedResidue))){
                    this.selectedResidue = undefined;
                    return;
                }
            }

            let t = plugin.createTransform();
            t.add('polymer-visual', Transformer.Molecule.CreateSelectionFromQuery, { query, name: 'Residues' }, { ref: CommonUtils.Selection.SelectionHelper.getSelectionVisualRef(), isHidden: true })
                .then(Transformer.Molecule.CreateVisual, { style: LiteMol.Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks') }, {isHidden:true});

            plugin.applyTransform(t)
                .then(()=>{
                    LiteMol.Bootstrap.Command.Entity.Focus.dispatch(plugin.context, plugin.context.select(CommonUtils.Selection.SelectionHelper.getSelectionVisualRef()));
                });   
            this.selectedResidue = {type:"light", info:residue};
            this.invokeOnResidueLightSelectHandlers(residue);
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
            return this.isSelectedAnyChannel() || this.selectedResidue !== void 0 || this.selectedBulkResidues !== void 0;
        }

        public static selectResidueWithBallsAndSticks(plugin:LiteMol.Plugin.Controller,residue:LiteMol.Bootstrap.Interactivity.Molecule.ResidueInfo){
            let query = LiteMol.Core.Structure.Query.chainsById(residue.chain.asymId)
                .intersectWith(LiteMol.Core.Structure.Query.residues(
                    residue
                )
            );
            
            CommonUtils.Selection.SelectionHelper.clearSelectionPrivate(plugin);
            this.selectedChannelRef = void 0;
            this.selectedChannelData = void 0;
            this.selectedBulkResidues = void 0;
            this.resetScene(plugin);

            if(this.selectedResidue!==void 0){
                if(this.isSelected(residue)){
                    this.selectedResidue = undefined;
                    return;
                }
            }

            let t = plugin.createTransform();
            t.add('polymer-visual', Transformer.Molecule.CreateSelectionFromQuery, { query, name: 'Residues' }, { ref: CommonUtils.Selection.SelectionHelper.getSelectionVisualRef(), isHidden: true })
                .then(Transformer.Molecule.CreateVisual, { style: LiteMol.Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks') }, {isHidden:true});

            plugin.applyTransform(t)
                .then(()=>{
                    LiteMol.Bootstrap.Command.Entity.Focus.dispatch(plugin.context, plugin.context.select(CommonUtils.Selection.SelectionHelper.getSelectionVisualRef()));
                }); 
            this.selectedResidue = {type:"full", info:residue};
            this.invokeOnResidueSelectHandlers(residue);
        }

        public static isSelected(residue:LiteMol.Bootstrap.Interactivity.Molecule.ResidueInfo){
            return (this.selectedResidue!==void 0)
                &&(
                    (
                        this.selectedResidue.type==="full" && this.residueEquals(residue,this.selectedResidue.info))
                        ||(this.selectedResidue.type==="light" && this.residueLightEquals(this.residueToLight({type:"full", info:residue}),this.selectedResidue)
                    )
                );
        }

        public static isSelectedLight(residue: LightResidueInfo){
            return (
                this.selectedResidue!==void 0)
                &&(
                    (
                        this.selectedResidue.type==="full" && this.residueLightEquals({type:"light", info:residue},this.residueToLight(this.selectedResidue)))
                        ||(this.selectedResidue.type==="light" && this.residueLightEquals({type:"light", info:residue}, this.selectedResidue)
                    )
                );
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

            if(this.selectedResidue !== void 0){
                //console.log("selected channel - clearing residues");
                LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, this.SELECTION_VISUAL_REF);
                this.selectedResidue = void 0;
                return;
            }

            if(this.selectedBulkResidues !== void 0){
                //console.log("selected channel - clearing residues");
                LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, this.SELECTION_VISUAL_REF);
                this.selectedBulkResidues = void 0;
                return;
            }

            if((this.selectedChannelRef !== void 0)&&(this.selectedChannelRef === i.source.ref)){
                //console.log("double clicked on tunel - deselecting");
                this.clearSelectionPrivate(plugin);
                this.selectedChannelRef = void 0;
                this.selectedChannelData = void 0;
                this.invokeOnChannelDeselectHandlers();
                return;
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
                return;
            }
            
            //console.log("SelectionHelper: SelectEvent from code - ignoring ");
        }

    }

    function getIndices(v:LiteMol.Bootstrap.Entity.Visual.Any){
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