import React from "react";
import { Events } from "../../../Bridge";
import { getParameters } from "../../../Common/Util/Router";
import { DataSources } from "../../../../config/common";
import { Tunnels } from "../../CommonUtils/Tunnels";
import { cleanCifContent, JSON2CIF } from "../../VizualizerMol/mmcif-tunnels/converter";
import { TwoDProtsBridge } from "../../CommonUtils/TwoDProtsBridge";

export class DownloadReport extends React.Component<{}, {}> {

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        return <div className="download-button">
            <DownloadResultsMenu />
        </div>
    }
}

class BootstrapDropDownMenuItem extends React.Component<{ link?: string, linkText: string, targetBlank?: boolean, onClick?: () => void }, {}> {
    render() {
        return (
            <li><a className="dropdown-item" onClick={this.props.onClick} target={(this.props.targetBlank) ? "_blank" : ""} href={this.props.link}>{this.props.linkText}</a></li>
        );
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

class BootstrapDropDownMenuButton extends React.Component<{ label: string, items: JSX.Element[] }, {}> {
    render() {
        return <div className="btn-group dropdown">
            <button type="button" className="download dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {this.props.label} <span className="bi bi-download"></span>
            </button>
            <ul className="dropdown-menu">
                {this.props.items}
            </ul>
        </div>
    }
}

interface DownloadResultsMenuState {
    computationId: string,
    submitId: number
}
class DownloadResultsMenu extends React.Component<{}, DownloadResultsMenuState> {
    state = { computationId: "", submitId: 0 }

    componentDidMount() {
        let params = getParameters();
        if (params !== null) {
            let computationId = params.computationId;
            let submitId = params.submitId;
            if (params.isChannelsDB) {
                submitId = -1;
            }
            this.setState({ computationId, submitId });
        }

        Events.subscribeChangeSubmitId((submitId) => {
            let state = this.state;
            state.submitId = submitId;
            this.setState(state);
        });
    }

    private async generateMoleculeContent() {
        let computationId = this.state.computationId;
        let submitId = `?submitId=${this.state.submitId}`;
        let linkBase = `${DataSources.API_URL[DataSources.MODE]}/Data/${computationId}${submitId}`;
        const url = `${linkBase}&format=molecule`

        const response = await fetch(url)
        if (!response.ok) {
            //TODO toast
            console.log("Fetching molecule data went wrong");
            return;
        }

        let cifText = await response.text();
        // cifText = removeLoopsFromMMCIF(cifText);
        cifText = cleanCifContent(cifText);
        const tunnelData = Tunnels.generateTunnelsDataJson();
        const tunnelDataStr = JSON.stringify(tunnelData);
        const parsedString = JSON2CIF("data_tunnels", tunnelDataStr);
        let updatedCifText = '';
        if (parsedString.trim() !== '') {
            const auditLine = `mmcif_tunnels_v10.dic 1.0 https://sb-ncbr.github.io/tunnels-schema/schemas/mmcif_tunnels_v10.dic`;

            if (!cifText.includes("_audit_conform")) {
                const auditBlock = `
loop_
_audit_conform.dict_name
_audit_conform.dict_version
_audit_conform.dict_location
${auditLine}
    `.trim();
    
                updatedCifText = `${cifText}\n\n${auditBlock}`;
            } else {
                updatedCifText = cifText.replace(/(loop_\s*_audit_conform[\s\S]*?)(?=(\n[^_]|$))/m, (match) => {
                    return `${match.trim()}\n${auditLine}`;
                });
            }
        } else {
            updatedCifText = cifText;
        }

        const fullCifContent = `${updatedCifText}\n${parsedString}`;

        const blob = new Blob([fullCifContent], { type: "text/plain" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "structure.cif";

        link.click();

        URL.revokeObjectURL(link.href);
    }

    render() {
        let computationId = this.state.computationId;
        let submitId = `?submitId=${this.state.submitId}`;

        let linkBase = `${DataSources.API_URL[DataSources.MODE]}/Data/${computationId}${submitId}`;

        let items: JSX.Element[] = [];

        if (computationId !== void 0) {
            items.push(
                <BootstrapDropDownMenuItem linkText="mmCIF" /*link={`${linkBase}&format=molecule`}*/ targetBlank={true} onClick={() => {
                    this.generateMoleculeContent();
                }} />
            );
            if (this.state.submitId > 0) {
                items.push(
                    <BootstrapDropDownMenuItem linkText="PyMol" link={`${linkBase}&format=pymol`} targetBlank={true} />
                );
                items.push(
                    <BootstrapDropDownMenuItem linkText="VMD" link={`${linkBase}&format=vmd`} targetBlank={true} />
                );
                items.push(
                    <BootstrapDropDownMenuItem linkText="PDB" link={`${linkBase}&format=pdb`} targetBlank={true} />
                );
                items.push(
                    <BootstrapDropDownMenuItem linkText="Chimera" link={`${linkBase}&format=chimera`} targetBlank={true} />
                );
                items.push(
                    <BootstrapDropDownMenuItem linkText="JSON" link={`${linkBase}`} targetBlank={true} />
                );
                items.push(
                    <BootstrapDropDownMenuItem linkText="Results" link={`${linkBase}&format=report`} targetBlank={true} />
                );
            }
            if (this.state.submitId !== 0) {
                items.push(
                    <BootstrapDropDownMenuItem linkText="PDF report" onClick={() => {
                        Events.invokeRunPDFReport();
                    }} />
                );
            }
        }
        return <BootstrapDropDownMenuButton label="Download" items={items} />
    }
}
