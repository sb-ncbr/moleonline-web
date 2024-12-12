declare var $: any

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

    private static resolveImpl() {
        //fetch() is currently overriden by polyfill - should be working even for IE 11 and Safari
        if (fetch !== void 0) {
            console.log("Fetching: Using Fetching API impl.");
            return new FetchingFetchImpl();
        }

        console.log("Fetching: Using default impl.");
        //NOTICE: most cross platform impl should be set as default in here
        return new FetchingJQueryImpl();
    }

    public static get(): FetchingIf {
        if (this.impl === null) {
            this.impl = this.resolveImpl();
        }

        return this.impl;
    }
}

export class FetchingFetchImpl implements FetchingIf {
    fetch(url: string, params: FetchIfParams): Promise<Response> {
        if (params.method === "GET") {
            let getParams = params as FetchIfGETParams;
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

export class FetchingJQueryImpl implements FetchingIf {

    private static dataToResponse(data: any, url: string): Response {
        return {
            ok: true,
            arrayBuffer: () => {
                throw new Error("NotImplemented!");
            },
            body: null,
            headers: new Headers(),
            status: 200,
            blob: () => { return Promise.reject("NotImplemented!") },
            bodyUsed: false,
            formData: () => {
                return Promise.reject("NotImplemented!")
            },
            type: "cors",
            statusText: "",
            url,
            redirected: false,
            clone: () => { throw new Error("NotImplemented!"); },
            json: () => { return Promise.resolve(data); },
            text: () => { return Promise.resolve(String(data)); },
        } as Response
    }

    fetch(url: string, params: FetchIfParams): Promise<Response> {
        if (params.method === "GET") {
            return new Promise<Response>((res, rej) => {
                $.get(url, function () { })
                    .done(function (data: any) {
                        res(FetchingJQueryImpl.dataToResponse(data, url));
                    })
                    .fail(function (err: any) {
                        rej(err);
                    })
            });
        }
        else {
            let postParams = params as FetchIfPOSTParams;
            return new Promise<Response>((res, rej) => {
                let headers: any = {};
                if (postParams.headers !== void 0) {
                    headers = {};
                    postParams.headers.forEach((val: string | null, key: string) => {
                        if (postParams.headers === void 0) {
                            return;
                        }

                        if (val !== null) {
                            headers[key] = val
                        }
                    })
                }
                $.ajax({
                    url,
                    type: 'post',
                    data: JSON.parse(JSON.stringify(postParams.body)),
                    dataType: "json",
                    headers,
                    success: function (data: any) { }
                })
                    .done(function (data: any) {
                        res(FetchingJQueryImpl.dataToResponse(data, url));
                    })
                    .fail(function (err: any) {
                        rej(err);
                    })
            });
        }
    }

}