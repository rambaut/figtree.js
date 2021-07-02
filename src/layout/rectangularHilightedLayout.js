import {mean} from "d3";
import {getClassesFromNode, layoutFactory, makeVertexFromNode} from "./layoutHelpers";
/**
 *
 * This layout highlights parts of the tree and compresses others. The layout factory takes a predicate function that is called
 * on each node and returns true or false. true == more space around node.
 * @param predicate - {Function} a function (node)=> boolean. True == more space around the node.
 * @param compressionFactor - factor to compress space around node that are not highlighted. 1 = no compression 0=no space.
 * @returns {Function}
 */

export function rectangularHilightedLayout(predicate,compressionFactor) {
    return function helper(figtree)
    {
        let currentY = 0;
        let previousTip=null;
        const id = figtree.id;
        const tree = figtree.tree();

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

                    if (previousTip !== null && (predicate(previousTip) || predicate(node))) {
                        yPos =(currentY += 1);
                    } else {
                        yPos = (currentY += compressionFactor);
                    }
                    previousTip = node;
                }
                siblingPositions.push(yPos);
                node[id].x = node.divergence;
                node[id].y = yPos;
                node[id].classes = getClassesFromNode(node);
            }
        };

        traverse(tree.root);
    }
}

