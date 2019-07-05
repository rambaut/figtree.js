"use strict";
import {format,curveStepBefore,max,min,line,mean,scaleLinear,curveLinear} from "d3";
import {Type} from "./tree";

/** @module layout */


/**
 * The Layout class
 *
 */
export class Layout {

    static DEFAULT_SETTINGS() {
        return {
            lengthFormat: format(".2f"),
            horizontalScale: null, // a scale that converts height to 0,1  domain. default is 0 = heighest tip
            includedInVerticalRange: node => !node.children,
            branchCurve: null,
            branchScale:1
        }
    }

    /**
     * The constructor.
     */
    constructor(tree, settings = {}) {

        this.tree = tree;
        this.settings = {...Layout.DEFAULT_SETTINGS(), ...settings};

        // default ranges - these should be set in layout()
        this._horizontalRange = [0.0, 1.0];
        this._verticalRange = [0, this.tree.nodeList.filter(this.settings.includedInVerticalRange).length - 1];
        this._horizontalTicks = [0, 0.5, 1];


        this._edges = [];
        this._edgeMap = new Map();

        this._vertices = [];
        this._nodeMap = new Map();

        this._cartoonStore = [];
        this._activeCartoons = [];

        this.branchLabelAnnotationName = null;
        this.internalNodeLabelAnnotationName = null;
        this.externalNodeLabelAnnotationName = null;

        this.layoutKnown = false;


        // called whenever the tree changes...
        this.tree.treeUpdateCallback = () => {
            this.layoutKnown = false;
            this.update();
        };


        // create an empty callback function
        this.updateCallback = () => {
        };
    }

    /**
     * An abstract base class for a layout class. The aim is to describe the API of the class.
     *
     * @param vertices - objects with an x, y coordinates and a reference to the original node
     * @param edges - objects with v1 (a vertex) and v0 (the parent vertex).
     */
    layout() {
        this._horizontalScale = this.updateHorizontalScale();

        // get the nodes
        const nodes = this.getTreeNodes();

        let currentY = this.setInitialY();

        makeVerticesFromNodes.call(this, nodes);


        //CARTOONS set up
        // filter so just showing the most ancestral;
        const allCartoonDescendents = [];
        this._cartoonStore.forEach(c=> {
            if(allCartoonDescendents.indexOf(c.node)===-1){
                allCartoonDescendents.push(...[...this.tree.postorder(c.node)].filter(n=>n!==c.node))
            }
        })

        this._activeCartoons = this._cartoonStore.filter(c=>allCartoonDescendents.indexOf(c.node)===-1);

        this._activeCartoons.filter(c=>c.format==='collapse')
            .forEach(c=>{
              markCollapsedNodes.call(this,c);
        })


        // update the node locations (vertices)
        nodes
            .forEach((n) => {
                const v = this._nodeMap.get(n);
                if(!v.masked||(v.masked &&v.collapsed)) {

                    currentY = this.setYPosition(v, currentY)
                    this.setXPosition(v);
                    v.degree = (v.node.children ? v.node.children.length + 1: 1); // the number of edges (including stem)
                    v.id = v.node.id;
                    setVertexClasses.call(this,v);
                    setVertexLabels.call(this,v);
                }else{
                    v.y=null; //forget the last position
                }
            });


        // EDGES
        makeEdgesFromNodes.call(this, nodes);

        //Update edge locations
        this._edges
            .forEach((e) => {
                setupEdge.call(this, e)
            })

// update verticalRange so that we count tips that are in cartoons but not those that are collapsed
        this._verticalRange = [0, currentY];
        this.layoutKnown = true;

    }

    get horizontalRange() {
        return this._horizontalRange;
    }

    get verticalRange() {
        if (!this.layoutKnown) {
            this.layout();
        }
        return this._verticalRange;
    }

    get horizontalAxisTicks() {
        return this._horizontalTicks;
    }

    set branchCurve(curve) {
        this.settings.branchCurve = curve;
        this.update();
    }


    get branchCurve() {
        return this.settings.branchCurve;
    }

    set branchScale(value){
        this.settings.branchScale = value;
        this.update();
    }
    get branchScale(){
        return this.settings.branchScale;
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
     * A utility function to cartoon a clade into a triangle
     * @param vertex
     */
    cartoon(node) {
        if(node.children) {

            if (this._cartoonStore.filter(c => c.format === "cartoon").find(c => c.node === node)) {
                this._cartoonStore = this._cartoonStore.filter(c => !(c.format === "cartoon" && c.node === node));
            } else {
                this._cartoonStore.push({
                    node: node,
                    format: "cartoon"
                })
            }
            this.layoutKnown = false;
            this.update();
        }
    }

    /**
     * A utitlity function to collapse a clade into a single branch and tip.
     * @param vertex
     */
    collapse(node) {
        if(node.children) {
            if (this._cartoonStore.filter(c => c.format === "collapse").find(c => c.node === node)) {
                this._cartoonStore = this._cartoonStore.filter(c => !(c.format === "collapse" && c.node === node));
            } else {
                this._cartoonStore.push({
                    node: node,
                    format: "collapse"
                })
            }
            this.layoutKnown = false;
            this.update();
        }
    }

    /**
     * A utility function that will return a HTML string about the node and its
     * annotations. Can be used with the addLabels() method.
     *
     * @param node
     * @returns {string}
     */
    static nodeInfo(node) {
        let text = `${node.name ? node.name : node.id}`;
        Object.entries(node.annotations).forEach(([key, value]) => {
            text += `<p>${key}: ${value}</p>`;
        });
        return text;
    }

    get edges() {
        if (!this.layoutKnown) {
            this.layout();
        }
        return this._edges.filter(e => !e.v1.masked);
    }

    get vertices() {
        if (!this.layoutKnown) {
            this.layout();
        }
        return this._vertices.filter(v => !v.masked);
    }

    get cartoons() {
        if (!this.layoutKnown) {
            this.layout();
        }
        const cartoons = [];
        // Handle cartoons
        this._activeCartoons.forEach(c=>{


        const cartoonNodeDecedents = [...this.tree.postorder(c.node)].filter(n=>n!==c.node);
        const cartoonVertex = this._nodeMap.get(c.node);

        const cartoonVertexDecedents = cartoonNodeDecedents.map(n=>this._nodeMap.get(n));
        cartoonVertexDecedents.forEach(v=>v.masked=true);
        const newTopVertex = {
            x: max(cartoonVertexDecedents, d => d.x),
            y: max(cartoonVertexDecedents, d => d.y),
            id: `${cartoonVertex.id}-top`,
            node: cartoonVertex.node,
            classes: cartoonVertex.classes
        };
        const newBottomVertex = {
            ...newTopVertex,...{y:min(cartoonVertexDecedents, d => d.y),id: `${cartoonVertex.id}-bottom`}
        };
        // place in middle of tips.
        cartoonVertex.y = mean([newTopVertex,newBottomVertex],d=>d.y)
        let currentNode= cartoonVertex.node;
        while(currentNode.parent){
            const parentVertex = this._nodeMap.get(currentNode.parent)
            if(!this.settings.includedInVerticalRange(parentVertex.node)) {
                parentVertex.y = mean(parentVertex.node.children, (child) => this._nodeMap.get(child).y)
            }
            currentNode = parentVertex.node;

        }

            cartoons.push({vertices:[cartoonVertex,newTopVertex,newBottomVertex],
            classes : cartoonVertex.classes,
            id:`${cartoonVertex.id}-cartoon`})
            })

        return cartoons;

    }

    get nodeMap() {
        if (!this.layoutKnown) {
            this.layout();
        }
        return this._nodeMap;
    }

    get edgeMap() {
        if (!this.layoutKnown) {
            this.layout();
        }
        return this._edgeMap;
    }

    get horizontalScale() {
        if (!this.layoutKnown) {
            this.layout();
        }
        return this._horizontalScale;
    }

    // layout functions that will allow decedent layouts to change only what they need to

    updateHorizontalScale() {
        const newScale = this.settings.horizontalScale ? this.settings.horizontalScale :
            scaleLinear().domain([this.tree.rootNode.height*this.settings.branchScale, this.tree.origin]).range(this._horizontalRange);
        return newScale;
    }

    setInitialY() {
        return -1;
    }

    setYPosition(vertex, currentY) {
        // check if there are children that that are in the same group and set position to mean
        // if do something else

        const includedInVertical = this.settings.includedInVerticalRange(vertex.node);
        if (!includedInVertical) {
            vertex.y = mean(vertex.node.children, (child) => this._nodeMap.get(child).y)
        } else {
            currentY += 1;
            vertex.y = currentY;
        }
        return currentY;
    }

    setXPosition(v){
        v.x = this._horizontalScale(v.node.height*this.settings.branchScale);
    }

    getTreeNodes() {
        return [...this.tree.postorder()]
    };

}
/*
 * Private methods, called by the class using the <function>.call(this) function.
 */
function makeVerticesFromNodes(nodes){
    nodes.forEach((n, i) => {

        if(!this._nodeMap.has(n)){
            const vertex = {
                node: n,
                key: n.id
                // key: Symbol(n.id).toString()
            };
            this._vertices.push(vertex);
            this._nodeMap.set(n, vertex);
        }
        const vertex = this._nodeMap.get(n);
        vertex.masked=null;
        vertex.collapsed = null;
    });
};


function setVertexClasses(v){
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

}

function setVertexLabels(v){
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
}

function makeEdgesFromNodes(nodes){
    // create the edges (only done if the array is empty)
    nodes
        .filter((n) => n.parent) // exclude the root
        .forEach((n, i) => {
            if(!this._edgeMap.has(this._nodeMap.get(n))) {
                if(!n.masked||(n.masked &&!n.collapsed)) {
                    const edge = {
                        v0: this._nodeMap.get(n.parent),
                        v1: this._nodeMap.get(n),
                        key: n.id
                    };
                    this._edges.push(edge);
                    this._edgeMap.set(edge.v1, edge);
                }
            }
        })
}

function setupEdge(e){
    setEdgeTermini.call(this,e);
    setEdgeClasses.call(this,e);
    setEdgeLabels.call(this,e);

}

function setEdgeTermini(e){
    e.v1 = this._nodeMap.get(e.v1.node);
    e.v0 = this._nodeMap.get(e.v1.node.parent);
    e.length = length;
}

function setEdgeClasses(e){
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
}
function setEdgeLabels(e){
    e.label = (this.branchLabelAnnotationName ?
        (this.branchLabelAnnotationName === 'length' ?
            this.settings.lengthFormat(length) :
            e.v1.node.annotations[this.branchLabelAnnotationName]) :
        null );
    e.labelBelow = e.v1.node.parent.children[0] !== e.v1.node;
}

function markCollapsedNodes(c){
    const cartoonNodeDecedents = [...this.tree.postorder(c.node)].filter(n=>n!==c.node);

    const cartoonVertexDecedents = cartoonNodeDecedents.map(n=>this._nodeMap.get(n));

    const mostDiverged = this._nodeMap.get(cartoonNodeDecedents.find(n=>n.height===max(cartoonNodeDecedents,d=>d.height)));
    cartoonVertexDecedents.forEach(v=> {
        v.masked = true
        if (v === mostDiverged) {
            v.collapsed = true
        }
    });


}