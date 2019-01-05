import {Tree} from './tree.js';

// returns slope, intercept and r-square of the line
function leastSquares(data) {

    const xBar = data.reduce((a, b) => (a + b.x), 0.0) / data.length;
    const yBar = data.reduce((a, b) => (a + b.y), 0.0) / data.length;

    const ssXX = data.map(function(d) { return Math.pow(d.x - xBar, 2); })
        .reduce((a, b) => a + b, 0.0);

    const ssYY = data.map(function(d) { return Math.pow(d.y - yBar, 2); })
        .reduce((a, b) => a + b, 0.0);

    const ssXY = data.map(function(d) { return (d.x - xBar) * (d.y - yBar); })
        .reduce((a, b) => a + b, 0.0);

    const slope = ssXY / ssXX;
    const yIntercept = yBar - (xBar * slope);
    const xIntercept = - (yIntercept / slope);
    const rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

    return { slope, xIntercept, yIntercept, rSquare, y : function(x) {return x * slope + yIntercept} };
}

/**
 * Updates the tree when it has changed
 * @param svgSelection
 * @param tree
 * @param scales
 */
function update(svgSelection, tree, scales) {

    // get new positions
    const data = tree.externalNodes.map((tip) => {
        return {
            name: tip.name,
            x: tip.date,
            y: tree.rootToTipLength(tip)
        };
    });

    // least squares regression
    const regression = leastSquares(data);
    let x1 = regression.xIntercept;
    let x2 = d3.max(data, d => d.x);
    if (regression.slope < 0.0) {
        x1 = d3.min(data, d => d.x);
        x2 = d3.max(data, d => d.x);
    }
    let y1 = 0.0;
    let y2 = d3.max([regression.y(x2), d3.max(data, d => d.y)]);

    // update the scales for the plot
    scales.x.domain([x1, x2]).nice();
    scales.y.domain([y1, y2]).nice();

    const xAxis = d3.axisBottom(scales.x)
        .tickArguments([5, "d"]);
    const yAxis = d3.axisLeft(scales.y)
        .tickArguments([5, "s"]);

    svgSelection.select("#x-axis")
        .transition()
        .duration(500)
        .call(xAxis);

    svgSelection.select("#y-axis")
        .transition()
        .duration(500)
        .call(yAxis);

    // update trend line
    const line = svgSelection.select('#regression');
    line
        .transition()
        .duration(500)
        .attr("x1", scales.x(x1))
        .attr("y1", scales.y(regression.y(x1)))
        .attr("x2", scales.x(x2))
        .attr("y2", scales.y(regression.y(x2)));

    svgSelection.select("#statistics-slope")
        .text(`Slope: ${d3.format(",.2f")(regression.slope)}`);
    svgSelection.select("#statistics-r2")
        .text(`R^2: ${d3.format(",.2f")(regression.rSquare) }`);

    //update points
    svgSelection.selectAll('.external-node')
        .data(data, node => node.name)
        .transition()
        .duration(500)
        .attr("transform", d => {
            return `translate(${scales.x(d.x)}, ${scales.y(d.y)})`;
        });
}
export function drawPlot(svg, tree, margins) {

    const data = tree.externalNodes.map((tip) => {
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
        .attr('transform',`translate(${margins.left},${margins.top})`);

    //to save on writing later
    const svgSelection = d3.select(svg).select('g');

    // least squares regression
    var regression = leastSquares(data);
    var x1 = regression.xIntercept;
    var y1 = 0.0
    var x2 = d3.max(data, d => d.x);
    var y2 = d3.max([regression.y(x2), d3.max(data, d => d.y)]);

    let scales = {
        x: d3.scaleLinear()
            .domain([x1, x2]).nice()
            .range([margins.left, width - margins.right]),
        y: d3.scaleLinear()
            .domain([y1, y2]).nice()
            .range([height - margins.bottom, margins.top])
    };

    const xAxis = d3.axisBottom(scales.x)
        .tickArguments([5, "d"]);
    const yAxis = d3.axisLeft(scales.y)
        .tickArguments([5, "s"]);

    const xAxisWidth = width - margins.left - margins.right;
    const yAxisHeight = height - margins.bottom - margins.top;

    svgSelection.append("g")
        .attr("id", "x-axis")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${height - margins.bottom + 5})`)
        .call(xAxis);

    svgSelection.append("g")
        .attr("id", "x-axis-label")
        .attr("class", "axis-label")
        .attr("transform", `translate(${margins.left}, ${height - margins.bottom})`)
        .append("text")
        .attr("transform", `translate(${xAxisWidth / 2}, 35)`)
        .attr("alignment-baseline", "hanging")
        .style("text-anchor", "middle")
        .text("Time");

    svgSelection.append("g")
        .attr("id", "y-axis")
        .attr("class", "axis")
        .attr("transform", `translate(${margins.left - 5},0)`)
        .call(yAxis);

    svgSelection.append("g")
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

    svgSelection.append("line")
        .attr("id", "regression")
        .attr("class", "trend-line")
        .attr("x1", scales.x(x1))
        .attr("y1", scales.y(y1))
        .attr("x2", scales.x(x1))
        .attr("y2", scales.y(y1));

    svgSelection.append("g")
        .selectAll("circle")
        .data(data, point => point.name)
        .enter()
        .append("g")
        .attr("id", d => d.name)
        .attr("class", "node external-node")
        .attr("transform", d => {
            return `translate(${scales.x(x1)}, ${scales.y(y1)})`;
        })
        .append("circle")
        .attr("class", "node-shape unselected")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 6);

    svgSelection.append("text")
        .attr("id", "statistics-slope")
        .attr("transform", `translate(${margins.left + 20},${margins.top})`)
        .style("text-anchor", "left")
        .attr("alignment-baseline", "hanging")
        .attr("dy", "0")
        .text(`Slope: `);
    svgSelection.append("text")
        .attr("id", "statistics-r2")
        .attr("transform", `translate(${margins.left + 20},${margins.top})`)
        .style("text-anchor", "left")
        .attr("alignment-baseline", "hanging")
        .attr("dy", "2em")
        .text(`R^2: `);


    update(svgSelection, tree, scales);

    tree.callback = () => update(svgSelection, tree, scales);
}

export function linkPlots(svg1, svg2, tipClass) {

    const mouseover = function(d) {
        const node1 = d3.select(svg1).select(`#${d.name}`).selectAll(`.node-shape`);
        node1.attr('r', 9);
        const node2 = d3.select(svg2).select(`#${d.name}`).selectAll(`.node-shape`);
        node2.attr('r', 9);
    };
    const mouseout = function(d) {
        const node1 = d3.select(svg1).select(`#${d.name}`).selectAll(`.node-shape`);
        node1.attr('r', 6);
        const node2 = d3.select(svg2).select(`#${d.name}`).selectAll(`.node-shape`);
        node2.attr('r', 6);
    };
    const clicked = function(d) {
        const node1 = d3.select(svg1).select(`#${d.name}`).selectAll(`.node-shape`);
        if (node1.attr('class').includes('unselected'))
            node1.attr('class', 'node-shape selected');
        else
            node1.attr('class', 'node-shape unselected');
        const node2 = d3.select(svg2).select(`#${d.name}`).selectAll(`.node-shape`);
        if (node2.attr('class').includes('unselected'))
            node2.attr('class', 'node-shape selected');
        else
            node2.attr('class', 'node-shape unselected');
    };

    const tips = d3.select(svg1).selectAll(`.external-node`).selectAll(`.node-shape`);
    tips.on("mouseover", mouseover);
    tips.on("mouseout", mouseout);
    tips.on("click", clicked);

    const points = d3.select(svg2).selectAll(`.node-shape`);
    points.on("mouseover", mouseover);
    points.on("mouseout", mouseout);
    points.on("click", clicked);
}
