import rough from 'roughjs/dist/rough.umd';
import {mergeDeep} from "../../utilities";
import {Bauble} from "../bauble";
import {AbstractNodeBauble} from "./nodeBauble";
import {select} from "d3"


/** @module bauble */

/**
 * The CircleBauble class. Each vertex is assigned a circle in the svg.
 */
export class RoughCircleBauble extends AbstractNodeBauble {

    /**
     * The constructor.
     */
    constructor(settings = {}) {
        super();
        this._fillAttrs={stroke:"black", "stroke-width":1,fill: "none"}
        this._strokeAttrs={"stroke-width": 0.5, stroke:"black", fill: "none"}
        this._radius=6;
        this._roughSettings={"fill":"red"}// just to make fill color will be handled by fillAtrs

    }
    /**
     * Get or set attributes that will style the fill stroke.
     * @param string
     * @param value - a string, number, or function that will be passed to d3 selection.
     * @return {Bauble|*}
     */
    fillAttr(string,value=null){
        if(value){
            this._fillAttrs[string] = value;
            return this
        }else{
            return this._fillAttrs[string]
        }
    }
    /**
     * Get or set attributes that will style the fill stroke.
     * @param string
     * @param value - a string, number, or function that will be passed to d3 selection.
     * @return {Bauble|*}
     */
    strokeAttr(string,value=null){
        if(value){
            this._strokeAttrs[string] = value;
            return this
        }else{
            return this._strokeAttrs[string]
        }
    }

    /**
     * settings passed to roughjs
     * @param string
     * @param value
     * @returns {RoughCircleBauble|*}
     */
    roughSetting(string,value=null){
        if(value){
            this._roughSettings[string] = value;
            return this
        }else{
            return this._roughSettings[string]
        }
    }
    radius(r=null){
        if(r){
            this._radius= r;
            return this
        }else{
            return this._radius
        }
    }

    attr(){
        throw new Error("rough baubles are different. Both fill and stroke are stroke objects use fillAttr and strokeAttr and radius instead")
    }
    /**
     * A function to append the circles to the svg.
     * @param selection
     * @return {Bundle|MagicString|*|void}
     */
    update(selection=null) {
        if(selection==null&&!this.selection){
            return
        }
        if(selection){
            this.selection=selection;
        }
        const newPaths = [...roughFactory.circle(0, 0, this._radius,this._roughSettings).childNodes]
            .map(d => d.getAttribute("d")).reverse(); // this puts the "stroke" before the fill so if there is no fill we just never hit it below
        const pathNames = ["roughStroke","roughFill"] ;
        return selection.selectAll("path")
            .data(d =>[d,d].slice(0,newPaths.length))
            .join(
                enter => enter
                    .append("path")
                    .attr("d", (d, i) => newPaths[i])
                    .attr("class", (d,i) => {return`${pathNames[i]} node-shape rough`})
                    .attrs((vertex, i) => i%2? this._fillAttrs:this._strokeAttrs)
                    // .styles((vertex, i) => i%2? this._fillStyles:this._strokeStyles) //TODO
                    .each((d,i,n)=>{
                        const element = select(n[i]);
                        for( const [key,func] of Object.entries(this._interactions)){
                            element.on(key,(d,i,n)=>func(d,i,n))
                        }
                    }),
                update => update
                    .call(update => update.transition()
                        .attr("d", (d, i) => newPaths[i])
                        .attrs((vertex, i) => i%2? this._fillAttrs:this._strokeAttrs)
                        // .styles((vertex, i) => i%2? this._fillStyles:this._strokeStyles) //TODO
                        .each((d,i,n)=>{
                            const element = select(n[i]);
                            for( const [key,func] of Object.entries(this._interactions)){
                                element.on(key,(d,i,n)=>func(d,i,n))
                            }
                        })
                    )
            )
    };
}

export const roughFactory = rough.svg(document.createElement("svg"));

export function roughCircle(){
    return new RoughCircleBauble()
}