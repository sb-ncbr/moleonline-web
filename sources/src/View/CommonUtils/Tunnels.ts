namespace CommonUtils{
    export class Tunnels{
        public static getLength(tunnel:DataInterface.Tunnel):number{
            let len = tunnel.Layers.LayersInfo[tunnel.Layers.LayersInfo.length - 1].LayerGeometry.EndDistance;
            len = CommonUtils.Numbers.roundToDecimal(len,1);//Math.round(len*10)/10;
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

        /*
        public static getAnnotation(tunnelId:string,context: LiteMol.Bootstrap.Context):{text:string,source:string}|null{
            let parsedData = context.select('mole-data')[0] as LiteMol.Bootstrap.Entity.Data.Json;
            console.log(parsedData);
            let annotations = (parsedData.props.data as DataInterface.ChannelsDBData).Annotations;
            
            for(let item of annotations){
                if(item.Annotation[tunnelId] !== void 0){
                    return {
                        text: item.Annotation[tunnelId],
                        source: item.Reference
                    };
                }
            }
            return null;
        }
        
        public static getResidueAnnotation(residueId:string,context: LiteMol.Bootstrap.Context):{text:string,source:string}|null{
            return null;
        }
        */
    }
}