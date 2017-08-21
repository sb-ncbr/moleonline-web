namespace MoleOnlineWebUI.Service.MoleAPI{

    export type ComputationStatus = 
        "Initializing"|
        "Initialized"|
        "FailedInitialization"|
        "Running"|
        "Finished"|
        "Error"|
        "Deleted"|
        "Aborted";
    export interface InitResponse{
        ComputationId: string,
        SubmitId: number,
        Status: ComputationStatus,
        ErrorMsg: string
    };
    export interface CompInfo{
        ComputationId: string,
        UserStructure: boolean,
        PdbId: string,
        AssemblyId: string|null,
        Submissions: Submission[]
    };

    export interface Submission{
        SubmitId: number,
        MoleConfig: MoleConfig,
        PoresConfig: PoresConfig
    };

    export interface MoleConfig{
        Input?: MoleConfigInput,
        Cavity?: MoleConfigCavity,
        Tunnel?: MoleConfigTunnel,
        NonActiveResidues?: MoleConfigNonActiveResidues[]|null,
        QueryFilter?: string|null,
        Origin?: MoleConfigOrigin|null,
        CustomExits?: MoleConfigOrigin|null,
        PoresMerged?: boolean,
        PoresAuto?: boolean
    };
    export interface MoleConfigInput{
        SpecificChains: string,
        ReadAllModels: boolean
    };
    export interface MoleConfigCavity{
        IgnoreHETAtoms: boolean,
        IgnoreHydrogens: boolean,
        InteriorThreshold: number,
        ProbeRadius: number
    };
    export interface MoleConfigTunnel{
        WeightFunction: string,
        BottleneckRadius: number,
        BottleneckTolerance: number,
        MaxTunnelSimilarity: number,
        OriginRadius: number,
        SurfaceCoverRadius: number,
        UseCustomExitsOnly: boolean
    };
    export type MoleConfigNonActiveResidues = MoleConfigResidues; //TODO:...
    export interface MoleConfigOrigin{
        Points: MoleConfigPoint[]|null,
        QueryExpression: string|null,
        Residues: MoleConfigResidues[]|null
    };
    export interface MoleConfigPoint{
        X:number,
        Y:number,
        Z:number
    };
    export interface MoleConfigResidues{Chain:string, SequenceNumber:number};

    export interface PoresConfig{
        InMembrane?: boolean,
        IsBetaBarel?: boolean,
        Chains?: any|null //TODO:...
    };

    export class ApiService{
        private static DEBUG_MODE = Config.CommonOptions.DEBUG_MODE;
        
        private static baseUrl = Config.DataSources.API_URL[Config.DataSources.MODE];
        
        private static sendPOST(url:string,formData:FormData):Promise<any>{
            return this.handleResponse(fetch(url, {
                method: "POST",
                body: formData,
            }), url);
        }
        private static sendPOSTjson(url:string,formData:Object):Promise<any>{
            const headers = new Headers();
            headers.append("Accept", "application/json");
            headers.append("Content-Type", "application/json");
            return this.handleResponse(fetch(url, {
                method: "POST",
                headers,
                body:  JSON.stringify(formData),

            }), url);
        }
        private static sendGET(url:string):Promise<any>{
            return this.handleResponse(fetch(url, {
                method: "GET"
            }), url);
        }
        private static handleResponse(response:Promise<Response>,url:string){
            return new Promise<any>((res,rej)=>{
                response.then((rawResponse)=>{
                    if(!rawResponse.ok){
                        if(this.DEBUG_MODE){
                            console.log(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                        }
                        rej(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                        return;
                    }
                    res(rawResponse.json());
                })
                .catch(err=>{
                    rej(err);
                });
            });
        }

        private static prepareInitUrl(pdbid:string,usePores:boolean,assemblyId?:string){

            let pores = (usePores)?"Pores/":"";
            let opts:string[] = [];
            let optional = "";
            if(assemblyId !== void 0){
                optional = "?";
            }

            if(assemblyId !== void 0){
                opts.push(`assemblyId=${assemblyId}`);
            }
            
            for(let idx=0;idx<opts.length;idx++){
                if(idx>0){
                    optional += "&";
                }
                optional += opts[idx];
            }

            return `${this.baseUrl}/Init/${pores}${pdbid}${optional}`;
        }
        /*
        private static mockInitResponse(){
            return new Promise<any>((res,rej)=>{
                res({
                    ComputationId: "DjcRaVhHHEqgrd1tI44zGQ",
                    SubmitId: 1,
                    Status: "Initializing",
                    ErrorMsg: ""
                });
            });
        }*/
        public static initWithParams(pdbid:string,usePores:boolean,assemblyId?:string):Promise<InitResponse>{
            let url = this.prepareInitUrl(pdbid,usePores,assemblyId);
            if(this.DEBUG_MODE){
                console.log(url);
            }
            return this.sendGET(url);
        }
        public static initWithFile(formData:FormData):Promise<InitResponse>{
            let url = this.prepareInitUrl("",false);
            if(this.DEBUG_MODE){
                console.log(url);
            }
            return this.sendPOST(url,formData);
        }

        public static getStatus(computationId:string, submitId?:number):Promise<InitResponse>{
            let optional = "";
            if(submitId!==void 0){
                optional = `?submitId=${submitId}`;
            }
            let url = `${this.baseUrl}/Status/${computationId}${optional}`;
            if(this.DEBUG_MODE){
                console.log(url);
            }
            return this.sendGET(url);
        }

        public static getComputationInfoList(computationId:string):Promise<CompInfo>{
            let url = `${this.baseUrl}/Compinfo/${computationId}`;
            if(this.DEBUG_MODE){
                console.log(url);
            }
            return this.sendGET(url);
        }

        private static handleJsonToStringResponse(response:Promise<any>){
            return new Promise<string>((res,rej)=>{
                response.then(value=>{
                    let data = value as Object;
                    res(JSON.stringify(data));
                })
                .catch(error=>{
                    rej(error);
                })
            });
        }

        public static submitMoleJob(computationId:string, data:MoleConfig){
            let url = `${this.baseUrl}/Submit/Mole/${computationId}`;
            if(this.DEBUG_MODE){
                console.log(url);
            }
            return this.sendPOSTjson(url, data);
        }

        public static submitPoresJob(computationId:string, data:PoresConfig){
            let url = `${this.baseUrl}/Submit/Pores/${computationId}?isBetaStructure=${data.IsBetaBarel}&inMembrane=${data.InMembrane}&chains=${data.Chains}`;
            if(this.DEBUG_MODE){
                console.log(url);
            }
            return this.sendGET(url);
        }

        public static getProteinStructure(computationId:string, submitId:number):Promise<string>{
            let url = `${this.baseUrl}/Data/${computationId}?submitId=${submitId}&format=molecule`;
            if(this.DEBUG_MODE){
                console.log(url);
            }
            return new Promise<any>((res,rej)=>{
                fetch(url, {
                    method: "GET"
                })
                .then((rawResponse)=>{
                    if(!rawResponse.ok){
                        if(this.DEBUG_MODE){
                            console.log(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                        }
                        rej(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                        return;
                    }
                    rawResponse.text().then(value=>{
                        res(value);
                    })
                    .catch(error=>{
                        rej(error);
                    })
                })
                .catch(error=>rej(error));
            });
        }

        public static getChannelsData(computationId:string, submitId:number):Promise<string>{
            let url = `${this.baseUrl}/Data/${computationId}?submitId=${submitId}`;
            if(this.DEBUG_MODE){
                console.log(url);
            }
            return this.handleJsonToStringResponse(this.sendGET(url));
        }
    }
}