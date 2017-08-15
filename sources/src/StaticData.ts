namespace MoleOnlineWebUI.StaticData{
    export class Bundle{
        public static get(key:string){
            let value = this.bundle[key];
            if(value === void 0){
                return key;
            }
            return value;
        }

        private static bundle:any = {
            "VoronoiScale":"Voronoi scale",
            "Length":"Length",
            "LengthAndRadius": "Length and radius"
        }
    }

    export interface WeightFunctionsType{
        label:string,
        value:string
    }
    export class WeightFunctions{
        private static cache:WeightFunctionsType[]|undefined = void 0;
        private static functions = ["VoronoiScale", "Length", "LengthAndRadius"];
        public static get():WeightFunctionsType[]{
            if(this.cache!==void 0){
                return this.cache;
            }
            
            let rv:WeightFunctionsType[] = [];
            for(let key of this.functions){
                rv.push({label: Bundle.get(key), value:key});
            }
            this.cache = rv;

            return rv;
        }
    }
}