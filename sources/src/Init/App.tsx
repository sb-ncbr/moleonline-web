/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GlobalRouter } from "../SimpleRouter";
import { AlertMessages } from '../Common/UI/AlertMessages/UI';
import { VersionStrip } from './VersionStrip/UI';
import { InitForm } from './InitForm/UI';
import { Routing } from '../../config/common';
import { Examples } from './HomePage/Examples';

// all commands and events can be found in Bootstrap/Event folder.
// easy to follow the types and parameters in VSCode.

// you can subsribe to any command or event using <Event/Command>.getStream(plugin.context).subscribe(e => ....)

(function () {
    GlobalRouter.init(Routing.ROUTING_OPTIONS[Routing.ROUTING_MODE]);
    const alertMessagesElement = document.getElementById("alert-messages");
    if (alertMessagesElement !== null) {
        ReactDOM.createRoot(alertMessagesElement).render(<AlertMessages />);
    }
    const initFormElement = document.getElementById("init-form");
    if (initFormElement !== null) {
        ReactDOM.createRoot(initFormElement).render(<InitForm />);
    }
    const versionElement = document.getElementById("version-block");
    if (versionElement !== null) {
        ReactDOM.createRoot(versionElement).render(<VersionStrip />);
    }
    const examples = document.getElementById("examples");
    if (examples !== null) {
        ReactDOM.createRoot(examples).render(<Examples />);
    }
})();
