//@ts-check
const Node = require('./Node')
const VertexState = require('./VertexState')

class SmallGraph {

    constructor() {
        this._nodes = [];
    }

    addVertex(node) {
        this._nodes.push(node);
    }

    addNeighbour(nodeId, neighbour) {
        this._nodes[nodeId].addNeighbour(neighbour);
    }

    dfsInitialization() {
        this._nodes.forEach(e => e.vertexState = VertexState.VALUES.NOT_FOUND);
    }

    isOneCyclic() {
        if (this._nodes.length === 0) {
            return false;
        }
        this.dfsInitialization();
        this.isCyclic = false;
        this.ringsMoreThanOne = false;
        this.dfsCyclic(this._nodes[0]);
        return !this.ringsMoreThanOne && this.isCyclic;
    }

    dfsCyclic(vertex) {
        if (vertex.vertexState !== VertexState.VALUES.OPEN) {
            if (this.isCyclic) {
                this.ringsMoreThanOne = true;
            } else {
                this.isCyclic = true;
            }
        }

        if (vertex.vertexState !== VertexState.VALUES.NOT_FOUND) {
            return;
        }

        vertex.vertexState = VertexState.VALUES.OPEN;
        for (let i = 0; i < vertex.edges.length; ++i) {
            let edge = this.edges[vertex.edges[i]];
            if (edge.isDecay) {
                this._smallGraph.addNeighbour(vertex.component, this.vertices[Graph.getProperVertex(vertex.id, edge.sourceId, edge.targetId)].component);
                continue;
            }
            let nextVertex = Graph.getProperVertex(vertex.id, edge.sourceId, edge.targetId);
            this.dfsSmall(this.vertices[nextVertex]);
        }
        vertex.vertexState = VertexState.VALUES.CLOSED;
    }
}

module.exports = SmallGraph;
