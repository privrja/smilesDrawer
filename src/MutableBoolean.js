/**
 *@property {boolean} value is boolean
 */
class MutableBoolean {

    /**
     * @param {boolean} value
     */
    constructor(value) {
        this.value = value;
    }

    setValue(value) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }

}

module.exports = MutableBoolean;
