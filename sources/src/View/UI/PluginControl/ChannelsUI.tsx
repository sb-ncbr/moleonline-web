/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

import React from "react";
import { Events } from "../../../Bridge";
import { ChannelsDBChannels, MoleData, Tunnel, TunnelMetaInfo } from "../../../DataInterface";
import { Tunnels } from "../../CommonUtils/Tunnels";
import { ChannelsDBData, LastVisibleChannels, TunnelName } from "../../../Cache";
import { ChannelAnnotation } from "../../../ChannelsDBAPIService";
import { getParameters, isInChannelsDBMode } from "../../../Common/Util/Router";
import { showChannelVisuals, showDefaultVisuals, showDefaultVisualsNewSubmission } from "../../State";
import { Context } from "../../Context";
import { Representation } from "molstar/lib/mol-repr/representation";
import { EmptyLoci, Loci } from "molstar/lib/mol-model/loci";
import { MarkerAction } from "molstar/lib/mol-util/marker-action";
import { Colors, Enum } from "../../../StaticData";
import { Color } from "molstar/lib/mol-util/color";
import { debounce } from "lodash";
import { ApiService, CompInfo } from "../../../MoleAPIService";
import { ComputationInfo, JobStatus } from "../../../DataProxy";
import { SelectionHelper } from "../../CommonUtils/Selection";
import { TwoDProtsBridge } from "../../CommonUtils/TwoDProtsBridge";
import { TunnelsId } from "../../CommonUtils/TunnelsId";

declare function $(p: any): any;

type ChannelsControlProps = { computationId: string, submissions: Map<number, ChannelsDBChannels> }
type ChannelsControlState = {
    isLoading?: boolean,
    error?: string,
    data?: any,
    isWaitingForData?: boolean,
    submissions: Map<number, ChannelsDBChannels>,
    submissionsElems: Map<number, any[]>,
    hideAll: boolean,
    currentSubmitId: number
}

export class ChannelsControl extends React.Component<ChannelsControlProps, ChannelsControlState> {
    //TODO store selected/visualized tunnels for 2DProts
    state = { isLoading: false, data: void 0, error: void 0, submissions: new Map<number, ChannelsDBChannels>(), submissionsElems: new Map<number, any[]>(), hideAll: false, currentSubmitId: 0 };

    private toggle(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        this.setState({ hideAll: !this.state.hideAll });
        Tunnels.invokeOnTunnelsHide();
    }

    handleTunnelsCollect = (submitId: number) => {
        const submissions = this.getSubmissions();
        const tunnels = submissions.get(submitId);
        if (tunnels) {
            Events.invokeChannelDataLoaded({ Channels: tunnels });
        } else {
            Events.invokeChannelDataLoaded({
                Channels: {
                    Tunnels: [],
                    MergedPores: [],
                    Pores: [],
                    Paths: [],
                    CSATunnels_MOLE: [],
                    CSATunnels_Caver: [],
                    ReviewedChannels_MOLE: [],
                    ReviewedChannels_Caver: [],
                    CofactorTunnels_MOLE: [],
                    CofactorTunnels_Caver: [],
                    TransmembranePores_MOLE: [],
                    TransmembranePores_Caver: [],
                    ProcognateTunnels_MOLE: [],
                    ProcognateTunnels_Caver: [],
                    AlphaFillTunnels_MOLE: [],
                    AlphaFillTunnels_Caver: []
                }
            });
        }
    }

    private getSubmissions() {
        return this.state.submissions;
    }

    private focusOnElement(elementId: string) {
        const targetElement = document.querySelector(elementId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
        }
    }
    private showSelections(containerId: string) {
        const container = document.querySelector(containerId);
    
        if (!container) {
            console.error(`Container with id "${containerId}" not found.`);
            return;
        }
        
        const hiddenDivs = Array.from(container.querySelectorAll('div[style*="display: none"]'));
    
        if (hiddenDivs.length > 0) {
            const links = container.querySelectorAll('.ui-subheader a');
            links.forEach(link => {
                (link as HTMLElement).click();
            });

        }
    }
    
    componentWillMount() {
        let params = getParameters();
        if (params === null || params.submitId === 0) {
            if (params?.computationId) {
                ComputationInfo.DataProvider.get(params.computationId, ((compId: string, info: CompInfo) => {
                    if (info.PdbId === "") { // from file
                        this.setState({ currentSubmitId: -2 });
                        showDefaultVisuals(-2, this.props.submissions).then(() => {
                            this.saveChannelsElems();
                        })
                    } else {
                        this.setState({ currentSubmitId: -1 })
                        showDefaultVisuals(-1, this.props.submissions).then(() => {
                            this.saveChannelsElems();
                        })
                    }
                }))
            } else {
                this.setState({ currentSubmitId: -1 })
                showDefaultVisuals(-1, this.props.submissions).then(() => {
                    this.saveChannelsElems();
                })
            }
        } else {
            this.setState({ currentSubmitId: params.submitId })
            showDefaultVisuals(params.submitId, this.props.submissions).then(() => {
                this.saveChannelsElems();
            })
        }
    }

    componentDidMount() {
        Events.subscribeSubmitDone(async (newSubmitId) => {
            if (!this.state.submissions.has(newSubmitId)) {
                const data = await ApiService.getChannelsData(this.props.computationId, newSubmitId)
                let dataObj = JSON.parse(data) as MoleData;
                if (dataObj !== undefined && dataObj.Channels !== undefined) {
                    const submissions = this.state.submissions;
                    let guidData = TunnelsId.generateGuidAll(dataObj.Channels)
                    guidData = TunnelsId.generateIdAll(guidData, this.props.computationId, newSubmitId.toString())
                    TunnelName.reload({ Channels: guidData }, newSubmitId.toString());
                    Tunnels.addChannels(newSubmitId.toString(), guidData);
                    submissions.set(newSubmitId, guidData);
                    Tunnels.invokeOnTunnelsLoaded();
                    const channelElems = this.createChannelElems(guidData, newSubmitId)
                    const currentSumbissionElems = this.state.submissionsElems;
                    currentSumbissionElems.set(newSubmitId, channelElems);
                    await showDefaultVisualsNewSubmission(guidData, newSubmitId.toString());
                    this.setState({ submissions, currentSubmitId: newSubmitId, submissionsElems: currentSumbissionElems })
                }
            }
            Events.invokeToggleLoadingScreen({
                message: "",
                visible: false
            });
            this.handleTunnelsCollect(newSubmitId);
        })

        Events.subscribeChangeSubmitId(this.handleTunnelsCollect.bind(this));
        // showDefaultVisuals(this.props.submissions).then(() => this.forceUpdate());

        // Tunnels.attachOnTunnelsCollect(this.handleTunnelsCollect);

        this.setState({ submissions: this.props.submissions })
        $(window).on("contentResize", this.forceUpdate());

        $(window).on("resize", (() => {
            this.forceUpdate();
        }).bind(this));
    }

    componentDidUpdate(prevProps: ChannelsControlProps, prevState: ChannelsControlState, snapshot?: any): void {
        this.focusOnElement(`#submission-${this.state.currentSubmitId}`);
        this.showSelections(`#submission-${this.state.currentSubmitId}`);
    }

    private createChannelElems(submissionChannels: ChannelsDBChannels, submitId: number) {
        const channels = new Map<String, any>();
        const channelsControls: any[] = [];

        channels.set('Merged pores', (!submissionChannels.MergedPores) ? [] : submissionChannels.MergedPores);
        channels.set('Paths', (!submissionChannels.Paths) ? [] : submissionChannels.Paths);
        channels.set('Pores', (!submissionChannels.Pores) ? [] : submissionChannels.Pores);
        channels.set('Tunnels', (!submissionChannels.Tunnels) ? [] : submissionChannels.Tunnels);

        channels.set('Reviewed Channels MOLE', (!submissionChannels.ReviewedChannels_MOLE) ? [] : submissionChannels.ReviewedChannels_MOLE);
        channels.set('Reviewed Channels Caver', (!submissionChannels.ReviewedChannels_Caver) ? [] : submissionChannels.ReviewedChannels_Caver);
        channels.set('CSA Tunnels MOLE', (!submissionChannels.CSATunnels_MOLE) ? [] : submissionChannels.CSATunnels_MOLE);
        channels.set('CSA Tunnels Caver', (!submissionChannels.CSATunnels_Caver) ? [] : submissionChannels.CSATunnels_Caver);
        channels.set('Transmembrane Pores MOLE', (!submissionChannels.TransmembranePores_MOLE) ? [] : submissionChannels.TransmembranePores_MOLE);
        channels.set('Transmembrane Pores Caver', (!submissionChannels.TransmembranePores_Caver) ? [] : submissionChannels.TransmembranePores_Caver);
        channels.set('Cofactor Tunnels MOLE', (!submissionChannels.CofactorTunnels_MOLE) ? [] : submissionChannels.CofactorTunnels_MOLE);
        channels.set('Cofactor Tunnels Caver', (!submissionChannels.CofactorTunnels_Caver) ? [] : submissionChannels.CofactorTunnels_Caver);
        channels.set('Procognate Tunnels MOLE', (!submissionChannels.ProcognateTunnels_MOLE) ? [] : submissionChannels.ProcognateTunnels_MOLE);
        channels.set('Procognate Tunnels Caver', (!submissionChannels.ProcognateTunnels_Caver) ? [] : submissionChannels.ProcognateTunnels_Caver);
        channels.set('AlphaFill Tunnels MOLE', (!submissionChannels.AlphaFillTunnels_MOLE) ? [] : submissionChannels.AlphaFillTunnels_MOLE);
        channels.set('AlphaFill Tunnels_Caver', (!submissionChannels.AlphaFillTunnels_Caver) ? [] : submissionChannels.AlphaFillTunnels_Caver);

        channels.forEach((val, key, map) => {
            if (val.length > 0) {
                channelsControls.push(
                    <Channels channels={val} header={key.valueOf()} channelsDB={submitId === -1} submissionId={submitId === -1 ? 'ChannelsDB' : submitId.toString()} hide={this.state.hideAll} />
                );
            }
        });

        return channelsControls;
    }

    private saveChannelsElems() {
        if (this.props.submissions === undefined) return;
        let submissionsElems = new Map<number, any[]>()
        for (const submitId of Array.from(this.props.submissions.keys())) {
            const submissionChannels = this.props.submissions.get(submitId)
            if (submissionChannels === undefined) continue;
            submissionsElems.set(submitId, this.createChannelElems(submissionChannels, submitId))
        }
        this.setState({ submissionsElems })
    }

    render() {
        let submissionsControls: any[] = [];

        if (this.state.submissionsElems.size === 0) {
            return <div className="ui-channels d-flex flex-column" style={{ maxHeight: '100vh', padding: '0 0', marginRight: '0px' }}>
                <div>
                    <div className="ui-header flex-grow-0 flex-shrink-0" style={{ margin: 0 }}>
                        Channels
                    </div>
                    <div className="no-channels-data">There are no channels available...</div>
                </div>
            </div>;
        }

        for (const submitId of Array.from(this.state.submissionsElems.keys())) {
            let currentChannels = this.state.submissionsElems.get(submitId);
            if (currentChannels) {
                submissionsControls.push(
                    <div className="accordion-item">
                        <h2 className="accordion-header">
                            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#submission-${submitId}`} aria-expanded={submitId === this.state.currentSubmitId ? true : false} aria-controls={`submission-${submitId}`}>
                                {submitId === -1 ? 'ChannelsDB' : submitId === -2 ? 'FromFile' : `Submission-${submitId}`}
                            </button>
                        </h2>
                        <div id={`submission-${submitId}`} className={`accordion-collapse collapse ${submitId === this.state.currentSubmitId ? 'show' : ''}`}>
                            <div className="accordion-body">
                                {currentChannels.length > 0 ? currentChannels : <div className="no-channels-data">There are no channels available...</div>}
                            </div>
                        </div>
                    </div>
                )
            }
        }

        let noChannelsData = <div className="no-channels-data">There are no channels available...</div>

        return <div className="ui-channels d-flex flex-column" style={{ maxHeight: '100vh', padding: '0 0', marginRight: '0px' }}>
                <div className="ui-header channels-header flex-grow-0 flex-shrink-0" style={{ margin: 0 }}>
                    <span>Channels</span>
                    <button className="btn btn-primary btn-sm bt-none" style={{ marginTop: '0.5em', marginBottom: '0.5em' }} onClick={e => this.toggle(e)}>Hide all</button>
                </div>
                <div className="accordion flex-fill overflow-auto" id="channelsAccordion">
                    {(submissionsControls.length === 0) ? noChannelsData : submissionsControls}
                </div>
        </div>;
    }
}

export class Section extends React.Component<{ header: string, count: number, controls: React.ReactNode, children?: React.ReactNode }, { isExpanded: boolean }> {
    state = { isExpanded: false }

    private toggle(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        this.setState({ isExpanded: !this.state.isExpanded });
    }

    render() {
        return <div className="ui-item-container" style={{ position: 'relative' }}>
            <div className="ui-subheader">
                <a href='#' onClick={e => this.toggle(e)} className='section-header'><div style={{ width: '15px', display: 'inline-block', textAlign: 'center' }}>{this.state.isExpanded ? '-' : '+'}</div> {this.props.header} ({this.props.count})</a>
                <div style={{ display: this.state.isExpanded ? 'block' : 'none' }}>{this.props.controls}</div>
            </div>
            <div style={{ display: this.state.isExpanded ? 'block' : 'none' }}>{this.props.children}</div>
        </div>
    }
}

export class Renderable extends React.Component<{ label: string | JSX.Element, channelsDB: boolean, submissionId: string, element: (Tunnel & TunnelMetaInfo), annotations?: ChannelAnnotation[], toggle: (elements: any[], visible: boolean, forceRepaint?: boolean, channelsDB?: boolean, submissionId?: string) => Promise<any> }, { isAnnotationsVisible: boolean }> {

    state = { isAnnotationsVisible: false };

    private toggle() {
        this.props.element.__isBusy = true;
        this.forceUpdate(() => {
            if (this.props.channelsDB) {
                this.props.toggle([this.props.element], !this.props.element.__isVisible, undefined, true, this.props.submissionId)
                    .then(() => this.forceUpdate()).catch(() => this.forceUpdate())
            } else {
                this.props.toggle([this.props.element], !this.props.element.__isVisible, undefined, undefined, this.props.submissionId)
                    .then(() => this.forceUpdate()).catch(() => this.forceUpdate())
            }
        });
    }

    private highlight(isOn: boolean) {
        // this.props.plugin.command(Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.element.__id), isOn }); //TODO
        const context = Context.getInstance();
        console.log(this.props.element.__loci);
        if (isOn && this.props.element.__isVisible)
            context.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci: this.props.element.__loci } as Representation.Loci)
        else
            context.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci: EmptyLoci } as Representation.Loci)

        const svgElement = document.getElementById('svgContainer');
        const elementId = TwoDProtsBridge.getFromIdTable(this.props.element.Id)
        const element = document.getElementById(`${elementId}`);
        if (isOn) {
            if (svgElement && element) {
                const targetElement = svgElement.querySelector<SVGGElement>(`g#${CSS.escape(`${elementId}`)}`);
                if (targetElement) {
                    targetElement.dataset.hoverOriginalFill = targetElement.style.fill || '';
                    targetElement.dataset.hoverOriginalOpacity = targetElement.style.opacity || '';
                    targetElement.style.fill = '#FF00FF';
                    targetElement.style.stroke = '#FF00FF';
                    targetElement.style.opacity = '1';
                }
            }
        } else {
            if (svgElement && element) {
                const targetElement = svgElement.querySelector<SVGGElement>(`g#${CSS.escape(`${elementId}`)}`);
                if (targetElement) {
                    const originalFill = targetElement.dataset.hoverOriginalFill || '';
                    const originalOpacity = targetElement.dataset.hoverOriginalOpacity || '';
                    targetElement.style.fill = originalFill;
                    targetElement.style.stroke = originalFill;
                    targetElement.style.opacity = originalOpacity;
                    delete targetElement.dataset.hoverOriginalFill;
                    delete targetElement.dataset.hoverOriginalOpacity;
                }
            }
        }
    }

    private toggleAnnotations(e: any) {
        this.setState({ isAnnotationsVisible: !this.state.isAnnotationsVisible });
    }

    private getAnnotationToggler() {
        return [(this.state.isAnnotationsVisible)
            ? <span className="hand bi bi-chevron-up" title="Hide list annotations for this channel" onClick={this.toggleAnnotations.bind(this)} />
            : <span className="hand bi bi-chevron-down" title="Show all annotations available for this channel" onClick={this.toggleAnnotations.bind(this)} />];
    }

    private getAnnotationsElements() {
        if (this.props.annotations === void 0) {
            return [];
        }
        if (!this.state.isAnnotationsVisible) {
            return [];
        }
        let elements: JSX.Element[] = [];
        for (let annotation of this.props.annotations) {
            let reference = <i>(No reference provided)</i>;
            if (annotation.reference !== "") {
                reference = <a target="#" href={annotation.link}>{annotation.reference} <span className="bi-box-arrow-up-right" /></a>;
            }
            elements.push(
                <div className="annotation-line">
                    <span className="bullet" /> <b>{annotation.name}</b>, {reference}
                </div>
            );
        }
        return elements;
    }

    render() {
        let emptyToggler;
        if (isInChannelsDBMode()) {
            emptyToggler = <span className="disabled bi bi-chevron-down" title="No annotations available for this channel" onClick={this.toggleAnnotations.bind(this)} />
        }
        return <div className="ui-label">
            <input type='checkbox' checked={!!this.props.element.__isVisible} onChange={() => this.toggle()} disabled={!!this.props.element.__isBusy} />
            <label className="ui-label-element" onMouseEnter={() => this.highlight(true)} onMouseLeave={() => this.highlight(false)} >
                {(this.props.annotations !== void 0 && this.props.annotations.length > 0) ? this.getAnnotationToggler() : emptyToggler} {this.props.label}
            </label>
            {this.getAnnotationsElements()}
        </div>
    }
}

export class Channels extends React.Component<{ channels: any[], header: string, channelsDB: boolean, submissionId: string, hide: boolean }, { isBusy: boolean }> {
    state = { isBusy: false }

    private show(visible: boolean) {
        for (let element of this.props.channels) { element.__isBusy = true; }
        this.setState({ isBusy: true },
            () => {
                if (this.props.channelsDB) {
                    showChannelVisuals(this.props.channels, visible, undefined, true, this.props.submissionId)
                        .then(() => this.setState({ isBusy: false })).catch(() => this.setState({ isBusy: false }));
                } else {
                    showChannelVisuals(this.props.channels, visible, undefined, undefined, this.props.submissionId)
                        .then(() => this.setState({ isBusy: false })).catch(() => this.setState({ isBusy: false }));
                }
            })
    }

    private isDisabled() {
        return !this.props.channels || (this.props.channels !== void 0 && this.props.channels.length == 0);
    }

    componentDidMount() {
        Tunnels.attachOnTunnelsHide(() => {
            this.show(false);
        })
    }

    render() {
        return <Section header={this.props.header} count={(this.props.channels || '').length}
            controls={<div className='ui-show-all'><button className="btn btn-primary ui-show-all-btn" onClick={() => this.show(true)} disabled={this.state.isBusy || this.isDisabled()}>All</button><button className="btn btn-primary ui-show-all-btn" onClick={() => this.show(false)} disabled={this.state.isBusy || this.isDisabled()}>None</button></div>}
        >
            {this.props.channels && this.props.channels.length > 0
                ? this.props.channels.map((c, i) => <Channel submissionId={this.props.submissionId} key={i} channel={c} channelsDB={this.props.channelsDB} />)
                : <div className="ui-label ui-no-data-available">No data available...</div>}
        </Section>
    }
}

export class Channel extends React.Component<{ channel: any, channelsDB: boolean, submissionId: string }, { isVisible: boolean, isWaitingForData: boolean }> {
    state = { isVisible: false, isWaitingForData: false };

    componentDidMount() {

        Events.subscribeChannelSelect(((channelId: string) => {
            if (this.props.channel.Id === channelId) {
                this.selectChannel(false);
            }
        }).bind(this));
    }

    render() {
        let c = this.props.channel as (Tunnel & TunnelMetaInfo);
        let len = Tunnels.getLength(c);
        let name = TunnelName.get(c.GUID); // cache.set(channel.GUID, `${channel.Type[0]}${channel.Id}C${channel.Cavity}`);
        let namePart = (name === void 0) ? '' : ` (${name})`;

        let annotationId = TunnelsId.getAnnotationId(c.Id);
        let annotations = annotationId ? ChannelsDBData.getChannelAnnotationsImmediate(annotationId) : null;
        if (annotations !== null && annotations !== void 0) {
            let annotation = annotations[0];
            return <Renderable annotations={annotations} submissionId={this.props.submissionId} channelsDB={this.props.channelsDB} label={<span><b><a href="javascript:void(0)" onClick={this.selectChannel.bind(this, true)}>{annotation.name}{namePart}</a></b><ColorPicker tunnel={this.props.channel} />, Length: <b>{len} Å</b></span>} element={c} toggle={showChannelVisuals} />
        }
        else {
            return <Renderable channelsDB={this.props.channelsDB} submissionId={this.props.submissionId} label={<span><b><a href="javascript:void(0)" onClick={this.selectChannel.bind(this, true)}>{c.Type}{namePart}</a></b><ColorPicker tunnel={this.props.channel} />, Length: <b>{len} Å</b></span>} element={c} toggle={(ch: Tunnel[] & TunnelMetaInfo[], v: boolean, repaint?: boolean, channelsDB?: boolean, submissionId?: string) => {
                if (submissionId) {
                    return showChannelVisuals(ch, v, undefined, channelsDB, submissionId)
                        .then(() => {
                            this.forceUpdate();
                        })

                }
                return showChannelVisuals(ch, v)
                    .then(() => {
                        this.forceUpdate();
                    })
            }} />
        }
    }

    // private selectChannel(updateUI?: boolean) {
    //     const channel = this.props.channel as (Tunnel & TunnelMetaInfo)
    //     const loci = { loci: channel.__loci } as Representation.Loci<Loci>
    //     Context.getInstance().plugin.canvas3d?.mark(loci, MarkerAction.Select);

    //     // plugin.command(Bootstrap.Command.Entity.Focus, plugin.context.select(channelRef));
    //     // plugin.command(LiteMol.Bootstrap.Event.Visual.VisualSelectElement, Bootstrap.Interactivity.Info.selection(entity, [0]));

    //     // if (updateUI === void 0) {
    //     //     updateUI = true;
    //     // }
    //     // let entity = this.props.state.plugin.context.select(this.props.channel.__id)[0];
    //     // if (entity === void 0 || entity.ref === "undefined") {
    //     //     State.showChannelVisuals(this.props.state.plugin, [this.props.channel], true).then(() => {
    //     //         if (updateUI) {
    //     //             let state = this.state;
    //     //             state.isVisible = true;
    //     //             this.setState(state);
    //     //         }
    //     //         this.selectChannel(updateUI);
    //     //     });
    //     //     return;
    //     // }
    //     // let channelRef = entity.ref;
    //     // let plugin = this.props.state.plugin;

    //     // plugin.command(Bootstrap.Command.Entity.Focus, plugin.context.select(channelRef));
    //     // plugin.command(LiteMol.Bootstrap.Event.Visual.VisualSelectElement, Bootstrap.Interactivity.Info.selection(entity, [0]));
    // }

    private selectChannel(preserveSelection?: boolean) {
        const channel = this.props.channel as (Tunnel & TunnelMetaInfo)
        if (!channel.__isVisible) {
            showChannelVisuals([channel], true, undefined, this.props.channelsDB).then(() => {
                if (channel) SelectionHelper.selectTunnel(channel, preserveSelection);
            });
        } else {
            if (channel) SelectionHelper.selectTunnel(channel, preserveSelection);
        }
        this.forceUpdate();
    }
}

let __colorPickerIdSeq = 0;
function generateColorPickerId() {
    return `color-picker-${__colorPickerIdSeq++}`;
}
export class ColorPicker extends React.Component<{ tunnel: Tunnel & TunnelMetaInfo }, { visible: boolean, color: Color | undefined }> {
    state = { visible: false, color: this.props.tunnel.__color || undefined }
    private id: string;

    setTunnelColor = () => {
        if (this.state.color && this.state.color !== this.props.tunnel.__color) {
            this.props.tunnel.__color = this.state.color;
            showChannelVisuals([this.props.tunnel], (this.props.tunnel as any).__isVisible, true);
            TwoDProtsBridge.invokeOnResidueSelectHandlers(this.props.tunnel);
        }

    }

    debouncedShowChannelVisuals = debounce(this.setTunnelColor, 100);

    onRGB = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = Color.fromHexStyle(e.currentTarget.value || '0');
        this.setState({ color: newColor });
        this.debouncedShowChannelVisuals()
    };

    componentDidMount() {
        this.id = generateColorPickerId();
        $(window).on('click', ((e: MouseEvent) => {
            this.forceUpdate();
            if (!this.state.visible) {
                return;
            }
            let el = ($("#" + this.id)[0] as HTMLElement).children[0];
            let rect = el.getBoundingClientRect();

            if (!(e.clientX >= rect.left && e.clientX <= rect.left + rect.width
                && e.clientY >= rect.top && e.clientY <= rect.top + rect.height)) {
                this.setState({ visible: false });
            }
        }).bind(this));
    }

    render() {
        let color = (this.props.tunnel.__color !== void 0) ? this.props.tunnel.__color : Colors.get(Enum.DefaultColor);

        return <input disabled={!this.props.tunnel.__isVisible} className="color-picker" id={this.id} onChange={this.onRGB} type='color' value={Color.toHexStyle(color)} style={{ order: 4, flex: '1 1 auto', minWidth: '14px', width: '14px', height: '14px', padding: '0 0 0 0', background: 'none', border: 'none', cursor: 'pointer' }}></input>
    }
}
