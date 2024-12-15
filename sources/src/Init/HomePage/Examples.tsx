import React from "react";
import { ApiService, CompInfo, InitResponse, MoleConfig, PoresConfig } from "../../MoleAPIService";
import { Events } from "../../Bridge";
import { GlobalRouter } from "../../SimpleRouter";
import { ComputationInfo, JobStatus } from "../../DataProxy";

declare function $(p: any): any;

export class Examples extends React.Component<{}, { activeButton: number }> {
    private computationId: string;
    private submitId: number;

    constructor(props: {}) {
        super(props);
        this.state = {
            activeButton: -1,
        };
    }

    componentDidMount() {
    }

    handleButtonClick(index: number) {
        this.setState({ activeButton: index })
    }

    private handleFormSubmit(pdbId: string) {
        let assembly;
        let pores: boolean = false;
        ApiService.initWithParams(pdbId, pores, assembly)
            .then((response) => {
                this.handleFormSubmitResponse(response);
            })
            .catch((reason) => {
                //TODO:...
                console.log(reason);
            })

        return false;
    }

    private async loadSumbission(computationId: string) {
        try {
            const response = await fetch(`/static/${this.examples[this.state.activeButton].id}.json`);
            if (!response.ok) {
                throw new Error(`Failed to fetch parameters`)
            }
            let result;

            const data = await response.json();
            if (data.Mode === "Mole") {
                result = await ApiService.submitMoleJob(computationId, data.Config as MoleConfig);
            } else {
                result = await ApiService.submitPoresJob(computationId, data.Config as PoresConfig);
            }

            if (result.Status === "Error") {
                throw new Error(`${result.ErrorMsg}`)
            }
            else {
                ComputationInfo.DataProvider.get(result.ComputationId, ((compId: string, info: CompInfo) => {
                    JobStatus.Watcher.registerOnChangeHandler(result.ComputationId, result.SubmitId, (status) => {
                        if (status.Status !== "Running") {
                            GlobalRouter.redirect(`/${result.ComputationId}/${String(result.SubmitId)}`, true);
                        }
                    }, (err) => {
                        Events.invokeNotifyMessage({
                            messageType: "Danger",
                            message: `Job status cannot be tracked. Please try to refresh the page.`
                        });
                    })
                }).bind(this), true);
            }
        } catch (error) {
            //TODO better with toast I think
            this.setState({ activeButton: -1 });
            console.error('Error loading JSON:', error.message);
            Events.invokeNotifyMessage({
                messageType: "Danger",
                message: `Error loading JSON: ${error.message}`
            });
        }
    }

    private async handleFormSubmitResponse(response: InitResponse) {
        if (response.Status === "FailedInitialization") {
            this.setState({ activeButton: -1 });
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
            await this.loadSumbission(this.computationId);
            return;
        }

        if (response.Status === "Initializing") {
            console.log("Waiting for computation initialization...");
            window.setTimeout(this.waitForComputationInitialization.bind(this), 500);
            return;
        }

        this.setState({ activeButton: -1 });
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

    examples = [
        { id: '5VKQ', src: '/images/example_5VKQ.png', title: 'Mechanotransduction channel NOMPC', doi: '10.1038/nature22981' },
        { id: '1TQN', src: '/images/example_1TQN.png', title: 'Solvent channel of cytochrome P450 3A4', doi: '10.1074/jbc.C400293200' },
        { id: '1EVE', src: '/images/example_1EVE.png', title: 'Channels of acetylcholinesterase', doi: '10368299' },
        { id: '4CZH', src: '/images/example_4CZH.png', title: 'Channels of haloalkane dehalogenase', doi: '10.1016/j.febslet.2014.02.056' },
        { id: '1K4C', src: '/images/example_1K4C.png', title: 'Potassium Channel KcsA-Fab', doi: '10.1038/35102009' },
    ];

    render() {
        console.log(this.state.activeButton);
        return (
            <div className="container-fluid text-center" style={{ marginBottom: '10rem' }}>
                <div className="row">
                    <div className="col">
                        <h3>Examples</h3>
                    </div>
                </div>
                <div className="row mb-3">
                    {this.examples.slice(0, 3).map((example, index) => (
                        <div key={example.id} className="col d-flex flex-column justify-content-center align-items-center">
                            <figure className="figure" style={{ maxWidth: '28rem' }}>
                                <img
                                    className="img-fluid figure-img"
                                    style={{ objectFit: 'contain' }}
                                    src={example.src}
                                    alt={`${example.title} (PDB ID: ${example.id})`}
                                />
                                <figcaption>
                                    {example.title} (PDB ID:{' '}
                                        {example.id}
                                    ); DOI:{' '}
                                    <a target="_blank" href={`https://doi.org/${example.doi}`}>
                                        {example.doi}
                                    </a>
                                </figcaption>
                            </figure>
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={this.state.activeButton !== -1 && this.state.activeButton !== index}
                                onClick={() => {if (this.examples[index]) {this.handleButtonClick(index); this.handleFormSubmit(this.examples[index].id)}}}
                                title="Open in MOLEonline"
                            >
                                {this.state.activeButton === index ? (
                                    <div className="d-flex align-items-center">
                                        <span className="spinner-border spinner-border-sm align-middle" aria-hidden="true"></span>
                                        <span role="status">Loading...</span>
                                    </div>
                                ) : (
                                    example.id
                                )}
                            </button>
                        </div>
                    ))}
                </div>
                <div className="row mb-3">
                    {this.examples.slice(3).map((example, index) => (
                        <div key={example.id} className="col d-flex flex-column justify-content-center align-items-center">
                            <figure className="figure" style={{ maxWidth: '28rem' }}>
                                <img
                                    className="img-fluid figure-img"
                                    style={{ objectFit: 'contain' }}
                                    src={example.src}
                                    alt={`${example.title} (PDB ID: ${example.id})`}
                                />
                                <figcaption>
                                    {example.title} (PDB ID:{' '}
                                        {example.id}
                                    ); DOI:{' '}
                                    <a target="_blank" href={`https://doi.org/${example.doi}`}>
                                        {example.doi}
                                    </a>
                                </figcaption>
                            </figure>
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={this.state.activeButton !== -1 && this.state.activeButton !== index + 3}
                                onClick={() => {if (this.examples[index + 3]) {this.handleButtonClick(index + 3); this.handleFormSubmit(this.examples[index + 3].id)}}}
                                title="Open in MOLEonline"
                            >
                                {this.state.activeButton === index + 3 ? (
                                    <div className="d-flex align-items-center">
                                        <span className="spinner-border spinner-border-sm align-middle" aria-hidden="true"></span>
                                        <span role="status">Loading...</span>
                                    </div>
                                ) : (
                                    example.id
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}

