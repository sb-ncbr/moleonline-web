import React from "react";
import { CommonOptions } from "../../../config/common";

// The archive is read-only: the examples, which started a computation, only show what they were
export class Examples extends React.Component<{}, {}> {

    examples = [
        { id: '1GPN', src: '/images/example_1GPN.png', title: '1GPN - complex of Tetronarce californica Acetylcholinesterase (AChE) with huperzine B - potential Alzheimer drug' },
        { id: '1V9E', src: '/images/example_1V9E.png', title: '1V9E - bovine Carbonic anhydrase 2 (CA2)' },
        { id: '2V61', src: '/images/example_2V61.png', title: '2V61 - human Amine oxidase B (MAOB) in complex with selective coumarine derivative inhibitor' },
        { id: '2VV5', src: '/images/example_2VV5.png', title: '2VV5 - open form of an Escherichia coli mechanosensitive channel MscS' },
        { id: '2XN8', src: '/images/example_2XN8.png', title: '2XN8 - substrate-free form of Mycobacterium tuberculosis Steroid C26-moooxygenase (cyp125)' },
        { id: '3LDC', src: '/images/example_3LDC.png', title: '3LDC - open form of Methanothermobacter thermautotrophicus Calcium-gated potassium channel MthK' },
    ];

    private figure(example: { id: string, src: string, title: string }) {
        return (
            <div key={example.id} className="col d-flex flex-column justify-content-center align-items-center position-relative">
                <figure
                    className="figure read-only-example"
                    style={{ maxWidth: '28rem' }}
                    data-bs-toggle="tooltip"
                    data-bs-placement="bottom"
                    title={`${example.title}. ${CommonOptions.READ_ONLY_MESSAGE}`} // Tooltip content
                >
                    <img
                        className="img-fluid figure-img"
                        style={{ objectFit: 'contain' }}
                        src={example.src}
                        alt={example.title}
                    />
                </figure>
            </div>
        );
    }

    render() {
        return (
            <div className="container-fluid text-center">
                <div className="row">
                    <div className="col">
                        <h4><b>Examples</b></h4>
                    </div>
                </div>
                <div className="row mb-3">
                    {this.examples.slice(0, 3).map(example => this.figure(example))}
                </div>
                <div className="row mb-3">
                    {this.examples.slice(3).map(example => this.figure(example))}
                </div>
            </div>
        );
    }
}
