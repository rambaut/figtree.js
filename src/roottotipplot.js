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

    //update axis
    svgSelection.select('#x-axis')
        .transition()
        .duration(500)
        .call(d3.axisBottom(scales.x));

    svgSelection.select('#y-axis')
        .transition()
        .duration(500)
        .call(d3.axisLeft(scales.y));

    // update trend line
    const line = svgSelection.select('#regression');
    line
        .transition()
        .duration(500)
        .attr("x1", scales.x(x1))
        .attr("y1", scales.y(regression.y(x1)))
        .attr("x2", scales.x(x2))
        .attr("y2", scales.y(regression.y(x2)));

    //update points
    svgSelection.selectAll('.tip-point')
        .data(data, node => node.name)
        .transition()
        .duration(500)
        .attr("cx", d => scales.x(d.x))
        .attr("cy", d => scales.y(d.y));
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

    const xAxis = g => g
        .attr("id", "x-axis")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height - margins.bottom})`)
        .call(d3.axisBottom(scales.x))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("id", "x-axis-label")
            .attr("class", "axis-label")
            .attr("x", width - margins.right)
            .attr("y", -4)
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .text(data.xLabel))

    const yAxis = g => g
        .attr("id", "y-axis")
        .attr("class", "axis")
        .attr("transform", `translate(${margins.left},0)`)
        .call(d3.axisLeft(scales.y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("id", "y-axis-label")
            .attr("class", "axis-label")
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.yLabel))

    svgSelection.append("g")
        .call(xAxis); //.tickFormat(d3.format("d"))

    svgSelection.append("g")
        .call(yAxis);

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
        .enter().append("circle")
        .attr("class", "tip-point")
        .attr("id", d => d.name)
        .attr("cx", d => scales.x(x1))
        .attr("cy", d => scales.y(y1))
        .attr("r", 6);

    update(svgSelection, tree, scales);

    tree.callback = () => update(svgSelection, tree, scales);
}
