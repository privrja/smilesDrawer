const Graph = require('../src/Graph');

describe("smiles numbers", function () {
    it("righData", function () {
        let result = Graph.removeUnnecessaryNumbers('C(C1(CC)N1)=O');
        expect(result).toEqual('C(C(CC)N)=O');
    });

    it("righData 2", function () {
        let result = Graph.removeUnnecessaryNumbers('C(C1(CC)(C1C)C)=O');
        expect(result).toEqual('C(C(CC)(CC)C)=O');
    });

    it("righData 3", function () {
        let result = Graph.removeUnnecessaryNumbers('C(C1(CC)C1(CC)C)=O');
        expect(result).toEqual('C(C(CC)C(CC)C)=O');
    });

    it("righData 4", function () {
        let result = Graph.removeUnnecessaryNumbers('C(C1(CC)C(CC)C1)=O');
        expect(result).toEqual('C(C1(CC)C(CC)C1)=O');
    });

    it("righData 5", function () {
        let result = Graph.removeUnnecessaryNumbers('C(C1(CC)C(CC)C)=O');
        expect(result).toEqual('C(C1(CC)C(CC)C)=O');
    });

    it("righData 6", function () {
        let result = Graph.removeUnnecessaryNumbers('C21C(CC(=O)CC1CC3C3C2)CC');
        expect(result).toEqual('C21C(CC(=O)CC1CCCC2)CC');
    });

    it("righData 7", function () {
        let result = Graph.removeUnnecessaryNumbers('C21C(CC(=O)CC1CC3(C3C)C2)CC');
        expect(result).toEqual('C21C(CC(=O)CC1CC(CC)C2)CC');
    });

    it("no changes", function () {
        let result = Graph.removeUnnecessaryNumbers('N(C(C=O)CC7=CC=C(C=C7)N(C)C)C');
        expect(result).toEqual('N(C(C=O)CC7=CC=C(C=C7)N(C)C)C');
    });

    it("no changes 2", function () {
        let result = Graph.removeUnnecessaryNumbers('N3CC(=CCC3C=O)CN6CCOCC6');
        expect(result).toEqual('N3CC(=CCC3C=O)CN6CCOCC6');
    });

    it("no changes 3", function () {
        let result = Graph.removeUnnecessaryNumbers('NC(C=O)C5=CC=CC=C5');
        expect(result).toEqual('NC(C=O)C5=CC=CC=C5');
    });

    it("no changes 4", function () {
        let result = Graph.removeUnnecessaryNumbers('OC(C(C=O)N)C');
        expect(result).toEqual('OC(C(C=O)N)C');
    });

    it("test with null", function () {
        let result = Graph.removeUnnecessaryNumbers(null);
        expect(result).toEqual('');
    });

    it("test with empty string", function () {
        let result = Graph.removeUnnecessaryNumbers('');
        expect(result).toEqual('');
    });



});
