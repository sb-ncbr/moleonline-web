import { Vec3 } from "molstar/lib/mol-math/linear-algebra";

export class KDNode {
    point: Vec3;
    index: number;
    axis: number;
    left: KDNode | null;
    right: KDNode | null;

    constructor(point: Vec3, index: number, axis: number, left: KDNode | null = null, right: KDNode | null = null) {
        this.point = point;
        this.index = index;
        this.axis = axis;
        this.left = left;
        this.right = right;
    }
}

export class KDTree {
  root: KDNode | null;

  constructor(points: { point: Vec3; index: number }[]) {
      this.root = this.buildTree(points, 0);
  }

  private buildTree(points: { point: Vec3; index: number }[], depth: number): KDNode | null {
      if (points.length === 0) return null;

      const axis = depth % 3;
      points.sort((a, b) => a.point[axis] - b.point[axis]);

      const median = Math.floor(points.length / 2);

      return new KDNode(
          points[median].point,
          points[median].index,
          axis,
          this.buildTree(points.slice(0, median), depth + 1),
          this.buildTree(points.slice(median + 1), depth + 1)
      );
  }

  findNearest(target: Vec3): number {
      let best: { node: KDNode | null; distance: number } = { node: null, distance: Infinity };

      const search = (node: KDNode | null, depth: number) => {
          if (!node) return;

          const axis = depth % 3;
          const d = Vec3.distance(target, node.point);

          if (d < best.distance) {
              best = { node, distance: d };
          }

          const goLeft = target[axis] < node.point[axis];
          search(goLeft ? node.left : node.right, depth + 1);

          if (Math.abs(target[axis] - node.point[axis]) ** 2 < best.distance) {
              search(goLeft ? node.right : node.left, depth + 1);
          }
      };

      search(this.root, 0);
      return best.node ? best.node.index : -1;
  }
}

  
