import { PluginCommands } from "molstar/lib/mol-plugin/commands";
import { Events, Instances } from "../../Bridge";
import { Layers, OriginsSourceData, ShapeSourceData, SurfaceSourceData, Tunnel, TunnelMetaInfo } from "../../DataInterface";
import { MoleConfigResidue } from "../../MoleAPIService";
import { Context } from "../Context";
import { Point, Residues } from "./Residues";
import { QueryHelper, QueryParam } from "../VizualizerMol/helpers";
import { Colors, Enum } from "../../StaticData";
import { StructureElement, StructureProperties as Props } from "molstar/lib/mol-model/structure";
import { Representation } from "molstar/lib/mol-repr/representation";
import { EmptyLoci, Loci } from "molstar/lib/mol-model/loci";
import { Shape, ShapeGroup } from "molstar/lib/mol-model/shape";
import { Geometry } from "molstar/lib/mol-geo/geometry/geometry";
import { OrderedSet } from "molstar/lib/mol-data/int";
import { getTriangleCenter } from "../Behaviour";
import { Vec3 } from "molstar/lib/mol-math/linear-algebra";
import { StateSelection } from "molstar/lib/mol-state";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import { StructureComponent } from "molstar/lib/mol-plugin-state/transforms/model";
import { StructureRepresentation3D } from "molstar/lib/mol-plugin-state/transforms/representation";
import { MarkerAction } from "molstar/lib/mol-util/marker-action";

// import Transformer = LiteMol.Bootstrap.Entity.Transformer;
//TODO Molstar

export interface LightResidueInfo {
    authSeqNumber: number,
    chain: {
        authAsymId: string
    },
    operatorName: string,
    isHet: boolean,
    loci: Loci | undefined,
};

export interface SelectionObject {
    elements: number[]
};

interface ResidueInfo {
    index: number;
    name: string;
    authName: string;
    seqNumber: number;
    authSeqNumber: number;
    insCode: string;
    isHet: boolean;
    chain: ChainInfo;
    operatorName: string;
    loci: Loci | undefined;
}
interface ChainInfo {
    index: number;
    asymId: string;
    authAsymId: string;
    entity: EntityInfo;
}
interface EntityInfo {
    index: number;
    entityId: string;
}

export interface ResidueLight { type: "light", info: LightResidueInfo };
export interface Residue { type: "full", info: ResidueInfo };
export interface StringPoint { x: string, y: string, z: string };

export class SelectionHelper {
    private static SELECTION_VISUAL_REF = "res_visual";
    private static SELECTION_ALT_VISUAL_REF = "alt_res_visual";

    private static selectedChannelRef: string | undefined;
    private static selectedChannelId: string | undefined;
    private static selectedChannelReprLoci: Representation.Loci<Loci>|undefined;
    private static selectedResidues: LightResidueInfo[] | undefined;
    private static selectedPoints: Point[] | undefined;
    private static selectedTPoint: Point | undefined;

    private static selectedChannelData: Layers | undefined;
    private static selectedChannel: Tunnel & TunnelMetaInfo | undefined;

    private static onPointSelectHandlers: { handler: (points: Point[]) => void }[];
    private static onResidueSelectHandlers: { handler: (residue: ResidueInfo) => void }[];
    private static onResidueLightSelectHandlers: { handler: (residue: LightResidueInfo) => void }[];
    private static onResidueBulkSelectHandlers: { handler: (residues: LightResidueInfo[]) => void }[];
    private static onClearSelectionHandlers: { handler: () => void }[];
    private static onClearSelectionSequence: { handler: () => void }[];
    private static onChannelSelectHandlers: { handler: (data: Layers, channelId?: string, submissionId?: string) => void }[];
    private static onChannelSelectHandlers2: { handler: (channel: Tunnel & TunnelMetaInfo) => void }[];
    private static onChannelDeselectHandlers: { handler: () => void }[];
    // private static onChannelChanged

    public static attachOnResidueSelectHandler(handler: (residues: LightResidueInfo[]) => void) {
        if (this.onResidueBulkSelectHandlers === void 0) {
            this.onResidueBulkSelectHandlers = [];
        }

        this.onResidueBulkSelectHandlers.push({ handler });
    }
    private static invokeOnResidueSelectHandlers(residues: LightResidueInfo[]) {
        if (this.onResidueBulkSelectHandlers === void 0) {
            return;
        }

        for (let h of this.onResidueBulkSelectHandlers) {
            h.handler(residues);
        }
    }

    public static attachOnClearSelectionSequence(handler: () => void) {
        if (this.onClearSelectionSequence === void 0) {
            this.onClearSelectionSequence = [];
        }

        this.onClearSelectionSequence.push({ handler });
    }
    public static invokeOnClearSelectionSequence() {
        if (this.onClearSelectionSequence === void 0) {
            return;
        }

        for (let h of this.onClearSelectionSequence) {
            h.handler();
        }
    }

    public static attachOnClearSelectionHandler(handler: () => void) {
        if (this.onClearSelectionHandlers === void 0) {
            this.onClearSelectionHandlers = [];
        }

        this.onClearSelectionHandlers.push({ handler });
    }
    private static invokeOnClearSelectionHandlers() {
        if (this.onClearSelectionHandlers === void 0) {
            return;
        }

        for (let h of this.onClearSelectionHandlers) {
            h.handler();
        }
    }

    public static attachOnChannelSelectHandler(handler: (data: Layers, channelId?: string, submissionId?: string) => void) {
        if (this.onChannelSelectHandlers === void 0) {
            this.onChannelSelectHandlers = [];
        }

        this.onChannelSelectHandlers.push({ handler });
    }
    private static invokeOnChannelSelectHandlers(data: Layers, channelId?: string, submissionId?: string) {
        if (this.onChannelSelectHandlers === void 0) {
            return;
        }

        for (let h of this.onChannelSelectHandlers) {
            h.handler(data, channelId, submissionId);
        }
    }

    public static attachOnChannelSelectHandler2(handler: (channel: Tunnel & TunnelMetaInfo) => void) {
        if (this.onChannelSelectHandlers2 === void 0) {
            this.onChannelSelectHandlers2 = [];
        }

        this.onChannelSelectHandlers2.push({ handler });
    }
    private static invokeOnChannelSelectHandlers2(channel: Tunnel & TunnelMetaInfo) {
        if (this.onChannelSelectHandlers2 === void 0) {
            return;
        }

        for (let h of this.onChannelSelectHandlers2) {
            h.handler(channel);
        }
    }

    public static attachOnChannelDeselectHandler(handler: () => void) {
        if (this.onChannelDeselectHandlers === void 0) {
            this.onChannelDeselectHandlers = [];
        }

        this.onChannelDeselectHandlers.push({ handler });
    }
    private static invokeOnChannelDeselectHandlers() {
        if (this.onChannelDeselectHandlers === void 0) {
            return;
        }

        for (let h of this.onChannelDeselectHandlers) {
            h.handler();
        }
    }

    //For PDF report
    public static forceInvokeOnChannelDeselectHandlers() {
        this.invokeOnChannelDeselectHandlers();
    }

    public static attachOnPointBulkSelectHandler(handler: (points: Point[]) => void) {
        if (this.onPointSelectHandlers === void 0) {
            this.onPointSelectHandlers = [];
        }

        this.onPointSelectHandlers.push({ handler });
    }
    private static invokeOnPointSelectHandlers(points: Point[]) {
        if (this.onPointSelectHandlers === void 0) {
            return;
        }

        for (let h of this.onPointSelectHandlers) {
            h.handler(points);
        }
    }

    public static getSelectionVisualRef() {
        return this.SELECTION_VISUAL_REF;
    }

    public static getAltSelectionVisualRef() {
        return this.SELECTION_ALT_VISUAL_REF;
    }

    public static async clearSelection() { //TODO
        await this.clearSelectionPrivate();
        Context.getInstance().visual.clearSelection();
        this.invokeOnClearSelectionHandlers();
        //this.resetScene(plugin);
    }

    private static async clearSelectionPrivate() {
        await this.clearSelectedTPoint();
        await this.clearSelectedPoints();
        // LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, this.SELECTION_VISUAL_REF);
        if (this.selectedChannelRef !== void 0) {
            this.deselectTunnelByRef();
            this.selectedChannelRef = void 0;
            this.selectedChannelData = void 0;
            this.selectedChannel = void 0;
            this.selectedChannelId = void 0;
        }
        // LiteMol.Bootstrap.Event.Visual.VisualSelectElement.dispatch(plugin.context, LiteMol.Bootstrap.Interactivity.Info.empty);
        this.clearAltSelection();

        this.selectedResidues = void 0;

        this.invokeOnClearSelectionHandlers();
    }

    public static clearAltSelection() {
        // LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, this.SELECTION_ALT_VISUAL_REF);
    }


    public static resetScene() {
        //TODO reset scene
        // LiteMol.Bootstrap.Command.Visual.ResetScene.dispatch(plugin.context, void 0);
    }


    // private static chainEquals(c1: LiteMol.Bootstrap.Interactivity.Molecule.ChainInfo, c2: LiteMol.Bootstrap.Interactivity.Molecule.ChainInfo) {
    //     if ((c1.asymId !== c2.asymId)
    //         || (c1.authAsymId !== c2.authAsymId)
    //         || (c1.index !== c2.index)) {
    //         return false;
    //     }
    //     return true;
    // }

    private static residueEquals(r1: ResidueInfo | undefined, r2: ResidueInfo | undefined) {
        if (r1 === void 0 && r2 === void 0) {
            return true;
        }
        if (r1 === void 0 || r2 === void 0) {
            return false;
        }

        if ((r1.authName !== r2.authName)
            || (r1.authSeqNumber !== r2.authSeqNumber)
            // || (!this.chainEquals(r1.chain, r2.chain))
            || (r1.index !== r2.index)
            || (r1.insCode !== r2.insCode)
            || (r1.isHet !== r2.isHet)
            || (r1.name !== r2.name)
            || (r1.seqNumber !== r2.seqNumber)
        ) {
            return false;
        }

        return true;
    }

    private static residueBulkSort(bulk: LightResidueInfo[]) {
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

    private static residueBulkEquals(r1: LightResidueInfo[], r2: LightResidueInfo[]) {
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

    //TODO probably remove cause balls and sticks render automaticly with selection
    private static async selectResiduesBulkWithBallsAndSticks(residues: LightResidueInfo[]) {
        await SelectionHelper.clearSelectionPrivate();
        this.selectedChannelRef = void 0;
        this.selectedChannelData = void 0;
        this.selectedChannel = void 0;
        this.selectedChannelId = void 0;
        this.selectedResidues = void 0;
        await this.clearSelectedPoints();
        //this.resetScene(plugin);           

        if (this.selectedResidues !== void 0) {
            if (this.residueBulkEquals(residues, this.selectedResidues)) {
                return;
            }
        }

        let queries: QueryParam[] = [];
        let hetQueries: QueryParam[] = [];
        let locis: Loci[] = [];
        for (let residue of residues) {
            if (residue.isHet) {
                hetQueries.push({
                    struct_asym_id: residue.chain.authAsymId,
                    start_auth_residue_number: residue.authSeqNumber,
                    end_auth_residue_number: residue.authSeqNumber,
                    sideChain: true,
                    focus: false,
                    color: { r: 255, g: 0, b: 255 },
                    ...(residue.operatorName !== undefined && residue.operatorName !== '' && { operator_name: residue.operatorName })
                });
            } else if (residue.loci) {
                locis.push(residue.loci);
            } else {
                queries.push({
                    struct_asym_id: residue.chain.authAsymId,
                    start_auth_residue_number: residue.authSeqNumber,
                    end_auth_residue_number: residue.authSeqNumber,
                    sideChain: true,
                    focus: false,
                    color: { r: 255, g: 0, b: 255 },
                    ...(residue.operatorName !== undefined && residue.operatorName !== '' && { operator_name: residue.operatorName })
                });
            }
        }


        if (queries.length > 0) await Context.getInstance().visual.select({ data: queries })
        if (locis.length > 0) Context.getInstance().selectLocis(locis);
        // await Context.getInstance().visual.select({ data: hetQueries, isHet: true })

        // for (let residue of residues) {
        //     queries.push(
        //         LiteMol.Core.Structure.Query.chainsById(...[residue.chain.authAsymId]).intersectWith(
        //             LiteMol.Core.Structure.Query.residues(
        //                 ...[{ authSeqNumber: residue.authSeqNumber }]
        //             )
        //         ).compile()
        //     );
        // }

        // let query = LiteMol.Core.Structure.Query.or(...queries);

        // let t = plugin.createTransform();
        // const visualStyle = LiteMol.Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks');
        // if (visualStyle !== void 0) {
        //     visualStyle.taskType = "Silent";
        // }
        //TODO
        // t.add('polymer-visual', Transformer.Molecule.CreateSelectionFromQuery, { query, name: 'Residues', silent: true }, { ref: SelectionHelper.getSelectionVisualRef(), isHidden: true })
        //     .then(Transformer.Molecule.CreateVisual, { style: visualStyle }, { isHidden: true });

        // plugin.applyTransform(t);

        /*.then(()=>{
            //LiteMol.Bootstrap.Command.Entity.Focus.dispatch(plugin.context, plugin.context.select(CommonUtils.Selection.SelectionHelper.getSelectionVisualRef()));
        }); */

        if (residues.length > 0) {
            this.selectedResidues = residues;
        }
        else {
            this.selectedResidues = void 0;
        }

        this.invokeOnResidueSelectHandlers(residues);
    }

    public static getSelectedResidues(): (ResidueLight)[] {
        if (this.selectedResidues !== void 0) {
            return this.selectedResidues.map((val, idx, arr) => {
                return { type: "light", info: val } as ResidueLight;
            });
        }

        return [];
    }

    public static getSelectedPoints(): Point[] {
        if (this.selectedPoints !== void 0) {
            return this.selectedPoints;
        }

        return [];
    }

    private static residueToLight(residue: Residue): ResidueLight {
        return {
            type: "light",
            info: {
                chain: residue.info.chain,
                authSeqNumber: residue.info.authSeqNumber,
                operatorName: residue.info.operatorName,
                isHet: residue.info.isHet,
                loci: residue.info.loci,
            }
        };
    }

    private static residueLightEquals(r1: ResidueLight, r2: ResidueLight) {
        if ((!this.chainLightEquals(r1.info.chain, r2.info.chain))
            || r1.info.authSeqNumber !== r2.info.authSeqNumber) {
            return false;
        }
        return true;
    }

    private static chainLightEquals(c1: { authAsymId: string }, c2: { authAsymId: string }) {
        return (c1.authAsymId === c2.authAsymId);
    }

    public static isSelectedAnyChannel() {
        return this.selectedChannelRef !== void 0;
    }

    public static isSelectedAny() {
        return this.isSelectedAnyChannel() /*|| this.selectedResidue !== void 0*/ || this.selectedResidues !== void 0 || this.selectedPoints !== void 0;
    }

    /**
     * 
     * @param seqNumber 
     * @param chain 
     * @return True - residue selected | False - residue deselected
     */
    public static addResidueToSelection(seqNumber: number, chain: string, operator_name?: string, loci?: Loci, isHet?: boolean, residueName?: string): boolean {
        console.log(seqNumber);
        console.log(chain);
        let plugin = Instances.getPlugin();
        let residues = SelectionHelper.getSelectedResidues();
        let newSelection: LightResidueInfo[] = [];
        let deselectMode = false;
        for (let r of residues) {
            if (r.info.authSeqNumber === seqNumber && r.info.chain.authAsymId === chain) {
                if (operator_name !== undefined) {
                    if (r.info.operatorName === operator_name) {
                        deselectMode = true;
                        continue;
                    }
                } else {
                    deselectMode = true;
                    continue;
                }
            }
            newSelection.push(r.info);
        }

        if (!deselectMode) {
            newSelection.push({ authSeqNumber: seqNumber, chain: { authAsymId: chain }, operatorName: operator_name ? operator_name : "", isHet: isHet ? true : false, loci });
        }

        if (newSelection.length > 0) {
            this.selectResiduesBulkWithBallsAndSticks(newSelection);
        }
        else {
            //TODO
            this.invokeOnResidueSelectHandlers([]);
            this.clearSelection();
        }

        return !deselectMode;
    }

    /**
     * 
     * @param residues
     * @param doRemove specifies wheter or not remove residues contained in both current selection and new selection. By default - true
     */
    public static addResiduesToSelection(residues: LightResidueInfo[], doRemove?: boolean) {
        doRemove = (doRemove === void 0) ? true : doRemove;
        let plugin = Instances.getPlugin();
        let currentResidues = SelectionHelper.getSelectedResidues();
        let newSelection: LightResidueInfo[] = [];

        let contains = (res: LightResidueInfo, array: (ResidueLight | Residue)[]) => {
            for (let i of array) {
                if (i.info.authSeqNumber === res.authSeqNumber && i.info.chain.authAsymId === res.chain.authAsymId) {
                    return true;
                }
            }

            return false;
        }

        let toRemove: (ResidueLight | Residue)[] = [];
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
                    newSelection.push({ authSeqNumber: r.info.authSeqNumber, chain: { authAsymId: r.info.chain.authAsymId }, operatorName: r.info.operatorName, isHet: r.info.isHet, loci: r.info.loci });
                }
            }
        }
        else {
            newSelection = newSelection.concat(currentResidues.map((val, idx, arr) => {
                return val.info;
            }));
        }

        if (newSelection.length > 0) {
            this.selectResiduesBulkWithBallsAndSticks(newSelection);
        }
        else {
            this.invokeOnResidueSelectHandlers([]);
            this.clearSelection();
        }
    }

    public static isSelected(residue: ResidueInfo) {
        if (this.selectedResidues === void 0) {
            return false;
        }

        for (let r of this.selectedResidues) {
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
    public static async addPointToSelection(point: Point): Promise<boolean> {
        let points = SelectionHelper.getSelectedPoints();
        let newSelection: Point[] = [];
        let deselectMode = false;
        for (let p of points) {
            if (p.X === point.X && p.Y === point.Y && p.Z === point.Z) {
                deselectMode = true;
                continue;
            }
            newSelection.push(p);
        }

        if (!deselectMode) {
            newSelection.push(point);
        }

        if (newSelection.length > 0) {
            await this.selectPoints(newSelection);
        }
        else {
            this.clearSelection();
            await this.clearSelectedPoints();
            this.invokeOnPointSelectHandlers([]);
        }

        const context = Context.getInstance();
        const cells = context.plugin.state.data.select(StateSelection.Generators.root
            .children()
            .ofType(PluginStateObject.Shape.Provider)
            .filter(cell => cell.obj !== undefined && cell.obj.data.data.params.tag !== undefined && cell.obj.data.data.params.tag === 'Origins'))
        await cells.map(async cell => {
            await PluginCommands.State.RemoveObject(context.plugin, { state: context.plugin.state.data, ref: cell.transform.ref });
            await context.renderOrigin(
                cell.obj?.data.data.params.data,
                cell.obj?.data.data.params.colorTheme,
                cell.obj?.data.data.params.ref,
                cell.obj?.data.data.params.tag,
                cell.obj?.data.data.params.type,
                cell.obj?.data.data.params.subType
            )
        })

        return !deselectMode;
    }

    public static isSelectedPoint(point: Point) {
        if (this.selectedPoints === void 0) {
            return false;
        }

        for (let p of this.selectedPoints) {
            if (p.X === point.X && p.Y === point.Y && p.Z === point.Z) {
                return true;
            }
        }

        return false;
    }

    private static async clearSelectedPoints() {
        // let plugin = Instances.getPlugin();
        await PluginCommands.State.RemoveObject(Context.getInstance().plugin, { state: Context.getInstance().plugin.state.data, ref: 'point-selection' });
        this.selectedPoints = void 0;
    }

    private static async clearSelectedTPoint() {
        // let plugin = Instances.getPlugin();
        await PluginCommands.State.RemoveObject(Context.getInstance().plugin, { state: Context.getInstance().plugin.state.data, ref: 'point-selection-T' });
        this.selectedTPoint = void 0;
    }

    private static deselectTunnelByRef() {
        if (this.selectedChannelReprLoci)
            Context.getInstance().plugin.canvas3d?.mark(this.selectedChannelReprLoci, MarkerAction.Deselect);
        this.selectedChannelReprLoci = void 0;
    }

    public static selectTunnelByRef() {
        const context = Context.getInstance();
        context.visual.setColor({ select: { r: 255, g: 0, b: 255 } });
        if (this.selectedChannelReprLoci) 
            context.plugin.canvas3d?.mark(this.selectedChannelReprLoci, MarkerAction.Select);
        // context.visual.reset({ selectColor: true });
    } 

    public static highlightSelectedChannel() {
        if (this.selectedChannelReprLoci) {
            const context = Context.getInstance();
            context.plugin.canvas3d?.mark(this.selectedChannelReprLoci, MarkerAction.Select);
            context.plugin.managers.camera.focusLoci(this.selectedChannelReprLoci.loci)
        }
        
    }

    private static removeHighlightSelectedChannel() {
        const context = Context.getInstance();
        if (this.selectedChannelReprLoci)
            context.plugin.canvas3d?.mark(this.selectedChannelReprLoci, MarkerAction.Deselect);
        this.selectedChannelReprLoci = undefined;
    }

    public static async selectTunnel(current: (Tunnel & TunnelMetaInfo), preserveSelection?:boolean) {
        const context = Context.getInstance();
        this.invokeOnChannelSelectHandlers2(current);
        this.invokeOnChannelSelectHandlers(current.Layers, current.Id, current.__submissionId);
        if (this.selectedChannelReprLoci?.loci === current.__loci) {
            if (preserveSelection !== undefined && !preserveSelection) this.removeHighlightSelectedChannel() //TODO maybe invoke on deselect, but preserve is always true for now
        } else {
            this.removeHighlightSelectedChannel();
            context.plugin.managers.camera.focusLoci(current.__loci);
            this.selectedChannelReprLoci = { loci: current.__loci } as Representation.Loci<Loci>;
            this.selectedChannel = current;
            this.selectedChannelData = current.Layers;
            this.selectedChannelId = current.Id;
            this.selectedChannelRef = current.__ref;
            this.highlightSelectedChannel();
        }

        // await context.visual.setColor({ select: { r: 255, g: 0, b: 255 } });
        // context.plugin.canvas3d?.mark(loci, MarkerAction.Select);
        // await context.visual.reset({ selectColor: true });
    }

    private static async createPointsSelectionVisual(points: Point[]) {
        // let s = LiteMol.Visualization.Primitive.Builder.create();
        await this.clearSelectedPoints();
        await Context.getInstance().renderOrigin(points, Colors.get(Enum.SyntethicSelect), 'point-selection', 'Points', 'Selected Point');

        // let id = 0;
        // for (let p of points) {
        //     s.add({ type: 'Sphere', id: id++, radius: 1.69, center: [Number(p.x), Number(p.y), Number(p.z)] });
        // }

        // let plugin = Instances.getPlugin();
        // this.clearSelectedPoints();
        // s.buildSurface().run().then(surface => {
        //     let t = plugin.createTransform()
        //         .add('mole-data', LiteMol.Example.Channels.State.CreateSurface, {
        //             //label: 'Selected points (' + origins.Type + ')',
        //             tag: <LiteMol.Example.Channels.State.SurfaceTag>{ kind: 'Points', element: points },
        //             surface,
        //             isInteractive: true,
        //             color: LiteMolObjectsColorScheme.Colors.get(LiteMolObjectsColorScheme.Enum.SyntethicSelect) as LiteMol.Visualization.Color
        //         }, { ref: "point-selection", isHidden: true });

        //     plugin.applyTransform(t);
        // })
    }

    private static async createTPointSelectionVisual(point: Point) {
        await this.clearSelectedTPoint();
        await Context.getInstance().renderOrigin([point], Colors.get(Enum.TPoint), 'point-selection-T', 'TPoint', 'TPoint');

        // let s = LiteMol.Visualization.Primitive.Builder.create();
        // let id = 0;
        // s.add({ type: 'Sphere', id: id++, radius: 1.69, center: [point.X, point.Y, point.Z] });

        // let plugin = Instances.getPlugin();
        // this.clearSelectedTPoint();
        // s.buildSurface().run().then(surface => {
        //     let t = plugin.createTransform()
        //         .add('mole-data', LiteMol.Example.Channels.State.CreateSurface, {
        //             //label: 'Selected points (' + origins.Type + ')',
        //             tag: <LiteMol.Example.Channels.State.SurfaceTag>{ kind: 'TPoint', element: point },
        //             surface,
        //             isInteractive: true,
        //             color: LiteMolObjectsColorScheme.Colors.get(LiteMolObjectsColorScheme.Enum.TPoint) as LiteMol.Visualization.Color
        //         }, { ref: "point-selection-T", isHidden: true });

        //     plugin.applyTransform(t);
        // })
    }

    public static async selectPoints(points: Point[]) {
        await SelectionHelper.clearSelectionPrivate();
        this.selectedChannelRef = void 0;
        this.selectedChannelData = void 0;
        this.selectedChannel = void 0;
        this.selectedChannelId = void 0;
        this.selectedResidues = void 0;
        this.selectedPoints = void 0;

        await this.createPointsSelectionVisual(points);

        this.selectedPoints = points;

        this.invokeOnPointSelectHandlers(points);
    }

    public static getSelectedChannelData() {
        return (this.selectedChannelData === void 0) ? null : this.selectedChannelData;
    }

    public static getSelectedChannelRef() {
        return (this.selectedChannelRef === void 0) ? "" : this.selectedChannelRef;
    }

    public static getSelectedChannelId() {
        return (this.selectedChannelId === void 0) ? "" : this.selectedChannelId;
    }

    public static getSelectedChannelLoci() {
        return (this.selectedChannelReprLoci === void 0) ? EmptyLoci : this.selectedChannelReprLoci.loci;
    }

    public static attachClearSelectionToEventHandler(plugin: Context) {
        plugin.plugin.behaviors.interaction.click.subscribe(async ({ current, button, modifiers, position }) => {
            const plugin = Context.getInstance().plugin;
            console.log(current)
            console.log(plugin);
            console.log(position);

        })
        plugin.plugin.managers.structure.focus.behaviors.current.subscribe((selected) => {
            if (selected?.label) {
                console.log(selected.label);
                console.log(selected)
                // this.invokeOnResidueSelectHandlers()
            }
        })

        plugin.plugin.managers.structure.hierarchy.behaviors.selection.subscribe(x => {
            console.log("Hierarchy selection");
            console.log(x);
        })

    }

    public static attachSelectionHelperHandlerToEventHandler() {
        // Events.subscribeChangeSubmitId(() => {
        //     this.clearSelection();
        // });

        this.attachOnResidueSelectHandler(async (residues) => {
            let ref = "residue-selection-T";
            if (residues.length > 0) {
                let centerOfMass = Residues.getCenterOfMass(
                    residues.map((val, idx, arr) => {
                        return <MoleConfigResidue>{
                            Chain: val.chain.authAsymId,
                            SequenceNumber: val.authSeqNumber,
                            OperatorName: val.operatorName,
                        }
                    })
                );
                if (centerOfMass === null) {
                    return;
                }
                this.selectedTPoint = centerOfMass;
                await this.createTPointSelectionVisual(centerOfMass);
            }
            else {
                await this.clearSelectedTPoint();
                SelectionHelper.invokeOnClearSelectionSequence();
            }
        });

        const plugin = Context.getInstance().plugin;
        plugin.state.data.updateCellState

        plugin.behaviors.interaction.click.subscribe(async ({ current, button, modifiers, position }) => {
            if (current.loci.kind === 'empty-loci') {
                return;
            }
            if (current.loci.kind === 'element-loci') {
                const location = StructureElement.Location.create(void 0);
                const l = StructureElement.Loci.getFirstLocation(current.loci, location);
                if (l) {
                    try {
                        let chainId = Props.chain.auth_asym_id(l);
                        let residueId = Props.residue.auth_seq_id(l);
                        let operatorName = Props.unit.operator_name(l);
                        SelectionHelper.addResidueToSelection(residueId, chainId, operatorName, current.loci);
                    } catch (e) {
                        console.log("Something else selected instead of resiude");
                    }
                }

            } else if (current.loci.kind === 'group-loci') {
                const loci = current.loci as ShapeGroup.Loci;
                const data = loci.shape.sourceData as SurfaceSourceData;
                if (data && data.tag && data.tag === "Surface") {
                    if (data.triangles === void 0 || data.vertices === void 0 || data.solidForm === void 0) return;
                    const g = loci.groups[0];
                    const tI = OrderedSet.start(g.ids);
                    const middle = Vec3.toObj(getTriangleCenter(data.vertices, data.triangles, tI));
                    this.addPointToSelection({ X: Math.round(middle.x * 100) / 100, Y: Math.round(middle.y * 100) / 100, Z: Math.round(middle.z * 100) / 100 })
                } else if (current.repr && current.repr.params && typeof current.repr.params.tag === 'string' && current.repr.params.tag === "Tunnel" && current.repr.params.tunnel !== null) {
                    const channel = current.repr.params.tunnel as unknown as (Tunnel & TunnelMetaInfo);

                    if ((this.selectedChannelRef !== void 0) && (this.selectedChannelRef === channel.__ref)) {
                        //console.log("double clicked on tunel - deselecting");
                        await this.clearSelectionPrivate();
                        this.selectedChannelRef = void 0;
                        this.selectedChannelData = void 0;
                        this.selectedChannelId = void 0;
                        this.selectedChannelReprLoci = void 0;
                        this.selectedChannel = void 0;
                        this.invokeOnChannelDeselectHandlers();
                        //return;
                    }
                    else {
                        //console.log("Channel selected");
                        if (this.selectedChannelRef !== void 0 && this.selectedChannelRef !== channel.__ref) {
                            this.deselectTunnelByRef();
                        }
                        else {
                            //Trigger Sequence Viewer to deselect selected residues
                            await this.clearSelection();
                        }
                        this.selectedChannelRef = channel.__ref;
                        this.selectedChannelData = channel.Layers;
                        this.selectedChannelId = channel.Id;
                        this.selectedChannelReprLoci = current;
                        if (this.selectedChannelData !== void 0) {
                            this.selectTunnelByRef();
                            this.clearAltSelection();
                            this.invokeOnChannelSelectHandlers(this.selectedChannelData, this.selectedChannelId, channel.__submissionId);
                        }
                        this.invokeOnChannelSelectHandlers2(channel)
                    }
                }
            }
            this.interactionHandler(current);
        })

        //Residue 3D OnClick
        // plugin.subscribe(LiteMol.Bootstrap.Event.Molecule.ModelSelect, e => {
        //     if (!!e.data) {
        //         let r = e.data.residues[0];
        //         SelectionHelper.addResidueToSelection(r.authSeqNumber, r.chain.authAsymId);
        //     }
        // });

        // LiteMol.Example.Channels.Behaviour.initCavityBoundaryToggle(plugin);
        // LiteMol.Example.Channels.Behaviour.createSelectEvent(plugin).subscribe(e => {
        //     if ((e.kind === 'nothing') || (e.kind === 'molecule')) {
        //         return
        //     }
        //     else if (e.kind === 'point') {
        //         this.addPointToSelection({ x: `${e.data[0].toFixed(2)}`, y: `${e.data[1].toFixed(2)}`, z: `${e.data[2].toFixed(2)}` });
        //     }
        // });

        // this.interactionEventStream = LiteMol.Bootstrap.Event.Visual.VisualSelectElement.getStream(plugin.context)
        //     .subscribe(e => this.interactionHandler('select', e.data as ChannelEventInfo, plugin));
    }

    // private static interactionHandler(type: string, i: ChannelEventInfo | undefined, plugin: LiteMol.Plugin.Controller) {
    private static async interactionHandler(ref: Representation.Loci<Loci>) {
        console.log("SelectionHelper: Caught-SelectEvent");

        if (ref.loci.kind === "group-loci") {
            // TODO add tag to other object(Cavity, Surface), then check it and return if it is one of them
            const loci = ref.loci as ShapeGroup.Loci;
            if (!loci.shape.sourceData || !loci.shape.sourceData.hasOwnProperty("kind")) {
                console.log("SelectionHelper: Event incomplete - ignoring");
                return;
            }
            const data = loci.shape.sourceData as ShapeSourceData;
            const g = loci.groups[0];

            if (data.tag === "Surface") return;

            if (data.tag === "Points") {
                const points = (data as OriginsSourceData).data;
                if (points === void 0) {
                    return;
                }
                if (this.selectedResidues !== void 0) {
                    await this.selectResiduesBulkWithBallsAndSticks([]);
                }
                if (points) {
                    const point = points[OrderedSet.start(g.ids)];
                    await this.addPointToSelection({ X: Math.round(point.X * 100) / 100, Y: Math.round(point.Y * 100) / 100, Z: Math.round(point.Z * 100) / 100 });
                }
                return;
            }

            if (data.tag === "TPoint") {
                const points = (data as OriginsSourceData).data;
                if (points === void 0) {
                    return;
                }
                if (this.selectedResidues !== void 0) {
                    await this.selectResiduesBulkWithBallsAndSticks([]);
                }
                if (points) {
                    const point = points[0];
                    await this.addPointToSelection({ X: Math.round(point.X * 100) / 100, Y: Math.round(point.Y * 100) / 100, Z: Math.round(point.Z * 100) / 100 });
                }
                return;
            }

            if (data.tag === "Origins") {
                const points = (data as OriginsSourceData).data;
                if (points === void 0) {
                    return;
                }
                if (points) {
                    const point = points[OrderedSet.start(g.ids)];
                    await this.addPointToSelection({ X: Math.round(point.X * 100) / 100, Y: Math.round(point.Y * 100) / 100, Z: Math.round(point.Z * 100) / 100 });
                }
                return;
            }

            if (this.selectedPoints !== void 0) {
                await this.clearSelectionPrivate();
                await this.clearSelectedPoints();
            }

            if (this.selectedResidues !== void 0) {
                //console.log("selected channel - clearing residues");
                await this.clearSelectionPrivate();
                // LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, this.SELECTION_VISUAL_REF);
                this.selectedResidues = void 0;
                //return;
            }

            // if ((this.selectedChannelRef !== void 0) && (this.selectedChannelRef === i.source.ref)) {
            //     //console.log("double clicked on tunel - deselecting");
            //     this.clearSelectionPrivate(plugin);
            //     this.selectedChannelRef = void 0;
            //     this.selectedChannelData = void 0;
            //     this.selectedChannelId = void 0;
            //     this.invokeOnChannelDeselectHandlers();
            //     //return;
            // }
            // else {
            //     //console.log("Channel selected");
            //     if (this.selectedChannelRef !== void 0 && this.selectedChannelRef !== i.source.ref) {
            //         deselectTunnelByRef(plugin, this.selectedChannelRef);
            //     }
            //     else {
            //         //Trigger Sequence Viewer to deselect selected residues
            //         this.clearSelection(plugin);
            //     }
            //     this.selectedChannelRef = i.source.ref;
            //     this.selectedChannelData = i.source.props.tag.element.Layers;
            //     this.selectedChannelId = i.source.props.tag.element.Id;
            //     if (this.selectedChannelData !== void 0) {
            //         selectTunnelByRef(plugin, this.selectedChannelRef);
            //         this.clearAltSelection(plugin);
            //         this.invokeOnChannelSelectHandlers(this.selectedChannelData, this.selectedChannelId);
            //     }
            //     //return;
        }

        // if (!i || i.source == null || i.source.ref === void 0 || i.source.props === void 0 || i.source.props.tag === void 0) {
        //     //console.log("SelectionHelper: Event incomplete - ignoring");
        //     return;
        // }

        //Unsupported types
        // if (i.source.props.tag.kind === "Cavity-inner" || i.source.props.tag.kind === "Cavity-boundary") {
        //     return;
        // }

        // if (this.selectedPoints !== void 0) {
        //     this.clearSelectionPrivate(plugin);
        //     this.clearSelectedPoints();
        // }

        // if (this.selectedBulkResidues !== void 0) {
        //     //console.log("selected channel - clearing residues");
        //     this.clearSelectionPrivate(plugin);
        //     LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, this.SELECTION_VISUAL_REF);
        //     this.selectedBulkResidues = void 0;
        //     //return;
        // }

        // if ((this.selectedChannelRef !== void 0) && (this.selectedChannelRef === i.source.ref)) {
        //     //console.log("double clicked on tunel - deselecting");
        //     this.clearSelectionPrivate(plugin);
        //     this.selectedChannelRef = void 0;
        //     this.selectedChannelData = void 0;
        //     this.selectedChannelId = void 0;
        //     this.invokeOnChannelDeselectHandlers();
        //     //return;
        // }
        // else {
        //     //console.log("Channel selected");
        //     if (this.selectedChannelRef !== void 0 && this.selectedChannelRef !== i.source.ref) {
        //         deselectTunnelByRef(plugin, this.selectedChannelRef);
        //     }
        //     else {
        //         //Trigger Sequence Viewer to deselect selected residues
        //         this.clearSelection(plugin);
        //     }
        //     this.selectedChannelRef = i.source.ref;
        //     this.selectedChannelData = i.source.props.tag.element.Layers;
        //     this.selectedChannelId = i.source.props.tag.element.Id;
        //     if (this.selectedChannelData !== void 0) {
        //         selectTunnelByRef(plugin, this.selectedChannelRef);
        //         this.clearAltSelection(plugin);
        //         this.invokeOnChannelSelectHandlers(this.selectedChannelData, this.selectedChannelId);
        //     }
        //     //return;
    }

    //console.log("SelectionHelper: SelectEvent from code - ignoring ");
}

// }

// export function getIndices(v: LiteMol.Bootstrap.Entity.Visual.Any) {
//     if ((v as any).props.model.surface === void 0) {
//         return [] as number[];
//     }
//     return (v as any).props.model.surface.triangleIndices;
// }

// function selectTunnelByRef(plugin: LiteMol.Plugin.Controller, ref: string) {
//     let entities = plugin.selectEntities(ref);
//     let v = <any>entities[0] as LiteMol.Bootstrap.Entity.Visual.Any;
//     if (LiteMol.Bootstrap.Entity.isVisual(entities[0]) && v.props.isSelectable) {
//         v.props.model.applySelection(getIndices(v), LiteMol.Visualization.Selection.Action.Select);
//     }
// }

// function deselectTunnelByRef(ref: string) {
    
//     //TODO
//     // let entities = plugin.selectEntities(ref);
//     // let v = <any>entities[0] as LiteMol.Bootstrap.Entity.Visual.Any;
//     // if (LiteMol.Bootstrap.Entity.isVisual(entities[0]) && v.props.isSelectable) {
//     //     v.props.model.applySelection(getIndices(v), LiteMol.Visualization.Selection.Action.RemoveSelect);
//     // }
// }
