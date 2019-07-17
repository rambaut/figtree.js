"use strict";

/** @module layout */

import { RectangularLayout } from "./rectangularLayout.js";
import {mean} from "d3";


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
        // check if there are children that that are in the same group and set position to mean
        // if do something else
        if(currentY===this.setInitialY()) {
            this._currentGroup = vertex.node.annotations[this.groupingAnnotation];
        }

        const includedInVertical = this.settings.includedInVerticalRange(vertex.node);
        if (!includedInVertical) {
            vertex.y = mean(vertex.node.children, (child) => this._nodeMap.get(child).y);
        } else {
            if(vertex.node.children &&(  vertex.node.children.length===1 && vertex.node.annotations[this.settings.groupingAnnotation]!==vertex.node.children[0].annotations[this.settings.groupingAnnotation])){
                console.log("gapit")
                currentY+=this.settings.groupGap;
            }else{
                currentY += 1;
            }
            this._currentGroup= vertex.node.annotations[this.groupingAnnotation];
            vertex.y = currentY;
        }

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



