import { CommonOptions } from "../config/common";
import { getText } from "./Http";

export interface PDFTemplate {
    css: string,
    html: string,
    paramsPageHtml: string
}

export class Service {

    private static DEBUG_MODE = CommonOptions.DEBUG_MODE;

    private static baseUrl = "/html/templates";

    public static getPDFReportTemplateData(): Promise<PDFTemplate> {

        let urlHTML = `${this.baseUrl}/pdf-report.html`; //`${this.baseUrl}/pdf-report.html?version=${cacheToken}`;
        if (this.DEBUG_MODE) {
            console.log(urlHTML);
        }
        let urlParamsPageHTML = `${this.baseUrl}/pdf-report-params.html`; // `${this.baseUrl}/pdf-report-params.html?version=${cacheToken}`;
        if (this.DEBUG_MODE) {
            console.log(urlParamsPageHTML);
        }
        let urlCSS = `${this.baseUrl}/pdf-report.css`; //`${this.baseUrl}/pdf-report.css?version=${cacheToken}`;
        if (this.DEBUG_MODE) {
            console.log(urlCSS);
        }

        let html: string | null = null;
        let paramsPageHtml: string | null = null;
        let css: string | null = null;
        return new Promise<PDFTemplate>((res, rej) => {
            Promise.all([
                getText(urlHTML).then(htmlTemplate => {
                    html = htmlTemplate;
                }),
                getText(urlParamsPageHTML).then(htmlTemplate => {
                    paramsPageHtml = htmlTemplate;
                }),
                getText(urlCSS).then(cssTemplate => {
                    css = cssTemplate;
                }),
            ])
                .then(() => {
                    if (html !== null && css != null && paramsPageHtml !== null) {
                        res({
                            html, css, paramsPageHtml
                        });
                    }
                })
                .catch(err => rej(err))
        });
    }
}
