//@ts-check
const VertexState = require("./VertexState");

class Node {

    constructor(id) {
        this.id = id;
        this.neighbours = [];
        this.onRing = false;
        this.vertexState = VertexState.VALUES.NOT_FOUND;
    }

    addNeighbour(neighbour) {
        this.neighbours.push(neighbour);
    }

}

module.exports = Node;
