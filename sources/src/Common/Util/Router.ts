import { GlobalRouter } from "../../SimpleRouter";
import { updateWithCurrentSession } from "./LastNSessions";

export interface URLParams { submitId: number, computationId: string, isChannelsDB: boolean };

export function getParameters(): URLParams | null {
    let parametersChannelsDBTest = GlobalRouter.getParametersByRegex(/\/online\/([a-zA-Z0-9]+)\/ChannelsDB/g);
    let parameters = GlobalRouter.getParametersByRegex(/\/online\/([a-zA-Z0-9]+)\/*([0-9]*)/g);
    let computationId = null;
    let submitId = 0;
    if ((parameters === null) || (parameters.length === 0) || (parameters.length > 3)) {
        console.log(parameters);
        console.log("Corrupted url found - cannot parse parameters.");
        return null;
    }
    computationId = parameters[1];
    if (parameters[2] !== '') {
        submitId = Number(parameters[2]);
    }

    return {
        submitId,
        computationId,
        isChannelsDB: parametersChannelsDBTest !== null && parametersChannelsDBTest.length > 0
    };
}

export function redirect(computationId: string, submitId: number) {
    GlobalRouter.redirect(`/${computationId}/${submitId}`, true);
}

export function fakeRedirect(computationId: string, submitId?: string) {
    if (submitId !== void 0) {
        GlobalRouter.fakeRedirect(`/${computationId}/${submitId}`, true);
    }
    else {
        GlobalRouter.fakeRedirect(`/${computationId}/`, true);
    }
    updateWithCurrentSession();
}

export function isInChannelsDBMode() {
    let params = getParameters();
    return params !== null && params.isChannelsDB;
}

export function getCurrentUrl() {
    return window.location.href;
}
