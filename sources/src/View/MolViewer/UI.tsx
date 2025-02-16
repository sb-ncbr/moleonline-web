/**
 * Copyright (c) 2024 channelsdb contributors, licensed under Apache 2.0, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
import { Plugin } from "molstar/lib/mol-plugin-ui/plugin";
import React from "react";
import { Context } from "../Context";

export class Viewer extends React.Component<{ context: Context }> {

    render() {
        return <Plugin plugin={this.props.context.plugin} />;
    }
}
