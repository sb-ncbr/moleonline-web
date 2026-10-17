import React from "react";
import { ChannelsDBData, firstNonEmptyCategory, MoleData, Tunnel, TunnelMetaInfo } from "../../../DataInterface";
import { CompInfo, formatChains, MoleConfig, PoresConfig, Submission } from "../../../MoleAPIService";
import { PDFTemplate, Service } from "../../../TemplateService";
import { Events, Instances } from "../../../Bridge";
import { Vizualizer } from "../../LayerVizualizer/Vizualizer";
import { Tunnels } from "../../CommonUtils/Tunnels";
import { roundToDecimal } from "../../../Common/Util/Numbers";
import { ResidueAnnotation } from "../../../ChannelsDBAPIService";
import { Residues } from "../../CommonUtils/Residues";
import { SelectionHelper } from "../../CommonUtils/Selection";
import { ChannelsDBData as ChannelsDBDataCache, LastVisibleChannels } from "../../../Cache";
import { getParameters, isInChannelsDBMode, URLParams } from "../../../Common/Util/Router";
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

// Replaces each [[PLACEHOLDER]] of the template; a missing value (null, undefined) leaves it empty
function fill(template: string, values: Record<string, string | null | undefined>): string {
    for (const [placeholder, value] of Object.entries(values)) {
        template = template.split(`[[${placeholder}]]`).join(value ?? "");
    }
    return template;
}

const yesNo = (value: boolean | undefined) => value ? "Yes" : "No";

export class PDFReportGenerator extends React.Component<{}, AppState> {
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
                this.generateReport(originalVisibleChannels as (Tunnel[] & TunnelMetaInfo[]));
            })
        });
    }

    private addCurrentLMScreen(template: string) {
        let context = Context.getInstance();
        let molstarCanvas = context.plugin.canvas3dContext && context.plugin.canvas3dContext.canvas ? context.plugin.canvas3dContext.canvas : ({} as HTMLCanvasElement)
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
        const p = tunnel.Properties;
        const round = (value: number) => roundToDecimal(value, 2).toString();
        const optional = (value: number | null | undefined) => (value !== null && value !== void 0) ? round(value) : 'N/A';
        return fill(template, {
            "TUNNEL-PROPS-LENGTH": round(Tunnels.getLength(tunnel)),
            "TUNNEL-PROPS-BOTTLENECK": Tunnels.getBottleneck(tunnel),
            "TUNNEL-PROPS-HYDROPATHY": round(p.Hydropathy),
            "TUNNEL-PROPS-CHARGE": round(p.Charge),
            "TUNNEL-PROPS-POLARITY": round(p.Polarity),
            "TUNNEL-PROPS-MUTABILITY": round(p.Mutability),
            "TUNNEL-PROPS-LOGP": optional(p.LogP),
            "TUNNEL-PROPS-LOGD": optional(p.LogD),
            "TUNNEL-PROPS-LOGS": optional(p.LogS),
            "TUNNEL-PROPS-IONIZABLE": optional(p.Ionizable),
        });
    }

    private addLiningResidues(template: string, residueLines: { residue: string, annotation: ResidueAnnotation | null }[]) {
        let rows = "";
        for (const { residue, annotation } of residueLines) {
            const r = Residues.parseResidues([residue], true)[0];
            const backbone = r.backbone ? '<img class="report-ok-icon" src="/images/accept.gif"/>' : '';
            const note = (annotation === null) ? '' : `${annotation.text} ${(annotation.reference !== "") ? "(" + annotation.reference + ")" : ""}`;
            rows += `<tr><td>${r.name}</td><td>${r.authSeqNumber}</td><td>${r.chain.authAsymId}</td><td>${backbone}</td><td>${note}</td></tr>`;
        }
        return template.replace("[[LINING-RESIDUES-TABLE-ROWS]]", rows);
    }

    private selectChannel(channel: Tunnel, allChannels: Tunnel[]) {
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

    private addParamsPageCommon(template: string, urlParams: URLParams | null, compInfo: CompInfo) {
        const isUserStructure = compInfo.PdbId === void 0 || compInfo.PdbId === null || compInfo.PdbId === "";
        return fill(template, {
            "COMP-ID": urlParams?.computationId,
            "SUBMIT-ID": urlParams && String(urlParams.submitId),
            "URL": location.href,
            "PDBID": isUserStructure ? "User structure" : compInfo.PdbId,
            "ASSEMBLY-ID": isUserStructure ? "User structure" : (compInfo.AssemblyId ?? "Asymmetric unit"),
        });
    }

    private addParamsPageMole(template: string, params: MoleConfig) {
        const { Input: input, Cavity: cavity, Tunnel: tunnel, Origin: origin, CustomExits: exits } = params;
        return fill(template, {
            "MOLE-PARAMS-VISIBLE": "visible",
            "SPECIFIC-CHAINS": input?.SpecificChains,
            "IGNORE-HYDROGENS": cavity && yesNo(cavity.IgnoreHydrogens),
            "IGNORE-HETATMS": cavity && yesNo(cavity.IgnoreHETAtoms),
            "INTERIOR-TRESHOLD": cavity && String(cavity.InteriorThreshold),
            "PROBE-RADIUS": cavity && String(cavity.ProbeRadius),
            "STARTING-POINT-XYZ": origin?.Points && pointsToString(origin.Points),
            "STARTING-POINT": origin?.Residues && flattenResiduesArray(origin.Residues),
            "QUERY-FILTER": origin?.QueryExpression,
            "END-POINT-XYZ": exits?.Points && pointsToString(exits.Points),
            "END-POINT": exits?.Residues && flattenResiduesArray(exits.Residues),
            "QUERY": exits?.QueryExpression,
            "IGNORED-RESIDUES": params.NonActiveResidues && flattenResidues(params.NonActiveResidues),
            "BOTTLENECK-RADIUS": tunnel && String(tunnel.BottleneckRadius),
            "BOTTLENECK-TOLERANCE": tunnel && String(tunnel.BottleneckTolerance),
            "MAX-TUNNEL-SIMILARITY": tunnel && String(tunnel.MaxTunnelSimilarity),
            "ORIGIN-RADIUS": tunnel && String(tunnel.OriginRadius),
            "SURFACE-COVER-RADIUS": tunnel && String(tunnel.SurfaceCoverRadius),
            "WEIGHT-FUNCTION": tunnel && String(tunnel.WeightFunction),
            "AUTOMATIC-PORES": params.PoresAuto !== void 0 ? yesNo(params.PoresAuto) : null,
            "MERGE-PORES": params.PoresMerged !== void 0 ? yesNo(params.PoresMerged) : null,
        });
    }

    private addParamsPagePores(template: string, params: PoresConfig) {
        return fill(template, {
            "PORES-PARAMS-VISIBLE": "visible",
            "BETA-STRUCTURE": yesNo(params.IsBetaBarrel),
            "MEMBRANE-REGION": yesNo(params.InMembrane),
            "SPECIFIC-CHAINS": formatChains(params.Chains),
        });
    }

    private generateReport(originalVisibleChannels: (Tunnel & TunnelMetaInfo)[]) {
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
                                if (s.SubmitId === urlParams.submitId) {
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
            Service.getPDFReportTemplateData().then(template => {
                PDFReportGenerator.templateCache = template;
                if (this.state.data === null) {
                    this.afterError("Channel data are not loaded.");
                    return;
                }
                let data = this.state.data.Channels as any;

                let channels: Tunnel[] = firstNonEmptyCategory(data)?.tunnels ?? [];

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
                            let toPrint = `<div id='${reportWrapperId}'>` + css + this.state.reportContent + '</div>';
                            let toPrintHtml = $(toPrint)[0];
                            $(document.body.children).addClass("no-print");
                            document.body.appendChild(toPrintHtml);
                            let originalTitle = document.title;

                            if (urlParams !== null) {
                                document.title = `MOLEonline - ${urlParams.computationId}/${urlParams.submitId}`;
                            }

                            window.setTimeout(() => {
                                let afterPrint = (() => {
                                    let reportWrapper = $('#' + reportWrapperId)[0];
                                    if (reportWrapper !== void 0 && reportWrapper !== null) {
                                        document.body.removeChild(reportWrapper);
                                    }
                                    $(document.body.children).removeClass("no-print");
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

                                showChannelVisuals(channels as (Tunnel[] & TunnelMetaInfo[]), false).then(() => {
                                    showChannelVisuals(originalVisibleChannels as (Tunnel[] & TunnelMetaInfo[]), true).then(() => {
                                        SelectionHelper.resetScene();
                                        SelectionHelper.clearSelection();
                                        SelectionHelper.forceInvokeOnChannelDeselectHandlers();
                                        LastVisibleChannels.clear();
                                        window.print();
                                    })
                                })
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
