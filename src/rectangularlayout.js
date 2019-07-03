"use strict";

/** @module layout */

import { Layout } from "./layout.js";
import { Type } from "./tree.js";
import {format,curveStepBefore,max,line,mean,scaleLinear} from "d3";

// const d3 = require("d3");
/**
 * The Layout class
 *
 */
export class RectangularLayout extends Layout {

    static DEFAULT_SETTINGS() {
        return {
            lengthFormat: format(".2f"),
            branchCurve: curveStepBefore,
            horizontalScale: null, // a scale that converts height to 0,1  domain. default is 0 = heighest tip
            includedInVerticalRange:node => !node.children,
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

        this._horizontalRange = [0,1];//[0.0, max([...this.tree.rootToTipLengths()])];
        this._verticalRange = [0, this.tree.nodeList.filter(this.settings.includedInVerticalRange).length - 1];


        // called whenever the tree changes...
        this.tree.treeUpdateCallback = () => {
            this.layoutKnown = false;
            this.update();
        };

        this.layoutKnown = false;
        this._edges = [];
        this._vertices=[];

        this._nodeMap = new Map();
        this._edgeMap = new Map();


    }

    /**
     * Lays out the tree in a standard rectangular format.
     *
     * This function is called by the FigTree class and is used to layout the nodes of the tree. It
     * populates the vertices array with vertex objects that wrap the nodes and have coordinates and
     * populates the edges array with edge objects that have two vertices.
     *
     */

    layout() {

        if(!this.settings.horizontalScale){
            this._horizontalScale = scaleLinear().domain([this.tree.rootNode.height,this.tree.origin]).range(this._horizontalRange);
        }else{
            this._horizontalScale = this.settings.horizontalScale;
        }
        // get the nodes in post-order
        const nodes = this.getTreeNodes();

        let currentY = -1;

        if (this._vertices.length === 0) {
            // create the vertices (only done if the array is empty)
            nodes.forEach((n, i) => {
                const vertex = {
                    node: n,
                    key: n.id
                    // key: Symbol(n.id).toString()
                };
                this._vertices.push(vertex);
                this._nodeMap.set(n, vertex);
            });
        }

        // update the node locations (vertices)
        nodes
            .forEach((n) => {
                const v = this._nodeMap.get(n);

                v.x = this._horizontalScale(v.node.height);
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
                                return this.tree.annotations[key] &&
                                    (this.tree.annotations[key].type === Type.DISCRETE ||
                                    this.tree.annotations[key].type === Type.BOOLEAN ||
                                    this.tree.annotations[key].type === Type.INTEGER);
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

                this._nodeMap.set(v.node, v);
            });

        if (this._edges.length === 0) {

            // create the edges (only done if the array is empty)
            nodes
                .filter((n) => n.parent) // exclude the root
                .forEach((n, i) => {
                    const edge = {
                        v0: this._nodeMap.get(n.parent),
                        v1: this._nodeMap.get(n),
                        key: n.id
                        // key: Symbol(n.id).toString()
                    };
                    this._edges.push(edge);
                    this._edgeMap.set(edge, edge.v1);
                });
        }

        // update the edges
        this._edges
            .forEach((e) => {
                e.v1 = this._edgeMap.get(e);
                e.v0 = this._nodeMap.get(e.v1.node.parent),
                    e.classes = [];

                if (e.v1.node.annotations) {
                    e.classes = [
                        ...e.classes,
                        ...Object.entries(e.v1.node.annotations)
                            .filter(([key]) => {
                                return this.tree.annotations[key] &&
                                    (this.tree.annotations[key].type === Type.DISCRETE ||
                                    this.tree.annotations[key].type === Type.BOOLEAN ||
                                    this.tree.annotations[key].type === Type.INTEGER);
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

        // Now do the annotation stuff

        this.layoutKnown=true;

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
        // check if there are children that that are in the same group and set position to mean
        // if do something else

        const includedInVertical = this.settings.includedInVerticalRange(vertex.node);
        if(!includedInVertical){
            vertex.y = mean(vertex.node.children,(child) => this._nodeMap.get(child).y)
        }
        else{
            currentY+=1;
            vertex.y = currentY;
        }
        return currentY;
    }

    branchPathGenerator(scales){
        const branchPath =(e,i)=>{
            const branchLine = line()
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
    get edges(){
        if(!this.layoutKnown){
            this.layout();
        }
        return this._edges;
    }

    get vertices(){
        if(!this.layoutKnown){
            this.layout();
        }
        return this._vertices;
    }

    get nodeMap(){
        if(!this.layoutKnown){
            this.layout();
        }
        return this._nodeMap;
    }
    get edgeMap(){
        if(!this.layoutKnown){
            this.layout();
        }
        return this._edgeMap;
    }
    get horizontalScale(){
        if(!this.layoutKnown){
            this.layout();
        }
        return this._horizontalScale;
    }

    getTreeNodes(){ return [...this.tree.postorder()]};
}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

