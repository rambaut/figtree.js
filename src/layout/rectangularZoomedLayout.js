import {mean} from "d3-array";
import {getClassesFromNode} from "./layoutHelpers";

export const rectangularZoomedLayout = (node)=>figtree=>{
    let currentY = 0;

    const id = figtree.id;

    const traverse = function (node, siblingPositions = []) {
        const myChildrenPositions = [];

        if (!node[id].ignore) {
            let yPos;
            if (node.children) {

                if(node[id].collapsed){
                    yPos = (currentY +=1);
                }else{
                    for (const child of node.children) {
                        traverse(child, myChildrenPositions);
                    }
                    yPos = mean(myChildrenPositions);
                }
            } else {
                yPos = (currentY += 1);
                siblingPositions.push(currentY);
            }
            siblingPositions.push(yPos);
            node[id].x = node.divergence;
            node[id].y = yPos;
            node[id].classes = getClassesFromNode(node);
        }
    }
    traverse(node);
}

