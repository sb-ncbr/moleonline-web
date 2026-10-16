import { ChannelsDBChannels, Profile, Tunnel, TunnelMetaInfo } from "../../DataInterface";

interface TunnelColor {
    Color: string
}

interface VizualizedTunnel {
    Id: string
    Type: string,
    Profile: Profile[],
    Color: string,
}

export class TwoDProtsBridge {
    private static allChannels: Map<string, Tunnel & TunnelMetaInfo> = new Map();
    private static onColorTunnelChanges: { handler: (channel: Tunnel & TunnelMetaInfo) => void }[];
    private static moleIdTable: Map<string, string> = new Map();

    public static attachOnColorTunnelChangeHandler(handler: (channel: Tunnel & TunnelMetaInfo) => void) {
        if (this.onColorTunnelChanges === void 0) {
            this.onColorTunnelChanges = [];
        }

        this.onColorTunnelChanges.push({ handler });
    }
    public static invokeOnResidueSelectHandlers(channel: Tunnel & TunnelMetaInfo) {
        if (this.onColorTunnelChanges === void 0) {
            return;
        }

        for (let h of this.onColorTunnelChanges) {
            h.handler(channel);
        }
    }

    public static getVizualizedChannels(): (Tunnel & TunnelColor)[] {
        const channels: (Tunnel & TunnelColor)[] = [];
        const convertIdTunnels: Map<string, VizualizedTunnel> = new Map();
        let id = 0;

        this.allChannels.forEach(tunnel => {
            const t = {
                Id: id.toString(),
                Type: tunnel.Type,
                Profile: tunnel.Profile,
                Color: "black" //Color.toHexString(tunnel.__color)
            }
            channels.push(t as (Tunnel & TunnelColor));
            convertIdTunnels.set(tunnel.Id, t);
            id++;
        })
        this.initializeIdTable(convertIdTunnels)
        return channels;
    }

    private static initializeIdTable(tunnels: Map<string, VizualizedTunnel>) {
        this.moleIdTable = new Map();

        Array.from(tunnels.keys()).forEach(key => {
            const tunnel = tunnels.get(key);
            if (tunnel) {
                this.moleIdTable.set(key, tunnel.Id);
            }
        })
    }

    public static getFromIdTable(id: string) {
        return this.moleIdTable.get(id);
    }

    public static addTunnels(tunnels: ChannelsDBChannels) {
        Object.entries(tunnels).forEach(([_, tunnelArray]) => {
            (tunnelArray as Tunnel[]).forEach(tunnel => this.allChannels.set(tunnel.Id, tunnel as (Tunnel&TunnelMetaInfo)))
        });
    }
}