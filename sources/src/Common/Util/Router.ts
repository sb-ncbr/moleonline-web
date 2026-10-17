import { updateWithCurrentSession } from "./LastNSessions";

// The computation detail: /online/<computationId>[/<submitId>|/ChannelsDB]

export interface URLParams { submitId: number, computationId: string, isChannelsDB: boolean };

export function getParameters(): URLParams | null {
    const match = /\/online\/([a-zA-Z0-9]+)\/*([0-9]*)/.exec(location.pathname);
    if (match === null) {
        console.log("Corrupted url found - cannot parse parameters.");
        return null;
    }
    return {
        computationId: match[1],
        submitId: match[2] !== '' ? Number(match[2]) : 0,
        isChannelsDB: /\/online\/[a-zA-Z0-9]+\/ChannelsDB/.test(location.pathname),
    };
}

// Shows the computation's URL without loading the page again
export function fakeRedirect(computationId: string, submitId?: string) {
    history.pushState(null, document.title, `/online/${computationId}/${submitId ?? ''}`);
    updateWithCurrentSession();
}

export function isInChannelsDBMode() {
    let params = getParameters();
    return params !== null && params.isChannelsDB;
}
