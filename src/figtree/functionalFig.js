"use strict";
import {select,easeCubic,scaleLinear,mouse,event,line} from "d3";
import uuid from "uuid";
import {compose, mergeDeep} from "../utilities";
import 'd3-selection-multi';
import {CircleBauble} from "../baubles/circlebauble";
import {Branch} from "../baubles/branch";
import {CartoonBauble} from "../baubles/cartoonbauble";
import {GeoLayout} from "../layout/classes/geoLayout";
import {rectangularLayout} from "../layout/rectangularLayout.f";
import ElementFactory from "../dataWrappers/elementFactory"
import {branches} from "../dataWrappers/branches";
import {min,max} from "d3-array";
import p from "../privateConstants.js"
// import  {nodes,nodeBackground} from "../dataWrappers/nodes";
import extent from "d3-array/src/extent";

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
            xScale: {
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
            yScale: {
                axes:[],
                gap:10,
                scale: scaleLinear,
                revisions: {
                    origin: null,
                    reverseAxis: false,
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
                baubles:[new Branch()]
            },
            cartoons:{
                baubles:[new CartoonBauble()]
            },
            transition: {
                transitionDuration: 500,
                transitionEase: easeCubic
            }
        }
    }

    /**
     * The constructor.
     * @param {svg} svg -  the html svg that will hold the figure
     * @param {Object} layout - an instance of class AbstractLayout
     * @param {Object} margins -  the space within the svg along the border that will not be used to draw the tree. Axis will be placed in this space
     * @param {number} margins.top - the distance from the top
     * @param {number} margins.bottom - the distance from the bottom
     * @param {number} margins.left - the distance from the left
     * @param {number} margins.right - the distance from the right
     * @param {Object} [settings={}] - Settings for the figure. Settings provided in part will not affect defaults not explicitly mentioned
     * @param {Object} settings.xScale - Settings specific for the x scale of the figure
     * @param {Object[]} [settings.xScale.axes=[]] - An array of axis that will use the xScale
     * @param {number} [settings.xScale.gap=10] - The number of pixels between the axis line and the bottom of the svg drawing space
     * @param {function} [settings.xScale.scale=d3.scaleLinear] - A d3 scale for the x dimension
     * @param {Object} settings.xScale.revisions - Any updates or revisions to be made to the x scale set by the layout
     * @param {number} [settings.xScale.revisions.origin=null] - An optional value for specifying the right most edge of the plot.
     * @param {boolean} [settings.xScale.revisions.reverseAxis=false] - Should the x axis decrease from right to left? (default false => number increase from height 0 as we move right to left)
     * @param {number} [settings.xScale.revisions.branchScale=1] - Factor to scale the branchlengths by
     * @param {number} [settings.xScale.revisions.offset=0] - Space to add between the origin and right-most vertex
     * @param {number} [settings.xScale.revisions.hedge = 0] - Space to add between the left edge of the plot and the left most vertex.
     * @param {Object} settings.yScale - Settings specific for the y scale of the figure
     * @param {Object[]} [settings.yScale.axes=[]] - An array of axis that will use the yScale
     * @param {number} [settings.yScale.gap=10] - The number of pixels between the axis line and the left of the svg drawing space
     * @param {function} [settings.yScale.scale=d3.scaleLinear] - A d3 scale for the y dimension
     * @param {Object} settings.vertices - Options specific to the vertices that map to the nodes of the tree
     * @param {number} [settings.vertices.hoverBorder=2] - the number of pixels by which the radius of the vertices will increase by if the highlightNodes option is used and the vertex is hovered
     * @param {Object[]} [settings.vertices.baubles=[new CircleBauble()]] - An array of baubles for the nodes, each bauble can have it's own settings
     * @param {Object[]} [settings.vertices.backgroundBaubles=[]] - An array of baubles that will go behind the main bauble of the nodes, each bauble can have it's own settings
     * @param {Object}    settings.edges - Options specific to the edges that map to the branches of the tree
     * @param {Object[]}  [settings.edges.baubles=[new Branch()]] - An array of baubles that form the branches of the tree, each bauble can have it's own settings
     * @param {Object}    settings.cartoons - Options specific to the cartoons on the tree (triangle clades ect.)
     * @param {Object[]}  [settings.edges.baubles=[new CartoonBauble()]] - An array of baubles that form the cartoons on the firgure, each bauble can have it's own settings     cartoons:{
     * @param {Object} settings.transition - Options controlling the how the figure changes upon interaction
     * @param {number} [settings.transition.transitionDuration=500] - the number of milliseconds to take when transitioning
     * @param {function} [settings.transitionEase=d3.easeLinear] - the d3 ease function used to interpolate during transitioning
     *
     */
    constructor(svg=null,tree=null, layout=rectangularLayout, margins={top:10,bottom:60,left:30,right:60}, settings = {}) {
        this[p.layout] = layout;
        this._margins = margins;

        this.settings = mergeDeep(FigTree.DEFAULT_SETTINGS(),settings);
        this.drawn = false
        this._transitions=  {
            transitionDuration: 500,
                transitionEase: easeCubic
        };

        this[p.svg]=svg;
        this[p.tree] = tree;
        this[p.tree].subscribeCallback( () => {
                this.update();
            });
        this.setupSVG();
        this.nodeUpdator =()=>{};
        this.branchUpdator=()=>{};
        this.featuresUpdator = ()=>{};

        return this;
    }

    transitions(t=null){
        if(t){
            this._transitions={...this._transitions,...t};
        }else{
            return this._transitions;
        }
    }
    margins(m=null){
        if(m){
            this._margins = {...this._margins,...m}
            return this;
        }else{
            return this_margins
        }
    }
    /**
     * An instance method that makes place the svg object in the page. Without calling this method the figure will not be drawn
     * @return {FigTree}
     */
    setupSVG(){

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

        this.svgSelection.append("g").attr("class", "branches-layer");
        this.svgSelection.append("g").attr("class", "nodes-background-layer");
        this.svgSelection.append("g").attr("class", "nodes-layer");

    }

    /**
     * Updates the figure when the tree has changed
     */
    update() {
        const {vertices,edges} = this[p.layout](this[p.tree]);

        select(`#${this.svgId}`)
            .attr("transform",`translate(${this._margins.left},${this._margins.top})`);

        this.setUpScales(vertices,edges);

        this.updateNodePositions(vertices);
        this.updateBranchPositions(edges);
        for(const vertex of vertices){
            this.nodeUpdator(vertex);
        }
        for(const edge of edges){
            this.branchUpdator(edge);
        }
        this.featuresUpdator();
        return this;

    }

    updateNodePositions(vertices) {
        updateElementFactory.call(this, "node", this.svgSelection.select(".nodes-layer"))(vertices);
        updateElementFactory.call(this, "node-background", this.svgSelection.select(".nodes-background-layer"))(vertices);

    }

    updateBranchPositions(edges){
        updateElementFactory.call(this, "branch", this.svgSelection.select(".branches-layer"))(edges);
    }
    nodes(updater){
        this.nodeUpdator = compose(this.nodeUpdator,(v)=>{updater(v);return v});
        this.update();
        return this;
    }
    branches(updater){
        this.branchUpdator = compose(this.branchUpdator,(v)=>{updater(v);return v});
        this.update();
        return this;
    }


    setUpScales(vertices,edges){
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

    svg(svg=null){
        if(svg===null){
            return this[p.svg]
        }
        else {
            this[p.svg] = svg;
            return this;
        }
        }
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
    layout(layout=null){
        if(layout===null){
            return this[p.layout]
        }else{
            this[p.layout] = layout;
            this.update();
            return this;
        }
    }
    feature(feature){
        this.featuresUpdator = compose(this.featuresUpdator,feature);
        return this;
    }

}


function updateElementFactory(elementClass,svgLayer){
    const ouput = function(data) {

        // DATA JOIN
        // Join new data with old elements, if any.
        const self = this;
        svgLayer.selectAll(`.${elementClass}`)
            .data(data, (d) => `${elementClass}_${d.key}`)
            .join(
                enter => enter
                    .append("g")
                    .attr("id", (d) => d.key)
                    .attr("class", (d) => [`${elementClass}`, ...d.classes].join(" "))
                    .attr("transform", (d) => {
                        return `translate(${this.scales.x(d.x)}, ${this.scales.y(d.y)})`;
                    }),
                update => update
                    .call(update => update.transition()
                        .duration(this.transitions().transitionDuration)
                        .ease(this.transitions().transitionEase)
                        .attr("class", (d) => [`${elementClass}`, ...d.classes].join(" "))
                        .attr("transform", (d) => {
                            return `translate(${this.scales.x(d.x)}, ${this.scales.y(d.y)})`;
                        }))

            );
    }

    return ouput.bind(this);
}