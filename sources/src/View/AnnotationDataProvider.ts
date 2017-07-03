namespace Annotation{

    import LiteMoleEvent = LiteMol.Bootstrap.Event;
    import FastMap = LiteMol.Core.Utils.FastMap;

    export interface ResidueAnnotation{
        text: string,
        reference: string,
        link: string,
        isLining: boolean
    };
    export interface ChannelAnnotation{
        text: string,
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

    export class AnnotationDataProvider{

        private static residueAnnotations: LiteMol.Core.Utils.FastMap<string,ResidueAnnotation[]>;
        private static channelAnnotations: LiteMol.Core.Utils.FastMap<string,ChannelAnnotation[]>;
        private static proteinAnnotations: ProteinAnnotation[];

        private static liningResidues: string[];

        private static subscribed: boolean = false;

        private static dataReady:boolean = false;

        private static moleDataPromise: Promise<any>;
        private static channelsDBPromise: Promise<any>;

        private static retries:number = 0;
        

        private static isLining(residue:string):boolean{
            return this.liningResidues.indexOf(residue)>=0;
        }

        private static parseChannelsData(data:DataInterface.AnnotationObject[]){
            let map = LiteMol.Core.Utils.FastMap.create<string,ChannelAnnotation[]>();

            for(let item of data){               
                for(let cid in item.Annotation){
                    let channelId = cid;
                    
                    if(channelId === null){
                        console.log("Found channel annotation wihtout id. Skipping...");
                        continue;
                    }

                    if(item.Annotation[channelId] === void 0){
                        console.log("Found channel annotation without annotation text. Skipping...");
                        continue;
                    }
                    let list:ChannelAnnotation[] = [];
                    if(map.has(channelId)){
                        //Keep only first found annotation for channel -> maybe will be changed in the future
                        //continue;
                        let l = map.get(channelId);
                        if(l!==void 0){
                            list = l;
                        }
                    }
                    list.push(
                        {
                            text: item.Annotation[channelId] as string,
                            reference: item.Reference,
                            link: this.createLink("DOI", item.Reference)
                        }
                    );
                    map.set(channelId,list);
                }
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
                    isLining: this.isLining(residueId)
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

        private static parseLiningResidues(data:DataInterface.ChannelsDBData){
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

            return liningResidues;
        }

        public static isDataReady():boolean{
            return this.dataReady;
        }

        private static handleChannelsAPIData(data:any){
            let liningResidues = this.parseLiningResidues(data);
            let channelsData = this.parseChannelsData(data.Annotations);
            
            return {liningResidues,channelsData};
        }

        private static handleAnnotationsAPIData(data:any){
            let proteinData = this.parseProteinData(data.EntryAnnotations);
            let residueData = this.parseResidueData(data.ResidueAnnotations);
            
            return {proteinData,residueData};
        }

        public static subscribeToPluginContext(context: LiteMol.Bootstrap.Context){
            interface channelsAPIDataHandledPromiseResult{
                liningResidues: any,
                channelsData: any
            }
            interface annotationAPIDataHandledPromiseResult{
                proteinData: any,
                residueData: any
            }

            let channelsAPIobserver:any;
            let annotationsAPIobserver:any;

            new Promise<Object>((res,rej)=>{
                let moleData = context.select("mole-data")[0] as LiteMol.Bootstrap.Entity.Data.Json;
                if(moleData !== void 0){
                    res(this.handleChannelsAPIData(moleData.props.data));
                }else{
                    channelsAPIobserver = LiteMoleEvent.Tree.NodeAdded.getStream(context).subscribe(e => {
                        if(e.data.tree !== void 0 && e.data.ref === "mole-data"){
                            res(this.handleChannelsAPIData(e.data.props.data));
                        }
                    });
                }
            }).then((val)=>{
                if(channelsAPIobserver!==void 0){
                    channelsAPIobserver.dispose();
                }

                let item = val as channelsAPIDataHandledPromiseResult;

                this.liningResidues = item.liningResidues;
                this.channelAnnotations = item.channelsData;
                
                new Promise<Object>((res,rej)=>{
                    let annotationData = context.select("channelsDB-annotation-data")[0] as LiteMol.Bootstrap.Entity.Data.Json;
                    if(annotationData !== void 0){
                        res(this.handleAnnotationsAPIData(annotationData.props.data));
                    }
                    else{
                        annotationsAPIobserver = LiteMoleEvent.Tree.NodeAdded.getStream(context).subscribe(e => {
                            if(e.data.tree !== void 0 && e.data.ref === "channelsDB-annotation-data"){
                                res(this.handleAnnotationsAPIData(e.data.props.data));
                            }
                        });
                    }
                }).then((val)=>{
                    if(annotationsAPIobserver!==void 0){
                        annotationsAPIobserver.dispose();
                    }

                    let item = val as annotationAPIDataHandledPromiseResult;
                    this.proteinAnnotations = item.proteinData;
                    this.residueAnnotations = item.residueData;

                    this.dataReady = true;
                    this.invokeHandlers();
                })
                .catch((err)=>{
                    console.log("annotationsAPIParseError:");
                    console.log(err);
                    if(annotationsAPIobserver !== void 0){
                        annotationsAPIobserver.dispose();
                    }
                    if(channelsAPIobserver !== void 0){
                        channelsAPIobserver.dispose();
                    }
                    if(this.retries > 5){
                        return;
                    }
                    this.retries++;
                    setTimeout((()=>{this.subscribeToPluginContext(context)}).bind(this),100);
                });
                
            })
            .catch((err)=>{
                console.log("channelsAPIParseError:");
                console.log(err);
                if(annotationsAPIobserver !== void 0){
                    annotationsAPIobserver.dispose();
                }
                if(channelsAPIobserver !== void 0){
                    channelsAPIobserver.dispose();
                }

                if(this.retries > 5){
                    return;
                }
                this.retries++;
                setTimeout((()=>{this.subscribeToPluginContext(context)}).bind(this),100);
            });

            this.subscribed = true;
        }

        private static handlers: {handler:()=>void}[];
        public static subscribeForData(handler:()=>void){
            if(this.handlers === void 0){
                this.handlers = [];
            }
            this.handlers.push({handler});
        }

        private static invokeHandlers(){
            if(this.handlers === void 0){
                console.log("no handlers attached... Skiping...");
                return;
            }
            for(let h of this.handlers){
                h.handler();
            }
        }
/*
        public static getResidueAnnotationsPromise(residueId:string):Promise<ResidueAnnotation[]>{
            return new Promise<ResidueAnnotation[]>((res,rej)=>{
                if(!this.subscribed){
                    rej({error: 1, message: "Not subscribed for data yet!"});
                    return;
                }

                if(this.residueAnnotations !== void 0){
                    let value = this.residueAnnotations.get(residueId);
                    if(value === void 0){
                        res([]);
                        return;
                    }
                    
                    res(value);
                    return;                    
                }

                rej({error: 2, message: "No data loaded"});
            });
        }

        public static getChannelAnnotationsPromise(channelId:string):Promise<ChannelAnnotation|null>{
            return new Promise<ChannelAnnotation|null>((res,rej)=>{
                if(!this.subscribed){
                    rej({error: 1, message: "Not subscribed for data yet!"});
                    return;
                }

                if(this.channelAnnotations !== void 0){
                    let value = this.channelAnnotations.get(channelId);
                    if(value === void 0){
                        res(null);
                        return;
                    }

                    res(value);
                    return;
                }

                rej({error: 2, message: "No data loaded"});
            });
        }

        public static getProteinAnnotationsPromise():Promise<ProteinAnnotation[]>{
            return new Promise<ProteinAnnotation[]>((res,rej)=>{
                if(!this.subscribed){
                    rej({error: 1, message: "Not subscribed for data yet!"});
                    return;
                }

                if(this.proteinAnnotations !== void 0){
                    res(this.proteinAnnotations);
                    return;
                }

                rej({error: 2, message: "No data loaded"});
            });
        } 
*/
        public static getResidueAnnotations(residueId:string):ResidueAnnotation[]|undefined{
            if(!this.subscribed){
                return void 0;
            }

            if(this.residueAnnotations !== void 0){
                let value = this.residueAnnotations.get(residueId);
                if(value === void 0){
                    return [];
                }
                
                return value;             
            }

            return void 0;
        }

        public static getResidueList():string[]|undefined{
            if(!this.subscribed || this.residueAnnotations === void 0){
                return void 0;
            }

            let rv:string[] = [];
            this.residueAnnotations.forEach((_,key,map)=>{
                if(rv.indexOf(key)<0){
                    rv.push(key);
                }
            });

            return rv;
        }

        public static getChannelAnnotations(channelId:string):ChannelAnnotation[]|null|undefined{
            if(!this.subscribed){
                return void 0; 
            }

            if(this.channelAnnotations !== void 0){
                let value = this.channelAnnotations.get(channelId);
                if(value === void 0){
                    return null;
                }

                return value;
            }

            return void 0;
        }

        public static getChannelAnnotation(channelId:string):ChannelAnnotation|null|undefined{
            if(!this.subscribed){
                return void 0; 
            }

            if(this.channelAnnotations !== void 0){
                let value = this.channelAnnotations.get(channelId);
                if(value === void 0){
                    return null;
                }

                return value[0];
            }

            return void 0;
        }

        public static getProteinAnnotations():ProteinAnnotation[]|undefined{
                if(!this.subscribed){
                    return void 0;
                }

                if(this.proteinAnnotations !== void 0){
                    return this.proteinAnnotations;
                }

                return void 0;
        }
    }
}