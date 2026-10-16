export function invertHexContrastGrayscale(hex: string) {
    return rgbToHex(invertRGBContrastGrayscale(hexToRGB(hex)));
}

export function invertRGBContrastGrayscale(rgb: RGBColor) {
    let c = (rgb.r + rgb.g + rgb.b) / 3;
    let v = c > 0.5 * 255 ? c - 255 / 2 : c + 255 / 2;
    return { r: v, g: v, b: v };
}

export function hexToRGB(hex: string) {
    if (hex[0] !== "#") {
        throw new Error("Hex color has bad format!");
    }

    let rgbPart = hex.split("#")[1];
    if (rgbPart.length !== 6) {
        throw new Error("Hex color has bad format!");
    }

    let rHex = rgbPart.slice(0, 2);
    let gHex = rgbPart.slice(2, 4);
    let bHex = rgbPart.slice(4, 6);

    return {
        r: parseInt(rHex, 16),
        g: parseInt(gHex, 16),
        b: parseInt(bHex, 16)
    };
}

export function Uint8ClampedArrayToRGB(rgbArr: Uint8ClampedArray) {
    return {
        r: rgbArr[0],
        g: rgbArr[1],
        b: rgbArr[2]
    }
}

export function rgbToHex(rgb: RGBColor) {

    let rHex = Math.ceil(rgb.r).toString(16);
    let gHex = Math.ceil(rgb.g).toString(16);
    let bHex = Math.ceil(rgb.b).toString(16);

    return `#${((rHex.length == 1) ? "0" : "") + rHex}${((gHex.length == 1) ? "0" : "") + gHex}${((bHex.length == 1) ? "0" : "") + bHex}`;
}

export interface RGBColor {
    r: number, g: number, b: number
}
