import { ApiService, ChannelAnnotation, ResidueAnnotation } from "./ChannelsDBAPIService";
import { ChannelsDBChannels, Layers, MoleData, Tunnel, TunnelMetaInfo } from "./DataInterface";

export class TunnelName {
    private static cache: Map<string, Map<string, string>> = new Map();

    public static reload(data: MoleData, submission: string) {
        let channels: Tunnel[] = [];
        let channelsMap: Map<string, string> = new Map();
        if (data.Channels.MergedPores.length > 0) {
            channels = channels.concat(data.Channels.MergedPores);
        }
        if (data.Channels.Paths.length > 0) {
            channels = channels.concat(data.Channels.Paths);
        }
        if (data.Channels.Pores.length > 0) {
            channels = channels.concat(data.Channels.Pores);
        }
        if (data.Channels.Tunnels.length > 0) {
            channels = channels.concat(data.Channels.Tunnels);
        }

        let cache = new Map<string, string>();
        for (let channel of channels) {
            channelsMap.set(channel.GUID, `${channel.Type[0]}${channel.Id}C${channel.Cavity}`);
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
    public static get(): Tunnel[]&TunnelMetaInfo[] {
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
    private static channelAnnotationCache: Map<string, ChannelAnnotation[]>;
    private static channelDataCache: ChannelsDBChannels;
    private static liningResiduesCache: string[];
    private static residueAnnotationCache: Map<string, ResidueAnnotation[]>;

    public static reload(pdbid: string) {
        let channelsData = ApiService.getChannelsData(pdbid);
        let proteinData = ApiService.getProteinData(pdbid);

        channelsData.then(val => {
            this.channelAnnotationCache = val.channelsAnnotations;
            this.channelDataCache = val.channelsData;
            this.liningResiduesCache = val.liningResidues;
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
        return this.channelAnnotationCache !== void 0
            && this.channelDataCache !== void 0
            && this.liningResiduesCache !== void 0
            && this.residueAnnotationCache !== void 0;
    }

    public static getChannelAnnotations(pdbid: string, channelId: string) {

        if (this.isCached()) {
            return Promise.resolve(this.channelAnnotationCache.get(channelId));
        }

        return new Promise<ChannelAnnotation[] | undefined>((res, rej) => {
            this.reload(pdbid)
                .then(val => {
                    res(this.channelAnnotationCache.get(channelId));
                })
                .catch(err => rej(err));
        });
    }

    public static getChannelAnnotationsImmediate(channelId: string) {
        if (!this.isCached()) {
            return null;
        }

        let annotations = this.channelAnnotationCache.get(channelId);

        if (annotations === void 0) {
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

    public static getResidueAnnotations(pdbid: string, seqNumberAndChain: string) {

        if (this.isCached()) {
            return Promise.resolve(this.residueAnnotationCache.get(seqNumberAndChain));
        }

        return new Promise<ResidueAnnotation[] | undefined>((res, rej) => {
            this.reload(pdbid)
                .then(val => {
                    res(this.residueAnnotationCache.get(seqNumberAndChain));
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

    public static getResiduesAnnotations(pdbid: string) {

        if (this.isCached()) {
            return Promise.resolve(this.residueAnnotationCache);
        }

        return new Promise<Map<string, ResidueAnnotation[]>>((res, rej) => {
            this.reload(pdbid)
                .then(val => {
                    res(this.residueAnnotationCache);
                })
                .catch(err => rej(err));
        });
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

    public static getLiningResidues(pdbid: string) {

        if (this.isCached()) {
            return Promise.resolve(this.liningResiduesCache.slice());
        }

        return new Promise<string[] | undefined>((res, rej) => {
            this.reload(pdbid)
                .then(val => {
                    if (this.liningResiduesCache === void 0) {
                        res(void 0);
                    }
                    else {
                        res(this.liningResiduesCache.slice());
                    }
                })
                .catch(err => rej(err));
        });
    }
}
