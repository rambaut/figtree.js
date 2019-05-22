"use strict";

/** @module layout */

import { RectangularLayout } from "./rectangularLayout.js";

export const Direction = {
    UP : Symbol("UP"),
    DOWN : Symbol("DOWN")
};

/**
 * The TransmissionLayout class
 *
 */
export class TransmissionLayout extends RectangularLayout {

    /**
     * The constructor.
     * @param tree
     * @param settings
     */
    constructor(tree, settings = { }) {
        super(tree, settings);

        this._direction = Direction.DOWN;
    }

    /**
     * Set the direction to draw transmission (up or down).
     * @param direction
     */
    set direction(direction) {
        this._direction = direction;
        this.update();
    }

    /**
     * Inherited method overwritten to set the y-position of an internal node to the same as its
     * first child which gives a visual directionality to the tree.
     * @param vertex
     * @param currentY
     * @returns {*}
     */
    setYPosition(vertex, currentY) {
        if (this._direction === Direction.UP) {
            throw new Error("Up direction drawing not implemented yet");
        }

        vertex.y = (vertex.node.children ? this.nodeMap.get(vertex.node.children[0]).y : currentY += 1);
        return currentY;
    }

}
/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

