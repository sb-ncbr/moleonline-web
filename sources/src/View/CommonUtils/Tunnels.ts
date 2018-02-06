namespace CommonUtils{
    export class Tunnels{
        public static getLength(tunnel:DataInterface.Tunnel):number{
            let len = tunnel.Layers.LayersInfo[tunnel.Layers.LayersInfo.length - 1].LayerGeometry.EndDistance;
            len = CommonUtils.Numbers.roundToDecimal(len,1);
            return len;
        }

        public static getBottleneck(tunnel: DataInterface.Tunnel):string{        
            let bneck = "<Unknown>";
            for(let element of tunnel.Layers.LayersInfo){
                if(element.LayerGeometry.Bottleneck){
                    let val = element.LayerGeometry.MinRadius;
                    bneck = (Math.round(val*10)/10).toString();
                    break;
                }
            }

            return bneck;
        }

        public static getName(tunnel: DataInterface.Tunnel):string|undefined{
            if(tunnel===void 0){
                return void 0;
            }
            return MoleOnlineWebUI.Cache.TunnelName.get(tunnel.GUID);
        }

        public static concatTunnelsSafe(origin:DataInterface.Tunnel[],newTunnels:DataInterface.Tunnel[]|undefined){
            if(newTunnels===void 0){
                return origin;
            }
    
            return origin.concat(newTunnels);
        }
    }
}