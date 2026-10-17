import { roundToDecimal } from "../../Common/Util/Numbers";
import { LayerData } from "../../DataInterface";
import { Bundle } from "../../StaticData";
import { isActive } from "../CommonUtils/Tabs";
import { ArrowHeadLine, Axis, ColorMixer, ColorPaletteFunctionSettings, ContextAwareObject, CurlyBrackets, FontSize, TextAlign, TextBox, Tunnel } from "./Backend";
import { Paintable, Axis as AxisCompnent, Positionable } from "./Components";

declare function $(p: any): any;
declare var ChannelDbPlugin: any;
declare var C2S: any;

declare var utf8: {
    encode: (a: string) => string,
    decode: (a: string) => string
};

export type DataURL = string;

type PropertyKey = "Polarity" | "Mutability" | "Hydropathy" | "Hydrophobicity" | "Charge" | "NumNegatives" | "NumPositives" | "LogP" | "LogD" | "LogS" | "Ionizable" | "BRadius"

export interface PropertiesColorCell {
    Polarity: RGBColor,
    Mutability: RGBColor,
    Hydropathy: RGBColor,
    Hydrophobicity: RGBColor,
    Charge: RGBColor,
    NumNegatives: RGBColor,
    NumPositives: RGBColor,
    LogP: RGBColor,
    LogD: RGBColor,
    LogS: RGBColor,
    Ionizable: RGBColor,
    BRadius: RGBColor
}

export interface LayersVizualizerSettings {
    coloringProperty?: String,
    useColorMinMax?: Boolean,
    skipMiddleColor?: Boolean,
    radiusProperty?: RadiusProperty,
    customRadiusProperty?: RadiusProperty
};

export interface RGBColor {
    r: number;
    g: number;
    b: number;
};

interface TunnelInfo {
    bounds: {
        x: number,
        y: number,
        width: number,
        height: number
    }
    tunnel: Tunnel
}

export type RadiusProperty = "MinRadius" | "MinFreeRadius" | "MinBRadius";
export type ColorBoundsMode = "Min/max" | "Absolute";

export class Vizualizer {
    private __canvas!: HTMLCanvasElement;
    private __context!: CanvasRenderingContext2D;

    private __tunnels: {
        default: TunnelInfo | null,
        customizable: TunnelInfo | null
    };

    private verticalAxisChunkCount: number = 4;

    private coloringPropertyKey!: string;
    private customColoringPropertyKey!: string;
    private useColorMinMax!: boolean;
    private absColorValueMax!: Map<string, number>;
    private absColorValueMin!: Map<string, number>;
    private minColoringValue!: Map<string, number>;
    private maxColoringValue!: Map<string, number>;
    private absCenterPositions!: Map<PropertyKey, number>;
    private skipMiddle!: boolean;
    private maxX!: number;
    private maxY!: number;
    private customMaxY!: number;
    private radiusPropertyKey!: RadiusProperty;
    private customRadiusPropertyKey!: RadiusProperty;

    private minColor!: PropertiesColorCell;
    private minColorMiddle!: PropertiesColorCell;
    private maxColor!: PropertiesColorCell;
    private maxColorMiddle!: PropertiesColorCell;

    private data!: LayerData[];
    private dataDirty: boolean;
    private isDOMBound: boolean;

    private publicInstanceIdx: number;
    private currentLayerIdx: number;

    private canvasId: string;
    private tmpCanvasId: string;

    private resizePercentPrecision: number;

    private selectedLayerIds: number[];

    public getPublicInstanceIdx() {
        return this.publicInstanceIdx;
    }

    public isDataDirty() {
        return this.dataDirty;
    }

    public getCanvas() {
        //DOM binding check
        if (!this.isDOMBound) {
            this.rebindDOMRefs();
        }
        return this.__canvas;
    }

    public getContext() {
        //DOM binding check
        if (!this.isDOMBound) {
            this.rebindDOMRefs();
        }
        return this.__context;
    }

    public getTunnels() {
        if (this.dataDirty) {
            return null;
        }

        return this.__tunnels;
    }

    public renderOffCanvas() {
        if (this.__tunnels.default) 
            this.__tunnels.default.tunnel.createOffscreenGradientCanvas();
        else if (this.__tunnels.customizable)
            this.__tunnels.customizable.tunnel.createOffscreenGradientCanvas();
    }   

    public static ACTIVE_INSTANCES: Vizualizer[];

    private onWindowResize(e: Event) {

        if (document.getElementById(this.canvasId) === null) {
            return;
        }

        let canvas = this.getCanvas();
        let context = this.getContext();

        if (canvas === void 0 || context === void 0 || !this.isElementVisible(canvas) || !isActive("left-tabs", "1")) {
            return;
        }

        let xUnit = canvas.width / 100;
        let yUnit = canvas.height / 100;
        let x_diff = Math.abs(canvas.width - canvas.offsetWidth) / xUnit;
        let y_diff = Math.abs(canvas.height - canvas.offsetHeight) / yUnit;

        if (x_diff < this.resizePercentPrecision
            && y_diff < this.resizePercentPrecision) {
            return;
        }

        this.resizeCanvas();

        this.vizualize();
        this.highlightHitbox(this.currentLayerIdx);
    }

    private isElementVisible(element: HTMLElement): boolean {
        if (element.style.display === "none" || element.style.visibility === "hidden") {
            return false;
        }

        if (element.parentElement === null || element.parentElement === void 0) {
            return true;
        }

        return this.isElementVisible(element.parentElement);
    }

    private onContentResize(e: Event) {
        if (document.getElementById(this.canvasId) === null) {
            return;
        }

        let canvas = this.getCanvas();
        let context = this.getContext();

        if (canvas === void 0 || context === void 0 || !this.isElementVisible(canvas) || !isActive("left-tabs", "1")) {
            return;
        }

        this.resizeCanvas();

        this.vizualize();
        this.highlightHitbox(this.currentLayerIdx);
    }

    private resizeCanvas() {
        let canvas = this.getCanvas();
        let context = this.getContext();
        if (canvas === void 0 || context === void 0) {
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        canvas.setAttribute("width", String(canvas.offsetWidth));
        canvas.setAttribute("height", String(canvas.offsetHeight));
    }

    private configBySettings(settings: LayersVizualizerSettings) {

        this.coloringPropertyKey = "Hydropathy";
        if (settings.coloringProperty != null) {
            this.coloringPropertyKey = settings.coloringProperty.valueOf();
        }
        this.customColoringPropertyKey = this.coloringPropertyKey;

        this.useColorMinMax = true;
        if (settings.useColorMinMax != null) {
            this.useColorMinMax = settings.useColorMinMax.valueOf();
        }

        // Colour scale of each property: minimum, centre and maximum
        const scales: Record<PropertyKey, [number, number, number]> = {
            Polarity: [0, 5, 52],
            Mutability: [25, 75, 117],
            Hydropathy: [-4.5, 0, 4.5],
            Hydrophobicity: [-1.14, 0, 1.81],
            Charge: [-5, 0, 5],
            NumPositives: [0, 0, 5],
            NumNegatives: [0, 0, 5],
            LogP: [-1.03, 0.78, 2.59],
            LogD: [-3, -0.205, 2.59],
            LogS: [-2.48, 0.075, 2.63],
            Ionizable: [0, 0, 5],
            BRadius: [0, 3, 6],
        };
        this.absCenterPositions = new Map<PropertyKey, number>();
        this.absColorValueMin = new Map<string, number>();
        this.absColorValueMax = new Map<string, number>();
        for (const [key, [min, center, max]] of Object.entries(scales) as [PropertyKey, [number, number, number]][]) {
            this.absColorValueMin.set(key, min);
            this.absCenterPositions.set(key, center);
            this.absColorValueMax.set(key, max);
        }

        this.radiusPropertyKey = "MinRadius";
        if (settings.radiusProperty != null) {
            this.radiusPropertyKey = settings.radiusProperty;
        }
        this.customRadiusPropertyKey = this.radiusPropertyKey;
        if (settings.customRadiusProperty != null) {
            this.customRadiusPropertyKey = settings.customRadiusProperty;
        }

        this.skipMiddle = false;
        if (settings.skipMiddleColor != null) {
            this.skipMiddle = settings.skipMiddleColor.valueOf();
        }
    }

    private configureColors() {
        let maxYellow = { r: 251, g: 255, b: 7 };
        let middleYellow = { r: 240, g: 248, b: 190 };
        let maxBlue = { r: 0, g: 0, b: 255 };
        let middleBlue = { r: 253, g: 253, b: 255 };
        let maxRed = { r: 255, g: 0, b: 0 };
        let middleRed = { r: 253, g: 253, b: 225 };
        let maxWhite = { r: 255, g: 255, b: 255 };
        let middleWhite = { r: 240, g: 240, b: 240 };
        let maxPurple = { r: 107, g: 9, b: 107 };
        let middlePurple = { r: 220, g: 188, b: 220 };
        let middleBlack = { r: 183, g: 183, b: 183 };
        let maxBlack = { r: 0, g: 0, b: 0 };

        this.minColor = {
            Hydropathy: maxBlue,
            Hydrophobicity: maxBlue,
            Mutability: maxBlue,
            Polarity: maxYellow,
            Charge: maxRed,
            NumPositives: maxWhite,
            NumNegatives: maxWhite,
            LogP: maxBlue,
            LogD: maxBlue,
            LogS: maxYellow,
            Ionizable: maxWhite,
            BRadius: maxWhite
        };

        this.minColorMiddle = {
            Hydropathy: middleBlue,
            Hydrophobicity: middleBlue,
            Mutability: middleBlue,
            Polarity: middleYellow,
            Charge: middleRed,
            NumPositives: middleWhite,
            NumNegatives: middleWhite,
            LogP: middleBlue,
            LogD: middleBlue,
            LogS: middleYellow,
            Ionizable: middleWhite,
            BRadius: middleWhite
        };

        this.maxColorMiddle = {
            Hydropathy: middleYellow,
            Hydrophobicity: middleYellow,
            Mutability: middleRed,
            Polarity: middleBlue,
            Charge: middleBlue,
            NumPositives: middleBlue,
            NumNegatives: middleRed,
            LogP: middleYellow,
            LogD: middleYellow,
            LogS: middleBlue,
            Ionizable: middlePurple,
            BRadius: middleBlack
        };

        this.maxColor = {
            Hydropathy: maxYellow,
            Hydrophobicity: maxYellow,
            Mutability: maxRed,
            Polarity: maxBlue,
            Charge: maxBlue,
            NumPositives: maxBlue,
            NumNegatives: maxRed,
            LogP: maxYellow,
            LogD: maxYellow,
            LogS: maxBlue,
            Ionizable: maxPurple,
            BRadius: maxBlack
        };
    }

    public constructor(uiContainerId: string, settings: LayersVizualizerSettings) {

        //Register instance
        if (Vizualizer.ACTIVE_INSTANCES == null) {
            Vizualizer.ACTIVE_INSTANCES = [];
        }
        this.publicInstanceIdx = Vizualizer.ACTIVE_INSTANCES.length;
        Vizualizer.ACTIVE_INSTANCES.push(this);


        this.configBySettings(settings);

        this.canvasId = "layer-vizualizer-canvas" + String(this.publicInstanceIdx);

        this.configureColors();

        this.__tunnels = {
            default: null,
            customizable: null
        }

        this.dataDirty = true;
        this.isDOMBound = false;

        this.currentLayerIdx = 0;

        this.tmpCanvasId = `tmpCanvas_${this.publicInstanceIdx}`;

        this.selectedLayerIds = [];

        //Dynamic canvas resizing
        this.resizePercentPrecision = 1; //5% difference between real and given => cause resizing of canvas
        window.addEventListener("resize", this.onWindowResize.bind(this));
        $(window).on("lvContentResize", this.onContentResize.bind(this));
    }

    public deselectLayers() {
        this.selectedLayerIds = [];

        let tunnels = this.getTunnels();
        if (tunnels === null) {
            return;
        }

        if (tunnels.default !== null) {
            tunnels.default.tunnel.selectLayers([]);
        }
        if (tunnels.customizable !== null) {
            tunnels.customizable.tunnel.selectLayers([]);
        }
    }

    public selectLayers(layerIds: number[]) {
        this.selectedLayerIds = layerIds;
        let tunnels = this.getTunnels();
        if (tunnels === null) {
            return;
        }

        if (tunnels.default !== null) {
            tunnels.default.tunnel.selectLayers(this.selectedLayerIds);
        }
        if (tunnels.customizable !== null) {
            tunnels.customizable.tunnel.selectLayers(this.selectedLayerIds);
        }
    }

    public setColorBoundsMode(mode: ColorBoundsMode) {
        this.useColorMinMax = (mode == "Min/max");
        //TODO invoke
    }

    public rebindDOMRefs() {
        let cnvs = document.getElementById(this.canvasId);
        if (cnvs == null) {
            throw new Error("Canvas element with id " + String(this.canvasId) + " not found");
        }
        this.__canvas = cnvs as HTMLCanvasElement;

        let cntx = this.__canvas.getContext("2d", { willReadFrequently: true });
        if (cntx == null) {
            throw new Error("Cannot obtain 2D canvas context");
        }
        this.__context = cntx;


        this.isDOMBound = true;

        this.resizeCanvas();
    }

    /** Datasource change **/

    public setData(layersData: LayerData[]) {
        this.currentLayerIdx = -1;
        this.selectedLayerIds = [];
        this.data = layersData;
        this.dataDirty = true;
    }

    public prepareData() {
        if (this.data.length == 0) {
            console.log("ERR: no data supplied!");
            return;
        }

        this.maxX = this.data[this.data.length - 1].EndDistance;
        this.maxY = this.data[0][this.radiusPropertyKey];
        this.customMaxY = this.data[0][this.customRadiusPropertyKey];

        let val = this.getLayerPropertyValue(this.coloringPropertyKey, 0);
        if (val == null) {
            throw new Error("Cannot init LayerVizualizer due to invalid settings - coloringProperty: "
                + String(this.coloringPropertyKey));
        }

        this.minColoringValue = new Map<string, number>();
        this.maxColoringValue = new Map<string, number>();
        let keys: string[] = [];
        keys.push("BRadius");

        for (let key in this.data[0].Properties) {
            keys.push(key);
            this.minColoringValue.set(key, this.data[0].Properties[key]);
            this.maxColoringValue.set(key, this.data[0].Properties[key]);
        }

        this.minColoringValue.set('BRadius', this.data[0].MinBRadius);
        this.maxColoringValue.set('BRadius', this.data[0].MinBRadius);

        for (let i = 0; i < this.data.length; i++) {
            this.maxY = Math.max(this.maxY, this.data[i][this.radiusPropertyKey]);
            this.customMaxY = Math.max(this.customMaxY, this.data[i][this.customRadiusPropertyKey]);

            for (let key of keys) {
                let curVal = this.getLayerPropertyValue(key, i);
                if (curVal === void 0) {
                    throw new Error("Corrupted data!");
                }

                let oldMinVal = this.minColoringValue.get(key);
                if (oldMinVal === void 0 || curVal.valueOf() < oldMinVal.valueOf()) {
                    this.minColoringValue.set(key, curVal.valueOf());
                }
                let oldMaxVal = this.maxColoringValue.get(key);
                if (oldMaxVal === void 0 || curVal.valueOf() > oldMaxVal.valueOf()) {
                    this.maxColoringValue.set(key, curVal.valueOf());
                }
            }
        }

        this.dataDirty = false;

        this.currentLayerIdx = 0;
    }

    /** Layer vizualization **/

    private getComponentsPositioning() {
        let canvas = this.getCanvas();
        if (canvas === null || canvas === void 0) {
            throw new Error("Canvas element is not bound!");
        }

        let currentWidth = canvas.width;
        let currentHeight = canvas.height;
        let colorMixerMinPxWidth = 150;

        let toRealPx = function (width: number, height: number, component: Positionable) {
            return component.toBounds(width, height);
        };

        let toPercent = function (width: number, height: number, realX: number, realY: number) {
            return {
                x: (realX / width) * 100,
                y: (realY / height) * 100
            }
        }

        let positioning = {
            defaultTunnel: new Paintable(),
            customizableTunnel: new Paintable(),
            horizontalAxis: new AxisCompnent(),
            verticalAxis_1: new AxisCompnent(),
            verticalAxis_2: new AxisCompnent(),
            defaultColorMixer: new Paintable(),
            defaultColorMixerHorizontal: new Paintable(),
            customizableColorMixerHorizontal: new Paintable(),
            vAxis1TopLabel: new Positionable(),
            vAxis2BottomLabel: new Positionable(),
            axisLeftZeroLabel: new Positionable(),
            horizontalAxisRightLabel: new Positionable(),
            dColorMixerLeftLabel: new Positionable(),
            dColorMixerRightLabel: new Positionable(),
            cColorMixerLeftLabel: new Positionable(),
            cColorMixerRightLabel: new Positionable(),
            defaultCurlyBrackets: new Positionable(),
            customizableCurlyBrackets: new Positionable(),
            customizableCurlyBracketsLabel: new Positionable(),
            defaultCurlyBracketsLabel: new Positionable(),
            defaultArrowheadLine: new Positionable(),
            customizableArrowheadLine: new Positionable(),
            defaultArrowheadLineLabel: new Positionable(),
            customizableArrowheadLineLabel: new Positionable(),
            defaultColorMixerLabel: new Positionable(),
            customizableColorMixerLabel: new Positionable()
        };

        let dtHeight = 30; //35
        let dtTop = 13;
        let dtmTop = 0;
        let haTop = dtTop + dtmTop + dtHeight;
        let haHeight = 10;
        let smallLabelHeight = haHeight / 2;
        let dtWidth = 80;

        //Default tunnel
        {
            positioning.defaultTunnel.left = 8; //14
            positioning.defaultTunnel.top = dtTop;
            positioning.defaultTunnel.marginTop = dtmTop;
            positioning.defaultTunnel.marginLeft = 0;
            positioning.defaultTunnel.marginRight = 0;
            positioning.defaultTunnel.width = dtWidth;
            positioning.defaultTunnel.height = dtHeight; //38
        }
        //Customizable tunnel
        {
            positioning.customizableTunnel.left = positioning.defaultTunnel.left;
            positioning.customizableTunnel.marginTop = 2;
            positioning.customizableTunnel.marginLeft = 0;
            positioning.customizableTunnel.marginRight = 0;
            positioning.customizableTunnel.width = dtWidth;
            positioning.customizableTunnel.height = dtHeight;
            positioning.customizableTunnel.top = haTop + haHeight;
        }
        //Default Color Mixer
        {
            positioning.defaultColorMixer.left = positioning.defaultTunnel.left
                + positioning.defaultTunnel.marginLeft
                + positioning.defaultTunnel.width;
            positioning.defaultColorMixer.marginTop = 5;
            positioning.defaultColorMixer.marginLeft = 1;
            positioning.defaultColorMixer.width = 4;
            positioning.defaultColorMixer.height = positioning.defaultTunnel.height;
            positioning.defaultColorMixer.top = 0;
        }
        let cmhWidth = 100 - (positioning.defaultColorMixer.left);
        let cmhHeight = 4;
        //Default Color Mixer -- Horizontal
        {
            positioning.defaultColorMixerHorizontal.left = positioning.defaultTunnel.left
                + positioning.customizableTunnel.width
                - (cmhWidth);
            positioning.defaultColorMixerHorizontal.marginBottom = 1;
            positioning.defaultColorMixerHorizontal.width =
                cmhWidth;
            positioning.defaultColorMixerHorizontal.top =
                positioning.defaultTunnel.top
                + positioning.defaultTunnel.marginTop
                - (cmhHeight + 1/*(1=>margin-bottom)*/);
            positioning.defaultColorMixerHorizontal.height = cmhHeight;
        }
        //Customizable Color Mixer -- Horizontal
        {
            positioning.customizableColorMixerHorizontal.left = positioning.customizableTunnel.left
                + positioning.customizableTunnel.width
                - (cmhWidth);
            positioning.customizableColorMixerHorizontal.marginTop = 1;
            positioning.customizableColorMixerHorizontal.marginBottom = 5;
            positioning.customizableColorMixerHorizontal.width =
                cmhWidth;
            positioning.customizableColorMixerHorizontal.top =
                positioning.customizableTunnel.top
                + positioning.customizableTunnel.marginTop
                + positioning.customizableTunnel.height;
            positioning.customizableColorMixerHorizontal.height = cmhHeight;
        }

        let colorMixerTooThin = (toRealPx(currentWidth, currentHeight, positioning.defaultColorMixerHorizontal).width < colorMixerMinPxWidth)

        if (colorMixerTooThin) {
            let width = toPercent(currentWidth, currentHeight, colorMixerMinPxWidth, 0).x;
            let x = positioning.defaultColorMixerHorizontal.left + (positioning.defaultColorMixerHorizontal.width - width);
            let colorMixerComponents = [
                positioning.defaultColorMixerHorizontal,
                positioning.customizableColorMixerHorizontal
            ];
            for (let component of colorMixerComponents) {
                component.left = x;
                component.width = width;
            }
        }

        //Horizontal Axis
        {
            positioning.horizontalAxis.left = positioning.defaultTunnel.left + positioning.defaultTunnel.marginLeft;
            positioning.horizontalAxis.top = haTop;
            positioning.horizontalAxis.marginLeft = 0;
            positioning.horizontalAxis.marginTop = 1;
            positioning.horizontalAxis.width = positioning.defaultTunnel.width;
            positioning.horizontalAxis.height = haHeight;
        }
        //Vertical Axis 1
        {
            positioning.verticalAxis_1.left = 0;
            positioning.verticalAxis_1.top = dtTop + dtmTop;
            positioning.verticalAxis_1.marginLeft = 4; //10
            positioning.verticalAxis_1.marginRight = 0;
            positioning.verticalAxis_1.width = 3;
            positioning.verticalAxis_1.height = positioning.defaultTunnel.height;
        }
        //Vertical Axis 2
        {
            positioning.verticalAxis_2.left = 0;
            positioning.verticalAxis_2.top = positioning.customizableTunnel.top + positioning.customizableTunnel.marginTop;
            positioning.verticalAxis_2.marginLeft = positioning.verticalAxis_1.marginLeft;
            positioning.verticalAxis_2.marginRight = 0;
            positioning.verticalAxis_2.width = 3;
            positioning.verticalAxis_2.height = positioning.verticalAxis_1.height;
        }
        let bigLabelHeight = positioning.horizontalAxis.height - (positioning.horizontalAxis.height / 8) * 2;
        //Left Common Axis Label
        {
            positioning.axisLeftZeroLabel.left = 0;
            positioning.axisLeftZeroLabel.marginLeft = 0;
            positioning.axisLeftZeroLabel.top = positioning.horizontalAxis.top
                + ((positioning.horizontalAxis.marginTop === void 0) ? 0 : positioning.horizontalAxis.marginTop);
            positioning.axisLeftZeroLabel.marginTop =
                Math.abs(bigLabelHeight - positioning.horizontalAxis.height) / 2;

            positioning.axisLeftZeroLabel.width = positioning.horizontalAxis.left - 1;
            positioning.axisLeftZeroLabel.height = bigLabelHeight;
        }
        //Right Horizontal Axis Label
        {
            positioning.horizontalAxisRightLabel.left = positioning.horizontalAxis.left + positioning.horizontalAxis.width + positioning.horizontalAxis.marginLeft;
            positioning.horizontalAxisRightLabel.marginLeft = positioning.defaultColorMixer.marginLeft;
            positioning.horizontalAxisRightLabel.top = positioning.axisLeftZeroLabel.top;
            positioning.horizontalAxisRightLabel.marginTop = positioning.axisLeftZeroLabel.marginTop;

            positioning.horizontalAxisRightLabel.width = 100 - (positioning.horizontalAxisRightLabel.left + positioning.horizontalAxisRightLabel.marginLeft);
            positioning.horizontalAxisRightLabel.height = positioning.axisLeftZeroLabel.height;
        }
        //Top Default Tunnel Vertical Axis Label
        {
            positioning.vAxis1TopLabel.left = 0;
            positioning.vAxis1TopLabel.marginLeft = 0;
            positioning.vAxis1TopLabel.top = positioning.defaultTunnel.top
                - positioning.axisLeftZeroLabel.height / 2;
            positioning.vAxis1TopLabel.marginTop = 0;

            positioning.vAxis1TopLabel.width = positioning.verticalAxis_1.marginLeft
                + ((positioning.verticalAxis_1.left === void 0) ? 0 : positioning.verticalAxis_1.left);
            positioning.vAxis1TopLabel.height = positioning.axisLeftZeroLabel.height;
        }
        //Bottom Customizable Tunnel Vertical Axis Label
        {
            positioning.vAxis2BottomLabel.left = 0;
            positioning.vAxis2BottomLabel.marginLeft = 0;
            positioning.vAxis2BottomLabel.bottom = 100
                - (positioning.customizableTunnel.top + positioning.customizableTunnel.marginTop
                    + positioning.customizableTunnel.height + positioning.axisLeftZeroLabel.height / 2);
            positioning.vAxis2BottomLabel.marginBottom = 0;

            positioning.vAxis2BottomLabel.width = positioning.verticalAxis_2.marginLeft
                + ((positioning.verticalAxis_2.left === void 0) ? 0 : positioning.verticalAxis_2.left);;
            positioning.vAxis2BottomLabel.height = positioning.axisLeftZeroLabel.height;
        }
        //Left Default Color Mixer Label
        {
            positioning.dColorMixerLeftLabel.left = positioning.defaultColorMixerHorizontal.left;
            positioning.dColorMixerLeftLabel.marginLeft = positioning.defaultColorMixerHorizontal.marginLeft;
            positioning.dColorMixerLeftLabel.top = positioning.defaultColorMixerHorizontal.top
                - (smallLabelHeight + 1.5);
            positioning.dColorMixerLeftLabel.marginTop = 0;

            positioning.dColorMixerLeftLabel.width = positioning.defaultColorMixerHorizontal.width / 2;
            positioning.dColorMixerLeftLabel.height = smallLabelHeight;
        }
        //Right Default Color Mixer Label
        {
            positioning.dColorMixerRightLabel.left = positioning.defaultColorMixerHorizontal.left
                + positioning.defaultColorMixerHorizontal.width - positioning.dColorMixerLeftLabel.width;
            positioning.dColorMixerRightLabel.marginRight = positioning.dColorMixerLeftLabel.marginLeft;
            positioning.dColorMixerRightLabel.top = positioning.dColorMixerLeftLabel.top;
            positioning.dColorMixerRightLabel.marginTop = positioning.dColorMixerLeftLabel.marginTop;

            positioning.dColorMixerRightLabel.width = positioning.dColorMixerLeftLabel.width;
            positioning.dColorMixerRightLabel.height = positioning.dColorMixerLeftLabel.height;
        }

        //Left Customizable Color Mixer Label
        {
            positioning.cColorMixerLeftLabel.left = positioning.customizableColorMixerHorizontal.left;
            positioning.cColorMixerLeftLabel.marginLeft = positioning.customizableColorMixerHorizontal.marginLeft;
            positioning.cColorMixerLeftLabel.top = positioning.customizableColorMixerHorizontal.top
                + positioning.customizableColorMixerHorizontal.height
                + positioning.customizableColorMixerHorizontal.marginTop;
            positioning.cColorMixerLeftLabel.marginTop = 2;

            positioning.cColorMixerLeftLabel.width = positioning.customizableColorMixerHorizontal.width / 2;
            positioning.cColorMixerLeftLabel.height = smallLabelHeight;
        }
        //Right Customizable Color Mixer Label
        {
            positioning.cColorMixerRightLabel.left = positioning.customizableColorMixerHorizontal.left
                + positioning.customizableColorMixerHorizontal.width - positioning.cColorMixerLeftLabel.width;
            positioning.cColorMixerRightLabel.marginRight = positioning.cColorMixerLeftLabel.marginLeft;
            positioning.cColorMixerRightLabel.top = positioning.cColorMixerLeftLabel.top;
            positioning.cColorMixerRightLabel.marginTop = positioning.cColorMixerLeftLabel.marginTop;

            positioning.cColorMixerRightLabel.width = positioning.cColorMixerLeftLabel.width;
            positioning.cColorMixerRightLabel.height = positioning.cColorMixerLeftLabel.height;
        }
        //Curly brackets for default tunnel
        {
            positioning.defaultCurlyBrackets.left = positioning.defaultTunnel.left
                + positioning.defaultTunnel.marginLeft + positioning.defaultTunnel.width;
            positioning.defaultCurlyBrackets.marginLeft = 0.3;
            positioning.defaultCurlyBrackets.top = dtTop;
            positioning.defaultCurlyBrackets.width = 1;
            positioning.defaultCurlyBrackets.height = dtHeight;
        }
        //Curly brackets for customizable tunnel
        {
            positioning.customizableCurlyBrackets.left = positioning.defaultTunnel.left
                + positioning.defaultTunnel.marginLeft + positioning.defaultTunnel.width;
            positioning.customizableCurlyBrackets.marginLeft = 0.3;
            positioning.customizableCurlyBrackets.top = haTop + haHeight
                + positioning.customizableTunnel.marginTop;
            positioning.customizableCurlyBrackets.width = 1;
            positioning.customizableCurlyBrackets.height = dtHeight;
        }
        //Curly brackets Label for default tunnel
        {
            positioning.defaultCurlyBracketsLabel.left = positioning.defaultCurlyBrackets.left
                + positioning.defaultCurlyBrackets.width
                + positioning.defaultCurlyBrackets.marginLeft;
            positioning.defaultCurlyBracketsLabel.marginLeft = 0.3;
            positioning.defaultCurlyBracketsLabel.top = positioning.defaultCurlyBrackets.top
                + positioning.defaultCurlyBrackets.height / 2 - smallLabelHeight / 2;
            positioning.defaultCurlyBracketsLabel.width = 100 - positioning.defaultCurlyBracketsLabel.left;
            positioning.defaultCurlyBracketsLabel.height = smallLabelHeight;
        }
        //Curly brackets Label for customizable tunnel
        {
            positioning.customizableCurlyBracketsLabel.left = positioning.customizableCurlyBrackets.left
                + positioning.customizableCurlyBrackets.width
                + positioning.customizableCurlyBrackets.marginLeft;
            positioning.customizableCurlyBracketsLabel.marginLeft = 0.3;
            positioning.customizableCurlyBracketsLabel.top = positioning.customizableCurlyBrackets.top
                + positioning.customizableCurlyBrackets.height / 2 - smallLabelHeight / 2;
            positioning.customizableCurlyBracketsLabel.width = 100 - positioning.customizableCurlyBracketsLabel.left;
            positioning.customizableCurlyBracketsLabel.height = smallLabelHeight
        }
        let ahLineHeight = 4;
        let ahLineVerticalMargin = 1.5;
        let ahLineWidth = dtWidth / 2;
        //Arrowhead line for default tunnel
        {
            positioning.defaultArrowheadLine.left = positioning.defaultTunnel.left
                + positioning.defaultTunnel.marginLeft + dtWidth / 4 //2
                - (ahLineWidth) / 2;
            positioning.defaultArrowheadLine.top = dtTop - ahLineHeight - ahLineVerticalMargin;
            positioning.defaultArrowheadLine.width = ahLineWidth;
            positioning.defaultArrowheadLine.height = ahLineHeight;
        }
        //Arrowhead line for customizable tunnel
        {
            positioning.customizableArrowheadLine.left = positioning.defaultArrowheadLine.left;
            positioning.customizableArrowheadLine.marginTop = ahLineVerticalMargin;
            positioning.customizableArrowheadLine.top = positioning.customizableTunnel.top
                + positioning.customizableTunnel.marginTop
                + positioning.customizableTunnel.height;
            positioning.customizableArrowheadLine.width = ahLineWidth;
            positioning.customizableArrowheadLine.height = ahLineHeight;
        }
        let ahLineLabelWidth = ahLineWidth / 4;
        //Arrowhead line Label for default tunnel
        {
            positioning.defaultArrowheadLineLabel.left = positioning.customizableArrowheadLine.left
                + ahLineWidth / 2 - ahLineLabelWidth / 2;
            positioning.defaultArrowheadLineLabel.top = positioning.defaultArrowheadLine.top;
            positioning.defaultArrowheadLineLabel.width = ahLineLabelWidth;
            positioning.defaultArrowheadLineLabel.height = ahLineHeight;
        }
        //Arrowhead line Label for customizable tunnel
        {
            positioning.customizableArrowheadLineLabel.left = positioning.customizableArrowheadLine.left
                + ahLineWidth / 2 - ahLineLabelWidth / 2;
            positioning.customizableArrowheadLineLabel.top = positioning.customizableArrowheadLine.top
                + positioning.customizableArrowheadLine.marginTop + 1;
            positioning.customizableArrowheadLineLabel.width = ahLineLabelWidth;
            positioning.customizableArrowheadLineLabel.height = ahLineHeight;
        }
        let cmLabelWidth = positioning.defaultColorMixerHorizontal.width / 2.5;
        let cmLabelHeight = positioning.defaultColorMixerHorizontal.height;
        //Color mixer Label for default tunnel
        {
            positioning.defaultColorMixerLabel.left = positioning.defaultColorMixerHorizontal.left
                + positioning.defaultColorMixerHorizontal.width / 2 - cmLabelWidth / 2;
            positioning.defaultColorMixerLabel.top = positioning.dColorMixerLeftLabel.top;
            positioning.defaultColorMixerLabel.width = cmLabelWidth;
            positioning.defaultColorMixerLabel.height = cmLabelHeight;
        }
        //Color mixer Label for customizable tunnel
        {
            positioning.customizableColorMixerLabel.left = positioning.defaultColorMixerHorizontal.left
                + positioning.defaultColorMixerHorizontal.width / 2 - cmLabelWidth / 2;
            positioning.customizableColorMixerLabel.marginTop = 0.5;
            positioning.customizableColorMixerLabel.top = positioning.cColorMixerLeftLabel.top
                + positioning.cColorMixerLeftLabel.marginTop;
            positioning.customizableColorMixerLabel.width = cmLabelWidth;
            positioning.customizableColorMixerLabel.height = cmLabelHeight;
        }

        if (colorMixerTooThin) {
            let emptySpaceX = positioning.defaultColorMixerHorizontal.left - positioning.defaultTunnel.left - 2;
            let fallDownLeft = positioning.defaultTunnel.left;

            let distanceLabelComponents = [
                positioning.defaultArrowheadLine,
                positioning.customizableArrowheadLine
            ];

            for (let component of distanceLabelComponents) {
                component.width = emptySpaceX;
                component.left = positioning.defaultTunnel.left + emptySpaceX / 2 - component.width / 2;
                if (component.left < fallDownLeft) {
                    component.left = fallDownLeft;
                }
            }

            let labelX = (positioning.defaultArrowheadLine.left === void 0) ? 0 : positioning.defaultArrowheadLine.left;
            let labelWidth = (positioning.defaultArrowheadLine.width === void 0) ? 0 : positioning.defaultArrowheadLine.width;

            let distanceLabelTextComponents = [
                positioning.defaultArrowheadLineLabel,
                positioning.customizableArrowheadLineLabel
            ];

            for (let component of distanceLabelTextComponents) {
                let cWidth = (component.width === void 0) ? 0 : component.width;
                component.left = labelX + labelWidth / 2 - cWidth / 2;
            }
        }

        return positioning;
    }

    private getLayerPropertyValue(key: string, layerIdx: number) {
        if (key === "BRadius") {
            return Number(this.data[layerIdx].MinBRadius).valueOf();
        }

        return Number(this.data[layerIdx].Properties[key]).valueOf();
    }

    private prepareLayersForVizualization(): { defaultTunnelLayers: any, customizableTunnelLayers: any } {
        let defaultTunnelLayers = [];
        let customizableTunnelLayers = [];
        for (var i = 0; i < this.data.length; i++) {
            let defaultTunnelLayer = {
                id: i,
                start: this.data[i].StartDistance,
                end: this.data[i].EndDistance,
                value: this.getLayerPropertyValue(this.coloringPropertyKey, i),
                radius: this.data[i][this.radiusPropertyKey]
            };
            let customizableTunnelLayer = {
                id: i,
                start: this.data[i].StartDistance,
                end: this.data[i].EndDistance,
                value: this.getLayerPropertyValue(this.customColoringPropertyKey, i),
                radius: this.data[i][this.customRadiusPropertyKey]
            };

            defaultTunnelLayers.push(defaultTunnelLayer);
            customizableTunnelLayers.push(customizableTunnelLayer);
        }

        return {
            defaultTunnelLayers,
            customizableTunnelLayers
        }
    }

    private getMaxY(realMaxYValue: number) {
        let maxY = Math.ceil(realMaxYValue);
        let chunkSize = maxY / this.verticalAxisChunkCount;
        if (maxY - realMaxYValue < chunkSize / 2) {
            maxY += Math.ceil(chunkSize / 2);
        }
        return maxY;
    }

    private prepareTunnelObject(minVal: number, maxVal: number, center: number, context: CanvasRenderingContext2D, tunnelLayers: any, isDefaultTunnel: boolean): { tunnel: Tunnel, colorFunctionSettings: any } {
        let coloringProperty = ((isDefaultTunnel) ? this.coloringPropertyKey : this.customColoringPropertyKey) as PropertyKey;
        let colorFunctionSettings = {
            minVal: minVal,
            maxVal: maxVal,
            minColor: this.minColor[coloringProperty],
            maxColor: this.maxColor[coloringProperty],
            minColorMiddle: this.minColorMiddle[coloringProperty],
            maxColorMiddle: this.maxColorMiddle[coloringProperty],
            skipMiddle: (coloringProperty == "NumPositives" || coloringProperty == "NumNegatives" || coloringProperty == "Ionizable")
                ? true
                : this.skipMiddle,
            centerPosition: center,
            centerAbsolute: (coloringProperty == "NumPositives" || coloringProperty == "NumNegatives" || coloringProperty == "Ionizable")
                ? false
                : !this.useColorMinMax
        };

        let maxY = this.getMaxY((isDefaultTunnel) ? this.maxY : this.customMaxY);

        return {
            tunnel: new Tunnel(
                {
                    x: 0,
                    y: 0
                },
                {
                    x: this.maxX,
                    y: maxY
                },
                tunnelLayers,
                context,
                this.getColor,
                colorFunctionSettings,
                !isDefaultTunnel
            ),
            colorFunctionSettings
        }
    }

    private renderObjects(renderable: { drawable: ContextAwareObject, bounds: { x: number, y: number, width: number, height: number } }[]) {
        for (let obj of renderable) {
            obj.drawable.drawFromBounds(obj.bounds);
        }
    }

    // The values of a property the colours span: min-max of the channel or absolute bounds, and the centre
    private colorRange(propertyKey: string) {
        const min = (this.useColorMinMax) ? this.minColoringValue.get(propertyKey) : this.absColorValueMin.get(propertyKey);
        if (min == void 0) {
            throw Error("Minimal value for property '" + propertyKey + "' was not found!");
        }
        const max = (this.useColorMinMax) ? this.maxColoringValue.get(propertyKey) : this.absColorValueMax.get(propertyKey);
        if (max == void 0) {
            throw Error("Maximal value for property '" + propertyKey + "' was not found!");
        }
        return { min, max, center: this.absCenterPositions.get(propertyKey as PropertyKey) ?? 0 };
    }

    public vizualize() {

        this.resizeCanvas();

        let canvasWidth = this.getCanvas().width;
        let canvasHeight = this.getCanvas().height;
        let context = this.getContext();

        //Data was not prepared yet
        if (this.dataDirty) {
            this.prepareData();
        }

        //Prepare layers data
        let layers = this.prepareLayersForVizualization();

        let maxDistance = layers.defaultTunnelLayers[layers.defaultTunnelLayers.length - 1].end;
        maxDistance = roundToDecimal(maxDistance, 1); // round to 1 decimal

        let positioning = this.getComponentsPositioning();
        const at = (component: Positionable) => component.toBounds(canvasWidth, canvasHeight);
        const text = (value: string, fontSize: FontSize, textAlign: TextAlign) => new TextBox(value, context, fontSize, textAlign);

        const d = this.colorRange(this.coloringPropertyKey);
        const c = this.colorRange(this.customColoringPropertyKey);
        let defaultTunnelData = this.prepareTunnelObject(d.min, d.max, d.center, context, layers.defaultTunnelLayers, true);
        let customizableTunnelData = this.prepareTunnelObject(c.min, c.max, c.center, context, layers.customizableTunnelLayers, false);
        this.__tunnels.default = { tunnel: defaultTunnelData.tunnel, bounds: at(positioning.defaultTunnel) };
        this.__tunnels.customizable = { tunnel: customizableTunnelData.tunnel, bounds: at(positioning.customizableTunnel) };

        // Drawn in this order
        const toRender: [ContextAwareObject, Positionable][] = [
            [defaultTunnelData.tunnel, positioning.defaultTunnel],
            [customizableTunnelData.tunnel, positioning.customizableTunnel],
            // horizontal colour bars
            [new ColorMixer(d.min, d.max, context, this.getColor, defaultTunnelData.colorFunctionSettings, true), positioning.defaultColorMixerHorizontal],
            [new ColorMixer(c.min, c.max, context, this.getColor, customizableTunnelData.colorFunctionSettings, true), positioning.customizableColorMixerHorizontal],
            // axes
            [new Axis(0, this.maxX, context, 10, true, 20, 1.6), positioning.horizontalAxis],
            [new Axis(0, this.getMaxY(this.maxY), context, this.verticalAxisChunkCount, false, 30, 1.6), positioning.verticalAxis_1],
            [new Axis(0, this.getMaxY(this.customMaxY), context, this.verticalAxisChunkCount, false, 30, 1.6), positioning.verticalAxis_2],
            // axis labels: the distance and the radius ranges
            [text("0 Å", "big", "right"), positioning.axisLeftZeroLabel],
            [text(`${maxDistance} Å`, "big", "left"), positioning.horizontalAxisRightLabel],
            [text(`${this.getMaxY(this.maxY)} Å`, "medium", "right"), positioning.vAxis1TopLabel],
            [text(`${this.getMaxY(this.customMaxY)} Å`, "medium", "right"), positioning.vAxis2BottomLabel],
            // colour bar ranges
            [text(`${roundToDecimal(d.min, 2)}`, "small", "left"), positioning.dColorMixerLeftLabel],
            [text(`${roundToDecimal(d.max, 2)}`, "small", "right"), positioning.dColorMixerRightLabel],
            [text(`${roundToDecimal(c.min, 2)}`, "small", "left"), positioning.cColorMixerLeftLabel],
            [text(`${roundToDecimal(c.max, 2)}`, "small", "right"), positioning.cColorMixerRightLabel],
            // the radius brackets and the distance arrows, with their labels
            [new CurlyBrackets(context), positioning.defaultCurlyBrackets],
            [text(`${Bundle.get(this.radiusPropertyKey)}`, "small", "left"), positioning.defaultCurlyBracketsLabel],
            [new CurlyBrackets(context), positioning.customizableCurlyBrackets],
            [text(`${Bundle.get(this.customRadiusPropertyKey)}`, "small", "left"), positioning.customizableCurlyBracketsLabel],
            [new ArrowHeadLine(context, true), positioning.defaultArrowheadLine],
            [text(`Distance`, "small", "center"), positioning.defaultArrowheadLineLabel],
            [new ArrowHeadLine(context, true), positioning.customizableArrowheadLine],
            [text(`Distance`, "small", "center"), positioning.customizableArrowheadLineLabel],
            // the names of the coloring properties
            [text(`${this.coloringPropertyKey}`, "small", "center"), positioning.defaultColorMixerLabel],
            [text(`${this.customColoringPropertyKey}`, "small", "center"), positioning.customizableColorMixerLabel],
        ];
        this.renderObjects(toRender.map(([drawable, component]) => ({ drawable, bounds: at(component) })));

        if (this.selectedLayerIds.length > 0) {
            this.selectLayers(this.selectedLayerIds);
        }
    }

    private switchToMainCanvas() {
        let tmpCanvas = document.getElementById(this.tmpCanvasId);
        if (tmpCanvas !== null) {
            tmpCanvas.remove();
        }

        this.rebindDOMRefs();
        this.vizualize();
        this.highlightHitbox(this.currentLayerIdx);
    }

    private switchToTmpCanvas() {
        let canvas = this.getCanvas();
        if (canvas.id === this.tmpCanvasId) {
            throw new Error("Trying to switch to tmp canvas from tmp canvas! Maybe forgotten SwitchToMain(..)?");
        }

        let tmpCanvas = document.createElement("canvas");
        tmpCanvas.style.position = "absolute";
        tmpCanvas.style.top = "-1000px";
        tmpCanvas.id = this.tmpCanvasId;

        tmpCanvas.width = 1882;
        tmpCanvas.height = 474;

        document.body.appendChild(tmpCanvas);

        this.getContext();
        let tmpCtx = tmpCanvas.getContext("2d") as CanvasRenderingContext2D;
        if (tmpCtx === null) {
            throw new Error("Unable initiate new 2D canvas context");
        }

        this.__context = tmpCtx;
        this.__canvas = tmpCanvas;
    }

    private wrapSVG() {
        let canvas = this.getCanvas();
        let ctx = new C2S(canvas.width, canvas.height);

        if (ctx === null) {
            throw new Error("Unable to initialize new drawing context!");
        }
        this.__context = ctx;
    }

    private unwrapSVG() {
        let ctx = this.getCanvas().getContext("2d");
        if (ctx === null) {
            throw new Error("Unable to initialize new drawing context!");
        }

        this.__context = ctx;
    }

    public exportImage(): DataURL {
        if (!this.isDOMBound || this.isDataDirty()) {
            throw new Error("Data not prepared!");
        }

        //Deselekce vrstvy
        let selectedLayers: number[] = [];
        if (this.selectedLayerIds.length > 0) {
            selectedLayers = this.selectedLayerIds;
            this.selectLayers([]);
        }

        this.switchToTmpCanvas();

        this.vizualize();

        let dataURL = this.getCanvas().toDataURL("image/png");

        this.switchToMainCanvas();

        //Opetovne oznaceni vrstvy(stav pred exportem)
        this.selectLayers(selectedLayers)

        return dataURL;
    }

    private getSVGDataURL() {
        let svg = this.getSVGData();

        let xmlSerializer = new XMLSerializer();
        let serializedSVG = `<?xml version="1.0" encoding="utf-8"?>${xmlSerializer.serializeToString(svg)}`;
        serializedSVG = utf8.encode(serializedSVG);

        return `data:image/svg+xml;charset=utf-8;base64,${btoa(serializedSVG)}`;
    }

    private getSVGData() {
        let ctx = this.getContext() as CanvasRenderingContext2D & { getSvg: () => XMLDocument, getSerializedSvg: () => boolean };
        ctx.getSerializedSvg();

        let svg = ctx.getSvg();

        return svg;
    }

    public exportSVGImage(): string {
        if (!this.isDOMBound || this.isDataDirty()) {
            throw new Error("Data not prepared!");
        }

        //Deselekce vrstvy
        let selectedLayers: number[] = [];
        if (this.selectedLayerIds.length > 0) {
            selectedLayers = this.selectedLayerIds;
            this.deselectLayers();
        }

        this.switchToTmpCanvas();
        this.wrapSVG();

        this.vizualize();

        let svg = this.getSVGDataURL();

        this.unwrapSVG();
        this.switchToMainCanvas();

        //Opetovne oznaceni vrstvy(stav pred exportem)
        this.selectLayers(selectedLayers);

        return svg;
    }

    public setCustomColoringPropertyKey(coloringPropertyKey: string) {
        this.customColoringPropertyKey = coloringPropertyKey;
        //TODO invoke
    }

    public getCustomColoringPropertyKey() {
        return this.customColoringPropertyKey;
    }

    public setColoringPropertyKey(coloringPropertyKey: string) {
        this.coloringPropertyKey = coloringPropertyKey;
        //TODO invoke
    }

    public getColoringPropertyKey() {
        return this.coloringPropertyKey;
    }

    public setCustomRadiusPropertyKey(radiusPropertyKey: RadiusProperty) {
        if (this.customRadiusPropertyKey !== radiusPropertyKey) {
            this.customRadiusPropertyKey = radiusPropertyKey;
            this.dataDirty = true;
        }
    }

    public getCustomRadiusPropertyKey() {
        return this.customRadiusPropertyKey;
    }

    public setRadiusPropertyKey(radiusPropertyKey: RadiusProperty) {
        if (this.radiusPropertyKey !== radiusPropertyKey) {
            this.radiusPropertyKey = radiusPropertyKey;
            this.dataDirty = true;
        }
    }

    public getRadiusPropertyKey() {
        return this.radiusPropertyKey;
    }

    public getHitboxes() {
        let tunnels = this.getTunnels();
        if (tunnels === null) {
            return null;
        }

        return {
            defaultTunnel: (tunnels.default !== null)
                ? tunnels.default.tunnel.getHitboxes()
                : null,
            customizable: (tunnels.customizable !== null)
                ? tunnels.customizable.tunnel.getHitboxes()
                : null,
        }
    }

    public highlightHitbox(layerIdx: number) {
        if (layerIdx < 0) {
            return
        }
        this.currentLayerIdx = layerIdx;
        let tunnels = this.getTunnels();
        if (tunnels === null) {
            return;
        }

        if (tunnels.default !== null) {
            tunnels.default.tunnel.highlightHitbox(layerIdx);
        }
        if (tunnels.customizable !== null) {
            tunnels.customizable.tunnel.highlightHitbox(layerIdx);
        }
    }

    /** Helpers **/

    public getColor(value: number, settings: ColorPaletteFunctionSettings) {
        let minVal = settings.minVal;
        let maxVal = settings.maxVal;
        let minColor = settings.minColor;
        let maxColor = settings.maxColor;
        let minColorMiddle = settings.minColorMiddle;
        let maxColorMiddle = settings.maxColorMiddle;
        let skipMiddle = settings.skipMiddle;
        let middle = (settings.centerAbsolute) ? settings.centerPosition : (minVal + maxVal) / 2;

        let rgb: RGBColor;

        if (value < (minVal + maxVal) / 2) {
            rgb = ChannelDbPlugin.Palette.interpolate(minVal, minColor, middle, maxColorMiddle, value);
        }
        else {
            rgb = ChannelDbPlugin.Palette.interpolate(middle, minColorMiddle, maxVal, maxColor, value);
        }

        if (skipMiddle && settings.centerAbsolute) {
            throw new Error("Cannot config absolute center and skip center at once! Forbidden configuration -> skipMiddle=true && centerAbsolute=true");
        }
        if (skipMiddle && !settings.centerAbsolute) {
            rgb = ChannelDbPlugin.Palette.interpolate(minVal, minColor, maxVal, maxColor, value);
        }

        if (minVal === maxVal) {
            rgb = ChannelDbPlugin.Palette.interpolate(0, minColor, 1, maxColorMiddle, 0.5);
        }

        return "rgb(" + String(Math.floor(rgb.r)) + "," + String(Math.floor(rgb.g)) + "," + String(Math.floor(rgb.b)) + ")";
    }

};
