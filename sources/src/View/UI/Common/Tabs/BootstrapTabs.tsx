namespace Common.Tabs.BootstrapTabs{
    import React = LiteMol.Plugin.React;
    import ReactDOM = LiteMol.Plugin.ReactDOM;

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