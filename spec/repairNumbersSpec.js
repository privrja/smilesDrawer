const Graph = require('../src/Graph');

describe("smiles numbers", function () {
    it("righData", function () {
        let result = Graph.repairNumbers('C(C3(CC)N3)=O');
        expect(result).toEqual('C(C1(CC)N1)=O');
    });

    it("righData", function () {
        let result = Graph.repairNumbers('C6C5CCC5CCCCC6');
        expect(result).toEqual('C1C2CCC2CCCCC1');
    });

    it("righData", function () {
        let result = Graph.repairNumbers('C%62C5CCC5CCCCC%62');
        expect(result).toEqual('C1C2CCC2CCCCC1');
    });

    it("righData", function () {
        let result = Graph.repairNumbers('C62CCCC2CCCC6');
        expect(result).toEqual('C12CCCC2CCCC1');
    });

    it("righData", function () {
        let result = Graph.repairNumbers('C%60CCC%62CCCC%62CCCC%60');
        expect(result).toEqual('C2CCC1CCCC1CCCC2');
    });

    it("righData", function () {
        let result = Graph.repairNumbers('C%62CCC%60CCCC%62CCCC%60');
        expect(result).toEqual('C1CCC2CCCC1CCCC2');
    });

    it("righData", function () {
        let result = Graph.repairNumbers('C%62CCC%60CCCC%60CCCC%62');
        expect(result).toEqual('C1CCC2CCCC2CCCC1');
    });

    it("righData", function () {
        let result = Graph.repairNumbers('CC(=CC(=O)N(CCCC1C(=O)NC(C(=O)N1)CCCN(C(=O)C=C(C)CCOC(=O)C(CCCN(C(=O)C=C(C)CCO)[O-])NC(=O)C)[O-])[O-])CCO');
        expect(result).toEqual('CC(=CC(=O)N(CCCC1C(=O)NC(C(=O)N1)CCCN(C(=O)C=C(C)CCOC(=O)C(CCCN(C(=O)C=C(C)CCO)[O-])NC(=O)C)[O-])[O-])CCO');
    });

});
