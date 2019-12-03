import {layout} from "../src/layout/rectangularLayout.f"
import {Tree} from "../src/Tree.js"

const newickString = `((((((virus1:0.1 ,virus2:0.12):0.08,(virus3:0.011,virus4:0.0087):0.15):0.03,virus5:0.21):0.2,(virus6:0.45,virus7:0.4):0.02):0.1,virus8:0.4):0.1,(virus9:0.04,virus10:0.03):0.6);`;
const tree = Tree.parseNewick(newickString);


const x = layout(tree.root);




