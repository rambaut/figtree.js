import {curveStepBefore, line} from "d3-shape";
import {mergeDeep} from "../utilities";
import {Bauble} from "./bauble";
/** @module bauble */

export class Branch extends Bauble {
    static DEFAULT_SETTINGS() {
        return {
            curve: curveStepBefore,
            curveRadius: 0,
            attrs: {"fill":"none","stroke":2},
        }


    }
    /**
     * The constructor takes a setting object. The keys of the setting object are determined by the type of bauble.
     *
     * @param {Object} settings
     * @param {function} [settings.curve=d3.curveStepBefore] - a d3 curve used to draw the edge
     * @param {number} [settings.curveRadius=0] - if the curve radius is >0 then two points will be placed this many pixels below and to the right of the step point. This can be used with difference curves to make smooth corners
     * @param {function} [settings.edgeFilter=()=>true] - a function that is passed each edge. If it returns true then bauble applies to that vertex.
     * @param {Object} [settings.attrs={"fill": d => "none", "stroke-width": d => "2", "stroke": d => "black"}] - styling attributes. The keys should be the attribute string (stroke,fill ect) and entries are function that are called on each vertex. These can be overwritten by css.
     *  @param {Object} [settings.styles={}] - styling attributes. The keys should be the attribute string (stroke,fill ect) and entries are function that are called on each vertex. These overwrite css.
     */
    constructor(settings) {
        const options = mergeDeep(Branch.DEFAULT_SETTINGS(), settings)
        super(settings);
        this.curve=options.curve;
        this.curveRadius = options.curveRadius;
    }


    setup(scales = {}) {
        scales = mergeDeep({x: null, y: null, xOffset: 0, yOffset: 0}, scales);
        this.branchPath = this.branchPathGenerator({scales:scales,curve:this.curve,curveRadius:this.curveRadius})
    }

    update(selection) {
        if(selection==null&&!this.selection){
            return
        }
        if(selection){
            this.selection=selection;
        }
        return selection.selectAll("path")
            .data(d => [d])
            .join(
                enter => enter
                    .append("path")
                    .attr("d", (edge,i) => this.branchPath(edge,i))
                    .attr("class", "branch-path")
                    .attrs(this.attrs)
                    .each((d,i,n)=>{
                        const element = select(n[i]);
                        for( const [key,func] of Object.entries(this.interactions)){
                            element.on(key,(d,i,n)=>func(d,i,n))
                        }
                    }),
                update => update
                    .call(update => update.transition("pathUpdating")
                        .duration(this.settings.transition.transitionDuration)
                        .ease(this.settings.transition.transitionEase)
                        .attr("d", (edge,i) => this.branchPath(edge,i))
                        .attr("d", (edge,i) => this.branchPath(edge,i))
                        .attr("class", "branch-path")
                        .attrs(this.attrs)
                    )
            )
    };

    branchPathGenerator({scales}) {
        const branchPath = (e, i) => {
            const branchLine = line()
                .x((v) => v.x)
                .y((v) => v.y)
                .curve(this.curve);
            const factor = e.v0.y - e.v1.y > 0 ? 1 : -1;
            const dontNeedCurve = e.v0.y - e.v1.y === 0 ? 0 : 1;
            const output = this.curveRadius > 0 ?
                branchLine(
                    [{x: 0, y: scales.y(e.v0.y) - scales.y(e.v1.y)},
                        {x: 0, y: dontNeedCurve * factor * this.curveRadius},
                        {x: 0 + dontNeedCurve * this.curveRadius, y: 0},
                        {x: scales.x(e.v1.x) - scales.x(e.v0.x), y: 0}
                    ]) :
                branchLine(
                    [{x: 0, y: scales.y(e.v0.y) - scales.y(e.v1.y)},
                        {x: scales.x(e.v1.x ) - scales.x(e.v0.x), y: 0}
                    ]);
            return (output)

        };
        return branchPath;
    }

    curve(curve=null){
        if(curve){
            this.curve = curve;
            return this;
        }else{
            return this.curve;
        }
    }
    curveRadius(curveRadius=null){
        if(curveRadius){
            this.curveRadius = curveRadius;
            return this;
        }else{
            return this.curveRadius;
        }
    }

};

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

export function branchPathGenerator({scales,curveRadius,curve}) {
    const branchPath = (e, i) => {
        const branchLine = line()
            .x((v) => v.x)
            .y((v) => v.y)
            .curve(curve);
        const factor = e.v0.y - e.v1.y > 0 ? 1 : -1;
        const dontNeedCurve = e.v0.y - e.v1.y === 0 ? 0 : 1;
        const output = curveRadius > 0 ?
            branchLine(
                [{x: 0, y: scales.y(e.v0.y) - scales.y(e.v1.y)},
                    {x: 0, y: dontNeedCurve * factor * curveRadius},
                    {x: 0 + dontNeedCurve * curveRadius, y: 0},
                    {x: scales.x(e.v1.x + scales.xOffset) - scales.x(e.v0.x + scales.xOffset), y: 0}
                ]) :
            branchLine(
                [{x: 0, y: scales.y(e.v0.y) - scales.y(e.v1.y)},
                    {x: scales.x(e.v1.x + scales.xOffset) - scales.x(e.v0.x + scales.xOffset), y: 0}
                ]);
        return (output)

    };
    return branchPath;
}