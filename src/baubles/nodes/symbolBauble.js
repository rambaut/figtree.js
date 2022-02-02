import { symbolSquare } from "d3";
import { symbol } from "d3";
import {AbstractNodeBauble} from "./nodeBauble";
import {select} from "d3";
import uuid from "uuid"
/**
 * The svgBauble class. Each vertex is assigned an svg in the svg.
 */
export class SymbolBauble extends AbstractNodeBauble{


    /**
     * The constructor.
     * @param [settings.radius=6] - the radius of the circle
     */
    constructor()
    {
        super();
        this._symbol=d3.symbolSquare;
        this._size=575;
    }

    symbol(s){
        if(s===null){
            return this._symbol;
        }else{
            this._manager=s;
            return this;
        }
    }
    size(s){
        if(s===null){
            return this._size;
        }else{
            this._size=s;
            return this;
        }
    }

    /**
     * A function that assigns cy,cx,and r attributes to a selection. (cx and cy are set to 0 each r is the settings radius
     * plus the border.
     * @param selection
     */
    update(selection=null) {
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
                    .append("path")
                    .attr("class",`node-shape ${this.id}`)
                    .attr("d", symbol().size(this._size).type(this._symbol))
                    .attrs(this._attrs)
                    .styles(this._styles)
                    .each((d,i,n)=>{
                        const element = select(n[i]);
                        for( const [key,func] of Object.entries(this._interactions)){
                            element.on(key,(d,i,n)=>func(d,i,n))
                        }
                    }),
                update => update
                    .call(update => update.transition(d=>`u${uuid.v4()}`)
                        .duration(this.transitions().transitionDuration)
                        .ease(this.transitions().transitionEase)
                        .attrs(this._attrs)
                        .styles(this._styles)
                        .each((d,i,n)=>{
                            const element = select(n[i]);
                            for( const [key,func] of Object.entries(this._interactions)){
                                element.on(key,(d,i,n)=>func(d,i,n))
                            }
                        }),
                    )
                );
    };
    
 }
/**
 * helper function returns a new instance of a circle bauble.
 * @return {SymbolBauble}
 */
export function symbolBauble(){
    return new SymbolBauble();
}
