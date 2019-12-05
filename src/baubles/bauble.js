"use strict";

/** @module bauble */
import {mergeDeep} from "../utilities";
import {easeLinear} from "d3"
import set from "@babel/runtime/helpers/esm/set";

/**
 * The Bauble class
 *
 * This is a shape or decoration at the node of a tree or graph
 */
export class Bauble {

    static DEFAULT_SETTINGS() {
        return {
            vertexFilter: () => true,
            attrs:{},
            styles:{},
            transitions: {
                transitionDuration: 500,
                transitionEase: easeLinear,
            },
            interactions:{}
        };
    }

    /**
     * The constructor takes a setting object. The keys of the setting object are determined by the type of bauble.
     *
     * @param {Object} settings
     * @param {function} [settings.vertexFilter=()=>true] - a function that is passed each vertex. If it returns true then bauble applies to that vertex.
     * @param {Object} [settings.attrs={}] - styling attributes. The keys should be the attribute string (stroke,fill ect) and entries are function that are called on each vertex. These can be overwritten by css.
     *  @param {Object} [settings.styles={}] - styling attributes. The keys should be the attribute string (stroke,fill ect) and entries are function that are called on each vertex. These overwrite css.
     */
    constructor(settings = {}) {
        const options = mergeDeep(Bauble.DEFAULT_SETTINGS(),settings);
        this.attrs = options.attrs;
        this.interactions = options.interactions;
        this._transitions=options.transitions
    }

    /**
     * A function that appends the bauble to the selection, joins the data, assigns the attributes to the svg objects
     * updates and remove unneeded objects.
     * @param selection
     * @param border
     */
    update(selection, border = 0) {
        throw new Error("don't call the base class methods")
    }

    attr(string,value=null){
        if(value){
            this.attrs[string] = value;
        }else{
            return this.attrs[string]
        }
    }
    on(string,value){
        this.interactions[string] = value;
    }
    transitions(t=null){
        if(t){
            this._transitions=t;
        }else{
            return this._transitions;
        }
    }
    scales(scales=null){
        if(scales){
            this.scales=scales
        }else{
            return this.scales;
        }
    }
}



