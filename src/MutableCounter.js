/**
 * @param {Number} value
 */
class MutableCounter {

    constructor() {
        this.value = 0;
    }

    increment() {
        this.value++;
    }

    reset() {
        this.value = 0;
    }

    getValue() {
        return this.value;
    }

}

module.exports = MutableCounter;
