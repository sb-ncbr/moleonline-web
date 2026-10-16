import { CommonOptions, DataSources } from "../config/common";
import { postJson } from "./Http";

export interface ChannelsDBResponse {
    Status: "OK" | "Error",
    Msg: string
}

export interface AnnotationData {
    CompId: string,
    SubmitId: number,
    Email: string,
    Message: string,
    TunnelAnnotations: TunnelAnnotation[],
    ResidueAnnotations: ResidueAnnotation[]
}

export type ReferenceType = "DOI" | "Pubmed" | "UniProt" | "";

export interface TunnelAnnotation {
    Id: string,
    ChannelId?: string,
    Name: string,
    Description: string,
    Reference: string,
    ReferenceType: ReferenceType
}

export interface ResidueAnnotation {
    Id: string,
    Chain: string,
    Text: string,
    Reference: string,
    ReferenceType: ReferenceType
}

export class ApiService {
    private static DEBUG_MODE = CommonOptions.DEBUG_MODE;

    private static baseUrl = DataSources.ANNOTATION_API_URL[DataSources.ANNOTATION_API_MODE];

    public static sendAnnotation(data: AnnotationData): Promise<ChannelsDBResponse> {
        let url = `${this.baseUrl}/UploadAnnotations/Mole`;
        if (this.DEBUG_MODE) {
            console.log(url);
        }
        return postJson(url, data);
    }
}