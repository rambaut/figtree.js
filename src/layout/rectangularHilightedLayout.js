import {mean} from "d3";
import {layoutFactory, makeVertexFromNode} from "./layoutHelpers";
import {rectangularVertices} from "./rectangularLayout.f";
import {equalAngleVertices} from "./equaleanglelayout.f";




export function rectangularVerticesHighlight(predicate,compressionFactor) {
    return function rectangularHighlightedLayout(tree)
    {
        let currentY = 0;
        const vertices = [];
        let previousTip=null;

        const traverse = function (node, siblingPositions = []) {
            const myChildrenPositions = [];

            if (node.children) {

                for (const child of node.children) {
                    traverse(child, myChildrenPositions);
                }
                siblingPositions.push(mean(myChildrenPositions));
                const vertex = {
                    ...makeVertexFromNode(node),
                    y: mean(myChildrenPositions),
                    x: node.divergence
                };
                vertices.push(vertex);
            } else {
                if(previousTip!==null &&(predicate(previousTip)|| predicate(node))){
                    currentY += 1;
                }
                else{
                    currentY+=compressionFactor;
                }
                previousTip=node;
                siblingPositions.push(currentY);
                const vertex = {...makeVertexFromNode(node), y: currentY, x: node.divergence};
                vertices.push(vertex);
            }
        };

        traverse(tree.rootNode);
        //slow!
        return vertices;
    }
}

/**
 *
 * This layout highlights parts of the tree and compresses others. The layout factory takes a predicate function that is called
 * on each node and returns true or false. true == more space around node.
 * @param predicate - {Function} a function (node)=> boolean. True == more space around the node.
 * @param compressionFactor - factor to compress space around node that are not highlighted. 1 = no compression 0=no space.
 * @returns {Function}
 */
export const rectangularHilightedLayout=(predicate, compressionFactor) => layoutFactory(rectangularVerticesHighlight(predicate,compressionFactor));
