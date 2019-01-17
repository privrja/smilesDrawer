const Graph = require('../src/Graph');

describe("Build SMILES test", function () {
    it("Test remove all from stack to left brace", function () {
        let stack = ["N", "C", "(", "C", "(", "C", ")", "(", "C"];
        let stackResult = ["N", "C", "(", "C", "(", "C", ")"];
        Graph.removeAllFromStackToFirstLeftBrace(stack);
        expect(stack).toEqual(stackResult);
    });

    it("Test remove all from stack to left brace - no bracket", function () {
        let stack = ["N", "C", "=", "O"];
        Graph.removeAllFromStackToFirstLeftBrace(stack);
        expect(stack).toEqual([]);
    });

    it("Test remove all from stack to left brace - empty stack", function () {
        let stack = [];
        Graph.removeAllFromStackToFirstLeftBrace(stack);
        expect(stack).toEqual([]);
    });

    it("Test remove all from stack to left brace - many (", function () {
        let stack = ["C", "(", "(", "("];
        Graph.removeAllFromStackToFirstLeftBrace(stack);
        expect(stack).toEqual(["C", "(", "("]);
    });

    it("Test check stack - add )", function () {
        let stack = ["C", "(", "C", "O"];
        Graph.checkStack(stack);
        expect(stack).toEqual(["C", "(", "C", "O", ")"]);
    });

    it("Test check stack - removing on =", function () {
        let stack = ["C", "(", "C", "O", ")", "(", "="];
        Graph.checkStack(stack);
        expect(stack).toEqual(["C", "(", "C", "O", ")"]);
    });

    it("Test check stack - removing on (", function () {
        let stack = ["C", "(", "C", "O", ")", "("];
        Graph.checkStack(stack);
        expect(stack).toEqual(["C", "(", "C", "O", ")"]);
    });

    it("Test check stack - removing on #", function () {
        let stack = ["C", "(", "C", "O", ")", "(", "#"];
        Graph.checkStack(stack);
        expect(stack).toEqual(["C", "(", "C", "O", ")"]);
    });

    it("Test remove unnecessary parentheses", function () {
        let stack = "N(C(C(=O))C)".split("");
        expect(Graph.removeUnnecessaryParentheses(stack)).toEqual("NC(C=O)C".split(""));
    });

    it("Test remove unnecessary parentheses 2 case", function () {
        let stack = "N(C(C(=O))(C(C(C)(C))))(C)".split("");
        expect(Graph.removeUnnecessaryParentheses(stack)).toEqual("N(C(C=O)CC(C)C)C".split(""));
    });

    it("Test remove unnecessary parentheses 3 case", function () {
        let stack = "C(C(C(C)C))C".split("");
        expect(Graph.removeUnnecessaryParentheses(stack)).toEqual("C(CC(C)C)C".split(""));
    });

    it("Test remove unnecessary parentheses 4 case - no change", function () {
        let stack = "CCC(C)(C)C=O(C=O)C(=O)CC".split("");
        expect(Graph.removeUnnecessaryParentheses(stack)).toEqual("CCC(C)(C)C=O(C=O)C(=O)CC".split(""));
    });

    it("Test remove unnecessary parentheses 5 case - no change with [] parentheses", function () {
        let stack = "CCC(C)(C)C=O(C=O)[Fe]C(=O)CC".split("");
        expect(Graph.removeUnnecessaryParentheses(stack)).toEqual("CCC(C)(C)C=O(C=O)[Fe]C(=O)CC".split(""));
    });

    it("Test remove unnecessary parentheses 6 case - change with [] parentheses", function () {
        let stack = "CC(C(=O))([Fe])".split("");
        expect(Graph.removeUnnecessaryParentheses(stack)).toEqual("CC(C=O)[Fe]".split(""));
    });

    it("Test remove unnecessary parentheses 7 case - change with [] parentheses and #", function () {
        let stack = "CC(C(=O))([Fe+]CC(=O)C(CC)(#C))".split("");
        expect(Graph.removeUnnecessaryParentheses(stack)).toEqual("CC(C=O)[Fe+]CC(=O)C(CC)#C".split(""));
    });

    it("Test remove unnecessary parentheses 8 case - 3 parentheses )))", function () {
        let stack = "CC(C(=O))([Fe+]CC(=O)C(CC)(#C(C)))".split("");
        expect(Graph.removeUnnecessaryParentheses(stack)).toEqual("CC(C=O)[Fe+]CC(=O)C(CC)#CC".split(""));
    });

    it("Test remove unnecessary parentheses 9 case - 4 parentheses ))))", function () {
        let stack = "CC(C(=O))([Fe+]CC(=O)C(CC)(#C(CC(C))))".split("");
        expect(Graph.removeUnnecessaryParentheses(stack)).toEqual("CC(C=O)[Fe+]CC(=O)C(CC)#CCCC".split(""));
    });

    it("Test remove unnecessary parentheses 10 case []", function () {
        let stack = [];
        expect(Graph.removeUnnecessaryParentheses(stack)).toEqual([]);
    });

    it("Test remove unnecessary parentheses 11", function () {
        let stack = "CCC(CC)(C)".split("");
        expect(Graph.removeUnnecessaryParentheses(stack)).toEqual("CCC(CC)C".split(""));
    });

    it("Test remove unnecessary parentheses 12", function () {
        let stack = "C(=O)C(C(C))".split("");
        expect(Graph.removeUnnecessaryParentheses(stack)).toEqual("C(=O)CCC".split(""));
    });

});