import React from "react";
import { Events } from "../../../Bridge";

interface State { message: string, visible: boolean };

export class LoadingScreen extends React.Component<{}, State> {
    state: State = { message: "", visible: false };

    componentDidMount() {
        Events.subscribeToggleLoadingScreen(params => {
            let s = this.state;
            s.message = params.message;
            s.visible = params.visible;
            this.setState(s);
        });
    }

    componentWillUnmount() {
    }

    render() {
        return <div className={`loading-screen ${(this.state.visible) ? 'visible' : ''}`}>
            <img src="/images/ajax-loader.gif" />
            <div className="message">{this.state.message}</div>
        </div>
    }
}  