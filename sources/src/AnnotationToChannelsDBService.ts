namespace MoleOnlineWebUI.Service.AnnotationToChannelsDBService{

    export interface ChannelsDBResponse{
        Status: "OK"|"Error",
        Msg: string
    }

    export interface AnnotationData{
        CompId:string,
        SubmitId:number,
        Email: string,
        Message: string,
        TunnelAnnotations: TunnelAnnotation[],
        ResidueAnnotations: ResidueAnnotation[]
    }

    export type ReferenceType = "DOI"|"Pubmed"|"";

    export interface TunnelAnnotation{
        Id: string,
        Name: string,
        Description: string,
        Reference: string,
        ReferenceType: ReferenceType
    }

    export interface ResidueAnnotation{
        Id: string,
        Chain: string,
        Text: string,
        Reference: string,
        ReferenceType: ReferenceType
    }    

    export class ApiService{
        private static DEBUG_MODE = Config.CommonOptions.DEBUG_MODE;
        
        private static baseUrl = Config.DataSources.ANNOTATION_API_URL[Config.DataSources.ANNOTATION_API_MODE];
        
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

        public static sendAnnotation(data:AnnotationData):Promise<ChannelsDBResponse>{
            let url = `${this.baseUrl}`;
            if(this.DEBUG_MODE){
                console.log(url);
            }
            return this.sendPOSTjson(url,data);
        }
    }
}