"use strict";

/** @module layout */

import { RectangularLayout } from "./rectangularLayout.js";


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
            direction:"up"
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

    /**
     * Set the direction to draw transmission (up or down).
     * @param direction
     */
    // set direction(direction) {
    //     this.update();
    // }

}



