import uuid from "uuid";
import {AbstractNodeBauble} from "./nodeBauble";
import {linkHorizontal,select} from "d3"
import {max,min,extent} from "d3-array";
export class CoalescentBauble extends AbstractNodeBauble {

    constructor() {
        super();
        this._attrs = {}
        this._settings={slope:"min","start-width":2}
    }

    /**
     * settings passed to roughjs
     * @param string
     * @param value
     * @returns {RoughCircleBauble|*}
     */
    setting(string,value=null){
        if(value){
            this._settings[string] = value;
            return this
        }else{
            return this._settings[string]
        }
    }


    update(selection = null) {
        if (selection == null && !this.selection) {
            return
        }
        if (selection) {
            this.selection = selection;
        }
        return selection
            .selectAll(`.${this.id}`)
            .data(d => [d], d => this.id)
            .join(
                enter => enter
                    .append("path")
                    .attr("class", `node-shape ${this.id}`)
                    .call(enter=>enter.transition()
                        .duration(this.transitions().transitionDuration)
                        .ease(this.transitions().transitionEase)
                        .attrs(this._attrs)
                        .attr("d",d=>this.makeCoalescent(d)))
                    .each((d, i, n) => {
                        const element = select(n[i]);
                        for (const [key, func] of Object.entries(this._interactions)) {
                            element.on(key, (d, i, n) => func(d, i, n))
                        }
                    }),

                update => update
                    .call(update => update.transition(d => `u${uuid.v4()}`)
                        .duration(this.transitions().transitionDuration)
                        .ease(this.transitions().transitionEase)
                        .attrs(this._attrs)
                        .attr("d",d=>this.makeCoalescent(d))
                        .each((d, i, n) => {
                            const element = select(n[i]);
                            for (const [key, func] of Object.entries(this._interactions)) {
                                element.on(key, (d, i, n) => func(d, i, n))
                            }
                        }),
                    )
            );
    };

   makeCoalescent(node){
       const id = this.manager()._figureId;
       const descendents = [...this.tree.postorder(node)].filter(n=>n!==node);
        const relativeChildPositions = descendents.map(child=>
            ({x: this.scales().x(child[id].x) -this.scales().x(node[id].x),
            y:this.scales().y(child[id].y) -this.scales().y(node[id].y)}));
        const xEnd=max(relativeChildPositions,d=>d.x);
        const yTop=min(relativeChildPositions,d=>d.y)-0.4;
        const yBottom =max(relativeChildPositions,d=>d.y)+0.4;

       const slope= calcSlope(relativeChildPositions,this.setting("slope"));
        return coalescentPath({x:xEnd,y:yTop},{x:xEnd,y:yBottom},slope,this.setting("start-width"))
    }

}

const link = linkHorizontal()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });


/**
 * A helper function that takes a source and target object (with x, and y positions each) It calculates a symmetric
 * coalescent shape between source, the target and the reflection of the taget about a horizontal line through the source.
 * @param source -
 * @param target -  the target object {x:,y:}
 * @param slope - a number that deterimines how quickly the curve reaches the max/min height
 * @param startWidth - The starting width of the shape
 * @return string
 */

// need max x for top and bottom, diff y
//TODO move slope to class settings
export function coalescentPath(topTarget,bottomTarget,slope=1,startWidth=2){
    const adjustedTopTarget={y:topTarget.y,x:topTarget.x/slope};
    const adjustedBottomTarget = {x:bottomTarget.x/slope,y:bottomTarget.y};

    const start = {x:0,y:0-startWidth/2};
    const end = {x:0,y:0+startWidth/2};

    const topD=link({source:start,target:adjustedTopTarget});
    const linker=`L${topTarget.x},${topTarget.y}v${adjustedBottomTarget.y-adjustedTopTarget.y},0L${adjustedBottomTarget.x},${adjustedBottomTarget.y}`;
    const bottomD=link({source:adjustedBottomTarget,target:end});

    return topD+linker+bottomD+`L${start.x},${start.y}`;
}


/**
 * This function takes a source vertex and target vertices. It calculates the target
 * for vertex and passes data on to the coalescent path function.
 * @param vertex
 * @param targets
 * @param scales
 * @param slope
 * @return string
 */



/**
 * A helper function that takes the source and target vertices
 * and calculates the slope so that the curve flattens and at
 * at the closest vertex (in the x direction).

 * @param targets
 */
export function calcSlope(targets,option="min"){
    const [min,max]=extent(targets,d=>d.x);

    switch (option) {
        case "min":
            return max/min;
        case "max":
            return 1;
        case parseFloat(option):
            return max/(min*parseFloat(option))
        default:
            return max/min;
    }
    return max / min;
}

/**
 * helper function returns a new instance of a circle bauble.
 * @return {CircleBauble}
 */
export function coalescentEvent(){
    return new CoalescentBauble();
}