import { PluginCommands } from "molstar/lib/mol-plugin/commands";
import { Layers, OriginsSourceData, ShapeSourceData, SurfaceSourceData, Tunnel, TunnelMetaInfo } from "../../DataInterface";
import { MoleConfigResidue } from "../../MoleAPIService";
import { Context } from "../Context";
import { Point, Residues } from "./Residues";
import { QueryParam } from "../VizualizerMol/helpers";
import { Colors, Enum } from "../../StaticData";
import { StructureElement, StructureProperties as Props } from "molstar/lib/mol-model/structure";
import { Representation } from "molstar/lib/mol-repr/representation";
import { EmptyLoci, Loci } from "molstar/lib/mol-model/loci";
import { ShapeGroup } from "molstar/lib/mol-model/shape";
import { OrderedSet } from "molstar/lib/mol-data/int";
import { getTriangleCenter } from "../Behaviour";
import { Vec3 } from "molstar/lib/mol-math/linear-algebra";
import { StateSelection } from "molstar/lib/mol-state";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import { MarkerAction } from "molstar/lib/mol-util/marker-action";
import { CommonOptions } from "../../../config/common";
import { Handlers } from "./Handlers";

//TODO Molstar

export interface LightResidueInfo {
    authSeqNumber: number,
    chain: {
        authAsymId: string // the label ID when labelChain is set
    },
    labelChain?: boolean,
    operatorName: string,
    loci: Loci | undefined,
    residueName: string | undefined
};

// The same residue: number, chain (by the same kind of ID) and copy (operator)
export function isSameResidue(a: LightResidueInfo, b: LightResidueInfo) {
    return a.authSeqNumber === b.authSeqNumber && a.chain.authAsymId === b.chain.authAsymId
        && !!a.labelChain === !!b.labelChain && a.operatorName === b.operatorName;
}

export interface ResidueLight { type: "light", info: LightResidueInfo };
export interface StringPoint { x: string, y: string, z: string };

// Rounds to 2 decimal places
function round(p: Point): Point {
    return { X: Math.round(p.X * 100) / 100, Y: Math.round(p.Y * 100) / 100, Z: Math.round(p.Z * 100) / 100 };
}

export class SelectionHelper {
    private static selectedChannelRef: string | undefined;
    private static selectedChannelId: string | undefined;
    private static selectedChannelReprLoci: Representation.Loci<Loci>|undefined;
    private static selectedResidues: LightResidueInfo[] | undefined;
    private static selectedPoints: Point[] | undefined;

    private static selectedChannelData: Layers | undefined;

    // attach… returns a function that detaches the handler again
    private static onPointSelect = new Handlers<[Point[]]>();
    private static onResidueBulkSelect = new Handlers<[LightResidueInfo[]]>();
    private static onClearSelection = new Handlers<[]>();
    private static onClearSelectionSequence = new Handlers<[]>();
    private static onChannelSelect = new Handlers<[Layers, string?, string?]>();
    private static onChannelSelect2 = new Handlers<[Tunnel & TunnelMetaInfo]>();
    private static onChannelDeselect = new Handlers<[]>();

    public static attachOnResidueSelectHandler(handler: (residues: LightResidueInfo[]) => void) { return this.onResidueBulkSelect.attach(handler); }
    private static invokeOnResidueSelectHandlers(residues: LightResidueInfo[]) { this.onResidueBulkSelect.invoke(residues); }

    public static attachOnClearSelectionSequence(handler: () => void) { return this.onClearSelectionSequence.attach(handler); }
    public static invokeOnClearSelectionSequence() { this.onClearSelectionSequence.invoke(); }

    public static attachOnClearSelectionHandler(handler: () => void) { return this.onClearSelection.attach(handler); }
    private static invokeOnClearSelectionHandlers() { this.onClearSelection.invoke(); }

    public static attachOnChannelSelectHandler(handler: (data: Layers, channelId?: string, submissionId?: string) => void) { return this.onChannelSelect.attach(handler); }
    private static invokeOnChannelSelectHandlers(data: Layers, channelId?: string, submissionId?: string) { this.onChannelSelect.invoke(data, channelId, submissionId); }

    public static attachOnChannelSelectHandler2(handler: (channel: Tunnel & TunnelMetaInfo) => void) { return this.onChannelSelect2.attach(handler); }
    private static invokeOnChannelSelectHandlers2(channel: Tunnel & TunnelMetaInfo) { this.onChannelSelect2.invoke(channel); }

    public static attachOnChannelDeselectHandler(handler: () => void) { return this.onChannelDeselect.attach(handler); }
    private static invokeOnChannelDeselectHandlers() { this.onChannelDeselect.invoke(); }

    //For PDF report
    public static forceInvokeOnChannelDeselectHandlers() {
        this.invokeOnChannelDeselectHandlers();
    }

    //For 2DProts
    public static forceDeselectChannel() {
        this.deselectTunnelByRef();
        this.invokeOnChannelDeselectHandlers();
    }

    public static attachOnPointBulkSelectHandler(handler: (points: Point[]) => void) { return this.onPointSelect.attach(handler); }
    private static invokeOnPointSelectHandlers(points: Point[]) { this.onPointSelect.invoke(points); }

    public static async clearSelection() { //TODO
        await this.clearSelectionPrivate();
        Context.getInstance().visual.clearSelection();
        this.invokeOnClearSelectionHandlers();
    }

    private static async clearSelectionPrivate() {
        await this.clearSelectedTPoint();
        await this.clearSelectedPoints();
        if (this.selectedChannelRef !== void 0) {
            this.deselectTunnelByRef();
            this.selectedChannelRef = void 0;
            this.selectedChannelData = void 0;
            this.selectedChannelId = void 0;
        }
        this.selectedResidues = void 0;

        this.invokeOnClearSelectionHandlers();
    }

    //TODO probably remove cause balls and sticks render automaticly with selection
    private static async selectResiduesBulkWithBallsAndSticks(residues: LightResidueInfo[]) {
        await SelectionHelper.clearSelectionPrivate();

        let queries: QueryParam[] = [];
        let locis: Loci[] = [];
        for (let residue of residues) {
            if (residue.loci) {
                locis.push(residue.loci);
            } else {
                queries.push({
                    ...(residue.labelChain ? { label_asym_id: residue.chain.authAsymId } : { auth_asym_id: residue.chain.authAsymId }),
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

        this.selectedResidues = residues.length > 0 ? residues : void 0;

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
    public static addResidueToSelection(seqNumber: number, chain: string, operator_name?: string, loci?: Loci, residueName?: string, labelChain?: boolean): boolean {
        const residue: LightResidueInfo = { authSeqNumber: seqNumber, chain: { authAsymId: chain }, labelChain, operatorName: operator_name ? operator_name : "", loci, residueName };
        const current = this.selectedResidues ?? [];
        // a selected residue is deselected
        const deselectMode = current.some(r => isSameResidue(r, residue));
        const newSelection = deselectMode ? current.filter(r => !isSameResidue(r, residue)) : current.concat([residue]);

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

    // Adds the residues that are not selected yet (a lining residue can be listed twice: with its side chain and its backbone)
    public static addResiduesToSelection(residues: LightResidueInfo[]) {
        const current = this.selectedResidues ?? [];
        const added: LightResidueInfo[] = [];
        for (const r of residues) {
            if (!current.some(i => isSameResidue(i, r)) && !added.some(i => isSameResidue(i, r))) {
                added.push(r);
            }
        }
        const newSelection = added.concat(current);

        if (newSelection.length > 0) {
            this.selectResiduesBulkWithBallsAndSticks(newSelection);
        }
        else {
            this.invokeOnResidueSelectHandlers([]);
            this.clearSelection();
        }
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

    private static async clearSelectedPoints() {
        await PluginCommands.State.RemoveObject(Context.getInstance().plugin, { state: Context.getInstance().plugin.state.data, ref: 'point-selection' });
        this.selectedPoints = void 0;
    }

    private static async clearSelectedTPoint() {
        await PluginCommands.State.RemoveObject(Context.getInstance().plugin, { state: Context.getInstance().plugin.state.data, ref: 'point-selection-T' });
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
            this.selectedChannelData = current.Layers;
            this.selectedChannelId = current.Id;
            this.selectedChannelRef = current.__ref;
            this.highlightSelectedChannel();
        }
    }

    private static async createPointsSelectionVisual(points: Point[]) {
        await this.clearSelectedPoints();
        await Context.getInstance().renderOrigin(points, Colors.get(Enum.SyntethicSelect), 'point-selection', 'Points', 'Selected Point');
    }

    private static async createTPointSelectionVisual(point: Point) {
        await this.clearSelectedTPoint();
        await Context.getInstance().renderOrigin([point], Colors.get(Enum.TPoint), 'point-selection-T', 'TPoint', 'TPoint');
    }

    private static async selectPoints(points: Point[]) {
        await SelectionHelper.clearSelectionPrivate();

        await this.createPointsSelectionVisual(points);

        this.selectedPoints = points;

        this.invokeOnPointSelectHandlers(points);
    }

    public static getSelectedChannelId() {
        return (this.selectedChannelId === void 0) ? "" : this.selectedChannelId;
    }

    public static getSelectedChannelLoci() {
        return (this.selectedChannelReprLoci === void 0) ? EmptyLoci : this.selectedChannelReprLoci.loci;
    }

    public static attachSelectionHelperHandlerToEventHandler() {

        this.attachOnResidueSelectHandler(async (residues) => {
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
                await this.createTPointSelectionVisual(centerOfMass);
            }
            else {
                await this.clearSelectedTPoint();
                SelectionHelper.invokeOnClearSelectionSequence();
            }
        });

        const plugin = Context.getInstance().plugin;
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
                        let name = Props.atom.label_comp_id(l);
                        SelectionHelper.addResidueToSelection(residueId, chainId, operatorName, current.loci, name);
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
                    this.addPointToSelection(round({ X: middle.x, Y: middle.y, Z: middle.z }))
                } else if (current.repr && current.repr.params && typeof current.repr.params.tag === 'string' && current.repr.params.tag === "Tunnel" && current.repr.params.tunnel !== null) {
                    const channel = current.repr.params.tunnel as unknown as (Tunnel & TunnelMetaInfo);

                    if ((this.selectedChannelRef !== void 0) && (this.selectedChannelRef === channel.__ref)) {
                        await this.clearSelectionPrivate();
                        this.invokeOnChannelDeselectHandlers();
                    }
                    else {
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
                            this.invokeOnChannelSelectHandlers(this.selectedChannelData, this.selectedChannelId, channel.__submissionId);
                        }
                        this.invokeOnChannelSelectHandlers2(channel)
                    }
                }
            }
            this.interactionHandler(current);
        })
    }

    private static async interactionHandler(ref: Representation.Loci<Loci>) {
        if (CommonOptions.DEBUG_MODE)
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

            // A selected point, the residues' centre, or an origin: (de)selects the point
            if (data.tag === "Points" || data.tag === "TPoint" || data.tag === "Origins") {
                const points = (data as OriginsSourceData).data;
                if (points === void 0) {
                    return;
                }
                if (data.tag !== "Origins" && this.selectedResidues !== void 0) {
                    await this.selectResiduesBulkWithBallsAndSticks([]);
                }
                await this.addPointToSelection(round(data.tag === "TPoint" ? points[0] : points[OrderedSet.start(g.ids)]));
                return;
            }

            if (this.selectedPoints !== void 0 || this.selectedResidues !== void 0) {
                await this.clearSelectionPrivate();
            }
        }
    }
}
