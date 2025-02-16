import { OrderedSet } from 'molstar/lib/mol-data/int';
import { addSphere } from 'molstar/lib/mol-geo/geometry/mesh/builder/sphere';
import { Mesh } from 'molstar/lib/mol-geo/geometry/mesh/mesh';
import { MeshBuilder } from 'molstar/lib/mol-geo/geometry/mesh/mesh-builder';
import { computeMarchingCubesMesh } from 'molstar/lib/mol-geo/util/marching-cubes/algorithm';
import { WebGLContext } from 'molstar/lib/mol-gl/webgl/context';
import { Texture } from 'molstar/lib/mol-gl/webgl/texture';
import { PositionData, Sphere3D, Box3D, GridLookup3D, fillGridDim } from 'molstar/lib/mol-math/geometry';
import { Boundary, getBoundary } from 'molstar/lib/mol-math/geometry/boundary';
import { DefaultMolecularSurfaceCalculationProps, MolecularSurfaceCalculationProps } from 'molstar/lib/mol-math/geometry/molecular-surface';
import { lerp, smoothstep, spline } from 'molstar/lib/mol-math/interpolate';
import { Vec3, Tensor, Mat4 } from 'molstar/lib/mol-math/linear-algebra';
import { Shape } from 'molstar/lib/mol-model/shape';
import { ensureReasonableResolution } from 'molstar/lib/mol-repr/structure/visual/util/common';
import { Task, RuntimeContext } from 'molstar/lib/mol-task';
import { ValueCell } from 'molstar/lib/mol-util';
import { Color } from 'molstar/lib/mol-util/color';
import { LayersInfo, TunnelMetaInfo, Tunnel as DataTunnel } from '../../../DataInterface';
import { ColorBound, colorByDistance, DefaultColor, Property, colorTunnel, getLayerGroupId } from './property-color';
import { Profile, Tunnel } from 'molstar/lib/extensions/sb-ncbr/tunnels/data-model';
import { ColorSmoothingParams, getColorSmoothingProps } from 'molstar/lib/mol-geo/geometry/base';
import { ParamDefinition } from 'molstar/lib/mol-util/param-definition';
import { KDTree } from './kd-tree';

type MolecularSurfaceMeta = {
    resolution?: number
    colorTexture?: Texture
}

export async function createSpheresShape(options: {
    tunnel: Tunnel, color?: Color, resolution: number, sampleRate: number, showRadii: boolean,
    colorOptions?: {
        property: Property,
        colorMaxValue: number,
        colorMinValue: number,
        layers: LayersInfo[],
        skipMiddleColors: boolean,
        colorBounds: ColorBound,
        showLayers: boolean
    },
    prev?: Shape<Mesh>
}) {
    const builder = MeshBuilder.createState(512, 512, options.prev?.geometry);
    const tunnel = options.tunnel;

    let processedData;

    processedData = interpolateTunnel(tunnel.data, options.sampleRate);

    if (options.showRadii) {
        for (let i = 0; i < processedData.length; i += 1) {
            const p = processedData[i];
            builder.currentGroup = i;
            const center = [p.X, p.Y, p.Z];
            addSphere(builder, center as Vec3, p.Radius, options.resolution);
        }
    } else {
        for (let i = 0; i < processedData.length; i += 1) {
            const p = processedData[i];
            builder.currentGroup = options.colorOptions ? getLayerGroupId(p.T, options.colorOptions.layers) : 0;
            const center = [p.X, p.Y, p.Z];
            addSphere(builder, center as Vec3, p.Radius, options.resolution);
        }
    }

    const mesh = MeshBuilder.getMesh(builder);
    const name = tunnel.props.highlight_label ?
        tunnel.props.highlight_label :
        tunnel.props.type && tunnel.props.id ?
            `${tunnel.props.type} ${tunnel.props.id}` :
            'Tunnel';

    if (options.showRadii)
        return Shape.create(
            name,
            tunnel.props,
            mesh,
            (i) => {
                if (options.colorOptions)
                    return i >= options.tunnel.data.length
                        ? colorByDistance(options.colorOptions.property, 1, { ...options.colorOptions })
                        : colorByDistance(options.colorOptions.property, options.tunnel.data[i].T, { ...options.colorOptions });
                return options.color ? Color(options.color) : DefaultColor;
            },
            () => 1,
            (i) => `[${processedData[i].X.toFixed(3)}, ${processedData[i].Y.toFixed(3)}, ${processedData[i].Z.toFixed(3)}] - radius: ${processedData[i].Radius.toFixed(3)}`,
        );
    return Shape.create(
        name,
        tunnel.props,
        mesh,
        (i) => {
            if (options.colorOptions)
                return i < processedData.length
                    ? colorTunnel(options.colorOptions.property, i, { ...options.colorOptions })
                    : colorTunnel(options.colorOptions.property, options.colorOptions.layers.length - 1, { ...options.colorOptions });
            return options.color ? Color(options.color) : DefaultColor;
        },
        () => 1,
        (i) => options.colorOptions && options.colorOptions.showLayers ? name + `Layer (${i})` : name,
    );
}

export async function createTunnelShape(options: {
    tunnel: Tunnel, color?: Color, resolution: number, sampleRate: number, webgl: WebGLContext | undefined,
    colorOptions?: {
        property: Property,
        colorMaxValue: number,
        colorMinValue: number,
        layers: LayersInfo[],
        skipMiddleColors: boolean,
        colorBounds: ColorBound,
        showLayers: boolean,
    } | undefined,
    prev?: Shape<Mesh>
}) {
    const tunnel = options.tunnel;
    const processedData = interpolateTunnel(tunnel.data, options.sampleRate);
    const mesh = await createTunnelMesh(tunnel.data, options.colorOptions ? options.colorOptions.layers : [], {
        detail: options.resolution,
        sampleRate: options.sampleRate,
        webgl: options.webgl,
        prev: options.prev?.geometry
    });

    const name = tunnel.props.highlight_label ?
        tunnel.props.highlight_label :
        tunnel.props.type && tunnel.props.id ?
            `${tunnel.props.type} ${tunnel.props.id}` :
            'Tunnel';

    return Shape.create(
        name,
        tunnel.props,
        mesh,
        (i) => {
            if (options.colorOptions)
                return i < processedData.length
                    ? colorTunnel(options.colorOptions.property, i, { ...options.colorOptions })
                    : colorTunnel(options.colorOptions.property, options.colorOptions.layers.length - 1, { ...options.colorOptions });
            return options.color ? Color(options.color) : DefaultColor;
        },
        () => 1,
        (i) => options.colorOptions && options.colorOptions.showLayers ? name + `Layer (${i})` : name,
    );
}

function profileToVec3(profile: Profile): Vec3 {
    return Vec3.create(profile.X, profile.Y, profile.Z);
}

export function adjustCaverDistance(channel: DataTunnel & TunnelMetaInfo) {
    let distance = 0;
    for (let i = 0; i < channel.Profile.length; i++) {
        distance += channel.Profile[i].Distance;
        channel.Profile[i].Distance = distance;
    }
}

// Centripetal Catmull–Rom spline interpolation
export function interpolateTunnel(profile: Profile[], sampleRate: number) {
    const interpolatedProfiles: Profile[] = [];
    if (profile.length < 4) return profile; // Ensuring there are enough points to interpolate

    interpolatedProfiles.push(profile[0]);

    let lastPoint = profileToVec3(profile[0]);
    let currentDistance = 0;
    const pointInterval = 1 / sampleRate;

    for (let i = 1; i < profile.length - 2; i++) {
        const P0 = profile[i - 1];
        const P1 = profile[i];
        const P2 = profile[i + 1];
        const P3 = profile[i + 2];

        for (let t = 0; t <= 1; t += 0.05) {
            const interpolatedX = spline(P0.X, P1.X, P2.X, P3.X, t, 0.5);
            const interpolatedY = spline(P0.Y, P1.Y, P2.Y, P3.Y, t, 0.5);
            const interpolatedZ = spline(P0.Z, P1.Z, P2.Z, P3.Z, t, 0.5);
            const interpolatedPoint = Vec3.create(interpolatedX, interpolatedY, interpolatedZ);

            const distanceToAdd = Vec3.distance(lastPoint, interpolatedPoint);
            currentDistance += distanceToAdd;

            if (currentDistance >= pointInterval) {
                interpolatedProfiles.push({
                    X: interpolatedX,
                    Y: interpolatedY,
                    Z: interpolatedZ,
                    Radius: spline(P0.Radius, P1.Radius, P2.Radius, P3.Radius, t, 0.5),
                    Charge: lerp(P1.Charge, P2.Charge, t),
                    FreeRadius: spline(P0.FreeRadius, P1.FreeRadius, P2.FreeRadius, P3.FreeRadius, t, 0.5),
                    T: lerp(P1.T, P2.T, t),
                    Distance: lerp(P1.Distance, P2.Distance, t)
                });
                lastPoint = interpolatedPoint;
                currentDistance -= pointInterval;
            }
        }
    }

    // Ensuring the last profile point is included
    interpolatedProfiles.push(profile[profile.length - 1]);

    return interpolatedProfiles;
}

export function convertToPositionData(profile: Profile[], probeRadius: number, layers: LayersInfo[]): Required<PositionData> {
    let position = {} as PositionData;

    const x: number[] = [];
    const y: number[] = [];
    const z: number[] = [];
    const indices: Array<number> = [];
    const radius: number[] = [];

    const maxRadius: number = Number.MIN_SAFE_INTEGER;

    let sphereCounter = 0;
    for (const sphere of profile) {
        x.push(sphere.X);
        y.push(sphere.Y);
        z.push(sphere.Z);
        indices.push(sphereCounter);
        radius.push(sphere.Radius + probeRadius);
        sphereCounter++;
    }

    position = { x, y, z, indices: OrderedSet.ofSortedArray(indices), radius, id: indices };

    return position as Required<PositionData>;
}

export function getLayerIndexes(profile: Profile[], layers: LayersInfo[]): Map<number, number> {
    const layerIndex = new Map<number, number>();

    if (layers.length === 0) {
        for (let i = 0; i < profile.length; i++) {
            layerIndex.set(i, 0);
        }
        return layerIndex;
    }

    for (let i = 0; i < profile.length; i++) {
        layerIndex.set(i, getLayerGroupId(profile[i].T, layers));
    }
    return layerIndex;
}

async function createTunnelMesh(
    data: Profile[],
    layers: LayersInfo[],
    options: {
        detail: number,
        sampleRate: number,
        webgl?: WebGLContext,
        prev?: Mesh
    }
) {
    const props = {
        ...DefaultMolecularSurfaceCalculationProps,
    };
    const preprocessedData = interpolateTunnel(data, options.sampleRate);
    // const preprocessedData = getBorderData(data, layers);
    const positions = convertToPositionData(preprocessedData, props.probeRadius, layers);
    const bounds: Boundary = getBoundary(positions);
    const layerIndexes = getLayerIndexes(preprocessedData, layers);
    const centerLine = extendCenterLine(getCenterLine(preprocessedData), preprocessedData[0].Radius, preprocessedData[preprocessedData.length - 1].Radius);
    const centerLineProcessed: CenterLinePoint[] = []; //processCenterLine(data, layers);

    let maxR = 0;
    for (let i = 0; i < positions.radius.length; ++i) {
        const r = positions.radius[i];
        if (maxR < r) maxR = r;
    }

    const p = ensureReasonableResolution(bounds.box, props);

    const { field, transform, /* resolution,*/ maxRadius, idField } = await computeTunnelSurface(
        {
            positions,
            boundary: bounds,
            maxRadius: maxR,
            box: bounds.box,
            props: p,
            layerIndexes,
            centerLine,
            layers,
            data: preprocessedData,
            centerLineProcessed
        }
    ).run();

    const params = {
        isoLevel: p.probeRadius,
        scalarField: field,
        idField
    };
    const surface = await computeMarchingCubesMesh(params, options.prev).run();
    const iterations = Math.ceil(2 / 1);
    // Mesh.smoothEdges(surface, { iterations, maxNewEdgeLength: Math.sqrt(2) });
    Mesh.smoothEdges(surface, { iterations: Math.ceil(maxRadius), maxNewEdgeLength: Math.sqrt(2) });

    Mesh.transform(surface, transform);
    if (options.webgl && !options.webgl.isWebGL2) {
        Mesh.uniformTriangleGroup(surface);
        ValueCell.updateIfChanged(surface.varyingGroup, false);
    } else {
        ValueCell.updateIfChanged(surface.varyingGroup, true);
    }

    const sphere = Sphere3D.expand(Sphere3D(), bounds.sphere, maxRadius);
    surface.setBoundingSphere(sphere);
    (surface.meta as MolecularSurfaceMeta).resolution = options.detail;

    return surface;
}

export function computeTunnelSurface(
    surfaceData: {
        positions: Required<PositionData>,
        boundary: Boundary,
        maxRadius: number,
        box: Box3D | null,
        props: MolecularSurfaceCalculationProps,
        layerIndexes: Map<number, number>,
        centerLine: Vec3[],
        layers: LayersInfo[],
        data: Profile[],
        centerLineProcessed: CenterLinePoint[]
    }
) {
    return Task.create('Tunnel Surface', async (ctx) => {
        return await calcTunnelSurface(ctx, surfaceData);
    });
}

export type SurfaceData = {
    positions: Required<PositionData>,
    boundary: Boundary,
    maxRadius: number,
    box: Box3D | null,
    props: MolecularSurfaceCalculationProps,
    layerIndexes: Map<number, number>,
    centerLine: Vec3[],
    layers: LayersInfo[],
    data: Profile[],
    centerLineProcessed: CenterLinePoint[]
}

async function calcTunnelSurface(ctx: RuntimeContext,
    surfaceData: {
        positions: Required<PositionData>,
        boundary: Boundary,
        maxRadius: number,
        box: Box3D | null,
        props: MolecularSurfaceCalculationProps,
        layerIndexes: Map<number, number>,
        centerLine: Vec3[],
        layers: LayersInfo[],
        data: Profile[],
        centerLineProcessed: CenterLinePoint[]
    }) {

    function runTunnelSurfaceComputation() {
        return new Promise((resolve, reject) => {
            const worker = new Worker(new URL('./worker.ts', import.meta.url));

            worker.postMessage({
                ctx,
                surfaceData,
            });

            worker.onmessage = (event) => {
                const { success, error, calcData, calcIdData } = event.data;

                if (!success) {
                    console.error('Worker Error:', error);
                }

                data = calcData,
                idData = calcIdData,
                
                resolve(event.data);
                worker.terminate();
            }

            worker.onerror = (error) => {
                console.error('Worker Error:', error);
                reject(error);
                worker.terminate();
            }
        })
    }

    const { resolution } = surfaceData.props;
    const scaleFactor = 1 / resolution;
    
    const cellSize = Vec3.create(surfaceData.maxRadius, surfaceData.maxRadius, surfaceData.maxRadius);
    Vec3.scale(cellSize, cellSize, 2);
    const lookup3d = GridLookup3D(surfaceData.positions, surfaceData.boundary, cellSize);
    if (surfaceData.box === null) surfaceData.box = lookup3d.boundary.box;

    const pad = surfaceData.maxRadius + resolution;
    const expandedBox = Box3D.expand(Box3D(), surfaceData.box, Vec3.create(pad, pad, pad));
    const scaledBox = Box3D.scale(Box3D(), expandedBox, scaleFactor);
    const dim = Box3D.size(Vec3(), scaledBox);
    Vec3.ceil(dim, dim);

    const [dimX, dimY, dimZ] = dim;
    const iu = dimZ, iv = dimY, iuv = iu * iv;

    const space = Tensor.Space(dim, [0, 1, 2], Float32Array);
    let data = space.create();
    let idData = space.create();

    await runTunnelSurfaceComputation();

    let field = Tensor.create(space, data);
    let idField = Tensor.create(space, idData);

    const transform = Mat4.identity();
    Mat4.fromScaling(transform, Vec3.create(resolution, resolution, resolution));
    Mat4.setTranslation(transform, expandedBox.min);
    return { field, idField, transform, resolution, maxRadius: surfaceData.maxRadius };
}

export function getCenterLine(data: Profile[]): Vec3[] {
    const centerLine: Vec3[] = [];

    for (const p of data) {
        const v = Vec3.create(p.X, p.Y, p.Z);
        centerLine.push(v);
    }

    return centerLine
}

export function extendCenterLine(
    centerLine: Vec3[],
    radiusStart: number,
    radiusEnd: number
): Vec3[] {
    if (centerLine.length < 2) {
        throw new Error("Center line must have at least two points.");
    }

    const v = Vec3();

    // Direction vectors
    const beginDirection = Vec3.normalize(Vec3(), Vec3.sub(Vec3(), centerLine[0], centerLine[1]));
    const endDirection = Vec3.normalize(Vec3(), Vec3.sub(Vec3(), centerLine[centerLine.length - 1], centerLine[centerLine.length - 2]));

    // Extend points
    const newStart = Vec3.add(Vec3(), centerLine[0], Vec3.scale(Vec3(), beginDirection, radiusStart));
    const newEnd = Vec3.add(Vec3(), centerLine[centerLine.length - 1], Vec3.scale(Vec3(), endDirection, radiusEnd));

    // Create new center line
    return [newStart, ...centerLine, newEnd];
}

export type CenterLinePoint = {
    point: Vec3,
    dist: number,
    layerId: number
}

export function assignLayers(centerLine: Profile[], layers: LayersInfo[]): Map<Vec3, { layer: LayersInfo, nextLayer: LayersInfo | undefined, distance: number }> {
    let currentLayerId = 0;
    let currentLayer = layers[currentLayerId];
    // let currentPoint = Vec3.create(data[0].X, data[0].Y, data[0].Z);
    let currentDist = 0;
    let mappedPoints: Map<Vec3, { layer: LayersInfo, nextLayer: LayersInfo | undefined, distance: number }> = new Map();

    for (const point of centerLine) {
        const distance = point.Distance;
        if (distance > currentLayer.LayerGeometry.EndDistance) {
            currentLayerId = currentLayerId + 1 < layers.length ? currentLayerId + 1 : currentLayerId;
            currentLayer = layers[currentLayerId];
        }
        mappedPoints.set(Vec3.create(point.X, point.Y, point.Z), {
            layer: currentLayer,
            nextLayer: currentLayerId + 1 < layers.length ? layers[currentLayerId + 1] : undefined,
            distance
        })

    }
    return mappedPoints;
}

export function assignLayersToPoints(
    centerLine: Profile[],
    layers: LayersInfo[]
): { mappedPoints: Map<Vec3, number>; kdTree: KDTree } {
    const start = performance.now();
    let currentLayerId = 0;
    let currentLayer = layers[currentLayerId];
    let mappedPoints: Map<Vec3, number> = new Map();
    let pointArray: { point: Vec3; index: number }[] = [];

    for (const point of centerLine) {
        const distance = point.Distance;
        if (distance > currentLayer.LayerGeometry.EndDistance) {
            currentLayerId = currentLayerId + 1 < layers.length ? currentLayerId + 1 : currentLayerId;
            currentLayer = layers[currentLayerId];
        }
        const vec = Vec3.create(point.X, point.Y, point.Z);
        mappedPoints.set(vec, currentLayerId);
        pointArray.push({ point: vec, index: currentLayerId });
    }

    // Build k-d tree
    const kdTree = new KDTree(pointArray);

    const end = performance.now();
    console.log('assignLayersToPoints: ', end - start, 'ms');

    return { mappedPoints, kdTree };
}

