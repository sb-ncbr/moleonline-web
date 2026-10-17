/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

// Page styles, in cascade order; they come before the Mol* skin imported by the components
import "../../css/AglomeredParameters.css";
import "../../css/AlertMessages.css";
import "../../css/annotate.css";
import "../../css/ChannelParameters.css";
import "../../css/CofactorPickBox.css";
import "../../css/Components.css";
import "../../css/Controls.css";
import "../../css/CSAPickBox.css";
import "../../css/datagrid.css";
import "../../css/DownloadReport.css";
import "../../css/StartingPoints.css";
import "../../css/LayerVizualizerStyles.css";
import "../../css/lining-residues.css";
import "../../css/LoadingScreen.css";
import "../../css/pdbid.css";
import "../../css/PDFReportGenerator.css";
import "../../css/QuickHelp.css";
import "../../css/SequenceViewer.css";
import "../../css/style.css";
import "../../css/tabs.css";
import "../../css/tooltips.css";
import "../../css/MoleSequenceViewer.scss";
import "../../css/MolstarSlider.scss";

import { Instances } from "../Bridge";
import { updateWithCurrentSession } from "../Common/Util/LastNSessions";
import { GlobalRouter } from "../SimpleRouter";
import { SelectionHelper } from "./CommonUtils/Selection";
import { LayersVizualizerSettings, Vizualizer } from "./LayerVizualizer/Vizualizer";
import { createRoot } from 'react-dom/client';
import { PDFReportGenerator } from "./UI/PDFReportGenerator/UI";
import AlertMessages from "../Common/UI/AlertMessages/UI";
import { Routing } from "../../config/common";
import { Context } from "./Context";
import { ControlsTab } from "./UI/ControlsTab/UI";
import { LayerColors } from "./CommonUtils/LayerColors";
import { RightPanel } from "./RightPanel";
import { LeftPanel } from "./LeftPanel";

(function () {
    (window as any).TOUCH_MODE = false;

    GlobalRouter.init(Routing.ROUTING_OPTIONS[Routing.ROUTING_MODE]);
    console.log(Routing.ROUTING_MODE);

    updateWithCurrentSession();

    let lvSettings: LayersVizualizerSettings = {
        coloringProperty: "Hydropathy",
        useColorMinMax: true,
        skipMiddleColor: false,
        customRadiusProperty: "MinRadius"
    }

    //Create instance of layer vizualizer
    let layerVizualizer = new Vizualizer('layer-vizualizer-ui', lvSettings);
    Instances.setLayersVizualizer(layerVizualizer);


    let molstar_plugin = Context.getInstance();

    SelectionHelper.attachSelectionHelperHandlerToEventHandler();
    LayerColors.attachLayerColorsHandlerToEventHandler(molstar_plugin);
    
    createRoot(document.getElementById("left-panel")!).render(<LeftPanel context={molstar_plugin}/>);
    createRoot(document.getElementById("right-panel")!).render(<RightPanel context={molstar_plugin}/>);

    createRoot(document.getElementById("pdf-report-generator")!).render(<PDFReportGenerator />);

    createRoot(document.getElementById("alert-messages")!).render(<AlertMessages />);

    createRoot(document.getElementById("controls-tab")!).render(<ControlsTab />)
})();
