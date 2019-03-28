//@ts-check

class DecayState {

    static get VALUES() {
        return { NO: 0, STANDARD: 1, SOURCE: 2, STANDARD_AND_SOURCE: 3};
    }
}

module.exports = DecayState;
