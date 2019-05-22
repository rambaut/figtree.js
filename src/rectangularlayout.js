"use strict";

/** @module layout */

import { Layout } from "./layout.js";
import { Type } from "./tree.js";
const d3 = require("d3");

/**
 * The Layout class
 *
 */
export class RectangularLayout extends Layout {

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
        super();

        this.tree = tree;

        // merge the default settings with the supplied settings
        this.settings = {...RectangularLayout.DEFAULT_SETTINGS(), ...settings};

        this.branchLabelAnnotationName = null;
        this.internalNodeLabelAnnotationName = null;
        this.externalNodeLabelAnnotationName = null;

        // called whenever the tree changes...
        this.tree.treeUpdateCallback = () => {
            this.update();
        };
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

        this._horizontalRange = [0.0, d3.max([...this.tree.rootToTipLengths()])];
        this._verticalRange = [0, this.tree.externalNodes.length - 1];

        // get the nodes in post-order
        const nodes = [...this.tree.postorder()];

        let currentY = -1;

        if (vertices.length === 0) {
            this.nodeMap = new Map();

            // create the vertices (only done if the array is empty)
            nodes.forEach((n, i) => {
                const vertex = {
                    node: n,
                    key: n.id
                    // key: Symbol(n.id).toString()
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
                currentY = this.setYPosition(v, currentY)

                v.degree = (v.node.children ? v.node.children.length + 1: 1); // the number of edges (including stem)

                v.id = n.id;

                v.classes = [
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
                    v.labelBelow = (!v.node.parent || v.node.parent.children[0] !== v.node);
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
                        key: n.id
                        // key: Symbol(n.id).toString()
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
                    e.classes = [];

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
                e.label = (this.branchLabelAnnotationName ?
                    (this.branchLabelAnnotationName === 'length' ?
                        this.settings.lengthFormat(length) :
                        e.v1.node.annotations[this.branchLabelAnnotationName]) :
                    null );
                e.labelBelow = e.v1.node.parent.children[0] !== e.v1.node;
            });
    }

    set branchCurve(curve) {
        this.settings.branchCurve = curve;
        this.update();
    }


    get branchCurve() {
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

    setYPosition(vertex, currentY) {
        vertex.y = (vertex.node.children ? d3.mean(vertex.node.children, (child) => this.nodeMap.get(child).y) : currentY += 1);
        return currentY;
    }
    branchPathGenerator(scales){
        const branchPath =(e,i)=>{
            const branchLine = d3.line()
                 .x((v) => v.x)
                .y((v) => v.y)
                .curve(this.branchCurve);
            return(
                branchLine(
                    [{x: 0, y: scales.y(e.v0.y) - scales.y(e.v1.y)},
                    {x: scales.x(e.v1.x) - scales.x(e.v0.x), y: 0}]
                )
            )
            
        }
        return branchPath;
    }
}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

