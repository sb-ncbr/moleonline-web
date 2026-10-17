import { ApiService, ChannelAnnotation, ResidueAnnotation } from "./ChannelsDBAPIService";
import { CHANNEL_CATEGORIES, ChannelsDBChannels, MoleData, Tunnel, TunnelMetaInfo } from "./DataInterface";
import { Context } from "./View/Context";
import { Events } from "./Bridge";
import { isRefused } from "./Http";

export class TunnelName {
    private static cache: Map<string, Map<string, string>> = new Map();

    public static reload(data: MoleData, submission: string) {
        let channels: Tunnel[] = [];
        let channelsMap: Map<string, string> = new Map();
        for (const category of CHANNEL_CATEGORIES) {
            if (data.Channels[category] !== void 0) {
                channels = channels.concat(data.Channels[category]);
            }
        }

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
    // One request per entry, shared by the panels that ask for it. A refused one stays (ChannelsDB has no such
    // entry); after a network or server error the next caller asks again.
    private static loaded: { pdbid: string, promise: Promise<unknown> } | undefined;

    private static reload(pdbid: string) {
        if (this.loaded?.pdbid !== pdbid) {
            const loaded = {
                pdbid, promise: this.load(pdbid).catch(error => {
                    if (!isRefused(error) && this.loaded === loaded) {
                        this.loaded = void 0;
                    }
                    throw error;
                })
            };
            this.loaded = loaded;
        }
        return this.loaded.promise;
    }

    private static load(pdbid: string) {
        // the channels are filtered to the loaded structure, so they wait for it
        let channelsData = Promise.all([ApiService.getChannelsData(pdbid), Context.getInstance().getStructureChains()])
            .then(([val, chains]) => {
                this.channelAnnotationCache = val.channelsAnnotations;
                this.channelDataCache = (chains === null) ? val.channelsData : this.inStructure(val.channelsData, chains);
                return val;
            });
        let proteinData = ApiService.getProteinData(pdbid).then(val => {
            this.residueAnnotationCache = val.residueData;
        });

        return Promise.all([channelsData, proteinData]);
    }

    // ChannelsDB computed its channels on one structure, the asymmetric unit or an assembly, and names the chains
    // lining them by label, copies as "A-2". A channel belongs to the loaded structure when every chain lining it is
    // there: otherwise it lies where the structure has no atoms, or part of its wall is missing.
    private static inStructure(channels: ChannelsDBChannels, chains: Set<string>): ChannelsDBChannels {
        let hidden = 0;
        const result = { ...channels };
        for (const category of CHANNEL_CATEGORIES) {
            const tunnels = channels[category];
            if (!Array.isArray(tunnels)) {
                continue;
            }
            result[category] = tunnels.filter(t => {
                // "HIS 63 A", "ASN 242 A Backbone", "ARG 65 A-2"
                const lining = (t.Layers?.ResidueFlow ?? []).map(r => r.split(" ")[2]).filter(c => c !== void 0);
                const inside = lining.every(c => chains.has(c));
                hidden += inside ? 0 : 1;
                return inside;
            });
        }
        if (hidden > 0) {
            Events.invokeNotifyMessage({
                messageType: "Info",
                message: `${hidden} ChannelsDB channel${hidden === 1 ? " is" : "s are"} not shown: ChannelsDB computed them on another structure of this entry, in chains that the loaded one does not contain.`
            });
        }
        return result;
    }

    public static doWhenCached(pdbid: string): Promise<void> {
        return this.reload(pdbid).then(() => { });
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

    public static getChannelsAnnotations(pdbid: string): Promise<Map<string, ChannelAnnotation[]>> {
        return this.reload(pdbid).then(() => this.channelAnnotationCache);
    }

    public static getChannelsData(pdbid: string): Promise<ChannelsDBChannels> {
        return this.reload(pdbid).then(() => this.channelDataCache);
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
