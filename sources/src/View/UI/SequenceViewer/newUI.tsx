import React from "react";
import { Context } from "../../Context";
import { Events } from "../../../Bridge";
import { PluginReactContext } from "molstar/lib/mol-plugin-ui/base";
import { MoleSequenceView } from "./MoleSequenceView";
require("molstar/lib/mol-plugin-ui/skin/light.scss");

type State = {
    minimized: boolean,
    structureRef: string,
    modelEntityId: string,
    chainGroupId: number,
    operatorKey: string,
};

export class SequenceViewer extends React.Component<{ controller: Context }, State> {
    state: State = {
        minimized: false,
        structureRef: '',
        modelEntityId: '',
        chainGroupId: -1,
        operatorKey: '',
    };

    render() {
        return <div className="seq-container">
                    <PluginReactContext.Provider value={this.props.controller.plugin}>
                        <MoleSequenceView />
                    </PluginReactContext.Provider>
                </div>
                {/* <Header onClick={() => {
                    let s = this.state;
                    let newMinimized = !s.minimized;
                    s.minimized = newMinimized;
                    this.setState(s);

                    Events.invokeOnSequneceViewerToggle({ minimized: newMinimized });
                }} /> */}
    }
}

class Header extends React.Component<{ onClick: () => void }, {}> {
    render() {
        return <div className="sequence-viewer-header" onClick={this.props.onClick}>
            Protein Sequence <span className="bi bi-arrows-expand"></span>
        </div>
    }
}