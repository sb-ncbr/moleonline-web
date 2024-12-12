export class URL {
    private url: string;
    private parts: string[];
    private hasHost: boolean;
    private parameters: Map<string, string>;
    private protocol: string;

    constructor(url: string, hasHost: boolean = true) {
        this.url = this.removeLastSlash(url);
        this.parts = this.removeTrailingSlashes(url).split("/");
        this.hasHost = hasHost;
        this.parameters = this.parseURLParameters(url);
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

    substractPathFromStart(path: string) {
        let substractPathParts = this.removeBeginingSlash(path).split("/");

        let urlSubstracted = [];
        for (let idx = (this.hasHost ? 1 : 0), i = 0; idx < this.parts.length; idx++, i++) {

            if (i < substractPathParts.length && this.parts[idx] === substractPathParts[i]) {
                continue;
            }

            urlSubstracted.push(this.parts[idx]);
        }

        return new URL(URL.constructPath(urlSubstracted), false);
    }

    getHostname() {
        if (!this.hasHost) {
            return "";
        }
        return this.parts[0];
    }

    getPart(index: number) {
        return this.parts[index];
    }

    getLength() {
        return this.parts.length;
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

    getLastPart() {
        return this.getPart(this.getLength() - 1);
    }

    getParameterValue(name: string) {
        if (!this.parameters.has(name)) {
            return null;
        }

        let value = this.parameters.get(name);
        if (value === void 0) {
            return null;
        }

        return value;
    }

    private parseURLParameters(url: string) {
        let parts = url.split("?");

        let parameters = new Map<string, string>();

        if (parts.length !== 2) {
            return parameters;
        }

        let params = parts[1].split("&");
        for (let i = 0; i < params.length; i++) {
            let tuple = params[i].split("=");
            let key = tuple[0];
            let value = "";
            if (tuple.length === 2) {
                value = tuple[1];
            }
            parameters.set(key, value);
        }

        return parameters;
    }

    private parseProtocol(url: string) {
        let protocol = url.split(":");
        if (protocol.length > 1) {
            return protocol[0];
        }

        return "";
    }

    removeParameters() {
        let path = this.url.split("?")[0];
        return new URL(path);
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
    private contextPath: string;

    constructor(contextPath: string) {
        this.contextPath = contextPath;
    }

    getAbsoluePath() {
        return new URL(document.URL);
    }

    changeUrl(name: string, windowTitle: string, url: string) {
        let stateObj = { page: name };
        history.pushState(stateObj, windowTitle, url);
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
    private static defaultPid: string;
    private static useParameterAsPid: boolean;
    private static useLastPathPartAsPid: boolean;
    private static currentPid: string;

    private static router: Router;

    private static isInitialized: boolean = false;

    public static init(routingParameters: RoutingParameters) {
        this.defaultContextPath = routingParameters.defaultContextPath;
        this.defaultPid = routingParameters.defaultPid;
        this.useParameterAsPid = (routingParameters.useParameterAsPid === void 0) ? false : routingParameters.useParameterAsPid;
        this.useLastPathPartAsPid = (routingParameters.useLastPathPartAsPid === void 0) ? false : routingParameters.useLastPathPartAsPid;

        this.router = new Router(routingParameters.defaultContextPath);

        let url = this.router.getAbsoluePath();

        let pid = null;
        if (this.useParameterAsPid === true) {
            pid = url.getParameterValue("pid");
        }
        else if (this.useLastPathPartAsPid === true) {
            let lastPathPartAsParam = url.substractPathFromStart(this.defaultContextPath).getLastPart();
            pid = lastPathPartAsParam === "" ? null : lastPathPartAsParam;
        }

        this.currentPid = (pid !== null) ? pid : this.defaultPid;

        this.isInitialized = true;
    }

    public static getCurrentPid() {
        if (!this.isInitialized) {
            throw new Error("GlobalRouter is not inititalised! Call init(..) function before use!");
        }

        return this.currentPid;
    }

    public static getCurrentPage() {
        if (!this.isInitialized) {
            throw new Error("GlobalRouter is not inititalised! Call init(..) function before use!");
        }

        let url = this.router.getAbsoluePath();
        url = url.removeParameters();

        return url.getLastPart();
    }

    public static redirect(url: string, relative?: boolean) {
        let newUrl = this.prepareUrlForRedirect(url, relative);
        window.location.replace(newUrl);
    }

    private static prepareUrlForRedirect(url: string, relative?: boolean) {
        let rel = false;
        if (relative !== void 0) {
            rel = relative;
        }
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
