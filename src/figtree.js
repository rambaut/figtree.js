"use strict";

/** @module figtree */

/**
 * The FigTree class
 *
 * A class that takes a tree and draws it into the the given SVG root element. Has a range of methods
 * for adding interactivity to the tree (e.g., mouse-over labels, rotating nodes and rerooting on branches).
 * The tree is updated with animated transitions.
 */
export class FigTree {

    static DEFAULT_SETTINGS() {
        return {
            xAxisTickArguments: [5, "f"],
            xAxisTitle: "Divergence",
            nodeRadius: 6,
            hoverNodeRadius: 8,
            nodeBackgroundBorder: 1
        };
    }

    /**
     * The constructor.
     * @param svg
     * @param layout - an instance of class Layout
     * @param margins
     * @param settings
     */
    constructor(svg, layout, margins, settings = {}) {
        this.layout = layout;
        this.margins = margins;

        // merge the default settings with the supplied settings
        this.settings = {...FigTree.DEFAULT_SETTINGS(), ...settings};

        // get the size of the svg we are drawing on
        const width = svg.getBoundingClientRect().width;
        const height = svg.getBoundingClientRect().height;

        //remove the tree if it is there already
        d3.select(svg).select("g").remove();

        // add a group which will contain the new tree
        d3.select(svg).append("g")
            .attr("transform",`translate(${margins.left},${margins.top})`);

        //to selecting every time
        this.svgSelection = d3.select(svg).select("g");

        // create the scales
        const xScale = d3.scaleLinear()
            .domain(this.layout.horizontalRange)
            .range([margins.left, width - margins.right]);

        const yScale = d3.scaleLinear()
            .domain(this.layout.verticalRange)
            .range([margins.top + 20, height - margins.bottom - 20]);

        this.scales = {x:xScale, y:yScale, width, height};

        addAxis.call(this, margins);

        this.vertices = [];
        this.edges = [];

        // Called whenever the layout changes...
        this.layout.updateCallback = () => {
            this.update();
        }

        this.update();
    }

    /**
     * Updates the tree when it has changed
     */
    update() {

        // get new positions
        this.layout.layout(this.vertices, this.edges);

        // update the scales' domains
        this.scales.x.domain(this.layout.horizontalRange);
        this.scales.y.domain(this.layout.verticalRange);

        const xAxis = d3.axisBottom(this.scales.x)
            .tickArguments(this.settings.xAxisTickArguments);

        this.svgSelection.select("#x-axis")
            .transition()
            .duration(500)
            .call(xAxis);

        // call the private methods to create the components of the diagram
        updateBranches.call(this);
        updateNodeBackgrounds.call(this);
        updateNodes.call(this);
        updateMidbranchNodes.call(this);

    }

    /**
     * set mouseover highlighting of branches
     */
    hilightBranches() {
        // need to use 'function' here so that 'this' refers to the SVG
        // element being hovered over.
        const selected = this.svgSelection.selectAll(".branch").select(".branch-path");
        selected.on("mouseover", function (d, i) {
            d3.select(this).classed("hovered", true);
        });
        selected.on("mouseout", function (d, i) {
            d3.select(this).classed("hovered", false);
        });
    }

    /**
     * Set mouseover highlighting of internal nodes
     */
    hilightInternalNodes() {
        this.hilightNodes(".internal-node");
    }

    /**
     * Set mouseover highlighting of internal nodes
     */
    hilightExternalNodes() {
        this.hilightNodes(".external-node");
    }

    /**
     * Set mouseover highlighting of nodes
     */
    hilightNodes(selection) {
        // need to use 'function' here so that 'this' refers to the SVG
        // element being hovered over.
        const self = this;
        const selected = this.svgSelection.selectAll(selection).select(".node-shape");
        selected.on("mouseover", function (d, i) {
            d3.select(this).classed("hovered", true);
            d3.select(this).attr("r", self.settings.hoverNodeRadius);
        });
        selected.on("mouseout", function (d, i) {
            d3.select(this).classed("hovered", false);
            d3.select(this).attr("r", self.settings.nodeRadius);
        });
    }

    /**
     * Registers action function to be called when an edge is clicked on. The function is passed
     * edge object that was clicked on and the position of the click as a proportion of the edge length.
     *
     * Optionally a selection string can be provided - i.e., to select a particular branch by its id.
     *
     * @param action
     * @param selection
     */
    onClickBranch(action, selection = null) {
        // We need to use the "function" keyword here (rather than an arrow) so that "this"
        // points to the actual SVG element (so we can use d3.mouse(this)). We therefore need
        // to store a reference to the object in "self".
        const self = this;
        const selected = this.svgSelection.selectAll(`${selection ? selection : ".branch"}`);
        selected.on("click", function (edge) {
            const x1 = self.scales.x(edge.v1.x);
            const x2 = self.scales.x(edge.v0.x);
            const mx = d3.mouse(this)[0];
            const proportion = Math.max(0.0, Math.min(1.0, (mx - x2) / (x1 - x2)));
            action(edge, proportion);
        })
    }

    /**
     * Registers action function to be called when an internal node is clicked on. The function should
     * take the tree and the node that was clicked on.
     *
     * A static method - Tree.rotate() is available for rotating the node order at the clicked node.
     *
     * @param action
     */
    onClickInternalNode(action) {
        this.onClickNode(action, ".internal-node");
    }

    /**
     * Registers action function to be called when an external node is clicked on. The function should
     * take the tree and the node that was clicked on.
     *
     * @param action
     */
    onClickExternalNode(action) {
        this.onClickNode(action, ".external-node");
    }

    /**
     * Registers action function to be called when a vertex is clicked on. The function is passed
     * the vertex object.
     *
     * Optionally a selection string can be provided - i.e., to select a particular node by its id.
     *
     * @param action
     * @param selection
     */
    onClickNode(action, selection = null) {
        const selected = this.svgSelection.selectAll(`${selection ? selection : ".node"}`).select(".node-shape");
        selected.on("click", (vertex) => {
            action(vertex);
        })
    }

    /**
     * Registers some text to appear in a popup box when the mouse hovers over the selection.
     *
     * @param selection
     * @param text
     */
    addToolTip(selection, text) {
        this.svgSelection.selectAll(selection).on("mouseover",
            function (selected) {
                let tooltip = document.getElementById("tooltip");
                if (typeof text === typeof "") {
                    tooltip.innerHTML = text;
                } else {
                    tooltip.innerHTML = text(selected);
                }
                tooltip.style.display = "block";
                tooltip.style.left = d3.event.pageX + 10 + "px";
                tooltip.style.top = d3.event.pageY + 10 + "px";
            }
        );
        this.svgSelection.selectAll(selection).on("mouseout", function () {
            let tooltip = document.getElementById("tooltip");
            tooltip.style.display = "none";
        });
    }

    set treeLayout(layout) {
        this.layout = layout;
        this.update();
    }
}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

/**
 * Adds or updates nodes
 */
function updateNodes() {

    const branchEndVertices = this.vertices
        .filter((v) => v.degree !== 2);

    // DATA JOIN
    // Join new data with old elements, if any.
    const nodes = this.svgSelection.selectAll("g .node")
        .data(branchEndVertices, (v) => `n_${v.key}`);

    // ENTER
    // Create new elements as needed.
    const newNodes = nodes.enter().append("g")
        .attr("id", (v) => v.node.id)
        .attr("class", (v) => ["node", ...v.classes].join(" "))
        .attr("transform", (v) => {
            return `translate(${this.scales.x(v.x)}, ${this.scales.y(v.y)})`;
        });

    newNodes.append("circle")
        .attr("class", "node-shape")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", this.settings.nodeRadius);

    newNodes.append("text")
        .attr("class", "node-label name")
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle")
        .attr("dx", "12")
        .attr("dy", "0")
        .text((d) => d.rightLabel);

    newNodes.append("text")
        .attr("class", "node-label support")
        .attr("text-anchor", "end")
        .attr("dx", "-6")
        .attr("dy", d => (d.labelBelow ? -8 : +8))
        .attr("alignment-baseline", d => (d.labelBelow ? "bottom": "hanging" ))
        .text((d) => d.leftLabel);

    // update the existing elements
    nodes
        .transition()
        .duration(500)
        .attr("class", (v) => ["node", ...v.classes].join(" "))
        .attr("transform", (v) => {
            return `translate(${this.scales.x(v.x)}, ${this.scales.y(v.y)})`;
        });

    nodes.select("circle")
        .transition()
        .duration(500)
        .attr("class", "node-shape")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", this.settings.nodeRadius);

    nodes.select("text .node-label .name")
        .transition()
        .duration(500)
        .attr("class", "node-label name")
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle")
        .attr("dx", "12")
        .attr("dy", "0")
        .text((d) => d.rightLabel);

    nodes.select("text .node-label .support")
        .transition()
        .duration(500)
        .attr("alignment-baseline", d => (d.labelBelow ? "bottom": "hanging" ))
        .attr("class", "node-label support")
        .attr("text-anchor", "end")
        .attr("dx", "-6")
        .attr("dy", d => (d.labelBelow ? -8 : +8))
        .text((d) => d.leftLabel);

    // EXIT
    // Remove old elements as needed.
    nodes.exit().remove();

}

/**
 * Adds or updates nodes
 */
function updateMidbranchNodes() {

    const midbranchVertices = this.vertices
        .filter((v) => v.degree === 2);

    // DATA JOIN
    // Join new data with old elements, if any.
    const nodes = this.svgSelection.selectAll("g .node .mid-branch")
        .data(midbranchVertices, (v) => `n_${v.key}`);

    // ENTER
    // Create new elements as needed.
    const newNodes = nodes.enter().append("g")
        .attr("id", (v) => v.node.id)
        .attr("class", (v) => ["node", "mid-branch", ...v.classes].join(" "))
        .attr("transform", (v) => {
            return `translate(${this.scales.x(v.x)}, ${this.scales.y(v.y)})`;
        });

    newNodes.append("rect")
        .attr("class", "node-shape")
        .attr("x", -this.settings.nodeRadius / 4)
        .attr("width", this.settings.nodeRadius / 2)
        .attr("y", -this.settings.nodeRadius * 1.5)
        .attr("height", this.settings.nodeRadius * 3)
        .attr("rx", 2)
        .attr("ry", 2);

    newNodes.append("text")
        .attr("class", "node-label name")
        .attr("text-anchor", "start")
        .attr("dx", "6")
        .attr("dy", d => (d.labelBelow ? -8 : +8))
        .attr("alignment-baseline", d => (d.labelBelow ? "bottom": "hanging" ))
        .text((d) => d.rightLabel);

    newNodes.append("text")
        .attr("class", "node-label support")
        .attr("text-anchor", "end")
        .attr("dx", "-6")
        .attr("dy", d => (d.labelBelow ? -8 : +8))
        .attr("alignment-baseline", d => (d.labelBelow ? "bottom": "hanging" ))
        .text((d) => d.leftLabel);

    // update the existing elements
    nodes
        .transition()
        .duration(500)
        .attr("class", (v) => ["node", "mid-branch", ...v.classes].join(" "))
        .attr("transform", (v) => {
            return `translate(${this.scales.x(v.x)}, ${this.scales.y(v.y)})`;
        });

    nodes.select("rect")
        .transition()
        .duration(500)
        .attr("class", "node-shape")
        .attr("x", -this.settings.nodeRadius / 4)
        .attr("width", this.settings.nodeRadius / 2)
        .attr("y", -this.settings.nodeRadius * 1.5)
        .attr("height", this.settings.nodeRadius * 3)
        .attr("rx", 2)
        .attr("ry", 2);

    nodes.select("text .node-label .name")
        .transition()
        .duration(500)
        .attr("class", "node-label name")
        .attr("text-anchor", "start")
        .attr("dx", "6")
        .attr("dy", d => (d.labelBelow ? -8 : +8))
        .attr("alignment-baseline", d => (d.labelBelow ? "bottom": "hanging" ))
        .text((d) => d.rightLabel);

    nodes.select("text .node-label .support")
        .transition()
        .duration(500)
        .attr("class", "node-label support")
        .attr("text-anchor", "end")
        .attr("dx", "-6")
        .attr("dy", d => (d.labelBelow ? -8 : +8))
        .attr("alignment-baseline", d => (d.labelBelow ? "bottom": "hanging" ))
        .text((d) => d.leftLabel);

    // EXIT
    // Remove old elements as needed.
    nodes.exit().remove();

}

function updateNodeBackgrounds() {

    const branchEndVertices = this.vertices
        .filter((v) => v.degree !== 2);

    // DATA JOIN
    // Join new data with old elements, if any.
    const nodes = this.svgSelection.selectAll("circle .node-background")
        .data(branchEndVertices, (v) => `nb_${v.key}`);

    // ENTER
    // Create new elements as needed.
    const newNodes = nodes.enter().append("circle")
        .attr("class", (v) => ["node-background", ...v.classes].join(" "))
        .attr("transform", (v) => {
            return `translate(${this.scales.x(v.x)}, ${this.scales.y(v.y)})`;
        })
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", this.settings.nodeRadius + this.settings.nodeBackgroundBorder);


    // update the existing elements
    nodes
        .transition()
        .duration(500)
        .attr("class", (v) => ["node-background", ...v.classes].join(" "))
        .attr("transform", (v) => {
            return `translate(${this.scales.x(v.x)}, ${this.scales.y(v.y)})`;
        });

    // EXIT
    // Remove old elements as needed.
    nodes.exit().remove();

    // add the branch midpoint background
    const midBranchVertices = this.vertices
        .filter((v) => v.degree === 2);

    // DATA JOIN
    // Join new data with old elements, if any.
    const midBranchNodes = this.svgSelection.selectAll("rect .node-background")
        .data(midBranchVertices, (v) => `nb_${v.key}`);

    // ENTER
    // Create new elements as needed.
    midBranchNodes.enter().append("rect")
        .attr("class", (v) => ["node-background", ...v.classes].join(" "))
        .attr("transform", (v) => {
            return `translate(${this.scales.x(v.x)}, ${this.scales.y(v.y)})`;
        })
        .attr("x", - (this.settings.nodeRadius * 0.25 + this.settings.nodeBackgroundBorder))
        .attr("width", this.settings.nodeRadius * 0.5 + this.settings.nodeBackgroundBorder * 2)
        .attr("y", - (this.settings.nodeRadius * 1.5 + this.settings.nodeBackgroundBorder))
        .attr("height", this.settings.nodeRadius * 3 + this.settings.nodeBackgroundBorder * 2)
        .attr("rx", 2)
        .attr("ry", 2);


    // update the existing elements
    midBranchNodes
        .transition()
        .duration(500)
        .attr("class", (v) => ["node-background", ...v.classes].join(" "))
        .attr("transform", (v) => {
            return `translate(${this.scales.x(v.x)}, ${this.scales.y(v.y)})`;
        });

    // EXIT
    // Remove old elements as needed.
    midBranchNodes.exit().remove();

}


/**
 * Adds or updates branch lines
 */
function updateBranches() {

    // a function to create a line path
    const branchPath = d3.line()
        .x((v) => v.x)
        .y((v) => v.y)
        .curve(this.layout.branchCurve);

    // DATA JOIN
    // Join new data with old elements, if any.
    const branches = this.svgSelection.selectAll("g .branch")
        .data(this.edges, (e) => `b_${e.key}`);

    // ENTER
    // Create new elements as needed.
    const newBranches = branches.enter().append("g")
        .attr("id", (e) => e.v1.node.id)
        .attr("class", (e) => ["branch", ...e.classes].join(" "))
        .attr("transform", (e) => {
            return `translate(${this.scales.x(e.v0.x)}, ${this.scales.y(e.v1.y)})`;
        });

    newBranches.append("path")
        .attr("class", "branch-path")
        .attr("d", (e) => branchPath([
            {x: 0, y: this.scales.y(e.v0.y) - this.scales.y(e.v1.y)},
            {x: this.scales.x(e.v1.x) - this.scales.x(e.v0.x), y: 0}]));

    newBranches.append("text")
        .attr("class", "branch-label length")
        .attr("dx", (e) => ((this.scales.x(e.v1.x) - this.scales.x(e.v0.x)) / 2))
        .attr("dy", (e) => (e.labelBelow ? +6 : -6))
        .attr("alignment-baseline", (e) => (e.labelBelow ? "hanging" : "bottom"))
        .attr("text-anchor", "middle")
        .text((e) => e.label);

    // update the existing elements
    branches
        .transition()
        .duration(500)
        .attr("class", (e) => ["branch", ...e.classes].join(" "))
        .attr("transform", (e) => {
            return `translate(${this.scales.x(e.v0.x)}, ${this.scales.y(e.v1.y)})`;
        })

        .select("path")
        .attr("d", (e) => branchPath([
            {x: 0, y: this.scales.y(e.v0.y) - this.scales.y(e.v1.y)},
            {x: this.scales.x(e.v1.x) - this.scales.x(e.v0.x), y: 0}]))

        .select("text .branch-label .length")
        .attr("class", "branch-label length")
        .attr("dx", (e) => ((this.scales.x(e.v1.x) - this.scales.x(e.v0.x)) / 2))
        .attr("dy", (e) => (e.labelBelow ? +6 : -6))
        .attr("alignment-baseline", (e) => (e.labelBelow ? "hanging" : "bottom"))
        .attr("text-anchor", "middle")
        .text((e) => e.label);

    // EXIT
    // Remove old elements as needed.
    branches
        .exit().remove();
}

/**
 * Add axis
 */
function addAxis() {
    const xAxis = d3.axisBottom(this.scales.x)
        .tickArguments(this.settings.xAxisTickArguments);

    const xAxisWidth = this.scales.width - this.margins.left - this.margins.right;

    this.svgSelection.append("g")
        .attr("id", "x-axis")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${this.scales.height - this.margins.bottom + 5})`)
        .call(xAxis);

    this.svgSelection.append("g")
        .attr("id", "x-axis-label")
        .attr("class", "axis-label")
        .attr("transform", `translate(${this.margins.left}, ${this.scales.height - this.margins.bottom})`)
        .append("text")
        .attr("transform", `translate(${xAxisWidth / 2}, 35)`)
        .attr("alignment-baseline", "hanging")
        .style("text-anchor", "middle")
        .text(this.settings.xAxisTitle);
}
