//@ts-check

class Node {

    constructor() {
        this.neighbours = [];
    }

    addNeighbour(neighbour) {
        console.log(neighbour);
        this.neighbours.push(neighbour);
    }

}

module.exports = Node;
