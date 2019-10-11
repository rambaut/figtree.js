import rough from 'roughjs/dist/rough.umd';
import {mergeDeep} from "../utilities";
import {Bauble} from "./bauble";

/**
 * The CircleBauble class. Each vertex is assigned a circle in the svg.
 */
export class RoughCircleBauble extends Bauble {

    /**
     * The default settings for the circleBauble
     * The default is 6;
     * @return {{radius: number}}
     * @constructor
     */
    static DEFAULT_SETTINGS() {
        return {
            radius: 6,
            fill: "black",
            attrs: {
                roughFill: {stroke: () => "red", fill: () => "none"},
                roughStroke: {"stroke-width": () => 0.5, stroke: () => "black", fill: () => "none"}
            },
            styles: {roughFill: {}, roughStroke: {}}
        };
    }

    /**
     * The constructor.
     */
    constructor(settings = {}) {
        super(mergeDeep(RoughCircleBauble.DEFAULT_SETTINGS(), settings));
    }

    /**
     * A function to append the circles to the svg.
     * @param selection
     * @return {Bundle|MagicString|*|void}
     */
    updateShapes(selection, border = 0) {


        const newPaths = [...roughFactory.circle(0, 0, this.settings.radius + border, this.settings).childNodes].map(d => d.getAttribute("d"));
        const pathNames = newPaths.length === 2 ? ["roughFill", "roughStroke"] : ["roughStroke"];
        return selection.selectAll("path")
            .data(pathNames, d => d)
            .join(
                enter => enter
                    .append("path")
                    .attr("d", (d, i) => newPaths[i])
                    .attr("class", d => `${d} node-shape rough`)
                    .attrs((d, i, n) => {
                        const attributes = this.settings.attrs[d];
                        return Object.keys(attributes).reduce((acc, curr) => {
                            const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                            return {...acc, [curr]: attributes[curr](vertex)}
                        }, {})
                    })
                    .styles((d, i, n) => {
                        const styles = this.settings.styles[d];
                        return Object.keys(styles).reduce((acc, curr) => {
                            const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                            return {...acc, [curr]: styles[curr](vertex)}
                        }, {})
                    }),
                update => update
                    .call(update => update.transition()
                        .attr("d", (d, i) => newPaths[i])
                        .attrs((d, i, n) => {
                            const attributes = this.settings.attrs[d];
                            return Object.keys(attributes).reduce((acc, curr) => {
                                const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                                return {...acc, [curr]: attributes[curr](vertex)}
                            }, {})
                        })
                        .styles((d, i, n) => {
                            const styles = this.settings.styles[d];
                            return Object.keys(styles).reduce((acc, curr) => {
                                const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                                return {...acc, [curr]: styles[curr](vertex)}
                            }, {})
                        }),
                    )
            )
    };
}

export const roughFactory = rough.svg(document.createElement("svg"));