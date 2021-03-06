//@ts-check
const DecayPoint = require('./DecayPoint');
const MathHelper = require('./MathHelper');
const Vector2 = require('./Vector2');
const Vertex = require('./Vertex');
const Edge = require('./Edge');
const Ring = require('./Ring');
const Atom = require('./Atom');
const VertexState = require('./VertexState');
const SmallGraph = require('./SmallGraph');
const Node = require('./Node');
const SequenceType = require('./SequenceType');
const DecayState = require('./DecayState');
const MutableBoolean = require('./MutableBoolean');
const MutableCounter = require('./MutableCounter');
const Direction = require('./Direction');

/**
 * A class representing the molecular graph.
 *
 * @property {Vertex[]} vertices The vertices of the graph.
 * @property {Edge[]} edges The edges of this graph.
 * @property {Number[]} decays The id of edges marked as decay point of this graph.
 * @property {Object} vertexIdsToEdgeId A map mapping vertex ids to the edge between the two vertices. The key is defined as vertexAId + '_' + vertexBId.
 * @property {Boolean} isometric A boolean indicating whether or not the SMILES associated with this graph is isometric.
 */
class Graph {
    /**
     * The constructor of the class Graph.
     *
     * @param {Object} parseTree A SMILES parse tree.
     * @param {Boolean} [isomeric=false] A boolean specifying whether or not the SMILES is isomeric.
     * @param options
     */
    constructor(parseTree, isomeric = false, options = {}) {
        this.vertices = Array();
        this.edges = Array();
        this.decays = Array();
        this.decaysAll = Array();
        this.vertexIdsToEdgeId = {};
        this.isomeric = isomeric;
        this._startingVertexes = [];
        this._isCyclic = false;
        this._polyketide = false;
        this._digitCounter = 1;
        this._printedDigits = [];
        this.options = options;
        this._componentsIsPolyketide = [];

        // Used for the bridge detection algorithm
        this._time = 0;
        this._init(parseTree);
    }

    /**
     * PRIVATE FUNCTION. Initializing the graph from the parse tree.
     *
     * @param {Object} node The current node in the parse tree.
     * @param order
     * @param {Number} parentVertexId=null The id of the previous vertex.
     * @param {Boolean} isBranch=false Whether or not the bond leading to this vertex is a branch bond. Branches are represented by parentheses in smiles (e.g. CC(O)C).
     */
    _init(node, order = 0, parentVertexId = null, isBranch = false) {
        // Create a new vertex object
        let atom = new Atom(node.atom.element ? node.atom.element : node.atom, node.bond);

        atom.branchBond = node.branchBond;
        atom.ringbonds = node.ringbonds;
        atom.bracket = node.atom.element ? node.atom : null;

        let vertex = new Vertex(atom);
        let parentVertex = this.vertices[parentVertexId];

        this.addVertex(vertex);

        // Add the id of this node to the parent as child
        if (parentVertexId !== null) {
            vertex.setParentVertexId(parentVertexId);
            vertex.value.addNeighbouringElement(parentVertex.value.element);
            parentVertex.addChild(vertex.id);
            parentVertex.value.addNeighbouringElement(atom.element);

            // In addition create a spanningTreeChildren property, which later will
            // not contain the children added through ringbonds
            parentVertex.spanningTreeChildren.push(vertex.id);

            // Add edge between this node and its parent
            let edge = new Edge(parentVertexId, vertex.id, 1);
            let vertexId;

            if (isBranch) {
                edge.setBondType(vertex.value.branchBond || '-');
                vertexId = vertex.id;
                edge.setBondType(vertex.value.branchBond || '-');
                vertexId = vertex.id;
            } else {
                edge.setBondType(parentVertex.value.bondType || '-');
                vertexId = parentVertex.id;
            }

            this.addEdge(edge);
        }

        let offset = node.ringbondCount + 1;

        if (atom.bracket) {
            offset += atom.bracket.hcount;
        }

        let stereoHydrogens = 0;
        if (atom.bracket && atom.bracket.chirality) {
            atom.isStereoCenter = true;
            stereoHydrogens = atom.bracket.hcount;
            for (var i = 0; i < stereoHydrogens; i++) {
                this._init({
                    atom: 'H',
                    isBracket: 'false',
                    branches: Array(),
                    branchCount: 0,
                    ringbonds: Array(),
                    ringbondCount: false,
                    next: null,
                    hasNext: false,
                    bond: '-'
                }, i, vertex.id, true);
            }
        }

        for (var i = 0; i < node.branchCount; i++) {
            this._init(node.branches[i], i + offset, vertex.id, true);
        }

        if (node.hasNext) {
            this._init(node.next, node.branchCount + offset, vertex.id);
        }
    }

    /**
     * Find decay points of molecule
     * Types of decay points, declared in DecayPoint
     */
    findDecayPoints() {
        if (!Object.keys(this.options).length) {
            return;
        }

        switch (this.options.drawDecayPoints) {
            default:
            case DecayState.VALUES.NO:
                return;
            case DecayState.VALUES.STANDARD:
                this.standardDecays();
                break;
            case DecayState.VALUES.SOURCE:
                this.sourceDecays();
                break;
            case DecayState.VALUES.STANDARD_AND_SOURCE:
                this.standardDecays();
                this.sourceDecays();
                break;
        }
    }

    reduceDecays() {
        this._decaysCopy = [];
        this.dfsSmilesInitialization();
        for (let i = 0; i < this.decays.length; i++) {
            this.smallBlockDfsStart(this.edges[this.decays[i]]);
        }
        this.decays = [];
        this.decays = this._decaysCopy;
        this.setStandardDecays();
    }

    dfsSmallInitialization(vertices) {
        for (let i = 0; i < vertices.length; ++i) {
            this.vertices[vertices[i]].vertexState = VertexState.VALUES.NOT_FOUND;
        }
    }

    smallBlockDfsStart(edge) {
        let stackVisitedVertexes = [];
        let depth = this.smallDfs(this.vertices[edge.sourceId], 0, stackVisitedVertexes);
        this.dfsSmilesInitialization();
        if (depth > 3) {
            stackVisitedVertexes = [];
            depth = this.smallDfs(this.vertices[edge.targetId], 0, stackVisitedVertexes);
            this.dfsSmilesInitialization();
            if (depth > 3) {
                this._decaysCopy.push(edge.id);
            }
        }
    }

    smallDfs(vertex, depth, stackVisitedVertexes) {
        stackVisitedVertexes.push(vertex.id);
        if (depth > 3) {
            return depth;
        }

        if (vertex.vertexState !== VertexState.VALUES.NOT_FOUND) {
            return depth;
        }

        vertex.vertexState = VertexState.VALUES.OPEN;
        ++depth;

        for (let i = 0; i < vertex.edges.length; ++i) {
            let edge = this.edges[vertex.edges[i]];
            if (edge.isDecay) {
                continue;
            }
            let nextVertex = Graph.getProperVertex(vertex.id, edge.sourceId, edge.targetId);
            depth = this.smallDfs(this.vertices[nextVertex], depth, stackVisitedVertexes);
        }
        vertex.vertexState = VertexState.VALUES.CLOSED;
        return depth;
    }

    setStandardDecays() {
        this.edges.forEach(e => {
           e.setDecay(false);
        });
        this.decays.forEach(e => {
            this.edges[e].setDecay(true);
        });
    }

    standardDecays() {
        for (let i = 0; i < this.edges.length; i++) {
            if (this.edges[i].bondType === '=') {
                let dec = this.isDecayPoint(this.edges[i].sourceId, this.edges[i].targetId, i);
                if (dec !== false) {
                    this.edges[dec].setDecay(true);
                    this.decays.push(dec);
                    this.edges[dec].setDecayAll(true);
                    this.decaysAll.push(dec);
                }
            }
        }
        this.reduceDecays();
    }

    sourceDecays() {
        this.options.decaySource.forEach(e => {
            this.edges[e].setDecay(true);
            this.edges[e].setDecayAll(true);
            this.decays.push(e);
            this.decaysAll.push(e);
        });
    }

    /**
     * check if its decay point of specific decay types
     * @param sourceId
     * @param targetId
     * @param edgeBondId
     * @param decayTypes DecayPoint
     * @returns {int|boolean} return edge id when found, otherwise return false
     */
    isDecayPoint(sourceId, targetId, edgeBondId, decayTypes = DecayPoint.VALUES.ALL) {
        switch (decayTypes) {
            case DecayPoint.VALUES.ALL:
                let found = this.getNeighbourEdgeDecayIdOfCONH(sourceId, targetId, edgeBondId);
                if (found === false) {
                    return this.getNeighbourEdgeDecayIdOfCOO(sourceId, targetId, edgeBondId);
                } else {
                    return found;
                }
            case DecayPoint.VALUES.COO:
                return this.getNeighbourEdgeDecayIdOfCOO(sourceId, targetId, edgeBondId);
            case DecayPoint.VALUES.CONH:
                return this.getNeighbourEdgeDecayIdOfCONH(sourceId, targetId, edgeBondId);
        }
    }

    /**
     * Find decay points of -CO-O- type
     * @param sourceId
     * @param targetId
     * @param edgeBondId
     * @returns {int|boolean}
     */
    getNeighbourEdgeDecayIdOfCOO(sourceId, targetId, edgeBondId) {
        if (this.vertices[sourceId].value.element === 'O' && this.vertices[targetId].value.element === 'C') {
            return this.getNeighbourEdgeDecayId(targetId, 'O', edgeBondId);
        } else if (this.vertices[targetId].value.element === 'O' && this.vertices[sourceId].value.element === 'C') {
            return this.getNeighbourEdgeDecayId(sourceId, 'O', edgeBondId);
        }
        return false;
    }

    /**
     * Find decay points of -CO-NH- type
     * @param sourceId
     * @param targetId
     * @param edgeBondId
     * @returns {int|boolean}
     */
    getNeighbourEdgeDecayIdOfCONH(sourceId, targetId, edgeBondId) {
        if (this.vertices[sourceId].value.element === 'O' && this.vertices[targetId].value.element === 'C') {
            return this.getNeighbourEdgeDecayId(targetId, 'N', edgeBondId);
        } else if (this.vertices[targetId].value.element === 'O' && this.vertices[sourceId].value.element === 'C') {
            return this.getNeighbourEdgeDecayId(sourceId, 'N', edgeBondId);
        }
        return false;
    }

    /**
     * Find decay point edge id of right neighbour
     * @param vertexId
     * @param element
     * @param edgeBondId
     * @returns {int|boolean}
     */
    getNeighbourEdgeDecayId(vertexId, element, edgeBondId) {
        for (let i = 0; i < this.vertices[vertexId].edges.length; i++) {
            let edgeId = this.checkNeighbourEdgeId(this.vertices[vertexId].edges[i], vertexId, element);
            if (edgeId !== false && edgeId !== edgeBondId) {
                return edgeId;
            }
        }
        return false;
    }

    /**
     * Find edge id of decay point
     * @param edgeId
     * @param vertexId
     * @param element
     * @returns {int|boolean}
     */
    checkNeighbourEdgeId(edgeId, vertexId, element) {
        if ((this.edges[edgeId].sourceId === vertexId && this.vertices[this.edges[edgeId].targetId].value.element === element) ||
            (this.edges[edgeId].targetId === vertexId && this.vertices[this.edges[edgeId].sourceId].value.element === element)) {
            return edgeId;
        } else {
            return false;
        }
    }

    /**
     * Clears all the elements in this graph (edges and vertices).
     */
    clear() {
        this.vertices = Array();
        this.edges = Array();
        this.vertexIdsToEdgeId = {};
    }

    /**
     * Add a vertex to the graph.
     *
     * @param {Vertex} vertex A new vertex.
     * @returns {Number} The vertex id of the new vertex.
     */
    addVertex(vertex) {
        vertex.id = this.vertices.length;
        this.vertices.push(vertex);

        return vertex.id;
    }

    /**
     * Add an edge to the graph.
     *
     * @param {Edge} edge A new edge.
     * @returns {Number} The edge id of the new edge.
     */
    addEdge(edge) {
        let source = this.vertices[edge.sourceId];
        let target = this.vertices[edge.targetId];

        edge.id = this.edges.length;
        this.edges.push(edge);

        this.vertexIdsToEdgeId[edge.sourceId + '_' + edge.targetId] = edge.id;
        this.vertexIdsToEdgeId[edge.targetId + '_' + edge.sourceId] = edge.id;
        edge.isPartOfAromaticRing = source.value.isPartOfAromaticRing && target.value.isPartOfAromaticRing;

        source.value.bondCount += edge.weight;
        target.value.bondCount += edge.weight;

        source.edges.push(edge.id);
        target.edges.push(edge.id);

        return edge.id;
    }

    /**
     * Returns the edge between two given vertices.
     *
     * @param {Number} vertexIdA A vertex id.
     * @param {Number} vertexIdB A vertex id.
     * @returns {(Edge|null)} The edge or, if no edge can be found, null.
     */
    getEdge(vertexIdA, vertexIdB) {
        let edgeId = this.vertexIdsToEdgeId[vertexIdA + '_' + vertexIdB];

        return edgeId === undefined ? null : this.edges[edgeId];
    }

    /**
     * Returns the ids of edges connected to a vertex.
     *
     * @param {Number} vertexId A vertex id.
     * @returns {Number[]} An array containing the ids of edges connected to the vertex.
     */
    getEdges(vertexId) {
        let edgeIds = Array();
        let vertex = this.vertices[vertexId];

        for (var i = 0; i < vertex.neighbours.length; i++) {
            edgeIds.push(this.vertexIdsToEdgeId[vertexId + '_' + vertex.neighbours[i]]);
        }

        return edgeIds;
    }


    /**
     * Check whether or not two vertices are connected by an edge.
     *
     * @param {Number} vertexIdA A vertex id.
     * @param {Number} vertexIdB A vertex id.
     * @returns {Boolean} A boolean indicating whether or not two vertices are connected by an edge.
     */
    hasEdge(vertexIdA, vertexIdB) {
        return this.vertexIdsToEdgeId[vertexIdA + '_' + vertexIdB] !== undefined
    }

    /**
     * Returns an array containing the vertex ids of this graph.
     *
     * @returns {Number[]} An array containing all vertex ids of this graph.
     */
    getVertexList() {
        let arr = [this.vertices.length];

        for (var i = 0; i < this.vertices.length; i++) {
            arr[i] = this.vertices[i].id;
        }

        return arr;
    }

    /**
     * Returns an array containing source, target arrays of this graphs edges.
     *
     * @returns {Array[]} An array containing source, target arrays of this graphs edges. Example: [ [ 2, 5 ], [ 6, 9 ] ].
     */
    getEdgeList() {
        let arr = Array(this.edges.length);

        for (var i = 0; i < this.edges.length; i++) {
            arr[i] = [this.edges[i].sourceId, this.edges[i].targetId];
        }

        return arr;
    }

    /**
     * Get the adjacency matrix of the graph.
     *
     * @returns {Array[]} The adjancency matrix of the molecular graph.
     */
    getAdjacencyMatrix() {
        let length = this.vertices.length;
        let adjacencyMatrix = Array(length);

        for (var i = 0; i < length; i++) {
            adjacencyMatrix[i] = new Array(length);
            adjacencyMatrix[i].fill(0);
        }

        for (var i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];

            adjacencyMatrix[edge.sourceId][edge.targetId] = 1;
            adjacencyMatrix[edge.targetId][edge.sourceId] = 1;
        }

        return adjacencyMatrix;
    }

    /**
     * Get the adjacency matrix of the graph with all bridges removed (thus the components). Thus the remaining vertices are all part of ring systems.
     *
     * @returns {Array[]} The adjancency matrix of the molecular graph with all bridges removed.
     */
    getComponentsAdjacencyMatrix() {
        let length = this.vertices.length;
        let adjacencyMatrix = Array(length);
        let bridges = this.getBridges();

        for (var i = 0; i < length; i++) {
            adjacencyMatrix[i] = new Array(length);
            adjacencyMatrix[i].fill(0);
        }

        for (var i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];

            adjacencyMatrix[edge.sourceId][edge.targetId] = 1;
            adjacencyMatrix[edge.targetId][edge.sourceId] = 1;
        }

        for (var i = 0; i < bridges.length; i++) {
            adjacencyMatrix[bridges[i][0]][bridges[i][1]] = 0;
            adjacencyMatrix[bridges[i][1]][bridges[i][0]] = 0;
        }

        return adjacencyMatrix;
    }

    /**
     * Get the adjacency matrix of a subgraph.
     *
     * @param {Number[]} vertexIds An array containing the vertex ids contained within the subgraph.
     * @returns {Array[]} The adjancency matrix of the subgraph.
     */
    getSubgraphAdjacencyMatrix(vertexIds) {
        let length = vertexIds.length;
        let adjacencyMatrix = Array(length);

        for (var i = 0; i < length; i++) {
            adjacencyMatrix[i] = new Array(length);
            adjacencyMatrix[i].fill(0);

            for (var j = 0; j < length; j++) {
                if (i === j) {
                    continue;
                }

                if (this.hasEdge(vertexIds[i], vertexIds[j])) {
                    adjacencyMatrix[i][j] = 1;
                }
            }
        }

        return adjacencyMatrix;
    }

    /**
     * Get the distance matrix of the graph.
     *
     * @returns {Array[]} The distance matrix of the graph.
     */
    getDistanceMatrix() {
        let length = this.vertices.length;
        let adja = this.getAdjacencyMatrix();
        let dist = Array(length);

        for (var i = 0; i < length; i++) {
            dist[i] = Array(length);
            dist[i].fill(Infinity);
        }

        for (var i = 0; i < length; i++) {
            for (var j = 0; j < length; j++) {
                if (adja[i][j] === 1) {
                    dist[i][j] = 1;
                }
            }
        }

        for (var k = 0; k < length; k++) {
            for (var i = 0; i < length; i++) {
                for (var j = 0; j < length; j++) {
                    if (dist[i][j] > dist[i][k] + dist[k][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j]
                    }
                }
            }
        }

        return dist;
    }

    /**
     * Get the distance matrix of a subgraph.
     *
     * @param {Number[]} vertexIds An array containing the vertex ids contained within the subgraph.
     * @returns {Array[]} The distance matrix of the subgraph.
     */
    getSubgraphDistanceMatrix(vertexIds) {
        let length = vertexIds.length;
        let adja = this.getSubgraphAdjacencyMatrix(vertexIds);
        let dist = Array(length);

        for (var i = 0; i < length; i++) {
            dist[i] = Array(length);
            dist[i].fill(Infinity);
        }

        for (var i = 0; i < length; i++) {
            for (var j = 0; j < length; j++) {
                if (adja[i][j] === 1) {
                    dist[i][j] = 1;
                }
            }
        }

        for (var k = 0; k < length; k++) {
            for (var i = 0; i < length; i++) {
                for (var j = 0; j < length; j++) {
                    if (dist[i][j] > dist[i][k] + dist[k][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j]
                    }
                }
            }
        }

        return dist;
    }

    /**
     * Get the adjacency list of the graph.
     *
     * @returns {Array[]} The adjancency list of the graph.
     */
    getAdjacencyList() {
        let length = this.vertices.length;
        let adjacencyList = Array(length);

        for (var i = 0; i < length; i++) {
            adjacencyList[i] = [];

            for (var j = 0; j < length; j++) {
                if (i === j) {
                    continue;
                }

                if (this.hasEdge(this.vertices[i].id, this.vertices[j].id)) {
                    adjacencyList[i].push(j);
                }
            }
        }

        return adjacencyList;
    }

    /**
     * Get the adjacency list of a subgraph.
     *
     * @param {Number[]} vertexIds An array containing the vertex ids contained within the subgraph.
     * @returns {Array[]} The adjancency list of the subgraph.
     */
    getSubgraphAdjacencyList(vertexIds) {
        let length = vertexIds.length;
        let adjacencyList = Array(length);

        for (var i = 0; i < length; i++) {
            adjacencyList[i] = Array();

            for (var j = 0; j < length; j++) {
                if (i === j) {
                    continue;
                }

                if (this.hasEdge(vertexIds[i], vertexIds[j])) {
                    adjacencyList[i].push(j);
                }
            }
        }

        return adjacencyList;
    }

    /**
     * Returns an array containing the edge ids of bridges. A bridge splits the graph into multiple components when removed.
     *
     * @returns {Number[]} An array containing the edge ids of the bridges.
     */
    getBridges() {
        let length = this.vertices.length;
        let visited = new Array(length);
        let disc = new Array(length);
        let low = new Array(length);
        let parent = new Array(length);
        let adj = this.getAdjacencyList();
        let outBridges = Array();

        visited.fill(false);
        parent.fill(null);
        this._time = 0;

        for (var i = 0; i < length; i++) {
            if (!visited[i]) {
                this._bridgeDfs(i, visited, disc, low, parent, adj, outBridges);
            }
        }

        return outBridges;
    }

    /**
     * Traverses the graph in breadth-first order.
     *
     * @param {Number} startVertexId The id of the starting vertex.
     * @param {Function} callback The callback function to be called on every vertex.
     */
    traverseBF(startVertexId, callback) {
        let length = this.vertices.length;
        let visited = new Array(length);

        visited.fill(false);

        var queue = [startVertexId];

        while (queue.length > 0) {
            // JavaScripts shift() is O(n) ... bad JavaScript, bad!
            let u = queue.shift();
            let vertex = this.vertices[u];

            callback(vertex);

            for (var i = 0; i < vertex.neighbours.length; i++) {
                let v = vertex.neighbours[i];
                if (!visited[v]) {
                    visited[v] = true;
                    queue.push(v);
                }
            }
        }
    }

    /**
     * Get the depth of a subtree in the direction opposite to the vertex specified as the parent vertex.
     *
     * @param {Number} vertexId A vertex id.
     * @param {Number} parentVertexId The id of a neighbouring vertex.
     * @returns {Number} The depth of the sub-tree.
     */
    getTreeDepth(vertexId, parentVertexId) {
        if (vertexId === null || parentVertexId === null) {
            return 0;
        }

        let neighbours = this.vertices[vertexId].getSpanningTreeNeighbours(parentVertexId);
        let max = 0;

        for (var i = 0; i < neighbours.length; i++) {
            let childId = neighbours[i];
            let d = this.getTreeDepth(childId, vertexId);

            if (d > max) {
                max = d;
            }
        }

        return max + 1;
    }

  /**
   * Traverse a sub-tree in the graph.
   *
   * @param {Number} vertexId A vertex id.
   * @param {Number} parentVertexId A neighbouring vertex.
   * @param {Function} callback The callback function that is called with each visited as an argument.
   * @param {Number} [maxDepth=999999] The maximum depth of the recursion.
   * @param {Boolean} [ignoreFirst=false] Whether or not to ignore the starting vertex supplied as vertexId in the callback.
   * @param {Number} [depth=1] The current depth in the tree.
   * @param {Uint8Array} [visited=null] An array holding a flag on whether or not a node has been visited.
   */
  traverseTree(vertexId, parentVertexId, callback, maxDepth = 999999, ignoreFirst = false, depth = 1, visited = null) {
    if (visited === null) {
      visited = new Uint8Array(this.vertices.length);
    }

        if (depth > maxDepth + 1 || visited[vertexId] === 1) {
            return;
        }

        visited[vertexId] = 1;

        let vertex = this.vertices[vertexId];
        let neighbours = vertex.getNeighbours(parentVertexId);

        if (!ignoreFirst || depth > 1) {
            callback(vertex);
        }

        for (var i = 0; i < neighbours.length; i++) {
            this.traverseTree(neighbours[i], vertexId, callback, maxDepth, ignoreFirst, depth + 1, visited);
        }
    }

  /**
   * Positiones the (sub)graph using Kamada and Kawais algorithm for drawing general undirected graphs. https://pdfs.semanticscholar.org/b8d3/bca50ccc573c5cb99f7d201e8acce6618f04.pdf
   * There are undocumented layout parameters. They are undocumented for a reason, so be very careful.
   *
   * @param {Number[]} vertexIds An array containing vertexIds to be placed using the force based layout.
   * @param {Vector2} center The center of the layout.
   * @param {Number} startVertexId A vertex id. Should be the starting vertex - e.g. the first to be positioned and connected to a previously place vertex.
   * @param {Ring} ring The bridged ring associated with this force-based layout.
   */
  kkLayout(vertexIds, center, startVertexId, ring, bondLength,
    threshold = 0.1, innerThreshold = 0.1, maxIteration = 2000,
    maxInnerIteration = 50, maxEnergy = 1e9) {

    let edgeStrength = bondLength;

        // Add vertices that are directly connected to the ring
        var i = vertexIds.length;
        while (i--) {
            let vertex = this.vertices[vertexIds[i]];
            var j = vertex.neighbours.length;
        }

        let matDist = this.getSubgraphDistanceMatrix(vertexIds);
        let length = vertexIds.length;

        // Initialize the positions. Place all vertices on a ring around the center
        let radius = MathHelper.polyCircumradius(500, length);
        let angle = MathHelper.centralAngle(length);
        let a = 0.0;
        let arrPositionX = new Float32Array(length);
        let arrPositionY = new Float32Array(length);
        let arrPositioned = Array(length);

        i = length;
        while (i--) {
            let vertex = this.vertices[vertexIds[i]];
            if (!vertex.positioned) {
                arrPositionX[i] = center.x + Math.cos(a) * radius;
                arrPositionY[i] = center.y + Math.sin(a) * radius;
            } else {
                arrPositionX[i] = vertex.position.x;
                arrPositionY[i] = vertex.position.y;
            }
            arrPositioned[i] = vertex.positioned;
            a += angle;
        }

        // Create the matrix containing the lengths
        let matLength = Array(length);
        i = length;
        while (i--) {
            matLength[i] = new Array(length);
            var j = length;
            while (j--) {
                matLength[i][j] = bondLength * matDist[i][j];
            }
        }

        // Create the matrix containing the spring strenghts
        let matStrength = Array(length);
        i = length;
        while (i--) {
            matStrength[i] = Array(length);
            var j = length;
            while (j--) {
                matStrength[i][j] = edgeStrength * Math.pow(matDist[i][j], -2.0);
            }
        }

        // Create the matrix containing the energies
        let matEnergy = Array(length);
        let arrEnergySumX = new Float32Array(length);
        let arrEnergySumY = new Float32Array(length);
        i = length;
        while (i--) {
            matEnergy[i] = Array(length);
        }

        i = length;
        let ux, uy, dEx, dEy, vx, vy, denom;

        while (i--) {
            ux = arrPositionX[i];
            uy = arrPositionY[i];
            dEx = 0.0;
            dEy = 0.0;
            let j = length;
            while (j--) {
                if (i === j) {
                    continue;
                }
                vx = arrPositionX[j];
                vy = arrPositionY[j];
                denom = 1.0 / Math.sqrt((ux - vx) * (ux - vx) + (uy - vy) * (uy - vy));
                matEnergy[i][j] = [
                    matStrength[i][j] * ((ux - vx) - matLength[i][j] * (ux - vx) * denom),
                    matStrength[i][j] * ((uy - vy) - matLength[i][j] * (uy - vy) * denom)
                ];
                matEnergy[j][i] = matEnergy[i][j];
                dEx += matEnergy[i][j][0];
                dEy += matEnergy[i][j][1];
            }
            arrEnergySumX[i] = dEx;
            arrEnergySumY[i] = dEy;
        }

        // Utility functions, maybe inline them later
        let energy = function (index) {
            return [arrEnergySumX[index] * arrEnergySumX[index] + arrEnergySumY[index] * arrEnergySumY[index], arrEnergySumX[index], arrEnergySumY[index]];
        };

        let highestEnergy = function () {
            let maxEnergy = 0.0;
            let maxEnergyId = 0;
            let maxDEX = 0.0;
            let maxDEY = 0.0;

            i = length;
            while (i--) {
                let [delta, dEX, dEY] = energy(i);

                if (delta > maxEnergy && arrPositioned[i] === false) {
                    maxEnergy = delta;
                    maxEnergyId = i;
                    maxDEX = dEX;
                    maxDEY = dEY;
                }
            }

            return [maxEnergyId, maxEnergy, maxDEX, maxDEY];
        };

        let update = function (index, dEX, dEY) {
            let dxx = 0.0;
            let dyy = 0.0;
            let dxy = 0.0;
            let ux = arrPositionX[index];
            let uy = arrPositionY[index];
            let arrL = matLength[index];
            let arrK = matStrength[index];

            i = length;
            while (i--) {
                if (i === index) {
                    continue;
                }

        let vx = arrPositionX[i];
        let vy = arrPositionY[i];
        let l = arrL[i];
        let k = arrK[i];
        let m = (ux - vx) * (ux - vx);
        let denom = 1.0 / Math.pow(m + (uy - vy) * (uy - vy), 1.5);

        dxx += k * (1 - l * (uy - vy) * (uy - vy) * denom);
        dyy += k * (1 - l * m * denom);
        dxy += k * (l * (ux - vx) * (uy - vy) * denom);
      }

            // Prevent division by zero
            if (dxx === 0) {
                dxx = 0.1;
            }

            if (dyy === 0) {
                dyy = 0.1;
            }

            if (dxy === 0) {
                dxy = 0.1;
            }

            let dy = (dEX / dxx + dEY / dxy);
            dy /= (dxy / dxx - dyy / dxy); // had to split this onto two lines because the syntax highlighter went crazy.
            let dx = -(dxy * dy + dEX) / dxx;

            arrPositionX[index] += dx;
            arrPositionY[index] += dy;

            // Update the energies
            let arrE = matEnergy[index];
            dEX = 0.0;
            dEY = 0.0;

            ux = arrPositionX[index];
            uy = arrPositionY[index];

            let vx, vy, prevEx, prevEy, denom;

            i = length;
            while (i--) {
                if (index === i) {
                    continue;
                }
                vx = arrPositionX[i];
                vy = arrPositionY[i];
                // Store old energies
                prevEx = arrE[i][0];
                prevEy = arrE[i][1];
                denom = 1.0 / Math.sqrt((ux - vx) * (ux - vx) + (uy - vy) * (uy - vy));
                dx = arrK[i] * ((ux - vx) - arrL[i] * (ux - vx) * denom);
                dy = arrK[i] * ((uy - vy) - arrL[i] * (uy - vy) * denom);

                arrE[i] = [dx, dy];
                dEX += dx;
                dEY += dy;
                arrEnergySumX[i] += dx - prevEx;
                arrEnergySumY[i] += dy - prevEy;
            }
            arrEnergySumX[index] = dEX;
            arrEnergySumY[index] = dEY;
        };

    // Setting up variables for the while loops
    let maxEnergyId = 0;
    let dEX = 0.0;
    let dEY = 0.0;
    let delta = 0.0;
    let iteration = 0;
    let innerIteration = 0;

        while (maxEnergy > threshold && maxIteration > iteration) {
            iteration++;
            [maxEnergyId, maxEnergy, dEX, dEY] = highestEnergy();
            delta = maxEnergy;
            innerIteration = 0;
            while (delta > innerThreshold && maxInnerIteration > innerIteration) {
                innerIteration++;
                update(maxEnergyId, dEX, dEY);
                [delta, dEX, dEY] = energy(maxEnergyId);
            }
        }

        i = length;
        while (i--) {
            let index = vertexIds[i];
            let vertex = this.vertices[index];
            vertex.position.x = arrPositionX[i];
            vertex.position.y = arrPositionY[i];
            vertex.positioned = true;
            vertex.forcePositioned = true;
        }
    }

    /**
     * PRIVATE FUNCTION used by getBridges().
     */
    _bridgeDfs(u, visited, disc, low, parent, adj, outBridges) {
        visited[u] = true;
        disc[u] = low[u] = ++this._time;

        for (var i = 0; i < adj[u].length; i++) {
            let v = adj[u][i];

            if (!visited[v]) {
                parent[v] = u;

                this._bridgeDfs(v, visited, disc, low, parent, adj, outBridges);

                low[u] = Math.min(low[u], low[v]);

                // If low > disc, we have a bridge
                if (low[v] > disc[u]) {
                    outBridges.push([u, v]);
                }
            } else if (v !== parent[u]) {
                low[u] = Math.min(low[u], disc[v]);
            }
        }
    }

    /**
     * Returns the connected components of the graph.
     *
     * @param {Array[]} adjacencyMatrix An adjacency matrix.
     * @returns {Set[]} Connected components as sets.
     */
    static getConnectedComponents(adjacencyMatrix) {
        let length = adjacencyMatrix.length;
        let visited = new Array(length);
        let components = [];
        let count = 0;

        visited.fill(false);

        for (var u = 0; u < length; u++) {
            if (!visited[u]) {
                let component = Array();
                visited[u] = true;
                component.push(u);
                count++;
                Graph._ccGetDfs(u, visited, adjacencyMatrix, component);
                if (component.length > 1) {
                    components.push(component);
                }
            }
        }

        return components;
    }

    /**
     * Returns the number of connected components for the graph.
     *
     * @param {Array[]} adjacencyMatrix An adjacency matrix.
     * @returns {Number} The number of connected components of the supplied graph.
     */
    static getConnectedComponentCount(adjacencyMatrix) {
        let length = adjacencyMatrix.length;
        let visited = new Array(length);
        let count = 0;

        visited.fill(false);

        for (var u = 0; u < length; u++) {
            if (!visited[u]) {
                visited[u] = true;
                count++;
                Graph._ccCountDfs(u, visited, adjacencyMatrix);
            }
        }

        return count;
    }

    /**
     * PRIVATE FUNCTION used by getConnectedComponentCount().
     */
    static _ccCountDfs(u, visited, adjacencyMatrix) {
        for (var v = 0; v < adjacencyMatrix[u].length; v++) {
            let c = adjacencyMatrix[u][v];

            if (!c || visited[v] || u === v) {
                continue;
            }

            visited[v] = true;
            Graph._ccCountDfs(v, visited, adjacencyMatrix);
        }
    }

    /**
     * PRIVATE FUNCTION used by getConnectedComponents().
     */
    static _ccGetDfs(u, visited, adjacencyMatrix, component) {
        for (var v = 0; v < adjacencyMatrix[u].length; v++) {
            let c = adjacencyMatrix[u][v];

            if (!c || visited[v] || u === v) {
                continue;
            }

            visited[v] = true;
            component.push(v);
            Graph._ccGetDfs(v, visited, adjacencyMatrix, component);
        }
    }

    /**
     * Revert decay point value and update list of decay points
     * when edge isn't decay point -> change mark edge as decay point and add edge to decays list
     * when edge is decay point -> unmark edge as decay point and remove edgeId from list of decays
     * @param edgeId
     */
    revertEdgeDecayPoint(edgeId) {
        this.edges[edgeId].isDecay = !this.edges[edgeId].isDecay;
        this.edges[edgeId].isDecayAll = !this.edges[edgeId].isDecayAll;
        if (this.edges[edgeId].isDecay) {
            this.decays.push(edgeId);
            this.decaysAll.push(edgeId);
        } else {
            let index = this.decays.indexOf(edgeId);
            if (index > -1) {
                this.decays.splice(index, 1);
            }
            index = this.decaysAll.indexOf(edgeId);
            if (index > -1) {
                this.decaysAll.splice(index, 1);
            }
        }
    }

    getDecays() {
        return this.decays;
    }

    /**
     * Build block of SMILES based on decay points
     * DFS pass through graph
     * but the numbers are already setup in vertex.value.ringbonds array so no need to second pass of dfs
     */
    buildSmiles() {
        let smiles = [];
        this._polyketide = false;
        this.dfsSmilesInitialization();
        if (this.decays.length === 0) {
            this.startDfs(this.vertices[0], smiles);
            return {blockSmiles: smiles, sequence: '[0]', sequenceType: SequenceType.VALUES.OTHER, decays: this.decays, isPolyketide: this._polyketide};
        } else {
            this.dfsBuildSmilesStart(smiles);
        }
        this.dfsSmilesInitialization();
        this.dfsSmallStart();
        this._smallGraph.oneCyclic();
        this._smallGraph.dfsSequenceStart();
        let sequenceData = this.sortSequence(smiles, this._smallGraph.sequence);
        return {
            blockSmiles: sequenceData.smiles,
            sequence: sequenceData.sequence,
            sequenceType: this._smallGraph.sequenceType + ((this._smallGraph.sequenceType === 'linear' || this._smallGraph.sequenceType === 'cyclic') && this._polyketide ? '-polyketide' : ''),
            decays: this.decays,
            isPolyketide: this._polyketide
        }
    }

    sortSequence(smiles, sequence) {
        let permutation = this.getSequencePermutation(sequence);
        let newSmiles = new Array(permutation.length).fill(null);
        for (let i = 0; i < permutation.length; ++i) {
            newSmiles[i] = smiles[permutation[i][0]];
        }

        let position = 0;
        let char = sequence.charAt(position);
        let newSequence = '';
        while (true) {
            switch (char) {
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    let number = char;
                    ++position;
                    if (position >= sequence.length) {
                        return {sequence: sequence, smiles: smiles};
                    }
                    char = sequence.charAt(position);
                    while(!isNaN(char)) {
                        number += char;
                        ++position;
                        if (position >= sequence.length) {
                            return {sequence: sequence, smiles: smiles};
                        }
                        char = sequence.charAt(position);
                    }
                    let j;
                    for (j = 0; j < permutation.length; ++j) {
                        if (permutation[j][0] === number) {
                            newSequence += j;
                            break;
                        }
                    }
                    continue;
                default:
                    newSequence += char;
            }

            ++position;
            if (position >= sequence.length) {
                break;
            }
            char = sequence.charAt(position);
        }
        return {sequence: newSequence, smiles: newSmiles};
    }

    getSequencePermutation(sequence) {
        let re = /\d+/g;
        let match = null;
        let permutation = [];
        while ((match = re.exec(sequence)) != null) {
            permutation.push(match);
        }
        return permutation;
   }

    dfsSmallStart() {
        this._smallGraph = new SmallGraph();
        for (let index = 0; index < this._startingVertexes.length; ++index) {
            this._smallGraph.addVertex(new Node(this._startingVertexes[index].component));
            this.first = this._startingVertexes[index];
            this.dfsSmall(this._startingVertexes[index], this._componentsIsPolyketide[index]);
        }
    }

    /**
     * Initialize graph for dfs
     * set for all vertices vertexState to NotFound
     */
    dfsSmilesInitialization() {
        for (let i = 0; i < this.vertices.length; ++i) {
            this.vertices[i].vertexState = VertexState.VALUES.NOT_FOUND;
        }
    }

    /**
     * Starting function for DFS
     * starts on decay points (on edge), so start on both side of edge
     * @param {Array} smiles output param, array of SMILES blocks (string)
     */
    dfsBuildSmilesStart(smiles) {
        this._cnt = 0;
        this._markComponent = false;
        this._startingVertexes = [];
        for (let i = 0; i < this.decays.length; ++i) {
            let edge = this.edges[this.decays[i]];
            this.markingComponents(this.startDfs(this.vertices[edge.sourceId], smiles));
            this.markingComponents(this.startDfs(this.vertices[edge.targetId], smiles));
        }
    }

    markingComponents(isPolyketyde) {
        if (this._markComponent) {
            this._cnt++;
            this._markComponent = false;
            this._componentsIsPolyketide.push(isPolyketyde);
        }
    }

    /**
     * Start DFS for build SMILES of blocks
     * @param {Vertex} vertex to start DFS
     * @param {Array} smiles output param, array od SMILES
     */
    startDfs(vertex, smiles) {
        let isPolyketide = new MutableBoolean(true);
        let decaysCounter = new MutableCounter();
        let vertexCounter = new MutableCounter();
        let through = [];
        let stackSmiles = [];
        this.first = vertex.id;
        this._isCyclic = false;
        this._digitCounter = 1;
        this._printedDigits = [];
        this.dfsSmiles(vertex, stackSmiles, isPolyketide, decaysCounter, through, vertexCounter);
        if (decaysCounter.getValue() < 2 && isPolyketide.getValue() === true) {
            isPolyketide.setValue(through.every(vertex => vertex === 'O' || vertex === 'N') && vertexCounter.getValue() > 4);
        }
        if (this._isCyclic) {
            this.closedToNotFound();
            stackSmiles = [];
            this.dfsSmiles(vertex, stackSmiles, new MutableBoolean(true), new MutableCounter(), [], new MutableCounter(), -1, true);
        }
        this.closedToFullyClosed();

        stackSmiles = Graph.removeUnnecessaryParentheses(stackSmiles);
        let smile = Graph.removeUnnecessaryNumbers(stackSmiles.join(""));
        if (smile.length !== 0) {
            smiles.push({smiles: smile, isPolyketide: isPolyketide.getValue()});
            if (isPolyketide.getValue() === true) {
                this._polyketide = true;
            }
        }
        return isPolyketide.getValue();
    }

    closedToNotFound() {
        for (let i = 0; i < this.vertices.length; ++i) {
            if (this.vertices[i].vertexState === VertexState.VALUES.CLOSED) {
                this.vertices[i].vertexState = VertexState.VALUES.NOT_FOUND;
            }
        }
    }

    closedToFullyClosed() {
        for (let i = 0; i < this.vertices.length; ++i) {
            if (this.vertices[i].vertexState === VertexState.VALUES.CLOSED) {
                this.vertices[i].vertexState = VertexState.VALUES.FULLY_CLOSED;
            }
        }
    }

    /**
     * DFS for SMILES
     * @param {Vertex} vertex
     * @param {Array} stackSmiles output param
     * @param {MutableBoolean} isPolyketide
     * @param {MutableCounter} cntDecays
     * @param {Array} through
     * @param {MutableCounter} vertexCounter
     * @param lastVertexId last vertex id for setup digits
     * @param isSecondPass is second pass of dfs
     */
    dfsSmiles(vertex, stackSmiles, isPolyketide, cntDecays, through, vertexCounter,  lastVertexId = -1, isSecondPass = false) {
        if (vertex.vertexState === VertexState.VALUES.OPEN && !isSecondPass && lastVertexId !== -1) {
            this._isCyclic = true;
            if (!vertex.digits.some(e => this.vertices[lastVertexId].digits.includes(e))) {
                vertex.digits.push(this._digitCounter);
                this.vertices[lastVertexId].digits.push(this._digitCounter);
                this._digitCounter++;
            }
        }

        if (vertex.vertexState !== VertexState.VALUES.NOT_FOUND) {
            return;
        }

        if (vertex.value.element === 'H') {
            return;
        }

        if (this.first === vertex.id && vertex.value.element === "C" && isPolyketide.getValue()) {
            stackSmiles.push("O");
            isPolyketide.setValue(false);
        }

        if (vertex.value.bracket) {
            stackSmiles.push("[");
            Graph.printVertexValue(stackSmiles, vertex);
            if (vertex.value.bracket.hcount > 0) {
                stackSmiles.push('H');
                if (vertex.value.bracket.hcount > 1) {
                    stackSmiles.push(vertex.value.bracket.hcount);
                }
            }
            if (vertex.value.bracket.charge > 0) {
                stackSmiles.push('+');
                stackSmiles.push(vertex.value.bracket.charge);
            } else if (vertex.value.bracket.charge < 0) {
                stackSmiles.push(vertex.value.bracket.charge);
            }
            stackSmiles.push("]");
        } else {
            Graph.printVertexValue(stackSmiles, vertex);
        }
        vertexCounter.increment();

        if (isSecondPass) {
            stackSmiles.push(this.smilesNumbersAdd(vertex));
        }

        if (!this._markComponent) {
            this._startingVertexes.push(vertex);
        }
        vertex.component = this._cnt;
        this._markComponent = true;
        vertex.vertexState = VertexState.VALUES.OPEN;
        for (let i = 0; i < vertex.edges.length; ++i) {
            let edge = this.edges[vertex.edges[i]];
            let nextVertex = Graph.getProperVertex(vertex.id, edge.sourceId, edge.targetId);
            if (edge.isDecayAll && lastVertexId !== nextVertex) {
                through.push(vertex.value.element);
            }
            if (edge.isDecay) {
                cntDecays.increment();
                if (vertex.value.element === "C" && vertex.id !== this.first && isPolyketide.getValue()) {
                    stackSmiles.push("(");
                    stackSmiles.push("O");
                    stackSmiles.push(")");
                    isPolyketide.setValue(false);
                }
                continue;
            }
            stackSmiles.push("(");
            Graph.addBondTypeToStack(edge, stackSmiles);
            if (lastVertexId !== nextVertex) {
                this.dfsSmiles(this.vertices[nextVertex], stackSmiles, isPolyketide, cntDecays, through, vertexCounter, vertex.id, isSecondPass);
            }
            Graph.checkStack(stackSmiles);
        }
        vertex.vertexState = VertexState.VALUES.CLOSED;
    }

    dfsSmall(vertex, isPolyketide) {
        if (vertex.vertexState !== VertexState.VALUES.NOT_FOUND) {
            return;
        }

        vertex.vertexState = VertexState.VALUES.OPEN;
        for (let i = 0; i < vertex.edges.length; ++i) {
            let edge = this.edges[vertex.edges[i]];
            if (edge.isDecay) {

                this._smallGraph.addNeighbour(vertex.component, this.vertices[Graph.getProperVertex(vertex.id, edge.sourceId, edge.targetId)].component, Direction.getProperValue(isPolyketide, vertex.value.element, vertex.id, this.first));
                continue;
            }
            let nextVertex = Graph.getProperVertex(vertex.id, edge.sourceId, edge.targetId);
            this.dfsSmall(this.vertices[nextVertex], isPolyketide);
        }
        vertex.vertexState = VertexState.VALUES.CLOSED;
    }


    static printVertexValue(stackSmiles, vertex) {
        if (vertex.value.isPartOfAromaticRing) {
            stackSmiles.push(vertex.value.element.toLowerCase());
        } else {
            stackSmiles.push(vertex.value.element);
        }
    }

    /**
     * Remove numbers which is neighbours in SMILES notation -> need to perform in cyclic structures
     * @param {String} smiles SMILES
     * @return {String} repaired SMILES
     */
    static removeUnnecessaryNumbers(smiles) {
        if (smiles === null) {
            return '';
        }
        try {
            let numbers = this.getNumbers(smiles);
            for (let number of numbers) {
                let first = this.findFirst(smiles, number);
                let second = this.findSecond(smiles, first + 1, number);
                let tmpRange = this.removeRangeLast(smiles, first, second, number);
                smiles = this.repairSmiles(smiles, tmpRange, first, second, number);
            }
            return smiles;
        } catch (ex) {
            return smiles;
        }
    }

    /**
     * Remove unnecessary numbers from SMILES
     * @param {String} smiles
     * @param {Number} first
     * @param {Number} second
     * @param {Number} number
     * @return {*}
     */
    static removeNumbers(smiles, first, second, number) {
        if (number > 9) {
            let numLength = number.toString().length;
            smiles = smiles.slice(0, first - 1) + smiles.slice(first + numLength);
            return smiles.slice(0, second - 2 - numLength) + smiles.slice(second - 1);
        } else {
            smiles = smiles.slice(0, first) + smiles.slice(first + 1);
            return smiles.slice(0, second - 1) + smiles.slice(second);
        }
    }

    /**
     * Reapair SMILES
     * @param {String} smiles
     * @param {String} tmpRange
     * @param {Number} first
     * @param {Number} second
     * @param {Number} number
     * @return {String|*}
     */
    static repairSmiles(smiles, tmpRange, first, second, number) {
        let pattern = new RegExp("^(Br|Cl|[BCNOPSFIbcnopsfi])$");
        if (pattern.test(tmpRange)) {
            return this.removeNumbers(smiles, first, second, number);
        }
        let patternOrg = new RegExp("^(Br|Cl|[BCNOPSFIbcnopsfi])");
        if (patternOrg.test(tmpRange)) {
            return smiles;
        }

        while (tmpRange.length !== 0) {
            if (tmpRange[0] === '(') {
                tmpRange = tmpRange.substring(1);
                if (pattern.test(tmpRange)) {
                    return this.removeNumbers(smiles, first, second, number);
                }
                let leftBrackets = 1;
                let rightBrackets = 0;
                while (leftBrackets !== rightBrackets) {
                    switch (tmpRange[0]) {
                        case '(':
                            leftBrackets++;
                            break;
                        case ')':
                            rightBrackets++;
                            break;
                    }
                    if ("" === tmpRange) {
                        return smiles;
                    }
                    tmpRange = tmpRange.substring(1);
                }
                return this.repairSmiles(smiles, tmpRange, first, second, number);
            } else {
                tmpRange = tmpRange.substring(1);
            }
        }
        return smiles;
    }

    /**
     * Substring in range and remove last Organic Subset
     * @param smiles
     * @param first
     * @param second
     * @param number
     * @return {string}
     */
    static removeRangeLast(smiles, first, second, number) {
        if (number > 9) {
            return smiles.substring(first + number.toString().length, second - 1);
        } else {
            return smiles.substring(first + 1, second);
        }
    }

    /**
     * Get numbers from SMILES
     * @param smiles
     * @return {Set<Number>}
     */
    static getNumbers(smiles) {
        let numbers = new Set();
        for (let index = 0; index < smiles.length; ++index) {
            if (!isNaN(smiles[index])) {
                numbers.add(smiles[index]);
            } else if (smiles[index] === '%') {
                index++;
                let num = "";
                while (!isNaN(smiles[index])) {
                    num += smiles[index];
                    index++;
                    if (index >= smiles.length) {
                        break;
                    }
                }
                index--;
                numbers.add(num);
            }
        }
        return numbers;
    }

    /**
     * return index of first occurrence number
     * @param smiles
     * @param number
     * @return {number}
     */
    static findFirst(smiles, number) {
        return smiles.indexOf(number);
    }

    /**
     * return index of first occurrence number from index + 1
     * @param smiles
     * @param from range no including this point (from, Infinity) = [from + 1, Infinity)
     * @param number
     * @return {*}
     */
    static findSecond(smiles, from, number) {
        let result = smiles.indexOf(number, from);
        if (result === -1) {
            throw "Not Found";
        }
        return result;
    }


    smilesNumbersAdd(vertex) {
        let numbers = '';
        for (let i = 0; i < vertex.digits.length; ++i) {
            let num = vertex.digits[i];
            if (this._printedDigits.some(e => e === num)) {
                let nextVertex = this.vertices.find(e => e.digits.includes(num) && e.id !== vertex.id);
                let intersection = vertex.edges.filter(element => nextVertex.edges.includes(element));

                if (intersection.length > 0) {
                    let bond = this.edges[intersection[0]].bondType;
                    if (bond !== '-') {
                        numbers += bond;
                    }
                }
            }

            this._printedDigits.push(num);
            let numString = num.toString();
            if (numString.length === 1) {
                numbers += numString;
            } else {
                numbers += '%' + numString;
            }
        }
        return numbers;
    }

    /**
     * Return other vertex id then the actual vertex id
     * when vertexId === sourceId return targetId
     * when vertexId === targetId return sourceId
     * @param {Number} vertexId actual vertex id
     * @param {Number} sourceId source vertex id
     * @param {Number} targetId target vertex id
     * @return {Number}
     */
    static getProperVertex(vertexId, sourceId, targetId) {
        if (vertexId === sourceId) return targetId;
        else return sourceId;
    }

    static repairNumbers(smiles) {
        try {
            let numbers = Array.from(this.getNumbers(smiles));
            numbers.sort(function (a, b) {
                return b - a
            });

            let index = 1;
            for (let number of numbers) {
                if (index === number) {
                    continue;
                }
                let first = this.findFirst(smiles, number);
                if (number > 9) {
                    smiles = smiles.slice(0, first - 1) + index + smiles.slice(first + number.toString().length);
                    let second = this.findSecond(smiles, first + 1, number);
                    smiles = smiles.slice(0, second - 1) + index + smiles.slice(second + number.toString().length);
                } else {
                    smiles = smiles.slice(0, first) + index + smiles.slice(first + 1);
                    let second = this.findSecond(smiles, first + 1, number);
                    smiles = smiles.slice(0, second) + index + smiles.slice(second + 1);
                }
                index++;
            }
        } catch (e) {
            return smiles;
        }
        return smiles;
    }

    /**
     * Remove unnecessary parentheses from SMILES
     * example CCC(CC)(C) -> CCC(CC)C
     * example C(=O)C(C(C)) -> C(=O)CCC
     * @param {Array} stackRight
     * @return {Array}
     */
    static removeUnnecessaryParentheses(stackRight) {
        if (stackRight.length === 0) return [];
        let stackLeft = [], lastLiteral = "", literal = "";
        while (stackRight.length > 0) {
            literal = stackRight.shift();
            if ((")".localeCompare(literal) === 0 && ")".localeCompare(lastLiteral) === 0)) {
                Graph.removeParentheses(stackLeft, false, literal);
            } else {
                stackLeft.push(literal);
            }
            lastLiteral = literal;
        }

        literal = stackLeft.pop();
        if ((")".localeCompare(literal) === 0 && stackRight.length === 0)) {
            Graph.removeParentheses(stackLeft);
        } else {
            stackLeft.push(literal);
        }
        return stackLeft;
    }

    /**
     * Remove unnecessary parentheses from stack
     * go through stack and when find proper closing bracket,
     * then remove it and push back removed data when searching in stack
     * @param {Array} stack with unnecessary parentheses to remove
     * @param {Boolean} end treat with situation when ")" is last character of stack -> end = true, else where end = false
     * @param {String} literal, when end = false, need to pop from stack and at the end add literal back to stack
     */
    static removeParentheses(stack, end = true, literal = "") {
        let stackTmp = [];
        let leftBraces = 0, rightBraces = 1;
        if (!end) {
            stack.pop();
        }
        while (true) {
            let lit = stack.pop();
            if ("(".localeCompare(lit) === 0) {
                leftBraces++;
            } else if (")".localeCompare(lit) === 0) {
                rightBraces++;
            }
            if (leftBraces === rightBraces) {
                Graph.moveAllValuesInStackToAnotherStack(stackTmp, stack);
                if (!end) {
                    stack.push(literal);
                }
                break;
            }
            stackTmp.push(lit);
        }
    }

    /**
     * Remove all values from stackSource and push it to stackDestination
     * @param {Array} stackSource stack to remove values
     * @param {Array} stackDestination stack to add values from stackSource
     */
    static moveAllValuesInStackToAnotherStack(stackSource, stackDestination) {
        while (stackSource.length > 0) {
            stackDestination.push(stackSource.pop());
        }
    }

    /**
     * Check last value of stack
     * if it one of (, -, = or # then remove all characters in stack to first ( from the end of stack
     * elsewhere add ) to stack
     * @param {Array} stackSmiles
     */
    static checkStack(stackSmiles) {
        switch (stackSmiles[stackSmiles.length - 1]) {
            case "(":
            case "-":
            case "=":
            case "#":
                Graph.removeAllFromStackToFirstLeftBrace(stackSmiles);
                break;
            default:
                stackSmiles.push(")");
        }
    }

    /**
     * Remove all characters from stack to first "("
     * @param {Array} stackSmiles
     */
    static removeAllFromStackToFirstLeftBrace(stackSmiles) {
        let literal = stackSmiles.pop();
        while (literal !== "(") {
            if (stackSmiles.length === 0) break;
            literal = stackSmiles.pop();
        }
    }

    /**
     * Add bond type to stack
     * if edge have = or # bond type add it to stack
     * @param {Edge} edge
     * @param {Array} stackSmiles
     */
    static addBondTypeToStack(edge, stackSmiles) {
        if (edge.bondType === "=" || edge.bondType === "#") {
            stackSmiles.push(edge.bondType);
        }
    }

}

module.exports = Graph;
