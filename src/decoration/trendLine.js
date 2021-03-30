import {Decoration} from "./decoration";
import {line} from "d3";

class TrendLine extends Decoration {
    constructor() {
        super();
        super.layer("top-annotation-layer")
        this.selection=null;
        this._attrs={"stroke":"black","stroke-width":1.5};
    }

    create() {
        const selection = this.figure().svgSelection.select(`.${this.layer()}`);
        this.selection =   selection
            .append("g")
            .attr("id", this._id)
            .attr("class","trendline")
        this.updateCycle();
    }
    updateCycle() {
        this.selection
            .selectAll("path")
                .data([this.figure().regression.points])
                .join("path")
                    .attr("fill", "none")
                    .attrs(this._attrs)
                    .attr("d", line()
                        .x((d) =>{ return this.scales().x(d[this.figure().id].x) })
                        .y((d) =>{ return this.scales().y(d[this.figure().id].y) })
                    )
    }

    /**
     * Get or set attributes that will style the elements.
     * @param string
     * @param value - a string, number, or function that will be passed to d3 selection.
     * @return {Bauble|*}
     */
    attr(string,value=null){
        if(value){
            this._attrs[string] = value;
            return this
        }else{
            return this._attrs[string]
        }
    }

}
export function trendLine(){
    return new TrendLine();
}
