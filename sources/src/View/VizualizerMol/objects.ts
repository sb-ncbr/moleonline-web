import { Mesh } from "molstar/lib/mol-geo/geometry/mesh/mesh";
import { presetStaticComponent, StructureRepresentationPresetProvider } from "molstar/lib/mol-plugin-state/builder/structure/representation-preset";
import { PluginStateObject, PluginStateTransform } from "molstar/lib/mol-plugin-state/objects";
import { StateObjectRef, StateTransformer } from "molstar/lib/mol-state";
import { Task } from "molstar/lib/mol-task";
import { Color } from "molstar/lib/mol-util/color";
import { Material } from "molstar/lib/mol-util/material";
import { ParamDefinition as PD } from "molstar/lib/mol-util/param-definition";
import { createMembrane, createOriginSurface, createSurfaceShape } from "./visualizing";
import { BaseGeometry, ColorSmoothingParams } from "molstar/lib/mol-geo/geometry/base";
import { MarkerAction } from "molstar/lib/mol-util/marker-action";
import { MembranePoint, Origins, Point, Tunnel } from "../../DataInterface";
import { PickingId } from "molstar/lib/mol-geo/geometry/picking";
import { Shape } from "molstar/lib/mol-model/shape";
import { TunnelShapeProvider } from "molstar/lib/extensions/sb-ncbr";
import { TunnelStateObject } from "molstar/lib/extensions/sb-ncbr/tunnels/data-model";
import { assignLayers, createSpheresShape, createTree, createTunnelShape, interpolateTunnel } from "./color-tunnels/algorithm";
import { TunnelPropertyColorShapeParams } from "./color-tunnels/data-model";
import { ShapeRepresentation as ColorShapeRepresentation } from "./color-tunnels/shapeRepresentation";
import { ShapeGroupColorTheme, ShapeGroupSizeTheme } from "./color-tunnels/colored-tunnel-theme";
import { ShapeRepresentation } from "molstar/lib/mol-repr/shape/representation";

const Transform = StateTransformer.builderFactory("moleonline");

const PresetParams = {
    ...StructureRepresentationPresetProvider.CommonParams,
};

const CustomMaterial = Material({ roughness: 0.2, metalness: 0 });

const SurfacePreset = StructureRepresentationPresetProvider({
    id: 'preset-surface',
    display: { name: 'Surface' },
    params: () => PresetParams,
    async apply(ref, params, plugin) {
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = structureCell?.obj?.data;
        if (!structureCell || !structure) return {};

        const components = {
            polymer: await presetStaticComponent(plugin, structureCell, 'polymer'),
        };

        const { update, builder, typeParams } = StructureRepresentationPresetProvider.reprBuilder(plugin, params);
        const representations = {
            polymer: builder.buildRepresentation(update, components.polymer, { type: 'molecular-surface', typeParams: { ...typeParams, material: CustomMaterial, quality: 'custom', resolution: 0.5, doubleSided: true }, color: 'partial-charge' }, { tag: 'polymer' }),
        };

        await update.commit({ revertOnError: true });
        plugin.managers.interactivity.setProps({ granularity: 'residue' });

        return { components, representations };
    }
});

export const MembraneShapeProvider = Transform({
    name: 'membrane-shape-provider',
    display: 'Membrane',
    from: PluginStateObject.Root,
    to: PluginStateObject.Shape.Provider,
    params: {
        colorTheme: PD.Color(Color(0x00ff00), { isHidden: true }),
        data: PD.Value<MembranePoint[]>([], { isHidden: true })
    }
})({
    apply({ a, params }) {
        return Task.create('Membrane Shape Provider', async ctx => {
            return new PluginStateObject.Shape.Provider({
                label: "Membrane",
                data: { params, data: a.data },
                params: Mesh.Params,
                geometryUtils: Mesh.Utils,
                getShape: async (_, data, __, mesh) => {
                    return createMembrane(params.data, params.colorTheme)
                }
            })
        })
    }
})

export const PickableRepresentation3D = Transform({
    name: 'pickable-representation-3d',
    display: '3D Representation',
    from: PluginStateObject.Shape.Provider,
    to: PluginStateObject.Shape.Representation3D,
    params: { ...BaseGeometry.Params, pickable: PD.Boolean(true) }
})({
    apply({ a, params }) {
        return Task.create('Pickable Shape Representation', async ctx => {
            const props = { ...PD.getDefaultValues(a.data.params), ...params};
            const repr = ShapeRepresentation(a.data.getShape, a.data.geometryUtils);
            await repr.createOrUpdate(props, a.data.data).runInContext(ctx);
            if (!params.pickable)
                repr.setState({ pickable: false, markerActions: MarkerAction.None });
            return new PluginStateObject.Shape.Representation3D({ repr, sourceData: a.data }, { label: a.data.label });
        })
    }
})

export const TunnelRepresentation3D = Transform({
    name: 'moleonline-tunnel-representation-3d',
    display: '3D Representation',
    from: PluginStateObject.Shape.Provider,
    to: PluginStateObject.Shape.Representation3D,
    params: { ...BaseGeometry.Params, tag: PD.Value<string>("Tunnel", { isHidden: true }), tunnel: PD.Value<Tunnel | null >(null, { isHidden: true}) }
})({
    apply({ a, params }) {
        return Task.create('MoleOnline Tunnel Shape Representation', async ctx => {
            const props = { ...PD.getDefaultValues(a.data.params), ...params};
            let repr = ShapeRepresentation(a.data.getShape, a.data.geometryUtils);
            await repr.createOrUpdate(props, a.data.data).runInContext(ctx);
            repr = {...repr, params: { tag: "Tunnel", tunnel: params.tunnel }};
            return new PluginStateObject.Shape.Representation3D({ repr, sourceData: { data: a.data, tag: "Tunnel" }}, { label: a.data.label });
        })
    }
})

export const OriginShapeProvider = Transform({
    name: 'origin-shape-provider',
    display: 'Origin',
    from: PluginStateObject.Root,
    to: PluginStateObject.Shape.Provider,
    params: {
        colorTheme: PD.Color(Color(0x00ff00), { isHidden: true }), //TODO
        data: PD.Value<Point[]>([], { isHidden: true }),
        tag: PD.Value<string>("", { isHidden: true }),
        ref: PD.Value<string>("", { isHidden: true }),
        subType: PD.Value<string | undefined>(undefined, { isHidden: true }),
        type: PD.Value<string>("Origin", { isHidden: true }),

    }
})({
    apply({ a, params }) {
        return Task.create('Origin Shape Provider', async ctx => {
            return new PluginStateObject.Shape.Provider({
                label: 'Origin',
                data: { params, data: a.data},
                params: Mesh.Params,
                geometryUtils: Mesh.Utils,
                getShape: async (_, data, __, mesh) => {
                    return createOriginSurface(params.data, params.colorTheme, params.type, params.subType, params.tag, params.ref)
                }
            })
        })
    }
})

export class MoleObjectsNode extends PluginStateObject.Create<{}>({ name: 'Mole Objects Node', typeClass: 'Object' }) { }

export const MoleObjectsNodeProvider = PluginStateTransform.BuiltIn({
    name: 'create-mole-objects-node',
    display: { name: 'MoleObjects' },
    from: PluginStateObject.Root,
    to: MoleObjectsNode,
    params: {}
})({
    apply({ params }) {
        return Task.create('MoleObjects Node Create', async () => {
            return new MoleObjectsNode({}) // { label: 'MoleObjects' }
        });
    },
})

export const SurfaceShapeProvider = Transform({
    name: 'surfaceprovider',
    display: { name: 'Surface' },
    from: MoleObjectsNode,
    to: PluginStateObject.Shape.Provider,
    params: {
        colorTheme: PD.Color(Color(0x00ff00), {isHidden: true}),
        vertices: PD.Value<number[]>([], {isHidden: true}),
        triangleIndices: PD.Value<number[]>([], {isHidden: true}),
        solidForm: PD.Boolean(false, {isHidden: true}),
        tag: PD.Value<string>('Surface', {isHidden: true}),
        label: PD.Value<string>('', { isHidden: true }),
    },
})({
    apply({ a, params }) {
        return Task.create('Surface Shape Provider', async ctx => {
            return new PluginStateObject.Shape.Provider({
                label: "Surface",
                data: { params, data: { tag: params.tag } },
                params: Mesh.Params,
                geometryUtils: Mesh.Utils,
                getShape: async (_, data, __, mesh) => {
                    return createSurfaceShape({ 
                        triangles: params.triangleIndices,
                        vertices: params.vertices,
                        color: params.colorTheme,
                        solidForm: params.solidForm,
                        label: params.label,
                        prev: mesh });
                }
            })
        })
    }
})


export const TunnelPropertyColorRepresentation3D = Transform({
    name: 'moleonline-tunnel-colorproperty-representation-3d',
    display: '3D Representation',
    from: PluginStateObject.Shape.Provider,
    to: PluginStateObject.Shape.Representation3D,
    params: { ...BaseGeometry.Params, tag: PD.Value<string>("PropertyColorTunnel", { isHidden: true }), tunnel: PD.Value<Tunnel | null >(null, { isHidden: true}) }
})({
    apply({ a, params }) {
        return Task.create('MoleOnline Tunnel Shape Representation', async ctx => {
            let props = { ...PD.getDefaultValues(a.data.params), ...params, ...ColorSmoothingParams};
            // if (a.data.params.showRadii) {
            //     props = { ...PD.getDefaultValues(a.data.params), ...params, instanceGranularity: false };
            // }
            // else {
            //     props = { ...PD.getDefaultValues(a.data.params), ...params, instanceGranularity: true };
            // }
            let repr = ColorShapeRepresentation(a.data.getShape, a.data.geometryUtils);
            const data = interpolateTunnel(a.data.data.data.tunnel.data, a.data.data.params.samplingRate);
            repr.setTheme({
                color: ShapeGroupColorTheme({
                    tree: createTree(data),
                    mappedPoints: assignLayers(data, a.data.data.params.layers),
                    colorOptions: {
                        colorMaxValue: a.data.data.params.colorTheme.params.property.params.colorMaxValue,
                        colorMinValue: a.data.data.params.colorTheme.params.property.params.colorMinValue,
                        layers: a.data.data.params.layers,
                        skipMiddleColors: a.data.data.params.colorTheme.params.skipMiddleColors,
                        colorBounds: a.data.data.params.colorTheme.params.colorBounds
                    },
                    property: a.data.data.params.colorTheme.params.property.name
                }),
                size: ShapeGroupSizeTheme({})
            })
            await repr.createOrUpdate(props, a.data.data).runInContext(ctx);
            repr = {...repr, params: { tag: "PropertyColorTunnel", tunnel: params.tunnel }};
            return new PluginStateObject.Shape.Representation3D({ repr, sourceData: { data: a.data, tag: "PropertyColorTunnel" }}, { label: a.data.label });
        })
    }
})

export const TunnelPropertyColorShapeProvider = Transform({
    name: 'colorproperty-tunnel-shape-provider',
    display: { name: 'Tunnel' },
    from: TunnelStateObject,
    to: PluginStateObject.Shape.Provider,
    params: a => { return TunnelPropertyColorShapeParams; },
})({
    apply({ a, params }) {
        return Task.create('Tunnel Shape Representation', async ctx => {
            return new PluginStateObject.Shape.Provider({
                label: 'Surface',
                data: { params, data: a.data },
                params: Mesh.Params,
                geometryUtils: Mesh.Utils,
                getShape: (_, data, __, mesh) => {
                    if (data.params.visual.name === 'mesh' && !data.params.showRadii) {
                        if (data.params.colorTheme.name === 'color') {
                            return createTunnelShape({
                                tunnel: data.data.tunnel,
                                color: data.params.colorTheme.params,
                                resolution: data.params.visual.params.resolution,
                                sampleRate: data.params.samplingRate,
                                webgl: data.params.webgl, prev: mesh,
                            });
                        }
                        return createTunnelShape({
                            tunnel: data.data.tunnel,
                            resolution: data.params.visual.params.resolution,
                            sampleRate: data.params.samplingRate,
                            webgl: data.params.webgl, prev: mesh,
                            colorOptions: {
                                property: data.params.colorTheme.params.property.name,
                                colorMaxValue: data.params.colorTheme.params.property.params.colorMaxValue,
                                colorMinValue: data.params.colorTheme.params.property.params.colorMinValue,
                                skipMiddleColors: data.params.colorTheme.params.skipMiddleColors,
                                layers: data.params.layers,
                                colorBounds: data.params.colorTheme.params.colorBounds,
                                showLayers: data.params.colorTheme.params.showLayers
                            }
                        });
                    }
                    if (data.params.colorTheme.name === 'color') {
                        return createSpheresShape({
                            tunnel: data.data.tunnel,
                            color: data.params.colorTheme.params,
                            resolution: data.params.visual.params.resolution,
                            sampleRate: data.params.samplingRate,
                            showRadii: data.params.showRadii, prev: mesh,
                        });
                    }
                    return createSpheresShape({
                        tunnel: data.data.tunnel,
                        resolution: data.params.visual.params.resolution,
                        sampleRate: data.params.samplingRate,
                        showRadii: data.params.showRadii, prev: mesh,
                        colorOptions: {
                            property: data.params.colorTheme.params.property.name,
                            colorMaxValue: data.params.colorTheme.params.property.params.colorMaxValue,
                            colorMinValue: data.params.colorTheme.params.property.params.colorMinValue,
                            skipMiddleColors: data.params.colorTheme.params.skipMiddleColors,
                            layers: data.params.layers,
                            colorBounds: data.params.colorTheme.params.colorBounds,
                            showLayers: data.params.colorTheme.params.showRadii ? false : data.params.colorTheme.params.showLayers
                        }
                    });
                }
            }, {
                label: a.data.tunnel.props.label ?? 'Tunnel',
                description: a.data.tunnel.props.description
                ?? (a.data.tunnel.props.type && a.data.tunnel.props.id)
                    ? `${a.data.tunnel.props.type} ${a.data.tunnel.props.id}`
                    : '',
            });
        });
    },
});