import {axisBottom, axisLeft, axisRight, axisTop,format} from "d3";
import {Decoration} from "./decoration";

/**
 * The axis class
 */
//TODO fix scales
class Axis extends Decoration {
    constructor(){
        super();
        this._ticks=5;
        this._tickFormat=format(".1f");
        this._title={
            text:"",
            xPadding:0,
            yPadding:0,
            rotation:0
        };
        this._location="bottom";
        this._x=0;
        this._y=0;
        super.layer("axes-layer")
        this._reverse = false;
        this._hasBeenReversed=false;
        this._origin=null;
        this._needsNewOrigin=false;
        this._scale = null;
        this._axis=null;
        this._bars=false;
        this._usesFigureScale=true; //flag ensures we get updated figure scale when needed.
    }

    /**
     * Get or set the location of the ticks on the axis. "bottom", "top","left",'right"
     * @param string
     * @return {string|Axis}
     */
    location(string=null){
        if(!string){
            return this._location
        }else{
            this._location=string;
            return this;
        }
    }

    origin(x=null){
        if(x===null){
            return this._origin;
        }else{
            this._origin=x;
            this._needsNewOrigin=true;
            return this;
        }
    }
   reverse(){
        this._reverse=!this._reverse;
        this._hasBeenReversed=false;
        return this;
   }
   scale(s=null){
        if(s===null){
            return this._scale;
        }
        else{
            this._scale = s;
            if(this._scale===this.figure().scales.y || this._scale===this.figure().scales.x){
                this._usesFigureScale=true;
            }else{
                this._usesFigureScale=false;
            }
            return this;
        }
   }
   //TODO support more calls to d3 axis
   tickValues(){
        return this.scale().ticks()
   }
   bars(){

   }

    updateScales(){

        this.d3Axis = getD3Axis(this._location);
        const length = ["top","bottom"].indexOf(this._location)>-1?
            this.scales().width - this.figure()._margins.left - this.figure()._margins.right:
            this.scales().height -this.figure()._margins.top - this.figure()._margins.bottom;
        if(this.scale()===null || this._usesFigureScale===true){
            // console.log("using figure scale")
            //TODO scale() !== scales()
            this.scale((["top","bottom"].indexOf(this._location)>-1?this.scales().x:this.scales().y).copy())
            this._usesFigureScale=true; // force this to be true call above sets to false since it's a copy
            if(this._origin){
                if(this._origin!==this.scale().domain()[1]){
                    this._needsNewOrigin=true;
                }
            }
        }
        if(this._needsNewOrigin){
            console.log("updating origin")
            this.scale().domain(this.scale().domain().reverse().map((d,i)=>(i===0?this.origin()-d:this.origin())));
            this._needsNewOrigin=false
        }
        if(this._reverse && !this._hasBeenReversed){
            console.log("reverse it")
            const domain=this.scale().domain()
            this.scale().domain([domain[0],-1*domain[1]]);
            this._hasBeenReversed=true;
        }
         this._axis = this.d3Axis(this.scale())

             .tickFormat(this.tickFormat())
             .tickSizeOuter(0);
        // console.log(this._usesFigureScale)
        if (Array.isArray(this.ticks())){
            this._axis.tickValues(this.ticks())
        }else{
            this._axis.ticks(this.ticks())
        }

        return {length,axis:this._axis}
    }

    create() {
        const {length,axis} = this.updateScales();
        const selection = this.figure().svgSelection.select(`.${this.layer()}`);

        selection
            .append("g")
            .attr("id", this._id)
            .attr("class", `axis ${this._classes}`)
            .attr("transform", `translate(${this._x}, ${this._y})`)
            .call(axis);

        const pos={x:0,y:0};
        if(this.location().toLowerCase() === "bottom" || this.location().toLowerCase() === "top"){
            pos.x = length/2
        }else{
            pos.y=length/2
        }

        selection
            .append("g")
            .attr("id", `${this._id}-label`)
            .attr("class", `axis-label ${this._classes}`)
            .attr("transform", `translate(${this._x}, ${this._y})`)
            .append("text")
            .attr("transform", `translate(${pos.x+this._title.xPadding}, ${pos.y+this._title.yPadding}) rotate(${this._title.rotation})`)
            .attr("alignment-baseline", "hanging")
            .style("text-anchor", "middle")
            .text(this._title.text);
    };

    /**
     * Get or set the tick format used. This is passed to the d3 Axis.
     * @param d
     * @return {Axis|*}
     */
    tickFormat(d){
        if(d){
            this._tickFormat=d;
            return this;
        }else{
            return this._tickFormat;
        }
    }

    /**
     * Get or set the number of ticks. This is passed to the d3 axis and is a suggestion not a demand.
     * @param d
     * @return {Axis|number}
     */
    ticks(d){
        if(d){
            this._ticks=d;
            return this;
        }else{
            return this._ticks;
        }
    }

    updateCycle() {

        const {length,axis} = this.updateScales();

        const selection = this.figure().svgSelection.select(`.${this.layer()}`);


        selection
            .select(`g#${this._id}`)
            .transition()
            // .duration()
            .attr("id", this._id)
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
    return new Axis();
}