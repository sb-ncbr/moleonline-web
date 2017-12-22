namespace MoleOnlineWebUI.Service.ChannelsDBAPI{

    import LiteMoleEvent = LiteMol.Bootstrap.Event;
    import FastMap = LiteMol.Core.Utils.FastMap;
    import Fetching = MoleOnlineWebUI.Service.Fetching;

    export interface ResidueAnnotation{
        text: string,
        reference: string,
        link: string,
        /*isLining: boolean*/
    };
    export interface ChannelAnnotation{
        name: string,
        description: string,
        reference: string,
        link: string
    };
    export interface ProteinAnnotation{
        function: string,
        name: string,
        catalytics: string[],
        uniProtId: string,
        link: string
    };

    export interface ChannelsDataResponse{
        liningResidues: string[]
        channelsAnnotations: FastMap<string, ChannelAnnotation[]>
        channelsData: DataInterface.ChannelsDBChannels
    };

    export interface ProteinDataResponse{
        proteinData: ProteinAnnotation[];
        residueData: FastMap<string, ResidueAnnotation[]>;
    };

    export class ApiService{

        private static DEBUG_MODE = Config.CommonOptions.DEBUG_MODE;
        
        private static baseUrl = Config.DataSources.ANNOTATION_API_URL[Config.DataSources.ANNOTATION_API_MODE];
        
        private static sendPOST(url:string,formData:FormData):Promise<any>{
            let fetching = Fetching.get();
            return this.handleResponse(fetching.fetch(url, {
                method: "POST",
                body: formData,
            }), url);
        }
        private static sendPOSTjson(url:string,formData:Object):Promise<any>{
            let fetching = Fetching.get();

            const headers = new Headers();
            headers.append("Accept", "application/json");
            headers.append("Content-Type", "application/json");
            return this.handleResponse(fetching.fetch(url, {
                method: "POST",
                headers,
                body:  JSON.stringify(formData),

            }), url);
        }
        private static sendGET(url:string):Promise<any>{
            let fetching = Fetching.get();
            if(Config.CommonOptions.DEBUG_MODE)
                console.time(`sendGET '${url}'`);     
                return this.handleResponse(fetching.fetch(url, {
                    method: "GET"
                }), url).then((val)=>{
                    if(Config.CommonOptions.DEBUG_MODE)
                        console.timeEnd(`sendGET '${url}'`);
                    return val;
                });                            
        }
        private static handleResponse(response:Promise<Response>,url:string){
            return new Promise<any>((res,rej)=>{
                response.then((rawResponse)=>{
                    if(!rawResponse.ok){
                        if(this.DEBUG_MODE){
                            console.log(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                        }
                        rej(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                    }
                    else{
                        res(rawResponse.json());
                    }
                })
                .catch(err=>{
                    rej(err);
                });
            });
        }

        private static parseChannelsAnnotations(data:DataInterface.AnnotationObject[]){
            let map = LiteMol.Core.Utils.FastMap.create<string,ChannelAnnotation[]>();

            for(let item of data){                                   
                if(item.Name === void 0){
                    console.log("Found channel annotation without annotation text(Name). Skipping...");
                    continue;
                }
                let list:ChannelAnnotation[] = [];
                if(map.has(item.Id)){
                    let l = map.get(item.Id);
                    if(l!==void 0){
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
                map.set(item.Id,list);
            }

            return map;
        }

        private static stripChars(str:string,chars:string[]):string{
            for(let char of chars){
                str = str.replace(char,"");
            }

            return str;
        }
        private static parseCatalytics(items: string[]):string[]{
            let rv:string[] = [];
            for(let item of items){
                let line = item.replace(/\(\d*\)/g,(x:string)=>`<sub>${this.stripChars(x,['(',')'])}</sub>`);
                line = line.replace(/\(\+\)|\(\-\)/g,(x:string)=>`<sup>${this.stripChars(x,['(',')'])}</sup>`)
                
                rv.push(line);
            }
            return rv;
        }

        private static parseProteinData(data:DataInterface.Annotations.ProteinAnnotation[]){
            let list:ProteinAnnotation[] = [];

            for(let item of data){
                list.push({
                    name: item.Name,
                    function: item.Function,
                    link: this.createLink("UniProt",item.UniProtId),
                    uniProtId: item.UniProtId,
                    catalytics: this.parseCatalytics(item.Catalytics)
                });
            }

            return list; 
        }

        //PUBMEDID vs UniProtId ??? PUBMED není v JSONU vůbec přítomné
        //link pro uniprot používá adresu http://www.uniprot.org/uniprot/
        private static createLink(type: string, reference: string):string{
            if(type === "DOI"){
                return `http://dx.doi.org/${reference}`;
            }
            else if(type === "UniProt"){
                return `http://www.uniprot.org/uniprot/${reference}`;
            }
            else if(type === "PubMed"){
                return `http://europepmc.org/abstract/MED/${reference}`;
            }
            else{
                console.log(`Unknown reference type ${type} for reference ${reference}`);
                return `#unknown-reference-type`;
            }
        }

        private static parseResidueItem(item: DataInterface.Annotations.Annotation,map: FastMap<string,ResidueAnnotation[]>){
            let residueId = `${item.Id} ${item.Chain}`;
            let annotations = map.get(residueId);
                if(annotations === void 0){
                    annotations = [];
                }
                annotations.push({
                    text: item.Text,
                    reference: item.Reference,
                    link: this.createLink(item.ReferenceType,item.Reference),
                    /*isLining: this.isLining(residueId)*/
                });
            map.set(`${item.Id} ${item.Chain}`,annotations);
        }

        private static parseResidueData(data:DataInterface.Annotations.ResidueAnnotations){
            let map = LiteMol.Core.Utils.FastMap.create<string,ResidueAnnotation[]>();

            for(let item of data.ChannelsDB){
                this.parseResidueItem(item,map);
            }

            for(let item of data.UniProt){
                this.parseResidueItem(item,map);
            }

            return map;   
        }

        private static parseLiningResiduesAndChannelsData(data:DataInterface.ChannelsDBData){
            let channels:DataInterface.Tunnel[] = [];
            
            if(data.Channels.ReviewedChannels !== void 0){
                channels = channels.concat(data.Channels.ReviewedChannels);
            }

            if(data.Channels.CSATunnels !== void 0){
                channels = channels.concat(data.Channels.CSATunnels);
            }

            if(data.Channels.TransmembranePores !== void 0){
                channels = channels.concat(data.Channels.TransmembranePores);
            }

            if(data.Channels.CofactorTunnels !== void 0){
                channels = channels.concat(data.Channels.CofactorTunnels);
            }

            let liningResidues:string[] = [];
            for(let channel of channels){                
                for(let layerInfo of channel.Layers.LayersInfo){
                    for(let residue of layerInfo.Residues){
                        let residueId = residue.split(" ").slice(1,3).join(" ");
                        if(liningResidues.indexOf(residueId)<0){
                            liningResidues.push(residueId);
                        }
                    }
                }
            }

            return {liningResidues, channels:data.Channels};
        }

        private static handleChannelsAPIData(data:any){
            let liningResiduesAndChannels = this.parseLiningResiduesAndChannelsData(data);
            let channelsAnnotations = this.parseChannelsAnnotations(data.Annotations);
            
            return {liningResidues:liningResiduesAndChannels.liningResidues,channelsAnnotations,channelsData:liningResiduesAndChannels.channels};
        }

        private static handleAnnotationsAPIData(data:any){
            let proteinData = this.parseProteinData(data.EntryAnnotations);
            let residueData = this.parseResidueData(data.ResidueAnnotations);
            
            return {proteinData,residueData};
        }

        public static getChannelsData(pdbid:string):Promise<ChannelsDataResponse>{
            let url = `${this.baseUrl}/PDB/${pdbid}`;
            if(this.DEBUG_MODE){
                console.log(url);
            }
            return this.sendGET(url).then(val=>{
                return this.handleChannelsAPIData(val);
            });
        }

        public static getProteinData(pdbid:string):Promise<ProteinDataResponse>{
            let url = `${this.baseUrl}/Annotations/${pdbid}`;
            if(this.DEBUG_MODE){
                console.log(url);
            }
            return this.sendGET(url).then(val=>{
                return this.handleAnnotationsAPIData(val);
            });
        }
    }
}