import React from "react";
import { Context } from "./Context";
import { Viewer } from "./MolViewer/UI";
import { SequenceViewer } from "./UI/SequenceViewer/newUI";
import { QuickHelp } from "./UI/QuickHelp/UI";
import { LayerVizualizer } from "./UI/LayerVizualizer/UI";
import { AglomeredParameters } from "./UI/AglomeredParameters/UI";
import { LayersVizualizerSettings, Vizualizer } from "./LayerVizualizer/Vizualizer";
import { Instances } from "../Bridge";
import { LayerProperties } from "./UI/LayerProperties/UI";
import { LayerResidues } from "./UI/LayerResidues/UI";
import { LiningResidues } from "./UI/LiningResidues/UI";
import { ChannelParameters } from "./UI/ChannelParameters/UI";
// import { doAfterCollapseActivated } from "./CommonUtils/Tabs";
import { TwoDProts } from "./UI/2DProts/UI";

declare function $(p: any): any;
declare function doAfterCollapseActivated(): any;

export class RightPanel extends React.Component<{ context: Context }, {twoDProts: boolean}> {
    state = { twoDProts: false };

    componentDidMount(): void {
        doAfterCollapseActivated();
    }


    render() {
        let lvSettings: LayersVizualizerSettings = {
            coloringProperty: "Hydropathy",
            useColorMinMax: true,
            skipMiddleColor: false,
            topMargin: 0, //15,
            customRadiusProperty: "MinRadius"
        }

        //Create instance of layer vizualizer
        let layerVizualizer = new Vizualizer('layer-vizualizer-ui', lvSettings);
        Instances.setLayersVizualizer(layerVizualizer);

        return <div className="d-flex flex-column h-100">
            <div className="chdb-panel plugin flex-grow-1" id="plugin">
                <div style={{visibility: this.state.twoDProts ? "collapse" : "visible"}}><Viewer context={this.props.context} /></div>
                <div className="h-100 w-100" style={{visibility: this.state.twoDProts ? "visible" : "collapse"}}><TwoDProts /></div>
            </div>
            <button id="view-change" type="button" className="btn btn-outline-secondary change-view-button" onClick={() => {this.setState({twoDProts: !this.state.twoDProts})}}>{this.state.twoDProts ? <i className="bi bi-backspace"></i> : "2DProts"}</button>
            <a className="sequence-viewer-header" id="sequence-collapse" onClick={() => {doAfterCollapseActivated()}} data-bs-toggle="collapse" href="#sequence-viewer" role="button" aria-expanded="false" aria-controls="sequence-viewer">Protein Sequence <span className="bi bi-arrows-expand"></span></a>
            <div className="chdb-panel sequence-viewer collapse" id="sequence-viewer">
                <SequenceViewer controller={this.props.context} />
            </div>
            <a id="bottom-panel-collapse" onClick={() => {doAfterCollapseActivated()}} className="sequence-viewer-header" data-bs-toggle="collapse" href="#bottom-pannel" role="button" aria-expanded="false" aria-controls="bottom-pannel"><span className="bi bi-arrows-expand"></span></a>
            <div className="chdb-panel bottom-panel collapse show d-flex" id="bottom-pannel">
                <div className="left-tabs">
                    <div id="left-tabs">
                        <ul className="nav nav-tabs" role="tablist">
                            <li className="nav-item"><a className="nav-link active" data-bs-toggle="tab" aria-current="page" href="#left-tabs-help"><span className="bi bi-question-circle"></span></a></li>
                            <li className="nav-item"><a className="nav-link" data-bs-toggle="tab" aria-current="page" href="#left-tabs-1">Profile</a></li>
                            <li className="nav-item"><a className="nav-link" data-bs-toggle="tab" aria-current="page" href="#left-tabs-2">Channels properties</a></li>
                        </ul>
                        <div className="tab-content">
                            <div id="left-tabs-help" className="tab-pane show active">
                                <div className="quick-help" id="quick-help"><QuickHelp /></div>
                            </div>
                            <div id="left-tabs-1" className="tab-pane">
                                <div className="layerVizualizer" id="layer-vizualizer-ui"><LayerVizualizer vizualizer={layerVizualizer} /></div>
                            </div>
                            <div id="left-tabs-2" className="tab-pane">
                                <div className="aglomered-parameters" id="aglomered-parameters-ui"><AglomeredParameters /></div>
                            </div>
                        </div>
                    </div>
                    <div id="bottom-tabs-toggler" className="toggler glyphicon glyphicon-resize-horizontal"></div>
                </div>
                <div className="right-tabs">
                    <div id="right-tabs">
                        <ul className="nav nav-tabs">
                            <li className="nav-item"><a className="nav-link active" data-bs-toggle="tab" aria-current="page" href="#right-tabs-1">Layer</a></li>
                            <li className="nav-item"><a className="nav-link" data-bs-toggle="tab" aria-current="page" href="#right-tabs-2">Lining residues</a></li>
                            <li className="nav-item"><a className="nav-link" data-bs-toggle="tab" aria-current="page" title="Physico-chemical Properties" href="#right-tabs-3">Phys. Chem. Properties</a></li>
                        </ul>
                        <div className="tab-content" >
                            <div id="right-tabs-1" className="tab-pane show active">
                                <div id="layer-residues">
                                    <LayerResidues />
                                </div>
                                <div id="layer-properties">
                                    <LayerProperties />
                                </div>
                            </div>
                            <div id="right-tabs-2" className="tab-pane">
                                <LiningResidues />
                            </div>
                            <div id="right-tabs-3" className="tab-pane">
                                <ChannelParameters />
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div id="bottom-panel-toggler" className="toggler glyphicon glyphicon-resize-vertical"></div> */}
            </div>
        </div>
    }
}