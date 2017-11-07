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
}