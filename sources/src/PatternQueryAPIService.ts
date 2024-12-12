import { CommonOptions, DataSources } from "../config/common";
import { Fetching } from "./FetchingIf";

export interface PatternQueryResponse {
    isOk: boolean,
    error?: string
}

export class ApiService {
    private static DEBUG_MODE = CommonOptions.DEBUG_MODE;

    private static baseUrl = DataSources.PATTERN_QUERY_API_URL[DataSources.PATTERN_QUERY_MODE];

    private static sendGET(url: string): Promise<any> {
        let fetching = Fetching.get();
        return this.handleResponse(fetching.fetch(url, {
            method: "GET",
        }), url);
    }
    private static handleResponse(response: Promise<Response>, url: string) {
        return new Promise<any>((res, rej) => {
            response.then((rawResponse) => {
                if (!rawResponse.ok) {
                    if (this.DEBUG_MODE) {
                        console.log(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                    }
                    rej(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                    return;
                }
                res(rawResponse.json());
            })
                .catch(err => {
                    rej(err);
                });
        });
    }

    public static getValidationResult(query: string): Promise<PatternQueryResponse> {
        let url = `${this.baseUrl}/?query=${query}`;
        if (this.DEBUG_MODE) {
            console.log(url);
        }
        return this.sendGET(url);
    }
}
