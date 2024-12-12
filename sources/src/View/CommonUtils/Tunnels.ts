import { TunnelName } from "../../Cache";
import { roundToDecimal } from "../../Common/Util/Numbers";
import { ChannelsDBChannels, ExportTunnel, Tunnel } from "../../DataInterface";

export class Tunnels {
    private static loadedChannels: Map<string, ChannelsDBChannels> = new Map();
    private static loadedChannelsDB: ChannelsDBChannels | undefined;
    private static onTunnelsLoaded: { handler: () => void }[];
    private static onTunnelsCollect: { handler: (submitId: number) => void }[];

    public static setChannelsDB(channels: ChannelsDBChannels) {
        this.loadedChannelsDB = channels;
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
            if (element.LayerGeometry.Bottleneck) {
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
