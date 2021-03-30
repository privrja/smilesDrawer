//@ts-check
const Node = require('./Node');
const SequenceType = require('./SequenceType');
const VertexState = require('./VertexState');
const Neighbour = require('./Neighbour');
const Direction = require('./Direction');

class SmallGraph {

    constructor() {
        this._nodes = [];
        this.isOther = false;
        this._branch = false;
        this.isCyclic = false;
        this.isBranched = false;
        this.sequenceType = SequenceType.VALUES.LINEAR;
        this._nodeOnRing = null;
    }

    addVertex(node) {
        this._nodes.push(node);
    }

    addNeighbour(nodeId, neighbour, direction) {
        this._nodes[nodeId].addNeighbour(new Neighbour(neighbour, direction));
    }

    dfsInitialization() {
        this._nodes.forEach(e => e.vertexState = VertexState.VALUES.NOT_FOUND);
    }

    getSourceNode() {
        let ends = [];
        for (let index = 0; index < this._nodes.length; ++index) {
            if (this._nodes[index].neighbours.length === 1) {
                if (this._nodes[index].neighbours[0].direction === Direction.VALUES.N) {
                    return this._nodes[index];
                }
                if (this._nodes[index].neighbours[0].direction === Direction.VALUES.POLYKETIDE
                    && this._nodes[this._nodes[index].neighbours[0].neighbour].direction === Direction.VALUES.C) {
                    return this._nodes[index];
                }
                ends.push(this._nodes[index]);
            }
        }
        if (ends.length > 0) {
            return ends[0];
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
            if (vertexFromId !== vertex.neighbours[i].neighbour) {
                this.dfsCyclic(this._nodes[vertex.neighbours[i].neighbour], vertex.id);
            }
        }
        vertex.vertexState = VertexState.VALUES.CLOSED;
    }

    dfsSequenceStart() {
        if (this._nodes.length === 0) {
            return;
        }
        this.dfsInitialization();
        this.sequence = "";
        if (this.isCyclic) {
            this.findRing(this._nodeOnRing);
            this.dfsSequenceCyclic(this._nodeOnRing);
        } else {
            let sourceNode = this.getSourceNode();
            if (sourceNode !== null) {
                this.dfsSequence(this.getSourceNode(), -1);
            } else {
                this.sequenceType = 'other';
                this.isOther = true;
                return;
            }
        }
        if (this.sequence.charAt(this.sequence.length - 1) === '-') {
            this.sequence = this.sequence.substr(0, this.sequence.length - 1);
        }
        this.sequenceType = SequenceType.getTypeFromValues(this.isCyclic, this.isBranched, this.isOther);
    }

    arrayContainsTimes(array, searchValue, times) {
        let cnt = 0;
        for (let index = 0; index < array.length; ++index) {
            if (array[index].neighbour === searchValue) {
                cnt++;
                if (cnt === times) {
                    return true;
                }
            }
        }
        return false;
    }

    findRing(start) {
        let queue = [];
        let firstPath = [start.id];
        let firstPass = true;
        queue.push(firstPath);
        while (queue.length !== 0) {
            let path = queue.pop();
            let last = path[path.length - 1];
            let node = this._nodes[last];
            if (node.id === start.id && !firstPass) {
                if (path.length === 3 && path[0] === path[2] && !this.arrayContainsTimes(this._nodes[path[0]].neighbours, path[1], 2)) {
                    continue;
                }
                path.forEach(v => this._nodes[v].onRing = true);
                continue;
            }
            node.neighbours.forEach(
                neighbour => {
                    if (!path.some(e => e === neighbour.neighbour) || neighbour.neighbour === start.id) {
                        let newPath = [...path];
                        newPath.push(neighbour.neighbour);
                        queue.push(newPath);
                    }
                }
            );
            firstPass = false;
        }
    }

    sortByRingPreference(array) {
        let sortedArray = [...array];
        sortedArray.sort((a, b) => {
            if (this._nodes[a.neighbour].onRing === this._nodes[b.neighbour].onRing) {
                if (a.direction < b.direction) {
                    return -1;
                } else if (a.direction > b.direction) {
                    return 1;
                } else {
                    return 0;
                }
            } else if (this._nodes[a.neighbour].onRing) {
                return 1;
            } else {
                return -1;
            }
        });
        return sortedArray;
    }

    dfsSequenceCyclic(vertex, vertexFromId) {
        if (vertex.vertexState !== VertexState.VALUES.NOT_FOUND) {
            return;
        }
        this.printLeftBrace(vertex);
        this.printDash();
        vertex.vertexState = VertexState.VALUES.OPEN;
        this.printVertex(vertex.id);
        let sortedNeighbours = this.sortByRingPreference(vertex.neighbours);
        for (let index = 0; index < sortedNeighbours.length; ++index) {
            if (vertexFromId === sortedNeighbours[index].neighbour) {
                continue;
            }
            this.dfsSequenceCyclic(this._nodes[sortedNeighbours[index].neighbour], vertex.id);
        }
        this.printRightBrace();
        vertex.vertexState = VertexState.VALUES.CLOSED;
    }

    printVertex(vertexId) {
        this.sequence += `[${vertexId}]`;
    }

    printDash() {
        if (']' === this.sequence[this.sequence.length - 1]) {
            this.sequence += '-';
        }
    }

    printLeftBrace(vertex) {
        if (vertex.neighbours.length > 2) {
            if (this.isBranched) {
                this.isOther = true;
            }
            this.sequence += '\\(';
            this._branch = true;
            this.isBranched = true;
        }
    }

    printRightBrace() {
        if (this._branch) {
            this.sequence += '\\)';
            this._branch = false;
        }
    }

    dfsSequence(vertex, vertexFromId) {
        if (vertex.vertexState !== VertexState.VALUES.NOT_FOUND) {
            return;
        }
        this.printLeftBrace(vertex);
        this.printDash();
        vertex.vertexState = VertexState.VALUES.OPEN;
        this.printVertex(vertex.id);
        for (let index = 0; index < vertex.neighbours.length; ++index) {
            if (vertexFromId === vertex.neighbours[index].neighbour) {
                continue;
            }
            this.dfsSequence(this._nodes[vertex.neighbours[index].neighbour], vertex.id);
        }
        this.printRightBrace();
        vertex.vertexState = VertexState.VALUES.CLOSED;
    }
}

module.exports = SmallGraph;
