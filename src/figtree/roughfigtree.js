import {mergeDeep} from "../utilities";
import {p,FigTree} from "./figtree";
import rough from 'roughjs/dist/rough.umd';
import {select} from "d3"
import {CircleBauble} from "../baubles/circlebauble";
import {BranchBauble} from "../baubles/branchbauble";
import {RoughCircleBauble} from "../baubles/roughcirclebauble";

const roughFactory = rough.svg(document.createElement("svg"));
export class RoughFigTree extends FigTree{
    static DEFAULT_SETTINGS() {
        return {
            vertices: {
                baubles: [new RoughCircleBauble()],
                backgroundBaubles:[new CircleBauble({styles:{fill:()=>"white"},vertexFilter:v=>v.degree===1})],
            },
            edges: {
                roughOptions:{roughness:10},
                baubles:[new BranchBauble()]
            },
            cartoons:{
                roughOptions: {roughness:10}
            }

        }
    }
    constructor(svg, layout, margins, settings = {}){
        settings = mergeDeep(RoughFigTree.DEFAULT_SETTINGS(),settings);
        super(svg, layout, margins, settings);
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
                        return `translate(${this.scales.x(v.x+this.settings.xScale.offset)}, ${this.scales.y(v.y)})`;
                    })
                    .each(function(v) {
                        for(const bauble of  self.settings.vertices.backgroundBaubles){
                            if (bauble.vertexFilter(v)) {
                                bauble
                                    .updateShapes(select(this))
                            }
                        }
                    }),
                update=>update
                    .transition()
                    .duration(this.settings.transition.transitionDuration)
                    .ease(this.settings.transition.transitionEase)
                    .attr("class", (v) => ["node-background", ...v.classes].join(" "))
                    .attr("transform", (v) => {
                        return `translate(${this.scales.x(v.x+this.settings.xScale.offset)}, ${this.scales.y(v.y)})`;
                    })
                    .each(function(v) {
                        for(const bauble of  self.settings.vertices.backgroundBaubles){
                            if (bauble.vertexFilter(v)) {
                                bauble
                                    .updateShapes(select(this))
                            }
                        }
                    })
            );
    }


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
                            return `translate(${this.scales.x(v.x+this.settings.xScale.offset)}, ${this.scales.y(v.y)})`;
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
                update=>update
                    .transition()
                    .duration(this.settings.transition.transitionDuration)
                    .ease(this.settings.transition.transitionEase)
                    .attr("class", (v) => ["node", ...v.classes].join(" "))
                    .attr("transform", (v) => {
                        return `translate(${this.scales.x(v.x+this.settings.xScale.offset)}, ${this.scales.y(v.y)})`;
                    })
                    .each(function(v) {
                        for(const bauble of  self.settings.vertices.baubles){
                            if (bauble.vertexFilter(v)) {
                                bauble
                                    .updateShapes(select(this))
                            }
                        }
                    })
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

    );
        // add callbacks
        for(const callback of this.callbacks.nodes){
            callback();
        }
    }

    [p.updateBranches]() {

        const branchesLayer = this.svgSelection.select(".branches-layer");
        //set up scales for branches

        this.settings.edges.baubles.forEach(b=>b.setup({x:this.scales.x,y:this.scales.y,
            xOffset:this.settings.xScale.offset,yOffset:this.settings.yScale.offset}));
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
                        return `translate(${this.scales.x(e.v0.x+this.settings.xScale.offset)}, ${this.scales.y(e.v1.y)})`;
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
                        .attr("dx", (e) => ((this.scales.x(e.v1.x+this.settings.xScale.offset) - this.scales.x(e.v0.x+this.settings.xScale.offset)) / 2))
                        .attr("dy", (e) => (e.labelBelow ? +6 : -6))
                        .attr("alignment-baseline", (e) => (e.labelBelow ? "hanging" : "bottom"))
                        .attr("text-anchor", "middle")
                        .text((e) => e.label),
                update=>update
                    .transition()
                    .duration(this.settings.transition.transitionDuration)
                    .ease(this.settings.transition.transitionEase)
                    .attr("class", (e) => ["branch", ...e.classes].join(" "))
                    .attr("transform", (e) => {
                        return `translate(${this.scales.x(e.v0.x+this.settings.xScale.offset)}, ${this.scales.y(e.v1.y)})`;
                    })
                    .each(function(e) {
                        for(const bauble of  self.settings.edges.baubles){
                            if (bauble.edgeFilter(e)) {
                                bauble
                                    .updateShapes(select(this))
                            }
                        }
                    })
                    .select("text .branch-label .length")
                        .attr("class", "branch-label length")
                        .attr("dx", (e) => ((this.scales.x(e.v1.x+this.settings.xScale.offset) - this.scales.x(e.v0.x+this.settings.xScale.offset)) / 2))
                        .attr("dy", (e) => (e.labelBelow ? +6 : -6))
                        .attr("alignment-baseline", (e) => (e.labelBelow ? "hanging" : "bottom"))
                        .attr("text-anchor", "middle")
                        .text((e) => e.label)
            );

        // add callbacks
        for(const callback of this.callbacks.branches){
            callback();
        }
    }

    [p.updateCartoons](){
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
                return `translate(${this.scales.x(c.vertices[0].x+this.settings.xScale.offset)}, ${this.scales.y(c.vertices[0].y+this.settings.xScale.offset)})`;
            })


        newCartoons
            .append("g")
            .attr("class", "cartoon-path")
            .append((e,i)=>roughFactory.path(`${this[p.pointToPoint](e.vertices)}`,this.settings.cartoon.roughOptions));

        // update the existing elements
        cartoons
            .transition()
            .duration(this.settings.transition.transitionDuration)
            .ease(this.settings.transition.transitionEase)
            .attr("class", (c) => ["cartoon", ...c.classes].join(" "))
            .attr("transform", (c) => {
                return `translate(${this.scales.x(c.vertices[0].x+this.settings.xScale.offset)}, ${this.scales.y(c.vertices[0].y)})`
            })
            .select("path")
            // .attr("d", (c) => this[p.pointToPoint](c.vertices));


        // EXIT
        // Remove old elements as needed.
        cartoons.exit().remove();

        this[p.updateCartoonStyles]();

        // add callbacks
        for(const callback of this.callbacks.cartoons){
            callback();
        }
    }



}