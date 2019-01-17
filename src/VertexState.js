//@ts-check

class VertexState {

    /**
     * Enum values of Vertex State for DFS
     * @return {{NOT_FOUND: number, OPEN: number, CLOSED: number}}
     */
    static get VALUES() {
        return { NOT_FOUND: 0, OPEN: 1, CLOSED: 2 };
    }
}

module.exports = VertexState;
