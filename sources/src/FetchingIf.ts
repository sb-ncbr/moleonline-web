export type FetchIfParams = FetchIfGETParams | FetchIfPOSTParams;

export interface FetchIfGETParams {
    method: "GET"
}
export interface FetchIfPOSTParams {
    method: "POST"
    headers?: Headers,
    body: string | FormData,
}

export interface FetchingIf {
    fetch(url: string, params: FetchIfParams): Promise<Response>;
}

export class Fetching {
    private static impl: FetchingIf | null = null;

    public static get(): FetchingIf {
        if (this.impl === null) {
            this.impl = new FetchingFetchImpl();
        }

        return this.impl;
    }
}

export class FetchingFetchImpl implements FetchingIf {
    fetch(url: string, params: FetchIfParams): Promise<Response> {
        if (params.method === "GET") {
            return fetch(url, {
                method: "GET"
            })
        }
        else {
            let postParams = params as FetchIfPOSTParams;
            return fetch(url, {
                method: "POST",
                headers: postParams.headers,
                body: postParams.body
            })
        }
    }

}
