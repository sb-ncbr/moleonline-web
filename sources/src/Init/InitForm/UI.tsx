import React from "react";
import {CompInfo} from "../../MoleAPIService";
import {GlobalRouter} from "../../SimpleRouter";
import {TabbedContainer} from "../../Common/UI/Tabs/BootstrapTabs";
import {getNthSession, LAST_N_SESSIONS_N} from "../../Common/Util/LastNSessions";
import {ComputationInfo} from "../../DataProxy";
import {CommonOptions, Routing} from "../../../config/common";
import AlertMessages from "../../Common/UI/AlertMessages/UI";

declare function $(p: any): any;

interface State {
    app: InitForm,
    useAsymmetricUnit: boolean,
    activeTabIdx: number,
};

export class InitForm extends React.Component<{}, State> {
    state: State = {
        app: this,
        useAsymmetricUnit: false,
        activeTabIdx: 0,
    };

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    private handleFormSubmit(e: Event) {
        // the archive is read-only
        e.preventDefault();
        return false;
    }

    private asymmetricUnitChange(e: Event) {
        let el = e.target as HTMLInputElement;
        let s = this.state;
        s.useAsymmetricUnit = el.checked;
        this.setState(s);
    }

    render() {

        let buttons = <span title={CommonOptions.READ_ONLY_MESSAGE}><input type="submit" name="next" className="button" id="frm-jobSetup-setupForm-next" value="Submit" disabled /></span>;
        let tabs: JSX.Element[] = [];

        // The archive is read-only: the fields stay, disabled; the last sessions are only opened
        tabs.push(
            <fieldset disabled title={CommonOptions.READ_ONLY_MESSAGE}>{this.formByPDBID()}</fieldset>
        );
        tabs.push(
            <fieldset disabled title={CommonOptions.READ_ONLY_MESSAGE}>{this.formByFile()}</fieldset>
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
                    Submit job
                </div>
                <div className="card-body">
                    <div id="alert-messages" className="index">
                        <AlertMessages />
                    </div>
                    <div className="InitForm">
                        <form onSubmit={this.handleFormSubmit.bind(this)} action={`${Routing.ROUTING_OPTIONS[Routing.ROUTING_MODE].defaultContextPath}/`} method="post" encType="multipart/form-data">
                            <div className="groupbox">
                                <TabbedContainer header={["PDB ID", "File", "Last session"]} tabContents={tabs} namespace="quick-start-panel-tabs-" htmlClassName="tabs" htmlId="quick-start-panel-tabs" activeTab={this.state.activeTabIdx} onChange={((tabIdx: number) => {
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
            <table style={{width: "100%"}}>
                <tbody>
                <tr>
                    <td><label htmlFor="frm-jobSetup-setupForm-code">PDB ID</label>:</td>
                    <td>
                        <input type="text" name="pdbid" maxLength={4} size={15} className="text"
                               id="frm-jobSetup-setupForm-code" defaultValue="1tqn" data-bs-toggle="tooltip"
                               title="PDB ID code as can be found on www.pdb.org, for example 1tqn."/>
                    </td>
                </tr>

                <tr>
                    <td><label htmlFor="frm-jobSetup-setupForm-unit">Assembly ID (optional)</label>:</td>
                    <td><input disabled={this.state.useAsymmetricUnit} type="text" name="assembly" maxLength={3}
                               size={15} className="text" id="frm-jobSetup-setupForm-unit"
                               defaultValue="1" data-bs-toggle="tooltip"
                               title="Protein structures are resolved in asymmetric units divided or combined in PDB into assemblies with integer ID numbering.
                               Assemblies may or may not form biological units, and most biological units have Assembly ID 1."/>
                    </td>
                </tr>
                <tr>
                    <td><label htmlFor="frm-jobSetup-setupForm-asymmetric-unit">Use asymmetric unit</label>:</td>
                    <td><input type="checkbox" onChange={this.asymmetricUnitChange.bind(this)}
                               id="frm-jobSetup-setupForm-assymetric-unit" name="asymmetric-unit" className="checkbox"
                               defaultChecked={false} data-bs-toggle="tooltip" title="Use asymmetric unit, not Assembly ID."/>
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
                        <td><label htmlFor="frm-jobSetup-setupForm-file">Upload file</label>:</td>
                        <td>
                            <input type="file" name="file" className="text" id="frm-jobSetup-setupForm-file" style = {{ maxWidth: '250px' }} data-bs-toggle="tooltip" title="                                Plain text PDB files (UTF-8 encoding), ZIP and GZIP archives are supported,
                                maximal file size is 50MB. E.g. cleaned PDB with only one chain and without unnecessary HETATMs."/>
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
                        There are no last opened sessions available...
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
interface LastSessionState { loaded: boolean, data: CompInfo | null }
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
                assemblyId = "Asymmetric unit"
            }

            let submitIdParts = sessionUrl.split("/");
            let submission;
            if (submitIdParts.length === 2) {
                submission = submitIdParts[1];
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