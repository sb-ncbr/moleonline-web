import React from "react";
import { Context } from "../../Context";
import { PluginReactContext } from "molstar/lib/mol-plugin-ui/base";
import { MoleSequenceView } from "./MoleSequenceView";
import "molstar/lib/mol-plugin-ui/skin/light.scss";

export class SequenceViewer extends React.Component<{ controller: Context }> {
    render() {
        return <div className="seq-container">
                    <PluginReactContext.Provider value={this.props.controller.plugin}>
                        <MoleSequenceView />
                    </PluginReactContext.Provider>
                </div>
    }
}