import { CifBlock, CifCategory } from "molstar/lib/mol-io/reader/cif";
import { parseCifText } from "molstar/lib/mol-io/reader/cif/text/parser";

// interface ChannelsDBData {
//     Channels: ChannelsDBChannels;
//     Annotations: AnnotationObject[];
// }

// interface AnnotationObject {
//     Id: string;
//     Name: string;
//     Description: string;
//     Reference: string;
//     ReferenceType: string;
// }

// interface ChannelsDBChannels {
//     Tunnels: Tunnel[];
//     MergedPores: Tunnel[];
//     Pores: Tunnel[];
//     Paths: Tunnel[];
//     CSATunnels_MOLE: Tunnel[];
//     CSATunnels_Caver: Tunnel[];
//     ReviewedChannels_MOLE: Tunnel[];
//     ReviewedChannels_Caver: Tunnel[];
//     CofactorTunnels_MOLE: Tunnel[];
//     CofactorTunnels_Caver: Tunnel[];
//     TransmembranePores_MOLE: Tunnel[];
//     TransmembranePores_Caver: Tunnel[];
//     ProcognateTunnels_MOLE: Tunnel[];
//     ProcognateTunnels_Caver: Tunnel[];
//     AlphaFillTunnels_MOLE: Tunnel[];
//     AlphaFillTunnels_Caver: Tunnel[];
// }

// interface Tunnel {
//     Type: string;
//     Id: string;
//     Cavity: string;
//     Auto: boolean;
//     Properties: Properties;
//     Profile: Profile[];
//     Layers: Layers;
// }

// interface Properties {
//     Charge: number;
//     NumPositives: number;
//     NumNegatives: number;
//     Hydrophobicity: number;
//     Hydropathy: number;
//     Polarity: number;
//     Mutability: number;
//     Ionizable: number;
//     LogP: number;
//     LogD: number;
//     LogS: number;
//     BRadius: number;
// }

// interface Profile {
//     Radius: number;
//     FreeRadius: number;
//     T: number;
//     Distance: number;
//     X: number;
//     Y: number;
//     Z: number;
//     Charge: number;
// }

// interface Layers {
//     ResidueFlow: string[];
//     HetResidues: any[];
//     LayerWeightedProperties: Layerweightedproperties;
//     LayersInfo: LayersInfo[];
// }

// interface Layerweightedproperties {
//     Hydrophobicity: number;
//     Hydropathy: number;
//     Polarity: number;
//     Mutability: number;
// }

// interface LayersInfo {
//     LayerGeometry: LayerGeometry;
//     Residues: string[];
//     FlowIndices: string[];
//     Properties: Properties;
// }

// interface LayerGeometry {
//     MinRadius: number;
//     MinBRadius: number;
//     MinFreeRadius: number;
//     StartDistance: number;
//     EndDistance: number;
//     LocalMinimum: boolean;
//     Bottleneck: boolean;
// }


// export class CIFParser {
//     private cifContent: string;

//     constructor(cifContent: string) {
//         this.cifContent = cifContent;
//     }

//     parse(): ChannelsDBData {
//         const sections = this.splitSections(this.cifContent);
//         return {
//             Annotations: this.parseAnnotations(sections["annotation"] || []),
//             Channels: this.parseChannels(sections)
//         };
//     }

//     // private splitSections(cifContent: string): Record<string, string[]> {
//     //     const sections: Record<string, string[]> = {};
//     //     const regex = /loop_\n(_sb_ncbr_channel_[\w.]+\s+)+(([^_]\S.*\n)+)/g;
//     //     let match;
//     //     while ((match = regex.exec(cifContent)) !== null) {
//     //         const header = match[1].trim().split('\n')[0];
//     //         const data = match[2].trim().split('\n');
//     //         sections[header] = data;
//     //     }
//     //     return sections;
//     // }

//     private splitSections(cifContent: string): Record<string, string[]> {
//         const sections: Record<string, string[]> = {};
//         const regex = /loop_\n((?:_sb_ncbr_channel_[\w.]+\s*\n)+)((?:(?!loop_).*\S.*\n)+)/g;
//         let match;
    
//         while ((match = regex.exec(cifContent)) !== null) {
//             const header = match[1].trim().split('\n')[0]; // The first '_sb_ncbr_channel_' line
//             const data = match[2].trim().split('\n'); // The data block lines
//             sections[header] = data;
//         }
    
//         return sections;
//     }

//     private parseAnnotations(data: string[]): AnnotationObject[] {
//         return data.map(line => {
//             const [id, channelId, name, description, reference, referenceType] = line.split(/\s+/);
//             return {
//                 Id: id,
//                 Name: name,
//                 Description: description,
//                 Reference: reference,
//                 ReferenceType: referenceType
//             };
//         });
//     }

//     private parseChannels(sections: Record<string, string[]>): ChannelsDBChannels {
//         return {
//             Tunnels: this.parseTunnels(sections["_sb_ncbr_channel.id"] || []),
//             MergedPores: [],
//             Pores: [],
//             Paths: [],
//             CSATunnels_MOLE: [],
//             CSATunnels_Caver: [],
//             ReviewedChannels_MOLE: [],
//             ReviewedChannels_Caver: [],
//             CofactorTunnels_MOLE: [],
//             CofactorTunnels_Caver: [],
//             TransmembranePores_MOLE: [],
//             TransmembranePores_Caver: [],
//             ProcognateTunnels_MOLE: [],
//             ProcognateTunnels_Caver: [],
//             AlphaFillTunnels_MOLE: [],
//             AlphaFillTunnels_Caver: []
//         };
//     }

//     private parseTunnels(data: string[]): Tunnel[] {
//         return data.map(line => {
//             const [id, type, method, software, auto, cavity] = line.split(/\s+/);
//             return {
//                 Type: type,
//                 Id: id,
//                 Cavity: cavity,
//                 Auto: auto === 'true',
//                 Properties: this.parseProperties(line),
//                 Profile: this.parseProfiles([]),
//                 Layers: this.parseLayers(line)
//             };
//         });
//     }

//     private parseProperties(line: string): Properties {
//         const fields = line.split(/\s+/);
//         return {
//             Charge: parseFloat(fields[0] || "0"),
//             NumPositives: parseFloat(fields[1] || "0"),
//             NumNegatives: parseFloat(fields[2] || "0"),
//             Hydrophobicity: parseFloat(fields[3] || "0"),
//             Hydropathy: parseFloat(fields[4] || "0"),
//             Polarity: parseFloat(fields[5] || "0"),
//             Mutability: parseFloat(fields[6] || "0"),
//             Ionizable: parseFloat(fields[7] || "0"),
//             LogP: parseFloat(fields[8] || "0"),
//             LogD: parseFloat(fields[9] || "0"),
//             LogS: parseFloat(fields[10] || "0"),
//             BRadius: parseFloat(fields[11] || "0")
//         };
//     }

//     private parseProfiles(data: string[]): Profile[] {
//         return data.map(line => {
//             const [radius, freeRadius, t, distance, x, y, z, charge] = line.split(/\s+/);
//             return {
//                 Radius: parseFloat(radius),
//                 FreeRadius: parseFloat(freeRadius),
//                 T: parseFloat(t),
//                 Distance: parseFloat(distance),
//                 X: parseFloat(x),
//                 Y: parseFloat(y),
//                 Z: parseFloat(z),
//                 Charge: parseFloat(charge)
//             };
//         });
//     }

//     private parseLayers(line: string): Layers {
//         return {
//             ResidueFlow: line.split(/\s+/),
//             HetResidues: [],
//             LayerWeightedProperties: {
//                 Hydrophobicity: 0,
//                 Hydropathy: 0,
//                 Polarity: 0,
//                 Mutability: 0
//             },
//             LayersInfo: this.parseLayerInfo([])
//         };
//     }

//     private parseLayerInfo(data: string[]): LayersInfo[] {
//         return data.map(line => {
//             const fields = line.split(/\s+/);
//             return {
//                 LayerGeometry: {
//                     MinRadius: parseFloat(fields[0] || "0"),
//                     MinBRadius: parseFloat(fields[1] || "0"),
//                     MinFreeRadius: parseFloat(fields[2] || "0"),
//                     StartDistance: parseFloat(fields[3] || "0"),
//                     EndDistance: parseFloat(fields[4] || "0"),
//                     LocalMinimum: fields[5] === 'true',
//                     Bottleneck: fields[6] === 'true'
//                 },
//                 Residues: [],
//                 FlowIndices: [],
//                 Properties: this.parseProperties(line)
//             };
//         });
//     }
// }

// function getChannels(channels: CifCategory) {
//     const rows = channels.rowCount;
//     const ids = channels.getField('id');
//     const types = channels.getField('type');
//     const methods = channels.getField('method');
//     const software = channels.getField('software');
//     const auto = channels.getField('auto');
//     const cavities = channels.getField('cavity');

//     const result = {}

//     for (let i = 0; i < rows; i++) {

//     }

// }

interface Residue {
    Id: string;
    Name: string;
    SerialNumber: number;
    X: number;
    Y: number;
    Z: number;
    LayerId: string;
    ChannelId: string;
}

interface Layers {
    Id: string;
    Type: string;
    Number: number;
    ChannelId: string;
    Residues: string[];
}

interface Tunnel {
    Id: string;
    Type: string;
    Method: string;
    Software: string;
    Auto: boolean;
    Cavity: number;
    Profiles: Profile[];
    Layers: Layers[];
}

interface Profile {
    Id: string;
    Radius: number;
    FreeRadius: number;
    Distance: number;
    Temperature: number;
    X: number;
    Y: number;
    Z: number;
    Charge: number;
}

interface Annotation {
    Id: string;
    Name: string;
    Description: string;
    Reference: string;
    ReferenceType: string;
}

interface ChannelsDBData {
    Channels: {
        Tunnels: Tunnel[];
        MergedPores: Tunnel[];
        Pores: Tunnel[];
        Paths: Tunnel[];
        CSATunnels_MOLE: Tunnel[];
        CSATunnels_Caver: Tunnel[];
        ReviewedChannels_MOLE: Tunnel[];
        ReviewedChannels_Caver: Tunnel[];
        CofactorTunnels_MOLE: Tunnel[];
        CofactorTunnels_Caver: Tunnel[];
        TransmembranePores_MOLE: Tunnel[];
        TransmembranePores_Caver: Tunnel[];
        ProcognateTunnels_MOLE: Tunnel[];
        ProcognateTunnels_Caver: Tunnel[];
        AlphaFillTunnels_MOLE: Tunnel[];
        AlphaFillTunnels_Caver: Tunnel[];
    };
    Annotations: Annotation[];
}

function getTunnelsBlock(blocks: any[]): any {
    return blocks.find(block => block.header === "tunnels");
}

function parseAnnotations(category: any): Annotation[] {
    const rowCount = category.rowCount;
    const ids = category.getField("id");
    const names = category.getField("name");
    const descriptions = category.getField("description");
    const references = category.getField("reference");
    const referenceTypes = category.getField("reference_type");

    const annotations: Annotation[] = [];
    for (let i = 0; i < rowCount; i++) {
        annotations.push({
            Id: ids.str(i),
            Name: names.str(i),
            Description: descriptions.str(i),
            Reference: references.str(i),
            ReferenceType: referenceTypes.str(i),
        });
    }
    return annotations;
}

function parseChannels(category: any): Tunnel[] {
    const rowCount = category.rowCount;
    const ids = category.getField("id");
    const types = category.getField("type");
    const methods = category.getField("method");
    const software = category.getField("software");
    const autos = category.getField("auto");
    const cavities = category.getField("cavity");

    const channels: Tunnel[] = [];
    for (let i = 0; i < rowCount; i++) {
        channels.push({
            Id: ids.str(i),
            Type: types.str(i),
            Method: methods.str(i),
            Software: software.str(i),
            Auto: autos.int(i) === 1,
            Cavity: cavities.float(i),
            Profiles: [],
            Layers: [],
        });
    }
    return channels;
}

function parseProfiles(category: any, channels: Tunnel[]): Profile[] {
    const rowCount = category.rowCount;
    const channelIds = category.getField("channel_id");
    const radii = category.getField("radius");
    const freeRadii = category.getField("free_radius");
    const distances = category.getField("distance");
    const temperatures = category.getField("T");
    const x = category.getField("x");
    const y = category.getField("y");
    const z = category.getField("z");
    const charges = category.getField("charge");

    const profiles: Profile[] = [];
    for (let i = 0; i < rowCount; i++) {
        profiles.push({
            Id: `${channelIds.str(i)}_${i}`,
            Radius: radii.float(i),
            FreeRadius: freeRadii.float(i),
            Distance: distances.float(i),
            Temperature: temperatures.float(i),
            X: x.float(i),
            Y: y.float(i),
            Z: z.float(i),
            Charge: charges.int(i),
        });
    }

    const profilesByChannel: { [channelId: string]: Profile[] } = {};
    for (const profile of profiles) {
        if (!profilesByChannel[profile.Id]) {
            profilesByChannel[profile.Id] = [];
        }
        profilesByChannel[profile.Id].push(profile);
    }

    for (const channel of channels) {
        channel.Profiles = profilesByChannel[channel.Id] || [];
    }

    return profiles;
}

// function parseResidues(category: any): Residue[] {
//     const rowCount = category.rowCount;
//     const ids = category.getField("id");
//     const channelIds = category.getField("channel_id");
//     const layerIds = category.getField("layer_id");
//     const names = category.getField("name");
//     const serials = category.getField("serial_number");
//     const x = category.getField("x");
//     const y = category.getField("y");
//     const z = category.getField("z");

//     const residues: Residue[] = [];
//     for (let i = 0; i < rowCount; i++) {
//         residues.push({
//             Id: ids.str(i),
//             Name: names.str(i),
//             SerialNumber: serials.int(i),
//             X: x.float(i),
//             Y: y.float(i),
//             Z: z.float(i),
//             LayerId: layerIds.str(i),
//             ChannelId: channelIds.str(i),
//         });
//     }
//     return residues;
// }

function parseResidues(category: any): Residue[] {
    const rowCount = category.rowCount;
    const names = category.getField("name");
    const sequenceNumbers = category.getField("sequence_number");
    const chainIds = category.getField("chain_id");

    const residues: Residue[] = [];
    for (let i = 0; i < rowCount; i++) {
        residues.push({
            Id: `${names.str(i)} ${sequenceNumbers.int(i)} ${chainIds.str(i)}`,
            Name: names.str(i),
            SerialNumber: sequenceNumbers.int(i),
            X: 0,
            Y: 0,
            Z: 0,
            LayerId: "",
            ChannelId: "",
        });
    }
    return residues;
}


// function parseLayers(category: any, residues: Residue[]): Layers[] {
//     const rowCount = category.rowCount;
//     const ids = category.getField("id");
//     const channelIds = category.getField("channel_id");
//     const types = category.getField("type");
//     const numbers = category.getField("number");

//     const residuesByLayer: { [layerId: string]: Residue[] } = {};
//     for (const residue of residues) {
//         if (!residuesByLayer[residue.LayerId]) {
//             residuesByLayer[residue.LayerId] = [];
//         }
//         residuesByLayer[residue.LayerId].push(residue);
//     }

//     const layers: Layers[] = [];
//     for (let i = 0; i < rowCount; i++) {
//         const layerId = ids.str(i);
//         layers.push({
//             Id: layerId,
//             Type: types.str(i),
//             Number: numbers.int(i),
//             ChannelId: channelIds.str(i),
//             Residues: residuesByLayer[layerId] || [],
//         });
//     }
//     return layers;
// }

function parseLayers(category: any, residues: Residue[]): Layers[] {
    const rowCount = category.rowCount;
    const ids = category.getField("id");
    const channelIds = category.getField("channel_id");
    const types = category.getField("type");
    const numbers = category.getField("number");

    // Map residues to their layer IDs
    const residuesByLayer: { [layerId: string]: string[] } = {};
    for (const residue of residues) {
        if (!residuesByLayer[residue.LayerId]) {
            residuesByLayer[residue.LayerId] = [];
        }
        residuesByLayer[residue.LayerId].push(residue.Id);
    }

    const layers: Layers[] = [];
    for (let i = 0; i < rowCount; i++) {
        const layerId = ids.str(i);
        layers.push({
            Id: layerId,
            Type: types.str(i),
            Number: numbers.int(i),
            ChannelId: channelIds.str(i),
            Residues: residuesByLayer[layerId] || [],
        });
    }
    return layers;
}

// function linkLayersToChannels(layers: Layers[], channels: Tunnel[]): void {
//     const layersByChannel: { [channelId: string]: Layers[] } = {};
//     for (const layer of layers) {
//         if (!layersByChannel[layer.ChannelId]) {
//             layersByChannel[layer.ChannelId] = [];
//         }
//         layersByChannel[layer.ChannelId].push(layer);
//     }

//     for (const channel of channels) {
//         channel.Layers = layersByChannel[channel.Id] || [];
//     }
// }

function linkLayersToChannels(layers: Layers[], channels: Tunnel[]): void {
    const layersByChannel: { [channelId: string]: Layers[] } = {};
    for (const layer of layers) {
        if (!layersByChannel[layer.ChannelId]) {
            layersByChannel[layer.ChannelId] = [];
        }
        layersByChannel[layer.ChannelId].push(layer);
    }

    for (const channel of channels) {
        channel.Layers = layersByChannel[channel.Id] || [];
    }
}

function parseCifToChannelsDBData(blocks: CifBlock[]): ChannelsDBData {
    const tunnelsBlock = getTunnelsBlock(blocks);
    if (!tunnelsBlock) throw new Error("No tunnels block found.");

    const annotations = parseAnnotations(tunnelsBlock.categories.sb_ncbr_channel_annotation);
    const channels = parseChannels(tunnelsBlock.categories.sb_ncbr_channel);

    const profiles = parseProfiles(tunnelsBlock.categories.sb_ncbr_channel_profile, channels);
    const residues = parseResidues(tunnelsBlock.categories.sb_ncbr_channel_residue);
    const layers = parseLayers(tunnelsBlock.categories.sb_ncbr_channel_layer, residues);

    linkLayersToChannels(layers, channels);

    return {
        Channels: {
            Tunnels: channels,
            MergedPores: [],
            Pores: [],
            Paths: [],
            CSATunnels_MOLE: [],
            CSATunnels_Caver: [],
            ReviewedChannels_MOLE: [],
            ReviewedChannels_Caver: [],
            CofactorTunnels_MOLE: [],
            CofactorTunnels_Caver: [],
            TransmembranePores_MOLE: [],
            TransmembranePores_Caver: [],
            ProcognateTunnels_MOLE: [],
            ProcognateTunnels_Caver: [],
            AlphaFillTunnels_MOLE: [],
            AlphaFillTunnels_Caver: [],
        },
        Annotations: annotations,
    };
}


export async function loadCifTunnels(url: string) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.text();
                const x = await parseCifText(data).run();
                if (!x.isError) {
                    console.log(x.result);
                    const r = parseCifToChannelsDBData(x.result.blocks as any[]);
                    console.log(r);
                    // console.log(x.result.blocks[1].categories.sb_ncbr_channel_residue.getField("name"));
                }
            } else {
                console.error('Fetch failed with status:', response.status);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }