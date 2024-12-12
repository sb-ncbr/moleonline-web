import React from "react";
import { Context } from "./Context";
import { Viewer } from "./MolViewer/UI";
import { SequenceViewer } from "./UI/SequenceViewer/newUI";
import { QuickHelp } from "./UI/QuickHelp/UI";
import { LayerVizualizer } from "./UI/LayerVizualizer/UI";
import { AglomeredParameters } from "./UI/AglomeredParameters/UI";
import { LayersVizualizerSettings, Vizualizer } from "./LayerVizualizer/Vizualizer";
import { Instances } from "../Bridge";
import { LayerProperties } from "./UI/LayerProperties/UI";
import { LayerResidues } from "./UI/LayerResidues/UI";
import { LiningResidues } from "./UI/LiningResidues/UI";
import { ChannelParameters } from "./UI/ChannelParameters/UI";
import { doAfterCollapseActivated, leftPanelTabs } from "./CommonUtils/Tabs";
import { PluginControl } from "./UI/PluginControl/UI";
import { PluginControl as ChannelsControl } from "./UI/PluginControl/ChannelsUI";
import { PluginReactContext } from "molstar/lib/mol-plugin-ui/base";
import { Controls } from "./UI/Controls/UI";
import { getParameters } from "../Common/Util/Router";
import { Events } from "../Bridge";
import { CommonOptions } from "../../config/common";
import { generateGuidAll, loadAllChannels, loadData } from "./State";
import { StateSelection } from "molstar/lib/mol-state";
import { ChannelsDBChannels, ChannelsDBData, MoleData } from "../DataInterface";
import { ComputationInfo } from "../DataProxy";
import { ApiService, CompInfo } from "../MoleAPIService";
import { ChannelsDBData as ChannelsDBDataCache, TunnelName } from "../Cache"
import { Tunnels } from "./CommonUtils/Tunnels";

declare function $(p: any): any;

export class LeftPanel extends React.Component<{ context: Context }, { isLoading?: boolean, error?: string, data?: any, isWaitingForData?: boolean, channelsData: Map<number, ChannelsDBChannels>, compId: string, isLoadingChannels: boolean }> {
    state = { isLoading: false, isLoadingChannels: false, data: void 0, error: void 0, channelsData: new Map(), compId: "" };

    private currentProteinId: string;

    componentDidMount() {
        leftPanelTabs();
        let params = getParameters();
        let channelsDB = false;
        if (params !== null) {
            channelsDB = params.isChannelsDB;
        }
        this.setState({ isLoading: true, isLoadingChannels: true, error: void 0 });
        this.load(channelsDB);
        this.loadChannels();
        $(window).on("contentResize", this.onContentResize.bind(this));

        $(window).on("resize", (() => {
            this.forceUpdate();
        }).bind(this));
    }

    private onContentResize(_: any) {
        this.forceUpdate();
    }

    loadChannels() {
        let params = getParameters();
        if (params === null) {
            this.setState({ isLoading: false, error: `Sorry. Given url is not valid.` });
            return;
        }
        this.setState({ compId: params.computationId })
        let computationId = params.computationId;
        const channels: Map<number, ChannelsDBChannels> = new Map();

        ComputationInfo.DataProvider.get(computationId, ((compId: string, info: CompInfo) => {
            if (info.PdbId === '') {
                this.setState({isLoadingChannels: false})
                return;
            }
            ChannelsDBDataCache.getChannelsData(info.PdbId).then(async channelsDbData => {
                const guidChannelsDbData = generateGuidAll(channelsDbData);
                Tunnels.setChannelsDB(guidChannelsDbData);
                channels.set(-1, guidChannelsDbData);
                for (const submission of info.Submissions) {
                    const submitId = Number(submission.SubmitId);
    
                    const data = await ApiService.getChannelsData(compId, submitId)
                    let dataObj = JSON.parse(data) as MoleData;
                    if (dataObj !== undefined && dataObj.Channels !== undefined) {
                        const guidData = generateGuidAll(dataObj.Channels)
                        TunnelName.reload({Channels: guidData}, submitId.toString())
                        Tunnels.addChannels(submitId.toString(), guidData);
                        channels.set(submitId, guidData);
                    }
                }
                Tunnels.invokeOnTunnelsLoaded();
                this.setState({ channelsData: channels, isLoadingChannels: false })
            }).catch(error => {
                this.setState({isLoadingChannels: false, error })
            });
        }).bind(this))
    }

    load(channelsDB: boolean) {
        const plugin = Context.getInstance().plugin;
        this.setState({ isLoading: true, error: void 0 });
        console.log("ChannelsDB: " + channelsDB)
        loadData(channelsDB)
            .then(data => {
                console.log("AFTER LOAD DATA");
                if (CommonOptions.DEBUG_MODE)
                    console.log("loading done ok");
                let entities = plugin.state.data.select(StateSelection.first('mole-data'))[0];
                if (entities === undefined || entities.obj === undefined || entities.obj.data === undefined || Object.keys(entities.obj.data).length === 0) {
                    let params = getParameters();
                    if (params === null) {
                        this.setState({ isLoading: false, error: `Sorry. Given url is not valid.` });
                        return;
                    }
                    this.setState({ compId: params.computationId })
                    let computationId = params.computationId;
                    let submitId = params.submitId;
                    this.setState({ isLoading: false, error: `There are no vizualization data for computation '${computationId}' and submission '${submitId}'. Try to submit some computation job.` });
                    return;
                }
                let _data = entities.obj.data as MoleData;
                let csaOrigins = plugin.state.data.select(StateSelection.first('csa-origins'))[0];
                if (csaOrigins !== undefined && csaOrigins.obj !== undefined && csaOrigins.obj.data !== undefined && Object.keys(csaOrigins.obj.data).length > 0) {
                    if ((_data as any).Origins === void 0) {
                        (_data as any).Origins = {};
                    }

                    (_data as any).Origins.CSAOrigins = csaOrigins.obj.data.Origins.CSAOrigins;
                }

                if ((_data as any).Error !== void 0) {
                    this.setState({ isLoading: false, error: (_data as any).Error as string });
                }
                else {
                    this.setState({
                        isLoading: false, data: _data, error: void 0
                    });
                }
            })
            .catch(e => {
                let errMessage = 'Application was unable to load data. Please try again later.';
                if (e !== void 0 && e !== null && String(e).length > 0) {
                    errMessage = String(e);
                }

                this.setState({ isLoading: false, error: errMessage, data: void 0 });
            });
    }


    render() {
        if (!this.state.isLoading && !this.state.isLoadingChannels) {
            return <div className="d-flex flex-column h-100">
                <div className="tab-content">
                    <div id="ui" className="toggled tab-pane show active" role="tabpanel">
                        <ChannelsControl computationId={this.state.compId} submissions={this.state.channelsData} />
                    </div>
                    <div id="controls" className="bottom toggled tab-pane flex flex-column" role="tabpanel">
                        <PluginControl data={this.state.data} />
                        <PluginReactContext.Provider value={this.props.context.plugin}><Controls /></PluginReactContext.Provider>
                    </div>
                </div>
                <div id="left-panel-tabs" className="left-panel-tabs">
                    <ul className="nav nav-tabs flex-column" role="tablist">
                        <li className="nav-item"><a style={{ writingMode: "vertical-lr" }} className="nav-link active left-panel-tab" id="ui-tab" data-bs-toggle="tab" href="#ui" role="tab" aria-controls="ui" aria-selected="true">Channels</a></li>
                        <li className="nav-item"><a style={{ writingMode: "vertical-lr" }} className="nav-link left-panel-tab" id="controls-tab" data-bs-toggle="tab" href="#controls" role="tab" aria-controls="controls" aria-selected="true">Compute</a></li>
                    </ul>
                </div>
            </div>
        } else {
            let controls: any[] = [];

            if (this.state.isLoading || this.state.isLoadingChannels) {
                controls.push(<h1>Loading...</h1>);
            } else {
                if (this.state.error) {
                    let error = this.state.error as string | undefined;
                    let errorMessage: string = (error === void 0) ? "" : error;
                    controls.push(
                        <div className="error-message">
                            <div>
                                <b>Data for specified protein are not available.</b>
                            </div>
                            <div>
                                <b>Reason:</b> <i dangerouslySetInnerHTML={{ __html: errorMessage }}></i>
                            </div>
                        </div>);
                }
                let params = getParameters();
                let channelsDB = false;
                if (params !== null) {
                    channelsDB = params.isChannelsDB;
                }
                controls.push(<button className="reload-data btn btn-primary" onClick={() => this.load(channelsDB)}>Reload Data</button>);
            }

            return <div className="d-flex flex-column h-100">
                <div className="tab-content">
                    {controls}
                </div>
                <div id="left-panel-tabs" className="left-panel-tabs">
                    <ul className="nav nav-tabs flex-column" role="tablist">
                        <li className="nav-item"><a style={{ writingMode: "vertical-lr" }} className="nav-link active left-panel-tab" id="ui-tab" data-bs-toggle="tab" href="#ui" role="tab" aria-controls="ui" aria-selected="true" aria-disabled="true">Channels</a></li>
                        <li className="nav-item"><a style={{ writingMode: "vertical-lr" }} className="nav-link left-panel-tab" id="controls-tab" data-bs-toggle="tab" href="#controls" role="tab" aria-controls="controls" aria-selected="true" aria-disabled="true">Compute</a></li>
                    </ul>
                </div>
            </div>;
        }
    }
}