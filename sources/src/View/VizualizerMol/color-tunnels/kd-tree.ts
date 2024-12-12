type Point = [number, number, number];

class KDTreeNode {
  point: Point;
  dimension: number;
  left: KDTreeNode | null;
  right: KDTreeNode | null;

  constructor(point: Point, dimension: number) {
    this.point = point;
    this.dimension = dimension;
    this.left = null;
    this.right = null;
  }
}

export class KDTree {
  root: KDTreeNode | null;

  constructor(points: Point[]) {
    this.root = this.build(points, 0);
  }

  private build(points: Point[], depth: number): KDTreeNode | null {
    if (points.length === 0) return null;

    // Determine the splitting dimension (alternating at each level)
    const dimension = depth % 3;

    // Sort points along the chosen dimension
    points.sort((a, b) => a[dimension] - b[dimension]);

    // Choose the median point as the root
    const medianIndex = Math.floor(points.length / 2);
    const medianPoint = points[medianIndex];

    // Create node and build subtrees
    const node = new KDTreeNode(medianPoint, dimension);
    node.left = this.build(points.slice(0, medianIndex), depth + 1);
    node.right = this.build(points.slice(medianIndex + 1), depth + 1);

    return node;
  }

  nearest(point: Point, node: KDTreeNode | null = this.root, depth: number = 0, best: KDTreeNode | null = null): KDTreeNode | null {
    if (node === null) return best;

    // Update best point if current node is closer
    const distance = this.squaredDistance(point, node.point);
    if (!best || distance < this.squaredDistance(point, best.point)) {
      best = node;
    }

    // Determine which subtree to search
    const dimension = node.dimension;
    const direction = point[dimension] < node.point[dimension] ? "left" : "right";
    const nextNode = direction === "left" ? node.left : node.right;
    const otherNode = direction === "left" ? node.right : node.left;

    // Search the best subtree first
    best = this.nearest(point, nextNode, depth + 1, best);

    // Check if we need to search the other subtree
    if (Math.abs(point[dimension] - node.point[dimension]) ** 2 < this.squaredDistance(point, best!.point)) {
      best = this.nearest(point, otherNode, depth + 1, best);
    }

    return best;
  }

  private squaredDistance(a: Point, b: Point): number {
    return a.reduce((sum, val, idx) => sum + (val - b[idx]) ** 2, 0);
  }
}
  
