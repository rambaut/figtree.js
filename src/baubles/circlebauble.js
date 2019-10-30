import {mergeDeep} from "../utilities";
import {Bauble} from "./bauble";
/** @module bauble */

/**
 * The CircleBauble class. Each vertex is assigned a circle in the svg.
 */
export class CircleBauble extends Bauble {


    static DEFAULT_SETTINGS() {
        return {
            radius: 6,
        };
    }

    /**
     * The constructor.
     * @param [settings.radius=6] - the radius of the circle
     */
    constructor(settings = {}) {
        super(mergeDeep(CircleBauble.DEFAULT_SETTINGS(), settings));
    }


    /**
     * A function that assigns cy,cx,and r attributes to a selection. (cx and cy are set to 0 each r is the settings radius
     * plus the border.
     * @param selection
     * @param {number} [border=0] - the amount to change the radius of the circle.
     */
    updateShapes(selection, border = 0) {
        return selection
            .selectAll("circle")
            .data(d => [d])
            .join(
                enter => enter
                    .append("circle")
                    .attr("class","node-shape")
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("r", this.settings.radius + border)
                    .attrs((vertex) => {
                        const attributes = this.settings.attrs;
                        return Object.keys(attributes).reduce((acc, curr) => {
                            // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                            return {...acc, [curr]: attributes[curr](vertex)}
                        }, {})
                    })
                    .styles((vertex) => {
                        const styles = this.settings.styles;
                        return Object.keys(styles).reduce((acc, curr) => {
                            // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                            return {...acc, [curr]: styles[curr](vertex)}
                        }, {})
                    }),
                update => update
                    .call(update => update.transition()
                        .attr("r", (v)=>this.settings.radius + border)
                        .attrs((vertex) => {
                            const attributes = this.settings.attrs;
                            return Object.keys(attributes).reduce((acc, curr) => {
                                // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                                return {...acc, [curr]: attributes[curr](vertex)}
                            }, {})
                        })
                        .styles((vertex) => {
                            const styles = this.settings.styles;
                            return Object.keys(styles).reduce((acc, curr) => {
                                // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                                return {...acc, [curr]: styles[curr](vertex)}
                            }, {})
                        })
                    )
    );
    };
}