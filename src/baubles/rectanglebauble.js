import {mergeDeep} from "../utilities";
import {Bauble} from "./bauble";
/** @module bauble */

export class RectangularBauble extends Bauble {


    static DEFAULT_SETTINGS() {
        return {
            height: 16,
            width: 6,
            radius: 2,
        };
    }

    /**
     * The constructor.
     * @param [settings.height=16] - the height of the rectangle in pixels
     * @param [settings.width=6] - the width of the rectangle in pixels
     * @param [settings.radius=2] - the rx and ry of the rectangle. This rounds the corners

     */
    constructor(settings = {}) {
        super(mergeDeep(RectangularBauble.DEFAULT_SETTINGS(), settings));
    }

    /**
     * A function that assigns width,height,x,y,rx, and ry attributes to a rect selection.
     * @param selection
     * @param border
     * @return {*|null|undefined}
     */
    update(selection, border = 0) {
        const w = this.settings.width + border;
        const h = this.settings.height + border;
        return selection
            .selectAll("rect")
            .data(d => [d])
            .join(
                enter => enter
                    .append("rect")
                    .attr("x", -w / 2)
                    .attr("width", w)
                    .attr("y", -h / 2)
                    .attr("height", h)
                    .attr("rx", this.settings.radius)
                    .attr("ry", this.settings.radius)
                    .attr("class","node-shape")
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
                        .attr("x", -w / 2)
                        .attr("width", w)
                        .attr("y", -h / 2)
                        .attr("height", h)
                        .attr("rx", this.settings.radius)
                        .attr("ry", this.settings.radius)
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
            )

    };
}