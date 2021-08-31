import {Decoration} from "./decoration";
import {select} from "d3"
class AxisBars extends Decoration{
    constructor(axis){
        super();
        super.layer("axes-layer");
        this._axis=axis;
        this._oddFill="none";
        this._evenFill="lightgrey";
        this._x=null;
        this._y=null;
    }

    axis(a=null){
        if(a===null){
            return this._axis;
        }else{
            this._axis=a;
            return this;
        }
    }
    oddFill(a=null){
        if(a===null){
            return this._oddFill;
        }else{
            this._oddFill=a;
            return this;
        }
    }
    evenFill(a=null){
        if(a===null){
            return this._evenFill;
        }else{
            this._evenFill=a;
            return this;
        }
    }
    y(y=null){
        if(y==null){
            if(this._y==null){
                return this.axis().y()
            }else{
                return this._y;
            }
        }else{
            this._y=y
        }
    }
    x(x=null){
        if(x==null){
            if(this._x==null){
                return this.axis().x()
            }else{
                return this._x;
            }
        }else{
            this._x=x
        }
    }
    create(){
        const selection = this.figure().svgSelection.select(`.${this.layer()}`);
        const barLayer = selection
            .append("g")
            .attr("id", this._id)
            .attr("class", `axis-bars ${this._classes}`)
            .attr("transform", `translate(${this.x()}, ${this.y()})`)
    }

    scale(x=null){
        if(x==null){
            return this.axis.scale()
        }
        return this.axis().scale()(x);
    }

    updateCycle(){
        const ticks =this.axis().tickValues()
        const selection = this.figure().svgSelection.select(`.${this.layer()}`);

        selection
            .select(`g#${this._id}`)
            .selectAll("rect")
            .data(ticks.slice(0,-1))
            .join("rect")
            .attr("x",(d,i)=>this.scale(d))
            .attr("width",(d,i)=>this.scale(ticks[i+1])-this.scale(d))
            .attr("fill",(d,i)=>i%2?this._oddFill:this._evenFill)
            //relative to axis position
            .attr("height",this.figure().scales.height-this.figure().margins().bottom)
            .attr("y",-1*this.figure().scales.height+this.figure().margins().bottom)
    }
}

export function axisBars(axis=null){
    return new AxisBars(axis);
}