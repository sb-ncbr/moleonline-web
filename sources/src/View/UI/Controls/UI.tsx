namespace Controls.UI{
    import React = LiteMol.Plugin.React;
    import ReactDOM = LiteMol.Plugin.ReactDOM;
    import TunnelUtils = CommonUtils.Tunnels;
    import Provider = MoleOnlineWebUI.DataProxy.ComputationInfo.DataProvider;

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
        }

        componentWillUnmount(){
        }

        render() {            
            return (
                <SubmitForm />
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
                    <div className={`${classNames[0]}`}>                 
                        <div className="checkbox">
                            <label><input type="checkbox" id={this.props.id} defaultChecked={this.props.defaultChecked} />{this.props.label}</label>
                        </div>
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

    export interface SubmitFormData{
        pdbid: string
    };
    export class BasicSettings extends React.Component<{initialData:SubmitFormData},{data:SubmitFormData}>{
        
        state = {data:{pdbid:""}}
        
        componentDidMount(){
            let parameters = CommonUtils.UrlParameters.getParameters();
            if(parameters!==null){
                let compId = parameters.computationId;
                Provider.get(parameters.computationId,(compId:string,info:MoleOnlineWebUI.Service.MoleAPI.CompInfo)=>{
                    this.setState({data:{pdbid:info.PdbId}});
                });
            }
            this.setState({data: this.props.initialData});    
        }
        
        render(){
            let doubleColClasses = ["col-md-4","col-md-8"];
            let chckColClasses = ["col-md-offset-4 col-md-8"];
            return (
                <div className="basic-settings">
                    <LabelBox label="Structure" text={this.state.data.pdbid} id="pdbid" classNames={doubleColClasses} />
                    <CheckBox label="Automatic starting points" defaultChecked={false} id="automaticStartingPoints" classNames={chckColClasses} />
                    <TextBox label="Starting point" id="origin" classNames={doubleColClasses} />
                    <LabelBox label="Active sites from CSA" text="TODO:..." id="activeSites" classNames={doubleColClasses} />
                    <CheckBox label="Automatic endpoints" defaultChecked={false} id="automaticEndPoints" classNames={chckColClasses} />
                    <TextBox label="End point" id="endpoint" classNames={doubleColClasses} />
                    <CheckBox label="Ignore all HETATM" defaultChecked={false} id="ignoreAllHetatm" classNames={chckColClasses} />
                </div>
            );
        }
    }
    export class AdvancedSettings extends React.Component<{initialData:SubmitFormData},{data:SubmitFormData}>{
        
        state = {data:{pdbid:""}}
        
        componentDidMount(){
            this.state.data = this.props.initialData;    
        }

        render(){
            return (
                <div>
                    TODO:...
                </div>
            );
        }
    }

    export class SubmitForm extends React.Component<{activeTab?: number},{activeTabIdx: number}>{          
        
        state = {activeTabIdx:0}
        
        componentDidMount(){
            if(this.props.activeTab !== void 0){
                this.state.activeTabIdx = this.props.activeTab;
            }
        }

        render(){
            let tabs:JSX.Element[]=[];
            tabs.push(
                <BasicSettings initialData={{pdbid:""}} />
            );
            tabs.push(
                <AdvancedSettings initialData={{pdbid:""}} />
            );

            return (
                <div className="submit-form-container">
                    <form className="form-horizontal">
                        <Common.Tabs.BootstrapTabs.TabbedContainer header={["Settings","Advanced Settings"]} tabContents={tabs} namespace="right-panel-tabs-" htmlClassName="tabs" htmlId="right-panel-tabs" activeTab={this.props.activeTab}/>
                        <SubmitButton />
                    </form>
                    <div id="right-panel-toggler" className="toggler btn-xs btn-primary glyphicon glyphicon-resize-vertical"></div>
                </div>
            );
        }
    }

    export class SubmitButton extends React.Component<{},{}>{
        render(){
            return <div className="submit-parent">
                    <input className="btn btn-primary submit" type="submit" value="Submit" />
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