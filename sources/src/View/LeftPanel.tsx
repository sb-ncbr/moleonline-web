import React from "react";
import { Context } from "./Context";
import { leftPanelTabs } from "./CommonUtils/Tabs";
import { PluginControl } from "./UI/PluginControl/UI";
import { ChannelsControl } from "./UI/PluginControl/ChannelsUI";
import { PluginReactContext } from "molstar/lib/mol-plugin-ui/base";
import { Controls } from "./UI/Controls/UI";
import { getParameters } from "../Common/Util/Router";
import { Events } from "../Bridge";
import { CommonOptions } from "../../config/common";
import { addCaverTag, loadData } from "./State";
import { StateSelection } from "molstar/lib/mol-state";
import { ChannelsDBChannels, ChannelsDBData, MoleData } from "../DataInterface";
import { ComputationInfo } from "../DataProxy";
import { ApiService, CompInfo } from "../MoleAPIService";
import { ChannelsDBData as ChannelsDBDataCache, TunnelName } from "../Cache"
import { Tunnels } from "./CommonUtils/Tunnels";
import { SbNcbrTunnelsPropertyProvider } from "./VizualizerMol/tunnels-extension/property";
import { loadCifTunnels } from "./VizualizerMol/mmcif-tunnels/converter2json";
import { TunnelsId } from "./CommonUtils/TunnelsId";
import { ChannelAnnotation } from "../ChannelsDBAPIService";
import WaveLoader from "./CommonUtils/WaveLoader";
import { LoadingStatusDisplay } from "./CommonUtils/LoadingInfo/LoadingStatusDisplay";
import { LoadingStatus } from "./CommonUtils/LoadingInfo/LoadingStatus";

declare function $(p: any): any;

export class LeftPanel extends React.Component<{ context: Context }, { isLoading?: boolean, error?: string, data?: any, isWaitingForData?: boolean, channelsData: Map<number, ChannelsDBChannels>, compId: string, isLoadingChannels: boolean }> {
    state = { isLoading: false, isLoadingChannels: false, data: void 0, error: void 0, channelsData: new Map(), compId: "" };

    private currentProteinId: string;

    componentDidMount() {
        LoadingStatus.setTotalSteps(6);
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

        Events.subscribeToggleLoadingScreen(({message, visible}) => {
            if (!visible) {
                const uiTabsElement = document.querySelector('#ui-tab');
                if (uiTabsElement) {
                    (uiTabsElement as HTMLElement).click();
                }
            }
        })
    }

    private onContentResize(_: any) {
        this.forceUpdate();
    }

    loadChannels() {
        LoadingStatus.log('Loading channels from current session...', 3);
        let params = getParameters();
        if (params === null) {
            this.setState({ isLoading: false, error: `Sorry. Given url is not valid.` });
            LoadingStatus.clear(); 
            return;
        }
        this.setState({ compId: params.computationId })
        let computationId = params.computationId;
        const channels: Map<number, ChannelsDBChannels> = new Map();

        ComputationInfo.DataProvider.get(computationId, ((compId: string, info: CompInfo) => {
            (async () => {
                LoadingStatus.log('Processing data from current session...', 4);
                if (info.PdbId === '') {
                    const context = Context.getInstance();
                    const model = context.model;
                    const o = SbNcbrTunnelsPropertyProvider.isApplicable(model!);
                    LoadingStatus.log('Parsing data from current session...', 5);
                    const data = await loadCifTunnels(`https://api.mole.upol.cz/Data/${computationId}?submitId=0&format=molecule`);
                    if (data) {
                        const dataObj = { Channels: data.Channels } as MoleData;
                        let guidData = TunnelsId.generateGuidAll(dataObj.Channels);
                        ChannelsDBDataCache.setFileLoadedAnnotations(data.Annotations);
                        const annotations = ChannelsDBDataCache.getFileLoadedAnnotations();
                        const completeChannelsDbData = TunnelsId.generateIdAllWithAnnotations(annotations, guidData, compId, 'file');
                        Tunnels.setChannelsDB(completeChannelsDbData);
                        TunnelName.reload({ Channels: completeChannelsDbData }, '-2');
                        Tunnels.addChannels('-2', completeChannelsDbData);
                        channels.set(-2, completeChannelsDbData);
                    }
                    Tunnels.invokeOnTunnelsLoaded();
                    LoadingStatus.log('Finalizing…', 6);
                    this.setState({ channelsData: channels, isLoadingChannels: false })
                    return;
                }
            })();
            ChannelsDBDataCache.getChannelsData(info.PdbId).then(async channelsDbData => {
                const annotations: Map<string, ChannelAnnotation[]> = await ChannelsDBDataCache.getChannelsAnnotations(info.PdbId);
                const guidChannelsDbData = TunnelsId.generateGuidAll(channelsDbData);
                let completeChannelsDbData = addCaverTag(guidChannelsDbData);
                completeChannelsDbData = TunnelsId.generateIdAllWithAnnotations(annotations, completeChannelsDbData, compId, 'channelsDb');
                Tunnels.setChannelsDB(completeChannelsDbData);
                TunnelName.reload({Channels: completeChannelsDbData}, '-1');
                channels.set(-1, completeChannelsDbData);
                for (const submission of info.Submissions) {
                    const submitId = Number(submission.SubmitId);
    
                    const data = await ApiService.getChannelsData(compId, submitId)
                    let dataObj = JSON.parse(data) as MoleData;
                    if (dataObj !== undefined && dataObj.Channels !== undefined) {
                        let guidData = TunnelsId.generateGuidAll(dataObj.Channels);
                        guidData = TunnelsId.generateIdAll(guidData, computationId, submitId.toString())
                        TunnelName.reload({Channels: guidData}, submitId.toString())
                        Tunnels.addChannels(submitId.toString(), guidData);
                        channels.set(submitId, guidData);
                    }
                }
                Tunnels.invokeOnTunnelsLoaded();
                LoadingStatus.log('Finalizing…', 6);
                this.setState({ channelsData: channels, isLoadingChannels: false })
            }).catch(async error => {
                if (info.Submissions.length === 0) {
                    this.setState({isLoadingChannels: false, error })
                    return;
                }
                try {
                    for (const submission of info.Submissions) {
                        const submitId = Number(submission.SubmitId);
        
                        const data = await ApiService.getChannelsData(compId, submitId)
                        let dataObj = JSON.parse(data) as MoleData;
                        if (dataObj !== undefined && dataObj.Channels !== undefined) {
                            let guidData = TunnelsId.generateGuidAll(dataObj.Channels)
                            guidData = TunnelsId.generateIdAll(guidData, computationId, submitId.toString())
                            TunnelName.reload({Channels: guidData}, submitId.toString())
                            Tunnels.addChannels(submitId.toString(), guidData);
                            channels.set(submitId, guidData);
                        }
                    }
                    Tunnels.invokeOnTunnelsLoaded();
                    this.setState({ channelsData: channels, isLoadingChannels: false })
                    LoadingStatus.log('Finalizing…', 6);
                } catch (error) {
                    this.setState({isLoadingChannels: false, error })
                }
                LoadingStatus.clear();
            });
        }).bind(this))
    }

    load(channelsDB: boolean) {
        const plugin = Context.getInstance().plugin;
        this.setState({ isLoading: true, error: void 0 });
         LoadingStatus.log('Loading channels from ChannelsDB...', 1);
        loadData(channelsDB)
            .then(data => {
                LoadingStatus.log('Processing data from ChannelsDB...', 2);
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
                    <div id="ui" className={`toggled tab-pane ${this.state.channelsData.size === 0 ? '' : 'show active'}`} role="tabpanel">
                        <ChannelsControl computationId={this.state.compId} submissions={this.state.channelsData} />
                    </div>
                    <div id="controls" className={`bottom toggled tab-pane flex flex-column ${this.state.channelsData.size === 0 ? 'show active' : ''}`} role="tabpanel">
                        <PluginControl data={this.state.data} />
                        <PluginReactContext.Provider value={this.props.context.plugin}><Controls /></PluginReactContext.Provider>
                    </div>
                </div>
                <div id="left-panel-tabs" className="left-panel-tabs">
                    <ul className="nav nav-tabs flex-column" role="tablist">
                        <li className="nav-item" title="Home"><a id="home-tab" className="nav-link left-panel-tab" href="/" role="tab"><i className="bi bi-house fs-5"></i></a></li>
                        <li className="nav-item"><a style={{ writingMode: "vertical-lr" }} className={`nav-link ${this.state.channelsData.size === 0 ? '' : 'active'} left-panel-tab`} id="ui-tab" data-bs-toggle="tab" data-bs-target="#ui" role="tab" aria-controls="ui" aria-selected="true">Channels</a></li>
                        <li className="nav-item"><a style={{ writingMode: "vertical-lr" }} className={`nav-link ${this.state.channelsData.size === 0 ? 'active' : ''} left-panel-tab`} id="controls-tab" data-bs-toggle="tab" data-bs-target="#controls" role="tab" aria-controls="controls" aria-selected="true">Compute</a></li>
                    </ul>
                    <div id="left-panel-toggle-minimize" className="vertical-toggler">
                    <span className="bi bi-arrows-expand-vertical"/>
                    </div>
                </div>
            </div>
        } else {
            let controls: any[] = [];

            if (this.state.isLoading || this.state.isLoadingChannels) {
                controls.push(
                    <div>
                        <WaveLoader/>
                        <LoadingStatusDisplay />
                    </div>);
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
                        <li className="nav-item" title="Home"><a id="home-tab" className="nav-link left-panel-tab" href="/" role="tab"><i className="bi bi-house fs-5"></i></a></li>
                        <li className="nav-item"><a style={{ writingMode: "vertical-lr" }} className="nav-link active left-panel-tab disabled" id="ui-tab" data-bs-toggle="tab" data-bs-target="#ui" role="tab" aria-controls="ui" aria-selected="true" aria-disabled="true">Channels</a></li>
                        <li className="nav-item"><a style={{ writingMode: "vertical-lr" }} className="nav-link left-panel-tab disabled" id="controls-tab" data-bs-toggle="tab" data-bs-target="#controls" role="tab" aria-controls="controls" aria-selected="true" aria-disabled="true">Compute</a></li>
                    </ul>
                </div>
            </div>;
        }
    }
}