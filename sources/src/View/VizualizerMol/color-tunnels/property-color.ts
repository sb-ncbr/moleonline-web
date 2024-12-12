import { Color } from 'molstar/lib/mol-util/color';
import { ColorPaletteFunctionSettings } from './data-model';
import { LayersInfo } from '../../../DataInterface';
import { RGBColor } from '../../LayerVizualizer/Vizualizer';
import { LayerColors } from '../../CommonUtils/LayerColors';


const DefaultList = 'many-distinct';
export const DefaultColor = Color(0xFAFAFA);
const Description = 'Color tunnel by specific property.';

declare var ChannelDbPlugin: any;

const maxYellow = Color(0xFBFF07); // { r: 251, g: 255, b: 7 };
const middleYellow = Color(0xF0F8BE); // { r: 240, g: 248, b: 190 };
const maxBlue = Color(0x0000FF); // { r: 0, g: 0, b: 255 };
const middleBlue = Color(0xFDFDFF); // { r: 253, g: 253, b: 255 };
const maxRed = Color(0xFF0000); // { r: 255, g: 0, b: 0 };
const middleRed = Color(0xFDFDE1); // { r: 253, g: 253, b: 225 };
const maxWhite = Color(0xFFFFFF); // { r: 255, g: 255, b: 255 };
const middleWhite = Color(0xF0F0F0); // { r: 240, g: 240, b: 240 };
const maxPurple = Color(0x6B096B); // { r: 107, g: 9, b: 107 };
const middlePurple = Color(0xDCBCDC); // { r: 220, g: 188, b: 220 };
const middleBlack = Color(0xB7B7B7); // { r: 183, g: 183, b: 183 };
const maxBlack = Color(0x000000); // { r: 0, g: 0, b: 0 };

const minColorProp = {
    'hydropathy': maxBlue,
    'hydrophobicity': maxBlue,
    'mutability': maxBlue,
    'polarity': maxYellow,
    'charge': maxRed,
    'positive_charge': maxWhite,
    'negative_charge': maxWhite,
    'logP': maxBlue,
    'logD': maxBlue,
    'logS': maxYellow,
    'ionizable': maxWhite,
    'bRadius': maxWhite
};

const minColorMiddleProp = {
    'hydropathy': middleBlue,
    'hydrophobicity': middleBlue,
    'mutability': middleBlue,
    'polarity': middleYellow,
    'charge': middleRed,
    'positive_charge': middleWhite,
    'negative_charge': middleWhite,
    'logP': middleBlue,
    'logD': middleBlue,
    'logS': maxYellow,
    'ionizable': middleWhite,
    'bRadius': middleWhite
};

const maxColorMiddleProp = {
    'hydropathy': middleYellow,
    'hydrophobicity': middleYellow,
    'mutability': middleRed,
    'polarity': middleBlue,
    'charge': middleBlue,
    'positive_charge': middleBlue,
    'negative_charge': middleRed,
    'logP': middleYellow,
    'logD': middleYellow,
    'logS': middleBlue,
    'ionizable': middlePurple,
    'bRadius': middleBlack
};

const maxColorProp = {
    'hydropathy': maxYellow,
    'hydrophobicity': maxYellow,
    'mutability': maxRed,
    'polarity': maxBlue,
    'charge': maxBlue,
    'positive_charge': maxBlue,
    'negative_charge': maxRed,
    'logP': maxYellow,
    'logD': maxYellow,
    'logS': maxBlue,
    'ionizable': maxPurple,
    'bRadius': maxBlack
};

export type Property = 'hydropathy' | 'charge' | 'positive_charge' | 'negative_charge' | 'hydrophobicity' | 'polarity' | 'mutability' | 'logP' | 'logD' | 'logS' | 'ionizable' | 'bRadius';
export type ColorBound = 'absolute' | 'minmax';

function getValue(layer: LayersInfo, property: Property) {
    switch (property) {
        case 'hydropathy':
            return layer.Properties.Hydropathy;
        case 'charge':
            return layer.Properties.Charge;
        case 'positive_charge':
            return layer.Properties.NumPositives;
        case 'negative_charge':
            return layer.Properties.NumNegatives;
        case 'hydrophobicity':
            return layer.Properties.Hydrophobicity;
        case 'polarity':
            return layer.Properties.Polarity;
        case 'mutability':
            return layer.Properties.Mutability;
        case 'logP':
            return layer.Properties.LogP;
        case 'logD':
            return layer.Properties.LogD;
        case 'logS':
            return layer.Properties.LogS;
        case 'ionizable':
            return layer.Properties.Ionizable;
        case 'bRadius':
            return layer.Properties.BRadius;
        default:
            return 0;
    }
}

function getAbsCenterPosition(property: Property) {
    switch (property) {
        case 'hydropathy':
            return 0;
        case 'charge':
            return 0;
        case 'positive_charge':
            return 0;
        case 'negative_charge':
            return 0;
        case 'hydrophobicity':
            return 0;
        case 'polarity':
            return 5;
        case 'mutability':
            return 75;
        case 'logP':
            return 0.78;
        case 'logD':
            return -0.205;
        case 'logS':
            return 0.075;
        case 'ionizable':
            return 0;
        case 'bRadius':
            return 3;
        default:
            return 0;
    }
}

function prepareSettings(property: Property, colorOptions: {
    colorMaxValue: number,
    colorMinValue: number,
    layers: LayersInfo[],
    skipMiddleColors: boolean,
    colorBounds: ColorBound
}): ColorPaletteFunctionSettings | undefined {
    if (colorOptions.layers.length === 0) {
        return;
    }

    let minColoringValue = getValue(colorOptions.layers[0], property);
    let maxColoringValue = getValue(colorOptions.layers[0], property);

    for (let i = 0; i < colorOptions.layers.length; i++) {
        const currentValue = getValue(colorOptions.layers[i], property);
        if (currentValue < minColoringValue) {
            minColoringValue = currentValue;
        }
        if (currentValue > maxColoringValue) {
            maxColoringValue = currentValue;
        }
    }

    return {
        minVal: (colorOptions.colorBounds === 'minmax') ? minColoringValue : colorOptions.colorMinValue,
        maxVal: (colorOptions.colorBounds === 'minmax') ? maxColoringValue : colorOptions.colorMaxValue,
        minColor: minColorProp[property],
        maxColor: maxColorProp[property],
        minColorMiddle: minColorMiddleProp[property],
        maxColorMiddle: maxColorMiddleProp[property],
        skipMiddle: (property === 'positive_charge' || property === 'negative_charge' || property === 'ionizable') ? true : colorOptions.skipMiddleColors,
        centerPosition: getAbsCenterPosition(property),
        centerAbsolute: (property === 'positive_charge' || property === 'negative_charge' || property === 'ionizable') ? false : !(colorOptions.colorBounds === 'minmax')
    };
}

function interpolate(minColor: Color, maxColor: Color, t: number) {
    const minRGB = Color.toRgb(minColor);
    const maxRGB = Color.toRgb(maxColor);

    const r = minRGB[0] + (maxRGB[0] - minRGB[0]) * t;
    const g = minRGB[1] + (maxRGB[1] - minRGB[1]) * t;
    const b = minRGB[2] + (maxRGB[2] - minRGB[2]) * t;

    return Color.fromRgb(r, g, b);
}

function toRGB(color: Color): RGBColor {
    const rgb = Color.toRgb(color);
    return {
        r: rgb[0],
        g: rgb[1],
        b: rgb[2]
    }
}


function getColor(value: number, property: Property, settings: ColorPaletteFunctionSettings | undefined) {
    if (!settings) {
        return DefaultColor;
    }
    const minVal = settings.minVal;
    const maxVal = settings.maxVal;
    const minColor = settings.minColor;
    const maxColor = settings.maxColor;
    const minColorMiddle = settings.minColorMiddle;
    const maxColorMiddle = settings.maxColorMiddle;
    const skipMiddle = settings.skipMiddle;
    const middle = (settings.centerAbsolute) ? settings.centerPosition : (minVal + maxVal) / 2;

    let color: Color;
    let t: number;

    const stopFactor = (value - minVal) / (maxVal - minVal);

    // if (value < (minVal + maxVal) / 2)
    if (value < middle) {
        t = (value - minVal) / (middle - minVal);
        // color = Color.interpolate(minColor, maxColorMiddle, t);
        color = Color.interpolate(minColor, maxColorMiddle, t);
        // color = interpolate(minColor, maxColorMiddle, t * stopFactor);
    } else {
        t = (value - middle) / (maxVal - middle);
        // color = Color.interpolate(minColorMiddle, maxColor, t);
        color = Color.interpolate(minColorMiddle, maxColor, t);
        // color = interpolate(minColorMiddle, maxColor, t * stopFactor);
    }

    if (skipMiddle && settings.centerAbsolute) {
        throw new Error('Cannot config absolute center and skip center at once! Forbidden configuration -> skipMiddle=true && centerAbsolute=true');
    }
    if (skipMiddle && !settings.centerAbsolute) {
        t = (value - minVal) / (maxVal - minVal);
        color = Color.interpolate(minColor, maxColor, t);
        // color = interpolate(minColor, maxColor, t);
    }

    if (minVal === maxVal) {
        color = Color.interpolate(minColor, maxColorMiddle, 0.5);
        // color = interpolate(minColor, maxColorMiddle, 0.5);
    }

    // var rgb: RGBColor;

    // if (value < (minVal + maxVal) / 2) {
    //     rgb = ChannelDbPlugin.Palette.interpolate(minVal, toRGB(minColor), middle, toRGB(maxColorMiddle), value);
    // }
    // else {
    //     rgb = ChannelDbPlugin.Palette.interpolate(middle, toRGB(minColorMiddle), maxVal, toRGB(maxColor), value);
    // }

    // if (skipMiddle && settings.centerAbsolute) {
    //     throw new Error("Cannot config absolute center and skip center at once! Forbidden configuration -> skipMiddle=true && centerAbsolute=true");
    // }
    // if (skipMiddle && !settings.centerAbsolute) {
    //     rgb = ChannelDbPlugin.Palette.interpolate(minVal, toRGB(minColor), maxVal, toRGB(maxColor), value);
    // }

    // if (minVal === maxVal) {
    //     rgb = ChannelDbPlugin.Palette.interpolate(0, toRGB(minColor), 1, toRGB(maxColorMiddle), 0.5);
    // }

    // return Color.fromRgb(rgb.r, rgb.g, rgb.b);
    return color;
}

export function colorTunnel(property: Property, groupId: number,
    colorOptions: {
        colorMaxValue: number,
        colorMinValue: number,
        layers: LayersInfo[],
        skipMiddleColors: boolean,
        colorBounds: ColorBound
    }) {
    if (groupId > 0 && groupId < colorOptions.layers.length) {
        const layer = colorOptions.layers[groupId];
        const settings = prepareSettings(property, colorOptions);
        const prevColorValue = ((groupId - 1) in colorOptions.layers)
            ? getValue(colorOptions.layers[groupId - 1], property)
            : getValue(layer, property);
        const currentColorValue = getValue(layer, property);

        const currLength = layer.LayerGeometry.EndDistance - layer.LayerGeometry.StartDistance;
        const totalLength = colorOptions.layers[colorOptions.layers.length - 1].LayerGeometry.EndDistance - colorOptions.layers[0].LayerGeometry.StartDistance;
        const proportionalValue = (currLength / totalLength) * currentColorValue;
        let currentColorStop = 0;
        let color = getColor(prevColorValue, property, settings);
        if (groupId !== 0) {
            color = getColor(currentColorValue, property, settings);
            currentColorStop = (currLength / totalLength);
        }
        // console.log(Color.toHexStyle(color));
        console.log(`%c Color: ${Color.toRgb(color)}`, `background: ${Color.toHexStyle(color)}`);
        return color;
        // return LayerColors.colorArray[groupId];
    }
    return DefaultColor;
}

export function colorTunnelNew(property: Property, layer: LayersInfo, nextLayer: LayersInfo | undefined, distance: number,
    colorOptions: {
        colorMaxValue: number,
        colorMinValue: number,
        layers: LayersInfo[],
        skipMiddleColors: boolean,
        colorBounds: ColorBound
    }) {
    const settings = prepareSettings(property, colorOptions);
    const currentColorValue = getValue(layer, property);
    const nextColorValue = nextLayer ? getValue(nextLayer, property) : currentColorValue;

    const totalLength = colorOptions.layers[colorOptions.layers.length - 1].LayerGeometry.EndDistance - colorOptions.layers[0].LayerGeometry.StartDistance;
    const canvas = LayerColors.getCanvas();
    if (canvas) {
        let n = distance / totalLength;
        if (n > 1) {
            n = 1;
        }
        const x = Math.floor(n * (canvas.width - 1));
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
            const pixelData = ctx.getImageData(x, 0, 1, 1).data;
            const color = Color.fromRgb(pixelData[0], pixelData[1], pixelData[2]);
            return color;
        }
    }
    return DefaultColor;

    const actualColorValue = nextLayer
        ? ((distance - layer.LayerGeometry.StartDistance) / (layer.LayerGeometry.EndDistance - layer.LayerGeometry.StartDistance)) * (currentColorValue + nextColorValue)
        : currentColorValue;
    const color = getColor(actualColorValue, property, settings);
    return color;
}

export function colorTunnelGradient(property: Property, groupId: number, dist: number,
    colorOptions: {
        colorMaxValue: number,
        colorMinValue: number,
        layers: LayersInfo[],
        skipMiddleColors: boolean,
        colorBounds: ColorBound
    }) {
    if (groupId > 0 && groupId < colorOptions.layers.length) {
        const layer = colorOptions.layers[groupId];
        const settings = prepareSettings(property, colorOptions);
        const prevColorValue = ((groupId - 1) in colorOptions.layers)
            ? getValue(colorOptions.layers[groupId - 1], property)
            : getValue(layer, property);
        const currentColorValue = getValue(layer, property);

        const currLength = layer.LayerGeometry.EndDistance - layer.LayerGeometry.StartDistance;
        const totalLength = colorOptions.layers[colorOptions.layers.length - 1].LayerGeometry.EndDistance - colorOptions.layers[0].LayerGeometry.StartDistance;
        const proportionalValue = (currLength / totalLength) * currentColorValue;
        let currentColorStop = 0;
        let color = getColor(prevColorValue, property, settings);
        if (groupId !== 0) {
            color = getColor(currentColorValue, property, settings);
            currentColorStop = (currLength / totalLength);
        }
        if (currentColorStop < (dist / totalLength)) {
            return Color(0xFFFFFF);
        }
        // console.log(Color.toHexStyle(color));
        console.log(`%c Color: ${Color.toRgb(color)}`, `background: ${Color.toHexStyle(color)}`);
        return color;
        // return LayerColors.colorArray[groupId];
    }
    return DefaultColor;
}

export function getLayerGroupId(dist: number, layers: LayersInfo[]) {
    const length = layers[layers.length - 1].LayerGeometry.EndDistance;
    if (dist === 1) return layers.length - 1;
    for (let i = 0; i < layers.length; i++) {
        if (dist >= (layers[i].LayerGeometry.StartDistance / length) && dist < (layers[i].LayerGeometry.EndDistance / length)) {
            return i;
        }
    }
    return -1;
}

// export function getLayerGroupId(dist: number, layers: LayersInfo[]) {
//     const length = layers[layers.length - 1].LayerGeometry.EndDistance;
//     if (dist === 1) return layers.length - 1;
//     for (let i = 0; i < layers.length; i++) {
//         if (dist >= layers[i].LayerGeometry.StartDistance && dist < layers[i].LayerGeometry.EndDistance) {
//             return i;
//         }
//     }
//     return -1;
// }

export function colorByDistance(property: Property, dist: number,
    colorOptions: {
        colorMaxValue: number,
        colorMinValue: number,
        layers: LayersInfo[],
        skipMiddleColors: boolean,
        colorBounds: ColorBound
    }) {
    const length = colorOptions.layers[colorOptions.layers.length - 1].LayerGeometry.EndDistance;
    if (dist === 1) return colorTunnel(property, colorOptions.layers.length - 1, colorOptions);
    for (let i = 0; i < colorOptions.layers.length; i++) {
        if (dist >= (colorOptions.layers[i].LayerGeometry.StartDistance / length) && dist < (colorOptions.layers[i].LayerGeometry.EndDistance / length)) {
            return colorTunnel(property, i, colorOptions);
        }
    }
    return DefaultColor;
}