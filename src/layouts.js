"use strict";

/** @module layouts */

import {Type} from "./tree.js";

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

    const nodeMap = new Map();

    if (vertices.length === 0) {
        // create the vertices (only done if the array is empty)
        nodes.forEach((n, i) => {
            const vertex = {
                node: n
            };
            vertices.push(vertex);
            nodeMap.set(n, vertex);
        });

        // update the node locations (vertices)
        vertices
            .forEach((v) => {
                v.x = this.tree.rootToTipLength(v.node);
                v.y = (v.node.children ? d3.mean(v.node.children, (child) => nodeMap.get(child).y) : y += 1);

                v.classes = ["node",
                    (!v.node.children ? "external-node" : "internal-node"),
                    (v.node.isSelected ? "selected" : "unselected")];

                if (v.node.annotations) {
                    v.classes = [
                        ...v.classes,
                        ...Object.entries(v.node.annotations)
                            .filter(([key]) => {
                                return this.tree.annotations[key].type === Type.DISCRETE ||
                                    this.tree.annotations[key].type === Type.BOOLEAN ||
                                    this.tree.annotations[key].type === Type.INTEGER;
                            })
                            .map(([key, value]) => `${key}-${value}`)];
                }

                // either the tip name or the internal node label
                v.label = (v.node.children ? v.node.label : v.node.name);

                // should the node label be above or below the node?
                v.labelAbove = (v.node.children && v.node.parent && v.node.parent.children[0] === v.node);
                nodeMap.set(n, vertices[i]);
            });

        if (edges.length === 0) {
            // create the edges (only done if the array is empty)
            nodes
                .filter((n) => n.parent)
                .forEach((n, i) => {
                    const edge = {
                        v0: null,
                        v1: null
                    };
                    edges.push(edge);
                });
        }

        // update the edges
        edges
            .forEach((e) => {
                e.v0 = nodeMap.get(n.parent);
                e.v1 = nodeMap.get(n);
                e.classes = ["branch"];

                if (e.v1.node.annotations) {
                    e.classes = [
                        ...e.classes,
                        ...Object.entries(e.v1.node.annotations)
                            .filter(([key]) => {
                                return this.tree.annotations[key].type === Type.DISCRETE ||
                                    this.tree.annotations[key].type === Type.BOOLEAN ||
                                    this.tree.annotations[key].type === Type.INTEGER;
                            })
                            .map(([key, value]) => `${key}-${value}`)];
                }
                edge.length = length;
                edge.label = `${length}`;
                edge.labelAbove = (v.node.children && v.node.parent && v.node.parent.children[0] === v.node);
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

    const nodeMap = new Map();

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
