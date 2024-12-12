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
import { LayersInfo } from '../../../DataInterface';
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
    const builder = MeshBuilder.createState(8256, 8256, options.prev?.geometry);
    // MeshBuilder.addMesh(builder, Mat4.identity(), mesh);
    // const flip_matrix_x = [
    //     [-1, 0, 0, 0],
    //     [0, 1, 0, 0],
    //     [0, 0, 1, 0],
    //     [0, 0, 0, 1]
    // ];
    // const t = Mat4.ofRows(flip_matrix_x);
    // // Mesh.transform(mesh, t);
    // MeshBuilder.addMesh(builder, t, mesh);

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

// function interpolateTunnel(profile: Profile[], sampleRate: number) {
//     const interpolatedProfiles: Profile[] = [];
//     if (profile.length < 4) return profile; // Ensure enough points for interpolation

//     interpolatedProfiles.push(profile[0]);

//     let lastPoint = profileToVec3(profile[0]);
//     let currentDistance = 0;
//     const pointInterval = 1 / sampleRate;

//     for (let i = 1; i < profile.length - 2; i++) {
//         const P0 = profile[i - 1];
//         const P1 = profile[i];
//         const P2 = profile[i + 1];
//         const P3 = profile[i + 2];

//         for (let t = 0; t <= 1; t += 0.05) {
//             const interpolatedX = spline(P0.X, P1.X, P2.X, P3.X, t, 0.5);
//             const interpolatedY = spline(P0.Y, P1.Y, P2.Y, P3.Y, t, 0.5);
//             const interpolatedZ = spline(P0.Z, P1.Z, P2.Z, P3.Z, t, 0.5);
//             const interpolatedPoint = Vec3.create(interpolatedX, interpolatedY, interpolatedZ);

//             const distanceToAdd = Vec3.distance(lastPoint, interpolatedPoint);
//             currentDistance += distanceToAdd;

//             // Ensure the next point is spaced adequately based on radius
//             const interpolatedRadius = spline(P0.Radius, P1.Radius, P2.Radius, P3.Radius, t, 0.5);
//             if (currentDistance >= Math.max(pointInterval, interpolatedRadius * 2)) {
//                 interpolatedProfiles.push({
//                     X: interpolatedX,
//                     Y: interpolatedY,
//                     Z: interpolatedZ,
//                     Radius: interpolatedRadius,
//                     Charge: lerp(P1.Charge, P2.Charge, t),
//                     FreeRadius: spline(P0.FreeRadius, P1.FreeRadius, P2.FreeRadius, P3.FreeRadius, t, 0.5),
//                     T: lerp(P1.T, P2.T, t),
//                     Distance: lerp(P1.Distance, P2.Distance, t)
//                 });
//                 lastPoint = interpolatedPoint;
//                 currentDistance -= pointInterval;
//             }
//         }
//     }

//     // Ensure the last profile point is included
//     interpolatedProfiles.push(profile[profile.length - 1]);

//     return interpolatedProfiles;
// }


function convertToPositionData(profile: Profile[], probeRadius: number, layers: LayersInfo[]): Required<PositionData> {
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

// function convertToPositionData(profile: Profile[], probeRadius: number, layers: LayersInfo[]): Required<PositionData> {
//     let position = {} as PositionData;

//     const x: number[] = [];
//     const y: number[] = [];
//     const z: number[] = [];
//     const indices: Array<number> = [];
//     const radius: number[] = [];

//     let sphereCounter = 0;
//     for (const sphere of profile) {
//         const r = sphere.Radius + probeRadius;

//         // Add the main sphere
//         x.push(sphere.X);
//         y.push(sphere.Y);
//         z.push(sphere.Z);
//         indices.push(sphereCounter);
//         radius.push(r);

//         // Add additional spheres around the perimeter for small spheres
//         if (r < 1.0) { // Threshold for adding perimeter redundancy
//             const angleStep = Math.PI / 4; // 8 additional spheres around
//             for (let theta = 0; theta < 2 * Math.PI; theta += angleStep) {
//                 x.push(sphere.X + r * Math.cos(theta));
//                 y.push(sphere.Y + r * Math.sin(theta));
//                 z.push(sphere.Z);
//                 indices.push(++sphereCounter);
//                 radius.push(r);
//             }
//         }
//         sphereCounter++;
//     }

//     position = { x, y, z, indices: OrderedSet.ofSortedArray(indices), radius, id: indices };

//     return position as Required<PositionData>;
// }

function getLayerIndexes(profile: Profile[], layers: LayersInfo[]): Map<number, number> {
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

function normalToLine(out: Vec3, p: Vec3) {
    out[0] = out[1] = out[2] = 1.0;
    if (p[0] !== 0) {
        out[0] = (p[1] + p[2]) / -p[0];
    } else if (p[1] !== 0) {
        out[1] = (p[0] + p[2]) / -p[1];
    } else if (p[2] !== 0) {
        out[2] = (p[0] + p[1]) / -p[2];
    }
    return out;
}

function computeTunnelSurface(
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

type AnglesTables = { cosTable: Float32Array, sinTable: Float32Array }
function getAngleTables(probePositions: number): AnglesTables {
    let theta = 0.0;
    const step = 2 * Math.PI / probePositions;

    const cosTable = new Float32Array(probePositions);
    const sinTable = new Float32Array(probePositions);
    for (let i = 0; i < probePositions; i++) {
        cosTable[i] = Math.cos(theta);
        sinTable[i] = Math.sin(theta);
        theta += step;
    }
    return { cosTable, sinTable };
}

// From '../../../\mol-math\geometry\molecular-surface.ts'
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
    // Field generation method adapted from AstexViewer (Mike Hartshorn) by Fred Ludlow.
    // Other parts based heavily on NGL (Alexander Rose) EDT Surface class

    let lastClip = -1;

    /**
     * Is the point at x,y,z obscured by any of the atoms specifeid by indices in neighbours.
     * Ignore indices a and b (these are the relevant atoms in projectPoints/Torii)
     *
     * Cache the last clipped atom (as very often the same one in subsequent calls)
     *
     * `a` and `b` must be resolved indices
     */
    function obscured(x: number, y: number, z: number, a: number, b: number) {
        if (lastClip !== -1) {
            const ai = lastClip;
            if (ai !== a && ai !== b && singleAtomObscures(ai, x, y, z)) {
                return ai;
            } else {
                lastClip = -1;
            }
        }

        for (let j = 0, jl = neighbours.count; j < jl; ++j) {
            const ai = OrderedSet.getAt(indices, neighbours.indices[j]);
            if (ai !== a && ai !== b && singleAtomObscures(ai, x, y, z)) {
                lastClip = ai;
                return ai;
            }
        }

        return -1;
    }

    /**
     * `ai` must be a resolved index
     */
    function singleAtomObscures(ai: number, x: number, y: number, z: number) {
        const r = radius[ai];
        const dx = px[ai] - x;
        const dy = py[ai] - y;
        const dz = pz[ai] - z;
        const dSq = dx * dx + dy * dy + dz * dz;
        return dSq < (r * r);
    }

    /**
     * For each atom:
     *     Iterate over a subsection of the grid, for each point:
     *         If current value < 0.0, unvisited, set positive
     *
     *         In any case: Project this point onto surface of the atomic sphere
     *         If this projected point is not obscured by any other atom
     *             Calculate delta distance and set grid value to minimum of
     *             itself and delta
     */
    function projectPointsRange(begI: number, endI: number) {
        for (let i = begI; i < endI; ++i) {
            const j = OrderedSet.getAt(indices, i);
            const vx = px[j], vy = py[j], vz = pz[j];
            const rad = radius[j];
            const rSq = rad * rad;

            lookup3d.find(vx, vy, vz, rad);

            // Number of grid points, round this up...
            const ng = Math.ceil(rad * scaleFactor);

            // Center of the atom, mapped to grid points (take floor)
            const iax = Math.floor(scaleFactor * (vx - minX));
            const iay = Math.floor(scaleFactor * (vy - minY));
            const iaz = Math.floor(scaleFactor * (vz - minZ));

            // Extents of grid to consider for this atom
            const begX = Math.max(0, iax - ng);
            const begY = Math.max(0, iay - ng);
            const begZ = Math.max(0, iaz - ng);

            // Add two to these points:
            // - iax are floor'd values so this ensures coverage
            // - these are loop limits (exclusive)
            const endX = Math.min(dimX, iax + ng + 2);
            const endY = Math.min(dimY, iay + ng + 2);
            const endZ = Math.min(dimZ, iaz + ng + 2);

            for (let xi = begX; xi < endX; ++xi) {
                const dx = gridx[xi] - vx;
                const xIdx = xi * iuv;
                for (let yi = begY; yi < endY; ++yi) {
                    const dy = gridy[yi] - vy;
                    const dxySq = dx * dx + dy * dy;
                    const xyIdx = yi * iu + xIdx;
                    for (let zi = begZ; zi < endZ; ++zi) {
                        const dz = gridz[zi] - vz;
                        const dSq = dxySq + dz * dz;

                        if (dSq < rSq) {
                            const idx = zi + xyIdx;

                            // if unvisited, make positive
                            if (data[idx] < 0.0) data[idx] *= -1;

                            // Project on to the surface of the sphere
                            // sp is the projected point ( dx, dy, dz ) * ( ra / d )
                            const d = Math.sqrt(dSq);
                            const ap = rad / d;
                            const spx = dx * ap + vx;
                            const spy = dy * ap + vy;
                            const spz = dz * ap + vz;

                            if (obscured(spx, spy, spz, j, -1) === -1) {
                                const dd = rad - d;
                                if (dd < data[idx]) {
                                    data[idx] = dd;
                                    // const dist = calculateWalkableDistance(centerLine, Vec3.create(spx, spy, spz));
                                    // const dist2 = calculateProportionalDistance(surfaceData.data, {x: spx, y: spy, z: spz})
                                    // const dist3 = calculateProportionalDistanceWithExpandedCenterline(surfaceData.data, {x: spx, y: spy, z: spz})
                                    // const myLayerId = findProjectionOnPolyline(surfaceData.centerLineProcessed, surfaceData.layers, Vec3.create(spx, spy, spz))
                                    // const layerId = getLayerGroupId(dist3, surfaceData.layers);
                                    const g = surfaceData.layerIndexes.get(id[i]);
                                    idData[idx] = g ?? -1;
                                    // idData[idx] = layerId;
                                    // idData[idx] = myLayerId ?? -1;
                                    // const gi = getLayerIdCylinders(Vec3.create(spx, spy, spz), cylinders)
                                    // idData[idx] = gi;

                                    // const gi = projectPointToCurvedCenterLine(Vec3.create(spx, spy, spz), borderPoints)
                                    // idData[idx] = gi;

                                    const gii = findClosestPoint(Vec3.create(spx, spy, spz), mappedPoints)
                                    idData[idx] = gii ?? -1;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    async function projectPoints() {
        for (let i = 0; i < n; i += updateChunk) {
            projectPointsRange(i, Math.min(i + updateChunk, n));

            if (ctx.shouldUpdate) {
                await ctx.update({ message: 'projecting points', current: i, max: n });
            }
        }
    }

    // Vectors for Torus Projection
    const atob = Vec3();
    const mid = Vec3();
    const n1 = Vec3();
    const n2 = Vec3();
    /**
     * `a` and `b` must be resolved indices
     */
    function projectTorus(a: number, b: number) {
        const rA = radius[a];
        const rB = radius[b];
        const dx = atob[0] = px[b] - px[a];
        const dy = atob[1] = py[b] - py[a];
        const dz = atob[2] = pz[b] - pz[a];
        const dSq = dx * dx + dy * dy + dz * dz;

        // This check now redundant as already done in AVHash.withinRadii
        // if (dSq > ((rA + rB) * (rA + rB))) { return }

        const d = Math.sqrt(dSq);

        // Find angle between a->b vector and the circle
        // of their intersection by cosine rule
        const cosA = (rA * rA + d * d - rB * rB) / (2.0 * rA * d);

        // distance along a->b at intersection
        const dmp = rA * cosA;

        Vec3.normalize(atob, atob);

        // Create normal to line
        normalToLine(n1, atob);
        Vec3.normalize(n1, n1);

        // Cross together for second normal vector
        Vec3.cross(n2, atob, n1);
        Vec3.normalize(n2, n2);

        // r is radius of circle of intersection
        const rInt = Math.sqrt(rA * rA - dmp * dmp);

        Vec3.scale(n1, n1, rInt);
        Vec3.scale(n2, n2, rInt);
        Vec3.scale(atob, atob, dmp);

        mid[0] = atob[0] + px[a];
        mid[1] = atob[1] + py[a];
        mid[2] = atob[2] + pz[a];

        lastClip = -1;

        for (let i = 0; i < probePositions; ++i) {
            const cost = cosTable[i];
            const sint = sinTable[i];

            const px = mid[0] + cost * n1[0] + sint * n2[0];
            const py = mid[1] + cost * n1[1] + sint * n2[1];
            const pz = mid[2] + cost * n1[2] + sint * n2[2];

            if (obscured(px, py, pz, a, b) === -1) {
                const iax = Math.floor(scaleFactor * (px - minX));
                const iay = Math.floor(scaleFactor * (py - minY));
                const iaz = Math.floor(scaleFactor * (pz - minZ));

                const begX = Math.max(0, iax - ngTorus);
                const begY = Math.max(0, iay - ngTorus);
                const begZ = Math.max(0, iaz - ngTorus);

                const endX = Math.min(dimX, iax + ngTorus + 2);
                const endY = Math.min(dimY, iay + ngTorus + 2);
                const endZ = Math.min(dimZ, iaz + ngTorus + 2);

                for (let xi = begX; xi < endX; ++xi) {
                    const dx = px - gridx[xi];
                    const xIdx = xi * iuv;

                    for (let yi = begY; yi < endY; ++yi) {
                        const dy = py - gridy[yi];
                        const dxySq = dx * dx + dy * dy;
                        const xyIdx = yi * iu + xIdx;

                        for (let zi = begZ; zi < endZ; ++zi) {
                            const dz = pz - gridz[zi];
                            const dSq = dxySq + dz * dz;

                            const idx = zi + xyIdx;
                            const current = data[idx];

                            if (current > 0.0 && dSq < (current * current)) {
                                data[idx] = Math.sqrt(dSq);
                                // Is this grid point closer to a or b?
                                // Take dot product of atob and gridpoint->p (dx, dy, dz)
                                const dp = dx * atob[0] + dy * atob[1] + dz * atob[2];

                                // const dist = calculateWalkableDistance(centerLine, Vec3.create(px, py, pz));
                                // const dist2 = calculateProportionalDistance(surfaceData.data, {x: px, y: py, z: pz})
                                // const dist3 = calculateProportionalDistanceWithExpandedCenterline(surfaceData.data, {x: px, y: py, z: pz})
                                // const layerId = getLayerGroupId(dist3, surfaceData.layers);
                                // const myLayerId = findProjectionOnPolyline(surfaceData.centerLineProcessed, surfaceData.layers, Vec3.create(px, py, pz))
                                const g = surfaceData.layerIndexes.get(id[OrderedSet.indexOf(indices, dp < 0.0 ? b : a)]);
                                idData[idx] = g ?? -1;

                                // const gi = projectPointToCurvedCenterLine(Vec3.create(px, py, pz), borderPoints)
                                // idData[idx] = gi;

                                const gii = findClosestPoint(Vec3.create(px, py, pz), mappedPoints)
                                idData[idx] = gii ?? -1;
                                // idData[idx] = layerId;
                                // idData[idx] = myLayerId ?? -1;
                                // const gi = getLayerIdCylinders(Vec3.create(px, py, pz), cylinders)
                                // idData[idx] = gi;
                            }
                        }
                    }
                }
            }
        }
    }

    function projectToriiRange(begI: number, endI: number) {
        for (let i = begI; i < endI; ++i) {
            const k = OrderedSet.getAt(indices, i);
            lookup3d.find(px[k], py[k], pz[k], radius[k]);
            for (let j = 0, jl = neighbours.count; j < jl; ++j) {
                const l = OrderedSet.getAt(indices, neighbours.indices[j]);
                if (k < l) projectTorus(k, l);
            }
        }
    }

    async function projectTorii() {
        for (let i = 0; i < n; i += updateChunk) {
            projectToriiRange(i, Math.min(i + updateChunk, n));

            if (ctx.shouldUpdate) {
                await ctx.update({ message: 'projecting torii', current: i, max: n });
            }
        }
    }

    // console.time('MolecularSurface')
    // console.time('MolecularSurface createState')
    const { resolution, probeRadius, probePositions } = surfaceData.props;
    const scaleFactor = 1 / resolution;
    const ngTorus = Math.max(5, 2 + Math.floor(probeRadius * scaleFactor));

    const mappedPoints = assignLayersToPoints(surfaceData.data, surfaceData.layers);

    const centerLine = surfaceData.centerLine;
    const { borderPoints, maxRadius } = getBorderPoints(surfaceData.data, surfaceData.layers);
    const cylinders = precomputeCylinders(borderPoints, maxRadius + 5);

    const cellSize = Vec3.create(surfaceData.maxRadius, surfaceData.maxRadius, surfaceData.maxRadius);
    Vec3.scale(cellSize, cellSize, 2);
    const lookup3d = GridLookup3D(surfaceData.positions, surfaceData.boundary, cellSize);
    const neighbours = lookup3d.result;
    if (surfaceData.box === null) surfaceData.box = lookup3d.boundary.box;

    const { indices, x: px, y: py, z: pz, id, radius } = surfaceData.positions;
    const n = OrderedSet.size(indices);

    const pad = surfaceData.maxRadius + resolution;
    const expandedBox = Box3D.expand(Box3D(), surfaceData.box, Vec3.create(pad, pad, pad));
    const [minX, minY, minZ] = expandedBox.min;
    const scaledBox = Box3D.scale(Box3D(), expandedBox, scaleFactor);
    const dim = Box3D.size(Vec3(), scaledBox);
    Vec3.ceil(dim, dim);

    const [dimX, dimY, dimZ] = dim;
    const iu = dimZ, iv = dimY, iuv = iu * iv;

    const { cosTable, sinTable } = getAngleTables(probePositions);

    const space = Tensor.Space(dim, [0, 1, 2], Float32Array);
    const data = space.create();
    const idData = space.create();

    data.fill(-1001.0);
    idData.fill(-1);

    const gridx = fillGridDim(dimX, minX, resolution);
    const gridy = fillGridDim(dimY, minY, resolution);
    const gridz = fillGridDim(dimZ, minZ, resolution);

    const updateChunk = Math.ceil(100000 / ((Math.pow(Math.pow(surfaceData.maxRadius, 3), 3) * scaleFactor)));
    // console.timeEnd('MolecularSurface createState')

    // console.time('MolecularSurface projectPoints')
    await projectPoints();
    // console.timeEnd('MolecularSurface projectPoints')

    // console.time('MolecularSurface projectTorii')
    await projectTorii();
    // console.timeEnd('MolecularSurface projectTorii')
    // console.timeEnd('MolecularSurface')

    const field = Tensor.create(space, data);
    const idField = Tensor.create(space, idData);

    const transform = Mat4.identity();
    Mat4.fromScaling(transform, Vec3.create(resolution, resolution, resolution));
    Mat4.setTranslation(transform, expandedBox.min);
    // console.log({ field, idField, transform, updateChunk })
    return { field, idField, transform, resolution, maxRadius: surfaceData.maxRadius };
}

// function interpolateLayerId(grid, position, resolution) {
//     const neighbors = getNeighbors(position.x, position.y, position.z, grid.dimX, grid.dimY, grid.dimZ);
//     return averageLayerIds(neighbors, grid.layerData, resolution);
// }

// function averageLayerIds(neighbors, layerData, resolution) {
//     let sum = 0;
//     let weightSum = 0;
//     for (const neighbor of neighbors) {
//         const layerId = layerData[neighbor];
//         if (layerId >= 0) {
//             const weight = 1 / (distance(neighbor, position) + resolution);
//             sum += layerId * weight;
//             weightSum += weight;
//         }
//     }
//     return weightSum > 0 ? Math.round(sum / weightSum) : -1;
// }

// function propagateLayerInfluence(grid, idData, resolution) {
//     for (let x = 0; x < grid.dimX; x++) {
//         for (let y = 0; y < grid.dimY; y++) {
//             for (let z = 0; z < grid.dimZ; z++) {
//                 const idx = x * grid.iuv + y * grid.iu + z;
//                 if (idData[idx] === -1) {
//                     const neighbors = getNeighbors(x, y, z, grid.dimX, grid.dimY, grid.dimZ);
//                     idData[idx] = interpolateFromNeighbors(neighbors, idData);
//                 }
//             }
//         }
//     }
// }

// function interpolateFromNeighbors(neighbors, idData) {
//     const neighborIds = neighbors.map(n => idData[n]).filter(id => id !== -1);
//     if (neighborIds.length === 0) return -1;

//     // Majority voting or simple averaging
//     return neighborIds.reduce((a, b) => a + b, 0) / neighborIds.length;
// }

// function getNeighbors(x, y, z, dimX, dimY, dimZ) {
//     const neighbors = [];
//     for (let dx = -1; dx <= 1; dx++) {
//         for (let dy = -1; dy <= 1; dy++) {
//             for (let dz = -1; dz <= 1; dz++) {
//                 if (dx === 0 && dy === 0 && dz === 0) continue;

//                 const nx = x + dx, ny = y + dy, nz = z + dz;
//                 if (nx >= 0 && nx < dimX && ny >= 0 && ny < dimY && nz >= 0 && nz < dimZ) {
//                     neighbors.push(nx * dimY * dimZ + ny * dimZ + nz);
//                 }
//             }
//         }
//     }
//     return neighbors;
// }

function getCenterLine(data: Profile[]): Vec3[] {
    const centerLine: Vec3[] = [];

    for (const p of data) {
        const v = Vec3.create(p.X, p.Y, p.Z);
        centerLine.push(v);
    }

    return centerLine
}

// function projectPointOntoCenterLine(centerLine: Vec3[], point: Vec3): number {
//     let closestDistance = Infinity;
//     let projectedPosition = 0;

//     for (let i = 0; i < centerLine.length - 1; i++) {
//         const segmentStart = centerLine[i];
//         const segmentEnd = centerLine[i + 1];

//         const projection = perpendicularProjection(segmentStart, segmentEnd, point);
//         const distance = Vec3.distance(point, projection);

//         if (distance < closestDistance) {
//             closestDistance = distance;
//             projectedPosition = i + projection[3]; // Index + normalized distance
//         }
//     }

//     return projectedPosition;
// }

// function perpendicularProjection(p1: Vec3, p2: Vec3, point: Vec3): Vec3 {
//     const lineVec = Vec3.sub(Vec3(), p2, p1);
//     const pointVec = Vec3.sub(Vec3(), point, p1);
//     const t = Math.max(0, Math.min(1, Vec3.dot(pointVec, lineVec) / Vec3.dot(lineVec, lineVec)));
//     return Vec3.scaleAndAdd(Vec3(), p1, lineVec, t);
// }

// export function calculateWalkableDistance(centerLine: Vec3[], projPoint: Vec3): number {
//     // Precompute cumulative distances along the center line
//     const cumulativeDistances: number[] = [0];
//     for (let i = 1; i < centerLine.length; i++) {
//         const dist = Vec3.distance(centerLine[i], centerLine[i - 1]);
//         cumulativeDistances.push(cumulativeDistances[i - 1] + dist);
//     }

//     // Find the segment where the projected point lies
//     let segmentIndex = -1;
//     let minDist = Infinity;
//     let projOnSegment: Vec3 | null = null;

//     for (let i = 0; i < centerLine.length - 1; i++) {
//         const segStart = centerLine[i];
//         const segEnd = centerLine[i + 1];
//         const proj = projectPointOntoSegment(projPoint, segStart, segEnd);
//         const distToProj = Vec3.distance(projPoint, proj);

//         if (distToProj < minDist) {
//             minDist = distToProj;
//             segmentIndex = i;
//             projOnSegment = proj;
//         }
//     }

//     if (projOnSegment === null) {
//         throw new Error("Projection failed");
//     }

//     // Calculate distance along the segment
//     const segStart = centerLine[segmentIndex];
//     const distanceAlongSegment = Vec3.distance(segStart, projOnSegment);

//     // Add cumulative distance up to the segment
//     return cumulativeDistances[segmentIndex] + distanceAlongSegment;
// }

function calculateWalkableDistance(centerLine: Vec3[], point: Vec3): number {
    let minDistance = Infinity;
    let projectedDistance = 0;
    let foundProjection = false;

    for (let i = 0; i < centerLine.length - 1; i++) {
        const segmentStart = centerLine[i];
        const segmentEnd = centerLine[i + 1];

        // Calculate the projected point on the line segment
        const projection = projectPointOntoSegment(segmentStart, segmentEnd, point);

        if (projection.isOnSegment) {
            // Calculate walkable distance up to the projection
            let walkableDistance = 0;
            for (let j = 0; j < i; j++) {
                walkableDistance += Vec3.distance(centerLine[j], centerLine[j + 1]);
            }
            walkableDistance += Vec3.distance(segmentStart, projection.point);
            projectedDistance = walkableDistance;
            foundProjection = true;
            break;
        } else {
            // Point is off the center line; find the closest endpoint
            const distanceToStart = Vec3.distance(segmentStart, point);
            const distanceToEnd = Vec3.distance(segmentEnd, point);

            if (distanceToStart < minDistance) {
                minDistance = distanceToStart;
                projectedDistance = 0; // Closest to start
            }
            if (distanceToEnd < minDistance) {
                minDistance = distanceToEnd;
                projectedDistance = centerLine.reduce((sum, _, k) => {
                    if (k < centerLine.length - 1) {
                        return sum + Vec3.distance(centerLine[k], centerLine[k + 1]);
                    }
                    return sum;
                }, 0); // Closest to end
            }
        }
    }

    return projectedDistance;
}

type ProjectionResult = {
    point: Vec3;       // The projected point on the infinite line
    isOnSegment: boolean; // Whether the projected point is on the segment
};

function projectPointOntoSegment(start: Vec3, end: Vec3, point: Vec3): ProjectionResult {
    const segmentVector = Vec3.sub(Vec3(), end, start);
    const pointVector = Vec3.sub(Vec3(), point, start);
    const segmentLengthSquared = Vec3.dot(segmentVector, segmentVector);

    // Handle degenerate case where start and end are the same point
    if (segmentLengthSquared === 0) {
        return {
            point: start, // The start and end are the same, return this point
            isOnSegment: false
        };
    }

    // Project pointVector onto segmentVector to find projection scalar
    const projectionScalar = Vec3.dot(pointVector, segmentVector) / segmentLengthSquared;

    // Compute the projected point on the infinite line
    const projectedPoint = Vec3.add(Vec3(),
        start,
        Vec3.scale(Vec3(), segmentVector, projectionScalar)
    );

    // Check if the projection lies within the segment
    const isOnSegment = projectionScalar >= 0 && projectionScalar <= 1;

    return {
        point: projectedPoint,
        isOnSegment
    };
}

// function projectPointOntoSegment(point: Vec3, segStart: Vec3, segEnd: Vec3): Vec3 {
//     const segVec = Vec3.sub(Vec3(), segEnd, segStart);
//     const pointVec = Vec3.sub(Vec3(), point, segStart);
//     const segLengthSq = Vec3.squaredMagnitude(segVec);
//     const t = Math.max(0, Math.min(1, Vec3.dot(segVec, pointVec) / segLengthSq)); // Clamp t to [0, 1]
//     return Vec3.add(Vec3(), segStart, Vec3.scale(Vec3(), segVec, t));
// }

function calculateProportionalDistance(
    profile: Profile[],
    surfacePoint: { x: number, y: number, z: number }
): number {
    // Helper function to compute Euclidean distance
    function distance(a: { x: number, y: number, z: number }, b: { x: number, y: number, z: number }): number {
        return Math.sqrt(
            Math.pow(a.x - b.x, 2) +
            Math.pow(a.y - b.y, 2) +
            Math.pow(a.z - b.z, 2)
        );
    }

    // Helper function to project a point onto a line segment
    function projectPointOntoSegment(
        point: { x: number, y: number, z: number },
        a: { x: number, y: number, z: number },
        b: { x: number, y: number, z: number }
    ): { projection: { x: number, y: number, z: number }, t: number } {
        const ap = { x: point.x - a.x, y: point.y - a.y, z: point.z - a.z };
        const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
        const abLengthSq = ab.x * ab.x + ab.y * ab.y + ab.z * ab.z;
        const t = Math.max(0, Math.min(1, (ap.x * ab.x + ap.y * ab.y + ap.z * ab.z) / abLengthSq));
        return {
            projection: {
                x: a.x + t * ab.x,
                y: a.y + t * ab.y,
                z: a.z + t * ab.z
            },
            t
        };
    }

    // Convert profile into array of points
    const centers = profile.map(p => ({ x: p.X, y: p.Y, z: p.Z }));

    // Calculate total length of the centerline and cumulative distances
    const cumulativeDistances: number[] = [0];
    let totalLength = 0;
    for (let i = 1; i < centers.length; i++) {
        const segmentLength = distance(centers[i - 1], centers[i]);
        totalLength += segmentLength;
        cumulativeDistances.push(totalLength);
    }

    // Find the closest segment to the surface point
    let closestSegmentIndex = -1;
    let closestDistance = Number.MAX_VALUE;
    let projectionPoint = { x: 0, y: 0, z: 0 };
    let segmentT = 0;

    for (let i = 0; i < centers.length - 1; i++) {
        const { projection, t } = projectPointOntoSegment(surfacePoint, centers[i], centers[i + 1]);
        const projDistance = distance(surfacePoint, projection);
        if (projDistance < closestDistance) {
            closestDistance = projDistance;
            closestSegmentIndex = i;
            projectionPoint = projection;
            segmentT = t;
        }
    }

    // Calculate walkable distance along the centerline to the projection point
    const segmentStartDistance = cumulativeDistances[closestSegmentIndex];
    const segmentLength = cumulativeDistances[closestSegmentIndex + 1] - segmentStartDistance;
    const walkableDistance = segmentStartDistance + segmentT * segmentLength;

    // Return proportional distance
    return walkableDistance / totalLength;
}

function calculateProportionalDistanceWithExpandedCenterline(
    profile: Profile[],
    surfacePoint: { x: number, y: number, z: number }
): number {
    // Helper function to compute Euclidean distance
    function distance(a: { x: number, y: number, z: number }, b: { x: number, y: number, z: number }): number {
        return Math.sqrt(
            Math.pow(a.x - b.x, 2) +
            Math.pow(a.y - b.y, 2) +
            Math.pow(a.z - b.z, 2)
        );
    }

    // Helper function to project a point onto a line segment
    function projectPointOntoSegment(
        point: { x: number, y: number, z: number },
        a: { x: number, y: number, z: number },
        b: { x: number, y: number, z: number }
    ): { projection: { x: number, y: number, z: number }, t: number } {
        const ap = { x: point.x - a.x, y: point.y - a.y, z: point.z - a.z };
        const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
        const abLengthSq = ab.x * ab.x + ab.y * ab.y + ab.z * ab.z;
        const t = Math.max(0, Math.min(1, (ap.x * ab.x + ap.y * ab.y + ap.z * ab.z) / abLengthSq));
        return {
            projection: {
                x: a.x + t * ab.x,
                y: a.y + t * ab.y,
                z: a.z + t * ab.z
            },
            t
        };
    }

    // Expand the centerline to include the radii of the first and last spheres
    const centers = profile.map(p => ({ x: p.X, y: p.Y, z: p.Z }));
    const first = centers[0];
    const second = centers[1];
    const last = centers[centers.length - 1];
    const secondLast = centers[centers.length - 2];

    // Add the starting and ending points
    const startOffset = {
        x: first.x - (second.x - first.x) * (profile[0].Radius / distance(first, second)),
        y: first.y - (second.y - first.y) * (profile[0].Radius / distance(first, second)),
        z: first.z - (second.z - first.z) * (profile[0].Radius / distance(first, second))
    };

    const endOffset = {
        x: last.x + (last.x - secondLast.x) * (profile[profile.length - 1].Radius / distance(last, secondLast)),
        y: last.y + (last.y - secondLast.y) * (profile[profile.length - 1].Radius / distance(last, secondLast)),
        z: last.z + (last.z - secondLast.z) * (profile[profile.length - 1].Radius / distance(last, secondLast))
    };

    centers.unshift(startOffset);
    centers.push(endOffset);

    // Calculate total length of the centerline and cumulative distances
    const cumulativeDistances: number[] = [0];
    let totalLength = 0;
    for (let i = 1; i < centers.length; i++) {
        const segmentLength = distance(centers[i - 1], centers[i]);
        totalLength += segmentLength;
        cumulativeDistances.push(totalLength);
    }

    // Find the closest segment to the surface point
    let closestSegmentIndex = -1;
    let closestDistance = Number.MAX_VALUE;
    let projectionPoint = { x: 0, y: 0, z: 0 };
    let segmentT = 0;

    for (let i = 0; i < centers.length - 1; i++) {
        const { projection, t } = projectPointOntoSegment(surfacePoint, centers[i], centers[i + 1]);
        const projDistance = distance(surfacePoint, projection);
        if (projDistance < closestDistance) {
            closestDistance = projDistance;
            closestSegmentIndex = i;
            projectionPoint = projection;
            segmentT = t;
        }
    }

    // Calculate walkable distance along the centerline to the projection point
    const segmentStartDistance = cumulativeDistances[closestSegmentIndex];
    const segmentLength = cumulativeDistances[closestSegmentIndex + 1] - segmentStartDistance;
    const walkableDistance = segmentStartDistance + segmentT * segmentLength;

    // Return proportional distance
    return walkableDistance / totalLength;
}

/****************************************************************************************************************/
function extendCenterLine(
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


function findProjectionOnPolyline(
    centerLine: CenterLinePoint[],
    layers: LayersInfo[],
    P: Vec3
): number | null {
    for (let i = 0; i < centerLine.length - 1; i++) {
        const v = Vec3();
        const A = centerLine[i].point;
        const B = centerLine[i + 1].point;
        const AB = Vec3.sub(Vec3(), B, A);
        const AP = Vec3.sub(Vec3(), P, A);

        const AB_lengthSq = Vec3.dot(AB, AB);

        if (AB_lengthSq === 0) {
            continue;
        }

        // const t = Vec3.dot(AP, AB) / Vec3.squaredMagnitude(AB);
        const t = Vec3.dot(AP, AB) / AB_lengthSq;

        if (t >= 0 && t <= 1) {
            // Projection lies on the segment
            const projection = Vec3.add(Vec3(), A, Vec3.scale(v, AB, t));
            const dist = Vec3.distance(A, projection);
            if (dist + centerLine[i].dist >= layers[centerLine[i].layerId].LayerGeometry.EndDistance) {
                return centerLine[i + 1].layerId;
            }
            return centerLine[i].layerId;
            // return { segmentIndex: i, projection };
        }
    }
    return null; // No valid projection found
}

type CenterLinePoint = {
    point: Vec3,
    dist: number,
    layerId: number
}

function extendData(data: Profile[]): [Vec3, Vec3] | [undefined, undefined] {
    if (data.length < 2) {
        console.log("Center line must have at least two points.");
        return [undefined, undefined];
    }

    const v = Vec3();

    // Direction vectors
    const beginDirection = Vec3.normalize(Vec3(), Vec3.sub(Vec3(), Vec3.create(data[0].X, data[0].Y, data[0].Z), Vec3.create(data[1].X, data[1].Y, data[1].Z)));

    const last = data[data.length - 1];
    const beforeLast = data[data.length - 2];
    const endDirection = Vec3.normalize(Vec3(), Vec3.sub(Vec3(), Vec3.create(last.X, last.Y, last.Z), Vec3.create(beforeLast.X, beforeLast.Y, beforeLast.Z)));

    // Extend points
    const newStart = Vec3.add(Vec3(), Vec3.create(data[0].X, data[0].Y, data[0].Z), Vec3.scale(Vec3(), beginDirection, data[0].Radius));
    const newEnd = Vec3.add(Vec3(), Vec3.create(last.X, last.Y, last.Z), Vec3.scale(Vec3(), endDirection, last.Radius));

    // Create new center line
    return [newStart, newEnd];
}

function processCenterLine(data: Profile[], layers: LayersInfo[]): CenterLinePoint[] {
    let currentLayerIdx = 0;
    let currentLayer = layers[currentLayerIdx]
    let currentCenter: Vec3 = Vec3.create(data[0].X, data[0].Y, data[0].Z);
    const centerLine: CenterLinePoint[] = [];
    let currentDist = 0;
    const length = layers[layers.length - 1].LayerGeometry.EndDistance;

    const [beg, end] = extendData(data);

    if (beg) {
        currentCenter = beg;
        currentDist = -Vec3.distance(beg, Vec3.create(data[0].X, data[0].Y, data[0].Z))
        centerLine.push({ point: currentCenter, dist: currentDist, layerId: currentLayerIdx })
    }

    for (const d of data) {
        const v = Vec3.create(d.X, d.Y, d.Z);
        currentDist += Vec3.distance(currentCenter, v);
        const dist = currentDist;
        if (d.T === 1) {
            currentLayerIdx = layers.length - 1;
            currentLayer = layers[currentLayerIdx];
        } else if (dist >= currentLayer.LayerGeometry.EndDistance) {
            currentLayerIdx += 1;
            currentLayer = layers[currentLayerIdx];
        }
        currentCenter = v;
        centerLine.push({ point: v, dist: currentDist, layerId: currentLayerIdx });
    }

    if (end) {
        currentDist = Vec3.distance(currentCenter, end)
        currentCenter = end;
        centerLine.push({ point: end, dist: currentDist, layerId: layers.length - 1 })
    }

    return centerLine;
}


/*************************************************************************************************************************/

interface Cylinder {
    A: Vec3;
    B: Vec3;
    axis: Vec3;       // Normalized vector from A to B
    length: number;      // Distance between A and B
    radius: number;      // Radius of the cylinder
    dividingPlane?: {    // Optional dividing plane
        normal: Vec3;
        d: number;
    };
}

function computeDividingPlane(
    A: Vec3,
    B: Vec3,
    nextA: Vec3 | null,
    nextB: Vec3 | null
): { normal: Vec3; d: number } | null {
    if (!nextA || !nextB) return null; // No dividing plane at edges

    const AB = Vec3.normalize(Vec3(), Vec3.sub(Vec3(), B, A));
    const BC = Vec3.normalize(Vec3(), Vec3.sub(Vec3(), nextB, nextA));

    // Compute bisector of AB and BC
    const bisector = Vec3.add(Vec3(), AB, BC);

    // Normal of dividing plane is orthogonal to the bisector
    const normal = Vec3.normalize(Vec3(), bisector);

    // Plane equation: normal.x * x + normal.y * y + normal.z * z + d = 0
    const d = -Vec3.dot(normal, B)// Plane passes through point B; -normal.dot(B); 

    return { normal, d };
}

function precomputeCylinders(borderPoints: Vec3[], radius: number): Cylinder[] {
    const cylinders: Cylinder[] = [];

    for (let i = 0; i < borderPoints.length - 1; i++) {
        const A = borderPoints[i];
        const B = borderPoints[i + 1];

        const AB = Vec3.sub(Vec3(), B, A);
        // const length = Vec3.distance(A, B);
        const length = Vec3.magnitude(AB);
        const axis = Vec3.normalize(Vec3(), AB);

        let dividingPlane = undefined;
        if (i < borderPoints.length - 2) {
            dividingPlane = computeDividingPlane(
                A,
                B,
                i > 0 ? borderPoints[i - 1] : null,
                borderPoints[i + 2]
            );
            if (dividingPlane === null) dividingPlane = undefined;
        }

        cylinders.push({ A, B, axis, length, radius, dividingPlane });
    }

    return cylinders;
}

function isPointInPrecomputedCylinder(
    point: Vec3,
    cylinder: Cylinder
): boolean {
    const { A, B, axis, length, radius, dividingPlane } = cylinder;

    const AP = Vec3.sub(Vec3(), point, A); // Vector from A to the point
    const projectionLength = Vec3.dot(AP, axis); // Projection of AP onto AB

    // Check if point projection is within cylinder bounds
    if (projectionLength < 0 || projectionLength > length) {
        return false; // Outside the height of the cylinder
    }

    // Check if point is within cylinder radius
    const projectionPoint = Vec3.add(Vec3(), A, Vec3.scale(Vec3(), axis, projectionLength)); // Closest point on AB to "point"
    const distanceToAxis = Vec3.magnitude(Vec3.sub(Vec3(), point, projectionPoint));

    if (distanceToAxis > radius) {
        return false; // Outside the radius
    }

    // Check dividing plane, if applicable
    if (dividingPlane) {
        const planeDistance = Vec3.dot(dividingPlane.normal, point) + dividingPlane.d;
        if (planeDistance < 0) {
            return false; // Point is on the "wrong side" of the plane
        }
    }

    return true; // Point is inside the cylinder
}

function getBorderPoints(data: Profile[], layers: LayersInfo[]): { borderPoints: Vec3[], maxRadius: number } {
    const borderPoints: Vec3[] = [];
    let maxRadius = 0;
    if (layers.length === 0 || data.length === 0) return { borderPoints, maxRadius };

    let currentLayerId = 0;
    let currentLayer = layers[currentLayerId];
    let currentPoint = Vec3.create(data[0].X, data[0].Y, data[0].Z);
    let currentDist = 0;

    borderPoints.push(Vec3.create(data[0].X, data[0].Y, data[0].Z));

    for (const p of data) {
        if (p.Radius > maxRadius) {
            maxRadius = p.Radius;
        }
        // if (p.Distance + currentDist >= currentLayer.LayerGeometry.EndDistance)
        // if (p.Distance > currentLayer.LayerGeometry.EndDistance)
        if (p.Distance > currentLayer.LayerGeometry.EndDistance) {
            borderPoints.push(currentPoint);
            currentLayerId++;
            if (currentLayerId >= layers.length) break;
            currentLayer = currentLayerId < layers.length ? layers[currentLayerId] : currentLayer;
        }
        // currentDist += p.Distance;
        currentDist = p.Distance;
        currentPoint = Vec3.create(p.X, p.Y, p.Z);
    }

    return { borderPoints, maxRadius }
}

function getBorderData(data: Profile[], layers: LayersInfo[]): Profile[] {
    const borderData: Profile[] = [];
    let maxRadius = 0;
    if (layers.length === 0 || data.length === 0) return data;

    let currentLayerId = 0;
    let currentLayer = layers[currentLayerId];
    let currentSphere = data[0];
    let currentDist = 0;

    borderData.push(data[0]);

    for (const p of data) {
        if (p.Radius > maxRadius) {
            maxRadius = p.Radius;
        }
        // if (p.Distance + currentDist >= currentLayer.LayerGeometry.EndDistance)
        // if (p.Distance > currentLayer.LayerGeometry.EndDistance)
        if (p.Distance > currentLayer.LayerGeometry.EndDistance) {
            borderData.push(currentSphere);
            currentLayerId++;
            currentLayer = currentLayerId < layers.length ? layers[currentLayerId] : currentLayer;
        }
        // currentDist += p.Distance;
        currentDist = p.Distance;
        // currentSphere = p;
    }

    borderData.push(data[data.length - 1]);

    return borderData;
}

function getLayerIdCylinders(point: Vec3, cylinders: Cylinder[]) {
    for (let i = 0; i < cylinders.length; i++) {
        if (isPointInPrecomputedCylinder(point, cylinders[i])) {
            return i;
        }
    }
    return -1;
}


/**********************************************************************************************************************/

function projectPointToCurvedCenterLine(point: Vec3, centerLine: Vec3[]): number {
    let closestDistance = Infinity; // Track the minimum distance to the centerline
    let projectedDistance = 0; // Track the projection distance along the centerline

    let accumulatedDistance = 0; // Distance from the start of the centerline

    let layer = 0;

    for (let i = 0; i < centerLine.length - 1; i++) {
        const p1 = centerLine[i];
        const p2 = centerLine[i + 1];
        const segmentLength = Vec3.distance(p1, p2);

        // Parametrize the segment and project the point
        const p1_obj = Vec3.toObj(p1);
        const p2_obj = Vec3.toObj(p2);
        const point_obj = Vec3.toObj(point);
        const t = Math.max(
            0,
            Math.min(
                1,
                ((point_obj.x - p1_obj.x) * (p2_obj.x - p1_obj.x) +
                    (point_obj.y - p1_obj.y) * (p2_obj.y - p1_obj.y) +
                    (point_obj.z - p1_obj.z) * (p2_obj.z - p1_obj.z)) /
                Math.pow(segmentLength, 2)
            )
        );

        // Calculate the projected point on the segment
        const projection = {
            x: p1_obj.x + t * (p2_obj.x - p1_obj.x),
            y: p1_obj.y + t * (p2_obj.y - p1_obj.y),
            z: p1_obj.z + t * (p2_obj.z - p1_obj.z),
        };

        // Distance from the point to the projection
        const distToProjection = Vec3.distance(point, Vec3.fromObj(projection));

        // Update the closest projection if necessary
        if (distToProjection < closestDistance) {
            closestDistance = distToProjection;
            layer = i;
            if (layer === centerLine.length - 1) {
                layer--;
            }
            // Update the projected distance along the centerline
            projectedDistance = accumulatedDistance + t * segmentLength;
        }

        // Accumulate the distance for this segment
        accumulatedDistance += segmentLength;
    }

    return layer; // Return the total distance along the centerline
}

/**********************************************************************************************************************/

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

export function assignLayersToPoints(centerLine: Profile[], layers: LayersInfo[]): Map<Vec3, number> {
    let currentLayerId = 0;
    let currentLayer = layers[currentLayerId];
    // let currentPoint = Vec3.create(data[0].X, data[0].Y, data[0].Z);
    let currentDist = 0;
    let mappedPoints: Map<Vec3, number> = new Map();

    for (const point of centerLine) {
        const distance = point.Distance;
        if (distance > currentLayer.LayerGeometry.EndDistance) {
            currentLayerId = currentLayerId + 1 < layers.length ? currentLayerId + 1 : currentLayerId;
            currentLayer = layers[currentLayerId];
        }
        mappedPoints.set(Vec3.create(point.X, point.Y, point.Z), currentLayerId)

    }
    return mappedPoints;
}

export function createTree(centerLine: Profile[]) {
    const points: [number, number, number][] = [];
    for (const point of centerLine) {
        points.push([point.X, point.Y, point.Z]);
    }
    const kdTree = new KDTree(points);
    return kdTree;
}

function findClosestPoint(target: Vec3, points: Map<Vec3, number>) {
    // if (points.keys().length === 0) {
    //   throw new Error("The points array cannot be empty.");
    // }
    const pointArray = Array.from(points.keys());
    let closestPoint = pointArray[0];
    let minDistance = Vec3.distance(target, closestPoint);

    for (const point of Array.from(points.keys())) {
        const distance = Vec3.distance(target, point);
        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
        }
    }

    return points.get(closestPoint);
}

