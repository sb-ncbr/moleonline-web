export class URL {
    private url: string;
    private parts: string[];
    private hasHost: boolean;
    private protocol: string;

    constructor(url: string, hasHost: boolean = true) {
        this.url = this.removeLastSlash(url);
        this.parts = this.removeTrailingSlashes(url).split("/");
        this.hasHost = hasHost;
        this.protocol = this.parseProtocol(url);
    }

    private removeProtocolPart(url: string) {
        let parts = this.url.split("//");
        return parts[parts.length - 1];
    }

    private removeLastSlash(url: string) {
        if (url[url.length - 1] === "/" || url[url.length - 1] === "\\") {
            return url.slice(0, url.length - 1);
        }

        return url;
    }

    private removeBeginingSlash(url: string) {
        if (url[0] === "/" || url[0] === "\\") {
            return url.slice(1);
        }

        return url;
    }

    private removeTrailingSlashes(url: string) {
        return this.removeLastSlash(this.removeBeginingSlash(this.removeProtocolPart(url)));
    }

    getHostname() {
        if (!this.hasHost) {
            return "";
        }
        return this.parts[0];
    }

    public static constructPath(pathParts: string[], useProtocol: boolean = false, protocol: string = "http"): string {
        let url = "";
        for (let i = 0; i < pathParts.length; i++) {
            if (pathParts[i] === "") {
                continue;
            }
            url += `/${pathParts[i]}`;
        }
        if (useProtocol) {
            url = `${protocol}:/${url}`;
        }
        return url;
    }

    private parseProtocol(url: string) {
        let protocol = url.split(":");
        if (protocol.length > 1) {
            return protocol[0];
        }

        return "";
    }

    getProtocol() {
        if (!this.hasHost) {
            return "";
        }

        return this.protocol;
    }

    toString(): string {
        return URL.constructPath(this.parts, this.hasHost, this.getProtocol());
    }
}

export class Router {

    constructor(contextPath: string) {
    }

    getAbsoluePath() {
        return new URL(document.URL);
    }

}

export interface RoutingParameters {
    defaultContextPath: string,
    defaultPid: string,
    useParameterAsPid?: boolean,
    useLastPathPartAsPid?: boolean
};

export class GlobalRouter {
    private static defaultContextPath: string;

    private static router: Router;


    public static init(routingParameters: RoutingParameters) {
        this.defaultContextPath = routingParameters.defaultContextPath;
        this.router = new Router(routingParameters.defaultContextPath);
    }

    public static redirect(url: string, relative?: boolean) {
        let newUrl = this.prepareUrlForRedirect(url, relative);
        window.location.replace(newUrl);
    }

    private static prepareUrlForRedirect(url: string, relative?: boolean) {
        let newUrl = url;
        if (relative) {
            let currentUrl = this.router.getAbsoluePath();
            newUrl = `${currentUrl.getProtocol()}://${currentUrl.getHostname()}${this.defaultContextPath}${url}`;
        }

        return newUrl;
    }

    public static fakeRedirect(url: string, relative?: boolean) {
        let newUrl = this.prepareUrlForRedirect(url, relative);
        if (window.history.pushState) {
            let title = document.title;
            window.history.pushState(null, title, newUrl);
        }
        else {
            window.location.replace(newUrl);
        }
    }

    public static getParametersByRegex(regex: RegExp) {
        let url = this.router.getAbsoluePath();
        return regex.exec(url.toString());
    }

}
