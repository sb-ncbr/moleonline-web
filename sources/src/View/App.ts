/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Example.Channels {
    // all commands and events can be found in Bootstrap/Event folder.
    // easy to follow the types and parameters in VSCode.
    
    // you can subsribe to any command or event using <Event/Command>.getStream(plugin.context).subscribe(e => ....)
    import Command = Bootstrap.Command;
    import Event = Bootstrap.Event;
    import Vizualizer = LayersVizualizer;    

    (function() {
        
        SimpleRouter.GlobalRouter.init(Config.Routing.ROUTING_OPTIONS[Config.Routing.ROUTING_MODE]);
        console.log(Config.Routing.ROUTING_MODE);
                
        let lvSettings: LayersVizualizer.LayersVizualizerSettings = {
            coloringProperty: "Hydropathy",
            useColorMinMax: true,
            skipMiddleColor: false,
            topMargin: 0, //15,
            customRadiusProperty: "MinRadius"
        }       

        //Create instance of layer vizualizer
        let layerVizualizer = new LayersVizualizer.Vizualizer('layer-vizualizer-ui', lvSettings);    

        let plugin = Plugin.create({
            target: '#plugin',
            viewportBackground: '#fff',
            layoutState: {
                hideControls: true,
                isExpanded: false,
                collapsedControlsLayout: Bootstrap.Components.CollapsedControlsLayout.Landscape
            },
            customSpecification: PluginSpec
        });

        MoleOnlineWebUI.Bridge.Instances.setPlugin(plugin);

        CommonUtils.Selection.SelectionHelper.attachSelectionHelperHandlerToEventHandler(plugin);

        UI.render(plugin, document.getElementById('ui') !);
        
        Vizualizer.UI.render(layerVizualizer, document.getElementById('layer-vizualizer-ui') !, plugin);

        AglomeredParameters.UI.render(document.getElementById('left-tabs-2') !, plugin);
        
        //LayerProperties.UI.render(document.getElementById("right-tabs-1") !, plugin);
        LayerProperties.UI.render(document.getElementById("layer-properties") !, plugin);

        //LayerResidues.UI.render(document.getElementById("right-tabs-2") !, plugin);
        LayerResidues.UI.render(document.getElementById("layer-residues") !, plugin);

        LiningResidues.UI.render(document.getElementById("right-tabs-2") !, plugin);

        Controls.UI.render(document.getElementById("controls") !);

        //ResidueAnnotations.UI.render(document.getElementById("right-tabs-3") !, plugin);

        //ProteinAnnotations.UI.render(document.getElementById("right-panel-tabs-1") !, plugin);

        DownloadReport.UI.render(document.getElementById("download-report") !); 

        PdbIdSign.UI.render(document.getElementById("pdbid-sign") !);     

        Annotate.UI.render(document.getElementById("annotate") !);     

        AlertMessages.UI.render(document.getElementById("alert-messages") !);

        SequenceViewer.UI.render(document.getElementById("sequence-viewer") !, plugin);
    })();
}
