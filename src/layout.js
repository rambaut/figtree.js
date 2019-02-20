"use strict";

/** @module layout */

import { Tree, Type } from "./tree.js";

/**
 * The Layout class
 *
 */
export class RectangularLayout {

    static DEFAULT_SETTINGS() {
        return {
            lengthFormat: d3.format(".2f"),
            branchCurve: d3.curveStepBefore
        };
    }

    /**
     * The constructor.
     * @param tree
     * @param settings
     */
    constructor(tree, settings = { }) {
        this.tree = tree;

        // merge the default settings with the supplied settings
        this.settings = {...RectangularLayout.DEFAULT_SETTINGS(), ...settings};

        this.branchLabelAnnotationName = null;
        this.internalNodeLabelAnnotationName = null;
        this.externalNodeLabelAnnotationName = null;

        this.vertices = [];
        this.edges = [];

        this.horizontalRange = d3.max([...this.tree.rootToTipLengths()]);
        this.verticalRange = this.tree.externalNodes.length;

        // called whenever the tree changes...
        this.tree.treeUpdateCallback = () => {
            this.update();
        };

        // create an empty callback function
        this.updateCallback = () => { };
    }

    /**
     * Lays out the tree in a standard rectangular format.
     *
     * This function is called by the FigTree class and is used to layout the nodes of the tree. It
     * populates the vertices array with vertex objects that wrap the nodes and have coordinates and
     * populates the edges array with edge objects that have two vertices.
     *
     * It encapsulates the tree object to keep it abstract
     *
     * @param vertices - objects with an x, y coordinates and a reference to the original node
     * @param edges - objects with v1 (a vertex) and v0 (the parent vertex).
     */
    layout(vertices, edges) {

        this.horizontalRange = [0.0, d3.max([...this.tree.rootToTipLengths()])];
        this.verticalRange = [0, this.tree.externalNodes.length - 1];

        // get the nodes in post-order
        const nodes = [...this.tree.postorder()];

        // vertices.length = 0;
        // edges.length = 0;

        let y = -1;

        if (vertices.length === 0) {
            this.nodeMap = new Map();

            // create the vertices (only done if the array is empty)
            nodes.forEach((n, i) => {
                const vertex = {
                    node: n,
                    key: Symbol(n.id)
                };
                vertices.push(vertex);
                this.nodeMap.set(n, vertex);
            });
        }

        // update the node locations (vertices)
        nodes
            .forEach((n) => {
                const v = this.nodeMap.get(n);

                v.x = this.tree.rootToTipLength(v.node);
                v.y = (v.node.children ? d3.mean(v.node.children, (child) => this.nodeMap.get(child).y) : y += 1);

                v.degree = (v.node.children ? v.node.children.length + 1: 1); // the number of edges (including stem)

                v.classes = [this.vertexClass,
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
                if (v.node.children) {
                    v.leftLabel = (this.internalNodeLabelAnnotationName?
                        v.node.annotations[this.internalNodeLabelAnnotationName]:
                        "");
                    v.rightLabel = "";

                    // should the left node label be above or below the node?
                    v.labelBelow = v.node.parent && v.node.parent.children[0] === v.node;
                } else {
                    v.leftLabel = "";
                    v.rightLabel = (this.externalNodeLabelAnnotationName?
                        v.node.annotations[this.externalNodeLabelAnnotationName]:
                        v.node.name);
                }

                this.nodeMap.set(v.node, v);
            });

        if (edges.length === 0) {
            this.edgeMap = new Map();

            // create the edges (only done if the array is empty)
            nodes
                .filter((n) => n.parent) // exclude the root
                .forEach((n, i) => {
                    const edge = {
                        v0: this.nodeMap.get(n.parent),
                        v1: this.nodeMap.get(n),
                        key: Symbol(n.id)
                    };
                    edges.push(edge);
                    this.edgeMap.set(edge, edge.v1);
                });
        }

        // update the edges
        edges
            .forEach((e) => {
                e.v1 = this.edgeMap.get(e);
                e.v0 = this.nodeMap.get(e.v1.node.parent),

                e.classes = [this.edgeClass];

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
                const length = e.v1.x - e.v0.x;
                e.length = length;
                e.label = (this.branchLabelAnnotationName?
                    e.v1.node.annotations[this.branchLabelAnnotationName]:
                    this.settings.lengthFormat(length));
                e.labelBelow = e.v1.node.parent && e.v1.node.parent.children[0] === e.v1.node;
            });
    }

    /**
     * Get the class name to be used for vertices
     * @returns {string}
     */
    get vertexClass() {
       return "node";
    }

    /**
     * Get the class name to be used for edges
     * @returns {string}
     */
    get edgeClass() {
        return "branch";
    }

    set edgeCurve(curve) {
        this.settings.branchCurve = curve;
        this.update();
    }


    get edgeCurve() {
        return this.settings.branchCurve;
    }

    /**
     * Sets the annotation to use as the node labels.
     *
     * @param annotationName
     */
    setInternalNodeLabels(annotationName) {
        this.internalNodeLabelAnnotationName = annotationName;
        this.update();
    }

    /**
     * Sets the annotation to use as the node labels.
     *
     * @param annotationName
     */
    setExternalNodeLabels(annotationName) {
        this.externalNodeLabelAnnotationName = annotationName;
        this.update();
    }

    /**
     * Sets the annotation to use as the node labels.
     *
     * @param annotationName
     */
    setBranchLabels(annotationName) {
        this.branchLabelAnnotationName = annotationName;
        this.update();
    }


    /**
     * Updates the tree when it has changed
     */
    update() {
        this.updateCallback();
    }

    /**
     * A utility function for rotating a node
     * @returns {rotate}
     */
    rotate() {
        return (vertex) => {
            this.tree.rotate(vertex.node);
            this.update();
        };
    }

    /**
     * A utility function for ordering a subtree with increasing tip density
     * @returns {orderIncreasing}
     */
    orderIncreasing() {
        return (vertex) => {
            this.tree.rotate(vertex.node);
            this.update();
        };
    }

    /**
     * A utility function for ordering a subtree with decreasing tip density
     * @returns {orderIncreasing}
     */
    orderDecreasing() {
        return (vertex) => {
            this.tree.rotate(vertex.node);
            this.update();
        };
    }

    /**
     * A utility function for rerooting the tree
     * @returns {reroot}
     */
    reroot() {
        return (edge, position) => {
            this.tree.reroot(edge.v1.node, position);
            this.update();
        };
    }

    /**
     * A utility function that will return a HTML string about the node and its
     * annotations. Can be used with the addLabels() method.
     *
     * @param node
     * @returns {string}
     */
    static nodeInfo(node) {
        let text = `${node.name ? node.name : node.id }`;
        Object.entries(node.annotations).forEach(([key, value]) => {
            text += `<p>${key}: ${value}</p>`;
        });
        return text;
    }
}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

