// import ApiService = MoleOnlineWebUI.Service.MoleAPI.ApiService;
// import MoleAPI = MoleOnlineWebUI.Service.MoleAPI;
// import LastNSessions = Common.Util.LastNSessions;

import React from "react";
import { ApiService, CompInfo, InitResponse } from "../../MoleAPIService";
import { Events } from "../../Bridge";
import { GlobalRouter } from "../../SimpleRouter";
import { TabbedContainer } from "../../Common/UI/Tabs/BootstrapTabs";
import { getNthSession, LAST_N_SESSIONS_N } from "../../Common/Util/LastNSessions";
import { ComputationInfo } from "../../DataProxy";
import { Routing } from "../../../config/common";
import AlertMessages from "../../Common/UI/AlertMessages/UI";

declare function $(p: any): any;
declare function gtag(ga_type: string, action: string, options: { 'event_category': string, 'event_label'?: string, 'value'?: any }): any;

interface State {
    app: InitForm,
    useBiologicalUnit: boolean,
    activeTabIdx: number,
};

export class InitForm extends React.Component<{}, State> {
    private computationId: string;
    private submitId: number;

    state: State = {
        app: this,
        useBiologicalUnit: false,
        activeTabIdx: 0,
    };

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    private handleFormSubmit(e: Event) {
        e.preventDefault();

        let form = e.target as HTMLFormElement;
        $('#frm-jobSetup-setupForm-next').val('Submiting...');
        $('#frm-jobSetup-setupForm-next').prop('disabled', true);

        let pdbid = "";
        let assembly;
        let pores: boolean = false;
        let file;

        for (let idx = 0; idx < form.length; idx++) {
            let item = form[idx] as HTMLInputElement;
            let name = item.getAttribute('name');
            switch (name) {
                case 'pdbid':
                    pdbid = item.value;
                    break;
                case 'assembly':
                    assembly = (item.value !== "" && !item.disabled) ? item.value : void 0;
                    break;
                case 'biological-unit':
                    pores = (item.value !== "") ? item.checked : false;
                    break;
                case 'file':
                    file = (item.files !== null) ? item.files[0] : void 0;
                    break;
            }
        }
        if (file === void 0 || file === null) {
            this.triggerAnalyticsEvent((pdbid.length > 0) ? pdbid : null, pores, (assembly === void 0) ? null : assembly, null);
            ApiService.initWithParams(pdbid, pores, assembly)
                .then((response) => {
                    this.handleFormSubmitResponse(response);
                })
                .catch((reason) => {
                    //TODO:...
                    console.log(reason);
                })
        }
        else {
            this.triggerAnalyticsEvent(null, false, null, file);
            let data = new FormData();
            data.append("file", file)
            ApiService.initWithFile(data)
                .then((response) => {
                    this.handleFormSubmitResponse(response);
                })
                .catch((reason) => {
                    //TODO:...
                    console.log(reason);
                })
        }

        return false;
    }

    private triggerAnalyticsEvent(pdbid: string | null, pores: boolean, assembly: string | null, file: File | null) {
        if (file !== null) {
            let extension = file.name.split(".").filter((v, i, a) => { return i !== 0; }).join(".");
            gtag('event', 'Init', { 'event_category': 'userStructure', 'event_label': extension });
            return;
        }
        else {
            if (pdbid === null) {
                return;
            }

            if (pores) {
                gtag('event', 'Init', { 'event_category': pdbid, 'event_label': 'bio' });
                return;
            }
            if (assembly !== null) {
                let assembly_number = Number(assembly);
                if (isNaN(assembly_number.valueOf())) {
                    assembly_number = 0;
                }
                gtag('event', 'Init', { 'event_category': pdbid, 'event_label': 'assembly', 'value': assembly_number });
                return;
            }
            if (!pores && assembly === null) {
                gtag('event', 'Init', { 'event_category': pdbid, 'event_label': 'asymetricUnit' });
                return;
            }
        }
    }

    private handleFormSubmitResponse(response: InitResponse) {
        if (response.Status === "FailedInitialization") {
            $('#frm-jobSetup-setupForm-next').prop('disabled', false);
            $('#frm-jobSetup-setupForm-next').val('Next');
            Events.invokeNotifyMessage({
                messageType: "Danger",
                message: `API was unable to initialize computation with specified parameters. API responded with message: ${response.ErrorMsg}`
            })
            return;
        }

        this.computationId = response.ComputationId;
        this.submitId = response.SubmitId;

        if (response.Status === "Initialized") {
            console.log("Initialized");
            $('#frm-jobSetup-setupForm-next').val('Initialized!');
            Events.invokeNotifyMessage({
                messageType: "Success",
                message: "Computation was successfully initialized. You will be redirected to detail page."
            });
            GlobalRouter.redirect(`/${this.computationId}`, true);
            return;
        }

        if (response.Status === "Initializing") {
            console.log("Waiting for computation initialization...");
            $('#frm-jobSetup-setupForm-next').val('Initializing computation...');
            window.setTimeout(this.waitForComputationInitialization.bind(this), 500);
            return;
        }

        $('#frm-jobSetup-setupForm-next').prop('disabled', false);
        Events.invokeNotifyMessage({
            messageType: "Danger",
            message: `Unexpected computation status recieved from API: ${response.Status}`
        })
    }

    private waitForComputationInitialization() {
        ApiService.getStatus(this.computationId, this.submitId).then((response) => {
            this.handleFormSubmitResponse(response);
        });
    }

    private biologicalUnitChange(e: Event) {
        let el = e.target as HTMLInputElement;
        let s = this.state;
        s.useBiologicalUnit = el.checked;
        this.setState(s);
    }

    render() {

        let buttons = <input type="submit" name="next" className="button" id="frm-jobSetup-setupForm-next" value="Next" />;
        let content = this.formByPDBID();
        let tabs: JSX.Element[] = [];

        tabs.push(
            this.formByPDBID()
        );
        tabs.push(
            this.formByFile()
        );
        tabs.push(
            this.formByLastNSessions()
        );

        if (this.state.activeTabIdx === 2) { //LastNSessions -> dont show "Next" button
            buttons = <span />
        }

        return (
            <>
                <div className="card-header bg-primary text-white">
                    Online
                </div>
                <div className="card-body">
                    <div id="alert-messages" className="index">
                        <AlertMessages />
                    </div>
                    <div className="InitForm">
                        <form onSubmit={this.handleFormSubmit.bind(this)} action={`${Routing.ROUTING_OPTIONS[Routing.ROUTING_MODE].defaultContextPath}/`} method="post" encType="multipart/form-data">
                            <div className="groupbox">
                                <TabbedContainer header={["PDBID", "File", "Last session"]} tabContents={tabs} namespace="quick-start-panel-tabs-" htmlClassName="tabs" htmlId="quick-start-panel-tabs" activeTab={this.state.activeTabIdx} onChange={((tabIdx: number) => {
                                    let s = this.state;
                                    s.activeTabIdx = tabIdx;
                                    this.setState(s);
                                }).bind(this)} />
                            </div>

                            <div className="buttons">
                                {buttons}
                            </div>
                            <div><input type="hidden" name="do" value="jobSetup-setupForm-submit" /></div>
                        </form>
                    </div>
                </div>
            </>
        );
    }

    formByPDBID() {
        return (
            <table style={{ width: "100%" }}>
                <tbody>
                    <tr>
                        <td><label htmlFor="frm-jobSetup-setupForm-code">PDB ID</label>:</td>
                        <td>
                            <input type="text" name="pdbid" maxLength={4} size={10} className="text" id="frm-jobSetup-setupForm-code" defaultValue="1tqn" />
                            <div className="hint">PDB ID code as can be found on www.pdb.org, for example 1z10.</div>
                        </td>
                    </tr>

                    <tr>
                        <td><label htmlFor="frm-jobSetup-setupForm-unit">Assembly ID (optional)</label>:</td>
                        <td><input disabled={this.state.useBiologicalUnit} type="text" name="assembly" maxLength={3} size={10} className="text" id="frm-jobSetup-setupForm-unit" defaultValue="" />
                            <div className="hint">
                                no value - assymetric unit (default)
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td><label htmlFor="frm-jobSetup-setupForm-chains">Use biological unit</label>:</td>
                        <td><input type="checkbox" onChange={this.biologicalUnitChange.bind(this)} name="biological-unit" className="checkbox" defaultChecked={true} />
                            <div className="hint">
                                use biological unit
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }

    formByFile() {
        return (
            <table style={{ width: "100%" }}>
                <tbody>
                    <tr>
                        <td><label htmlFor="frm-jobSetup-setupForm-file">Upload your own file</label>:</td>
                        <td>
                            <input type="file" name="file" className="text" id="frm-jobSetup-setupForm-file" />
                            <div className="hint">
                                Plain text PDB files (UTF-8 encoding), ZIP and GZIP archives are supported,
                                maximal file size is 50MB.<br />
                                E.g. cleaned PDB with only one chain and without unnecessary HETATMs.
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }

    getLastNSessions() {
        let sessions = [];

        for (let i = 0; i < LAST_N_SESSIONS_N; i++) {
            let session = getNthSession(i);
            if (session === "") {
                break;
            }
            sessions.push(
                <LastSession session={session} parent={this} />
            );
        }

        if (sessions.length === 0) {
            sessions.push(
                <tr>
                    <td colSpan={4}>
                        There are no last openned sessions available...
                    </td>
                </tr>
            );
        }

        return sessions;

    }

    formByLastNSessions() {
        let sessions = this.getLastNSessions();
        return (
            <table style={{ width: "100%" }} className="last-session-form">
                <thead>
                    <tr>
                        <th>
                            Created
                        </th>
                        <th>
                            PDB ID
                        </th>
                        <th>
                            Assembly ID
                        </th>
                        <th>
                            Submission
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sessions}
                </tbody>
            </table>
        );
    }
}

interface LastSessionProps { session: string, parent: InitForm }
interface LastSessionState { loaded: boolean, data: CompInfo | null };
class LastSession extends React.Component<LastSessionProps, LastSessionState> {
    state: LastSessionState = { loaded: false, data: null }

    componentDidMount() {
        let computationId = this.props.session.split("|")[1].split("/")[0];

        ComputationInfo.DataProvider.get(computationId, (compId, info) => {
            let s = this.state;
            this.setState({
                loaded: true,
                data: info
            });
        });
    }

    render() {
        let date = this.props.session.split("|")[0];
        let sessionUrl = this.props.session.split("|")[1];
        if (this.state.loaded && this.state.data !== null) {
            let pdbid;
            if (this.state.data.PdbId !== null && this.state.data.PdbId !== "") {
                pdbid = this.state.data.PdbId
            }
            else {
                pdbid = "User structure";
            }

            let assemblyId;
            if (this.state.data.AssemblyId !== null && this.state.data.AssemblyId !== "") {
                assemblyId = this.state.data.AssemblyId;
            }
            if (assemblyId === null) {
                assemblyId = "Assymetric unit"
            }

            let submitIdParts = sessionUrl.split("/");
            let submission;
            if (submitIdParts.length === 2) {
                let submitId = submitIdParts[1];
                submission = submitId;
            }
            return <tr onClick={() => {
                GlobalRouter.redirect(`/online/${sessionUrl}`);
            }} className="linkLike">
                <td>
                    {date}
                </td>
                <td>
                    {pdbid}
                </td>
                <td>
                    {assemblyId}
                </td>
                <td>
                    {submission}
                </td>
            </tr>
        }
        else {
            return <tr onClick={() => {
                GlobalRouter.redirect(`/online/${sessionUrl}`);
            }} className="linkLike">
                <td>
                    {date}
                </td>
                <td colSpan={3}>
                    {sessionUrl}
                </td>
            </tr>
        }
    }

}