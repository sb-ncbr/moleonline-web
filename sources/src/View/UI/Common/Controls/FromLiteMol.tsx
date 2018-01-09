namespace Common.Controls.FromLiteMol{
    import React = LiteMol.Plugin.React;
    import ReactDOM = LiteMol.Plugin.ReactDOM;
    import LMControls = LiteMol.Plugin.Controls;

    declare function $(p:any,p1?:any): any;

    interface FormControl{};

    export class LMControlWrapper extends React.Component<{controls:JSX.Element[]},{}>{
        render(){

            return <div className="litemol-controls-wrapper">
                <div className="lm-plugin">
                    {this.props.controls}
                </div>
            </div>
        }
    }

    export type ValidationStates = "VALID" | "INVALID"
    export type ValidationStateChangeHandler = (oldState:ValidationStates, newState:ValidationStates)=>void

    export class ValidationState{
        private static validationStates:Map<string,ValidationStates> = new Map<string,ValidationStates>();

        public static getState(validationGroup:string){
            let state = this.validationStates.get(validationGroup);
            if(state === void 0){
                return "VALID";
            }
            
            return state;
        }

        public static setState(validationGroup:string, state: ValidationStates){
            let oldState = this.getState(validationGroup);
            this.validationStates.set(validationGroup,state);
            this.invokeOnStateChangeHandlers(validationGroup,oldState,state);
        }

        private static stateChangeHandlers:Map<string,ValidationStateChangeHandler[]> = new Map<string,ValidationStateChangeHandler[]>();

        public static attachOnStateChangeHandler(validationGroup:string,handler:ValidationStateChangeHandler){
            let groupHandlers = this.stateChangeHandlers.get(validationGroup);
            if(groupHandlers===void 0){
                groupHandlers = [];
            }
            groupHandlers.push(handler);
            this.stateChangeHandlers.set(validationGroup,groupHandlers);
        }

        private static invokeOnStateChangeHandlers(validationGroup:string,oldState:ValidationStates,newState:ValidationStates){
            let groupHandlers = this.stateChangeHandlers.get(validationGroup);
            if(groupHandlers===void 0){
                return;
            }

            for(let h of groupHandlers){
                h(oldState,newState);
            }
        }

        public static reset(validationGroup:string){
            let oldState = this.getState(validationGroup);
            this.validationStates.delete(validationGroup);
            this.invokeOnStateChangeHandlers(validationGroup,oldState,this.getState(validationGroup));
        }
    }

    interface ControlValidationCommonProps{
        validationGroup?:string,
        validate?:(value:string)=>Promise<{valid:boolean,message?:string}>
    }

    interface TextBoxCommonProps extends ControlValidationCommonProps{
        label: string, 
        defaultValue:string,
        placeholder?:string, 
        tooltip?:string,
        onChange?:(value:string)=>void
    };
    interface TextBoxProps extends TextBoxCommonProps{
        onMount?:(control:TextBox)=>void
    }
    interface TextBoxState{
        control:JSX.Element,
        value:string
    }
    export class TextBox extends React.Component<TextBoxProps,TextBoxState> implements FormControl{

        state:TextBoxState = {control:this.createControl(),value:this.props.defaultValue};

        componentDidMount(){
            if(this.props.onMount){
                this.props.onMount(this);
            }
        }

        reset(){
            this.setState({
                value: this.props.defaultValue,
                control: <div/>
            });
            this.setState({
                value: this.props.defaultValue,
                control:this.createControl()
            });
        }

        private createControl(props?:TextBoxProps){
            if(props===void 0){
                props=this.props;
            }

            return LMControls.TextBox({
                defaultValue:props.defaultValue,
                placeholder:props.placeholder,
                onBlur:(e)=>{
                    TextBoxOnBlur(e,this.props.validate,this.props.validationGroup);
                    e.preventDefault();
                },
                onChange:(v)=>{
                    let s = this.state;
                    s.value = v;
                    this.setState(s);
                    if(this.props.onChange!==void 0){
                        this.props.onChange(v);
                    }
                    if(this.props.validationGroup!==void 0){
                        ValidationState.reset(this.props.validationGroup);
                    }
                },
                onKeyPress:(e)=>{
                }
            })
        }

        render(){     
            return <div className='lm-control-row lm-options-group' title={this.props.tooltip}>
                <span>{this.props.label}</span>
                <div>
                    {this.state.control}
                </div>
            </div>
        }
    }

    function TextBoxOnBlur(e:React.FormEvent<HTMLInputElement>,validateFn?:((value: string) => Promise<{valid: boolean,message?: string}>),validationGroup?:string){
        let element = e.currentTarget;        
        if(validateFn!==void 0&&validationGroup!==void 0){
            let prevState = ValidationState.getState(validationGroup);            
            validateFn(element.value).then((validationResult)=>{                            
                if(!validationResult.valid){
                    ValidationState.setState(validationGroup,"INVALID");
                    element.setCustomValidity((validationResult.message!==void 0)?validationResult.message:"Entered value is not valid.");
                    element.focus();
                    $(element).addClass("invalid");
                    $(element).tooltip({
                        trigger: 'manual',
                        placement: 'bottom',
                        title: function(){
                            return validationResult.message;
                        }
                    }).tooltip('show');
                }
                else{
                    element.setCustomValidity("");
                    $(element).removeClass("invalid");
                    CommonUtils.Tooltips.destroy(element);
                }
            })
        }
    }

    interface TextBoxWithHelpProps extends TextBoxCommonProps{
        hint:{link:string,title:string},
        onMount?:(control:TextBoxWithHelp)=>void
    };
    interface TextBoxWithHelpState extends TextBoxState{
    };
    export class TextBoxWithHelp extends React.Component<TextBoxWithHelpProps,TextBoxWithHelpState> implements FormControl{

        state:TextBoxWithHelpState = {control:this.createControl(),value:this.props.defaultValue} 

        componentDidMount(){
            if(this.props.onMount){
                this.props.onMount(this);
            }
        }

        reset(){
            this.setState({
                value: this.props.defaultValue,
                control: <div/>
            });
            this.setState({
                value: this.props.defaultValue,
                control:this.createControl()
            });
        }

        private createControl(props?:TextBoxWithHelpProps){
            if(props===void 0){
                props=this.props;
            }
            return LMControls.TextBox({
                defaultValue:props.defaultValue,
                placeholder:props.placeholder,
                onBlur:(e)=>{
                    TextBoxOnBlur(e,this.props.validate,this.props.validationGroup);
                    e.preventDefault();
                },
                onChange:(v)=>{
                    let s = this.state;
                    s.value = v;
                    this.setState(s);
                    if(this.props.onChange!==void 0){
                        this.props.onChange(v);
                    }
                    if(this.props.validationGroup!==void 0){
                        ValidationState.reset(this.props.validationGroup);
                    }
                },
                onKeyPress:(e)=>{
                }
            })
        }

        render(){
            return <div className='lm-control-row lm-options-group' title={this.props.tooltip}>
                        <span>{this.props.label} <a className="hint" href={this.props.hint.link} target="_blank" title={this.props.hint.title}><span className="glyphicon glyphicon-info-sign"/></a></span>
                        <div>
                            {this.state.control}
                        </div>
                    </div>
        }
    }


    interface NumberBoxProps extends ControlValidationCommonProps{
        label: string, 
        defaultValue:number,
        max:number,
        min:number,
        step?:number,
        placeholder?:string, 
        tooltip?:string,
        onChange?:(value:string)=>void
        onMount?:(control:NumberBox)=>void
    };
    interface NumberBoxState{
        value:number
    }
    export class NumberBox extends React.Component<NumberBoxProps,NumberBoxState> implements FormControl{

        state:NumberBoxState = {value:this.props.defaultValue};

        componentDidMount(){
            if(this.props.onMount){
                this.props.onMount(this);
            }
        }

        reset(){
            this.setState({
                value: this.props.defaultValue,
            });
        }

        render(){         
            return <LMControls.Slider label={this.props.label} min={this.props.min} max={this.props.max} step={this.props.step} value={this.state.value} title={this.props.tooltip} onChange={(v:number)=>{
                let s = this.state;
                s.value = v;
                this.setState(s);
                if(this.props.onChange!==void 0){
                    this.props.onChange(String(v));
                }
            }} />
        }
    }

    interface CheckBoxProps extends ControlValidationCommonProps{
        label: string, 
        defaultValue:boolean, 
        tooltip?:string,
        onChange?:(value:boolean)=>void,
        onMount?:(control:CheckBox)=>void
    };
    interface CheckBoxState{checked:boolean,control:JSX.Element}
    export class CheckBox extends React.Component<CheckBoxProps,CheckBoxState> implements FormControl{
        state:CheckBoxState = {checked:this.props.defaultValue,control:this.createControl()}


        componentDidMount(){
            if(this.props.onMount){
                this.props.onMount(this);
            }
        }

        reset(){
            this.setState({
                checked: this.props.defaultValue,
                control: this.createControl()
            });
        }
        
        private createControl(currentValue?:boolean){
            return LMControls.Toggle({
                label:this.props.label,
                title:this.props.tooltip,
                onChange:(v:boolean)=>{
                    let s = this.state;
                    s.checked = v;
                    s.control = this.createControl(v);
                    this.setState(s);
                    if(this.props.onChange!==void 0){
                        this.props.onChange(v);
                    }
                },
                value:(currentValue!==void 0)?currentValue:this.props.defaultValue
            })
        }

        render(){
            return this.state.control;
        }
    }

    export class ComboBoxItem{
        private value:string
        private label:string
    
        public constructor(value:string,label:string){
            this.value = value;
            this.label = label;
        } 
        
        getValue(){
            return this.value;
        }

        getLabel(){
            return this.label;
        }

        equals(obj:ComboBoxItem){
            return this.label===obj.label && this.value === this.value;
        }

    };

    interface ComboBoxProps{
        label: string, 
        items:ComboBoxItem[], 
        selectedValue:string,
        tooltip?:string,
        onChange?:(v:string)=>void,
        onMount?:(control:ComboBox)=>void
    };
    interface ComboBoxState{
        value:string,
        //selectedItem:ComboBoxItem,
    }
    export class ComboBox extends React.Component<ComboBoxProps,ComboBoxState> implements FormControl{
        
        componentDidMount(){
            if(this.props.onMount){
                this.props.onMount(this);
            }
        }

        componentWillReceiveProps(nextProps:ComboBoxProps){
            if(nextProps.selectedValue!==this.props.selectedValue){
                let s = this.state;
                s.value = nextProps.selectedValue;
                this.setState(s);
            }
        }

        reset(){                        
            this.setState({
                value: this.props.selectedValue,
            });                
        }

        state:ComboBoxState = {
            value:this.props.selectedValue
        }
        
        private getSelectedItemByValue(value:string){
            for(let item of this.props.items){
                if(item.getValue()===value){
                    return item;
                }
            }

            return this.props.items[0];
        }

        render(){
            let currentElement = this.getSelectedItemByValue(this.state.value);

            return <div className='lm-control-row lm-options-group' title={this.props.tooltip}>
                        <span>{this.props.label}</span>
                        <div>
                            <LMControls.OptionsBox caption={(o:ComboBoxItem)=>{return o.getLabel()}} current={currentElement} options={this.props.items} onChange={((o:ComboBoxItem)=>{
                                if(this.props.onChange){
                                    this.props.onChange(o.getValue());
                                }
                                let s = this.state;
                                s.value = o.getValue();
                                this.setState(s);
                            }).bind(this)} />
                        </div>
                    </div>
        }
    }

    interface ControlGroupProps{
        label:string,
        tooltip:string,
        controls:JSX.Element[],
        expanded?:boolean
        onChange?:(e:boolean)=>void
    }
    interface ControlGroupState{
        panel:LMControls.Panel, 
        expanded:boolean
    };
    export class ControlGroup extends React.Component<ControlGroupProps,ControlGroupState>{
        state:ControlGroupState = {panel:this.createPanel((this.props.expanded)?this.props.expanded:false),expanded:(this.props.expanded)?this.props.expanded:false};

        private createPanel(expanded:boolean){
            return new LMControls.Panel({
                header:this.props.label,
                title:this.props.tooltip,
                isExpanded:expanded,
                onExpand:this.onPanelExpand.bind(this),
                //description:"description",
                children:this.props.controls
            });
        }

        componentWillReceiveProps(nextProps:ControlGroupProps){
            if(nextProps.expanded!==void 0&&nextProps.expanded!==this.state.expanded){
                this.onPanelExpand(nextProps.expanded,true);
            }
        }

        private onPanelExpand(e:boolean,supressOnChangeInvoke?:boolean){
            let s = this.state;
            s.expanded = e;
            s.panel = this.createPanel(e);
            this.setState(s);
            
            if(!supressOnChangeInvoke&&this.props.onChange!==void 0){
                this.props.onChange(e);
            }
        }

        render(){            
            return this.state.panel.render();
        }
    }
    
    type PointType = "Residue" | "Point" | "Query";
    type UIPointType = "CSA"|"Residue List"|"3D Point"|"Cofactor"|"Current Selection"|"PatternQuery";

    export const StartingPointTypes = ["CSA","Residue List","3D Point","Cofactor","Current Selection","PatternQuery"];

    export interface StartingPoint{
        type: PointType,
        uiType: UIPointType
        value: any
    }

    export class Point{
        public x:string
        public y:string
        public z:string

        constructor(x:string,y:string,z:string){
            this.x=x;
            this.y=y;
            this.z=z;
        }

        public toString(){
            return `[${this.x}, ${this.y}, ${this.z}]`;
        }
    }

    export class Residue{
        public seqId:number
        public chain:string

        constructor(seqId:number, chain:string){
            this.seqId = seqId;
            this.chain = chain;
        }

        public toString(){
            return `${this.chain}, ${this.seqId}`;
        }
    }

    export interface StartingPointXYZ extends StartingPoint{
        value:Point
    }
    export interface StartingPointResidue extends StartingPoint{
        value:Residue[]
    }
    export interface StartingPointQuery extends StartingPoint{
        value:string
        residue:string
    }

    interface StartingPointBoxProps{
        tooltip:string,
        label:string,
        defaultItems:StartingPoint[]
        defaultMode?:UIPointType,
        noDataText:string,
        onChange?:(currentPoints:StartingPoint[])=>void,
        onMount?:(control:StartingPointBox)=>void
        formGroup:string,
        extraClearGroup?:string
        allowPatternQuery:boolean
    }
    interface StartingPointBoxState{
        items:StartingPoint[],
        mode:UIPointType        
    }
    export class StartingPointBox extends React.Component<StartingPointBoxProps,StartingPointBoxState>{

        state:StartingPointBoxState = {items:this.props.defaultItems, mode: (this.props.defaultMode)?this.props.defaultMode:"Current Selection"}

        componentDidMount(){
            if(this.props.onMount){
                this.props.onMount(this);
            }

            CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                if(formGroup===this.props.formGroup||(this.props.extraClearGroup!==void 0 && formGroup===this.props.extraClearGroup)){
                    this.reset();
                }
            });
        }

        componentWillReceiveProps(nextProps:StartingPointBoxProps){
            if(this.props.defaultItems!==nextProps.defaultItems||this.props.defaultMode!==nextProps.defaultMode){
                this.reset();
            }
        }

        reset(){
            let newMode = (this.props.defaultMode)?this.props.defaultMode:"Current Selection";
            this.setState({
                items:[], 
                mode: newMode
            });
        }

        private getPointValueAsString(point:StartingPoint){
            if(point.type==="Point"){
                return (point.value as Point).toString();
            }
            else if(point.type==="Residue"){
                return (point.value as Residue[]).map((val,idx,arr)=>{return val.toString()}).reduce((prev,cur,idx,arr)=>{return prev+=(idx===0)?'':','+cur;});
            }
            else{
                return point.value as string
            }
        }

        private addNewPointUnique(newPoint:StartingPoint,target:StartingPoint[]){
            for(let t of target){
                //Only one Query point allowed
                if(t.type==="Query" && newPoint.type==="Query"){
                    return target;
                }
                
                if(t.type===newPoint.type&&t.uiType===newPoint.uiType&&this.getPointValueAsString(t)===this.getPointValueAsString(newPoint)){
                    return target;
                }
            }
            
            target.push(newPoint);
            return target;
        }

        private onChange(newPoints:StartingPoint[]){
            let s = this.state;
            let unique = s.items.slice(); 
            for(let p of newPoints){
                unique = this.addNewPointUnique(p,unique);
            }
            s.items = unique;
            this.setState(s);
            if(this.props.onChange!==void 0){
                this.props.onChange(unique.slice());
            }
        }

        remove(item:StartingPoint){
            let newItems = [];
            for(let i of this.state.items){
                if(i.type===item.type&&i.uiType===item.uiType&&this.getPointValueAsString(i)===this.getPointValueAsString(item)){
                    continue;
                }
                newItems.push(i);
            }
            let s = this.state;
            s.items = newItems;
            this.setState(s);

            if(this.props.onChange!==void 0){
                this.props.onChange(newItems.slice());
            }
        }

        render(){
            let comboItems = [];
            for(let i of StartingPointTypes){
                if(!this.props.allowPatternQuery&&(i==="Cofactor"||i=="PatternQuery")){
                    continue;
                }
                comboItems.push(
                    new ComboBoxItem(i,i) 
                );
            }

            let control;
            switch(this.state.mode){
                case "CSA": 
                    control = <StartingPointCSABox label="" tooltip="" onChange={this.onChange.bind(this)} />
                    break;
                case "Current Selection": 
                    control = <StartingPointCurrentSelectionBox label="" tooltip="" onChange={this.onChange.bind(this)} />
                    break;
                case "Cofactor":
                    control = <StartingPointCofactorBox label="" tooltip="" onChange={this.onChange.bind(this)} />
                    break;
                case "Residue List":
                    control = <StartingPointResidueListBox label="" tooltip="" onChange={this.onChange.bind(this)} formGroup={this.props.formGroup} />
                    break;
                case "3D Point":
                    control = <StartingPoint3DPointBox label="" tooltip="" onChange={this.onChange.bind(this)} formGroup={this.props.formGroup} />
                    break;
                case "PatternQuery":
                    control = <StartingPointQueryBox label="" tooltip="" onChange={this.onChange.bind(this)} formGroup={this.props.formGroup} />
            }     

            return  <div>
                        <ComboBox items={comboItems} label={this.props.label} selectedValue={this.state.mode} tooltip={this.props.tooltip} onChange={((v:UIPointType)=>{
                            let s = this.state;
                            s.mode = v;
                            this.setState(s);
                        }).bind(this)} />                 
                        {control}
                        <StartingPointResultsBox items={this.state.items} onRemove={this.remove.bind(this)} noDataText={this.props.noDataText} />
                    </div>
        }
    }

    interface StartingPointResultsBoxProps{
        items:StartingPoint[],
        onRemove:(item:StartingPoint)=>void,
        noDataText:string,
    }
    interface StartingPointResultsBoxState{
        //items:StartingPoint[],
    }
    export class StartingPointResultsBox extends React.Component<StartingPointResultsBoxProps,StartingPointResultsBoxState>{
        
        //state:StartingPointResultsBoxState = {items:this.props.items}

        private generateUIItem(p:StartingPoint){
            let content = "";
            switch(p.type){
                case "Residue":
                    let rp = p as StartingPointResidue;
                    content = CommonUtils.Misc.flattenResidues(rp.value.map((v,i,a)=>{
                            return {
                                SequenceNumber:v.seqId,
                                Chain: v.chain
                            } as MoleOnlineWebUI.Service.MoleAPI.MoleConfigResidue
                        }));
                    break;
                case "Point":
                    let pp = p as StartingPointXYZ;
                    content = CommonUtils.Misc.flattenPoints([pp.value]);
                    break;
                case "Query":
                    let qp = p as StartingPointQuery;
                    content = `${(qp.residue!=="")?qp.residue+': ':''}${qp.value}`;
                    break;
                default: 
                    content = "Unknown type!!!"
            }

            let contentMaxLength = 20;
            let miniContent = content.substr(0,contentMaxLength) + "...";

            return <span title={content}>
                {(content.length>contentMaxLength)?miniContent:content}
            </span>
        }

        removeItem(item:StartingPoint){
            this.props.onRemove(item);
        }

        render(){
            let rows = [];
            for(let i of this.props.items){
                let boxClass = `starting-point-${i.uiType.replace(/\s/g,"-")}`;
                rows.push(<div className="lm-control-row">
                                <span className={boxClass}>{i.uiType}</span>
                                <div>
                                    <LMControls.Button onClick={(e)=>{
                                        this.removeItem(i);
                                    }} children={[this.generateUIItem(i),<span className="glyphicon glyphicon-remove"/>]} />
                                </div>
                        </div>
                );
            }

            if(rows.length===0){
                rows.push(
                    <div className="lm-control-row">
                        <span></span>
                        <div className="empty" title={this.props.noDataText} >{this.props.noDataText}</div>
                    </div>
                );
            }

            return  <div className="starting-point-result-box">
                        <div className="lm-control-row">
                            <span>Selected Points</span>
                        </div>
                        {rows}
                    </div>
        }
    }

    interface StartingPointCurrentSelectionBoxProps{
        tooltip:string,
        label:string,
        onChange?:(newPoint:StartingPoint[])=>void
    }
    interface StartingPointCurrentSelectionBoxState{
    }
    export class StartingPointCurrentSelectionBox extends React.Component<StartingPointCurrentSelectionBoxProps,StartingPointCurrentSelectionBoxState>{
        render(){
            let button = LMControls.CommitButton({
                action:()=>{
                    if(CommonUtils.Selection.SelectionHelper.isSelectedAny() && !CommonUtils.Selection.SelectionHelper.isSelectedAnyChannel()){
                        if(this.props.onChange===void 0){
                            return;
                        }

                        let selectedResidues = CommonUtils.Selection.SelectionHelper.getSelectedResidues();
                        let selectedPoints = CommonUtils.Selection.SelectionHelper.getSelectedPoints();
                        if(selectedResidues.length>0){
                            let newPointData:Residue[] = [];
                            for(let r of selectedResidues){
                                newPointData.push(new Residue(
                                    r.info.authSeqNumber,
                                    r.info.chain.authAsymId)
                                );
                            }
                            this.props.onChange([{
                                type:"Residue",
                                uiType:"Residue List",
                                value: newPointData
                            } as StartingPointResidue]);
                        }
                        else{
                            let newPoints:StartingPointXYZ[] = [];
                            for(let p of selectedPoints){
                                
                                newPoints.push({
                                    type:"Point",
                                    uiType:"3D Point",
                                    value: new Point(p.x,p.y,p.z)
                                } as StartingPointXYZ);
                            }
                            this.props.onChange(newPoints);
                        }
                    }
                },
                isOn:true,
                off:"",
                on:"Add",
            });

            return  <div className='lm-control-row lm-options-group' title={this.props.tooltip}>
                        <span>{this.props.label}</span>
                        <div>
                            {button}
                        </div>
                    </div>
        }
    }

    interface StartingPointCofactorBoxProps{
        tooltip:string,
        label:string,
        onChange?:(newPoint:StartingPoint[])=>void,

    }
    interface StartingPointCofactorBoxState{
        cofactors:Map<string,string>|null,
        isLoading:boolean
        selected:string|null
    }
    export class StartingPointCofactorBox extends React.Component<StartingPointCofactorBoxProps,StartingPointCofactorBoxState>{
        
        state:StartingPointCofactorBoxState = {cofactors:null,isLoading:true,selected:null}

        componentDidMount(){
            MoleOnlineWebUI.DataProxy.Cofactors.DataProvider.get((cofactors)=>{
                let selected = null;
                if(cofactors.size>0){
                    selected = cofactors.keys().next().value;
                }
                this.setState({isLoading:false,cofactors,selected});
            });
        }

        generateItems(cofactors:MoleOnlineWebUI.Service.MoleAPI.Cofactors){
            let items:ComboBoxItem[] = [];
            cofactors.forEach((value,key,map)=>{
                if(!CommonUtils.Residues.currentContextHasResidue(key)||this.state.selected===value){
                    return;
                }
                items.push(
                    new ComboBoxItem(value,key)
                );
            });

            return items;
        }

        private getNoDataMessage(){
            let text = (this.state.isLoading)?"Loading...":"No cofactor starting points available";
            return <div className="starting-point-control-container">
                        <div className="lm-control-row lm-options-group">
                            <span></span>
                            <div className="info" title={text} >{text}</div>
                        </div>
                    </div>
        }   

        render(){

            if(this.state.isLoading||this.state.cofactors===null){
                return this.getNoDataMessage();
            }

            let comboItems = this.generateItems(this.state.cofactors);
            if(comboItems.length===0){
                return this.getNoDataMessage();
            }

            let combo = <ComboBox items={comboItems} label={this.props.label} selectedValue={comboItems[0].getValue()} tooltip={this.props.tooltip} onChange={((v:string)=>{
                let s = this.state;
                s.selected = v;
                this.setState(s);
            }).bind(this)} />    

            let button = LMControls.CommitButton({
                action:()=>{
                    if(this.props.onChange!==void 0&&this.state.cofactors!==null&&this.state.selected!==null){
                        this.props.onChange([{
                            type: "Query",
                            uiType: "Cofactor",
                            value: this.state.cofactors.get(this.state.selected),
                            residue: this.state.selected
                        } as StartingPointQuery]);
                    }
                },
                isOn:true,
                off:"",
                on:"Add",
            });

            return  <div className="starting-point-control-container">
                        {combo}
                        <div className='lm-control-row lm-options-group' title={this.props.tooltip}>
                            <span>{this.props.label}</span>
                            <div>
                                {button}
                            </div>
                        </div>
                    </div>
        }
    }

    interface StartingPointResidueListBoxProps{
        tooltip:string,
        label:string,
        onChange?:(newPoint:StartingPoint[])=>void,
        formGroup:string
    }
    interface StartingPointResidueListBoxState{
        value:string,
        textbox?: JSX.Element
    }

    export class StartingPointResidueListBox extends React.Component<StartingPointResidueListBoxProps,StartingPointResidueListBoxState>{
        
        state:StartingPointResidueListBoxState = {value:"", textbox:void 0}

        private static instanceCounter = 0;

        private onClearGroup = "";

        componentDidMount(){
            this.onClearGroup = "StartingPointResidueListBox"+StartingPointResidueListBox.instanceCounter++;
            CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                if(this.props.formGroup===formGroup||this.onClearGroup===formGroup){
                    let s = this.state;
                    s.value = "";
                    this.setState(s);
                }
            });
        }

        render(){            
            let button = LMControls.CommitButton({
                action:()=>{
                    if(this.props.onChange!==void 0){
                        let newPointData:Residue[] = [];
                        let residueList = CommonUtils.Misc.parseResidues(this.state.value);
                        if(residueList.length===0||residueList.length!==this.state.value.split(",").length){
                            return;
                        }
                        for(let r of residueList){
                            newPointData.push(new Residue(
                                r.SequenceNumber,
                                r.Chain)
                            );
                        }
                        this.props.onChange([{
                            type: "Residue",
                            uiType: "Residue List",
                            value: newPointData,
                        } as StartingPointResidue]);

                        CommonUtils.FormEvents.Events.invokeOnClear(this.onClearGroup);
                    }
                },
                isOn:true,
                off:"",
                on:"Add",
            });

            return  <div className="starting-point-control-container">
                        <TextBox defaultValue="" label="Residue list:" placeholder="A 52, B142,..." onChange={(val)=>{
                            let s = this.state;
                            s.value = val;
                            this.setState(s);
                        }} onMount={(control)=>{
                            CommonUtils.FormEvents.Events.attachOnClearEventHandler(((formGroup:string)=>{
                                if(this.props.formGroup===formGroup||this.onClearGroup===formGroup){
                                    window.setTimeout(()=>control.reset());
                                }
                            }).bind(control));
                        }}/>
                        <div className='lm-control-row lm-options-group' title={this.props.tooltip}>
                            <span>{this.props.label}</span>
                            <div>
                                {button}
                            </div>
                        </div>
                    </div>
        }
    }

    interface StartingPoint3DPointBoxProps{
        tooltip:string,
        label:string,
        onChange?:(newPoint:StartingPoint[])=>void,
        formGroup:string
    }
    interface StartingPoint3DPointBoxState{
        value:string
    }
    export class StartingPoint3DPointBox extends React.Component<StartingPoint3DPointBoxProps,StartingPoint3DPointBoxState>{
        
        state:StartingPoint3DPointBoxState = {value:""}

        private static instanceCounter = 0;
        
        private onClearGroup = "";

        componentDidMount(){
            this.onClearGroup = "StartingPoint3DPointBox"+StartingPoint3DPointBox.instanceCounter++;
            CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                if(this.props.formGroup===formGroup||this.onClearGroup===formGroup){
                    let s = this.state;
                    s.value = "";
                    this.setState(s);
                }
            });
        }

        render(){

            let button = LMControls.CommitButton({
                action:()=>{
                    if(this.props.onChange!==void 0){
                        let newPointData:Residue[] = [];
                        let point = CommonUtils.Misc.parsePoint(this.state.value);
                        if(point===void 0){
                            return;
                        }

                        this.props.onChange([{
                            type: "Point",
                            uiType: "3D Point",
                            value: new Point(point.x,point.y,point.z),
                        } as StartingPointXYZ]);
                    }

                    CommonUtils.FormEvents.Events.invokeOnClear(this.onClearGroup);
                },
                isOn:true,
                off:"",
                on:"Add",
            });

            return  <div className="starting-point-control-container">
                        <TextBox defaultValue={this.state.value} label="3D Point:" placeholder="X, Y, Z" onChange={(val)=>{
                            let s = this.state;
                            s.value = val;
                            this.setState(s);
                        }} onMount={(control)=>{
                            CommonUtils.FormEvents.Events.attachOnClearEventHandler(((formGroup:string)=>{
                                if(this.props.formGroup===formGroup||this.onClearGroup===formGroup){
                                    window.setTimeout(()=>control.reset());
                                }
                            }).bind(control));
                        }}/>
                        <div className='lm-control-row lm-options-group' title={this.props.tooltip}>
                            <span>{this.props.label}</span>
                            <div>
                                {button}
                            </div>
                        </div>
                    </div>
        }
    }

    interface StartingPointCSABoxProps{
        tooltip:string,
        label:string,
        onChange?:(newPoint:StartingPoint[])=>void,

    }
    interface StartingPointCSABoxState{
        data:MoleOnlineWebUI.Service.MoleAPI.CSAResidues|null,
        isLoading:boolean
        selected:string|null
    }
    export class StartingPointCSABox extends React.Component<StartingPointCSABoxProps,StartingPointCSABoxState>{
        
        state:StartingPointCSABoxState = {data:null,isLoading:true,selected:null}

        componentDidMount(){
            let params = Common.Util.Router.getParameters();
            if(params===null){
                console.error("URL parameters not readable!");
                return;
            }
            MoleOnlineWebUI.DataProxy.CSAResidues.DataProvider.get(params.computationId,(compId,csaData)=>{
                let selected = null;
                if(csaData.length>0){
                    selected = CommonUtils.Misc.flattenResidues(csaData[0]);
                }
                this.setState({isLoading:false,data:csaData,selected});
            });
        }

        generateItems(csaDataItems:MoleOnlineWebUI.Service.MoleAPI.CSAResidues){
            let items:ComboBoxItem[] = [];
            for(let item of csaDataItems){
                let flatten = CommonUtils.Misc.flattenResidues(item);
                items.push(
                    new ComboBoxItem(flatten,flatten)
                );
            }

            return items;
        }

        private getNoDataMessage(){
            let text = (this.state.isLoading)?"Loading...":"No CSA starting points available";
            return <div className="starting-point-control-container">
                        <div className="lm-control-row lm-options-group">
                            <span></span>
                            <div className="info" title={text} >{text}</div>
                        </div>
                    </div>
        }   

        render(){
            if(this.state.isLoading||this.state.data===null){
                return this.getNoDataMessage();
            }

            let comboItems = this.generateItems(this.state.data);
            if(comboItems.length===0){
                return this.getNoDataMessage();
            }

            let combo = <ComboBox items={comboItems} label="CSA Active sites" selectedValue={comboItems[0].getValue()} tooltip={this.props.tooltip} onChange={((v:string)=>{
                let s = this.state;
                s.selected = v;
                this.setState(s);
            }).bind(this)} />    

            let button = LMControls.CommitButton({
                action:()=>{
                    if(this.props.onChange!==void 0&&this.state.data!==null&&this.state.selected!==null){
                        this.props.onChange([{
                            type: "Residue",
                            uiType: "CSA",
                            value: CommonUtils.Misc.parseResidues(this.state.selected).map((val,idx,arr)=>{
                                return new Residue(val.SequenceNumber,val.Chain);
                            })
                        } as StartingPointResidue]);
                    }
                },
                isOn:true,
                off:"",
                on:"Add",
            });

            return  <div className="starting-point-control-container">
                        {combo}
                        <div className='lm-control-row lm-options-group' title={this.props.tooltip}>
                            <span>{this.props.label}</span>
                            <div>
                                {button}
                            </div>
                        </div>
                    </div>
        }
    }

    interface StartingPointQueryBoxProps{
        tooltip:string,
        label:string,
        onChange?:(newPoint:StartingPoint[])=>void,
        formGroup:string
    }
    interface StartingPointQueryBoxState{
        value:string,
        isValid:boolean,
        validationInProgress:boolean,
        validationMessage:string
    }
    export class StartingPointQueryBox extends React.Component<StartingPointQueryBoxProps,StartingPointQueryBoxState>{
        
        state:StartingPointQueryBoxState = {value:"", isValid:false,validationInProgress:false,validationMessage:"Query cannot be empty..."}

        private static instanceCounter = 0;
        
        private onClearGroup = "";

        componentDidMount(){
            this.onClearGroup = "StartingPointQueryBox"+StartingPointQueryBox.instanceCounter++;
            CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup)=>{
                if(this.props.formGroup===formGroup||this.onClearGroup===formGroup){
                    let s = this.state;
                    s.value = "";
                    this.setState(s);
                }
            });
        }

        render(){

            let button = LMControls.CommitButton({
                action:()=>{
                    if(this.props.onChange!==void 0&&this.state.isValid&&!this.state.validationInProgress){
                        this.props.onChange([{
                            type: "Query",
                            uiType: "PatternQuery",
                            value: this.state.value,
                            residue: ""
                        } as StartingPointQuery]);
                    }
                },
                isOn:(this.state.isValid&&!this.state.validationInProgress),
                off:this.state.validationMessage,
                on:"Add",
            });

            return  <div className="starting-point-control-container">
                        <TextBox defaultValue={this.state.value} label="Query:" placeholder="Residues('GOL')" onChange={(val)=>{
                            let s = this.state;
                            s.value = val;
                            s.isValid = false;
                            s.validationInProgress = true;
                            s.validationMessage = "Validation in progress... Please wait.";
                            this.setState(s);
                            CommonUtils.Validators.validatePatternQuery(val).then((result)=>{
                                let s1 = this.state;
                                s1.isValid = result.valid;
                                s1.value = val;
                                s1.validationInProgress= false;

                                if(result.valid){
                                    s1.validationMessage = "";
                                    
                                }
                                else{
                                    s1.validationMessage = (result.message!==void 0)?result.message:"Unkown validation error...";
                                }
                                this.setState(s1);
                            }).catch((err)=>{
                                let s1 = this.state;
                                s1.isValid = false;
                                s1.value = val;
                                s1.validationInProgress= false;
                                s1.validationMessage = "Validation API not available. Please try again later.";
                                this.setState(s1);
                            })
                        }} onMount={(control)=>{
                            CommonUtils.FormEvents.Events.attachOnClearEventHandler(((formGroup:string)=>{
                                if(this.props.formGroup===formGroup||this.onClearGroup===formGroup){
                                    window.setTimeout(()=>control.reset());
                                }
                            }).bind(control));
                        }}/>
                        <div className='lm-control-row lm-options-group' title={this.props.tooltip}>
                            <span>{this.props.label}</span>
                            <div>
                                {button}
                            </div>
                        </div>
                    </div>
        }
    }
}