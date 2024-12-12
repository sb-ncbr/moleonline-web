/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

import { Instances } from "../Bridge";
import { updateWithCurrentSession } from "../Common/Util/LastNSessions";
import { GlobalRouter } from "../SimpleRouter";
import { SelectionHelper } from "./CommonUtils/Selection";
import { LayersVizualizerSettings, Vizualizer } from "./LayerVizualizer/Vizualizer";
import ReactDOM from 'react-dom';
import { QuickHelp } from "./UI/QuickHelp/UI";
import React from "react";
import { LayerVizualizer } from "./UI/LayerVizualizer/UI";
import { AglomeredParameters } from "./UI/AglomeredParameters/UI";
import { LayerResidues } from "./UI/LayerResidues/UI";
import { LiningResidues } from "./UI/LiningResidues/UI";
import { ChannelParameters } from "./UI/ChannelParameters/UI";
import { Controls } from "./UI/Controls/UI";
import { createRoot } from 'react-dom/client';
import { LayerProperties } from "./UI/LayerProperties/UI";
import { DownloadReport } from "./UI/DownloadReport/UI";
import { PDFReportGenerator } from "./UI/PDFReportGenerator/UI";
import { PdbIdSign } from "./UI/PdbIdSign/UI";
import { Help } from "./UI/Help/UI";
import { Annotate } from "./UI/Annotate/UI";
import AlertMessages from "../Common/UI/AlertMessages/UI";
import { SequenceViewer } from "./UI/SequenceViewer/newUI";
import { SequenceView } from "molstar/lib/mol-plugin-ui/sequence";
import { LoadingScreen } from "./UI/LoadingScreen/UI";
import { Viewer } from "./MolViewer/UI";
import { DefaultPluginUISpec, PluginUISpec } from "molstar/lib/mol-plugin-ui/spec";
import { PluginLayoutControlsDisplay } from "molstar/lib/mol-plugin/layout";
import { DefaultPluginSpec, PluginSpec } from "molstar/lib/mol-plugin/spec";
import { Color } from "molstar/lib/mol-util/color";
import { SbNcbrTunnels } from "molstar/lib/extensions/sb-ncbr";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { Routing } from "../../config/common";
import { Context } from "./Context";
import { ControlsTab } from "./UI/ControlsTab/UI";
import { PluginControl } from "./UI/PluginControl/UI";
import { PluginReactContext } from "molstar/lib/mol-plugin-ui/base";
import { LayerColors } from "./CommonUtils/LayerColors";
import { RightPanel } from "./RightPanel";
import { LeftPanel } from "./LeftPanel";

// declare function $(p: any): any;

(function () {
    (window as any).TOUCH_MODE = false;
    // window.addEventListener('touchstart', function onFirstTouch() {
    //     (window as any).TOUCH_MODE = true;
    //     window.removeEventListener('touchstart', onFirstTouch, false);
    //     $(window).trigger('resize');
    // }, false);

    GlobalRouter.init(Routing.ROUTING_OPTIONS[Routing.ROUTING_MODE]);
    console.log(Routing.ROUTING_MODE);

    updateWithCurrentSession();

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

    // let plugin = Plugin.create({
    //     target: '#plugin',
    //     viewportBackground: '#fff',
    //     layoutState: {
    //         hideControls: true,
    //         isExpanded: false,
    //         collapsedControlsLayout: Bootstrap.Components.CollapsedControlsLayout.Landscape
    //     },
    //     customSpecification: PluginSpec
    // });

    let plugin = undefined;

    let molstar_plugin = Context.getInstance();

    // Instances.setPlugin(plugin);

    SelectionHelper.attachSelectionHelperHandlerToEventHandler();
    LayerColors.attachLayerColorsHandlerToEventHandler(molstar_plugin);
    SelectionHelper.attachClearSelectionToEventHandler(molstar_plugin);
    

    // createRoot(document.getElementById('ui')!).render(<PluginControl plugin={undefined}/>)

    // createRoot(document.getElementById('plugin')!).render(<Viewer context={molstar_plugin}/>)

    // createRoot(document.getElementById('quick-help')!).render(<QuickHelp />);

    // createRoot(document.getElementById('layer-vizualizer-ui')!).render(<LayerVizualizer vizualizer={layerVizualizer}/>);

    // createRoot(document.getElementById('left-tabs-2')!).render(<AglomeredParameters controller={plugin}/>);

    // createRoot(document.getElementById("layer-properties")!).render(<LayerProperties controller={plugin}/>);

    // createRoot(document.getElementById("layer-residues")!).render(<LayerResidues controller={plugin}/>);

    // createRoot(document.getElementById("right-tabs-2")!).render(<LiningResidues controller={plugin}/>);

    // createRoot(document.getElementById("right-tabs-3")!).render(<ChannelParameters controller={plugin}/>);

    // createRoot(document.getElementById("sequence-viewer")!).render(<SequenceViewer controller={molstar_plugin}/>);
    createRoot(document.getElementById("left-panel")!).render(<LeftPanel context={molstar_plugin}/>);
    createRoot(document.getElementById("right-panel")!).render(<RightPanel context={molstar_plugin}/>);

    // createRoot(document.getElementById("controls")!).render(<PluginReactContext.Provider value={molstar_plugin.plugin}><Controls /></PluginReactContext.Provider>);
    createRoot(document.getElementById("pdf-report-generator")!).render(<PDFReportGenerator />);

    createRoot(document.getElementById("alert-messages")!).render(<AlertMessages />);


    // createRoot(document.getElementById("loading-screen")!).render(<LoadingScreen />);

    createRoot(document.getElementById("controls-tab")!).render(<ControlsTab />)
})();
