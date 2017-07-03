namespace LayersVizualizer.Colors{

    export function invertHexContrastGrayscale(hex:string){
        return rgbToHex(invertRGBContrastGrayscale(hexToRGB(hex)));
    }

    export function invertRGBContrastGrayscale(rgb:RGBColor){
        let c = ( rgb.r + rgb.g + rgb.b ) / 3;
        let v = c > 0.5*255 ? c-255/2 : c+255/2;
        return {r:v, g:v, b:v};
    }

    export function invertRGBColor(rgb:RGBColor){
        return hexToRGB(invertHexColor(rgbToHex(rgb)));
    }

    export function invertHexColor(hexTripletColor:string) {
        hexTripletColor = hexTripletColor.substring(1);           // remove #
        let color = parseInt(hexTripletColor, 16);          // convert to integer
        color = 0xFFFFFF ^ color;             // invert three bytes
        let strColor = color.toString(16);           // convert to hex
        strColor = ("000000" + strColor).slice(-6); // pad with leading zeros
        strColor = "#" + strColor;                  // prepend #
        return strColor;
    }

    export function rgbComplement(rgb:RGBColor){
        let temprgb=rgb;
        let temphsv=RGB2HSV(temprgb);
        temphsv.hue=HueShift(temphsv.hue,180.0);
        temprgb=HSV2RGB(temphsv);
        return temprgb;
    }

    export function hexToRGB(hex:string){
        if(hex[0]!=="#"){
            throw new Error("Hex color has bad format!");
        }

        let rgbPart = hex.split("#")[1];
        if(rgbPart.length !== 6){
            throw new Error("Hex color has bad format!");
        }

        let rHex = rgbPart.slice(0,2); 
        let gHex = rgbPart.slice(2,4);
        let bHex = rgbPart.slice(4,6);
        
        return {
            r: parseInt(rHex,16),
            g: parseInt(gHex,16),
            b: parseInt(bHex,16)
        };
    }

    export function Uint8ClampedArrayToRGB(rgbArr:Uint8ClampedArray){
        return {
            r: rgbArr[0],
            g: rgbArr[1],
            b: rgbArr[2]
        }
    }

    export function parseRGBString(rgbString:string){
        let rgbParts = [];
        for(let part of ((rgbString.split('(')[1]).split(")")[0]).split(",")){
            rgbParts.push(parseInt(part.replace(" ","")));
        }

        return {
            r: rgbParts[0],
            g: rgbParts[1],
            b: rgbParts[2]
        };
    }

    export function rgbToHex(rgb:RGBColor){
        
        let rHex = Math.ceil(rgb.r).toString(16);
        let gHex = Math.ceil(rgb.g).toString(16);
        let bHex = Math.ceil(rgb.b).toString(16);

        return `#${((rHex.length==1)?"0":"")+rHex}${((gHex.length==1)?"0":"")+gHex}${((bHex.length==1)?"0":"")+bHex}`;
    }

    export function hexComplement(hex:string){
        return rgbToHex(rgbComplement(hexToRGB(hex)));
    }

    interface HSV{
        hue:number,
        saturation:number,
        value:number
    };
    interface RGBColor{
        r:number,g:number,b:number
    }
    function RGB2HSV(rgb:RGBColor) {
        let hsv = new Object() as HSV;
        let max=max3(rgb.r,rgb.g,rgb.b);
        let dif=max-min3(rgb.r,rgb.g,rgb.b);
        hsv.saturation=(max==0.0)?0:(100*dif/max);
        if (hsv.saturation==0) hsv.hue=0;
        else if (rgb.r==max) hsv.hue=60.0*(rgb.g-rgb.b)/dif;
        else if (rgb.g==max) hsv.hue=120.0+60.0*(rgb.b-rgb.r)/dif;
        else if (rgb.b==max) hsv.hue=240.0+60.0*(rgb.r-rgb.g)/dif;
        if (hsv.hue<0.0) hsv.hue+=360.0;
        hsv.value=Math.round(max*100/255);
        hsv.hue=Math.round(hsv.hue);
        hsv.saturation=Math.round(hsv.saturation);
        return hsv;
    }

    // RGB2HSV and HSV2RGB are based on Color Match Remix [http://color.twysted.net/]
    // which is based on or copied from ColorMatch 5K [http://colormatch.dk/]
    function HSV2RGB(hsv:HSV) {
        var rgb=new Object() as RGBColor;
        if (hsv.saturation==0) {
            rgb.r=rgb.g=rgb.b=Math.round(hsv.value*2.55);
        } else {
            hsv.hue/=60;
            hsv.saturation/=100;
            hsv.value/=100;
            let i=Math.floor(hsv.hue);
            let f=hsv.hue-i;
            let p=hsv.value*(1-hsv.saturation);
            let q=hsv.value*(1-hsv.saturation*f);
            let t=hsv.value*(1-hsv.saturation*(1-f));
            switch(i) {
            case 0: rgb.r=hsv.value; rgb.g=t; rgb.b=p; break;
            case 1: rgb.r=q; rgb.g=hsv.value; rgb.b=p; break;
            case 2: rgb.r=p; rgb.g=hsv.value; rgb.b=t; break;
            case 3: rgb.r=p; rgb.g=q; rgb.b=hsv.value; break;
            case 4: rgb.r=t; rgb.g=p; rgb.b=hsv.value; break;
            default: rgb.r=hsv.value; rgb.g=p; rgb.b=q;
            }
            rgb.r=Math.round(rgb.r*255);
            rgb.g=Math.round(rgb.g*255);
            rgb.b=Math.round(rgb.b*255);
        }
        return rgb;
    }

    //Adding HueShift via Jacob (see comments)
    function HueShift(h:number,s:number) { 
        h+=s; while (h>=360.0) h-=360.0; while (h<0.0) h+=360.0; return h; 
    }

    //min max via Hairgami_Master (see comments)
    function min3(a:number,b:number,c:number) { 
        return (a<b)?((a<c)?a:c):((b<c)?b:c); 
    } 
    function max3(a:number,b:number,c:number) { 
        return (a>b)?((a>c)?a:c):((b>c)?b:c); 
    }
}