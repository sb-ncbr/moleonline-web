import React from "react";
import { Events } from "../../../Bridge";
import { getParameters } from "../../../Common/Util/Router";
import { DataSources } from "../../../../config/common";
import { Tunnels } from "../../CommonUtils/Tunnels";
import { JSON2CIF } from "../../VizualizerMol/mmcif-tunnels/converter";
import { TwoDProtsBridge } from "../../CommonUtils/TwoDProtsBridge";

declare function gtag(ga_type: string, action: string, options: { 'event_category': string, 'event_label'?: string, 'value'?: any }): any;

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

        const cifText = await response.text();
        const tunnelData = TwoDProtsBridge.generateTunnelsDataJson();
        const tunnelDataStr = JSON.stringify(tunnelData);
        const parsedString = JSON2CIF("data_tunnels", tunnelDataStr);

        const fullCifContent = `${cifText}\n${parsedString}`

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
                <BootstrapDropDownMenuItem linkText="Molecule" /*link={`${linkBase}&format=molecule`}*/ targetBlank={true} onClick={() => {
                    gtag('event', 'Download', { 'event_category': 'molecule' });
                    this.generateMoleculeContent();
                }} />
            );
            if (this.state.submitId > 0) {
                items.push(
                    <BootstrapDropDownMenuItem linkText="PyMol" link={`${linkBase}&format=pymol`} targetBlank={true} onClick={() => {
                        gtag('event', 'Download', { 'event_category': 'pymol' });
                    }} />
                );
                items.push(
                    <BootstrapDropDownMenuItem linkText="VMD" link={`${linkBase}&format=vmd`} targetBlank={true} onClick={() => {
                        gtag('event', 'Download', { 'event_category': 'vmd' });
                    }} />
                );
                items.push(
                    <BootstrapDropDownMenuItem linkText="PDB" link={`${linkBase}&format=pdb`} targetBlank={true} onClick={() => {
                        gtag('event', 'Download', { 'event_category': 'pdb' });
                    }} />
                );
                items.push(
                    <BootstrapDropDownMenuItem linkText="Chimera" link={`${linkBase}&format=chimera`} targetBlank={true} onClick={() => {
                        gtag('event', 'Download', { 'event_category': 'chimera' });
                    }} />
                );
                items.push(
                    <BootstrapDropDownMenuItem linkText="JSON" link={`${linkBase}`} targetBlank={true} onClick={() => {
                        gtag('event', 'Download', { 'event_category': 'json' });
                    }} />
                );
                items.push(
                    <BootstrapDropDownMenuItem linkText="Results" link={`${linkBase}&format=report`} targetBlank={true} onClick={() => {
                        gtag('event', 'Download', { 'event_category': 'zip' });
                    }} />
                );
            }
            if (this.state.submitId !== 0) {
                items.push(
                    <BootstrapDropDownMenuItem linkText="PDF report" onClick={() => {
                        gtag('event', 'Download', { 'event_category': 'pdf' });
                        Events.invokeRunPDFReport();
                    }} />
                );
            }
        }
        return <BootstrapDropDownMenuButton label="Download" items={items} />
    }
}