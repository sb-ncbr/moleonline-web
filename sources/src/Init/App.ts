/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Example.Channels {
    // all commands and events can be found in Bootstrap/Event folder.
    // easy to follow the types and parameters in VSCode.
    
    // you can subsribe to any command or event using <Event/Command>.getStream(plugin.context).subscribe(e => ....)

    import MoleUI = MoleOnlineWebUI;

    (function() {
        SimpleRouter.GlobalRouter.init(Config.Routing.ROUTING_OPTIONS[Config.Routing.ROUTING_MODE]);
        console.log(Config.Routing.ROUTING_MODE);
        console.log(SimpleRouter.GlobalRouter.getCurrentPage());
        AlertMessages.UI.render(document.getElementById("alert-messages") !);
        MoleUI.InitForm.UI.render(document.getElementById("init-form") !);
    })();
}
