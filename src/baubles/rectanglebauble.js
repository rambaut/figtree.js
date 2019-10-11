import {mergeDeep} from "../utilities";
import {Bauble} from "./bauble";

export class RectangularBauble extends Bauble {

    /**
     * The default settings for the rectangular bauble.
     * @return {{width: number, radius: number, height: number}}
     * @constructor
     */
    static DEFAULT_SETTINGS() {
        return {
            height: 16,
            width: 6,
            radius: 2,
        };
    }

    /**
     * The constructor.
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
    updateShapes(selection, border = 0) {
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