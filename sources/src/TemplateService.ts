namespace MoleOnlineWebUI.Service.Templates{

    export class Service{

        private static DEBUG_MODE = Config.CommonOptions.DEBUG_MODE;
        
        private static baseUrl = "/online/templates";
        
        private static sendGET(url:string):Promise<any>{
            if(this.DEBUG_MODE)
                console.time(`sendGET '${url}'`);     
                return this.handleResponse(fetch(url, {
                    method: "GET"
                }), url).then((val)=>{
                    if(this.DEBUG_MODE)
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
                        res(rawResponse.text());
                    }
                })
                .catch(err=>{
                    rej(err);
                });
            });
        }

        public static getPDFReportTemplateData():Promise<string>{
            let url = `${this.baseUrl}/pdf-report.html`;
            if(this.DEBUG_MODE){
                console.log(url);
            }
            return this.sendGET(url);
        }
    }
}