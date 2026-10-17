import { AnnotationObject, Annotations, ChannelsDBChannels, ChannelsDBData } from "./DataInterface";
import { getJson } from "./Http";
import { CommonOptions, DataSources } from "../config/common";
import { customAlphabet } from 'nanoid';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const nanoidAlphaNum = customAlphabet(ALPHABET, 10);

export interface ResidueAnnotation {
    text: string,
    reference: string,
    link: string,
};
export interface ChannelAnnotation {
    id: string,
    channelId?: string,
    name: string,
    description: string,
    reference: string,
    referenceType: string,
    link?: string
};
export interface ChannelsDataResponse {
    channelsAnnotations: Map<string, ChannelAnnotation[]>
    channelsData: ChannelsDBChannels,
};

export interface ProteinDataResponse {
    residueData: Map<string, ResidueAnnotation[]>;
};

export class ApiService {

    private static baseUrl = DataSources.ANNOTATION_API_URL[DataSources.ANNOTATION_API_MODE];

    private static parseChannelsAnnotations(data: AnnotationObject[]) {
        let map = new Map<string, ChannelAnnotation[]>();

        for (let item of data) {
            if (item.Name === void 0) {
                console.log("Found channel annotation without annotation text(Name). Skipping...");
                continue;
            }
            let list: ChannelAnnotation[] = [];
            if (map.has(item.Id)) {
                let l = map.get(item.Id);
                if (l !== void 0) {
                    list = l;
                }
            }
            list.push(
                {
                    id: nanoidAlphaNum(),
                    name: item.Name,
                    description: item.Description,
                    reference: item.Reference,
                    referenceType: item.ReferenceType,
                    link: this.createLink(item.ReferenceType, item.Reference)
                }
            );
            map.set(item.Id, list);
        }

        return map;
    }

    //PUBMEDID vs UniProtId ??? PUBMED není v JSONU vůbec přítomné
    //link pro uniprot používá adresu http://www.uniprot.org/uniprot/
    public static createLink(type: string, reference: string): string {
        if (type === "DOI") {
            return `https://doi.org/${reference}`;
        }
        else if (type === "UniProt") {
            return `https://www.uniprot.org/uniprot/${reference}`;
        }
        else if (type === "PubMed") {
            return `https://europepmc.org/abstract/MED/${reference}`;
        }
        else {
            if (CommonOptions.DEBUG_MODE)
                console.log(`Unknown reference type ${type} for reference ${reference}`);
            return `#unknown-reference-type`;
        }
    }

    private static parseResidueItem(item: Annotations.Annotation, map: Map<string, ResidueAnnotation[]>) {
        let residueId = `${item.Id} ${item.Chain}`;
        let annotations = map.get(residueId);
        if (annotations === void 0) {
            annotations = [];
        }
        annotations.push({
            text: item.Text,
            reference: item.Reference,
            link: this.createLink(item.ReferenceType, item.Reference),
        });
        map.set(`${item.Id} ${item.Chain}`, annotations);
    }

    private static parseResidueData(data: Annotations.ResidueAnnotations) {
        let map = new Map<string, ResidueAnnotation[]>();

        for (let item of data.ChannelsDB) {
            this.parseResidueItem(item, map);
        }

        for (let item of data.UniProt) {
            this.parseResidueItem(item, map);
        }

        return map;
    }

    public static getChannelsData(pdbid: string): Promise<ChannelsDataResponse> {
        let url = `${this.baseUrl}/channels/pdb/${pdbid}`;
        return getJson(url).then((val: ChannelsDBData) => ({
            channelsAnnotations: this.parseChannelsAnnotations(val.Annotations),
            channelsData: val.Channels,
        }));
    }

    public static getProteinData(pdbid: string): Promise<ProteinDataResponse> {
        let url = `${this.baseUrl}/annotations/pdb/${pdbid}`;
        return getJson(url).then(val => ({ residueData: this.parseResidueData(val.ResidueAnnotations) }));
    }
}
