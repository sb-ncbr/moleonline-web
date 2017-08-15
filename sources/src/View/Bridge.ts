namespace MoleOnlineWebUI.Bridge{
    export class Instances{
        private static plugin:LiteMol.Plugin.Controller;

        public static setPlugin(plugin:LiteMol.Plugin.Controller){
            this.plugin = plugin;
        }

        public static getPlugin():LiteMol.Plugin.Controller{
            return this.plugin;
        }
    }

    type SimpleHandler = (args?:any)=>any;

    export type NewSubmitHandler = SimpleHandler;
    export type ChangeSubmitIdHandler = (submitId:number)=>void;

    namespace HandlerTypes{
        export const NewSubmitType = "NEW-SUBMIT";
        export const ChangeSubmitIdType = "CHANGE-SUBMIT-ID";
        
        export type NewSubmit = "NEW-SUBMIT";
        export type ChangeSubmitId = "CHANGE-SUBMIT-ID";
    };

    type HandlerType = HandlerTypes.NewSubmit | HandlerTypes.ChangeSubmitId;

    export class Events{
        private static handlers = new Map<HandlerType,SimpleHandler[]>();
     
        public static subscribeNewSubmit(h:NewSubmitHandler){
            let list = this.handlers.get(HandlerTypes.NewSubmitType);
            if(list===void 0){
                list = [];
            }
            list.push(h);
            this.handlers.set(HandlerTypes.NewSubmitType, list);
        }

        public static invokeNewSubmit(){
            let hndlrs = this.handlers.get(HandlerTypes.NewSubmitType);
            if(hndlrs!==void 0){
                for(let h of hndlrs){
                    h();
                }
            }
        }

        public static subscribeChangeSubmitId(h:ChangeSubmitIdHandler){
            let list = this.handlers.get(HandlerTypes.ChangeSubmitIdType);
            if(list===void 0){
                list = [];
            }
            list.push(h);
            this.handlers.set(HandlerTypes.ChangeSubmitIdType, list);
        }

        public static invokeChangeSubmitId(submitId:number){
            let hndlrs = this.handlers.get(HandlerTypes.ChangeSubmitIdType);
            console.log("invoke change submit id");
            console.log(hndlrs);
            console.log(HandlerTypes.ChangeSubmitIdType);
            console.log(this.handlers);
            if(hndlrs!==void 0){
                for(let h of hndlrs){
                    h(submitId);
                }
            }
        }
    }
}