import {mean} from "d3";
import {Type} from "../tree";
import p from "../_privateConstants.js";

export function getClassesFromNode(node){
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

// TODO update this to handle location for other layouts that aren't left to right
/**
 * Makes a vertex from a node in a tree.
 * anatomy of a vertex
 * {
        name:node.name,
        length:node.length,
        height:node.height,
        divergence:node.divergence,
        level:node.level,
        label:node.label,
        annotations:node.annotations,
        key: node.id,
        id:node.id,
        parent:node.parent?node.parent.id:null,
        children:node.children?node.children.map(child=>child.id):null,
        degree: (node.children ? node.children.length + 1 : 1),// the number of edges (including stem)
        textLabel:{
            labelBelow:labelBelow,
            x:leftLabel?"-6":"12",
            y:leftLabel?(labelBelow ? "-8": "8" ):"0",
            alignmentBaseline: leftLabel?(labelBelow ? "bottom": "hanging" ):"middle",
            textAnchor:leftLabel?"end":"start",
        },


        classes: getVertexClassesFromNode(node),
        [p.node]:node,
    };
 *
 * @param node
* @returns vertex
 */
export function makeVertexFromNode(node){
    const leftLabel= !!node.children;
    const labelBelow= (!!node.children && (!node.parent || node.parent.children[0] !== node));

    return {
        name:node.name,
        length:node.length,
        height:node.height,
        divergence:node.divergence,
        level:node.level,
        label:node.label,
        annotations:node.annotations,
        key: node.id,
        id:node.id,
        parent:node.parent?node.parent.id:null,
        children:node.children?node.children.map(child=>child.id):null,
        degree: (node.children ? node.children.length + 1 : 1),// the number of edges (including stem)
        textLabel:{
            labelBelow:labelBelow,
            x:leftLabel?"-6":"12",
            y:leftLabel?(labelBelow ? "-8": "8" ):"0",
            alignmentBaseline: leftLabel?(labelBelow ? "bottom": "hanging" ):"middle",
            textAnchor:leftLabel?"end":"start",
        },


        classes: getVertexClassesFromNode(node),
        [p.node]:node,
    };
}

/**
 * Makes edges from an array of vertices.
 *
 * Edge {
            v0: parent vertex,
            v1: target vertex,
            key: vertex.key,
            id:vertex.id,
            classes:vertex.classes,
            x:x position,
            y:y.position,
            textLabel:{ label postions
                x:,
                y: -6,
                alignmentBaseline: "bottom",
                textAnchor:"middle",
            },
 * @param vertices
 * @returns {*}
 */
export function makeEdges(vertices){
    const nodeMap = new Map(vertices.map(v=>[v[p.node],v]));
    return vertices.filter(v=>nodeMap.get(v[p.node].parent)).map(v=>{
        return {
            v0: nodeMap.get(v[p.node].parent),
            v1: v,
            key: v.key,
            id:v.id,
            classes:v.classes,
            x:nodeMap.get(v[p.node].parent).x,
            y:v.y,
            textLabel:{
                x:mean([v.x,nodeMap.get(v[p.node].parent).x]),
                y: -6,
                alignmentBaseline: "bottom",
                textAnchor:"middle",
            },
        }
    })
}

export const layoutFactory=makeVertices=>tree=>{
    const vertices = makeVertices(tree);
    const edges = makeEdges(vertices);
    return {vertices,edges}
};