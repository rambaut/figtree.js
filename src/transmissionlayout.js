"use strict";

/** @module layout */

import {mean} from "d3";
import {AbstractLayout, VertexStyle} from "./layout/abstractLayout";


export const Direction = {
    UP : Symbol("UP"),
    DOWN : Symbol("DOWN")
};

/**
 * The TransmissionLayout class
 * Only works for 'up' directions
 *
 */
export class TransmissionLayout extends AbstractLayout {

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
        super(tree, {...TransmissionLayout.DEFAULT_SETTINGS(), ...settings});
    }

    //TODO rework this so it loops through twice and updates accordinglin when there is a group change.
    setYPosition(vertex, currentY) {
        const node = vertex.node;
        const includedInVerticalRange = !node.children || (node.children.length===1 && node.annotations[this.settings.groupingAnnotation]!==node.children[0].annotations[this.settings.groupingAnnotation]);
        if (!includedInVertical) {
            const vertexChildren = vertex.node.children.map(child=>this._nodeMap.get(child)).filter(child=>child.visibility===VertexStyle.INCLUDED||child.visibility===VertexStyle.HIDDEN);
            vertex.y = mean(vertexChildren,(child) => child.y);

        } else {
            if(vertex.node.children &&(  vertex.node.children.length===1 && vertex.node.annotations[this.settings.groupingAnnotation]!==vertex.node.children[0].annotations[this.settings.groupingAnnotation])){
                currentY+=this.settings.groupGap;
            }else{
                currentY += 1;
            }
            vertex.y = currentY;
        }
        this._previousVertexFocused=vertex.focused;

        return currentY;
    }

}



