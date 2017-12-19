namespace Controls.UI{
    import React = LiteMol.Plugin.React;
    import ReactDOM = LiteMol.Plugin.ReactDOM;
    import TunnelUtils = CommonUtils.Tunnels;
    import Provider = MoleOnlineWebUI.DataProxy.ComputationInfo.DataProvider;
    import Service = MoleOnlineWebUI.Service.MoleAPI;
    import TooltipText = MoleOnlineWebUI.StaticData.TooltipText;

    declare function $(p:any,p1?:any): any;

    let validationGroup = "SettingsFormValidatonGroup";

    interface State{
        app: App
    };

    export function render(target: Element) {
        ReactDOM.render(<App />, target);
    }

    export class App extends React.Component<{}, State> {

        state = {
            app: this
        };

        componentDidMount() {
            MoleOnlineWebUI.Bridge.Events.subscribeNewSubmit(()=>{
                this.forceUpdate();
            });
        }

        componentWillUnmount(){
        }

        render() {            
            return (
                <ControlTabs />
            );
        }
    }  

    function onFocusReplaceDefaultValidationPopup(e:any, elemId:string){
        let el = e.currentTarget as HTMLElement;
        if(el.dataset["hasReplacedValidationPopup"]!=="true"){
            replaceDefaultValidationPopup(elemId);
            el.dataset["hasReplacedValidationPopup"] = "true";
        }
    };

    function replaceDefaultValidationPopup(id:string){
        $( `#${id}` )[0]
                .addEventListener( "invalid",(event:any) => {
                    $(event.target).data("toggle","popover");
                    $(event.target).data("trigger","manual");
                    $(event.target).data("placement","left");
                    //$(event.target).data("container","body");
                    $(event.target).data("content",event.target.validationMessage);
                    $(event.target).popover("show");
                    window.setTimeout(()=>{
                        $(event.target).popover("hide");
                        $(event.target).popover("destroy");
                    },5000);
                    $(event.target).focus();

                    event.preventDefault();
                }
            );
    }

    function createCustomValidationPopup(el:HTMLElement, message:string){
        $(el)[0].validationMessage = message;

        $(el).data("toggle","popover");
        $(el).data("trigger","manual");
        $(el).data("placement","left");
        //$(el).data("container","body");
        $(el).data("content",message);
        $(el).popover("show");
        window.setTimeout(()=>{
            $(el).popover("hide");
            $(el).popover("destroy");
        },5000);
        $(el).focus();
    }

    //--

    class Cavity implements Service.MoleConfigCavity{
        public IgnoreHETAtoms:boolean
        public IgnoreHydrogens:boolean
        public InteriorThreshold:number
        public ProbeRadius:number

        public constructor(){
            this.IgnoreHETAtoms=false;
            this.IgnoreHydrogens=false;
            this.InteriorThreshold=1.1;
            this.ProbeRadius=5;
        }
    }

    class Input implements Service.MoleConfigInput{
        public ReadAllModels:boolean
        public SpecificChains:string

        public constructor(){
            this.ReadAllModels=false;
            this.SpecificChains="";
        }
    }

    class Tunnel implements Service.MoleConfigTunnel{
        public WeightFunction: string;
        public BottleneckRadius: number;
        public BottleneckTolerance: number;
        public MaxTunnelSimilarity:number;
        public OriginRadius:number;
        public SurfaceCoverRadius:number;
        public UseCustomExitsOnly:boolean;

        public constructor(){
            this.WeightFunction = "VoronoiScale";
            this.BottleneckRadius = 1.2;
            this.BottleneckTolerance = 3;
            this.MaxTunnelSimilarity = 0.7;
            this.OriginRadius = 5;
            this.SurfaceCoverRadius = 10;
            this.UseCustomExitsOnly = false;
        }
    }

    class Origin implements Service.MoleConfigOrigin{
        Points:Service.MoleConfigPoint[]|null;
        Residues:Service.MoleConfigResidue[][]|null;
        QueryExpression:string|null;

        public constructor(){
            this.Points = null;
            this.Residues = null;
            this.QueryExpression = null;
        }
    }

    class MoleFormData{
        private Input: Service.MoleConfigInput|null
        private Cavity: Service.MoleConfigCavity|null
        private Tunnel: Service.MoleConfigTunnel|null
        private NonActiveResidues: Service.MoleConfigResidue[]|null
        private QueryFilter: string|null
        private Origin: Service.MoleConfigOrigin|null
        private CustomExits: Service.MoleConfigOrigin|null
        private PoresMerged: boolean
        private PoresAuto: boolean

        public constructor(data?:Service.MoleConfig){
            if(data!==void 0&&data.Cavity!==null&&data.Cavity!==void 0){
                this.Cavity = {
                    IgnoreHETAtoms:data.Cavity.IgnoreHETAtoms,
                    InteriorThreshold: data.Cavity.InteriorThreshold,
                    IgnoreHydrogens: data.Cavity.IgnoreHydrogens,
                    ProbeRadius: data.Cavity.ProbeRadius
                };
            }
            else{
                this.Cavity=null;
            }

            if(data!==void 0&&data.CustomExits!==null&&data.CustomExits!==void 0){
                this.CustomExits = {
                    Points: (data.CustomExits.Points!==null)?data.CustomExits.Points.slice():null,
                    QueryExpression: data.CustomExits.QueryExpression,
                    Residues: (data.CustomExits.Residues!==null)?data.CustomExits.Residues.slice():null
                }
            }
            else{
                this.CustomExits = null;
            }

            if(data!==void 0&&data.Input!==null&&data.Input!==void 0){
                this.Input = {
                    ReadAllModels: data.Input.ReadAllModels,
                    SpecificChains: data.Input.SpecificChains
                }
            }
            else{
                this.Input = null;
            }

            if(data!==void 0&&data.NonActiveResidues!==null&&data.NonActiveResidues!==void 0){
                this.NonActiveResidues = data.NonActiveResidues.slice();
            }
            else{
                this.NonActiveResidues = null;
            }

            if(data!==void 0&&data.Origin!==null&&data.Origin!==void 0){
                this.Origin = {
                    Points: (data.Origin.Points!==null)?data.Origin.Points.slice():null,
                    QueryExpression: data.Origin.QueryExpression,
                    Residues: (data.Origin.Residues!==null)?data.Origin.Residues.slice():null
                }
            }
            else{
                this.Origin = null;
            }

            if(data!==void 0&&data.PoresAuto!==null&&data.PoresAuto!==void 0){
                this.PoresAuto = data.PoresAuto;
            }
            else{
                this.PoresAuto = false;
            }

            if(data!==void 0&&data.PoresMerged!==null&&data.PoresMerged!==void 0){
                this.PoresMerged = data.PoresMerged;
            }
            else{
                this.PoresMerged = false;
            }

            if(data!==void 0&&data.QueryFilter!==null&&data.QueryFilter!==void 0){
                this.QueryFilter = data.QueryFilter;
            }
            else{
                this.QueryFilter = null;
            }

            if(data!==void 0&&data.Tunnel!==null&&data.Tunnel!==void 0){
                this.Tunnel = {
                    BottleneckRadius: data.Tunnel.BottleneckRadius,
                    BottleneckTolerance: data.Tunnel.BottleneckTolerance,
                    MaxTunnelSimilarity: data.Tunnel.MaxTunnelSimilarity,
                    OriginRadius: data.Tunnel.OriginRadius,
                    SurfaceCoverRadius: data.Tunnel.SurfaceCoverRadius,
                    UseCustomExitsOnly: data.Tunnel.UseCustomExitsOnly,
                    WeightFunction: data.Tunnel.WeightFunction
                }
            }
            else{
                this.Tunnel = null;
            }            
        }

        public setIgnoreHETATMs(value:boolean){
            if(this.Cavity===null){
                this.Cavity = new Cavity();
            }
            this.Cavity.IgnoreHETAtoms = value;
        }

        public getIgnoreHETATMs(){
            if(this.Cavity===null){
                return null;
            }

            return this.Cavity.IgnoreHETAtoms;
        }

        public setIgnoreHydrogens(value:boolean){
            if(this.Cavity===null){
                this.Cavity = new Cavity();
            }
            this.Cavity.IgnoreHydrogens = value;
        }

        public getIgnoreHydrogens(){
            if(this.Cavity===null){
                return null;
            }

            return this.Cavity.IgnoreHydrogens;
        }

        public setInteriorThreshold(value:number){
            if(this.Cavity===null){
                this.Cavity = new Cavity();
            }
            this.Cavity.InteriorThreshold = value;
        }

        public getInteriorThreshold(){
            if(this.Cavity===null){
                return null;
            }
            return this.Cavity.InteriorThreshold;
        }

        public setProbeRadius(value:number){
            if(this.Cavity===null){
                this.Cavity = new Cavity();
            }
            this.Cavity.ProbeRadius = value;
        }

        public getProbeRadius(){
            if(this.Cavity===null){
                return null;
            }
            return this.Cavity.ProbeRadius;
        }

        public setReadAllModels(value:boolean){
            if(this.Input===null){
                this.Input = new Input();
            }
            this.Input.ReadAllModels = value;
        }

        public getReadAllModels(){
            if(this.Input===null){
                return null;
            }
            return this.Input.ReadAllModels;
        }

        public setSpecificChains(value:string){
            if(this.Input===null){
                this.Input = new Input();
            }
            this.Input.SpecificChains = value;
        }

        public getSpecificChains(){
            if(this.Input===null){
                return null;
            }
            return this.Input.SpecificChains;
        }

        public setOriginRadius(value:number){
            if(this.Tunnel===null){
                this.Tunnel = new Tunnel();
            }
            this.Tunnel.OriginRadius = value;
        }

        public getOriginRadius(){
            if(this.Tunnel===null){
                return null;
            }
            return this.Tunnel.OriginRadius;
        }

        public setSurfaceCoverRadius(value:number){
            if(this.Tunnel===null){
                this.Tunnel = new Tunnel();
            }
            this.Tunnel.SurfaceCoverRadius = value;
        }

        public getSurfaceCoverRadius(){
            if(this.Tunnel===null){
                return null;
            }
            return this.Tunnel.SurfaceCoverRadius;
        }

        public setWeightFunction(value:string){
            if(this.Tunnel===null){
                this.Tunnel = new Tunnel();
            }
            this.Tunnel.WeightFunction = value;
        }

        public getWeightFunction(){
            if(this.Tunnel===null){
                return null;
            }
            return this.Tunnel.WeightFunction;
        }

        public setBottleneckRadius(value:number){
            if(this.Tunnel===null){
                this.Tunnel = new Tunnel();
            }
            this.Tunnel.BottleneckRadius = value;
        }

        public getBottleneckRadius(){
            if(this.Tunnel===null){
                return null;
            }
            return this.Tunnel.BottleneckRadius;
        }

        public setBottleneckTolerance(value:number){
            if(this.Tunnel===null){
                this.Tunnel = new Tunnel();
            }
            this.Tunnel.BottleneckTolerance = value;
        }

        public getBottleneckTollerance(){
            if(this.Tunnel===null){
                return null;
            }
            return this.Tunnel.BottleneckTolerance;
        }

        public setMaxTunnelSimilarity(value:number){
            if(this.Tunnel===null){
                this.Tunnel = new Tunnel();
            }
            this.Tunnel.MaxTunnelSimilarity = value;
        }

        public getMaxTunnelSimilarity(){
            if(this.Tunnel===null){
                return null;
            }
            return this.Tunnel.MaxTunnelSimilarity;
        }

        public setMergePores(value:boolean){
            this.PoresMerged = value;
        }

        public getMergePores(){
            return this.PoresMerged;
        }

        public setAutomaticPores(value:boolean){
            this.PoresAuto = value;
        }

        public getAutomaticPores(){
            return this.PoresAuto;
        }

        public setIgnoredResidues(value:Service.MoleConfigResidue[]){
            this.NonActiveResidues = value.slice();
        }

        public getIgnoredResidues(){
            return this.NonActiveResidues;
        }

        public setQueryFilter(value:string){
            this.QueryFilter = value;
        }

        public getQueryFilter(){
            return this.QueryFilter;
        }

        private setPoints(value:Common.Controls.FromLiteMol.StartingPoint[], isStart:boolean){
            let points:Service.MoleConfigPoint[] = [];
            let residues:Service.MoleConfigResidue[][] = [];
            let query = null;

            for(let p of value){
                switch(p.type){
                    case "Point":
                        let point = p.value as Common.Controls.FromLiteMol.Point; 
                        points.push({X:Number(point.x),Y:Number(point.y),Z:Number(point.z.toString())});
                        break;
                    case "Residue":
                        let rp = (p as Common.Controls.FromLiteMol.StartingPointResidue);
                        rp.value
                        residues.push(rp.value.map((val,idx,arr)=>{return {
                            SequenceNumber: val.seqId,
                            Chain: val.chain
                        } as Service.MoleConfigResidue}));
                        break;
                    case "Query":
                        query = p.value;
                }
            }

            if(isStart){
                if(this.Origin===null){
                    this.Origin = new Origin();
                }

                this.Origin.Points = (points.length>0)?points:null;
                this.Origin.Residues = (residues.length>0)?residues:null;
                this.Origin.QueryExpression = query;            
            }
            else{
                if(this.CustomExits===null){
                    this.CustomExits = new Origin();
                }
    
                this.CustomExits.Points = (points.length>0)?points:null;
                this.CustomExits.Residues = (residues.length>0)?residues:null;
                this.CustomExits.QueryExpression = query;           
            }
        }

        public setStartingPoints(value:Common.Controls.FromLiteMol.StartingPoint[]){
            this.setPoints(value,true);
        }

        public setEndPoints(value:Common.Controls.FromLiteMol.StartingPoint[]){
            this.setPoints(value,false);
        }

        public getStartingPoints():Common.Controls.FromLiteMol.StartingPoint[]{
            if(this.Origin===null){
                return [];
            }

            let result:Common.Controls.FromLiteMol.StartingPoint[] = [];
            if(this.Origin.Points!==null){
                result = result.concat(this.Origin.Points.map((val,idx,arr)=>{
                    return {
                        type:"Point",
                        uiType:"3D Point",
                        value:new Common.Controls.FromLiteMol.Point(val.X.toString(),val.Y.toString(),val.Z.toString())
                    } as Common.Controls.FromLiteMol.StartingPointXYZ;
                }));
            }

            if(this.Origin.Residues!==null){
                result = result.concat(this.Origin.Residues.map((val,idx,arr)=>{
                    return {
                        type:"Residue",
                        uiType:"Residue List",
                        value: val.map((v,i,a)=>{
                            return new Common.Controls.FromLiteMol.Residue(v.SequenceNumber,v.Chain)
                        })
                    } as Common.Controls.FromLiteMol.StartingPointResidue
                }));
            }
            
            if(this.Origin.QueryExpression!==null){
                result.push({
                    type:"Query",
                    uiType:"PatternQuery",
                    residue: "",
                    value: this.Origin.QueryExpression
                } as Common.Controls.FromLiteMol.StartingPointQuery);
            }
            
            return result;
        }

        public getEndingPoints():Common.Controls.FromLiteMol.StartingPoint[]{
            if(this.CustomExits===null){
                return [];
            }

            let result:Common.Controls.FromLiteMol.StartingPoint[] = [];
            if(this.CustomExits.Points!==null){
                result = result.concat(this.CustomExits.Points.map((val,idx,arr)=>{
                    return {
                        type:"Point",
                        uiType:"3D Point",
                        value:new Common.Controls.FromLiteMol.Point(val.X.toString(),val.Y.toString(),val.Z.toString())
                    } as Common.Controls.FromLiteMol.StartingPointXYZ;
                }));
            }

            if(this.CustomExits.Residues!==null){
                result = result.concat(this.CustomExits.Residues.map((val,idx,arr)=>{
                    return {
                        type:"Residue",
                        uiType:"Residue List",
                        value: val.map((v,i,a)=>{
                            return new Common.Controls.FromLiteMol.Residue(v.SequenceNumber,v.Chain)
                        })
                    } as Common.Controls.FromLiteMol.StartingPointResidue
                }));
            }
            
            if(this.CustomExits.QueryExpression!==null){
                result.push({
                    type:"Query",
                    uiType:"PatternQuery",
                    residue: "",
                    value: this.CustomExits.QueryExpression
                } as Common.Controls.FromLiteMol.StartingPointQuery);
            }
            
            return result;
        }

        //--

        public getPackage():Service.MoleConfig{
            return {
                Cavity: (this.Cavity===null)?void 0:this.Cavity,
                CustomExits: this.CustomExits,
                Input: (this.Input===null)?void 0:this.Input,
                NonActiveResidues: this.NonActiveResidues,
                Origin: this.Origin,
                PoresAuto: this.PoresAuto,
                PoresMerged: this.PoresMerged,
                QueryFilter: this.QueryFilter,
                Tunnel: (this.Tunnel===null)?void 0:this.Tunnel
            }
        }
    }

    class PoresFormData{
        private InMembrane: boolean;
        private IsBetaBarel: boolean;
        private Chains: string|null

        public constructor(data?:Service.PoresConfig){
            if(data!==void 0&&data.InMembrane!==null&&data.InMembrane!==void 0){
                this.InMembrane = data.InMembrane;
            }
            else{
                this.InMembrane=false;
            }

            if(data!==void 0&&data.IsBetaBarel!==null&&data.IsBetaBarel!==void 0){
                this.IsBetaBarel = data.IsBetaBarel;
            }
            else{
                this.IsBetaBarel=false;
            }

            if(data!==void 0&&data.Chains!==null&&data.Chains!==void 0){
                this.Chains = data.Chains;
            }
            else{
                this.Chains=null;
            }
        }

        public setBetaStructure(value:boolean){
            this.IsBetaBarel = value;
        }

        public getBetaStructure(){
            return this.IsBetaBarel;
        }

        public setMembraneRegion(value:boolean){
            this.InMembrane = value;
        }

        public getMembraneRegion(){
            return this.InMembrane;
        }

        public setSpecificChains(value:string){
            this.Chains = value;
        }

        public getSpecificChains(){
            return this.Chains;
        }

        //--

        public getPackage():Service.PoresConfig{
            return {
                Chains: this.Chains,
                InMembrane: this.InMembrane,
                IsBetaBarel: this.IsBetaBarel
            }
        }
    }

    //--

    interface SettingsProps{
        initialData:Service.CompInfo, 
        submitId:number,
        parent: ControlTabs,
    }

    interface ExpandedPanels{
        activeAtomsResidues:boolean,
        activeAtomsResiduesAdvanced:boolean,
        cavityParameters:boolean,
        channelParameters:boolean,
        channelParametersAdvanced:boolean,
        selection:boolean
    }

    interface SettingsState{
        pdbid:string,
        computationId:string,
        moleFormData:MoleFormData,
        poresFormData:PoresFormData,
        mode:"Mole"|"Pores",
        expandedPanels:ExpandedPanels
    };
    export class Settings extends React.Component<SettingsProps,SettingsState>{

        state:SettingsState = {
            moleFormData:this.getMoleDefaultValues(),
            poresFormData:this.getPoresDefaultValues(),
            pdbid:this.props.initialData.PdbId,
            computationId:this.props.initialData.ComputationId,
            mode:"Mole",
            expandedPanels:{
                activeAtomsResidues:true,
                activeAtomsResiduesAdvanced:false,
                cavityParameters:false,
                channelParameters:false,
                channelParametersAdvanced:false,
                selection:true
            }
        }

        getMoleDefaultValues(){
            let data = new MoleFormData();

            data.setIgnoreHETATMs(true);
            data.setIgnoreHydrogens(false);
            //data.setQueryFilter("");
            data.setReadAllModels(false);
            //data.setIgnoredResidues([]);
            //data.setSpecificChains("");
            data.setProbeRadius(5);
            data.setInteriorThreshold(1.1);
            data.setOriginRadius(5);
            data.setSurfaceCoverRadius(10);
            data.setWeightFunction("VoronoiScale");
            data.setMergePores(false);
            data.setAutomaticPores(false);
            data.setBottleneckRadius(1.2);
            data.setBottleneckTolerance(3);
            data.setMaxTunnelSimilarity(0.7);

            return data;
        }

        getPoresDefaultValues(){
            let data = new PoresFormData();

            data.setBetaStructure(false);
            data.setMembraneRegion(false);
            //data.setSpecificChains("");

            return data;
        }

        handleSubmitPromise(promise:any){
            promise
            .then((result:any)=>{                    
                if(result.Status==="Error"){
                    let state = this.props.parent.state;
                    state.canSubmit=true;
                    this.props.parent.setState(state);

                    MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                        messageType: "Danger",
                        message: result.ErrorMsg
                    })
                }
                else{
                    CommonUtils.Router.fakeRedirect(result.ComputationId, String(result.SubmitId));
                    LiteMol.Example.Channels.State.removeChannelsData(MoleOnlineWebUI.Bridge.Instances.getPlugin());                

                    Provider.get(result.ComputationId,((compId:string,info:MoleOnlineWebUI.Service.MoleAPI.CompInfo)=>{
                        MoleOnlineWebUI.DataProxy.JobStatus.Watcher.registerOnChangeHandler(result.ComputationId,result.SubmitId,(status)=>{
                            if(checkCanSubmit(status.Status)){
                                MoleOnlineWebUI.Bridge.Events.invokeToggleLoadingScreen({
                                    message:"",
                                    visible:false
                                });

                                let state = this.props.parent.state;
                                state.canSubmit=true;
                                this.props.parent.setState(state);
                            }
                        },(err)=>{
                            MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                messageType: "Danger",
                                message: "Job status cannot be tracked. Please try to refresh the page."
                            })    
                        })

                        let state = this.props.parent.state;
                        state.data=info;
                        this.props.parent.setState(state);
                        
                        MoleOnlineWebUI.Bridge.Events.invokeNewSubmit();
                        MoleOnlineWebUI.Bridge.Events.invokeChangeSubmitId(Number(result.SubmitId));
                        //CommonUtils.FormEvents.Events.invokeOnClear(`${validationGroup}/selection`);

                    }).bind(this), true);
                    /*MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                        messageType: "Success",
                        message: "Job was successfully submited."
                    })*/
                    MoleOnlineWebUI.Bridge.Events.invokeToggleLoadingScreen({
                        message:"Submited job in progress...",
                        visible:true
                    });
                }
            })
            .catch((err:any)=>{
                let state = this.props.parent.state;
                state.canSubmit=true;
                this.props.parent.setState(state);

                if(Config.CommonOptions.DEBUG_MODE)
                    console.log(err);
                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                    messageType: "Danger",
                    message: "Job submit was not completed succesfully! Please try again later."
                })
            })
        }

        componentDidMount(){  
            CommonUtils.FormEvents.Events.attachOnSubmitEventHandler((formGroup)=>{
                if(formGroup!==validationGroup){
                    return;
                }
                let promise;
                
                if(this.state.mode==="Mole"){
                    promise = Service.ApiService.submitMoleJob(this.state.computationId, this.state.moleFormData.getPackage())
                }
                else{
                    promise = Service.ApiService.submitPoresJob(this.state.computationId, this.state.poresFormData.getPackage())
                }

                this.handleSubmitPromise(promise);
            })

            MoleOnlineWebUI.Bridge.Events.subscribeOnReSubmit((promise)=>{
                this.handleSubmitPromise(promise);
            })

            CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                if(formGroup!==validationGroup){
                    return;
                }
                Common.Controls.FromLiteMol.ValidationState.reset(validationGroup);
                let s = this.state;
                s.moleFormData = this.getMoleDefaultValues();
                s.poresFormData = this.getPoresDefaultValues();
                this.setState(s);
            })

            MoleOnlineWebUI.Bridge.Events.subscribeCopyParameters((params:MoleOnlineWebUI.Bridge.CopyParametersParams)=>{
                    let s1 = this.props.parent.state;            
                    this.props.parent.setState({
                        activeTabIdx:0,
                        submitId:s1.submitId,
                        canSubmit:s1.canSubmit,
                        data:s1.data,
                        err:s1.err
                    } ,()=>{this.setState({
                        computationId:this.state.computationId,
                        pdbid:this.state.pdbid,
                        moleFormData:this.state.moleFormData,
                        poresFormData:this.state.poresFormData,
                        mode:(params.mode==="mole")?"Pores":"Mole", //Change to oposite mode to final desired mode to trigger subcomponent re-render
                        expandedPanels:this.state.expandedPanels
                    },()=>{
                        this.setState({
                            computationId:this.state.computationId,
                            pdbid:this.state.pdbid,
                            moleFormData:(params.mode==="mole"&&params.moleConfig!==null)?new MoleFormData(params.moleConfig):this.getMoleDefaultValues(),
                            poresFormData:(params.mode==="pores"&&params.poresConfig!==null)?new PoresFormData(params.poresConfig):this.getPoresDefaultValues(), 
                            mode:(params.mode==="mole")?"Mole":"Pores", //Change to correct and final mode to trigger subcomponent re-render
                            expandedPanels:this.state.expandedPanels
                        })});
                    });
            });
        }

        render(){
            let form = <div/>;

            if(this.state.mode==="Mole"){
                form = this.getMoleForm();
            }
            else if (this.state.mode==="Pores"){
                form = this.getPoresForm();
            }

            return (
                <div>
                    <div className="mode-switch-button-container">
                        <span className="btn-sm btn-primary mode-switch" onClick={(e)=>{
                                let state = this.state;
                                state.mode = (this.state.mode==="Mole")?"Pores":"Mole";
                                this.setState(state);
                            }}>Switch to {(this.state.mode==="Mole")?"Pores":"Mole"} calculation</span>
                    </div>
                    {form}
                </div>
            );
        }

        getPatternQueryHint(){
            return {link:"https://webchem.ncbr.muni.cz/Wiki/PatternQuery:UserManual",title:"See PatternQuery manual for help."}
        } 
        
        getMoleForm(){
            if(this.state.moleFormData===null){
                return <div/>
            }

            let pdbid = this.state.pdbid;
            let data = this.state.moleFormData;
            return <div className="settings-form basic-settings">
                        <h3>Mole</h3>

                        <Common.Controls.FromLiteMol.LMControlWrapper controls={[
                            <Common.Controls.FromLiteMol.ControlGroup label="Active Atoms/Residues" tooltip="" controls={[
                                <Common.Controls.FromLiteMol.CheckBox label="Ignore HETATMs" defaultValue={valueOrDefault(data.getIgnoreHETATMs(),true)} tooltip={TooltipText.get("ignoreAllHetatm")} onChange={(v)=>{
                                    let s = this.state;
                                    if(s.moleFormData!==null){
                                        s.moleFormData.setIgnoreHETATMs(v);
                                    }
                                }} onMount={(control)=>{
                                    (()=>{
                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                                            if(formGroup!==validationGroup){
                                                return;
                                            }
                                            control.reset();
                                        });
                                    }).bind(control)();
                                }} />,                                
                                <Common.Controls.FromLiteMol.ControlGroup label="Advanced options" tooltip="" controls={[
                                    <Common.Controls.FromLiteMol.CheckBox label="Ignore Hydrogens" defaultValue={valueOrDefault(data.getIgnoreHydrogens(),false)} tooltip={TooltipText.get("ignoreHydrogens")} onChange={(v)=>{
                                        let s = this.state;
                                        if(s.moleFormData!==null){
                                            s.moleFormData.setIgnoreHydrogens(v);
                                        }
                                    }} onMount={(control)=>{
                                        (()=>{
                                            CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                                                if(formGroup!==validationGroup){
                                                    return;
                                                }
                                                control.reset();
                                            });
                                        }).bind(control)();
                                    }} />,
                                    <Common.Controls.FromLiteMol.TextBoxWithHelp label="Query Filter" tooltip={TooltipText.get("queryFilter")} placeholder="Residues('GOL')" hint={this.getPatternQueryHint()} defaultValue={valueOrDefault(data.getQueryFilter(),"")} onChange={(v)=>{
                                        let s = this.state;
                                        if(s.moleFormData!==null){
                                            s.moleFormData.setQueryFilter(v);
                                        }
                                    }} onMount={(control)=>{
                                        (()=>{
                                            CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{      
                                                if(formGroup!==validationGroup){
                                                    return;
                                                }                                          
                                                control.reset();
                                            });
                                        }).bind(control)();
                                    }}  validate={CommonUtils.Validators.validatePatternQuery} validationGroup={validationGroup} />,
                                    <Common.Controls.FromLiteMol.CheckBox label="Read All Models" defaultValue={valueOrDefault(data.getReadAllModels(),false)} tooltip={TooltipText.get("readAllModels")} onChange={(v)=>{
                                        let s = this.state;
                                        if(s.moleFormData!==null){
                                            s.moleFormData.setReadAllModels(v);
                                        }
                                    }} onMount={(control)=>{
                                        (()=>{
                                            CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                                                if(formGroup!==validationGroup){
                                                    return;
                                                }
                                                control.reset();
                                            });
                                        }).bind(control)();
                                    }}  />,
                                    <Common.Controls.FromLiteMol.TextBox label="Ignored Residues" tooltip={TooltipText.get("nonActiveResidues")} placeholder="A 69, A 386, ..." defaultValue={CommonUtils.Misc.flattenResidues(valueOrDefault(data.getIgnoredResidues(),""))} onChange={(v)=>{    
                                        let s = this.state;
                                        if(s.moleFormData!==null){
                                            s.moleFormData.setIgnoredResidues(CommonUtils.Misc.parseResidues(v));
                                        }
                                    }} onMount={(control)=>{
                                        (()=>{
                                            CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                                                if(formGroup!==validationGroup){
                                                    return;
                                                }
                                                control.reset();
                                            });
                                        }).bind(control)();
                                    }}  validate={CommonUtils.Validators.validateResidueSimpleArray} validationGroup={validationGroup} />,
                                    <Common.Controls.FromLiteMol.TextBox label="Specific Chains" tooltip={TooltipText.get("specificChains")} placeholder="A, B, ..." defaultValue={valueOrDefault(data.getSpecificChains(),"")} onChange={(v)=>{
                                        let s = this.state;
                                        if(s.moleFormData!==null){
                                            s.moleFormData.setSpecificChains(v);
                                        }
                                    }} onMount={(control)=>{
                                        (()=>{
                                            CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                                                if(formGroup!==validationGroup){
                                                    return;
                                                }
                                                control.reset();
                                            });
                                        }).bind(control)();
                                    }}  validate={CommonUtils.Validators.validateChainsArray} validationGroup={validationGroup} />
                                ]} expanded={this.state.expandedPanels.activeAtomsResiduesAdvanced} onChange={(e)=>{
                                    let s = this.state;
                                    s.expandedPanels.activeAtomsResiduesAdvanced = e;
                                    this.setState(s);
                                }} />,
                            ]} expanded={this.state.expandedPanels.activeAtomsResidues} onChange={(e)=>{
                                let s = this.state;
                                s.expandedPanels.activeAtomsResidues = e;
                                if(e===false){
                                    s.expandedPanels.activeAtomsResiduesAdvanced = false;
                                }
                                this.setState(s);
                            }} />,
                            <Common.Controls.FromLiteMol.ControlGroup label="Cavity Parameters" tooltip="" controls={[
                                <Common.Controls.FromLiteMol.NumberBox label="Probe Radius" tooltip={TooltipText.get("probeRadius")} min={1.4} max={45} defaultValue={valueOrDefault(data.getProbeRadius(),5)} step={0.01} onChange={(v)=>{
                                    let s = this.state;
                                    if(s.moleFormData!==null){
                                        s.moleFormData.setProbeRadius(Number(v).valueOf());
                                    }
                                }} onMount={(control)=>{
                                    (()=>{
                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                                            if(formGroup!==validationGroup){
                                                return;
                                            }
                                            control.reset();
                                        });
                                    }).bind(control)();
                                }}  />,
                                <Common.Controls.FromLiteMol.NumberBox label="Interior Treshold" tooltip={TooltipText.get("interiorTreshold")} min={0.3} max={3} defaultValue={valueOrDefault(data.getInteriorThreshold(),1.1)} step={0.01} onChange={(v)=>{
                                    let s = this.state;
                                    if(s.moleFormData!==null){
                                        s.moleFormData.setInteriorThreshold(Number(v).valueOf());
                                    }
                                }} onMount={(control)=>{
                                    (()=>{
                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                                            if(formGroup!==validationGroup){
                                                return;
                                            }
                                            control.reset();
                                        });
                                    }).bind(control)();
                                }}  />
                            ]} expanded={this.state.expandedPanels.cavityParameters} onChange={(e)=>{
                                let s = this.state;
                                s.expandedPanels.cavityParameters = e;
                                this.setState(s);
                            }} />,
                            <Common.Controls.FromLiteMol.ControlGroup label="Channel Parameters" tooltip="" controls={[
                                <Common.Controls.FromLiteMol.NumberBox label="Origin Radius" tooltip={TooltipText.get("originRadius")} min={0.1} max={10} defaultValue={valueOrDefault(data.getOriginRadius(),5)} step={0.05} onChange={(v)=>{
                                    let s = this.state;
                                    if(s.moleFormData!==null){
                                        s.moleFormData.setOriginRadius(Number(v).valueOf());
                                    }
                                }} onMount={(control)=>{
                                    (()=>{
                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                                            if(formGroup!==validationGroup){
                                                return;
                                            }
                                            control.reset();
                                        });
                                    }).bind(control)();
                                }} />,
                                <Common.Controls.FromLiteMol.NumberBox label="Surface Cover Radius" tooltip={TooltipText.get("surfaceCoverRadius")} min={5} max={20} defaultValue={valueOrDefault(data.getSurfaceCoverRadius(),10)} step={0.5} onChange={(v)=>{
                                    let s = this.state;
                                    if(s.moleFormData!==null){
                                        s.moleFormData.setSurfaceCoverRadius(Number(v).valueOf());
                                    }
                                }} onMount={(control)=>{
                                    (()=>{
                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                                            if(formGroup!==validationGroup){
                                                return;
                                            }
                                            control.reset();
                                        });
                                    }).bind(control)();
                                }}  />,
                                <Common.Controls.FromLiteMol.ComboBox label="Weight Function" tooltip={TooltipText.get("tunnelWeightFunction")} items={MoleOnlineWebUI.StaticData.WeightFunctions.get().map((val,idx,arr)=>{return new Common.Controls.FromLiteMol.ComboBoxItem(val.value,val.label)})} selectedValue={valueOrDefault(data.getWeightFunction(),"VoronoiScale")} onChange={(v)=>{
                                    let s = this.state;
                                    if(s.moleFormData!==null){
                                        s.moleFormData.setWeightFunction(v);
                                    }
                                }} onMount={(control)=>{
                                    (()=>{
                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                                            if(formGroup!==validationGroup){
                                                return;
                                            }
                                            control.reset();
                                        });
                                    }).bind(control)();
                                }}  />,                            
                                <Common.Controls.FromLiteMol.CheckBox label="Merge Pores" defaultValue={valueOrDefault(data.getMergePores(),false)} tooltip={TooltipText.get("mergePores")} onChange={(v)=>{
                                    let s = this.state;
                                    if(s.moleFormData!==null){
                                        s.moleFormData.setMergePores(v);
                                    }
                                }} onMount={(control)=>{
                                    (()=>{
                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                                            if(formGroup!==validationGroup){
                                                return;
                                            }
                                            control.reset();
                                        });
                                    }).bind(control)();
                                }}  />,
                                <Common.Controls.FromLiteMol.CheckBox label="Automatic Pores" defaultValue={valueOrDefault(data.getAutomaticPores(),false)} tooltip={TooltipText.get("automaticPores")} onChange={(v)=>{
                                    let s = this.state;
                                    if(s.moleFormData!==null){
                                        s.moleFormData.setAutomaticPores(v);
                                    }
                                }} onMount={(control)=>{
                                    (()=>{
                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                                            if(formGroup!==validationGroup){
                                                return;
                                            }
                                            control.reset();
                                        });
                                    }).bind(control)();
                                }}  />,
                                <Common.Controls.FromLiteMol.ControlGroup label="Advanced options" tooltip="" controls={[
                                    <Common.Controls.FromLiteMol.NumberBox label="Bottleneck Radius" tooltip={TooltipText.get("bottleneckRadius")} min={0} max={5} defaultValue={valueOrDefault(data.getBottleneckRadius(),1.2)} step={0.01} onChange={(v)=>{
                                        let s = this.state;
                                        if(s.moleFormData!==null){
                                            s.moleFormData.setBottleneckRadius(Number(v).valueOf());
                                        }
                                    }} onMount={(control)=>{
                                        (()=>{
                                            CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                                                if(formGroup!==validationGroup){
                                                    return;
                                                }
                                                control.reset();
                                            });
                                        }).bind(control)();
                                    }}  />,
                                    <Common.Controls.FromLiteMol.NumberBox label="Bottleneck Tolerance" tooltip={TooltipText.get("bottleneckTolerance")} min={0} max={5} defaultValue={valueOrDefault(data.getBottleneckTollerance(),3.0)} step={0.1} onChange={(v)=>{
                                        let s = this.state;
                                        if(s.moleFormData!==null){
                                            s.moleFormData.setBottleneckTolerance(Number(v).valueOf());
                                        }
                                    }} onMount={(control)=>{
                                        (()=>{
                                            CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                                                if(formGroup!==validationGroup){
                                                    return;
                                                }
                                                control.reset();
                                            });
                                        }).bind(control)();
                                    }}  />,
                                    <Common.Controls.FromLiteMol.NumberBox label="Max Tunnel Similarity" tooltip={TooltipText.get("maxTunnelSimilarity")} min={0} max={1} defaultValue={valueOrDefault(data.getMaxTunnelSimilarity(),0.7)} step={0.05} onChange={(v)=>{
                                        let s = this.state;
                                        if(s.moleFormData!==null){
                                            s.moleFormData.setMaxTunnelSimilarity(Number(v));
                                        }
                                    }} onMount={(control)=>{
                                        (()=>{
                                            CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                                                if(formGroup!==validationGroup){
                                                    return;
                                                }
                                                control.reset();
                                            });
                                        }).bind(control)();
                                    }}  />
                                ]} expanded={this.state.expandedPanels.channelParametersAdvanced} onChange={(e)=>{
                                    let s = this.state;
                                    s.expandedPanels.channelParametersAdvanced = e;
                                    this.setState(s);
                                }} />
                            ]} expanded={this.state.expandedPanels.channelParameters} onChange={(e)=>{
                                let s = this.state;
                                s.expandedPanels.channelParameters = e;
                                if(e===false){
                                    s.expandedPanels.channelParametersAdvanced = false;
                                }
                                this.setState(s);
                            }} />,
                            <Common.Controls.FromLiteMol.ControlGroup label="Selection" tooltip="" controls={[
                                <Common.Controls.FromLiteMol.StartingPointBox label="Starting Point" tooltip={TooltipText.get("startingPoint")} defaultItems={this.state.moleFormData.getStartingPoints()} noDataText={"No starting points selected..."} onChange={(v)=>{
                                    let s = this.state;
                                    if(s.moleFormData!==null){
                                        s.moleFormData.setStartingPoints(v);
                                    }
                                }} formGroup={validationGroup} extraClearGroup={`${validationGroup}/selection`} allowPatternQuery={true} />,
                                <Common.Controls.FromLiteMol.StartingPointBox label="End Point" tooltip={TooltipText.get("endPoint")} defaultItems={this.state.moleFormData.getEndingPoints()} noDataText={"No end points selected..."} onChange={(v)=>{
                                    let s = this.state;
                                    if(s.moleFormData!==null){
                                        s.moleFormData.setEndPoints(v);
                                    }
                                }} formGroup={validationGroup} extraClearGroup={`${validationGroup}/selection`} allowPatternQuery={false} />,
                            ]} expanded={this.state.expandedPanels.selection} onChange={(e)=>{
                                let s = this.state;
                                s.expandedPanels.selection = e;
                                this.setState(s);
                            }} />
                        ]} />
                    </div>
        }

        getPoresForm(){

            if(this.state.poresFormData===null){
                return <div/>
            }

            let data = this.state.poresFormData;
            let chains = data.getSpecificChains();
            if(chains===null){
                chains = "";
            }

            let pdbid = this.state.pdbid;

            return <div className="settings-form basic-settings pores">
                        <h3>Pores</h3>
                        <Common.Controls.FromLiteMol.LMControlWrapper controls={[
                            <Common.Controls.FromLiteMol.CheckBox label="Beta Structure" defaultValue={data.getBetaStructure()} tooltip={TooltipText.get("poresIsBetaStructure")} onChange={(val)=>{
                                if(this.state.poresFormData!==null){
                                    this.state.poresFormData.setBetaStructure(val);
                                }
                            }} />,
                            <Common.Controls.FromLiteMol.CheckBox label="Membrane Region" defaultValue={data.getMembraneRegion()} tooltip={TooltipText.get("poresInMembrane")} onChange={(val)=>{
                                if(this.state.poresFormData!==null){
                                    this.state.poresFormData.setMembraneRegion(val);
                                }
                            }} />,
                            <Common.Controls.FromLiteMol.TextBox label="Specific Chains" defaultValue={chains} tooltip={TooltipText.get("poresChains")} placeholder="A, B, ..." /*onValidate={this.validateChainsArray}*/ onChange={(val)=>{
                                if(this.state.poresFormData!==null){
                                    this.state.poresFormData.setSpecificChains(val);
                                }
                            }} />
                        ]} />

                    </div>
        }
    }

    function valueOrDefault(value:any|null,def:any){
        return (value===null)?def:value;
    }

    function getSubmissionIdx(compInfo:Service.CompInfo,submitId:number):number|null{
        for(let idx=0;idx<compInfo.Submissions.length;idx++){
            if(String(compInfo.Submissions[idx].SubmitId)===String(submitId)){
                return idx;
            }
        }
        return null;
    }

    interface SubmissionsProps{
        computationInfo:Service.CompInfo,
        onResubmit:(info:Service.CompInfo)=>void
    };
    interface SubmissionsState{
        computationInfo:Service.CompInfo|null,
        loading:boolean,
        channelsDBData:DataInterface.ChannelsDBChannels|null
    };
    export class Submissions extends React.Component<SubmissionsProps,SubmissionsState>{
        
        state:SubmissionsState = {computationInfo:null,loading:true,channelsDBData:null}
        private hasKillable = false;
        
        componentWillReceiveProps(nextProps:{computationInfo:Service.CompInfo}){
            this.prepareSubmissionData(nextProps.computationInfo);
        }

        private prepareSubmissionData(computationInfo:Service.CompInfo){
            let state_ = this.state;
            state_.computationInfo = computationInfo;
            this.setState(state_);
            
            let hasKillable = false;

            if(computationInfo.PdbId!==null&&computationInfo.PdbId!==null){
                MoleOnlineWebUI.Cache.ChannelsDBData.doWhenCached(computationInfo.PdbId)
                    .then(()=>{
                        MoleOnlineWebUI.Cache.ChannelsDBData.getChannelsData(computationInfo.PdbId)
                            .then(val=>{
                                let s = this.state;
                                s.channelsDBData = val;
                                this.setState(s);
                            })
                            .catch(err=>{
                                console.log(err);
                            })
                    })
                    .catch(err=>{
                        console.log(err);
                    });
            }

            for(let submission of computationInfo.Submissions){
                if(submission.Status!=="Initializing"&&submission.Status!=="Running"){
                    //Skip submission state check loop for submissions in stable and terminal state
                    continue;
                }
                hasKillable = true;
                MoleOnlineWebUI.DataProxy.JobStatus.Watcher.registerOnChangeHandler(this.props.computationInfo.ComputationId, submission.SubmitId,(state)=>{
                        let oldStatus = submission.Status;

                        if(oldStatus===void 0||oldStatus!==state.Status){                                    
                            let s = this.state;
                            let currentCompInfo = s.computationInfo;
                            if(currentCompInfo===null){
                                console.log(`Computation info was not initialized corectly.`);
                                return;
                            }
                            let subIdx = getSubmissionIdx(currentCompInfo,submission.SubmitId);
                            if(subIdx===null){
                                console.log(`Submission with id'${submission.SubmitId}' not found.`);
                                return;
                            }
                            currentCompInfo.Submissions[subIdx].Status = state.Status;
                            s.computationInfo = currentCompInfo;
                            this.setState(s);
                            if(oldStatus!==void 0){
                                let hasKillable_ = this.checkHasKillable(currentCompInfo);
                                if(this.hasKillable!==hasKillable_){
                                    this.hasKillable = hasKillable_;
                                    MoleOnlineWebUI.Bridge.Events.invokeChangeHasKillable(hasKillable_);
                                }    
                            }
                        }
                    },(err)=>{
                        if(Config.CommonOptions.DEBUG_MODE)
                            console.log(err);
                    }
                );
            }
            this.hasKillable = hasKillable;

            let state = this.state;
            state.loading = false;
            this.setState(state);

            if(hasKillable){
                MoleOnlineWebUI.Bridge.Events.invokeChangeHasKillable(hasKillable);
            }
        }

        private checkHasKillable(compInfo:Service.CompInfo){
            let hasKillable = false;
            for(let submission of compInfo.Submissions){
                if(submission.Status==="Running"){
                    hasKillable = true;
                    return hasKillable;
                }
            }
            return hasKillable;
        }

        componentDidMount(){
            this.prepareSubmissionData(this.props.computationInfo);
        }

        render(){
            if(this.state.computationInfo!==null&&!this.state.loading){
                let submissions:JSX.Element[] = [];
                let submissionsData = this.state.computationInfo.Submissions;
                let submitId = 1;
                let isChannelsDBSelected = false;
                let params = CommonUtils.Router.getParameters();
                if(params!==null){
                    submitId=(params.isChannelsDB)?-1:params.submitId;
                    isChannelsDBSelected = params.isChannelsDB;
                }

                if(this.state.channelsDBData!==null){
                    submissions.push(
                        <ChannelsDBSubmission pdbid={this.state.computationInfo.PdbId} isSelected={isChannelsDBSelected} computationId={this.props.computationInfo.ComputationId}/>
                    );
                }

                for(let s of submissionsData.sort((a,b)=>{
                    return a.SubmitId-b.SubmitId;
                })){
                    let stat = s.Status;

                    submissions.push(
                        <Submission data={s} currentSubmitId={submitId} computationId={this.props.computationInfo.ComputationId} status={(stat===void 0)?"Unknown":stat} onResubmit={this.props.onResubmit} onCopy={(submitId:number)=>{
                            for(let submission of this.props.computationInfo.Submissions){
                                if(submission.SubmitId.toString()===submitId.toString()){
                                    MoleOnlineWebUI.Bridge.Events.invokeCopyParameters({
                                        mode:(CommonUtils.Misc.isMoleJob(submission))?"mole":"pores",
                                        moleConfig:submission.MoleConfig,
                                        poresConfig:submission.PoresConfig
                                    });
                                    return;
                                }
                            }
                        }} />
                    );
                }

                if(submissions.length===0){
                    return (
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                <h4 className="panel-title">
                                    No submissions found.
                                </h4>
                            </div>
                        </div>
                    );
                }

                return (
                <div className="panel-group submissions">
                    {submissions}
                </div>
                );
            }
            else if(this.state.loading){
                return (
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <h4 className="panel-title">
                                No submissions data available.
                            </h4>
                        </div>
                    </div>
                )
            }
            else{
                return (
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <h4 className="panel-title">
                                Submissions data loading...
                            </h4>
                        </div>
                    </div>
                )
            }
        }
    }
    /*
    function flattenResiduesArray(residuesArray:Service.MoleConfigResidue[][]):string{
        let rv = "";
        let idx=0;
        for(let array of residuesArray){
            if(idx>0){
                rv = `${rv}, `;
            }
            rv = `${rv}[${flattenResidues(array)}]`;
            idx++;
        }
        return rv;
    }

    function flattenResidues(residues:Service.MoleConfigResidue[]):string{
        let rv = "";
        for(let r of residues){
            if(rv !== ""){
                rv+=", ";
            }
            rv+=`${r.Chain} ${r.SequenceNumber}`;
        }
        return rv;
    }*/

    function checkCanKill(status:Service.ComputationStatus){
        let result = false;
        switch(status as Service.ComputationStatus){
            case "Running":
                result = true;
                break;
        }
        return result;
    }

    function checkCanSubmit(status:Service.ComputationStatus){
        return !checkCanKill(status);
    }

    function checkCanDelete(status:Service.ComputationStatus){
        let result = false;
        switch(status as Service.ComputationStatus){
            case "Aborted":
            case "Error":
            case "FailedInitialization":
            case "Finished":
            case "Initialized":
                result = true;
                break;
            case "Running":
            case "Initializing":
                result = false;
                break;
        }
        return result;
    }

    function checkCanResubmit(status:Service.ComputationStatus){
        let result = false;
        switch(status as Service.ComputationStatus){
            case "Aborted":
            case "Error":
            case "FailedInitialization":
            case "Finished":
            case "Initialized":
                result = true;
                break;
            case "Running":
            case "Initializing":
            case "Deleted":
                result = false;
                break;
        }
        return result;
    }

    export class Submission extends React.Component<{data:Service.Submission, computationId:string, status:string, currentSubmitId:number, onCopy:(submitId:number)=>void,onResubmit:(info:Service.CompInfo)=>void},{}>{
        
        componentDidMount(){
        }

        getMoleJob(data:Service.Submission){
            return <div className="panel-body">
                <h4>Active Atoms/Residues</h4>
                Ignore Hydrogens: {(data.MoleConfig.Cavity===void 0)?"False":(data.MoleConfig.Cavity.IgnoreHydrogens)?"True":"False"}<br/>
                Ignore HETATMs: {(data.MoleConfig.Cavity===void 0)?"False":(data.MoleConfig.Cavity.IgnoreHETAtoms)?"True":"False"}<br/>
                Query Filter: {(data.MoleConfig.QueryFilter===void 0)?"":data.MoleConfig.QueryFilter}<br/>
                Read All Models: {(data.MoleConfig.Input===void 0)?"False":(data.MoleConfig.Input.ReadAllModels)?"True":"False"}<br/>
                Ignored Residues: {(data.MoleConfig.NonActiveResidues===void 0||data.MoleConfig.NonActiveResidues===null)?"":CommonUtils.Misc.flattenResidues(data.MoleConfig.NonActiveResidues)}<br/>                
                Specific Chains: {(data.MoleConfig.Input===void 0)?"":data.MoleConfig.Input.SpecificChains}<br/>                
                <h4>Cavity Parameters</h4>
                Probe Radius: {(data.MoleConfig.Cavity===void 0)?"":data.MoleConfig.Cavity.ProbeRadius}<br/>
                Interior Threshold: {(data.MoleConfig.Cavity===void 0)?"":data.MoleConfig.Cavity.InteriorThreshold}<br/>
                <h4>Channel Parameters</h4>
                Origin Radius: {(data.MoleConfig.Tunnel===void 0 || data.MoleConfig.Tunnel===null)?"":data.MoleConfig.Tunnel.OriginRadius}<br/>
                Surface Cover Radius: {(data.MoleConfig.Tunnel===void 0 || data.MoleConfig.Tunnel===null)?"":data.MoleConfig.Tunnel.SurfaceCoverRadius}<br/>
                Weight Function: {(data.MoleConfig.Tunnel===void 0 || data.MoleConfig.Tunnel===null)?"":data.MoleConfig.Tunnel.WeightFunction}<br/>
                Bottleneck Radius: {(data.MoleConfig.Tunnel===void 0 || data.MoleConfig.Tunnel===null)?"":data.MoleConfig.Tunnel.BottleneckRadius}<br/>
                Bottleneck Tolerance: {(data.MoleConfig.Tunnel===void 0 || data.MoleConfig.Tunnel===null)?"":data.MoleConfig.Tunnel.BottleneckTolerance}<br/>
                Max Tunnel Similarity: {(data.MoleConfig.Tunnel===void 0 || data.MoleConfig.Tunnel===null)?"":data.MoleConfig.Tunnel.MaxTunnelSimilarity}<br/>
                Merge Pores: {(data.MoleConfig.PoresMerged===void 0 || data.MoleConfig.PoresMerged===null)?"False":(data.MoleConfig.PoresMerged)?"True":"False"}<br/>
                Automatic Pores: {(data.MoleConfig.PoresAuto===void 0 || data.MoleConfig.PoresAuto===null)?"False":(data.MoleConfig.PoresAuto)?"True":"False"}<br/>               
                <h4>Selection</h4>
                Starting Point: {(data.MoleConfig.Origin===void 0 || data.MoleConfig.Origin===null)?"":(data.MoleConfig.Origin.Residues===void 0 || data.MoleConfig.Origin.Residues===null || data.MoleConfig.Origin.Residues.length===0)?"":CommonUtils.Misc.flattenResiduesArray(data.MoleConfig.Origin.Residues)}<br/>
                Starting Point[x,y,z]: {(data.MoleConfig.Origin===void 0 || data.MoleConfig.Origin===null)?"":(data.MoleConfig.Origin.Points===void 0 || data.MoleConfig.Origin.Points===null)?"":CommonUtils.Misc.pointsToString(data.MoleConfig.Origin.Points)}<br/>
                End Point: {(data.MoleConfig.CustomExits===void 0 || data.MoleConfig.CustomExits===null)?"":(data.MoleConfig.CustomExits.Residues===void 0 || data.MoleConfig.CustomExits.Residues===null || data.MoleConfig.CustomExits.Residues.length===0)?"":CommonUtils.Misc.flattenResiduesArray(data.MoleConfig.CustomExits.Residues)}<br/>
                End Point[x,y,z]: {(data.MoleConfig.CustomExits===void 0 || data.MoleConfig.CustomExits===null)?"":(data.MoleConfig.CustomExits.Points===void 0 || data.MoleConfig.CustomExits.Points===null)?"":CommonUtils.Misc.pointsToString(data.MoleConfig.CustomExits.Points)}<br/>
                Query: {(data.MoleConfig.Origin===void 0 || data.MoleConfig.Origin===null)?"":(data.MoleConfig.Origin.QueryExpression===void 0 || data.MoleConfig.Origin.QueryExpression===null)?"":data.MoleConfig.Origin.QueryExpression}<br/>
            </div>
        }

        getPoresJob(data:Service.Submission){
            return <div className="panel-body">
                Beta Structure: {(data.PoresConfig.IsBetaBarel===void 0)?"False":(data.PoresConfig.IsBetaBarel)?"True":"False"}<br/>
                Membrane Region: {(data.PoresConfig.InMembrane===void 0)?"False":(data.PoresConfig.InMembrane)?"True":"False"}<br/>
                Specific Chains: {(data.PoresConfig.Chains===void 0)?"":data.PoresConfig.Chains}<br/>
            </div>
        }

        render(){
            let currentSubmitId = this.props.currentSubmitId;
            let data = this.props.data;
            //let canKill = checkCanKill(this.props.status as Service.ComputationStatus);
            //let canDelete = checkCanDelete(this.props.status as Service.ComputationStatus);
            let canResubmit = checkCanResubmit(this.props.status as Service.ComputationStatus);

            let contents;
            if(CommonUtils.Misc.isMoleJob(data)){
                contents = this.getMoleJob(data);
            }            
            else{
                contents = this.getPoresJob(data);
            }

            return(
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <a data-toggle="collapse" href={`#submit-data-${data.SubmitId}`} onClick={(e)=>{
                                if(e.currentTarget.attributes.getNamedItem('aria-expanded').value==='true'){
                                    if(String(data.SubmitId)!==String(this.props.currentSubmitId)){
                                        changeSubmitId(this.props.computationId, data.SubmitId);
                                    }
                                }
                            }}>
                            <h4 className="panel-title">
                                #{data.SubmitId}
                            </h4>
                            <div className="submission-state">
                                Status: <span className={`state-${this.props.status}`}>{this.props.status}</span>
                            </div>
                        </a>
                    </div>
                    <div id={`submit-data-${data.SubmitId}`} className={`panel-collapse collapse${(currentSubmitId.toString()===data.SubmitId.toString())?' in':''}`}>
                        {contents}
                        <div className="panel-footer">
                        <span className="btn btn-xs btn-primary" onClick={(()=>this.copyParams(data.SubmitId)).bind(this)}>Copy</span><span className="btn btn-xs btn-primary" disabled={!canResubmit} onClick={(()=>this.reSubmit()).bind(this)}>Resubmit</span>
                        </div>
                    </div>
                </div>
            );
        }

        private reSubmit(){
            if(CommonUtils.Misc.isMoleJob(this.props.data)){
                MoleOnlineWebUI.Bridge.Events.invokeOnReSubmit(
                    Service.ApiService.submitMoleJob(this.props.computationId,this.props.data.MoleConfig)
                );
            }
            else{
                MoleOnlineWebUI.Bridge.Events.invokeOnReSubmit(
                    Service.ApiService.submitPoresJob(this.props.computationId,this.props.data.PoresConfig)
                );
            }
        }

        private copyParams(submitId:number){
            if(this.props.onCopy!==void 0){
                this.props.onCopy(submitId);
            }
        }
    }

    export class ChannelsDBSubmission extends React.Component<{pdbid:string, computationId:string, isSelected:boolean},{}>{
        
        componentDidMount(){
        }

        render(){
            let isSelected = this.props.isSelected;
            let link = `${Config.CommonOptions.CHANNELSDB_LINK_DETAIL_URL}/${this.props.pdbid}`;
            let contents = <div className="panel-body">See <a target="_blank" href={link}>{link}</a> for more info.</div>
            return(
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <a data-toggle="collapse" href={`#submit-data-ChannelsDB`} onClick={(e)=>{
                                if(e.currentTarget.attributes.getNamedItem('aria-expanded').value==='true'){
                                    if(!this.props.isSelected){
                                        changeSubmitId(this.props.computationId, -1);
                                    }
                                }
                            }}>
                            <h4 className="panel-title">
                                #ChannelsDB
                            </h4>
                            <div className="submission-state">
                            </div>
                        </a>
                    </div>
                    <div id={`submit-data-ChannelsDB`} className={`panel-collapse collapse${(isSelected)?' in':''}`}>
                        {contents}
                    </div>
                </div>
            );
        }
    }

    function changeSubmitId(computationId:string, submitId:number){
        if(submitId===-1){
            CommonUtils.Router.fakeRedirect(computationId, "ChannelsDB");
        }
        else{
            CommonUtils.Router.fakeRedirect(computationId, (submitId>0)?String(submitId):void 0);
        }
        LiteMol.Example.Channels.State.removeChannelsData(MoleOnlineWebUI.Bridge.Instances.getPlugin());
        MoleOnlineWebUI.Bridge.Events.invokeChangeSubmitId(submitId);
    }

    

    /*
    function flattenPoints(pointsArray:CommonUtils.Selection.StringPoint[]):string{
        let rv = "";
        for(let p of pointsArray){
            let group = `[${p.x},${p.y},${p.z}]`;
            
            if(rv.length!==0){
                rv+=",";
            }
            rv+=group;
        }

        return rv;
    }
    */

    interface ControlTabState{
        activeTabIdx: number,
        data?: Service.CompInfo,
        err?: String,
        submitId: number,
        canSubmit: boolean
    };
    export class ControlTabs extends React.Component<{activeTab?: number},ControlTabState>{          
        
        state:ControlTabState={
            activeTabIdx: 0,
            data: void 0,
            err: void 0,
            submitId: 1,
            canSubmit:true
        }
        
        componentDidMount(){
            if(this.props.activeTab !== void 0){
                let state = this.state;
                state.activeTabIdx = this.props.activeTab;
                this.setState(state);
            }

            let parameters = CommonUtils.Router.getParameters();
            if(parameters!==null){
                let compId = parameters.computationId;
                let submitId = parameters.submitId;
                Provider.get(parameters.computationId,((compId:string,info:MoleOnlineWebUI.Service.MoleAPI.CompInfo)=>{
                    //CompInfo => Status==="Error" => Submissions neexistuje! Response ma format /Status na misto /CompInfo
                    if(info===null){
                        return;
                    }
                    let state = this.state;
                    state.data = info;
                    state.submitId = submitId;
                    this.setState(state);
                }).bind(this));
            }else{
                let state = this.state;
                state.err = "Parameters from url cannot be properly processed.";
                this.setState(state);
            }

            MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId((submitId)=>{
                let state = this.state;
                state.submitId = submitId;
                this.setState(state);
            });

            Common.Controls.FromLiteMol.ValidationState.attachOnStateChangeHandler(validationGroup,(prev,curr)=>{
                let s = this.state;
                if(curr!=="VALID"){
                    $("#submission-form").find("input[type=submit]").attr("disabled",true);
                    s.canSubmit = false;
                }
                else{
                    s.canSubmit = true;
                }
                this.setState(s);
            });
        }

        nullIfEmpty(data:any[][]){
            if(data.length===1&&data[0].length===0){
                return null;
            }

            return data;
        }

        handleSubmit(e:React.FormEvent<HTMLFormElement>){
            e.preventDefault();
            /*
            if(!this.state.canSubmit){
                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                    messageType: "Danger",
                    message: "Only one running submission is alowed. Please wait until completed."
                })
                return false;
            }
            */

            $(e.target).find("input[type=submit]").attr("disabled",true);
            let currentState = this.state;
            currentState.canSubmit = false;
            this.setState(currentState);
            
            if(this.state.data===void 0){
                return;
            }

            CommonUtils.FormEvents.Events.invokeOnSubmit(validationGroup);
        }

        render(){ 
            let tabs:JSX.Element[]=[];

            if(this.state.data !== void 0){
                tabs.push(
                    <Settings initialData={this.state.data} parent={this} submitId={this.state.submitId}/>
                );
                tabs.push(
                    <Submissions computationInfo={this.state.data} onResubmit={(info)=>{
                        let state = this.state;
                        state.data = info;
                        this.setState(state);
                        }} />
                );
            } 
            else{
                tabs.push(
                    <div>No data</div>
                );
            }
            if(this.state.canSubmit){
                $('#controls .submit-parent').find("input[type=submit]").removeAttr("disabled");
            }
            else{
                $('#controls .submit-parent').find("input[type=submit]").attr("disabled",true);
            }
            return (
                <div className="submit-form-container">
                    <Common.Tabs.BootstrapTabs.TabbedContainer header={["Submission settings","Submissions"]} tabContents={tabs} namespace="right-panel-tabs-" htmlClassName="tabs" htmlId="right-panel-tabs" activeTab={this.state.activeTabIdx} onChange={((tabIdx:number)=>{
                        let s = this.state;
                        s.activeTabIdx = tabIdx;
                        this.setState(s);
                    }).bind(this)}/>
                    <form className="form-horizontal" id="submission-form" onSubmit={this.handleSubmit.bind(this)}>
                        <ControlButtons submitId={this.state.submitId} computationInfo={this.state.data} />
                    </form>
                    <div id="right-panel-toggler" className="toggler glyphicon glyphicon-resize-vertical"></div>
                </div>
            );
        }
    }

    interface SubmissionCoboboxItem{
        label:string,
        value:string
    }
    interface ControlButtonsState{
        submitId:number,
        hasKillable:boolean,
        canSubmit:boolean
    }
    interface ControlButtonsProps{
        submitId:number,
        computationInfo:Service.CompInfo|undefined
    }
    export class ControlButtons extends React.Component<ControlButtonsProps,ControlButtonsState>{
        state:ControlButtonsState = {submitId:-1,hasKillable:false, canSubmit:true}

        componentDidMount(){
            this.state.submitId = this.props.submitId;
            MoleOnlineWebUI.Bridge.Events.subscribeChangeHasKillable((hasKillable)=>{
                let state = this.state;
                state.hasKillable = hasKillable;
                this.setState(state);
            });
        }

        componentWillReceiveProps(nextProps:ControlButtonsProps){
            let state = this.state;
            state.submitId = nextProps.submitId;
            this.setState(state);
        }

        private getSubmissions(){
            let submissions:Service.Submission[] = [];
            if(this.props.computationInfo!==void 0){
                submissions = this.sortSubmissions(this.props.computationInfo.Submissions);
            }

            return submissions;
        }

        private sortSubmissions(items:Service.Submission[]):Service.Submission[]{
            return items.sort((a,b)=>{
                return a.SubmitId-b.SubmitId;
            });
        }

        private prepareSubmissionItems():SubmissionCoboboxItem[]{
            let submissions = this.getSubmissions(); 
            
            let rv = [];
            
            rv.push(
                {
                    label:`-`,
                    value:'0'
                }
            );

            if(this.props.computationInfo!==void 0){
                if(this.props.computationInfo.PdbId!==null&&this.props.computationInfo.PdbId!==""){
                    rv.push({
                        label: 'ChDB',
                        value: '-1'
                    });
                }
            }
            
            if(submissions.length===0){
                return rv;
            }

            for(let item of submissions){
                rv.push(
                    {
                        label:`${item.SubmitId}`,
                        value:`${item.SubmitId}`
                    }
                );
            }

            return rv;
        }

        private getSelectedIndex(submitId:number, items:SubmissionCoboboxItem[]):number|undefined{
            for(let idx=0;idx<items.length;idx++){
                let item = items[idx];
                if(item.value===`${submitId}`){
                    return idx;
                }
            }

            return void 0;
        }

        private onSubmitIdComboSelectChange(e:any){
            if(this.props.computationInfo===void 0){
                return;
            }

            let idx = e.currentTarget.selectedIndex;
            let submitId = (e.currentTarget.options[idx] as HTMLOptionElement).value;
            let sid = Number(submitId).valueOf();
            changeSubmitId(this.props.computationInfo.ComputationId, sid);
            let state = this.state;
            state.submitId = sid;
            this.setState(state);
        }

        private changeSubmitIdByStep(e:React.MouseEvent<HTMLInputElement>){
            if(this.props.computationInfo===void 0){
                return;
            }
            
            let submitId = e.currentTarget.dataset["value"];

            if(submitId!==void 0){
                let sid = Number(submitId).valueOf();
                changeSubmitId(this.props.computationInfo.ComputationId, sid);
                let state = this.state;
                state.submitId = sid;
                this.setState(state);
            }
        }

        private canShift(left:boolean){
            if(this.props.computationInfo===void 0){
                return false;
            }

            if(String(this.state.submitId)===String(0)){
                return false;
            }

            let submissions = this.getSubmissions();
            
            for(let idx=0;idx<submissions.length;idx++){                
                if(String(submissions[idx].SubmitId)===String(this.props.submitId)){
                    let nextIdx = idx + ((left)?-1:1);
                    if(nextIdx<0||nextIdx>=submissions.length){
                        return false;
                    }
                    else{
                        return true;
                    }
                }
            }

            return false;
        }

        private canShiftNext(){
            return this.canShift(false);
        }

        private canShiftPrev(){
            return this.canShift(true);
        }

        private getNextIdx(idx:number):number{
            return idx+1;
        }

        private getPrevIdx(idx:number):number{
            return idx-1;
        }

        render(){            
            let canKill = (this.props.computationInfo!==void 0&&this.state.hasKillable);
            let items=this.prepareSubmissionItems(); 
            let idx = this.getSelectedIndex(this.state.submitId,items);
            let canShiftPrev = this.canShiftPrev();
            let canShiftNext = this.canShiftNext();
            return <div className="submit-parent">
                    <input className="btn btn-primary submit" type="submit" value="Submit" />
                    <input type="button" className="btn btn-primary kill-job-button" disabled={!canKill} onClick={(e=>{
                        if($(e.currentTarget).attr("disabled")!=="disabled"){
                            $('#killJobDialog').modal('show');
                            $(".chdb-panel.right-panel").addClass("has-modal");
                            }
                        })} value="Kill"/>
                    <input type="button" className="btn btn-primary delete-project-button" data-toggle="modal" data-target="#deleteProjectDialog" onClick={(e=>{
                        e.preventDefault();
                        $(".chdb-panel.right-panel").addClass("has-modal");
                        return false;
                        })} value="Delete" />
                    <input className="btn btn-primary clear-button" type="button" value="Clear" onClick={()=>{
                        CommonUtils.FormEvents.Events.invokeOnClear(validationGroup);
                    }} />
                    <input className="btn btn-primary submit-arrow" type="button" value=">" disabled={(!canShiftNext)?true:void 0} data-value={(!canShiftNext||idx===void 0)?void 0:items[this.getNextIdx(idx)].value} onClick={this.changeSubmitIdByStep.bind(this)} />
                    <Common.Controls.SimpleComboBox id="submissionComboSwitch" items={items} defaultSelectedIndex={idx} className="form-control submit-combo" onSelectedChange={this.onSubmitIdComboSelectChange.bind(this)} />
                    <input className="btn btn-primary submit-arrow" type="button" value="<" disabled={(!canShiftPrev)?true:void 0} data-value={(!canShiftPrev||idx==void 0)?void 0:items[this.getPrevIdx(idx)].value} onClick={this.changeSubmitIdByStep.bind(this)} />
                    <ModalDialog id="killJobDialog" header="Do you really want to kill running job?" body={this.prepareKillJobDialogBody()}/>
                    <ModalDialog id="deleteProjectDialog" header="Do you really want to delete whole computation project?" body={this.prepareDeleteDialogBody()}/>
                </div>
        }

        private prepareKillJobDialogBody(){
            return( 
                <div>
                    <button className="btn btn-primary left-button" onClick={(e)=>{
                            e.preventDefault();
                            if(this.props.computationInfo===void 0){
                                return false;
                            }
                            Service.ApiService.killRunningJob(this.props.computationInfo.ComputationId).then((result)=>{
                                if(result.Status!=="Aborted"){
                                    MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                        message:(result.ErrorMsg.length===0)?"Attempt to kill job was not successfull.":result.ErrorMsg,
                                        messageType:"Warning"
                                    });    
                                    return;
                                }
                                
                                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                    message:"Job has been successfully killed.",
                                    messageType:"Success"
                                });
                            })
                            .catch((err)=>{
                                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                    message:"Attempt to kill running job failed! Please try again later.",
                                    messageType:"Danger"
                                });
                            });
                            return false;
                        }} data-dismiss="modal">Yes</button>
                    <button className="btn btn-primary right-button" data-dismiss="modal">No</button>
                </div>
                );
        }

        private prepareDeleteDialogBody(){
            return( 
                <div>
                    <button className="btn btn-primary left-button" onClick={(e)=>{
                            e.preventDefault();
                            if(this.props.computationInfo===void 0){
                                return false;
                            }
                            Service.ApiService.deleteProject(this.props.computationInfo.ComputationId).then(()=>{
                                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                    message:"Current computation was succesfuly deleted. You will be redirected to initial page.",
                                    messageType:"Success"
                                });
                                window.setTimeout(()=>{
                                    SimpleRouter.GlobalRouter.redirect(Config.Routing.ROUTING_OPTIONS[Config.Routing.ROUTING_MODE].defaultContextPath);
                                },5000);
                            })
                            .catch((err)=>{
                                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                    message:"Attempt to delete current computation failed! Please try again later.",
                                    messageType:"Danger"
                                });
                            });
                            return false;
                        }} data-dismiss="modal">Yes</button>
                    <button className="btn btn-primary right-button" data-dismiss="modal">No</button>
                </div>
                );
        }
    }

    class ModalDialog extends React.Component<{id:string,header:string,body:JSX.Element},{}>{
        render(){
            return  <div id={this.props.id} className="modal fade" role="dialog">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button type="button" className="close" data-dismiss="modal">&times;</button>
                                    <h4 className="modal-title">{this.props.header}</h4>
                                </div>
                                <div className="modal-body">
                                    {this.props.body}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" data-dismiss="modal" onClick={()=>{
                                        $(".chdb-panel.right-panel").removeClass("has-modal");
                                    }} >Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
        }
    }
}