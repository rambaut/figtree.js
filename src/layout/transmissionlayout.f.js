import {mean} from "d3";
import {getClassesFromNode} from "./layoutHelpers";

export function transmissionLayout(figtree){
    let currentY = 0;

    const id = figtree.id;
    const tree = figtree.tree();

    const traverse = function (node,) {
        const myChildrenPositions = [];
        if(!node[id]){
            console.log(node)
        }
        if (!node[id].ignore) {
            let yPos;
            if (node.children) {

                if(node[id].collapsed){
                    yPos = (currentY +=1);
                }else{
                    for (const child of node.children) {
                        myChildrenPositions.push(traverse(child));
                    }
                    yPos = myChildrenPositions[0];
                }
            } else {                
                yPos = (currentY += 1);
            }

            const leftLabel= !!node.children;
            const labelBelow= (!!node.children && (!node.parent || node.parent.children[0] !== node));

            node[id].x = node.divergence;
            node[id].y = yPos;
            node[id].classes = getClassesFromNode(node);

            node[id].textLabel={
                labelBelow,
                    x:leftLabel?"-6":"12",
                    y:leftLabel?(labelBelow ? "-8": "8" ):"0",
                    alignmentBaseline: leftLabel?(labelBelow ? "bottom": "hanging" ):"middle",
                    textAnchor:leftLabel?"end":"start",
            }
            return yPos;
        }
    }

    traverse(tree.root);
}

