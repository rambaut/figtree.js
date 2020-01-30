import {axisBottom, axisLeft, axisRight, axisTop,format} from "d3";
import {decoration} from "./decoration";

class Legend extends decoration {
    constructor() {
        super();
        this._title = {
            text: "",
            xPadding: 0,
            yPadding: 0,
            rotation: 0
        };
        this._x = 0;
        this._y = 0;
        super.layer("axes-layer")
    }

    length(d = null) {
        if (!d) {
            return this._length
        } else {
            this._length = d;
            return this;
        }
    }

    scale(scale = null) {
        if (!scale) {
            return this._scale
        } else {
            this._scale = scale;
            return this;
        }
    }

    location(string = null) {
        if (!string) {
            return this._location
        } else {
            this._location = string;
            return this;
        }
    }

    create() {




        const selection = this.figure().svgSelection.select(`.${this.layer()}`);

        const group = selection
            .append("g")
            .attr("id", this._id)
            .attr("class", "legend")
            .attr("transform", `translate(${this._x}, ${this._y})`);
//https://www.d3-graph-gallery.com/graph/custom_legend.html#cont1
// Add one dot in the legend for each name.
        const size = 20;
        group.selectAll("rect")
            .data(this.scale().domain())
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", function (d, i) {
                return i * (size + 5)
            }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", size)
            .attr("height", size)
            .attr("fill",  (d) =>{
                return this.scale()(d)
            });

// Add one dot in the legend for each name.
        group.selectAll("text")
            .data(this.scale().domain())
            .enter()
            .append("text")
            .attr("x", size * 1.2)
            .attr("y", function (d, i) {
                return i * (size + 5) + (size / 2)
            }) // 100 is where the first dot appears. 25 is the distance between dots
            .text(function (d) {
                return d
            })
            .attr("text-anchor", "left")
            .attr("alignment-baseline", "middle");
    };

    tickFormat(d) {
        if (d) {
            this._tickFormat = d;
            return this;
        } else {
            return this._tickFormat;
        }
    }

    ticks(d) {
        if (d) {
            this._ticks = d;
            return this;
        } else {
            return this._ticks;
        }
    }

    updateCycle() {

        const selection = this.figure().svgSelection.select(`.${this.layer()}`);

        const group = selection
            .select(`g#${this._id}`)
            .transition()
            .attr("transform", `translate(${this._x}, ${this._y})`);
//https://www.d3-graph-gallery.com/graph/custom_legend.html#cont1
// Add one dot in the legend for each name.
        const size = 20;
        group.selectAll("rect")
            .transition()
            .attr("x", 0)
            .attr("y", function (d, i) {
                return i * (size + 5)
            }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", size)
            .attr("height", size)
            .attr("fill",(d) =>{
                return this.scale()(d)
            });

// Add one dot in the legend for each name.
        group.selectAll("text")
            .transition()
            .attr("x", size * 1.2)
            .attr("y", function (d, i) {
                return i * (size + 5) + (size / 2)
            }) // 100 is where the first dot appears. 25 is the distance between dots
            .text(function (d) {
                return d
            })
            .attr("text-anchor", "left")
            .attr("alignment-baseline", "middle");


    }
}

export function legend(){
    return new Legend();
}