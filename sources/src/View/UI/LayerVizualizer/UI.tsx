
namespace LayersVizualizer.UI{

    import React = LiteMol.Plugin.React
    import Event = LiteMol.Bootstrap.Event;
    
    import Q = LiteMol.Core.Structure.Query;
    import AQ = Q.Algebraic;
    import Transformer = LiteMol.Bootstrap.Entity.Transformer;
    import Tree = LiteMol.Bootstrap.Tree;
    import Transform = Tree.Transform;   
    import Visualization = LiteMol.Bootstrap.Visualization;   

    declare function $(p:any): any;

    interface ChannelEventInfo { 
        kind: LiteMol.Bootstrap.Interactivity.Info.__Kind.Selection | LiteMol.Bootstrap.Interactivity.Info.__Kind.Empty,
        source : {
            props: {
                tag: {
                    element: DataInterface.Tunnel,
                    type: String
                }
            },
            ref: string
        }
        
    };

    function createProfileToLayerByCenterDistanceMapping(channel: DataInterface.Tunnel){
        let map = new Map<number,number>();
        let layers = channel.Layers.LayersInfo;
        let profile = channel.Profile;
        let maxProfileDistance = profile[profile.length-1].Distance;
        let maxLayerDistance = layers[layers.length-1].LayerGeometry.EndDistance;

        let lUnit = maxLayerDistance/100;
        let pUnit = maxProfileDistance/100;
        let layerSpaceToProfileSpace = (layerVal:number) => {
            return (layerVal/lUnit)*pUnit;
        };

        let inRange = (profileVal:number, layerStartDistance:number, layerEndDistance:number) => {
            return profileVal>=layerSpaceToProfileSpace(layerStartDistance) 
                && profileVal<layerSpaceToProfileSpace(layerEndDistance);
        };

        for(let pIdx=0,lIdx=0;pIdx<profile.length;){
            
            if(inRange(profile[pIdx].Distance,
                layers[lIdx].LayerGeometry.StartDistance,
                layers[lIdx].LayerGeometry.EndDistance)
                ){
                map.set(pIdx,lIdx);
                pIdx++;
            }
            else{
                if(lIdx+1 == layers.length){
                    map.set(pIdx,lIdx);
                    pIdx++;
                }
                else{
                    lIdx++;
                }
            }
        }

        return map;
    };

    function sphereSpaceToPercent(profileVal:number, sphereRadius:number){
        let sUnit = sphereRadius*2/100;
        return profileVal/sUnit;
    };

    function layerSpaceToPercent(val:number, layerLength:number){
        let unit = layerLength/100;
        return val/unit;
    };

    function layerSpaceToProfileSpace(layerVal:number,lUnit:number,pUnit:number){
        return (layerVal/lUnit)*pUnit;
    };

    function percentCover(profileCenter:number, profileRadius:number, 
        layerStartDistance:number, layerEndDistance:number, lUnit:number, pUnit:number){
        
        let sD_p = layerSpaceToProfileSpace(layerStartDistance,lUnit,pUnit);
        let eD_p = layerSpaceToProfileSpace(layerEndDistance,lUnit,pUnit);
        
        let sk = profileCenter;//-profileRadius;
        let ek = profileCenter;//+profileRadius*2;
        let sv = sD_p;
        let ev = eD_p;

        let S = Math.max(sk,sv);
        let E = Math.min(ek,ev);

        if(E-S !== 0){
            return 0;
        }
        else{
            return 100;
        }

        //return sphereSpaceToPercent(E-S,profileRadius);
        //return layerSpaceToPercent(E-S,layerEndDistance-layerStartDistance);
        /*
        //stred koule vlevo od vrstvy
        let case1 = () => {
            //koule mimo vrstvu celym profilem
            if((profileCenter + profileRadius)-sD_p < 0){
                return 0;
            }
            //koule zasahuje svou casti do vrstvy zleva
            if((profileCenter + profileRadius)-sD_p > 0
                && (profileCenter + profileRadius)-eD_p < 0){
                return sphereSpaceToPercent((profileCenter+profileRadius)-sD_p,profileRadius);
            }
            //koule obsahuje celou vrstvu a vrstva je umistena vpravo od stredu koule
            if((profileCenter+profileRadius)-sD_p > 0 
                && (profileCenter+profileRadius)-eD_p > 0){
                return sphereSpaceToPercent(eD_p-sD_p,profileRadius);
            }

            throw new Error("InvalidState - unrecognized state");
        };

        //stred koule uvnitr vrstvy
        let case2 = () => {
            //koule je cela ve vrstve
            if((profileCenter-profileRadius)-sD_p >= 0 
                && eD_p-(profileCenter+profileRadius) >= 0){
                return 100;
            }
            //koule presahuje vrstvu vlevo
            if((profileCenter-profileRadius)-sD_p <= 0
                && eD_p-(profileCenter+profileRadius) >= 0){
                return sphereSpaceToPercent((profileCenter+profileRadius)-sD_p,profileRadius);
            }
            //koule presahuje vrstvu zprava
            if((profileCenter-profileRadius)-sD_p >= 0
                && eD_p-(profileCenter+profileRadius) <= 0){
                return sphereSpaceToPercent(eD_p-(profileCenter-profileRadius),profileRadius);
            }
            //koule presahuje vlevo i vpravo a obsahuje celou vrstvu
            if((profileCenter-profileRadius)-sD_p <= 0
                && eD_p-(profileCenter+profileRadius) <= 0){
                return sphereSpaceToPercent(eD_p-sD_p,profileRadius);
            }

            throw new Error("InvalidState - unrecognized state");
        };

        //stred koule vpravo od vrstvy
        let case3 = () => {
            //koule nezasahuje do vrstvy
            if((profileCenter-profileRadius)-eD_p > 0){
                return 0;
            }
            //koule zasahuje levou pulkou do vrstvy, ale nepresahuje
            if((profileCenter-profileRadius)-sD_p > 0
                && (profileCenter-profileRadius)-eD_p < 0){
                return sphereSpaceToPercent(eD_p-(profileCenter-profileRadius),profileRadius);
            }
            //koule obsahuje celou vrstvu v prave polovine
            if((profileCenter-profileRadius)-sD_p < 0
                && (profileCenter+profileRadius)-eD_p > 0){
                return sphereSpaceToPercent(eD_p-sD_p,profileRadius);
            }

            throw new Error("InvalidState - unrecognized state");
        };

        if(profileCenter < sD_p){
            return case1();
        }
        
        if(profileCenter >= sD_p && profileCenter <= eD_p){
            return case2();
        }

        if(profileCenter > eD_p){
            return case3();
        }

        throw new Error("InvalidState - unrecognized state");
        */
    };

    function createProfileColorMapByRadiusAndCenterDistance(channel: DataInterface.Tunnel, layerIdx:number){
        console.log("mappingbyradiusandcenter");
        /*let layerColors:LiteMol.Visualization.Color[] = [];*/
        let layers = channel.Layers.LayersInfo;
        let profile = channel.Profile;
        let maxProfileDistance = profile[profile.length-1].Distance;
        let maxLayerDistance = layers[layers.length-1].LayerGeometry.EndDistance;

        let activeColor = LiteMol.Visualization.Color.fromRgb(255,0,0);
        let inactiveColor = LiteMol.Visualization.Color.fromRgb(255,255,255);
        /*
        for(let i=0;i<layers.length;i++){
            if(i===layerIdx){
                layerColors.push(activeColor);
            }
            else{
                layerColors.push(inactiveColor);
            }
        }
        */

        let lUnit = maxLayerDistance/100;
        let pUnit = lUnit;//maxProfileDistance/100;

        let colorMap = new Map<number,LiteMol.Visualization.Color>();
        //let profileToColorMap = new Map<number,number>();
        //let colors:LiteMol.Visualization.Color[] = [];
        for(let pIdx=0;pIdx<profile.length;pIdx++){
            let layerCover:{layerIdx:number, percent:number}[] = [];
            for(let lIdx=0;lIdx<layers.length;lIdx++){
                let sphere = profile[pIdx];
                let layerGeometry = layers[lIdx].LayerGeometry;
                let percent = percentCover(
                    sphere.Distance,
                    sphere.Radius,
                    layerGeometry.StartDistance,
                    layerGeometry.EndDistance,
                    lUnit,
                    pUnit
                );
                
                if(percent>0){
                    layerCover.push({layerIdx:lIdx,percent});
                }
            }

            /*
            layerCover.sort((a:{layerIdx:number,percent:number},b:{layerIdx:number,percent:number})=>{
                return a.percent-b.percent;
            });
            */

            /*
            if(layerCover.length<2){
                colorMap.set(pIdx,layerColors[layerCover[0].layerIdx]);
                //profileToColorMap.set(pIdx,pIdx);
                //colors.push(layerColors[layerCover[0].layerIdx]);
                continue;
            }*/

            /*
            let color = layerColors[layerCover[0].layerIdx];
            let lc = layerCover[0];
            let currentPercent = lc.percent;
            for(let lcIdx=1;lcIdx<layerCover.length;lcIdx++){
                let lc2 = layerCover[lcIdx];
                let color2 = layerColors[lc2.layerIdx];

                let totalPercent = currentPercent+lc2.percent;
                let p = (currentPercent/totalPercent)*100;

                color = {
                    r:(1-(p/100)) * color.r + (p/100) * color2.r,
                    g:(1-(p/100)) * color.g + (p/100) * color2.g,
                    b:(1-(p/100)) * color.b + (p/100) * color2.b
                };
                currentPercent = totalPercent;
            }
            */

            let color = inactiveColor;
            let semiactiveColor = LiteMol.Visualization.Color.fromRgb(0,0,122);
            for(let lcIdx=0;lcIdx<layerCover.length;lcIdx++){
                let p = layerCover[lcIdx].percent;
                if(layerCover[lcIdx].layerIdx === layerIdx){
                    console.log(`Profile[${pIdx}] -> Layer[${layerIdx}] => cover: ${p}`);
                    /*
                    color = {
                        r:(1-(p/100)) * semiactiveColor.r + (p/100) * activeColor.r,
                        g:(1-(p/100)) * semiactiveColor.g + (p/100) * activeColor.g,
                        b:(1-(p/100)) * semiactiveColor.b + (p/100) * activeColor.b
                    };*/
                    //LiteMol.Visualization.Color.interpolate(semiactiveColor,activeColor,p,color);
                    color = activeColor;
                    break;
                }
            }

            /*
            let lc1 = layerCover[layerCover.length-1];
            let lc2 = layerCover[layerCover.length-2];

            let color1 = layerColors[lc1.layerIdx];
            let color2 = layerColors[lc2.layerIdx];

            let color = {
                r:(1-(lc1.percent/100)) * color1.r + (lc1.percent/100) * color2.r,
                g:(1-(lc1.percent/100)) * color1.g + (lc1.percent/100) * color2.g,
                b:(1-(lc1.percent/100)) * color1.b + (lc1.percent/100) * color2.b
            };
            
            console.log(color1);
            console.log(color2);
            console.log(color);
            console.log("-");
            console.log(lc1);
            console.log(lc2);
            console.log("---!---");
            */
            colorMap.set(pIdx,color);
            //profileToColorMap.set(pIdx,pIdx);
            //colors.push(color);
        }

        return colorMap;
    };

    function applyTheme(theme:LiteMol.Visualization.Theme/*(e: any, props?: LiteMol.Visualization.Theme.Props | undefined) => LiteMol.Visualization.Theme*/, plugin:LiteMol.Plugin.Controller, ref: string){
        let visual = plugin.context.select(ref)[0] as any;
        console.log(visual);
        let query = LiteMol.Core.Structure.Query.everything();/*.sequence('1', 'A', { seqNumber: 10 }, { seqNumber: 25 });*/
        
        let action = Transform.build().add(visual, Transformer.Molecule.CreateSelectionFromQuery, { query, name: 'My name' }, { ref: 'sequence-selection' })
            // here you can create a custom style using code similar to what's in 'Load Ligand'
            .then(Transformer.Molecule.CreateVisual, { style: LiteMol.Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
        visual = plugin.context.select(ref)[0] as any;
        console.log(visual);
        console.log(LiteMol.Bootstrap.Utils.Molecule.findModel(visual));
        /*let themestatic = theme(visual);*/
        plugin.applyTransform(action).then(() => {                
            LiteMol.Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(plugin.context, { visual, theme/*: themestatic*/});
            LiteMol.Bootstrap.Command.Entity.Focus.dispatch(plugin.context, plugin.context.select('sequence-selection'))
            // alternatively, you can do this
            //Command.Molecule.FocusQuery.dispatch(plugin.context, { model: selectNodes('model')[0] as any, query })
        });
    }

    function generateLayerSelectColorTheme(activeLayerIdx: number, app: App){           
        /*
        let colors = new Map<number, LiteMol.Visualization.Color>();
        let coloringPropertyKey = app.vizualizer.getColoringPropertyKey();
        for(let layerIdx=0; layerIdx<app.state.data.length; layerIdx++){
            if(layerIdx === activeLayerIdx){
                colors.set(layerIdx, LiteMol.Visualization.Color.fromRgb(255,0,0));
            }
            else{
                colors.set(layerIdx, LiteMol.Visualization.Color.fromRgb(255,255,255));
            }
        } 
        */        

        let channel = (app.props.controller.context.select(app.state.currentTunnelRef)[0] as any).props.model.entity.element as DataInterface.Tunnel;
        let profilePartsCount = channel.Profile.length;
        //let profileToLayerMapping = createProfileColorMapByRadiusAndCenterDistance(channel,activeLayerIdx);
        let max = 0;
        let colors = createProfileColorMapByRadiusAndCenterDistance(channel,activeLayerIdx);
        let theme = LiteMol.Visualization.Theme.createMapping(LiteMol.Visualization.Theme.createColorMapMapping(
                (idx:number)=>{
                    return idx;
                    /*
                    let lIdx = profileToLayerMapping.get(idx);
                    if(lIdx === void 0)
                        return void 0;
                    return lIdx;
                    */
                },
                colors,
                LiteMol.Visualization.Color.fromRgb(0,0,0)
            ));
        return theme;
    }

    export function render(vizualizer: Vizualizer, target: Element, plugin: LiteMol.Plugin.Controller) {
        LiteMol.Plugin.ReactDOM.render(<App vizualizer={vizualizer} controller={plugin} />, target);
    }

    export class App extends React.Component<{ vizualizer: Vizualizer, controller: LiteMol.Plugin.Controller }, State> {

        private interactionEventStream: LiteMol.Bootstrap.Rx.IDisposable | undefined = void 0;

        state = {
            instanceId: -1,
            hasData: false,
            data: [] as DataInterface.LayerData[],
            layerId: 0,
            coloringPropertyKey: "",
            customColoringPropertyKey: "",
            radiusPropertyKey: "MinRadius" as RadiusProperty,
            customRadiusPropertyKey: "MinRadius" as RadiusProperty,
            colorBoundsMode: "Absolute" as ColorBoundsMode,
            isDOMReady: false,
            app: this,
            currentTunnelRef: "",
            isLayerSelected: false
        };

        vizualizer: Vizualizer

        componentDidMount() {
            var vizualizer = this.props.vizualizer;

            vizualizer.setColorBoundsMode(this.state.colorBoundsMode);

            this.setState({
                instanceId: vizualizer.getPublicInstanceIdx(),
                customColoringPropertyKey:vizualizer.getCustomColoringPropertyKey(),
                coloringPropertyKey:vizualizer.getColoringPropertyKey(),
                customRadiusPropertyKey:vizualizer.getCustomRadiusPropertyKey(),
                radiusPropertyKey:vizualizer.getRadiusPropertyKey(),
                colorBoundsMode:this.state.colorBoundsMode
            });
            this.vizualizer = vizualizer;
            
            var interactionHandler = function showInteraction(type: string, i: ChannelEventInfo | undefined, app: App) {
                if (!i || i.source == null || i.source.props.tag === void 0 || i.source.props.tag.type === void 0) {
                    return;    
                }

                if(i.source.props.tag.type == "Tunnel" 
                    || i.source.props.tag.type == "Path"
                    || i.source.props.tag.type == "Pore"
                    || i.source.props.tag.type == "MergedPore"){
                    window.setTimeout(()=>{
                        app.setState({currentTunnelRef: i.source.ref, isLayerSelected: false});
                        $('#left-tabs').tabs("option", "active", 0);
                        let layers = DataInterface.convertLayersToLayerData(i.source.props.tag.element.Layers);
                        vizualizer.setData(layers);
                        app.setState({data: layers, hasData: true, isDOMReady:false, instanceId: vizualizer.getPublicInstanceIdx()});
                        vizualizer.vizualize();  
                        app.setState({data: layers, hasData: true, isDOMReady:true, instanceId: vizualizer.getPublicInstanceIdx()});
                    },50);
                    //Testing themes... TODO: remove/move to another location...
                    //app.applyTheme(app.generateColorTheme(),app.props.controller,app.state.currentTunnelRef);                    
                }
                
            }

            this.interactionEventStream = Event.Visual.VisualSelectElement.getStream(this.props.controller.context)
                .subscribe(e => interactionHandler('select', e.data as ChannelEventInfo, this));

            $( window ).on("lvCcontentResize",(()=>{
                this.forceUpdate();
            }).bind(this));
            $( window ).on("resize",(()=>{
                this.forceUpdate();
            }).bind(this));
        }
        
        
        /*
        generateLayerSelectColorTheme(activeLayerIdx: number){           
            let colors = new Map<number, LiteMol.Visualization.Color>();
            let coloringPropertyKey = this.vizualizer.getColoringPropertyKey();
            for(let layerIdx=0; layerIdx<this.state.data.length; layerIdx++){
                if(layerIdx === activeLayerIdx){
                    colors.set(layerIdx, LiteMol.Visualization.Color.fromRgb(255,0,0));
                }
                else{
                    colors.set(layerIdx, LiteMol.Visualization.Color.fromRgb(255,255,255));
                }
            }            

            let channel = (this.props.controller.context.select(this.state.currentTunnelRef)[0] as any).props.model.entity.element as DataInterface.Tunnel;
            let profilePartsCount = channel.Profile.length;
            let profileToLayerMapping = this.createProfileToLayerMapping(channel);
            let max = 0;
            let theme = LiteMol.Visualization.Theme.createMapping(LiteMol.Visualization.Theme.createColorMapMapping(
                    (idx:number)=>{
                        let lIdx = profileToLayerMapping.get(idx);
                        if(lIdx === void 0)
                            return void 0;
                        return lIdx;
                    },
                    colors,
                    LiteMol.Visualization.Color.fromRgb(0,0,0)
                ));
            return theme;
        }*/

        //TODO:... vizualizace vrstev ve 3D
        generateColorTheme(){
            let colorSettings = this.props.vizualizer.getCurrentColoringSettings("default");
            if(colorSettings===void 0 || colorSettings === null){
                throw Error("No color info available!");
            }
            
            let colors = new Map<number, LiteMol.Visualization.Color>();
            let coloringPropertyKey = this.vizualizer.getColoringPropertyKey();
            for(let layerIdx=0; layerIdx<this.state.data.length; layerIdx++){
                let layer = this.state.data[layerIdx];
                console.log(this.vizualizer.getColor(Number(layer.Properties[coloringPropertyKey]).valueOf(),colorSettings));
                let color = Colors.parseRGBString(this.vizualizer.getColor(Number(layer.Properties[coloringPropertyKey]).valueOf(),colorSettings));
                colors.set(layerIdx, LiteMol.Visualization.Color.fromRgb(color.r, color.g, color.b));
            }            

            let channel = (this.props.controller.context.select(this.state.currentTunnelRef)[0] as any).props.model.entity.element as DataInterface.Tunnel;
            let profilePartsCount = channel.Profile.length;
            let profileToLayerMapping = createProfileToLayerByCenterDistanceMapping(channel);
            let max = 0;
            let theme = LiteMol.Visualization.Theme.createMapping(LiteMol.Visualization.Theme.createColorMapMapping(
                    (idx:number)=>{
                        let lIdx = profileToLayerMapping.get(idx);
                        if(lIdx === void 0 || lIdx === 0)
                            return void 0;
                        return lIdx;
                    },
                    colors,
                    LiteMol.Visualization.Color.fromRgb(0,0,0)
                ));
            
                /*
            theme.setElementColor = (index:number, target:LiteMol.Visualization.Color)=>{
                console.log(`index: ${index}`);
            };*/

            return theme;
                
                /*
            return LiteMol.Visualization.Theme.createMapping(LiteMol.Visualization.Theme.createPalleteMapping(
                    (idx:number)=>{console.log(`Color Idx: ${idx}`);return idx%3;},
                    color_arr
                ));
                */
            /*.createColorMapThemeProvider(
                // here you can also use m.atoms.residueIndex, m.residues.name/.... etc.
                // you can also get more creative and use "composite properties"
                // for this check Bootstrap/Visualization/Theme.ts and Visualization/Base/Theme.ts and it should be clear hwo to do that.
                //
                // You can create "validation based" coloring using this approach as it is not implemented in the plugin for now.
                m => ({ index: m.data.atoms.chainIndex, property: m.data.chains.asymId }),  
                colors,
                // this a fallback color used for elements not in the set 
                LiteMol.Visualization.Color.fromRgb(0, 0, 123))
                // apply it to the model, you can also specify props, check Bootstrap/Visualization/Theme.ts
                //(model);*/

            
        }

        //applyTheme

        componentWillUnmount(){
            if(this.interactionEventStream !== void 0){
                this.interactionEventStream.dispose();
            }
        }

        render() {
            if (this.state.hasData) {
                return <PaintingArea {...this.state} />
            } 
            
            return <Hint {...this.state} />
        }
    }  

    interface State{
        instanceId: number,
        hasData: boolean,
        data: DataInterface.LayerData[],
        layerId: number,
        coloringPropertyKey: string,
        customColoringPropertyKey: string,
        radiusPropertyKey: RadiusProperty,
        customRadiusPropertyKey: RadiusProperty,
        colorBoundsMode: ColorBoundsMode
        isDOMReady: boolean,
        app: App,
        currentTunnelRef: string,
        isLayerSelected: boolean
    };

    class PaintingArea extends React.Component<State,{}>{
        render(){
            return(
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

    class Hint extends React.Component<State,{}>{
        render(){
            return(
                <div id={`layer-vizualizer-hint-div${this.props.instanceId}`}
                    className="layer-vizualizer-hint-div"
                    >
                        Click on one of available channels to see more information...
                    </div>
            );
        }
    }

    class DetailsContainer extends React.Component<State,{}>{
        render(){
            var layerId = this.props.layerId;
            return(
                <div className="layer-vizualizer-detail-div"
                    id={`layer-vizualizer-detail-div${this.props.instanceId}`}
                    >
                    <h3>Properties</h3>
                    <LayerProperties layerProperties={this.props.data[layerId].Properties} />
                    <h3>Lining residues</h3>
                    <LayerResidues layerResidues={this.props.data[layerId].Residues} />
                </div>
            );
        }
    }

    class LayerProperties extends React.Component<{ layerProperties: any },{}>{
        render(){
            var rv = [];
            for(var key in this.props.layerProperties){
                rv.push(<LayerProperty propertyKey={key} propertyValue={this.props.layerProperties[key]} />);
            }

            return(
            <div className="properties">
                {rv}
            </div>
            );
        }
    }

    class LayerProperty extends React.Component<{ propertyKey: String, propertyValue: String },{}>{
        render(){
            return(
                <span className="propertyItem">{`${this.props.propertyKey}: ${this.props.propertyValue}`}</span>
            );
        }
    }

    class LayerResidues extends React.Component<{ layerResidues: string[] },{}>{
        render(){
            var rv = [];
            for(var key of this.props.layerResidues){
                rv.push(<LayerResidue name={key}/>
                );
            }

            return(
            <div>
                {rv}
            </div>
            );
        }
    }

    class LayerResidue extends React.Component<{ name: String/*, sequenceNumber: String, chain: String*/ },{}>{
        render(){
            return(
                <span className="residueItem">{`${this.props.name}`}</span>
            );
        }
    }

    class ColorMenuItem extends React.Component<State & {propertyName:string, isCustom:boolean},{}>{
        private changeColoringProperty(e: React.MouseEvent<HTMLAreaElement>){
            let targetElement = (e.target as HTMLElement);
            let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
            let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

            let propertyName = targetElement.getAttribute("data-propertyname");
            if(propertyName === null){
                console.log("No property name found!");
                return;
            }

            if(this.props.isCustom){
                console.log(`setting custom property key: ${propertyName}`);
                instance.setCustomColoringPropertyKey(propertyName);
            }
            else{
                console.log(`setting regular property key: ${propertyName}`);
                instance.setColoringPropertyKey(propertyName);                   
            }

            instance.vizualize();
            
            if(this.props.isCustom){
                this.props.app.setState({customColoringPropertyKey:propertyName});
            }
            else{
                this.props.app.setState({coloringPropertyKey:propertyName});
            }
        }

        render(){
            return(
                <li><a data-instanceidx={this.props.instanceId} data-propertyname={this.props.propertyName} onClick={this.changeColoringProperty.bind(this)}>{this.props.propertyName}</a></li>
            );
        }
    }

    class RadiusMenuItem extends React.Component<State & {propertyName:string, isCustom:boolean},{}>{
        private changeRadiusProperty(e: React.MouseEvent<HTMLAreaElement>){
            let targetElement = (e.target as HTMLElement);
            let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
            let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

            let propertyName = targetElement.getAttribute("data-propertyname") as RadiusProperty;
            if(propertyName === null || propertyName === void 0){
                return;
            }

            if(this.props.isCustom){
                instance.setCustomRadiusPropertyKey(propertyName);
            }
            else{
                instance.setRadiusPropertyKey(propertyName);
            }

            instance.vizualize();
            
            if(this.props.isCustom){
                this.props.app.setState({customRadiusPropertyKey:propertyName});
            }
            else{
                this.props.app.setState({radiusPropertyKey:propertyName});
            }
        }

        render(){
            return(
                <li><a data-instanceidx={this.props.instanceId} data-propertyname={this.props.propertyName} onClick={this.changeRadiusProperty.bind(this)}>{this.props.propertyName}</a></li>
            );
        }
    }

    class ColorBoundsMenuItem extends React.Component<State & {mode:string},{}>{
        private changeColorBoundsMode(e: React.MouseEvent<HTMLAreaElement>){
            let targetElement = (e.target as HTMLElement);
            let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
            let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

            let mode = targetElement.getAttribute("data-mode") as ColorBoundsMode;
            if(mode === null || mode === void 0){
                return;
            }

            instance.setColorBoundsMode(mode);
            instance.vizualize();
            
            this.props.app.setState({colorBoundsMode:mode});
        }

        render(){
            return(
                <li><a data-instanceidx={this.props.instanceId} data-mode={this.props.mode} onClick={this.changeColorBoundsMode.bind(this)}>{this.props.mode}</a></li>
            );
        }
    }

    class BootstrapDropUpMenuButton extends React.Component<{label: string, items: JSX.Element[]},{}>{
        render(){
            return <div className="btn-group dropup">
                    <button type="button" className="btn btn-xs btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {this.props.label} <span className="caret"></span>
                    </button>
                    <ul className="dropdown-menu">
                        {this.props.items}
                    </ul>
                </div>
        }
    }

    class Controls extends React.Component<State & {isCustom:boolean},{}>{
        render(){
            return(
                <div className="controls">
                    <RadiusSwitch state={this.props} isCustom={this.props.isCustom} radiusProperty={(this.props.isCustom)?this.props.customRadiusPropertyKey:this.props.radiusPropertyKey} />
                    <ColorBySwitch state={this.props} isCustom={this.props.isCustom} coloringProperty={(this.props.isCustom)?this.props.customColoringPropertyKey:this.props.coloringPropertyKey} />
                </div>
            );
        }
    }
    
    class CommonControls extends React.Component<State,{}>{

        render(){
            return(
                <div className="controls">
                    <CommonButtonArea {...this.props} />
                </div>
            );
        }
    }

    class ColorBySwitch extends React.Component<{state: State, coloringProperty:string, isCustom:boolean},{}>{
        private generateColorMenu(){

            let rv = [];
            for(let prop in this.props.state.data[0].Properties){
                rv.push(
                    <ColorMenuItem propertyName={prop} isCustom={this.props.isCustom} {...this.props.state} />
                );
            }

            return <BootstrapDropUpMenuButton items={rv} label={this.props.coloringProperty} />
        }

        render(){
            let items = this.generateColorMenu();
            return (
                <span className="block-like">
                    <span className="control-label">Color by:</span> {items}
                </span>
                );
        }
    }

    class RadiusSwitch extends React.Component<{state: State, radiusProperty:RadiusProperty,isCustom:boolean},{}>{
        private generateRadiusSwitch(){
            let properties = ["MinRadius","MinFreeRadius"];
            let rv = [];
            for(let prop of properties){
                rv.push(
                    <RadiusMenuItem propertyName={prop} isCustom={this.props.isCustom} {...this.props.state} />
                );
            }

            return <BootstrapDropUpMenuButton items={rv} label={this.props.radiusProperty} />
        }

        render(){
            let items = this.generateRadiusSwitch();
            return (
                <span className="block-like">
                    <span className="control-label">Tunnel radius:</span> {items}
                </span>
                );
        }
    }

    class CommonButtonArea extends React.Component<State,{}>{
        private generateColorBoundsSwitch(){
            let properties = ["Min/max","Absolute"];
            let rv = [];
            for(let prop of properties){
                rv.push(
                    <ColorBoundsMenuItem mode={prop} {...this.props} />
                );
            }
            
            let label = properties[(this.props.colorBoundsMode=="Min/max")?0:1];

            return <BootstrapDropUpMenuButton items={rv} label={label} />
        }

        render(){
            let items = this.generateColorBoundsSwitch();
            return (
                <div className="common-area">
                    <ColorBoundsSwitchButton items={items} />
                    <ExportButton instanceId={this.props.instanceId} />
                </div>
                );
        }
    }

    class ExportTypeButton extends React.Component<{instanceId:number,exportType:string},{}>{
        
        private export(e: React.MouseEvent<HTMLAreaElement>){
            let targetElement = (e.target as HTMLElement);
            let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
            let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];

            let exportType = targetElement.getAttribute("data-exporttype");
            if(exportType === null){
                return;
            }

            let imgDataUrl = null;

            switch(exportType){
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

            var win = window.open(imgDataUrl, '_blank');
            win.focus();
        }

        render(){
            return <li><a data-instanceidx={this.props.instanceId} data-exporttype={this.props.exportType} onClick={this.export.bind(this)}>{this.props.exportType}</a></li>
        }
    }

    class ExportButton extends React.Component<{instanceId:number},{}>{
        private generateItems(){
            let rv = [] as JSX.Element[];
            let supportedExportTypes = ["PNG","SVG"/*,"PDF"*/];
            for(let type of supportedExportTypes){
                rv.push(
                    <ExportTypeButton instanceId={this.props.instanceId} exportType={type} />
                );
            }
            
            return rv;
        }

        render(){
            let label = "Export";
            let rv = this.generateItems();
            return (<BootstrapDropUpMenuButton items={rv} label={label} />);
        }
    }

    class ColorBoundsSwitchButton extends React.Component<{items:JSX.Element},{}>{
        render(){
            return (
                <span className="color-bounds-button-container">
                    <span className="control-label" title="Color bounds for both halfs of vizualized tunnel.">
                        Color bounds:
                    </span> {this.props.items}
                </span>
                );
        }
    }

    class CanvasWrapper extends React.Component<State,{}>{
        render(){
            return (
            <div className="canvas-wrapper">
               <RealCanvas {...this.props} />
               <ImgOverlay {...this.props} />
               <InteractionMap {...this.props} />
            </div>
            );
        }
    }

    class ImgOverlay extends React.Component<State,{}>{
        render(){
            return (
                <img className="fake-canvas"
                    id={`layer-vizualizer-fake-canvas${this.props.instanceId}`}
                    useMap={`#layersInteractiveMap${this.props.instanceId}`}
                    src="images/no_img.png"
                    ></img>
            );
        }
    }

    class RealCanvas extends React.Component<State,{}>{
        render(){
            return (
                <canvas id={`layer-vizualizer-canvas${this.props.instanceId}`} 
                    className="layer-vizualizer-canvas"
                    width="700"
                    height="150"
                    ></canvas>
            );
        }
    }

    interface TunnelScale{
                xScale:number,
                yScale:number
            };
    interface Bounds{
        x:number,
        y:number,
        width:number,
        height:number
    };

    class InteractionMap extends React.Component<State,{}>{

        private getLayerResidues(layerIdx:number):{authAsymId:string, authSeqNumber:number}[]{
            let res = [];
            for(let residue of this.props.data[layerIdx].Residues){
                let parts = (residue as string).split(" ");
                res.push({
                    authAsymId: parts[2],
                    authSeqNumber: Number(parts[1]).valueOf()
                });
            }
            /*
            console.log(`Layer ${layerIdx}:`);
            console.log(res);
            */
            return res;
        }
        /*
        private removeResidue3DView(){
            LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(this.props.app.props.controller.context, "res_visual");
        }*/

        private resetFocusToTunnel(){
            LiteMol.Bootstrap.Command.Entity.Focus.dispatch(
                this.props.app.props.controller.context, this.props.app.props.controller.context.select(
                    this.props.app.state.currentTunnelRef
                )
            );
        }

        private showLayerResidues3DAndFocus(layerIdx:number){
            /*
            let theme = generateLayerSelectColorTheme(layerIdx,this.props.app);
            applyTheme(theme,this.props.app.props.controller,this.props.app.state.currentTunnelRef);
            */
            let residues = this.getLayerResidues(layerIdx);
            let query = LiteMol.Core.Structure.Query.residues(
                ...residues
            );

            /*this.removeResidue3DView();*/
            CommonUtils.Selection.SelectionHelper.clearSelection(this.props.app.props.controller);
           
            let t = this.props.app.props.controller.createTransform();
            t.add('polymer-visual', Transformer.Molecule.CreateSelectionFromQuery, { query, name: 'Residues' }, { ref: CommonUtils.Selection.SelectionHelper.getSelectionVisualRef()})
                .then(Transformer.Molecule.CreateVisual, { style: Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
            
            this.props.app.props.controller.applyTransform(t)
                .then(res=>{
                    //Focus
                    LiteMol.Bootstrap.Command.Entity.Focus.dispatch(this.props.app.props.controller.context, this.props.app.props.controller.context.select(CommonUtils.Selection.SelectionHelper.getSelectionVisualRef()));
                });            
        }

        private displayDetailsEventHandler(e: React.MouseEvent<HTMLAreaElement>){
            let targetElement = (e.target as HTMLElement);
            let layerIdx = Number(targetElement.getAttribute("data-layeridx")).valueOf();
            let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
            let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];
            
            instance.highlightHitbox(layerIdx);
            if(!this.props.app.state.isLayerSelected){
                this.props.app.setState({layerId: layerIdx});    
                $( window ).trigger('layerTriggered',layerIdx);
                /*$( window ).trigger('resize');
                $( window ).trigger('contentResize');*/
            }      
        }

        private displayLayerResidues3DEventHandler(e: React.MouseEvent<HTMLAreaElement>){
            let targetElement = (e.target as HTMLElement);
            let layerIdx = Number(targetElement.getAttribute("data-layeridx")).valueOf();
            let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
            let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];      
            
            if(instance.getSelectedLayer() === layerIdx){
                this.props.app.state.isLayerSelected = false;
                CommonUtils.Selection.SelectionHelper.clearSelection(this.props.app.props.controller);
                this.resetFocusToTunnel();
                instance.deselectLayer();
                instance.highlightHitbox(layerIdx);
            }
            else{
                this.props.app.setState({layerId: layerIdx,isLayerSelected: true});   
                this.showLayerResidues3DAndFocus(layerIdx);
                instance.deselectLayer();
                instance.selectLayer(layerIdx);
                $( window ).trigger('layerTriggered',layerIdx);
                $( window ).trigger('resize');
            }
        }

        private getTunnelScale(tunnel:Tunnel | null):TunnelScale{
            let xScale = 0;
            let yScale = 0;

            if(tunnel !== null){
                let scale = tunnel.getScale();
                if(scale !== null){
                    xScale = scale.x;
                    yScale = scale.y;
                }
            }

            return {
                xScale,
                yScale
            };
        }

        private transformCoordinates(x:number,y:number,width:number,height:number,scale:TunnelScale,bounds:Bounds):{
            sx:number,sy:number,dx:number,dy:number}{
            let vizualizer = Vizualizer.ACTIVE_INSTANCES[this.props.instanceId];
            
            //Real width can be different to canvas width - hitboxes could run out of space
            let realXScale = 1;
            let realWidth = vizualizer.getCanvas().offsetWidth.valueOf();
            if(realWidth != 0){
                realXScale = 1/(vizualizer.getCanvas().width/realWidth);
            }

            let realYScale = 1;
            let realHeight = vizualizer.getCanvas().offsetHeight.valueOf();
            if(realHeight != 0){
                realYScale = 1/(vizualizer.getCanvas().height/realHeight);
            }

            return {
                sx: (bounds.x + x * scale.xScale)* realXScale,
                sy: (bounds.y + y * scale.yScale) * realYScale,
                dx: (bounds.x + (x+width) * scale.xScale) * realXScale,
                dy: (bounds.y + (y+height) * scale.yScale) * realYScale
            };

        }

        private makeCoordinateString(x:number,y:number,width:number,height:number,scale:TunnelScale,bounds:Bounds):string{
            let coordinates = this.transformCoordinates(x,y,width,height,scale,bounds);
            return String(coordinates.sx)+','
                        +String(coordinates.sy)+','
                        +String(coordinates.dx)+','
                        +String(coordinates.dy);
        }

        private generatePhysicalHitboxesCoords(): {layerIdx:number,coords:string}[]{
            let vizualizer = Vizualizer.ACTIVE_INSTANCES[this.props.instanceId];
            let data = this.props.data;

            //Data was not prepared yet
            if(vizualizer.isDataDirty()){
                vizualizer.prepareData();
            }

            let hitboxes = vizualizer.getHitboxes();
            let tunnels = vizualizer.getTunnels();

            if(tunnels === null 
                || hitboxes === null
                || (hitboxes.defaultTunnel === null && hitboxes.customizable === null)){
                    return [];
            }

            let defaultTunnel = tunnels.default;
            let customizableTunnel = tunnels.customizable;

            let dTproperties = null;
            let dTbounds = null;
            if(defaultTunnel !== null){
                dTproperties = this.getTunnelScale(defaultTunnel.tunnel);
                dTbounds = defaultTunnel.bounds;
            }
            let cTproperties = null;
            let cTbounds = null;
            if(customizableTunnel !== null){
                cTproperties = this.getTunnelScale(customizableTunnel.tunnel);
                cTbounds = customizableTunnel.bounds;
            }
            
            let rv = [];
            for(let i=0;i<data.length;i++){
                if(hitboxes.defaultTunnel !== null && dTproperties !== null && dTbounds !== null){
                    let hitbox = hitboxes.defaultTunnel[i];
                    rv.push({
                            layerIdx: i,
                            coords:this.makeCoordinateString(hitbox.x,hitbox.y,hitbox.width,hitbox.height,dTproperties,dTbounds)
                        });
                }
                if(hitboxes.customizable !== null && cTproperties !== null && cTbounds !== null){
                    let hitbox = hitboxes.customizable[i];
                    rv.push({
                            layerIdx:i,
                            coords:this.makeCoordinateString(hitbox.x,hitbox.y,hitbox.width,hitbox.height,cTproperties,cTbounds)
                        });
                }
            }

            return rv;
        }

        render(){
            let areas = [];
            if(this.props.isDOMReady){
                let hitboxesCoords = this.generatePhysicalHitboxesCoords();
                for(let i=0;i<hitboxesCoords.length;i++){
                    areas.push(<area shape="rect" 
                        coords={hitboxesCoords[i].coords.valueOf()} 
                        data-layeridx={String(hitboxesCoords[i].layerIdx.valueOf())}
                        data-instanceidx={String(this.props.instanceId)}
                        onMouseOver={this.displayDetailsEventHandler.bind(this)}
                        onMouseDown={this.displayLayerResidues3DEventHandler.bind(this)} />);
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
}