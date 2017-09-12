namespace CommonUtils{
    
    declare function $(p:any): any;

    export class Tooltips{

        private static checkedElements: Map<string,string> = new Map<string,string>();

        private static checkLoop(){
            if(this.checkedElements.size>0){
                window.setTimeout(()=>{
                    let finished:string[] = [];
                    this.checkedElements.forEach((val,key,map)=>{
                        if(this.checkElement(key)){
                            finished.push(key);
                            if(Config.CommonOptions.DEBUG_MODE)
                                console.log('tooltip for '+key+' is initialized');
                        }
                    });
                    for(let elementId of finished){
                        if(Config.CommonOptions.DEBUG_MODE)
                            console.log('tooltipInit: removing '+elementId+' from loop');
                        this.checkedElements.delete(elementId);
                    }
                })
            }
        }

        private static checkElement(elementId:string){            
            if($(`#${elementId}`).length===0){
                return false;
            }

            $(`#${elementId}`).tooltip();
            
            return true;
        }

        public static initWhenReady(elementId:string){
            this.checkedElements.set(elementId, elementId);    
            this.checkLoop();
        }

    }
}