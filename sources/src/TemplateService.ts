namespace MoleOnlineWebUI.Service.Templates{

    declare function $(p:any,p1?:any): any;

    export interface PDFTemplate{
        css: string,
        html: string,
        paramsPageHtml: string
    }

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

        public static getPDFReportTemplateData():Promise<PDFTemplate>{
            let urlHTML = `${this.baseUrl}/pdf-report.html`;
            if(this.DEBUG_MODE){
                console.log(urlHTML);
            }
            let urlParamsPageHTML = `${this.baseUrl}/pdf-report-params.html`;
            if(this.DEBUG_MODE){
                console.log(urlParamsPageHTML);
            }
            let urlCSS = `${this.baseUrl}/pdf-report.css`;
            if(this.DEBUG_MODE){
                console.log(urlCSS);
            }

            let html:string|null = null;
            let paramsPageHtml:string|null = null;
            let css:string|null = null;
            return new Promise<PDFTemplate>((res,rej)=>{
                Promise.all([
                    this.sendGET(urlHTML).then(htmlTemplate=>{
                        html = htmlTemplate;
                    }),
                    this.sendGET(urlParamsPageHTML).then(htmlTemplate=>{
                        paramsPageHtml = htmlTemplate;
                    }),
                    this.sendGET(urlCSS).then(cssTemplate=>{
                        css = cssTemplate;
                    }),
                ])
                .then(()=>{
                    if(html!==null&&css!=null&&paramsPageHtml!==null){
                        res({
                            html,css,paramsPageHtml
                        });
                    }
                })
                .catch(err=>rej(err))
            });
        }
    }
}