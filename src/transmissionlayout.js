"use strict";

/** @module layout */

import { RectangularLayout } from "./rectangularLayout.js";
import {Tree} from "./tree"

export const Direction = {
    UP : Symbol("UP"),
    DOWN : Symbol("DOWN")
};

/**
 * The TransmissionLayout class
 *
 */
export class TransmissionLayout extends RectangularLayout {

    static DEFAULT_SETTINGS() {
        return {
            groupingAnnotation:"host"
        }
    };

    /**
     * The constructor.
     * @param tree
     * @param settings
     */
    constructor(tree, settings = {}) {
        
        //order the tree or something here. add internal nodes ect.
        const groupingAnnotation = {...TransmissionLayout.DEFAULT_SETTINGS(),...settings}['groupingAnnotation'];
        const locationChanges = tree.nodeList.filter(n=>n.parent && n.parent.annotations[groupingAnnotation]!==n.annotations[groupingAnnotation]);

        locationChanges.forEach(node =>{
            const originalLocation = node.parent.annotations[groupingAnnotation];
            const finalLocation = node.annotations[groupingAnnotation];
            const newNodeInLocation = tree.splitBranch(node);
            newNodeInLocation.annotations[groupingAnnotation] = finalLocation;
            const newNodeFromLocation = tree.splitBranch(newNodeInLocation,1.0);
            newNodeFromLocation.annotations[groupingAnnotation] = originalLocation;
        })
        // tree.setup
        const includedInVerticalRange = node  => !node.children || (node.children.length===1 && node.annotations[groupingAnnotation]!==node.children[0].annotations[groupingAnnotation])
        super(tree, {...TransmissionLayout.DEFAULT_SETTINGS(),...{includedInVerticalRange:includedInVerticalRange}, ...settings});

    }


    /**
     * Set the direction to draw transmission (up or down).
     * @param direction
     */
    set direction(direction) {
        this.update();
    }


}



