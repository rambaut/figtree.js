"use strict";

/** @module layout */

import { RectangularLayout } from "./rectangularLayout.js";
import {Type} from "./tree";
import {format,curveStepBefore,max,line,mean,scaleLinear} from "d3";


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
    constructor(tree, settings = { _groupingAnnotation: "host"}) {
        super(tree, settings);

        this._direction = Direction.DOWN;
        this.groupingAnnotation = this.settings._groupingAnnotation;
    }

    /**
     * Set the direction to draw transmission (up or down).
     * @param direction
     */
    set direction(direction) {
        this._direction = direction;
        this.update();
    }

    set groupingAnnotation(annotation){
        if(Object.keys(this.tree.annotations).indexOf(annotation)===-1){
            throw(new Error(`tree is not annotated with : ${annotation} `))
        }
        this._groupingAnnotation = annotation;
    }

    /**
     * Inherited method overwritten to set the y-position of an internal node to the same as its
     * first child which gives a visual directionality to the tree.
     * @param vertex
     * @param currentY
     * @returns {*}
     */
    // setYPosition(vertex, currentY) {
    //     if (this._direction === Direction.UP) {
    //         throw new Error("Up direction drawing not implemented yet");
    //     }
    //
    //     vertex.y = (vertex.node.children ? this.nodeMap.get(vertex.node.children[0]).y : currentY += 1);
    //     return currentY;
    // }
    setYPosition(vertex, currentY) {
        // check if there are children that that are in the same group and set position to mean
        // if do something else
        vertex.y = (vertex.node.children ? mean(vertex.node.children.filter(child => child.annotations[this._groupingAnnotation]===vertex.node.annotations[this._groupingAnnotation]), (child) => this.nodeMap.get(child).y) : currentY += 1);
        return currentY;
    }

}
/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

