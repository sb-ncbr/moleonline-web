import { ChannelsDBData, MoleData } from "./DataInterface";
import { MoleConfig, PoresConfig } from "./MoleAPIService";

export class Instances {
    private static layerVizualizer: any;

    public static setLayersVizualizer(instance: any) {
        this.layerVizualizer = instance;
    }

    public static getLayersVizualizer(): any {
        return this.layerVizualizer;
    }
}

export type MessageType = "Success" | "Info" | "Warning" | "Danger";
export interface MessageInfo { message: string, messageType: MessageType };
export interface ToggleLoadingScreenParams { message: string, visible: boolean };
export interface CopyParametersParams {
    moleConfig: MoleConfig | null,
    poresConfig:PoresConfig | null,
    mode: "pores" | "mole"
};

export type NewSubmitHandler = (submitId: number) => void;
export type SubmitDoneHandler = (submitId: number) => void;
export type ChangeSubmitIdHandler = (submitId: number) => void;
export type ChannelSelectHandler = (channelId: string) => void;
export type ChangeHasKillableHandler = (hasKillable: boolean) => void;
export type NotifyMessageHandler = (e: MessageInfo) => void;
export type ChannelDataLoadedHandler = (data: MoleData | ChannelsDBData) => void;
export type ToggleLoadingScreenHandler = (params: ToggleLoadingScreenParams) => void;
export type RunPDFReportHandler = () => void;
export type CopyParametersHandler = (params: CopyParametersParams) => void;
export type OnMembraneDataReadyHandler = () => void;

type EventName =
    | "NEW-SUBMIT"
    | "SUBMIT-DONE"
    | "CHANGE-SUBMIT-ID"
    | "CHANNEL-SELECT"
    | "CHANGE-HAS-KILLABLE"
    | "NOTIFY-MESSAGE"
    | "CHANNEL-DATA-LOADED"
    | "TOGGLE-LOADING-SCREEN"
    | "RUN-PDF-REPORT"
    | "COPY-PARAMETERS"
    | "ON-RESUBMIT"
    | "ON-MEMBRANE-DATA-READY";

export class Events {
    private static handlers = new Map<EventName, ((arg?: any) => void)[]>();

    private static subscribe(name: EventName, h: (arg?: any) => void) {
        let list = this.handlers.get(name);
        if (list === void 0) {
            list = [];
            this.handlers.set(name, list);
        }
        list.push(h);
    }

    private static invoke(name: EventName, arg?: any) {
        for (let h of this.handlers.get(name) ?? []) {
            h(arg);
        }
    }

    public static subscribeChannelSelect(h: ChannelSelectHandler) { this.subscribe("CHANNEL-SELECT", h); }
    public static invokeChannelSelect(channelId: string) { this.invoke("CHANNEL-SELECT", channelId); }

    public static subscribeNewSubmit(h: NewSubmitHandler) { this.subscribe("NEW-SUBMIT", h); }
    public static invokeNewSubmit(submitId: number) { this.invoke("NEW-SUBMIT", submitId); }

    public static subscribeSubmitDone(h: SubmitDoneHandler) { this.subscribe("SUBMIT-DONE", h); }
    public static invokeSubmitDone(submitId: number) { this.invoke("SUBMIT-DONE", submitId); }

    public static subscribeChangeSubmitId(h: ChangeSubmitIdHandler) { this.subscribe("CHANGE-SUBMIT-ID", h); }
    public static invokeChangeSubmitId(submitId: number) { this.invoke("CHANGE-SUBMIT-ID", submitId); }

    public static subscribeChangeHasKillable(h: ChangeHasKillableHandler) { this.subscribe("CHANGE-HAS-KILLABLE", h); }
    public static invokeChangeHasKillable(hasKillable: boolean) { this.invoke("CHANGE-HAS-KILLABLE", hasKillable); }

    public static subscribeNotifyMessage(h: NotifyMessageHandler) { this.subscribe("NOTIFY-MESSAGE", h); }
    public static invokeNotifyMessage(e: MessageInfo) { this.invoke("NOTIFY-MESSAGE", e); }

    public static subscribeChannelDataLoaded(h: ChannelDataLoadedHandler) { this.subscribe("CHANNEL-DATA-LOADED", h); }
    public static invokeChannelDataLoaded(data: MoleData | ChannelsDBData) { this.invoke("CHANNEL-DATA-LOADED", data); }

    public static subscribeToggleLoadingScreen(h: ToggleLoadingScreenHandler) { this.subscribe("TOGGLE-LOADING-SCREEN", h); }
    public static invokeToggleLoadingScreen(params: ToggleLoadingScreenParams) { this.invoke("TOGGLE-LOADING-SCREEN", params); }

    public static subscribeRunGeneratePDFReport(h: RunPDFReportHandler) { this.subscribe("RUN-PDF-REPORT", h); }
    public static invokeRunPDFReport() { this.invoke("RUN-PDF-REPORT"); }

    public static subscribeCopyParameters(h: CopyParametersHandler) { this.subscribe("COPY-PARAMETERS", h); }
    public static invokeCopyParameters(params: CopyParametersParams) { this.invoke("COPY-PARAMETERS", params); }

    public static subscribeOnReSubmit(h: CopyParametersHandler) { this.subscribe("ON-RESUBMIT", h); }
    public static invokeOnReSubmit(promise: any) { this.invoke("ON-RESUBMIT", promise); }

    public static subscribeOnMembraneDataReady(h: OnMembraneDataReadyHandler) { this.subscribe("ON-MEMBRANE-DATA-READY", h); }
}
