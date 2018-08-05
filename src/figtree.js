import {Tree} from './tree';

const newickString = `((((((virus1:0.1 ,virus2:0.12):0.08,(virus3:0.011,virus4:0.0087):0.15):0.03,virus5:0.21):0.2,(virus6:0.45,virus7:0.4):0.02):0.1,virus8:0.4):0.1,(virus9:0.04,virus10:0.03):0.6);`;

const tree = Tree.parseNewick(newickString);

const newNewick = tree.toNewick();

console.log(newickString);
console.log(newNewick);
console.log();
console.log(`All nodes: ${tree.nodes.length}`);
console.log(`External nodes: ${tree.externalNodes.length}`);
console.log(`External nodes: ${tree.externalNodes.map(node => node.name).join(", ")}`);
console.log(`Internal nodes: ${tree.internalNodes.length}`);

console.log(`All nodes: ${[...tree.preorder()].map(node => node.name ? node.name : "node").join(", ")}`);
console.log(`All nodes: ${[...tree.postorder()].map(node => node.name ? node.name : "node").join(", ")}`);

tree.rotate(tree.rootNode, true);
console.log(`Rotated: ${tree.toNewick()}`);

tree.order(tree.rootNode, true);
console.log(`Increasing: ${tree.toNewick()}`);

tree.order(tree.rootNode, false);
console.log(`Decreasing: ${tree.toNewick()}`);

tree.reroot(tree.externalNodes[0]);
console.log(`Rerooted: ${tree.toNewick()}`);

const tree2 = Tree.parseNewick("(((tip1:0.1,tip2:0.2)x:0.3,tip3:0.4)y:0.5,(tip4:0.6,tip5:0.7)z:0.8)r;");
console.log(`OriginL: ${tree2.toNewick()}`);

tree2.reroot(tree2.externalNodes[0]);
console.log(`Rerooted: ${tree2.toNewick()}`);

