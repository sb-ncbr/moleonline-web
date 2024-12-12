import { WebGLContext } from "molstar/lib/mol-gl/webgl/context";
import { Color } from "molstar/lib/mol-util/color";
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
import { LayersInfo } from "../../../DataInterface";
import { Property } from "./property-color";

// export const TunnelPropertyColorShapeParams = {
//     webgl: PD.Value<WebGLContext | null>(null),
//     colorTheme: PD.Color(Color(0xff0000)),
//     visual: PD.MappedStatic(
//         'mesh',
//         {
//             mesh: PD.Group({ resolution: PD.Numeric(2) }),
//             spheres: PD.Group({ resolution: PD.Numeric(2) })
//         }
//     ),
//     samplingRate: PD.Numeric(1, { min: 0.05, max: 1, step: 0.05 }),
//     showRadii: PD.Boolean(false),
//     colorInterval: PD.Value<ColorInterval>(new ColorInterval([]), { isHidden: true })
// };

export const TunnelPropertyColorShapeParams = {
    webgl: PD.Value<WebGLContext | null>(null),
    colorTheme: PD.MappedStatic(
        'color', {
        color: PD.Color(Color(0xff0000)),
        colorProperty: PD.Group({
            property: PD.MappedStatic(
                'hydropathy', {
                hydropathy: PD.Group({
                    colorMaxValue: PD.Numeric(4.5),
                    colorMinValue: PD.Numeric(-4.5),
                }),
                charge: PD.Group({
                    colorMaxValue: PD.Numeric(5),
                    colorMinValue: PD.Numeric(-5),
                }),
                positive_charge: PD.Group({
                    colorMaxValue: PD.Numeric(5),
                    colorMinValue: PD.Numeric(0),
                }),
                negative_charge: PD.Group({
                    colorMaxValue: PD.Numeric(5),
                    colorMinValue: PD.Numeric(0),
                }),
                hydrophobicity: PD.Group({
                    colorMaxValue: PD.Numeric(1.81),
                    colorMinValue: PD.Numeric(-1.14),
                }),
                polarity: PD.Group({
                    colorMaxValue: PD.Numeric(52),
                    colorMinValue: PD.Numeric(0),
                }),
                mutability: PD.Group({
                    colorMaxValue: PD.Numeric(117),
                    colorMinValue: PD.Numeric(25),
                }),
                logP: PD.Group({
                    colorMaxValue: PD.Numeric(2.59),
                    colorMinValue: PD.Numeric(-1.03),
                }),
                logD: PD.Group({
                    colorMaxValue: PD.Numeric(2.59),
                    colorMinValue: PD.Numeric(-3),
                }),
                logS: PD.Group({
                    colorMaxValue: PD.Numeric(2.63),
                    colorMinValue: PD.Numeric(-2.48),
                }),
                ionizable: PD.Group({
                    colorMaxValue: PD.Numeric(5),
                    colorMinValue: PD.Numeric(0),
                }),
                bRadius: PD.Group({
                    colorMaxValue: PD.Numeric(6),
                    colorMinValue: PD.Numeric(0),
                }),
            },
            ),
            colorBounds: PD.Select(
                'absolute',
                [
                    ['absolute', 'Absolute'],
                    ['minmax', 'Min/Max']
                ]
            ),
            skipMiddleColors: PD.Boolean(false),
            showLayers: PD.Boolean(false, { hideIf: p => p.showRadii === true })
        })
    }
    ),
    visual: PD.MappedStatic(
        'mesh',
        {
            mesh: PD.Group({ resolution: PD.Numeric(2) }),
            spheres: PD.Group({ resolution: PD.Numeric(2) })
        }
    ),
    samplingRate: PD.Numeric(1, { min: 0.05, max: 1, step: 0.05 }),
    showRadii: PD.Boolean(false),
    layers: PD.Value<LayersInfo[]>([], { isHidden: true }),
};

export function getPropertyProps(property: Property): {name: Property, params: {colorMaxValue: number, colorMinValue: number}} {
    switch (property) {
        case 'hydropathy':
            return { name: 'hydropathy', params: { colorMaxValue: 4.5, colorMinValue: -4.5 } }
        case 'charge':
            return { name: 'charge', params: { colorMaxValue: 5, colorMinValue: -5 } }
        case 'positive_charge':
            return { name: 'positive_charge', params: { colorMaxValue: 5, colorMinValue: 0 } }
        case 'negative_charge':
            return { name: 'negative_charge', params: { colorMaxValue: 5, colorMinValue: 0 } }
        case 'hydrophobicity':
            return { name: 'hydrophobicity', params: { colorMaxValue: 1.81, colorMinValue: -1.14 } }
        case 'polarity':
            return { name: 'polarity', params: { colorMaxValue: 52, colorMinValue: 0 } }
        case 'mutability':
            return { name: 'mutability', params: { colorMaxValue: 117, colorMinValue: 25 } }
        case 'logP':
            return { name: 'logP', params: { colorMaxValue: 2.59, colorMinValue: -1.03 } }
        case 'logD':
            return { name: 'logD', params: { colorMaxValue: 2.59, colorMinValue: -3 } }
        case 'logS':
            return { name: 'logS', params: { colorMaxValue: 2.63, colorMinValue: -2.48 } }
        case 'ionizable':
            return { name: 'ionizable', params: { colorMaxValue: 5, colorMinValue: 0 } }
        case 'bRadius':
            return { name: 'bRadius', params: { colorMaxValue: 6, colorMinValue: 0 } }
        default:
            return { name: 'hydropathy', params: { colorMaxValue: 4.5, colorMinValue: -4.5 } };
    }
}

export interface ColorPaletteFunctionSettings {
    minVal: number,
    maxVal: number,
    minColor: Color,
    maxColor: Color,
    minColorMiddle: Color,
    maxColorMiddle: Color,
    skipMiddle: boolean,
    centerPosition: number,
    centerAbsolute: boolean
};