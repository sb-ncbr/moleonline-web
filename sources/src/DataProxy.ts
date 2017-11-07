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

                let hndlrs = [];
                //this.handlers = [];
                for(let h of this.handlers){
                    if(h.compId===compId){
                        h.handler(compId,info);
                    }
                    if(h.stayForUpdate===true||h.compId!==compId){
                        hndlrs.push(h);
                    }
                }
                this.handlers = hndlrs;
            }

            private static requestData(compId:string){
                if(this.hasPending(compId)){
                    return;
                }
                this.setPending(compId, true);
                Service.getComputationInfoList(compId).then((val)=>{
                    this.setPending(compId, false);
                    if(Config.CommonOptions.DEBUG_MODE)
                        console.log(val);
                    this.setData(compId, val);
                }).catch((err)=>{
                    if(Config.CommonOptions.DEBUG_MODE)
                        console.log(err);
                    window.setTimeout((()=>{this.requestData(compId)}).bind(this),100);
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

            public static get(compId:string, handler: CompInfoHandler, onlyFresh?:boolean){
                if(this.data!==void 0 && !onlyFresh){
                    let data = this.data.get(compId);
                    if(data!==void 0){
                        handler(compId, data);
                        return;
                    }
                }

                this.attachHandler(compId, handler, false);
            }

            public static subscribe(compId:string, handler: CompInfoHandler, onlyFresh?:boolean){
                if(this.data!==void 0 && !onlyFresh){
                    let data = this.data.get(compId);
                    if(data!==void 0){
                        handler(compId, data);
                    }
                }

                this.attachHandler(compId, handler, true);
            }
        }
    }

    export namespace JobStatus{
        export type OnStatusChangeHandler = (status:Service.MoleAPI.InitResponse)=>void;
        export type OnErrHandler = (err:any)=>void;
        export class Watcher{
            private static handlers:Map<String,OnStatusChangeHandler[]>
            private static errHandlers: Map<String,OnErrHandler[]>            
            private static makeHash(computationId:string, submitId:number){
                return `${computationId}:${computationId}`;
            }

            private static registerErrHandler(computationId:string, submitId:number, handler:OnErrHandler){
                if(this.errHandlers===void 0){
                    this.errHandlers = new Map<string,OnErrHandler[]>();
                }
                let key = this.makeHash(computationId,submitId);
                let handlers = this.errHandlers.get(key);

                if(handlers===void 0){
                    handlers = [];                    
                }

                handlers.push(
                    handler
                );
                this.errHandlers.set(key,handlers);
            }

            public static registerOnChangeHandler(computationId:string, submitId:number, handler:OnStatusChangeHandler, onErr:OnErrHandler){
                if(this.handlers===void 0){
                    this.handlers = new Map<string,OnStatusChangeHandler[]>();
                }
                let key = this.makeHash(computationId,submitId);
                let handlers = this.handlers.get(key);
                let shouldStartLoop = false;
                if(handlers===void 0){
                    handlers = [];
                    shouldStartLoop=true;
                }

                handlers.push(
                    handler
                );
                this.handlers.set(key,handlers);

                this.registerErrHandler(computationId,submitId,onErr);

                if(shouldStartLoop){
                    this.waitForResult(computationId,submitId);
                }
            }

            private static notifyStatusUpdate(computationId:string, submitId:number, status:Service.MoleAPI.InitResponse){
                let handlers = this.handlers.get(this.makeHash(computationId,submitId));
                if(handlers===void 0){
                    return;
                }

                for(let h of handlers){
                    h(status);
                }
            }

            private static removeHandlers(computationId:string, submitId:number){
                let key = this.makeHash(computationId,submitId);
                this.handlers.delete(key);
                this.errHandlers.delete(key);
            }

            private static waitForResult(computationId:string, submitId:number){
                Service.getStatus(computationId,submitId).then((state)=>{
                    if(Config.CommonOptions.DEBUG_MODE)
                        console.log(state);                   
                    /*
                    "Initializing"| OK
                    "Initialized"| OK
                    "FailedInitialization"| OK
                    "Running"| OK
                    "Finished"| OK
                    "Error"| OK
                    "Deleted"| OK
                    "Aborted"; OK
                    */
                    switch(state.Status){
                        case "Initializing":
                        case "Running":
                            this.notifyStatusUpdate(computationId,submitId,state);
                            window.setTimeout(()=>{this.waitForResult(computationId,submitId);},1000);
                            break;
                        case "Initialized":
                        case "FailedInitialization":
                        case "Error":
                        case "Deleted":
                        case "Aborted":
                        case "Finished":
                            this.notifyStatusUpdate(computationId,submitId,state);
                            this.removeHandlers(computationId,submitId);    
                            break;
                    }
                })
                .catch((err)=>{
                    let h = this.errHandlers.get(this.makeHash(computationId,submitId));
                    if(h===void 0){
                        throw new Error(err);
                    }

                    for(let handler of h){
                        handler(err);
                    }
                });
            }
        }
    }

    export namespace CSAResidues{
        import CSAResidues = MoleOnlineWebUI.Service.MoleAPI.CSAResidues;

        type CSAResiduesHandler = (compId:string, info:CSAResidues)=>void;

        export class DataProvider{
            private static data: Map<string,CSAResidues>;
            private static handlers: {
                compId: string,
                handler: CSAResiduesHandler,
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

            private static setData(compId:string, info: CSAResidues){
                if(this.data===void 0){
                    this.data = new Map<string,CSAResidues>();
                }
                this.data.set(compId, info);
                this.runHandlers(compId, info);
            }

            private static runHandlers(compId:string , info:CSAResidues){
                if(this.handlers===void 0){
                    return;
                }

                let hndlrs = [];
                //this.handlers = [];
                for(let h of this.handlers){
                    if(h.compId===compId){
                        h.handler(compId,info);
                    }
                    if(h.stayForUpdate===true||h.compId!==compId){
                        hndlrs.push(h);
                    }
                }
                this.handlers = hndlrs;
            }

            private static requestData(compId:string){
                if(this.hasPending(compId)){
                    return;
                }
                this.setPending(compId, true);
                Service.getCSAResidues(compId).then((val)=>{
                    this.setPending(compId, false);
                    if(Config.CommonOptions.DEBUG_MODE)
                        console.log(val);
                    this.setData(compId, val);
                }).catch((err)=>{
                    if(Config.CommonOptions.DEBUG_MODE)
                        console.log(err);
                    window.setTimeout((()=>{this.requestData(compId)}).bind(this),100);
                });
            }

            private static attachHandler(compId:string, handler: CSAResiduesHandler, stayForUpdate:boolean){
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

            public static get(compId:string, handler: CSAResiduesHandler, onlyFresh?:boolean){
                if(this.data!==void 0 && !onlyFresh){
                    let data = this.data.get(compId);
                    if(data!==void 0){
                        handler(compId, data);
                        return;
                    }
                }

                this.attachHandler(compId, handler, false);
            }

            public static subscribe(compId:string, handler: CSAResiduesHandler, onlyFresh?:boolean){
                if(this.data!==void 0 && !onlyFresh){
                    let data = this.data.get(compId);
                    if(data!==void 0){
                        handler(compId, data);
                    }
                }

                this.attachHandler(compId, handler, true);
            }
        }
    }

    export namespace Cofactors{
        import Cofactors = MoleOnlineWebUI.Service.MoleAPI.Cofactors;

        type CofactorsHandler = (info:Cofactors)=>void;

        export class DataProvider{
            private static data: Cofactors;
            private static handlers: {
                handler: CofactorsHandler,
            }[];
            private static pending: boolean;

            //--

            private static hasPending():boolean{
                if(this.pending===void 0){
                    return false;
                }

                return this.pending;
            }

            private static setPending(isPending:boolean){
                this.pending = isPending;
            }

            private static setData(info: Cofactors){
                this.data = info;
                this.runHandlers(info);
            }

            private static runHandlers(info:Cofactors){
                if(this.handlers===void 0){
                    return;
                }

                //this.handlers = [];
                for(let h of this.handlers){
                    h.handler(info);
                }
                this.handlers = [];
            }

            private static requestData(){
                if(this.hasPending()){
                    return;
                }
                this.setPending(true);
                Service.getCofactors().then((val)=>{
                    this.setPending(false);
                    if(Config.CommonOptions.DEBUG_MODE)
                        console.log(val);
                    this.setData(val);
                }).catch((err)=>{
                    if(Config.CommonOptions.DEBUG_MODE)
                        console.log(err);
                    window.setTimeout((()=>{this.requestData()}).bind(this),100);
                });
            }

            private static attachHandler(handler: CofactorsHandler){
                if(this.handlers===void 0){
                    this.handlers = [];
                }

                this.handlers.push(
                    {
                        handler
                    }
                );

                this.requestData();
            }

            //--

            public static get(handler: CofactorsHandler, onlyFresh?:boolean){
                if(this.data!==void 0 && !onlyFresh){
                    let data = this.data;
                    if(data!==void 0){
                        handler(data);
                        return;
                    }
                }

                this.attachHandler(handler);
            }

            public static hasData(){
                return this.data!==void 0;
            }
        }
    }
}