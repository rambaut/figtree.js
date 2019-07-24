"use strict";

/** @module layout */

import { RectangularLayout } from "./rectangularLayout.js";
import {min,mean} from "d3";
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
export class ExplodedLayout extends RectangularLayout {

    static DEFAULT_SETTINGS() {
        return {
            groupingAnnotation:"host",
            direction:"up",
            interGroupGap:10,
            intraGroupGap:5,
            focusFactor:1,

        }
    };

    /**
     * The constructor.
     * @param tree
     * @param settings
     */
    constructor(tree, settings = {}) {
        const groupingAnnotation = {...ExplodedLayout.DEFAULT_SETTINGS(),...settings}['groupingAnnotation'];

        // defined here so we can use the groupingAnnotation key
        const includedInVerticalRange = node  => !node.children || (node.children.length===1 && node.annotations[groupingAnnotation]!==node.children[0].annotations[groupingAnnotation])
        super(tree, {...ExplodedLayout.DEFAULT_SETTINGS(),...{includedInVerticalRange:includedInVerticalRange}, ...settings});
        this.groupingAnnotation = groupingAnnotation;
    }

    getTreeNodes() {
        // order first by grouping annotation and then by postorder
        const postOrderNodes = [...this.tree.postorder()];

        const groupHeights = new Map()
        for(const group of this.tree.annotations[this.groupingAnnotation].values){
            const height = min(postOrderNodes.filter(n=>n.annotations[this.groupingAnnotation]===group),d=>d.height);
            groupHeights.set(group,height);
        }
        // sort by location and then by post order order but we want all import/export banches to be last
        return([...this.tree.postorder()].sort((a,b)=>{
            if(a.annotations[this.groupingAnnotation]===b.annotations[this.groupingAnnotation]){
                return postOrderNodes.indexOf(a)-postOrderNodes.indexOf(b);
            }else{
                    return -1*(groupHeights.get(a.annotations[this.groupingAnnotation]) -  groupHeights.get(b.annotations[this.groupingAnnotation]))
                }
        }))


    }

    setYPosition(vertex, currentY) {
        // check if there are children that that are in the same group and set position to mean
        // if do something else
        if(currentY===this.setInitialY()) {
            this._currentGroup = vertex.node.annotations[this.groupingAnnotation];
        }
        const focusFactor=vertex.focused||this._previousVertexFocused?this.settings.focusFactor:1;

        const includedInVertical = this.settings.includedInVerticalRange(vertex.node);
        if (!includedInVertical) {
            vertex.y = mean(vertex.node.children,(child) => {
                const childVertex = this._nodeMap.get(child);
                if(childVertex.visibility===VertexStyle.INCLUDED||childVertex.visibility===VertexStyle.HIDDEN){
                    return childVertex.y
                }else{
                    return null;
                }
            })
            if(vertex.node.parent){
                if(vertex.node.annotations[this.groupingAnnotation]!==vertex.node.parent.annotations[this.groupingAnnotation]){
                    this._newIntraGroupNext=true;
                }
            }

        } else {
            if(vertex.node.annotations[this.groupingAnnotation]!==this._currentGroup){
                currentY+=focusFactor*this.settings.interGroupGap;
                this._newIntraGroupNext = false;
            }
            else if(this._newIntraGroupNext){
                currentY+=focusFactor*this.settings.intraGroupGap;
                this._newIntraGroupNext = false;
            }else{
                currentY += focusFactor*1;
            }
            this._currentGroup= vertex.node.annotations[this.groupingAnnotation];
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




/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

