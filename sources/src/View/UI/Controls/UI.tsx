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

    interface TextBoxProps{
        label: string, 
        id:string, 
        placeholder?:string, 
        classNames?:string[], 
        hint?:JSX.Element,
        onValidate?:(value:string)=>{valid:boolean,message:string}
        onValidateCustom?:(event:any)=>void
    };
    export class TextBox extends React.Component<TextBoxProps,{}>{
    
        private validators:((value:string)=>{valid:boolean,message:string})[]=[];

        private validate(e:EventTarget & HTMLInputElement){
            let value = e.value;
            if(this.validators===void 0){
                return true;
            }

            for(let v of this.validators){
                let validationState = v(value);
                if(!validationState.valid){
                    e.setCustomValidity(validationState.message);
                    window.setTimeout(()=>{
                        $(e.form).find("input[type=submit].submit").click(); //Enforces validation message popup. Form will not be submited due to validation errors.
                    });                    
                    return false;
                }
                else{
                    e.setCustomValidity("");
                }
            }

            return true;
        }

        componentWillReceiveProps(nextProps:TextBoxProps){
            if(nextProps.onValidate!==void 0)
                this.validators.push(nextProps.onValidate);
        }

        componentDidMount(){
            if(this.props.onValidate!==void 0)
                this.validators.push(this.props.onValidate);
        }

        render(){
            let classNames = ["",""];
            if(this.props.classNames!==void 0){
                classNames = this.props.classNames;
            }
            let hint;
            if(this.props.hint!==void 0){
                hint = <div className="TextBox-hint">
                    {this.props.hint}
                </div>
            }

            let onKeyDown=(e:any)=>{
                if(e.keyCode===13){
                    if(!this.validate(e.currentTarget)){
                        e.preventDefault();
                        return false;
                    }
                }
            };

            let onBlur=(e:any)=>{
                this.validate(e.currentTarget);
            };

            if(this.props.onValidateCustom!==void 0){
                let validateCustom = this.props.onValidateCustom;
                onKeyDown = (e:any)=>{
                    if(e.keyCode===13){
                        if(!validateCustom(e)){
                            e.preventDefault();
                            return false;
                        }
                    }
                };

                onBlur=(e:any)=>{
                    validateCustom(e);
                };
            }

            return (
                <div className="form-group">
                    <label className={`control-label ${classNames[0]}`} htmlFor={this.props.id}>{this.props.label}:</label>
                    <div className={`${classNames[1]}`}>
                        <input type="text" className="form-control" id={this.props.id} placeholder={this.props.placeholder} onBlur={onBlur} onKeyDown={onKeyDown} onFocus={(e)=>onFocusReplaceDefaultValidationPopup(e,this.props.id)} />
                    </div>
                    {hint}
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
                        <input type="number" min={this.props.min} max={this.props.max} className="form-control" id={this.props.id} step={step} defaultValue={defaultValue.toString()} onFocus={(e)=>onFocusReplaceDefaultValidationPopup(e,this.props.id)} />
                    </div>
                </div>
            );
        }
    }

    export class XYZBox extends React.Component<{label: string, id:string, defaultValue?:{x:number,y:number,z:number}, classNames?:string[], placeholder?:{x:number,y:number,z:number}},{}>{

        private validateIsNumber(value:string){
            let valid = !isNaN(Number(value));
            let message = (!valid)?"Value must be numeric!":"";
            return {
                valid,
                message
            }
        }

        private validators:((value:string)=>{valid:boolean,message:string})[]=[
            this.validateIsNumber
        ];

        private validate(e:EventTarget & HTMLInputElement){
            let value = e.value;
            if(this.validators===void 0){
                return true;
            }

            for(let v of this.validators){
                let validationState = v(value);
                if(!validationState.valid){
                    e.setCustomValidity(validationState.message);
                    window.setTimeout(()=>{
                        $(e.form).find("input[type=submit].submit").click(); //Enforces validation message popup. Form will not be submited due to validation errors.
                    });                    
                    return false;
                }
                else{
                    e.setCustomValidity("");
                }
            }

            return true;
        }
        
        render(){
            let classNames = ["",""];
            if(this.props.classNames!==void 0){
                classNames = this.props.classNames;
            }

            let defaultValue = this.props.defaultValue;
            let placeholder = this.props.placeholder;

            let onKeyDown=(e:any)=>{
                if(e.keyCode===13){
                    if(!this.validate(e.currentTarget)){
                        e.preventDefault();
                        return false;
                    }
                }
            };

            let onBlur=(e:any)=>{
                this.validate(e.currentTarget);
            };

            return (
                <div className="form-group">
                    <label className={`control-label ${classNames[0]}`} htmlFor={this.props.id}>{this.props.label}:</label>
                    <div className={`${classNames[1]}`}>
                        <input type="text" className="form-control form-3-input" id={`${this.props.id}_x`} defaultValue={(defaultValue===void 0)?void 0:defaultValue.x.toString()} placeholder={(placeholder===void 0)?void 0:placeholder.x.toString()} onKeyDown={onKeyDown} onBlur={onBlur} onFocus={(e)=>onFocusReplaceDefaultValidationPopup(e,`${this.props.id}_x`)} />
                        <input type="text" className="form-control form-3-input" id={`${this.props.id}_y`} defaultValue={(defaultValue===void 0)?void 0:defaultValue.y.toString()} placeholder={(placeholder===void 0)?void 0:placeholder.y.toString()} onKeyDown={onKeyDown} onBlur={onBlur} onFocus={(e)=>onFocusReplaceDefaultValidationPopup(e,`${this.props.id}_y`)} />
                        <input type="text" className="form-control form-3-input" id={`${this.props.id}_z`} defaultValue={(defaultValue===void 0)?void 0:defaultValue.z.toString()} placeholder={(placeholder===void 0)?void 0:placeholder.z.toString()} onKeyDown={onKeyDown} onBlur={onBlur} onFocus={(e)=>onFocusReplaceDefaultValidationPopup(e,`${this.props.id}_z`)} />
                    </div>
                </div>
            );
        }
    }

    interface CSAPickBoxState{isLoading:boolean, data:Service.CSAResidues|null};
    export class CSAPickBox extends React.Component<{label: string, id:string, outputRefId:string, computationId:string, classNames?:string[]},CSAPickBoxState>{
        
        state:CSAPickBoxState = {isLoading:true, data:null};

        componentDidMount(){
            this.getData();
        }

        render(){
            let classNames = ["",""];
            if(this.props.classNames!==void 0){
                classNames = this.props.classNames;
            }

            let contents;

            if(!this.state.isLoading&&this.state.data !== null){
                contents = this.generateItems(this.state.data);
            }

            if(this.state.isLoading){
                contents = <CSAPickBoxItem outputRefId="" isLoading={true} />
            }
            else if(!this.state.isLoading&&this.state.data === null){
                contents = <CSAPickBoxItem outputRefId="" />
            }
            

            return (
                <div className="form-group">
                    <label className={`control-label ${classNames[0]}`} htmlFor={this.props.id}>{this.props.label}:</label>
                    <div className={`${classNames[1]}`}>
                        {contents}
                    </div>
                </div>
            );
        }

        getData(){
            MoleOnlineWebUI.DataProxy.CSAResidues.DataProvider.get(this.props.computationId,(compid,residues)=>{
                this.setState({isLoading:false,data:residues});
            });
        }

        generateItems(activeResidues:Service.CSAResidues){
            let items = [];
            for(let item of activeResidues){
                items.push(
                    <CSAPickBoxItem outputRefId={this.props.outputRefId} value={item} />
                );
            }

            return items;
        }
    }

    export class CSAPickBoxItem extends React.Component<{outputRefId:string, value?:Service.MoleConfigResidue[], isLoading?:boolean},{}>{
        render(){
            if(this.props.isLoading===true){
                return <div className="csa-pick-box-item no-data">Loading...</div>
            }
            if(this.props.value===void 0){
                return <div className="csa-pick-box-item no-data">No active sites available...</div>
            }

            let value = this.props.value;

            return <div className="csa-pick-box-item has-data" onClick={()=>{
                let output = $(`#${this.props.outputRefId}`)[0] as HTMLInputElement;
                if(output.value.length>0){
                    output.value += ", ";
                }
                output.value += '['+flattenResidues(value)+']';
            }}>{flattenResidues(value)}</div>
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
        data:Service.CompInfo|null,
        mode:"Mole"|"Pores"
    };
    export class Settings extends React.Component<{initialData:Service.CompInfo, submitId:number},SettingsState>{
        
        state:SettingsState = {data:null,mode:"Mole"}
        
        componentDidMount(){  
            let state = this.state;
            state.data = this.props.initialData;
            this.setState(state); 
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
            //<CheckBox label="Automatic starting points" defaultChecked={false} id="automaticStartingPoints" classNames={chckColClasses} />
            //<CheckBox label="Automatic endpoints" defaultChecked={false} id="automaticEndPoints" classNames={chckColClasses} />
            //<CheckBox label="Use custom exits only" defaultChecked={false} id="useCustomExitsOnly" classNames={chckColClasses} />
            //<LabelBox label="Active sites from CSA" text="TODO:..." id="activeSites" classNames={doubleColClasses} />
        }

        getMoleForm(){
            let doubleColClasses = ["col-md-5","col-md-7"];
            let chckColClasses = doubleColClasses;//["col-md-offset-4 col-md-8"];

            if(this.state.data===null){
                return <div/>
            }

            let pdbid = this.state.data.PdbId;

            /*
            if(this.state.data.Submissions.length>0){
                let submissionData = this.state.data.Submissions[this.props.submitId];
                if(submissionData!==void 0){
                    let moleConfig = submissionData.MoleConfig;
                    if(moleConfig!==null){
                        //moleConfig.
                    }
                }
            }*/

            let patternQueryHint = <span><span className="glyphicon glyphicon-info-sign"/>See <a href="https://webchem.ncbr.muni.cz/Wiki/PatternQuery:UserManual" target="_blank">PatternQuery manual</a> for help.</span>
            
            let validateChainsArray = (value:string)=>{
                if(value.length===0){
                    return {valid:true, message:""};
                }

                let reg = new RegExp(/^[A-Z][\-][\d]*$|^[A-Z]{1}$/);
                value = value.replace(/\s*,\s*/g,",");
                let chains = value.split(",");
                let valid = true;
                for(let chain of chains){                    
                    valid = valid && reg.test(chain);
                }

                return {
                    valid,
                    message:(!valid)?"List of chains is not in readable format!":""};
            };

            let validateResidueSimpleArray = (value:string)=>{
                if(value.length===0){
                    return {valid:true, message:""};
                }
                
                let expectedCount = value.split(',').length;                
                let valid = parseResidues(value).length===expectedCount
                
                return {
                    valid,
                    message:(!valid)?"List of chains is not in readable format!":""};
            };
            
            let validateResidueDoubleArray = (value:string)=>{
                if(value.length===0){
                    return {valid:true, message:""};
                }

                value = value.replace(/\]\s,\s\[/g,'],[');
                
                let arrays = value.split("],[");

                let expectedCount = value.split(',').length;                
                let valid = true;
                let residuesArray = parseResiduesArray(value);

                if(residuesArray.length!==arrays.length){
                    valid = false;
                }
                else{
                    for(let i=0;i<residuesArray.length;i++){
                        valid = valid && arrays[i].split(",").length===residuesArray[i].length;
                        if(!valid){
                            break;
                        }
                    }
                }
                
                return {
                    valid,
                    message:(!valid)?"Invalid syntax! Should be [A 69, ...], [A 137, ...], ...":""};
            };

            let validatePatternQuery = (e:any)=>{
                let el = e.currentTarget as HTMLInputElement;
                if(el.value.length===0){
                    $(el.form).find("input[type=submit]").attr("disabled",false);
                    return;
                }
                
                $(el.form).find("input[type=submit]").attr("disabled",true);
                
                MoleOnlineWebUI.Service.PatternQueryAPI.ApiService.getValidationResult(el.value)
                    .then((result)=>{
                        if(result.isOk){
                            $(el.form).find("input[type=submit]").attr("disabled",false);
                        }
                        else{
                            createCustomValidationPopup(el,(result.error===void 0)?"":result.error);
                        }
                    })
                    .catch((err)=>{
                        createCustomValidationPopup(el,`Error occured during query validation.`);
                    });
            };

            return <div className="settings-form basic-settings">
                        <h4>General</h4>
                        <LabelBox label="Structure" text={this.state.data.PdbId} id="pdbid" classNames={doubleColClasses} />
                        <TextBox label="Specific Chains" id="specificChains" classNames={doubleColClasses} placeholder="A, B, ..." onValidate={validateChainsArray}/>
                        <CheckBox label="Read All Models" defaultChecked={false} id="readAllModels" classNames={chckColClasses} />
                        <TextBox label="Ignored Residues" id="nonActiveResidues" classNames={doubleColClasses} placeholder="A 69, A 386, ..." onValidate={validateResidueSimpleArray} />
                        <TextBox label="Query Filter" id="queryFilter" classNames={doubleColClasses} placeholder="Residues('GOL')" hint={patternQueryHint} onValidateCustom={validatePatternQuery} />

                        <h4>Cavity</h4>
                        <CheckBox label="Ignore Hydrogens" defaultChecked={false} id="ignoreHydrogens" classNames={chckColClasses} />
                        <CheckBox label="Ignore HETATMs" defaultChecked={true} id="ignoreAllHetatm" classNames={chckColClasses} />
                        <NumberBox label="Interior Treshold" id="interiorTreshold" classNames={doubleColClasses} min={0.8} max={2.4} defaultValue={1.1} step={0.01} />
                        <NumberBox label="Probe Radius" id="probeRadius" classNames={doubleColClasses} min={1.4} max={20} defaultValue={5} step={0.01} />

                        <h4>Start and end</h4>
                        <CSAPickBox label="Active Sites From CSA" id="csaActiveSites" classNames={doubleColClasses} outputRefId="originResidues" computationId={this.props.initialData.ComputationId} />
                        <TextBox label="Starting Point" id="originResidues" classNames={doubleColClasses} placeholder="[A 69, A 386], [A 137, A 136]" onValidate={validateResidueDoubleArray} />
                        <XYZBox label="Starting Point [x,y,z]" id="originPoints" classNames={doubleColClasses} placeholder={{x:-1,y:0,z:4}} />
                        <TextBox label="End Point" id="customExitsResidues" classNames={doubleColClasses} placeholder="[A 69, A 386], [A 137, A 136]" onValidate={validateResidueDoubleArray} />
                        <XYZBox label="End Point [x,y,z]" id="customExitsPoints" classNames={doubleColClasses} placeholder={{x:-1,y:0,z:4}} />
                        <TextBox label="Query Expression" id="queryExpresion" classNames={doubleColClasses} placeholder="Atoms('Fe')" hint={patternQueryHint} onValidateCustom={validatePatternQuery} />

                        <h4>Tunnel</h4>
                        <ComboBox label="Weight Function" id="tunnelWeightFunction" items={MoleOnlineWebUI.StaticData.WeightFunctions.get()} classNames={doubleColClasses} />
                        <NumberBox label="Bottleneck Radius" id="bottleneckRadius" classNames={doubleColClasses} min={0.8} max={5} defaultValue={1.2} step={0.01} />
                        <NumberBox label="Bottleneck Tolerance" id="bottleneckTolerance" classNames={doubleColClasses} min={0} max={5} defaultValue={3.0} step={0.1} />
                        <NumberBox label="Max tunnel Similarity" id="maxTunnelSimilarity" classNames={doubleColClasses} min={0} max={1} defaultValue={0.7} step={0.05} />
                        <NumberBox label="Origin Radius" id="originRadius" classNames={doubleColClasses} min={0.1} max={10} defaultValue={5} step={0.05}/>
                        <NumberBox label="Surface Cover Radius" id="surfaceCoverRadius" classNames={doubleColClasses} min={5} max={20} defaultValue={10} step={0.5} />                    

                        <h4>Pores</h4>
                        <CheckBox label="Merge Pores" defaultChecked={false} id="mergePores" classNames={chckColClasses} />
                        <CheckBox label="Automatic Pores" defaultChecked={false} id="automaticPores" classNames={chckColClasses} />
                        <input type="hidden" id="mode" value="Mole" />
                    </div>
        }

        getPoresForm(){
            let doubleColClasses = ["col-md-5","col-md-7"];
            let chckColClasses = doubleColClasses;//["col-md-offset-4 col-md-8"];

            if(this.state.data===null){
                return <div/>
            }

            let pdbid = this.state.data.PdbId;

            return <div className="settings-form basic-settings">
                        <h4>General</h4>
                        <LabelBox label="Structure" text={this.state.data.PdbId} id="pdbid" classNames={doubleColClasses} />
                        <CheckBox label="Beta Structure" defaultChecked={false} id="poresIsBetaStructure" classNames={chckColClasses} />
                        <CheckBox label="Membrane Region" defaultChecked={false} id="poresInMembrane" classNames={chckColClasses} />
                        <TextBox label="Chains" id="poresChains" classNames={doubleColClasses} placeholder="A, B, ..." />
                        <input type="hidden" id="mode" value="Pores" />
                    </div>
        }
    }

    interface ComputationsState{
        computationInfo:Service.CompInfo|null,
        loading:boolean,
        statusInfo: Map<string,string>|null
    };
    export class Submissions extends React.Component<{computationInfo:Service.CompInfo,onResubmit:(info:Service.CompInfo)=>void},ComputationsState>{
        
        state:ComputationsState = {computationInfo:null,loading:true,statusInfo:null}
        private hasKillable = false;
        
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
                                    let s = this.state;
                                    s.statusInfo = map;
                                    this.setState(s);
                                    if(old!==void 0){
                                        let hasKillable = this.checkHasKillable(map);
                                        if(this.hasKillable!==hasKillable){
                                            this.hasKillable = hasKillable;
                                            MoleOnlineWebUI.Bridge.Events.invokeChangeHasKillable(hasKillable);
                                        }    
                                    }
                                }
                            }
                        },(err)=>{
                            if(Config.CommonOptions.DEBUG_MODE)
                                console.log(err);
                        })
                    }
                    map.set(String(status.SubmitId),status.Status);
                }  
                let hasKillable = this.checkHasKillable(map);
                if(this.hasKillable!==hasKillable){
                    this.hasKillable = hasKillable;
                    MoleOnlineWebUI.Bridge.Events.invokeChangeHasKillable(hasKillable);
                }              
                this.setState({computationInfo:computationInfo, loading:false, statusInfo:map});
            });    
        }

        private checkHasKillable(map:Map<string,string>){
            let hasKillable = false;
            map.forEach((val,key,map)=>{
                if(val==="Running"){
                    hasKillable = true;
                    return hasKillable;
                }
            })

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
                let params = CommonUtils.Router.getParameters();
                if(params!==null){
                    submitId=params.submitId;
                }
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
                        <Submission data={s} currentSubmitId={submitId} computationId={this.props.computationInfo.ComputationId} status={(stat===void 0)?"Unknown":stat} onResubmit={this.props.onResubmit}/>
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
    
    function flattenResiduesArray(residuesArrayy:Service.MoleConfigResidue[][]):string{
        let rv = "";
        let idx=0;
        for(let array of residuesArrayy){
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
    }

    function checkCanKill(status:Service.ComputationStatus){
        let result = false;
        switch(status as Service.ComputationStatus){
            case "Running":
                result = true;
                break;
        }
        return result;
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

    export class Submission extends React.Component<{data:Service.Submission, computationId:string, status:string, currentSubmitId:number, onResubmit:(info:Service.CompInfo)=>void},{}>{
        
        componentDidMount(){
        }

        getMoleJob(data:Service.Submission){
            return <div className="panel-body">
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
                Starting points: {(data.MoleConfig.Origin===void 0 || data.MoleConfig.Origin===null)?"":(data.MoleConfig.Origin.Residues===void 0 || data.MoleConfig.Origin.Residues===null || data.MoleConfig.Origin.Residues.length===0)?"":flattenResiduesArray(data.MoleConfig.Origin.Residues)}<br/>
                Starting point[x,y,z]: {(data.MoleConfig.Origin===void 0 || data.MoleConfig.Origin===null)?"":(data.MoleConfig.Origin.Points===void 0 || data.MoleConfig.Origin.Points===null)?"":pointsToString(data.MoleConfig.Origin.Points)}<br/>
                End points: {(data.MoleConfig.CustomExits===void 0 || data.MoleConfig.CustomExits===null)?"":(data.MoleConfig.CustomExits.Residues===void 0 || data.MoleConfig.CustomExits.Residues===null || data.MoleConfig.CustomExits.Residues.length===0)?"":flattenResiduesArray(data.MoleConfig.CustomExits.Residues)}<br/>
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
        }

        getPoresJob(data:Service.Submission){
            return <div className="panel-body">
                <h4>General</h4>
                Chains: {(data.PoresConfig.Chains===void 0)?"":data.PoresConfig.Chains}<br/>
                Is beta structure: {(data.PoresConfig.IsBetaBarel===void 0)?"False":(data.PoresConfig.IsBetaBarel)?"True":"False"}<br/>
                In transmembrane: {(data.PoresConfig.InMembrane===void 0)?"False":(data.PoresConfig.InMembrane)?"True":"False"}<br/>
            </div>
        }

        isMoleJob(data: Service.Submission){
            if(data.MoleConfig===void 0 || data.MoleConfig===null){
                return false;
            }

            let c = data.MoleConfig;
            return !(c.Cavity===void 0 
                && c.CustomExits === void 0
                && c.Input === void 0
                && c.NonActiveResidues === void 0
                && c.Origin === void 0
                && c.PoresAuto === void 0
                && c.PoresMerged === void 0
                && c.QueryFilter === void 0
                && c.Tunnel === void 0);
        }

        render(){
            let currentSubmitId = this.props.currentSubmitId;
            let data = this.props.data;
            //let canKill = checkCanKill(this.props.status as Service.ComputationStatus);
            //let canDelete = checkCanDelete(this.props.status as Service.ComputationStatus);
            let canResubmit = checkCanResubmit(this.props.status as Service.ComputationStatus);

            let contents;
            if(this.isMoleJob(data)){
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
                    <div id={`submit-data-${data.SubmitId}`} className={`panel-collapse collapse${(currentSubmitId.toString()===data.SubmitId.toString())?' in':''}`}>
                        {contents}
                        <div className="panel-footer">
                            <span className="btn btn-xs btn-primary" disabled={!canResubmit} onClick={(()=>this.reSubmit()).bind(this)}>Resubmit</span>
                        </div>
                    </div>
                </div>
            );
        }

        private reSubmit(){
            if(this.props.data.MoleConfig!==void 0){
                Service.ApiService.submitMoleJob(this.props.computationId,this.props.data.MoleConfig).then((result)=>{
                    CommonUtils.Router.fakeRedirect(result.ComputationId, Number(result.SubmitId));
                    LiteMol.Example.Channels.State.removeChannelsData(MoleOnlineWebUI.Bridge.Instances.getPlugin());                

                    Provider.get(result.ComputationId,((compId:string,info:MoleOnlineWebUI.Service.MoleAPI.CompInfo)=>{
                        this.props.onResubmit(info);
                        MoleOnlineWebUI.Bridge.Events.invokeNewSubmit();
                        MoleOnlineWebUI.Bridge.Events.invokeChangeSubmitId(Number(result.SubmitId));
                    }).bind(this), true);
                    MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                        messageType: "Success",
                        message: "Job was successfully resubmited."
                    })
                })
                .catch(err=>{
                    MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                        messageType:"Danger",
                        message: `Resubmit failed with message: ${err}.`
                    });
                });
            }
            else{

            }
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

    function parseResiduesArray(residuesArray:string|undefined):{Chain:string,SequenceNumber:number}[][]{
        if(residuesArray===void 0){
            return [];
        }
        residuesArray = residuesArray.replace(/\]\s*,\s*\[/g,"],[");
        let parts = residuesArray.split("],[");
        let rv = [];
        for(let part of parts){
            part = part.replace(/\[/g,"");
            part = part.replace(/\]/g,"");
            rv.push(parseResidues(part));
        }
        return rv;
    }

    function parseResidues(residues:string|undefined):{Chain:string,SequenceNumber:number}[]{
        if(residues===void 0){
            return [];
        }

        residues = residues.replace(/\s*,\s*/g,",");
        let items = residues.split(',');
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
                let state = this.state;
                state.activeTabIdx = this.props.activeTab;
                this.setState(state);
            }

            let parameters = CommonUtils.Router.getParameters();
            if(parameters!==null){
                let compId = parameters.computationId;
                let submitId = parameters.submitId;
                Provider.get(parameters.computationId,((compId:string,info:MoleOnlineWebUI.Service.MoleAPI.CompInfo)=>{
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
        }

        nullIfEmpty(data:any[][]){
            if(data.length===1&&data[0].length===0){
                return null;
            }

            return data;
        }

        handleSubmit(e:React.FormEvent<HTMLFormElement>){
            e.preventDefault();
            if(this.state.data===void 0){
                return;
            }

            let form = e.target as HTMLFormElement;
            
            let mode = "Mole";

            //Mole
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

            //Pores
            let isBetaStructure = false;
            let inMembrane = false;
            let chains = "";

            for(let idx = 0;idx<form.length;idx++){
                let item = form[idx] as HTMLInputElement;
                let name = item.getAttribute('id');
                switch(name){
                    case 'mode':
                        mode = item.value;
                        break;
                    //Mole
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
                    //Pores
                    case 'poresChains':
                        chains = item.value;
                        break;
                    case 'poresInMembrane':
                        inMembrane = (item.value!=="")?item.checked:false;
                        break;
                    case 'poresIsBetaStructure':
                        isBetaStructure = (item.value!=="")?item.checked:false;
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
                    Residues:this.nullIfEmpty(parseResiduesArray(customExitsResidues)),
                    Points:customExitsPoints,
                    QueryExpression:null
                }
            }

            let promise;
            if(mode === "Mole"){
                let moleFormData:Service.MoleConfig = {
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
                        Residues: this.nullIfEmpty(parseResiduesArray(originResidues)),
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

                promise = Service.ApiService.submitMoleJob(this.state.data.ComputationId, moleFormData)
                
            }
            else{
                let poresFormData: Service.PoresConfig = {
                    Chains: chains,
                    InMembrane: inMembrane,
                    IsBetaBarel: isBetaStructure
                };

                promise = Service.ApiService.submitPoresJob(this.state.data.ComputationId, poresFormData);
            }

            promise
                .then((result:any)=>{
                    CommonUtils.Router.fakeRedirect(result.ComputationId, Number(result.SubmitId));
                    LiteMol.Example.Channels.State.removeChannelsData(MoleOnlineWebUI.Bridge.Instances.getPlugin());                

                    Provider.get(result.ComputationId,((compId:string,info:MoleOnlineWebUI.Service.MoleAPI.CompInfo)=>{
                        let state = this.state;
                        state.data = info;
                        this.setState(state);
                        MoleOnlineWebUI.Bridge.Events.invokeNewSubmit();
                        MoleOnlineWebUI.Bridge.Events.invokeChangeSubmitId(Number(result.SubmitId));
                    }).bind(this), true);
                    MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                        messageType: "Success",
                        message: "Job was successfully submited."
                    })
                })
                .catch((err:any)=>{
                    if(Config.CommonOptions.DEBUG_MODE)
                        console.log(err);
                    MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                        messageType: "Danger",
                        message: "Job submit was not completed succesfully! Please try again later."
                    })
                })
        }

        render(){ 
            let tabs:JSX.Element[]=[];
            
            if(this.state.data !== void 0){
                tabs.push(
                    <Settings initialData={this.state.data} submitId={this.state.submitId}/>
                );
                tabs.push(
                    <Submissions computationInfo={this.state.data} onResubmit={(info)=>{
                        let state = this.state;
                        state.data = info;
                        this.setState(state);
                        }}/>
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
        submitId:number,
        hasKillable:boolean
    }
    interface ControlButtonsProps{
        submitId:number,
        computationInfo:Service.CompInfo|undefined
    }
    export class ControlButtons extends React.Component<ControlButtonsProps,ControlButtonsState>{
        state:ControlButtonsState = {submitId:-1,hasKillable:false}

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

        render(){            
            let canKill = (this.props.computationInfo!==void 0&&this.state.hasKillable);
            let items=this.prepareSubmissionItems(); 
            let idx = this.getSelectedIndex(this.state.submitId,items);
            return <div className="submit-parent">
                    <input className="btn btn-primary submit" type="submit" value="Submit" />
                    <span className="btn btn-primary kill-job-button" data-toggle="modal" data-target="#killJobDialog" disabled={!canKill} onClick={(e=>{e.preventDefault();return false;})}>Kill</span>
                    <span className="btn btn-primary delete-project-button" data-toggle="modal" data-target="#deleteProjectDialog" onClick={(e=>{e.preventDefault();return false;})}>Delete</span>
                    <input className="btn btn-primary submit-arrow" type="button" value=">" disabled={(idx===void 0||idx===items.length-1)?true:void 0} data-value={(idx===void 0||idx===items.length-1)?void 0:items[idx+1].value} onClick={this.changeSubmitIdByStep.bind(this)} />
                    <Common.Controls.SimpleComboBox id="submissionComboSwitch" items={items} defaultSelectedIndex={idx} className="form-control submit-combo" onSelectedChange={this.onSubmitIdComboSelectChange.bind(this)} />
                    <input className="btn btn-primary submit-arrow" type="button" value="<" disabled={(idx===void 0||idx===0)?true:void 0} data-value={(idx===void 0||idx===0)?void 0:items[idx-1].value} onClick={this.changeSubmitIdByStep.bind(this)} />
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
                            Service.ApiService.killRunningJob(this.props.computationInfo.ComputationId).then(()=>{
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
                                    SimpleRouter.GlobalRouter.redirect("/online");
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
                                    <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
        }
    }
}