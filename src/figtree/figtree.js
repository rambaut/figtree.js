"use strict";
import {select,easeLinear,scaleLinear,axisBottom,mouse,event,format,curveStepBefore,line} from "d3";
import uuid from "uuid";

/** @module figtree */
// const d3 = require("d3");

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
            xAxisTitle: "Height",
            // nodeRadius: 6,
            hoverBorder: 2,
            backgroundBorder: 0,
            baubles: [],
            transitionDuration:500,
            transitionEase:easeLinear,
            tickFormat:format(".2f"),
            ticks:5,
            branchCurve:curveStepBefore,
            curveRadius:0,
            origin:0,
            reverseAxis:false,
            branchScale:1,
        };
    }
    static DEFAULT_STYLES(){
        return {"nodes":{},
            "nodeBackgrounds":{},
            "branches":{"fill":d=>"none","stroke-width":d=>"2","stroke":d=>"black"},
        "cartoons":{"fill":d=>"none","stroke-width":d=>"2","stroke":d=>"black"}}
    }

    /**
     * The constructor.
     * @param svg
     * @param layout - an instance of class AbstractLayout
     * @param margins
     * @param settings
     */
    constructor(svg, layout, margins, settings = {}) {
        this.layout = layout;
        this.margins = margins;

        // merge the default settings with the supplied settings
        const styles = FigTree.DEFAULT_STYLES();
        //update style maps
        if(settings.styles) {
            for (const key of Object.keys(styles)) {
                if (settings.styles[key]) {
                    styles[key] = {...styles[key], ...settings.styles[key]}
                }
            }
        }

        this.settings = {...FigTree.DEFAULT_SETTINGS(), ...settings,...{styles:styles}};

        this.callbacks= {nodes:[],branches:[],cartoons:[]};
        this._annotations =[];

        this.svg=svg;
        this.drawn = false;
        this.svgId = `g-${uuid.v4()}`;
        this.svgSelection=null;

        return this;
    }
    draw(){
        
        // get the size of the svg we are drawing on
        let width,height;
        if(Object.keys(this.settings).indexOf("width")>-1){
            width =this.settings.width;
        }else{
            width = this.svg.getBoundingClientRect().width;
        }
        if(Object.keys(this.settings).indexOf("height")>-1){
            height =this.settings.height;
        }else{
            height = this.svg.getBoundingClientRect().height;
        }

        //remove the tree if it is there already
        select(this.svg).select(`#${this.svgId}`).remove();

        // add a group which will contain the new tree
        select(this.svg).append("g")
            .attr("id",this.svgId)
            .attr("transform",`translate(${this.margins.left},${this.margins.top})`);

        //to selecting every time
        this.svgSelection = select(this.svg).select(`#${this.svgId}`);
        this.svgSelection.append("g").attr("class","annotation-layer");
        this.svgSelection.append("g").attr("class", "axes-layer");
        this.svgSelection.append("g").attr("class", "cartoon-layer");

        this.svgSelection.append("g").attr("class", "branches-layer");
        if (this.settings.backgroundBorder > 0) {
            this.svgSelection.append("g").attr("class", "nodes-background-layer");
        }
        this.svgSelection.append("g").attr("class", "nodes-layer");


        // create the scales
        const xScale = scaleLinear()
            .domain(this.layout.horizontalRange)
            .range([this.margins.left, width - this.margins.right]);

        const yScale = scaleLinear()
            .domain(this.layout.verticalRange)
            .range([this.margins.top + 20, height -this.margins.bottom - 20]);

        this.scales = {x:xScale, y:yScale, width, height};
        addAxis.call(this, this.margins);


        // Called whenever the layout changes...
        this.layout.subscribeCallback(()=>this.update());
        this.drawn=true;
        this.update();
        return this;

    }

    /**
     * Updates the tree when it has changed
     */
    update() {
        if(!this.drawn){
            return
        }
        let width,height;
        if(Object.keys(this.settings).indexOf("width")>-1){
            width =this.settings.width;
        }else{
            width = this.svg.getBoundingClientRect().width;
        }
        if(Object.keys(this.settings).indexOf("height")>-1){
            height =this. settings.height;
        }else{
            height = this.svg.getBoundingClientRect().height;
        }

        // update the scales' domains
        this.scales.x.domain(this.layout.horizontalRange).range([this.margins.left, width - this.margins.right]);
        this.scales.y.domain(this.layout.verticalRange).range([this.margins.top + 20, height -this. margins.bottom - 20]);
        this.scales.width=width;
        this.scales.height=height;

        updateAxis.call(this);
        updateAnnoations.call(this);
        updateCartoons.call(this);
        updateBranches.call(this);

        if (this.settings.backgroundBorder > 0) {
            updateNodeBackgrounds.call(this);
        }

        updateNodes.call(this);

        return this;

    }

    /**
     * set mouseover highlighting of branches
     */
    hilightBranches() {
        this.callbacks.branches.push(()=>{
            // need to use 'function' here so that 'this' refers to the SVG
            // element being hovered over.
            const selected = this.svgSelection.selectAll(".branch").select(".branch-path");
            selected.on("mouseover", function (d, i) {
                select(this).classed("hovered", true);

            });
            selected.on("mouseout", function (d, i) {
                select(this).classed("hovered", false);

            });
        })
        this.update();

        return this;

    }

    /**
     * Set mouseover highlighting of internal nodes
     */
    hilightInternalNodes() {
        this.hilightNodes(".internal-node");
        return this;

    }

    /**
     * Set mouseover highlighting of internal nodes
     */
    hilightExternalNodes() {
        this.hilightNodes(".external-node");

        return this;

    }

    /**
     * Set mouseover highlighting of nodes
     */
    hilightNodes(selection) {
        this.callbacks.nodes.push(()=>{
            // need to use 'function' here so that 'this' refers to the SVG
            // element being hovered over.
            const self = this;
            const selected = this.svgSelection.selectAll(selection);
            selected.on("mouseover", function (d, i) {
                const node = select(this).select(".node-shape");
                self.settings.baubles.forEach((bauble) => {
                    // if (bauble.vertexFilter(node)) {
                    bauble.updateShapes(node, self.settings.hoverBorder);
                    // }
                });

                node.classed("hovered", true);
            });
            selected.on("mouseout", function (d, i) {
                const node = select(this).select(".node-shape");

                self.settings.baubles.forEach((bauble) => {
                    // if (bauble.vertexFilter(node)) {
                    bauble.updateShapes(node, 0);
                    // }
                });

                node.classed("hovered", false);
            });
        })
        this.update();

        return this;

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
        this.callbacks.branches.push(()=>{
            // We need to use the "function" keyword here (rather than an arrow) so that "this"
            // points to the actual SVG element (so we can use d3.mouse(this)). We therefore need
            // to store a reference to the object in "self".
            const self = this;
            const selected = this.svgSelection.selectAll(`${selection ? selection : ".branch"}`);
            selected.on("click", function (edge) {
                const x1 = self.scales.x(edge.v1.x);
                const x2 = self.scales.x(edge.v0.x);
                const mx = mouse(this)[0];
                const proportion = Math.max(0.0, Math.min(1.0, (mx - x2) / (x1 - x2)));
                action(edge, proportion);
                self.update();
            })
        });
        this.update();

        return this;

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

        return this;

    }

    /**
     * Registers action function to be called when an external node is clicked on. The function should
     * take the tree and the node that was clicked on.
     *
     * @param action
     */
    onClickExternalNode(action) {
        this.onClickNode(action, ".external-node");

        return this;

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
        const self = this;
        this.callbacks.nodes.push(()=>{
            const selected = this.svgSelection.selectAll(`${selection ? selection : ".node"}`).select(".node-shape");
            selected.on("click", (vertex) => {
                action(vertex);
                self.update();
            })
        });
    this.update();

        return this;

    }
    /**
     * General Nodehover callback
     * @param {*} action and object with an enter and exit function which fire when the mouse enters and exits object
     * @param {*} selection defualts to ".node" will select this selection's child ".node-shape"
     */

    onHoverNode(action,selection=null){
        this.callbacks.nodes.push(()=>{
            const selected = this.svgSelection.selectAll(`${selection ? selection : ".node"}`).select(".node-shape");
            selected.on("mouseover", (vertex) => {
                action.enter(vertex);
                this.update();

            });
            selected.on("mouseout", (vertex) => {
                action.exit(vertex);
                this.update();
            });
        });

        return this;

    }

    /**
     * General branch hover callback
     * @param {*} action and object with an enter and exit function which fire when the mouse enters and exits object
     * @param {*} selection defualts to .branch
     */
    onHoverBranch(action,selection=null){
        this.callbacks.branches.push(()=>{
            const self = this;
            const selected = this.svgSelection.selectAll(`${selection ? selection : ".branch"}`);
            selected.on("mouseover", function (d, i,n) {
                action.enter(d,i,n);
                self.update();
            });
            selected.on("mouseout", function (d, i,n) {
                action.exit(d,i,n);
                self.update();
            });
        })
        this.update();
        return this;

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
                    tooltip.innerHTML = text(selected.node);
                }
                tooltip.style.display = "block";
                tooltip.style.left =event.pageX + 10 + "px";
                tooltip.style.top = event.pageY + 10 + "px";
            }
        );
        this.svgSelection.selectAll(selection).on("mouseout", function () {
            let tooltip = document.getElementById("tooltip");
            tooltip.style.display = "none";
        });
        return this;

    }

    set treeLayout(layout) {
        this.layout = layout;
        this.update();
    }

    addAnnotation(annotation){
        this._annotations.push(annotation);
        this.update();
        return this;

    }

    updateSettings(newSettings){
        //update style maps
        if(newSettings.styles) {
            newSettings.styles = {...this.settings.styles, ...newSettings.styles}
        }

        this.settings={...this.settings,...newSettings};
        this.update();
    }

    updateStyles(){
        updateBranchStyles.call(this);
        updateNodeStyles.call(this);
        updateNodeBackgroundStyles.call(this);
    }
}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

/**
 * Adds or updates nodes
 */
function updateNodes() {

    const nodesLayer = this.svgSelection.select(".nodes-layer");

    // DATA JOIN
    // Join new data with old elements, if any.
    const nodes = nodesLayer.selectAll(".node")
        .data(this.layout.vertices, (v) => `n_${v.key}`);

    // ENTER
    // Create new elements as needed.
    const newNodes = nodes.enter().append("g")
        .attr("id", (v) => v.id)
        .attr("class", (v) => ["node", ...v.classes].join(" "))
        .attr("transform", (v) => {
            return `translate(${this.scales.x(v.x)}, ${this.scales.y(v.y)})`;
        });

    // add the specific node shapes or 'baubles'
    this.settings.baubles.forEach((bauble) => {
        const d = bauble
            .createShapes(newNodes.filter(bauble.vertexFilter))
            .attr("class", "node-shape");
        bauble.updateShapes(d);
    });

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
        .duration(this.settings.transitionDuration)
        .ease(this.settings.transitionEase)
        .attr("class", (v) => ["node", ...v.classes].join(" "))
        .attr("transform", (v) => {
            return `translate(${this.scales.x(v.x)}, ${this.scales.y(v.y)})`;
        });



    // update all the baubles
    this.settings.baubles.forEach((bauble) => {
        const d = nodes.select(".node-shape")
            .filter(bauble.vertexFilter)
            .transition()
            .duration(this.settings.transitionDuration)
            .ease(this.settings.transitionEase)
        ;
        bauble.updateShapes(d)
    });

    nodes.select("text .node-label .name")
        .transition()
        .duration(this.settings.transitionDuration)
        .ease(this.settings.transitionEase)
        .attr("class", "node-label name")
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle")
        .attr("dx", "12")
        .attr("dy", "0")
        .text((d) => d.rightLabel);

    nodes.select("text .node-label .support")
        .transition()
        .duration(this.settings.transitionDuration)
        .ease(this.settings.transitionEase)
        .attr("alignment-baseline", d => (d.labelBelow ? "bottom": "hanging" ))
        .attr("class", "node-label support")
        .attr("text-anchor", "end")
        .attr("dx", "-6")
        .attr("dy", d => (d.labelBelow ? -8 : +8))
        .text((d) => d.leftLabel);

    // EXIT
    // Remove old elements as needed.
    nodes.exit().remove();

    updateNodeStyles.call(this);


    // add callbacks
    for(const callback of this.callbacks.nodes){
        callback();
    }


}

function updateNodeBackgrounds() {

    const nodesBackgroundLayer = this.svgSelection.select(".nodes-background-layer");

    // DATA JOIN
    // Join new data with old elements, if any.
    const nodes = nodesBackgroundLayer.selectAll(".node-background")
        .data(this.layout.vertices, (v) => `nb_${v.key}`);

    // ENTER
    // Create new elements as needed.
    const newNodes = nodes.enter();

    // add the specific node shapes or 'baubles'
    this.settings.baubles.forEach((bauble) => {
        const d = bauble
            .createShapes(newNodes.filter(bauble.vertexFilter))
            .attr("class", "node-background")
            .attr("transform", (v) => {
                return `translate(${this.scales.x(v.x)}, ${this.scales.y(v.y)})`;
            });

        bauble.updateShapes(d, this.settings.backgroundBorder);
    });

    // update all the existing elements
    this.settings.baubles.forEach((bauble) => {
        const d = nodes
            .filter(bauble.vertexFilter)
            .transition()
            .duration(this.settings.transitionDuration)
            .ease(this.settings.transitionEase)
            .attr("transform", (v) => {
                return `translate(${this.scales.x(v.x)}, ${this.scales.y(v.y)})`;
            });
        bauble.updateShapes(d, this.settings.backgroundBorder)
    });

    // EXIT
    // Remove old elements as needed.
    nodes.exit().remove();

    updateNodeBackgroundStyles.call(this);

}

/**
 * Adds or updates branch lines
 */
function updateBranches() {

    const branchesLayer = this.svgSelection.select(".branches-layer");

    // a function to create a line path
    // const branchPath = d3.line()
    //     .x((v) => v.x)
    //     .y((v) => v.y)
    //     .curve(this.layout.branchCurve);
    const branchPath = branchPathGenerator.call(this);

    // DATA JOIN
    // Join new data with old elements, if any.
    const branches = branchesLayer.selectAll("g .branch")
        .data(this.layout.edges, (e) => `b_${e.key}`);

    // ENTER
    // Create new elements as needed.
    const newBranches = branches.enter().append("g")
        .attr("id", (e) => e.id)
        .attr("class", (e) => ["branch", ...e.classes].join(" "))
        .attr("transform", (e) => {
            return `translate(${this.scales.x(e.v0.x)}, ${this.scales.y(e.v1.y)})`;
        });

    newBranches.append("path")
        .attr("class", "branch-path")
        .attr("d", (e,i) => branchPath(e,i));

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
        .duration(this.settings.transitionDuration)
        .ease(this.settings.transitionEase)
        .attr("class", (e) => ["branch", ...e.classes].join(" "))
        .attr("transform", (e) => {
            return `translate(${this.scales.x(e.v0.x)}, ${this.scales.y(e.v1.y)})`;
        })

        .select("path")
        .attr("d", (e,i) => branchPath(e,i))

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
    updateBranchStyles.call(this);

    // add callbacks
    for(const callback of this.callbacks.branches){
        callback();
    }
}

function updateCartoons(){
    const cartoonLayer = this.svgSelection.select(".cartoon-layer");

    // DATA JOIN
    // Join new data with old elements, if any.
    const cartoons = cartoonLayer.selectAll("g .cartoon")
        .data(this.layout.cartoons, (c) => `c_${c.id}`);

    // ENTER
    // Create new elements as needed.
    const newCartoons = cartoons.enter().append("g")
        .attr("id", (c) => `cartoon-${c.id}`)
        .attr("class", (c) => ["cartoon", ...c.classes].join(" "))
        .attr("transform", (c) => {
            return `translate(${this.scales.x(c.vertices[0].x)}, ${this.scales.y(c.vertices[0].y)})`;
        })


    newCartoons.append("path")
        .attr("class", "cartoon-path")
        .attr("d", (e,i) => pointToPoint.call(this,e.vertices))



    // update the existing elements
    cartoons
        .transition()
        .duration(this.settings.transitionDuration)
        .ease(this.settings.transitionEase)
        .attr("class", (c) => ["cartoon", ...c.classes].join(" "))
        .attr("transform", (c) => {
            return `translate(${this.scales.x(c.vertices[0].x)}, ${this.scales.y(c.vertices[0].y)})`
        })
        .select("path")
        .attr("d", (c) => pointToPoint.call(this,c.vertices));


    // EXIT
    // Remove old elements as needed.
    cartoons.exit().remove();

    updateCartoonStyles.call(this);

    // add callbacks
    for(const callback of this.callbacks.cartoons){
        callback();
    }
}

/**
 * Add axis
 */
function addAxis() {


    //x scale nodeHeight [root,0] => pixels
    // node Height [root,0] => [ orgin+root,orign] => pixels


    const reverse = this.settings.reverseAxis? -1:1;
    const domain = [this.settings.origin+reverse*(this.settings.offset+this.layout.horizontalScale.domain()[0]),this.settings.origin]
    const xAxis = axisBottom( scaleLinear().domain(domain).range(this.scales.x.range()))
        .ticks(this.settings.ticks).tickFormat(this.settings.tickFormat);

    const xAxisWidth = this.scales.width - this.margins.left - this.margins.right;

    const axesLayer = this.svgSelection.select(".axes-layer");

    axesLayer
        .append("g")
        .attr("id", "x-axis")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${this.scales.height - this.margins.bottom + 5})`)
        .call(xAxis);

    axesLayer
        .append("g")
        .attr("id", "x-axis-label")
        .attr("class", "axis-label")
        .attr("transform", `translate(${this.margins.left}, ${this.scales.height - this.margins.bottom})`)
        .append("text")
        .attr("transform", `translate(${xAxisWidth / 2}, 35)`)
        .attr("alignment-baseline", "hanging")
        .style("text-anchor", "middle")
        .text(this.settings.xAxisTitle);
}

function updateAxis(){
    const reverse = this.settings.reverseAxis? -1:1;

    const domain = [this.settings.origin+reverse*this.settings.branchScale*this.layout.horizontalScale.domain()[0],this.settings.origin];
    const xAxis = axisBottom(scaleLinear().domain(domain).range(this.scales.x.range()))
        .ticks(this.settings.ticks).tickFormat(this.settings.tickFormat);

    const xAxisWidth = this.scales.width - this.margins.left - this.margins.right;

    const axesLayer = this.svgSelection.select(".axes-layer");

    axesLayer
        .select("#x-axis")
        .transition()
        .duration(this.settings.transitionDuration)
        .ease(this.settings.transitionEase)
        .attr("transform", `translate(0, ${this.scales.height - this.margins.bottom + 5})`)
        .call(xAxis);

    axesLayer
        .select("#axis-label")
        .transition()
        .duration(this.settings.transitionDuration)
        .ease(this.settings.transitionEase)
        .attr("transform", `translate(${this.margins.left}, ${this.scales.height - this.margins.bottom})`)
        .attr("transform", `translate(${xAxisWidth / 2}, 35)`)
        .attr("alignment-baseline", "hanging")
        .style("text-anchor", "middle")
        .text(this.settings.xAxisTitle);
}




function updateNodeStyles(){
    const nodesLayer = this.svgSelection.select(".nodes-layer");

    // DATA JOIN
    // Join new data with old elements, if any.
    const nodes = nodesLayer.selectAll(".node .node-shape");
    const nodeStyles = this.settings.styles.nodes;
    for(const key of Object.keys(nodeStyles)){
        nodes
            // .transition()
            // .duration(this.settings.transitionDuration)
            .attr(key,d=>nodeStyles[key].call(this,d.node))
    }


}

function updateNodeBackgroundStyles(){
    const nodesBackgroundLayer = this.svgSelection.select(".nodes-background-layer");

    // DATA JOIN
    // Join new data with old elements, if any.
    const nodes = nodesBackgroundLayer.selectAll(".node-background")

    const nodeBackgroundsStyles = this.settings.styles.nodeBackgrounds;
    for(const key of Object.keys(nodeBackgroundsStyles)){
        nodes
            // .transition()
            // .duration(this.settings.transitionDuration)
            .attr(key,d=>nodeBackgroundsStyles[key].call(this,d.node))
    }

}

function updateBranchStyles(){
    const branchesLayer = this.svgSelection.select(".branches-layer");

    // DATA JOIN
    // Join new data with old elements, if any.
    const branches = branchesLayer.selectAll("g .branch .branch-path")

    const branchStyles = this.settings.styles["branches"];
    for(const key of Object.keys(branchStyles)){
        branches
            // .transition()
            // .duration(this.settings.transitionDuration)
            .attr(key,d=>branchStyles[key].call(this,d.v1.node))
    }
}

function updateCartoonStyles(){
    const cartoonLayer = this.svgSelection.select(".cartoon-layer");

    // DATA JOIN
    // Join new data with old elements, if any.
    const cartoons = cartoonLayer.selectAll(".cartoon path");
    const CartoonStyles = this.settings.styles.cartoons;
    for(const key of Object.keys(CartoonStyles)){
        cartoons
        // .transition()
        // .duration(this.settings.transitionDuration)
            .attr(key,c=>CartoonStyles[key].call(this,c.vertices[0].node))
        // attributes are set by the "root" node
    }
}

function pointToPoint(points){
    let path = [];
    const origin = points[0];
    const pathPoints =points.reverse();
    let currentPoint =origin;
    for(const point of pathPoints){
        const xdiff = this.scales.x(point.x)-this.scales.x(currentPoint.x);
        const ydiff = this.scales.y(point.y)- this.scales.y(currentPoint.y);
        path.push(`${xdiff} ${ydiff}`)
        currentPoint = point;
    }
    return `M 0 0 l ${path.join(" l ")} z`;
}

function updateAnnoations(){
    for( const annotation of this._annotations){
        annotation.call(this);
    }
}
/**
 * Generates a line() function that takes an edge and it's index and returns a line for d3 path element. It is called
 * by the figtree class as
 * const branchPath = this.layout.branchPathGenerator(this.scales)
 * newBranches.append("path")
 .attr("class", "branch-path")
 .attr("d", (e,i) => branchPath(e,i));
 * @param scales
 * @param branchCurve
 * @return {function(*, *)}
 */

function branchPathGenerator(){
    const branchPath =(e,i)=>{
        const branchLine = line()
            .x((v) => v.x)
            .y((v) => v.y)
            .curve(this.settings.branchCurve);
        const factor = e.v0.y-e.v1.y>0? 1:-1;
        const dontNeedCurve = e.v0.y-e.v1.y===0?0:1;
        const output = this.settings.curveRadius>0?
            branchLine(
                [{x: 0, y: this.scales.y(e.v0.y) - this.scales.y(e.v1.y)},
                    { x:0, y:dontNeedCurve*factor * this.settings.curveRadius},
                    {x:0 + dontNeedCurve*this.settings.curveRadius, y:0},
                    {x: this.scales.x(e.v1.x) - this.scales.x(e.v0.x), y: 0}
                ]):
            branchLine(
                [{x: 0, y: this.scales.y(e.v0.y) - this.scales.y(e.v1.y)},
                    {x: this.scales.x(e.v1.x) - this.scales.x(e.v0.x), y: 0}
                ]);
        return(output)

    };
    return branchPath;
}
