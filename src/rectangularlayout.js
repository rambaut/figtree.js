"use strict";

/** @module layout */

import { Layout } from "./layout.js";
import { Type } from "./tree.js";
import {curveStepBefore,scaleLinear,line,mean} from "d3";
import {VertexStyle} from "./layout";

// const d3 = require("d3");
/**
 * The Layout class
 *
 */
export class RectangularLayout extends Layout {

    static DEFAULT_SETTINGS() {
        return {
            branchCurve: curveStepBefore,
            radius:0,
        };
    }

    /**
     * The constructor.
     * @param tree
     * @param settings
     */
    constructor(tree, settings = { }) {
        super(tree,{...RectangularLayout.DEFAULT_SETTINGS(),...settings});

    }

    getTreeNodes() {
        return [...this.tree.postorder()]
    }

    updateHorizontalScale() {
        const newScale = this.settings.horizontalScale ? this.settings.horizontalScale :
            scaleLinear().domain([this.tree.rootNode.height*this.settings.branchScale, this.tree.origin]).range(this._horizontalRange);
        return newScale;
    }

    setInitialY() {
        return -1;
    }
    setInitialX() {
        return 0;
    }

    setYPosition(vertex, currentY) {
        // check if there are children that that are in the same group and set position to mean
        // if do something else

        const includedInVertical = this.settings.includedInVerticalRange(vertex.node);
        const focusFactor=vertex.focused||this._previousVertexFocused?this.settings.focusFactor:1;

        if(!includedInVertical){
            // make this better
            const vertexChildren = vertex.node.children.map(child=>this._nodeMap.get(child)).filter(child=>child.visibility===VertexStyle.INCLUDED||child.visibility===VertexStyle.HIDDEN);
            vertex.y = mean(vertexChildren,(child) => child.y);

        }
        else{
            currentY += focusFactor*1;
            vertex.y = currentY;
        }
        this._previousVertexFocused=vertex.focused;
        return currentY;
    }

    setXPosition(vertex,currentX){
        vertex.x = this._horizontalScale(vertex.node.height*this.settings.branchScale);
        return 0;
    }

    branchPathGenerator(scales){
        const branchPath =(e,i)=>{
            const branchLine = line()
                 .x((v) => v.x)
                .y((v) => v.y)
                .curve(this.settings.branchCurve);
            const factor = e.v0.y-e.v1.y>0? 1:-1;
            const dontNeedCurv = e.v0.y-e.v1.y===0?0:1
            const output = this.settings.radius>0?
                branchLine(
                    [{x: 0, y: scales.y(e.v0.y) - scales.y(e.v1.y)},
                    { x:0, y:dontNeedCurv*factor * this.settings.radius},
                    {x:0 + dontNeedCurv*this.settings.radius, y:0},
                {x: scales.x(e.v1.x) - scales.x(e.v0.x), y: 0}
                ]):
                branchLine(
                [{x: 0, y: scales.y(e.v0.y) - scales.y(e.v1.y)},
                    {x: scales.x(e.v1.x) - scales.x(e.v0.x), y: 0}
                    ])
            return(output)
            
        }
        return branchPath;
    }


}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */



