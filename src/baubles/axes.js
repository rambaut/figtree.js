"use strict";
import {axisBottom,axisTop,axisLeft,axisRight} from "d3";
import {mergeDeep} from "../utilities";
import uuid from "uuid";

/** @module bauble */

/**
 * The Axes class
 *
 * This class defines and draws an axis. It can be shared by multiple plots
 * to allow the axes to be linked when zoomed or panned.
 */
export class Axis {
    static DEFAULT_SETTINGS() {
        return {
            tickArguments: [5, "f"],
            title: {
                    text:"",
                    xPadding:0,
                    yPadding:0,
                    rotation:0
            },
            id: `a${uuid.v4()}`,
            location:"bottom",
        };
    }

    /**
     /**
     * The constructor takes a setting object.
     *
     * @param {Object} settings
     * @param {Array} [settings.tickArguments=[5,"f"] - Arguments passed to the d3 tickArgument function for the axis
     * @param {Object} [settings.title={
                    text:"",
                    xPadding:0,
                    yPadding:0,
                    rotation:0
            }] - options pertaining to the axis title
     @param {string} settings.title.text - The axis title
     @param {number} settings.title.xPadding -number of pixels to move the text in the x direction

     @param {number} settings.title.yPadding -number of pixels to move the text in the y direction

     @param {string} [settings.location="bottom"] - the direction of the ticks on the axis bottom,top,left,right

     */
    constructor(settings = {}) {

        this.tickArguments=[5, "f"];
            this.title={
            text:"",
                xPadding:0,
                yPadding:0,
                rotation:0
        };
        this.id= `a${uuid.v4()}`;
            this.location="bottom";
        this.d3Axis = getD3Axis(this.location)
    }

    createAxis({selection, x, y, length,scale}) {

         this.axis = this.d3Axis( scale)
            .tickArguments(this.settings.tickArguments);

        this.axisSelectiion=selection
            .append("g")
            .attr("id", this.settings.id)
            .attr("class", "axis")
            .attr("transform", `translate(${x}, ${y})`)
            .call(this.axis);

        const pos={x:0,y:0};
        if(this.settings.location.toLowerCase() === "bottom" || this.settings.location.toLowerCase() === "top"){
            pos.x = length/2
        }else{
            pos.y=length/2
        }

        this.axisTitleSelection =selection
            .append("g")
            .attr("id", `${this.settings.id}-axis-label`)
            .attr("class", "axis-label")
            .attr("transform", `translate(${x}, ${y})`)
            .append("text")
            .attr("transform", `translate(${pos.x+this.settings.title.xPadding}, ${pos.y+this.settings.title.yPadding}) rotate(${this.settings.title.rotation})`)
            .attr("alignment-baseline", "hanging")
            .style("text-anchor", "middle")
            .text(this.settings.title.text);

        return selection;
    };

    updateAxis({selection, x, y, length,scale}) {
        // update the scale's domain
        this.axis = this.d3Axis( scale)
            .tickArguments(this.settings.tickArguments);


        selection
            .select(`g#${this.settings.id}`)
            .transition()
            // .duration()
            .attr("transform", `translate(${x}, ${y})`)
            .call(this.axis);

        const pos={x:0,y:0};
        if(this.settings.location.toLowerCase() === "bottom" || this.settings.location.toLowerCase() === "top"){
            pos.x = length/2
        }else{
            pos.y=length/2
        }
        selection
            .select(`g#${this.settings.id}-axis-label`)
                .transition()
                // .duration()
                .attr("transform", `translate(${x}, ${y})`)
            .select("text")
                .transition()
                // .duration()
                .attr("transform", `translate(${pos.x+this.settings.title.xPadding}, ${pos.y+this.settings.title.yPadding}) rotate(${this.settings.title.rotation})`)
                .attr("alignment-baseline", "hanging")
                .style("text-anchor", "middle")
                .text(this.settings.title.text);

    };


}


function getD3Axis(location) {
    switch (location.toLowerCase()) {
        case "bottom":
            return axisBottom;
        case "left":
            return axisLeft;
        case "top":
            return axisTop;
        case "right":
            return axisRight;
        default:
            throw new Error(`Unknown location type ${this.location}`);
    }
}



