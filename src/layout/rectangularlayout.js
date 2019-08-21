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
    constructor(tree, settings = { }) {
        super(tree,settings);

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
        // check if there are children that that are in the same group and set position to mean
        // if do something else

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

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */



