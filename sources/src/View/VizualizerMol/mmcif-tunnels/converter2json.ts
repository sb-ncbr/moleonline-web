import { CifBlock, CifCategory } from "molstar/lib/mol-io/reader/cif";
import { parseCifText } from "molstar/lib/mol-io/reader/cif/text/parser";
import { Layers, Tunnel } from "../../../DataInterface";

interface Residue {
    Order: string;
    ChannelId: string;
    Name: string;
    SequenceNumber: number;
    ChainId: string;
    Backbone: boolean;
}

interface Profile {
    Radius: number,
    FreeRadius: number,
    T: number,
    Distance: number,
    X: number,
    Y: number,
    Z: number,
    Charge: number
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
    return blocks.find(block => block.categoryNames.includes("sb_ncbr_channel"));
}

function getAtomSiteBlock(blocks: any[]): any {
    return blocks.find(block => block.categoryNames.includes("atom_site"));
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

function parseAtomSite(category: any): Map<string, { name: string, seq_id: string, chain: string }> {
    const rowCount = category.atom_site.rowCount;
    const names = category.atom_site.getField("auth_comp_id");
    const seqIds = category.atom_site.getField("auth_seq_id");
    const chains = category.atom_site.getField("label_asym_id");

    let residues: Map<string, { name: string, seq_id: string, chain: string }> = new Map();
    for (let i = 0; i < rowCount; i++) {
        let residue = {
            name: names.str(i),
            seq_id: seqIds.str(i),
            chain: chains.str(i)
        }
        const key = `${chains.str(i)}|${seqIds.str(i)}`;
        residues.set(key, residue);
        // residues.set(seqIds.str(i), residue);
    }
    return residues;
}

function parseChannels(category: any, atomSiteResiudes: Map<string, { name: string, seq_id: string, chain: string }>): Tunnel[] {
    const rowCount = category.sb_ncbr_channel.rowCount;
    const ids = category.sb_ncbr_channel.getField("id");
    const types = category.sb_ncbr_channel.getField("type");
    const methods = category.sb_ncbr_channel.getField("method");
    const software = category.sb_ncbr_channel.getField("software");
    const autos = category.sb_ncbr_channel.getField("auto");
    const cavities = category.sb_ncbr_channel.getField("cavity");

    let channels: Map<string, Tunnel> = new Map();
    for (let i = 0; i < rowCount; i++) {
        let channel = {
            Id: ids.str(i),
            Type: types.str(i),
            // Method: methods.str(i),
            // Software: software.str(i),
            Auto: autos.int(i) === 1,
            Cavity: cavities.float(i),
            Profile: [],
            Layers: {
                ResidueFlow: [],
                HetResidues: [],
                LayerWeightedProperties: {
                    Hydrophobicity: 0,
                    Hydropathy: 0,
                    Polarity: 0,
                    Mutability: 0
                },
                LayersInfo: []
            } as Layers,
            GUID: '',
            Properties: {
                Charge: 0,
                NumPositives: 0,
                NumNegatives: 0,
                Hydrophobicity: 0,
                Hydropathy: 0,
                Polarity: 0,
                Mutability: 0,
                Ionizable: 0,
                LogP: 0,
                LogD: 0,
                LogS: 0,
                BRadius: 0
            },
            Caver: software.str(i) === 'Caver'
        }

        channels.set(ids.str(i), channel);
    }

    parseChannelProperties(channels, category.sb_ncbr_channel_props); // ✔️ 
    parseLayerWeightedProperties(channels, category.sb_ncbr_channel_layer_props); // ✖️ missing logP, logD, logS. But have no idea why they put it there.
    parseProfiles(channels, category.sb_ncbr_channel_profile); // ✔️
    const residues = parseChannelResidues(category.sb_ncbr_channel_residue, atomSiteResiudes); // ✔️ 
    const layerResidues = parseLayerResidues(category.sb_ncbr_channel_layer_residue, residues); // ✔️
    parseHetResidues(channels, category.sb_ncbr_channel_het_residue);// ✔️ But they somehow left it in the schema, without any mention.
    parseResidueFlow(channels, category.sb_ncbr_channel_layer, layerResidues); // ✔️ 
    parseLayers(channels, category.sb_ncbr_channel_layer, layerResidues);
    return Array.from(channels.values());
}

function parseLayerWeightedProperties(channels: Map<string, Tunnel>, category: any) {
    const rowCount = category.rowCount;
    const channelIds = category.getField("channel_id");
    const hydropathies = category.getField("hydropathy");
    const hydrophobicities = category.getField("hydrophobicity");
    const mutabilities = category.getField("mutability");
    const polarities = category.getField("polarity");

    for (let i = 0; i < rowCount; i++) {
        let channel = channels.get(channelIds.str(i));
        if (channel) {
            channel.Layers.LayerWeightedProperties = {
                Hydrophobicity: hydrophobicities.float(i),
                Hydropathy: hydropathies.float(i),
                Polarity: polarities.float(i),
                Mutability: mutabilities.float(i),
            }
        }
    }
}

function parseChannelProperties(channels: Map<string, Tunnel>, category: any) {
    const rowCount = category.rowCount;
    const channelIds = category.getField("channel_id");
    const charges = category.getField("charge");
    const hydropathies = category.getField("hydropathy");
    const hydrophobicities = category.getField("hydrophobicity");
    const mutabilities = category.getField("mutability");
    const numNegatives = category.getField("numNegatives");
    const numPositives = category.getField("numPositives");
    const polarities = category.getField("polarity");
    const logD = category.getField("logD");
    const logP = category.getField("logP");
    const logS = category.getField("logS");
    const ionizable = category.getField("ionizable");
    const bRadius = category.getField("bRadius");

    for (let i = 0; i < rowCount; i++) {
        let channel = channels.get(channelIds.str(i));
        if (channel) {
            channel.Properties = {
                Charge: charges.float(i),
                NumPositives: numPositives.float(i),
                NumNegatives: numNegatives.float(i),
                Hydrophobicity: hydrophobicities.float(i),
                Hydropathy: hydropathies.float(i),
                Mutability: mutabilities.float(i),
                Polarity: polarities.float(i),
                Ionizable: ionizable.str(i) === '?' ? 0 : ionizable.float(i),
                LogP: logP.str(i) === '?' ? 0 : logP.float(i),
                LogD: logD.str(i) === '?' ? 0 : logD.float(i),
                LogS: logS.str(i) === '?' ? 0 : logS.float(i),
                BRadius: bRadius.str(i) === '?' ? 0 : bRadius.float(i)

            }
        }
    }
}

function parseProfiles(channels: Map<string, Tunnel>, category: any) {
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
        let channel = channels.get(channelIds.str(i));
        if (channel) {
            channel.Profile.push({
                Radius: radii.float(i),
                FreeRadius: freeRadii.float(i),
                Distance: distances.float(i),
                T: temperatures.float(i),
                X: x.float(i),
                Y: y.float(i),
                Z: z.float(i),
                Charge: charges.int(i),
            })
        }
    }
}

function parseChannelResidues(category: any, resiudes: Map<string, { name: string, seq_id: string, chain: string }>): Map<string, Residue> {
    const rowCount = category.rowCount;
    const channelIds = category.getField("channel_id");
    const orders = category.getField("order");
    const sequenceNumbers = category.getField("sequence_number");
    const chainIds = category.getField("chain_id");
    const backbones = category.getField("backbone");

    const residues: Map<string, Residue> = new Map();

    for (let i = 0; i < rowCount; i++) {
        // const residue = resiudes.get(sequenceNumbers.str(i));
        const key = `${chainIds.str(i)}|${sequenceNumbers.str(i)}`;
        const residue = resiudes.get(key);

        residues.set(orders.str(i), {
            Order: orders.str(i),
            ChannelId: channelIds.str(i),
            Name: residue ? residue.name : '',
            SequenceNumber: sequenceNumbers.int(i),
            ChainId: chainIds.str(i),
            Backbone: backbones.str(i) === 'True',
        });
    }
    return residues;
}

function parseLayerResidues(category: any, channelResidues: Map<string, Residue>): Map<string, { residues: string[], flowIndicies: string[] }> {
    const rowCount = category.rowCount;
    const layerIds = category.getField("layer_id");
    const resiudeIds = category.getField("residue_id");
    const flows = category.getField("order");
    const channelIds = category.getField("channel_id");

    const layerResidues: Map<string, { residues: string[], flowIndicies: string[] }> = new Map();
    let currentLayerId = layerIds.str(0);
    let residues: string[] = [];
    let flowIndicies: string[] = [];

    for (let i = 0; i <= rowCount; i++) {
        if (i >= rowCount) {
            layerResidues.set(currentLayerId, { residues, flowIndicies });
            break;
        } else if (currentLayerId !== layerIds.str(i)) {
            layerResidues.set(currentLayerId, { residues, flowIndicies });
            currentLayerId = layerIds.str(i);
            residues = [];
            flowIndicies = [];
        }
        const r = resiudeIds.str(i);
        const res = channelResidues.get(resiudeIds.str(i));
        if (res) {
            residues.push(`${res.Name} ${res.SequenceNumber} ${res.ChainId}${res.Backbone ? " Backbone" : ""}`);
        }
        flowIndicies.push(flows.str(i));
    }

    return layerResidues;
}

function parseResidueFlow(channels: Map<string, Tunnel>, layersCategory: any, residues: Map<string, {
    residues: string[];
    flowIndicies: string[];
}>) {
    let rowCount = layersCategory.rowCount;
    const ids = layersCategory.getField("order");
    const channelIds = layersCategory.getField("channel_id");

    const residueFlows: Map<string, Set<string>> = new Map();

    for (let i = 0; i < rowCount; i++) {
        const layerId = ids.str(i);
        let layerResidues = residues.get(layerId);
        let channelId = channelIds.str(i);
        if (!residueFlows.get(channelId)) residueFlows.set(channelId, new Set());
        if (layerResidues) {
            const residueFlow = residueFlows.get(channelId);
            if (residueFlow) {
                for (let res of layerResidues.residues) {
                    residueFlow.add(res);
                }
            }
        }
    }

    for (let [id, channel] of channels) {
        const residueFlow = residueFlows.get(id);
        if (residueFlow) {
            channel.Layers.ResidueFlow = Array.from(residueFlow);
        }
    }
}

function parseHetResidues(channels: Map<string, Tunnel>, hetResiduesCategory: any) {
    let rowCount = hetResiduesCategory.rowCount;
    const ids = hetResiduesCategory.getField("id");
    const channelIds = hetResiduesCategory.getField("channel_id");
    const names = hetResiduesCategory.getField("name");
    const seqNumbers = hetResiduesCategory.getField("sequence_number");
    const chainIds = hetResiduesCategory.getField("chain_id");
    const bottleneck = hetResiduesCategory.getField("bottleneck");

    for (let i = 0; i < rowCount; i++) {
        const channel = channels.get(channelIds.str(i));
        if (channel) {
            channel.Layers.HetResidues.push(`${names.str(i)} ${seqNumbers.str(i)} ${chainIds.str(i)}${bottleneck.str(i) === "True" ? " Bottleneck" : ""}`);
        }
    }

}

function parseLayers(channels: Map<string, Tunnel>, layersCategory: any, residues: Map<string, {
    residues: string[];
    flowIndicies: string[];
}>) {
    let rowCount = layersCategory.rowCount;
    const ids = layersCategory.getField("order");
    const channelIds = layersCategory.getField("channel_id");
    const minRadius = layersCategory.getField("min_radius");
    const minFreeRadius = layersCategory.getField("min_free_radius");
    const startDistance = layersCategory.getField("start_distance");
    const endDistance = layersCategory.getField("end_distance");
    const localMinimum = layersCategory.getField("local_minimum");
    const bottleneck = layersCategory.getField("bottleneck");
    const charge = layersCategory.getField("charge");
    const numPositives = layersCategory.getField("numPositives");
    const numNegatives = layersCategory.getField("numNegatives");
    const hydrophobicity = layersCategory.getField("hydrophobicity");
    const hydropathy = layersCategory.getField("hydropathy");
    const polarity = layersCategory.getField("polarity");
    const mutability = layersCategory.getField("mutability");

    const layers: Layers[] = [];
    for (let i = 0; i < rowCount; i++) {
        const layerId = (i + 1).toString();
        let channel = channels.get(channelIds.str(i));
        let layerResidues = residues.get(layerId);
        if (channel) {
            channel.Layers.LayersInfo.push({
                LayerGeometry: {
                    MinRadius: minRadius.float(i),
                    MinBRadius: 0,
                    MinFreeRadius: minFreeRadius.float(i),
                    StartDistance: startDistance.float(i),
                    EndDistance: endDistance.float(i),
                    LocalMinimum: localMinimum.str(i) === "True",
                    Bottleneck: bottleneck.str(i) === "True",
                    bottleneck: bottleneck.str(i) === "True"
                },
                Residues: layerResidues ? layerResidues.residues : [],
                FlowIndices: layerResidues ? layerResidues.flowIndicies : [],
                Properties: {
                    Charge: charge.float(i),
                    NumPositives: numPositives.float(i),
                    NumNegatives: numNegatives.float(i),
                    Hydrophobicity: hydrophobicity.float(i),
                    Hydropathy: hydropathy.float(i),
                    Polarity: polarity.float(i),
                    Mutability: mutability.float(i),
                    Ionizable: 0,
                    LogD: 0,
                    LogP: 0,
                    LogS: 0,
                    BRadius: 0
                }
            })
        }
    }


}

function parseCifToChannelsDBData(blocks: CifBlock[]): ChannelsDBData {
    const tunnelsBlock = getTunnelsBlock(blocks);
    const atomSiteBlock = getAtomSiteBlock(blocks);
    if (!tunnelsBlock) throw new Error("No tunnels block found.");

    const annotations = parseAnnotations(tunnelsBlock.categories.sb_ncbr_channel_annotation);
    const residuesNames = parseAtomSite(atomSiteBlock.categories);
    const channels = parseChannels(tunnelsBlock.categories, residuesNames);

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
                const r = parseCifToChannelsDBData(x.result.blocks as any[]);
                return r;
                // console.log(x.result.blocks[1].categories.sb_ncbr_channel_residue.getField("name"));
            }
        } else {
            console.error('Fetch failed with status:', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}