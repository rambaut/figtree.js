import {Tree} from './tree.js';

/**
 * The RootToTipPlot class
 */
export class RootToTipPlot {

    /**
     * The constructor.
     * @param svg
     * @param tree
     * @param margins
     */
    constructor(svg, tree, margins) {
        this.svg = svg;
        this.tree = tree;

        const data = tree.externalNodes
            .filter((tip) => !tip.isSelected)
            .map((tip) => {
                return {
                    name: tip.name,
                    x: tip.date,
                    y: tree.rootToTipLength(tip)
                };
            });

        data.xLabel = "Time";
        data.yLabel = "Divergence";

        // get the size of the svg we are drawing on
        const width = svg.getBoundingClientRect().width;
        const height = svg.getBoundingClientRect().height;

        d3.select(svg).select('g').remove();

        // add a group which will containt the new tree
        d3.select(svg).append('g')
            .attr('transform', `translate(${margins.left},${margins.top})`);

        //to save on writing later
        this.svgSelection = d3.select(svg).select('g');

        // least squares regression
        const regression = this.leastSquares(data);
        const x1 = regression.xIntercept;
        const y1 = 0.0;
        const x2 = d3.max(data, d => d.x);
        const y2 = d3.max([regression.y(x2), d3.max(data, d => d.y)]);

        this.scales = {
            x: d3.scaleLinear()
                .domain([x1, x2]).nice()
                .range([margins.left, width - margins.right]),
            y: d3.scaleLinear()
                .domain([y1, y2]).nice()
                .range([height - margins.bottom, margins.top])
        };

        const xAxis = d3.axisBottom(this.scales.x)
            .tickArguments([5, "d"]);
        const yAxis = d3.axisLeft(this.scales.y)
            .tickArguments([5, "s"]);

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
            .text("Time");

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
            .text("Divergence");

        this.svgSelection.append("line")
            .attr("id", "regression")
            .attr("class", "trend-line")
            .attr("x1", this.scales.x(x1))
            .attr("y1", this.scales.y(y1))
            .attr("x2", this.scales.x(x1))
            .attr("y2", this.scales.y(y1));

        this.svgSelection.append("g")
            .selectAll("circle")
            .data(data, point => point.name)
            .enter()
            .append("g")
            .attr("id", d => d.name)
            .attr("class", "node external-node")
            .attr("transform", `translate(${this.scales.x(x1)}, ${this.scales.y(y1)})`)
            .append("circle")
            .attr("class", "node-shape unselected")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 6);

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

        const ssXX = data.map(function (d) {
            return Math.pow(d.x - xBar, 2);
        })
            .reduce((a, b) => a + b, 0.0);

        const ssYY = data.map(function (d) {
            return Math.pow(d.y - yBar, 2);
        })
            .reduce((a, b) => a + b, 0.0);

        const ssXY = data.map(function (d) {
            return (d.x - xBar) * (d.y - yBar);
        })
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

        // get new positions
        const data = this.tree.externalNodes
            .filter((tip) => !tip.isSelected)
            .map((tip) => {
                return {
                    name: tip.name,
                    x: tip.date,
                    y: this.tree.rootToTipLength(tip)
                };
            });

        // least squares regression
        const regression = this.leastSquares(data);
        let x1 = regression.xIntercept;
        let x2 = d3.max(data, d => d.x);
        if (regression.slope < 0.0) {
            x1 = d3.min(data, d => d.x);
            x2 = d3.max(data, d => d.x);
        }
        let y1 = 0.0;
        let y2 = d3.max([regression.y(x2), d3.max(data, d => d.y)]);

        // update the scales for the plot
        this.scales.x.domain([x1, x2]).nice();
        this.scales.y.domain([y1, y2]).nice();

        const xAxis = d3.axisBottom(this.scales.x)
            .tickArguments([5, "d"]);
        const yAxis = d3.axisLeft(this.scales.y)
            .tickArguments([5, "s"]);

        this.svgSelection.select("#x-axis")
            .transition()
            .duration(500)
            .call(xAxis);

        this.svgSelection.select("#y-axis")
            .transition()
            .duration(500)
            .call(yAxis);

        // update trend line
        const line = this.svgSelection.select('#regression');
        line
            .transition()
            .duration(500)
            .attr("x1", this.scales.x(x1))
            .attr("y1", this.scales.y(regression.y(x1)))
            .attr("x2", this.scales.x(x2))
            .attr("y2", this.scales.y(regression.y(x2)));

        this.svgSelection.select("#statistics-slope")
            .text(`Slope: ${d3.format(",.2f")(regression.slope)}`);
        this.svgSelection.select("#statistics-r2")
            .text(`R^2: ${d3.format(",.2f")(regression.rSquare) }`);

        //update points
        this.svgSelection.selectAll('.external-node')
            .data(data, node => node.name)
            .transition()
            .duration(500)
            .attr("transform", d => {
                return `translate(${this.scales.x(d.x)}, ${this.scales.y(d.y)})`;
            });
    }


    linkWithTree(treeSVG) {
        const self = this;

        const mouseover = function (d) {
            d3.select(this.svg).select(`#${d.name}`).select(`.node-shape`).attr('r', 9);
            d3.select(treeSVG).select(`#${d.name}`).select(`.node-shape`).attr('r', 9);
        };
        const mouseout = function (d) {
            d3.select(this.svg).select(`#${d.name}`).select(`.node-shape`).attr('r', 6);
            d3.select(treeSVG).select(`#${d.name}`).select(`.node-shape`).attr('r', 6);
        };
        const clicked = function (d) {
            // toggle isSelected
            d.isSelected = !d.isSelected;

            const node1 = d3.select(this.svg).select(`#${d.name}`).select(`.node-shape`);
            const node2 = d3.select(treeSVG).select(`#${d.name}`).select(`.node-shape`);

            if (d.isSelected) {
                node1.attr('class', 'node-shape selected');
                node2.attr('class', 'node-shape selected');
            } else {
                node1.attr('class', 'node-shape unselected');
                node2.attr('class', 'node-shape unselected');
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