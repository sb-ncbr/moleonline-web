namespace CommonUtils.Selection{
    import Transformer = LiteMol.Bootstrap.Entity.Transformer;

    interface ChannelEventInfo { 
            kind: LiteMol.Bootstrap.Interactivity.Info.__Kind.Selection | LiteMol.Bootstrap.Interactivity.Info.__Kind.Empty,
            source : {
                props: {
                    tag: LiteMol.Example.Channels.State.SurfaceTag
                },
                ref: string
            },
            elements: any[]|undefined
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
    export interface StringPoint{x:string,y:string,z:string};

    export class SelectionHelper{
        private static SELECTION_VISUAL_REF = "res_visual";
        private static SELECTION_ALT_VISUAL_REF = "alt_res_visual";

        private static interactionEventStream: LiteMol.Bootstrap.Rx.IDisposable | undefined = void 0;

        private static selectedChannelRef: string|undefined;
        private static selectedChannelId: string|undefined;
        private static selectedBulkResidues:LightResidueInfo[]|undefined;
        private static selectedPoints:StringPoint[]|undefined;
        private static selectedTPoint:Point|undefined;

        private static selectedChannelData: DataInterface.Layers|undefined;

        private static onPointSelectHandlers:{handler:(points:StringPoint[])=>void}[];
        private static onResidueSelectHandlers:{handler:(residue:LiteMol.Bootstrap.Interactivity.Molecule.ResidueInfo)=>void}[];
        private static onResidueLightSelectHandlers:{handler:(residue:LightResidueInfo)=>void}[];
        private static onResidueBulkSelectHandlers:{handler:(residues:LightResidueInfo[])=>void}[];
        private static onClearSelectionHandlers:{handler:()=>void}[];
        private static onChannelSelectHandlers:{handler:(data:DataInterface.Layers,channelId?:string)=>void}[];
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

        public static attachOnChannelSelectHandler(handler:(data:DataInterface.Layers,channelId?:string)=>void){
            if(this.onChannelSelectHandlers===void 0){
                this.onChannelSelectHandlers = [];
            }

            this.onChannelSelectHandlers.push({handler});
        }
        private static invokeOnChannelSelectHandlers(data: DataInterface.Layers, channelId?:string){
            if(this.onChannelSelectHandlers === void 0){
                return;
            }

            for(let h of this.onChannelSelectHandlers){
                h.handler(data,channelId);
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

        //For PDF report
        public static forceInvokeOnChannelDeselectHandlers(){
            this.invokeOnChannelDeselectHandlers();
        }

        public static attachOnPointBulkSelectHandler(handler:(points:StringPoint[])=>void){
            if(this.onPointSelectHandlers===void 0){
                this.onPointSelectHandlers = [];
            }

            this.onPointSelectHandlers.push({handler});
        }
        private static invokeOnPointSelectHandlers(points:StringPoint[]){
            if(this.onPointSelectHandlers === void 0){
                return;
            }

            for(let h of this.onPointSelectHandlers){
                h.handler(points);
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
            this.invokeOnClearSelectionHandlers();        
            //this.resetScene(plugin);
        }

        private static clearSelectionPrivate(plugin:LiteMol.Plugin.Controller){
            this.clearSelectedTPoint();
            this.clearSelectedPoints();
            LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, this.SELECTION_VISUAL_REF);
            if(this.selectedChannelRef!==void 0){
                deselectTunnelByRef(plugin,this.selectedChannelRef);
                    this.selectedChannelRef = void 0;
                    this.selectedChannelData = void 0;
                    this.selectedChannelId = void 0;
            }
            LiteMol.Bootstrap.Event.Visual.VisualSelectElement.dispatch(plugin.context, LiteMol.Bootstrap.Interactivity.Info.empty);
            this.clearAltSelection(plugin);
            
            this.selectedBulkResidues = void 0;

            //this.invokeOnClearSelectionHandlers();
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
            this.selectedChannelId = void 0;
            this.selectedBulkResidues = void 0;
            this.clearSelectedPoints();
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

            plugin.applyTransform(t);

            /*.then(()=>{
                //LiteMol.Bootstrap.Command.Entity.Focus.dispatch(plugin.context, plugin.context.select(CommonUtils.Selection.SelectionHelper.getSelectionVisualRef()));
            }); */ 
            
            if(residues.length>0){
                this.selectedBulkResidues = residues;
            }
            else{
                this.selectedBulkResidues = void 0;
            }
            
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

        public static getSelectedPoints():StringPoint[]{
            if(this.selectedPoints!==void 0){
                return this.selectedPoints;
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
            return this.isSelectedAnyChannel() /*|| this.selectedResidue !== void 0*/ || this.selectedBulkResidues !== void 0 || this.selectedPoints !== void 0;
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

        /**
         * 
         * @param point 
         * @return True - point selected | False - point deselected
         */
        public static addPointToSelection(point:StringPoint):boolean{
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            let points = CommonUtils.Selection.SelectionHelper.getSelectedPoints();
            let newSelection:StringPoint[] = [];
            let deselectMode = false;
            for(let p of points){
                if(p.x===point.x&&p.y===point.y&&p.z===point.z){
                    deselectMode = true;
                    continue;
                }
                newSelection.push(p);
            }

            if(!deselectMode){
                newSelection.push(point);
            }
            
            if(newSelection.length>0){
                this.selectPoints(newSelection);
            }
            else{
                this.clearSelection(plugin);
                this.clearSelectedPoints();
                this.invokeOnPointSelectHandlers([]); 
            }

            return !deselectMode;
        }

        public static isSelectedPoint(point:StringPoint){
            if(this.selectedPoints===void 0){
                return false;
            }

            for(let p of this.selectedPoints){
                if(p.x===point.x&&p.y===point.y&&p.z===point.z){
                    return true;
                }
            }

            return false;
        }

        private static clearSelectedPoints(){
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            plugin.command(LiteMol.Bootstrap.Command.Tree.RemoveNode, "point-selection");
            this.selectedPoints = void 0;
        }

        private static clearSelectedTPoint(){
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            plugin.command(LiteMol.Bootstrap.Command.Tree.RemoveNode, "point-selection-T");
            this.selectedTPoint = void 0;
        }

        private static createPointsSelectionVisual(points:StringPoint[]){
            let s = LiteMol.Visualization.Primitive.Builder.create();
            let id = 0;
            for (let p of points) {
                s.add({ type: 'Sphere', id: id++, radius: 1.69, center: [ Number(p.x), Number(p.y), Number(p.z) ] });
            }
            
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            this.clearSelectedPoints();
            s.buildSurface().run().then(surface => {
                let t = plugin.createTransform()
                    .add('mole-data', LiteMol.Example.Channels.State.CreateSurface, {
                        //label: 'Selected points (' + origins.Type + ')',
                        tag: <LiteMol.Example.Channels.State.SurfaceTag>{ kind: 'Points', element: points },
                        surface,
                        isInteractive: true,
                        color: MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Colors.get(MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Enum.SyntethicSelect) as LiteMol.Visualization.Color
                    }, { ref: "point-selection", isHidden: true });
                
                plugin.applyTransform(t);
            })
        }

        private static createTPointSelectionVisual(point:Point){
            let s = LiteMol.Visualization.Primitive.Builder.create();
            let id = 0;
            s.add({ type: 'Sphere', id: id++, radius: 1.69, center: [ point.X,point.Y,point.Z ] });
            
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            this.clearSelectedTPoint();
            s.buildSurface().run().then(surface => {
                let t = plugin.createTransform()
                    .add('mole-data', LiteMol.Example.Channels.State.CreateSurface, {
                        //label: 'Selected points (' + origins.Type + ')',
                        tag: <LiteMol.Example.Channels.State.SurfaceTag>{ kind: 'TPoint', element: point },
                        surface,
                        isInteractive: true,
                        color: MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Colors.get(MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Enum.TPoint) as LiteMol.Visualization.Color
                    }, { ref: "point-selection-T", isHidden: true });
                
                plugin.applyTransform(t);
            })
        }

        public static selectPoints(points:StringPoint[]){
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            CommonUtils.Selection.SelectionHelper.clearSelectionPrivate(plugin);
            this.selectedChannelRef = void 0;
            this.selectedChannelData = void 0;
            this.selectedChannelId = void 0;
            this.selectedBulkResidues = void 0;
            this.selectedPoints = void 0;

            this.createPointsSelectionVisual(points);
            
            this.selectedPoints = points;

            this.invokeOnPointSelectHandlers(points); 
        }

        public static getSelectedChannelData(){
            return (this.selectedChannelData===void 0)?null:this.selectedChannelData;
        }

        public static getSelectedChannelRef(){
            return (this.selectedChannelRef===void 0)?"":this.selectedChannelRef;
        }

        public static getSelectedChannelId(){
            return (this.selectedChannelId===void 0)?"":this.selectedChannelId;
        }

        public static attachSelectionHelperHandlerToEventHandler(plugin:LiteMol.Plugin.Controller){
            MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(()=>{
                this.clearSelection(MoleOnlineWebUI.Bridge.Instances.getPlugin());
            });

            this.attachOnResidueBulkSelectHandler((residues)=>{
                let ref = "residue-selection-T";
                if(residues.length>0){
                    let centerOfMass = CommonUtils.Residues.getCenterOfMass(
                        residues.map((val,idx,arr)=>{
                            return <MoleOnlineWebUI.Service.MoleAPI.MoleConfigResidue>{
                                Chain: val.chain.authAsymId,
                                SequenceNumber: val.authSeqNumber
                            }
                        })
                    );
                    if(centerOfMass === null){
                        return;
                    }
                    this.selectedTPoint = centerOfMass;
                    this.createTPointSelectionVisual(centerOfMass);
                }
                else{
                    this.clearSelectedTPoint();
                }
            });

            //Residue 3D OnClick
            plugin.subscribe(LiteMol.Bootstrap.Event.Molecule.ModelSelect, e => {
                if (!!e.data) {
                    let r = e.data.residues[0];
                    CommonUtils.Selection.SelectionHelper.addResidueToSelection(r.authSeqNumber,r.chain.authAsymId);
                }
            });

            LiteMol.Example.Channels.Behaviour.initCavityBoundaryToggle(plugin);
            LiteMol.Example.Channels.Behaviour.createSelectEvent(plugin).subscribe(e => {
                if ((e.kind === 'nothing')||(e.kind === 'molecule')) {
                    return
                }
                else if (e.kind === 'point') {
                    this.addPointToSelection({x:`${e.data[0].toFixed(2)}`, y:`${e.data[1].toFixed(2)}`, z:`${e.data[2].toFixed(2)}`});
                }
            });

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
            if(i.source.props.tag.kind === "Cavity-inner"||i.source.props.tag.kind === "Cavity-boundary"){
                return;
            }

            if(i.source.props.tag.kind === "Points"){
                let data = i.source.props.tag.element;
                if(i.elements===void 0){
                    return;
                }
                if(this.selectedBulkResidues!==void 0){
                    this.selectResiduesBulkWithBallsAndSticks(plugin,[]);
                }
                for(let elIdx of i.elements){
                    this.addPointToSelection(data[elIdx]);   
                }
                return;
            }

            if(i.source.props.tag.kind === "TPoint"){
                let data = i.source.props.tag.element;
                if(i.elements===void 0){
                    return;
                }
                if(this.selectedBulkResidues!==void 0){
                    this.selectResiduesBulkWithBallsAndSticks(plugin,[]);
                }
                for(let elIdx of i.elements){
                    let p = data as Point;
                    this.addPointToSelection({x:`${Number(p.X).toFixed(2)}`,y:`${Number(p.Y).toFixed(2)}`,z:`${Number(p.Z).toFixed(2)}`});
                }
                return;
            }

            if(i.source.props.tag.kind === "Origins"){
                let data = i.source.props.tag.element;
                if(i.elements===void 0){
                    return;
                }

                for(let elIdx of i.elements){
                    let p = data.Points[elIdx];
                    let pPto = {x:Number(p.X).toFixed(2),y:Number(p.Y).toFixed(2),z:Number(p.Z).toFixed(2)};
                    this.addPointToSelection(pPto);   
                }
                return;
            }

            if(this.selectedPoints !== void 0){
                this.clearSelectionPrivate(plugin);
                this.clearSelectedPoints();
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
                this.selectedChannelId = void 0;
                this.invokeOnChannelDeselectHandlers();
                //return;
            }
            else{
                //console.log("Channel selected");
                if(this.selectedChannelRef!==void 0 && this.selectedChannelRef !== i.source.ref){
                    deselectTunnelByRef(plugin,this.selectedChannelRef);    
                }
                else{
                    //Trigger Sequence Viewer to deselect selected residues
                    this.clearSelection(plugin);
                }

                this.selectedChannelRef = i.source.ref;
                this.selectedChannelData = i.source.props.tag.element.Layers;
                this.selectedChannelId = i.source.props.tag.element.Id;
                if(this.selectedChannelData!==void 0){
                    selectTunnelByRef(plugin,this.selectedChannelRef);
                    this.clearAltSelection(plugin);
                    this.invokeOnChannelSelectHandlers(this.selectedChannelData,this.selectedChannelId);
                }
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