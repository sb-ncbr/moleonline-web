import React from "react";
import { ComputationInfo } from "../../../DataProxy";
import { getParameters } from "../../../Common/Util/Router";
import { CommonOptions } from "../../../../config/common";

// The ChannelsDB button: opens the PDB entry in ChannelsDB, disabled for an uploaded structure
export class Annotate extends React.Component<{}, { computationId?: string, pdbid: string | null }> {
    state = { computationId: void 0 as string | undefined, pdbid: null as string | null };

    componentDidMount() {
        const params = getParameters();
        if (params === null) {
            return;
        }
        this.setState({ computationId: params.computationId });
        ComputationInfo.DataProvider.get(params.computationId, (_compId, info) => {
            this.setState({ pdbid: info.PdbId ? info.PdbId : null });
        });
    }

    render() {
        if (this.state.computationId === void 0) {
            return <div className="annotate" />
        }

        const pdbid = this.state.pdbid;
        return <div className="annotate">
            <div className="btn-group dropdown">
                <button type="button" disabled={pdbid === null} className="channelsdb dropdown-toggle" data-bs-toggle="dropdown" aria-current="page" aria-expanded="false">
                    <img src="/images/ChannelsDBlogo_transparent.png" />
                </button>
                <ul className="dropdown-menu">
                    {pdbid !== null &&
                        <li><a className="dropdown-item" target="_blank" href={`${CommonOptions.CHANNELSDB_LINK_DETAIL_URL}/${pdbid}`}>Open in ChannelsDB</a></li>}
                </ul>
            </div>
        </div>
    }
}
