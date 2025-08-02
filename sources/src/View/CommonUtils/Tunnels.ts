import { ReferenceType, TunnelAnnotation } from "../../AnnotationToChannelsDBService";
import { ChannelsDBData, LastVisibleChannels, TunnelName } from "../../Cache";
import { roundToDecimal } from "../../Common/Util/Numbers";
import { ChannelsDBChannels, ExportTunnel, Tunnel } from "../../DataInterface";
import { TunnelsId } from "./TunnelsId";
import { TwoDProtsBridge } from "./TwoDProtsBridge";

export class Tunnels {
    private static loadedChannels: Map<string, ChannelsDBChannels> = new Map();
    private static loadedChannelsDB: ChannelsDBChannels | undefined;
    private static onTunnelsLoaded: { handler: () => void }[];
    private static onTunnelsCollect: { handler: (submitId: number) => void }[];
    private static onTunnelsHide: { handler: () => void }[];

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

    public static attachOnTunnelsLoaded(handler: () => void) {
        if (this.onTunnelsLoaded === void 0) {
            this.onTunnelsLoaded = [];
        }

        this.onTunnelsLoaded.push({ handler });
    }
    public static invokeOnTunnelsLoaded() {
        if (this.onTunnelsLoaded === void 0) {
            return;
        }

        for (let h of this.onTunnelsLoaded) {
            h.handler();
        }
    }

    public static attachOnTunnelsHide(handler: () => void) {
        if (this.onTunnelsHide === void 0) {
            this.onTunnelsHide = [];
        }

        this.onTunnelsHide.push({ handler });
    }
    public static invokeOnTunnelsHide() {
        if (this.onTunnelsHide === void 0) {
            return;
        }

        for (let h of this.onTunnelsHide) {
            h.handler();
        }
    }

    public static attachOnTunnelsCollect(handler: (submitId: number) => void) {
        if (this.onTunnelsCollect === void 0) {
            this.onTunnelsCollect = [];
        }

        this.onTunnelsCollect.push({ handler });
    }
    public static invokeOnTunnelsCollect(submitId: number) {
        if (this.onTunnelsCollect === void 0) {
            return;
        }

        for (let h of this.onTunnelsCollect) {
            h.handler(submitId);
        }
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
}
