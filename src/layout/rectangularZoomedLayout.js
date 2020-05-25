import {mean} from "d3-array";
import {layoutFactory, makeVertexFromNode} from "./layoutHelpers";
import {rectangularVertices} from "./rectangularLayout.f";

export const zoomedVertices = (node)=>tree=>{
    let currentY=0;
    const vertices=[];

    const traverse = function(node,siblingPositions=[]){
        const myChildrenPositions=[];

        if(node.children){

            for(const child of node.children){
                traverse(child,myChildrenPositions);
            }
            siblingPositions.push(mean(myChildrenPositions));
            const vertex = {...makeVertexFromNode(node),
                y:mean(myChildrenPositions),
                x:node.divergence};
            vertices.push(vertex);
        }else{
            currentY+=1;
            siblingPositions.push(currentY);
            const vertex = {...makeVertexFromNode(node), y:currentY, x:node.divergence};
            vertices.push(vertex);
        }
    };

    traverse(node);
    console.log(vertices)
    return vertices;
}

export const rectangularZoomedLayout = (node)=>layoutFactory(zoomedVertices(node));