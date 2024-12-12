import { ChannelsDBChannels, ExportTunnel, Tunnel, TunnelMetaInfo } from "../../DataInterface";
import { Color } from "molstar/lib/mol-util/color";

interface TunnelColor {
    Color: string
}

export class TwoDProtsBridge {
    private static pdbId: string = '';
    private static vizualizedChannels: Map<string, Tunnel & TunnelMetaInfo> = new Map();

    public static addChannel(tunnel: Tunnel & TunnelMetaInfo) {
        this.vizualizedChannels.set(tunnel.__id, tunnel);
    }

    public static removeChannel(id: string) {
        if (this.vizualizedChannels.has(id)) {
            this.vizualizedChannels.delete(id);
        }
    }

    public static setPdbId(pdbId: string) {
        this.pdbId = pdbId;
    }

    public static getPdbId(): string | undefined {
        if (this.pdbId === "") return undefined;
        return this.pdbId;
    }

    public static getVizualizedChannels(): (Tunnel&TunnelColor)[] {
        const channels: (Tunnel&TunnelColor)[] = [];
        this.vizualizedChannels.forEach(tunnel => {
            const t = {
                Id: tunnel.Id,
                Type: tunnel.Type,
                Profile: tunnel.Profile,
                Color: Color.toHexString(tunnel.__color)
            }
            channels.push(t as (Tunnel&TunnelColor));
        })
        return channels;
    }

    public static generateTunnelsDataJson() {
        //TODO Annotations
        const allTunnels: ExportTunnel[] = [];

        for (const tunnel of Array.from(this.vizualizedChannels.values())) {
            allTunnels.push({
                Type: tunnel.Type,
                Id: tunnel.Id,
                Cavity: tunnel.Cavity,
                Auto: tunnel.Auto,
                Properties: tunnel.Properties,
                Profile: tunnel.Profile,
                Layers: tunnel.Layers
            })
        }

        const result = {
            Annotations: [],
            Channels: {
                MOLEonline_MOLE: allTunnels
            }
        }

        return result;
    }
}