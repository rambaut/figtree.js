"use strict";

/** @module layouts */

/**
 * Lays out the tree in a standard rectangular format.
 *
 * This function is passed to the FigTree constructor and is used to layout the nodes of the tree. It
 * populates the vertices array with vertex objects that wrap the nodes and have coordinates and
 * populates the edges array with edge objects that have two vertices.
 * @param tree
 * @param vertices - objects with an x, y coordinates and a reference to the original node
 * @param edges - objects with v1 (a vertex) and v0 (the parent vertex).
 */
export function rectangularLayout(tree, vertices, edges) {

    // get the nodes in post-order
    const nodes = [...tree.postorder()];

    // vertices.length = 0;
    // edges.length = 0;

    let y = -1;

    const nodeMap =  new Map();

    if (vertices.length === 0) {
        // create the node locations (vertices)
        nodes.forEach((n, i) => {
            const vertex = {
                x: this.tree.rootToTipLength(n),
                y: (n.children ? d3.mean(n.children, (child) => nodeMap.get(child).y) : y += 1),
                node: n
            };
            vertices.push(vertex);
            nodeMap.set(n, vertex);
        });
    } else {
        // update the node locations (vertices)
        nodes
            .forEach((n, i) => {
                vertices[i].x = this.tree.rootToTipLength(n);
                vertices[i].y = (n.children ? d3.mean(n.children, (child) => nodeMap.get(child).y) : y += 1);
                vertices[i].node = n;
                nodeMap.set(n, vertices[i]);
            });
    }

    if (edges.length === 0) {
        // create the edges
        nodes
            .filter((n) => n.parent )
            .forEach((n, i) => edges.push({ v0: nodeMap.get(n.parent), v1: nodeMap.get(n) }));
    } else {
        // update the edges
        nodes
            .filter((n) => n.parent)
            .forEach((n, i) => {
                edges[i].v0 = nodeMap.get(n.parent);
                edges[i].v1 = nodeMap.get(n);
            });
    }
}

/**
 * Lays out the tree in a directional transmission tree format in which the direction of transmission
 * is shown.
 *
 * This function is passed to the FigTree constructor and is used to layout the nodes of the tree.
 * @param tree
 * @param vertices - objects with an x, y coordinates and a reference to the original node
 * @param edges - objects with v1 (a vertex) and v0 (the parent vertex).
 */
export function transmissionLayout(tree, vertices, edges) {

    // get the nodes in post-order
    const nodes = [...tree.postorder()];

    vertices.length = 0;
    edges.length = 0;

    let y = -1;

    const nodeMap =  new Map();

    // create the node locations (vertices)
    nodes
        .forEach((n, i) => {
            const vertex = {
                x: this.tree.rootToTipLength(n),
                // the y position is that of the first child
                y: (n.children ? n.children[0] : y += 1),
                node: n
            };
            nodeMap.set(n, vertex);

            vertices.push(vertex);
        });

    // create the edges
    nodes
        .forEach((n, i) => {
            edges.push(
                {
                    v0: nodeMap.get(n.parent),
                    v1: nodeMap.get(n)
                }
            );
        });
}
