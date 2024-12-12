import { Shape } from "molstar/lib/mol-model/shape"
import { Color } from "molstar/lib/mol-util/color"

export interface LayerGeometry {
    MinRadius: number,
    MinBRadius: number,
    MinFreeRadius: number,
    StartDistance: number,
    EndDistance: number,
    LocalMinimum: boolean,
    Bottleneck: boolean
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
    HetResidues: any[], //Not Used
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
    GUID: string
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

export type ChannelSourceData = {
    id?: string | number,
    type?: string,
    label?: string,
    description?: string
}

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

        let properties = {
            Charge: layersObject.LayersInfo[i].Properties.Charge,
            NumPositives: layersObject.LayersInfo[i].Properties.NumPositives,
            NumNegatives: layersObject.LayersInfo[i].Properties.NumNegatives,
            Hydrophobicity: layersObject.LayerWeightedProperties.Hydrophobicity,
            Hydropathy: layersObject.LayerWeightedProperties.Hydropathy,
            Polarity: layersObject.LayerWeightedProperties.Polarity,
            Mutability: layersObject.LayerWeightedProperties.Mutability
        };
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
    export interface ChannelsDBData {
        EntryAnnotations: ProteinAnnotation[],
        ResidueAnnotations: ResidueAnnotations
    };

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

export interface ProteinData {
    data: {
        chains: {
            authAsymId: String[],
            count: Number,
            indices: Number[],
            residueStartIndex: Number[],
            residueEndIndex: Number[]
        }
        residues: {
            authAsymId: string[],
            authSeqNumber: Number[],
            authName: string[],
            indices: Number[],
            count: Number,
            entityId: Number,
            isHet: (0 | 1)[]
        }
    },
    id: string,
    modelId: string,
    positions: {
        count: Number,
        indices: Number[],
        x: Number[],
        y: Number[],
        z: Number[],
    }
};
