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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
    Config.Routing.ROUTING_MODE = "prod";
    Config.DataSources.MODE = "upol";
    Config.DataSources.PATTERN_QUERY_MODE = "webchem";
    Config.DataSources.ANNOTATION_API_MODE = "webchem";
    Config.CommonOptions.DEBUG_MODE = false;
})(Config || (Config = {}));
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
var CommonUtils;
(function (CommonUtils) {
    var Tunnels = (function () {
        function Tunnels() {
        }
        Tunnels.getLength = function (tunnel) {
            var len = tunnel.Layers.LayersInfo[tunnel.Layers.LayersInfo.length - 1].LayerGeometry.EndDistance;
            len = Common.Util.Numbers.roundToDecimal(len, 1);
            return len;
        };
        Tunnels.getBottleneck = function (tunnel) {
            var bneck = "<Unknown>";
            for (var _i = 0, _a = tunnel.Layers.LayersInfo; _i < _a.length; _i++) {
                var element = _a[_i];
                if (element.LayerGeometry.Bottleneck) {
                    var val = element.LayerGeometry.MinRadius;
                    bneck = (Math.round(val * 10) / 10).toString();
                    break;
                }
            }
            return bneck;
        };
        Tunnels.getName = function (tunnel) {
            if (tunnel === void 0) {
                return void 0;
            }
            return MoleOnlineWebUI.Cache.TunnelName.get(tunnel.GUID);
        };
        Tunnels.concatTunnelsSafe = function (origin, newTunnels) {
            if (newTunnels === void 0) {
                return origin;
            }
            return origin.concat(newTunnels);
        };
        return Tunnels;
    }());
    CommonUtils.Tunnels = Tunnels;
})(CommonUtils || (CommonUtils = {}));
var Common;
(function (Common) {
    var Util;
    (function (Util) {
        var Numbers;
        (function (Numbers) {
            function roundToDecimal(number, numOfDecimals) {
                if (number.toString().indexOf(".") <= 0 && number.toString().indexOf(",") <= 0) {
                    return number;
                }
                var dec = Math.pow(10, numOfDecimals);
                return Math.round(number * dec) / dec;
            }
            Numbers.roundToDecimal = roundToDecimal;
        })(Numbers = Util.Numbers || (Util.Numbers = {}));
    })(Util = Common.Util || (Common.Util = {}));
})(Common || (Common = {}));
var CommonUtils;
(function (CommonUtils) {
    ;
    var Residues = (function () {
        function Residues() {
        }
        Residues.initCache = function () {
            if (this.cache !== void 0) {
                return;
            }
            this.cache = new Map();
        };
        Residues.getNameDirect = function (residueSeqNumber, plugin) {
            if (plugin.context.select('polymer-visual')[0].props !== void 0) {
                var props = plugin.context.select('polymer-visual')[0].props;
                if (props.model === void 0 || props.model.model === void 0) {
                    return "";
                }
                var model = props.model.model;
                var params = LiteMol.Core.Structure.Query.residuesById(residueSeqNumber).compile()(LiteMol.Core.Structure.Query.Context.ofStructure(model));
                var fragment = params.fragments[0];
                var residueInd = fragment.residueIndices[0];
                var residueData = params.context.structure.data.residues;
                var resIdx = residueData.indices[residueInd];
                var name_1 = residueData.name[resIdx];
                return name_1;
            }
            return "";
        };
        Residues.getName = function (residueSeqNumber, plugin) {
            this.initCache();
            if (this.cache.has(residueSeqNumber)) {
                var name_2 = this.cache.get(residueSeqNumber);
                if (name_2 === void 0) {
                    return "";
                }
                return name_2;
            }
            var name = this.getNameDirect(residueSeqNumber, plugin);
            this.cache.set(residueSeqNumber, name);
            return name;
        };
        Residues.sort = function (residues, groupFunction, hasName, includeBackbone) {
            if (includeBackbone === void 0) {
                includeBackbone = false;
            }
            if (hasName === void 0) {
                hasName = false;
            }
            if (residues.length === 0) {
                return residues;
            }
            var resParsed = this.parseResidues(residues, hasName);
            var groups = [];
            if (groupFunction !== void 0) {
                groups = groupFunction(resParsed);
            }
            else {
                groups.push(resParsed);
            }
            var sortFn = this.getSortFunctionBackboneChainSeq();
            var all = [];
            for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
                var group = groups_1[_i];
                all = all.concat(group.sort(sortFn));
            }
            return all.map(function (val, idx, array) {
                if (hasName) {
                    return val.name + " " + val.authSeqNumber + " " + val.chain.authAsymId + ((includeBackbone && val.backbone) ? ' Backbone' : '');
                }
                else {
                    return val.authSeqNumber + " " + val.chain.authAsymId + ((includeBackbone && val.backbone) ? ' Backbone' : '');
                }
            });
        };
        Residues.parseResidue = function (residue) {
            return residue.split(" ");
        };
        Residues.parseResidues = function (residues, hasName) {
            if (hasName === void 0) {
                hasName = false;
            }
            var resParsed = [];
            for (var _i = 0, residues_1 = residues; _i < residues_1.length; _i++) {
                var residue = residues_1[_i];
                var residueParts = this.parseResidue(residue);
                if (hasName) {
                    resParsed.push({
                        chain: { authAsymId: residueParts[2] },
                        authSeqNumber: Number(residueParts[1]),
                        name: residueParts[0],
                        backbone: (residueParts.length === 4)
                    });
                }
                else {
                    resParsed.push({
                        chain: { authAsymId: residueParts[1] },
                        authSeqNumber: Number(residueParts[0]),
                        backbone: (residueParts.length === 3)
                    });
                }
            }
            return resParsed;
        };
        Residues.getSortFunctionBackboneChainSeq = function () {
            return function (a, b) {
                if (a.backbone === b.backbone) {
                    if (a.chain.authAsymId === b.chain.authAsymId) {
                        return a.authSeqNumber - b.authSeqNumber;
                    }
                    return (a.chain.authAsymId < b.chain.authAsymId) ? -1 : 1;
                }
                if (a.backbone === true) {
                    return 1;
                }
                else {
                    return -1;
                }
            };
        };
        Residues.getSortFunctionChainSeqBackbone = function () {
            return function (a, b) {
                if (a.chain.authAsymId < b.chain.authAsymId) {
                    return -1;
                }
                else if (a.chain.authAsymId > b.chain.authAsymId) {
                    return 1;
                }
                else {
                    if (a.authSeqNumber === b.authSeqNumber) {
                        if (a.backbone && b.backbone) {
                            return 0;
                        }
                        else if (a.backbone && !b.backbone) {
                            return -1;
                        }
                        else {
                            return 1;
                        }
                    }
                    return a.authSeqNumber - b.authSeqNumber;
                }
            };
        };
        Residues.codelistSearch = function (whereToSearch, results, query) {
            for (var idx = 0; idx < whereToSearch.length; idx++) {
                if (whereToSearch[idx] === query) {
                    return results[idx];
                }
            }
            return "";
        };
        Residues.getSequenceLetterByName = function (name) {
            var rv = this.codelistSearch(this.residueNames, this.sequenceLetters, name);
            return (rv === "") ? "~" : rv;
        };
        Residues.getNameBySequenceLetter = function (letter) {
            var rv = this.codelistSearch(this.sequenceLetters, this.residueNames, letter);
            return (rv === "") ? "<Unknown>" : rv;
        };
        Residues.getResidueClassByName = function (authName) {
            switch (authName.toUpperCase()) {
                case 'GLU':
                case 'ASP': return "residue-class-red";
                case 'ARG':
                case 'LYS':
                case 'HIS': return "residue-class-blue";
                case 'PHE':
                case 'TYR':
                case 'TRP': return "residue-class-purple";
                case 'SER':
                case 'THR': return "residue-class-green";
                case 'CYS':
                case 'MET': return "residue-class-yellow";
                default: return "";
            }
        };
        Residues.currentContextHasResidue = function (residueName) {
            var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            if (plugin.context.select('polymer-visual')[0].props !== void 0) {
                var props = plugin.context.select('polymer-visual')[0].props;
                if (props.model === void 0 || props.model.model === void 0) {
                    return false;
                }
                var model = props.model.model;
                var params = LiteMol.Core.Structure.Query.residuesByName(residueName.toUpperCase()).compile()(LiteMol.Core.Structure.Query.Context.ofStructure(model));
                return params.fragments.length > 0;
            }
            return false;
        };
        Residues.getCenterOfMass = function (residues) {
            var positions = [];
            var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            for (var _i = 0, residues_2 = residues; _i < residues_2.length; _i++) {
                var residue = residues_2[_i];
                var moleculeModel = getNodeFromTree(plugin.root, 'protein-data');
                if (moleculeModel === null) {
                    console.log("protein data not ready!");
                    return null;
                }
                var proteinData = moleculeModel.children[0].props.molecule.models[0].data;
                var indices = [];
                var residueCount = moleculeModel.children[0].props.molecule.models[0].data.residues.count;
                for (var i = 0; i < residueCount; i++) {
                    if (String(proteinData.residues.authSeqNumber[i]) === String(residue.SequenceNumber)
                        && String(proteinData.residues.authAsymId[i]) === residue.Chain) {
                        indices.push(proteinData.residues.atomStartIndex[i]);
                        indices.push(proteinData.residues.atomEndIndex[i]);
                        break;
                    }
                }
                for (var i = 0; i < indices.length; i++) {
                    positions.push({
                        X: moleculeModel.children[0].props.molecule.models[0].positions.x[indices[i]],
                        Y: moleculeModel.children[0].props.molecule.models[0].positions.y[indices[i]],
                        Z: moleculeModel.children[0].props.molecule.models[0].positions.z[indices[i]]
                    });
                }
            }
            if (positions.length === 1) {
                return positions[0];
            }
            if (positions.length === 0) {
                return null;
            }
            var sum = positions.reduce(function (prev, cur, idx, array) {
                return {
                    X: prev.X + cur.X,
                    Y: prev.Y + cur.Y,
                    Z: prev.Z + cur.Z
                };
            });
            var centerOfMass = {
                X: sum.X / positions.length,
                Y: sum.Y / positions.length,
                Z: sum.Z / positions.length,
            };
            return centerOfMass;
        };
        return Residues;
    }());
    Residues.sequenceLetters = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'Y',
        'Z'
    ];
    Residues.residueNames = [
        'ALA',
        'ASP/ASN',
        'CYS',
        'ASP',
        'GLU',
        'PHE',
        'GLY',
        'HIS',
        'ILE',
        'LEU/ISO',
        'LYS',
        'LEU',
        'MET',
        'ASN',
        'PYL',
        'PRO',
        'GLN',
        'ARG',
        'SER',
        'THR',
        'SEC',
        'VAL',
        'TRP',
        'TYR',
        'GLU/GLN'
    ];
    CommonUtils.Residues = Residues;
    function getNodeFromTree(root, ref) {
        if (root.ref === ref) {
            return root;
        }
        for (var _i = 0, _a = root.children; _i < _a.length; _i++) {
            var c = _a[_i];
            var n = getNodeFromTree(c, ref);
            if (n !== null) {
                return n;
            }
        }
        return null;
    }
    function removeNodeFromTree(plugin, nodeRef) {
        var obj = getNodeFromTree(plugin.root, nodeRef);
        if (obj !== null) {
            LiteMol.Bootstrap.Tree.remove(obj);
        }
    }
})(CommonUtils || (CommonUtils = {}));
var CommonUtils;
(function (CommonUtils) {
    var Selection;
    (function (Selection) {
        var Transformer = LiteMol.Bootstrap.Entity.Transformer;
        ;
        ;
        ;
        ;
        ;
        ;
        var SelectionHelper = (function () {
            function SelectionHelper() {
            }
            SelectionHelper.attachOnResidueBulkSelectHandler = function (handler) {
                if (this.onResidueBulkSelectHandlers === void 0) {
                    this.onResidueBulkSelectHandlers = [];
                }
                this.onResidueBulkSelectHandlers.push({ handler: handler });
            };
            SelectionHelper.invokeOnResidueBulkSelectHandlers = function (residues) {
                if (this.onResidueBulkSelectHandlers === void 0) {
                    return;
                }
                for (var _i = 0, _a = this.onResidueBulkSelectHandlers; _i < _a.length; _i++) {
                    var h = _a[_i];
                    h.handler(residues);
                }
            };
            SelectionHelper.attachOnClearSelectionHandler = function (handler) {
                if (this.onClearSelectionHandlers === void 0) {
                    this.onClearSelectionHandlers = [];
                }
                this.onClearSelectionHandlers.push({ handler: handler });
            };
            SelectionHelper.invokeOnClearSelectionHandlers = function () {
                if (this.onClearSelectionHandlers === void 0) {
                    return;
                }
                for (var _i = 0, _a = this.onClearSelectionHandlers; _i < _a.length; _i++) {
                    var h = _a[_i];
                    h.handler();
                }
            };
            SelectionHelper.attachOnChannelSelectHandler = function (handler) {
                if (this.onChannelSelectHandlers === void 0) {
                    this.onChannelSelectHandlers = [];
                }
                this.onChannelSelectHandlers.push({ handler: handler });
            };
            SelectionHelper.invokeOnChannelSelectHandlers = function (data, channelId) {
                if (this.onChannelSelectHandlers === void 0) {
                    return;
                }
                for (var _i = 0, _a = this.onChannelSelectHandlers; _i < _a.length; _i++) {
                    var h = _a[_i];
                    h.handler(data, channelId);
                }
            };
            SelectionHelper.attachOnChannelDeselectHandler = function (handler) {
                if (this.onChannelDeselectHandlers === void 0) {
                    this.onChannelDeselectHandlers = [];
                }
                this.onChannelDeselectHandlers.push({ handler: handler });
            };
            SelectionHelper.invokeOnChannelDeselectHandlers = function () {
                if (this.onChannelDeselectHandlers === void 0) {
                    return;
                }
                for (var _i = 0, _a = this.onChannelDeselectHandlers; _i < _a.length; _i++) {
                    var h = _a[_i];
                    h.handler();
                }
            };
            //For PDF report
            SelectionHelper.forceInvokeOnChannelDeselectHandlers = function () {
                this.invokeOnChannelDeselectHandlers();
            };
            SelectionHelper.attachOnPointBulkSelectHandler = function (handler) {
                if (this.onPointSelectHandlers === void 0) {
                    this.onPointSelectHandlers = [];
                }
                this.onPointSelectHandlers.push({ handler: handler });
            };
            SelectionHelper.invokeOnPointSelectHandlers = function (points) {
                if (this.onPointSelectHandlers === void 0) {
                    return;
                }
                for (var _i = 0, _a = this.onPointSelectHandlers; _i < _a.length; _i++) {
                    var h = _a[_i];
                    h.handler(points);
                }
            };
            SelectionHelper.getSelectionVisualRef = function () {
                return this.SELECTION_VISUAL_REF;
            };
            SelectionHelper.getAltSelectionVisualRef = function () {
                return this.SELECTION_ALT_VISUAL_REF;
            };
            SelectionHelper.clearSelection = function (plugin) {
                this.clearSelectionPrivate(plugin);
                this.invokeOnClearSelectionHandlers();
                //this.resetScene(plugin);
            };
            SelectionHelper.clearSelectionPrivate = function (plugin) {
                this.clearSelectedTPoint();
                this.clearSelectedPoints();
                LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, this.SELECTION_VISUAL_REF);
                if (this.selectedChannelRef !== void 0) {
                    deselectTunnelByRef(plugin, this.selectedChannelRef);
                    this.selectedChannelRef = void 0;
                    this.selectedChannelData = void 0;
                    this.selectedChannelId = void 0;
                }
                LiteMol.Bootstrap.Event.Visual.VisualSelectElement.dispatch(plugin.context, LiteMol.Bootstrap.Interactivity.Info.empty);
                this.clearAltSelection(plugin);
                this.selectedBulkResidues = void 0;
                //this.invokeOnClearSelectionHandlers();
            };
            SelectionHelper.clearAltSelection = function (plugin) {
                LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, this.SELECTION_ALT_VISUAL_REF);
            };
            SelectionHelper.resetScene = function (plugin) {
                LiteMol.Bootstrap.Command.Visual.ResetScene.dispatch(plugin.context, void 0);
            };
            SelectionHelper.chainEquals = function (c1, c2) {
                if ((c1.asymId !== c2.asymId)
                    || (c1.authAsymId !== c2.authAsymId)
                    || (c1.index !== c2.index)) {
                    return false;
                }
                return true;
            };
            SelectionHelper.residueEquals = function (r1, r2) {
                if (r1 === void 0 && r2 === void 0) {
                    return true;
                }
                if (r1 === void 0 || r2 === void 0) {
                    return false;
                }
                if ((r1.authName !== r2.authName)
                    || (r1.authSeqNumber !== r2.authSeqNumber)
                    || (!this.chainEquals(r1.chain, r2.chain))
                    || (r1.index !== r2.index)
                    || (r1.insCode !== r2.insCode)
                    || (r1.isHet !== r2.isHet)
                    || (r1.name !== r2.name)
                    || (r1.seqNumber !== r2.seqNumber)) {
                    return false;
                }
                return true;
            };
            SelectionHelper.residueBulkSort = function (bulk) {
                bulk.sort(function (a, b) {
                    if (a.chain.authAsymId < b.chain.authAsymId) {
                        return -1;
                    }
                    else if (a.chain.authAsymId == b.chain.authAsymId) {
                        return a.authSeqNumber - b.authSeqNumber;
                    }
                    else {
                        return 1;
                    }
                });
            };
            SelectionHelper.residueBulkEquals = function (r1, r2) {
                if (r1.length !== r2.length) {
                    return false;
                }
                this.residueBulkSort(r1);
                this.residueBulkSort(r2);
                for (var idx = 0; idx < r1.length; idx++) {
                    if (this.residueLightEquals({ type: "light", info: r1[idx] }, { type: "light", info: r2[idx] })) {
                        return false;
                    }
                }
                return true;
            };
            SelectionHelper.selectResiduesBulkWithBallsAndSticks = function (plugin, residues) {
                CommonUtils.Selection.SelectionHelper.clearSelectionPrivate(plugin);
                this.selectedChannelRef = void 0;
                this.selectedChannelData = void 0;
                this.selectedChannelId = void 0;
                this.selectedBulkResidues = void 0;
                this.clearSelectedPoints();
                //this.resetScene(plugin);           
                if (this.selectedBulkResidues !== void 0) {
                    if (this.residueBulkEquals(residues, this.selectedBulkResidues)) {
                        return;
                    }
                }
                var queries = [];
                for (var _i = 0, residues_3 = residues; _i < residues_3.length; _i++) {
                    var residue = residues_3[_i];
                    queries.push((_a = LiteMol.Core.Structure.Query).chainsById.apply(_a, [residue.chain.authAsymId]).intersectWith((_b = LiteMol.Core.Structure.Query).residues.apply(_b, [{ authSeqNumber: residue.authSeqNumber }])).compile());
                }
                var query = (_c = LiteMol.Core.Structure.Query).or.apply(_c, queries);
                var t = plugin.createTransform();
                var visualStyle = LiteMol.Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks');
                if (visualStyle !== void 0) {
                    visualStyle.taskType = "Silent";
                }
                t.add('polymer-visual', Transformer.Molecule.CreateSelectionFromQuery, { query: query, name: 'Residues', silent: true }, { ref: CommonUtils.Selection.SelectionHelper.getSelectionVisualRef(), isHidden: true })
                    .then(Transformer.Molecule.CreateVisual, { style: visualStyle }, { isHidden: true });
                plugin.applyTransform(t);
                /*.then(()=>{
                    //LiteMol.Bootstrap.Command.Entity.Focus.dispatch(plugin.context, plugin.context.select(CommonUtils.Selection.SelectionHelper.getSelectionVisualRef()));
                }); */
                if (residues.length > 0) {
                    this.selectedBulkResidues = residues;
                }
                else {
                    this.selectedBulkResidues = void 0;
                }
                this.invokeOnResidueBulkSelectHandlers(residues);
                var _a, _b, _c;
            };
            SelectionHelper.getSelectedResidues = function () {
                if (this.selectedBulkResidues !== void 0) {
                    return this.selectedBulkResidues.map(function (val, idx, arr) {
                        return { type: "light", info: val };
                    });
                }
                return [];
            };
            SelectionHelper.getSelectedPoints = function () {
                if (this.selectedPoints !== void 0) {
                    return this.selectedPoints;
                }
                return [];
            };
            SelectionHelper.residueToLight = function (residue) {
                return {
                    type: "light",
                    info: {
                        chain: residue.info.chain,
                        authSeqNumber: residue.info.authSeqNumber
                    }
                };
            };
            SelectionHelper.residueLightEquals = function (r1, r2) {
                if ((!this.chainLightEquals(r1.info.chain, r2.info.chain))
                    || r1.info.authSeqNumber !== r2.info.authSeqNumber) {
                    return false;
                }
                return true;
            };
            SelectionHelper.chainLightEquals = function (c1, c2) {
                return (c1.authAsymId === c2.authAsymId);
            };
            SelectionHelper.isSelectedAnyChannel = function () {
                return this.selectedChannelRef !== void 0;
            };
            SelectionHelper.isSelectedAny = function () {
                return this.isSelectedAnyChannel() /*|| this.selectedResidue !== void 0*/ || this.selectedBulkResidues !== void 0 || this.selectedPoints !== void 0;
            };
            /**
             *
             * @param seqNumber
             * @param chain
             * @return True - residue selected | False - residue deselected
             */
            SelectionHelper.addResidueToSelection = function (seqNumber, chain) {
                var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                var residues = CommonUtils.Selection.SelectionHelper.getSelectedResidues();
                var newSelection = [];
                var deselectMode = false;
                for (var _i = 0, residues_4 = residues; _i < residues_4.length; _i++) {
                    var r = residues_4[_i];
                    if (r.info.authSeqNumber === seqNumber && r.info.chain.authAsymId === chain) {
                        deselectMode = true;
                        continue;
                    }
                    newSelection.push(r.info);
                }
                if (!deselectMode) {
                    newSelection.push({ authSeqNumber: seqNumber, chain: { authAsymId: chain } });
                }
                if (newSelection.length > 0) {
                    this.selectResiduesBulkWithBallsAndSticks(plugin, newSelection);
                }
                else {
                    this.clearSelection(plugin);
                }
                return !deselectMode;
            };
            /**
             *
             * @param residues
             * @param doRemove specifies wheter or not remove residues contained in both current selection and new selection. By default - true
             */
            SelectionHelper.addResiduesToSelection = function (residues, doRemove) {
                doRemove = (doRemove === void 0) ? true : doRemove;
                var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                var currentResidues = CommonUtils.Selection.SelectionHelper.getSelectedResidues();
                var newSelection = [];
                var contains = function (res, array) {
                    for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
                        var i = array_1[_i];
                        if (i.info.authSeqNumber === res.authSeqNumber && i.info.chain.authAsymId === res.chain.authAsymId) {
                            return true;
                        }
                    }
                    return false;
                };
                var toRemove = [];
                for (var _i = 0, residues_5 = residues; _i < residues_5.length; _i++) {
                    var r = residues_5[_i];
                    if (contains(r, currentResidues)) {
                        toRemove.push({ type: "light", info: r });
                        continue;
                    }
                    newSelection.push(r);
                }
                if (toRemove.length > 0 && doRemove) {
                    for (var _a = 0, currentResidues_1 = currentResidues; _a < currentResidues_1.length; _a++) {
                        var r = currentResidues_1[_a];
                        if (!contains(r.info, toRemove)) {
                            newSelection.push({ authSeqNumber: r.info.authSeqNumber, chain: { authAsymId: r.info.chain.authAsymId } });
                        }
                    }
                }
                else {
                    newSelection = newSelection.concat(currentResidues.map(function (val, idx, arr) {
                        return val.info;
                    }));
                }
                if (newSelection.length > 0) {
                    this.selectResiduesBulkWithBallsAndSticks(plugin, newSelection);
                }
                else {
                    this.clearSelection(plugin);
                }
            };
            SelectionHelper.isSelected = function (residue) {
                if (this.selectedBulkResidues === void 0) {
                    return false;
                }
                for (var _i = 0, _a = this.selectedBulkResidues; _i < _a.length; _i++) {
                    var r = _a[_i];
                    if (this.residueLightEquals(this.residueToLight({ type: "full", info: residue }), { type: "light", info: r })) {
                        return true;
                    }
                }
                return false;
            };
            /**
             *
             * @param point
             * @return True - point selected | False - point deselected
             */
            SelectionHelper.addPointToSelection = function (point) {
                var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                var points = CommonUtils.Selection.SelectionHelper.getSelectedPoints();
                var newSelection = [];
                var deselectMode = false;
                for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
                    var p = points_1[_i];
                    if (p.x === point.x && p.y === point.y && p.z === point.z) {
                        deselectMode = true;
                        continue;
                    }
                    newSelection.push(p);
                }
                if (!deselectMode) {
                    newSelection.push(point);
                }
                if (newSelection.length > 0) {
                    this.selectPoints(newSelection);
                }
                else {
                    this.clearSelection(plugin);
                    this.clearSelectedPoints();
                    this.invokeOnPointSelectHandlers([]);
                }
                return !deselectMode;
            };
            SelectionHelper.isSelectedPoint = function (point) {
                if (this.selectedPoints === void 0) {
                    return false;
                }
                for (var _i = 0, _a = this.selectedPoints; _i < _a.length; _i++) {
                    var p = _a[_i];
                    if (p.x === point.x && p.y === point.y && p.z === point.z) {
                        return true;
                    }
                }
                return false;
            };
            SelectionHelper.clearSelectedPoints = function () {
                var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                plugin.command(LiteMol.Bootstrap.Command.Tree.RemoveNode, "point-selection");
                this.selectedPoints = void 0;
            };
            SelectionHelper.clearSelectedTPoint = function () {
                var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                plugin.command(LiteMol.Bootstrap.Command.Tree.RemoveNode, "point-selection-T");
                this.selectedTPoint = void 0;
            };
            SelectionHelper.createPointsSelectionVisual = function (points) {
                var s = LiteMol.Visualization.Primitive.Builder.create();
                var id = 0;
                for (var _i = 0, points_2 = points; _i < points_2.length; _i++) {
                    var p = points_2[_i];
                    s.add({ type: 'Sphere', id: id++, radius: 1.69, center: [Number(p.x), Number(p.y), Number(p.z)] });
                }
                var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                this.clearSelectedPoints();
                s.buildSurface().run().then(function (surface) {
                    var t = plugin.createTransform()
                        .add('mole-data', LiteMol.Example.Channels.State.CreateSurface, {
                        //label: 'Selected points (' + origins.Type + ')',
                        tag: { kind: 'Points', element: points },
                        surface: surface,
                        isInteractive: true,
                        color: MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Colors.get(MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Enum.SyntethicSelect)
                    }, { ref: "point-selection", isHidden: true });
                    plugin.applyTransform(t);
                });
            };
            SelectionHelper.createTPointSelectionVisual = function (point) {
                var s = LiteMol.Visualization.Primitive.Builder.create();
                var id = 0;
                s.add({ type: 'Sphere', id: id++, radius: 1.69, center: [point.X, point.Y, point.Z] });
                var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                this.clearSelectedTPoint();
                s.buildSurface().run().then(function (surface) {
                    var t = plugin.createTransform()
                        .add('mole-data', LiteMol.Example.Channels.State.CreateSurface, {
                        //label: 'Selected points (' + origins.Type + ')',
                        tag: { kind: 'TPoint', element: point },
                        surface: surface,
                        isInteractive: true,
                        color: MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Colors.get(MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Enum.TPoint)
                    }, { ref: "point-selection-T", isHidden: true });
                    plugin.applyTransform(t);
                });
            };
            SelectionHelper.selectPoints = function (points) {
                var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                CommonUtils.Selection.SelectionHelper.clearSelectionPrivate(plugin);
                this.selectedChannelRef = void 0;
                this.selectedChannelData = void 0;
                this.selectedChannelId = void 0;
                this.selectedBulkResidues = void 0;
                this.selectedPoints = void 0;
                this.createPointsSelectionVisual(points);
                this.selectedPoints = points;
                this.invokeOnPointSelectHandlers(points);
            };
            SelectionHelper.getSelectedChannelData = function () {
                return (this.selectedChannelData === void 0) ? null : this.selectedChannelData;
            };
            SelectionHelper.getSelectedChannelRef = function () {
                return (this.selectedChannelRef === void 0) ? "" : this.selectedChannelRef;
            };
            SelectionHelper.getSelectedChannelId = function () {
                return (this.selectedChannelId === void 0) ? "" : this.selectedChannelId;
            };
            SelectionHelper.attachSelectionHelperHandlerToEventHandler = function (plugin) {
                var _this = this;
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(function () {
                    _this.clearSelection(MoleOnlineWebUI.Bridge.Instances.getPlugin());
                });
                this.attachOnResidueBulkSelectHandler(function (residues) {
                    var ref = "residue-selection-T";
                    if (residues.length > 0) {
                        var centerOfMass = CommonUtils.Residues.getCenterOfMass(residues.map(function (val, idx, arr) {
                            return {
                                Chain: val.chain.authAsymId,
                                SequenceNumber: val.authSeqNumber
                            };
                        }));
                        if (centerOfMass === null) {
                            return;
                        }
                        _this.selectedTPoint = centerOfMass;
                        _this.createTPointSelectionVisual(centerOfMass);
                    }
                    else {
                        _this.clearSelectedTPoint();
                    }
                });
                //Residue 3D OnClick
                plugin.subscribe(LiteMol.Bootstrap.Event.Molecule.ModelSelect, function (e) {
                    if (!!e.data) {
                        var r = e.data.residues[0];
                        CommonUtils.Selection.SelectionHelper.addResidueToSelection(r.authSeqNumber, r.chain.authAsymId);
                    }
                });
                LiteMol.Example.Channels.Behaviour.initCavityBoundaryToggle(plugin);
                LiteMol.Example.Channels.Behaviour.createSelectEvent(plugin).subscribe(function (e) {
                    if ((e.kind === 'nothing') || (e.kind === 'molecule')) {
                        return;
                    }
                    else if (e.kind === 'point') {
                        _this.addPointToSelection({ x: "" + e.data[0].toFixed(2), y: "" + e.data[1].toFixed(2), z: "" + e.data[2].toFixed(2) });
                    }
                });
                this.interactionEventStream = LiteMol.Bootstrap.Event.Visual.VisualSelectElement.getStream(plugin.context)
                    .subscribe(function (e) { return _this.interactionHandler('select', e.data, plugin); });
            };
            SelectionHelper.interactionHandler = function (type, i, plugin) {
                //console.log("SelectionHelper: Caught-SelectEvent");
                if (!i || i.source == null || i.source.ref === void 0 || i.source.props === void 0 || i.source.props.tag === void 0) {
                    //console.log("SelectionHelper: Event incomplete - ignoring");
                    return;
                }
                //Unsupported types
                if (i.source.props.tag.kind === "Cavity-inner" || i.source.props.tag.kind === "Cavity-boundary") {
                    return;
                }
                if (i.source.props.tag.kind === "Points") {
                    var data = i.source.props.tag.element;
                    if (i.elements === void 0) {
                        return;
                    }
                    if (this.selectedBulkResidues !== void 0) {
                        this.selectResiduesBulkWithBallsAndSticks(plugin, []);
                    }
                    for (var _i = 0, _a = i.elements; _i < _a.length; _i++) {
                        var elIdx = _a[_i];
                        this.addPointToSelection(data[elIdx]);
                    }
                    return;
                }
                if (i.source.props.tag.kind === "TPoint") {
                    var data = i.source.props.tag.element;
                    if (i.elements === void 0) {
                        return;
                    }
                    if (this.selectedBulkResidues !== void 0) {
                        this.selectResiduesBulkWithBallsAndSticks(plugin, []);
                    }
                    for (var _b = 0, _c = i.elements; _b < _c.length; _b++) {
                        var elIdx = _c[_b];
                        var p = data;
                        this.addPointToSelection({ x: "" + Number(p.X).toFixed(2), y: "" + Number(p.Y).toFixed(2), z: "" + Number(p.Z).toFixed(2) });
                    }
                    return;
                }
                if (i.source.props.tag.kind === "Origins") {
                    var data = i.source.props.tag.element;
                    if (i.elements === void 0) {
                        return;
                    }
                    for (var _d = 0, _e = i.elements; _d < _e.length; _d++) {
                        var elIdx = _e[_d];
                        var p = data.Points[elIdx];
                        var pPto = { x: Number(p.X).toFixed(2), y: Number(p.Y).toFixed(2), z: Number(p.Z).toFixed(2) };
                        this.addPointToSelection(pPto);
                    }
                    return;
                }
                if (this.selectedPoints !== void 0) {
                    this.clearSelectionPrivate(plugin);
                    this.clearSelectedPoints();
                }
                if (this.selectedBulkResidues !== void 0) {
                    //console.log("selected channel - clearing residues");
                    this.clearSelectionPrivate(plugin);
                    LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, this.SELECTION_VISUAL_REF);
                    this.selectedBulkResidues = void 0;
                    //return;
                }
                if ((this.selectedChannelRef !== void 0) && (this.selectedChannelRef === i.source.ref)) {
                    //console.log("double clicked on tunel - deselecting");
                    this.clearSelectionPrivate(plugin);
                    this.selectedChannelRef = void 0;
                    this.selectedChannelData = void 0;
                    this.selectedChannelId = void 0;
                    this.invokeOnChannelDeselectHandlers();
                    //return;
                }
                else {
                    //console.log("Channel selected");
                    if (this.selectedChannelRef !== void 0 && this.selectedChannelRef !== i.source.ref) {
                        deselectTunnelByRef(plugin, this.selectedChannelRef);
                    }
                    else {
                        //Trigger Sequence Viewer to deselect selected residues
                        this.clearSelection(plugin);
                    }
                    this.selectedChannelRef = i.source.ref;
                    this.selectedChannelData = i.source.props.tag.element.Layers;
                    this.selectedChannelId = i.source.props.tag.element.Id;
                    if (this.selectedChannelData !== void 0) {
                        selectTunnelByRef(plugin, this.selectedChannelRef);
                        this.clearAltSelection(plugin);
                        this.invokeOnChannelSelectHandlers(this.selectedChannelData, this.selectedChannelId);
                    }
                    //return;
                }
                //console.log("SelectionHelper: SelectEvent from code - ignoring ");
            };
            return SelectionHelper;
        }());
        SelectionHelper.SELECTION_VISUAL_REF = "res_visual";
        SelectionHelper.SELECTION_ALT_VISUAL_REF = "alt_res_visual";
        SelectionHelper.interactionEventStream = void 0;
        Selection.SelectionHelper = SelectionHelper;
        function getIndices(v) {
            if (v.props.model.surface === void 0) {
                return [];
            }
            return v.props.model.surface.triangleIndices;
        }
        Selection.getIndices = getIndices;
        function selectTunnelByRef(plugin, ref) {
            var entities = plugin.selectEntities(ref);
            var v = entities[0];
            if (LiteMol.Bootstrap.Entity.isVisual(entities[0]) && v.props.isSelectable) {
                v.props.model.applySelection(getIndices(v), 1 /* Select */);
            }
        }
        function deselectTunnelByRef(plugin, ref) {
            var entities = plugin.selectEntities(ref);
            var v = entities[0];
            if (LiteMol.Bootstrap.Entity.isVisual(entities[0]) && v.props.isSelectable) {
                v.props.model.applySelection(getIndices(v), 2 /* RemoveSelect */);
            }
        }
    })(Selection = CommonUtils.Selection || (CommonUtils.Selection = {}));
})(CommonUtils || (CommonUtils = {}));
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
var CommonUtils;
(function (CommonUtils) {
    var Tabs;
    (function (Tabs) {
        function getTabLinkById(tabbedElementId, tabId) {
            var tabs = $("#" + tabbedElementId + " li a");
            for (var _i = 0, tabs_1 = tabs; _i < tabs_1.length; _i++) {
                var t = tabs_1[_i];
                if ($(t).attr('href') === "#" + tabbedElementId + "-" + tabId) {
                    return $(t);
                }
            }
        }
        Tabs.getTabLinkById = getTabLinkById;
        function isActive(tabbedElementId, tabId) {
            return getTabLinkById(tabbedElementId, tabId).parent().attr("class").indexOf("active") >= 0;
        }
        Tabs.isActive = isActive;
        function activateTab(tabbedElementId, tabId) {
            getTabLinkById(tabbedElementId, tabId).click();
        }
        Tabs.activateTab = activateTab;
        function doAfterTabActivated(tabbedElementId, tabId, callback) {
            var checker = function () {
                var link = getTabLinkById(tabbedElementId, tabId);
                var href = link.attr("href");
                if (link.parent().attr("class").indexOf("active") >= 0 && $(href).css("display") !== "none") {
                    callback();
                }
                else {
                    window.setTimeout(checker, 10);
                }
            };
            window.setTimeout(checker, 10);
        }
        Tabs.doAfterTabActivated = doAfterTabActivated;
    })(Tabs = CommonUtils.Tabs || (CommonUtils.Tabs = {}));
})(CommonUtils || (CommonUtils = {}));
var CommonUtils;
(function (CommonUtils) {
    var Tooltips = (function () {
        function Tooltips() {
        }
        Tooltips.checkLoop = function () {
            var _this = this;
            if (this.checkedElements.size > 0) {
                window.setTimeout(function () {
                    var finished = [];
                    _this.checkedElements.forEach(function (val, key, map) {
                        if (_this.checkElement(key)) {
                            finished.push(key);
                            if (Config.CommonOptions.DEBUG_MODE)
                                console.log('tooltip for ' + key + ' is initialized');
                        }
                    });
                    for (var _i = 0, finished_1 = finished; _i < finished_1.length; _i++) {
                        var elementId = finished_1[_i];
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log('tooltipInit: removing ' + elementId + ' from loop');
                        _this.checkedElements.delete(elementId);
                    }
                });
            }
        };
        Tooltips.checkElement = function (elementId) {
            if ($("#" + elementId).length === 0) {
                return false;
            }
            $("#" + elementId).tooltip();
            return true;
        };
        Tooltips.initWhenReady = function (elementId) {
            this.checkedElements.set(elementId, elementId);
            this.checkLoop();
        };
        Tooltips.initImmediate = function (element, content) {
            if ($(element).length === 0) {
                return false;
            }
            if (content !== void 0) {
                $(element).tooltip({ content: content });
            }
            else {
                $(element).tooltip();
            }
            return true;
        };
        Tooltips.destroy = function (element) {
            if ($(element).length === 0) {
                return false;
            }
            $(element).tooltip("destroy");
            return true;
        };
        return Tooltips;
    }());
    Tooltips.checkedElements = new Map();
    CommonUtils.Tooltips = Tooltips;
})(CommonUtils || (CommonUtils = {}));
var CommonUtils;
(function (CommonUtils) {
    var Misc;
    (function (Misc) {
        function dataURItoBlob(dataURI) {
            // convert base64 to raw binary data held in a string
            // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
            var byteString = atob(dataURI.split(',')[1]);
            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            // write the bytes of the string to an ArrayBuffer
            var ab = new ArrayBuffer(byteString.length);
            var dw = new DataView(ab);
            for (var i = 0; i < byteString.length; i++) {
                dw.setUint8(i, byteString.charCodeAt(i));
            }
            // write the ArrayBuffer to a blob, and you're done
            return new Blob([ab], { type: mimeString });
        }
        Misc.dataURItoBlob = dataURItoBlob;
        function triggerDownload(dataUrl, fileName) {
            var a = document.createElement("a");
            document.body.appendChild(a);
            $(a).css("display", "none");
            a.href = dataUrl;
            a.download = fileName;
            a.click();
            setTimeout(function () { return a.remove(); }, 20000);
        }
        Misc.triggerDownload = triggerDownload;
        function flattenResiduesArray(residuesArray) {
            var rv = "";
            var idx = 0;
            for (var _i = 0, residuesArray_1 = residuesArray; _i < residuesArray_1.length; _i++) {
                var array = residuesArray_1[_i];
                if (idx > 0) {
                    rv = rv + ", ";
                }
                rv = rv + "[" + flattenResidues(array) + "]";
                idx++;
            }
            return rv;
        }
        Misc.flattenResiduesArray = flattenResiduesArray;
        function flattenResidues(residues) {
            var rv = "";
            for (var _i = 0, residues_6 = residues; _i < residues_6.length; _i++) {
                var r = residues_6[_i];
                if (rv !== "") {
                    rv += ", ";
                }
                rv += r.Chain + " " + r.SequenceNumber;
            }
            return rv;
        }
        Misc.flattenResidues = flattenResidues;
        function flattenPoints(pointsArray) {
            var rv = "";
            for (var _i = 0, pointsArray_1 = pointsArray; _i < pointsArray_1.length; _i++) {
                var p = pointsArray_1[_i];
                var group = "[" + p.x + "," + p.y + "," + p.z + "]";
                if (rv.length !== 0) {
                    rv += ",";
                }
                rv += group;
            }
            return rv;
        }
        Misc.flattenPoints = flattenPoints;
        function pointsToString(points) {
            var rv = "";
            for (var _i = 0, points_3 = points; _i < points_3.length; _i++) {
                var p = points_3[_i];
                if (rv !== "") {
                    rv += ",";
                }
                rv += "[" + p.X + "," + p.Y + "," + p.Z + "]";
            }
            return rv;
        }
        Misc.pointsToString = pointsToString;
        function isMoleJob(data) {
            if (data.MoleConfig === void 0 || data.MoleConfig === null) {
                return false;
            }
            var c = data.MoleConfig;
            return !(c.Cavity === void 0
                && c.CustomExits === void 0
                && c.Input === void 0
                && c.NonActiveResidues === void 0
                && c.Origin === void 0
                && c.PoresAuto === void 0
                && c.PoresMerged === void 0
                && c.QueryFilter === void 0
                && c.Tunnel === void 0);
        }
        Misc.isMoleJob = isMoleJob;
        function parseChainsArray(value) {
            if (value.length === 0) {
                return "";
            }
            value = value.replace(/\s*,\s*/g, ",");
            value = value.replace(/\s*$/g, '');
            value = value.replace(/^\s*/g, '');
            var chains = value.split(",");
            var rv = "";
            var idx = 0;
            for (var _i = 0, chains_1 = chains; _i < chains_1.length; _i++) {
                var chain = chains_1[_i];
                if (idx !== 0) {
                    rv += ',';
                }
                rv += chain;
                idx++;
            }
            return rv;
        }
        Misc.parseChainsArray = parseChainsArray;
        function parseResiduesArray(residuesArray) {
            if (residuesArray === void 0) {
                return [];
            }
            residuesArray = residuesArray.replace(/\]\s*,\s*\[/g, "],[");
            var parts = residuesArray.split("],[");
            var rv = [];
            for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
                var part = parts_1[_i];
                part = part.replace(/\[/g, "");
                part = part.replace(/\]/g, "");
                rv.push(parseResidues(part));
            }
            return rv;
        }
        Misc.parseResiduesArray = parseResiduesArray;
        function parseResidues(residues) {
            if (residues === void 0) {
                return [];
            }
            residues = residues.replace(/\s*,\s*/g, ",");
            var items = residues.split(',');
            var rv = [];
            var seqNumReg = new RegExp(/^[0-9]+$/);
            var chainReg = new RegExp(/^[A-Z][\-][\d]*$|^[A-Z]{1}$/);
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var item = items_1[_i];
                var r = item.split(' ');
                var seqNum = void 0;
                var chain = void 0;
                for (var _a = 0, r_1 = r; _a < r_1.length; _a++) {
                    var part = r_1[_a];
                    if (seqNumReg.test(part)) {
                        seqNum = Number(part);
                        continue;
                    }
                    if (chainReg.test(part)) {
                        chain = part;
                        continue;
                    }
                }
                if (chain !== void 0 && seqNum !== void 0) {
                    rv.push({
                        Chain: chain,
                        SequenceNumber: seqNum
                    });
                }
            }
            return rv;
        }
        Misc.parseResidues = parseResidues;
        function parsePoint(value) {
            if (value === void 0) {
                return void 0;
            }
            value = value.replace(/\s*,\s*/g, ",");
            var parts = value.split(",");
            var x = Number(parts[0]);
            var y = Number(parts[1]);
            var z = Number(parts[2]);
            if (isNaN(x) || isNaN(y) || isNaN(z)) {
                return void 0;
            }
            return {
                x: parts[0],
                y: parts[1],
                z: parts[2]
            };
        }
        Misc.parsePoint = parsePoint;
        function removeMultipleWSp(value) {
            var v = value.replace(/\s+/g, " ");
            v = v.replace(/\s*$/g, '');
            v = v.replace(/^\s*/g, '');
            return v;
        }
        Misc.removeMultipleWSp = removeMultipleWSp;
        function parsePoints(value) {
            value = value.replace(/\]\s*,\s*\[/g, "],[");
            value = removeMultipleWSp(value);
            var parts = value.split("],[");
            var rv = [];
            for (var _i = 0, parts_2 = parts; _i < parts_2.length; _i++) {
                var part = parts_2[_i];
                part = part.replace(/\[/g, "");
                part = part.replace(/\]/g, "");
                var point = parsePoint(part);
                if (point !== void 0) {
                    rv.push(point);
                }
            }
            return rv;
        }
        Misc.parsePoints = parsePoints;
    })(Misc = CommonUtils.Misc || (CommonUtils.Misc = {}));
})(CommonUtils || (CommonUtils = {}));
var CommonUtils;
(function (CommonUtils) {
    var FormEvents;
    (function (FormEvents) {
        var Events = (function () {
            function Events() {
            }
            Events.attachOnClearEventHandler = function (h) {
                this.handlers_onClear.push(h);
            };
            Events.invokeOnClear = function (formGroup) {
                for (var _i = 0, _a = this.handlers_onClear; _i < _a.length; _i++) {
                    var h = _a[_i];
                    h(formGroup);
                }
            };
            Events.attachOnSubmitEventHandler = function (h) {
                this.handlers_onSubmit.push(h);
            };
            Events.invokeOnSubmit = function (formGroup) {
                for (var _i = 0, _a = this.handlers_onSubmit; _i < _a.length; _i++) {
                    var h = _a[_i];
                    h(formGroup);
                }
            };
            return Events;
        }());
        Events.handlers_onClear = [];
        //--
        Events.handlers_onSubmit = [];
        FormEvents.Events = Events;
    })(FormEvents = CommonUtils.FormEvents || (CommonUtils.FormEvents = {}));
})(CommonUtils || (CommonUtils = {}));
var CommonUtils;
(function (CommonUtils) {
    var Validators;
    (function (Validators) {
        function validateChainsArray(value) {
            return new Promise(function (res, rej) {
                if (value.length === 0) {
                    res({ valid: true, message: "" });
                }
                var reg = new RegExp(/^[A-Z][\-][\d]*$|^[A-Z]{1}$/);
                value = value.replace(/\s*,\s*/g, ",");
                value = value.replace(/\s*$/g, '');
                value = value.replace(/^\s*/g, '');
                var chains = value.split(",");
                var valid = true;
                for (var _i = 0, chains_2 = chains; _i < chains_2.length; _i++) {
                    var chain = chains_2[_i];
                    valid = valid && reg.test(chain);
                }
                res({
                    valid: valid,
                    message: (!valid) ? "List of chains is not in readable format!" : ""
                });
            });
        }
        Validators.validateChainsArray = validateChainsArray;
        function validateResidueSimpleArray(value) {
            return new Promise(function (res, rej) {
                if (value.length === 0) {
                    res({ valid: true, message: "" });
                }
                var expectedCount = value.split(',').length;
                var valid = CommonUtils.Misc.parseResidues(value).length === expectedCount;
                res({
                    valid: valid,
                    message: (!valid) ? "List of resiudes is not in readable format!" : ""
                });
            });
        }
        Validators.validateResidueSimpleArray = validateResidueSimpleArray;
        function validatePoints(value) {
            return new Promise(function (res, rej) {
                if (value.length === 0) {
                    res({ valid: true, message: "" });
                }
                var v = CommonUtils.Misc.removeMultipleWSp(value);
                var expectedCount = v.split('],[').length;
                var valid = CommonUtils.Misc.parsePoints(value).length === expectedCount;
                res({
                    valid: valid,
                    message: (!valid) ? "List of points is not in readable format!" : ""
                });
            });
        }
        Validators.validatePoints = validatePoints;
        function validateResidueDoubleArray(value) {
            return new Promise(function (res, rej) {
                if (value.length === 0) {
                    res({ valid: true, message: "" });
                }
                value = value.replace(/\]\s*,\s*\[/g, '],[');
                var arrays = value.split("],[");
                var expectedCount = value.split(',').length;
                var valid = true;
                var residuesArray = CommonUtils.Misc.parseResiduesArray(value);
                if (residuesArray.length !== arrays.length) {
                    valid = false;
                }
                else {
                    for (var i = 0; i < residuesArray.length; i++) {
                        valid = valid && arrays[i].split(",").length === residuesArray[i].length;
                        if (!valid) {
                            break;
                        }
                    }
                }
                res({
                    valid: valid,
                    message: (!valid) ? "Invalid syntax! Should be [A 69, ...], [A 137, ...], ..." : ""
                });
            });
        }
        Validators.validateResidueDoubleArray = validateResidueDoubleArray;
        function validatePatternQuery(v) {
            return new Promise(function (res, rej) {
                if (v.length === 0) {
                    res({ valid: true });
                }
                MoleOnlineWebUI.Service.PatternQueryAPI.ApiService.getValidationResult(v)
                    .then(function (result) {
                    if (result.isOk) {
                        res({ valid: true });
                    }
                    else {
                        res({ valid: false, message: (result.error === void 0) ? "" : result.error });
                    }
                })
                    .catch(function (err) {
                    rej(err);
                });
            });
        }
        Validators.validatePatternQuery = validatePatternQuery;
    })(Validators = CommonUtils.Validators || (CommonUtils.Validators = {}));
})(CommonUtils || (CommonUtils = {}));
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
var MoleOnlineWebUI;
(function (MoleOnlineWebUI) {
    var StaticData;
    (function (StaticData) {
        var Bundle = (function () {
            function Bundle() {
            }
            Bundle.get = function (key) {
                var value = this.bundle[key];
                if (value === void 0) {
                    return key;
                }
                return value;
            };
            return Bundle;
        }());
        Bundle.bundle = {
            /* Submit Form */
            "VoronoiScale": "Voronoi scale",
            "Length": "Length",
            "LengthAndRadius": "Length and radius",
            /* LV Labels */
            "NumPositives": "Charge(+)",
            "NumNegatives": "Charge(-)",
            "MinRadius": "Radius",
            "MinBRadius": "BRadius",
            "MinFreeRadius": "Free Radius",
            /* Tooltips data */
            "tooltip-MinRadius": "Radius of sphere within channel limited by three closest atoms",
            "tooltip-MinBRadius": "BRadius",
            "tooltip-MinFreeRadius": "Radius of sphere within channel limited by three closest main chain atoms in order to allow sidechain flexibility",
            "tooltip-Bottleneck": "Radius of channel bottleneck",
            "tooltip-Length": "Length of the channel",
            "tooltip-Hydropathy": "Hydropathy index of amino acid according to Kyte and Doolittle J.Mol.Biol.(1982) 157, 105-132. Range from the most hydrophilic (Arg = -4.5) to the most hydrophobic (Ile = 4.5)",
            "tooltip-Hydrophobicity": "Normalized hydrophobicity scale by Cid et al. J. Protein Engineering (1992) 5, 373-375. Range from the most hydrophilic (Glu = -1.140) to the most hydrophobic (Ile = 1.810)",
            "tooltip-Polarity": "Lining amino acid polarity by Zimmermann et al. J. Theor. Biol. (1968) 21, 170-201. Polarity ranges from nonpolar (Ala, Gly = 0) tthrough polar (e.g. Ser = 1.67) to charged (Glu = 49.90, Arg = 52.00)",
            "tooltip-Mutability": "Relative mutability index by Jones, D.T. et al. Compur. Appl. Biosci. (1992) 8(3): 275-282. Realtive mutability based on empirical substitution matrices between similar protein sequences. High for easily substitutable amino acids, e.g. polars (Ser = 117, Thr = 107, Asn = 104) or aliphatics (Ala = 100, Val = 98, Ile = 103). Low for important structural amino acids, e.g. aromatics (Trp = 25, Phe = 51, Tyr = 50) or specials (Cys = 44, Pro = 58, Gly = 50).",
            "tooltip-LogP": "Lipophilicity - octanol/water partition coefficient (logP) of channel-surrounding fragments",
            "tooltip-LogD": "Lipophilicity - octanol/water distribution coefficient (logD) of channel-surrounding fragments",
            "tooltip-LogS": "Solubility - water solubility (logS) of channel-surrounding fragments",
            "tooltip-Ionizable": "Ionizable residues",
            "tooltip-BRadius": "Flexible radius taking into account local flexibility (RMSF) from B factors",
            "tooltip-agl-Hydropathy": "Average of hydropathy index per each amino acid according to Kyte and Doolittle J.Mol.Biol.(1982) 157, 105-132. Range from the most hydrophilic (Arg = -4.5) to the most hydrophobic (Ile = 4.5)",
            "tooltip-agl-Hydrophobicity": "Average of normalized hydrophobicity scales by Cid et al. J. Protein Engineering (1992) 5, 373-375. Range from the most hydrophilic (Glu = -1.140) to the most hydrophobic (Ile = 1.810)",
            "tooltip-agl-Polarity": "Average of lining amino acid polarities by Zimmermann et al. J. Theor. Biol. (1968) 21, 170-201. Polarity ranges from nonpolar (Ala, Gly = 0) tthrough polar (e.g. Ser = 1.67) to charged (Glu = 49.90, Arg = 52.00)",
            "tooltip-agl-Mutability": "Average of relative mutability index by Jones, D.T. et al. Compur. Appl. Biosci. (1992) 8(3): 275-282. Realtive mutability based on empirical substitution matrices between similar protein sequences. High for easily substitutable amino acids, e.g. polars (Ser = 117, Thr = 107, Asn = 104) or aliphatics (Ala = 100, Val = 98, Ile = 103). Low for important structural amino acids, e.g. aromatics (Trp = 25, Phe = 51, Tyr = 50) or specials (Cys = 44, Pro = 58, Gly = 50).",
            "tooltip-agl-Charge": "Charge",
            "tooltip-agl-LogP": "Lipophilicity - octanol/water partition coefficient (logP) of channel-surrounding fragments",
            "tooltip-agl-LogD": "Lipophilicity - octanol/water distribution coefficient (logD) of channel-surrounding fragments",
            "tooltip-agl-LogS": "Solubility - water solubility (logS) of channel-surrounding fragments",
            "tooltip-agl-Ionizable": "Ionizable residues",
            "tooltip-agl-BRadius": "Flexible radius taking into account local flexibility (RMSF) from B factors",
            "tooltip-NumPositives": "",
            "tooltip-NumNegatives": "",
            "tooltip-Charge": "",
            "tooltip-specificChains": "Specific chains - Select chains to be included in computation. No value, all is included.",
            "tooltip-nonActiveResidues": "Ignored residues - List residues to be discarded prior to the calculation.",
            "tooltip-queryFilter": "Query filter - Enter PatternQuery expression for discarding parts of the structure.",
            "tooltip-readAllModels": "Read all models - If not checked just a first model is considered for computation.",
            "tooltip-ignoreHydrogens": "Ignore hydrogens - All hydrogens will be discarded from the computation.",
            "tooltip-ignoreAllHetatm": "Ignore HETATMs - All HETATMs will be discarded from the computation.",
            "tooltip-probeRadius": "Probe radius - Used to determine the molecular surface. Upper bound of a channel radius",
            "tooltip-interiorTreshold": "Interior threshold - Used to determine individual cavities. Lower bound of a channel radius",
            "tooltip-originRadius": "Origin radius - Determines how far to search for cavity from a starting point.",
            "tooltip-surfaceCoverRadius": "Surface cover radius - The density of the tunnel exits on the molecular surface.",
            "tooltip-tunnelWeightFunction": "Weight function - Weight function to compute channels. See documentation for details.",
            "tooltip-bottleneckRadius": "Bottleneck radius - Minimum radius of a channel",
            "tooltip-bottleneckTolerance": "Bottleneck tolerance - Maximum length of a channel segment narrower than bottleneck radius",
            "tooltip-maxTunnelSimilarity": "Max tunnel similarity - Determine when to remove channels that are too similar. The longer is discarded",
            "tooltip-mergePores": "Merge pores - Merge computed tunnels into pores.",
            "tooltip-automaticPores": "Automatic pores - Compute pores from exits in all cavities.",
            "tooltip-csaActiveSites": "Active sites from CSA - List of annotated active sites from the CSA database",
            "tooltip-startingPoint": "Starting point - Select one or many channel starting points",
            "tooltip-endPoint": "End point - (Optional) Select one or many channel end points",
            "tooltip-queryExpresion": "Query - Define start points with PatternQuery language expression",
            "tooltip-poresIsBetaStructure": "Beta structure - is this protein formed largely from beta sheets?",
            "tooltip-poresInMembrane": "Membrane region - Calculate pore in the transmembrane region only",
            "tooltip-poresChains": "Specific chains - Select chains to be included in computation. No value, all is included.",
            "tooltip-cofactorActiveSites": "Posible starting points based on cofactors.",
            "validation-error-message-default": "Value you entered has invalid format!",
            "validation-error-message-not-empty": "This field is required!",
            "validation-error-message-residue-invalid-format": "Residue Id is in invalid format! Correct format: 142 A",
            "placeholder-annotate-email": "(optional for further contact) jon.snow@uni.ac.uk",
            "placeholder-annotate-message": "(optional) Explanation, notes to the authors, whatever",
        };
        StaticData.Bundle = Bundle;
        var WeightFunctions = (function () {
            function WeightFunctions() {
            }
            WeightFunctions.get = function () {
                if (this.cache !== void 0) {
                    return this.cache;
                }
                var rv = [];
                for (var _i = 0, _a = this.functions; _i < _a.length; _i++) {
                    var key = _a[_i];
                    rv.push({ label: Bundle.get(key), value: key });
                }
                this.cache = rv;
                return rv;
            };
            return WeightFunctions;
        }());
        WeightFunctions.cache = void 0;
        WeightFunctions.functions = ["VoronoiScale", "Length", "LengthAndRadius"];
        StaticData.WeightFunctions = WeightFunctions;
        var TooltipText = (function () {
            function TooltipText() {
            }
            TooltipText.get = function (key) {
                var bundleKey = "tooltip-" + key;
                var text = Bundle.get(bundleKey);
                if (text === bundleKey) {
                    return key;
                }
                return text;
            };
            return TooltipText;
        }());
        StaticData.TooltipText = TooltipText;
        var LiteMolObjectsColorScheme;
        (function (LiteMolObjectsColorScheme) {
            var Colors = (function () {
                function Colors() {
                }
                Colors.get = function (key) {
                    switch (key) {
                        case Enum.CSAOrigin: return LiteMol.Visualization.Color.fromRgb(128, 255, 128);
                        case Enum.ComputedOrigin: return LiteMol.Visualization.Color.fromRgb(128, 128, 255);
                        case Enum.OtherOrigin: return LiteMol.Visualization.Color.fromRgb(255, 128, 128);
                        case Enum.CavityBoundary: return LiteMol.Visualization.Color.fromHex(0x90ee90);
                        case Enum.CavityInner: return LiteMol.Visualization.Color.fromHex(0x999999);
                        case Enum.CavitySelectable: return LiteMol.Visualization.Color.fromHex(0x90ee90);
                        case Enum.SyntethicSelect: return LiteMol.Visualization.Color.fromRgb(191, 82, 204);
                        case Enum.TPoint: return LiteMol.Visualization.Color.fromRgb(255, 0, 105);
                        case Enum.MembraneBlue: return LiteMol.Visualization.Color.fromRgb(0, 0, 255);
                        case Enum.MembraneRed: return LiteMol.Visualization.Color.fromRgb(255, 0, 0);
                        case Enum.DefaultColor: return LiteMol.Visualization.Color.fromRgb(0, 0, 0);
                        default: return this.get(Enum.DefaultColor);
                    }
                };
                Colors.shouldExcludeColor = function (colorIdx) {
                    return !(this.excludedColors.indexOf(colorIdx) < 0);
                };
                Colors.getRandomUnused = function () {
                    do {
                        this.colorIndex = (this.colorIndex + 1) % LiteMol.Visualization.Molecule.Colors.DefaultPallete.length;
                    } while (this.shouldExcludeColor(this.colorIndex));
                    return LiteMol.Visualization.Molecule.Colors.DefaultPallete[this.colorIndex];
                };
                return Colors;
            }());
            Colors.excludedColors = [3, 5, 8, 9, 10, 16, 19, 24 /**/, 25 /**/, 28, 30, 31, 32, 33, 37, 44, 51, 54, 56, 65, 73 /**/, 76 /**/, 81, 90, 92];
            Colors.colorIndex = -1;
            LiteMolObjectsColorScheme.Colors = Colors;
            var Enum;
            (function (Enum) {
                Enum[Enum["CSAOrigin"] = 0] = "CSAOrigin";
                Enum[Enum["ComputedOrigin"] = 1] = "ComputedOrigin";
                Enum[Enum["OtherOrigin"] = 2] = "OtherOrigin";
                Enum[Enum["CavityBoundary"] = 3] = "CavityBoundary";
                Enum[Enum["CavityInner"] = 4] = "CavityInner";
                Enum[Enum["CavitySelectable"] = 5] = "CavitySelectable";
                Enum[Enum["TPoint"] = 6] = "TPoint";
                Enum[Enum["SyntethicSelect"] = 7] = "SyntethicSelect";
                Enum[Enum["DefaultColor"] = 8] = "DefaultColor";
                Enum[Enum["MembraneBlue"] = 9] = "MembraneBlue";
                Enum[Enum["MembraneRed"] = 10] = "MembraneRed";
            })(Enum = LiteMolObjectsColorScheme.Enum || (LiteMolObjectsColorScheme.Enum = {}));
        })(LiteMolObjectsColorScheme = StaticData.LiteMolObjectsColorScheme || (StaticData.LiteMolObjectsColorScheme = {}));
    })(StaticData = MoleOnlineWebUI.StaticData || (MoleOnlineWebUI.StaticData = {}));
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
                    var url = this.baseUrl + "/inputs/cofactors.json";
                    //let url = `/online/cofactors.json`;
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
        var ChannelsDBAPI;
        (function (ChannelsDBAPI) {
            var Fetching = MoleOnlineWebUI.Service.Fetching;
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
                ApiService.parseChannelsAnnotations = function (data) {
                    var map = LiteMol.Core.Utils.FastMap.create();
                    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                        var item = data_1[_i];
                        if (item.Name === void 0) {
                            console.log("Found channel annotation without annotation text(Name). Skipping...");
                            continue;
                        }
                        var list = [];
                        if (map.has(item.Id)) {
                            var l = map.get(item.Id);
                            if (l !== void 0) {
                                list = l;
                            }
                        }
                        list.push({
                            name: item.Name,
                            description: item.Description,
                            reference: item.Reference,
                            link: this.createLink(item.ReferenceType, item.Reference)
                        });
                        map.set(item.Id, list);
                    }
                    return map;
                };
                ApiService.stripChars = function (str, chars) {
                    for (var _i = 0, chars_1 = chars; _i < chars_1.length; _i++) {
                        var char = chars_1[_i];
                        str = str.replace(char, "");
                    }
                    return str;
                };
                ApiService.parseCatalytics = function (items) {
                    var _this = this;
                    var rv = [];
                    for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
                        var item = items_2[_i];
                        var line = item.replace(/\(\d*\)/g, function (x) { return "<sub>" + _this.stripChars(x, ['(', ')']) + "</sub>"; });
                        line = line.replace(/\(\+\)|\(\-\)/g, function (x) { return "<sup>" + _this.stripChars(x, ['(', ')']) + "</sup>"; });
                        rv.push(line);
                    }
                    return rv;
                };
                ApiService.parseProteinData = function (data) {
                    var list = [];
                    for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
                        var item = data_2[_i];
                        list.push({
                            name: item.Name,
                            function: item.Function,
                            link: this.createLink("UniProt", item.UniProtId),
                            uniProtId: item.UniProtId,
                            catalytics: this.parseCatalytics(item.Catalytics)
                        });
                    }
                    return list;
                };
                //PUBMEDID vs UniProtId ??? PUBMED není v JSONU vůbec přítomné
                //link pro uniprot používá adresu http://www.uniprot.org/uniprot/
                ApiService.createLink = function (type, reference) {
                    if (type === "DOI") {
                        return "http://dx.doi.org/" + reference;
                    }
                    else if (type === "UniProt") {
                        return "http://www.uniprot.org/uniprot/" + reference;
                    }
                    else if (type === "PubMed") {
                        return "http://europepmc.org/abstract/MED/" + reference;
                    }
                    else {
                        console.log("Unknown reference type " + type + " for reference " + reference);
                        return "#unknown-reference-type";
                    }
                };
                ApiService.parseResidueItem = function (item, map) {
                    var residueId = item.Id + " " + item.Chain;
                    var annotations = map.get(residueId);
                    if (annotations === void 0) {
                        annotations = [];
                    }
                    annotations.push({
                        text: item.Text,
                        reference: item.Reference,
                        link: this.createLink(item.ReferenceType, item.Reference),
                    });
                    map.set(item.Id + " " + item.Chain, annotations);
                };
                ApiService.parseResidueData = function (data) {
                    var map = LiteMol.Core.Utils.FastMap.create();
                    for (var _i = 0, _a = data.ChannelsDB; _i < _a.length; _i++) {
                        var item = _a[_i];
                        this.parseResidueItem(item, map);
                    }
                    for (var _b = 0, _c = data.UniProt; _b < _c.length; _b++) {
                        var item = _c[_b];
                        this.parseResidueItem(item, map);
                    }
                    return map;
                };
                ApiService.parseLiningResiduesAndChannelsData = function (data) {
                    var channels = [];
                    if (data.Channels.ReviewedChannels !== void 0) {
                        channels = channels.concat(data.Channels.ReviewedChannels);
                    }
                    if (data.Channels.CSATunnels !== void 0) {
                        channels = channels.concat(data.Channels.CSATunnels);
                    }
                    if (data.Channels.TransmembranePores !== void 0) {
                        channels = channels.concat(data.Channels.TransmembranePores);
                    }
                    if (data.Channels.CofactorTunnels !== void 0) {
                        channels = channels.concat(data.Channels.CofactorTunnels);
                    }
                    var liningResidues = [];
                    for (var _i = 0, channels_1 = channels; _i < channels_1.length; _i++) {
                        var channel = channels_1[_i];
                        for (var _a = 0, _b = channel.Layers.LayersInfo; _a < _b.length; _a++) {
                            var layerInfo = _b[_a];
                            for (var _c = 0, _d = layerInfo.Residues; _c < _d.length; _c++) {
                                var residue = _d[_c];
                                var residueId = residue.split(" ").slice(1, 3).join(" ");
                                if (liningResidues.indexOf(residueId) < 0) {
                                    liningResidues.push(residueId);
                                }
                            }
                        }
                    }
                    return { liningResidues: liningResidues, channels: data.Channels };
                };
                ApiService.handleChannelsAPIData = function (data) {
                    var liningResiduesAndChannels = this.parseLiningResiduesAndChannelsData(data);
                    var channelsAnnotations = this.parseChannelsAnnotations(data.Annotations);
                    return { liningResidues: liningResiduesAndChannels.liningResidues, channelsAnnotations: channelsAnnotations, channelsData: liningResiduesAndChannels.channels };
                };
                ApiService.handleAnnotationsAPIData = function (data) {
                    var proteinData = this.parseProteinData(data.EntryAnnotations);
                    var residueData = this.parseResidueData(data.ResidueAnnotations);
                    return { proteinData: proteinData, residueData: residueData };
                };
                ApiService.getChannelsData = function (pdbid) {
                    var _this = this;
                    var url = this.baseUrl + "/PDB/" + pdbid;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url).then(function (val) {
                        return _this.handleChannelsAPIData(val);
                    });
                };
                ApiService.getProteinData = function (pdbid) {
                    var _this = this;
                    var url = this.baseUrl + "/Annotations/" + pdbid;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url).then(function (val) {
                        return _this.handleAnnotationsAPIData(val);
                    });
                };
                return ApiService;
            }());
            ApiService.DEBUG_MODE = Config.CommonOptions.DEBUG_MODE;
            ApiService.baseUrl = Config.DataSources.ANNOTATION_API_URL[Config.DataSources.ANNOTATION_API_MODE];
            ChannelsDBAPI.ApiService = ApiService;
        })(ChannelsDBAPI = Service.ChannelsDBAPI || (Service.ChannelsDBAPI = {}));
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
var MoleOnlineWebUI;
(function (MoleOnlineWebUI) {
    var Service;
    (function (Service) {
        var AnnotationToChannelsDBService;
        (function (AnnotationToChannelsDBService) {
            var Fetching = MoleOnlineWebUI.Service.Fetching;
            var ApiService = (function () {
                function ApiService() {
                }
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
                ApiService.sendAnnotation = function (data) {
                    var url = this.baseUrl + "/UploadAnnotations/Mole";
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendPOSTjson(url, data);
                };
                return ApiService;
            }());
            ApiService.DEBUG_MODE = Config.CommonOptions.DEBUG_MODE;
            ApiService.baseUrl = Config.DataSources.ANNOTATION_API_URL[Config.DataSources.ANNOTATION_API_MODE];
            AnnotationToChannelsDBService.ApiService = ApiService;
        })(AnnotationToChannelsDBService = Service.AnnotationToChannelsDBService || (Service.AnnotationToChannelsDBService = {}));
    })(Service = MoleOnlineWebUI.Service || (MoleOnlineWebUI.Service = {}));
})(MoleOnlineWebUI || (MoleOnlineWebUI = {}));
var MoleOnlineWebUI;
(function (MoleOnlineWebUI) {
    var Service;
    (function (Service_1) {
        var Templates;
        (function (Templates) {
            var Service = (function () {
                function Service() {
                }
                Service.sendGET = function (url) {
                    var _this = this;
                    var fetching = Service_1.Fetching.get();
                    if (this.DEBUG_MODE)
                        console.time("sendGET '" + url + "'");
                    return this.handleResponse(fetching.fetch(url, {
                        method: "GET"
                    }), url).then(function (val) {
                        if (_this.DEBUG_MODE)
                            console.timeEnd("sendGET '" + url + "'");
                        return val;
                    });
                };
                Service.handleResponse = function (response, url) {
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
                                res(rawResponse.text());
                            }
                        })
                            .catch(function (err) {
                            rej(err);
                        });
                    });
                };
                Service.getPDFReportTemplateData = function () {
                    var _this = this;
                    var cacheToken = (this.noCacheMode) ? Math.random() : this.version;
                    var urlHTML = this.baseUrl + "/pdf-report.html?version=" + cacheToken;
                    if (this.DEBUG_MODE) {
                        console.log(urlHTML);
                    }
                    var urlParamsPageHTML = this.baseUrl + "/pdf-report-params.html?version=" + cacheToken;
                    if (this.DEBUG_MODE) {
                        console.log(urlParamsPageHTML);
                    }
                    var urlCSS = this.baseUrl + "/pdf-report.css?version=" + cacheToken;
                    if (this.DEBUG_MODE) {
                        console.log(urlCSS);
                    }
                    var html = null;
                    var paramsPageHtml = null;
                    var css = null;
                    return new Promise(function (res, rej) {
                        Promise.all([
                            _this.sendGET(urlHTML).then(function (htmlTemplate) {
                                html = htmlTemplate;
                            }),
                            _this.sendGET(urlParamsPageHTML).then(function (htmlTemplate) {
                                paramsPageHtml = htmlTemplate;
                            }),
                            _this.sendGET(urlCSS).then(function (cssTemplate) {
                                css = cssTemplate;
                            }),
                        ])
                            .then(function () {
                            if (html !== null && css != null && paramsPageHtml !== null) {
                                res({
                                    html: html, css: css, paramsPageHtml: paramsPageHtml
                                });
                            }
                        })
                            .catch(function (err) { return rej(err); });
                    });
                };
                return Service;
            }());
            Service.DEBUG_MODE = Config.CommonOptions.DEBUG_MODE;
            Service.baseUrl = "/online/templates";
            Service.version = 6;
            Service.noCacheMode = false;
            Templates.Service = Service;
        })(Templates = Service_1.Templates || (Service_1.Templates = {}));
    })(Service = MoleOnlineWebUI.Service || (MoleOnlineWebUI.Service = {}));
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
var MoleOnlineWebUI;
(function (MoleOnlineWebUI) {
    var Cache;
    (function (Cache) {
        var ChannelsDBAPI = MoleOnlineWebUI.Service.ChannelsDBAPI;
        var TunnelName = (function () {
            function TunnelName() {
            }
            TunnelName.reload = function (data) {
                var channels = [];
                if (data.Channels.MergedPores.length > 0) {
                    channels = channels.concat(data.Channels.MergedPores);
                }
                if (data.Channels.Paths.length > 0) {
                    channels = channels.concat(data.Channels.Paths);
                }
                if (data.Channels.Pores.length > 0) {
                    channels = channels.concat(data.Channels.Pores);
                }
                if (data.Channels.Tunnels.length > 0) {
                    channels = channels.concat(data.Channels.Tunnels);
                }
                var cache = new Map();
                for (var _i = 0, channels_2 = channels; _i < channels_2.length; _i++) {
                    var channel = channels_2[_i];
                    cache.set(channel.GUID, "" + channel.Type[0] + channel.Id + "C" + channel.Cavity);
                }
                this.cache = cache;
            };
            TunnelName.get = function (channelId) {
                if (this.cache === void 0) {
                    return void 0;
                }
                return this.cache.get(channelId);
            };
            TunnelName.getCachedItemsCount = function () {
                return (this.cache === void 0) ? 0 : this.cache.size;
            };
            return TunnelName;
        }());
        Cache.TunnelName = TunnelName;
        var LastSelectedChannelData = (function () {
            function LastSelectedChannelData() {
            }
            LastSelectedChannelData.set = function (data) {
                this.data = data;
            };
            LastSelectedChannelData.get = function () {
                return this.data;
            };
            return LastSelectedChannelData;
        }());
        Cache.LastSelectedChannelData = LastSelectedChannelData;
        var LastVisibleChannels = (function () {
            function LastVisibleChannels() {
            }
            LastVisibleChannels.set = function (data) {
                this.data = data;
            };
            LastVisibleChannels.get = function () {
                return this.data;
            };
            return LastVisibleChannels;
        }());
        Cache.LastVisibleChannels = LastVisibleChannels;
        var ChannelsDBData = (function () {
            function ChannelsDBData() {
            }
            ChannelsDBData.reload = function (pdbid) {
                var _this = this;
                var channelsData = ChannelsDBAPI.ApiService.getChannelsData(pdbid);
                var proteinData = ChannelsDBAPI.ApiService.getProteinData(pdbid);
                channelsData.then(function (val) {
                    _this.channelAnnotationCache = val.channelsAnnotations;
                    _this.channelDataCache = val.channelsData;
                    _this.liningResiduesCache = val.liningResidues;
                });
                proteinData.then(function (val) {
                    _this.residueAnnotationCache = val.residueData;
                });
                return Promise.all([
                    channelsData,
                    proteinData
                ]);
            };
            ChannelsDBData.doWhenCached = function (pdbid) {
                var _this = this;
                if (this.isCached()) {
                    return Promise.resolve();
                }
                return new Promise(function (res, rej) {
                    _this.reload(pdbid).then(function (val) { return res(); }).catch(function (err) { return rej(err); });
                });
            };
            ChannelsDBData.isCached = function () {
                return this.channelAnnotationCache !== void 0
                    && this.channelDataCache !== void 0
                    && this.liningResiduesCache !== void 0
                    && this.residueAnnotationCache !== void 0;
            };
            ChannelsDBData.getChannelAnnotations = function (pdbid, channelId) {
                var _this = this;
                if (this.isCached()) {
                    return Promise.resolve(this.channelAnnotationCache.get(channelId));
                }
                return new Promise(function (res, rej) {
                    _this.reload(pdbid)
                        .then(function (val) {
                        res(_this.channelAnnotationCache.get(channelId));
                    })
                        .catch(function (err) { return rej(err); });
                });
            };
            ChannelsDBData.getChannelAnnotationsImmediate = function (channelId) {
                if (!this.isCached()) {
                    return null;
                }
                var annotations = this.channelAnnotationCache.get(channelId);
                if (annotations === void 0) {
                    return null;
                }
                return annotations;
            };
            ChannelsDBData.getChannelsAnnotations = function (pdbid) {
                var _this = this;
                if (this.isCached()) {
                    return Promise.resolve(this.channelAnnotationCache);
                }
                return new Promise(function (res, rej) {
                    _this.reload(pdbid)
                        .then(function (val) {
                        res(_this.channelAnnotationCache);
                    })
                        .catch(function (err) { return rej(err); });
                });
            };
            ChannelsDBData.getChannelsData = function (pdbid) {
                var _this = this;
                if (this.isCached()) {
                    return Promise.resolve(this.channelDataCache);
                }
                return new Promise(function (res, rej) {
                    _this.reload(pdbid)
                        .then(function (val) {
                        res(_this.channelDataCache);
                    })
                        .catch(function (err) { return rej(err); });
                });
            };
            ChannelsDBData.getResidueAnnotations = function (pdbid, seqNumberAndChain) {
                var _this = this;
                if (this.isCached()) {
                    return Promise.resolve(this.residueAnnotationCache.get(seqNumberAndChain));
                }
                return new Promise(function (res, rej) {
                    _this.reload(pdbid)
                        .then(function (val) {
                        res(_this.residueAnnotationCache.get(seqNumberAndChain));
                    })
                        .catch(function (err) { return rej(err); });
                });
            };
            ChannelsDBData.getResidueAnnotationsImmediate = function (seqNumberAndChain) {
                if (!this.isCached()) {
                    return null;
                }
                var annotations = this.residueAnnotationCache.get(seqNumberAndChain);
                if (annotations === void 0) {
                    return null;
                }
                return annotations;
            };
            ChannelsDBData.getResiduesAnnotations = function (pdbid) {
                var _this = this;
                if (this.isCached()) {
                    return Promise.resolve(this.residueAnnotationCache);
                }
                return new Promise(function (res, rej) {
                    _this.reload(pdbid)
                        .then(function (val) {
                        res(_this.residueAnnotationCache);
                    })
                        .catch(function (err) { return rej(err); });
                });
            };
            ChannelsDBData.getResiduesAnnotationsImmediate = function () {
                if (!this.isCached()) {
                    return null;
                }
                var annotations = this.residueAnnotationCache;
                if (annotations === void 0) {
                    return null;
                }
                return annotations;
            };
            ChannelsDBData.getLiningResidues = function (pdbid) {
                var _this = this;
                if (this.isCached()) {
                    return Promise.resolve(this.liningResiduesCache.slice());
                }
                return new Promise(function (res, rej) {
                    _this.reload(pdbid)
                        .then(function (val) {
                        if (_this.liningResiduesCache === void 0) {
                            res(void 0);
                        }
                        else {
                            res(_this.liningResiduesCache.slice());
                        }
                    })
                        .catch(function (err) { return rej(err); });
                });
            };
            return ChannelsDBData;
        }());
        Cache.ChannelsDBData = ChannelsDBData;
    })(Cache = MoleOnlineWebUI.Cache || (MoleOnlineWebUI.Cache = {}));
})(MoleOnlineWebUI || (MoleOnlineWebUI = {}));
var WebChemistry;
(function (WebChemistry) {
    var Tunnels;
    (function (Tunnels) {
        var Core;
        (function (Core) {
            ;
            ;
            var TunnelPhysicoChemicalProperties = (function () {
                function TunnelPhysicoChemicalProperties(params) {
                    this.Charge = params.Charge;
                    this.Ionizable = params.Ionizable;
                    this.Hydropathy = params.Hydropathy;
                    this.Hydrophobicity = params.Hydrophobicity;
                    this.Polarity = params.Polarity;
                    this.LogP = params.LogP;
                    this.LogD = params.LogD;
                    this.LogS = params.LogS;
                    this.Mutability = params.Mutability;
                    this.NumNegatives = (params.NumNegatives === void 0) ? 0 : params.NumNegatives;
                    this.NumPositives = (params.NumPositives === void 0) ? 0 : params.NumPositives;
                }
                TunnelPhysicoChemicalProperties.prototype.ToJson = function () {
                    return {
                        Charge: this.Charge,
                        Ionizable: this.Ionizable,
                        NumPositives: this.NumPositives,
                        NumNegatives: this.NumNegatives,
                        Hydrophobicity: Common.Util.Numbers.roundToDecimal(this.Hydrophobicity, 2),
                        Hydropathy: Common.Util.Numbers.roundToDecimal(this.Hydropathy, 2),
                        Polarity: Common.Util.Numbers.roundToDecimal(this.Polarity, 2),
                        LogP: Common.Util.Numbers.roundToDecimal(this.LogP, 2),
                        LogD: Common.Util.Numbers.roundToDecimal(this.LogD, 2),
                        LogS: Common.Util.Numbers.roundToDecimal(this.LogS, 2),
                        Mutability: this.Mutability
                    };
                };
                return TunnelPhysicoChemicalProperties;
            }());
            TunnelPhysicoChemicalProperties.NumLayerProperties = 4;
            Core.TunnelPhysicoChemicalProperties = TunnelPhysicoChemicalProperties;
            var PdbResidueImpl = (function () {
                function PdbResidueImpl(chain, name, seqNumber) {
                    this.Chain = chain;
                    this.Name = name;
                    this.SeqNumber = seqNumber;
                }
                PdbResidueImpl.prototype.equals = function (o) {
                    return this.toString() == o.toString();
                };
                PdbResidueImpl.prototype.toString = function () {
                    return this.Name + " " + this.SeqNumber + " " + this.Chain;
                };
                return PdbResidueImpl;
            }());
            var PhysicoChemicalPropertyCalculation = (function () {
                function PhysicoChemicalPropertyCalculation() {
                }
                PhysicoChemicalPropertyCalculation.makeUnique = function (residues) {
                    var map = new Map();
                    for (var _i = 0, residues_7 = residues; _i < residues_7.length; _i++) {
                        var r = residues_7[_i];
                        var res = new PdbResidueImpl(r.Chain, r.Name, r.SeqNumber);
                        map.set(res.toString(), res);
                    }
                    return Array.from(map.values());
                };
                PhysicoChemicalPropertyCalculation.CalculateResidueProperties = function (residues) {
                    var count = 0;
                    var charge = 0;
                    var ionizable = 0;
                    var hydropathy = 0.0;
                    var hydrophobicity = 0.0;
                    var polarity = 0.0;
                    var logP = 0.0;
                    var logD = 0.0;
                    var logS = 0.0;
                    var mutability = 0.0;
                    var positives = 0;
                    var negatives = 0;
                    // count only side-chain residues
                    for (var _i = 0, residues_8 = residues; _i < residues_8.length; _i++) {
                        var residue = residues_8[_i];
                        var info = TunnelPhysicoChemicalPropertyTable.GetResidueProperties(residue);
                        if (info == null)
                            continue;
                        count++;
                        var pc = info.Charge;
                        ionizable += info.Ionizable;
                        charge += pc;
                        if (pc > 0) {
                            positives++;
                        }
                        else if (pc < 0) {
                            negatives++;
                        }
                        mutability += info.Mutability;
                    }
                    if (count == 0) {
                        mutability = 0;
                    }
                    else {
                        mutability /= count;
                    }
                    var props = PhysicoChemicalPropertyCalculation.CalculateHydrophibilicyPolarityHydropathy(residues);
                    if (props === null) {
                        return null;
                    }
                    return new TunnelPhysicoChemicalProperties({
                        Charge: charge,
                        Ionizable: ionizable,
                        Polarity: props.polarity,
                        Hydrophobicity: props.hydrophobicity,
                        Hydropathy: props.hydropathy,
                        LogP: props.logP,
                        LogS: props.logS,
                        LogD: props.logD,
                        Mutability: mutability,
                        NumNegatives: negatives,
                        NumPositives: positives
                    });
                };
                PhysicoChemicalPropertyCalculation.CalculateAgregatedLayersProperties = function (layers) {
                    var count = 0;
                    var charge = 0;
                    var ionizable = 0;
                    var hydropathy = 0.0;
                    var hydrophobicity = 0.0;
                    var polarity = 0.0;
                    var logP = 0.0;
                    var logD = 0.0;
                    var logS = 0.0;
                    var mutability = 0.0;
                    var positives = 0;
                    var negatives = 0;
                    var residues = this.getNonBackboneLining(layers);
                    var unique = this.makeUnique(residues);
                    for (var _i = 0, unique_1 = unique; _i < unique_1.length; _i++) {
                        var residue = unique_1[_i];
                        var info = TunnelPhysicoChemicalPropertyTable.GetResidueProperties(residue);
                        if (info == null)
                            continue;
                        count++;
                        var pc = info.Charge;
                        ionizable += info.Ionizable;
                        charge += pc;
                        if (pc > 0) {
                            positives++;
                        }
                        else if (pc < 0) {
                            negatives++;
                        }
                        mutability += info.Mutability;
                    }
                    if (count == 0) {
                        mutability = 0;
                    }
                    else {
                        mutability /= count;
                    }
                    var props = PhysicoChemicalPropertyCalculation.CalculateHydrophibilicyPolarityHydropathyByLayers(layers);
                    if (props === null) {
                        return null;
                    }
                    return new TunnelPhysicoChemicalProperties({
                        Charge: charge,
                        Ionizable: ionizable,
                        Polarity: props.polarity,
                        Hydrophobicity: props.hydrophobicity,
                        Hydropathy: props.hydropathy,
                        LogP: props.logP,
                        LogS: props.logS,
                        LogD: props.logD,
                        Mutability: Math.trunc(mutability),
                        NumNegatives: negatives,
                        NumPositives: positives
                    });
                };
                PhysicoChemicalPropertyCalculation.CalculateHydrophibilicyPolarityHydropathy = function (residues) {
                    var hydrophobicity = 0;
                    var polarity = 0;
                    var hydropathy = 0;
                    var logP = 0;
                    var logD = 0;
                    var logS = 0;
                    var count = 0;
                    for (var _i = 0, residues_9 = residues; _i < residues_9.length; _i++) {
                        var residue = residues_9[_i];
                        var info = TunnelPhysicoChemicalPropertyTable.GetResidueProperties(residue);
                        if (info == null)
                            continue;
                        count++;
                        hydropathy += info.Hydropathy;
                        hydrophobicity += info.Hydrophobicity;
                        polarity += info.Polarity;
                        logP += info.LogP;
                        logD += info.LogD;
                        logS += info.LogS;
                    }
                    var infoGLY = TunnelPhysicoChemicalPropertyTable.GetResiduePropertiesByName("GLY");
                    var infoASN = TunnelPhysicoChemicalPropertyTable.GetResiduePropertiesByName("ASN");
                    var infoBB = TunnelPhysicoChemicalPropertyTable.GetResiduePropertiesByName("BACKBONE");
                    if (infoASN === null || infoBB === null || infoGLY === null) {
                        return null;
                    }
                    for (var _a = 0, residues_10 = residues; _a < residues_10.length; _a++) {
                        var residue = residues_10[_a];
                        count++;
                        polarity += infoASN.Polarity;
                        hydrophobicity += infoGLY.Hydrophobicity;
                        hydropathy += infoGLY.Hydropathy;
                        logP += infoBB.LogP;
                        logD += infoBB.LogD;
                        logS += infoBB.LogS;
                    }
                    if (count == 0) {
                        hydropathy = hydrophobicity = polarity = 0;
                    }
                    else {
                        hydropathy /= count;
                        hydrophobicity /= count;
                        polarity /= count;
                        logP /= count;
                        logD /= count;
                        logS /= count;
                    }
                    return {
                        hydropathy: hydropathy,
                        hydrophobicity: hydrophobicity,
                        logD: logD,
                        logP: logP,
                        logS: logS,
                        polarity: polarity
                    };
                };
                PhysicoChemicalPropertyCalculation.getNonBackboneLining = function (layers) {
                    var rv = [];
                    for (var _i = 0, layers_1 = layers; _i < layers_1.length; _i++) {
                        var layer = layers_1[_i];
                        rv = rv.concat(layer.NonBackboneLining);
                    }
                    return rv;
                };
                PhysicoChemicalPropertyCalculation.getBackboneLining = function (layers) {
                    var rv = [];
                    for (var _i = 0, layers_2 = layers; _i < layers_2.length; _i++) {
                        var layer = layers_2[_i];
                        rv = rv.concat(layer.BackboneLining);
                    }
                    return rv;
                };
                PhysicoChemicalPropertyCalculation.CalculateHydrophibilicyPolarityHydropathyByLayers = function (layers) {
                    var hydrophobicity = 0;
                    var polarity = 0;
                    var hydropathy = 0;
                    var logP = 0;
                    var logD = 0;
                    var logS = 0;
                    var count = 0;
                    for (var _i = 0, _a = this.getNonBackboneLining(layers); _i < _a.length; _i++) {
                        var residue = _a[_i];
                        var info = TunnelPhysicoChemicalPropertyTable.GetResidueProperties(residue);
                        if (info == null)
                            continue;
                        count++;
                        hydropathy += info.Hydropathy;
                        hydrophobicity += info.Hydrophobicity;
                        polarity += info.Polarity;
                        logP += info.LogP;
                        logD += info.LogD;
                        logS += info.LogS;
                    }
                    var infoGLY = TunnelPhysicoChemicalPropertyTable.GetResiduePropertiesByName("GLY");
                    var infoASN = TunnelPhysicoChemicalPropertyTable.GetResiduePropertiesByName("ASN");
                    var infoBB = TunnelPhysicoChemicalPropertyTable.GetResiduePropertiesByName("BACKBONE");
                    if (infoASN === null || infoBB === null || infoGLY === null) {
                        return null;
                    }
                    for (var _b = 0, _c = this.getBackboneLining(layers); _b < _c.length; _b++) {
                        var residue = _c[_b];
                        count++;
                        polarity += infoASN.Polarity;
                        hydrophobicity += infoGLY.Hydrophobicity;
                        hydropathy += infoGLY.Hydropathy;
                        logP += infoBB.LogP;
                        logD += infoBB.LogD;
                        logS += infoBB.LogS;
                    }
                    if (count == 0) {
                        hydropathy = hydrophobicity = polarity = logP = logD = logS = 0;
                    }
                    else {
                        hydropathy /= count;
                        hydrophobicity /= count;
                        polarity /= count;
                        logP /= count;
                        logD /= count;
                        logS /= count;
                    }
                    return {
                        polarity: polarity,
                        logS: logS,
                        logP: logP,
                        logD: logD,
                        hydrophobicity: hydrophobicity,
                        hydropathy: hydropathy
                    };
                };
                return PhysicoChemicalPropertyCalculation;
            }());
            Core.PhysicoChemicalPropertyCalculation = PhysicoChemicalPropertyCalculation;
            /*
             * Information about physico chemical properties of a tunnel
             */
            var TunnelPhysicoChemicalPropertyTable = (function () {
                function TunnelPhysicoChemicalPropertyTable() {
                }
                TunnelPhysicoChemicalPropertyTable.GetResidueProperties = function (residue) {
                    var ret = this.info.get(residue.Name);
                    if (ret === void 0) {
                        return null;
                    }
                    return ret;
                };
                TunnelPhysicoChemicalPropertyTable.GetResiduePropertiesByName = function (name) {
                    var ret = this.info.get(name);
                    if (ret === void 0) {
                        return null;
                    }
                    return ret;
                };
                return TunnelPhysicoChemicalPropertyTable;
            }());
            TunnelPhysicoChemicalPropertyTable.info = new Map([
                ["ALA", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: 1.8,
                        Hydrophobicity: 0.02,
                        Polarity: 0,
                        LogP: 1.08,
                        LogD: 1.08,
                        LogS: 0.59,
                        Mutability: 100
                    })
                ],
                ["ARG", new TunnelPhysicoChemicalProperties({
                        Charge: 1,
                        Ionizable: 1,
                        Hydropathy: -4.5,
                        Hydrophobicity: -0.42,
                        Polarity: 52,
                        LogP: -0.08,
                        LogD: -2.49,
                        LogS: 1.63,
                        //Hydratation: 2.3,
                        Mutability: 83
                    })
                ],
                ["ASN", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: -3.5,
                        Hydrophobicity: -0.77,
                        Polarity: 3.38,
                        LogP: -1.03,
                        LogD: -1.03,
                        LogS: 0.54,
                        //Hydratation: 2.2,
                        Mutability: 104
                    })
                ],
                ["ASP", new TunnelPhysicoChemicalProperties({
                        Charge: -1,
                        Ionizable: 1,
                        Hydropathy: -3.5,
                        Hydrophobicity: -1.04,
                        Polarity: 49.7,
                        LogP: -0.22,
                        LogD: -3,
                        LogS: 2.63,
                        //Hydratation: 6.5,
                        Mutability: 86
                    })
                ],
                ["CYS", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: 2.5,
                        Hydrophobicity: 0.77,
                        Polarity: 1.48,
                        LogP: 0.84,
                        LogD: 0.84,
                        LogS: 0.16,
                        //Hydratation: 0.1,
                        Mutability: 44
                    })
                ],
                ["GLU", new TunnelPhysicoChemicalProperties({
                        Charge: -1,
                        Ionizable: 1,
                        Hydropathy: -3.5,
                        Hydrophobicity: -1.14,
                        Polarity: 49.9,
                        LogP: 0.48,
                        LogD: -2.12,
                        LogS: 2.23,
                        //Hydratation: 6.2,
                        Mutability: 77
                    })
                ],
                ["GLN", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: -3.5,
                        Hydrophobicity: -1.1,
                        Polarity: 3.53,
                        LogP: -0.33,
                        LogD: -0.33,
                        LogS: 0.13,
                        //Hydratation: 2.1,
                        Mutability: 84
                    })
                ],
                ["GLY", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: -0.4,
                        Hydrophobicity: -0.8,
                        Polarity: 0,
                        LogP: 0,
                        LogD: 0,
                        LogS: 0,
                        //Hydratation: 1.1,
                        Mutability: 50
                    })
                ],
                ["HIS", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: -3.2,
                        Hydrophobicity: 0.26,
                        Polarity: 51.6,
                        LogP: -0.01,
                        LogD: -0.11,
                        LogS: -0.2,
                        //Hydratation: 2.8,
                        Mutability: 91
                    })
                ],
                ["ILE", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: 4.5,
                        Hydrophobicity: 1.81,
                        Polarity: 0.13,
                        LogP: 2.24,
                        LogD: 2.24,
                        LogS: -1.85,
                        //Hydratation: 0.8,
                        Mutability: 103
                    })
                ],
                ["LEU", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: 3.8,
                        Hydrophobicity: 1.14,
                        Polarity: 0.13,
                        LogP: 2.08,
                        LogD: 2.08,
                        LogS: -1.79,
                        //Hydratation: 0.8,
                        Mutability: 54
                    })
                ],
                ["LYS", new TunnelPhysicoChemicalProperties({
                        Charge: 1,
                        Ionizable: 1,
                        Hydropathy: -3.9,
                        Hydrophobicity: -0.41,
                        Polarity: 49.5,
                        LogP: 0.7,
                        LogD: -1.91,
                        LogS: 1.46,
                        //Hydratation: 5.3,
                        Mutability: 72
                    })
                ],
                ["MET", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: 1.9,
                        Hydrophobicity: 1,
                        Polarity: 1.43,
                        LogP: 1.48,
                        LogD: 1.48,
                        LogS: -0.72,
                        //Hydratation: 0.7,
                        Mutability: 93
                    })
                ],
                ["PHE", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: 2.8,
                        Hydrophobicity: 1.35,
                        Polarity: 0.35,
                        LogP: 2.49,
                        LogD: 2.49,
                        LogS: -1.81,
                        //Hydratation: 1.4,
                        Mutability: 51
                    })
                ],
                ["PRO", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: -1.6,
                        Hydrophobicity: -0.09,
                        Polarity: 1.58,
                        LogP: 1.8,
                        LogD: 1.8,
                        LogS: -1.3,
                        //Hydratation: 0.9,
                        Mutability: 58
                    })
                ],
                ["SER", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: -0.8,
                        Hydrophobicity: -0.97,
                        Polarity: 1.67,
                        LogP: -0.52,
                        LogD: -0.52,
                        LogS: 1.11,
                        //Hydratation: 1.7,
                        Mutability: 117
                    })
                ],
                ["THR", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: -0.7,
                        Hydrophobicity: -0.77,
                        Polarity: 1.66,
                        LogP: -0.16,
                        LogD: -0.16,
                        LogS: 0.77,
                        //Hydratation: 1.5,
                        Mutability: 107
                    })
                ],
                ["TRP", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: -0.9,
                        Hydrophobicity: 1.71,
                        Polarity: 2.1,
                        LogP: 2.59,
                        LogD: 2.59,
                        LogS: -2.48,
                        //Hydratation: 1.9,
                        Mutability: 25
                    })
                ],
                ["TYR", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: -1.3,
                        Hydrophobicity: 1.11,
                        Polarity: 1.61,
                        LogP: 2.18,
                        LogD: 2.18,
                        LogS: -1.44,
                        //Hydratation: 2.1,
                        Mutability: 50
                    })
                ],
                ["VAL", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: 4.2,
                        Hydrophobicity: 1.13,
                        Polarity: 0.13,
                        LogP: 1.8,
                        LogD: 1.8,
                        LogS: -1.3,
                        //Hydratation: 0.9,
                        Mutability: 98
                    })
                ],
                ["BACKBONE", new TunnelPhysicoChemicalProperties({
                        Charge: 0,
                        Ionizable: 0,
                        Hydropathy: -0.4,
                        Hydrophobicity: 0.0,
                        Polarity: 3.5,
                        Mutability: 0,
                        LogP: -0.86,
                        LogD: -0.86,
                        LogS: 0.81
                    })
                ]
            ]);
            Core.TunnelPhysicoChemicalPropertyTable = TunnelPhysicoChemicalPropertyTable;
        })(Core = Tunnels.Core || (Tunnels.Core = {}));
    })(Tunnels = WebChemistry.Tunnels || (WebChemistry.Tunnels = {}));
})(WebChemistry || (WebChemistry = {}));
var LayersVizualizer;
(function (LayersVizualizer) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        var Transformer = LiteMol.Bootstrap.Entity.Transformer;
        var Visualization = LiteMol.Bootstrap.Visualization;
        var Tabs = CommonUtils.Tabs;
        function render(vizualizer, target, plugin) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, { vizualizer: vizualizer, controller: plugin }), target);
        }
        UI.render = render;
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    instanceId: -1,
                    hasData: false,
                    data: [],
                    layerIds: [0],
                    coloringPropertyKey: "",
                    customColoringPropertyKey: "",
                    radiusPropertyKey: "MinRadius",
                    customRadiusPropertyKey: "MinRadius",
                    colorBoundsMode: "Absolute",
                    isDOMReady: false,
                    app: _this,
                    currentTunnelRef: "",
                    isLayerSelected: false
                };
                return _this;
            }
            App.prototype.componentDidMount = function () {
                var _this = this;
                var vizualizer = this.props.vizualizer;
                vizualizer.setColorBoundsMode(this.state.colorBoundsMode);
                var state = this.state;
                state.instanceId = vizualizer.getPublicInstanceIdx(),
                    state.customColoringPropertyKey = vizualizer.getCustomColoringPropertyKey(),
                    state.coloringPropertyKey = vizualizer.getColoringPropertyKey(),
                    state.customRadiusPropertyKey = vizualizer.getCustomRadiusPropertyKey(),
                    state.radiusPropertyKey = vizualizer.getRadiusPropertyKey(),
                    state.colorBoundsMode = this.state.colorBoundsMode;
                this.setState(state);
                this.vizualizer = vizualizer;
                CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler(function (data) {
                    window.setTimeout(function () {
                        var state = _this.state;
                        state.currentTunnelRef = CommonUtils.Selection.SelectionHelper.getSelectedChannelRef();
                        state.isLayerSelected = false;
                        _this.setState(state);
                        //$('#left-tabs').tabs("option", "active", 0);
                        Tabs.activateTab("left-tabs", "1");
                        var layers = DataInterface.convertLayersToLayerData(data);
                        Tabs.doAfterTabActivated("left-tabs", "1", function () {
                            vizualizer.setData(layers);
                            var s1 = _this.state;
                            s1.data = layers;
                            s1.hasData = true;
                            s1.isDOMReady = false;
                            s1.instanceId = vizualizer.getPublicInstanceIdx();
                            _this.setState(s1);
                            vizualizer.rebindDOMRefs();
                            vizualizer.vizualize();
                            var s2 = _this.state;
                            s2.data = layers;
                            s2.hasData = true;
                            s2.isDOMReady = true;
                            s2.instanceId = vizualizer.getPublicInstanceIdx();
                            _this.setState(s2);
                        });
                    }, 50);
                });
                CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(function () {
                    var state = _this.state;
                    state.data = [];
                    state.hasData = false;
                    state.isDOMReady = false;
                    state.currentTunnelRef = "";
                    state.isLayerSelected = false;
                    _this.setState(state);
                    setTimeout(function () {
                        $(window).trigger('contentResize');
                    }, 1);
                });
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(function () {
                    var state = _this.state;
                    state.data = [];
                    state.hasData = false;
                    state.isDOMReady = false;
                    state.currentTunnelRef = "";
                    state.isLayerSelected = false;
                    _this.setState(state);
                    setTimeout(function () {
                        $(window).trigger('contentResize');
                    }, 1);
                });
                $(window).on("lvContentResize", (function () {
                    _this.forceUpdate();
                }).bind(this));
                $(window).on("resize", (function () {
                    _this.forceUpdate();
                }).bind(this));
            };
            App.prototype.componentWillUnmount = function () {
            };
            App.prototype.render = function () {
                if (this.state.hasData) {
                    $('.init-lvz-tooltip').tooltip();
                    return React.createElement(PaintingArea, __assign({}, this.state));
                }
                return React.createElement(Hint, __assign({}, this.state));
            };
            return App;
        }(React.Component));
        UI.App = App;
        ;
        var PaintingArea = (function (_super) {
            __extends(PaintingArea, _super);
            function PaintingArea() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            PaintingArea.prototype.render = function () {
                return (React.createElement("div", { className: "layerVizualizer", id: "layer-vizualizer-ui" + this.props.instanceId },
                    React.createElement("div", { className: "wrapper-container" },
                        React.createElement(Controls, __assign({}, this.props, { isCustom: false })),
                        React.createElement(CanvasWrapper, __assign({}, this.props)),
                        React.createElement(Controls, __assign({}, this.props, { isCustom: true }))),
                    React.createElement(CommonControls, __assign({}, this.props))));
            };
            ;
            return PaintingArea;
        }(React.Component));
        var Hint = (function (_super) {
            __extends(Hint, _super);
            function Hint() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Hint.prototype.render = function () {
                return (React.createElement("div", { id: "layer-vizualizer-hint-div" + this.props.instanceId, className: "layer-vizualizer-hint-div" }, "Click on one of available channels to see more information..."));
            };
            return Hint;
        }(React.Component));
        var ColorMenuItem = (function (_super) {
            __extends(ColorMenuItem, _super);
            function ColorMenuItem() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ColorMenuItem.prototype.changeColoringProperty = function (e) {
                var targetElement = e.target;
                var instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
                var instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[instanceIdx];
                var propertyName = targetElement.getAttribute("data-propertyname");
                if (propertyName === null) {
                    if (Config.CommonOptions.DEBUG_MODE)
                        console.log("No property name found!");
                    return;
                }
                if (this.props.isCustom) {
                    if (Config.CommonOptions.DEBUG_MODE)
                        console.log("setting custom property key: " + propertyName);
                    instance.setCustomColoringPropertyKey(propertyName);
                }
                else {
                    if (Config.CommonOptions.DEBUG_MODE)
                        console.log("setting regular property key: " + propertyName);
                    instance.setColoringPropertyKey(propertyName);
                }
                instance.vizualize();
                var state = this.props.app.state;
                if (this.props.isCustom) {
                    state.customColoringPropertyKey = propertyName;
                    this.props.app.setState(state);
                }
                else {
                    state.coloringPropertyKey = propertyName;
                    this.props.app.setState(state);
                }
            };
            ColorMenuItem.prototype.render = function () {
                return (React.createElement("li", null,
                    React.createElement("a", { "data-instanceidx": this.props.instanceId, "data-propertyname": this.props.propertyName, "data-toggle": "tooltip", "data-placement": "right", title: MoleOnlineWebUI.StaticData.TooltipText.get(this.props.propertyName), onClick: this.changeColoringProperty.bind(this), className: "init-lvz-tooltip lvz-properties" }, MoleOnlineWebUI.StaticData.Bundle.get(this.props.propertyName))));
            };
            return ColorMenuItem;
        }(React.Component));
        var RadiusMenuItem = (function (_super) {
            __extends(RadiusMenuItem, _super);
            function RadiusMenuItem() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            RadiusMenuItem.prototype.changeRadiusProperty = function (e) {
                var targetElement = e.target;
                var instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
                var instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[instanceIdx];
                var propertyName = targetElement.getAttribute("data-propertyname");
                if (propertyName === null || propertyName === void 0) {
                    return;
                }
                if (this.props.isCustom) {
                    instance.setCustomRadiusPropertyKey(propertyName);
                }
                else {
                    instance.setRadiusPropertyKey(propertyName);
                }
                instance.vizualize();
                var state = this.props.app.state;
                if (this.props.isCustom) {
                    state.customRadiusPropertyKey = propertyName;
                    this.props.app.setState(state);
                }
                else {
                    state.radiusPropertyKey = propertyName;
                    this.props.app.setState(state);
                }
            };
            RadiusMenuItem.prototype.render = function () {
                return (React.createElement("li", null,
                    React.createElement("a", { "data-instanceidx": this.props.instanceId, "data-propertyname": this.props.propertyName, "data-toggle": "tooltip", "data-placement": "right", title: MoleOnlineWebUI.StaticData.TooltipText.get(this.props.propertyName), onClick: this.changeRadiusProperty.bind(this), className: "init-lvz-tooltip lvz-radius" }, MoleOnlineWebUI.StaticData.Bundle.get(this.props.propertyName))));
            };
            return RadiusMenuItem;
        }(React.Component));
        var ColorBoundsMenuItem = (function (_super) {
            __extends(ColorBoundsMenuItem, _super);
            function ColorBoundsMenuItem() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ColorBoundsMenuItem.prototype.changeColorBoundsMode = function (e) {
                var targetElement = e.target;
                var instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
                var instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[instanceIdx];
                var mode = targetElement.getAttribute("data-mode");
                if (mode === null || mode === void 0) {
                    return;
                }
                instance.setColorBoundsMode(mode);
                instance.vizualize();
                var state = this.props.app.state;
                state.colorBoundsMode = mode;
                this.props.app.setState(state);
            };
            ColorBoundsMenuItem.prototype.render = function () {
                return (React.createElement("li", null,
                    React.createElement("a", { "data-instanceidx": this.props.instanceId, "data-mode": this.props.mode, onClick: this.changeColorBoundsMode.bind(this) }, this.props.mode)));
            };
            return ColorBoundsMenuItem;
        }(React.Component));
        var BootstrapDropUpMenuButton = (function (_super) {
            __extends(BootstrapDropUpMenuButton, _super);
            function BootstrapDropUpMenuButton() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            BootstrapDropUpMenuButton.prototype.render = function () {
                return React.createElement("div", { className: "btn-group dropup" },
                    React.createElement("button", { type: "button", className: "btn btn-xs btn-primary dropdown-toggle", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false" },
                        this.props.label,
                        " ",
                        React.createElement("span", { className: "caret" })),
                    React.createElement("ul", { className: "dropdown-menu" }, this.props.items));
            };
            return BootstrapDropUpMenuButton;
        }(React.Component));
        var Controls = (function (_super) {
            __extends(Controls, _super);
            function Controls() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Controls.prototype.render = function () {
                return (React.createElement("div", { className: "controls" },
                    React.createElement(RadiusSwitch, { state: this.props, isCustom: this.props.isCustom, radiusProperty: (this.props.isCustom) ? this.props.customRadiusPropertyKey : this.props.radiusPropertyKey }),
                    React.createElement(ColorBySwitch, { state: this.props, isCustom: this.props.isCustom, coloringProperty: (this.props.isCustom) ? this.props.customColoringPropertyKey : this.props.coloringPropertyKey })));
            };
            return Controls;
        }(React.Component));
        var CommonControls = (function (_super) {
            __extends(CommonControls, _super);
            function CommonControls() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            CommonControls.prototype.render = function () {
                return (React.createElement("div", { className: "controls" },
                    React.createElement(CommonButtonArea, __assign({}, this.props))));
            };
            return CommonControls;
        }(React.Component));
        var ColorBySwitch = (function (_super) {
            __extends(ColorBySwitch, _super);
            function ColorBySwitch() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ColorBySwitch.prototype.generateColorMenu = function () {
                var rv = [];
                for (var prop in this.props.state.data[0].Properties) {
                    rv.push(React.createElement(ColorMenuItem, __assign({ propertyName: prop, isCustom: this.props.isCustom }, this.props.state)));
                }
                rv.push(React.createElement(ColorMenuItem, __assign({ propertyName: 'BRadius', isCustom: this.props.isCustom }, this.props.state)));
                return React.createElement(BootstrapDropUpMenuButton, { items: rv, label: this.props.coloringProperty });
            };
            ColorBySwitch.prototype.render = function () {
                var items = this.generateColorMenu();
                return (React.createElement("span", { className: "block-like" },
                    React.createElement("span", { className: "control-label" }, "Color by:"),
                    " ",
                    items));
            };
            return ColorBySwitch;
        }(React.Component));
        var RadiusSwitch = (function (_super) {
            __extends(RadiusSwitch, _super);
            function RadiusSwitch() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            RadiusSwitch.prototype.generateRadiusSwitch = function () {
                var properties = ["MinRadius", "MinFreeRadius", "MinBRadius"];
                var rv = [];
                for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
                    var prop = properties_1[_i];
                    rv.push(React.createElement(RadiusMenuItem, __assign({ propertyName: prop, isCustom: this.props.isCustom }, this.props.state)));
                }
                return React.createElement(BootstrapDropUpMenuButton, { items: rv, label: MoleOnlineWebUI.StaticData.Bundle.get(this.props.radiusProperty) });
            };
            RadiusSwitch.prototype.render = function () {
                var items = this.generateRadiusSwitch();
                return (React.createElement("span", { className: "block-like" },
                    React.createElement("span", { className: "control-label" }, "Tunnel radius:"),
                    " ",
                    items));
            };
            return RadiusSwitch;
        }(React.Component));
        var CommonButtonArea = (function (_super) {
            __extends(CommonButtonArea, _super);
            function CommonButtonArea() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            CommonButtonArea.prototype.generateColorBoundsSwitch = function () {
                var properties = ["Min/max", "Absolute"];
                var rv = [];
                for (var _i = 0, properties_2 = properties; _i < properties_2.length; _i++) {
                    var prop = properties_2[_i];
                    rv.push(React.createElement(ColorBoundsMenuItem, __assign({ mode: prop }, this.props)));
                }
                var label = properties[(this.props.colorBoundsMode == "Min/max") ? 0 : 1];
                return React.createElement(BootstrapDropUpMenuButton, { items: rv, label: label });
            };
            CommonButtonArea.prototype.render = function () {
                var items = this.generateColorBoundsSwitch();
                return (React.createElement("div", { className: "common-area" },
                    React.createElement(ColorBoundsSwitchButton, { items: items }),
                    React.createElement(ExportButton, { instanceId: this.props.instanceId })));
            };
            return CommonButtonArea;
        }(React.Component));
        var ExportTypeButton = (function (_super) {
            __extends(ExportTypeButton, _super);
            function ExportTypeButton() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ExportTypeButton.prototype.export = function (e) {
                var targetElement = e.target;
                var instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
                var instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[instanceIdx];
                var exportType = targetElement.getAttribute("data-exporttype");
                if (exportType === null) {
                    return;
                }
                var imgDataUrl = null;
                switch (exportType) {
                    case "PNG":
                        imgDataUrl = instance.exportImage();
                        break;
                    case "SVG":
                        imgDataUrl = instance.exportSVGImage();
                        break;
                    /*case "PDF":
                        imgDataUrl = instance.exportPDF();
                        break;*/
                    default:
                        throw new Error("Unsupported export type '" + exportType + "'");
                }
                CommonUtils.Misc.triggerDownload(imgDataUrl, "export-2D." + exportType.toLowerCase());
            };
            ExportTypeButton.prototype.render = function () {
                return React.createElement("li", null,
                    React.createElement("a", { "data-instanceidx": this.props.instanceId, "data-exporttype": this.props.exportType, onClick: this.export.bind(this) }, this.props.exportType));
            };
            return ExportTypeButton;
        }(React.Component));
        var ExportButton = (function (_super) {
            __extends(ExportButton, _super);
            function ExportButton() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ExportButton.prototype.generateItems = function () {
                var rv = [];
                var supportedExportTypes = ["PNG", "SVG" /*,"PDF"*/];
                for (var _i = 0, supportedExportTypes_1 = supportedExportTypes; _i < supportedExportTypes_1.length; _i++) {
                    var type = supportedExportTypes_1[_i];
                    rv.push(React.createElement(ExportTypeButton, { instanceId: this.props.instanceId, exportType: type }));
                }
                return rv;
            };
            ExportButton.prototype.render = function () {
                var label = "Export";
                var rv = this.generateItems();
                return (React.createElement(BootstrapDropUpMenuButton, { items: rv, label: label }));
            };
            return ExportButton;
        }(React.Component));
        var ColorBoundsSwitchButton = (function (_super) {
            __extends(ColorBoundsSwitchButton, _super);
            function ColorBoundsSwitchButton() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ColorBoundsSwitchButton.prototype.render = function () {
                return (React.createElement("span", { className: "color-bounds-button-container" },
                    React.createElement("span", { className: "control-label", title: "Color bounds for both halfs of vizualized tunnel." }, "Color bounds:"),
                    " ",
                    this.props.items));
            };
            return ColorBoundsSwitchButton;
        }(React.Component));
        var CanvasWrapper = (function (_super) {
            __extends(CanvasWrapper, _super);
            function CanvasWrapper() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            CanvasWrapper.prototype.render = function () {
                return (React.createElement("div", { className: "canvas-wrapper" },
                    React.createElement(RealCanvas, __assign({}, this.props)),
                    React.createElement(ImgOverlay, __assign({}, this.props)),
                    React.createElement(InteractionMap, __assign({}, this.props))));
            };
            return CanvasWrapper;
        }(React.Component));
        var ImgOverlay = (function (_super) {
            __extends(ImgOverlay, _super);
            function ImgOverlay() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ImgOverlay.prototype.render = function () {
                return (React.createElement("img", { className: "fake-canvas", id: "layer-vizualizer-fake-canvas" + this.props.instanceId, useMap: "#layersInteractiveMap" + this.props.instanceId, src: "images/no_img.png" }));
            };
            return ImgOverlay;
        }(React.Component));
        var RealCanvas = (function (_super) {
            __extends(RealCanvas, _super);
            function RealCanvas() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            RealCanvas.prototype.render = function () {
                return (React.createElement("canvas", { id: "layer-vizualizer-canvas" + this.props.instanceId, className: "layer-vizualizer-canvas", width: "700", height: "150" }));
            };
            return RealCanvas;
        }(React.Component));
        ;
        ;
        ;
        var InteractionMap = (function (_super) {
            __extends(InteractionMap, _super);
            function InteractionMap() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    mouseControlStartLayerId: -1,
                    selectionMode: false,
                    touchMode: false
                };
                return _this;
            }
            InteractionMap.prototype.componentDidMount = function () {
                var _this = this;
                document.ontouchstart = function (e) {
                    _this.enableTouchMode();
                };
            };
            InteractionMap.prototype.getLayerResidues = function (layerIdx) {
                var res = [];
                for (var _i = 0, _a = this.props.data[layerIdx].Residues; _i < _a.length; _i++) {
                    var residue = _a[_i];
                    var parts = residue.split(" ");
                    res.push({
                        authAsymId: parts[2],
                        authSeqNumber: Number(parts[1]).valueOf()
                    });
                }
                return res;
            };
            InteractionMap.prototype.resetFocusToTunnel = function () {
                LiteMol.Bootstrap.Command.Entity.Focus.dispatch(this.props.app.props.controller.context, this.props.app.props.controller.context.select(this.props.app.state.currentTunnelRef));
            };
            InteractionMap.prototype.showLayerResidues3DAndFocus = function (layerIds) {
                var _this = this;
                var residues = [];
                for (var _i = 0, layerIds_1 = layerIds; _i < layerIds_1.length; _i++) {
                    var l = layerIds_1[_i];
                    residues = residues.concat(this.getLayerResidues(l));
                }
                var query = (_a = LiteMol.Core.Structure.Query).residues.apply(_a, residues);
                CommonUtils.Selection.SelectionHelper.clearAltSelection(this.props.app.props.controller);
                var t = this.props.app.props.controller.createTransform();
                t.add('polymer-visual', Transformer.Molecule.CreateSelectionFromQuery, { query: query, name: 'Residues' }, { ref: CommonUtils.Selection.SelectionHelper.getAltSelectionVisualRef() })
                    .then(Transformer.Molecule.CreateVisual, { style: Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
                this.props.app.props.controller.applyTransform(t)
                    .then(function (res) {
                    //Focus
                    LiteMol.Bootstrap.Command.Entity.Focus.dispatch(_this.props.app.props.controller.context, _this.props.app.props.controller.context.select(CommonUtils.Selection.SelectionHelper.getAltSelectionVisualRef()));
                });
                var _a;
            };
            InteractionMap.prototype.displayDetailsEventHandler = function (e) {
                if (this.state.touchMode) {
                    return;
                }
                var targetElement = e.target;
                var layerIdx = Number(targetElement.getAttribute("data-layeridx")).valueOf();
                var instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
                var instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[instanceIdx];
                instance.highlightHitbox(layerIdx);
                if (!this.props.app.state.isLayerSelected) {
                    var state = this.props.app.state;
                    state.layerIds = [layerIdx];
                    this.props.app.setState(state);
                    $(window).trigger('layerTriggered', layerIdx);
                }
            };
            InteractionMap.prototype.displayLayerResidues3DEventHandler = function (layerIdxs, instance) {
                var state = this.props.app.state;
                state.layerIds = layerIdxs;
                state.isLayerSelected = state.layerIds.length > 0;
                this.props.app.setState(state);
                if (state.layerIds.length === 0) {
                    CommonUtils.Selection.SelectionHelper.clearAltSelection(this.props.app.props.controller);
                    this.resetFocusToTunnel();
                }
                instance.selectLayers(state.layerIds);
                for (var _i = 0, _a = state.layerIds; _i < _a.length; _i++) {
                    var layerIdx = _a[_i];
                    $(window).trigger('layerTriggered', layerIdx);
                }
                if (state.layerIds.length > 0) {
                    this.showLayerResidues3DAndFocus(state.layerIds);
                }
                $(window).trigger('layerSelected', { layerIds: state.layerIds.slice() });
                $(window).trigger('resize');
            };
            InteractionMap.prototype.getTunnelScale = function (tunnel) {
                var xScale = 0;
                var yScale = 0;
                if (tunnel !== null) {
                    var scale = tunnel.getScale();
                    if (scale !== null) {
                        xScale = scale.x;
                        yScale = scale.y;
                    }
                }
                return {
                    xScale: xScale,
                    yScale: yScale
                };
            };
            InteractionMap.prototype.transformCoordinates = function (x, y, width, height, scale, bounds) {
                var vizualizer = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[this.props.instanceId];
                //Real width can be different to canvas width - hitboxes could run out of space
                var realXScale = 1;
                var realWidth = vizualizer.getCanvas().offsetWidth.valueOf();
                if (realWidth != 0) {
                    realXScale = 1 / (vizualizer.getCanvas().width / realWidth);
                }
                var realYScale = 1;
                var realHeight = vizualizer.getCanvas().offsetHeight.valueOf();
                if (realHeight != 0) {
                    realYScale = 1 / (vizualizer.getCanvas().height / realHeight);
                }
                return {
                    sx: (bounds.x + x * scale.xScale) * realXScale,
                    sy: (bounds.y + y * scale.yScale) * realYScale,
                    dx: (bounds.x + (x + width) * scale.xScale) * realXScale,
                    dy: (bounds.y + (y + height) * scale.yScale) * realYScale
                };
            };
            InteractionMap.prototype.makeCoordinateString = function (x, y, width, height, scale, bounds) {
                var coordinates = this.transformCoordinates(x, y, width, height, scale, bounds);
                return String(coordinates.sx) + ','
                    + String(coordinates.sy) + ','
                    + String(coordinates.dx) + ','
                    + String(coordinates.dy);
            };
            InteractionMap.prototype.generatePhysicalHitboxesCoords = function () {
                var vizualizer = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[this.props.instanceId];
                var data = this.props.data;
                //Data was not prepared yet
                if (vizualizer.isDataDirty()) {
                    vizualizer.prepareData();
                }
                var hitboxes = vizualizer.getHitboxes();
                var tunnels = vizualizer.getTunnels();
                if (tunnels === null
                    || hitboxes === null
                    || (hitboxes.defaultTunnel === null && hitboxes.customizable === null)) {
                    return [];
                }
                var defaultTunnel = tunnels.default;
                var customizableTunnel = tunnels.customizable;
                var dTproperties = null;
                var dTbounds = null;
                if (defaultTunnel !== null) {
                    dTproperties = this.getTunnelScale(defaultTunnel.tunnel);
                    dTbounds = defaultTunnel.bounds;
                }
                var cTproperties = null;
                var cTbounds = null;
                if (customizableTunnel !== null) {
                    cTproperties = this.getTunnelScale(customizableTunnel.tunnel);
                    cTbounds = customizableTunnel.bounds;
                }
                var rv = [];
                for (var i = 0; i < data.length; i++) {
                    if (hitboxes.defaultTunnel !== null && dTproperties !== null && dTbounds !== null) {
                        var hitbox = hitboxes.defaultTunnel[i];
                        rv.push({
                            layerIdx: i,
                            coords: this.makeCoordinateString(hitbox.x, hitbox.y, hitbox.width, hitbox.height, dTproperties, dTbounds)
                        });
                    }
                    if (hitboxes.customizable !== null && cTproperties !== null && cTbounds !== null) {
                        var hitbox = hitboxes.customizable[i];
                        rv.push({
                            layerIdx: i,
                            coords: this.makeCoordinateString(hitbox.x, hitbox.y, hitbox.width, hitbox.height, cTproperties, cTbounds)
                        });
                    }
                }
                return rv;
            };
            InteractionMap.prototype.handleMouseDown = function (e) {
                if (this.state.touchMode) {
                    e.preventDefault();
                    return false;
                }
                var targetElement = e.target;
                var layerIdx = Number(targetElement.getAttribute("data-layeridx")).valueOf();
                var instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
                var instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[instanceIdx];
                var s = this.state;
                if (this.props.app.state.layerIds.length === 1
                    && this.props.app.state.layerIds[0] === layerIdx
                    && this.props.app.state.isLayerSelected) {
                    s.mouseControlStartLayerId = -1;
                    this.displayLayerResidues3DEventHandler([], instance);
                }
                else {
                    s.mouseControlStartLayerId = layerIdx;
                    s.selectionMode = true;
                    this.displayLayerResidues3DEventHandler([s.mouseControlStartLayerId], instance);
                }
                this.setState(s);
                // Disable drag and drop
                e.preventDefault();
                return false;
            };
            InteractionMap.prototype.enableTouchMode = function () {
                var s = this.state;
                s.touchMode = true;
                this.setState(s);
            };
            InteractionMap.prototype.handleTouchStart = function (e) {
                /*
                let targetElement = (e.target as HTMLElement);
                if(!targetElement.hasAttribute("data-layeridx")){
                    return;
                }
    
                let layerIdx = Number(targetElement.getAttribute("data-layeridx")).valueOf();
                let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
                let instance = Vizualizer.ACTIVE_INSTANCES[instanceIdx];
    
                let selectedLayers = instance.getSelectedLayer();
                if(selectedLayers.length > 0){
                    this.displayLayerResidues3DEventHandler([], instance);
                }
                */
            };
            InteractionMap.prototype.handleMove = function (startLayerIdx, endLayerIdx, instance) {
                if (startLayerIdx > endLayerIdx) {
                    var v = startLayerIdx;
                    startLayerIdx = endLayerIdx;
                    endLayerIdx = v;
                }
                var selectedLayers = instance.getSelectedLayer().slice();
                selectedLayers = selectedLayers.sort();
                if (selectedLayers[0] !== startLayerIdx || selectedLayers[selectedLayers.length - 1] !== endLayerIdx) {
                    var layerIds = [];
                    for (var lidx = startLayerIdx; lidx <= endLayerIdx; lidx++) {
                        layerIds.push(lidx);
                    }
                    instance.selectLayers(layerIds);
                }
            };
            InteractionMap.prototype.handleTouchMove = function (e) {
                var startElement = e.target;
                if (!startElement.hasAttribute("data-layeridx")) {
                    return;
                }
                var endElement = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                if (!endElement.hasAttribute("data-layeridx")) {
                    return;
                }
                var startLayerIdx = Number(startElement.getAttribute("data-layeridx")).valueOf();
                var endLayerIdx = Number(endElement.getAttribute("data-layeridx")).valueOf();
                var instanceIdx = Number(startElement.getAttribute("data-instanceidx")).valueOf();
                var instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[instanceIdx];
                this.handleMove(startLayerIdx, endLayerIdx, instance);
            };
            InteractionMap.prototype.handleMouseMove = function (e) {
                if (this.state.mouseControlStartLayerId === -1 || !this.state.selectionMode) {
                    return;
                }
                var startLayerIdx = this.state.mouseControlStartLayerId;
                var targetElement = e.currentTarget;
                if (!targetElement.hasAttribute("data-layeridx")) {
                    return;
                }
                var endLayerIdx = Number(targetElement.getAttribute("data-layeridx")).valueOf();
                var instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
                var instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[instanceIdx];
                this.handleMove(startLayerIdx, endLayerIdx, instance);
            };
            InteractionMap.prototype.handleEnd = function (startLayerIdx, endLayerIdx, instance) {
                if (startLayerIdx > endLayerIdx) {
                    var v = startLayerIdx;
                    startLayerIdx = endLayerIdx;
                    endLayerIdx = v;
                }
                var selectedLayers = instance.getSelectedLayer().slice();
                selectedLayers = selectedLayers.sort();
                if (selectedLayers[0] !== startLayerIdx || selectedLayers[selectedLayers.length - 1] !== endLayerIdx) {
                    for (var lidx = startLayerIdx; lidx <= endLayerIdx; lidx++) {
                        if (lidx in selectedLayers) {
                            continue;
                        }
                        selectedLayers.push(lidx);
                    }
                    this.displayLayerResidues3DEventHandler(selectedLayers, instance);
                }
            };
            InteractionMap.prototype.handleTouchEnd = function (e) {
                var startElement = e.target;
                var endElement = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                var startLayerIdx = Number(startElement.getAttribute("data-layeridx")).valueOf();
                var endLayerIdx = Number(endElement.getAttribute("data-layeridx")).valueOf();
                var instanceIdx = Number(startElement.getAttribute("data-instanceidx")).valueOf();
                var instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[instanceIdx];
                var selectedLayers = instance.getSelectedLayer().slice();
                if (startLayerIdx === endLayerIdx && selectedLayers.length === 1 && selectedLayers[0] === startLayerIdx) {
                    this.displayLayerResidues3DEventHandler([], instance);
                    return;
                }
                if (startLayerIdx === endLayerIdx) {
                    this.displayLayerResidues3DEventHandler([startLayerIdx], instance);
                    return;
                }
                this.handleEnd(startLayerIdx, endLayerIdx, instance);
            };
            InteractionMap.prototype.handleMouseUp = function (e) {
                var endElement = e.currentTarget;
                if (this.state.mouseControlStartLayerId === -1 || !this.state.selectionMode) {
                    return;
                }
                var startLayerIdx = this.state.mouseControlStartLayerId;
                var endLayerIdx = Number(endElement.getAttribute("data-layeridx")).valueOf();
                var instanceIdx = Number(endElement.getAttribute("data-instanceidx")).valueOf();
                var instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[instanceIdx];
                this.handleEnd(startLayerIdx, endLayerIdx, instance);
                var s = this.state;
                s.mouseControlStartLayerId = -1;
                s.selectionMode = false;
                this.setState(s);
            };
            InteractionMap.prototype.isAboveArea = function (x, y) {
                var elementFromPoint = document.elementFromPoint(x, y);
                if (elementFromPoint === null) {
                    return false;
                }
                if (elementFromPoint.tagName === null) {
                    return false;
                }
                return elementFromPoint.tagName.toLowerCase() === "area"
                    || elementFromPoint.tagName.toLowerCase() === "map";
            };
            InteractionMap.prototype.handleMouseOut = function (e) {
                var s = this.state;
                if (!s.selectionMode
                    || e.currentTarget.hasAttribute("data-layeridx")
                    || e.relatedTarget.tagName === null
                    || e.relatedTarget.tagName.toLowerCase() === "area"
                    || this.isAboveArea(e.clientX, e.clientY)) {
                    return;
                }
                s.mouseControlStartLayerId = -1;
                s.selectionMode = false;
                this.setState(s);
                //There is always one instance at most in this application
                var instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[LayersVizualizer.Vizualizer.ACTIVE_INSTANCES.length - 1];
                this.displayLayerResidues3DEventHandler([], instance);
            };
            InteractionMap.prototype.render = function () {
                var areas = [];
                if (this.props.isDOMReady) {
                    var hitboxesCoords = this.generatePhysicalHitboxesCoords();
                    for (var i = 0; i < hitboxesCoords.length; i++) {
                        areas.push(React.createElement("area", { shape: "rect", coords: hitboxesCoords[i].coords.valueOf(), "data-layeridx": String(hitboxesCoords[i].layerIdx.valueOf()), "data-instanceidx": String(this.props.instanceId), onMouseOver: this.displayDetailsEventHandler.bind(this), onMouseDown: this.handleMouseDown.bind(this), onMouseMove: this.handleMouseMove.bind(this), onMouseUp: this.handleMouseUp.bind(this) }));
                    }
                }
                return (React.createElement("map", { name: "layersInteractiveMap" + this.props.instanceId, id: "layer-vizualizer-hitbox-map" + this.props.instanceId, onTouchStart: this.handleTouchStart.bind(this), onTouchMove: this.handleTouchMove.bind(this), onTouchEnd: this.handleTouchEnd.bind(this), onMouseOut: this.handleMouseOut.bind(this) }, areas));
            };
            return InteractionMap;
        }(React.Component));
    })(UI = LayersVizualizer.UI || (LayersVizualizer.UI = {}));
})(LayersVizualizer || (LayersVizualizer = {}));
var LayersVizualizer;
(function (LayersVizualizer) {
    ;
    ;
    ;
    ;
    var DrawableObject = (function () {
        function DrawableObject() {
        }
        return DrawableObject;
    }());
    LayersVizualizer.DrawableObject = DrawableObject;
    var ContextAwareObject = (function (_super) {
        __extends(ContextAwareObject, _super);
        function ContextAwareObject(context) {
            var _this = _super.call(this) || this;
            _this.context = context;
            _this.lineWidth = 1;
            return _this;
        }
        ContextAwareObject.prototype.clipToBounds = function (bounds) {
            this.context.rect(bounds.x, bounds.y, bounds.width, bounds.height);
            this.context.clip();
        };
        ContextAwareObject.prototype.drawFromBounds = function (bounds) {
            this.draw(bounds.x, bounds.y, bounds.width, bounds.height);
        };
        ContextAwareObject.prototype.clear = function (bounds) {
            this.context.clearRect(bounds.x - this.lineWidth, bounds.y - this.lineWidth, bounds.width + this.lineWidth * 2, bounds.height + this.lineWidth * 2);
        };
        return ContextAwareObject;
    }(DrawableObject));
    LayersVizualizer.ContextAwareObject = ContextAwareObject;
    //--
    var Axis = (function (_super) {
        __extends(Axis, _super);
        function Axis(minVal, maxVal, context, countOfParts, isHorizontal, marginPercent, lineWidth) {
            if (isHorizontal === void 0) { isHorizontal = true; }
            if (marginPercent === void 0) { marginPercent = 5; }
            if (lineWidth === void 0) { lineWidth = 2; }
            var _this = _super.call(this, context) || this;
            _this.doHighlight = false; //Žluté podbarvení obdélníku
            _this.lineColor = "#8c8c8c";
            _this.isHorizontal = isHorizontal;
            _this.minVal = minVal;
            _this.maxVal = maxVal;
            _this.countOfParts = countOfParts;
            _this.margin = marginPercent;
            _this.lineWidth = lineWidth;
            return _this;
        }
        Axis.prototype.drawMainLine = function (bounds) {
            if (this.isHorizontal) {
                this.context.moveTo(bounds.x, bounds.y + bounds.height / 2);
                this.context.lineTo(bounds.x + bounds.width, bounds.y + bounds.height / 2);
            }
            else {
                this.context.moveTo(bounds.x + bounds.width / 2, bounds.y);
                this.context.lineTo(bounds.x + bounds.width / 2, bounds.y + bounds.height);
            }
        };
        Axis.prototype.drawPartLine = function (bounds, partIdx) {
            if (this.isHorizontal) {
                var partSize = bounds.width / this.countOfParts;
                var margin = (bounds.height / 100) * this.margin;
                this.context.moveTo(bounds.x + partIdx * partSize, bounds.y + margin);
                this.context.lineTo(bounds.x + partIdx * partSize, bounds.y + (bounds.height - margin));
            }
            else {
                var partSize = bounds.height / this.countOfParts;
                var margin = (bounds.width / 100) * this.margin;
                this.context.moveTo(bounds.x + margin, bounds.y + partIdx * partSize);
                this.context.lineTo(bounds.x + (bounds.width - margin), bounds.y + partIdx * partSize);
            }
        };
        Axis.prototype.draw = function (x, y, width, height) {
            var bounds = { x: x, y: y, width: width, height: height };
            this.clear(bounds);
            this.context.save();
            this.clipToBounds(bounds);
            this.context.strokeStyle = this.lineColor;
            this.context.beginPath();
            this.context.lineWidth = this.lineWidth;
            this.drawMainLine(bounds);
            for (var i = 0; i <= this.countOfParts; i++) {
                this.drawPartLine(bounds, i);
            }
            this.context.closePath();
            this.context.stroke();
            if (this.doHighlight) {
                this.context.fillStyle = "yellow";
                this.context.fillRect(x, y, width, height);
            }
            this.context.restore();
        };
        return Axis;
    }(ContextAwareObject));
    LayersVizualizer.Axis = Axis;
    var CurlyBrackets = (function (_super) {
        __extends(CurlyBrackets, _super);
        function CurlyBrackets(context) {
            var _this = _super.call(this, context) || this;
            _this.lineColor = "#8c8c8c";
            _this.isLeftToRight = true;
            return _this;
        }
        CurlyBrackets.prototype.draw = function (x, y, width, height) {
            //!!!
            this.isLeftToRight = true;
            //!!!
            var bounds = { x: x, y: y, width: width, height: height };
            this.clear(bounds);
            /*
            let radius = bounds.width/2;
            let linelength = bounds.height / 2;

            let lx = bounds.x + radius;
            let r = (this.isLeftToRight?(-1)*radius:radius);
            */
            var border = (bounds.width / 100) * 10;
            var borderVertical = (bounds.height / 100) * 2;
            var radius = (bounds.width - (2 * border)) / 2;
            var lineLength = (bounds.height - (borderVertical * 2)) / 2;
            var p0 = {
                x: bounds.x + border,
                y: bounds.y + borderVertical
            };
            var p1 = {
                x: bounds.x + border + radius,
                y: bounds.y + borderVertical
            };
            var p2 = {
                x: bounds.x + border + radius,
                y: bounds.y + borderVertical + radius
            };
            var p3 = {
                x: bounds.x + border + radius,
                y: bounds.y + borderVertical + lineLength - radius
            };
            var p4 = {
                x: bounds.x + border + radius,
                y: bounds.y + borderVertical + lineLength
            };
            var p5 = {
                x: bounds.x + border + radius * 2,
                y: bounds.y + borderVertical + lineLength
            };
            var p6 = {
                x: bounds.x + border + radius,
                y: bounds.y + borderVertical + lineLength + radius
            };
            var p7 = {
                x: bounds.x + border + radius,
                y: bounds.y + borderVertical + lineLength * 2 - radius
            };
            var p8 = {
                x: bounds.x + border + radius,
                y: bounds.y + borderVertical + lineLength * 2
            };
            var p9 = {
                x: bounds.x + border,
                y: bounds.y + borderVertical + lineLength * 2
            };
            this.context.save();
            this.clipToBounds(bounds);
            this.context.strokeStyle = this.lineColor;
            this.context.lineWidth = 1;
            this.context.beginPath();
            this.context.moveTo(p0.x, p0.y);
            this.context.arc(p0.x, p2.y, radius, 1.5 * Math.PI, 0 * Math.PI);
            this.context.moveTo(p2.x, p2.y);
            this.context.lineTo(p3.x, p3.y);
            this.context.moveTo(p5.x, p5.y);
            this.context.arc(p5.x, p3.y, radius, 0.5 * Math.PI, 1 * Math.PI);
            this.context.moveTo(p5.x, p5.y);
            this.context.lineTo(p5.x, p5.y);
            this.context.moveTo(p6.x, p6.y);
            this.context.arc(p5.x, p6.y, radius, 1 * Math.PI, 1.5 * Math.PI);
            this.context.moveTo(p6.x, p6.y);
            this.context.lineTo(p7.x, p7.y);
            this.context.arc(p9.x, p7.y, radius, 0 * Math.PI, 0.5 * Math.PI);
            this.context.stroke();
            this.context.closePath();
            this.context.restore();
        };
        return CurlyBrackets;
    }(ContextAwareObject));
    LayersVizualizer.CurlyBrackets = CurlyBrackets;
    var ArrowHeadLine = (function (_super) {
        __extends(ArrowHeadLine, _super);
        function ArrowHeadLine(context, isHorizontal) {
            if (isHorizontal === void 0) { isHorizontal = true; }
            var _this = _super.call(this, context) || this;
            _this.lineColor = "#8c8c8c";
            _this.doHighlight = false; //Žluté podbarvení obdélníku
            _this.isHorizontal = isHorizontal;
            _this.lineWidth = 0.5;
            return _this;
        }
        ArrowHeadLine.prototype.draw = function (x, y, width, height) {
            this.bounds = { x: x, y: y, width: width, height: height };
            var xMargin = ((width / 100) * 2);
            var yMargin = ((height / 100) * 15);
            var x1 = (this.isHorizontal ? x + xMargin : x + width / 2 - this.lineWidth / 2);
            var x2 = (this.isHorizontal ? x + width - xMargin : x + width / 2 - this.lineWidth / 2);
            var y1 = (this.isHorizontal ? y + height / 2 - this.lineWidth / 2 : y + yMargin);
            var y2 = (this.isHorizontal ? y + height / 2 - this.lineWidth / 2 : y + height - yMargin);
            this.clear(this.bounds);
            if (this.doHighlight) {
                this.context.save();
                this.context.fillStyle = "yellow";
                this.context.fillRect(x, y, width, height);
                this.context.restore();
            }
            this.context.save();
            this.clipToBounds(this.bounds);
            this.context.strokeStyle = this.lineColor;
            this.context.setLineDash([1, 2]);
            this.context.lineWidth = this.lineWidth;
            //Base line
            this.context.beginPath();
            this.context.moveTo(x1, y1);
            this.context.lineTo(x2, y2);
            this.context.closePath();
            this.context.stroke();
            this.context.restore();
            // draw the starting arrowhead
            var startRadians = Math.atan((y2 - y1) / (x2 - x1));
            startRadians += ((x2 > x1) ? -90 : 90) * Math.PI / 180;
            this.drawArrowhead(x1, y1, startRadians);
            // draw the ending arrowhead
            var endRadians = Math.atan((y2 - y1) / (x2 - x1));
            endRadians += ((x2 > x1) ? 90 : -90) * Math.PI / 180;
            this.drawArrowhead(x2, y2, endRadians);
        };
        ArrowHeadLine.prototype.drawArrowhead = function (x, y, radians) {
            if (this.bounds === void 0) {
                throw new Error("Unsupported state! Bounds not initialized before function call.");
            }
            this.context.save();
            this.clipToBounds(this.bounds);
            this.context.strokeStyle = this.lineColor;
            this.context.fillStyle = this.lineColor;
            this.context.lineWidth = this.lineWidth;
            this.clipToBounds(this.bounds);
            this.context.beginPath();
            this.context.translate(x, y);
            this.context.rotate(radians);
            this.context.moveTo(0, 0);
            this.context.lineTo(2.5, 6);
            this.context.lineTo(0, 0);
            this.context.lineTo(-2.5, 6);
            this.context.lineTo(0, 0);
            this.context.closePath();
            this.context.stroke();
            this.context.restore();
        };
        return ArrowHeadLine;
    }(ContextAwareObject));
    LayersVizualizer.ArrowHeadLine = ArrowHeadLine;
    var TextBox = (function (_super) {
        __extends(TextBox, _super);
        function TextBox(value, context, fontSize, textAlign) {
            if (fontSize === void 0) { fontSize = "medium"; }
            if (textAlign === void 0) { textAlign = "center"; }
            var _this = _super.call(this, context) || this;
            _this.doHighlight = false; //Žluté podbarvení obdélníků s textem
            _this.value = value;
            _this.fontSize = fontSize;
            _this.textAlign = textAlign;
            _this.lineWidth = 2;
            return _this;
        }
        TextBox.prototype.fontSizeToPercent = function (fontSize) {
            if (typeof (fontSize) === "number") {
                return fontSize;
            }
            switch (fontSize) {
                case "small":
                    return 5;
                case "medium":
                    return 6;
                case "big":
                    return 7;
                default:
                    return this.fontSizeToPercent("medium");
            }
        };
        TextBox.prototype.getRealFontSize = function (fontSize) {
            var hUnit = this.context.canvas.height / 100;
            return this.fontSizeToPercent(fontSize) * hUnit;
        };
        TextBox.prototype.draw = function (x, y, width, height) {
            var realTextSize = this.getRealFontSize(this.fontSize);
            this.context.save();
            this.clear({ x: x, y: y, width: width, height: height });
            if (this.doHighlight) {
                this.context.fillStyle = "yellow";
                this.context.fillRect(x, y, width, height);
            }
            this.context.font = "normal normal normal " + realTextSize + "px sans-serif";
            this.context.fillStyle = "#8c8c8c";
            this.context.textAlign = this.textAlign;
            this.context.textBaseline = "middle";
            switch (this.textAlign) {
                case "left":
                    this.context.fillText(this.value, x, y + height / 2, width);
                    break;
                case "center":
                    this.context.fillText(this.value, x + width / 2, y + height / 2, width);
                    break;
                case "right":
                    this.context.fillText(this.value, x + width, y + height / 2, width);
                    break;
            }
            this.context.restore();
        };
        return TextBox;
    }(ContextAwareObject));
    LayersVizualizer.TextBox = TextBox;
    var ColorMixer = (function (_super) {
        __extends(ColorMixer, _super);
        function ColorMixer(minVal, maxVal, context, paletteFunction, paletteFunctionSettings, isHorizontal) {
            if (isHorizontal === void 0) { isHorizontal = false; }
            var _this = _super.call(this, context) || this;
            _this.lineColor = "#8c8c8c";
            _this.minVal = minVal;
            _this.maxVal = maxVal;
            _this.paletteFunction = paletteFunction;
            _this.paletteFunctionSettings = paletteFunctionSettings;
            _this.isHorizontal = isHorizontal;
            return _this;
        }
        ColorMixer.prototype.draw = function (x, y, width, height) {
            var bounds = { x: x, y: y, width: width, height: height };
            this.clear(bounds);
            this.context.save();
            this.clipToBounds(bounds);
            this.context.strokeStyle = this.lineColor;
            var my_gradient = this.context.createLinearGradient(bounds.x + (this.isHorizontal ? bounds.width : 0), bounds.y, bounds.x, bounds.y + (this.isHorizontal ? 0 : bounds.height));
            my_gradient.addColorStop(0, this.paletteFunction(Number(this.maxVal), this.paletteFunctionSettings));
            my_gradient.addColorStop(0.5, this.paletteFunction(Number((this.minVal + this.maxVal) / 2), this.paletteFunctionSettings));
            my_gradient.addColorStop(1, this.paletteFunction(Number(this.minVal), this.paletteFunctionSettings));
            this.context.beginPath();
            this.context.moveTo(bounds.x, bounds.y);
            this.context.fillStyle = my_gradient;
            this.context.lineWidth = this.lineWidth;
            this.context.rect(bounds.x, bounds.y, bounds.width, bounds.height);
            this.context.closePath();
            this.context.fill();
            this.context.stroke();
            this.context.restore();
        };
        return ColorMixer;
    }(ContextAwareObject));
    LayersVizualizer.ColorMixer = ColorMixer;
    var Tunnel = (function (_super) {
        __extends(Tunnel, _super);
        function Tunnel(minVal, maxVal, layers, context, paletteFunction, paletteFunctionSettings, isInverted) {
            if (isInverted === void 0) { isInverted = false; }
            var _this = _super.call(this, context) || this;
            _this.highlightLineWidth = 1;
            _this.lineWidth = 1;
            _this.hitboxLineWidth = 1;
            _this.lineColor = "#8c8c8c";
            _this.hitboxLineColor = "#173133";
            _this.highlightLineColor = '#000';
            _this.highlightedLayerIdx = -1;
            _this.selectedLayers = [];
            _this.layersData = null;
            _this.renderSelectedLock = 0;
            _this.renderSelectedQueue = [];
            _this.minVal = minVal;
            _this.maxVal = maxVal;
            _this.layers = layers;
            _this.paletteFunction = paletteFunction;
            _this.isInverted_ = isInverted;
            _this.paletteFunctionSettings = paletteFunctionSettings;
            _this.hasBounds = false;
            _this.selectedLayers = [];
            _this.layersData = null;
            return _this;
        }
        Tunnel.prototype.setBounds = function (x, y, width, height) {
            this.bounds = { x: x, y: y, width: width, height: height };
            this.scale = {
                x: this.bounds.width / this.maxVal.x,
                y: this.bounds.height / this.maxVal.y
            };
            this.hasBounds = true;
        };
        Tunnel.prototype.clear = function (bounds) {
            this.context.clearRect(bounds.x, bounds.y, bounds.width, bounds.height);
        };
        Tunnel.prototype.draw = function (x, y, width, height) {
            this.setBounds(x, y, width, height);
            this.clear(this.bounds);
            this.renderAllLayers();
            //Render hitboxes to canvas - dotted lines between layers
            this.renderHitboxes();
            this.paintBox();
            this.currentVisualPlain = this.context.getImageData(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
            this.currentVisual = this.currentVisualPlain;
            //this.highlightHitbox(0);
        };
        Tunnel.prototype.renderHitboxes = function () {
            for (var i = 1; i < this.layers.length; i++) {
                this.renderHitbox(i);
            }
        };
        Tunnel.prototype.getHitboxes = function () {
            var rv = [];
            for (var i = 0; i < this.layers.length; i++) {
                rv.push(this.getHitbox(i));
            }
            return rv;
        };
        Tunnel.prototype.highlightHitbox = function (layerIdx) {
            var touchMode = window.TOUCH_MODE;
            var layersData = this.layersData;
            var scale = this.getScale();
            if (layersData === null || scale === null) {
                return;
            }
            var graphLine = layersData.path.slice().sort(function (a, b) { return a.x - b.x; });
            if (this.highlightedLayerIdx >= 0) {
                this.renderSelectedDeselectedLayer(graphLine, this.highlightedLayerIdx, scale, this.bounds, this.selectedLayers.indexOf(this.highlightedLayerIdx) >= 0);
            }
            if (touchMode) {
                this.highlightedLayerIdx = -1;
                return;
            }
            var path = [graphLine[layerIdx], graphLine[layerIdx + 1]];
            var restOfBody = [
                {
                    x: this.bounds.x + this.layers[layerIdx].end * scale.x,
                    y: this.getTop() + (this.isInverted() ? -1 : 1) * this.lineWidth
                },
                {
                    x: this.bounds.x + this.layers[layerIdx].start * scale.x,
                    y: this.getTop() + (this.isInverted() ? -1 : 1) * this.lineWidth
                },
                {
                    x: path[0].x,
                    y: path[0].y
                }
            ];
            this.colorBackground("#cccccc", path, restOfBody);
            this.highlightedLayerIdx = layerIdx;
        };
        Tunnel.prototype.selectLayers = function (layerIds) {
            this.renderSelectedLayers(layerIds.slice());
        };
        Tunnel.prototype.paintBox = function () {
            var firstHitbox = this.getHitbox(0);
            var lastHitbox = this.getHitbox(this.layers.length - 1);
            var r = {
                sx: firstHitbox.x,
                sy: firstHitbox.y,
                ex: lastHitbox.x + lastHitbox.width,
                ey: lastHitbox.y + lastHitbox.height
            };
            this.drawSolidLine(r.sx, r.sy, r.ex, r.sy, this.lineWidth, this.lineColor);
            this.drawSolidLine(r.ex, r.sy, r.ex, r.ey, this.lineWidth, this.lineColor);
            this.drawSolidLine(r.ex, r.ey, r.sx, r.ey, this.lineWidth, this.lineColor);
            this.drawSolidLine(r.sx, r.ey, r.sx, r.sy, this.lineWidth, this.lineColor);
        };
        Tunnel.prototype.getScale = function () {
            if (!this.hasBounds) {
                return null;
            }
            return this.scale;
        };
        Tunnel.prototype.prepareLayersData = function () {
            //Mozilla odmita v urcitych pripadech v 1. polovine tunelu zobrazit barevny prechod kdyz je zapnuty clip()
            //this.clipToBounds(this.bounds);
            var gLine = {
                x0: this.bounds.x,
                y0: 0,
                x1: this.bounds.x + this.bounds.width,
                y1: 0
            };
            var gradient = this.context.createLinearGradient(gLine.x0, gLine.y0, gLine.x1, gLine.y1);
            var path = [];
            var lastColorStop = 0;
            for (var i = 0; i < this.layers.length; i++) {
                lastColorStop = this.prepareLayer(i, gradient, path, lastColorStop);
            }
            var scale = this.getScale();
            if (scale === null) {
                throw new Error("Value of scale not computed");
            }
            var restOfBody = [
                {
                    x: this.bounds.x + this.layers[this.layers.length - 1].end * scale.x,
                    y: this.getBottom()
                },
                {
                    x: this.bounds.x + this.layers[0].start * scale.x,
                    y: this.getBottom()
                },
                path[0]
            ];
            this.layersData = {
                gradient: gradient,
                restOfBody: restOfBody.slice(),
                path: path.slice()
            };
            return this.layersData;
        };
        Tunnel.prototype.renderAllLayers = function () {
            var layersData = this.layersData;
            if (layersData === null) {
                layersData = this.prepareLayersData();
            }
            this.context.save();
            this.context.fillStyle = layersData.gradient;
            this.context.beginPath();
            this.drawPath(layersData.path);
            this.drawPath(layersData.restOfBody);
            this.context.closePath();
            this.context.fill();
            this.context.restore();
            this.context.save();
            this.clipToBounds(this.bounds);
            this.context.strokeStyle = this.lineColor;
            this.context.lineWidth = this.lineWidth;
            this.context.beginPath();
            this.context.moveTo(layersData.path[0].x, layersData.path[0].y);
            this.drawPath(layersData.path);
            this.drawPath(layersData.path.reverse());
            this.context.closePath();
            this.context.stroke();
            this.context.restore();
        };
        Tunnel.prototype.renderSelectedDeselectedLayer = function (graphLine, layerIdx, scale, bounds, selected) {
            var path = [
                {
                    x: graphLine[layerIdx].x,
                    y: graphLine[layerIdx].y
                },
                {
                    x: graphLine[layerIdx + 1].x,
                    y: graphLine[layerIdx + 1].y
                }
            ];
            var selectedLayers = this.selectedLayers.slice().sort(function (a, b) { return a - b; });
            var restOfBody = [
                {
                    x: path[1].x + this.lineWidth,
                    y: path[1].y
                },
                {
                    //x: bounds.x - ((selectedLayers[selectedLayers.length-1]===layerIdx)?this.lineWidth:-this.lineWidth) + this.layers[layerIdx].end*scale.x,
                    x: bounds.x + this.lineWidth + this.layers[layerIdx].end * scale.x,
                    y: this.getTop() + (this.isInverted() ? -1 : 1) * this.lineWidth
                },
                {
                    //x: bounds.x + ((selectedLayers[0]===layerIdx)?this.lineWidth:-this.lineWidth) + this.layers[layerIdx].start*scale.x,
                    x: bounds.x - this.lineWidth + this.layers[layerIdx].start * scale.x,
                    y: this.getTop() + (this.isInverted() ? -1 : 1) * this.lineWidth
                },
                {
                    x: path[0].x - this.lineWidth,
                    y: path[0].y
                }
            ];
            this.colorBackground((selected) ? "#efefef" : "#ffffff", path, restOfBody);
        };
        Tunnel.prototype.colorBackground = function (color, path, restOfBody) {
            this.context.save();
            this.clipToBounds(this.bounds);
            this.context.lineWidth = this.lineWidth;
            this.context.fillStyle = color;
            this.context.beginPath();
            this.context.moveTo(path[0].x, path[0].y);
            this.drawPath(path.concat(restOfBody));
            this.context.closePath();
            this.context.fill();
            this.context.strokeStyle = this.lineColor;
            this.context.beginPath();
            this.context.moveTo(path[0].x, path[0].y);
            this.drawPath(path);
            this.drawPath(path.reverse());
            this.context.closePath();
            this.context.stroke();
            this.context.restore();
        };
        Tunnel.prototype.renderSelectedLayers = function (layerIds, internalCall) {
            var layersData = this.layersData;
            if (layersData === null) {
                throw new Error("Data not prepared");
            }
            var bounds = this.bounds;
            if (internalCall === void 0) {
                internalCall = false;
            }
            if (this.renderSelectedLock++ > 0 && !internalCall) {
                this.renderSelectedQueue.unshift(layerIds);
                return;
            }
            var selectedOld = this.selectedLayers.slice().sort(function (a, b) { return a - b; });
            var selected = layerIds.slice().sort(function (a, b) { return a - b; });
            var graphLine = layersData.path.slice().sort(function (a, b) { return a.x - b.x; });
            if (graphLine.length - 1 < selected.length) {
                throw new Error("Data are not synchronized correctly!");
            }
            var scale = this.getScale();
            if (scale === null) {
                throw new Error("Value of scale not computed");
            }
            var toSelect = selected.filter(function (v, i, a) { return !(selectedOld.indexOf(v) >= 0); });
            var toUnSelect = selectedOld.filter(function (v, i, a) { return !(selected.indexOf(v) >= 0); });
            if (toSelect.length === 0 && toUnSelect.length === 0) {
                this.handleQueue(internalCall);
                return;
            }
            for (var _i = 0, toSelect_1 = toSelect; _i < toSelect_1.length; _i++) {
                var layerIdx = toSelect_1[_i];
                this.renderSelectedDeselectedLayer(graphLine, layerIdx, scale, bounds, true);
            }
            for (var _a = 0, toUnSelect_1 = toUnSelect; _a < toUnSelect_1.length; _a++) {
                var layerIdx = toUnSelect_1[_a];
                this.renderSelectedDeselectedLayer(graphLine, layerIdx, scale, bounds, false);
            }
            this.context.save();
            var endBorderline = [
                {
                    x: bounds.x + this.layers[this.layers.length - 1].end * scale.x,
                    y: this.getBottom()
                },
                {
                    x: bounds.x + this.layers[this.layers.length - 1].end * scale.x,
                    y: this.getTop()
                }
            ];
            this.context.strokeStyle = "#d1d1d1";
            this.context.lineWidth = this.lineWidth;
            this.context.beginPath();
            this.context.moveTo(endBorderline[0].x, endBorderline[0].y);
            this.drawPath(endBorderline);
            this.drawPath(endBorderline.reverse());
            this.context.closePath();
            this.context.stroke();
            if (toSelect.indexOf(0) >= 0) {
                var line = [
                    {
                        x: bounds.x,
                        y: this.getBottom()
                    },
                    {
                        x: bounds.x,
                        y: this.getTop()
                    }
                ];
                this.context.beginPath();
                this.context.moveTo(line[0].x, line[0].y);
                this.drawPath(line);
                this.drawPath(line.reverse());
                this.context.closePath();
                this.context.stroke();
            }
            this.context.restore();
            this.selectedLayers = selected;
            this.handleQueue(internalCall);
        };
        Tunnel.prototype.handleQueue = function (internalCall) {
            if (this.renderSelectedQueue.length > 0) {
                var layerIdsNext = this.renderSelectedQueue.pop();
                if (layerIdsNext !== void 0) {
                    this.renderSelectedLayers(layerIdsNext, true);
                }
            }
            if (!internalCall) {
                this.renderSelectedLock = 0;
            }
        };
        Tunnel.prototype.drawPath = function (path) {
            for (var i = 0; i < path.length; i++) {
                this.context.lineTo(path[i].x, path[i].y);
            }
        };
        Tunnel.prototype.prepareLayer = function (layerIdx, gradient, path, lastColorStop) {
            if (layerIdx < 0) {
                throw new Error("layerIdx must be greater or equal to 0");
            }
            var totalLenght = this.layers[this.layers.length - 1].end - this.layers[0].start;
            var currLength = this.layers[layerIdx].end - this.layers[0].start;
            var scale = this.getScale();
            if (scale === null) {
                throw new Error("Value of scale not computed in time!");
            }
            // Barvy gradientu
            var prevColorValue = ((layerIdx - 1) in this.layers)
                ? this.layers[layerIdx - 1].value
                : this.layers[layerIdx].value;
            var curColorValue = this.layers[layerIdx].value;
            var prevRadius = ((layerIdx - 1) in this.layers)
                ? this.layers[layerIdx - 1].radius
                : this.layers[layerIdx].radius;
            var bottom = this.getBottom();
            var end = this.layers[layerIdx].end;
            var start = this.layers[layerIdx].start;
            if (layerIdx > 0) {
                start = this.bounds.x + this.layers[layerIdx - 1].end * scale.x;
            }
            var inversionConstant = (this.isInverted()) ? (-1) : 1;
            if (layerIdx == 0) {
                path.push({
                    x: this.bounds.x + start * scale.x,
                    y: bottom - prevRadius * scale.y * inversionConstant
                });
            }
            path.push({
                x: this.bounds.x + end * scale.x,
                y: bottom - this.layers[layerIdx].radius * scale.y * inversionConstant
            });
            var color = this.paletteFunction(Number(prevColorValue), this.paletteFunctionSettings);
            var currentColorStop = 0;
            if (layerIdx != 0) {
                color = this.paletteFunction(Number(curColorValue), this.paletteFunctionSettings);
                currentColorStop = (currLength / totalLenght);
            }
            if (gradient !== null) {
                gradient.addColorStop(currentColorStop, color);
            }
            return currentColorStop;
        };
        Tunnel.prototype.getHitbox = function (layerIdx) {
            return {
                x: this.layers[layerIdx].start,
                y: 0,
                width: this.layers[layerIdx].end - this.layers[layerIdx].start,
                height: this.maxVal.y,
                layerID: layerIdx
            };
        };
        Tunnel.prototype.moveTo = function (x, y) {
            var bottom = this.getBottom();
            var inversionKoeficient = 1;
            if (this.isInverted_) {
                inversionKoeficient = -1;
            }
            this.context.moveTo(this.bounds.x + x * this.scale.x, bottom - y * this.scale.y * inversionKoeficient);
        };
        Tunnel.prototype.lineTo = function (x, y) {
            var bottom = this.getBottom();
            var inversionKoeficient = 1;
            if (this.isInverted_) {
                inversionKoeficient = -1;
            }
            this.context.lineTo(this.bounds.x + x * this.scale.x, bottom - y * this.scale.y * inversionKoeficient);
        };
        Tunnel.prototype.drawSolidLine = function (sx, sy, ex, ey, lineWidth, strokeStyle) {
            if (lineWidth === void 0) { lineWidth = 1; }
            if (strokeStyle === void 0) { strokeStyle = "#000"; }
            this.context.save();
            this.clipToBounds(this.bounds);
            this.context.strokeStyle = strokeStyle;
            this.context.lineWidth = lineWidth;
            this.context.beginPath();
            this.moveTo(sx, sy);
            this.lineTo(ex, ey);
            this.context.closePath();
            this.context.stroke();
            this.context.restore();
        };
        Tunnel.prototype.renderHitbox = function (layerIdx) {
            if (layerIdx == 0) {
                return;
            }
            var scale = this.getScale();
            if (scale === null) {
                throw new Error("Value of scale has not been computed!");
            }
            var inversionConstant = (this.isInverted()) ? -1 : 1;
            var hitbox = this.getHitbox(layerIdx);
            var maxY = this.layers[layerIdx - 1].radius;
            var yStart = this.bounds.y
                + hitbox.y * scale.y
                + (this.isInverted() ? 0 : hitbox.height * scale.y - (maxY * scale.y))
                + this.lineWidth;
            var height = maxY * scale.y;
            var bgColor = "#ffffff";
            //Check if using HTML Canvas or SVG wraper, if so - get real bg color
            if (this.context.getImageData(0, 0, 1, 1) !== null
                && this.context.getImageData(0, 0, 1, 1) !== void 0) {
                bgColor = LayersVizualizer.Colors.rgbToHex(LayersVizualizer.Colors.Uint8ClampedArrayToRGB(this.context.getImageData(this.bounds.x + hitbox.x * scale.x, yStart + height / 2, 1, 1).data));
            }
            this.context.save();
            this.clipToBounds({
                x: this.bounds.x + hitbox.x * scale.x,
                y: yStart,
                width: hitbox.width * scale.x,
                height: height - this.lineWidth * 2
            });
            this.context.strokeStyle = LayersVizualizer.Colors.invertHexContrastGrayscale(bgColor); //this.lineColor;
            this.context.lineWidth = this.hitboxLineWidth;
            this.context.setLineDash([1, 3]);
            this.context.beginPath();
            this.moveTo(hitbox.x, hitbox.y);
            this.lineTo(hitbox.x, hitbox.y + hitbox.height);
            this.context.closePath();
            this.context.stroke();
            this.context.restore();
        };
        Tunnel.prototype.getBottom = function () {
            return (this.isInverted_)
                ? this.bounds.y
                : this.bounds.y + this.bounds.height;
        };
        Tunnel.prototype.getTop = function () {
            return (this.isInverted_)
                ? this.bounds.y + this.bounds.height
                : this.bounds.y;
        };
        Tunnel.prototype.isInverted = function () {
            return this.isInverted_;
        };
        return Tunnel;
    }(ContextAwareObject));
    LayersVizualizer.Tunnel = Tunnel;
})(LayersVizualizer || (LayersVizualizer = {}));
var LayersVizualizer;
(function (LayersVizualizer) {
    ;
    ;
    ;
    var Vizualizer = (function () {
        function Vizualizer(uiContainerId, settings) {
            this.verticalAxisChunkCount = 4;
            //Register instance
            if (Vizualizer.ACTIVE_INSTANCES == null) {
                Vizualizer.ACTIVE_INSTANCES = [];
            }
            this.publicInstanceIdx = Vizualizer.ACTIVE_INSTANCES.length;
            Vizualizer.ACTIVE_INSTANCES.push(this);
            this.uiContainerId = uiContainerId;
            this.configBySettings(settings);
            this.canvasId = "layer-vizualizer-canvas" + String(this.publicInstanceIdx);
            this.configureColors();
            this.__tunnels = {
                default: null,
                customizable: null
            };
            this.dataDirty = true;
            this.isDOMBound = false;
            this.currentLayerIdx = 0;
            this.tmpCanvasId = "tmpCanvas_" + this.publicInstanceIdx;
            this.selectedLayerIds = [];
            this.__colorFunctionSetings = new Map();
            //Dynamic canvas resizing
            this.resizePercentPrecision = 1; //5% difference between real and given => cause resizing of canvas
            window.addEventListener("resize", this.onWindowResize.bind(this));
            $(window).on("lvContentResize", this.onContentResize.bind(this));
        }
        Vizualizer.prototype.getPublicInstanceIdx = function () {
            return this.publicInstanceIdx;
        };
        Vizualizer.prototype.getCurrentColoringSettings = function (tunnelType) {
            return this.__colorFunctionSetings.get(tunnelType);
        };
        Vizualizer.prototype.setCurrentColorFunctionSettings = function (tunnelType, colorFunctionSetings) {
            this.__colorFunctionSetings.set(tunnelType, colorFunctionSetings);
        };
        Vizualizer.prototype.isDataDirty = function () {
            return this.dataDirty;
        };
        Vizualizer.prototype.getCanvas = function () {
            //DOM binding check
            if (!this.isDOMBound) {
                this.rebindDOMRefs();
            }
            return this.__canvas;
        };
        Vizualizer.prototype.getContext = function () {
            //DOM binding check
            if (!this.isDOMBound) {
                this.rebindDOMRefs();
            }
            return this.__context;
        };
        Vizualizer.prototype.getTunnels = function () {
            if (this.dataDirty) {
                return null;
            }
            return this.__tunnels;
        };
        Vizualizer.prototype.onWindowResize = function (e) {
            if (document.getElementById(this.canvasId) === null) {
                return;
            }
            var canvas = this.getCanvas();
            var context = this.getContext();
            if (canvas === void 0 || context === void 0 || !this.isElementVisible(canvas) || !CommonUtils.Tabs.isActive("left-tabs", "1")) {
                return;
            }
            var xUnit = canvas.width / 100;
            var yUnit = canvas.height / 100;
            var x_diff = Math.abs(canvas.width - canvas.offsetWidth) / xUnit;
            var y_diff = Math.abs(canvas.height - canvas.offsetHeight) / yUnit;
            if (x_diff < this.resizePercentPrecision
                && y_diff < this.resizePercentPrecision) {
                return;
            }
            this.resizeCanvas();
            this.vizualize();
            this.highlightHitbox(this.currentLayerIdx);
        };
        Vizualizer.prototype.isElementVisible = function (element) {
            if (element.style.display === "none" || element.style.visibility === "hidden") {
                return false;
            }
            if (element.parentElement === null || element.parentElement === void 0) {
                return true;
            }
            return this.isElementVisible(element.parentElement);
        };
        Vizualizer.prototype.onContentResize = function (e) {
            if (document.getElementById(this.canvasId) === null) {
                return;
            }
            var canvas = this.getCanvas();
            var context = this.getContext();
            if (canvas === void 0 || context === void 0 || !this.isElementVisible(canvas) || !CommonUtils.Tabs.isActive("left-tabs", "1")) {
                return;
            }
            this.resizeCanvas();
            this.vizualize();
            this.highlightHitbox(this.currentLayerIdx);
        };
        Vizualizer.prototype.resizeCanvas = function () {
            var canvas = this.getCanvas();
            var context = this.getContext();
            if (canvas === void 0 || context === void 0) {
                return;
            }
            context.clearRect(0, 0, canvas.width, canvas.height);
            canvas.setAttribute("width", String(canvas.offsetWidth));
            canvas.setAttribute("height", String(canvas.offsetHeight));
        };
        Vizualizer.prototype.configBySettings = function (settings) {
            this.coloringPropertyKey = "Hydropathy";
            if (settings.coloringProperty != null) {
                this.coloringPropertyKey = settings.coloringProperty.valueOf();
            }
            this.customColoringPropertyKey = this.coloringPropertyKey;
            this.useColorMinMax = true;
            if (settings.useColorMinMax != null) {
                this.useColorMinMax = settings.useColorMinMax.valueOf();
            }
            this.absCenterPositions = new Map();
            this.absCenterPositions.set("Polarity", 5);
            this.absCenterPositions.set("Hydropathy", 0);
            this.absCenterPositions.set("Hydrophobicity", 0);
            this.absCenterPositions.set("Mutability", 75);
            this.absCenterPositions.set("Charge", 0);
            this.absCenterPositions.set("NumPositives", 0);
            this.absCenterPositions.set("NumNegatives", 0);
            this.absCenterPositions.set("LogP", 0.78);
            this.absCenterPositions.set("LogD", -0.205);
            this.absCenterPositions.set("LogS", 0.075);
            this.absCenterPositions.set("Ionizable", 0);
            this.absCenterPositions.set("BRadius", 3);
            this.absColorValueMax = new Map();
            this.absColorValueMax.set("Polarity", 52);
            if (settings.colorMaxValue !== void 0 && settings.colorMaxValue.Polarity !== void 0) {
                this.absColorValueMax.set("Polarity", settings.colorMaxValue.Polarity.valueOf());
            }
            this.absColorValueMax.set("Mutability", 117);
            if (settings.colorMaxValue !== void 0 && settings.colorMaxValue.Mutability !== void 0) {
                this.absColorValueMax.set("Mutability", settings.colorMaxValue.Mutability.valueOf());
            }
            this.absColorValueMax.set("Hydropathy", 4.5);
            if (settings.colorMaxValue !== void 0 && settings.colorMaxValue.Hydropathy !== void 0) {
                this.absColorValueMax.set("Hydropathy", settings.colorMaxValue.Hydropathy.valueOf());
            }
            this.absColorValueMax.set("Hydrophobicity", 1.81);
            if (settings.colorMaxValue !== void 0 && settings.colorMaxValue.Hydrophobicity !== void 0) {
                this.absColorValueMax.set("Hydrophobicity", settings.colorMaxValue.Hydrophobicity.valueOf());
            }
            this.absColorValueMax.set("Charge", 5);
            if (settings.colorMaxValue !== void 0 && settings.colorMaxValue.Charge !== void 0) {
                this.absColorValueMax.set("Charge", settings.colorMaxValue.Charge.valueOf());
            }
            this.absColorValueMax.set("NumPositives", 5);
            if (settings.colorMaxValue !== void 0 && settings.colorMaxValue.NumPositives !== void 0) {
                this.absColorValueMax.set("NumPositives", settings.colorMaxValue.NumPositives.valueOf());
            }
            this.absColorValueMax.set("NumNegatives", 5);
            if (settings.colorMaxValue !== void 0 && settings.colorMaxValue.NumNegatives !== void 0) {
                this.absColorValueMax.set("NumNegatives", settings.colorMaxValue.NumNegatives.valueOf());
            }
            this.absColorValueMax.set("LogP", 2.59);
            if (settings.colorMaxValue !== void 0 && settings.colorMaxValue.LogP !== void 0) {
                this.absColorValueMax.set("LogP", settings.colorMaxValue.LogP.valueOf());
            }
            this.absColorValueMax.set("LogD", 2.59);
            if (settings.colorMaxValue !== void 0 && settings.colorMaxValue.LogD !== void 0) {
                this.absColorValueMax.set("LogD", settings.colorMaxValue.LogD.valueOf());
            }
            this.absColorValueMax.set("LogS", 2.63);
            if (settings.colorMaxValue !== void 0 && settings.colorMaxValue.LogS !== void 0) {
                this.absColorValueMax.set("LogS", settings.colorMaxValue.LogS.valueOf());
            }
            this.absColorValueMax.set("Ionizable", 5);
            if (settings.colorMaxValue !== void 0 && settings.colorMaxValue.Ionizable !== void 0) {
                this.absColorValueMax.set("Ionizable", settings.colorMaxValue.Ionizable.valueOf());
            }
            this.absColorValueMax.set("BRadius", 6);
            if (settings.colorMaxValue !== void 0 && settings.colorMaxValue.BRadius !== void 0) {
                this.absColorValueMax.set("BRadius", settings.colorMaxValue.BRadius.valueOf());
            }
            this.absColorValueMin = new Map();
            this.absColorValueMin.set("Polarity", 0);
            if (settings.colorMinValue !== void 0 && settings.colorMinValue.Polarity !== void 0) {
                this.absColorValueMin.set("Polarity", settings.colorMinValue.Polarity.valueOf());
            }
            this.absColorValueMin.set("Mutability", 25);
            if (settings.colorMinValue !== void 0 && settings.colorMinValue.Mutability !== void 0) {
                this.absColorValueMin.set("Mutability", settings.colorMinValue.Mutability.valueOf());
            }
            this.absColorValueMin.set("Hydropathy", -4.5);
            if (settings.colorMinValue !== void 0 && settings.colorMinValue.Hydropathy !== void 0) {
                this.absColorValueMin.set("Hydropathy", settings.colorMinValue.Hydropathy.valueOf());
            }
            this.absColorValueMin.set("Hydrophobicity", -1.14);
            if (settings.colorMinValue !== void 0 && settings.colorMinValue.Hydrophobicity !== void 0) {
                this.absColorValueMin.set("Hydrophobicity", settings.colorMinValue.Hydrophobicity.valueOf());
            }
            this.absColorValueMin.set("Charge", -5);
            if (settings.colorMinValue !== void 0 && settings.colorMinValue.Charge !== void 0) {
                this.absColorValueMin.set("Charge", settings.colorMinValue.Charge.valueOf());
            }
            this.absColorValueMin.set("NumPositives", 0);
            if (settings.colorMinValue !== void 0 && settings.colorMinValue.NumPositives !== void 0) {
                this.absColorValueMin.set("NumPositives", settings.colorMinValue.NumPositives.valueOf());
            }
            this.absColorValueMin.set("NumNegatives", 0);
            if (settings.colorMinValue !== void 0 && settings.colorMinValue.NumNegatives !== void 0) {
                this.absColorValueMin.set("NumNegatives", settings.colorMinValue.NumNegatives.valueOf());
            }
            this.absColorValueMin.set("LogP", -1.03);
            if (settings.colorMinValue !== void 0 && settings.colorMinValue.LogP !== void 0) {
                this.absColorValueMin.set("LogP", settings.colorMinValue.LogP.valueOf());
            }
            this.absColorValueMin.set("LogD", -3);
            if (settings.colorMinValue !== void 0 && settings.colorMinValue.LogD !== void 0) {
                this.absColorValueMin.set("LogD", settings.colorMinValue.LogD.valueOf());
            }
            this.absColorValueMin.set("LogS", -2.48);
            if (settings.colorMinValue !== void 0 && settings.colorMinValue.LogS !== void 0) {
                this.absColorValueMin.set("LogS", settings.colorMinValue.LogS.valueOf());
            }
            this.absColorValueMin.set("Ionizable", 0);
            if (settings.colorMinValue !== void 0 && settings.colorMinValue.Ionizable !== void 0) {
                this.absColorValueMin.set("LogS", settings.colorMinValue.Ionizable.valueOf());
            }
            this.absColorValueMin.set("BRadius", 0);
            if (settings.colorMinValue !== void 0 && settings.colorMinValue.BRadius !== void 0) {
                this.absColorValueMin.set("BRadius", settings.colorMinValue.BRadius.valueOf());
            }
            this.radiusPropertyKey = "MinRadius";
            if (settings.radiusProperty != null) {
                this.radiusPropertyKey = settings.radiusProperty;
            }
            this.customRadiusPropertyKey = this.radiusPropertyKey;
            if (settings.customRadiusProperty != null) {
                this.customRadiusPropertyKey = settings.customRadiusProperty;
            }
            this.skipMiddle = false;
            if (settings.skipMiddleColor != null) {
                this.skipMiddle = settings.skipMiddleColor.valueOf();
            }
            this.topMarginPercent = 10;
            if (settings.topMargin != null) {
                this.topMarginPercent = settings.topMargin.valueOf();
            }
        };
        Vizualizer.prototype.configureColors = function () {
            var maxYellow = { r: 251, g: 255, b: 7 };
            var middleYellow = { r: 240, g: 248, b: 190 };
            var maxBlue = { r: 0, g: 0, b: 255 };
            var middleBlue = { r: 253, g: 253, b: 255 };
            var maxRed = { r: 255, g: 0, b: 0 };
            var middleRed = { r: 253, g: 253, b: 225 };
            var maxWhite = { r: 255, g: 255, b: 255 };
            var middleWhite = { r: 240, g: 240, b: 240 };
            var maxPurple = { r: 107, g: 9, b: 107 };
            var middlePurple = { r: 220, g: 188, b: 220 };
            var middleBlack = { r: 183, g: 183, b: 183 };
            var maxBlack = { r: 0, g: 0, b: 0 };
            this.minColor = {
                Hydropathy: maxBlue,
                Hydrophobicity: maxBlue,
                Mutability: maxBlue,
                Polarity: maxYellow,
                Charge: maxRed,
                NumPositives: maxWhite,
                NumNegatives: maxWhite,
                LogP: maxBlue,
                LogD: maxBlue,
                LogS: maxYellow,
                Ionizable: maxWhite,
                BRadius: maxWhite
            };
            this.minColorMiddle = {
                Hydropathy: middleBlue,
                Hydrophobicity: middleBlue,
                Mutability: middleBlue,
                Polarity: middleYellow,
                Charge: middleRed,
                NumPositives: middleWhite,
                NumNegatives: middleWhite,
                LogP: middleBlue,
                LogD: middleBlue,
                LogS: middleYellow,
                Ionizable: middleWhite,
                BRadius: middleWhite
            };
            this.maxColorMiddle = {
                Hydropathy: middleYellow,
                Hydrophobicity: middleYellow,
                Mutability: middleRed,
                Polarity: middleBlue,
                Charge: middleBlue,
                NumPositives: middleBlue,
                NumNegatives: middleRed,
                LogP: middleYellow,
                LogD: middleYellow,
                LogS: middleBlue,
                Ionizable: middlePurple,
                BRadius: middleBlack
            };
            this.maxColor = {
                Hydropathy: maxYellow,
                Hydrophobicity: maxYellow,
                Mutability: maxRed,
                Polarity: maxBlue,
                Charge: maxBlue,
                NumPositives: maxBlue,
                NumNegatives: maxRed,
                LogP: maxYellow,
                LogD: maxYellow,
                LogS: maxBlue,
                Ionizable: maxPurple,
                BRadius: maxBlack
            };
        };
        Vizualizer.prototype.deselectLayers = function () {
            this.selectedLayerIds = [];
            var tunnels = this.getTunnels();
            if (tunnels === null) {
                return;
            }
            if (tunnels.default !== null) {
                tunnels.default.tunnel.selectLayers([]);
            }
            if (tunnels.customizable !== null) {
                tunnels.customizable.tunnel.selectLayers([]);
            }
        };
        Vizualizer.prototype.selectLayers = function (layerIds) {
            this.selectedLayerIds = layerIds;
            var tunnels = this.getTunnels();
            if (tunnels === null) {
                return;
            }
            if (tunnels.default !== null) {
                tunnels.default.tunnel.selectLayers(this.selectedLayerIds);
            }
            if (tunnels.customizable !== null) {
                tunnels.customizable.tunnel.selectLayers(this.selectedLayerIds);
            }
        };
        Vizualizer.prototype.getSelectedLayer = function () {
            return this.selectedLayerIds;
        };
        Vizualizer.prototype.setResizePercentPrecision = function (percentPrecision) {
            this.resizePercentPrecision = percentPrecision;
        };
        Vizualizer.prototype.getResizePercentPrecision = function () {
            return this.resizePercentPrecision;
        };
        Vizualizer.prototype.setColorBoundsMode = function (mode) {
            this.useColorMinMax = (mode == "Min/max");
        };
        Vizualizer.prototype.rebindDOMRefs = function () {
            var cnvs = document.getElementById(this.canvasId);
            if (cnvs == null) {
                throw new Error("Canvas element with id " + String(this.canvasId) + " not found");
            }
            this.__canvas = cnvs;
            var cntx = this.__canvas.getContext("2d");
            if (cntx == null) {
                throw new Error("Cannot obtain 2D canvas context");
            }
            this.__context = cntx;
            this.topAirBorderHeight = ((this.__canvas.height / 100) * this.topMarginPercent);
            this.isDOMBound = true;
            this.resizeCanvas();
        };
        /** Datasource change **/
        Vizualizer.prototype.setData = function (layersData) {
            this.currentLayerIdx = -1;
            this.selectedLayerIds = [];
            this.data = layersData;
            this.dataDirty = true;
        };
        Vizualizer.prototype.prepareData = function () {
            if (this.data.length == 0) {
                console.log("ERR: no data supplied!");
                return;
            }
            this.maxX = this.data[this.data.length - 1].EndDistance;
            this.maxY = this.data[0][this.radiusPropertyKey];
            this.customMaxY = this.data[0][this.customRadiusPropertyKey];
            var val = this.getLayerPropertyValue(this.coloringPropertyKey, 0);
            if (val == null) {
                throw new Error("Cannot init LayerVizualizer due to invalid settings - coloringProperty: "
                    + String(this.coloringPropertyKey));
            }
            this.minColoringValue = new Map();
            this.maxColoringValue = new Map();
            var keys = [];
            keys.push("BRadius");
            for (var key in this.data[0].Properties) {
                keys.push(key);
                this.minColoringValue.set(key, this.data[0].Properties[key]);
                this.maxColoringValue.set(key, this.data[0].Properties[key]);
            }
            this.minColoringValue.set('BRadius', this.data[0].MinBRadius);
            this.maxColoringValue.set('BRadius', this.data[0].MinBRadius);
            for (var i = 0; i < this.data.length; i++) {
                this.maxY = Math.max(this.maxY, this.data[i][this.radiusPropertyKey]);
                this.customMaxY = Math.max(this.customMaxY, this.data[i][this.customRadiusPropertyKey]);
                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    var key = keys_1[_i];
                    var curVal = this.getLayerPropertyValue(key, i);
                    if (curVal === void 0) {
                        throw new Error("Corrupted data!");
                    }
                    var oldMinVal = this.minColoringValue.get(key);
                    if (oldMinVal === void 0 || curVal.valueOf() < oldMinVal.valueOf()) {
                        this.minColoringValue.set(key, curVal.valueOf());
                    }
                    var oldMaxVal = this.maxColoringValue.get(key);
                    if (oldMaxVal === void 0 || curVal.valueOf() > oldMaxVal.valueOf()) {
                        this.maxColoringValue.set(key, curVal.valueOf());
                    }
                }
            }
            this.dataDirty = false;
            this.currentLayerIdx = 0;
        };
        /** Layer vizualization **/
        Vizualizer.prototype.getComponentsPositioning = function () {
            var canvas = this.getCanvas();
            if (canvas === null || canvas === void 0) {
                throw new Error("Canvas element is not bound!");
            }
            var currentWidth = canvas.width;
            var currentHeight = canvas.height;
            var colorMixerMinPxWidth = 150;
            var distanceLabelMinPxWidth = 80;
            var toRealPx = function (width, height, component) {
                return component.toBounds(width, height);
            };
            var toPercent = function (width, height, realX, realY) {
                return {
                    x: (realX / width) * 100,
                    y: (realY / height) * 100
                };
            };
            var positioning = {
                defaultTunnel: new LayersVizualizer.Component.Paintable(),
                customizableTunnel: new LayersVizualizer.Component.Paintable(),
                horizontalAxis: new LayersVizualizer.Component.Axis(),
                verticalAxis_1: new LayersVizualizer.Component.Axis(),
                verticalAxis_2: new LayersVizualizer.Component.Axis(),
                defaultColorMixer: new LayersVizualizer.Component.Paintable(),
                defaultColorMixerHorizontal: new LayersVizualizer.Component.Paintable(),
                customizableColorMixer: new LayersVizualizer.Component.Paintable(),
                customizableColorMixerHorizontal: new LayersVizualizer.Component.Paintable(),
                vAxis1TopLabel: new LayersVizualizer.Component.Positionable(),
                vAxis2BottomLabel: new LayersVizualizer.Component.Positionable(),
                axisLeftZeroLabel: new LayersVizualizer.Component.Positionable(),
                horizontalAxisRightLabel: new LayersVizualizer.Component.Positionable(),
                dColorMixerTopLabel: new LayersVizualizer.Component.Positionable(),
                dColorMixerBottomLabel: new LayersVizualizer.Component.Positionable(),
                dColorMixerLeftLabel: new LayersVizualizer.Component.Positionable(),
                dColorMixerRightLabel: new LayersVizualizer.Component.Positionable(),
                cColorMixerTopLabel: new LayersVizualizer.Component.Positionable(),
                cColorMixerBottomLabel: new LayersVizualizer.Component.Positionable(),
                cColorMixerLeftLabel: new LayersVizualizer.Component.Positionable(),
                cColorMixerRightLabel: new LayersVizualizer.Component.Positionable(),
                defaultCurlyBrackets: new LayersVizualizer.Component.Positionable(),
                customizableCurlyBrackets: new LayersVizualizer.Component.Positionable(),
                customizableCurlyBracketsLabel: new LayersVizualizer.Component.Positionable(),
                defaultCurlyBracketsLabel: new LayersVizualizer.Component.Positionable(),
                defaultArrowheadLine: new LayersVizualizer.Component.Positionable(),
                customizableArrowheadLine: new LayersVizualizer.Component.Positionable(),
                defaultArrowheadLineLabel: new LayersVizualizer.Component.Positionable(),
                customizableArrowheadLineLabel: new LayersVizualizer.Component.Positionable(),
                defaultColorMixerLabel: new LayersVizualizer.Component.Positionable(),
                customizableColorMixerLabel: new LayersVizualizer.Component.Positionable()
            };
            var dtHeight = 30; //35
            var dtTop = 13;
            var dtmTop = 0;
            var haTop = dtTop + dtmTop + dtHeight;
            var haHeight = 10;
            var smallLabelHeight = haHeight / 2;
            var dtWidth = 80;
            //Default tunnel
            {
                positioning.defaultTunnel.left = 8; //14
                positioning.defaultTunnel.top = dtTop;
                positioning.defaultTunnel.marginTop = dtmTop;
                positioning.defaultTunnel.marginLeft = 0;
                positioning.defaultTunnel.marginRight = 0;
                positioning.defaultTunnel.width = dtWidth;
                positioning.defaultTunnel.height = dtHeight; //38
            }
            //Customizable tunnel
            {
                positioning.customizableTunnel.left = positioning.defaultTunnel.left;
                positioning.customizableTunnel.marginTop = 2;
                positioning.customizableTunnel.marginLeft = 0;
                positioning.customizableTunnel.marginRight = 0;
                positioning.customizableTunnel.width = dtWidth;
                positioning.customizableTunnel.height = dtHeight;
                positioning.customizableTunnel.top = haTop + haHeight;
            }
            //Default Color Mixer
            {
                positioning.defaultColorMixer.left = positioning.defaultTunnel.left
                    + positioning.defaultTunnel.marginLeft
                    + positioning.defaultTunnel.width;
                positioning.defaultColorMixer.marginTop = 5;
                positioning.defaultColorMixer.marginLeft = 1;
                positioning.defaultColorMixer.width = 4;
                positioning.defaultColorMixer.height = positioning.defaultTunnel.height;
                positioning.defaultColorMixer.top = 0;
            }
            var cmhWidth = 100 - (positioning.defaultColorMixer.left);
            var cmhHeight = 4;
            //Default Color Mixer -- Horizontal
            {
                positioning.defaultColorMixerHorizontal.left = positioning.defaultTunnel.left
                    + positioning.customizableTunnel.width
                    - (cmhWidth);
                positioning.defaultColorMixerHorizontal.marginBottom = 1;
                positioning.defaultColorMixerHorizontal.width =
                    cmhWidth;
                positioning.defaultColorMixerHorizontal.top =
                    positioning.defaultTunnel.top
                        + positioning.defaultTunnel.marginTop
                        - (cmhHeight + 1 /*(1=>margin-bottom)*/);
                positioning.defaultColorMixerHorizontal.height = cmhHeight;
            }
            //Customizable Color Mixer
            {
                positioning.customizableColorMixer.left = positioning.defaultColorMixer.left;
                positioning.customizableColorMixer.marginBottom = 5;
                positioning.customizableColorMixer.marginLeft = 1;
                positioning.customizableColorMixer.width = positioning.defaultColorMixer.width;
                positioning.customizableColorMixer.height = positioning.defaultColorMixer.height;
                positioning.customizableColorMixer.bottom = 0;
            }
            //Customizable Color Mixer -- Horizontal
            {
                positioning.customizableColorMixerHorizontal.left = positioning.customizableTunnel.left
                    + positioning.customizableTunnel.width
                    - (cmhWidth);
                positioning.customizableColorMixerHorizontal.marginTop = 1;
                positioning.customizableColorMixerHorizontal.marginBottom = 5;
                positioning.customizableColorMixerHorizontal.width =
                    cmhWidth;
                positioning.customizableColorMixerHorizontal.top =
                    positioning.customizableTunnel.top
                        + positioning.customizableTunnel.marginTop
                        + positioning.customizableTunnel.height;
                positioning.customizableColorMixerHorizontal.height = cmhHeight;
            }
            var colorMixerTooThin = (toRealPx(currentWidth, currentHeight, positioning.defaultColorMixerHorizontal).width < colorMixerMinPxWidth);
            if (colorMixerTooThin) {
                var width = toPercent(currentWidth, currentHeight, colorMixerMinPxWidth, 0).x;
                var x = positioning.defaultColorMixerHorizontal.left + (positioning.defaultColorMixerHorizontal.width - width);
                var colorMixerComponents = [
                    positioning.defaultColorMixerHorizontal,
                    positioning.customizableColorMixerHorizontal
                ];
                for (var _i = 0, colorMixerComponents_1 = colorMixerComponents; _i < colorMixerComponents_1.length; _i++) {
                    var component = colorMixerComponents_1[_i];
                    component.left = x;
                    component.width = width;
                }
            }
            //Horizontal Axis
            {
                positioning.horizontalAxis.left = positioning.defaultTunnel.left + positioning.defaultTunnel.marginLeft;
                positioning.horizontalAxis.top = haTop;
                positioning.horizontalAxis.marginLeft = 0;
                positioning.horizontalAxis.marginTop = 1;
                positioning.horizontalAxis.width = positioning.defaultTunnel.width;
                positioning.horizontalAxis.height = haHeight;
            }
            //Vertical Axis 1
            {
                positioning.verticalAxis_1.left = 0;
                positioning.verticalAxis_1.top = dtTop + dtmTop;
                positioning.verticalAxis_1.marginLeft = 4; //10
                positioning.verticalAxis_1.marginRight = 0;
                positioning.verticalAxis_1.width = 3;
                positioning.verticalAxis_1.height = positioning.defaultTunnel.height;
            }
            //Vertical Axis 2
            {
                positioning.verticalAxis_2.left = 0;
                positioning.verticalAxis_2.top = positioning.customizableTunnel.top + positioning.customizableTunnel.marginTop;
                positioning.verticalAxis_2.marginLeft = positioning.verticalAxis_1.marginLeft;
                positioning.verticalAxis_2.marginRight = 0;
                positioning.verticalAxis_2.width = 3;
                positioning.verticalAxis_2.height = positioning.verticalAxis_1.height;
            }
            var bigLabelHeight = positioning.horizontalAxis.height - (positioning.horizontalAxis.height / 8) * 2;
            //Left Common Axis Label
            {
                positioning.axisLeftZeroLabel.left = 0;
                positioning.axisLeftZeroLabel.marginLeft = 0;
                positioning.axisLeftZeroLabel.top = positioning.horizontalAxis.top
                    + ((positioning.horizontalAxis.marginTop === void 0) ? 0 : positioning.horizontalAxis.marginTop);
                positioning.axisLeftZeroLabel.marginTop =
                    Math.abs(bigLabelHeight - positioning.horizontalAxis.height) / 2;
                positioning.axisLeftZeroLabel.width = positioning.horizontalAxis.left - 1;
                positioning.axisLeftZeroLabel.height = bigLabelHeight;
            }
            //Right Horizontal Axis Label
            {
                positioning.horizontalAxisRightLabel.left = positioning.horizontalAxis.left + positioning.horizontalAxis.width + positioning.horizontalAxis.marginLeft;
                positioning.horizontalAxisRightLabel.marginLeft = positioning.defaultColorMixer.marginLeft;
                positioning.horizontalAxisRightLabel.top = positioning.axisLeftZeroLabel.top;
                positioning.horizontalAxisRightLabel.marginTop = positioning.axisLeftZeroLabel.marginTop;
                positioning.horizontalAxisRightLabel.width = 100 - (positioning.horizontalAxisRightLabel.left + positioning.horizontalAxisRightLabel.marginLeft);
                positioning.horizontalAxisRightLabel.height = positioning.axisLeftZeroLabel.height;
            }
            //Top Default Tunnel Vertical Axis Label
            {
                positioning.vAxis1TopLabel.left = 0;
                positioning.vAxis1TopLabel.marginLeft = 0;
                positioning.vAxis1TopLabel.top = positioning.defaultTunnel.top
                    - positioning.axisLeftZeroLabel.height / 2;
                positioning.vAxis1TopLabel.marginTop = 0;
                positioning.vAxis1TopLabel.width = positioning.verticalAxis_1.marginLeft
                    + ((positioning.verticalAxis_1.left === void 0) ? 0 : positioning.verticalAxis_1.left);
                positioning.vAxis1TopLabel.height = positioning.axisLeftZeroLabel.height;
            }
            //Bottom Customizable Tunnel Vertical Axis Label
            {
                positioning.vAxis2BottomLabel.left = 0;
                positioning.vAxis2BottomLabel.marginLeft = 0;
                positioning.vAxis2BottomLabel.bottom = 100
                    - (positioning.customizableTunnel.top + positioning.customizableTunnel.marginTop
                        + positioning.customizableTunnel.height + positioning.axisLeftZeroLabel.height / 2);
                positioning.vAxis2BottomLabel.marginBottom = 0;
                positioning.vAxis2BottomLabel.width = positioning.verticalAxis_2.marginLeft
                    + ((positioning.verticalAxis_2.left === void 0) ? 0 : positioning.verticalAxis_2.left);
                ;
                positioning.vAxis2BottomLabel.height = positioning.axisLeftZeroLabel.height;
            }
            //Top Default Color Mixer Label
            {
                positioning.dColorMixerTopLabel.left = positioning.defaultColorMixer.left
                    + positioning.defaultColorMixer.marginLeft
                    + positioning.defaultColorMixer.width;
                positioning.dColorMixerTopLabel.marginLeft = 1;
                positioning.dColorMixerTopLabel.top = positioning.defaultTunnel.top
                    + positioning.defaultTunnel.marginTop;
                positioning.dColorMixerTopLabel.marginTop = 0;
                positioning.dColorMixerTopLabel.width = 100
                    - (positioning.defaultColorMixer.left
                        + positioning.defaultColorMixer.marginLeft
                        + positioning.defaultColorMixer.width
                        + positioning.dColorMixerTopLabel.marginLeft);
                positioning.dColorMixerTopLabel.height = positioning.axisLeftZeroLabel.height;
            }
            //Bottom Default Color Mixer Label
            {
                positioning.dColorMixerBottomLabel.left = positioning.dColorMixerTopLabel.left;
                positioning.dColorMixerBottomLabel.marginLeft = positioning.dColorMixerTopLabel.marginLeft;
                positioning.dColorMixerBottomLabel.top =
                    ((positioning.defaultTunnel.top === void 0) ? 0 : positioning.defaultTunnel.top)
                        + positioning.defaultTunnel.marginTop
                        + positioning.defaultTunnel.height
                        - (positioning.axisLeftZeroLabel.height);
                positioning.dColorMixerBottomLabel.width = positioning.dColorMixerTopLabel.width;
                positioning.dColorMixerBottomLabel.height = positioning.axisLeftZeroLabel.height;
            }
            //Left Default Color Mixer Label
            {
                positioning.dColorMixerLeftLabel.left = positioning.defaultColorMixerHorizontal.left;
                positioning.dColorMixerLeftLabel.marginLeft = positioning.defaultColorMixerHorizontal.marginLeft;
                positioning.dColorMixerLeftLabel.top = positioning.defaultColorMixerHorizontal.top
                    - (smallLabelHeight + 1.5);
                positioning.dColorMixerLeftLabel.marginTop = 0;
                positioning.dColorMixerLeftLabel.width = positioning.defaultColorMixerHorizontal.width / 2;
                positioning.dColorMixerLeftLabel.height = smallLabelHeight;
            }
            //Right Default Color Mixer Label
            {
                positioning.dColorMixerRightLabel.left = positioning.defaultColorMixerHorizontal.left
                    + positioning.defaultColorMixerHorizontal.width - positioning.dColorMixerLeftLabel.width;
                positioning.dColorMixerRightLabel.marginRight = positioning.dColorMixerLeftLabel.marginLeft;
                positioning.dColorMixerRightLabel.top = positioning.dColorMixerLeftLabel.top;
                positioning.dColorMixerRightLabel.marginTop = positioning.dColorMixerLeftLabel.marginTop;
                positioning.dColorMixerRightLabel.width = positioning.dColorMixerLeftLabel.width;
                positioning.dColorMixerRightLabel.height = positioning.dColorMixerLeftLabel.height;
            }
            //Top Customizable Color Mixer Label
            {
                positioning.cColorMixerTopLabel.left = positioning.dColorMixerTopLabel.left;
                positioning.cColorMixerTopLabel.marginLeft = positioning.dColorMixerTopLabel.marginLeft;
                positioning.cColorMixerTopLabel.bottom =
                    ((positioning.customizableTunnel.bottom === void 0) ? 0 : positioning.customizableTunnel.bottom)
                        + positioning.customizableTunnel.height
                        - (positioning.axisLeftZeroLabel.height);
                positioning.cColorMixerTopLabel.marginBottom = 0;
                positioning.cColorMixerTopLabel.width = positioning.dColorMixerTopLabel.width;
                positioning.cColorMixerTopLabel.height = positioning.axisLeftZeroLabel.height;
            }
            //Bottom Customizable Color Mixer Label
            {
                positioning.cColorMixerBottomLabel.left = positioning.dColorMixerTopLabel.left;
                positioning.cColorMixerBottomLabel.marginLeft = positioning.dColorMixerTopLabel.marginLeft;
                positioning.cColorMixerBottomLabel.bottom = positioning.customizableTunnel.bottom;
                positioning.cColorMixerBottomLabel.marginBottom = positioning.customizableTunnel.marginBottom;
                positioning.cColorMixerBottomLabel.width = positioning.dColorMixerTopLabel.width;
                positioning.cColorMixerBottomLabel.height = positioning.axisLeftZeroLabel.height;
            }
            //Left Customizable Color Mixer Label
            {
                positioning.cColorMixerLeftLabel.left = positioning.customizableColorMixerHorizontal.left;
                positioning.cColorMixerLeftLabel.marginLeft = positioning.customizableColorMixerHorizontal.marginLeft;
                positioning.cColorMixerLeftLabel.top = positioning.customizableColorMixerHorizontal.top
                    + positioning.customizableColorMixerHorizontal.height
                    + positioning.customizableColorMixerHorizontal.marginTop;
                positioning.cColorMixerLeftLabel.marginTop = 2;
                positioning.cColorMixerLeftLabel.width = positioning.customizableColorMixerHorizontal.width / 2;
                positioning.cColorMixerLeftLabel.height = smallLabelHeight;
            }
            //Right Customizable Color Mixer Label
            {
                positioning.cColorMixerRightLabel.left = positioning.customizableColorMixerHorizontal.left
                    + positioning.customizableColorMixerHorizontal.width - positioning.cColorMixerLeftLabel.width;
                positioning.cColorMixerRightLabel.marginRight = positioning.cColorMixerLeftLabel.marginLeft;
                positioning.cColorMixerRightLabel.top = positioning.cColorMixerLeftLabel.top;
                positioning.cColorMixerRightLabel.marginTop = positioning.cColorMixerLeftLabel.marginTop;
                positioning.cColorMixerRightLabel.width = positioning.cColorMixerLeftLabel.width;
                positioning.cColorMixerRightLabel.height = positioning.cColorMixerLeftLabel.height;
            }
            //Curly brackets for default tunnel
            {
                positioning.defaultCurlyBrackets.left = positioning.defaultTunnel.left
                    + positioning.defaultTunnel.marginLeft + positioning.defaultTunnel.width;
                positioning.defaultCurlyBrackets.marginLeft = 0.3;
                positioning.defaultCurlyBrackets.top = dtTop;
                positioning.defaultCurlyBrackets.width = 1;
                positioning.defaultCurlyBrackets.height = dtHeight;
            }
            //Curly brackets for customizable tunnel
            {
                positioning.customizableCurlyBrackets.left = positioning.defaultTunnel.left
                    + positioning.defaultTunnel.marginLeft + positioning.defaultTunnel.width;
                positioning.customizableCurlyBrackets.marginLeft = 0.3;
                positioning.customizableCurlyBrackets.top = haTop + haHeight
                    + positioning.customizableTunnel.marginTop;
                positioning.customizableCurlyBrackets.width = 1;
                positioning.customizableCurlyBrackets.height = dtHeight;
            }
            //Curly brackets Label for default tunnel
            {
                positioning.defaultCurlyBracketsLabel.left = positioning.defaultCurlyBrackets.left
                    + positioning.defaultCurlyBrackets.width
                    + positioning.defaultCurlyBrackets.marginLeft;
                positioning.defaultCurlyBracketsLabel.marginLeft = 0.3;
                positioning.defaultCurlyBracketsLabel.top = positioning.defaultCurlyBrackets.top
                    + positioning.defaultCurlyBrackets.height / 2 - smallLabelHeight / 2;
                positioning.defaultCurlyBracketsLabel.width = 100 - positioning.defaultCurlyBracketsLabel.left;
                positioning.defaultCurlyBracketsLabel.height = smallLabelHeight;
            }
            //Curly brackets Label for customizable tunnel
            {
                positioning.customizableCurlyBracketsLabel.left = positioning.customizableCurlyBrackets.left
                    + positioning.customizableCurlyBrackets.width
                    + positioning.customizableCurlyBrackets.marginLeft;
                positioning.customizableCurlyBracketsLabel.marginLeft = 0.3;
                positioning.customizableCurlyBracketsLabel.top = positioning.customizableCurlyBrackets.top
                    + positioning.customizableCurlyBrackets.height / 2 - smallLabelHeight / 2;
                positioning.customizableCurlyBracketsLabel.width = 100 - positioning.customizableCurlyBracketsLabel.left;
                positioning.customizableCurlyBracketsLabel.height = smallLabelHeight;
            }
            var ahLineHeight = 4;
            var ahLineVerticalMargin = 1.5;
            var ahLineWidth = dtWidth / 2;
            //Arrowhead line for default tunnel
            {
                positioning.defaultArrowheadLine.left = positioning.defaultTunnel.left
                    + positioning.defaultTunnel.marginLeft + dtWidth / 4 //2
                    - (ahLineWidth) / 2;
                positioning.defaultArrowheadLine.top = dtTop - ahLineHeight - ahLineVerticalMargin;
                positioning.defaultArrowheadLine.width = ahLineWidth;
                positioning.defaultArrowheadLine.height = ahLineHeight;
            }
            //Arrowhead line for customizable tunnel
            {
                positioning.customizableArrowheadLine.left = positioning.defaultArrowheadLine.left;
                positioning.customizableArrowheadLine.marginTop = ahLineVerticalMargin;
                positioning.customizableArrowheadLine.top = positioning.customizableTunnel.top
                    + positioning.customizableTunnel.marginTop
                    + positioning.customizableTunnel.height;
                positioning.customizableArrowheadLine.width = ahLineWidth;
                positioning.customizableArrowheadLine.height = ahLineHeight;
            }
            var ahLineLabelWidth = ahLineWidth / 4;
            //Arrowhead line Label for default tunnel
            {
                positioning.defaultArrowheadLineLabel.left = positioning.customizableArrowheadLine.left
                    + ahLineWidth / 2 - ahLineLabelWidth / 2;
                positioning.defaultArrowheadLineLabel.top = positioning.defaultArrowheadLine.top;
                positioning.defaultArrowheadLineLabel.width = ahLineLabelWidth;
                positioning.defaultArrowheadLineLabel.height = ahLineHeight;
            }
            //Arrowhead line Label for customizable tunnel
            {
                positioning.customizableArrowheadLineLabel.left = positioning.customizableArrowheadLine.left
                    + ahLineWidth / 2 - ahLineLabelWidth / 2;
                positioning.customizableArrowheadLineLabel.top = positioning.customizableArrowheadLine.top
                    + positioning.customizableArrowheadLine.marginTop + 1;
                positioning.customizableArrowheadLineLabel.width = ahLineLabelWidth;
                positioning.customizableArrowheadLineLabel.height = ahLineHeight;
            }
            var cmLabelWidth = positioning.defaultColorMixerHorizontal.width / 2.5;
            var cmLabelHeight = positioning.defaultColorMixerHorizontal.height;
            //Color mixer Label for default tunnel
            {
                positioning.defaultColorMixerLabel.left = positioning.defaultColorMixerHorizontal.left
                    + positioning.defaultColorMixerHorizontal.width / 2 - cmLabelWidth / 2;
                positioning.defaultColorMixerLabel.top = positioning.dColorMixerLeftLabel.top;
                positioning.defaultColorMixerLabel.width = cmLabelWidth;
                positioning.defaultColorMixerLabel.height = cmLabelHeight;
            }
            //Color mixer Label for customizable tunnel
            {
                positioning.customizableColorMixerLabel.left = positioning.defaultColorMixerHorizontal.left
                    + positioning.defaultColorMixerHorizontal.width / 2 - cmLabelWidth / 2;
                positioning.customizableColorMixerLabel.marginTop = 0.5;
                positioning.customizableColorMixerLabel.top = positioning.cColorMixerLeftLabel.top
                    + positioning.cColorMixerLeftLabel.marginTop;
                positioning.customizableColorMixerLabel.width = cmLabelWidth;
                positioning.customizableColorMixerLabel.height = cmLabelHeight;
            }
            if (colorMixerTooThin) {
                var emptySpaceX = positioning.defaultColorMixerHorizontal.left - positioning.defaultTunnel.left - 2;
                var fallDownLeft = positioning.defaultTunnel.left;
                var distanceLabelComponents = [
                    positioning.defaultArrowheadLine,
                    positioning.customizableArrowheadLine
                ];
                for (var _a = 0, distanceLabelComponents_1 = distanceLabelComponents; _a < distanceLabelComponents_1.length; _a++) {
                    var component = distanceLabelComponents_1[_a];
                    component.width = emptySpaceX;
                    component.left = positioning.defaultTunnel.left + emptySpaceX / 2 - component.width / 2;
                    if (component.left < fallDownLeft) {
                        component.left = fallDownLeft;
                    }
                }
                var labelX = (positioning.defaultArrowheadLine.left === void 0) ? 0 : positioning.defaultArrowheadLine.left;
                var labelWidth = (positioning.defaultArrowheadLine.width === void 0) ? 0 : positioning.defaultArrowheadLine.width;
                var distanceLabelTextComponents = [
                    positioning.defaultArrowheadLineLabel,
                    positioning.customizableArrowheadLineLabel
                ];
                for (var _b = 0, distanceLabelTextComponents_1 = distanceLabelTextComponents; _b < distanceLabelTextComponents_1.length; _b++) {
                    var component = distanceLabelTextComponents_1[_b];
                    var cWidth = (component.width === void 0) ? 0 : component.width;
                    component.left = labelX + labelWidth / 2 - cWidth / 2;
                }
            }
            return positioning;
        };
        Vizualizer.prototype.getLayerPropertyValue = function (key, layerIdx) {
            if (key === "BRadius") {
                return Number(this.data[layerIdx].MinBRadius).valueOf();
            }
            return Number(this.data[layerIdx].Properties[key]).valueOf();
        };
        Vizualizer.prototype.prepareLayersForVizualization = function () {
            var defaultTunnelLayers = [];
            var customizableTunnelLayers = [];
            for (var i = 0; i < this.data.length; i++) {
                var defaultTunnelLayer = {
                    id: i,
                    start: this.data[i].StartDistance,
                    end: this.data[i].EndDistance,
                    value: this.getLayerPropertyValue(this.coloringPropertyKey, i),
                    radius: this.data[i][this.radiusPropertyKey]
                };
                var customizableTunnelLayer = {
                    id: i,
                    start: this.data[i].StartDistance,
                    end: this.data[i].EndDistance,
                    value: this.getLayerPropertyValue(this.customColoringPropertyKey, i),
                    radius: this.data[i][this.customRadiusPropertyKey]
                };
                defaultTunnelLayers.push(defaultTunnelLayer);
                customizableTunnelLayers.push(customizableTunnelLayer);
            }
            return {
                defaultTunnelLayers: defaultTunnelLayers,
                customizableTunnelLayers: customizableTunnelLayers
            };
        };
        Vizualizer.prototype.getMaxY = function (realMaxYValue) {
            var maxY = Math.ceil(realMaxYValue);
            var chunkSize = maxY / this.verticalAxisChunkCount;
            if (maxY - realMaxYValue < chunkSize / 2) {
                maxY += Math.ceil(chunkSize / 2);
            }
            return maxY;
        };
        Vizualizer.prototype.prepareTunnelObject = function (minVal, maxVal, center, context, tunnelLayers, isDefaultTunnel) {
            var coloringProperty = ((isDefaultTunnel) ? this.coloringPropertyKey : this.customColoringPropertyKey);
            var colorFunctionSettings = {
                minVal: minVal,
                maxVal: maxVal,
                minColor: this.minColor[coloringProperty],
                maxColor: this.maxColor[coloringProperty],
                minColorMiddle: this.minColorMiddle[coloringProperty],
                maxColorMiddle: this.maxColorMiddle[coloringProperty],
                skipMiddle: (coloringProperty == "NumPositives" || coloringProperty == "NumNegatives" || coloringProperty == "Ionizable")
                    ? true
                    : this.skipMiddle,
                centerPosition: center,
                centerAbsolute: (coloringProperty == "NumPositives" || coloringProperty == "NumNegatives" || coloringProperty == "Ionizable")
                    ? false
                    : !this.useColorMinMax
            };
            var maxY = this.getMaxY((isDefaultTunnel) ? this.maxY : this.customMaxY);
            return {
                tunnel: new LayersVizualizer.Tunnel({
                    x: 0,
                    y: 0
                }, {
                    x: this.maxX,
                    y: maxY
                }, tunnelLayers, context, this.getColor, colorFunctionSettings, !isDefaultTunnel),
                colorFunctionSettings: colorFunctionSettings
            };
        };
        Vizualizer.prototype.renderObjects = function (renderable) {
            for (var _i = 0, renderable_1 = renderable; _i < renderable_1.length; _i++) {
                var obj = renderable_1[_i];
                obj.drawable.drawFromBounds(obj.bounds);
            }
        };
        Vizualizer.prototype.vizualize = function (renderHitboxes) {
            if (renderHitboxes === void 0) { renderHitboxes = true; }
            this.resizeCanvas();
            var canvasWidth = this.getCanvas().width;
            var canvasHeight = this.getCanvas().height;
            var context = this.getContext();
            //console.log(canvasWidth);
            //console.log(canvasHeight);
            var toRender = [];
            //Data was not prepared yet
            if (this.dataDirty) {
                this.prepareData();
            }
            //Prepare layers data
            var layers = this.prepareLayersForVizualization();
            var maxDistance = layers.defaultTunnelLayers[layers.defaultTunnelLayers.length - 1].end;
            maxDistance = Common.Util.Numbers.roundToDecimal(maxDistance, 1); // round to 1 decimal
            var positioning = this.getComponentsPositioning();
            //Prepare default tunnel object
            var dTminVal = (this.useColorMinMax) ? this.minColoringValue.get(this.coloringPropertyKey) : this.absColorValueMin.get(this.coloringPropertyKey);
            if (dTminVal == void 0) {
                throw Error("Minimal value for property '" + this.coloringPropertyKey + "' was not found!");
            }
            var dTmaxVal = (this.useColorMinMax) ? this.maxColoringValue.get(this.coloringPropertyKey) : this.absColorValueMax.get(this.coloringPropertyKey);
            if (dTmaxVal == void 0) {
                throw Error("Maximal value for property '" + this.coloringPropertyKey + "' was not found!");
            }
            var dTcenter = this.absCenterPositions.get(this.coloringPropertyKey);
            if (dTcenter === void 0) {
                dTcenter = 0;
            }
            var defaultTunnelData = this.prepareTunnelObject(dTminVal, dTmaxVal, dTcenter, context, layers.defaultTunnelLayers, true);
            var defaultTunnelBounds = positioning.defaultTunnel.toBounds(canvasWidth, canvasHeight);
            toRender.push({
                drawable: defaultTunnelData.tunnel,
                bounds: defaultTunnelBounds
            });
            //Prepare customizable tunnel object
            var cTminVal = (this.useColorMinMax) ? this.minColoringValue.get(this.customColoringPropertyKey) : this.absColorValueMin.get(this.customColoringPropertyKey);
            if (cTminVal == void 0) {
                throw Error("Minimal value for property '" + this.customColoringPropertyKey + "' was not found!");
            }
            var cTmaxVal = (this.useColorMinMax) ? this.maxColoringValue.get(this.customColoringPropertyKey) : this.absColorValueMax.get(this.customColoringPropertyKey);
            if (cTmaxVal == void 0) {
                throw Error("Maximal value for property '" + this.customColoringPropertyKey + "' was not found!");
            }
            var cTcenter = this.absCenterPositions.get(this.customColoringPropertyKey);
            if (cTcenter === void 0) {
                cTcenter = 0;
            }
            var customizableTunnelData = this.prepareTunnelObject(cTminVal, cTmaxVal, cTcenter, context, layers.customizableTunnelLayers, false);
            var customizableTunnelBounds = positioning.customizableTunnel.toBounds(canvasWidth, canvasHeight);
            toRender.push({
                drawable: customizableTunnelData.tunnel,
                bounds: customizableTunnelBounds
            });
            this.__tunnels.default = {
                tunnel: defaultTunnelData.tunnel,
                bounds: defaultTunnelBounds
            };
            this.__tunnels.customizable = {
                tunnel: customizableTunnelData.tunnel,
                bounds: customizableTunnelBounds
            };
            //Prepare color mixer objects
            //Color mixer for default tunnel
            /* //Vertical
            toRender.push({
                drawable: new ColorMixer(dTminVal,dTmaxVal,context,this.getColor,defaultTunnelData.colorFunctionSettings),
                bounds: positioning.defaultColorMixer.toBounds(canvasWidth,canvasHeight)
            });
            */
            //Horizontal
            toRender.push({
                drawable: new LayersVizualizer.ColorMixer(dTminVal, dTmaxVal, context, this.getColor, defaultTunnelData.colorFunctionSettings, true),
                bounds: positioning.defaultColorMixerHorizontal.toBounds(canvasWidth, canvasHeight)
            });
            //Color mixer for customizable tunnel
            /* //Vertical
            toRender.push({
                drawable: new ColorMixer(cTminVal,cTmaxVal,context,this.getColor,customizableTunnelData.colorFunctionSettings),
                bounds: positioning.customizableColorMixer.toBounds(canvasWidth,canvasHeight)
            });
            */
            //Horizontal
            toRender.push({
                drawable: new LayersVizualizer.ColorMixer(cTminVal, cTmaxVal, context, this.getColor, customizableTunnelData.colorFunctionSettings, true),
                bounds: positioning.customizableColorMixerHorizontal.toBounds(canvasWidth, canvasHeight)
            });
            //Prepare horizontal axis
            toRender.push({
                drawable: new LayersVizualizer.Axis(0, this.maxX, context, 10, true, 20, 1.6),
                bounds: positioning.horizontalAxis.toBounds(canvasWidth, canvasHeight)
            });
            //Prepare vertical axis
            toRender.push({
                drawable: new LayersVizualizer.Axis(0, this.getMaxY(this.maxY), context, this.verticalAxisChunkCount, false, 30, 1.6),
                bounds: positioning.verticalAxis_1.toBounds(canvasWidth, canvasHeight)
            });
            toRender.push({
                drawable: new LayersVizualizer.Axis(0, this.getMaxY(this.customMaxY), context, this.verticalAxisChunkCount, false, 30, 1.6),
                bounds: positioning.verticalAxis_2.toBounds(canvasWidth, canvasHeight)
            });
            //Prepare labels
            // Label on left side of horizontal axis
            toRender.push({
                drawable: new LayersVizualizer.TextBox("0 Å", context, "big", "right"),
                bounds: positioning.axisLeftZeroLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Label on right side of horizontal axis
            toRender.push({
                drawable: new LayersVizualizer.TextBox(maxDistance + " \u00C5", context, "big", "left"),
                bounds: positioning.horizontalAxisRightLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Label on top left side of vertical axis for default tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox(this.getMaxY(this.maxY) + " \u00C5", context, "medium", "right"),
                bounds: positioning.vAxis1TopLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Label on bottom left side of vertical axis for customizable tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox(this.getMaxY(this.customMaxY) + " \u00C5", context, "medium", "right"),
                bounds: positioning.vAxis2BottomLabel.toBounds(canvasWidth, canvasHeight)
            });
            /*
            // Label on top right side of color mixer for default tunnel
            toRender.push({
                drawable: new TextBox(`${dTmaxVal}`,context,"medium","left"),
                bounds: positioning.dColorMixerTopLabel.toBounds(canvasWidth,canvasHeight)
            });
            // Label on bottom right side of color mixer for default tunnel
            toRender.push({
                drawable: new TextBox(`${dTminVal}`,context,"medium","left"),
                bounds: positioning.dColorMixerBottomLabel.toBounds(canvasWidth,canvasHeight)
            });
            */
            // Label on top left side of color mixer for default tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox("" + Common.Util.Numbers.roundToDecimal(dTminVal, 2), context, "small", "left"),
                bounds: positioning.dColorMixerLeftLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Label on top right side of color mixer for default tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox("" + Common.Util.Numbers.roundToDecimal(dTmaxVal, 2), context, "small", "right"),
                bounds: positioning.dColorMixerRightLabel.toBounds(canvasWidth, canvasHeight)
            });
            /*
            // Label on top right side of color mixer for customizable tunnel
            toRender.push({
                drawable: new TextBox(`${cTmaxVal}`,context,"medium","left"),
                bounds: positioning.cColorMixerTopLabel.toBounds(canvasWidth,canvasHeight)
            });
            // Label on bottom right side of color mixer for customizable tunnel
            toRender.push({
                drawable: new TextBox(`${cTminVal}`,context,"medium","left"),
                bounds: positioning.cColorMixerBottomLabel.toBounds(canvasWidth,canvasHeight)
            });
            */
            // Label on bottom left side of color mixer for customizable tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox("" + Common.Util.Numbers.roundToDecimal(cTminVal, 2), context, "small", "left"),
                bounds: positioning.cColorMixerLeftLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Label on bottom right side of color mixer for customizable tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox("" + Common.Util.Numbers.roundToDecimal(cTmaxVal, 2), context, "small", "right"),
                bounds: positioning.cColorMixerRightLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Curly brackets for default tunnel
            toRender.push({
                drawable: new LayersVizualizer.CurlyBrackets(context),
                bounds: positioning.defaultCurlyBrackets.toBounds(canvasWidth, canvasHeight)
            });
            // Curly brackets Label for default tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox("" + MoleOnlineWebUI.StaticData.Bundle.get(this.radiusPropertyKey), context, "small", "left"),
                bounds: positioning.defaultCurlyBracketsLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Curly brackets for customizable tunnel
            toRender.push({
                drawable: new LayersVizualizer.CurlyBrackets(context),
                bounds: positioning.customizableCurlyBrackets.toBounds(canvasWidth, canvasHeight)
            });
            // Curly brackets Label for customizable tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox("" + MoleOnlineWebUI.StaticData.Bundle.get(this.customRadiusPropertyKey), context, "small", "left"),
                bounds: positioning.customizableCurlyBracketsLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Arrowhead line for default tunnel
            toRender.push({
                drawable: new LayersVizualizer.ArrowHeadLine(context, true),
                bounds: positioning.defaultArrowheadLine.toBounds(canvasWidth, canvasHeight)
            });
            // Arrowhead line Label for default tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox("Distance", context, "small", "center"),
                bounds: positioning.defaultArrowheadLineLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Arrowhead line for customizable tunnel
            toRender.push({
                drawable: new LayersVizualizer.ArrowHeadLine(context, true),
                bounds: positioning.customizableArrowheadLine.toBounds(canvasWidth, canvasHeight)
            });
            // Arrowhead line Label for customizable tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox("Distance", context, "small", "center"),
                bounds: positioning.customizableArrowheadLineLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Default color mixer Label
            toRender.push({
                drawable: new LayersVizualizer.TextBox("" + this.coloringPropertyKey, context, "small", "center"),
                bounds: positioning.defaultColorMixerLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Customizable color mixer Label
            toRender.push({
                drawable: new LayersVizualizer.TextBox("" + this.customColoringPropertyKey, context, "small", "center"),
                bounds: positioning.customizableColorMixerLabel.toBounds(canvasWidth, canvasHeight)
            });
            this.renderObjects(toRender);
            if (this.selectedLayerIds.length > 0) {
                this.selectLayers(this.selectedLayerIds);
            }
            this.setCurrentColorFunctionSettings("default", defaultTunnelData.colorFunctionSettings);
            this.setCurrentColorFunctionSettings("customizable", customizableTunnelData.colorFunctionSettings);
        };
        Vizualizer.prototype.switchToMainCanvas = function () {
            var tmpCanvas = document.getElementById(this.tmpCanvasId);
            if (tmpCanvas !== null) {
                tmpCanvas.remove();
            }
            this.rebindDOMRefs();
            this.vizualize();
            this.highlightHitbox(this.currentLayerIdx);
        };
        Vizualizer.prototype.switchToTmpCanvas = function () {
            var canvas = this.getCanvas();
            if (canvas.id === this.tmpCanvasId) {
                throw new Error("Trying to switch to tmp canvas from tmp canvas! Maybe forgotten SwitchToMain(..)?");
            }
            var tmpCanvas = document.createElement("canvas");
            tmpCanvas.style.position = "absolute";
            tmpCanvas.style.top = "-1000px";
            tmpCanvas.id = this.tmpCanvasId;
            tmpCanvas.width = 1882;
            tmpCanvas.height = 474;
            document.body.appendChild(tmpCanvas);
            var oldCtx = this.getContext();
            var tmpCtx = tmpCanvas.getContext("2d");
            if (tmpCtx === null) {
                throw new Error("Unable initiate new 2D canvas context");
            }
            this.__context = tmpCtx;
            this.__canvas = tmpCanvas;
        };
        Vizualizer.prototype.wrapSVG = function () {
            var canvas = this.getCanvas();
            var ctx = new C2S(canvas.width, canvas.height);
            if (ctx === null) {
                throw new Error("Unable to initialize new drawing context!");
            }
            this.__context = ctx;
        };
        Vizualizer.prototype.unwrapSVG = function () {
            var ctx = this.getCanvas().getContext("2d");
            if (ctx === null) {
                throw new Error("Unable to initialize new drawing context!");
            }
            this.__context = ctx;
        };
        Vizualizer.prototype.exportImage = function () {
            if (!this.isDOMBound || this.isDataDirty()) {
                throw new Error("Data not prepared!");
            }
            //Deselekce vrstvy
            var selectedLayers = [];
            if (this.selectedLayerIds.length > 0) {
                selectedLayers = this.selectedLayerIds;
                this.selectLayers([]);
            }
            this.switchToTmpCanvas();
            this.vizualize();
            var dataURL = this.getCanvas().toDataURL("image/png");
            this.switchToMainCanvas();
            //Opetovne oznaceni vrstvy(stav pred exportem)
            this.selectLayers(selectedLayers);
            return dataURL;
        };
        Vizualizer.prototype.getSVGDataURL = function () {
            var svg = this.getSVGData();
            var xmlSerializer = new XMLSerializer();
            var serializedSVG = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" + xmlSerializer.serializeToString(svg);
            serializedSVG = utf8.encode(serializedSVG);
            return "data:image/svg+xml;charset=utf-8;base64," + btoa(serializedSVG);
        };
        Vizualizer.prototype.getSVGData = function () {
            var ctx = this.getContext();
            ctx.getSerializedSvg();
            var svg = ctx.getSvg();
            svg.charset = "UTF-8";
            return svg;
        };
        Vizualizer.prototype.exportSVGImage = function () {
            if (!this.isDOMBound || this.isDataDirty()) {
                throw new Error("Data not prepared!");
            }
            //Deselekce vrstvy
            var selectedLayers = [];
            if (this.selectedLayerIds.length > 0) {
                selectedLayers = this.selectedLayerIds;
                this.deselectLayers();
            }
            this.switchToTmpCanvas();
            this.wrapSVG();
            this.vizualize();
            var svg = this.getSVGDataURL();
            this.unwrapSVG();
            this.switchToMainCanvas();
            //Opetovne oznaceni vrstvy(stav pred exportem)
            this.selectLayers(selectedLayers);
            return svg;
        };
        //TODO: Not working properly - image is not the same in PDF output as on screen => seems like a bug in jsPDF library
        Vizualizer.prototype.exportPDF = function () {
            if (!this.isDOMBound || this.isDataDirty()) {
                throw new Error("Data not prepared!");
            }
            //Deselekce vrstvy
            var selectedLayers = [];
            if (this.selectedLayerIds.length > 0) {
                selectedLayers = this.selectedLayerIds;
                this.deselectLayers();
            }
            this.switchToTmpCanvas();
            this.wrapSVG();
            var canvas = this.getCanvas();
            if (canvas === void 0 || canvas === null) {
                throw new Error("Canvas element not initiated");
            }
            var width = canvas.width;
            var height = canvas.height;
            this.vizualize();
            var svg = this.getSVGData();
            this.unwrapSVG();
            this.switchToMainCanvas();
            // create a new jsPDF instance
            var pdf = new jsPDF('p', 'pt', [width, height]);
            pdf.setProperties({
                title: "Report"
            });
            //console.log(svg);
            //pdf.addImage(this.exportSVGImage(),0,0,200,500);
            //pdf.addSVG(svg,0,0,width,height);
            // render the svg element
            svg2pdf(svg, pdf, {
                xOffset: 0,
                yOffset: 0,
                scale: 1
            });
            //pdf.addSVG(svg, 0, 0, width, height);
            //Opetovne oznaceni vrstvy(stav pred exportem)
            this.selectLayers(selectedLayers);
            return pdf.output('datauristring');
        };
        Vizualizer.prototype.setCustomColoringPropertyKey = function (coloringPropertyKey) {
            this.customColoringPropertyKey = coloringPropertyKey;
        };
        Vizualizer.prototype.getCustomColoringPropertyKey = function () {
            return this.customColoringPropertyKey;
        };
        Vizualizer.prototype.setColoringPropertyKey = function (coloringPropertyKey) {
            this.coloringPropertyKey = coloringPropertyKey;
        };
        Vizualizer.prototype.getColoringPropertyKey = function () {
            return this.coloringPropertyKey;
        };
        Vizualizer.prototype.setCustomRadiusPropertyKey = function (radiusPropertyKey) {
            if (this.customRadiusPropertyKey !== radiusPropertyKey) {
                this.customRadiusPropertyKey = radiusPropertyKey;
                this.dataDirty = true;
            }
        };
        Vizualizer.prototype.getCustomRadiusPropertyKey = function () {
            return this.customRadiusPropertyKey;
        };
        Vizualizer.prototype.setRadiusPropertyKey = function (radiusPropertyKey) {
            if (this.radiusPropertyKey !== radiusPropertyKey) {
                this.radiusPropertyKey = radiusPropertyKey;
                this.dataDirty = true;
            }
        };
        Vizualizer.prototype.getRadiusPropertyKey = function () {
            return this.radiusPropertyKey;
        };
        Vizualizer.prototype.getHitboxes = function () {
            var tunnels = this.getTunnels();
            if (tunnels === null) {
                return null;
            }
            return {
                defaultTunnel: (tunnels.default !== null)
                    ? tunnels.default.tunnel.getHitboxes()
                    : null,
                customizable: (tunnels.customizable !== null)
                    ? tunnels.customizable.tunnel.getHitboxes()
                    : null,
            };
        };
        Vizualizer.prototype.renderHitboxes = function () {
            //Data was not prepared yet
            if (this.dataDirty) {
                this.prepareData();
            }
            var tunnels = this.getTunnels();
            if (tunnels === null) {
                return [];
            }
            if (tunnels.default !== null) {
                tunnels.default.tunnel.renderHitboxes();
            }
            if (tunnels.customizable !== null) {
                tunnels.customizable.tunnel.renderHitboxes();
            }
        };
        Vizualizer.prototype.highlightHitbox = function (layerIdx) {
            if (layerIdx < 0) {
                return;
            }
            this.currentLayerIdx = layerIdx;
            var tunnels = this.getTunnels();
            if (tunnels === null) {
                return;
            }
            if (tunnels.default !== null) {
                tunnels.default.tunnel.highlightHitbox(layerIdx);
            }
            if (tunnels.customizable !== null) {
                tunnels.customizable.tunnel.highlightHitbox(layerIdx);
            }
        };
        /** Helpers **/
        Vizualizer.prototype.getColor = function (value, settings) {
            var minVal = settings.minVal;
            var maxVal = settings.maxVal;
            var minColor = settings.minColor;
            var maxColor = settings.maxColor;
            var minColorMiddle = settings.minColorMiddle;
            var maxColorMiddle = settings.maxColorMiddle;
            var skipMiddle = settings.skipMiddle;
            var middle = (settings.centerAbsolute) ? settings.centerPosition : (minVal + maxVal) / 2;
            var rgb;
            if (value < (minVal + maxVal) / 2) {
                rgb = ChannelDbPlugin.Palette.interpolate(minVal, minColor, middle, maxColorMiddle, value);
            }
            else {
                rgb = ChannelDbPlugin.Palette.interpolate(middle, minColorMiddle, maxVal, maxColor, value);
            }
            if (skipMiddle && settings.centerAbsolute) {
                throw new Error("Cannot config absolute center and skip center at once! Forbidden configuration -> skipMiddle=true && centerAbsolute=true");
            }
            if (skipMiddle && !settings.centerAbsolute) {
                rgb = ChannelDbPlugin.Palette.interpolate(minVal, minColor, maxVal, maxColor, value);
            }
            if (minVal === maxVal) {
                rgb = ChannelDbPlugin.Palette.interpolate(0, minColor, 1, maxColorMiddle, 0.5);
            }
            return "rgb(" + String(Math.floor(rgb.r)) + "," + String(Math.floor(rgb.g)) + "," + String(Math.floor(rgb.b)) + ")";
        };
        return Vizualizer;
    }());
    LayersVizualizer.Vizualizer = Vizualizer;
    ;
})(LayersVizualizer || (LayersVizualizer = {}));
var LayersVizualizer;
(function (LayersVizualizer) {
    var Component;
    (function (Component) {
        var Positionable = (function () {
            function Positionable() {
            }
            Positionable.prototype.toBounds = function (width, height) {
                var xUnit = width / 100;
                var yUnit = height / 100;
                var x = 0;
                var y = 0;
                var w = 100;
                var h = 100;
                var ml = 0;
                var mr = 0;
                var mt = 0;
                var mb = 0;
                if (this.right === void 0 && this.left === void 0) {
                    this.left = 0;
                }
                if (this.bottom === void 0 && this.top === void 0) {
                    this.top = 0;
                }
                if (this.marginLeft !== void 0) {
                    ml = this.marginLeft;
                }
                if (this.marginRight !== void 0) {
                    mr = this.marginRight;
                }
                if (this.marginTop !== void 0) {
                    mt = this.marginTop;
                }
                if (this.marginBottom !== void 0) {
                    mb = this.marginBottom;
                }
                if (this.width !== void 0) {
                    w = this.width;
                    if (this.left !== void 0) {
                        x = this.left + ml;
                    }
                    else if (this.right !== void 0) {
                        x = 100 - (this.right + mr + w);
                    }
                }
                else {
                    if (this.left !== void 0) {
                        x = this.left + ml;
                        w -= x;
                    }
                    else if (this.right !== void 0) {
                        x = 0;
                        w -= this.right + mr;
                    }
                }
                if (this.height !== void 0) {
                    h = this.height;
                    if (this.top !== void 0) {
                        y = this.top + mt;
                    }
                    else if (this.bottom !== void 0) {
                        y = 100 - (this.bottom + mb + h);
                    }
                }
                else {
                    if (this.top !== void 0) {
                        y = this.top + mt;
                        h -= y;
                    }
                    else if (this.bottom !== void 0) {
                        y = 0;
                        h -= this.bottom + mb;
                    }
                }
                return {
                    x: x * xUnit,
                    y: y * yUnit,
                    width: w * xUnit,
                    height: h * yUnit
                };
            };
            return Positionable;
        }());
        Component.Positionable = Positionable;
        ;
        var Paintable = (function (_super) {
            __extends(Paintable, _super);
            function Paintable() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return Paintable;
        }(Positionable));
        Component.Paintable = Paintable;
        ;
        var Axis = (function (_super) {
            __extends(Axis, _super);
            function Axis() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return Axis;
        }(Positionable));
        Component.Axis = Axis;
        ;
    })(Component = LayersVizualizer.Component || (LayersVizualizer.Component = {}));
})(LayersVizualizer || (LayersVizualizer = {}));
var LayersVizualizer;
(function (LayersVizualizer) {
    var Colors;
    (function (Colors) {
        function invertHexContrastGrayscale(hex) {
            return rgbToHex(invertRGBContrastGrayscale(hexToRGB(hex)));
        }
        Colors.invertHexContrastGrayscale = invertHexContrastGrayscale;
        function invertRGBContrastGrayscale(rgb) {
            var c = (rgb.r + rgb.g + rgb.b) / 3;
            var v = c > 0.5 * 255 ? c - 255 / 2 : c + 255 / 2;
            return { r: v, g: v, b: v };
        }
        Colors.invertRGBContrastGrayscale = invertRGBContrastGrayscale;
        function invertRGBColor(rgb) {
            return hexToRGB(invertHexColor(rgbToHex(rgb)));
        }
        Colors.invertRGBColor = invertRGBColor;
        function invertHexColor(hexTripletColor) {
            hexTripletColor = hexTripletColor.substring(1); // remove #
            var color = parseInt(hexTripletColor, 16); // convert to integer
            color = 0xFFFFFF ^ color; // invert three bytes
            var strColor = color.toString(16); // convert to hex
            strColor = ("000000" + strColor).slice(-6); // pad with leading zeros
            strColor = "#" + strColor; // prepend #
            return strColor;
        }
        Colors.invertHexColor = invertHexColor;
        function rgbComplement(rgb) {
            var temprgb = rgb;
            var temphsv = RGB2HSV(temprgb);
            temphsv.hue = HueShift(temphsv.hue, 180.0);
            temprgb = HSV2RGB(temphsv);
            return temprgb;
        }
        Colors.rgbComplement = rgbComplement;
        function hexToRGB(hex) {
            if (hex[0] !== "#") {
                throw new Error("Hex color has bad format!");
            }
            var rgbPart = hex.split("#")[1];
            if (rgbPart.length !== 6) {
                throw new Error("Hex color has bad format!");
            }
            var rHex = rgbPart.slice(0, 2);
            var gHex = rgbPart.slice(2, 4);
            var bHex = rgbPart.slice(4, 6);
            return {
                r: parseInt(rHex, 16),
                g: parseInt(gHex, 16),
                b: parseInt(bHex, 16)
            };
        }
        Colors.hexToRGB = hexToRGB;
        function Uint8ClampedArrayToRGB(rgbArr) {
            return {
                r: rgbArr[0],
                g: rgbArr[1],
                b: rgbArr[2]
            };
        }
        Colors.Uint8ClampedArrayToRGB = Uint8ClampedArrayToRGB;
        function parseRGBString(rgbString) {
            var rgbParts = [];
            for (var _i = 0, _a = ((rgbString.split('(')[1]).split(")")[0]).split(","); _i < _a.length; _i++) {
                var part = _a[_i];
                rgbParts.push(parseInt(part.replace(" ", "")));
            }
            return {
                r: rgbParts[0],
                g: rgbParts[1],
                b: rgbParts[2]
            };
        }
        Colors.parseRGBString = parseRGBString;
        function rgbToHex(rgb) {
            var rHex = Math.ceil(rgb.r).toString(16);
            var gHex = Math.ceil(rgb.g).toString(16);
            var bHex = Math.ceil(rgb.b).toString(16);
            return "#" + (((rHex.length == 1) ? "0" : "") + rHex) + (((gHex.length == 1) ? "0" : "") + gHex) + (((bHex.length == 1) ? "0" : "") + bHex);
        }
        Colors.rgbToHex = rgbToHex;
        function hexComplement(hex) {
            return rgbToHex(rgbComplement(hexToRGB(hex)));
        }
        Colors.hexComplement = hexComplement;
        ;
        function RGB2HSV(rgb) {
            var hsv = new Object();
            var max = max3(rgb.r, rgb.g, rgb.b);
            var dif = max - min3(rgb.r, rgb.g, rgb.b);
            hsv.saturation = (max == 0.0) ? 0 : (100 * dif / max);
            if (hsv.saturation == 0)
                hsv.hue = 0;
            else if (rgb.r == max)
                hsv.hue = 60.0 * (rgb.g - rgb.b) / dif;
            else if (rgb.g == max)
                hsv.hue = 120.0 + 60.0 * (rgb.b - rgb.r) / dif;
            else if (rgb.b == max)
                hsv.hue = 240.0 + 60.0 * (rgb.r - rgb.g) / dif;
            if (hsv.hue < 0.0)
                hsv.hue += 360.0;
            hsv.value = Math.round(max * 100 / 255);
            hsv.hue = Math.round(hsv.hue);
            hsv.saturation = Math.round(hsv.saturation);
            return hsv;
        }
        // RGB2HSV and HSV2RGB are based on Color Match Remix [http://color.twysted.net/]
        // which is based on or copied from ColorMatch 5K [http://colormatch.dk/]
        function HSV2RGB(hsv) {
            var rgb = new Object();
            if (hsv.saturation == 0) {
                rgb.r = rgb.g = rgb.b = Math.round(hsv.value * 2.55);
            }
            else {
                hsv.hue /= 60;
                hsv.saturation /= 100;
                hsv.value /= 100;
                var i = Math.floor(hsv.hue);
                var f = hsv.hue - i;
                var p = hsv.value * (1 - hsv.saturation);
                var q = hsv.value * (1 - hsv.saturation * f);
                var t = hsv.value * (1 - hsv.saturation * (1 - f));
                switch (i) {
                    case 0:
                        rgb.r = hsv.value;
                        rgb.g = t;
                        rgb.b = p;
                        break;
                    case 1:
                        rgb.r = q;
                        rgb.g = hsv.value;
                        rgb.b = p;
                        break;
                    case 2:
                        rgb.r = p;
                        rgb.g = hsv.value;
                        rgb.b = t;
                        break;
                    case 3:
                        rgb.r = p;
                        rgb.g = q;
                        rgb.b = hsv.value;
                        break;
                    case 4:
                        rgb.r = t;
                        rgb.g = p;
                        rgb.b = hsv.value;
                        break;
                    default:
                        rgb.r = hsv.value;
                        rgb.g = p;
                        rgb.b = q;
                }
                rgb.r = Math.round(rgb.r * 255);
                rgb.g = Math.round(rgb.g * 255);
                rgb.b = Math.round(rgb.b * 255);
            }
            return rgb;
        }
        //Adding HueShift via Jacob (see comments)
        function HueShift(h, s) {
            h += s;
            while (h >= 360.0)
                h -= 360.0;
            while (h < 0.0)
                h += 360.0;
            return h;
        }
        //min max via Hairgami_Master (see comments)
        function min3(a, b, c) {
            return (a < b) ? ((a < c) ? a : c) : ((b < c) ? b : c);
        }
        function max3(a, b, c) {
            return (a > b) ? ((a > c) ? a : c) : ((b > c) ? b : c);
        }
    })(Colors = LayersVizualizer.Colors || (LayersVizualizer.Colors = {}));
})(LayersVizualizer || (LayersVizualizer = {}));
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
var LoadingScreen;
(function (LoadingScreen) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        function render(target) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, null), target);
        }
        UI.render = render;
        ;
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = { message: "", visible: false };
                return _this;
            }
            App.prototype.componentDidMount = function () {
                var _this = this;
                MoleOnlineWebUI.Bridge.Events.subscribeToggleLoadingScreen(function (params) {
                    var s = _this.state;
                    s.message = params.message;
                    s.visible = params.visible;
                    _this.setState(s);
                });
            };
            App.prototype.componentWillUnmount = function () {
            };
            App.prototype.render = function () {
                return React.createElement("div", { className: "loading-screen " + ((this.state.visible) ? 'visible' : '') },
                    React.createElement("img", { src: "images/ajax-loader.gif" }),
                    React.createElement("div", { className: "message" }, this.state.message));
            };
            return App;
        }(React.Component));
        UI.App = App;
    })(UI = LoadingScreen.UI || (LoadingScreen.UI = {}));
})(LoadingScreen || (LoadingScreen = {}));
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
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var React = LiteMol.Plugin.React;
        var SimpleComboBox = (function (_super) {
            __extends(SimpleComboBox, _super);
            function SimpleComboBox() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SimpleComboBox.prototype.render = function () {
                var classNames = "";
                if (this.props.className !== void 0) {
                    classNames = this.props.className;
                }
                var selectedIdx = 0;
                if (this.props.defaultSelectedIndex !== void 0) {
                    selectedIdx = this.props.defaultSelectedIndex;
                }
                var items = [];
                var idx = 0;
                for (var _i = 0, _a = this.props.items; _i < _a.length; _i++) {
                    var item = _a[_i];
                    items.push(React.createElement("option", { value: item.value, selected: (idx === selectedIdx) }, item.label));
                    idx++;
                }
                return (React.createElement("select", { id: this.props.id, className: classNames, onChange: this.props.onSelectedChange }, items));
            };
            return SimpleComboBox;
        }(React.Component));
        Controls.SimpleComboBox = SimpleComboBox;
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
var Datagrid;
(function (Datagrid) {
    var Components;
    (function (Components) {
        var React = LiteMol.Plugin.React;
        var DGRowEmpty = (function (_super) {
            __extends(DGRowEmpty, _super);
            function DGRowEmpty() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGRowEmpty.prototype.render = function () {
                return (React.createElement("tr", null,
                    React.createElement("td", { colSpan: this.props.columnsCount })));
            };
            return DGRowEmpty;
        }(React.Component));
        Components.DGRowEmpty = DGRowEmpty;
        function getTitle(title, columnCount) {
            var tit = [];
            var sIdx = 0;
            if (title !== void 0) {
                tit = title;
                sIdx = title.length - 1;
            }
            for (; sIdx < columnCount; sIdx++) {
                tit.push("");
            }
            return tit;
        }
        var DGRow = (function (_super) {
            __extends(DGRow, _super);
            function DGRow() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGRow.prototype.addTd = function (tds, i, columns, columnsCount, forceHtml) {
                var html = { __html: columns[i] };
                var tdClass = "";
                if (this.props.tdClass !== void 0) {
                    tdClass = this.props.tdClass;
                }
                var title = getTitle(this.props.title, columnsCount);
                if (forceHtml) {
                    tds.push(React.createElement("td", { title: title[i], className: "col col-" + (i + 1) + " " + tdClass, dangerouslySetInnerHTML: html }));
                }
                else {
                    tds.push(React.createElement("td", { title: title[i], className: "col col-" + (i + 1) }, columns[i]));
                }
            };
            DGRow.prototype.addTdWithColspan = function (tds, i, columns, columnsCount, forceHtml) {
                var html = { __html: columns[i] };
                var tdClass = "";
                if (this.props.tdClass !== void 0) {
                    tdClass = this.props.tdClass;
                }
                var title = getTitle(this.props.title, columnsCount);
                var colSpan = 1 + (columnsCount - columns.length);
                if (forceHtml) {
                    tds.push(React.createElement("td", { title: title[i], className: "col col-" + (i + 1) + " " + tdClass, colSpan: colSpan, dangerouslySetInnerHTML: html }));
                }
                else {
                    tds.push(React.createElement("td", { title: title[i], className: "col col-" + (i + 1) + " " + tdClass, colSpan: colSpan }, columns[i]));
                }
            };
            DGRow.prototype.generateRow = function (columns) {
                var columnsCount = columns.length;
                if (this.props.columnsCount !== void 0) {
                    columnsCount = this.props.columnsCount;
                }
                var forceHTML = false;
                if (this.props.forceHtml !== void 0) {
                    forceHTML = this.props.forceHtml;
                }
                var tds = [];
                for (var i = 0; i < columns.length; i++) {
                    if (i === columns.length - 1 && columns.length !== columnsCount) {
                        this.addTdWithColspan(tds, i, columns, columnsCount, forceHTML);
                        break;
                    }
                    this.addTd(tds, i, columns, columnsCount, forceHTML);
                }
                return tds;
            };
            DGRow.prototype.render = function () {
                var trClass = "";
                if (this.props.trClass !== void 0) {
                    trClass = this.props.trClass;
                }
                return (React.createElement("tr", { className: trClass }, this.generateRow(this.props.columns)));
            };
            return DGRow;
        }(React.Component));
        Components.DGRow = DGRow;
        var DGElementRow = (function (_super) {
            __extends(DGElementRow, _super);
            function DGElementRow() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGElementRow.prototype.generateRow = function (columns) {
                var tdClass = "";
                if (this.props.tdClass !== void 0) {
                    tdClass = this.props.tdClass;
                }
                var columnsCount = columns.length;
                if (this.props.columnsCount !== void 0) {
                    columnsCount = this.props.columnsCount;
                }
                var colSpan = 1 + (columnsCount - columns.length);
                var title = getTitle(this.props.title, columnsCount);
                var tds = [];
                for (var i = 0; i < columns.length; i++) {
                    if (i === columns.length - 1 && columns.length !== columnsCount) {
                        tds.push(React.createElement("td", { title: title[i], className: "col col-" + (i + 1) + " " + tdClass, colSpan: colSpan }, columns[i]));
                        break;
                    }
                    tds.push(React.createElement("td", { title: title[i], className: "col col-" + (i + 1) + " " + tdClass }, columns[i]));
                }
                return tds;
            };
            DGElementRow.prototype.render = function () {
                var trClass = "";
                if (this.props.trClass !== void 0) {
                    trClass = this.props.trClass;
                }
                return (React.createElement("tr", { className: trClass }, this.generateRow(this.props.columns)));
            };
            return DGElementRow;
        }(React.Component));
        Components.DGElementRow = DGElementRow;
        var DGTdWithHtml = (function (_super) {
            __extends(DGTdWithHtml, _super);
            function DGTdWithHtml() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGTdWithHtml.prototype.render = function () {
                return (React.createElement("td", { className: "col col-" + this.props.colIdx, dangerouslySetInnerHTML: { __html: this.props.contents } }));
            };
            return DGTdWithHtml;
        }(React.Component));
        Components.DGTdWithHtml = DGTdWithHtml;
        var DGNoDataInfoRow = (function (_super) {
            __extends(DGNoDataInfoRow, _super);
            function DGNoDataInfoRow() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGNoDataInfoRow.prototype.render = function () {
                var infoText = "There are no data to be displayed...";
                if (this.props.infoText !== void 0) {
                    infoText = this.props.infoText;
                }
                return (React.createElement("tr", null,
                    React.createElement("td", { colSpan: this.props.columnsCount }, infoText)));
            };
            return DGNoDataInfoRow;
        }(React.Component));
        Components.DGNoDataInfoRow = DGNoDataInfoRow;
    })(Components = Datagrid.Components || (Datagrid.Components = {}));
})(Datagrid || (Datagrid = {}));
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var FromLiteMol;
        (function (FromLiteMol) {
            var React = LiteMol.Plugin.React;
            var LMControls = LiteMol.Plugin.Controls;
            ;
            var LMControlWrapper = (function (_super) {
                __extends(LMControlWrapper, _super);
                function LMControlWrapper() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                LMControlWrapper.prototype.render = function () {
                    return React.createElement("div", { className: "litemol-controls-wrapper" },
                        React.createElement("div", { className: "lm-plugin" }, this.props.controls));
                };
                return LMControlWrapper;
            }(React.Component));
            FromLiteMol.LMControlWrapper = LMControlWrapper;
            var ValidationState = (function () {
                function ValidationState() {
                }
                ValidationState.getState = function (validationGroup) {
                    var state = this.validationStates.get(validationGroup);
                    if (state === void 0) {
                        return "VALID";
                    }
                    return state;
                };
                ValidationState.setState = function (validationGroup, state) {
                    var oldState = this.getState(validationGroup);
                    this.validationStates.set(validationGroup, state);
                    this.invokeOnStateChangeHandlers(validationGroup, oldState, state);
                };
                ValidationState.attachOnStateChangeHandler = function (validationGroup, handler) {
                    var groupHandlers = this.stateChangeHandlers.get(validationGroup);
                    if (groupHandlers === void 0) {
                        groupHandlers = [];
                    }
                    groupHandlers.push(handler);
                    this.stateChangeHandlers.set(validationGroup, groupHandlers);
                };
                ValidationState.invokeOnStateChangeHandlers = function (validationGroup, oldState, newState) {
                    var groupHandlers = this.stateChangeHandlers.get(validationGroup);
                    if (groupHandlers === void 0) {
                        return;
                    }
                    for (var _i = 0, groupHandlers_1 = groupHandlers; _i < groupHandlers_1.length; _i++) {
                        var h = groupHandlers_1[_i];
                        h(oldState, newState);
                    }
                };
                ValidationState.reset = function (validationGroup) {
                    var oldState = this.getState(validationGroup);
                    this.validationStates.delete(validationGroup);
                    this.invokeOnStateChangeHandlers(validationGroup, oldState, this.getState(validationGroup));
                };
                return ValidationState;
            }());
            ValidationState.validationStates = new Map();
            ValidationState.stateChangeHandlers = new Map();
            FromLiteMol.ValidationState = ValidationState;
            ;
            var TextBox = (function (_super) {
                __extends(TextBox, _super);
                function TextBox() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.state = { control: _this.createControl(), value: _this.props.defaultValue };
                    return _this;
                }
                TextBox.prototype.componentDidMount = function () {
                    if (this.props.onMount) {
                        this.props.onMount(this);
                    }
                };
                TextBox.prototype.reset = function () {
                    this.setState({
                        value: this.props.defaultValue,
                        control: React.createElement("div", null)
                    });
                    this.setState({
                        value: this.props.defaultValue,
                        control: this.createControl()
                    });
                };
                TextBox.prototype.createControl = function (props) {
                    var _this = this;
                    if (props === void 0) {
                        props = this.props;
                    }
                    return LMControls.TextBox({
                        defaultValue: props.defaultValue,
                        placeholder: props.placeholder,
                        onBlur: function (e) {
                            TextBoxOnBlur(e, _this.props.validate, _this.props.validationGroup);
                            e.preventDefault();
                        },
                        onChange: function (v) {
                            var s = _this.state;
                            s.value = v;
                            _this.setState(s);
                            if (_this.props.onChange !== void 0) {
                                _this.props.onChange(v);
                            }
                            if (_this.props.validationGroup !== void 0) {
                                ValidationState.reset(_this.props.validationGroup);
                            }
                        },
                        onKeyPress: function (e) {
                        }
                    });
                };
                TextBox.prototype.render = function () {
                    return React.createElement("div", { className: 'lm-control-row lm-options-group', title: this.props.tooltip },
                        React.createElement("span", null, this.props.label),
                        React.createElement("div", null, this.state.control));
                };
                return TextBox;
            }(React.Component));
            FromLiteMol.TextBox = TextBox;
            function TextBoxOnBlur(e, validateFn, validationGroup) {
                var element = e.currentTarget;
                if (validateFn !== void 0 && validationGroup !== void 0) {
                    var prevState = ValidationState.getState(validationGroup);
                    validateFn(element.value).then(function (validationResult) {
                        if (!validationResult.valid) {
                            ValidationState.setState(validationGroup, "INVALID");
                            element.setCustomValidity((validationResult.message !== void 0) ? validationResult.message : "Entered value is not valid.");
                            element.focus();
                            $(element).addClass("invalid");
                            $(element).tooltip({
                                trigger: 'manual',
                                placement: 'bottom',
                                title: function () {
                                    return validationResult.message;
                                }
                            }).tooltip('show');
                        }
                        else {
                            element.setCustomValidity("");
                            $(element).removeClass("invalid");
                            CommonUtils.Tooltips.destroy(element);
                        }
                    });
                }
            }
            ;
            ;
            var TextBoxWithHelp = (function (_super) {
                __extends(TextBoxWithHelp, _super);
                function TextBoxWithHelp() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.state = { control: _this.createControl(), value: _this.props.defaultValue };
                    return _this;
                }
                TextBoxWithHelp.prototype.componentDidMount = function () {
                    if (this.props.onMount) {
                        this.props.onMount(this);
                    }
                };
                TextBoxWithHelp.prototype.reset = function () {
                    this.setState({
                        value: this.props.defaultValue,
                        control: React.createElement("div", null)
                    });
                    this.setState({
                        value: this.props.defaultValue,
                        control: this.createControl()
                    });
                };
                TextBoxWithHelp.prototype.createControl = function (props) {
                    var _this = this;
                    if (props === void 0) {
                        props = this.props;
                    }
                    return LMControls.TextBox({
                        defaultValue: props.defaultValue,
                        placeholder: props.placeholder,
                        onBlur: function (e) {
                            TextBoxOnBlur(e, _this.props.validate, _this.props.validationGroup);
                            e.preventDefault();
                        },
                        onChange: function (v) {
                            var s = _this.state;
                            s.value = v;
                            _this.setState(s);
                            if (_this.props.onChange !== void 0) {
                                _this.props.onChange(v);
                            }
                            if (_this.props.validationGroup !== void 0) {
                                ValidationState.reset(_this.props.validationGroup);
                            }
                        },
                        onKeyPress: function (e) {
                        }
                    });
                };
                TextBoxWithHelp.prototype.render = function () {
                    return React.createElement("div", { className: 'lm-control-row lm-options-group', title: this.props.tooltip },
                        React.createElement("span", null,
                            this.props.label,
                            " ",
                            React.createElement("a", { className: "hint", href: this.props.hint.link, target: "_blank", title: this.props.hint.title },
                                React.createElement("span", { className: "glyphicon glyphicon-info-sign" }))),
                        React.createElement("div", null, this.state.control));
                };
                return TextBoxWithHelp;
            }(React.Component));
            FromLiteMol.TextBoxWithHelp = TextBoxWithHelp;
            ;
            var NumberBox = (function (_super) {
                __extends(NumberBox, _super);
                function NumberBox() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.state = { value: _this.props.defaultValue };
                    return _this;
                }
                NumberBox.prototype.componentDidMount = function () {
                    if (this.props.onMount) {
                        this.props.onMount(this);
                    }
                };
                NumberBox.prototype.reset = function () {
                    this.setState({
                        value: this.props.defaultValue,
                    });
                };
                NumberBox.prototype.render = function () {
                    var _this = this;
                    return React.createElement(LMControls.Slider, { label: this.props.label, min: this.props.min, max: this.props.max, step: this.props.step, value: this.state.value, title: this.props.tooltip, onChange: function (v) {
                            var s = _this.state;
                            s.value = v;
                            _this.setState(s);
                            if (_this.props.onChange !== void 0) {
                                _this.props.onChange(String(v));
                            }
                        } });
                };
                return NumberBox;
            }(React.Component));
            FromLiteMol.NumberBox = NumberBox;
            ;
            var CheckBox = (function (_super) {
                __extends(CheckBox, _super);
                function CheckBox() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.state = { checked: _this.props.defaultValue, control: _this.createControl() };
                    return _this;
                }
                CheckBox.prototype.componentDidMount = function () {
                    if (this.props.onMount) {
                        this.props.onMount(this);
                    }
                };
                CheckBox.prototype.reset = function () {
                    this.setState({
                        checked: this.props.defaultValue,
                        control: this.createControl()
                    });
                };
                CheckBox.prototype.createControl = function (currentValue) {
                    var _this = this;
                    return LMControls.Toggle({
                        label: this.props.label,
                        title: this.props.tooltip,
                        onChange: function (v) {
                            var s = _this.state;
                            s.checked = v;
                            s.control = _this.createControl(v);
                            _this.setState(s);
                            if (_this.props.onChange !== void 0) {
                                _this.props.onChange(v);
                            }
                        },
                        value: (currentValue !== void 0) ? currentValue : this.props.defaultValue
                    });
                };
                CheckBox.prototype.render = function () {
                    return this.state.control;
                };
                return CheckBox;
            }(React.Component));
            FromLiteMol.CheckBox = CheckBox;
            var ComboBoxItem = (function () {
                function ComboBoxItem(value, label) {
                    this.value = value;
                    this.label = label;
                }
                ComboBoxItem.prototype.getValue = function () {
                    return this.value;
                };
                ComboBoxItem.prototype.getLabel = function () {
                    return this.label;
                };
                ComboBoxItem.prototype.equals = function (obj) {
                    return this.label === obj.label && this.value === this.value;
                };
                return ComboBoxItem;
            }());
            FromLiteMol.ComboBoxItem = ComboBoxItem;
            ;
            ;
            var ComboBox = (function (_super) {
                __extends(ComboBox, _super);
                function ComboBox() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.state = {
                        value: _this.props.selectedValue
                    };
                    return _this;
                }
                ComboBox.prototype.componentDidMount = function () {
                    if (this.props.onMount) {
                        this.props.onMount(this);
                    }
                };
                ComboBox.prototype.componentWillReceiveProps = function (nextProps) {
                    if (nextProps.selectedValue !== this.props.selectedValue) {
                        var s = this.state;
                        s.value = nextProps.selectedValue;
                        this.setState(s);
                    }
                };
                ComboBox.prototype.reset = function () {
                    this.setState({
                        value: this.props.selectedValue,
                    });
                };
                ComboBox.prototype.getSelectedItemByValue = function (value) {
                    for (var _i = 0, _a = this.props.items; _i < _a.length; _i++) {
                        var item = _a[_i];
                        if (item.getValue() === value) {
                            return item;
                        }
                    }
                    return this.props.items[0];
                };
                ComboBox.prototype.render = function () {
                    var _this = this;
                    var currentElement = this.getSelectedItemByValue(this.state.value);
                    return React.createElement("div", { className: 'lm-control-row lm-options-group', title: this.props.tooltip },
                        React.createElement("span", null, this.props.label),
                        React.createElement("div", null,
                            React.createElement(LMControls.OptionsBox, { caption: function (o) { return o.getLabel(); }, current: currentElement, options: this.props.items, onChange: (function (o) {
                                    if (_this.props.onChange) {
                                        _this.props.onChange(o.getValue());
                                    }
                                    var s = _this.state;
                                    s.value = o.getValue();
                                    _this.setState(s);
                                }).bind(this) })));
                };
                return ComboBox;
            }(React.Component));
            FromLiteMol.ComboBox = ComboBox;
            ;
            var ControlGroup = (function (_super) {
                __extends(ControlGroup, _super);
                function ControlGroup() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.state = { panel: _this.createPanel((_this.props.expanded) ? _this.props.expanded : false), expanded: (_this.props.expanded) ? _this.props.expanded : false };
                    return _this;
                }
                ControlGroup.prototype.createPanel = function (expanded) {
                    return new LMControls.Panel({
                        header: this.props.label,
                        title: this.props.tooltip,
                        isExpanded: expanded,
                        onExpand: this.onPanelExpand.bind(this),
                        //description:"description",
                        children: this.props.controls
                    });
                };
                ControlGroup.prototype.componentWillReceiveProps = function (nextProps) {
                    if (nextProps.expanded !== void 0 && nextProps.expanded !== this.state.expanded) {
                        this.onPanelExpand(nextProps.expanded, true);
                    }
                };
                ControlGroup.prototype.onPanelExpand = function (e, supressOnChangeInvoke) {
                    var s = this.state;
                    s.expanded = e;
                    s.panel = this.createPanel(e);
                    this.setState(s);
                    if (!supressOnChangeInvoke && this.props.onChange !== void 0) {
                        this.props.onChange(e);
                    }
                };
                ControlGroup.prototype.render = function () {
                    return this.state.panel.render();
                };
                return ControlGroup;
            }(React.Component));
            FromLiteMol.ControlGroup = ControlGroup;
            FromLiteMol.StartingPointTypes = ["CSA", "Residue List", "3D Point", "Cofactor", "Current Selection", "PatternQuery"];
            var Point = (function () {
                function Point(x, y, z) {
                    this.x = x;
                    this.y = y;
                    this.z = z;
                }
                Point.prototype.toString = function () {
                    return "[" + this.x + ", " + this.y + ", " + this.z + "]";
                };
                return Point;
            }());
            FromLiteMol.Point = Point;
            var Residue = (function () {
                function Residue(seqId, chain) {
                    this.seqId = seqId;
                    this.chain = chain;
                }
                Residue.prototype.toString = function () {
                    return this.chain + ", " + this.seqId;
                };
                return Residue;
            }());
            FromLiteMol.Residue = Residue;
            var StartingPointBox = (function (_super) {
                __extends(StartingPointBox, _super);
                function StartingPointBox() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.state = { items: _this.props.defaultItems, mode: (_this.props.defaultMode) ? _this.props.defaultMode : "Current Selection" };
                    return _this;
                }
                StartingPointBox.prototype.componentDidMount = function () {
                    var _this = this;
                    if (this.props.onMount) {
                        this.props.onMount(this);
                    }
                    CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                        if (formGroup === _this.props.formGroup || (_this.props.extraClearGroup !== void 0 && formGroup === _this.props.extraClearGroup)) {
                            _this.reset();
                        }
                    });
                };
                StartingPointBox.prototype.componentWillReceiveProps = function (nextProps) {
                    if (this.props.defaultItems !== nextProps.defaultItems || this.props.defaultMode !== nextProps.defaultMode) {
                        this.reset();
                    }
                };
                StartingPointBox.prototype.reset = function () {
                    var newMode = (this.props.defaultMode) ? this.props.defaultMode : "Current Selection";
                    this.setState({
                        items: [],
                        mode: newMode
                    });
                };
                StartingPointBox.prototype.getPointValueAsString = function (point) {
                    if (point.type === "Point") {
                        return point.value.toString();
                    }
                    else if (point.type === "Residue") {
                        return point.value.map(function (val, idx, arr) { return val.toString(); }).reduce(function (prev, cur, idx, arr) { return prev += (idx === 0) ? '' : ',' + cur; });
                    }
                    else {
                        return point.value;
                    }
                };
                StartingPointBox.prototype.addNewPointUnique = function (newPoint, target) {
                    for (var _i = 0, target_1 = target; _i < target_1.length; _i++) {
                        var t = target_1[_i];
                        //Only one Query point allowed
                        if (t.type === "Query" && newPoint.type === "Query") {
                            return target;
                        }
                        if (t.type === newPoint.type && t.uiType === newPoint.uiType && this.getPointValueAsString(t) === this.getPointValueAsString(newPoint)) {
                            return target;
                        }
                    }
                    target.push(newPoint);
                    return target;
                };
                StartingPointBox.prototype.onChange = function (newPoints) {
                    var s = this.state;
                    var unique = s.items.slice();
                    for (var _i = 0, newPoints_1 = newPoints; _i < newPoints_1.length; _i++) {
                        var p = newPoints_1[_i];
                        unique = this.addNewPointUnique(p, unique);
                    }
                    s.items = unique;
                    this.setState(s);
                    if (this.props.onChange !== void 0) {
                        this.props.onChange(unique.slice());
                    }
                };
                StartingPointBox.prototype.remove = function (item) {
                    var newItems = [];
                    for (var _i = 0, _a = this.state.items; _i < _a.length; _i++) {
                        var i = _a[_i];
                        if (i.type === item.type && i.uiType === item.uiType && this.getPointValueAsString(i) === this.getPointValueAsString(item)) {
                            continue;
                        }
                        newItems.push(i);
                    }
                    var s = this.state;
                    s.items = newItems;
                    this.setState(s);
                    if (this.props.onChange !== void 0) {
                        this.props.onChange(newItems.slice());
                    }
                };
                StartingPointBox.prototype.render = function () {
                    var _this = this;
                    var comboItems = [];
                    for (var _i = 0, StartingPointTypes_1 = FromLiteMol.StartingPointTypes; _i < StartingPointTypes_1.length; _i++) {
                        var i = StartingPointTypes_1[_i];
                        if (!this.props.allowPatternQuery && (i === "Cofactor" || i == "PatternQuery")) {
                            continue;
                        }
                        comboItems.push(new ComboBoxItem(i, i));
                    }
                    var control;
                    switch (this.state.mode) {
                        case "CSA":
                            control = React.createElement(StartingPointCSABox, { label: "", tooltip: "", onChange: this.onChange.bind(this) });
                            break;
                        case "Current Selection":
                            control = React.createElement(StartingPointCurrentSelectionBox, { label: "", tooltip: "", onChange: this.onChange.bind(this) });
                            break;
                        case "Cofactor":
                            control = React.createElement(StartingPointCofactorBox, { label: "", tooltip: "", onChange: this.onChange.bind(this) });
                            break;
                        case "Residue List":
                            control = React.createElement(StartingPointResidueListBox, { label: "", tooltip: "", onChange: this.onChange.bind(this), formGroup: this.props.formGroup });
                            break;
                        case "3D Point":
                            control = React.createElement(StartingPoint3DPointBox, { label: "", tooltip: "", onChange: this.onChange.bind(this), formGroup: this.props.formGroup });
                            break;
                        case "PatternQuery":
                            control = React.createElement(StartingPointQueryBox, { label: "", tooltip: "", onChange: this.onChange.bind(this), formGroup: this.props.formGroup });
                    }
                    return React.createElement("div", null,
                        React.createElement(ComboBox, { items: comboItems, label: this.props.label, selectedValue: this.state.mode, tooltip: this.props.tooltip, onChange: (function (v) {
                                var s = _this.state;
                                s.mode = v;
                                _this.setState(s);
                            }).bind(this) }),
                        control,
                        React.createElement(StartingPointResultsBox, { items: this.state.items, onRemove: this.remove.bind(this), noDataText: this.props.noDataText }));
                };
                return StartingPointBox;
            }(React.Component));
            FromLiteMol.StartingPointBox = StartingPointBox;
            var StartingPointResultsBox = (function (_super) {
                __extends(StartingPointResultsBox, _super);
                function StartingPointResultsBox() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                //state:StartingPointResultsBoxState = {items:this.props.items}
                StartingPointResultsBox.prototype.generateUIItem = function (p) {
                    var content = "";
                    switch (p.type) {
                        case "Residue":
                            var rp = p;
                            content = CommonUtils.Misc.flattenResidues(rp.value.map(function (v, i, a) {
                                return {
                                    SequenceNumber: v.seqId,
                                    Chain: v.chain
                                };
                            }));
                            break;
                        case "Point":
                            var pp = p;
                            content = CommonUtils.Misc.flattenPoints([pp.value]);
                            break;
                        case "Query":
                            var qp = p;
                            content = "" + ((qp.residue !== "") ? qp.residue + ': ' : '') + qp.value;
                            break;
                        default:
                            content = "Unknown type!!!";
                    }
                    var contentMaxLength = 20;
                    var miniContent = content.substr(0, contentMaxLength) + "...";
                    return React.createElement("span", { title: content }, (content.length > contentMaxLength) ? miniContent : content);
                };
                StartingPointResultsBox.prototype.removeItem = function (item) {
                    this.props.onRemove(item);
                };
                StartingPointResultsBox.prototype.render = function () {
                    var _this = this;
                    var rows = [];
                    var _loop_1 = function (i) {
                        var boxClass = "starting-point-" + i.uiType.replace(/\s/g, "-");
                        rows.push(React.createElement("div", { className: "lm-control-row" },
                            React.createElement("span", { className: boxClass }, i.uiType),
                            React.createElement("div", null,
                                React.createElement(LMControls.Button, { onClick: function (e) {
                                        _this.removeItem(i);
                                    }, children: [this_1.generateUIItem(i), React.createElement("span", { className: "glyphicon glyphicon-remove" })] }))));
                    };
                    var this_1 = this;
                    for (var _i = 0, _a = this.props.items; _i < _a.length; _i++) {
                        var i = _a[_i];
                        _loop_1(i);
                    }
                    if (rows.length === 0) {
                        rows.push(React.createElement("div", { className: "lm-control-row" },
                            React.createElement("span", null),
                            React.createElement("div", { className: "empty", title: this.props.noDataText }, this.props.noDataText)));
                    }
                    return React.createElement("div", { className: "starting-point-result-box" },
                        React.createElement("div", { className: "lm-control-row" },
                            React.createElement("span", null, "Selected Points")),
                        rows);
                };
                return StartingPointResultsBox;
            }(React.Component));
            FromLiteMol.StartingPointResultsBox = StartingPointResultsBox;
            var StartingPointCurrentSelectionBox = (function (_super) {
                __extends(StartingPointCurrentSelectionBox, _super);
                function StartingPointCurrentSelectionBox() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                StartingPointCurrentSelectionBox.prototype.render = function () {
                    var _this = this;
                    var button = LMControls.CommitButton({
                        action: function () {
                            if (CommonUtils.Selection.SelectionHelper.isSelectedAny() && !CommonUtils.Selection.SelectionHelper.isSelectedAnyChannel()) {
                                if (_this.props.onChange === void 0) {
                                    return;
                                }
                                var selectedResidues = CommonUtils.Selection.SelectionHelper.getSelectedResidues();
                                var selectedPoints = CommonUtils.Selection.SelectionHelper.getSelectedPoints();
                                if (selectedResidues.length > 0) {
                                    var newPointData = [];
                                    for (var _i = 0, selectedResidues_1 = selectedResidues; _i < selectedResidues_1.length; _i++) {
                                        var r = selectedResidues_1[_i];
                                        newPointData.push(new Residue(r.info.authSeqNumber, r.info.chain.authAsymId));
                                    }
                                    _this.props.onChange([{
                                            type: "Residue",
                                            uiType: "Residue List",
                                            value: newPointData
                                        }]);
                                }
                                else {
                                    var newPoints = [];
                                    for (var _a = 0, selectedPoints_1 = selectedPoints; _a < selectedPoints_1.length; _a++) {
                                        var p = selectedPoints_1[_a];
                                        newPoints.push({
                                            type: "Point",
                                            uiType: "3D Point",
                                            value: new Point(p.x, p.y, p.z)
                                        });
                                    }
                                    _this.props.onChange(newPoints);
                                }
                            }
                        },
                        isOn: true,
                        off: "",
                        on: "Add",
                    });
                    return React.createElement("div", { className: 'lm-control-row lm-options-group', title: this.props.tooltip },
                        React.createElement("span", null, this.props.label),
                        React.createElement("div", null, button));
                };
                return StartingPointCurrentSelectionBox;
            }(React.Component));
            FromLiteMol.StartingPointCurrentSelectionBox = StartingPointCurrentSelectionBox;
            var StartingPointCofactorBox = (function (_super) {
                __extends(StartingPointCofactorBox, _super);
                function StartingPointCofactorBox() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.state = { cofactors: null, isLoading: true, selected: null };
                    return _this;
                }
                StartingPointCofactorBox.prototype.componentDidMount = function () {
                    var _this = this;
                    MoleOnlineWebUI.DataProxy.Cofactors.DataProvider.get(function (cofactors) {
                        var selected = null;
                        var validCofactors = _this.getValidCofactors(cofactors);
                        if (validCofactors.size > 0) {
                            selected = validCofactors.keys().next().value;
                        }
                        _this.setState({ isLoading: false, cofactors: validCofactors, selected: selected });
                    });
                };
                StartingPointCofactorBox.prototype.getValidCofactors = function (cofactors) {
                    var _this = this;
                    var items = new Map();
                    cofactors.forEach(function (value, key, map) {
                        if (!CommonUtils.Residues.currentContextHasResidue(key) || _this.state.selected === value) {
                            return;
                        }
                        items.set(key, value);
                    });
                    return items;
                };
                StartingPointCofactorBox.prototype.generateItems = function (cofactors) {
                    var items = [];
                    cofactors.forEach(function (value, key, map) {
                        items.push(new ComboBoxItem(key, key));
                    });
                    return items;
                };
                StartingPointCofactorBox.prototype.getNoDataMessage = function () {
                    var text = (this.state.isLoading) ? "Loading..." : "No cofactor starting points available";
                    return React.createElement("div", { className: "starting-point-control-container" },
                        React.createElement("div", { className: "lm-control-row lm-options-group" },
                            React.createElement("span", null),
                            React.createElement("div", { className: "info", title: text }, text)));
                };
                StartingPointCofactorBox.prototype.render = function () {
                    var _this = this;
                    if (this.state.isLoading || this.state.cofactors === null) {
                        return this.getNoDataMessage();
                    }
                    var comboItems = this.generateItems(this.state.cofactors);
                    if (comboItems.length === 0) {
                        return this.getNoDataMessage();
                    }
                    var combo = React.createElement(ComboBox, { items: comboItems, label: this.props.label, selectedValue: comboItems[0].getValue(), tooltip: this.props.tooltip, onChange: (function (v) {
                            var s = _this.state;
                            s.selected = v;
                            _this.setState(s);
                        }).bind(this) });
                    var button = LMControls.CommitButton({
                        action: function () {
                            if (_this.props.onChange !== void 0 && _this.state.cofactors !== null && _this.state.selected !== null) {
                                _this.props.onChange([{
                                        type: "Query",
                                        uiType: "Cofactor",
                                        value: _this.state.cofactors.get(_this.state.selected),
                                        residue: _this.state.selected
                                    }]);
                            }
                        },
                        isOn: true,
                        off: "",
                        on: "Add",
                    });
                    return React.createElement("div", { className: "starting-point-control-container" },
                        combo,
                        React.createElement("div", { className: 'lm-control-row lm-options-group', title: this.props.tooltip },
                            React.createElement("span", null, this.props.label),
                            React.createElement("div", null, button)));
                };
                return StartingPointCofactorBox;
            }(React.Component));
            FromLiteMol.StartingPointCofactorBox = StartingPointCofactorBox;
            var StartingPointResidueListBox = (function (_super) {
                __extends(StartingPointResidueListBox, _super);
                function StartingPointResidueListBox() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.state = { value: "", textbox: void 0 };
                    _this.onClearGroup = "";
                    return _this;
                }
                StartingPointResidueListBox.prototype.componentDidMount = function () {
                    var _this = this;
                    this.onClearGroup = "StartingPointResidueListBox" + StartingPointResidueListBox.instanceCounter++;
                    CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                        if (_this.props.formGroup === formGroup || _this.onClearGroup === formGroup) {
                            var s = _this.state;
                            s.value = "";
                            _this.setState(s);
                        }
                    });
                };
                StartingPointResidueListBox.prototype.render = function () {
                    var _this = this;
                    var button = LMControls.CommitButton({
                        action: function () {
                            if (_this.props.onChange !== void 0) {
                                var newPointData = [];
                                var residueList = CommonUtils.Misc.parseResidues(_this.state.value);
                                if (residueList.length === 0 || residueList.length !== _this.state.value.split(",").length) {
                                    return;
                                }
                                for (var _i = 0, residueList_1 = residueList; _i < residueList_1.length; _i++) {
                                    var r = residueList_1[_i];
                                    newPointData.push(new Residue(r.SequenceNumber, r.Chain));
                                }
                                _this.props.onChange([{
                                        type: "Residue",
                                        uiType: "Residue List",
                                        value: newPointData,
                                    }]);
                                CommonUtils.FormEvents.Events.invokeOnClear(_this.onClearGroup);
                            }
                        },
                        isOn: true,
                        off: "",
                        on: "Add",
                    });
                    return React.createElement("div", { className: "starting-point-control-container" },
                        React.createElement(TextBox, { defaultValue: "", label: "Residue list:", placeholder: "A 52, B142,...", onChange: function (val) {
                                var s = _this.state;
                                s.value = val;
                                _this.setState(s);
                            }, onMount: function (control) {
                                CommonUtils.FormEvents.Events.attachOnClearEventHandler((function (formGroup) {
                                    if (_this.props.formGroup === formGroup || _this.onClearGroup === formGroup) {
                                        window.setTimeout(function () { return control.reset(); });
                                    }
                                }).bind(control));
                            } }),
                        React.createElement("div", { className: 'lm-control-row lm-options-group', title: this.props.tooltip },
                            React.createElement("span", null, this.props.label),
                            React.createElement("div", null, button)));
                };
                return StartingPointResidueListBox;
            }(React.Component));
            StartingPointResidueListBox.instanceCounter = 0;
            FromLiteMol.StartingPointResidueListBox = StartingPointResidueListBox;
            var StartingPoint3DPointBox = (function (_super) {
                __extends(StartingPoint3DPointBox, _super);
                function StartingPoint3DPointBox() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.state = { value: "" };
                    _this.onClearGroup = "";
                    return _this;
                }
                StartingPoint3DPointBox.prototype.componentDidMount = function () {
                    var _this = this;
                    this.onClearGroup = "StartingPoint3DPointBox" + StartingPoint3DPointBox.instanceCounter++;
                    CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                        if (_this.props.formGroup === formGroup || _this.onClearGroup === formGroup) {
                            var s = _this.state;
                            s.value = "";
                            _this.setState(s);
                        }
                    });
                };
                StartingPoint3DPointBox.prototype.render = function () {
                    var _this = this;
                    var button = LMControls.CommitButton({
                        action: function () {
                            if (_this.props.onChange !== void 0) {
                                var newPointData = [];
                                var point = CommonUtils.Misc.parsePoint(_this.state.value);
                                if (point === void 0) {
                                    return;
                                }
                                _this.props.onChange([{
                                        type: "Point",
                                        uiType: "3D Point",
                                        value: new Point(point.x, point.y, point.z),
                                    }]);
                            }
                            CommonUtils.FormEvents.Events.invokeOnClear(_this.onClearGroup);
                        },
                        isOn: true,
                        off: "",
                        on: "Add",
                    });
                    return React.createElement("div", { className: "starting-point-control-container" },
                        React.createElement(TextBox, { defaultValue: this.state.value, label: "3D Point:", placeholder: "X, Y, Z", onChange: function (val) {
                                var s = _this.state;
                                s.value = val;
                                _this.setState(s);
                            }, onMount: function (control) {
                                CommonUtils.FormEvents.Events.attachOnClearEventHandler((function (formGroup) {
                                    if (_this.props.formGroup === formGroup || _this.onClearGroup === formGroup) {
                                        window.setTimeout(function () { return control.reset(); });
                                    }
                                }).bind(control));
                            } }),
                        React.createElement("div", { className: 'lm-control-row lm-options-group', title: this.props.tooltip },
                            React.createElement("span", null, this.props.label),
                            React.createElement("div", null, button)));
                };
                return StartingPoint3DPointBox;
            }(React.Component));
            StartingPoint3DPointBox.instanceCounter = 0;
            FromLiteMol.StartingPoint3DPointBox = StartingPoint3DPointBox;
            var StartingPointCSABox = (function (_super) {
                __extends(StartingPointCSABox, _super);
                function StartingPointCSABox() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.state = { data: null, isLoading: true, selected: null };
                    return _this;
                }
                StartingPointCSABox.prototype.componentDidMount = function () {
                    var _this = this;
                    var params = Common.Util.Router.getParameters();
                    if (params === null) {
                        console.error("URL parameters not readable!");
                        return;
                    }
                    MoleOnlineWebUI.DataProxy.CSAResidues.DataProvider.get(params.computationId, function (compId, csaData) {
                        var selected = null;
                        if (csaData.length > 0) {
                            selected = CommonUtils.Misc.flattenResidues(csaData[0]);
                        }
                        _this.setState({ isLoading: false, data: csaData, selected: selected });
                    });
                };
                StartingPointCSABox.prototype.generateItems = function (csaDataItems) {
                    var items = [];
                    for (var _i = 0, csaDataItems_1 = csaDataItems; _i < csaDataItems_1.length; _i++) {
                        var item = csaDataItems_1[_i];
                        var flatten = CommonUtils.Misc.flattenResidues(item);
                        items.push(new ComboBoxItem(flatten, flatten));
                    }
                    return items;
                };
                StartingPointCSABox.prototype.getNoDataMessage = function () {
                    var text = (this.state.isLoading) ? "Loading..." : "No CSA starting points available";
                    return React.createElement("div", { className: "starting-point-control-container" },
                        React.createElement("div", { className: "lm-control-row lm-options-group" },
                            React.createElement("span", null),
                            React.createElement("div", { className: "info", title: text }, text)));
                };
                StartingPointCSABox.prototype.render = function () {
                    var _this = this;
                    if (this.state.isLoading || this.state.data === null) {
                        return this.getNoDataMessage();
                    }
                    var comboItems = this.generateItems(this.state.data);
                    if (comboItems.length === 0) {
                        return this.getNoDataMessage();
                    }
                    var combo = React.createElement(ComboBox, { items: comboItems, label: "CSA Active sites", selectedValue: comboItems[0].getValue(), tooltip: this.props.tooltip, onChange: (function (v) {
                            var s = _this.state;
                            s.selected = v;
                            _this.setState(s);
                        }).bind(this) });
                    var button = LMControls.CommitButton({
                        action: function () {
                            if (_this.props.onChange !== void 0 && _this.state.data !== null && _this.state.selected !== null) {
                                _this.props.onChange([{
                                        type: "Residue",
                                        uiType: "CSA",
                                        value: CommonUtils.Misc.parseResidues(_this.state.selected).map(function (val, idx, arr) {
                                            return new Residue(val.SequenceNumber, val.Chain);
                                        })
                                    }]);
                            }
                        },
                        isOn: true,
                        off: "",
                        on: "Add",
                    });
                    return React.createElement("div", { className: "starting-point-control-container" },
                        combo,
                        React.createElement("div", { className: 'lm-control-row lm-options-group', title: this.props.tooltip },
                            React.createElement("span", null, this.props.label),
                            React.createElement("div", null, button)));
                };
                return StartingPointCSABox;
            }(React.Component));
            FromLiteMol.StartingPointCSABox = StartingPointCSABox;
            var StartingPointQueryBox = (function (_super) {
                __extends(StartingPointQueryBox, _super);
                function StartingPointQueryBox() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.state = { value: "", isValid: false, validationInProgress: false, validationMessage: "Query cannot be empty..." };
                    _this.onClearGroup = "";
                    return _this;
                }
                StartingPointQueryBox.prototype.componentDidMount = function () {
                    var _this = this;
                    this.onClearGroup = "StartingPointQueryBox" + StartingPointQueryBox.instanceCounter++;
                    CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                        if (_this.props.formGroup === formGroup || _this.onClearGroup === formGroup) {
                            var s = _this.state;
                            s.value = "";
                            _this.setState(s);
                        }
                    });
                };
                StartingPointQueryBox.prototype.render = function () {
                    var _this = this;
                    var button = LMControls.CommitButton({
                        action: function () {
                            if (_this.props.onChange !== void 0 && _this.state.isValid && !_this.state.validationInProgress) {
                                _this.props.onChange([{
                                        type: "Query",
                                        uiType: "PatternQuery",
                                        value: _this.state.value,
                                        residue: ""
                                    }]);
                            }
                        },
                        isOn: (this.state.isValid && !this.state.validationInProgress),
                        off: this.state.validationMessage,
                        on: "Add",
                    });
                    return React.createElement("div", { className: "starting-point-control-container" },
                        React.createElement(TextBox, { defaultValue: this.state.value, label: "Query:", placeholder: "Residues('GOL')", onChange: function (val) {
                                var s = _this.state;
                                s.value = val;
                                s.isValid = false;
                                s.validationInProgress = true;
                                s.validationMessage = "Validation in progress... Please wait.";
                                _this.setState(s);
                                CommonUtils.Validators.validatePatternQuery(val).then(function (result) {
                                    var s1 = _this.state;
                                    s1.isValid = result.valid;
                                    s1.value = val;
                                    s1.validationInProgress = false;
                                    if (result.valid) {
                                        s1.validationMessage = "";
                                    }
                                    else {
                                        s1.validationMessage = (result.message !== void 0) ? result.message : "Unkown validation error...";
                                    }
                                    _this.setState(s1);
                                }).catch(function (err) {
                                    var s1 = _this.state;
                                    s1.isValid = false;
                                    s1.value = val;
                                    s1.validationInProgress = false;
                                    s1.validationMessage = "Validation API not available. Please try again later.";
                                    _this.setState(s1);
                                });
                            }, onMount: function (control) {
                                CommonUtils.FormEvents.Events.attachOnClearEventHandler((function (formGroup) {
                                    if (_this.props.formGroup === formGroup || _this.onClearGroup === formGroup) {
                                        window.setTimeout(function () { return control.reset(); });
                                    }
                                }).bind(control));
                            } }),
                        React.createElement("div", { className: 'lm-control-row lm-options-group', title: this.props.tooltip },
                            React.createElement("span", null, this.props.label),
                            React.createElement("div", null, button)));
                };
                return StartingPointQueryBox;
            }(React.Component));
            StartingPointQueryBox.instanceCounter = 0;
            FromLiteMol.StartingPointQueryBox = StartingPointQueryBox;
        })(FromLiteMol = Controls.FromLiteMol || (Controls.FromLiteMol = {}));
    })(Controls = Common.Controls || (Common.Controls = {}));
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
                    var _loop_2 = function (idx) {
                        var header = this_2.props.header[idx];
                        rv.push(React.createElement("li", { className: (idx === this_2.props.activeTab) ? "active" : "" },
                            React.createElement("a", { "data-toggle": "tab", href: "#" + this_2.props.namespace + (idx + 1), onClick: (function () {
                                    window.setTimeout(function () {
                                        if (_this.props.onChange !== void 0) {
                                            _this.props.onChange(idx);
                                        }
                                    });
                                }).bind(this_2) }, header)));
                    };
                    var this_2 = this;
                    for (var idx = 0; idx < this.props.header.length; idx++) {
                        _loop_2(idx);
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
var AglomeredParameters;
(function (AglomeredParameters) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        var LiteMoleEvent = LiteMol.Bootstrap.Event;
        var DGComponents = Datagrid.Components;
        var Tooltips = MoleOnlineWebUI.StaticData.TooltipText;
        var DGTABLE_COLS_COUNT = 11;
        ;
        function render(target, plugin) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, { controller: plugin }), target);
        }
        UI.render = render;
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    data: null,
                    app: _this,
                };
                return _this;
            }
            App.prototype.componentDidMount = function () {
                var _this = this;
                MoleOnlineWebUI.Bridge.Events.subscribeChannelDataLoaded(function (data) {
                    var toShow = [];
                    var channelsDbTunnels = data.Channels;
                    var moleTunnels = data.Channels;
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, moleTunnels.Tunnels);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, moleTunnels.Paths);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, moleTunnels.Pores);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, moleTunnels.MergedPores);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.ReviewedChannels);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.CSATunnels);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.TransmembranePores);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.CofactorTunnels);
                    var state = _this.state;
                    state.data = toShow;
                    _this.setState(state);
                    $(window).trigger("contentResize");
                });
                LiteMoleEvent.Tree.NodeRemoved.getStream(this.props.controller.context).subscribe(function (e) {
                    if (e.data.tree !== void 0 && e.data.ref === "mole-data") {
                        var state = _this.state;
                        state.data = null;
                        _this.setState(state);
                    }
                });
                this.forceUpdate();
            };
            App.prototype.componentWillUnmount = function () {
            };
            App.prototype.componentDidUpdate = function (prevProps, prevState) {
                $('.init-agp-tooltip').tooltip({ container: 'body' });
            };
            App.prototype.render = function () {
                return (React.createElement("div", null,
                    React.createElement(DGTable, __assign({}, this.state))));
            };
            return App;
        }(React.Component));
        UI.App = App;
        var DGTable = (function (_super) {
            __extends(DGTable, _super);
            function DGTable() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGTable.prototype.render = function () {
                return (React.createElement("div", { className: "datagrid", id: "dg-aglomered-parameters" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, __assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement(DGBody, __assign({}, this.props)))));
            };
            return DGTable;
        }(React.Component));
        var DGHead = (function (_super) {
            __extends(DGHead, _super);
            function DGHead() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGHead.prototype.render = function () {
                return (React.createElement("table", null,
                    React.createElement("tr", null,
                        React.createElement("th", { title: Tooltips.get("Name"), className: "col col-1 ATable-header-identifier init-agp-tooltip", "data-toggle": "tooltip", "data-placement": "bottom" }, "Name"),
                        React.createElement("th", { title: Tooltips.get("Length"), className: "col col-2 ATable-header-length init-agp-tooltip", "data-toggle": "tooltip", "data-placement": "bottom" },
                            React.createElement("span", { className: "glyphicon glyphicon-resize-horizontal" }),
                            " ",
                            React.createElement("span", { className: "ATable-label" }, "Length")),
                        React.createElement("th", { title: Tooltips.get("Bottleneck"), className: "col col-3 ATable-header-bottleneck init-agp-tooltip", "data-toggle": "tooltip", "data-placement": "bottom" },
                            React.createElement("span", { className: "icon bottleneck" }),
                            " ",
                            React.createElement("span", { className: "ATable-label" }, "Bottleneck")),
                        React.createElement("th", { title: Tooltips.get("agl-Hydropathy"), className: "col col-4 ATable-header-hydropathy init-agp-tooltip", "data-toggle": "tooltip", "data-placement": "bottom" },
                            React.createElement("span", { className: "glyphicon glyphicon-tint" }),
                            " ",
                            React.createElement("span", { className: "ATable-label" }, "Hydropathy")),
                        React.createElement("th", { title: Tooltips.get("agl-Charge"), className: "col col-5 ATable-header-charge init-agp-tooltip", "data-toggle": "tooltip", "data-placement": "bottom" },
                            React.createElement("span", { className: "glyphicon glyphicon-flash" }),
                            " ",
                            React.createElement("span", { className: "ATable-label" }, "Charge")),
                        React.createElement("th", { title: Tooltips.get("agl-Polarity"), className: "col col-6 ATable-header-polarity init-agp-tooltip", "data-toggle": "tooltip", "data-placement": "bottom" },
                            React.createElement("span", { className: "glyphicon glyphicon-plus" }),
                            " ",
                            React.createElement("span", { className: "ATable-label" }, "Polarity")),
                        React.createElement("th", { title: Tooltips.get("agl-Mutability"), className: "col col-7 ATable-header-mutability init-agp-tooltip", "data-toggle": "tooltip", "data-placement": "bottom" },
                            React.createElement("span", { className: "glyphicon glyphicon-scissors" }),
                            " ",
                            React.createElement("span", { className: "ATable-label" }, "Mutability")),
                        React.createElement("th", { title: Tooltips.get("agl-LogP"), className: "col col-8 ATable-header-logp init-agp-tooltip", "data-toggle": "tooltip", "data-placement": "bottom" },
                            React.createElement("span", { className: "icon logp" }),
                            " ",
                            React.createElement("span", { className: "ATable-label" }, "LogP")),
                        React.createElement("th", { title: Tooltips.get("agl-LogD"), className: "col col-9 ATable-header-logd init-agp-tooltip", "data-toggle": "tooltip", "data-placement": "bottom" },
                            React.createElement("span", { className: "icon logd" }),
                            " ",
                            React.createElement("span", { className: "ATable-label" }, "LogD")),
                        React.createElement("th", { title: Tooltips.get("agl-LogS"), className: "col col-10 ATable-header-logs init-agp-tooltip", "data-toggle": "tooltip", "data-placement": "bottom" },
                            React.createElement("span", { className: "icon logs" }),
                            " ",
                            React.createElement("span", { className: "ATable-label" }, "LogS")),
                        React.createElement("th", { title: Tooltips.get("agl-Ionizable"), className: "col col-11 ATable-header-ionizable init-agp-tooltip", "data-toggle": "tooltip", "data-placement": "bottom" },
                            React.createElement("span", { className: "icon ionizable" }),
                            " ",
                            React.createElement("span", { className: "ATable-label" }, "Ionizable")))));
            };
            ;
            return DGHead;
        }(React.Component));
        var DGBody = (function (_super) {
            __extends(DGBody, _super);
            function DGBody() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGBody.prototype.generateRows = function () {
                var rows = [];
                if (this.props.data === null || this.props.data.length === 0) {
                    rows.push(React.createElement("tr", null,
                        React.createElement("td", { colSpan: DGTABLE_COLS_COUNT }, "There are no data to be displayed...")));
                }
                if (this.props.data !== null) {
                    for (var _i = 0, _a = this.props.data; _i < _a.length; _i++) {
                        var tunnel = _a[_i];
                        rows.push(React.createElement(DGRow, { tunnel: tunnel, app: this.props.app }));
                    }
                }
                rows.push(React.createElement(DGComponents.DGRowEmpty, { columnsCount: DGTABLE_COLS_COUNT }));
                return rows;
            };
            DGBody.prototype.render = function () {
                var rows = this.generateRows();
                return (React.createElement("table", null, rows));
            };
            ;
            return DGBody;
        }(React.Component));
        var DGRow = (function (_super) {
            __extends(DGRow, _super);
            function DGRow() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGRow.prototype.render = function () {
                var name = MoleOnlineWebUI.Cache.TunnelName.get(this.props.tunnel.GUID);
                var namePart = (name === void 0) ? 'X' : " (" + name + ")";
                var tunnelID = this.props.tunnel.Type + namePart;
                if (Common.Util.Router.isInChannelsDBMode()) {
                    var annotations = MoleOnlineWebUI.Cache.ChannelsDBData.getChannelAnnotationsImmediate(this.props.tunnel.Id);
                    if (annotations !== null && annotations.length > 0) {
                        tunnelID = annotations[0].name;
                    }
                    else {
                        tunnelID = this.props.tunnel.Type;
                    }
                }
                return (React.createElement("tr", null,
                    React.createElement("td", { className: "col col-1" }, tunnelID),
                    React.createElement("td", { className: "col col-2" },
                        CommonUtils.Tunnels.getLength(this.props.tunnel),
                        " \u00C5"),
                    React.createElement("td", { className: "col col-3" },
                        CommonUtils.Tunnels.getBottleneck(this.props.tunnel),
                        " \u00C5"),
                    React.createElement("td", { className: "col col-4" }, Common.Util.Numbers.roundToDecimal(this.props.tunnel.Properties.Hydropathy, 2)),
                    React.createElement("td", { className: "col col-5" }, Common.Util.Numbers.roundToDecimal(this.props.tunnel.Properties.Charge, 2)),
                    React.createElement("td", { className: "col col-6" }, Common.Util.Numbers.roundToDecimal(this.props.tunnel.Properties.Polarity, 2)),
                    React.createElement("td", { className: "col col-7" }, Common.Util.Numbers.roundToDecimal(this.props.tunnel.Properties.Mutability, 2)),
                    React.createElement("td", { className: "col col-8" }, (this.props.tunnel.Properties.LogP) ? Common.Util.Numbers.roundToDecimal(this.props.tunnel.Properties.LogP, 2) : 'N/A'),
                    React.createElement("td", { className: "col col-9" }, (this.props.tunnel.Properties.LogD) ? Common.Util.Numbers.roundToDecimal(this.props.tunnel.Properties.LogD, 2) : 'N/A'),
                    React.createElement("td", { className: "col col-10" }, (this.props.tunnel.Properties.LogS) ? Common.Util.Numbers.roundToDecimal(this.props.tunnel.Properties.LogS, 2) : 'N/A'),
                    React.createElement("td", { className: "col col-11" }, (this.props.tunnel.Properties.Ionizable) ? Common.Util.Numbers.roundToDecimal(this.props.tunnel.Properties.Ionizable, 2) : 'N/A')));
            };
            return DGRow;
        }(React.Component));
    })(UI = AglomeredParameters.UI || (AglomeredParameters.UI = {}));
})(AglomeredParameters || (AglomeredParameters = {}));
var LayerProperties;
(function (LayerProperties) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        var DGComponents = Datagrid.Components;
        var WebChemistryCore = WebChemistry.Tunnels.Core;
        var DGTABLE_COLS_COUNT = 2;
        var NO_DATA_MESSAGE = "Hover over channel(2D) for details...";
        ;
        function render(target, plugin) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, { controller: plugin }), target);
        }
        UI.render = render;
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    data: null,
                    app: _this,
                    layerIds: [],
                    selectionOn: false
                };
                return _this;
            }
            App.prototype.componentDidMount = function () {
                var _this = this;
                CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(function () {
                    var state = _this.state;
                    state.layerIds = [];
                    state.data = null;
                    state.selectionOn = false;
                    _this.setState(state);
                });
                CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler(function (data) {
                    var state = _this.state;
                    state.layerIds = [];
                    state.data = data.LayersInfo;
                    state.selectionOn = false;
                    _this.setState(state);
                });
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(function () {
                    var state = _this.state;
                    state.layerIds = [];
                    state.data = null;
                    state.selectionOn = false;
                    _this.setState(state);
                });
                $(window).on('layerTriggered', this.layerTriggerHandler.bind(this));
                $(window).on('layerSelected', this.layerSelectedHandler.bind(this));
            };
            App.prototype.layerTriggerHandler = function (event, layerIdx) {
                var state = this.state;
                if (state.selectionOn) {
                    return;
                }
                state.layerIds = [layerIdx];
                this.setState(state);
                setTimeout(function () {
                    $(window).trigger('contentResize');
                }, 1);
            };
            App.prototype.layerSelectedHandler = function (event, data) {
                var state = this.state;
                state.layerIds = data.layerIds;
                state.selectionOn = state.layerIds.length > 0;
                this.setState(state);
                setTimeout(function () {
                    $(window).trigger('contentResize');
                }, 1);
            };
            App.prototype.componentWillUnmount = function () {
            };
            App.prototype.render = function () {
                if (this.state.data !== null && this.state.layerIds.length > 0) {
                    return (React.createElement("div", null,
                        React.createElement(DGTable, __assign({}, this.state))));
                }
                return React.createElement("div", null,
                    React.createElement(DGNoData, __assign({}, this.state)));
            };
            return App;
        }(React.Component));
        UI.App = App;
        var DGNoData = (function (_super) {
            __extends(DGNoData, _super);
            function DGNoData() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGNoData.prototype.render = function () {
                return (React.createElement("div", { className: "datagrid", id: "dg-layer-properties" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, __assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement("table", null,
                            React.createElement(DGComponents.DGNoDataInfoRow, { columnsCount: DGTABLE_COLS_COUNT, infoText: NO_DATA_MESSAGE }),
                            React.createElement(DGComponents.DGRowEmpty, { columnsCount: DGTABLE_COLS_COUNT })))));
            };
            return DGNoData;
        }(React.Component));
        var DGTable = (function (_super) {
            __extends(DGTable, _super);
            function DGTable() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGTable.prototype.render = function () {
                return (React.createElement("div", { className: "datagrid", id: "dg-layer-properties" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, __assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement(DGBody, __assign({}, this.props)))));
            };
            return DGTable;
        }(React.Component));
        var DGHead = (function (_super) {
            __extends(DGHead, _super);
            function DGHead() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGHead.prototype.render = function () {
                return (React.createElement("table", null,
                    React.createElement("tr", null,
                        React.createElement("th", { title: "Property", className: "col col-1" }, "Property"),
                        React.createElement("th", { title: "Value", className: "col col-2" }, "Value"))));
            };
            ;
            return DGHead;
        }(React.Component));
        var DGBody = (function (_super) {
            __extends(DGBody, _super);
            function DGBody() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGBody.prototype.getPropertiesData = function (layerIds) {
                var layersData = this.props.data;
                if (layersData === null) {
                    return null;
                }
                var layers = [];
                for (var _i = 0, layerIds_2 = layerIds; _i < layerIds_2.length; _i++) {
                    var layerIdx = layerIds_2[_i];
                    var layer = layersData[layerIdx];
                    var residues = CommonUtils.Residues.parseResidues(layer.Residues, true);
                    var backboneLining = residues.filter(function (r) { return r.backbone === true; }).map(function (v, i, arr) {
                        return {
                            Name: v.name,
                            SeqNumber: v.authSeqNumber,
                            Chain: v.chain.authAsymId
                        };
                    });
                    var nonBackboneLining = residues.filter(function (r) { return r.backbone === false; }).map(function (v, i, arr) {
                        return {
                            Name: v.name,
                            SeqNumber: v.authSeqNumber,
                            Chain: v.chain.authAsymId
                        };
                    });
                    layers.push({
                        NonBackboneLining: nonBackboneLining,
                        BackboneLining: backboneLining,
                        Length: Math.abs(layer.LayerGeometry.EndDistance - layer.LayerGeometry.StartDistance)
                    });
                }
                var data = WebChemistryCore.PhysicoChemicalPropertyCalculation.CalculateAgregatedLayersProperties(layers);
                if (data === null) {
                    return null;
                }
                return {
                    Charge: data.Charge,
                    Hydropathy: data.Hydropathy,
                    Hydrophobicity: data.Hydrophobicity,
                    Ionizable: data.Ionizable,
                    LogD: data.LogD,
                    LogP: data.LogP,
                    LogS: data.LogS,
                    Mutability: data.Mutability,
                    NumNegatives: data.NumNegatives,
                    NumPositives: data.NumPositives,
                    Polarity: data.Polarity
                };
            };
            DGBody.prototype.getBottleneck = function (layerdIds) {
                if (this.props.data === null) {
                    return 0;
                }
                var minRadiusArr = [];
                for (var _i = 0, layerdIds_1 = layerdIds; _i < layerdIds_1.length; _i++) {
                    var layerIdx = layerdIds_1[_i];
                    minRadiusArr.push(this.props.data[layerIdx].LayerGeometry.MinRadius);
                }
                return Math.min.apply(Math, minRadiusArr);
            };
            DGBody.prototype.getLength = function (layerdIds) {
                var length = 0;
                if (this.props.data === null) {
                    return 0;
                }
                for (var _i = 0, layerdIds_2 = layerdIds; _i < layerdIds_2.length; _i++) {
                    var layerIdx = layerdIds_2[_i];
                    var geometry = this.props.data[layerIdx].LayerGeometry;
                    length += Math.abs(geometry.EndDistance - geometry.StartDistance);
                }
                return length;
            };
            DGBody.prototype.generateRows = function () {
                if (this.props.data === null) {
                    return React.createElement(DGComponents.DGNoDataInfoRow, { columnsCount: DGTABLE_COLS_COUNT, infoText: NO_DATA_MESSAGE });
                }
                var layerData = this.getPropertiesData(this.props.layerIds);
                var rows = [];
                var charge = (layerData === null) ? 'N/A' : Common.Util.Numbers.roundToDecimal(layerData.Charge, 2).toString() + " (+" + Common.Util.Numbers.roundToDecimal(layerData.NumPositives, 2).toString() + "/-" + Common.Util.Numbers.roundToDecimal(layerData.NumNegatives, 2).toString() + ")";
                var bottleneck = this.getBottleneck(this.props.layerIds);
                var hydropathy = (layerData === null) ? 'N/A' : Common.Util.Numbers.roundToDecimal(layerData.Hydropathy, 2).toString();
                var polarity = (layerData === null) ? 'N/A' : Common.Util.Numbers.roundToDecimal(layerData.Polarity, 2).toString();
                var hydrophobicity = (layerData === null) ? 'N/A' : Common.Util.Numbers.roundToDecimal(layerData.Hydrophobicity, 2).toString();
                var mutability = (layerData === null) ? 'N/A' : Common.Util.Numbers.roundToDecimal(layerData.Mutability, 2).toString();
                var length = this.getLength(this.props.layerIds);
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "glyphicon glyphicon-tint properties-icon" }),
                            "Hydropathy"), React.createElement("span", null, hydropathy)] }));
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "glyphicon glyphicon-plus properties-icon" }),
                            "Polarity"), React.createElement("span", null, polarity)] }));
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "glyphicon glyphicon-tint properties-icon upside-down" }),
                            "Hydrophobicity"), React.createElement("span", null, hydrophobicity)] }));
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "glyphicon glyphicon-scissors properties-icon" }),
                            "Mutability"), React.createElement("span", null, mutability)] }));
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "glyphicon glyphicon-flash properties-icon" }),
                            "Charge"), React.createElement("span", null, charge)] }));
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "icon bottleneck black properties-icon" }),
                            (this.props.layerIds.length > 1) ? "Bottleneck" : "Radius"), React.createElement("span", null, Common.Util.Numbers.roundToDecimal(bottleneck, 1))] }));
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "icon logp black properties-icon" }),
                            "LogP"), React.createElement("span", null, (layerData !== null && layerData.LogP !== null && layerData.LogP !== void 0) ? Common.Util.Numbers.roundToDecimal(layerData.LogP, 2) : 'N/A')] }));
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "icon logd black properties-icon" }),
                            "LogD"), React.createElement("span", null, (layerData !== null && layerData.LogD !== null && layerData.LogD !== void 0) ? Common.Util.Numbers.roundToDecimal(layerData.LogD, 2) : 'N/A')] }));
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "icon logs black properties-icon" }),
                            "LogS"), React.createElement("span", null, (layerData !== null && layerData.LogS !== null && layerData.LogS !== void 0) ? Common.Util.Numbers.roundToDecimal(layerData.LogS, 2) : 'N/A')] }));
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "icon ionizable black properties-icon" }),
                            "Ionizable"), React.createElement("span", null, (layerData !== null && layerData.Ionizable !== null && layerData.Ionizable !== void 0) ? Common.Util.Numbers.roundToDecimal(layerData.Ionizable, 2) : 'N/A')] }));
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "glyphicon glyphicon-resize-horizontal properties-icon" }),
                            "Length"), React.createElement("span", null, Common.Util.Numbers.roundToDecimal(length, 1).toString())] }));
                rows.push(React.createElement(DGComponents.DGRowEmpty, { columnsCount: DGTABLE_COLS_COUNT }));
                return rows;
            };
            DGBody.prototype.render = function () {
                var rows = this.generateRows();
                return (React.createElement("table", null, rows));
            };
            ;
            return DGBody;
        }(React.Component));
        var DGRow = (function (_super) {
            __extends(DGRow, _super);
            function DGRow() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGRow.prototype.generateRow = function (columns) {
                var tds = [];
                for (var i = 0; i < columns.length; i++) {
                    tds.push(React.createElement("td", { className: "col col-" + (i + 1) }, columns[i]));
                }
                return tds;
            };
            DGRow.prototype.render = function () {
                return (React.createElement("tr", null, this.generateRow(this.props.columns)));
            };
            return DGRow;
        }(React.Component));
    })(UI = LayerProperties.UI || (LayerProperties.UI = {}));
})(LayerProperties || (LayerProperties = {}));
var LayerResidues;
(function (LayerResidues) {
    var UI;
    (function (UI) {
        var DGComponents = Datagrid.Components;
        var React = LiteMol.Plugin.React;
        var DGTABLE_COLS_COUNT = 2;
        var NO_DATA_MESSAGE = "Hover over channel(2D) for details...";
        ;
        function render(target, plugin) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, { controller: plugin }), target);
        }
        UI.render = render;
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    data: null,
                    app: _this,
                    layerIds: [],
                    selectionOn: false
                };
                return _this;
            }
            App.prototype.componentDidMount = function () {
                var _this = this;
                CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(function () {
                    var state = _this.state;
                    state.layerIds = [];
                    state.data = null;
                    _this.setState(state);
                });
                CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler(function (data) {
                    var state = _this.state;
                    state.layerIds = [];
                    state.data = data.LayersInfo;
                    _this.setState(state);
                });
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(function () {
                    var state = _this.state;
                    state.layerIds = [];
                    state.data = null;
                    _this.setState(state);
                });
                $(window).on('layerTriggered', this.layerTriggerHandler.bind(this));
                $(window).on('layerSelected', this.layerSelectedHandler.bind(this));
            };
            App.prototype.layerTriggerHandler = function (event, layerIdx) {
                var state = this.state;
                if (state.selectionOn) {
                    return;
                }
                state.layerIds = [layerIdx];
                this.setState(state);
                setTimeout(function () {
                    $(window).trigger('contentResize');
                }, 1);
            };
            App.prototype.layerSelectedHandler = function (event, data) {
                var state = this.state;
                state.layerIds = data.layerIds;
                state.selectionOn = state.layerIds.length > 0;
                this.setState(state);
                setTimeout(function () {
                    $(window).trigger('contentResize');
                }, 1);
            };
            App.prototype.componentWillUnmount = function () {
            };
            App.prototype.render = function () {
                if (this.state.data !== null && this.state.layerIds.length > 0) {
                    return (React.createElement("div", null,
                        React.createElement(DGTable, __assign({}, this.state))));
                }
                return React.createElement("div", null,
                    React.createElement(DGNoData, __assign({}, this.state)));
            };
            return App;
        }(React.Component));
        UI.App = App;
        var DGNoData = (function (_super) {
            __extends(DGNoData, _super);
            function DGNoData() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGNoData.prototype.render = function () {
                return (React.createElement("div", { className: "datagrid", id: "dg-layer-residues" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, __assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement("table", null,
                            React.createElement(DGComponents.DGNoDataInfoRow, { columnsCount: DGTABLE_COLS_COUNT, infoText: NO_DATA_MESSAGE }),
                            React.createElement(DGComponents.DGRowEmpty, { columnsCount: DGTABLE_COLS_COUNT })))));
            };
            return DGNoData;
        }(React.Component));
        var DGTable = (function (_super) {
            __extends(DGTable, _super);
            function DGTable() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGTable.prototype.render = function () {
                return (React.createElement("div", { className: "datagrid", id: "dg-layer-residues" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, __assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement(DGBody, __assign({}, this.props)))));
            };
            return DGTable;
        }(React.Component));
        var DGHead = (function (_super) {
            __extends(DGHead, _super);
            function DGHead() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGHead.prototype.render = function () {
                return (React.createElement("table", null,
                    React.createElement("tr", null,
                        React.createElement("th", { title: "Residue", className: "col col-1" }, "Residue"))));
            };
            ;
            return DGHead;
        }(React.Component));
        var DGBody = (function (_super) {
            __extends(DGBody, _super);
            function DGBody() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGBody.prototype.shortenBackbone = function (residue) {
                return residue.replace(/Backbone/g, 'BB');
            };
            DGBody.prototype.isBackbone = function (residue) {
                return residue.indexOf("Backbone") >= 0;
            };
            DGBody.prototype.getAnnotationLinkOrText = function (annotation) {
                if (annotation.reference === "") {
                    return (annotation.text !== void 0 && annotation.text !== null) ? React.createElement("span", null, annotation.text) : React.createElement("span", { className: "no-annotation" });
                }
                return React.createElement("a", { target: "_blank", href: annotation.link, dangerouslySetInnerHTML: { __html: annotation.text } });
            };
            DGBody.prototype.generateSpannedRows = function (residue, annotations) {
                var trs = [];
                var residueNameEl = residue;
                var first = true;
                for (var _i = 0, annotations_1 = annotations; _i < annotations_1.length; _i++) {
                    var annotation = annotations_1[_i];
                    if (first === true) {
                        first = false;
                        trs.push(React.createElement("tr", { title: (this.isBackbone(residue) ? residue : ""), className: (this.isBackbone(residue) ? "help" : "") },
                            React.createElement("td", { className: "col col-1", rowSpan: (annotations.length > 1) ? annotations.length : void 0 }, residueNameEl),
                            React.createElement("td", { className: "col col-2" }, this.getAnnotationLinkOrText(annotation))));
                    }
                    else {
                        trs.push(React.createElement("tr", null,
                            React.createElement("td", { className: "col col-2" }, this.getAnnotationLinkOrText(annotation))));
                    }
                }
                return trs;
            };
            DGBody.prototype.getResidues = function (layerIds) {
                if (this.props.data === null) {
                    return [];
                }
                var residuesSet = new Set();
                for (var _i = 0, layerIds_3 = layerIds; _i < layerIds_3.length; _i++) {
                    var idx = layerIds_3[_i];
                    for (var _a = 0, _b = this.props.data[idx].Residues; _a < _b.length; _a++) {
                        var r = _b[_a];
                        residuesSet.add(r);
                    }
                }
                return Array.from(residuesSet.values());
            };
            DGBody.prototype.generateRows = function () {
                var columnCount = DGTABLE_COLS_COUNT;
                if (this.props.data === null) {
                    return React.createElement(DGComponents.DGNoDataInfoRow, { columnsCount: columnCount, infoText: NO_DATA_MESSAGE });
                }
                var layerData = CommonUtils.Residues.sort(this.getResidues(this.props.layerIds), void 0, true, true);
                var rows = [];
                for (var _i = 0, layerData_1 = layerData; _i < layerData_1.length; _i++) {
                    var residue = layerData_1[_i];
                    var residueId = residue.split(" ").slice(1, 3).join(" ");
                    var residueInfo = CommonUtils.Residues.parseResidues([residue], true);
                    var columns = [];
                    columns.push((this.isBackbone(residue)) ? React.createElement("span", null, residue) : React.createElement("strong", null, residue));
                    var seqNumberAndChain = residueInfo[0].authSeqNumber + " " + residueInfo[0].chain.authAsymId;
                    var annotations = MoleOnlineWebUI.Cache.ChannelsDBData.getResidueAnnotationsImmediate(seqNumberAndChain);
                    if (annotations !== null && annotations.length > 0) {
                        if (annotations.length > 1) {
                            rows = rows.concat(this.generateSpannedRows(residueId, annotations));
                        }
                        else {
                            columns.push(this.getAnnotationLinkOrText(annotations[0]));
                            rows.push(React.createElement(DGComponents.DGElementRow, { columns: columns, columnsCount: columnCount, title: [(this.isBackbone(residue) ? residue : ""), ""], trClass: (this.isBackbone(residue) ? "help" : "") }));
                        }
                    }
                    else {
                        rows.push(React.createElement(DGComponents.DGElementRow, { columns: columns, columnsCount: columnCount, title: [(this.isBackbone(residue) ? residue : ""), ""], trClass: (this.isBackbone(residue) ? "help" : "") }));
                    }
                }
                rows.push(React.createElement(DGComponents.DGRowEmpty, { columnsCount: columnCount }));
                return rows;
            };
            DGBody.prototype.render = function () {
                var rows = this.generateRows();
                return (React.createElement("table", null, rows));
            };
            ;
            return DGBody;
        }(React.Component));
    })(UI = LayerResidues.UI || (LayerResidues.UI = {}));
})(LayerResidues || (LayerResidues = {}));
var LiningResidues;
(function (LiningResidues) {
    var UI;
    (function (UI) {
        var DGComponents = Datagrid.Components;
        var React = LiteMol.Plugin.React;
        var DGTABLE_COLS_COUNT = 2;
        var NO_DATA_MESSAGE = "Select channel in 3D view for details...";
        ;
        function render(target, plugin) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, { controller: plugin }), target);
        }
        UI.render = render;
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    data: null,
                    app: _this,
                };
                _this.layerIdx = -1;
                return _this;
            }
            App.prototype.componentDidMount = function () {
                var _this = this;
                CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler(function (data) {
                    var state = _this.state;
                    state.data = CommonUtils.Residues.sort(data.ResidueFlow, void 0, true, true);
                    _this.setState(state);
                    setTimeout(function () {
                        $(window).trigger('contentResize');
                    }, 1);
                });
                CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(function () {
                    var state = _this.state;
                    state.data = null;
                    _this.setState(state);
                });
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(function () {
                    var state = _this.state;
                    state.data = null;
                    _this.setState(state);
                });
            };
            App.prototype.componentWillUnmount = function () {
            };
            App.prototype.render = function () {
                if (this.state.data !== null) {
                    return (React.createElement("div", null,
                        React.createElement(DGTable, __assign({}, this.state)),
                        React.createElement(Controls, __assign({}, this.state))));
                }
                return React.createElement("div", null,
                    React.createElement(DGNoData, __assign({}, this.state)));
            };
            return App;
        }(React.Component));
        UI.App = App;
        function residueStringToResidueLight(residue) {
            /*
            [0 , 1 ,2 ,  3   ]
            VAL 647 A Backbone
            */
            var residueParts = residue.split(" ");
            var rv = {
                authSeqNumber: Number(residueParts[1]),
                chain: {
                    authAsymId: residueParts[2]
                }
            };
            return rv;
        }
        var Controls = (function (_super) {
            __extends(Controls, _super);
            function Controls() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Controls.prototype.clearSelection = function () {
                CommonUtils.Selection.SelectionHelper.clearSelection(this.props.app.props.controller);
            };
            Controls.prototype.selectAll = function () {
                var residues = [];
                if (this.props.app.state.data === null) {
                    return;
                }
                for (var _i = 0, _a = this.props.app.state.data; _i < _a.length; _i++) {
                    var residue = _a[_i];
                    residues.push(residueStringToResidueLight(residue));
                }
                CommonUtils.Selection.SelectionHelper.addResiduesToSelection(residues, false);
            };
            Controls.prototype.selectIonizable = function () {
                if (this.props.data === null) {
                    return;
                }
                var allResidues = CommonUtils.Residues.parseResidues(this.props.data, true);
                var ionizableResidues = [];
                for (var _i = 0, allResidues_1 = allResidues; _i < allResidues_1.length; _i++) {
                    var residue = allResidues_1[_i];
                    var rClass = "";
                    if (residue.name !== void 0) {
                        rClass = CommonUtils.Residues.getResidueClassByName(residue.name);
                    }
                    else {
                        rClass = CommonUtils.Residues.getName(residue.authSeqNumber, this.props.app.props.controller);
                    }
                    if (rClass.indexOf("blue") !== -1 || rClass.indexOf("red") !== -1) {
                        ionizableResidues.push(residue);
                    }
                }
                CommonUtils.Selection.SelectionHelper.addResiduesToSelection(ionizableResidues, false);
            };
            Controls.prototype.render = function () {
                return React.createElement("div", { className: "lining-residues select-controls" },
                    React.createElement("span", { className: "btn-xs btn-default bt-ionizable hand", onClick: this.selectIonizable.bind(this) }, "Select ionizable"),
                    React.createElement("span", { className: "btn-xs btn-default bt-all hand", onClick: this.selectAll.bind(this) }, "Select all"));
            };
            return Controls;
        }(React.Component));
        var DGNoData = (function (_super) {
            __extends(DGNoData, _super);
            function DGNoData() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGNoData.prototype.render = function () {
                return (React.createElement("div", { className: "datagrid", id: "dg-lining-residues" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, __assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement("table", null,
                            React.createElement(DGComponents.DGNoDataInfoRow, { columnsCount: DGTABLE_COLS_COUNT, infoText: NO_DATA_MESSAGE }),
                            React.createElement(DGComponents.DGRowEmpty, { columnsCount: DGTABLE_COLS_COUNT })))));
            };
            return DGNoData;
        }(React.Component));
        var DGTable = (function (_super) {
            __extends(DGTable, _super);
            function DGTable() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGTable.prototype.render = function () {
                return (React.createElement("div", { className: "datagrid", id: "dg-lining-residues" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, __assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement(DGBody, __assign({}, this.props)))));
            };
            return DGTable;
        }(React.Component));
        var DGHead = (function (_super) {
            __extends(DGHead, _super);
            function DGHead() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGHead.prototype.render = function () {
                return (React.createElement("table", null,
                    React.createElement("tr", null,
                        React.createElement("th", { title: "Residue", className: "col col-1" }, "Residue"))));
            };
            ;
            return DGHead;
        }(React.Component));
        var DGBody = (function (_super) {
            __extends(DGBody, _super);
            function DGBody() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGBody.prototype.getAnnotationLinkOrText = function (annotation) {
                if (annotation.reference === "") {
                    return (annotation.text !== void 0 && annotation.text !== null) ? React.createElement("span", null, annotation.text) : React.createElement("span", { className: "no-annotation" });
                }
                return React.createElement("a", { target: "_blank", href: annotation.link, dangerouslySetInnerHTML: { __html: annotation.text } });
            };
            DGBody.prototype.shortenBackbone = function (residue) {
                return residue.replace(/Backbone/g, '');
            };
            DGBody.prototype.isBackbone = function (residue) {
                return residue.indexOf("Backbone") >= 0;
            };
            DGBody.prototype.selectResidue = function (residue) {
                var residueLightEntity = residueStringToResidueLight(residue);
                CommonUtils.Selection.SelectionHelper.addResidueToSelection(residueLightEntity.authSeqNumber, residueLightEntity.chain.authAsymId);
            };
            DGBody.prototype.getSelect3DLink = function (residue) {
                var _this = this;
                var residueEl = (this.isBackbone(residue)) ? React.createElement("i", null,
                    React.createElement("strong", null, this.shortenBackbone(residue))) : React.createElement("span", null, residue);
                return React.createElement("a", { className: "hand", onClick: function (e) { _this.selectResidue(residue); } }, residueEl);
            };
            DGBody.prototype.generateSpannedRows = function (residue, annotations) {
                var trs = [];
                var residueNameEl = this.getSelect3DLink(residue);
                var first = true;
                for (var _i = 0, annotations_2 = annotations; _i < annotations_2.length; _i++) {
                    var annotation = annotations_2[_i];
                    if (first === true) {
                        first = false;
                        trs.push(React.createElement("tr", { title: (this.isBackbone(residue) ? residue : ""), className: (this.isBackbone(residue) ? "help" : "") },
                            React.createElement("td", { className: "col col-1", rowSpan: (annotations.length > 1) ? annotations.length : void 0 }, residueNameEl),
                            React.createElement("td", { className: "col col-2" }, this.getAnnotationLinkOrText(annotation))));
                    }
                    else {
                        trs.push(React.createElement("tr", null,
                            React.createElement("td", { className: "col col-2" }, this.getAnnotationLinkOrText(annotation))));
                    }
                }
                return trs;
            };
            DGBody.prototype.generateRows = function () {
                var columnsCount = DGTABLE_COLS_COUNT;
                if (this.props.data === null) {
                    return React.createElement(DGComponents.DGNoDataInfoRow, { columnsCount: DGTABLE_COLS_COUNT, infoText: NO_DATA_MESSAGE });
                }
                var rows = [];
                for (var _i = 0, _a = this.props.data; _i < _a.length; _i++) {
                    var residue = _a[_i];
                    var residueId = residue.split(" ").slice(1, 3).join(" ");
                    var residueInfo = CommonUtils.Residues.parseResidues([residue], true);
                    var trClass = (this.isBackbone(residue) ? "help" : "");
                    if (residueInfo.length > 0) {
                        var authName = residueInfo[0].name;
                        trClass += (authName === void 0) ? '' : " " + CommonUtils.Residues.getResidueClassByName(authName);
                    }
                    var seqNumberAndChain = residueInfo[0].authSeqNumber + " " + residueInfo[0].chain.authAsymId;
                    var annotations = MoleOnlineWebUI.Cache.ChannelsDBData.getResidueAnnotationsImmediate(seqNumberAndChain);
                    if (annotations !== null && annotations.length > 0) {
                        if (annotations.length > 1) {
                            rows = rows.concat(this.generateSpannedRows(residue, annotations));
                        }
                        else {
                            rows.push(React.createElement(DGComponents.DGElementRow, { columnsCount: columnsCount, columns: [this.getSelect3DLink(residue), this.getAnnotationLinkOrText(annotations[0])], title: [(this.isBackbone(residue) ? residue : "")], trClass: trClass }));
                        }
                    }
                    else {
                        rows.push(React.createElement(DGComponents.DGElementRow, { columnsCount: columnsCount, columns: [this.getSelect3DLink(residue)], title: [(this.isBackbone(residue) ? residue : "")], trClass: trClass }));
                    }
                }
                rows.push(React.createElement(DGComponents.DGRowEmpty, { columnsCount: columnsCount }));
                return rows;
            };
            DGBody.prototype.render = function () {
                var rows = this.generateRows();
                return (React.createElement("table", null, rows));
            };
            ;
            return DGBody;
        }(React.Component));
    })(UI = LiningResidues.UI || (LiningResidues.UI = {}));
})(LiningResidues || (LiningResidues = {}));
var ChannelParameters;
(function (ChannelParameters) {
    var UI;
    (function (UI) {
        var DGComponents = Datagrid.Components;
        var React = LiteMol.Plugin.React;
        var DGTABLE_COLS_COUNT = 2;
        var NO_DATA_MESSAGE = "Select channel in 3D view for details...";
        ;
        function render(target, plugin) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, { controller: plugin }), target);
        }
        UI.render = render;
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    data: null,
                    currentTunnel: null,
                    app: _this,
                };
                _this.layerIdx = -1;
                return _this;
            }
            App.prototype.componentDidMount = function () {
                var _this = this;
                MoleOnlineWebUI.Bridge.Events.subscribeChannelDataLoaded(function (data) {
                    var toShow = [];
                    var channelsDbTunnels = data.Channels;
                    var moleTunnels = data.Channels;
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, moleTunnels.Tunnels);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, moleTunnels.Paths);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, moleTunnels.Pores);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, moleTunnels.MergedPores);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.ReviewedChannels);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.CSATunnels);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.TransmembranePores);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.CofactorTunnels);
                    var state = _this.state;
                    state.data = toShow;
                    _this.setState(state);
                    $(window).trigger("contentResize");
                });
                CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler(function (data, channelId) {
                    if (channelId === void 0) {
                        return;
                    }
                    var state = _this.state;
                    state.currentTunnel = channelId;
                    _this.setState(state);
                    setTimeout(function () {
                        $(window).trigger('contentResize');
                    }, 1);
                });
                CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(function () {
                    var state = _this.state;
                    state.currentTunnel = null;
                    _this.setState(state);
                });
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(function () {
                    var state = _this.state;
                    state.currentTunnel = null;
                    _this.setState(state);
                });
            };
            App.prototype.componentWillUnmount = function () {
            };
            App.prototype.render = function () {
                if (this.state.data !== null && this.state.currentTunnel !== null) {
                    return (React.createElement("div", null,
                        React.createElement(DGTable, __assign({}, this.state))));
                }
                return React.createElement("div", null,
                    React.createElement(DGNoData, __assign({}, this.state)));
            };
            return App;
        }(React.Component));
        UI.App = App;
        var DGNoData = (function (_super) {
            __extends(DGNoData, _super);
            function DGNoData() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGNoData.prototype.render = function () {
                return (React.createElement("div", { className: "datagrid", id: "dg-channel-parameters" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, __assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement("table", null,
                            React.createElement(DGComponents.DGNoDataInfoRow, { columnsCount: DGTABLE_COLS_COUNT, infoText: NO_DATA_MESSAGE }),
                            React.createElement(DGComponents.DGRowEmpty, { columnsCount: DGTABLE_COLS_COUNT })))));
            };
            return DGNoData;
        }(React.Component));
        var DGTable = (function (_super) {
            __extends(DGTable, _super);
            function DGTable() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGTable.prototype.render = function () {
                return (React.createElement("div", { className: "datagrid", id: "dg-channel-parameters" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, __assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement(DGBody, __assign({}, this.props)))));
            };
            return DGTable;
        }(React.Component));
        var DGHead = (function (_super) {
            __extends(DGHead, _super);
            function DGHead() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGHead.prototype.render = function () {
                return (React.createElement("table", null,
                    React.createElement("tr", null,
                        React.createElement("th", { title: "Property", className: "col col-1" }, "Property"),
                        React.createElement("th", { title: "Value", className: "col col-2" }, "Value"))));
            };
            ;
            return DGHead;
        }(React.Component));
        var DGBody = (function (_super) {
            __extends(DGBody, _super);
            function DGBody() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DGBody.prototype.generateRows = function () {
                var columnsCount = DGTABLE_COLS_COUNT;
                if (this.props.data === null) {
                    return React.createElement(DGComponents.DGNoDataInfoRow, { columnsCount: DGTABLE_COLS_COUNT, infoText: NO_DATA_MESSAGE });
                }
                var rows = [];
                var data = this.props.data;
                for (var _i = 0, data_3 = data; _i < data_3.length; _i++) {
                    var t = data_3[_i];
                    if (t.Id === this.props.currentTunnel) {
                        var length_1 = [
                            React.createElement("span", null,
                                React.createElement("span", { className: "glyphicon glyphicon-resize-horizontal properties-icon" }),
                                "Length"),
                            React.createElement("span", null, Common.Util.Numbers.roundToDecimal(CommonUtils.Tunnels.getLength(t), 2).toString())
                        ];
                        var bottleneck = [
                            React.createElement("span", null,
                                React.createElement("span", { className: "icon bottleneck black properties-icon" }),
                                "Bottleneck"),
                            React.createElement("span", null, CommonUtils.Tunnels.getBottleneck(t))
                        ];
                        var hydropathy = [
                            React.createElement("span", null,
                                React.createElement("span", { className: "glyphicon glyphicon-tint properties-icon" }),
                                "Hydropathy"),
                            React.createElement("span", null, Common.Util.Numbers.roundToDecimal(t.Properties.Hydropathy, 2).toString())
                        ];
                        var charge = [
                            React.createElement("span", null,
                                React.createElement("span", { className: "glyphicon glyphicon-flash properties-icon" }),
                                "Charge"),
                            React.createElement("span", null, Common.Util.Numbers.roundToDecimal(t.Properties.Charge, 2).toString())
                        ];
                        var polarity = [
                            React.createElement("span", null,
                                React.createElement("span", { className: "glyphicon glyphicon-plus properties-icon" }),
                                "Polarity"),
                            React.createElement("span", null, Common.Util.Numbers.roundToDecimal(t.Properties.Polarity, 2).toString())
                        ];
                        var mutability = [
                            React.createElement("span", null,
                                React.createElement("span", { className: "glyphicon glyphicon-scissors properties-icon" }),
                                "Mutability"),
                            React.createElement("span", null, Common.Util.Numbers.roundToDecimal(t.Properties.Mutability, 2).toString())
                        ];
                        var logP = [
                            React.createElement("span", null,
                                React.createElement("span", { className: "icon logp black properties-icon" }),
                                "LogP"),
                            React.createElement("span", null, (t.Properties.LogP) ? Common.Util.Numbers.roundToDecimal(t.Properties.LogP, 2) : 'N/A')
                        ];
                        var logD = [
                            React.createElement("span", null,
                                React.createElement("span", { className: "icon logd black properties-icon" }),
                                "LogD"),
                            React.createElement("span", null, (t.Properties.LogD) ? Common.Util.Numbers.roundToDecimal(t.Properties.LogD, 2) : 'N/A')
                        ];
                        var logS = [
                            React.createElement("span", null,
                                React.createElement("span", { className: "icon logs black properties-icon" }),
                                "LogS"),
                            React.createElement("span", null, (t.Properties.LogS) ? Common.Util.Numbers.roundToDecimal(t.Properties.LogS, 2) : 'N/A')
                        ];
                        var ionizable = [
                            React.createElement("span", null,
                                React.createElement("span", { className: "icon ionizable black properties-icon" }),
                                "Ionizable"),
                            React.createElement("span", null, (t.Properties.Ionizable) ? Common.Util.Numbers.roundToDecimal(t.Properties.Ionizable, 2) : 'N/A')
                        ];
                        //Length
                        rows.push(React.createElement(DGComponents.DGElementRow, { columnsCount: columnsCount, columns: length_1 }));
                        //Bottleneck
                        rows.push(React.createElement(DGComponents.DGElementRow, { columnsCount: columnsCount, columns: bottleneck }));
                        //Hydropathy
                        rows.push(React.createElement(DGComponents.DGElementRow, { columnsCount: columnsCount, columns: hydropathy }));
                        //Charge
                        rows.push(React.createElement(DGComponents.DGElementRow, { columnsCount: columnsCount, columns: charge }));
                        //Polarity
                        rows.push(React.createElement(DGComponents.DGElementRow, { columnsCount: columnsCount, columns: polarity }));
                        //Mutability
                        rows.push(React.createElement(DGComponents.DGElementRow, { columnsCount: columnsCount, columns: mutability }));
                        //LogP
                        rows.push(React.createElement(DGComponents.DGElementRow, { columnsCount: columnsCount, columns: logP }));
                        //LogD
                        rows.push(React.createElement(DGComponents.DGElementRow, { columnsCount: columnsCount, columns: logD }));
                        //LogS
                        rows.push(React.createElement(DGComponents.DGElementRow, { columnsCount: columnsCount, columns: logS }));
                        //Ionizable
                        rows.push(React.createElement(DGComponents.DGElementRow, { columnsCount: columnsCount, columns: ionizable }));
                    }
                }
                rows.push(React.createElement(DGComponents.DGRowEmpty, { columnsCount: columnsCount }));
                return rows;
            };
            DGBody.prototype.render = function () {
                var rows = this.generateRows();
                return (React.createElement("table", null, rows));
            };
            ;
            return DGBody;
        }(React.Component));
    })(UI = ChannelParameters.UI || (ChannelParameters.UI = {}));
})(ChannelParameters || (ChannelParameters = {}));
var PDFReportGenerator;
(function (PDFReportGenerator) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        function render(target) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, null), target);
        }
        UI.render = render;
        ;
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.a4width = 210;
                _this.a4height = 297;
                _this.lineColor = "0.7";
                _this.lineWidth = 0.3;
                _this.state = { data: null, reportContent: null, inProgress: false, progress: 0 };
                return _this;
            }
            App.prototype.componentDidMount = function () {
                var _this = this;
                MoleOnlineWebUI.Bridge.Events.subscribeChannelDataLoaded(function (data) {
                    var state = _this.state;
                    state.data = data;
                    _this.setState(state);
                });
                MoleOnlineWebUI.Bridge.Events.subscribeRunGeneratePDFReport(function () {
                    if (_this.state.inProgress === true) {
                        console.log("Attempt to run PDF report generator while in progress!");
                        return;
                    }
                    _this.generateReport();
                });
            };
            App.prototype.addCurrentLMScreen = function (template) {
                var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                var litemolCanvas = plugin.context.scene.scene.parentElement.children[0];
                var litemol_screenshot = litemolCanvas.toDataURL('image/png');
                template = template.replace("[[3D-SCREEN-SRC]]", litemol_screenshot);
                return template.replace("[[report-3D-view-visible]]", "visible");
            };
            App.prototype.addCurrentLVZScreen = function (template) {
                var lvz = MoleOnlineWebUI.Bridge.Instances.getLayersVizualizer();
                var screenshot = lvz.exportImage();
                template = template.replace("[[2D-SCREEN-SRC]]", screenshot);
                return template.replace("[[report-2D-view-visible]]", "visible");
            };
            App.prototype.addTunnelName = function (template, text) {
                return template.replace("[[TUNNEL-NAME]]", text);
            };
            App.prototype.addPhysChemProps = function (template, tunnel) {
                var length = Common.Util.Numbers.roundToDecimal(CommonUtils.Tunnels.getLength(tunnel), 2).toString();
                var bottleneck = CommonUtils.Tunnels.getBottleneck(tunnel);
                var hydropathy = Common.Util.Numbers.roundToDecimal(tunnel.Properties.Hydropathy, 2).toString();
                var charge = Common.Util.Numbers.roundToDecimal(tunnel.Properties.Charge, 2).toString();
                var polarity = Common.Util.Numbers.roundToDecimal(tunnel.Properties.Polarity, 2).toString();
                var mutability = Common.Util.Numbers.roundToDecimal(tunnel.Properties.Mutability, 2).toString();
                var logP = (tunnel.Properties.LogP !== null && tunnel.Properties.LogP !== void 0) ? Common.Util.Numbers.roundToDecimal(tunnel.Properties.LogP, 2).toString() : 'N/A';
                var logD = (tunnel.Properties.LogD !== null && tunnel.Properties.LogD !== void 0) ? Common.Util.Numbers.roundToDecimal(tunnel.Properties.LogD, 2).toString() : 'N/A';
                var logS = (tunnel.Properties.LogS !== null && tunnel.Properties.LogS !== void 0) ? Common.Util.Numbers.roundToDecimal(tunnel.Properties.LogS, 2).toString() : 'N/A';
                var ionizable = (tunnel.Properties.Ionizable !== null && tunnel.Properties.Ionizable !== void 0) ? Common.Util.Numbers.roundToDecimal(tunnel.Properties.Ionizable, 2).toString() : 'N/A';
                template = this.replacePlaceholder(template, "TUNNEL-PROPS-LENGTH", length);
                template = this.replacePlaceholder(template, "TUNNEL-PROPS-BOTTLENECK", bottleneck);
                template = this.replacePlaceholder(template, "TUNNEL-PROPS-HYDROPATHY", hydropathy);
                template = this.replacePlaceholder(template, "TUNNEL-PROPS-CHARGE", charge);
                template = this.replacePlaceholder(template, "TUNNEL-PROPS-POLARITY", polarity);
                template = this.replacePlaceholder(template, "TUNNEL-PROPS-MUTABILITY", mutability);
                template = this.replacePlaceholder(template, "TUNNEL-PROPS-LOGP", logP);
                template = this.replacePlaceholder(template, "TUNNEL-PROPS-LOGD", logD);
                template = this.replacePlaceholder(template, "TUNNEL-PROPS-LOGS", logS);
                template = this.replacePlaceholder(template, "TUNNEL-PROPS-IONIZABLE", ionizable);
                return template;
            };
            App.prototype.addLiningResidues = function (template, residueLines) {
                var rows = "";
                for (var i = 0; i < residueLines.length; i++) {
                    var resInfo = CommonUtils.Residues.parseResidues([residueLines[i].residue], true);
                    var name_3 = resInfo[0].name;
                    var seq = resInfo[0].authSeqNumber;
                    var chain = resInfo[0].chain.authAsymId;
                    var backbone = (resInfo[0].backbone) ? '<img class="report-ok-icon" src="/assets/images/accept.gif"/>' : '';
                    var annotation = residueLines[i].annotation;
                    if (annotation === null) {
                        rows += "<tr><td>" + name_3 + "</td><td>" + seq + "</td><td>" + chain + "</td><td>" + backbone + "</td><td></td></tr>";
                    }
                    else {
                        rows += "<tr><td>" + name_3 + "</td><td>" + seq + "</td><td>" + chain + "</td><td>" + backbone + "</td><td>" + annotation.text + " " + ((annotation.reference !== "") ? "(" + annotation.reference + ")" : "") + "</td></tr>";
                    }
                }
                return template.replace("[[LINING-RESIDUES-TABLE-ROWS]]", rows);
            };
            App.prototype.selectChannel = function (channel, allChannels) {
                var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                return new Promise(function (res, rej) {
                    try {
                        LiteMol.Example.Channels.State.showChannelVisuals(plugin, allChannels, false).then(function () {
                            MoleOnlineWebUI.Bridge.Events.invokeChannelSelect(channel.Id);
                            var waitToResolve = function () {
                                window.setTimeout(function () {
                                    if (CommonUtils.Selection.SelectionHelper.getSelectedChannelId() == channel.Id) {
                                        window.setTimeout(function () { res(); }, 100);
                                        return;
                                    }
                                    waitToResolve();
                                }, 20);
                            };
                            waitToResolve();
                        });
                    }
                    catch (err) {
                        rej(err);
                    }
                });
            };
            App.prototype.zipResiduesWithAnnotations = function (residues, annotations) {
                var result = [];
                for (var _i = 0, residues_11 = residues; _i < residues_11.length; _i++) {
                    var r = residues_11[_i];
                    if (annotations === null) {
                        result.push({ residue: r, annotation: null });
                        continue;
                    }
                    var info = CommonUtils.Residues.parseResidues([r], true);
                    var a = annotations.get(info[0].authSeqNumber + " " + info[0].chain.authAsymId);
                    if (a === void 0 || a === null || a.length === 0) {
                        result.push({ residue: r, annotation: null });
                        continue;
                    }
                    for (var _a = 0, a_1 = a; _a < a_1.length; _a++) {
                        var ca = a_1[_a];
                        result.push({ residue: r, annotation: ca });
                    }
                }
                return result;
            };
            App.prototype.generateChannelReport = function (channelData) {
                var _this = this;
                return new Promise(function (res, rej) {
                    var template = App.templateCache;
                    if (template === null) {
                        rej("No template!!!");
                        return;
                    }
                    var notNullTemplate = template.html.slice();
                    var templateInstance = notNullTemplate.slice();
                    var residues = CommonUtils.Residues.sort(channelData.Layers.ResidueFlow.slice(), void 0, true, true);
                    if (residues === void 0) {
                        return;
                    }
                    var name_ = CommonUtils.Tunnels.getName(channelData);
                    var chdb_annotations = MoleOnlineWebUI.Cache.ChannelsDBData.getChannelAnnotationsImmediate(channelData.Id);
                    var length = CommonUtils.Tunnels.getLength(channelData);
                    var tunnelName = channelData.Type + ", Length: " + length + " \u00C5";
                    if (chdb_annotations !== null && chdb_annotations.length > 0) {
                        tunnelName = chdb_annotations[0].name;
                    }
                    else if (name_ !== void 0) {
                        tunnelName = name_;
                    }
                    var residueAnnotations = MoleOnlineWebUI.Cache.ChannelsDBData.getResiduesAnnotationsImmediate();
                    var residuesPages = _this.zipResiduesWithAnnotations(residues, residueAnnotations);
                    var residuesList = [];
                    for (var _i = 0, residuesPages_1 = residuesPages; _i < residuesPages_1.length; _i++) {
                        var p = residuesPages_1[_i];
                        residuesList = residuesList.concat(p);
                    }
                    templateInstance = _this.addTunnelName(templateInstance, tunnelName);
                    templateInstance = _this.addPhysChemProps(templateInstance, channelData);
                    templateInstance = _this.addCurrentLMScreen(templateInstance);
                    templateInstance = _this.addCurrentLVZScreen(templateInstance);
                    templateInstance = _this.addLiningResidues(templateInstance, residuesList);
                    var state = _this.state;
                    var reportContent = "";
                    if (state.reportContent !== null) {
                        reportContent = state.reportContent;
                    }
                    reportContent += templateInstance;
                    state.reportContent = reportContent;
                    _this.setState(state);
                    res();
                });
            };
            App.prototype.generateChannelReportWrapper = function (channelData, allChannels) {
                var _this = this;
                return new Promise(function (res, rej) {
                    if (_this.state.data === null) {
                        rej("No data!");
                    }
                    var selectedChannelId = CommonUtils.Selection.SelectionHelper.getSelectedChannelId();
                    var canvas = $(".layer-vizualizer-canvas");
                    if (canvas.length === 0 || selectedChannelId !== channelData.Id) {
                        if (selectedChannelId !== channelData.Id) {
                            _this.selectChannel(channelData, allChannels).then(function () {
                                _this.generateChannelReportWrapper(channelData, allChannels)
                                    .then(function () {
                                    res();
                                })
                                    .catch(function (err) {
                                    rej(err);
                                    console.log(err);
                                });
                            });
                        }
                        else {
                            var waitForCanvas_1 = function (timeout) {
                                var canvas = $(".layer-vizualizer-canvas");
                                if (canvas.length === 0) {
                                    window.setTimeout(function () { return waitForCanvas_1((timeout === void 0) ? 20 : timeout + 10); }, (timeout === void 0) ? 20 : timeout);
                                }
                                else {
                                    _this.generateChannelReport(channelData)
                                        .then(function () { return res(); }).catch(function (err) {
                                        rej(err);
                                        console.log(err);
                                    });
                                    res();
                                }
                            };
                            waitForCanvas_1();
                        }
                    }
                    else {
                        _this.generateChannelReport(channelData).then(function () { return res(); }).catch(function (err) {
                            rej(err);
                            console.log(err);
                        });
                    }
                });
            };
            App.prototype.replacePlaceholder = function (template, placeholder, value) {
                var regexp = new RegExp("\\[\\[" + placeholder + "\\]\\]", "g");
                return template.replace(regexp, (value === null) ? "" : value);
            };
            App.prototype.addParamsPageCommon = function (template, urlParams, compInfo) {
                var emptyPlaceholders = [];
                if (urlParams !== null) {
                    template = this.replacePlaceholder(template, "COMP-ID", urlParams.computationId);
                    template = this.replacePlaceholder(template, "SUBMIT-ID", String(urlParams.submitId));
                }
                else {
                    emptyPlaceholders.push("COMP-ID");
                    emptyPlaceholders.push("SUBMIT-ID");
                }
                template = this.replacePlaceholder(template, "URL", Common.Util.Router.getCurrentUrl());
                var isUserStructure = compInfo.PdbId === void 0 || compInfo.PdbId === null || compInfo.PdbId === "";
                template = this.replacePlaceholder(template, "PDBID", (isUserStructure) ? "User structure" : compInfo.PdbId);
                template = this.replacePlaceholder(template, "ASSEMBLY-ID", (isUserStructure) ? "User structure" : ((compInfo.AssemblyId !== null) ? compInfo.AssemblyId : "Asymmetric unit"));
                template = this.replaceEmptyPlaceholders(template, emptyPlaceholders);
                return template;
            };
            //Replace all not filled placeholders with empty strings
            App.prototype.replaceEmptyPlaceholders = function (template, placeholders) {
                for (var _i = 0, placeholders_1 = placeholders; _i < placeholders_1.length; _i++) {
                    var emptyPlaceholder = placeholders_1[_i];
                    template = this.replacePlaceholder(template, emptyPlaceholder, "");
                }
                return template;
            };
            App.prototype.addParamsPageMole = function (template, params) {
                template = this.replacePlaceholder(template, "MOLE-PARAMS-VISIBLE", "visible");
                var emptyPlaceholders = [];
                var input = params.Input;
                var cavity = params.Cavity;
                var exits = params.CustomExits;
                var nonactiveResidues = params.NonActiveResidues;
                var origin = params.Origin;
                var tunnel = params.Tunnel;
                if (input !== void 0) {
                    template = this.replacePlaceholder(template, "READ-ALL-MODELS", (input.ReadAllModels) ? "Yes" : "No");
                    template = this.replacePlaceholder(template, "SPECIFIC-CHAINS", input.SpecificChains);
                }
                else {
                    emptyPlaceholders.push("READ-ALL-MODELS");
                    emptyPlaceholders.push("SPECIFIC-CHAINS");
                }
                if (cavity !== void 0) {
                    template = this.replacePlaceholder(template, "IGNORE-HYDROGENS", (cavity.IgnoreHydrogens) ? "Yes" : "No");
                    template = this.replacePlaceholder(template, "IGNORE-HETATMS", (cavity.IgnoreHETAtoms) ? "Yes" : "No");
                    template = this.replacePlaceholder(template, "INTERIOR-TRESHOLD", String(cavity.InteriorThreshold));
                    template = this.replacePlaceholder(template, "PROBE-RADIUS", String(cavity.ProbeRadius));
                }
                else {
                    emptyPlaceholders.push("IGNORE-HYDROGENS");
                    emptyPlaceholders.push("IGNORE-HETATMS");
                    emptyPlaceholders.push("INTERIOR-TRESHOLD");
                    emptyPlaceholders.push("PROBE-RADIUS");
                }
                if (origin !== void 0 && origin !== null) {
                    var points = origin.Points;
                    if (points !== null) {
                        template = this.replacePlaceholder(template, "STARTING-POINT-XYZ", CommonUtils.Misc.pointsToString(points));
                    }
                    else {
                        emptyPlaceholders.push("STARTING-POINT-XYZ");
                    }
                    var residues = origin.Residues;
                    if (residues !== null) {
                        template = this.replacePlaceholder(template, "STARTING-POINT", CommonUtils.Misc.flattenResiduesArray(residues));
                    }
                    else {
                        emptyPlaceholders.push("STARTING-POINT");
                    }
                    if (origin.QueryExpression !== null) {
                        template = this.replacePlaceholder(template, "QUERY-FILTER", origin.QueryExpression);
                    }
                    else {
                        emptyPlaceholders.push("QUERY-FILTER");
                    }
                }
                else {
                    emptyPlaceholders.push("STARTING-POINT-XYZ");
                    emptyPlaceholders.push("STARTING-POINT");
                    emptyPlaceholders.push("QUERY-FILTER");
                }
                if (exits !== void 0 && exits !== null) {
                    var points = exits.Points;
                    if (points !== null) {
                        template = this.replacePlaceholder(template, "END-POINT-XYZ", CommonUtils.Misc.pointsToString(points));
                    }
                    else {
                        emptyPlaceholders.push("END-POINT-XYZ");
                    }
                    var residues = exits.Residues;
                    if (residues !== null) {
                        template = this.replacePlaceholder(template, "END-POINT", CommonUtils.Misc.flattenResiduesArray(residues));
                    }
                    else {
                        emptyPlaceholders.push("END-POINT");
                    }
                    if (exits.QueryExpression !== null) {
                        template = this.replacePlaceholder(template, "QUERY", exits.QueryExpression);
                    }
                    else {
                        emptyPlaceholders.push("QUERY");
                    }
                }
                else {
                    emptyPlaceholders.push("END-POINT-XYZ");
                    emptyPlaceholders.push("END-POINT");
                    emptyPlaceholders.push("QUERY");
                }
                if (nonactiveResidues !== void 0 && nonactiveResidues !== null) {
                    template = this.replacePlaceholder(template, "IGNORED-RESIDUES", CommonUtils.Misc.flattenResidues(nonactiveResidues));
                }
                else {
                    emptyPlaceholders.push("IGNORED-RESIDUES");
                }
                if (tunnel !== void 0 && tunnel !== null) {
                    template = this.replacePlaceholder(template, "BOTTLENECK-RADIUS", String(tunnel.BottleneckRadius));
                    template = this.replacePlaceholder(template, "BOTTLENECK-TOLERANCE", String(tunnel.BottleneckTolerance));
                    template = this.replacePlaceholder(template, "MAX-TUNNEL-SIMILARITY", String(tunnel.MaxTunnelSimilarity));
                    template = this.replacePlaceholder(template, "ORIGIN-RADIUS", String(tunnel.OriginRadius));
                    template = this.replacePlaceholder(template, "SURFACE-COVER-RADIUS", String(tunnel.SurfaceCoverRadius));
                    template = this.replacePlaceholder(template, "WEIGHT-FUNCTION", String(tunnel.WeightFunction));
                }
                else {
                    emptyPlaceholders.push("BOTTLENECK-RADIUS");
                    emptyPlaceholders.push("BOTTLENECK-TOLERANCE");
                    emptyPlaceholders.push("MAX-TUNNEL-SIMILARITY");
                    emptyPlaceholders.push("ORIGIN-RADIUS");
                    emptyPlaceholders.push("SURFACE-COVER-RADIUS");
                    emptyPlaceholders.push("WEIGHT-FUNCTION");
                }
                if (params.PoresAuto !== void 0) {
                    template = this.replacePlaceholder(template, "AUTOMATIC-PORES", (params.PoresAuto) ? "Yes" : "No");
                }
                else {
                    emptyPlaceholders.push("AUTOMATIC-PORES");
                }
                if (params.PoresMerged !== void 0) {
                    template = this.replacePlaceholder(template, "MERGE-PORES", (params.PoresMerged) ? "Yes" : "No");
                }
                else {
                    emptyPlaceholders.push("MERGE-PORES");
                }
                template = this.replaceEmptyPlaceholders(template, emptyPlaceholders);
                return template;
            };
            App.prototype.addParamsPagePores = function (template, params) {
                template = this.replacePlaceholder(template, "PORES-PARAMS-VISIBLE", "visible");
                template = this.replacePlaceholder(template, "BETA-STRUCTURE", (params.IsBetaBarel) ? "Yes" : "No");
                template = this.replacePlaceholder(template, "MEMBRANE-REGION", (params.IsBetaBarel) ? "Yes" : "No");
                template = this.replacePlaceholder(template, "SPECIFIC-CHAINS", params.Chains);
                return template;
            };
            App.prototype.generateReport = function () {
                var _this = this;
                var urlParams = Common.Util.Router.getParameters();
                if (urlParams === null) {
                    console.log("URL parameters cannot be parsed!");
                    return;
                }
                var state = this.state;
                state.inProgress = true;
                this.setState(state);
                var channelsDBMode = Common.Util.Router.isInChannelsDBMode();
                var configParamsPromise;
                if (channelsDBMode) {
                    configParamsPromise = Promise.resolve(null);
                }
                else {
                    configParamsPromise = new Promise(function (res, rej) {
                        if (urlParams === null) {
                            rej("URL parameters cannot be parsed");
                            return;
                        }
                        MoleOnlineWebUI.DataProxy.ComputationInfo.DataProvider.get(urlParams.computationId, function (compId, info) {
                            if (urlParams === null) {
                                rej("URL parameters cannot be parsed");
                            }
                            else {
                                if (compId === urlParams.computationId) {
                                    for (var _i = 0, _a = info.Submissions; _i < _a.length; _i++) {
                                        var s = _a[_i];
                                        if (String(s.SubmitId) === String(urlParams.submitId)) {
                                            res({ submission: s, compInfo: info });
                                            return;
                                        }
                                    }
                                    rej("Submission data not available!");
                                }
                            }
                        });
                    });
                }
                configParamsPromise.then(function (val) {
                    var originalVisibleChannels = MoleOnlineWebUI.Cache.LastVisibleChannels.get();
                    MoleOnlineWebUI.Service.Templates.Service.getPDFReportTemplateData().then(function (template) {
                        App.templateCache = template;
                        if (_this.state.data === null) {
                            console.log("genereateReport has no data!");
                            return;
                        }
                        var data = _this.state.data.Channels;
                        var channels = [];
                        //-- MoleOnline
                        if (data.MergedPores && data.MergedPores.length > 0) {
                            channels = data.MergedPores;
                        }
                        if (data.Paths && data.Paths.length > 0) {
                            channels = data.Paths;
                        }
                        if (data.Pores && data.Pores.length > 0) {
                            channels = data.Pores;
                        }
                        if (data.Tunnels && data.Tunnels.length > 0) {
                            channels = data.Tunnels;
                        }
                        //-- ChannelsDB
                        if (data.ReviewedChannels && data.ReviewedChannels.length > 0) {
                            channels = data.ReviewedChannels;
                        }
                        if (data.CSATunnels && data.CSATunnels.length > 0) {
                            channels = data.CSATunnels;
                        }
                        if (data.TransmembranePores && data.TransmembranePores.length > 0) {
                            channels = data.TransmembranePores;
                        }
                        if (data.ReviewedChannels && data.ReviewedChannels.length > 0) {
                            channels = data.ReviewedChannels;
                        }
                        var reportContent = "";
                        if (!channelsDBMode && val !== null) {
                            var modeMole = CommonUtils.Misc.isMoleJob(val.submission);
                            var paramsPageTemplate = template.paramsPageHtml.slice();
                            paramsPageTemplate = _this.addParamsPageCommon(paramsPageTemplate, urlParams, val.compInfo);
                            if (modeMole) {
                                paramsPageTemplate = _this.addParamsPageMole(paramsPageTemplate, val.submission.MoleConfig);
                            }
                            else {
                                paramsPageTemplate = _this.addParamsPagePores(paramsPageTemplate, val.submission.PoresConfig);
                            }
                            reportContent += paramsPageTemplate;
                        }
                        var state = _this.state;
                        state.reportContent = reportContent;
                        _this.setState(state);
                        var split = function (tunnels) {
                            if (tunnels.length === 0) {
                                return {
                                    current: null,
                                    remaining: []
                                };
                            }
                            return {
                                current: tunnels[0],
                                remaining: tunnels.slice(1)
                            };
                        };
                        var generate = function (tunnels) {
                            var d = split(tunnels);
                            if (d.current === null) {
                                if (Config.CommonOptions.DEBUG_MODE)
                                    console.log("Saving file...");
                                if (_this.state.reportContent !== null && App.templateCache !== null) {
                                    var css = '<style>' + App.templateCache.css + "</style>";
                                    var reportWrapperId_1 = "report-wrapper";
                                    var jsConstants = "<script>var report_idToRemoveAfterPrint = '" + reportWrapperId_1 + "';</script>";
                                    var toPrint = "<div id='" + reportWrapperId_1 + "'>" + css + _this.state.reportContent + '</div>';
                                    var toPrintHtml = $(toPrint)[0];
                                    $(document.body.children).addClass("no-print");
                                    document.body.appendChild(toPrintHtml);
                                    var originalTitle_1 = document.title;
                                    if (urlParams !== null) {
                                        document.title = "MoleOnline - " + urlParams.computationId + "/" + urlParams.submitId;
                                    }
                                    window.setTimeout(function () {
                                        var afterPrint = (function () {
                                            var reportWrapper = $('#' + reportWrapperId_1)[0];
                                            if (reportWrapper !== void 0 && reportWrapper !== null) {
                                                document.body.removeChild(reportWrapper);
                                            }
                                            $(document.body.children).removeClass("no-print");
                                            //$(".pdf-report-generator").removeClass("in-progress");
                                            var state = _this.state;
                                            state.progress = 0;
                                            state.inProgress = false;
                                            _this.setState(state);
                                            document.title = originalTitle_1;
                                        }).bind(_this);
                                        if (window.matchMedia) {
                                            var mediaQueryList = window.matchMedia('print');
                                            mediaQueryList.addListener(function (mql) {
                                                if (!mql.matches) {
                                                    afterPrint();
                                                }
                                            });
                                        }
                                        window.onafterprint = afterPrint;
                                        var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                                        LiteMol.Example.Channels.State.showChannelVisuals(plugin, channels, false).then(function () {
                                            LiteMol.Example.Channels.State.showChannelVisuals(plugin, originalVisibleChannels, true).then(function () {
                                                CommonUtils.Selection.SelectionHelper.resetScene(plugin);
                                                CommonUtils.Selection.SelectionHelper.clearSelection(plugin);
                                                CommonUtils.Selection.SelectionHelper.forceInvokeOnChannelDeselectHandlers();
                                                window.print();
                                            });
                                        });
                                    });
                                }
                                return;
                            }
                            _this.generateChannelReportWrapper(d.current, channels).then(function (res) {
                                var tunnelId = (d.current === null) ? "<Err>" : d.current.Id;
                                if (Config.CommonOptions.DEBUG_MODE) {
                                    console.log("Current tunnel: " + tunnelId);
                                    console.log(d.remaining.length + " tunnels remaining of " + channels.length);
                                }
                                var s = _this.state;
                                s.progress = Math.floor(((channels.length - d.remaining.length) / channels.length) * 100);
                                _this.setState(s);
                                generate(d.remaining);
                            })
                                .catch(function (err) {
                                _this.afterError(err);
                            });
                        };
                        generate(channels);
                    }).catch(function (err) {
                        _this.afterError(err);
                    });
                })
                    .catch(function (err) {
                    _this.afterError(err);
                });
            };
            App.prototype.afterError = function (err) {
                $(document.body.children).removeClass("no-print");
                $("#download-report .dropdown").removeClass("open-programaticaly");
                var state = this.state;
                state.progress = 0;
                state.inProgress = false;
                this.setState(state);
                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                    messageType: "Danger",
                    message: "PDF Report generation aborted. Reason: " + err
                });
            };
            App.prototype.render = function () {
                if (this.state.inProgress) {
                    var progress = this.state.progress;
                    return React.createElement("li", null,
                        React.createElement("div", { className: "pdf-report-inprogress-overlay" },
                            React.createElement("img", { src: "/assets/images/ajax-loader.gif" }),
                            React.createElement("div", { className: "pdf-report-inprogress-progress" },
                                "Generating PDF report (",
                                progress,
                                "%)...")));
                }
                return (React.createElement("div", null));
            };
            return App;
        }(React.Component));
        App.templateCache = null;
    })(UI = PDFReportGenerator.UI || (PDFReportGenerator.UI = {}));
})(PDFReportGenerator || (PDFReportGenerator = {}));
var Controls;
(function (Controls) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        var ReactDOM = LiteMol.Plugin.ReactDOM;
        var Provider = MoleOnlineWebUI.DataProxy.ComputationInfo.DataProvider;
        var Service = MoleOnlineWebUI.Service.MoleAPI;
        var TooltipText = MoleOnlineWebUI.StaticData.TooltipText;
        var validationGroup = "SettingsFormValidatonGroup";
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
                    app: _this
                };
                return _this;
            }
            App.prototype.componentDidMount = function () {
                var _this = this;
                MoleOnlineWebUI.Bridge.Events.subscribeNewSubmit(function () {
                    _this.forceUpdate();
                });
            };
            App.prototype.componentWillUnmount = function () {
            };
            App.prototype.render = function () {
                return (React.createElement(ControlTabs, null));
            };
            return App;
        }(React.Component));
        UI.App = App;
        function onFocusReplaceDefaultValidationPopup(e, elemId) {
            var el = e.currentTarget;
            if (el.dataset["hasReplacedValidationPopup"] !== "true") {
                replaceDefaultValidationPopup(elemId);
                el.dataset["hasReplacedValidationPopup"] = "true";
            }
        }
        ;
        function replaceDefaultValidationPopup(id) {
            $("#" + id)[0]
                .addEventListener("invalid", function (event) {
                $(event.target).data("toggle", "popover");
                $(event.target).data("trigger", "manual");
                $(event.target).data("placement", "left");
                //$(event.target).data("container","body");
                $(event.target).data("content", event.target.validationMessage);
                $(event.target).popover("show");
                window.setTimeout(function () {
                    $(event.target).popover("hide");
                    $(event.target).popover("destroy");
                }, 5000);
                $(event.target).focus();
                event.preventDefault();
            });
        }
        function createCustomValidationPopup(el, message) {
            $(el)[0].validationMessage = message;
            $(el).data("toggle", "popover");
            $(el).data("trigger", "manual");
            $(el).data("placement", "left");
            //$(el).data("container","body");
            $(el).data("content", message);
            $(el).popover("show");
            window.setTimeout(function () {
                $(el).popover("hide");
                $(el).popover("destroy");
            }, 5000);
            $(el).focus();
        }
        ;
        var Settings = (function (_super) {
            __extends(Settings, _super);
            function Settings() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    moleFormData: _this.getMoleDefaultValues(),
                    poresFormData: _this.getPoresDefaultValues(),
                    pdbid: _this.props.initialData.PdbId,
                    computationId: _this.props.initialData.ComputationId,
                    mode: "Channels",
                    expandedPanels: {
                        activeAtomsResidues: true,
                        activeAtomsResiduesAdvanced: false,
                        cavityParameters: false,
                        channelParameters: false,
                        channelParametersAdvanced: false,
                        selection: true
                    }
                };
                return _this;
            }
            Settings.prototype.getMoleDefaultValues = function () {
                var data = new UI.MoleFormData();
                data.setIgnoreHETATMs(true);
                data.setIgnoreHydrogens(false);
                //data.setQueryFilter("");
                data.setReadAllModels(false);
                //data.setIgnoredResidues([]);
                //data.setSpecificChains("");
                data.setProbeRadius(5);
                data.setInteriorThreshold(1.1);
                data.setOriginRadius(5);
                data.setSurfaceCoverRadius(10);
                data.setWeightFunction("VoronoiScale");
                data.setMergePores(false);
                data.setAutomaticPores(false);
                data.setBottleneckRadius(1.2);
                data.setBottleneckTolerance(3);
                data.setMaxTunnelSimilarity(0.7);
                return data;
            };
            Settings.prototype.getPoresDefaultValues = function () {
                var data = new UI.PoresFormData();
                data.setBetaStructure(false);
                data.setMembraneRegion(false);
                //data.setSpecificChains("");
                data.setProbeRadius(13);
                data.setInteriorThreshold(0.8);
                return data;
            };
            Settings.prototype.handleSubmitPromise = function (promise) {
                var _this = this;
                promise
                    .then(function (result) {
                    if (result.Status === "Error") {
                        var state = _this.props.parent.state;
                        state.canSubmit = true;
                        _this.props.parent.setState(state);
                        MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                            messageType: "Danger",
                            message: result.ErrorMsg
                        });
                    }
                    else {
                        Common.Util.Router.fakeRedirect(result.ComputationId, String(result.SubmitId));
                        LiteMol.Example.Channels.State.removeChannelsData(MoleOnlineWebUI.Bridge.Instances.getPlugin());
                        Provider.get(result.ComputationId, (function (compId, info) {
                            MoleOnlineWebUI.DataProxy.JobStatus.Watcher.registerOnChangeHandler(result.ComputationId, result.SubmitId, function (status) {
                                if (checkCanSubmit(status.Status)) {
                                    MoleOnlineWebUI.Bridge.Events.invokeToggleLoadingScreen({
                                        message: "",
                                        visible: false
                                    });
                                    var state_1 = _this.props.parent.state;
                                    state_1.canSubmit = true;
                                    _this.props.parent.setState(state_1);
                                }
                            }, function (err) {
                                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                    messageType: "Danger",
                                    message: "Job status cannot be tracked. Please try to refresh the page."
                                });
                            });
                            var state = _this.props.parent.state;
                            state.data = info;
                            _this.props.parent.setState(state);
                            MoleOnlineWebUI.Bridge.Events.invokeNewSubmit();
                            MoleOnlineWebUI.Bridge.Events.invokeChangeSubmitId(Number(result.SubmitId));
                        }).bind(_this), true);
                        MoleOnlineWebUI.Bridge.Events.invokeToggleLoadingScreen({
                            message: "Submited job in progress...",
                            visible: true
                        });
                    }
                })
                    .catch(function (err) {
                    var state = _this.props.parent.state;
                    state.canSubmit = true;
                    _this.props.parent.setState(state);
                    if (Config.CommonOptions.DEBUG_MODE)
                        console.log(err);
                    MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                        messageType: "Danger",
                        message: "Job submit was not completed succesfully! Please try again later."
                    });
                });
            };
            Settings.prototype.componentDidMount = function () {
                var _this = this;
                CommonUtils.FormEvents.Events.attachOnSubmitEventHandler(function (formGroup) {
                    if (formGroup !== validationGroup) {
                        return;
                    }
                    var promise;
                    if (_this.state.mode === "Channels") {
                        gtag('event', 'Submit', { 'event_category': 'MOLE' });
                        promise = Service.ApiService.submitMoleJob(_this.state.computationId, _this.state.moleFormData.getPackage());
                    }
                    else {
                        gtag('event', 'Submit', { 'event_category': 'Pores' });
                        promise = Service.ApiService.submitPoresJob(_this.state.computationId, _this.state.poresFormData.getPackage());
                    }
                    _this.handleSubmitPromise(promise);
                });
                MoleOnlineWebUI.Bridge.Events.subscribeOnReSubmit(function (promise) {
                    _this.handleSubmitPromise(promise);
                });
                CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                    if (formGroup !== validationGroup + "_form") {
                        return;
                    }
                    Common.Controls.FromLiteMol.ValidationState.reset(validationGroup);
                    var s = _this.state;
                    var mode = s.mode;
                    s.mode = (_this.state.mode === "Channels") ? "Pores" : "Channels"; //setting mode to oposite to trigger update
                    s.moleFormData = _this.getMoleDefaultValues();
                    s.poresFormData = _this.getPoresDefaultValues();
                    _this.setState(s, function () {
                        CommonUtils.FormEvents.Events.invokeOnClear(validationGroup);
                        var s2 = _this.state;
                        s2.mode = mode; //setting back correct mode
                        _this.setState(s2);
                    });
                });
                MoleOnlineWebUI.Bridge.Events.subscribeCopyParameters(function (params) {
                    var s1 = _this.props.parent.state;
                    _this.props.parent.setState({
                        activeTabIdx: 0,
                        submitId: s1.submitId,
                        canSubmit: s1.canSubmit,
                        data: s1.data,
                        err: s1.err
                    }, function () {
                        _this.setState({
                            computationId: _this.state.computationId,
                            pdbid: _this.state.pdbid,
                            moleFormData: _this.state.moleFormData,
                            poresFormData: _this.state.poresFormData,
                            mode: (params.mode === "mole") ? "Pores" : "Channels",
                            expandedPanels: _this.state.expandedPanels
                        }, function () {
                            _this.setState({
                                computationId: _this.state.computationId,
                                pdbid: _this.state.pdbid,
                                moleFormData: (params.mode === "mole" && params.moleConfig !== null) ? new UI.MoleFormData(params.moleConfig) : _this.getMoleDefaultValues(),
                                poresFormData: (params.mode === "pores" && params.poresConfig !== null) ? new UI.PoresFormData(params.poresConfig) : _this.getPoresDefaultValues(),
                                mode: (params.mode === "mole") ? "Channels" : "Pores",
                                expandedPanels: _this.state.expandedPanels
                            });
                        });
                    });
                });
            };
            Settings.prototype.render = function () {
                var _this = this;
                var form = React.createElement("div", null);
                if (this.state.mode === "Channels") {
                    form = this.getMoleForm();
                }
                else if (this.state.mode === "Pores") {
                    form = this.getPoresForm();
                }
                return (React.createElement("div", null,
                    React.createElement("div", { className: "mode-switch-button-container" },
                        React.createElement("span", { className: "btn-sm btn-primary mode-switch", onClick: function (e) {
                                var state = _this.state;
                                state.mode = (_this.state.mode === "Channels") ? "Pores" : "Channels";
                                _this.setState(state);
                            } },
                            "Switch to ",
                            (this.state.mode === "Channels") ? "Pore" : "Channels",
                            " mode")),
                    form));
            };
            Settings.prototype.getPatternQueryHint = function () {
                return { link: "https://webchem.ncbr.muni.cz/Wiki/PatternQuery:UserManual", title: "See PatternQuery manual for help." };
            };
            Settings.prototype.getMoleForm = function () {
                var _this = this;
                if (this.state.moleFormData === null) {
                    return React.createElement("div", null);
                }
                var pdbid = this.state.pdbid;
                var data = this.state.moleFormData;
                return React.createElement("div", { className: "settings-form basic-settings" },
                    React.createElement("h3", null, "Channels"),
                    React.createElement(Common.Controls.FromLiteMol.LMControlWrapper, { controls: [
                            React.createElement(Common.Controls.FromLiteMol.ControlGroup, { label: "Active Atoms/Residues", tooltip: "", controls: [
                                    React.createElement(Common.Controls.FromLiteMol.CheckBox, { label: "Ignore HETATMs", defaultValue: valueOrDefault(data.getIgnoreHETATMs(), true), tooltip: TooltipText.get("ignoreAllHetatm"), onChange: function (v) {
                                            var s = _this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setIgnoreHETATMs(v);
                                            }
                                        }, onMount: function (control) {
                                            (function () {
                                                CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                                    if (formGroup !== validationGroup) {
                                                        return;
                                                    }
                                                    control.reset();
                                                });
                                            }).bind(control)();
                                        } }),
                                    React.createElement(Common.Controls.FromLiteMol.ControlGroup, { label: "Advanced options", tooltip: "", controls: [
                                            React.createElement(Common.Controls.FromLiteMol.CheckBox, { label: "Ignore Hydrogens", defaultValue: valueOrDefault(data.getIgnoreHydrogens(), false), tooltip: TooltipText.get("ignoreHydrogens"), onChange: function (v) {
                                                    var s = _this.state;
                                                    if (s.moleFormData !== null) {
                                                        s.moleFormData.setIgnoreHydrogens(v);
                                                    }
                                                }, onMount: function (control) {
                                                    (function () {
                                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                                            if (formGroup !== validationGroup) {
                                                                return;
                                                            }
                                                            control.reset();
                                                        });
                                                    }).bind(control)();
                                                } }),
                                            React.createElement(Common.Controls.FromLiteMol.TextBoxWithHelp, { label: "Query Filter", tooltip: TooltipText.get("queryFilter"), placeholder: "Residues('GOL')", hint: this.getPatternQueryHint(), defaultValue: valueOrDefault(data.getQueryFilter(), ""), onChange: function (v) {
                                                    var s = _this.state;
                                                    if (s.moleFormData !== null) {
                                                        s.moleFormData.setQueryFilter(v);
                                                    }
                                                }, onMount: function (control) {
                                                    (function () {
                                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                                            if (formGroup !== validationGroup) {
                                                                return;
                                                            }
                                                            control.reset();
                                                        });
                                                    }).bind(control)();
                                                }, validate: CommonUtils.Validators.validatePatternQuery, validationGroup: validationGroup }),
                                            React.createElement(Common.Controls.FromLiteMol.CheckBox, { label: "Read All Models", defaultValue: valueOrDefault(data.getReadAllModels(), false), tooltip: TooltipText.get("readAllModels"), onChange: function (v) {
                                                    var s = _this.state;
                                                    if (s.moleFormData !== null) {
                                                        s.moleFormData.setReadAllModels(v);
                                                    }
                                                }, onMount: function (control) {
                                                    (function () {
                                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                                            if (formGroup !== validationGroup) {
                                                                return;
                                                            }
                                                            control.reset();
                                                        });
                                                    }).bind(control)();
                                                } }),
                                            React.createElement(Common.Controls.FromLiteMol.TextBox, { label: "Ignored Residues", tooltip: TooltipText.get("nonActiveResidues"), placeholder: "A 69, A 386, ...", defaultValue: CommonUtils.Misc.flattenResidues(valueOrDefault(data.getIgnoredResidues(), "")), onChange: function (v) {
                                                    var s = _this.state;
                                                    if (s.moleFormData !== null) {
                                                        s.moleFormData.setIgnoredResidues(CommonUtils.Misc.parseResidues(v));
                                                    }
                                                }, onMount: function (control) {
                                                    (function () {
                                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                                            if (formGroup !== validationGroup) {
                                                                return;
                                                            }
                                                            control.reset();
                                                        });
                                                    }).bind(control)();
                                                }, validate: CommonUtils.Validators.validateResidueSimpleArray, validationGroup: validationGroup }),
                                            React.createElement(Common.Controls.FromLiteMol.TextBox, { label: "Specific Chains", tooltip: TooltipText.get("specificChains"), placeholder: "A, B, ...", defaultValue: valueOrDefault(data.getSpecificChains(), ""), onChange: function (v) {
                                                    var s = _this.state;
                                                    if (s.moleFormData !== null) {
                                                        s.moleFormData.setSpecificChains(v);
                                                    }
                                                }, onMount: function (control) {
                                                    (function () {
                                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                                            if (formGroup !== validationGroup) {
                                                                return;
                                                            }
                                                            control.reset();
                                                        });
                                                    }).bind(control)();
                                                }, validate: CommonUtils.Validators.validateChainsArray, validationGroup: validationGroup })
                                        ], expanded: this.state.expandedPanels.activeAtomsResiduesAdvanced, onChange: function (e) {
                                            var s = _this.state;
                                            s.expandedPanels.activeAtomsResiduesAdvanced = e;
                                            _this.setState(s);
                                        } }),
                                ], expanded: this.state.expandedPanels.activeAtomsResidues, onChange: function (e) {
                                    var s = _this.state;
                                    s.expandedPanels.activeAtomsResidues = e;
                                    if (e === false) {
                                        s.expandedPanels.activeAtomsResiduesAdvanced = false;
                                    }
                                    _this.setState(s);
                                } }),
                            React.createElement(Common.Controls.FromLiteMol.ControlGroup, { label: "Cavity Parameters", tooltip: "", controls: [
                                    React.createElement(Common.Controls.FromLiteMol.NumberBox, { label: "Probe Radius", tooltip: TooltipText.get("probeRadius"), min: 1.4, max: 45, defaultValue: valueOrDefault(data.getProbeRadius(), 5), step: 0.01, onChange: function (v) {
                                            var s = _this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setProbeRadius(Number(v).valueOf());
                                            }
                                        }, onMount: function (control) {
                                            (function () {
                                                CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                                    if (formGroup !== validationGroup) {
                                                        return;
                                                    }
                                                    control.reset();
                                                });
                                            }).bind(control)();
                                        } }),
                                    React.createElement(Common.Controls.FromLiteMol.NumberBox, { label: "Interior Treshold", tooltip: TooltipText.get("interiorTreshold"), min: 0.3, max: 3, defaultValue: valueOrDefault(data.getInteriorThreshold(), 1.1), step: 0.01, onChange: function (v) {
                                            var s = _this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setInteriorThreshold(Number(v).valueOf());
                                            }
                                        }, onMount: function (control) {
                                            (function () {
                                                CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                                    if (formGroup !== validationGroup) {
                                                        return;
                                                    }
                                                    control.reset();
                                                });
                                            }).bind(control)();
                                        } })
                                ], expanded: this.state.expandedPanels.cavityParameters, onChange: function (e) {
                                    var s = _this.state;
                                    s.expandedPanels.cavityParameters = e;
                                    _this.setState(s);
                                } }),
                            React.createElement(Common.Controls.FromLiteMol.ControlGroup, { label: "Channel Parameters", tooltip: "", controls: [
                                    React.createElement(Common.Controls.FromLiteMol.NumberBox, { label: "Origin Radius", tooltip: TooltipText.get("originRadius"), min: 0.1, max: 10, defaultValue: valueOrDefault(data.getOriginRadius(), 5), step: 0.05, onChange: function (v) {
                                            var s = _this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setOriginRadius(Number(v).valueOf());
                                            }
                                        }, onMount: function (control) {
                                            (function () {
                                                CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                                    if (formGroup !== validationGroup) {
                                                        return;
                                                    }
                                                    control.reset();
                                                });
                                            }).bind(control)();
                                        } }),
                                    React.createElement(Common.Controls.FromLiteMol.NumberBox, { label: "Surface Cover Radius", tooltip: TooltipText.get("surfaceCoverRadius"), min: 5, max: 20, defaultValue: valueOrDefault(data.getSurfaceCoverRadius(), 10), step: 0.5, onChange: function (v) {
                                            var s = _this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setSurfaceCoverRadius(Number(v).valueOf());
                                            }
                                        }, onMount: function (control) {
                                            (function () {
                                                CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                                    if (formGroup !== validationGroup) {
                                                        return;
                                                    }
                                                    control.reset();
                                                });
                                            }).bind(control)();
                                        } }),
                                    React.createElement(Common.Controls.FromLiteMol.ComboBox, { label: "Weight Function", tooltip: TooltipText.get("tunnelWeightFunction"), items: MoleOnlineWebUI.StaticData.WeightFunctions.get().map(function (val, idx, arr) { return new Common.Controls.FromLiteMol.ComboBoxItem(val.value, val.label); }), selectedValue: valueOrDefault(data.getWeightFunction(), "VoronoiScale"), onChange: function (v) {
                                            var s = _this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setWeightFunction(v);
                                            }
                                        }, onMount: function (control) {
                                            (function () {
                                                CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                                    if (formGroup !== validationGroup) {
                                                        return;
                                                    }
                                                    control.reset();
                                                });
                                            }).bind(control)();
                                        } }),
                                    React.createElement(Common.Controls.FromLiteMol.CheckBox, { label: "Merge Pores", defaultValue: valueOrDefault(data.getMergePores(), false), tooltip: TooltipText.get("mergePores"), onChange: function (v) {
                                            var s = _this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setMergePores(v);
                                            }
                                        }, onMount: function (control) {
                                            (function () {
                                                CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                                    if (formGroup !== validationGroup) {
                                                        return;
                                                    }
                                                    control.reset();
                                                });
                                            }).bind(control)();
                                        } }),
                                    React.createElement(Common.Controls.FromLiteMol.CheckBox, { label: "Automatic Pores", defaultValue: valueOrDefault(data.getAutomaticPores(), false), tooltip: TooltipText.get("automaticPores"), onChange: function (v) {
                                            var s = _this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setAutomaticPores(v);
                                            }
                                        }, onMount: function (control) {
                                            (function () {
                                                CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                                    if (formGroup !== validationGroup) {
                                                        return;
                                                    }
                                                    control.reset();
                                                });
                                            }).bind(control)();
                                        } }),
                                    React.createElement(Common.Controls.FromLiteMol.ControlGroup, { label: "Advanced options", tooltip: "", controls: [
                                            React.createElement(Common.Controls.FromLiteMol.NumberBox, { label: "Bottleneck Radius", tooltip: TooltipText.get("bottleneckRadius"), min: 0, max: 5, defaultValue: valueOrDefault(data.getBottleneckRadius(), 1.2), step: 0.01, onChange: function (v) {
                                                    var s = _this.state;
                                                    if (s.moleFormData !== null) {
                                                        s.moleFormData.setBottleneckRadius(Number(v).valueOf());
                                                    }
                                                }, onMount: function (control) {
                                                    (function () {
                                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                                            if (formGroup !== validationGroup) {
                                                                return;
                                                            }
                                                            control.reset();
                                                        });
                                                    }).bind(control)();
                                                } }),
                                            React.createElement(Common.Controls.FromLiteMol.NumberBox, { label: "Bottleneck Tolerance", tooltip: TooltipText.get("bottleneckTolerance"), min: 0, max: 5, defaultValue: valueOrDefault(data.getBottleneckTollerance(), 3.0), step: 0.1, onChange: function (v) {
                                                    var s = _this.state;
                                                    if (s.moleFormData !== null) {
                                                        s.moleFormData.setBottleneckTolerance(Number(v).valueOf());
                                                    }
                                                }, onMount: function (control) {
                                                    (function () {
                                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                                            if (formGroup !== validationGroup) {
                                                                return;
                                                            }
                                                            control.reset();
                                                        });
                                                    }).bind(control)();
                                                } }),
                                            React.createElement(Common.Controls.FromLiteMol.NumberBox, { label: "Max Tunnel Similarity", tooltip: TooltipText.get("maxTunnelSimilarity"), min: 0, max: 1, defaultValue: valueOrDefault(data.getMaxTunnelSimilarity(), 0.7), step: 0.05, onChange: function (v) {
                                                    var s = _this.state;
                                                    if (s.moleFormData !== null) {
                                                        s.moleFormData.setMaxTunnelSimilarity(Number(v));
                                                    }
                                                }, onMount: function (control) {
                                                    (function () {
                                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                                            if (formGroup !== validationGroup) {
                                                                return;
                                                            }
                                                            control.reset();
                                                        });
                                                    }).bind(control)();
                                                } })
                                        ], expanded: this.state.expandedPanels.channelParametersAdvanced, onChange: function (e) {
                                            var s = _this.state;
                                            s.expandedPanels.channelParametersAdvanced = e;
                                            _this.setState(s);
                                        } })
                                ], expanded: this.state.expandedPanels.channelParameters, onChange: function (e) {
                                    var s = _this.state;
                                    s.expandedPanels.channelParameters = e;
                                    if (e === false) {
                                        s.expandedPanels.channelParametersAdvanced = false;
                                    }
                                    _this.setState(s);
                                } }),
                            React.createElement(Common.Controls.FromLiteMol.ControlGroup, { label: "Selection", tooltip: "", controls: [
                                    React.createElement(Common.Controls.FromLiteMol.StartingPointBox, { label: "Starting Point", tooltip: TooltipText.get("startingPoint"), defaultItems: this.state.moleFormData.getStartingPoints(), noDataText: "No starting points selected...", onChange: function (v) {
                                            var s = _this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setStartingPoints(v);
                                            }
                                        }, formGroup: validationGroup, extraClearGroup: validationGroup + "/selection", allowPatternQuery: true }),
                                    React.createElement(Common.Controls.FromLiteMol.StartingPointBox, { label: "End Point", tooltip: TooltipText.get("endPoint"), defaultItems: this.state.moleFormData.getEndingPoints(), noDataText: "No end points selected...", onChange: function (v) {
                                            var s = _this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setEndPoints(v);
                                            }
                                        }, formGroup: validationGroup, extraClearGroup: validationGroup + "/selection", allowPatternQuery: false }),
                                ], expanded: this.state.expandedPanels.selection, onChange: function (e) {
                                    var s = _this.state;
                                    s.expandedPanels.selection = e;
                                    _this.setState(s);
                                } })
                        ] }));
            };
            Settings.prototype.getPoresForm = function () {
                var _this = this;
                if (this.state.poresFormData === null) {
                    return React.createElement("div", null);
                }
                var data = this.state.poresFormData;
                var chains = data.getSpecificChains();
                if (chains === null) {
                    chains = "";
                }
                var pdbid = this.state.pdbid;
                return React.createElement("div", { className: "settings-form basic-settings pores" },
                    React.createElement("h3", null, "Pores"),
                    React.createElement(Common.Controls.FromLiteMol.LMControlWrapper, { controls: [
                            React.createElement(Common.Controls.FromLiteMol.CheckBox, { label: "Beta Structure", defaultValue: data.getBetaStructure(), tooltip: TooltipText.get("poresIsBetaStructure"), onChange: function (val) {
                                    if (_this.state.poresFormData !== null) {
                                        _this.state.poresFormData.setBetaStructure(val);
                                    }
                                } }),
                            React.createElement(Common.Controls.FromLiteMol.CheckBox, { label: "Membrane Region", defaultValue: data.getMembraneRegion(), tooltip: TooltipText.get("poresInMembrane"), onChange: function (val) {
                                    if (_this.state.poresFormData !== null) {
                                        _this.state.poresFormData.setMembraneRegion(val);
                                    }
                                } }),
                            React.createElement(Common.Controls.FromLiteMol.TextBox, { label: "Specific Chains", defaultValue: chains, tooltip: TooltipText.get("chains"), placeholder: "A, B, ...", validate: CommonUtils.Validators.validateChainsArray, validationGroup: validationGroup, onChange: function (val) {
                                    if (_this.state.poresFormData !== null) {
                                        _this.state.poresFormData.setSpecificChains(val);
                                    }
                                } }),
                            React.createElement(Common.Controls.FromLiteMol.NumberBox, { label: "Probe Radius", tooltip: TooltipText.get("probeRadius"), min: 1.4, max: 45, defaultValue: valueOrDefault(data.getProbeRadius(), 13), step: 0.01, onChange: function (v) {
                                    var s = _this.state;
                                    if (s.poresFormData !== null) {
                                        s.poresFormData.setProbeRadius(Number(v).valueOf());
                                    }
                                }, onMount: function (control) {
                                    (function () {
                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                            if (formGroup !== validationGroup) {
                                                return;
                                            }
                                            control.reset();
                                        });
                                    }).bind(control)();
                                } }),
                            React.createElement(Common.Controls.FromLiteMol.NumberBox, { label: "Interior Treshold", tooltip: TooltipText.get("poresInteriorTreshold"), min: 0.3, max: 3, defaultValue: valueOrDefault(data.getInteriorThreshold(), 0.8), step: 0.01, onChange: function (v) {
                                    var s = _this.state;
                                    if (s.poresFormData !== null) {
                                        s.poresFormData.setInteriorThreshold(Number(v).valueOf());
                                    }
                                }, onMount: function (control) {
                                    (function () {
                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler(function (formGroup) {
                                            if (formGroup !== validationGroup) {
                                                return;
                                            }
                                            control.reset();
                                        });
                                    }).bind(control)();
                                } })
                        ] }));
            };
            return Settings;
        }(React.Component));
        UI.Settings = Settings;
        function valueOrDefault(value, def) {
            return (value === null) ? def : value;
        }
        function getSubmissionIdx(compInfo, submitId) {
            for (var idx = 0; idx < compInfo.Submissions.length; idx++) {
                if (String(compInfo.Submissions[idx].SubmitId) === String(submitId)) {
                    return idx;
                }
            }
            return null;
        }
        ;
        ;
        var Submissions = (function (_super) {
            __extends(Submissions, _super);
            function Submissions() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = { computationInfo: null, loading: true, channelsDBData: null };
                _this.hasKillable = false;
                return _this;
            }
            Submissions.prototype.componentWillReceiveProps = function (nextProps) {
                this.prepareSubmissionData(nextProps.computationInfo);
            };
            Submissions.prototype.changePoresSubmissionChainsFormat = function (computationInfo) {
                var submissions = computationInfo.Submissions.map(function (v, i, a) {
                    if (v.PoresConfig !== void 0
                        && v.PoresConfig.Chains !== void 0
                        && v.PoresConfig.Chains !== void 0
                        && v.PoresConfig.Chains !== null
                        && Array.isArray(v.PoresConfig.Chains)) {
                        v.PoresConfig.Chains = v.PoresConfig.Chains.join(",");
                    }
                    return v;
                });
                computationInfo.Submissions = submissions;
                return computationInfo;
            };
            Submissions.prototype.prepareSubmissionData = function (computationInfo) {
                var _this = this;
                var state_ = this.state;
                state_.computationInfo = this.changePoresSubmissionChainsFormat(computationInfo);
                this.setState(state_);
                var hasKillable = false;
                if (computationInfo.PdbId !== void 0 && computationInfo.PdbId !== null && computationInfo.PdbId !== "") {
                    MoleOnlineWebUI.Cache.ChannelsDBData.doWhenCached(computationInfo.PdbId)
                        .then(function () {
                        MoleOnlineWebUI.Cache.ChannelsDBData.getChannelsData(computationInfo.PdbId)
                            .then(function (val) {
                            var s = _this.state;
                            s.channelsDBData = val;
                            _this.setState(s);
                        })
                            .catch(function (err) {
                            console.log(err);
                        });
                    })
                        .catch(function (err) {
                        console.log(err);
                    });
                }
                var _loop_3 = function (submission) {
                    if (submission.Status !== "Initializing" && submission.Status !== "Running") {
                        return "continue";
                    }
                    hasKillable = true;
                    MoleOnlineWebUI.DataProxy.JobStatus.Watcher.registerOnChangeHandler(this_3.props.computationInfo.ComputationId, submission.SubmitId, function (state) {
                        var oldStatus = submission.Status;
                        if (oldStatus === void 0 || oldStatus !== state.Status) {
                            var s = _this.state;
                            var currentCompInfo = s.computationInfo;
                            if (currentCompInfo === null) {
                                console.log("Computation info was not initialized corectly.");
                                return;
                            }
                            var subIdx = getSubmissionIdx(currentCompInfo, submission.SubmitId);
                            if (subIdx === null) {
                                console.log("Submission with id'" + submission.SubmitId + "' not found.");
                                return;
                            }
                            currentCompInfo.Submissions[subIdx].Status = state.Status;
                            s.computationInfo = currentCompInfo;
                            _this.setState(s);
                            if (oldStatus !== void 0) {
                                var hasKillable_ = _this.checkHasKillable(currentCompInfo);
                                if (_this.hasKillable !== hasKillable_) {
                                    _this.hasKillable = hasKillable_;
                                    MoleOnlineWebUI.Bridge.Events.invokeChangeHasKillable(hasKillable_);
                                }
                            }
                        }
                    }, function (err) {
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log(err);
                    });
                };
                var this_3 = this;
                for (var _i = 0, _a = computationInfo.Submissions; _i < _a.length; _i++) {
                    var submission = _a[_i];
                    _loop_3(submission);
                }
                this.hasKillable = hasKillable;
                var state = this.state;
                state.loading = false;
                this.setState(state);
                if (hasKillable) {
                    MoleOnlineWebUI.Bridge.Events.invokeChangeHasKillable(hasKillable);
                }
            };
            Submissions.prototype.checkHasKillable = function (compInfo) {
                var hasKillable = false;
                for (var _i = 0, _a = compInfo.Submissions; _i < _a.length; _i++) {
                    var submission = _a[_i];
                    if (submission.Status === "Running") {
                        hasKillable = true;
                        return hasKillable;
                    }
                }
                return hasKillable;
            };
            Submissions.prototype.componentDidMount = function () {
                this.prepareSubmissionData(this.props.computationInfo);
            };
            Submissions.prototype.render = function () {
                var _this = this;
                if (this.state.computationInfo !== null && !this.state.loading) {
                    var submissions = [];
                    var submissionsData = this.state.computationInfo.Submissions;
                    var submitId = 1;
                    var isChannelsDBSelected = false;
                    var params = Common.Util.Router.getParameters();
                    if (params !== null) {
                        submitId = (params.isChannelsDB) ? -1 : params.submitId;
                        isChannelsDBSelected = params.isChannelsDB;
                    }
                    if (this.state.channelsDBData !== null) {
                        submissions.push(React.createElement(ChannelsDBSubmission, { pdbid: this.state.computationInfo.PdbId, isSelected: isChannelsDBSelected, computationId: this.props.computationInfo.ComputationId }));
                    }
                    for (var _i = 0, _a = submissionsData.sort(function (a, b) {
                        return a.SubmitId - b.SubmitId;
                    }); _i < _a.length; _i++) {
                        var s = _a[_i];
                        var stat = s.Status;
                        submissions.push(React.createElement(Submission, { data: s, currentSubmitId: submitId, computationId: this.props.computationInfo.ComputationId, status: (stat === void 0) ? "Unknown" : stat, onResubmit: this.props.onResubmit, onCopy: function (submitId) {
                                for (var _i = 0, _a = _this.props.computationInfo.Submissions; _i < _a.length; _i++) {
                                    var submission = _a[_i];
                                    if (submission.SubmitId.toString() === submitId.toString()) {
                                        MoleOnlineWebUI.Bridge.Events.invokeCopyParameters({
                                            mode: (CommonUtils.Misc.isMoleJob(submission)) ? "mole" : "pores",
                                            moleConfig: submission.MoleConfig,
                                            poresConfig: submission.PoresConfig
                                        });
                                        return;
                                    }
                                }
                            } }));
                    }
                    if (submissions.length === 0) {
                        return (React.createElement("div", { className: "panel panel-default" },
                            React.createElement("div", { className: "panel-heading" },
                                React.createElement("h4", { className: "panel-title" }, "No submissions found."))));
                    }
                    return (React.createElement("div", { className: "panel-group submissions" }, submissions));
                }
                else if (this.state.loading) {
                    return (React.createElement("div", { className: "panel panel-default" },
                        React.createElement("div", { className: "panel-heading" },
                            React.createElement("h4", { className: "panel-title" }, "No submissions data available."))));
                }
                else {
                    return (React.createElement("div", { className: "panel panel-default" },
                        React.createElement("div", { className: "panel-heading" },
                            React.createElement("h4", { className: "panel-title" }, "Submissions data loading..."))));
                }
            };
            return Submissions;
        }(React.Component));
        UI.Submissions = Submissions;
        function checkCanKill(status) {
            var result = false;
            switch (status) {
                case "Running":
                    result = true;
                    break;
            }
            return result;
        }
        function checkCanSubmit(status) {
            return !checkCanKill(status);
        }
        function checkCanDelete(status) {
            var result = false;
            switch (status) {
                case "Aborted":
                case "Error":
                case "FailedInitialization":
                case "Finished":
                case "Initialized":
                    result = true;
                    break;
                case "Running":
                case "Initializing":
                    result = false;
                    break;
            }
            return result;
        }
        function checkCanResubmit(status) {
            var result = false;
            switch (status) {
                case "Aborted":
                case "Error":
                case "FailedInitialization":
                case "Finished":
                case "Initialized":
                    result = true;
                    break;
                case "Running":
                case "Initializing":
                case "Deleted":
                    result = false;
                    break;
            }
            return result;
        }
        var Submission = (function (_super) {
            __extends(Submission, _super);
            function Submission() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Submission.prototype.componentDidMount = function () {
            };
            Submission.prototype.getMoleJob = function (data) {
                return React.createElement("div", { className: "panel-body" },
                    React.createElement("h4", null, "Active Atoms/Residues"),
                    "Ignore Hydrogens: ",
                    (data.MoleConfig.Cavity === void 0) ? "False" : (data.MoleConfig.Cavity.IgnoreHydrogens) ? "True" : "False",
                    React.createElement("br", null),
                    "Ignore HETATMs: ",
                    (data.MoleConfig.Cavity === void 0) ? "False" : (data.MoleConfig.Cavity.IgnoreHETAtoms) ? "True" : "False",
                    React.createElement("br", null),
                    "Query Filter: ",
                    (data.MoleConfig.QueryFilter === void 0) ? "" : data.MoleConfig.QueryFilter,
                    React.createElement("br", null),
                    "Read All Models: ",
                    (data.MoleConfig.Input === void 0) ? "False" : (data.MoleConfig.Input.ReadAllModels) ? "True" : "False",
                    React.createElement("br", null),
                    "Ignored Residues: ",
                    (data.MoleConfig.NonActiveResidues === void 0 || data.MoleConfig.NonActiveResidues === null) ? "" : CommonUtils.Misc.flattenResidues(data.MoleConfig.NonActiveResidues),
                    React.createElement("br", null),
                    "Specific Chains: ",
                    (data.MoleConfig.Input === void 0) ? "" : data.MoleConfig.Input.SpecificChains,
                    React.createElement("br", null),
                    React.createElement("h4", null, "Cavity Parameters"),
                    "Probe Radius: ",
                    (data.MoleConfig.Cavity === void 0) ? "" : data.MoleConfig.Cavity.ProbeRadius,
                    React.createElement("br", null),
                    "Interior Threshold: ",
                    (data.MoleConfig.Cavity === void 0) ? "" : data.MoleConfig.Cavity.InteriorThreshold,
                    React.createElement("br", null),
                    React.createElement("h4", null, "Channel Parameters"),
                    "Origin Radius: ",
                    (data.MoleConfig.Tunnel === void 0 || data.MoleConfig.Tunnel === null) ? "" : data.MoleConfig.Tunnel.OriginRadius,
                    React.createElement("br", null),
                    "Surface Cover Radius: ",
                    (data.MoleConfig.Tunnel === void 0 || data.MoleConfig.Tunnel === null) ? "" : data.MoleConfig.Tunnel.SurfaceCoverRadius,
                    React.createElement("br", null),
                    "Weight Function: ",
                    (data.MoleConfig.Tunnel === void 0 || data.MoleConfig.Tunnel === null) ? "" : data.MoleConfig.Tunnel.WeightFunction,
                    React.createElement("br", null),
                    "Bottleneck Radius: ",
                    (data.MoleConfig.Tunnel === void 0 || data.MoleConfig.Tunnel === null) ? "" : data.MoleConfig.Tunnel.BottleneckRadius,
                    React.createElement("br", null),
                    "Bottleneck Tolerance: ",
                    (data.MoleConfig.Tunnel === void 0 || data.MoleConfig.Tunnel === null) ? "" : data.MoleConfig.Tunnel.BottleneckTolerance,
                    React.createElement("br", null),
                    "Max Tunnel Similarity: ",
                    (data.MoleConfig.Tunnel === void 0 || data.MoleConfig.Tunnel === null) ? "" : data.MoleConfig.Tunnel.MaxTunnelSimilarity,
                    React.createElement("br", null),
                    "Merge Pores: ",
                    (data.MoleConfig.PoresMerged === void 0 || data.MoleConfig.PoresMerged === null) ? "False" : (data.MoleConfig.PoresMerged) ? "True" : "False",
                    React.createElement("br", null),
                    "Automatic Pores: ",
                    (data.MoleConfig.PoresAuto === void 0 || data.MoleConfig.PoresAuto === null) ? "False" : (data.MoleConfig.PoresAuto) ? "True" : "False",
                    React.createElement("br", null),
                    React.createElement("h4", null, "Selection"),
                    "Starting Point: ",
                    (data.MoleConfig.Origin === void 0 || data.MoleConfig.Origin === null) ? "" : (data.MoleConfig.Origin.Residues === void 0 || data.MoleConfig.Origin.Residues === null || data.MoleConfig.Origin.Residues.length === 0) ? "" : CommonUtils.Misc.flattenResiduesArray(data.MoleConfig.Origin.Residues),
                    React.createElement("br", null),
                    "Starting Point[x,y,z]: ",
                    (data.MoleConfig.Origin === void 0 || data.MoleConfig.Origin === null) ? "" : (data.MoleConfig.Origin.Points === void 0 || data.MoleConfig.Origin.Points === null) ? "" : CommonUtils.Misc.pointsToString(data.MoleConfig.Origin.Points),
                    React.createElement("br", null),
                    "End Point: ",
                    (data.MoleConfig.CustomExits === void 0 || data.MoleConfig.CustomExits === null) ? "" : (data.MoleConfig.CustomExits.Residues === void 0 || data.MoleConfig.CustomExits.Residues === null || data.MoleConfig.CustomExits.Residues.length === 0) ? "" : CommonUtils.Misc.flattenResiduesArray(data.MoleConfig.CustomExits.Residues),
                    React.createElement("br", null),
                    "End Point[x,y,z]: ",
                    (data.MoleConfig.CustomExits === void 0 || data.MoleConfig.CustomExits === null) ? "" : (data.MoleConfig.CustomExits.Points === void 0 || data.MoleConfig.CustomExits.Points === null) ? "" : CommonUtils.Misc.pointsToString(data.MoleConfig.CustomExits.Points),
                    React.createElement("br", null),
                    "Query: ",
                    (data.MoleConfig.Origin === void 0 || data.MoleConfig.Origin === null) ? "" : (data.MoleConfig.Origin.QueryExpression === void 0 || data.MoleConfig.Origin.QueryExpression === null) ? "" : data.MoleConfig.Origin.QueryExpression,
                    React.createElement("br", null));
            };
            Submission.prototype.getPoresJob = function (data) {
                return React.createElement("div", { className: "panel-body" },
                    "Beta Structure: ",
                    (data.PoresConfig.IsBetaBarel === void 0) ? "False" : (data.PoresConfig.IsBetaBarel) ? "True" : "False",
                    React.createElement("br", null),
                    "Membrane Region: ",
                    (data.PoresConfig.InMembrane === void 0) ? "False" : (data.PoresConfig.InMembrane) ? "True" : "False",
                    React.createElement("br", null),
                    "Specific Chains: ",
                    (data.PoresConfig.Chains === void 0) ? "" : data.PoresConfig.Chains,
                    React.createElement("br", null),
                    "Probe Radius: ",
                    (data.PoresConfig === void 0) ? "" : data.PoresConfig.ProbeRadius,
                    React.createElement("br", null),
                    "Interior Threshold: ",
                    (data.PoresConfig === void 0) ? "" : data.PoresConfig.InteriorThreshold,
                    React.createElement("br", null));
            };
            Submission.prototype.render = function () {
                var _this = this;
                var currentSubmitId = this.props.currentSubmitId;
                var data = this.props.data;
                var canResubmit = checkCanResubmit(this.props.status);
                var contents;
                if (CommonUtils.Misc.isMoleJob(data)) {
                    contents = this.getMoleJob(data);
                }
                else {
                    contents = this.getPoresJob(data);
                }
                return (React.createElement("div", { className: "panel panel-default" },
                    React.createElement("div", { className: "panel-heading" },
                        React.createElement("a", { "data-toggle": "collapse", href: "#submit-data-" + data.SubmitId, onClick: function (e) {
                                if (e.currentTarget.attributes.getNamedItem('aria-expanded').value === 'true') {
                                    if (String(data.SubmitId) !== String(_this.props.currentSubmitId)) {
                                        changeSubmitId(_this.props.computationId, data.SubmitId);
                                    }
                                }
                            } },
                            React.createElement("h4", { className: "panel-title" },
                                "#",
                                data.SubmitId),
                            React.createElement("div", { className: "submission-state" },
                                "Status: ",
                                React.createElement("span", { className: "state-" + this.props.status }, this.props.status)))),
                    React.createElement("div", { id: "submit-data-" + data.SubmitId, className: "panel-collapse collapse" + ((currentSubmitId.toString() === data.SubmitId.toString()) ? ' in' : '') },
                        contents,
                        React.createElement("div", { className: "panel-footer" },
                            React.createElement("span", { className: "btn btn-xs btn-primary", onClick: (function () { return _this.copyParams(data.SubmitId); }).bind(this) }, "Copy"),
                            React.createElement("span", { className: "btn btn-xs btn-primary", disabled: !canResubmit, onClick: (function () { return _this.reSubmit(); }).bind(this) }, "Resubmit")))));
            };
            Submission.prototype.reSubmit = function () {
                if (CommonUtils.Misc.isMoleJob(this.props.data)) {
                    gtag('event', 'Submit', { 'event_category': 'MOLE' });
                    MoleOnlineWebUI.Bridge.Events.invokeOnReSubmit(Service.ApiService.submitMoleJob(this.props.computationId, this.props.data.MoleConfig));
                }
                else {
                    gtag('event', 'Submit', { 'event_category': 'Pores' });
                    MoleOnlineWebUI.Bridge.Events.invokeOnReSubmit(Service.ApiService.submitPoresJob(this.props.computationId, this.props.data.PoresConfig));
                }
            };
            Submission.prototype.copyParams = function (submitId) {
                if (this.props.onCopy !== void 0) {
                    this.props.onCopy(submitId);
                }
            };
            return Submission;
        }(React.Component));
        UI.Submission = Submission;
        var ChannelsDBSubmission = (function (_super) {
            __extends(ChannelsDBSubmission, _super);
            function ChannelsDBSubmission() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChannelsDBSubmission.prototype.componentDidMount = function () {
            };
            ChannelsDBSubmission.prototype.render = function () {
                var _this = this;
                var isSelected = this.props.isSelected;
                var link = Config.CommonOptions.CHANNELSDB_LINK_DETAIL_URL + "/" + this.props.pdbid;
                var contents = React.createElement("div", { className: "panel-body" },
                    "See ",
                    React.createElement("a", { target: "_blank", href: link }, link),
                    " for more info.");
                return (React.createElement("div", { className: "panel panel-default" },
                    React.createElement("div", { className: "panel-heading" },
                        React.createElement("a", { "data-toggle": "collapse", href: "#submit-data-ChannelsDB", onClick: function (e) {
                                if (e.currentTarget.attributes.getNamedItem('aria-expanded').value === 'true') {
                                    if (!_this.props.isSelected) {
                                        changeSubmitId(_this.props.computationId, -1);
                                    }
                                }
                            } },
                            React.createElement("h4", { className: "panel-title" }, "#ChannelsDB"),
                            React.createElement("div", { className: "submission-state" }))),
                    React.createElement("div", { id: "submit-data-ChannelsDB", className: "panel-collapse collapse" + ((isSelected) ? ' in' : '') }, contents)));
            };
            return ChannelsDBSubmission;
        }(React.Component));
        UI.ChannelsDBSubmission = ChannelsDBSubmission;
        function changeSubmitId(computationId, submitId) {
            if (submitId === -1) {
                Common.Util.Router.fakeRedirect(computationId, "ChannelsDB");
            }
            else {
                Common.Util.Router.fakeRedirect(computationId, (submitId > 0) ? String(submitId) : void 0);
            }
            LiteMol.Example.Channels.State.removeChannelsData(MoleOnlineWebUI.Bridge.Instances.getPlugin());
            MoleOnlineWebUI.Bridge.Events.invokeChangeSubmitId(submitId);
        }
        ;
        var ControlTabs = (function (_super) {
            __extends(ControlTabs, _super);
            function ControlTabs() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    activeTabIdx: 0,
                    data: void 0,
                    err: void 0,
                    submitId: 1,
                    canSubmit: true
                };
                return _this;
            }
            ControlTabs.prototype.componentDidMount = function () {
                var _this = this;
                if (this.props.activeTab !== void 0) {
                    var state = this.state;
                    state.activeTabIdx = this.props.activeTab;
                    this.setState(state);
                }
                var parameters = Common.Util.Router.getParameters();
                if (parameters !== null) {
                    var compId = parameters.computationId;
                    var submitId_1 = parameters.submitId;
                    if (parameters.isChannelsDB) {
                        submitId_1 = -1;
                    }
                    Provider.get(parameters.computationId, (function (compId, info) {
                        //CompInfo => Status==="Error" => Submissions neexistuje! Response ma format /Status na misto /CompInfo
                        if (info === null) {
                            return;
                        }
                        var state = _this.state;
                        state.data = info;
                        state.submitId = submitId_1;
                        _this.setState(state);
                    }).bind(this));
                }
                else {
                    var state = this.state;
                    state.err = "Parameters from url cannot be properly processed.";
                    this.setState(state);
                }
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(function (submitId) {
                    var state = _this.state;
                    state.submitId = submitId;
                    _this.setState(state);
                });
                Common.Controls.FromLiteMol.ValidationState.attachOnStateChangeHandler(validationGroup, function (prev, curr) {
                    var s = _this.state;
                    if (curr !== "VALID") {
                        $("#submission-form").find("input[type=submit]").attr("disabled", true);
                        s.canSubmit = false;
                    }
                    else {
                        s.canSubmit = true;
                    }
                    _this.setState(s);
                });
            };
            ControlTabs.prototype.nullIfEmpty = function (data) {
                if (data.length === 1 && data[0].length === 0) {
                    return null;
                }
                return data;
            };
            ControlTabs.prototype.handleSubmit = function (e) {
                e.preventDefault();
                $(e.target).find("input[type=submit]").attr("disabled", true);
                var currentState = this.state;
                currentState.canSubmit = false;
                this.setState(currentState);
                if (this.state.data === void 0) {
                    return;
                }
                CommonUtils.FormEvents.Events.invokeOnSubmit(validationGroup);
            };
            ControlTabs.prototype.render = function () {
                var _this = this;
                var tabs = [];
                if (this.state.data !== void 0) {
                    tabs.push(React.createElement(Settings, { initialData: this.state.data, parent: this, submitId: this.state.submitId }));
                    tabs.push(React.createElement(Submissions, { computationInfo: this.state.data, onResubmit: function (info) {
                            var state = _this.state;
                            state.data = info;
                            _this.setState(state);
                        } }));
                }
                else {
                    tabs.push(React.createElement("div", null, "No data"));
                }
                if (this.state.canSubmit) {
                    $('#controls .submit-parent').find("input[type=submit]").removeAttr("disabled");
                }
                else {
                    $('#controls .submit-parent').find("input[type=submit]").attr("disabled", true);
                }
                return (React.createElement("div", { className: "submit-form-container" },
                    React.createElement(Common.Tabs.BootstrapTabs.TabbedContainer, { header: ["Submission settings", "Submissions"], tabContents: tabs, namespace: "right-panel-tabs-", htmlClassName: "tabs", htmlId: "right-panel-tabs", activeTab: this.state.activeTabIdx, onChange: (function (tabIdx) {
                            var s = _this.state;
                            s.activeTabIdx = tabIdx;
                            _this.setState(s);
                        }).bind(this) }),
                    React.createElement("form", { className: "form-horizontal", id: "submission-form", onSubmit: this.handleSubmit.bind(this) },
                        React.createElement(ControlButtons, { submitId: this.state.submitId, computationInfo: this.state.data })),
                    React.createElement("div", { id: "right-panel-toggler", className: "toggler glyphicon glyphicon-resize-vertical" })));
            };
            return ControlTabs;
        }(React.Component));
        UI.ControlTabs = ControlTabs;
        var ControlButtons = (function (_super) {
            __extends(ControlButtons, _super);
            function ControlButtons() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = { submitId: -1, hasKillable: false, canSubmit: true };
                return _this;
            }
            ControlButtons.prototype.componentDidMount = function () {
                var _this = this;
                this.state.submitId = this.props.submitId;
                MoleOnlineWebUI.Bridge.Events.subscribeChangeHasKillable(function (hasKillable) {
                    var state = _this.state;
                    state.hasKillable = hasKillable;
                    _this.setState(state);
                });
            };
            ControlButtons.prototype.componentWillReceiveProps = function (nextProps) {
                var state = this.state;
                state.submitId = nextProps.submitId;
                this.setState(state);
            };
            ControlButtons.prototype.getSubmissions = function () {
                var submissions = [];
                if (this.props.computationInfo !== void 0) {
                    submissions = this.sortSubmissions(this.props.computationInfo.Submissions);
                }
                return submissions;
            };
            ControlButtons.prototype.sortSubmissions = function (items) {
                return items.sort(function (a, b) {
                    return a.SubmitId - b.SubmitId;
                });
            };
            ControlButtons.prototype.prepareSubmissionItems = function () {
                var submissions = this.getSubmissions();
                var rv = [];
                rv.push({
                    label: "-",
                    value: '0'
                });
                if (this.props.computationInfo !== void 0) {
                    if (this.props.computationInfo.PdbId !== null && this.props.computationInfo.PdbId !== "") {
                        rv.push({
                            label: 'ChDB',
                            value: '-1'
                        });
                    }
                }
                if (submissions.length === 0) {
                    return rv;
                }
                for (var _i = 0, submissions_1 = submissions; _i < submissions_1.length; _i++) {
                    var item = submissions_1[_i];
                    rv.push({
                        label: "" + item.SubmitId,
                        value: "" + item.SubmitId
                    });
                }
                return rv;
            };
            ControlButtons.prototype.getSelectedIndex = function (submitId, items) {
                for (var idx = 0; idx < items.length; idx++) {
                    var item = items[idx];
                    if (item.value === "" + submitId) {
                        return idx;
                    }
                }
                return void 0;
            };
            ControlButtons.prototype.onSubmitIdComboSelectChange = function (e) {
                if (this.props.computationInfo === void 0) {
                    return;
                }
                var idx = e.currentTarget.selectedIndex;
                var submitId = e.currentTarget.options[idx].value;
                var sid = Number(submitId).valueOf();
                changeSubmitId(this.props.computationInfo.ComputationId, sid);
                var state = this.state;
                state.submitId = sid;
                this.setState(state);
            };
            ControlButtons.prototype.changeSubmitIdByStep = function (e) {
                if (this.props.computationInfo === void 0) {
                    return;
                }
                var submitId = e.currentTarget.dataset["value"];
                if (submitId !== void 0) {
                    var sid = Number(submitId).valueOf();
                    changeSubmitId(this.props.computationInfo.ComputationId, sid);
                    var state = this.state;
                    state.submitId = sid;
                    this.setState(state);
                }
            };
            ControlButtons.prototype.canShift = function (left) {
                if (this.props.computationInfo === void 0) {
                    return false;
                }
                if (String(this.state.submitId) === String(0)) {
                    return false;
                }
                var submissions = this.getSubmissions();
                for (var idx = 0; idx < submissions.length; idx++) {
                    if (String(submissions[idx].SubmitId) === String(this.props.submitId)) {
                        var nextIdx = idx + ((left) ? -1 : 1);
                        if (nextIdx < 0 || nextIdx >= submissions.length) {
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                }
                return false;
            };
            ControlButtons.prototype.canShiftNext = function () {
                return this.canShift(false);
            };
            ControlButtons.prototype.canShiftPrev = function () {
                return this.canShift(true);
            };
            ControlButtons.prototype.getNextIdx = function (idx) {
                return idx + 1;
            };
            ControlButtons.prototype.getPrevIdx = function (idx) {
                return idx - 1;
            };
            ControlButtons.prototype.render = function () {
                var canKill = (this.props.computationInfo !== void 0 && this.state.hasKillable);
                var items = this.prepareSubmissionItems();
                var idx = this.getSelectedIndex(this.state.submitId, items);
                var canShiftPrev = this.canShiftPrev();
                var canShiftNext = this.canShiftNext();
                return React.createElement("div", { className: "submit-parent" },
                    React.createElement("input", { className: "btn btn-primary submit", type: "submit", value: "Submit" }),
                    React.createElement("input", { type: "button", className: "btn btn-primary kill-job-button", disabled: !canKill, onClick: (function (e) {
                            if ($(e.currentTarget).attr("disabled") !== "disabled") {
                                $('#killJobDialog').modal('show');
                                $(".chdb-panel.right-panel").addClass("has-modal");
                            }
                        }), value: "Kill" }),
                    React.createElement("input", { type: "button", className: "btn btn-primary delete-project-button", "data-toggle": "modal", "data-target": "#deleteProjectDialog", onClick: (function (e) {
                            e.preventDefault();
                            $(".chdb-panel.right-panel").addClass("has-modal");
                            return false;
                        }), value: "Delete" }),
                    React.createElement("input", { className: "btn btn-primary clear-button", type: "button", value: "Clear", onClick: function () {
                            CommonUtils.FormEvents.Events.invokeOnClear(validationGroup + "_form");
                        } }),
                    React.createElement("input", { className: "btn btn-primary submit-arrow", type: "button", value: ">", disabled: (!canShiftNext) ? true : void 0, "data-value": (!canShiftNext || idx === void 0) ? void 0 : items[this.getNextIdx(idx)].value, onClick: this.changeSubmitIdByStep.bind(this) }),
                    React.createElement(Common.Controls.SimpleComboBox, { id: "submissionComboSwitch", items: items, defaultSelectedIndex: idx, className: "form-control submit-combo", onSelectedChange: this.onSubmitIdComboSelectChange.bind(this) }),
                    React.createElement("input", { className: "btn btn-primary submit-arrow", type: "button", value: "<", disabled: (!canShiftPrev) ? true : void 0, "data-value": (!canShiftPrev || idx == void 0) ? void 0 : items[this.getPrevIdx(idx)].value, onClick: this.changeSubmitIdByStep.bind(this) }),
                    React.createElement(ModalDialog, { id: "killJobDialog", header: "Do you really want to kill running job?", body: this.prepareKillJobDialogBody() }),
                    React.createElement(ModalDialog, { id: "deleteProjectDialog", header: "Do you really want to delete whole computation project?", body: this.prepareDeleteDialogBody() }));
            };
            ControlButtons.prototype.prepareKillJobDialogBody = function () {
                var _this = this;
                return (React.createElement("div", null,
                    React.createElement("button", { className: "btn btn-primary left-button", onClick: function (e) {
                            e.preventDefault();
                            if (_this.props.computationInfo === void 0) {
                                return false;
                            }
                            Service.ApiService.killRunningJob(_this.props.computationInfo.ComputationId).then(function (result) {
                                if (result.Status !== "Aborted") {
                                    MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                        message: (result.ErrorMsg.length === 0) ? "Attempt to kill job was not successfull." : result.ErrorMsg,
                                        messageType: "Warning"
                                    });
                                    return;
                                }
                                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                    message: "Job has been successfully killed.",
                                    messageType: "Success"
                                });
                            })
                                .catch(function (err) {
                                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                    message: "Attempt to kill running job failed! Please try again later.",
                                    messageType: "Danger"
                                });
                            });
                            return false;
                        }, "data-dismiss": "modal" }, "Yes"),
                    React.createElement("button", { className: "btn btn-primary right-button", "data-dismiss": "modal" }, "No")));
            };
            ControlButtons.prototype.prepareDeleteDialogBody = function () {
                var _this = this;
                return (React.createElement("div", null,
                    React.createElement("button", { className: "btn btn-primary left-button", onClick: function (e) {
                            e.preventDefault();
                            if (_this.props.computationInfo === void 0) {
                                return false;
                            }
                            Service.ApiService.deleteProject(_this.props.computationInfo.ComputationId).then(function () {
                                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                    message: "Current computation was succesfuly deleted. You will be redirected to initial page.",
                                    messageType: "Success"
                                });
                                window.setTimeout(function () {
                                    SimpleRouter.GlobalRouter.redirect(Config.Routing.ROUTING_OPTIONS[Config.Routing.ROUTING_MODE].defaultContextPath);
                                }, 5000);
                            })
                                .catch(function (err) {
                                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                    message: "Attempt to delete current computation failed! Please try again later.",
                                    messageType: "Danger"
                                });
                            });
                            return false;
                        }, "data-dismiss": "modal" }, "Yes"),
                    React.createElement("button", { className: "btn btn-primary right-button", "data-dismiss": "modal" }, "No")));
            };
            return ControlButtons;
        }(React.Component));
        UI.ControlButtons = ControlButtons;
        var ModalDialog = (function (_super) {
            __extends(ModalDialog, _super);
            function ModalDialog() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ModalDialog.prototype.render = function () {
                return React.createElement("div", { id: this.props.id, className: "modal fade", role: "dialog" },
                    React.createElement("div", { className: "modal-dialog" },
                        React.createElement("div", { className: "modal-content" },
                            React.createElement("div", { className: "modal-header" },
                                React.createElement("button", { type: "button", className: "close", "data-dismiss": "modal" }, "\u00D7"),
                                React.createElement("h4", { className: "modal-title" }, this.props.header)),
                            React.createElement("div", { className: "modal-body" }, this.props.body),
                            React.createElement("div", { className: "modal-footer" },
                                React.createElement("button", { type: "button", className: "btn btn-default", "data-dismiss": "modal", onClick: function () {
                                        $(".chdb-panel.right-panel").removeClass("has-modal");
                                    } }, "Close")))));
            };
            return ModalDialog;
        }(React.Component));
    })(UI = Controls.UI || (Controls.UI = {}));
})(Controls || (Controls = {}));
var Controls;
(function (Controls) {
    var UI;
    (function (UI) {
        var Cavity = (function () {
            function Cavity() {
                this.IgnoreHETAtoms = false;
                this.IgnoreHydrogens = false;
                this.InteriorThreshold = 1.1;
                this.ProbeRadius = 5;
            }
            return Cavity;
        }());
        UI.Cavity = Cavity;
        var Input = (function () {
            function Input() {
                this.ReadAllModels = false;
                this.SpecificChains = "";
            }
            return Input;
        }());
        UI.Input = Input;
        var Tunnel = (function () {
            function Tunnel() {
                this.WeightFunction = "VoronoiScale";
                this.BottleneckRadius = 1.2;
                this.BottleneckTolerance = 3;
                this.MaxTunnelSimilarity = 0.7;
                this.OriginRadius = 5;
                this.SurfaceCoverRadius = 10;
                this.UseCustomExitsOnly = false;
            }
            return Tunnel;
        }());
        UI.Tunnel = Tunnel;
        var Origin = (function () {
            function Origin() {
                this.Points = null;
                this.Residues = null;
                this.QueryExpression = null;
            }
            return Origin;
        }());
        UI.Origin = Origin;
        var MoleFormData = (function () {
            function MoleFormData(data) {
                if (data !== void 0 && data.Cavity !== null && data.Cavity !== void 0) {
                    this.Cavity = {
                        IgnoreHETAtoms: data.Cavity.IgnoreHETAtoms,
                        InteriorThreshold: data.Cavity.InteriorThreshold,
                        IgnoreHydrogens: data.Cavity.IgnoreHydrogens,
                        ProbeRadius: data.Cavity.ProbeRadius
                    };
                }
                else {
                    this.Cavity = null;
                }
                if (data !== void 0 && data.CustomExits !== null && data.CustomExits !== void 0) {
                    this.CustomExits = {
                        Points: (data.CustomExits.Points !== null) ? data.CustomExits.Points.slice() : null,
                        QueryExpression: data.CustomExits.QueryExpression,
                        Residues: (data.CustomExits.Residues !== null) ? data.CustomExits.Residues.slice() : null
                    };
                }
                else {
                    this.CustomExits = null;
                }
                if (data !== void 0 && data.Input !== null && data.Input !== void 0) {
                    this.Input = {
                        ReadAllModels: data.Input.ReadAllModels,
                        SpecificChains: data.Input.SpecificChains
                    };
                }
                else {
                    this.Input = null;
                }
                if (data !== void 0 && data.NonActiveResidues !== null && data.NonActiveResidues !== void 0) {
                    this.NonActiveResidues = data.NonActiveResidues.slice();
                }
                else {
                    this.NonActiveResidues = null;
                }
                if (data !== void 0 && data.Origin !== null && data.Origin !== void 0) {
                    this.Origin = {
                        Points: (data.Origin.Points !== null) ? data.Origin.Points.slice() : null,
                        QueryExpression: data.Origin.QueryExpression,
                        Residues: (data.Origin.Residues !== null) ? data.Origin.Residues.slice() : null
                    };
                }
                else {
                    this.Origin = null;
                }
                if (data !== void 0 && data.PoresAuto !== null && data.PoresAuto !== void 0) {
                    this.PoresAuto = data.PoresAuto;
                }
                else {
                    this.PoresAuto = false;
                }
                if (data !== void 0 && data.PoresMerged !== null && data.PoresMerged !== void 0) {
                    this.PoresMerged = data.PoresMerged;
                }
                else {
                    this.PoresMerged = false;
                }
                if (data !== void 0 && data.QueryFilter !== null && data.QueryFilter !== void 0) {
                    this.QueryFilter = data.QueryFilter;
                }
                else {
                    this.QueryFilter = null;
                }
                if (data !== void 0 && data.Tunnel !== null && data.Tunnel !== void 0) {
                    this.Tunnel = {
                        BottleneckRadius: data.Tunnel.BottleneckRadius,
                        BottleneckTolerance: data.Tunnel.BottleneckTolerance,
                        MaxTunnelSimilarity: data.Tunnel.MaxTunnelSimilarity,
                        OriginRadius: data.Tunnel.OriginRadius,
                        SurfaceCoverRadius: data.Tunnel.SurfaceCoverRadius,
                        UseCustomExitsOnly: data.Tunnel.UseCustomExitsOnly,
                        WeightFunction: data.Tunnel.WeightFunction
                    };
                }
                else {
                    this.Tunnel = null;
                }
            }
            MoleFormData.prototype.setIgnoreHETATMs = function (value) {
                if (this.Cavity === null) {
                    this.Cavity = new Cavity();
                }
                this.Cavity.IgnoreHETAtoms = value;
            };
            MoleFormData.prototype.getIgnoreHETATMs = function () {
                if (this.Cavity === null) {
                    return null;
                }
                return this.Cavity.IgnoreHETAtoms;
            };
            MoleFormData.prototype.setIgnoreHydrogens = function (value) {
                if (this.Cavity === null) {
                    this.Cavity = new Cavity();
                }
                this.Cavity.IgnoreHydrogens = value;
            };
            MoleFormData.prototype.getIgnoreHydrogens = function () {
                if (this.Cavity === null) {
                    return null;
                }
                return this.Cavity.IgnoreHydrogens;
            };
            MoleFormData.prototype.setInteriorThreshold = function (value) {
                if (this.Cavity === null) {
                    this.Cavity = new Cavity();
                }
                this.Cavity.InteriorThreshold = value;
            };
            MoleFormData.prototype.getInteriorThreshold = function () {
                if (this.Cavity === null) {
                    return null;
                }
                return this.Cavity.InteriorThreshold;
            };
            MoleFormData.prototype.setProbeRadius = function (value) {
                if (this.Cavity === null) {
                    this.Cavity = new Cavity();
                }
                this.Cavity.ProbeRadius = value;
            };
            MoleFormData.prototype.getProbeRadius = function () {
                if (this.Cavity === null) {
                    return null;
                }
                return this.Cavity.ProbeRadius;
            };
            MoleFormData.prototype.setReadAllModels = function (value) {
                if (this.Input === null) {
                    this.Input = new Input();
                }
                this.Input.ReadAllModels = value;
            };
            MoleFormData.prototype.getReadAllModels = function () {
                if (this.Input === null) {
                    return null;
                }
                return this.Input.ReadAllModels;
            };
            MoleFormData.prototype.setSpecificChains = function (value) {
                if (this.Input === null) {
                    this.Input = new Input();
                }
                this.Input.SpecificChains = value;
            };
            MoleFormData.prototype.getSpecificChains = function () {
                if (this.Input === null) {
                    return null;
                }
                return this.Input.SpecificChains;
            };
            MoleFormData.prototype.setOriginRadius = function (value) {
                if (this.Tunnel === null) {
                    this.Tunnel = new Tunnel();
                }
                this.Tunnel.OriginRadius = value;
            };
            MoleFormData.prototype.getOriginRadius = function () {
                if (this.Tunnel === null) {
                    return null;
                }
                return this.Tunnel.OriginRadius;
            };
            MoleFormData.prototype.setSurfaceCoverRadius = function (value) {
                if (this.Tunnel === null) {
                    this.Tunnel = new Tunnel();
                }
                this.Tunnel.SurfaceCoverRadius = value;
            };
            MoleFormData.prototype.getSurfaceCoverRadius = function () {
                if (this.Tunnel === null) {
                    return null;
                }
                return this.Tunnel.SurfaceCoverRadius;
            };
            MoleFormData.prototype.setWeightFunction = function (value) {
                if (this.Tunnel === null) {
                    this.Tunnel = new Tunnel();
                }
                this.Tunnel.WeightFunction = value;
            };
            MoleFormData.prototype.getWeightFunction = function () {
                if (this.Tunnel === null) {
                    return null;
                }
                return this.Tunnel.WeightFunction;
            };
            MoleFormData.prototype.setBottleneckRadius = function (value) {
                if (this.Tunnel === null) {
                    this.Tunnel = new Tunnel();
                }
                this.Tunnel.BottleneckRadius = value;
            };
            MoleFormData.prototype.getBottleneckRadius = function () {
                if (this.Tunnel === null) {
                    return null;
                }
                return this.Tunnel.BottleneckRadius;
            };
            MoleFormData.prototype.setBottleneckTolerance = function (value) {
                if (this.Tunnel === null) {
                    this.Tunnel = new Tunnel();
                }
                this.Tunnel.BottleneckTolerance = value;
            };
            MoleFormData.prototype.getBottleneckTollerance = function () {
                if (this.Tunnel === null) {
                    return null;
                }
                return this.Tunnel.BottleneckTolerance;
            };
            MoleFormData.prototype.setMaxTunnelSimilarity = function (value) {
                if (this.Tunnel === null) {
                    this.Tunnel = new Tunnel();
                }
                this.Tunnel.MaxTunnelSimilarity = value;
            };
            MoleFormData.prototype.getMaxTunnelSimilarity = function () {
                if (this.Tunnel === null) {
                    return null;
                }
                return this.Tunnel.MaxTunnelSimilarity;
            };
            MoleFormData.prototype.setMergePores = function (value) {
                this.PoresMerged = value;
            };
            MoleFormData.prototype.getMergePores = function () {
                return this.PoresMerged;
            };
            MoleFormData.prototype.setAutomaticPores = function (value) {
                this.PoresAuto = value;
            };
            MoleFormData.prototype.getAutomaticPores = function () {
                return this.PoresAuto;
            };
            MoleFormData.prototype.setIgnoredResidues = function (value) {
                this.NonActiveResidues = value.slice();
            };
            MoleFormData.prototype.getIgnoredResidues = function () {
                return this.NonActiveResidues;
            };
            MoleFormData.prototype.setQueryFilter = function (value) {
                this.QueryFilter = value;
            };
            MoleFormData.prototype.getQueryFilter = function () {
                return this.QueryFilter;
            };
            MoleFormData.prototype.setPoints = function (value, isStart) {
                var points = [];
                var residues = [];
                var query = null;
                for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                    var p = value_1[_i];
                    switch (p.type) {
                        case "Point":
                            var point = p.value;
                            points.push({ X: Number(point.x), Y: Number(point.y), Z: Number(point.z.toString()) });
                            break;
                        case "Residue":
                            var rp = p;
                            rp.value;
                            residues.push(rp.value.map(function (val, idx, arr) {
                                return {
                                    SequenceNumber: val.seqId,
                                    Chain: val.chain
                                };
                            }));
                            break;
                        case "Query":
                            query = p.value;
                    }
                }
                if (isStart) {
                    if (this.Origin === null) {
                        this.Origin = new Origin();
                    }
                    this.Origin.Points = (points.length > 0) ? points : null;
                    this.Origin.Residues = (residues.length > 0) ? residues : null;
                    this.Origin.QueryExpression = query;
                }
                else {
                    if (this.CustomExits === null) {
                        this.CustomExits = new Origin();
                    }
                    this.CustomExits.Points = (points.length > 0) ? points : null;
                    this.CustomExits.Residues = (residues.length > 0) ? residues : null;
                    this.CustomExits.QueryExpression = query;
                }
            };
            MoleFormData.prototype.setStartingPoints = function (value) {
                this.setPoints(value, true);
            };
            MoleFormData.prototype.setEndPoints = function (value) {
                this.setPoints(value, false);
            };
            MoleFormData.prototype.getStartingPoints = function () {
                if (this.Origin === null) {
                    return [];
                }
                var result = [];
                if (this.Origin.Points !== null) {
                    result = result.concat(this.Origin.Points.map(function (val, idx, arr) {
                        return {
                            type: "Point",
                            uiType: "3D Point",
                            value: new Common.Controls.FromLiteMol.Point(val.X.toString(), val.Y.toString(), val.Z.toString())
                        };
                    }));
                }
                if (this.Origin.Residues !== null) {
                    result = result.concat(this.Origin.Residues.map(function (val, idx, arr) {
                        return {
                            type: "Residue",
                            uiType: "Residue List",
                            value: val.map(function (v, i, a) {
                                return new Common.Controls.FromLiteMol.Residue(v.SequenceNumber, v.Chain);
                            })
                        };
                    }));
                }
                if (this.Origin.QueryExpression !== null) {
                    result.push({
                        type: "Query",
                        uiType: "PatternQuery",
                        residue: "",
                        value: this.Origin.QueryExpression
                    });
                }
                return result;
            };
            MoleFormData.prototype.getEndingPoints = function () {
                if (this.CustomExits === null) {
                    return [];
                }
                var result = [];
                if (this.CustomExits.Points !== null) {
                    result = result.concat(this.CustomExits.Points.map(function (val, idx, arr) {
                        return {
                            type: "Point",
                            uiType: "3D Point",
                            value: new Common.Controls.FromLiteMol.Point(val.X.toString(), val.Y.toString(), val.Z.toString())
                        };
                    }));
                }
                if (this.CustomExits.Residues !== null) {
                    result = result.concat(this.CustomExits.Residues.map(function (val, idx, arr) {
                        return {
                            type: "Residue",
                            uiType: "Residue List",
                            value: val.map(function (v, i, a) {
                                return new Common.Controls.FromLiteMol.Residue(v.SequenceNumber, v.Chain);
                            })
                        };
                    }));
                }
                if (this.CustomExits.QueryExpression !== null) {
                    result.push({
                        type: "Query",
                        uiType: "PatternQuery",
                        residue: "",
                        value: this.CustomExits.QueryExpression
                    });
                }
                return result;
            };
            //--
            MoleFormData.prototype.getPackage = function () {
                return {
                    Cavity: (this.Cavity === null) ? void 0 : this.Cavity,
                    CustomExits: this.CustomExits,
                    Input: (this.Input === null) ? void 0 : this.Input,
                    NonActiveResidues: this.NonActiveResidues,
                    Origin: this.Origin,
                    PoresAuto: this.PoresAuto,
                    PoresMerged: this.PoresMerged,
                    QueryFilter: this.QueryFilter,
                    Tunnel: (this.Tunnel === null) ? void 0 : this.Tunnel
                };
            };
            return MoleFormData;
        }());
        UI.MoleFormData = MoleFormData;
        var PoresFormData = (function () {
            function PoresFormData(data) {
                if (data !== void 0 && data.InMembrane !== null && data.InMembrane !== void 0) {
                    this.InMembrane = data.InMembrane;
                }
                else {
                    this.InMembrane = false;
                }
                if (data !== void 0 && data.IsBetaBarel !== null && data.IsBetaBarel !== void 0) {
                    this.IsBetaBarel = data.IsBetaBarel;
                }
                else {
                    this.IsBetaBarel = false;
                }
                if (data !== void 0 && data.Chains !== null && data.Chains !== void 0) {
                    this.Chains = data.Chains;
                }
                else {
                    this.Chains = null;
                }
                if (data !== void 0 && data.InteriorThreshold !== null && data.InteriorThreshold !== void 0) {
                    this.InteriorThreshold = data.InteriorThreshold;
                }
                else {
                    this.InteriorThreshold = null;
                }
                if (data !== void 0 && data.ProbeRadius !== null && data.ProbeRadius !== void 0) {
                    this.ProbeRadius = data.ProbeRadius;
                }
                else {
                    this.ProbeRadius = null;
                }
            }
            PoresFormData.prototype.setBetaStructure = function (value) {
                this.IsBetaBarel = value;
            };
            PoresFormData.prototype.getBetaStructure = function () {
                return this.IsBetaBarel;
            };
            PoresFormData.prototype.setMembraneRegion = function (value) {
                this.InMembrane = value;
            };
            PoresFormData.prototype.getMembraneRegion = function () {
                return this.InMembrane;
            };
            PoresFormData.prototype.setSpecificChains = function (value) {
                this.Chains = value;
            };
            PoresFormData.prototype.getSpecificChains = function () {
                return this.Chains;
            };
            PoresFormData.prototype.setProbeRadius = function (value) {
                this.ProbeRadius = value;
            };
            PoresFormData.prototype.getProbeRadius = function () {
                return this.ProbeRadius;
            };
            PoresFormData.prototype.setInteriorThreshold = function (value) {
                this.InteriorThreshold = value;
            };
            PoresFormData.prototype.getInteriorThreshold = function () {
                return this.InteriorThreshold;
            };
            //--
            PoresFormData.prototype.getPackage = function () {
                return {
                    Chains: this.Chains,
                    InMembrane: this.InMembrane,
                    IsBetaBarel: this.IsBetaBarel,
                    InteriorThreshold: this.InteriorThreshold,
                    ProbeRadius: this.ProbeRadius
                };
            };
            return PoresFormData;
        }());
        UI.PoresFormData = PoresFormData;
    })(UI = Controls.UI || (Controls.UI = {}));
})(Controls || (Controls = {}));
var DownloadReport;
(function (DownloadReport) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        function render(target) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, null), target);
        }
        UI.render = render;
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            App.prototype.componentDidMount = function () {
            };
            App.prototype.componentWillUnmount = function () {
            };
            App.prototype.render = function () {
                return React.createElement("div", null,
                    React.createElement(DownloadResultsMenu, null));
            };
            return App;
        }(React.Component));
        UI.App = App;
        var BootstrapDropDownMenuItem = (function (_super) {
            __extends(BootstrapDropDownMenuItem, _super);
            function BootstrapDropDownMenuItem() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            BootstrapDropDownMenuItem.prototype.render = function () {
                return (React.createElement("li", null,
                    React.createElement("a", { onClick: this.props.onClick, target: (this.props.targetBlank) ? "_blank" : "", href: this.props.link }, this.props.linkText)));
            };
            return BootstrapDropDownMenuItem;
        }(React.Component));
        var BootstrapDropDownMenuElementItem = (function (_super) {
            __extends(BootstrapDropDownMenuElementItem, _super);
            function BootstrapDropDownMenuElementItem() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            BootstrapDropDownMenuElementItem.prototype.render = function () {
                if (this.props.onClick !== void 0) {
                    return (React.createElement("li", null,
                        React.createElement("a", { onClick: this.props.onClick }, this.props.linkElement)));
                }
                else {
                    return (React.createElement("li", null,
                        React.createElement("a", { target: (this.props.targetBlank) ? "_blank" : "", href: this.props.link }, this.props.linkElement)));
                }
            };
            return BootstrapDropDownMenuElementItem;
        }(React.Component));
        var BootstrapDropDownMenuButton = (function (_super) {
            __extends(BootstrapDropDownMenuButton, _super);
            function BootstrapDropDownMenuButton() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            BootstrapDropDownMenuButton.prototype.render = function () {
                return React.createElement("div", { className: "btn-group dropdown" },
                    React.createElement("button", { type: "button", className: "download dropdown-toggle", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false" },
                        this.props.label,
                        " ",
                        React.createElement("span", { className: "glyphicon glyphicon-download" })),
                    React.createElement("ul", { className: "dropdown-menu" }, this.props.items));
            };
            return BootstrapDropDownMenuButton;
        }(React.Component));
        var DownloadResultsMenu = (function (_super) {
            __extends(DownloadResultsMenu, _super);
            function DownloadResultsMenu() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = { computationId: "", submitId: 0 };
                return _this;
            }
            DownloadResultsMenu.prototype.componentDidMount = function () {
                var _this = this;
                var params = Common.Util.Router.getParameters();
                if (params !== null) {
                    var computationId = params.computationId;
                    var submitId = params.submitId;
                    if (params.isChannelsDB) {
                        submitId = -1;
                    }
                    this.setState({ computationId: computationId, submitId: submitId });
                }
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(function (submitId) {
                    var state = _this.state;
                    state.submitId = submitId;
                    _this.setState(state);
                });
            };
            DownloadResultsMenu.prototype.render = function () {
                var computationId = this.state.computationId;
                var submitId = "?submitId=" + this.state.submitId;
                var linkBase = Config.DataSources.API_URL[Config.DataSources.MODE] + "/Data/" + computationId + submitId;
                var items = [];
                if (computationId !== void 0) {
                    items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "Molecule", link: linkBase + "&format=molecule", targetBlank: true, onClick: function () {
                            gtag('event', 'Download', { 'event_category': 'molecule' });
                        } }));
                    if (this.state.submitId > 0) {
                        items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "PyMol", link: linkBase + "&format=pymol", targetBlank: true, onClick: function () {
                                gtag('event', 'Download', { 'event_category': 'pymol' });
                            } }));
                        items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "VMD", link: linkBase + "&format=vmd", targetBlank: true, onClick: function () {
                                gtag('event', 'Download', { 'event_category': 'vmd' });
                            } }));
                        items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "PDB", link: linkBase + "&format=pdb", targetBlank: true, onClick: function () {
                                gtag('event', 'Download', { 'event_category': 'pdb' });
                            } }));
                        items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "Chimera", link: linkBase + "&format=chimera", targetBlank: true, onClick: function () {
                                gtag('event', 'Download', { 'event_category': 'chimera' });
                            } }));
                        items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "JSON", link: "" + linkBase, targetBlank: true, onClick: function () {
                                gtag('event', 'Download', { 'event_category': 'json' });
                            } }));
                        items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "Results", link: linkBase + "&format=report", targetBlank: true, onClick: function () {
                                gtag('event', 'Download', { 'event_category': 'zip' });
                            } }));
                    }
                    if (this.state.submitId !== 0) {
                        items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "PDF report", onClick: function () {
                                gtag('event', 'Download', { 'event_category': 'pdf' });
                                MoleOnlineWebUI.Bridge.Events.invokeRunPDFReport();
                            } }));
                    }
                }
                return React.createElement(BootstrapDropDownMenuButton, { label: "Download", items: items });
            };
            return DownloadResultsMenu;
        }(React.Component));
    })(UI = DownloadReport.UI || (DownloadReport.UI = {}));
})(DownloadReport || (DownloadReport = {}));
var PdbIdSign;
(function (PdbIdSign) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        function render(target) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, null), target);
        }
        UI.render = render;
        ;
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = { pdbid: void 0, err: void 0 };
                return _this;
            }
            App.prototype.componentDidMount = function () {
                var _this = this;
                var params = Common.Util.Router.getParameters();
                if (params === null) {
                    this.setState({ err: "!!!" });
                    return;
                }
                MoleOnlineWebUI.Service.MoleAPI.ApiService.getComputationInfoList(params.computationId).then(function (res) {
                    if (res.PdbId === "" || res.PdbId === null || res.PdbId === void 0) {
                        _this.setState({ err: "---" });
                    }
                    else {
                        _this.setState({ pdbid: res.PdbId });
                    }
                })
                    .catch(function (err) {
                    _this.setState({ err: "<Error>" });
                });
            };
            App.prototype.componentWillUnmount = function () {
            };
            App.prototype.render = function () {
                if (this.state.pdbid === void 0) {
                    return React.createElement("div", null, (this.state.err === void 0) ? "..." : this.state.err);
                }
                return React.createElement("div", null,
                    React.createElement("a", { href: "https://pdbe.org/" + this.state.pdbid, target: "_blank" },
                        this.state.pdbid,
                        " ",
                        React.createElement("span", { className: "glyphicon glyphicon-new-window href-ico" })));
            };
            return App;
        }(React.Component));
        UI.App = App;
    })(UI = PdbIdSign.UI || (PdbIdSign.UI = {}));
})(PdbIdSign || (PdbIdSign = {}));
var Help;
(function (Help) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        function render(target) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, null), target);
        }
        UI.render = render;
        ;
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    dialogOpen: false,
                    session: "",
                    computationId: "",
                    submitId: 0
                };
                return _this;
            }
            App.prototype.updateSessionState = function () {
                var s = this.state;
                var params = Common.Util.Router.getParameters();
                if (params === null) {
                    s.session = "<Unknown>";
                }
                else {
                    s.session = "" + params.computationId;
                    s.computationId = params.computationId;
                    if (params.submitId < 0 || params.isChannelsDB) {
                        s.session += "/ChannelsDB";
                        s.submitId = -1;
                    }
                    else if (params.submitId > 0) {
                        s.session += "/" + String(params.submitId);
                        s.submitId = params.submitId;
                    }
                    else {
                        s.submitId = 0;
                    }
                }
                this.setState(s);
                $("#session").val(s.session);
            };
            App.prototype.componentDidMount = function () {
                var _this = this;
                this.updateSessionState();
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(function () {
                    _this.updateSessionState();
                });
            };
            App.prototype.componentWillUnmount = function () {
            };
            App.prototype.isMailFormatValid = function (value) {
                var valid = true;
                if (value !== "") {
                    valid = RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/).test(value);
                }
                return {
                    valid: valid,
                    Msg: (valid) ? void 0 : "Mail address has invalid format!"
                };
            };
            App.prototype.isMailValid = function (value) {
                var valid = this.isNotEmpty(value, "Please fill in your mail address. So we can contact you with our reply.");
                if (!valid.valid) {
                    return valid;
                }
                return this.isMailFormatValid(value);
            };
            App.prototype.isNotEmpty = function (value, invalidMessage) {
                var valid = true;
                valid = value.length > 0;
                return {
                    valid: valid,
                    Msg: (valid) ? void 0 : invalidMessage
                };
            };
            App.prototype.isMessageValid = function (value) {
                return this.isNotEmpty(value, "Message cannot be empty!");
            };
            App.prototype.checkFormValid = function () {
                var mailValid = this.isMailValid($("#email").val()).valid;
                var messageValid = this.isMessageValid($("#message").val()).valid;
                if (!mailValid) {
                    $("#email").focus();
                    $("#message").focus();
                    $("#email").focus();
                }
                if (!messageValid) {
                    $("#message").focus();
                    $("#email").focus();
                    $("#message").focus();
                }
                return mailValid && messageValid;
            };
            App.prototype.render = function () {
                var _this = this;
                var session = this.state.session;
                var dialog = React.createElement("div", { className: "helpDialog form-horizontal " + ((this.state.dialogOpen) ? "visible" : "") },
                    React.createElement("div", { className: "description" },
                        "Something went wrong? Calculation results are not as expected?",
                        React.createElement("br", null),
                        React.createElement("br", null),
                        " Please send us a\u00A0message so we can help."),
                    React.createElement(TextBox, { label: "Session", value: session, id: "session", disabled: true }),
                    React.createElement(EmailTextBox, { label: "Email", id: "email", value: "@", isValid: this.isMailValid.bind(this) }),
                    React.createElement(TextAreaBox, { label: "Message", id: "message", isValid: this.isMessageValid.bind(this) }),
                    React.createElement("div", { className: "btn btn-primary submit", "data-loading-text": "Sending...", onClick: function () {
                            if ($(".helpDialog .submit").attr("disabled") === "disabled") {
                                return;
                            }
                            if (!_this.checkFormValid()) {
                                return;
                            }
                            $(".helpDialog .submit").button("loading");
                            var messageObject = {
                                ComputationId: _this.state.computationId,
                                SubmitId: _this.state.submitId,
                                From: $("#email").val(),
                                Msg: $("#message").val()
                            };
                            MoleOnlineWebUI.Service.MoleAPI.ApiService.submitFeedback(messageObject).then(function (val) {
                                if (val.Success) {
                                    MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                        messageType: "Success",
                                        message: (val.Msg === void 0 || val.Msg === null) ? "The message has been succesfully sent." : val.Msg
                                    });
                                    $("#email").val("@");
                                    $("#message").val("");
                                    var s = _this.state;
                                    s.dialogOpen = false;
                                    _this.setState(s);
                                }
                                else {
                                    var reason = ".";
                                    if (val.Msg !== void 0 && val.Msg !== null) {
                                        reason = ". Error message: '" + val.Msg + "'";
                                    }
                                    MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                        messageType: "Warning",
                                        message: "Application was unable to send your message" + reason + " Please try send it again later."
                                    });
                                }
                                $(".helpDialog .submit").button("reset");
                            }).catch(function (err) {
                                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                    messageType: "Warning",
                                    message: "Application was unable to send your message. Please try send it again later..."
                                });
                                $(".helpDialog .submit").button("reset");
                            });
                        } }, "Send"));
                return React.createElement("div", null,
                    React.createElement("div", { className: "button", onClick: function () {
                            var s = _this.state;
                            s.dialogOpen = !s.dialogOpen;
                            _this.setState(s);
                        } },
                        "Help ",
                        React.createElement("span", { className: "glyphicon glyphicon-question-sign help-ico" })),
                    dialog);
            };
            return App;
        }(React.Component));
        UI.App = App;
        var Events = (function () {
            function Events() {
            }
            Events.attachOnClearEventHandler = function (h) {
                this.handlers.push(h);
            };
            Events.invokeOnClear = function () {
                for (var _i = 0, _a = this.handlers; _i < _a.length; _i++) {
                    var h = _a[_i];
                    h();
                }
            };
            return Events;
        }());
        Events.handlers = [];
        var TextBox = (function (_super) {
            __extends(TextBox, _super);
            function TextBox() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    isValid: true
                };
                _this.typeClassName = "TextBox";
                return _this;
            }
            TextBox.prototype.componentDidMount = function () {
                var _this = this;
                Events.attachOnClearEventHandler((function () {
                    $("#" + _this.props.id).val("");
                    if (_this.props.onValueChange !== void 0) {
                        _this.props.onValueChange("");
                    }
                    _this.setState({
                        isValid: true,
                        errMsg: void 0
                    });
                }).bind(this));
            };
            TextBox.prototype.validate = function (value) {
                if (this.props.isValid === void 0) {
                    if (this.props.onValueChange !== void 0) {
                        this.props.onValueChange((value === null) ? "" : value);
                    }
                    return true;
                }
                var valid = this.props.isValid((value === null) ? "" : value);
                if (valid.valid && this.props.onValueChange !== void 0) {
                    this.props.onValueChange((value === null) ? "" : value);
                }
                var s = this.state;
                s.isValid = valid.valid;
                s.errMsg = valid.Msg;
                this.setState(s);
                return valid.valid;
            };
            TextBox.prototype.renderCustom = function () {
                return React.createElement("input", { disabled: this.props.disabled, type: "text", className: "form-control", id: "" + this.props.id, name: "" + this.props.name, placeholder: this.props.placeholder, defaultValue: this.props.value, onBlur: this.checkValid.bind(this), onSubmit: this.checkValid.bind(this), onChange: this.checkValid.bind(this) });
            };
            TextBox.prototype.renderError = function () {
                var errorPart;
                if (!this.state.isValid) {
                    errorPart = React.createElement("div", { className: "error-msg" }, (this.state.errMsg !== void 0) ? this.state.errMsg : MoleOnlineWebUI.StaticData.Bundle.get("validation-error-message-default"));
                }
                return errorPart;
            };
            TextBox.prototype.checkValid = function (e) {
                if (!this.validate($(e.currentTarget).val())) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.props.onInvalid !== void 0) {
                        this.props.onInvalid();
                    }
                }
            };
            TextBox.prototype.render = function () {
                var htmlPart = this.renderCustom();
                var errorPart = this.renderError();
                var label;
                if (this.props.label !== void 0) {
                    label = React.createElement("label", { className: "col-sm-1", htmlFor: "" + this.props.id },
                        this.props.label,
                        ":");
                }
                return React.createElement("div", { className: "custom-box " + this.typeClassName },
                    React.createElement("div", { className: "form-group" },
                        label,
                        React.createElement("div", { className: "col-sm-1" + ((label === void 0) ? 2 : 1) }, htmlPart)),
                    errorPart);
            };
            return TextBox;
        }(React.Component));
        var EmailTextBox = (function (_super) {
            __extends(EmailTextBox, _super);
            function EmailTextBox() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.typeClassName = "EmailBox";
                return _this;
            }
            EmailTextBox.prototype.renderError = function () {
                var errorPart;
                if (!this.state.isValid) {
                    errorPart = React.createElement("div", { className: "col-sm-offset-1 col-sm-11" },
                        React.createElement("div", { className: "error-msg" }, (this.state.errMsg !== void 0) ? this.state.errMsg : MoleOnlineWebUI.StaticData.Bundle.get("validation-error-message-default")));
                }
                return errorPart;
            };
            EmailTextBox.prototype.renderCustom = function () {
                var _this = this;
                return React.createElement("input", { disabled: this.props.disabled, type: "email", className: "form-control", id: "" + this.props.id, name: "" + this.props.name, placeholder: this.props.placeholder, defaultValue: this.props.value, onBlur: this.checkValid.bind(this), onChange: this.checkValid.bind(this), onSubmit: (function (e) {
                        _this.checkValid(e);
                    }).bind(this) });
            };
            return EmailTextBox;
        }(TextBox));
        var TextAreaBox = (function (_super) {
            __extends(TextAreaBox, _super);
            function TextAreaBox() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.typeClassName = "TextAreaBox";
                return _this;
            }
            TextAreaBox.prototype.renderCustom = function () {
                var _this = this;
                return React.createElement("textarea", { disabled: this.props.disabled, id: "" + this.props.id, className: "form-control", name: "" + this.props.name, placeholder: this.props.placeholder, defaultValue: this.props.value, onBlur: this.checkValid.bind(this), onChange: this.checkValid.bind(this), onSubmit: (function (e) {
                        _this.checkValid(e);
                    }).bind(this) });
            };
            return TextAreaBox;
        }(TextBox));
    })(UI = Help.UI || (Help.UI = {}));
})(Help || (Help = {}));
var SequenceViewer;
(function (SequenceViewer) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        ;
        function render(target, plugin) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, { controller: plugin }), target);
        }
        UI.render = render;
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    data: null,
                    minimized: false
                };
                return _this;
            }
            App.prototype.componentDidMount = function () {
                var _this = this;
                MoleOnlineWebUI.Bridge.Events.subscribeProteinDataLoaded(function (data) {
                    _this.setState({
                        data: data,
                        minimized: _this.state.minimized
                    });
                });
            };
            App.prototype.componentWillUnmount = function () {
            };
            App.prototype.render = function () {
                var _this = this;
                return React.createElement("div", { className: (this.state.minimized) ? "minimized" : "" },
                    React.createElement(Header, { onClick: function () {
                            var s = _this.state;
                            var newMinimized = !s.minimized;
                            s.minimized = newMinimized;
                            _this.setState(s);
                            MoleOnlineWebUI.Bridge.Events.invokeOnSequneceViewerToggle({ minimized: newMinimized });
                        } }),
                    React.createElement("div", { className: "seq-container" }, (this.state.data === null) ? React.createElement("div", { className: "seq-waiting-for-data" }, "Waiting for protein data...") : React.createElement(Sequence, { data: this.state.data })));
            };
            return App;
        }(React.Component));
        UI.App = App;
        var Header = (function (_super) {
            __extends(Header, _super);
            function Header() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Header.prototype.render = function () {
                return React.createElement("div", { className: "sequence-viewer-header", onClick: this.props.onClick },
                    "Protein Sequence ",
                    React.createElement("span", { className: "glyphicon glyphicon-resize-vertical" }));
            };
            return Header;
        }(React.Component));
        ;
        var Sequence = (function (_super) {
            __extends(Sequence, _super);
            function Sequence() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Sequence.prototype.groupByChains = function (data) {
                var groups = new Map();
                for (var chIdx = 0; chIdx < data.data.chains.count; chIdx++) {
                    var currentBounds = {
                        start: data.data.chains.residueStartIndex[chIdx],
                        end: data.data.chains.residueEndIndex[chIdx]
                    };
                    var currentName = data.data.chains.authAsymId[chIdx];
                    var bounds = groups.get(currentName);
                    if (bounds === void 0) {
                        bounds = [];
                    }
                    bounds.push(currentBounds);
                    groups.set(currentName, bounds);
                }
                return groups;
            };
            Sequence.prototype.getAllHETResiduesIdxes = function (data) {
                var rv = [];
                for (var idx = 0; idx < data.data.residues.count; idx++) {
                    if (data.data.residues.isHet[idx] === 1 && data.data.residues.authName[idx] !== "HOH") {
                        rv.push(idx);
                    }
                }
                return rv;
            };
            Sequence.prototype.render = function () {
                var _this = this;
                var chains = [];
                var chainGroups = this.groupByChains(this.props.data);
                chainGroups.forEach(function (val, key, map) {
                    chains.push(React.createElement(Chain, { chainName: key, chainBounds: val, data: _this.props.data }));
                });
                var hetResidues = this.getAllHETResiduesIdxes(this.props.data);
                if (hetResidues.length > 0) {
                    chains.push(React.createElement(HETChain, { idxes: hetResidues, data: this.props.data }));
                }
                return React.createElement("div", null, chains);
            };
            return Sequence;
        }(React.Component));
        var Chain = (function (_super) {
            __extends(Chain, _super);
            function Chain() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Chain.prototype.render = function () {
                var seqResidues = [];
                var lastSeqNumber = -1;
                for (var _i = 0, _a = this.props.chainBounds; _i < _a.length; _i++) {
                    var bounds = _a[_i];
                    var seqNumberShowCounter = 0;
                    for (var idx = bounds.start.valueOf(); idx < bounds.end.valueOf(); idx++) {
                        var residueName = this.props.data.data.residues.authName[idx];
                        var chainName = this.props.data.data.residues.authAsymId[idx];
                        var isHet = this.props.data.data.residues.isHet[idx] === 1;
                        if (residueName === "HOH" || isHet === true) {
                            continue;
                        }
                        var seqLetter = CommonUtils.Residues.getSequenceLetterByName(residueName);
                        var seqNumber = this.props.data.data.residues.authSeqNumber[idx];
                        var nextSeqNumber = (idx + 1 < bounds.end.valueOf()) ? this.props.data.data.residues.authSeqNumber[idx + 1] : -1;
                        var showSeqNumber = String(seqNumber) !== String(lastSeqNumber + 1);
                        var nextShowSeqNumber = String(nextSeqNumber) !== String(seqNumber.valueOf() + 1);
                        seqNumberShowCounter = (showSeqNumber) ? 0 : seqNumberShowCounter + 1;
                        if (seqNumberShowCounter % 20 === 0 && seqNumberShowCounter > 0 && !nextShowSeqNumber) {
                            showSeqNumber = true;
                            seqNumberShowCounter = 0;
                        }
                        lastSeqNumber = seqNumber.valueOf();
                        seqResidues.push(React.createElement(SeqResidue, { residueName: residueName, chainName: chainName, seqLetter: seqLetter, seqNumber: seqNumber, showSeqNumber: showSeqNumber, isHET: false }));
                    }
                }
                if (seqResidues.length === 0) {
                    return React.createElement("div", null);
                }
                return React.createElement("div", { className: "seq-chain" },
                    React.createElement("div", { className: "seq-header" },
                        "Chain ",
                        this.props.chainName),
                    React.createElement("div", { className: "seq-content" }, seqResidues));
            };
            return Chain;
        }(React.Component));
        var HETChain = (function (_super) {
            __extends(HETChain, _super);
            function HETChain() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            HETChain.prototype.render = function () {
                var seqResidues = [];
                var lastSeqNumber = -1;
                for (var idx = 0; idx < this.props.idxes.length; idx++) {
                    var residueName = this.props.data.data.residues.authName[this.props.idxes[idx]];
                    var chainName = this.props.data.data.residues.authAsymId[this.props.idxes[idx]];
                    var isHet = this.props.data.data.residues.isHet[this.props.idxes[idx]] === 1;
                    if (residueName === "HOH") {
                        continue;
                    }
                    var seqLetter = residueName;
                    var seqNumber = this.props.data.data.residues.authSeqNumber[this.props.idxes[idx]];
                    var showSeqNumber = String(seqNumber) !== String(lastSeqNumber + 1);
                    lastSeqNumber = seqNumber.valueOf();
                    seqResidues.push(React.createElement(SeqResidue, { residueName: residueName, chainName: chainName, seqLetter: seqLetter, seqNumber: seqNumber, showSeqNumber: showSeqNumber, isHET: true }));
                }
                if (seqResidues.length === 0) {
                    return React.createElement("div", null);
                }
                return React.createElement("div", { className: "seq-chain" },
                    React.createElement("div", { className: "seq-header" }, "HET"),
                    React.createElement("div", { className: "seq-content" }, seqResidues));
            };
            return HETChain;
        }(React.Component));
        var SeqResidue = (function (_super) {
            __extends(SeqResidue, _super);
            function SeqResidue() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = { selected: false };
                return _this;
            }
            SeqResidue.prototype.shouldComponentUpdate = function (nextProps, nextState) {
                if (nextState.selected !== this.state.selected) {
                    return true;
                }
                if ((nextProps.chainName !== this.props.chainName)
                    || (nextProps.isHET !== this.props.isHET)
                    || (nextProps.residueName !== this.props.residueName)
                    || (nextProps.seqLetter !== this.props.seqLetter)
                    || (nextProps.seqNumber !== this.props.seqNumber)
                    || (nextProps.showSeqNumber !== this.props.showSeqNumber)) {
                    return true;
                }
                return false;
            };
            SeqResidue.prototype.componentDidMount = function () {
                var _this = this;
                CommonUtils.Selection.SelectionHelper.attachOnClearSelectionHandler(function () {
                    if (_this.state.selected) {
                        _this.setState({ selected: false });
                    }
                });
                CommonUtils.Selection.SelectionHelper.attachOnResidueBulkSelectHandler(function (residues) {
                    var futureSelected = residues.some(function (val, idx, arr) {
                        return val.authSeqNumber === _this.props.seqNumber && val.chain.authAsymId === _this.props.chainName;
                    });
                    if (futureSelected !== _this.state.selected) {
                        _this.setState({
                            selected: futureSelected
                        });
                    }
                });
            };
            SeqResidue.prototype.render = function () {
                var _this = this;
                return React.createElement("div", { className: "seq-residue" + ((this.props.isHET) ? ' het' : '') },
                    React.createElement("div", { className: "seq-number" }, (this.props.showSeqNumber) ? this.props.seqNumber : ""),
                    React.createElement("div", { className: "seq-letter" + ((this.state.selected) ? " selected" : ""), onMouseDown: function (e) {
                            CommonUtils.Selection.SelectionHelper.addResidueToSelection(_this.props.seqNumber.valueOf(), _this.props.chainName.valueOf());
                        }, onMouseMove: function (e) {
                            highlightResiude(_this.props.seqNumber, _this.props.chainName.valueOf(), true);
                        }, onMouseOut: function (e) {
                            highlightResiude(_this.props.seqNumber, _this.props.chainName.valueOf(), false);
                        }, title: this.props.residueName + " " + this.props.chainName + " " + this.props.seqNumber }, this.props.seqLetter));
            };
            return SeqResidue;
        }(React.Component));
        function clearSelection() {
            var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            CommonUtils.Selection.SelectionHelper.clearSelection(plugin);
        }
        function highlightResiude(seqNumber, chain, isOn) {
            var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            var model = plugin.selectEntities("polymer-visual")[0];
            var query = LiteMol.Core.Structure.Query.residuesById(seqNumber.valueOf()).intersectWith(LiteMol.Core.Structure.Query.chainsById(chain));
            LiteMol.Bootstrap.Command.Molecule.Highlight.dispatch(plugin.context, { model: model, query: query, isOn: isOn });
        }
    })(UI = SequenceViewer.UI || (SequenceViewer.UI = {}));
})(SequenceViewer || (SequenceViewer = {}));
var Annotate;
(function (Annotate) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        var Bundle = MoleOnlineWebUI.StaticData.Bundle;
        function render(target) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, null), target);
        }
        UI.render = render;
        ;
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    annotationFormVisible: false,
                    computationId: void 0,
                    submitId: void 0
                };
                return _this;
            }
            App.prototype.changeParams = function (submitId) {
                var params = Common.Util.Router.getParameters();
                if (params !== null) {
                    this.setState({
                        computationId: params.computationId,
                        submitId: (submitId === void 0) ? params.submitId : submitId,
                        annotationFormVisible: this.state.annotationFormVisible
                    });
                }
            };
            App.prototype.componentDidMount = function () {
                var _this = this;
                this.changeParams();
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(function (submitId) {
                    _this.changeParams(submitId);
                });
            };
            App.prototype.componentWillUnmount = function () {
            };
            App.prototype.render = function () {
                var computationId = this.state.computationId;
                var submitId = this.state.submitId;
                if (computationId === void 0 || submitId === void 0) {
                    return React.createElement("div", null);
                }
                return React.createElement("div", null,
                    React.createElement(DropDownMenu, { app: this, canAnnotate: this.state.computationId !== void 0 && this.state.submitId !== void 0 }),
                    React.createElement(AnnotateForm, { app: this, visible: this.state.annotationFormVisible, computationId: computationId, submitId: submitId }));
            };
            return App;
        }(React.Component));
        UI.App = App;
        var BootstrapDropDownMenuItem = (function (_super) {
            __extends(BootstrapDropDownMenuItem, _super);
            function BootstrapDropDownMenuItem() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            BootstrapDropDownMenuItem.prototype.render = function () {
                if (this.props.onClick !== void 0) {
                    return (React.createElement("li", null,
                        React.createElement("a", { onClick: this.props.onClick }, this.props.linkText)));
                }
                else {
                    return (React.createElement("li", null,
                        React.createElement("a", { target: (this.props.targetBlank) ? "_blank" : "", href: this.props.link }, this.props.linkText)));
                }
            };
            return BootstrapDropDownMenuItem;
        }(React.Component));
        var BootstrapDropDownMenuElementItem = (function (_super) {
            __extends(BootstrapDropDownMenuElementItem, _super);
            function BootstrapDropDownMenuElementItem() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            BootstrapDropDownMenuElementItem.prototype.render = function () {
                if (this.props.onClick !== void 0) {
                    return (React.createElement("li", null,
                        React.createElement("a", { onClick: this.props.onClick }, this.props.linkElement)));
                }
                else {
                    return (React.createElement("li", null,
                        React.createElement("a", { target: (this.props.targetBlank) ? "_blank" : "", href: this.props.link }, this.props.linkElement)));
                }
            };
            return BootstrapDropDownMenuElementItem;
        }(React.Component));
        var BootstrapDropDownMenuButton = (function (_super) {
            __extends(BootstrapDropDownMenuButton, _super);
            function BootstrapDropDownMenuButton() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            BootstrapDropDownMenuButton.prototype.render = function () {
                return React.createElement("div", { className: "btn-group dropdown" },
                    React.createElement("button", { type: "button", disabled: this.props.items.length == 0, className: "channelsdb dropdown-toggle", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false" },
                        React.createElement("img", { src: "/images/ChannelsDBlogo_transparent.png" })),
                    React.createElement("ul", { className: "dropdown-menu" }, this.props.items));
            };
            return BootstrapDropDownMenuButton;
        }(React.Component));
        var DropDownMenu = (function (_super) {
            __extends(DropDownMenu, _super);
            function DropDownMenu() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = { computationId: "", hasChannelsDBSubmission: false, pdbid: null };
                return _this;
            }
            DropDownMenu.prototype.componentDidMount = function () {
                var _this = this;
                var params = Common.Util.Router.getParameters();
                if (params !== null) {
                    var computationId = params.computationId;
                    var s = this.state;
                    s.computationId = computationId;
                    this.setState(s);
                    MoleOnlineWebUI.DataProxy.ComputationInfo.DataProvider.get(computationId, function (compid, info) {
                        var s1 = _this.state;
                        if (info.PdbId !== void 0 && info.PdbId !== null && info.PdbId !== "") {
                            s1.hasChannelsDBSubmission = true;
                            s1.pdbid = info.PdbId;
                        }
                        else {
                            s1.hasChannelsDBSubmission = false;
                        }
                        _this.setState(s1);
                    });
                }
            };
            DropDownMenu.prototype.render = function () {
                var _this = this;
                var computationId = this.state.computationId;
                var items = [];
                if (computationId !== void 0) {
                    if (this.state.hasChannelsDBSubmission) {
                        if (this.state.pdbid !== null) {
                            var channelsDBLink = Config.CommonOptions.CHANNELSDB_LINK_DETAIL_URL + "/" + this.state.pdbid;
                            items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "Open in ChannelsDB", link: channelsDBLink, targetBlank: true }));
                        }
                        items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "Vizualize", onClick: function () {
                                Common.Util.Router.fakeRedirect(computationId, "ChannelsDB");
                                LiteMol.Example.Channels.State.removeChannelsData(MoleOnlineWebUI.Bridge.Instances.getPlugin());
                                MoleOnlineWebUI.Bridge.Events.invokeChangeSubmitId(-1);
                            } }));
                    }
                    if (this.props.canAnnotate) {
                        items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "Annotate", onClick: function () {
                                var s = _this.props.app.state;
                                s.annotationFormVisible = !s.annotationFormVisible;
                                _this.props.app.setState(s);
                            } }));
                    }
                }
                return React.createElement(BootstrapDropDownMenuButton, { items: items });
            };
            return DropDownMenu;
        }(React.Component));
        var Events = (function () {
            function Events() {
            }
            Events.attachOnClearEventHandler = function (h) {
                this.handlers.push(h);
            };
            Events.invokeOnClear = function () {
                for (var _i = 0, _a = this.handlers; _i < _a.length; _i++) {
                    var h = _a[_i];
                    h();
                }
            };
            return Events;
        }());
        Events.handlers = [];
        var AnnotateForm = (function (_super) {
            __extends(AnnotateForm, _super);
            function AnnotateForm() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    data: null,
                    mailValid: true,
                    errorMsg: void 0,
                    infoMsg: void 0
                };
                return _this;
            }
            AnnotateForm.prototype.componentDidMount = function () {
                this.resetData();
            };
            AnnotateForm.prototype.getDefaultWorkingItem = function () {
                return {
                    CompId: this.props.computationId,
                    SubmitId: this.props.submitId,
                    Email: "",
                    Message: "",
                    ResidueAnnotations: [],
                    TunnelAnnotations: []
                };
            };
            AnnotateForm.prototype.resetData = function () {
                var s = this.state;
                s.data = this.getDefaultWorkingItem();
                this.setState(s);
            };
            AnnotateForm.prototype.componentWillReceiveProps = function (newProps) {
                if (this.props.visible != newProps.visible) {
                    this.resetData();
                }
            };
            AnnotateForm.prototype.canSubmit = function () {
                var data = this.state.data;
                if (data === null) {
                    return false;
                }
                if (data.ResidueAnnotations.length === 0 && data.TunnelAnnotations.length === 0) {
                    return false;
                }
                if (!this.state.mailValid) {
                    return false;
                }
                return true;
            };
            AnnotateForm.prototype.submit = function (formEvent) {
                var _this = this;
                var data = this.state.data;
                if (data === null) {
                    var s1 = this.state;
                    s1.errorMsg = "There are no data to be sent. Please fill in the form below before submission.";
                    this.setState(s1);
                    return;
                }
                if (!this.canSubmit()) {
                    var s1 = this.state;
                    s1.errorMsg = "The form is incomplete!. Please fill in the form below before submission.";
                    this.setState(s1);
                    return;
                }
                MoleOnlineWebUI.Service.AnnotationToChannelsDBService.ApiService.sendAnnotation(data).then(function (value) {
                    if (value.Status === "OK") {
                        var s2 = _this.state;
                        s2.infoMsg = value.Msg;
                        s2.errorMsg = void 0;
                        s2.data = _this.getDefaultWorkingItem();
                        _this.setState(s2);
                        Events.invokeOnClear();
                    }
                    else {
                        var s = _this.state;
                        s.errorMsg = value.Msg;
                        s.infoMsg = void 0;
                        _this.setState(s);
                    }
                })
                    .catch(function (err) {
                    var s = _this.state;
                    s.errorMsg = "Application was unable to submit your annotatons to ChannelsDB. Error message: " + err;
                    _this.setState(s);
                });
                return true;
            };
            AnnotateForm.prototype.updateCurrentElement = function (value, setter) {
                if (this.state.data === null) {
                    return;
                }
                var newCwi = setter(this.state.data, value);
                var s = this.state;
                s.data = newCwi;
                this.setState(s);
            };
            AnnotateForm.prototype.updateCurrentElementEmail = function (email) {
                this.updateCurrentElement(email, function (pto, val) {
                    pto.Email = val;
                    return pto;
                });
            };
            AnnotateForm.prototype.updateCurrentElementMessage = function (message) {
                this.updateCurrentElement(message, function (pto, val) {
                    pto.Message = val;
                    return pto;
                });
            };
            AnnotateForm.prototype.render = function () {
                var _this = this;
                var infoMsg;
                if (this.state.infoMsg !== void 0) {
                    infoMsg = React.createElement("div", { className: "error-message alert-success" }, this.state.infoMsg);
                }
                var errorMsg;
                if (this.state.errorMsg !== void 0) {
                    errorMsg = React.createElement("div", { className: "error-message alert-danger" }, this.state.errorMsg);
                }
                var data = this.state.data;
                var isMailValidOrBlank = function (value) {
                    var valid = true;
                    if (value !== "") {
                        valid = RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/).test(value);
                    }
                    return {
                        valid: valid,
                        Msg: (valid) ? void 0 : "Mail address has invalid format!"
                    };
                };
                var items = [];
                if (data !== null) {
                    items.push(React.createElement("input", { type: "hidden", name: "CompId", value: data.CompId }));
                    items.push(React.createElement("input", { type: "hidden", name: "SubmitId", value: data.SubmitId }));
                    items.push(React.createElement(EmailTextBox, { id: "AnnotateFormEmail", name: "Email", label: "Email", onValueChange: (function (e) {
                            _this.updateCurrentElementEmail(e);
                            var s = _this.state;
                            s.mailValid = true;
                            _this.setState(s);
                        }).bind(this), value: data.Email, isValid: isMailValidOrBlank, onInvalid: (function () {
                            _this.updateCurrentElementEmail("");
                            var s = _this.state;
                            s.mailValid = false;
                            _this.setState(s);
                        }).bind(this), placeholder: Bundle.get("placeholder-annotate-email") }));
                    items.push(React.createElement(TextAreaBox, { id: "AnnotateFormMessage", name: "Message", label: "Message", onValueChange: this.updateCurrentElementMessage.bind(this), value: data.Message, placeholder: Bundle.get("placeholder-annotate-message") }));
                    items.push(React.createElement(TunnelAnnotations, { form: this, items: data.TunnelAnnotations }));
                    items.push(React.createElement(ResidueAnnotations, { form: this, items: data.ResidueAnnotations }));
                }
                return React.createElement("div", null,
                    React.createElement("div", { className: "annotate-form-fade " + ((this.props.visible) ? "visible" : '') }),
                    React.createElement("div", { className: "annotate-form" + ((this.props.visible) ? "" : " hidden") },
                        infoMsg,
                        errorMsg,
                        React.createElement("div", { className: "scroll-container" },
                            React.createElement("div", { className: "annotate-form-header" },
                                React.createElement("img", { src: "/images/ChannelsDBlogo.png" }),
                                React.createElement("p", null, "Submit annotation of your published channels and residues important for channel's functionality to make your results interactively available to everyone at any time. Additionally, results of your research will be visible along the structure at Protein Data Bank in Europe webpages.")),
                            React.createElement("form", { className: "form-horizontal", onSubmit: function (e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    _this.submit(e);
                                } },
                                items,
                                React.createElement("div", { className: "buttons" },
                                    React.createElement("input", { type: "submit", className: "btn btn-primary", value: "Submit to ChannelsDB", disabled: !this.canSubmit() })),
                                React.createElement("div", { title: "Close", className: "btn btn-link close-button glyphicon glyphicon-remove", onClick: function (e) {
                                        //Reset form data
                                        var sLocal = _this.state;
                                        sLocal.data = _this.getDefaultWorkingItem();
                                        sLocal.errorMsg = void 0;
                                        sLocal.infoMsg = void 0;
                                        _this.setState(sLocal);
                                        Events.invokeOnClear();
                                        var s = _this.props.app.state;
                                        s.annotationFormVisible = false;
                                        _this.props.app.setState(s);
                                    } })))));
            };
            return AnnotateForm;
        }(React.Component));
        var TextBox = (function (_super) {
            __extends(TextBox, _super);
            function TextBox() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    isValid: true
                };
                _this.typeClassName = "TextBox";
                return _this;
            }
            TextBox.prototype.componentDidMount = function () {
                var _this = this;
                Events.attachOnClearEventHandler((function () {
                    $("#" + _this.props.id).val("");
                    if (_this.props.onValueChange !== void 0) {
                        _this.props.onValueChange("");
                    }
                    _this.setState({
                        isValid: true,
                        errMsg: void 0
                    });
                }).bind(this));
            };
            TextBox.prototype.validate = function (value) {
                if (this.props.isValid === void 0) {
                    if (this.props.onValueChange !== void 0) {
                        this.props.onValueChange((value === null) ? "" : value);
                    }
                    return true;
                }
                var valid = this.props.isValid((value === null) ? "" : value);
                if (valid.valid && this.props.onValueChange !== void 0) {
                    this.props.onValueChange((value === null) ? "" : value);
                }
                var s = this.state;
                s.isValid = valid.valid;
                s.errMsg = valid.Msg;
                this.setState(s);
                return valid.valid;
            };
            TextBox.prototype.renderCustom = function () {
                return React.createElement("input", { type: "text", className: "form-control", id: "" + this.props.id, name: "" + this.props.name, placeholder: this.props.placeholder, defaultValue: this.props.value, onBlur: this.checkValid.bind(this), onSubmit: this.checkValid.bind(this), onChange: this.checkValid.bind(this) });
            };
            TextBox.prototype.renderError = function () {
                var errorPart;
                if (!this.state.isValid) {
                    errorPart = React.createElement("div", { className: "error-msg" }, (this.state.errMsg !== void 0) ? this.state.errMsg : MoleOnlineWebUI.StaticData.Bundle.get("validation-error-message-default"));
                }
                return errorPart;
            };
            TextBox.prototype.checkValid = function (e) {
                if (!this.validate($(e.currentTarget).val())) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.props.onInvalid !== void 0) {
                        this.props.onInvalid();
                    }
                }
            };
            TextBox.prototype.render = function () {
                var htmlPart = this.renderCustom();
                var errorPart = this.renderError();
                var label;
                if (this.props.label !== void 0) {
                    label = React.createElement("label", { className: "col-sm-1", htmlFor: "" + this.props.id },
                        this.props.label,
                        ":");
                }
                return React.createElement("div", { className: "custom-box " + this.typeClassName },
                    React.createElement("div", { className: "form-group" },
                        label,
                        React.createElement("div", { className: "col-sm-1" + ((label === void 0) ? 2 : 1) }, htmlPart)),
                    errorPart);
            };
            return TextBox;
        }(React.Component));
        var EmailTextBox = (function (_super) {
            __extends(EmailTextBox, _super);
            function EmailTextBox() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.typeClassName = "EmailBox";
                return _this;
            }
            EmailTextBox.prototype.renderError = function () {
                var errorPart;
                if (!this.state.isValid) {
                    errorPart = React.createElement("div", { className: "col-sm-offset-1 col-sm-11" },
                        React.createElement("div", { className: "error-msg" }, (this.state.errMsg !== void 0) ? this.state.errMsg : MoleOnlineWebUI.StaticData.Bundle.get("validation-error-message-default")));
                }
                return errorPart;
            };
            EmailTextBox.prototype.renderCustom = function () {
                var _this = this;
                return React.createElement("input", { type: "email", className: "form-control", id: "" + this.props.id, name: "" + this.props.name, placeholder: this.props.placeholder, defaultValue: this.props.value, onBlur: this.checkValid.bind(this), onChange: this.checkValid.bind(this), onSubmit: (function (e) {
                        _this.checkValid(e);
                    }).bind(this) });
            };
            return EmailTextBox;
        }(TextBox));
        var TextAreaBox = (function (_super) {
            __extends(TextAreaBox, _super);
            function TextAreaBox() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.typeClassName = "TextAreaBox";
                return _this;
            }
            TextAreaBox.prototype.renderCustom = function () {
                var _this = this;
                return React.createElement("textarea", { id: "" + this.props.id, className: "form-control", name: "" + this.props.name, placeholder: this.props.placeholder, defaultValue: this.props.value, onBlur: this.checkValid.bind(this), onChange: this.checkValid.bind(this), onSubmit: (function (e) {
                        _this.checkValid(e);
                    }).bind(this) });
            };
            return TextAreaBox;
        }(TextBox));
        var TunnelAnnotations = (function (_super) {
            __extends(TunnelAnnotations, _super);
            function TunnelAnnotations() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    tunnelData: [],
                    currentWorkingItem: _this.getDefaultWorkingItem()
                };
                _this.tunnelNameCache = null;
                return _this;
            }
            TunnelAnnotations.prototype.getTunnelNameById = function (tunnelId) {
                var tunneData = this.state.tunnelData;
                if (tunneData.length === 0) {
                    return "X";
                }
                if (this.tunnelNameCache === null) {
                    var mapping = new Map();
                    for (var _i = 0, tunneData_1 = tunneData; _i < tunneData_1.length; _i++) {
                        var tunnel = tunneData_1[_i];
                        var name_4 = CommonUtils.Tunnels.getName(tunnel);
                        if (name_4 === void 0) {
                            continue;
                        }
                        mapping.set(tunnel.Id, name_4);
                    }
                    this.tunnelNameCache = mapping;
                }
                return this.tunnelNameCache.get(tunnelId);
            };
            TunnelAnnotations.prototype.remove = function (key) {
                var data = this.props.form.state.data;
                if (data === null) {
                    return;
                }
                var newAnnotations = [];
                for (var _i = 0, _a = data.TunnelAnnotations; _i < _a.length; _i++) {
                    var item = _a[_i];
                    if (key === this.getRowHash(item)) {
                        continue;
                    }
                    newAnnotations.push(item);
                }
                data.TunnelAnnotations = newAnnotations;
                var s = this.props.form.state;
                s.data = data;
                this.props.form.setState(s);
            };
            TunnelAnnotations.prototype.componentDidMount = function () {
                var _this = this;
                Events.attachOnClearEventHandler((function () {
                    _this.clear();
                }).bind(this));
                MoleOnlineWebUI.Bridge.Events.subscribeChannelDataLoaded((function (data) {
                    var tunnelData = [];
                    var moleChannels = data.Channels;
                    tunnelData = CommonUtils.Tunnels.concatTunnelsSafe(tunnelData, moleChannels.Tunnels);
                    tunnelData = CommonUtils.Tunnels.concatTunnelsSafe(tunnelData, moleChannels.Paths);
                    tunnelData = CommonUtils.Tunnels.concatTunnelsSafe(tunnelData, moleChannels.Pores);
                    tunnelData = CommonUtils.Tunnels.concatTunnelsSafe(tunnelData, moleChannels.MergedPores);
                    if (tunnelData.length === 0) {
                        return;
                    }
                    var s = _this.state;
                    s.tunnelData = tunnelData;
                    _this.tunnelNameCache = null;
                    _this.setState(s);
                }).bind(this));
            };
            TunnelAnnotations.prototype.generateTunnelMetadata = function () {
                var rv = [];
                if (this.state === void 0) {
                    return rv;
                }
                for (var _i = 0, _a = this.state.tunnelData; _i < _a.length; _i++) {
                    var item = _a[_i];
                    var tunnelLabel = CommonUtils.Tunnels.getName(item);
                    rv.push({
                        value: item.Id,
                        label: (tunnelLabel === void 0) ? "X" : tunnelLabel
                    });
                }
                return rv;
            };
            TunnelAnnotations.prototype.canAddCurrentWorkingItem = function () {
                if (this.state.currentWorkingItem.Id.length === 0) {
                    return false;
                }
                if (this.state.currentWorkingItem.Name.length === 0) {
                    return false;
                }
                if (this.state.currentWorkingItem.Reference.length === 0) {
                    return false;
                }
                if (this.state.currentWorkingItem.ReferenceType.length === 0) {
                    return false;
                }
                return true;
            };
            TunnelAnnotations.prototype.updateCurrentElement = function (value, setter) {
                var newCwi = setter(this.state.currentWorkingItem, value);
                var s = this.state;
                this.setState({
                    tunnelData: s.tunnelData,
                    currentWorkingItem: newCwi
                });
            };
            TunnelAnnotations.prototype.updateCurrentElementTunnelId = function (tunnelId) {
                this.updateCurrentElement(tunnelId, function (pto, val) {
                    pto.Id = val;
                    return pto;
                });
            };
            TunnelAnnotations.prototype.updateCurrentElementReferenceType = function (referenceType) {
                this.updateCurrentElement(referenceType, function (pto, val) {
                    pto.ReferenceType = val;
                    return pto;
                });
            };
            TunnelAnnotations.prototype.updateCurrentElementReference = function (reference) {
                this.updateCurrentElement(reference, function (pto, val) {
                    pto.Reference = val;
                    return pto;
                });
            };
            TunnelAnnotations.prototype.updateCurrentElementName = function (name) {
                this.updateCurrentElement(name, function (pto, val) {
                    pto.Name = val;
                    return pto;
                });
            };
            TunnelAnnotations.prototype.updateCurrentElementDescription = function (description) {
                this.updateCurrentElement(description, function (pto, val) {
                    pto.Description = val;
                    return pto;
                });
            };
            TunnelAnnotations.prototype.clear = function () {
                var dwi = this.getDefaultWorkingItem();
                var elements = [
                    { id: "TunnelIdCombobox", value: dwi.Id },
                    { id: "ChannelName", value: dwi.Name },
                    { id: "ChannelDescription", value: dwi.Description },
                    { id: "ChannelReference", value: dwi.Reference },
                    { id: "ReferenceTypeCombobox", value: dwi.ReferenceType }
                ];
                for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
                    var el = elements_1[_i];
                    $("#" + el.id).val(el.value);
                }
                var s = this.state;
                s.currentWorkingItem = dwi;
                this.setState(s);
            };
            TunnelAnnotations.prototype.getDefaultWorkingItem = function () {
                var tunnels = this.generateTunnelMetadata();
                return {
                    Id: (tunnels.length > 0) ? tunnels[0].value : "",
                    Name: "",
                    Description: "",
                    Reference: "",
                    ReferenceType: "DOI"
                };
            };
            TunnelAnnotations.prototype.generateControlRow = function () {
                var _this = this;
                var tunnelMetadata = this.generateTunnelMetadata();
                var notEmpty = function (value) {
                    var valid = value !== void 0 && value !== null && value.length > 0;
                    return {
                        valid: valid,
                        Msg: (valid) ? void 0 : MoleOnlineWebUI.StaticData.Bundle.get("validation-error-message-not-empty")
                    };
                };
                var cwi = this.state.currentWorkingItem;
                return React.createElement("tr", null,
                    React.createElement("td", null,
                        React.createElement(Combobox, { id: "TunnelIdCombobox", onValueChange: this.updateCurrentElementTunnelId.bind(this), items: tunnelMetadata, value: (cwi.Id === "") ? void 0 : cwi.Id })),
                    React.createElement("td", null,
                        React.createElement(TextBox, { id: "ChannelName", placeholder: "Name of the channel", onInvalid: (function () { _this.updateCurrentElementName(""); }).bind(this), onValueChange: this.updateCurrentElementName.bind(this), isValid: notEmpty.bind(this), value: cwi.Name })),
                    React.createElement("td", null,
                        React.createElement(TextBox, { id: "ChannelDescription", placeholder: "Description of channel function", onInvalid: (function () { _this.updateCurrentElementDescription(""); }).bind(this), onValueChange: this.updateCurrentElementDescription.bind(this), value: cwi.Description })),
                    React.createElement("td", null,
                        React.createElement(TextBox, { id: "ChannelReference", placeholder: "DOI or Pubmed ID", onInvalid: (function () { _this.updateCurrentElementReference(""); }).bind(this), onValueChange: this.updateCurrentElementReference.bind(this), isValid: notEmpty.bind(this), value: cwi.Reference })),
                    React.createElement("td", null,
                        React.createElement(Combobox, { id: "ReferenceTypeCombobox", items: [{ value: "DOI", label: "DOI" }, { value: "Pubmed", label: "Pubmed" }], onValueChange: this.updateCurrentElementReferenceType.bind(this), value: (cwi.ReferenceType === "") ? void 0 : cwi.ReferenceType })),
                    React.createElement("td", null,
                        React.createElement("div", { className: "btn btn-success glyphicon glyphicon-plus" + ((this.canAddCurrentWorkingItem()) ? '' : ' disabled'), onClick: (function (e) {
                                if ($(e.currentTarget).hasClass("disabled")) {
                                    return;
                                }
                                var data = _this.props.form.state.data;
                                if (data !== null && _this.state.currentWorkingItem !== null) {
                                    var tunnelAnnotations = data.TunnelAnnotations;
                                    tunnelAnnotations.push(_this.state.currentWorkingItem);
                                    var s = _this.props.form.state;
                                    if (s.data !== null) {
                                        s.data.TunnelAnnotations = tunnelAnnotations;
                                        _this.props.form.setState(s);
                                        _this.clear();
                                    }
                                }
                            }).bind(this) })));
            };
            TunnelAnnotations.prototype.getRowHash = function (item) {
                return item.Id + "&&" + item.Name + "&&" + item.Description + "&&" + item.Reference + "&&" + item.ReferenceType;
            };
            TunnelAnnotations.prototype.generateInfoRow = function (item) {
                var _this = this;
                var tunneld = item.Id;
                var onClick = function (e) {
                    var hash = e.currentTarget.dataset["key"];
                    if (hash === void 0) {
                        return;
                    }
                    _this.remove(hash);
                };
                var tunnelName = this.getTunnelNameById(tunneld);
                return React.createElement("tr", null,
                    React.createElement("td", null, (tunnelName !== void 0) ? tunnelName : tunneld),
                    React.createElement("td", null, item.Name),
                    React.createElement("td", null, item.Description),
                    React.createElement("td", null, item.Reference),
                    React.createElement("td", null, item.ReferenceType),
                    React.createElement("td", null,
                        React.createElement("div", { className: "btn btn-danger glyphicon glyphicon-remove", "data-key": this.getRowHash(item), onClick: onClick.bind(this) })));
            };
            TunnelAnnotations.prototype.render = function () {
                var body = [];
                body.push(this.generateControlRow());
                for (var _i = 0, _a = this.props.items; _i < _a.length; _i++) {
                    var item = _a[_i];
                    body.push(this.generateInfoRow(item));
                }
                return React.createElement("div", { className: "channel-annotations table-responsive" },
                    React.createElement("h2", null, "Channel Annotations"),
                    React.createElement("table", { className: "table table-bordered table-striped table-condensed" },
                        React.createElement("thead", null,
                            React.createElement("tr", null,
                                React.createElement("th", null, "Id"),
                                React.createElement("th", null, "Name"),
                                React.createElement("th", null, "Description"),
                                React.createElement("th", null, "Reference"),
                                React.createElement("th", null, "Reference Type"),
                                React.createElement("th", null))),
                        React.createElement("tbody", null, body)));
            };
            return TunnelAnnotations;
        }(React.Component));
        var Combobox = (function (_super) {
            __extends(Combobox, _super);
            function Combobox() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {};
                return _this;
            }
            Combobox.prototype.reportCurrentValueChange = function (value) {
                if (this.props.onValueChange !== void 0) {
                    if (value !== void 0) {
                        this.props.onValueChange(value);
                    }
                    else if (this.props.items.length > 0) {
                        this.props.onValueChange(this.props.items[0].value);
                    }
                }
            };
            Combobox.prototype.componentDidMount = function () {
                this.reportCurrentValueChange();
            };
            Combobox.prototype.itemsChanged = function (newItems) {
                if (newItems.length !== this.props.items.length) {
                    return true;
                }
                for (var i = 0; i < this.props.items.length; i++) {
                    if (this.props.items[i].value !== newItems[i].value) {
                        return true;
                    }
                }
                return false;
            };
            Combobox.prototype.componentWillReceiveProps = function (nextProps) {
                if (this.props.value !== nextProps.value) {
                    this.reportCurrentValueChange(nextProps.value);
                }
                else if (this.itemsChanged(nextProps.items)) {
                    var value = "";
                    if (nextProps.items.length > 0) {
                        value = nextProps.items[0].value;
                    }
                    this.reportCurrentValueChange(value);
                }
            };
            Combobox.prototype.generateInnerElements = function (items) {
                var rv = [];
                for (var i = 0; i < items.length; i++) {
                    rv.push(React.createElement("option", { value: items[i].value }, items[i].label));
                }
                return rv;
            };
            Combobox.prototype.render = function () {
                var _this = this;
                var items = this.generateInnerElements(this.props.items);
                var label = this.props.label;
                var errorPart;
                return React.createElement("div", { className: "custom-box combobox" },
                    React.createElement("div", { className: "form-group" },
                        label,
                        React.createElement("div", { className: "col-sm-1" + ((label === void 0) ? 2 : 1) },
                            React.createElement("select", { className: "form-control", id: "" + this.props.id, defaultValue: this.props.value, onChange: (function (e) {
                                    if (_this.props.onValueChange !== void 0) {
                                        _this.props.onValueChange(e.currentTarget.options[e.currentTarget.selectedIndex].value);
                                    }
                                }).bind(this) }, items))),
                    errorPart);
            };
            return Combobox;
        }(React.Component));
        var ResidueAnnotations = (function (_super) {
            __extends(ResidueAnnotations, _super);
            function ResidueAnnotations() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    currentWorkingItem: _this.getDefaultWorkingItem()
                };
                return _this;
            }
            ResidueAnnotations.prototype.getDefaultWorkingItem = function () {
                return {
                    Id: "",
                    Chain: "",
                    Text: "",
                    Reference: "",
                    ReferenceType: "DOI"
                };
            };
            ResidueAnnotations.prototype.remove = function (key) {
                var data = this.props.form.state.data;
                if (data === null) {
                    return;
                }
                var newAnnotations = [];
                for (var _i = 0, _a = data.ResidueAnnotations; _i < _a.length; _i++) {
                    var item = _a[_i];
                    if (key === this.getRowHash(item)) {
                        continue;
                    }
                    newAnnotations.push(item);
                }
                data.ResidueAnnotations = newAnnotations;
                var s = this.props.form.state;
                s.data = data;
                this.props.form.setState(s);
            };
            ResidueAnnotations.prototype.componentDidMount = function () {
                var _this = this;
                Events.attachOnClearEventHandler((function () {
                    _this.clear();
                }).bind(this));
            };
            ResidueAnnotations.prototype.canAddCurrentWorkingItem = function () {
                if (this.state.currentWorkingItem.Id.length === 0) {
                    return false;
                }
                if (this.state.currentWorkingItem.Chain.length === 0) {
                    return false;
                }
                if (this.state.currentWorkingItem.Text.length === 0) {
                    return false;
                }
                if (this.state.currentWorkingItem.Reference.length === 0) {
                    return false;
                }
                if (this.state.currentWorkingItem.ReferenceType.length === 0) {
                    return false;
                }
                return true;
            };
            ResidueAnnotations.prototype.updateCurrentElement = function (value, setter) {
                var newCwi = setter(this.state.currentWorkingItem, value);
                this.setState({
                    currentWorkingItem: newCwi
                });
            };
            ResidueAnnotations.prototype.updateCurrentElementIdAndChain = function (residueId) {
                var residues = parseResidues(residueId);
                if (residues.length !== 1) {
                    this.updateCurrentElement("", function (pto, val) {
                        pto.Id = "";
                        pto.Chain = "";
                        return pto;
                    });
                    return;
                }
                this.updateCurrentElement(residues[0], function (pto, val) {
                    pto.Id = val.SequenceNumber;
                    pto.Chain = val.Chain;
                    return pto;
                });
            };
            ResidueAnnotations.prototype.updateCurrentElementReferenceType = function (referenceType) {
                this.updateCurrentElement(referenceType, function (pto, val) {
                    pto.ReferenceType = val;
                    return pto;
                });
            };
            ResidueAnnotations.prototype.updateCurrentElementReference = function (reference) {
                this.updateCurrentElement(reference, function (pto, val) {
                    pto.Reference = val;
                    return pto;
                });
            };
            ResidueAnnotations.prototype.updateCurrentElementText = function (text) {
                this.updateCurrentElement(text, function (pto, val) {
                    pto.Text = val;
                    return pto;
                });
            };
            ResidueAnnotations.prototype.clear = function () {
                var dwi = this.getDefaultWorkingItem();
                var idAndChain = dwi.Id + " " + dwi.Chain;
                if (idAndChain === " ") {
                    idAndChain = "";
                }
                var elements = [
                    { id: "ResidueId", value: idAndChain },
                    { id: "ResidueText", value: dwi.Text },
                    { id: "ResidueReference", value: dwi.Reference },
                    { id: "ResidueReferenceTypeCombobox", value: dwi.ReferenceType }
                ];
                for (var _i = 0, elements_2 = elements; _i < elements_2.length; _i++) {
                    var el = elements_2[_i];
                    $("#" + el.id).val(el.value);
                }
                var s = this.state;
                s.currentWorkingItem = dwi;
                this.setState(s);
            };
            ResidueAnnotations.prototype.generateControlRow = function () {
                var _this = this;
                var notEmpty = function (value) {
                    var valid = value !== void 0 && value !== null && value.length > 0;
                    return {
                        valid: valid,
                        Msg: (valid) ? void 0 : MoleOnlineWebUI.StaticData.Bundle.get("validation-error-message-not-empty")
                    };
                };
                var isResidue = function (value) {
                    if (value.length === 0) {
                        return {
                            valid: false,
                            Msg: MoleOnlineWebUI.StaticData.Bundle.get("validation-error-message-not-empty")
                        };
                    }
                    var valid = parseResidues(value).length === 1;
                    return {
                        valid: valid,
                        Msg: (!valid) ? MoleOnlineWebUI.StaticData.Bundle.get("validation-error-message-residue-invalid-format") : void 0
                    };
                };
                var cwi = this.state.currentWorkingItem;
                var idAndChain = cwi.Id + " " + cwi.Chain;
                return React.createElement("tr", null,
                    React.createElement("td", null,
                        React.createElement(TextBox, { id: "ResidueId", placeholder: "142 A", onInvalid: (function () { _this.updateCurrentElementIdAndChain(""); }).bind(this), onValueChange: this.updateCurrentElementIdAndChain.bind(this), isValid: isResidue.bind(this), value: (idAndChain === " ") ? void 0 : idAndChain })),
                    React.createElement("td", null,
                        React.createElement(TextBox, { id: "ResidueText", placeholder: "Annotation of residue function", onInvalid: (function () { _this.updateCurrentElementText(""); }).bind(this), onValueChange: this.updateCurrentElementText.bind(this), isValid: notEmpty.bind(this), value: cwi.Text })),
                    React.createElement("td", null,
                        React.createElement(TextBox, { id: "ResidueReference", placeholder: "DOI or Pubmed ID", onInvalid: (function () { return _this.updateCurrentElementReference(""); }).bind(this), onValueChange: this.updateCurrentElementReference.bind(this), isValid: notEmpty.bind(this), value: cwi.Reference })),
                    React.createElement("td", null,
                        React.createElement(Combobox, { id: "ResidueReferenceTypeCombobox", items: [{ value: "DOI", label: "DOI" }, { value: "Pubmed", label: "Pubmed" }], onValueChange: this.updateCurrentElementReferenceType.bind(this), value: (cwi.ReferenceType === "") ? void 0 : cwi.ReferenceType })),
                    React.createElement("td", null,
                        React.createElement("div", { className: "btn btn-success glyphicon glyphicon-plus" + ((this.canAddCurrentWorkingItem()) ? '' : ' disabled'), onClick: function (e) {
                                if ($(e.currentTarget).hasClass("disabled")) {
                                    return;
                                }
                                var data = _this.props.form.state.data;
                                if (data !== null && _this.state.currentWorkingItem !== null) {
                                    var residueAnnotations = data.ResidueAnnotations;
                                    residueAnnotations.push(_this.state.currentWorkingItem);
                                    var s = _this.props.form.state;
                                    if (s.data !== null) {
                                        s.data.ResidueAnnotations = residueAnnotations;
                                        _this.props.form.setState(s);
                                        _this.clear();
                                    }
                                }
                            } })));
            };
            ResidueAnnotations.prototype.generateInfoRow = function (item) {
                var _this = this;
                var residueId = item.Id;
                return React.createElement("tr", null,
                    React.createElement("td", null, item.Id + ' ' + item.Chain),
                    React.createElement("td", null, item.Text),
                    React.createElement("td", null, item.Reference),
                    React.createElement("td", null, item.ReferenceType),
                    React.createElement("td", null,
                        React.createElement("div", { className: "btn btn-danger glyphicon glyphicon-remove", "data-key": this.getRowHash(item), onClick: (function (e) {
                                var hash = e.currentTarget.dataset["key"];
                                if (hash === void 0) {
                                    return;
                                }
                                _this.remove(hash);
                            }).bind(this) })));
            };
            ResidueAnnotations.prototype.getRowHash = function (item) {
                return item.Id + "&&" + item.Chain + "&&" + item.Text + "&&" + item.Reference + "&&" + item.ReferenceType;
            };
            ResidueAnnotations.prototype.render = function () {
                var body = [];
                body.push(this.generateControlRow());
                for (var _i = 0, _a = this.props.items; _i < _a.length; _i++) {
                    var item = _a[_i];
                    body.push(this.generateInfoRow(item));
                }
                return React.createElement("div", { className: "residue-annotations table-responsive" },
                    React.createElement("h2", null, "Residue Annotations"),
                    React.createElement("table", { className: "table table-bordered table-striped table-condensed" },
                        React.createElement("thead", null,
                            React.createElement("tr", null,
                                React.createElement("th", null, "Id"),
                                React.createElement("th", null, "Text"),
                                React.createElement("th", null, "Reference"),
                                React.createElement("th", null, "Reference Type"),
                                React.createElement("th", null))),
                        React.createElement("tbody", null, body)));
            };
            return ResidueAnnotations;
        }(React.Component));
        function parseResidues(residues) {
            if (residues === void 0) {
                return [];
            }
            residues = residues.replace(/\s*,\s*/g, ",");
            var items = residues.split(',');
            var rv = [];
            var seqNumReg = new RegExp(/^[0-9]+$/);
            var chainReg = new RegExp(/^\D+\S*$/);
            for (var _i = 0, items_3 = items; _i < items_3.length; _i++) {
                var item = items_3[_i];
                var r = item.split(' ');
                if (r.length > 2) {
                    continue;
                }
                var seqNum = void 0;
                var chain = void 0;
                for (var _a = 0, r_2 = r; _a < r_2.length; _a++) {
                    var part = r_2[_a];
                    if (seqNumReg.test(part)) {
                        seqNum = Number(part);
                        continue;
                    }
                    if (chainReg.test(part)) {
                        chain = part;
                        continue;
                    }
                }
                if (chain !== void 0 && seqNum !== void 0) {
                    rv.push({
                        Chain: chain,
                        SequenceNumber: seqNum
                    });
                }
            }
            return rv;
        }
    })(UI = Annotate.UI || (Annotate.UI = {}));
})(Annotate || (Annotate = {}));
var QuickHelp;
(function (QuickHelp) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        ;
        function render(target) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, null), target);
        }
        UI.render = render;
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    app: _this,
                    channelSelected: false,
                    hasSubmissions: false,
                    fromPDBID: false,
                    hasChannels: false
                };
                return _this;
            }
            App.prototype.componentDidMount = function () {
                var _this = this;
                var channelSelected = CommonUtils.Selection.SelectionHelper.isSelectedAnyChannel();
                if (channelSelected !== this.state.channelSelected) {
                    var s = this.state;
                    s.channelSelected = channelSelected;
                    this.setState(s);
                }
                CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(function () {
                    var state = _this.state;
                    state.channelSelected = false;
                    _this.setState(state);
                });
                CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler(function (data) {
                    var state = _this.state;
                    state.channelSelected = true;
                    _this.setState(state);
                });
                var params = Common.Util.Router.getParameters();
                if (params !== null) {
                    MoleOnlineWebUI.DataProxy.ComputationInfo.DataProvider.subscribe(params.computationId, function (compid, info) {
                        var s1 = _this.state;
                        if (info.PdbId === null || info.PdbId === void 0 || info.PdbId === "") {
                            s1.fromPDBID = false;
                        }
                        else {
                            s1.fromPDBID = true;
                        }
                        if (info.Submissions.length > 0) {
                            s1.hasSubmissions = true;
                        }
                        else {
                            s1.hasSubmissions = false;
                        }
                        if (MoleOnlineWebUI.Cache.TunnelName.getCachedItemsCount() > 0) {
                            s1.hasChannels = true;
                        }
                        else {
                            s1.hasChannels = false;
                        }
                        _this.setState(s1);
                    });
                    MoleOnlineWebUI.Bridge.Events.subscribeChannelDataLoaded(function (data) {
                        var channelsData = data.Channels;
                        var tunnels = [];
                        tunnels = CommonUtils.Tunnels.concatTunnelsSafe(tunnels, channelsData.MergedPores);
                        tunnels = CommonUtils.Tunnels.concatTunnelsSafe(tunnels, channelsData.Paths);
                        tunnels = CommonUtils.Tunnels.concatTunnelsSafe(tunnels, channelsData.Pores);
                        tunnels = CommonUtils.Tunnels.concatTunnelsSafe(tunnels, channelsData.Tunnels);
                        var s2 = _this.state;
                        s2.hasChannels = tunnels.length > 0;
                        _this.setState(s2);
                    });
                }
            };
            App.prototype.componentWillUnmount = function () {
            };
            App.prototype.render = function () {
                var hints = [];
                if (!this.state.hasSubmissions) {
                    hints.push(React.createElement("div", null,
                        React.createElement("b", null, "How to start? Try this:"),
                        React.createElement("ul", null,
                            React.createElement("li", null, "For automatic start just press Submit button"),
                            React.createElement("li", null,
                                "Or select specific ",
                                React.createElement("b", null, "Start or End points"),
                                React.createElement("ul", null,
                                    React.createElement("li", null,
                                        "by ",
                                        React.createElement("b", null, "XYZ"),
                                        " coordinate or ",
                                        React.createElement("b", null, "residue"),
                                        " selection in 3D or from sequence,"),
                                    React.createElement("li", null,
                                        "or try to use the Catalytic Active Sites from ",
                                        React.createElement("b", null, "CSA"),
                                        " or ",
                                        React.createElement("b", null, "cofactors"),
                                        " (Panel ",
                                        React.createElement("b", null, "Selection"),
                                        "),"),
                                    React.createElement("li", null,
                                        "or use facet selection on ",
                                        React.createElement("b", null, "Surface"),
                                        " in 3D viewer using Ctrl+left mouse click,"),
                                    React.createElement("li", null,
                                        "Or in the structure from precomputed ",
                                        React.createElement("b", null, "Origin"),
                                        " points,")),
                                "and press Submit button."),
                            React.createElement("li", null,
                                "For transmembrane pores switch to ",
                                React.createElement("b", null, "Pore mode"))),
                        React.createElement("b", null, "To calculate transmembrane pore:"),
                        React.createElement("ul", null,
                            React.createElement("li", null,
                                "If you want only transmembrane part of pore - use ",
                                React.createElement("b", null, "Membrane region"),
                                " parameter"),
                            React.createElement("li", null,
                                "If structure is beta-sheet transmembrane porin - use ",
                                React.createElement("b", null, "Beta structure"),
                                " parameter"),
                            React.createElement("li", null,
                                "Press ",
                                React.createElement("b", null, "Submit button")),
                            React.createElement("li", null,
                                "For channels and other types of pores switch to ",
                                React.createElement("b", null, "Channel mode")))));
                }
                else {
                    if (this.state.hasChannels) {
                        hints.push(React.createElement("div", null,
                            React.createElement("b", null, "To see channel results:"),
                            React.createElement("ul", null,
                                React.createElement("li", null,
                                    "You can:",
                                    React.createElement("ul", null,
                                        React.createElement("li", null,
                                            "Pick one of available channels either in ",
                                            React.createElement("b", null, "list of channels"),
                                            " or ",
                                            React.createElement("b", null, "in 3D view"),
                                            " window to see ",
                                            React.createElement("b", null, "Channel profile"),
                                            " with mapped physicochemical properties and residues associated with tunnel ",
                                            React.createElement("b", null, "layers"),
                                            " or ",
                                            React.createElement("b", null, "lining residues"),
                                            " of selected tunnel."),
                                        React.createElement("li", null,
                                            "See summary of properties of all available channels upon switch to ",
                                            React.createElement("b", null, "Channels properties"),
                                            " tab in bottom-left part of screen."))),
                                React.createElement("li", null,
                                    "Try to compare your data with channels from ",
                                    React.createElement("a", { target: "_blank", href: "http://ncbr.muni.cz/ChannelsDB/" }, "ChannelsDB"),
                                    "\u00A0- click on ",
                                    React.createElement("b", null, "#ChDB"),
                                    " submission located on ",
                                    React.createElement("b", null, "Submission tab"),
                                    " in the bottom right side of the screen."))));
                    }
                    else {
                        hints.push(React.createElement("div", null,
                            React.createElement("b", null, "No channels were computed \u2013 Tips:"),
                            React.createElement("ul", null,
                                React.createElement("li", null,
                                    "Switch on the box - ",
                                    React.createElement("b", null, "Ignore HETATMs"),
                                    " (discard all the heteroatom from the channel computation)."),
                                React.createElement("li", null,
                                    "Set the ",
                                    React.createElement("b", null, "lower value of Interior Threshold"),
                                    " to work with channels with almost closed bottlenecks (in Cavity parameters; e.g. from 1.5 to 0.7)"),
                                React.createElement("li", null,
                                    "Set the ",
                                    React.createElement("b", null, "higher value of Probe Radius"),
                                    " to detect larger channels which are otherwise taken as parts of the surface (in Cavity parameters; e.g. from 5 to 20)"),
                                React.createElement("li", null,
                                    "Change the starting and end points",
                                    React.createElement("ul", null,
                                        React.createElement("li", null,
                                            "try to use the ",
                                            React.createElement("b", null, "Active Sites from CSA"),
                                            " or ",
                                            React.createElement("b", null, "cofactors"),
                                            "(Panel Selection)"),
                                        React.createElement("li", null,
                                            "Or choose your own exact point by setting the exact values of ",
                                            React.createElement("b", null, "XYZ"),
                                            " coordinates"),
                                        React.createElement("li", null, "or choose end point on surface with Ctrl + left mouse click"))),
                                React.createElement("li", null,
                                    "Press ",
                                    React.createElement("b", null, "Submit button")))));
                    }
                }
                hints.push(React.createElement("div", null,
                    "For more information see ",
                    React.createElement("a", { target: "blank", href: "/documentation/" }, "documentation page"),
                    "."));
                return React.createElement("div", null,
                    React.createElement("h3", null, "Quick help"),
                    hints);
            };
            return App;
        }(React.Component));
        UI.App = App;
    })(UI = QuickHelp.UI || (QuickHelp.UI = {}));
})(QuickHelp || (QuickHelp = {}));
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
            var Behaviour;
            (function (Behaviour) {
                var Interactivity = LiteMol.Bootstrap.Interactivity;
                var Vec3 = LiteMol.Core.Geometry.LinearAlgebra.Vector3;
                var ColorScheme = MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme;
                Behaviour.CavityTheme = {
                    inner: LiteMol.Visualization.Theme.createUniform({
                        colors: LiteMol.Core.Utils.FastMap.ofArray([['Uniform', ColorScheme.Colors.get(ColorScheme.Enum.CavityInner)]]),
                        transparency: { alpha: 0.33 }
                    }),
                    boundary: LiteMol.Visualization.Theme.createUniform({
                        colors: LiteMol.Core.Utils.FastMap.ofArray([['Uniform', ColorScheme.Colors.get(ColorScheme.Enum.CavityBoundary)]]),
                        transparency: { alpha: 0.66 }
                    }),
                    selectableBoundary: LiteMol.Visualization.Theme.createUniform({
                        colors: LiteMol.Core.Utils.FastMap.ofArray([['Uniform', ColorScheme.Colors.get(ColorScheme.Enum.CavitySelectable)]]),
                        transparency: { alpha: 1.0 }
                    })
                };
                function getTriangleCenter(_a, tI) {
                    var vs = _a.vertices, ts = _a.triangleIndices;
                    var c = Vec3.zero();
                    for (var i = 0; i < 3; i++) {
                        var v = 3 * tI + i;
                        Vec3.add(c, c, Vec3(vs[3 * v], vs[3 * v + 1], vs[3 * v + 2]));
                    }
                    return Vec3.scale(c, c, 1 / 3);
                }
                Behaviour.getTriangleCenter = getTriangleCenter;
                function vec3str(v) {
                    return "(" + v[0].toFixed(2) + ", " + v[1].toFixed(2) + ", " + v[2].toFixed(2) + ")";
                }
                Behaviour.vec3str = vec3str;
                function createSelectEvent(plugin) {
                    return plugin.context.behaviours.click.map(function (info) {
                        if (!info || Interactivity.isEmpty(info)) {
                            return { kind: 'nothing' };
                        }
                        if (info.source.type === LiteMol.Bootstrap.Entity.Visual.Surface) {
                            var tag = info.source.props.tag;
                            if (!tag || tag.kind !== 'Cavity-boundary')
                                return { kind: 'nothing' };
                            return { kind: 'point', data: getTriangleCenter(tag.surface, info.elements[0]) };
                        }
                        else if (Interactivity.Molecule.isMoleculeModelInteractivity(info)) {
                            return { kind: 'molecule', data: Interactivity.Molecule.transformInteraction(info) };
                        }
                        return { kind: 'nothing' };
                    });
                }
                Behaviour.createSelectEvent = createSelectEvent;
                function initCavityBoundaryToggle(plugin) {
                    var boundaries = LiteMol.Bootstrap.Tree.Selection
                        .byRef('mole-data')
                        .subtree()
                        .ofType(LiteMol.Bootstrap.Entity.Visual.Surface)
                        .filter(function (n) { return n.props.tag && n.props.tag.kind === 'Cavity-boundary'; });
                    var getModels = function () { return plugin.selectEntities(boundaries).map(function (e) { return e.props.model; }); };
                    var ctrlPressed = false;
                    window.addEventListener('keydown', function (e) {
                        if (ctrlPressed || !e.ctrlKey)
                            return;
                        ctrlPressed = true;
                        getModels().forEach(function (m) { return m.applyTheme(Behaviour.CavityTheme.selectableBoundary); });
                    });
                    window.addEventListener('keyup', function (e) {
                        if (ctrlPressed && !e.ctrlKey) {
                            ctrlPressed = false;
                            getModels().forEach(function (m) { return m.applyTheme(Behaviour.CavityTheme.boundary); });
                        }
                    });
                }
                Behaviour.initCavityBoundaryToggle = initCavityBoundaryToggle;
            })(Behaviour = Channels.Behaviour || (Channels.Behaviour = {}));
        })(Channels = Example.Channels || (Example.Channels = {}));
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
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
            var State;
            (function (State) {
                var _this = this;
                var ApiService = MoleOnlineWebUI.Service.MoleAPI.ApiService;
                var Tree = LiteMol.Bootstrap.Tree;
                var Transformer = LiteMol.Bootstrap.Entity.Transformer;
                var ColorScheme = MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme;
                function showDefaultVisuals(plugin, data) {
                    return new LiteMol.Promise(function (res) {
                        var toShow = [];
                        //-- MoleOnline
                        if (data.MergedPores && data.MergedPores.length > 0) {
                            toShow = data.MergedPores;
                        }
                        else if (data.Paths && data.Paths.length > 0) {
                            toShow = data.Paths;
                        }
                        else if (data.Pores && data.Pores.length > 0) {
                            toShow = data.Pores;
                        }
                        else if (data.Tunnels && data.Tunnels.length > 0) {
                            toShow = data.Tunnels;
                        }
                        else if (data.ReviewedChannels && data.ReviewedChannels.length > 0) {
                            toShow = data.ReviewedChannels;
                        }
                        else if (data.CSATunnels && data.CSATunnels.length > 0) {
                            toShow = data.CSATunnels;
                        }
                        else if (data.TransmembranePores && data.TransmembranePores.length > 0) {
                            toShow = data.TransmembranePores;
                        }
                        else if (data.ReviewedChannels && data.ReviewedChannels.length > 0) {
                            toShow = data.ReviewedChannels;
                        }
                        return showChannelVisuals(plugin, toShow.slice(0, 5), true).then(function () {
                            if (data.Cavities === void 0) {
                                res();
                                return;
                            }
                            var cavity = data.Cavities.Cavities[0];
                            if (!cavity) {
                                res();
                                return;
                            }
                            showCavityVisuals(plugin, [cavity], true).then(function () { return res(); });
                        });
                    });
                }
                function getNodeFromTree(root, ref) {
                    if (root.ref === ref) {
                        return root;
                    }
                    for (var _a = 0, _b = root.children; _a < _b.length; _a++) {
                        var c = _b[_a];
                        var n = getNodeFromTree(c, ref);
                        if (n !== null) {
                            return n;
                        }
                    }
                    return null;
                }
                function removeChannelsData(plugin) {
                    removeNodeFromTree(plugin, 'mole-data-object');
                }
                State.removeChannelsData = removeChannelsData;
                function removeMembraneData(plugin) {
                    removeNodeFromTree(plugin, 'membrane-object');
                }
                State.removeMembraneData = removeMembraneData;
                function removeNodeFromTree(plugin, nodeRef) {
                    var obj = getNodeFromTree(plugin.root, nodeRef);
                    if (obj !== null) {
                        Tree.remove(obj);
                    }
                }
                ;
                function residuesToPoints(plugin, residueOrigins) {
                    var points = [];
                    for (var _a = 0, residueOrigins_1 = residueOrigins; _a < residueOrigins_1.length; _a++) {
                        var origin = residueOrigins_1[_a];
                        var centerOfMass = CommonUtils.Residues.getCenterOfMass(origin);
                        if (centerOfMass === null) {
                            continue;
                        }
                        points.push(centerOfMass);
                    }
                    return JSON.stringify({
                        Origins: {
                            CSAOrigins: {
                                Points: points,
                                Type: "CSA Origins"
                            }
                        }
                    });
                }
                function createCSAOriginsData(plugin, computationId) {
                    return new LiteMol.Promise(function (res, rej) {
                        MoleOnlineWebUI.DataProxy.CSAResidues.DataProvider.get(computationId, function (compId, info) {
                            var originsData = residuesToPoints(plugin, info);
                            var csaOrigins = plugin.createTransform().add(plugin.root, Transformer.Data.FromData, { data: originsData, id: 'CSA Origins' }, { isHidden: true, ref: 'csa-origins-object' })
                                .then(Transformer.Data.ParseJson, { id: 'Origins' }, { isHidden: true, ref: 'csa-origins' });
                            plugin.applyTransform(csaOrigins)
                                .then(function () {
                                res();
                            })
                                .catch(function (error) {
                                rej(error);
                            });
                        });
                    });
                }
                function generateGuid(tunnels) {
                    for (var idx = 0; idx < tunnels.length; idx++) {
                        tunnels[idx].GUID = LiteMol.Bootstrap.Utils.generateUUID();
                    }
                    return tunnels;
                }
                function generateGuidMole(moleData) {
                    moleData.Channels.MergedPores = generateGuid(moleData.Channels.MergedPores);
                    moleData.Channels.Paths = generateGuid(moleData.Channels.Paths);
                    moleData.Channels.Pores = generateGuid(moleData.Channels.Pores);
                    moleData.Channels.Tunnels = generateGuid(moleData.Channels.Tunnels);
                    return moleData;
                }
                function generateGuidChannelsDB(moleData) {
                    moleData.Channels.CofactorTunnels = generateGuid(moleData.Channels.CofactorTunnels);
                    moleData.Channels.CSATunnels = generateGuid(moleData.Channels.CSATunnels);
                    moleData.Channels.ReviewedChannels = generateGuid(moleData.Channels.ReviewedChannels);
                    moleData.Channels.TransmembranePores = generateGuid(moleData.Channels.TransmembranePores);
                    return moleData;
                }
                function downloadMembraneData(plugin, computationId) {
                    removeMembraneData(plugin);
                    return new LiteMol.Promise(function (res, rej) {
                        ApiService.getMembraneData(computationId).then(function (data) {
                            var membrane = plugin.createTransform().add(plugin.root, Transformer.Data.FromData, { data: JSON.stringify(data), id: 'Membrane' }, { isHidden: true, ref: 'membrane-object' })
                                .then(Transformer.Data.ParseJson, { id: 'MembraneObjects' }, { ref: 'membrane-data', isHidden: true });
                            plugin.applyTransform(membrane)
                                .then(function () {
                                var membraneData = plugin.context.select('membrane-data')[0];
                                showMembraneVisuals(plugin, membraneData.props.data, true).then(function (val) {
                                    res();
                                }).catch(function (err) {
                                    rej(err);
                                });
                            });
                        }).catch(function (err) {
                            console.log("Membrane data not available!");
                            console.log(err);
                            res();
                        });
                    }).then(function () {
                        MoleOnlineWebUI.Bridge.Events.invokeOnMembraneDataReady();
                    });
                }
                function downloadChannelsData(plugin, computationId, submitId) {
                    removeChannelsData(plugin);
                    return new LiteMol.Promise(function (res, rej) {
                        ApiService.getChannelsData(computationId, submitId).then(function (data) {
                            var channels = plugin.createTransform().add(plugin.root, Transformer.Data.FromData, { data: data, id: 'Computation Results' }, { isHidden: true, ref: 'mole-data-object' })
                                .then(Transformer.Data.ParseJson, { id: 'Objects' }, { ref: 'mole-data', isHidden: true });
                            plugin.applyTransform(channels)
                                .then(function () {
                                var parsedData = plugin.context.select('mole-data')[0];
                                if (!parsedData) {
                                    rej('Data not available.');
                                }
                                else {
                                    var data_ = parsedData.props.data;
                                    data_ = generateGuidMole(data_);
                                    MoleOnlineWebUI.Cache.TunnelName.reload(data_);
                                    MoleOnlineWebUI.Bridge.Events.invokeChannelDataLoaded(data_);
                                    showDefaultVisuals(plugin, data_.Channels)
                                        .then(function () {
                                        res();
                                    });
                                }
                            })
                                .catch(function (error) { return rej(error); });
                        })
                            .catch(function (err) { return rej(err); });
                    });
                }
                function downloadChannelsDBData(plugin, computationId) {
                    removeChannelsData(plugin);
                    return new LiteMol.Promise(function (res, rej) {
                        ApiService.getComputationInfoList(computationId).then(function (val) {
                            if (val.PdbId !== null) {
                                MoleOnlineWebUI.Cache.ChannelsDBData.getChannelsData(val.PdbId).then(function (data) {
                                    var channels = plugin.createTransform().add(plugin.root, Transformer.Data.FromData, { data: JSON.stringify({ Channels: data }), id: 'Computation Results' }, { isHidden: false, ref: 'mole-data-object' })
                                        .then(Transformer.Data.ParseJson, { id: 'Objects' }, { ref: 'mole-data', isHidden: false });
                                    plugin.applyTransform(channels)
                                        .then(function () {
                                        var parsedData = plugin.context.select('mole-data')[0];
                                        if (!parsedData) {
                                            rej('Data not available.');
                                        }
                                        else {
                                            var data_ = parsedData.props.data;
                                            data_ = generateGuidChannelsDB(data_);
                                            MoleOnlineWebUI.Bridge.Events.invokeChannelDataLoaded(data_);
                                            showDefaultVisuals(plugin, data_.Channels)
                                                .then(function () {
                                                res();
                                            }).catch(function (err) { return console.log(err); });
                                        }
                                    })
                                        .catch(function (error) { return rej(error); });
                                }).catch(function (err) { return rej(err); });
                            }
                        }).catch(function (err) { return rej(err); });
                    });
                }
                function downloadProteinData(plugin, computationId, submitId) {
                    return new LiteMol.Promise(function (res, rej) {
                        ApiService.getProteinStructure(computationId, submitId).then(function (data) {
                            var format = LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF;
                            if (data.filename !== null) {
                                var filename = data.filename.replace(".gz", "");
                                var f = LiteMol.Core.Formats.FormatInfo.getFormat(filename, LiteMol.Core.Formats.Molecule.SupportedFormats.All);
                                if (f !== void 0) {
                                    format = f;
                                }
                            }
                            var protein = plugin.createTransform()
                                .add(plugin.root, Transformer.Data.FromData, { data: data.data, id: computationId + "/" + submitId }, { isBinding: true, ref: 'protein-data' })
                                .then(Transformer.Molecule.CreateFromData, { format: format }, { isBinding: true })
                                .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
                                .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true });
                            plugin.applyTransform(protein)
                                .then(function () {
                                var polymerVisual = plugin.context.select('polymer-visual');
                                if (polymerVisual.length !== 1) {
                                    rej("Application was unable to retrieve protein structure from coordinate server.");
                                }
                                else {
                                    plugin.command(LiteMol.Bootstrap.Command.Entity.Focus, polymerVisual);
                                    res();
                                    MoleOnlineWebUI.Bridge.Events.invokeProteinDataLoaded(polymerVisual[0].props.model.model);
                                }
                            })
                                .catch(function (error) {
                                console.log(error);
                                rej(error);
                            });
                        })
                            .catch(function (error) {
                            console.log(error);
                            rej(error);
                        });
                    });
                }
                function loadData(plugin, channelsDB) {
                    //plugin.clear();
                    if (Config.CommonOptions.DEBUG_MODE)
                        console.profile("loadData");
                    var modelLoadPromise = new LiteMol.Promise(function (res, rej) {
                        var parameters = Common.Util.Router.getParameters();
                        if (parameters === null) {
                            rej("Corrupted url found - cannot parse parameters.");
                            return;
                        }
                        var computationId = parameters.computationId;
                        var submitId = parameters.submitId;
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log("Status watcher - BEFORE EXEC");
                        MoleOnlineWebUI.DataProxy.JobStatus.Watcher.registerOnChangeHandler(computationId, submitId, (function (status) {
                            if (Config.CommonOptions.DEBUG_MODE)
                                console.log("Watcher iteration");
                            var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                            var proteinLoaded = existsRefInTree(plugin.root, 'protein-data');
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
                            if (status.Status === "Initializing" || status.Status === "Running") {
                                //Do Nothing
                                if (Config.CommonOptions.DEBUG_MODE)
                                    console.log("Waiting for status change");
                            }
                            else if (status.Status === "Initialized") {
                                acquireData(computationId, submitId, plugin, res, rej, !proteinLoaded, submitId == 0, channelsDB); //TODO podminka pro prenacteni kanalu pro submit 0
                            }
                            else if (status.Status === "FailedInitialization" || status.Status === "Error" || status.Status === "Deleted" || status.Status === "Aborted") {
                                rej(status.ErrorMsg);
                            }
                            else if (status.Status === "Finished") {
                                acquireData(computationId, submitId, plugin, res, rej, !proteinLoaded, true, channelsDB);
                            }
                        }), function (err) { return rej(err); });
                    });
                    var promises = [];
                    promises.push(modelLoadPromise);
                    return LiteMol.Promise.all(promises);
                }
                State.loadData = loadData;
                function existsRefInTree(root, ref) {
                    if (root.ref === ref) {
                        return true;
                    }
                    for (var _a = 0, _b = root.children; _a < _b.length; _a++) {
                        var c = _b[_a];
                        if (existsRefInTree(c, ref)) {
                            return true;
                        }
                    }
                    return false;
                }
                function acquireData(computationId, submitId, plugin, res, rej, protein, channels, channelsDB) {
                    var promises = [];
                    if (protein) {
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log("reloading protein structure");
                        var proteinAndCSA = new LiteMol.Promise(function (res, rej) {
                            downloadProteinData(plugin, computationId, submitId)
                                .then(function () {
                                var csaOriginsExists = existsRefInTree(plugin.root, 'csa-origins');
                                if (!csaOriginsExists) {
                                    if (Config.CommonOptions.DEBUG_MODE)
                                        console.log("reloading CSA Origins");
                                    createCSAOriginsData(plugin, computationId)
                                        .then(function () { return res(); })
                                        .catch(function (err) { return rej(err); });
                                }
                                else {
                                    res();
                                }
                            })
                                .catch(function (err) { return rej(err); });
                        });
                        promises.push(proteinAndCSA);
                    }
                    if (channels && !channelsDB) {
                        //Download and show membrane data if available
                        promises.push(downloadMembraneData(plugin, computationId));
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log("reloading channels");
                        promises.push(downloadChannelsData(plugin, computationId, submitId));
                    }
                    if (channelsDB) {
                        promises.push(downloadChannelsDBData(plugin, computationId));
                    }
                    LiteMol.Promise.all(promises)
                        .then(function () {
                        res();
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.profileEnd();
                    })
                        .catch(function (error) {
                        console.log(error);
                        rej(error);
                    });
                }
                function createSurface(mesh) {
                    // wrap the vertices in typed arrays
                    if (!(mesh.Vertices instanceof Float32Array)) {
                        mesh.Vertices = new Float32Array(mesh.Vertices);
                    }
                    if (!(mesh.Vertices instanceof Uint32Array)) {
                        mesh.Triangles = new Uint32Array(mesh.Triangles);
                    }
                    var surface = {
                        vertices: mesh.Vertices,
                        vertexCount: (mesh.Vertices.length / 3) | 0,
                        triangleIndices: new Uint32Array(mesh.Triangles),
                        triangleCount: (mesh.Triangles.length / 3) | 0,
                    };
                    return surface;
                }
                function createTriangleSurface(mesh) {
                    var triangleCount = (mesh.Triangles.length / 3) | 0;
                    var vertexCount = triangleCount * 3;
                    var srcV = mesh.Vertices;
                    var srcT = mesh.Triangles;
                    var vertices = new Float32Array(vertexCount * 3);
                    var triangleIndices = new Uint32Array(triangleCount * 3);
                    var annotation = new Int32Array(vertexCount);
                    var tri = [0, 0, 0];
                    for (var i = 0, _i = mesh.Triangles.length; i < _i; i += 3) {
                        tri[0] = srcT[i];
                        tri[1] = srcT[i + 1];
                        tri[2] = srcT[i + 2];
                        for (var j = 0; j < 3; j++) {
                            var v = i + j;
                            vertices[3 * v] = srcV[3 * tri[j]];
                            vertices[3 * v + 1] = srcV[3 * tri[j] + 1];
                            vertices[3 * v + 2] = srcV[3 * tri[j] + 2];
                            triangleIndices[i + j] = i + j;
                        }
                    }
                    for (var i = 0; i < triangleCount; i++) {
                        for (var j = 0; j < 3; j++)
                            annotation[3 * i + j] = i;
                    }
                    var surface = {
                        vertices: vertices,
                        vertexCount: vertexCount,
                        triangleIndices: triangleIndices,
                        triangleCount: triangleCount,
                        annotation: annotation
                    };
                    return surface;
                }
                function createTunnelSurface(sphereArray) {
                    var s = LiteMol.Visualization.Primitive.Builder.create();
                    var id = 0;
                    var idxFilter = 1;
                    var idxCounter = 0;
                    for (var _a = 0, sphereArray_1 = sphereArray; _a < sphereArray_1.length; _a++) {
                        var sphere = sphereArray_1[_a];
                        idxCounter++;
                        if ((idxCounter - 1) % idxFilter !== 0) {
                            continue;
                        }
                        s.add({ type: 'Sphere', id: 0, radius: sphere.Radius, center: [sphere.X, sphere.Y, sphere.Z], tessalation: 2 });
                    }
                    return s.buildSurface().run();
                }
                function getSurfaceColorByType(type) {
                    switch (type) {
                        /*
                        case 'Cavity': return ColorScheme.Colors.get(ColorScheme.Enum.Cavity);
                        case 'MolecularSurface': return ColorScheme.Colors.get(ColorScheme.Enum.Surface);
                        case 'Void': return ColorScheme.Colors.get(ColorScheme.Enum.Void);
                        */
                        default: return ColorScheme.Colors.get(ColorScheme.Enum.DefaultColor);
                    }
                }
                function showSurfaceVisuals(plugin, elements, visible, type, label, alpha) {
                    var t = plugin.createTransform();
                    var needsApply = false;
                    for (var _a = 0, elements_3 = elements; _a < elements_3.length; _a++) {
                        var element = elements_3[_a];
                        if (!element.__id)
                            element.__id = LiteMol.Bootstrap.Utils.generateUUID();
                        if (!!element.__isVisible === visible)
                            continue;
                        element.__isVisible = visible;
                        if (!element.__color) {
                            element.__color = getSurfaceColorByType(element.Type);
                        }
                        if (!visible) {
                            plugin.command(LiteMol.Bootstrap.Command.Tree.RemoveNode, element.__id);
                        }
                        else if (type === "Cavity" && (!!element.Mesh.Boundary || !!element.Mesh.Inner)) {
                            var boundarySurface = createTriangleSurface(element.Mesh.Boundary);
                            var group = t.add('mole-data', Transformer.Basic.CreateGroup, {}, { ref: element.__id, isHidden: true });
                            group.then(Transformer.Basic.CreateSurfaceVisual, {
                                label: label(element),
                                tag: { kind: 'Cavity-boundary', element: element, surface: boundarySurface },
                                surface: boundarySurface,
                                theme: Channels.Behaviour.CavityTheme.boundary
                            });
                            group.then(Transformer.Basic.CreateSurfaceVisual, {
                                label: label(element),
                                tag: { kind: 'Cavity-inner', element: element },
                                surface: createSurface(element.Mesh.Inner),
                                theme: Channels.Behaviour.CavityTheme.inner
                            });
                            needsApply = true;
                        }
                        else {
                            var surface = createSurface(element.Mesh);
                            t.add('mole-data', State.CreateSurface, {
                                label: label(element),
                                tag: { kind: type, element: element },
                                surface: surface,
                                color: element.__color,
                                isInteractive: true,
                                transparency: { alpha: alpha }
                            }, { ref: element.__id, isHidden: true });
                            needsApply = true;
                        }
                    }
                    if (needsApply) {
                        return new LiteMol.Promise(function (res, rej) {
                            plugin.applyTransform(t).then(function () {
                                for (var _a = 0, elements_4 = elements; _a < elements_4.length; _a++) {
                                    var element = elements_4[_a];
                                    element.__isBusy = false;
                                }
                                res();
                            }).catch(function (e) { return rej(e); });
                        });
                    }
                    else {
                        return new LiteMol.Promise(function (res, rej) {
                            for (var _a = 0, elements_5 = elements; _a < elements_5.length; _a++) {
                                var element = elements_5[_a];
                                element.__isBusy = false;
                            }
                            res();
                        });
                    }
                }
                function showCavityVisuals(plugin, cavities, visible) {
                    return showSurfaceVisuals(plugin, cavities, visible, 'Cavity', function (cavity) { return cavity.Type + " " + cavity.Id; }, 0.33);
                }
                State.showCavityVisuals = showCavityVisuals;
                ;
                function showChannelVisuals(plugin, channels, visible, forceRepaint) {
                    var label = function (channel) { return channel.Type + " " + CommonUtils.Tunnels.getName(channel); };
                    var alpha = 1.0;
                    var promises = [];
                    var visibleChannels = [];
                    var _loop_4 = function (channel) {
                        if (!channel.__id)
                            channel.__id = LiteMol.Bootstrap.Utils.generateUUID();
                        if (!!channel.__isVisible === visible && !forceRepaint)
                            return "continue";
                        if (forceRepaint !== void 0 && forceRepaint) {
                            plugin.command(LiteMol.Bootstrap.Command.Tree.RemoveNode, channel.__id);
                        }
                        channel.__isVisible = visible;
                        if (!channel.__color) {
                            channel.__color = ColorScheme.Colors.getRandomUnused();
                        }
                        if (!visible) {
                            plugin.command(LiteMol.Bootstrap.Command.Tree.RemoveNode, channel.__id);
                        }
                        else {
                            visibleChannels.push(channel);
                            var sphereSurfacePromise_1 = createTunnelSurface(channel.Profile);
                            promises.push(new LiteMol.Promise(function (res, rej) {
                                sphereSurfacePromise_1.then(function (val) {
                                    var surface = val;
                                    var t = plugin.createTransform();
                                    t.add('mole-data', State.CreateSurface, {
                                        label: label(channel),
                                        tag: { kind: "Channel", element: channel },
                                        surface: surface,
                                        color: channel.__color,
                                        isInteractive: true,
                                        transparency: { alpha: alpha },
                                    }, { ref: channel.__id, isHidden: true });
                                    plugin.applyTransform(t).then(function () { res(); });
                                }).catch(rej);
                            }));
                        }
                    };
                    for (var _a = 0, channels_3 = channels; _a < channels_3.length; _a++) {
                        var channel = channels_3[_a];
                        _loop_4(channel);
                    }
                    MoleOnlineWebUI.Cache.LastVisibleChannels.set(visibleChannels);
                    return LiteMol.Promise.all(promises).then(function () {
                        for (var _a = 0, channels_4 = channels; _a < channels_4.length; _a++) {
                            var channel = channels_4[_a];
                            channel.__isBusy = false;
                        }
                    });
                }
                State.showChannelVisuals = showChannelVisuals;
                function createOriginsSurface(origins) {
                    if (origins.__surface)
                        return LiteMol.Promise.resolve(origins.__surface);
                    var s = LiteMol.Visualization.Primitive.Builder.create();
                    var id = 0;
                    for (var _a = 0, _b = origins.Points; _a < _b.length; _a++) {
                        var p = _b[_a];
                        s.add({ type: 'Sphere', id: id++, radius: 1.69, center: [p.X, p.Y, p.Z] });
                    }
                    return s.buildSurface().run();
                }
                function getOriginColorByType(origins) {
                    switch (origins.Type) {
                        case 'Computed': return ColorScheme.Colors.get(ColorScheme.Enum.ComputedOrigin);
                        case 'CSA Origins': return ColorScheme.Colors.get(ColorScheme.Enum.CSAOrigin);
                        default: return ColorScheme.Colors.get(ColorScheme.Enum.OtherOrigin);
                    }
                }
                function createMembraneSurface(membranePoints) {
                    var s = LiteMol.Visualization.Primitive.Builder.create();
                    for (var _a = 0, _b = membranePoints; _a < _b.length; _a++) {
                        var p = _b[_a];
                        s.add({ type: 'Sphere', id: 0, radius: 0.25, center: [p.Position.X, p.Position.Y, p.Position.Z] });
                    }
                    return s.buildSurface().run();
                }
                function showMembraneVisuals(plugin, membraneData, visible) {
                    var promises = [];
                    var blue = [];
                    var red = [];
                    var blueId = "";
                    var redId = "";
                    for (var _a = 0, membraneData_1 = membraneData; _a < membraneData_1.length; _a++) {
                        var membrane = membraneData_1[_a];
                        var membraneDataAny = membrane;
                        if (!!membraneDataAny.__isVisible === visible)
                            return LiteMol.Promise.resolve();
                        membraneDataAny.__isVisible = visible;
                        if (!visible) {
                            if (membraneDataAny.__id !== void 0) {
                                plugin.command(LiteMol.Bootstrap.Command.Tree.RemoveNode, membraneDataAny.__id);
                                membraneDataAny.__id = void 0;
                            }
                            membraneDataAny.__isBusy = false;
                            continue;
                        }
                        if (membrane.Side === "N") {
                            if (blueId === "") {
                                if (!membraneDataAny.__id) {
                                    blueId = LiteMol.Bootstrap.Utils.generateUUID();
                                }
                                membraneDataAny.__id = blueId;
                            }
                            blue.push(membrane);
                            blue.__isBusy = true;
                        }
                        else {
                            if (redId === "") {
                                if (!membraneDataAny.__id) {
                                    redId = LiteMol.Bootstrap.Utils.generateUUID();
                                }
                                membraneDataAny.__id = redId;
                            }
                            red.push(membrane);
                            red.__isBusy = true;
                        }
                    }
                    if (blue.length > 0) {
                        promises.push(new LiteMol.Promise(function (res, rej) {
                            createMembraneSurface(blue).then(function (surface) {
                                var t = plugin.createTransform()
                                    .add('membrane-data', State.CreateSurface, {
                                    label: 'Membrane Blue',
                                    tag: { kind: 'Origins', element: membraneData },
                                    surface: surface,
                                    isInteractive: false,
                                    color: ColorScheme.Colors.get(ColorScheme.Enum.MembraneBlue)
                                }, { ref: blue[0].__id, isHidden: true });
                                plugin.applyTransform(t).then(function () {
                                    blue.__isBusy = false;
                                    res();
                                }).catch(function (err) { return rej(err); });
                            }).catch(function (err) { return rej(err); });
                        }));
                    }
                    if (red.length > 0) {
                        promises.push(new LiteMol.Promise(function (res, rej) {
                            createMembraneSurface(red).then(function (surface) {
                                var t = plugin.createTransform()
                                    .add('membrane-data', State.CreateSurface, {
                                    label: 'Membrane Red',
                                    tag: { kind: 'Origins', element: membraneData },
                                    surface: surface,
                                    isInteractive: false,
                                    color: ColorScheme.Colors.get(ColorScheme.Enum.MembraneRed)
                                }, { ref: red[0].__id, isHidden: true });
                                plugin.applyTransform(t).then(function () {
                                    red.__isBusy = false;
                                    res();
                                }).catch(rej);
                            }).catch(rej);
                        }));
                    }
                    return LiteMol.Promise.all(promises).then(function () {
                        membraneData.__isBusy = false;
                        membraneData.__isVisible = visible;
                    }).catch(function (err) {
                        membraneData.__isBusy = false;
                    });
                }
                State.showMembraneVisuals = showMembraneVisuals;
                function showOriginsSurface(plugin, origins, visible) {
                    if (!origins.__id)
                        origins.__id = LiteMol.Bootstrap.Utils.generateUUID();
                    if (!origins.Points.length || !!origins.__isVisible === visible)
                        return LiteMol.Promise.resolve();
                    origins.__isVisible = visible;
                    if (!visible) {
                        plugin.command(LiteMol.Bootstrap.Command.Tree.RemoveNode, origins.__id);
                        origins.__isBusy = false;
                        return LiteMol.Promise.resolve();
                    }
                    if (!origins.__color) {
                        origins.__color = getOriginColorByType(origins);
                    }
                    return new LiteMol.Promise(function (res, rej) {
                        createOriginsSurface(origins).then(function (surface) {
                            var t = plugin.createTransform()
                                .add('mole-data', State.CreateSurface, {
                                label: 'Origins (' + origins.Type + ')',
                                tag: { kind: 'Origins', element: origins },
                                surface: surface,
                                isInteractive: true,
                                color: origins.__color
                            }, { ref: origins.__id, isHidden: true });
                            plugin.applyTransform(t).then(function () {
                                origins.__isBusy = false;
                                res();
                            }).catch(rej);
                        }).catch(rej);
                    });
                }
                State.showOriginsSurface = showOriginsSurface;
                State.CreateSurface = LiteMol.Bootstrap.Tree.Transformer.create({
                    id: 'mole-example-create-surface',
                    name: 'Create Surface',
                    description: 'Create a surface entity.',
                    from: [LiteMol.Bootstrap.Entity.Data.Json],
                    to: [LiteMol.Bootstrap.Entity.Visual.Surface],
                    defaultParams: function () { return ({}); },
                    isUpdatable: false
                }, function (context, a, t) {
                    var theme = LiteMol.Visualization.Theme.createUniform({ colors: LiteMol.Core.Utils.FastMap.ofArray([['Uniform', t.params.color]]), interactive: t.params.isInteractive, transparency: t.params.transparency });
                    var style = {
                        type: 'Surface',
                        taskType: 'Silent',
                        //isNotSelectable: false,
                        params: {},
                        theme: void 0
                    };
                    return LiteMol.Bootstrap.Task.create("Create Surface", 'Silent', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var model;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, LiteMol.Visualization.Surface.Model.create(t.params.tag, { surface: t.params.surface, theme: theme, parameters: { isWireframe: t.params.isWireframe } }).run(ctx)];
                                case 1:
                                    model = _a.sent();
                                    return [2 /*return*/, LiteMol.Bootstrap.Entity.Visual.Surface.create(t, { label: t.params.label, model: model, style: style, isSelectable: true, tag: t.params.tag })];
                            }
                        });
                    }); });
                });
            })(State = Channels.State || (Channels.State = {}));
        })(Channels = Example.Channels || (Example.Channels = {}));
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
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
        (function (Channels_1) {
            var UI;
            (function (UI) {
                var React = LiteMol.Plugin.React;
                function render(plugin, target) {
                    LiteMol.Plugin.ReactDOM.render(React.createElement(App, { plugin: plugin }), target);
                }
                UI.render = render;
                var App = (function (_super) {
                    __extends(App, _super);
                    function App() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this.state = { isLoading: false, data: void 0, error: void 0 };
                        return _this;
                    }
                    App.prototype.componentDidMount = function () {
                        var _this = this;
                        var params = Common.Util.Router.getParameters();
                        var channelsDB = false;
                        if (params !== null) {
                            channelsDB = params.isChannelsDB;
                        }
                        this.load(channelsDB);
                        $(window).on("contentResize", this.onContentResize.bind(this));
                        MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(function (submitId) {
                            try {
                                _this.load(submitId === -1);
                            }
                            catch (ex) {
                                if (Config.CommonOptions.DEBUG_MODE)
                                    console.log(ex);
                                _this.setState({ isLoading: false, data: void 0, error: "Data not available" });
                            }
                        });
                        MoleOnlineWebUI.Bridge.Events.subscribeOnSequneceViewerToggle(function (params) {
                            if (params.minimized) {
                                $('#plugin').addClass("sv-minimized");
                            }
                            else {
                                $('#plugin').removeClass("sv-minimized");
                            }
                            $(window).trigger('contentResize');
                        });
                    };
                    App.prototype.onContentResize = function (_) {
                        var prevState = this.props.plugin.context.layout.latestState;
                        this.props.plugin.setLayoutState({ isExpanded: true });
                        this.props.plugin.setLayoutState(prevState);
                    };
                    App.prototype.load = function (channelsDB) {
                        var _this = this;
                        this.setState({ isLoading: true, error: void 0 });
                        Channels_1.State.loadData(this.props.plugin, channelsDB)
                            .then(function (data) {
                            if (Config.CommonOptions.DEBUG_MODE)
                                console.log("loading done ok");
                            var entities = _this.props.plugin.context.select("mole-data");
                            if (entities.length === 0) {
                                var params = Common.Util.Router.getParameters();
                                if (params === null) {
                                    _this.setState({ isLoading: false, error: "Sorry. Given url is not valid." });
                                    return;
                                }
                                var computationId = params.computationId;
                                var submitId = params.submitId;
                                _this.setState({ isLoading: false, error: "There are no vizualization data for computation '" + computationId + "' and submission '" + submitId + "'. Try to submit some computation job." });
                                return;
                            }
                            var _data = entities[0].props.data;
                            var csaOrigins = _this.props.plugin.context.select("csa-origins");
                            if (csaOrigins.length > 0) {
                                if (_data.Origins === void 0) {
                                    _data.Origins = {};
                                }
                                _data.Origins.CSAOrigins = csaOrigins[0].props.data.Origins.CSAOrigins;
                            }
                            if (_data.Error !== void 0) {
                                _this.setState({ isLoading: false, error: _data.Error });
                            }
                            else {
                                _this.setState({
                                    isLoading: false, data: _data, error: void 0
                                });
                            }
                        })
                            .catch(function (e) {
                            var errMessage = 'Application was unable to load data. Please try again later.';
                            if (e !== void 0 && e !== null && String(e).length > 0) {
                                errMessage = String(e);
                            }
                            _this.setState({ isLoading: false, error: errMessage, data: void 0 });
                        });
                    };
                    App.prototype.render = function () {
                        var _this = this;
                        if (this.state.data) {
                            return React.createElement(Data, { data: this.state.data, plugin: this.props.plugin });
                        }
                        else {
                            var controls = [];
                            if (this.state.isLoading) {
                                controls.push(React.createElement("h1", null, "Loading..."));
                            }
                            else {
                                if (this.state.error) {
                                    var error = this.state.error;
                                    var errorMessage = (error === void 0) ? "" : error;
                                    controls.push(React.createElement("div", { className: "error-message" },
                                        React.createElement("div", null,
                                            React.createElement("b", null, "Data for specified protein are not available.")),
                                        React.createElement("div", null,
                                            React.createElement("b", null, "Reason:"),
                                            " ",
                                            React.createElement("i", { dangerouslySetInnerHTML: { __html: errorMessage } }))));
                                }
                                var params = Common.Util.Router.getParameters();
                                var channelsDB_1 = false;
                                if (params !== null) {
                                    channelsDB_1 = params.isChannelsDB;
                                }
                                controls.push(React.createElement("button", { className: "reload-data btn btn-primary", onClick: function () { return _this.load(channelsDB_1); } }, "Reload Data"));
                            }
                            return React.createElement("div", null, controls);
                        }
                    };
                    return App;
                }(React.Component));
                UI.App = App;
                var Data = (function (_super) {
                    __extends(Data, _super);
                    function Data() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Data.prototype.render = function () {
                        var _this = this;
                        var channels = new Map();
                        channels.set('Merged pores', (!this.props.data.Channels.MergedPores) ? [] : this.props.data.Channels.MergedPores);
                        channels.set('Paths', (!this.props.data.Channels.Paths) ? [] : this.props.data.Channels.Paths);
                        channels.set('Pores', (!this.props.data.Channels.Pores) ? [] : this.props.data.Channels.Pores);
                        channels.set('Tunnels', (!this.props.data.Channels.Tunnels) ? [] : this.props.data.Channels.Tunnels);
                        var channelsDBChannels = this.props.data.Channels;
                        channels.set('Reviewed Channels', (!channelsDBChannels.ReviewedChannels) ? [] : channelsDBChannels.ReviewedChannels);
                        channels.set('CSA Tunnels', (!channelsDBChannels.CSATunnels) ? [] : channelsDBChannels.CSATunnels);
                        channels.set('Transmembrane Pores', (!channelsDBChannels.TransmembranePores) ? [] : channelsDBChannels.TransmembranePores);
                        channels.set('Cofactor Tunnels', (!channelsDBChannels.CofactorTunnels) ? [] : channelsDBChannels.CofactorTunnels);
                        var channelsControls = [];
                        channels.forEach(function (val, key, map) {
                            if (val.length > 0) {
                                channelsControls.push(React.createElement(Channels, { channels: val, state: _this.props, header: key.valueOf() }));
                            }
                        });
                        var noChannelsData = React.createElement("div", { className: "no-channels-data" }, "There are no channels available...");
                        var cavities = new Map();
                        if (this.props.data.Cavities !== void 0) {
                            cavities.set('Surface', [this.props.data.Cavities.Surface]);
                            cavities.set('Cavities', this.props.data.Cavities.Cavities);
                            cavities.set('Voids', this.props.data.Cavities.Voids);
                        }
                        var cavitiesControls = [];
                        cavities.forEach(function (val, key, map) {
                            if (val.length > 0) {
                                cavitiesControls.push(React.createElement(Cavities, { cavities: val, state: _this.props, header: key.valueOf() }));
                            }
                        });
                        var noCavitiesData = React.createElement("div", { className: "no-channels-data" }, "There are no cavities available...");
                        var originsControls = [];
                        if (this.props.data.Origins.User !== void 0)
                            originsControls.push(React.createElement(Origins, __assign({ origins: this.props.data.Origins.User }, this.props, { label: 'User Specifed (optimized)' })));
                        if (this.props.data.Origins.InputOrigins !== void 0)
                            originsControls.push(React.createElement(Origins, __assign({ origins: this.props.data.Origins.InputOrigins }, this.props, { label: 'User Specifed' })));
                        if (this.props.data.Origins.Computed !== void 0)
                            originsControls.push(React.createElement(Origins, __assign({ origins: this.props.data.Origins.Computed }, this.props, { label: 'Computed' })));
                        if (this.props.data.Origins.Databse !== void 0)
                            originsControls.push(React.createElement(Origins, __assign({ origins: this.props.data.Origins.Database }, this.props, { label: 'Database' })));
                        if (this.props.data.Origins.InputExits !== void 0)
                            originsControls.push(React.createElement(Origins, __assign({ origins: this.props.data.Origins.InputExits }, this.props, { label: 'Input Exits' })));
                        if (this.props.data.Origins.InputFoundExits !== void 0)
                            originsControls.push(React.createElement(Origins, __assign({ origins: this.props.data.Origins.InputFoundExits }, this.props, { label: 'Input Found Exits' })));
                        if (this.props.data.Origins.CSAOrigins !== void 0)
                            originsControls.push(React.createElement(Origins, __assign({ origins: this.props.data.Origins.CSAOrigins }, this.props, { label: 'CSA Origins' })));
                        var noOriginsData = React.createElement("div", { className: "no-channels-data" }, "There are no origins available...");
                        var membrane;
                        var membraneData = this.props.plugin.context.select('membrane-data')[0];
                        var noMembraneData = React.createElement("div", { className: "no-channels-data" }, "There are no membrane data available...");
                        if (membraneData !== void 0 && membraneData !== null && membraneData.props.data.length !== void 0) {
                            membrane = React.createElement(Membrane, __assign({ membraneData: membraneData.props.data, label: "Membrane" }, this.props));
                        }
                        return React.createElement("div", null,
                            React.createElement(Selection, __assign({}, this.props)),
                            React.createElement("div", { className: "ui-header" }, "Channels"),
                            React.createElement("div", null, (channelsControls.length === 0) ? noChannelsData : channelsControls),
                            React.createElement("div", { className: "ui-header origins" }, "Origins"),
                            React.createElement("div", null, (originsControls.length === 0) ? noOriginsData : originsControls),
                            React.createElement("div", { className: "ui-header cavities" }, "Cavities"),
                            React.createElement("div", null, (cavitiesControls.length === 0) ? noCavitiesData : cavitiesControls),
                            React.createElement("div", { className: "ui-header membrane" }, "Membrane"),
                            React.createElement("div", null, (membrane === void 0) ? noMembraneData : membrane));
                    };
                    return Data;
                }(React.Component));
                UI.Data = Data;
                ;
                var Selection = (function (_super) {
                    __extends(Selection, _super);
                    function Selection() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this.state = { label: void 0 };
                        _this.observerChannels = void 0;
                        return _this;
                    }
                    Selection.prototype.componentWillMount = function () {
                        var _this = this;
                        CommonUtils.Selection.SelectionHelper.attachOnResidueBulkSelectHandler((function (r) {
                            if (r.length === 0) {
                                _this.setState({
                                    label: void 0
                                });
                                return;
                            }
                            var label = r.map(function (val, idx, array) {
                                var name = CommonUtils.Residues.getName(val.authSeqNumber, _this.props.plugin);
                                return name + "&nbsp;" + val.authSeqNumber + "&nbsp;" + val.chain.authAsymId;
                            }).reduce(function (prev, cur, idx, array) {
                                return "" + prev + ((idx === 0) ? '' : ',\n') + cur;
                            });
                            var items = label.split('\n');
                            var elements = [];
                            for (var _i = 0, items_4 = items; _i < items_4.length; _i++) {
                                var e = items_4[_i];
                                var lineParts = e.split('&nbsp;');
                                elements.push(React.createElement("div", null,
                                    lineParts[0],
                                    "\u00A0",
                                    lineParts[1],
                                    "\u00A0",
                                    lineParts[2]));
                            }
                            _this.setState({
                                label: React.createElement("div", { className: "columns" }, elements)
                            });
                        }).bind(this));
                        CommonUtils.Selection.SelectionHelper.attachOnPointBulkSelectHandler((function (points) {
                            var elements = [];
                            for (var _i = 0, points_4 = points; _i < points_4.length; _i++) {
                                var e = points_4[_i];
                                elements.push(React.createElement("div", null,
                                    "[",
                                    Number(e.x).toFixed(2),
                                    ",\u00A0",
                                    Number(e.y).toFixed(2),
                                    ",\u00A0",
                                    Number(e.z).toFixed(2),
                                    "]"));
                            }
                            _this.setState({
                                label: React.createElement("div", { className: "columns points" }, elements)
                            });
                        }).bind(this));
                        CommonUtils.Selection.SelectionHelper.attachOnClearSelectionHandler((function () {
                            _this.setState({ label: void 0 });
                            $("#left-tabs li a[href='#left-tabs-1']")
                                .text("Channel profile");
                        }).bind(this));
                        this.observerChannels = this.props.plugin.subscribe(LiteMol.Bootstrap.Event.Visual.VisualSelectElement, function (e) {
                            var eventData = e.data;
                            if (e.data !== void 0 && eventData.source !== void 0 && eventData.source.props !== void 0 && eventData.source.props.tag === void 0) {
                                return;
                            }
                            if (e.data && (eventData === void 0 || e.data.kind !== 0)) {
                                if (CommonUtils.Selection.SelectionHelper.isSelectedAnyChannel()) {
                                    var data = e.data;
                                    var c = data.source.props.tag.element;
                                    var tunnelName = CommonUtils.Tunnels.getName(c);
                                    var len = CommonUtils.Tunnels.getLength(c);
                                    if (Common.Util.Router.isInChannelsDBMode()) {
                                        var annotations = MoleOnlineWebUI.Cache.ChannelsDBData.getChannelAnnotationsImmediate(c.Id);
                                        if (annotations !== null && annotations.length > 0) {
                                            tunnelName = annotations[0].name;
                                        }
                                        $("#left-tabs li a[href='#left-tabs-1']")
                                            .text("Channel profile (" + tunnelName + ")");
                                        _this.setState({ label: React.createElement("span", null,
                                                React.createElement("b", null, tunnelName),
                                                ", ", "Length: " + len + " \u00C5") });
                                    }
                                    else {
                                        $("#left-tabs li a[href='#left-tabs-1']")
                                            .text("Channel profile (" + tunnelName + ")");
                                        var namePart = (tunnelName === void 0) ? '' : " (" + tunnelName + ")";
                                        _this.setState({ label: React.createElement("span", null,
                                                React.createElement("b", null,
                                                    c.Type,
                                                    namePart),
                                                ", ", "Length: " + len + " \u00C5") });
                                    }
                                }
                                else if (!CommonUtils.Selection.SelectionHelper.isSelectedAny()) {
                                    $("#left-tabs li a[href='#left-tabs-1']")
                                        .text("Channel profile");
                                    _this.setState({ label: void 0 });
                                }
                            }
                        });
                    };
                    Selection.prototype.componentWillUnmount = function () {
                        if (this.observerChannels) {
                            this.observerChannels.dispose();
                            this.observerChannels = void 0;
                        }
                    };
                    Selection.prototype.render = function () {
                        return React.createElement("div", null,
                            React.createElement("div", { className: "ui-selection-header" },
                                React.createElement("span", null, "Selection"),
                                React.createElement("div", { className: "btn btn-xs btn-default ui-selection-clear", onClick: function (e) {
                                        var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                                        CommonUtils.Selection.SelectionHelper.clearSelection(plugin);
                                    }, title: "Clear selection" },
                                    React.createElement("span", { className: "glyphicon glyphicon-trash" }))),
                            React.createElement("div", { className: "ui-selection" }, !this.state.label
                                ? React.createElement("i", null, "Click on atom residue or channel")
                                : this.state.label));
                    };
                    return Selection;
                }(React.Component));
                UI.Selection = Selection;
                var Section = (function (_super) {
                    __extends(Section, _super);
                    function Section() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this.state = { isExpanded: false };
                        return _this;
                    }
                    Section.prototype.toggle = function (e) {
                        e.preventDefault();
                        this.setState({ isExpanded: !this.state.isExpanded });
                    };
                    Section.prototype.render = function () {
                        var _this = this;
                        return React.createElement("div", { className: "ui-item-container", style: { position: 'relative' } },
                            React.createElement("div", { className: "ui-subheader" },
                                React.createElement("a", { href: '#', onClick: function (e) { return _this.toggle(e); }, className: 'section-header' },
                                    React.createElement("div", { style: { width: '15px', display: 'inline-block', textAlign: 'center' } }, this.state.isExpanded ? '-' : '+'),
                                    " ",
                                    this.props.header,
                                    " (",
                                    this.props.count,
                                    ")")),
                            React.createElement("div", { style: { display: this.state.isExpanded ? 'block' : 'none' } }, this.props.children));
                    };
                    return Section;
                }(React.Component));
                UI.Section = Section;
                var Renderable = (function (_super) {
                    __extends(Renderable, _super);
                    function Renderable() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this.state = { isAnnotationsVisible: false };
                        return _this;
                    }
                    Renderable.prototype.toggle = function () {
                        var _this = this;
                        this.props.element.__isBusy = true;
                        this.forceUpdate(function () {
                            return _this.props.toggle(_this.props.plugin, [_this.props.element], !_this.props.element.__isVisible)
                                .then(function () { return _this.forceUpdate(); }).catch(function () { return _this.forceUpdate(); });
                        });
                    };
                    Renderable.prototype.highlight = function (isOn) {
                        this.props.plugin.command(LiteMol.Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.element.__id), isOn: isOn });
                    };
                    Renderable.prototype.toggleAnnotations = function (e) {
                        this.setState({ isAnnotationsVisible: !this.state.isAnnotationsVisible });
                    };
                    Renderable.prototype.getAnnotationToggler = function () {
                        return [(this.state.isAnnotationsVisible)
                                ? React.createElement("span", { className: "hand glyphicon glyphicon-chevron-up", title: "Hide list annotations for this channel", onClick: this.toggleAnnotations.bind(this) })
                                : React.createElement("span", { className: "hand glyphicon glyphicon-chevron-down", title: "Show all annotations available for this channel", onClick: this.toggleAnnotations.bind(this) })];
                    };
                    Renderable.prototype.getAnnotationsElements = function () {
                        if (this.props.annotations === void 0) {
                            return [];
                        }
                        if (!this.state.isAnnotationsVisible) {
                            return [];
                        }
                        var elements = [];
                        for (var _i = 0, _a = this.props.annotations; _i < _a.length; _i++) {
                            var annotation = _a[_i];
                            var reference = React.createElement("i", null, "(No reference provided)");
                            if (annotation.reference !== "") {
                                reference = React.createElement("a", { target: "_blank", href: annotation.link },
                                    annotation.reference,
                                    " ",
                                    React.createElement("span", { className: "glyphicon glyphicon-new-window" }));
                            }
                            elements.push(React.createElement("div", { className: "annotation-line" },
                                React.createElement("span", { className: "bullet" }),
                                " ",
                                React.createElement("b", null, annotation.name),
                                ", ",
                                reference));
                        }
                        return elements;
                    };
                    Renderable.prototype.render = function () {
                        var _this = this;
                        var emptyToggler;
                        if (Common.Util.Router.isInChannelsDBMode()) {
                            emptyToggler = React.createElement("span", { className: "disabled glyphicon glyphicon-chevron-down", title: "No annotations available for this channel", onClick: this.toggleAnnotations.bind(this) });
                        }
                        return React.createElement("div", { className: "ui-label" },
                            React.createElement("input", { type: 'checkbox', checked: !!this.props.element.__isVisible, onChange: function () { return _this.toggle(); }, disabled: !!this.props.element.__isBusy }),
                            React.createElement("label", { className: "ui-label-element", onMouseEnter: function () { return _this.highlight(true); }, onMouseLeave: function () { return _this.highlight(false); } },
                                (this.props.annotations !== void 0 && this.props.annotations.length > 0) ? this.getAnnotationToggler() : emptyToggler,
                                " ",
                                this.props.label),
                            this.getAnnotationsElements());
                    };
                    return Renderable;
                }(React.Component));
                UI.Renderable = Renderable;
                var Channels = (function (_super) {
                    __extends(Channels, _super);
                    function Channels() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this.state = { isBusy: false };
                        return _this;
                    }
                    Channels.prototype.show = function (visible) {
                        var _this = this;
                        for (var _i = 0, _a = this.props.channels; _i < _a.length; _i++) {
                            var element = _a[_i];
                            element.__isBusy = true;
                        }
                        this.setState({ isBusy: true }, function () {
                            return Channels_1.State.showChannelVisuals(_this.props.state.plugin, _this.props.channels, visible)
                                .then(function () { return _this.setState({ isBusy: false }); }).catch(function () { return _this.setState({ isBusy: false }); });
                        });
                    };
                    Channels.prototype.isDisabled = function () {
                        return !this.props.channels || (this.props.channels !== void 0 && this.props.channels.length == 0);
                    };
                    Channels.prototype.render = function () {
                        var _this = this;
                        return React.createElement(Section, { header: this.props.header, count: (this.props.channels || '').length },
                            React.createElement("div", { className: 'ui-show-all' },
                                React.createElement("button", { className: "btn btn-primary btn-xs", onClick: function () { return _this.show(true); }, disabled: this.state.isBusy || this.isDisabled() }, "All"),
                                React.createElement("button", { className: "btn btn-primary btn-xs", onClick: function () { return _this.show(false); }, disabled: this.state.isBusy || this.isDisabled() }, "None")),
                            this.props.channels && this.props.channels.length > 0
                                ? this.props.channels.map(function (c, i) { return React.createElement(Channel, { key: i, channel: c, state: _this.props.state }); })
                                : React.createElement("div", { className: "ui-label ui-no-data-available" }, "No data available..."));
                    };
                    return Channels;
                }(React.Component));
                UI.Channels = Channels;
                var Channel = (function (_super) {
                    __extends(Channel, _super);
                    function Channel() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this.state = { isVisible: false, isWaitingForData: false };
                        return _this;
                    }
                    Channel.prototype.componentDidMount = function () {
                        var _this = this;
                        MoleOnlineWebUI.Bridge.Events.subscribeChannelSelect((function (channelId) {
                            if (_this.props.channel.Id === channelId) {
                                _this.selectChannel(false);
                            }
                        }).bind(this));
                    };
                    Channel.prototype.render = function () {
                        var _this = this;
                        var c = this.props.channel;
                        var len = CommonUtils.Tunnels.getLength(c);
                        var name = MoleOnlineWebUI.Cache.TunnelName.get(c.GUID);
                        var namePart = (name === void 0) ? '' : " (" + name + ")";
                        var annotations = MoleOnlineWebUI.Cache.ChannelsDBData.getChannelAnnotationsImmediate(c.Id);
                        if (annotations !== null && annotations !== void 0) {
                            var annotation = annotations[0];
                            return React.createElement(Renderable, __assign({ annotations: annotations, label: React.createElement("span", null,
                                    React.createElement("b", null,
                                        React.createElement("a", { onClick: this.selectChannel.bind(this) }, annotation.name)),
                                    React.createElement(ColorPicker, { tunnel: this.props.channel }),
                                    ", Length: ",
                                    React.createElement("b", null,
                                        len,
                                        " \u00C5")), element: c, toggle: Channels_1.State.showChannelVisuals }, this.props.state));
                        }
                        else {
                            return React.createElement(Renderable, __assign({ label: React.createElement("span", null,
                                    React.createElement("b", null,
                                        React.createElement("a", { onClick: this.selectChannel.bind(this) },
                                            c.Type,
                                            namePart)),
                                    React.createElement(ColorPicker, { tunnel: this.props.channel }),
                                    ", Length: ",
                                    React.createElement("b", null, (len | 0) + " \u00C5")), element: c, toggle: function (p, ch, v) {
                                    return Channels_1.State.showChannelVisuals(p, ch, v)
                                        .then(function (res) {
                                        _this.props.channel = ch[0];
                                        _this.forceUpdate();
                                    });
                                } }, this.props.state));
                        }
                    };
                    Channel.prototype.selectChannel = function (updateUI) {
                        var _this = this;
                        if (updateUI === void 0) {
                            updateUI = true;
                        }
                        var entity = this.props.state.plugin.context.select(this.props.channel.__id)[0];
                        if (entity === void 0 || entity.ref === "undefined") {
                            Channels_1.State.showChannelVisuals(this.props.state.plugin, [this.props.channel], true).then(function () {
                                if (updateUI) {
                                    var state = _this.state;
                                    state.isVisible = true;
                                    _this.setState(state);
                                }
                                _this.selectChannel(updateUI);
                            });
                            return;
                        }
                        var channelRef = entity.ref;
                        var plugin = this.props.state.plugin;
                        plugin.command(LiteMol.Bootstrap.Command.Entity.Focus, plugin.context.select(channelRef));
                        plugin.command(LiteMol.Bootstrap.Event.Visual.VisualSelectElement, LiteMol.Bootstrap.Interactivity.Info.selection(entity, [0]));
                    };
                    return Channel;
                }(React.Component));
                UI.Channel = Channel;
                var Cavities = (function (_super) {
                    __extends(Cavities, _super);
                    function Cavities() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this.state = { isBusy: false };
                        return _this;
                    }
                    Cavities.prototype.show = function (visible) {
                        var _this = this;
                        for (var _i = 0, _a = this.props.cavities; _i < _a.length; _i++) {
                            var element = _a[_i];
                            element.__isBusy = true;
                        }
                        this.setState({ isBusy: true }, function () {
                            return Channels_1.State.showCavityVisuals(_this.props.state.plugin, _this.props.cavities, visible)
                                .then(function () { return _this.setState({ isBusy: false }); }).catch(function () { return _this.setState({ isBusy: false }); });
                        });
                    };
                    Cavities.prototype.isDisabled = function () {
                        return !this.props.cavities || (this.props.cavities !== void 0 && this.props.cavities.length == 0);
                    };
                    Cavities.prototype.render = function () {
                        var _this = this;
                        return React.createElement(Section, { header: this.props.header, count: (this.props.cavities || '').length },
                            React.createElement("div", { className: 'ui-show-all' },
                                React.createElement("button", { className: "btn btn-primary btn-xs", onClick: function () { return _this.show(true); }, disabled: this.state.isBusy || this.isDisabled() }, "All"),
                                React.createElement("button", { className: "btn btn-primary btn-xs", onClick: function () { return _this.show(false); }, disabled: this.state.isBusy || this.isDisabled() }, "None")),
                            this.props.cavities && this.props.cavities.length > 0
                                ? this.props.cavities.map(function (c, i) { return React.createElement(Cavity, { key: i, cavity: c, state: _this.props.state }); })
                                : React.createElement("div", { className: "ui-label ui-no-data-available" }, "No data available..."));
                    };
                    return Cavities;
                }(React.Component));
                UI.Cavities = Cavities;
                var Cavity = (function (_super) {
                    __extends(Cavity, _super);
                    function Cavity() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this.state = { isVisible: false };
                        return _this;
                    }
                    Cavity.prototype.render = function () {
                        var c = this.props.cavity;
                        return React.createElement("div", null,
                            React.createElement(Renderable, __assign({ label: React.createElement("span", null,
                                    React.createElement("b", null, c.Id),
                                    ", Volume: ",
                                    React.createElement("b", null, (c.Volume | 0) + " \u00C5",
                                        React.createElement("sup", null, "3"))), element: c, toggle: Channels_1.State.showCavityVisuals }, this.props.state)));
                    };
                    return Cavity;
                }(React.Component));
                UI.Cavity = Cavity;
                var Origins = (function (_super) {
                    __extends(Origins, _super);
                    function Origins() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Origins.prototype.toggle = function () {
                        var _this = this;
                        this.props.origins.__isBusy = true;
                        this.forceUpdate(function () {
                            return Channels_1.State.showOriginsSurface(_this.props.plugin, _this.props.origins, !_this.props.origins.__isVisible)
                                .then(function () { return _this.forceUpdate(); }).catch(function () { return _this.forceUpdate(); });
                        });
                    };
                    Origins.prototype.highlight = function (isOn) {
                        this.props.plugin.command(LiteMol.Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.origins.__id), isOn: isOn });
                    };
                    Origins.prototype.render = function () {
                        var _this = this;
                        if (this.props.origins.Points === void 0 || !this.props.origins.Points.length) {
                            return React.createElement("div", { style: { display: 'none' } });
                        }
                        return React.createElement("div", null,
                            React.createElement("label", { onMouseEnter: function () { return _this.highlight(true); }, onMouseLeave: function () { return _this.highlight(false); } },
                                React.createElement("input", { type: 'checkbox', checked: !!this.props.origins.__isVisible, onChange: function () { return _this.toggle(); }, disabled: !!this.props.origins.__isBusy }),
                                " ",
                                this.props.label));
                    };
                    return Origins;
                }(React.Component));
                UI.Origins = Origins;
                var Membrane = (function (_super) {
                    __extends(Membrane, _super);
                    function Membrane() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Membrane.prototype.componentDidMount = function () {
                        var _this = this;
                        MoleOnlineWebUI.Bridge.Events.subscribeOnMembraneDataReady(function () {
                            _this.forceUpdate();
                        });
                    };
                    Membrane.prototype.toggle = function () {
                        var _this = this;
                        this.props.membraneData.__isBusy = true;
                        this.forceUpdate(function () {
                            return Channels_1.State.showMembraneVisuals(_this.props.plugin, _this.props.membraneData, !_this.props.membraneData.__isVisible)
                                .then(function () { return _this.forceUpdate(); }).catch(function (err) { _this.forceUpdate(); console.log(err); });
                        });
                    };
                    Membrane.prototype.highlight = function (isOn) {
                        this.props.plugin.command(LiteMol.Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.membraneData.__id), isOn: isOn });
                    };
                    Membrane.prototype.render = function () {
                        var _this = this;
                        if (this.props.membraneData === void 0 || !this.props.membraneData.length) {
                            return React.createElement("div", { style: { display: 'none' } });
                        }
                        return React.createElement("div", null,
                            React.createElement("label", { onMouseEnter: function () { return _this.highlight(true); }, onMouseLeave: function () { return _this.highlight(false); } },
                                React.createElement("input", { type: 'checkbox', checked: !!this.props.membraneData.__isVisible, onChange: function () { return _this.toggle(); }, disabled: !!this.props.membraneData.__isBusy }),
                                " ",
                                this.props.label));
                    };
                    return Membrane;
                }(React.Component));
                UI.Membrane = Membrane;
                var __colorPickerIdSeq = 0;
                function generateColorPickerId() {
                    return "color-picker-" + __colorPickerIdSeq++;
                }
                var ColorPicker = (function (_super) {
                    __extends(ColorPicker, _super);
                    function ColorPicker() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this.state = { visible: false };
                        return _this;
                    }
                    ColorPicker.prototype.componentDidMount = function () {
                        var _this = this;
                        this.id = generateColorPickerId();
                        $(window).on('click', (function (e) {
                            if (!_this.state.visible) {
                                return;
                            }
                            var el = $("#" + _this.id)[0].children[0];
                            var rect = el.getBoundingClientRect();
                            if (!(e.clientX >= rect.left && e.clientX <= rect.left + rect.width
                                && e.clientY >= rect.top && e.clientY <= rect.top + rect.height)) {
                                _this.setState({ visible: false });
                            }
                        }).bind(this));
                    };
                    ColorPicker.prototype.render = function () {
                        var _this = this;
                        if (!this.props.tunnel.__isVisible) {
                            return React.createElement("span", null);
                        }
                        var color = (this.props.tunnel.__color !== void 0) ? this.props.tunnel.__color : MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Colors.get(MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Enum.DefaultColor);
                        var plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                        if (this.state.visible) {
                            return React.createElement("div", { className: "color-picker", id: this.id },
                                React.createElement(LiteMol.Plugin.Controls.ColorPicker, { color: color, onChange: function (c) {
                                        _this.props.tunnel.__color = c;
                                        Channels_1.State.showChannelVisuals(plugin, [_this.props.tunnel], _this.props.tunnel.__isVisible, true);
                                    } }));
                        }
                        else {
                            return React.createElement("div", { className: "color-picker", id: this.id, style: { backgroundColor: "rgb(" + Math.ceil(color.r * 255) + "," + Math.ceil(color.g * 255) + "," + Math.ceil(color.b * 255) + ")" }, onClick: function (e) {
                                    _this.setState({ visible: true });
                                } });
                        }
                    };
                    return ColorPicker;
                }(React.Component));
                UI.ColorPicker = ColorPicker;
            })(UI = Channels_1.UI || (Channels_1.UI = {}));
        })(Channels = Example.Channels || (Example.Channels = {}));
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
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
            /**
             * We don't want the default behaviour of the plugin for our example.
             */
            var Views = LiteMol.Plugin.Views;
            var Bootstrap = LiteMol.Bootstrap;
            var Interactivity = Bootstrap.Interactivity;
            var Transformer = Bootstrap.Entity.Transformer;
            var LayoutRegion = Bootstrap.Components.LayoutRegion;
            /**
             * Support for custom highlight tooltips.
             */
            function HighlightCustomElements(context) {
                context.highlight.addProvider(function (info) {
                    if (Interactivity.isEmpty(info) || info.source.type !== Bootstrap.Entity.Visual.Surface)
                        return void 0;
                    var tag = info.source.props.tag;
                    var e = tag.element;
                    switch (tag.kind) {
                        case 'Cavity-inner': return "<b>" + e.Type + " " + e.Id + "</b>, Volume: " + (e.Volume | 0) + " \u00C5";
                        case 'Cavity-boundary': return "<b>" + e.Type + " " + e.Id + "</b>, Volume: " + (e.Volume | 0) + " \u00C5, Center: " + Channels.Behaviour.vec3str(Channels.Behaviour.getTriangleCenter(tag.surface, info.elements[0]));
                        case 'Channel': {
                            var tunnel = e;
                            var len = CommonUtils.Tunnels.getLength(tunnel);
                            var bneck = CommonUtils.Tunnels.getBottleneck(tunnel);
                            var annotations = MoleOnlineWebUI.Cache.ChannelsDBData.getChannelAnnotationsImmediate(tunnel.Id);
                            if (Common.Util.Router.isInChannelsDBMode() && annotations !== null && annotations.length > 0) {
                                return "<b>" + annotations[0].name + "</b>, Length: " + len + " \u00C5 | Bottleneck: " + bneck + " \u00C5";
                            }
                            else {
                                var name_5 = MoleOnlineWebUI.Cache.TunnelName.get(tunnel.GUID);
                                var namePart = (name_5 === void 0) ? '' : " (" + name_5 + ")";
                                return "<b>" + tunnel.Type + namePart + "</b>, Length: " + len + " \u00C5 | Bottleneck: " + bneck + " \u00C5";
                            }
                        }
                        case 'Origins': {
                            var o = e.Points[info.elements[0]];
                            return "<b>Origin</b> (" + e.Type + ") at (" + Number(o.X).toFixed(2) + ", " + Number(o.Y).toFixed(2) + ", " + Number(o.Z).toFixed(2) + ")";
                        }
                        case 'Points': {
                            var o = e[info.elements[0]];
                            return "<b>Selected Point</b> at (" + Number(o.x).toFixed(2) + ", " + Number(o.y).toFixed(2) + ", " + Number(o.z).toFixed(2) + ")";
                        }
                        default: return void 0;
                    }
                });
            }
            Channels.HighlightCustomElements = HighlightCustomElements;
            function isSelectableVisual(info, ctx) {
                if (Interactivity.isEmpty(info) || info.source.type !== Bootstrap.Entity.Visual.Surface)
                    return true;
                var tag = info.source.props.tag;
                return tag.kind === 'Channel';
            }
            Channels.PluginSpec = {
                settings: {
                    'molecule.model.defaultQuery': "residuesByName('GLY', 'ALA')",
                    'molecule.model.defaultAssemblyName': '1'
                },
                transforms: [
                    // Molecule(model) transforms
                    { transformer: Transformer.Molecule.CreateModel, view: Views.Transform.Molecule.CreateModel, initiallyCollapsed: true },
                    { transformer: Transformer.Molecule.CreateSelection, view: Views.Transform.Molecule.CreateSelection, initiallyCollapsed: true },
                    { transformer: Transformer.Molecule.CreateAssembly, view: Views.Transform.Molecule.CreateAssembly, initiallyCollapsed: true },
                    { transformer: Transformer.Molecule.CreateSymmetryMates, view: Views.Transform.Molecule.CreateSymmetryMates, initiallyCollapsed: true },
                    { transformer: Transformer.Molecule.CreateMacromoleculeVisual, view: Views.Transform.Empty },
                    { transformer: Transformer.Molecule.CreateVisual, view: Views.Transform.Molecule.CreateVisual }
                ],
                behaviours: [
                    // you will find the source of all behaviours in the Bootstrap/Behaviour directory
                    Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
                    //Bootstrap.Behaviour.FilteredFocusCameraOnSelect(isSelectableVisual),,
                    // this colors the visual when a selection is created on it.
                    Bootstrap.Behaviour.ApplySelectionToVisual,
                    // this colors the visual when it's selected by mouse or touch
                    Bootstrap.Behaviour.FilteredApplyInteractivitySelection(isSelectableVisual),
                    // this shows what atom/residue is the pointer currently over
                    Bootstrap.Behaviour.Molecule.HighlightElementInfo,
                    // when the same element is clicked twice in a row, the selection is emptied
                    Bootstrap.Behaviour.UnselectElementOnRepeatedClick,
                    // distance to the last "clicked" element
                    Bootstrap.Behaviour.Molecule.DistanceToLastClickedElement,
                    // this tracks what is downloaded and some basic actions. Does not send any private data etc. Source in Bootstrap/Behaviour/Analytics 
                    Bootstrap.Behaviour.GoogleAnalytics('UA-77062725-1'),
                    HighlightCustomElements
                ],
                components: [
                    LiteMol.Plugin.Components.Visualization.HighlightInfo(LayoutRegion.Main, true),
                    LiteMol.Plugin.Components.Entity.Current('LiteMol', LiteMol.Plugin.VERSION.number)(LayoutRegion.Right, true),
                    LiteMol.Plugin.Components.Transform.View(LayoutRegion.Right),
                    LiteMol.Plugin.Components.Context.Log(LayoutRegion.Bottom, true),
                    LiteMol.Plugin.Components.Context.Overlay(LayoutRegion.Root),
                    LiteMol.Plugin.Components.Context.Toast(LayoutRegion.Main, true),
                    LiteMol.Plugin.Components.Context.BackgroundTasks(LayoutRegion.Main, true)
                ],
                viewport: {
                    view: Views.Visualization.Viewport,
                    controlsView: Views.Visualization.ViewportControls
                },
                layoutView: Views.Layout,
                tree: {
                    region: LayoutRegion.Left,
                    view: Views.Entity.Tree
                }
            };
        })(Channels = Example.Channels || (Example.Channels = {}));
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
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
            var Vizualizer = LayersVizualizer;
            (function () {
                window.TOUCH_MODE = false;
                window.addEventListener('touchstart', function onFirstTouch() {
                    window.TOUCH_MODE = true;
                    window.removeEventListener('touchstart', onFirstTouch, false);
                    $(window).trigger('resize');
                }, false);
                SimpleRouter.GlobalRouter.init(Config.Routing.ROUTING_OPTIONS[Config.Routing.ROUTING_MODE]);
                console.log(Config.Routing.ROUTING_MODE);
                Common.Util.LastNSessions.updateWithCurrentSession();
                var lvSettings = {
                    coloringProperty: "Hydropathy",
                    useColorMinMax: true,
                    skipMiddleColor: false,
                    topMargin: 0,
                    customRadiusProperty: "MinRadius"
                };
                //Create instance of layer vizualizer
                var layerVizualizer = new LayersVizualizer.Vizualizer('layer-vizualizer-ui', lvSettings);
                MoleOnlineWebUI.Bridge.Instances.setLayersVizualizer(layerVizualizer);
                var plugin = LiteMol.Plugin.create({
                    target: '#plugin',
                    viewportBackground: '#fff',
                    layoutState: {
                        hideControls: true,
                        isExpanded: false,
                        collapsedControlsLayout: LiteMol.Bootstrap.Components.CollapsedControlsLayout.Landscape
                    },
                    customSpecification: Channels.PluginSpec
                });
                MoleOnlineWebUI.Bridge.Instances.setPlugin(plugin);
                CommonUtils.Selection.SelectionHelper.attachSelectionHelperHandlerToEventHandler(plugin);
                Channels.UI.render(plugin, document.getElementById('ui'));
                QuickHelp.UI.render(document.getElementById('quick-help'));
                Vizualizer.UI.render(layerVizualizer, document.getElementById('layer-vizualizer-ui'), plugin);
                AglomeredParameters.UI.render(document.getElementById('left-tabs-2'), plugin);
                //LayerProperties.UI.render(document.getElementById("right-tabs-1") !, plugin);
                LayerProperties.UI.render(document.getElementById("layer-properties"), plugin);
                //LayerResidues.UI.render(document.getElementById("right-tabs-2") !, plugin);
                LayerResidues.UI.render(document.getElementById("layer-residues"), plugin);
                LiningResidues.UI.render(document.getElementById("right-tabs-2"), plugin);
                ChannelParameters.UI.render(document.getElementById("right-tabs-3"), plugin);
                Controls.UI.render(document.getElementById("controls"));
                //ResidueAnnotations.UI.render(document.getElementById("right-tabs-3") !, plugin);
                //ProteinAnnotations.UI.render(document.getElementById("right-panel-tabs-1") !, plugin);
                DownloadReport.UI.render(document.getElementById("download-report"));
                PDFReportGenerator.UI.render(document.getElementById("pdf-report-generator"));
                PdbIdSign.UI.render(document.getElementById("pdbid-sign"));
                Help.UI.render(document.getElementById("help-button"));
                Annotate.UI.render(document.getElementById("annotate"));
                AlertMessages.UI.render(document.getElementById("alert-messages"));
                SequenceViewer.UI.render(document.getElementById("sequence-viewer"), plugin);
                LoadingScreen.UI.render(document.getElementById("loading-screen"));
            })();
        })(Channels = Example.Channels || (Example.Channels = {}));
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
