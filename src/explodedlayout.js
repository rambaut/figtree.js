"use strict";

/** @module layout */

import { RectangularLayout } from "./layout/rectangularlayout.js";
import {min,mean} from "d3";
import {VertexStyle} from "./layout/abstractLayout";


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

        super(tree, {...ExplodedLayout.DEFAULT_SETTINGS(), ...settings});
    }

    getTreeNodes() {
        // order first by grouping annotation and then by postorder
        const postOrderNodes = [...this.tree.postorder()];

        const groupHeights = new Map();
        for(const group of this.tree.annotations[this.settings.groupingAnnotation].values){
            const height = min(postOrderNodes.filter(n=>n.annotations[this.settings.groupingAnnotation]===group),d=>d.height);
            groupHeights.set(group,height);
        }
        // sort by location and then by post order order but we want all import/export banches to be last
        return([...this.tree.postorder()].sort((a,b)=>{
            if(a.annotations[this.settings.groupingAnnotation]===b.annotations[this.settings.groupingAnnotation]){
                return postOrderNodes.indexOf(a)-postOrderNodes.indexOf(b);
            }else{
                    return -1*(groupHeights.get(a.annotations[this.settings.groupingAnnotation]) -  groupHeights.get(b.annotations[this.settings.groupingAnnotation]))
                }
        }))


    }

    setYPosition(vertex, currentY) {
        // check if there are children that that are in the same group and set position to mean
        // if do something else
        if(currentY===this.setInitialY()) {
            this._currentGroup = vertex.node.annotations[this.settings.groupingAnnotation];
        };
        const includedInVertical = this.settings.includedInVerticalRange(vertex.node);
        if (!includedInVertical) {
            vertex.y = mean(vertex.node.children,(child) => {
                const childVertex = this._nodeMap.get(child);
                if(childVertex.visibility===VertexStyle.INCLUDED||childVertex.visibility===VertexStyle.HIDDEN){
                    return childVertex.y
                }else{
                    return null;
                }
            });
            if(vertex.node.parent){
                if(vertex.node.annotations[this.settings.groupingAnnotation]!==vertex.node.parent.annotations[this.settings.groupingAnnotation]){
                    this._newIntraGroupNext=true;
                }
            }

        } else {
            if(vertex.node.annotations[this.settings.groupingAnnotation]!==this._currentGroup){
                currentY+=this.settings.interGroupGap;
                this._newIntraGroupNext = false;
            }
            else if(this._newIntraGroupNext){
                currentY+=this.settings.intraGroupGap;
                this._newIntraGroupNext = false;
            }else{
                currentY += 1;
            }
            this._currentGroup= vertex.node.annotations[this.settings.groupingAnnotation];
            vertex.y = currentY;
        }

        return currentY;
    }

}




/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

