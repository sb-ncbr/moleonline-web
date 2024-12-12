// import Bundle = MoleOnlineWebUI.StaticData.Bundle;

import React from "react";
import { Events as BridgeEvents, Instances } from "../../../Bridge"
import { ComputationInfo } from "../../../DataProxy";
import { 
    AnnotationData,
    TunnelAnnotation as AnnotationToChannelsDBService_TunnelAnnotation,
    ResidueAnnotation as AnnotationToChannelsDBService_ResidueAnnotation,
    ReferenceType as AnnotationToChannelsDBService_ReferenceType,
    ApiService

} from "../../../AnnotationToChannelsDBService";
import { Bundle } from "../../../StaticData";
import { ChannelsDBData, MoleChannels, MoleData, Tunnel } from "../../../DataInterface";
import { Tunnels } from "../../CommonUtils/Tunnels";
import { fakeRedirect, getParameters } from "../../../Common/Util/Router";
import { CommonOptions } from "../../../../config/common";

declare function $(p: any, p1?: any): any;

interface AppState {
    computationId?: string,
    submitId?: number,
    annotationFormVisible: boolean
};
export class Annotate extends React.Component<{}, AppState> {
    state: AppState = {
        annotationFormVisible: false,
        computationId: void 0,
        submitId: void 0
    }
    private changeParams(submitId?: number) {
        let params = getParameters();
        if (params !== null) {
            this.setState({
                computationId: params.computationId,
                submitId: (submitId === void 0) ? params.submitId : submitId,
                annotationFormVisible: this.state.annotationFormVisible
            })
        }
    }

    componentDidMount() {
        this.changeParams();

        // BridgeEvents.subscribeChangeSubmitId((submitId) => {
        //     this.changeParams(submitId);
        // });
    }

    componentWillUnmount() {
    }

    render() {
        let computationId = this.state.computationId;
        let submitId = this.state.submitId;
        if (computationId === void 0 || submitId === void 0) {
            return <div className="annotate"/>
        }

        return <div className="annotate">
            <DropDownMenu app={this} canAnnotate={this.state.computationId !== void 0 && this.state.submitId !== void 0} />
            <AnnotateForm app={this} visible={this.state.annotationFormVisible} computationId={computationId} submitId={submitId} />
        </div>
    }
}

class BootstrapDropDownMenuItem extends React.Component<{ link?: string, linkText: string, targetBlank?: boolean, onClick?: () => void }, {}> {
    render() {
        if (this.props.onClick !== void 0) {
            return (
                <li><a className="dropdown-item" onClick={this.props.onClick}>{this.props.linkText}</a></li>
            );
        }
        else {
            return (
                <li><a className="dropdown-item" target={(this.props.targetBlank) ? "_blank" : ""} href={this.props.link}>{this.props.linkText}</a></li>
            );
        }
    }
}

class BootstrapDropDownMenuElementItem extends React.Component<{ link?: string, linkElement: JSX.Element, targetBlank?: boolean, onClick?: () => void }, {}> {
    render() {
        if (this.props.onClick !== void 0) {
            return (
                <li><a onClick={this.props.onClick}>{this.props.linkElement}</a></li>
            );
        }
        else {
            return (
                <li><a target={(this.props.targetBlank) ? "_blank" : ""} href={this.props.link}>{this.props.linkElement}</a></li>
            );
        }
    }
}

class BootstrapDropDownMenuButton extends React.Component<{ items: JSX.Element[] }, {}> {
    render() {
        return <div className="btn-group dropdown">
            <button type="button" disabled={this.props.items.length == 0} className="channelsdb dropdown-toggle" data-bs-toggle="dropdown" /*aria-haspopup="true"*/ aria-current="page" aria-expanded="false">
                <img src="/images/ChannelsDBlogo_transparent.png" />
            </button>
            <ul className="dropdown-menu">
                {this.props.items}
            </ul>
        </div>
    }
}

interface DropDownMenuState {
    computationId: string,
    hasChannelsDBSubmission: boolean,
    pdbid: string | null
}
class DropDownMenu extends React.Component<{ app: Annotate, canAnnotate: boolean }, DropDownMenuState> {
    state: DropDownMenuState = { computationId: "", hasChannelsDBSubmission: false, pdbid: null }

    componentDidMount() {
        let params = getParameters();
        if (params !== null) {
            let computationId = params.computationId;
            let s = this.state;
            s.computationId = computationId;
            this.setState(s);

            ComputationInfo.DataProvider.get(computationId, (compid, info) => {
                let s1 = this.state;
                if (info.PdbId !== void 0 && info.PdbId !== null && info.PdbId !== "") {
                    s1.hasChannelsDBSubmission = true;
                    s1.pdbid = info.PdbId;
                }
                else {
                    s1.hasChannelsDBSubmission = false;
                }
                this.setState(s1);
            });
        }

    }

    render() {
        let computationId = this.state.computationId;

        let items: JSX.Element[] = [];

        if (computationId !== void 0) {
            if (this.state.hasChannelsDBSubmission) {
                if (this.state.pdbid !== null) {
                    let channelsDBLink = `${CommonOptions.CHANNELSDB_LINK_DETAIL_URL}/${this.state.pdbid}`;
                    items.push(
                        <BootstrapDropDownMenuItem linkText="Open in ChannelsDB" link={channelsDBLink} targetBlank={true} />
                    );
                }
                // items.push(
                //     <BootstrapDropDownMenuItem linkText="Vizualize" onClick={() => {
                //         fakeRedirect(computationId, "ChannelsDB");
                //         // LiteMol.Example.Channels.State.removeChannelsData(Instances.getPlugin());
                //         BridgeEvents.invokeChangeSubmitId(-1);
                //     }} />
                // );
            }
            if (this.props.canAnnotate) {
                items.push(
                    <BootstrapDropDownMenuItem linkText="Annotate" onClick={() => {
                        let s = this.props.app.state;
                        // s.annotationFormVisible = !s.annotationFormVisible;
                        this.props.app.setState({
                            annotationFormVisible: !s.annotationFormVisible
                        });
                    }} />
                );
            }
        }

        return <BootstrapDropDownMenuButton items={items} />
    }
}

type AnnotationFormData = AnnotationData;
type TunnelAnnotation = AnnotationToChannelsDBService_TunnelAnnotation;
type ResidueAnnotation = AnnotationToChannelsDBService_ResidueAnnotation;
type ReferenceType = AnnotationToChannelsDBService_ReferenceType;

type OnClearEventHandler = () => void;
class Events {
    private static handlers: OnClearEventHandler[] = [];

    public static attachOnClearEventHandler(h: () => void) {
        this.handlers.push(h);
    }

    public static invokeOnClear() {
        for (let h of this.handlers) {
            h();
        }
    }
}

interface AnnotateFormProps {
    computationId: string,
    submitId: number,
    visible: boolean,
    app: Annotate
}
interface AnnotateFormState {
    data: AnnotationFormData | null,
    mailValid: boolean,
    errorMsg?: string,
    infoMsg?: string
}
class AnnotateForm extends React.Component<AnnotateFormProps, AnnotateFormState> {
    state: AnnotateFormState = {
        data: null,
        mailValid: true,
        errorMsg: void 0,
        infoMsg: void 0
    };

    componentDidMount() {
        this.resetData();
    }

    getDefaultWorkingItem() {
        return {
            CompId: this.props.computationId,
            SubmitId: this.props.submitId,
            Email: "",
            Message: "",
            ResidueAnnotations: [],
            TunnelAnnotations: []
        }
    }

    resetData() {
        const s = this.state;
        s.data = this.getDefaultWorkingItem();
        this.setState(s);
    }

    componentWillReceiveProps(newProps: AnnotateFormProps) {
        if (this.props.visible != newProps.visible) {
            this.resetData();
        }
    }

    canSubmit() {
        let data = this.state.data;
        if (data === null) {
            return false;
        }

        if (data.ResidueAnnotations.length === 0 && data.TunnelAnnotations.length === 0) {
            return false;
        }

        if (!this.state.mailValid) {
            return false;
        }


        return true;
    }

    showTabs(show: boolean) {
        const collapseSequence = $("#sequence-collapse")[0];
        const collapseBottomPanel = $("#bottom-panel-collapse")[0];
        const tabs = $("#left-panel-tabs")[0];
        const changeViewButton = $("#view-change")[0];
        if (show) {
            if (collapseBottomPanel) collapseBottomPanel.style.zIndex = 900;
            if (collapseSequence) collapseSequence.style.zIndex = 900;
            if (tabs) tabs.style.zIndex = 900;
            if (changeViewButton) changeViewButton.style.zIndex = 900;
            return;
        }
        if (collapseBottomPanel) collapseBottomPanel.style.zIndex = 0;
        if (collapseSequence) collapseSequence.style.zIndex = 0;
        if (tabs) tabs.style.zIndex = 0;
        if (changeViewButton) changeViewButton.style.zIndex = 0;
    }

    private submit(formEvent: React.FormEvent<HTMLFormElement>) {
        let data = this.state.data;
        if (data === null) {
            const s1 = this.state;
            s1.errorMsg = "There are no data to be sent. Please fill in the form below before submission."
            this.setState(s1);
            return;
        }

        if (!this.canSubmit()) {
            const s1 = this.state;
            s1.errorMsg = "The form is incomplete!. Please fill in the form below before submission."
            this.setState(s1);
            return;
        }

        ApiService.sendAnnotation(data).then(
            (value) => {
                if (value.Status === "OK") {
                    const s2 = this.state;
                    s2.infoMsg = value.Msg;
                    s2.errorMsg = void 0;
                    s2.data = this.getDefaultWorkingItem();
                    this.setState(s2);

                    Events.invokeOnClear();
                }
                else {
                    const s = this.state;
                    s.errorMsg = value.Msg;
                    s.infoMsg = void 0;
                    this.setState(s);
                }
            }
        )
            .catch(err => {
                const s = this.state;
                s.errorMsg = `Application was unable to submit your annotatons to ChannelsDB. Error message: ${err}`;
                this.setState(s);
            });

        return true;
    }

    updateCurrentElement(value: any, setter: (pto: AnnotationFormData, val: any) => AnnotationFormData) {
        if (this.state.data === null) {
            return;
        }

        let newCwi = setter(this.state.data, value);

        const s = this.state;
        s.data = newCwi;
        this.setState(s);
    }

    updateCurrentElementEmail(email: string) {
        this.updateCurrentElement(email, (pto, val) => {
            pto.Email = val;
            return pto;
        });
    }

    updateCurrentElementMessage(message: string) {
        this.updateCurrentElement(message, (pto, val) => {
            pto.Message = val;
            return pto;
        });
    }

    render() {
        let infoMsg;
        if (this.state.infoMsg !== void 0) {
            infoMsg = <div className="error-message alert-success">
                {this.state.infoMsg}
            </div>
        }
        let errorMsg;
        if (this.state.errorMsg !== void 0) {
            errorMsg = <div className="error-message alert-danger">
                {this.state.errorMsg}
            </div>
        }
        let data = this.state.data;

        let isMailValidOrBlank = (value: string) => {
            let valid = true;
            if (value !== "") {
                valid = RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/).test(value);
            }

            return {
                valid,
                Msg: (valid) ? void 0 : "Mail address has invalid format!"
            } as ValidationResult;
        };

        let items: JSX.Element[] = [];

        if (data !== null) {
            items.push(
                <input type="hidden" name="CompId" value={data.CompId} />
            );
            items.push(
                <input type="hidden" name="SubmitId" value={data.SubmitId} />
            );
            items.push(
                <EmailTextBox id="AnnotateFormEmail" name="Email" label="Email" onValueChange={((e: any) => {
                    this.updateCurrentElementEmail(e);
                    let s = this.state;
                    s.mailValid = true;
                    this.setState(s);
                }).bind(this)} value={data.Email} isValid={isMailValidOrBlank} onInvalid={(() => {
                    this.updateCurrentElementEmail("");
                    let s = this.state;
                    s.mailValid = false;
                    this.setState(s);
                }).bind(this)} placeholder={Bundle.get("placeholder-annotate-email")} />
            );
            items.push(
                <TextAreaBox id="AnnotateFormMessage" name="Message" label="Message" onValueChange={this.updateCurrentElementMessage.bind(this)} value={data.Message} placeholder={Bundle.get("placeholder-annotate-message")} />
            );
            items.push(
                <TunnelAnnotations form={this} items={data.TunnelAnnotations} />
            );
            items.push(
                <ResidueAnnotations form={this} items={data.ResidueAnnotations} />
            );
        }
        this.props.visible ? this.showTabs(false) : this.showTabs(true);
        return <div>
            <div className={`annotate-form-fade ${(this.props.visible) ? "visible" : ''}`}></div>
            <div className={`annotate-form`} style={{visibility: this.props.visible ? 'visible' : 'collapse'}}>
                {infoMsg}
                {errorMsg}
                <div className="scroll-container">
                    <div className="annotate-form-header">
                        <img src="/images/ChannelsDBlogo.png" />
                        <p>
                            Submit annotation of your published channels and residues important for channel's functionality to make your results interactively available to everyone at any time. Additionally, results of your research will be visible along the structure at Protein Data Bank in Europe webpages.
                        </p>
                    </div>
                    <form className="form-horizontal" onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.submit(e);
                    }}>

                        {items}

                        <div className="buttons">
                            <input type="submit" className="btn btn-primary" value="Submit to ChannelsDB" disabled={!this.canSubmit()} />
                        </div>
                        <div title="Close" className="btn btn-link close-button" onClick={
                            (e) => {
                                //Reset form data
                                const sLocal = this.state;
                                sLocal.data = this.getDefaultWorkingItem();
                                sLocal.errorMsg = void 0;
                                sLocal.infoMsg = void 0;
                                this.setState(sLocal);

                                Events.invokeOnClear();

                                const s = this.props.app.state;
                                s.annotationFormVisible = false;
                                this.props.app.setState(s);
                            }
                        }><i className="bi bi-x"></i></div>
                    </form>
                </div>
            </div>
        </div>
    }
}


interface ValidationResult {
    valid: boolean,
    Msg: string
}
interface TextBoxProps {
    id: string,
    name?: string,
    label?: string,
    value?: string,
    placeholder?: string,
    isValid?: (value: string) => ValidationResult,
    onInvalid?: () => void,
    onValueChange?: (value: string) => void,
}
interface TextBoxState {
    isValid: boolean,
    errMsg?: string
}
class TextBox extends React.Component<TextBoxProps, TextBoxState> {
    state: TextBoxState = {
        isValid: true
    };

    typeClassName = "TextBox";

    componentDidMount() {
        Events.attachOnClearEventHandler((() => {
            $(`#${this.props.id}`).val("");
            if (this.props.onValueChange !== void 0) {
                this.props.onValueChange("");
            }

            this.setState({
                isValid: true,
                errMsg: void 0
            });

        }).bind(this));
    }

    public validate(value: string | null) {
        if (this.props.isValid === void 0) {
            if (this.props.onValueChange !== void 0) {
                this.props.onValueChange((value === null) ? "" : value);
            }
            return true;
        }

        let valid = this.props.isValid((value === null) ? "" : value);
        if (valid.valid && this.props.onValueChange !== void 0) {
            this.props.onValueChange((value === null) ? "" : value);
        }

        const s = this.state;
        s.isValid = valid.valid;
        s.errMsg = valid.Msg;
        this.setState(s);

        return valid.valid;
    }

    protected renderCustom(): JSX.Element | undefined {
        return <input type="text" className="form-control" id={`${this.props.id}`} name={`${this.props.name}`} placeholder={this.props.placeholder} defaultValue={this.props.value} onBlur={this.checkValid.bind(this)} onSubmit={this.checkValid.bind(this)} onChange={this.checkValid.bind(this)} />
    }

    protected renderError(): JSX.Element | undefined {
        let errorPart;
        if (!this.state.isValid) {
            errorPart = <div className="error-msg">
                {(this.state.errMsg !== void 0) ? this.state.errMsg : Bundle.get("validation-error-message-default")}
            </div>
        }

        return errorPart;
    }

    protected checkValid(e: React.SyntheticEvent<HTMLElement>) {
        if (!this.validate($(e.currentTarget).val())) {
            e.preventDefault();
            e.stopPropagation();
            if (this.props.onInvalid !== void 0) {
                this.props.onInvalid();
            }
        }
    }

    render() {
        let htmlPart = this.renderCustom();

        let errorPart = this.renderError();

        let label;
        if (this.props.label !== void 0) {
            label = <label className="col-sm-1" htmlFor={`${this.props.id}`}>{this.props.label}:</label>
        }

        return <div className={`custom-box ${this.typeClassName}`}>
            <div className="form-group">
                {label}
                <div className={`col-sm-1${(label === void 0) ? 2 : 1}`}>
                    {htmlPart}
                </div>
            </div>
            {errorPart}
        </div>
    }
}

class EmailTextBox extends TextBox {
    typeClassName = "EmailBox";

    protected renderError(): JSX.Element | undefined {
        let errorPart;
        if (!this.state.isValid) {
            errorPart = <div className="col-sm-offset-1 col-sm-11">
                <div className="error-msg">
                    {(this.state.errMsg !== void 0) ? this.state.errMsg : Bundle.get("validation-error-message-default")}
                </div>
            </div>
        }

        return errorPart;
    }

    renderCustom(): JSX.Element | undefined {
        return <input type="email" className="form-control" id={`${this.props.id}`} name={`${this.props.name}`} placeholder={this.props.placeholder} defaultValue={this.props.value} onBlur={this.checkValid.bind(this)} onChange={this.checkValid.bind(this)} onSubmit={((e: any) => {
            this.checkValid(e);
        }).bind(this)} />
    }
}

class TextAreaBox extends TextBox {
    typeClassName = "TextAreaBox";

    renderCustom(): JSX.Element | undefined {
        return <textarea id={`${this.props.id}`} className="form-control" name={`${this.props.name}`} placeholder={this.props.placeholder} defaultValue={this.props.value} onBlur={this.checkValid.bind(this)} onChange={this.checkValid.bind(this)} onSubmit={((e: any) => {
            this.checkValid(e);
        }).bind(this)}></textarea>
    }
}

interface TunnelAnnotationsProps {
    items: TunnelAnnotation[],
    form: AnnotateForm,
}
interface TunnelAnnotationsState {
    tunnelData: Tunnel[],
    currentWorkingItem: TunnelAnnotation
}
class TunnelAnnotations extends React.Component<TunnelAnnotationsProps, TunnelAnnotationsState> {
    state: TunnelAnnotationsState = {
        tunnelData: [],
        currentWorkingItem: this.getDefaultWorkingItem()
    };

    tunnelNameCache: Map<string, string> | null = null;

    getTunnelNameById(tunnelId: string) {
        let tunneData = this.state.tunnelData;
        if (tunneData.length === 0) {
            return "X";
        }

        if (this.tunnelNameCache === null) {
            let mapping = new Map<string, string>();
            for (let tunnel of tunneData) {
                let name = Tunnels.getName(tunnel);
                if (name === void 0) {
                    continue;
                }
                mapping.set(tunnel.Id, name);
            }
            this.tunnelNameCache = mapping;
        }

        return this.tunnelNameCache.get(tunnelId);
    }

    remove(key: string) {
        let data = this.props.form.state.data;
        if (data === null) {
            return;
        }

        let newAnnotations = [];
        for (let item of data.TunnelAnnotations) {
            if (key === this.getRowHash(item)) {
                continue;
            }
            newAnnotations.push(item);
        }
        data.TunnelAnnotations = newAnnotations;
        const s = this.props.form.state;
        s.data = data;
        this.props.form.setState(s);
    }

    componentDidMount() {
        Events.attachOnClearEventHandler((() => {
            this.clear();
        }).bind(this));

        BridgeEvents.subscribeChannelDataLoaded(((data: MoleData | ChannelsDBData) => {
            let tunnelData: Tunnel[] = [];

            let moleChannels = data.Channels as MoleChannels;

            tunnelData = Tunnels.concatTunnelsSafe(tunnelData, moleChannels.Tunnels);
            tunnelData = Tunnels.concatTunnelsSafe(tunnelData, moleChannels.Paths);
            tunnelData = Tunnels.concatTunnelsSafe(tunnelData, moleChannels.Pores);
            tunnelData = Tunnels.concatTunnelsSafe(tunnelData, moleChannels.MergedPores);

            if (tunnelData.length === 0) {
                return;
            }
            const s = this.state;
            s.tunnelData = tunnelData;
            this.tunnelNameCache = null;
            this.setState(s);
        }).bind(this));
    }

    generateTunnelMetadata(): ComboboxMetadata[] {
        let rv: ComboboxMetadata[] = [];
        if (this.state === void 0) {
            return rv;
        }
        for (let item of this.state.tunnelData) {
            let tunnelLabel = Tunnels.getName(item);
            rv.push({
                value: item.Id,
                label: (tunnelLabel === void 0) ? "X" : tunnelLabel
            });
        }

        return rv;
    }

    canAddCurrentWorkingItem() {
        if (this.state.currentWorkingItem.Id.length === 0) {
            return false;
        }

        if (this.state.currentWorkingItem.Name.length === 0) {
            return false;
        }

        if (this.state.currentWorkingItem.Reference.length === 0) {
            return false;
        }

        if (this.state.currentWorkingItem.ReferenceType.length === 0) {
            return false;
        }

        return true;
    }

    updateCurrentElement(value: any, setter: (pto: TunnelAnnotation, val: any) => TunnelAnnotation) {

        let newCwi = setter(this.state.currentWorkingItem, value);

        const s = this.state;
        this.setState({
            tunnelData: s.tunnelData,
            currentWorkingItem: newCwi
        });
    }

    updateCurrentElementTunnelId(tunnelId: string) {
        this.updateCurrentElement(tunnelId, (pto, val) => {
            pto.Id = val;
            return pto;
        });
    }

    updateCurrentElementReferenceType(referenceType: ReferenceType) {
        this.updateCurrentElement(referenceType, (pto, val) => {
            pto.ReferenceType = val;
            return pto;
        });
    }

    updateCurrentElementReference(reference: string) {
        this.updateCurrentElement(reference, (pto, val) => {
            pto.Reference = val;
            return pto;
        });
    }

    updateCurrentElementName(name: string) {
        this.updateCurrentElement(name, (pto, val) => {
            pto.Name = val;
            return pto;
        });
    }

    updateCurrentElementDescription(description: string) {
        this.updateCurrentElement(description, (pto, val) => {
            pto.Description = val;
            return pto;
        });
    }

    clear() {

        let dwi = this.getDefaultWorkingItem();

        let elements = [
            { id: "TunnelIdCombobox", value: dwi.Id },
            { id: "ChannelName", value: dwi.Name },
            { id: "ChannelDescription", value: dwi.Description },
            { id: "ChannelReference", value: dwi.Reference },
            { id: "ReferenceTypeCombobox", value: dwi.ReferenceType }
        ];

        for (let el of elements) {
            $(`#${el.id}`).val(el.value);
        }

        const s = this.state;
        s.currentWorkingItem = dwi;
        this.setState(s);
    }

    getDefaultWorkingItem(): TunnelAnnotation {
        let tunnels = this.generateTunnelMetadata();
        return {
            Id: (tunnels.length > 0) ? tunnels[0].value : "",
            Name: "",
            Description: "",
            Reference: "",
            ReferenceType: "DOI"
        }
    }

    generateControlRow() {
        let tunnelMetadata = this.generateTunnelMetadata();
        let notEmpty: (val: string) => ValidationResult = (value: string) => {
            let valid = value !== void 0 && value !== null && value.length > 0;
            return {
                valid,
                Msg: (valid) ? void 0 : Bundle.get("validation-error-message-not-empty")
            }
        }
        let cwi = this.state.currentWorkingItem;

        return <tr>
            <td>
                <Combobox id="TunnelIdCombobox" onValueChange={this.updateCurrentElementTunnelId.bind(this)} items={tunnelMetadata} value={(cwi.Id === "") ? void 0 : cwi.Id} />
            </td>
            <td>
                <TextBox id="ChannelName" placeholder="Name of the channel" onInvalid={(() => { this.updateCurrentElementName("") }).bind(this)} onValueChange={this.updateCurrentElementName.bind(this)} isValid={notEmpty.bind(this)} value={cwi.Name} />
            </td>
            <td>
                <TextBox id="ChannelDescription" placeholder="Description of channel function" onInvalid={(() => { this.updateCurrentElementDescription("") }).bind(this)} onValueChange={this.updateCurrentElementDescription.bind(this)} value={cwi.Description} />
            </td>
            <td>
                <TextBox id="ChannelReference" placeholder="DOI or Pubmed ID" onInvalid={(() => { this.updateCurrentElementReference("") }).bind(this)} onValueChange={this.updateCurrentElementReference.bind(this)} isValid={notEmpty.bind(this)} value={cwi.Reference} />
            </td>
            <td>
                <Combobox id="ReferenceTypeCombobox" items={[{ value: "DOI", label: "DOI" }, { value: "Pubmed", label: "Pubmed" }]} onValueChange={this.updateCurrentElementReferenceType.bind(this)} value={(cwi.ReferenceType === "") ? void 0 : cwi.ReferenceType} />
            </td>
            <td>
                <div className={`btn btn-success bi bi-plus${(this.canAddCurrentWorkingItem()) ? '' : ' disabled'}`} onClick={((e: React.MouseEvent<HTMLDivElement>) => {
                    if ($(e.currentTarget).hasClass("disabled")) {
                        return;
                    }

                    let data = this.props.form.state.data;
                    if (data !== null && this.state.currentWorkingItem !== null) {
                        const tunnelAnnotations = data.TunnelAnnotations;
                        tunnelAnnotations.push(this.state.currentWorkingItem);
                        const s = this.props.form.state;
                        if (s.data !== null) {
                            s.data.TunnelAnnotations = tunnelAnnotations;
                            this.props.form.setState(s);
                            this.clear();
                        }
                    }
                }).bind(this)} />
            </td>
        </tr>
    }

    getRowHash(item: TunnelAnnotation) {
        return `${item.Id}&&${item.Name}&&${item.Description}&&${item.Reference}&&${item.ReferenceType}`;
    }

    generateInfoRow(item: TunnelAnnotation) {
        const tunneld = item.Id;

        const onClick = (e: any) => {
            let hash = e.currentTarget.dataset["key"];
            if (hash === void 0) {
                return;
            }
            this.remove(hash);
        }

        let tunnelName = this.getTunnelNameById(tunneld);

        return <tr>
            <td>
                {(tunnelName !== void 0) ? tunnelName : tunneld}
            </td>
            <td>
                {item.Name}
            </td>
            <td>
                {item.Description}
            </td>
            <td>
                {item.Reference}
            </td>
            <td>
                {item.ReferenceType}
            </td>
            <td>
                <div className="btn btn-danger glyphicon glyphicon-remove" data-key={this.getRowHash(item)} onClick={onClick.bind(this)} />
            </td>
        </tr>
    }

    render() {
        let body: JSX.Element[] = [];
        body.push(this.generateControlRow());
        for (let item of this.props.items) {
            body.push(this.generateInfoRow(item));
        }

        return <div className="channel-annotations table-responsive">
            <h2>Channel Annotations</h2>
            <table className="table table-bordered table-striped table-condensed">
                <thead>
                    <tr>
                        <th>
                            Id
                        </th>
                        <th>
                            Name
                        </th>
                        <th>
                            Description
                        </th>
                        <th>
                            Reference
                        </th>
                        <th>
                            Reference Type
                        </th>
                        <th>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {body}
                </tbody>
            </table>
        </div>
    }
}

interface ComboboxMetadata {
    value: string
    label: string
}

interface ComboboxProps {
    id: string,
    items: ComboboxMetadata[],
    value?: string,
    label?: string,
    onValueChange?: (value: string) => void,
}
interface ComboboxState {
}
class Combobox extends React.Component<ComboboxProps, ComboboxState> {
    state: ComboboxState = {};

    reportCurrentValueChange(value?: string) {
        if (this.props.onValueChange !== void 0) {
            if (value !== void 0) {
                this.props.onValueChange(value);
            }
            else if (this.props.items.length > 0) {
                this.props.onValueChange(this.props.items[0].value);
            }
        }
    }

    componentDidMount() {
        this.reportCurrentValueChange();
    }

    itemsChanged(newItems: ComboboxMetadata[]) {
        if (newItems.length !== this.props.items.length) {
            return true;
        }

        for (let i = 0; i < this.props.items.length; i++) {
            if (this.props.items[i].value !== newItems[i].value) {
                return true;
            }
        }

        return false;
    }

    componentWillReceiveProps(nextProps: ComboboxProps) {
        if (this.props.value !== nextProps.value) {
            this.reportCurrentValueChange(nextProps.value);
        } else if (this.itemsChanged(nextProps.items)) {
            let value = "";
            if (nextProps.items.length > 0) {
                value = nextProps.items[0].value;
            }
            this.reportCurrentValueChange(value);
        }
    }

    generateInnerElements(items: ComboboxMetadata[]): JSX.Element[] {
        let rv = [];
        for (let i = 0; i < items.length; i++) {
            rv.push(
                <option value={items[i].value}>{items[i].label}</option>
            );
        }

        return rv;
    }

    render() {
        let items = this.generateInnerElements(this.props.items);
        let label = this.props.label;
        let errorPart;

        return <div className="custom-box combobox">
            <div className="form-group">
                {label}
                <div className={`col-sm-1${(label === void 0) ? 2 : 1}`}>
                    <select className="form-control" id={`${this.props.id}`} defaultValue={this.props.value} onChange={((e: React.FormEvent<HTMLSelectElement>) => {
                        if (this.props.onValueChange !== void 0) {
                            this.props.onValueChange((e.currentTarget.options[e.currentTarget.selectedIndex] as HTMLOptionElement).value);
                        }
                    }).bind(this)}>
                        {items}
                    </select>
                </div>
            </div>
            {errorPart}
        </div>
    }
}

interface ResidueAnnotationsProps {
    items: ResidueAnnotation[],
    form: AnnotateForm,
}
interface ResidueAnnotationsState {
    currentWorkingItem: ResidueAnnotation
}
class ResidueAnnotations extends React.Component<ResidueAnnotationsProps, ResidueAnnotationsState> {
    state: ResidueAnnotationsState = {
        currentWorkingItem: this.getDefaultWorkingItem()
    };

    getDefaultWorkingItem(): ResidueAnnotation {
        return {
            Id: "",
            Chain: "",
            Text: "",
            Reference: "",
            ReferenceType: "DOI"
        }
    }

    remove(key: string) {
        let data = this.props.form.state.data;
        if (data === null) {
            return;
        }

        let newAnnotations = [];
        for (let item of data.ResidueAnnotations) {
            if (key === this.getRowHash(item)) {
                continue;
            }
            newAnnotations.push(item);
        }
        data.ResidueAnnotations = newAnnotations;
        const s = this.props.form.state;
        s.data = data;
        this.props.form.setState(s);
    }

    componentDidMount() {
        Events.attachOnClearEventHandler((() => {
            this.clear();
        }).bind(this));
    }

    canAddCurrentWorkingItem() {
        if (this.state.currentWorkingItem.Id.length === 0) {
            return false;
        }

        if (this.state.currentWorkingItem.Chain.length === 0) {
            return false;
        }

        if (this.state.currentWorkingItem.Text.length === 0) {
            return false;
        }

        if (this.state.currentWorkingItem.Reference.length === 0) {
            return false;
        }

        if (this.state.currentWorkingItem.ReferenceType.length === 0) {
            return false;
        }

        return true;
    }

    updateCurrentElement(value: any, setter: (pto: ResidueAnnotation, val: any) => ResidueAnnotation) {
        let newCwi = setter(this.state.currentWorkingItem, value);

        this.setState({
            currentWorkingItem: newCwi
        });
    }

    updateCurrentElementIdAndChain(residueId: string) {
        let residues = parseResidues(residueId);
        if (residues.length !== 1) {
            this.updateCurrentElement("", (pto, val) => {
                pto.Id = "";
                pto.Chain = "";
                return pto;
            });
            return;
        }

        this.updateCurrentElement(residues[0], (pto, val) => {
            pto.Id = val.SequenceNumber;
            pto.Chain = val.Chain;
            return pto;
        });
    }

    updateCurrentElementReferenceType(referenceType: ReferenceType) {
        this.updateCurrentElement(referenceType, (pto, val) => {
            pto.ReferenceType = val;
            return pto;
        });
    }

    updateCurrentElementReference(reference: string) {
        this.updateCurrentElement(reference, (pto, val) => {
            pto.Reference = val;
            return pto;
        });
    }

    updateCurrentElementText(text: string) {
        this.updateCurrentElement(text, (pto, val) => {
            pto.Text = val;
            return pto;
        });
    }

    clear() {
        let dwi = this.getDefaultWorkingItem();
        let idAndChain = `${dwi.Id} ${dwi.Chain}`;
        if (idAndChain === " ") {
            idAndChain = "";
        }
        let elements = [
            { id: "ResidueId", value: idAndChain },
            { id: "ResidueText", value: dwi.Text },
            { id: "ResidueReference", value: dwi.Reference },
            { id: "ResidueReferenceTypeCombobox", value: dwi.ReferenceType }
        ];

        for (let el of elements) {
            $(`#${el.id}`).val(el.value);
        }

        const s = this.state;
        s.currentWorkingItem = dwi;
        this.setState(s);
    }

    generateControlRow() {
        let notEmpty: (val: string) => ValidationResult = (value: string) => {
            let valid = value !== void 0 && value !== null && value.length > 0;
            return {
                valid,
                Msg: (valid) ? void 0 : Bundle.get("validation-error-message-not-empty")
            }
        }

        let isResidue: (val: string) => ValidationResult = (value: string) => {
            if (value.length === 0) {
                return {
                    valid: false,
                    Msg: Bundle.get("validation-error-message-not-empty")
                };
            }

            let valid = parseResidues(value).length === 1;

            return {
                valid,
                Msg: (!valid) ? Bundle.get("validation-error-message-residue-invalid-format") : void 0
            }
        }

        let cwi = this.state.currentWorkingItem;
        let idAndChain = `${cwi.Id} ${cwi.Chain}`;
        return <tr>
            <td>
                <TextBox id="ResidueId" placeholder="142 A" onInvalid={(() => { this.updateCurrentElementIdAndChain("") }).bind(this)} onValueChange={this.updateCurrentElementIdAndChain.bind(this)} isValid={isResidue.bind(this)} value={(idAndChain === " ") ? void 0 : idAndChain} />
            </td>
            <td>
                <TextBox id="ResidueText" placeholder="Annotation of residue function" onInvalid={(() => { this.updateCurrentElementText("") }).bind(this)} onValueChange={this.updateCurrentElementText.bind(this)} isValid={notEmpty.bind(this)} value={cwi.Text} />
            </td>
            <td>
                <TextBox id="ResidueReference" placeholder="DOI or Pubmed ID" onInvalid={(() => this.updateCurrentElementReference("")).bind(this)} onValueChange={this.updateCurrentElementReference.bind(this)} isValid={notEmpty.bind(this)} value={cwi.Reference} />
            </td>
            <td>
                <Combobox id="ResidueReferenceTypeCombobox" items={[{ value: "DOI", label: "DOI" }, { value: "Pubmed", label: "Pubmed" }]} onValueChange={this.updateCurrentElementReferenceType.bind(this)} value={(cwi.ReferenceType === "") ? void 0 : cwi.ReferenceType} />
            </td>
            <td>
                <div className={`btn btn-success bi bi-plus${(this.canAddCurrentWorkingItem()) ? '' : ' disabled'}`} onClick={(e) => {
                    if ($(e.currentTarget).hasClass("disabled")) {
                        return;
                    }

                    let data = this.props.form.state.data;
                    if (data !== null && this.state.currentWorkingItem !== null) {
                        const residueAnnotations = data.ResidueAnnotations;
                        residueAnnotations.push(this.state.currentWorkingItem);
                        const s = this.props.form.state;
                        if (s.data !== null) {
                            s.data.ResidueAnnotations = residueAnnotations;
                            this.props.form.setState(s);

                            this.clear();
                        }
                    }
                }} />
            </td>
        </tr>
    }

    generateInfoRow(item: ResidueAnnotation) {
        const residueId = item.Id;

        return <tr>
            <td>
                {item.Id + ' ' + item.Chain}
            </td>
            <td>
                {item.Text}
            </td>
            <td>
                {item.Reference}
            </td>
            <td>
                {item.ReferenceType}
            </td>
            <td>
                <div className="btn btn-danger glyphicon glyphicon-remove" data-key={this.getRowHash(item)} onClick={((e: React.MouseEvent<HTMLDivElement>) => {
                    let hash = e.currentTarget.dataset["key"];
                    if (hash === void 0) {
                        return;
                    }
                    this.remove(hash);
                }).bind(this)} />
            </td>
        </tr>
    }

    getRowHash(item: ResidueAnnotation) {
        return `${item.Id}&&${item.Chain}&&${item.Text}&&${item.Reference}&&${item.ReferenceType}`;
    }

    render() {
        let body: JSX.Element[] = [];
        body.push(this.generateControlRow());
        for (let item of this.props.items) {
            body.push(this.generateInfoRow(item));
        }

        return <div className="residue-annotations table-responsive">
            <h2>Residue Annotations</h2>
            <table className="table table-bordered table-striped table-condensed">
                <thead>
                    <tr>
                        <th>
                            Id
                        </th>
                        <th>
                            Text
                        </th>
                        <th>
                            Reference
                        </th>
                        <th>
                            Reference Type
                        </th>
                        <th>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {body}
                </tbody>
            </table>
        </div>
    }
}

function parseResidues(residues: string | undefined): { Chain: string, SequenceNumber: number }[] {
    if (residues === void 0) {
        return [];
    }

    residues = residues.replace(/\s*,\s*/g, ",");
    let items = residues.split(',');
    let rv = [];

    let seqNumReg = new RegExp(/^[0-9]+$/);
    let chainReg = new RegExp(/^\D+\S*$/);

    for (let item of items) {
        let r = item.split(' ');
        if (r.length > 2) {
            continue;
        }
        let seqNum;
        let chain;
        for (let part of r) {
            if (seqNumReg.test(part)) {
                seqNum = Number(part);
                continue;
            }
            if (chainReg.test(part)) {
                chain = part;
                continue;
            }
        }
        if (chain !== void 0 && seqNum !== void 0) {
            rv.push(
                {
                    Chain: chain,
                    SequenceNumber: seqNum
                }
            );
        }
    }

    return rv;
}
