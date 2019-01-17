const SmilesDrawer = require('../app');

const CYCLOSPORINE = 'CCC1C(=O)N(CC(=O)N(C(C(=O)NC(C(=O)N(C(C(=O)NC(C(=O)NC(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N1)C(C(C)CC=CC)O)C)C(C)C)C)CC(C)C)C)CC(C)C)C)C)C)CC(C)C)C)C(C)C)CC(C)C)C)C';
const PSEUDACYCLIN_A = 'CCC(C)C(NC(C)=O)C(=O)NC2CCCNC(=O)C(NC(=O)C(NC(=O)C3CCCN3(C(=O)C(Cc1ccccc1)NC2(=O)))C(C)CC)C(C)CC';
const ROSEOTOXIN_A = 'CCC(C)C1NC(=O)C2C(C)CCN2(C(=O)C(CC(C)C)OC(=O)CCNC(=O)C(C)N(C)C(=O)C(C(C)C)N(C)C1(=O))';
const NEAMPHAMIDE_A = 'CC1C(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)N(C(C(=O)NC(C(=O)NC(C(=O)N2CCCCC2C(=O)O1)CC(=O)N)C(C3=CC=C(C=C3)O)OC)CCC(=O)N)C)CC(C)C)CCCN=C(N)N)C(C)O)NC(=O)C(C(C)C(C)C(=O)N)NC(=O)C(C(C(CCCN=C(N)N)NC(=O)C(CC(=O)N)NC(=O)C(C)C(C(C)CC(C)C)O)O)O';
const VALINOMYCIN = 'CC1C(=O)NC(C(=O)OC(C(=O)NC(C(=O)OC(C(=O)NC(C(=O)OC(C(=O)NC(C(=O)OC(C(=O)NC(C(=O)OC(C(=O)NC(C(=O)O1)C(C)C)C(C)C)C(C)C)C)C(C)C)C(C)C)C(C)C)C)C(C)C)C(C)C)C(C)C';
const TIMNODONYL_COA = 'CC/C=C\\C/C=C\\C/C=C\\C/C=C\\C/C=C\\CCCC(=O)SCCNC(=O)CCNC(=O)[C@H](O)C(C)(C)COP(O)(=O)OP(O)(=O)OC[C@H]1O[C@H](C(O)[C@H]1OP(O)(O)=O)N2C=NC3=C2N=CN=C3N';
const BEAUVEROLIDE_H = 'CCCCCCC1CC(=O)NC(C(=O)NC(C(=O)NC(C(=O)O1)CC(C)C)C)CC2=CC=CC=C2';
const VALINEGRAMICIDIN_C = 'CC(C)CC(C(=O)NC(C)C(=O)NC(C(C)C)C(=O)NC(C(C)C)C(=O)NC(C(C)C)C(=O)NC(CC1=CNC2=CC=CC=C21)C(=O)NC(CC(C)C)C(=O)NC(CC3=CC=C(C=C3)O)C(=O)NC(CC(C)C)C(=O)NC(CC4=CNC5=CC=CC=C54)C(=O)NC(CC(C)C)C(=O)NC(CC6=CNC7=CC=CC=C76)C(=O)NCCO)NC(=O)C(C)NC(=O)CNC(=O)C(C(C)C)NC=O';

describe("blocks", function () {
    let smilesDrawer = new SmilesDrawer.Drawer({drawDecayPoints: true});

    it("cyclosporine", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(CYCLOSPORINE), 'output-canvas', 'light', true);
        expect(smilesDrawer.graph.decays.length).toEqual(11);
    });

    it("pseudacyclin A", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(PSEUDACYCLIN_A), 'output-canvas', 'light', true);
        expect(smilesDrawer.graph.decays.length).toEqual(7);
    });

    it("roseotoxin A", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(ROSEOTOXIN_A), 'output-canvas', 'light', true);
        expect(smilesDrawer.graph.decays.length).toEqual(6);
    });

    it("neaphamide A", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(NEAMPHAMIDE_A), 'output-canvas', 'light', true);
        expect(smilesDrawer.graph.decays.length).toEqual(16);
    });

    it("valinomycin", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(VALINOMYCIN), 'output-canvas', 'light', true);
        expect(smilesDrawer.graph.decays.length).toEqual(12);
    });

    it("timnodonyl CoA", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(TIMNODONYL_COA), 'output-canvas', 'light', true);
        expect(smilesDrawer.graph.decays.length).toEqual(2);
    });

    it("beauverolide H", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(BEAUVEROLIDE_H), 'output-canvas', 'light', true);
        expect(smilesDrawer.graph.decays.length).toEqual(4);
    });

    it("valinegramicidin C", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(VALINEGRAMICIDIN_C), 'output-canvas', 'light', true);
        expect(smilesDrawer.graph.decays.length).toEqual(16);
    });

    it("cyclosporine blocks", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(CYCLOSPORINE), 'output-canvas', 'light', true);
        smilesDrawer.buildBlockSmiles();
    });

});
