
// import Event = LiteMol.Bootstrap.Event;
// import Transformer = LiteMol.Bootstrap.Entity.Transformer;
// import Visualization = LiteMol.Bootstrap.Visualization;
// import Tabs = CommonUtils.Tabs;

import React from "react";
import { ColorBoundsMode, RadiusProperty, Vizualizer } from "../../LayerVizualizer/Vizualizer";
import { convertLayersToLayerData, LayerData, TunnelMetaInfo, Tunnel as DataTunnel } from "../../../DataInterface";
import { SelectionHelper } from "../../CommonUtils/Selection";
import { activateTab, doAfterTabActivated } from "../../CommonUtils/Tabs";
import { Events } from "../../../Bridge";
import { Bundle, TooltipText } from "../../../StaticData";
import { triggerDownload } from "../../CommonUtils/Misc";
import { Tunnel } from "../../LayerVizualizer/Backend";
import { CommonOptions } from "../../../../config/common";
import { QueryParam } from "../../VizualizerMol/helpers";
import { Context } from "../../Context";
import { LayerColors } from "../../CommonUtils/LayerColors";
import { showChannelPropertyColorVisuals, showChannelVisuals } from "../../State";
import { ColorBound, Property } from "../../VizualizerMol/color-tunnels/property-color";
import { Shape, ShapeGroup } from "molstar/lib/mol-model/shape";
import { OrderedSet } from 'molstar/lib/mol-data/int'
import { EmptyLoci, Loci } from "molstar/lib/mol-model/loci";
import { MarkerAction } from "molstar/lib/mol-util/marker-action";
import { Representation } from "molstar/lib/mol-repr/representation";
import { isInChannelsDBMode } from "../../../Common/Util/Router";

declare function $(p: any): any;

function getLayerResidues(layerIdx: number, data: LayerData[]): QueryParam[] {
    let res = [];
    for (let residue of data[layerIdx].Residues) {
        let parts = (residue as string).split(" ");
        res.push({
            struct_asym_id: parts[2],
            start_auth_residue_number: Number(parts[1]),
            end_auth_residue_number: Number(parts[1]),
            color: { r: 255, g: 0, b: 255 },
            sideChain: true,
            focus: false
        })
    }

    return res;
}

function resetFocusToTunnel() {
    const loci = SelectionHelper.getSelectedChannelLoci();
    if (loci) Context.getInstance().plugin.managers.camera.focusLoci(loci);
}

async function showLayerResidues3DAndFocus(layerIds: number[], data: LayerData[]) {
    let residues: QueryParam[] = [];

    for (let l of layerIds) {
        residues = residues.concat(getLayerResidues(l, data));
    }

    await Context.getInstance().visual.clearSelection();
    if (residues.length > 0)
        await Context.getInstance().visual.select({ data: residues, focusCenter: true });
}

// export function render(vizualizer: Vizualizer, target: Element, plugin: LiteMol.Plugin.Controller) {
//     LiteMol.Plugin.ReactDOM.render(<App vizualizer={vizualizer} controller={plugin} />, target);
// }

type TunnelWithMetaData = DataTunnel & TunnelMetaInfo;

export class LayerVizualizer extends React.Component<{ vizualizer: Vizualizer }, State> {

    state: State = {
        instanceId: -1,
        hasData: false,
        data: [] as LayerData[],
        layerId: 0,
        layerIds: [0],
        coloringPropertyKey: "",
        customColoringPropertyKey: "",
        radiusPropertyKey: "MinRadius" as RadiusProperty,
        customRadiusPropertyKey: "MinRadius" as RadiusProperty,
        colorBoundsMode: "Absolute" as ColorBoundsMode,
        isDOMReady: false,
        app: this,
        currentTunnelRef: "",
        isLayerSelected: false,
        channel: undefined
    };

    vizualizer: Vizualizer

    componentDidMount() {
        var vizualizer = this.props.vizualizer;

        vizualizer.setColorBoundsMode(this.state.colorBoundsMode);

        let state = this.state;
        state.instanceId = vizualizer.getPublicInstanceIdx(),
            state.customColoringPropertyKey = vizualizer.getCustomColoringPropertyKey(),
            state.coloringPropertyKey = vizualizer.getColoringPropertyKey(),
            state.customRadiusPropertyKey = vizualizer.getCustomRadiusPropertyKey(),
            state.radiusPropertyKey = vizualizer.getRadiusPropertyKey(),
            state.colorBoundsMode = this.state.colorBoundsMode
        this.setState(state);
        this.vizualizer = vizualizer;

        SelectionHelper.attachOnChannelSelectHandler((data) => {
            window.setTimeout(() => {
                let state = this.state;
                state.currentTunnelRef = SelectionHelper.getSelectedChannelRef();
                state.isLayerSelected = false;
                this.setState(state);
                //$('#left-tabs').tabs("option", "active", 0);
                activateTab("left-tabs", "1");
                let layers = convertLayersToLayerData(data);
                doAfterTabActivated("left-tabs", "1", () => {
                    vizualizer.setData(layers);
                    let s1 = this.state;
                    s1.data = layers;
                    s1.hasData = true;
                    s1.isDOMReady = false;
                    s1.instanceId = vizualizer.getPublicInstanceIdx();
                    this.setState(s1, () => { // had to use callBack since the state has to be set and component has to render the 'PaintingArea' before ''vizualizer.rebindDOMRefs'
                        vizualizer.rebindDOMRefs();
                        let coloringPropertyKey = this.state.coloringPropertyKey;
                        let customColoringPropertyKey = this.state.customColoringPropertyKey;
                        let radiusPropertyKey = this.state.radiusPropertyKey;
                        let customRadiusPropertyKey = this.state.customRadiusPropertyKey;
                        if (this.state.channel && this.state.channel.__channelsDB) {
                            if (this.state.coloringPropertyKey === "BRadius") {
                                vizualizer.setColoringPropertyKey("Hydropathy")
                                coloringPropertyKey = "Hydropathy";
                            }
                            if (this.state.customColoringPropertyKey === "BRadius") {
                                vizualizer.setCustomColoringPropertyKey("Hydropathy");
                                customColoringPropertyKey = "Hydropathy";
                            }
                            if (this.state.radiusPropertyKey === "MinBRadius") {
                                vizualizer.setRadiusPropertyKey("MinRadius");
                                radiusPropertyKey = "MinRadius";
                            }
                            if (this.state.customRadiusPropertyKey === "MinBRadius") {
                                vizualizer.setCustomRadiusPropertyKey("MinRadius");
                                customRadiusPropertyKey = "MinRadius";
                            }
                        }
                        vizualizer.vizualize();
                        vizualizer.renderOffCanvas();
                        let s2 = this.state;
                        s2.data = layers;
                        s2.hasData = true;
                        s2.isDOMReady = true;
                        s2.instanceId = vizualizer.getPublicInstanceIdx();
                        s2.coloringPropertyKey = coloringPropertyKey;
                        s2.customColoringPropertyKey = customColoringPropertyKey;
                        s2.radiusPropertyKey = radiusPropertyKey;
                        s2.customRadiusPropertyKey = customRadiusPropertyKey;
                        this.setState(s2);
                    });
                });
            }, 50);
        });
        SelectionHelper.attachOnChannelSelectHandler2((channel) => {
            window.setTimeout(() => {
                let state = this.state;
                // this.setState(state);
                doAfterTabActivated("left-tabs", "1", () => {
                    let s1 = this.state;
                    s1.channel = channel;
                    this.setState(s1, () => { // had to use callBack since the state has to be set and component has to render the 'PaintingArea' before ''vizualizer.rebindDOMRefs'
                        let s2 = this.state;
                        s2.channel = channel;
                        this.setState(s2);
                    });
                });
            }, 50);
        })
        SelectionHelper.attachOnChannelDeselectHandler(() => {
            let state = this.state;
            state.data = [];
            state.hasData = false;
            state.isDOMReady = false;
            state.currentTunnelRef = "";
            state.isLayerSelected = false;
            this.setState(state);
            setTimeout(function () {
                $(window).trigger('contentResize');
            }, 1);
        });

        LayerColors.attachLayerIndexOverObject((layerIndex) => {
            this.vizualizer.highlightHitbox(layerIndex);
            if (!this.state.isLayerSelected) {
                this.setState({ layerIds: [layerIndex] })
                $(window).trigger('layerTriggered', layerIndex);
            }
        })

        LayerColors.attachLayerIndexSelectObject(async (layerIndex, loci) => {
            LayerColors.setSelectChannelLiningResidues(true);
            this.setState({ layerIds: layerIndex === -1 ? [] : [layerIndex] })
            const layerIdxs = layerIndex === -1 ? [] : [layerIndex];
            if (layerIdxs.length === 0) {
                await Context.getInstance().visual.clearSelection();
                resetFocusToTunnel();
            }
            this.vizualizer.selectLayers(layerIdxs);
            for (let layerIdx of layerIdxs) {
                $(window).trigger('layerTriggered', layerIdx);
            }
            if (layerIdxs.length > 0) {
                await showLayerResidues3DAndFocus(layerIdxs, this.state.data);
                const context = Context.getInstance();
                context.visual.setColor({ select: { r: 255, g: 0, b: 255 } });
                context.plugin.canvas3d?.mark(loci, MarkerAction.Select);
                context.visual.reset({ selectColor: true });
            }
            $(window).trigger('layerSelected', { layerIds: layerIdxs.slice() });
            $(window).trigger('resize');
            LayerColors.setSelectChannelLiningResidues(false);
        })
        LayerColors.attachOnChannelRemoved((ref) => {
            if (this.state.channel !== undefined) {
                const channel = this.state.channel;
                if (channel.__ref === ref) {
                    this.setState({ channel })
                }
            }
        })
        // Events.subscribeChangeSubmitId(() => {
        //     let state = this.state;
        //     state.data = [];
        //     state.hasData = false;
        //     state.isDOMReady = false;
        //     state.currentTunnelRef = "";
        //     state.isLayerSelected = false;
        //     this.setState(state);
        //     setTimeout(function () {
        //         $(window).trigger('contentResize');
        //     }, 1);
        // });

        $(window).on("lvContentResize", (() => {
            this.forceUpdate();
        }).bind(this));
        $(window).on("resize", (() => {
            this.forceUpdate();
        }).bind(this));
    }

    componentWillUnmount() {
    }

    render() {
        if (this.state.hasData) {
            $('.init-lvz-tooltip').tooltip();
            return <PaintingArea {...this.state} />
        }

        return <Hint {...this.state} />
    }
}

interface State {
    instanceId: number,
    hasData: boolean,
    data: LayerData[],
    layerIds: number[],
    layerId: number,
    coloringPropertyKey: string,
    customColoringPropertyKey: string,
    radiusPropertyKey: RadiusProperty,
    customRadiusPropertyKey: RadiusProperty,
    colorBoundsMode: ColorBoundsMode
    isDOMReady: boolean,
    app: LayerVizualizer,
    currentTunnelRef: string,
    isLayerSelected: boolean,
    channel: TunnelWithMetaData | undefined
};

class PaintingArea extends React.Component<State, {}> {
    render() {
        return (
            <div className="layerVizualizer"
                id={`layer-vizualizer-ui${this.props.instanceId}`}
            >
                <div className="wrapper-container">
                    <Controls {...this.props} isCustom={false} />
                    <CanvasWrapper {...this.props} />
                    <Controls {...this.props} isCustom={true} />
                </div>
                <CommonControls {...this.props} />
            </div>
        );
    };
}

class Hint extends React.Component<State, {}> {
    render() {
        return (
            <div id={`layer-vizualizer-hint-div${this.props.instanceId}`}
                className="layer-vizualizer-hint-div"
            >
                Click on one of available channels to see more information...
            </div>
        );
    }
}

class ColorMenuItem extends React.Component<State & { propertyName: string, isCustom: boolean }, {}> {
    private changeColoringProperty(e: React.MouseEvent<HTMLAreaElement>) {
        let targetElement = (e.target as HTMLElement);
        let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
        let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

        let propertyName = targetElement.getAttribute("data-propertyname");
        if (propertyName === null) {
            if (CommonOptions.DEBUG_MODE)
                console.log("No property name found!");
            return;
        }

        if (this.props.isCustom) {
            if (CommonOptions.DEBUG_MODE)
                console.log(`setting custom property key: ${propertyName}`);
            instance.setCustomColoringPropertyKey(propertyName);
        }
        else {
            if (CommonOptions.DEBUG_MODE)
                console.log(`setting regular property key: ${propertyName}`);
            instance.setColoringPropertyKey(propertyName);
        }

        instance.vizualize();
        let state = this.props.app.state;
        if (this.props.isCustom) {
            state.customColoringPropertyKey = propertyName;
            this.props.app.setState(state);
        }
        else {
            state.coloringPropertyKey = propertyName;
            this.props.app.setState(state);
            instance.renderOffCanvas();
            const p = LayerColors.toProperty(propertyName);
            if (p) {
                LayerColors.invokeOnColorPropertyChagned(p);
            }
        }
    }

    render() {
        return (
            <li><a data-instanceidx={this.props.instanceId} data-propertyname={this.props.propertyName} data-toggle="tooltip" data-placement="right" title={TooltipText.get(this.props.propertyName)} onClick={this.changeColoringProperty.bind(this)} className="init-lvz-tooltip lvz-properties dropdown-item">{Bundle.get(this.props.propertyName)}</a></li>
        );
    }
}

class RadiusMenuItem extends React.Component<State & { propertyName: string, isCustom: boolean }, {}> {
    private changeRadiusProperty(e: React.MouseEvent<HTMLAreaElement>) {
        let targetElement = (e.target as HTMLElement);
        let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
        let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

        let propertyName = targetElement.getAttribute("data-propertyname") as RadiusProperty;
        if (propertyName === null || propertyName === void 0) {
            return;
        }

        if (this.props.isCustom) {
            instance.setCustomRadiusPropertyKey(propertyName);
        }
        else {
            instance.setRadiusPropertyKey(propertyName);
        }

        instance.vizualize();

        let state = this.props.app.state;
        if (this.props.isCustom) {
            state.customRadiusPropertyKey = propertyName;
            this.props.app.setState(state);
        }
        else {
            state.radiusPropertyKey = propertyName;
            this.props.app.setState(state);
        }
    }

    render() {
        return (
            <li><a data-instanceidx={this.props.instanceId} data-propertyname={this.props.propertyName} data-toggle="tooltip" data-placement="right" title={TooltipText.get(this.props.propertyName)} onClick={this.changeRadiusProperty.bind(this)} className="init-lvz-tooltip lvz-radius dropdown-item">{Bundle.get(this.props.propertyName)}</a></li>
        );
    }
}

class ColorBoundsMenuItem extends React.Component<State & { mode: string }, {}> {
    private changeColorBoundsMode(e: React.MouseEvent<HTMLAreaElement>) {
        let targetElement = (e.target as HTMLElement);
        let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
        let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

        let mode = targetElement.getAttribute("data-mode") as ColorBoundsMode;
        if (mode === null || mode === void 0) {
            return;
        }

        instance.setColorBoundsMode(mode);
        if (mode === 'Absolute') {
            LayerColors.invokeOnColorBoundsChanged('absolute');
        } else {
            LayerColors.invokeOnColorBoundsChanged('minmax');
        }
        instance.vizualize();
        instance.renderOffCanvas();
        let state = this.props.app.state;
        state.colorBoundsMode = mode;
        this.props.app.setState(state);
    }

    render() {
        return (
            <li><a className="dropdown-item" data-instanceidx={this.props.instanceId} data-mode={this.props.mode} onClick={this.changeColorBoundsMode.bind(this)}>{this.props.mode}</a></li>
        );
    }
}

class BootstrapDropUpMenuButton extends React.Component<{ label: string, items: JSX.Element[] }, {}> {
    render() {
        return <div className="btn-group dropup">
            <button type="button" className="btn btn-sm btn-primary dropdown-toggle btn-sm-vizualizer" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {this.props.label} <span className="caret"></span>
            </button>
            <ul className="dropdown-menu">
                {this.props.items}
            </ul>
        </div>
    }
}

class Controls extends React.Component<State & { isCustom: boolean }, {}> {
    render() {
        return (
            <div className="controls">
                <RadiusSwitch state={this.props} isCustom={this.props.isCustom} radiusProperty={(this.props.isCustom) ? this.props.customRadiusPropertyKey : this.props.radiusPropertyKey} />
                <ColorBySwitch state={this.props} isCustom={this.props.isCustom} coloringProperty={(this.props.isCustom) ? this.props.customColoringPropertyKey : this.props.coloringPropertyKey} />
                {!this.props.isCustom ? <PropertyColorTunnel state={this.props} /> : <></>}
            </div>
        );
    }
}

class CommonControls extends React.Component<State, {}> {

    render() {
        return (
            <div className="controls">
                <CommonButtonArea {...this.props} />
            </div>
        );
    }
}

class ColorBySwitch extends React.Component<{ state: State, coloringProperty: string, isCustom: boolean }, {}> {
    private generateColorMenu() {

        let rv = [];
        for (let prop in this.props.state.data[0].Properties) {
            rv.push(
                <ColorMenuItem propertyName={prop} isCustom={this.props.isCustom} {...this.props.state} />
            );
        }

        if (this.props.state.channel && this.props.state.channel.__channelsDB === undefined) {
            rv.push(
                <ColorMenuItem propertyName={'BRadius'} isCustom={this.props.isCustom} {...this.props.state} />
            );
        }

        return <BootstrapDropUpMenuButton items={rv} label={Bundle.get(this.props.coloringProperty)} />
    }

    render() {
        let items = this.generateColorMenu();
        return (
            <span className="block-like">
                <span className="control-label">Color by:</span> {items}
            </span>
        );
    }
}

class RadiusSwitch extends React.Component<{ state: State, radiusProperty: RadiusProperty, isCustom: boolean }, {}> {
    private generateRadiusSwitch() {
        let properties = ["MinRadius", "MinFreeRadius"];
        let rv = [];
        for (let prop of properties) {
            rv.push(
                <RadiusMenuItem propertyName={prop} isCustom={this.props.isCustom} {...this.props.state} />
            );
        }

        if (this.props.state.channel && this.props.state.channel.__channelsDB === undefined) {
            rv.push(
                <RadiusMenuItem propertyName={"MinBRadius"} isCustom={this.props.isCustom} {...this.props.state} />
            );
        }

        return <BootstrapDropUpMenuButton items={rv} label={Bundle.get(this.props.radiusProperty)} />
    }

    render() {
        let items = this.generateRadiusSwitch();
        return (
            <span className="block-like">
                <span className="control-label">Tunnel radius:</span> {items}
            </span>
        );
    }
}

class PropertyColorTunnel extends React.Component<{ state: State }, { property: Property, colorBounds: ColorBound, context: Context, checked: boolean, disabled: boolean }> {

    state = {
        property: 'hydropathy' as Property,
        colorBounds: 'absolute' as ColorBound,
        context: Context.getInstance(),
        checked: false,
        disabled: false
    }

    toggle(checked: boolean) {
        if (this.props.state.channel) {
            const channel = this.props.state.channel;
            channel.__isBusy = true;
            if (checked) {
                this.forceUpdate(() => {
                    showChannelPropertyColorVisuals(channel, { property: this.state.property, colorBounds: this.state.colorBounds }, true).then(() => this.forceUpdate()).catch(() => this.forceUpdate());
                })
            } else {
                this.forceUpdate(() => {
                    showChannelVisuals([channel], true, true).then(() => {
                        this.state.context.plugin.managers.interactivity.lociSelects.selectOnly({ loci: channel.__loci });
                        this.forceUpdate();
                    }).catch(() => this.forceUpdate());
                })
            }
        }
    }

    getLoci(channel: DataTunnel & TunnelMetaInfo, layerIndex: number) {
        const groups = [{ ids: OrderedSet.ofSortedArray([layerIndex]), instance: 0 }] as ReadonlyArray<{
            readonly ids: OrderedSet<number>;
            readonly instance: number;
        }>;
        const loci = ShapeGroup.Loci(channel.__loci.shape, groups);
        return loci;
    }

    componentDidMount() {
        SelectionHelper.attachOnChannelSelectHandler(() => {
            this.setState({ checked: false, disabled: false })
        })
        LayerColors.attachOnChannelRemoved((ref) => {
            if (this.props.state.channel === undefined) {
                this.setState({ checked: false, disabled: true})
            } else if (this.props.state.channel.__ref === ref) {
                this.setState({ checked: false, disabled: true})
            } else {
                this.setState({ checked: false })
            }
        })
        LayerColors.attachOnChannelAdd((ref) => {
            const channel = this.props.state.channel;
            if (channel !== undefined && channel.__ref === ref) {
                this.setState({disabled: false})
            }
        })
        LayerColors.attachOnColorPropertyChagned((property) => {
            this.setState({ property })
            if (this.state.checked) this.toggle(true)
        })
        LayerColors.attachOnColorBoundsChanged((colorBounds) => {
            this.setState({ colorBounds })
            if (this.state.checked) this.toggle(true)
        })
        LayerColors.attachLayerIndexOver((layerIndex) => {
            if (this.props.state.channel) {
                if (layerIndex >= 0) {
                    const channel = this.props.state.channel;
                    const loci = this.getLoci(channel, layerIndex)
                    this.state.context.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci })
                } else {
                    this.state.context.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci: EmptyLoci });
                }
            }
        })
        LayerColors.attachLayerIndexSelect((layerIndex) => {
            if (this.props.state.channel) {
                if (layerIndex >= 0) {
                    const channel = this.props.state.channel;
                    const loci = this.getLoci(channel, layerIndex)
                    const context = Context.getInstance();
                    context.visual.setColor({ select: { r: 255, g: 0, b: 255 } });
                    context.plugin.canvas3d?.mark({ loci } as Representation.Loci<Loci>, MarkerAction.Select);
                    context.visual.reset({ selectColor: true });
                }
            }
        })
    }

    render() {
        return (
            <span className="block-like">
                <span className="control-label">Color tunnel: </span>
                <input type='checkbox'
                    checked={this.state.checked}
                    onChange={() => {
                        if (this.props.state.channel) {
                            this.toggle(!this.state.checked);
                            this.setState({ checked: !this.state.checked });
                        }
                    }}
                    disabled={this.state.disabled}
                />
            </span>
        )
    }
}

class CommonButtonArea extends React.Component<State, {}> {
    private generateColorBoundsSwitch() {
        let properties = ["Min/max", "Absolute"];
        let rv = [];
        for (let prop of properties) {
            rv.push(
                <ColorBoundsMenuItem mode={prop} {...this.props} />
            );
        }

        let label = properties[(this.props.colorBoundsMode == "Min/max") ? 0 : 1];

        return <BootstrapDropUpMenuButton items={rv} label={label} />
    }

    render() {
        let items = this.generateColorBoundsSwitch();
        return (
            <div className="common-area">
                <ColorBoundsSwitchButton items={items} />
                <ExportButton instanceId={this.props.instanceId} />
            </div>
        );
    }
}

class ExportTypeButton extends React.Component<{ instanceId: number, exportType: string }, {}> {

    private export(e: React.MouseEvent<HTMLAreaElement>) {
        let targetElement = (e.target as HTMLElement);
        let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
        let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

        let exportType = targetElement.getAttribute("data-exporttype");
        if (exportType === null) {
            return;
        }

        let imgDataUrl = null;

        switch (exportType) {
            case "PNG":
                imgDataUrl = instance.exportImage();
                break;
            case "SVG":
                imgDataUrl = instance.exportSVGImage();
                break;
            /*case "PDF":
                imgDataUrl = instance.exportPDF();
                break;*/
            default:
                throw new Error(`Unsupported export type '${exportType}'`);
        }

        triggerDownload(imgDataUrl, `export-2D.${exportType.toLowerCase()}`);
    }

    render() {
        return <li><a className="dropdown-item" data-instanceidx={this.props.instanceId} data-exporttype={this.props.exportType} onClick={this.export.bind(this)}>{this.props.exportType}</a></li>
    }
}

class ExportButton extends React.Component<{ instanceId: number }, {}> {
    private generateItems() {
        let rv = [] as JSX.Element[];
        let supportedExportTypes = ["PNG", "SVG"/*,"PDF"*/];
        for (let type of supportedExportTypes) {
            rv.push(
                <ExportTypeButton instanceId={this.props.instanceId} exportType={type} />
            );
        }

        return rv;
    }

    render() {
        let label = "Export";
        let rv = this.generateItems();
        return (<BootstrapDropUpMenuButton items={rv} label={label} />);
    }
}

class ColorBoundsSwitchButton extends React.Component<{ items: JSX.Element }, {}> {
    render() {
        return (
            <span className="color-bounds-button-container">
                <span className="control-label" title="Color bounds for both halfs of vizualized tunnel.">
                    Color bounds:
                </span> {this.props.items}
            </span>
        );
    }
}

class CanvasWrapper extends React.Component<State, {}> {
    render() {
        return (
            <div className="canvas-wrapper">
                <RealCanvas {...this.props} />
                <ImgOverlay {...this.props} />
                <InteractionMap {...this.props} />
            </div>
        );
    }
}

class ImgOverlay extends React.Component<State, {}> {
    render() {
        return (
            <img className="fake-canvas"
                id={`layer-vizualizer-fake-canvas${this.props.instanceId}`}
                useMap={`#layersInteractiveMap${this.props.instanceId}`}
                src="/images/no_img.png"
            ></img>
        );
    }
}

class RealCanvas extends React.Component<State, {}> {
    render() {
        return (
            <canvas id={`layer-vizualizer-canvas${this.props.instanceId}`}
                className="layer-vizualizer-canvas"
                width="700"
                height="150"
            ></canvas>
        );
    }
}

interface TunnelScale {
    xScale: number,
    yScale: number
};
interface Bounds {
    x: number,
    y: number,
    width: number,
    height: number
};

interface InteractionMapState {
    mouseControlStartLayerId: number
    selectionMode: boolean,
    touchMode: boolean
};

class InteractionMap extends React.Component<State, InteractionMapState> {

    state: InteractionMapState = {
        mouseControlStartLayerId: -1,
        selectionMode: false,
        touchMode: false
    };

    componentDidMount() {
        document.ontouchstart = (e) => {
            this.enableTouchMode();
        };
    }

    private displayDetailsEventHandler(e: React.MouseEvent<HTMLAreaElement>) {
        if (this.state.touchMode) {
            return;
        }

        let targetElement = (e.target as HTMLElement);
        let layerIdx = Number(targetElement.getAttribute("data-layeridx")).valueOf();
        let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
        let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

        instance.highlightHitbox(layerIdx);
        LayerColors.invokeLayerIndexOver(layerIdx);
        if (!this.props.app.state.isLayerSelected) {
            let state = this.props.app.state;
            state.layerIds = [layerIdx];
            this.props.app.setState(state);
            $(window).trigger('layerTriggered', layerIdx);
        }
    }

    private async displayLayerResidues3DEventHandler(layerIdxs: number[], instance: Vizualizer) {
        LayerColors.setSelectChannelLiningResidues(true);
        let state = this.props.app.state;
        state.layerIds = layerIdxs;
        state.isLayerSelected = state.layerIds.length > 0;

        this.props.app.setState(state);

        if (layerIdxs.length === 0) {
            await Context.getInstance().visual.clearSelection();
            resetFocusToTunnel();
            SelectionHelper.selectTunnelByRef();
        }

        instance.selectLayers(layerIdxs);
        for (let layerIdx of layerIdxs) {
            $(window).trigger('layerTriggered', layerIdx);
        }
        if (layerIdxs.length > 0) {
            await showLayerResidues3DAndFocus(layerIdxs, this.props.data);
            LayerColors.invokeLayerIndexSelect(layerIdxs[0])
            SelectionHelper.selectTunnelByRef();
        }
        $(window).trigger('layerSelected', { layerIds: layerIdxs.slice() });
        $(window).trigger('resize');

        LayerColors.setSelectChannelLiningResidues(false);
        //TODO: maybe SelectionHelper.highlightSelectedChannel(this.props.controller);
    }

    // private async displayLayerResidues3DEventHandler(layerIdxs: number[], instance: Vizualizer) {
    //     let state = this.props.app.state;
    //     state.layerIds = layerIdxs;
    //     state.isLayerSelected = state.layerIds.length > 0;

    //     this.props.app.setState(state);
    //     if (instance.getSelectedLayer().length === 0) {
    //         this.resetFocusToTunnel();
    //         await SelectionHelper.clearSelection();
    //     }
    //     if (state.layerIds.length === 0) {
    //         this.resetFocusToTunnel();
    //         await SelectionHelper.clearSelection();
    //     }

    //     instance.selectLayers(state.layerIds);
    //     for (let layerIdx of state.layerIds) {
    //         $(window).trigger('layerTriggered', layerIdx);
    //     }
    //     if (state.layerIds.length > 0) {
    //         await this.showLayerResidues3DAndFocus(state.layerIds);
    //     }
    //     $(window).trigger('layerSelected', { layerIds: state.layerIds.slice() });
    //     $(window).trigger('resize');

    //     //TODO: maybe SelectionHelper.highlightSelectedChannel(this.props.controller);
    // }

    private getTunnelScale(tunnel: Tunnel | null): TunnelScale {
        let xScale = 0;
        let yScale = 0;

        if (tunnel !== null) {
            let scale = tunnel.getScale();
            if (scale !== null) {
                xScale = scale.x;
                yScale = scale.y;
            }
        }

        return {
            xScale,
            yScale
        };
    }

    private transformCoordinates(x: number, y: number, width: number, height: number, scale: TunnelScale, bounds: Bounds): {
        sx: number, sy: number, dx: number, dy: number
    } {
        let vizualizer = Vizualizer.ACTIVE_INSTANCES[this.props.instanceId];

        //Real width can be different to canvas width - hitboxes could run out of space
        let realXScale = 1;
        let realWidth = vizualizer.getCanvas().offsetWidth.valueOf();
        if (realWidth != 0) {
            realXScale = 1 / (vizualizer.getCanvas().width / realWidth);
        }

        let realYScale = 1;
        let realHeight = vizualizer.getCanvas().offsetHeight.valueOf();
        if (realHeight != 0) {
            realYScale = 1 / (vizualizer.getCanvas().height / realHeight);
        }

        return {
            sx: (bounds.x + x * scale.xScale) * realXScale,
            sy: (bounds.y + y * scale.yScale) * realYScale,
            dx: (bounds.x + (x + width) * scale.xScale) * realXScale,
            dy: (bounds.y + (y + height) * scale.yScale) * realYScale
        };

    }

    private makeCoordinateString(x: number, y: number, width: number, height: number, scale: TunnelScale, bounds: Bounds): string {
        let coordinates = this.transformCoordinates(x, y, width, height, scale, bounds);
        return String(coordinates.sx) + ','
            + String(coordinates.sy) + ','
            + String(coordinates.dx) + ','
            + String(coordinates.dy);
    }

    private generatePhysicalHitboxesCoords(): { layerIdx: number, coords: string }[] {
        let vizualizer = Vizualizer.ACTIVE_INSTANCES[this.props.instanceId];
        let data = this.props.data;

        //Data was not prepared yet
        if (vizualizer.isDataDirty()) {
            vizualizer.prepareData();
        }

        let hitboxes = vizualizer.getHitboxes();
        let tunnels = vizualizer.getTunnels();

        if (tunnels === null
            || hitboxes === null
            || (hitboxes.defaultTunnel === null && hitboxes.customizable === null)) {
            return [];
        }

        let defaultTunnel = tunnels.default;
        let customizableTunnel = tunnels.customizable;

        let dTproperties = null;
        let dTbounds = null;
        if (defaultTunnel !== null) {
            dTproperties = this.getTunnelScale(defaultTunnel.tunnel);
            dTbounds = defaultTunnel.bounds;
        }
        let cTproperties = null;
        let cTbounds = null;
        if (customizableTunnel !== null) {
            cTproperties = this.getTunnelScale(customizableTunnel.tunnel);
            cTbounds = customizableTunnel.bounds;
        }

        let rv = [];
        for (let i = 0; i < data.length; i++) {
            if (hitboxes.defaultTunnel !== null && dTproperties !== null && dTbounds !== null) {
                let hitbox = hitboxes.defaultTunnel[i];
                rv.push({
                    layerIdx: i,
                    coords: this.makeCoordinateString(hitbox.x, hitbox.y, hitbox.width, hitbox.height, dTproperties, dTbounds)
                });
            }
            if (hitboxes.customizable !== null && cTproperties !== null && cTbounds !== null) {
                let hitbox = hitboxes.customizable[i];
                rv.push({
                    layerIdx: i,
                    coords: this.makeCoordinateString(hitbox.x, hitbox.y, hitbox.width, hitbox.height, cTproperties, cTbounds)
                });
            }
        }

        return rv;
    }

    private handleMouseDown(e: React.MouseEvent<HTMLAreaElement>) {

        if (this.state.touchMode) {
            e.preventDefault();
            return false;
        }

        let targetElement = (e.target as HTMLElement);
        let layerIdx = Number(targetElement.getAttribute("data-layeridx")).valueOf();
        let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
        let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

        let s = this.state;
        if (this.props.app.state.layerIds.length === 1
            && this.props.app.state.layerIds[0] === layerIdx
            && this.props.app.state.isLayerSelected
        ) {
            s.mouseControlStartLayerId = -1;
            this.displayLayerResidues3DEventHandler([], instance);
        }
        else {
            s.mouseControlStartLayerId = layerIdx;
            s.selectionMode = true;
            this.displayLayerResidues3DEventHandler([s.mouseControlStartLayerId], instance);
        }

        this.setState(s);

        // Disable drag and drop
        e.preventDefault();
        return false;
    }

    private enableTouchMode() {
        let s = this.state;
        s.touchMode = true;
        this.setState(s);
    }

    private handleTouchStart(e: React.TouchEvent<HTMLAreaElement>) {
        /*
        let targetElement = (e.target as HTMLElement);
        if(!targetElement.hasAttribute("data-layeridx")){
            return;
        }

        let layerIdx = Number(targetElement.getAttribute("data-layeridx")).valueOf();
        let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
        let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

        let selectedLayers = instance.getSelectedLayer();
        if(selectedLayers.length > 0){
            this.displayLayerResidues3DEventHandler([], instance);
        }   
        */
    }

    private handleMove(startLayerIdx: number, endLayerIdx: number, instance: Vizualizer) {
        if (startLayerIdx > endLayerIdx) {
            let v = startLayerIdx;
            startLayerIdx = endLayerIdx;
            endLayerIdx = v;
        }

        let selectedLayers = instance.getSelectedLayer().slice();

        selectedLayers = selectedLayers.sort();

        if (selectedLayers[0] !== startLayerIdx || selectedLayers[selectedLayers.length - 1] !== endLayerIdx) {
            let layerIds = [];
            for (let lidx = startLayerIdx; lidx <= endLayerIdx; lidx++) {
                layerIds.push(lidx);
            }

            instance.selectLayers(layerIds);
        }
    }

    private handleTouchMove(e: React.TouchEvent<HTMLAreaElement>) {
        let startElement = e.target as HTMLElement;
        if (!startElement.hasAttribute("data-layeridx")) {
            return;
        }
        let endElement = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY) as HTMLElement;
        if (!endElement.hasAttribute("data-layeridx")) {
            return;
        }

        let startLayerIdx = Number(startElement.getAttribute("data-layeridx")).valueOf();
        let endLayerIdx = Number(endElement.getAttribute("data-layeridx")).valueOf();

        let instanceIdx = Number(startElement.getAttribute("data-instanceidx")).valueOf();
        let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

        this.handleMove(startLayerIdx, endLayerIdx, instance);
    }

    private handleMouseMove(e: React.MouseEvent<HTMLAreaElement>) {
        if (this.state.mouseControlStartLayerId === -1 || !this.state.selectionMode) {
            return;
        }

        let startLayerIdx = this.state.mouseControlStartLayerId;

        let targetElement = e.currentTarget;
        if (!targetElement.hasAttribute("data-layeridx")) {
            return;
        }

        let endLayerIdx = Number(targetElement.getAttribute("data-layeridx")).valueOf();
        let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
        let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

        this.handleMove(startLayerIdx, endLayerIdx, instance);
    }

    private handleEnd(startLayerIdx: number, endLayerIdx: number, instance: Vizualizer) {
        if (startLayerIdx > endLayerIdx) {
            let v = startLayerIdx;
            startLayerIdx = endLayerIdx;
            endLayerIdx = v;
        }

        let selectedLayers = instance.getSelectedLayer().slice();
        selectedLayers = selectedLayers.sort();

        if (selectedLayers[0] !== startLayerIdx || selectedLayers[selectedLayers.length - 1] !== endLayerIdx) {

            for (let lidx = startLayerIdx; lidx <= endLayerIdx; lidx++) {
                if (lidx in selectedLayers) {
                    continue;
                }
                selectedLayers.push(lidx);
            }

            this.displayLayerResidues3DEventHandler(selectedLayers, instance);
        }
    }

    private handleTouchEnd(e: React.TouchEvent<HTMLAreaElement>) {
        let startElement = e.target as HTMLElement;
        let endElement = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY) as HTMLElement;

        let startLayerIdx = Number(startElement.getAttribute("data-layeridx")).valueOf();
        let endLayerIdx = Number(endElement.getAttribute("data-layeridx")).valueOf();

        let instanceIdx = Number(startElement.getAttribute("data-instanceidx")).valueOf();
        let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

        let selectedLayers = instance.getSelectedLayer().slice();
        if (startLayerIdx === endLayerIdx && selectedLayers.length === 1 && selectedLayers[0] === startLayerIdx) {
            this.displayLayerResidues3DEventHandler([], instance);
            return;
        }

        if (startLayerIdx === endLayerIdx) {
            this.displayLayerResidues3DEventHandler([startLayerIdx], instance);
            return;
        }

        this.handleEnd(startLayerIdx, endLayerIdx, instance);
    }

    private handleMouseUp(e: React.MouseEvent<HTMLAreaElement>) {

        let endElement = e.currentTarget;

        if (this.state.mouseControlStartLayerId === -1 || !this.state.selectionMode) {
            return;
        }

        let startLayerIdx = this.state.mouseControlStartLayerId;
        let endLayerIdx = Number(endElement.getAttribute("data-layeridx")).valueOf();

        let instanceIdx = Number(endElement.getAttribute("data-instanceidx")).valueOf();
        let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

        this.handleEnd(startLayerIdx, endLayerIdx, instance);

        let s = this.state;
        s.mouseControlStartLayerId = -1;
        s.selectionMode = false;
        this.setState(s);
    }

    private isAboveArea(x: number, y: number) {
        let elementFromPoint = document.elementFromPoint(x, y);

        if (elementFromPoint === null) {
            return false;
        }

        if (elementFromPoint.tagName === null) {
            return false;
        }

        return elementFromPoint.tagName.toLowerCase() === "area"
            || elementFromPoint.tagName.toLowerCase() === "map";
    }

    private handleMouseOut(e: React.MouseEvent<HTMLMapElement>) {
        let s = this.state;

        if (
            !s.selectionMode
            || e.currentTarget.hasAttribute("data-layeridx")
            || (e.relatedTarget as HTMLElement).tagName === null
            || (e.relatedTarget as HTMLElement).tagName.toLowerCase() === "area"
            || this.isAboveArea(e.clientX, e.clientY)
        ) {
            return;
        }

        s.mouseControlStartLayerId = -1;
        s.selectionMode = false;
        this.setState(s);

        //There is always one instance at most in this application
        let instance = Vizualizer.ACTIVE_INSTANCES[Vizualizer.ACTIVE_INSTANCES.length - 1];
        this.displayLayerResidues3DEventHandler([], instance);
    }

    render() {
        let areas = [];
        if (this.props.isDOMReady) {
            let hitboxesCoords = this.generatePhysicalHitboxesCoords();
            for (let i = 0; i < hitboxesCoords.length; i++) {
                areas.push(<area shape="rect"
                    coords={hitboxesCoords[i].coords.valueOf()}
                    data-layeridx={String(hitboxesCoords[i].layerIdx.valueOf())}
                    data-instanceidx={String(this.props.instanceId)}
                    onMouseOver={this.displayDetailsEventHandler.bind(this)}
                    onMouseDown={this.handleMouseDown.bind(this)}
                // onMouseMove={this.handleMouseMove.bind(this)}
                // onMouseUp={this.handleMouseUp.bind(this)}
                />);
            }
        }

        return (
            <map name={`layersInteractiveMap${this.props.instanceId}`}
                id={`layer-vizualizer-hitbox-map${this.props.instanceId}`}
            // onTouchStart={this.handleTouchStart.bind(this)}
            // onTouchMove={this.handleTouchMove.bind(this)}
            // onTouchEnd={this.handleTouchEnd.bind(this)}
            // onMouseOut={this.handleMouseOut.bind(this)}
            >
                {areas}
            </map>
        );
    }
}
