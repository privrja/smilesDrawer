//@ts-check

class SequenceType {

    static get VALUES() {
        return {
            LINEAR: "linear",
            CYCLIC: "cyclic",
            BRANCH: "branched",
            BRANCH_CYCLIC: "branch-cyclic",
            LINEAR_POLYKETIDE: "linear-polyketide",
            CYCLIC_POLYKETIDE: "cyclic-polyketide",
            OTHER: "other",
        }
    }

    static getTypeFromValues(isCyclic, isBranch, isOther) {
        if (isOther) { return this.VALUES.OTHER;}
        if (!isCyclic && !isBranch) {
            return this.VALUES.LINEAR;
        } else if(isCyclic && !isBranch) {
            return this.VALUES.CYCLIC;
        } else if (!isCyclic) {
            return this.VALUES.BRANCH;
        } else {
            return this.VALUES.BRANCH_CYCLIC;
        }
    }

}

module.exports = SequenceType;
