import { SbNcbrTunnels, TunnelFromRawData, TunnelShapeProvider } from "molstar/lib/extensions/sb-ncbr";
import { ANVILMembraneOrientation } from 'molstar/lib/extensions/anvil/behavior';
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { Download, ParseCif } from "molstar/lib/mol-plugin-state/transforms/data";
import { TrajectoryFromMmCif, ModelFromTrajectory, StructureFromModel, StructureComponent, TrajectoryFromPDB } from "molstar/lib/mol-plugin-state/transforms/model";
import { StructureRepresentation3D } from "molstar/lib/mol-plugin-state/transforms/representation";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { DefaultPluginUISpec, PluginUISpec } from "molstar/lib/mol-plugin-ui/spec";
import { PluginLayoutControlsDisplay } from "molstar/lib/mol-plugin/layout";
import { PluginSpec } from "molstar/lib/mol-plugin/spec";
import { StateSelection } from "molstar/lib/mol-state";
import { Color } from "molstar/lib/mol-util/color";
// import { Tunnel } from "molstar/lib/extensions/sb-ncbr/tunnels/data-model";
import { Tunnel } from "../DataInterface";
import { EmptyLoci, Loci } from "molstar/lib/mol-model/loci";
import { MembraneShapeProvider, MoleObjectsNodeProvider, OriginShapeProvider, PickableRepresentation3D, SurfaceShapeProvider, TunnelPropertyColorRepresentation3D, TunnelPropertyColorShapeProvider, TunnelRepresentation3D } from "./VizualizerMol/objects";
import { MembranePoint, Point, TunnelMetaInfo } from "../DataInterface";
import { ColorParams, InitParams } from "./VizualizerMol/spec";
import { Canvas3DProps } from "molstar/lib/mol-canvas3d/canvas3d";
import { QueryHelper, QueryParam } from "./VizualizerMol/helpers";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import { StructureComponentManager } from "molstar/lib/mol-plugin-state/manager/structure/component";
import { ParamDefinition } from "molstar/lib/mol-util/param-definition";
import { clearStructureOverpaint } from 'molstar/lib/mol-plugin-state/helpers/structure-overpaint';
import { PluginCommands } from "molstar/lib/mol-plugin/commands";
import { PluginBehaviors } from "molstar/lib/mol-plugin/behavior";
import { StructureFocusRepresentation } from "molstar/lib/mol-plugin/behavior/dynamic/selection/structure-focus-representation"
import { UUID } from "molstar/lib/mol-util";
import { StructureElement, StructureProperties, Unit } from "molstar/lib/mol-model/structure";
import { HeteroSequenceWrapper } from "molstar/lib/mol-plugin-ui/sequence/hetero";
import { getChainOptions, getModelEntityOptions, getOperatorOptions, getSequenceWrapper, getStructureOptions } from "molstar/lib/mol-plugin-ui/sequence";
import { BaseGeometry } from "molstar/lib/mol-geo/geometry/base";
import { Tunnels } from "./CommonUtils/Tunnels";
import { TunnelName } from "../Cache";
import { OrderedSet } from 'molstar/lib/mol-data/int';
import { Vec3 } from "molstar/lib/mol-math/linear-algebra";
import { getPropertyProps } from "./VizualizerMol/color-tunnels/data-model";
import { ColorBound, Property } from "./VizualizerMol/color-tunnels/property-color";
import { parseCifText } from "molstar/lib/mol-io/reader/cif/text/parser";
import { loadCifTunnels } from "./VizualizerMol/mmcif-tunnels/converter2json";

const MySpec: PluginUISpec = {
    ...DefaultPluginUISpec(),
    layout: {
        initial: {
            isExpanded: false,
            showControls: false,
            controlsDisplay: 'landscape' as PluginLayoutControlsDisplay,
            regionState: {
                bottom: "full",
                left: "full",
                right: "full",
                top: "full",
            },
        },
    },
    behaviors: [
        PluginSpec.Behavior(SbNcbrTunnels),
        PluginSpec.Behavior(ANVILMembraneOrientation),
        PluginSpec.Behavior(PluginBehaviors.Representation.HighlightLoci),
        PluginSpec.Behavior(PluginBehaviors.Representation.SelectLoci),
        PluginSpec.Behavior(PluginBehaviors.Representation.DefaultLociLabelProvider),
        PluginSpec.Behavior(PluginBehaviors.Representation.FocusLoci),
        // PluginSpec.Behavior(PluginBehaviors.Camera.FocusLoci), //tu
        PluginSpec.Behavior(PluginBehaviors.Camera.CameraAxisHelper),
        PluginSpec.Behavior(PluginBehaviors.Camera.CameraControls),
        PluginSpec.Behavior(StructureFocusRepresentation),

        PluginSpec.Behavior(PluginBehaviors.CustomProps.StructureInfo),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.AccessibleSurfaceArea),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.BestDatabaseSequenceMapping),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.Interactions),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.SecondaryStructure),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.ValenceModel),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.CrossLinkRestraint),
        // ...DefaultPluginUISpec().behaviors,
        // ...DefaultPluginSpec().behaviors,
    ],
    canvas3d: {
        renderer: {
            // backgroundColor: Color(0xffffff),
            selectColor: Color(0xffffff)
        }
    },
};

export class Context {
    public plugin: PluginUIContext;
    private assemblyRef = '';
    initParams: InitParams;
    selectedParams: any;
    selectedLoci: Loci | null = null;
    defaultRendererProps: Canvas3DProps['renderer'];
    defaultMarkingProps: Canvas3DProps['marking'];
    isHighlightColorUpdated = false;
    isSelectedColorUpdated = false;
    public data: Map<string, object> = new Map();

    private static instance: Context;
    private static onCtrlPressedHandlers: { handler: (pressed: boolean) => void }[];

    public constructor(MySpec: PluginUISpec) {
        this.plugin = new PluginUIContext(MySpec);
        this.plugin.init().then(async () => {
            await this.attachMoleObjectsNode();
            this.surfaceSolidFormToggler();
        });
    }

    private async initPlugin() {
        this.plugin = new PluginUIContext(MySpec);
        await this.plugin.init();
    }

    public static getInstance(): Context {
        if (!Context.instance) {
            Context.instance = new Context(MySpec);
        }
        return Context.instance;
    }

    public static attachOnCtrlPressedHandler(handler: (pressed: boolean) => void) {
        if (this.onCtrlPressedHandlers === void 0) {
            this.onCtrlPressedHandlers = [];
        }

        this.onCtrlPressedHandlers.push({ handler });
    }

    public static invokeOnCtrlPressedHandlers(pressed: boolean) {
        if (this.onCtrlPressedHandlers === void 0) {
            return;
        }

        for (let h of this.onCtrlPressedHandlers) {
            h.handler(pressed);
        }
    }

    private async attachMoleObjectsNode() {
        const update = this.plugin.build();
        await update.toRoot()
            .apply(MoleObjectsNodeProvider, {}, { ref: 'mole-objects', state: { isGhost: true } })
            .commit();
    }

    private surfaceSolidFormToggler() {
        this.plugin.behaviors.interaction.key.subscribe(async ({ modifiers }) => {
            if (modifiers.control) {
                const cells = this.plugin.state.data.select(StateSelection.Generators.byRef('mole-objects')
                    .subtree()
                    .ofType(PluginStateObject.Shape.Provider)
                    .filter(cell => cell.obj !== undefined && cell.obj.data.data.data.tag !== undefined && cell.obj.data.data.data.tag === 'Surface')
                )
                cells.map(async cell => {
                    const children = this.plugin.state.data.select(StateSelection.children(cell.transform.ref).ofType(PluginStateObject.Shape.Representation3D));
                    await this.plugin.state.data.build()
                        .to(cell.transform.ref)
                        .update(old => {
                            old.solidForm = true;
                        })
                        .commit()
                    for (const child of children) {
                        await this.plugin.state.data.build()
                            .to(child.transform.ref)
                            .update(old => {
                                old.alpha = 1;
                                old.emissive = 0;
                                old.pickable = true;
                            })
                            .commit()
                    }
                })
            }
        })

        this.plugin.behaviors.interaction.keyReleased.subscribe(async ({ modifiers }) => {
            if (modifiers.control) {
                const cells = this.plugin.state.data.selectQ(q => q.byRef('mole-objects')
                    .subtree()
                    .ofType(PluginStateObject.Shape.Provider)
                    .filter(cell => cell.obj !== undefined && cell.obj.data.data.data.tag !== undefined && cell.obj.data.data.data.tag === 'Surface')
                )
                cells.map(async cell => {
                    const children = this.plugin.state.data.select(StateSelection.children(cell.transform.ref).ofType(PluginStateObject.Shape.Representation3D));
                    await this.plugin.state.data.build()
                        .to(cell.transform.ref)
                        .update(old => {
                            old.solidForm = false;
                        })
                        .commit()
                    for (const child of children) {
                        await this.plugin.state.data.build()
                            .to(child.transform.ref)
                            .update(old => {
                                old.alpha = 0.65;
                                old.emissive = 0.20;
                                old.pickable = false;
                            })
                            .commit()
                    }
                })
            }
        })
    }

    public async hetSelect() {
        const structureOptions = getStructureOptions(this.plugin.state.data);
        const structureRef = structureOptions.options[0][0];
        const state = this.plugin.state.data;
        const cell = state.select(structureRef)[0];
        if (!structureRef || !cell || !cell.obj) return EmptyLoci;
        const structure = (cell.obj as PluginStateObject.Molecule.Structure).data;
        const l = StructureElement.Location.create(structure);

        for (const [modelEntityId, eLabel] of getModelEntityOptions(structure, false)) {
            for (const [chainGroupId, cLabel] of getChainOptions(structure, modelEntityId)) {
                let [modelIdx, entityId] = modelEntityId.split('|');
                // let [] = [parseInt(modelIdx), entityId];
                for (const unit of structure.units) {
                    if (unit.polymerElements.length) {
                        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
                        console.log(StructureProperties.entity.id(l));
                        console.log(StructureProperties.unit.operator_name(l));
                        console.log(StructureProperties.entity.key(l));

                        if (structure.getModelIndex(unit.model) !== parseInt(modelIdx)) continue;
                        if (StructureProperties.entity.id(l) !== entityId) continue;
                        const entitySeq = unit.model.sequence.byEntityKey[StructureProperties.entity.key(l)];
                        for (let i = 0; i < entitySeq.sequence.length; i++) {
                            const x = entitySeq.sequence.seqId.value(i);
                            console.log(x);
                        }
                    } else {
                        for (const [operatorKey, operator_name] of getOperatorOptions(structure, modelEntityId, chainGroupId)) {
                            const wrapper = getSequenceWrapper({
                                structure,
                                modelEntityId,
                                chainGroupId,
                                operatorKey
                            }, this.plugin.managers.structure.selection)
                            if (typeof wrapper !== "string") {
                                for (let i = 0, il = wrapper.length; i < il; ++i) {
                                    const loci = wrapper.getLoci(i);
                                    if (loci.elements.length > 0) {
                                        const location = StructureElement.Loci.getFirstLocation(loci, StructureElement.Location.create(void 0));
                                        if (location) {
                                            console.log(StructureProperties.atom.label_atom_id(location));
                                            console.log(StructureProperties.chain.auth_asym_id(location));
                                            console.log(StructureProperties.unit.operator_name(location));
                                            console.log(StructureProperties.residue.auth_seq_id(location));
                                            console.log(wrapper.residueLabel(i));
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
            }
        }

        // const structure = (this.plugin.state.data.select(StateSelection.first('het'))[0].obj as PluginStateObject.Molecule.Structure).data;
        // // const x = this.plugin.state.data.select(StateSelection.first('het'))[0].obj?.data;
        // console.log(structure.model.atomicHierarchy.residues.label_seq_id.toArray())

        // for (const unit of structure.units) {
        //     if (!unit.polymerElements.length && Unit.isAtomic(unit)) {
        //         const sw = new HeteroSequenceWrapper({ structure, units: [unit]});
        //         const loci = sw.getLoci(508);
        //         // this.visual.setColor({ select: { r: 255, g: 112, b: 3 } });
        //         // this.plugin.managers.interactivity.lociSelects.select({ loci });
        //         // this.visual.reset({ selectColor: true });
        //     }
        // }
        // if (!data) return;
        // const params: QueryParam[] = [{
        //     struct_asym_id: "A",
        //     start_auth_residue_number: 508,
        //     end_auth_residue_number: 508,
        //     sideChain: true,
        //     focus: false,
        //     color: {
        //         r: 255,
        //         g: 0,
        //         b: 255
        //     },
        //     operator_name: "ASM_1"
        // }]
        // const r = QueryHelper.getInteractivityLoci(params, data);
        console.log("checkpoint");
        return;
    }

    private async loadCifTunnels(url: string) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.text();
                const x = await parseCifText(data).run();
                if (!x.isError) {
                    console.log(x.result);
                    console.log(x.result.blocks[1].categories.sb_ncbr_channel_residue.getField("name"));
                }
            } else {
                console.error('Fetch failed with status:', response.status);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    public async load(url: string, isBinary: boolean, custom: boolean, assemblyId?: string | null) {
        const update = this.plugin.build();

        let structure;
        
        if (custom) {
            structure = await update.toRoot()
            .apply(Download, { url, isBinary })
            // .apply(TrajectoryFromPDB)
            .apply(ParseCif)
            .apply(TrajectoryFromMmCif)
            .apply(ModelFromTrajectory)
            .apply(StructureFromModel, { type: { name: 'assembly', params: {} } }/*, { ref: "protein-data"}*/);

            await loadCifTunnels(url);
        } else {
            structure = await update.toRoot()
            .apply(Download, { url, isBinary })
            .apply(ParseCif)
            .apply(TrajectoryFromMmCif)
            .apply(ModelFromTrajectory)
            .apply(StructureFromModel, { type: { name: 'assembly', params: assemblyId !== undefined && assemblyId !== null ? { id: assemblyId } : {} } }/*, { ref: "protein-data"}*/);
        }

        const polymer = structure.apply(StructureComponent, { type: { name: 'static', params: 'polymer' } }, { ref: "protein-data" });
        // const water = structure.apply(StructureComponent, { type: { name: 'static', params: 'water' } });
        const het = structure.apply(StateTransforms.Model.StructureComplexElement, { type: 'atomic-het' }, { ref: "het" });

        polymer.apply(StructureRepresentation3D, {
            type: { name: 'cartoon', params: { alpha: 1 } },
            colorTheme: { name: 'chain-id', params: {} },
        });
        het.apply(StructureRepresentation3D, {
            type: { name: 'ball-and-stick', params: { alpha: 1 } },
            colorTheme: { name: 'element-symbol', params: {} },
            sizeTheme: { name: 'physical', params: {} },
        });
        // water.apply(StructureRepresentation3D, {
        //     type: { name: 'ball-and-stick', params: { alpha: 1 } },
        //     colorTheme: { name: 'element-symbol', params: {} },
        //     sizeTheme: { name: 'physical', params: {} },
        // });

        await update.commit();

        const pivotIndex = this.plugin.managers.structure.hierarchy.selection.structures.length - 1;
        const pivot = this.plugin.managers.structure.hierarchy.selection.structures[pivotIndex];
        if (pivot && pivot.cell.parent) {
            this.assemblyRef = pivot.cell.transform.ref;
            this.assemblyRef = pivot.cell.transform.ref;
        };

        console.log(this.plugin)
        console.log(update);
        console.log(structure);

        // let parameters = getParameters();
        // downloadChannelsData(parameters!.computationId, parameters!.submitId);

        this.visual.setDefaultColor({ r: 255, g: 0, b: 255 });

        return polymer;
    }

    public async renderTunnel(channel: Tunnel & TunnelMetaInfo): Promise<[Loci, string]> {
        const update = this.plugin.build();
        const webgl = this.plugin.canvas3dContext?.webgl;

        let props = { highlight_label: '', id: '', type: '', label: '', description: '' };
        let len = Tunnels.getLength(channel as Tunnel);
        let name = TunnelName.get(channel.GUID);

        props.id = channel.Id;
        props.type = channel.Type;
        props.highlight_label = `<b>${channel.Type} (${name})</b>, Length: ${len} Å`;
        props.label = `${channel.Type} ${channel.Id} (${name})`;
        props.description = `Length: ${len} Å`;

        const repr = await update
            .toRoot()
            .apply(TunnelFromRawData, { data: { data: channel.Profile, props } })
        const tunnlRepr = await repr
            .apply(TunnelShapeProvider, {
                webgl,
                colorTheme: channel.__color
            })
            .apply(TunnelRepresentation3D, { tunnel: channel as Tunnel })
            .commit();

        return [tunnlRepr.data!.repr.getAllLoci()[0], repr.ref];
    }

    public async renderPropertyColorTunnel(channel: Tunnel & TunnelMetaInfo, colorOptions: {property: Property, colorBounds: ColorBound}): Promise<[Loci, string]> {
        const update = this.plugin.build();
        const webgl = this.plugin.canvas3dContext?.webgl;

        let props = { highlight_label: '', id: '', type: '', label: '', description: '' };
        let len = Tunnels.getLength(channel as Tunnel);
        let name = TunnelName.get(channel.GUID);

        props.id = channel.Id;
        props.type = channel.Type;
        props.highlight_label = `<b>${channel.Type} (${name})</b>, Length: ${len} Å`;
        props.label = `${channel.Type} ${channel.Id} (${name})`;
        props.description = `Length: ${len} Å`;

        const repr = await update
            .toRoot()
            .apply(TunnelFromRawData, { data: { data: channel.Profile, props } })
        const tunnlRepr = await repr
            .apply(TunnelPropertyColorShapeProvider, {
                webgl,
                colorTheme: { name: 'colorProperty', params: { 
                    property: getPropertyProps(colorOptions.property),
                    colorBounds: colorOptions.colorBounds,
                    showLayers: true,
                    skipMiddleColors: false
                }},
                layers: channel.Layers.LayersInfo
            })
            .apply(TunnelPropertyColorRepresentation3D, { tunnel: channel as Tunnel })
            .commit();

        return [tunnlRepr.data!.repr.getAllLoci()[0], repr.ref];
    }

    public async renderSurface(triangles: number[], vertices: number[], color?: Color, tag?: string, label?: string) {
        if ((triangles === undefined || triangles.length === 0) || (vertices === undefined || vertices.length === 0)) {
            return null;
        }
        const node = this.plugin.state.data.select(StateSelection.first('mole-objects'))[0];
        const update = this.plugin.build();

        const moleObjectsNode = update.to(node)

        const providerRepr = moleObjectsNode
            .apply(SurfaceShapeProvider, { triangleIndices: triangles, vertices, colorTheme: color, solidForm: false, tag, label }, {tags: 'Surface'});
        console.log(providerRepr.selector.data?.data);
        const repr = await providerRepr
            .apply(PickableRepresentation3D, { alpha: 0.65, emissive: 0.20, pickable: false }, { state: { /*isGhost: true*/ } })
            .commit();

        return providerRepr;
    }

    public async renderMembrane(data: MembranePoint[]) {
        const update = this.plugin.build();
        const repr = await update
            .toRoot()
            .apply(MembraneShapeProvider, { data }, { ref: 'membrane'});
        await repr
            .apply(PickableRepresentation3D, { pickable: false })
            .commit();
        return repr;
    }

    public async renderOrigin(data: Point[], color?: Color, ref?: string, tag?: string, type?: string, subType?: string) {
        const update = this.plugin.build();
        const refId = UUID.create22();
        const repr = await update
            .toRoot()
            .apply(OriginShapeProvider, { data, colorTheme: color, type, subType, tag, ref: ref ? ref : refId }, ref ? { ref, tags: 'Origins' } : { ref: refId, tags: 'Origins' })
        await repr
            .apply(StateTransforms.Representation.ShapeRepresentation3D)
            .commit()
        return repr.selector;
    }

    // public async rerenderOrigins(ref: string, data: Point[], color?: Color, tag?: string) {
    //     await PluginCommands.State.RemoveObject(this.plugin, { state: this.plugin.state.data, ref });
    //     await this.renderOrigin(data, color, ref, tag);
    // }

    public selectLocis(locis: Loci[]) {
        for (let loci of locis) {
            this.plugin.managers.interactivity.lociSelects.select({ loci });
        }
        this.selectedParams = { addedRepr: true }
    }

    private getLociForParams(params: QueryParam[], structureNumber?: number, isHet?: boolean) {
        let assemblyRef = this.assemblyRef;
        if (structureNumber) {
            assemblyRef = this.plugin.managers.structure.hierarchy.current.structures[structureNumber - 1].cell.transform.ref;
        }
        if (assemblyRef === '') return EmptyLoci;
        const data = (this.plugin.state.data.select(assemblyRef)[0].obj as PluginStateObject.Molecule.Structure).data;
        if (!data) return EmptyLoci;
        return QueryHelper.getInteractivityLoci(params, data);
    }

    private normalizeColor(colorVal: any, defaultColor?: Color) {
        let color = Color.fromRgb(170, 170, 170);
        try {
            if (typeof colorVal.r !== 'undefined') {
                color = Color.fromRgb(colorVal.r, colorVal.g, colorVal.b);
            } else if (colorVal[0] === '#') {
                color = Color(Number(`0x${colorVal.substr(1)}`));
            } else {
                color = Color(colorVal);
            }
        } catch (e) {
            if (defaultColor) color = defaultColor;
        }
        return color;
    }

    private computeCenterAndRadius(vectors: Vec3[]) {
        if (vectors.length === 0) {
            throw new Error("Array of vectors is empty.");
        }

        let center = Vec3.toObj(Vec3.zero());

        vectors.forEach((v) => {
            let vec = Vec3.toObj(v);
            center.x += vec.x;
            center.y += vec.y;
            center.z += vec.z;
        });

        center.x /= vectors.length;
        center.y /= vectors.length;
        center.z /= vectors.length;

        let radius = 0;

        vectors.forEach((v) => {
            let vec = Vec3.toObj(v);
            const dx = vec.x - center.x;
            const dy = vec.y - center.y;
            const dz = vec.z - center.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            radius = Math.max(radius, distance);
        });

        return { center: Vec3.fromObj(center), radius };
    }

    visual = {
        highlight: (params: { data: QueryParam[], color?: any, focus?: boolean, structureNumber?: number }) => {
            const loci = this.getLociForParams(params.data, params.structureNumber);
            if (Loci.isEmpty(loci)) return;
            if (params.color) {
                this.visual.setColor({ highlight: params.color });
            }
            this.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci });
            if (params.focus) this.plugin.managers.camera.focusLoci(loci);

        },
        clearHighlight: async () => {
            this.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci: EmptyLoci });
            if (this.isHighlightColorUpdated) this.visual.reset({ highlightColor: true });
        },
        select: async (params: { data: QueryParam[], nonSelectedColor?: any, addedRepr?: boolean, structureNumber?: number, forceClear?: boolean, isHet?: boolean, focusCenter?: boolean }) => {

            // clear prvious selection
            if (this.selectedParams || params.forceClear) {
                await this.visual.clearSelection(params.structureNumber);
            }

            // Structure list to apply selection
            let structureData = this.plugin.managers.structure.hierarchy.current.structures;
            if (params.structureNumber) {
                structureData = [this.plugin.managers.structure.hierarchy.current.structures[params.structureNumber - 1]];
            }

            // set non selected theme color
            if (params.nonSelectedColor) {
                for await (const s of structureData) {
                    await this.plugin.managers.structure.component.updateRepresentationsTheme(s.components, { color: 'uniform', colorParams: { value: this.normalizeColor(params.nonSelectedColor) } });
                }
            }

            this.plugin.canvas3d?.pause(true);
            // apply individual selections
            let centerFocusPositions: Vec3[] = [];
            for await (const param of params.data) {
                // get loci from param
                const loci = this.getLociForParams([param], params.structureNumber, params.isHet);
                if (Loci.isEmpty(loci)) return;
                if (loci.kind === 'element-loci') {
                    if (params.focusCenter) {
                        const { lookup3d, serialMapping, unitIndexMap, units } = loci.structure;
                        const { cumulativeUnitElementCount, elementIndices, unitIndices } = serialMapping;
                        const element = loci.elements[0];
                        OrderedSet.toArray(element.indices).forEach((e) => {
                            centerFocusPositions.push(element.unit.conformation.position(elementIndices[e], Vec3()));
                        })
                    }
                }
                // set default selection color to minimise change display
                this.visual.setColor({ select: param.color ? param.color : { r: 255, g: 112, b: 3 } });
                // apply selection
                this.plugin.managers.interactivity.lociSelects.select({ loci });
                // create theme param values and apply them to create overpaint
                const themeParams = StructureComponentManager.getThemeParams(this.plugin, this.plugin.managers.structure.component.pivotStructure);
                const colorValue = ParamDefinition.getDefaultValues(themeParams);
                colorValue.action.params = { color: param.color ? this.normalizeColor(param.color) : Color.fromRgb(255, 112, 3), opacity: 1 };
                await this.plugin.managers.structure.component.applyTheme(colorValue, structureData);
                // add new representations
                if (param.sideChain || param.representation) {
                    let repr = 'ball-and-stick';
                    if (param.representation) repr = param.representation;
                    const defaultParams = StructureComponentManager.getAddParams(this.plugin, { allowNone: false, hideSelection: true, checkExisting: true });
                    const defaultValues = ParamDefinition.getDefaultValues(defaultParams);
                    defaultValues.options = { label: '[Focus] Target - Lining Residues', checkExisting: params.structureNumber ? false : true };
                    const values = { ...defaultValues, ...{ representation: repr } };
                    const structures = this.plugin.managers.structure.hierarchy.getStructuresWithSelection();
                    await this.plugin.managers.structure.component.add(values, structures);

                    // Apply uniform theme
                    if (param.representationColor) {
                        let updatedStructureData = this.plugin.managers.structure.hierarchy.current.structures;
                        if (params.structureNumber) {
                            updatedStructureData = [this.plugin.managers.structure.hierarchy.current.structures[params.structureNumber - 1]];
                        }
                        const comps = updatedStructureData[0].components;
                        const lastCompsIndex = comps.length - 1;
                        const recentRepComp = [comps[lastCompsIndex]];
                        const uniformColor = param.representationColor ? this.normalizeColor(param.representationColor) : Color.fromRgb(255, 112, 3);
                        this.plugin.managers.structure.component.updateRepresentationsTheme(recentRepComp, { color: 'uniform', colorParams: { value: uniformColor } });
                    }

                    params.addedRepr = true;
                }
                // focus loci
                if (param.focus && !params.focusCenter) this.plugin.managers.camera.focusLoci(loci);
                // remove selection
                this.plugin.managers.interactivity.lociSelects.deselect({ loci });
            }
            if (params.focusCenter && centerFocusPositions.length > 0) {
                this.plugin.managers.camera.focusSphere(this.computeCenterAndRadius(centerFocusPositions));
            }
            this.plugin.canvas3d?.pause(false);

            // reset selection color
            this.visual.reset({ selectColor: true });
            // save selection params to optimise clear
            this.selectedParams = params;

        },
        selectResidues: async (params: { data: QueryParam[], nonSelectedColor?: any, addedRepr?: boolean, structureNumber?: number, forceClear?: boolean, isHet?: boolean }) => {

            // clear prvious selection
            if (this.selectedParams || params.forceClear) {
                await this.visual.clearSelection(params.structureNumber);
            }

            // Structure list to apply selection
            let structureData = this.plugin.managers.structure.hierarchy.current.structures;
            if (params.structureNumber) {
                structureData = [this.plugin.managers.structure.hierarchy.current.structures[params.structureNumber - 1]];
            }

            // set non selected theme color
            if (params.nonSelectedColor) {
                for await (const s of structureData) {
                    await this.plugin.managers.structure.component.updateRepresentationsTheme(s.components, { color: 'uniform', colorParams: { value: this.normalizeColor(params.nonSelectedColor) } });
                }
            }

            this.plugin.canvas3d?.pause(true);
            // apply individual selections
            for await (const param of params.data) {
                // get loci from param
                const loci = this.getLociForParams([param], params.structureNumber, params.isHet);
                if (Loci.isEmpty(loci)) return;
                // set default selection color to minimise change display
                this.visual.setColor({ select: param.color ? param.color : { r: 255, g: 112, b: 3 } });
                // apply selection
                this.plugin.managers.interactivity.lociSelects.select({ loci });
                // create theme param values and apply them to create overpaint
                const themeParams = StructureComponentManager.getThemeParams(this.plugin, this.plugin.managers.structure.component.pivotStructure);
                const colorValue = ParamDefinition.getDefaultValues(themeParams);
                colorValue.action.params = { color: param.color ? this.normalizeColor(param.color) : Color.fromRgb(255, 112, 3), opacity: 1 };
                await this.plugin.managers.structure.component.applyTheme(colorValue, structureData);
                // add new representations
                if (param.sideChain || param.representation) {
                    let repr = 'ball-and-stick';
                    if (param.representation) repr = param.representation;
                    const defaultParams = StructureComponentManager.getAddParams(this.plugin, { allowNone: false, hideSelection: true, checkExisting: true });
                    const defaultValues = ParamDefinition.getDefaultValues(defaultParams);
                    defaultValues.options = { label: '[Focus] Target - Lining Residues', checkExisting: params.structureNumber ? false : true };
                    const values = { ...defaultValues, ...{ representation: repr } };
                    const structures = this.plugin.managers.structure.hierarchy.getStructuresWithSelection();
                    await this.plugin.managers.structure.component.add(values, structures);

                    // Apply uniform theme
                    if (param.representationColor) {
                        let updatedStructureData = this.plugin.managers.structure.hierarchy.current.structures;
                        if (params.structureNumber) {
                            updatedStructureData = [this.plugin.managers.structure.hierarchy.current.structures[params.structureNumber - 1]];
                        }
                        const comps = updatedStructureData[0].components;
                        const lastCompsIndex = comps.length - 1;
                        const recentRepComp = [comps[lastCompsIndex]];
                        const uniformColor = param.representationColor ? this.normalizeColor(param.representationColor) : Color.fromRgb(255, 112, 3);
                        this.plugin.managers.structure.component.updateRepresentationsTheme(recentRepComp, { color: 'uniform', colorParams: { value: uniformColor } });
                    }

                    params.addedRepr = true;
                }
                // focus loci
                if (param.focus) this.plugin.managers.camera.focusLoci(loci);
                // remove selection
                this.plugin.managers.interactivity.lociSelects.deselect({ loci });
            }
            this.plugin.canvas3d?.pause(false);

            // reset selection color
            this.visual.reset({ selectColor: true });
            // save selection params to optimise clear
            this.selectedParams = params;

        },
        clearSelection: async (structureNumber?: number) => {
            const structIndex = structureNumber ? structureNumber - 1 : 0;
            this.plugin.managers.interactivity.lociSelects.deselectAll();
            // reset theme to default
            if (this.selectedParams && this.selectedParams.nonSelectedColor) {
                this.visual.reset({ theme: true });
            }
            // remove overpaints
            await clearStructureOverpaint(this.plugin, this.plugin.managers.structure.hierarchy.current.structures[structIndex].components);
            // remove selection representations
            if (this.selectedParams && this.selectedParams.addedRepr) {
                const selReprCells = [];
                for (const c of this.plugin.managers.structure.hierarchy.current.structures[structIndex].components) {
                    if (c.cell && c.cell.params && c.cell.params.values && c.cell.params.values.label && c.cell.params.values.label.includes('[Focus]')) selReprCells.push(c.cell);
                }
                if (selReprCells.length > 0) {
                    for await (const selReprCell of selReprCells) {
                        await PluginCommands.State.RemoveObject(this.plugin, { state: selReprCell.parent!, ref: selReprCell.transform.ref });
                    };
                }

            }
            this.selectedParams = undefined;
        },
        toggleSpin: async (isSpinning?: boolean, resetCamera?: boolean) => {
            if (!this.plugin.canvas3d) return;
            const trackball = this.plugin.canvas3d.props.trackball;

            let toggleSpinParam: any = trackball.animate.name === 'spin' ? { name: 'off', params: {} } : { name: 'spin', params: { speed: 1 } };

            if (typeof isSpinning !== 'undefined') {
                toggleSpinParam = { name: 'off', params: {} };
                if (isSpinning) toggleSpinParam = { name: 'spin', params: { speed: 1 } };
            }
            await PluginCommands.Canvas3D.SetSettings(this.plugin, { settings: { trackball: { ...trackball, animate: toggleSpinParam } } });
            if (resetCamera) await PluginCommands.Camera.Reset(this.plugin, {});
        },
        focus: async (params: QueryParam[], structureNumber?: number) => {
            const loci = this.getLociForParams(params, structureNumber);
            this.plugin.managers.camera.focusLoci(loci);
        },
        setColor: async (param: { highlight?: ColorParams, select?: ColorParams }) => {
            if (!this.plugin.canvas3d) return;
            if (!param.highlight && !param.select) return;
            const renderer = { ...this.plugin.canvas3d.props.renderer };
            const marking = { ...this.plugin.canvas3d.props.marking };
            if (param.highlight) {
                renderer.highlightColor = this.normalizeColor(param.highlight);
                marking.highlightEdgeColor = Color.darken(this.normalizeColor(param.highlight), 1);
                this.isHighlightColorUpdated = true;
            }
            if (param.select) {
                renderer.selectColor = this.normalizeColor(param.select);
                marking.selectEdgeColor = Color.darken(this.normalizeColor(param.select), 1);
                this.isSelectedColorUpdated = true;
            }
            await PluginCommands.Canvas3D.SetSettings(this.plugin, { settings: { renderer, marking } });
        },
        setDefaultColor: async (color: ColorParams) => {
            if (!this.plugin.canvas3d) return;
            const renderer = { ...this.plugin.canvas3d.props.renderer };
            const marking = { ...this.plugin.canvas3d.props.marking };
            renderer.selectColor = this.normalizeColor(color);
            marking.selectEdgeColor = Color.darken(this.normalizeColor(color), 1);
            this.isSelectedColorUpdated = true;
            await PluginCommands.Canvas3D.SetSettings(this.plugin, { settings: { renderer, marking } });
        },
        reset: async (params: { camera?: boolean, theme?: boolean, highlightColor?: boolean, selectColor?: boolean }) => {
            if (params.camera) await PluginCommands.Camera.Reset(this.plugin, { durationMs: 250 });

            if (params.theme) {
                const defaultTheme: any = { color: this.initParams.alphafoldView ? 'plddt-confidence' : 'default' };
                const componentGroups = this.plugin.managers.structure.hierarchy.currentComponentGroups;
                for (const compGrp of componentGroups) {
                    await this.plugin.managers.structure.component.updateRepresentationsTheme(compGrp, defaultTheme);
                }
            }

            if (params.highlightColor || params.selectColor) {
                if (!this.plugin.canvas3d) return;
                const renderer = { ...this.plugin.canvas3d.props.renderer };
                const marking = { ...this.plugin.canvas3d.props.marking };
                if (params.highlightColor) {
                    renderer.highlightColor = this.defaultRendererProps.highlightColor;
                    marking.highlightEdgeColor = this.defaultMarkingProps.highlightEdgeColor;
                    this.isHighlightColorUpdated = false;
                }
                if (params.selectColor) {
                    renderer.selectColor = this.defaultRendererProps.selectColor;
                    marking.selectEdgeColor = this.defaultMarkingProps.selectEdgeColor;
                    this.isSelectedColorUpdated = false;
                }
                await PluginCommands.Canvas3D.SetSettings(this.plugin, { settings: { renderer, marking } });
            }
        },
    }
}