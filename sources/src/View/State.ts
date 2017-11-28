/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Example.Channels.State {

    import ApiService = MoleOnlineWebUI.Service.MoleAPI.ApiService;
    import MoleAPI = MoleOnlineWebUI.Service.MoleAPI;

    import Tree = Bootstrap.Tree;
    import Transform = Tree.Transform;  

    import Transformer = Bootstrap.Entity.Transformer;

    import ColorScheme = MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme;

    /*export interface SurfaceTag { type: string, element?: any }*/

    export type SelectableElement = 
        | { kind: 'nothing' }
        | { kind: 'molecule', data: Bootstrap.Interactivity.Molecule.SelectionInfo }
        | { kind: 'point', data: number[] }

    export type SurfaceTag =
        | { kind: 'Channel' | 'Cavity-inner' | 'Origins' | 'Points' | 'TPoint', element: any }
        | { kind: 'Cavity-boundary', element: any, surface: Core.Geometry.Surface }


    function showDefaultVisuals(plugin: Plugin.Controller, data: any) {
        return new Promise(res => {
            let toShow = [];
            
            //-- MoleOnline
            if(data.MergedPores && data.MergedPores.length > 0){
                toShow = data.MergedPores;
            }
            else if(data.Paths && data.Paths.length > 0){
                toShow = data.Paths;
            }
            else if(data.Pores && data.Pores.length > 0){
                toShow = data.Pores;
            }
            else if(data.Tunnels && data.Tunnels.length > 0){
                toShow = data.Tunnels;
            }
            //-- ChannelsDB
            else if(data.ReviewedChannels && data.ReviewedChannels.length > 0){
                toShow = data.ReviewedChannels;
            }
            else if(data.CSATunnels && data.CSATunnels.length > 0){
                toShow = data.CSATunnels;
            }
            else if(data.TransmembranePores && data.TransmembranePores.length > 0){
                toShow = data.TransmembranePores;
            }
            else if(data.ReviewedChannels && data.ReviewedChannels.length > 0){
                toShow = data.ReviewedChannels;
            }

            return showChannelVisuals(plugin, toShow.slice(0,5), true).then(() => {
                if(data.Cavities === void 0){
                    res();
                    return;
                }
                let cavity = data.Cavities.Cavities[0];
                if (!cavity) {
                    res();
                    return;
                }
                showCavityVisuals(plugin, [cavity ], true).then(() => res());
            })});
    }

    function getNodeFromTree(root:Bootstrap.Entity.Any,ref:string):Bootstrap.Entity.Any | null{
        if(root.ref===ref){
            return root;
        }
        for(let c of root.children){
            let n = getNodeFromTree(c, ref);
            if(n!==null){
                return n;
            }
        }

        return null;
    }

    export function removeChannelsData(plugin:Plugin.Controller){
        removeNodeFromTree(plugin, 'mole-data-object');
    }

    function removeNodeFromTree(plugin:Plugin.Controller, nodeRef:string){
        let obj = getNodeFromTree(plugin.root, nodeRef);
        if(obj!==null){
            Tree.remove(obj);
        }
    }

    interface Point{X:number,Y:number,Z:number};
    function residuesToPoints(plugin:Plugin.Controller, residueOrigins:MoleAPI.CSAResidues):string{
        let points:Point[] = [];

        for(let origin of residueOrigins){
            let centerOfMass = CommonUtils.Residues.getCenterOfMass(origin);
            if(centerOfMass===null){
                continue;
            }

            points.push(centerOfMass);
        }
        return JSON.stringify({
            Origins:{
                CSAOrigins:{
                    Points:points,
                    Type: "CSA Origins"
                }
            }
        });        
    }

    function createCSAOriginsData(plugin:Plugin.Controller, computationId:string){
        return new Promise<any>((res,rej)=>{
            MoleOnlineWebUI.DataProxy.CSAResidues.DataProvider.get(computationId,(compId,info)=>{
                let originsData:string=residuesToPoints(plugin, info);
                let csaOrigins = plugin.createTransform().add(plugin.root, Transformer.Data.FromData, { data: originsData, id: 'CSA Origins' }, { isHidden: true, ref:'csa-origins-object' })
                    .then(Transformer.Data.ParseJson, { id: 'Origins' }, { isHidden:true, ref: 'csa-origins' });
                plugin.applyTransform(csaOrigins)
                    .then(() => {
                        res();
                    })
                    .catch(error=>{
                        rej(error);
                    });
            })
        });
    }

    function generateGuid(tunnels:DataInterface.Tunnel[]){
        for(let idx=0;idx<tunnels.length;idx++){
            tunnels[idx].GUID = Bootstrap.Utils.generateUUID();
        }
        return tunnels;
    }

    function generateGuidMole(moleData:DataInterface.MoleData){
        moleData.Channels.MergedPores = generateGuid(moleData.Channels.MergedPores);
        moleData.Channels.Paths = generateGuid(moleData.Channels.Paths);
        moleData.Channels.Pores = generateGuid(moleData.Channels.Pores);
        moleData.Channels.Tunnels = generateGuid(moleData.Channels.Tunnels);

        return moleData
    }

    function generateGuidChannelsDB(moleData:DataInterface.ChannelsDBData){
        moleData.Channels.CofactorTunnels = generateGuid(moleData.Channels.CofactorTunnels);
        moleData.Channels.CSATunnels = generateGuid(moleData.Channels.CSATunnels);
        moleData.Channels.ReviewedChannels = generateGuid(moleData.Channels.ReviewedChannels);
        moleData.Channels.TransmembranePores = generateGuid(moleData.Channels.TransmembranePores);

        return moleData
    }

    function downloadChannelsData(plugin:Plugin.Controller, computationId:string, submitId:number){
        removeChannelsData(plugin);
        return new Promise<any>((res,rej)=>{
            ApiService.getChannelsData(computationId, submitId).then((data)=>{
                let channels = plugin.createTransform().add(plugin.root, Transformer.Data.FromData, { data, id: 'Computation Results' }, { isHidden: true, ref:'mole-data-object' })
                    .then(Transformer.Data.ParseJson, { id: 'Objects' }, { ref: 'mole-data', isHidden:true });
                plugin.applyTransform(channels)
                    .then(() => {
                        let parsedData = plugin.context.select('mole-data')[0] as Bootstrap.Entity.Data.Json;
                        
                        if (!parsedData){
                            rej('Data not available.');
                        }
                        else {
                            let data_ = parsedData.props.data as DataInterface.MoleData;
                            data_ = generateGuidMole(data_);
                            MoleOnlineWebUI.Cache.TunnelName.reload(data_);              
                            MoleOnlineWebUI.Bridge.Events.invokeChannelDataLoaded(data_);
                            showDefaultVisuals(plugin, data_.Channels)
                                .then(() =>{ 
                                    res();
                                });
                        }
                    })
                    .catch(error=>rej(error));
            })
            .catch(err=>rej(err))
        });
    }

    function downloadChannelsDBData(plugin:Plugin.Controller, computationId:string){
        removeChannelsData(plugin);
        return new Promise<any>((res,rej)=>{
            ApiService.getComputationInfoList(computationId).then(val=>{
                if(val.PdbId!==null){
                    MoleOnlineWebUI.Cache.ChannelsDBData.getChannelsData(val.PdbId).then(data=>{
                        let channels = plugin.createTransform().add(plugin.root, Transformer.Data.FromData, { data:JSON.stringify({Channels:data} as Object), id: 'Computation Results' }, { isHidden: false, ref:'mole-data-object' })
                        .then(Transformer.Data.ParseJson, { id: 'Objects' }, { ref: 'mole-data', isHidden:false });
                        
                        plugin.applyTransform(channels)
                        .then(() => {
                            let parsedData = plugin.context.select('mole-data')[0] as Bootstrap.Entity.Data.Json;
                            if (!parsedData){
                                rej('Data not available.');
                            }
                            else {
                                let data_ = parsedData.props.data as DataInterface.ChannelsDBData;
                                data_ = generateGuidChannelsDB(data_);
                                MoleOnlineWebUI.Bridge.Events.invokeChannelDataLoaded(data_);
                                showDefaultVisuals(plugin, data_.Channels)
                                    .then(() =>{ 
                                        res();
                                    }).catch(err=>console.log(err))
                            }
                        })
                        .catch(error=>rej(error));
                    }).catch(err=>rej(err))
                }
            }).catch(err=>rej(err))
        });
    }

    function downloadProteinData(plugin:Plugin.Controller, computationId:string, submitId:number){      
        return new Promise<any>((res,rej)=>{
            ApiService.getProteinStructure(computationId, submitId).then((data)=>{

                let format = Core.Formats.Molecule.SupportedFormats.mmCIF;
                if(data.filename!==null){
                    let f = Core.Formats.FormatInfo.getFormat(data.filename, Core.Formats.Molecule.SupportedFormats.All);
                    if(f!==void 0){
                        format = f;
                    }
                }

                let protein = plugin.createTransform()
                    .add(plugin.root, Transformer.Data.FromData, { data:data.data, id: `${computationId}/${submitId}`}, {isBinding:true, ref:'protein-data'})
                    .then(Transformer.Molecule.CreateFromData, {format}, { isBinding: true })
                    .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
                    .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true });
                
                plugin.applyTransform(protein)
                    .then(() => {
                        let polymerVisual = plugin.context.select('polymer-visual');
                        if(polymerVisual.length!==1){
                            rej("Application was unable to retrieve protein structure from coordinate server.");
                        }
                        else{
                            plugin.command(Bootstrap.Command.Entity.Focus, polymerVisual);
                            res();
                            MoleOnlineWebUI.Bridge.Events.invokeProteinDataLoaded((polymerVisual[0].props as any).model.model);
                        }
                    })
                    .catch(error=>rej(error));
            })
            .catch(error=>rej(error));
        });
    }

    export function loadData(plugin: Plugin.Controller, channelsDB:boolean) {

            //plugin.clear();
            if(Config.CommonOptions.DEBUG_MODE)
                console.profile("loadData");
            let modelLoadPromise = new Promise<any>((res,rej)=>{
                let parameters = CommonUtils.Router.getParameters();

                if(parameters===null){
                    rej("Corrupted url found - cannot parse parameters.");
                    return;
                }

                let computationId = parameters.computationId;
                let submitId = parameters.submitId;
                if(Config.CommonOptions.DEBUG_MODE)
                    console.log("Status watcher - BEFORE EXEC");
                MoleOnlineWebUI.DataProxy.JobStatus.Watcher.registerOnChangeHandler(computationId,submitId,(status=>{
                    if(Config.CommonOptions.DEBUG_MODE)
                        console.log("Watcher iteration");
                    let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                    let proteinLoaded = existsRefInTree(plugin.root,'protein-data');
                    /*
                    "Initializing"| OK
                    "Initialized"| OK
                    "FailedInitialization"| OK
                    "Running"| OK
                    "Finished"| OK
                    "Error"| OK
                    "Deleted"| OK
                    "Aborted"; OK
                    */
                    if(status.Status === "Initializing" || status.Status === "Running"){
                        //Do Nothing
                        if(Config.CommonOptions.DEBUG_MODE)
                            console.log("Waiting for status change");
                    }
                    else if(status.Status === "Initialized"){                        
                        acquireData(computationId,submitId,plugin,res,rej,!proteinLoaded,submitId==0,channelsDB);
                    }
                    else if(status.Status === "FailedInitialization" || status.Status === "Error" || status.Status === "Deleted" || status.Status === "Aborted"){
                        rej(status.ErrorMsg);
                    }
                    else if(status.Status === "Finished"){
                        acquireData(computationId,submitId,plugin,res,rej,!proteinLoaded,true,channelsDB);
                    }                        
                }),(err)=>rej(err));
            })

            let promises = [];

            promises.push(modelLoadPromise);
            
        return Promise.all(promises);
    }

    function existsRefInTree(root:Bootstrap.Entity.Any,ref:string){
        if(root.ref===ref){
            return true;
        }
        for(let c of root.children){
            if(existsRefInTree(c, ref)){
                return true;
            }
        }

        return false;
    }

    function acquireData(computationId:string, submitId:number, plugin:LiteMol.Plugin.Controller, res:any, rej:any, protein:boolean, channels:boolean, channelsDB:boolean){
        let promises = [];

        if(protein){
            if(Config.CommonOptions.DEBUG_MODE)
                console.log("reloading protein structure");
            let proteinAndCSA = new Promise<any>((res,rej)=>{
                downloadProteinData(plugin, computationId, submitId)
                    .then(()=>{
                        let csaOriginsExists = existsRefInTree(plugin.root,'csa-origins');
                        if(!csaOriginsExists){
                            if(Config.CommonOptions.DEBUG_MODE)
                                console.log("reloading CSA Origins");
                            createCSAOriginsData(plugin,computationId)
                                .then(()=>res())
                                .catch((err)=>rej(err));
                        }
                        else{
                            res();
                        }
                    })
                    .catch(err=>rej(err))
            });
            
            promises.push(proteinAndCSA);
        }
        if(channels&&!channelsDB){
            if(Config.CommonOptions.DEBUG_MODE)
                console.log("reloading channels");
            promises.push(downloadChannelsData(plugin, computationId, submitId));
        }
        if(channelsDB){
            promises.push(downloadChannelsDBData(plugin, computationId));
        }

        Promise.all(promises)
            .then(()=>{
                res();
                if(Config.CommonOptions.DEBUG_MODE)
                    console.profileEnd();
            })
            .catch((error)=>{
                rej(error);
            })
    }

    function createSurface(mesh: any) {
        // wrap the vertices in typed arrays
        if (!(mesh.Vertices instanceof Float32Array)) {
            mesh.Vertices = new Float32Array(mesh.Vertices);
        }
        if (!(mesh.Vertices instanceof Uint32Array)) {
            mesh.Triangles = new Uint32Array(mesh.Triangles);
        }

        let surface = <Core.Geometry.Surface>{
            vertices: mesh.Vertices,
            vertexCount: (mesh.Vertices.length / 3) | 0,
            triangleIndices: new Uint32Array(mesh.Triangles),
            triangleCount: (mesh.Triangles.length / 3) | 0,
        };

        return surface;
    }

    function createTriangleSurface(mesh: any) {
        const triangleCount = (mesh.Triangles.length / 3) | 0;
        const vertexCount = triangleCount * 3;

        const srcV = mesh.Vertices;
        const srcT = mesh.Triangles;

        const vertices = new Float32Array(vertexCount * 3);
        const triangleIndices = new Uint32Array(triangleCount * 3);
        const annotation = new Int32Array(vertexCount) as any as number[];

        const tri = [0,0,0];
        for (let i = 0, _i = mesh.Triangles.length; i < _i; i += 3) {
            tri[0] = srcT[i]; tri[1] = srcT[i + 1]; tri[2] = srcT[i + 2];

            for (let j = 0; j < 3; j++) {
                const v = i + j;
                vertices[3 * v] =  srcV[3 * tri[j]];
                vertices[3 * v + 1] =  srcV[3 * tri[j] + 1];
                vertices[3 * v + 2] =  srcV[3 * tri[j] + 2];
                triangleIndices[i + j] = i + j;
            }
        }
        for (let i = 0; i < triangleCount; i++) {
            for (let j = 0; j < 3; j++) annotation[3 * i + j] = i;
        }

        const surface = <Core.Geometry.Surface>{
            vertices,
            vertexCount,
            triangleIndices,
            triangleCount,
            annotation
        };

        return surface;
    }

    function createTunnelSurface(sphereArray: DataInterface.Profile[]){
        let s = Visualization.Primitive.Builder.create();
        let id = 0;
        let idxFilter = 1;
        let idxCounter = 0;
        for (let sphere of sphereArray) {
            idxCounter++;
            if((idxCounter-1)%idxFilter!==0){
                continue;
            }
            s.add({ type: 'Sphere', id: 0/*id++*/, radius: sphere.Radius, center: [ sphere.X, sphere.Y, sphere.Z ], tessalation: 2 });
        }        
        return s.buildSurface().run();
    }    
        
    function getSurfaceColorByType(type:string){
        switch(type){
            /*case 'Cavity': return ColorScheme.Colors.get(ColorScheme.Enum.Cavity);
            case 'MolecularSurface': return ColorScheme.Colors.get(ColorScheme.Enum.Surface);
            case 'Void': return ColorScheme.Colors.get(ColorScheme.Enum.Void);*/
            default : return ColorScheme.Colors.get(ColorScheme.Enum.DefaultColor);
        }
    }

    function showSurfaceVisuals(plugin: Plugin.Controller, elements: any[], visible: boolean, type: string, label: (e: any) => string, alpha: number): Promise<any> {
        let t = plugin.createTransform();
        let needsApply = false;

        for (let element of elements) {
            if (!element.__id) element.__id = Bootstrap.Utils.generateUUID();
            if (!!element.__isVisible === visible) continue;

            element.__isVisible = visible;
            if (!element.__color) {
                element.__color = getSurfaceColorByType(element.Type);
            }

            if (!visible) {
                plugin.command(Bootstrap.Command.Tree.RemoveNode, element.__id);
            }else if(type==="Cavity"&&(!!element.Mesh.Boundary||!!element.Mesh.Inner)){
                const boundarySurface = createTriangleSurface(element.Mesh.Boundary);
 
                const group = t.add('mole-data', Transformer.Basic.CreateGroup, { }, { ref: element.__id, isHidden: true });
                group.then(Transformer.Basic.CreateSurfaceVisual, {
                    label: label(element),
                    tag: <SurfaceTag>{ kind: 'Cavity-boundary', element, surface: boundarySurface },
                    surface: boundarySurface,
                    theme: Behaviour.CavityTheme.boundary
                });
                group.then(Transformer.Basic.CreateSurfaceVisual, {
                    label: label(element),
                    tag: <SurfaceTag>{ kind: 'Cavity-inner', element },
                    surface: createSurface(element.Mesh.Inner),
                    theme: Behaviour.CavityTheme.inner
                });
                needsApply = true;
            } 
            else {
                let surface = createSurface(element.Mesh);
                t.add('mole-data', CreateSurface, {
                    label: label(element),
                    tag: <SurfaceTag>{ kind:type, element },
                    surface,
                    color: element.__color as Visualization.Color,
                    isInteractive: true,
                    transparency: { alpha }
                }, { ref: element.__id, isHidden: true });
                needsApply = true;
            }
        }

        if (needsApply) {
            return new Promise<any>((res, rej) => {
                plugin.applyTransform(t).then(() => {
                    for (let element of elements) {
                        element.__isBusy = false;
                    }
                    res();
                }).catch(e => rej(e));
            });
        }
        else {
            return new Promise<any>((res, rej) => {
                for (let element of elements) {
                    element.__isBusy = false;
                }
                res();
            });
        }
    }

    export function showCavityVisuals(plugin: Plugin.Controller, cavities: any[], visible: boolean): Promise<any> {
        return showSurfaceVisuals(plugin, cavities, visible, 'Cavity', (cavity: any) => `${cavity.Type} ${cavity.Id}`, 0.33);
    }

    export interface TunnelMetaInfo extends DataInterface.Tunnel{
        __id:string,
        __isVisible:boolean,
        __color:Visualization.Color,
        __isBusy:boolean
    };
    
    export function showChannelVisuals(plugin: Plugin.Controller, channels: TunnelMetaInfo[], visible: boolean, forceRepaint?:boolean): Promise<any> {
        let label = (channel: any) => `${channel.Type} ${CommonUtils.Tunnels.getName(channel)}`;
        /*let type = "Channel";*/
        let alpha = 1.0;

        let promises = [];
        let visibleChannels:DataInterface.Tunnel[] = [];
        for (let channel of channels) {
            // Stejné jako v Examples/Channels
            if (!channel.__id) channel.__id = Bootstrap.Utils.generateUUID();
            if (!!channel.__isVisible === visible && !forceRepaint) continue;

            if(forceRepaint!==void 0&&forceRepaint){
                plugin.command(Bootstrap.Command.Tree.RemoveNode, channel.__id);
            }

            channel.__isVisible = visible;
            if (!channel.__color) {
                channel.__color = ColorScheme.Colors.getRandomUnused();
            }

            if (!visible) {
                plugin.command(Bootstrap.Command.Tree.RemoveNode, channel.__id);
            } else {
                visibleChannels.push(channel);
                //Zde se volá mnou vytvořená funkce pro generování povrchu podle koulí z JSONu(u nás zatím Centerline, u Vás Profile)
                let sphereSurfacePromise = createTunnelSurface(channel.Profile);//createTunnelSurfaceWithLayers(channel.Profile, channel.Layers);
                
                promises.push(new Promise<any>((res,rej) => {
                    //Zpracování úspěšně vygenerovného povrchu tunelu
                    sphereSurfacePromise.then((val) => {
                        let surface = val;
                        /*
                        if(surface.surface.annotation !== void 0){
                            console.log("---");
                            console.log(`annotations length: ${surface.surface.annotation.length}`);
                            console.log(`profile parts count: ${channel.Profile.length}`);
                            console.log("---");
                            for(let i=0;i<surface.surface.annotation.length;i++){                                
                                surface.surface.annotation[i] = 0;
                                //console.log(`surface.annotation: ${surface.surface.annotation[i]}`);
                            }
                        }
                        */
                        
                        let t = plugin.createTransform();                        
                        t.add('mole-data', CreateSurface, {
                            label: label(channel),
                            tag: <SurfaceTag>{ kind:"Channel", element: channel },
                            surface: surface/*.surface*/,
                            color: channel.__color as Visualization.Color,
                            isInteractive: true,
                            transparency: { alpha },
                        }, { ref: channel.__id, isHidden: true });

                        plugin.applyTransform(t).then(()=>{res();});
                    }).catch(rej);
                }));
            }
        }

        MoleOnlineWebUI.Cache.LastVisibleChannels.set(visibleChannels);

        return Promise.all(promises).then(()=>{
            for(let channel of channels){
                channel.__isBusy = false;
            }
        });
    }

    function createOriginsSurface(origins: any): Promise<Core.Geometry.Surface> {
        if (origins.__surface) return Promise.resolve(origins.__surface);

        let s = Visualization.Primitive.Builder.create();
        let id = 0;
        for (let p of origins.Points) {
            s.add({ type: 'Sphere', id: id++, radius: 1.69, center: [ p.X, p.Y, p.Z ] });
        }
        return s.buildSurface().run();        
    }

    function getOriginColorByType(origins:any){
        switch(origins.Type as string){
            case 'Computed': return ColorScheme.Colors.get(ColorScheme.Enum.ComputedOrigin);
            case 'CSA Origins': return ColorScheme.Colors.get(ColorScheme.Enum.CSAOrigin);
            default:return ColorScheme.Colors.get(ColorScheme.Enum.OtherOrigin);
        }
    }

    export function showOriginsSurface(plugin: Plugin.Controller, origins: any, visible: boolean): Promise<any> {
        if (!origins.__id) origins.__id = Bootstrap.Utils.generateUUID();
        if (!origins.Points.length || !!origins.__isVisible === visible) return Promise.resolve();

        origins.__isVisible = visible;
        if (!visible) {
            plugin.command(Bootstrap.Command.Tree.RemoveNode, origins.__id);
            origins.__isBusy = false;
            return Promise.resolve();
        }

        if (!origins.__color) {
            origins.__color = getOriginColorByType(origins);
        }

        return new Promise((res, rej) => {
            createOriginsSurface(origins).then(surface => {
                let t = plugin.createTransform()
                    .add('mole-data', CreateSurface, {
                        label: 'Origins (' + origins.Type + ')',
                        tag: <SurfaceTag>{ kind: 'Origins', element: origins },
                        surface,
                        isInteractive: true,
                        color: origins.__color as Visualization.Color
                    }, { ref: origins.__id, isHidden: true });
                
                plugin.applyTransform(t).then(() => {
                    origins.__isBusy = false;
                    res();
                }).catch(rej);
            }).catch(rej);
        });
    }

    export interface CreateSurfaceProps { label?: string, tag?: SurfaceTag, surface?: Core.Geometry.Surface, color?: Visualization.Color, transparency?: Visualization.Theme.Transparency, isWireframe?: boolean, isInteractive?: boolean }
    export const CreateSurface = Bootstrap.Tree.Transformer.create<Bootstrap.Entity.Data.Json, Bootstrap.Entity.Visual.Surface, CreateSurfaceProps>({
        id: 'mole-example-create-surface',
        name: 'Create Surface',
        description: 'Create a surface entity.',
        from: [Bootstrap.Entity.Data.Json],
        to: [Bootstrap.Entity.Visual.Surface],
        defaultParams: () => ({}),
        isUpdatable: false
    }, (context, a, t) => {
        let theme = Visualization.Theme.createUniform({ colors: LiteMol.Core.Utils.FastMap.ofArray<string, LiteMol.Visualization.Color>([['Uniform', t.params.color!]]), interactive: t.params.isInteractive, transparency: t.params.transparency });
        let style: Bootstrap.Visualization.Style<'Surface', {}> = {
            type: 'Surface',
            taskType: 'Silent',
            //isNotSelectable: false,
            params: {},
            theme: <any>void 0
        };

        return Bootstrap.Task.create<Bootstrap.Entity.Visual.Surface>(`Create Surface`, 'Silent', async ctx => {
            let model = await LiteMol.Visualization.Surface.Model.create(t.params.tag, { surface: t.params.surface!, theme, parameters: { isWireframe: t.params.isWireframe! } }).run(ctx);
            return Bootstrap.Entity.Visual.Surface.create(t, { label: t.params.label!, model, style, isSelectable: true, tag: t.params.tag });
        });
    }
    );
}