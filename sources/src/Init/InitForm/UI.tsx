import React from "react";
import {ApiService, CompInfo, InitResponse} from "../../MoleAPIService";
import { describeError } from "../../Http";
import {Events} from "../../Bridge";
import {TabbedContainer} from "../../Common/UI/Tabs/BootstrapTabs";
import {getNthSession, LAST_N_SESSIONS_N} from "../../Common/Util/LastNSessions";
import {ComputationInfo} from "../../DataProxy";
import AlertMessages from "../../Common/UI/AlertMessages/UI";

// The API refuses larger uploads
const MAX_UPLOAD_MB = 30;

declare function $(p: any): any;

interface State {
    useAsymmetricUnit: boolean,
    activeTabIdx: number,
};

export class InitForm extends React.Component<{}, State> {
    private computationId!: string;
    private submitId!: number;

    state: State = {
        useAsymmetricUnit: false,
        activeTabIdx: 0,
    };

    private handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        let form = e.target as HTMLFormElement;
        let $next = $('#frm-jobSetup-setupForm-next');
        $next.val('Submitting...');
        $next.prop('disabled', true);

        let pdbid = '';
        let assemblyId = ''; // empty: the preferred assembly
        let asymmetricUnit = false;
        let file;

        for (let idx = 0; idx < form.length; idx++) {
            let item = form[idx] as HTMLInputElement;
            let name = item.getAttribute('name');
            switch (name) {
                case 'pdbid':
                    pdbid = item.value;
                    break;
                case 'assembly':
                    assemblyId = item.value.trim();
                    break;
                case 'asymmetric-unit':
                    asymmetricUnit = item.checked;
                    break;
                case 'file':
                    file = (item.files !== null) ? item.files[0] : void 0;
                    break;
            }
        }
        if (file === void 0 || file === null) {
            ApiService.initWithPdbId(pdbid, asymmetricUnit ? "asymmetric" : assemblyId === '' ? "preferred" : assemblyId)
                .then((response) => {
                    this.handleFormSubmitResponse(response);
                })
                .catch((reason) => this.showRequestError(reason))
        }
        else {
            this.uploadFile(file);
        }

        return false;
    }

    // The API refuses a structure over MAX_UPLOAD_MB, also when unpacked (413); checking first saves the upload
    private async uploadFile(file: File) {
        const limit = MAX_UPLOAD_MB * 1024 * 1024;
        if (file.size > limit) {
            this.showError(`The file is too large, at most ${MAX_UPLOAD_MB} MB can be uploaded, also when unpacked.`);
            return;
        }
        // a gzip file ends with its unpacked size (mod 2^32, little-endian); only a hint, the API checks the real size
        if (file.name.toLowerCase().endsWith(".gz") && file.size >= 4) {
            let unpacked;
            try {
                unpacked = new DataView(await file.slice(-4).arrayBuffer()).getUint32(0, true);
            } catch {
                // e.g. the file was changed or removed after it was selected
                this.showError("The file could not be read, please select it again.");
                return;
            }
            if (unpacked > limit) {
                this.showError(`The file unpacks to ${Math.ceil(unpacked / 1024 / 1024)} MB, at most ${MAX_UPLOAD_MB} MB can be computed.`);
                return;
            }
        }

        let data = new FormData();
        data.append("file", file)
        ApiService.initWithFile(data)
            .then((response) => {
                this.handleFormSubmitResponse(response);
            })
            .catch((reason) => this.showRequestError(reason))
    }

    // Re-enables the form and tells the user why the computation did not start
    private showError(message: string) {
        let $next = $('#frm-jobSetup-setupForm-next');
        $next.prop('disabled', false);
        $next.val('Submit');
        Events.invokeNotifyMessage({
            messageType: "Danger",
            message
        });
    }

    private showRequestError(reason: unknown) {
        this.showError(describeError(reason, "The MOLE API could not be reached, please try again later."));
    }

    private handleFormSubmitResponse(response: InitResponse) {
        let $next = $('#frm-jobSetup-setupForm-next');
        if (response.Status === "FailedInitialization") {
            this.showError(`API was unable to initialize computation with specified parameters. API responded with message: ${response.ErrorMsg}`);
            return;
        }

        this.computationId = response.ComputationId;
        this.submitId = response.SubmitId;

        if (response.Status === "Initialized") {
            console.log("Initialized");
            $next.val('Initialized!');
            Events.invokeNotifyMessage({
                messageType: "Success",
                message: "Computation was successfully initialized. You will be redirected to detail page."
            });
            location.replace(`/online/${this.computationId}`);
            return;
        }

        if (response.Status === "Initializing") {
            console.log("Waiting for computation initialization...");
            $next.val('Initializing computation...');
            window.setTimeout(this.waitForComputationInitialization.bind(this), 500);
            return;
        }

        this.showError(`Unexpected computation status received from API: ${response.Status}`);
    }

    private waitForComputationInitialization() {
        ApiService.getStatus(this.computationId, this.submitId)
            .then((response) => this.handleFormSubmitResponse(response))
            .catch((reason) => this.showRequestError(reason));
    }

    private asymmetricUnitChange(e: React.ChangeEvent<HTMLInputElement>) {
        let el = e.target as HTMLInputElement;
        let s = this.state;
        s.useAsymmetricUnit = el.checked;
        this.setState(s);
    }

    render() {

        let buttons = <input type="submit" name="next" className="button" id="frm-jobSetup-setupForm-next" value="Submit" />;
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
                    Submit job
                </div>
                <div className="card-body">
                    <div id="alert-messages" className="index">
                        <AlertMessages />
                    </div>
                    <div className="InitForm">
                        <form onSubmit={this.handleFormSubmit.bind(this)}>
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
                               defaultValue="" placeholder="preferred" data-bs-toggle="tooltip"
                               title="Protein structures are resolved in asymmetric units divided or combined in PDB into assemblies with integer ID numbering.
                               Assemblies may or may not form biological units. Empty: the preferred assembly of the entry, usually its biological unit."/>
                    </td>
                </tr>
                <tr>
                    <td><label htmlFor="frm-jobSetup-setupForm-asymmetric-unit">Use asymmetric unit</label>:</td>
                    <td><input type="checkbox" onChange={this.asymmetricUnitChange.bind(this)}
                               id="frm-jobSetup-setupForm-asymmetric-unit" name="asymmetric-unit" className="checkbox"
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
                            <input type="file" name="file" className="text" id="frm-jobSetup-setupForm-file" style = {{ maxWidth: '250px' }}
                                   accept=".pdb,.cif,.gz" data-bs-toggle="tooltip"
                                   title={`PDB (*.pdb) and mmCIF (*.cif) files, also gzipped (*.pdb.gz, *.cif.gz), at most ${MAX_UPLOAD_MB} MB, also when unpacked. Only the first model is used. E.g. cleaned PDB with only one chain and without unnecessary HETATMs.`}/>
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
                <LastSession key={i} session={session} parent={this} />
            );
        }

        if (sessions.length === 0) {
            sessions.push(
                <tr key="none">
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
            const isPdbEntry = this.state.data.PdbId !== null && this.state.data.PdbId !== "";
            const pdbid = isPdbEntry ? this.state.data.PdbId : "User structure";
            // a PDB entry loaded without an assembly is its asymmetric unit; an uploaded structure has no assembly
            const assemblyId = this.state.data.AssemblyId ? this.state.data.AssemblyId : (isPdbEntry ? "Asymmetric unit" : "");

            let submitIdParts = sessionUrl.split("/");
            let submission;
            if (submitIdParts.length === 2) {
                submission = submitIdParts[1];
            }
            return <tr onClick={() => {
                location.replace(`/online/${sessionUrl}`);
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
                location.replace(`/online/${sessionUrl}`);
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