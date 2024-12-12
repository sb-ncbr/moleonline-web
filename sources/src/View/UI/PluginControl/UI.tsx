/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

import React from "react";
import { Events, Instances } from "../../../Bridge";
import { ChannelsDBChannels, MoleData, Tunnel, Membrane as MembraneObject, Point, ChannelSourceData, TunnelMetaInfo } from "../../../DataInterface";
import { LightResidueInfo, SelectionHelper, StringPoint } from "../../CommonUtils/Selection";
import { Residues } from "../../CommonUtils/Residues";
import { Tunnels } from "../../CommonUtils/Tunnels";
import { ChannelsDBData, TunnelName } from "../../../Cache";
import { ChannelAnnotation } from "../../../ChannelsDBAPIService";
import { getParameters, isInChannelsDBMode } from "../../../Common/Util/Router";
import { CommonOptions } from "../../../../config/common";
import { loadData, showCavityVisuals, showChannelVisuals, showMembraneVisuals, showOriginsSurface } from "../../State";
import { Context } from "../../Context";
import { StateSelection } from "molstar/lib/mol-state";
import { Subscription } from "rxjs";

declare function $(p: any): any;

export class PluginControl extends React.Component<{ data: any }, { isLoading?: boolean, error?: string, data?: any, isWaitingForData?: boolean }> {

    state = { isLoading: false, data: void 0, error: void 0 };

    private currentProteinId: string;

    componentDidMount() {
        let params = getParameters();
        let channelsDB = false;
        if (params !== null) {
            channelsDB = params.isChannelsDB;
        }
        // this.load(channelsDB);
        this.setState({ data: this.props.data })
        $(window).on("contentResize", this.onContentResize.bind(this));

        Events.subscribeChangeSubmitId((submitId) => {
            try {
                this.load(submitId === -1);
            } catch (ex) {
                if (CommonOptions.DEBUG_MODE)
                    console.log(ex);
                this.setState({ isLoading: false, data: void 0, error: "Data not available" });
            }
        });

        // Events.subscribeOnSequneceViewerToggle((params) => {
        //     if (params.minimized) {
        //         $('#plugin').addClass("sv-minimized");
        //     }
        //     else {
        //         $('#plugin').removeClass("sv-minimized");
        //     }

        //     $(window).trigger('contentResize');
        // });

        $(window).on("resize", (() => {
            this.forceUpdate();
        }).bind(this));
    }

    private onContentResize(_: any) {
        this.forceUpdate();
        // let prevState = this.props.plugin.context.layout.latestState;
        // this.props.plugin.setLayoutState({ isExpanded: true });
        // this.props.plugin.setLayoutState(prevState);
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
        if (this.state.data) {
            return <Data data={this.state.data} />
        } else {
            let controls: any[] = [];

            if (this.state.isLoading) {
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

            return <div className="ui">{controls}</div>;
        }
    }
}

export interface State {
    /**
     * This represents the JSON data returned by MOLE.
     * 
     * In a production environment (when using TypeScript),
     * it would be a good idea to write type interfaces for the
     * data to avoid bugs.
     */
    data: any
}

export class Data extends React.Component<State, {}> {
    render() {
        let cavities = new Map<String, any>();
        if (this.props.data.Cavities !== void 0) {
            cavities.set('Surface', [this.props.data.Cavities.Surface]);
            cavities.set('Cavities', this.props.data.Cavities.Cavities);
            cavities.set('Voids', this.props.data.Cavities.Voids);
        }

        let cavitiesControls: any[] = [];
        cavities.forEach((val, key, map) => {
            if (val.length > 0) {
                cavitiesControls.push(
                    <Cavities cavities={val} state={this.props} header={key.valueOf()} />
                );
            }
        });
        let noCavitiesData = <div className="no-channels-data">There are no cavities available...</div>

        let originsControls: any[] = [];
        if (this.props.data.Origins.User !== void 0)
            originsControls.push(<Origins origins={this.props.data.Origins.User} {...this.props} label='User Specifed (optimized)' />);
        if (this.props.data.Origins.InputOrigins !== void 0)
            originsControls.push(<Origins origins={this.props.data.Origins.InputOrigins} {...this.props} label='User Specifed' />);
        if (this.props.data.Origins.Computed !== void 0)
            originsControls.push(<Origins origins={this.props.data.Origins.Computed} {...this.props} label='Computed' />);
        if (this.props.data.Origins.Databse !== void 0)
            originsControls.push(<Origins origins={this.props.data.Origins.Database} {...this.props} label='Database' />);
        if (this.props.data.Origins.InputExits !== void 0)
            originsControls.push(<Origins origins={this.props.data.Origins.InputExits} {...this.props} label='Input Exits' />);
        if (this.props.data.Origins.InputFoundExits !== void 0)
            originsControls.push(<Origins origins={this.props.data.Origins.InputFoundExits} {...this.props} label='Input Found Exits' />);
        if (this.props.data.Origins.CSAOrigins !== void 0)
            originsControls.push(<Origins origins={this.props.data.Origins.CSAOrigins} {...this.props} label='CSA Origins' />);

        let noOriginsData = <div className="no-channels-data">There are no origins available...</div>

        let membrane;
        let membraneData = Context.getInstance().plugin.state.data.select(StateSelection.first('membrane-data'))[0];
        let noMembraneData = <div className="no-channels-data">There are no membrane data available...</div>

        if (membraneData !== void 0 && membraneData !== null && membraneData.obj !== void 0 && Object.keys(membraneData.obj).length !== 0 && membraneData.obj.data !== void 0 && Array.isArray(membraneData.obj.data)) {
            membrane = <Membrane membraneData={membraneData} label={"Membrane"} {...this.props} />
        }

        // if (membraneData === undefined || membraneData.obj === undefined || membraneData.obj.data === undefined || Object.keys(membraneData.obj).length === 0)  {
        //     membrane = <Membrane membraneData={membraneData} label={"Membrane"} {...this.props} />
        // }
        return <div className="ui">
            <Selection {...this.props} />

            <div className="ui-header origins">
                Origins
            </div>
            <div>
                {(originsControls.length === 0) ? noOriginsData : originsControls}
            </div>

            <div className="ui-header cavities">
                Cavities
            </div>
            <div>
                {(cavitiesControls.length === 0) ? noCavitiesData : cavitiesControls}
            </div>

            <div className="ui-header membrane">
                Membrane
            </div>
            <div>
                {(membrane === void 0) ? noMembraneData : membrane}
            </div>

        </div>;
    }
}

export class Selection extends React.Component<State, { label?: string | JSX.Element, tunnel: boolean }> {
    state = { label: void 0, tunnel: false }

    private observerChannels: Subscription | undefined = void 0;
    componentWillMount() {
        SelectionHelper.attachOnResidueSelectHandler(((r: LightResidueInfo[]) => {
            if (r.length === 0) {
                this.setState({
                    label: void 0,
                    tunnel: false
                });
                return;
            }
            let label = r.map((val, idx, array) => {
                let name = Residues.getResiudeName(val.authSeqNumber, val.chain.authAsymId, val.operatorName);
                return `${name}&nbsp;${val.authSeqNumber}&nbsp;${val.chain.authAsymId}&nbsp;${val.operatorName !== '' ? `${/\d/.test(val.operatorName)
                    ? (val.operatorName).replace(/.*?(\d+).*/, "$1") === '1'
                        ? ''
                        : '_' + (val.operatorName).replace(/.*?(\d+).*/, "$1")
                    : ''
                    }` : ''}`;
            }).reduce((prev, cur, idx, array) => {
                return `${prev}${(idx === 0) ? '' : ',\n'}${cur}`;
            });
            let items = label.split('\n');
            let elements = [];
            for (let e of items) {
                let lineParts = e.split('&nbsp;');
                elements.push(
                    lineParts.length === 4 ?
                        <div>
                            {lineParts[0]}&nbsp;{lineParts[1]}&nbsp;{lineParts[2]}&nbsp;{lineParts[3]}
                        </div>
                        :
                        <div>
                            {lineParts[0]}&nbsp;{lineParts[1]}&nbsp;{lineParts[2]}
                        </div>
                );
            }
            this.setState({
                label: <div className="columns">{elements}</div>,
                tunnel: false
            });
        }).bind(this));

        SelectionHelper.attachOnPointBulkSelectHandler(((points: Point[]) => {
            let elements = [];
            for (let e of points) {
                elements.push(
                    <div>
                        [{e.X.toFixed(2)},&nbsp;{e.Y.toFixed(2)},&nbsp;{e.Z.toFixed(2)}]
                    </div>
                );
            }
            this.setState({
                label: <div className="columns points">{elements}</div>,
                tunnel: false
            });
        }).bind(this));

        SelectionHelper.attachOnClearSelectionHandler((() => {
            this.setState({ label: void 0, tunnel: false });
            $("#left-tabs li a[href='#left-tabs-1']")
                .text("Channel profile");
        }).bind(this));

        SelectionHelper.attachOnChannelSelectHandler2((channel) => {;
            let tunnelName = Tunnels.getName(channel as Tunnel);
            let len = Tunnels.getLength(channel as Tunnel);
            if (channel.__channelsDB) {
                let annotations = ChannelsDBData.getChannelAnnotationsImmediate(channel.Id);
                if (annotations !== null && annotations.length > 0) {
                    tunnelName = annotations[0].name;
                }
                $("#left-tabs li a[href='#left-tabs-1']")
                    .text(`Channel profile (${tunnelName})`);
                this.setState({ label: <span><b>{tunnelName}</b>, {`Length: ${len} Å`}</span>, tunnel: true });
            }
            else {
                $("#left-tabs li a[href='#left-tabs-1']")
                    .text(`Channel profile (${tunnelName})`);
                let namePart = (tunnelName === void 0) ? '' : ` (${tunnelName})`;
                this.setState({ label: <span><b>{channel.Type}{namePart}</b>, {`Length: ${len} Å`}</span>, tunnel: true });
            }
        })

        SelectionHelper.attachOnChannelDeselectHandler(() => {
            $("#left-tabs li a[href='#left-tabs-1']")
                .text(`Channel profile`);
            this.setState({ label: void 0, tunnel: false })
        })

        // this.observerChannels = Context.getInstance().plugin.behaviors.interaction.click.subscribe(async ({ current, button, modifiers, position }) => {
        //     if (current.loci.kind === 'group-loci') {
        //         if (current.repr && current.repr.params && typeof current.repr.params.tag === 'string' && current.repr.params.tag === "Tunnel") {
        //             if (current.repr.params.tunnel !== null) {
        //                 if (SelectionHelper.isSelectedAnyChannel()) {
        //                     const c = current.repr.params.tunnel as unknown as Tunnel;
        //                     let tunnelName = Tunnels.getName(c);
        //                     let len = Tunnels.getLength(c);
        //                     if (isInChannelsDBMode()) {
        //                         let annotations = ChannelsDBData.getChannelAnnotationsImmediate(c.Id);
        //                         if (annotations !== null && annotations.length > 0) {
        //                             tunnelName = annotations[0].name;
        //                         }
        //                         $("#left-tabs li a[href='#left-tabs-1']")
        //                             .text(`Channel profile (${tunnelName})`);
        //                         this.setState({ label: <span><b>{tunnelName}</b>, {`Length: ${len} Å`}</span> });
        //                     }
        //                     else {
        //                         $("#left-tabs li a[href='#left-tabs-1']")
        //                             .text(`Channel profile (${tunnelName})`);
        //                         let namePart = (tunnelName === void 0) ? '' : ` (${tunnelName})`;
        //                         this.setState({ label: <span><b>{c.Type}{namePart}</b>, {`Length: ${len} Å`}</span> });
        //                     }
        //                 } else if (!SelectionHelper.isSelectedAny()) {
        //                     $("#left-tabs li a[href='#left-tabs-1']")
        //                         .text(`Channel profile`);
        //                     this.setState({ label: void 0 })
        //                 }
        //             }
        //         }
        //     }
        // });

        Events.subscribeChangeSubmitId(() => {
            if (!this.state.tunnel) {
                this.setState({ label: void 0 })
            }
        })

        // this.observerChannels = this.props.plugin.subscribe(Bootstrap.Event.Visual.VisualSelectElement, e => {
        //     let eventData = e.data as ChannelEventInfo;
        //     if (e.data !== void 0 && eventData.source !== void 0 && eventData.source.props !== void 0 && eventData.source.props.tag === void 0) {
        //         return;
        //     }

        //     if (e.data && (eventData === void 0 || e.data.kind !== 0)) {
        //         if (SelectionHelper.isSelectedAnyChannel()) {
        //             let data = e.data as ChannelEventInfo;
        //             let c = data.source.props.tag.element;
        //             let tunnelName = Tunnels.getName(c);
        //             let len = Tunnels.getLength(c);
        //             if (isInChannelsDBMode()) {
        //                 let annotations = ChannelsDBData.getChannelAnnotationsImmediate(c.Id);
        //                 if (annotations !== null && annotations.length > 0) {
        //                     tunnelName = annotations[0].name;
        //                 }
        //                 $("#left-tabs li a[href='#left-tabs-1']")
        //                     .text(`Channel profile (${tunnelName})`);
        //                 this.setState({ label: <span><b>{tunnelName}</b>, {`Length: ${len} Å`}</span> });
        //             }
        //             else {
        //                 $("#left-tabs li a[href='#left-tabs-1']")
        //                     .text(`Channel profile (${tunnelName})`);
        //                 let namePart = (tunnelName === void 0) ? '' : ` (${tunnelName})`;
        //                 this.setState({ label: <span><b>{c.Type}{namePart}</b>, {`Length: ${len} Å`}</span> });
        //             }
        //         }
        //         else if (!SelectionHelper.isSelectedAny()) {
        //             $("#left-tabs li a[href='#left-tabs-1']")
        //                 .text(`Channel profile`);
        //             this.setState({ label: void 0 })
        //         }
        //     }
        // });
    }

    componentWillUnmount() {
        if (this.observerChannels) {
            this.observerChannels.unsubscribe();
            // this.observerChannels.dispose();
            this.observerChannels = void 0;
        }
    }

    render() {
        return <div>
            <div className="ui-selection-header">
                <span>Selection</span>
                <div className="btn btn-xs btn-default ui-selection-clear" onClick={() => {
                    SelectionHelper.clearSelection();
                    SelectionHelper.invokeOnClearSelectionSequence();
                }} title="Clear selection"><i className="bi bi-trash" /></div>
            </div>
            <div className="ui-selection">{!this.state.label
                ? <i>Click on atom residue or channel</i>
                : this.state.label}
            </div>
        </div>
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

export class Renderable extends React.Component<{ label: string | JSX.Element, element: any, annotations?: ChannelAnnotation[], toggle: (elements: any[], visible: boolean) => Promise<any> } & State, { isAnnotationsVisible: boolean }> {

    state = { isAnnotationsVisible: false };

    private toggle() {
        this.props.element.__isBusy = true;
        this.forceUpdate(() =>
            this.props.toggle([this.props.element], !this.props.element.__isVisible)
                .then(() => this.forceUpdate()).catch(() => this.forceUpdate()));
    }

    private highlight(isOn: boolean) {
        // this.props.plugin.command(Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.element.__id), isOn }); //TODO
    }

    private toggleAnnotations(e: any) {
        this.setState({ isAnnotationsVisible: !this.state.isAnnotationsVisible });
    }

    private getAnnotationToggler() {
        return [(this.state.isAnnotationsVisible)
            ? <span className="hand glyphicon glyphicon-chevron-up" title="Hide list annotations for this channel" onClick={this.toggleAnnotations.bind(this)} />
            : <span className="hand glyphicon glyphicon-chevron-down" title="Show all annotations available for this channel" onClick={this.toggleAnnotations.bind(this)} />];
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
                reference = <a target="_blank" href={annotation.link}>{annotation.reference} <span className="glyphicon glyphicon-new-window" /></a>;
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
            emptyToggler = <span className="disabled glyphicon glyphicon-chevron-down" title="No annotations available for this channel" onClick={this.toggleAnnotations.bind(this)} />
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

export class Cavities extends React.Component<{ state: State, cavities: any[], header: string }, { isBusy: boolean }> {
    state = { isBusy: false }
    private show(visible: boolean) {
        for (let element of this.props.cavities) { element.__isBusy = true; }
        this.setState({ isBusy: true }, () =>
            showCavityVisuals(this.props.cavities, visible)
                .then(() => this.setState({ isBusy: false })).catch(() => this.setState({ isBusy: false })));
    }

    private isDisabled() {
        return !this.props.cavities || (this.props.cavities !== void 0 && this.props.cavities.length == 0);
    }

    render() {
        return <Section header={this.props.header} count={(this.props.cavities || '').length}
            controls={<div className='ui-show-all'><button className="btn btn-primary btn-sm" onClick={() => this.show(true)} disabled={this.state.isBusy || this.isDisabled()}>All</button><button className="btn btn-primary btn-sm" onClick={() => this.show(false)} disabled={this.state.isBusy || this.isDisabled()}>None</button></div>}
        >
            {this.props.cavities && this.props.cavities.length > 0
                ? this.props.cavities.map((c, i) => <Cavity key={i} cavity={c} state={this.props.state} />)
                : <div className="ui-label ui-no-data-available">No data available...</div>}
        </Section>
    }
}

export class Cavity extends React.Component<{ state: State, cavity: any }, { isVisible: boolean }> {
    state = { isVisible: false };

    render() {
        let c = this.props.cavity;
        return <div>
            <Renderable label={<span><b>{c.Id}</b>, Volume: <b>{`${c.Volume | 0} Å`}<sup>3</sup></b></span>} element={c} toggle={showCavityVisuals} {...this.props.state} />
        </div>
    }
}

export class Origins extends React.Component<{ label: string | JSX.Element, origins: any } & State, {}> {
    private toggle() {
        this.props.origins.__isBusy = true;
        this.forceUpdate(() =>
            showOriginsSurface(this.props.origins, !this.props.origins.__isVisible)
                .then(() => this.forceUpdate()).catch(() => this.forceUpdate()));
    }

    private highlight(isOn: boolean) {
        // this.props.plugin.command(Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.origins.__id), isOn }); //TODO
    }

    render() {
        if (this.props.origins.Points === void 0 || !this.props.origins.Points.length) {
            return <div style={{ display: 'none' }} />
        }

        return <div>
            <label onMouseEnter={() => this.highlight(true)} onMouseLeave={() => this.highlight(false)} >
                <input type='checkbox' checked={!!this.props.origins.__isVisible} onChange={() => this.toggle()} disabled={!!this.props.origins.__isBusy} /> {this.props.label}
            </label>
        </div>
    }
}

export class Membrane extends React.Component<{ label: string | JSX.Element, membraneData: any } & State, {}> {
    componentDidMount() {
        Events.subscribeOnMembraneDataReady(() => {
            this.forceUpdate();
        });
    }

    private toggle() {
        this.props.membraneData.__isBusy = true;
        this.forceUpdate(() =>
            showMembraneVisuals([this.props.membraneData as MembraneObject], !this.props.membraneData.__isVisible)
                .then(() => this.forceUpdate()).catch((err) => { this.forceUpdate(); console.log(err) }));
    }

    private highlight(isOn: boolean) {
        // this.props.plugin.command(Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.membraneData.__id), isOn });
    }

    componentWillUnmount(): void {
        console.log('here');
    }

    render() {
        if (this.props.membraneData === void 0) {
            return <div style={{ display: 'none' }} />
        }

        return <div>
            <label onMouseEnter={() => this.highlight(true)} onMouseLeave={() => this.highlight(false)} >
                <input type='checkbox' checked={!!this.props.membraneData.__isVisible} onChange={() => this.toggle()} disabled={!!this.props.membraneData.__isBusy} /> {this.props.label}
            </label>
        </div>
    }
}
