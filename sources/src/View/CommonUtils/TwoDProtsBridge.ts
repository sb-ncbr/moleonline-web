import { ChannelsDBChannels, ExportTunnel, Tunnel, TunnelMetaInfo } from "../../DataInterface";
import { Color } from "molstar/lib/mol-util/color";
import murmurhash from 'murmurhash'; 

interface TunnelColor {
    Color: string
}

export class TwoDProtsBridge {
    private static pdbId: string = '';
    private static vizualizedChannels: Map<string, Tunnel & TunnelMetaInfo> = new Map();
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
                Id: tunnel.__channelsDB ? tunnel.Id : TwoDProtsBridge.convertMoleId(tunnel.Id),
                Type: tunnel.Type,
                Profile: tunnel.Profile,
                Color: "black" //Color.toHexString(tunnel.__color)
            }
            channels.push(t as (Tunnel&TunnelColor));
        })
        this.initializeIdTable(Array.from(this.vizualizedChannels.values()))
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

    private static hashToNumber(input: string): number {
        return murmurhash.v3(input) >>> 0; 
    }

    public static convertMoleId(id: string) {
        const id_parts = id.split('-');
        const compId = id_parts[0];
        const submissionId = id_parts[1];
        const tunnelId = id_parts[2];

        const compNum = this.hashToNumber(compId); 
        const subNum = parseInt(submissionId, 10);
        const tunnelNum = parseInt(tunnelId, 10);

        return parseInt(`${compNum}${subNum}${tunnelNum}`);
    }

    private static initializeIdTable(tunnels: (Tunnel & TunnelMetaInfo)[]) {
        this.moleIdTable = new Map();

        tunnels.forEach(tunnel => {
            const covnertedId = tunnel.__channelsDB ? tunnel.Id : this.convertMoleId(tunnel.Id).toString();
            this.moleIdTable.set(tunnel.Id, covnertedId);
        })
    }

    public static getFromIdTable(id: string) {
        return this.moleIdTable.get(id);
    }
}