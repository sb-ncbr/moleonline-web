namespace Controls.UI{
    import React = LiteMol.Plugin.React;
    import ReactDOM = LiteMol.Plugin.ReactDOM;
    import TunnelUtils = CommonUtils.Tunnels;

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

    export class TextBox extends React.Component<{label: string, id:string, placeholder?:string},{}>{
        render(){
            return (
                <div className="form-group">
                    <label className="control-label col-sm-2" htmlFor={this.props.id}>{this.props.label}:</label>
                    <div className="col-sm-10">
                        <input type="text" className="form-control" id={this.props.id} placeholder={this.props.placeholder}/>
                    </div>
                </div>
            );
        }
    }
    export class CheckBox extends React.Component<{label: string, id:string, defaultChecked?:boolean},{}>{
        render(){
            return (
                <div className="form-group"> 
                    <div className="col-sm-offset-2 col-sm-10">                 
                        <div className="checkbox">
                            <label><input type="checkbox" id={this.props.id} defaultChecked={this.props.defaultChecked} />{this.props.label}</label>
                        </div>
                    </div>
                </div>
            );
        }
    }
    export class LabelBox extends React.Component<{label: string, text:string, id:string},{}>{
        render(){
            return (
                <div className="form-group">
                    <label className="control-label col-sm-2" htmlFor={this.props.id}>{this.props.label}:</label>
                    <div className="col-sm-10">
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
            this.state.data = this.props.initialData;    
        }
        
        render(){
            return (
                <div>
                    <LabelBox label="Structure" text={this.state.data.pdbid} id="pdbid" />
                    <CheckBox label="Automatic starting points" defaultChecked={false} id="automaticStartingPoints" />
                    <TextBox label="Starting point" id="origin" />
                    <LabelBox label="Active sites from CSA" text="TODO:..." id="activeSites"/>
                    <CheckBox label="Automatic endpoints" defaultChecked={false} id="automaticEndPoints"/>
                    <TextBox label="End point" id="endpoint" />
                    <CheckBox label="Ignore all HETATM" defaultChecked={false} id="ignoreAllHetatm" />
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
                <div>
                    <form className="form-horizontal">
                        <Common.Tabs.BootstrapTabs.TabbedContainer header={["Settings","Advanced Settings"]} tabContents={tabs} namespace="right-panel-tabs-" htmlClassName="tabs" htmlId="right-panel-tabs" activeTab={this.props.activeTab}/>,
                    </form>
                    <div id="right-panel-toggler" className="toggler btn-xs btn-primary glyphicon glyphicon-resize-vertical"></div>
                </div>
            );
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