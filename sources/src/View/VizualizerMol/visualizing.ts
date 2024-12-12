import { Mesh } from "molstar/lib/mol-geo/geometry/mesh/mesh";
import { MeshBuilder } from "molstar/lib/mol-geo/geometry/mesh/mesh-builder";
import { createPrimitive } from "molstar/lib/mol-geo/primitive/primitive";
import { Mat4, Vec3 } from "molstar/lib/mol-math/linear-algebra";
import { Shape } from "molstar/lib/mol-model/shape";
import { Color } from "molstar/lib/mol-util/color";
import { MembranePoint, Origins, Point } from "../../DataInterface";
import { Dodecahedron } from "molstar/lib/mol-geo/primitive/dodecahedron";
import { Polyhedron } from "molstar/lib/mol-geo/primitive/polyhedron";
import { Colors, Enum } from "../../StaticData";
import { getTriangleCenter } from "../Behaviour";

interface MolObjectSourceData {
    kind: 'origin' | 'surface' | 'membrane'
}

export function createSurfaceShape(options: { triangles: number[], vertices: number[], color: Color, solidForm: boolean, label: string, prev?: Shape<Mesh> }) { 
    const builder = MeshBuilder.createState(options.triangles.length * 2 + 1, undefined, options.prev?.geometry);
    const t = Mat4.identity();
    Mesh.getOriginalData

    const points: Point[] = [];

    if (options.solidForm) {
        let group = 0;
        for (let i = 0; i < options.triangles.length; i+= 3) {
            const triangleIndices = [
                options.triangles[i],
                options.triangles[i + 1],
                options.triangles[i + 2]
            ];

            const middle = Vec3.toObj(getTriangleCenter(options.vertices, options.triangles, group));
            points.push({X: Math.round(middle.x * 100) / 100, Y: Math.round(middle.y * 100) / 100, Z: Math.round(middle.z * 100) / 100})
    
            const primitive = createPrimitive(options.vertices, triangleIndices);
    
            builder.currentGroup = group;
            MeshBuilder.addPrimitive(builder, t, primitive);
            MeshBuilder.addPrimitiveFlipped(builder, t, primitive);
            ++group;
        }
    } else {
        const pb = createPrimitive(options.vertices, options.triangles);
    
        MeshBuilder.addPrimitive(builder, t, pb);
        MeshBuilder.addPrimitiveFlipped(builder, t, pb);

    }

    const mesh = MeshBuilder.getMesh(builder);
    Mesh.computeNormals(mesh);

    return Shape.create(
        "Surface",
        { kind: 'surface', vertices: options.vertices, triangles: options.triangles, solidForm: options.solidForm, tag: 'Surface' },
        mesh,
        () => Color(options.color),
        () => 1,
        (i) => {
            if (options.solidForm) 
                return `${options.label} , Center: (${points[i].X}, ${points[i].Y} ${points[i].Z})`
            return '';
        },
    );
}

export function createMembrane(data: MembranePoint[], color: Color) {
    const { vertices, indices } = Dodecahedron();
    const builder = MeshBuilder.createState(data.length * indices.length);

    for (let i = 0; i < data.length; i += 1) {
        const el = data[i];
        const t = Mat4.identity();
        builder.currentGroup = i;
        Mat4.scaleUniformly(t, Mat4.setTranslation(t, Vec3.create(el.Position.X, el.Position.Y, el.Position.Z)), 0.4);
        MeshBuilder.addPrimitive(builder, t, Polyhedron(vertices, indices));
        MeshBuilder.addPrimitiveFlipped(builder, t, Polyhedron(vertices, indices));
    }

    const mesh = MeshBuilder.getMesh(builder);

    return Shape.create(
        "Membrane",
        { kind: 'membrane' },
        mesh,
        (i) => data[i].Side === "N" ? Colors.get(Enum.MembraneBlue) : Colors.get(Enum.MembraneRed),
        (i) => i,
        () => "Membrane",
    );
}

export function createOriginSurface(points: Point[], color: Color, type: string, subType: string | undefined, tag?: string, ref?: string) {
    const { vertices, indices } = Dodecahedron();
    const builder = MeshBuilder.createState(points.length * indices.length);

    for (let i = 0; i < points.length; i += 1) {
        const point = points[i];
        const t = Mat4.identity();
        builder.currentGroup = i;
        Mat4.scaleUniformly(t, Mat4.setTranslation(t, Vec3.create(Math.round(point.X * 100) / 100, Math.round(point.Y * 100) / 100, Math.round(point.Z * 100) / 100)), 1.6);
        MeshBuilder.addPrimitive(builder, t, Polyhedron(vertices, indices));
        MeshBuilder.addPrimitiveFlipped(builder, t, Polyhedron(vertices, indices));
    }

    const mesh = MeshBuilder.getMesh(builder);

    return Shape.create(
        "OriginSurface",
        { 
            kind: "origin",
            data: points,
            tag: tag && tag.length > 0 ? tag : "",
            ref: ref && ref.length > 0 ? ref : ""
        },
        mesh,
        () => color,
        () => 1,
        (i) => {
            const point = points[i];
            return `<b>${type}</b> ${subType ? "(" + subType.toString() + ")" : ""} at (${Math.round(point.X * 100) / 100}, ${Math.round(point.Y * 100) / 100}, ${Math.round(point.Z * 100) / 100})`
        },
    );

}

