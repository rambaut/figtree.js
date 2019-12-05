import {mean} from "d3";
import {Type} from "../tree";
import p from "../privateConstants.js";

function getVertexClassesFromNode(node){
    let classes = [(!node.children ? "external-node" : "internal-node")];
    const tree = node.tree;
    if (node.annotations) {
        classes = [
            ...classes,
            ...Object.entries(node.annotations)
                .filter(([key]) => {
                    return tree.annotations[key] &&
                        (tree.annotations[key].type === Type.DISCRETE ||
                            tree.annotations[key].type === Type.BOOLEAN ||
                            tree.annotations[key].type === Type.INTEGER);
                })
                .map(([key, value]) =>{
                    if(tree.annotations[key].type===Type.DISCRETE || tree.annotations[key].type === Type.INTEGER){
                        return `${key}-${value}`;
                    }else if(tree.annotations[key].type === Type.BOOLEAN && value ){
                        return `${key}`
                    }
                })];
    }
    return classes;
}
function makeVertexFromNode(node){
        const leftLabel= !!node.children;
        const labelBelow= (!!node.children && (!node.parent || node.parent.children[0] !== node));

            return {
                name:node.name,
                length:node.length,
                height:node.height,
                level:node.level,
                label:node.label,
                annotations:node.annotations,
                key: node.id,
                id:node.id,
                degree: (node.children ? node.children.length + 1 : 1),// the number of edges (including stem)
                textLabel:{
                    dx:leftLabel?"-6":"12",
                    dy:leftLabel?(labelBelow ? "-8": "8" ):"0",
                    alignmentBaseline: leftLabel?(labelBelow ? "bottom": "hanging" ):"middle",
                    textAnchor:leftLabel?"end":"start",
                },


                classes: getVertexClassesFromNode(node),
                [p.node]:node,
            };
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
            const vertex = {...makeVertexFromNode(node),
                y:mean(myChildrenPositions),
                x:node.height};
            yield vertex;

        }else{
            currentY+=1;
            siblingPositions.push(currentY);
            const vertex = {...makeVertexFromNode(node), y:currentY, x:node.height};
            yield vertex;
        }
    };
    return [...traverse(tree.rootNode)];
}

export function makeEdges(vertices){
    const nodeMap = new Map(vertices.map(v=>[v[p.node],v]));
    return vertices.filter(v=>v[p.node].parent).map(v=>{
        const labelBelow =v[p.node].parent.children[0] !== v[p.node];
        return {
               v0: nodeMap.get(v[p.node].parent),
               v1: v,
               key: v.key,
               id:v.id,
               classes:v.classes,
               x:nodeMap.get(v[p.node].parent).x,
               y:v.y,
               textLabel:{
                   dx:[v.x,nodeMap.get(v[p.node].parent).x],
                   dy: labelBelow ? +6 : -6,
                   alignmentBaseline: labelBelow ? "hanging" : "bottom",
                   textAnchor:"middle",
               },
           }
    })
}

const layoutFactory=makeVertices=>tree=>{
    const vertices = makeVertices(tree);
    const edges = makeEdges(vertices);
    return {vertices,edges}
};

export const rectangularLayout = layoutFactory(rectangularVertices);