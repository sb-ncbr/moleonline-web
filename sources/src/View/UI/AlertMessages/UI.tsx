namespace AlertMessages.UI{

    import React = LiteMol.Plugin.React
    import LiteMoleEvent = LiteMol.Bootstrap.Event;

    declare function $(p:any): any;

    let MAX_TICK=5;
    let QUEUE_MAX_LENGTH=5;

    export function render(target: Element) {
        LiteMol.Plugin.ReactDOM.render(<App />, target);
    }

    interface MessageWrapper{
        message: MoleOnlineWebUI.Bridge.MessageInfo,
        tick: number
    };

    export class App extends React.Component<{}, {}> {
        
        private waitingMessages: MoleOnlineWebUI.Bridge.MessageInfo[] = [];
        private queue: MessageWrapper[] = [];

        private enqueue(m:MoleOnlineWebUI.Bridge.MessageInfo){
            let pkg = {
                message:m,
                tick:MAX_TICK
            }
            this.queue.push(pkg);
        }

        private dequeue(){
            let head = this.queue[0];
            if(head===void 0){
                return;
            }
            head.tick--;
            if(head.tick<0){
                this.queue.shift();
            }
        }

        private tick(){
            this.dequeue();
            if(this.queue.length>=QUEUE_MAX_LENGTH){
                return;
            }
            let m = this.waitingMessages.shift();
            if(m!==void 0){
                this.enqueue(m);
            }
            this.forceUpdate();
        }

        componentDidMount(){
            MoleOnlineWebUI.Bridge.Events.subscribeNotifyMessage((m)=>{
                this.waitingMessages.push(
                    m
                );
            });
            let watcher = ()=>{
                this.tick();
                window.setTimeout(watcher, 1000);
            };
            watcher.bind(this)();
        }

        componentWillUnmount(){
        }

        render() {
            let messages = [];
            for(let m of this.queue){
                messages.push(
                    <Message message={m} />
                );
            }
            return(
                <div className="alert-messages-container">
                    {messages}
                </div>
            );
        }
    }

    class Message extends React.Component<{message:MessageWrapper},{}>{
        private getClassByType(type:MoleOnlineWebUI.Bridge.MessageType){
            return `alert-${type.toLowerCase()}`;
        }
        render(){
            return <div className={`alert ${this.getClassByType(this.props.message.message.messageType)}`}>
                {this.props.message.message.message}
            </div>
        }
    }
} 