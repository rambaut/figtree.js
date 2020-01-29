import {BaubleManager} from "./baubleManager";
import p from "../privateConstants";
import {Axis} from "../baubles/axes";
import uuid from "uuid";
import {mergeDeep} from "../utilities";
import {axisBottom, axisLeft, axisRight, axisTop} from "d3";

class AxisFactory extends BaubleManager {
    constructor(){
        super();
        this.type=p.axis;
        this._tickArguments=[5, "f"];
        this._title={
            text:"",
            xPadding:0,
            yPadding:0,
            rotation:0
        };
        this._id= `a${uuid.v4()}`;
        this._location="bottom";
        this.d3Axis = getD3Axis(this.location())
        this._x=0;
        this._y=0;

    }
    
    location(string=null){
        if(!string){
            return this._location
        }else{
            this._location=string;
            this.d3Axis = getD3Axis(this._location);
            return this;
        }
    }
    tickArguments(options=[]){
        if(options.length!==2){
            return this._tickArguments;
        }else{
            this._tickArguments=options;
            return this;
        }
    }
    title(options=null){
        if(!options){
            return this._title;
        }else{
            this._title={...this._title,...options};
            return this;
        }
    }
    

    createAxis() {

        const length = ["top","bottom"].indexOf(this._location)>-1?
            this.figure.scales.width - this.figure._margins.left - this.figure._margins.right:
            this.figure.scales.height -this.figure._margins.top - this.figure._margins.bottom;

        //TODO add options to change scales and all that jazz
        const axis = this.d3Axis( (["top","bottom"].indexOf(this._location)>-1?this.figure.scales.x:this.figure.scales.y))
            .tickArguments(this._tickArguments);

        const selection = this.figure.svgSelection.select(".axes-layer");


        selection
            .append("g")
            .attr("id", this._id)
            .attr("class", "axis")
            .attr("transform", `translate(${this._x}, ${this._y})`)
            .call(axis);

        const pos={x:0,y:0};
        if(this._location.toLowerCase() === "bottom" || this._location.toLowerCase() === "top"){
            pos.x = length/2
        }else{
            pos.y=length/2
        }

        selection
            .append("g")
            .attr("id", `${this._id}-axis-label`)
            .attr("class", "axis-label")
            .attr("transform", `translate(${this._x}, ${this._y})`)
            .append("text")
            .attr("transform", `translate(${pos.x+this._title.xPadding}, ${pos.y+this._title.yPadding}) rotate(${this._title.rotation})`)
            .attr("alignment-baseline", "hanging")
            .style("text-anchor", "middle")
            .text(this._title.text);

        return selection;
    };
    x(d=null){
        if(d!==null){
            this._x=d;
            return this;        }
        else{
            return this._x;
        }
    }
    y(d=null){
        if(d!==null){
            this._y=d;
            return this;        }
        else{
          return this._y;
        }
    }

    tickFormat(d){
        if(d){
            this._tickFormat=d;
            return this;
        }else{
            return this._tickFormat;
        }
    }
    updateAxis() {

        const length = ["top","bottom"].indexOf(this._location)>-1?
            this.figure.scales.width - this.figure._margins.left - this.figure._margins.right:
            this.figure.scales.height -this.figure._margins.top - this.figure._margins.bottom;

        //TODO add options to change scales and all that jazz
        const axis = this.d3Axis( (["top","bottom"].indexOf(this._location)>-1?this.figure.scales.x:this.figure.scales.y))
            .tickArguments(this._tickArguments);

        if(this._tickFormat){
            axis.tickFormat(this._tickFormat)
        }
        const selection = this.figure.svgSelection.select(".axes-layer");



        selection
            .select(`g#${this._id}`)
            .transition()
            // .duration()
            .attr("id", this._id)
            .attr("class", "axis")
            .attr("transform", `translate(${this._x}, ${this._y})`)
            .call(axis);

        const pos={x:0,y:0};
        if(this._location.toLowerCase() === "bottom" || this._location.toLowerCase() === "top"){
            pos.x = length/2
        }else{
            pos.y=length/2
        }
        selection
            .select(`g#${this._id}-axis-label`)
            .transition()
            // .duration()
            .attr("transform", `translate(${this._x}, ${this._y})`)
            .select("text")
            .transition()
            // .duration()
            .attr("transform", `translate(${pos.x+this._title.xPadding}, ${pos.y+this._title.yPadding}) rotate(${this._title.rotation})`)
            .attr("alignment-baseline", "hanging")
            .style("text-anchor", "middle")
            .text(this._title.text);

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

export function axis(){
    return new AxisFactory();
}