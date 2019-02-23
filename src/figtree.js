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

        this.vertices = [];
        this.edges = [];

        // call the private methods to create the components of the diagram
        createElements.call(this, svg, margins);

        // Called whenever the layout changes...
        this.layout.updateCallback = () => {
            this.update();
        }
    }

    /**
     * Updates the tree when it has changed
     */
    update() {

        // get new positions
        this.layout.layout(this.vertices, this.edges);

        // update the scales" domains
        this.scales.x.domain(this.layout.horizontalRange);
        this.scales.y.domain(this.layout.verticalRange);

        const xAxis = d3.axisBottom(this.scales.x)
            .tickArguments(this.settings.xAxisTickArguments);

        this.svgSelection.select("#x-axis")
            .transition()
            .duration(500)
            .call(xAxis);

        const branchPath = d3.line()
            .x(d => this.scales.x(d.x))
            .y(d => this.scales.y(d.y))
            .curve(this.layout.branchCurve);

        // update branches
        this.svgSelection.selectAll(".branch")
            .transition()
            .duration(500)
            .attr("d", edge => branchPath([edge.v0, edge.v1]))
            .attr("class", (d) => {
                return ["branch", ...d.classes].join(" ");
            });

        // update branch labels
        this.svgSelection.selectAll(".length")
            .transition()
            .duration(500)
            .attr("dx", d => this.scales.x((d.v1.x + d.v0.x) / 2))
            .attr("dy", d => (d.labelBelow ? this.scales.y(d.v1.y) + 6 : this.scales.y(d.v1.y) - 6))
            .attr("alignment-baseline", d => (d.labelBelow ? "hanging" : "bottom"))
            .text(d => d.label);

        if (this.settings.nodeBackgroundBorder > 0) {
            //update node backgrounds
            this.svgSelection.selectAll(".node-background")
                .transition()
                .duration(500)
                .attr("transform", d => {
                    return `translate(${this.scales.x(d.x)}, ${this.scales.y(d.y)})`;
                });
        }

        //update nodes
        this.svgSelection.selectAll(".node")
            .transition()
            .duration(500)
            .attr("class", (d) => {
                return ["node", ...d.classes].join(" ");
            })
            .attr("transform", d => {
                return `translate(${this.scales.x(d.x)}, ${this.scales.y(d.y)})`;
            });

        //update labels
        this.svgSelection.selectAll(".support")
            .transition()
            .duration(250)
            .attr("dy", d => (d.labelBelow ? -8 : +8))
            .delay(250)
            .attr("alignment-baseline", d => (d.labelBelow ? "bottom": "hanging" ))
            .text((d) => d.leftLabel);

        // update the branch midpoint shapes
        this.svgSelection.selectAll(".mid-branch")
            .transition()
            .duration(500)
            .attr("class", (d) => {
                return ["mid-branch", ...d.classes].join(" ");
            })
            .attr("transform", d => {
                return `translate(${this.scales.x(d.x)}, ${this.scales.y(d.y)})`;
            });

    }

    /**
     * set mouseover highlighting of branches
     */
    hilightBranches() {
        // need to use 'function' here so that 'this' refers to the SVG
        // element being hovered over.
        const selected = this.svgSelection.selectAll(".branch").selectAll(".branch-path");
        selected.on("mouseover", function (d, i) {
            d3.select(this).attr("class", "branch-path hovered");
        });
        selected.on("mouseout", function (d, i) {
            d3.select(this).attr("class", "branch-path");
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
        const selected = this.svgSelection.selectAll(selection).selectAll(".node-shape");
        selected.on("mouseover", function (d, i) {
            d3.select(this).attr("class", "node-shape hovered");
            d3.select(this).attr("r", self.settings.hoverNodeRadius);
        });
        selected.on("mouseout", function (d, i) {
            d3.select(this).attr("class", "node-shape");
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
        const selected = this.svgSelection.selectAll(`${selection ? selection : ".node"}`).selectAll(".node-shape");
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

function createElements(svg, margins) {
    // layout the graph using the provided layout function
    this.layout.layout(this.vertices, this.edges);

    // get the size of the svg we are drawing on
    const width = svg.getBoundingClientRect().width;
    const height = svg.getBoundingClientRect().height;

    //remove the tree if it is there already
    d3.select(svg).select("g").remove();

    // add a group which will contain the new tree
    d3.select(svg).append("g");
    //.attr("transform",`translate(${margins.left},${margins.top})`);

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

    // call the private methods to create the components of the diagram
    addBranches.call(this);
    addNodes.call(this);
    addAxis.call(this, margins);
}

/**
 * Adds internal and external nodes with shapes and labels
 */
function addNodes() {

    const vertices = this.vertices
        .filter((v) => v.degree !== 2);

    const degree2Vertices = this.vertices
        .filter((v) => v.degree === 2);

    if (this.settings.nodeBackgroundBorder > 0) {
        // add the branch midpoint background
        if (degree2Vertices.length > 0) {
            this.svgSelection.selectAll("g")
                .data(degree2Vertices, (d) => d.key.toString() )
                .enter().append("rect")
                .attr("class", (d) => ["node-background", ...d.classes].join(" "))
                .attr("transform", (d) => {
                    return `translate(${this.scales.x(d.x)}, ${this.scales.y(d.y)})`;
                })
                .attr("x", - (this.settings.nodeRadius * 0.25 + this.settings.nodeBackgroundBorder))
                .attr("width", this.settings.nodeRadius * 0.5 + this.settings.nodeBackgroundBorder * 2)
                .attr("y", - (this.settings.nodeRadius * 1.5 + this.settings.nodeBackgroundBorder))
                .attr("height", this.settings.nodeRadius * 3 + this.settings.nodeBackgroundBorder * 2)
                .attr("rx", 2)
                .attr("ry", 2);
        }

        // add the node background
        this.svgSelection.selectAll("g")
            .data(vertices, (d) => d.key.toString() )
            .enter().append("circle")
            .attr("class", (d) => ["node-background", ...d.classes].join(" "))
            .attr("transform", (d) => {
                return `translate(${this.scales.x(d.x)}, ${this.scales.y(d.y)})`;
            })
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", this.settings.nodeRadius + this.settings.nodeBackgroundBorder);
    }

    // add the branch midpoint shapes
    if (degree2Vertices.length > 0) {
        this.svgSelection.selectAll("g")
            .data(degree2Vertices, (d) => d.key.toString() )
            .enter().append("g")
            .attr("id", d => {
                return d.node.id;
            })
            .attr("class", (d) => ["node", "mid-branch", ...d.classes].join(" "))
            .attr("transform", (d) => {
                return `translate(${this.scales.x(d.x)}, ${this.scales.y(d.y)})`;
            })
            .append("rect")
            .attr("class", () => "node-shape")
            .attr("x", -this.settings.nodeRadius / 4)
            .attr("width", this.settings.nodeRadius / 2)
            .attr("y", -this.settings.nodeRadius * 1.5)
            .attr("height", this.settings.nodeRadius * 3)
            .attr("rx", 2)
            .attr("ry", 2);
    }

    // add the actual nodes
    let node = this.svgSelection.selectAll("g")
        .data(vertices, (d) => d.key.toString())
        .enter().append("g")
        .attr("id", d => {
            const n = d.node;
            if (n.label && n.label.startsWith("#")) {
                return n.label.substr(1);
            } else {
                return (n.name ? n.name : (n.parent ? n.id : "root"));
            }
        })
        .attr("class", (d) => ["node", ...d.classes].join(" "))
        .attr("transform", (d) => {
            return `translate(${this.scales.x(d.x)}, ${this.scales.y(d.y)})`;
        });

    node.append("circle")
        .attr("class", () => "node-shape")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", this.settings.nodeRadius);

    node.append("text")
        .attr("class", "node-label")
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle")
        .attr("dx", "12")
        .attr("dy", "0")
        .text((d) => d.rightLabel);

    node.append("text")
        .attr("class", "node-label support")
        .attr("text-anchor", "end")
        .attr("dx", "-6")
        .attr("dy", d => (d.labelBelow ? -8 : +8))
        .attr("alignment-baseline", d => (d.labelBelow ? "bottom": "hanging" ))
        .text((d) => d.leftLabel);
}

/**
 * Adds branch lines
 */
function addBranches() {
    const branchPath = d3.line()
        .x((v) => this.scales.x(v.x))
        .y((v) => this.scales.y(v.y))
        .curve(this.layout.branchCurve);

    this.svgSelection.selectAll("path")
        .data(this.edges, (e) => e.key.toString() )
        .enter()
        .append("path")
        .attr("class", (e) => ["branch", ...e.classes].join(" "))
        .attr("id", (e) => e.id)
        .attr("d", (e) => branchPath([e.v0, e.v1]));

    this.svgSelection.selectAll("text")
        .data(this.edges, (e) => e.key.toString() )
        .enter()
        .append("text")
        .attr("class", "branch-label length")
        .attr("dx", (e) => this.scales.x((e.v1.x + e.v0.x) / 2))
        .attr("dy", (e) => (e.labelBelow ? this.scales.y(e.v1.y) + 6 : this.scales.y(e.v1.y) - 6))
        .attr("alignment-baseline", (e) => (e.labelBelow ? "hanging" : "bottom"))
        .attr("text-anchor", "middle")
        .text((e) => e.label);
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
