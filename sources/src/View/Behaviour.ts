/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
import { Vec3 } from "molstar/lib/mol-math/linear-algebra"

export function getTriangleCenter(vertices: number[], triangles: number[], tI: number) {
    const c = Vec3.zero();
    for (let i = 0; i < 3; i++) {
        const vIdx = triangles[3 * tI + i];  
        const vx = vertices[3 * vIdx];
        const vy = vertices[3 * vIdx + 1];
        const vz = vertices[3 * vIdx + 2];
        Vec3.add(c, c, Vec3.create(vx, vy, vz));
    }
    return Vec3.scale(c, c, 1/3);
}