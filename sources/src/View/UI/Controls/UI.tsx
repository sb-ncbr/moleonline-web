// import TunnelUtils = CommonUtils.Tunnels;
// import Provider = MoleOnlineWebUI.DataProxy.ComputationInfo.DataProvider;
// import Service = MoleOnlineWebUI.Service.MoleAPI;
// import TooltipText = MoleOnlineWebUI.StaticData.TooltipText;

import React from "react";
import { Events as BridgeEvents, CopyParametersParams, Instances } from "../../../Bridge";
import { Events as FormEvents } from "../../CommonUtils/FormEvents";
import { ApiService, CompInfo, ComputationStatus, Submission as ServiceSubmission } from "../../../MoleAPIService";
import { MoleFormData, PoresFormData } from "./FormData";
import { ComputationInfo, JobStatus } from "../../../DataProxy";
// import { CheckBox, ComboBox, ComboBoxItem, ControlGroup, LMControlWrapper, NumberBox, StartingPointBox, TextBox, TextBoxWithHelp, ValidationState } from "../Common/Controls/FromLiteMol";
import { TooltipText, WeightFunctions } from "../../../StaticData";
import { validateChainsArray, validatePatternQuery, validateResidueSimpleArray } from "../../CommonUtils/Validators";
import { flattenResidues, flattenResiduesArray, isMoleJob, parseResidues, pointsToString } from "../../CommonUtils/Misc";
import { ChannelsDBChannels } from "../../../DataInterface";
import { ChannelsDBData } from "../../../Cache";
import { SimpleComboBox } from "../Common/Controls/Components";
import { GlobalRouter } from "../../../SimpleRouter";
import { fakeRedirect, getParameters } from "../../../Common/Util/Router";
import { TabbedContainer } from "../../../Common/UI/Tabs/BootstrapTabs";
import { CommonOptions, Routing } from "../../../../config/common";
import { Button, ControlGroup, ControlRow, ToggleButton } from "molstar/lib/mol-plugin-ui/controls/common";
import { BookmarksOutlinedSvg, CloseSvg } from "molstar/lib/mol-plugin-ui/controls/icons";
import { BoolControl, BoundedIntervalControl, IntervalControl, NumberRangeControl, SelectControl, TextControl } from "molstar/lib/mol-plugin-ui/controls/parameters";
import { ParamDefinition } from "molstar/lib/mol-util/param-definition";
import { StartingPointBox, ValidationState } from "../Common/Controls/FromLiteMol";
require("molstar/lib/mol-plugin-ui/skin/light.scss");

var Provider = ComputationInfo.DataProvider;

declare function $(p: any, p1?: any): any;
declare function gtag(ga_type: string, action: string, options: { 'event_category': string, 'event_label'?: string, 'value'?: any }): any;

let validationGroup = "SettingsFormValidatonGroup";

interface State {
    app: Controls
};

export class Controls extends React.Component<{}, State> {

    state = {
        app: this
    };

    componentDidMount() {
        BridgeEvents.subscribeNewSubmit((submitId) => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <ControlTabs />
        );
    }
}

function onFocusReplaceDefaultValidationPopup(e: any, elemId: string) {
    let el = e.currentTarget as HTMLElement;
    if (el.dataset["hasReplacedValidationPopup"] !== "true") {
        replaceDefaultValidationPopup(elemId);
        el.dataset["hasReplacedValidationPopup"] = "true";
    }
};

function replaceDefaultValidationPopup(id: string) {
    $(`#${id}`)[0]
        .addEventListener("invalid", (event: any) => {
            $(event.target).data("toggle", "popover");
            $(event.target).data("trigger", "manual");
            $(event.target).data("placement", "left");
            //$(event.target).data("container","body");
            $(event.target).data("content", event.target.validationMessage);
            $(event.target).popover("show");
            window.setTimeout(() => {
                $(event.target).popover("hide");
                $(event.target).popover("destroy");
            }, 5000);
            $(event.target).focus();

            event.preventDefault();
        }
        );
}

function createCustomValidationPopup(el: HTMLElement, message: string) {
    $(el)[0].validationMessage = message;

    $(el).data("toggle", "popover");
    $(el).data("trigger", "manual");
    $(el).data("placement", "left");
    //$(el).data("container","body");
    $(el).data("content", message);
    $(el).popover("show");
    window.setTimeout(() => {
        $(el).popover("hide");
        $(el).popover("destroy");
    }, 5000);
    $(el).focus();
}

interface SettingsProps {
    initialData: CompInfo,
    submitId: number,
    parent: ControlTabs,
}

interface ExpandedPanels {
    activeAtomsResidues: boolean,
    activeAtomsResiduesAdvanced: boolean,
    cavityParameters: boolean,
    channelParameters: boolean,
    channelParametersAdvanced: boolean,
    selection: boolean
}

interface SettingsState {
    pdbid: string,
    computationId: string,
    moleFormData: MoleFormData,
    poresFormData: PoresFormData,
    mode: "Channels" | "Pores",
    expandedPanels: ExpandedPanels
};
export class Settings extends React.Component<SettingsProps, SettingsState> {

    state: SettingsState = {
        moleFormData: this.getMoleDefaultValues(),
        poresFormData: this.getPoresDefaultValues(),
        pdbid: this.props.initialData.PdbId,
        computationId: this.props.initialData.ComputationId,
        mode: "Channels",
        expandedPanels: {
            activeAtomsResidues: true,
            activeAtomsResiduesAdvanced: false,
            cavityParameters: false,
            channelParameters: false,
            channelParametersAdvanced: false,
            selection: true
        }
    }

    getMoleDefaultValues() {
        let data = new MoleFormData();

        data.setIgnoreHETATMs(true);
        data.setIgnoreHydrogens(false);
        //data.setQueryFilter("");
        data.setReadAllModels(false);
        //data.setIgnoredResidues([]);
        //data.setSpecificChains("");
        data.setProbeRadius(5);
        data.setInteriorThreshold(1.1);
        data.setOriginRadius(5);
        data.setSurfaceCoverRadius(10);
        data.setWeightFunction("VoronoiScale");
        data.setMergePores(false);
        data.setAutomaticPores(false);
        data.setBottleneckRadius(1.2);
        data.setBottleneckTolerance(3);
        data.setMaxTunnelSimilarity(0.7);

        return data;
    }

    getPoresDefaultValues() {
        let data = new PoresFormData();

        data.setBetaStructure(false);
        data.setMembraneRegion(false);
        //data.setSpecificChains("");
        data.setProbeRadius(13);
        data.setInteriorThreshold(0.8);

        return data;
    }

    handleSubmitPromise(promise: any) {
        promise
            .then((result: any) => {
                if (result.Status === "Error") {
                    let state = this.props.parent.state;
                    state.canSubmit = true;
                    this.props.parent.setState(state);

                    BridgeEvents.invokeNotifyMessage({
                        messageType: "Danger",
                        message: result.ErrorMsg
                    })
                }
                else {
                    fakeRedirect(result.ComputationId, String(result.SubmitId));
                    // LiteMol.Example.Channels.State.removeChannelsData(Instances.getPlugin());

                    Provider.get(result.ComputationId, ((compId: string, info: CompInfo) => {
                        JobStatus.Watcher.registerOnChangeHandler(result.ComputationId, result.SubmitId, (status) => {
                            if (checkCanSubmit(status.Status)) {
                                BridgeEvents.invokeToggleLoadingScreen({
                                    message: "",
                                    visible: false
                                });

                                let state = this.props.parent.state;
                                state.canSubmit = true;
                                this.props.parent.setState(state);
                            }
                        }, (err) => {
                            BridgeEvents.invokeNotifyMessage({
                                messageType: "Danger",
                                message: "Job status cannot be tracked. Please try to refresh the page."
                            })
                        })

                        let state = this.props.parent.state;
                        state.data = info;
                        this.props.parent.setState(state);

                        BridgeEvents.invokeNewSubmit(Number(result.SubmitId));
                        BridgeEvents.invokeChangeSubmitId(Number(result.SubmitId));

                    }).bind(this), true);

                    BridgeEvents.invokeToggleLoadingScreen({
                        message: "Submited job in progress...",
                        visible: true
                    });
                }
            })
            .catch((err: any) => {
                let state = this.props.parent.state;
                state.canSubmit = true;
                this.props.parent.setState(state);

                if (CommonOptions.DEBUG_MODE)
                    console.log(err);
                BridgeEvents.invokeNotifyMessage({
                    messageType: "Danger",
                    message: "Job submit was not completed succesfully! Please try again later."
                })
            })
    }

    componentDidMount() {
        FormEvents.attachOnSubmitEventHandler((formGroup) => {
            if (formGroup !== validationGroup) {
                return;
            }
            let promise;

            if (this.state.mode === "Channels") {
                gtag('event', 'Submit', { 'event_category': 'MOLE' });
                promise = ApiService.submitMoleJob(this.state.computationId, this.state.moleFormData.getPackage())
            }
            else {
                gtag('event', 'Submit', { 'event_category': 'Pores' });
                promise = ApiService.submitPoresJob(this.state.computationId, this.state.poresFormData.getPackage())
            }

            this.handleSubmitPromise(promise);
        })

        BridgeEvents.subscribeOnReSubmit((promise) => {
            this.handleSubmitPromise(promise);
        })

        FormEvents.attachOnClearEventHandler((formGroup) => {
            if (formGroup !== validationGroup + "_form") {
                return;
            }
            ValidationState.reset(validationGroup);
            let s = this.state;
            let mode = s.mode;
            s.mode = (this.state.mode === "Channels") ? "Pores" : "Channels"    //setting mode to oposite to trigger update
            s.moleFormData = this.getMoleDefaultValues();
            s.poresFormData = this.getPoresDefaultValues();
            this.setState(s, () => {
                FormEvents.invokeOnClear(validationGroup);

                let s2 = this.state;
                s2.mode = mode; //setting back correct mode
                this.setState(s2);
            });
        })

        BridgeEvents.subscribeCopyParameters((params: CopyParametersParams) => {
            let s1 = this.props.parent.state;
            this.props.parent.setState({
                activeTabIdx: 0,
                submitId: s1.submitId,
                canSubmit: s1.canSubmit,
                data: s1.data,
                err: s1.err
            }, () => {
                this.setState({
                    computationId: this.state.computationId,
                    pdbid: this.state.pdbid,
                    moleFormData: this.state.moleFormData,
                    poresFormData: this.state.poresFormData,
                    mode: (params.mode === "mole") ? "Pores" : "Channels", //Change to oposite mode to final desired mode to trigger subcomponent re-render
                    expandedPanels: this.state.expandedPanels
                }, () => {
                    this.setState({
                        computationId: this.state.computationId,
                        pdbid: this.state.pdbid,
                        moleFormData: (params.mode === "mole" && params.moleConfig !== null) ? new MoleFormData(params.moleConfig) : this.getMoleDefaultValues(),
                        poresFormData: (params.mode === "pores" && params.poresConfig !== null) ? new PoresFormData(params.poresConfig) : this.getPoresDefaultValues(),
                        mode: (params.mode === "mole") ? "Channels" : "Pores", //Change to correct and final mode to trigger subcomponent re-render
                        expandedPanels: this.state.expandedPanels
                    })
                });
            });
        });
    }

    render() {
        let form = <div />;

        if (this.state.mode === "Channels") {
            // form = this.getMoleForm();
            form = this.getMoleFormNew();
        }
        else if (this.state.mode === "Pores") {
            form = this.getPoresForm();
        }

        return (
            <div>
                <div className="mode-switch-button-container">
                    <span className="btn-sm btn-primary mode-switch" onClick={(e) => {
                        let state = this.state;
                        state.mode = (this.state.mode === "Channels") ? "Pores" : "Channels";
                        this.setState(state);
                    }}>Switch to {(this.state.mode === "Channels") ? "Pore" : "Channels"} mode</span>
                </div>
                {form}
            </div>
        );
    }

    getPatternQueryHint() {
        return { link: "https://webchem.ncbr.muni.cz/Wiki/PatternQuery:UserManual", title: "See PatternQuery manual for help." }
    }

    getMoleFormNew() {
        if (this.state.moleFormData === null) {
            return <div />
        }

        let pdbid = this.state.pdbid;
        let data = this.state.moleFormData;
        return <div className="settings-form basic-settings">
            <h3>Channels</h3>
            <ControlGroup header='Active Atoms/Residues' initialExpanded={false}>
                <BoolControl name='Ignore HETATMs' param={ParamDefinition.Boolean(true, { label: 'Ignore HETATMs' })} value={valueOrDefault(data.getIgnoreHETATMs(), true)} onChange={(v) => {
                    let s = this.state;
                    if (s.moleFormData !== null) {
                        s.moleFormData.setIgnoreHETATMs(v.value);
                        this.setState(s);
                    }
                    (() => {
                        FormEvents.attachOnClearEventHandler((formGroup) => {
                            if (formGroup !== validationGroup) {
                                return;
                            }
                            s.moleFormData.setIgnoreHETATMs(true);
                        });
                    }).bind(v)();
                }}
                />
                <ControlGroup header='Advanced options'>
                    <BoolControl name='Ignore Hydrogens' param={ParamDefinition.Boolean(false, { label: 'Ignore Hydrogens' })} value={valueOrDefault(data.getIgnoreHydrogens(), false)} onChange={(v) => {
                        let s = this.state;
                        if (s.moleFormData !== null) {
                            s.moleFormData.setIgnoreHydrogens(v.value);
                            this.setState(s);
                        }
                        (() => {
                            FormEvents.attachOnClearEventHandler((formGroup) => {
                                if (formGroup !== validationGroup) {
                                    return;
                                }
                                s.moleFormData.setIgnoreHydrogens(false);
                            });
                        }).bind(v)();
                    }}
                    />
                    <TextControl name="Query Filter" param={ParamDefinition.Text('', { label: 'Query Filter', placeholder: 'Residues(\'GOL\')' })} value={valueOrDefault(data.getQueryFilter(), "")} onChange={(v) => {
                        let s = this.state;
                        if (s.moleFormData !== null) {
                            s.moleFormData.setQueryFilter(v.value);
                            this.setState(s);
                        }
                        (() => {
                            FormEvents.attachOnClearEventHandler((formGroup) => {
                                if (formGroup !== validationGroup) {
                                    return;
                                }
                                s.moleFormData.setQueryFilter('');
                            });
                        }).bind(v)();
                    }} />
                    <BoolControl name='Read All Models' param={ParamDefinition.Boolean(false, { label: 'Read All Models' })} value={valueOrDefault(data.getReadAllModels(), false)} onChange={(v) => {
                        let s = this.state;
                        if (s.moleFormData !== null) {
                            s.moleFormData.setReadAllModels(v.value);
                            this.setState(s);
                        }
                        (() => {
                            FormEvents.attachOnClearEventHandler((formGroup) => {
                                if (formGroup !== validationGroup) {
                                    return;
                                }
                                s.moleFormData.setReadAllModels(false);
                            });
                        }).bind(v)();
                    }}
                    />
                    <TextControl name="Ignored Residues" param={ParamDefinition.Text('', { label: 'Ignored Residues', placeholder: 'A 69, A 386, ...' })} value={flattenResidues(valueOrDefault(data.getIgnoredResidues(), ""))} onChange={(v) => {
                        let s = this.state;
                        if (s.moleFormData !== null) {
                            s.moleFormData.setIgnoredResidues(parseResidues(v.value));
                            this.setState(s);
                        }
                        (() => {
                            FormEvents.attachOnClearEventHandler((formGroup) => {
                                if (formGroup !== validationGroup) {
                                    return;
                                }
                                s.moleFormData.setIgnoredResidues(parseResidues(''));
                            });
                        }).bind(v)();
                    }} />
                    <TextControl name="Specific Chains" param={ParamDefinition.Text('', { label: 'Specific Chains', placeholder: 'A, B, ...' })} value={valueOrDefault(data.getSpecificChains(), "")} onChange={(v) => {
                        let s = this.state;
                        if (s.moleFormData !== null) {
                            s.moleFormData.setSpecificChains(v.value);
                            this.setState(s);
                        }
                        (() => {
                            FormEvents.attachOnClearEventHandler((formGroup) => {
                                if (formGroup !== validationGroup) {
                                    return;
                                }
                                s.moleFormData.setSpecificChains('');
                            });
                        }).bind(v)();
                    }} />
                </ControlGroup>
            </ControlGroup>
            <ControlGroup header='Cavity Parameters'>
                <NumberRangeControl name="Probe Radius" param={ParamDefinition.Numeric(5, { min: 1.4, max: 45, step: 0.01 })} value={valueOrDefault(data.getProbeRadius(), 5)} onChange={(v) => {
                    let s = this.state;
                    if (s.moleFormData !== null) {
                        s.moleFormData.setProbeRadius(v.value);
                        this.setState(s);
                    }
                    (() => {
                        FormEvents.attachOnClearEventHandler((formGroup) => {
                            if (formGroup !== validationGroup) {
                                return;
                            }
                            s.moleFormData.setProbeRadius(5);
                        });
                    }).bind(v)();
                }} />
                <NumberRangeControl name="Interior Treshold" param={ParamDefinition.Numeric(1.1, { min: 0.3, max: 3, step: 0.01 })} value={valueOrDefault(data.getInteriorThreshold(), 1.1)} onChange={(v) => {
                    let s = this.state;
                    if (s.moleFormData !== null) {
                        s.moleFormData.setInteriorThreshold(v.value);
                        this.setState(s);
                    }
                    (() => {
                        FormEvents.attachOnClearEventHandler((formGroup) => {
                            if (formGroup !== validationGroup) {
                                return;
                            }
                            s.moleFormData.setInteriorThreshold(5);
                        });
                    }).bind(v)();
                }} />
            </ControlGroup>
            <ControlGroup header='Channel Parameters'>
                <NumberRangeControl name="Origin Radius" param={ParamDefinition.Numeric(5, { min: 0.1, max: 10, step: 0.05 })} value={valueOrDefault(data.getOriginRadius(), 5)} onChange={(v) => {
                    let s = this.state;
                    if (s.moleFormData !== null) {
                        s.moleFormData.setOriginRadius(v.value);
                        this.setState(s);
                    }
                    (() => {
                        FormEvents.attachOnClearEventHandler((formGroup) => {
                            if (formGroup !== validationGroup) {
                                return;
                            }
                            s.moleFormData.setOriginRadius(5);
                        });
                    }).bind(v)();
                }} />
                <NumberRangeControl name="Surface Cover Radius" param={ParamDefinition.Numeric(10, { min: 5, max: 20, step: 0.5 })} value={valueOrDefault(data.getSurfaceCoverRadius(), 10)} onChange={(v) => {
                    let s = this.state;
                    if (s.moleFormData !== null) {
                        s.moleFormData.setSurfaceCoverRadius(v.value);
                        this.setState(s);
                    }
                    (() => {
                        FormEvents.attachOnClearEventHandler((formGroup) => {
                            if (formGroup !== validationGroup) {
                                return;
                            }
                            s.moleFormData.setSurfaceCoverRadius(5);
                        });
                    }).bind(v)();
                }} />
                <SelectControl
                    name="Weight Function"
                    param={ParamDefinition.Select(valueOrDefault(data.getWeightFunction(), "VoronoiScale"), ParamDefinition.arrayToOptions(WeightFunctions.getFunctions()))}
                    value={valueOrDefault(data.getWeightFunction(), "VoronoiScale")}
                    onChange={(v) => {
                        let s = this.state;
                        if (s.moleFormData !== null) {
                            s.moleFormData.setWeightFunction(v.value);
                            this.setState(s);
                        }
                        (() => {
                            FormEvents.attachOnClearEventHandler((formGroup) => {
                                if (formGroup !== validationGroup) {
                                    return;
                                }
                                s.moleFormData.setWeightFunction("VoronoiScale");
                            });
                        }).bind(v)();
                    }} />
                <BoolControl name='Merge Pores' param={ParamDefinition.Boolean(false, { label: 'Merge Pores' })} value={valueOrDefault(data.getMergePores(), false)} onChange={(v) => {
                    let s = this.state;
                    if (s.moleFormData !== null) {
                        s.moleFormData.setMergePores(v.value);
                        this.setState(s);
                    }
                    (() => {
                        FormEvents.attachOnClearEventHandler((formGroup) => {
                            if (formGroup !== validationGroup) {
                                return;
                            }
                            s.moleFormData.setMergePores(false);
                        });
                    }).bind(v)();
                }}
                />
                <BoolControl name='Automatic Pores' param={ParamDefinition.Boolean(false, { label: 'Automatic Pores' })} value={valueOrDefault(data.getAutomaticPores(), false)} onChange={(v) => {
                    let s = this.state;
                    if (s.moleFormData !== null) {
                        s.moleFormData.setAutomaticPores(v.value);
                        this.setState(s);
                    }
                    (() => {
                        FormEvents.attachOnClearEventHandler((formGroup) => {
                            if (formGroup !== validationGroup) {
                                return;
                            }
                            s.moleFormData.setAutomaticPores(false);
                        });
                    }).bind(v)();
                }}
                />
                <ControlGroup header='Advanced options'>
                    <NumberRangeControl name="Bottleneck Radius" param={ParamDefinition.Numeric(1.2, { min: 0, max: 5, step: 0.01 })} value={valueOrDefault(data.getBottleneckRadius(), 1.2)} onChange={(v) => {
                        let s = this.state;
                        if (s.moleFormData !== null) {
                            s.moleFormData.setBottleneckRadius(v.value);
                            this.setState(s);
                        }
                        (() => {
                            FormEvents.attachOnClearEventHandler((formGroup) => {
                                if (formGroup !== validationGroup) {
                                    return;
                                }
                                s.moleFormData.setBottleneckRadius(5);
                            });
                        }).bind(v)();
                    }} />
                    <NumberRangeControl name="Bottleneck Tolerance" param={ParamDefinition.Numeric(3, { min: 0, max: 5, step: 0.1 })} value={valueOrDefault(data.getBottleneckTollerance(), 3)} onChange={(v) => {
                        let s = this.state;
                        if (s.moleFormData !== null) {
                            s.moleFormData.setBottleneckTolerance(v.value);
                            this.setState(s);
                        }
                        (() => {
                            FormEvents.attachOnClearEventHandler((formGroup) => {
                                if (formGroup !== validationGroup) {
                                    return;
                                }
                                s.moleFormData.setBottleneckTolerance(5);
                            });
                        }).bind(v)();
                    }} />
                    <NumberRangeControl name="Max Tunnel Similarity" param={ParamDefinition.Numeric(0.7, { min: 0, max: 1, step: 0.05 })} value={valueOrDefault(data.getMaxTunnelSimilarity(), 0.7)} onChange={(v) => {
                        let s = this.state;
                        if (s.moleFormData !== null) {
                            s.moleFormData.setMaxTunnelSimilarity(v.value);
                            this.setState(s);
                        }
                        (() => {
                            FormEvents.attachOnClearEventHandler((formGroup) => {
                                if (formGroup !== validationGroup) {
                                    return;
                                }
                                s.moleFormData.setMaxTunnelSimilarity(5);
                            });
                        }).bind(v)();
                    }} />
                </ControlGroup>
            </ControlGroup>
            <ControlGroup header='Selection'>
                <StartingPointBox label="Starting Point" tooltip={TooltipText.get("startingPoint")} defaultItems={this.state.moleFormData.getStartingPoints()} noDataText={"No starting points selected..."} onChange={(v) => {
                    let s = this.state;
                    if (s.moleFormData !== null) {
                        s.moleFormData.setStartingPoints(v);
                    }
                }} formGroup={validationGroup} extraClearGroup={`${validationGroup}/selection`} allowPatternQuery={true} />
                <StartingPointBox label="End Point" tooltip={TooltipText.get("endPoint")} defaultItems={this.state.moleFormData.getEndingPoints()} noDataText={"No end points selected..."} onChange={(v) => {
                    let s = this.state;
                    if (s.moleFormData !== null) {
                        s.moleFormData.setEndPoints(v);
                    }
                }} formGroup={validationGroup} extraClearGroup={`${validationGroup}/selection`} allowPatternQuery={false} />
            </ControlGroup>
        </div>
    }

    getMoleForm() {
        return <></>
        // if (this.state.moleFormData === null) {
        //     return <div />
        // }

        // let pdbid = this.state.pdbid;
        // let data = this.state.moleFormData;
        // return <div className="settings-form basic-settings">
        //     <h3>Channels</h3>

        //     <LMControlWrapper controls={[
        //         <ControlGroup label="Active Atoms/Residues" tooltip="" controls={[
        //             <CheckBox label="Ignore HETATMs" defaultValue={valueOrDefault(data.getIgnoreHETATMs(), true)} tooltip={TooltipText.get("ignoreAllHetatm")} onChange={(v) => {
        //                 let s = this.state;
        //                 if (s.moleFormData !== null) {
        //                     s.moleFormData.setIgnoreHETATMs(v);
        //                 }
        //             }} onMount={(control) => {
        //                 (() => {
        //                     FormEvents.attachOnClearEventHandler((formGroup) => {
        //                         if (formGroup !== validationGroup) {
        //                             return;
        //                         }
        //                         control.reset();
        //                     });
        //                 }).bind(control)();
        //             }} />,
        //             <ControlGroup label="Advanced options" tooltip="" controls={[
        //                 <CheckBox label="Ignore Hydrogens" defaultValue={valueOrDefault(data.getIgnoreHydrogens(), false)} tooltip={TooltipText.get("ignoreHydrogens")} onChange={(v) => {
        //                     let s = this.state;
        //                     if (s.moleFormData !== null) {
        //                         s.moleFormData.setIgnoreHydrogens(v);
        //                     }
        //                 }} onMount={(control) => {
        //                     (() => {
        //                         FormEvents.attachOnClearEventHandler((formGroup) => {
        //                             if (formGroup !== validationGroup) {
        //                                 return;
        //                             }
        //                             control.reset();
        //                         });
        //                     }).bind(control)();
        //                 }} />,
        //                 <TextBoxWithHelp label="Query Filter" tooltip={TooltipText.get("queryFilter")} placeholder="Residues('GOL')" hint={this.getPatternQueryHint()} defaultValue={valueOrDefault(data.getQueryFilter(), "")} onChange={(v) => {
        //                     let s = this.state;
        //                     if (s.moleFormData !== null) {
        //                         s.moleFormData.setQueryFilter(v);
        //                     }
        //                 }} onMount={(control) => {
        //                     (() => {
        //                         FormEvents.attachOnClearEventHandler((formGroup) => {
        //                             if (formGroup !== validationGroup) {
        //                                 return;
        //                             }
        //                             control.reset();
        //                         });
        //                     }).bind(control)();
        //                 }} validate={validatePatternQuery} validationGroup={validationGroup} />,
        //                 <CheckBox label="Read All Models" defaultValue={valueOrDefault(data.getReadAllModels(), false)} tooltip={TooltipText.get("readAllModels")} onChange={(v) => {
        //                     let s = this.state;
        //                     if (s.moleFormData !== null) {
        //                         s.moleFormData.setReadAllModels(v);
        //                     }
        //                 }} onMount={(control) => {
        //                     (() => {
        //                         FormEvents.attachOnClearEventHandler((formGroup) => {
        //                             if (formGroup !== validationGroup) {
        //                                 return;
        //                             }
        //                             control.reset();
        //                         });
        //                     }).bind(control)();
        //                 }} />,
        //                 <TextBox label="Ignored Residues" tooltip={TooltipText.get("nonActiveResidues")} placeholder="A 69, A 386, ..." defaultValue={flattenResidues(valueOrDefault(data.getIgnoredResidues(), ""))} onChange={(v) => {
        //                     let s = this.state;
        //                     if (s.moleFormData !== null) {
        //                         s.moleFormData.setIgnoredResidues(parseResidues(v));
        //                     }
        //                 }} onMount={(control) => {
        //                     (() => {
        //                         FormEvents.attachOnClearEventHandler((formGroup) => {
        //                             if (formGroup !== validationGroup) {
        //                                 return;
        //                             }
        //                             control.reset();
        //                         });
        //                     }).bind(control)();
        //                 }} validate={validateResidueSimpleArray} validationGroup={validationGroup} />,
        //                 <TextBox label="Specific Chains" tooltip={TooltipText.get("specificChains")} placeholder="A, B, ..." defaultValue={valueOrDefault(data.getSpecificChains(), "")} onChange={(v) => {
        //                     let s = this.state;
        //                     if (s.moleFormData !== null) {
        //                         s.moleFormData.setSpecificChains(v);
        //                     }
        //                 }} onMount={(control) => {
        //                     (() => {
        //                         FormEvents.attachOnClearEventHandler((formGroup) => {
        //                             if (formGroup !== validationGroup) {
        //                                 return;
        //                             }
        //                             control.reset();
        //                         });
        //                     }).bind(control)();
        //                 }} validate={validateChainsArray} validationGroup={validationGroup} />
        //             ]} expanded={this.state.expandedPanels.activeAtomsResiduesAdvanced} onChange={(e) => {
        //                 let s = this.state;
        //                 s.expandedPanels.activeAtomsResiduesAdvanced = e;
        //                 this.setState(s);
        //             }} />,
        //         ]} expanded={this.state.expandedPanels.activeAtomsResidues} onChange={(e) => {
        //             let s = this.state;
        //             s.expandedPanels.activeAtomsResidues = e;
        //             if (e === false) {
        //                 s.expandedPanels.activeAtomsResiduesAdvanced = false;
        //             }
        //             this.setState(s);
        //         }} />,
        //         <ControlGroup label="Cavity Parameters" tooltip="" controls={[
        //             <NumberBox label="Probe Radius" tooltip={TooltipText.get("probeRadius")} min={1.4} max={45} defaultValue={valueOrDefault(data.getProbeRadius(), 5)} step={0.01} onChange={(v) => {
        //                 let s = this.state;
        //                 if (s.moleFormData !== null) {
        //                     s.moleFormData.setProbeRadius(Number(v).valueOf());
        //                 }
        //             }} onMount={(control) => {
        //                 (() => {
        //                     FormEvents.attachOnClearEventHandler((formGroup) => {
        //                         if (formGroup !== validationGroup) {
        //                             return;
        //                         }
        //                         control.reset();
        //                     });
        //                 }).bind(control)();
        //             }} />,
        //             <NumberBox label="Interior Treshold" tooltip={TooltipText.get("interiorTreshold")} min={0.3} max={3} defaultValue={valueOrDefault(data.getInteriorThreshold(), 1.1)} step={0.01} onChange={(v) => {
        //                 let s = this.state;
        //                 if (s.moleFormData !== null) {
        //                     s.moleFormData.setInteriorThreshold(Number(v).valueOf());
        //                 }
        //             }} onMount={(control) => {
        //                 (() => {
        //                     FormEvents.attachOnClearEventHandler((formGroup) => {
        //                         if (formGroup !== validationGroup) {
        //                             return;
        //                         }
        //                         control.reset();
        //                     });
        //                 }).bind(control)();
        //             }} />
        //         ]} expanded={this.state.expandedPanels.cavityParameters} onChange={(e) => {
        //             let s = this.state;
        //             s.expandedPanels.cavityParameters = e;
        //             this.setState(s);
        //         }} />,
        //         <ControlGroup label="Channel Parameters" tooltip="" controls={[
        //             <NumberBox label="Origin Radius" tooltip={TooltipText.get("originRadius")} min={0.1} max={10} defaultValue={valueOrDefault(data.getOriginRadius(), 5)} step={0.05} onChange={(v) => {
        //                 let s = this.state;
        //                 if (s.moleFormData !== null) {
        //                     s.moleFormData.setOriginRadius(Number(v).valueOf());
        //                 }
        //             }} onMount={(control) => {
        //                 (() => {
        //                     FormEvents.attachOnClearEventHandler((formGroup) => {
        //                         if (formGroup !== validationGroup) {
        //                             return;
        //                         }
        //                         control.reset();
        //                     });
        //                 }).bind(control)();
        //             }} />,
        //             <NumberBox label="Surface Cover Radius" tooltip={TooltipText.get("surfaceCoverRadius")} min={5} max={20} defaultValue={valueOrDefault(data.getSurfaceCoverRadius(), 10)} step={0.5} onChange={(v) => {
        //                 let s = this.state;
        //                 if (s.moleFormData !== null) {
        //                     s.moleFormData.setSurfaceCoverRadius(Number(v).valueOf());
        //                 }
        //             }} onMount={(control) => {
        //                 (() => {
        //                     FormEvents.attachOnClearEventHandler((formGroup) => {
        //                         if (formGroup !== validationGroup) {
        //                             return;
        //                         }
        //                         control.reset();
        //                     });
        //                 }).bind(control)();
        //             }} />,
        //             <ComboBox label="Weight Function" tooltip={TooltipText.get("tunnelWeightFunction")} items={WeightFunctions.get().map((val, idx, arr) => { return new ComboBoxItem(val.value, val.label) })} selectedValue={valueOrDefault(data.getWeightFunction(), "VoronoiScale")} onChange={(v) => {
        //                 let s = this.state;
        //                 if (s.moleFormData !== null) {
        //                     s.moleFormData.setWeightFunction(v);
        //                 }
        //             }} onMount={(control) => {
        //                 (() => {
        //                     FormEvents.attachOnClearEventHandler((formGroup) => {
        //                         if (formGroup !== validationGroup) {
        //                             return;
        //                         }
        //                         control.reset();
        //                     });
        //                 }).bind(control)();
        //             }} />,
        //             <CheckBox label="Merge Pores" defaultValue={valueOrDefault(data.getMergePores(), false)} tooltip={TooltipText.get("mergePores")} onChange={(v) => {
        //                 let s = this.state;
        //                 if (s.moleFormData !== null) {
        //                     s.moleFormData.setMergePores(v);
        //                 }
        //             }} onMount={(control) => {
        //                 (() => {
        //                     FormEvents.attachOnClearEventHandler((formGroup) => {
        //                         if (formGroup !== validationGroup) {
        //                             return;
        //                         }
        //                         control.reset();
        //                     });
        //                 }).bind(control)();
        //             }} />,
        //             <CheckBox label="Automatic Pores" defaultValue={valueOrDefault(data.getAutomaticPores(), false)} tooltip={TooltipText.get("automaticPores")} onChange={(v) => {
        //                 let s = this.state;
        //                 if (s.moleFormData !== null) {
        //                     s.moleFormData.setAutomaticPores(v);
        //                 }
        //             }} onMount={(control) => {
        //                 (() => {
        //                     FormEvents.attachOnClearEventHandler((formGroup) => {
        //                         if (formGroup !== validationGroup) {
        //                             return;
        //                         }
        //                         control.reset();
        //                     });
        //                 }).bind(control)();
        //             }} />,
        //             <ControlGroup label="Advanced options" tooltip="" controls={[
        //                 <NumberBox label="Bottleneck Radius" tooltip={TooltipText.get("bottleneckRadius")} min={0} max={5} defaultValue={valueOrDefault(data.getBottleneckRadius(), 1.2)} step={0.01} onChange={(v) => {
        //                     let s = this.state;
        //                     if (s.moleFormData !== null) {
        //                         s.moleFormData.setBottleneckRadius(Number(v).valueOf());
        //                     }
        //                 }} onMount={(control) => {
        //                     (() => {
        //                         FormEvents.attachOnClearEventHandler((formGroup) => {
        //                             if (formGroup !== validationGroup) {
        //                                 return;
        //                             }
        //                             control.reset();
        //                         });
        //                     }).bind(control)();
        //                 }} />,
        //                 <NumberBox label="Bottleneck Tolerance" tooltip={TooltipText.get("bottleneckTolerance")} min={0} max={5} defaultValue={valueOrDefault(data.getBottleneckTollerance(), 3.0)} step={0.1} onChange={(v) => {
        //                     let s = this.state;
        //                     if (s.moleFormData !== null) {
        //                         s.moleFormData.setBottleneckTolerance(Number(v).valueOf());
        //                     }
        //                 }} onMount={(control) => {
        //                     (() => {
        //                         FormEvents.attachOnClearEventHandler((formGroup) => {
        //                             if (formGroup !== validationGroup) {
        //                                 return;
        //                             }
        //                             control.reset();
        //                         });
        //                     }).bind(control)();
        //                 }} />,
        //                 <NumberBox label="Max Tunnel Similarity" tooltip={TooltipText.get("maxTunnelSimilarity")} min={0} max={1} defaultValue={valueOrDefault(data.getMaxTunnelSimilarity(), 0.7)} step={0.05} onChange={(v) => {
        //                     let s = this.state;
        //                     if (s.moleFormData !== null) {
        //                         s.moleFormData.setMaxTunnelSimilarity(Number(v));
        //                     }
        //                 }} onMount={(control) => {
        //                     (() => {
        //                         FormEvents.attachOnClearEventHandler((formGroup) => {
        //                             if (formGroup !== validationGroup) {
        //                                 return;
        //                             }
        //                             control.reset();
        //                         });
        //                     }).bind(control)();
        //                 }} />
        //             ]} expanded={this.state.expandedPanels.channelParametersAdvanced} onChange={(e) => {
        //                 let s = this.state;
        //                 s.expandedPanels.channelParametersAdvanced = e;
        //                 this.setState(s);
        //             }} />
        //         ]} expanded={this.state.expandedPanels.channelParameters} onChange={(e) => {
        //             let s = this.state;
        //             s.expandedPanels.channelParameters = e;
        //             if (e === false) {
        //                 s.expandedPanels.channelParametersAdvanced = false;
        //             }
        //             this.setState(s);
        //         }} />,
        //         <ControlGroup label="Selection" tooltip="" controls={[
        //             <StartingPointBox label="Starting Point" tooltip={TooltipText.get("startingPoint")} defaultItems={this.state.moleFormData.getStartingPoints()} noDataText={"No starting points selected..."} onChange={(v) => {
        //                 let s = this.state;
        //                 if (s.moleFormData !== null) {
        //                     s.moleFormData.setStartingPoints(v);
        //                 }
        //             }} formGroup={validationGroup} extraClearGroup={`${validationGroup}/selection`} allowPatternQuery={true} />,
        //             <StartingPointBox label="End Point" tooltip={TooltipText.get("endPoint")} defaultItems={this.state.moleFormData.getEndingPoints()} noDataText={"No end points selected..."} onChange={(v) => {
        //                 let s = this.state;
        //                 if (s.moleFormData !== null) {
        //                     s.moleFormData.setEndPoints(v);
        //                 }
        //             }} formGroup={validationGroup} extraClearGroup={`${validationGroup}/selection`} allowPatternQuery={false} />,
        //         ]} expanded={this.state.expandedPanels.selection} onChange={(e) => {
        //             let s = this.state;
        //             s.expandedPanels.selection = e;
        //             this.setState(s);
        //         }} />
        //     ]} />
        // </div>
    }

    getPoresForm() {
        if (this.state.poresFormData === null) {
            return <div />
        }

        let data = this.state.poresFormData;
        let chains = data.getSpecificChains();
        if (chains === null) {
            chains = "";
        }

        let pdbid = this.state.pdbid;

        return <div className="settings-form basic-settings pores">
            <h3>Pores</h3>
            <BoolControl name='Beta Structure' param={ParamDefinition.Boolean(true, { label: 'Beta Structure' })} value={data.getBetaStructure()} onChange={(v) => {
                let s = this.state;
                if (s.poresFormData !== null) {
                    s.poresFormData.setBetaStructure(v.value);
                    this.setState(s);
                }
            }}
            />
            <BoolControl name='Membrane Region' param={ParamDefinition.Boolean(true, { label: 'Membrane Region' })} value={data.getMembraneRegion()} onChange={(v) => {
                let s = this.state;
                if (s.poresFormData !== null) {
                    s.poresFormData.setMembraneRegion(v.value);
                    this.setState(s);
                }
            }}
            />
            <TextControl name="Specific Chains" param={ParamDefinition.Text('', { label: 'Specific Chains', placeholder: 'A, B, ...' })} value={data.getSpecificChains() ?? ""} onChange={(v) => {
                let s = this.state;
                //TODO probably validate here
                if (s.poresFormData !== null) {
                    s.poresFormData.setSpecificChains(v.value);
                    this.setState(s);
                }
            }} />
            <NumberRangeControl name="Probe Radius" param={ParamDefinition.Numeric(13, { min: 1.4, max: 45, step: 0.01 })} value={valueOrDefault(data.getProbeRadius(), 13)} onChange={(v) => {
                let s = this.state;
                if (s.poresFormData !== null) {
                    s.poresFormData.setProbeRadius(v.value);
                    this.setState(s);
                }
                (() => {
                    FormEvents.attachOnClearEventHandler((formGroup) => {
                        if (formGroup !== validationGroup) {
                            return;
                        }
                        s.poresFormData.setProbeRadius(13);
                    });
                }).bind(v)();
            }} />
            <NumberRangeControl name="Interior Treshold" param={ParamDefinition.Numeric(0.8, { min: 0.3, max: 3, step: 0.01 })} value={valueOrDefault(data.getInteriorThreshold(), 0.8)} onChange={(v) => {
                let s = this.state;
                if (s.poresFormData !== null) {
                    s.poresFormData.setInteriorThreshold(v.value);
                    this.setState(s);
                }
                (() => {
                    FormEvents.attachOnClearEventHandler((formGroup) => {
                        if (formGroup !== validationGroup) {
                            return;
                        }
                        s.poresFormData.setInteriorThreshold(0.8);
                    });
                }).bind(v)();
            }} />
        </div>
        //     <LMControlWrapper controls={[
        //         <CheckBox label="Beta Structure" defaultValue={data.getBetaStructure()} tooltip={TooltipText.get("poresIsBetaStructure")} onChange={(val) => {
        //             if (this.state.poresFormData !== null) {
        //                 this.state.poresFormData.setBetaStructure(val);
        //             }
        //         }} />,
        //         <CheckBox label="Membrane Region" defaultValue={data.getMembraneRegion()} tooltip={TooltipText.get("poresInMembrane")} onChange={(val) => {
        //             if (this.state.poresFormData !== null) {
        //                 this.state.poresFormData.setMembraneRegion(val);
        //             }
        //         }} />,
        //         <TextBox label="Specific Chains" defaultValue={chains} tooltip={TooltipText.get("chains")} placeholder="A, B, ..." validate={validateChainsArray} validationGroup={validationGroup} onChange={(val) => {
        //             if (this.state.poresFormData !== null) {
        //                 this.state.poresFormData.setSpecificChains(val);
        //             }
        //         }} />,
        //         <NumberBox label="Probe Radius" tooltip={TooltipText.get("probeRadius")} min={1.4} max={45} defaultValue={valueOrDefault(data.getProbeRadius(), 13)} step={0.01} onChange={(v) => {
        //             let s = this.state;
        //             if (s.poresFormData !== null) {
        //                 s.poresFormData.setProbeRadius(Number(v).valueOf());
        //             }
        //         }} onMount={(control) => {
        //             (() => {
        //                 FormEvents.attachOnClearEventHandler((formGroup) => {
        //                     if (formGroup !== validationGroup) {
        //                         return;
        //                     }
        //                     control.reset();
        //                 });
        //             }).bind(control)();
        //         }} />,
        //         <NumberBox label="Interior Treshold" tooltip={TooltipText.get("poresInteriorTreshold")} min={0.3} max={3} defaultValue={valueOrDefault(data.getInteriorThreshold(), 0.8)} step={0.01} onChange={(v) => {
        //             let s = this.state;
        //             if (s.poresFormData !== null) {
        //                 s.poresFormData.setInteriorThreshold(Number(v).valueOf());
        //             }
        //         }} onMount={(control) => {
        //             (() => {
        //                 FormEvents.attachOnClearEventHandler((formGroup) => {
        //                     if (formGroup !== validationGroup) {
        //                         return;
        //                     }
        //                     control.reset();
        //                 });
        //             }).bind(control)();
        //         }} />
        //     ]} />

        // </div>
    }
}

function valueOrDefault(value: any | null, def: any) {
    return (value === null) ? def : value;
}

function getSubmissionIdx(compInfo: CompInfo, submitId: number): number | null {
    for (let idx = 0; idx < compInfo.Submissions.length; idx++) {
        if (String(compInfo.Submissions[idx].SubmitId) === String(submitId)) {
            return idx;
        }
    }
    return null;
}

interface SubmissionsProps {
    computationInfo: CompInfo,
    onResubmit: (info: CompInfo) => void
};
interface SubmissionsState {
    computationInfo: CompInfo | null,
    loading: boolean,
    channelsDBData: ChannelsDBChannels | null
};
export class Submissions extends React.Component<SubmissionsProps, SubmissionsState> {

    state: SubmissionsState = { computationInfo: null, loading: true, channelsDBData: null }
    private hasKillable = false;

    componentWillReceiveProps(nextProps: { computationInfo: CompInfo }) {
        this.prepareSubmissionData(nextProps.computationInfo);
    }

    private changePoresSubmissionChainsFormat(computationInfo: CompInfo) {
        let submissions = computationInfo.Submissions.map((v, i, a) => {
            if (v.PoresConfig !== void 0
                && v.PoresConfig.Chains !== void 0
                && v.PoresConfig.Chains !== void 0
                && v.PoresConfig.Chains !== null
                && Array.isArray(v.PoresConfig.Chains)) {
                v.PoresConfig.Chains = (v.PoresConfig.Chains as string[]).join(",");
            }

            return v;
        });

        computationInfo.Submissions = submissions;

        return computationInfo;
    }

    private prepareSubmissionData(computationInfo: CompInfo) {
        let state_ = this.state;
        state_.computationInfo = this.changePoresSubmissionChainsFormat(computationInfo);
        this.setState(state_);

        let hasKillable = false;

        if (computationInfo.PdbId !== void 0 && computationInfo.PdbId !== null && computationInfo.PdbId !== "") {
            ChannelsDBData.doWhenCached(computationInfo.PdbId)
                .then(() => {
                    ChannelsDBData.getChannelsData(computationInfo.PdbId)
                        .then(val => {
                            console.log(val);
                            let s = this.state;
                            s.channelsDBData = val;
                            this.setState(s);
                        })
                        .catch(err => {
                            console.log(err);
                        })
                })
                .catch(err => {
                    console.log(err);
                });
        }

        for (let submission of computationInfo.Submissions) {
            if (submission.Status !== "Initializing" && submission.Status !== "Running") {
                //Skip submission state check loop for submissions in stable and terminal state
                continue;
            }
            hasKillable = true;
            JobStatus.Watcher.registerOnChangeHandler(this.props.computationInfo.ComputationId, submission.SubmitId, (state) => {
                let oldStatus = submission.Status;

                if (oldStatus === void 0 || oldStatus !== state.Status) {
                    let s = this.state;
                    let currentCompInfo = s.computationInfo;
                    if (currentCompInfo === null) {
                        console.log(`Computation info was not initialized corectly.`);
                        return;
                    }
                    let subIdx = getSubmissionIdx(currentCompInfo, submission.SubmitId);
                    if (subIdx === null) {
                        console.log(`Submission with id'${submission.SubmitId}' not found.`);
                        return;
                    }
                    currentCompInfo.Submissions[subIdx].Status = state.Status;
                    s.computationInfo = currentCompInfo;
                    this.setState(s);
                    if (oldStatus !== void 0) {
                        let hasKillable_ = this.checkHasKillable(currentCompInfo);
                        if (this.hasKillable !== hasKillable_) {
                            this.hasKillable = hasKillable_;
                            BridgeEvents.invokeChangeHasKillable(hasKillable_);
                        }
                    }
                }
            }, (err) => {
                if (CommonOptions.DEBUG_MODE)
                    console.log(err);
            }
            );
        }
        this.hasKillable = hasKillable;

        let state = this.state;
        state.loading = false;
        this.setState(state);

        if (hasKillable) {
            BridgeEvents.invokeChangeHasKillable(hasKillable);
        }
    }

    private checkHasKillable(compInfo: CompInfo) {
        let hasKillable = false;
        for (let submission of compInfo.Submissions) {
            if (submission.Status === "Running") {
                hasKillable = true;
                return hasKillable;
            }
        }
        return hasKillable;
    }

    componentDidMount() {
        this.prepareSubmissionData(this.props.computationInfo);
    }

    render() {
        if (this.state.computationInfo !== null && !this.state.loading) {
            let submissions: JSX.Element[] = [];
            let submissionsData = this.state.computationInfo.Submissions;
            let submitId = 1;
            let isChannelsDBSelected = false;
            let params = getParameters();
            if (params !== null) {
                submitId = (params.isChannelsDB) ? -1 : params.submitId;
                isChannelsDBSelected = params.isChannelsDB;
            }

            if (this.state.channelsDBData !== null) {
                submissions.push(
                    <ChannelsDBSubmission pdbid={this.state.computationInfo.PdbId} isSelected={isChannelsDBSelected} computationId={this.props.computationInfo.ComputationId} />
                );
            }

            for (let s of submissionsData.sort((a, b) => {
                return a.SubmitId - b.SubmitId;
            })) {
                let stat = s.Status;

                submissions.push(
                    <Submission data={s} currentSubmitId={submitId} computationId={this.props.computationInfo.ComputationId} status={(stat === void 0) ? "Unknown" : stat} onResubmit={this.props.onResubmit} onCopy={(submitId: number) => {
                        for (let submission of this.props.computationInfo.Submissions) {
                            if (submission.SubmitId.toString() === submitId.toString()) {
                                BridgeEvents.invokeCopyParameters({
                                    mode: (isMoleJob(submission)) ? "mole" : "pores",
                                    moleConfig: submission.MoleConfig,
                                    poresConfig: submission.PoresConfig
                                });
                                return;
                            }
                        }
                    }} />
                );
            }

            if (submissions.length === 0) {
                return (
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <h4 className="panel-title">
                                No submissions found.
                            </h4>
                        </div>
                    </div>
                );
            }

            return (
                <div className="panel-group submissions">
                    {submissions}
                </div>
            );
        }
        else if (this.state.loading) {
            return (
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h4 className="panel-title">
                            No submissions data available.
                        </h4>
                    </div>
                </div>
            )
        }
        else {
            return (
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h4 className="panel-title">
                            Submissions data loading...
                        </h4>
                    </div>
                </div>
            )
        }
    }
}

function checkCanKill(status: ComputationStatus) {
    let result = false;
    switch (status as ComputationStatus) {
        case "Running":
            result = true;
            break;
    }
    return result;
}

function checkCanSubmit(status: ComputationStatus) {
    return !checkCanKill(status);
}

function checkCanDelete(status: ComputationStatus) {
    let result = false;
    switch (status as ComputationStatus) {
        case "Aborted":
        case "Error":
        case "FailedInitialization":
        case "Finished":
        case "Initialized":
            result = true;
            break;
        case "Running":
        case "Initializing":
            result = false;
            break;
    }
    return result;
}

function checkCanResubmit(status: ComputationStatus) {
    let result = false;
    switch (status as ComputationStatus) {
        case "Aborted":
        case "Error":
        case "FailedInitialization":
        case "Finished":
        case "Initialized":
            result = true;
            break;
        case "Running":
        case "Initializing":
        case "Deleted":
            result = false;
            break;
    }
    return result;
}

export class Submission extends React.Component<{ data: ServiceSubmission, computationId: string, status: string, currentSubmitId: number, onCopy: (submitId: number) => void, onResubmit: (info: CompInfo) => void }, {}> {

    componentDidMount() {
    }

    getMoleJob(data: ServiceSubmission) {
        return <div className="panel-body">
            <h4>Active Atoms/Residues</h4>
            Ignore Hydrogens: {(data.MoleConfig.Cavity === void 0) ? "False" : (data.MoleConfig.Cavity.IgnoreHydrogens) ? "True" : "False"}<br />
            Ignore HETATMs: {(data.MoleConfig.Cavity === void 0) ? "False" : (data.MoleConfig.Cavity.IgnoreHETAtoms) ? "True" : "False"}<br />
            Query Filter: {(data.MoleConfig.QueryFilter === void 0) ? "" : data.MoleConfig.QueryFilter}<br />
            Read All Models: {(data.MoleConfig.Input === void 0) ? "False" : (data.MoleConfig.Input.ReadAllModels) ? "True" : "False"}<br />
            Ignored Residues: {(data.MoleConfig.NonActiveResidues === void 0 || data.MoleConfig.NonActiveResidues === null) ? "" : flattenResidues(data.MoleConfig.NonActiveResidues)}<br />
            Specific Chains: {(data.MoleConfig.Input === void 0) ? "" : data.MoleConfig.Input.SpecificChains}<br />
            <h4>Cavity Parameters</h4>
            Probe Radius: {(data.MoleConfig.Cavity === void 0) ? "" : data.MoleConfig.Cavity.ProbeRadius}<br />
            Interior Threshold: {(data.MoleConfig.Cavity === void 0) ? "" : data.MoleConfig.Cavity.InteriorThreshold}<br />
            <h4>Channel Parameters</h4>
            Origin Radius: {(data.MoleConfig.Tunnel === void 0 || data.MoleConfig.Tunnel === null) ? "" : data.MoleConfig.Tunnel.OriginRadius}<br />
            Surface Cover Radius: {(data.MoleConfig.Tunnel === void 0 || data.MoleConfig.Tunnel === null) ? "" : data.MoleConfig.Tunnel.SurfaceCoverRadius}<br />
            Weight Function: {(data.MoleConfig.Tunnel === void 0 || data.MoleConfig.Tunnel === null) ? "" : data.MoleConfig.Tunnel.WeightFunction}<br />
            Bottleneck Radius: {(data.MoleConfig.Tunnel === void 0 || data.MoleConfig.Tunnel === null) ? "" : data.MoleConfig.Tunnel.BottleneckRadius}<br />
            Bottleneck Tolerance: {(data.MoleConfig.Tunnel === void 0 || data.MoleConfig.Tunnel === null) ? "" : data.MoleConfig.Tunnel.BottleneckTolerance}<br />
            Max Tunnel Similarity: {(data.MoleConfig.Tunnel === void 0 || data.MoleConfig.Tunnel === null) ? "" : data.MoleConfig.Tunnel.MaxTunnelSimilarity}<br />
            Merge Pores: {(data.MoleConfig.PoresMerged === void 0 || data.MoleConfig.PoresMerged === null) ? "False" : (data.MoleConfig.PoresMerged) ? "True" : "False"}<br />
            Automatic Pores: {(data.MoleConfig.PoresAuto === void 0 || data.MoleConfig.PoresAuto === null) ? "False" : (data.MoleConfig.PoresAuto) ? "True" : "False"}<br />
            <h4>Selection</h4>
            Starting Point: {(data.MoleConfig.Origin === void 0 || data.MoleConfig.Origin === null) ? "" : (data.MoleConfig.Origin.Residues === void 0 || data.MoleConfig.Origin.Residues === null || data.MoleConfig.Origin.Residues.length === 0) ? "" : flattenResiduesArray(data.MoleConfig.Origin.Residues)}<br />
            Starting Point[x,y,z]: {(data.MoleConfig.Origin === void 0 || data.MoleConfig.Origin === null) ? "" : (data.MoleConfig.Origin.Points === void 0 || data.MoleConfig.Origin.Points === null) ? "" : pointsToString(data.MoleConfig.Origin.Points)}<br />
            End Point: {(data.MoleConfig.CustomExits === void 0 || data.MoleConfig.CustomExits === null) ? "" : (data.MoleConfig.CustomExits.Residues === void 0 || data.MoleConfig.CustomExits.Residues === null || data.MoleConfig.CustomExits.Residues.length === 0) ? "" : flattenResiduesArray(data.MoleConfig.CustomExits.Residues)}<br />
            End Point[x,y,z]: {(data.MoleConfig.CustomExits === void 0 || data.MoleConfig.CustomExits === null) ? "" : (data.MoleConfig.CustomExits.Points === void 0 || data.MoleConfig.CustomExits.Points === null) ? "" : pointsToString(data.MoleConfig.CustomExits.Points)}<br />
            Query: {(data.MoleConfig.Origin === void 0 || data.MoleConfig.Origin === null) ? "" : (data.MoleConfig.Origin.QueryExpression === void 0 || data.MoleConfig.Origin.QueryExpression === null) ? "" : data.MoleConfig.Origin.QueryExpression}<br />
        </div>
    }

    getPoresJob(data: ServiceSubmission) {
        return <div className="panel-body">
            Beta Structure: {(data.PoresConfig.IsBetaBarel === void 0) ? "False" : (data.PoresConfig.IsBetaBarel) ? "True" : "False"}<br />
            Membrane Region: {(data.PoresConfig.InMembrane === void 0) ? "False" : (data.PoresConfig.InMembrane) ? "True" : "False"}<br />
            Specific Chains: {(data.PoresConfig.Chains === void 0) ? "" : data.PoresConfig.Chains}<br />
            Probe Radius: {(data.PoresConfig === void 0) ? "" : data.PoresConfig.ProbeRadius}<br />
            Interior Threshold: {(data.PoresConfig === void 0) ? "" : data.PoresConfig.InteriorThreshold}<br />
        </div>
    }

    render() {
        let currentSubmitId = this.props.currentSubmitId;
        let data = this.props.data;
        let canResubmit = checkCanResubmit(this.props.status as ComputationStatus);

        let contents;
        if (isMoleJob(data)) {
            contents = this.getMoleJob(data);
        }
        else {
            contents = this.getPoresJob(data);
        }

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <a data-bs-toggle="collapse" href={`#submit-data-${data.SubmitId}`} onClick={(e) => {
                        if (e.currentTarget.attributes.getNamedItem('aria-expanded')!.value === 'true') {
                            if (String(data.SubmitId) !== String(this.props.currentSubmitId)) {
                                changeSubmitId(this.props.computationId, data.SubmitId);
                            }
                        }
                    }}>
                        <h4 className="panel-title">
                            #{data.SubmitId}
                        </h4>
                        <div className="submission-state">
                            Status: <span className={`state-${this.props.status}`}>{this.props.status}</span>
                        </div>
                    </a>
                </div>
                <div id={`submit-data-${data.SubmitId}`} className={`panel-collapse collapse${(currentSubmitId.toString() === data.SubmitId.toString()) ? ' in' : ''}`}>
                    {contents}
                    <div className="panel-footer">
                        <span className="btn btn-xs btn-primary" onClick={(() => this.copyParams(data.SubmitId)).bind(this)}>Copy</span><span className="btn btn-xs btn-primary" aria-disabled={!canResubmit} onClick={(() => this.reSubmit()).bind(this)}>Resubmit</span>
                    </div>
                </div>
            </div>
        );
    }

    private reSubmit() {
        if (isMoleJob(this.props.data)) {
            gtag('event', 'Submit', { 'event_category': 'MOLE' });
            BridgeEvents.invokeOnReSubmit(
                ApiService.submitMoleJob(this.props.computationId, this.props.data.MoleConfig)
            );
        }
        else {
            gtag('event', 'Submit', { 'event_category': 'Pores' });
            BridgeEvents.invokeOnReSubmit(
                ApiService.submitPoresJob(this.props.computationId, this.props.data.PoresConfig)
            );
        }
    }

    private copyParams(submitId: number) {
        if (this.props.onCopy !== void 0) {
            this.props.onCopy(submitId);
        }
    }
}

export class ChannelsDBSubmission extends React.Component<{ pdbid: string, computationId: string, isSelected: boolean }, {}> {

    componentDidMount() {
    }

    render() {
        let isSelected = this.props.isSelected;
        let link = `${CommonOptions.CHANNELSDB_LINK_DETAIL_URL}/${this.props.pdbid}`;
        let contents = <div className="panel-body">See <a target="_blank" href={link}>{link}</a> for more info.</div>
        return (
            <div className="panel panel-default">
                {/* <div className="panel-heading">
                    <a data-toggle="collapse" href={`#submit-data-ChannelsDB`} onClick={(e) => {
                        if (e.currentTarget.attributes.getNamedItem('aria-expanded')!.value === 'true') {
                            if (!this.props.isSelected) {
                                changeSubmitId(this.props.computationId, -1);
                            }
                        }
                    }}>
                        <h4 className="panel-title">
                            #ChannelsDB
                        </h4>
                        <div className="submission-state">
                        </div>
                    </a>
                </div> */}
                <div id={`submit-data-ChannelsDB`} className={`panel-collapse collapse${(isSelected) ? ' in' : ''}`}>
                    {contents}
                </div>
            </div>
        );
    }
}

function changeSubmitId(computationId: string, submitId: number) {
    if (submitId === -1) {
        fakeRedirect(computationId, "ChannelsDB");
    }
    else {
        fakeRedirect(computationId, (submitId > 0) ? String(submitId) : void 0);
    }
    // LiteMol.Example.Channels.State.removeChannelsData(Instances.getPlugin());
    BridgeEvents.invokeChangeSubmitId(submitId);
}

interface ControlTabState {
    activeTabIdx: number,
    data?: CompInfo,
    err?: String,
    submitId: number,
    canSubmit: boolean,
};
export class ControlTabs extends React.Component<{ activeTab?: number }, ControlTabState> {

    state: ControlTabState = {
        activeTabIdx: 0,
        data: void 0,
        err: void 0,
        submitId: 1,
        canSubmit: true
    }

    componentDidMount() {
        $("#right-panel-toggler").on("click", function () {
            $(".ui").toggleClass("toggled");
            $(".bottom").toggleClass("toggled");
            $(window).trigger('resize');
            $(window).trigger('contentResize');
        });

        if (this.props.activeTab !== void 0) {
            let state = this.state;
            state.activeTabIdx = this.props.activeTab;
            this.setState(state);
        }

        let parameters = getParameters();
        if (parameters !== null) {
            let compId = parameters.computationId;
            let submitId = parameters.submitId;
            if (parameters.isChannelsDB) {
                submitId = -1;
            }
            Provider.get(parameters.computationId, ((compId: string, info: CompInfo) => {
                //CompInfo => Status==="Error" => Submissions neexistuje! Response ma format /Status na misto /CompInfo
                if (info === null) {
                    return;
                }
                let state = this.state;
                state.data = info;
                state.submitId = submitId;
                this.setState(state);
            }).bind(this));
        } else {
            let state = this.state;
            state.err = "Parameters from url cannot be properly processed.";
            this.setState(state);
        }

        BridgeEvents.subscribeChangeSubmitId((submitId) => {
            let state = this.state;
            state.submitId = submitId;
            this.setState(state);
        });

        ValidationState.attachOnStateChangeHandler(validationGroup, (prev, curr) => {
            let s = this.state;
            if (curr !== "VALID") {
                $("#submission-form").find("input[type=submit]").attr("disabled", true);
                s.canSubmit = false;
            }
            else {
                s.canSubmit = true;
            }
            this.setState(s);
        });
    }

    nullIfEmpty(data: any[][]) {
        if (data.length === 1 && data[0].length === 0) {
            return null;
        }

        return data;
    }

    handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        $(e.target).find("input[type=submit]").attr("disabled", true);
        let currentState = this.state;
        currentState.canSubmit = false;
        this.setState(currentState);

        if (this.state.data === void 0) {
            return;
        }

        FormEvents.invokeOnSubmit(validationGroup);
    }

    render() {
        let tabs: JSX.Element[] = [];

        if (this.state.data !== void 0) {
            tabs.push(
                <Settings initialData={this.state.data} parent={this} submitId={this.state.submitId} />
            );
            tabs.push(
                <Submissions computationInfo={this.state.data} onResubmit={(info) => {
                    let state = this.state;
                    state.data = info;
                    this.setState(state);
                }} />
            );
        }
        else {
            tabs.push(
                <div>No data</div>
            );
        }
        if (this.state.canSubmit) {
            $('#controls .submit-parent').find("input[type=submit]").removeAttr("disabled");
            // $('#controls .submit-parent').find("#controls-submit").removeAttr("disabled");
        }
        else {
            $('#controls .submit-parent').find("input[type=submit]").attr("disabled", true);
            // $('#controls .submit-parent').find("#controls-submit").attr("disabled", true);
        }
        return (
            <div className="submit-form-container">
                <TabbedContainer header={["Submission settings", "Submissions"]} tabContents={tabs} namespace="right-panel-tabs-" htmlClassName="tabs flex-grow-1" htmlId="right-panel-tabs" activeTab={this.state.activeTabIdx} onChange={((tabIdx: number) => {
                    let s = this.state;
                    s.activeTabIdx = tabIdx;
                    this.setState(s);
                }).bind(this)} />
                <form className="form-horizontal" id="submission-form" onSubmit={this.handleSubmit.bind(this)}>
                    <ControlButtons submitId={this.state.submitId} computationInfo={this.state.data} isLoading={!this.state.canSubmit} />
                </form>
                {/* <div id="right-panel-toggler" className="toggler glyphicon glyphicon-resize-vertical"></div> */}
            </div>
        );
    }
}

interface SubmissionCoboboxItem {
    label: string,
    value: string
}
interface ControlButtonsState {
    submitId: number,
    hasKillable: boolean,
    canSubmit: boolean,
    submitLoading: boolean,
}
interface ControlButtonsProps {
    submitId: number,
    computationInfo: CompInfo | undefined,
    isLoading: boolean
}

export class ControlButtons extends React.Component<ControlButtonsProps, ControlButtonsState> {
    state: ControlButtonsState = { submitId: -1, hasKillable: false, canSubmit: true, submitLoading: false }

    componentDidMount() {
        this.state.submitId = this.props.submitId;
        BridgeEvents.subscribeChangeHasKillable((hasKillable) => {
            let state = this.state;
            state.hasKillable = hasKillable;
            this.setState(state);
        });
        BridgeEvents.subscribeToggleLoadingScreen(({ message, visible }) => {
            let state = this.state;
            state.submitLoading = visible;
            this.setState(state);
        })
    }

    componentWillReceiveProps(nextProps: ControlButtonsProps) {
        let state = this.state;
        state.submitId = nextProps.submitId;
        this.setState(state);
    }

    private getSubmissions() {
        let submissions: ServiceSubmission[] = [];
        if (this.props.computationInfo !== void 0) {
            submissions = this.sortSubmissions(this.props.computationInfo.Submissions);
        }

        return submissions;
    }

    private sortSubmissions(items: ServiceSubmission[]): ServiceSubmission[] {
        return items.sort((a, b) => {
            return a.SubmitId - b.SubmitId;
        });
    }

    private prepareSubmissionItems(): SubmissionCoboboxItem[] {
        let submissions = this.getSubmissions();

        let rv = [];

        rv.push(
            {
                label: `-`,
                value: '0'
            }
        );

        if (this.props.computationInfo !== void 0) {
            if (this.props.computationInfo.PdbId !== null && this.props.computationInfo.PdbId !== "") {
                rv.push({
                    label: 'ChDB',
                    value: '-1'
                });
            }
        }

        if (submissions.length === 0) {
            return rv;
        }

        for (let item of submissions) {
            rv.push(
                {
                    label: `${item.SubmitId}`,
                    value: `${item.SubmitId}`
                }
            );
        }

        return rv;
    }

    private getSelectedIndex(submitId: number, items: SubmissionCoboboxItem[]): number | undefined {
        for (let idx = 0; idx < items.length; idx++) {
            let item = items[idx];
            if (item.value === `${submitId}`) {
                return idx;
            }
        }

        return void 0;
    }

    private onSubmitIdComboSelectChange(e: any) {
        if (this.props.computationInfo === void 0) {
            return;
        }

        let idx = e.currentTarget.selectedIndex;
        let submitId = (e.currentTarget.options[idx] as HTMLOptionElement).value;
        let sid = Number(submitId).valueOf();
        changeSubmitId(this.props.computationInfo.ComputationId, sid);
        let state = this.state;
        state.submitId = sid;
        this.setState(state);
    }

    private changeSubmitIdByStep(e: React.MouseEvent<HTMLInputElement>) {
        if (this.props.computationInfo === void 0) {
            return;
        }

        let submitId = e.currentTarget.dataset["value"];

        if (submitId !== void 0) {
            let sid = Number(submitId).valueOf();
            changeSubmitId(this.props.computationInfo.ComputationId, sid);
            let state = this.state;
            state.submitId = sid;
            this.setState(state);
        }
    }

    private canShift(left: boolean) {
        if (this.props.computationInfo === void 0) {
            return false;
        }

        if (String(this.state.submitId) === String(0)) {
            return false;
        }

        let submissions = this.getSubmissions();

        for (let idx = 0; idx < submissions.length; idx++) {
            if (String(submissions[idx].SubmitId) === String(this.props.submitId)) {
                let nextIdx = idx + ((left) ? -1 : 1);
                if (nextIdx < 0 || nextIdx >= submissions.length) {
                    return false;
                }
                else {
                    return true;
                }
            }
        }

        return false;
    }

    private canShiftNext() {
        return this.canShift(false);
    }

    private canShiftPrev() {
        return this.canShift(true);
    }

    private getNextIdx(idx: number): number {
        return idx + 1;
    }

    private getPrevIdx(idx: number): number {
        return idx - 1;
    }

    render() {
        let canKill = (this.props.computationInfo !== void 0 && this.state.hasKillable);
        let items = this.prepareSubmissionItems();
        let idx = this.getSelectedIndex(this.state.submitId, items);
        let canShiftPrev = this.canShiftPrev();
        let canShiftNext = this.canShiftNext();
        return <div className="submit-parent">
            {this.props.isLoading || this.state.submitLoading
                ? <button className="btn btn-sm btn-primary submit" type="submit" id="controls-submit" disabled>
                    <span
                        id="controls-loader"
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    Submit
                </button>
                : <button className="btn btn-sm btn-primary submit" type="submit" id="controls-submit">Submit</button>}
            {/* <button className="btn btn-sm btn-primary submit" type="submit" id="controls-submit">
                {this.props.isLoading || this.state.submitLoading ? <span
                    id="controls-loader"
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                ></span> : <></>}
                Submit
            </button> */}
            {/* <input className="btn btn-sm btn-primary submit" type="submit" value="Submit" /> */}
            {/* <div
                className={`spinner-border spinner-border-sm ms-2 ${this.state.submitLoading ? "" : "d-none"}`}
                role="status"
                aria-hidden="true"
            ></div> */}
            <input type="button" className="btn btn-sm btn-primary kill-job-button" disabled={!canKill} onClick={(e => {
                if ($(e.currentTarget).attr("disabled") !== "disabled") {
                    $('#killJobDialog').modal('show');
                    $(".chdb-panel.right-panel").addClass("has-modal");
                }
            })} value="Kill" />
            <input type="button" className="btn btn-sm btn-primary delete-project-button" data-toggle="modal" data-target="#deleteProjectDialog" onClick={(e => {
                e.preventDefault();
                $(".chdb-panel.right-panel").addClass("has-modal");
                return false;
            })} value="Delete" />
            <input className="btn btn-sm btn-primary clear-button" type="button" value="Clear" onClick={() => {
                FormEvents.invokeOnClear(validationGroup + "_form");
            }} />
            <input className="btn btn-sm btn-primary submit-arrow" type="button" value=">" disabled={(!canShiftNext) ? true : void 0} data-value={(!canShiftNext || idx === void 0) ? void 0 : items[this.getNextIdx(idx)].value} onClick={this.changeSubmitIdByStep.bind(this)} />
            <SimpleComboBox id="submissionComboSwitch" items={items} defaultSelectedIndex={idx} className="form-control submit-combo" onSelectedChange={this.onSubmitIdComboSelectChange.bind(this)} />
            <input className="btn btn-sm btn-primary submit-arrow" type="button" value="<" disabled={(!canShiftPrev) ? true : void 0} data-value={(!canShiftPrev || idx == void 0) ? void 0 : items[this.getPrevIdx(idx)].value} onClick={this.changeSubmitIdByStep.bind(this)} />
            <ModalDialog id="killJobDialog" header="Do you really want to kill running job?" body={this.prepareKillJobDialogBody()} />
            <ModalDialog id="deleteProjectDialog" header="Do you really want to delete whole computation project?" body={this.prepareDeleteDialogBody()} />
        </div>
    }

    private prepareKillJobDialogBody() {
        return (
            <div>
                <button className="btn btn-primary left-button" onClick={(e) => {
                    e.preventDefault();
                    if (this.props.computationInfo === void 0) {
                        return false;
                    }
                    ApiService.killRunningJob(this.props.computationInfo.ComputationId).then((result) => {
                        if (result.Status !== "Aborted") {
                            BridgeEvents.invokeNotifyMessage({
                                message: (result.ErrorMsg.length === 0) ? "Attempt to kill job was not successfull." : result.ErrorMsg,
                                messageType: "Warning"
                            });
                            return;
                        }

                        BridgeEvents.invokeNotifyMessage({
                            message: "Job has been successfully killed.",
                            messageType: "Success"
                        });
                    })
                        .catch((err) => {
                            BridgeEvents.invokeNotifyMessage({
                                message: "Attempt to kill running job failed! Please try again later.",
                                messageType: "Danger"
                            });
                        });
                    return false;
                }} data-dismiss="modal">Yes</button>
                <button className="btn btn-primary right-button" data-dismiss="modal">No</button>
            </div>
        );
    }

    private prepareDeleteDialogBody() {
        return (
            <div>
                <button className="btn btn-primary left-button" onClick={(e) => {
                    e.preventDefault();
                    if (this.props.computationInfo === void 0) {
                        return false;
                    }
                    ApiService.deleteProject(this.props.computationInfo.ComputationId).then(() => {
                        BridgeEvents.invokeNotifyMessage({
                            message: "Current computation was succesfuly deleted. You will be redirected to initial page.",
                            messageType: "Success"
                        });
                        window.setTimeout(() => {
                            GlobalRouter.redirect(Routing.ROUTING_OPTIONS[Routing.ROUTING_MODE].defaultContextPath);
                        }, 5000);
                    })
                        .catch((err) => {
                            BridgeEvents.invokeNotifyMessage({
                                message: "Attempt to delete current computation failed! Please try again later.",
                                messageType: "Danger"
                            });
                        });
                    return false;
                }} data-dismiss="modal">Yes</button>
                <button className="btn btn-primary right-button" data-dismiss="modal">No</button>
            </div>
        );
    }
}

class ModalDialog extends React.Component<{ id: string, header: string, body: JSX.Element }, {}> {
    render() {
        return <div id={this.props.id} className="modal fade" role="dialog">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">{this.props.header}</h4>
                        <button type="button" className="close" data-dismiss="modal">&times;</button>
                    </div>
                    <div className="modal-body">
                        {this.props.body}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => {
                            $(".chdb-panel.right-panel").removeClass("has-modal");
                        }} >Close</button>
                    </div>
                </div>
            </div>
        </div>
    }
}
