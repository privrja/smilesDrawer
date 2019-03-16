const SmilesDrawer = require('../app');

const CYCLOSPORINE_A = 'CCC1C(=O)N(CC(=O)N(C(C(=O)NC(C(=O)N(C(C(=O)NC(C(=O)NC(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N1)C(C(C)CC=CC)O)C)C(C)C)C)CC(C)C)C)CC(C)C)C)C)C)CC(C)C)C)C(C)C)CC(C)C)C)C';
const CYCLOSPORINE_B = 'CC=CCC(C)C(C1C(=O)NC(C(=O)N(CC(=O)N(C(C(=O)NC(C(=O)N(C(C(=O)NC(C(=O)NC(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N1C)C(C)C)C)CC(C)C)C)CC(C)C)C)C)C)CC(C)C)C)C(C)C)CC(C)C)C)C)C)O';
const PSEUDACYCLIN_A = 'CCC(C)C(NC(C)=O)C(=O)NC2CCCNC(=O)C(NC(=O)C(NC(=O)C3CCCN3(C(=O)C(Cc1ccccc1)NC2(=O)))C(C)CC)C(C)CC';
const ROSEOTOXIN_A = 'CCC(C)C1NC(=O)C2C(C)CCN2(C(=O)C(CC(C)C)OC(=O)CCNC(=O)C(C)N(C)C(=O)C(C(C)C)N(C)C1(=O))';
const NEAMPHAMIDE_A = 'CC1C(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)N(C(C(=O)NC(C(=O)NC(C(=O)N2CCCCC2C(=O)O1)CC(=O)N)C(C3=CC=C(C=C3)O)OC)CCC(=O)N)C)CC(C)C)CCCN=C(N)N)C(C)O)NC(=O)C(C(C)C(C)C(=O)N)NC(=O)C(C(C(CCCN=C(N)N)NC(=O)C(CC(=O)N)NC(=O)C(C)C(C(C)CC(C)C)O)O)O';
const VALINOMYCIN = 'CC1C(=O)NC(C(=O)OC(C(=O)NC(C(=O)OC(C(=O)NC(C(=O)OC(C(=O)NC(C(=O)OC(C(=O)NC(C(=O)OC(C(=O)NC(C(=O)O1)C(C)C)C(C)C)C(C)C)C)C(C)C)C(C)C)C(C)C)C)C(C)C)C(C)C)C(C)C';
const TIMNODONYL_COA = 'CC/C=C\\C/C=C\\C/C=C\\C/C=C\\C/C=C\\CCCC(=O)SCCNC(=O)CCNC(=O)[C@H](O)C(C)(C)COP(O)(=O)OP(O)(=O)OC[C@H]1O[C@H](C(O)[C@H]1OP(O)(O)=O)N2C=NC3=C2N=CN=C3N';
const BEAUVEROLIDE_H = 'CCCCCCC1CC(=O)NC(C(=O)NC(C(=O)NC(C(=O)O1)CC(C)C)C)CC2=CC=CC=C2';
const VALINEGRAMICIDIN_C = 'CC(C)CC(C(=O)NC(C)C(=O)NC(C(C)C)C(=O)NC(C(C)C)C(=O)NC(C(C)C)C(=O)NC(CC1=CNC2=CC=CC=C21)C(=O)NC(CC(C)C)C(=O)NC(CC3=CC=C(C=C3)O)C(=O)NC(CC(C)C)C(=O)NC(CC4=CNC5=CC=CC=C54)C(=O)NC(CC(C)C)C(=O)NC(CC6=CNC7=CC=CC=C76)C(=O)NCCO)NC(=O)C(C)NC(=O)CNC(=O)C(C(C)C)NC=O';
const XXX = 'CCCCC(C(NC5CC(NCCCCC(NC(C(NC(C(NC(C(NC(C(NC5=O)Cc4nc[nH]c4)=O)Cc3ccccc3)=O)CCCNC(N)=N)=O)Cc(c[nH]2)c1c2cccc1)=O)C(O)=O)=O)=O)NC(C)=O';
const LINEARIZED_PSEUDACYCLIN_A = 'C(CCC(NC(=O)C(NC(=O)C)C(C)CC)C(=O)NC(CC1=CC=CC=C1)C(O)=O)NC(=O)C(C(CC)C)NC(=O)C(C(CC)C)NC(=O)C1CCCN1';
const PYOVERDIN_PA_A = 'CC(C1C(=O)NC(C(=O)NCCCCC(C(=O)NC(C(=O)N1)CCCN(C=O)O)NC(=O)C(CCCN(C=O)O)NC(=O)C(CO)NC(=O)C(CCCN=C(N)N)NC(=O)C(CO)NC(=O)C2CCNC3=C(C=C4C=C(C(=O)C=C4N23)O)NC(=O)CCC(=O)O)C(C)O)O';
const MICAFUNGIN = 'CCCCCOC1=CC=C(C=C1)C2=CC(=NO2)C3=CC=C(C=C3)C(=O)NC4CC(C(NC(=O)C5C(C(CN5C(=O)C(NC(=O)C(NC(=O)C6CC(CN6C(=O)C(NC4=O)C(C)O)O)C(C(C7=CC(=C(C=C7)O)OS(=O)(=O)O)O)O)C(CC(=O)N)O)C)O)O)O';

describe("blocks", function () {
    let smilesDrawer = new SmilesDrawer.Drawer({drawDecayPoints: true});

    it("cyclosporine", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(CYCLOSPORINE_A), 'output-canvas', 'light', true);
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

    it("cyclosporine A blocks", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(CYCLOSPORINE_A), 'output-canvas', 'light', true);
        let result = smilesDrawer.buildBlockSmiles();
        let expected = [
            [
                'OC(C(CC)N)=O',
                'N(CC(=O)O)C',
                'N(C(C(=O)O)CC(C)C)C',
                'NC(C(=O)O)C(C)C',
                'N(C(C(=O)O)CC(C)C)C',
                'NC(C(=O)O)C',
                'NC(C(=O)O)C',
                'N(C(C(=O)O)CC(C)C)C',
                'N(C(C(=O)O)CC(C)C)C',
                'N(C(C(=O)O)C(C)C)C',
                'N(C(C(=O)O)C(C(C)CC=CC)O)C'
            ],
            '[0]-[10]-[9]-[8]-[7]-[6]-[5]-[4]-[3]-[2]-[1]',
            'cyclic'
        ];
        expect(result).toEqual(expected);
    });

    it("cyclosporine B blocks", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(CYCLOSPORINE_B), 'output-canvas', 'light', true);
        let result = smilesDrawer.buildBlockSmiles();
        let expected = [
            [
                'OC(C(C(C(CC=CC)C)O)NC)=O',
                'NC(C(=O)O)C',
                'N(CC(=O)O)C',
                'N(C(C(=O)O)CC(C)C)C',
                'NC(C(=O)O)C(C)C',
                'N(C(C(=O)O)CC(C)C)C',
                'NC(C(=O)O)C',
                'NC(C(=O)O)C',
                'N(C(C(=O)O)CC(C)C)C',
                'N(C(C(=O)O)CC(C)C)C',
                'N(C(C(=O)O)C(C)C)C'
            ],
            '[0]-[10]-[9]-[8]-[7]-[6]-[5]-[4]-[3]-[2]-[1]',
            'cyclic'
        ];
        expect(result).toEqual(expected);
    });

    it("Valinomicine blocks", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(VALINOMYCIN), 'output-canvas', 'light', true);
        let result = smilesDrawer.buildBlockSmiles();
        let expected = [
            [
                'OC(C(C)O)=O',
                'NC(C(=O)O)C(C)C',
                'OC(C(=O)O)C(C)C',
                'NC(C(=O)O)C(C)C',
                'OC(C(=O)O)C',
                'NC(C(=O)O)C(C)C',
                'OC(C(=O)O)C(C)C',
                'NC(C(=O)O)C(C)C',
                'OC(C(=O)O)C',
                'NC(C(=O)O)C(C)C',
                'OC(C(=O)O)C(C)C',
                'NC(C(=O)O)C(C)C'
            ],
            '[0]-[11]-[10]-[9]-[8]-[7]-[6]-[5]-[4]-[3]-[2]-[1]',
            'cyclic'
        ];
        expect(result).toEqual(expected);
    });

    it("Pseudocaclin blocks", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(PSEUDACYCLIN_A), 'output-canvas', 'light', true);
        let result = smilesDrawer.buildBlockSmiles();
        let expected = [
            [
                'NC(C(CC)C)C(=O)O',
                'OC(C)=O',
                'NC(CCCN)C(O)=O',
                'OC(=O)C(N)C(C)CC',
                'OC(=O)C(N)C(C)CC',
                'OC(=O)C1CCCN1',
                'OC(=O)C(Cc1ccccc1)N'
            ],
            '\\([2]-[0]-[1]\\)[3]-[4]-[5]-[6]',
            'branch-cyclic'
        ];
        expect(result).toEqual(expected);
    });

    it("XXx blocks", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(XXX), 'output-canvas', 'light', true);
        let result = smilesDrawer.buildBlockSmiles();
        let expected = [
            [
                'NC(C(O)=O)Cc1nc[nH]c1',
                'OC(=O)C(N)CC(O)=O',
                'NC(C(O)=O)Cc1ccccc1',
                'NC(C(O)=O)CCCNC(N)=N',
                'NC(C(O)=O)Cc1c[nH]c2c1cccc2',
                'NC(CCCCN)C(O)=O',
                'O',
                'OC(C(CCCC)N)=O',
                'OC(C)=O',
            ],
            '[0]-[2]-[3]-[4]\\([5]-[6]\\)\\([1]-[7]-[8]\\)',
            'other'
        ];
        expect(result).toEqual(expected);
    });

    it("Linearized pseudacyclin A blocks", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(LINEARIZED_PSEUDACYCLIN_A), 'output-canvas', 'light', true);
        let result = smilesDrawer.buildBlockSmiles();
        let expected = [
            [
                'NC(CCCN)C(=O)O',
                'OC(=O)C(N)C(C)CC',
                'OC(=O)C',
                'NC(CC1=CC=CC=C1)C(O)=O',
                'O',
                'OC(=O)C(C(CC)C)N',
                'OC(=O)C(C(CC)C)N',
                'OC(=O)C1CCCN1',
            ],
            '[2]-[1]\\([0]-[5]-[6]-[7]\\)[3]-[4]',
            'branched'
        ];
        expect(result).toEqual(expected);
    });

    it("Pyoverdin Pa A blocks", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(PYOVERDIN_PA_A), 'output-canvas', 'light', true);
        let result = smilesDrawer.buildBlockSmiles();
        let expected = [
            [
                'OC(C(C(C)O)N)=O',
                'NC(C(=O)O)C(C)O',
                'NCCCCC(C(=O)O)N',
                'NC(C(=O)O)CCCNO',
                'OC=O',
                'OC(=O)C(CCCNO)N',
                'OC=O',
                'OC(=O)C(CO)N',
                'OC(=O)C(CCCN=C(N)N)N',
                'OC(=O)C(CO)N',
                'OC(=O)C2CCNC1=C(C=C3C=C(C(=O)C=C3N12)O)N',
                'OC(=O)CCC(=O)O',
                'O'
            ],
            '[0]\\([3]-[4]\\)\\([2]\\([5]-[6]\\)[7]-[8]-[9]-[10]-[11]-[12]-[1]',
            'other'
        ];
        expect(result).toEqual(expected);
    });

    it("Micafungin blocks", function () {
        //problem with double bond in ring
        smilesDrawer.draw(SmilesDrawer.Parser.parse(MICAFUNGIN), 'output-canvas', 'light', true);
        let result = smilesDrawer.buildBlockSmiles();
        let expected = [
            [
                'OC(C3=CC=C(C2C=C(C1=CC=C(OCCCCC)C=C1)ON=2)C=C3)=O',
                'NC(CC(C(N)O)O)C(O)=O',
                'OC(=O)C1C(C(CN1)C)O',
                'OC(=O)C(N)C(CC(=O)O)O',
                'OC(=O)C(N)C(C(C1=CC(=C(C=C1)O)OS(=O)(=O)O)O)O',
                'OC(=O)C1CC(CN1)O',
                'OC(=O)C(N)C(C)O',
                'N'
            ],
            '\\([1]-[0]\\)[2]\\([3]-[7]\\)[4]-[5]-[6]',
            'other'
        ];
        expect(result).toEqual(expected);
    });

    it("Valinegramicidin blocks", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(VALINEGRAMICIDIN_C), 'output-canvas', 'light', true);
        let result = smilesDrawer.buildBlockSmiles();
        let expected = [
            [
                'OC(C(CC(C)C)N)=O',
                'NC(C)C(=O)O',
                'NC(C(C)C)C(=O)O',
                'NC(C(C)C)C(=O)O',
                'NC(C(C)C)C(=O)O',
                'NC(CC2=CNC1=CC=CC=C12)C(=O)O',
                'NC(CC(C)C)C(=O)O',
                'NC(CC1=CC=C(C=C1)O)C(=O)O',
                'NC(CC(C)C)C(=O)O',
                'NC(CC2=CNC1=CC=CC=C12)C(=O)O',
                'NC(CC(C)C)C(=O)O',
                'NC(CC2=CNC1=CC=CC=C12)C(=O)O',
                'NCCO',
                'OC(=O)C(C)N',
                'OC(=O)CN',
                'OC(=O)C(C(C)C)N',
                'OC=O'
            ],
            '[12]-[11]-[10]-[9]-[8]-[7]-[6]-[5]-[4]-[3]-[2]-[1]-[0]-[13]-[14]-[15]-[16]',
            'linear'
        ];
        expect(result).toEqual(expected);
    });

    it("Beauverolide H blocks", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(BEAUVEROLIDE_H), 'output-canvas', 'light', true);
        let result = smilesDrawer.buildBlockSmiles();
        let expected = [
            [
                'OC(CC(CCCCCC)O)=O',
                'NC(C(=O)O)CC1=CC=CC=C1',
                'NC(C(=O)O)C',
                'NC(C(=O)O)CC(C)C',
            ],
            '[0]-[3]-[2]-[1]',
            'cyclic'
        ];
        expect(result).toEqual(expected);
    });

    it("Timnodonyl COA blocks", function () {
        smilesDrawer.draw(SmilesDrawer.Parser.parse(TIMNODONYL_COA), 'output-canvas', 'light', true);
        let result = smilesDrawer.buildBlockSmiles();
        let expected = [
            [
                'NCCSC(CCCC=CCC=CCC=CCC=CCC=CCC)=O',
                'OC(=O)CCN',
                'OC(=O)[CH](O)C(C)(C)COP(O)(=O)OP(O)(=O)OC[CH]1O[CH](C(O)[CH]1OP(O)(O)=O)N3C=NC2=C3N=CN=C2N'
            ],
            '[0]-[1]-[2]',
            'linear'
        ];
        expect(result).toEqual(expected);
    });

});
