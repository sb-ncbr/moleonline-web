namespace MoleOnlineWebUI.Cache{
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
}