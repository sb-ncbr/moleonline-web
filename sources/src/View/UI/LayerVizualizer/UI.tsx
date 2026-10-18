import React from "react";
import { ColorBoundsMode, RadiusProperty, Vizualizer } from "../../LayerVizualizer/Vizualizer";
import { convertLayersToLayerData, LayerData, TunnelMetaInfo, Tunnel as DataTunnel } from "../../../DataInterface";
import { SelectionHelper } from "../../CommonUtils/Selection";
import { activateTab, doAfterTabActivated } from "../../CommonUtils/Tabs";
import { Bundle, TooltipText } from "../../../StaticData";
import { triggerDownload } from "../../CommonUtils/Misc";
import { Tunnel } from "../../LayerVizualizer/Backend";
import { QueryParam } from "../../VizualizerMol/helpers";
import { Context } from "../../Context";
import { LayerColors } from "../../CommonUtils/LayerColors";
import { showChannelPropertyColorVisuals, showChannelVisuals } from "../../State";
import { ColorBound, Property } from "../../VizualizerMol/color-tunnels/property-color";
import { ShapeGroup } from "molstar/lib/mol-model/shape";
import { OrderedSet } from 'molstar/lib/mol-data/int'
import { EmptyLoci, Loci } from "molstar/lib/mol-model/loci";
import { MarkerAction } from "molstar/lib/mol-util/marker-action";
import { Representation } from "molstar/lib/mol-repr/representation";

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


type TunnelWithMetaData = DataTunnel & TunnelMetaInfo;

export class LayerVizualizer extends React.Component<{ vizualizer: Vizualizer }, State> {

    state: State = {
        instanceId: -1,
        hasData: false,
        data: [] as LayerData[],
        layerIds: [0],
        coloringPropertyKey: "",
        customColoringPropertyKey: "",
        radiusPropertyKey: "MinRadius" as RadiusProperty,
        customRadiusPropertyKey: "MinRadius" as RadiusProperty,
        colorBoundsMode: "Absolute" as ColorBoundsMode,
        isDOMReady: false,
        app: this,
        isLayerSelected: false,
        channel: undefined
    };

    componentDidMount() {
        let vizualizer = this.props.vizualizer;

        vizualizer.setColorBoundsMode(this.state.colorBoundsMode);

        this.setState({
            instanceId: vizualizer.getPublicInstanceIdx(),
            customColoringPropertyKey: vizualizer.getCustomColoringPropertyKey(),
            coloringPropertyKey: vizualizer.getColoringPropertyKey(),
            customRadiusPropertyKey: vizualizer.getCustomRadiusPropertyKey(),
            radiusPropertyKey: vizualizer.getRadiusPropertyKey(),
        });

        SelectionHelper.attachOnChannelSelectHandler((data) => {
            window.setTimeout(() => {
                this.setState({ isLayerSelected: false });
                activateTab("left-tabs", "1");
                let layers = convertLayersToLayerData(data);
                doAfterTabActivated("left-tabs", "1", () => {
                    vizualizer.setData(layers);
                    this.setState({ data: layers, hasData: true, isDOMReady: false, instanceId: vizualizer.getPublicInstanceIdx() }, () => { // had to use callBack since the state has to be set and component has to render the 'PaintingArea' before ''vizualizer.rebindDOMRefs'
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
                        this.setState({
                            data: layers,
                            hasData: true,
                            isDOMReady: true,
                            instanceId: vizualizer.getPublicInstanceIdx(),
                            coloringPropertyKey: coloringPropertyKey,
                            customColoringPropertyKey: customColoringPropertyKey,
                            radiusPropertyKey: radiusPropertyKey,
                            customRadiusPropertyKey: customRadiusPropertyKey,
                        });
                    });
                });
            }, 50);
        });
        SelectionHelper.attachOnChannelSelectHandler2((channel) => {
            window.setTimeout(() => {
                doAfterTabActivated("left-tabs", "1", () => {
                    this.setState({ channel: channel });
                });
            }, 50);
        })
        SelectionHelper.attachOnChannelDeselectHandler(() => {
            this.setState({ data: [], hasData: false, isDOMReady: false, isLayerSelected: false });
            setTimeout(function () {
                $(window).trigger('contentResize');
            }, 1);
        });

        LayerColors.attachLayerIndexOverObject((layerIndex, tunnelId) => {
            if (SelectionHelper.getSelectedChannelId() !== tunnelId) return;
            this.props.vizualizer.highlightHitbox(layerIndex);
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
            this.props.vizualizer.selectLayers(layerIdxs);
            for (let layerIdx of layerIdxs) {
                $(window).trigger('layerTriggered', layerIdx);
            }
            if (layerIdxs.length > 0) {
                await showLayerResidues3DAndFocus(layerIdxs, this.state.data);
                const context = Context.getInstance();
                context.visual.setColor({ select: { r: 255, g: 0, b: 255 } });
                context.plugin.canvas3d?.mark(loci, MarkerAction.Select);
                context.visual.resetSelectColor();
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

        $(window).on("lvContentResize", (() => {
            this.forceUpdate();
        }).bind(this));
        $(window).on("resize", (() => {
            this.forceUpdate();
        }).bind(this));
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
    coloringPropertyKey: string,
    customColoringPropertyKey: string,
    radiusPropertyKey: RadiusProperty,
    customRadiusPropertyKey: RadiusProperty,
    colorBoundsMode: ColorBoundsMode
    isDOMReady: boolean,
    app: LayerVizualizer,
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
    private changeColoringProperty() {
        const instance = Vizualizer.ACTIVE_INSTANCES[this.props.instanceId];
        const propertyName = this.props.propertyName;
        if (this.props.isCustom) {
            instance.setCustomColoringPropertyKey(propertyName);
            instance.vizualize();
            this.props.app.setState({ customColoringPropertyKey: propertyName });
        }
        else {
            instance.setColoringPropertyKey(propertyName);
            instance.vizualize();
            this.props.app.setState({ coloringPropertyKey: propertyName });
            instance.renderOffCanvas();
            const p = LayerColors.toProperty(propertyName);
            if (p) {
                LayerColors.invokeOnColorPropertyChagned(p);
            }
        }
    }

    render() {
        return (
            <li><a data-toggle="tooltip" data-placement="right" title={TooltipText.get(this.props.propertyName)} onClick={() => this.changeColoringProperty()} className="init-lvz-tooltip lvz-properties dropdown-item">{Bundle.get(this.props.propertyName)}</a></li>
        );
    }
}

class RadiusMenuItem extends React.Component<State & { propertyName: RadiusProperty, isCustom: boolean }, {}> {
    private changeRadiusProperty() {
        const instance = Vizualizer.ACTIVE_INSTANCES[this.props.instanceId];
        const propertyName = this.props.propertyName;
        if (this.props.isCustom) {
            instance.setCustomRadiusPropertyKey(propertyName);
            instance.vizualize();
            this.props.app.setState({ customRadiusPropertyKey: propertyName });
        }
        else {
            instance.setRadiusPropertyKey(propertyName);
            instance.vizualize();
            this.props.app.setState({ radiusPropertyKey: propertyName });
        }
    }

    render() {
        return (
            <li><a data-toggle="tooltip" data-placement="right" title={TooltipText.get(this.props.propertyName)} onClick={() => this.changeRadiusProperty()} className="init-lvz-tooltip lvz-radius dropdown-item">{Bundle.get(this.props.propertyName)}</a></li>
        );
    }
}

class ColorBoundsMenuItem extends React.Component<State & { mode: ColorBoundsMode }, {}> {
    private changeColorBoundsMode() {
        const instance = Vizualizer.ACTIVE_INSTANCES[this.props.instanceId];
        const mode = this.props.mode;
        instance.setColorBoundsMode(mode);
        LayerColors.invokeOnColorBoundsChanged(mode === 'Absolute' ? 'absolute' : 'minmax');
        instance.vizualize();
        instance.renderOffCanvas();
        this.props.app.setState({ colorBoundsMode: mode });
    }

    render() {
        return (
            <li><a className="dropdown-item" data-mode={this.props.mode} onClick={() => this.changeColorBoundsMode()}>{this.props.mode}</a></li>
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
                {!this.props.isCustom ? <div className='color-controls'>
                    <div className="controls block-like">
                        <CommonButtonArea {...this.props} />
                    </div>
                    <PropertyColorTunnel state={this.props} />
                </div> : <></>}
            </div>
        );
    }
}

class ColorBySwitch extends React.Component<{ state: State, coloringProperty: string, isCustom: boolean }, {}> {
    private generateColorMenu() {

        let rv = [];
        let index = 0;
        for (let prop in this.props.state.data[0].Properties) {
            rv.push(
                <ColorMenuItem key={index} propertyName={prop} isCustom={this.props.isCustom} {...this.props.state} />
            );
            index++;
        }

        if (this.props.state.channel && this.props.state.channel.__channelsDB === undefined) {
            rv.push(
                <ColorMenuItem key={'b-radius'} propertyName={'BRadius'} isCustom={this.props.isCustom} {...this.props.state} />
            );
        }

        return <BootstrapDropUpMenuButton items={rv} label={Bundle.get(this.props.coloringProperty)} />
    }

    render() {
        let items = this.generateColorMenu();
        return (
            <span className="block-like">
                <span className="control-label">Colour by:</span> {items}
            </span>
        );
    }
}

class RadiusSwitch extends React.Component<{ state: State, radiusProperty: RadiusProperty, isCustom: boolean }, {}> {
    private generateRadiusSwitch() {
        let properties: RadiusProperty[] = ["MinRadius", "MinFreeRadius"];
        let rv = [];
        for (let [index, prop] of properties.entries()) {
            rv.push(
                <RadiusMenuItem key={index} propertyName={prop} isCustom={this.props.isCustom} {...this.props.state} />
            );
        }

        if (this.props.state.channel && this.props.state.channel.__channelsDB === undefined) {
            rv.push(
                <RadiusMenuItem key={'min-b-radius'} propertyName={"MinBRadius"} isCustom={this.props.isCustom} {...this.props.state} />
            );
        }

        return <BootstrapDropUpMenuButton items={rv} label={Bundle.get(this.props.radiusProperty)} />
    }

    render() {
        let items = this.generateRadiusSwitch();
        return (
            <span className="block-like">
                <span className="control-label">Channel radius:</span> {items}
            </span>
        );
    }
}

class PropertyColorTunnel extends React.Component<{ state: State }, { property: Property, colorBounds: ColorBound, context: Context, checked: boolean, disabled: boolean, isProcessing: boolean }> {

    state = {
        property: 'hydropathy' as Property,
        colorBounds: 'absolute' as ColorBound,
        context: Context.getInstance(),
        checked: false,
        disabled: false,
        isProcessing: false,
    }

    private currentTaskId: number = 0;

    async toggle(checked: boolean) {
        if (this.props.state.channel) {
            const channel = this.props.state.channel;
            channel.__isBusy = true;
            this.setState({ isProcessing: true });
            const taskId = ++this.currentTaskId;
            if (checked) {
                this.forceUpdate(() => {
                    showChannelPropertyColorVisuals(channel, { property: this.state.property, colorBounds: this.state.colorBounds }, true).then(() => {
                        if (taskId !== this.currentTaskId) {
                            console.log("Old task ignored.");
                            return;
                        }
                        this.setState({ isProcessing: false });
                        this.forceUpdate();
                    }).catch(() => {this.setState({ isProcessing: false }); this.forceUpdate()});
                })
            } else {
                showChannelVisuals([channel], true, true).then(() => {
                    this.state.context.plugin.managers.interactivity.lociSelects.selectOnly({ loci: channel.__loci });
                    this.setState({ isProcessing: false }); 
                    this.forceUpdate();
                }).catch(() => {this.setState({ isProcessing: false }); this.forceUpdate()});
                // })
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

    onChannelSelect = (channel: TunnelWithMetaData) => {
        this.setState({
            checked: channel.__layerColored,
            disabled: false
        });
    };

    onChannelRemoved = (ref: any) => {
        const channel = this.props.state.channel;
        if (!channel || channel.__ref === ref) {
            this.setState({ checked: false, disabled: true });
        } else {
            this.setState({ checked: false });
        }
    };

    onChannelAdd = (ref: any) => {
        const channel = this.props.state.channel;
        if (channel && channel.__ref === ref) {
            this.setState({ disabled: false });
        }
    };

    onColorPropertyChanged = (property: any) => {
        this.setState({ property });
        if (this.state.checked) this.toggle(true);
    };

    onColorBoundsChanged = (colorBounds: any) => {
        this.setState({ colorBounds });
        if (this.state.checked) this.toggle(true);
    };

    onLayerIndexOver = (layerIndex: number) => {
        const channel = this.props.state.channel;
        if (!channel) return;

        const loci = layerIndex >= 0
            ? this.getLoci(channel, layerIndex)
            : EmptyLoci;

        this.state.context.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci });
    };

    onLayerIndexSelect = (layerIndex: number) => {
        const channel = this.props.state.channel;
        if (!channel || layerIndex < 0) return;

        const loci = this.getLoci(channel, layerIndex);
        const context = Context.getInstance();

        context.visual.setColor({ select: { r: 255, g: 0, b: 255 } });
        context.plugin.canvas3d?.mark({ loci } as Representation.Loci<Loci>, MarkerAction.Select);
        context.visual.resetSelectColor();
    };

    private unsubscribe: (() => void)[] = [];

    componentDidMount() {
        this.unsubscribe.push(
            SelectionHelper.attachOnChannelSelectHandler2(this.onChannelSelect.bind(this)),
            LayerColors.attachOnChannelRemoved(this.onChannelRemoved.bind(this)),
            LayerColors.attachOnChannelAdd(this.onChannelAdd.bind(this)),
            LayerColors.attachOnColorPropertyChagned(this.onColorPropertyChanged.bind(this)),
            LayerColors.attachOnColorBoundsChanged(this.onColorBoundsChanged.bind(this)),
            LayerColors.attachLayerIndexOver(this.onLayerIndexOver.bind(this)),
            LayerColors.attachLayerIndexSelect(this.onLayerIndexSelect.bind(this)),
        );
    }

    componentWillUnmount() {
        this.unsubscribe.forEach(u => u());
        this.unsubscribe = [];
    }

    render() {
        return (
            <span className="block-like">
                <span id="color-tunnel-span" className="control-label">Colour the channel in Mol*: </span>
                {this.state.isProcessing
                    ? <span
                        id="colored-tunnel-loader"
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    : <input type='checkbox'
                        checked={this.state.checked}
                        onChange={() => {
                            if (this.props.state.channel) {
                                this.toggle(!this.state.checked);
                                this.setState({ checked: !this.state.checked });
                            }
                        }}
                        disabled={this.state.disabled}
                    />}
            </span>
        )
    }
}

class CommonButtonArea extends React.Component<State, {}> {
    private generateColorBoundsSwitch() {
        let properties: ColorBoundsMode[] = ["Min/max", "Absolute"];
        let rv = [];
        for (let [index, prop] of properties.entries()) {
            rv.push(
                <ColorBoundsMenuItem key={index} mode={prop} {...this.props} />
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

    private export(e: React.MouseEvent<HTMLElement>) {
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
        for (let [index, type] of supportedExportTypes.entries()) {
            rv.push(
                <ExportTypeButton key={index} instanceId={this.props.instanceId} exportType={type} />
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
                <span className="control-label" title="Colour bounds for both halfs of vizualized channel.">
                    Colour bounds:
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

// A tap also sends mouse events, so these handlers serve touch screens too
class InteractionMap extends React.Component<State> {

    private displayDetailsEventHandler(e: React.MouseEvent<HTMLAreaElement>) {
        let targetElement = (e.target as HTMLElement);
        let layerIdx = Number(targetElement.getAttribute("data-layeridx")).valueOf();
        let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
        let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

        instance.highlightHitbox(layerIdx);
        LayerColors.invokeLayerIndexOver(layerIdx);
        if (!this.props.app.state.isLayerSelected) {
            this.props.app.setState({ layerIds: [layerIdx] });
            $(window).trigger('layerTriggered', layerIdx);
        }
    }

    private async displayLayerResidues3DEventHandler(layerIdxs: number[], instance: Vizualizer) {
        LayerColors.setSelectChannelLiningResidues(true);
        this.props.app.setState({ layerIds: layerIdxs, isLayerSelected: layerIdxs.length > 0 });

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
        let targetElement = (e.target as HTMLElement);
        let layerIdx = Number(targetElement.getAttribute("data-layeridx")).valueOf();
        let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
        let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

        if (this.props.app.state.layerIds.length === 1
            && this.props.app.state.layerIds[0] === layerIdx
            && this.props.app.state.isLayerSelected
        ) {
            this.displayLayerResidues3DEventHandler([], instance);
        }
        else {
            this.displayLayerResidues3DEventHandler([layerIdx], instance);
        }

        // Disable drag and drop
        e.preventDefault();
        return false;
    }

    render() {
        let areas = [];
        if (this.props.isDOMReady) {
            let hitboxesCoords = this.generatePhysicalHitboxesCoords();
            for (let i = 0; i < hitboxesCoords.length; i++) {
                areas.push(<area key={i} shape="rect"
                    coords={hitboxesCoords[i].coords.valueOf()}
                    data-layeridx={String(hitboxesCoords[i].layerIdx.valueOf())}
                    data-instanceidx={String(this.props.instanceId)}
                    onMouseOver={this.displayDetailsEventHandler.bind(this)}
                    onMouseDown={this.handleMouseDown.bind(this)}
                />);
            }
        }

        return (
            <map name={`layersInteractiveMap${this.props.instanceId}`}
                id={`layer-vizualizer-hitbox-map${this.props.instanceId}`}
            >
                {areas}
            </map>
        );
    }
}
