//@ts-check

class VertexState {

    /**
     * Enum values of Vertex State for DFS
     * @return {{NOT_FOUND: number, OPEN: number, CLOSED: number, FULLY_CLOSED: number}}
     */
    static get VALUES() {
        return { NOT_FOUND: 0, OPEN: 1, CLOSED: 2, FULLY_CLOSED: 3 };
    }
}

module.exports = VertexState;
