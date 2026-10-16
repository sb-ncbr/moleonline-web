import { Shape } from "molstar/lib/mol-model/shape"
import { Color } from "molstar/lib/mol-util/color"

export interface LayerGeometry {
    MinRadius: number,
    MinBRadius: number,
    MinFreeRadius: number,
    StartDistance: number,
    EndDistance: number,
    LocalMinimum: boolean,
    Bottleneck: boolean,
    bottleneck: boolean
};
export interface Layerweightedproperties {
    Hydrophobicity: number,
    Hydropathy: number,
    Polarity: number,
    Mutability: number
};
export interface LayersInfo {
    LayerGeometry: LayerGeometry,
    Residues: string[],
    FlowIndices: string[],
    Properties: Properties
};
export interface Layers {
    ResidueFlow: string[],
    LayerWeightedProperties: Layerweightedproperties
    LayersInfo: LayersInfo[]
};
export interface Profile {
    Radius: number,
    FreeRadius: number,
    T: number,
    Distance: number,
    X: number,
    Y: number,
    Z: number,
    Charge: number
};
export interface Properties {
    Charge: number,
    NumPositives: number,
    NumNegatives: number,
    Hydrophobicity: number,
    Hydropathy: number,
    Polarity: number,
    Mutability: number,
    Ionizable: number,
    LogP: number,
    LogD: number,
    LogS: number,
    BRadius: number
};
export interface Tunnel {
    Type: string,
    Id: string,
    Cavity: string,
    Auto: boolean,
    Properties: Properties,
    Profile: Profile[],
    Layers: Layers,
    GUID: string,
    Caver?: boolean
};
export interface ExportTunnel {
    Type: string,
    Id: string,
    Cavity: string,
    Auto: boolean,
    Properties: Properties,
    Profile: Profile[],
    Layers: Layers
}
export interface MoleData {
    Channels: ChannelsDBChannels
};
export interface MoleChannels {
    Tunnels: Tunnel[],
    MergedPores: Tunnel[],
    Pores: Tunnel[],
    Paths: Tunnel[]
};

export interface TunnelMetaInfo extends Tunnel {
    __id: string,
    __isVisible: boolean,
    __color: Color,
    __isBusy: boolean,
    __ref: string,
    __group: number,
    __loci: Shape.Loci,
    __channelsDB: boolean,
    __submissionId: string,
    __layerColored: boolean,
};

export interface ChannelsDBChannels {
    // ReviewedChannels: Tunnel[],
    // CSATunnels: Tunnel[],
    // TransmembranePores: Tunnel[],
    // CofactorTunnels: Tunnel[]
    Tunnels: Tunnel[],
    MergedPores: Tunnel[],
    Pores: Tunnel[],
    Paths: Tunnel[],
    CSATunnels_MOLE: Tunnel[],
    CSATunnels_Caver: Tunnel[],
    ReviewedChannels_MOLE: Tunnel[],
    ReviewedChannels_Caver: Tunnel[],
    CofactorTunnels_MOLE: Tunnel[],
    CofactorTunnels_Caver: Tunnel[],
    TransmembranePores_MOLE: Tunnel[],
    TransmembranePores_Caver: Tunnel[],
    ProcognateTunnels_MOLE: Tunnel[],
    ProcognateTunnels_Caver: Tunnel[],
    AlphaFillTunnels_MOLE: Tunnel[],
    AlphaFillTunnels_Caver: Tunnel[]
};

// MOLEonline results first, then ChannelsDB; the first non-empty category is shown by default.
export const MOLE_CATEGORIES = ["MergedPores", "Paths", "Pores", "Tunnels"] as const;
export const CHANNELSDB_CATEGORIES = [
    "ReviewedChannels_MOLE", "ReviewedChannels_Caver",
    "CSATunnels_MOLE", "CSATunnels_Caver",
    "TransmembranePores_MOLE", "TransmembranePores_Caver",
    "CofactorTunnels_MOLE", "CofactorTunnels_Caver",
    "ProcognateTunnels_MOLE", "ProcognateTunnels_Caver",
    "AlphaFillTunnels_MOLE", "AlphaFillTunnels_Caver",
] as const;
export const CHANNEL_CATEGORIES = [...MOLE_CATEGORIES, ...CHANNELSDB_CATEGORIES];
export type ChannelCategory = typeof CHANNEL_CATEGORIES[number];

export function emptyChannels(): ChannelsDBChannels {
    const channels = {} as Record<ChannelCategory, Tunnel[]>;
    for (const category of CHANNEL_CATEGORIES) {
        channels[category] = [];
    }
    return channels;
}

export function firstNonEmptyCategory(channels: ChannelsDBChannels) {
    for (let i = 0; i < CHANNEL_CATEGORIES.length; i++) {
        const tunnels = channels[CHANNEL_CATEGORIES[i]];
        if (tunnels && tunnels.length > 0) {
            return { tunnels, channelsDB: i >= MOLE_CATEGORIES.length };
        }
    }
    return null;
}

export interface ChannelsDBData {
    Channels: ChannelsDBChannels,
    Annotations: AnnotationObject[]
}

export interface AnnotationObject {
    Id: string
    Name: string
    Description: string
    Reference: string
    ReferenceType: string
};

export interface Point {
    X: number,
    Y: number,
    Z: number
}

export interface Membrane {
    [x: string]: any
    points: MembranePoint[],
    __id: string,
    __isVisible: boolean,
    __isBusy: boolean,
    __ref: string,
    __group: number,
    __loci: Shape.Loci,
}

export interface MembranePoint {
    Position: Point
    Side: "N" | "O"
}

export interface Origins {
    Points: Point[],
    Type: string,
    __id: string,
    __isVisible: boolean,
    __isBusy: boolean,
    __ref: string,
    __group: number,
    __color: Color
}

export interface ShapeSourceData {
    kind?: string,
    tag?: string,
}

export interface OriginsSourceData extends ShapeSourceData {
    data?: Point[],
    ref?: string,
}

export interface SurfaceSourceData extends ShapeSourceData {
    vertices?: number[],
    triangles?: number[],
    solidForm?: boolean
}

//--

export interface LayerData {
    StartDistance: number,
    EndDistance: number,
    MinRadius: number,
    MinBRadius: number,
    MinFreeRadius: number,
    Properties: any,
    Residues: any
};

export function convertLayersToLayerData(layersObject: Layers): LayerData[] {
    let layersData: LayerData[] = [];
    let layerCount = layersObject.LayersInfo.length;

    for (let i = 0; i < layerCount; i++) {

        layersData.push({
            StartDistance: layersObject.LayersInfo[i].LayerGeometry.StartDistance,
            EndDistance: layersObject.LayersInfo[i].LayerGeometry.EndDistance,
            MinRadius: layersObject.LayersInfo[i].LayerGeometry.MinRadius,
            MinBRadius: layersObject.LayersInfo[i].LayerGeometry.MinBRadius,
            MinFreeRadius: layersObject.LayersInfo[i].LayerGeometry.MinFreeRadius,
            Properties: layersObject.LayersInfo[i].Properties,//? Proc sem davat weighted properties?
            Residues: layersObject.LayersInfo[i].Residues
        });
    }

    return layersData;
}

export namespace Annotations {
    export interface ProteinAnnotation {
        Function: string,
        Name: string,
        Catalytics: string[],
        UniProtId: string
    };

    export interface ResidueAnnotations {
        ChannelsDB: Annotation[],
        UniProt: Annotation[]
    };

    export interface Annotation {
        Id: string,
        Chain: string,
        Text: string,
        Reference: string,
        ReferenceType: string
    }
}
