import React from "react";
import { ApiService, InitResponse } from "../../MoleAPIService";
import { Events } from "../../Bridge";
import { GlobalRouter } from "../../SimpleRouter";

declare function $(p: any): any;
declare function gtag(ga_type: string, action: string, options: { 'event_category': string, 'event_label'?: string, 'value'?: any }): any;


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

    // render() {
    //     return <div className="container-fluid text-center" style={{marginBottom: "10rem"}}>
    //     <div className="row">
    //         <div className="col">
    //             <h3>Examples</h3>
    //         </div>
    //     </div>
    //     <div className="row mb-3">
    //         <div className="col d-flex flex-column justify-content-center align-items-center">
    //             <figure className="figure" style={{maxWidth: "28rem"}}>
    //                 <img className="img-fluid figure-img" src="\images/example_5VKQ.png"
    //                     alt="Mechanotransduction channel NOMPC (PDB ID: 5VKQ)"/>
    //                 <figcaption>Mechanotransduction channel NOMPC (PDB ID: <a href="/submiter/5VKQ"
    //                         title="Open in MOLEonline" target="_blank">5VKQ</a>); DOI: <a target="_blank"
    //                         href="http://dx.doi.org/10.1038/nature22981">10.1038/nature22981</a></figcaption>
    //             </figure>
    //             <button type="button" className="btn btn-primary">5VKQ</button>
    //         </div>
    //         <div className="col d-flex flex-column justify-content-center align-items-center">
    //             <figure className="figure" style={{maxWidth: "28rem"}}>
    //                 <img className="img-fluid figure-img" src="\images/example_1TQN.png"
    //                     alt="Solvent channel of cytochrome P450 3A4 (PDB ID: 1TQN)"/>
    //                 <figcaption>Solvent channel of cytochrome P450 3A4 (PDB ID: <a href="/submiter/1TQN"
    //                         title="Open in MOLEonline" target="_blank">1TQN</a>); DOI: <a target="_blank"
    //                         href="http://dx.doi.org/10.1074/jbc.C400293200">10.1074/jbc.C400293200</a></figcaption>
    //             </figure>
    //             <button type="button" className="btn btn-primary">1TQN</button>
    //         </div>
    //         <div className="col d-flex flex-column justify-content-center align-items-center">
    //             <figure className="figure" style={{maxWidth: "28rem"}}>
    //                 <img className="img-fluid figure-img" style={{objectFit: "contain"}} src="\images/example_1EVE.png"
    //                     alt="Channels of acetylcholinesterase (PDB ID: 1EVE)"/>
    //                 <figcaption>Channels of acetylcholinesterase (PDB ID: <a href="/submiter/1EVE"
    //                         title="Open in MOLEonline" target="_blank">1EVE</a>); PMID: <a target="_blank"
    //                         href="https://www.ncbi.nlm.nih.gov/pubmed/?term=10368299">10368299</a></figcaption>
    //             </figure>
    //             <button type="button" className="btn btn-primary">1EVE</button>
    //         </div>
    //     </div>
    //     <br/>
    //     <br/>
    //     <div className="row mb-3">
    //         <div className="col d-flex flex-column justify-content-center align-items-center">
    //             <figure className="figure" style={{maxWidth: "28rem"}}>
    //                 <img className="img-fluid figure-img" style={{objectFit: "contain"}} src="\images/example_4CZH.png"
    //                     alt="Channels of haloalkane dehalogenase (PDB ID: 4CZH)"/>
    //                 <figcaption>Channels of haloalkane dehalogenase (PDB ID: <a href="/submiter/4CZH"
    //                         title="Open in MOLEonline" target="_blank">4CZH</a>); DOI: <a target="_blank"
    //                         href="http://dx.doi.org/10.1016/j.febslet.2014.02.056">10.1016/j.febslet.2014.02.056</a>
    //                 </figcaption>
    //             </figure>
    //             <button type="button" className="btn btn-primary">4CZH</button>
    //         </div>
    //         <div className="col d-flex flex-column justify-content-center align-items-center">
    //             <figure className="figure" style={{maxWidth: "28rem"}}>
    //                 <img className="img-fluid figure-img" style={{objectFit: "contain"}} src="\images/example_1K4C.png"
    //                     alt="Potassium Channel KcsA-Fab (PDB ID: 1K4C)"/>
    //                 <figcaption>Potassium Channel KcsA-Fab (PDB ID: <a href="/submiter/1K4C"
    //                         title="Open in MOLEonline" target="_blank">1K4C</a>); DOI: <a target="_blank"
    //                         href="http://dx.doi.org/10.1038/35102009">10.1038/35102009</a></figcaption>
    //             </figure>
    //             <button type="button" className="btn btn-primary">1K4C</button>
    //         </div>
    //     </div>
    //     <br/>
    // </div>
    // }

    handleButtonClick(index: number) {
        this.setState({ activeButton: index })
    }

    private handleFormSubmit(pdbId: string) {
        let assembly;
        let pores: boolean = false;
        gtag('event', 'Init', { 'event_category': pdbId, 'event_label': 'asymetricUnit' });
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

    private handleFormSubmitResponse(response: InitResponse) {
        if (response.Status === "FailedInitialization") {
            this.setState({activeButton: -1});
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
            Events.invokeNotifyMessage({
                messageType: "Success",
                message: "Computation was successfully initialized. You will be redirected to detail page."
            });
            GlobalRouter.redirect(`/${this.computationId}`, true);
            return;
        }

        if (response.Status === "Initializing") {
            console.log("Waiting for computation initialization...");
            window.setTimeout(this.waitForComputationInitialization.bind(this), 500);
            return;
        }

        this.setState({activeButton: -1});
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

    // render() {
    //     return (
    //         <div className="container-fluid text-center" style={{ marginBottom: '10rem' }}>
    //         <div className="row">
    //           <div className="col">
    //             <h3>Examples</h3>
    //           </div>
    //         </div>
    //         <div className="row mb-3">
    //           {[
    //             { id: '5VKQ', src: '/images/example_5VKQ.png', title: 'Mechanotransduction channel NOMPC', doi: '10.1038/nature22981' },
    //             { id: '1TQN', src: '/images/example_1TQN.png', title: 'Solvent channel of cytochrome P450 3A4', doi: '10.1074/jbc.C400293200' },
    //             { id: '1EVE', src: '/images/example_1EVE.png', title: 'Channels of acetylcholinesterase', doi: '10368299' },
    //             { id: '4CZH', src: '/images/example_4CZH.png', title: 'Channels of haloalkane dehalogenase', doi: '10.1016/j.febslet.2014.02.056' },
    //             { id: '1K4C', src: '/images/example_1K4C.png', title: 'Potassium Channel KcsA-Fab', doi: '10.1038/35102009' },
    //           ].map((example, index) => (
    //             <div key={example.id} className="col d-flex flex-column justify-content-center align-items-center">
    //               <figure className="figure" style={{ maxWidth: '28rem' }}>
    //                 <img
    //                   className="img-fluid figure-img"
    //                   style={{ objectFit: 'contain' }}
    //                   src={example.src}
    //                   alt={`${example.title} (PDB ID: ${example.id})`}
    //                 />
    //                 <figcaption>
    //                   {example.title} (PDB ID:{' '}
    //                   <a href={`/submiter/${example.id}`} title="Open in MOLEonline" target="_blank">
    //                     {example.id}
    //                   </a>
    //                   ); DOI:{' '}
    //                   <a target="_blank" href={`http://dx.doi.org/${example.doi}`}>
    //                     {example.doi}
    //                   </a>
    //                 </figcaption>
    //               </figure>
    //               <button
    //                 type="button"
    //                 className="btn btn-primary"
    //                 disabled={this.state.activeButton !== index}
    //                 onClick={() => this.handleButtonClick(index)}
    //               >
    //                 {this.state.activeButton === index ? (
    //                   <>
    //                     <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
    //                     <span role="status">Loading...</span>
    //                   </>
    //                 ) : (
    //                   example.id
    //                 )}
    //               </button>
    //             </div>
    //           ))}
    //         </div>
    //       </div>
    //     )
    // }

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
                                    <a target="_blank" href={`http://dx.doi.org/${example.doi}`}>
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
                                    <>
                                        <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                        <span role="status">Loading...</span>
                                    </>
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
                                    <a target="_blank" href={`http://dx.doi.org/${example.doi}`}>
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
                                    <>
                                        <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                        <span role="status">Loading...</span>
                                    </>
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

