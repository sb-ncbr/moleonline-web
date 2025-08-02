import { UUID } from "molstar/lib/mol-util";
import { ChannelsDBChannels, Tunnel, TunnelMetaInfo } from "../../DataInterface";
import { ChannelAnnotation } from "../../ChannelsDBAPIService";
import { ColorGenerator } from "molstar/lib/extensions/meshes/mesh-utils";

export class TunnelsId {
    private static annotationTunnelsIdTable: Map<string, string> = new Map();

    public static generateGuid(tunnels: Tunnel[]) {
        for (let idx = 0; idx < tunnels.length; idx++) {
            tunnels[idx].GUID = UUID.create22();
        }
        return tunnels;
    }

    public static generateGuidAll(moleData: ChannelsDBChannels) {
        let idx = 1;

        for (const key in moleData) {
            if (Array.isArray(moleData[key as keyof ChannelsDBChannels])) {
                const tunnelsArray = moleData[key as keyof ChannelsDBChannels] as Tunnel[];

                tunnelsArray.forEach(tunnel => {
                    tunnel.GUID = UUID.create22();
                    (tunnel as Tunnel&TunnelMetaInfo).__color = ColorGenerator.next().value;
                    idx++;
                });
            }
        }

        return moleData
    }


    public static generateIdAll(moleData: ChannelsDBChannels, compId: string, submissionId: string) {
        let idx = 1;

        for (const key in moleData) {
            if (Array.isArray(moleData[key as keyof ChannelsDBChannels])) {
                const tunnelsArray = moleData[key as keyof ChannelsDBChannels] as Tunnel[];

                tunnelsArray.forEach(tunnel => {
                    tunnel.Id = `${compId}-${submissionId}-${idx}`;
                    idx++;
                });
            }
        }

        return moleData
    }

    //ChannelAnnotation

    public static generateIdAllWithAnnotations(annotations: Map<string, ChannelAnnotation[]>, channels: ChannelsDBChannels, compId: string, submissionId: string) {
        let idx = 1;

        const annotationIds: string[] = Array.from(annotations.keys())

        for (const key in channels) {
            if (Array.isArray(channels[key as keyof ChannelsDBChannels])) {
                const tunnelsArray = channels[key as keyof ChannelsDBChannels] as Tunnel[];

                tunnelsArray.forEach(tunnel => {
                    for (const annotationId of annotationIds) {
                        if (tunnel.Id === annotationId) {
                            this.annotationTunnelsIdTable.set(`${compId}-${submissionId}-${idx}`, tunnel.Id)
                        }
                    }
                    tunnel.Id = `${compId}-${submissionId}-${idx}`;
                    idx++;
                });
            }
        }
        return channels;
    }

    public static getAnnotationId(id: string) {
        return this.annotationTunnelsIdTable.get(id);
    }
}
