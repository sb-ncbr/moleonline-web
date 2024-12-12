import { AnnotationObject, Annotations, ChannelsDBChannels, ChannelsDBData, Tunnel } from "./DataInterface";
// import LiteMoleEvent = LiteMol.Bootstrap.Event;
// import FastMap = LiteMol.Core.Utils.FastMap;
import { Fetching } from "./FetchingIf";
import { CommonOptions, DataSources } from "../config/common";

export interface ResidueAnnotation {
    text: string,
    reference: string,
    link: string,
};
export interface ChannelAnnotation {
    name: string,
    description: string,
    reference: string,
    link: string
};
export interface ProteinAnnotation {
    function: string,
    name: string,
    catalytics: string[],
    uniProtId: string,
    link: string
};

export interface ChannelsDataResponse {
    liningResidues: string[]
    channelsAnnotations: Map<string, ChannelAnnotation[]>
    channelsData: ChannelsDBChannels,
};

export interface ProteinDataResponse {
    proteinData: ProteinAnnotation[];
    residueData: Map<string, ResidueAnnotation[]>;
};

export class ApiService {

    private static DEBUG_MODE = CommonOptions.DEBUG_MODE;

    private static baseUrl = DataSources.ANNOTATION_API_URL[DataSources.ANNOTATION_API_MODE];

    private static sendPOST(url: string, formData: FormData): Promise<any> {
        let fetching = Fetching.get();
        return this.handleResponse(fetching.fetch(url, {
            method: "POST",
            body: formData,
        }), url);
    }
    private static sendPOSTjson(url: string, formData: Object): Promise<any> {
        let fetching = Fetching.get();

        const headers = new Headers();
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json");
        return this.handleResponse(fetching.fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(formData),

        }), url);
    }
    private static sendGET(url: string): Promise<any> {
        let fetching = Fetching.get();
        if (CommonOptions.DEBUG_MODE)
            console.time(`sendGET '${url}'`);
        return this.handleResponse(fetching.fetch(url, {
            method: "GET"
        }), url).then((val) => {
            if (CommonOptions.DEBUG_MODE)
                console.timeEnd(`sendGET '${url}'`);
            return val;
        });
    }
    private static handleResponse(response: Promise<Response>, url: string) {
        return new Promise<any>((res, rej) => {
            response.then((rawResponse) => {
                if (!rawResponse.ok) {
                    if (this.DEBUG_MODE) {
                        console.log(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                    }
                    rej(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                }
                else {
                    res(rawResponse.json());
                }
            })
                .catch(err => {
                    rej(err);
                });
        });
    }

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
                    name: item.Name,
                    description: item.Description,
                    reference: item.Reference,
                    link: this.createLink(item.ReferenceType, item.Reference)
                }
            );
            map.set(item.Id, list);
        }

        return map;
    }

    private static stripChars(str: string, chars: string[]): string {
        for (let char of chars) {
            str = str.replace(char, "");
        }

        return str;
    }
    private static parseCatalytics(items: string[]): string[] {
        let rv: string[] = [];
        for (let item of items) {
            let line = item.replace(/\(\d*\)/g, (x: string) => `<sub>${this.stripChars(x, ['(', ')'])}</sub>`);
            line = line.replace(/\(\+\)|\(\-\)/g, (x: string) => `<sup>${this.stripChars(x, ['(', ')'])}</sup>`)

            rv.push(line);
        }
        return rv;
    }

    private static parseProteinData(data: Annotations.ProteinAnnotation[]) {
        let list: ProteinAnnotation[] = [];

        for (let item of data) {
            list.push({
                name: item.Name,
                function: item.Function,
                link: this.createLink("UniProt", item.UniProtId),
                uniProtId: item.UniProtId,
                catalytics: this.parseCatalytics(item.Catalytics)
            });
        }

        return list;
    }

    //PUBMEDID vs UniProtId ??? PUBMED není v JSONU vůbec přítomné
    //link pro uniprot používá adresu http://www.uniprot.org/uniprot/
    private static createLink(type: string, reference: string): string {
        if (type === "DOI") {
            return `http://dx.doi.org/${reference}`;
        }
        else if (type === "UniProt") {
            return `http://www.uniprot.org/uniprot/${reference}`;
        }
        else if (type === "PubMed") {
            return `http://europepmc.org/abstract/MED/${reference}`;
        }
        else {
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

    private static parseLiningResiduesAndChannelsData(data: ChannelsDBData) {
        let channels: Tunnel[] = [];

        if (data.Channels.ReviewedChannels_MOLE !== void 0) {
            channels = channels.concat(data.Channels.ReviewedChannels_MOLE);
        }

        if (data.Channels.ReviewedChannels_Caver !== void 0) {
            channels = channels.concat(data.Channels.ReviewedChannels_Caver);
        }

        if (data.Channels.CSATunnels_MOLE !== void 0) {
            channels = channels.concat(data.Channels.CSATunnels_MOLE);
        }

        if (data.Channels.CSATunnels_Caver !== void 0) {
            channels = channels.concat(data.Channels.CSATunnels_Caver);
        }

        if (data.Channels.TransmembranePores_MOLE !== void 0) {
            channels = channels.concat(data.Channels.TransmembranePores_MOLE);
        }

        if (data.Channels.TransmembranePores_Caver !== void 0) {
            channels = channels.concat(data.Channels.TransmembranePores_Caver);
        }

        if (data.Channels.CofactorTunnels_MOLE !== void 0) {
            channels = channels.concat(data.Channels.CofactorTunnels_MOLE);
        }

        if (data.Channels.CofactorTunnels_Caver !== void 0) {
            channels = channels.concat(data.Channels.CofactorTunnels_Caver);
        }

        if (data.Channels.ProcognateTunnels_MOLE !== void 0) {
            channels = channels.concat(data.Channels.ProcognateTunnels_MOLE);
        }

        if (data.Channels.ProcognateTunnels_Caver !== void 0) {
            channels = channels.concat(data.Channels.ProcognateTunnels_Caver);
        }

        if (data.Channels.AlphaFillTunnels_MOLE !== void 0) {
            channels = channels.concat(data.Channels.AlphaFillTunnels_MOLE);
        }

        if (data.Channels.AlphaFillTunnels_Caver !== void 0) {
            channels = channels.concat(data.Channels.AlphaFillTunnels_Caver);
        }

        let liningResidues: string[] = [];
        for (let channel of channels) {
            for (let layerInfo of channel.Layers.LayersInfo) {
                for (let residue of layerInfo.Residues) {
                    let residueId = residue.split(" ").slice(1, 3).join(" ");
                    if (liningResidues.indexOf(residueId) < 0) {
                        liningResidues.push(residueId);
                    }
                }
            }
        }

        return { liningResidues, channels: data.Channels };
    }

    private static handleChannelsAPIData(data: any) {
        let liningResiduesAndChannels = this.parseLiningResiduesAndChannelsData(data);
        let channelsAnnotations = this.parseChannelsAnnotations(data.Annotations);

        return { liningResidues: liningResiduesAndChannels.liningResidues, channelsAnnotations, channelsData: liningResiduesAndChannels.channels };
    }

    private static handleAnnotationsAPIData(data: any) {
        let proteinData = this.parseProteinData(data.EntryAnnotations);
        let residueData = this.parseResidueData(data.ResidueAnnotations);

        return { proteinData, residueData };
    }

    public static getChannelsData(pdbid: string): Promise<ChannelsDataResponse> {
        let url = `${this.baseUrl}/channels/pdb/${pdbid}`;
        if (this.DEBUG_MODE) {
            console.log(url);
        }
        return this.sendGET(url).then(async val => {
            return this.handleChannelsAPIData(val);
        });
    }

    public static getProteinData(pdbid: string): Promise<ProteinDataResponse> {
        let url = `${this.baseUrl}/annotations/pdb/${pdbid}`;
        if (this.DEBUG_MODE) {
            console.log(url);
        }
        return this.sendGET(url).then(val => {
            return this.handleAnnotationsAPIData(val);
        });
    }
}
