import {mean} from "d3";
import {getClassesFromNode} from "./layoutHelpers";


export function reverseNunoLayout(figtree) {
    let currentX = 0;

    const id = figtree.id;
    const tree = figtree.tree();

    const traverse = function (node, siblingPositions = []) {
        const myChildrenPositions = [];
        if(!node[id]){
            console.log(node)
        }
        if (!node[id].ignore) {
            let xPos;
            if (node.children) {

                if(node[id].collapsed){
                    xPos = (currentX +=1);
                }else{
                    for (const child of node.children) {
                        traverse(child, myChildrenPositions);
                    }
                    xPos = mean(myChildrenPositions);
                }
            } else {
                xPos = (currentX += 1);
                siblingPositions.push(currentX);
            }

            siblingPositions.push(xPos);

            const leftLabel= !!node.children;
            const labelBelow= (!!node.children && (!node.parent || node.parent.children[0] !== node));

            node[id].y = node.divergence;
            node[id].x = xPos;
            node[id].classes = getClassesFromNode(node);

            node[id].textLabel={
                labelBelow,
                    x:leftLabel?"-6":"12",
                    y:leftLabel?(labelBelow ? "-8": "8" ):"0",
                    alignmentBaseline: leftLabel?(labelBelow ? "bottom": "hanging" ):"middle",
                    textAnchor:leftLabel?"end":"start",
            }
        }
    }

    traverse(tree.root);
}

