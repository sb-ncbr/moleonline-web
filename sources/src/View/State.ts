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

    export interface SurfaceTag { type: string, element?: any }

    function showDefaultVisuals(plugin: Plugin.Controller, data: any) {
        return new Promise(res => {
            let toShow = [];
     
            if(data.MergedPores.length > 0){
                toShow = data.MergedPores;
            }
            else if(data.Paths.length > 0){
                toShow = data.Paths;
            }
            else if(data.Pores.length > 0){
                toShow = data.Pores;
            }
            else if(data.Tunnels.length > 0){
                toShow = data.Tunnels;
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
            let positions:Point[] = [];
            
            for(let residue of origin){
                let moleculeModel = getNodeFromTree(plugin.root,'protein-data');
                if(moleculeModel===null){
                    console.log("protein data not ready!");
                    return "";
                }

                let proteinData = moleculeModel.children[0].props.molecule.models[0].data;

                let indices = [];
                let residueCount = moleculeModel.children[0].props.molecule.models[0].data.residues.count;
                for(let i=0;i<residueCount;i++){
                    if(String(proteinData.residues.authSeqNumber[i])===String(residue.SequenceNumber)
                        && String(proteinData.residues.authAsymId[i])===residue.Chain){
                        indices.push(proteinData.residues.atomStartIndex[i]);
                        indices.push(proteinData.residues.atomEndIndex[i]);
                        break;
                    }
                }
                
                for(let i=0;i<indices.length;i++){
                    positions.push({
                        X:moleculeModel.children[0].props.molecule.models[0].positions.x[indices[i]] as number,
                        Y:moleculeModel.children[0].props.molecule.models[0].positions.y[indices[i]] as number,
                        Z:moleculeModel.children[0].props.molecule.models[0].positions.z[indices[i]] as number
                    });
                }                        
            }

            if(positions.length<2)
                continue;
            
            let sum = positions.reduce((prev,cur,idx,array)=>{
                return {
                    X:prev.X+cur.X,
                    Y:prev.Y+cur.Y,
                    Z:prev.Z+cur.Z
                }
            });
            let centerOfMass = {
                X:sum.X/positions.length,
                Y:sum.Y/positions.length,
                Z:sum.Z/positions.length,
            };
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

    function generateGuid(moleData:DataInterface.MoleData){
        let f:(channels:DataInterface.Tunnel[])=>DataInterface.Tunnel[] = (channels:DataInterface.Tunnel[])=>{
            for(let idx=0;idx<channels.length;idx++){
                channels[idx].Id = Bootstrap.Utils.generateUUID();
            }
            return channels;
        };

        moleData.Channels.MergedPores = f(moleData.Channels.MergedPores);
        moleData.Channels.Paths = f(moleData.Channels.Paths);
        moleData.Channels.Pores = f(moleData.Channels.Pores);
        moleData.Channels.Tunnels = f(moleData.Channels.Tunnels);
        
        return moleData;
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
                            data_ = generateGuid(data_);
                            MoleOnlineWebUI.Cache.TunnelName.reload(data_);
                            MoleOnlineWebUI.Bridge.Events.invokeChannelDataLoaded(data_);
                            showDefaultVisuals(plugin, data_.Channels)
                                .then(() =>{ 
                                    res();
                                });
                        }
                    })
                    .catch(error=>rej(error));
            });
        });
    }

    function downloadProteinData(plugin:Plugin.Controller, computationId:string, submitId:number){      
        return new Promise<any>((res,rej)=>{
            ApiService.getProteinStructure(computationId, submitId).then((data)=>{
                let protein = plugin.createTransform()
                    .add(plugin.root, Transformer.Data.FromData, { data, id: `${computationId}/${submitId}`}, {isBinding:true, ref:'protein-data'})
                    .then(Transformer.Molecule.CreateFromData, { format: Core.Formats.Molecule.SupportedFormats.mmCIF }, { isBinding: true })
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

    export function loadData(plugin: Plugin.Controller) {
        
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
                        acquireData(computationId,submitId,plugin,res,rej,!proteinLoaded,submitId==0);
                    }
                    else if(status.Status === "FailedInitialization" || status.Status === "Error" || status.Status === "Deleted" || status.Status === "Aborted"){
                        rej(status.ErrorMsg);
                    }
                    else if(status.Status === "Finished"){
                        acquireData(computationId,submitId,plugin,res,rej,!proteinLoaded,true);
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

    function acquireData(computationId:string, submitId:number, plugin:LiteMol.Plugin.Controller, res:any, rej:any, protein:boolean, channels:boolean){
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
        if(channels){
            if(Config.CommonOptions.DEBUG_MODE)
                console.log("reloading channels");
            promises.push(downloadChannelsData(plugin, computationId, submitId));
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

    //Added
    function createTunnelSurface_sphere(sphereArray: DataInterface.Profile[]){
        let idxFilter = 1;
        let posTableBuilder = Core.Utils.DataTable.builder<Core.Structure.Position>(Math.ceil(sphereArray.length/idxFilter));
        
        posTableBuilder.addColumn("x", Core.Utils.DataTable.customColumn<Core.Structure.Position>());
        posTableBuilder.addColumn("y", Core.Utils.DataTable.customColumn<Core.Structure.Position>());
        posTableBuilder.addColumn("z", Core.Utils.DataTable.customColumn<Core.Structure.Position>());

        let rowIdx = 0;
        let positions = posTableBuilder.seal(); 
        
        let sphereCounter = 0;
        for(let sphere of sphereArray){
            sphereCounter++;
            if((sphereCounter-1)%idxFilter!==0){
                continue;
            }

            positions.x[rowIdx] = sphere.X.valueOf();
            positions.y[rowIdx] = sphere.Y.valueOf();
            positions.z[rowIdx] = sphere.Z.valueOf();

            rowIdx++;
        }

        return LiteMol.Core.Geometry.MolecularSurface.computeMolecularSurfaceAsync({
            positions,
            atomIndices: positions.indices,
            parameters:  {
                atomRadius: ((i: number) => {
                    return sphereArray[i*idxFilter].Radius.valueOf();
                }),
                probeRadius: 0,
                smoothingIterations: 2,
                interactive: true, //false
            },                
        }).run();
    }

    //Added
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

    function adjustRadius(profileRadius:number, maxProfileRadius:number, maxLayerRadius:number){
        return (maxLayerRadius/maxProfileRadius)*profileRadius;
    }
    

    function getLayerRadiusByDistance(distance:number,layers:DataInterface.Layers,lastLayerIdx:&number):number{            
            let __start = layers.LayersInfo[lastLayerIdx].LayerGeometry.StartDistance;
            let __end = layers.LayersInfo[lastLayerIdx].LayerGeometry.EndDistance;
            let __s = Math.max(__start,distance);
            let __e = Math.min(__end,distance);
            //console.log({__start,__end,__s,__e,distance,lastLayerIdx});
            if(__e-__s===0){
                return layers.LayersInfo[lastLayerIdx].LayerGeometry.MinRadius;
            }
            lastLayerIdx++;
            if(lastLayerIdx===layers.LayersInfo.length){
                return 0;
            }

            return getLayerRadiusByDistance(distance,layers,lastLayerIdx);
        }

    function buildRingSurface(s: Visualization.Primitive.Builder,spheres:DataInterface.Profile[],id:number,parts:number=8){
        let sphere = spheres[id];
        if(id === 0 || id === spheres.length-1){
            s.add({ type: 'Sphere', id, radius: sphere.Radius, center: [ sphere.X, sphere.Y, sphere.Z ], tessalation: 2 });            
            return;
        }
        interface vector3{x:number,y:number,z:number};
        let prevSphere = spheres[id-1];
        let nextSphere = spheres[id+1];
        let normalize = (vec3: vector3) =>{
            let __divisor = Math.max(Math.abs(vec3.x),Math.abs(vec3.y),Math.abs(vec3.z));
            if(__divisor === 0){
                return vec3;
            }

            return {x: vec3.x/__divisor, y: vec3.y/__divisor, z: vec3.z/__divisor};
        };
        let greatest = (vec3: vector3) => {
            let __max = Math.max(Math.abs(vec3.x),Math.abs(vec3.y),Math.abs(vec3.z));    

            return (__max===vec3.x)?0:(__max===vec3.y)?1:2;
        };

        let rotateByMat = (vec3: vector3, mat:number[][]) => {
            return multiplyMatVec(mat,vec3);
        };

        //OK
        let multiplyMatMat = (m1:number[][],m2:number[][]) => {
            let mat = [];
            for(let m1r=0;m1r<3;m1r++){
                let row = [];
                for(let m2c=0;m2c<3;m2c++){
                    let a = 0;
                    for(let m2r=0;m2r<3;m2r++){
                        a+=m1[m1r][m2r]*m2[m2r][m2c];
                    }
                    row.push(a);
                }
                mat.push(row);
            }
            return mat;
        };

        let tstMat1 = [
            [1,2,3],
            [4,5,6],
            [7,8,9]
        ];
        let tstMat2 = [
            [9,8,7],
            [6,5,4],
            [3,2,1]
        ];

        //console.log("TSTMAT:");
        //console.log(multiplyMatMat(tstMat1,tstMat2));

        //OK
        let multiplyMatVec = (m:number[][],v:vector3) => {
            let __u:number[] = [];
            for(let row=0;row<3;row++){
                __u.push(m[row][0]*v.x + m[row][1]*v.y + m[row][2]*v.z);
            }
            return {
                x: __u[0],
                y: __u[1],
                z: __u[2]
            };
        };

        //console.log("TSTMATVEC:");
        //console.log(multiplyMatVec(tstMat1,{x:1,y:2,z:3}));

        let toRad = (degrees:number) => {
            return (degrees*Math.PI)/180;
        };

        let Rx = (radFi:number) => {
            return [
                [1,0,0],
                [0,Math.cos(radFi),-Math.sin(radFi)],
                [0,Math.sin(radFi),Math.cos(radFi)]
            ]
        };
        let Ry = (radFi:number) => {
            return [
                [Math.cos(radFi),0,Math.sin(radFi)],
                [0,1,0],
                [-Math.sin(radFi),0,Math.cos(radFi)]
            ]
        };
        let Rz = (radFi:number) => {
            return [
                [Math.cos(radFi),-Math.sin(radFi),0],
                [Math.sin(radFi),Math.cos(radFi),0],
                [0,0,1]
            ]
        };

        let Rxy = (radFi:number) => {
            return multiplyMatMat(Rx(radFi),Ry(radFi))
        };
        let Ryz = (radFi:number) => {
            return multiplyMatMat(Ry(radFi),Rz(radFi))
        };
        let Rxz = (radFi:number) => {
            return multiplyMatMat(Rx(radFi),Rz(radFi))
        };

        let n = {
            x: nextSphere.X-prevSphere.X,
            y: nextSphere.Y-prevSphere.Y,
            z: nextSphere.Z-prevSphere.Z
        }

        n = normalize(n);

        let majorAxis = greatest(n);
        let v;
        switch(majorAxis){
            case 0:
                v = rotateByMat(n,Rz(toRad(90)));
                break;
            case 1:
                v = rotateByMat(n,Rx(toRad(90)));
                break;
            default:
                v = rotateByMat(n,Ry(toRad(90)));
                break;
        }

        let radius = (2*Math.PI*sphere.Radius)/parts;
        for(let i=0;i<parts;i++){
            let u:vector3;            
            switch(majorAxis){
                case 0:
                    u = rotateByMat(n,Rxy(toRad(i*(360/parts))));
                    break;
                case 1:
                    u = rotateByMat(n,Ryz(toRad(i*(360/parts))));
                    break;
                default:
                    u = rotateByMat(n,Rxz(toRad(i*(360/parts))));
                    break;
            }
            u = normalize(u);
            let center = [
                sphere.X+u.x*sphere.Radius,
                sphere.Y+u.y*sphere.Radius,
                sphere.Z+u.z*sphere.Radius
            ];

            s.add({ type: 'Sphere', id, radius:1, center, tessalation: 2 });
        }
    }
    
    //Added
    function createTunnelSurfaceWithLayers(sphereArray: DataInterface.Profile[], layers:DataInterface.Layers){        
        //let layerProfileMap = new Map<number,>
        
        let id = 0;
        //let promises = [];
        let s = Visualization.Primitive.Builder.create();
        for (let sphere of sphereArray) {
            buildRingSurface(s,sphereArray,id++);
        }
        return s.buildSurface().run();

/*
        return Promise.all(promises).then(res => {
            let s = Visualization.Primitive.Builder.create();
            for(let i = 0;i<res.length;i++){
                s.add({type:'Surface', surface: res[i], id:i}); 
            }
            return s.buildSurface().run();
        });
  */      
    }

    
    function getSurfaceColorByType(type:string){
        switch(type){
            case 'Cavity': return ColorScheme.Colors.get(ColorScheme.Enum.Cavity);
            case 'MolecularSurface': return ColorScheme.Colors.get(ColorScheme.Enum.Surface);
            case 'Void': return ColorScheme.Colors.get(ColorScheme.Enum.Void);
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
            } else {
                let surface = createSurface(element.Mesh);
                t.add('mole-data', CreateSurface, {
                    label: label(element),
                    tag: { type, element },
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

    export interface TunnelMetaInfo{
        __id:string,
        __isVisible:boolean,
        __color:Visualization.Color,
        __isBusy:boolean
    };
    //Modified
    export function showChannelVisuals(plugin: Plugin.Controller, channels: DataInterface.Tunnel[]&TunnelMetaInfo[], visible: boolean, forceRepaint?:boolean): Promise<any> {
        let label = (channel: any) => `${channel.Type} ${CommonUtils.Tunnels.getName(channel)}`;
        /*let type = "Channel";*/
        let alpha = 1.0;

        let promises = [];
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
                            tag: { type:channel.Type, element: channel },
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
                        tag: { type: 'Origins', element: origins },
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