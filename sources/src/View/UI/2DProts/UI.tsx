import React from "react";
import {TwoDProts as TwoDProtsProxy} from "../../../DataProxy";
import {getParameters} from "../../../Common/Util/Router";
import {TwoDProtsBridge} from "../../CommonUtils/TwoDProtsBridge";
import {Events} from "../../../Bridge";

export class TwoDProts extends React.Component<{}, { isComputing: boolean, error?: any, jobId: string, canceled: boolean }> {
    state = { isComputing: false, error: void 0, jobId: "", canceled: false };

    private getLastErrorMessage(message: string): string {
        const lastColonIndex = message.lastIndexOf(':');
        if (lastColonIndex === -1) {
            return message;
        }
        return message.substring(lastColonIndex + 1).trim();
    }

    private async startComputation() {
        this.setState({canceled: false});
        let params = getParameters();
        if (params === null) {
            this.setState({ isComputing: false, jobId: '', error: `Cannot get structure url` });
            return;
        }
        const submitId = params.submitId;
        const computationId = params.computationId;
        try {
            TwoDProtsProxy.Watcher.startJob(
                `https://api.mole.upol.cz/Data/${computationId}?submitId=${submitId}&format=molecule`,
                TwoDProtsBridge.getVizualizedChannels(),
                (status, jobId, errorMsg) => {
                    console.log(`2DProts Job Status: ${status}`);
                    if (status === 'SUCCESS') {
                        this.setState({ isComputing: false, jobId })
                    } else if (status === 'FAILURE') {
                        this.setState({ isComputing: false, jobId: '', error: <div className="text-danger">{this.getLastErrorMessage(errorMsg)}</div> })
                    } else if (status === 'PENDING' && this.state.jobId === '') {
                        this.setState({ jobId });
                    }
                },
                (error => {
                    this.setState({ isComputing: false, jobId: '', error: <div className="text-danger">Error: {error.message}</div> })
                })
            )
        } catch (error) {
            console.error('Error sending JSON to backend:', error);
            this.setState({ isComputing: false, jobId: '', error: <div className="text-danger">Error: {error.message}</div> })
        }
    }

    private async cancelComputation() {
        if (this.state.jobId !== '') {
            let state = this.state;
            state.error = void 0;
            state.isComputing = false;
            state.jobId = '';
            state.canceled = true;
            this.setState(state);
            TwoDProtsProxy.Watcher.stopMonitoring(this.state.jobId);
        }
    }

    private async fetchSvgAndCreateBlob(svgUrl: string) {
        try {
            const response = await fetch(svgUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch SVG: ${response.status} ${response.statusText}`);
            }
            const svgText = await response.text();
            return new Blob([svgText], {type: 'image/svg+xml'});
        } catch (error) {
            Events.invokeNotifyMessage({
                messageType: "Danger",
                message: `Error while delivering 2DProts SVG: ${error}`
            })
        }
    }

    render() {
        return <div className="d-flex flex-column justify-content-center align-items-center h-100 w-100">
            {this.state.jobId !== '' && !this.state.canceled && !this.state.isComputing ? <img style={{ objectFit: 'contain', maxHeight: '90%', width: 'auto' }} alt="2DProtsOutput" src={`https://2dprots.ncbr.muni.cz/static/2DProt/custom_jobs/${this.state.jobId}/output.svg`} /> : <></>}
            {this.state.isComputing ?
                <div>
                    <button className="btn btn-primary" type="button" style={{ marginRight: '10px' }} disabled>
                        <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                        <span role="status">Loading...</span>
                    </button>
                    <button className="btn btn-primary" type="button" onClick={() => { this.cancelComputation(); }}>
                        <span role="status">Cancel</span>
                    </button>
                </div>
                : this.state.jobId === '' || this.state.canceled ?
                    <button type="button" className="btn btn-primary" onClick={() => { this.setState({ isComputing: true, error: void 0 }); this.startComputation(); }}>
                        <span>Start computation</span>
                    </button>
                    :
                    <div>
                        <button type="button" className="btn btn-primary" onClick={() => { this.setState({ isComputing: true, error: void 0 }); this.startComputation(); }}>
                            <span>Start computation</span>
                        </button>
                        <button className="btn btn-primary" type="button" style={{ marginLeft: '10px' }} onClick={() => {
                            this.fetchSvgAndCreateBlob(`https://2dprots.ncbr.muni.cz/static/2DProt/custom_jobs/${this.state.jobId}/output.svg`).then((blob) => {
                                if (blob) {
                                    const blobUrl = URL.createObjectURL(blob);
                                    const downloadLink = document.createElement('a');
                                    downloadLink.href = blobUrl;
                                    downloadLink.download = 'output.svg';
                                    document.body.appendChild(downloadLink);
                                    downloadLink.click();
                                    document.body.removeChild(downloadLink);
                                }
                            })
                        }}>Download SVG</button>
                    </div>
            }
            {this.state.error ?? <></>}
        </div>
    }
}