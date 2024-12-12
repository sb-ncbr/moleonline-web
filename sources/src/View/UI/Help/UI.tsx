import React from "react";
import { Events as BridgeEvents } from "../../../Bridge";
import { ApiService } from "../../../MoleAPIService";
import { Bundle } from "../../../StaticData";
import { getParameters } from "../../../Common/Util/Router";

declare function $(p: any, p1?: any): any;

interface State {
    dialogOpen: boolean
    session: string
    computationId: string,
    submitId: number
};

export class Help extends React.Component<{}, State> {
    state: State = {
        dialogOpen: false,
        session: "",
        computationId: "",
        submitId: 0
    };

    private updateSessionState() {
        let s = this.state;
        let params = getParameters();
        if (params === null) {
            s.session = "<Unknown>"
        }
        else {
            s.session = `${params.computationId}`;
            s.computationId = params.computationId;

            if (params.submitId < 0 || params.isChannelsDB) {
                s.session += "/ChannelsDB"
                s.submitId = -1;
            }
            else if (params.submitId > 0) {
                s.session += "/" + String(params.submitId);
                s.submitId = params.submitId;
            }
            else {
                s.submitId = 0;
            }
        }

        this.setState(s);
        $("#session").val(s.session);
    }

    componentDidMount() {

        this.updateSessionState();

        BridgeEvents.subscribeChangeSubmitId(() => {
            this.updateSessionState();
        })
    }

    componentWillUnmount() {
    }

    private isMailFormatValid(value: string) {
        let valid = true;
        if (value !== "") {
            valid = RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/).test(value);
        }

        return {
            valid,
            Msg: (valid) ? void 0 : "Mail address has invalid format!"
        } as ValidationResult;
    }

    private isMailValid(value: string) {
        let valid = this.isNotEmpty(value, "Please fill in your mail address. So we can contact you with our reply.");
        if (!valid.valid) {
            return valid;
        }

        return this.isMailFormatValid(value);
    }

    private isNotEmpty(value: string, invalidMessage: string) {
        let valid = true;
        valid = value.length > 0;

        return {
            valid,
            Msg: (valid) ? void 0 : invalidMessage
        } as ValidationResult;
    }

    private isMessageValid(value: string) {
        return this.isNotEmpty(value, "Message cannot be empty!");
    }


    checkFormValid() {
        let mailValid = this.isMailValid($("#email").val()).valid;
        let messageValid = this.isMessageValid($("#message").val()).valid;

        if (!mailValid) {
            $("#email").focus();
            $("#message").focus();
            $("#email").focus();
        }

        if (!messageValid) {
            $("#message").focus();
            $("#email").focus();
            $("#message").focus();
        }

        return mailValid && messageValid;
    }

    render() {

        let session = this.state.session;
        let dialog = <div className={`helpDialog form-horizontal ${(this.state.dialogOpen) ? "visible" : ""}`}>
            <div className="description">
                Something went wrong? Calculation results are not as expected?<br /><br /> Please send us a&nbsp;message so we can help.
            </div>
            <TextBox label="Session" value={session} id="session" disabled={true} />
            <EmailTextBox label="Email" id="email" value="@" isValid={this.isMailValid.bind(this)} />
            <TextAreaBox label="Message" id="message" isValid={this.isMessageValid.bind(this)} />
            <div className="btn btn-primary submit" data-loading-text="Sending..." onClick={() => {
                if ($(".helpDialog .submit").attr("disabled") === "disabled") {
                    return;
                }

                if (!this.checkFormValid()) {
                    return;
                }

                $(".helpDialog .submit").button("loading");

                let messageObject = {
                    ComputationId: this.state.computationId,
                    SubmitId: this.state.submitId,
                    From: $("#email").val(),
                    Msg: $("#message").val()
                };

                ApiService.submitFeedback(
                    messageObject
                ).then((val) => {

                    if (val.Success) {
                        BridgeEvents.invokeNotifyMessage({
                            messageType: "Success",
                            message: (val.Msg === void 0 || val.Msg === null) ? "The message has been succesfully sent." : val.Msg
                        });

                        $("#email").val("@");
                        $("#message").val("");

                        let s = this.state;
                        s.dialogOpen = false;
                        this.setState(s);
                    }
                    else {
                        let reason = ".";
                        if (val.Msg !== void 0 && val.Msg !== null) {
                            reason = `. Error message: '${val.Msg}'`;
                        }
                        BridgeEvents.invokeNotifyMessage({
                            messageType: "Warning",
                            message: `Application was unable to send your message${reason} Please try send it again later.`
                        });
                    }

                    $(".helpDialog .submit").button("reset");
                }).catch(err => {
                    BridgeEvents.invokeNotifyMessage({
                        messageType: "Warning",
                        message: `Application was unable to send your message. Please try send it again later...`
                    });

                    $(".helpDialog .submit").button("reset");
                });


            }}>Send</div>
        </div>

        return <div className="help-button">
            <div className="button" onClick={() => {
                let s = this.state;
                s.dialogOpen = !s.dialogOpen;
                this.setState(s);
            }}>Help <span className="bi bi-question-circle help-ico"></span></div>
            {dialog}
        </div>
    }
}

//--

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
    disabled?: boolean
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
        return <input disabled={this.props.disabled} type="text" className="form-control" id={`${this.props.id}`} name={`${this.props.name}`} placeholder={this.props.placeholder} defaultValue={this.props.value} onBlur={this.checkValid.bind(this)} onSubmit={this.checkValid.bind(this)} onChange={this.checkValid.bind(this)} />
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
        return <input disabled={this.props.disabled} type="email" className="form-control" id={`${this.props.id}`} name={`${this.props.name}`} placeholder={this.props.placeholder} defaultValue={this.props.value} onBlur={this.checkValid.bind(this)} onChange={this.checkValid.bind(this)} onSubmit={((e: any) => {
            this.checkValid(e);
        }).bind(this)} />
    }
}

class TextAreaBox extends TextBox {
    typeClassName = "TextAreaBox";

    renderCustom(): JSX.Element | undefined {
        return <textarea disabled={this.props.disabled} id={`${this.props.id}`} className="form-control" name={`${this.props.name}`} placeholder={this.props.placeholder} defaultValue={this.props.value} onBlur={this.checkValid.bind(this)} onChange={this.checkValid.bind(this)} onSubmit={((e: any) => {
            this.checkValid(e);
        }).bind(this)}></textarea>
    }
}