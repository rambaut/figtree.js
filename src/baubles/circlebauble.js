import {mergeDeep} from "../utilities";
import {Bauble} from "./bauble";
import {select} from "d3";
/** @module bauble */

/**
 * The CircleBauble class. Each vertex is assigned a circle in the svg.
 */
export class CircleBauble extends Bauble {


    static DEFAULT_SETTINGS() {
        return {attrs: {
                r: 6,
            }
        };
    }

    /**
     * The constructor.
     * @param [settings.radius=6] - the radius of the circle
     */
    constructor(settings = {}) {
        super(mergeDeep(CircleBauble.DEFAULT_SETTINGS(), settings));

    }


    /**
     * A function that assigns cy,cx,and r attributes to a selection. (cx and cy are set to 0 each r is the settings radius
     * plus the border.
     * @param selection
     * @param {number} [border=0] - the amount to change the radius of the circle.
     */
    update(selection=null) {
        if(selection==null&&!this.selection){
            return
        }
        if(selection){
            this.selection=selection;
        }
        return this.selection
            .selectAll("circle")
            .data(d => [d])
            .join(
                enter => enter
                    .append("circle")
                    .attr("class","node-shape")
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attrs(this.attrs)
                    .each((d,i,n)=>{
                        const element = select(n[i]);
                        for( const [key,func] of Object.entries(this.interactions)){
                            console.log(key)
                            element.on(key,(d,i,n)=>func(d,i,n))
                        }
                    }),
                update => update
                    .call(update => update.transition()
                        .attrs(this.attrs),
                    )
                );
    };
}