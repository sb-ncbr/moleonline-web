import React from "react";
import { TwoDProts as TwoDProtsProxy } from "../../../DataProxy";
import { getParameters } from "../../../Common/Util/Router";
import { TwoDProtsBridge } from "../../CommonUtils/TwoDProtsBridge";
import { Events } from "../../../Bridge";

export class TwoDProts extends React.Component<{}, { isComputing: boolean, error?: any, jobId: string }> {
    state = { isComputing: false, error: void 0, jobId: "" };
    componentDidMount() {
        // Events.subscribeChangeSubmitId((submitId) => {
        //     this.setState({submitId})
        // });
    }

    // private rewriteTunnelsFile(channels: string) {
    //     fetch('http://localhost:3000/write-json', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: channels,
    //     })
    //         .then(response => response.json())
    //         .then(data => {
    //             console.log('Server response:', data);
    //         })
    //         .catch(error => {
    //             console.error('Error sending JSON to server:', error);
    //         });
    // }

    private getLastErrorMessage(message: string): string {
        const lastColonIndex = message.lastIndexOf(':');
        if (lastColonIndex === -1) {
            // If no colon is found, return the entire message
            return message;
        }
        // Return the text after the last colon, trimmed of whitespace
        return message.substring(lastColonIndex + 1).trim();
    }



    private async startComputation() {
        const pdbid = TwoDProtsBridge.getPdbId();
        if (pdbid === undefined) {
            this.setState({ isComputing: false, jobId: '', error: <div className="text-danger">Error: 2D prots can't compute on custom structures yet</div> })
            return;
        }
        let params = getParameters();
        if (params === null) {
            this.setState({ isComputing: false, jobId: '', error: `Cannot get structure url` });
            return;
        }
        const submitId = params.submitId;
        const computationId = params.computationId;
        const channels = JSON.stringify(TwoDProtsBridge.getVizualizedChannels(), null, 2);
        try {
            const response = await fetch(`${window.location.origin}/api/write-json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: channels,
            });

            if (!response.ok) {
                // throw new Error(`Backend error: ${response.statusText}`);
                this.setState({ isComputing: false, jobId: '', error: <div className="text-danger">Error: {response.statusText}</div> })
            }

            const data = await response.json();
            TwoDProtsProxy.Watcher.startJob(
                `https://files.rcsb.org/download/${pdbid}.pdb`,
                data.url,
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
                    this.setState({ isComputing: false, jobId: '', error: <div className="text-danger">Error: {error}</div> })
                })
            )
        } catch (error) {
            console.error('Error sending JSON to backend:', error);
            this.setState({ isComputing: false, jobId: '', error: <div className="text-danger">Error: {error}</div> })
            // throw error;
        }

        // fetch('http://localhost:3000/write-json', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: channels,
        // })
        // .then(response => response.json())
        // .then(data => {
        //     console.log('Server response:', data);
        //     TwoDProtsProxy.Watcher.startJob(
        //         `https://api.mole.upol.cz/Data/${computationId}?submitId=${submitId}&format=molecule`,
        //         `http://localhost:3000/objectRequest.json`,
        //         (status, jobId) => {
        //             console.log(`2DProts Job Status: ${status}`);
        //             if (status === 'SUCCESS') {
        //                 this.setState({ isComputing: false, jobId })
        //             } else if (status === 'FAILURE') {
        //                 this.setState({ isComputing: false, error: <div className="text-danger">Failure: Something went wrong during computation!</div> })
        //             }
        //         },
        //         (error => {
        //             this.setState({ isComputing: false, error: <div className="text-danger">Error: {error}</div> })
        //         })
        //     )

        // })
        // .catch(error => {
        //     console.error('Error sending JSON to server:', error);
        // });


        // TwoDProtsProxy.Watcher.startJob(
        //     `https://api.mole.upol.cz/Data/${computationId}?submitId=${submitId}&format=molecule`,
        //     `http://localhost:3000/objectRequest.json`,
        //     (status, jobId) => {
        //         console.log(`2DProts Job Status: ${status}`);
        //         if (status === 'SUCCESS') {
        //             this.setState({ isComputing: false, jobId })
        //         } else if (status === 'FAILURE') {
        //             this.setState({ isComputing: false, error: <div className="text-danger">Failure: Something went wrong during computation!</div> })
        //         }
        //     },
        //     (error => {
        //         this.setState({ isComputing: false, error: <div className="text-danger">Error: {error}</div> })
        //     })
        // )
    }

    private async cancelComputation() {
        if (this.state.jobId !== '') {
            TwoDProtsProxy.Watcher.stopMonitoring(this.state.jobId);
            this.setState({ isComputing: false, error: void 0, jobId: '' });
        }
    }

    // getSelected/VisibleTunnel
    // getStructure
    // button vanish on computing
    // showing loader on computing
    // status checking
    // retrieving result
    // showing svg / error if happend

    render() {
        return <div className="d-flex flex-column justify-content-center align-items-center h-100 w-100">
            {/* <img src="/images/ajax-loader.gif" style={{visibility: this.state.isComputing ? "visible" : "hidden"}}/> */}
            {this.state.jobId !== '' && !this.state.isComputing ? <img style={{ objectFit: 'contain', maxHeight: '90%', width: 'auto' }} alt="2DProtsOutput" src={`http://147.251.21.23/static/2DProt/custom_jobs/${this.state.jobId}/output.svg`} /> : <></>}
            {this.state.isComputing ?
                <div>
                    <button className="btn btn-primary" type="button" style={{marginRight: '10px'}} disabled>
                        <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                        <span role="status">Loading...</span>
                    </button>
                    <button className="btn btn-primary" type="button" onClick={() => { this.cancelComputation(); }}>
                        <span role="status">Cancel</span>
                    </button>
                </div>
                :
                <button type="button" className="btn btn-primary" onClick={() => { this.setState({ isComputing: true, error: void 0 }); this.startComputation(); }}>
                    <span>Start computation</span>
                </button>
            }
            {this.state.error ?? <></>}
        </div>
    }
}