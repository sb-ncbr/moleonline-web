/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

import React from "react";
import { Events } from "../../../Bridge";
import { MoleData, Tunnel, Membrane as MembraneObject, Point } from "../../../DataInterface";
import { LightResidueInfo, SelectionHelper } from "../../CommonUtils/Selection";
import { Residues } from "../../CommonUtils/Residues";
import { Tunnels } from "../../CommonUtils/Tunnels";
import { ChannelsDBData } from "../../../Cache";
import { getParameters } from "../../../Common/Util/Router";
import { CommonOptions } from "../../../../config/common";
import { loadData, showCavityVisuals, showMembraneVisuals, showOriginsSurface } from "../../State";
import { Context } from "../../Context";
import { StateSelection } from "molstar/lib/mol-state";
import WaveLoader from "../../CommonUtils/WaveLoader";
import { LoadingStatusDisplay } from "../../CommonUtils/LoadingInfo/LoadingStatusDisplay";
import { Section } from "./ChannelsUI";

declare function $(p: any): any;

export class PluginControl extends React.Component<{ data: any }, { isLoading?: boolean, error?: string, data?: any, isWaitingForData?: boolean }> {

    state = { isLoading: false, data: void 0, error: void 0 };

    private unsubscribe: (() => void)[] = [];

    componentDidMount() {
        this.setState({ data: this.props.data })
        const onContentResize = this.onContentResize.bind(this);
        $(window).on("contentResize", onContentResize);
        this.unsubscribe.push(() => $(window).off("contentResize", onContentResize));

        this.unsubscribe.push(Events.subscribeChangeSubmitId((submitId) => {
            try {
                this.load(submitId === -1);
            } catch (ex) {
                if (CommonOptions.DEBUG_MODE)
                    console.log(ex);
                this.setState({ isLoading: false, data: void 0, error: "Data not available" });
            }
        }));

        const onResize = () => this.forceUpdate();
        $(window).on("resize", onResize);
        this.unsubscribe.push(() => $(window).off("resize", onResize));
    }

    componentWillUnmount() {
        this.unsubscribe.forEach(u => u());
        this.unsubscribe = [];
    }

    private onContentResize(_: any) {
        this.forceUpdate();
    }

    load(channelsDB: boolean) {
        const plugin = Context.getInstance().plugin;
        this.setState({ isLoading: true, error: void 0 });
        loadData(channelsDB)
            .then(data => {
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
                    // also drop the previous submission's data, it would be shown instead of the error
                    this.setState({ isLoading: false, data: void 0, error: `There are no vizualization data for computation '${computationId}' and submission '${submitId}'. Try to submit some computation job.` });
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

                this.setState({
                    isLoading: false, data: _data, error: void 0
                });
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
                controls.push(
                    <div key={'loader'}>
                        <WaveLoader />
                        <LoadingStatusDisplay />
                    </div>);
            } else {
                if (this.state.error) {
                    let error = this.state.error as string | undefined;
                    let errorMessage: string = (error === void 0) ? "" : error;
                    controls.push(
                        <div key={'error-message'} className="error-message">
                            <div>
                                <b>Data for specified protein are not available.</b>
                            </div>
                            <div style={{ wordWrap: "break-word" }}>
                                <b>Reason:</b> <i dangerouslySetInnerHTML={{ __html: errorMessage }}></i>
                            </div>
                        </div>);
                } else {
                    controls.push(
                        <div key={'error-message'} className="error-message">
                            <div>
                                <b>Data for specified protein are not available.</b>
                            </div>
                        </div>);
                }
                let params = getParameters();
                let channelsDB = false;
                if (params !== null) {
                    channelsDB = params.isChannelsDB;
                }
                controls.push(<button key={'reload'} className="reload-data btn btn-primary" onClick={() => this.load(channelsDB)}>Reload Data</button>);
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
                    <Cavities key={key.toString()} cavities={val} header={key.valueOf()} />
                );
            }
        });
        let noCavitiesData = <div className="no-channels-data">There are no cavities available...</div>

        // the groups of origins MOLE reports, in display order; empty groups are not shown
        const originGroups: [string, string][] = [
            ['User', 'User Specified (optimized)'],
            ['InputOrigins', 'User Specified'],
            ['Computed', 'Computed'],
            ['Database', 'Database'],
            ['InputExits', 'Input Exits'],
            ['InputFoundExits', 'Input Found Exits'],
            ['CSAOrigins', 'CSA Origins'],
        ];
        const origins: Record<string, any> | undefined = this.props.data.Origins;
        const originsControls = origins ? originGroups.filter(([key]) => origins[key] !== void 0)
            .map(([key, label]) => <Origins key={key} origins={origins[key]} {...this.props} label={label} />) : [];

        let noOriginsData = <div className="no-channels-data">There are no origins available...</div>

        let membrane;
        let membraneData = Context.getInstance().plugin.state.data.select(StateSelection.first('membrane-data'))[0];
        let noMembraneData = <div className="no-channels-data">There are no membrane data available...</div>

        if (membraneData?.obj?.data !== void 0) {
            membrane = <Membrane membraneData={membraneData} label={"Membrane"} {...this.props} />
        }

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

    private unsubscribe: (() => void)[] = [];

    componentDidMount() {
        this.unsubscribe.push(SelectionHelper.attachOnResidueSelectHandler(((r: LightResidueInfo[]) => {
            if (r.length === 0) {
                this.setState({
                    label: void 0,
                    tunnel: false
                });
                return;
            }
            let label = r.map((val, idx, array) => {
                let name = val.residueName ? val.residueName : Residues.getResiudeName(val.authSeqNumber, val.chain.authAsymId, val.operatorName);
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
            for (let [index, e] of items.entries()) {
                let lineParts = e.split('&nbsp;');
                elements.push(
                    lineParts.length === 4 ?
                        <div key={index}>
                            {lineParts[0]}&nbsp;{lineParts[1]}&nbsp;{lineParts[2]}&nbsp;{lineParts[3]}
                        </div>
                        :
                        <div key={index}>
                            {lineParts[0]}&nbsp;{lineParts[1]}&nbsp;{lineParts[2]}
                        </div>
                );
            }
            this.setState({
                label: <div className="columns">{elements}</div>,
                tunnel: false
            });
        }).bind(this)));

        this.unsubscribe.push(SelectionHelper.attachOnPointBulkSelectHandler(((points: Point[]) => {
            let elements = [];
            for (let [index, e] of points.entries()) {
                elements.push(
                    <div key={index}>
                        [{e.X.toFixed(2)},&nbsp;{e.Y.toFixed(2)},&nbsp;{e.Z.toFixed(2)}]
                    </div>
                );
            }
            this.setState({
                label: <div className="columns points">{elements}</div>,
                tunnel: false
            });
        }).bind(this)));

        this.unsubscribe.push(SelectionHelper.attachOnClearSelectionHandler((() => {
            this.setState({ label: void 0, tunnel: false });
            $("#left-tabs li a[href='#left-tabs-1']")
                .text("Channel profile");
        }).bind(this)));

        this.unsubscribe.push(SelectionHelper.attachOnChannelSelectHandler2((channel) => {
            let tunnelName = Tunnels.getName(channel as Tunnel);
            let len = Tunnels.getLength(channel as Tunnel);
            if (channel.__channelsDB) {
                let annotations = ChannelsDBData.getChannelAnnotationsImmediate(channel.Id);
                if (annotations !== null && annotations.length > 0) {
                    tunnelName = annotations[0].name;
                }
                $("#left-tabs li a[href='#left-tabs-1']")
                    .text(`Channel profile (${channel.Type})`);
                this.setState({ label: <span><b>{tunnelName}</b>, {`Length: ${len} Å`}</span>, tunnel: true });
            }
            else {
                $("#left-tabs li a[href='#left-tabs-1']")
                    .text(`Channel profile (${tunnelName})`);
                let namePart = (tunnelName === void 0) ? '' : ` (${tunnelName})`;
                this.setState({ label: <span><b>{channel.Type}{namePart}</b>, {`Length: ${len} Å`}</span>, tunnel: true });
            }
        }))

        this.unsubscribe.push(SelectionHelper.attachOnChannelDeselectHandler(() => {
            $("#left-tabs li a[href='#left-tabs-1']")
                .text(`Channel profile`);
            this.setState({ label: void 0, tunnel: false })
        }))

        this.unsubscribe.push(Events.subscribeChangeSubmitId(() => {
            if (!this.state.tunnel) {
                this.setState({ label: void 0 })
            }
        }))
    }

    componentWillUnmount() {
        this.unsubscribe.forEach(u => u());
        this.unsubscribe = [];
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

export class Cavities extends React.Component<{ cavities: any[], header: string }, { isBusy: boolean }> {
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
                ? this.props.cavities.map((c, i) => <Cavity key={i} cavity={c} />)
                : <div className="ui-label ui-no-data-available">No data available...</div>}
        </Section>
    }
}

// A cavity's checkbox: shows or hides it
export class Cavity extends React.Component<{ cavity: any }> {
    private toggle() {
        const c = this.props.cavity;
        c.__isBusy = true;
        this.forceUpdate(() =>
            showCavityVisuals([c], !c.__isVisible)
                .then(() => this.forceUpdate()).catch(() => this.forceUpdate()));
    }

    render() {
        const c = this.props.cavity;
        return <div>
            <div className="ui-label">
                <input type='checkbox' checked={!!c.__isVisible} onChange={() => this.toggle()} disabled={!!c.__isBusy} />
                <label className="ui-label-element"> <span><b>{c.Id}</b>, Volume: <b>{`${c.Volume | 0} Å`}<sup>3</sup></b></span></label>
            </div>
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
    private unsubscribe: (() => void)[] = [];

    componentDidMount() {
        this.unsubscribe.push(Events.subscribeOnMembraneDataReady(() => {
            this.forceUpdate();
        }));
        this.unsubscribe.push(Events.subscribeToggleLoadingScreen(({ message, visible }) => {
            if (!visible) {
                this.props.membraneData.__isVisible = false;
                this.toggle();
            }
        }));
        this.toggle();
    }

    componentWillUnmount() {
        this.unsubscribe.forEach(u => u());
        this.unsubscribe = [];
    }

    componentDidUpdate(prevProps: any) {
        if (prevProps.membraneData !== this.props.membraneData) {
            this.toggle();
        } else if (CommonOptions.DEBUG_MODE) {
            console.log("Props are unchanged, skipping updates.");
        }
    }


    private toggle() {
        this.props.membraneData.__isBusy = true;
        this.forceUpdate(() =>
            showMembraneVisuals([this.props.membraneData as MembraneObject], !this.props.membraneData.__isVisible)
                .then(() => this.forceUpdate()).catch((err) => { this.forceUpdate(); console.log(err) }));
    }

    private highlight(isOn: boolean) {
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
