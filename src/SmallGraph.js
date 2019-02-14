//@ts-check
const Node = require('./Node')

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

}

module.exports = SmallGraph;
