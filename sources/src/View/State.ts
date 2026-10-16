/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
import { DataProxyCSAResidues, JobStatus } from "../DataProxy";
import { ChannelsDBChannels, ChannelsDBData, firstNonEmptyCategory, Membrane, MoleData, Origins, Tunnel, TunnelMetaInfo } from "../DataInterface";
import { ChannelsDBData as ChannelsDBDataCache, LastVisibleChannels } from "../Cache";
import { getParameters } from "../Common/Util/Router";
import { ApiService, CSAResidues } from "../MoleAPIService";
import { Context } from "./Context";
import { CommonOptions, DataSources } from "../../config/common";
import { Residues } from "./CommonUtils/Residues";
import { ParseJson, RawData } from "molstar/lib/mol-plugin-state/transforms/data";
import { UUID } from "molstar/lib/mol-util";
import { Color } from "molstar/lib/mol-util/color";
import { Tunnels } from "./CommonUtils/Tunnels";
import { PluginCommands } from "molstar/lib/mol-plugin/commands";
import { ColorGenerator } from "molstar/lib/extensions/meshes/mesh-utils";
import { Shape } from "molstar/lib/mol-model/shape";
import { Colors, Enum } from "../StaticData";
import { ColorBound } from "./VizualizerMol/color-tunnels/property-color";
import { Property } from "./VizualizerMol/color-tunnels/property-color";
import { LayerColors } from "./CommonUtils/LayerColors";
import { TwoDProtsBridge } from "./CommonUtils/TwoDProtsBridge";
import { TunnelsId } from "./CommonUtils/TunnelsId";

export async function showDefaultVisualsNewSubmission(channels: ChannelsDBChannels, submitId: string) {
    return new Promise(res => {
        const first = firstNonEmptyCategory(channels);
        if (first !== null) {
            return showChannelDefaultVisuals((first.tunnels.slice(0, 5)) as (Tunnel & TunnelMetaInfo)[], first.channelsDB, submitId).then(() => {
                res(null);
                return;
            })
        }
        // nothing to show
        res(null);
    });
}

export async function showDefaultVisuals(currentSubmitId: number, submissionChannels: Map<number, ChannelsDBChannels>) {
    return new Promise(res => {
        const submissionData = submissionChannels.get(currentSubmitId)
        if (submissionData !== undefined) {
            const first = firstNonEmptyCategory(submissionData);
            if (first !== null) {
                return showChannelDefaultVisuals((first.tunnels.slice(0, 5)) as (Tunnel & TunnelMetaInfo)[], first.channelsDB, currentSubmitId === -1 ? "ChannelsDB" : currentSubmitId === -2 ? 'FromFile' : currentSubmitId.toString()).then(() => {
                    res(null);
                    return;
                })
            }
        }

        for (const submitId of Array.from(submissionChannels.keys())) {
            const data = submissionChannels.get(submitId)
            if (data === undefined) continue;
            const first = firstNonEmptyCategory(data);
            if (first !== null) {
                return showChannelDefaultVisuals((first.tunnels.slice(0, 5)) as (Tunnel & TunnelMetaInfo)[], first.channelsDB, submitId === -1 ? "ChannelsDB" : submitId === -2 ? 'FromFile' : submitId.toString()).then(() => {
                    res(null);
                    return;
                })
            }

        }

        // nothing to show
        res(null);
    });
}

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

interface Point { X: number, Y: number, Z: number };
function residuesToPoints(residueOrigins: CSAResidues): string {
    let points: Point[] = [];

    for (let origin of residueOrigins) {
        let centerOfMass = Residues.getCenterOfMass(origin);
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

function generateCaverTag(tunnels: Tunnel[]) {
    for (let idx = 0; idx < tunnels.length; idx++) {
        tunnels[idx].Caver = true;
    }
    return tunnels;
}


export function addCaverTag(moleData: ChannelsDBChannels) {
    moleData.CSATunnels_Caver = moleData.CSATunnels_Caver ? generateCaverTag(moleData.CSATunnels_Caver) : [];
    moleData.ReviewedChannels_Caver = moleData.ReviewedChannels_Caver ? generateCaverTag(moleData.ReviewedChannels_Caver) : [];
    moleData.CofactorTunnels_Caver = moleData.CofactorTunnels_Caver ? generateCaverTag(moleData.CofactorTunnels_Caver) : [];
    moleData.TransmembranePores_Caver = moleData.TransmembranePores_Caver ? generateCaverTag(moleData.TransmembranePores_Caver) : [];
    moleData.ProcognateTunnels_Caver = moleData.ProcognateTunnels_Caver ? generateCaverTag(moleData.ProcognateTunnels_Caver) : [];
    moleData.AlphaFillTunnels_Caver = moleData.AlphaFillTunnels_Caver ? generateCaverTag(moleData.AlphaFillTunnels_Caver) : [];

    return moleData
}

function generateGuidMole(moleData: MoleData) {
    moleData.Channels.MergedPores = TunnelsId.generateGuid(moleData.Channels.MergedPores);
    moleData.Channels.Paths = TunnelsId.generateGuid(moleData.Channels.Paths);
    moleData.Channels.Pores = TunnelsId.generateGuid(moleData.Channels.Pores);
    moleData.Channels.Tunnels = TunnelsId.generateGuid(moleData.Channels.Tunnels);

    return moleData
}

async function downloadMembraneData(computationId: string) {
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
        }).catch(err => {
            console.log("Membrane data not available!");
            console.log(err);
            res(null);
        });
    }).then(() => {
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
                        Tunnels.invokeOnTunnelsCollect(submitId);
                        // Events.invokeChannelDataLoaded(data_); //TODO check handlers that are attached to it
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
                                let data_ = s.data as ChannelsDBData;
                                data_.Channels = TunnelsId.generateGuidAll(data_.Channels);
                                data_.Channels = TunnelsId.generateIdAll(data_.Channels, computationId, 'channelsDb');
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
        try {
            const p = await ApiService.getComputationInfoList(computationId);
            await Context.getInstance().load(`${DataSources.API_URL[DataSources.MODE]}/Data/${computationId}?submitId=${submitId}&format=molecule`, false, p.AssemblyId)
                .then((data) => {
                    res(data);
                })
                .catch(error => rej(error));
        } catch (error) {
            console.log(error);
            rej(error);
        }
    });
}

export function loadData(channelsDB: boolean) {
    const context = Context.getInstance();
    //context.plugin.clear(); //TODO: MAYBE YES MAYBE NOT
    if (CommonOptions.DEBUG_MODE)
        console.profile("loadData");

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
            let proteinLoaded = context.plugin.state.data.tree.children.has('protein-data')
            if (status.Status === "Initializing" || status.Status === "Running") {
                //Do Nothing
                if (CommonOptions.DEBUG_MODE)
                    console.log("Waiting for status change");
            }
            else if (status.Status === "Initialized") {
                acquireData(computationId, submitId, res, rej, !proteinLoaded, submitId == 0, channelsDB);   //TODO podminka pro prenacteni kanalu pro submit 0
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

function getSurfaceColorByType(type: string) {
    switch (type) {
        default: return Colors.get(Enum.DefaultColor);
    }
}

async function showSurfaceVisuals(elements: any[], visible: boolean, type: string, label: (e: any) => string, alpha: number): Promise<any> {
    const context = Context.getInstance();

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

        }
        else {
            const ref = await context.renderSurface(element.Mesh.Boundary.Triangles, element.Mesh.Boundary.Vertices, Colors.get(Enum.CavityBoundary), undefined, `<b${element.Type} ${element.Id}</b>, Volume: ${Math.round(element.Volume)} Å`);
            element.__refBoundary = ref?.ref;
            element.__refInner = null;
        }
    }
    for (let element of elements) {
        element.__isBusy = false;
    }
    return new Promise<any>((res, rej) => { res(null) });
}

export function showCavityVisuals(cavities: any[], visible: boolean): Promise<any> {
    return showSurfaceVisuals(cavities, visible, 'Cavity', (cavity: any) => `${cavity.Type} ${cavity.Id}`, 0.33);
}

async function showChannelDefaultVisuals(channels: Tunnel[] & TunnelMetaInfo[], channelsDB: boolean, submitId: string): Promise<any> {
    const context = Context.getInstance();

    let visibleChannels: Tunnel[] & TunnelMetaInfo[] = [];
    for (let channel of channels) {
        channel.__id = UUID.create22();

        channel.__isVisible = true;
        if (!channel.__color) {
            channel.__color = ColorGenerator.next().value;
        }

        if (channelsDB !== undefined && channelsDB) {
            channel.__channelsDB = true;
        }

        channel.__submissionId = submitId.toString();
        channel.__layerColored = false;

        visibleChannels.push(channel);
        LayerColors.invokeOnChannelAdd(channel.__ref);
        LastVisibleChannels.set(channel);

        const [loci, ref] = await context.renderTunnel(channel);
        channel.__ref = ref;
        channel.__loci = loci as Shape.Loci;
    }

    return Promise.resolve().then(() => {
        for (let channel of channels) {
            channel.__isBusy = false;
        }
    });
}

export async function showChannelVisuals(channels: Tunnel[] & TunnelMetaInfo[], visible: boolean, forceRepaint?: boolean, channelsDB?: boolean, submitId?: string): Promise<any> {
    const context = Context.getInstance();


    let visibleChannels: Tunnel[]&TunnelMetaInfo[] = [];
    for (let channel of channels) {
        if (!channel.__id) channel.__id = UUID.create22();
        if (!!channel.__isVisible === visible && !forceRepaint) continue;

        if (forceRepaint !== void 0 && forceRepaint) {
            await PluginCommands.State.RemoveObject(context.plugin, { state: context.plugin.state.data, ref: channel.__ref });
        }

        channel.__isVisible = visible;
        channel.__layerColored = false;
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
            await PluginCommands.State.RemoveObject(context.plugin, { state: context.plugin.state.data, ref: channel.__ref });
            LayerColors.invokeOnChannelRemoved(channel.__ref);
            LastVisibleChannels.remove(channel);
        } else {
            visibleChannels.push(channel);
            LayerColors.invokeOnChannelAdd(channel.__ref);

            const [loci, ref] = await context.renderTunnel(channel);
            channel.__ref = ref;
            channel.__loci = loci as Shape.Loci;
            LastVisibleChannels.set(channel);
        }

        const svgElement = document.getElementById('svgContainer');
        const elementId = TwoDProtsBridge.getFromIdTable(channel.Id)
        const element = document.getElementById(`${elementId}`)
        if (svgElement && element) {
            const targetElement = svgElement.querySelector<SVGGElement>(`g#${CSS.escape(`${elementId}`)}`);
            if (targetElement) {
                if (visible) {
                    targetElement.removeAttribute("display");
                    targetElement.setAttribute('style', `fill: ${Color.toHexStyle(channel.__color)}; stroke: ${Color.toHexStyle(channel.__color)}; opacity: 1`);
                    targetElement.dataset.selectOriginalFill = Color.toHexStyle(channel.__color); 
                    targetElement.dataset.hoverOriginalFill = Color.toHexStyle(channel.__color);
                } else {
                    targetElement.setAttribute("display", "none");
                }
            }
        }
    }

    return Promise.resolve().then(() => {
        for (let channel of channels) {
            channel.__isBusy = false;
        }
    });
}

export async function showChannelPropertyColorVisuals(channel: Tunnel & TunnelMetaInfo, colorOptions: { property: Property, colorBounds: ColorBound }, forceRepaint?: boolean, channelsDB?: boolean): Promise<any> {
    const context = Context.getInstance();


    if (!channel.__id) channel.__id = UUID.create22();
    if (!channel.__isVisible && !forceRepaint) return;

    channel.__isVisible = true;
    channel.__layerColored = true;
    if (!channel.__color) {
        // channel.__color = ColorScheme.Colors.getRandomUnused(); // TODO
        channel.__color = ColorGenerator.next().value;
    }

    if (channelsDB !== void 0 && channelsDB) {
        channel.__channelsDB = true;
    }

    const [loci, ref] = await context.renderPropertyColorTunnel(channel, colorOptions);

    if (forceRepaint !== void 0 && forceRepaint) {
        await PluginCommands.State.RemoveObject(context.plugin, { state: context.plugin.state.data, ref: channel.__ref });
    }

    channel.__ref = ref;
    channel.__loci = loci as Shape.Loci;

    return Promise.resolve().then(() => {
        channel.__isBusy = false;
    });
}

function getOriginColorByType(origins: any) {
    switch (origins.Type as string) {
        case 'Computed': return Colors.get(Enum.ComputedOrigin);
        case 'CSA Origins': return Colors.get(Enum.CSAOrigin);
        default: return Colors.get(Enum.OtherOrigin);
    }
}

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

