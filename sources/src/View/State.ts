/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Example.Channels.State {

    import Tree = Bootstrap.Tree;
    import Transform = Tree.Transform;  

    import Transformer = Bootstrap.Entity.Transformer;

    export interface SurfaceTag { type: string, element?: any }

    function showDefaultVisuals(plugin: Plugin.Controller, data: any, channelCount: number) {
        return new Promise(res => {
            let toShow = [];
            if(data.ReviewedChannels.length > 0){
                toShow = data.ReviewedChannels;
            }
            else if(data.CSATunnels.length > 0){
                toShow = data.CSATunnels;
            }
            else if(data.TransmembranePores.length > 0){
                toShow = data.TransmembranePores;
            }
            else if(data.CofactorTunnels.length > 0){
                toShow = data.CofactorTunnels;
            }
            
            return showChannelVisuals(plugin, toShow/*.slice(0, channelCount)*/, true).then(() => {
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

    export function loadData(plugin: Plugin.Controller, pdbId: string, url: string) {
        
            plugin.clear();

            //Subscribe for data
            Annotation.AnnotationDataProvider.subscribeToPluginContext(plugin.context);
            
            let modelLoadPromise = new Promise<any>((res,rej)=>{
                let assemblyInfo = plugin.createTransform().add(plugin.root, Transformer.Data.Download, { 
                        url: `https://webchem.ncbr.muni.cz/API/ChannelsDB/Assembly/${pdbId}`, 
                        type: 'String', 
                        id: 'AssemblyInfo'                        
                    }, { isHidden: false })
                    .then(Transformer.Data.ParseJson, { id: 'AssemblyInfo' }, { ref: 'assembly-id' });
                plugin.applyTransform(assemblyInfo).then(() => {
                    let parsedData = plugin.context.select('assembly-id')[0] as Bootstrap.Entity.Data.Json;
                    if (!parsedData) throw new Error('Data not available.');
                    else {
                        let assemblyId = parsedData.props.data.AssemblyID as number;

                        let model = plugin.createTransform()
                            .add(plugin.root, Transformer.Data.Download, { url: `http://www.ebi.ac.uk/pdbe/coordinates/${pdbId}/assembly?id=${assemblyId}`, type: 'String', id: pdbId })
                            .then(Transformer.Molecule.CreateFromData, { format: Core.Formats.Molecule.SupportedFormats.mmCIF }, { isBinding: true })
                            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
                            .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true });

                        plugin.applyTransform(model)
                            .then(() => {
                                if(plugin.context.select('polymer-visual').length!==1){
                                    rej("Application was unable to retrieve protein structure from coordinate server.");
                                }
                                plugin.command(Bootstrap.Command.Entity.Focus, plugin.context.select('polymer-visual'));
                                res();
                            })
                    }
                });
            })

            /*
            let model = plugin.createTransform()
                    .add(plugin.root, Transformer.Data.Download, { url: `http://www.ebi.ac.uk/pdbe/coordinates/${pdbId}/assembly?id=1`, type: 'String', id: pdbId })
                    .then(Transformer.Molecule.CreateFromData, { format: Core.Formats.Molecule.SupportedFormats.mmCIF }, { isBinding: true })
                    .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
                    .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true })
            */
            let data = plugin.createTransform().add(plugin.root, Transformer.Data.Download, { url, type: 'String', id: 'MOLE Data' }, { isHidden: false })
                .then(Transformer.Data.ParseJson, { id: 'MOLE Data' }, { ref: 'mole-data' });

            let annotationData = plugin.createTransform().add(plugin.root, Transformer.Data.Download, { url: `https://webchem.ncbr.muni.cz/API/ChannelsDB/Annotations/${pdbId}`, type: 'String', id: 'ChannelDB annotation Data' }, { isHidden: false })
                .then(Transformer.Data.ParseJson, { id: 'ChannelDB annotation Data' }, { ref: 'channelsDB-annotation-data' });

            let promises = [];

            promises.push(modelLoadPromise);
            
            /*
            promises.push(plugin.applyTransform(model)
                .then(() => {
                    plugin.command(Bootstrap.Command.Entity.Focus, plugin.context.select('polymer-visual'));
                }));
            */
            promises.push(plugin.applyTransform(data)
                .then(() => {
                    let parsedData = plugin.context.select('mole-data')[0] as Bootstrap.Entity.Data.Json;

                    if (!parsedData) throw new Error('Data not available.');
                    else {
                        let data_ = parsedData.props.data as DataInterface.MoleData;
                        showDefaultVisuals(plugin, data_.Channels, /*data_.Channels.length*/2);/*.then(() => res(data_.Channels));*/
                    }
                }));

            //promises.push(plugin.applyTransform(annotationData));
            plugin.applyTransform(annotationData); //Annotations se donačtou později -> nebude se na ně čekat s vykreslováním UI

        return Promise.all(promises);
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

    let colorIndex = Visualization.Molecule.Colors.DefaultPallete.length - 1;
    function nextColor() {
        return Visualization.Color.random();

        // can use the build in palette for example like this:
        // let color = Visualization.Molecule.Colors.DefaultPallete[colorIndex];
        // colorIndex--;
        // if (colorIndex < 0) colorIndex = Visualization.Molecule.Colors.DefaultPallete.length - 1;
        // return color;
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
            s.add({ type: 'Sphere', id: 0/*id++*/, radius: sphere.Radius, center: { x: sphere.X, y: sphere.Y, z: sphere.Z }, tessalation: 2 });
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
            s.add({ type: 'Sphere', id, radius: sphere.Radius, center: { x: sphere.X, y: sphere.Y, z: sphere.Z }, tessalation: 2 });            
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
            let center = {
                x: sphere.X+u.x*sphere.Radius,
                y: sphere.Y+u.y*sphere.Radius,
                z: sphere.Z+u.z*sphere.Radius
            };

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

    function showSurfaceVisuals(plugin: Plugin.Controller, elements: any[], visible: boolean, type: string, label: (e: any) => string, alpha: number): Promise<any> {
        // I am modifying the original JSON response. In general this is not a very good
        // idea and should be avoided in "real" apps.

        let t = plugin.createTransform();
        let needsApply = false;

        for (let element of elements) {
            if (!element.__id) element.__id = Bootstrap.Utils.generateUUID();
            //console.log(!!element.__isVisible);
            if (!!element.__isVisible === visible) continue;
            //console.log("for 1");
            element.__isVisible = visible;
            if (!element.__color) {
                // the colors should probably be initialized when the data is loaded
                // so that they are deterministic...
                element.__color = nextColor();
                //console.log("got new color");
            }

            if (!visible) {
                //console.log("node removed");
                plugin.command(Bootstrap.Command.Tree.RemoveNode, element.__id);
            } else {
                //console.log("creating surface from mesh");
                //console.log(element.Mesh);
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
            //console.log("needs apply = true");
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
            //console.log("needs apply = false");
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

    interface TunnelMetaInfo{
        __id:string,
        __isVisible:boolean,
        __color:Visualization.Color,
        __isBusy:boolean
    };
    //Modified
    export function showChannelVisuals(plugin: Plugin.Controller, channels: DataInterface.Tunnel[]&TunnelMetaInfo[], visible: boolean): Promise<any> {
        let label = (channel: any) => `${channel.Type} ${channel.Id + 1}`;
        /*let type = "Channel";*/
        let alpha = 1.0;

        let promises = [];
        for (let channel of channels) {

            // Stejné jako v Examples/Channels
            if (!channel.__id) channel.__id = Bootstrap.Utils.generateUUID();
            if (!!channel.__isVisible === visible) continue;

            channel.__isVisible = visible;
            if (!channel.__color) {
                // the colors should probably be initialized when the data is loaded
                // so that they are deterministic...
                channel.__color = nextColor();
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
            s.add({ type: 'Sphere', id: id++, radius: 1.69, center: { x: p.X, y: p.Y, z: p.Z } });
        }
        return s.buildSurface().run();        
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
            // the colors should probably be initialized when the data is loaded
            // so that they are deterministic...
            origins.__color = nextColor();
        }

        return new Promise((res, rej) => {
            createOriginsSurface(origins).then(surface => {
                let t = plugin.createTransform()
                    .add('mole-data', CreateSurface, {
                        label: 'Origins ' + origins.Type,
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