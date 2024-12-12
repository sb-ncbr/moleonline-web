import React from "react";
import { ChannelsDBChannels, ChannelsDBData, MoleData, Tunnel, TunnelMetaInfo } from "../../../DataInterface";
import { CompInfo, MoleConfig, PoresConfig, Submission } from "../../../MoleAPIService";
import { PDFTemplate, Service } from "../../../TemplateService";
import { Events, Instances } from "../../../Bridge";
import { Vizualizer } from "../../LayerVizualizer/Vizualizer";
import { Tunnels } from "../../CommonUtils/Tunnels";
import { roundToDecimal } from "../../../Common/Util/Numbers";
import { ResidueAnnotation } from "../../../ChannelsDBAPIService";
import { Residues } from "../../CommonUtils/Residues";
import { SelectionHelper } from "../../CommonUtils/Selection";
import { ChannelsDBData as ChannelsDBDataCache, LastVisibleChannels } from "../../../Cache";
import { getCurrentUrl, getParameters, isInChannelsDBMode, URLParams } from "../../../Common/Util/Router";
import { flattenResidues, flattenResiduesArray, isMoleJob, pointsToString } from "../../CommonUtils/Misc";
import { ComputationInfo } from "../../../DataProxy";
import { CommonOptions } from "../../../../config/common";
import { showChannelVisuals } from "../../State";
import { Context } from "../../Context";

declare function $(p: any): any;

interface ConfigPromiseType { submission: Submission, compInfo: CompInfo };

interface AppState {
    data: MoleData | ChannelsDBData | null,
    reportContent: string | null
    inProgress: boolean,
    progress: number
}

export class PDFReportGenerator extends React.Component<{}, AppState> {
    private a4width = 210;
    private a4height = 297;
    private lineColor = "0.7";
    private lineWidth = 0.3;

    public static templateCache: PDFTemplate | null = null;

    state: AppState = { data: null, reportContent: null, inProgress: false, progress: 0 };

    componentDidMount() {
        Events.subscribeChannelDataLoaded(data => {
            let state = this.state;
            state.data = data;
            this.setState(state);
        });
        Events.subscribeRunGeneratePDFReport(() => {
            if (this.state.inProgress === true) {
                console.log("Attempt to run PDF report generator while in progress!");
                return;
            }
            let originalVisibleChannels = LastVisibleChannels.get();
            showChannelVisuals(originalVisibleChannels as (Tunnel[] & TunnelMetaInfo[]), false).then(() => {
                this.generateReport();
            })
        });
    }

    private addCurrentLMScreen(template: string) {
        let plugin = Instances.getPlugin();
        let context = Context.getInstance();
        let molstarCanvas = context.plugin.canvas3dContext && context.plugin.canvas3dContext.canvas ? context.plugin.canvas3dContext.canvas : ({} as HTMLCanvasElement)
        // let litemolCanvas = (plugin.context.scene.scene.parentElement.children[0] as HTMLCanvasElement);
        // let litemolCanvas = ({} as HTMLCanvasElement);
        let molstar_screenshot = molstarCanvas.toDataURL('image/png');
        template = template.replace("[[3D-SCREEN-SRC]]", molstar_screenshot);
        return template.replace("[[report-3D-view-visible]]", "visible");
    }

    private addCurrentLVZScreen(template: string) {
        let lvz = (Instances.getLayersVizualizer() as Vizualizer);
        let screenshot = lvz.exportImage();
        template = template.replace("[[2D-SCREEN-SRC]]", screenshot);
        return template.replace("[[report-2D-view-visible]]", "visible");
    }

    private addTunnelName(template: string, text: string): string {
        return template.replace("[[TUNNEL-NAME]]", text);
    }

    private addPhysChemProps(template: string, tunnel: Tunnel): string {
        let length = roundToDecimal(Tunnels.getLength(tunnel), 2).toString();
        let bottleneck = Tunnels.getBottleneck(tunnel);
        let hydropathy = roundToDecimal(tunnel.Properties.Hydropathy, 2).toString();
        let charge = roundToDecimal(tunnel.Properties.Charge, 2).toString();
        let polarity = roundToDecimal(tunnel.Properties.Polarity, 2).toString();
        let mutability = roundToDecimal(tunnel.Properties.Mutability, 2).toString();
        let logP = (tunnel.Properties.LogP !== null && tunnel.Properties.LogP !== void 0) ? roundToDecimal(tunnel.Properties.LogP, 2).toString() : 'N/A';
        let logD = (tunnel.Properties.LogD !== null && tunnel.Properties.LogD !== void 0) ? roundToDecimal(tunnel.Properties.LogD, 2).toString() : 'N/A';
        let logS = (tunnel.Properties.LogS !== null && tunnel.Properties.LogS !== void 0) ? roundToDecimal(tunnel.Properties.LogS, 2).toString() : 'N/A';
        let ionizable = (tunnel.Properties.Ionizable !== null && tunnel.Properties.Ionizable !== void 0) ? roundToDecimal(tunnel.Properties.Ionizable, 2).toString() : 'N/A';

        template = this.replacePlaceholder(template, "TUNNEL-PROPS-LENGTH", length);
        template = this.replacePlaceholder(template, "TUNNEL-PROPS-BOTTLENECK", bottleneck);
        template = this.replacePlaceholder(template, "TUNNEL-PROPS-HYDROPATHY", hydropathy);
        template = this.replacePlaceholder(template, "TUNNEL-PROPS-CHARGE", charge);
        template = this.replacePlaceholder(template, "TUNNEL-PROPS-POLARITY", polarity);
        template = this.replacePlaceholder(template, "TUNNEL-PROPS-MUTABILITY", mutability);
        template = this.replacePlaceholder(template, "TUNNEL-PROPS-LOGP", logP);
        template = this.replacePlaceholder(template, "TUNNEL-PROPS-LOGD", logD);
        template = this.replacePlaceholder(template, "TUNNEL-PROPS-LOGS", logS);
        template = this.replacePlaceholder(template, "TUNNEL-PROPS-IONIZABLE", ionizable);

        return template;
    }

    private addLiningResidues(template: string, residueLines: { residue: string, annotation: ResidueAnnotation | null }[]) {
        let rows = "";
        for (let i = 0; i < residueLines.length; i++) {
            let resInfo = Residues.parseResidues([residueLines[i].residue], true);
            let name = resInfo[0].name;
            let seq = resInfo[0].authSeqNumber;
            let chain = resInfo[0].chain.authAsymId;
            let backbone = (resInfo[0].backbone) ? '<img class="report-ok-icon" src="/images/accept.gif"/>' : '';
            let annotation = residueLines[i].annotation;
            if (annotation === null) {
                rows += `<tr><td>${name}</td><td>${seq}</td><td>${chain}</td><td>${backbone}</td><td></td></tr>`;
            }
            else {
                rows += `<tr><td>${name}</td><td>${seq}</td><td>${chain}</td><td>${backbone}</td><td>${annotation.text} ${((annotation.reference !== "") ? "(" + annotation.reference + ")" : "")}</td></tr>`;
            }
        }
        return template.replace("[[LINING-RESIDUES-TABLE-ROWS]]", rows);
    }

    private selectChannel(channel: Tunnel, allChannels: Tunnel[]) {
        // let plugin = Instances.getPlugin();
        return new Promise<any>((res, rej) => {
            try {
                showChannelVisuals(allChannels as (Tunnel[] & TunnelMetaInfo[]), false).then(() => {
                    Events.invokeChannelSelect(channel.Id);

                    let waitToResolve = () => {
                        window.setTimeout(() => {
                            if (SelectionHelper.getSelectedChannelId() == channel.Id) {
                                window.setTimeout(() => { res(null) }, 100);
                                return;
                            }
                            waitToResolve();
                        }, 20);
                    };
                    waitToResolve();
                })
                // LiteMol.Example.Channels.State.showChannelVisuals(plugin, allChannels as any, false).then(() => {
                //     Events.invokeChannelSelect(channel.Id);

                //     let waitToResolve = () => {
                //         window.setTimeout(() => {
                //             if (SelectionHelper.getSelectedChannelId() == channel.Id) {
                //                 window.setTimeout(() => { res() }, 100);
                //                 return;
                //             }
                //             waitToResolve();
                //         }, 20);
                //     };
                //     waitToResolve();
                // })
            } catch (err) {
                rej(err);
            }
        });
    }

    private zipResiduesWithAnnotations(residues: string[], annotations: Map<string, ResidueAnnotation[]> | null): { residue: string, annotation: ResidueAnnotation | null }[] {
        let result: { residue: string, annotation: ResidueAnnotation | null }[] = [];

        for (let r of residues) {
            if (annotations === null) {
                result.push({ residue: r, annotation: null });
                continue;
            }
            let info = Residues.parseResidues([r], true);
            let a = annotations.get(`${info[0].authSeqNumber} ${info[0].chain.authAsymId}`);
            if (a === void 0 || a === null || a.length === 0) {
                result.push({ residue: r, annotation: null });
                continue;
            }
            for (let ca of a) {
                result.push({ residue: r, annotation: ca });
            }
        }

        return result;
    }

    private generateChannelReport(channelData: Tunnel) {
        return new Promise<any>((res, rej) => {
            let template = PDFReportGenerator.templateCache;
            if (template === null) {
                rej("No template!!!");
                return;
            }
            let notNullTemplate = template.html.slice();

            let templateInstance = notNullTemplate.slice();

            let residues = Residues.sort(channelData.Layers.ResidueFlow.slice(), void 0, true, true);
            if (residues === void 0) {
                return;
            }

            let name_ = Tunnels.getName(channelData);
            let chdb_annotations = ChannelsDBDataCache.getChannelAnnotationsImmediate(channelData.Id);
            let length = Tunnels.getLength(channelData);
            let tunnelName = `${channelData.Type}, Length: ${length} Å`;
            if (chdb_annotations !== null && chdb_annotations.length > 0) {
                tunnelName = chdb_annotations[0].name;
            }
            else if (name_ !== void 0) {
                tunnelName = name_;
            }

            let residueAnnotations = ChannelsDBDataCache.getResiduesAnnotationsImmediate();
            let residuesPages = this.zipResiduesWithAnnotations(residues, residueAnnotations);
            let residuesList: { residue: string, annotation: ResidueAnnotation | null }[] = [];
            for (let p of residuesPages) {
                residuesList = residuesList.concat(p);
            }

            templateInstance = this.addTunnelName(templateInstance, tunnelName);
            templateInstance = this.addPhysChemProps(templateInstance, channelData);
            templateInstance = this.addCurrentLMScreen(templateInstance);
            templateInstance = this.addCurrentLVZScreen(templateInstance);
            templateInstance = this.addLiningResidues(templateInstance, residuesList);

            let state = this.state;
            let reportContent = "";
            if (state.reportContent !== null) {
                reportContent = state.reportContent;
            }

            reportContent += templateInstance;
            state.reportContent = reportContent;
            this.setState(state);
            res(null);
        });
    }

    private generateChannelReportWrapper(channelData: Tunnel, allChannels: Tunnel[]) {
        return new Promise<void>((res, rej) => {
            if (this.state.data === null) {
                rej("No data!");
            }
            let selectedChannelId = SelectionHelper.getSelectedChannelId();
            let canvas = $(".layer-vizualizer-canvas");
            if (canvas.length === 0 || selectedChannelId !== channelData.Id) {
                if (selectedChannelId !== channelData.Id) {
                    this.selectChannel(channelData, allChannels).then(() => {
                        this.generateChannelReportWrapper(channelData, allChannels)
                            .then(() => {
                                res();
                            })
                            .catch(err => {
                                rej(err)
                                console.log(err);
                            });
                    });
                }
                else {
                    let waitForCanvas = (timeout?: number) => {
                        let canvas = $(".layer-vizualizer-canvas");
                        if (canvas.length === 0) {
                            window.setTimeout(() => waitForCanvas((timeout === void 0) ? 20 : timeout + 10), (timeout === void 0) ? 20 : timeout);
                        }
                        else {
                            this.generateChannelReport(channelData)
                                .then(
                                    () => res()
                                ).catch(err => {
                                    rej(err)
                                    console.log(err);
                                });
                            res();
                        }
                    };
                    waitForCanvas();
                }
            }
            else {
                this.generateChannelReport(channelData).then(
                    () => res()
                ).catch(err => {
                    rej(err)
                    console.log(err);
                });
            }
        });
    }

    private replacePlaceholder(template: string, placeholder: string, value: string | null) {
        let regexp = new RegExp("\\[\\[" + placeholder + "\\]\\]", "g");
        return template.replace(regexp, (value === null) ? "" : value);
    }

    private addParamsPageCommon(template: string, urlParams: URLParams | null, compInfo: CompInfo) {
        let emptyPlaceholders: string[] = [];
        if (urlParams !== null) {
            template = this.replacePlaceholder(template, "COMP-ID", urlParams.computationId);
            template = this.replacePlaceholder(template, "SUBMIT-ID", String(urlParams.submitId));
        }
        else {
            emptyPlaceholders.push("COMP-ID");
            emptyPlaceholders.push("SUBMIT-ID");
        }
        template = this.replacePlaceholder(template, "URL", getCurrentUrl());

        let isUserStructure = compInfo.PdbId === void 0 || compInfo.PdbId === null || compInfo.PdbId === "";

        template = this.replacePlaceholder(template, "PDBID", (isUserStructure) ? "User structure" : compInfo.PdbId);

        template = this.replacePlaceholder(template, "ASSEMBLY-ID", (isUserStructure) ? "User structure" : ((compInfo.AssemblyId !== null) ? compInfo.AssemblyId : "Asymmetric unit"));

        template = this.replaceEmptyPlaceholders(template, emptyPlaceholders);

        return template;
    }

    //Replace all not filled placeholders with empty strings
    private replaceEmptyPlaceholders(template: string, placeholders: string[]) {
        for (let emptyPlaceholder of placeholders) {
            template = this.replacePlaceholder(template, emptyPlaceholder, "");
        }

        return template;
    }

    private addParamsPageMole(template: string, params: MoleConfig) {
        template = this.replacePlaceholder(template, "MOLE-PARAMS-VISIBLE", "visible");
        let emptyPlaceholders: string[] = [];
        let input = params.Input;
        let cavity = params.Cavity;
        let exits = params.CustomExits;
        let nonactiveResidues = params.NonActiveResidues;
        let origin = params.Origin;
        let tunnel = params.Tunnel;
        if (input !== void 0) {
            template = this.replacePlaceholder(template, "READ-ALL-MODELS", (input.ReadAllModels) ? "Yes" : "No");
            template = this.replacePlaceholder(template, "SPECIFIC-CHAINS", input.SpecificChains);
        }
        else {
            emptyPlaceholders.push("READ-ALL-MODELS");
            emptyPlaceholders.push("SPECIFIC-CHAINS");
        }
        if (cavity !== void 0) {
            template = this.replacePlaceholder(template, "IGNORE-HYDROGENS", (cavity.IgnoreHydrogens) ? "Yes" : "No");
            template = this.replacePlaceholder(template, "IGNORE-HETATMS", (cavity.IgnoreHETAtoms) ? "Yes" : "No");
            template = this.replacePlaceholder(template, "INTERIOR-TRESHOLD", String(cavity.InteriorThreshold));
            template = this.replacePlaceholder(template, "PROBE-RADIUS", String(cavity.ProbeRadius));
        }
        else {
            emptyPlaceholders.push("IGNORE-HYDROGENS");
            emptyPlaceholders.push("IGNORE-HETATMS");
            emptyPlaceholders.push("INTERIOR-TRESHOLD");
            emptyPlaceholders.push("PROBE-RADIUS");
        }
        if (origin !== void 0 && origin !== null) {
            let points = origin.Points;
            if (points !== null) {
                template = this.replacePlaceholder(template, "STARTING-POINT-XYZ", pointsToString(points));
            }
            else {
                emptyPlaceholders.push("STARTING-POINT-XYZ");
            }
            let residues = origin.Residues;
            if (residues !== null) {
                template = this.replacePlaceholder(template, "STARTING-POINT", flattenResiduesArray(residues));
            }
            else {
                emptyPlaceholders.push("STARTING-POINT");
            }
            if (origin.QueryExpression !== null) {
                template = this.replacePlaceholder(template, "QUERY-FILTER", origin.QueryExpression);
            }
            else {
                emptyPlaceholders.push("QUERY-FILTER");
            }
        }
        else {
            emptyPlaceholders.push("STARTING-POINT-XYZ");
            emptyPlaceholders.push("STARTING-POINT");
            emptyPlaceholders.push("QUERY-FILTER");
        }
        if (exits !== void 0 && exits !== null) {
            let points = exits.Points;
            if (points !== null) {
                template = this.replacePlaceholder(template, "END-POINT-XYZ", pointsToString(points));
            }
            else {
                emptyPlaceholders.push("END-POINT-XYZ");
            }
            let residues = exits.Residues;
            if (residues !== null) {
                template = this.replacePlaceholder(template, "END-POINT", flattenResiduesArray(residues));
            }
            else {
                emptyPlaceholders.push("END-POINT");
            }
            if (exits.QueryExpression !== null) {
                template = this.replacePlaceholder(template, "QUERY", exits.QueryExpression);
            }
            else {
                emptyPlaceholders.push("QUERY");
            }
        }
        else {
            emptyPlaceholders.push("END-POINT-XYZ");
            emptyPlaceholders.push("END-POINT");
            emptyPlaceholders.push("QUERY");
        }
        if (nonactiveResidues !== void 0 && nonactiveResidues !== null) {
            template = this.replacePlaceholder(template, "IGNORED-RESIDUES", flattenResidues(nonactiveResidues));
        }
        else {
            emptyPlaceholders.push("IGNORED-RESIDUES");
        }
        if (tunnel !== void 0 && tunnel !== null) {
            template = this.replacePlaceholder(template, "BOTTLENECK-RADIUS", String(tunnel.BottleneckRadius));
            template = this.replacePlaceholder(template, "BOTTLENECK-TOLERANCE", String(tunnel.BottleneckTolerance));
            template = this.replacePlaceholder(template, "MAX-TUNNEL-SIMILARITY", String(tunnel.MaxTunnelSimilarity));
            template = this.replacePlaceholder(template, "ORIGIN-RADIUS", String(tunnel.OriginRadius));
            template = this.replacePlaceholder(template, "SURFACE-COVER-RADIUS", String(tunnel.SurfaceCoverRadius));
            template = this.replacePlaceholder(template, "WEIGHT-FUNCTION", String(tunnel.WeightFunction));
        }
        else {
            emptyPlaceholders.push("BOTTLENECK-RADIUS");
            emptyPlaceholders.push("BOTTLENECK-TOLERANCE");
            emptyPlaceholders.push("MAX-TUNNEL-SIMILARITY");
            emptyPlaceholders.push("ORIGIN-RADIUS");
            emptyPlaceholders.push("SURFACE-COVER-RADIUS");
            emptyPlaceholders.push("WEIGHT-FUNCTION");
        }
        if (params.PoresAuto !== void 0) {
            template = this.replacePlaceholder(template, "AUTOMATIC-PORES", (params.PoresAuto) ? "Yes" : "No");
        }
        else {
            emptyPlaceholders.push("AUTOMATIC-PORES");
        }
        if (params.PoresMerged !== void 0) {
            template = this.replacePlaceholder(template, "MERGE-PORES", (params.PoresMerged) ? "Yes" : "No");
        }
        else {
            emptyPlaceholders.push("MERGE-PORES");
        }

        template = this.replaceEmptyPlaceholders(template, emptyPlaceholders);

        return template;
    }

    private addParamsPagePores(template: string, params: PoresConfig) {
        template = this.replacePlaceholder(template, "PORES-PARAMS-VISIBLE", "visible");
        template = this.replacePlaceholder(template, "BETA-STRUCTURE", (params.IsBetaBarel) ? "Yes" : "No");
        template = this.replacePlaceholder(template, "MEMBRANE-REGION", (params.IsBetaBarel) ? "Yes" : "No");
        template = this.replacePlaceholder(template, "SPECIFIC-CHAINS", params.Chains);

        return template;
    }

    private generateReport() {
        let urlParams = getParameters();
        if (urlParams === null) {
            console.log("URL parameters cannot be parsed!");
            return;
        }

        let state = this.state;
        state.inProgress = true;
        this.setState(state);

        let channelsDBMode = isInChannelsDBMode();
        let configParamsPromise;
        if (channelsDBMode) {
            configParamsPromise = Promise.resolve(null as ConfigPromiseType | null);
        }
        else {
            configParamsPromise = new Promise<ConfigPromiseType | null>((res, rej) => {
                if (urlParams === null) {
                    rej("URL parameters cannot be parsed");
                    return;
                }
                ComputationInfo.DataProvider.get(urlParams.computationId, (compId, info) => {
                    if (urlParams === null) {
                        rej("URL parameters cannot be parsed");
                    }
                    else {
                        if (compId === urlParams.computationId) {
                            for (let s of info.Submissions) {
                                if (String(s.SubmitId) === String(urlParams.submitId)) {
                                    res({ submission: s, compInfo: info });
                                    return;
                                }
                            }
                            rej("Submission data not available!");
                        }
                    }
                });
            });
        }

        configParamsPromise.then((val) => {
            let originalVisibleChannels = LastVisibleChannels.get();
            Service.getPDFReportTemplateData().then(template => {
                PDFReportGenerator.templateCache = template;
                if (this.state.data === null) {
                    console.log("genereateReport has no data!");
                    return;
                }
                let data = this.state.data.Channels as any;

                let channels: Tunnel[] = [];
                //-- MoleOnline
                if (data.MergedPores && data.MergedPores.length > 0) {
                    channels = data.MergedPores;
                }
                if (data.Paths && data.Paths.length > 0) {
                    channels = data.Paths;
                }
                if (data.Pores && data.Pores.length > 0) {
                    channels = data.Pores;
                }
                if (data.Tunnels && data.Tunnels.length > 0) {
                    channels = data.Tunnels;
                }
                //-- ChannelsDB
                if (data.ReviewedChannels_MOLE && data.ReviewedChannels_MOLE.length > 0) {
                    channels = data.RevieReviewedChannels_MOLEwedChannels;
                }
                if (data.ReviewedChannels_Caver && data.ReviewedChannels_Caver.length > 0) {
                    channels = data.ReviewedChannels_Caver;
                }
                if (data.CSATunnels_MOLE && data.CSATunnels_MOLE.length > 0) {
                    channels = data.CSATunnels_MOLE;
                }
                if (data.CSATunnels_Caver && data.CSATunnels_Caver.length > 0) {
                    channels = data.CSATunnels_Caver;
                }
                if (data.TransmembranePores_MOLE && data.TransmembranePores_MOLE.length > 0) {
                    channels = data.TransmembranePores_MOLE;
                }
                if (data.TransmembranePores_Caver && data.TransmembranePores_Caver.length > 0) {
                    channels = data.TransmembranePores_Caver;
                }
                if (data.CofactorTunnels_MOLE && data.CofactorTunnels_MOLE.length > 0) {
                    channels = data.CofactorTunnels_MOLE;
                }
                if (data.CofactorTunnels_Caver && data.CofactorTunnels_Caver.length > 0) {
                    channels = data.CofactorTunnels_Caver;
                }
                if (data.ProcognateTunnels_MOLE && data.ProcognateTunnels_MOLE.length > 0) {
                    channels = data.ProcognateTunnels_MOLE;
                }
                if (data.ProcognateTunnels_Caver && data.ProcognateTunnels_Caver.length > 0) {
                    channels = data.ProcognateTunnels_Caver;
                }
                if (data.AlphaFillTunnels_MOLE && data.AlphaFillTunnels_MOLE.length > 0) {
                    channels = data.AlphaFillTunnels_MOLE;
                }
                if (data.AlphaFillTunnels_Caver && data.AlphaFillTunnels_Caver.length > 0) {
                    channels = data.AlphaFillTunnels_Caver;
                }

                let reportContent = "";

                if (!channelsDBMode && val !== null) {
                    let modeMole = isMoleJob(val.submission);
                    let paramsPageTemplate = template.paramsPageHtml.slice();
                    paramsPageTemplate = this.addParamsPageCommon(paramsPageTemplate, urlParams, val.compInfo);

                    if (modeMole) {
                        paramsPageTemplate = this.addParamsPageMole(paramsPageTemplate, val.submission.MoleConfig);
                    }
                    else {
                        paramsPageTemplate = this.addParamsPagePores(paramsPageTemplate, val.submission.PoresConfig);
                    }
                    reportContent += paramsPageTemplate;
                }

                let state = this.state;
                state.reportContent = reportContent;
                this.setState(state);

                let split = (tunnels: Tunnel[]) => {
                    if (tunnels.length === 0) {
                        return {
                            current: null,
                            remaining: []
                        };
                    }

                    return {
                        current: tunnels[0],
                        remaining: tunnels.slice(1)
                    }
                }

                let generate = (tunnels: Tunnel[]) => {
                    let d = split(tunnels);
                    if (d.current === null) {
                        if (CommonOptions.DEBUG_MODE)
                            console.log("Saving file...");
                        if (this.state.reportContent !== null && PDFReportGenerator.templateCache !== null) {
                            let css = '<style>' + PDFReportGenerator.templateCache.css + "</style>";
                            let reportWrapperId = "report-wrapper";
                            let jsConstants = `<script>var report_idToRemoveAfterPrint = '${reportWrapperId}';</script>`;
                            let toPrint = `<div id='${reportWrapperId}'>` + css + this.state.reportContent + '</div>';
                            let toPrintHtml = $(toPrint)[0];
                            $(document.body.children).addClass("no-print");
                            document.body.appendChild(toPrintHtml);
                            let originalTitle = document.title;

                            if (urlParams !== null) {
                                document.title = `MoleOnline - ${urlParams.computationId}/${urlParams.submitId}`;
                            }

                            window.setTimeout(() => {
                                let afterPrint = (() => {
                                    let reportWrapper = $('#' + reportWrapperId)[0];
                                    if (reportWrapper !== void 0 && reportWrapper !== null) {
                                        document.body.removeChild(reportWrapper);
                                    }
                                    $(document.body.children).removeClass("no-print");
                                    //$(".pdf-report-generator").removeClass("in-progress");
                                    let state = this.state;
                                    state.progress = 0;
                                    state.inProgress = false;
                                    this.setState(state);
                                    document.title = originalTitle;

                                }).bind(this);

                                if (window.matchMedia) {
                                    let mediaQueryList = window.matchMedia('print');
                                    mediaQueryList.addListener(function (mql) {
                                        if (!mql.matches) {
                                            afterPrint();
                                        }
                                    });
                                }

                                window.onafterprint = afterPrint;

                                // let plugin = Instances.getPlugin();

                                showChannelVisuals(channels as (Tunnel[] & TunnelMetaInfo[]), false).then(() => {
                                    showChannelVisuals(originalVisibleChannels as (Tunnel[] & TunnelMetaInfo[]), true).then(() => {
                                        SelectionHelper.resetScene();
                                        SelectionHelper.clearSelection();
                                        SelectionHelper.forceInvokeOnChannelDeselectHandlers();
                                        LastVisibleChannels.clear();
                                        window.print();
                                    })
                                })

                                // LiteMol.Example.Channels.State.showChannelVisuals(plugin, channels as any, false).then(() => {
                                //     LiteMol.Example.Channels.State.showChannelVisuals(plugin, originalVisibleChannels as any, true).then(() => {
                                //         SelectionHelper.resetScene(plugin);
                                //         SelectionHelper.clearSelection(plugin);
                                //         SelectionHelper.forceInvokeOnChannelDeselectHandlers();
                                //         window.print();
                                //     });
                                // });
                            });
                        }
                        return;
                    }
                    this.generateChannelReportWrapper(d.current, channels).then(res => {
                        let tunnelId = (d.current === null) ? "<Err>" : d.current.Id;
                        if (CommonOptions.DEBUG_MODE) {
                            console.log(`Current tunnel: ${tunnelId}`);
                            console.log(`${d.remaining.length} tunnels remaining of ${channels.length}`);
                        }
                        let s = this.state;
                        s.progress = Math.floor(((channels.length - d.remaining.length) / channels.length) * 100);
                        this.setState(s);
                        generate(d.remaining);
                    })
                        .catch(err => {
                            this.afterError(err);
                        });
                };

                generate(channels);

            }).catch(err => {
                this.afterError(err);
            });
        })
            .catch(err => {
                this.afterError(err);
            });
    }

    private afterError(err: any) {
        $(document.body.children).removeClass("no-print");
        $("#download-report .dropdown").removeClass("open-programaticaly");
        let state = this.state;
        state.progress = 0;
        state.inProgress = false;
        this.setState(state);
        Events.invokeNotifyMessage({
            messageType: "Danger",
            message: `PDF Report generation aborted. Reason: ${err}`
        })
    }

    render() {
        if (this.state.inProgress) {
            let progress = this.state.progress;
            return <li><div className="pdf-report-inprogress-overlay">
                <img src="/images/ajax-loader.gif" />
                <div className="pdf-report-inprogress-progress">Generating PDF report ({progress}%)...</div>
            </div></li>
        }
        return (
            <div />
        );
    }
}
