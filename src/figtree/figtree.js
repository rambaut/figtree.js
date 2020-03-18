"use strict";
import {select,easeCubic,scaleLinear} from "d3";
import uuid from "uuid";
import { mergeDeep} from "../utilities";
import 'd3-selection-multi';
import {GeoLayout} from "../layout/_deprecatedClasses/geoLayout";
import {BaubleManager} from "../features/baubleManager"
import p from "../_privateConstants.js"
import extent from "d3-array/src/extent";

/** @module figtree */


/**
 * The FigTree class
 *
 * A class that takes a tree and draws it into the the given SVG root element. Has a range of methods
 * for adding interactivity to the tree (e.g., mouse-over labels, rotating nodes and rerooting on branches).
 * The figure updates with animated transitions when the tree is updated.
 */
export class FigTree {

    static DEFAULT_SETTINGS() {
        return {
            xScale: {
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
                scale: scaleLinear,
                revisions: {
                    origin: null,
                    reverseAxis: false,
                    offset: 0,
                    hedge: 0
                }
            },
        }
    }

    /**
     * The constructor. All parameters are optional can be set with setters after construction.
     * @param {DOM.node} [svg=null] - the svg that will hold the figure.
     * @param margins {Object} [margins={top:10,bottom:60,left:30,right:60}]  The margins around the tree figure. Axis will go in these spaces if applicable
     * @param tree {Tree} [null] - the tree
     * @param settings {Object} [settings={width:null,height:null}] sets the size for drawing the figure. If not provided, the size of the svg will be used.
     * @returns {FigTree}
     */
    constructor(svg=null, margins={top:10,bottom:60,left:30,right:60},tree=null, settings = {}) {
        // this[p.layout] = layout;
        this._margins = margins;

        this.settings = mergeDeep(FigTree.DEFAULT_SETTINGS(),settings);
        this._transitions=  {
            transitionDuration: 500,
                transitionEase: easeCubic
        };
        this[p.svg]=svg;
        this[p.tree] = tree;
        this[p.tree].subscribeCallback( () => {
                this.update();
            });
        setupSVG.call(this);
        this.axes=[];
        this._features=[];

        this.nodeManager = new BaubleManager()
            .class("node")
            .layer("nodes-layer")
            .figure(this);


        this.nodeBackgroundManager = new BaubleManager()
            .class("node-background")
            .layer("node-backgrounds-layer")
            .figure(this);

        this.branchManager = new BaubleManager()
            .class("branch")
            .layer("branches-layer")
            .figure(this);
        // this.setupUpdaters();
        return this;
    }

    /**
     * Setter/getter for transition setting.
     * @param t {Object} [t={transitionEase,transitionDuration:} - sets the transition ease and duration (in milliseconds) and returns the figtree instance
     * if nothing is provided it returns the current settings.
     * @returns {{transitionEase: cubicInOut, transitionDuration: number}|*}
     */
    transitions(t=null){
        if(t){
            this._transitions={...this._transitions,...t};
        }else{
            return this._transitions;
        }
    }

    /**
     * Setter/getter for updating the margins.
     * @param m {Object} [margins={top:10,bottom:60,left:30,right:60}] -any provided object will be merged with the current settings.
     * If nothing is provided returns current margins.
     * @returns {*}
     */
    margins(m=null){
        if(m!==null){
            this._margins = {...this._margins,...m}
            return this;
        }else{
            return this._margins
        }
    }



    /**
     * Updates the figure when the tree has changed.  You can call this to force an update.
     * Returns the figure.
     */
    update() {
        const {vertices,edges} = this[p.layout](this[p.tree]);

        select(`#${this.svgId}`)
            .attr("transform",`translate(${this._margins.left},${this._margins.top})`);

        setUpScales.call(this,vertices,edges);

        updateNodePositions.call(this,vertices);
        updateBranchPositions.call(this,edges);

        for(const feature of this._features){
            feature.update({vertices,edges})
        }
        return this;

    }



    /**
     * Adds an element to the node update cycle. The element's update method will be called for each node selection.
     * Used to insert the visible elements mapped to the nodes
     * @param elements
     * @return {FigTree}
     */
    nodes(...elements){
        for(const element of elements){
            this.nodeManager.element(element);
        }
        this.update();
        return this;
    }

    /**
     * Adds an element to the branch update cycle.The element's update method will be called for each branch selection.
     * Used to insert the visible elements mapped to the nodes
     * @param elements
     * @return {FigTree}
     */
    branches(...elements){
        for(const element of elements){
            this.branchManager.element(element);
        }
        this.update();
        return this;
    }
    /**
     * Adds an element to the node background update cycle. The element's update method will be called for each node selection.
     * Used to insert the visible elements mapped to the nodes
     * @param elements
     * @return {FigTree}
     */
    nodeBackgrounds(...elements){
        for(const element of elements){
            this.nodeBackgroundManager.element(element);
        }
        this.nodeBackgroundManager.update();
        return this;
    }


    /**
     * Registers some text to appear in a popup box when the mouse hovers over the selection.
     *
     * @param selection -  {string} - passed to the d3 select. Adds an event listener to this selection to trigger the tooltip
     * @param text - {string} - text to display in the tooltip.
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


// setters and getters
    /**
     * Get or set SVG
     * @param svg - optional parameter.
     * @return {FigTree|svg}
     */
    svg(svg=null){
        if(svg===null){
            return this[p.svg]
        }
        else {
            this[p.svg] = svg;
            return this;
        }
        }

    /**
     * Get or set tree
     * @param tree
     * @return {FigTree|Tree}
     */
    tree(tree=null){
        if(tree===null){
            return this[p.tree]
        }else{
            this[p.tree] = tree;
            this[p.tree].subscribeCallback( () => {
                this.update();
            });
            this.update();
            return this;
        }
    }

    /**
     * Get or set layout function
     * @param layout
     * @return {FigTree|*}
     */
    layout(layout=null){
        if(layout===null){
            return this[p.layout]
        }else{
            this[p.layout] = layout;
            this.update();
            return this;
        }
    }

    /**
     * Add a feature to the update cycle. Also sets the figure of the feature to this figtree instance
     * The feature's update cycle will be called
     * with an an object containing the vertices and edges.
     * @param feature
     * @return {FigTree}
     */
    feature(f){
        f.figure(this);
        this._features = this._features.concat(f);
        this.update();
        return this;
    }
    // axis(){
    //     const a = axis();
    //     this.feature(a);
    //     return a;
    // }
    // scaleBar(){
    //     const sb=scaleBar();
    //     this.feature(sb);
    //     return sb;
    // }
    // legend(){
    //     const l = legend();
    //     this.feature(l);
    //     return l;
    // }
}

function setupSVG(){

    this.svgId = `g-${uuid.v4()}`;
    select(this[p.svg]).select(`#${this.svgId}`).remove();

    // add a group which will contain the new tree
    select(this[p.svg]).append("g")
        .attr("id",this.svgId)
        .attr("transform",`translate(${this._margins.left},${this._margins.top})`);

    //to selecting every time
    this.svgSelection = select(this[p.svg]).select(`#${this.svgId}`);
    this.svgSelection.append("g").attr("class","annotation-layer");
    this.svgSelection.append("g").attr("class", "axes-layer");
    this.svgSelection.append("g").attr("class", "cartoon-layer");

    this.svgSelection.append("g").attr("class", "branches-layer");
    this.svgSelection.append("g").attr("class", "node-backgrounds-layer");
    this.svgSelection.append("g").attr("class", "nodes-layer");

}
/**
 * A helper function that sets the positions of the node and nodebackground groups in the svg and then calls update
 * functions of the node and node background elements.
 * @param vertices
 */
function updateNodePositions(vertices) {
    this.nodeManager.update(vertices);
    this.nodeBackgroundManager.update(vertices);
}

/**
 * A helper function that sets the postions of the branch groups and calls the update functions of the branch elements.
 * @param edges
 */
function updateBranchPositions(edges){
    this.branchManager.update(edges)
}
function setUpScales(vertices,edges){
    let width,height;
    if(Object.keys(this.settings).indexOf("width")>-1){
        width =this.settings.width;
    }else{
        width = this[p.svg].getBoundingClientRect().width;
    }
    if(Object.keys(this.settings).indexOf("height")>-1){
        height =this.settings.height;
    }else{
        height = this[p.svg].getBoundingClientRect().height;
    }

    // create the scales
    let xScale,yScale;
    let projection=null;

    if(this.layout instanceof GeoLayout){
        xScale = scaleLinear();
        yScale = scaleLinear();
        projection = this.layout.projection;
    }
    else{
        const xdomain = extent(vertices.map(d=>d.x).concat(edges.reduce((acc,e)=> acc.concat([e.v1.x,e.v0.x]),[])));
        // almost always the same except when the trendline is added as an edge without vertices
        const ydomain =  extent(vertices.map(d=>d.y).concat(edges.reduce((acc,e)=>acc.concat([e.v1.y,e.v0.y]),[])));

        xScale = this.settings.xScale.scale()
            .domain(xdomain)
            .range([0, width - this._margins.right-this._margins.left]);

        yScale = this.settings.yScale.scale()
            .domain(ydomain)
            .range([height -this._margins.bottom-this._margins.top,0]);
    }

    this.scales = {x:xScale, y:yScale, width, height, projection};
}