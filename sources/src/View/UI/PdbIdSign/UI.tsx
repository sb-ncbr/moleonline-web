namespace PdbIdSign.UI{

    import React = LiteMol.Plugin.React
    import LiteMoleEvent = LiteMol.Bootstrap.Event;

    export function render(target: Element) {
        LiteMol.Plugin.ReactDOM.render(<App />, target);
    }

    export class App extends React.Component<{}, {pdbid:string|undefined,err?:string}> {
        state = {pdbid:void 0, err: void 0}

        componentDidMount(){
            let params = CommonUtils.Router.getParameters();
            if(params===null){
                this.setState({err:"<Error>"});
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
                return <div>{(this.state.err===void 0)?"<Unknown>":this.state.err}</div>
            }

            return <div>
                <a href={`https://pdbe.org/${this.state.pdbid}`} target="_blank">{this.state.pdbid} <span className="glyphicon glyphicon-new-window href-ico"></span></a>
            </div>
        }
    }  
}