namespace MoleOnlineWebUI.Cache{

    import ChannelsDBAPI = MoleOnlineWebUI.Service.ChannelsDBAPI;

    export class TunnelName{
        private static cache:Map<string,string>;

        public static reload(data:DataInterface.MoleData){
            let channels:DataInterface.Tunnel[] = [];
            if(data.Channels.MergedPores.length > 0){
                channels = channels.concat(data.Channels.MergedPores);
            }
            if(data.Channels.Paths.length > 0){
                channels = channels.concat(data.Channels.Paths);
            }
            if(data.Channels.Pores.length > 0){
                channels = channels.concat(data.Channels.Pores);
            }
            if(data.Channels.Tunnels.length > 0){
                channels = channels.concat(data.Channels.Tunnels);
            }

            //let nameIdxMap = new Map<String,number>();

            let cache = new Map<string,string>();
            for(let channel of channels){
                /*
                if(!nameIdxMap.has(channel.Type)){
                    nameIdxMap.set(channel.Type,1);
                }*/
                
                //let nameIdx = nameIdxMap.get(channel.Type) as number;
                //cache.set(channel.GUID,`${channel.Type[0]}${nameIdx++}`);
                //nameIdxMap.set(channel.Type,nameIdx);               

                cache.set(channel.GUID,`${channel.Type[0]}${channel.Id}C${channel.Cavity}`);
            }

            this.cache = cache;
        }

        public static get(channelId:string){
            if(this.cache === void 0){
                return void 0;
            }

            return this.cache.get(channelId);
        }
    }

    export class LastSelectedChannelData{
        private static data:DataInterface.Layers;
        public static set(data:DataInterface.Layers){
            this.data=data;
        }
        public static get():DataInterface.Layers{
            return this.data;
        }
    }

    export class LastVisibleChannels{
        private static data:DataInterface.Tunnel[];
        public static set(data:DataInterface.Tunnel[]){
            this.data=data;
        }
        public static get():DataInterface.Tunnel[]{
            return this.data;
        }
    }

    export class ChannelsDBData{
        private static channelAnnotationCache:LiteMol.Core.Utils.FastMap<string,ChannelsDBAPI.ChannelAnnotation[]>;
        private static channelDataCache:DataInterface.ChannelsDBChannels;
        private static liningResiduesCache:string[];
        private static residueAnnotationCache:LiteMol.Core.Utils.FastMap<string,ChannelsDBAPI.ResidueAnnotation[]>;        

        public static reload(pdbid:string){
            let channelsData = ChannelsDBAPI.ApiService.getChannelsData(pdbid);
            let proteinData = ChannelsDBAPI.ApiService.getProteinData(pdbid);

            channelsData.then(val=>{
                this.channelAnnotationCache = val.channelsAnnotations;
                this.channelDataCache = val.channelsData;
                this.liningResiduesCache = val.liningResidues;
            });

            proteinData.then(val=>{
                this.residueAnnotationCache = val.residueData;
            });

            return Promise.all(
                [
                    channelsData,
                    proteinData
                ]
            );
        }

        public static doWhenCached(pdbid:string){
            if(this.isCached()){
                return Promise.resolve();
            }
            return new Promise<void>((res,rej)=>{
                this.reload(pdbid).then(val=>res()).catch(err=>rej(err));
            });
        }

        public static isCached(){
            return this.channelAnnotationCache!==void 0 
                && this.channelDataCache!==void 0
                && this.liningResiduesCache!==void 0
                && this.residueAnnotationCache!==void 0;
        }

        public static getChannelAnnotations(pdbid:string,channelId:string){

            if(this.isCached()){
                return Promise.resolve(this.channelAnnotationCache.get(channelId));
            }

            return new Promise<ChannelsDBAPI.ChannelAnnotation[] | undefined>((res,rej)=>{
                this.reload(pdbid)
                    .then(val=>{
                        res(this.channelAnnotationCache.get(channelId));
                    })
                    .catch(err=>rej(err));
            });
        }

        public static getChannelAnnotationsImmediate(channelId:string){
            if(!this.isCached()){
                return null;
            }

            let annotations = this.channelAnnotationCache.get(channelId);

            if(annotations===void 0){
                return null;
            }

            return annotations;
        }

        public static getChannelsAnnotations(pdbid:string){
            
            if(this.isCached()){
                return Promise.resolve(this.channelAnnotationCache);
            }

            return new Promise<LiteMol.Core.Utils.FastMap<string,ChannelsDBAPI.ChannelAnnotation[]>>((res,rej)=>{
                this.reload(pdbid)
                    .then(val=>{
                        res(this.channelAnnotationCache);
                    })
                    .catch(err=>rej(err));
            });
        }

        public static getChannelsData(pdbid:string){
            
            if(this.isCached()){
                return Promise.resolve(this.channelDataCache);
            }

            return new Promise<DataInterface.ChannelsDBChannels>((res,rej)=>{
                this.reload(pdbid)
                    .then(val=>{
                        res(this.channelDataCache);
                    })
                    .catch(err=>rej(err));
            });
        }

        public static getResidueAnnotations(pdbid:string,seqNumberAndChain:string){
            
            if(this.isCached()){
                return Promise.resolve(this.residueAnnotationCache.get(seqNumberAndChain));
            }

            return new Promise<ChannelsDBAPI.ResidueAnnotation[] | undefined>((res,rej)=>{
                this.reload(pdbid)
                    .then(val=>{
                        res(this.residueAnnotationCache.get(seqNumberAndChain));
                    })
                    .catch(err=>rej(err));
            });
        }

        public static getResidueAnnotationsImmediate(seqNumberAndChain:string){
            
            if(!this.isCached()){
                return null;
            }

            let annotations = this.residueAnnotationCache.get(seqNumberAndChain);
            if(annotations===void 0){
                return null;
            }

            return annotations;
        }

        public static getResiduesAnnotations(pdbid:string){
            
            if(this.isCached()){
                return Promise.resolve(this.residueAnnotationCache);
            }

            return new Promise<LiteMol.Core.Utils.FastMap<string, ChannelsDBAPI.ResidueAnnotation[]>>((res,rej)=>{
                this.reload(pdbid)
                    .then(val=>{
                        res(this.residueAnnotationCache);
                    })
                    .catch(err=>rej(err));
            });
        }

        public static getResiduesAnnotationsImmediate(){
            if(!this.isCached()){
                return null;
            }

            let annotations = this.residueAnnotationCache;
            if(annotations===void 0){
                return null;
            }

            return <Map<string,ChannelsDBAPI.ResidueAnnotation[]>>annotations;
        }

        public static getLiningResidues(pdbid:string){
            
            if(this.isCached()){
                return Promise.resolve(this.liningResiduesCache.slice());
            }

            return new Promise<string[] | undefined>((res,rej)=>{
                this.reload(pdbid)
                    .then(val=>{
                        if(this.liningResiduesCache===void 0){
                            res(void 0);
                        }
                        else{
                            res(this.liningResiduesCache.slice());
                        }
                    })
                    .catch(err=>rej(err));
            });
        }
    }
}