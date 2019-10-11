"use strict";

/** @module bauble */
import rough from 'roughjs/dist/rough.umd';
import {mergeDeep} from "../utilities";

/**
 * The Bauble class
 *
 * This is a shape or decoration at the node of a tree or graph
 */
export class Bauble {
    /**
     * The default settings for the Bauable class. The default is ()=>true. All vertexs are assigned a bauble
     * @return {{vertexFilter: (function(): boolean)}}
     * @constructor
     */
    static DEFAULT_SETTINGS() {
        return {
            vertexFilter: () => true,
        };
    }

    /**
     * The constructor takes a setting object. The keys of the setting object are determined by the type of bauble.
     *
     * @param settings
     */
    constructor(settings = {}) {
        this.settings = mergeDeep(Bauble.DEFAULT_SETTINGS(),settings);
    }

    /**
     * A getter for the vertexFilter
     * @return {*|vertexFilter|(function(): boolean)}
     */

    get vertexFilter() {
        return this.settings.vertexFilter;
    }

    /**
     * A function that appends a svg object  to the selection and returns the modified selection. This adds the bauble to
     * the svg.
     * @param selection
     */
    createShapes(selection) {
        throw new Error("don't call the base class methods")
    }

    /**
     * A function that assigns the attributes to the svg objects appended by createShapes.
     * @param selection
     * @param border
     */
    updateShapes(selection, border = 0) {
        throw new Error("don't call the base class methods")
    }

}

/**
 * The CircleBauble class. Each vertex is assigned a circle in the svg.
 */
export class CircleBauble extends Bauble {

    /**
     * The default settings for the circleBauble
     * The default is 6;
     * @return {{radius: number}}
     * @constructor
     */
    static DEFAULT_SETTINGS() {
        return {
            radius: 6,
        };
    }

    /**
     * The constructor.
     */
    constructor(settings = {}) {
        super(mergeDeep(CircleBauble.DEFAULT_SETTINGS(),settings));
    }

    /**
     * A function to append the circles to the svg.
     * @param selection
     * @return {Bundle|MagicString|*|void}
     */
    createShapes(selection) {
        return selection
            .append("circle");
    };

    /**
     * A function that assigns cy,cx,and r attributes to a selection. (cx and cy are set to 0 each r is the settings radius
     * plus the border.
     * @param selection
     * @param border
     * @return {*|null|undefined}
     */
    updateShapes(selection, border = 0) {
        return selection
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", this.settings.radius + border);
    };
}

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
        super(mergeDeep(RectangularBauble.DEFAULT_SETTINGS(),settings));
    }

    /**
     * A function that adds a rect to a selection
     * @param selection
     * @return {Bundle|MagicString|*|void}
     */
    createShapes(selection) {
        return selection
            .append("rect");
    };

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
            .attr("x", - w / 2)
                .attr("width", w)
                .attr("y", - h / 2)
                .attr("height", h)
                .attr("rx", this.settings.radius)
                .attr("ry", this.settings.radius);
    };
}


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
            fill:"black",
            cssStyles:{roughFill:{stroke:()=>"red",fill:()=>"none"},
                roughStroke:{"stroke-width":()=>0.5,stroke:()=>"black",fill:()=>"none"}}

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
        const pathNames = newPaths.length===2?["roughFill", "roughStroke"]:["roughStroke"];
        return selection.selectAll("path")
            .data(pathNames, d => d)
            .join(
                enter => enter
                    .append("path")
                    .attr("d", (d, i) =>  newPaths[i])
                    .attr("class", d => d)
                    .attrs((d,i,n)=> {
                        const attributes = this.settings.cssStyles[d];
                        const newStyles= Object.keys(attributes).reduce((acc,curr)=>{
                            const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                            return {...acc,[curr]:attributes[curr](vertex)}
                        },{});
                        return newStyles
                    }),
                update => update
                    .call(update => update.transition()
                        .attr("d", (d, i) => newPaths[i])
                        .attrs((d,i,n)=> {
                            const attributes = this.settings.cssStyles[d];
                            const newStyles= Object.keys(attributes).reduce((acc,curr)=>{
                                const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
                                return {...acc,[curr]:attributes[curr](vertex)}
                            },{});
                            return newStyles
                        }),
                    )
            )
    };
}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

const roughFactory = rough.svg(document.createElement("svg"));