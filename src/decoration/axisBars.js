import {Decoration} from "./decoration";
//TODO make work!
class AxisBars extends Decoration{
    constructor(axis){
        super();
        super.layer("axes-layer");
        this._axis=axis;
        this._oddFill="none";
        this._evenFill="light-grey";
        this._x=0;
        this._y=0;
    }
    axis(a=null){
        if(a===null){
            return this._axis;
        }else{
            this._axis=a;
            return this;
        }
    }
    create(){
        const selection = this.figure().svgSelection.select(`.${this.layer()}`);

        const barLayer = selection
            .append("g")
            .attr("id", this._id)
            .attr("class", "axis-bars")
            .attr("transform", `translate(${this._x}, ${this._y})`)




    }

    updateCycle(){
        select(`.${this._id}`)
            .selectAll("rect")
            .data([this.axis().scales().x.domain()[0],...this.axis().tickValues(),this.axis().scales().x.domain()[0]])
            .join("rect")
            .attr(x,(d,i)=>)


    }
}
