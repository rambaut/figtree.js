import {curveStepBefore, line} from "d3-shape";
import {mergeDeep} from "../utilities";
import {Bauble} from "./bauble";

export class BranchBauble extends Bauble {
    static DEFAULT_SETTINGS() {
        return {
            curve: curveStepBefore,
            curveRadius: 0,
            attrs: {"fill": d => "none", "stroke-width": d => "2", "stroke": d => "black"},
            vertexFilter: null,
            edgeFilter: () => true
        }


    }

    constructor(settings) {
        super(mergeDeep(BranchBauble.DEFAULT_SETTINGS(), settings));
    }

    get edgeFilter() {
        return this.settings.edgeFilter
    }

    setup(scales = {}) {
        scales = mergeDeep({x: null, y: null, xOffset: 0, yOffset: 0}, scales);
        this.branchPath = branchPathGenerator({scales:scales,curve:this.settings.curve,curveRadius:this.settings.curveRadius})
    }

    updateShapes(selection) {

        return selection.selectAll("path")
            .data(d => [d])
            .join(
                enter => enter
                    .append("path")
                    .attr("d", (edge,i) => this.branchPath(edge,i))
                    .attr("class", "branch-path")
                    .attrs((edge) => {
                        const attributes = this.settings.attrs;
                        return Object.keys(attributes).reduce((acc, curr) => {
                            // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                            return {...acc, [curr]: attributes[curr](edge)}
                        }, {})
                    })
                    .styles((edge) => {
                        const styles = this.settings.styles;
                        return Object.keys(styles).reduce((acc, curr) => {
                            // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                            return {...acc, [curr]: styles[curr](edge)}
                        }, {})
                    }),
                update => update
                    .call(update => update.transition("pathUpdating")
                        .duration(this.settings.transition.transitionDuration)
                        .ease(this.settings.transition.transitionEase)
                        .attr("d", (edge,i) => this.branchPath(edge,i))
                        .attrs((edge) => {
                            const attributes = this.settings.attrs;
                            return Object.keys(attributes).reduce((acc, curr) => {
                                // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                                return {...acc, [curr]: attributes[curr](edge)}
                            }, {})
                        })
                        .styles((edge) => {
                            const styles = this.settings.styles;
                            return Object.keys(styles).reduce((acc, curr) => {
                                // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                                return {...acc, [curr]: styles[curr](edge)}
                            }, {})
                        }),
                    )
            )
    };
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