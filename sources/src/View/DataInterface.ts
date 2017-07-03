namespace DataInterface{
    export interface LayerGeometry{
        MinRadius:number,
        MinFreeRadius:number,
        StartDistance:number,
        EndDistance:number,
        LocalMinimum: boolean,
        Bottleneck: boolean
    };
    export interface Layerweightedproperties{
        Hydrophobicity: number,
        Hydropathy: number,
        Polarity: number,
        Mutability: number
    };
    export interface LayersInfo{
        LayerGeometry:LayerGeometry,
        Residues:string[],
        FlowIndices:string[],
        Properties:Properties 
    };
    export interface Layers{
        ResidueFlow:string[],
        HetResidues:any[], //Not Used
        LayerWeightedProperties:Layerweightedproperties
        LayersInfo:LayersInfo[]
    };
    export interface Profile{
        Radius: number,
        FreeRadius: number,
        T: number,
        Distance: number,
        X: number,
        Y: number,
        Z: number,
        Charge: number
    };
    export interface Properties{
        Charge: number,
        NumPositives: number,
        NumNegatives: number,
        Hydrophobicity: number,
        Hydropathy: number,
        Polarity: number,
        Mutability: number
    };
    export interface Tunnel{
        Type: string,
        Id: string,
        Cavity: string,
        Auto: boolean,
        Properties: Properties,
        Profile: Profile[],
        Layers: Layers
    };
    export interface MoleData{
        Channels:{
            Tunnels:Tunnel[],
            MergedPores:Tunnel[],
            Pores:Tunnel[],
            Paths:Tunnel[]
        }
    };
    export interface ChannelsDBData{
        Channels:{
            /*
            Tunnels:Tunnel[],
            MergedPores:Tunnel[],
            Pores:Tunnel[],
            Paths:Tunnel[]
            */
            ReviewedChannels: Tunnel[],
            CSATunnels: Tunnel[],
            TransmembranePores: Tunnel[],
            CofactorTunnels: Tunnel[]
        },
        Annotations:AnnotationObject[]
    }

    export interface AnnotationObject{
        Annotation: any,
        Reference: string
    };

    //--

    export interface LayerData{
        StartDistance: number,
        EndDistance: number,
        MinRadius: number,
        MinFreeRadius: number,
        Properties: any,
        Residues: any
    };

    export function convertLayersToLayerData(layersObject:DataInterface.Layers):LayerData[]{
            let layersData: LayerData[] = [];
            let layerCount = layersObject.LayersInfo.length;
            
            /*
            export interface LayerData{
            StartDistance: number,
            EndDistance: number,
            MinRadius: number,
            MinFreeRadius: number,
            Properties: any,
            Residues: any
            */

            for(let i=0;i<layerCount;i++){
                /*
                Hydrophobicity: number,
                Hydropathy: number,
                Polarity: number,
                Mutability: number
                */
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
                    MinFreeRadius: layersObject.LayersInfo[i].LayerGeometry.MinFreeRadius,
                    Properties: layersObject.LayersInfo[i].Properties,//? Proc sem davat weighted properties?
                    Residues: layersObject.LayersInfo[i].Residues
                });
            }

            return layersData;
        }

        export namespace Annotations{
            export interface ChannelsDBData{
                EntryAnnotations: ProteinAnnotation[],
                ResidueAnnotations: ResidueAnnotations
            };

            export interface ProteinAnnotation{
                Function: string,
                Name: string,
                Catalytics: string[],
                UniProtId: string
            };

            export interface ResidueAnnotations{
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
};