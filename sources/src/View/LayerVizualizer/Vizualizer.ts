namespace LayersVizualizer{
    declare function $(p:any): any;    
    declare function svg2pdf(a:XMLDocument, pdf:any, params:{xOffset:number, yOffset:number, scale:number}): any;
    declare var ChannelDbPlugin: any;
    declare var C2S: any;

    declare var utf8: {
        encode: (a:string)=>string,
        decode: (a:string)=>string
    };

    declare class jsPDF{
        constructor(unitSize:string, unit:string, params:any);
        addSVG(svg:any, leftMargin:number,rightMargin:number,w:number, h:number):any;
        addImage(img:any,x:number,y:number,width:number,height:number):any;
        output(type:string):string;
        setProperties(props:any):any
    };

    export type DataURL = string;

    type PropertyKey = "Polarity" | "Mutability" | "Hydropathy" | "Hydrophobicity" | "Charge" | "NumNegatives" | "NumPositives"

    export interface PropertiesNumberCell{
        Polarity:number,
        Mutability:number,
        Hydropathy:number,
        Hydrophobicity:number,
        Charge:number,
        NumNegatives:number,
        NumPositives:number,
    }

    export interface PropertiesColorCell{
        Polarity:RGBColor,
        Mutability:RGBColor,
        Hydropathy:RGBColor,
        Hydrophobicity:RGBColor,
        Charge:RGBColor,
        NumNegatives:RGBColor,
        NumPositives:RGBColor,
    }

    export interface LayersVizualizerSettings{
        coloringProperty?: String,
        useColorMinMax?: Boolean,
        colorMaxValue?: PropertiesNumberCell,
        colorMinValue?: PropertiesNumberCell,
        skipMiddleColor?: Boolean,
        topMargin?: Number,
        radiusProperty?: RadiusProperty,
        customRadiusProperty?: RadiusProperty
    };

    export interface RGBColor{
        r: number;
        g: number;
        b: number;
    };

    interface TunnelInfo{
        bounds:{
                x:number,
                y:number,
                width:number,
                height:number
        }
        tunnel:Tunnel
    }

    export type RadiusProperty = "MinRadius" | "MinFreeRadius";
    export type ColorBoundsMode = "Min/max" | "Absolute";

    export class Vizualizer{      
        private __canvas: HTMLCanvasElement;
        private __context: CanvasRenderingContext2D;

        private __tunnels:{
            default: TunnelInfo | null,
            customizable: TunnelInfo | null
        };

        private verticalAxisChunkCount:number=4;

        private coloringPropertyKey: string;
        private customColoringPropertyKey: string;
        private useColorMinMax: boolean;
        private absColorValueMax: Map<string,number>;
        private absColorValueMin: Map<string,number>;
        private minColoringValue: Map<string,number>;
        private maxColoringValue: Map<string,number>;
        private absCenterPositions: Map<PropertyKey,number>;
        private skipMiddle: boolean;
        private topMarginPercent: number;
        private topAirBorderHeight: number;
        private maxX: number;
        private maxY: number;
        private customMaxY: number;
        private radiusPropertyKey: RadiusProperty;
        private customRadiusPropertyKey: RadiusProperty;

        private minColor: PropertiesColorCell;
        private minColorMiddle: PropertiesColorCell;
        private maxColor: PropertiesColorCell;
        private maxColorMiddle: PropertiesColorCell;

        private data: DataInterface.LayerData[];
        private dataDirty: boolean;
        private isDOMBound: boolean;

        private publicInstanceIdx: number;
        private currentLayerIdx: number;

        private uiContainerId: string;
        private canvasId: string;
        private tmpCanvasId: string;

        private currentVisual: ImageData;

        private resizePercentPrecision: number;

        private selectedLayerIdx: number;

        private __colorFunctionSetings: Map<string,ColorPaletteFunctionSettings>;

        public getPublicInstanceIdx(){
            return this.publicInstanceIdx;
        }

        public getCurrentColoringSettings(tunnelType:"default"|"customizable"){
            return this.__colorFunctionSetings.get(tunnelType);       
        }

        private setCurrentColorFunctionSettings(tunnelType:"default"|"customizable", colorFunctionSetings: ColorPaletteFunctionSettings){
            this.__colorFunctionSetings.set(tunnelType,colorFunctionSetings);
        }

        public isDataDirty(){
            return this.dataDirty;
        }

        public getCanvas(){
            //DOM binding check
            if(!this.isDOMBound){
                this.rebindDOMRefs();
            }
            return this.__canvas;
        }

        public getContext(){
            //DOM binding check
            if(!this.isDOMBound){
                this.rebindDOMRefs();
            }
            return this.__context;
        }

        public getTunnels(){
            if(this.dataDirty){
                return null;
            }

            return this.__tunnels;
        }

        public static ACTIVE_INSTANCES: Vizualizer[];

        private onWindowResize(e: Event){
            
            if(document.getElementById(this.canvasId) === null){
                return;
            }
            
            let canvas = this.getCanvas();
            let context = this.getContext();
            
            if(canvas === void 0 || context === void 0 || !this.isElementVisible(canvas)){
                return;
            }

            let xUnit = canvas.width/100;
            let yUnit = canvas.height/100;
            let x_diff = Math.abs(canvas.width-canvas.offsetWidth)/xUnit;
            let y_diff = Math.abs(canvas.height-canvas.offsetHeight)/yUnit;

            if(x_diff<this.resizePercentPrecision
                && y_diff<this.resizePercentPrecision){
                    return;
                }

            this.resizeCanvas();
            
            this.vizualize();
            this.highlightHitbox(this.currentLayerIdx);
        }

        private isElementVisible(element: HTMLElement):boolean{
            if(element.style.display==="none" || element.style.visibility === "hidden"){
                return false;
            }
            
            if(element.parentElement === null || element.parentElement === void 0){
                return true;
            }

            return this.isElementVisible(element.parentElement);
        }

        private onContentResize(e: Event){
            if(document.getElementById(this.canvasId) === null){
                return;
            }

            let canvas = this.getCanvas();
            let context = this.getContext();
            
            if(canvas === void 0 || context === void 0 || !this.isElementVisible(canvas)){
                return;
            }

            this.resizeCanvas();
            
            this.vizualize();
            this.highlightHitbox(this.currentLayerIdx);
        }

        private resizeCanvas(){
            let canvas = this.getCanvas();
            let context = this.getContext();
            if(canvas === void 0 || context === void 0){
                return;
            }

            context.clearRect(0,0,canvas.width,canvas.height);

            canvas.setAttribute("width", String(canvas.offsetWidth));
            canvas.setAttribute("height", String(canvas.offsetHeight));
        }

        private configBySettings(settings: LayersVizualizerSettings){
            
            this.coloringPropertyKey = "Hydropathy";
            if(settings.coloringProperty != null){
                this.coloringPropertyKey = settings.coloringProperty.valueOf();
            }
            this.customColoringPropertyKey = this.coloringPropertyKey;

            this.useColorMinMax = true;
            if(settings.useColorMinMax != null){
                this.useColorMinMax = settings.useColorMinMax.valueOf();
            }

            this.absCenterPositions = new Map<PropertyKey,number>();
            this.absCenterPositions.set("Polarity",5);
            this.absCenterPositions.set("Hydropathy",0);
            this.absCenterPositions.set("Hydrophobicity",0);
            this.absCenterPositions.set("Mutability",75);
            this.absCenterPositions.set("Charge",0);
            this.absCenterPositions.set("NumPositives",0);
            this.absCenterPositions.set("NumNegatives",0);
            
            this.absColorValueMax = new Map<string,number>();
            this.absColorValueMax.set("Polarity",52);
            if(settings.colorMaxValue !== void 0 && settings.colorMaxValue.Polarity !== void 0){
                this.absColorValueMax.set("Polarity",settings.colorMaxValue.Polarity.valueOf());
            }
            this.absColorValueMax.set("Mutability",117);
            if(settings.colorMaxValue !== void 0 && settings.colorMaxValue.Mutability !== void 0){
                this.absColorValueMax.set("Mutability",settings.colorMaxValue.Mutability.valueOf());
            }
            this.absColorValueMax.set("Hydropathy",4.5);
            if(settings.colorMaxValue !== void 0 && settings.colorMaxValue.Hydropathy !== void 0){
                this.absColorValueMax.set("Hydropathy",settings.colorMaxValue.Hydropathy.valueOf());
            }
            this.absColorValueMax.set("Hydrophobicity",1.81);
            if(settings.colorMaxValue !== void 0 && settings.colorMaxValue.Hydrophobicity !== void 0){
                this.absColorValueMax.set("Hydrophobicity",settings.colorMaxValue.Hydrophobicity.valueOf());
            }
            this.absColorValueMax.set("Charge",5);
            if(settings.colorMaxValue !== void 0 && settings.colorMaxValue.Charge !== void 0){
                this.absColorValueMax.set("Charge",settings.colorMaxValue.Charge.valueOf());
            }
            this.absColorValueMax.set("NumPositives",5);
            if(settings.colorMaxValue !== void 0 && settings.colorMaxValue.NumPositives !== void 0){
                this.absColorValueMax.set("NumPositives",settings.colorMaxValue.NumPositives.valueOf());
            }
            this.absColorValueMax.set("NumNegatives",5);
            if(settings.colorMaxValue !== void 0 && settings.colorMaxValue.NumNegatives !== void 0){
                this.absColorValueMax.set("NumNegatives",settings.colorMaxValue.NumNegatives.valueOf());
            }

            this.absColorValueMin = new Map<string,number>();
            this.absColorValueMin.set("Polarity",0);
            if(settings.colorMinValue !== void 0 && settings.colorMinValue.Polarity !== void 0){
                this.absColorValueMin.set("Polarity",settings.colorMinValue.Polarity.valueOf());
            }
            this.absColorValueMin.set("Mutability",25);
            if(settings.colorMinValue !== void 0 && settings.colorMinValue.Mutability !== void 0){
                this.absColorValueMin.set("Mutability",settings.colorMinValue.Mutability.valueOf());
            }
            this.absColorValueMin.set("Hydropathy",-4.5);
            if(settings.colorMinValue !== void 0 && settings.colorMinValue.Hydropathy !== void 0){
                this.absColorValueMin.set("Hydropathy",settings.colorMinValue.Hydropathy.valueOf());
            }
            this.absColorValueMin.set("Hydrophobicity",-1.14);
            if(settings.colorMinValue !== void 0 && settings.colorMinValue.Hydrophobicity !== void 0){
                this.absColorValueMin.set("Hydrophobicity",settings.colorMinValue.Hydrophobicity.valueOf());
            }
            this.absColorValueMin.set("Charge",-5);
            if(settings.colorMinValue !== void 0 && settings.colorMinValue.Charge !== void 0){
                this.absColorValueMin.set("Charge",settings.colorMinValue.Charge.valueOf());
            }
            this.absColorValueMin.set("NumPositives",0);
            if(settings.colorMinValue !== void 0 && settings.colorMinValue.NumPositives !== void 0){
                this.absColorValueMin.set("NumPositives",settings.colorMinValue.NumPositives.valueOf());
            }
            this.absColorValueMin.set("NumNegatives",0);
            if(settings.colorMinValue !== void 0 && settings.colorMinValue.NumNegatives !== void 0){
                this.absColorValueMin.set("NumNegatives",settings.colorMinValue.NumNegatives.valueOf());
            }

            this.radiusPropertyKey = "MinRadius";
            if(settings.radiusProperty != null){
                this.radiusPropertyKey = settings.radiusProperty;
            }
            this.customRadiusPropertyKey = this.radiusPropertyKey;
            if(settings.customRadiusProperty != null){
                this.customRadiusPropertyKey = settings.customRadiusProperty;
            }

            this.skipMiddle = false;
            if(settings.skipMiddleColor != null){
                this.skipMiddle = settings.skipMiddleColor.valueOf();
            }

            this.topMarginPercent = 10;
            if(settings.topMargin != null){
                this.topMarginPercent = settings.topMargin.valueOf();
            }
        }

        private configureColors(){
            let maxYellow = {r:251,g:255,b:7};
            let middleYellow = {r:240,g:248,b:190};
            let maxBlue = {r:0,g:0,b:255};
            let middleBlue = {r:253,g:253,b:255};
            let maxRed = {r:255,g:0,b:0};
            let middleRed = {r:253,g:253,b:225};
            let maxWhite = {r:255,g:255,b:255};
            let middleWhite = {r:240,g:240,b:240};

            this.minColor = {
                Hydropathy: maxBlue, 
                Hydrophobicity: maxBlue,
                Mutability: maxBlue, 
                Polarity: maxYellow, 
                Charge: maxRed, 
                NumPositives: maxWhite,
                NumNegatives: maxWhite
            };

            this.minColorMiddle = {
                Hydropathy: middleBlue,
                Hydrophobicity: middleBlue,
                Mutability: middleBlue, 
                Polarity: middleYellow, 
                Charge: middleRed, 
                NumPositives: middleWhite,
                NumNegatives: middleWhite
            };

            this.maxColorMiddle = {
                Hydropathy: middleYellow, 
                Hydrophobicity: middleYellow, 
                Mutability: middleRed, 
                Polarity: middleBlue, 
                Charge: middleBlue, 
                NumPositives: middleBlue,
                NumNegatives: middleRed
            };

            this.maxColor = {
                Hydropathy: maxYellow, 
                Hydrophobicity: maxYellow, 
                Mutability: maxRed, 
                Polarity: maxBlue, 
                Charge: maxBlue, 
                NumPositives: maxBlue,
                NumNegatives: maxRed
            };
        }

        public constructor(uiContainerId: string, settings: LayersVizualizerSettings) {

            //Register instance
            if(Vizualizer.ACTIVE_INSTANCES == null){
                Vizualizer.ACTIVE_INSTANCES = [];
            }
            this.publicInstanceIdx = Vizualizer.ACTIVE_INSTANCES.length;
            Vizualizer.ACTIVE_INSTANCES.push(this);

            this.uiContainerId = uiContainerId;

            this.configBySettings(settings);

            this.canvasId = "layer-vizualizer-canvas"+String(this.publicInstanceIdx);

            this.configureColors();

            this.__tunnels = {
                default:null,
                customizable:null
            }

            this.dataDirty = true;
            this.isDOMBound = false;

            this.currentLayerIdx = 0;

            this.tmpCanvasId = `tmpCanvas_${this.publicInstanceIdx}`;

            this.selectedLayerIdx = -1;

            this.__colorFunctionSetings = new Map<string,ColorPaletteFunctionSettings>();

            //Dynamic canvas resizing
            this.resizePercentPrecision = 1; //5% difference between real and given => cause resizing of canvas
            window.addEventListener("resize", this.onWindowResize.bind(this));
            $( window ).on("lvContentResize", this.onContentResize.bind(this));
        }

        public deselectLayer(){
            this.selectedLayerIdx = -1;

            let tunnels = this.getTunnels();
            if(tunnels === null){
                return;
            }

            if(tunnels.default!==null){
                tunnels.default.tunnel.deselectLayer();
            }
            if(tunnels.customizable!==null){
                tunnels.customizable.tunnel.deselectLayer();
            }
        }

        public selectLayer(layerIdx:number){        
            if(layerIdx<0){
                return
            }

            this.selectedLayerIdx = layerIdx;
            let tunnels = this.getTunnels();
            if(tunnels === null){
                return;
            }

            if(tunnels.default!==null){
                tunnels.default.tunnel.selectLayer(layerIdx);
            }
            if(tunnels.customizable!==null){
                tunnels.customizable.tunnel.selectLayer(layerIdx);
            }
        }

        public getSelectedLayer():number{
            return this.selectedLayerIdx;
        }

        public setResizePercentPrecision(percentPrecision:number){
            this.resizePercentPrecision = percentPrecision;
        }

        public getResizePercentPrecision(){
            return this.resizePercentPrecision;
        }

        public setColorBoundsMode(mode:ColorBoundsMode){
            this.useColorMinMax = (mode=="Min/max");
        }

        public rebindDOMRefs(){
            var cnvs = document.getElementById(this.canvasId);
            if(cnvs == null){
                throw new Error("Canvas element with id "+String(this.canvasId)+" not found");
            }
            this.__canvas = cnvs as HTMLCanvasElement;
            
            var cntx = this.__canvas.getContext("2d");
            if(cntx == null){
                throw new Error("Cannot obtain 2D canvas context");
            }
            this.__context = cntx;            

            this.topAirBorderHeight = ((this.__canvas.height/100)*this.topMarginPercent);

            this.isDOMBound = true;

            this.resizeCanvas();
        }

        /** Datasource change **/
        
        public setData(layersData:DataInterface.LayerData[]){
            this.currentLayerIdx = -1;
            this.selectedLayerIdx = -1;
            this.data = layersData;
            this.dataDirty = true;
        }

        public prepareData(){
            if(this.data.length == 0){
                console.log("ERR: no data supplied!");
                return;
            }

            this.maxX=this.data[this.data.length-1].EndDistance;
            this.maxY=this.data[0][this.radiusPropertyKey];
            this.customMaxY=this.data[0][this.customRadiusPropertyKey];

            let val = this.data[0].Properties[this.coloringPropertyKey];
            if(val == null){
                throw new Error("Cannot init LayerVizualizer due to invalid settings - coloringProperty: "
                    + String(this.coloringPropertyKey));
            }
            
            this.minColoringValue = new Map<string,number>();
            this.maxColoringValue = new Map<string,number>();
            for(let key in this.data[0].Properties){
                this.minColoringValue.set(key,this.data[0].Properties[key]);
                this.maxColoringValue.set(key,this.data[0].Properties[key]);
            }

            for(let i=0;i<this.data.length;i++){	                
                this.maxY=Math.max(this.maxY,this.data[i][this.radiusPropertyKey]);
                this.customMaxY=Math.max(this.customMaxY,this.data[i][this.customRadiusPropertyKey]);
                
                for(let key in this.data[i].Properties){
                    let curVal = Number(this.data[i].Properties[key]);
                    if(curVal === void 0){
                        throw new Error("Corrupted data!");
                    }

                    let oldMinVal = this.minColoringValue.get(key);
                    if(oldMinVal === void 0 || curVal.valueOf() < oldMinVal.valueOf()){
                        this.minColoringValue.set(key,curVal.valueOf());
                    }
                    let oldMaxVal = this.maxColoringValue.get(key);
                    if(oldMaxVal === void 0 || curVal.valueOf() > oldMaxVal.valueOf()){
                        this.maxColoringValue.set(key,curVal.valueOf());
                    }
                }
            }

            this.dataDirty = false;

            this.currentLayerIdx = 0;
	    }

        /** Layer vizualization **/

        private getComponentsPositioning(){
            let canvas = this.getCanvas();
            if(canvas === null || canvas === void 0){
                throw new Error("Canvas element is not bound!");
            }

            let currentWidth = canvas.width;
            let currentHeight = canvas.height;
            let colorMixerMinPxWidth = 150;
            let distanceLabelMinPxWidth = 80;

            var toRealPx = function(width:number,height:number,component:Component.Positionable){
                return component.toBounds(width,height);
            };

            var toPercent = function(width:number,height:number,realX:number,realY:number){
                return {
                    x:(realX/width)*100,
                    y:(realY/height)*100
                }
            }

            let positioning = {
                defaultTunnel: new Component.Paintable(),
                customizableTunnel: new Component.Paintable(),
                horizontalAxis: new Component.Axis(),
                verticalAxis_1: new Component.Axis(),
                verticalAxis_2: new Component.Axis(),
                defaultColorMixer: new Component.Paintable(),
                defaultColorMixerHorizontal: new Component.Paintable(),
                customizableColorMixer: new Component.Paintable(),
                customizableColorMixerHorizontal: new Component.Paintable(),
                vAxis1TopLabel: new Component.Positionable(),
                vAxis2BottomLabel: new Component.Positionable(),
                axisLeftZeroLabel: new Component.Positionable(),
                horizontalAxisRightLabel: new Component.Positionable(),
                dColorMixerTopLabel: new Component.Positionable(),
                dColorMixerBottomLabel: new Component.Positionable(),
                dColorMixerLeftLabel: new Component.Positionable(),
                dColorMixerRightLabel: new Component.Positionable(),
                cColorMixerTopLabel: new Component.Positionable(),
                cColorMixerBottomLabel: new Component.Positionable(),
                cColorMixerLeftLabel: new Component.Positionable(),
                cColorMixerRightLabel: new Component.Positionable(),
                defaultCurlyBrackets: new Component.Positionable(),
                customizableCurlyBrackets: new Component.Positionable(),
                customizableCurlyBracketsLabel: new Component.Positionable(),
                defaultCurlyBracketsLabel: new Component.Positionable(),
                defaultArrowheadLine: new Component.Positionable(),
                customizableArrowheadLine: new Component.Positionable(),
                defaultArrowheadLineLabel: new Component.Positionable(),
                customizableArrowheadLineLabel: new Component.Positionable(),
                defaultColorMixerLabel: new Component.Positionable(),
                customizableColorMixerLabel: new Component.Positionable()
            };

            let dtHeight = 30; //35
            let dtTop = 13;
            let dtmTop = 0;
            let haTop = dtTop+dtmTop+dtHeight;
            let haHeight = 10;
            let smallLabelHeight = haHeight/2;
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
                positioning.customizableTunnel.top = haTop+haHeight;
            }
            //Default Color Mixer
            {
                positioning.defaultColorMixer.left = positioning.defaultTunnel.left
                    +positioning.defaultTunnel.marginLeft
                    +positioning.defaultTunnel.width;
                positioning.defaultColorMixer.marginTop = 5;
                positioning.defaultColorMixer.marginLeft = 1;
                positioning.defaultColorMixer.width = 4;
                positioning.defaultColorMixer.height = positioning.defaultTunnel.height;
                positioning.defaultColorMixer.top = 0;
            }
            let cmhWidth = 100-(positioning.defaultColorMixer.left);
            let cmhHeight = 4;
            //Default Color Mixer -- Horizontal
            {
                positioning.defaultColorMixerHorizontal.left =  positioning.defaultTunnel.left
                    + positioning.customizableTunnel.width
                    -(cmhWidth);
                positioning.defaultColorMixerHorizontal.marginBottom = 1;
                positioning.defaultColorMixerHorizontal.width = 
                    cmhWidth;
                positioning.defaultColorMixerHorizontal.top = 
                    positioning.defaultTunnel.top
                    +positioning.defaultTunnel.marginTop
                    -(cmhHeight+1/*1=margin-bottom*/);
                positioning.defaultColorMixerHorizontal.height = cmhHeight;
            }
            //Customizable Color Mixer
            {
                positioning.customizableColorMixer.left =  positioning.defaultColorMixer.left;
                positioning.customizableColorMixer.marginBottom = 5;
                positioning.customizableColorMixer.marginLeft = 1;
                positioning.customizableColorMixer.width = positioning.defaultColorMixer.width;
                positioning.customizableColorMixer.height = positioning.defaultColorMixer.height;
                positioning.customizableColorMixer.bottom = 0;
            }
            
            //Customizable Color Mixer -- Horizontal
            {
                positioning.customizableColorMixerHorizontal.left =  positioning.customizableTunnel.left
                    + positioning.customizableTunnel.width
                    -(cmhWidth);
                positioning.customizableColorMixerHorizontal.marginTop = 1;
                positioning.customizableColorMixerHorizontal.marginBottom = 5;
                positioning.customizableColorMixerHorizontal.width = 
                    cmhWidth;
                positioning.customizableColorMixerHorizontal.top = 
                    positioning.customizableTunnel.top
                    +positioning.customizableTunnel.marginTop
                    +positioning.customizableTunnel.height;
                positioning.customizableColorMixerHorizontal.height = cmhHeight;
            }

            let colorMixerTooThin = (toRealPx(currentWidth,currentHeight,positioning.defaultColorMixerHorizontal).width < colorMixerMinPxWidth)

            if(colorMixerTooThin){
                let width = toPercent(currentWidth, currentHeight, colorMixerMinPxWidth, 0).x;
                let x = positioning.defaultColorMixerHorizontal.left + (positioning.defaultColorMixerHorizontal.width-width);
                let colorMixerComponents = [
                    positioning.defaultColorMixerHorizontal,
                    positioning.customizableColorMixerHorizontal
                    ];
                for(let component of colorMixerComponents){
                    component.left = x;
                    component.width = width;    
                }
            }

            //Horizontal Axis
            {
                positioning.horizontalAxis.left = positioning.defaultTunnel.left+positioning.defaultTunnel.marginLeft;
                positioning.horizontalAxis.top = haTop;
                positioning.horizontalAxis.marginLeft = 0;
                positioning.horizontalAxis.marginTop = 1;
                positioning.horizontalAxis.width = positioning.defaultTunnel.width;
                positioning.horizontalAxis.height = haHeight;
            }
            //Vertical Axis 1
            {
                positioning.verticalAxis_1.left = 0;
                positioning.verticalAxis_1.top = dtTop+dtmTop;
                positioning.verticalAxis_1.marginLeft = 4; //10
                positioning.verticalAxis_1.marginRight = 0;
                positioning.verticalAxis_1.width = 3;
                positioning.verticalAxis_1.height = positioning.defaultTunnel.height;
            }
            //Vertical Axis 2
            {
                positioning.verticalAxis_2.left = 0;
                positioning.verticalAxis_2.top = positioning.customizableTunnel.top+positioning.customizableTunnel.marginTop;
                positioning.verticalAxis_2.marginLeft = positioning.verticalAxis_1.marginLeft;
                positioning.verticalAxis_2.marginRight = 0;
                positioning.verticalAxis_2.width = 3;
                positioning.verticalAxis_2.height = positioning.verticalAxis_1.height;
            }
            let bigLabelHeight = positioning.horizontalAxis.height-(positioning.horizontalAxis.height/8)*2;
            //Left Common Axis Label
            {
                positioning.axisLeftZeroLabel.left = 0;
                positioning.axisLeftZeroLabel.marginLeft = 0;
                positioning.axisLeftZeroLabel.top = positioning.horizontalAxis.top
                    +((positioning.horizontalAxis.marginTop===void 0)?0:positioning.horizontalAxis.marginTop);
                positioning.axisLeftZeroLabel.marginTop = 
                    Math.abs(bigLabelHeight-positioning.horizontalAxis.height)/2;
                
                positioning.axisLeftZeroLabel.width = positioning.horizontalAxis.left-1;
                positioning.axisLeftZeroLabel.height = bigLabelHeight;
            }
            //Right Horizontal Axis Label
            {
                positioning.horizontalAxisRightLabel.left = positioning.horizontalAxis.left+positioning.horizontalAxis.width + positioning.horizontalAxis.marginLeft;
                positioning.horizontalAxisRightLabel.marginLeft = positioning.defaultColorMixer.marginLeft;
                positioning.horizontalAxisRightLabel.top = positioning.axisLeftZeroLabel.top;
                positioning.horizontalAxisRightLabel.marginTop = positioning.axisLeftZeroLabel.marginTop;
                
                positioning.horizontalAxisRightLabel.width = 100-(positioning.horizontalAxisRightLabel.left+positioning.horizontalAxisRightLabel.marginLeft);
                positioning.horizontalAxisRightLabel.height = positioning.axisLeftZeroLabel.height;
            }
            //Top Default Tunnel Vertical Axis Label
            {
                positioning.vAxis1TopLabel.left = 0;
                positioning.vAxis1TopLabel.marginLeft = 0;
                positioning.vAxis1TopLabel.top = positioning.defaultTunnel.top
                    -positioning.axisLeftZeroLabel.height/2;
                positioning.vAxis1TopLabel.marginTop = 0;

                positioning.vAxis1TopLabel.width = positioning.verticalAxis_1.marginLeft
                    +((positioning.verticalAxis_1.left===void 0)?0:positioning.verticalAxis_1.left);
                positioning.vAxis1TopLabel.height = positioning.axisLeftZeroLabel.height;
            }
            //Bottom Customizable Tunnel Vertical Axis Label
            {
                positioning.vAxis2BottomLabel.left = 0;
                positioning.vAxis2BottomLabel.marginLeft = 0;
                positioning.vAxis2BottomLabel.bottom = 100
                    -(positioning.customizableTunnel.top+positioning.customizableTunnel.marginTop
                    +positioning.customizableTunnel.height+positioning.axisLeftZeroLabel.height/2);
                positioning.vAxis2BottomLabel.marginBottom = 0;

                positioning.vAxis2BottomLabel.width = positioning.verticalAxis_2.marginLeft
                    +((positioning.verticalAxis_2.left===void 0)?0:positioning.verticalAxis_2.left);;
                positioning.vAxis2BottomLabel.height = positioning.axisLeftZeroLabel.height;
            }
            //Top Default Color Mixer Label
            {
                positioning.dColorMixerTopLabel.left = positioning.defaultColorMixer.left
                    +positioning.defaultColorMixer.marginLeft
                    +positioning.defaultColorMixer.width;
                positioning.dColorMixerTopLabel.marginLeft = 1;
                positioning.dColorMixerTopLabel.top = positioning.defaultTunnel.top
                    +positioning.defaultTunnel.marginTop;
                positioning.dColorMixerTopLabel.marginTop = 0;

                positioning.dColorMixerTopLabel.width = 100 
                    - (positioning.defaultColorMixer.left
                        + positioning.defaultColorMixer.marginLeft
                        + positioning.defaultColorMixer.width
                        + positioning.dColorMixerTopLabel.marginLeft);
                positioning.dColorMixerTopLabel.height = positioning.axisLeftZeroLabel.height;
            }
            //Bottom Default Color Mixer Label
            {
                positioning.dColorMixerBottomLabel.left = positioning.dColorMixerTopLabel.left;
                positioning.dColorMixerBottomLabel.marginLeft = positioning.dColorMixerTopLabel.marginLeft;
                positioning.dColorMixerBottomLabel.top = 
                    ((positioning.defaultTunnel.top===void 0)?0:positioning.defaultTunnel.top) 
                    +positioning.defaultTunnel.marginTop
                    +positioning.defaultTunnel.height
                    -(positioning.axisLeftZeroLabel.height);

                positioning.dColorMixerBottomLabel.width = positioning.dColorMixerTopLabel.width;
                positioning.dColorMixerBottomLabel.height = positioning.axisLeftZeroLabel.height;
            }
            //Left Default Color Mixer Label
            {
                positioning.dColorMixerLeftLabel.left = positioning.defaultColorMixerHorizontal.left;
                positioning.dColorMixerLeftLabel.marginLeft = positioning.defaultColorMixerHorizontal.marginLeft;
                positioning.dColorMixerLeftLabel.top = positioning.defaultColorMixerHorizontal.top 
                    - (smallLabelHeight+1.5); 
                positioning.dColorMixerLeftLabel.marginTop = 0;

                positioning.dColorMixerLeftLabel.width = positioning.defaultColorMixerHorizontal.width/2;
                positioning.dColorMixerLeftLabel.height = smallLabelHeight;
            }
            //Right Default Color Mixer Label
            {
                positioning.dColorMixerRightLabel.left = positioning.defaultColorMixerHorizontal.left
                    +positioning.defaultColorMixerHorizontal.width-positioning.dColorMixerLeftLabel.width;
                positioning.dColorMixerRightLabel.marginRight = positioning.dColorMixerLeftLabel.marginLeft;
                positioning.dColorMixerRightLabel.top = positioning.dColorMixerLeftLabel.top;
                positioning.dColorMixerRightLabel.marginTop = positioning.dColorMixerLeftLabel.marginTop;

                positioning.dColorMixerRightLabel.width = positioning.dColorMixerLeftLabel.width;
                positioning.dColorMixerRightLabel.height = positioning.dColorMixerLeftLabel.height;
            }

            //Top Customizable Color Mixer Label
            {
                positioning.cColorMixerTopLabel.left = positioning.dColorMixerTopLabel.left;
                positioning.cColorMixerTopLabel.marginLeft = positioning.dColorMixerTopLabel.marginLeft;
                positioning.cColorMixerTopLabel.bottom = 
                    ((positioning.customizableTunnel.bottom===void 0)?0:positioning.customizableTunnel.bottom)
                    +positioning.customizableTunnel.height
                    -(positioning.axisLeftZeroLabel.height);
                positioning.cColorMixerTopLabel.marginBottom = 0;

                positioning.cColorMixerTopLabel.width = positioning.dColorMixerTopLabel.width;
                positioning.cColorMixerTopLabel.height = positioning.axisLeftZeroLabel.height;
            }
            //Bottom Customizable Color Mixer Label
            {
                positioning.cColorMixerBottomLabel.left = positioning.dColorMixerTopLabel.left;
                positioning.cColorMixerBottomLabel.marginLeft = positioning.dColorMixerTopLabel.marginLeft;
                positioning.cColorMixerBottomLabel.bottom = positioning.customizableTunnel.bottom;
                positioning.cColorMixerBottomLabel.marginBottom = positioning.customizableTunnel.marginBottom;

                positioning.cColorMixerBottomLabel.width = positioning.dColorMixerTopLabel.width;
                positioning.cColorMixerBottomLabel.height = positioning.axisLeftZeroLabel.height;
            }
            //Left Customizable Color Mixer Label
            {
                positioning.cColorMixerLeftLabel.left = positioning.customizableColorMixerHorizontal.left;
                positioning.cColorMixerLeftLabel.marginLeft = positioning.customizableColorMixerHorizontal.marginLeft;
                positioning.cColorMixerLeftLabel.top = positioning.customizableColorMixerHorizontal.top 
                    + positioning.customizableColorMixerHorizontal.height
                    + positioning.customizableColorMixerHorizontal.marginTop;
                positioning.cColorMixerLeftLabel.marginTop = 2;

                positioning.cColorMixerLeftLabel.width = positioning.customizableColorMixerHorizontal.width/2;
                positioning.cColorMixerLeftLabel.height = smallLabelHeight;
            }
            //Right Customizable Color Mixer Label
            {
                positioning.cColorMixerRightLabel.left = positioning.customizableColorMixerHorizontal.left
                    +positioning.customizableColorMixerHorizontal.width-positioning.cColorMixerLeftLabel.width;
                positioning.cColorMixerRightLabel.marginRight = positioning.cColorMixerLeftLabel.marginLeft;
                positioning.cColorMixerRightLabel.top = positioning.cColorMixerLeftLabel.top;
                positioning.cColorMixerRightLabel.marginTop = positioning.cColorMixerLeftLabel.marginTop;

                positioning.cColorMixerRightLabel.width = positioning.cColorMixerLeftLabel.width;
                positioning.cColorMixerRightLabel.height = positioning.cColorMixerLeftLabel.height;
            }
            //Curly brackets for default tunnel
            {
                positioning.defaultCurlyBrackets.left = positioning.defaultTunnel.left
                    +positioning.defaultTunnel.marginLeft+positioning.defaultTunnel.width;
                positioning.defaultCurlyBrackets.marginLeft = 0.3;
                positioning.defaultCurlyBrackets.top = dtTop;
                positioning.defaultCurlyBrackets.width = 1;
                positioning.defaultCurlyBrackets.height = dtHeight;
            }
            //Curly brackets for customizable tunnel
            {
                positioning.customizableCurlyBrackets.left = positioning.defaultTunnel.left
                    +positioning.defaultTunnel.marginLeft+positioning.defaultTunnel.width;
                positioning.customizableCurlyBrackets.marginLeft = 0.3;
                positioning.customizableCurlyBrackets.top = haTop+haHeight
                    +positioning.customizableTunnel.marginTop;
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
                    + positioning.defaultCurlyBrackets.height/2-smallLabelHeight/2;
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
                    + positioning.customizableCurlyBrackets.height/2-smallLabelHeight/2;
                positioning.customizableCurlyBracketsLabel.width = 100 - positioning.customizableCurlyBracketsLabel.left;
                positioning.customizableCurlyBracketsLabel.height = smallLabelHeight
            }
            let ahLineHeight = 4;
            let ahLineVerticalMargin = 1.5;
            let ahLineWidth = dtWidth/2; 
            //Arrowhead line for default tunnel
            {
                positioning.defaultArrowheadLine.left = positioning.defaultTunnel.left
                    +positioning.defaultTunnel.marginLeft+dtWidth/4 //2
                    -(ahLineWidth)/2;
                positioning.defaultArrowheadLine.top = dtTop-ahLineHeight-ahLineVerticalMargin;
                positioning.defaultArrowheadLine.width = ahLineWidth;
                positioning.defaultArrowheadLine.height = ahLineHeight;
            }
            //Arrowhead line for customizable tunnel
            {
                positioning.customizableArrowheadLine.left = positioning.defaultArrowheadLine.left;
                positioning.customizableArrowheadLine.marginTop = ahLineVerticalMargin;
                positioning.customizableArrowheadLine.top = positioning.customizableTunnel.top
                    +positioning.customizableTunnel.marginTop
                    +positioning.customizableTunnel.height;
                positioning.customizableArrowheadLine.width = ahLineWidth;
                positioning.customizableArrowheadLine.height = ahLineHeight;
            }
            let ahLineLabelWidth = ahLineWidth/4;
            //Arrowhead line Label for default tunnel
            {
                positioning.defaultArrowheadLineLabel.left = positioning.customizableArrowheadLine.left
                    +ahLineWidth/2-ahLineLabelWidth/2;
                positioning.defaultArrowheadLineLabel.top = positioning.defaultArrowheadLine.top;
                positioning.defaultArrowheadLineLabel.width = ahLineLabelWidth;
                positioning.defaultArrowheadLineLabel.height = ahLineHeight;
            }
            //Arrowhead line Label for customizable tunnel
            {
                positioning.customizableArrowheadLineLabel.left = positioning.customizableArrowheadLine.left
                    +ahLineWidth/2-ahLineLabelWidth/2;
                positioning.customizableArrowheadLineLabel.top = positioning.customizableArrowheadLine.top
                    +positioning.customizableArrowheadLine.marginTop;
                positioning.customizableArrowheadLineLabel.width = ahLineLabelWidth;
                positioning.customizableArrowheadLineLabel.height = ahLineHeight;
            }
            let cmLabelWidth = positioning.defaultColorMixerHorizontal.width/2.5;
            let cmLabelHeight = positioning.defaultColorMixerHorizontal.height;
            //Color mixer Label for default tunnel
            {
                positioning.defaultColorMixerLabel.left = positioning.defaultColorMixerHorizontal.left
                    +positioning.defaultColorMixerHorizontal.width/2-cmLabelWidth/2;
                positioning.defaultColorMixerLabel.top = positioning.dColorMixerLeftLabel.top;
                positioning.defaultColorMixerLabel.width = cmLabelWidth;
                positioning.defaultColorMixerLabel.height = cmLabelHeight;
            }
            //Color mixer Label for customizable tunnel
            {
                positioning.customizableColorMixerLabel.left = positioning.defaultColorMixerHorizontal.left
                    +positioning.defaultColorMixerHorizontal.width/2-cmLabelWidth/2;
                positioning.customizableColorMixerLabel.marginTop = 0.5;
                positioning.customizableColorMixerLabel.top = positioning.cColorMixerLeftLabel.top
                    +positioning.cColorMixerLeftLabel.marginTop;
                positioning.customizableColorMixerLabel.width = cmLabelWidth;
                positioning.customizableColorMixerLabel.height = cmLabelHeight;
            }

            if(colorMixerTooThin){
                let emptySpaceX = positioning.defaultColorMixerHorizontal.left - positioning.defaultTunnel.left - 2;
                let fallDownLeft = positioning.defaultTunnel.left;

                let distanceLabelComponents = [
                    positioning.defaultArrowheadLine,
                    positioning.customizableArrowheadLine
                    ];

                for(let component of distanceLabelComponents){
                    component.width = emptySpaceX;
                    component.left = positioning.defaultTunnel.left + emptySpaceX/2 - component.width/2;
                    if(component.left<fallDownLeft){
                        component.left = fallDownLeft;
                    }
                }
                
                let labelX = (positioning.defaultArrowheadLine.left===void 0)?0:positioning.defaultArrowheadLine.left;
                let labelWidth = (positioning.defaultArrowheadLine.width===void 0)?0:positioning.defaultArrowheadLine.width;

                let distanceLabelTextComponents = [
                    positioning.defaultArrowheadLineLabel,
                    positioning.customizableArrowheadLineLabel
                ];

                for(let component of distanceLabelTextComponents){
                    let cWidth = (component.width===void 0)?0:component.width;
                    component.left = labelX+labelWidth/2 - cWidth/2;
                }
            }

            return positioning;
        }

        private prepareLayersForVizualization():{defaultTunnelLayers:any,customizableTunnelLayers:any}{
            let defaultTunnelLayers = [];
            let customizableTunnelLayers = [];
            for(var i=0;i<this.data.length;i++){
                let defaultTunnelLayer = {
                    id: i, 
                    start: this.data[i].StartDistance, 
                    end: this.data[i].EndDistance, 
                    value: Number(this.data[i].Properties[this.coloringPropertyKey]).valueOf(),
                    radius: this.data[i][this.radiusPropertyKey]
                };
                let customizableTunnelLayer = {
                    id: i, 
                    start: this.data[i].StartDistance, 
                    end: this.data[i].EndDistance, 
                    value: Number(this.data[i].Properties[this.customColoringPropertyKey]).valueOf(),
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

        private getMaxY(realMaxYValue:number){
            let maxY = Math.ceil(realMaxYValue);
            let chunkSize = maxY/this.verticalAxisChunkCount;
            if(maxY-realMaxYValue<chunkSize/2){
                maxY+=Math.ceil(chunkSize/2);
            }
            return maxY;
        }

        private prepareTunnelObject(minVal:number,maxVal:number,center:number,context:CanvasRenderingContext2D,tunnelLayers:any,isDefaultTunnel:boolean):{tunnel:Tunnel,colorFunctionSettings:any}{
            let coloringProperty = ((isDefaultTunnel)?this.coloringPropertyKey:this.customColoringPropertyKey) as PropertyKey;
            let colorFunctionSettings = {
                        minVal: minVal,
                        maxVal: maxVal,
                        minColor: this.minColor[coloringProperty],
                        maxColor: this.maxColor[coloringProperty],
                        minColorMiddle: this.minColorMiddle[coloringProperty],
                        maxColorMiddle: this.maxColorMiddle[coloringProperty],
                        skipMiddle: (coloringProperty=="NumPositives" || coloringProperty=="NumNegatives")
                            ?true
                            :this.skipMiddle,
                        centerPosition: center,
                        centerAbsolute: (coloringProperty=="NumPositives" || coloringProperty=="NumNegatives")
                            ?false
                            :!this.useColorMinMax
                    };

            let maxY = this.getMaxY((isDefaultTunnel)?this.maxY:this.customMaxY);

            return {
                tunnel: new Tunnel(
                        {
                            x:0,
                            y:0
                        }, 
                        {
                            x:this.maxX, 
                            y:maxY
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

        private renderObjects(renderable:{drawable:ContextAwareObject,bounds:{x:number,y:number,width:number,height:number}}[]){
            for(let obj of renderable){
                obj.drawable.drawFromBounds(obj.bounds);
            }
        }

        public vizualize(renderHitboxes = true){
            
            this.resizeCanvas();

            let canvasWidth = this.getCanvas().width;
            let canvasHeight = this.getCanvas().height;
            let context = this.getContext();

            //console.log(canvasWidth);
            //console.log(canvasHeight);

            let toRender = [];

            //Data was not prepared yet
            if(this.dataDirty){
                this.prepareData();
            }

            //Prepare layers data
            let layers = this.prepareLayersForVizualization();

            let maxDistance = layers.defaultTunnelLayers[layers.defaultTunnelLayers.length-1].end;
            maxDistance = CommonUtils.Numbers.roundToDecimal(maxDistance,1); // round to 1 decimal

            let positioning = this.getComponentsPositioning();
            
            //Prepare default tunnel object
            let dTminVal = (this.useColorMinMax)?this.minColoringValue.get(this.coloringPropertyKey):this.absColorValueMin.get(this.coloringPropertyKey);
            if(dTminVal == void 0){
                throw Error("Minimal value for property '"+this.coloringPropertyKey+"' was not found!");
            }
            let dTmaxVal = (this.useColorMinMax)?this.maxColoringValue.get(this.coloringPropertyKey):this.absColorValueMax.get(this.coloringPropertyKey);
            if(dTmaxVal == void 0){
                throw Error("Maximal value for property '"+this.coloringPropertyKey+"' was not found!");
            }

            let dTcenter = this.absCenterPositions.get(this.coloringPropertyKey as PropertyKey);
            if(dTcenter===void 0){
                dTcenter = 0;
            }
            let defaultTunnelData = this.prepareTunnelObject(dTminVal,dTmaxVal,dTcenter,context,layers.defaultTunnelLayers,true);
            let defaultTunnelBounds = positioning.defaultTunnel.toBounds(canvasWidth,canvasHeight);
            toRender.push({
                drawable: defaultTunnelData.tunnel,
                bounds: defaultTunnelBounds
            });

            //Prepare customizable tunnel object
            let cTminVal = (this.useColorMinMax)?this.minColoringValue.get(this.customColoringPropertyKey):this.absColorValueMin.get(this.customColoringPropertyKey);
            if(cTminVal == void 0){
                throw Error("Minimal value for property '"+this.customColoringPropertyKey+"' was not found!");
            }
            let cTmaxVal = (this.useColorMinMax)?this.maxColoringValue.get(this.customColoringPropertyKey):this.absColorValueMax.get(this.customColoringPropertyKey);
            if(cTmaxVal == void 0){
                throw Error("Maximal value for property '"+this.customColoringPropertyKey+"' was not found!");
            }
            
            let cTcenter = this.absCenterPositions.get(this.customColoringPropertyKey as PropertyKey);
            if(cTcenter===void 0){
                cTcenter = 0;
            }
            let customizableTunnelData = this.prepareTunnelObject(cTminVal,cTmaxVal,cTcenter,context,layers.customizableTunnelLayers,false);
            let customizableTunnelBounds = positioning.customizableTunnel.toBounds(canvasWidth,canvasHeight);
            toRender.push({
                drawable: customizableTunnelData.tunnel,
                bounds: customizableTunnelBounds
            });

            this.__tunnels.default = {
                tunnel: defaultTunnelData.tunnel,
                bounds: defaultTunnelBounds
            };

            this.__tunnels.customizable = {
                tunnel: customizableTunnelData.tunnel,
                bounds: customizableTunnelBounds
            };

            //console.log(this.__tunnels);

            //Prepare color mixer objects

            //Color mixer for default tunnel
            /* //Vertical
            toRender.push({
                drawable: new ColorMixer(dTminVal,dTmaxVal,context,this.getColor,defaultTunnelData.colorFunctionSettings),
                bounds: positioning.defaultColorMixer.toBounds(canvasWidth,canvasHeight)   
            });
            */
            //Horizontal
            toRender.push({
                drawable: new ColorMixer(dTminVal,dTmaxVal,context,this.getColor,defaultTunnelData.colorFunctionSettings,true),
                bounds: positioning.defaultColorMixerHorizontal.toBounds(canvasWidth,canvasHeight)   
            });
            //Color mixer for customizable tunnel
            /* //Vertical
            toRender.push({
                drawable: new ColorMixer(cTminVal,cTmaxVal,context,this.getColor,customizableTunnelData.colorFunctionSettings),
                bounds: positioning.customizableColorMixer.toBounds(canvasWidth,canvasHeight)   
            });
            */
            //Horizontal
            toRender.push({
                drawable: new ColorMixer(cTminVal,cTmaxVal,context,this.getColor,customizableTunnelData.colorFunctionSettings,true),
                bounds: positioning.customizableColorMixerHorizontal.toBounds(canvasWidth,canvasHeight)   
            });

            //Prepare horizontal axis
            toRender.push({
                drawable: new Axis(0,this.maxX,context,10,true,20,1.6),
                bounds: positioning.horizontalAxis.toBounds(canvasWidth,canvasHeight)   
            });
            
            //Prepare vertical axis
            toRender.push({
                drawable: new Axis(0,this.getMaxY(this.maxY),context,this.verticalAxisChunkCount,false,30,1.6),
                bounds: positioning.verticalAxis_1.toBounds(canvasWidth,canvasHeight)   
            });
            toRender.push({
                drawable: new Axis(0,this.getMaxY(this.customMaxY),context,this.verticalAxisChunkCount,false,30,1.6),
                bounds: positioning.verticalAxis_2.toBounds(canvasWidth,canvasHeight)   
            });

            //Prepare labels

            // Label on left side of horizontal axis
            toRender.push({
                drawable: new TextBox("0 Å",context,"big","right"),
                bounds: positioning.axisLeftZeroLabel.toBounds(canvasWidth,canvasHeight)   
            });
            // Label on right side of horizontal axis
            toRender.push({
                drawable: new TextBox(`${maxDistance} Å`,context,"big","left"),
                bounds: positioning.horizontalAxisRightLabel.toBounds(canvasWidth,canvasHeight)   
            });
            // Label on top left side of vertical axis for default tunnel
            toRender.push({
                drawable: new TextBox(`${this.getMaxY(this.maxY)} Å`,context,"medium","right"),
                bounds: positioning.vAxis1TopLabel.toBounds(canvasWidth,canvasHeight)   
            });
            // Label on bottom left side of vertical axis for customizable tunnel
            toRender.push({
                drawable: new TextBox(`${this.getMaxY(this.customMaxY)} Å`,context,"medium","right"),
                bounds: positioning.vAxis2BottomLabel.toBounds(canvasWidth,canvasHeight)   
            });
            /*
            // Label on top right side of color mixer for default tunnel
            toRender.push({
                drawable: new TextBox(`${dTmaxVal}`,context,"medium","left"),
                bounds: positioning.dColorMixerTopLabel.toBounds(canvasWidth,canvasHeight)   
            });
            // Label on bottom right side of color mixer for default tunnel
            toRender.push({
                drawable: new TextBox(`${dTminVal}`,context,"medium","left"),
                bounds: positioning.dColorMixerBottomLabel.toBounds(canvasWidth,canvasHeight)   
            });
            */
            // Label on top left side of color mixer for default tunnel
            toRender.push({
                drawable: new TextBox(`${CommonUtils.Numbers.roundToDecimal(dTminVal,2)}`,context,"small","left"),
                bounds: positioning.dColorMixerLeftLabel.toBounds(canvasWidth,canvasHeight)   
            });
            // Label on top right side of color mixer for default tunnel
            toRender.push({
                drawable: new TextBox(`${CommonUtils.Numbers.roundToDecimal(dTmaxVal,2)}`,context,"small","right"),
                bounds: positioning.dColorMixerRightLabel.toBounds(canvasWidth,canvasHeight)   
            });
            /*
            // Label on top right side of color mixer for customizable tunnel
            toRender.push({
                drawable: new TextBox(`${cTmaxVal}`,context,"medium","left"),
                bounds: positioning.cColorMixerTopLabel.toBounds(canvasWidth,canvasHeight)   
            });
            // Label on bottom right side of color mixer for customizable tunnel
            toRender.push({
                drawable: new TextBox(`${cTminVal}`,context,"medium","left"),
                bounds: positioning.cColorMixerBottomLabel.toBounds(canvasWidth,canvasHeight)   
            });
            */
            // Label on bottom left side of color mixer for customizable tunnel
            toRender.push({
                drawable: new TextBox(`${CommonUtils.Numbers.roundToDecimal(cTminVal,2)}`,context,"small","left"),
                bounds: positioning.cColorMixerLeftLabel.toBounds(canvasWidth,canvasHeight)   
            });
            // Label on bottom right side of color mixer for customizable tunnel
            toRender.push({
                drawable: new TextBox(`${CommonUtils.Numbers.roundToDecimal(cTmaxVal,2)}`,context,"small","right"),
                bounds: positioning.cColorMixerRightLabel.toBounds(canvasWidth,canvasHeight)   
            });
            // Curly brackets for default tunnel
            toRender.push({
                drawable: new CurlyBrackets(context/*,true*/),
                bounds: positioning.defaultCurlyBrackets.toBounds(canvasWidth,canvasHeight)   
            });
            // Curly brackets Label for default tunnel
            toRender.push({
                drawable: new TextBox(`${this.radiusPropertyKey}`,context,"small","left"),
                bounds: positioning.defaultCurlyBracketsLabel.toBounds(canvasWidth,canvasHeight)   
            });
            // Curly brackets for customizable tunnel
            toRender.push({
                drawable: new CurlyBrackets(context/*,true*/),
                bounds: positioning.customizableCurlyBrackets.toBounds(canvasWidth,canvasHeight)   
            });
            // Curly brackets Label for customizable tunnel
            toRender.push({
                drawable: new TextBox(`${this.customRadiusPropertyKey}`,context,"small","left"),
                bounds: positioning.customizableCurlyBracketsLabel.toBounds(canvasWidth,canvasHeight)   
            });
            // Arrowhead line for default tunnel
            toRender.push({
                drawable: new ArrowHeadLine(context,true),
                bounds: positioning.defaultArrowheadLine.toBounds(canvasWidth,canvasHeight)   
            });
            // Arrowhead line Label for default tunnel
            toRender.push({
                drawable: new TextBox(`Distance`,context,"small","center"),
                bounds: positioning.defaultArrowheadLineLabel.toBounds(canvasWidth,canvasHeight)   
            });
            // Arrowhead line for customizable tunnel
            toRender.push({
                drawable: new ArrowHeadLine(context,true),
                bounds: positioning.customizableArrowheadLine.toBounds(canvasWidth,canvasHeight)   
            });
            // Arrowhead line Label for customizable tunnel
            toRender.push({
                drawable: new TextBox(`Distance`,context,"small","center"),
                bounds: positioning.customizableArrowheadLineLabel.toBounds(canvasWidth,canvasHeight)   
            });
            // Default color mixer Label
            toRender.push({
                drawable: new TextBox(`${this.coloringPropertyKey}`,context,"small","center"),
                bounds: positioning.defaultColorMixerLabel.toBounds(canvasWidth,canvasHeight)   
            });
            // Customizable color mixer Label
            toRender.push({
                drawable: new TextBox(`${this.customColoringPropertyKey}`,context,"small","center"),
                bounds: positioning.customizableColorMixerLabel.toBounds(canvasWidth,canvasHeight)   
            });
            this.renderObjects(toRender);
            
            if(this.selectedLayerIdx !== -1){
                this.selectLayer(this.selectedLayerIdx);
            }

            this.setCurrentColorFunctionSettings("default",defaultTunnelData.colorFunctionSettings);
            this.setCurrentColorFunctionSettings("customizable",customizableTunnelData.colorFunctionSettings);
        }

        private switchToMainCanvas(){
            let tmpCanvas = document.getElementById(this.tmpCanvasId);
            if(tmpCanvas!==null){
                tmpCanvas.remove();
            }

            this.rebindDOMRefs();
            this.vizualize();
            this.highlightHitbox(this.currentLayerIdx);
        }

        private switchToTmpCanvas(){
            let canvas = this.getCanvas();
            if(canvas.id === this.tmpCanvasId){
                throw new Error("Trying to switch to tmp canvas from tmp canvas! Maybe forgotten SwitchToMain(..)?");
            }

            let tmpCanvas = document.createElement("canvas");
            tmpCanvas.style.position="absolute";
            tmpCanvas.style.top="-1000px";
            tmpCanvas.id = this.tmpCanvasId;

            tmpCanvas.width = canvas.width;
            tmpCanvas.height = canvas.height;

            document.body.appendChild(tmpCanvas);

            let oldCtx = this.getContext();
            let tmpCtx = tmpCanvas.getContext("2d") as CanvasRenderingContext2D;
            if(tmpCtx===null){
                throw new Error("Unable initiate new 2D canvas context");
            }
            
            this.__context = tmpCtx;
            this.__canvas = tmpCanvas;
        }

        private wrapSVG(){
            var canvas = this.getCanvas();
            var ctx = new C2S(canvas.width,canvas.height);

            if(ctx === null){
                throw new Error("Unable to initialize new drawing context!");
            }
            this.__context = ctx;
        }

        private unwrapSVG(){
            let ctx = this.getCanvas().getContext("2d");
            if(ctx === null){
                throw new Error("Unable to initialize new drawing context!");
            }

            this.__context = ctx;
        }

        public exportImage():DataURL{
            if(!this.isDOMBound||this.isDataDirty()){
                throw new Error("Data not prepared!");
            }
            
            //Deselekce vrstvy
            let selectedLayer = -1;
            if(this.selectedLayerIdx !== -1){
                selectedLayer = this.selectedLayerIdx;
                this.deselectLayer();
            }

            this.switchToTmpCanvas();

            this.vizualize();
            
            let dataURL = this.getCanvas().toDataURL("image/png");

            this.switchToMainCanvas();

            //Opetovne oznaceni vrstvy(stav pred exportem)
            this.selectLayer(selectedLayer);

            return dataURL;
        }

        private getSVGDataURL(){
            let svg = this.getSVGData();

            let xmlSerializer = new XMLSerializer();
            let serializedSVG = `<?xml version="1.0" encoding="utf-8"?>${xmlSerializer.serializeToString(svg)}`;
            serializedSVG = utf8.encode(serializedSVG);

            return `data:image/svg+xml;charset=utf-8;base64,${btoa(serializedSVG)}`;
        }

        private getSVGData(){
            let ctx = this.getContext() as CanvasRenderingContext2D & {getSvg: () => XMLDocument,getSerializedSvg: ()=>boolean};
            ctx.getSerializedSvg();
            
            let svg = ctx.getSvg();
            svg.charset="UTF-8";

            return svg;
        }

        public exportSVGImage():string{
            if(!this.isDOMBound||this.isDataDirty()){
                throw new Error("Data not prepared!");
            }
            
            //Deselekce vrstvy
            let selectedLayer = -1;
            if(this.selectedLayerIdx !== -1){
                selectedLayer = this.selectedLayerIdx;
                this.deselectLayer();
            }

            this.switchToTmpCanvas();
            this.wrapSVG();

            this.vizualize();
            
            let svg = this.getSVGDataURL();

            this.unwrapSVG();
            this.switchToMainCanvas();

            //Opetovne oznaceni vrstvy(stav pred exportem)
            this.selectLayer(selectedLayer);

            return svg;
        }

        public exportPDF():string{

            if(!this.isDOMBound||this.isDataDirty()){
                throw new Error("Data not prepared!");
            }

            //Deselekce vrstvy
            let selectedLayer = -1;
            if(this.selectedLayerIdx !== -1){
                selectedLayer = this.selectedLayerIdx;
                this.deselectLayer();
            }

            this.switchToTmpCanvas();
            this.wrapSVG();

            let canvas = this.getCanvas();
            if(canvas === void 0 || canvas === null){
                throw new Error("Canvas element not initiated");
            }
            let width = canvas.width;
            let height = canvas.height;

            this.vizualize();
            
            let svg = this.getSVGData();

            this.unwrapSVG();
            this.switchToMainCanvas();

            // create a new jsPDF instance
            var pdf = new jsPDF('p', 'pt', [width,height]);
            pdf.setProperties({
                title: "Report"
            });
            //console.log(svg);
            
            //pdf.addImage(this.exportSVGImage(),0,0,200,500);
            //pdf.addSVG(svg,0,0,width,height);
            // render the svg element
            
            svg2pdf(svg, pdf, {
                xOffset: 0,
                yOffset: 0,
                scale: 1
            });
            
            
            //pdf.addSVG(svg, 0, 0, width, height);

            //Opetovne oznaceni vrstvy(stav pred exportem)
            this.selectLayer(selectedLayer);

            return pdf.output('datauristring');
        }

        public setCustomColoringPropertyKey(coloringPropertyKey:string){
            this.customColoringPropertyKey = coloringPropertyKey;
        }

        public getCustomColoringPropertyKey(){
            return this.customColoringPropertyKey;
        }

        public setColoringPropertyKey(coloringPropertyKey:string){
            this.coloringPropertyKey = coloringPropertyKey;
        }

        public getColoringPropertyKey(){
            return this.coloringPropertyKey;
        }

        public setCustomRadiusPropertyKey(radiusPropertyKey:RadiusProperty){
            if(this.customRadiusPropertyKey !== radiusPropertyKey){
                this.customRadiusPropertyKey = radiusPropertyKey;
                this.dataDirty = true;
            }
        }

        public getCustomRadiusPropertyKey(){
            return this.customRadiusPropertyKey;
        }

        public setRadiusPropertyKey(radiusPropertyKey:RadiusProperty){
            if(this.radiusPropertyKey !== radiusPropertyKey){
                this.radiusPropertyKey = radiusPropertyKey;
                this.dataDirty = true;
            }
        }

        public getRadiusPropertyKey(){
            return this.radiusPropertyKey;
        }

        public getHitboxes(){
            let tunnels = this.getTunnels();
            if(tunnels === null){
                return null;
            }

            return {
                defaultTunnel: (tunnels.default!==null)
                    ?tunnels.default.tunnel.getHitboxes()
                    :null,
                customizable: (tunnels.customizable!==null)
                    ?tunnels.customizable.tunnel.getHitboxes()
                    :null,
            }
        }
        
        public renderHitboxes(){
            //Data was not prepared yet
            if(this.dataDirty){
                this.prepareData();
            }
   
            let tunnels = this.getTunnels();
            if(tunnels === null){
                return [];
            }

            if(tunnels.default!==null){
                tunnels.default.tunnel.renderHitboxes();
            }
            if(tunnels.customizable!==null){
                tunnels.customizable.tunnel.renderHitboxes();
            }
        }

        public highlightHitbox(layerIdx: number){
            if(layerIdx<0){
                return
            }
            this.currentLayerIdx = layerIdx;
            let tunnels = this.getTunnels();
            if(tunnels === null){
                return;
            }

            if(tunnels.default!==null){
                tunnels.default.tunnel.highlightHitbox(layerIdx);
            }
            if(tunnels.customizable!==null){
                tunnels.customizable.tunnel.highlightHitbox(layerIdx);
            }
        }

        /** Helpers **/
        
        public getColor(value: number, settings: ColorPaletteFunctionSettings){
            let minVal = settings.minVal;
            let maxVal = settings.maxVal;
            let minColor = settings.minColor;
            let maxColor = settings.maxColor;
            let minColorMiddle = settings.minColorMiddle;
            let maxColorMiddle = settings.maxColorMiddle;
            let skipMiddle = settings.skipMiddle;
            let middle = (settings.centerAbsolute)?settings.centerPosition:(minVal+maxVal)/2;

            var rgb: RGBColor;

            if(value<(minVal+maxVal)/2){
                rgb = ChannelDbPlugin.Palette.interpolate(minVal,minColor,middle,maxColorMiddle,value);
            }
            else{
                rgb = ChannelDbPlugin.Palette.interpolate(middle,minColorMiddle,maxVal,maxColor,value);
            }

            if(skipMiddle&&settings.centerAbsolute){
                throw new Error("Cannot config absolute center and skip center at once! Forbidden configuration -> skipMiddle=true && centerAbsolute=true");
            }
            if(skipMiddle&&!settings.centerAbsolute){
                rgb = ChannelDbPlugin.Palette.interpolate(minVal,minColor,maxVal,maxColor,value);
            }

            if(minVal === maxVal){
                rgb = ChannelDbPlugin.Palette.interpolate(0,minColor,1,maxColorMiddle,0.5);
            }

            return "rgb("+String(Math.floor(rgb.r))+","+String(Math.floor(rgb.g))+","+String(Math.floor(rgb.b))+")";
        }
        
    };
}