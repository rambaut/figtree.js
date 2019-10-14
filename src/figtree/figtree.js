"use strict";
import {select,easeLinear,scaleLinear,axisBottom,mouse,event,format,curveStepBefore,line} from "d3";
import uuid from "uuid";
import {mergeDeep} from "../utilities";
import 'd3-selection-multi';
import {CircleBauble} from "../baubles/circlebauble";
import {RoughCircleBauble} from "../baubles/roughcirclebauble";
import {BranchBauble} from "../baubles/branchbauble";
import {CartoonBauble} from "../baubles/cartoonbauble";
import {Axis} from "../baubles/axes";
/** @module figtree */
// const d3 = require("d3");

export const p= {
    addXAxis: Symbol("addXAxis"),
    addYAxis: Symbol("addYAxis"),
    updateXAxis:Symbol("updateXAxis"),
    updateYAxis:Symbol("updateYAxis"),
    updateAnnotations:Symbol("updateAnnotations"),
    updateCartoons:Symbol("updateCartoons"),
    updateBranches:Symbol("updateBranches"),
    updateNodeBackgrounds:Symbol("updateNodeBackgrounds"),
    updateNodes:Symbol("updateNodes"),
    updateBranchStyles:Symbol("updateBranchStyles"),
    updateNodeStyles:Symbol("updateNodeStyles"),
    updateNodeBackgroundStyles:Symbol("updateNodeBackgroundStyles"),
    updateCartoonStyles:Symbol("updateCartoonStyles"),
    branchPathGenerator:Symbol("branchPathGenerator"),
    pointToPoint:Symbol("pointToPoint"),
    setUpScales:Symbol("setUpScales")
}
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
            xScale: {
                axes:[new Axis({ title: {
                        text:"Height",
                        rotation:0,
                        xPadding:0,
                        yPadding:25,
                    },
                    location:"bottom",
                    tickArguments:[5,".2f"]})],
                gap:10,
                scale: scaleLinear,
                revisions: {
                    origin: null,
                    reverseAxis: false,
                    branchScale: 1,
                    offset: 0,
                    hedge: 0
                }
            },
            yScale: {
                axes:[],
                gap:10,
                scale: scaleLinear,
                revisions: {
                    origin: null,
                    reverseAxis: false,
                    branchScale: 1,
                    offset: 0,
                    hedge: 0
                }
            },
            vertices: {
                hoverBorder: 2,
                backgroundBaubles:[],
                baubles: [new CircleBauble()],
            },
            edges: {
                baubles:[new BranchBauble()]
            },
            cartoons:{
                baubles:[new CartoonBauble()]
            },
            transition: {
                transitionDuration: 500,
                transitionEase: easeLinear
            }
        }
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

        this.settings = mergeDeep(FigTree.DEFAULT_SETTINGS(),settings);
        this.callbacks= {nodes:[],branches:[],cartoons:[]};
        this._annotations =[];

        this.svg=svg;
        this.drawn = false;
        this.svgId = `g-${uuid.v4()}`;
        this.svgSelection=null;

        return this;
    }
    draw(){
        

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
        if (this.settings.vertices.backgroundBorder !==null) {
            this.svgSelection.append("g").attr("class", "nodes-background-layer");
        }
        this.svgSelection.append("g").attr("class", "nodes-layer");


        // create the scales
        this[p.setUpScales]();

        if(this.settings.xScale.axes.length>0){
           this[p.addXAxis]();
        }
        if(this.settings.yScale.axes.length>0){
            this[p.addYAxis]();
        }

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
        this[p.setUpScales]();

        this[p.updateAnnotations]();
        this[p.updateCartoons]();
        this[p.updateBranches]();

        if(this.settings.xScale.axes.length>0){
            this[p.updateXAxis]();
        }
        if(this.settings.yScale.axes.length>0){
            this[p.updateYAxis]();
        }

        if (this.settings.vertices.backgroundBaubles.length>0) {
            this[p.updateNodeBackgrounds]();
        }

        this[p.updateNodes]();

        return this;

    }

    /**
     * set mouseover highlighting of branches
     */
    hilightBranches() {
        const self=this;
        const action = {
            enter:(d,i,n)=>{
                const branch = select(n[i]);
                // self.settings.edges.baubles.forEach((bauble) => {
                //     if (bauble.edgeFilter(branch)) {
                //         bauble.updateShapes(branch);
                //     }
                // });
                select(n[i]).classed("hovered", true);
                },
            exit:(d,i,n)=>{
                const branch = select(n[i]);
                // self.settings.edges.baubles.forEach((bauble) => {
                //     if (bauble.edgeFilter(branch)) {
                //         bauble.updateShapes(branch);
                //     }
                // });
                select(n[i]).classed("hovered", false);
                }
        };
        this.onHoverBranch({action:action,update:false});
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
        const self = this;
        const action = {
            enter: (d, i, n) => {
                const node = select(n[i]);
                self.settings.vertices.baubles.forEach((bauble) => {
                    if (bauble.vertexFilter(node)) {
                    bauble.updateShapes(node, self.settings.vertices.hoverBorder);
                    }
                });
                node.classed("hovered", true);
            },
            exit: (d,i,n) =>{
                const node = select(n[i]);

                self.settings.vertices.baubles.forEach((bauble) => {
                    if (bauble.vertexFilter(node)) {
                    bauble.updateShapes(node, 0);
                    }
                });
                node.classed("hovered", false);
            }
        };
        this.onHoverNode({action,selection,update:false});
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
    onClickBranch({action, selection,update}) {
        selection = selection ? selection : ".branch";
        update = update?update:false;
        this.callbacks.branches.push(()=>{
            // We need to use the "function" keyword here (rather than an arrow) so that "this"
            // points to the actual SVG element (so we can use d3.mouse(this)). We therefore need
            // to store a reference to the object in "self".
            const self = this;
            const selected = this.svgSelection.selectAll(`${selection}`);
            selected.on("click", function (edge) {
                const x1 = self.scales.x(edge.v1.x+self.settings.xScale.revisions.offset);
                const x2 = self.scales.x(edge.v0.x+self.settings.xScale.revisions.offset);
                const mx = mouse(this)[0];
                const proportion = Math.max(0.0, Math.min(1.0, (mx - x2) / (x1 - x2)));
                action(edge, proportion);
                if(update){
                    self.update();
                }
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
    onClickInternalNode(action,update=false) {
        this.onClickNode({action:action, selection:".internal-node",update:update});
        return this;
    }

    /**
     * Registers action function to be called when an external node is clicked on. The function should
     * take the tree and the node that was clicked on.
     *
     * @param action
     */
    onClickExternalNode(action,update=false) {
        this.onClickNode({action:action,selection:".external-node",update:update});
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
    onClickNode({action,selection,update}) {
        selection = selection ? selection : ".node";
        // selection = `${selection} .node-shape`;
        this.callbacks.nodes.push(()=>{
            this.onClick({action:action,selection:selection,update:true})
        });
        this.update();
        return this;

    }
    /**
     * General Nodehover callback
     * @param {*} action and object with an enter and exit function which fire when the mouse enters and exits object
     * @param {*} selection defualts to ".node" will select this selection's child ".node-shape"
     */

    onHoverNode({action,selection,update}){
        selection = selection ? selection : ".node";
        update = update?update:false
        // selection = `${selection} .node-shape`;
        this.callbacks.nodes.push(()=>{
            this.onHover({action:action,selection:selection,update:update})
        });
        this.update();
        return this;

    }

    /**
     * General branch hover callback
     * @param {*} action and object with an enter and exit function which fire when the mouse enters and exits object
     * @param {*} selection defualts to .branch
     */
    onHoverBranch({action,selection,update}){
        selection = selection ? selection : ".branch";
        update = update? update:false;
        this.callbacks.branches.push(()=>{
            this.onHover({action:action,selection:selection,update:update});
        });
        // this update binds the callbacks to the html nodes
        this.update();
        return this;
    }

    /**
     * Add a hover callback
     * @param {*} action  - object which has 2 functions enter and exit each takes 3 arguments d,i,n d is data n[i] is `this`
     * @param {*} selection  - what to select defaults to
     */
    onHover({action,selection,update}){
        // const self=this;
        const selected = this.svgSelection.selectAll(`${selection}`);
        selected.on("mouseover", (d,i,n) => {
            action.enter(d,i,n);
            if(update){
                self.update();
            }
        });
        selected.on("mouseout", (d,i,n) => {
            action.exit(d,i,n);
            if(update){
                self.update()
            }
        });
        return this;
    }

    onClick({action,selection,update}){
        const self=this;
        const selected = this.svgSelection.selectAll(`${selection}`);
        selected.on("click", (d,i,n) => {
            action(d,i,n);
            if(update){
                self.update();
            }
        });
        return this
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

    updateSettings(settings){
       this.settings = mergeDeep(this.settings,settings);
        this.update();
    }

 /*
 * Protected methods, called by the class using.
 */

    [p.setUpScales](){
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

        // create the scales
        const xScale = this.settings.xScale.scale()
            .domain([this.layout.horizontalDomain[0]+this.settings.xScale.revisions.offset+this.settings.xScale.revisions.hedge,this.layout.horizontalDomain[1]])
            .range([this.margins.left, width - this.margins.right]);

        const yScale = this.settings.yScale.scale()
            .domain([this.layout.verticalDomain[0]+this.settings.yScale.revisions.offset,this.layout.verticalDomain[1]])
            .range([this.margins.top, height -this.margins.bottom]);

        this.scales = {x:xScale, y:yScale, width, height};
    }
    /**
     * Adds or updates nodes
     */
    [p.updateNodes](){
        const nodesLayer = this.svgSelection.select(".nodes-layer");

        // DATA JOIN
        // Join new data with old elements, if any.
        const self = this;
        nodesLayer.selectAll(".node")
            .data(this.layout.vertices, (v) => `n_${v.key}`)
            .join(
                enter=>enter
                    .append("g")
                        .attr("id", (v) => v.id)
                        .attr("class", (v) => ["node", ...v.classes].join(" "))
                        .attr("transform", (v) => {
                            return `translate(${this.scales.x(v.x+this.settings.xScale.revisions.offset)}, ${this.scales.y(v.y)})`;
                        })
                        .each(function(v) {
                            for(const bauble of  self.settings.vertices.baubles){
                                if (bauble.vertexFilter(v)) {
                                    bauble
                                        .updateShapes(select(this))
                                }
                            }
                        })
                    .append("text")
                        .attr("class", "node-label name")
                        .attr("text-anchor", "start")
                        .attr("alignment-baseline", "middle")
                        .attr("dx", "12")
                        .attr("dy", "0")
                        .text((d) => d.rightLabel)
                    .append("text")
                        .attr("class", "node-label support")
                        .attr("text-anchor", "end")
                        .attr("dx", "-6")
                        .attr("dy", d => (d.labelBelow ? -8 : +8))
                        .attr("alignment-baseline", d => (d.labelBelow ? "bottom": "hanging" ))
                        .text((d) => d.leftLabel),
                update => update
                    .call(update => update.transition()
                    .duration(this.settings.transition.transitionDuration)
                    .ease(this.settings.transition.transitionEase)
                    .attr("class", (v) => ["node", ...v.classes].join(" "))
                    .attr("transform", (v) => {
                        return `translate(${this.scales.x(v.x+this.settings.xScale.revisions.offset)}, ${this.scales.y(v.y)})`;
                    })
                    .on("start", function(v) {
                        for (const bauble of self.settings.vertices.baubles) {
                            if (bauble.vertexFilter(v)) {
                                bauble
                                    .updateShapes(select(this))
                            }
                        }
                    })
                    // .each(
                    // })
                    .select("text .node-label .name")
                        .transition()
                        .duration(this.settings.transition.transitionDuration)
                        .ease(this.settings.transition.transitionEase)
                        .attr("class", "node-label name")
                        .attr("text-anchor", "start")
                        .attr("alignment-baseline", "middle")
                        .attr("dx", "12")
                        .attr("dy", "0")
                        .text((d) => d.rightLabel)
                    .select("text .node-label .support")
                        .transition()
                        .duration(this.settings.transition.transitionDuration)
                        .ease(this.settings.transition.transitionEase)
                        .attr("alignment-baseline", d => (d.labelBelow ? "bottom": "hanging" ))
                        .attr("class", "node-label support")
                        .attr("text-anchor", "end")
                        .attr("dx", "-6")
                        .attr("dy", d => (d.labelBelow ? -8 : +8))
                        .text((d) => d.leftLabel)
                    )

            );
        // add callbacks
        for(const callback of this.callbacks.nodes){
            callback();
        }
    }

    [p.updateNodeBackgrounds]() {

        const nodesBackgroundLayer = this.svgSelection.select(".nodes-background-layer");

        // DATA JOIN
        // Join new data with old elements, if any.
        const self = this;
        nodesBackgroundLayer.selectAll(".node-background")
            .data(this.layout.vertices, (v) => `nb_${v.key}`)
            .join(
                enter=>enter
                    .append("g")
                        .attr("id", (v) => v.id)
                        .attr("class", (v) => ["node-background", ...v.classes].join(" "))
                        .attr("transform", (v) => {
                            return `translate(${this.scales.x(v.x+this.settings.xScale.revisions.offset)}, ${this.scales.y(v.y)})`;
                        })
                        .each(function(v) {
                            for(const bauble of  self.settings.vertices.backgroundBaubles){
                                if (bauble.vertexFilter(v)) {
                                    bauble
                                        .updateShapes(select(this))
                                }
                            }
                        }),
                update => update
                    .call(update => update.transition()
                        .duration(this.settings.transition.transitionDuration)
                        .ease(this.settings.transition.transitionEase)
                        .attr("class", (v) => ["node-background", ...v.classes].join(" "))
                        .attr("transform", (v) => {
                            return `translate(${this.scales.x(v.x+this.settings.xScale.revisions.offset)}, ${this.scales.y(v.y)})`;
                        })
                        .each(function(v) {
                            for(const bauble of  self.settings.vertices.backgroundBaubles){
                                if (bauble.vertexFilter(v)) {
                                    bauble
                                        .updateShapes(select(this))
                                }
                            }
                        })
                    )
            );
        for(const callback of this.callbacks.nodes){
            callback();
        }
    }

    /**
     * Adds or updates branch lines
     */
    [p.updateBranches]() {

        const branchesLayer = this.svgSelection.select(".branches-layer");
        //set up scales for branches

        this.settings.edges.baubles.forEach(b=>b.setup({x:this.scales.x,y:this.scales.y,
            xOffset:this.settings.xScale.revisions.offset,yOffset:this.settings.yScale.revisions.offset}));
        // DATA JOIN
        // Join new data with old elements, if any.
        const self = this;
        branchesLayer.selectAll(".branch")
            .data(this.layout.edges, (e) => `b_${e.key}`)
            .join(
                enter=>enter
                    .append("g")
                        .attr("id", (e) => e.id)
                        .attr("class", (e) => ["branch", ...e.classes].join(" "))
                        .attr("transform", (e) => {
                            return `translate(${this.scales.x(e.v0.x+this.settings.xScale.revisions.offset)}, ${this.scales.y(e.v1.y)})`;
                        })
                        .each(function(e) {
                            for(const bauble of  self.settings.edges.baubles){
                                if (bauble.edgeFilter(e)) {
                                    bauble
                                        .updateShapes(select(this))
                                }
                            }
                        })
                    .append("text")
                        .attr("class", "branch-label")
                        .attr("dx", (e) => ((this.scales.x(e.v1.x+this.settings.xScale.revisions.offset) - this.scales.x(e.v0.x+this.settings.xScale.revisions.offset)) / 2))
                        .attr("dy", (e) => (e.labelBelow ? +6 : -6))
                        .attr("alignment-baseline", (e) => (e.labelBelow ? "hanging" : "bottom"))
                        .attr("text-anchor", "middle")
                        .text((e) => e.label),
                update => update
                    .call(update => update.transition()
                        .duration(this.settings.transition.transitionDuration)
                        .ease(this.settings.transition.transitionEase)
                        .attr("class", (e) => ["branch", ...e.classes].join(" "))
                        .attr("transform", (e) => {
                            return `translate(${this.scales.x(e.v0.x+this.settings.xScale.revisions.offset)}, ${this.scales.y(e.v1.y)})`;
                        })
                    .on("start",function(e) {
                        for(const bauble of  self.settings.edges.baubles){
                            if (bauble.edgeFilter(e)) {
                                bauble
                                    .updateShapes(select(this))
                            }
                        }
                    })
                        // .each(
                    .select("text .branch-label .length")
                        .attr("class", "branch-label length")
                        .attr("dx", (e) => ((this.scales.x(e.v1.x+this.settings.xScale.revisions.offset) - this.scales.x(e.v0.x+this.settings.xScale.revisions.offset)) / 2))
                        .attr("dy", (e) => (e.labelBelow ? +6 : -6))
                        .attr("alignment-baseline", (e) => (e.labelBelow ? "hanging" : "bottom"))
                        .attr("text-anchor", "middle")
                        .text((e) => e.label)
                    )
            );

        // add callbacks
        for(const callback of this.callbacks.branches){
            callback();
        }
    }

    [p.updateCartoons](){
        const cartoonLayer = this.svgSelection.select(".cartoon-layer");

        cartoonLayer.selectAll("g .cartoon")
            .data(this.layout.cartoons, (c) => `c_${c.id}`)
            .join(
                enter=>enter
                    .append("g")
                        .attr("id", (c) => `cartoon-${c.id}`)
                        .attr("class", (c) => ["cartoon", ...c.classes].join(" "))
                        .attr("transform", (c) => {
                            return `translate(${this.scales.x(c.vertices[0].x+this.settings.xScale.revisions.offset)}, ${this.scales.y(c.vertices[0].y+this.settings.xScale.revisions.offset)})`;
                        })
                        .each(function(c) {
                            for(const bauble of  self.settings.cartoons.baubles){
                                if (bauble.edgeFilter(c)) {
                                    bauble
                                        .updateShapes(select(this))
                                }
                            }
                        }),
                update=>update
                    .transition()
                    .duration(this.settings.transition.transitionDuration)
                    .ease(this.settings.transition.transitionEase)
                    .attr("class", (c) => ["cartoon", ...c.classes].join(" "))
                    .attr("transform", (c) => {
                        return `translate(${this.scales.x(c.vertices[0].x+this.settings.xScale.revisions.offset)}, ${this.scales.y(c.vertices[0].y+this.settings.xScale.revisions.offset)})`;
                    })
                    .each(function(c) {
                        for(const bauble of  self.settings.cartoons.baubles){
                            if (bauble.edgeFilter(c)) {
                                bauble
                                    .updateShapes(select(this))
                            }
                        }
                    })
            );
        // add callbacks
        for(const callback of this.callbacks.cartoons){
            callback();
        }
    }

    /**
     * Add axis
     */
    [p.addXAxis]() {
        const xRevisions = this.settings.xScale.revisions;
        const reverse = xRevisions.reverseAxis? -1:1;
        const domain = xRevisions.origin!==null?
            [xRevisions.origin+xRevisions.hedge+reverse*xRevisions.branchScale*(Math.abs(this.scales.x.domain()[0]-this.scales.x.domain()[1])),xRevisions.origin]:
            this.scales.x.domain();
        const axisScale =  this.settings.xScale.scale().domain(domain).range(this.scales.x.range());

        const xAxisWidth = this.scales.width - this.margins.left - this.margins.right;
        const axesLayer = this.svgSelection.select(".axes-layer");

        this.settings.xScale.axes.forEach(axis=>{
            axis.createAxis({selection:axesLayer,
                x:0,
                y:this.scales.height - this.margins.bottom +this.settings.xScale.gap,
                length:xAxisWidth,
                scale:axisScale})
        });
    }

    [p.addYAxis]() {
        const yRevisions = this.settings.yScale.revisions;
        const reverse = yRevisions.reverseAxis? -1:1;
        const domain = yRevisions.origin!==null?
            [yRevisions.origin+reverse*yRevisions.branchScale*(Math.abs(this.scales.y.domain()[0]-this.scales.y.domain()[1])),yRevisions.origin]:
            this.scales.y.domain();
        const axisScale =  this.settings.yScale.scale().domain(domain).range(this.scales.y.range());
        const yAxisHeight = this.scales.height - this.margins.top - this.margins.bottom;
        const axesLayer = this.svgSelection.select(".axes-layer");

        this.settings.xScale.axes.forEach(axis=>{
            axis.createAxis({selection:axesLayer,
                x:0,
                y:this.scales.height - this.margins.bottom +this.settings.xScale.gap,
                length:yAxisHeight,
                scale:axisScale})
        });
    }

    [p.updateXAxis](){
        const xRevisions = this.settings.xScale.revisions;
        const reverse = xRevisions.reverseAxis? -1:1;
        const domain = xRevisions.origin!==null?
            [xRevisions.origin+xRevisions.hedge+reverse*xRevisions.branchScale*(Math.abs(this.scales.x.domain()[0]-this.scales.x.domain()[1])),xRevisions.origin]:
            this.scales.x.domain();
        const axisScale =  this.settings.xScale.scale().domain(domain).range(this.scales.x.range());

        const xAxisWidth = this.scales.width - this.margins.left - this.margins.right;
        const axesLayer = this.svgSelection.select(".axes-layer");

        this.settings.xScale.axes.forEach(axis=>{
            axis.updateAxis({selection:axesLayer,
                x:0,
                y:this.scales.height - this.margins.bottom +this.settings.xScale.gap,
                length:xAxisWidth,
                scale:axisScale})
        });
    }
    [p.updateYAxis](){
        const yRevisions = this.settings.yScale.revisions;
        const reverse = yRevisions.reverseAxis? -1:1;
        const domain = yRevisions.origin!==null?
            [yRevisions.origin+reverse*yRevisions.branchScale*(Math.abs(this.scales.y.domain()[0]-this.scales.y.domain()[1])),yRevisions.origin]:
            this.scales.y.domain();
        const axisScale =  this.settings.yScale.scale().domain(domain).range(this.scales.y.range())
        const yAxisHeight = this.scales.height - this.margins.top - this.margins.bottom;
        const axesLayer = this.svgSelection.select(".axes-layer");

        this.settings.xScale.axes.forEach(axis=>{
            axis.updateAxis({selection:axesLayer,
                x:0,
                y:this.scales.height - this.margins.bottom +this.settings.xScale.gap,
                length:yAxisHeight,
                scale:axisScale})
        });
    }



    [p.updateNodeStyles](){
        const nodesLayer = this.svgSelection.select(".nodes-layer");

        // DATA JOIN
        // Join new data with old elements, if any.
        const nodes = nodesLayer.selectAll(".node .node-shape");
        const vertexStyles = this.settings.vertices.cssStyles;
        for(const key of Object.keys(vertexStyles)){
            nodes
            // .transition()
            // .duration(this.settings.transition.transitionDuration)
                .attr(key,v=>vertexStyles[key].call(this,v))
        }


    }

    [p.updateNodeBackgroundStyles](){
        const nodesBackgroundLayer = this.svgSelection.select("nodes-background-layer");

        // DATA JOIN
        // Join new data with old elements, if any.
        const nodes = nodesBackgroundLayer.selectAll(".node-background");

        const vertexBackgroundsStyles = this.settings.vertices.backgroundCssStyles;
        for(const key of Object.keys(vertexBackgroundsStyles)){
            nodes
            // .transition()
            // .duration(this.settings.transition.transitionDuration)
                .attr(key,v=>vertexBackgroundsStyles[key].call(this,v))
        }

    }

    [p.updateBranchStyles](){
        const branchesLayer = this.svgSelection.select(".branches-layer");

        // DATA JOIN
        // Join new data with old elements, if any.
        const branches = branchesLayer.selectAll("g .branch .branch-path")

        const branchStyles = this.settings.edges.cssStyles;
        for(const key of Object.keys(branchStyles)){
            branches
            // .transition()
            // .duration(this.settings.transition.transitionDuration)
                .attr(key,e=>branchStyles[key].call(this,e))
        }
    }

    [p.updateCartoonStyles](){
        const cartoonLayer = this.svgSelection.select(".cartoon-layer");

        // DATA JOIN
        // Join new data with old elements, if any.
        const cartoons = cartoonLayer.selectAll(".cartoon path");
        const CartoonStyles = this.settings.cartoons.cssStyles;
        for(const key of Object.keys(CartoonStyles)){
            cartoons
            // .transition()
            // .duration(this.settings.transition.transitionDuration)
                .attr(key,c=>CartoonStyles[key].call(this,c))
            // attributes are set by the "root" node
        }
    }

    [p.pointToPoint](points){
        let path = [];
        const origin = points[0];
        const pathPoints =points.reverse();
        let currentPoint =origin;
        for(const point of pathPoints){
            const xdiff = this.scales.x(point.x+this.settings.xScale.revisions.offset)-this.scales.x(currentPoint.x+this.settings.xScale.revisions.offset);
            const ydiff = this.scales.y(point.y)- this.scales.y(currentPoint.y);
            path.push(`${xdiff} ${ydiff}`);
            currentPoint = point;
        }
        return `M 0 0 l ${path.join(" l ")} z`;
    }

    [p.updateAnnotations](){
        for( const annotation of this._annotations){
            annotation();
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

    [p.branchPathGenerator](){
        const branchPath =(e,i)=>{
            const branchLine = line()
                .x((v) => v.x)
                .y((v) => v.y)
                .curve(this.settings.edges.curve);
            const factor = e.v0.y-e.v1.y>0? 1:-1;
            const dontNeedCurve = e.v0.y-e.v1.y===0?0:1;
            const output = this.settings.edges.curveRadius>0?
                branchLine(
                    [{x: 0, y: this.scales.y(e.v0.y) - this.scales.y(e.v1.y)},
                        { x:0, y:dontNeedCurve*factor * this.settings.edges.curveRadius},
                        {x:0 + dontNeedCurve*this.settings.edges.curveRadius, y:0},
                        {x: this.scales.x(e.v1.x+this.settings.xScale.revisions.offset) - this.scales.x(e.v0.x+this.settings.xScale.revisions.offset), y: 0}
                    ]):
                branchLine(
                    [{x: 0, y: this.scales.y(e.v0.y) - this.scales.y(e.v1.y)},
                        {x: this.scales.x(e.v1.x+this.settings.xScale.revisions.offset) - this.scales.x(e.v0.x+this.settings.xScale.revisions.offset), y: 0}
                    ]);
            return(output)

        };
        return branchPath;
    }


}










