import { dist, lineIntersectsRect } from "../core/math.js";

export class NavGraph {
  constructor(config, blockers = []) {
    this.nodes = config.nodes;
    this.blockers = blockers;
    this.nodeById = new Map(this.nodes.map((node) => [node.id, node]));
    this.neighbors = new Map(this.nodes.map((node) => [node.id, []]));
    for (const [a, b] of config.edges) this.addEdge(a, b);
  }

  addEdge(a, b) {
    const from = this.nodeById.get(a);
    const to = this.nodeById.get(b);
    if (!from || !to) return;
    const cost = dist(from, to);
    this.neighbors.get(a).push({ id: b, cost });
    this.neighbors.get(b).push({ id: a, cost });
  }

  randomNode() {
    return this.nodes[Math.floor(Math.random() * this.nodes.length)];
  }

  pathBetween(start, goal) {
    const startNode = this.nearestVisibleNode(start) || this.nearestNode(start);
    const goalNode = goal.id ? goal : this.nearestNode(goal);
    if (!startNode || !goalNode) return goal ? [goal] : [];
    const nodes = this.findPath(startNode.id, goalNode.id);
    return nodes.length ? nodes : [goalNode];
  }

  nearestNode(point) {
    return this.nodes.reduce((best, node) => (
      !best || dist(point, node) < dist(point, best) ? node : best
    ), null);
  }

  nearestVisibleNode(point) {
    const sorted = [...this.nodes].sort((a, b) => dist(point, a) - dist(point, b));
    return sorted.find((node) => !this.segmentBlocked(point, node)) || sorted[0] || null;
  }

  segmentBlocked(a, b) {
    return this.blockers.some((rect) => lineIntersectsRect(a.x, a.y, b.x, b.y, rect));
  }

  findPath(startId, goalId) {
    const open = new Set([startId]);
    const cameFrom = new Map();
    const gScore = new Map([[startId, 0]]);
    const fScore = new Map([[startId, this.heuristic(startId, goalId)]]);
    while (open.size) {
      const current = this.lowest(open, fScore);
      if (current === goalId) return this.reconstruct(cameFrom, current);
      open.delete(current);
      for (const neighbor of this.neighbors.get(current) || []) {
        const nextScore = (gScore.get(current) ?? Infinity) + neighbor.cost;
        if (nextScore >= (gScore.get(neighbor.id) ?? Infinity)) continue;
        cameFrom.set(neighbor.id, current);
        gScore.set(neighbor.id, nextScore);
        fScore.set(neighbor.id, nextScore + this.heuristic(neighbor.id, goalId));
        open.add(neighbor.id);
      }
    }
    return [];
  }

  heuristic(a, b) {
    return dist(this.nodeById.get(a), this.nodeById.get(b));
  }

  lowest(open, scores) {
    return [...open].sort((a, b) => (scores.get(a) ?? Infinity) - (scores.get(b) ?? Infinity))[0];
  }

  reconstruct(cameFrom, current) {
    const path = [this.nodeById.get(current)];
    while (cameFrom.has(current)) {
      current = cameFrom.get(current);
      path.unshift(this.nodeById.get(current));
    }
    return path;
  }
}
