import {curveBasisClosed, line} from "d3-shape";
import {mergeDeep} from "../utilities";
import {Bauble} from "./bauble";

export class CartoonBauble extends Bauble {
    static DEFAULT_SETTINGS() {
        return {
            curve: curveBasisClosed,
            attrs: {"fill": d => "none", "stroke-width": d => "2", "stroke": d => "black"},
            vertexFilter:null,
            cartoonFilter:()=>true
        }
    }

    constructor(settings) {
        super(mergeDeep(CartoonBauble.DEFAULT_SETTINGS(), settings));
    }

    setup(scales = {}) {
        scales = mergeDeep({x: null, y: null, xOffset: 0, yOffset: 0}, scales);
        this.pathGenerator = pointToPointGen({scales:scales});
    }
    get cartoonFilter(){
        return this.settings.cartoonFilter;
    }
    updateShapes(selection) {

        return selection.selectAll("path")
            .data(d => [d])
            .join(
                enter => enter
                    .append("path")
                    .attr("d", c => this.pathGenerator(c.points))
                    .attr("class", "cartoon-path")
                    .attrs((c) => {
                        const attributes = this.settings.attrs;
                        return Object.keys(attributes).reduce((acc, curr) => {
                            // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                            return {...acc, [curr]: attributes[curr](c)}
                        }, {})
                    })
                    .styles((c) => {
                        const styles = this.settings.styles;
                        return Object.keys(styles).reduce((acc, curr) => {
                            // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                            return {...acc, [curr]: styles[curr](c)}
                        }, {})
                    }),
                update => update
                    .call(update => update.transition()
                        .attr("d", this.pathGenerator(c.points))
                        .attrs((c) => {
                            const attributes = this.settings.attrs;
                            return Object.keys(attributes).reduce((acc, curr) => {
                                // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                                return {...acc, [curr]: attributes[curr](c)}
                            }, {})
                        })
                        .styles((c) => {
                            const styles = this.settings.styles;
                            return Object.keys(styles).reduce((acc, curr) => {
                                // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                                return {...acc, [curr]: styles[curr](c)}
                            }, {})
                        }),
                    )
            )
    };
}

 export function pointToPointGen({scales}) {
     const pointToPoint = (points) => {
         let path = [];
         const origin = points[0];
         const pathPoints = points.reverse();
         let currentPoint = origin;
         for (const point of pathPoints) {
             const xdiff = scales.x(point.x + scales.xOffset) - scales.x(currentPoint.x + scales.xOffset);
             const ydiff = scales.y(point.y) - scales.y(currentPoint.y);
             path.push(`${xdiff} ${ydiff}`);
             currentPoint = point;
         }
         return `M 0 0 l ${path.join(" l ")} z`;
     }
     return pointToPoint;
 }