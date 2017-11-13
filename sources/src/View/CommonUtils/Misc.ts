namespace CommonUtils.Misc{

    declare function $(p:any): any;

    export function dataURItoBlob(dataURI:string):Blob{
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        var byteString = atob(dataURI.split(',')[1]);
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var dw = new DataView(ab);
        for(var i = 0; i < byteString.length; i++) {
            dw.setUint8(i, byteString.charCodeAt(i));
        }
        // write the ArrayBuffer to a blob, and you're done
        return new Blob([ab], {type: mimeString});
    }

    export function triggerDownload(dataUrl:string, fileName:string){
        let a = document.createElement("a");
        document.body.appendChild(a);
        $(a).css("display","none");
        a.href = dataUrl;
        a.download = fileName;
        a.click();
        setTimeout(function () { return a.remove(); }, 20000);
    }

    export function flattenResiduesArray(residuesArray:MoleOnlineWebUI.Service.MoleAPI.MoleConfigResidue[][]):string{
        let rv = "";
        let idx=0;
        for(let array of residuesArray){
            if(idx>0){
                rv = `${rv}, `;
            }
            rv = `${rv}[${flattenResidues(array)}]`;
            idx++;
        }
        return rv;
    }

    export function flattenResidues(residues:MoleOnlineWebUI.Service.MoleAPI.MoleConfigResidue[]):string{
        let rv = "";
        for(let r of residues){
            if(rv !== ""){
                rv+=", ";
            }
            rv+=`${r.Chain} ${r.SequenceNumber}`;
        }
        return rv;
    }

    export function flattenPoints(pointsArray:CommonUtils.Selection.StringPoint[]):string{
        let rv = "";
        for(let p of pointsArray){
            let group = `[${p.x},${p.y},${p.z}]`;
            
            if(rv.length!==0){
                rv+=",";
            }
            rv+=group;
        }

        return rv;
    }

    export function pointsToString(points: MoleOnlineWebUI.Service.MoleAPI.MoleConfigPoint[]):string{
        let rv = "";
        for(let p of points){
            if(rv!==""){
                rv+=",";
            }
            rv+=`[${p.X},${p.Y},${p.Z}]`;
        }
        return rv;
    }

    export function isMoleJob(data: MoleOnlineWebUI.Service.MoleAPI.Submission){
        if(data.MoleConfig===void 0 || data.MoleConfig===null){
            return false;
        }

        let c = data.MoleConfig;
        return !(c.Cavity===void 0 
            && c.CustomExits === void 0
            && c.Input === void 0
            && c.NonActiveResidues === void 0
            && c.Origin === void 0
            && c.PoresAuto === void 0
            && c.PoresMerged === void 0
            && c.QueryFilter === void 0
            && c.Tunnel === void 0);
    }
}