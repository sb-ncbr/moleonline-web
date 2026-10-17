import { OrderedSet } from "molstar/lib/mol-data/int";
import { Context } from "../Context";
import { ColorBound, Property } from "../VizualizerMol/color-tunnels/property-color";
import { Representation } from "molstar/lib/mol-repr/representation";
import { Loci } from "molstar/lib/mol-model/loci";
import { Tunnel, TunnelMetaInfo } from "../../DataInterface";
import { SelectionHelper } from "./Selection";
import { Handlers } from "./Handlers";

export class LayerColors {
    private static currentSelectedLayer: number = -1;
    private static selectChannelLiningResidues: boolean = false;
    private static currentCanvas: HTMLCanvasElement | undefined = undefined;

    // attach… returns a function that detaches the handler again
    private static onColorPropertyChanged = new Handlers<[Property]>();
    private static onColorBoundsChanged = new Handlers<[ColorBound]>();
    private static onLayerIndexOver = new Handlers<[number]>();
    private static onLayerIndexOverObject = new Handlers<[number, string]>();
    private static onLayerIndexSelect = new Handlers<[number]>();
    private static onLayerIndexSelectObject = new Handlers<[number, Representation.Loci<Loci>]>();
    private static onChannelRemoved = new Handlers<[string]>();
    private static onChannelAdd = new Handlers<[string]>();

    public static setSelectChannelLiningResidues(value: boolean) {
        this.selectChannelLiningResidues = value;
    }

    public static getSelectChannelLiningResidues() {
        return this.selectChannelLiningResidues;
    }

    public static setCanvas(value: HTMLCanvasElement | undefined) {
        this.currentCanvas = value;
    }

    public static getCanvas() {
        return this.currentCanvas;
    }

    public static attachOnColorPropertyChagned(handler: (property: Property) => void) { return this.onColorPropertyChanged.attach(handler); }
    public static invokeOnColorPropertyChagned(property: Property | undefined) {
        if (property) {
            this.onColorPropertyChanged.invoke(property);
        }
    }

    public static attachLayerIndexOver(handler: (layerIndex: number) => void) { return this.onLayerIndexOver.attach(handler); }
    public static invokeLayerIndexOver(layerIndex: number) { this.onLayerIndexOver.invoke(layerIndex); }

    public static attachLayerIndexOverObject(handler: (layerIndex: number, tunnelId: string) => void) { return this.onLayerIndexOverObject.attach(handler); }
    public static invokeLayerIndexOverObject(layerIndex: number, tunnelId: string) { this.onLayerIndexOverObject.invoke(layerIndex, tunnelId); }

    public static attachLayerIndexSelect(handler: (layerIndex: number) => void) { return this.onLayerIndexSelect.attach(handler); }
    public static invokeLayerIndexSelect(layerIndex: number) {
        this.currentSelectedLayer = layerIndex;
        this.onLayerIndexSelect.invoke(layerIndex);
    }

    public static attachLayerIndexSelectObject(handler: (layerIndex: number, loci: Representation.Loci<Loci>) => void) { return this.onLayerIndexSelectObject.attach(handler); }
    public static invokeLayerIndexSelectObject(layerIndex: number, loci: Representation.Loci<Loci>) {
        this.currentSelectedLayer = layerIndex;
        this.onLayerIndexSelectObject.invoke(layerIndex, loci);
    }

    public static attachOnColorBoundsChanged(handler: (bounds: ColorBound) => void) { return this.onColorBoundsChanged.attach(handler); }
    public static invokeOnColorBoundsChanged(bounds: ColorBound) { this.onColorBoundsChanged.invoke(bounds); }

    public static attachOnChannelRemoved(handler: (ref: string) => void) { return this.onChannelRemoved.attach(handler); }
    public static invokeOnChannelRemoved(ref: string) { this.onChannelRemoved.invoke(ref); }

    public static attachOnChannelAdd(handler: (ref: string) => void) { return this.onChannelAdd.attach(handler); }
    public static invokeOnChannelAdd(ref: string) { this.onChannelAdd.invoke(ref); }

    public static toProperty(property: string): Property | undefined {
        switch (property) {
            case 'Charge':
                return 'charge';
            case 'Ionizable':
                return 'ionizable';
            case 'NumPositives':
                return 'positive_charge';
            case 'NumNegatives':
                return 'negative_charge';
            case 'Hydrophobicity':
                return 'hydrophobicity';
            case 'Hydropathy':
                return 'hydropathy';
            case 'Polarity':
                return 'polarity';
            case 'LogP':
                return 'logP';
            case 'LogD':
                return 'logD';
            case 'LogS':
                return 'logS';
            case 'Mutability':
                return 'mutability';
            case 'BRadius':
                return 'bRadius';
            default:
                return;
        }
    }

    public static attachLayerColorsHandlerToEventHandler(context: Context) {
        const plugin = context.plugin;
        plugin.behaviors.interaction.hover.subscribe(({ current, button, modifiers, position }) => {
            if (current.loci.kind === 'group-loci') {
                if (current.repr && current.repr.params && typeof current.repr.params.tag === 'string' && current.repr.params.tag === "PropertyColorTunnel" && current.repr.params.tunnel !== null) {
                    const ids = OrderedSet.toArray(current.loci.groups[0].ids);
                    LayerColors.invokeLayerIndexOverObject(ids[0], (current.repr.params.tunnel as unknown as Tunnel).Id);
                }
            } else {
            }
        })

        plugin.behaviors.interaction.click.subscribe(({ current, button, modifiers, position }) => {
            if (current.loci.kind === 'group-loci') {
                if (current.repr && current.repr.params && typeof current.repr.params.tag === 'string' && current.repr.params.tag === "PropertyColorTunnel" && current.repr.params.tunnel !== null) {
                    const tunnel = current.repr.params.tunnel as unknown as (Tunnel & TunnelMetaInfo);
                    const ids = OrderedSet.toArray(current.loci.groups[0].ids);
                    if (SelectionHelper.getSelectedChannelId() !== tunnel.Id) {
                        SelectionHelper.selectTunnel(tunnel);
                    } else {
                        if (this.currentSelectedLayer === ids[0]) {
                            LayerColors.invokeLayerIndexSelectObject(-1, current);
                        } else {
                            this.currentSelectedLayer = ids[0];
                            LayerColors.invokeLayerIndexSelectObject(ids[0], current);
                        }
                    }
                } else {
                }
            }
        })
    }
}