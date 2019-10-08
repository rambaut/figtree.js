"use strict";

/** @module roottotipplot */

import {Tree, Type} from "./tree.js";
import {min,max,axisBottom,axisLeft,format,select,event,scaleLinear,line,mean} from "d3";
import {
    AbstractLayout,
    makeEdgesFromNodes,
    VertexStyle,
    setVertexClasses,
    setVertexLabels,
    makeVerticesFromNodes
} from "./layout/abstractLayout";
import extent from "d3-array/src/extent";

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

    layout() {
        const treeNodes = this._getTreeNodes();

        this[makeVerticesFromNodes](treeNodes);

        // update the node locations (vertices)
        treeNodes.forEach((n) => {
            const v = this._nodeMap.get(n);

            this.setYPosition(v, null);
            this.setXPosition(v, null);
            v.id = v.node.id;
            this[setVertexClasses](v);
            this[setVertexLabels](v);
        });

        const regression  = this.leastSquares(this._vertices.filter(v=>v.visibility===VertexStyle.INCLUDED));

        let x1 = min(this._vertices, d => d.x);
        let x2 = max(this._vertices, d => d.x);
        let y1 = 0.0;
        let y2 = max(this._vertices, d => d.y);
        if (this._vertices.filter(v=>v.visibility===VertexStyle.INCLUDED).length > 1 && regression.slope > 0.0) {
            x1 = regression.xIntercept;
            y2 = max([regression.y(x2), y2]);
        }
        const startPoint = {key:"startPoint",visibility:VertexStyle.HIDDEN,x:x1,y:y1};
        const endPoint = {key:"EndPoint",visibility:VertexStyle.HIDDEN,x:x2,y:y2};
        this._vertices.push(startPoint);
        this._vertices.push(endPoint);
        this._edges=[{v0:startPoint,v1:endPoint,key:"line",classes:[]}];
        this.layoutKnown = true;

    }


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
        vertex.x = vertex.node.annotations.date;
        return 0;
    }

    setYPosition(vertex,currentY){
        vertex.y = this.tree.rootToTipLength(vertex.node);
        return vertex.y;
    }

    get horizontalDomain() {
        if (!this.layoutKnown) {
            this.layout();
        }
        const xPositions = [...this._vertices.map(d=>d.x),min(this._vertices.map(d=>d.x))];
        return [min(xPositions),max(xPositions)];
    }

    get verticalDomain() {
        if (!this.layoutKnown) {
            this.layout();
        }
        const yPositions = [...this._vertices.map(d=>d.y),min(this._vertices.map(d=>d.y))];
        return [max(yPositions),min(yPositions)];
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


