"use strict";

/** @module layout */

import { Layout } from "./layout.js";
import { Type } from "./tree.js";
import {format,curveStepBefore,max,min,line,mean,scaleLinear,curveLinear} from "d3";

// const d3 = require("d3");
/**
 * The Layout class
 *
 */
export class RectangularLayout extends Layout {

    static DEFAULT_SETTINGS() {
        return {
            branchCurve: curveStepBefore,
        };
    }

    /**
     * The constructor.
     * @param tree
     * @param settings
     */
    constructor(tree, settings = { }) {
        super(tree,{...RectangularLayout.DEFAULT_SETTINGS(),...{settings}});

    }


    setYPosition(vertex, currentY) {
        // check if there are children that that are in the same group and set position to mean
        // if do something else

        const includedInVertical = this.settings.includedInVerticalRange(vertex.node);
        if(!includedInVertical){
            // make this better

            vertex.y = mean(vertex.node.children,(child) => this._nodeMap.get(child).y)
        }
        else{
            currentY+=1;
            vertex.y = currentY;
        }
        return currentY;
    }

    branchPathGenerator(scales){
        const branchPath =(e,i)=>{
            const branchLine = line()
                 .x((v) => v.x)
                .y((v) => v.y)
                .curve(this.settings.branchCurve);
            return(
                branchLine(
                    [{x: 0, y: scales.y(e.v0.y) - scales.y(e.v1.y)},
                    {x: scales.x(e.v1.x) - scales.x(e.v0.x), y: 0}]
                )
            )
            
        }
        return branchPath;
    }


}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */



