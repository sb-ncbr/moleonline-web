var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Config;
(function (Config) {
    var Routing = (function () {
        function Routing() {
        }
        return Routing;
    }());
    Routing.ROUTING_OPTIONS = {
        "local": { defaultContextPath: "/online", defaultCompId: "compid", defaultSubmitId: "1", useParameterAsPid: true },
        "test": { defaultContextPath: "/online/<?pid>", defaultPid: "5an8", useLastPathPartAsPid: true },
        "prod": { defaultContextPath: "/online", defaultPid: "5an8", useLastPathPartAsPid: true },
    };
    Routing.ROUTING_MODE = "unknown";
    Config.Routing = Routing;
    var DataSources = (function () {
        function DataSources() {
        }
        return DataSources;
    }());
    DataSources.API_URL = {
        "local": "https://webchem.ncbr.muni.cz/API/MOLE",
        "test": "https://webchem.ncbr.muni.cz/API/MOLE",
        "prod": "https://api.mole.upol.cz",
    };
    DataSources.MODE = "unknown";
    Config.DataSources = DataSources;
    /*
    export let ROUTING_OPTIONS:any = {
        "local":{defaultContextPath: "/online", defaultCompId:"compid", defaultSubmitId:"1", useParameterAsPid:true},
        "test":{defaultContextPath: "/online/<?pid>", defaultPid:"5an8", useLastPathPartAsPid:true},
        "prod":{defaultContextPath: "/online", defaultPid:"5an8", useLastPathPartAsPid:true},
    };
    */
})(Config || (Config = {}));
var Config;
(function (Config) {
    Config.Routing.ROUTING_MODE = "prod";
    Config.DataSources.MODE = "prod";
})(Config || (Config = {}));
var SimpleRouter;
(function (SimpleRouter) {
    var URL = (function () {
        function URL(url, hasHost) {
            if (hasHost === void 0) { hasHost = true; }
            this.url = this.removeLastSlash(url);
            this.parts = this.removeTrailingSlashes(url).split("/");
            this.hasHost = hasHost;
            this.parameters = this.parseURLParameters(url);
            this.protocol = this.parseProtocol(url);
        }
        URL.prototype.removeProtocolPart = function (url) {
            var parts = this.url.split("//");
            return parts[parts.length - 1];
        };
        URL.prototype.removeLastSlash = function (url) {
            if (url[url.length - 1] === "/" || url[url.length - 1] === "\\") {
                return url.slice(0, url.length - 1);
            }
            return url;
        };
        URL.prototype.removeBeginingSlash = function (url) {
            if (url[0] === "/" || url[0] === "\\") {
                return url.slice(1);
            }
            return url;
        };
        URL.prototype.removeTrailingSlashes = function (url) {
            return this.removeLastSlash(this.removeBeginingSlash(this.removeProtocolPart(url)));
        };
        URL.prototype.substractPathFromStart = function (path) {
            var substractPathParts = this.removeBeginingSlash(path).split("/");
            var urlSubstracted = [];
            for (var idx = (this.hasHost ? 1 : 0), i = 0; idx < this.parts.length; idx++, i++) {
                if (i < substractPathParts.length && this.parts[idx] === substractPathParts[i]) {
                    continue;
                }
                urlSubstracted.push(this.parts[idx]);
            }
            return new URL(URL.constructPath(urlSubstracted), false);
        };
        URL.prototype.getHostname = function () {
            if (!this.hasHost) {
                return "";
            }
            return this.parts[0];
        };
        URL.prototype.getPart = function (index) {
            return this.parts[index];
        };
        URL.prototype.getLength = function () {
            return this.parts.length;
        };
        URL.constructPath = function (pathParts, useProtocol, protocol) {
            if (useProtocol === void 0) { useProtocol = false; }
            if (protocol === void 0) { protocol = "http"; }
            var url = "";
            for (var i = 0; i < pathParts.length; i++) {
                if (pathParts[i] === "") {
                    continue;
                }
                url += "/" + pathParts[i];
            }
            if (useProtocol) {
                url = protocol + ":/" + url;
            }
            return url;
        };
        URL.prototype.getLastPart = function () {
            return this.getPart(this.getLength() - 1);
        };
        URL.prototype.getParameterValue = function (name) {
            if (!this.parameters.has(name)) {
                return null;
            }
            var value = this.parameters.get(name);
            if (value === void 0) {
                return null;
            }
            return value;
        };
        URL.prototype.parseURLParameters = function (url) {
            var parts = url.split("?");
            var parameters = new Map();
            if (parts.length !== 2) {
                return parameters;
            }
            var params = parts[1].split("&");
            for (var i = 0; i < params.length; i++) {
                var tuple = params[i].split("=");
                var key = tuple[0];
                var value = "";
                if (tuple.length === 2) {
                    value = tuple[1];
                }
                parameters.set(key, value);
            }
            return parameters;
        };
        URL.prototype.parseProtocol = function (url) {
            var protocol = url.split(":");
            if (protocol.length > 1) {
                return protocol[0];
            }
            return "";
        };
        URL.prototype.removeParameters = function () {
            var path = this.url.split("?")[0];
            console.log("path: " + path);
            return new URL(path);
        };
        URL.prototype.getProtocol = function () {
            if (!this.hasHost) {
                return "";
            }
            return this.protocol;
        };
        URL.prototype.toString = function () {
            return URL.constructPath(this.parts, this.hasHost, this.getProtocol());
        };
        return URL;
    }());
    SimpleRouter.URL = URL;
    var Router = (function () {
        function Router(contextPath) {
            this.contextPath = contextPath;
        }
        /* Buggy !!
        getRelativePath(){
            return new SrURL(document.URL).substractPathFromStart(this.contextPath);
        }
        */
        Router.prototype.getAbsoluePath = function () {
            return new URL(document.URL);
        };
        Router.prototype.changeUrl = function (name, windowTitle, url) {
            var stateObj = { page: name };
            history.pushState(stateObj, windowTitle, url);
        };
        return Router;
    }());
    SimpleRouter.Router = Router;
    ;
    var GlobalRouter = (function () {
        function GlobalRouter() {
        }
        GlobalRouter.init = function (routingParameters) {
            this.defaultContextPath = routingParameters.defaultContextPath;
            this.defaultPid = routingParameters.defaultPid;
            this.useParameterAsPid = (routingParameters.useParameterAsPid === void 0) ? false : routingParameters.useParameterAsPid;
            this.useLastPathPartAsPid = (routingParameters.useLastPathPartAsPid === void 0) ? false : routingParameters.useLastPathPartAsPid;
            this.router = new Router(routingParameters.defaultContextPath);
            var url = this.router.getAbsoluePath();
            var pid = null;
            if (this.useParameterAsPid === true) {
                pid = url.getParameterValue("pid");
            }
            else if (this.useLastPathPartAsPid === true) {
                var lastPathPartAsParam = url.substractPathFromStart(this.defaultContextPath).getLastPart();
                pid = lastPathPartAsParam === "" ? null : lastPathPartAsParam;
            }
            this.currentPid = (pid !== null) ? pid : this.defaultPid;
            /*
            if(pid !== this.currentPid){
                if(this.useParameterAsPid === true){
                    this.router.changeUrl("detail",document.title,`${url}/?pid=${this.currentPid}`);
                }
                else if(this.useLastPathPartAsPid === true){
                    this.router.changeUrl("detail",document.title,`${url}/${this.currentPid}`);
                }
            }
            */
            this.isInitialized = true;
        };
        GlobalRouter.getCurrentPid = function () {
            if (!this.isInitialized) {
                throw new Error("GlobalRouter is not inititalised! Call init(..) function before use!");
            }
            return this.currentPid;
        };
        GlobalRouter.getCurrentPage = function () {
            if (!this.isInitialized) {
                throw new Error("GlobalRouter is not inititalised! Call init(..) function before use!");
            }
            var url = this.router.getAbsoluePath();
            url = url.removeParameters();
            return url.getLastPart();
        };
        GlobalRouter.redirect = function (url, relative) {
            var rel = false;
            if (relative !== void 0) {
                rel = relative;
            }
            var newUrl = url;
            if (relative) {
                var currentUrl = this.router.getAbsoluePath();
                newUrl = currentUrl.getProtocol() + "://" + currentUrl.getHostname() + this.defaultContextPath + url;
            }
            window.location.replace(newUrl);
        };
        GlobalRouter.getParametersByRegex = function (regex) {
            var url = this.router.getAbsoluePath();
            return regex.exec(url.toString());
        };
        return GlobalRouter;
    }());
    GlobalRouter.isInitialized = false;
    SimpleRouter.GlobalRouter = GlobalRouter;
})(SimpleRouter || (SimpleRouter = {}));
var MoleOnlineWebUI;
(function (MoleOnlineWebUI) {
    var Service;
    (function (Service) {
        var MoleAPI;
        (function (MoleAPI) {
            ;
            ;
            ;
            ;
            ;
            ;
            ;
            ;
            ;
            ;
            ;
            var ApiService = (function () {
                function ApiService() {
                }
                ApiService.sendPOST = function (url, formData) {
                    return this.handleResponse(fetch(url, {
                        method: "POST",
                        body: formData,
                    }), url);
                };
                ApiService.sendPOSTjson = function (url, formData) {
                    var headers = new Headers();
                    headers.append("Accept", "application/json");
                    headers.append("Content-Type", "application/json");
                    return this.handleResponse(fetch(url, {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify(formData),
                    }), url);
                };
                ApiService.sendGET = function (url) {
                    return this.handleResponse(fetch(url, {
                        method: "GET"
                    }), url);
                };
                ApiService.handleResponse = function (response, url) {
                    return new Promise(function (res, rej) {
                        response.then(function (rawResponse) {
                            if (!rawResponse.ok) {
                                console.log("GET: " + url + " " + rawResponse.status + ": " + rawResponse.statusText);
                                rej("GET: " + url + " " + rawResponse.status + ": " + rawResponse.statusText);
                                return;
                            }
                            res(rawResponse.json());
                        });
                    });
                };
                ApiService.prepareInitUrl = function (pdbid, usePores, assemblyId) {
                    var pores = (usePores) ? "Pores/" : "";
                    var opts = [];
                    var optional = "";
                    if (assemblyId !== void 0) {
                        optional = "?";
                    }
                    if (assemblyId !== void 0) {
                        opts.push("assemblyId=" + assemblyId);
                    }
                    for (var idx = 0; idx < opts.length; idx++) {
                        if (idx > 0) {
                            optional += "&";
                        }
                        optional += opts[idx];
                    }
                    return this.baseUrl + "/Init/" + pores + pdbid + optional;
                };
                ApiService.mockInitResponse = function () {
                    return new Promise(function (res, rej) {
                        res({
                            ComputationId: "DjcRaVhHHEqgrd1tI44zGQ",
                            SubmitId: 1,
                            Status: "Initializing",
                            ErrorMsg: ""
                        });
                    });
                };
                ApiService.initWithParams = function (pdbid, usePores, assemblyId) {
                    var url = this.prepareInitUrl(pdbid, usePores, assemblyId);
                    console.log(url);
                    //return this.mockInitResponse();
                    return this.sendGET(url);
                };
                ApiService.initWithFile = function (formData) {
                    var url = this.prepareInitUrl("", false);
                    console.log(url);
                    //return this.mockInitResponse();
                    return this.sendPOST(url, formData);
                };
                ApiService.getStatus = function (computationId, submitId) {
                    var optional = "";
                    if (submitId !== void 0) {
                        optional = "?submitId=" + submitId;
                    }
                    var url = this.baseUrl + "/Status/" + computationId + optional;
                    console.log(url);
                    return this.sendGET(url);
                };
                ApiService.getComputationInfoList = function (computationId) {
                    var url = this.baseUrl + "/Compinfo/" + computationId;
                    console.log(url);
                    return this.sendGET(url);
                };
                ApiService.handleJsonToStringResponse = function (response) {
                    return new Promise(function (res, rej) {
                        response.then(function (value) {
                            var data = value;
                            res(JSON.stringify(data));
                        })
                            .catch(function (error) {
                            rej(error);
                        });
                    });
                };
                ApiService.submitMoleJob = function (computationId, data) {
                    var url = this.baseUrl + "/Submit/Mole/" + computationId;
                    console.log(url);
                    return this.sendPOSTjson(url, data);
                };
                ApiService.submitPoresJob = function (computationId, data) {
                    var url = this.baseUrl + "/Submit/Pores/" + computationId + "?isBetaStructure=" + data.IsBetaBarel + "&inMembrane=" + data.InMembrane + "&chains=" + data.Chains;
                    console.log(url);
                    return this.sendGET(url);
                };
                ApiService.getProteinStructure = function (computationId, submitId) {
                    var url = this.baseUrl + "/Data/" + computationId + "?submitId=" + submitId + "&format=molecule";
                    //Mock!!!
                    //let url = 'https://api.mole.upol.cz/Data/OaUmDZj0Kk2ZBgJLLxVUA?submitId=1&format=molecule';
                    console.log(url);
                    //return this.sendGET(url);
                    return new Promise(function (res, rej) {
                        fetch(url, {
                            method: "GET"
                        })
                            .then(function (rawResponse) {
                            if (!rawResponse.ok) {
                                console.log("GET: " + url + " " + rawResponse.status + ": " + rawResponse.statusText);
                                rej("GET: " + url + " " + rawResponse.status + ": " + rawResponse.statusText);
                                return;
                            }
                            rawResponse.text().then(function (value) {
                                res(value);
                            })
                                .catch(function (error) {
                                rej(error);
                            });
                        })
                            .catch(function (error) { return rej(error); });
                    });
                };
                ApiService.getChannelsData = function (computationId, submitId) {
                    var url = this.baseUrl + "/Data/" + computationId + "?submitId=" + submitId;
                    //Mock!!!
                    //let url = 'https://api.mole.upol.cz/Data/OaUmDZj0Kk2ZBgJLLxVUA?submitId=1';
                    console.log(url);
                    return this.handleJsonToStringResponse(this.sendGET(url));
                };
                return ApiService;
            }());
            ApiService.baseUrl = Config.DataSources.API_URL[Config.DataSources.MODE];
            MoleAPI.ApiService = ApiService;
        })(MoleAPI = Service.MoleAPI || (Service.MoleAPI = {}));
    })(Service = MoleOnlineWebUI.Service || (MoleOnlineWebUI.Service = {}));
})(MoleOnlineWebUI || (MoleOnlineWebUI = {}));
var MoleOnlineWebUI;
(function (MoleOnlineWebUI) {
    var InitForm;
    (function (InitForm) {
        var UI;
        (function (UI) {
            var ApiService = MoleOnlineWebUI.Service.MoleAPI.ApiService;
            ;
            function render(target) {
                ReactDOM.render(React.createElement(App, null), target);
            }
            UI.render = render;
            var App = (function (_super) {
                __extends(App, _super);
                function App() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.state = {
                        app: _this,
                        useBiologicalUnit: false,
                        status: null
                    };
                    return _this;
                }
                App.prototype.componentDidMount = function () {
                };
                App.prototype.componentWillUnmount = function () {
                };
                App.prototype.handleFormSubmit = function (e) {
                    var _this = this;
                    e.preventDefault();
                    var form = e.target;
                    var pdbid = "";
                    var assembly;
                    var pores = false;
                    var file;
                    for (var idx = 0; idx < form.length; idx++) {
                        var item = form[idx];
                        var name_1 = item.getAttribute('name');
                        console.log(name_1);
                        console.log(item.value);
                        switch (name_1) {
                            case 'pdbid':
                                pdbid = item.value;
                                break;
                            case 'assembly':
                                assembly = (item.value !== "" && !item.disabled) ? item.value : void 0;
                                break;
                            case 'biological-unit':
                                pores = (item.value !== "") ? item.checked : false;
                                break;
                            case 'file':
                                file = (item.files !== null) ? item.files[0] : void 0;
                                break;
                        }
                    }
                    if (file === void 0) {
                        ApiService.initWithParams(pdbid, pores, assembly)
                            .then(function (response) {
                            _this.handleFormSubmitResponse(response);
                        })
                            .catch(function (reason) {
                            //TODO:...
                            console.log(reason);
                        });
                    }
                    else {
                        var data = new FormData();
                        data.append("file", file);
                        ApiService.initWithFile(data)
                            .then(function (response) {
                            _this.handleFormSubmitResponse(response);
                        })
                            .catch(function (reason) {
                            //TODO:...
                            console.log(reason);
                        });
                    }
                    return false;
                };
                App.prototype.handleFormSubmitResponse = function (response) {
                    if (response.Status === "FailedInitialization") {
                        throw new Error("API was unable to initialize computation with specified parameters. API responded with message: " + response.ErrorMsg);
                    }
                    this.computationId = response.ComputationId;
                    this.submitId = response.SubmitId;
                    if (response.Status === "Initialized") {
                        console.log("initialized");
                        //TODO: handle initialized
                        SimpleRouter.GlobalRouter.redirect(this.computationId + "/" + this.submitId, true);
                        return;
                    }
                    if (response.Status === "Initializing") {
                        console.log("Waiting for computation initialization...");
                        window.setTimeout(this.waitForComputationInitialization.bind(this), 100);
                        return;
                    }
                    throw new Error("Unexpected computation status recieved from API: " + response.Status);
                };
                App.prototype.waitForComputationInitialization = function () {
                    var _this = this;
                    ApiService.getStatus(this.computationId, this.submitId).then(function (response) {
                        console.log(response);
                        if (response.Status === "FailedInitialization") {
                            throw new Error("API was unable to initialize computation with specified parameters. API responded with message: " + response.ErrorMsg);
                        }
                        if (response.Status === "Initialized") {
                            console.log("initialized");
                            //TODO: handle initialized
                            SimpleRouter.GlobalRouter.redirect(_this.computationId + "/" + _this.submitId, true);
                            return;
                        }
                        if (response.Status === "Initializing") {
                            console.log("Waiting for computation initialization...");
                            window.setTimeout(_this.waitForComputationInitialization.bind(_this), 100);
                            return;
                        }
                        throw new Error("Unexpected computation status recieved from API: " + response.Status);
                    });
                };
                App.prototype.biologicalUnitChange = function (e) {
                    var el = e.target;
                    this.setState({ useBiologicalUnit: el.checked });
                };
                App.prototype.render = function () {
                    return (React.createElement("div", { className: "InitForm" },
                        React.createElement("form", { onSubmit: this.handleFormSubmit.bind(this), action: "/online/", method: "post", encType: "multipart/form-data" },
                            React.createElement("div", { className: "groupbox" },
                                React.createElement("table", { style: { width: "100%" } },
                                    React.createElement("tbody", null,
                                        React.createElement("tr", null,
                                            React.createElement("td", null,
                                                React.createElement("label", { htmlFor: "frm-jobSetup-setupForm-code" }, "PDB ID"),
                                                ":"),
                                            React.createElement("td", null,
                                                React.createElement("input", { type: "text", name: "pdbid", maxLength: 4, size: 10, className: "text", id: "frm-jobSetup-setupForm-code", defaultValue: "1tqn" }),
                                                React.createElement("div", { className: "hint" }, "PDB ID code as can be found on www.pdb.org, for example 1z10."))),
                                        React.createElement("tr", null,
                                            React.createElement("td", null,
                                                React.createElement("label", { htmlFor: "frm-jobSetup-setupForm-unit" }, "Assembly ID(optional)"),
                                                ":"),
                                            React.createElement("td", null,
                                                React.createElement("input", { disabled: this.state.useBiologicalUnit, type: "text", name: "assembly", maxLength: 2, size: 10, className: "text", id: "frm-jobSetup-setupForm-unit", defaultValue: "" }),
                                                React.createElement("div", { className: "hint" }, "no value - assymetric unit (default)"))),
                                        React.createElement("tr", null,
                                            React.createElement("td", null,
                                                React.createElement("label", { htmlFor: "frm-jobSetup-setupForm-chains" }, "Use biological unit"),
                                                ":"),
                                            React.createElement("td", null,
                                                React.createElement("input", { type: "checkbox", onChange: this.biologicalUnitChange.bind(this), name: "biological-unit", className: "checkbox", defaultChecked: false }),
                                                React.createElement("div", { className: "hint" }, "use biological unit"))),
                                        React.createElement("tr", null,
                                            React.createElement("td", { colSpan: 2 },
                                                React.createElement("hr", null))),
                                        React.createElement("tr", null,
                                            React.createElement("td", null,
                                                React.createElement("label", { htmlFor: "frm-jobSetup-setupForm-file" }, "Or upload your own file"),
                                                ":"),
                                            React.createElement("td", null,
                                                React.createElement("input", { type: "file", name: "file", className: "text", id: "frm-jobSetup-setupForm-file" }),
                                                React.createElement("div", { className: "hint" },
                                                    "Plain text PDB files (UTF-8 encoding), ZIP and GZIP archives are supported, maximal file size is 50MB.",
                                                    React.createElement("br", null),
                                                    "E.g. cleaned PDB with only one chain and without unnecessary HETATMs.")))))),
                            React.createElement("div", { className: "buttons" },
                                React.createElement("input", { type: "submit", name: "next", className: "button", id: "frm-jobSetup-setupForm-next", value: "Next" })),
                            React.createElement("div", null,
                                React.createElement("input", { type: "hidden", name: "do", value: "jobSetup-setupForm-submit" })))));
                };
                return App;
            }(React.Component));
            UI.App = App;
        })(UI = InitForm.UI || (InitForm.UI = {}));
    })(InitForm = MoleOnlineWebUI.InitForm || (MoleOnlineWebUI.InitForm = {}));
})(MoleOnlineWebUI || (MoleOnlineWebUI = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
(function (LiteMol) {
    var Example;
    (function (Example) {
        var Channels;
        (function (Channels) {
            // all commands and events can be found in Bootstrap/Event folder.
            // easy to follow the types and parameters in VSCode.
            // you can subsribe to any command or event using <Event/Command>.getStream(plugin.context).subscribe(e => ....)
            var MoleUI = MoleOnlineWebUI;
            (function () {
                SimpleRouter.GlobalRouter.init(Config.Routing.ROUTING_OPTIONS[Config.Routing.ROUTING_MODE]);
                console.log(Config.Routing.ROUTING_MODE);
                console.log(SimpleRouter.GlobalRouter.getCurrentPage());
                MoleUI.InitForm.UI.render(document.getElementById("init-form"));
            })();
        })(Channels = Example.Channels || (Example.Channels = {}));
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
