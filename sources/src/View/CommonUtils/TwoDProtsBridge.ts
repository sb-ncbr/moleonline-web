import { ChannelsDBChannels, ExportTunnel, Profile, Tunnel, TunnelMetaInfo } from "../../DataInterface";
import { Color } from "molstar/lib/mol-util/color";
import murmurhash from 'murmurhash';
import { ChannelsDBData } from "../../Cache";
import { ReferenceType, TunnelAnnotation } from "../../AnnotationToChannelsDBService";
import { TunnelsId } from "./TunnelsId";


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
    private static pdbId: string = '';
    private static vizualizedChannels: Map<string, Tunnel & TunnelMetaInfo> = new Map();
    private static onColorTunnelChanges: { handler: (channel: Tunnel & TunnelMetaInfo) => void }[];
    private static moleIdTable: Map<string, string> = new Map();
    private static reversedMoleIdTable: Map<string, string> = new Map();


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
        const convertIdTunnels: Map<string, VizualizedTunnel> = new Map();
        let id = 0;

        this.vizualizedChannels.forEach(tunnel => {
            const t = {
                Id: id.toString(),
                Type: tunnel.Type,
                Profile: tunnel.Profile,
                Color: "black" //Color.toHexString(tunnel.__color)
            }
            channels.push(t as (Tunnel&TunnelColor));
            convertIdTunnels.set(tunnel.Id, t);
            id++;
        })
        this.initializeIdTable(convertIdTunnels)
        return channels;
    }

    public static generateTunnelsDataJson() {
        const annotations = ChannelsDBData.getAnnotations();
        const annotationsList: TunnelAnnotation[]  = [];
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
            });
            const tunnelId = TunnelsId.getAnnotationId(tunnel.Id)
            if (tunnelId) {
                const ann = annotations.get(tunnelId);
                if (ann) {
                    ann.forEach(t_ann => {
                        annotationsList.push({
                            Id: t_ann.id,
                            Name: t_ann.name,
                            Reference: t_ann.link,
                            Description: t_ann.description,
                            ReferenceType: t_ann.reference as ReferenceType
                        })
                    });
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

    private static initializeIdTable(tunnels: Map<string, VizualizedTunnel>) {
        this.moleIdTable = new Map();
        this.reversedMoleIdTable = new Map();

        Array.from(tunnels.keys()).forEach(key => {
            const tunnel = tunnels.get(key);
            if (tunnel) {
                this.moleIdTable.set(key, tunnel.Id);
                this.reversedMoleIdTable.set(tunnel.Id, key);
            }
        })
    }

    public static getFromIdTable(id: string) {
        return this.moleIdTable.get(id);
    }

    public static getFromReversedIdTable(id: string) {
        return this.reversedMoleIdTable.get(id);
    }
}