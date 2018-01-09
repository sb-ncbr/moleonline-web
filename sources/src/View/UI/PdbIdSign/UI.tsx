namespace PdbIdSign.UI{

    import React = LiteMol.Plugin.React
    import LiteMoleEvent = LiteMol.Bootstrap.Event;

    export function render(target: Element) {
        LiteMol.Plugin.ReactDOM.render(<App />, target);
    }
    interface State{pdbid?:string,err?:string};
    export class App extends React.Component<{}, State> {
        state:State = {pdbid:void 0, err: void 0};

        componentDidMount(){
            let params = Common.Util.Router.getParameters();
            if(params===null){
                this.setState({err:"!!!"});
                return;
            }
            MoleOnlineWebUI.Service.MoleAPI.ApiService.getComputationInfoList(params.computationId).then((res)=>{
               this.setState({pdbid:res.PdbId}); 
            })
            .catch(err=>{
                this.setState({err:"<Error>"});
            });
        }

        componentWillUnmount(){
        }

        render() {
            if(this.state.pdbid===void 0){
                return <div>{(this.state.err===void 0)?"...":this.state.err}</div>
            }

            return <div>
                <a href={`https://pdbe.org/${this.state.pdbid}`} target="_blank">{this.state.pdbid} <span className="glyphicon glyphicon-new-window href-ico"></span></a>
            </div>
        }
    }  
}