import { CommonOptions, DataSources } from "../config/common";
import { getJson } from "./Http";

export interface PatternQueryResponse {
    isOk: boolean,
    error?: string
}

export class ApiService {
    private static DEBUG_MODE = CommonOptions.DEBUG_MODE;

    private static baseUrl = DataSources.PATTERN_QUERY_API_URL[DataSources.PATTERN_QUERY_MODE];

    public static getValidationResult(query: string): Promise<PatternQueryResponse> {
        let url = `${this.baseUrl}/?query=${encodeURIComponent(query)}`;
        if (this.DEBUG_MODE) {
            console.log(url);
        }
        return getJson(url);
    }
}
