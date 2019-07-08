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
        "local": { defaultContextPath: "/online" },
        "test": { defaultContextPath: "/online" },
        "prod": { defaultContextPath: "/online" },
    };
    Routing.ROUTING_MODE = "unknown";
    Config.Routing = Routing;
    var DataSources = (function () {
        function DataSources() {
        }
        return DataSources;
    }());
    DataSources.API_URL = {
        "webchem": "https://webchem.ncbr.muni.cz/API/MOLE",
        "upol": "https://api.mole.upol.cz",
    };
    DataSources.PATTERN_QUERY_API_URL = {
        "webchem": "https://webchem.ncbr.muni.cz/Platform/PatternQuery/ValidateQuery",
    };
    DataSources.ANNOTATION_API_URL = {
        "webchemdev": "https://webchemdev.ncbr.muni.cz/API/ChannelsDB",
        "webchem": "https://webchem.ncbr.muni.cz/API/ChannelsDB"
    };
    DataSources.MODE = "unknown";
    DataSources.PATTERN_QUERY_MODE = "unknown";
    DataSources.ANNOTATION_API_MODE = "unknown";
    Config.DataSources = DataSources;
    var CommonOptions = (function () {
        function CommonOptions() {
        }
        return CommonOptions;
    }());
    CommonOptions.DEBUG_MODE = false;
    CommonOptions.CHANNELSDB_LINK_DETAIL_URL = "https://webchemdev.ncbr.muni.cz/ChannelsDB/detail";
    Config.CommonOptions = CommonOptions;
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
    Config.Routing.ROUTING_MODE = "local";
    Config.DataSources.MODE = "upol";
    Config.DataSources.PATTERN_QUERY_MODE = "webchem";
    Config.DataSources.ANNOTATION_API_MODE = "webchem";
    Config.CommonOptions.DEBUG_MODE = false;
})(Config || (Config = {}));
var MoleOnlineWebUI;
(function (MoleOnlineWebUI) {
    var Service;
    (function (Service) {
        var Fetching = (function () {
            function Fetching() {
            }
            Fetching.resolveImpl = function () {
                //fetch() is currently overriden by polyfill - should be working even for IE 11 and Safari
                if (fetch !== void 0) {
                    console.log("Fetching: Using Fetching API impl.");
                    return new FetchingFetchImpl();
                }
                console.log("Fetching: Using default impl.");
                //NOTICE: most cross platform impl should be set as default in here
                return new FetchingJQueryImpl();
            };
            Fetching.get = function () {
                if (this.impl === null) {
                    this.impl = this.resolveImpl();
                }
                return this.impl;
            };
            return Fetching;
        }());
        Fetching.impl = null;
        Service.Fetching = Fetching;
        var FetchingFetchImpl = (function () {
            function FetchingFetchImpl() {
            }
            FetchingFetchImpl.prototype.fetch = function (url, params) {
                if (params.method === "GET") {
                    var getParams = params;
                    return fetch(url, {
                        method: "GET"
                    });
                }
                else {
                    var postParams = params;
                    return fetch(url, {
                        method: "POST",
                        headers: postParams.headers,
                        body: postParams.body
                    });
                }
            };
            return FetchingFetchImpl;
        }());
        Service.FetchingFetchImpl = FetchingFetchImpl;
        var FetchingJQueryImpl = (function () {
            function FetchingJQueryImpl() {
            }
            FetchingJQueryImpl.dataToResponse = function (data, url) {
                return {
                    ok: true,
                    arrayBuffer: function () {
                        throw new Error("NotImplemented!");
                    },
                    body: null,
                    headers: new Headers(),
                    status: 200,
                    blob: function () { return Promise.reject("NotImplemented!"); },
                    bodyUsed: false,
                    formData: function () {
                        return Promise.reject("NotImplemented!");
                    },
                    type: "cors",
                    statusText: "",
                    url: url,
                    redirected: false,
                    clone: function () { throw new Error("NotImplemented!"); },
                    json: function () { return Promise.resolve(data); },
                    text: function () { return Promise.resolve(String(data)); },
                };
            };
            FetchingJQueryImpl.prototype.fetch = function (url, params) {
                if (params.method === "GET") {
                    return new Promise(function (res, rej) {
                        $.get(url, function () { })
                            .done(function (data) {
                            res(FetchingJQueryImpl.dataToResponse(data, url));
                        })
                            .fail(function (err) {
                            rej(err);
                        });
                    });
                }
                else {
                    var postParams_1 = params;
                    return new Promise(function (res, rej) {
                        var headers = {};
                        if (postParams_1.headers !== void 0) {
                            headers = {};
                            postParams_1.headers.forEach(function (val, key) {
                                if (postParams_1.headers === void 0) {
                                    return;
                                }
                                if (val !== null) {
                                    headers[key] = val;
                                }
                            });
                        }
                        $.ajax({
                            url: url,
                            type: 'post',
                            data: JSON.parse(JSON.stringify(postParams_1.body)),
                            dataType: "json",
                            headers: headers,
                            success: function (data) { }
                        })
                            .done(function (data) {
                            res(FetchingJQueryImpl.dataToResponse(data, url));
                        })
                            .fail(function (err) {
                            rej(err);
                        });
                    });
                }
            };
            return FetchingJQueryImpl;
        }());
        Service.FetchingJQueryImpl = FetchingJQueryImpl;
    })(Service = MoleOnlineWebUI.Service || (MoleOnlineWebUI.Service = {}));
})(MoleOnlineWebUI || (MoleOnlineWebUI = {}));
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
            var newUrl = this.prepareUrlForRedirect(url, relative);
            window.location.replace(newUrl);
        };
        GlobalRouter.prepareUrlForRedirect = function (url, relative) {
            var rel = false;
            if (relative !== void 0) {
                rel = relative;
            }
            var newUrl = url;
            if (relative) {
                var currentUrl = this.router.getAbsoluePath();
                newUrl = currentUrl.getProtocol() + "://" + currentUrl.getHostname() + this.defaultContextPath + url;
            }
            return newUrl;
        };
        GlobalRouter.fakeRedirect = function (url, relative) {
            var newUrl = this.prepareUrlForRedirect(url, relative);
            if (window.history.pushState) {
                var title = document.title;
                window.history.pushState(null, title, newUrl);
            }
            else {
                window.location.replace(newUrl);
            }
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
            var Fetching = MoleOnlineWebUI.Service.Fetching;
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
            ;
            ;
            ;
            ;
            var ApiService = (function () {
                function ApiService() {
                }
                ApiService.sendPOST = function (url, formData) {
                    var fetching = Fetching.get();
                    return this.handleResponse(fetching.fetch(url, {
                        method: "POST",
                        body: formData,
                    }), url);
                };
                ApiService.sendPOSTjson = function (url, formData) {
                    var fetching = Fetching.get();
                    var headers = new Headers();
                    headers.append("Accept", "application/json");
                    headers.append("Content-Type", "application/json");
                    return this.handleResponse(fetching.fetch(url, {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify(formData),
                    }), url);
                };
                ApiService.sendGET = function (url) {
                    var fetching = Fetching.get();
                    if (Config.CommonOptions.DEBUG_MODE)
                        console.time("sendGET '" + url + "'");
                    return this.handleResponse(fetching.fetch(url, {
                        method: "GET"
                    }), url).then(function (val) {
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.timeEnd("sendGET '" + url + "'");
                        return val;
                    });
                };
                ApiService.handleResponse = function (response, url) {
                    var _this = this;
                    return new Promise(function (res, rej) {
                        response.then(function (rawResponse) {
                            if (!rawResponse.ok) {
                                if (_this.DEBUG_MODE) {
                                    console.log("GET: " + url + " " + rawResponse.status + ": " + rawResponse.statusText);
                                }
                                rej("GET: " + url + " " + rawResponse.status + ": " + rawResponse.statusText);
                            }
                            else {
                                res(rawResponse.json());
                            }
                        })
                            .catch(function (err) {
                            rej(err);
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
                ApiService.initWithParams = function (pdbid, usePores, assemblyId) {
                    var url = this.prepareInitUrl(pdbid, usePores, assemblyId);
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url);
                };
                ApiService.initWithFile = function (formData) {
                    var url = this.prepareInitUrl("", false);
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendPOST(url, formData);
                };
                ApiService.getStatus = function (computationId, submitId) {
                    var optional = "";
                    if (submitId !== void 0) {
                        optional = "?submitId=" + submitId;
                    }
                    var url = this.baseUrl + "/Status/" + computationId + optional;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url);
                };
                ApiService.getComputationInfoList = function (computationId) {
                    var url = this.baseUrl + "/Compinfo/" + computationId;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url).then(function (val) {
                        if (val.Status === "Error") {
                            return null;
                        }
                        else {
                            return val;
                        }
                    });
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
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendPOSTjson(url, data);
                };
                ApiService.submitPoresJob = function (computationId, data) {
                    var url = this.baseUrl + "/Submit/Pores/" + computationId;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    var jsonRequestData = {
                        IsBetaStructure: data.IsBetaBarel,
                        InMembrane: data.InMembrane,
                        Chains: (data.Chains === null) ? "" : data.Chains,
                        InteriorThreshold: (data.InteriorThreshold === void 0 || data.InteriorThreshold === null) ? null : data.InteriorThreshold,
                        ProbeRadius: (data.ProbeRadius === void 0 || data.ProbeRadius === null) ? null : data.ProbeRadius
                    };
                    return this.sendPOSTjson(url, jsonRequestData);
                };
                ApiService.getFilenameFromResponseHeader = function (r) {
                    var contentDisposition = r.headers.get("Content-Disposition");
                    //https://regex101.com/r/hJ7tS6/1
                    var regExp = RegExp(/filename[^;\n=]*=((['"]).*?\2|[^;\n]*)/);
                    var filename = null;
                    if (contentDisposition !== null) {
                        var result = regExp.exec(contentDisposition);
                        if (result !== null) {
                            if (result.length >= 2) {
                                filename = result[1];
                            }
                        }
                    }
                    return filename;
                };
                ApiService.getProteinStructure = function (computationId, submitId) {
                    var _this = this;
                    var fetching = Fetching.get();
                    var url = this.baseUrl + "/Data/" + computationId + "?submitId=" + submitId + "&format=molecule";
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return new Promise(function (res, rej) {
                        if (_this.DEBUG_MODE)
                            console.time('protein-raw');
                        fetching.fetch(url, {
                            method: "GET",
                        })
                            .then(function (rawResponse) {
                            var filename = _this.getFilenameFromResponseHeader(rawResponse);
                            if (_this.DEBUG_MODE)
                                console.log(filename);
                            if (_this.DEBUG_MODE)
                                console.timeEnd('protein-raw');
                            if (!rawResponse.ok) {
                                if (_this.DEBUG_MODE) {
                                    console.log("GET: " + url + " " + rawResponse.status + ": " + rawResponse.statusText);
                                }
                                rej("GET: " + url + " " + rawResponse.status + ": " + rawResponse.statusText);
                                return;
                            }
                            // Decompression from gz needed
                            if (rawResponse.body !== null && filename !== null && filename.toLowerCase().indexOf(".gz") >= 0) {
                                var reader_1 = rawResponse.body.getReader();
                                var binData_1 = [];
                                reader_1.read().then(function handleStreamResponse(value) {
                                    binData_1.push(value.value);
                                    if (value.done) {
                                        var bytes = binData_1.reduce(function (p, cv, ci, a) {
                                            if (cv === void 0) {
                                                cv = new Uint8Array(0);
                                            }
                                            var newVal = new Uint8Array(p.length + cv.length);
                                            newVal.set(p);
                                            newVal.set(cv, p.length);
                                            return newVal;
                                        }, new Uint8Array(0));
                                        var stringData = pako.inflate(bytes, { to: 'string' });
                                        res({
                                            data: stringData,
                                            filename: filename
                                        });
                                        return;
                                    }
                                    reader_1.read().then(handleStreamResponse)
                                        .catch(function (error) {
                                        rej(error);
                                    });
                                });
                            }
                            else {
                                rawResponse.text().then(function (value) {
                                    res({
                                        data: value,
                                        filename: filename
                                    });
                                })
                                    .catch(function (error) {
                                    rej(error);
                                });
                            }
                        })
                            .catch(function (error) { return rej(error); });
                    });
                };
                ApiService.getChannelsData = function (computationId, submitId) {
                    var _this = this;
                    var url = this.baseUrl + "/Data/" + computationId + "?submitId=" + submitId;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    if (this.DEBUG_MODE)
                        console.time("getChannelsData");
                    return this.handleJsonToStringResponse(this.sendGET(url)).then(function (s) {
                        if (_this.DEBUG_MODE)
                            console.timeEnd("getChannelsData");
                        return s;
                    });
                };
                ApiService.getMembraneData = function (computationId) {
                    var _this = this;
                    var url = this.baseUrl + "/Data/" + computationId + "?format=membrane";
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    if (this.DEBUG_MODE)
                        console.time("getMembraneData");
                    return this.sendGET(url).then(function (s) {
                        if (_this.DEBUG_MODE)
                            console.timeEnd("getMembraneData");
                        return s;
                    });
                };
                ApiService.killRunningJob = function (computationId) {
                    var url = this.baseUrl + "/Kill/" + computationId;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url);
                };
                ApiService.deleteProject = function (computationId) {
                    var url = this.baseUrl + "/Delete/" + computationId;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url);
                };
                ApiService.getCSAResidues = function (computationId) {
                    var url = this.baseUrl + "/CSA/" + computationId;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url);
                };
                ApiService.getCofactors = function () {
                    var _this = this;
                    //let url = `${this.baseUrl}/inputs/cofactors.json`;
                    var url = "/online/cofactors.json";
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    if (this.DEBUG_MODE)
                        console.time("getCofactors");
                    return this.sendGET(url).then(function (s) {
                        var rv = new Map();
                        for (var key in s) {
                            if (!s.hasOwnProperty(key)) {
                                continue;
                            }
                            rv.set(key, s[key]);
                        }
                        if (_this.DEBUG_MODE)
                            console.timeEnd("getCofactors");
                        return rv;
                    });
                };
                ApiService.submitFeedback = function (params) {
                    var url = this.baseUrl + "/__Mail";
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendPOSTjson(url, params).then(function (val) {
                        return val;
                    });
                };
                ApiService.getVersions = function () {
                    var _this = this;
                    var url = this.baseUrl + "/Version";
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    if (this.DEBUG_MODE)
                        console.time("getVersions");
                    return this.sendGET(url).then(function (s) {
                        if (_this.DEBUG_MODE)
                            console.timeEnd("getVersions");
                        return s;
                    });
                };
                return ApiService;
            }());
            ApiService.DEBUG_MODE = Config.CommonOptions.DEBUG_MODE;
            ApiService.baseUrl = Config.DataSources.API_URL[Config.DataSources.MODE];
            MoleAPI.ApiService = ApiService;
        })(MoleAPI = Service.MoleAPI || (Service.MoleAPI = {}));
    })(Service = MoleOnlineWebUI.Service || (MoleOnlineWebUI.Service = {}));
})(MoleOnlineWebUI || (MoleOnlineWebUI = {}));
var MoleOnlineWebUI;
(function (MoleOnlineWebUI) {
    var Service;
    (function (Service) {
        var PatternQueryAPI;
        (function (PatternQueryAPI) {
            var Fetching = MoleOnlineWebUI.Service.Fetching;
            var ApiService = (function () {
                function ApiService() {
                }
                ApiService.sendGET = function (url) {
                    var fetching = Fetching.get();
                    return this.handleResponse(fetching.fetch(url, {
                        method: "GET",
                    }), url);
                };
                ApiService.handleResponse = function (response, url) {
                    var _this = this;
                    return new Promise(function (res, rej) {
                        response.then(function (rawResponse) {
                            if (!rawResponse.ok) {
                                if (_this.DEBUG_MODE) {
                                    console.log("GET: " + url + " " + rawResponse.status + ": " + rawResponse.statusText);
                                }
                                rej("GET: " + url + " " + rawResponse.status + ": " + rawResponse.statusText);
                                return;
                            }
                            res(rawResponse.json());
                        })
                            .catch(function (err) {
                            rej(err);
                        });
                    });
                };
                ApiService.getValidationResult = function (query) {
                    var url = this.baseUrl + "/?query=" + query;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url);
                };
                return ApiService;
            }());
            ApiService.DEBUG_MODE = Config.CommonOptions.DEBUG_MODE;
            ApiService.baseUrl = Config.DataSources.PATTERN_QUERY_API_URL[Config.DataSources.PATTERN_QUERY_MODE];
            PatternQueryAPI.ApiService = ApiService;
        })(PatternQueryAPI = Service.PatternQueryAPI || (Service.PatternQueryAPI = {}));
    })(Service = MoleOnlineWebUI.Service || (MoleOnlineWebUI.Service = {}));
})(MoleOnlineWebUI || (MoleOnlineWebUI = {}));
var DataInterface;
(function (DataInterface) {
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
    ;
    function convertLayersToLayerData(layersObject) {
        var layersData = [];
        var layerCount = layersObject.LayersInfo.length;
        for (var i = 0; i < layerCount; i++) {
            var properties = {
                Charge: layersObject.LayersInfo[i].Properties.Charge,
                NumPositives: layersObject.LayersInfo[i].Properties.NumPositives,
                NumNegatives: layersObject.LayersInfo[i].Properties.NumNegatives,
                Hydrophobicity: layersObject.LayerWeightedProperties.Hydrophobicity,
                Hydropathy: layersObject.LayerWeightedProperties.Hydropathy,
                Polarity: layersObject.LayerWeightedProperties.Polarity,
                Mutability: layersObject.LayerWeightedProperties.Mutability
            };
            layersData.push({
                StartDistance: layersObject.LayersInfo[i].LayerGeometry.StartDistance,
                EndDistance: layersObject.LayersInfo[i].LayerGeometry.EndDistance,
                MinRadius: layersObject.LayersInfo[i].LayerGeometry.MinRadius,
                MinBRadius: layersObject.LayersInfo[i].LayerGeometry.MinBRadius,
                MinFreeRadius: layersObject.LayersInfo[i].LayerGeometry.MinFreeRadius,
                Properties: layersObject.LayersInfo[i].Properties,
                Residues: layersObject.LayersInfo[i].Residues
            });
        }
        return layersData;
    }
    DataInterface.convertLayersToLayerData = convertLayersToLayerData;
    var Annotations;
    (function (Annotations) {
        ;
        ;
        ;
    })(Annotations = DataInterface.Annotations || (DataInterface.Annotations = {}));
    ;
})(DataInterface || (DataInterface = {}));
var MoleOnlineWebUI;
(function (MoleOnlineWebUI) {
    var Bridge;
    (function (Bridge) {
        var Instances = (function () {
            function Instances() {
            }
            Instances.setPlugin = function (plugin) {
                this.plugin = plugin;
            };
            Instances.getPlugin = function () {
                return this.plugin;
            };
            Instances.setLayersVizualizer = function (instance) {
                this.layerVizualizer = instance;
            };
            Instances.getLayersVizualizer = function () {
                return this.layerVizualizer;
            };
            return Instances;
        }());
        Bridge.Instances = Instances;
        ;
        ;
        ;
        ;
        var HandlerTypes;
        (function (HandlerTypes) {
            HandlerTypes.NewSubmitType = "NEW-SUBMIT";
            HandlerTypes.ChangeSubmitIdType = "CHANGE-SUBMIT-ID";
            HandlerTypes.ChannelSelectType = "CHANNEL-SELECT";
            HandlerTypes.ChangeHasKillableType = "CHANGE-HAS-KILLABLE";
            HandlerTypes.NotifyMessageType = "NOTIFY-MESSAGE";
            HandlerTypes.ChannelDataLoadedType = "CHANNEL-DATA-LOADED";
            HandlerTypes.ProteinDataLoadedType = "PROTEIN-DATA-LOADED";
            HandlerTypes.ToggleLoadingScreenType = "TOGGLE-LOADING-SCREEN";
            HandlerTypes.RunPDFReportType = "RUN-PDF-REPORT";
            HandlerTypes.CopyParametersType = "COPY-PARAMETERS";
            HandlerTypes.OnReSubmitType = "ON-RESUBMIT";
            HandlerTypes.OnSequneceViewerToggleType = "ON-SEQ-VIEWER-TOGGLE";
            HandlerTypes.OnMembraneDataReadyType = "ON-MEMBRANE-DATA-READY";
        })(HandlerTypes || (HandlerTypes = {}));
        ;
        var Events = (function () {
            function Events() {
            }
            Events.subscribeChannelSelect = function (handler) {
                var hndlrs = this.handlers.get(HandlerTypes.ChannelSelectType);
                if (hndlrs === void 0) {
                    hndlrs = [];
                }
                hndlrs.push(handler);
                this.handlers.set(HandlerTypes.ChannelSelectType, hndlrs);
            };
            Events.invokeChannelSelect = function (channelId) {
                var hndlrs = this.handlers.get(HandlerTypes.ChannelSelectType);
                if (hndlrs === void 0) {
                    return;
                }
                for (var _i = 0, hndlrs_1 = hndlrs; _i < hndlrs_1.length; _i++) {
                    var h = hndlrs_1[_i];
                    h(channelId);
                }
            };
            Events.subscribeNewSubmit = function (h) {
                var list = this.handlers.get(HandlerTypes.NewSubmitType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.NewSubmitType, list);
            };
            Events.invokeNewSubmit = function () {
                var hndlrs = this.handlers.get(HandlerTypes.NewSubmitType);
                if (hndlrs !== void 0) {
                    for (var _i = 0, hndlrs_2 = hndlrs; _i < hndlrs_2.length; _i++) {
                        var h = hndlrs_2[_i];
                        h();
                    }
                }
            };
            Events.subscribeChangeSubmitId = function (h) {
                var list = this.handlers.get(HandlerTypes.ChangeSubmitIdType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.ChangeSubmitIdType, list);
            };
            Events.invokeChangeSubmitId = function (submitId) {
                var hndlrs = this.handlers.get(HandlerTypes.ChangeSubmitIdType);
                if (hndlrs !== void 0) {
                    for (var _i = 0, hndlrs_3 = hndlrs; _i < hndlrs_3.length; _i++) {
                        var h = hndlrs_3[_i];
                        h(submitId);
                    }
                }
            };
            Events.subscribeChangeHasKillable = function (h) {
                var list = this.handlers.get(HandlerTypes.ChangeHasKillableType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.ChangeHasKillableType, list);
            };
            Events.invokeChangeHasKillable = function (hasKillable) {
                var hndlrs = this.handlers.get(HandlerTypes.ChangeHasKillableType);
                if (hndlrs !== void 0) {
                    for (var _i = 0, hndlrs_4 = hndlrs; _i < hndlrs_4.length; _i++) {
                        var h = hndlrs_4[_i];
                        h(hasKillable);
                    }
                }
            };
            Events.subscribeNotifyMessage = function (h) {
                var list = this.handlers.get(HandlerTypes.NotifyMessageType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.NotifyMessageType, list);
            };
            Events.invokeNotifyMessage = function (e) {
                var hndlrs = this.handlers.get(HandlerTypes.NotifyMessageType);
                if (hndlrs !== void 0) {
                    for (var _i = 0, hndlrs_5 = hndlrs; _i < hndlrs_5.length; _i++) {
                        var h = hndlrs_5[_i];
                        h(e);
                    }
                }
            };
            Events.subscribeChannelDataLoaded = function (h) {
                var list = this.handlers.get(HandlerTypes.ChannelDataLoadedType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.ChannelDataLoadedType, list);
            };
            Events.invokeChannelDataLoaded = function (data) {
                var hndlrs = this.handlers.get(HandlerTypes.ChannelDataLoadedType);
                if (hndlrs !== void 0) {
                    for (var _i = 0, hndlrs_6 = hndlrs; _i < hndlrs_6.length; _i++) {
                        var h = hndlrs_6[_i];
                        h(data);
                    }
                }
            };
            Events.subscribeProteinDataLoaded = function (h) {
                var list = this.handlers.get(HandlerTypes.ProteinDataLoadedType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.ProteinDataLoadedType, list);
            };
            Events.invokeProteinDataLoaded = function (data) {
                var hndlrs = this.handlers.get(HandlerTypes.ProteinDataLoadedType);
                if (hndlrs !== void 0) {
                    for (var _i = 0, hndlrs_7 = hndlrs; _i < hndlrs_7.length; _i++) {
                        var h = hndlrs_7[_i];
                        h(data);
                    }
                }
            };
            Events.subscribeToggleLoadingScreen = function (h) {
                var list = this.handlers.get(HandlerTypes.ToggleLoadingScreenType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.ToggleLoadingScreenType, list);
            };
            Events.invokeToggleLoadingScreen = function (params) {
                var hndlrs = this.handlers.get(HandlerTypes.ToggleLoadingScreenType);
                if (hndlrs !== void 0) {
                    for (var _i = 0, hndlrs_8 = hndlrs; _i < hndlrs_8.length; _i++) {
                        var h = hndlrs_8[_i];
                        h(params);
                    }
                }
            };
            Events.subscribeRunGeneratePDFReport = function (h) {
                var list = this.handlers.get(HandlerTypes.RunPDFReportType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.RunPDFReportType, list);
            };
            Events.invokeRunPDFReport = function () {
                var hndlrs = this.handlers.get(HandlerTypes.RunPDFReportType);
                if (hndlrs !== void 0) {
                    for (var _i = 0, hndlrs_9 = hndlrs; _i < hndlrs_9.length; _i++) {
                        var h = hndlrs_9[_i];
                        h();
                    }
                }
            };
            Events.subscribeCopyParameters = function (h) {
                var list = this.handlers.get(HandlerTypes.CopyParametersType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.CopyParametersType, list);
            };
            Events.invokeCopyParameters = function (params) {
                var hndlrs = this.handlers.get(HandlerTypes.CopyParametersType);
                if (hndlrs !== void 0) {
                    for (var _i = 0, hndlrs_10 = hndlrs; _i < hndlrs_10.length; _i++) {
                        var h = hndlrs_10[_i];
                        h(params);
                    }
                }
            };
            Events.subscribeOnReSubmit = function (h) {
                var list = this.handlers.get(HandlerTypes.OnReSubmitType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.OnReSubmitType, list);
            };
            Events.invokeOnReSubmit = function (promise) {
                var hndlrs = this.handlers.get(HandlerTypes.OnReSubmitType);
                if (hndlrs !== void 0) {
                    for (var _i = 0, hndlrs_11 = hndlrs; _i < hndlrs_11.length; _i++) {
                        var h = hndlrs_11[_i];
                        h(promise);
                    }
                }
            };
            Events.subscribeOnSequneceViewerToggle = function (h) {
                var list = this.handlers.get(HandlerTypes.OnSequneceViewerToggleType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.OnSequneceViewerToggleType, list);
            };
            Events.invokeOnSequneceViewerToggle = function (params) {
                var hndlrs = this.handlers.get(HandlerTypes.OnSequneceViewerToggleType);
                if (hndlrs !== void 0) {
                    for (var _i = 0, hndlrs_12 = hndlrs; _i < hndlrs_12.length; _i++) {
                        var h = hndlrs_12[_i];
                        h(params);
                    }
                }
            };
            Events.subscribeOnMembraneDataReady = function (h) {
                var list = this.handlers.get(HandlerTypes.OnMembraneDataReadyType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.OnMembraneDataReadyType, list);
            };
            Events.invokeOnMembraneDataReady = function () {
                var hndlrs = this.handlers.get(HandlerTypes.OnMembraneDataReadyType);
                if (hndlrs !== void 0) {
                    for (var _i = 0, hndlrs_13 = hndlrs; _i < hndlrs_13.length; _i++) {
                        var h = hndlrs_13[_i];
                        h();
                    }
                }
            };
            return Events;
        }());
        Events.handlers = new Map();
        Bridge.Events = Events;
    })(Bridge = MoleOnlineWebUI.Bridge || (MoleOnlineWebUI.Bridge = {}));
})(MoleOnlineWebUI || (MoleOnlineWebUI = {}));
var MoleOnlineWebUI;
(function (MoleOnlineWebUI) {
    var DataProxy;
    (function (DataProxy) {
        var Service = MoleOnlineWebUI.Service.MoleAPI.ApiService;
        var ComputationInfo;
        (function (ComputationInfo) {
            var DataProvider = (function () {
                function DataProvider() {
                }
                //--
                DataProvider.hasPending = function (compId) {
                    if (this.pending === void 0) {
                        return false;
                    }
                    var isPending = this.pending.get(compId);
                    return (isPending === void 0) ? false : isPending;
                };
                DataProvider.setPending = function (compId, isPending) {
                    if (this.pending === void 0) {
                        this.pending = new Map();
                    }
                    this.pending.set(compId, isPending);
                };
                DataProvider.setData = function (compId, info) {
                    if (this.data === void 0) {
                        this.data = new Map();
                    }
                    this.data.set(compId, info);
                    this.runHandlers(compId, info);
                };
                DataProvider.runHandlers = function (compId, info) {
                    if (this.handlers === void 0) {
                        return;
                    }
                    var hndlrs = [];
                    for (var _i = 0, _a = this.handlers; _i < _a.length; _i++) {
                        var h = _a[_i];
                        if (h.compId === compId) {
                            h.handler(compId, info);
                        }
                        if (h.stayForUpdate === true || h.compId !== compId) {
                            hndlrs.push(h);
                        }
                    }
                    this.handlers = hndlrs;
                };
                DataProvider.requestData = function (compId) {
                    var _this = this;
                    if (this.hasPending(compId)) {
                        return;
                    }
                    this.setPending(compId, true);
                    Service.getComputationInfoList(compId).then(function (val) {
                        _this.setPending(compId, false);
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log(val);
                        _this.setData(compId, val);
                    }).catch(function (err) {
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log(err);
                        window.setTimeout((function () { _this.requestData(compId); }).bind(_this), 100);
                    });
                };
                DataProvider.attachHandler = function (compId, handler, stayForUpdate) {
                    if (this.handlers === void 0) {
                        this.handlers = [];
                    }
                    this.handlers.push({
                        compId: compId,
                        handler: handler,
                        stayForUpdate: stayForUpdate
                    });
                    this.requestData(compId);
                };
                //--
                DataProvider.get = function (compId, handler, onlyFresh) {
                    if (this.data !== void 0 && !onlyFresh) {
                        var data = this.data.get(compId);
                        if (data !== void 0) {
                            handler(compId, data);
                            return;
                        }
                    }
                    this.attachHandler(compId, handler, false);
                };
                DataProvider.subscribe = function (compId, handler, onlyFresh) {
                    if (this.data !== void 0 && !onlyFresh) {
                        var data = this.data.get(compId);
                        if (data !== void 0) {
                            handler(compId, data);
                        }
                    }
                    this.attachHandler(compId, handler, true);
                };
                return DataProvider;
            }());
            ComputationInfo.DataProvider = DataProvider;
        })(ComputationInfo = DataProxy.ComputationInfo || (DataProxy.ComputationInfo = {}));
        var JobStatus;
        (function (JobStatus) {
            var Watcher = (function () {
                function Watcher() {
                }
                Watcher.makeHash = function (computationId, submitId) {
                    return computationId + ":" + computationId;
                };
                Watcher.registerErrHandler = function (computationId, submitId, handler) {
                    if (this.errHandlers === void 0) {
                        this.errHandlers = new Map();
                    }
                    var key = this.makeHash(computationId, submitId);
                    var handlers = this.errHandlers.get(key);
                    if (handlers === void 0) {
                        handlers = [];
                    }
                    handlers.push(handler);
                    this.errHandlers.set(key, handlers);
                };
                Watcher.registerOnChangeHandler = function (computationId, submitId, handler, onErr) {
                    if (this.handlers === void 0) {
                        this.handlers = new Map();
                    }
                    var key = this.makeHash(computationId, submitId);
                    var handlers = this.handlers.get(key);
                    var shouldStartLoop = false;
                    if (handlers === void 0) {
                        handlers = [];
                        shouldStartLoop = true;
                    }
                    handlers.push(handler);
                    this.handlers.set(key, handlers);
                    this.registerErrHandler(computationId, submitId, onErr);
                    if (shouldStartLoop) {
                        this.waitForResult(computationId, submitId);
                    }
                };
                Watcher.notifyStatusUpdate = function (computationId, submitId, status) {
                    var handlers = this.handlers.get(this.makeHash(computationId, submitId));
                    if (handlers === void 0) {
                        return;
                    }
                    for (var _i = 0, handlers_1 = handlers; _i < handlers_1.length; _i++) {
                        var h = handlers_1[_i];
                        h(status);
                    }
                };
                Watcher.removeHandlers = function (computationId, submitId) {
                    var key = this.makeHash(computationId, submitId);
                    this.handlers.delete(key);
                    this.errHandlers.delete(key);
                };
                Watcher.waitForResult = function (computationId, submitId) {
                    var _this = this;
                    Service.getStatus(computationId, submitId).then(function (state) {
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log(state);
                        /*
                        "Initializing"| OK
                        "Initialized"| OK
                        "FailedInitialization"| OK
                        "Running"| OK
                        "Finished"| OK
                        "Error"| OK
                        "Deleted"| OK
                        "Aborted"; OK
                        */
                        switch (state.Status) {
                            case "Initializing":
                            case "Running":
                                _this.notifyStatusUpdate(computationId, submitId, state);
                                window.setTimeout(function () { _this.waitForResult(computationId, submitId); }, 1000);
                                break;
                            case "Initialized":
                            case "FailedInitialization":
                            case "Error":
                            case "Deleted":
                            case "Aborted":
                            case "Finished":
                                _this.notifyStatusUpdate(computationId, submitId, state);
                                _this.removeHandlers(computationId, submitId);
                                break;
                        }
                    })
                        .catch(function (err) {
                        var h = _this.errHandlers.get(_this.makeHash(computationId, submitId));
                        if (h === void 0) {
                            throw new Error(err);
                        }
                        for (var _i = 0, h_1 = h; _i < h_1.length; _i++) {
                            var handler = h_1[_i];
                            handler(err);
                        }
                    });
                };
                return Watcher;
            }());
            JobStatus.Watcher = Watcher;
        })(JobStatus = DataProxy.JobStatus || (DataProxy.JobStatus = {}));
        var CSAResidues;
        (function (CSAResidues_1) {
            var DataProvider = (function () {
                function DataProvider() {
                }
                //--
                DataProvider.hasPending = function (compId) {
                    if (this.pending === void 0) {
                        return false;
                    }
                    var isPending = this.pending.get(compId);
                    return (isPending === void 0) ? false : isPending;
                };
                DataProvider.setPending = function (compId, isPending) {
                    if (this.pending === void 0) {
                        this.pending = new Map();
                    }
                    this.pending.set(compId, isPending);
                };
                DataProvider.setData = function (compId, info) {
                    if (this.data === void 0) {
                        this.data = new Map();
                    }
                    this.data.set(compId, info);
                    this.runHandlers(compId, info);
                };
                DataProvider.runHandlers = function (compId, info) {
                    if (this.handlers === void 0) {
                        return;
                    }
                    var hndlrs = [];
                    for (var _i = 0, _a = this.handlers; _i < _a.length; _i++) {
                        var h = _a[_i];
                        if (h.compId === compId) {
                            h.handler(compId, info);
                        }
                        if (h.stayForUpdate === true || h.compId !== compId) {
                            hndlrs.push(h);
                        }
                    }
                    this.handlers = hndlrs;
                };
                DataProvider.requestData = function (compId) {
                    var _this = this;
                    if (this.hasPending(compId)) {
                        return;
                    }
                    this.setPending(compId, true);
                    Service.getCSAResidues(compId).then(function (val) {
                        _this.setPending(compId, false);
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log(val);
                        _this.setData(compId, val);
                    }).catch(function (err) {
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log(err);
                        window.setTimeout((function () { _this.requestData(compId); }).bind(_this), 100);
                    });
                };
                DataProvider.attachHandler = function (compId, handler, stayForUpdate) {
                    if (this.handlers === void 0) {
                        this.handlers = [];
                    }
                    this.handlers.push({
                        compId: compId,
                        handler: handler,
                        stayForUpdate: stayForUpdate
                    });
                    this.requestData(compId);
                };
                //--
                DataProvider.get = function (compId, handler, onlyFresh) {
                    if (this.data !== void 0 && !onlyFresh) {
                        var data = this.data.get(compId);
                        if (data !== void 0) {
                            handler(compId, data);
                            return;
                        }
                    }
                    this.attachHandler(compId, handler, false);
                };
                DataProvider.subscribe = function (compId, handler, onlyFresh) {
                    if (this.data !== void 0 && !onlyFresh) {
                        var data = this.data.get(compId);
                        if (data !== void 0) {
                            handler(compId, data);
                        }
                    }
                    this.attachHandler(compId, handler, true);
                };
                return DataProvider;
            }());
            CSAResidues_1.DataProvider = DataProvider;
        })(CSAResidues = DataProxy.CSAResidues || (DataProxy.CSAResidues = {}));
        var Cofactors;
        (function (Cofactors_1) {
            var DataProvider = (function () {
                function DataProvider() {
                }
                //--
                DataProvider.hasPending = function () {
                    if (this.pending === void 0) {
                        return false;
                    }
                    return this.pending;
                };
                DataProvider.setPending = function (isPending) {
                    this.pending = isPending;
                };
                DataProvider.setData = function (info) {
                    this.data = info;
                    this.runHandlers(info);
                };
                DataProvider.runHandlers = function (info) {
                    if (this.handlers === void 0) {
                        return;
                    }
                    for (var _i = 0, _a = this.handlers; _i < _a.length; _i++) {
                        var h = _a[_i];
                        h.handler(info);
                    }
                    this.handlers = [];
                };
                DataProvider.requestData = function () {
                    var _this = this;
                    if (this.hasPending()) {
                        return;
                    }
                    this.setPending(true);
                    Service.getCofactors().then(function (val) {
                        _this.setPending(false);
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log(val);
                        _this.setData(val);
                    }).catch(function (err) {
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log(err);
                        window.setTimeout((function () { _this.requestData(); }).bind(_this), 100);
                    });
                };
                DataProvider.attachHandler = function (handler) {
                    if (this.handlers === void 0) {
                        this.handlers = [];
                    }
                    this.handlers.push({
                        handler: handler
                    });
                    this.requestData();
                };
                //--
                DataProvider.get = function (handler, onlyFresh) {
                    if (this.data !== void 0 && !onlyFresh) {
                        var data = this.data;
                        if (data !== void 0) {
                            handler(data);
                            return;
                        }
                    }
                    this.attachHandler(handler);
                };
                DataProvider.hasData = function () {
                    return this.data !== void 0;
                };
                return DataProvider;
            }());
            Cofactors_1.DataProvider = DataProvider;
        })(Cofactors = DataProxy.Cofactors || (DataProxy.Cofactors = {}));
    })(DataProxy = MoleOnlineWebUI.DataProxy || (MoleOnlineWebUI.DataProxy = {}));
})(MoleOnlineWebUI || (MoleOnlineWebUI = {}));
var Common;
(function (Common) {
    var Util;
    (function (Util) {
        var Router;
        (function (Router) {
            ;
            function getParameters() {
                var parametersChannelsDBTest = SimpleRouter.GlobalRouter.getParametersByRegex(/\/online\/([a-zA-Z0-9]+)\/ChannelsDB/g);
                var parameters = SimpleRouter.GlobalRouter.getParametersByRegex(/\/online\/([a-zA-Z0-9]+)\/*([0-9]*)/g);
                var computationId = null;
                var submitId = 0;
                if ((parameters === null) || (parameters.length === 0) || (parameters.length > 3)) {
                    console.log(parameters);
                    console.log("Corrupted url found - cannot parse parameters.");
                    return null;
                }
                computationId = parameters[1];
                if (parameters[2] !== '') {
                    submitId = Number(parameters[2]);
                }
                return {
                    submitId: submitId,
                    computationId: computationId,
                    isChannelsDB: parametersChannelsDBTest !== null && parametersChannelsDBTest.length > 0
                };
            }
            Router.getParameters = getParameters;
            function redirect(computationId, submitId) {
                SimpleRouter.GlobalRouter.redirect("/" + computationId + "/" + submitId, true);
            }
            Router.redirect = redirect;
            function fakeRedirect(computationId, submitId) {
                if (submitId !== void 0) {
                    SimpleRouter.GlobalRouter.fakeRedirect("/" + computationId + "/" + submitId, true);
                }
                else {
                    SimpleRouter.GlobalRouter.fakeRedirect("/" + computationId + "/", true);
                }
                Common.Util.LastNSessions.updateWithCurrentSession();
            }
            Router.fakeRedirect = fakeRedirect;
            function isInChannelsDBMode() {
                var params = getParameters();
                return params !== null && params.isChannelsDB;
            }
            Router.isInChannelsDBMode = isInChannelsDBMode;
            function getCurrentUrl() {
                return window.location.href;
            }
            Router.getCurrentUrl = getCurrentUrl;
        })(Router = Util.Router || (Util.Router = {}));
    })(Util = Common.Util || (Common.Util = {}));
})(Common || (Common = {}));
var Common;
(function (Common) {
    var Util;
    (function (Util) {
        var Cookies;
        (function (Cookies) {
            function setCookie(c_name, value, exdays) {
                var exdate = new Date();
                if (exdays !== void 0) {
                    exdate.setDate(exdate.getDate() + exdays);
                }
                var c_value = encodeURI(value) + ((exdays === void 0) ? "" : "; expires=" + exdate.toUTCString()) + "; path=/";
                document.cookie = c_name + "=" + c_value;
            }
            Cookies.setCookie = setCookie;
            function getCookie(c_name) {
                var i, x, y, ARRcookies = document.cookie.split(";");
                for (i = 0; i < ARRcookies.length; i++) {
                    x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
                    y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
                    x = x.replace(/^\s+|\s+$/g, "");
                    if (x == c_name) {
                        return decodeURI(y);
                    }
                }
            }
            Cookies.getCookie = getCookie;
        })(Cookies = Util.Cookies || (Util.Cookies = {}));
    })(Util = Common.Util || (Common.Util = {}));
})(Common || (Common = {}));
var Common;
(function (Common) {
    var Util;
    (function (Util) {
        var LastNSessions;
        (function (LastNSessions) {
            var Cookies = Common.Util.Cookies;
            var Router = Common.Util.Router;
            LastNSessions.LAST_N_SESSIONS_N = 5;
            var cookieNamePrefix = "LastNSessionsWithDate";
            var version = 4;
            function getNthSession(n) {
                var val = Cookies.getCookie(cookieNamePrefix + "_" + version + "_" + n);
                if (val === void 0 || val === null || val === "") {
                    return "";
                }
                return val;
            }
            LastNSessions.getNthSession = getNthSession;
            function formatDate(date) {
                var day = "" + date.getDate();
                if (day.length == 1) {
                    day = "0" + day;
                }
                var month = "" + (date.getMonth() + 1);
                if (month.length === 1) {
                    month = "0" + month;
                }
                var hours = "" + date.getHours();
                if (hours.length === 1) {
                    hours = "0" + hours;
                }
                var minutes = "" + date.getMinutes();
                if (minutes.length === 1) {
                    minutes = "0" + minutes;
                }
                return day + "." + month + "." + date.getFullYear() + " " + hours + ":" + minutes;
            }
            function setNthSession(n, value) {
                Cookies.setCookie(cookieNamePrefix + "_" + version + "_" + n, formatDate(new Date()) + "|" + value);
            }
            LastNSessions.setNthSession = setNthSession;
            function updateWithCurrentSession() {
                var params = Router.getParameters();
                if (params === null) {
                    return;
                }
                var computationId = params.computationId;
                var submitIdPart = (params.isChannelsDB) ? "/ChannelsDB" : (params.submitId === 0) ? "" : "/" + params.submitId;
                for (var i = 0; i < LastNSessions.LAST_N_SESSIONS_N; i++) {
                    var session = getNthSession(i);
                    if (session === "") {
                        setNthSession(i, "" + computationId + submitIdPart);
                        return;
                    }
                    var compId = session.split("|")[1].split("/")[0];
                    if (compId === params.computationId) {
                        setNthSession(i, "" + computationId + submitIdPart);
                        return;
                    }
                }
                for (var i = 1; i < LastNSessions.LAST_N_SESSIONS_N; i++) {
                    setNthSession(i - 1, getNthSession(i).split("|")[1]);
                }
                setNthSession(LastNSessions.LAST_N_SESSIONS_N - 1, "" + computationId + submitIdPart);
            }
            LastNSessions.updateWithCurrentSession = updateWithCurrentSession;
        })(LastNSessions = Util.LastNSessions || (Util.LastNSessions = {}));
    })(Util = Common.Util || (Common.Util = {}));
})(Common || (Common = {}));
var Common;
(function (Common) {
    var Tabs;
    (function (Tabs) {
        var BootstrapTabs;
        (function (BootstrapTabs) {
            var React = LiteMol.Plugin.React;
            var TabbedContainer = (function (_super) {
                __extends(TabbedContainer, _super);
                function TabbedContainer() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TabbedContainer.prototype.componentDidMount = function () {
                };
                TabbedContainer.prototype.header = function () {
                    var _this = this;
                    var rv = [];
                    var _loop_1 = function (idx) {
                        var header = this_1.props.header[idx];
                        rv.push(React.createElement("li", { className: (idx === this_1.props.activeTab) ? "active" : "" },
                            React.createElement("a", { "data-toggle": "tab", href: "#" + this_1.props.namespace + (idx + 1), onClick: (function () {
                                    window.setTimeout(function () {
                                        if (_this.props.onChange !== void 0) {
                                            _this.props.onChange(idx);
                                        }
                                    });
                                }).bind(this_1) }, header)));
                    };
                    var this_1 = this;
                    for (var idx = 0; idx < this.props.header.length; idx++) {
                        _loop_1(idx);
                    }
                    return rv;
                };
                TabbedContainer.prototype.contents = function () {
                    var rv = [];
                    for (var idx = 0; idx < this.props.tabContents.length; idx++) {
                        var contents = this.props.tabContents[idx];
                        rv.push(React.createElement("div", { id: "" + this.props.namespace + (idx + 1), className: "tab-pane fade " + ((idx === this.props.activeTab) ? "in active" : "") }, contents));
                    }
                    return rv;
                };
                TabbedContainer.prototype.render = function () {
                    return (React.createElement("div", { className: this.props.htmlClassName, id: this.props.htmlId },
                        React.createElement("ul", { className: "nav nav-tabs" }, this.header()),
                        React.createElement("div", { className: "tab-content" }, this.contents())));
                };
                return TabbedContainer;
            }(React.Component));
            BootstrapTabs.TabbedContainer = TabbedContainer;
            var Tab = (function (_super) {
                __extends(Tab, _super);
                function Tab() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Tab.prototype.render = function () {
                    return (React.createElement("div", { id: "" + this.props.namespace + this.props.tabIndex, className: (this.props.active) ? "active" : "" }, this.props.contents));
                };
                return Tab;
            }(React.Component));
            BootstrapTabs.Tab = Tab;
        })(BootstrapTabs = Tabs.BootstrapTabs || (Tabs.BootstrapTabs = {}));
    })(Tabs = Common.Tabs || (Common.Tabs = {}));
})(Common || (Common = {}));
var AlertMessages;
(function (AlertMessages) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        var MAX_TICK = 5;
        var QUEUE_MAX_LENGTH = 5;
        function render(target) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, null), target);
        }
        UI.render = render;
        ;
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.waitingMessages = [];
                _this.queue = [];
                return _this;
            }
            App.prototype.enqueue = function (m) {
                var pkg = {
                    message: m,
                    tick: MAX_TICK
                };
                this.queue.push(pkg);
            };
            App.prototype.dequeue = function () {
                var head = this.queue[0];
                if (head === void 0) {
                    return;
                }
                head.tick--;
                if (head.tick < 0) {
                    this.queue.shift();
                }
            };
            App.prototype.tick = function () {
                this.dequeue();
                if (this.queue.length >= QUEUE_MAX_LENGTH) {
                    return;
                }
                var m = this.waitingMessages.shift();
                if (m !== void 0) {
                    this.enqueue(m);
                }
                this.forceUpdate();
            };
            App.prototype.fastDequeue = function (m) {
                this.queue.splice(this.queue.indexOf(m), 1);
                this.forceUpdate();
            };
            App.prototype.componentDidMount = function () {
                var _this = this;
                MoleOnlineWebUI.Bridge.Events.subscribeNotifyMessage(function (m) {
                    _this.waitingMessages.push(m);
                });
                var watcher = function () {
                    _this.tick();
                    window.setTimeout(watcher, 1000);
                };
                watcher.bind(this)();
            };
            App.prototype.componentWillUnmount = function () {
            };
            App.prototype.render = function () {
                var messages = [];
                for (var _i = 0, _a = this.queue; _i < _a.length; _i++) {
                    var m = _a[_i];
                    messages.push(React.createElement(Message, { message: m, app: this }));
                }
                var active = (this.queue.length > 0) ? " active" : "";
                return (React.createElement("div", { className: "alert-messages-container" + active }, messages));
            };
            return App;
        }(React.Component));
        UI.App = App;
        var Message = (function (_super) {
            __extends(Message, _super);
            function Message() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Message.prototype.getClassByType = function (type) {
                return "alert-" + type.toLowerCase();
            };
            Message.prototype.render = function () {
                var _this = this;
                return React.createElement("div", { className: "alert " + this.getClassByType(this.props.message.message.messageType), onClick: function (e) {
                        _this.props.app.fastDequeue(_this.props.message);
                    } }, this.props.message.message.message);
            };
            return Message;
        }(React.Component));
    })(UI = AlertMessages.UI || (AlertMessages.UI = {}));
})(AlertMessages || (AlertMessages = {}));
var MoleOnlineWebUI;
(function (MoleOnlineWebUI) {
    var InitForm;
    (function (InitForm) {
        var UI;
        (function (UI) {
            var ApiService = MoleOnlineWebUI.Service.MoleAPI.ApiService;
            var React = LiteMol.Plugin.React;
            var ReactDOM = LiteMol.Plugin.ReactDOM;
            var LastNSessions = Common.Util.LastNSessions;
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
                        activeTabIdx: 0,
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
                    $('#frm-jobSetup-setupForm-next').val('Submiting...');
                    $('#frm-jobSetup-setupForm-next').prop('disabled', true);
                    var pdbid = "";
                    var assembly;
                    var pores = false;
                    var file;
                    for (var idx = 0; idx < form.length; idx++) {
                        var item = form[idx];
                        var name_1 = item.getAttribute('name');
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
                    if (file === void 0 || file === null) {
                        this.triggerAnalyticsEvent((pdbid.length > 0) ? pdbid : null, pores, (assembly === void 0) ? null : assembly, null);
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
                        this.triggerAnalyticsEvent(null, false, null, file);
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
                App.prototype.triggerAnalyticsEvent = function (pdbid, pores, assembly, file) {
                    if (file !== null) {
                        var extension = file.name.split(".").filter(function (v, i, a) { return i !== 0; }).join(".");
                        gtag('event', 'Init', { 'event_category': 'userStructure', 'event_label': extension });
                        return;
                    }
                    else {
                        if (pdbid === null) {
                            return;
                        }
                        if (pores) {
                            gtag('event', 'Init', { 'event_category': pdbid, 'event_label': 'bio' });
                            return;
                        }
                        if (assembly !== null) {
                            var assembly_number = Number(assembly);
                            if (isNaN(assembly_number.valueOf())) {
                                assembly_number = 0;
                            }
                            gtag('event', 'Init', { 'event_category': pdbid, 'event_label': 'assembly', 'value': assembly_number });
                            return;
                        }
                        if (!pores && assembly === null) {
                            gtag('event', 'Init', { 'event_category': pdbid, 'event_label': 'asymetricUnit' });
                            return;
                        }
                    }
                };
                App.prototype.handleFormSubmitResponse = function (response) {
                    if (response.Status === "FailedInitialization") {
                        $('#frm-jobSetup-setupForm-next').prop('disabled', false);
                        $('#frm-jobSetup-setupForm-next').val('Next');
                        MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                            messageType: "Danger",
                            message: "API was unable to initialize computation with specified parameters. API responded with message: " + response.ErrorMsg
                        });
                        return;
                    }
                    this.computationId = response.ComputationId;
                    this.submitId = response.SubmitId;
                    if (response.Status === "Initialized") {
                        console.log("Initialized");
                        $('#frm-jobSetup-setupForm-next').val('Initialized!');
                        MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                            messageType: "Success",
                            message: "Computation was successfully initialized. You will be redirected to detail page."
                        });
                        SimpleRouter.GlobalRouter.redirect("/" + this.computationId, true);
                        return;
                    }
                    if (response.Status === "Initializing") {
                        console.log("Waiting for computation initialization...");
                        $('#frm-jobSetup-setupForm-next').val('Initializing computation...');
                        window.setTimeout(this.waitForComputationInitialization.bind(this), 500);
                        return;
                    }
                    $('#frm-jobSetup-setupForm-next').prop('disabled', false);
                    MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                        messageType: "Danger",
                        message: "Unexpected computation status recieved from API: " + response.Status
                    });
                };
                App.prototype.waitForComputationInitialization = function () {
                    var _this = this;
                    ApiService.getStatus(this.computationId, this.submitId).then(function (response) {
                        _this.handleFormSubmitResponse(response);
                    });
                };
                App.prototype.biologicalUnitChange = function (e) {
                    var el = e.target;
                    var s = this.state;
                    s.useBiologicalUnit = el.checked;
                    this.setState(s);
                };
                App.prototype.render = function () {
                    var _this = this;
                    var buttons = React.createElement("input", { type: "submit", name: "next", className: "button", id: "frm-jobSetup-setupForm-next", value: "Next" });
                    var content = this.formByPDBID();
                    var tabs = [];
                    tabs.push(this.formByPDBID());
                    tabs.push(this.formByFile());
                    tabs.push(this.formByLastNSessions());
                    if (this.state.activeTabIdx === 2) {
                        buttons = React.createElement("span", null);
                    }
                    return (React.createElement("div", { className: "InitForm" },
                        React.createElement("form", { onSubmit: this.handleFormSubmit.bind(this), action: Config.Routing.ROUTING_OPTIONS[Config.Routing.ROUTING_MODE].defaultContextPath + "/", method: "post", encType: "multipart/form-data" },
                            React.createElement("div", { className: "groupbox" },
                                React.createElement(Common.Tabs.BootstrapTabs.TabbedContainer, { header: ["PDBID", "File", "Last session"], tabContents: tabs, namespace: "quick-start-panel-tabs-", htmlClassName: "tabs", htmlId: "quick-start-panel-tabs", activeTab: this.state.activeTabIdx, onChange: (function (tabIdx) {
                                        var s = _this.state;
                                        s.activeTabIdx = tabIdx;
                                        _this.setState(s);
                                    }).bind(this) })),
                            React.createElement("div", { className: "buttons" }, buttons),
                            React.createElement("div", null,
                                React.createElement("input", { type: "hidden", name: "do", value: "jobSetup-setupForm-submit" })))));
                };
                App.prototype.formByPDBID = function () {
                    return (React.createElement("table", { style: { width: "100%" } },
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
                                    React.createElement("label", { htmlFor: "frm-jobSetup-setupForm-unit" }, "Assembly ID (optional)"),
                                    ":"),
                                React.createElement("td", null,
                                    React.createElement("input", { disabled: this.state.useBiologicalUnit, type: "text", name: "assembly", maxLength: 3, size: 10, className: "text", id: "frm-jobSetup-setupForm-unit", defaultValue: "" }),
                                    React.createElement("div", { className: "hint" }, "no value - assymetric unit (default)"))),
                            React.createElement("tr", null,
                                React.createElement("td", null,
                                    React.createElement("label", { htmlFor: "frm-jobSetup-setupForm-chains" }, "Use biological unit"),
                                    ":"),
                                React.createElement("td", null,
                                    React.createElement("input", { type: "checkbox", onChange: this.biologicalUnitChange.bind(this), name: "biological-unit", className: "checkbox", defaultChecked: true }),
                                    React.createElement("div", { className: "hint" }, "use biological unit"))))));
                };
                App.prototype.formByFile = function () {
                    return (React.createElement("table", { style: { width: "100%" } },
                        React.createElement("tbody", null,
                            React.createElement("tr", null,
                                React.createElement("td", null,
                                    React.createElement("label", { htmlFor: "frm-jobSetup-setupForm-file" }, "Upload your own file"),
                                    ":"),
                                React.createElement("td", null,
                                    React.createElement("input", { type: "file", name: "file", className: "text", id: "frm-jobSetup-setupForm-file" }),
                                    React.createElement("div", { className: "hint" },
                                        "Plain text PDB files (UTF-8 encoding), ZIP and GZIP archives are supported, maximal file size is 50MB.",
                                        React.createElement("br", null),
                                        "E.g. cleaned PDB with only one chain and without unnecessary HETATMs."))))));
                };
                App.prototype.getLastNSessions = function () {
                    var sessions = [];
                    for (var i = 0; i < LastNSessions.LAST_N_SESSIONS_N; i++) {
                        var session = LastNSessions.getNthSession(i);
                        if (session === "") {
                            break;
                        }
                        sessions.push(React.createElement(LastSession, { session: session, parent: this }));
                    }
                    if (sessions.length === 0) {
                        sessions.push(React.createElement("tr", null,
                            React.createElement("td", { colSpan: 4 }, "There are no last openned sessions available...")));
                    }
                    return sessions;
                };
                App.prototype.formByLastNSessions = function () {
                    var sessions = this.getLastNSessions();
                    return (React.createElement("table", { style: { width: "100%" }, className: "last-session-form" },
                        React.createElement("thead", null,
                            React.createElement("tr", null,
                                React.createElement("th", null, "Created"),
                                React.createElement("th", null, "PDB ID"),
                                React.createElement("th", null, "Assembly ID"),
                                React.createElement("th", null, "Submission"))),
                        React.createElement("tbody", null, sessions)));
                };
                return App;
            }(React.Component));
            UI.App = App;
            ;
            var LastSession = (function (_super) {
                __extends(LastSession, _super);
                function LastSession() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.state = { loaded: false, data: null };
                    return _this;
                }
                LastSession.prototype.componentDidMount = function () {
                    var _this = this;
                    var computationId = this.props.session.split("|")[1].split("/")[0];
                    MoleOnlineWebUI.DataProxy.ComputationInfo.DataProvider.get(computationId, function (compId, info) {
                        var s = _this.state;
                        _this.setState({
                            loaded: true,
                            data: info
                        });
                    });
                };
                LastSession.prototype.render = function () {
                    var date = this.props.session.split("|")[0];
                    var sessionUrl = this.props.session.split("|")[1];
                    if (this.state.loaded && this.state.data !== null) {
                        var pdbid = void 0;
                        if (this.state.data.PdbId !== null && this.state.data.PdbId !== "") {
                            pdbid = this.state.data.PdbId;
                        }
                        else {
                            pdbid = "User structure";
                        }
                        var assemblyId = void 0;
                        if (this.state.data.AssemblyId !== null && this.state.data.AssemblyId !== "") {
                            assemblyId = this.state.data.AssemblyId;
                        }
                        if (assemblyId === null) {
                            assemblyId = "Assymetric unit";
                        }
                        var submitIdParts = sessionUrl.split("/");
                        var submission = void 0;
                        if (submitIdParts.length === 2) {
                            var submitId = submitIdParts[1];
                            submission = submitId;
                        }
                        return React.createElement("tr", { onClick: function () {
                                SimpleRouter.GlobalRouter.redirect("/online/" + sessionUrl);
                            }, className: "linkLike" },
                            React.createElement("td", null, date),
                            React.createElement("td", null, pdbid),
                            React.createElement("td", null, assemblyId),
                            React.createElement("td", null, submission));
                    }
                    else {
                        return React.createElement("tr", { onClick: function () {
                                SimpleRouter.GlobalRouter.redirect("/online/" + sessionUrl);
                            }, className: "linkLike" },
                            React.createElement("td", null, date),
                            React.createElement("td", { colSpan: 3 }, sessionUrl));
                    }
                };
                return LastSession;
            }(React.Component));
        })(UI = InitForm.UI || (InitForm.UI = {}));
    })(InitForm = MoleOnlineWebUI.InitForm || (MoleOnlineWebUI.InitForm = {}));
})(MoleOnlineWebUI || (MoleOnlineWebUI = {}));
var MoleOnlineWebUI;
(function (MoleOnlineWebUI) {
    var VersionStrip;
    (function (VersionStrip) {
        var UI;
        (function (UI) {
            var MoleAPI = MoleOnlineWebUI.Service.MoleAPI;
            var React = LiteMol.Plugin.React;
            var ReactDOM = LiteMol.Plugin.ReactDOM;
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
                        versions: {
                            apiVersion: "loading...",
                            moleVersion: "loading...",
                            poresVersion: "loading...",
                            uiVersion: "loading..."
                        }
                    };
                    return _this;
                }
                App.prototype.componentDidMount = function () {
                    var _this = this;
                    var s = this.state;
                    s.versions.uiVersion = $("#version-block").data("ui-version");
                    this.setState(s);
                    MoleAPI.ApiService.getVersions().then(function (val) {
                        var s1 = _this.state;
                        s1.versions.apiVersion = val.APIVersion + " (" + val.Build + ")";
                        s1.versions.moleVersion = val.MoleVersion;
                        s1.versions.poresVersion = val.PoresVersion;
                        _this.setState(s1);
                    });
                };
                App.prototype.componentWillUnmount = function () {
                };
                App.prototype.render = function () {
                    return (React.createElement("div", { className: "version-strip" }, "WEB UI Version: " + this.state.versions.uiVersion + " | API Version: " + this.state.versions.apiVersion + " | MOLE Version: " + this.state.versions.moleVersion + " | Pores Version: " + this.state.versions.poresVersion));
                };
                return App;
            }(React.Component));
            UI.App = App;
        })(UI = VersionStrip.UI || (VersionStrip.UI = {}));
    })(VersionStrip = MoleOnlineWebUI.VersionStrip || (MoleOnlineWebUI.VersionStrip = {}));
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
                if (document.getElementById("alert-messages") !== null)
                    AlertMessages.UI.render(document.getElementById("alert-messages"));
                if (document.getElementById("init-form") !== null)
                    MoleUI.InitForm.UI.render(document.getElementById("init-form"));
                MoleUI.VersionStrip.UI.render(document.getElementById("version-block"));
            })();
        })(Channels = Example.Channels || (Example.Channels = {}));
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
