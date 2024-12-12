import React from "react";
import { Events, MessageInfo, MessageType } from "../../../Bridge";

declare function $(p: any): any;

let MAX_TICK = 5;
let QUEUE_MAX_LENGTH = 5;

interface MessageWrapper {
    message: MessageInfo,
    tick: number
};

export class AlertMessages extends React.Component<{}, {}> {

    private waitingMessages: MessageInfo[] = [];
    private queue: MessageWrapper[] = [];

    private enqueue(m: MessageInfo) {
        let pkg = {
            message: m,
            tick: MAX_TICK
        }
        this.queue.push(pkg);
    }

    private dequeue() {
        let head = this.queue[0];
        if (head === void 0) {
            return;
        }
        head.tick--;
        if (head.tick < 0) {
            this.queue.shift();
        }
    }

    private tick() {
        this.dequeue();
        if (this.queue.length >= QUEUE_MAX_LENGTH) {
            return;
        }
        let m = this.waitingMessages.shift();
        if (m !== void 0) {
            this.enqueue(m);
        }
        this.forceUpdate();
    }

    public fastDequeue(m: MessageWrapper) {
        this.queue.splice(this.queue.indexOf(m), 1);
        this.forceUpdate();
    }

    componentDidMount() {
        Events.subscribeNotifyMessage((m) => {
            this.waitingMessages.push(
                m
            );
        });
        let watcher = () => {
            this.tick();
            window.setTimeout(watcher, 1000);
        };
        watcher.bind(this)();
    }

    componentWillUnmount() {
    }

    render() {
        let messages = [];
        for (let m of this.queue) {
            messages.push(
                <Message message={m} app={this} />
            );
        }

        let active = (this.queue.length > 0) ? " active" : "";

        return (
            <div className={`alert-messages-container${active}`}>
                {messages}
            </div>
        );
    }
}

class Message extends React.Component<{ message: MessageWrapper, app: AlertMessages }, {}> {
    private getClassByType(type: MessageType) {
        return `alert-${type.toLowerCase()}`;
    }
    render() {
        return <div className={`alert ${this.getClassByType(this.props.message.message.messageType)}`} onClick={(e) => {
            this.props.app.fastDequeue(this.props.message);
        }}>
            {this.props.message.message.message}
        </div>
    }
}

export default AlertMessages;

// import React from "react";
// import { Events, MessageInfo, MessageType } from "../../../Bridge";

// const MAX_TICK = 5;
// const QUEUE_MAX_LENGTH = 5;

// interface MessageWrapper {
//     message: MessageInfo;
//     tick: number;
// }

// export class AlertMessages extends React.Component<{}, {}> {
//     private waitingMessages: MessageInfo[] = [];
//     private queue: MessageWrapper[] = [];

//     private enqueue(m: MessageInfo) {
//         let pkg = {
//             message: m,
//             tick: MAX_TICK,
//         };
//         this.queue.push(pkg);
//     }

//     private dequeue() {
//         let head = this.queue[0];
//         if (head === void 0) {
//             return;
//         }
//         head.tick--;
//         if (head.tick < 0) {
//             this.queue.shift();
//         }
//     }

//     private tick() {
//         this.dequeue();
//         if (this.queue.length >= QUEUE_MAX_LENGTH) {
//             return;
//         }
//         let m = this.waitingMessages.shift();
//         if (m !== void 0) {
//             this.enqueue(m);
//         }
//         this.forceUpdate();
//     }

//     public fastDequeue(m: MessageWrapper) {
//         this.queue.splice(this.queue.indexOf(m), 1);
//         this.forceUpdate();
//     }

//     componentDidMount() {
//         Events.subscribeNotifyMessage((m) => {
//             this.waitingMessages.push(m);
//         });
//         const watcher = () => {
//             this.tick();
//             window.setTimeout(watcher, 1000);
//         };
//         watcher.bind(this)();
//     }

//     componentWillUnmount() {
//         // Clean up any resources if needed
//     }

//     render() {
//         let messages = this.queue.map((m, index) => (
//             <Message key={index} message={m} app={this} />
//         ));

//         return (
//             <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 11 }}>
//                 <div className={`toast-container ${this.queue.length > 0 ? "show" : ""}`}>
//                     {messages}
//                 </div>
//             </div>
//         );
//     }
// }

// class Message extends React.Component<{ message: MessageWrapper; app: AlertMessages }, {}> {
//     private getClassByType(type: MessageType): string {
//         switch (type) {
//             case "Success":
//                 return "success";
//             case "Info":
//                 return "info";
//             case "Warning":
//                 return "warning";
//             case "Danger":
//                 return "danger";
//             default:
//                 return "secondary"; // Default class if no match
//         }
//     }

//     render() {
//         const { message, app } = this.props;

//         return (
//             <div
//                 className={`toast align-items-center text-bg-${this.getClassByType(
//                     message.message.messageType
//                 )} border-0`}
//                 role="alert"
//                 aria-live="assertive"
//                 aria-atomic="true"
//                 onClick={() => app.fastDequeue(message)}
//             >
//                 <div className="d-flex">
//                     <div className="toast-body">{message.message.message}</div>
//                     <button
//                         type="button"
//                         className="btn-close btn-close-white me-2 m-auto"
//                         data-bs-dismiss="toast"
//                         aria-label="Close"
//                         onClick={() => app.fastDequeue(message)}
//                     ></button>
//                 </div>
//             </div>
//         );
//     }
// }

// export default AlertMessages;

