"use strict";

/** @module layout */

import { RectangularLayout } from "./rectangularLayout.js";
import {mean} from "d3";
import {VertexStyle} from "./layout";


export const Direction = {
    UP : Symbol("UP"),
    DOWN : Symbol("DOWN")
};

/**
 * The TransmissionLayout class
 * Only works for 'up' directions
 *
 */
export class TransmissionLayout extends RectangularLayout {

    static DEFAULT_SETTINGS() {
        return {
            groupingAnnotation:"host",
            direction:"up",
            groupGap: 5,
        }
    };

    /**
     * The constructor.
     * @param tree
     * @param settings
     */
    constructor(tree, settings = {}) {
        const groupingAnnotation = {...TransmissionLayout.DEFAULT_SETTINGS(),...settings}['groupingAnnotation'];
        // defined here so we can use the groupingAnnotation key
        const includedInVerticalRange = node  => !node.children || (node.children.length===1 && node.annotations[groupingAnnotation]!==node.children[0].annotations[groupingAnnotation])
        super(tree, {...TransmissionLayout.DEFAULT_SETTINGS(),...{includedInVerticalRange:includedInVerticalRange}, ...settings});

    }

    setYPosition(vertex, currentY) {
        const focusFactor=vertex.focused||this._previousVertexFocused?this.settings.focusFactor:1;

        const includedInVertical = this.settings.includedInVerticalRange(vertex.node);
        if (!includedInVertical) {
            const vertexChildren = vertex.node.children.map(child=>this._nodeMap.get(child)).filter(child=>child.visibility===VertexStyle.INCLUDED||child.visibility===VertexStyle.HIDDEN);
            vertex.y = mean(vertexChildren,(child) => child.y);

        } else {
            if(vertex.node.children &&(  vertex.node.children.length===1 && vertex.node.annotations[this.settings.groupingAnnotation]!==vertex.node.children[0].annotations[this.settings.groupingAnnotation])){
                currentY+=focusFactor*this.settings.groupGap;
            }else{
                currentY += focusFactor*1;
            }
            vertex.y = currentY;
        }
        this._previousVertexFocused=vertex.focused;

        return currentY;
    }

    /**
     * Set the direction to draw transmission (up or down).
     * @param direction
     */
    // set direction(direction) {
    //     this.update();
    // }

}



