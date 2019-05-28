"use strict";

/** @module layout */


/**
 * The Layout class
 *
 */
export class Layout {

    /**
     * The constructor.
     */
    constructor( ) {

        // default ranges - these should be set in layout()
        this._horizontalRange = [0.0, 1.0];
        this._verticalRange = [0, 1.0];
        this._horizontalTicks= [0,0.5,1]

        // create an empty callback function
        this.updateCallback = () => { };
    }

    /**
     * An abstract base class for a layout class. The aim is to describe the API of the class.
     *
     * @param vertices - objects with an x, y coordinates and a reference to the original node
     * @param edges - objects with v1 (a vertex) and v0 (the parent vertex).
     */
    layout(vertices, edges) { }

    get horizontalRange() {
        return this._horizontalRange;
    }

    get verticalRange() {
        return this._verticalRange;
    }
    get horizontalAxisTicks(){
        return this._horizontalTicks;
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

