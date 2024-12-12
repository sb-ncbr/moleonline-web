/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
import { ComputationInfo, DataProxyCSAResidues, JobStatus } from "../DataProxy";
import { ChannelsDBChannels, ChannelsDBData, Membrane, MoleData, Origins, Tunnel, TunnelMetaInfo } from "../DataInterface";
import { Events, Instances } from "../Bridge";
import { ChannelsDBData as ChannelsDBDataCache, LastVisibleChannels, TunnelName } from "../Cache";
import { getParameters } from "../Common/Util/Router";
import { ApiService, CompInfo, CSAResidues } from "../MoleAPIService";
import { Context } from "./Context";
import { CommonOptions } from "../../config/common";
import { Residues } from "./CommonUtils/Residues";
import { ParseJson, RawData } from "molstar/lib/mol-plugin-state/transforms/data";
import { UUID } from "molstar/lib/mol-util";
import { Color } from "molstar/lib/mol-util/color";
import { Tunnels } from "./CommonUtils/Tunnels";
import { PluginCommands } from "molstar/lib/mol-plugin/commands";
import { ColorGenerator } from "molstar/lib/extensions/meshes/mesh-utils";
import { Shape } from "molstar/lib/mol-model/shape";
import { StateSelection } from "molstar/lib/mol-state";
import { Colors, Enum } from "../StaticData";
import { Vec3 } from "molstar/lib/mol-math/linear-algebra";
import { Mesh } from "molstar/lib/mol-geo/geometry/mesh/mesh";
import { ColorBound } from "./VizualizerMol/color-tunnels/property-color";
import { Property } from "./VizualizerMol/color-tunnels/property-color";
import { LayerColors } from "./CommonUtils/LayerColors";
import { TwoDProtsBridge } from "./CommonUtils/TwoDProtsBridge";

// export type SelectableElement =
//     | { kind: 'nothing' }
//     | { kind: 'molecule', data: Bootstrap.Interactivity.Molecule.SelectionInfo }
//     | { kind: 'point', data: number[] }

// export type SurfaceTag =
//     | { kind: 'Channel' | 'Cavity-inner' | 'Origins' | 'Points' | 'TPoint', element: any }
//     | { kind: 'Cavity-boundary', element: any, surface: Core.Geometry.Surface }


async function showDefaultVisuals(data: any) {
    return new Promise(res => {
        let toShow = [];

        //-- MoleOnline
        if (data.MergedPores && data.MergedPores.length > 0) {
            toShow = data.MergedPores;
        }
        else if (data.Paths && data.Paths.length > 0) {
            toShow = data.Paths;
        }
        else if (data.Pores && data.Pores.length > 0) {
            toShow = data.Pores;
        }
        else if (data.Tunnels && data.Tunnels.length > 0) {
            toShow = data.Tunnels;
        }
        //-- ChannelsDB
        else if (data.ReviewedChannels_MOLE && data.ReviewedChannels_MOLE.length > 0) {
            toShow = data.RevieReviewedChannels_MOLEwedChannels;
        }
        else if (data.ReviewedChannels_Caver && data.ReviewedChannels_Caver.length > 0) {
            toShow = data.ReviewedChannels_Caver;
        }
        else if (data.CSATunnels_MOLE && data.CSATunnels_MOLE.length > 0) {
            toShow = data.CSATunnels_MOLE;
        }
        else if (data.CSATunnels_Caver && data.CSATunnels_Caver.length > 0) {
            toShow = data.CSATunnels_Caver;
        }
        else if (data.TransmembranePores_MOLE && data.TransmembranePores_MOLE.length > 0) {
            toShow = data.TransmembranePores_MOLE;
        }
        else if (data.TransmembranePores_Caver && data.TransmembranePores_Caver.length > 0) {
            toShow = data.TransmembranePores_Caver;
        }
        else if (data.CofactorTunnels_MOLE && data.CofactorTunnels_MOLE.length > 0) {
            toShow = data.CofactorTunnels_MOLE;
        }
        else if (data.CofactorTunnels_Caver && data.CofactorTunnels_Caver.length > 0) {
            toShow = data.CofactorTunnels_Caver;
        }
        else if (data.ProcognateTunnels_MOLE && data.ProcognateTunnels_MOLE.length > 0) {
            toShow = data.ProcognateTunnels_MOLE;
        }
        else if (data.ProcognateTunnels_Caver && data.ProcognateTunnels_Caver.length > 0) {
            toShow = data.ProcognateTunnels_Caver;
        }
        else if (data.AlphaFillTunnels_MOLE && data.AlphaFillTunnels_MOLE.length > 0) {
            toShow = data.AlphaFillTunnels_MOLE;
        }
        else if (data.AlphaFillTunnels_Caver && data.AlphaFillTunnels_Caver.length > 0) {
            toShow = data.AlphaFillTunnels_Caver;
        }

        return showChannelVisuals(toShow.slice(0, 5), true).then(() => {
            if (data.Cavities === void 0) {
                res(null);
                return;
            }
            let cavity = data.Cavities.Cavities[0];
            if (!cavity) {
                res(null);
                return;
            }
            showCavityVisuals([cavity], true).then(() => { res(null) }); //TODO
        })
    });
}

// function getNodeFromTree(root: Bootstrap.Entity.Any, ref: string): Bootstrap.Entity.Any | null {
//     if (root.ref === ref) {
//         return root;
//     }
//     for (let c of root.children) {
//         let n = getNodeFromTree(c, ref);
//         if (n !== null) {
//             return n;
//         }
//     }

//     return null;
// }

export async function removeChannelsData(channels?: boolean) {
    const plugin = Context.getInstance().plugin;
    const refs: string[] = [];

    const c = channels !== undefined && channels

    plugin.state.data.cells.forEach((cell, key) => {
        if (cell.obj && ((cell.obj.tags && (cell.obj.tags.includes('Origins') || cell.obj.tags.includes('Surface'))))) { //TODO add this if you want remove also channels: cell.obj.type.name === "Tunnel Entry" || 
            refs.push(key);
        }
        if (c && cell.obj && cell.obj.type.name === "Tunnel Entry") {
            refs.push(key);
        }
    })
    refs.forEach(async ref => {
        await PluginCommands.State.RemoveObject(plugin, { state: plugin.state.data, ref });
    })
    await PluginCommands.State.RemoveObject(plugin, { state: plugin.state.data, ref: 'mole-data-raw' });
    await PluginCommands.State.RemoveObject(plugin, { state: plugin.state.data, ref: 'mole-data' });
}

export async function removeMembraneData() {
    const plugin = Context.getInstance().plugin;
    await PluginCommands.State.RemoveObject(plugin, { state: plugin.state.data, ref: 'membrane' });
    await PluginCommands.State.RemoveObject(plugin, { state: plugin.state.data, ref: 'membrane-data-raw' });
    await PluginCommands.State.RemoveObject(plugin, { state: plugin.state.data, ref: 'membrane-data' });
}

// function removeNodeFromTree(plugin: Plugin.Controller, nodeRef: string) {
//     let obj = getNodeFromTree(plugin.root, nodeRef);
//     if (obj !== null) {
//         Tree.remove(obj);
//     }
// }

interface Point { X: number, Y: number, Z: number };
function residuesToPoints(residueOrigins: CSAResidues): string {
    let points: Point[] = [];

    for (let origin of residueOrigins) {
        let centerOfMass = Residues.getCenterOfMassOld(origin);
        if (centerOfMass === null) {
            continue;
        }

        points.push(centerOfMass);
    }
    return JSON.stringify({
        Origins: {
            CSAOrigins: {
                Points: points,
                Type: "CSA Origins"
            }
        }
    });
}

function createCSAOriginsData(computationId: string) {
    return new Promise<any>((res, rej) => {
        DataProxyCSAResidues.DataProvider.get(computationId, (compId, info) => {
            try {
                let originsData: string = residuesToPoints(info);
                console.log(originsData);
                const update = Context.getInstance().plugin.build();
                update
                    .toRoot()
                    .apply(RawData, { data: originsData }, { ref: 'csa-origins-raw', state: { isGhost: true } })
                    .apply(ParseJson, {}, { ref: 'csa-origins', state: { isGhost: true } })
                    .commit()
                    .then((s) => {
                        res(s)
                    })
                    .catch(error => { rej(error) });
            } catch (e) {
                console.log(e);
                rej(e);
            }
        })
    });
}

function generateGuid(tunnels: Tunnel[]) {
    for (let idx = 0; idx < tunnels.length; idx++) {
        tunnels[idx].GUID = UUID.create22();
    }
    return tunnels;
}

export function generateGuidAll(moleData: ChannelsDBChannels) {
    moleData.MergedPores = moleData.MergedPores ? generateGuid(moleData.MergedPores) : [];
    moleData.Paths = moleData.Paths ? generateGuid(moleData.Paths) : [];
    moleData.Pores = moleData.Pores ? generateGuid(moleData.Pores) : [];
    moleData.Tunnels = moleData.Tunnels ? generateGuid(moleData.Tunnels) : [];

    moleData.CSATunnels_MOLE = moleData.CSATunnels_MOLE ? generateGuid(moleData.CSATunnels_MOLE) : [];
    moleData.CSATunnels_Caver = moleData.CSATunnels_Caver ? generateGuid(moleData.CSATunnels_Caver) : [];
    moleData.ReviewedChannels_MOLE = moleData.ReviewedChannels_MOLE ? generateGuid(moleData.ReviewedChannels_MOLE) : [];
    moleData.ReviewedChannels_Caver = moleData.ReviewedChannels_Caver ? generateGuid(moleData.ReviewedChannels_Caver) : [];
    moleData.CofactorTunnels_MOLE = moleData.CofactorTunnels_MOLE ? generateGuid(moleData.CofactorTunnels_MOLE) : [];
    moleData.CofactorTunnels_Caver = moleData.CofactorTunnels_Caver ? generateGuid(moleData.CofactorTunnels_Caver) : [];
    moleData.TransmembranePores_MOLE = moleData.TransmembranePores_MOLE ? generateGuid(moleData.TransmembranePores_MOLE) : [];
    moleData.TransmembranePores_Caver = moleData.TransmembranePores_Caver ? generateGuid(moleData.TransmembranePores_Caver) : [];
    moleData.ProcognateTunnels_MOLE = moleData.ProcognateTunnels_MOLE ? generateGuid(moleData.ProcognateTunnels_MOLE) : [];
    moleData.ProcognateTunnels_Caver = moleData.ProcognateTunnels_Caver ? generateGuid(moleData.ProcognateTunnels_Caver) : [];
    moleData.AlphaFillTunnels_MOLE = moleData.AlphaFillTunnels_MOLE ? generateGuid(moleData.AlphaFillTunnels_MOLE) : [];
    moleData.AlphaFillTunnels_Caver = moleData.AlphaFillTunnels_Caver ? generateGuid(moleData.AlphaFillTunnels_Caver) : [];

    return moleData
}

function generateGuidMole(moleData: MoleData) {
    moleData.Channels.MergedPores = generateGuid(moleData.Channels.MergedPores);
    moleData.Channels.Paths = generateGuid(moleData.Channels.Paths);
    moleData.Channels.Pores = generateGuid(moleData.Channels.Pores);
    moleData.Channels.Tunnels = generateGuid(moleData.Channels.Tunnels);

    return moleData
}

function generateGuidChannelsDB(moleData: ChannelsDBChannels) {
    moleData.CSATunnels_MOLE = generateGuid(moleData.CSATunnels_MOLE);
    moleData.CSATunnels_Caver = generateGuid(moleData.CSATunnels_Caver);
    moleData.ReviewedChannels_MOLE = generateGuid(moleData.ReviewedChannels_MOLE);
    moleData.ReviewedChannels_Caver = generateGuid(moleData.ReviewedChannels_Caver);
    moleData.CofactorTunnels_MOLE = generateGuid(moleData.CofactorTunnels_MOLE);
    moleData.CofactorTunnels_Caver = generateGuid(moleData.CofactorTunnels_Caver);
    moleData.TransmembranePores_MOLE = generateGuid(moleData.TransmembranePores_MOLE);
    moleData.TransmembranePores_Caver = generateGuid(moleData.TransmembranePores_Caver);
    moleData.ProcognateTunnels_MOLE = generateGuid(moleData.ProcognateTunnels_MOLE);
    moleData.ProcognateTunnels_Caver = generateGuid(moleData.ProcognateTunnels_Caver);
    moleData.AlphaFillTunnels_MOLE = generateGuid(moleData.AlphaFillTunnels_MOLE);
    moleData.AlphaFillTunnels_Caver = generateGuid(moleData.AlphaFillTunnels_Caver);

    moleData.MergedPores = [];
    moleData.Paths = [];
    moleData.Pores = [];
    moleData.Tunnels = [];

    return moleData
}

async function downloadMembraneData(computationId: string) {
    await removeMembraneData();
    console.log("MEMBRNE");
    console.log(Context.getInstance().plugin)
    return new Promise<any>((res, rej) => {
        ApiService.getMembraneData(computationId).then((data) => {
            const update = Context.getInstance().plugin.build();
            update
                .toRoot()
                .apply(RawData, { data: JSON.stringify(data) }, { ref: 'membrane-data-raw', state: { isGhost: true } })
                .apply(ParseJson, {}, { ref: 'membrane-data', state: { isGhost: true } })
                .commit()
                .then((s) => {
                    res(s);
                })
                .catch((err) => {
                    rej(err);
                });
            // let membrane = plugin.createTransform().add(plugin.root, Transformer.Data.FromData, { data: JSON.stringify(data), id: 'Membrane' }, { isHidden: true, ref: 'membrane-object' })
            //     .then(Transformer.Data.ParseJson, { id: 'MembraneObjects' }, { ref: 'membrane-data', isHidden: true });
            // plugin.applyTransform(membrane)
            //     .then(() => {
            //         let membraneData = plugin.context.select('membrane-data')[0] as Bootstrap.Entity.Data.Json;
            //         showMembraneVisuals(plugin, membraneData.props.data, true).then((val) => {
            //             res();
            //         }).catch((err) => {
            //             rej(err);
            //         });
            //     });
        }).catch(err => {
            console.log("Membrane data not available!");
            console.log(err);
            res(null);
        });
    }).then(() => {
        Events.invokeOnMembraneDataReady();
    });
}

export async function downloadChannelsData(computationId: string, submitId: number) {
    await removeChannelsData();
    return new Promise<any>((res, rej) => {
        ApiService.getChannelsData(computationId, submitId).then((data) => {
            let update = Context.getInstance().plugin.build();
            update
                .toRoot()
                .apply(RawData, { data }, { ref: 'mole-data-raw', state: { isGhost: true } })
                .apply(ParseJson, {}, { ref: 'mole-data', state: { isGhost: true } })
                .commit()
                .then((s) => {
                    if (Object.keys(s.data).length === 0) {
                        rej('Data not available.');
                    } else {
                        let data_ = s.data as MoleData;
                        data_ = generateGuidMole(data_);
                        // TunnelName.reload(data_);
                        Tunnels.invokeOnTunnelsCollect(submitId);
                        // Events.invokeChannelDataLoaded(data_); //TODO check handlers that are attached to it
                        console.log(Context.getInstance().plugin.state.data.select(StateSelection.first('mole-data')));
                        //TODO same with the same one here
                        // showDefaultVisuals(data_.Channels)
                        //     .then(() => {
                        //         res(null)
                        //     })
                        res(null);
                    }
                })
                .catch((error) => {
                    rej(error);
                })
        })
            .catch(err => rej(err))
    });
}

async function downloadChannelsDBData(computationId: string) {
    await removeChannelsData();
    return new Promise<any>((res, rej) => {
        ApiService.getComputationInfoList(computationId).then(val => {
            if (val.PdbId !== null) {
                ChannelsDBDataCache.getChannelsData(val.PdbId).then(data => {
                    let update = Context.getInstance().plugin.build();
                    update
                        .toRoot()
                        .apply(RawData, { data: JSON.stringify({ Channels: data }) }, { ref: 'mole-data-raw', state: { isGhost: true } })
                        .apply(ParseJson, {}, { ref: 'mole-data' })
                        .commit()
                        .then((s) => {
                            if (Object.keys(s.data).length === 0) {
                                rej('Data not available.');
                            } else {
                                console.log(s.data);
                                let data_ = s.data as ChannelsDBData;
                                data_.Channels = generateGuidChannelsDB(data_.Channels);
                                data_.Annotations = [];
                                Tunnels.invokeOnTunnelsCollect(0);
                                // Events.invokeChannelDataLoaded(data_);
                                //TODO probably remove, move to the first load or sync with the left panel checking
                                // showDefaultVisuals(data_)
                                //     .then(() => {
                                //         res(null)
                                //     }).catch(err => console.log(err))
                                res(null)
                            }
                        }).catch(error => { rej(error); console.log(error) });
                }).catch(err => { rej(err); console.log(err) })
            }
        }).catch(err => { rej(err); console.log(err) })
    });
}

function downloadProteinData(computationId: string, submitId: number) {
    return new Promise<any>(async (res, rej) => {
        // ApiService.getProteinStructure(computationId, submitId).then((p) => {
        //     const data = p.data;
        //     if (data === "" || data === null || data === void 0) {
        //         console.log('Cannot get protein data');
        //     }
        //     else {
        //         Context.getInstance().load(`https://api.mole.upol.cz/Data/${computationId}?submitId=${submitId}&format=molecule`, false)
        //             .then((data) => {
        //                 res(data);
        //                 // TODO: invoke with correct data type
        //                 // Events.invokeProteinDataLoaded(data);
        //             })
        //             .catch(error => rej(error));
        //     }
        // }).catch(error => {
        //     console.log(error);
        //     rej(error)
        // });
        try {
            const p = await ApiService.getComputationInfoList(computationId);
            if (p.PdbId === "" || p.PdbId === null || p.PdbId === void 0) {
                console.log('PdbId not present');
                await Context.getInstance().load(`https://api.mole.upol.cz/Data/${computationId}?submitId=${submitId}&format=molecule`, false, true)
                    .then((data) => {
                        res(data);
                        // TODO: invoke with correct data type
                        // Events.invokeProteinDataLoaded(data);
                    })
                    .catch(error => rej(error));
            }
            else {
                TwoDProtsBridge.setPdbId(p.PdbId);
                await Context.getInstance().load(`https://models.rcsb.org/${p.PdbId}.bcif`, true, false, p.AssemblyId)
                    .then((data) => {
                        res(data);
                        // TODO: invoke with correct data type
                        // Events.invokeProteinDataLoaded(data);
                    })
                    .catch(error => rej(error));
            }
        } catch (error) {
            console.log(error);
            rej(error);
        }
    });
}

export function loadAllChannels(compId: string) {
    const channels: Map<number, ChannelsDBChannels> = new Map();

    ComputationInfo.DataProvider.get(compId, (async (compId: string, info: CompInfo) => {
        for (const submission of info.Submissions) {
            const submitId = submission.SubmitId;

            const data = await ApiService.getChannelsData(compId, submitId)
            let dataObj = JSON.parse(data) as MoleData;
            if (dataObj !== undefined && dataObj.Channels !== undefined) {
                const guidData = generateGuidAll(dataObj.Channels)
                channels.set(submitId, guidData);
            }
        }
    }))

    return channels;
}

export function loadData(channelsDB: boolean) {
    const context = Context.getInstance();
    //context.plugin.clear(); //TODO: MAYBE YES MAYBE NOT
    if (CommonOptions.DEBUG_MODE)
        console.profile("loadData");

    // //plugin.clear();
    let modelLoadPromise = new Promise<any>((res, rej) => {
        let parameters = getParameters();

        if (parameters === null) {
            rej("Corrupted url found - cannot parse parameters.");
            return;
        }

        let computationId = parameters.computationId;
        let submitId = parameters.submitId;
        if (CommonOptions.DEBUG_MODE)
            console.log("Status watcher - BEFORE EXEC");
        JobStatus.Watcher.registerOnChangeHandler(computationId, submitId, (status => {
            if (CommonOptions.DEBUG_MODE)
                console.log("Watcher iteration");
            let plugin = Instances.getPlugin();
            // let proteinLoaded = existsRefInTree(plugin.root, 'protein-data');
            let proteinLoaded = context.plugin.state.data.tree.children.has('protein-data')
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
            if (status.Status === "Initializing" || status.Status === "Running") {
                //Do Nothing
                if (CommonOptions.DEBUG_MODE)
                    console.log("Waiting for status change");
            }
            else if (status.Status === "Initialized") {
                acquireData(computationId, submitId, plugin, res, rej, !proteinLoaded, submitId == 0, channelsDB);   //TODO podminka pro prenacteni kanalu pro submit 0
            }
            else if (status.Status === "FailedInitialization" || status.Status === "Error" || status.Status === "Deleted" || status.Status === "Aborted") {
                rej(status.ErrorMsg);
            }
            else if (status.Status === "Finished") {
                acquireData(computationId, submitId, res, rej, !proteinLoaded, true, channelsDB);
            }
        }), (err) => rej(err));
    })

    let promises = [];

    promises.push(modelLoadPromise);

    return Promise.all(promises);
}

// function existsRefInTree(root: Bootstrap.Entity.Any, ref: string) {
//     if (root.ref === ref) {
//         return true;
//     }
//     for (let c of root.children) {
//         if (existsRefInTree(c, ref)) {
//             return true;
//         }
//     }

//     return false;
// }

function acquireData(computationId: string, submitId: number, res: any, rej: any, protein: boolean, channels: boolean, channelsDB: boolean) {
    let promises: any[] = [];
    const context = Context.getInstance();

    if (protein) {
        if (CommonOptions.DEBUG_MODE)
            console.log("reloading protein structure");
        let proteinAndCSA = new Promise<any>((res, rej) => {
            downloadProteinData(computationId, submitId)
                .then(() => {
                    let csaOriginsExists = context.data.has('csa-origins');
                    if (!csaOriginsExists) {
                        if (CommonOptions.DEBUG_MODE)
                            console.log("reloading CSA Origins");
                        createCSAOriginsData(computationId)
                            .then((data) => res(data))
                            .catch((err) => rej(err));
                    } else {
                        res(null)
                    }
                })
                .catch(error => rej(error));
        });

        promises.push(proteinAndCSA);
    }
    if (channels && !channelsDB) {
        //Download and show membrane data if available
        //TODO when submit will be programmed, check if this work correctly
        promises.push(downloadMembraneData(computationId)); //TODO when submit tunnels will be ready and membrane will be generated
        if (CommonOptions.DEBUG_MODE)
            console.log("reloading channels");
        promises.push(downloadChannelsData(computationId, submitId));
    }
    if (channelsDB) {
        promises.push(downloadChannelsDBData(computationId));
    }

    Promise.all(promises)
        .then(() => {
            res();
            if (CommonOptions.DEBUG_MODE)
                console.profileEnd();
        })
        .catch((error) => {
            console.log(error);
            rej(error);
        })
}

function computeNormals(vertices: Float32Array, indices: number[]): number[] {
    const normals: Vec3[] = new Array(vertices.length / 3).fill(0).map(() => Vec3.create(0, 0, 0));

    let edge1: Vec3 = Vec3.create(0, 0, 0);
    let edge2: Vec3 = Vec3.create(0, 0, 0);
    let normal: Vec3 = Vec3.create(0, 0, 0);

    for (let i = 0; i < indices.length; i += 3) {
        // Get vertex indices for the triangle
        const i1 = indices[i];
        const i2 = indices[i + 1];
        const i3 = indices[i + 2];

        // Get the vertices
        const v1: Vec3 = Vec3.create(vertices[3 * i1], vertices[3 * i1 + 1], vertices[3 * i1 + 2]);
        const v2: Vec3 = Vec3.create(vertices[3 * i2], vertices[3 * i2 + 1], vertices[3 * i2 + 2]);
        const v3: Vec3 = Vec3.create(vertices[3 * i3], vertices[3 * i3 + 1], vertices[3 * i3 + 2]);

        // Calculate the edges of the triangle
        Vec3.sub(edge1, v2, v1);
        Vec3.sub(edge2, v3, v1);

        // Calculate the normal (cross product of edge1 and edge2)
        Vec3.cross(normal, edge1, edge2);

        // Add the normal to each vertex's normal
        Vec3.add(normals[i1], normals[i1], normal);
        Vec3.add(normals[i2], normals[i2], normal);
        Vec3.add(normals[i3], normals[i3], normal);
    }

    // Normalize all the normals
    const flatNormals: number[] = [];
    normals.forEach(n => {
        const normalizedNormal: Vec3 = Vec3.create(0, 0, 0);
        Vec3.normalize(normalizedNormal, n);
        flatNormals.push(...normalizedNormal);
    });

    return flatNormals;
}

function createSurface(mesh: any) {
    // wrap the vertices in typed arrays
    if (!(mesh.Vertices instanceof Float32Array)) {
        mesh.Vertices = new Float32Array(mesh.Vertices);
    }
    if (!(mesh.Vertices instanceof Uint32Array)) {
        mesh.Triangles = new Uint32Array(mesh.Triangles);
    }

    const normals = new Float32Array(computeNormals(mesh.Vertices, mesh.Triangles))
    let groups = new Float32Array([0]);

    let m = Mesh.create(mesh.Vertices, mesh.Triangles, normals, groups, mesh.Vertices.length, mesh.Triangles.length);

    return m;

    // let surface = <Core.Geometry.Surface>{
    //     vertices: mesh.Vertices,
    //     vertexCount: (mesh.Vertices.length / 3) | 0,
    //     triangleIndices: new Uint32Array(mesh.Triangles),
    //     triangleCount: (mesh.Triangles.length / 3) | 0,
    // };

    // return surface;
}

function createTriangleSurface(mesh: any) {
    const triangleCount = (mesh.Triangles.length / 3) | 0;
    const vertexCount = triangleCount * 3;

    const srcV = mesh.Vertices;
    const srcT = mesh.Triangles;

    const vertices = new Float32Array(vertexCount * 3);
    const triangleIndices = new Uint32Array(triangleCount * 3);
    const annotation = new Int32Array(vertexCount) as any as number[];

    const tri = [0, 0, 0];
    for (let i = 0, _i = mesh.Triangles.length; i < _i; i += 3) {
        tri[0] = srcT[i]; tri[1] = srcT[i + 1]; tri[2] = srcT[i + 2];

        for (let j = 0; j < 3; j++) {
            const v = i + j;
            vertices[3 * v] = srcV[3 * tri[j]];
            vertices[3 * v + 1] = srcV[3 * tri[j] + 1];
            vertices[3 * v + 2] = srcV[3 * tri[j] + 2];
            triangleIndices[i + j] = i + j;
        }
    }
    for (let i = 0; i < triangleCount; i++) {
        for (let j = 0; j < 3; j++) annotation[3 * i + j] = i;
    }

    const normals = new Float32Array(computeNormals(vertices, Array.from(triangleIndices)));
    let groups = new Float32Array([1]);

    let m = Mesh.create(vertices, triangleIndices, normals, groups, vertices.length, triangleIndices.length);

    return m;

    // const surface = <Core.Geometry.Surface>{
    //     vertices,
    //     vertexCount,
    //     triangleIndices,
    //     triangleCount,
    //     annotation
    // };

    // return surface;
}

function getSurfaceColorByType(type: string) {
    switch (type) {
        /*
        case 'Cavity': return ColorScheme.Colors.get(ColorScheme.Enum.Cavity);
        case 'MolecularSurface': return ColorScheme.Colors.get(ColorScheme.Enum.Surface);
        case 'Void': return ColorScheme.Colors.get(ColorScheme.Enum.Void);
        */
        default: return Colors.get(Enum.DefaultColor);
    }
}

async function showSurfaceVisuals(elements: any[], visible: boolean, type: string, label: (e: any) => string, alpha: number): Promise<any> {
    const context = Context.getInstance();
    let needsApply = false;

    for (let element of elements) {
        if (!element.__id) element.__id = UUID.create22();
        if (!!element.__isVisible === visible) continue;

        element.__isVisible = visible;
        if (!element.__color) {
            element.__color = getSurfaceColorByType(element.Type);
        }
        if (!visible) {
            if (element.__refBoundary)
                await PluginCommands.State.RemoveObject(context.plugin, { state: context.plugin.state.data, ref: element.__refBoundary });
            if (element.__refInner) {
                await PluginCommands.State.RemoveObject(context.plugin, { state: context.plugin.state.data, ref: element.__refInner });
            }
        } else if (type === "Cavity" && (!!element.Mesh.Boundary || !!element.Mesh.Inner)) {
            const refBoundary = await context.renderSurface(element.Mesh.Boundary.Triangles, element.Mesh.Boundary.Vertices, Colors.get(Enum.CavityBoundary), undefined, `<b>${element.Type} ${element.Id}</b>, Volume: ${Math.round(element.Volume)} Å`);
            const refInner = await context.renderSurface(element.Mesh.Inner.Triangles, element.Mesh.Inner.Vertices, Colors.get(Enum.CavityInner), 'InnerCavity'); //TODO change color

            element.__refBoundary = refBoundary?.ref;
            element.__refInner = refInner?.ref;

            needsApply = true;
        }
        else {
            const ref = await context.renderSurface(element.Mesh.Boundary.Triangles, element.Mesh.Boundary.Vertices, Colors.get(Enum.CavityBoundary), undefined, `<b${element.Type} ${element.Id}</b>, Volume: ${Math.round(element.Volume)} Å`);
            element.__refBoundary = ref?.ref;
            element.__refInner = null;
            needsApply = true;
        }
    }

    // if (needsApply) {
    //     return new Promise<any>((res, rej) => {
    //         plugin.applyTransform(t).then(() => {
    //             for (let element of elements) {
    //                 element.__isBusy = false;
    //             }
    //             res();
    //         }).catch(e => rej(e));
    //     });
    // }
    // else {
    //     return new Promise<any>((res, rej) => {
    //         for (let element of elements) {
    //             element.__isBusy = false;
    //         }
    //         res();
    //     });
    // }
    for (let element of elements) {
        element.__isBusy = false;
    }
    return new Promise<any>((res, rej) => { res(null) });
}

export function showCavityVisuals(cavities: any[], visible: boolean): Promise<any> {
    return showSurfaceVisuals(cavities, visible, 'Cavity', (cavity: any) => `${cavity.Type} ${cavity.Id}`, 0.33);
}

export async function showChannelVisuals(channels: Tunnel[] & TunnelMetaInfo[], visible: boolean, forceRepaint?: boolean, channelsDB?: boolean, submitId?: string): Promise<any> {
    const context = Context.getInstance();

    let label = (channel: any) => `${channel.Type} ${Tunnels.getName(channel)}`;
    let alpha = 1.0;

    let visibleChannels: Tunnel[]&TunnelMetaInfo[] = [];
    for (let channel of channels) {
        if (!channel.__id) channel.__id = UUID.create22();
        if (!!channel.__isVisible === visible && !forceRepaint) continue;

        if (forceRepaint !== void 0 && forceRepaint) {
            TwoDProtsBridge.removeChannel(channel.__id);
            await PluginCommands.State.RemoveObject(context.plugin, { state: context.plugin.state.data, ref: channel.__ref });
        }

        channel.__isVisible = visible;
        if (!channel.__color) {
            // channel.__color = ColorScheme.Colors.getRandomUnused(); // TODO
            channel.__color = ColorGenerator.next().value;
        }
        if (!channel.__submissionId && submitId) {
            channel.__submissionId = submitId;
        }

        if (channelsDB !== undefined && channelsDB) {
            channel.__channelsDB = true;
        }

        if (!visible) {
            TwoDProtsBridge.removeChannel(channel.__id);
            await PluginCommands.State.RemoveObject(context.plugin, { state: context.plugin.state.data, ref: channel.__ref });
            LayerColors.invokeOnChannelRemoved(channel.__ref);
        } else {
            visibleChannels.push(channel);
            LayerColors.invokeOnChannelAdd(channel.__ref);

            const [loci, ref] = await context.renderTunnel(channel);
            channel.__ref = ref;
            channel.__loci = loci as Shape.Loci;
            TwoDProtsBridge.addChannel(channel);
        }
    }

    // LastVisibleChannels.set(visibleChannels);

    return Promise.resolve().then(() => {
        for (let channel of channels) {
            channel.__isBusy = false;
        }
    });
}

export async function showChannelPropertyColorVisuals(channel: Tunnel & TunnelMetaInfo, colorOptions: { property: Property, colorBounds: ColorBound }, forceRepaint?: boolean, channelsDB?: boolean): Promise<any> {
    const context = Context.getInstance();

    let label = (channel: any) => `${channel.Type} ${Tunnels.getName(channel)}`;
    let alpha = 1.0;

    if (!channel.__id) channel.__id = UUID.create22();
    if (!channel.__isVisible && !forceRepaint) return;

    if (forceRepaint !== void 0 && forceRepaint) {
        await PluginCommands.State.RemoveObject(context.plugin, { state: context.plugin.state.data, ref: channel.__ref });
    }

    channel.__isVisible = true;
    if (!channel.__color) {
        // channel.__color = ColorScheme.Colors.getRandomUnused(); // TODO
        channel.__color = ColorGenerator.next().value;
    }

    if (channelsDB !== void 0 && channelsDB) {
        channel.__channelsDB = true;
    }

    const [loci, ref] = await context.renderPropertyColorTunnel(channel, colorOptions);
    channel.__ref = ref;
    channel.__loci = loci as Shape.Loci;

    return Promise.resolve().then(() => {
        channel.__isBusy = false;
    });
}

// function createOriginsSurface(origins: any): Promise<Core.Geometry.Surface> {
//     if (origins.__surface) return Promise.resolve(origins.__surface);

//     let s = Visualization.Primitive.Builder.create();
//     let id = 0;
//     for (let p of origins.Points) {
//         s.add({ type: 'Sphere', id: id++, radius: 1.69, center: [p.X, p.Y, p.Z] });
//     }
//     return s.buildSurface().run();
// }

function getOriginColorByType(origins: any) {
    switch (origins.Type as string) {
        case 'Computed': return Colors.get(Enum.ComputedOrigin);
        case 'CSA Origins': return Colors.get(Enum.CSAOrigin);
        default: return Colors.get(Enum.OtherOrigin);
    }
}


// function createMembraneSurface(membranePoints: any): Promise<Core.Geometry.Surface> {
//     let s = Visualization.Primitive.Builder.create();
//     for (let p of membranePoints as DataInterface.MembranePoint[]) {
//         s.add({ type: 'Sphere', id: 0, radius: 0.25, center: [p.Position.X, p.Position.Y, p.Position.Z] });
//     }
//     return s.buildSurface().run();
// }
export async function showMembraneVisuals(membraneData: Membrane[], visible: boolean): Promise<any> {
    let membranes = [];
    const context = Context.getInstance();

    for (let membrane of membraneData) {
        if (!membrane.__id) membrane.__id = UUID.create22();
        if (!!membrane.__isVisible === visible) continue;

        membrane.__isVisible = visible;
        membranes.push(membrane);
        if (!visible) {
            await PluginCommands.State.RemoveObject(context.plugin, { state: context.plugin.state.data, ref: membrane.__ref });
        } else {
            const ref = await context.renderMembrane(membrane.obj.data);
            membrane.__ref = ref.ref;
        }

    }

    // let blue: MembranePoint[] = [];
    // let red: MembranePoint[] = [];

    // let blueId = "";
    // let redId = "";
    // for (let membrane of membraneData) {
    //     let membraneDataAny = membrane as any;

    //     if (!!membraneDataAny.__isVisible === visible) return Promise.resolve();

    //     membraneDataAny.__isVisible = visible;
    //     if (!visible) {
    //         if (membraneDataAny.__id !== void 0) {
    //             plugin.command(Bootstrap.Command.Tree.RemoveNode, membraneDataAny.__id);
    //             membraneDataAny.__id = void 0;
    //         }
    //         membraneDataAny.__isBusy = false;
    //         continue;
    //     }

    //     if (membrane.Side === "N") {
    //         if (blueId === "") {
    //             if (!membraneDataAny.__id) {
    //                 blueId = UUID.create22();
    //             }
    //             membraneDataAny.__id = blueId;
    //         }
    //         blue.push(membrane);
    //         (blue as any).__isBusy = true;
    //     }
    //     else {
    //         if (redId === "") {
    //             if (!membraneDataAny.__id) {
    //                 redId = UUID.create22();
    //             }
    //             membraneDataAny.__id = redId;
    //         }
    //         })
    //         red.push(membrane);
    //         (red as any).__isBusy = true;
    //     }
    // }

    // if (blue.length > 0) {
    //     promises.push(
    //         new Promise<any>((res, rej) => {
    //             createMembraneSurface(blue).then(surface => {
    //                 let t = plugin.createTransform()
    //                     .add('membrane-data', CreateSurface, {
    //                         label: 'Membrane Blue',
    //                         tag: <SurfaceTag>{ kind: 'Origins', element: membraneData },
    //                         surface,
    //                         isInteractive: false,
    //                         color: ColorScheme.Colors.get(Enum.MembraneBlue) as Visualization.Color
    //                     }, { ref: (blue[0] as any).__id, isHidden: true });

    //                 plugin.applyTransform(t).then(() => {
    //                     (blue as any).__isBusy = false;
    //                     res();
    //                 }).catch(err => rej(err));
    //             }).catch(err => rej(err))
    //         })
    //     );
    // }

    // if (red.length > 0) {
    //     promises.push(
    //         new Promise<any>((res, rej) => {
    //             createMembraneSurface(red).then(surface => {
    //                 let t = plugin.createTransform()
    //                     .add('membrane-data', CreateSurface, {
    //                         label: 'Membrane Red',
    //                         tag: <SurfaceTag>{ kind: 'Origins', element: membraneData },
    //                         surface,
    //                         isInteractive: false,
    //                         color: ColorScheme.Colors.get(ColorScheme.Enum.MembraneRed) as Visualization.Color
    //                     }, { ref: (red[0] as any).__id, isHidden: true });

    //                 plugin.applyTransform(t).then(() => {
    //                     (red as any).__isBusy = false;
    //                     res();
    //                 }).catch(rej);
    //             }).catch(rej)
    //     );
    // }

    return Promise.resolve().then(() => {
        for (let membrane of membranes) {
            membrane.__isBusy = false;
        }
    });
}

export async function showOriginsSurface(origins: any, visible: boolean): Promise<any> {
    if (!origins.__id) origins.__id = UUID.create22();
    if (!origins.Points.length || !!origins.__isVisible === visible) return Promise.resolve();

    const context = Context.getInstance();

    origins.__isVisible = visible;
    if (!origins.__color) {
        origins.__color = getOriginColorByType(origins);
    }
    if (!visible) {
        await PluginCommands.State.RemoveObject(context.plugin, { state: context.plugin.state.data, ref: origins.__ref });
    } else {
        const ref = await context.renderOrigin(origins.Points, origins.__color, undefined, "Origins", "Origin", origins.Type);
        (origins as Origins).__ref = ref.ref;
    }

    origins.__isBusy = false;
    return Promise.resolve();
}

