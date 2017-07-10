namespace DownloadReport.UI{

    import React = LiteMol.Plugin.React
    import LiteMoleEvent = LiteMol.Bootstrap.Event;

    export function render(target: Element) {
        LiteMol.Plugin.ReactDOM.render(<App />, target);
    }

    export class App extends React.Component<{}, {}> {

        componentDidMount() {
        }

        componentWillUnmount(){
        }

        render() {
            return <div>
                <DownloadResultsMenu />
            </div>
        }
    }  

    class BootstrapDropDownMenuItem extends React.Component<{link: string, linkText:string, targetBlank: boolean},{}>{
        render(){
            return(
                <li><a target={(this.props.targetBlank)?"_blank":""} href={this.props.link}>{this.props.linkText}</a></li>
            );
        }
    }

    class BootstrapDropDownMenuElementItem extends React.Component<{link: string, linkElement:JSX.Element, targetBlank: boolean},{}>{
        render(){
            return(
                <li><a target={(this.props.targetBlank)?"_blank":""} href={this.props.link}>{this.props.linkElement}</a></li>
            );
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

    class DownloadResultsMenu extends React.Component<{},{}>{
        render(){
            let pdbid = SimpleRouter.GlobalRouter.getCurrentPid();
            let linkBase = `https://webchem.ncbr.muni.cz/API/ChannelsDB/Download/${pdbid}`;
            let items:JSX.Element[] = [];
        
            items.push(
                <BootstrapDropDownMenuItem linkText=".zip" link={`${linkBase}?type=zip`} targetBlank={true} />
            );
            items.push(
                <BootstrapDropDownMenuItem linkText=".pdb" link={`${linkBase}?type=pdb`} targetBlank={true} />
            );
            items.push(
                <BootstrapDropDownMenuItem linkText=".json" link={`${linkBase}?type=json`} targetBlank={true} />
            );
            items.push(
                <BootstrapDropDownMenuItem linkText=".py" link={`${linkBase}?type=py`} targetBlank={true} />
            );
            return <BootstrapDropDownMenuButton label="Download report" items={items} />
        }
    }
}