import {mean} from "d3-array";
import {layoutFactory, makeVertexFromNode} from "./layoutHelpers";


export function rectangularVertices(tree){
    let currentY=0;
    let angel=0;
    let allocatedRadians = [0, 2 * Math.PI];

    const traverse = function(node,siblingPositions=[]){
        const myChildrenPositions=[];

        if(node.children){

            for(const child of node.children){
                traverse(child,myChildrenPositions);
            }
            siblingPositions.push(mean(myChildrenPositions));
            const vertex = {...makeVertexFromNode(node),
                y:mean(myChildrenPositions),
                x:node.height};
            vertices.push(vertex);
        }else{
            currentY+=1;
            siblingPositions.push(currentY);
            const vertex = {...makeVertexFromNode(node), y:currentY, x:node.height};
            vertices.push(vertex);
        }
    };

    traverse(tree.rootNode);
    //slow!
    return vertices;
}


export const rectangularLayout = layoutFactory(rectangularVertices);