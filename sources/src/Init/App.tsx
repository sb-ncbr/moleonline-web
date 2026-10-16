/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
import ReactDOM from 'react-dom/client';
import { GlobalRouter } from "../SimpleRouter";
import { AlertMessages } from '../Common/UI/AlertMessages/UI';
import { InitForm } from './InitForm/UI';
import { Routing } from '../../config/common';
import { Examples } from './HomePage/Examples';

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
    const examples = document.getElementById("examples");
    if (examples !== null) {
        ReactDOM.createRoot(examples).render(<Examples />);
    }
})();
