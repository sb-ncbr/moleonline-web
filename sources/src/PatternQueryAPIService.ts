import { DataSources } from "../config/common";
import { getJson } from "./Http";

export interface PatternQueryResponse {
    isOk: boolean,
    error?: string
}

export class ApiService {
    private static baseUrl = DataSources.PATTERN_QUERY_API_URL[DataSources.PATTERN_QUERY_MODE];

    public static getValidationResult(query: string): Promise<PatternQueryResponse> {
        return getJson(`${this.baseUrl}/?query=${encodeURIComponent(query)}`);
    }
}
