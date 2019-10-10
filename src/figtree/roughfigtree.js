import {CircleBauble, RoughCircleBauble} from "./bauble";
import {mergeDeep} from "../utilities";
import {p,FigTree} from "./figtree";
import rough from 'roughjs/dist/rough.umd';


const roughFactory = rough.svg(document.createElement("svg"));
export class RoughFigTree extends FigTree{
    static DEFAULT_SETTINGS() {
        return {
            vertices:{baubles: [new RoughCircleBauble()],
                backgroundBorder:-5},
            edges: {
                roughOptions:{roughness:10}
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
        const nodes = nodesBackgroundLayer.selectAll(".node-background")
            .data(this.layout.vertices, (v) => `nb_${v.key}`);

        // ENTER
        // Create new elements as needed.
        const newNodes = nodes.enter();

        // add the specific node shapes or 'baubles'
        this.settings.vertices.baubles.forEach((bauble) => {
            let backBauble= bauble;
            if(bauble instanceof RoughCircleBauble){
                backBauble= new CircleBauble(bauble.settings)
            }
            const d = backBauble.createShapes(newNodes.filter(backBauble.vertexFilter))
                .attr("class", "node-background")
                .attr("transform", (v) => {
                    return `translate(${this.scales.x(v.x+this.settings.xScale.offset)}, ${this.scales.y(v.y)})`;
                });

            backBauble.updateShapes(d, this.settings.vertices.backgroundBorder);
        });

        // update all the existing elements
        this.settings.vertices.baubles.forEach((bauble) => {
            const d = nodes
                .filter(bauble.vertexFilter)
                .transition()
                .duration(this.settings.transition.transitionDuration)
                .ease(this.settings.transition.transitionEase)
                .attr("transform", (v) => {
                    return `translate(${this.scales.x(v.x+this.settings.xScale.offset)}, ${this.scales.y(v.y)})`;
                });
            bauble.updateShapes(d, this.settings.backgroundBorder)
        });

        // EXIT
        // Remove old elements as needed.
        nodes.exit().remove();

        this[p.updateNodeBackgroundStyles]();

    }

    [p.updateBranches]() {

        const branchesLayer = this.svgSelection.select(".branches-layer");

        // a function to create a line path

        const branchPath = this[p.branchPathGenerator]();
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
                return `translate(${this.scales.x(e.v0.x+this.settings.xScale.offset)}, ${this.scales.y(e.v1.y)})`;
            });

        // Make branches a thing like bauble
        newBranches.append("g")
            .attr("class","branch-path")
            .append((e,i)=>roughFactory.path(`${branchPath(e,i)}`,this.settings.edges.roughOptions));


        newBranches.append("text")
            .attr("class", "branch-label length")
            .attr("dx", (e) => ((this.scales.x(e.v1.x+this.settings.xScale.offset) - this.scales.x(e.v0.x+this.settings.xScale.offset)) / 2))
            .attr("dy", (e) => (e.labelBelow ? +6 : -6))
            .attr("alignment-baseline", (e) => (e.labelBelow ? "hanging" : "bottom"))
            .attr("text-anchor", "middle")
            .text((e) => e.label);

        // update the existing elements
        branches
            .transition()
            .duration(this.settings.transition.transitionDuration)
            .ease(this.settings.transition.transitionEase)
            .attr("class", (e) => ["branch", ...e.classes].join(" "))
            .attr("transform", (e) => {
                return `translate(${this.scales.x(e.v0.x+this.settings.xScale.offset)}, ${this.scales.y(e.v1.y)})`;
            })
            .select("path")
            .attr("d", (e,i) => branchPath(e,i))

            .select("text .branch-label .length")
            .attr("class", "branch-label length")
            .attr("dx", (e) => ((this.scales.x(e.v1.x+this.settings.xScale.offset) - this.scales.x(e.v0.x+this.settings.xScale.offset)) / 2))
            .attr("dy", (e) => (e.labelBelow ? +6 : -6))
            .attr("alignment-baseline", (e) => (e.labelBelow ? "hanging" : "bottom"))
            .attr("text-anchor", "middle")
            .text((e) => e.label);

        // EXIT
        // Remove old elements as needed.
        branches
            .exit().remove();
        this[p.updateBranchStyles]();

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