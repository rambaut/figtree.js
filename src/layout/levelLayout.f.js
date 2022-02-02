import {mean} from "d3";
import { rollups } from "d3-array";
import {getClassesFromNode} from "./layoutHelpers";


export function levelLayout(figtree) {
    const id = figtree.id;
    const tree = figtree.tree();

    const levelOrderTraversal = rollups(tree.nodeList,v=>v,n=>n.level).map(d=>d[1]);
    const bottom = tree.nodeList.length;
    levelOrderTraversal.forEach(level => {
        let i=0;
        for (const node of level) {
            const leftLabel= !!node.children;
            const labelBelow= (!!node.children && (!node.parent || node.parent.children[0] !== node));

            node[id].x = node.divergence;
            node[id].y = i;
            node[id].classes = getClassesFromNode(node);

            node[id].textLabel={
                labelBelow,
                x:leftLabel?"-6":"12",
                y:leftLabel?(labelBelow ? "-8": "8" ):"0",
                alignmentBaseline: leftLabel?(labelBelow ? "bottom": "hanging" ):"middle",
                textAnchor:leftLabel?"end":"start",
            }
            i+=1;
        } 
    });
}

