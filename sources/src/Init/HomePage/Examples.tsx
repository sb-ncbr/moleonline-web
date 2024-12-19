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

    handleImageClick(index: number) {
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
        { id: '1GPN', src: '/images/example_1GPN.png', title: '1GPN - Structure of acetylcholinesterase complexed with huperzine B' },
        { id: '1V9E', src: '/images/example_1V9E.png', title: '1V9E - Crystal Structure Analysis of Bovine Carbonic Anhydrase II' },
        { id: '2V61', src: '/images/example_2V61.png', title: '2V61 - Structure of human MAO B in complex with the selective inhibitor 7-(3- chlorobenzyloxy)-4-(methylamino)methyl-coumarin' },
        { id: '2VV5', src: '/images/example_2VV5.png', title: '2VV5 - The open structure of MscS' },
        { id: '2XN8', src: '/images/example_2XN8.png', title: '2XN8 - X-ray structure of the substrate-free Mycobacterium tuberculosis cytochrome P450 CYP125' },
        { id: '3LDC', src: '/images/example_3LDC.png', title: '3LDC - Open MthK pore structure crystallized in 100 mM K+' },
    ];

    render() {
        return (
            <div className="container-fluid text-center">
                <div className="row">
                    <div className="col">
                        <h4><b>Examples</b></h4>
                    </div>
                </div>
                <div className="row mb-3">
                    {this.examples.slice(0, 3).map((example, index) => (
                        <div key={example.id} className="col d-flex flex-column justify-content-center align-items-center position-relative">
                            {this.state.activeButton === index && (
                                <div className="spinner-overlay">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                            <figure
                                className={`figure ${this.state.activeButton !== -1 && this.state.activeButton !== index ? 'disabled' : ''}`}
                                style={{ maxWidth: '28rem', cursor: 'pointer' }}
                                onClick={() => { if (this.examples[index]) { this.handleImageClick(index); this.handleFormSubmit(this.examples[index].id); } }}
                                data-bs-toggle="tooltip"
                                data-bs-placement="bottom"
                                title={example.title} // Tooltip content
                            >
                                <img
                                    className="img-fluid figure-img"
                                    style={{ objectFit: 'contain' }}
                                    src={example.src}
                                    alt={example.title}
                                />
                            </figure>
                        </div>
                    ))}
                </div>
                <div className="row mb-3">
                    {this.examples.slice(3).map((example, index) => (
                        <div key={example.id} className="col d-flex flex-column justify-content-center align-items-center position-relative">
                            {this.state.activeButton === index + 3 && (
                                <div className="spinner-overlay">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                            <figure
                                className={`figure ${this.state.activeButton !== -1 && this.state.activeButton !== index + 3 ? 'disabled' : ''}`}
                                style={{ maxWidth: '28rem', cursor: 'pointer' }}
                                onClick={() => { if (this.examples[index + 3]) { this.handleImageClick(index + 3); this.handleFormSubmit(this.examples[index + 3].id); } }}
                                data-bs-toggle="tooltip"
                                data-bs-placement="bottom"
                                title={example.title} // Tooltip content
                            >
                                <img
                                    className="img-fluid figure-img"
                                    style={{ objectFit: 'contain' }}
                                    src={example.src}
                                    alt={example.title}
                                />
                            </figure>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
