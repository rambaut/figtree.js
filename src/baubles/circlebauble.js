import {mergeDeep} from "../utilities";
import {Bauble} from "./bauble";
import {select} from "d3";
import p from "../privateConstants";
/** @module bauble */


/**
 * The CircleBauble class. Each vertex is assigned a circle in the svg.
 */
export class CircleBauble extends Bauble{


    /**
     * The constructor.
     * @param [settings.radius=6] - the radius of the circle
     */
    constructor()
    {
        super();
        this._attrs={"r":5,"cx":0,"cy":0}
    }


    /**
     * A function that assigns cy,cx,and r attributes to a selection. (cx and cy are set to 0 each r is the settings radius
     * plus the border.
     * @param selection
     */
    updateCycle(selection=null) {
        if(selection==null&&!this.selection){
            return
        }
        if(selection){
            this.selection=selection;
        }
        return selection
            .selectAll(`.${this.id}`)
            .data(d => [d],d=>this.id)
            .join(
                enter => enter
                    .append("circle")
                    .attr("class",`node-shape ${this.id}`)
                    .attrs(this._attrs)
                    .each((d,i,n)=>{
                        const element = select(n[i]);
                        for( const [key,func] of Object.entries(this._interactions)){
                            element.on(key,(d,i,n)=>func(d,i,n))
                        }
                    }),
                update => update
                    .call(update => update.transition()
                        .duration(this.transitions().transitionDuration)
                        .ease(this.transitions().transitionEase)
                        .attrs(this._attrs)
                        .each((d,i,n)=>{
                            const element = select(n[i]);
                            for( const [key,func] of Object.entries(this._interactions)){
                                element.on(key,(d,i,n)=>func(d,i,n))
                            }
                        }),
                    )
                );
    };

    hilightOnHover(r = null) {
        let oldR;
        super.on("mouseenter",
            (d, i,n) => {
                if(r) {
                    if (!this._attrs.r) {
                        this._attrs.r = this._attrs["r"];
                    }
                    oldR=this._attrs["r"];
                    this.attr("r", r);
                }
                const parent = select(n[i]).node().parentNode;
                this.update(select(parent));
                select(parent).classed("hovered",true)
                    .raise();
                if(r){
                    this.attr("r", oldR);

                }


                // move to top

            });
        super.on("mouseleave",
            (d,i,n) => {
                const parent = select(n[i]).node().parentNode;
                select(parent).classed("hovered",false);
                this.update(select(parent));

            });
        return this;
    }
    annotateOnHover(key){
        super.on("mouseenter",
             (d, i,n) => {
                this.manager().figure()[p.tree].annotateNode(this.manager().figure()[p.tree].getNode(d.id),{[key]:true});
                this.manager().figure()[p.tree].treeUpdateCallback();
                const parent = select(n[i]).node().parentNode;
                select(parent).raise();
            });
        super.on("mouseleave",
             (d,i,n) => {
                this.manager().figure()[p.tree].annotateNode(this.manager().figure()[p.tree].getNode(d.id),{[key]:false});
                this.manager().figure()[p.tree].treeUpdateCallback();
            });
        return this;
    }
    rotateOnClick(recursive=false){
        super.on("click",(d,n,i)=>{
            const node = this.manager().figure()[p.tree].getNode(d.key);
            this.manager().figure()[p.tree].rotate(node,recursive);
        });
        return this;
    }
}

export function circle(){
    return new CircleBauble();
}
