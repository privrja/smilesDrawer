//@ts-check
const Node = require('./Node')
const VertexState = require('./VertexState')

class SmallGraph {

    constructor() {
        this._nodes = [];
        this.isCyclic = false;
        this._nodeOnRing = null;
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

    getSourceNode() {
        for (let index = 0; index < this._nodes.length; ++index) {
            if (this._nodes[index].neighbours.length === 1) {
                return this._nodes[index];
            }
        }
        return null;
    }

    oneCyclic() {
        if (this._nodes.length === 0) {
            return false;
        }
        this.dfsInitialization();
        this.isCyclic = false;
        this.dfsCyclic(this._nodes[0], -1);
    }

    dfsCyclic(vertex, vertexFromId) {
        if (vertex.vertexState === VertexState.VALUES.OPEN) {
            this.isCyclic = true;
            this._nodeOnRing = vertex;
        }

        if (vertex.vertexState !== VertexState.VALUES.NOT_FOUND) {
            return;
        }

        vertex.vertexState = VertexState.VALUES.OPEN;
        for (let i = 0; i < vertex.neighbours.length; ++i) {
            if (vertexFromId !== vertex.neighbours[i]) {
                this.dfsCyclic(this._nodes[vertex.neighbours[i]], vertex.id);
            }
        }
        vertex.vertexState = VertexState.VALUES.CLOSED;
    }

    dfsSequenceStart() {
        if (this._nodes.length === 0) {
            return "";
        }
        this.dfsInitialization();
        this.sequence = "";
        if (this.isCyclic) {
            this.dfsSequenceCyclic(this._nodeOnRing);
        } else {
            this.dfsSequence(this.getSourceNode(), false, -1);
        }
        if (this.sequence.charAt(this.sequence.length - 1) === '-') {
            this.sequence = this.sequence.substr(0, this.sequence.length - 1);
        }
        return this.sequence;
    }

    dfsSequenceCyclic(vertex) {
        if (vertex.vertexState !== VertexState.VALUES.NOT_FOUND) {
            return;
        }

        vertex.vertexState = VertexState.VALUES.OPEN;
        for (let i = 0; i < vertex.neighbours.length; ++i) {


            this.dfsSequenceCyclic(this._nodes[vertex.neighbours[i]]);
        }
        vertex.vertexState = VertexState.VALUES.CLOSED;
    }

    dfsSequence(vertex, branch, vertexFromId) {
        if (vertex.vertexState !== VertexState.VALUES.NOT_FOUND) {
            return;
        }

        vertex.vertexState = VertexState.VALUES.OPEN;
        if (vertex.neighbours.length > 2) {
            this.sequence += "\\([" + vertex.id + "]";
            this.isBranched = true;
            branch = true;
        } else {
            this.sequence += "[" + vertex.id + "]";
        }
        for (let i = 0; i < vertex.neighbours.length; ++i) {
            if (this.sequence.charAt(this.sequence.length - 1) === ']') {
                this.sequence += "-";
            }

            if (vertexFromId !== vertex.neighbours[i]) {
                this.dfsSequence(this._nodes[vertex.neighbours[i]], branch, vertex.id);
            }
            if (branch && i === 0) {
                this.sequence += "\\)";
                branch = false;
            }
        }
        vertex.vertexState = VertexState.VALUES.CLOSED;
    }
}

module.exports = SmallGraph;
