"use strict";

/** @module figtree */

import { Tree, Type } from "./tree.js";
import { rectangularLayout } from "./layouts.js";

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
            lengthFormat: d3.format(".2f"),
            branchCurve: d3.curveStepBefore
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
        this.tree = tree;
        this.margins = margins;

        // merge the default settings with the supplied settings
        this.settings = {...FigTree.DEFAULT_SETTINGS(), ...settings};

        // get the size of the svg we are drawing on
        const width = svg.getBoundingClientRect().width;
        const height = svg.getBoundingClientRect().height;

        this.layout = rectangularLayout;

        //remove the tree if it is there already
        d3.select(svg).select("g").remove();

        // add a group which will contain the new tree
        d3.select(svg).append("g");
        //.attr("transform",`translate(${margins.left},${margins.top})`);

        //to save on writing later
        this.svgSelection = d3.select(svg).select("g");

        const externalNodeCount = tree.externalNodes.length;
        const maxRootToTip = d3.max([...tree.rootToTipLengths()]);

        // create the scales
        const xScale = d3.scaleLinear()
            .domain([0, maxRootToTip])
            .range([margins.left, width - margins.right]);

        const yScale = d3.scaleLinear()
            .domain([0, externalNodeCount - 1])
            .range([margins.top + 20, height - margins.bottom - 20]);

        this.scales = {x:xScale, y:yScale, width, height};

        // layout the nodes using the provided layout function
        this.layout(tree);

        // call the private methods to create the components of the diagram
        addBranches.call(this);
        addNodes.call(this);
        addAxis.call(this, margins);

        this.tree.treeUpdateCallback = () => {
            this.update();
        }
    }

    /**
     * Updates the tree when it has changed
     */
    update() {

        // get new positions
        this.layout(this.tree);

        const externalNodeCount = this.tree.externalNodes.length;
        const maxRootToTip = d3.max([...this.tree.rootToTipLengths()]);

        // update the scales" domains
        this.scales.x.domain([0, maxRootToTip]);
        this.scales.y.domain([0, externalNodeCount - 1]);

        const xAxis = d3.axisBottom(this.scales.x)
            .tickArguments(this.settings.xAxisTickArguments);

        this.svgSelection.select("#x-axis")
            .transition()
            .duration(500)
            .call(xAxis);

        const branchPath = d3.line()
            .x(d => this.scales.x(d.height))
            .y(d => this.scales.y(d.width))
            .curve(this.settings.branchCurve);

        // update branches
        this.svgSelection.selectAll(".branch")
            .transition()
            .duration(500)
            .attr("d", edge => branchPath(edge.location));

        // update branch labels
        this.svgSelection.selectAll(".length")
            .transition()
            .duration(500)
            .attr("dx", d => this.scales.x((d.parent.height + d.height) / 2))
            .attr("dy", d => {
                if (d.children && d.parent && d.parent.children[0] === d)
                    return this.scales.y(d.width) + 6;
                else
                    return this.scales.y(d.width) - 6;
            })
            .attr("alignment-baseline", d => {
                if (d.children && d.parent && d.parent.children[0] === d)
                    return "hanging";
                else
                    return "bottom";
            })
            .text(d => this.settings.lengthFormat(d.length));

        //update nodes
        this.svgSelection.selectAll(".node")
            .transition()
            .duration(500)
            .attr("class", (d) => {
                let classes = ["node",
                    (!d.children ? "external-node" : "internal-node"),
                    (d.isSelected ? "selected" : "unselected")];
                if (d.annotations) {
                    classes = [
                        ...classes,
                        ...Object.entries(d.annotations)
                            .filter(([key]) => {
                                return this.tree.annotations[key].type === Type.DISCRETE ||
                                    this.tree.annotations[key].type === Type.BOOLEAN ||
                                    this.tree.annotations[key].type === Type.INTEGER;
                            } )
                            .map(([key, value]) => `${key}-${value}`)];
                }
                return classes.join(" ");
            })
            .attr("transform", d => {
                // d.x = this.scales.x(d.height);
                // d.y = this.scales.y(d.width);
                return `translate(${this.scales.x(d.height)}, ${this.scales.y(d.width)})`;
            });

        //update labels
        this.svgSelection.selectAll(".support")
            .transition()
            .duration(250)
            .attr("dy", d => {
                if (d.parent && d.parent.children[0] === d)
                    return "-8";
                else
                    return "8";
            })
            .delay(250)
            .attr("alignment-baseline", d => {
                if (d.parent && d.parent.children[0] === d)
                    return "bottom";
                else
                    return "hanging";
            });
    }

    /**
     * set mouseover highlighting of branches
     */
    hilightBranches() {
        this.svgSelection.selectAll(".branch").on("mouseover", function (d, i) {
            d3.select(this).attr("class", "branch hovered");
        });
        this.svgSelection.selectAll(".branch").on("mouseout", function (d, i) {
            d3.select(this).attr("class", "branch");
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
        const selected = this.svgSelection.selectAll(selection).selectAll(".node-shape");
        selected.on("mouseover", function (d, i) {
            d3.select(this).attr("class", "node-shape hovered");
            d3.select(this).attr("r", this.settings.hoverNodeRadius);
        });
        selected.on("mouseout", function (d, i) {
            d3.select(this).attr("class", "node-shape");
            d3.select(this).attr("r", this.settings.nodeRadius);
        });
    }

    /**
     * Registers action function to be called when a branch is clicked on. The function should
     * take the tree, the node for the branch that was clicked on and the position of the click
     * as a proportion of the length of the branch.
     *
     * Optionally a selection string can be provided - i.e., to select a particular branch by its id.
     *
     * A static method - Tree.reroot() is available for rerooting the tree on the clicked branch.
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
        selected.on("click", function (selectedBranch) {
            const x1 = self.scales.x(selectedBranch.height);
            const x2 = self.scales.x(selectedBranch.parent.height);
            const mx = d3.mouse(this)[0];
            const proportion = Math.max(0.0, Math.min(1.0, (mx - x2) / (x1 - x2)));
            action(self.tree, selectedBranch, proportion);
            self.update();
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
        onClickNode(action, ".internal-node");
    }

    /**
     * Registers action function to be called when an external node is clicked on. The function should
     * take the tree and the node that was clicked on.
     *
     * @param action
     */
    onClickExternalNode(action) {
        onClickNode(action, ".external-node");
    }

    /**
     * Registers action function to be called when a node is clicked on. The function should
     * take the tree and the node that was clicked on.
     *
     * Optionally a selection string can be provided - i.e., to select a particular node by its id.
     * @param action
     * @param selection
     */
    onClickNode(action, selection = null) {
        const selected = this.svgSelection.selectAll(`${selection ? selection : ".node"}`).selectAll(".node-shape");
        selected.on("click", (selectedNode) => {
            action(this.tree, selectedNode);
            this.update();
        })
    }

    /**
     * Registers some text to appear in a popup box when the mouse hovers over the selection.
     *
     * @param selection
     * @param text
     */
    addLabels(selection, text) {
        this.svgSelection.selectAll(selection).on("mouseover",
            function (selectedNode) {
                let tooltip = document.getElementById("tooltip");
                if (typeof text === typeof "") {
                    tooltip.innerHTML = text;
                } else {
                    tooltip.innerHTML = text(selectedNode);
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

    set branchCurve(curve) {
        this.curve = curve;
        this.update();
    }

    /**
     * A utility function for rotating a node
     * @param tree the tree
     * @param node the node
     */
    static rotate(tree, node) {
        tree.rotate(node);
    }

    /**
     * A utility function for ordering a subtree with increasing tip density
     * @param tree the tree
     * @param node the node
     */
    static orderIncreasing(tree, node) {
        tree.order(node, true);
    }

    /**
     * A utility function for ordering a subtree with decreasing tip density
     * @param tree the tree
     * @param node the node
     */
    static orderDecreasing(tree, node) {
        tree.order(node, false);
    }

    /**
     * A utility function for rerooting the tree
     * @param tree the tree
     * @param branch the branch
     * @param position the position on the branch (0, 1) where 1 is closest to the root.
     */
    static reroot(tree, branch, position) {
        tree.reroot(branch, position);
    }

    /**
     * A utility function that will return a HTML string about the node and its
     * annotations. Can be used with the addLabels() method.
     *
     * @param node
     * @returns {string}
     */
    static nodeInfo(node) {
        let text = `${node.name ? node.name : name.id }`;
        Object.entries(node.annotations).forEach(([key, value]) => {
            text += `<p>${key}: ${value}</p>`;
        });
        return text;
    }
}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

/**
 * Adds internal and external nodes with shapes and labels
 */
function addNodes() {
    let node = this.svgSelection.selectAll("g")
        .data(this.tree.nodes, node => node.id) // assign the key for continuity during transitions
        .enter().append("g")
        .attr("id", d => {
            if (d.label && d.label.startsWith("#")) {
                return d.label.substr(1);
            } else {
                return (d.name ? d.name : (d === this.tree.rootNode ? "root" : d.id));
            }
        })
        .attr("class", (d) => ["node",
            (!d.children ? "external-node" : "internal-node"),
            (d.isSelected ? "selected" : "unselected")].join(" "))
        .attr("transform", (d) => {
            return `translate(${this.scales.x(d.height)}, ${this.scales.y(d.width)})`;
        });

    node.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", this.settings.nodeRadius)
        .attr("class", d => "node-shape");

    node.append("text")
        .attr("class", "node-label")
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle")
        .attr("dx", "12")
        .attr("dy", "0")
        .text(d => d.name);

    node.append("text")
        .attr("class", "node-label support")
        .attr("text-anchor", "end")
        .attr("dx", "-6")
        .attr("dy", d => {
            if (d.parent && d.parent.children[0] === d)
                return "-8";
            else
                return "8";
        })
        .attr("alignment-baseline", d => {
            if (d.parent && d.parent.children[0] === d)
                return "bottom";
            else
                return "hanging";
        })
        .text(d => {
            return (d.label && d.label.startsWith("#")? "" : d.label);
        });
}

/**
 * Adds branch lines
 */
function addBranches() {
    const branchPath = d3.line()
        .x(d => this.scales.x(d.height))
        .y(d => this.scales.y(d.width))
        .curve(this.settings.branchCurve);

    const edges = this.tree.nodes.filter(n => n.location);

    this.svgSelection.selectAll("path")
        .data(edges, n => n.id)
        .enter()
        .append("path")
        .attr("class", "branch")
        .attr("id", edge => edge.id)
        .attr("d", edge => branchPath(edge.location));

    this.svgSelection.selectAll("text")
        .data(edges, n => n.id)
        .enter()
        .append("text")
        .attr("class", "branch-label length")
        .attr("dx", d => this.scales.x((d.parent.height + d.height) / 2))
        .attr("dy", d => {
            if (d.children && d.parent && d.parent.children[0] === d)
                return this.scales.y(d.width) + 6;
            else
                return this.scales.y(d.width) - 6;
        })
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", d => {
            if (d.children && d.parent && d.parent.children[0] === d)
                return "hanging";
            else
                return "bottom";
        })
        .text(d => this.settings.lengthFormat(d.length));
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
