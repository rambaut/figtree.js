"use strict";

/** @module roottotipplot */

import {Tree, Type} from "./tree.js";
import {min,max,axisBottom,axisLeft,format,select,event,scaleLinear,line,mean} from "d3";
import {AbstractLayout, VertexStyle} from "./layout/abstractLayout";

/**
 * The RootToTipPlot class
 */
export class RootToTipPlot extends AbstractLayout{


    /**
     * The constructor.
     * @param tree
     * @param settings
     */
    constructor(tree, settings = {}) {
        super(tree,settings)
    }

    // layout() {
    //     this._vertices =
    // }


    _getTreeNodes() {
        return this.tree.externalNodes;
    }
    setInitialY() {
        return 0;
    }
    setInitialX() {
        return 0;
    }
    setXPosition(vertex,currentX){
        vertex.x = this._horizontalScale(vertex.node.date);
        return 0;
    }

    setYPosition(vertex,currentY){
        vertex.y = this.tree.rootToTipLength(vertex.node);
        return vertex.y;
    }
    updateHorizontalScale() {

        const newScale = this.settings.horizontalScale ? this.settings.horizontalScale :
            scaleLinear().domain([this.tree.rootNode.height+this.settings.offset, 0]).range(this._horizontalRange);
        return newScale;
    }

    get edges() {
        // make line
        if (!this.layoutKnown) {
            this.layout();
        }

        const points = this._vertices.filter(v=>v.visibility===VertexStyle.INCLUDED);

        const lineStart = {x:min(points, d => d.x),y:0.0};
        const lineEnd = {x:max(points, d => d.x),y:max(points, d => d.y)};


        const regression = this.leastSquares(points);
        if (points.length > 1 && regression.slope > 0.0) {
            lineStart.x = regression.xIntercept;
            lineEnd.y = max([regression.y(lineEnd.x), lineEnd.y]);
        }


        return {
            v0: lineStart,
            v1: lineEnd,
            key: 'regression'
        }
    }

    /**
     * returns slope, intercept and r-square of the line
     * @param data
     * @returns {{slope: number, xIntercept: number, yIntercept: number, rSquare: number, y: (function(*): number)}}
     */
    leastSquares(data) {

        const xBar = data.reduce((a, b) => (a + b.x), 0.0) / data.length;
        const yBar = data.reduce((a, b) => (a + b.y), 0.0) / data.length;

        const ssXX = data.map((d) => Math.pow(d.x - xBar, 2))
            .reduce((a, b) => a + b, 0.0);

        const ssYY = data.map((d) => Math.pow(d.y - yBar, 2))
            .reduce((a, b) => a + b, 0.0);

        const ssXY = data.map((d) => (d.x - xBar) * (d.y - yBar))
            .reduce((a, b) => a + b, 0.0);

        const slope = ssXY / ssXX;
        const yIntercept = yBar - (xBar * slope);
        const xIntercept = -(yIntercept / slope);
        const rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

        return {
            slope, xIntercept, yIntercept, rSquare, y: function (x) {
                return x * slope + yIntercept
            }
        };
    }

    linkWithTree(treeSVG) {
        const self = this;

        const mouseover = function(d) {
            select(self.svg).select(`#${d.node.id}`).select(`.node-shape`).attr("r", self.settings.hoverNodeRadius);
            select(treeSVG).select(`#${d.node.id}`).select(`.node-shape`).attr("r", self.settings.hoverNodeRadius);
        };
        const mouseout = function(d) {
            select(self.svg).select(`#${d.node.id}`).select(`.node-shape`).attr("r", self.settings.nodeRadius);
            select(treeSVG).select(`#${d.node.id}`).select(`.node-shape`).attr("r", self.settings.nodeRadius);
        };
        const clicked = function(d) {
            // toggle isSelected
            let tip = d;
            if (d.node) {
                tip = d.node;
            }
            tip.isSelected = !tip.isSelected;

            const node1 = select(self.svg).select(`#${tip.id}`).select(`.node-shape`);
            const node2 = select(treeSVG).select(`#${tip.id}`).select(`.node-shape`);

            if (tip.isSelected) {
                node1.attr("class", "node-shape selected");
                node2.attr("class", "node-shape selected");
            } else {
                node1.attr("class", "node-shape unselected");
                node2.attr("class", "node-shape unselected");
            }

            self.update();
        };

        const tips = select(this.svg).selectAll(`.external-node`).selectAll(`.node-shape`);
        tips.on("mouseover", mouseover);
        tips.on("mouseout", mouseout);
        tips.on("click", clicked);

        const points = select(treeSVG).selectAll(`.node-shape`);
        points.on("mouseover", mouseover);
        points.on("mouseout", mouseout);
        points.on("click", clicked);
    }
}


