namespace Controls.UI{
    import React = LiteMol.Plugin.React;
    import ReactDOM = LiteMol.Plugin.ReactDOM;
    import TunnelUtils = CommonUtils.Tunnels;
    import Provider = MoleOnlineWebUI.DataProxy.ComputationInfo.DataProvider;
    import Service = MoleOnlineWebUI.Service.MoleAPI;

    declare function $(p:any): any;

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

    export class TextBox extends React.Component<{label: string, id:string, placeholder?:string, classNames?:string[]},{}>{
        render(){
            let classNames = ["",""];
            if(this.props.classNames!==void 0){
                classNames = this.props.classNames;
            }

            return (
                <div className="form-group">
                    <label className={`control-label ${classNames[0]}`} htmlFor={this.props.id}>{this.props.label}:</label>
                    <div className={`${classNames[1]}`}>
                        <input type="text" className="form-control" id={this.props.id} placeholder={this.props.placeholder}/>
                    </div>
                </div>
            );
        }
    }
    export class CheckBox extends React.Component<{label: string, id:string, defaultChecked?:boolean, classNames?:string[]},{}>{
        render(){
            let classNames = [""];
            if(this.props.classNames!==void 0){
                classNames = this.props.classNames;
            }
            return (
                <div className="form-group">                
                    <label className={`control-label ${classNames[0]}`}>{this.props.label}</label>
                    <div className={`${classNames[1]}`}>
                        <input type="checkbox" className="checkbox" id={this.props.id} defaultChecked={this.props.defaultChecked} />
                    </div>
                </div>
            );
        }
    }

    export class ComboBox extends React.Component<{label: string, id:string, items:{label:string,value:string}[], defaultSelectedIndex?:number, classNames?:string[]},{}>{
        render(){
            let classNames = [""];
            if(this.props.classNames!==void 0){
                classNames = this.props.classNames;
            }

            let selectedIdx = 0;
            if(this.props.defaultSelectedIndex!==void 0){
                selectedIdx = this.props.defaultSelectedIndex;
            }

            let items = [];
            let idx = 0;
            for(let item of this.props.items){
                items.push(
                    <option value={item.value} selected={(idx===selectedIdx)}>{item.label}</option>
                );
                idx++;
            }

            return (
                <div className="form-group">                
                    <label className={`control-label ${classNames[0]}`}>{this.props.label}</label>
                    <div className={`${classNames[1]}`}>
                        <select id={this.props.id} className="form-control">
                            {items}
                        </select>
                    </div>
                </div>
            );
        }
    }

    export class CheckBox_old extends React.Component<{label: string, id:string, defaultChecked?:boolean, classNames?:string[]},{}>{
        render(){
            let classNames = [""];
            if(this.props.classNames!==void 0){
                classNames = this.props.classNames;
            }
            return (
                <div className="form-group"> 
                    <div className={`${classNames[0]}`}>                 
                        <div className="checkbox">
                            <label><input type="checkbox" id={this.props.id} defaultChecked={this.props.defaultChecked} />{this.props.label}:</label>
                        </div>
                    </div>
                </div>
            );
        }
    }

    export class NumberBox extends React.Component<{label: string, id:string, defaultValue?:number, min?:number, max?:number, step?:number, classNames?:string[]},{}>{
        render(){
            let classNames = ["",""];
            if(this.props.classNames!==void 0){
                classNames = this.props.classNames;
            }

            let step = (this.props.step===void 0)?1:this.props.step;
            let defaultValue = (this.props.defaultValue===void 0)?0:this.props.defaultValue;

            return (
                <div className="form-group">
                    <label className={`control-label ${classNames[0]}`} htmlFor={this.props.id}>{this.props.label}:</label>
                    <div className={`${classNames[1]}`}>
                        <input type="number" min={this.props.min} max={this.props.max} className="form-control" id={this.props.id} step={step} defaultValue={defaultValue.toString()}/>
                    </div>
                </div>
            );
        }
    }

    export class XYZBox extends React.Component<{label: string, id:string, defaultValue?:{x:number,y:number,z:number}, classNames?:string[]},{}>{
        render(){
            let classNames = ["",""];
            if(this.props.classNames!==void 0){
                classNames = this.props.classNames;
            }

            let defaultValue = this.props.defaultValue;

            return (
                <div className="form-group">
                    <label className={`control-label ${classNames[0]}`} htmlFor={this.props.id}>{this.props.label}:</label>
                    <div className={`${classNames[1]}`}>
                        <input type="text" className="form-control form-3-input" id={`${this.props.id}_x`} defaultValue={(defaultValue===void 0)?void 0:defaultValue.x.toString()}/>
                        <input type="text" className="form-control form-3-input" id={`${this.props.id}_y`} defaultValue={(defaultValue===void 0)?void 0:defaultValue.x.toString()}/>
                        <input type="text" className="form-control form-3-input" id={`${this.props.id}_z`} defaultValue={(defaultValue===void 0)?void 0:defaultValue.x.toString()}/>
                    </div>
                </div>
            );
        }
    }

    export class LabelBox extends React.Component<{label: string, text:string, id:string, classNames?:string[]},{}>{
        render(){
            let classNames = ["",""];
            if(this.props.classNames!==void 0){
                classNames = this.props.classNames;
            }

            return (
                <div className="form-group">
                    <label className={`control-label ${classNames[0]}`} htmlFor={this.props.id}>{this.props.label}:</label>
                    <div className={`${classNames[1]} control-text`}>
                        <span>{this.props.text}</span>
                    </div>
                </div>
            );
        }
    }
    /*
    export interface SubmitFormData{
        pdbid: string
    };*/
    interface SettingsState{
        data:Service.CompInfo|null
    };
    export class Settings extends React.Component<{initialData:Service.CompInfo, submitId:number},SettingsState>{
        
        state:SettingsState = {data:null}
        
        componentDidMount(){  
            this.setState({data:this.props.initialData}); 
        }
        
        render(){
            if(this.state.data===null){
                return <div/>
            }

            let pdbid = this.state.data.PdbId;

            if(this.state.data.Submissions.length>0){
                let submissionData = this.state.data.Submissions[this.props.submitId];
                if(submissionData!==void 0){
                    let moleConfig = submissionData.MoleConfig;
                    if(moleConfig!==null){
                        //moleConfig.
                    }
                }
            }
            let doubleColClasses = ["col-md-5","col-md-7"];
            let chckColClasses = doubleColClasses;//["col-md-offset-4 col-md-8"];
            return (
                <div className="settings-form basic-settings">
                    <h4>General</h4>
                    <LabelBox label="Structure" text={this.state.data.PdbId} id="pdbid" classNames={doubleColClasses} />
                    <TextBox label="Specific chains" id="specificChains" classNames={doubleColClasses} />
                    <CheckBox label="Read all models" defaultChecked={false} id="readAllModels" classNames={chckColClasses} />
                    <TextBox label="Ignored residues" id="nonActiveResidues" classNames={doubleColClasses} />
                    <TextBox label="Query filter" id="queryFilter" classNames={doubleColClasses} />

                    <h4>Cavity</h4>
                    <CheckBox label="Ignore hydrogens" defaultChecked={false} id="ignoreHydrogens" classNames={chckColClasses} />
                    <CheckBox label="Ignore all HETATM" defaultChecked={false} id="ignoreAllHetatm" classNames={chckColClasses} />
                    <NumberBox label="Interior Treshold" id="interiorTreshold" classNames={doubleColClasses} min={0.8} max={2.4} defaultValue={1.25} step={0.01} />
                    <NumberBox label="Probe radius" id="probeRadius" classNames={doubleColClasses} min={1.4} max={20} defaultValue={3} step={0.01} />

                    <h4>Start and end</h4>
                    <TextBox label="Starting point" id="originResidues" classNames={doubleColClasses} />
                    <XYZBox label="Starting point [x,y,z]" id="originPoints" classNames={doubleColClasses} />
                    <TextBox label="End point" id="customExitsResidues" classNames={doubleColClasses} />
                    <XYZBox label="End point [x,y,z]" id="customExitsPoints" classNames={doubleColClasses} />
                    <TextBox label="Query expresion" id="queryExpresion" classNames={doubleColClasses} />

                    <h4>Tunnel</h4>
                    <ComboBox label="Weight function" id="tunnelWeightFunction" items={MoleOnlineWebUI.StaticData.WeightFunctions.get()} classNames={doubleColClasses} />
                    <NumberBox label="Bottleneck radius" id="bottleneckRadius" classNames={doubleColClasses} min={0.8} max={5} defaultValue={1.2} step={0.01} />
                    <NumberBox label="Bottleneck tolerance" id="bottleneckTolerance" classNames={doubleColClasses} min={0} max={5} defaultValue={0} step={0.1} />
                    <NumberBox label="Max tunnel similarity" id="maxTunnelSimilarity" classNames={doubleColClasses} min={0} max={1} defaultValue={0.9} step={0.05} />
                    <NumberBox label="Origin radius" id="originRadius" classNames={doubleColClasses} min={0.1} max={10} defaultValue={5} step={0.05}/>
                    <NumberBox label="Surface cover radius" id="surfaceCoverRadius" classNames={doubleColClasses} min={5} max={20} defaultValue={10} step={0.5} />                    

                    <h4>Pores</h4>
                    <CheckBox label="Merge pores" defaultChecked={false} id="mergePores" classNames={chckColClasses} />
                    <CheckBox label="Automatic pores" defaultChecked={false} id="automaticPores" classNames={chckColClasses} />
                </div>
            );
            //<CheckBox label="Automatic starting points" defaultChecked={false} id="automaticStartingPoints" classNames={chckColClasses} />
            //<CheckBox label="Automatic endpoints" defaultChecked={false} id="automaticEndPoints" classNames={chckColClasses} />
            //<CheckBox label="Use custom exits only" defaultChecked={false} id="useCustomExitsOnly" classNames={chckColClasses} />
            //<LabelBox label="Active sites from CSA" text="TODO:..." id="activeSites" classNames={doubleColClasses} />
        }
    }

    interface ComputationsState{
        computationInfo:Service.CompInfo|null,
        loading:boolean,
        statusInfo: Map<string,string>|null
    };
    export class Submissions extends React.Component<{computationInfo:Service.CompInfo},ComputationsState>{
        
        state:ComputationsState = {computationInfo:null,loading:true,statusInfo:null}
        
        componentWillReceiveProps(nextProps:{computationInfo:Service.CompInfo}){
            this.prepareSubmissionData(nextProps.computationInfo);
        }

        private prepareSubmissionData(computationInfo:Service.CompInfo){
            let promises = [];
            for(let submission of computationInfo.Submissions){
                promises.push(
                    Service.ApiService.getStatus(computationInfo.ComputationId, submission.SubmitId)
                );
            }
            Promise.all(promises).then((statusResponses)=>{
                let map = new Map<string,string>();
                for(let status of statusResponses){
                    if(status.Status==="Initializing"||status.Status==="Running"){
                        MoleOnlineWebUI.DataProxy.JobStatus.Watcher.registerOnChangeHandler(status.ComputationId,status.SubmitId,(state)=>{
                            let statusInfo = this.state.statusInfo;
                            if(statusInfo!==null){
                                let old = statusInfo.get(String(status.SubmitId));
                                if(old===void 0||old!==state.Status){
                                    statusInfo.set(String(status.SubmitId),state.Status);
                                    this.setState({statusInfo:map});
                                }
                            }
                        },(err)=>{
                            if(Config.CommonOptions.DEBUG_MODE)
                                console.log(err);
                        })
                    }
                    map.set(String(status.SubmitId),status.Status);
                }

                this.setState({computationInfo:computationInfo, loading:false, statusInfo:map});
            });    
        }

        componentDidMount(){
            this.prepareSubmissionData(this.props.computationInfo);
        }

        render(){
            if(this.state.computationInfo!==null&&!this.state.loading){
                let submissions:JSX.Element[] = [];
                let submissionsData = this.state.computationInfo.Submissions;

                for(let s of submissionsData.sort((a,b)=>{
                    return a.SubmitId-b.SubmitId;
                })){
                    let stat = "Unknown";

                    if(this.state.statusInfo!==null){
                        let st = this.state.statusInfo.get(String(s.SubmitId));
                        if(st!==void 0){
                            stat = st;
                        }
                    }

                    submissions.push(
                        <Submission data={s} computationId={this.props.computationInfo.ComputationId} status={(stat===void 0)?"Unknown":stat}/>
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
    
    function flattenResidues(residues:Service.MoleConfigResidues[]):string{
        let rv = "";
        for(let r of residues){
            if(rv !== ""){
                rv+=", ";
            }
            rv+=`${r.Chain} ${r.SequenceNumber}`;
        }
        return rv;
    }

    export class Submission extends React.Component<{data:Service.Submission, computationId:string, status:string},{}>{
        
        componentDidMount(){
        }

        render(){
            let data = this.props.data;
            return(
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <a data-toggle="collapse" href={`#submit-data-${data.SubmitId}`} onClick={(e)=>{
                                if(e.currentTarget.attributes.getNamedItem('aria-expanded').value==='true'){
                                    changeSubmitId(this.props.computationId, data.SubmitId);
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
                    <div id={`submit-data-${data.SubmitId}`} className="panel-collapse collapse">
                        <div className="panel-body">
                            <h4>General</h4>
                            Specific chains: {(data.MoleConfig.Input===void 0)?"":data.MoleConfig.Input.SpecificChains}<br/>
                            Read all models: {(data.MoleConfig.Input===void 0)?"False":(data.MoleConfig.Input.ReadAllModels)?"True":"False"}<br/>
                            Ignored residues: {(data.MoleConfig.NonActiveResidues===void 0||data.MoleConfig.NonActiveResidues===null)?"":flattenResidues(data.MoleConfig.NonActiveResidues)}<br/>
                            Query filter: {(data.MoleConfig.QueryFilter===void 0)?"":data.MoleConfig.QueryFilter}<br/>
                            <h4>Cavity</h4>
                            Ignore hdrogens: {(data.MoleConfig.Cavity===void 0)?"False":(data.MoleConfig.Cavity.IgnoreHydrogens)?"True":"False"}<br/>
                            Ignore all HETATM: {(data.MoleConfig.Cavity===void 0)?"False":(data.MoleConfig.Cavity.IgnoreHETAtoms)?"True":"False"}<br/>
                            Interior treshold: {(data.MoleConfig.Cavity===void 0)?"":data.MoleConfig.Cavity.InteriorThreshold}<br/>
                            Probe radius: {(data.MoleConfig.Cavity===void 0)?"":data.MoleConfig.Cavity.ProbeRadius}<br/>
                            <h4>Start and end</h4>
                            Starting point: {(data.MoleConfig.Origin===void 0 || data.MoleConfig.Origin===null)?"":(data.MoleConfig.Origin.Residues===void 0 || data.MoleConfig.Origin.Residues===null || data.MoleConfig.Origin.Residues.length===0)?"":flattenResidues(data.MoleConfig.Origin.Residues)}<br/>
                            Starting point[x,y,z]: {(data.MoleConfig.Origin===void 0 || data.MoleConfig.Origin===null)?"":(data.MoleConfig.Origin.Points===void 0 || data.MoleConfig.Origin.Points===null)?"":pointsToString(data.MoleConfig.Origin.Points)}<br/>
                            End point: {(data.MoleConfig.CustomExits===void 0 || data.MoleConfig.CustomExits===null)?"":(data.MoleConfig.CustomExits.Residues===void 0 || data.MoleConfig.CustomExits.Residues===null || data.MoleConfig.CustomExits.Residues.length===0)?"":flattenResidues(data.MoleConfig.CustomExits.Residues)}<br/>
                            End point[x,y,z]: {(data.MoleConfig.CustomExits===void 0 || data.MoleConfig.CustomExits===null)?"":(data.MoleConfig.CustomExits.Points===void 0 || data.MoleConfig.CustomExits.Points===null)?"":pointsToString(data.MoleConfig.CustomExits.Points)}<br/>
                            Query expression: {(data.MoleConfig.Origin===void 0 || data.MoleConfig.Origin===null)?"":(data.MoleConfig.Origin.QueryExpression===void 0 || data.MoleConfig.Origin.QueryExpression===null)?"":data.MoleConfig.Origin.QueryExpression}<br/>
                            <h4>Tunnel</h4>
                            Weight function: {(data.MoleConfig.Tunnel===void 0 || data.MoleConfig.Tunnel===null)?"":data.MoleConfig.Tunnel.WeightFunction}<br/>
                            Bottleneck radius: {(data.MoleConfig.Tunnel===void 0 || data.MoleConfig.Tunnel===null)?"":data.MoleConfig.Tunnel.BottleneckRadius}<br/>
                            Bottleneck tolerance: {(data.MoleConfig.Tunnel===void 0 || data.MoleConfig.Tunnel===null)?"":data.MoleConfig.Tunnel.BottleneckTolerance}<br/>
                            Max tunnel similarity: {(data.MoleConfig.Tunnel===void 0 || data.MoleConfig.Tunnel===null)?"":data.MoleConfig.Tunnel.MaxTunnelSimilarity}<br/>
                            Origin radius: {(data.MoleConfig.Tunnel===void 0 || data.MoleConfig.Tunnel===null)?"":data.MoleConfig.Tunnel.OriginRadius}<br/>
                            Surface cover radius: {(data.MoleConfig.Tunnel===void 0 || data.MoleConfig.Tunnel===null)?"":data.MoleConfig.Tunnel.SurfaceCoverRadius}<br/>
                            Use custom exits only: {(data.MoleConfig.Tunnel===void 0 || data.MoleConfig.Tunnel===null)?"False":(data.MoleConfig.Tunnel.UseCustomExitsOnly)?"True":"False"}<br/>
                            <h4>Pores</h4>
                            Merge pores: {(data.MoleConfig.PoresMerged===void 0 || data.MoleConfig.PoresMerged===null)?"False":(data.MoleConfig.PoresMerged)?"True":"False"}<br/>
                            Automatic pores: {(data.MoleConfig.PoresAuto===void 0 || data.MoleConfig.PoresAuto===null)?"False":(data.MoleConfig.PoresAuto)?"True":"False"}<br/>
                        </div>
                    </div>
                </div>
            );
        }
    }

    function changeSubmitId(computationId:string, submitId:number){
        CommonUtils.Router.fakeRedirect(computationId, submitId);
        LiteMol.Example.Channels.State.removeChannelsData(MoleOnlineWebUI.Bridge.Instances.getPlugin());
        MoleOnlineWebUI.Bridge.Events.invokeChangeSubmitId(submitId);
    }

    function pointsToString(points: Service.MoleConfigPoint[]):string{
        let rv = "";
        for(let p of points){
            if(rv!==""){
                rv+=",";
            }
            rv+=`[${p.X},${p.Y},${p.Z}]`;
        }
        return rv;
    }

    function parseResidues(residues:string|undefined):{Chain:string,SequenceNumber:number}[]{
        if(residues===void 0){
            return [];
        }

        let items = residues.split(', ');
        let rv = [];
        
        let seqNumReg = new RegExp(/^[0-9]+$/);
        let chainReg = new RegExp(/^[A-Z][\-][\d]*$|^[A-Z]{1}$/);

        for(let item of items){
            let r = item.split(' ');
            let seqNum;
            let chain;
            for(let part of r){
                if(seqNumReg.test(part)){
                    seqNum = Number(part);
                    continue;
                }
                if(chainReg.test(part)){
                    chain = part;
                    continue;
                }
            }
            if(chain!==void 0 && seqNum!==void 0){
                rv.push(
                    {
                        Chain:chain,
                        SequenceNumber: seqNum
                    }
                );
            }
        }

        return rv;
    }

    interface ControlTabState{
        activeTabIdx: Number,
        data?: Service.CompInfo,
        err?: String,
        submitId: number
    };
    export class ControlTabs extends React.Component<{activeTab?: number},ControlTabState>{          
        
        state:ControlTabState={
            activeTabIdx: 0,
            data: void 0,
            err: void 0,
            submitId: 1
        }
        
        componentDidMount(){
            if(this.props.activeTab !== void 0){
                this.setState({activeTabIdx:this.props.activeTab});
            }

            let parameters = CommonUtils.Router.getParameters();
            if(parameters!==null){
                let compId = parameters.computationId;
                let submitId = parameters.submitId;
                Provider.get(parameters.computationId,((compId:string,info:MoleOnlineWebUI.Service.MoleAPI.CompInfo)=>{
                    this.setState({data:info, submitId});
                }).bind(this));
            }else{
                this.setState({err:"Parameters from url cannot be properly processed."});
            }

            MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId((submitId)=>{
                this.setState({submitId});
            });
        }

        handleSubmit(e:React.FormEvent<HTMLFormElement>){
            e.preventDefault();
            if(this.state.data===void 0){
                return;
            }

            let form = e.target as HTMLFormElement;
            
            let specificChains = "";
            let readAllModels = false;
            let nonActiveResidues;
            let queryFilter;
            let ignoreHydrogens = false;
            let ignoreAllHetatm = false;
            let interiorTreshold = 1.25;
            let probeRadius = 3;
            let automaticStartingPoints;
            let originResidues;
            let originPoints_x;
            let originPoints_y;
            let originPoints_z;
            let automaticEndPoints;
            let customExitsResidues;
            let customExitsPoints_x;
            let customExitsPoints_y;
            let customExitsPoints_z;
            let queryExpresion=null;
            let tunnelWeightFunction="VoronoiScale";
            let bottleneckRadius=1.2;
            let bottleneckTolerance=0;
            let maxTunnelSimilarity=0.9;
            let originRadius=5;
            let surfaceCoverRadius=10;
            let useCustomExitsOnly=false;
            let mergePores;
            let automaticPores;

            for(let idx = 0;idx<form.length;idx++){
                let item = form[idx] as HTMLInputElement;
                let name = item.getAttribute('id');
                switch(name){
                    case 'specificChains':
                        specificChains = item.value;
                        break;
                    case 'readAllModels':
                        readAllModels = (item.value!=="")?item.checked:false;
                        break;
                    case 'nonActiveResidues':
                        nonActiveResidues = item.value;
                        break;          
                    case 'queryFilter':
                        queryFilter = item.value;
                        break;  
                    case 'ignoreHydrogens':
                        ignoreHydrogens = (item.value!=="")?item.checked:false;
                        break;
                    case 'ignoreAllHetatm':
                        ignoreAllHetatm = (item.value!=="")?item.checked:false;
                        break;
                    case 'interiorTreshold':
                        interiorTreshold = Number(item.value);
                        break;  
                    case 'probeRadius':
                        probeRadius = Number(item.value);
                        break;  
                    case 'automaticStartingPoints':
                        automaticStartingPoints = (item.value!=="")?item.checked:false;
                        break;
                    case 'originResidues':
                        originResidues = item.value;
                        break;  
                    case 'originPoints_x':
                        originPoints_x = (item.value==="")?void 0:Number(item.value);
                        break;  
                    case 'originPoints_y':
                        originPoints_y = (item.value==="")?void 0:Number(item.value);
                        break; 
                    case 'originPoints_z':
                        originPoints_z = (item.value==="")?void 0:Number(item.value);
                        break; 
                    case 'automaticEndPoints':
                        automaticEndPoints = (item.value!=="")?item.checked:false;
                        break;
                    case 'customExitsResidues':
                        customExitsResidues = item.value;
                        break;  
                    case 'customExitsPoints_x':
                        customExitsPoints_x = (item.value==="")?void 0:Number(item.value);
                        break;  
                    case 'customExitsPoints_y':
                        customExitsPoints_y = (item.value==="")?void 0:Number(item.value);
                        break; 
                    case 'customExitsPoints_z':
                        customExitsPoints_z = (item.value==="")?void 0:Number(item.value);
                        break; 
                    case 'queryExpresion':
                        queryExpresion = item.value;
                        break; 
                    case 'tunnelWeightFunction':
                        tunnelWeightFunction = item.value;
                        break; 
                    case 'bottleneckRadius':
                        bottleneckRadius = Number(item.value);
                        break; 
                    case 'bottleneckTolerance':
                        bottleneckTolerance = Number(item.value);
                        break; 
                    case 'maxTunnelSimilarity':
                        maxTunnelSimilarity = Number(item.value);
                        break; 
                    case 'originRadius':
                        originRadius = Number(item.value);
                        break;
                    case 'surfaceCoverRadius':
                        surfaceCoverRadius = Number(item.value);
                        break;
                    case 'useCustomExitsOnly':
                        useCustomExitsOnly = (item.value!=="")?item.checked:false;
                        break;
                    case 'mergePores':
                        mergePores = (item.value!=="")?item.checked:false;
                        break;
                    case 'automaticPores':
                        automaticPores = (item.value!=="")?item.checked:false;
                        break;
                }
            }

            let originPoints=null;
            if(originPoints_x!== void 0 && originPoints_y!==void 0 && originPoints_z!==void 0){
                originPoints = [
                    {
                        X:originPoints_x,
                        Y:originPoints_y,
                        Z:originPoints_z,
                    }
                ]
            }

            let customExitsPoints=null;
            if(customExitsPoints_x!== void 0 && customExitsPoints_y!==void 0 && customExitsPoints_z!==void 0){
                customExitsPoints = [
                    {
                        X:customExitsPoints_x,
                        Y:customExitsPoints_y,
                        Z:customExitsPoints_z,
                    }
                ]
            }

            let customExits;
            if(customExitsResidues!==void 0 || customExitsPoints!==null){
                customExits = {
                    Residues:parseResidues(customExitsResidues),
                    Points:customExitsPoints,
                    QueryExpression:null
                }
            }

            let formData:Service.MoleConfig = {
                Input: {
                    ReadAllModels: readAllModels,
                    SpecificChains: specificChains
                },
                Cavity: {
                    IgnoreHETAtoms: ignoreAllHetatm,
                    IgnoreHydrogens: ignoreHydrogens,
                    InteriorThreshold: interiorTreshold,
                    ProbeRadius: probeRadius
                },
                Origin:{
                    Points: originPoints,
                    Residues: parseResidues(originResidues),
                    QueryExpression: queryExpresion
                },
                Tunnel:{
                    BottleneckRadius: bottleneckRadius,
                    BottleneckTolerance: bottleneckTolerance,
                    MaxTunnelSimilarity: maxTunnelSimilarity,
                    OriginRadius: originRadius,
                    SurfaceCoverRadius: surfaceCoverRadius,
                    UseCustomExitsOnly: useCustomExitsOnly,
                    WeightFunction: tunnelWeightFunction
                },
                CustomExits:customExits,
                NonActiveResidues:parseResidues(nonActiveResidues),
                PoresAuto:automaticPores,
                PoresMerged: mergePores,
                QueryFilter: queryFilter
            } 

            Service.ApiService.submitMoleJob(this.state.data.ComputationId, formData).then((result)=>{
                CommonUtils.Router.fakeRedirect(result.ComputationId, Number(result.SubmitId));
                LiteMol.Example.Channels.State.removeChannelsData(MoleOnlineWebUI.Bridge.Instances.getPlugin());                

                Provider.get(result.ComputationId,((compId:string,info:MoleOnlineWebUI.Service.MoleAPI.CompInfo)=>{
                    this.setState({data:info});
                    MoleOnlineWebUI.Bridge.Events.invokeNewSubmit();
                    MoleOnlineWebUI.Bridge.Events.invokeChangeSubmitId(Number(result.SubmitId));
                }).bind(this), true);
            })
            .catch((err)=>{
                if(Config.CommonOptions.DEBUG_MODE)
                    console.log(err);
            })
        }

        render(){ 
            let tabs:JSX.Element[]=[];
            
            if(this.state.data !== void 0){
                tabs.push(
                    <Settings initialData={this.state.data} submitId={this.state.submitId}/>
                );
                tabs.push(
                    <Submissions computationInfo={this.state.data} />
                );
            } 
            else{
                tabs.push(
                    <div>No data</div>
                );
            }

            return (
                <div className="submit-form-container">
                    <form className="form-horizontal" onSubmit={this.handleSubmit.bind(this)}>
                        <Common.Tabs.BootstrapTabs.TabbedContainer header={["Submission settings","Submissions"]} tabContents={tabs} namespace="right-panel-tabs-" htmlClassName="tabs" htmlId="right-panel-tabs" activeTab={this.props.activeTab}/>
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
        submitId:number
    }
    interface ControlButtonsProps{
        submitId:number,
        computationInfo:Service.CompInfo|undefined
    }
    export class ControlButtons extends React.Component<ControlButtonsProps,ControlButtonsState>{
        state:ControlButtonsState = {submitId:-1}

        componentDidMount(){
            this.state.submitId = this.props.submitId;
        }

        componentWillReceiveProps(nextProps:ControlButtonsProps){
            this.setState({
                submitId:nextProps.submitId
            });
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
            if(submissions.length===0){
                return [];
            }

            let rv = [];
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

        private onSubmitIdComboSelectChange(e:React.ChangeEvent<HTMLSelectElement>){
            if(this.props.computationInfo===void 0){
                return;
            }

            let idx = e.currentTarget.selectedIndex;
            let submitId = (e.currentTarget.options[idx] as HTMLOptionElement).value;
            let sid = Number(submitId).valueOf();
            changeSubmitId(this.props.computationInfo.ComputationId, sid);
            this.setState({submitId:sid})
        }

        private changeSubmitIdByStep(e:React.MouseEvent<HTMLInputElement>){
            if(this.props.computationInfo===void 0){
                return;
            }
            
            let submitId = e.currentTarget.dataset["value"];
            if(submitId!==void 0){
                let sid = Number(submitId).valueOf();
                changeSubmitId(this.props.computationInfo.ComputationId, sid);
                this.setState({submitId:sid})
            }
        }

        render(){            
            let items=this.prepareSubmissionItems(); 
            let idx = this.getSelectedIndex(this.state.submitId,items);
            return <div className="submit-parent">
                    <input className="btn btn-primary submit" type="submit" value="Submit" />
                    <input className="btn btn-primary submit-arrow" type="button" value=">" disabled={(idx===void 0||idx===items.length-1)?true:void 0} data-value={(idx===void 0||idx===items.length-1)?void 0:items[idx+1].value} onClick={this.changeSubmitIdByStep.bind(this)} />
                    <Common.Controls.SimpleComboBox id="submissionComboSwitch" items={items} defaultSelectedIndex={idx} className="form-control submit-combo" onSelectedChange={this.onSubmitIdComboSelectChange.bind(this)} />
                    <input className="btn btn-primary submit-arrow" type="button" value="<" disabled={(idx===void 0||idx===0)?true:void 0} data-value={(idx===void 0||idx===0)?void 0:items[idx-1].value} onClick={this.changeSubmitIdByStep.bind(this)} />
                </div>
        }
    }

    export class TabbedContainer extends React.Component<{tabContents:JSX.Element[], header: string[], namespace:string, htmlId?:string, htmlClassName?:string, activeTab?:number},{activeTabIdx:number}>{
        
        state = {activeTabIdx:0}

        componentDidMount(){
            if(this.props.activeTab!== void 0){
                this.state.activeTabIdx = this.props.activeTab;
            }
        }

        header(){
            let rv:JSX.Element[] = [];
            for(let idx=0;idx<this.props.header.length;idx++){
                let header = this.props.header[idx];
                rv.push(<li className={(idx===this.state.activeTabIdx)?"active":""}><a data-toggle="tab" href={`#${this.props.namespace}${idx+1}`} onClick={(()=>{this.setState({activeTabIdx:idx})}).bind(this)}>{header}</a></li>);
            }
            return rv;
        }

        contents(){
           let rv:JSX.Element[] = [];
            for(let idx=0;idx<this.props.tabContents.length;idx++){
                let contents = this.props.tabContents[idx];
                rv.push(
                    <div id={`${this.props.namespace}${idx+1}`} className={`tab-pane fade ${(idx===this.state.activeTabIdx)?"in active":""}`}>
                        {contents}
                    </div>
                );
            }
            return rv;
        }

        render(){
            return (
                <div className={this.props.htmlClassName} id={this.props.htmlId}>
                    <ul className="nav nav-tabs">
                        {this.header()}
                    </ul>
                    <div className="tab-content">
                        {this.contents()}
                    </div>
                </div>
            );
        }
    }

    export class Tab extends React.Component<{active:boolean, tabIndex:number, contents:JSX.Element, namespace:string},{}>{
        render(){
            return (
                <div id={`${this.props.namespace}${this.props.tabIndex}`} className={(this.props.active)?"active":""}>
                    {this.props.contents}
                </div>
            );
        }
    }
}