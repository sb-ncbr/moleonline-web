namespace LoadingScreen.UI{
    
        import React = LiteMol.Plugin.React
        import LiteMoleEvent = LiteMol.Bootstrap.Event;
    
        export function render(target: Element) {
            LiteMol.Plugin.ReactDOM.render(<App />, target);
        }
        interface State{message:string,visible:boolean};
        export class App extends React.Component<{}, State> {
            state:State = {message:"", visible:false};
    
            componentDidMount(){
                MoleOnlineWebUI.Bridge.Events.subscribeToggleLoadingScreen(params=>{
                    let s = this.state;
                    s.message = params.message;
                    s.visible = params.visible;
                    this.setState(s);
                });
            }
    
            componentWillUnmount(){
            }
    
            render() {    
                return <div className={`loading-screen ${(this.state.visible)?'visible':''}`}>
                    <img src="images/ajax-loader.gif" />
                    <div className="message">{this.state.message}</div>
                </div>
            }
        }  
    }