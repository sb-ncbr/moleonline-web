import { ApiService, ChannelAnnotation, ResidueAnnotation } from "./ChannelsDBAPIService";
import { ChannelsDBChannels, Layers, MoleData, Tunnel, TunnelMetaInfo } from "./DataInterface";

export class TunnelName {
    private static cache: Map<string, Map<string, string>> = new Map();

    public static reload(data: MoleData, submission: string) {
        let channels: Tunnel[] = [];
        let channelsMap: Map<string, string> = new Map();
        if (data.Channels.MergedPores !== void 0) {
            channels = channels.concat(data.Channels.MergedPores);
        }
        if (data.Channels.Paths !== void 0) {
            channels = channels.concat(data.Channels.Paths);
        }
        if (data.Channels.Pores !== void 0) {
            channels = channels.concat(data.Channels.Pores);
        }
        if (data.Channels.Tunnels !== void 0) {
            channels = channels.concat(data.Channels.Tunnels);
        }
        if (data.Channels.ReviewedChannels_MOLE !== void 0) {
            channels = channels.concat(data.Channels.ReviewedChannels_MOLE);
        }
        if (data.Channels.ReviewedChannels_Caver !== void 0) {
            channels = channels.concat(data.Channels.ReviewedChannels_Caver);
        }
        if (data.Channels.CSATunnels_MOLE !== void 0) {
            channels = channels.concat(data.Channels.CSATunnels_MOLE);
        }
        if (data.Channels.CSATunnels_Caver !== void 0) {
            channels = channels.concat(data.Channels.CSATunnels_Caver);
        }
        if (data.Channels.TransmembranePores_MOLE !== void 0) {
            channels = channels.concat(data.Channels.TransmembranePores_MOLE);
        }
        if (data.Channels.TransmembranePores_Caver !== void 0) {
            channels = channels.concat(data.Channels.TransmembranePores_Caver);
        }
        if (data.Channels.CofactorTunnels_MOLE !== void 0) {
            channels = channels.concat(data.Channels.CofactorTunnels_MOLE);
        }
        if (data.Channels.CofactorTunnels_Caver !== void 0) {
            channels = channels.concat(data.Channels.CofactorTunnels_Caver);
        }
        if (data.Channels.ProcognateTunnels_MOLE !== void 0) {
            channels = channels.concat(data.Channels.ProcognateTunnels_MOLE);
        }
        if (data.Channels.ProcognateTunnels_Caver !== void 0) {
            channels = channels.concat(data.Channels.ProcognateTunnels_Caver);
        }
        if (data.Channels.AlphaFillTunnels_MOLE !== void 0) {
            channels = channels.concat(data.Channels.AlphaFillTunnels_MOLE);
        }
        if (data.Channels.AlphaFillTunnels_Caver !== void 0) {
            channels = channels.concat(data.Channels.AlphaFillTunnels_Caver);
        }

        let cache = new Map<string, string>();
        for (let channel of channels) {
            let annotations = ChannelsDBData.getChannelAnnotationsImmediate(channel.Id);
            if (annotations !== null && annotations !== void 0) {
                channel.Type = annotations[0].name;
            }

            channelsMap.set(channel.GUID, `${channel.Type[0]}${channel.Id.toString().split('-')[2]}C${channel.Cavity}`); // channel ID format: 'compId-submissionId-tunnelId'
        }

        this.cache.set(submission, channelsMap);
    }

    public static get(channelId: string) {
        if (this.cache === void 0) {
            return void 0;
        }

        for (const submission of Array.from(this.cache.keys())) {
            const channelsMap = this.cache.get(submission);
            if (channelsMap) {
                const name = channelsMap.get(channelId);
                if (name) return name;
            }
        }

        return undefined;
    }

    public static getCachedItemsCount() {
        return (this.cache === void 0) ? 0 : this.cache.size;
    }
}

export class LastSelectedChannelData {
    private static data: Layers;
    public static set(data: Layers) {
        this.data = data;
    }
    public static get(): Layers {
        return this.data;
    }
}

export class LastVisibleChannels {
    private static data: Map<string, Tunnel&TunnelMetaInfo> = new Map();
    public static set(tunnel: Tunnel&TunnelMetaInfo) {
        this.data.set(tunnel.__id, tunnel)
    }
    public static remove(tunnel: Tunnel&TunnelMetaInfo) {
        this.data.delete(tunnel.__id);
    }
    public static get(): (Tunnel&TunnelMetaInfo)[] {
        const result: (Tunnel&TunnelMetaInfo)[] = []
        for (const id of Array.from(this.data.keys())) {
            const tunnel = this.data.get(id);
            if (tunnel) result.push(tunnel);
        }
        return result;
    }
    public static clear() {
        this.data.clear();
    }
}

export class ChannelsDBData {
    private static channelAnnotationCache: Map<string, ChannelAnnotation[]> = new Map();
    private static fileChannelAnnotationCache: Map<string, ChannelAnnotation[]> = new Map();
    private static channelDataCache: ChannelsDBChannels;
    private static residueAnnotationCache: Map<string, ResidueAnnotation[]>;

    public static reload(pdbid: string) {
        let channelsData = ApiService.getChannelsData(pdbid);
        let proteinData = ApiService.getProteinData(pdbid);

        channelsData.then(val => {
            this.channelAnnotationCache = val.channelsAnnotations;
            this.channelDataCache = val.channelsData;
        });

        proteinData.then(val => {
            this.residueAnnotationCache = val.residueData;
        });

        return Promise.all(
            [
                channelsData,
                proteinData
            ]
        );
    }

    public static doWhenCached(pdbid: string) {
        if (this.isCached()) {
            return Promise.resolve();
        }
        return new Promise<void>((res, rej) => {
            this.reload(pdbid).then(val => res()).catch(err => rej(err));
        });
    }

    public static isCached() {
        return (this.channelAnnotationCache !== void 0
            && this.channelDataCache !== void 0
            && this.residueAnnotationCache !== void 0);
    }

    public static getChannelAnnotationsImmediate(channelId: string) {
        if (!this.isCached() && this.fileChannelAnnotationCache === void 0) {
            return null;
        }

        let annotations = this.channelAnnotationCache.get(channelId);

        if (annotations === void 0) {
            annotations = this.fileChannelAnnotationCache.get(channelId);
            if (annotations === void 0)
                return null;
        }

        return annotations;
    }

    public static getChannelsAnnotations(pdbid: string) {

        if (this.isCached()) {
            return Promise.resolve(this.channelAnnotationCache);
        }

        return new Promise<Map<string, ChannelAnnotation[]>>((res, rej) => {
            this.reload(pdbid)
                .then(val => {
                    res(this.channelAnnotationCache);
                })
                .catch(err => rej(err));
        });
    }

    public static getChannelsData(pdbid: string) {

        if (this.isCached()) {
            return Promise.resolve(this.channelDataCache);
        }

        return new Promise<ChannelsDBChannels>((res, rej) => {
            this.reload(pdbid)
                .then(val => {
                    res(this.channelDataCache);
                })
                .catch(err => rej(err));
        });
    }

    public static getResidueAnnotationsImmediate(seqNumberAndChain: string) {

        if (!this.isCached()) {
            return null;
        }

        let annotations = this.residueAnnotationCache.get(seqNumberAndChain);
        if (annotations === void 0) {
            return null;
        }

        return annotations;
    }

    public static getResiduesAnnotationsImmediate() {
        if (!this.isCached()) {
            return null;
        }

        let annotations = this.residueAnnotationCache;
        if (annotations === void 0) {
            return null;
        }

        return <Map<string, ResidueAnnotation[]>>annotations;
    }

    public static getAnnotations() {
        return this.channelAnnotationCache;
    }

    public static setFileLoadedAnnotations(annotations: ChannelAnnotation[]) {
        const fileAnnotations: Map<string, ChannelAnnotation[]> = new Map();
        annotations.forEach((a) => {
            if (!fileAnnotations.get(a.channelId!))  {
                fileAnnotations.set(a.channelId!, []);
            }
            const tmp = fileAnnotations.get(a.channelId!);
            if (tmp) {
                tmp.push(a)
                fileAnnotations.set(a.channelId!, tmp)
            }
        });

        this.fileChannelAnnotationCache = fileAnnotations;
    }

    public static getFileLoadedAnnotations() {
        return this.fileChannelAnnotationCache;
    }
}
