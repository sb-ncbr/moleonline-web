namespace CommonUtils{
    import Model = LiteMol.Core.Structure.Molecule.Model;
    import Controller = LiteMol.Plugin.Controller;

    interface RType{chain: {authAsymId: string}, authSeqNumber:number, name?:string, backbone?:boolean};

    export class Residues{
        private static cache:Map<number,string>;

        private static initCache(){
            if(this.cache!==void 0){
                return;
            }

            this.cache = new Map<number,string>();
        }

        private static getDirect(residueSeqNumber:number, plugin: Controller){
            if(plugin.context.select('polymer-visual')[0].props!==void 0){
                let props = plugin.context.select('polymer-visual')[0].props as any;
                if(props.model===void 0 || props.model.model===void 0){
                    return "";
                }
                let model = props.model.model as Model;
                let params = LiteMol.Core.Structure.Query.residuesById(residueSeqNumber).compile()(
                    LiteMol.Core.Structure.Query.Context.ofStructure(
                        model
                    )
                );

                let fragment = params.fragments[0];
                let residueInd = fragment.residueIndices[0];
                let residueData = params.context.structure.data.residues;

                let resIdx = residueData.indices[residueInd];

                let name = residueData.name[resIdx];

                return name;
            }
            return "";
        }

        public static getName(residueSeqNumber:number, plugin: Controller):string{
            this.initCache();
            if(this.cache.has(residueSeqNumber)){
                let name =  this.cache.get(residueSeqNumber);
                if(name===void 0){
                    return "";
                }
                return name;
            }

            let name = this.getDirect(residueSeqNumber, plugin);
            this.cache.set(residueSeqNumber, name);

            return name;
        }

        public static sort(residues:string[], groupFunction?:(residues:RType[])=>RType[][], hasName?:boolean, includeBackbone?:boolean){

            if(includeBackbone===void 0){
                includeBackbone = false;
            }

            if(hasName===void 0){
                hasName = false;
            }

            if(residues.length===0){
                return residues;
            }

            let resParsed:RType[] = this.parseResidues(residues, hasName);
            let groups = [];

            if(groupFunction!==void 0){
                groups = groupFunction(resParsed);
            }
            else{
                groups.push(
                    resParsed
                );
            }

            let sortFn = this.getSortFunction();
            let all:RType[] = [];
            for(let group of groups){
                all = all.concat(group.sort(sortFn));
            }

            return all.map((val,idx,array)=>{
                if(hasName){
                    return `${val.name} ${val.authSeqNumber} ${val.chain.authAsymId}${(includeBackbone&&val.backbone)?' Backbone':''}`;
                }
                else{
                    return `${val.authSeqNumber} ${val.chain.authAsymId}${(includeBackbone&&val.backbone)?' Backbone':''}`;
                }
            });
        }

        private static parseResidue(residue:string){
            return residue.split(" ");
        }

        public static parseResidues(residues:string[], hasName?:boolean){
            if(hasName===void 0){
                hasName = false;
            }

            let resParsed:RType[] = [];
            for(let residue of residues){
                let residueParts = this.parseResidue(residue);
                if(hasName){
                    resParsed.push(
                        {
                            chain: {authAsymId: residueParts[2]}, 
                            authSeqNumber: Number(residueParts[1]),
                            name: residueParts[0],
                            backbone: (residueParts.length===4)
                        }  
                    );
                }
                else{
                    resParsed.push(
                        {
                            chain: {authAsymId: residueParts[1]}, 
                            authSeqNumber: Number(residueParts[0]),
                            backbone: (residueParts.length===3)
                        }  
                    );
                }
            }

            return resParsed;
        }

        public static getSortFunction(){
            return (a:RType,b:RType)=>{
                if(a.chain.authAsymId<b.chain.authAsymId){
                    return -1;
                }
                else if(a.chain.authAsymId>b.chain.authAsymId){
                    return 1;
                }
                else{
                    if(a.authSeqNumber===b.authSeqNumber){
                        if(a.backbone&&b.backbone){
                            return 0;
                        }
                        else if(a.backbone&&!b.backbone){
                            return -1;
                        }
                        else{
                            return 1;
                        }
                    }

                    return a.authSeqNumber-b.authSeqNumber;
                }
            };
        }
    }
}