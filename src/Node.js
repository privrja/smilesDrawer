//@ts-check
const VertexState = require("./VertexState")

class Node {

    constructor() {
        this.neighbours = [];
        this.vertexState = VertexState.VALUES.NOT_FOUND;
    }

    addNeighbour(neighbour) {
        console.log(neighbour);
        this.neighbours.push(neighbour);
    }

}

module.exports = Node;
