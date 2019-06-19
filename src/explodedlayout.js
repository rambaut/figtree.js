"use strict";

/** @module layout */

import { RectangularLayout } from "./rectangularLayout.js";

/**
 * The ExplodedLayout class
 *
 * This class lays out a tree annotated by a trait so that it is broken into subtrees
 * where ever the trait changes.
 */
export class ExplodedLayout extends RectangularLayout {

    /**
     * The constructor.
     * @param tree
     * @param settings
     */
    constructor(tree, settings = { }) {
        super(tree, settings);
    }

    /**
     * Inherited method overwritten to set the y-position of an internal node to the same as its
     * first child which gives a visual directionality to the tree.
     * @param vertex
     * @param currentY
     * @returns {*}
     */
    setYPosition(vertex, currentY) {
        throw Error("Not implemented yet");
    }

}
/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

