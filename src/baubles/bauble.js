"use strict";

/** @module bauble */
import {mergeDeep} from "../utilities";
import {easeLinear} from "d3"
import set from "@babel/runtime/helpers/esm/set";
import uuid from "uuid";

/**
 * The Bauble class
 *
 * This is a shape or decoration at the node of a tree or graph
 */
export class Bauble {

    /**
     * The constructor takes a setting object. The keys of the setting object are determined by the type of element.
     *
     * @param {Object} settings
     * @param {function} [settings.vertexFilter=()=>true] - a function that is passed each vertex. If it returns true then element applies to that vertex.
     * @param {Object} [settings._attrs={}] - styling attributes. The keys should be the attribute string (stroke,fill ect) and entries are function that are called on each vertex. These can be overwritten by css.
     *  @param {Object} [settings.styles={}] - styling attributes. The keys should be the attribute string (stroke,fill ect) and entries are function that are called on each vertex. These overwrite css.
     */
    constructor() {
        this.id=`n${uuid.v4()}`;
        this._attrs ={};
        this._interactions = {};
        this._updatePredicate=()=>true;
    }

    /**
     * A function that appends the element to the selection, joins the data, assigns the attributes to the svg objects
     * updates and remove unneeded objects.
     * @param selection
     */
    update(selection) {
        if(this._updatePredicate(selection)){
            this.updateCycle(selection);
        }

    }
    updateCycle(){
        throw new Error("Don't call the base class method")
    }

    updatePredicate(f){
        if(f===null){
            return this._updatePredicate;
        }else{

            this._updatePredicate=(selection)=>f(selection.data()[0]);
            return this;
        }
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
    revealOnHover(){

        this.updatePredicate()
        //TODO put listener on parent only insert this element if the parent is hovered or clicked ect.
    }

}



