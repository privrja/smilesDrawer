//@ts-check
const Node = require('./Node')
const VertexState = require('./VertexState')

class SmallGraph {

    constructor() {
        this._nodes = [];
        this.isOneCyclic = false;
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

    oneCyclic() {
        if (this._nodes.length === 0) {
            return false;
        }
        this.dfsInitialization();
        this.isCyclic = false;
        this.ringsMoreThanOne = false;
        this.dfsCyclic(this._nodes[0]);
        this.isOneCyclic =  !this.ringsMoreThanOne && this.isCyclic;
        return this.isOneCyclic;
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
        for (let i = 0; i < vertex.neighbours.length; ++i) {
            this.dfsCyclic(this._nodes[i]);
        }
        vertex.vertexState = VertexState.VALUES.CLOSED;
    }

    dfsSequenceStart() {
        if (this._nodes.length === 0) {
            return "";
        }
        this.dfsInitialization();
        this.sequence = "";
        this.dfsSequence(this._nodes[0]);
        return this.sequence;
    }

    dfsSequence(vertex) {
        if (vertex.vertexState !== VertexState.VALUES.NOT_FOUND) {
            return;
        }

        vertex.vertexState = VertexState.VALUES.OPEN;
        for (let i = 0; i < vertex.neighbours.length; ++i) {

            this.dfsSequence(this._nodes[i]);
        }
        vertex.vertexState = VertexState.VALUES.CLOSED;
    }
}

module.exports = SmallGraph;
