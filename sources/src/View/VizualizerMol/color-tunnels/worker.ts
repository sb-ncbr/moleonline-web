import { OrderedSet } from "molstar/lib/mol-data/int";
import { Box3D, fillGridDim, GridLookup3D, Result } from "molstar/lib/mol-math/geometry";
import { Mat4, Tensor, Vec3 } from "molstar/lib/mol-math/linear-algebra";
import { KDTree } from "./kd-tree";
import { RuntimeContext } from "molstar/lib/mol-task";
import { SurfaceData } from "./algorithm";
import { LayersInfo, Profile } from "../../../DataInterface";

type CalcTunnelSurfaceProps = {
    ctx: RuntimeContext,
    surfaceData: SurfaceData,
}


self.onmessage = async (e) => {
    const start = performance.now();
    let lastClip = -1;

    const props = e.data as CalcTunnelSurfaceProps;

    console.log("IN THE WORKER");

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
    async function projectPointsRange(begI: number, endI: number) {
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
                                    const g = props.surfaceData.layerIndexes.get(id[i]);
                                    idData[idx] = g ?? -1;

                                    const gii = findClosestPoint(Vec3.create(spx, spy, spz), kdTree, mappedPoints)
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
        const start = performance.now();
        for (let i = 0; i < n; i += updateChunk) {
            projectPointsRange(i, Math.min(i + updateChunk, n));

            if (props.ctx.shouldUpdate) {
                await props.ctx.update({ message: 'projecting points', current: i, max: n });
            }
        }
        const end = performance.now();
        console.log('projectPoints: ', end - start, 'ms');
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
                                const dp = dx * atob[0] + dy * atob[1] + dz * atob[2];
                                const g = props.surfaceData.layerIndexes.get(id[OrderedSet.indexOf(indices, dp < 0.0 ? b : a)]);
                                idData[idx] = g ?? -1;

                                const gii = findClosestPoint(Vec3.create(px, py, pz), kdTree, mappedPoints)
                                idData[idx] = gii ?? -1;
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
        const start = performance.now();
        for (let i = 0; i < n; i += updateChunk) {
            projectToriiRange(i, Math.min(i + updateChunk, n));

            if (props.ctx.shouldUpdate) {
                await props.ctx.update({ message: 'projecting torii', current: i, max: n });
            }
        }
        const end = performance.now();
        console.log('projectTorii: ', end - start, 'ms');
    }

    function findClosestPoint(target: Vec3, kdTree: KDTree, points: Map<Vec3, number>) {
        const closestIndex = kdTree.findNearest(target);
        return closestIndex !== -1 ? points.get(Array.from(points.keys())[closestIndex]) ?? -1 : -1;
    }

    function assignLayersToPoints(
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

    const { resolution, probeRadius, probePositions } = props.surfaceData.props;
    const scaleFactor = 1 / resolution;
    const ngTorus = Math.max(5, 2 + Math.floor(probeRadius * scaleFactor));

    const { mappedPoints, kdTree } = assignLayersToPoints(props.surfaceData.data, props.surfaceData.layers);

    const cellSize = Vec3.create(props.surfaceData.maxRadius, props.surfaceData.maxRadius, props.surfaceData.maxRadius);
    Vec3.scale(cellSize, cellSize, 2);
    const lookup3d = GridLookup3D(props.surfaceData.positions, props.surfaceData.boundary, cellSize);
    const neighbours = lookup3d.result;
    if (props.surfaceData.box === null) props.surfaceData.box = lookup3d.boundary.box;

    const { indices, x: px, y: py, z: pz, id, radius } = props.surfaceData.positions;
    const n = OrderedSet.size(indices);

    const pad = props.surfaceData.maxRadius + resolution;
    const expandedBox = Box3D.expand(Box3D(), props.surfaceData.box, Vec3.create(pad, pad, pad));
    const [minX, minY, minZ] = expandedBox.min;
    const scaledBox = Box3D.scale(Box3D(), expandedBox, scaleFactor);
    const dim = Box3D.size(Vec3(), scaledBox);
    Vec3.ceil(dim, dim);

    const [dimX, dimY, dimZ] = dim;
    const iu = dimZ, iv = dimY, iuv = iu * iv;

    const { cosTable, sinTable } = getAngleTables(probePositions);

    const space = Tensor.Space(dim, [0, 1, 2], Float32Array);
    let data = space.create();
    let idData = space.create();

    data.fill(-1001.0);
    idData.fill(-1);

    const gridx = fillGridDim(dimX, minX, resolution);
    const gridy = fillGridDim(dimY, minY, resolution);
    const gridz = fillGridDim(dimZ, minZ, resolution);

    const updateChunk = Math.ceil(100000 / ((Math.pow(Math.pow(props.surfaceData.maxRadius, 3), 3) * scaleFactor)));

    const promises = [];

    promises.push(projectPoints());
    promises.push(projectTorii());

    try {
        await Promise.all(promises);
        const field = Tensor.create(space, data);
        const idField = Tensor.create(space, idData);

        const transform = Mat4.identity();
        Mat4.fromScaling(transform, Vec3.create(resolution, resolution, resolution));
        Mat4.setTranslation(transform, expandedBox.min);
        self.postMessage({ success: true, calcData: data, calcIdData: idData });
    } catch (error: any) {
        self.postMessage({ success: false, error: error.message });
    }
}