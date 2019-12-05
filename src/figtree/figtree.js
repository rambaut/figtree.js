"use strict";
import {select,easeCubic,scaleLinear,mouse,event,line} from "d3";
import uuid from "uuid";
import {mergeDeep} from "../utilities";
import 'd3-selection-multi';
import {CircleBauble} from "../baubles/circlebauble";
import {Branch} from "../baubles/branch";
import {CartoonBauble} from "../baubles/cartoonbauble";
import {GeoLayout} from "../layout/geoLayout";
import {rectangularLayout} from "../layout/rectangularLayout.f";
import ElementFactory from "../dataWrappers/elementFactory"
import EdgeFactory from "../dataWrappers/edgeFactory";
import {min,max} from "d3-array";
import p from "../privateConstants.js"
import nodeFactory from "../dataWrappers/nodeFactory";

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
        this.margins = margins;

        this.settings = mergeDeep(FigTree.DEFAULT_SETTINGS(),settings);
        this.callbacks= {nodes:[],branches:[],cartoons:[]};
        this._annotations =[];

        this.drawn = false
        this._transitions=this.settings.transition;

        this[p.svg]=svg;
        this[p.tree] = tree;
        this[p.tree].subscribeCallback( () => {
                this.update();
            });
        this.setupSVG();
        this.setupUpdaters();
        return this;
    }

    transitions(t=null){
        if(t){
            this._transitions=t;
        }else{
            return this._transitions;
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
            .attr("transform",`translate(${this.margins.left},${this.margins.top})`);

        //to selecting every time
        this.svgSelection = select(this[p.svg]).select(`#${this.svgId}`);
        this.svgSelection.append("g").attr("class","annotation-layer");
        this.svgSelection.append("g").attr("class", "axes-layer");
        this.svgSelection.append("g").attr("class", "cartoon-layer");

        this.svgSelection.append("g").attr("class", "branches-layer");
        if (this.settings.vertices.backgroundBorder !==null) {
            this.svgSelection.append("g").attr("class", "nodes-background-layer");
        }
        this.svgSelection.append("g").attr("class", "nodes-layer");

    }
    setupUpdaters(){
        this[p.vertexFactory]=new nodeFactory(this);
        this[p.edgeFactory] = new EdgeFactory(this);

        this[p.updateNodes]= this.updateElementFactory( this[p.vertexFactory],"node",this.svgSelection.select(".nodes-layer"));
        this[p.updateBranches]= this.updateElementFactory( this[p.edgeFactory],"branch",this.svgSelection.select(".branches-layer"));

    }



    /**
     * Updates the figure when the tree has changed
     */
    update() {
        const {vertices,edges} = this[p.layout](this[p.tree]);

        select(`#${this.svgId}`)
            .attr("transform",`translate(${this.margins.left},${this.margins.top})`);

        this[p.setUpScales](vertices);
        this[p.updateNodes](vertices);
        this[p.updateBranches](edges);

        return this;

    }
    draw(){
        this.update();
        this.drawn = true;

    }


    /**
     * Registers action function to be called when an edge is clicked on. The function is passed
     * edge object that was clicked on and the position of the click as a proportion of the edge length.
     *
     * Optionally a selection string can be provided - i.e., to select a particular branch by its id.
     *
     * @param {Object} action
     * @param selection
     */
    onClickBranch({action, selection,update,proportionMethod}) {
        selection = selection ? selection : ".branch";
        update = update?update:false;
        proportionMethod = proportionMethod? proportionMethod: "manhattan";
        this.callbacks.branches.push(()=>{
            // We need to use the "function" keyword here (rather than an arrow) so that "this"
            // points to the actual SVG element (so we can use d3.mouse(this)). We therefore need
            // to store a reference to the object in "self".
            const self = this;
            const selected = this.svgSelection.selectAll(`${selection}`);
            selected.on("click", function (edge) {
                let proportion;

                const x1 = self.scales.x(edge.v1.x+self.settings.xScale.revisions.offset);
                const x2 = self.scales.x(edge.v0.x+self.settings.xScale.revisions.offset);
                const mx = mouse(document.getElementById(self.svgId))[0];
                if(proportionMethod.toLowerCase()==="manhattan"){
                    proportion = Math.abs( (mx - x2) / (x1 - x2));
                }else if(proportionMethod.toLocaleString()==="euclidean"){
                    const y1 = self.scales.y(edge.v1.y+self.settings.yScale.revisions.offset);
                    const y2 = self.scales.y(edge.v0.y+self.settings.yScale.revisions.offset);
                    const my =  mouse(document.getElementById(self.svgId))[1];
                    proportion=  Math.sqrt(Math.pow((my-y2),2)+Math.pow((mx - x2),2)) / Math.sqrt(Math.pow((y1-y2),2)+Math.pow((x1 - x2),2))

                } else{
                    throw new Error(`proportion method ${proportionMethod} unknown.`)
                }
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


    [p.setUpScales](vertices){
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
                xScale = this.settings.xScale.scale()
                    .domain([max(vertices,d=>d.x),min(vertices,d=>d.x)])
                    .range([0, width - this.margins.right-this.margins.left]);

                yScale = this.settings.yScale.scale()
                    .domain([min(vertices,d=>d.y),max(vertices,d=>d.y)])
                    .range([0, height -this.margins.bottom-this.margins.top]);
            }
            this.scales = {x:xScale, y:yScale, width, height, projection};
    }

    updateElementFactory(elementFactory,elementClass,svgLayer){
        return function(data) {

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
                        })
                        .each(function (d) {
                            const bauble = elementFactory.getElement(d,self.scales);
                            if (bauble) {
                                bauble.update(select(this))
                            }
                        })
                        .append("text")
                        .attr("class", `${elementClass}-label`)
                        .attr("text-anchor", d => d.textLabel.textAnchor)
                        .attr("alignment-baseline", d => d.textLabel.alignmentBaseline)
                        .attr("dx", d => {
                            if (elementClass === "branch") {
                                return ((this.scales.x(d.textLabel.dx[0]) - this.scales.x(d.textLabel.dx[1])) / 2)
                            } else {
                                return d.textLabel.dx
                            }
                        })
                        .attr("dy", d => d.textLabel.dy)
                        .text((d) => elementFactory.getLabel(d)),
                    update => update
                        .call(update => update.transition()
                            .duration(this.settings.transition.transitionDuration)
                            .ease(this.settings.transition.transitionEase)
                            .attr("class", (d) => [`${elementClass}`, ...d.classes].join(" "))
                            .attr("transform", (d) => {
                                return `translate(${this.scales.x(d.x)}, ${this.scales.y(d.y)})`;
                            })
                            .each(function (d) {
                                const bauble = elementFactory.getElement(d,self.scales);
                                if (bauble) {
                                    bauble.update(select(this))
                                }
                            })

                            .select(`.${elementClass}-label`)
                            .transition()
                            .duration(this.settings.transition.transitionDuration)
                            .ease(this.settings.transition.transitionEase)
                            .attr("text-anchor", d => d.textLabel.textAnchor)
                            .attr("alignment-baseline", d => d.textLabel.alignmentBaseline)
                            .attr("dx", d => {
                                if (elementClass === "branch") {
                                    return ((this.scales.x(d.textLabel.dx[0]) - this.scales.x(d.textLabel.dx[1])) / 2)
                                } else {
                                    return d.textLabel.dx
                                }
                            })
                            .attr("dy", d => d.textLabel.dy)
                            .text((d) => elementFactory.getLabel(d)),
                        )
                );
        }
    }

    [p.updateCartoons](){
        const cartoonLayer = this.svgSelection.select(".cartoon-layer");
        const self = this;
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
                                if (bauble.cartoonFilter(c)) {
                                    bauble
                                        .update(select(this))
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
                            if (bauble.cartoonFilter(c)) {
                                bauble
                                    .update(select(this))
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
            [this.xScaleOrigin+xRevisions.hedge+reverse*xRevisions.branchScale*(Math.abs(this.scales.x.domain()[0]-this.scales.x.domain()[1])),this.xScaleOrigin]:
            this.scales.x.domain();
        const axisScale =  this.settings.xScale.scale().domain(domain).range(this.scales.x.range());

        const xAxisWidth = this.scales.width - this.margins.left - this.margins.right;
        const axesLayer = this.svgSelection.select(".axes-layer");

        this.settings.xScale.axes.forEach(axis=>{
            if(this.layout instanceof GeoLayout){
                throw new Error("Can not add axis to geolayout")
            }
            axis.createAxis({selection:axesLayer,
                x:0,
                y:this.scales.height - this.margins.bottom-this.margins.top +this.settings.xScale.gap,
                length:xAxisWidth,
                scale:axisScale})
        });
    }
 
    [p.addYAxis]() {
        const yRevisions = this.settings.yScale.revisions;
        const reverse = yRevisions.reverseAxis? -1:1;
        const domain = yRevisions.origin!==null?
            [this.yScaleOrigin+reverse*yRevisions.branchScale*(Math.abs(this.scales.y.domain()[0]-this.scales.y.domain()[1])),this.yScaleOrigin]:
            this.scales.y.domain();
        const axisScale =  this.settings.yScale.scale().domain(domain).range(this.scales.y.range());
        const yAxisHeight = this.scales.height - this.margins.top - this.margins.bottom;
        const axesLayer = this.svgSelection.select(".axes-layer");

        this.settings.yScale.axes.forEach(axis=>{
            if(this.layout instanceof GeoLayout){
                throw new Error("Can not add axis to geolayout")
            }
            axis.createAxis({selection:axesLayer,
                x:0-this.settings.yScale.gap,
                y:0,
                length:yAxisHeight,
                scale:axisScale})
        });
    }

    [p.updateXAxis](){
        const xRevisions = this.settings.xScale.revisions;
        const reverse = xRevisions.reverseAxis? -1:1;
        const domain = xRevisions.origin!==null?
            [this.xScaleOrigin+xRevisions.hedge+reverse*xRevisions.branchScale*(Math.abs(this.scales.x.domain()[0]-this.scales.x.domain()[1])),this.xScaleOrigin]:
            this.scales.x.domain();
        const axisScale =  this.settings.xScale.scale().domain(domain).range(this.scales.x.range());

        const xAxisWidth = this.scales.width - this.margins.left - this.margins.right;
        const axesLayer = this.svgSelection.select(".axes-layer");

        this.settings.xScale.axes.forEach(axis=>{
            axis.updateAxis({selection:axesLayer,
                x:0,
                y:this.scales.height - this.margins.bottom-this.margins.top +this.settings.xScale.gap,
                length:xAxisWidth,
                scale:axisScale})
        });
    }
    [p.updateYAxis](){
        const yRevisions = this.settings.yScale.revisions;
        const reverse = yRevisions.reverseAxis? -1:1;
        const domain = yRevisions.origin!==null?
            [this.yScaleOrigin+reverse*yRevisions.branchScale*(Math.abs(this.scales.y.domain()[0]-this.scales.y.domain()[1])),this.yScaleOrigin]:
            this.scales.y.domain();
        const axisScale =  this.settings.yScale.scale().domain(domain).range(this.scales.y.range());
        const yAxisHeight = this.scales.height - this.margins.top - this.margins.bottom;
        const axesLayer = this.svgSelection.select(".axes-layer");

        this.settings.yScale.axes.forEach(axis=>{
            axis.updateAxis({selection:axesLayer,
                x:0-this.settings.yScale.gap,
                y:0,
                length:yAxisHeight,
                scale:axisScale})
        });
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
// setters and getters

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
            return this;
        }
    }
    layout(layout=null){
        if(layout===null){
            return this[p.layout]
        }else{
            this[p.layout] = layout;
            return this;
        }
    }

    nodes(b=null){
        if(b){
            this[p.vertexFactory].elements(b)
        }
        return this[p.vertexFactory]
    }
    branches(b=null){

        if(b){
            this[p.edgeFactory].elements(b)
        }
        return this[p.edgeFactory]
    }

    get xAxis(){

    }
    get yAxis(){

    }

}


