
import React from "react";
import { Tunnel } from "../../../DataInterface";
import { Tunnels } from "../../CommonUtils/Tunnels";
import { SelectionHelper } from "../../CommonUtils/Selection";
import { Datagrid, DGNoDataInfoRow, DGRowEmpty, headCell, propertyRow } from "../Common/Datagrid/Components";
import { roundToDecimal } from "../../../Common/Util/Numbers";

let DGTABLE_COLS_COUNT = 2;
let NO_DATA_MESSAGE = "Select channel in 3D view for details...";

declare function $(p: any): any;

interface State {
    data: Map<string, Tunnel[]> | null,
    currentTunnel: string | null,
    currentSubmission: string | null,
    app: ChannelParameters
};

export class ChannelParameters extends React.Component<{}, State> {

    private unsubscribe: (() => void)[] = [];

    state: State = {
        data: null,
        currentTunnel: null,
        currentSubmission: null,
        app: this,
    };

    layerIdx = -1;

    componentDidMount() {
        this.unsubscribe.push(Tunnels.attachOnTunnelsLoaded(() => {
            const submissionsMap: Map<string, Tunnel[]> = new Map();
            const channelsDB = Tunnels.getChannelsDB();
            if (channelsDB) {
                const concatChannelsDB = Tunnels.concatAllCategories(channelsDB);
                submissionsMap.set('ChannelsDB', concatChannelsDB);
            }
            const submissions = Tunnels.getChannels();
            for (const submission of Array.from(submissions.keys())) {
                const channels = submissions.get(submission);
                if (channels) {
                    const concatDataChannels = Tunnels.concatAllCategories(channels);
                    submissionsMap.set(submission === '-2' ? 'FromFile' : submission, concatDataChannels);
                }
            }
            this.setState({ data: submissionsMap });
        }));
        this.unsubscribe.push(SelectionHelper.attachOnChannelSelectHandler((data, channelId, submissionId) => {
            if (channelId === void 0 || submissionId === void 0) {
                return;
            }
            let state = this.state;
            state.currentTunnel = channelId;
            state.currentSubmission = submissionId;
            this.setState(state);
            setTimeout(function () {
                $(window).trigger('contentResize');
            }, 1);
        }));

        this.unsubscribe.push(SelectionHelper.attachOnChannelDeselectHandler(() => {
            let state = this.state;
            state.currentTunnel = null;
            this.setState(state);
        }));
    }

    componentWillUnmount() {
        this.unsubscribe.forEach(u => u());
        this.unsubscribe = [];
    }

    render() {
        return <div>
            <Datagrid id="dg-channel-parameters" columnsCount={DGTABLE_COLS_COUNT} noDataText={NO_DATA_MESSAGE}
                head={<>{headCell('Property', 1)}{headCell('Value', 2)}</>}
                body={(this.state.data !== null && this.state.currentTunnel !== null) ? <DGBody {...this.state} /> : null} />
        </div>;
    }
}

class DGBody extends React.Component<State, {}> {

    private generateRows() {
        if (this.props.data === null) {
            return <DGNoDataInfoRow columnsCount={DGTABLE_COLS_COUNT} infoText={NO_DATA_MESSAGE} />;
        }
        const t = this.props.data.get(this.props.currentSubmission!)?.find(t => t.Id === this.props.currentTunnel);
        const p = t?.Properties;
        const round = (value: number) => roundToDecimal(value, 2).toString();
        const optional = (value: number | undefined) => value ? roundToDecimal(value, 2) : 'N/A';
        const rows = (t === undefined || p === undefined) ? [] : [
            propertyRow('length', 'bi bi-arrows-expand', 'Length', round(Tunnels.getLength(t))),
            propertyRow('bottleneck', 'icon bottleneck black', 'Bottleneck', Tunnels.getBottleneck(t)),
            propertyRow('hydropathy', 'bi bi-droplet', 'Hydropathy', round(p.Hydropathy)),
            propertyRow('charge', 'bi bi-lightning', 'Charge', round(p.Charge)),
            propertyRow('polarity', 'bi bi-plus', 'Polarity', round(p.Polarity)),
            propertyRow('mutability', 'bi bi-scissors', 'Mutability', round(p.Mutability)),
            propertyRow('logP', 'icon logp black', 'LogP', optional(p.LogP)),
            propertyRow('logD', 'icon logd black', 'LogD', optional(p.LogD)),
            propertyRow('logS', 'icon logs black', 'LogS', optional(p.LogS)),
            propertyRow('ionizable', 'icon ionizable black', 'Ionizable', optional(p.Ionizable)),
        ];
        return [...rows, <DGRowEmpty key={'empty'} columnsCount={DGTABLE_COLS_COUNT} />];
    }

    render() {
        let rows = this.generateRows();

        return (
            <table>
                <tbody>
                    {rows}
                </tbody>
            </table>
        );
    };
}    
