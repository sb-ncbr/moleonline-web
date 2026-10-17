import { getText } from "./Http";

export interface PDFTemplate {
    css: string,
    html: string,
    paramsPageHtml: string
}

export class Service {

    private static baseUrl = "/html/templates";

    public static getPDFReportTemplateData(): Promise<PDFTemplate> {
        return Promise.all([
            getText(`${this.baseUrl}/pdf-report.html`),
            getText(`${this.baseUrl}/pdf-report-params.html`),
            getText(`${this.baseUrl}/pdf-report.css`),
        ]).then(([html, paramsPageHtml, css]) => ({ html, css, paramsPageHtml }));
    }
}
