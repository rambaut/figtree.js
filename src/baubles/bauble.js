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

    /**
     * The constructor takes a setting object. The keys of the setting object are determined by the type of bauble.
     *
     * @param {Object} settings
     * @param {function} [settings.vertexFilter=()=>true] - a function that is passed each vertex. If it returns true then bauble applies to that vertex.
     * @param {Object} [settings._attrs={}] - styling attributes. The keys should be the attribute string (stroke,fill ect) and entries are function that are called on each vertex. These can be overwritten by css.
     *  @param {Object} [settings.styles={}] - styling attributes. The keys should be the attribute string (stroke,fill ect) and entries are function that are called on each vertex. These overwrite css.
     */
    constructor() {
        this._attrs ={};
        this._interactions = {};
    }

    /**
     * A function that appends the bauble to the selection, joins the data, assigns the attributes to the svg objects
     * updates and remove unneeded objects.
     * @param selection
     */
    update(selection) {
        throw new Error("don't call the base class methods")
    }
    manager(manager=null){
        if(manager===null){
            return this._manager;
        }else{
            this._manager=manager;
            return this;
        }
    }
    attr(string,value=null){
        if(value){
            this._attrs[string] = value;
            return this
        }else{
            return this._attrs[string]
        }
    }
    on(string,value){
        this._interactions[string] = value;
        return this;
    }
    transitions(t=null){
        if(t===null){
            if(this._transitions){
                return this._transitions;
            }else{
                return this.manager().figure().transitions();
            }

        }else{
            this._transitions=t;
            return this;
        }
    }
    scales(scales=null){
        if(scales){
            this._scales=scales
        }else{
            if(this._scales){
                return this._scales;
            }else{
                return this.manager().figure().scales
            }
        }
    }
    label(){
        //TODO make this label maker
    }
}



