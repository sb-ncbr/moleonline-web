var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var Config;
(function (Config) {
    class Routing {
    }
    Routing.ROUTING_OPTIONS = {
        "local": { defaultContextPath: "/online" },
        "test": { defaultContextPath: "/online" },
        "prod": { defaultContextPath: "/online" },
    };
    Routing.ROUTING_MODE = "unknown";
    Config.Routing = Routing;
    class DataSources {
    }
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
    class CommonOptions {
    }
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
        let layersData = [];
        let layerCount = layersObject.LayersInfo.length;
        /*
        export interface LayerData{
        StartDistance: number,
        EndDistance: number,
        MinRadius: number,
        MinFreeRadius: number,
        Properties: any,
        Residues: any
        */
        for (let i = 0; i < layerCount; i++) {
            /*
            Hydrophobicity: number,
            Hydropathy: number,
            Polarity: number,
            Mutability: number
            */
            let properties = {
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
    class Tunnels {
        static getLength(tunnel) {
            let len = tunnel.Layers.LayersInfo[tunnel.Layers.LayersInfo.length - 1].LayerGeometry.EndDistance;
            len = CommonUtils.Numbers.roundToDecimal(len, 1); //Math.round(len*10)/10;
            return len;
        }
        static getBottleneck(tunnel) {
            let bneck = "<Unknown>";
            for (let element of tunnel.Layers.LayersInfo) {
                if (element.LayerGeometry.Bottleneck) {
                    let val = element.LayerGeometry.MinRadius;
                    bneck = (Math.round(val * 10) / 10).toString();
                    break;
                }
            }
            return bneck;
        }
        static getName(tunnel) {
            if (tunnel === void 0) {
                return void 0;
            }
            return MoleOnlineWebUI.Cache.TunnelName.get(tunnel.GUID);
        }
        static concatTunnelsSafe(origin, newTunnels) {
            if (newTunnels === void 0) {
                return origin;
            }
            return origin.concat(newTunnels);
        }
    }
    CommonUtils.Tunnels = Tunnels;
})(CommonUtils || (CommonUtils = {}));
var CommonUtils;
(function (CommonUtils) {
    class Numbers {
        static roundToDecimal(number, numOfDecimals) {
            if (number.toString().indexOf(".") <= 0 && number.toString().indexOf(",") <= 0) {
                return number;
            }
            let dec = Math.pow(10, numOfDecimals);
            return Math.round(number * dec) / dec;
        }
    }
    CommonUtils.Numbers = Numbers;
})(CommonUtils || (CommonUtils = {}));
var CommonUtils;
(function (CommonUtils) {
    ;
    class Residues {
        static initCache() {
            if (this.cache !== void 0) {
                return;
            }
            this.cache = new Map();
        }
        static getNameDirect(residueSeqNumber, plugin) {
            if (plugin.context.select('polymer-visual')[0].props !== void 0) {
                let props = plugin.context.select('polymer-visual')[0].props;
                if (props.model === void 0 || props.model.model === void 0) {
                    return "";
                }
                let model = props.model.model;
                let params = LiteMol.Core.Structure.Query.residuesById(residueSeqNumber).compile()(LiteMol.Core.Structure.Query.Context.ofStructure(model));
                let fragment = params.fragments[0];
                let residueInd = fragment.residueIndices[0];
                let residueData = params.context.structure.data.residues;
                let resIdx = residueData.indices[residueInd];
                let name = residueData.name[resIdx];
                return name;
            }
            return "";
        }
        static getName(residueSeqNumber, plugin) {
            this.initCache();
            if (this.cache.has(residueSeqNumber)) {
                let name = this.cache.get(residueSeqNumber);
                if (name === void 0) {
                    return "";
                }
                return name;
            }
            let name = this.getNameDirect(residueSeqNumber, plugin);
            this.cache.set(residueSeqNumber, name);
            return name;
        }
        static sort(residues, groupFunction, hasName, includeBackbone) {
            if (includeBackbone === void 0) {
                includeBackbone = false;
            }
            if (hasName === void 0) {
                hasName = false;
            }
            if (residues.length === 0) {
                return residues;
            }
            let resParsed = this.parseResidues(residues, hasName);
            let groups = [];
            if (groupFunction !== void 0) {
                groups = groupFunction(resParsed);
            }
            else {
                groups.push(resParsed);
            }
            let sortFn = this.getSortFunctionBackboneChainSeq();
            let all = [];
            for (let group of groups) {
                all = all.concat(group.sort(sortFn));
            }
            return all.map((val, idx, array) => {
                if (hasName) {
                    return `${val.name} ${val.authSeqNumber} ${val.chain.authAsymId}${(includeBackbone && val.backbone) ? ' Backbone' : ''}`;
                }
                else {
                    return `${val.authSeqNumber} ${val.chain.authAsymId}${(includeBackbone && val.backbone) ? ' Backbone' : ''}`;
                }
            });
        }
        static parseResidue(residue) {
            return residue.split(" ");
        }
        static parseResidues(residues, hasName) {
            if (hasName === void 0) {
                hasName = false;
            }
            let resParsed = [];
            for (let residue of residues) {
                let residueParts = this.parseResidue(residue);
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
        }
        static getSortFunctionBackboneChainSeq() {
            return (a, b) => {
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
        }
        static getSortFunctionChainSeqBackbone() {
            return (a, b) => {
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
        }
        static codelistSearch(whereToSearch, results, query) {
            for (let idx = 0; idx < whereToSearch.length; idx++) {
                if (whereToSearch[idx] === query) {
                    return results[idx];
                }
            }
            return "";
        }
        static getSequenceLetterByName(name) {
            let rv = this.codelistSearch(this.residueNames, this.sequenceLetters, name);
            return (rv === "") ? "~" : rv;
        }
        static getNameBySequenceLetter(letter) {
            let rv = this.codelistSearch(this.sequenceLetters, this.residueNames, letter);
            return (rv === "") ? "<Unknown>" : rv;
        }
        static getResidueClassByName(authName) {
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
        }
        static currentContextHasResidue(residueName) {
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            if (plugin.context.select('polymer-visual')[0].props !== void 0) {
                let props = plugin.context.select('polymer-visual')[0].props;
                if (props.model === void 0 || props.model.model === void 0) {
                    return false;
                }
                let model = props.model.model;
                let params = LiteMol.Core.Structure.Query.residuesByName(residueName.toUpperCase()).compile()(LiteMol.Core.Structure.Query.Context.ofStructure(model));
                return params.fragments.length > 0;
            }
            return false;
        }
        static getCenterOfMass(residues) {
            let positions = [];
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            for (let residue of residues) {
                let moleculeModel = getNodeFromTree(plugin.root, 'protein-data');
                if (moleculeModel === null) {
                    console.log("protein data not ready!");
                    return null;
                }
                let proteinData = moleculeModel.children[0].props.molecule.models[0].data;
                let indices = [];
                let residueCount = moleculeModel.children[0].props.molecule.models[0].data.residues.count;
                for (let i = 0; i < residueCount; i++) {
                    if (String(proteinData.residues.authSeqNumber[i]) === String(residue.SequenceNumber)
                        && String(proteinData.residues.authAsymId[i]) === residue.Chain) {
                        indices.push(proteinData.residues.atomStartIndex[i]);
                        indices.push(proteinData.residues.atomEndIndex[i]);
                        break;
                    }
                }
                for (let i = 0; i < indices.length; i++) {
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
            let sum = positions.reduce((prev, cur, idx, array) => {
                return {
                    X: prev.X + cur.X,
                    Y: prev.Y + cur.Y,
                    Z: prev.Z + cur.Z
                };
            });
            let centerOfMass = {
                X: sum.X / positions.length,
                Y: sum.Y / positions.length,
                Z: sum.Z / positions.length,
            };
            return centerOfMass;
        }
    }
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
        for (let c of root.children) {
            let n = getNodeFromTree(c, ref);
            if (n !== null) {
                return n;
            }
        }
        return null;
    }
    function removeNodeFromTree(plugin, nodeRef) {
        let obj = getNodeFromTree(plugin.root, nodeRef);
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
        class SelectionHelper {
            static attachOnResidueBulkSelectHandler(handler) {
                if (this.onResidueBulkSelectHandlers === void 0) {
                    this.onResidueBulkSelectHandlers = [];
                }
                this.onResidueBulkSelectHandlers.push({ handler });
            }
            static invokeOnResidueBulkSelectHandlers(residues) {
                if (this.onResidueBulkSelectHandlers === void 0) {
                    return;
                }
                for (let h of this.onResidueBulkSelectHandlers) {
                    h.handler(residues);
                }
            }
            static attachOnClearSelectionHandler(handler) {
                if (this.onClearSelectionHandlers === void 0) {
                    this.onClearSelectionHandlers = [];
                }
                this.onClearSelectionHandlers.push({ handler });
            }
            static invokeOnClearSelectionHandlers() {
                if (this.onClearSelectionHandlers === void 0) {
                    return;
                }
                for (let h of this.onClearSelectionHandlers) {
                    h.handler();
                }
            }
            static attachOnChannelSelectHandler(handler) {
                if (this.onChannelSelectHandlers === void 0) {
                    this.onChannelSelectHandlers = [];
                }
                this.onChannelSelectHandlers.push({ handler });
            }
            static invokeOnChannelSelectHandlers(data, channelId) {
                if (this.onChannelSelectHandlers === void 0) {
                    return;
                }
                for (let h of this.onChannelSelectHandlers) {
                    h.handler(data, channelId);
                }
            }
            static attachOnChannelDeselectHandler(handler) {
                if (this.onChannelDeselectHandlers === void 0) {
                    this.onChannelDeselectHandlers = [];
                }
                this.onChannelDeselectHandlers.push({ handler });
            }
            static invokeOnChannelDeselectHandlers() {
                if (this.onChannelDeselectHandlers === void 0) {
                    return;
                }
                for (let h of this.onChannelDeselectHandlers) {
                    h.handler();
                }
            }
            //For PDF report
            static forceInvokeOnChannelDeselectHandlers() {
                this.invokeOnChannelDeselectHandlers();
            }
            static attachOnPointBulkSelectHandler(handler) {
                if (this.onPointSelectHandlers === void 0) {
                    this.onPointSelectHandlers = [];
                }
                this.onPointSelectHandlers.push({ handler });
            }
            static invokeOnPointSelectHandlers(points) {
                if (this.onPointSelectHandlers === void 0) {
                    return;
                }
                for (let h of this.onPointSelectHandlers) {
                    h.handler(points);
                }
            }
            static getSelectionVisualRef() {
                return this.SELECTION_VISUAL_REF;
            }
            static getAltSelectionVisualRef() {
                return this.SELECTION_ALT_VISUAL_REF;
            }
            static clearSelection(plugin) {
                this.clearSelectionPrivate(plugin);
                //this.resetScene(plugin);
            }
            static clearSelectionPrivate(plugin) {
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
                this.invokeOnClearSelectionHandlers();
            }
            static clearAltSelection(plugin) {
                LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, this.SELECTION_ALT_VISUAL_REF);
            }
            static resetScene(plugin) {
                LiteMol.Bootstrap.Command.Visual.ResetScene.dispatch(plugin.context, void 0);
            }
            static chainEquals(c1, c2) {
                if ((c1.asymId !== c2.asymId)
                    || (c1.authAsymId !== c2.authAsymId)
                    || (c1.index !== c2.index)) {
                    return false;
                }
                return true;
            }
            static residueEquals(r1, r2) {
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
            }
            static residueBulkSort(bulk) {
                bulk.sort((a, b) => {
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
            }
            static residueBulkEquals(r1, r2) {
                if (r1.length !== r2.length) {
                    return false;
                }
                this.residueBulkSort(r1);
                this.residueBulkSort(r2);
                for (let idx = 0; idx < r1.length; idx++) {
                    if (this.residueLightEquals({ type: "light", info: r1[idx] }, { type: "light", info: r2[idx] })) {
                        return false;
                    }
                }
                return true;
            }
            static selectResiduesBulkWithBallsAndSticks(plugin, residues) {
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
                let queries = [];
                for (let residue of residues) {
                    queries.push(LiteMol.Core.Structure.Query.chainsById(...[residue.chain.authAsymId]).intersectWith(LiteMol.Core.Structure.Query.residues(...[{ authSeqNumber: residue.authSeqNumber }])).compile());
                }
                let query = LiteMol.Core.Structure.Query.or(...queries);
                let t = plugin.createTransform();
                const visualStyle = LiteMol.Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks');
                if (visualStyle !== void 0) {
                    visualStyle.taskType = "Silent";
                }
                t.add('polymer-visual', Transformer.Molecule.CreateSelectionFromQuery, { query, name: 'Residues', silent: true }, { ref: CommonUtils.Selection.SelectionHelper.getSelectionVisualRef(), isHidden: true })
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
            }
            static getSelectedResidues() {
                if (this.selectedBulkResidues !== void 0) {
                    return this.selectedBulkResidues.map((val, idx, arr) => {
                        return { type: "light", info: val };
                    });
                }
                return [];
            }
            static getSelectedPoints() {
                if (this.selectedPoints !== void 0) {
                    return this.selectedPoints;
                }
                return [];
            }
            static residueToLight(residue) {
                return {
                    type: "light",
                    info: {
                        chain: residue.info.chain,
                        authSeqNumber: residue.info.authSeqNumber
                    }
                };
            }
            static residueLightEquals(r1, r2) {
                if ((!this.chainLightEquals(r1.info.chain, r2.info.chain))
                    || r1.info.authSeqNumber !== r2.info.authSeqNumber) {
                    return false;
                }
                return true;
            }
            static chainLightEquals(c1, c2) {
                return (c1.authAsymId === c2.authAsymId);
            }
            static isSelectedAnyChannel() {
                return this.selectedChannelRef !== void 0;
            }
            static isSelectedAny() {
                return this.isSelectedAnyChannel() /*|| this.selectedResidue !== void 0*/ || this.selectedBulkResidues !== void 0 || this.selectedPoints !== void 0;
            }
            /**
             *
             * @param seqNumber
             * @param chain
             * @return True - residue selected | False - residue deselected
             */
            static addResidueToSelection(seqNumber, chain) {
                let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                let residues = CommonUtils.Selection.SelectionHelper.getSelectedResidues();
                let newSelection = [];
                let deselectMode = false;
                for (let r of residues) {
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
            }
            /**
             *
             * @param residues
             * @param doRemove specifies wheter or not remove residues contained in both current selection and new selection. By default - true
             */
            static addResiduesToSelection(residues, doRemove) {
                doRemove = (doRemove === void 0) ? true : doRemove;
                let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                let currentResidues = CommonUtils.Selection.SelectionHelper.getSelectedResidues();
                let newSelection = [];
                let contains = (res, array) => {
                    for (let i of array) {
                        if (i.info.authSeqNumber === res.authSeqNumber && i.info.chain.authAsymId === res.chain.authAsymId) {
                            return true;
                        }
                    }
                    return false;
                };
                let toRemove = [];
                for (let r of residues) {
                    if (contains(r, currentResidues)) {
                        toRemove.push({ type: "light", info: r });
                        continue;
                    }
                    newSelection.push(r);
                }
                if (toRemove.length > 0 && doRemove) {
                    for (let r of currentResidues) {
                        if (!contains(r.info, toRemove)) {
                            newSelection.push({ authSeqNumber: r.info.authSeqNumber, chain: { authAsymId: r.info.chain.authAsymId } });
                        }
                    }
                }
                else {
                    newSelection = newSelection.concat(currentResidues.map((val, idx, arr) => {
                        return val.info;
                    }));
                }
                if (newSelection.length > 0) {
                    this.selectResiduesBulkWithBallsAndSticks(plugin, newSelection);
                }
                else {
                    this.clearSelection(plugin);
                }
            }
            static isSelected(residue) {
                if (this.selectedBulkResidues === void 0) {
                    return false;
                }
                for (let r of this.selectedBulkResidues) {
                    if (this.residueLightEquals(this.residueToLight({ type: "full", info: residue }), { type: "light", info: r })) {
                        return true;
                    }
                }
                return false;
            }
            /**
             *
             * @param point
             * @return True - point selected | False - point deselected
             */
            static addPointToSelection(point) {
                let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                let points = CommonUtils.Selection.SelectionHelper.getSelectedPoints();
                let newSelection = [];
                let deselectMode = false;
                for (let p of points) {
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
            }
            static isSelectedPoint(point) {
                if (this.selectedPoints === void 0) {
                    return false;
                }
                for (let p of this.selectedPoints) {
                    if (p.x === point.x && p.y === point.y && p.z === point.z) {
                        return true;
                    }
                }
                return false;
            }
            static clearSelectedPoints() {
                let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                plugin.command(LiteMol.Bootstrap.Command.Tree.RemoveNode, "point-selection");
                this.selectedPoints = void 0;
            }
            static clearSelectedTPoint() {
                let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                plugin.command(LiteMol.Bootstrap.Command.Tree.RemoveNode, "point-selection-T");
                this.selectedTPoint = void 0;
            }
            static createPointsSelectionVisual(points) {
                let s = LiteMol.Visualization.Primitive.Builder.create();
                let id = 0;
                for (let p of points) {
                    s.add({ type: 'Sphere', id: id++, radius: 1.69, center: [Number(p.x), Number(p.y), Number(p.z)] });
                }
                let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                this.clearSelectedPoints();
                s.buildSurface().run().then(surface => {
                    let t = plugin.createTransform()
                        .add('mole-data', LiteMol.Example.Channels.State.CreateSurface, {
                        //label: 'Selected points (' + origins.Type + ')',
                        tag: { kind: 'Points', element: points },
                        surface,
                        isInteractive: true,
                        color: MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Colors.get(MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Enum.SyntethicSelect)
                    }, { ref: "point-selection", isHidden: true });
                    plugin.applyTransform(t);
                });
            }
            static createTPointSelectionVisual(point) {
                let s = LiteMol.Visualization.Primitive.Builder.create();
                let id = 0;
                s.add({ type: 'Sphere', id: id++, radius: 1.69, center: [point.X, point.Y, point.Z] });
                let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                this.clearSelectedTPoint();
                s.buildSurface().run().then(surface => {
                    let t = plugin.createTransform()
                        .add('mole-data', LiteMol.Example.Channels.State.CreateSurface, {
                        //label: 'Selected points (' + origins.Type + ')',
                        tag: { kind: 'TPoint', element: point },
                        surface,
                        isInteractive: true,
                        color: MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Colors.get(MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Enum.TPoint)
                    }, { ref: "point-selection-T", isHidden: true });
                    plugin.applyTransform(t);
                });
            }
            static selectPoints(points) {
                let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                CommonUtils.Selection.SelectionHelper.clearSelectionPrivate(plugin);
                this.selectedChannelRef = void 0;
                this.selectedChannelData = void 0;
                this.selectedChannelId = void 0;
                this.selectedBulkResidues = void 0;
                this.selectedPoints = void 0;
                this.createPointsSelectionVisual(points);
                this.selectedPoints = points;
                this.invokeOnPointSelectHandlers(points);
            }
            static getSelectedChannelData() {
                return (this.selectedChannelData === void 0) ? null : this.selectedChannelData;
            }
            static getSelectedChannelRef() {
                return (this.selectedChannelRef === void 0) ? "" : this.selectedChannelRef;
            }
            static getSelectedChannelId() {
                return (this.selectedChannelId === void 0) ? "" : this.selectedChannelId;
            }
            static attachSelectionHelperHandlerToEventHandler(plugin) {
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(() => {
                    this.clearSelection(MoleOnlineWebUI.Bridge.Instances.getPlugin());
                });
                this.attachOnResidueBulkSelectHandler((residues) => {
                    let ref = "residue-selection-T";
                    if (residues.length > 0) {
                        let centerOfMass = CommonUtils.Residues.getCenterOfMass(residues.map((val, idx, arr) => {
                            return {
                                Chain: val.chain.authAsymId,
                                SequenceNumber: val.authSeqNumber
                            };
                        }));
                        if (centerOfMass === null) {
                            return;
                        }
                        this.selectedTPoint = centerOfMass;
                        this.createTPointSelectionVisual(centerOfMass);
                    }
                    else {
                        this.clearSelectedTPoint();
                    }
                });
                //Residue 3D OnClick
                plugin.subscribe(LiteMol.Bootstrap.Event.Molecule.ModelSelect, e => {
                    if (!!e.data) {
                        let r = e.data.residues[0];
                        CommonUtils.Selection.SelectionHelper.addResidueToSelection(r.authSeqNumber, r.chain.authAsymId);
                    }
                });
                LiteMol.Example.Channels.Behaviour.initCavityBoundaryToggle(plugin);
                LiteMol.Example.Channels.Behaviour.createSelectEvent(plugin).subscribe(e => {
                    if ((e.kind === 'nothing') || (e.kind === 'molecule')) {
                        return;
                    }
                    else if (e.kind === 'point') {
                        this.addPointToSelection({ x: `${e.data[0].toFixed(2)}`, y: `${e.data[1].toFixed(2)}`, z: `${e.data[2].toFixed(2)}` });
                    }
                });
                this.interactionEventStream = LiteMol.Bootstrap.Event.Visual.VisualSelectElement.getStream(plugin.context)
                    .subscribe(e => this.interactionHandler('select', e.data, plugin));
            }
            static interactionHandler(type, i, plugin) {
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
                    let data = i.source.props.tag.element;
                    if (i.elements === void 0) {
                        return;
                    }
                    if (this.selectedBulkResidues !== void 0) {
                        this.selectResiduesBulkWithBallsAndSticks(plugin, []);
                    }
                    for (let elIdx of i.elements) {
                        this.addPointToSelection(data[elIdx]);
                    }
                    return;
                }
                if (i.source.props.tag.kind === "TPoint") {
                    let data = i.source.props.tag.element;
                    if (i.elements === void 0) {
                        return;
                    }
                    if (this.selectedBulkResidues !== void 0) {
                        this.selectResiduesBulkWithBallsAndSticks(plugin, []);
                    }
                    for (let elIdx of i.elements) {
                        let p = data;
                        this.addPointToSelection({ x: `${Number(p.X).toFixed(2)}`, y: `${Number(p.Y).toFixed(2)}`, z: `${Number(p.Z).toFixed(2)}` });
                    }
                    return;
                }
                if (i.source.props.tag.kind === "Origins") {
                    let data = i.source.props.tag.element;
                    if (i.elements === void 0) {
                        return;
                    }
                    for (let elIdx of i.elements) {
                        let p = data.Points[elIdx];
                        let pPto = { x: Number(p.X).toFixed(2), y: Number(p.Y).toFixed(2), z: Number(p.Z).toFixed(2) };
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
            }
        }
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
            let entities = plugin.selectEntities(ref);
            let v = entities[0];
            if (LiteMol.Bootstrap.Entity.isVisual(entities[0]) && v.props.isSelectable) {
                v.props.model.applySelection(getIndices(v), 1 /* Select */);
            }
        }
        function deselectTunnelByRef(plugin, ref) {
            let entities = plugin.selectEntities(ref);
            let v = entities[0];
            if (LiteMol.Bootstrap.Entity.isVisual(entities[0]) && v.props.isSelectable) {
                v.props.model.applySelection(getIndices(v), 2 /* RemoveSelect */);
            }
        }
    })(Selection = CommonUtils.Selection || (CommonUtils.Selection = {}));
})(CommonUtils || (CommonUtils = {}));
var CommonUtils;
(function (CommonUtils) {
    var Router;
    (function (Router) {
        ;
        function getParameters() {
            /*let suppressDefaultSubmitId_ = (suppressDefaultSubmitId===void 0)?false:suppressDefaultSubmitId;*/
            let parametersChannelsDBTest = SimpleRouter.GlobalRouter.getParametersByRegex(/\/online\/([a-zA-Z0-9]+)\/ChannelsDB/g);
            let parameters = SimpleRouter.GlobalRouter.getParametersByRegex(/\/online\/([a-zA-Z0-9]+)\/*([0-9]*)/g);
            let computationId = null;
            let submitId = 0; //(suppressDefaultSubmitId_)?0:1;
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
                submitId,
                computationId,
                isChannelsDB: parametersChannelsDBTest !== null && parametersChannelsDBTest.length > 0
            };
        }
        Router.getParameters = getParameters;
        function redirect(computationId, submitId) {
            SimpleRouter.GlobalRouter.redirect(`/${computationId}/${submitId}`, true);
        }
        Router.redirect = redirect;
        function fakeRedirect(computationId, submitId) {
            if (submitId !== void 0) {
                SimpleRouter.GlobalRouter.fakeRedirect(`/${computationId}/${submitId}`, true);
            }
            else {
                SimpleRouter.GlobalRouter.fakeRedirect(`/${computationId}/`, true);
            }
        }
        Router.fakeRedirect = fakeRedirect;
        function isInChannelsDBMode() {
            let params = CommonUtils.Router.getParameters();
            return params !== null && params.isChannelsDB;
        }
        Router.isInChannelsDBMode = isInChannelsDBMode;
        function getCurrentUrl() {
            return window.location.href;
        }
        Router.getCurrentUrl = getCurrentUrl;
    })(Router = CommonUtils.Router || (CommonUtils.Router = {}));
})(CommonUtils || (CommonUtils = {}));
var CommonUtils;
(function (CommonUtils) {
    var Tabs;
    (function (Tabs) {
        function getTabLinkById(tabbedElementId, tabId) {
            let tabs = $(`#${tabbedElementId} li a`);
            for (let t of tabs) {
                if ($(t).attr('href') === `#${tabbedElementId}-${tabId}`) {
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
                let link = getTabLinkById(tabbedElementId, tabId);
                let href = link.attr("href");
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
    class Tooltips {
        static checkLoop() {
            if (this.checkedElements.size > 0) {
                window.setTimeout(() => {
                    let finished = [];
                    this.checkedElements.forEach((val, key, map) => {
                        if (this.checkElement(key)) {
                            finished.push(key);
                            if (Config.CommonOptions.DEBUG_MODE)
                                console.log('tooltip for ' + key + ' is initialized');
                        }
                    });
                    for (let elementId of finished) {
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log('tooltipInit: removing ' + elementId + ' from loop');
                        this.checkedElements.delete(elementId);
                    }
                });
            }
        }
        static checkElement(elementId) {
            if ($(`#${elementId}`).length === 0) {
                return false;
            }
            $(`#${elementId}`).tooltip();
            return true;
        }
        static initWhenReady(elementId) {
            this.checkedElements.set(elementId, elementId);
            this.checkLoop();
        }
        static initImmediate(element, content) {
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
        }
        static destroy(element) {
            if ($(element).length === 0) {
                return false;
            }
            $(element).tooltip("destroy");
            return true;
        }
    }
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
            let a = document.createElement("a");
            document.body.appendChild(a);
            $(a).css("display", "none");
            a.href = dataUrl;
            a.download = fileName;
            a.click();
            setTimeout(function () { return a.remove(); }, 20000);
        }
        Misc.triggerDownload = triggerDownload;
        function flattenResiduesArray(residuesArray) {
            let rv = "";
            let idx = 0;
            for (let array of residuesArray) {
                if (idx > 0) {
                    rv = `${rv}, `;
                }
                rv = `${rv}[${flattenResidues(array)}]`;
                idx++;
            }
            return rv;
        }
        Misc.flattenResiduesArray = flattenResiduesArray;
        function flattenResidues(residues) {
            let rv = "";
            for (let r of residues) {
                if (rv !== "") {
                    rv += ", ";
                }
                rv += `${r.Chain} ${r.SequenceNumber}`;
            }
            return rv;
        }
        Misc.flattenResidues = flattenResidues;
        function flattenPoints(pointsArray) {
            let rv = "";
            for (let p of pointsArray) {
                let group = `[${p.x},${p.y},${p.z}]`;
                if (rv.length !== 0) {
                    rv += ",";
                }
                rv += group;
            }
            return rv;
        }
        Misc.flattenPoints = flattenPoints;
        function pointsToString(points) {
            let rv = "";
            for (let p of points) {
                if (rv !== "") {
                    rv += ",";
                }
                rv += `[${p.X},${p.Y},${p.Z}]`;
            }
            return rv;
        }
        Misc.pointsToString = pointsToString;
        function isMoleJob(data) {
            if (data.MoleConfig === void 0 || data.MoleConfig === null) {
                return false;
            }
            let c = data.MoleConfig;
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
            let chains = value.split(",");
            let rv = "";
            let idx = 0;
            for (let chain of chains) {
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
            let parts = residuesArray.split("],[");
            let rv = [];
            for (let part of parts) {
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
            let items = residues.split(',');
            let rv = [];
            let seqNumReg = new RegExp(/^[0-9]+$/);
            let chainReg = new RegExp(/^[A-Z][\-][\d]*$|^[A-Z]{1}$/);
            for (let item of items) {
                let r = item.split(' ');
                let seqNum;
                let chain;
                for (let part of r) {
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
            let parts = value.split(",");
            let x = Number(parts[0]);
            let y = Number(parts[1]);
            let z = Number(parts[2]);
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
            let v = value.replace(/\s+/g, " ");
            v = v.replace(/\s*$/g, '');
            v = v.replace(/^\s*/g, '');
            return v;
        }
        Misc.removeMultipleWSp = removeMultipleWSp;
        function parsePoints(value) {
            value = value.replace(/\]\s*,\s*\[/g, "],[");
            value = removeMultipleWSp(value);
            let parts = value.split("],[");
            let rv = [];
            for (let part of parts) {
                part = part.replace(/\[/g, "");
                part = part.replace(/\]/g, "");
                let point = parsePoint(part);
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
        class Events {
            static attachOnClearEventHandler(h) {
                this.handlers_onClear.push(h);
            }
            static invokeOnClear(formGroup) {
                for (let h of this.handlers_onClear) {
                    h(formGroup);
                }
            }
            static attachOnSubmitEventHandler(h) {
                this.handlers_onSubmit.push(h);
            }
            static invokeOnSubmit(formGroup) {
                for (let h of this.handlers_onSubmit) {
                    h(formGroup);
                }
            }
        }
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
            return new Promise((res, rej) => {
                if (value.length === 0) {
                    res({ valid: true, message: "" });
                }
                let reg = new RegExp(/^[A-Z][\-][\d]*$|^[A-Z]{1}$/);
                value = value.replace(/\s*,\s*/g, ",");
                value = value.replace(/\s*$/g, '');
                value = value.replace(/^\s*/g, '');
                let chains = value.split(",");
                let valid = true;
                for (let chain of chains) {
                    valid = valid && reg.test(chain);
                }
                res({
                    valid,
                    message: (!valid) ? "List of chains is not in readable format!" : ""
                });
            });
        }
        Validators.validateChainsArray = validateChainsArray;
        function validateResidueSimpleArray(value) {
            return new Promise((res, rej) => {
                if (value.length === 0) {
                    res({ valid: true, message: "" });
                }
                let expectedCount = value.split(',').length;
                let valid = CommonUtils.Misc.parseResidues(value).length === expectedCount;
                res({
                    valid,
                    message: (!valid) ? "List of chains is not in readable format!" : ""
                });
            });
        }
        Validators.validateResidueSimpleArray = validateResidueSimpleArray;
        function validatePoints(value) {
            return new Promise((res, rej) => {
                if (value.length === 0) {
                    res({ valid: true, message: "" });
                }
                let v = CommonUtils.Misc.removeMultipleWSp(value);
                let expectedCount = v.split('],[').length;
                let valid = CommonUtils.Misc.parsePoints(value).length === expectedCount;
                res({
                    valid,
                    message: (!valid) ? "List of points is not in readable format!" : ""
                });
            });
        }
        Validators.validatePoints = validatePoints;
        function validateResidueDoubleArray(value) {
            return new Promise((res, rej) => {
                if (value.length === 0) {
                    res({ valid: true, message: "" });
                }
                value = value.replace(/\]\s*,\s*\[/g, '],[');
                let arrays = value.split("],[");
                let expectedCount = value.split(',').length;
                let valid = true;
                let residuesArray = CommonUtils.Misc.parseResiduesArray(value);
                if (residuesArray.length !== arrays.length) {
                    valid = false;
                }
                else {
                    for (let i = 0; i < residuesArray.length; i++) {
                        valid = valid && arrays[i].split(",").length === residuesArray[i].length;
                        if (!valid) {
                            break;
                        }
                    }
                }
                res({
                    valid,
                    message: (!valid) ? "Invalid syntax! Should be [A 69, ...], [A 137, ...], ..." : ""
                });
            });
        }
        Validators.validateResidueDoubleArray = validateResidueDoubleArray;
        function validatePatternQuery(v) {
            return new Promise((res, rej) => {
                if (v.length === 0) {
                    res({ valid: true });
                }
                MoleOnlineWebUI.Service.PatternQueryAPI.ApiService.getValidationResult(v)
                    .then((result) => {
                    if (result.isOk) {
                        res({ valid: true });
                    }
                    else {
                        res({ valid: false, message: (result.error === void 0) ? "" : result.error });
                    }
                })
                    .catch((err) => {
                    rej(err);
                });
            });
        }
        Validators.validatePatternQuery = validatePatternQuery;
    })(Validators = CommonUtils.Validators || (CommonUtils.Validators = {}));
})(CommonUtils || (CommonUtils = {}));
var MoleOnlineWebUI;
(function (MoleOnlineWebUI) {
    var StaticData;
    (function (StaticData) {
        class Bundle {
            static get(key) {
                let value = this.bundle[key];
                if (value === void 0) {
                    return key;
                }
                return value;
            }
        }
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
            "tooltip-agl-Hydropathy": "Average of hydropathy index per each amino acid according to Kyte and Doolittle J.Mol.Biol.(1982) 157, 105-132. Range from the most hydrophilic (Arg = -4.5) to the most hydrophobic (Ile = 4.5)",
            "tooltip-agl-Hydrophobicity": "Average of normalized hydrophobicity scales by Cid et al. J. Protein Engineering (1992) 5, 373-375. Range from the most hydrophilic (Glu = -1.140) to the most hydrophobic (Ile = 1.810)",
            "tooltip-agl-Polarity": "Average of lining amino acid polarities by Zimmermann et al. J. Theor. Biol. (1968) 21, 170-201. Polarity ranges from nonpolar (Ala, Gly = 0) tthrough polar (e.g. Ser = 1.67) to charged (Glu = 49.90, Arg = 52.00)",
            "tooltip-agl-Mutability": "Average of relative mutability index by Jones, D.T. et al. Compur. Appl. Biosci. (1992) 8(3): 275-282. Realtive mutability based on empirical substitution matrices between similar protein sequences. High for easily substitutable amino acids, e.g. polars (Ser = 117, Thr = 107, Asn = 104) or aliphatics (Ala = 100, Val = 98, Ile = 103). Low for important structural amino acids, e.g. aromatics (Trp = 25, Phe = 51, Tyr = 50) or specials (Cys = 44, Pro = 58, Gly = 50).",
            "tooltip-agl-Charge": "Charge",
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
        class WeightFunctions {
            static get() {
                if (this.cache !== void 0) {
                    return this.cache;
                }
                let rv = [];
                for (let key of this.functions) {
                    rv.push({ label: Bundle.get(key), value: key });
                }
                this.cache = rv;
                return rv;
            }
        }
        WeightFunctions.cache = void 0;
        WeightFunctions.functions = ["VoronoiScale", "Length", "LengthAndRadius"];
        StaticData.WeightFunctions = WeightFunctions;
        class TooltipText {
            static get(key) {
                let bundleKey = `tooltip-${key}`;
                let text = Bundle.get(bundleKey);
                if (text === bundleKey) {
                    return key;
                }
                return text;
            }
        }
        StaticData.TooltipText = TooltipText;
        var LiteMolObjectsColorScheme;
        (function (LiteMolObjectsColorScheme) {
            class Colors {
                static get(key) {
                    switch (key) {
                        case Enum.CSAOrigin: return LiteMol.Visualization.Color.fromRgb(128, 255, 128);
                        case Enum.ComputedOrigin: return LiteMol.Visualization.Color.fromRgb(128, 128, 255);
                        case Enum.OtherOrigin: return LiteMol.Visualization.Color.fromRgb(255, 128, 128);
                        case Enum.CavityBoundary: return LiteMol.Visualization.Color.fromHex(0x90ee90); /*LiteMol.Visualization.Color.fromRgb(171,0,0);*/
                        case Enum.CavityInner: return LiteMol.Visualization.Color.fromHex(0x999999); /*LiteMol.Visualization.Color.fromRgb(89,255,105);*/
                        case Enum.CavitySelectable: return LiteMol.Visualization.Color.fromHex(0x90ee90); /*LiteMol.Visualization.Color.fromRgb(171,0,0);*/
                        /*
                        case Enum.Cavity: return LiteMol.Visualization.Molecule.Colors.DefaultPallete[99];
                        case Enum.Surface: return LiteMol.Visualization.Molecule.Colors.DefaultPallete[25];
                        case Enum.Void: return LiteMol.Visualization.Molecule.Colors.DefaultPallete[76];
                        */
                        case Enum.SyntethicSelect: return LiteMol.Visualization.Color.fromRgb(191, 82, 204);
                        case Enum.TPoint: return LiteMol.Visualization.Color.fromRgb(255, 0, 105);
                        case Enum.DefaultColor: return LiteMol.Visualization.Color.fromRgb(0, 0, 0);
                        default: return this.get(Enum.DefaultColor);
                    }
                }
                static shouldExcludeColor(colorIdx) {
                    return !(this.excludedColors.indexOf(colorIdx) < 0);
                }
                static getRandomUnused() {
                    do {
                        this.colorIndex = (this.colorIndex + 1) % LiteMol.Visualization.Molecule.Colors.DefaultPallete.length;
                    } while (this.shouldExcludeColor(this.colorIndex));
                    return LiteMol.Visualization.Molecule.Colors.DefaultPallete[this.colorIndex];
                }
            }
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
            })(Enum = LiteMolObjectsColorScheme.Enum || (LiteMolObjectsColorScheme.Enum = {}));
        })(LiteMolObjectsColorScheme = StaticData.LiteMolObjectsColorScheme || (StaticData.LiteMolObjectsColorScheme = {}));
    })(StaticData = MoleOnlineWebUI.StaticData || (MoleOnlineWebUI.StaticData = {}));
})(MoleOnlineWebUI || (MoleOnlineWebUI = {}));
var SimpleRouter;
(function (SimpleRouter) {
    class URL {
        constructor(url, hasHost = true) {
            this.url = this.removeLastSlash(url);
            this.parts = this.removeTrailingSlashes(url).split("/");
            this.hasHost = hasHost;
            this.parameters = this.parseURLParameters(url);
            this.protocol = this.parseProtocol(url);
        }
        removeProtocolPart(url) {
            let parts = this.url.split("//");
            return parts[parts.length - 1];
        }
        removeLastSlash(url) {
            if (url[url.length - 1] === "/" || url[url.length - 1] === "\\") {
                return url.slice(0, url.length - 1);
            }
            return url;
        }
        removeBeginingSlash(url) {
            if (url[0] === "/" || url[0] === "\\") {
                return url.slice(1);
            }
            return url;
        }
        removeTrailingSlashes(url) {
            return this.removeLastSlash(this.removeBeginingSlash(this.removeProtocolPart(url)));
        }
        substractPathFromStart(path) {
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
        getPart(index) {
            return this.parts[index];
        }
        getLength() {
            return this.parts.length;
        }
        static constructPath(pathParts, useProtocol = false, protocol = "http") {
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
        getParameterValue(name) {
            if (!this.parameters.has(name)) {
                return null;
            }
            let value = this.parameters.get(name);
            if (value === void 0) {
                return null;
            }
            return value;
        }
        parseURLParameters(url) {
            let parts = url.split("?");
            let parameters = new Map();
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
        parseProtocol(url) {
            let protocol = url.split(":");
            if (protocol.length > 1) {
                return protocol[0];
            }
            return "";
        }
        removeParameters() {
            let path = this.url.split("?")[0];
            console.log(`path: ${path}`);
            return new URL(path);
        }
        getProtocol() {
            if (!this.hasHost) {
                return "";
            }
            return this.protocol;
        }
        toString() {
            return URL.constructPath(this.parts, this.hasHost, this.getProtocol());
        }
    }
    SimpleRouter.URL = URL;
    class Router {
        constructor(contextPath) {
            this.contextPath = contextPath;
        }
        /* Buggy !!
        getRelativePath(){
            return new SrURL(document.URL).substractPathFromStart(this.contextPath);
        }
        */
        getAbsoluePath() {
            return new URL(document.URL);
        }
        changeUrl(name, windowTitle, url) {
            let stateObj = { page: name };
            history.pushState(stateObj, windowTitle, url);
        }
    }
    SimpleRouter.Router = Router;
    ;
    class GlobalRouter {
        static init(routingParameters) {
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
        }
        static getCurrentPid() {
            if (!this.isInitialized) {
                throw new Error("GlobalRouter is not inititalised! Call init(..) function before use!");
            }
            return this.currentPid;
        }
        static getCurrentPage() {
            if (!this.isInitialized) {
                throw new Error("GlobalRouter is not inititalised! Call init(..) function before use!");
            }
            let url = this.router.getAbsoluePath();
            url = url.removeParameters();
            return url.getLastPart();
        }
        static redirect(url, relative) {
            let newUrl = this.prepareUrlForRedirect(url, relative);
            window.location.replace(newUrl);
        }
        static prepareUrlForRedirect(url, relative) {
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
        static fakeRedirect(url, relative) {
            let newUrl = this.prepareUrlForRedirect(url, relative);
            if (window.history.pushState) {
                let title = document.title;
                window.history.pushState(null, title, newUrl);
            }
            else {
                window.location.replace(newUrl);
            }
        }
        static getParametersByRegex(regex) {
            let url = this.router.getAbsoluePath();
            return regex.exec(url.toString());
        }
    }
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
            ;
            class ApiService {
                static sendPOST(url, formData) {
                    return this.handleResponse(fetch(url, {
                        method: "POST",
                        body: formData,
                    }), url);
                }
                static sendPOSTjson(url, formData) {
                    const headers = new Headers();
                    headers.append("Accept", "application/json");
                    headers.append("Content-Type", "application/json");
                    return this.handleResponse(fetch(url, {
                        method: "POST",
                        headers,
                        body: JSON.stringify(formData),
                    }), url);
                }
                static sendGET(url) {
                    if (Config.CommonOptions.DEBUG_MODE)
                        console.time(`sendGET '${url}'`);
                    return this.handleResponse(fetch(url, {
                        method: "GET"
                    }), url).then((val) => {
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.timeEnd(`sendGET '${url}'`);
                        return val;
                    });
                }
                static handleResponse(response, url) {
                    return new Promise((res, rej) => {
                        response.then((rawResponse) => {
                            if (!rawResponse.ok) {
                                if (this.DEBUG_MODE) {
                                    console.log(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                                }
                                rej(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                            }
                            else {
                                res(rawResponse.json());
                            }
                        })
                            .catch(err => {
                            rej(err);
                        });
                    });
                }
                static prepareInitUrl(pdbid, usePores, assemblyId) {
                    let pores = (usePores) ? "Pores/" : "";
                    let opts = [];
                    let optional = "";
                    if (assemblyId !== void 0) {
                        optional = "?";
                    }
                    if (assemblyId !== void 0) {
                        opts.push(`assemblyId=${assemblyId}`);
                    }
                    for (let idx = 0; idx < opts.length; idx++) {
                        if (idx > 0) {
                            optional += "&";
                        }
                        optional += opts[idx];
                    }
                    return `${this.baseUrl}/Init/${pores}${pdbid}${optional}`;
                }
                static initWithParams(pdbid, usePores, assemblyId) {
                    let url = this.prepareInitUrl(pdbid, usePores, assemblyId);
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url);
                }
                static initWithFile(formData) {
                    let url = this.prepareInitUrl("", false);
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendPOST(url, formData);
                }
                static getStatus(computationId, submitId) {
                    let optional = "";
                    if (submitId !== void 0) {
                        optional = `?submitId=${submitId}`;
                    }
                    let url = `${this.baseUrl}/Status/${computationId}${optional}`;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url);
                }
                static getComputationInfoList(computationId) {
                    let url = `${this.baseUrl}/Compinfo/${computationId}`;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url).then((val) => {
                        if (val.Status === "Error") {
                            return null;
                        }
                        else {
                            return val;
                        }
                    });
                }
                static handleJsonToStringResponse(response) {
                    return new Promise((res, rej) => {
                        response.then(value => {
                            let data = value;
                            res(JSON.stringify(data));
                        })
                            .catch(error => {
                            rej(error);
                        });
                    });
                }
                static submitMoleJob(computationId, data) {
                    let url = `${this.baseUrl}/Submit/Mole/${computationId}`;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendPOSTjson(url, data);
                }
                static submitPoresJob(computationId, data) {
                    let url = `${this.baseUrl}/Submit/Pores/${computationId}?isBetaStructure=${data.IsBetaBarel}&inMembrane=${data.InMembrane}&chains=${(data.Chains === null) ? "" : data.Chains}`;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url);
                }
                static getFilenameFromResponseHeader(r) {
                    let contentDisposition = r.headers.get("Content-Disposition");
                    //https://regex101.com/r/hJ7tS6/1
                    let regExp = RegExp(/filename[^;\n=]*=((['"]).*?\2|[^;\n]*)/);
                    let filename = null;
                    if (contentDisposition !== null) {
                        let result = regExp.exec(contentDisposition);
                        if (result !== null) {
                            if (result.length >= 2) {
                                filename = result[1];
                            }
                        }
                    }
                    return filename;
                }
                static getProteinStructure(computationId, submitId) {
                    let url = `${this.baseUrl}/Data/${computationId}?submitId=${submitId}&format=molecule`;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    if (this.DEBUG_MODE)
                        console.time("getProteinStructure");
                    return new Promise((res, rej) => {
                        if (this.DEBUG_MODE)
                            console.time('protein-raw');
                        fetch(url, {
                            method: "GET",
                        })
                            .then((rawResponse) => {
                            let filename = this.getFilenameFromResponseHeader(rawResponse);
                            if (this.DEBUG_MODE)
                                console.log(filename);
                            if (this.DEBUG_MODE)
                                console.timeEnd('protein-raw');
                            if (!rawResponse.ok) {
                                if (this.DEBUG_MODE) {
                                    console.log(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                                }
                                rej(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                                return;
                            }
                            rawResponse.text().then(value => {
                                res({
                                    data: value,
                                    filename: filename
                                });
                                if (this.DEBUG_MODE)
                                    console.timeEnd("getProteinStructure");
                            })
                                .catch(error => {
                                rej(error);
                            });
                        })
                            .catch(error => rej(error));
                    });
                }
                static getChannelsData(computationId, submitId) {
                    let url = `${this.baseUrl}/Data/${computationId}?submitId=${submitId}`;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    if (this.DEBUG_MODE)
                        console.time("getChannelsData");
                    return this.handleJsonToStringResponse(this.sendGET(url)).then((s) => {
                        if (this.DEBUG_MODE)
                            console.timeEnd("getChannelsData");
                        return s;
                    });
                }
                static killRunningJob(computationId) {
                    let url = `${this.baseUrl}/Kill/${computationId}`;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url);
                }
                static deleteProject(computationId) {
                    let url = `${this.baseUrl}/Delete/${computationId}`;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url);
                }
                static getCSAResidues(computationId) {
                    let url = `${this.baseUrl}/CSA/${computationId}`;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url);
                }
                static getCofactors() {
                    let url = `${this.baseUrl}/inputs/cofactors.json`;
                    //let url = `/online/cofactors.json`;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    if (this.DEBUG_MODE)
                        console.time("getCofactors");
                    return this.sendGET(url).then((s) => {
                        let rv = new Map();
                        for (let key in s) {
                            if (!s.hasOwnProperty(key)) {
                                continue;
                            }
                            rv.set(key, s[key]);
                        }
                        if (this.DEBUG_MODE)
                            console.timeEnd("getCofactors");
                        return rv;
                    });
                }
            }
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
            ;
            ;
            ;
            ;
            ;
            class ApiService {
                static sendPOST(url, formData) {
                    return this.handleResponse(fetch(url, {
                        method: "POST",
                        body: formData,
                    }), url);
                }
                static sendPOSTjson(url, formData) {
                    const headers = new Headers();
                    headers.append("Accept", "application/json");
                    headers.append("Content-Type", "application/json");
                    return this.handleResponse(fetch(url, {
                        method: "POST",
                        headers,
                        body: JSON.stringify(formData),
                    }), url);
                }
                static sendGET(url) {
                    if (Config.CommonOptions.DEBUG_MODE)
                        console.time(`sendGET '${url}'`);
                    return this.handleResponse(fetch(url, {
                        method: "GET"
                    }), url).then((val) => {
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.timeEnd(`sendGET '${url}'`);
                        return val;
                    });
                }
                static handleResponse(response, url) {
                    return new Promise((res, rej) => {
                        response.then((rawResponse) => {
                            if (!rawResponse.ok) {
                                if (this.DEBUG_MODE) {
                                    console.log(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                                }
                                rej(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                            }
                            else {
                                res(rawResponse.json());
                            }
                        })
                            .catch(err => {
                            rej(err);
                        });
                    });
                }
                static parseChannelsAnnotations(data) {
                    let map = LiteMol.Core.Utils.FastMap.create();
                    for (let item of data) {
                        if (item.Name === void 0) {
                            console.log("Found channel annotation without annotation text(Name). Skipping...");
                            continue;
                        }
                        let list = [];
                        if (map.has(item.Id)) {
                            let l = map.get(item.Id);
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
                }
                static stripChars(str, chars) {
                    for (let char of chars) {
                        str = str.replace(char, "");
                    }
                    return str;
                }
                static parseCatalytics(items) {
                    let rv = [];
                    for (let item of items) {
                        let line = item.replace(/\(\d*\)/g, (x) => `<sub>${this.stripChars(x, ['(', ')'])}</sub>`);
                        line = line.replace(/\(\+\)|\(\-\)/g, (x) => `<sup>${this.stripChars(x, ['(', ')'])}</sup>`);
                        rv.push(line);
                    }
                    return rv;
                }
                static parseProteinData(data) {
                    let list = [];
                    for (let item of data) {
                        list.push({
                            name: item.Name,
                            function: item.Function,
                            link: this.createLink("UniProt", item.UniProtId),
                            uniProtId: item.UniProtId,
                            catalytics: this.parseCatalytics(item.Catalytics)
                        });
                    }
                    return list;
                }
                //PUBMEDID vs UniProtId ??? PUBMED není v JSONU vůbec přítomné
                //link pro uniprot používá adresu http://www.uniprot.org/uniprot/
                static createLink(type, reference) {
                    if (type === "DOI") {
                        return `http://dx.doi.org/${reference}`;
                    }
                    else if (type === "UniProt") {
                        return `http://www.uniprot.org/uniprot/${reference}`;
                    }
                    else if (type === "PubMed") {
                        return `http://europepmc.org/abstract/MED/${reference}`;
                    }
                    else {
                        console.log(`Unknown reference type ${type} for reference ${reference}`);
                        return `#unknown-reference-type`;
                    }
                }
                static parseResidueItem(item, map) {
                    let residueId = `${item.Id} ${item.Chain}`;
                    let annotations = map.get(residueId);
                    if (annotations === void 0) {
                        annotations = [];
                    }
                    annotations.push({
                        text: item.Text,
                        reference: item.Reference,
                        link: this.createLink(item.ReferenceType, item.Reference),
                    });
                    map.set(`${item.Id} ${item.Chain}`, annotations);
                }
                static parseResidueData(data) {
                    let map = LiteMol.Core.Utils.FastMap.create();
                    for (let item of data.ChannelsDB) {
                        this.parseResidueItem(item, map);
                    }
                    for (let item of data.UniProt) {
                        this.parseResidueItem(item, map);
                    }
                    return map;
                }
                static parseLiningResiduesAndChannelsData(data) {
                    let channels = [];
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
                    let liningResidues = [];
                    for (let channel of channels) {
                        for (let layerInfo of channel.Layers.LayersInfo) {
                            for (let residue of layerInfo.Residues) {
                                let residueId = residue.split(" ").slice(1, 3).join(" ");
                                if (liningResidues.indexOf(residueId) < 0) {
                                    liningResidues.push(residueId);
                                }
                            }
                        }
                    }
                    return { liningResidues, channels: data.Channels };
                }
                static handleChannelsAPIData(data) {
                    let liningResiduesAndChannels = this.parseLiningResiduesAndChannelsData(data);
                    let channelsAnnotations = this.parseChannelsAnnotations(data.Annotations);
                    return { liningResidues: liningResiduesAndChannels.liningResidues, channelsAnnotations, channelsData: liningResiduesAndChannels.channels };
                }
                static handleAnnotationsAPIData(data) {
                    let proteinData = this.parseProteinData(data.EntryAnnotations);
                    let residueData = this.parseResidueData(data.ResidueAnnotations);
                    return { proteinData, residueData };
                }
                static getChannelsData(pdbid) {
                    let url = `${this.baseUrl}/PDB/${pdbid}`;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url).then(val => {
                        return this.handleChannelsAPIData(val);
                    });
                }
                static getProteinData(pdbid) {
                    let url = `${this.baseUrl}/Annotations/${pdbid}`;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url).then(val => {
                        return this.handleAnnotationsAPIData(val);
                    });
                }
            }
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
            class ApiService {
                static sendGET(url) {
                    return this.handleResponse(fetch(url, {
                        method: "GET",
                    }), url);
                }
                static handleResponse(response, url) {
                    return new Promise((res, rej) => {
                        response.then((rawResponse) => {
                            if (!rawResponse.ok) {
                                if (this.DEBUG_MODE) {
                                    console.log(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                                }
                                rej(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                                return;
                            }
                            res(rawResponse.json());
                        })
                            .catch(err => {
                            rej(err);
                        });
                    });
                }
                static getValidationResult(query) {
                    let url = `${this.baseUrl}/?query=${query}`;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendGET(url);
                }
            }
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
            class ApiService {
                static sendPOSTjson(url, formData) {
                    const headers = new Headers();
                    headers.append("Accept", "application/json");
                    headers.append("Content-Type", "application/json");
                    return this.handleResponse(fetch(url, {
                        method: "POST",
                        headers,
                        body: JSON.stringify(formData),
                    }), url);
                }
                static handleResponse(response, url) {
                    return new Promise((res, rej) => {
                        response.then((rawResponse) => {
                            if (!rawResponse.ok) {
                                if (this.DEBUG_MODE) {
                                    console.log(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                                }
                                rej(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                                return;
                            }
                            res(rawResponse.json());
                        })
                            .catch(err => {
                            rej(err);
                        });
                    });
                }
                static sendAnnotation(data) {
                    let url = `${this.baseUrl}/UploadAnnotations/Mole`;
                    if (this.DEBUG_MODE) {
                        console.log(url);
                    }
                    return this.sendPOSTjson(url, data);
                }
            }
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
            class Service {
                static sendGET(url) {
                    if (this.DEBUG_MODE)
                        console.time(`sendGET '${url}'`);
                    return this.handleResponse(fetch(url, {
                        method: "GET"
                    }), url).then((val) => {
                        if (this.DEBUG_MODE)
                            console.timeEnd(`sendGET '${url}'`);
                        return val;
                    });
                }
                static handleResponse(response, url) {
                    return new Promise((res, rej) => {
                        response.then((rawResponse) => {
                            if (!rawResponse.ok) {
                                if (this.DEBUG_MODE) {
                                    console.log(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                                }
                                rej(`GET: ${url} ${rawResponse.status}: ${rawResponse.statusText}`);
                            }
                            else {
                                res(rawResponse.text());
                            }
                        })
                            .catch(err => {
                            rej(err);
                        });
                    });
                }
                static getPDFReportTemplateData() {
                    let cacheToken = (this.noCacheMode) ? Math.random() : this.version;
                    let urlHTML = `${this.baseUrl}/pdf-report.html?version=${cacheToken}`;
                    if (this.DEBUG_MODE) {
                        console.log(urlHTML);
                    }
                    let urlParamsPageHTML = `${this.baseUrl}/pdf-report-params.html?version=${cacheToken}`;
                    if (this.DEBUG_MODE) {
                        console.log(urlParamsPageHTML);
                    }
                    let urlCSS = `${this.baseUrl}/pdf-report.css?version=${cacheToken}`;
                    if (this.DEBUG_MODE) {
                        console.log(urlCSS);
                    }
                    let html = null;
                    let paramsPageHtml = null;
                    let css = null;
                    return new Promise((res, rej) => {
                        Promise.all([
                            this.sendGET(urlHTML).then(htmlTemplate => {
                                html = htmlTemplate;
                            }),
                            this.sendGET(urlParamsPageHTML).then(htmlTemplate => {
                                paramsPageHtml = htmlTemplate;
                            }),
                            this.sendGET(urlCSS).then(cssTemplate => {
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
                            .catch(err => rej(err));
                    });
                }
            }
            Service.DEBUG_MODE = Config.CommonOptions.DEBUG_MODE;
            Service.baseUrl = "/online/templates";
            Service.version = 5;
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
            class DataProvider {
                //--
                static hasPending(compId) {
                    if (this.pending === void 0) {
                        return false;
                    }
                    let isPending = this.pending.get(compId);
                    return (isPending === void 0) ? false : isPending;
                }
                static setPending(compId, isPending) {
                    if (this.pending === void 0) {
                        this.pending = new Map();
                    }
                    this.pending.set(compId, isPending);
                }
                static setData(compId, info) {
                    if (this.data === void 0) {
                        this.data = new Map();
                    }
                    this.data.set(compId, info);
                    this.runHandlers(compId, info);
                }
                static runHandlers(compId, info) {
                    if (this.handlers === void 0) {
                        return;
                    }
                    let hndlrs = [];
                    //this.handlers = [];
                    for (let h of this.handlers) {
                        if (h.compId === compId) {
                            h.handler(compId, info);
                        }
                        if (h.stayForUpdate === true || h.compId !== compId) {
                            hndlrs.push(h);
                        }
                    }
                    this.handlers = hndlrs;
                }
                static requestData(compId) {
                    if (this.hasPending(compId)) {
                        return;
                    }
                    this.setPending(compId, true);
                    Service.getComputationInfoList(compId).then((val) => {
                        this.setPending(compId, false);
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log(val);
                        this.setData(compId, val);
                    }).catch((err) => {
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log(err);
                        window.setTimeout((() => { this.requestData(compId); }).bind(this), 100);
                    });
                }
                static attachHandler(compId, handler, stayForUpdate) {
                    if (this.handlers === void 0) {
                        this.handlers = [];
                    }
                    this.handlers.push({
                        compId,
                        handler,
                        stayForUpdate
                    });
                    this.requestData(compId);
                }
                //--
                static get(compId, handler, onlyFresh) {
                    if (this.data !== void 0 && !onlyFresh) {
                        let data = this.data.get(compId);
                        if (data !== void 0) {
                            handler(compId, data);
                            return;
                        }
                    }
                    this.attachHandler(compId, handler, false);
                }
                static subscribe(compId, handler, onlyFresh) {
                    if (this.data !== void 0 && !onlyFresh) {
                        let data = this.data.get(compId);
                        if (data !== void 0) {
                            handler(compId, data);
                        }
                    }
                    this.attachHandler(compId, handler, true);
                }
            }
            ComputationInfo.DataProvider = DataProvider;
        })(ComputationInfo = DataProxy.ComputationInfo || (DataProxy.ComputationInfo = {}));
        var JobStatus;
        (function (JobStatus) {
            class Watcher {
                static makeHash(computationId, submitId) {
                    return `${computationId}:${computationId}`;
                }
                static registerErrHandler(computationId, submitId, handler) {
                    if (this.errHandlers === void 0) {
                        this.errHandlers = new Map();
                    }
                    let key = this.makeHash(computationId, submitId);
                    let handlers = this.errHandlers.get(key);
                    if (handlers === void 0) {
                        handlers = [];
                    }
                    handlers.push(handler);
                    this.errHandlers.set(key, handlers);
                }
                static registerOnChangeHandler(computationId, submitId, handler, onErr) {
                    if (this.handlers === void 0) {
                        this.handlers = new Map();
                    }
                    let key = this.makeHash(computationId, submitId);
                    let handlers = this.handlers.get(key);
                    let shouldStartLoop = false;
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
                }
                static notifyStatusUpdate(computationId, submitId, status) {
                    let handlers = this.handlers.get(this.makeHash(computationId, submitId));
                    if (handlers === void 0) {
                        return;
                    }
                    for (let h of handlers) {
                        h(status);
                    }
                }
                static removeHandlers(computationId, submitId) {
                    let key = this.makeHash(computationId, submitId);
                    this.handlers.delete(key);
                    this.errHandlers.delete(key);
                }
                static waitForResult(computationId, submitId) {
                    Service.getStatus(computationId, submitId).then((state) => {
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
                                this.notifyStatusUpdate(computationId, submitId, state);
                                window.setTimeout(() => { this.waitForResult(computationId, submitId); }, 1000);
                                break;
                            case "Initialized":
                            case "FailedInitialization":
                            case "Error":
                            case "Deleted":
                            case "Aborted":
                            case "Finished":
                                this.notifyStatusUpdate(computationId, submitId, state);
                                this.removeHandlers(computationId, submitId);
                                break;
                        }
                    })
                        .catch((err) => {
                        let h = this.errHandlers.get(this.makeHash(computationId, submitId));
                        if (h === void 0) {
                            throw new Error(err);
                        }
                        for (let handler of h) {
                            handler(err);
                        }
                    });
                }
            }
            JobStatus.Watcher = Watcher;
        })(JobStatus = DataProxy.JobStatus || (DataProxy.JobStatus = {}));
        var CSAResidues;
        (function (CSAResidues_1) {
            class DataProvider {
                //--
                static hasPending(compId) {
                    if (this.pending === void 0) {
                        return false;
                    }
                    let isPending = this.pending.get(compId);
                    return (isPending === void 0) ? false : isPending;
                }
                static setPending(compId, isPending) {
                    if (this.pending === void 0) {
                        this.pending = new Map();
                    }
                    this.pending.set(compId, isPending);
                }
                static setData(compId, info) {
                    if (this.data === void 0) {
                        this.data = new Map();
                    }
                    this.data.set(compId, info);
                    this.runHandlers(compId, info);
                }
                static runHandlers(compId, info) {
                    if (this.handlers === void 0) {
                        return;
                    }
                    let hndlrs = [];
                    //this.handlers = [];
                    for (let h of this.handlers) {
                        if (h.compId === compId) {
                            h.handler(compId, info);
                        }
                        if (h.stayForUpdate === true || h.compId !== compId) {
                            hndlrs.push(h);
                        }
                    }
                    this.handlers = hndlrs;
                }
                static requestData(compId) {
                    if (this.hasPending(compId)) {
                        return;
                    }
                    this.setPending(compId, true);
                    Service.getCSAResidues(compId).then((val) => {
                        this.setPending(compId, false);
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log(val);
                        this.setData(compId, val);
                    }).catch((err) => {
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log(err);
                        window.setTimeout((() => { this.requestData(compId); }).bind(this), 100);
                    });
                }
                static attachHandler(compId, handler, stayForUpdate) {
                    if (this.handlers === void 0) {
                        this.handlers = [];
                    }
                    this.handlers.push({
                        compId,
                        handler,
                        stayForUpdate
                    });
                    this.requestData(compId);
                }
                //--
                static get(compId, handler, onlyFresh) {
                    if (this.data !== void 0 && !onlyFresh) {
                        let data = this.data.get(compId);
                        if (data !== void 0) {
                            handler(compId, data);
                            return;
                        }
                    }
                    this.attachHandler(compId, handler, false);
                }
                static subscribe(compId, handler, onlyFresh) {
                    if (this.data !== void 0 && !onlyFresh) {
                        let data = this.data.get(compId);
                        if (data !== void 0) {
                            handler(compId, data);
                        }
                    }
                    this.attachHandler(compId, handler, true);
                }
            }
            CSAResidues_1.DataProvider = DataProvider;
        })(CSAResidues = DataProxy.CSAResidues || (DataProxy.CSAResidues = {}));
        var Cofactors;
        (function (Cofactors_1) {
            class DataProvider {
                //--
                static hasPending() {
                    if (this.pending === void 0) {
                        return false;
                    }
                    return this.pending;
                }
                static setPending(isPending) {
                    this.pending = isPending;
                }
                static setData(info) {
                    this.data = info;
                    this.runHandlers(info);
                }
                static runHandlers(info) {
                    if (this.handlers === void 0) {
                        return;
                    }
                    //this.handlers = [];
                    for (let h of this.handlers) {
                        h.handler(info);
                    }
                    this.handlers = [];
                }
                static requestData() {
                    if (this.hasPending()) {
                        return;
                    }
                    this.setPending(true);
                    Service.getCofactors().then((val) => {
                        this.setPending(false);
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log(val);
                        this.setData(val);
                    }).catch((err) => {
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log(err);
                        window.setTimeout((() => { this.requestData(); }).bind(this), 100);
                    });
                }
                static attachHandler(handler) {
                    if (this.handlers === void 0) {
                        this.handlers = [];
                    }
                    this.handlers.push({
                        handler
                    });
                    this.requestData();
                }
                //--
                static get(handler, onlyFresh) {
                    if (this.data !== void 0 && !onlyFresh) {
                        let data = this.data;
                        if (data !== void 0) {
                            handler(data);
                            return;
                        }
                    }
                    this.attachHandler(handler);
                }
                static hasData() {
                    return this.data !== void 0;
                }
            }
            Cofactors_1.DataProvider = DataProvider;
        })(Cofactors = DataProxy.Cofactors || (DataProxy.Cofactors = {}));
    })(DataProxy = MoleOnlineWebUI.DataProxy || (MoleOnlineWebUI.DataProxy = {}));
})(MoleOnlineWebUI || (MoleOnlineWebUI = {}));
var MoleOnlineWebUI;
(function (MoleOnlineWebUI) {
    var Cache;
    (function (Cache) {
        var ChannelsDBAPI = MoleOnlineWebUI.Service.ChannelsDBAPI;
        class TunnelName {
            static reload(data) {
                let channels = [];
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
                //let nameIdxMap = new Map<String,number>();
                let cache = new Map();
                for (let channel of channels) {
                    /*
                    if(!nameIdxMap.has(channel.Type)){
                        nameIdxMap.set(channel.Type,1);
                    }*/
                    //let nameIdx = nameIdxMap.get(channel.Type) as number;
                    //cache.set(channel.GUID,`${channel.Type[0]}${nameIdx++}`);
                    //nameIdxMap.set(channel.Type,nameIdx);               
                    cache.set(channel.GUID, `${channel.Type[0]}${channel.Id}C${channel.Cavity}`);
                }
                this.cache = cache;
            }
            static get(channelId) {
                if (this.cache === void 0) {
                    return void 0;
                }
                return this.cache.get(channelId);
            }
            static getCachedItemsCount() {
                return (this.cache === void 0) ? 0 : this.cache.size;
            }
        }
        Cache.TunnelName = TunnelName;
        class LastSelectedChannelData {
            static set(data) {
                this.data = data;
            }
            static get() {
                return this.data;
            }
        }
        Cache.LastSelectedChannelData = LastSelectedChannelData;
        class LastVisibleChannels {
            static set(data) {
                this.data = data;
            }
            static get() {
                return this.data;
            }
        }
        Cache.LastVisibleChannels = LastVisibleChannels;
        class ChannelsDBData {
            static reload(pdbid) {
                let channelsData = ChannelsDBAPI.ApiService.getChannelsData(pdbid);
                let proteinData = ChannelsDBAPI.ApiService.getProteinData(pdbid);
                channelsData.then(val => {
                    this.channelAnnotationCache = val.channelsAnnotations;
                    this.channelDataCache = val.channelsData;
                    this.liningResiduesCache = val.liningResidues;
                });
                proteinData.then(val => {
                    this.residueAnnotationCache = val.residueData;
                });
                return Promise.all([
                    channelsData,
                    proteinData
                ]);
            }
            static doWhenCached(pdbid) {
                if (this.isCached()) {
                    return Promise.resolve();
                }
                return new Promise((res, rej) => {
                    this.reload(pdbid).then(val => res()).catch(err => rej(err));
                });
            }
            static isCached() {
                return this.channelAnnotationCache !== void 0
                    && this.channelDataCache !== void 0
                    && this.liningResiduesCache !== void 0
                    && this.residueAnnotationCache !== void 0;
            }
            static getChannelAnnotations(pdbid, channelId) {
                if (this.isCached()) {
                    return Promise.resolve(this.channelAnnotationCache.get(channelId));
                }
                return new Promise((res, rej) => {
                    this.reload(pdbid)
                        .then(val => {
                        res(this.channelAnnotationCache.get(channelId));
                    })
                        .catch(err => rej(err));
                });
            }
            static getChannelAnnotationsImmediate(channelId) {
                if (!this.isCached()) {
                    return null;
                }
                let annotations = this.channelAnnotationCache.get(channelId);
                if (annotations === void 0) {
                    return null;
                }
                return annotations;
            }
            static getChannelsAnnotations(pdbid) {
                if (this.isCached()) {
                    return Promise.resolve(this.channelAnnotationCache);
                }
                return new Promise((res, rej) => {
                    this.reload(pdbid)
                        .then(val => {
                        res(this.channelAnnotationCache);
                    })
                        .catch(err => rej(err));
                });
            }
            static getChannelsData(pdbid) {
                if (this.isCached()) {
                    return Promise.resolve(this.channelDataCache);
                }
                return new Promise((res, rej) => {
                    this.reload(pdbid)
                        .then(val => {
                        res(this.channelDataCache);
                    })
                        .catch(err => rej(err));
                });
            }
            static getResidueAnnotations(pdbid, seqNumberAndChain) {
                if (this.isCached()) {
                    return Promise.resolve(this.residueAnnotationCache.get(seqNumberAndChain));
                }
                return new Promise((res, rej) => {
                    this.reload(pdbid)
                        .then(val => {
                        res(this.residueAnnotationCache.get(seqNumberAndChain));
                    })
                        .catch(err => rej(err));
                });
            }
            static getResidueAnnotationsImmediate(seqNumberAndChain) {
                if (!this.isCached()) {
                    return null;
                }
                let annotations = this.residueAnnotationCache.get(seqNumberAndChain);
                if (annotations === void 0) {
                    return null;
                }
                return annotations;
            }
            static getResiduesAnnotations(pdbid) {
                if (this.isCached()) {
                    return Promise.resolve(this.residueAnnotationCache);
                }
                return new Promise((res, rej) => {
                    this.reload(pdbid)
                        .then(val => {
                        res(this.residueAnnotationCache);
                    })
                        .catch(err => rej(err));
                });
            }
            static getResiduesAnnotationsImmediate() {
                if (!this.isCached()) {
                    return null;
                }
                let annotations = this.residueAnnotationCache;
                if (annotations === void 0) {
                    return null;
                }
                return annotations;
            }
            static getLiningResidues(pdbid) {
                if (this.isCached()) {
                    return Promise.resolve(this.liningResiduesCache.slice());
                }
                return new Promise((res, rej) => {
                    this.reload(pdbid)
                        .then(val => {
                        if (this.liningResiduesCache === void 0) {
                            res(void 0);
                        }
                        else {
                            res(this.liningResiduesCache.slice());
                        }
                    })
                        .catch(err => rej(err));
                });
            }
        }
        Cache.ChannelsDBData = ChannelsDBData;
    })(Cache = MoleOnlineWebUI.Cache || (MoleOnlineWebUI.Cache = {}));
})(MoleOnlineWebUI || (MoleOnlineWebUI = {}));
var LayersVizualizer;
(function (LayersVizualizer) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        var Transformer = LiteMol.Bootstrap.Entity.Transformer;
        var Tree = LiteMol.Bootstrap.Tree;
        var Transform = Tree.Transform;
        var Visualization = LiteMol.Bootstrap.Visualization;
        var Tabs = CommonUtils.Tabs;
        ;
        function createProfileToLayerByCenterDistanceMapping(channel) {
            let map = new Map();
            let layers = channel.Layers.LayersInfo;
            let profile = channel.Profile;
            let maxProfileDistance = profile[profile.length - 1].Distance;
            let maxLayerDistance = layers[layers.length - 1].LayerGeometry.EndDistance;
            let lUnit = maxLayerDistance / 100;
            let pUnit = maxProfileDistance / 100;
            let layerSpaceToProfileSpace = (layerVal) => {
                return (layerVal / lUnit) * pUnit;
            };
            let inRange = (profileVal, layerStartDistance, layerEndDistance) => {
                return profileVal >= layerSpaceToProfileSpace(layerStartDistance)
                    && profileVal < layerSpaceToProfileSpace(layerEndDistance);
            };
            for (let pIdx = 0, lIdx = 0; pIdx < profile.length;) {
                if (inRange(profile[pIdx].Distance, layers[lIdx].LayerGeometry.StartDistance, layers[lIdx].LayerGeometry.EndDistance)) {
                    map.set(pIdx, lIdx);
                    pIdx++;
                }
                else {
                    if (lIdx + 1 == layers.length) {
                        map.set(pIdx, lIdx);
                        pIdx++;
                    }
                    else {
                        lIdx++;
                    }
                }
            }
            return map;
        }
        ;
        function sphereSpaceToPercent(profileVal, sphereRadius) {
            let sUnit = sphereRadius * 2 / 100;
            return profileVal / sUnit;
        }
        ;
        function layerSpaceToPercent(val, layerLength) {
            let unit = layerLength / 100;
            return val / unit;
        }
        ;
        function layerSpaceToProfileSpace(layerVal, lUnit, pUnit) {
            return (layerVal / lUnit) * pUnit;
        }
        ;
        function percentCover(profileCenter, profileRadius, layerStartDistance, layerEndDistance, lUnit, pUnit) {
            let sD_p = layerSpaceToProfileSpace(layerStartDistance, lUnit, pUnit);
            let eD_p = layerSpaceToProfileSpace(layerEndDistance, lUnit, pUnit);
            let sk = profileCenter; //-profileRadius;
            let ek = profileCenter; //+profileRadius*2;
            let sv = sD_p;
            let ev = eD_p;
            let S = Math.max(sk, sv);
            let E = Math.min(ek, ev);
            if (E - S !== 0) {
                return 0;
            }
            else {
                return 100;
            }
            //return sphereSpaceToPercent(E-S,profileRadius);
            //return layerSpaceToPercent(E-S,layerEndDistance-layerStartDistance);
            /*
            //stred koule vlevo od vrstvy
            let case1 = () => {
                //koule mimo vrstvu celym profilem
                if((profileCenter + profileRadius)-sD_p < 0){
                    return 0;
                }
                //koule zasahuje svou casti do vrstvy zleva
                if((profileCenter + profileRadius)-sD_p > 0
                    && (profileCenter + profileRadius)-eD_p < 0){
                    return sphereSpaceToPercent((profileCenter+profileRadius)-sD_p,profileRadius);
                }
                //koule obsahuje celou vrstvu a vrstva je umistena vpravo od stredu koule
                if((profileCenter+profileRadius)-sD_p > 0
                    && (profileCenter+profileRadius)-eD_p > 0){
                    return sphereSpaceToPercent(eD_p-sD_p,profileRadius);
                }
    
                throw new Error("InvalidState - unrecognized state");
            };
    
            //stred koule uvnitr vrstvy
            let case2 = () => {
                //koule je cela ve vrstve
                if((profileCenter-profileRadius)-sD_p >= 0
                    && eD_p-(profileCenter+profileRadius) >= 0){
                    return 100;
                }
                //koule presahuje vrstvu vlevo
                if((profileCenter-profileRadius)-sD_p <= 0
                    && eD_p-(profileCenter+profileRadius) >= 0){
                    return sphereSpaceToPercent((profileCenter+profileRadius)-sD_p,profileRadius);
                }
                //koule presahuje vrstvu zprava
                if((profileCenter-profileRadius)-sD_p >= 0
                    && eD_p-(profileCenter+profileRadius) <= 0){
                    return sphereSpaceToPercent(eD_p-(profileCenter-profileRadius),profileRadius);
                }
                //koule presahuje vlevo i vpravo a obsahuje celou vrstvu
                if((profileCenter-profileRadius)-sD_p <= 0
                    && eD_p-(profileCenter+profileRadius) <= 0){
                    return sphereSpaceToPercent(eD_p-sD_p,profileRadius);
                }
    
                throw new Error("InvalidState - unrecognized state");
            };
    
            //stred koule vpravo od vrstvy
            let case3 = () => {
                //koule nezasahuje do vrstvy
                if((profileCenter-profileRadius)-eD_p > 0){
                    return 0;
                }
                //koule zasahuje levou pulkou do vrstvy, ale nepresahuje
                if((profileCenter-profileRadius)-sD_p > 0
                    && (profileCenter-profileRadius)-eD_p < 0){
                    return sphereSpaceToPercent(eD_p-(profileCenter-profileRadius),profileRadius);
                }
                //koule obsahuje celou vrstvu v prave polovine
                if((profileCenter-profileRadius)-sD_p < 0
                    && (profileCenter+profileRadius)-eD_p > 0){
                    return sphereSpaceToPercent(eD_p-sD_p,profileRadius);
                }
    
                throw new Error("InvalidState - unrecognized state");
            };
    
            if(profileCenter < sD_p){
                return case1();
            }
            
            if(profileCenter >= sD_p && profileCenter <= eD_p){
                return case2();
            }
    
            if(profileCenter > eD_p){
                return case3();
            }
    
            throw new Error("InvalidState - unrecognized state");
            */
        }
        ;
        function createProfileColorMapByRadiusAndCenterDistance(channel, layerIdx) {
            console.log("mappingbyradiusandcenter");
            /*let layerColors:LiteMol.Visualization.Color[] = [];*/
            let layers = channel.Layers.LayersInfo;
            let profile = channel.Profile;
            let maxProfileDistance = profile[profile.length - 1].Distance;
            let maxLayerDistance = layers[layers.length - 1].LayerGeometry.EndDistance;
            let activeColor = LiteMol.Visualization.Color.fromRgb(255, 0, 0);
            let inactiveColor = LiteMol.Visualization.Color.fromRgb(255, 255, 255);
            /*
            for(let i=0;i<layers.length;i++){
                if(i===layerIdx){
                    layerColors.push(activeColor);
                }
                else{
                    layerColors.push(inactiveColor);
                }
            }
            */
            let lUnit = maxLayerDistance / 100;
            let pUnit = lUnit; //maxProfileDistance/100;
            let colorMap = new Map();
            //let profileToColorMap = new Map<number,number>();
            //let colors:LiteMol.Visualization.Color[] = [];
            for (let pIdx = 0; pIdx < profile.length; pIdx++) {
                let layerCover = [];
                for (let lIdx = 0; lIdx < layers.length; lIdx++) {
                    let sphere = profile[pIdx];
                    let layerGeometry = layers[lIdx].LayerGeometry;
                    let percent = percentCover(sphere.Distance, sphere.Radius, layerGeometry.StartDistance, layerGeometry.EndDistance, lUnit, pUnit);
                    if (percent > 0) {
                        layerCover.push({ layerIdx: lIdx, percent });
                    }
                }
                /*
                layerCover.sort((a:{layerIdx:number,percent:number},b:{layerIdx:number,percent:number})=>{
                    return a.percent-b.percent;
                });
                */
                /*
                if(layerCover.length<2){
                    colorMap.set(pIdx,layerColors[layerCover[0].layerIdx]);
                    //profileToColorMap.set(pIdx,pIdx);
                    //colors.push(layerColors[layerCover[0].layerIdx]);
                    continue;
                }*/
                /*
                let color = layerColors[layerCover[0].layerIdx];
                let lc = layerCover[0];
                let currentPercent = lc.percent;
                for(let lcIdx=1;lcIdx<layerCover.length;lcIdx++){
                    let lc2 = layerCover[lcIdx];
                    let color2 = layerColors[lc2.layerIdx];
    
                    let totalPercent = currentPercent+lc2.percent;
                    let p = (currentPercent/totalPercent)*100;
    
                    color = {
                        r:(1-(p/100)) * color.r + (p/100) * color2.r,
                        g:(1-(p/100)) * color.g + (p/100) * color2.g,
                        b:(1-(p/100)) * color.b + (p/100) * color2.b
                    };
                    currentPercent = totalPercent;
                }
                */
                let color = inactiveColor;
                let semiactiveColor = LiteMol.Visualization.Color.fromRgb(0, 0, 122);
                for (let lcIdx = 0; lcIdx < layerCover.length; lcIdx++) {
                    let p = layerCover[lcIdx].percent;
                    if (layerCover[lcIdx].layerIdx === layerIdx) {
                        console.log(`Profile[${pIdx}] -> Layer[${layerIdx}] => cover: ${p}`);
                        /*
                        color = {
                            r:(1-(p/100)) * semiactiveColor.r + (p/100) * activeColor.r,
                            g:(1-(p/100)) * semiactiveColor.g + (p/100) * activeColor.g,
                            b:(1-(p/100)) * semiactiveColor.b + (p/100) * activeColor.b
                        };*/
                        //LiteMol.Visualization.Color.interpolate(semiactiveColor,activeColor,p,color);
                        color = activeColor;
                        break;
                    }
                }
                /*
                let lc1 = layerCover[layerCover.length-1];
                let lc2 = layerCover[layerCover.length-2];
    
                let color1 = layerColors[lc1.layerIdx];
                let color2 = layerColors[lc2.layerIdx];
    
                let color = {
                    r:(1-(lc1.percent/100)) * color1.r + (lc1.percent/100) * color2.r,
                    g:(1-(lc1.percent/100)) * color1.g + (lc1.percent/100) * color2.g,
                    b:(1-(lc1.percent/100)) * color1.b + (lc1.percent/100) * color2.b
                };
                
                console.log(color1);
                console.log(color2);
                console.log(color);
                console.log("-");
                console.log(lc1);
                console.log(lc2);
                console.log("---!---");
                */
                colorMap.set(pIdx, color);
                //profileToColorMap.set(pIdx,pIdx);
                //colors.push(color);
            }
            return colorMap;
        }
        ;
        function applyTheme(theme /*(e: any, props?: LiteMol.Visualization.Theme.Props | undefined) => LiteMol.Visualization.Theme*/, plugin, ref) {
            let visual = plugin.context.select(ref)[0];
            console.log(visual);
            let query = LiteMol.Core.Structure.Query.everything(); /*.sequence('1', 'A', { seqNumber: 10 }, { seqNumber: 25 });*/
            let action = Transform.build().add(visual, Transformer.Molecule.CreateSelectionFromQuery, { query, name: 'My name' }, { ref: 'sequence-selection' })
                .then(Transformer.Molecule.CreateVisual, { style: LiteMol.Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
            visual = plugin.context.select(ref)[0];
            console.log(visual);
            console.log(LiteMol.Bootstrap.Utils.Molecule.findModel(visual));
            /*let themestatic = theme(visual);*/
            plugin.applyTransform(action).then(() => {
                LiteMol.Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(plugin.context, { visual, theme /*: themestatic*/ });
                LiteMol.Bootstrap.Command.Entity.Focus.dispatch(plugin.context, plugin.context.select('sequence-selection'));
                // alternatively, you can do this
                //Command.Molecule.FocusQuery.dispatch(plugin.context, { model: selectNodes('model')[0] as any, query })
            });
        }
        function generateLayerSelectColorTheme(activeLayerIdx, app) {
            /*
            let colors = new Map<number, LiteMol.Visualization.Color>();
            let coloringPropertyKey = app.vizualizer.getColoringPropertyKey();
            for(let layerIdx=0; layerIdx<app.state.data.length; layerIdx++){
                if(layerIdx === activeLayerIdx){
                    colors.set(layerIdx, LiteMol.Visualization.Color.fromRgb(255,0,0));
                }
                else{
                    colors.set(layerIdx, LiteMol.Visualization.Color.fromRgb(255,255,255));
                }
            }
            */
            let channel = app.props.controller.context.select(app.state.currentTunnelRef)[0].props.model.entity.element;
            let profilePartsCount = channel.Profile.length;
            //let profileToLayerMapping = createProfileColorMapByRadiusAndCenterDistance(channel,activeLayerIdx);
            let max = 0;
            let colors = createProfileColorMapByRadiusAndCenterDistance(channel, activeLayerIdx);
            let theme = LiteMol.Visualization.Theme.createMapping(LiteMol.Visualization.Theme.createColorMapMapping((idx) => {
                return idx;
                /*
                let lIdx = profileToLayerMapping.get(idx);
                if(lIdx === void 0)
                    return void 0;
                return lIdx;
                */
            }, colors, LiteMol.Visualization.Color.fromRgb(0, 0, 0)));
            return theme;
        }
        function render(vizualizer, target, plugin) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, { vizualizer: vizualizer, controller: plugin }), target);
        }
        UI.render = render;
        class App extends React.Component {
            constructor() {
                super(...arguments);
                this.interactionEventStream = void 0;
                this.state = {
                    instanceId: -1,
                    hasData: false,
                    data: [],
                    layerId: 0,
                    coloringPropertyKey: "",
                    customColoringPropertyKey: "",
                    radiusPropertyKey: "MinRadius",
                    customRadiusPropertyKey: "MinRadius",
                    colorBoundsMode: "Absolute",
                    isDOMReady: false,
                    app: this,
                    currentTunnelRef: "",
                    isLayerSelected: false
                };
            }
            componentDidMount() {
                var vizualizer = this.props.vizualizer;
                vizualizer.setColorBoundsMode(this.state.colorBoundsMode);
                let state = this.state;
                state.instanceId = vizualizer.getPublicInstanceIdx(),
                    state.customColoringPropertyKey = vizualizer.getCustomColoringPropertyKey(),
                    state.coloringPropertyKey = vizualizer.getColoringPropertyKey(),
                    state.customRadiusPropertyKey = vizualizer.getCustomRadiusPropertyKey(),
                    state.radiusPropertyKey = vizualizer.getRadiusPropertyKey(),
                    state.colorBoundsMode = this.state.colorBoundsMode;
                this.setState(state);
                this.vizualizer = vizualizer;
                CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler((data) => {
                    window.setTimeout(() => {
                        let state = this.state;
                        state.currentTunnelRef = CommonUtils.Selection.SelectionHelper.getSelectedChannelRef();
                        state.isLayerSelected = false;
                        this.setState(state);
                        //$('#left-tabs').tabs("option", "active", 0);
                        Tabs.activateTab("left-tabs", "1");
                        let layers = DataInterface.convertLayersToLayerData(data);
                        Tabs.doAfterTabActivated("left-tabs", "1", () => {
                            vizualizer.setData(layers);
                            let s1 = this.state;
                            s1.data = layers;
                            s1.hasData = true;
                            s1.isDOMReady = false;
                            s1.instanceId = vizualizer.getPublicInstanceIdx();
                            this.setState(s1);
                            vizualizer.rebindDOMRefs();
                            vizualizer.vizualize();
                            let s2 = this.state;
                            s2.data = layers;
                            s2.hasData = true;
                            s2.isDOMReady = true;
                            s2.instanceId = vizualizer.getPublicInstanceIdx();
                            this.setState(s2);
                        });
                    }, 50);
                });
                CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(() => {
                    let state = this.state;
                    state.data = [];
                    state.hasData = false;
                    state.isDOMReady = false;
                    state.currentTunnelRef = "";
                    state.isLayerSelected = false;
                    this.setState(state);
                    setTimeout(function () {
                        $(window).trigger('contentResize');
                    }, 1);
                });
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(() => {
                    let state = this.state;
                    state.data = [];
                    state.hasData = false;
                    state.isDOMReady = false;
                    state.currentTunnelRef = "";
                    state.isLayerSelected = false;
                    this.setState(state);
                    setTimeout(function () {
                        $(window).trigger('contentResize');
                    }, 1);
                });
                $(window).on("lvContentResize", (() => {
                    this.forceUpdate();
                }).bind(this));
                $(window).on("resize", (() => {
                    this.forceUpdate();
                }).bind(this));
            }
            /*
            generateLayerSelectColorTheme(activeLayerIdx: number){
                let colors = new Map<number, LiteMol.Visualization.Color>();
                let coloringPropertyKey = this.vizualizer.getColoringPropertyKey();
                for(let layerIdx=0; layerIdx<this.state.data.length; layerIdx++){
                    if(layerIdx === activeLayerIdx){
                        colors.set(layerIdx, LiteMol.Visualization.Color.fromRgb(255,0,0));
                    }
                    else{
                        colors.set(layerIdx, LiteMol.Visualization.Color.fromRgb(255,255,255));
                    }
                }
    
                let channel = (this.props.controller.context.select(this.state.currentTunnelRef)[0] as any).props.model.entity.element as DataInterface.Tunnel;
                let profilePartsCount = channel.Profile.length;
                let profileToLayerMapping = this.createProfileToLayerMapping(channel);
                let max = 0;
                let theme = LiteMol.Visualization.Theme.createMapping(LiteMol.Visualization.Theme.createColorMapMapping(
                        (idx:number)=>{
                            let lIdx = profileToLayerMapping.get(idx);
                            if(lIdx === void 0)
                                return void 0;
                            return lIdx;
                        },
                        colors,
                        LiteMol.Visualization.Color.fromRgb(0,0,0)
                    ));
                return theme;
            }*/
            //TODO:... vizualizace vrstev ve 3D
            generateColorTheme() {
                let colorSettings = this.props.vizualizer.getCurrentColoringSettings("default");
                if (colorSettings === void 0 || colorSettings === null) {
                    throw Error("No color info available!");
                }
                let colors = new Map();
                let coloringPropertyKey = this.vizualizer.getColoringPropertyKey();
                for (let layerIdx = 0; layerIdx < this.state.data.length; layerIdx++) {
                    let layer = this.state.data[layerIdx];
                    console.log(this.vizualizer.getColor(Number(layer.Properties[coloringPropertyKey]).valueOf(), colorSettings));
                    let color = LayersVizualizer.Colors.parseRGBString(this.vizualizer.getColor(Number(layer.Properties[coloringPropertyKey]).valueOf(), colorSettings));
                    colors.set(layerIdx, LiteMol.Visualization.Color.fromRgb(color.r, color.g, color.b));
                }
                let channel = this.props.controller.context.select(this.state.currentTunnelRef)[0].props.model.entity.element;
                let profilePartsCount = channel.Profile.length;
                let profileToLayerMapping = createProfileToLayerByCenterDistanceMapping(channel);
                let max = 0;
                let theme = LiteMol.Visualization.Theme.createMapping(LiteMol.Visualization.Theme.createColorMapMapping((idx) => {
                    let lIdx = profileToLayerMapping.get(idx);
                    if (lIdx === void 0 || lIdx === 0)
                        return void 0;
                    return lIdx;
                }, colors, LiteMol.Visualization.Color.fromRgb(0, 0, 0)));
                /*
            theme.setElementColor = (index:number, target:LiteMol.Visualization.Color)=>{
                console.log(`index: ${index}`);
            };*/
                return theme;
                /*
            return LiteMol.Visualization.Theme.createMapping(LiteMol.Visualization.Theme.createPalleteMapping(
                    (idx:number)=>{console.log(`Color Idx: ${idx}`);return idx%3;},
                    color_arr
                ));
                */
                /*.createColorMapThemeProvider(
                    // here you can also use m.atoms.residueIndex, m.residues.name/.... etc.
                    // you can also get more creative and use "composite properties"
                    // for this check Bootstrap/Visualization/Theme.ts and Visualization/Base/Theme.ts and it should be clear hwo to do that.
                    //
                    // You can create "validation based" coloring using this approach as it is not implemented in the plugin for now.
                    m => ({ index: m.data.atoms.chainIndex, property: m.data.chains.asymId }),
                    colors,
                    // this a fallback color used for elements not in the set
                    LiteMol.Visualization.Color.fromRgb(0, 0, 123))
                    // apply it to the model, you can also specify props, check Bootstrap/Visualization/Theme.ts
                    //(model);*/
            }
            //applyTheme
            componentWillUnmount() {
                if (this.interactionEventStream !== void 0) {
                    this.interactionEventStream.dispose();
                }
            }
            render() {
                if (this.state.hasData) {
                    $('.init-lvz-tooltip').tooltip();
                    return React.createElement(PaintingArea, Object.assign({}, this.state));
                }
                return React.createElement(Hint, Object.assign({}, this.state));
            }
        }
        UI.App = App;
        ;
        class PaintingArea extends React.Component {
            render() {
                return (React.createElement("div", { className: "layerVizualizer", id: `layer-vizualizer-ui${this.props.instanceId}` },
                    React.createElement("div", { className: "wrapper-container" },
                        React.createElement(Controls, Object.assign({}, this.props, { isCustom: false })),
                        React.createElement(CanvasWrapper, Object.assign({}, this.props)),
                        React.createElement(Controls, Object.assign({}, this.props, { isCustom: true }))),
                    React.createElement(CommonControls, Object.assign({}, this.props))));
            }
            ;
        }
        class Hint extends React.Component {
            render() {
                return (React.createElement("div", { id: `layer-vizualizer-hint-div${this.props.instanceId}`, className: "layer-vizualizer-hint-div" }, "Click on one of available channels to see more information..."));
            }
        }
        class DetailsContainer extends React.Component {
            render() {
                var layerId = this.props.layerId;
                return (React.createElement("div", { className: "layer-vizualizer-detail-div", id: `layer-vizualizer-detail-div${this.props.instanceId}` },
                    React.createElement("h3", null, "Properties"),
                    React.createElement(LayerProperties, { layerProperties: this.props.data[layerId].Properties }),
                    React.createElement("h3", null, "Lining residues"),
                    React.createElement(LayerResidues, { layerResidues: this.props.data[layerId].Residues })));
            }
        }
        class LayerProperties extends React.Component {
            render() {
                var rv = [];
                for (var key in this.props.layerProperties) {
                    rv.push(React.createElement(LayerProperty, { propertyKey: key, propertyValue: this.props.layerProperties[key] }));
                }
                return (React.createElement("div", { className: "properties" }, rv));
            }
        }
        class LayerProperty extends React.Component {
            render() {
                return (React.createElement("span", { className: "propertyItem" }, `${this.props.propertyKey}: ${this.props.propertyValue}`));
            }
        }
        class LayerResidues extends React.Component {
            render() {
                var rv = [];
                for (var key of this.props.layerResidues) {
                    rv.push(React.createElement(LayerResidue, { name: key }));
                }
                return (React.createElement("div", null, rv));
            }
        }
        class LayerResidue extends React.Component {
            render() {
                return (React.createElement("span", { className: "residueItem" }, `${this.props.name}`));
            }
        }
        class ColorMenuItem extends React.Component {
            changeColoringProperty(e) {
                let targetElement = e.target;
                let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
                let instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[instanceIdx];
                let propertyName = targetElement.getAttribute("data-propertyname");
                if (propertyName === null) {
                    if (Config.CommonOptions.DEBUG_MODE)
                        console.log("No property name found!");
                    return;
                }
                if (this.props.isCustom) {
                    if (Config.CommonOptions.DEBUG_MODE)
                        console.log(`setting custom property key: ${propertyName}`);
                    instance.setCustomColoringPropertyKey(propertyName);
                }
                else {
                    if (Config.CommonOptions.DEBUG_MODE)
                        console.log(`setting regular property key: ${propertyName}`);
                    instance.setColoringPropertyKey(propertyName);
                }
                instance.vizualize();
                let state = this.props.app.state;
                if (this.props.isCustom) {
                    state.customColoringPropertyKey = propertyName;
                    this.props.app.setState(state);
                }
                else {
                    state.coloringPropertyKey = propertyName;
                    this.props.app.setState(state);
                }
            }
            render() {
                return (React.createElement("li", null,
                    React.createElement("a", { "data-instanceidx": this.props.instanceId, "data-propertyname": this.props.propertyName, "data-toggle": "tooltip", "data-placement": "right", title: MoleOnlineWebUI.StaticData.TooltipText.get(this.props.propertyName), onClick: this.changeColoringProperty.bind(this), className: "init-lvz-tooltip lvz-properties" }, MoleOnlineWebUI.StaticData.Bundle.get(this.props.propertyName))));
            }
        }
        class RadiusMenuItem extends React.Component {
            changeRadiusProperty(e) {
                let targetElement = e.target;
                let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
                let instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[instanceIdx];
                let propertyName = targetElement.getAttribute("data-propertyname");
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
                let state = this.props.app.state;
                if (this.props.isCustom) {
                    state.customRadiusPropertyKey = propertyName;
                    this.props.app.setState(state);
                }
                else {
                    state.radiusPropertyKey = propertyName;
                    this.props.app.setState(state);
                }
            }
            render() {
                return (React.createElement("li", null,
                    React.createElement("a", { "data-instanceidx": this.props.instanceId, "data-propertyname": this.props.propertyName, "data-toggle": "tooltip", "data-placement": "right", title: MoleOnlineWebUI.StaticData.TooltipText.get(this.props.propertyName), onClick: this.changeRadiusProperty.bind(this), className: "init-lvz-tooltip lvz-radius" }, MoleOnlineWebUI.StaticData.Bundle.get(this.props.propertyName))));
            }
        }
        class ColorBoundsMenuItem extends React.Component {
            changeColorBoundsMode(e) {
                let targetElement = e.target;
                let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
                let instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[instanceIdx];
                let mode = targetElement.getAttribute("data-mode");
                if (mode === null || mode === void 0) {
                    return;
                }
                instance.setColorBoundsMode(mode);
                instance.vizualize();
                let state = this.props.app.state;
                state.colorBoundsMode = mode;
                this.props.app.setState(state);
            }
            render() {
                return (React.createElement("li", null,
                    React.createElement("a", { "data-instanceidx": this.props.instanceId, "data-mode": this.props.mode, onClick: this.changeColorBoundsMode.bind(this) }, this.props.mode)));
            }
        }
        class BootstrapDropUpMenuButton extends React.Component {
            render() {
                return React.createElement("div", { className: "btn-group dropup" },
                    React.createElement("button", { type: "button", className: "btn btn-xs btn-primary dropdown-toggle", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false" },
                        this.props.label,
                        " ",
                        React.createElement("span", { className: "caret" })),
                    React.createElement("ul", { className: "dropdown-menu" }, this.props.items));
            }
        }
        class Controls extends React.Component {
            render() {
                return (React.createElement("div", { className: "controls" },
                    React.createElement(RadiusSwitch, { state: this.props, isCustom: this.props.isCustom, radiusProperty: (this.props.isCustom) ? this.props.customRadiusPropertyKey : this.props.radiusPropertyKey }),
                    React.createElement(ColorBySwitch, { state: this.props, isCustom: this.props.isCustom, coloringProperty: (this.props.isCustom) ? this.props.customColoringPropertyKey : this.props.coloringPropertyKey })));
            }
        }
        class CommonControls extends React.Component {
            render() {
                return (React.createElement("div", { className: "controls" },
                    React.createElement(CommonButtonArea, Object.assign({}, this.props))));
            }
        }
        class ColorBySwitch extends React.Component {
            generateColorMenu() {
                let rv = [];
                for (let prop in this.props.state.data[0].Properties) {
                    rv.push(React.createElement(ColorMenuItem, Object.assign({ propertyName: prop, isCustom: this.props.isCustom }, this.props.state)));
                }
                return React.createElement(BootstrapDropUpMenuButton, { items: rv, label: this.props.coloringProperty });
            }
            render() {
                let items = this.generateColorMenu();
                return (React.createElement("span", { className: "block-like" },
                    React.createElement("span", { className: "control-label" }, "Color by:"),
                    " ",
                    items));
            }
        }
        class RadiusSwitch extends React.Component {
            generateRadiusSwitch() {
                let properties = ["MinRadius", "MinFreeRadius", "MinBRadius"];
                let rv = [];
                for (let prop of properties) {
                    rv.push(React.createElement(RadiusMenuItem, Object.assign({ propertyName: prop, isCustom: this.props.isCustom }, this.props.state)));
                }
                return React.createElement(BootstrapDropUpMenuButton, { items: rv, label: MoleOnlineWebUI.StaticData.Bundle.get(this.props.radiusProperty) });
            }
            render() {
                let items = this.generateRadiusSwitch();
                return (React.createElement("span", { className: "block-like" },
                    React.createElement("span", { className: "control-label" }, "Tunnel radius:"),
                    " ",
                    items));
            }
        }
        class CommonButtonArea extends React.Component {
            generateColorBoundsSwitch() {
                let properties = ["Min/max", "Absolute"];
                let rv = [];
                for (let prop of properties) {
                    rv.push(React.createElement(ColorBoundsMenuItem, Object.assign({ mode: prop }, this.props)));
                }
                let label = properties[(this.props.colorBoundsMode == "Min/max") ? 0 : 1];
                return React.createElement(BootstrapDropUpMenuButton, { items: rv, label: label });
            }
            render() {
                let items = this.generateColorBoundsSwitch();
                return (React.createElement("div", { className: "common-area" },
                    React.createElement(ColorBoundsSwitchButton, { items: items }),
                    React.createElement(ExportButton, { instanceId: this.props.instanceId })));
            }
        }
        class ExportTypeButton extends React.Component {
            export(e) {
                let targetElement = e.target;
                let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
                let instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[instanceIdx];
                let exportType = targetElement.getAttribute("data-exporttype");
                if (exportType === null) {
                    return;
                }
                let imgDataUrl = null;
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
                        throw new Error(`Unsupported export type '${exportType}'`);
                }
                CommonUtils.Misc.triggerDownload(imgDataUrl, `export-2D.${exportType.toLowerCase()}`);
            }
            render() {
                return React.createElement("li", null,
                    React.createElement("a", { "data-instanceidx": this.props.instanceId, "data-exporttype": this.props.exportType, onClick: this.export.bind(this) }, this.props.exportType));
            }
        }
        class ExportButton extends React.Component {
            generateItems() {
                let rv = [];
                let supportedExportTypes = ["PNG", "SVG" /*,"PDF"*/];
                for (let type of supportedExportTypes) {
                    rv.push(React.createElement(ExportTypeButton, { instanceId: this.props.instanceId, exportType: type }));
                }
                return rv;
            }
            render() {
                let label = "Export";
                let rv = this.generateItems();
                return (React.createElement(BootstrapDropUpMenuButton, { items: rv, label: label }));
            }
        }
        class ColorBoundsSwitchButton extends React.Component {
            render() {
                return (React.createElement("span", { className: "color-bounds-button-container" },
                    React.createElement("span", { className: "control-label", title: "Color bounds for both halfs of vizualized tunnel." }, "Color bounds:"),
                    " ",
                    this.props.items));
            }
        }
        class CanvasWrapper extends React.Component {
            render() {
                return (React.createElement("div", { className: "canvas-wrapper" },
                    React.createElement(RealCanvas, Object.assign({}, this.props)),
                    React.createElement(ImgOverlay, Object.assign({}, this.props)),
                    React.createElement(InteractionMap, Object.assign({}, this.props))));
            }
        }
        class ImgOverlay extends React.Component {
            render() {
                return (React.createElement("img", { className: "fake-canvas", id: `layer-vizualizer-fake-canvas${this.props.instanceId}`, useMap: `#layersInteractiveMap${this.props.instanceId}`, src: "images/no_img.png" }));
            }
        }
        class RealCanvas extends React.Component {
            render() {
                return (React.createElement("canvas", { id: `layer-vizualizer-canvas${this.props.instanceId}`, className: "layer-vizualizer-canvas", width: "700", height: "150" }));
            }
        }
        ;
        ;
        class InteractionMap extends React.Component {
            getLayerResidues(layerIdx) {
                let res = [];
                for (let residue of this.props.data[layerIdx].Residues) {
                    let parts = residue.split(" ");
                    res.push({
                        authAsymId: parts[2],
                        authSeqNumber: Number(parts[1]).valueOf()
                    });
                }
                /*
                console.log(`Layer ${layerIdx}:`);
                console.log(res);
                */
                return res;
            }
            /*
            private removeResidue3DView(){
                LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(this.props.app.props.controller.context, "res_visual");
            }*/
            resetFocusToTunnel() {
                LiteMol.Bootstrap.Command.Entity.Focus.dispatch(this.props.app.props.controller.context, this.props.app.props.controller.context.select(this.props.app.state.currentTunnelRef));
            }
            showLayerResidues3DAndFocus(layerIdx) {
                /*
                let theme = generateLayerSelectColorTheme(layerIdx,this.props.app);
                applyTheme(theme,this.props.app.props.controller,this.props.app.state.currentTunnelRef);
                */
                let residues = this.getLayerResidues(layerIdx);
                let query = LiteMol.Core.Structure.Query.residues(...residues);
                /*this.removeResidue3DView();*/
                //CommonUtils.Selection.SelectionHelper.clearSelection(this.props.app.props.controller);
                CommonUtils.Selection.SelectionHelper.clearAltSelection(this.props.app.props.controller);
                let t = this.props.app.props.controller.createTransform();
                t.add('polymer-visual', Transformer.Molecule.CreateSelectionFromQuery, { query, name: 'Residues' }, { ref: CommonUtils.Selection.SelectionHelper.getAltSelectionVisualRef() })
                    .then(Transformer.Molecule.CreateVisual, { style: Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
                this.props.app.props.controller.applyTransform(t)
                    .then(res => {
                    //Focus
                    LiteMol.Bootstrap.Command.Entity.Focus.dispatch(this.props.app.props.controller.context, this.props.app.props.controller.context.select(CommonUtils.Selection.SelectionHelper.getAltSelectionVisualRef()));
                });
            }
            displayDetailsEventHandler(e) {
                let targetElement = e.target;
                let layerIdx = Number(targetElement.getAttribute("data-layeridx")).valueOf();
                let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
                let instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[instanceIdx];
                instance.highlightHitbox(layerIdx);
                if (!this.props.app.state.isLayerSelected) {
                    let state = this.props.app.state;
                    state.layerId = layerIdx;
                    this.props.app.setState(state);
                    $(window).trigger('layerTriggered', layerIdx);
                    /*$( window ).trigger('resize');
                    $( window ).trigger('contentResize');*/
                }
            }
            displayLayerResidues3DEventHandler(e) {
                let targetElement = e.target;
                let layerIdx = Number(targetElement.getAttribute("data-layeridx")).valueOf();
                let instanceIdx = Number(targetElement.getAttribute("data-instanceidx")).valueOf();
                let instance = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[instanceIdx];
                if (instance.getSelectedLayer() === layerIdx) {
                    this.props.app.state.isLayerSelected = false;
                    //CommonUtils.Selection.SelectionHelper.clearSelection(this.props.app.props.controller);
                    CommonUtils.Selection.SelectionHelper.clearAltSelection(this.props.app.props.controller);
                    this.resetFocusToTunnel();
                    instance.deselectLayer();
                    instance.highlightHitbox(layerIdx);
                }
                else {
                    let state = this.props.app.state;
                    state.layerId = layerIdx;
                    state.isLayerSelected = true;
                    this.props.app.setState(state);
                    this.showLayerResidues3DAndFocus(layerIdx);
                    instance.deselectLayer();
                    instance.selectLayer(layerIdx);
                    $(window).trigger('layerTriggered', layerIdx);
                    $(window).trigger('resize');
                }
            }
            getTunnelScale(tunnel) {
                let xScale = 0;
                let yScale = 0;
                if (tunnel !== null) {
                    let scale = tunnel.getScale();
                    if (scale !== null) {
                        xScale = scale.x;
                        yScale = scale.y;
                    }
                }
                return {
                    xScale,
                    yScale
                };
            }
            transformCoordinates(x, y, width, height, scale, bounds) {
                let vizualizer = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[this.props.instanceId];
                //Real width can be different to canvas width - hitboxes could run out of space
                let realXScale = 1;
                let realWidth = vizualizer.getCanvas().offsetWidth.valueOf();
                if (realWidth != 0) {
                    realXScale = 1 / (vizualizer.getCanvas().width / realWidth);
                }
                let realYScale = 1;
                let realHeight = vizualizer.getCanvas().offsetHeight.valueOf();
                if (realHeight != 0) {
                    realYScale = 1 / (vizualizer.getCanvas().height / realHeight);
                }
                return {
                    sx: (bounds.x + x * scale.xScale) * realXScale,
                    sy: (bounds.y + y * scale.yScale) * realYScale,
                    dx: (bounds.x + (x + width) * scale.xScale) * realXScale,
                    dy: (bounds.y + (y + height) * scale.yScale) * realYScale
                };
            }
            makeCoordinateString(x, y, width, height, scale, bounds) {
                let coordinates = this.transformCoordinates(x, y, width, height, scale, bounds);
                return String(coordinates.sx) + ','
                    + String(coordinates.sy) + ','
                    + String(coordinates.dx) + ','
                    + String(coordinates.dy);
            }
            generatePhysicalHitboxesCoords() {
                let vizualizer = LayersVizualizer.Vizualizer.ACTIVE_INSTANCES[this.props.instanceId];
                let data = this.props.data;
                //Data was not prepared yet
                if (vizualizer.isDataDirty()) {
                    vizualizer.prepareData();
                }
                let hitboxes = vizualizer.getHitboxes();
                let tunnels = vizualizer.getTunnels();
                if (tunnels === null
                    || hitboxes === null
                    || (hitboxes.defaultTunnel === null && hitboxes.customizable === null)) {
                    return [];
                }
                let defaultTunnel = tunnels.default;
                let customizableTunnel = tunnels.customizable;
                let dTproperties = null;
                let dTbounds = null;
                if (defaultTunnel !== null) {
                    dTproperties = this.getTunnelScale(defaultTunnel.tunnel);
                    dTbounds = defaultTunnel.bounds;
                }
                let cTproperties = null;
                let cTbounds = null;
                if (customizableTunnel !== null) {
                    cTproperties = this.getTunnelScale(customizableTunnel.tunnel);
                    cTbounds = customizableTunnel.bounds;
                }
                let rv = [];
                for (let i = 0; i < data.length; i++) {
                    if (hitboxes.defaultTunnel !== null && dTproperties !== null && dTbounds !== null) {
                        let hitbox = hitboxes.defaultTunnel[i];
                        rv.push({
                            layerIdx: i,
                            coords: this.makeCoordinateString(hitbox.x, hitbox.y, hitbox.width, hitbox.height, dTproperties, dTbounds)
                        });
                    }
                    if (hitboxes.customizable !== null && cTproperties !== null && cTbounds !== null) {
                        let hitbox = hitboxes.customizable[i];
                        rv.push({
                            layerIdx: i,
                            coords: this.makeCoordinateString(hitbox.x, hitbox.y, hitbox.width, hitbox.height, cTproperties, cTbounds)
                        });
                    }
                }
                return rv;
            }
            render() {
                let areas = [];
                if (this.props.isDOMReady) {
                    let hitboxesCoords = this.generatePhysicalHitboxesCoords();
                    for (let i = 0; i < hitboxesCoords.length; i++) {
                        areas.push(React.createElement("area", { shape: "rect", coords: hitboxesCoords[i].coords.valueOf(), "data-layeridx": String(hitboxesCoords[i].layerIdx.valueOf()), "data-instanceidx": String(this.props.instanceId), onMouseOver: this.displayDetailsEventHandler.bind(this), onMouseDown: this.displayLayerResidues3DEventHandler.bind(this) }));
                    }
                }
                return (React.createElement("map", { name: `layersInteractiveMap${this.props.instanceId}`, id: `layer-vizualizer-hitbox-map${this.props.instanceId}` }, areas));
            }
        }
    })(UI = LayersVizualizer.UI || (LayersVizualizer.UI = {}));
})(LayersVizualizer || (LayersVizualizer = {}));
var LayersVizualizer;
(function (LayersVizualizer) {
    ;
    ;
    ;
    ;
    class DrawableObject {
    }
    LayersVizualizer.DrawableObject = DrawableObject;
    class ContextAwareObject extends DrawableObject {
        constructor(context) {
            super();
            this.context = context;
            this.lineWidth = 1;
        }
        clipToBounds(bounds) {
            this.context.rect(bounds.x, bounds.y, bounds.width, bounds.height);
            this.context.clip();
        }
        /*
                public setContext(context:CanvasRenderingContext2D){
                    this.context = context;
                }
        */
        /* Context must be known before hitbox generation
                public draw(x: number, y:number, width:number, height:number, context?:CanvasRenderingContext2D):void{
                    this.setContext(context);
                    this.draw(x,y,width,height);
                }
        */
        drawFromBounds(bounds) {
            this.draw(bounds.x, bounds.y, bounds.width, bounds.height);
        }
        clear(bounds) {
            this.context.clearRect(bounds.x - this.lineWidth, bounds.y - this.lineWidth, bounds.width + this.lineWidth * 2, bounds.height + this.lineWidth * 2);
        }
    }
    LayersVizualizer.ContextAwareObject = ContextAwareObject;
    //--
    class Axis extends ContextAwareObject {
        constructor(minVal, maxVal, context, countOfParts, isHorizontal = true, marginPercent = 5, lineWidth = 2) {
            super(context);
            this.doHighlight = false; //Žluté podbarvení obdélníku
            this.lineColor = "#8c8c8c";
            this.isHorizontal = isHorizontal;
            this.minVal = minVal;
            this.maxVal = maxVal;
            this.countOfParts = countOfParts;
            this.margin = marginPercent;
            this.lineWidth = lineWidth;
        }
        drawMainLine(bounds) {
            if (this.isHorizontal) {
                this.context.moveTo(bounds.x, bounds.y + bounds.height / 2);
                this.context.lineTo(bounds.x + bounds.width, bounds.y + bounds.height / 2);
            }
            else {
                this.context.moveTo(bounds.x + bounds.width / 2, bounds.y);
                this.context.lineTo(bounds.x + bounds.width / 2, bounds.y + bounds.height);
            }
        }
        drawPartLine(bounds, partIdx) {
            if (this.isHorizontal) {
                let partSize = bounds.width / this.countOfParts;
                let margin = (bounds.height / 100) * this.margin;
                this.context.moveTo(bounds.x + partIdx * partSize, bounds.y + margin);
                this.context.lineTo(bounds.x + partIdx * partSize, bounds.y + (bounds.height - margin));
            }
            else {
                let partSize = bounds.height / this.countOfParts;
                let margin = (bounds.width / 100) * this.margin;
                this.context.moveTo(bounds.x + margin, bounds.y + partIdx * partSize);
                this.context.lineTo(bounds.x + (bounds.width - margin), bounds.y + partIdx * partSize);
            }
        }
        draw(x, y, width, height) {
            let bounds = { x, y, width, height };
            this.clear(bounds);
            this.context.save();
            this.clipToBounds(bounds);
            this.context.strokeStyle = this.lineColor;
            this.context.beginPath();
            this.context.lineWidth = this.lineWidth;
            this.drawMainLine(bounds);
            for (let i = 0; i <= this.countOfParts; i++) {
                this.drawPartLine(bounds, i);
            }
            this.context.closePath();
            this.context.stroke();
            if (this.doHighlight) {
                this.context.fillStyle = "yellow";
                this.context.fillRect(x, y, width, height);
            }
            this.context.restore();
        }
    }
    LayersVizualizer.Axis = Axis;
    class CurlyBrackets extends ContextAwareObject {
        constructor(context /*, isLeftToRight:boolean=true*/) {
            super(context);
            this.lineColor = "#8c8c8c";
            this.isLeftToRight = true; /*isLeftToRight;*/
        }
        draw(x, y, width, height) {
            //!!!
            this.isLeftToRight = true;
            //!!!
            let bounds = { x, y, width, height };
            this.clear(bounds);
            /*
            let radius = bounds.width/2;
            let linelength = bounds.height / 2;

            let lx = bounds.x + radius;
            let r = (this.isLeftToRight?(-1)*radius:radius);
            */
            let border = (bounds.width / 100) * 10;
            let borderVertical = (bounds.height / 100) * 2;
            let radius = (bounds.width - (2 * border)) / 2;
            let lineLength = (bounds.height - (borderVertical * 2)) / 2;
            let p0 = {
                x: bounds.x + border,
                y: bounds.y + borderVertical
            };
            let p1 = {
                x: bounds.x + border + radius,
                y: bounds.y + borderVertical
            };
            let p2 = {
                x: bounds.x + border + radius,
                y: bounds.y + borderVertical + radius
            };
            let p3 = {
                x: bounds.x + border + radius,
                y: bounds.y + borderVertical + lineLength - radius
            };
            let p4 = {
                x: bounds.x + border + radius,
                y: bounds.y + borderVertical + lineLength
            };
            let p5 = {
                x: bounds.x + border + radius * 2,
                y: bounds.y + borderVertical + lineLength
            };
            let p6 = {
                x: bounds.x + border + radius,
                y: bounds.y + borderVertical + lineLength + radius
            };
            let p7 = {
                x: bounds.x + border + radius,
                y: bounds.y + borderVertical + lineLength * 2 - radius
            };
            let p8 = {
                x: bounds.x + border + radius,
                y: bounds.y + borderVertical + lineLength * 2
            };
            let p9 = {
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
        }
    }
    LayersVizualizer.CurlyBrackets = CurlyBrackets;
    class ArrowHeadLine extends ContextAwareObject {
        constructor(context, isHorizontal = true) {
            super(context);
            this.lineColor = "#8c8c8c";
            this.doHighlight = false; //Žluté podbarvení obdélníku
            this.isHorizontal = isHorizontal;
            this.lineWidth = 0.5;
        }
        draw(x, y, width, height) {
            this.bounds = { x, y, width, height };
            let xMargin = ((width / 100) * 2);
            let yMargin = ((height / 100) * 15);
            let x1 = (this.isHorizontal ? x + xMargin : x + width / 2 - this.lineWidth / 2);
            let x2 = (this.isHorizontal ? x + width - xMargin : x + width / 2 - this.lineWidth / 2);
            let y1 = (this.isHorizontal ? y + height / 2 - this.lineWidth / 2 : y + yMargin);
            let y2 = (this.isHorizontal ? y + height / 2 - this.lineWidth / 2 : y + height - yMargin);
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
        }
        drawArrowhead(x, y, radians) {
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
        }
    }
    LayersVizualizer.ArrowHeadLine = ArrowHeadLine;
    class TextBox extends ContextAwareObject {
        constructor(value, context, fontSize = "medium", textAlign = "center") {
            super(context);
            this.doHighlight = false; //Žluté podbarvení obdélníků s textem
            this.value = value;
            this.fontSize = fontSize;
            this.textAlign = textAlign;
            this.lineWidth = 2;
        }
        fontSizeToPercent(fontSize) {
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
        }
        getRealFontSize(fontSize) {
            let hUnit = this.context.canvas.height / 100;
            return this.fontSizeToPercent(fontSize) * hUnit;
        }
        draw(x, y, width, height) {
            let realTextSize = this.getRealFontSize(this.fontSize);
            this.context.save();
            this.clear({ x, y, width, height });
            if (this.doHighlight) {
                this.context.fillStyle = "yellow";
                this.context.fillRect(x, y, width, height);
            }
            this.context.font = `normal normal normal ${realTextSize}px sans-serif`;
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
        }
    }
    LayersVizualizer.TextBox = TextBox;
    class ColorMixer extends ContextAwareObject {
        constructor(minVal, maxVal, context, paletteFunction, paletteFunctionSettings, isHorizontal = false) {
            super(context);
            this.lineColor = "#8c8c8c";
            this.minVal = minVal;
            this.maxVal = maxVal;
            this.paletteFunction = paletteFunction;
            this.paletteFunctionSettings = paletteFunctionSettings;
            this.isHorizontal = isHorizontal;
        }
        draw(x, y, width, height) {
            let bounds = { x, y, width, height };
            this.clear(bounds);
            this.context.save();
            this.clipToBounds(bounds);
            this.context.strokeStyle = this.lineColor;
            let my_gradient = this.context.createLinearGradient(bounds.x + (this.isHorizontal ? bounds.width : 0), bounds.y, bounds.x, bounds.y + (this.isHorizontal ? 0 : bounds.height));
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
        }
    }
    LayersVizualizer.ColorMixer = ColorMixer;
    class Tunnel extends ContextAwareObject {
        constructor(minVal, maxVal, layers, context, paletteFunction, paletteFunctionSettings, isInverted = false) {
            super(context);
            this.highlightLineWidth = 1;
            this.lineWidth = 1;
            this.hitboxLineWidth = 1;
            this.lineColor = "#8c8c8c";
            this.hitboxLineColor = "#173133";
            this.highlightLineColor = '#000';
            this.minVal = minVal;
            this.maxVal = maxVal;
            this.layers = layers;
            this.paletteFunction = paletteFunction;
            this.isInverted_ = isInverted;
            this.paletteFunctionSettings = paletteFunctionSettings;
            this.hasBounds = false;
        }
        setBounds(x, y, width, height) {
            this.bounds = { x, y, width, height };
            this.scale = {
                x: this.bounds.width / this.maxVal.x,
                y: this.bounds.height / this.maxVal.y
            };
            this.hasBounds = true;
        }
        clear(bounds) {
            let lineCorrection = this.getCorrectionWidth();
            this.context.clearRect(bounds.x - lineCorrection, bounds.y - lineCorrection, bounds.width + lineCorrection * 2, bounds.height + lineCorrection * 2);
        }
        getCorrectionWidth() {
            var width = Math.max(this.lineWidth, this.hitboxLineWidth);
            return Math.max(width, this.highlightLineWidth);
        }
        draw(x, y, width, height) {
            this.setBounds(x, y, width, height);
            this.clear(this.bounds);
            this.renderAllLayers();
            //Render hitboxes to canvas - dotted lines between layers
            this.renderHitboxes();
            this.paintBox();
            this.currentVisualPlain = this.context.getImageData(this.bounds.x, this.bounds.y, this.bounds.width + 1, this.bounds.height + 1);
            this.currentVisual = this.currentVisualPlain;
            //this.highlightHitbox(0);
        }
        renderHitboxes() {
            for (let i = 1; i < this.layers.length; i++) {
                this.renderHitbox(i);
            }
        }
        getHitboxes() {
            let rv = [];
            for (let i = 0; i < this.layers.length; i++) {
                rv.push(this.getHitbox(i));
            }
            return rv;
        }
        highlightHitbox(layerIdx) {
            this.clear(this.bounds);
            this.context.putImageData(this.currentVisual, this.bounds.x, this.bounds.y);
            let hitbox = this.getHitbox(layerIdx);
            let bottom = this.getBottom();
            this.drawSolidLine(hitbox.x, hitbox.y, hitbox.x + hitbox.width, hitbox.y, this.highlightLineWidth, this.highlightLineColor);
            this.drawSolidLine(hitbox.x + hitbox.width, hitbox.y, hitbox.x + hitbox.width, hitbox.y + hitbox.height, this.highlightLineWidth, this.highlightLineColor);
            this.drawSolidLine(hitbox.x + hitbox.width, hitbox.y + hitbox.height, hitbox.x, hitbox.y + hitbox.height, this.highlightLineWidth, this.highlightLineColor);
            this.drawSolidLine(hitbox.x, hitbox.y + hitbox.height, hitbox.x, hitbox.y, this.highlightLineWidth, this.highlightLineColor);
            //this.paintBox();
        }
        deselectLayer() {
            this.clear(this.bounds);
            this.currentVisual = this.currentVisualPlain;
            this.context.putImageData(this.currentVisual, this.bounds.x, this.bounds.y);
        }
        selectLayer(layerIdx) {
            this.clear(this.bounds);
            this.context.putImageData(this.currentVisual, this.bounds.x, this.bounds.y);
            let hitbox = this.getHitbox(layerIdx);
            let bottom = this.getBottom();
            this.drawSolidLine(hitbox.x, hitbox.y, hitbox.x + hitbox.width, hitbox.y, this.highlightLineWidth, "#ff0000");
            this.drawSolidLine(hitbox.x + hitbox.width, hitbox.y, hitbox.x + hitbox.width, hitbox.y + hitbox.height, this.highlightLineWidth, "#ff0000");
            this.drawSolidLine(hitbox.x + hitbox.width, hitbox.y + hitbox.height, hitbox.x, hitbox.y + hitbox.height, this.highlightLineWidth, "#ff0000");
            this.drawSolidLine(hitbox.x, hitbox.y + hitbox.height, hitbox.x, hitbox.y, this.highlightLineWidth, "#ff0000");
            this.currentVisual = this.context.getImageData(this.bounds.x, this.bounds.y, this.bounds.width + 1, this.bounds.height + 1);
        }
        paintBox() {
            let firstHitbox = this.getHitbox(0);
            let lastHitbox = this.getHitbox(this.layers.length - 1);
            let r = {
                sx: firstHitbox.x,
                sy: firstHitbox.y,
                ex: lastHitbox.x + lastHitbox.width,
                ey: lastHitbox.y + lastHitbox.height
            };
            this.drawSolidLine(r.sx, r.sy, r.ex, r.sy, this.lineWidth, this.lineColor);
            this.drawSolidLine(r.ex, r.sy, r.ex, r.ey, this.lineWidth, this.lineColor);
            this.drawSolidLine(r.ex, r.ey, r.sx, r.ey, this.lineWidth, this.lineColor);
            this.drawSolidLine(r.sx, r.ey, r.sx, r.sy, this.lineWidth, this.lineColor);
        }
        getScale() {
            if (!this.hasBounds) {
                return null;
            }
            return this.scale;
        }
        renderAllLayers() {
            this.context.save();
            //Mozilla odmita v urcitych pripadech v 1. polovine tunelu zobrazit barevny prechod kdyz je zapnuty clip()
            //this.clipToBounds(this.bounds);
            let gLine = {
                x0: this.bounds.x,
                y0: 0,
                x1: this.bounds.x + this.bounds.width,
                y1: 0
            };
            let gradient = this.context.createLinearGradient(gLine.x0, gLine.y0, gLine.x1, gLine.y1);
            let path = [];
            let lastColorStop = 0;
            for (let i = 0; i < this.layers.length; i++) {
                lastColorStop = this.prepareLayer(i, gradient, path, lastColorStop);
            }
            this.context.fillStyle = gradient;
            this.context.beginPath();
            this.drawPath(path);
            let scale = this.getScale();
            if (scale === null) {
                throw new Error("Value of scale not computed");
            }
            let restOfBody = [
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
            this.drawPath(restOfBody);
            this.context.closePath();
            this.context.fill();
            this.context.restore();
            this.context.save();
            this.clipToBounds(this.bounds);
            this.context.strokeStyle = this.lineColor;
            this.context.lineWidth = this.lineWidth;
            this.context.beginPath();
            this.context.moveTo(path[0].x, path[0].y);
            this.drawPath(path);
            this.drawPath(path.reverse());
            this.context.closePath();
            this.context.stroke();
            this.context.restore();
        }
        drawPath(path) {
            for (let i = 0; i < path.length; i++) {
                this.context.lineTo(path[i].x, path[i].y);
            }
        }
        prepareLayer(layerIdx, gradient, path, lastColorStop) {
            if (layerIdx < 0) {
                throw new Error("layerIdx must be greater or equal to 0");
            }
            let totalLenght = this.layers[this.layers.length - 1].end - this.layers[0].start;
            let currLength = this.layers[layerIdx].end - this.layers[0].start;
            let scale = this.getScale();
            if (scale === null) {
                throw new Error("Value of scale not computed in time!");
            }
            // Barvy gradientu
            let prevColorValue = ((layerIdx - 1) in this.layers)
                ? this.layers[layerIdx - 1].value
                : this.layers[layerIdx].value;
            let curColorValue = this.layers[layerIdx].value;
            let prevRadius = ((layerIdx - 1) in this.layers)
                ? this.layers[layerIdx - 1].radius
                : this.layers[layerIdx].radius;
            let bottom = this.getBottom();
            let end = this.layers[layerIdx].end;
            let start = this.layers[layerIdx].start;
            if (layerIdx > 0) {
                start = this.bounds.x + this.layers[layerIdx - 1].end * scale.x;
            }
            let inversionConstant = (this.isInverted()) ? (-1) : 1;
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
            let color = this.paletteFunction(Number(prevColorValue), this.paletteFunctionSettings);
            let currentColorStop = 0;
            if (layerIdx != 0) {
                color = this.paletteFunction(Number(curColorValue), this.paletteFunctionSettings);
                currentColorStop = (currLength / totalLenght);
            }
            gradient.addColorStop(currentColorStop, color);
            return currentColorStop;
        }
        getHitbox(layerIdx) {
            return {
                x: this.layers[layerIdx].start,
                y: 0,
                width: this.layers[layerIdx].end - this.layers[layerIdx].start,
                height: this.maxVal.y,
                layerID: layerIdx
            };
        }
        moveTo(x, y) {
            let bottom = this.getBottom();
            let inversionKoeficient = 1;
            if (this.isInverted_) {
                inversionKoeficient = -1;
            }
            this.context.moveTo(this.bounds.x + x * this.scale.x, bottom - y * this.scale.y * inversionKoeficient);
        }
        lineTo(x, y) {
            let bottom = this.getBottom();
            let inversionKoeficient = 1;
            if (this.isInverted_) {
                inversionKoeficient = -1;
            }
            this.context.lineTo(this.bounds.x + x * this.scale.x, bottom - y * this.scale.y * inversionKoeficient);
        }
        drawSolidLine(sx, sy, ex, ey, lineWidth = 1, strokeStyle = "#000") {
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
        }
        renderHitbox(layerIdx) {
            if (layerIdx == 0) {
                return;
            }
            let scale = this.getScale();
            if (scale === null) {
                throw new Error("Value of scale has not been computed!");
            }
            let inversionConstant = (this.isInverted()) ? -1 : 1;
            let hitbox = this.getHitbox(layerIdx);
            let maxY = this.layers[layerIdx - 1].radius;
            let yStart = this.bounds.y
                + hitbox.y * scale.y
                + (this.isInverted() ? 0 : hitbox.height * scale.y - (maxY * scale.y))
                + this.lineWidth;
            let height = maxY * scale.y;
            let bgColor = "#ffffff";
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
        }
        getBottom() {
            return (this.isInverted_)
                ? this.bounds.y
                : this.bounds.y + this.bounds.height;
        }
        getTop() {
            return (this.isInverted_)
                ? this.bounds.y + this.bounds.height
                : this.bounds.y;
        }
        isInverted() {
            return this.isInverted_;
        }
    }
    LayersVizualizer.Tunnel = Tunnel;
})(LayersVizualizer || (LayersVizualizer = {}));
var LayersVizualizer;
(function (LayersVizualizer) {
    ;
    ;
    ;
    class Vizualizer {
        constructor(uiContainerId, settings) {
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
            this.tmpCanvasId = `tmpCanvas_${this.publicInstanceIdx}`;
            this.selectedLayerIdx = -1;
            this.__colorFunctionSetings = new Map();
            //Dynamic canvas resizing
            this.resizePercentPrecision = 1; //5% difference between real and given => cause resizing of canvas
            window.addEventListener("resize", this.onWindowResize.bind(this));
            $(window).on("lvContentResize", this.onContentResize.bind(this));
        }
        getPublicInstanceIdx() {
            return this.publicInstanceIdx;
        }
        getCurrentColoringSettings(tunnelType) {
            return this.__colorFunctionSetings.get(tunnelType);
        }
        setCurrentColorFunctionSettings(tunnelType, colorFunctionSetings) {
            this.__colorFunctionSetings.set(tunnelType, colorFunctionSetings);
        }
        isDataDirty() {
            return this.dataDirty;
        }
        getCanvas() {
            //DOM binding check
            if (!this.isDOMBound) {
                this.rebindDOMRefs();
            }
            return this.__canvas;
        }
        getContext() {
            //DOM binding check
            if (!this.isDOMBound) {
                this.rebindDOMRefs();
            }
            return this.__context;
        }
        getTunnels() {
            if (this.dataDirty) {
                return null;
            }
            return this.__tunnels;
        }
        onWindowResize(e) {
            if (document.getElementById(this.canvasId) === null) {
                return;
            }
            let canvas = this.getCanvas();
            let context = this.getContext();
            if (canvas === void 0 || context === void 0 || !this.isElementVisible(canvas) || !CommonUtils.Tabs.isActive("left-tabs", "1")) {
                return;
            }
            let xUnit = canvas.width / 100;
            let yUnit = canvas.height / 100;
            let x_diff = Math.abs(canvas.width - canvas.offsetWidth) / xUnit;
            let y_diff = Math.abs(canvas.height - canvas.offsetHeight) / yUnit;
            if (x_diff < this.resizePercentPrecision
                && y_diff < this.resizePercentPrecision) {
                return;
            }
            this.resizeCanvas();
            this.vizualize();
            this.highlightHitbox(this.currentLayerIdx);
        }
        isElementVisible(element) {
            if (element.style.display === "none" || element.style.visibility === "hidden") {
                return false;
            }
            if (element.parentElement === null || element.parentElement === void 0) {
                return true;
            }
            return this.isElementVisible(element.parentElement);
        }
        onContentResize(e) {
            if (document.getElementById(this.canvasId) === null) {
                return;
            }
            let canvas = this.getCanvas();
            let context = this.getContext();
            if (canvas === void 0 || context === void 0 || !this.isElementVisible(canvas) || !CommonUtils.Tabs.isActive("left-tabs", "1")) {
                return;
            }
            this.resizeCanvas();
            this.vizualize();
            this.highlightHitbox(this.currentLayerIdx);
        }
        resizeCanvas() {
            let canvas = this.getCanvas();
            let context = this.getContext();
            if (canvas === void 0 || context === void 0) {
                return;
            }
            context.clearRect(0, 0, canvas.width, canvas.height);
            canvas.setAttribute("width", String(canvas.offsetWidth));
            canvas.setAttribute("height", String(canvas.offsetHeight));
        }
        configBySettings(settings) {
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
        }
        configureColors() {
            let maxYellow = { r: 251, g: 255, b: 7 };
            let middleYellow = { r: 240, g: 248, b: 190 };
            let maxBlue = { r: 0, g: 0, b: 255 };
            let middleBlue = { r: 253, g: 253, b: 255 };
            let maxRed = { r: 255, g: 0, b: 0 };
            let middleRed = { r: 253, g: 253, b: 225 };
            let maxWhite = { r: 255, g: 255, b: 255 };
            let middleWhite = { r: 240, g: 240, b: 240 };
            this.minColor = {
                Hydropathy: maxBlue,
                Hydrophobicity: maxBlue,
                Mutability: maxBlue,
                Polarity: maxYellow,
                Charge: maxRed,
                NumPositives: maxWhite,
                NumNegatives: maxWhite
            };
            this.minColorMiddle = {
                Hydropathy: middleBlue,
                Hydrophobicity: middleBlue,
                Mutability: middleBlue,
                Polarity: middleYellow,
                Charge: middleRed,
                NumPositives: middleWhite,
                NumNegatives: middleWhite
            };
            this.maxColorMiddle = {
                Hydropathy: middleYellow,
                Hydrophobicity: middleYellow,
                Mutability: middleRed,
                Polarity: middleBlue,
                Charge: middleBlue,
                NumPositives: middleBlue,
                NumNegatives: middleRed
            };
            this.maxColor = {
                Hydropathy: maxYellow,
                Hydrophobicity: maxYellow,
                Mutability: maxRed,
                Polarity: maxBlue,
                Charge: maxBlue,
                NumPositives: maxBlue,
                NumNegatives: maxRed
            };
        }
        deselectLayer() {
            this.selectedLayerIdx = -1;
            let tunnels = this.getTunnels();
            if (tunnels === null) {
                return;
            }
            if (tunnels.default !== null) {
                tunnels.default.tunnel.deselectLayer();
            }
            if (tunnels.customizable !== null) {
                tunnels.customizable.tunnel.deselectLayer();
            }
        }
        selectLayer(layerIdx) {
            if (layerIdx < 0) {
                return;
            }
            this.selectedLayerIdx = layerIdx;
            let tunnels = this.getTunnels();
            if (tunnels === null) {
                return;
            }
            if (tunnels.default !== null) {
                tunnels.default.tunnel.selectLayer(layerIdx);
            }
            if (tunnels.customizable !== null) {
                tunnels.customizable.tunnel.selectLayer(layerIdx);
            }
        }
        getSelectedLayer() {
            return this.selectedLayerIdx;
        }
        setResizePercentPrecision(percentPrecision) {
            this.resizePercentPrecision = percentPrecision;
        }
        getResizePercentPrecision() {
            return this.resizePercentPrecision;
        }
        setColorBoundsMode(mode) {
            this.useColorMinMax = (mode == "Min/max");
        }
        rebindDOMRefs() {
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
        }
        /** Datasource change **/
        setData(layersData) {
            this.currentLayerIdx = -1;
            this.selectedLayerIdx = -1;
            this.data = layersData;
            this.dataDirty = true;
        }
        prepareData() {
            if (this.data.length == 0) {
                console.log("ERR: no data supplied!");
                return;
            }
            this.maxX = this.data[this.data.length - 1].EndDistance;
            this.maxY = this.data[0][this.radiusPropertyKey];
            this.customMaxY = this.data[0][this.customRadiusPropertyKey];
            let val = this.data[0].Properties[this.coloringPropertyKey];
            if (val == null) {
                throw new Error("Cannot init LayerVizualizer due to invalid settings - coloringProperty: "
                    + String(this.coloringPropertyKey));
            }
            this.minColoringValue = new Map();
            this.maxColoringValue = new Map();
            for (let key in this.data[0].Properties) {
                this.minColoringValue.set(key, this.data[0].Properties[key]);
                this.maxColoringValue.set(key, this.data[0].Properties[key]);
            }
            for (let i = 0; i < this.data.length; i++) {
                this.maxY = Math.max(this.maxY, this.data[i][this.radiusPropertyKey]);
                this.customMaxY = Math.max(this.customMaxY, this.data[i][this.customRadiusPropertyKey]);
                for (let key in this.data[i].Properties) {
                    let curVal = Number(this.data[i].Properties[key]);
                    if (curVal === void 0) {
                        throw new Error("Corrupted data!");
                    }
                    let oldMinVal = this.minColoringValue.get(key);
                    if (oldMinVal === void 0 || curVal.valueOf() < oldMinVal.valueOf()) {
                        this.minColoringValue.set(key, curVal.valueOf());
                    }
                    let oldMaxVal = this.maxColoringValue.get(key);
                    if (oldMaxVal === void 0 || curVal.valueOf() > oldMaxVal.valueOf()) {
                        this.maxColoringValue.set(key, curVal.valueOf());
                    }
                }
            }
            this.dataDirty = false;
            this.currentLayerIdx = 0;
        }
        /** Layer vizualization **/
        getComponentsPositioning() {
            let canvas = this.getCanvas();
            if (canvas === null || canvas === void 0) {
                throw new Error("Canvas element is not bound!");
            }
            let currentWidth = canvas.width;
            let currentHeight = canvas.height;
            let colorMixerMinPxWidth = 150;
            let distanceLabelMinPxWidth = 80;
            var toRealPx = function (width, height, component) {
                return component.toBounds(width, height);
            };
            var toPercent = function (width, height, realX, realY) {
                return {
                    x: (realX / width) * 100,
                    y: (realY / height) * 100
                };
            };
            let positioning = {
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
            let dtHeight = 30; //35
            let dtTop = 13;
            let dtmTop = 0;
            let haTop = dtTop + dtmTop + dtHeight;
            let haHeight = 10;
            let smallLabelHeight = haHeight / 2;
            let dtWidth = 80;
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
            let cmhWidth = 100 - (positioning.defaultColorMixer.left);
            let cmhHeight = 4;
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
                        - (cmhHeight + 1 /*1=margin-bottom*/);
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
            let colorMixerTooThin = (toRealPx(currentWidth, currentHeight, positioning.defaultColorMixerHorizontal).width < colorMixerMinPxWidth);
            if (colorMixerTooThin) {
                let width = toPercent(currentWidth, currentHeight, colorMixerMinPxWidth, 0).x;
                let x = positioning.defaultColorMixerHorizontal.left + (positioning.defaultColorMixerHorizontal.width - width);
                let colorMixerComponents = [
                    positioning.defaultColorMixerHorizontal,
                    positioning.customizableColorMixerHorizontal
                ];
                for (let component of colorMixerComponents) {
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
            let bigLabelHeight = positioning.horizontalAxis.height - (positioning.horizontalAxis.height / 8) * 2;
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
            let ahLineHeight = 4;
            let ahLineVerticalMargin = 1.5;
            let ahLineWidth = dtWidth / 2;
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
            let ahLineLabelWidth = ahLineWidth / 4;
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
                    + positioning.customizableArrowheadLine.marginTop;
                positioning.customizableArrowheadLineLabel.width = ahLineLabelWidth;
                positioning.customizableArrowheadLineLabel.height = ahLineHeight;
            }
            let cmLabelWidth = positioning.defaultColorMixerHorizontal.width / 2.5;
            let cmLabelHeight = positioning.defaultColorMixerHorizontal.height;
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
                let emptySpaceX = positioning.defaultColorMixerHorizontal.left - positioning.defaultTunnel.left - 2;
                let fallDownLeft = positioning.defaultTunnel.left;
                let distanceLabelComponents = [
                    positioning.defaultArrowheadLine,
                    positioning.customizableArrowheadLine
                ];
                for (let component of distanceLabelComponents) {
                    component.width = emptySpaceX;
                    component.left = positioning.defaultTunnel.left + emptySpaceX / 2 - component.width / 2;
                    if (component.left < fallDownLeft) {
                        component.left = fallDownLeft;
                    }
                }
                let labelX = (positioning.defaultArrowheadLine.left === void 0) ? 0 : positioning.defaultArrowheadLine.left;
                let labelWidth = (positioning.defaultArrowheadLine.width === void 0) ? 0 : positioning.defaultArrowheadLine.width;
                let distanceLabelTextComponents = [
                    positioning.defaultArrowheadLineLabel,
                    positioning.customizableArrowheadLineLabel
                ];
                for (let component of distanceLabelTextComponents) {
                    let cWidth = (component.width === void 0) ? 0 : component.width;
                    component.left = labelX + labelWidth / 2 - cWidth / 2;
                }
            }
            return positioning;
        }
        prepareLayersForVizualization() {
            let defaultTunnelLayers = [];
            let customizableTunnelLayers = [];
            for (var i = 0; i < this.data.length; i++) {
                let defaultTunnelLayer = {
                    id: i,
                    start: this.data[i].StartDistance,
                    end: this.data[i].EndDistance,
                    value: Number(this.data[i].Properties[this.coloringPropertyKey]).valueOf(),
                    radius: this.data[i][this.radiusPropertyKey]
                };
                let customizableTunnelLayer = {
                    id: i,
                    start: this.data[i].StartDistance,
                    end: this.data[i].EndDistance,
                    value: Number(this.data[i].Properties[this.customColoringPropertyKey]).valueOf(),
                    radius: this.data[i][this.customRadiusPropertyKey]
                };
                defaultTunnelLayers.push(defaultTunnelLayer);
                customizableTunnelLayers.push(customizableTunnelLayer);
            }
            return {
                defaultTunnelLayers,
                customizableTunnelLayers
            };
        }
        getMaxY(realMaxYValue) {
            let maxY = Math.ceil(realMaxYValue);
            let chunkSize = maxY / this.verticalAxisChunkCount;
            if (maxY - realMaxYValue < chunkSize / 2) {
                maxY += Math.ceil(chunkSize / 2);
            }
            return maxY;
        }
        prepareTunnelObject(minVal, maxVal, center, context, tunnelLayers, isDefaultTunnel) {
            let coloringProperty = ((isDefaultTunnel) ? this.coloringPropertyKey : this.customColoringPropertyKey);
            let colorFunctionSettings = {
                minVal: minVal,
                maxVal: maxVal,
                minColor: this.minColor[coloringProperty],
                maxColor: this.maxColor[coloringProperty],
                minColorMiddle: this.minColorMiddle[coloringProperty],
                maxColorMiddle: this.maxColorMiddle[coloringProperty],
                skipMiddle: (coloringProperty == "NumPositives" || coloringProperty == "NumNegatives")
                    ? true
                    : this.skipMiddle,
                centerPosition: center,
                centerAbsolute: (coloringProperty == "NumPositives" || coloringProperty == "NumNegatives")
                    ? false
                    : !this.useColorMinMax
            };
            let maxY = this.getMaxY((isDefaultTunnel) ? this.maxY : this.customMaxY);
            return {
                tunnel: new LayersVizualizer.Tunnel({
                    x: 0,
                    y: 0
                }, {
                    x: this.maxX,
                    y: maxY
                }, tunnelLayers, context, this.getColor, colorFunctionSettings, !isDefaultTunnel),
                colorFunctionSettings
            };
        }
        renderObjects(renderable) {
            for (let obj of renderable) {
                obj.drawable.drawFromBounds(obj.bounds);
            }
        }
        vizualize(renderHitboxes = true) {
            this.resizeCanvas();
            let canvasWidth = this.getCanvas().width;
            let canvasHeight = this.getCanvas().height;
            let context = this.getContext();
            //console.log(canvasWidth);
            //console.log(canvasHeight);
            let toRender = [];
            //Data was not prepared yet
            if (this.dataDirty) {
                this.prepareData();
            }
            //Prepare layers data
            let layers = this.prepareLayersForVizualization();
            let maxDistance = layers.defaultTunnelLayers[layers.defaultTunnelLayers.length - 1].end;
            maxDistance = CommonUtils.Numbers.roundToDecimal(maxDistance, 1); // round to 1 decimal
            let positioning = this.getComponentsPositioning();
            //Prepare default tunnel object
            let dTminVal = (this.useColorMinMax) ? this.minColoringValue.get(this.coloringPropertyKey) : this.absColorValueMin.get(this.coloringPropertyKey);
            if (dTminVal == void 0) {
                throw Error("Minimal value for property '" + this.coloringPropertyKey + "' was not found!");
            }
            let dTmaxVal = (this.useColorMinMax) ? this.maxColoringValue.get(this.coloringPropertyKey) : this.absColorValueMax.get(this.coloringPropertyKey);
            if (dTmaxVal == void 0) {
                throw Error("Maximal value for property '" + this.coloringPropertyKey + "' was not found!");
            }
            let dTcenter = this.absCenterPositions.get(this.coloringPropertyKey);
            if (dTcenter === void 0) {
                dTcenter = 0;
            }
            let defaultTunnelData = this.prepareTunnelObject(dTminVal, dTmaxVal, dTcenter, context, layers.defaultTunnelLayers, true);
            let defaultTunnelBounds = positioning.defaultTunnel.toBounds(canvasWidth, canvasHeight);
            toRender.push({
                drawable: defaultTunnelData.tunnel,
                bounds: defaultTunnelBounds
            });
            //Prepare customizable tunnel object
            let cTminVal = (this.useColorMinMax) ? this.minColoringValue.get(this.customColoringPropertyKey) : this.absColorValueMin.get(this.customColoringPropertyKey);
            if (cTminVal == void 0) {
                throw Error("Minimal value for property '" + this.customColoringPropertyKey + "' was not found!");
            }
            let cTmaxVal = (this.useColorMinMax) ? this.maxColoringValue.get(this.customColoringPropertyKey) : this.absColorValueMax.get(this.customColoringPropertyKey);
            if (cTmaxVal == void 0) {
                throw Error("Maximal value for property '" + this.customColoringPropertyKey + "' was not found!");
            }
            let cTcenter = this.absCenterPositions.get(this.customColoringPropertyKey);
            if (cTcenter === void 0) {
                cTcenter = 0;
            }
            let customizableTunnelData = this.prepareTunnelObject(cTminVal, cTmaxVal, cTcenter, context, layers.customizableTunnelLayers, false);
            let customizableTunnelBounds = positioning.customizableTunnel.toBounds(canvasWidth, canvasHeight);
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
            //console.log(this.__tunnels);
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
                drawable: new LayersVizualizer.TextBox(`${maxDistance} Å`, context, "big", "left"),
                bounds: positioning.horizontalAxisRightLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Label on top left side of vertical axis for default tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox(`${this.getMaxY(this.maxY)} Å`, context, "medium", "right"),
                bounds: positioning.vAxis1TopLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Label on bottom left side of vertical axis for customizable tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox(`${this.getMaxY(this.customMaxY)} Å`, context, "medium", "right"),
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
                drawable: new LayersVizualizer.TextBox(`${CommonUtils.Numbers.roundToDecimal(dTminVal, 2)}`, context, "small", "left"),
                bounds: positioning.dColorMixerLeftLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Label on top right side of color mixer for default tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox(`${CommonUtils.Numbers.roundToDecimal(dTmaxVal, 2)}`, context, "small", "right"),
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
                drawable: new LayersVizualizer.TextBox(`${CommonUtils.Numbers.roundToDecimal(cTminVal, 2)}`, context, "small", "left"),
                bounds: positioning.cColorMixerLeftLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Label on bottom right side of color mixer for customizable tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox(`${CommonUtils.Numbers.roundToDecimal(cTmaxVal, 2)}`, context, "small", "right"),
                bounds: positioning.cColorMixerRightLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Curly brackets for default tunnel
            toRender.push({
                drawable: new LayersVizualizer.CurlyBrackets(context /*,true*/),
                bounds: positioning.defaultCurlyBrackets.toBounds(canvasWidth, canvasHeight)
            });
            // Curly brackets Label for default tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox(`${MoleOnlineWebUI.StaticData.Bundle.get(this.radiusPropertyKey)}`, context, "small", "left"),
                bounds: positioning.defaultCurlyBracketsLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Curly brackets for customizable tunnel
            toRender.push({
                drawable: new LayersVizualizer.CurlyBrackets(context /*,true*/),
                bounds: positioning.customizableCurlyBrackets.toBounds(canvasWidth, canvasHeight)
            });
            // Curly brackets Label for customizable tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox(`${MoleOnlineWebUI.StaticData.Bundle.get(this.customRadiusPropertyKey)}`, context, "small", "left"),
                bounds: positioning.customizableCurlyBracketsLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Arrowhead line for default tunnel
            toRender.push({
                drawable: new LayersVizualizer.ArrowHeadLine(context, true),
                bounds: positioning.defaultArrowheadLine.toBounds(canvasWidth, canvasHeight)
            });
            // Arrowhead line Label for default tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox(`Distance`, context, "small", "center"),
                bounds: positioning.defaultArrowheadLineLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Arrowhead line for customizable tunnel
            toRender.push({
                drawable: new LayersVizualizer.ArrowHeadLine(context, true),
                bounds: positioning.customizableArrowheadLine.toBounds(canvasWidth, canvasHeight)
            });
            // Arrowhead line Label for customizable tunnel
            toRender.push({
                drawable: new LayersVizualizer.TextBox(`Distance`, context, "small", "center"),
                bounds: positioning.customizableArrowheadLineLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Default color mixer Label
            toRender.push({
                drawable: new LayersVizualizer.TextBox(`${this.coloringPropertyKey}`, context, "small", "center"),
                bounds: positioning.defaultColorMixerLabel.toBounds(canvasWidth, canvasHeight)
            });
            // Customizable color mixer Label
            toRender.push({
                drawable: new LayersVizualizer.TextBox(`${this.customColoringPropertyKey}`, context, "small", "center"),
                bounds: positioning.customizableColorMixerLabel.toBounds(canvasWidth, canvasHeight)
            });
            this.renderObjects(toRender);
            if (this.selectedLayerIdx !== -1) {
                this.selectLayer(this.selectedLayerIdx);
            }
            this.setCurrentColorFunctionSettings("default", defaultTunnelData.colorFunctionSettings);
            this.setCurrentColorFunctionSettings("customizable", customizableTunnelData.colorFunctionSettings);
        }
        switchToMainCanvas() {
            let tmpCanvas = document.getElementById(this.tmpCanvasId);
            if (tmpCanvas !== null) {
                tmpCanvas.remove();
            }
            this.rebindDOMRefs();
            this.vizualize();
            this.highlightHitbox(this.currentLayerIdx);
        }
        switchToTmpCanvas() {
            let canvas = this.getCanvas();
            if (canvas.id === this.tmpCanvasId) {
                throw new Error("Trying to switch to tmp canvas from tmp canvas! Maybe forgotten SwitchToMain(..)?");
            }
            let tmpCanvas = document.createElement("canvas");
            tmpCanvas.style.position = "absolute";
            tmpCanvas.style.top = "-1000px";
            tmpCanvas.id = this.tmpCanvasId;
            tmpCanvas.width = 1882;
            tmpCanvas.height = 474;
            document.body.appendChild(tmpCanvas);
            let oldCtx = this.getContext();
            let tmpCtx = tmpCanvas.getContext("2d");
            if (tmpCtx === null) {
                throw new Error("Unable initiate new 2D canvas context");
            }
            this.__context = tmpCtx;
            this.__canvas = tmpCanvas;
        }
        wrapSVG() {
            var canvas = this.getCanvas();
            var ctx = new C2S(canvas.width, canvas.height);
            if (ctx === null) {
                throw new Error("Unable to initialize new drawing context!");
            }
            this.__context = ctx;
        }
        unwrapSVG() {
            let ctx = this.getCanvas().getContext("2d");
            if (ctx === null) {
                throw new Error("Unable to initialize new drawing context!");
            }
            this.__context = ctx;
        }
        exportImage() {
            if (!this.isDOMBound || this.isDataDirty()) {
                throw new Error("Data not prepared!");
            }
            //Deselekce vrstvy
            let selectedLayer = -1;
            if (this.selectedLayerIdx !== -1) {
                selectedLayer = this.selectedLayerIdx;
                this.deselectLayer();
            }
            this.switchToTmpCanvas();
            this.vizualize();
            let dataURL = this.getCanvas().toDataURL("image/png");
            this.switchToMainCanvas();
            //Opetovne oznaceni vrstvy(stav pred exportem)
            this.selectLayer(selectedLayer);
            return dataURL;
        }
        getSVGDataURL() {
            let svg = this.getSVGData();
            let xmlSerializer = new XMLSerializer();
            let serializedSVG = `<?xml version="1.0" encoding="utf-8"?>${xmlSerializer.serializeToString(svg)}`;
            serializedSVG = utf8.encode(serializedSVG);
            return `data:image/svg+xml;charset=utf-8;base64,${btoa(serializedSVG)}`;
        }
        getSVGData() {
            let ctx = this.getContext();
            ctx.getSerializedSvg();
            let svg = ctx.getSvg();
            svg.charset = "UTF-8";
            return svg;
        }
        exportSVGImage() {
            if (!this.isDOMBound || this.isDataDirty()) {
                throw new Error("Data not prepared!");
            }
            //Deselekce vrstvy
            let selectedLayer = -1;
            if (this.selectedLayerIdx !== -1) {
                selectedLayer = this.selectedLayerIdx;
                this.deselectLayer();
            }
            this.switchToTmpCanvas();
            this.wrapSVG();
            this.vizualize();
            let svg = this.getSVGDataURL();
            this.unwrapSVG();
            this.switchToMainCanvas();
            //Opetovne oznaceni vrstvy(stav pred exportem)
            this.selectLayer(selectedLayer);
            return svg;
        }
        exportPDF() {
            if (!this.isDOMBound || this.isDataDirty()) {
                throw new Error("Data not prepared!");
            }
            //Deselekce vrstvy
            let selectedLayer = -1;
            if (this.selectedLayerIdx !== -1) {
                selectedLayer = this.selectedLayerIdx;
                this.deselectLayer();
            }
            this.switchToTmpCanvas();
            this.wrapSVG();
            let canvas = this.getCanvas();
            if (canvas === void 0 || canvas === null) {
                throw new Error("Canvas element not initiated");
            }
            let width = canvas.width;
            let height = canvas.height;
            this.vizualize();
            let svg = this.getSVGData();
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
            this.selectLayer(selectedLayer);
            return pdf.output('datauristring');
        }
        setCustomColoringPropertyKey(coloringPropertyKey) {
            this.customColoringPropertyKey = coloringPropertyKey;
        }
        getCustomColoringPropertyKey() {
            return this.customColoringPropertyKey;
        }
        setColoringPropertyKey(coloringPropertyKey) {
            this.coloringPropertyKey = coloringPropertyKey;
        }
        getColoringPropertyKey() {
            return this.coloringPropertyKey;
        }
        setCustomRadiusPropertyKey(radiusPropertyKey) {
            if (this.customRadiusPropertyKey !== radiusPropertyKey) {
                this.customRadiusPropertyKey = radiusPropertyKey;
                this.dataDirty = true;
            }
        }
        getCustomRadiusPropertyKey() {
            return this.customRadiusPropertyKey;
        }
        setRadiusPropertyKey(radiusPropertyKey) {
            if (this.radiusPropertyKey !== radiusPropertyKey) {
                this.radiusPropertyKey = radiusPropertyKey;
                this.dataDirty = true;
            }
        }
        getRadiusPropertyKey() {
            return this.radiusPropertyKey;
        }
        getHitboxes() {
            let tunnels = this.getTunnels();
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
        }
        renderHitboxes() {
            //Data was not prepared yet
            if (this.dataDirty) {
                this.prepareData();
            }
            let tunnels = this.getTunnels();
            if (tunnels === null) {
                return [];
            }
            if (tunnels.default !== null) {
                tunnels.default.tunnel.renderHitboxes();
            }
            if (tunnels.customizable !== null) {
                tunnels.customizable.tunnel.renderHitboxes();
            }
        }
        highlightHitbox(layerIdx) {
            if (layerIdx < 0) {
                return;
            }
            this.currentLayerIdx = layerIdx;
            let tunnels = this.getTunnels();
            if (tunnels === null) {
                return;
            }
            if (tunnels.default !== null) {
                tunnels.default.tunnel.highlightHitbox(layerIdx);
            }
            if (tunnels.customizable !== null) {
                tunnels.customizable.tunnel.highlightHitbox(layerIdx);
            }
        }
        /** Helpers **/
        getColor(value, settings) {
            let minVal = settings.minVal;
            let maxVal = settings.maxVal;
            let minColor = settings.minColor;
            let maxColor = settings.maxColor;
            let minColorMiddle = settings.minColorMiddle;
            let maxColorMiddle = settings.maxColorMiddle;
            let skipMiddle = settings.skipMiddle;
            let middle = (settings.centerAbsolute) ? settings.centerPosition : (minVal + maxVal) / 2;
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
        }
    }
    LayersVizualizer.Vizualizer = Vizualizer;
    ;
})(LayersVizualizer || (LayersVizualizer = {}));
var LayersVizualizer;
(function (LayersVizualizer) {
    var Component;
    (function (Component) {
        class Positionable {
            toBounds(width, height) {
                let xUnit = width / 100;
                let yUnit = height / 100;
                let x = 0;
                let y = 0;
                let w = 100;
                let h = 100;
                let ml = 0;
                let mr = 0;
                let mt = 0;
                let mb = 0;
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
            }
        }
        Component.Positionable = Positionable;
        ;
        class Paintable extends Positionable {
        }
        Component.Paintable = Paintable;
        ;
        class Axis extends Positionable {
        }
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
            let c = (rgb.r + rgb.g + rgb.b) / 3;
            let v = c > 0.5 * 255 ? c - 255 / 2 : c + 255 / 2;
            return { r: v, g: v, b: v };
        }
        Colors.invertRGBContrastGrayscale = invertRGBContrastGrayscale;
        function invertRGBColor(rgb) {
            return hexToRGB(invertHexColor(rgbToHex(rgb)));
        }
        Colors.invertRGBColor = invertRGBColor;
        function invertHexColor(hexTripletColor) {
            hexTripletColor = hexTripletColor.substring(1); // remove #
            let color = parseInt(hexTripletColor, 16); // convert to integer
            color = 0xFFFFFF ^ color; // invert three bytes
            let strColor = color.toString(16); // convert to hex
            strColor = ("000000" + strColor).slice(-6); // pad with leading zeros
            strColor = "#" + strColor; // prepend #
            return strColor;
        }
        Colors.invertHexColor = invertHexColor;
        function rgbComplement(rgb) {
            let temprgb = rgb;
            let temphsv = RGB2HSV(temprgb);
            temphsv.hue = HueShift(temphsv.hue, 180.0);
            temprgb = HSV2RGB(temphsv);
            return temprgb;
        }
        Colors.rgbComplement = rgbComplement;
        function hexToRGB(hex) {
            if (hex[0] !== "#") {
                throw new Error("Hex color has bad format!");
            }
            let rgbPart = hex.split("#")[1];
            if (rgbPart.length !== 6) {
                throw new Error("Hex color has bad format!");
            }
            let rHex = rgbPart.slice(0, 2);
            let gHex = rgbPart.slice(2, 4);
            let bHex = rgbPart.slice(4, 6);
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
            let rgbParts = [];
            for (let part of ((rgbString.split('(')[1]).split(")")[0]).split(",")) {
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
            let rHex = Math.ceil(rgb.r).toString(16);
            let gHex = Math.ceil(rgb.g).toString(16);
            let bHex = Math.ceil(rgb.b).toString(16);
            return `#${((rHex.length == 1) ? "0" : "") + rHex}${((gHex.length == 1) ? "0" : "") + gHex}${((bHex.length == 1) ? "0" : "") + bHex}`;
        }
        Colors.rgbToHex = rgbToHex;
        function hexComplement(hex) {
            return rgbToHex(rgbComplement(hexToRGB(hex)));
        }
        Colors.hexComplement = hexComplement;
        ;
        function RGB2HSV(rgb) {
            let hsv = new Object();
            let max = max3(rgb.r, rgb.g, rgb.b);
            let dif = max - min3(rgb.r, rgb.g, rgb.b);
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
                let i = Math.floor(hsv.hue);
                let f = hsv.hue - i;
                let p = hsv.value * (1 - hsv.saturation);
                let q = hsv.value * (1 - hsv.saturation * f);
                let t = hsv.value * (1 - hsv.saturation * (1 - f));
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
        class Instances {
            static setPlugin(plugin) {
                this.plugin = plugin;
            }
            static getPlugin() {
                return this.plugin;
            }
            static setLayersVizualizer(instance) {
                this.layerVizualizer = instance;
            }
            static getLayersVizualizer() {
                return this.layerVizualizer;
            }
        }
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
        })(HandlerTypes || (HandlerTypes = {}));
        ;
        class Events {
            static subscribeChannelSelect(handler) {
                let hndlrs = this.handlers.get(HandlerTypes.ChannelSelectType);
                if (hndlrs === void 0) {
                    hndlrs = [];
                }
                hndlrs.push(handler);
                this.handlers.set(HandlerTypes.ChannelSelectType, hndlrs);
            }
            static invokeChannelSelect(channelId) {
                let hndlrs = this.handlers.get(HandlerTypes.ChannelSelectType);
                if (hndlrs === void 0) {
                    return;
                }
                for (let h of hndlrs) {
                    h(channelId);
                }
            }
            static subscribeNewSubmit(h) {
                let list = this.handlers.get(HandlerTypes.NewSubmitType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.NewSubmitType, list);
            }
            static invokeNewSubmit() {
                let hndlrs = this.handlers.get(HandlerTypes.NewSubmitType);
                if (hndlrs !== void 0) {
                    for (let h of hndlrs) {
                        h();
                    }
                }
            }
            static subscribeChangeSubmitId(h) {
                let list = this.handlers.get(HandlerTypes.ChangeSubmitIdType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.ChangeSubmitIdType, list);
            }
            static invokeChangeSubmitId(submitId) {
                let hndlrs = this.handlers.get(HandlerTypes.ChangeSubmitIdType);
                if (hndlrs !== void 0) {
                    for (let h of hndlrs) {
                        h(submitId);
                    }
                }
            }
            static subscribeChangeHasKillable(h) {
                let list = this.handlers.get(HandlerTypes.ChangeHasKillableType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.ChangeHasKillableType, list);
            }
            static invokeChangeHasKillable(hasKillable) {
                let hndlrs = this.handlers.get(HandlerTypes.ChangeHasKillableType);
                if (hndlrs !== void 0) {
                    for (let h of hndlrs) {
                        h(hasKillable);
                    }
                }
            }
            static subscribeNotifyMessage(h) {
                let list = this.handlers.get(HandlerTypes.NotifyMessageType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.NotifyMessageType, list);
            }
            static invokeNotifyMessage(e) {
                let hndlrs = this.handlers.get(HandlerTypes.NotifyMessageType);
                if (hndlrs !== void 0) {
                    for (let h of hndlrs) {
                        h(e);
                    }
                }
            }
            static subscribeChannelDataLoaded(h) {
                let list = this.handlers.get(HandlerTypes.ChannelDataLoadedType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.ChannelDataLoadedType, list);
            }
            static invokeChannelDataLoaded(data) {
                let hndlrs = this.handlers.get(HandlerTypes.ChannelDataLoadedType);
                if (hndlrs !== void 0) {
                    for (let h of hndlrs) {
                        h(data);
                    }
                }
            }
            static subscribeProteinDataLoaded(h) {
                let list = this.handlers.get(HandlerTypes.ProteinDataLoadedType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.ProteinDataLoadedType, list);
            }
            static invokeProteinDataLoaded(data) {
                let hndlrs = this.handlers.get(HandlerTypes.ProteinDataLoadedType);
                if (hndlrs !== void 0) {
                    for (let h of hndlrs) {
                        h(data);
                    }
                }
            }
            static subscribeToggleLoadingScreen(h) {
                let list = this.handlers.get(HandlerTypes.ToggleLoadingScreenType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.ToggleLoadingScreenType, list);
            }
            static invokeToggleLoadingScreen(params) {
                let hndlrs = this.handlers.get(HandlerTypes.ToggleLoadingScreenType);
                if (hndlrs !== void 0) {
                    for (let h of hndlrs) {
                        h(params);
                    }
                }
            }
            static subscribeRunGeneratePDFReport(h) {
                let list = this.handlers.get(HandlerTypes.RunPDFReportType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.RunPDFReportType, list);
            }
            static invokeRunPDFReport() {
                let hndlrs = this.handlers.get(HandlerTypes.RunPDFReportType);
                if (hndlrs !== void 0) {
                    for (let h of hndlrs) {
                        h();
                    }
                }
            }
            static subscribeCopyParameters(h) {
                let list = this.handlers.get(HandlerTypes.CopyParametersType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.CopyParametersType, list);
            }
            static invokeCopyParameters(params) {
                let hndlrs = this.handlers.get(HandlerTypes.CopyParametersType);
                if (hndlrs !== void 0) {
                    for (let h of hndlrs) {
                        h(params);
                    }
                }
            }
            static subscribeOnReSubmit(h) {
                let list = this.handlers.get(HandlerTypes.OnReSubmitType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.OnReSubmitType, list);
            }
            static invokeOnReSubmit(promise) {
                let hndlrs = this.handlers.get(HandlerTypes.OnReSubmitType);
                if (hndlrs !== void 0) {
                    for (let h of hndlrs) {
                        h(promise);
                    }
                }
            }
            static subscribeOnSequneceViewerToggle(h) {
                let list = this.handlers.get(HandlerTypes.OnSequneceViewerToggleType);
                if (list === void 0) {
                    list = [];
                }
                list.push(h);
                this.handlers.set(HandlerTypes.OnSequneceViewerToggleType, list);
            }
            static invokeOnSequneceViewerToggle(params) {
                let hndlrs = this.handlers.get(HandlerTypes.OnSequneceViewerToggleType);
                if (hndlrs !== void 0) {
                    for (let h of hndlrs) {
                        h(params);
                    }
                }
            }
        }
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
        class App extends React.Component {
            constructor() {
                super(...arguments);
                this.state = { message: "", visible: false };
            }
            componentDidMount() {
                MoleOnlineWebUI.Bridge.Events.subscribeToggleLoadingScreen(params => {
                    let s = this.state;
                    s.message = params.message;
                    s.visible = params.visible;
                    this.setState(s);
                });
            }
            componentWillUnmount() {
            }
            render() {
                return React.createElement("div", { className: `loading-screen ${(this.state.visible) ? 'visible' : ''}` },
                    React.createElement("img", { src: "images/ajax-loader.gif" }),
                    React.createElement("div", { className: "message" }, this.state.message));
            }
        }
        UI.App = App;
    })(UI = LoadingScreen.UI || (LoadingScreen.UI = {}));
})(LoadingScreen || (LoadingScreen = {}));
var AlertMessages;
(function (AlertMessages) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        let MAX_TICK = 5;
        let QUEUE_MAX_LENGTH = 5;
        function render(target) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, null), target);
        }
        UI.render = render;
        ;
        class App extends React.Component {
            constructor() {
                super(...arguments);
                this.waitingMessages = [];
                this.queue = [];
            }
            enqueue(m) {
                let pkg = {
                    message: m,
                    tick: MAX_TICK
                };
                this.queue.push(pkg);
            }
            dequeue() {
                let head = this.queue[0];
                if (head === void 0) {
                    return;
                }
                head.tick--;
                if (head.tick < 0) {
                    this.queue.shift();
                }
            }
            tick() {
                this.dequeue();
                if (this.queue.length >= QUEUE_MAX_LENGTH) {
                    return;
                }
                let m = this.waitingMessages.shift();
                if (m !== void 0) {
                    this.enqueue(m);
                }
                this.forceUpdate();
            }
            fastDequeue(m) {
                this.queue.splice(this.queue.indexOf(m), 1);
                this.forceUpdate();
            }
            componentDidMount() {
                MoleOnlineWebUI.Bridge.Events.subscribeNotifyMessage((m) => {
                    this.waitingMessages.push(m);
                });
                let watcher = () => {
                    this.tick();
                    window.setTimeout(watcher, 1000);
                };
                watcher.bind(this)();
            }
            componentWillUnmount() {
            }
            render() {
                let messages = [];
                for (let m of this.queue) {
                    messages.push(React.createElement(Message, { message: m, app: this }));
                }
                let active = (this.queue.length > 0) ? " active" : "";
                return (React.createElement("div", { className: `alert-messages-container${active}` }, messages));
            }
        }
        UI.App = App;
        class Message extends React.Component {
            getClassByType(type) {
                return `alert-${type.toLowerCase()}`;
            }
            render() {
                return React.createElement("div", { className: `alert ${this.getClassByType(this.props.message.message.messageType)}`, onClick: (e) => {
                        this.props.app.fastDequeue(this.props.message);
                    } }, this.props.message.message.message);
            }
        }
    })(UI = AlertMessages.UI || (AlertMessages.UI = {}));
})(AlertMessages || (AlertMessages = {}));
var Common;
(function (Common) {
    var Controls;
    (function (Controls) {
        var React = LiteMol.Plugin.React;
        class SimpleComboBox extends React.Component {
            render() {
                let classNames = "";
                if (this.props.className !== void 0) {
                    classNames = this.props.className;
                }
                let selectedIdx = 0;
                if (this.props.defaultSelectedIndex !== void 0) {
                    selectedIdx = this.props.defaultSelectedIndex;
                }
                let items = [];
                let idx = 0;
                for (let item of this.props.items) {
                    items.push(React.createElement("option", { value: item.value, selected: (idx === selectedIdx) }, item.label));
                    idx++;
                }
                return (React.createElement("select", { id: this.props.id, className: classNames, onChange: this.props.onSelectedChange }, items));
            }
        }
        Controls.SimpleComboBox = SimpleComboBox;
    })(Controls = Common.Controls || (Common.Controls = {}));
})(Common || (Common = {}));
var Datagrid;
(function (Datagrid) {
    var Components;
    (function (Components) {
        var React = LiteMol.Plugin.React;
        class DGRowEmpty extends React.Component {
            render() {
                return (React.createElement("tr", null,
                    React.createElement("td", { colSpan: this.props.columnsCount })));
            }
        }
        Components.DGRowEmpty = DGRowEmpty;
        function getTitle(title, columnCount) {
            let tit = [];
            let sIdx = 0;
            if (title !== void 0) {
                tit = title;
                sIdx = title.length - 1;
            }
            for (; sIdx < columnCount; sIdx++) {
                tit.push("");
            }
            return tit;
        }
        class DGRow extends React.Component {
            addTd(tds, i, columns, columnsCount, forceHtml) {
                let html = { __html: columns[i] };
                let tdClass = "";
                if (this.props.tdClass !== void 0) {
                    tdClass = this.props.tdClass;
                }
                let title = getTitle(this.props.title, columnsCount);
                if (forceHtml) {
                    tds.push(React.createElement("td", { title: title[i], className: `col col-${i + 1} ${tdClass}`, dangerouslySetInnerHTML: html }));
                }
                else {
                    tds.push(React.createElement("td", { title: title[i], className: `col col-${i + 1}` }, columns[i]));
                }
            }
            addTdWithColspan(tds, i, columns, columnsCount, forceHtml) {
                let html = { __html: columns[i] };
                let tdClass = "";
                if (this.props.tdClass !== void 0) {
                    tdClass = this.props.tdClass;
                }
                let title = getTitle(this.props.title, columnsCount);
                let colSpan = 1 + (columnsCount - columns.length);
                if (forceHtml) {
                    tds.push(React.createElement("td", { title: title[i], className: `col col-${i + 1} ${tdClass}`, colSpan: colSpan, dangerouslySetInnerHTML: html }));
                }
                else {
                    tds.push(React.createElement("td", { title: title[i], className: `col col-${i + 1} ${tdClass}`, colSpan: colSpan }, columns[i]));
                }
            }
            generateRow(columns) {
                let columnsCount = columns.length;
                if (this.props.columnsCount !== void 0) {
                    columnsCount = this.props.columnsCount;
                }
                let forceHTML = false;
                if (this.props.forceHtml !== void 0) {
                    forceHTML = this.props.forceHtml;
                }
                let tds = [];
                for (let i = 0; i < columns.length; i++) {
                    if (i === columns.length - 1 && columns.length !== columnsCount) {
                        this.addTdWithColspan(tds, i, columns, columnsCount, forceHTML);
                        break;
                    }
                    this.addTd(tds, i, columns, columnsCount, forceHTML);
                }
                return tds;
            }
            render() {
                let trClass = "";
                if (this.props.trClass !== void 0) {
                    trClass = this.props.trClass;
                }
                return (React.createElement("tr", { className: trClass }, this.generateRow(this.props.columns)));
            }
        }
        Components.DGRow = DGRow;
        class DGElementRow extends React.Component {
            generateRow(columns) {
                let tdClass = "";
                if (this.props.tdClass !== void 0) {
                    tdClass = this.props.tdClass;
                }
                let columnsCount = columns.length;
                if (this.props.columnsCount !== void 0) {
                    columnsCount = this.props.columnsCount;
                }
                let colSpan = 1 + (columnsCount - columns.length);
                let title = getTitle(this.props.title, columnsCount);
                let tds = [];
                for (let i = 0; i < columns.length; i++) {
                    if (i === columns.length - 1 && columns.length !== columnsCount) {
                        tds.push(React.createElement("td", { title: title[i], className: `col col-${i + 1} ${tdClass}`, colSpan: colSpan }, columns[i]));
                        break;
                    }
                    tds.push(React.createElement("td", { title: title[i], className: `col col-${i + 1} ${tdClass}` }, columns[i]));
                }
                return tds;
            }
            render() {
                let trClass = "";
                if (this.props.trClass !== void 0) {
                    trClass = this.props.trClass;
                }
                return (React.createElement("tr", { className: trClass }, this.generateRow(this.props.columns)));
            }
        }
        Components.DGElementRow = DGElementRow;
        class DGTdWithHtml extends React.Component {
            render() {
                return (React.createElement("td", { className: `col col-${this.props.colIdx}`, dangerouslySetInnerHTML: { __html: this.props.contents } }));
            }
        }
        Components.DGTdWithHtml = DGTdWithHtml;
        class DGNoDataInfoRow extends React.Component {
            render() {
                let infoText = "There are no data to be displayed...";
                if (this.props.infoText !== void 0) {
                    infoText = this.props.infoText;
                }
                return (React.createElement("tr", null,
                    React.createElement("td", { colSpan: this.props.columnsCount }, infoText)));
            }
        }
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
            class LMControlWrapper extends React.Component {
                render() {
                    return React.createElement("div", { className: "litemol-controls-wrapper" },
                        React.createElement("div", { className: "lm-plugin" }, this.props.controls));
                }
            }
            FromLiteMol.LMControlWrapper = LMControlWrapper;
            class ValidationState {
                static getState(validationGroup) {
                    let state = this.validationStates.get(validationGroup);
                    if (state === void 0) {
                        return "VALID";
                    }
                    return state;
                }
                static setState(validationGroup, state) {
                    let oldState = this.getState(validationGroup);
                    this.validationStates.set(validationGroup, state);
                    this.invokeOnStateChangeHandlers(validationGroup, oldState, state);
                }
                static attachOnStateChangeHandler(validationGroup, handler) {
                    let groupHandlers = this.stateChangeHandlers.get(validationGroup);
                    if (groupHandlers === void 0) {
                        groupHandlers = [];
                    }
                    groupHandlers.push(handler);
                    this.stateChangeHandlers.set(validationGroup, groupHandlers);
                }
                static invokeOnStateChangeHandlers(validationGroup, oldState, newState) {
                    let groupHandlers = this.stateChangeHandlers.get(validationGroup);
                    if (groupHandlers === void 0) {
                        return;
                    }
                    for (let h of groupHandlers) {
                        h(oldState, newState);
                    }
                }
                static reset(validationGroup) {
                    let oldState = this.getState(validationGroup);
                    this.validationStates.delete(validationGroup);
                    this.invokeOnStateChangeHandlers(validationGroup, oldState, this.getState(validationGroup));
                }
            }
            ValidationState.validationStates = new Map();
            ValidationState.stateChangeHandlers = new Map();
            FromLiteMol.ValidationState = ValidationState;
            ;
            class TextBox extends React.Component {
                constructor() {
                    super(...arguments);
                    this.state = { control: this.createControl(), value: this.props.defaultValue };
                }
                componentDidMount() {
                    if (this.props.onMount) {
                        this.props.onMount(this);
                    }
                }
                reset() {
                    this.setState({
                        value: this.props.defaultValue,
                        control: React.createElement("div", null)
                    });
                    this.setState({
                        value: this.props.defaultValue,
                        control: this.createControl()
                    });
                }
                createControl(props) {
                    if (props === void 0) {
                        props = this.props;
                    }
                    return LMControls.TextBox({
                        defaultValue: props.defaultValue,
                        placeholder: props.placeholder,
                        onBlur: (e) => {
                            TextBoxOnBlur(e, this.props.validate, this.props.validationGroup);
                            e.preventDefault();
                        },
                        onChange: (v) => {
                            let s = this.state;
                            s.value = v;
                            this.setState(s);
                            if (this.props.onChange !== void 0) {
                                this.props.onChange(v);
                            }
                            if (this.props.validationGroup !== void 0) {
                                ValidationState.reset(this.props.validationGroup);
                            }
                        },
                        onKeyPress: (e) => {
                        }
                    });
                }
                render() {
                    return React.createElement("div", { className: 'lm-control-row lm-options-group', title: this.props.tooltip },
                        React.createElement("span", null, this.props.label),
                        React.createElement("div", null, this.state.control));
                }
            }
            FromLiteMol.TextBox = TextBox;
            function TextBoxOnBlur(e, validateFn, validationGroup) {
                let element = e.currentTarget;
                if (validateFn !== void 0 && validationGroup !== void 0) {
                    let prevState = ValidationState.getState(validationGroup);
                    validateFn(element.value).then((validationResult) => {
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
            class TextBoxWithHelp extends React.Component {
                constructor() {
                    super(...arguments);
                    this.state = { control: this.createControl(), value: this.props.defaultValue };
                }
                componentDidMount() {
                    if (this.props.onMount) {
                        this.props.onMount(this);
                    }
                }
                reset() {
                    this.setState({
                        value: this.props.defaultValue,
                        control: React.createElement("div", null)
                    });
                    this.setState({
                        value: this.props.defaultValue,
                        control: this.createControl()
                    });
                }
                createControl(props) {
                    if (props === void 0) {
                        props = this.props;
                    }
                    return LMControls.TextBox({
                        defaultValue: props.defaultValue,
                        placeholder: props.placeholder,
                        onBlur: (e) => {
                            TextBoxOnBlur(e, this.props.validate, this.props.validationGroup);
                            e.preventDefault();
                        },
                        onChange: (v) => {
                            let s = this.state;
                            s.value = v;
                            this.setState(s);
                            if (this.props.onChange !== void 0) {
                                this.props.onChange(v);
                            }
                            if (this.props.validationGroup !== void 0) {
                                ValidationState.reset(this.props.validationGroup);
                            }
                        },
                        onKeyPress: (e) => {
                        }
                    });
                }
                render() {
                    return React.createElement("div", { className: 'lm-control-row lm-options-group', title: this.props.tooltip },
                        React.createElement("span", null,
                            this.props.label,
                            " ",
                            React.createElement("a", { className: "hint", href: this.props.hint.link, target: "_blank", title: this.props.hint.title },
                                React.createElement("span", { className: "glyphicon glyphicon-info-sign" }))),
                        React.createElement("div", null, this.state.control));
                }
            }
            FromLiteMol.TextBoxWithHelp = TextBoxWithHelp;
            ;
            class NumberBox extends React.Component {
                constructor() {
                    super(...arguments);
                    this.state = { value: this.props.defaultValue };
                }
                componentDidMount() {
                    if (this.props.onMount) {
                        this.props.onMount(this);
                    }
                }
                reset() {
                    this.setState({
                        value: this.props.defaultValue,
                    });
                }
                render() {
                    return React.createElement(LMControls.Slider, { label: this.props.label, min: this.props.min, max: this.props.max, step: this.props.step, value: this.state.value, title: this.props.tooltip, onChange: (v) => {
                            let s = this.state;
                            s.value = v;
                            this.setState(s);
                            if (this.props.onChange !== void 0) {
                                this.props.onChange(String(v));
                            }
                        } });
                }
            }
            FromLiteMol.NumberBox = NumberBox;
            ;
            class CheckBox extends React.Component {
                constructor() {
                    super(...arguments);
                    this.state = { checked: this.props.defaultValue, control: this.createControl() };
                }
                componentDidMount() {
                    if (this.props.onMount) {
                        this.props.onMount(this);
                    }
                }
                reset() {
                    this.setState({
                        checked: this.props.defaultValue,
                        control: this.createControl()
                    });
                }
                createControl(currentValue) {
                    return LMControls.Toggle({
                        label: this.props.label,
                        title: this.props.tooltip,
                        onChange: (v) => {
                            let s = this.state;
                            s.checked = v;
                            s.control = this.createControl(v);
                            this.setState(s);
                            if (this.props.onChange !== void 0) {
                                this.props.onChange(v);
                            }
                        },
                        value: (currentValue !== void 0) ? currentValue : this.props.defaultValue
                    });
                }
                render() {
                    return this.state.control;
                }
            }
            FromLiteMol.CheckBox = CheckBox;
            class ComboBoxItem {
                constructor(value, label) {
                    this.value = value;
                    this.label = label;
                }
                getValue() {
                    return this.value;
                }
                getLabel() {
                    return this.label;
                }
                equals(obj) {
                    return this.label === obj.label && this.value === this.value;
                }
            }
            FromLiteMol.ComboBoxItem = ComboBoxItem;
            ;
            ;
            class ComboBox extends React.Component {
                constructor() {
                    super(...arguments);
                    this.state = {
                        value: this.props.selectedValue
                    };
                }
                componentDidMount() {
                    if (this.props.onMount) {
                        this.props.onMount(this);
                    }
                }
                componentWillReceiveProps(nextProps) {
                    if (nextProps.selectedValue !== this.props.selectedValue) {
                        let s = this.state;
                        s.value = nextProps.selectedValue;
                        this.setState(s);
                    }
                }
                reset() {
                    this.setState({
                        value: this.props.selectedValue,
                    });
                }
                getSelectedItemByValue(value) {
                    for (let item of this.props.items) {
                        if (item.getValue() === value) {
                            return item;
                        }
                    }
                    return this.props.items[0];
                }
                render() {
                    let currentElement = this.getSelectedItemByValue(this.state.value);
                    return React.createElement("div", { className: 'lm-control-row lm-options-group', title: this.props.tooltip },
                        React.createElement("span", null, this.props.label),
                        React.createElement("div", null,
                            React.createElement(LMControls.OptionsBox, { caption: (o) => { return o.getLabel(); }, current: currentElement, options: this.props.items, onChange: ((o) => {
                                    if (this.props.onChange) {
                                        this.props.onChange(o.getValue());
                                    }
                                    let s = this.state;
                                    s.value = o.getValue();
                                    this.setState(s);
                                }).bind(this) })));
                }
            }
            FromLiteMol.ComboBox = ComboBox;
            ;
            class ControlGroup extends React.Component {
                constructor() {
                    super(...arguments);
                    this.state = { panel: this.createPanel((this.props.expanded) ? this.props.expanded : false), expanded: (this.props.expanded) ? this.props.expanded : false };
                }
                createPanel(expanded) {
                    return new LMControls.Panel({
                        header: this.props.label,
                        title: this.props.tooltip,
                        isExpanded: expanded,
                        onExpand: this.onPanelExpand.bind(this),
                        //description:"description",
                        children: this.props.controls
                    });
                }
                componentWillReceiveProps(nextProps) {
                    if (nextProps.expanded !== void 0 && nextProps.expanded !== this.state.expanded) {
                        this.onPanelExpand(nextProps.expanded, true);
                    }
                }
                onPanelExpand(e, supressOnChangeInvoke) {
                    let s = this.state;
                    s.expanded = e;
                    s.panel = this.createPanel(e);
                    this.setState(s);
                    if (!supressOnChangeInvoke && this.props.onChange !== void 0) {
                        this.props.onChange(e);
                    }
                }
                render() {
                    return this.state.panel.render();
                }
            }
            FromLiteMol.ControlGroup = ControlGroup;
            FromLiteMol.StartingPointTypes = ["CSA", "Residue List", "3D Point", "Cofactor", "Current Selection", "PatternQuery"];
            class Point {
                constructor(x, y, z) {
                    this.x = x;
                    this.y = y;
                    this.z = z;
                }
                toString() {
                    return `[${this.x}, ${this.y}, ${this.z}]`;
                }
            }
            FromLiteMol.Point = Point;
            class Residue {
                constructor(seqId, chain) {
                    this.seqId = seqId;
                    this.chain = chain;
                }
                toString() {
                    return `${this.chain}, ${this.seqId}`;
                }
            }
            FromLiteMol.Residue = Residue;
            class StartingPointBox extends React.Component {
                constructor() {
                    super(...arguments);
                    this.state = { items: this.props.defaultItems, mode: (this.props.defaultMode) ? this.props.defaultMode : "Current Selection" };
                }
                componentDidMount() {
                    if (this.props.onMount) {
                        this.props.onMount(this);
                    }
                    CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                        if (formGroup === this.props.formGroup || (this.props.extraClearGroup !== void 0 && formGroup === this.props.extraClearGroup)) {
                            this.reset();
                        }
                    });
                }
                componentWillReceiveProps(nextProps) {
                    if (this.props.defaultItems !== nextProps.defaultItems || this.props.defaultMode !== nextProps.defaultMode) {
                        this.reset();
                    }
                }
                reset() {
                    let newMode = (this.props.defaultMode) ? this.props.defaultMode : "Current Selection";
                    this.setState({
                        items: [],
                        mode: newMode
                    });
                }
                getPointValueAsString(point) {
                    if (point.type === "Point") {
                        return point.value.toString();
                    }
                    else if (point.type === "Residue") {
                        return point.value.map((val, idx, arr) => { return val.toString(); }).reduce((prev, cur, idx, arr) => { return prev += (idx === 0) ? '' : ',' + cur; });
                    }
                    else {
                        return point.value;
                    }
                }
                addNewPointUnique(newPoint, target) {
                    for (let t of target) {
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
                }
                onChange(newPoints) {
                    let s = this.state;
                    let unique = s.items.slice();
                    for (let p of newPoints) {
                        unique = this.addNewPointUnique(p, unique);
                    }
                    s.items = unique;
                    this.setState(s);
                    if (this.props.onChange !== void 0) {
                        this.props.onChange(unique.slice());
                    }
                }
                remove(item) {
                    let newItems = [];
                    for (let i of this.state.items) {
                        if (i.type === item.type && i.uiType === item.uiType && this.getPointValueAsString(i) === this.getPointValueAsString(item)) {
                            continue;
                        }
                        newItems.push(i);
                    }
                    let s = this.state;
                    s.items = newItems;
                    this.setState(s);
                    if (this.props.onChange !== void 0) {
                        this.props.onChange(newItems.slice());
                    }
                }
                render() {
                    let comboItems = [];
                    for (let i of FromLiteMol.StartingPointTypes) {
                        if (!this.props.allowPatternQuery && (i === "Cofactor" || i == "PatternQuery")) {
                            continue;
                        }
                        comboItems.push(new ComboBoxItem(i, i));
                    }
                    let control;
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
                        React.createElement(ComboBox, { items: comboItems, label: this.props.label, selectedValue: this.state.mode, tooltip: this.props.tooltip, onChange: ((v) => {
                                let s = this.state;
                                s.mode = v;
                                this.setState(s);
                            }).bind(this) }),
                        control,
                        React.createElement(StartingPointResultsBox, { items: this.state.items, onRemove: this.remove.bind(this), noDataText: this.props.noDataText }));
                }
            }
            FromLiteMol.StartingPointBox = StartingPointBox;
            class StartingPointResultsBox extends React.Component {
                //state:StartingPointResultsBoxState = {items:this.props.items}
                generateUIItem(p) {
                    let content = "";
                    switch (p.type) {
                        case "Residue":
                            let rp = p;
                            content = CommonUtils.Misc.flattenResidues(rp.value.map((v, i, a) => {
                                return {
                                    SequenceNumber: v.seqId,
                                    Chain: v.chain
                                };
                            }));
                            break;
                        case "Point":
                            let pp = p;
                            content = CommonUtils.Misc.flattenPoints([pp.value]);
                            break;
                        case "Query":
                            let qp = p;
                            content = `${(qp.residue !== "") ? qp.residue + ': ' : ''}${qp.value}`;
                            break;
                        default:
                            content = "Unknown type!!!";
                    }
                    let contentMaxLength = 20;
                    let miniContent = content.substr(0, contentMaxLength) + "...";
                    return React.createElement("span", { title: content }, (content.length > contentMaxLength) ? miniContent : content);
                }
                removeItem(item) {
                    this.props.onRemove(item);
                }
                render() {
                    let rows = [];
                    for (let i of this.props.items) {
                        let boxClass = `starting-point-${i.uiType.replace(/\s/g, "-")}`;
                        rows.push(React.createElement("div", { className: "lm-control-row" },
                            React.createElement("span", { className: boxClass }, i.uiType),
                            React.createElement("div", null,
                                React.createElement(LMControls.Button, { onClick: (e) => {
                                        this.removeItem(i);
                                    }, children: [this.generateUIItem(i), React.createElement("span", { className: "glyphicon glyphicon-remove" })] }))));
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
                }
            }
            FromLiteMol.StartingPointResultsBox = StartingPointResultsBox;
            class StartingPointCurrentSelectionBox extends React.Component {
                render() {
                    let button = LMControls.CommitButton({
                        action: () => {
                            if (CommonUtils.Selection.SelectionHelper.isSelectedAny() && !CommonUtils.Selection.SelectionHelper.isSelectedAnyChannel()) {
                                if (this.props.onChange === void 0) {
                                    return;
                                }
                                let selectedResidues = CommonUtils.Selection.SelectionHelper.getSelectedResidues();
                                let selectedPoints = CommonUtils.Selection.SelectionHelper.getSelectedPoints();
                                if (selectedResidues.length > 0) {
                                    let newPointData = [];
                                    for (let r of selectedResidues) {
                                        newPointData.push(new Residue(r.info.authSeqNumber, r.info.chain.authAsymId));
                                    }
                                    this.props.onChange([{
                                            type: "Residue",
                                            uiType: "Residue List",
                                            value: newPointData
                                        }]);
                                }
                                else {
                                    let newPoints = [];
                                    for (let p of selectedPoints) {
                                        newPoints.push({
                                            type: "Point",
                                            uiType: "3D Point",
                                            value: new Point(p.x, p.y, p.z)
                                        });
                                    }
                                    this.props.onChange(newPoints);
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
                }
            }
            FromLiteMol.StartingPointCurrentSelectionBox = StartingPointCurrentSelectionBox;
            class StartingPointCofactorBox extends React.Component {
                constructor() {
                    super(...arguments);
                    this.state = { cofactors: null, isLoading: true, selected: null };
                }
                componentDidMount() {
                    MoleOnlineWebUI.DataProxy.Cofactors.DataProvider.get((cofactors) => {
                        let selected = null;
                        if (cofactors.size > 0) {
                            selected = cofactors.keys().next().value;
                        }
                        this.setState({ isLoading: false, cofactors, selected });
                    });
                }
                generateItems(cofactors) {
                    let items = [];
                    cofactors.forEach((value, key, map) => {
                        if (!CommonUtils.Residues.currentContextHasResidue(key) || this.state.selected === value) {
                            return;
                        }
                        items.push(new ComboBoxItem(value, key));
                    });
                    return items;
                }
                getNoDataMessage() {
                    let text = (this.state.isLoading) ? "Loading..." : "No cofactor starting points available";
                    return React.createElement("div", { className: "starting-point-control-container" },
                        React.createElement("div", { className: "lm-control-row lm-options-group" },
                            React.createElement("span", null),
                            React.createElement("div", { className: "info", title: text }, text)));
                }
                render() {
                    if (this.state.isLoading || this.state.cofactors === null) {
                        return this.getNoDataMessage();
                    }
                    let comboItems = this.generateItems(this.state.cofactors);
                    if (comboItems.length === 0) {
                        return this.getNoDataMessage();
                    }
                    let combo = React.createElement(ComboBox, { items: comboItems, label: this.props.label, selectedValue: comboItems[0].getValue(), tooltip: this.props.tooltip, onChange: ((v) => {
                            let s = this.state;
                            s.selected = v;
                            this.setState(s);
                        }).bind(this) });
                    let button = LMControls.CommitButton({
                        action: () => {
                            if (this.props.onChange !== void 0 && this.state.cofactors !== null && this.state.selected !== null) {
                                this.props.onChange([{
                                        type: "Query",
                                        uiType: "Cofactor",
                                        value: this.state.cofactors.get(this.state.selected),
                                        residue: this.state.selected
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
                }
            }
            FromLiteMol.StartingPointCofactorBox = StartingPointCofactorBox;
            class StartingPointResidueListBox extends React.Component {
                constructor() {
                    super(...arguments);
                    this.state = { value: "", textbox: void 0 };
                    this.onClearGroup = "";
                }
                componentDidMount() {
                    this.onClearGroup = "StartingPointResidueListBox" + StartingPointResidueListBox.instanceCounter++;
                    CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                        if (this.props.formGroup === formGroup || this.onClearGroup === formGroup) {
                            let s = this.state;
                            s.value = "";
                            this.setState(s);
                        }
                    });
                }
                render() {
                    let button = LMControls.CommitButton({
                        action: () => {
                            if (this.props.onChange !== void 0) {
                                let newPointData = [];
                                let residueList = CommonUtils.Misc.parseResidues(this.state.value);
                                if (residueList.length === 0 || residueList.length !== this.state.value.split(",").length) {
                                    return;
                                }
                                for (let r of residueList) {
                                    newPointData.push(new Residue(r.SequenceNumber, r.Chain));
                                }
                                this.props.onChange([{
                                        type: "Residue",
                                        uiType: "Residue List",
                                        value: newPointData,
                                    }]);
                                CommonUtils.FormEvents.Events.invokeOnClear(this.onClearGroup);
                            }
                        },
                        isOn: true,
                        off: "",
                        on: "Add",
                    });
                    return React.createElement("div", { className: "starting-point-control-container" },
                        React.createElement(TextBox, { defaultValue: "", label: "Residue list:", placeholder: "A 52, B142,...", onChange: (val) => {
                                let s = this.state;
                                s.value = val;
                                this.setState(s);
                            }, onMount: (control) => {
                                CommonUtils.FormEvents.Events.attachOnClearEventHandler(((formGroup) => {
                                    if (this.props.formGroup === formGroup || this.onClearGroup === formGroup) {
                                        window.setTimeout(() => control.reset());
                                    }
                                }).bind(control));
                            } }),
                        React.createElement("div", { className: 'lm-control-row lm-options-group', title: this.props.tooltip },
                            React.createElement("span", null, this.props.label),
                            React.createElement("div", null, button)));
                }
            }
            StartingPointResidueListBox.instanceCounter = 0;
            FromLiteMol.StartingPointResidueListBox = StartingPointResidueListBox;
            class StartingPoint3DPointBox extends React.Component {
                constructor() {
                    super(...arguments);
                    this.state = { value: "" };
                    this.onClearGroup = "";
                }
                componentDidMount() {
                    this.onClearGroup = "StartingPoint3DPointBox" + StartingPoint3DPointBox.instanceCounter++;
                    CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                        if (this.props.formGroup === formGroup || this.onClearGroup === formGroup) {
                            let s = this.state;
                            s.value = "";
                            this.setState(s);
                        }
                    });
                }
                render() {
                    let button = LMControls.CommitButton({
                        action: () => {
                            if (this.props.onChange !== void 0) {
                                let newPointData = [];
                                let point = CommonUtils.Misc.parsePoint(this.state.value);
                                if (point === void 0) {
                                    return;
                                }
                                this.props.onChange([{
                                        type: "Point",
                                        uiType: "3D Point",
                                        value: new Point(point.x, point.y, point.z),
                                    }]);
                            }
                            CommonUtils.FormEvents.Events.invokeOnClear(this.onClearGroup);
                        },
                        isOn: true,
                        off: "",
                        on: "Add",
                    });
                    return React.createElement("div", { className: "starting-point-control-container" },
                        React.createElement(TextBox, { defaultValue: this.state.value, label: "3D Point:", placeholder: "X, Y, Z", onChange: (val) => {
                                let s = this.state;
                                s.value = val;
                                this.setState(s);
                            }, onMount: (control) => {
                                CommonUtils.FormEvents.Events.attachOnClearEventHandler(((formGroup) => {
                                    if (this.props.formGroup === formGroup || this.onClearGroup === formGroup) {
                                        window.setTimeout(() => control.reset());
                                    }
                                }).bind(control));
                            } }),
                        React.createElement("div", { className: 'lm-control-row lm-options-group', title: this.props.tooltip },
                            React.createElement("span", null, this.props.label),
                            React.createElement("div", null, button)));
                }
            }
            StartingPoint3DPointBox.instanceCounter = 0;
            FromLiteMol.StartingPoint3DPointBox = StartingPoint3DPointBox;
            class StartingPointCSABox extends React.Component {
                constructor() {
                    super(...arguments);
                    this.state = { data: null, isLoading: true, selected: null };
                }
                componentDidMount() {
                    let params = CommonUtils.Router.getParameters();
                    if (params === null) {
                        console.error("URL parameters not readable!");
                        return;
                    }
                    MoleOnlineWebUI.DataProxy.CSAResidues.DataProvider.get(params.computationId, (compId, csaData) => {
                        let selected = null;
                        if (csaData.length > 0) {
                            selected = CommonUtils.Misc.flattenResidues(csaData[0]);
                        }
                        this.setState({ isLoading: false, data: csaData, selected });
                    });
                }
                generateItems(csaDataItems) {
                    let items = [];
                    for (let item of csaDataItems) {
                        let flatten = CommonUtils.Misc.flattenResidues(item);
                        items.push(new ComboBoxItem(flatten, flatten));
                    }
                    return items;
                }
                getNoDataMessage() {
                    let text = (this.state.isLoading) ? "Loading..." : "No CSA starting points available";
                    return React.createElement("div", { className: "starting-point-control-container" },
                        React.createElement("div", { className: "lm-control-row lm-options-group" },
                            React.createElement("span", null),
                            React.createElement("div", { className: "info", title: text }, text)));
                }
                render() {
                    if (this.state.isLoading || this.state.data === null) {
                        return this.getNoDataMessage();
                    }
                    let comboItems = this.generateItems(this.state.data);
                    if (comboItems.length === 0) {
                        return this.getNoDataMessage();
                    }
                    let combo = React.createElement(ComboBox, { items: comboItems, label: "CSA Active sites", selectedValue: comboItems[0].getValue(), tooltip: this.props.tooltip, onChange: ((v) => {
                            let s = this.state;
                            s.selected = v;
                            this.setState(s);
                        }).bind(this) });
                    let button = LMControls.CommitButton({
                        action: () => {
                            if (this.props.onChange !== void 0 && this.state.data !== null && this.state.selected !== null) {
                                this.props.onChange([{
                                        type: "Residue",
                                        uiType: "CSA",
                                        value: CommonUtils.Misc.parseResidues(this.state.selected).map((val, idx, arr) => {
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
                }
            }
            FromLiteMol.StartingPointCSABox = StartingPointCSABox;
            class StartingPointQueryBox extends React.Component {
                constructor() {
                    super(...arguments);
                    this.state = { value: "", isValid: false, validationInProgress: false, validationMessage: "Query cannot be empty..." };
                    this.onClearGroup = "";
                }
                componentDidMount() {
                    this.onClearGroup = "StartingPointQueryBox" + StartingPointQueryBox.instanceCounter++;
                    CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                        if (this.props.formGroup === formGroup || this.onClearGroup === formGroup) {
                            let s = this.state;
                            s.value = "";
                            this.setState(s);
                        }
                    });
                }
                render() {
                    let button = LMControls.CommitButton({
                        action: () => {
                            if (this.props.onChange !== void 0 && this.state.isValid && !this.state.validationInProgress) {
                                this.props.onChange([{
                                        type: "Query",
                                        uiType: "PatternQuery",
                                        value: this.state.value,
                                        residue: ""
                                    }]);
                            }
                        },
                        isOn: (this.state.isValid && !this.state.validationInProgress),
                        off: this.state.validationMessage,
                        on: "Add",
                    });
                    return React.createElement("div", { className: "starting-point-control-container" },
                        React.createElement(TextBox, { defaultValue: this.state.value, label: "Query:", placeholder: "Residues('GOL')", onChange: (val) => {
                                let s = this.state;
                                s.value = val;
                                s.isValid = false;
                                s.validationInProgress = true;
                                s.validationMessage = "Validation in progress... Please wait.";
                                this.setState(s);
                                CommonUtils.Validators.validatePatternQuery(val).then((result) => {
                                    let s1 = this.state;
                                    s1.isValid = result.valid;
                                    s1.value = val;
                                    s1.validationInProgress = false;
                                    if (result.valid) {
                                        s1.validationMessage = "";
                                    }
                                    else {
                                        s1.validationMessage = (result.message !== void 0) ? result.message : "Unkown validation error...";
                                    }
                                    this.setState(s1);
                                }).catch((err) => {
                                    let s1 = this.state;
                                    s1.isValid = false;
                                    s1.value = val;
                                    s1.validationInProgress = false;
                                    s1.validationMessage = "Validation API not available. Please try again later.";
                                    this.setState(s1);
                                });
                            }, onMount: (control) => {
                                CommonUtils.FormEvents.Events.attachOnClearEventHandler(((formGroup) => {
                                    if (this.props.formGroup === formGroup || this.onClearGroup === formGroup) {
                                        window.setTimeout(() => control.reset());
                                    }
                                }).bind(control));
                            } }),
                        React.createElement("div", { className: 'lm-control-row lm-options-group', title: this.props.tooltip },
                            React.createElement("span", null, this.props.label),
                            React.createElement("div", null, button)));
                }
            }
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
            class TabbedContainer extends React.Component {
                componentDidMount() {
                }
                header() {
                    let rv = [];
                    for (let idx = 0; idx < this.props.header.length; idx++) {
                        let header = this.props.header[idx];
                        rv.push(React.createElement("li", { className: (idx === this.props.activeTab) ? "active" : "" },
                            React.createElement("a", { "data-toggle": "tab", href: `#${this.props.namespace}${idx + 1}`, onClick: (() => {
                                    window.setTimeout(() => {
                                        if (this.props.onChange !== void 0) {
                                            this.props.onChange(idx);
                                        }
                                    });
                                }).bind(this) }, header)));
                    }
                    return rv;
                }
                contents() {
                    let rv = [];
                    for (let idx = 0; idx < this.props.tabContents.length; idx++) {
                        let contents = this.props.tabContents[idx];
                        rv.push(React.createElement("div", { id: `${this.props.namespace}${idx + 1}`, className: `tab-pane fade ${(idx === this.props.activeTab) ? "in active" : ""}` }, contents));
                    }
                    return rv;
                }
                render() {
                    return (React.createElement("div", { className: this.props.htmlClassName, id: this.props.htmlId },
                        React.createElement("ul", { className: "nav nav-tabs" }, this.header()),
                        React.createElement("div", { className: "tab-content" }, this.contents())));
                }
            }
            BootstrapTabs.TabbedContainer = TabbedContainer;
            class Tab extends React.Component {
                render() {
                    return (React.createElement("div", { id: `${this.props.namespace}${this.props.tabIndex}`, className: (this.props.active) ? "active" : "" }, this.props.contents));
                }
            }
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
        let DGTABLE_COLS_COUNT = 7;
        ;
        function render(target, plugin) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, { controller: plugin }), target);
        }
        UI.render = render;
        class App extends React.Component {
            constructor() {
                super(...arguments);
                this.interactionEventStream = void 0;
                this.state = {
                    data: null,
                    app: this,
                    isWaitingForData: false
                };
            }
            componentDidMount() {
                MoleOnlineWebUI.Bridge.Events.subscribeChannelDataLoaded((data) => {
                    let toShow = [];
                    /*let data = e.data.props.data as DataInterface.MoleOnlineData;*/
                    let channelsDbTunnels = data.Channels;
                    let moleTunnels = data.Channels;
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, moleTunnels.Tunnels);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, moleTunnels.Paths);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, moleTunnels.Pores);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, moleTunnels.MergedPores);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.ReviewedChannels);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.CSATunnels);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.TransmembranePores);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.CofactorTunnels);
                    let state = this.state;
                    state.data = toShow;
                    this.setState(state);
                    $(window).trigger("contentResize");
                });
                /*
                LiteMoleEvent.Tree.NodeAdded.getStream(this.props.controller.context).subscribe(e => {
                    if(e.data.tree !== void 0 && e.data.ref === "mole-data"){
                        let toShow:DataInterface.Tunnel[] = [];
                        let data = e.data.props.data as DataInterface.MoleOnlineData;
                        toShow = toShow.concat(data.Channels.Tunnels);
                        toShow = toShow.concat(data.Channels.Paths);
                        toShow = toShow.concat(data.Channels.Pores);
                        toShow = toShow.concat(data.Channels.MergedPores);
                        let state = this.state;
                        state.data = toShow;
                        this.setState(state);
                        $( window ).trigger("contentResize");
                    }
                });*/
                LiteMoleEvent.Tree.NodeRemoved.getStream(this.props.controller.context).subscribe(e => {
                    if (e.data.tree !== void 0 && e.data.ref === "mole-data") {
                        let state = this.state;
                        state.data = null;
                        this.setState(state);
                    }
                });
                this.forceUpdate();
            }
            /*
                    private dataWaitHandler(){
                        this.setState({isWaitingForData:false});
                    }
            
                    public invokeDataWait(){
                        if(this.state.isWaitingForData){
                            return;
                        }
            
                        this.setState({isWaitingForData: true});
                        Annotation.AnnotationDataProvider.subscribeForData(this.dataWaitHandler.bind(this));
                    }
            */
            componentWillUnmount() {
            }
            componentDidUpdate(prevProps, prevState) {
                $('.init-agp-tooltip').tooltip({ container: 'body' });
            }
            render() {
                return (React.createElement("div", null,
                    React.createElement(DGTable, Object.assign({}, this.state))));
            }
        }
        UI.App = App;
        class DGTable extends React.Component {
            render() {
                return (React.createElement("div", { className: "datagrid", id: "dg-aglomered-parameters" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, Object.assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement(DGBody, Object.assign({}, this.props)))));
            }
        }
        class DGHead extends React.Component {
            render() {
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
                            React.createElement("span", { className: "ATable-label" }, "Mutability")))));
            }
            ;
        }
        class DGBody extends React.Component {
            generateRows() {
                let rows = [];
                if (this.props.data === null) {
                    rows.push(React.createElement("tr", null,
                        React.createElement("td", { colSpan: DGTABLE_COLS_COUNT }, "There are no data to be displayed...")));
                }
                if (this.props.data !== null) {
                    for (let tunnel of this.props.data) {
                        rows.push(React.createElement(DGRow, { tunnel: tunnel, app: this.props.app }));
                    }
                }
                rows.push(React.createElement(DGComponents.DGRowEmpty, { columnsCount: DGTABLE_COLS_COUNT }));
                return rows;
            }
            render() {
                let rows = this.generateRows();
                return (React.createElement("table", null, rows));
            }
            ;
        }
        class DGRow extends React.Component {
            render() {
                let name = MoleOnlineWebUI.Cache.TunnelName.get(this.props.tunnel.GUID);
                let namePart = (name === void 0) ? 'X' : ` (${name})`;
                let tunnelID = this.props.tunnel.Type + namePart;
                if (CommonUtils.Router.isInChannelsDBMode()) {
                    let annotations = MoleOnlineWebUI.Cache.ChannelsDBData.getChannelAnnotationsImmediate(this.props.tunnel.Id);
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
                    React.createElement("td", { className: "col col-4" }, CommonUtils.Numbers.roundToDecimal(this.props.tunnel.Properties.Hydropathy, 2)),
                    React.createElement("td", { className: "col col-5" }, CommonUtils.Numbers.roundToDecimal(this.props.tunnel.Properties.Charge, 2)),
                    React.createElement("td", { className: "col col-6" }, CommonUtils.Numbers.roundToDecimal(this.props.tunnel.Properties.Polarity, 2)),
                    React.createElement("td", { className: "col col-7" }, CommonUtils.Numbers.roundToDecimal(this.props.tunnel.Properties.Mutability, 2))));
            }
        }
    })(UI = AglomeredParameters.UI || (AglomeredParameters.UI = {}));
})(AglomeredParameters || (AglomeredParameters = {}));
var LayerProperties;
(function (LayerProperties) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        var DGComponents = Datagrid.Components;
        let DGTABLE_COLS_COUNT = 2;
        let NO_DATA_MESSAGE = "Hover over channel(2D) for details...";
        ;
        ;
        function render(target, plugin) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, { controller: plugin }), target);
        }
        UI.render = render;
        class App extends React.Component {
            constructor() {
                super(...arguments);
                this.interactionEventStream = void 0;
                this.state = {
                    data: null,
                    app: this,
                    layerIdx: -1
                };
                this.layerIdx = -1;
            }
            componentDidMount() {
                /*
                var interactionHandler = function showInteraction(type: string, i: ChannelEventInfo | undefined, app: App) {
                    if (!i || i.source == null || i.source.props.tag === void 0 || i.source.props.tag.type === void 0) {
                        return;
                    }
    
                    if(i.source.props.tag.type == "Tunnel"
                        || i.source.props.tag.type == "Path"
                        || i.source.props.tag.type == "Pore"
                        || i.source.props.tag.type == "MergedPore"){
                        
                        let layers = i.source.props.tag.element.Layers;
                        app.setState({data:layers.LayersInfo});
                    }
                    
                }*/
                /*
                this.interactionEventStream = LiteMoleEvent.Visual.VisualSelectElement.getStream(this.props.controller.context)
                    .subscribe(e => interactionHandler('select', e.data as ChannelEventInfo, this));
                */
                CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(() => {
                    let state = this.state;
                    state.layerIdx = -1;
                    state.data = null;
                    this.setState(state);
                });
                CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler((data) => {
                    let state = this.state;
                    state.layerIdx = -1;
                    state.data = data.LayersInfo;
                    this.setState(state);
                });
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(() => {
                    let state = this.state;
                    state.layerIdx = -1;
                    state.data = null;
                    this.setState(state);
                });
                $(window).on('layerTriggered', this.layerTriggerHandler.bind(this));
            }
            layerTriggerHandler(event, layerIdx) {
                this.layerIdx = layerIdx;
                let state = this.state;
                state.layerIdx = layerIdx;
                this.setState(state);
                setTimeout(function () {
                    $(window).trigger('contentResize');
                }, 1);
            }
            componentWillUnmount() {
            }
            render() {
                if (this.state.data !== null && this.state.layerIdx >= 0) {
                    return (React.createElement("div", null,
                        React.createElement(DGTable, Object.assign({}, this.state))));
                }
                return React.createElement("div", null,
                    React.createElement(DGNoData, Object.assign({}, this.state)));
            }
        }
        UI.App = App;
        class DGNoData extends React.Component {
            render() {
                return (React.createElement("div", { className: "datagrid", id: "dg-layer-properties" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, Object.assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement("table", null,
                            React.createElement(DGComponents.DGNoDataInfoRow, { columnsCount: DGTABLE_COLS_COUNT, infoText: NO_DATA_MESSAGE }),
                            React.createElement(DGComponents.DGRowEmpty, { columnsCount: DGTABLE_COLS_COUNT })))));
            }
        }
        class DGTable extends React.Component {
            render() {
                return (React.createElement("div", { className: "datagrid", id: "dg-layer-properties" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, Object.assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement(DGBody, Object.assign({}, this.props)))));
            }
        }
        class DGHead extends React.Component {
            render() {
                return (React.createElement("table", null,
                    React.createElement("tr", null,
                        React.createElement("th", { title: "Property", className: "col col-1" }, "Property"),
                        React.createElement("th", { title: "Value", className: "col col-2" }, "Value"))));
            }
            ;
        }
        class DGBody extends React.Component {
            generateRows() {
                if (this.props.data === null) {
                    return React.createElement(DGComponents.DGNoDataInfoRow, { columnsCount: DGTABLE_COLS_COUNT, infoText: NO_DATA_MESSAGE });
                }
                let layerData = this.props.data[this.props.layerIdx].Properties;
                let rows = [];
                let charge = `${CommonUtils.Numbers.roundToDecimal(layerData.Charge, 2).toString()} (+${CommonUtils.Numbers.roundToDecimal(layerData.NumPositives, 2).toString()}/-${CommonUtils.Numbers.roundToDecimal(layerData.NumNegatives, 2).toString()})`;
                let minRadius = this.props.data[this.props.layerIdx].LayerGeometry.MinRadius;
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "glyphicon glyphicon-tint properties-icon" }),
                            "Hydropathy"), React.createElement("span", null, CommonUtils.Numbers.roundToDecimal(layerData.Hydropathy, 2).toString())] }));
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "glyphicon glyphicon-plus properties-icon" }),
                            "Polarity"), React.createElement("span", null, CommonUtils.Numbers.roundToDecimal(layerData.Polarity, 2).toString())] }));
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "glyphicon glyphicon-tint properties-icon upside-down" }),
                            "Hydrophobicity"), React.createElement("span", null, CommonUtils.Numbers.roundToDecimal(layerData.Hydrophobicity, 2).toString())] }));
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "glyphicon glyphicon-scissors properties-icon" }),
                            "Mutability"), React.createElement("span", null, CommonUtils.Numbers.roundToDecimal(layerData.Mutability, 2).toString())] }));
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "glyphicon glyphicon-flash properties-icon" }),
                            "Charge"), React.createElement("span", null, charge)] }));
                rows.push(React.createElement(DGComponents.DGElementRow, { columns: [React.createElement("span", null,
                            React.createElement("span", { className: "icon bottleneck black properties-icon" }),
                            "Radius"), React.createElement("span", null, CommonUtils.Numbers.roundToDecimal(minRadius, 1))] }));
                rows.push(React.createElement(DGComponents.DGRowEmpty, { columnsCount: DGTABLE_COLS_COUNT }));
                return rows;
            }
            render() {
                let rows = this.generateRows();
                return (React.createElement("table", null, rows));
            }
            ;
        }
        class DGRow extends React.Component {
            generateRow(columns) {
                let tds = [];
                for (let i = 0; i < columns.length; i++) {
                    tds.push(React.createElement("td", { className: `col col-${i + 1}` }, columns[i]));
                }
                return tds;
            }
            render() {
                return (React.createElement("tr", null, this.generateRow(this.props.columns)));
            }
        }
    })(UI = LayerProperties.UI || (LayerProperties.UI = {}));
})(LayerProperties || (LayerProperties = {}));
var LayerResidues;
(function (LayerResidues) {
    var UI;
    (function (UI) {
        var DGComponents = Datagrid.Components;
        var React = LiteMol.Plugin.React;
        let DGTABLE_COLS_COUNT = 2;
        let NO_DATA_MESSAGE = "Hover over channel(2D) for details...";
        ;
        ;
        function render(target, plugin) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, { controller: plugin }), target);
        }
        UI.render = render;
        class App extends React.Component {
            constructor() {
                super(...arguments);
                this.interactionEventStream = void 0;
                this.state = {
                    data: null,
                    app: this,
                    layerIdx: -1,
                };
                this.layerIdx = -1;
            }
            componentDidMount() {
                CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(() => {
                    let state = this.state;
                    state.layerIdx = -1;
                    state.data = null;
                    this.setState(state);
                });
                CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler((data) => {
                    let state = this.state;
                    state.layerIdx = -1;
                    state.data = data.LayersInfo;
                    this.setState(state);
                });
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(() => {
                    let state = this.state;
                    state.layerIdx = -1;
                    state.data = null;
                    this.setState(state);
                });
                $(window).on('layerTriggered', this.layerTriggerHandler.bind(this));
            }
            layerTriggerHandler(event, layerIdx) {
                this.layerIdx = layerIdx;
                let state = this.state;
                state.layerIdx = layerIdx;
                this.setState(state);
                setTimeout(function () {
                    $(window).trigger('contentResize');
                }, 1);
            }
            componentWillUnmount() {
            }
            render() {
                if (this.state.data !== null && this.state.layerIdx >= 0) {
                    return (React.createElement("div", null,
                        React.createElement(DGTable, Object.assign({}, this.state))));
                }
                return React.createElement("div", null,
                    React.createElement(DGNoData, Object.assign({}, this.state)));
            }
        }
        UI.App = App;
        class DGNoData extends React.Component {
            render() {
                return (React.createElement("div", { className: "datagrid", id: "dg-layer-residues" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, Object.assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement("table", null,
                            React.createElement(DGComponents.DGNoDataInfoRow, { columnsCount: DGTABLE_COLS_COUNT, infoText: NO_DATA_MESSAGE }),
                            React.createElement(DGComponents.DGRowEmpty, { columnsCount: DGTABLE_COLS_COUNT })))));
            }
        }
        class DGTable extends React.Component {
            render() {
                return (React.createElement("div", { className: "datagrid", id: "dg-layer-residues" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, Object.assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement(DGBody, Object.assign({}, this.props)))));
            }
        }
        class DGHead extends React.Component {
            render() {
                return (React.createElement("table", null,
                    React.createElement("tr", null,
                        React.createElement("th", { title: "Residue", className: "col col-1" }, "Residue"))));
            }
            ;
        }
        class DGBody extends React.Component {
            shortenBackbone(residue) {
                return residue.replace(/Backbone/g, 'BB');
            }
            isBackbone(residue) {
                return residue.indexOf("Backbone") >= 0;
            }
            getAnnotationLinkOrText(annotation) {
                if (annotation.reference === "") {
                    return (annotation.text !== void 0 && annotation.text !== null) ? React.createElement("span", null, annotation.text) : React.createElement("span", { className: "no-annotation" });
                }
                return React.createElement("a", { target: "_blank", href: annotation.link, dangerouslySetInnerHTML: { __html: annotation.text } });
            }
            generateSpannedRows(residue, annotations) {
                let trs = [];
                let residueNameEl = residue; //(this.isBackbone(residue))?<i><strong>{this.shortenBackbone(residue)}</strong></i>:<span>{residue}</span>;
                let first = true;
                for (let annotation of annotations) {
                    if (first === true) {
                        first = false;
                        trs.push(React.createElement("tr", { title: (this.isBackbone(residue) ? residue : ""), className: (this.isBackbone(residue) ? "help" : "") },
                            React.createElement("td", { className: `col col-1`, rowSpan: (annotations.length > 1) ? annotations.length : void 0 }, residueNameEl),
                            React.createElement("td", { className: `col col-2` }, this.getAnnotationLinkOrText(annotation))));
                    }
                    else {
                        trs.push(React.createElement("tr", null,
                            React.createElement("td", { className: `col col-2` }, this.getAnnotationLinkOrText(annotation))));
                    }
                }
                return trs;
            }
            generateRows() {
                /*let channelsDBMode = CommonUtils.Router.isInChannelsDBMode();*/
                let columnCount = DGTABLE_COLS_COUNT; /*+((channelsDBMode)?1:0);*/
                if (this.props.data === null) {
                    return React.createElement(DGComponents.DGNoDataInfoRow, { columnsCount: columnCount, infoText: NO_DATA_MESSAGE });
                }
                let layerData = CommonUtils.Residues.sort(this.props.data[this.props.layerIdx].Residues, void 0, true, true);
                let rows = [];
                for (let residue of layerData) {
                    let residueId = residue.split(" ").slice(1, 3).join(" ");
                    let residueInfo = CommonUtils.Residues.parseResidues([residue], true);
                    let columns = [];
                    columns.push((this.isBackbone(residue)) ? React.createElement("span", null, residue) : React.createElement("strong", null, residue));
                    let seqNumberAndChain = `${residueInfo[0].authSeqNumber} ${residueInfo[0].chain.authAsymId}`;
                    let annotations = MoleOnlineWebUI.Cache.ChannelsDBData.getResidueAnnotationsImmediate(seqNumberAndChain);
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
            }
            render() {
                let rows = this.generateRows();
                return (React.createElement("table", null, rows));
            }
            ;
        }
    })(UI = LayerResidues.UI || (LayerResidues.UI = {}));
})(LayerResidues || (LayerResidues = {}));
var LiningResidues;
(function (LiningResidues) {
    var UI;
    (function (UI) {
        var DGComponents = Datagrid.Components;
        var React = LiteMol.Plugin.React;
        let DGTABLE_COLS_COUNT = 2;
        let NO_DATA_MESSAGE = "Select channel in 3D view for details...";
        ;
        ;
        function render(target, plugin) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, { controller: plugin }), target);
        }
        UI.render = render;
        class App extends React.Component {
            constructor() {
                super(...arguments);
                this.interactionEventStream = void 0;
                this.state = {
                    data: null,
                    app: this,
                    isWaitingForData: false
                };
                this.layerIdx = -1;
            }
            componentDidMount() {
                CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler((data) => {
                    let state = this.state;
                    state.data = CommonUtils.Residues.sort(data.ResidueFlow, void 0, true, true);
                    this.setState(state);
                    setTimeout(function () {
                        $(window).trigger('contentResize');
                    }, 1);
                });
                CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(() => {
                    let state = this.state;
                    state.data = null;
                    this.setState(state);
                });
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(() => {
                    let state = this.state;
                    state.data = null;
                    this.setState(state);
                });
            }
            /*
            private dataWaitHandler(){
                this.setState({isWaitingForData:false});
            }
    
            public invokeDataWait(){
                if(this.state.isWaitingForData){
                    return;
                }
    
                this.setState({isWaitingForData: true});
                Annotation.AnnotationDataProvider.subscribeForData(this.dataWaitHandler.bind(this));
            }*/
            componentWillUnmount() {
            }
            render() {
                if (this.state.data !== null) {
                    return (React.createElement("div", null,
                        React.createElement(DGTable, Object.assign({}, this.state)),
                        React.createElement(Controls, Object.assign({}, this.state))));
                }
                return React.createElement("div", null,
                    React.createElement(DGNoData, Object.assign({}, this.state)));
            }
        }
        UI.App = App;
        function residueStringToResidueLight(residue) {
            /*
            [0 , 1 ,2 ,  3   ]
            VAL 647 A Backbone
            */
            let residueParts = residue.split(" ");
            let rv = {
                authSeqNumber: Number(residueParts[1]),
                chain: {
                    authAsymId: residueParts[2]
                }
            };
            return rv;
        }
        class Controls extends React.Component {
            clearSelection() {
                CommonUtils.Selection.SelectionHelper.clearSelection(this.props.app.props.controller);
            }
            selectAll() {
                let residues = [];
                if (this.props.app.state.data === null) {
                    return;
                }
                for (let residue of this.props.app.state.data) {
                    residues.push(residueStringToResidueLight(residue));
                }
                //CommonUtils.Selection.SelectionHelper.clearSelection(this.props.app.props.controller);
                CommonUtils.Selection.SelectionHelper.addResiduesToSelection(residues, false);
            }
            selectIonizable() {
                if (this.props.data === null) {
                    return;
                }
                let allResidues = CommonUtils.Residues.parseResidues(this.props.data, true);
                let ionizableResidues = [];
                for (let residue of allResidues) {
                    let rClass = "";
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
                //CommonUtils.Selection.SelectionHelper.clearSelection(this.props.app.props.controller);
                CommonUtils.Selection.SelectionHelper.addResiduesToSelection(ionizableResidues, false);
            }
            render() {
                return React.createElement("div", { className: "lining-residues select-controls" },
                    React.createElement("span", { className: "btn-xs btn-default bt-ionizable hand", onClick: this.selectIonizable.bind(this) }, "Select ionizable"),
                    React.createElement("span", { className: "btn-xs btn-default bt-all hand", onClick: this.selectAll.bind(this) }, "Select all"));
                //<span className="btn-xs btn-default bt-none hand" onClick={this.clearSelection.bind(this)}>Clear selection</span>
            }
        }
        class DGNoData extends React.Component {
            render() {
                return (React.createElement("div", { className: "datagrid", id: "dg-lining-residues" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, Object.assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement("table", null,
                            React.createElement(DGComponents.DGNoDataInfoRow, { columnsCount: DGTABLE_COLS_COUNT, infoText: NO_DATA_MESSAGE }),
                            React.createElement(DGComponents.DGRowEmpty, { columnsCount: DGTABLE_COLS_COUNT })))));
            }
        }
        class DGTable extends React.Component {
            render() {
                return (React.createElement("div", { className: "datagrid", id: "dg-lining-residues" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, Object.assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement(DGBody, Object.assign({}, this.props)))));
            }
        }
        class DGHead extends React.Component {
            render() {
                return (React.createElement("table", null,
                    React.createElement("tr", null,
                        React.createElement("th", { title: "Residue", className: "col col-1" }, "Residue"))));
            }
            ;
        }
        class DGBody extends React.Component {
            getAnnotationLinkOrText(annotation) {
                if (annotation.reference === "") {
                    return (annotation.text !== void 0 && annotation.text !== null) ? React.createElement("span", null, annotation.text) : React.createElement("span", { className: "no-annotation" });
                }
                return React.createElement("a", { target: "_blank", href: annotation.link, dangerouslySetInnerHTML: { __html: annotation.text } });
            }
            shortenBackbone(residue) {
                return residue.replace(/Backbone/g, '');
            }
            isBackbone(residue) {
                return residue.indexOf("Backbone") >= 0;
            }
            selectResidue(residue) {
                let residueLightEntity = residueStringToResidueLight(residue);
                CommonUtils.Selection.SelectionHelper.addResidueToSelection(residueLightEntity.authSeqNumber, residueLightEntity.chain.authAsymId);
            }
            getSelect3DLink(residue) {
                let residueEl = (this.isBackbone(residue)) ? React.createElement("i", null,
                    React.createElement("strong", null, this.shortenBackbone(residue))) : React.createElement("span", null, residue);
                return React.createElement("a", { className: "hand", onClick: (e) => { this.selectResidue(residue); } }, residueEl);
            }
            generateSpannedRows(residue, annotations) {
                let trs = [];
                let residueNameEl = this.getSelect3DLink(residue); //(this.isBackbone(residue))?<i><strong>{this.shortenBackbone(residue)}</strong></i>:<span>{residue}</span>;
                let first = true;
                for (let annotation of annotations) {
                    if (first === true) {
                        first = false;
                        trs.push(React.createElement("tr", { title: (this.isBackbone(residue) ? residue : ""), className: (this.isBackbone(residue) ? "help" : "") },
                            React.createElement("td", { className: `col col-1`, rowSpan: (annotations.length > 1) ? annotations.length : void 0 }, residueNameEl),
                            React.createElement("td", { className: `col col-2` }, this.getAnnotationLinkOrText(annotation))));
                    }
                    else {
                        trs.push(React.createElement("tr", null,
                            React.createElement("td", { className: `col col-2` }, this.getAnnotationLinkOrText(annotation))));
                    }
                }
                return trs;
            }
            generateRows() {
                /*let channelsDBMode = CommonUtils.Router.isInChannelsDBMode();*/
                let columnsCount = DGTABLE_COLS_COUNT; /* + ((channelsDBMode)?1:0);*/
                if (this.props.data === null) {
                    return React.createElement(DGComponents.DGNoDataInfoRow, { columnsCount: DGTABLE_COLS_COUNT, infoText: NO_DATA_MESSAGE });
                }
                let rows = [];
                for (let residue of this.props.data) {
                    let residueId = residue.split(" ").slice(1, 3).join(" ");
                    let residueInfo = CommonUtils.Residues.parseResidues([residue], true);
                    let trClass = (this.isBackbone(residue) ? "help" : "");
                    if (residueInfo.length > 0) {
                        let authName = residueInfo[0].name;
                        trClass += (authName === void 0) ? '' : " " + CommonUtils.Residues.getResidueClassByName(authName);
                    }
                    let seqNumberAndChain = `${residueInfo[0].authSeqNumber} ${residueInfo[0].chain.authAsymId}`;
                    let annotations = MoleOnlineWebUI.Cache.ChannelsDBData.getResidueAnnotationsImmediate(seqNumberAndChain);
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
            }
            render() {
                let rows = this.generateRows();
                return (React.createElement("table", null, rows));
            }
            ;
        }
    })(UI = LiningResidues.UI || (LiningResidues.UI = {}));
})(LiningResidues || (LiningResidues = {}));
var ChannelParameters;
(function (ChannelParameters) {
    var UI;
    (function (UI) {
        var DGComponents = Datagrid.Components;
        var React = LiteMol.Plugin.React;
        let DGTABLE_COLS_COUNT = 2;
        let NO_DATA_MESSAGE = "Select channel in 3D view for details...";
        ;
        ;
        function render(target, plugin) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, { controller: plugin }), target);
        }
        UI.render = render;
        class App extends React.Component {
            constructor() {
                super(...arguments);
                this.interactionEventStream = void 0;
                this.state = {
                    data: null,
                    currentTunnel: null,
                    app: this,
                };
                this.layerIdx = -1;
            }
            componentDidMount() {
                MoleOnlineWebUI.Bridge.Events.subscribeChannelDataLoaded((data) => {
                    let toShow = [];
                    let channelsDbTunnels = data.Channels;
                    let moleTunnels = data.Channels;
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, moleTunnels.Tunnels);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, moleTunnels.Paths);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, moleTunnels.Pores);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, moleTunnels.MergedPores);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.ReviewedChannels);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.CSATunnels);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.TransmembranePores);
                    toShow = CommonUtils.Tunnels.concatTunnelsSafe(toShow, channelsDbTunnels.CofactorTunnels);
                    let state = this.state;
                    state.data = toShow;
                    this.setState(state);
                    $(window).trigger("contentResize");
                });
                CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler((data, channelId) => {
                    if (channelId === void 0) {
                        return;
                    }
                    let state = this.state;
                    state.currentTunnel = channelId;
                    this.setState(state);
                    setTimeout(function () {
                        $(window).trigger('contentResize');
                    }, 1);
                });
                CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(() => {
                    let state = this.state;
                    state.currentTunnel = null;
                    this.setState(state);
                });
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId(() => {
                    let state = this.state;
                    state.currentTunnel = null;
                    this.setState(state);
                });
            }
            componentWillUnmount() {
            }
            render() {
                if (this.state.data !== null && this.state.currentTunnel !== null) {
                    return (React.createElement("div", null,
                        React.createElement(DGTable, Object.assign({}, this.state))));
                }
                return React.createElement("div", null,
                    React.createElement(DGNoData, Object.assign({}, this.state)));
            }
        }
        UI.App = App;
        class DGNoData extends React.Component {
            render() {
                return (React.createElement("div", { className: "datagrid", id: "dg-channel-parameters" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, Object.assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement("table", null,
                            React.createElement(DGComponents.DGNoDataInfoRow, { columnsCount: DGTABLE_COLS_COUNT, infoText: NO_DATA_MESSAGE }),
                            React.createElement(DGComponents.DGRowEmpty, { columnsCount: DGTABLE_COLS_COUNT })))));
            }
        }
        class DGTable extends React.Component {
            render() {
                return (React.createElement("div", { className: "datagrid", id: "dg-channel-parameters" },
                    React.createElement("div", { className: "header" },
                        React.createElement(DGHead, Object.assign({}, this.props))),
                    React.createElement("div", { className: "body" },
                        React.createElement(DGBody, Object.assign({}, this.props)))));
            }
        }
        class DGHead extends React.Component {
            render() {
                return (React.createElement("table", null,
                    React.createElement("tr", null,
                        React.createElement("th", { title: "Property", className: "col col-1" }, "Property"),
                        React.createElement("th", { title: "Value", className: "col col-2" }, "Value"))));
            }
            ;
        }
        class DGBody extends React.Component {
            generateRows() {
                let columnsCount = DGTABLE_COLS_COUNT;
                if (this.props.data === null) {
                    return React.createElement(DGComponents.DGNoDataInfoRow, { columnsCount: DGTABLE_COLS_COUNT, infoText: NO_DATA_MESSAGE });
                }
                let rows = [];
                let data = this.props.data;
                for (let t of data) {
                    if (t.Id === this.props.currentTunnel) {
                        let length = [
                            React.createElement("span", null,
                                React.createElement("span", { className: "glyphicon glyphicon-resize-horizontal properties-icon" }),
                                "Length"),
                            React.createElement("span", null, CommonUtils.Numbers.roundToDecimal(CommonUtils.Tunnels.getLength(t), 2).toString())
                        ];
                        let bottleneck = [
                            React.createElement("span", null,
                                React.createElement("span", { className: "icon bottleneck black properties-icon" }),
                                "Bottleneck"),
                            React.createElement("span", null, CommonUtils.Tunnels.getBottleneck(t))
                        ];
                        let hydropathy = [
                            React.createElement("span", null,
                                React.createElement("span", { className: "glyphicon glyphicon-tint properties-icon" }),
                                "Hydropathy"),
                            React.createElement("span", null, CommonUtils.Numbers.roundToDecimal(t.Properties.Hydropathy, 2).toString())
                        ];
                        let charge = [
                            React.createElement("span", null,
                                React.createElement("span", { className: "glyphicon glyphicon-flash properties-icon" }),
                                "Charge"),
                            React.createElement("span", null, CommonUtils.Numbers.roundToDecimal(t.Properties.Charge, 2).toString())
                        ];
                        let polarity = [
                            React.createElement("span", null,
                                React.createElement("span", { className: "glyphicon glyphicon-plus properties-icon" }),
                                "Polarity"),
                            React.createElement("span", null, CommonUtils.Numbers.roundToDecimal(t.Properties.Polarity, 2).toString())
                        ];
                        let mutability = [
                            React.createElement("span", null,
                                React.createElement("span", { className: "glyphicon glyphicon-scissors properties-icon" }),
                                "Mutability"),
                            React.createElement("span", null, CommonUtils.Numbers.roundToDecimal(t.Properties.Mutability, 2).toString())
                        ];
                        //Length
                        rows.push(React.createElement(DGComponents.DGElementRow, { columnsCount: columnsCount, columns: length }));
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
                    }
                }
                rows.push(React.createElement(DGComponents.DGRowEmpty, { columnsCount: columnsCount }));
                return rows;
            }
            render() {
                let rows = this.generateRows();
                return (React.createElement("table", null, rows));
            }
            ;
        }
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
        class App extends React.Component {
            constructor() {
                super(...arguments);
                this.a4width = 210;
                this.a4height = 297;
                this.lineColor = "0.7";
                this.lineWidth = 0.3;
                this.state = { data: null, reportContent: null, inProgress: false, progress: 0 };
            }
            componentDidMount() {
                MoleOnlineWebUI.Bridge.Events.subscribeChannelDataLoaded(data => {
                    let state = this.state;
                    state.data = data;
                    this.setState(state);
                });
                MoleOnlineWebUI.Bridge.Events.subscribeRunGeneratePDFReport(() => {
                    if (this.state.inProgress === true) {
                        console.log("Attempt to run PDF report generator while in progress!");
                        return;
                    }
                    this.generateReport();
                });
            }
            addCurrentLMScreen(template) {
                let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                let litemolCanvas = plugin.context.scene.scene.parentElement.children[0];
                let litemol_screenshot = litemolCanvas.toDataURL('image/png');
                template = template.replace("[[3D-SCREEN-SRC]]", litemol_screenshot);
                return template.replace("[[report-3D-view-visible]]", "visible");
            }
            addCurrentLVZScreen(template) {
                let lvz = MoleOnlineWebUI.Bridge.Instances.getLayersVizualizer();
                let screenshot = lvz.exportImage();
                template = template.replace("[[2D-SCREEN-SRC]]", screenshot);
                return template.replace("[[report-2D-view-visible]]", "visible");
            }
            addTunnelName(template, text) {
                return template.replace("[[TUNNEL-NAME]]", text);
            }
            addPhysChemProps(template, tunnel) {
                let length = CommonUtils.Numbers.roundToDecimal(CommonUtils.Tunnels.getLength(tunnel), 2).toString();
                let bottleneck = CommonUtils.Tunnels.getBottleneck(tunnel);
                let hydropathy = CommonUtils.Numbers.roundToDecimal(tunnel.Properties.Hydropathy, 2).toString();
                let charge = CommonUtils.Numbers.roundToDecimal(tunnel.Properties.Charge, 2).toString();
                let polarity = CommonUtils.Numbers.roundToDecimal(tunnel.Properties.Polarity, 2).toString();
                let mutability = CommonUtils.Numbers.roundToDecimal(tunnel.Properties.Mutability, 2).toString();
                template = this.replacePlaceholder(template, "TUNNEL-PROPS-LENGTH", length);
                template = this.replacePlaceholder(template, "TUNNEL-PROPS-BOTTLENECK", bottleneck);
                template = this.replacePlaceholder(template, "TUNNEL-PROPS-HYDROPATHY", hydropathy);
                template = this.replacePlaceholder(template, "TUNNEL-PROPS-CHARGE", charge);
                template = this.replacePlaceholder(template, "TUNNEL-PROPS-POLARITY", polarity);
                template = this.replacePlaceholder(template, "TUNNEL-PROPS-MUTABILITY", mutability);
                return template;
            }
            addLiningResidues(template, residueLines) {
                let rows = "";
                for (let i = 0; i < residueLines.length; i++) {
                    let resInfo = CommonUtils.Residues.parseResidues([residueLines[i].residue], true);
                    let name = resInfo[0].name;
                    let seq = resInfo[0].authSeqNumber;
                    let chain = resInfo[0].chain.authAsymId;
                    let backbone = (resInfo[0].backbone) ? '<img class="report-ok-icon" src="/assets/images/accept.gif"/>' : '';
                    let annotation = residueLines[i].annotation;
                    if (annotation === null) {
                        rows += `<tr><td>${name}</td><td>${seq}</td><td>${chain}</td><td>${backbone}</td><td></td></tr>`;
                    }
                    else {
                        rows += `<tr><td>${name}</td><td>${seq}</td><td>${chain}</td><td>${backbone}</td><td>${annotation.text} ${((annotation.reference !== "") ? "(" + annotation.reference + ")" : "")}</td></tr>`;
                    }
                }
                return template.replace("[[LINING-RESIDUES-TABLE-ROWS]]", rows);
            }
            selectChannel(channel, allChannels) {
                let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                return new Promise((res, rej) => {
                    try {
                        LiteMol.Example.Channels.State.showChannelVisuals(plugin, allChannels, false).then(() => {
                            MoleOnlineWebUI.Bridge.Events.invokeChannelSelect(channel.Id);
                            let waitToResolve = () => {
                                window.setTimeout(() => {
                                    if (CommonUtils.Selection.SelectionHelper.getSelectedChannelId() == channel.Id) {
                                        window.setTimeout(() => { res(); }, 100);
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
            }
            zipResiduesWithAnnotations(residues, annotations) {
                let result = [];
                for (let r of residues) {
                    if (annotations === null) {
                        result.push({ residue: r, annotation: null });
                        continue;
                    }
                    let info = CommonUtils.Residues.parseResidues([r], true);
                    let a = annotations.get(`${info[0].authSeqNumber} ${info[0].chain.authAsymId}`);
                    if (a === void 0 || a === null || a.length === 0) {
                        result.push({ residue: r, annotation: null });
                        continue;
                    }
                    for (let ca of a) {
                        result.push({ residue: r, annotation: ca });
                    }
                }
                return result;
            }
            generateChannelReport(channelData) {
                return new Promise((res, rej) => {
                    let template = App.templateCache;
                    if (template === null) {
                        rej("No template!!!");
                        return;
                    }
                    let notNullTemplate = template.html.slice();
                    let templateInstance = notNullTemplate.slice();
                    let residues = CommonUtils.Residues.sort(channelData.Layers.ResidueFlow.slice(), void 0, true, true);
                    if (residues === void 0) {
                        return;
                    }
                    let name_ = CommonUtils.Tunnels.getName(channelData);
                    let chdb_annotations = MoleOnlineWebUI.Cache.ChannelsDBData.getChannelAnnotationsImmediate(channelData.Id);
                    let length = CommonUtils.Tunnels.getLength(channelData);
                    let tunnelName = `${channelData.Type}, Length: ${length} Å`;
                    if (chdb_annotations !== null && chdb_annotations.length > 0) {
                        tunnelName = chdb_annotations[0].name;
                    }
                    else if (name_ !== void 0) {
                        tunnelName = name_;
                    }
                    let residueAnnotations = MoleOnlineWebUI.Cache.ChannelsDBData.getResiduesAnnotationsImmediate();
                    let residuesPages = this.zipResiduesWithAnnotations(residues, residueAnnotations);
                    let residuesList = [];
                    for (let p of residuesPages) {
                        residuesList = residuesList.concat(p);
                    }
                    templateInstance = this.addTunnelName(templateInstance, tunnelName);
                    templateInstance = this.addPhysChemProps(templateInstance, channelData);
                    templateInstance = this.addCurrentLMScreen(templateInstance);
                    templateInstance = this.addCurrentLVZScreen(templateInstance);
                    templateInstance = this.addLiningResidues(templateInstance, residuesList);
                    let state = this.state;
                    let reportContent = "";
                    if (state.reportContent !== null) {
                        reportContent = state.reportContent;
                    }
                    reportContent += templateInstance;
                    state.reportContent = reportContent;
                    this.setState(state);
                    res();
                });
            }
            generateChannelReportWrapper(channelData, allChannels) {
                return new Promise((res, rej) => {
                    if (this.state.data === null) {
                        rej("No data!");
                    }
                    let selectedChannelId = CommonUtils.Selection.SelectionHelper.getSelectedChannelId();
                    let canvas = $(".layer-vizualizer-canvas");
                    if (canvas.length === 0 || selectedChannelId !== channelData.Id) {
                        if (selectedChannelId !== channelData.Id) {
                            this.selectChannel(channelData, allChannels).then(() => {
                                this.generateChannelReportWrapper(channelData, allChannels)
                                    .then(() => {
                                    res();
                                })
                                    .catch(err => {
                                    rej(err);
                                    console.log(err);
                                });
                            });
                        }
                        else {
                            let waitForCanvas = (timeout) => {
                                let canvas = $(".layer-vizualizer-canvas");
                                if (canvas.length === 0) {
                                    window.setTimeout(() => waitForCanvas((timeout === void 0) ? 20 : timeout + 10), (timeout === void 0) ? 20 : timeout);
                                }
                                else {
                                    this.generateChannelReport(channelData)
                                        .then(() => res()).catch(err => {
                                        rej(err);
                                        console.log(err);
                                    });
                                    res();
                                }
                            };
                            waitForCanvas();
                        }
                    }
                    else {
                        this.generateChannelReport(channelData).then(() => res()).catch(err => {
                            rej(err);
                            console.log(err);
                        });
                    }
                });
            }
            replacePlaceholder(template, placeholder, value) {
                let regexp = new RegExp("\\[\\[" + placeholder + "\\]\\]", "g");
                return template.replace(regexp, (value === null) ? "" : value);
            }
            addParamsPageCommon(template, urlParams, compInfo) {
                let emptyPlaceholders = [];
                if (urlParams !== null) {
                    template = this.replacePlaceholder(template, "COMP-ID", urlParams.computationId);
                    template = this.replacePlaceholder(template, "SUBMIT-ID", String(urlParams.submitId));
                }
                else {
                    emptyPlaceholders.push("COMP-ID");
                    emptyPlaceholders.push("SUBMIT-ID");
                }
                template = this.replacePlaceholder(template, "URL", CommonUtils.Router.getCurrentUrl());
                let isUserStructure = compInfo.PdbId === null;
                template = this.replacePlaceholder(template, "PDBID", (isUserStructure) ? "User structure" : compInfo.PdbId);
                template = this.replacePlaceholder(template, "ASSEMBLY-ID", (isUserStructure) ? "User structure" : ((compInfo.AssemblyId !== null) ? compInfo.AssemblyId : "Asymmetric unit"));
                template = this.replaceEmptyPlaceholders(template, emptyPlaceholders);
                return template;
            }
            //Replace all not filled placeholders with empty strings
            replaceEmptyPlaceholders(template, placeholders) {
                for (let emptyPlaceholder of placeholders) {
                    template = this.replacePlaceholder(template, emptyPlaceholder, "");
                }
                return template;
            }
            addParamsPageMole(template, params) {
                template = this.replacePlaceholder(template, "MOLE-PARAMS-VISIBLE", "visible");
                let emptyPlaceholders = [];
                let input = params.Input;
                let cavity = params.Cavity;
                let exits = params.CustomExits;
                let nonactiveResidues = params.NonActiveResidues;
                let origin = params.Origin;
                let tunnel = params.Tunnel;
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
                    let points = origin.Points;
                    if (points !== null) {
                        template = this.replacePlaceholder(template, "STARTING-POINT-XYZ", CommonUtils.Misc.pointsToString(points));
                    }
                    else {
                        emptyPlaceholders.push("STARTING-POINT-XYZ");
                    }
                    let residues = origin.Residues;
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
                    let points = exits.Points;
                    if (points !== null) {
                        template = this.replacePlaceholder(template, "END-POINT-XYZ", CommonUtils.Misc.pointsToString(points));
                    }
                    else {
                        emptyPlaceholders.push("END-POINT-XYZ");
                    }
                    let residues = exits.Residues;
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
            }
            addParamsPagePores(template, params) {
                template = this.replacePlaceholder(template, "PORES-PARAMS-VISIBLE", "visible");
                template = this.replacePlaceholder(template, "BETA-STRUCTURE", (params.IsBetaBarel) ? "Yes" : "No");
                template = this.replacePlaceholder(template, "MEMBRANE-REGION", (params.IsBetaBarel) ? "Yes" : "No");
                template = this.replacePlaceholder(template, "SPECIFIC-CHAINS", params.Chains);
                return template;
            }
            generateReport() {
                let urlParams = CommonUtils.Router.getParameters();
                if (urlParams === null) {
                    console.log("URL parameters cannot be parsed!");
                    return;
                }
                //$("#download-report .dropdown").addClass("open-programaticaly");
                let state = this.state;
                state.inProgress = true;
                this.setState(state);
                let channelsDBMode = CommonUtils.Router.isInChannelsDBMode();
                let configParamsPromise;
                if (channelsDBMode) {
                    configParamsPromise = Promise.resolve(null);
                }
                else {
                    configParamsPromise = new Promise((res, rej) => {
                        if (urlParams === null) {
                            rej("URL parameters cannot be parsed");
                            return;
                        }
                        MoleOnlineWebUI.DataProxy.ComputationInfo.DataProvider.get(urlParams.computationId, (compId, info) => {
                            if (urlParams === null) {
                                rej("URL parameters cannot be parsed");
                            }
                            else {
                                if (compId === urlParams.computationId) {
                                    for (let s of info.Submissions) {
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
                configParamsPromise.then((val) => {
                    let originalVisibleChannels = MoleOnlineWebUI.Cache.LastVisibleChannels.get();
                    MoleOnlineWebUI.Service.Templates.Service.getPDFReportTemplateData().then(template => {
                        App.templateCache = template;
                        if (this.state.data === null) {
                            console.log("genereateReport has no data!");
                            return;
                        }
                        let data = this.state.data.Channels;
                        let channels = [];
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
                        let reportContent = "";
                        if (!channelsDBMode && val !== null) {
                            let modeMole = CommonUtils.Misc.isMoleJob(val.submission);
                            let paramsPageTemplate = template.paramsPageHtml.slice();
                            paramsPageTemplate = this.addParamsPageCommon(paramsPageTemplate, urlParams, val.compInfo);
                            if (modeMole) {
                                paramsPageTemplate = this.addParamsPageMole(paramsPageTemplate, val.submission.MoleConfig);
                            }
                            else {
                                paramsPageTemplate = this.addParamsPagePores(paramsPageTemplate, val.submission.PoresConfig);
                            }
                            reportContent += paramsPageTemplate;
                        }
                        let state = this.state;
                        state.reportContent = reportContent;
                        this.setState(state);
                        let split = (tunnels) => {
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
                        let generate = (tunnels) => {
                            let d = split(tunnels);
                            if (d.current === null) {
                                if (Config.CommonOptions.DEBUG_MODE)
                                    console.log("Saving file...");
                                if (this.state.reportContent !== null && App.templateCache !== null) {
                                    let css = '<style>' + App.templateCache.css + "</style>";
                                    let reportWrapperId = "report-wrapper";
                                    let jsConstants = `<script>var report_idToRemoveAfterPrint = '${reportWrapperId}';</script>`;
                                    let toPrint = `<div id='${reportWrapperId}'>` + css + this.state.reportContent + '</div>';
                                    let toPrintHtml = $(toPrint)[0];
                                    $(document.body.children).addClass("no-print");
                                    document.body.appendChild(toPrintHtml);
                                    let originalTitle = document.title;
                                    if (urlParams !== null) {
                                        document.title = `MoleOnline - ${urlParams.computationId}/${urlParams.submitId}`;
                                    }
                                    window.setTimeout(() => {
                                        let afterPrint = (() => {
                                            let reportWrapper = $('#' + reportWrapperId)[0];
                                            if (reportWrapper !== void 0 && reportWrapper !== null) {
                                                document.body.removeChild(reportWrapper);
                                            }
                                            $(document.body.children).removeClass("no-print");
                                            //$(".pdf-report-generator").removeClass("in-progress");
                                            let state = this.state;
                                            state.progress = 0;
                                            state.inProgress = false;
                                            this.setState(state);
                                            document.title = originalTitle;
                                        }).bind(this);
                                        if (window.matchMedia) {
                                            let mediaQueryList = window.matchMedia('print');
                                            mediaQueryList.addListener(function (mql) {
                                                if (!mql.matches) {
                                                    afterPrint();
                                                }
                                            });
                                        }
                                        window.onafterprint = afterPrint;
                                        let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                                        LiteMol.Example.Channels.State.showChannelVisuals(plugin, channels, false).then(() => {
                                            LiteMol.Example.Channels.State.showChannelVisuals(plugin, originalVisibleChannels, true).then(() => {
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
                            this.generateChannelReportWrapper(d.current, channels).then(res => {
                                let tunnelId = (d.current === null) ? "<Err>" : d.current.Id;
                                if (Config.CommonOptions.DEBUG_MODE) {
                                    console.log(`Current tunnel: ${tunnelId}`);
                                    console.log(`${d.remaining.length} tunnels remaining of ${channels.length}`);
                                }
                                let s = this.state;
                                s.progress = Math.floor(((channels.length - d.remaining.length) / channels.length) * 100);
                                this.setState(s);
                                generate(d.remaining);
                            })
                                .catch(err => {
                                this.afterError(err);
                            });
                        };
                        generate(channels);
                    }).catch(err => {
                        this.afterError(err);
                    });
                })
                    .catch(err => {
                    this.afterError(err);
                });
            }
            afterError(err) {
                $(document.body.children).removeClass("no-print");
                $("#download-report .dropdown").removeClass("open-programaticaly");
                let state = this.state;
                state.progress = 0;
                state.inProgress = false;
                this.setState(state);
                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                    messageType: "Danger",
                    message: `PDF Report generation aborted. Reason: ${err}`
                });
            }
            render() {
                if (this.state.inProgress) {
                    let progress = this.state.progress;
                    return React.createElement("li", null,
                        React.createElement("div", { className: "pdf-report-inprogress-overlay" },
                            React.createElement("img", { src: "/assets/images/ajax-loader.gif" }),
                            React.createElement("div", { className: "pdf-report-inprogress-progress" },
                                "Generating PDF report (",
                                progress,
                                "%)...")));
                }
                return (React.createElement("div", null));
            }
        }
        App.templateCache = null;
        /*
        interface DownloadResultsMenuState{
            computationId:string,
            submitId:number
        }
        class DownloadResultsMenu extends React.Component<{},DownloadResultsMenuState>{
            state = {computationId:"",submitId:0}
    
            componentDidMount(){
                let params = CommonUtils.Router.getParameters();
                if(params!==null){
                    let computationId = params.computationId;
                    let submitId = params.submitId;
                    this.setState({computationId,submitId});
                }
    
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId((submitId)=>{
                    let state = this.state;
                    state.submitId = submitId;
                    this.setState(state);
                });
            }
            
            render(){
                let computationId = this.state.computationId;
                let submitId = `?submitId=${this.state.submitId}`;
                
                let linkBase = `${Config.DataSources.API_URL[Config.DataSources.MODE]}/Data/${computationId}${submitId}`;
                
                let items:JSX.Element[] = [];
            
                if(computationId!==void 0){
                    items.push(
                        <BootstrapDropDownMenuItem linkText="Molecule" link={`${linkBase}&format=molecule`} targetBlank={true} />
                    );
                    items.push(
                        <BootstrapDropDownMenuItem linkText="PyMol" link={`${linkBase}&format=pymol`} targetBlank={true} />
                    );
                    items.push(
                        <BootstrapDropDownMenuItem linkText="VMD" link={`${linkBase}&format=vmd`} targetBlank={true} />
                    );
                    items.push(
                        <BootstrapDropDownMenuItem linkText="PDB" link={`${linkBase}&format=pdb`} targetBlank={true} />
                    );
                    items.push(
                        <BootstrapDropDownMenuItem linkText="Chimera" link={`${linkBase}&format=chimera`} targetBlank={true} />
                    );
                    items.push(
                        <BootstrapDropDownMenuItem linkText="JSON" link={`${linkBase}`} targetBlank={true} />
                    );
                    items.push(
                        <BootstrapDropDownMenuItem linkText="Results" link={`${linkBase}&format=report`} targetBlank={true} />
                    );
                    items.push(
                        <DownloadPDFReportDropdownMenuItem linkText="PDF report" />
                    );
                }
                return <BootstrapDropDownMenuButton label="Download report" items={items} />
            }
        }*/
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
        let validationGroup = "SettingsFormValidatonGroup";
        ;
        function render(target) {
            ReactDOM.render(React.createElement(App, null), target);
        }
        UI.render = render;
        class App extends React.Component {
            constructor() {
                super(...arguments);
                this.state = {
                    app: this
                };
            }
            componentDidMount() {
                MoleOnlineWebUI.Bridge.Events.subscribeNewSubmit(() => {
                    this.forceUpdate();
                });
            }
            componentWillUnmount() {
            }
            render() {
                return (React.createElement(ControlTabs, null));
            }
        }
        UI.App = App;
        function onFocusReplaceDefaultValidationPopup(e, elemId) {
            let el = e.currentTarget;
            if (el.dataset["hasReplacedValidationPopup"] !== "true") {
                replaceDefaultValidationPopup(elemId);
                el.dataset["hasReplacedValidationPopup"] = "true";
            }
        }
        ;
        function replaceDefaultValidationPopup(id) {
            $(`#${id}`)[0]
                .addEventListener("invalid", (event) => {
                $(event.target).data("toggle", "popover");
                $(event.target).data("trigger", "manual");
                $(event.target).data("placement", "left");
                //$(event.target).data("container","body");
                $(event.target).data("content", event.target.validationMessage);
                $(event.target).popover("show");
                window.setTimeout(() => {
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
            window.setTimeout(() => {
                $(el).popover("hide");
                $(el).popover("destroy");
            }, 5000);
            $(el).focus();
        }
        //--
        class Cavity {
            constructor() {
                this.IgnoreHETAtoms = false;
                this.IgnoreHydrogens = false;
                this.InteriorThreshold = 1.1;
                this.ProbeRadius = 5;
            }
        }
        class Input {
            constructor() {
                this.ReadAllModels = false;
                this.SpecificChains = "";
            }
        }
        class Tunnel {
            constructor() {
                this.WeightFunction = "VoronoiScale";
                this.BottleneckRadius = 1.2;
                this.BottleneckTolerance = 3;
                this.MaxTunnelSimilarity = 0.7;
                this.OriginRadius = 5;
                this.SurfaceCoverRadius = 10;
                this.UseCustomExitsOnly = false;
            }
        }
        class Origin {
            constructor() {
                this.Points = null;
                this.Residues = null;
                this.QueryExpression = null;
            }
        }
        class MoleFormData {
            constructor(data) {
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
            setIgnoreHETATMs(value) {
                if (this.Cavity === null) {
                    this.Cavity = new Cavity();
                }
                this.Cavity.IgnoreHETAtoms = value;
            }
            getIgnoreHETATMs() {
                if (this.Cavity === null) {
                    return null;
                }
                return this.Cavity.IgnoreHETAtoms;
            }
            setIgnoreHydrogens(value) {
                if (this.Cavity === null) {
                    this.Cavity = new Cavity();
                }
                this.Cavity.IgnoreHydrogens = value;
            }
            getIgnoreHydrogens() {
                if (this.Cavity === null) {
                    return null;
                }
                return this.Cavity.IgnoreHydrogens;
            }
            setInteriorThreshold(value) {
                if (this.Cavity === null) {
                    this.Cavity = new Cavity();
                }
                this.Cavity.InteriorThreshold = value;
            }
            getInteriorThreshold() {
                if (this.Cavity === null) {
                    return null;
                }
                return this.Cavity.InteriorThreshold;
            }
            setProbeRadius(value) {
                if (this.Cavity === null) {
                    this.Cavity = new Cavity();
                }
                this.Cavity.ProbeRadius = value;
            }
            getProbeRadius() {
                if (this.Cavity === null) {
                    return null;
                }
                return this.Cavity.ProbeRadius;
            }
            setReadAllModels(value) {
                if (this.Input === null) {
                    this.Input = new Input();
                }
                this.Input.ReadAllModels = value;
            }
            getReadAllModels() {
                if (this.Input === null) {
                    return null;
                }
                return this.Input.ReadAllModels;
            }
            setSpecificChains(value) {
                if (this.Input === null) {
                    this.Input = new Input();
                }
                this.Input.SpecificChains = value;
            }
            getSpecificChains() {
                if (this.Input === null) {
                    return null;
                }
                return this.Input.SpecificChains;
            }
            setOriginRadius(value) {
                if (this.Tunnel === null) {
                    this.Tunnel = new Tunnel();
                }
                this.Tunnel.OriginRadius = value;
            }
            getOriginRadius() {
                if (this.Tunnel === null) {
                    return null;
                }
                return this.Tunnel.OriginRadius;
            }
            setSurfaceCoverRadius(value) {
                if (this.Tunnel === null) {
                    this.Tunnel = new Tunnel();
                }
                this.Tunnel.SurfaceCoverRadius = value;
            }
            getSurfaceCoverRadius() {
                if (this.Tunnel === null) {
                    return null;
                }
                return this.Tunnel.SurfaceCoverRadius;
            }
            setWeightFunction(value) {
                if (this.Tunnel === null) {
                    this.Tunnel = new Tunnel();
                }
                this.Tunnel.WeightFunction = value;
            }
            getWeightFunction() {
                if (this.Tunnel === null) {
                    return null;
                }
                return this.Tunnel.WeightFunction;
            }
            setBottleneckRadius(value) {
                if (this.Tunnel === null) {
                    this.Tunnel = new Tunnel();
                }
                this.Tunnel.BottleneckRadius = value;
            }
            getBottleneckRadius() {
                if (this.Tunnel === null) {
                    return null;
                }
                return this.Tunnel.BottleneckRadius;
            }
            setBottleneckTolerance(value) {
                if (this.Tunnel === null) {
                    this.Tunnel = new Tunnel();
                }
                this.Tunnel.BottleneckTolerance = value;
            }
            getBottleneckTollerance() {
                if (this.Tunnel === null) {
                    return null;
                }
                return this.Tunnel.BottleneckTolerance;
            }
            setMaxTunnelSimilarity(value) {
                if (this.Tunnel === null) {
                    this.Tunnel = new Tunnel();
                }
                this.Tunnel.MaxTunnelSimilarity = value;
            }
            getMaxTunnelSimilarity() {
                if (this.Tunnel === null) {
                    return null;
                }
                return this.Tunnel.MaxTunnelSimilarity;
            }
            setMergePores(value) {
                this.PoresMerged = value;
            }
            getMergePores() {
                return this.PoresMerged;
            }
            setAutomaticPores(value) {
                this.PoresAuto = value;
            }
            getAutomaticPores() {
                return this.PoresAuto;
            }
            setIgnoredResidues(value) {
                this.NonActiveResidues = value.slice();
            }
            getIgnoredResidues() {
                return this.NonActiveResidues;
            }
            setQueryFilter(value) {
                this.QueryFilter = value;
            }
            getQueryFilter() {
                return this.QueryFilter;
            }
            setPoints(value, isStart) {
                let points = [];
                let residues = [];
                let query = null;
                for (let p of value) {
                    switch (p.type) {
                        case "Point":
                            let point = p.value;
                            points.push({ X: Number(point.x), Y: Number(point.y), Z: Number(point.z.toString()) });
                            break;
                        case "Residue":
                            let rp = p;
                            rp.value;
                            residues.push(rp.value.map((val, idx, arr) => {
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
            }
            setStartingPoints(value) {
                this.setPoints(value, true);
            }
            setEndPoints(value) {
                this.setPoints(value, false);
            }
            getStartingPoints() {
                if (this.Origin === null) {
                    return [];
                }
                let result = [];
                if (this.Origin.Points !== null) {
                    result = result.concat(this.Origin.Points.map((val, idx, arr) => {
                        return {
                            type: "Point",
                            uiType: "3D Point",
                            value: new Common.Controls.FromLiteMol.Point(val.X.toString(), val.Y.toString(), val.Z.toString())
                        };
                    }));
                }
                if (this.Origin.Residues !== null) {
                    result = result.concat(this.Origin.Residues.map((val, idx, arr) => {
                        return {
                            type: "Residue",
                            uiType: "Residue List",
                            value: val.map((v, i, a) => {
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
            }
            getEndingPoints() {
                if (this.CustomExits === null) {
                    return [];
                }
                let result = [];
                if (this.CustomExits.Points !== null) {
                    result = result.concat(this.CustomExits.Points.map((val, idx, arr) => {
                        return {
                            type: "Point",
                            uiType: "3D Point",
                            value: new Common.Controls.FromLiteMol.Point(val.X.toString(), val.Y.toString(), val.Z.toString())
                        };
                    }));
                }
                if (this.CustomExits.Residues !== null) {
                    result = result.concat(this.CustomExits.Residues.map((val, idx, arr) => {
                        return {
                            type: "Residue",
                            uiType: "Residue List",
                            value: val.map((v, i, a) => {
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
            }
            //--
            getPackage() {
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
            }
        }
        class PoresFormData {
            constructor(data) {
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
            }
            setBetaStructure(value) {
                this.IsBetaBarel = value;
            }
            getBetaStructure() {
                return this.IsBetaBarel;
            }
            setMembraneRegion(value) {
                this.InMembrane = value;
            }
            getMembraneRegion() {
                return this.InMembrane;
            }
            setSpecificChains(value) {
                this.Chains = value;
            }
            getSpecificChains() {
                return this.Chains;
            }
            //--
            getPackage() {
                return {
                    Chains: this.Chains,
                    InMembrane: this.InMembrane,
                    IsBetaBarel: this.IsBetaBarel
                };
            }
        }
        ;
        class Settings extends React.Component {
            constructor() {
                super(...arguments);
                this.state = {
                    moleFormData: this.getMoleDefaultValues(),
                    poresFormData: this.getPoresDefaultValues(),
                    pdbid: this.props.initialData.PdbId,
                    computationId: this.props.initialData.ComputationId,
                    mode: "Mole",
                    expandedPanels: {
                        activeAtomsResidues: true,
                        activeAtomsResiduesAdvanced: false,
                        cavityParameters: false,
                        channelParameters: false,
                        channelParametersAdvanced: false,
                        selection: true
                    }
                };
            }
            getMoleDefaultValues() {
                let data = new MoleFormData();
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
            }
            getPoresDefaultValues() {
                let data = new PoresFormData();
                data.setBetaStructure(false);
                data.setMembraneRegion(false);
                //data.setSpecificChains("");
                return data;
            }
            handleSubmitPromise(promise) {
                promise
                    .then((result) => {
                    if (result.Status === "Error") {
                        let state = this.props.parent.state;
                        state.canSubmit = true;
                        this.props.parent.setState(state);
                        MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                            messageType: "Danger",
                            message: result.ErrorMsg
                        });
                    }
                    else {
                        CommonUtils.Router.fakeRedirect(result.ComputationId, String(result.SubmitId));
                        LiteMol.Example.Channels.State.removeChannelsData(MoleOnlineWebUI.Bridge.Instances.getPlugin());
                        Provider.get(result.ComputationId, ((compId, info) => {
                            MoleOnlineWebUI.DataProxy.JobStatus.Watcher.registerOnChangeHandler(result.ComputationId, result.SubmitId, (status) => {
                                if (checkCanSubmit(status.Status)) {
                                    MoleOnlineWebUI.Bridge.Events.invokeToggleLoadingScreen({
                                        message: "",
                                        visible: false
                                    });
                                    let state = this.props.parent.state;
                                    state.canSubmit = true;
                                    this.props.parent.setState(state);
                                }
                            }, (err) => {
                                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                    messageType: "Danger",
                                    message: "Job status cannot be tracked. Please try to refresh the page."
                                });
                            });
                            let state = this.props.parent.state;
                            state.data = info;
                            this.props.parent.setState(state);
                            MoleOnlineWebUI.Bridge.Events.invokeNewSubmit();
                            MoleOnlineWebUI.Bridge.Events.invokeChangeSubmitId(Number(result.SubmitId));
                            //CommonUtils.FormEvents.Events.invokeOnClear(`${validationGroup}/selection`);
                        }).bind(this), true);
                        /*MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                            messageType: "Success",
                            message: "Job was successfully submited."
                        })*/
                        MoleOnlineWebUI.Bridge.Events.invokeToggleLoadingScreen({
                            message: "Submited job in progress...",
                            visible: true
                        });
                    }
                })
                    .catch((err) => {
                    let state = this.props.parent.state;
                    state.canSubmit = true;
                    this.props.parent.setState(state);
                    if (Config.CommonOptions.DEBUG_MODE)
                        console.log(err);
                    MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                        messageType: "Danger",
                        message: "Job submit was not completed succesfully! Please try again later."
                    });
                });
            }
            componentDidMount() {
                CommonUtils.FormEvents.Events.attachOnSubmitEventHandler((formGroup) => {
                    if (formGroup !== validationGroup) {
                        return;
                    }
                    let promise;
                    if (this.state.mode === "Mole") {
                        promise = Service.ApiService.submitMoleJob(this.state.computationId, this.state.moleFormData.getPackage());
                    }
                    else {
                        promise = Service.ApiService.submitPoresJob(this.state.computationId, this.state.poresFormData.getPackage());
                    }
                    this.handleSubmitPromise(promise);
                });
                MoleOnlineWebUI.Bridge.Events.subscribeOnReSubmit((promise) => {
                    this.handleSubmitPromise(promise);
                });
                CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                    if (formGroup !== validationGroup) {
                        return;
                    }
                    Common.Controls.FromLiteMol.ValidationState.reset(validationGroup);
                    let s = this.state;
                    s.moleFormData = this.getMoleDefaultValues();
                    s.poresFormData = this.getPoresDefaultValues();
                    this.setState(s);
                });
                MoleOnlineWebUI.Bridge.Events.subscribeCopyParameters((params) => {
                    let s1 = this.props.parent.state;
                    this.props.parent.setState({
                        activeTabIdx: 0,
                        submitId: s1.submitId,
                        canSubmit: s1.canSubmit,
                        data: s1.data,
                        err: s1.err
                    }, () => {
                        this.setState({
                            computationId: this.state.computationId,
                            pdbid: this.state.pdbid,
                            moleFormData: this.state.moleFormData,
                            poresFormData: this.state.poresFormData,
                            mode: (params.mode === "mole") ? "Pores" : "Mole",
                            expandedPanels: this.state.expandedPanels
                        }, () => {
                            this.setState({
                                computationId: this.state.computationId,
                                pdbid: this.state.pdbid,
                                moleFormData: (params.mode === "mole" && params.moleConfig !== null) ? new MoleFormData(params.moleConfig) : this.getMoleDefaultValues(),
                                poresFormData: (params.mode === "pores" && params.poresConfig !== null) ? new PoresFormData(params.poresConfig) : this.getPoresDefaultValues(),
                                mode: (params.mode === "mole") ? "Mole" : "Pores",
                                expandedPanels: this.state.expandedPanels
                            });
                        });
                    });
                });
            }
            render() {
                let form = React.createElement("div", null);
                if (this.state.mode === "Mole") {
                    form = this.getMoleForm();
                }
                else if (this.state.mode === "Pores") {
                    form = this.getPoresForm();
                }
                return (React.createElement("div", null,
                    React.createElement("div", { className: "mode-switch-button-container" },
                        React.createElement("span", { className: "btn-sm btn-primary mode-switch", onClick: (e) => {
                                let state = this.state;
                                state.mode = (this.state.mode === "Mole") ? "Pores" : "Mole";
                                this.setState(state);
                            } },
                            "Switch to ",
                            (this.state.mode === "Mole") ? "Pores" : "Mole",
                            " calculation")),
                    form));
            }
            getPatternQueryHint() {
                return { link: "https://webchem.ncbr.muni.cz/Wiki/PatternQuery:UserManual", title: "See PatternQuery manual for help." };
            }
            getMoleForm() {
                if (this.state.moleFormData === null) {
                    return React.createElement("div", null);
                }
                let pdbid = this.state.pdbid;
                let data = this.state.moleFormData;
                return React.createElement("div", { className: "settings-form basic-settings" },
                    React.createElement("h3", null, "Mole"),
                    React.createElement(Common.Controls.FromLiteMol.LMControlWrapper, { controls: [
                            React.createElement(Common.Controls.FromLiteMol.ControlGroup, { label: "Active Atoms/Residues", tooltip: "", controls: [
                                    React.createElement(Common.Controls.FromLiteMol.CheckBox, { label: "Ignore HETATMs", defaultValue: valueOrDefault(data.getIgnoreHETATMs(), true), tooltip: TooltipText.get("ignoreAllHetatm"), onChange: (v) => {
                                            let s = this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setIgnoreHETATMs(v);
                                            }
                                        }, onMount: (control) => {
                                            (() => {
                                                CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                                                    if (formGroup !== validationGroup) {
                                                        return;
                                                    }
                                                    control.reset();
                                                });
                                            }).bind(control)();
                                        } }),
                                    React.createElement(Common.Controls.FromLiteMol.ControlGroup, { label: "Advanced options", tooltip: "", controls: [
                                            React.createElement(Common.Controls.FromLiteMol.CheckBox, { label: "Ignore Hydrogens", defaultValue: valueOrDefault(data.getIgnoreHydrogens(), false), tooltip: TooltipText.get("ignoreHydrogens"), onChange: (v) => {
                                                    let s = this.state;
                                                    if (s.moleFormData !== null) {
                                                        s.moleFormData.setIgnoreHydrogens(v);
                                                    }
                                                }, onMount: (control) => {
                                                    (() => {
                                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                                                            if (formGroup !== validationGroup) {
                                                                return;
                                                            }
                                                            control.reset();
                                                        });
                                                    }).bind(control)();
                                                } }),
                                            React.createElement(Common.Controls.FromLiteMol.TextBoxWithHelp, { label: "Query Filter", tooltip: TooltipText.get("queryFilter"), placeholder: "Residues('GOL')", hint: this.getPatternQueryHint(), defaultValue: valueOrDefault(data.getQueryFilter(), ""), onChange: (v) => {
                                                    let s = this.state;
                                                    if (s.moleFormData !== null) {
                                                        s.moleFormData.setQueryFilter(v);
                                                    }
                                                }, onMount: (control) => {
                                                    (() => {
                                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                                                            if (formGroup !== validationGroup) {
                                                                return;
                                                            }
                                                            control.reset();
                                                        });
                                                    }).bind(control)();
                                                }, validate: CommonUtils.Validators.validatePatternQuery, validationGroup: validationGroup }),
                                            React.createElement(Common.Controls.FromLiteMol.CheckBox, { label: "Read All Models", defaultValue: valueOrDefault(data.getReadAllModels(), false), tooltip: TooltipText.get("readAllModels"), onChange: (v) => {
                                                    let s = this.state;
                                                    if (s.moleFormData !== null) {
                                                        s.moleFormData.setReadAllModels(v);
                                                    }
                                                }, onMount: (control) => {
                                                    (() => {
                                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                                                            if (formGroup !== validationGroup) {
                                                                return;
                                                            }
                                                            control.reset();
                                                        });
                                                    }).bind(control)();
                                                } }),
                                            React.createElement(Common.Controls.FromLiteMol.TextBox, { label: "Ignored Residues", tooltip: TooltipText.get("nonActiveResidues"), placeholder: "A 69, A 386, ...", defaultValue: CommonUtils.Misc.flattenResidues(valueOrDefault(data.getIgnoredResidues(), "")), onChange: (v) => {
                                                    let s = this.state;
                                                    if (s.moleFormData !== null) {
                                                        s.moleFormData.setIgnoredResidues(CommonUtils.Misc.parseResidues(v));
                                                    }
                                                }, onMount: (control) => {
                                                    (() => {
                                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                                                            if (formGroup !== validationGroup) {
                                                                return;
                                                            }
                                                            control.reset();
                                                        });
                                                    }).bind(control)();
                                                }, validate: CommonUtils.Validators.validateResidueSimpleArray, validationGroup: validationGroup }),
                                            React.createElement(Common.Controls.FromLiteMol.TextBox, { label: "Specific Chains", tooltip: TooltipText.get("specificChains"), placeholder: "A, B, ...", defaultValue: valueOrDefault(data.getSpecificChains(), ""), onChange: (v) => {
                                                    let s = this.state;
                                                    if (s.moleFormData !== null) {
                                                        s.moleFormData.setSpecificChains(v);
                                                    }
                                                }, onMount: (control) => {
                                                    (() => {
                                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                                                            if (formGroup !== validationGroup) {
                                                                return;
                                                            }
                                                            control.reset();
                                                        });
                                                    }).bind(control)();
                                                }, validate: CommonUtils.Validators.validateChainsArray, validationGroup: validationGroup })
                                        ], expanded: this.state.expandedPanels.activeAtomsResiduesAdvanced, onChange: (e) => {
                                            let s = this.state;
                                            s.expandedPanels.activeAtomsResiduesAdvanced = e;
                                            this.setState(s);
                                        } }),
                                ], expanded: this.state.expandedPanels.activeAtomsResidues, onChange: (e) => {
                                    let s = this.state;
                                    s.expandedPanels.activeAtomsResidues = e;
                                    if (e === false) {
                                        s.expandedPanels.activeAtomsResiduesAdvanced = false;
                                    }
                                    this.setState(s);
                                } }),
                            React.createElement(Common.Controls.FromLiteMol.ControlGroup, { label: "Cavity Parameters", tooltip: "", controls: [
                                    React.createElement(Common.Controls.FromLiteMol.NumberBox, { label: "Probe Radius", tooltip: TooltipText.get("probeRadius"), min: 1.4, max: 45, defaultValue: valueOrDefault(data.getProbeRadius(), 5), step: 0.01, onChange: (v) => {
                                            let s = this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setProbeRadius(Number(v).valueOf());
                                            }
                                        }, onMount: (control) => {
                                            (() => {
                                                CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                                                    if (formGroup !== validationGroup) {
                                                        return;
                                                    }
                                                    control.reset();
                                                });
                                            }).bind(control)();
                                        } }),
                                    React.createElement(Common.Controls.FromLiteMol.NumberBox, { label: "Interior Treshold", tooltip: TooltipText.get("interiorTreshold"), min: 0.3, max: 3, defaultValue: valueOrDefault(data.getInteriorThreshold(), 1.1), step: 0.01, onChange: (v) => {
                                            let s = this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setInteriorThreshold(Number(v).valueOf());
                                            }
                                        }, onMount: (control) => {
                                            (() => {
                                                CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                                                    if (formGroup !== validationGroup) {
                                                        return;
                                                    }
                                                    control.reset();
                                                });
                                            }).bind(control)();
                                        } })
                                ], expanded: this.state.expandedPanels.cavityParameters, onChange: (e) => {
                                    let s = this.state;
                                    s.expandedPanels.cavityParameters = e;
                                    this.setState(s);
                                } }),
                            React.createElement(Common.Controls.FromLiteMol.ControlGroup, { label: "Channel Parameters", tooltip: "", controls: [
                                    React.createElement(Common.Controls.FromLiteMol.NumberBox, { label: "Origin Radius", tooltip: TooltipText.get("originRadius"), min: 0.1, max: 10, defaultValue: valueOrDefault(data.getOriginRadius(), 5), step: 0.05, onChange: (v) => {
                                            let s = this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setOriginRadius(Number(v).valueOf());
                                            }
                                        }, onMount: (control) => {
                                            (() => {
                                                CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                                                    if (formGroup !== validationGroup) {
                                                        return;
                                                    }
                                                    control.reset();
                                                });
                                            }).bind(control)();
                                        } }),
                                    React.createElement(Common.Controls.FromLiteMol.NumberBox, { label: "Surface Cover Radius", tooltip: TooltipText.get("surfaceCoverRadius"), min: 5, max: 20, defaultValue: valueOrDefault(data.getSurfaceCoverRadius(), 10), step: 0.5, onChange: (v) => {
                                            let s = this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setSurfaceCoverRadius(Number(v).valueOf());
                                            }
                                        }, onMount: (control) => {
                                            (() => {
                                                CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                                                    if (formGroup !== validationGroup) {
                                                        return;
                                                    }
                                                    control.reset();
                                                });
                                            }).bind(control)();
                                        } }),
                                    React.createElement(Common.Controls.FromLiteMol.ComboBox, { label: "Weight Function", tooltip: TooltipText.get("tunnelWeightFunction"), items: MoleOnlineWebUI.StaticData.WeightFunctions.get().map((val, idx, arr) => { return new Common.Controls.FromLiteMol.ComboBoxItem(val.value, val.label); }), selectedValue: valueOrDefault(data.getWeightFunction(), "VoronoiScale"), onChange: (v) => {
                                            let s = this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setWeightFunction(v);
                                            }
                                        }, onMount: (control) => {
                                            (() => {
                                                CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                                                    if (formGroup !== validationGroup) {
                                                        return;
                                                    }
                                                    control.reset();
                                                });
                                            }).bind(control)();
                                        } }),
                                    React.createElement(Common.Controls.FromLiteMol.CheckBox, { label: "Merge Pores", defaultValue: valueOrDefault(data.getMergePores(), false), tooltip: TooltipText.get("mergePores"), onChange: (v) => {
                                            let s = this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setMergePores(v);
                                            }
                                        }, onMount: (control) => {
                                            (() => {
                                                CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                                                    if (formGroup !== validationGroup) {
                                                        return;
                                                    }
                                                    control.reset();
                                                });
                                            }).bind(control)();
                                        } }),
                                    React.createElement(Common.Controls.FromLiteMol.CheckBox, { label: "Automatic Pores", defaultValue: valueOrDefault(data.getAutomaticPores(), false), tooltip: TooltipText.get("automaticPores"), onChange: (v) => {
                                            let s = this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setAutomaticPores(v);
                                            }
                                        }, onMount: (control) => {
                                            (() => {
                                                CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                                                    if (formGroup !== validationGroup) {
                                                        return;
                                                    }
                                                    control.reset();
                                                });
                                            }).bind(control)();
                                        } }),
                                    React.createElement(Common.Controls.FromLiteMol.ControlGroup, { label: "Advanced options", tooltip: "", controls: [
                                            React.createElement(Common.Controls.FromLiteMol.NumberBox, { label: "Bottleneck Radius", tooltip: TooltipText.get("bottleneckRadius"), min: 0, max: 5, defaultValue: valueOrDefault(data.getBottleneckRadius(), 1.2), step: 0.01, onChange: (v) => {
                                                    let s = this.state;
                                                    if (s.moleFormData !== null) {
                                                        s.moleFormData.setBottleneckRadius(Number(v).valueOf());
                                                    }
                                                }, onMount: (control) => {
                                                    (() => {
                                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                                                            if (formGroup !== validationGroup) {
                                                                return;
                                                            }
                                                            control.reset();
                                                        });
                                                    }).bind(control)();
                                                } }),
                                            React.createElement(Common.Controls.FromLiteMol.NumberBox, { label: "Bottleneck Tolerance", tooltip: TooltipText.get("bottleneckTolerance"), min: 0, max: 5, defaultValue: valueOrDefault(data.getBottleneckTollerance(), 3.0), step: 0.1, onChange: (v) => {
                                                    let s = this.state;
                                                    if (s.moleFormData !== null) {
                                                        s.moleFormData.setBottleneckTolerance(Number(v).valueOf());
                                                    }
                                                }, onMount: (control) => {
                                                    (() => {
                                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                                                            if (formGroup !== validationGroup) {
                                                                return;
                                                            }
                                                            control.reset();
                                                        });
                                                    }).bind(control)();
                                                } }),
                                            React.createElement(Common.Controls.FromLiteMol.NumberBox, { label: "Max Tunnel Similarity", tooltip: TooltipText.get("maxTunnelSimilarity"), min: 0, max: 1, defaultValue: valueOrDefault(data.getMaxTunnelSimilarity(), 0.7), step: 0.05, onChange: (v) => {
                                                    let s = this.state;
                                                    if (s.moleFormData !== null) {
                                                        s.moleFormData.setMaxTunnelSimilarity(Number(v));
                                                    }
                                                }, onMount: (control) => {
                                                    (() => {
                                                        CommonUtils.FormEvents.Events.attachOnClearEventHandler((formGroup) => {
                                                            if (formGroup !== validationGroup) {
                                                                return;
                                                            }
                                                            control.reset();
                                                        });
                                                    }).bind(control)();
                                                } })
                                        ], expanded: this.state.expandedPanels.channelParametersAdvanced, onChange: (e) => {
                                            let s = this.state;
                                            s.expandedPanels.channelParametersAdvanced = e;
                                            this.setState(s);
                                        } })
                                ], expanded: this.state.expandedPanels.channelParameters, onChange: (e) => {
                                    let s = this.state;
                                    s.expandedPanels.channelParameters = e;
                                    if (e === false) {
                                        s.expandedPanels.channelParametersAdvanced = false;
                                    }
                                    this.setState(s);
                                } }),
                            React.createElement(Common.Controls.FromLiteMol.ControlGroup, { label: "Selection", tooltip: "", controls: [
                                    React.createElement(Common.Controls.FromLiteMol.StartingPointBox, { label: "Starting Point", tooltip: TooltipText.get("startingPoint"), defaultItems: this.state.moleFormData.getStartingPoints(), noDataText: "No starting points selected...", onChange: (v) => {
                                            let s = this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setStartingPoints(v);
                                            }
                                        }, formGroup: validationGroup, extraClearGroup: `${validationGroup}/selection`, allowPatternQuery: true }),
                                    React.createElement(Common.Controls.FromLiteMol.StartingPointBox, { label: "End Point", tooltip: TooltipText.get("endPoint"), defaultItems: this.state.moleFormData.getEndingPoints(), noDataText: "No end points selected...", onChange: (v) => {
                                            let s = this.state;
                                            if (s.moleFormData !== null) {
                                                s.moleFormData.setEndPoints(v);
                                            }
                                        }, formGroup: validationGroup, extraClearGroup: `${validationGroup}/selection`, allowPatternQuery: false }),
                                ], expanded: this.state.expandedPanels.selection, onChange: (e) => {
                                    let s = this.state;
                                    s.expandedPanels.selection = e;
                                    this.setState(s);
                                } })
                        ] }));
            }
            getPoresForm() {
                if (this.state.poresFormData === null) {
                    return React.createElement("div", null);
                }
                let data = this.state.poresFormData;
                let chains = data.getSpecificChains();
                if (chains === null) {
                    chains = "";
                }
                let pdbid = this.state.pdbid;
                return React.createElement("div", { className: "settings-form basic-settings pores" },
                    React.createElement("h3", null, "Pores"),
                    React.createElement(Common.Controls.FromLiteMol.LMControlWrapper, { controls: [
                            React.createElement(Common.Controls.FromLiteMol.CheckBox, { label: "Beta Structure", defaultValue: data.getBetaStructure(), tooltip: TooltipText.get("poresIsBetaStructure"), onChange: (val) => {
                                    if (this.state.poresFormData !== null) {
                                        this.state.poresFormData.setBetaStructure(val);
                                    }
                                } }),
                            React.createElement(Common.Controls.FromLiteMol.CheckBox, { label: "Membrane Region", defaultValue: data.getMembraneRegion(), tooltip: TooltipText.get("poresInMembrane"), onChange: (val) => {
                                    if (this.state.poresFormData !== null) {
                                        this.state.poresFormData.setMembraneRegion(val);
                                    }
                                } }),
                            React.createElement(Common.Controls.FromLiteMol.TextBox, { label: "Specific Chains", defaultValue: chains, tooltip: TooltipText.get("poresChains"), placeholder: "A, B, ..." /*onValidate={this.validateChainsArray}*/, onChange: (val) => {
                                    if (this.state.poresFormData !== null) {
                                        this.state.poresFormData.setSpecificChains(val);
                                    }
                                } })
                        ] }));
            }
        }
        UI.Settings = Settings;
        function valueOrDefault(value, def) {
            return (value === null) ? def : value;
        }
        function getSubmissionIdx(compInfo, submitId) {
            for (let idx = 0; idx < compInfo.Submissions.length; idx++) {
                if (String(compInfo.Submissions[idx].SubmitId) === String(submitId)) {
                    return idx;
                }
            }
            return null;
        }
        ;
        ;
        class Submissions extends React.Component {
            constructor() {
                super(...arguments);
                this.state = { computationInfo: null, loading: true, channelsDBData: null };
                this.hasKillable = false;
            }
            componentWillReceiveProps(nextProps) {
                this.prepareSubmissionData(nextProps.computationInfo);
            }
            prepareSubmissionData(computationInfo) {
                let state_ = this.state;
                state_.computationInfo = computationInfo;
                this.setState(state_);
                let hasKillable = false;
                if (computationInfo.PdbId !== null && computationInfo.PdbId !== null) {
                    MoleOnlineWebUI.Cache.ChannelsDBData.doWhenCached(computationInfo.PdbId)
                        .then(() => {
                        MoleOnlineWebUI.Cache.ChannelsDBData.getChannelsData(computationInfo.PdbId)
                            .then(val => {
                            let s = this.state;
                            s.channelsDBData = val;
                            this.setState(s);
                        })
                            .catch(err => {
                            console.log(err);
                        });
                    })
                        .catch(err => {
                        console.log(err);
                    });
                }
                for (let submission of computationInfo.Submissions) {
                    if (submission.Status !== "Initializing" && submission.Status !== "Running") {
                        //Skip submission state check loop for submissions in stable and terminal state
                        continue;
                    }
                    hasKillable = true;
                    MoleOnlineWebUI.DataProxy.JobStatus.Watcher.registerOnChangeHandler(this.props.computationInfo.ComputationId, submission.SubmitId, (state) => {
                        let oldStatus = submission.Status;
                        if (oldStatus === void 0 || oldStatus !== state.Status) {
                            let s = this.state;
                            let currentCompInfo = s.computationInfo;
                            if (currentCompInfo === null) {
                                console.log(`Computation info was not initialized corectly.`);
                                return;
                            }
                            let subIdx = getSubmissionIdx(currentCompInfo, submission.SubmitId);
                            if (subIdx === null) {
                                console.log(`Submission with id'${submission.SubmitId}' not found.`);
                                return;
                            }
                            currentCompInfo.Submissions[subIdx].Status = state.Status;
                            s.computationInfo = currentCompInfo;
                            this.setState(s);
                            if (oldStatus !== void 0) {
                                let hasKillable_ = this.checkHasKillable(currentCompInfo);
                                if (this.hasKillable !== hasKillable_) {
                                    this.hasKillable = hasKillable_;
                                    MoleOnlineWebUI.Bridge.Events.invokeChangeHasKillable(hasKillable_);
                                }
                            }
                        }
                    }, (err) => {
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log(err);
                    });
                }
                this.hasKillable = hasKillable;
                let state = this.state;
                state.loading = false;
                this.setState(state);
                if (hasKillable) {
                    MoleOnlineWebUI.Bridge.Events.invokeChangeHasKillable(hasKillable);
                }
            }
            checkHasKillable(compInfo) {
                let hasKillable = false;
                for (let submission of compInfo.Submissions) {
                    if (submission.Status === "Running") {
                        hasKillable = true;
                        return hasKillable;
                    }
                }
                return hasKillable;
            }
            componentDidMount() {
                this.prepareSubmissionData(this.props.computationInfo);
            }
            render() {
                if (this.state.computationInfo !== null && !this.state.loading) {
                    let submissions = [];
                    let submissionsData = this.state.computationInfo.Submissions;
                    let submitId = 1;
                    let isChannelsDBSelected = false;
                    let params = CommonUtils.Router.getParameters();
                    if (params !== null) {
                        submitId = (params.isChannelsDB) ? -1 : params.submitId;
                        isChannelsDBSelected = params.isChannelsDB;
                    }
                    if (this.state.channelsDBData !== null) {
                        submissions.push(React.createElement(ChannelsDBSubmission, { pdbid: this.state.computationInfo.PdbId, isSelected: isChannelsDBSelected, computationId: this.props.computationInfo.ComputationId }));
                    }
                    for (let s of submissionsData.sort((a, b) => {
                        return a.SubmitId - b.SubmitId;
                    })) {
                        let stat = s.Status;
                        submissions.push(React.createElement(Submission, { data: s, currentSubmitId: submitId, computationId: this.props.computationInfo.ComputationId, status: (stat === void 0) ? "Unknown" : stat, onResubmit: this.props.onResubmit, onCopy: (submitId) => {
                                for (let submission of this.props.computationInfo.Submissions) {
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
            }
        }
        UI.Submissions = Submissions;
        /*
        function flattenResiduesArray(residuesArray:Service.MoleConfigResidue[][]):string{
            let rv = "";
            let idx=0;
            for(let array of residuesArray){
                if(idx>0){
                    rv = `${rv}, `;
                }
                rv = `${rv}[${flattenResidues(array)}]`;
                idx++;
            }
            return rv;
        }
    
        function flattenResidues(residues:Service.MoleConfigResidue[]):string{
            let rv = "";
            for(let r of residues){
                if(rv !== ""){
                    rv+=", ";
                }
                rv+=`${r.Chain} ${r.SequenceNumber}`;
            }
            return rv;
        }*/
        function checkCanKill(status) {
            let result = false;
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
            let result = false;
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
            let result = false;
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
        class Submission extends React.Component {
            componentDidMount() {
            }
            getMoleJob(data) {
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
            }
            getPoresJob(data) {
                return React.createElement("div", { className: "panel-body" },
                    "Beta Structure: ",
                    (data.PoresConfig.IsBetaBarel === void 0) ? "False" : (data.PoresConfig.IsBetaBarel) ? "True" : "False",
                    React.createElement("br", null),
                    "Membrane Region: ",
                    (data.PoresConfig.InMembrane === void 0) ? "False" : (data.PoresConfig.InMembrane) ? "True" : "False",
                    React.createElement("br", null),
                    "Specific Chains: ",
                    (data.PoresConfig.Chains === void 0) ? "" : data.PoresConfig.Chains,
                    React.createElement("br", null));
            }
            render() {
                let currentSubmitId = this.props.currentSubmitId;
                let data = this.props.data;
                //let canKill = checkCanKill(this.props.status as Service.ComputationStatus);
                //let canDelete = checkCanDelete(this.props.status as Service.ComputationStatus);
                let canResubmit = checkCanResubmit(this.props.status);
                let contents;
                if (CommonUtils.Misc.isMoleJob(data)) {
                    contents = this.getMoleJob(data);
                }
                else {
                    contents = this.getPoresJob(data);
                }
                return (React.createElement("div", { className: "panel panel-default" },
                    React.createElement("div", { className: "panel-heading" },
                        React.createElement("a", { "data-toggle": "collapse", href: `#submit-data-${data.SubmitId}`, onClick: (e) => {
                                if (e.currentTarget.attributes.getNamedItem('aria-expanded').value === 'true') {
                                    if (String(data.SubmitId) !== String(this.props.currentSubmitId)) {
                                        changeSubmitId(this.props.computationId, data.SubmitId);
                                    }
                                }
                            } },
                            React.createElement("h4", { className: "panel-title" },
                                "#",
                                data.SubmitId),
                            React.createElement("div", { className: "submission-state" },
                                "Status: ",
                                React.createElement("span", { className: `state-${this.props.status}` }, this.props.status)))),
                    React.createElement("div", { id: `submit-data-${data.SubmitId}`, className: `panel-collapse collapse${(currentSubmitId.toString() === data.SubmitId.toString()) ? ' in' : ''}` },
                        contents,
                        React.createElement("div", { className: "panel-footer" },
                            React.createElement("span", { className: "btn btn-xs btn-primary", onClick: (() => this.copyParams(data.SubmitId)).bind(this) }, "Copy"),
                            React.createElement("span", { className: "btn btn-xs btn-primary", disabled: !canResubmit, onClick: (() => this.reSubmit()).bind(this) }, "Resubmit")))));
            }
            reSubmit() {
                if (CommonUtils.Misc.isMoleJob(this.props.data)) {
                    MoleOnlineWebUI.Bridge.Events.invokeOnReSubmit(Service.ApiService.submitMoleJob(this.props.computationId, this.props.data.MoleConfig));
                }
                else {
                    MoleOnlineWebUI.Bridge.Events.invokeOnReSubmit(Service.ApiService.submitPoresJob(this.props.computationId, this.props.data.PoresConfig));
                }
            }
            copyParams(submitId) {
                if (this.props.onCopy !== void 0) {
                    this.props.onCopy(submitId);
                }
            }
        }
        UI.Submission = Submission;
        class ChannelsDBSubmission extends React.Component {
            componentDidMount() {
            }
            render() {
                let isSelected = this.props.isSelected;
                let link = `${Config.CommonOptions.CHANNELSDB_LINK_DETAIL_URL}/${this.props.pdbid}`;
                let contents = React.createElement("div", { className: "panel-body" },
                    "See ",
                    React.createElement("a", { target: "_blank", href: link }, link),
                    " for more info.");
                return (React.createElement("div", { className: "panel panel-default" },
                    React.createElement("div", { className: "panel-heading" },
                        React.createElement("a", { "data-toggle": "collapse", href: `#submit-data-ChannelsDB`, onClick: (e) => {
                                if (e.currentTarget.attributes.getNamedItem('aria-expanded').value === 'true') {
                                    if (!this.props.isSelected) {
                                        changeSubmitId(this.props.computationId, -1);
                                    }
                                }
                            } },
                            React.createElement("h4", { className: "panel-title" }, "#ChannelsDB"),
                            React.createElement("div", { className: "submission-state" }))),
                    React.createElement("div", { id: `submit-data-ChannelsDB`, className: `panel-collapse collapse${(isSelected) ? ' in' : ''}` }, contents)));
            }
        }
        UI.ChannelsDBSubmission = ChannelsDBSubmission;
        function changeSubmitId(computationId, submitId) {
            if (submitId === -1) {
                CommonUtils.Router.fakeRedirect(computationId, "ChannelsDB");
            }
            else {
                CommonUtils.Router.fakeRedirect(computationId, (submitId > 0) ? String(submitId) : void 0);
            }
            LiteMol.Example.Channels.State.removeChannelsData(MoleOnlineWebUI.Bridge.Instances.getPlugin());
            MoleOnlineWebUI.Bridge.Events.invokeChangeSubmitId(submitId);
        }
        ;
        class ControlTabs extends React.Component {
            constructor() {
                super(...arguments);
                this.state = {
                    activeTabIdx: 0,
                    data: void 0,
                    err: void 0,
                    submitId: 1,
                    canSubmit: true
                };
            }
            componentDidMount() {
                if (this.props.activeTab !== void 0) {
                    let state = this.state;
                    state.activeTabIdx = this.props.activeTab;
                    this.setState(state);
                }
                let parameters = CommonUtils.Router.getParameters();
                if (parameters !== null) {
                    let compId = parameters.computationId;
                    let submitId = parameters.submitId;
                    Provider.get(parameters.computationId, ((compId, info) => {
                        //CompInfo => Status==="Error" => Submissions neexistuje! Response ma format /Status na misto /CompInfo
                        if (info === null) {
                            return;
                        }
                        let state = this.state;
                        state.data = info;
                        state.submitId = submitId;
                        this.setState(state);
                    }).bind(this));
                }
                else {
                    let state = this.state;
                    state.err = "Parameters from url cannot be properly processed.";
                    this.setState(state);
                }
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId((submitId) => {
                    let state = this.state;
                    state.submitId = submitId;
                    this.setState(state);
                });
                Common.Controls.FromLiteMol.ValidationState.attachOnStateChangeHandler(validationGroup, (prev, curr) => {
                    let s = this.state;
                    if (curr !== "VALID") {
                        $("#submission-form").find("input[type=submit]").attr("disabled", true);
                        s.canSubmit = false;
                    }
                    else {
                        s.canSubmit = true;
                    }
                    this.setState(s);
                });
            }
            nullIfEmpty(data) {
                if (data.length === 1 && data[0].length === 0) {
                    return null;
                }
                return data;
            }
            handleSubmit(e) {
                e.preventDefault();
                /*
                if(!this.state.canSubmit){
                    MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                        messageType: "Danger",
                        message: "Only one running submission is alowed. Please wait until completed."
                    })
                    return false;
                }
                */
                $(e.target).find("input[type=submit]").attr("disabled", true);
                let currentState = this.state;
                currentState.canSubmit = false;
                this.setState(currentState);
                if (this.state.data === void 0) {
                    return;
                }
                CommonUtils.FormEvents.Events.invokeOnSubmit(validationGroup);
            }
            render() {
                let tabs = [];
                if (this.state.data !== void 0) {
                    tabs.push(React.createElement(Settings, { initialData: this.state.data, parent: this, submitId: this.state.submitId }));
                    tabs.push(React.createElement(Submissions, { computationInfo: this.state.data, onResubmit: (info) => {
                            let state = this.state;
                            state.data = info;
                            this.setState(state);
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
                    React.createElement(Common.Tabs.BootstrapTabs.TabbedContainer, { header: ["Submission settings", "Submissions"], tabContents: tabs, namespace: "right-panel-tabs-", htmlClassName: "tabs", htmlId: "right-panel-tabs", activeTab: this.state.activeTabIdx, onChange: ((tabIdx) => {
                            let s = this.state;
                            s.activeTabIdx = tabIdx;
                            this.setState(s);
                        }).bind(this) }),
                    React.createElement("form", { className: "form-horizontal", id: "submission-form", onSubmit: this.handleSubmit.bind(this) },
                        React.createElement(ControlButtons, { submitId: this.state.submitId, computationInfo: this.state.data })),
                    React.createElement("div", { id: "right-panel-toggler", className: "toggler glyphicon glyphicon-resize-vertical" })));
            }
        }
        UI.ControlTabs = ControlTabs;
        class ControlButtons extends React.Component {
            constructor() {
                super(...arguments);
                this.state = { submitId: -1, hasKillable: false, canSubmit: true };
            }
            componentDidMount() {
                this.state.submitId = this.props.submitId;
                MoleOnlineWebUI.Bridge.Events.subscribeChangeHasKillable((hasKillable) => {
                    let state = this.state;
                    state.hasKillable = hasKillable;
                    this.setState(state);
                });
            }
            componentWillReceiveProps(nextProps) {
                let state = this.state;
                state.submitId = nextProps.submitId;
                this.setState(state);
            }
            getSubmissions() {
                let submissions = [];
                if (this.props.computationInfo !== void 0) {
                    submissions = this.sortSubmissions(this.props.computationInfo.Submissions);
                }
                return submissions;
            }
            sortSubmissions(items) {
                return items.sort((a, b) => {
                    return a.SubmitId - b.SubmitId;
                });
            }
            prepareSubmissionItems() {
                let submissions = this.getSubmissions();
                let rv = [];
                rv.push({
                    label: `-`,
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
                for (let item of submissions) {
                    rv.push({
                        label: `${item.SubmitId}`,
                        value: `${item.SubmitId}`
                    });
                }
                return rv;
            }
            getSelectedIndex(submitId, items) {
                for (let idx = 0; idx < items.length; idx++) {
                    let item = items[idx];
                    if (item.value === `${submitId}`) {
                        return idx;
                    }
                }
                return void 0;
            }
            onSubmitIdComboSelectChange(e) {
                if (this.props.computationInfo === void 0) {
                    return;
                }
                let idx = e.currentTarget.selectedIndex;
                let submitId = e.currentTarget.options[idx].value;
                let sid = Number(submitId).valueOf();
                changeSubmitId(this.props.computationInfo.ComputationId, sid);
                let state = this.state;
                state.submitId = sid;
                this.setState(state);
            }
            changeSubmitIdByStep(e) {
                if (this.props.computationInfo === void 0) {
                    return;
                }
                let submitId = e.currentTarget.dataset["value"];
                if (submitId !== void 0) {
                    let sid = Number(submitId).valueOf();
                    changeSubmitId(this.props.computationInfo.ComputationId, sid);
                    let state = this.state;
                    state.submitId = sid;
                    this.setState(state);
                }
            }
            canShift(left) {
                if (this.props.computationInfo === void 0) {
                    return false;
                }
                if (String(this.state.submitId) === String(0)) {
                    return false;
                }
                let submissions = this.getSubmissions();
                for (let idx = 0; idx < submissions.length; idx++) {
                    if (String(submissions[idx].SubmitId) === String(this.props.submitId)) {
                        let nextIdx = idx + ((left) ? -1 : 1);
                        if (nextIdx < 0 || nextIdx >= submissions.length) {
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                }
                return false;
            }
            canShiftNext() {
                return this.canShift(false);
            }
            canShiftPrev() {
                return this.canShift(true);
            }
            getNextIdx(idx) {
                return idx + 1;
            }
            getPrevIdx(idx) {
                return idx - 1;
            }
            render() {
                let canKill = (this.props.computationInfo !== void 0 && this.state.hasKillable);
                let items = this.prepareSubmissionItems();
                let idx = this.getSelectedIndex(this.state.submitId, items);
                let canShiftPrev = this.canShiftPrev();
                let canShiftNext = this.canShiftNext();
                return React.createElement("div", { className: "submit-parent" },
                    React.createElement("input", { className: "btn btn-primary submit", type: "submit", value: "Submit" }),
                    React.createElement("input", { type: "button", className: "btn btn-primary kill-job-button", disabled: !canKill, onClick: (e => {
                            if ($(e.currentTarget).attr("disabled") !== "disabled") {
                                $('#killJobDialog').modal('show');
                                $(".chdb-panel.right-panel").addClass("has-modal");
                            }
                        }), value: "Kill" }),
                    React.createElement("input", { type: "button", className: "btn btn-primary delete-project-button", "data-toggle": "modal", "data-target": "#deleteProjectDialog", onClick: (e => {
                            e.preventDefault();
                            $(".chdb-panel.right-panel").addClass("has-modal");
                            return false;
                        }), value: "Delete" }),
                    React.createElement("input", { className: "btn btn-primary clear-button", type: "button", value: "Clear", onClick: () => {
                            CommonUtils.FormEvents.Events.invokeOnClear(validationGroup);
                        } }),
                    React.createElement("input", { className: "btn btn-primary submit-arrow", type: "button", value: ">", disabled: (!canShiftNext) ? true : void 0, "data-value": (!canShiftNext || idx === void 0) ? void 0 : items[this.getNextIdx(idx)].value, onClick: this.changeSubmitIdByStep.bind(this) }),
                    React.createElement(Common.Controls.SimpleComboBox, { id: "submissionComboSwitch", items: items, defaultSelectedIndex: idx, className: "form-control submit-combo", onSelectedChange: this.onSubmitIdComboSelectChange.bind(this) }),
                    React.createElement("input", { className: "btn btn-primary submit-arrow", type: "button", value: "<", disabled: (!canShiftPrev) ? true : void 0, "data-value": (!canShiftPrev || idx == void 0) ? void 0 : items[this.getPrevIdx(idx)].value, onClick: this.changeSubmitIdByStep.bind(this) }),
                    React.createElement(ModalDialog, { id: "killJobDialog", header: "Do you really want to kill running job?", body: this.prepareKillJobDialogBody() }),
                    React.createElement(ModalDialog, { id: "deleteProjectDialog", header: "Do you really want to delete whole computation project?", body: this.prepareDeleteDialogBody() }));
            }
            prepareKillJobDialogBody() {
                return (React.createElement("div", null,
                    React.createElement("button", { className: "btn btn-primary left-button", onClick: (e) => {
                            e.preventDefault();
                            if (this.props.computationInfo === void 0) {
                                return false;
                            }
                            Service.ApiService.killRunningJob(this.props.computationInfo.ComputationId).then((result) => {
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
                                .catch((err) => {
                                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                    message: "Attempt to kill running job failed! Please try again later.",
                                    messageType: "Danger"
                                });
                            });
                            return false;
                        }, "data-dismiss": "modal" }, "Yes"),
                    React.createElement("button", { className: "btn btn-primary right-button", "data-dismiss": "modal" }, "No")));
            }
            prepareDeleteDialogBody() {
                return (React.createElement("div", null,
                    React.createElement("button", { className: "btn btn-primary left-button", onClick: (e) => {
                            e.preventDefault();
                            if (this.props.computationInfo === void 0) {
                                return false;
                            }
                            Service.ApiService.deleteProject(this.props.computationInfo.ComputationId).then(() => {
                                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                    message: "Current computation was succesfuly deleted. You will be redirected to initial page.",
                                    messageType: "Success"
                                });
                                window.setTimeout(() => {
                                    SimpleRouter.GlobalRouter.redirect(Config.Routing.ROUTING_OPTIONS[Config.Routing.ROUTING_MODE].defaultContextPath);
                                }, 5000);
                            })
                                .catch((err) => {
                                MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                                    message: "Attempt to delete current computation failed! Please try again later.",
                                    messageType: "Danger"
                                });
                            });
                            return false;
                        }, "data-dismiss": "modal" }, "Yes"),
                    React.createElement("button", { className: "btn btn-primary right-button", "data-dismiss": "modal" }, "No")));
            }
        }
        UI.ControlButtons = ControlButtons;
        class ModalDialog extends React.Component {
            render() {
                return React.createElement("div", { id: this.props.id, className: "modal fade", role: "dialog" },
                    React.createElement("div", { className: "modal-dialog" },
                        React.createElement("div", { className: "modal-content" },
                            React.createElement("div", { className: "modal-header" },
                                React.createElement("button", { type: "button", className: "close", "data-dismiss": "modal" }, "\u00D7"),
                                React.createElement("h4", { className: "modal-title" }, this.props.header)),
                            React.createElement("div", { className: "modal-body" }, this.props.body),
                            React.createElement("div", { className: "modal-footer" },
                                React.createElement("button", { type: "button", className: "btn btn-default", "data-dismiss": "modal", onClick: () => {
                                        $(".chdb-panel.right-panel").removeClass("has-modal");
                                    } }, "Close")))));
            }
        }
    })(UI = Controls.UI || (Controls.UI = {}));
})(Controls || (Controls = {}));
var DownloadReport;
(function (DownloadReport) {
    var UI;
    (function (UI) {
        var React = LiteMol.Plugin.React;
        ;
        function render(target) {
            LiteMol.Plugin.ReactDOM.render(React.createElement(App, null), target);
        }
        UI.render = render;
        class App extends React.Component {
            componentDidMount() {
            }
            componentWillUnmount() {
            }
            render() {
                return React.createElement("div", null,
                    React.createElement(DownloadResultsMenu, null));
            }
        }
        UI.App = App;
        class BootstrapDropDownMenuItem extends React.Component {
            render() {
                if (this.props.onClick !== void 0) {
                    return (React.createElement("li", null,
                        React.createElement("a", { onClick: this.props.onClick }, this.props.linkText)));
                }
                else {
                    return (React.createElement("li", null,
                        React.createElement("a", { target: (this.props.targetBlank) ? "_blank" : "", href: this.props.link }, this.props.linkText)));
                }
            }
        }
        class BootstrapDropDownMenuElementItem extends React.Component {
            render() {
                if (this.props.onClick !== void 0) {
                    return (React.createElement("li", null,
                        React.createElement("a", { onClick: this.props.onClick }, this.props.linkElement)));
                }
                else {
                    return (React.createElement("li", null,
                        React.createElement("a", { target: (this.props.targetBlank) ? "_blank" : "", href: this.props.link }, this.props.linkElement)));
                }
            }
        }
        class BootstrapDropDownMenuButton extends React.Component {
            render() {
                return React.createElement("div", { className: "btn-group dropdown" },
                    React.createElement("button", { type: "button", className: "download dropdown-toggle", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false" },
                        this.props.label,
                        " ",
                        React.createElement("span", { className: "glyphicon glyphicon-download" })),
                    React.createElement("ul", { className: "dropdown-menu" }, this.props.items));
            }
        }
        class DownloadResultsMenu extends React.Component {
            constructor() {
                super(...arguments);
                this.state = { computationId: "", submitId: 0 };
            }
            componentDidMount() {
                let params = CommonUtils.Router.getParameters();
                if (params !== null) {
                    let computationId = params.computationId;
                    let submitId = params.submitId;
                    this.setState({ computationId, submitId });
                }
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId((submitId) => {
                    let state = this.state;
                    state.submitId = submitId;
                    this.setState(state);
                });
            }
            render() {
                let computationId = this.state.computationId;
                let submitId = `?submitId=${this.state.submitId}`;
                let linkBase = `${Config.DataSources.API_URL[Config.DataSources.MODE]}/Data/${computationId}${submitId}`;
                let items = [];
                if (computationId !== void 0) {
                    items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "Molecule", link: `${linkBase}&format=molecule`, targetBlank: true }));
                    items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "PyMol", link: `${linkBase}&format=pymol`, targetBlank: true }));
                    items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "VMD", link: `${linkBase}&format=vmd`, targetBlank: true }));
                    items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "PDB", link: `${linkBase}&format=pdb`, targetBlank: true }));
                    items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "Chimera", link: `${linkBase}&format=chimera`, targetBlank: true }));
                    items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "JSON", link: `${linkBase}`, targetBlank: true }));
                    items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "Results", link: `${linkBase}&format=report`, targetBlank: true }));
                    items.push(React.createElement(BootstrapDropDownMenuItem, { linkText: "PDF report", onClick: () => { MoleOnlineWebUI.Bridge.Events.invokeRunPDFReport(); } }));
                }
                return React.createElement(BootstrapDropDownMenuButton, { label: "Download report", items: items });
            }
        }
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
        class App extends React.Component {
            constructor() {
                super(...arguments);
                this.state = { pdbid: void 0, err: void 0 };
            }
            componentDidMount() {
                let params = CommonUtils.Router.getParameters();
                if (params === null) {
                    this.setState({ err: "!!!" });
                    return;
                }
                MoleOnlineWebUI.Service.MoleAPI.ApiService.getComputationInfoList(params.computationId).then((res) => {
                    this.setState({ pdbid: res.PdbId });
                })
                    .catch(err => {
                    this.setState({ err: "<Error>" });
                });
            }
            componentWillUnmount() {
            }
            render() {
                if (this.state.pdbid === void 0) {
                    return React.createElement("div", null, (this.state.err === void 0) ? "..." : this.state.err);
                }
                return React.createElement("div", null,
                    React.createElement("a", { href: `https://pdbe.org/${this.state.pdbid}`, target: "_blank" },
                        this.state.pdbid,
                        " ",
                        React.createElement("span", { className: "glyphicon glyphicon-new-window href-ico" })));
            }
        }
        UI.App = App;
    })(UI = PdbIdSign.UI || (PdbIdSign.UI = {}));
})(PdbIdSign || (PdbIdSign = {}));
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
        class App extends React.Component {
            constructor() {
                super(...arguments);
                this.state = {
                    data: null,
                    minimized: false
                };
            }
            componentDidMount() {
                MoleOnlineWebUI.Bridge.Events.subscribeProteinDataLoaded((data) => {
                    this.setState({
                        data,
                        minimized: this.state.minimized
                    });
                });
            }
            componentWillUnmount() {
            }
            render() {
                return React.createElement("div", { className: (this.state.minimized) ? "minimized" : "" },
                    React.createElement(Header, { onClick: () => {
                            let s = this.state;
                            let newMinimized = !s.minimized;
                            s.minimized = newMinimized;
                            this.setState(s);
                            MoleOnlineWebUI.Bridge.Events.invokeOnSequneceViewerToggle({ minimized: newMinimized });
                        } }),
                    React.createElement("div", { className: "seq-container" }, (this.state.data === null) ? React.createElement("div", { className: "seq-waiting-for-data" }, "Waiting for protein data...") : React.createElement(Sequence, { data: this.state.data })));
            }
        }
        UI.App = App;
        class Header extends React.Component {
            render() {
                return React.createElement("div", { className: "sequence-viewer-header", onClick: this.props.onClick },
                    "Protein Sequence ",
                    React.createElement("span", { className: "glyphicon glyphicon-resize-vertical" }));
            }
        }
        ;
        class Sequence extends React.Component {
            groupByChains(data) {
                let groups = new Map();
                for (let chIdx = 0; chIdx < data.data.chains.count; chIdx++) {
                    let currentBounds = {
                        start: data.data.chains.residueStartIndex[chIdx],
                        end: data.data.chains.residueEndIndex[chIdx]
                    };
                    let currentName = data.data.chains.authAsymId[chIdx];
                    let bounds = groups.get(currentName);
                    if (bounds === void 0) {
                        bounds = [];
                    }
                    bounds.push(currentBounds);
                    groups.set(currentName, bounds);
                }
                return groups;
            }
            getAllHETResiduesIdxes(data) {
                let rv = [];
                for (let idx = 0; idx < data.data.residues.count; idx++) {
                    if (data.data.residues.isHet[idx] === 1 && data.data.residues.authName[idx] !== "HOH") {
                        rv.push(idx);
                    }
                }
                return rv;
            }
            render() {
                let chains = [];
                let chainGroups = this.groupByChains(this.props.data);
                chainGroups.forEach((val, key, map) => {
                    chains.push(React.createElement(Chain, { chainName: key, chainBounds: val, data: this.props.data }));
                });
                let hetResidues = this.getAllHETResiduesIdxes(this.props.data);
                if (hetResidues.length > 0) {
                    chains.push(React.createElement(HETChain, { idxes: hetResidues, data: this.props.data }));
                }
                return React.createElement("div", null, chains);
            }
        }
        class Chain extends React.Component {
            render() {
                let seqResidues = [];
                let lastSeqNumber = -1;
                for (let bounds of this.props.chainBounds) {
                    let seqNumberShowCounter = 0;
                    for (let idx = bounds.start.valueOf(); idx < bounds.end.valueOf(); idx++) {
                        let residueName = this.props.data.data.residues.authName[idx];
                        let chainName = this.props.data.data.residues.authAsymId[idx];
                        let isHet = this.props.data.data.residues.isHet[idx] === 1;
                        if (residueName === "HOH" || isHet === true) {
                            continue;
                        }
                        let seqLetter = CommonUtils.Residues.getSequenceLetterByName(residueName);
                        let seqNumber = this.props.data.data.residues.authSeqNumber[idx];
                        let nextSeqNumber = (idx + 1 < bounds.end.valueOf()) ? this.props.data.data.residues.authSeqNumber[idx + 1] : -1;
                        let showSeqNumber = String(seqNumber) !== String(lastSeqNumber + 1);
                        let nextShowSeqNumber = String(nextSeqNumber) !== String(seqNumber.valueOf() + 1);
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
            }
        }
        class HETChain extends React.Component {
            render() {
                let seqResidues = [];
                let lastSeqNumber = -1;
                for (let idx = 0; idx < this.props.idxes.length; idx++) {
                    let residueName = this.props.data.data.residues.authName[this.props.idxes[idx]];
                    let chainName = this.props.data.data.residues.authAsymId[this.props.idxes[idx]];
                    let isHet = this.props.data.data.residues.isHet[this.props.idxes[idx]] === 1;
                    if (residueName === "HOH") {
                        continue;
                    }
                    let seqLetter = residueName;
                    let seqNumber = this.props.data.data.residues.authSeqNumber[this.props.idxes[idx]];
                    let showSeqNumber = String(seqNumber) !== String(lastSeqNumber + 1);
                    lastSeqNumber = seqNumber.valueOf();
                    seqResidues.push(React.createElement(SeqResidue, { residueName: residueName, chainName: chainName, seqLetter: seqLetter, seqNumber: seqNumber, showSeqNumber: showSeqNumber, isHET: true }));
                }
                if (seqResidues.length === 0) {
                    return React.createElement("div", null);
                }
                return React.createElement("div", { className: "seq-chain" },
                    React.createElement("div", { className: "seq-header" }, "HET"),
                    React.createElement("div", { className: "seq-content" }, seqResidues));
            }
        }
        class SeqResidue extends React.Component {
            constructor() {
                super(...arguments);
                this.state = { selected: false };
            }
            shouldComponentUpdate(nextProps, nextState) {
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
            }
            componentDidMount() {
                CommonUtils.Selection.SelectionHelper.attachOnClearSelectionHandler(() => {
                    if (this.state.selected) {
                        this.setState({ selected: false });
                    }
                });
                CommonUtils.Selection.SelectionHelper.attachOnResidueBulkSelectHandler(residues => {
                    let futureSelected = residues.some((val, idx, arr) => {
                        return val.authSeqNumber === this.props.seqNumber && val.chain.authAsymId === this.props.chainName;
                    });
                    if (futureSelected !== this.state.selected) {
                        this.setState({
                            selected: futureSelected
                        });
                    }
                });
            }
            render() {
                return React.createElement("div", { className: `seq-residue${(this.props.isHET) ? ' het' : ''}` },
                    React.createElement("div", { className: "seq-number" }, (this.props.showSeqNumber) ? this.props.seqNumber : ""),
                    React.createElement("div", { className: `seq-letter${(this.state.selected) ? " selected" : ""}`, onMouseDown: (e) => {
                            CommonUtils.Selection.SelectionHelper.addResidueToSelection(this.props.seqNumber.valueOf(), this.props.chainName.valueOf());
                        }, onMouseMove: (e) => {
                            highlightResiude(this.props.seqNumber, this.props.chainName.valueOf(), true);
                        }, onMouseOut: (e) => {
                            highlightResiude(this.props.seqNumber, this.props.chainName.valueOf(), false);
                        }, title: `${this.props.residueName} ${this.props.chainName} ${this.props.seqNumber}` }, this.props.seqLetter));
            }
        }
        function clearSelection() {
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            CommonUtils.Selection.SelectionHelper.clearSelection(plugin);
        }
        function highlightResiude(seqNumber, chain, isOn) {
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            let model = plugin.selectEntities("polymer-visual")[0];
            let query = LiteMol.Core.Structure.Query.residuesById(seqNumber.valueOf()).intersectWith(LiteMol.Core.Structure.Query.chainsById(chain));
            LiteMol.Bootstrap.Command.Molecule.Highlight.dispatch(plugin.context, { model, query, isOn });
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
        class App extends React.Component {
            constructor() {
                super(...arguments);
                this.state = {
                    annotationFormVisible: false,
                    computationId: void 0,
                    submitId: void 0
                };
            }
            changeParams(submitId) {
                let params = CommonUtils.Router.getParameters();
                if (params !== null) {
                    this.setState({
                        computationId: params.computationId,
                        submitId: (submitId === void 0) ? params.submitId : submitId,
                        annotationFormVisible: this.state.annotationFormVisible
                    });
                }
            }
            componentDidMount() {
                this.changeParams();
                MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId((submitId) => {
                    this.changeParams(submitId);
                });
            }
            componentWillUnmount() {
            }
            render() {
                let computationId = this.state.computationId;
                let submitId = this.state.submitId;
                if (computationId === void 0 || submitId === void 0) {
                    return React.createElement("div", null);
                }
                return React.createElement("div", null,
                    React.createElement(AnnotateButton, { app: this, canAnnotate: this.state.computationId !== void 0 && this.state.submitId !== void 0 }),
                    React.createElement(AnnotateForm, { app: this, visible: this.state.annotationFormVisible, computationId: computationId, submitId: submitId }));
            }
        }
        UI.App = App;
        class AnnotateButton extends React.Component {
            componentDidMount() {
            }
            render() {
                if (this.props.canAnnotate) {
                    return React.createElement("div", { className: "annotate-button", onClick: (e) => {
                            const oldState = this.props.app.state;
                            oldState.annotationFormVisible = true;
                            this.props.app.setState(oldState);
                        } },
                        "Annotate ",
                        React.createElement("span", { className: "glyphicon glyphicon-edit" }));
                }
                else {
                    return React.createElement("div", null, "...");
                }
            }
        }
        class Events {
            static attachOnClearEventHandler(h) {
                this.handlers.push(h);
            }
            static invokeOnClear() {
                for (let h of this.handlers) {
                    h();
                }
            }
        }
        Events.handlers = [];
        class AnnotateForm extends React.Component {
            constructor() {
                super(...arguments);
                this.state = {
                    data: null,
                    mailValid: true,
                    errorMsg: void 0,
                    infoMsg: void 0
                };
            }
            componentDidMount() {
                this.resetData();
            }
            getDefaultWorkingItem() {
                return {
                    CompId: this.props.computationId,
                    SubmitId: this.props.submitId,
                    Email: "",
                    Message: "",
                    ResidueAnnotations: [],
                    TunnelAnnotations: []
                };
            }
            resetData() {
                const s = this.state;
                s.data = this.getDefaultWorkingItem();
                this.setState(s);
            }
            componentWillReceiveProps(newProps) {
                if (this.props.visible != newProps.visible) {
                    this.resetData();
                }
            }
            canSubmit() {
                let data = this.state.data;
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
            }
            submit(formEvent) {
                let data = this.state.data;
                if (data === null) {
                    const s1 = this.state;
                    s1.errorMsg = "There are no data to be sent. Please fill in the form below before submission.";
                    this.setState(s1);
                    return;
                }
                if (!this.canSubmit()) {
                    const s1 = this.state;
                    s1.errorMsg = "The form is incomplete!. Please fill in the form below before submission.";
                    this.setState(s1);
                    return;
                }
                MoleOnlineWebUI.Service.AnnotationToChannelsDBService.ApiService.sendAnnotation(data).then((value) => {
                    if (value.Status === "OK") {
                        const s2 = this.state;
                        s2.infoMsg = value.Msg;
                        s2.errorMsg = void 0;
                        s2.data = this.getDefaultWorkingItem();
                        this.setState(s2);
                        Events.invokeOnClear();
                    }
                    else {
                        const s = this.state;
                        s.errorMsg = value.Msg;
                        s.infoMsg = void 0;
                        this.setState(s);
                    }
                })
                    .catch(err => {
                    const s = this.state;
                    s.errorMsg = `Application was unable to submit your annotatons to ChannelsDB. Error message: ${err}`;
                    this.setState(s);
                });
                return true;
            }
            updateCurrentElement(value, setter) {
                if (this.state.data === null) {
                    return;
                }
                let newCwi = setter(this.state.data, value);
                const s = this.state;
                s.data = newCwi;
                this.setState(s);
            }
            updateCurrentElementEmail(email) {
                this.updateCurrentElement(email, (pto, val) => {
                    pto.Email = val;
                    return pto;
                });
            }
            updateCurrentElementMessage(message) {
                this.updateCurrentElement(message, (pto, val) => {
                    pto.Message = val;
                    return pto;
                });
            }
            render() {
                let infoMsg;
                if (this.state.infoMsg !== void 0) {
                    infoMsg = React.createElement("div", { className: "error-message alert-success" }, this.state.infoMsg);
                }
                let errorMsg;
                if (this.state.errorMsg !== void 0) {
                    errorMsg = React.createElement("div", { className: "error-message alert-danger" }, this.state.errorMsg);
                }
                let data = this.state.data;
                let isMailValidOrBlank = (value) => {
                    let valid = true;
                    if (value !== "") {
                        valid = RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/).test(value);
                    }
                    return {
                        valid,
                        Msg: (valid) ? void 0 : "Mail address has invalid format!"
                    };
                };
                let items = [];
                if (data !== null) {
                    items.push(React.createElement("input", { type: "hidden", name: "CompId", value: data.CompId }));
                    items.push(React.createElement("input", { type: "hidden", name: "SubmitId", value: data.SubmitId }));
                    items.push(React.createElement(EmailTextBox, { id: "AnnotateFormEmail", name: "Email", label: "Email", onValueChange: ((e) => {
                            this.updateCurrentElementEmail(e);
                            let s = this.state;
                            s.mailValid = true;
                            this.setState(s);
                        }).bind(this), value: data.Email, isValid: isMailValidOrBlank, onInvalid: (() => {
                            this.updateCurrentElementEmail("");
                            let s = this.state;
                            s.mailValid = false;
                            this.setState(s);
                        }).bind(this), placeholder: Bundle.get("placeholder-annotate-email") }));
                    items.push(React.createElement(TextAreaBox, { id: "AnnotateFormMessage", name: "Message", label: "Message", onValueChange: this.updateCurrentElementMessage.bind(this), value: data.Message, placeholder: Bundle.get("placeholder-annotate-message") }));
                    items.push(React.createElement(TunnelAnnotations, { form: this, items: data.TunnelAnnotations }));
                    items.push(React.createElement(ResidueAnnotations, { form: this, items: data.ResidueAnnotations }));
                }
                return React.createElement("div", null,
                    React.createElement("div", { className: `annotate-form-fade ${(this.props.visible) ? "visible" : ''}` }),
                    React.createElement("div", { className: `annotate-form${(this.props.visible) ? "" : " hidden"}` },
                        infoMsg,
                        errorMsg,
                        React.createElement("div", { className: "scroll-container" },
                            React.createElement("form", { className: "form-horizontal", onSubmit: (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    this.submit(e);
                                } },
                                items,
                                React.createElement("div", { className: "buttons" },
                                    React.createElement("input", { type: "submit", className: "btn btn-primary", value: "Submit to ChannelsDB", disabled: !this.canSubmit() })),
                                React.createElement("div", { title: "Close", className: "btn btn-link close-button glyphicon glyphicon-remove", onClick: (e) => {
                                        //Reset form data
                                        const sLocal = this.state;
                                        sLocal.data = this.getDefaultWorkingItem();
                                        sLocal.errorMsg = void 0;
                                        sLocal.infoMsg = void 0;
                                        this.setState(sLocal);
                                        Events.invokeOnClear();
                                        const s = this.props.app.state;
                                        s.annotationFormVisible = false;
                                        this.props.app.setState(s);
                                    } })))));
            }
        }
        class TextBox extends React.Component {
            constructor() {
                super(...arguments);
                this.state = {
                    isValid: true
                };
                this.typeClassName = "TextBox";
            }
            componentDidMount() {
                Events.attachOnClearEventHandler((() => {
                    $(`#${this.props.id}`).val("");
                    if (this.props.onValueChange !== void 0) {
                        this.props.onValueChange("");
                    }
                    this.setState({
                        isValid: true,
                        errMsg: void 0
                    });
                }).bind(this));
            }
            validate(value) {
                if (this.props.isValid === void 0) {
                    if (this.props.onValueChange !== void 0) {
                        this.props.onValueChange((value === null) ? "" : value);
                    }
                    return true;
                }
                let valid = this.props.isValid((value === null) ? "" : value);
                if (valid.valid && this.props.onValueChange !== void 0) {
                    this.props.onValueChange((value === null) ? "" : value);
                }
                const s = this.state;
                s.isValid = valid.valid;
                s.errMsg = valid.Msg;
                this.setState(s);
                return valid.valid;
            }
            renderCustom() {
                return React.createElement("input", { type: "text", className: "form-control", id: `${this.props.id}`, name: `${this.props.name}`, placeholder: this.props.placeholder, defaultValue: this.props.value, onBlur: this.checkValid.bind(this), onSubmit: this.checkValid.bind(this), onChange: this.checkValid.bind(this) });
            }
            renderError() {
                let errorPart;
                if (!this.state.isValid) {
                    errorPart = React.createElement("div", { className: "error-msg" }, (this.state.errMsg !== void 0) ? this.state.errMsg : MoleOnlineWebUI.StaticData.Bundle.get("validation-error-message-default"));
                }
                return errorPart;
            }
            checkValid(e) {
                if (!this.validate($(e.currentTarget).val())) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.props.onInvalid !== void 0) {
                        this.props.onInvalid();
                    }
                }
            }
            render() {
                let htmlPart = this.renderCustom();
                let errorPart = this.renderError();
                let label;
                if (this.props.label !== void 0) {
                    label = React.createElement("label", { className: "col-sm-1", htmlFor: `${this.props.id}` },
                        this.props.label,
                        ":");
                }
                return React.createElement("div", { className: `custom-box ${this.typeClassName}` },
                    React.createElement("div", { className: "form-group" },
                        label,
                        React.createElement("div", { className: `col-sm-1${(label === void 0) ? 2 : 1}` }, htmlPart)),
                    errorPart);
            }
        }
        class EmailTextBox extends TextBox {
            constructor() {
                super(...arguments);
                this.typeClassName = "EmailBox";
            }
            renderError() {
                let errorPart;
                if (!this.state.isValid) {
                    errorPart = React.createElement("div", { className: "col-sm-offset-1 col-sm-11" },
                        React.createElement("div", { className: "error-msg" }, (this.state.errMsg !== void 0) ? this.state.errMsg : MoleOnlineWebUI.StaticData.Bundle.get("validation-error-message-default")));
                }
                return errorPart;
            }
            renderCustom() {
                return React.createElement("input", { type: "email", className: "form-control", id: `${this.props.id}`, name: `${this.props.name}`, placeholder: this.props.placeholder, defaultValue: this.props.value, onBlur: this.checkValid.bind(this), onChange: this.checkValid.bind(this), onSubmit: ((e) => {
                        this.checkValid(e);
                    }).bind(this) });
            }
        }
        class TextAreaBox extends TextBox {
            constructor() {
                super(...arguments);
                this.typeClassName = "TextAreaBox";
            }
            renderCustom() {
                return React.createElement("textarea", { id: `${this.props.id}`, className: "form-control", name: `${this.props.name}`, placeholder: this.props.placeholder, defaultValue: this.props.value, onBlur: this.checkValid.bind(this), onChange: this.checkValid.bind(this), onSubmit: ((e) => {
                        this.checkValid(e);
                    }).bind(this) });
            }
        }
        class TunnelAnnotations extends React.Component {
            constructor() {
                super(...arguments);
                this.state = {
                    tunnelData: [],
                    currentWorkingItem: this.getDefaultWorkingItem()
                };
                this.tunnelNameCache = null;
            }
            getTunnelNameById(tunnelId) {
                let tunneData = this.state.tunnelData;
                if (tunneData.length === 0) {
                    return "X";
                }
                if (this.tunnelNameCache === null) {
                    let mapping = new Map();
                    for (let tunnel of tunneData) {
                        let name = CommonUtils.Tunnels.getName(tunnel);
                        if (name === void 0) {
                            continue;
                        }
                        mapping.set(tunnel.Id, name);
                    }
                    this.tunnelNameCache = mapping;
                }
                return this.tunnelNameCache.get(tunnelId);
            }
            remove(key) {
                let data = this.props.form.state.data;
                if (data === null) {
                    return;
                }
                let newAnnotations = [];
                for (let item of data.TunnelAnnotations) {
                    if (key === this.getRowHash(item)) {
                        continue;
                    }
                    newAnnotations.push(item);
                }
                data.TunnelAnnotations = newAnnotations;
                const s = this.props.form.state;
                s.data = data;
                this.props.form.setState(s);
            }
            componentDidMount() {
                Events.attachOnClearEventHandler((() => {
                    this.clear();
                }).bind(this));
                MoleOnlineWebUI.Bridge.Events.subscribeChannelDataLoaded(((data) => {
                    let tunnelData = [];
                    let moleChannels = data.Channels;
                    tunnelData = CommonUtils.Tunnels.concatTunnelsSafe(tunnelData, moleChannels.Tunnels);
                    tunnelData = CommonUtils.Tunnels.concatTunnelsSafe(tunnelData, moleChannels.Paths);
                    tunnelData = CommonUtils.Tunnels.concatTunnelsSafe(tunnelData, moleChannels.Pores);
                    tunnelData = CommonUtils.Tunnels.concatTunnelsSafe(tunnelData, moleChannels.MergedPores);
                    if (tunnelData.length === 0) {
                        return;
                    }
                    const s = this.state;
                    s.tunnelData = tunnelData;
                    this.tunnelNameCache = null;
                    this.setState(s);
                }).bind(this));
            }
            generateTunnelMetadata() {
                let rv = [];
                if (this.state === void 0) {
                    return rv;
                }
                for (let item of this.state.tunnelData) {
                    let tunnelLabel = CommonUtils.Tunnels.getName(item);
                    rv.push({
                        value: item.Id,
                        label: (tunnelLabel === void 0) ? "X" : tunnelLabel
                    });
                }
                return rv;
            }
            canAddCurrentWorkingItem() {
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
            }
            updateCurrentElement(value, setter) {
                let newCwi = setter(this.state.currentWorkingItem, value);
                const s = this.state;
                this.setState({
                    tunnelData: s.tunnelData,
                    currentWorkingItem: newCwi
                });
            }
            updateCurrentElementTunnelId(tunnelId) {
                this.updateCurrentElement(tunnelId, (pto, val) => {
                    pto.Id = val;
                    return pto;
                });
            }
            updateCurrentElementReferenceType(referenceType) {
                this.updateCurrentElement(referenceType, (pto, val) => {
                    pto.ReferenceType = val;
                    return pto;
                });
            }
            updateCurrentElementReference(reference) {
                this.updateCurrentElement(reference, (pto, val) => {
                    pto.Reference = val;
                    return pto;
                });
            }
            updateCurrentElementName(name) {
                this.updateCurrentElement(name, (pto, val) => {
                    pto.Name = val;
                    return pto;
                });
            }
            updateCurrentElementDescription(description) {
                this.updateCurrentElement(description, (pto, val) => {
                    pto.Description = val;
                    return pto;
                });
            }
            clear() {
                let dwi = this.getDefaultWorkingItem();
                let elements = [
                    { id: "TunnelIdCombobox", value: dwi.Id },
                    { id: "ChannelName", value: dwi.Name },
                    { id: "ChannelDescription", value: dwi.Description },
                    { id: "ChannelReference", value: dwi.Reference },
                    { id: "ReferenceTypeCombobox", value: dwi.ReferenceType }
                ];
                for (let el of elements) {
                    $(`#${el.id}`).val(el.value);
                }
                const s = this.state;
                s.currentWorkingItem = dwi;
                this.setState(s);
            }
            getDefaultWorkingItem() {
                let tunnels = this.generateTunnelMetadata();
                return {
                    Id: (tunnels.length > 0) ? tunnels[0].value : "",
                    Name: "",
                    Description: "",
                    Reference: "",
                    ReferenceType: "DOI"
                };
            }
            generateControlRow() {
                let tunnelMetadata = this.generateTunnelMetadata();
                let notEmpty = (value) => {
                    let valid = value !== void 0 && value !== null && value.length > 0;
                    return {
                        valid,
                        Msg: (valid) ? void 0 : MoleOnlineWebUI.StaticData.Bundle.get("validation-error-message-not-empty")
                    };
                };
                let cwi = this.state.currentWorkingItem;
                return React.createElement("tr", null,
                    React.createElement("td", null,
                        React.createElement(Combobox, { id: "TunnelIdCombobox", onValueChange: this.updateCurrentElementTunnelId.bind(this), items: tunnelMetadata, value: (cwi.Id === "") ? void 0 : cwi.Id })),
                    React.createElement("td", null,
                        React.createElement(TextBox, { id: "ChannelName", placeholder: "Name of the channel", onInvalid: (() => { this.updateCurrentElementName(""); }).bind(this), onValueChange: this.updateCurrentElementName.bind(this), isValid: notEmpty.bind(this), value: cwi.Name })),
                    React.createElement("td", null,
                        React.createElement(TextBox, { id: "ChannelDescription", placeholder: "Description of channel function", onInvalid: (() => { this.updateCurrentElementDescription(""); }).bind(this), onValueChange: this.updateCurrentElementDescription.bind(this), value: cwi.Description })),
                    React.createElement("td", null,
                        React.createElement(TextBox, { id: "ChannelReference", placeholder: "DOI or Pubmed ID", onInvalid: (() => { this.updateCurrentElementReference(""); }).bind(this), onValueChange: this.updateCurrentElementReference.bind(this), isValid: notEmpty.bind(this), value: cwi.Reference })),
                    React.createElement("td", null,
                        React.createElement(Combobox, { id: "ReferenceTypeCombobox", items: [{ value: "DOI", label: "DOI" }, { value: "Pubmed", label: "Pubmed" }], onValueChange: this.updateCurrentElementReferenceType.bind(this), value: (cwi.ReferenceType === "") ? void 0 : cwi.ReferenceType })),
                    React.createElement("td", null,
                        React.createElement("div", { className: `btn btn-success glyphicon glyphicon-plus${(this.canAddCurrentWorkingItem()) ? '' : ' disabled'}`, onClick: ((e) => {
                                if ($(e.currentTarget).hasClass("disabled")) {
                                    return;
                                }
                                let data = this.props.form.state.data;
                                if (data !== null && this.state.currentWorkingItem !== null) {
                                    const tunnelAnnotations = data.TunnelAnnotations;
                                    tunnelAnnotations.push(this.state.currentWorkingItem);
                                    const s = this.props.form.state;
                                    if (s.data !== null) {
                                        s.data.TunnelAnnotations = tunnelAnnotations;
                                        this.props.form.setState(s);
                                        this.clear();
                                    }
                                }
                            }).bind(this) })));
            }
            getRowHash(item) {
                return `${item.Id}&&${item.Name}&&${item.Description}&&${item.Reference}&&${item.ReferenceType}`;
            }
            generateInfoRow(item) {
                const tunneld = item.Id;
                const onClick = (e) => {
                    let hash = e.currentTarget.dataset["key"];
                    if (hash === void 0) {
                        return;
                    }
                    this.remove(hash);
                };
                let tunnelName = this.getTunnelNameById(tunneld);
                return React.createElement("tr", null,
                    React.createElement("td", null, (tunnelName !== void 0) ? tunnelName : tunneld),
                    React.createElement("td", null, item.Name),
                    React.createElement("td", null, item.Description),
                    React.createElement("td", null, item.Reference),
                    React.createElement("td", null, item.ReferenceType),
                    React.createElement("td", null,
                        React.createElement("div", { className: "btn btn-danger glyphicon glyphicon-remove", "data-key": this.getRowHash(item), onClick: onClick.bind(this) })));
            }
            render() {
                let body = [];
                body.push(this.generateControlRow());
                for (let item of this.props.items) {
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
            }
        }
        class Combobox extends React.Component {
            constructor() {
                super(...arguments);
                this.state = {};
            }
            reportCurrentValueChange(value) {
                if (this.props.onValueChange !== void 0) {
                    if (value !== void 0) {
                        this.props.onValueChange(value);
                    }
                    else if (this.props.items.length > 0) {
                        this.props.onValueChange(this.props.items[0].value);
                    }
                }
            }
            componentDidMount() {
                this.reportCurrentValueChange();
            }
            itemsChanged(newItems) {
                if (newItems.length !== this.props.items.length) {
                    return true;
                }
                for (let i = 0; i < this.props.items.length; i++) {
                    if (this.props.items[i].value !== newItems[i].value) {
                        return true;
                    }
                }
                return false;
            }
            componentWillReceiveProps(nextProps) {
                if (this.props.value !== nextProps.value) {
                    this.reportCurrentValueChange(nextProps.value);
                }
                else if (this.itemsChanged(nextProps.items)) {
                    let value = "";
                    if (nextProps.items.length > 0) {
                        value = nextProps.items[0].value;
                    }
                    this.reportCurrentValueChange(value);
                }
            }
            generateInnerElements(items) {
                let rv = [];
                for (let i = 0; i < items.length; i++) {
                    rv.push(React.createElement("option", { value: items[i].value }, items[i].label));
                }
                return rv;
            }
            render() {
                let items = this.generateInnerElements(this.props.items);
                let label = this.props.label;
                let errorPart;
                return React.createElement("div", { className: "custom-box combobox" },
                    React.createElement("div", { className: "form-group" },
                        label,
                        React.createElement("div", { className: `col-sm-1${(label === void 0) ? 2 : 1}` },
                            React.createElement("select", { className: "form-control", id: `${this.props.id}`, defaultValue: this.props.value, onChange: ((e) => {
                                    if (this.props.onValueChange !== void 0) {
                                        this.props.onValueChange(e.currentTarget.options[e.currentTarget.selectedIndex].value);
                                    }
                                }).bind(this) }, items))),
                    errorPart);
            }
        }
        class ResidueAnnotations extends React.Component {
            constructor() {
                super(...arguments);
                this.state = {
                    currentWorkingItem: this.getDefaultWorkingItem()
                };
            }
            getDefaultWorkingItem() {
                return {
                    Id: "",
                    Chain: "",
                    Text: "",
                    Reference: "",
                    ReferenceType: "DOI"
                };
            }
            remove(key) {
                let data = this.props.form.state.data;
                if (data === null) {
                    return;
                }
                let newAnnotations = [];
                for (let item of data.ResidueAnnotations) {
                    if (key === this.getRowHash(item)) {
                        continue;
                    }
                    newAnnotations.push(item);
                }
                data.ResidueAnnotations = newAnnotations;
                const s = this.props.form.state;
                s.data = data;
                this.props.form.setState(s);
            }
            componentDidMount() {
                Events.attachOnClearEventHandler((() => {
                    this.clear();
                }).bind(this));
            }
            canAddCurrentWorkingItem() {
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
            }
            updateCurrentElement(value, setter) {
                let newCwi = setter(this.state.currentWorkingItem, value);
                this.setState({
                    currentWorkingItem: newCwi
                });
            }
            updateCurrentElementIdAndChain(residueId) {
                let residues = parseResidues(residueId);
                if (residues.length !== 1) {
                    this.updateCurrentElement("", (pto, val) => {
                        pto.Id = "";
                        pto.Chain = "";
                        return pto;
                    });
                    return;
                }
                this.updateCurrentElement(residues[0], (pto, val) => {
                    pto.Id = val.SequenceNumber;
                    pto.Chain = val.Chain;
                    return pto;
                });
            }
            updateCurrentElementReferenceType(referenceType) {
                this.updateCurrentElement(referenceType, (pto, val) => {
                    pto.ReferenceType = val;
                    return pto;
                });
            }
            updateCurrentElementReference(reference) {
                this.updateCurrentElement(reference, (pto, val) => {
                    pto.Reference = val;
                    return pto;
                });
            }
            updateCurrentElementText(text) {
                this.updateCurrentElement(text, (pto, val) => {
                    pto.Text = val;
                    return pto;
                });
            }
            clear() {
                let dwi = this.getDefaultWorkingItem();
                let idAndChain = `${dwi.Id} ${dwi.Chain}`;
                if (idAndChain === " ") {
                    idAndChain = "";
                }
                let elements = [
                    { id: "ResidueId", value: idAndChain },
                    { id: "ResidueText", value: dwi.Text },
                    { id: "ResidueReference", value: dwi.Reference },
                    { id: "ResidueReferenceTypeCombobox", value: dwi.ReferenceType }
                ];
                for (let el of elements) {
                    $(`#${el.id}`).val(el.value);
                }
                const s = this.state;
                s.currentWorkingItem = dwi;
                this.setState(s);
            }
            generateControlRow() {
                let notEmpty = (value) => {
                    let valid = value !== void 0 && value !== null && value.length > 0;
                    return {
                        valid,
                        Msg: (valid) ? void 0 : MoleOnlineWebUI.StaticData.Bundle.get("validation-error-message-not-empty")
                    };
                };
                let isResidue = (value) => {
                    if (value.length === 0) {
                        return {
                            valid: false,
                            Msg: MoleOnlineWebUI.StaticData.Bundle.get("validation-error-message-not-empty")
                        };
                    }
                    let valid = parseResidues(value).length === 1;
                    return {
                        valid,
                        Msg: (!valid) ? MoleOnlineWebUI.StaticData.Bundle.get("validation-error-message-residue-invalid-format") : void 0
                    };
                };
                let cwi = this.state.currentWorkingItem;
                let idAndChain = `${cwi.Id} ${cwi.Chain}`;
                return React.createElement("tr", null,
                    React.createElement("td", null,
                        React.createElement(TextBox, { id: "ResidueId", placeholder: "142 A", onInvalid: (() => { this.updateCurrentElementIdAndChain(""); }).bind(this), onValueChange: this.updateCurrentElementIdAndChain.bind(this), isValid: isResidue.bind(this), value: (idAndChain === " ") ? void 0 : idAndChain })),
                    React.createElement("td", null,
                        React.createElement(TextBox, { id: "ResidueText", placeholder: "Annotation of residue function", onInvalid: (() => { this.updateCurrentElementText(""); }).bind(this), onValueChange: this.updateCurrentElementText.bind(this), isValid: notEmpty.bind(this), value: cwi.Text })),
                    React.createElement("td", null,
                        React.createElement(TextBox, { id: "ResidueReference", placeholder: "DOI or Pubmed ID", onInvalid: (() => this.updateCurrentElementReference("")).bind(this), onValueChange: this.updateCurrentElementReference.bind(this), isValid: notEmpty.bind(this), value: cwi.Reference })),
                    React.createElement("td", null,
                        React.createElement(Combobox, { id: "ResidueReferenceTypeCombobox", items: [{ value: "DOI", label: "DOI" }, { value: "Pubmed", label: "Pubmed" }], onValueChange: this.updateCurrentElementReferenceType.bind(this), value: (cwi.ReferenceType === "") ? void 0 : cwi.ReferenceType })),
                    React.createElement("td", null,
                        React.createElement("div", { className: `btn btn-success glyphicon glyphicon-plus${(this.canAddCurrentWorkingItem()) ? '' : ' disabled'}`, onClick: (e) => {
                                if ($(e.currentTarget).hasClass("disabled")) {
                                    return;
                                }
                                let data = this.props.form.state.data;
                                if (data !== null && this.state.currentWorkingItem !== null) {
                                    const residueAnnotations = data.ResidueAnnotations;
                                    residueAnnotations.push(this.state.currentWorkingItem);
                                    const s = this.props.form.state;
                                    if (s.data !== null) {
                                        s.data.ResidueAnnotations = residueAnnotations;
                                        this.props.form.setState(s);
                                        this.clear();
                                    }
                                }
                            } })));
            }
            generateInfoRow(item) {
                const residueId = item.Id;
                return React.createElement("tr", null,
                    React.createElement("td", null, item.Id + ' ' + item.Chain),
                    React.createElement("td", null, item.Text),
                    React.createElement("td", null, item.Reference),
                    React.createElement("td", null, item.ReferenceType),
                    React.createElement("td", null,
                        React.createElement("div", { className: "btn btn-danger glyphicon glyphicon-remove", "data-key": this.getRowHash(item), onClick: ((e) => {
                                let hash = e.currentTarget.dataset["key"];
                                if (hash === void 0) {
                                    return;
                                }
                                this.remove(hash);
                            }).bind(this) })));
            }
            getRowHash(item) {
                return `${item.Id}&&${item.Chain}&&${item.Text}&&${item.Reference}&&${item.ReferenceType}`;
            }
            render() {
                let body = [];
                body.push(this.generateControlRow());
                for (let item of this.props.items) {
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
            }
        }
        function parseResidues(residues) {
            if (residues === void 0) {
                return [];
            }
            residues = residues.replace(/\s*,\s*/g, ",");
            let items = residues.split(',');
            let rv = [];
            let seqNumReg = new RegExp(/^[0-9]+$/);
            let chainReg = new RegExp(/^\D+\S*$/);
            for (let item of items) {
                let r = item.split(' ');
                if (r.length > 2) {
                    continue;
                }
                let seqNum;
                let chain;
                for (let part of r) {
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
        class App extends React.Component {
            constructor() {
                super(...arguments);
                this.state = {
                    app: this,
                    channelSelected: false,
                    hasSubmissions: false,
                    fromPDBID: false,
                    hasChannels: false
                };
            }
            componentDidMount() {
                let channelSelected = CommonUtils.Selection.SelectionHelper.isSelectedAnyChannel();
                if (channelSelected !== this.state.channelSelected) {
                    let s = this.state;
                    s.channelSelected = channelSelected;
                    this.setState(s);
                }
                CommonUtils.Selection.SelectionHelper.attachOnChannelDeselectHandler(() => {
                    let state = this.state;
                    state.channelSelected = false;
                    this.setState(state);
                });
                CommonUtils.Selection.SelectionHelper.attachOnChannelSelectHandler((data) => {
                    let state = this.state;
                    state.channelSelected = true;
                    this.setState(state);
                });
                let params = CommonUtils.Router.getParameters();
                if (params !== null) {
                    MoleOnlineWebUI.DataProxy.ComputationInfo.DataProvider.subscribe(params.computationId, (compid, info) => {
                        let s1 = this.state;
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
                        this.setState(s1);
                    });
                    MoleOnlineWebUI.Bridge.Events.subscribeChannelDataLoaded((data) => {
                        let channelsData = data.Channels;
                        let tunnels = [];
                        tunnels = CommonUtils.Tunnels.concatTunnelsSafe(tunnels, channelsData.MergedPores);
                        tunnels = CommonUtils.Tunnels.concatTunnelsSafe(tunnels, channelsData.Paths);
                        tunnels = CommonUtils.Tunnels.concatTunnelsSafe(tunnels, channelsData.Pores);
                        tunnels = CommonUtils.Tunnels.concatTunnelsSafe(tunnels, channelsData.Tunnels);
                        let s2 = this.state;
                        s2.hasChannels = tunnels.length > 0;
                        this.setState(s2);
                    });
                }
            }
            componentWillUnmount() {
            }
            render() {
                let hints = [];
                if (this.state.fromPDBID) {
                    hints.push(React.createElement("li", null,
                        "To visualize data from ",
                        React.createElement("a", { href: "https://webchemdev.ncbr.muni.cz/ChannelsDB/" }, "ChannelsDB"),
                        ", click on ",
                        React.createElement("b", null, "#ChannelsDB"),
                        " submission located on ",
                        React.createElement("b", null, "Submission tab"),
                        " in the right side of the screen."));
                }
                if (!this.state.hasSubmissions) {
                    hints.push(React.createElement("li", null,
                        "To start your own calculation job(submission) fill in submission form located in the Submission settings tab at the right side of the screen. ",
                        React.createElement("b", null, "For\u00A0automatic starting points"),
                        " skip filling the form and click on submit. Or you can choose starting points from available options:",
                        React.createElement("ul", null,
                            React.createElement("li", null, "Active sites from CSA"),
                            React.createElement("li", null, "Cofactor starting points"),
                            React.createElement("li", null, "By picking some residues from 3D view/protein sequence"),
                            React.createElement("li", null, "By picking from available starting points(Origins section in top-right part of the screen and then by clicking in 3D view on available points represented by balls)"),
                            React.createElement("li", null, "By cavities - Cavities section in the top-right part of the screen, select one or more cavities and then while holding CTRL key left click on highlighted parts of cavities in 3D view")),
                        "Selected points or residues can be used in submission form by ",
                        React.createElement("b", null, "Use current selection"),
                        " buttons."));
                }
                else {
                    if (!this.state.channelSelected) {
                        if (this.state.hasChannels) {
                            hints.push(React.createElement("li", null,
                                "You can:",
                                React.createElement("ul", null,
                                    React.createElement("li", null, "Pick one of available channels to view its properties mapped on 2D representation of tunnel(bottom-left part of screen), properties and residues asociated with tunnel layers or lining residues of selected tunnel."),
                                    React.createElement("li", null,
                                        "See summary of properties of all available channels switch to ",
                                        React.createElement("b", null, "Channels properties"),
                                        " tab in bottom-left part of screen."),
                                    React.createElement("li", null, "Or start new submission."))));
                        }
                        else {
                            hints.push(React.createElement("li", null,
                                React.createElement("b", null, "No channels were computed \u2013 Tips:"),
                                React.createElement("ul", null,
                                    React.createElement("li", null, "Switch on the box - Ignore HETATMs (discard all the heteroatom from the channel computation)."),
                                    React.createElement("li", null, "Or Switch on the box - Ignore Hydrogens (all hydrogens will be excluded from the channel computation)."),
                                    React.createElement("li", null,
                                        "Set the ",
                                        React.createElement("b", null, "lower value of  Interior Threshold"),
                                        " (in Cavity parameters; e.g. from 1.5 to 1.0)."),
                                    React.createElement("li", null,
                                        "Set the ",
                                        React.createElement("b", null, "higher value of Probe Radius"),
                                        " (in Cavity parameters; e.g. from 3 to 10)."),
                                    React.createElement("li", null,
                                        "Change the starting point",
                                        React.createElement("ul", null,
                                            React.createElement("li", null, "Or try to use the Active Sites from CSA (Panel Selection)"),
                                            React.createElement("li", null, "Or choose your own exact point by set the exact values of XYZ coordinates"),
                                            React.createElement("li", null, "Or use the cofactor (e.g. HEM etc.)"))),
                                    React.createElement("li", null,
                                        "Try to find your structure in ChannelsDB - ",
                                        React.createElement("a", { href: "http://ncbr.muni.cz/ChannelsDB", target: "_blank" }, "http://ncbr.muni.cz/ChannelsDB"),
                                        " and compare with annotated channels."))));
                        }
                    }
                    else {
                        hints.push(React.createElement("li", null,
                            "You can:",
                            React.createElement("ul", null,
                                React.createElement("li", null, "View properties of selected channel mapped on 2D representation of tunnel(bottom-left part of screen), properties and residues asociated with tunnel layers or lining residues of selected tunnel."),
                                React.createElement("li", null, "Select another channel"),
                                React.createElement("li", null, "Or start new submission"))));
                    }
                }
                hints.push(React.createElement("li", null,
                    "For more information see ",
                    React.createElement("a", { href: "/documentation/" }, "documentation page"),
                    "."));
                return React.createElement("div", null,
                    React.createElement("h3", null, "Quick help"),
                    React.createElement("ul", null, hints));
            }
        }
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
                        colors: LiteMol.Core.Utils.FastMap.ofArray([['Uniform', ColorScheme.Colors.get(ColorScheme.Enum.CavityInner) /*Visualization.Color.fromHex(0x999999)*/]]),
                        transparency: { alpha: 0.33 }
                    }),
                    boundary: LiteMol.Visualization.Theme.createUniform({
                        colors: LiteMol.Core.Utils.FastMap.ofArray([['Uniform', ColorScheme.Colors.get(ColorScheme.Enum.CavityBoundary) /*Visualization.Color.fromHex(0x90ee90)*/]]),
                        transparency: { alpha: 0.66 }
                    }),
                    selectableBoundary: LiteMol.Visualization.Theme.createUniform({
                        colors: LiteMol.Core.Utils.FastMap.ofArray([['Uniform', ColorScheme.Colors.get(ColorScheme.Enum.CavitySelectable) /*Visualization.Color.fromHex(0xee3010)*/]]),
                        transparency: { alpha: 1.0 }
                    })
                };
                function getTriangleCenter({ vertices: vs, triangleIndices: ts }, tI) {
                    const c = Vec3.zero();
                    for (let i = 0; i < 3; i++) {
                        const v = 3 * tI + i;
                        Vec3.add(c, c, Vec3(vs[3 * v], vs[3 * v + 1], vs[3 * v + 2]));
                    }
                    return Vec3.scale(c, c, 1 / 3);
                }
                Behaviour.getTriangleCenter = getTriangleCenter;
                function vec3str(v) {
                    return `(${v[0].toFixed(2)}, ${v[1].toFixed(2)}, ${v[2].toFixed(2)})`;
                }
                Behaviour.vec3str = vec3str;
                function createSelectEvent(plugin) {
                    return plugin.context.behaviours.click.map(info => {
                        if (!info || Interactivity.isEmpty(info)) {
                            return { kind: 'nothing' };
                        }
                        if (info.source.type === LiteMol.Bootstrap.Entity.Visual.Surface) {
                            const tag = info.source.props.tag;
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
                    const boundaries = LiteMol.Bootstrap.Tree.Selection
                        .byRef('mole-data')
                        .subtree()
                        .ofType(LiteMol.Bootstrap.Entity.Visual.Surface)
                        .filter(n => n.props.tag && n.props.tag.kind === 'Cavity-boundary');
                    const getModels = () => plugin.selectEntities(boundaries).map(e => e.props.model);
                    let ctrlPressed = false;
                    window.addEventListener('keydown', e => {
                        if (ctrlPressed || !e.ctrlKey)
                            return;
                        ctrlPressed = true;
                        getModels().forEach(m => m.applyTheme(Behaviour.CavityTheme.selectableBoundary));
                    });
                    window.addEventListener('keyup', e => {
                        if (ctrlPressed && !e.ctrlKey) {
                            ctrlPressed = false;
                            getModels().forEach(m => m.applyTheme(Behaviour.CavityTheme.boundary));
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
                var ApiService = MoleOnlineWebUI.Service.MoleAPI.ApiService;
                var Tree = LiteMol.Bootstrap.Tree;
                var Transformer = LiteMol.Bootstrap.Entity.Transformer;
                var ColorScheme = MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme;
                function showDefaultVisuals(plugin, data) {
                    return new LiteMol.Promise(res => {
                        let toShow = [];
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
                        return showChannelVisuals(plugin, toShow.slice(0, 5), true).then(() => {
                            if (data.Cavities === void 0) {
                                res();
                                return;
                            }
                            let cavity = data.Cavities.Cavities[0];
                            if (!cavity) {
                                res();
                                return;
                            }
                            showCavityVisuals(plugin, [cavity], true).then(() => res());
                        });
                    });
                }
                function getNodeFromTree(root, ref) {
                    if (root.ref === ref) {
                        return root;
                    }
                    for (let c of root.children) {
                        let n = getNodeFromTree(c, ref);
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
                function removeNodeFromTree(plugin, nodeRef) {
                    let obj = getNodeFromTree(plugin.root, nodeRef);
                    if (obj !== null) {
                        Tree.remove(obj);
                    }
                }
                ;
                function residuesToPoints(plugin, residueOrigins) {
                    let points = [];
                    for (let origin of residueOrigins) {
                        let centerOfMass = CommonUtils.Residues.getCenterOfMass(origin);
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
                    return new LiteMol.Promise((res, rej) => {
                        MoleOnlineWebUI.DataProxy.CSAResidues.DataProvider.get(computationId, (compId, info) => {
                            let originsData = residuesToPoints(plugin, info);
                            let csaOrigins = plugin.createTransform().add(plugin.root, Transformer.Data.FromData, { data: originsData, id: 'CSA Origins' }, { isHidden: true, ref: 'csa-origins-object' })
                                .then(Transformer.Data.ParseJson, { id: 'Origins' }, { isHidden: true, ref: 'csa-origins' });
                            plugin.applyTransform(csaOrigins)
                                .then(() => {
                                res();
                            })
                                .catch(error => {
                                rej(error);
                            });
                        });
                    });
                }
                function generateGuid(tunnels) {
                    for (let idx = 0; idx < tunnels.length; idx++) {
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
                function downloadChannelsData(plugin, computationId, submitId) {
                    removeChannelsData(plugin);
                    return new LiteMol.Promise((res, rej) => {
                        ApiService.getChannelsData(computationId, submitId).then((data) => {
                            let channels = plugin.createTransform().add(plugin.root, Transformer.Data.FromData, { data, id: 'Computation Results' }, { isHidden: true, ref: 'mole-data-object' })
                                .then(Transformer.Data.ParseJson, { id: 'Objects' }, { ref: 'mole-data', isHidden: true });
                            plugin.applyTransform(channels)
                                .then(() => {
                                let parsedData = plugin.context.select('mole-data')[0];
                                if (!parsedData) {
                                    rej('Data not available.');
                                }
                                else {
                                    let data_ = parsedData.props.data;
                                    data_ = generateGuidMole(data_);
                                    MoleOnlineWebUI.Cache.TunnelName.reload(data_);
                                    MoleOnlineWebUI.Bridge.Events.invokeChannelDataLoaded(data_);
                                    showDefaultVisuals(plugin, data_.Channels)
                                        .then(() => {
                                        res();
                                    });
                                }
                            })
                                .catch(error => rej(error));
                        })
                            .catch(err => rej(err));
                    });
                }
                function downloadChannelsDBData(plugin, computationId) {
                    removeChannelsData(plugin);
                    return new LiteMol.Promise((res, rej) => {
                        ApiService.getComputationInfoList(computationId).then(val => {
                            if (val.PdbId !== null) {
                                MoleOnlineWebUI.Cache.ChannelsDBData.getChannelsData(val.PdbId).then(data => {
                                    let channels = plugin.createTransform().add(plugin.root, Transformer.Data.FromData, { data: JSON.stringify({ Channels: data }), id: 'Computation Results' }, { isHidden: false, ref: 'mole-data-object' })
                                        .then(Transformer.Data.ParseJson, { id: 'Objects' }, { ref: 'mole-data', isHidden: false });
                                    plugin.applyTransform(channels)
                                        .then(() => {
                                        let parsedData = plugin.context.select('mole-data')[0];
                                        if (!parsedData) {
                                            rej('Data not available.');
                                        }
                                        else {
                                            let data_ = parsedData.props.data;
                                            data_ = generateGuidChannelsDB(data_);
                                            MoleOnlineWebUI.Bridge.Events.invokeChannelDataLoaded(data_);
                                            showDefaultVisuals(plugin, data_.Channels)
                                                .then(() => {
                                                res();
                                            }).catch(err => console.log(err));
                                        }
                                    })
                                        .catch(error => rej(error));
                                }).catch(err => rej(err));
                            }
                        }).catch(err => rej(err));
                    });
                }
                function downloadProteinData(plugin, computationId, submitId) {
                    return new LiteMol.Promise((res, rej) => {
                        ApiService.getProteinStructure(computationId, submitId).then((data) => {
                            let format = LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF;
                            if (data.filename !== null) {
                                let f = LiteMol.Core.Formats.FormatInfo.getFormat(data.filename, LiteMol.Core.Formats.Molecule.SupportedFormats.All);
                                if (f !== void 0) {
                                    format = f;
                                }
                            }
                            let protein = plugin.createTransform()
                                .add(plugin.root, Transformer.Data.FromData, { data: data.data, id: `${computationId}/${submitId}` }, { isBinding: true, ref: 'protein-data' })
                                .then(Transformer.Molecule.CreateFromData, { format }, { isBinding: true })
                                .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
                                .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true });
                            plugin.applyTransform(protein)
                                .then(() => {
                                let polymerVisual = plugin.context.select('polymer-visual');
                                if (polymerVisual.length !== 1) {
                                    rej("Application was unable to retrieve protein structure from coordinate server.");
                                }
                                else {
                                    plugin.command(LiteMol.Bootstrap.Command.Entity.Focus, polymerVisual);
                                    res();
                                    MoleOnlineWebUI.Bridge.Events.invokeProteinDataLoaded(polymerVisual[0].props.model.model);
                                }
                            })
                                .catch(error => rej(error));
                        })
                            .catch(error => rej(error));
                    });
                }
                function loadData(plugin, channelsDB) {
                    //plugin.clear();
                    if (Config.CommonOptions.DEBUG_MODE)
                        console.profile("loadData");
                    let modelLoadPromise = new LiteMol.Promise((res, rej) => {
                        let parameters = CommonUtils.Router.getParameters();
                        if (parameters === null) {
                            rej("Corrupted url found - cannot parse parameters.");
                            return;
                        }
                        let computationId = parameters.computationId;
                        let submitId = parameters.submitId;
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log("Status watcher - BEFORE EXEC");
                        MoleOnlineWebUI.DataProxy.JobStatus.Watcher.registerOnChangeHandler(computationId, submitId, (status => {
                            if (Config.CommonOptions.DEBUG_MODE)
                                console.log("Watcher iteration");
                            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                            let proteinLoaded = existsRefInTree(plugin.root, 'protein-data');
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
                                acquireData(computationId, submitId, plugin, res, rej, !proteinLoaded, submitId == 0, channelsDB);
                            }
                            else if (status.Status === "FailedInitialization" || status.Status === "Error" || status.Status === "Deleted" || status.Status === "Aborted") {
                                rej(status.ErrorMsg);
                            }
                            else if (status.Status === "Finished") {
                                acquireData(computationId, submitId, plugin, res, rej, !proteinLoaded, true, channelsDB);
                            }
                        }), (err) => rej(err));
                    });
                    let promises = [];
                    promises.push(modelLoadPromise);
                    return LiteMol.Promise.all(promises);
                }
                State.loadData = loadData;
                function existsRefInTree(root, ref) {
                    if (root.ref === ref) {
                        return true;
                    }
                    for (let c of root.children) {
                        if (existsRefInTree(c, ref)) {
                            return true;
                        }
                    }
                    return false;
                }
                function acquireData(computationId, submitId, plugin, res, rej, protein, channels, channelsDB) {
                    let promises = [];
                    if (protein) {
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log("reloading protein structure");
                        let proteinAndCSA = new LiteMol.Promise((res, rej) => {
                            downloadProteinData(plugin, computationId, submitId)
                                .then(() => {
                                let csaOriginsExists = existsRefInTree(plugin.root, 'csa-origins');
                                if (!csaOriginsExists) {
                                    if (Config.CommonOptions.DEBUG_MODE)
                                        console.log("reloading CSA Origins");
                                    createCSAOriginsData(plugin, computationId)
                                        .then(() => res())
                                        .catch((err) => rej(err));
                                }
                                else {
                                    res();
                                }
                            })
                                .catch(err => rej(err));
                        });
                        promises.push(proteinAndCSA);
                    }
                    if (channels && !channelsDB) {
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.log("reloading channels");
                        promises.push(downloadChannelsData(plugin, computationId, submitId));
                    }
                    if (channelsDB) {
                        promises.push(downloadChannelsDBData(plugin, computationId));
                    }
                    LiteMol.Promise.all(promises)
                        .then(() => {
                        res();
                        if (Config.CommonOptions.DEBUG_MODE)
                            console.profileEnd();
                    })
                        .catch((error) => {
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
                    let surface = {
                        vertices: mesh.Vertices,
                        vertexCount: (mesh.Vertices.length / 3) | 0,
                        triangleIndices: new Uint32Array(mesh.Triangles),
                        triangleCount: (mesh.Triangles.length / 3) | 0,
                    };
                    return surface;
                }
                function createTriangleSurface(mesh) {
                    const triangleCount = (mesh.Triangles.length / 3) | 0;
                    const vertexCount = triangleCount * 3;
                    const srcV = mesh.Vertices;
                    const srcT = mesh.Triangles;
                    const vertices = new Float32Array(vertexCount * 3);
                    const triangleIndices = new Uint32Array(triangleCount * 3);
                    const annotation = new Int32Array(vertexCount);
                    const tri = [0, 0, 0];
                    for (let i = 0, _i = mesh.Triangles.length; i < _i; i += 3) {
                        tri[0] = srcT[i];
                        tri[1] = srcT[i + 1];
                        tri[2] = srcT[i + 2];
                        for (let j = 0; j < 3; j++) {
                            const v = i + j;
                            vertices[3 * v] = srcV[3 * tri[j]];
                            vertices[3 * v + 1] = srcV[3 * tri[j] + 1];
                            vertices[3 * v + 2] = srcV[3 * tri[j] + 2];
                            triangleIndices[i + j] = i + j;
                        }
                    }
                    for (let i = 0; i < triangleCount; i++) {
                        for (let j = 0; j < 3; j++)
                            annotation[3 * i + j] = i;
                    }
                    const surface = {
                        vertices,
                        vertexCount,
                        triangleIndices,
                        triangleCount,
                        annotation
                    };
                    return surface;
                }
                function createTunnelSurface(sphereArray) {
                    let s = LiteMol.Visualization.Primitive.Builder.create();
                    let id = 0;
                    let idxFilter = 1;
                    let idxCounter = 0;
                    for (let sphere of sphereArray) {
                        idxCounter++;
                        if ((idxCounter - 1) % idxFilter !== 0) {
                            continue;
                        }
                        s.add({ type: 'Sphere', id: 0 /*id++*/, radius: sphere.Radius, center: [sphere.X, sphere.Y, sphere.Z], tessalation: 2 });
                    }
                    return s.buildSurface().run();
                }
                function getSurfaceColorByType(type) {
                    switch (type) {
                        /*case 'Cavity': return ColorScheme.Colors.get(ColorScheme.Enum.Cavity);
                        case 'MolecularSurface': return ColorScheme.Colors.get(ColorScheme.Enum.Surface);
                        case 'Void': return ColorScheme.Colors.get(ColorScheme.Enum.Void);*/
                        default: return ColorScheme.Colors.get(ColorScheme.Enum.DefaultColor);
                    }
                }
                function showSurfaceVisuals(plugin, elements, visible, type, label, alpha) {
                    let t = plugin.createTransform();
                    let needsApply = false;
                    for (let element of elements) {
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
                            const boundarySurface = createTriangleSurface(element.Mesh.Boundary);
                            const group = t.add('mole-data', Transformer.Basic.CreateGroup, {}, { ref: element.__id, isHidden: true });
                            group.then(Transformer.Basic.CreateSurfaceVisual, {
                                label: label(element),
                                tag: { kind: 'Cavity-boundary', element, surface: boundarySurface },
                                surface: boundarySurface,
                                theme: Channels.Behaviour.CavityTheme.boundary
                            });
                            group.then(Transformer.Basic.CreateSurfaceVisual, {
                                label: label(element),
                                tag: { kind: 'Cavity-inner', element },
                                surface: createSurface(element.Mesh.Inner),
                                theme: Channels.Behaviour.CavityTheme.inner
                            });
                            needsApply = true;
                        }
                        else {
                            let surface = createSurface(element.Mesh);
                            t.add('mole-data', State.CreateSurface, {
                                label: label(element),
                                tag: { kind: type, element },
                                surface,
                                color: element.__color,
                                isInteractive: true,
                                transparency: { alpha }
                            }, { ref: element.__id, isHidden: true });
                            needsApply = true;
                        }
                    }
                    if (needsApply) {
                        return new LiteMol.Promise((res, rej) => {
                            plugin.applyTransform(t).then(() => {
                                for (let element of elements) {
                                    element.__isBusy = false;
                                }
                                res();
                            }).catch(e => rej(e));
                        });
                    }
                    else {
                        return new LiteMol.Promise((res, rej) => {
                            for (let element of elements) {
                                element.__isBusy = false;
                            }
                            res();
                        });
                    }
                }
                function showCavityVisuals(plugin, cavities, visible) {
                    return showSurfaceVisuals(plugin, cavities, visible, 'Cavity', (cavity) => `${cavity.Type} ${cavity.Id}`, 0.33);
                }
                State.showCavityVisuals = showCavityVisuals;
                ;
                function showChannelVisuals(plugin, channels, visible, forceRepaint) {
                    let label = (channel) => `${channel.Type} ${CommonUtils.Tunnels.getName(channel)}`;
                    /*let type = "Channel";*/
                    let alpha = 1.0;
                    let promises = [];
                    let visibleChannels = [];
                    for (let channel of channels) {
                        // Stejné jako v Examples/Channels
                        if (!channel.__id)
                            channel.__id = LiteMol.Bootstrap.Utils.generateUUID();
                        if (!!channel.__isVisible === visible && !forceRepaint)
                            continue;
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
                            //Zde se volá mnou vytvořená funkce pro generování povrchu podle koulí z JSONu(u nás zatím Centerline, u Vás Profile)
                            let sphereSurfacePromise = createTunnelSurface(channel.Profile); //createTunnelSurfaceWithLayers(channel.Profile, channel.Layers);
                            promises.push(new LiteMol.Promise((res, rej) => {
                                //Zpracování úspěšně vygenerovného povrchu tunelu
                                sphereSurfacePromise.then((val) => {
                                    let surface = val;
                                    /*
                                    if(surface.surface.annotation !== void 0){
                                        console.log("---");
                                        console.log(`annotations length: ${surface.surface.annotation.length}`);
                                        console.log(`profile parts count: ${channel.Profile.length}`);
                                        console.log("---");
                                        for(let i=0;i<surface.surface.annotation.length;i++){
                                            surface.surface.annotation[i] = 0;
                                            //console.log(`surface.annotation: ${surface.surface.annotation[i]}`);
                                        }
                                    }
                                    */
                                    let t = plugin.createTransform();
                                    t.add('mole-data', State.CreateSurface, {
                                        label: label(channel),
                                        tag: { kind: "Channel", element: channel },
                                        surface: surface /*.surface*/,
                                        color: channel.__color,
                                        isInteractive: true,
                                        transparency: { alpha },
                                    }, { ref: channel.__id, isHidden: true });
                                    plugin.applyTransform(t).then(() => { res(); });
                                }).catch(rej);
                            }));
                        }
                    }
                    MoleOnlineWebUI.Cache.LastVisibleChannels.set(visibleChannels);
                    return LiteMol.Promise.all(promises).then(() => {
                        for (let channel of channels) {
                            channel.__isBusy = false;
                        }
                    });
                }
                State.showChannelVisuals = showChannelVisuals;
                function createOriginsSurface(origins) {
                    if (origins.__surface)
                        return LiteMol.Promise.resolve(origins.__surface);
                    let s = LiteMol.Visualization.Primitive.Builder.create();
                    let id = 0;
                    for (let p of origins.Points) {
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
                    return new LiteMol.Promise((res, rej) => {
                        createOriginsSurface(origins).then(surface => {
                            let t = plugin.createTransform()
                                .add('mole-data', State.CreateSurface, {
                                label: 'Origins (' + origins.Type + ')',
                                tag: { kind: 'Origins', element: origins },
                                surface,
                                isInteractive: true,
                                color: origins.__color
                            }, { ref: origins.__id, isHidden: true });
                            plugin.applyTransform(t).then(() => {
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
                    defaultParams: () => ({}),
                    isUpdatable: false
                }, (context, a, t) => {
                    let theme = LiteMol.Visualization.Theme.createUniform({ colors: LiteMol.Core.Utils.FastMap.ofArray([['Uniform', t.params.color]]), interactive: t.params.isInteractive, transparency: t.params.transparency });
                    let style = {
                        type: 'Surface',
                        taskType: 'Silent',
                        //isNotSelectable: false,
                        params: {},
                        theme: void 0
                    };
                    return LiteMol.Bootstrap.Task.create(`Create Surface`, 'Silent', (ctx) => __awaiter(this, void 0, void 0, function* () {
                        let model = yield LiteMol.Visualization.Surface.Model.create(t.params.tag, { surface: t.params.surface, theme, parameters: { isWireframe: t.params.isWireframe } }).run(ctx);
                        return LiteMol.Bootstrap.Entity.Visual.Surface.create(t, { label: t.params.label, model, style, isSelectable: true, tag: t.params.tag });
                    }));
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
                class App extends React.Component {
                    constructor() {
                        super(...arguments);
                        this.state = { isLoading: false, data: void 0, error: void 0 };
                    }
                    componentDidMount() {
                        let params = CommonUtils.Router.getParameters();
                        let channelsDB = false;
                        if (params !== null) {
                            channelsDB = params.isChannelsDB;
                        }
                        this.load(channelsDB);
                        $(window).on("contentResize", this.onContentResize.bind(this));
                        MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId((submitId) => {
                            try {
                                this.load(submitId === -1);
                            }
                            catch (ex) {
                                if (Config.CommonOptions.DEBUG_MODE)
                                    console.log(ex);
                                this.setState({ isLoading: false, data: void 0, error: "Data not available" });
                            }
                        });
                        MoleOnlineWebUI.Bridge.Events.subscribeOnSequneceViewerToggle((params) => {
                            if (params.minimized) {
                                $('#plugin').addClass("sv-minimized");
                            }
                            else {
                                $('#plugin').removeClass("sv-minimized");
                            }
                            $(window).trigger('contentResize');
                        });
                    }
                    onContentResize(_) {
                        let prevState = this.props.plugin.context.layout.latestState;
                        this.props.plugin.setLayoutState({ isExpanded: true });
                        this.props.plugin.setLayoutState(prevState);
                    }
                    load(channelsDB) {
                        this.setState({ isLoading: true, error: void 0 }); //https://webchem.ncbr.muni.cz/API/ChannelsDB/PDB/1tqn
                        Channels_1.State.loadData(this.props.plugin, channelsDB)
                            .then(data => {
                            if (Config.CommonOptions.DEBUG_MODE)
                                console.log("loading done ok");
                            let entities = this.props.plugin.context.select("mole-data");
                            if (entities.length === 0) {
                                let params = CommonUtils.Router.getParameters();
                                if (params === null) {
                                    this.setState({ isLoading: false, error: `Sorry. Given url is not valid.` });
                                    return;
                                }
                                let computationId = params.computationId;
                                let submitId = params.submitId;
                                this.setState({ isLoading: false, error: `There are no vizualization data for computation '${computationId}' and submission '${submitId}'. Try to submit some computation job.` });
                                return;
                            }
                            let _data = entities[0].props.data;
                            let csaOrigins = this.props.plugin.context.select("csa-origins");
                            if (csaOrigins.length > 0) {
                                if (_data.Origins === void 0) {
                                    _data.Origins = {};
                                }
                                _data.Origins.CSAOrigins = csaOrigins[0].props.data.Origins.CSAOrigins;
                            }
                            if (_data.Error !== void 0) {
                                this.setState({ isLoading: false, error: _data.Error });
                            }
                            else {
                                this.setState({
                                    isLoading: false, data: _data, error: void 0
                                });
                            }
                        })
                            .catch(e => {
                            this.setState({ isLoading: false, error: 'Application was unable to load data. Please try again later.', data: void 0 });
                        });
                    }
                    render() {
                        if (this.state.data) {
                            return React.createElement(Data, { data: this.state.data, plugin: this.props.plugin });
                        }
                        else {
                            let controls = [];
                            if (this.state.isLoading) {
                                controls.push(React.createElement("h1", null, "Loading..."));
                            }
                            else {
                                if (this.state.error) {
                                    let error = this.state.error;
                                    let errorMessage = (error === void 0) ? "" : error;
                                    controls.push(React.createElement("div", { className: "error-message" },
                                        React.createElement("div", null,
                                            React.createElement("b", null, "Data for specified protein are not available.")),
                                        React.createElement("div", null,
                                            React.createElement("b", null, "Reason:"),
                                            " ",
                                            React.createElement("i", { dangerouslySetInnerHTML: { __html: errorMessage } }))));
                                }
                                let params = CommonUtils.Router.getParameters();
                                let channelsDB = false;
                                if (params !== null) {
                                    channelsDB = params.isChannelsDB;
                                }
                                controls.push(React.createElement("button", { className: "reload-data btn btn-primary", onClick: () => this.load(channelsDB) }, "Reload Data"));
                            }
                            return React.createElement("div", null, controls);
                        }
                    }
                }
                UI.App = App;
                class Data extends React.Component {
                    render() {
                        let channels = new Map();
                        channels.set('Merged pores', (!this.props.data.Channels.MergedPores) ? [] : this.props.data.Channels.MergedPores);
                        channels.set('Paths', (!this.props.data.Channels.Paths) ? [] : this.props.data.Channels.Paths);
                        channels.set('Pores', (!this.props.data.Channels.Pores) ? [] : this.props.data.Channels.Pores);
                        channels.set('Tunnels', (!this.props.data.Channels.Tunnels) ? [] : this.props.data.Channels.Tunnels);
                        let channelsDBChannels = this.props.data.Channels;
                        channels.set('Reviewed Channels', (!channelsDBChannels.ReviewedChannels) ? [] : channelsDBChannels.ReviewedChannels);
                        channels.set('CSA Tunnels', (!channelsDBChannels.CSATunnels) ? [] : channelsDBChannels.CSATunnels);
                        channels.set('Transmembrane Pores', (!channelsDBChannels.TransmembranePores) ? [] : channelsDBChannels.TransmembranePores);
                        channels.set('Cofactor Tunnels', (!channelsDBChannels.CofactorTunnels) ? [] : channelsDBChannels.CofactorTunnels);
                        let channelsControls = [];
                        channels.forEach((val, key, map) => {
                            if (val.length > 0) {
                                channelsControls.push(React.createElement(Channels, { channels: val, state: this.props, header: key.valueOf() }));
                            }
                        });
                        let noChannelsData = React.createElement("div", { className: "no-channels-data" }, "There are no channels available...");
                        let cavities = new Map();
                        if (this.props.data.Cavities !== void 0) {
                            cavities.set('Surface', [this.props.data.Cavities.Surface]);
                            cavities.set('Cavities', this.props.data.Cavities.Cavities);
                            cavities.set('Voids', this.props.data.Cavities.Voids);
                        }
                        let cavitiesControls = [];
                        cavities.forEach((val, key, map) => {
                            if (val.length > 0) {
                                cavitiesControls.push(React.createElement(Cavities, { cavities: val, state: this.props, header: key.valueOf() }));
                            }
                        });
                        let noCavitiesData = React.createElement("div", { className: "no-channels-data" }, "There are no cavities available...");
                        let originsControls = [];
                        if (this.props.data.Origins.User !== void 0)
                            originsControls.push(React.createElement(Origins, Object.assign({ origins: this.props.data.Origins.User }, this.props, { label: 'User Specifed (optimized)' })));
                        if (this.props.data.Origins.InputOrigins !== void 0)
                            originsControls.push(React.createElement(Origins, Object.assign({ origins: this.props.data.Origins.InputOrigins }, this.props, { label: 'User Specifed' })));
                        if (this.props.data.Origins.Computed !== void 0)
                            originsControls.push(React.createElement(Origins, Object.assign({ origins: this.props.data.Origins.Computed }, this.props, { label: 'Computed' })));
                        if (this.props.data.Origins.Databse !== void 0)
                            originsControls.push(React.createElement(Origins, Object.assign({ origins: this.props.data.Origins.Database }, this.props, { label: 'Database' })));
                        if (this.props.data.Origins.InputExits !== void 0)
                            originsControls.push(React.createElement(Origins, Object.assign({ origins: this.props.data.Origins.InputExits }, this.props, { label: 'Input Exits' })));
                        if (this.props.data.Origins.InputFoundExits !== void 0)
                            originsControls.push(React.createElement(Origins, Object.assign({ origins: this.props.data.Origins.InputFoundExits }, this.props, { label: 'Input Found Exits' })));
                        if (this.props.data.Origins.CSAOrigins !== void 0)
                            originsControls.push(React.createElement(Origins, Object.assign({ origins: this.props.data.Origins.CSAOrigins }, this.props, { label: 'CSA Origins' })));
                        let noOriginsData = React.createElement("div", { className: "no-channels-data" }, "There are no origins available...");
                        return React.createElement("div", null,
                            React.createElement(Selection, Object.assign({}, this.props)),
                            React.createElement("div", { className: "ui-header" }, "Channels"),
                            React.createElement("div", null, (channelsControls.length === 0) ? noChannelsData : channelsControls),
                            React.createElement("div", { className: "ui-header origins" }, "Origins"),
                            React.createElement("div", null, (originsControls.length === 0) ? noOriginsData : originsControls),
                            React.createElement("div", { className: "ui-header cavities" }, "Cavities"),
                            React.createElement("div", null, (cavitiesControls.length === 0) ? noCavitiesData : cavitiesControls));
                    }
                }
                UI.Data = Data;
                ;
                class Selection extends React.Component {
                    constructor() {
                        super(...arguments);
                        this.state = { label: void 0 };
                        //private observer: Bootstrap.Rx.IDisposable | undefined = void 0;
                        this.observerChannels = void 0;
                    }
                    componentWillMount() {
                        CommonUtils.Selection.SelectionHelper.attachOnResidueBulkSelectHandler(((r) => {
                            if (r.length === 0) {
                                this.setState({
                                    label: void 0
                                });
                                return;
                            }
                            let label = r.map((val, idx, array) => {
                                let name = CommonUtils.Residues.getName(val.authSeqNumber, this.props.plugin);
                                return `${name}&nbsp;${val.authSeqNumber}&nbsp;${val.chain.authAsymId}`;
                            }).reduce((prev, cur, idx, array) => {
                                return `${prev}${(idx === 0) ? '' : ',\n'}${cur}`;
                            });
                            let items = label.split('\n');
                            let elements = [];
                            for (let e of items) {
                                let lineParts = e.split('&nbsp;');
                                elements.push(React.createElement("div", null,
                                    lineParts[0],
                                    "\u00A0",
                                    lineParts[1],
                                    "\u00A0",
                                    lineParts[2]));
                            }
                            this.setState({
                                label: React.createElement("div", { className: "columns" }, elements)
                            });
                        }).bind(this));
                        CommonUtils.Selection.SelectionHelper.attachOnPointBulkSelectHandler(((points) => {
                            let elements = [];
                            for (let e of points) {
                                elements.push(React.createElement("div", null,
                                    "[",
                                    Number(e.x).toFixed(2),
                                    ",\u00A0",
                                    Number(e.y).toFixed(2),
                                    ",\u00A0",
                                    Number(e.z).toFixed(2),
                                    "]"));
                            }
                            this.setState({
                                label: React.createElement("div", { className: "columns points" }, elements)
                            });
                        }).bind(this));
                        CommonUtils.Selection.SelectionHelper.attachOnClearSelectionHandler((() => {
                            this.setState({ label: void 0 });
                            $("#left-tabs li a[href='#left-tabs-1']")
                                .text("Channel profile");
                        }).bind(this));
                        this.observerChannels = this.props.plugin.subscribe(LiteMol.Bootstrap.Event.Visual.VisualSelectElement, e => {
                            let eventData = e.data;
                            if (e.data !== void 0 && eventData.source !== void 0 && eventData.source.props !== void 0 && eventData.source.props.tag === void 0) {
                                return;
                            }
                            if (e.data && (eventData === void 0 || e.data.kind !== 0)) {
                                if (CommonUtils.Selection.SelectionHelper.isSelectedAnyChannel()) {
                                    let data = e.data;
                                    let c = data.source.props.tag.element;
                                    let tunnelName = CommonUtils.Tunnels.getName(c);
                                    let len = CommonUtils.Tunnels.getLength(c);
                                    if (CommonUtils.Router.isInChannelsDBMode()) {
                                        let annotations = MoleOnlineWebUI.Cache.ChannelsDBData.getChannelAnnotationsImmediate(c.Id);
                                        if (annotations !== null && annotations.length > 0) {
                                            tunnelName = annotations[0].name;
                                        }
                                        $("#left-tabs li a[href='#left-tabs-1']")
                                            .text(`Channel profile (${tunnelName})`);
                                        this.setState({ label: React.createElement("span", null,
                                                React.createElement("b", null, tunnelName),
                                                ", ",
                                                `Length: ${len} Å`) });
                                    }
                                    else {
                                        $("#left-tabs li a[href='#left-tabs-1']")
                                            .text(`Channel profile (${tunnelName})`);
                                        let namePart = (tunnelName === void 0) ? '' : ` (${tunnelName})`;
                                        this.setState({ label: React.createElement("span", null,
                                                React.createElement("b", null,
                                                    c.Type,
                                                    namePart),
                                                ", ",
                                                `Length: ${len} Å`) });
                                    }
                                }
                                else if (!CommonUtils.Selection.SelectionHelper.isSelectedAny()) {
                                    $("#left-tabs li a[href='#left-tabs-1']")
                                        .text(`Channel profile`);
                                    this.setState({ label: void 0 });
                                }
                            }
                        });
                    }
                    componentWillUnmount() {
                        /*if (this.observer) {
                            this.observer.dispose();
                            this.observer = void 0;
                        }*/
                        if (this.observerChannels) {
                            this.observerChannels.dispose();
                            this.observerChannels = void 0;
                        }
                    }
                    render() {
                        return React.createElement("div", null,
                            React.createElement("div", { className: "ui-selection-header" },
                                React.createElement("span", null, "Selection"),
                                React.createElement("div", { className: "btn btn-xs btn-default ui-selection-clear", onClick: (e) => {
                                        let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                                        CommonUtils.Selection.SelectionHelper.clearSelection(plugin);
                                        //CommonUtils.Selection.SelectionHelper.clearAltSelection(plugin);
                                    }, title: "Clear selection" },
                                    React.createElement("span", { className: "glyphicon glyphicon-trash" }))),
                            React.createElement("div", { className: "ui-selection" }, !this.state.label
                                ? React.createElement("i", null, "Click on atom residue or channel")
                                : this.state.label));
                    }
                }
                UI.Selection = Selection;
                class Section extends React.Component {
                    constructor() {
                        super(...arguments);
                        this.state = { isExpanded: false };
                    }
                    toggle(e) {
                        e.preventDefault();
                        this.setState({ isExpanded: !this.state.isExpanded });
                    }
                    render() {
                        return React.createElement("div", { className: "ui-item-container", style: { position: 'relative' } },
                            React.createElement("div", { className: "ui-subheader" },
                                React.createElement("a", { href: '#', onClick: e => this.toggle(e), className: 'section-header' },
                                    React.createElement("div", { style: { width: '15px', display: 'inline-block', textAlign: 'center' } }, this.state.isExpanded ? '-' : '+'),
                                    " ",
                                    this.props.header,
                                    " (",
                                    this.props.count,
                                    ")")),
                            React.createElement("div", { style: { display: this.state.isExpanded ? 'block' : 'none' } }, this.props.children));
                    }
                }
                UI.Section = Section;
                /*
                export class Renderable extends React.Component<{ label: string | JSX.Element, annotations?:MoleOnlineWebUI.Service.ChannelsDBAPI.ChannelAnnotation[], element: any, toggle: (plugin: Plugin.Controller, elements: any[], visible: boolean) => Promise<any> } & State, { }> {
                
                    private toggle() {
                        this.props.element.__isBusy = true;
                        this.forceUpdate(() =>
                            this.props.toggle(this.props.plugin, [this.props.element], !this.props.element.__isVisible)
                                .then(() => this.forceUpdate()).catch(() => this.forceUpdate()));
                    }
            
                    private highlight(isOn: boolean) {
                        this.props.plugin.command(Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.element.__id), isOn });
                    }
            
            
                    render() {
                        return <div className="ui-label">
                            <input type='checkbox' checked={!!this.props.element.__isVisible} onChange={() => this.toggle()} disabled={!!this.props.element.__isBusy} />
                            <label className="ui-label-element" onMouseEnter={() => this.highlight(true)} onMouseLeave={() => this.highlight(false)} >
                                 {this.props.label}
                            </label>
                        </div>
                    }
                }*/
                class Renderable extends React.Component {
                    constructor() {
                        super(...arguments);
                        this.state = { isAnnotationsVisible: false };
                    }
                    toggle() {
                        this.props.element.__isBusy = true;
                        this.forceUpdate(() => this.props.toggle(this.props.plugin, [this.props.element], !this.props.element.__isVisible)
                            .then(() => this.forceUpdate()).catch(() => this.forceUpdate()));
                    }
                    highlight(isOn) {
                        this.props.plugin.command(LiteMol.Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.element.__id), isOn });
                    }
                    toggleAnnotations(e) {
                        this.setState({ isAnnotationsVisible: !this.state.isAnnotationsVisible });
                    }
                    getAnnotationToggler() {
                        return [(this.state.isAnnotationsVisible)
                                ? React.createElement("span", { className: "hand glyphicon glyphicon-chevron-up", title: "Hide list annotations for this channel", onClick: this.toggleAnnotations.bind(this) })
                                : React.createElement("span", { className: "hand glyphicon glyphicon-chevron-down", title: "Show all annotations available for this channel", onClick: this.toggleAnnotations.bind(this) })];
                    }
                    getAnnotationsElements() {
                        if (this.props.annotations === void 0) {
                            return [];
                        }
                        if (!this.state.isAnnotationsVisible) {
                            return [];
                        }
                        let elements = [];
                        for (let annotation of this.props.annotations) {
                            let reference = React.createElement("i", null, "(No reference provided)");
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
                    }
                    render() {
                        let emptyToggler;
                        if (CommonUtils.Router.isInChannelsDBMode()) {
                            emptyToggler = React.createElement("span", { className: "disabled glyphicon glyphicon-chevron-down", title: "No annotations available for this channel", onClick: this.toggleAnnotations.bind(this) });
                        }
                        return React.createElement("div", { className: "ui-label" },
                            React.createElement("input", { type: 'checkbox', checked: !!this.props.element.__isVisible, onChange: () => this.toggle(), disabled: !!this.props.element.__isBusy }),
                            React.createElement("label", { className: "ui-label-element", onMouseEnter: () => this.highlight(true), onMouseLeave: () => this.highlight(false) },
                                (this.props.annotations !== void 0 && this.props.annotations.length > 0) ? this.getAnnotationToggler() : emptyToggler,
                                " ",
                                this.props.label),
                            this.getAnnotationsElements());
                    }
                }
                UI.Renderable = Renderable;
                class Channels extends React.Component {
                    constructor() {
                        super(...arguments);
                        this.state = { isBusy: false };
                    }
                    show(visible) {
                        for (let element of this.props.channels) {
                            element.__isBusy = true;
                        }
                        this.setState({ isBusy: true }, () => Channels_1.State.showChannelVisuals(this.props.state.plugin, this.props.channels, visible)
                            .then(() => this.setState({ isBusy: false })).catch(() => this.setState({ isBusy: false })));
                    }
                    isDisabled() {
                        return !this.props.channels || (this.props.channels !== void 0 && this.props.channels.length == 0);
                    }
                    render() {
                        return React.createElement(Section, { header: this.props.header, count: (this.props.channels || '').length },
                            React.createElement("div", { className: 'ui-show-all' },
                                React.createElement("button", { className: "btn btn-primary btn-xs", onClick: () => this.show(true), disabled: this.state.isBusy || this.isDisabled() }, "All"),
                                React.createElement("button", { className: "btn btn-primary btn-xs", onClick: () => this.show(false), disabled: this.state.isBusy || this.isDisabled() }, "None")),
                            this.props.channels && this.props.channels.length > 0
                                ? this.props.channels.map((c, i) => React.createElement(Channel, { key: i, channel: c, state: this.props.state }))
                                : React.createElement("div", { className: "ui-label ui-no-data-available" }, "No data available..."));
                    }
                }
                UI.Channels = Channels;
                class Channel extends React.Component {
                    constructor() {
                        super(...arguments);
                        this.state = { isVisible: false, isWaitingForData: false };
                    }
                    componentDidMount() {
                        MoleOnlineWebUI.Bridge.Events.subscribeChannelSelect(((channelId) => {
                            if (this.props.channel.Id === channelId) {
                                this.selectChannel(false);
                            }
                        }).bind(this));
                    }
                    dataWaitHandler() {
                        let state = this.state;
                        state.isWaitingForData = false;
                        this.setState(state);
                    }
                    invokeDataWait() {
                        if (this.state.isWaitingForData) {
                            return;
                        }
                        let state = this.state;
                        state.isWaitingForData = true;
                        this.setState(state);
                        //Annotation.AnnotationDataProvider.subscribeForData(this.dataWaitHandler.bind(this));
                    }
                    render() {
                        let c = this.props.channel;
                        let len = CommonUtils.Tunnels.getLength(c);
                        let name = MoleOnlineWebUI.Cache.TunnelName.get(c.GUID);
                        let namePart = (name === void 0) ? '' : ` (${name})`;
                        let annotations = MoleOnlineWebUI.Cache.ChannelsDBData.getChannelAnnotationsImmediate(c.Id);
                        if (annotations !== null && annotations !== void 0) {
                            let annotation = annotations[0];
                            return React.createElement(Renderable, Object.assign({ annotations: annotations, label: React.createElement("span", null,
                                    React.createElement("b", null,
                                        React.createElement("a", { onClick: this.selectChannel.bind(this) }, annotation.name)),
                                    React.createElement(ColorPicker, { tunnel: this.props.channel }),
                                    ", Length: ",
                                    React.createElement("b", null,
                                        len,
                                        " \u00C5")), element: c, toggle: Channels_1.State.showChannelVisuals }, this.props.state));
                        }
                        else {
                            return React.createElement(Renderable, Object.assign({ label: React.createElement("span", null,
                                    React.createElement("b", null,
                                        React.createElement("a", { onClick: this.selectChannel.bind(this) },
                                            c.Type,
                                            namePart)),
                                    React.createElement(ColorPicker, { tunnel: this.props.channel }),
                                    ", Length: ",
                                    React.createElement("b", null, `${len | 0} Å`)), element: c, toggle: (p, ch, v) => {
                                    return Channels_1.State.showChannelVisuals(p, ch, v)
                                        .then(res => {
                                        this.props.channel = ch[0];
                                        this.forceUpdate();
                                    });
                                } }, this.props.state));
                        }
                    }
                    selectChannel(updateUI) {
                        if (updateUI === void 0) {
                            updateUI = true;
                        }
                        let entity = this.props.state.plugin.context.select(this.props.channel.__id)[0];
                        if (entity === void 0 || entity.ref === "undefined") {
                            Channels_1.State.showChannelVisuals(this.props.state.plugin, [this.props.channel], true).then(() => {
                                if (updateUI) {
                                    let state = this.state;
                                    state.isVisible = true;
                                    this.setState(state);
                                }
                                this.selectChannel(updateUI);
                            });
                            return;
                        }
                        let channelRef = entity.ref;
                        let plugin = this.props.state.plugin;
                        plugin.command(LiteMol.Bootstrap.Command.Entity.Focus, plugin.context.select(channelRef));
                        plugin.command(LiteMol.Bootstrap.Event.Visual.VisualSelectElement, LiteMol.Bootstrap.Interactivity.Info.selection(entity, [0]));
                    }
                }
                UI.Channel = Channel;
                class Cavities extends React.Component {
                    constructor() {
                        super(...arguments);
                        this.state = { isBusy: false };
                    }
                    show(visible) {
                        for (let element of this.props.cavities) {
                            element.__isBusy = true;
                        }
                        this.setState({ isBusy: true }, () => Channels_1.State.showCavityVisuals(this.props.state.plugin, this.props.cavities, visible)
                            .then(() => this.setState({ isBusy: false })).catch(() => this.setState({ isBusy: false })));
                    }
                    isDisabled() {
                        return !this.props.cavities || (this.props.cavities !== void 0 && this.props.cavities.length == 0);
                    }
                    render() {
                        return React.createElement(Section, { header: this.props.header, count: (this.props.cavities || '').length },
                            React.createElement("div", { className: 'ui-show-all' },
                                React.createElement("button", { className: "btn btn-primary btn-xs", onClick: () => this.show(true), disabled: this.state.isBusy || this.isDisabled() }, "All"),
                                React.createElement("button", { className: "btn btn-primary btn-xs", onClick: () => this.show(false), disabled: this.state.isBusy || this.isDisabled() }, "None")),
                            this.props.cavities && this.props.cavities.length > 0
                                ? this.props.cavities.map((c, i) => React.createElement(Cavity, { key: i, cavity: c, state: this.props.state }))
                                : React.createElement("div", { className: "ui-label ui-no-data-available" }, "No data available..."));
                    }
                }
                UI.Cavities = Cavities;
                class Cavity extends React.Component {
                    constructor() {
                        super(...arguments);
                        this.state = { isVisible: false };
                    }
                    render() {
                        let c = this.props.cavity;
                        return React.createElement("div", null,
                            React.createElement(Renderable, Object.assign({ label: React.createElement("span", null,
                                    React.createElement("b", null, c.Id),
                                    ", Volume: ",
                                    React.createElement("b", null,
                                        `${c.Volume | 0} Å`,
                                        React.createElement("sup", null, "3"))), element: c, toggle: Channels_1.State.showCavityVisuals }, this.props.state)));
                    }
                }
                UI.Cavity = Cavity;
                class Origins extends React.Component {
                    toggle() {
                        this.props.origins.__isBusy = true;
                        this.forceUpdate(() => Channels_1.State.showOriginsSurface(this.props.plugin, this.props.origins, !this.props.origins.__isVisible)
                            .then(() => this.forceUpdate()).catch(() => this.forceUpdate()));
                    }
                    highlight(isOn) {
                        this.props.plugin.command(LiteMol.Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.origins.__id), isOn });
                    }
                    render() {
                        if (this.props.origins.Points === void 0 || !this.props.origins.Points.length) {
                            return React.createElement("div", { style: { display: 'none' } });
                        }
                        return React.createElement("div", null,
                            React.createElement("label", { onMouseEnter: () => this.highlight(true), onMouseLeave: () => this.highlight(false) },
                                React.createElement("input", { type: 'checkbox', checked: !!this.props.origins.__isVisible, onChange: () => this.toggle(), disabled: !!this.props.origins.__isBusy }),
                                " ",
                                this.props.label));
                    }
                }
                UI.Origins = Origins;
                let __colorPickerIdSeq = 0;
                function generateColorPickerId() {
                    return `color-picker-${__colorPickerIdSeq++}`;
                }
                class ColorPicker extends React.Component {
                    constructor() {
                        super(...arguments);
                        this.state = { visible: false };
                    }
                    componentDidMount() {
                        this.id = generateColorPickerId();
                        $(window).on('click', ((e) => {
                            if (!this.state.visible) {
                                return;
                            }
                            let el = $("#" + this.id)[0].children[0];
                            let rect = el.getBoundingClientRect();
                            if (!(e.clientX >= rect.left && e.clientX <= rect.left + rect.width
                                && e.clientY >= rect.top && e.clientY <= rect.top + rect.height)) {
                                this.setState({ visible: false });
                            }
                        }).bind(this));
                    }
                    render() {
                        if (!this.props.tunnel.__isVisible) {
                            return React.createElement("span", null);
                        }
                        let color = (this.props.tunnel.__color !== void 0) ? this.props.tunnel.__color : MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Colors.get(MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Enum.DefaultColor);
                        let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                        if (this.state.visible) {
                            return React.createElement("div", { className: "color-picker", id: this.id },
                                React.createElement(LiteMol.Plugin.Controls.ColorPicker, { color: color, onChange: c => {
                                        this.props.tunnel.__color = c;
                                        Channels_1.State.showChannelVisuals(plugin, [this.props.tunnel], this.props.tunnel.__isVisible, true);
                                    } }));
                        }
                        else {
                            return React.createElement("div", { className: "color-picker", id: this.id, style: { backgroundColor: `rgb(${Math.ceil(color.r * 255)},${Math.ceil(color.g * 255)},${Math.ceil(color.b * 255)})` }, onClick: (e) => {
                                    this.setState({ visible: true });
                                } });
                        }
                    }
                }
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
                context.highlight.addProvider(info => {
                    if (Interactivity.isEmpty(info) || info.source.type !== Bootstrap.Entity.Visual.Surface)
                        return void 0;
                    const tag = info.source.props.tag;
                    const e = tag.element;
                    switch (tag.kind) {
                        //                case 'Cavity': return `<b>${e.Type} ${e.Id}</b>, Volume: ${e.Volume | 0} Å`;
                        case 'Cavity-inner': return `<b>${e.Type} ${e.Id}</b>, Volume: ${e.Volume | 0} Å`;
                        case 'Cavity-boundary': return `<b>${e.Type} ${e.Id}</b>, Volume: ${e.Volume | 0} Å, Center: ${Channels.Behaviour.vec3str(Channels.Behaviour.getTriangleCenter(tag.surface, info.elements[0]))}`;
                        case 'Channel': {
                            let tunnel = e;
                            let len = CommonUtils.Tunnels.getLength(tunnel);
                            let bneck = CommonUtils.Tunnels.getBottleneck(tunnel);
                            let annotations = MoleOnlineWebUI.Cache.ChannelsDBData.getChannelAnnotationsImmediate(tunnel.Id);
                            if (CommonUtils.Router.isInChannelsDBMode() && annotations !== null && annotations.length > 0) {
                                return `<b>${annotations[0].name}</b>, Length: ${len} Å | Bottleneck: ${bneck} Å`;
                            }
                            else {
                                let name = MoleOnlineWebUI.Cache.TunnelName.get(tunnel.GUID);
                                let namePart = (name === void 0) ? '' : ` (${name})`;
                                return `<b>${tunnel.Type}${namePart}</b>, Length: ${len} Å | Bottleneck: ${bneck} Å`;
                            }
                        }
                        case 'Origins': {
                            let o = e.Points[info.elements[0]];
                            return `<b>Origin</b> (${e.Type}) at (${Number(o.X).toFixed(2)}, ${Number(o.Y).toFixed(2)}, ${Number(o.Z).toFixed(2)})`;
                        }
                        case 'Points': {
                            let o = e[info.elements[0]];
                            return `<b>Selected Point</b> at (${Number(o.x).toFixed(2)}, ${Number(o.y).toFixed(2)}, ${Number(o.z).toFixed(2)})`;
                        }
                        default: return void 0;
                    }
                });
            }
            Channels.HighlightCustomElements = HighlightCustomElements;
            function isSelectableVisual(info, ctx) {
                if (Interactivity.isEmpty(info) || info.source.type !== Bootstrap.Entity.Visual.Surface)
                    return true;
                const tag = info.source.props.tag;
                return tag.kind === 'Channel';
            }
            Channels.PluginSpec = {
                settings: {
                    'molecule.model.defaultQuery': `residuesByName('GLY', 'ALA')`,
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
                SimpleRouter.GlobalRouter.init(Config.Routing.ROUTING_OPTIONS[Config.Routing.ROUTING_MODE]);
                console.log(Config.Routing.ROUTING_MODE);
                let lvSettings = {
                    coloringProperty: "Hydropathy",
                    useColorMinMax: true,
                    skipMiddleColor: false,
                    topMargin: 0,
                    customRadiusProperty: "MinRadius"
                };
                //Create instance of layer vizualizer
                let layerVizualizer = new LayersVizualizer.Vizualizer('layer-vizualizer-ui', lvSettings);
                MoleOnlineWebUI.Bridge.Instances.setLayersVizualizer(layerVizualizer);
                let plugin = LiteMol.Plugin.create({
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
                Annotate.UI.render(document.getElementById("annotate"));
                AlertMessages.UI.render(document.getElementById("alert-messages"));
                SequenceViewer.UI.render(document.getElementById("sequence-viewer"), plugin);
                LoadingScreen.UI.render(document.getElementById("loading-screen"));
            })();
        })(Channels = Example.Channels || (Example.Channels = {}));
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
