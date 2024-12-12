import { Color } from "molstar/lib/mol-util/color";
import { invertHexContrastGrayscale, RGBColor, rgbToHex, Uint8ClampedArrayToRGB } from "./Colors";
import { Enum } from "../../StaticData";
import { LayerColors } from "../CommonUtils/LayerColors";

type ColorPaletteFunction = (val: number, settings: ColorPaletteFunctionSettings) => string;
type Rectangle = { x: number, y: number, width: number, height: number };

export interface ColorPaletteFunctionSettings {
    minVal: number,
    maxVal: number,
    minColor: RGBColor,
    maxColor: RGBColor,
    minColorMiddle: RGBColor,
    maxColorMiddle: RGBColor,
    skipMiddle: boolean,
    centerPosition: number,
    centerAbsolute: boolean
};
export interface XYPoint {
    x: number,
    y: number
};

export type XYScale = XYPoint;

export type LayerID = number;

export interface Layer {
    id: LayerID,
    start: number,
    end: number,
    value: number,
    radius: number
};
export interface LayerHitbox {
    x: number,
    y: number,
    width: number,
    height: number,
    layerID: LayerID
};

export abstract class DrawableObject {
    abstract draw(x: number, y: number, width: number, height: number): void;
}

export abstract class ContextAwareObject extends DrawableObject {
    protected context: CanvasRenderingContext2D;
    protected lineWidth: number;

    public constructor(context: CanvasRenderingContext2D) {
        super();

        this.context = context;
        this.lineWidth = 1;
    }

    clipToBounds(bounds: Rectangle) {
        this.context.rect(bounds.x, bounds.y, bounds.width, bounds.height);
        this.context.clip();
    }

    public drawFromBounds(bounds: Rectangle) {
        this.draw(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    protected clear(bounds: Rectangle) {
        this.context.clearRect(bounds.x - this.lineWidth, bounds.y - this.lineWidth, bounds.width + this.lineWidth * 2, bounds.height + this.lineWidth * 2);
    }
}

//--

export class Axis extends ContextAwareObject {
    private isHorizontal: boolean;
    private minVal: number;
    private maxVal: number;
    private countOfParts: number;
    private margin: number;
    private doHighlight: boolean = false;  //Žluté podbarvení obdélníku

    private lineColor = "#8c8c8c";

    public constructor(minVal: number, maxVal: number, context: CanvasRenderingContext2D, countOfParts: number,
        isHorizontal: boolean = true, marginPercent: number = 5, lineWidth: number = 2) {
        super(context);

        this.isHorizontal = isHorizontal;
        this.minVal = minVal;
        this.maxVal = maxVal;
        this.countOfParts = countOfParts;
        this.margin = marginPercent;
        this.lineWidth = lineWidth;
    }

    private drawMainLine(bounds: Rectangle) {
        if (this.isHorizontal) {
            this.context.moveTo(bounds.x, bounds.y + bounds.height / 2);
            this.context.lineTo(bounds.x + bounds.width, bounds.y + bounds.height / 2);
        } else {
            this.context.moveTo(bounds.x + bounds.width / 2, bounds.y);
            this.context.lineTo(bounds.x + bounds.width / 2, bounds.y + bounds.height);
        }
    }

    private drawPartLine(bounds: Rectangle, partIdx: number) {
        if (this.isHorizontal) {
            let partSize = bounds.width / this.countOfParts;
            let margin = (bounds.height / 100) * this.margin;
            this.context.moveTo(bounds.x + partIdx * partSize, bounds.y + margin);
            this.context.lineTo(bounds.x + partIdx * partSize, bounds.y + (bounds.height - margin));
        }
        else {
            let partSize = bounds.height / this.countOfParts;
            let margin = (bounds.width / 100) * this.margin;
            this.context.moveTo(bounds.x + margin, bounds.y + partIdx * partSize);
            this.context.lineTo(bounds.x + (bounds.width - margin), bounds.y + partIdx * partSize);
        }
    }

    public draw(x: number, y: number, width: number, height: number): void {
        let bounds = { x, y, width, height };

        this.clear(bounds);

        this.context.save();

        this.clipToBounds(bounds);

        this.context.strokeStyle = this.lineColor;

        this.context.beginPath();

        this.context.lineWidth = this.lineWidth;

        this.drawMainLine(bounds);

        for (let i = 0; i <= this.countOfParts; i++) {
            this.drawPartLine(bounds, i);
        }

        this.context.closePath();

        this.context.stroke();
        if (this.doHighlight) {
            this.context.fillStyle = "yellow";
            this.context.fillRect(x, y, width, height);
        }

        this.context.restore();
    }
}

export class CurlyBrackets extends ContextAwareObject {
    private lineColor = "#8c8c8c";

    private isLeftToRight: boolean;

    public constructor(context: CanvasRenderingContext2D) {
        super(context);

        this.isLeftToRight = true;
    }

    public draw(x: number, y: number, width: number, height: number): void {
        //!!!
        this.isLeftToRight = true;
        //!!!
        let bounds = { x, y, width, height };

        this.clear(bounds);
        /*
        let radius = bounds.width/2;
        let linelength = bounds.height / 2;

        let lx = bounds.x + radius;
        let r = (this.isLeftToRight?(-1)*radius:radius);
        */
        let border = (bounds.width / 100) * 10;
        let borderVertical = (bounds.height / 100) * 2;
        let radius = (bounds.width - (2 * border)) / 2;
        let lineLength = (bounds.height - (borderVertical * 2)) / 2;
        let p0 = {
            x: bounds.x + border,
            y: bounds.y + borderVertical
        };
        let p1 = {
            x: bounds.x + border + radius,
            y: bounds.y + borderVertical
        };
        let p2 = {
            x: bounds.x + border + radius,
            y: bounds.y + borderVertical + radius
        };
        let p3 = {
            x: bounds.x + border + radius,
            y: bounds.y + borderVertical + lineLength - radius
        };
        let p4 = {
            x: bounds.x + border + radius,
            y: bounds.y + borderVertical + lineLength
        };
        let p5 = {
            x: bounds.x + border + radius * 2,
            y: bounds.y + borderVertical + lineLength
        };
        let p6 = {
            x: bounds.x + border + radius,
            y: bounds.y + borderVertical + lineLength + radius
        };
        let p7 = {
            x: bounds.x + border + radius,
            y: bounds.y + borderVertical + lineLength * 2 - radius
        };
        let p8 = {
            x: bounds.x + border + radius,
            y: bounds.y + borderVertical + lineLength * 2
        };
        let p9 = {
            x: bounds.x + border,
            y: bounds.y + borderVertical + lineLength * 2
        };

        this.context.save();

        this.clipToBounds(bounds);

        this.context.strokeStyle = this.lineColor;
        this.context.lineWidth = 1;

        this.context.beginPath();

        this.context.moveTo(p0.x, p0.y);
        this.context.arc(p0.x, p2.y, radius, 1.5 * Math.PI, 0 * Math.PI);
        this.context.moveTo(p2.x, p2.y);
        this.context.lineTo(p3.x, p3.y);
        this.context.moveTo(p5.x, p5.y);
        this.context.arc(p5.x, p3.y, radius, 0.5 * Math.PI, 1 * Math.PI);
        this.context.moveTo(p5.x, p5.y);
        this.context.lineTo(p5.x, p5.y);
        this.context.moveTo(p6.x, p6.y);
        this.context.arc(p5.x, p6.y, radius, 1 * Math.PI, 1.5 * Math.PI);
        this.context.moveTo(p6.x, p6.y);
        this.context.lineTo(p7.x, p7.y);
        this.context.arc(p9.x, p7.y, radius, 0 * Math.PI, 0.5 * Math.PI);

        this.context.stroke();

        this.context.closePath();

        this.context.restore();
    }
}

export class ArrowHeadLine extends ContextAwareObject {
    private lineColor = "#8c8c8c";
    private isHorizontal: boolean;
    private bounds: Rectangle;

    private doHighlight: boolean = false;  //Žluté podbarvení obdélníku

    public constructor(context: CanvasRenderingContext2D, isHorizontal: boolean = true) {
        super(context);

        this.isHorizontal = isHorizontal;
        this.lineWidth = 0.5;
    }

    public draw(x: number, y: number, width: number, height: number): void {
        this.bounds = { x, y, width, height };

        let xMargin = ((width / 100) * 2);
        let yMargin = ((height / 100) * 15);

        let x1 = (this.isHorizontal ? x + xMargin : x + width / 2 - this.lineWidth / 2);
        let x2 = (this.isHorizontal ? x + width - xMargin : x + width / 2 - this.lineWidth / 2);
        let y1 = (this.isHorizontal ? y + height / 2 - this.lineWidth / 2 : y + yMargin);
        let y2 = (this.isHorizontal ? y + height / 2 - this.lineWidth / 2 : y + height - yMargin);

        this.clear(this.bounds);

        if (this.doHighlight) {
            this.context.save();

            this.context.fillStyle = "yellow";
            this.context.fillRect(x, y, width, height);

            this.context.restore();
        }

        this.context.save();

        this.clipToBounds(this.bounds);

        this.context.strokeStyle = this.lineColor;
        this.context.setLineDash([1, 2]);
        this.context.lineWidth = this.lineWidth;


        //Base line
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.closePath();
        this.context.stroke();

        this.context.restore();

        // draw the starting arrowhead
        var startRadians = Math.atan((y2 - y1) / (x2 - x1));
        startRadians += ((x2 > x1) ? -90 : 90) * Math.PI / 180;
        this.drawArrowhead(x1, y1, startRadians);

        // draw the ending arrowhead
        var endRadians = Math.atan((y2 - y1) / (x2 - x1));
        endRadians += ((x2 > x1) ? 90 : -90) * Math.PI / 180;
        this.drawArrowhead(x2, y2, endRadians);
    }

    private drawArrowhead(x: number, y: number, radians: number) {
        if (this.bounds === void 0) {
            throw new Error("Unsupported state! Bounds not initialized before function call.");
        }

        this.context.save();

        this.clipToBounds(this.bounds);

        this.context.strokeStyle = this.lineColor;
        this.context.fillStyle = this.lineColor;
        this.context.lineWidth = this.lineWidth;

        this.clipToBounds(this.bounds);
        this.context.beginPath();
        this.context.translate(x, y);
        this.context.rotate(radians);
        this.context.moveTo(0, 0);
        this.context.lineTo(2.5, 6);
        this.context.lineTo(0, 0);
        this.context.lineTo(-2.5, 6);
        this.context.lineTo(0, 0);
        this.context.closePath();
        this.context.stroke();

        this.context.restore();
    }
}

export type FontSize = "small" | "medium" | "big" | number;
export type TextAlign = "left" | "center" | "right";
export class TextBox extends ContextAwareObject {
    private value: string;
    private fontSize: FontSize; //Velikost textu v procentech vzhledem k výšce obdelníku, kam se vykersluje 
    private doHighlight: boolean = false;  //Žluté podbarvení obdélníků s textem
    private textAlign: TextAlign;

    public constructor(value: string, context: CanvasRenderingContext2D, fontSize: FontSize = "medium", textAlign: TextAlign = "center") {
        super(context);

        this.value = value;
        this.fontSize = fontSize;
        this.textAlign = textAlign;
        this.lineWidth = 2;
    }

    private fontSizeToPercent(fontSize: FontSize): number {
        if (typeof (fontSize) === "number") {
            return fontSize;
        }

        switch (fontSize) {
            case "small":
                return 5;
            case "medium":
                return 6;
            case "big":
                return 7;
            default:
                return this.fontSizeToPercent("medium");
        }
    }

    private getRealFontSize(fontSize: FontSize): number {
        let hUnit = this.context.canvas.height / 100;
        return this.fontSizeToPercent(fontSize) * hUnit;
    }

    public draw(x: number, y: number, width: number, height: number): void {

        let realTextSize = this.getRealFontSize(this.fontSize);

        this.context.save();

        this.clear({ x, y, width, height });

        if (this.doHighlight) {
            this.context.fillStyle = "yellow";
            this.context.fillRect(x, y, width, height);
        }

        this.context.font = `normal normal normal ${realTextSize}px sans-serif`;
        this.context.fillStyle = "#8c8c8c";
        this.context.textAlign = this.textAlign;
        this.context.textBaseline = "middle";
        switch (this.textAlign) {
            case "left":
                this.context.fillText(this.value, x, y + height / 2, width);
                break;
            case "center":
                this.context.fillText(this.value, x + width / 2, y + height / 2, width);
                break;
            case "right":
                this.context.fillText(this.value, x + width, y + height / 2, width);
                break;
        }

        this.context.restore();
    }
}

export class ColorMixer extends ContextAwareObject {
    private scale: XYScale;
    private minVal: number;
    private maxVal: number;
    private paletteFunction: ColorPaletteFunction;
    private paletteFunctionSettings: ColorPaletteFunctionSettings;

    private lineColor = "#8c8c8c";

    private isHorizontal: boolean;

    public constructor(minVal: number, maxVal: number, context: CanvasRenderingContext2D,
        paletteFunction: ColorPaletteFunction, paletteFunctionSettings: ColorPaletteFunctionSettings, isHorizontal: boolean = false) {
        super(context);

        this.minVal = minVal;
        this.maxVal = maxVal;
        this.paletteFunction = paletteFunction;
        this.paletteFunctionSettings = paletteFunctionSettings;
        this.isHorizontal = isHorizontal;
    }

    public draw(x: number, y: number, width: number, height: number): void {
        let bounds = { x, y, width, height };

        this.clear(bounds);
        this.context.save();

        this.clipToBounds(bounds);

        this.context.strokeStyle = this.lineColor;

        let my_gradient = this.context.createLinearGradient(
            bounds.x + (this.isHorizontal ? bounds.width : 0), bounds.y,
            bounds.x, bounds.y + (this.isHorizontal ? 0 : bounds.height)
        );

        my_gradient.addColorStop(0, this.paletteFunction(Number(this.maxVal), this.paletteFunctionSettings));
        my_gradient.addColorStop(0.5, this.paletteFunction(Number((this.minVal + this.maxVal) / 2), this.paletteFunctionSettings));
        my_gradient.addColorStop(1, this.paletteFunction(Number(this.minVal), this.paletteFunctionSettings));

        this.context.beginPath();
        this.context.moveTo(bounds.x, bounds.y);

        this.context.fillStyle = my_gradient;
        this.context.lineWidth = this.lineWidth;

        this.context.rect(bounds.x, bounds.y, bounds.width, bounds.height);

        this.context.closePath();

        this.context.fill();
        this.context.stroke();

        this.context.restore();
    }
}

export class Tunnel extends ContextAwareObject {
    private scale: XYScale;
    private minVal: XYPoint;
    private maxVal: XYPoint;
    private isInverted_: boolean;
    private layers: Layer[];
    private paletteFunction: ColorPaletteFunction;
    private paletteFunctionSettings: ColorPaletteFunctionSettings;

    private bounds: Rectangle;
    private hasBounds: boolean;

    private highlightLineWidth = 1;
    protected lineWidth = 1;
    private hitboxLineWidth = 1;

    private lineColor = "#8c8c8c";
    private hitboxLineColor = "#173133";
    private highlightLineColor = '#000';

    private currentVisual: ImageData;
    private currentVisualPlain: ImageData;

    public constructor(minVal: XYPoint, maxVal: XYPoint, layers: Layer[],
        context: CanvasRenderingContext2D, paletteFunction: ColorPaletteFunction,
        paletteFunctionSettings: ColorPaletteFunctionSettings, isInverted = false) {
        super(context);

        this.minVal = minVal;
        this.maxVal = maxVal;
        this.layers = layers;
        this.paletteFunction = paletteFunction;
        this.isInverted_ = isInverted;
        this.paletteFunctionSettings = paletteFunctionSettings;

        this.hasBounds = false;
        this.selectedLayers = [];
        this.layersData = null;
    }

    public setBounds(x: number, y: number, width: number, height: number) {
        this.bounds = { x, y, width, height };
        this.scale = {
            x: this.bounds.width / this.maxVal.x,
            y: this.bounds.height / this.maxVal.y
        };

        this.hasBounds = true;
    }

    protected clear(bounds: Rectangle) {
        this.context.clearRect(bounds.x, bounds.y,
            bounds.width, bounds.height);
    }

    public draw(x: number, y: number, width: number, height: number): void {

        this.setBounds(x, y, width, height);

        this.clear(this.bounds);

        this.renderAllLayers();

        //Render hitboxes to canvas - dotted lines between layers
        this.renderHitboxes();

        this.paintBox();

        this.currentVisualPlain = this.context.getImageData(
            this.bounds.x, this.bounds.y,
            this.bounds.width, this.bounds.height
        );
        this.currentVisual = this.currentVisualPlain;

        //this.highlightHitbox(0);
    }

    public renderHitboxes(): void {
        for (let i = 1; i < this.layers.length; i++) {
            this.renderHitbox(i);
        }
    }

    public getHitboxes(): LayerHitbox[] {
        let rv = []
        for (let i = 0; i < this.layers.length; i++) {
            rv.push(this.getHitbox(i));
        }
        return rv;
    }

    private highlightedLayerIdx: number = -1;

    public highlightHitbox(layerIdx: number) {
        let touchMode = (window as any).TOUCH_MODE as boolean;

        let layersData = this.layersData;
        let scale = this.getScale();

        if (layersData === null || scale === null) {
            return;
        }

        let graphLine = layersData.path.slice().sort((a, b) => { return a.x - b.x; });

        if (this.highlightedLayerIdx >= 0) {
            this.renderSelectedDeselectedLayer(
                graphLine, this.highlightedLayerIdx, scale, this.bounds, this.selectedLayers.indexOf(this.highlightedLayerIdx) >= 0);
        }

        if (touchMode) {
            this.highlightedLayerIdx = -1;
            return;
        }

        let path = [graphLine[layerIdx], graphLine[layerIdx + 1]];

        let restOfBody = [
            {
                x: this.bounds.x + this.layers[layerIdx].end * scale.x,
                y: this.getTop() + (this.isInverted() ? -1 : 1) * this.lineWidth
            },
            {
                x: this.bounds.x + this.layers[layerIdx].start * scale.x,
                y: this.getTop() + (this.isInverted() ? -1 : 1) * this.lineWidth
            },
            {
                x: path[0].x,
                y: path[0].y
            }
        ];

        this.colorBackground("#cccccc", path, restOfBody);

        this.highlightedLayerIdx = layerIdx;
    }

    private selectedLayers: number[] = [];

    public selectLayers(layerIds: number[]) {
        this.renderSelectedLayers(layerIds.slice());
    }

    private paintBox() {
        let firstHitbox = this.getHitbox(0);
        let lastHitbox = this.getHitbox(this.layers.length - 1);

        let r = {
            sx: firstHitbox.x,
            sy: firstHitbox.y,
            ex: lastHitbox.x + lastHitbox.width,
            ey: lastHitbox.y + lastHitbox.height
        }

        this.drawSolidLine(r.sx, r.sy, r.ex, r.sy, this.lineWidth, this.lineColor);
        this.drawSolidLine(r.ex, r.sy, r.ex, r.ey, this.lineWidth, this.lineColor);
        this.drawSolidLine(r.ex, r.ey, r.sx, r.ey, this.lineWidth, this.lineColor);
        this.drawSolidLine(r.sx, r.ey, r.sx, r.sy, this.lineWidth, this.lineColor);
    }

    public getScale() {
        if (!this.hasBounds) {
            return null;
        }

        return this.scale;
    }

    private layersData: {
        gradient: CanvasGradient,
        restOfBody: XYPoint[],
        path: XYPoint[]
    } | null = null;

    private prepareLayerColors() {
        // const intervals: Interval[] = []
        const colors: Color[] = [];
        const regex = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;
        const length = this.layers[this.layers.length - 1].end;
        for (let i = 0; i < this.layers.length; i++) {
            let layer = this.layers[i];
            let prevColorValue = ((i - 1) in this.layers)
                ? this.layers[i - 1].value
                : this.layers[i].value;
            let curColorValue = this.layers[i].value;
            let color = this.paletteFunction(Number(prevColorValue), this.paletteFunctionSettings);
            if (i != 0) {
                color = this.paletteFunction(Number(curColorValue), this.paletteFunctionSettings);
            }
            const rgbValues = color.match(regex);
            if (rgbValues) {
                const r = parseInt(rgbValues[1], 10);
                const g = parseInt(rgbValues[2], 10);
                const b = parseInt(rgbValues[3], 10);
                // intervals.push({
                //     min: layer.start / length,
                //     max: layer.end / length,
                //     color: Color(Color.fromRgb(r, g, b))
                // })
                colors.push(Color(Color.fromRgb(r, g, b)));
            } else {
                // intervals.push({
                //     min: layer.start / length,
                //     max: layer.end / length,
                //     color: Color(Enum.DefaultColor)
                // })
                colors.push(Color(Enum.DefaultColor));
            }
        }
        // LayerColors.invokeOnColorIntervalCreated(new ColorInterval(intervals));
        LayerColors.colorArray = colors;
    }

    private prepareLayersData() {
        //Mozilla odmita v urcitych pripadech v 1. polovine tunelu zobrazit barevny prechod kdyz je zapnuty clip()
        //this.clipToBounds(this.bounds);
        let gLine = {
            x0: this.bounds.x,
            y0: 0,
            x1: this.bounds.x + this.bounds.width,
            y1: 0
        };

        let gradient = this.context.createLinearGradient(
            gLine.x0,
            gLine.y0,
            gLine.x1,
            gLine.y1
        )
        let path: XYPoint[] = []
        let lastColorStop = 0;
        for (let i = 0; i < this.layers.length; i++) {
            lastColorStop = this.prepareLayer(i, gradient, path, lastColorStop);
        }

        let scale = this.getScale();
        if (scale === null) {
            throw new Error("Value of scale not computed");
        }

        let restOfBody = [
            {
                x: this.bounds.x + this.layers[this.layers.length - 1].end * scale.x,
                y: this.getBottom()
            },
            {
                x: this.bounds.x + this.layers[0].start * scale.x,
                y: this.getBottom()
            },
            path[0]
        ];

        this.layersData = {
            gradient,
            restOfBody: restOfBody.slice(),
            path: path.slice()
        }

        // this.prepareLayerColors()

        return this.layersData;
    }

    public createOffscreenGradientCanvas() {
        if (!this.layersData) {
            LayerColors.setCanvas(undefined);
            return;
        }
    
        let { gradient, path } = this.prepareLayersData();
    
        const startX = path[0].x;
        let endX = path[path.length - 1].x;

        const width = Math.abs(endX - startX);
        const height = 10;
        const offsetX = path[0].x;

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        const ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true }); // https://stackoverflow.com/questions/74101155/chrome-warning-willreadfrequently-attribute-set-to-true
        if (!ctx) {
            throw new Error("Failed to get 2D context.");
        }
        ctx.translate(-offsetX, 0);
        ctx.fillStyle = gradient;
        ctx.fillRect(offsetX, 0, width, height);

        offscreenCanvas.style.border = "1px solid black";
        offscreenCanvas.style.margin = "10px";

        LayerColors.setCanvas(offscreenCanvas);
    }

    private renderAllLayers() {

        let layersData = this.layersData;
        if (layersData === null) {
            layersData = this.prepareLayersData();
        }

        this.context.save();

        this.context.fillStyle = layersData.gradient;

        this.context.beginPath();
        this.drawPath(layersData.path);
        this.drawPath(layersData.restOfBody);

        this.context.closePath();

        this.context.fill();

        this.context.restore();

        this.context.save();

        this.clipToBounds(this.bounds);

        this.context.strokeStyle = this.lineColor;
        this.context.lineWidth = this.lineWidth;

        this.context.beginPath();
        this.context.moveTo(layersData.path[0].x, layersData.path[0].y);
        this.drawPath(layersData.path);
        this.drawPath(layersData.path.reverse());
        this.context.closePath();
        this.context.stroke();

        this.context.restore();
    }

    private renderSelectedDeselectedLayer(graphLine: XYPoint[], layerIdx: number, scale: { x: number, y: number }, bounds: { x: number, y: number, width: number, height: number }, selected: boolean) {
        let path = [
            {
                x: graphLine[layerIdx].x,
                y: graphLine[layerIdx].y
            },
            {
                x: graphLine[layerIdx + 1].x,
                y: graphLine[layerIdx + 1].y
            }
        ];

        let selectedLayers = this.selectedLayers.slice().sort((a, b) => { return a - b });

        let restOfBody = [
            {
                x: path[1].x + this.lineWidth,
                y: path[1].y
            },
            {
                //x: bounds.x - ((selectedLayers[selectedLayers.length-1]===layerIdx)?this.lineWidth:-this.lineWidth) + this.layers[layerIdx].end*scale.x,
                x: bounds.x + this.lineWidth + this.layers[layerIdx].end * scale.x,
                y: this.getTop() + (this.isInverted() ? -1 : 1) * this.lineWidth
            },
            {
                //x: bounds.x + ((selectedLayers[0]===layerIdx)?this.lineWidth:-this.lineWidth) + this.layers[layerIdx].start*scale.x,
                x: bounds.x - this.lineWidth + this.layers[layerIdx].start * scale.x,
                y: this.getTop() + (this.isInverted() ? -1 : 1) * this.lineWidth
            },
            {
                x: path[0].x - this.lineWidth,
                y: path[0].y
            }
        ];

        this.colorBackground((selected) ? "#efefef" : "#ffffff", path, restOfBody);
    }

    private colorBackground(color: string, path: XYPoint[], restOfBody: XYPoint[]) {
        this.context.save();

        this.clipToBounds(this.bounds);

        this.context.lineWidth = this.lineWidth;
        this.context.fillStyle = color;

        this.context.beginPath();
        this.context.moveTo(path[0].x, path[0].y);
        this.drawPath(path.concat(restOfBody));
        this.context.closePath();
        this.context.fill();


        this.context.strokeStyle = this.lineColor;

        this.context.beginPath();
        this.context.moveTo(path[0].x, path[0].y);
        this.drawPath(path);
        this.drawPath(path.reverse());
        this.context.closePath();
        this.context.stroke();

        this.context.restore();
    }

    private renderSelectedLock: number = 0;
    private renderSelectedQueue: number[][] = []

    private renderSelectedLayers(layerIds: number[], internalCall?: boolean) {
        let layersData = this.layersData;
        if (layersData === null) {
            throw new Error("Data not prepared");
        }

        let bounds = this.bounds;

        if (internalCall === void 0) {
            internalCall = false;
        }

        if (this.renderSelectedLock++ > 0 && !internalCall) {
            this.renderSelectedQueue.unshift(layerIds);
            return;
        }

        let selectedOld = this.selectedLayers.slice().sort((a, b) => { return a - b; });

        let selected = layerIds.slice().sort((a, b) => { return a - b; });
        let graphLine = layersData.path.slice().sort((a, b) => { return a.x - b.x; });

        if (graphLine.length - 1 < selected.length) {
            throw new Error("Data are not synchronized correctly!");
        }

        let scale = this.getScale();
        if (scale === null) {
            throw new Error("Value of scale not computed");
        }

        let toSelect = selected.filter((v, i, a) => { return !(selectedOld.indexOf(v) >= 0); });
        let toUnSelect = selectedOld.filter((v, i, a) => { return !(selected.indexOf(v) >= 0); });

        if (toSelect.length === 0 && toUnSelect.length === 0) {
            this.handleQueue(internalCall);
            return;
        }

        for (let layerIdx of toSelect) {
            this.renderSelectedDeselectedLayer(graphLine, layerIdx, scale, bounds, true);
        }

        for (let layerIdx of toUnSelect) {
            this.renderSelectedDeselectedLayer(graphLine, layerIdx, scale, bounds, false);
        }

        this.context.save();

        let endBorderline = [
            {
                x: bounds.x + this.layers[this.layers.length - 1].end * scale.x,
                y: this.getBottom()
            },
            {
                x: bounds.x + this.layers[this.layers.length - 1].end * scale.x,
                y: this.getTop()
            }
        ];

        this.context.strokeStyle = "#d1d1d1";
        this.context.lineWidth = this.lineWidth;

        this.context.beginPath();
        this.context.moveTo(endBorderline[0].x, endBorderline[0].y);
        this.drawPath(endBorderline);
        this.drawPath(endBorderline.reverse());
        this.context.closePath();
        this.context.stroke();

        if (toSelect.indexOf(0) >= 0) {
            let line = [
                {
                    x: bounds.x,
                    y: this.getBottom()
                },
                {
                    x: bounds.x,
                    y: this.getTop()
                }
            ];

            this.context.beginPath();
            this.context.moveTo(line[0].x, line[0].y);
            this.drawPath(line);
            this.drawPath(line.reverse());
            this.context.closePath();
            this.context.stroke();
        }

        this.context.restore();

        this.selectedLayers = selected;

        this.handleQueue(internalCall);
    }

    private handleQueue(internalCall: boolean) {
        if (this.renderSelectedQueue.length > 0) {
            let layerIdsNext = this.renderSelectedQueue.pop();
            if (layerIdsNext !== void 0) {
                this.renderSelectedLayers(layerIdsNext, true);
            }
        }

        if (!internalCall) {
            this.renderSelectedLock = 0;
        }
    }

    private drawPath(path: XYPoint[]) {
        for (let i = 0; i < path.length; i++) {
            this.context.lineTo(path[i].x, path[i].y);
        }
    }

    private prepareLayer(layerIdx: number, gradient: CanvasGradient | null, path: XYPoint[], lastColorStop: number) {
        if (layerIdx < 0) {
            throw new Error("layerIdx must be greater or equal to 0");
        }
        let totalLenght = this.layers[this.layers.length - 1].end - this.layers[0].start;
        let currLength = this.layers[layerIdx].end - this.layers[0].start;

        let scale = this.getScale();
        if (scale === null) {
            throw new Error("Value of scale not computed in time!");
        }

        // Barvy gradientu
        let prevColorValue = ((layerIdx - 1) in this.layers)
            ? this.layers[layerIdx - 1].value
            : this.layers[layerIdx].value;
        let curColorValue = this.layers[layerIdx].value;

        let prevRadius = ((layerIdx - 1) in this.layers)
            ? this.layers[layerIdx - 1].radius
            : this.layers[layerIdx].radius;

        let bottom = this.getBottom();

        let end = this.layers[layerIdx].end;
        let start = this.layers[layerIdx].start;
        if (layerIdx > 0) {
            start = this.bounds.x + this.layers[layerIdx - 1].end * scale.x;
        }

        let inversionConstant = (this.isInverted()) ? (-1) : 1;

        if (layerIdx == 0) {
            path.push({
                x: this.bounds.x + start * scale.x,
                y: bottom - prevRadius * scale.y * inversionConstant
            });
        }
        path.push({
            x: this.bounds.x + end * scale.x,
            y: bottom - this.layers[layerIdx].radius * scale.y * inversionConstant
        });

        let color = this.paletteFunction(Number(prevColorValue), this.paletteFunctionSettings);
        let currentColorStop = 0;
        if (layerIdx != 0) {
            color = this.paletteFunction(Number(curColorValue), this.paletteFunctionSettings);
            currentColorStop = (currLength / totalLenght);
        }
        // console.log(color);
        const regex = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;
        const match = color.match(regex);
        if (match) {
            const r = parseInt(match[1], 10);
            const g = parseInt(match[2], 10);
            const b = parseInt(match[3], 10);
            const c = Color.fromRgb(r, g, b);
            console.log(`%c Color: ${Color.toRgb(c)}`, `background: ${Color.toHexStyle(c)}`);   
        }
        if (gradient !== null) {
            gradient.addColorStop(currentColorStop, color);
        }

        return currentColorStop;
    }

    private getHitbox(layerIdx: number): LayerHitbox {
        return {
            x: this.layers[layerIdx].start,
            y: 0,
            width: this.layers[layerIdx].end - this.layers[layerIdx].start,
            height: this.maxVal.y,
            layerID: layerIdx
        };
    }

    private moveTo(x: number, y: number) {
        let bottom = this.getBottom();
        let inversionKoeficient = 1;

        if (this.isInverted_) {
            inversionKoeficient = -1;
        }

        this.context.moveTo(this.bounds.x + x * this.scale.x, bottom - y * this.scale.y * inversionKoeficient);
    }

    private lineTo(x: number, y: number) {
        let bottom = this.getBottom();
        let inversionKoeficient = 1;

        if (this.isInverted_) {
            inversionKoeficient = -1;
        }

        this.context.lineTo(this.bounds.x + x * this.scale.x, bottom - y * this.scale.y * inversionKoeficient);
    }

    private drawSolidLine(sx: number, sy: number, ex: number, ey: number, lineWidth: number = 1, strokeStyle = "#000") {
        this.context.save();

        this.clipToBounds(this.bounds);

        this.context.strokeStyle = strokeStyle;
        this.context.lineWidth = lineWidth;

        this.context.beginPath();

        this.moveTo(sx, sy);
        this.lineTo(ex, ey);

        this.context.closePath();

        this.context.stroke();

        this.context.restore();
    }

    private renderHitbox(layerIdx: number) {

        if (layerIdx == 0) {
            return;
        }

        let scale = this.getScale();
        if (scale === null) {
            throw new Error("Value of scale has not been computed!");
        }

        let inversionConstant = (this.isInverted()) ? -1 : 1;
        let hitbox = this.getHitbox(layerIdx);
        let maxY = this.layers[layerIdx - 1].radius;

        let yStart = this.bounds.y
            + hitbox.y * scale.y
            + (this.isInverted() ? 0 : hitbox.height * scale.y - (maxY * scale.y))
            + this.lineWidth
        let height = maxY * scale.y;

        let bgColor = "#ffffff";
        //Check if using HTML Canvas or SVG wraper, if so - get real bg color
        if (this.context.getImageData(0, 0, 1, 1) !== null
            && this.context.getImageData(0, 0, 1, 1) !== void 0) {
            bgColor = rgbToHex(Uint8ClampedArrayToRGB(this.context.getImageData(
                this.bounds.x + hitbox.x * scale.x, yStart + height / 2, 1, 1).data));
        }

        this.context.save();

        this.clipToBounds({
            x: this.bounds.x + hitbox.x * scale.x,
            y: yStart,
            width: hitbox.width * scale.x,
            height: height - this.lineWidth * 2
        });

        this.context.strokeStyle = invertHexContrastGrayscale(bgColor);//this.lineColor;
        this.context.lineWidth = this.hitboxLineWidth;
        this.context.setLineDash([1, 3]);

        this.context.beginPath();

        this.moveTo(hitbox.x, hitbox.y);
        this.lineTo(hitbox.x, hitbox.y + hitbox.height);

        this.context.closePath();

        this.context.stroke();

        this.context.restore();

    }

    public getBottom() {
        return (this.isInverted_)
            ? this.bounds.y
            : this.bounds.y + this.bounds.height;
    }

    public getTop() {
        return (this.isInverted_)
            ? this.bounds.y + this.bounds.height
            : this.bounds.y;
    }

    public isInverted() {
        return this.isInverted_;
    }


}
