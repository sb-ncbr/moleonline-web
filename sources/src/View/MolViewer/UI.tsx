/**
 * Copyright (c) 2024 channelsdb contributors, licensed under Apache 2.0, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
// import type { Context } from "../Context";
import { Plugin } from "molstar/lib/mol-plugin-ui/plugin";
import React from "react";
import { getParameters } from "../../Common/Util/Router"
import { ApiService } from "../../MoleAPIService";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { Context } from "../Context";
require("molstar/lib/mol-plugin-ui/skin/light.scss");

export class Viewer extends React.Component<{ context: Context }> {

    render() {
        // let params = getParameters();
        // if (params === null) {
        //     // this.setState({ err: "!!!" });
        //     return;
        // }
        // ApiService.getComputationInfoList(params.computationId).then((res) => {
        //     if (res.PdbId === "" || res.PdbId === null || res.PdbId === void 0) {
        //         // this.setState({ err: "---" });
        //     }
        //     else {
        //         // this.setState({ pdbid: res.PdbId });
        //         this.props.context.load(`https://models.rcsb.org/${res.PdbId}.bcif`, true);
        //         console.log(this.props.context.plugin)
        //         // console.log(this.props.context.plugin.state.data.tree.children.asMutable());
        //         // console.log(this.props.context.plugin.state.data.cells.get("-=root=-"));
        //         // console.log(this.props.context.plugin.state.data.cells.size);
        //     }
        // })
        // .catch(err => {
        //     this.setState({ err: "<Error>" });
        // });
        return <Plugin plugin={this.props.context.plugin} />;
    }
//         this.props.context.load(`https://models.rcsb.org/${pid}.bcif`, true)
}
