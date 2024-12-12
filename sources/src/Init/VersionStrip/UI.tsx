// import ApiService = MoleOnlineWebUI.Service.MoleAPI.ApiService;
// import MoleAPI = MoleOnlineWebUI.Service.MoleAPI;

import React from "react";
import { ApiService } from "../../MoleAPIService";

declare function $(p: any): any;

interface State {
    app: VersionStrip,
    versions: Versions
};

interface Versions {
    uiVersion: string,
    moleVersion: string,
    apiVersion: string,
    poresVersion: string
}

export class VersionStrip extends React.Component<{}, State> {
    private computationId: string;
    private submitId: number;

    state: State = {
        app: this,
        versions: {
            apiVersion: "loading...",
            moleVersion: "loading...",
            poresVersion: "loading...",
            uiVersion: "loading..."
        }
    };

    componentDidMount() {
        let s = this.state;
        s.versions.uiVersion = $("#version-block").data("ui-version");
        this.setState(s);

        ApiService.getVersions().then(val => {
            let s1 = this.state;
            s1.versions.apiVersion = `${val.APIVersion} (${val.Build})`;
            s1.versions.moleVersion = val.MoleVersion;
            s1.versions.poresVersion = val.PoresVersion
            this.setState(s1);
        });
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <div className="version-strip">
                {`WEB UI Version: ${this.state.versions.uiVersion} | API Version: ${this.state.versions.apiVersion} | MOLE Version: ${this.state.versions.moleVersion} | Pores Version: ${this.state.versions.poresVersion}`}
            </div>
        );
    }
}
