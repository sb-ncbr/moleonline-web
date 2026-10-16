import { CommonOptions } from "../config/common";

// Shared request helpers for the API services.
// A non-2xx response rejects with the message "<METHOD>: <url> <status>: <statusText>".

async function request(url: string, init: RequestInit): Promise<Response> {
    const response = await fetch(url, init);
    if (!response.ok) {
        const message = `${init.method}: ${url} ${response.status}: ${response.statusText}`;
        if (CommonOptions.DEBUG_MODE)
            console.log(message);
        throw message;
    }
    return response;
}

async function timed<T>(url: string, action: () => Promise<T>): Promise<T> {
    if (CommonOptions.DEBUG_MODE)
        console.time(`GET '${url}'`);
    const result = await action();
    if (CommonOptions.DEBUG_MODE)
        console.timeEnd(`GET '${url}'`);
    return result;
}

export function getJson(url: string): Promise<any> {
    return timed(url, async () => (await request(url, { method: "GET" })).json());
}

export function getText(url: string): Promise<string> {
    return timed(url, async () => (await request(url, { method: "GET" })).text());
}

// No body and no Content-Type, so the POST stays a simple CORS request without a preflight.
export async function postEmpty(url: string): Promise<any> {
    return (await request(url, { method: "POST" })).json();
}

export async function deleteJson(url: string): Promise<any> {
    return (await request(url, { method: "DELETE" })).json();
}

export async function postForm(url: string, body: FormData): Promise<any> {
    return (await request(url, { method: "POST", body })).json();
}

export async function postJson(url: string, body: Object): Promise<any> {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    return (await request(url, { method: "POST", headers, body: JSON.stringify(body) })).json();
}
