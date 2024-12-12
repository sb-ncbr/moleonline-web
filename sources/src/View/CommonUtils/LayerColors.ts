import { OrderedSet } from "molstar/lib/mol-data/int";
import { Context } from "../Context";
import { ColorBound, Property } from "../VizualizerMol/color-tunnels/property-color";
import { MarkerAction } from "molstar/lib/mol-util/marker-action";
import { Representation } from "molstar/lib/mol-repr/representation";
import { Loci } from "molstar/lib/mol-model/loci";
import { Color } from "molstar/lib/mol-util/color";

export class LayerColors {
    private static currentColorProperty: Property = 'hydropathy';
    private static currentColorBounds: ColorBound = 'absolute';
    private static currentLayerIndex: number;
    private static currentSelectedLayer: number = -1;
    private static selectChannelLiningResidues: boolean = false;
    private static currentCanvas: HTMLCanvasElement | undefined = undefined;

    public static colorArray: Color[] = [];

    private static onColorPropertyChanged: { handler: (property: Property) => void }[];
    private static onColorBoundsChanged: { handler: (bounds: ColorBound) => void }[];
    private static onLayerIndexOver: { handler: (layerIndex: number) => void }[];
    private static onLayerIndexOverObject: { handler: (layerIndex: number) => void }[];
    private static onLayerIndexSelect: { handler: (layerIndex: number) => void }[];
    private static onLayerIndexSelectObject: { handler: (layerIndex: number, loci: Representation.Loci<Loci>) => void }[];
    private static onChannelRemoved: { handler: (ref: string) => void }[];
    private static onChannelAdd: { handler: (ref: string) => void }[];

    public static getCurrentProperty(): Property {
        return this.currentColorProperty;
    }

    public static getCurrentColorBounds(): ColorBound {
        return this.currentColorBounds;
    }

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

    public static attachOnColorPropertyChagned(handler: (property: Property) => void) {
        if (this.onColorPropertyChanged === void 0) {
            this.onColorPropertyChanged = [];
        }

        this.onColorPropertyChanged.push({ handler });
    }
    public static invokeOnColorPropertyChagned(property: Property | undefined) {
        if (property) {
            this.currentColorProperty = property;
            if (this.onColorPropertyChanged === void 0) {
                return;
            }
    
            for (let h of this.onColorPropertyChanged) {
                h.handler(property);
            }
        }
    }

    public static attachLayerIndexOver(handler: (layerIndex: number) => void) {
        if (this.onLayerIndexOver === void 0) {
            this.onLayerIndexOver = [];
        }

        this.onLayerIndexOver.push({ handler });
    }
    public static invokeLayerIndexOver(layerIndex: number) {
        this.currentLayerIndex = layerIndex;
        if (this.onLayerIndexOver === void 0) {
            return;
        }

        for (let h of this.onLayerIndexOver) {
            h.handler(layerIndex);
        }
    }

    public static attachLayerIndexOverObject(handler: (layerIndex: number) => void) {
        if (this.onLayerIndexOverObject === void 0) {
            this.onLayerIndexOverObject = [];
        }

        this.onLayerIndexOverObject.push({ handler });
    }
    public static invokeLayerIndexOverObject(layerIndex: number) {
        this.currentLayerIndex = layerIndex;
        if (this.onLayerIndexOverObject === void 0) {
            return;
        }

        for (let h of this.onLayerIndexOverObject) {
            h.handler(layerIndex);
        }
    }

    public static attachLayerIndexSelect(handler: (layerIndex: number) => void) {
        if (this.onLayerIndexSelect === void 0) {
            this.onLayerIndexSelect = [];
        }

        this.onLayerIndexSelect.push({ handler });
    }
    public static invokeLayerIndexSelect(layerIndex: number) {
        this.currentSelectedLayer = layerIndex;
        if (this.onLayerIndexSelect === void 0) {
            return;
        }

        for (let h of this.onLayerIndexSelect) {
            h.handler(layerIndex);
        }
    }

    public static attachLayerIndexSelectObject(handler: (layerIndex: number, loci: Representation.Loci<Loci>) => void) {
        if (this.onLayerIndexSelectObject === void 0) {
            this.onLayerIndexSelectObject = [];
        }

        this.onLayerIndexSelectObject.push({ handler });
    }
    public static invokeLayerIndexSelectObject(layerIndex: number, loci: Representation.Loci<Loci>) {
        this.currentSelectedLayer = layerIndex;
        if (this.onLayerIndexSelectObject === void 0) {
            return;
        }

        for (let h of this.onLayerIndexSelectObject) {
            h.handler(layerIndex, loci);
        }
    }

    public static attachOnColorBoundsChanged(handler: (bounds: ColorBound) => void) {
        if (this.onColorBoundsChanged === void 0) {
            this.onColorBoundsChanged = [];
        }

        this.onColorBoundsChanged.push({ handler });
    }
    public static invokeOnColorBoundsChanged(bounds: ColorBound) {
        this.currentColorBounds = bounds;
        if (this.onColorBoundsChanged === void 0) {
            return;
        }

        for (let h of this.onColorBoundsChanged) {
            h.handler(bounds);
        }
    }

    public static attachOnChannelRemoved(handler: (ref: string) => void) {
        if (this.onChannelRemoved === void 0) {
            this.onChannelRemoved = [];
        }

        this.onChannelRemoved.push({ handler });
    }
    public static invokeOnChannelRemoved(ref: string) {
        if (this.onChannelRemoved === void 0) {
            return;
        }

        for (let h of this.onChannelRemoved) {
            h.handler(ref);
        }
    }

    public static attachOnChannelAdd(handler: (ref: string) => void) {
        if (this.onChannelAdd === void 0) {
            this.onChannelAdd = [];
        }

        this.onChannelAdd.push({ handler });
    }
    public static invokeOnChannelAdd(ref: string) {
        if (this.onChannelAdd === void 0) {
            return;
        }

        for (let h of this.onChannelAdd) {
            h.handler(ref);
        }
    }


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
                    LayerColors.invokeLayerIndexOverObject(ids[0]);
                }
            } else {
                // LayerColors.invokeLayerIndexOver(-1);
            }
        })

        plugin.behaviors.interaction.click.subscribe(({ current, button, modifiers, position }) => {
            if (current.loci.kind === 'group-loci') {
                if (current.repr && current.repr.params && typeof current.repr.params.tag === 'string' && current.repr.params.tag === "PropertyColorTunnel" && current.repr.params.tunnel !== null) {
                    const loci = current.loci;
                    const ids = OrderedSet.toArray(current.loci.groups[0].ids);
                    if (this.currentSelectedLayer === ids[0]) {
                        LayerColors.invokeLayerIndexSelectObject(-1, current);
                    } else {
                        this.currentSelectedLayer = ids[0];
                        LayerColors.invokeLayerIndexSelectObject(ids[0], current);
                    }
                } else {
                    // LayerColors.invokeLayerIndexOver(-1);
                }
            }
        })
    }
}