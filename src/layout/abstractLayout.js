"use strict";
import {format,curveStepBefore,max,min,line,mean,scaleLinear,curveLinear} from "d3";
import {Type} from "../tree";
import {layoutInterface} from "./layoutInterface";

/** @module layout */

export const  VertexStyle = {
    INCLUDED:Symbol("INCLUDED"),// Only included nodes are sent to the figtree class
    IGNORED:Symbol('IGNORED'), // Ignored nodes are just that ignored in everyway
    HIDDEN:Symbol("HIDDEN"), // The only difference between hidden and included nodes is that hidden nodes are not sent to the figtree class
    MASKED:Symbol("MASKED") // Masked nodes have an x and y coordinate but are then ignored. They don't count towards their parent's x and y
}

/**
 * The AbstractLayout class
 *
 */
export class AbstractLayout extends layoutInterface {

    /**
     * The default layout settings
     * @return {{lengthFormat: *, horizontalScale: null, branchScale: number, radiusOfCurve: number, includedInVerticalRange: (function(*): boolean)}}
     * @constructor
     */
    static DEFAULT_SETTINGS() {
        return {
            lengthFormat: format(".2f"),
            horizontalScale: null, // a scale that converts height to 0,1  domain. default is 0 = highest tip
            includedInVerticalRange: node => !node.children,
            branchScale: 1,
            radiusOfCurve:0,

        }
    }

    /**
     * The constructor
     * @param tree
     * @param settings
     */
    constructor(tree, settings = {},...layoutMiddlewares) {
        super();

        this.tree = tree;
        this.settings = {...AbstractLayout.DEFAULT_SETTINGS(), ...settings};

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

        this._branchLabelAnnotationName = null;
        this._internalNodeLabelAnnotationName = null;
        this._externalNodeLabelAnnotationName = null;

        this.layoutKnown = false;

        // called whenever the tree changes...
        this.tree.treeUpdateCallback = () => {
            this.layoutKnown = false;
            this.update();
        };


        // create an empty callback function
        this.updateCallback = () => {
        };

        applyLayoutMiddleware.call(this,layoutMiddlewares)

    }

    layout() {
        this._horizontalScale = this.updateHorizontalScale();

        makeVerticesFromNodes.call(this, this.getTreeNodes());
        makeEdgesFromNodes.call(this, this.getTreeNodes());
        // get the nodes

        let currentY = this.setInitialY();
        let currentX = this.setInitialX();

        //CARTOONS set up
        // filter so just showing the most ancestral;
        const allCartoonDescendents = [];
        this._cartoonStore.forEach(c => {
            if (allCartoonDescendents.indexOf(c.node) === -1) {
                allCartoonDescendents.push(...[...this.tree.postorder(c.node)].filter(n => n !== c.node))
            }
        });

        this._activeCartoons = this._cartoonStore.filter(c => allCartoonDescendents.indexOf(c.node) === -1);

        this._activeCartoons.filter(c => c.format === 'collapse')
            .forEach(c => {
                markCollapsedNodes.call(this, c);
            });


        // update the node locations (vertices)
        this._vertices.forEach((v) => {
            if (!(v.visibility === VertexStyle.IGNORED)) {

                currentY = this.setYPosition(v, currentY);
                currentX = this.setXPosition(v, currentX);
                v.degree = (v.node.children ? v.node.children.length + 1 : 1); // the number of edges (including stem)
                v.id = v.node.id;
                setVertexClasses.call(this, v);
                setVertexLabels.call(this, v);
            }
        });


        //Update edge locations
        this._edges
            .forEach((e) => {
                setupEdge.call(this, e)
            })

// update verticalRange so that we count tips that are in cartoons but not those that are ignored
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


    set internalNodeLabelAnnotationName(annotationName) {
        this._internalNodeLabelAnnotationName = annotationName;
        this.update();
    }
    get internalNodeLabelAnnotationName() {
        return this._internalNodeLabelAnnotationName;
    }



    set externalNodeLabelAnnotationName(annotationName) {
        this._externalNodeLabelAnnotationName = annotationName;
        this.update();
    }

    get externalNodeLabelAnnotationName() {
        return this._externalNodeLabelAnnotationName;
    }


    set branchLabelAnnotationName(annotationName) {
        this._branchLabelAnnotationName = annotationName;
        this.update();
    }
    get branchLabelAnnotationName() {
        return this._branchLabelAnnotationName;
    }



    update() {
        this.updateCallback();
    }


    rotate() {
        return (vertex) => {
            this.tree.rotate(vertex.node);
            this.update();
        };
    }


    orderIncreasing() {
        return (vertex) => {
            this.tree.rotate(vertex.node);
            this.update();
        };
    }


    orderDecreasing() {
        return (vertex) => {
            this.tree.rotate(vertex.node);
            this.update();
        };
    }


    reroot() {
        return (edge, position) => {
            this.tree.reroot(edge.v1.node, position);
            this.update();
        };
    }


    cartoon(vertex) {
        const node = vertex.node
        if (node.children) {

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


    collapse(vertex) {
        const node = vertex.node;
        if (node.children) {
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

    maskNode(node) {
        const vertex = this.nodeMap.get(node);
        vertex.visibility = VertexStyle.MASKED;
        this.layoutKnown = false;
    }

    hideNode(node) {
        const vertex = this.nodeMap.get(node);
        vertex.visibility = VertexStyle.HIDDEN;
        this.layoutKnown = false;
    }

    ignoreNode(node) {
        const vertex = this.nodeMap.get(node);
        vertex.visibility = VertexStyle.IGNORED;
        this.layoutKnown = false;
    }

    includeNode(node) {
        const vertex = this.nodeMap.get(node);
        vertex.visibility = VertexStyle.INCLUDED;
        this.layoutKnown = false;
    }


    nodeInfo(node) {
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
        return this._edges.filter(e => e.v1.visibility === VertexStyle.INCLUDED);
    }

    get vertices() {
        if (!this.layoutKnown) {
            this.layout();
        }
        return this._vertices.filter(v => v.visibility === VertexStyle.INCLUDED);
    }

    get cartoons() {
        if (!this.layoutKnown) {
            this.layout();
        }
        const cartoons = [];
        // Handle cartoons
        this._activeCartoons.forEach(c => {


            const cartoonNodeDecedents = [...this.tree.postorder(c.node)].filter(n => n !== c.node);
            const cartoonVertex = this._nodeMap.get(c.node);

            const cartoonVertexDecedents = cartoonNodeDecedents.map(n => this._nodeMap.get(n));
            cartoonVertexDecedents.forEach(v => v.visibility = VertexStyle.HIDDEN);
            const newTopVertex = {
                x: max(cartoonVertexDecedents, d => d.x),
                y: max(cartoonVertexDecedents, d => d.y),
                id: `${cartoonVertex.id}-top`,
                node: cartoonVertex.node,
                classes: cartoonVertex.classes
            };
            const newBottomVertex = {
                ...newTopVertex, ...{y: min(cartoonVertexDecedents, d => d.y), id: `${cartoonVertex.id}-bottom`}
            };
            // place in middle of tips.
            cartoonVertex.y = mean([newTopVertex, newBottomVertex], d => d.y)
            let currentNode = cartoonVertex.node;
            while (currentNode.parent) {
                const parentVertex = this._nodeMap.get(currentNode.parent)
                if (!this.settings.includedInVerticalRange(parentVertex.node)) {
                    parentVertex.y = mean(parentVertex.node.children, (child) => this._nodeMap.get(child).y)
                }
                currentNode = parentVertex.node;

            }

            cartoons.push({
                vertices: [cartoonVertex, newTopVertex, newBottomVertex],
                classes: cartoonVertex.classes,
                id: `${cartoonVertex.id}-cartoon`, node: c.node
            })
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
    updateHorizontalScale() {
        const newScale = this.settings.horizontalScale ? this.settings.horizontalScale :
            scaleLinear().domain([this.tree.rootNode.height*this.settings.branchScale, this.tree.origin]).range(this._horizontalRange);
        return newScale;
    }
    updateSettings(newSettings){
        this.settings={...this.settings,...newSettings};
        this.update();
    }
}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */
export function makeVerticesFromNodes(nodes){
    nodes.forEach((n, i) => {

        if(!this._nodeMap.has(n)){
            const vertex = {
                node: n,
                key: n.id,
                focused:false,
                visibility:VertexStyle.INCLUDED
                // key: Symbol(n.id).toString()
            };
            this._vertices.push(vertex);
            this._nodeMap.set(n, vertex);
        }
    });
};


export function setVertexClasses(v){
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

export function setVertexLabels(v){
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

export function makeEdgesFromNodes(nodes){
    // create the edges (only done if the array is empty)
    nodes
        .filter((n) => n.parent) // exclude the root
        .forEach((n, i) => {
            if(!this._edgeMap.has(this._nodeMap.get(n))) {
                    const edge = {
                        v0: this._nodeMap.get(n.parent),
                        v1: this._nodeMap.get(n),
                        key: n.id
                    };
                    this._edges.push(edge);
                    this._edgeMap.set(edge.v1, edge);
                }
        })
}

export function setupEdge(e){
    setEdgeTermini.call(this,e);
    setEdgeClasses.call(this,e);
    setEdgeLabels.call(this,e);

}

export function setEdgeTermini(e){
    e.v1 = this._nodeMap.get(e.v1.node);
    e.v0 = this._nodeMap.get(e.v1.node.parent);
    e.length = length;
}

export function setEdgeClasses(e){
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
export function setEdgeLabels(e){
    e.label = (this.branchLabelAnnotationName ?
        (this.branchLabelAnnotationName === 'length' ?
            this.settings.lengthFormat(length) :
            e.v1.node.annotations[this.branchLabelAnnotationName]) :
        null );
    e.labelBelow = e.v1.node.parent.children[0] !== e.v1.node;
}

export function markCollapsedNodes(c){
    const cartoonNodeDecedents = [...this.tree.postorder(c.node)].filter(n=>n!==c.node);

    const cartoonVertexDecedents = cartoonNodeDecedents.map(n=>this._nodeMap.get(n));

    const mostDiverged = this._nodeMap.get(cartoonNodeDecedents.find(n=>n.height===max(cartoonNodeDecedents,d=>d.height)));
    cartoonVertexDecedents.forEach(v=> {
        v.visibility = VertexStyle.HIDDEN;
        if (v === mostDiverged) {
            v.visibility = VertexStyle.IGNORED;
        }
    });
}

// borrowed from redux naive implementation https://redux.js.org/advanced/middleware
export function applyLayoutMiddleware(middlewares){
    console.log("applying")
    middlewares = middlewares.slice();
    middlewares.reverse();
    let layout = this.layout;
    middlewares.forEach(middleware => (layout = middleware(this)(layout)));

    Object.assign(this,layout);
}

