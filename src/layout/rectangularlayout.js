"use strict";

/** @module layout */

import { AbstractLayout } from "./abstractLayout.js";
import {mean} from "d3";
import {VertexStyle} from "./abstractLayout";

/**
 * The rectangular layout class
 *
 */
export class RectangularLayout extends AbstractLayout {


    /**
     * The constructor.
     * @param tree
     * @param settings
     */
    constructor(tree, settings = { },...middlewares) {
        super(tree,settings,...middlewares);

    }

    getTreeNodes() {
        return [...this.tree.postorder()]
    }

    setInitialY() {
        return -0.5;
    }
    setInitialX() {
        return 0;
    }

    setYPosition(vertex, currentY) {
        const includedInVertical = !vertex.node.children;
        if(!includedInVertical){
            // make this better
            const vertexChildren = vertex.node.children.map(child=>this._nodeMap.get(child)).filter(child=>child.visibility===VertexStyle.INCLUDED||child.visibility===VertexStyle.HIDDEN);
            vertex.y = mean(vertexChildren,(child) => child.y);
        }
        else{
            currentY += 1;
            vertex.y = currentY;
        }
        return currentY;
    }

    setXPosition(vertex,currentX){
        vertex.x = this._horizontalScale(vertex.node.height*this.settings.branchScale);
        return 0;
    }




}



