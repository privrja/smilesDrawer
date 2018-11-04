//@ts-check

class DecayPoint {

    /**
     * Enum values for Decay points
     * ALL use all variants of decay points
     * COO -CO-O- type of decay
     * CONH -CO-NH- type of decay
     * @return {{ALL: number, COO: number, CONH: number}}
     */
    static get VALUES() {
        return { ALL: 0, COO: 1, CONH: 2 };
    }
}

module.exports = DecayPoint;
