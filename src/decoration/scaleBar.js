import {axisBottom, axisLeft, axisRight, axisTop,format} from "d3";
import {decoration} from "./decoration";

class ScaleBar extends decoration {
    constructor(){
        super();
        this._title={
            text:"",
            xPadding:0,
            yPadding:0,
            rotation:0
        };
        this._length=1;
        this._direction="x"
        this._x=0;
        this._y=0;
        super.layer("axes-layer")
    }
    length(d=null){
        if(!d){
            return this._length
        }else{
            this._length=d;
            return this;
        }
    }
    direction(string=null){
        if(!string){
        return this._direction
    }else{
        this._direction=string;
        return this;
    }
    }

    location(string=null){
        if(!string){
            return this._location
        }else{
            this._location=string;
            return this;
        }
    }

    create() {

        const selection = this.figure().svgSelection.select(`.${this.layer()}`);

        const group =selection
            .append("g")
            .attr("id", this._id)
            .attr("class", "scale-bar")
            .attr("transform", `translate(${this._x}, ${this._y})`)

            group
            .append("line")
                .attr("x1",0)
                .attr("y1",0)
                .attr("x2",(this.direction()==="x"?this.scales().x(this._length): 0))
                .attr("y2",(this.direction()==="y"?this.scales().y(this._length): 0))
                .attr("stroke","black")

        const pos={x:0,y:0};
        if(this.direction() === "x"){
            pos.x = this.scales().x(this._length)/2
        }else{
            pos.y=this.scales().y(this._length)/2
        }
        group
            .append("text")
            .attr("transform", `translate(${pos.x+this._title.xPadding}, ${pos.y+this._title.yPadding}) rotate(${this._title.rotation})`)
            .attr("alignment-baseline", "hanging")
            .style("text-anchor", "middle")
            .text(this._title.text);


    };

    tickFormat(d){
        if(d){
            this._tickFormat=d;
            return this;
        }else{
            return this._tickFormat;
        }
    }
    ticks(d){
        if(d){
            this._ticks=d;
            return this;
        }else{
            return this._ticks;
        }
    }

    updateCycle() {

        const selection = this.figure().svgSelection.select(`.${this.layer()}`);

        const group =selection
            .select(`g#${this._id}`)
            .transition()
            .attr("transform", `translate(${this._x}, ${this._y})`)
            .select("line")
                .attr("x1",0)
                .attr("y1",0)
                .attr("x2",(this.direction()==="x"?this.scales().x(this._length): 0))
                .attr("y2",(this.direction()==="y"?this.scales().y(this._length): 0))
                .attr("stroke","black")


        const pos={x:0,y:0};
        if(this.direction() === "x"){
            pos.x = this.scales().x(this._length)/2
        }else{
            pos.y=this.scales().y(this._length)/2
        }

        group
            .append("text")
            .attr("transform", `translate(${pos.x+this._title.xPadding}, ${pos.y+this._title.yPadding}) rotate(${this._title.rotation})`)
            .attr("alignment-baseline", "hanging")
            .style("text-anchor", "middle")
            .text(this._title.text);

    };


}

export function scaleBar(){
    return new ScaleBar();
}