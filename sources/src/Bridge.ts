namespace MoleOnlineWebUI.Bridge{
    export class Instances{
        private static plugin:LiteMol.Plugin.Controller;
        private static layerVizualizer:any;

        public static setPlugin(plugin:LiteMol.Plugin.Controller){
            this.plugin = plugin;
        }

        public static getPlugin():LiteMol.Plugin.Controller{
            return this.plugin;
        }

        public static setLayersVizualizer(instance:any){
            this.layerVizualizer = instance;
        }

        public static getLayersVizualizer():any{
            return this.layerVizualizer;
        }
    }
    
    export type MessageType = "Success" | "Info" | "Warning" | "Danger";
    export interface MessageInfo{message:string, messageType:MessageType};
    export interface ToggleLoadingScreenParams{message:string,visible:boolean};
    export interface CopyParametersParams{
        moleConfig:MoleOnlineWebUI.Service.MoleAPI.MoleConfig|null,
        poresConfig:MoleOnlineWebUI.Service.MoleAPI.PoresConfig|null,
        mode:"pores"|"mole"
    };

    type SimpleHandler = (args?:any)=>any;

    export type NewSubmitHandler = SimpleHandler;
    export type ChangeSubmitIdHandler = (submitId:number)=>void;
    export type ChannelSelectHandler = (channelId:number)=>void;
    export type ChangeHasKillableHandler = (hasKillable:boolean)=>void;
    export type NotifyMessageHandler = (e:MessageInfo)=>void;
    export type ChannelDataLoadedHandler = (data:DataInterface.MoleData|DataInterface.ChannelsDBData)=>void;
    export type ProteinDataLoadedHandler = (data:DataInterface.ProteinData)=>void;
    export type ToggleLoadingScreenHandler = (params:ToggleLoadingScreenParams)=>void;
    export type RunPDFReportHandler = ()=>void;
    export type CopyParametersHandler = (params:CopyParametersParams)=>void;

    namespace HandlerTypes{
        export const NewSubmitType = "NEW-SUBMIT";
        export const ChangeSubmitIdType = "CHANGE-SUBMIT-ID";
        export const ChannelSelectType = "CHANNEL-SELECT";
        export const ChangeHasKillableType = "CHANGE-HAS-KILLABLE";
        export const NotifyMessageType = "NOTIFY-MESSAGE";
        export const ChannelDataLoadedType = "CHANNEL-DATA-LOADED";
        export const ProteinDataLoadedType = "PROTEIN-DATA-LOADED";
        export const ToggleLoadingScreenType = "TOGGLE-LOADING-SCREEN";
        export const RunPDFReportType = "RUN-PDF-REPORT";
        export const CopyParametersType = "COPY-PARAMETERS";
        export const OnReSubmitType = "ON-RESUBMIT";
        
        export type NewSubmit = "NEW-SUBMIT";
        export type ChangeSubmitId = "CHANGE-SUBMIT-ID";
        export type ChannelSelect = "CHANNEL-SELECT";
        export type ChangeHasKillable = "CHANGE-HAS-KILLABLE";
        export type NotifyMessage = "NOTIFY-MESSAGE";
        export type ChannelDataLoaded = "CHANNEL-DATA-LOADED";
        export type ProteinDataLoaded = "PROTEIN-DATA-LOADED";
        export type ToggleLoadingScreen = "TOGGLE-LOADING-SCREEN";
        export type RunPDFReport = "RUN-PDF-REPORT";
        export type CopyParameters = "COPY-PARAMETERS";
        export type OnReSubmit = "ON-RESUBMIT";
    };

    type HandlerType = HandlerTypes.NewSubmit 
    | HandlerTypes.ChangeSubmitId 
    | HandlerTypes.ChannelSelect 
    | HandlerTypes.ChangeHasKillable 
    | HandlerTypes.NotifyMessage 
    | HandlerTypes.ChannelDataLoaded 
    | HandlerTypes.ProteinDataLoaded 
    | HandlerTypes.ToggleLoadingScreen
    | HandlerTypes.RunPDFReport
    | HandlerTypes.CopyParameters
    | HandlerTypes.OnReSubmit;

    export class Events{
        private static handlers = new Map<HandlerType,SimpleHandler[]>();
     
        public static subscribeChannelSelect(handler:ChannelSelectHandler){
            let hndlrs = this.handlers.get(HandlerTypes.ChannelSelectType);
            if(hndlrs===void 0){
                hndlrs = [];
            }
            hndlrs.push(handler);
            this.handlers.set(HandlerTypes.ChannelSelectType,hndlrs);
        }

        public static invokeChannelSelect(channelId:string){
            let hndlrs = this.handlers.get(HandlerTypes.ChannelSelectType);
            if(hndlrs === void 0){
                return;
            }
            
            for(let h of hndlrs){
                h(channelId);
            }
        }

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
            if(hndlrs!==void 0){
                for(let h of hndlrs){
                    h(submitId);
                }
            }
        }

        public static subscribeChangeHasKillable(h:ChangeHasKillableHandler){
            let list = this.handlers.get(HandlerTypes.ChangeHasKillableType);
            if(list===void 0){
                list = [];
            }
            list.push(h);
            this.handlers.set(HandlerTypes.ChangeHasKillableType, list);
        }

        public static invokeChangeHasKillable(hasKillable:boolean){
            let hndlrs = this.handlers.get(HandlerTypes.ChangeHasKillableType);
            if(hndlrs!==void 0){
                for(let h of hndlrs){
                    h(hasKillable);
                }
            }
        }
        
        public static subscribeNotifyMessage(h:NotifyMessageHandler){
            let list = this.handlers.get(HandlerTypes.NotifyMessageType);
            if(list===void 0){
                list = [];
            }
            list.push(h);
            this.handlers.set(HandlerTypes.NotifyMessageType, list);
        }

        public static invokeNotifyMessage(e:MessageInfo){
            let hndlrs = this.handlers.get(HandlerTypes.NotifyMessageType);
            if(hndlrs!==void 0){
                for(let h of hndlrs){
                    h(e);
                }
            }
        }

        public static subscribeChannelDataLoaded(h:ChannelDataLoadedHandler){
            let list = this.handlers.get(HandlerTypes.ChannelDataLoadedType);
            if(list===void 0){
                list = [];
            }
            list.push(h);
            this.handlers.set(HandlerTypes.ChannelDataLoadedType, list);
        }

        public static invokeChannelDataLoaded(data:DataInterface.MoleData|DataInterface.ChannelsDBData){
            let hndlrs = this.handlers.get(HandlerTypes.ChannelDataLoadedType);
            if(hndlrs!==void 0){
                for(let h of hndlrs){
                    h(data);
                }
            }
        }

        public static subscribeProteinDataLoaded(h:ProteinDataLoadedHandler){
            let list = this.handlers.get(HandlerTypes.ProteinDataLoadedType);
            if(list===void 0){
                list = [];
            }
            list.push(h);
            this.handlers.set(HandlerTypes.ProteinDataLoadedType, list);
        }

        public static invokeProteinDataLoaded(data:DataInterface.ProteinData){
            let hndlrs = this.handlers.get(HandlerTypes.ProteinDataLoadedType);
            if(hndlrs!==void 0){
                for(let h of hndlrs){
                    h(data);
                }
            }
        }

        public static subscribeToggleLoadingScreen(h:ToggleLoadingScreenHandler){
            let list = this.handlers.get(HandlerTypes.ToggleLoadingScreenType);
            if(list===void 0){
                list = [];
            }
            list.push(h);
            this.handlers.set(HandlerTypes.ToggleLoadingScreenType, list);
        }

        public static invokeToggleLoadingScreen(params:ToggleLoadingScreenParams){
            let hndlrs = this.handlers.get(HandlerTypes.ToggleLoadingScreenType);
            if(hndlrs!==void 0){
                for(let h of hndlrs){
                    h(params);
                }
            }
        }

        public static subscribeRunGeneratePDFReport(h:RunPDFReportHandler){
            let list = this.handlers.get(HandlerTypes.RunPDFReportType);
            if(list===void 0){
                list = [];
            }
            list.push(h);
            this.handlers.set(HandlerTypes.RunPDFReportType, list);
        }

        public static invokeRunPDFReport(){
            let hndlrs = this.handlers.get(HandlerTypes.RunPDFReportType);
            if(hndlrs!==void 0){
                for(let h of hndlrs){
                    h();
                }
            }
        }

        public static subscribeCopyParameters(h:CopyParametersHandler){
            let list = this.handlers.get(HandlerTypes.CopyParametersType);
            if(list===void 0){
                list = [];
            }
            list.push(h);
            this.handlers.set(HandlerTypes.CopyParametersType, list);
        }

        public static invokeCopyParameters(params:CopyParametersParams){
            let hndlrs = this.handlers.get(HandlerTypes.CopyParametersType);
            if(hndlrs!==void 0){
                for(let h of hndlrs){
                    h(params);
                }
            }
        }

        public static subscribeOnReSubmit(h:CopyParametersHandler){
            let list = this.handlers.get(HandlerTypes.OnReSubmitType);
            if(list===void 0){
                list = [];
            }
            list.push(h);
            this.handlers.set(HandlerTypes.OnReSubmitType, list);
        }

        public static invokeOnReSubmit(promise:any){
            let hndlrs = this.handlers.get(HandlerTypes.OnReSubmitType);
            if(hndlrs!==void 0){
                for(let h of hndlrs){
                    h(promise);
                }
            }
        }
        
    }
}