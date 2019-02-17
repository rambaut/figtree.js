"use strict";

/** @module roottotipplot */

import {Tree} from "./tree.js";

/**
 * The RootToTipPlot class
 */
export class RootToTipPlot {

    static DEFAULT_SETTINGS() {
        return {
            xAxisTickArguments: [5, "d"],
            xAxisTitle: "Time",
            yAxisTickArguments: [5, "f"],
            yAxisTitle: "Divergence",
            nodeRadius: 6,
            hoverNodeRadius: 8,
            slopeFormat: ",.2f",
            r2Format: ",.2f"
        };
    }

    /**
     * The constructor.
     * @param svg
     * @param tree
     * @param margins
     * @param settings
     */
    constructor(svg, tree, margins, settings = {}) {
        this.svg = svg;
        this.tree = tree;

        // merge the default settings with the supplied settings
        this.settings = {...RootToTipPlot.DEFAULT_SETTINGS(), ...settings};

        this.points = tree.externalNodes
            .map((tip) => {
                return {
                    name: tip.name,
                    tip: tip,
                    x: tip.date,
                    y: tree.rootToTipLength(tip)
                };
            });

        // get the size of the svg we are drawing on
        const width = svg.getBoundingClientRect().width;
        const height = svg.getBoundingClientRect().height;

        d3.select(svg).select("g").remove();

        // add a group which will containt the new tree
        d3.select(svg).append("g");
            //.attr("transform", `translate(${margins.left},${margins.top})`);

        //to save on writing later
        this.svgSelection = d3.select(svg).select("g");

        // least squares regression
        const regression = this.leastSquares(this.points);
        const x1 = regression.xIntercept;
        const y1 = 0.0;
        const x2 = d3.max(this.points, d => d.x);
        const y2 = d3.max([regression.y(x2), d3.max(this.points, d => d.y)]);

        this.scales = {
            x: d3.scaleLinear()
                .domain([x1, x2]).nice()
                .range([margins.left, width - margins.right]),
            y: d3.scaleLinear()
                .domain([y1, y2]).nice()
                .range([height - margins.bottom, margins.top])
        };

        const xAxis = d3.axisBottom(this.scales.x)
            .tickArguments(this.settings.xAxisTickArguments);
        const yAxis = d3.axisLeft(this.scales.y)
            .tickArguments(this.settings.yAxisTickArguments);

        const xAxisWidth = width - margins.left - margins.right;
        const yAxisHeight = height - margins.bottom - margins.top;

        this.svgSelection.append("g")
            .attr("id", "x-axis")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height - margins.bottom + 5})`)
            .call(xAxis);

        this.svgSelection.append("g")
            .attr("id", "x-axis-label")
            .attr("class", "axis-label")
            .attr("transform", `translate(${margins.left}, ${height - margins.bottom})`)
            .append("text")
            .attr("transform", `translate(${xAxisWidth / 2}, 35)`)
            .attr("alignment-baseline", "hanging")
            .style("text-anchor", "middle")
            .text(this.settings.xAxisTitle);

        this.svgSelection.append("g")
            .attr("id", "y-axis")
            .attr("class", "axis")
            .attr("transform", `translate(${margins.left - 5},0)`)
            .call(yAxis);

        this.svgSelection.append("g")
            .attr("id", "y-axis-label")
            .attr("class", "axis-label")
            .attr("transform", `translate(${margins.left},${margins.top})`)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margins.left)
            .attr("x", 0 - (yAxisHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(this.settings.yAxisTitle);

        this.svgSelection.append("line")
            .attr("id", "regression")
            .attr("class", "trend-line")
            .attr("x1", this.scales.x(x1))
            .attr("y1", this.scales.y(y1))
            .attr("x2", this.scales.x(x1))
            .attr("y2", this.scales.y(y1));

        this.svgSelection.append("g")
            .selectAll("circle")
            .data(this.points)
            .enter()
            .append("g")
            .attr("id", d => d.tip.name )
            .attr("class", "node external-node")
            .attr("transform", `translate(${this.scales.x(x1)}, ${this.scales.y(y1)})`)
            .append("circle")
            .attr("class", "node-shape unselected")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", this.settings.nodeRadius);

        this.svgSelection.append("text")
            .attr("id", "statistics-slope")
            .attr("transform", `translate(${margins.left + 20},${margins.top})`)
            .style("text-anchor", "left")
            .attr("alignment-baseline", "hanging")
            .attr("dy", "0")
            .text(`Slope: -`);
        this.svgSelection.append("text")
            .attr("id", "statistics-r2")
            .attr("transform", `translate(${margins.left + 20},${margins.top})`)
            .style("text-anchor", "left")
            .attr("alignment-baseline", "hanging")
            .attr("dy", "1.5em")
            .text(`R^2: -`);

        this.update();

        this.tree.treeUpdateCallback = () => this.update();
    };

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

    /**
     * Updates the plot when the data has changed
     */
    update() {

        this.points.forEach((point) => {
            point.y = this.tree.rootToTipLength(point.tip);
        });

        let x1 = d3.min(this.points, d => d.x);
        let x2 = d3.max(this.points, d => d.x);
        let y1 = 0.0;
        let y2 = d3.max(this.points, d => d.y);

        // least squares regression
        const selectedPoints = this.points.filter((point) => !point.tip.isSelected);

        const regression = this.leastSquares(selectedPoints);
        if (selectedPoints.length > 1 && regression.slope > 0.0) {
            x1 = regression.xIntercept;
            y2 = d3.max([regression.y(x2), y2]);
        }

        // update the scales for the plot
        this.scales.x.domain([x1, x2]).nice();
        this.scales.y.domain([y1, y2]).nice();

        const xAxis = d3.axisBottom(this.scales.x)
            .tickArguments(this.settings.xAxisTickArguments);
        const yAxis = d3.axisLeft(this.scales.y)
            .tickArguments(this.settings.yAxisTickArguments);

        this.svgSelection.select("#x-axis")
            .transition()
            .duration(500)
            .call(xAxis);

        this.svgSelection.select("#y-axis")
            .transition()
            .duration(500)
            .call(yAxis);

        // update trend line
        const line = this.svgSelection.select("#regression");
        if (selectedPoints.length > 1) {

            line
                .transition()
                .duration(500)
                .attr("x1", this.scales.x(x1))
                .attr("y1", this.scales.y(regression.y(x1)))
                .attr("x2", this.scales.x(x2))
                .attr("y2", this.scales.y(regression.y(x2)));

            this.svgSelection.select("#statistics-slope")
                .text(`Slope: ${d3.format(this.settings.slopeFormat)(regression.slope)}`);
            this.svgSelection.select("#statistics-r2")
                .text(`R^2: ${d3.format(this.settings.r2Format)(regression.rSquare) }`);

        } else {
            line
                .transition()
                .duration(500)
                .attr("x1", this.scales.x(0))
                .attr("y1", this.scales.y(regression.y(0)))
                .attr("x2", this.scales.x(0))
                .attr("y2", this.scales.y(regression.y(0)));

            this.svgSelection.select("#statistics-slope")
                .text(`Slope: n/a`);
            this.svgSelection.select("#statistics-r2")
                .text(`R^2: n/a`);

        }

        //update points
        this.svgSelection.selectAll(".external-node")
        // .data(data, node => node.tip.name)
            .transition()
            .duration(500)
            .attr("transform", d => {
                return `translate(${this.scales.x(d.x)}, ${this.scales.y(d.y)})`;
            });
    }

    selectTips(treeSVG, tips) {
        const self = this;
        tips.forEach(tip => {
            const node1 = d3.select(self.svg).select(`#${tip}`).select(`.node-shape`);
            const node2 = d3.select(treeSVG).select(`#${tip}`).select(`.node-shape`);
            node1.attr("class", "node-shape selected");
            node2.attr("class", "node-shape selected");
            const node = this.tree.externalNodes.filter(d => d.name === tip)[0];
            node.isSelected = true;

        })
        self.update();
    }

    linkWithTree(treeSVG) {
        const self = this;

        const mouseover = function(d) {
            d3.select(self.svg).select(`#${d.name}`).select(`.node-shape`).attr("r", self.settings.hoverNodeRadius);
            d3.select(treeSVG).select(`#${d.name}`).select(`.node-shape`).attr("r", self.settings.hoverNodeRadius);
        };
        const mouseout = function(d) {
            d3.select(self.svg).select(`#${d.name}`).select(`.node-shape`).attr("r", self.settings.nodeRadius);
            d3.select(treeSVG).select(`#${d.name}`).select(`.node-shape`).attr("r", self.settings.nodeRadius);
        };
        const clicked = function(d) {
            // toggle isSelected
            let tip = d;
            if (d.tip) {
                tip = d.tip;
            }
            tip.isSelected = !tip.isSelected;

            const node1 = d3.select(self.svg).select(`#${d.name}`).select(`.node-shape`);
            const node2 = d3.select(treeSVG).select(`#${d.name}`).select(`.node-shape`);

            if (tip.isSelected) {
                node1.attr("class", "node-shape selected");
                node2.attr("class", "node-shape selected");
            } else {
                node1.attr("class", "node-shape unselected");
                node2.attr("class", "node-shape unselected");
            }

            self.update();
        };

        const tips = d3.select(this.svg).selectAll(`.external-node`).selectAll(`.node-shape`);
        tips.on("mouseover", mouseover);
        tips.on("mouseout", mouseout);
        tips.on("click", clicked);

        const points = d3.select(treeSVG).selectAll(`.node-shape`);
        points.on("mouseover", mouseover);
        points.on("mouseout", mouseout);
        points.on("click", clicked);
    }

}
