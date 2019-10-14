"use strict";

/** @module bauble */
import {mergeDeep} from "../utilities";
import {easeLinear} from "d3"

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
            attrs:{},
            styles:{},
            transition: {
                transitionDuration: 1000,
                transitionEase: easeLinear,
            }
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
     * A function that appends the bauble to the selection, joins the data, assigns the attributes to the svg objects
     * updates and remove unnneed objects.
     * @param selection
     * @param border
     */
    updateShapes(selection, border = 0) {
        throw new Error("don't call the base class methods")
    }

}



