import { CommonOptions } from "../config/common";

// Shared request helpers for the API services.
// A non-2xx response rejects with a RequestError: the API's ErrorMsg when its report says why,
// otherwise "<METHOD>: <url> <status>: <statusText>".

export class RequestError extends Error {
    constructor(message: string, readonly status: number, readonly fromApi: boolean) {
        super(message);
    }

    // String(error) gives just the message
    toString() {
        return this.message;
    }
}

// The message for the user: the API's own explanation, or the fallback when the API was not reached or gave none
export function describeError(reason: unknown, fallback: string): string {
    if (reason instanceof RequestError && reason.fromApi) {
        return reason.message;
    }
    return `${fallback} (${reason instanceof Error ? reason.message : reason})`;
}

// 404: the computation or submission does not exist, or it has no such data (no results, no membrane)
export function isNotFound(reason: unknown): boolean {
    return reason instanceof RequestError && reason.status === 404;
}

// The API refused the request (4xx): unlike a network or server error (5xx), asking again cannot help.
// Except a timeout (408) or too many requests (429, e.g. a proxy's rate limit): later it can succeed.
export function isRefused(reason: unknown): boolean {
    return reason instanceof RequestError && reason.status >= 400 && reason.status < 500
        && reason.status !== 408 && reason.status !== 429;
}

// The error of a failed response, for code that calls fetch itself
export async function requestError(method: string, url: string, response: Response): Promise<RequestError> {
    const report = await response.json().catch(() => null);
    const apiMessage = typeof report?.ErrorMsg === "string" ? report.ErrorMsg.trim() : "";
    const error = new RequestError(apiMessage || `${method}: ${url} ${response.status}: ${response.statusText}`, response.status, apiMessage.length > 0);
    if (CommonOptions.DEBUG_MODE)
        console.log(`${method}: ${url} ${response.status}`, error.message);
    return error;
}

// In debug mode, every request is logged with the time it took, reading the response body included
async function request<T>(url: string, init: RequestInit, read: (response: Response) => Promise<T>): Promise<T> {
    const method = init.method ?? "GET";
    if (CommonOptions.DEBUG_MODE)
        console.time(`${method} ${url}`);
    try {
        const response = await fetch(url, init);
        if (!response.ok) {
            throw await requestError(method, url, response);
        }
        return await read(response);
    } finally {
        if (CommonOptions.DEBUG_MODE)
            console.timeEnd(`${method} ${url}`);
    }
}

const json = (response: Response): Promise<any> => response.json();

export function getJson(url: string): Promise<any> {
    return request(url, { method: "GET" }, json);
}

export function getText(url: string): Promise<string> {
    return request(url, { method: "GET" }, response => response.text());
}

// No body and no Content-Type, so the POST stays a simple CORS request without a preflight.
export function postEmpty(url: string): Promise<any> {
    return request(url, { method: "POST" }, json);
}

export function deleteJson(url: string): Promise<any> {
    return request(url, { method: "DELETE" }, json);
}

export function postForm(url: string, body: FormData): Promise<any> {
    return request(url, { method: "POST", body }, json);
}

export function postJson(url: string, body: Object): Promise<any> {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    return request(url, { method: "POST", headers, body: JSON.stringify(body) }, json);
}
