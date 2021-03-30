
class Direction {

    static get VALUES() {
        return { N: 0, POLYKETIDE: 1, C: 2 };
    }

    static getProperValue(isPolyketide, vertexElement, vertexId, firstVertexId) {
        if (isPolyketide) {
            return this.VALUES.POLYKETIDE;
        }
        if (vertexElement === "C" && vertexId !== firstVertexId) {
            return this.VALUES.C;
        }
        return this.VALUES.N;
    }

}

module.exports= Direction;
