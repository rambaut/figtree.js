"use strict";
import {format,curveStepBefore,max,min,line,mean,scaleLinear,curveLinear} from "d3";
import {Tree, Type} from "../tree";
import {layoutInterface} from "./layoutInterface";

/** @module layout */

export const  VertexStyle = {
    INCLUDED:Symbol("INCLUDED"),// Only included nodes are sent to the figtree class
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
            branchScale: 1,
            radiusOfCurve:0,

        }
    }

    /**
     * The constructor
     * @param tree
     * @param settings
     */
    constructor(tree, settings = {}) {
        super();

        this.tree = tree;
        this.settings = {...AbstractLayout.DEFAULT_SETTINGS(), ...settings};

        // default ranges - these should be set in layout()
        this._horizontalRange = [0.0, 1.0];
        this._verticalRange = [0, this.tree.externalNodes.length - 1];
        this._horizontalTicks = [0, 0.5, 1];

        this._edges = [];
        this._edgeMap = new Map();

        this._vertices = [];
        this._nodeMap = new Map();

        this._cartoonStore = [];

        this._branchLabelAnnotationName = null;
        this._internalNodeLabelAnnotationName = null;
        this._externalNodeLabelAnnotationName = null;

        this._ignoredNodes=[];

        this.layoutKnown = false;

        // called whenever the tree changes...
        this.tree.subscribeCallback( () => {
                                    this.layoutKnown = false;
                                     this.update();
        });


        // create an empty callback function
        this.updateCallback = () => {
        };

    }

    layout() {
        this._horizontalScale = this.updateHorizontalScale();

        const treeNodes = this.getTreeNodes();
        makeVerticesFromNodes.call(this, treeNodes);
        makeEdgesFromNodes.call(this, treeNodes);
        // get the nodes

        let currentY = this.setInitialY();
        let currentX = this.setInitialX();


        // update the node locations (vertices)
        treeNodes.forEach((n) => {
            const v = this._nodeMap.get(n);

                currentY = this.setYPosition(v, currentY);
                currentX = this.setXPosition(v, currentX);
                v.degree = (v.node.children ? v.node.children.length + 1 : 1); // the number of edges (including stem)
                v.id = v.node.id;
                setVertexClasses.call(this, v);
                setVertexLabels.call(this, v);
        });


        //Update edge locations
        this._edges
            .forEach((e) => {
                setupEdge.call(this, e)
            });

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
        this.layoutKnown=false;
        return (edge, position) => {
            this.tree.reroot(edge.v1.node, position);
            this.update();
        };
    }


    cartoon(vertex) {
        const node = vertex.node;
        if (node.children) {
            if (this._cartoonStore.filter(c => c.format === "cartoon").find(c => c.node === node)) {
                this._cartoonStore = this._cartoonStore.filter(c => !(c.format === "cartoon" && c.node === node));

                [...this.tree.postorder(node)]
                    .filter(n=>n!==node)
                    .map(n=>this._nodeMap.get(n))
                    .forEach(v=>v.visibility = v.visibility===VertexStyle.HIDDEN?VertexStyle.INCLUDED:v.visibility);

            } else {
                this._cartoonStore.push({
                    node: node,
                    format: "cartoon"
                })
            }
            // hide children vertices
            this._cartoonStore.forEach(c=>{
                [...this.tree.postorder(c.node)]
                    .filter(n=>n!==c.node)
                    .forEach(n=>this.hideNode(n))
            });

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
        this._ignoredNodes.push(node);
        this.layoutKnown = false;
    }

    includeNode(node) {
        this._ignoredNodes = this._ignoredNodes.filter(n=>n!==node);

        const vertex = this.nodeMap.get(node);
        vertex.visibility = VertexStyle.INCLUDED;
        this.layoutKnown = false;
    }

    getChildVertices(vertex){

        // return vertex.node.children.map(child=>this._nodeMap.get(child)).filter(child=>child.visibility===VertexStyle.INCLUDED||child.visibility===VertexStyle.HIDDEN);
        const children =  vertex.node.children.filter(n=>!this._ignoredNodes.includes(n)).map(child=>this._nodeMap.get(child));


        try{
            return children.filter(child=>child.visibility!==VertexStyle.MASKED);
        }catch{
            console.group(`${vertex.node.id}`);
            console.log(vertex);
            console.log(children);
            console.groupEnd();
        }

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

        // Handle cartoons
        // here we handle what's active and what isn't.
        const cartoons = [];
        const ancestralCartoons = getMostAncestralCartoons.call(this,this._cartoonStore);
        ancestralCartoons
            .forEach(c => {


            const cartoonNodeDecedents = [...this.tree.postorder(c.node)].filter(n => n !== c.node);
            const cartoonVertex = this._nodeMap.get(c.node);
            const cartoonVertexDecedents = cartoonNodeDecedents.map(n => this._nodeMap.get(n));
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
                const parentVertex = this._nodeMap.get(currentNode.parent);
                if (!parentVertex.node.children ) {
                    parentVertex.y = mean(this.getChildVertices(parentVertex), (child) => this._nodeMap.get(child).y)
                }
                currentNode = parentVertex.node;

            }

            cartoons.push({
                vertices: [cartoonVertex, newTopVertex, newBottomVertex],
                classes: cartoonVertex.classes,
                id: `${cartoonVertex.id}-cartoon`, node: c.node
            })
        });
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

// borrowed from redux naive implementation https://redux.js.org/advanced/middleware
    extendLayout(...middlewares){
        middlewares = middlewares.slice();
        middlewares.reverse();
        let layout = this.layout.bind(this);
        middlewares.forEach(middleware => {
            const wrappedMiddleware = nextLayout=>(context)=>()=>
            {
                nextLayout(context);
                middleware(context);
            };
            layout = wrappedMiddleware(layout)(this);
        });
        this.layout = layout;
        this.layoutKnown=false;
        return this;
    }

    setInitialY() {
        return -0.5;
    }
    setInitialX() {
        return 0;
    }
    setXPosition(vertex,currentX){
        vertex.x = this._horizontalScale(vertex.node.height*this.settings.branchScale);
        return 0;
    }


}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */
export function makeVerticesFromNodes(nodes){
    nodes.forEach((n, i) => {

        if(!this._nodeMap.has(n)&&!this._ignoredNodes.includes(n)){
            const vertex = {
                node: n,
                key: n.id,
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


export function getMostAncestralCartoons(cartoons){
    const cartoonNodes = cartoons.map(c=>c.node);
    const mostAncestralNode = cartoonNodes.filter(n=>![...Tree.pathToRoot(n)].filter(m=>m!==n).some(n=>cartoonNodes.includes(n)));

    return cartoons.filter(c=>mostAncestralNode.includes(c.node));

}

/**
 * This is a helper function that updates a vertices y position by a specified amount. The function is meant to open a gap
 * in the tree below vertices that are moved up and above vertices that are moved down. A side effect of the function is
 * that vertices not listed are moved up (if they are above the selected vertices and the vertices are moved up) and
 * down if they are below the selected vertices and the vertices are moved down. It is meant to be called with this
 * referring to the layout. Remember that the top of plot has y position 0. So positive numbers move the vertices to
 * positions lower on the screen.
 * @param delta
 * @param vertices
 */

export function updateVerticesY(delta,...vertices){

    if(delta>0){
        this._vertices.filter(v=>v.y>max(vertices,v=>v.y))
            .forEach(v=>v.y+=delta);
    }
    else if(delta<0){
        this._vertices.filter(v=>v.y<min(vertices,v=>v.y))
            .forEach(v=>v.y+=delta);
    }
    vertices.forEach(v=>v.y+=delta);
}