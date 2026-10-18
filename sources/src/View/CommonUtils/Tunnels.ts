import { ChannelsDBData, LastVisibleChannels, TunnelName } from "../../Cache";
import { roundToDecimal } from "../../Common/Util/Numbers";
import { CHANNEL_CATEGORIES, ChannelsDBChannels, ExportTunnel, Tunnel, TunnelMetaInfo } from "../../DataInterface";
import { TunnelsId } from "./TunnelsId";
import { TwoDProtsBridge } from "./TwoDProtsBridge";
import { Handlers } from "./Handlers";

type ReferenceType = "DOI" | "Pubmed" | "UniProt" | "";

interface TunnelAnnotation {
    Id: string,
    ChannelId?: string,
    Name: string,
    Description: string,
    Reference: string,
    ReferenceType: ReferenceType
}

export class Tunnels {
    private static loadedChannels: Map<string, ChannelsDBChannels> = new Map();
    private static loadedChannelsDB: ChannelsDBChannels | undefined;
    // attach… returns a function that detaches the handler again
    private static onTunnelsLoaded = new Handlers<[]>();
    private static onTunnelsHide = new Handlers<[]>();

    public static generateTunnelsDataJson() {
            let annotations = ChannelsDBData.getAnnotations();
            if (annotations.size === 0)
                annotations = ChannelsDBData.getFileLoadedAnnotations();
            const annotationsList: TunnelAnnotation[] = [];
            const allTunnels: ExportTunnel[] = [];
    
            for (const tunnel of LastVisibleChannels.get()) {
                allTunnels.push({
                    Type: tunnel.Type,
                    Id: tunnel.Id,
                    Cavity: tunnel.Cavity,
                    Auto: tunnel.Auto,
                    Properties: tunnel.Properties,
                    Profile: tunnel.Profile,
                    Layers: tunnel.Layers
                })
                const tunnelId = TunnelsId.getAnnotationId(tunnel.Id)
                if (tunnelId) {
                    const ann = annotations.get(tunnelId);
                    if (ann) {
                        ann.forEach(t_ann => {
                            annotationsList.push({
                                Id: t_ann.id,
                                Name: t_ann.name,
                                Reference: t_ann.reference,
                                Description: t_ann.description,
                                ReferenceType: t_ann.referenceType as ReferenceType,
                                ChannelId: tunnel.Id,
                            })
                        })
                    }
                }
            }
    
            const result = {
                Annotations: annotationsList,
                Channels: {
                    MOLEonline_MOLE: allTunnels
                }
            }
    
            return result;
        }

    public static setChannelsDB(channels: ChannelsDBChannels) {
        this.loadedChannelsDB = channels;
        TwoDProtsBridge.addTunnels(channels);
    }

    public static getChannelsDB() {
        return this.loadedChannelsDB;
    }

    public static attachOnTunnelsLoaded(handler: () => void) { return this.onTunnelsLoaded.attach(handler); }
    public static invokeOnTunnelsLoaded() { this.onTunnelsLoaded.invoke(); }

    public static attachOnTunnelsHide(handler: () => void) { return this.onTunnelsHide.attach(handler); }
    public static invokeOnTunnelsHide() { this.onTunnelsHide.invoke(); }

    // Marks channels as ChannelsDB's, also before they are first shown
    public static markChannelsDB(channels: ChannelsDBChannels) {
        for (const tunnels of Object.values(channels)) {
            if (Array.isArray(tunnels)) {
                for (const tunnel of tunnels) {
                    (tunnel as TunnelMetaInfo).__channelsDB = true;
                }
            }
        }
    }

    // ChannelsDB names the chains lining its channels by label ID; MOLE and mmCIF tunnel files by auth ID
    public static chainsByLabel(channel: { __channelsDB?: boolean } | undefined) {
        return channel?.__channelsDB === true;
    }

    public static addChannels(submitId: string, channels: ChannelsDBChannels) {
        this.loadedChannels.set(submitId, channels);
        TwoDProtsBridge.addTunnels(channels);
    }

    public static getChannels() {
        return this.loadedChannels;
    }

    public static getLength(tunnel: Tunnel): number {
        let len = tunnel.Layers.LayersInfo[tunnel.Layers.LayersInfo.length - 1].LayerGeometry.EndDistance;
        len = roundToDecimal(len, 1);
        return len;
    }

    public static getBottleneck(tunnel: Tunnel): string {
        let bneck = "<Unknown>";
        for (let element of tunnel.Layers.LayersInfo) {
            if (element.LayerGeometry.Bottleneck || element.LayerGeometry.bottleneck) {
                let val = element.LayerGeometry.MinRadius;
                bneck = (Math.round(val * 10) / 10).toString();
                break;
            }
        }

        return bneck;
    }

    public static getName(tunnel: Tunnel): string | undefined {
        if (tunnel === void 0) {
            return void 0;
        }
        return TunnelName.get(tunnel.GUID);
    }

    public static concatTunnelsSafe(origin: Tunnel[], newTunnels: Tunnel[] | undefined) {
        if (newTunnels === void 0) {
            return origin;
        }

        return origin.concat(newTunnels);
    }

    public static concatAllCategories(channels: ChannelsDBChannels) {
        let tunnels: Tunnel[] = [];
        for (const category of CHANNEL_CATEGORIES) {
            tunnels = this.concatTunnelsSafe(tunnels, channels[category]);
        }
        return tunnels;
    }
}
