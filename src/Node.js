//@ts-check

class Node {

    constructor() {
        this.neighbours = [];
    }

    addNeighbour(neighbour) {
        this.neighbours.push(neighbour);
    }

}

module.exports = Node;
