import { MmcifFormat } from 'molstar/lib/mol-model-formats/structure/mmcif';
import { CustomModelProperty } from 'molstar/lib/mol-model-props/common/custom-model-property';
import { CustomProperty } from 'molstar/lib/mol-model-props/common/custom-property';
import { CustomPropertyDescriptor } from 'molstar/lib/mol-model/custom-property';
import { Model } from 'molstar/lib/mol-model/structure';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
import { Layers, TunnelDB } from 'molstar/lib/extensions/sb-ncbr/tunnels/data-model';

type Annotation = {
    Id: string;
    Name: string;
    Description: string;
    Reference: string;
    ReferenceType: string;
}

type Tunnel = TunnelDB & {
    Software: string,
    Method: string,
}

type Residue = {
    Id: string;
    Name: string;
    SequenceNumber: number;
    ChainId: string;
}

export interface SbNcbrTunnelsData {
    annotations: Annotation[],
    tunnels: Map<string, Tunnel> // Tunnel[],
    params: TunnelsPropertyPrams
}

const TunnelsPropertyParams = {
    tunnelId: PD.Select<string>('0', [['0', '0']]),
};
export type TunnelsPropertyPrams = typeof TunnelsPropertyParams;
const DefaultTunnelsPropertyParams = PD.clone(TunnelsPropertyParams);

function getParams(model: Model) {
    return getData(model).value?.params ?? DefaultTunnelsPropertyParams;
}

const PropertyKey = 'sb-ncbr-tunnels-property-data';

function getData(model: Model): CustomProperty.Data<SbNcbrTunnelsData | undefined> {
    let data: CustomProperty.Data<SbNcbrTunnelsData | undefined>;

    console.log('opaa');

    if (!SbNcbrTunnelsPropertyProvider.isApplicable(model)) {
        data = { value: undefined };
        console.log('if');
    } else {
        console.log('else');
        const annotations = parseAnnotations(model);
        const tunnels = parseChannels(model);

        const options = Array.from(tunnels.entries()).map(
            ([tunnelId, tunnel]) => [tunnelId, `${tunnelId} ${tunnel.Type} (Id: ${tunnel.Id})`] as [string, string]
        );

        const params = {
            tunnelId: PD.Select<string>('0', options)
        };

        data = {
            value: {
                annotations,
                tunnels,
                params,
            }
        };

        console.log(data);
    }

    model._staticPropertyData[PropertyKey] = data;
    return data;
}

function parseAnnotations(model: Model): Annotation[] {
    const annotations: SbNcbrTunnelsData['annotations'] = [];

    const sourceData = model.sourceData as MmcifFormat;
    const rowCount = sourceData.data.frame.categories.sb_ncbr_channel_annotation.rowCount;
    const ids = sourceData.data.frame.categories.sb_ncbr_channel_annotation.getField('id');
    const names = sourceData.data.frame.categories.sb_ncbr_channel_annotation.getField('name');
    const descriptions = sourceData.data.frame.categories.sb_ncbr_channel_annotation.getField('description');
    const references = sourceData.data.frame.categories.sb_ncbr_channel_annotation.getField('reference');
    const referenceTypes = sourceData.data.frame.categories.sb_ncbr_channel_annotation.getField('reference_type');

    if (!ids || !names || !descriptions || !references || !referenceTypes) {
        return annotations;
    }

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

function parseProfiles(channels: Map<string, Tunnel>, category: any) {
    const rowCount = category.rowCount;
    const channelIds = category.getField('channel_id');
    const radii = category.getField('radius');
    const freeRadii = category.getField('free_radius');
    const distances = category.getField('distance');
    const temperatures = category.getField('T');
    const x = category.getField('x');
    const y = category.getField('y');
    const z = category.getField('z');
    const charges = category.getField('charge');

    for (let i = 0; i < rowCount; i++) {
        const channel = channels.get(channelIds.str(i));
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
            });
        }
    }
}

function parseChannelResidues(category: any): Map<string, Residue> {
    const rowCount = category.rowCount;
    const ids = category.getField('id');
    const names = category.getField('name');
    const sequenceNumbers = category.getField('sequence_number');
    const chainIds = category.getField('chain_id');

    const residues: Map<string, Residue> = new Map();

    for (let i = 0; i < rowCount; i++) {
        residues.set(ids.str(i), {
            Id: ids.str(i),
            Name: names.str(i),
            SequenceNumber: sequenceNumbers.int(i),
            ChainId: chainIds.str(i),
        });
    }
    return residues;
}

function parseLayerResidues(category: any, channelResidues: Map<string, Residue>): Map<string, { residues: string[], flowIndicies: string[] }> {
    const rowCount = category.rowCount;
    const layerIds = category.getField('layer_id');
    const resiudeIds = category.getField('residue_id');
    const flows = category.getField('flow');
    const backbones = category.getField('backbone');

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
        const res = channelResidues.get(resiudeIds.str(i));
        if (res) {
            residues.push(`${res.Name} ${res.SequenceNumber} ${res.ChainId}${backbones.str(i) === 'True' ? ' Backbone' : ''}`);
        }
        flowIndicies.push(flows.str(i));
    }

    return layerResidues;
}

function parseHetResidues(channels: Map<string, Tunnel>, hetResiduesCategory: any) {
    const rowCount = hetResiduesCategory.rowCount;
    // const ids = hetResiduesCategory.getField('id');
    const channelIds = hetResiduesCategory.getField('channel_id');
    const names = hetResiduesCategory.getField('name');
    const seqNumbers = hetResiduesCategory.getField('sequence_number');
    const chainIds = hetResiduesCategory.getField('chain_id');
    const bottleneck = hetResiduesCategory.getField('bottleneck');

    for (let i = 0; i < rowCount; i++) {
        const channel = channels.get(channelIds.str(i));
        if (channel) {
            channel.Layers.HetResidues.push(`${names.str(i)} ${seqNumbers.str(i)} ${chainIds.str(i)}${bottleneck.str(i) === 'True' ? ' Bottleneck' : ''}`);
        }
    }

}

function parseResidueFlow(channels: Map<string, Tunnel>, layersCategory: any, residues: Map<string, {
    residues: string[];
    flowIndicies: string[];
}>) {
    const rowCount = layersCategory.rowCount;
    const ids = layersCategory.getField('id');
    const channelIds = layersCategory.getField('channel_id');

    const residueFlows: Map<string, Set<string>> = new Map();

    for (let i = 0; i < rowCount; i++) {
        const layerId = ids.str(i);
        const layerResidues = residues.get(layerId);
        const channelId = channelIds.str(i);
        if (!residueFlows.get(channelId)) residueFlows.set(channelId, new Set());
        if (layerResidues) {
            const residueFlow = residueFlows.get(channelId);
            if (residueFlow) {
                for (const res of layerResidues.residues) {
                    residueFlow.add(res);
                }
            }
        }
    }

    for (const [id, channel] of channels) {
        const residueFlow = residueFlows.get(id);
        if (residueFlow) {
            channel.Layers.ResidueFlow = Array.from(residueFlow);
        }
    }
}

function parseLayers(channels: Map<string, Tunnel>, layersCategory: any, residues: Map<string, {
    residues: string[];
    flowIndicies: string[];
}>) {
    const rowCount = layersCategory.rowCount;
    const ids = layersCategory.getField('id');
    const channelIds = layersCategory.getField('channel_id');
    // const orders = layersCategory.getField("order");
    const minRadius = layersCategory.getField('min_radius');
    const minFreeRadius = layersCategory.getField('min_free_radius');
    const startDistance = layersCategory.getField('start_distance');
    const endDistance = layersCategory.getField('end_distance');
    const localMinimum = layersCategory.getField('local_minimum');
    const bottleneck = layersCategory.getField('bottleneck');
    const charge = layersCategory.getField('charge');
    const numPositives = layersCategory.getField('numPositives');
    const numNegatives = layersCategory.getField('numNegatives');
    const hydrophobicity = layersCategory.getField('hydrophobicity');
    const hydropathy = layersCategory.getField('hydropathy');
    const polarity = layersCategory.getField('polarity');
    const mutability = layersCategory.getField('mutability');

    for (let i = 0; i < rowCount; i++) {
        const layerId = ids.str(i);
        const channel = channels.get(channelIds.str(i));
        const layerResidues = residues.get(layerId);
        if (channel) {
            channel.Layers.LayersInfo.push({
                LayerGeometry: {
                    MinRadius: minRadius.float(i),
                    MinFreeRadius: minFreeRadius.float(i),
                    StartDistance: startDistance.float(i),
                    EndDistance: endDistance.float(i),
                    LocalMinimum: localMinimum.str(i) === 'True',
                    Bottleneck: bottleneck.str(i) === 'True',
                    bottleneck: bottleneck.str(i) === 'True'
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
                }
            });
        }
    }
}

function parseChannels(model: Model): Map<string, Tunnel> {
    const channels: Map<string, Tunnel> = new Map();

    const sourceData = model.sourceData as MmcifFormat;
    const rowCount = sourceData.data.frame.categories.sb_ncbr_channel.rowCount;
    const ids = sourceData.data.frame.categories.sb_ncbr_channel.getField('id');
    const types = sourceData.data.frame.categories.sb_ncbr_channel.getField('type');
    const methods = sourceData.data.frame.categories.sb_ncbr_channel.getField('method');
    const software = sourceData.data.frame.categories.sb_ncbr_channel.getField('software');
    const autos = sourceData.data.frame.categories.sb_ncbr_channel.getField('auto');
    const cavities = sourceData.data.frame.categories.sb_ncbr_channel.getField('cavity');

    if (!ids || !types || !methods || !software || !autos || !cavities) {
        return channels; // []
    }

    for (let i = 0; i < rowCount; i++) {
        const channel = {
            Id: ids.str(i),
            Type: types.str(i),
            Method: methods.str(i),
            Software: software.str(i),
            Auto: autos.int(i) === 1,
            Cavity: cavities.str(i),
            Profile: [],
            Properties: {
                Charge: 0,
                NumPositives: 0,
                NumNegatives: 0,
                Hydrophobicity: 0,
                Hydropathy: 0,
                Polarity: 0,
                Mutability: 0
            },
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
        };

        channels.set(ids.str(i), channel);
    }

    parseProfiles(channels, sourceData.data.frame.categories.sb_ncbr_channel_profile);
    const residues = parseChannelResidues(sourceData.data.frame.categories.sb_ncbr_channel_residue);
    const layerResidues = parseLayerResidues(sourceData.data.frame.categories.sb_ncbr_channel_layer_residue, residues);
    parseHetResidues(channels, sourceData.data.frame.categories.sb_ncbr_channel_het_residue);
    parseResidueFlow(channels, sourceData.data.frame.categories.sb_ncbr_channel_layer, layerResidues);
    parseLayers(channels, sourceData.data.frame.categories.sb_ncbr_channel_layer, layerResidues);
    // return Array.from(channels.values());
    return channels;
}

export function hasTunnelsPropertyProvider(model: Model): boolean {
    if (!model || !MmcifFormat.is(model.sourceData)) return false;
    const { categories } = model.sourceData.data.frame;
    console.log(model.sourceData.data);
    return (
        'sb_ncbr_channel_annotation' in categories &&
        'sb_ncbr_channel' in categories &&
        'sb_ncbr_channel_profile' in categories &&
        'sb_ncbr_channel_residue' in categories &&
        'sb_ncbr_channel_layer_residue' in categories &&
        'sb_ncbr_channel_het_residue' in categories &&
        'sb_ncbr_channel_layer' in categories
    );
}

export const SbNcbrTunnelsPropertyProvider: CustomModelProperty.Provider<
TunnelsPropertyPrams,
SbNcbrTunnelsData | undefined
> = CustomModelProperty.createProvider({
    label: 'SB NCBR Tunnels Property Provider',
    descriptor: CustomPropertyDescriptor({
        name: 'sb-ncbr-tunnels-property-provider',
    }),
    type: 'static',
    defaultParams: DefaultTunnelsPropertyParams,
    getParams: (data: Model) => getParams(data),
    isApplicable: (model: Model) => hasTunnelsPropertyProvider(model),
    obtain: (_ctx: CustomProperty.Context, model: Model) => Promise.resolve(getData(model)),
});