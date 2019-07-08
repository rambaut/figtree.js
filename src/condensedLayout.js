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
export class CondensedLayout extends Layout {

    static DEFAULT_SETTINGS() {
        return {
            branchCurve: curveStepBefore,
            // I'll do the processing out of the class for now
            // but this could be a function that finds the needed
            // nodes.
            cartoonNodes:[],
        };
    }

    /**
     * The constructor.
     * @param tree
     * @param settings
     */
    constructor(tree, settings = { }) {
        super(tree,{...CondensedLayout.DEFAULT_SETTINGS(),...settings});

        // cartoon at nodes of interest and siblings
        // then get all common ancestors. draw the tree with
        // only these nodes (i.e. the common ancestors and cartoons.
        // then annotate some how with how many tips the branches represent.
        this.cartoonNodes = this.settings.cartoonNodes;

    }


    setYPosition(vertex, currentY) {
        // check if there are children that that are in the same group and set position to mean
        // if do something else

        const includedInVertical = this.settings.includedInVerticalRange(vertex.node);
        if(!includedInVertical){
            // make this better

            vertex.y = mean(this.getDecendentsForDrawing(vertex.node.children),(child) => this._nodeMap.get(child).y)
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


    getTreeNodes() {

        const commonAncestors = [];
        for(let i=0;i<this.cartoonNodes.length-2;i++){
            for(let j=i+1;j<this.cartoonNodes.length-1;j++){
                const lca = this.tree.lastCommonAncestor(this.cartoonNodes[i],this.cartoonNodes[j]);
                if(!commonAncestors.find(lca)){
                    commonAncestors.push(lca);
                }
            }
        }
        return [...commonAncestors,...this.cartoonNodes.map(n=>[...this.tree.postorder(n)])]
    }

    getDecendentsForDrawing(vertex){
        return vertex.node.children;

    }

    set cartoonNodes(array){
        // ensure siblings are in cartoonNode array
        this._cartoonNodes = array.reduce((acc,curr)=>{
            if(!acc.includes(curr)){
                acc.push(curr)
            }
            const sib = this.tree.getSibling(curr);
            if(!acc.includes(sib)){
                acc.push(sib)
            }
            return acc
        },[])
    }

    get cartoonNodes(){
        return this._cartoonNodes;
    }



}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */



