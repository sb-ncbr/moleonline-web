import React from "react";
import { ApiService } from "../../../MoleAPIService";
import { getParameters } from "../../../Common/Util/Router";

interface State { pdbid?: string, err?: string };

export class PdbIdSign extends React.Component<{}, State> {
    state: State = { pdbid: void 0, err: void 0 };

    componentDidMount() {
        let params = getParameters();
        if (params === null) {
            this.setState({ err: "!!!" });
            return;
        }
        ApiService.getComputationInfoList(params.computationId).then((res) => {
            if (res.PdbId === "" || res.PdbId === null || res.PdbId === void 0) {
                this.setState({ err: "---" });
            }
            else {
                this.setState({ pdbid: res.PdbId });
            }
        })
            .catch(err => {
                this.setState({ err: "<Error>" });
            });
    }

    componentWillUnmount() {
    }

    render() {
        if (this.state.pdbid === void 0) {
            return <div className="current-pbdbid-sign">{(this.state.err === void 0) ? "..." : this.state.err}</div>
        }

        return <div className="current-pbdbid-sign">
            <a href={`https://pdbe.org/${this.state.pdbid}`} target="_blank">{this.state.pdbid} <span className="bi bi-box-arrow-up-right href-ico"></span></a>
        </div>
    }
}  
