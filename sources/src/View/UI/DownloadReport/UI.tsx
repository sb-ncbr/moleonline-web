namespace DownloadReport.UI{

    import React = LiteMol.Plugin.React;

    export function render(target: Element) {
        LiteMol.Plugin.ReactDOM.render(<App />, target);
    }

    export class App extends React.Component<{}, {}> {

        componentDidMount(){
        }

        componentWillUnmount(){
        }

        render() {
            return <div>
                <DownloadResultsMenu />
            </div>
        }
    }  

    class BootstrapDropDownMenuItem extends React.Component<{link?: string, linkText:string, targetBlank?: boolean, onClick?:()=>void},{}>{
        render(){
            if(this.props.onClick!==void 0){
                return(
                    <li><a onClick={this.props.onClick}>{this.props.linkText}</a></li>
                );    
            }
            else{
                return(
                    <li><a target={(this.props.targetBlank)?"_blank":""} href={this.props.link}>{this.props.linkText}</a></li>
                );
            }
        }
    }

    class BootstrapDropDownMenuElementItem extends React.Component<{link?: string, linkElement:JSX.Element, targetBlank?: boolean, onClick?:()=>void},{}>{
        render(){
            if(this.props.onClick!==void 0){
                return(
                    <li><a onClick={this.props.onClick}>{this.props.linkElement}</a></li>
                );    
            }
            else{
                return(
                    <li><a target={(this.props.targetBlank)?"_blank":""} href={this.props.link}>{this.props.linkElement}</a></li>
                );
            }
        }
    }

    class BootstrapDropDownMenuButton extends React.Component<{label: string, items: JSX.Element[]},{}>{
        render(){
            return <div className="btn-group dropdown">
                    <button type="button" className="download dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {this.props.label} <span className="glyphicon glyphicon-download"></span>
                    </button>
                    <ul className="dropdown-menu">
                        {this.props.items}
                    </ul>
                </div>
        }
    }

    interface DownloadResultsMenuState{
        computationId:string,
        submitId:number
    }
    class DownloadResultsMenu extends React.Component<{},DownloadResultsMenuState>{
        state = {computationId:"",submitId:0}

        componentDidMount(){
            let params = Common.Util.Router.getParameters();
            if(params!==null){
                let computationId = params.computationId;
                let submitId = params.submitId;
                if(params.isChannelsDB){
                    submitId = -1;
                }
                this.setState({computationId,submitId});    
            }

            MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId((submitId)=>{
                let state = this.state;
                state.submitId = submitId;
                this.setState(state);
            });
        }
        
        render(){                       
            let computationId = this.state.computationId;
            let submitId = `?submitId=${this.state.submitId}`;
            
            let linkBase = `${Config.DataSources.API_URL[Config.DataSources.MODE]}/Data/${computationId}${submitId}`;
            
            let items:JSX.Element[] = [];
        
            if(computationId!==void 0){
                items.push(
                    <BootstrapDropDownMenuItem linkText="Molecule" link={`${linkBase}&format=molecule`} targetBlank={true} />
                );
                if(this.state.submitId>0){
                    items.push(
                        <BootstrapDropDownMenuItem linkText="PyMol" link={`${linkBase}&format=pymol`} targetBlank={true} />
                    );
                    items.push(
                        <BootstrapDropDownMenuItem linkText="VMD" link={`${linkBase}&format=vmd`} targetBlank={true} />
                    );
                    items.push(
                        <BootstrapDropDownMenuItem linkText="PDB" link={`${linkBase}&format=pdb`} targetBlank={true} />
                    );
                    items.push(
                        <BootstrapDropDownMenuItem linkText="Chimera" link={`${linkBase}&format=chimera`} targetBlank={true} />
                    );
                    items.push(
                        <BootstrapDropDownMenuItem linkText="JSON" link={`${linkBase}`} targetBlank={true} />
                    );
                    items.push(
                        <BootstrapDropDownMenuItem linkText="Results" link={`${linkBase}&format=report`} targetBlank={true} />
                    );        
                }        
                if(this.state.submitId!==0){
                    items.push(
                        <BootstrapDropDownMenuItem linkText="PDF report" onClick={()=>{MoleOnlineWebUI.Bridge.Events.invokeRunPDFReport();}}/>
                    );
                }
            }
            return <BootstrapDropDownMenuButton label="Download" items={items} />
        }
    }
}