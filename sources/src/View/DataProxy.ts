namespace MoleOnlineWebUI.DataProxy{

    import Service = MoleOnlineWebUI.Service.MoleAPI.ApiService;

    export namespace ComputationInfo{
        import CompInfo = MoleOnlineWebUI.Service.MoleAPI.CompInfo;

        type CompInfoHandler = (compId:string, info:CompInfo)=>void;

        export class DataProvider{
            private static data: Map<string,CompInfo>;
            private static handlers: {
                compId: string,
                handler: CompInfoHandler,
                stayForUpdate: boolean
            }[];
            private static pending: Map<string,boolean>;

            //--

            private static hasPending(compId:string):boolean{
                if(this.pending===void 0){
                    return false;
                }

                let isPending = this.pending.get(compId);
                return (isPending===void 0)?false:isPending;
            }

            private static setPending(compId:string,isPending:boolean){
                if(this.pending===void 0){
                    this.pending = new Map<string,boolean>();
                }
                this.pending.set(compId, isPending);
            }

            private static setData(compId:string, info: CompInfo){
                if(this.data===void 0){
                    this.data = new Map<string,CompInfo>();
                }
                this.data.set(compId, info);
                this.runHandlers(compId, info);
            }

            private static runHandlers(compId:string , info:CompInfo){
                if(this.handlers===void 0){
                    return;
                }

                let hndlrs = this.handlers;
                this.handlers = [];
                for(let h of hndlrs){
                    if(h.compId===compId){
                        h.handler(compId,info);
                    }
                    if(h.stayForUpdate===true||h.compId!==compId){
                        this.handlers.push(h);
                    }
                }
            }

            private static requestData(compId:string){
                if(this.hasPending(compId)){
                    return;
                }
                this.setPending(compId, true);
                Service.getComputationInfoList(compId).then((val)=>{
                    this.setPending(compId, false);
                    console.log(val);
                    this.setData(compId, val);
                }).catch((err)=>{
                    console.log(err);
                    window.setTimeout((()=>{this.requestData(compId)}).bind(this),2000);
                });
            }

            private static attachHandler(compId:string, handler: CompInfoHandler, stayForUpdate:boolean){
                if(this.handlers===void 0){
                    this.handlers = [];
                }

                this.handlers.push(
                    {
                        compId,
                        handler,
                        stayForUpdate
                    }
                );

                this.requestData(compId);
            }

            //--

            public static get(compId:string, handler: CompInfoHandler){
                if(this.data!==void 0){
                    let data = this.data.get(compId);
                    if(data!==void 0){
                        handler(compId, data);
                        return;
                    }
                }

                this.attachHandler(compId, handler, false);
            }

            public static subscribe(compId:string, handler: CompInfoHandler){
                if(this.data!==void 0){
                    let data = this.data.get(compId);
                    if(data!==void 0){
                        handler(compId, data);
                    }
                }

                this.attachHandler(compId, handler, true);
            }
        }
    }
}