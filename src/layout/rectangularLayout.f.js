import {mean} from "d3";
import {Type} from "../tree";


function setVertexClassesFromNode (v){
    v.classes = [(!v.node.children ? "external-node" : "internal-node")];
    const tree = v.node.tree;
    if (v.node.annotations) {
        v.classes = [
            ...v.classes,
            ...Object.entries(v.node.annotations)
                .filter(([key]) => {
                    return tree.annotations[key] &&
                        (tree.annotations[key].type === Type.DISCRETE ||
                            tree.annotations[key].type === Type.BOOLEAN ||
                            tree.annotations[key].type === Type.INTEGER);
                })
                .map(([key, value]) => `${key}-${value}`)];
    }
    return v;
}
function makeVerticesFromNode(node){
            const vertex = {
                node: node,
                key: node.id,
                degree : (node.children ? node.children.length + 1 : 1) ,// the number of edges (including stem)
                id :node.id,
                leftLabel:!!node.children,
                labelBelow:(!!node.children&&(!node.parent || node.parent.children[0] !== node))
            };
            //update classes as needed.
            return setVertexClassesFromNode(vertex);
}


export function rectangularVertices(tree){
    let currentY=0;

    const traverse = function*(node,siblingPositions=[]){
        const myChildrenPositions=[];

        if(node.children){

            for(const child of node.children){
                yield* traverse(child,myChildrenPositions);
            }
            siblingPositions.push(mean(myChildrenPositions));
            const vertex = {...makeVerticesFromNode(node),
                y:mean(myChildrenPositions),
                x:node.height};
            yield vertex;

        }else{
            currentY+=1;
            siblingPositions.push(currentY);
            const vertex = {...makeVerticesFromNode(node), y:currentY, x:node.height};
            yield vertex;
        }
    };
    return [...traverse(tree.rootNode)];
}

export function makeEdges(vertices){

    const nodeMap = new Map(vertices.map(v=>[v.node,v]));
    return vertices.filter(v=>v.node.parent).map(v=>{
           return {
               v0: nodeMap.get(v.node.parent),
               v1: v,
               key: v.id,
               classes:v.classes,
               labelBelow :v.node.parent.children[0] !== v.node
           }
    })
}

const layoutFactory=makeVertices=>tree=>{
    const vertices = makeVertices(tree);
    const edges = makeEdges(vertices);
    return {vertices,edges}
};

export const rectangularLayout = layoutFactory(rectangularVertices);