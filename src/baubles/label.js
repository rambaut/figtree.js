import {select} from "d3";
import {Bauble} from "./bauble";

export class Label extends Bauble{
    constructor() {
        super();
        this._text=()=>"";
        this._scaleX=false;
        this._scaleY=false;
        return this;
    }
    updateCycle(selection){
        return selection
            .selectAll("text")
            .data(d => [d],d=>`label-${d.id}`)
            .join(
                enter => enter
                    .append("text")
                    .attr("class","label")
                    .attrs(this._attrs)
                    .each((d,i,n)=>{
                        const element = select(n[i]);
                        for( const [key,func] of Object.entries(this._interactions)){
                            element.on(key,(d,i,n)=>func(d,i,n))
                        }
                    })
                    .text(d=>this._text(d)),
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
                        })
                        .text(d=>this._text(d))
                    )
            );
    };

    text(f){
        if(f==null){
            return this._text;
        }else{
            if(f instanceof String||typeof f==="string"){
                this._text = ()=>f;
            }else{
                this._text=f;
            }
            return this;
        }
    }

}


//((this.scales.x(e.v1.x+this.xScaleOffset) - this.scales.x(e.v0.x+this.xScaleOffset)) / 2))

export function label(text){

return new Label()
        .attr("x",d=>d.textLabel.x)
        .attr("y",d=> d.textLabel.y)
        .attr("alignment-baseline",d=>d.textLabel.alignmentBaseline)
        .attr("text-anchor",d=>d.textLabel.textAnchor)
        .text(text)


}
export function tipLabel(text){
    return label(text)
        .updatePredicate(d=>d.degree===1);
}
export function internalNodeLabel(text){
    return label(text)
        .updatePredicate(d=>d.degree>1);
}

export function branchLabel(text){
    const l = label(text);
    const setX = obj => d=>{
        // console.log((obj.scales().x(d.v1.x)-obj.scales().x(d.v0.x)/2));
        return (obj.scales().x(d.v1.x)-obj.scales().x(d.v0.x))/2
    };
    return l.attr("x",setX(l))
}