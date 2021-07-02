import {Decoration} from "./decoration";
import {select} from "d3";
import uuid from "uuid";

class TraitBar extends Decoration{
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
        super.layer("top-annotation-layer")
        this._size=20;
        this._scale=null;
        this._attrs={"width":3};
    }

    /**
     * The size of the square used to display the color
     * @param d - value or function to be called on the tree node
     * @return {TraitBar|function}
     */
    attr(string,d = null) {
        if(d){
            this._attrs[string] = d;
            return this;
        }else{
            return this._attrs[string]
        }
    }
    /**
     * set the width of the trait bar
     * @param d
     * @return {TraitBar|Function}
     */
    width(d = null) {
        return this.attr("width",d)
    }

    create(nodes) {
        const selection = this.figure().svgSelection.select(`.${this.layer()}`);

        const group = selection
            .append("g")
            .attr("id", this._id)
            .attr("class", "trait-bar")
            .attr("transform", `translate(${this._x}, ${this._y})`);
        this.updateCycle(nodes);
    };

    updateCycle(nodes) {
        const selection = this.figure().svgSelection.select(`.${this.layer()}`);

        const group = selection
            .select(`g#${this._id}`)
            .attr("transform", `translate(${this._x}, ${this._y})`);


        const rect_height = this.figure().scales.y.range()[1]/(nodes.filter(n=>!n.children).length-1);

        group.selectAll("rect")
            .data(nodes.filter(n=>!n.children))
            .join(
            enter => enter
                .append("rect")
                .attr("x", 0)
                .attr("y",  (d, i)=> {
                    return this.figure().scales.y(d[this.figure().id].y )- rect_height/2
                }) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("height",rect_height)
                .attrs(this._attrs)
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
                    .attr("x", 0)
                    .attr("y",  (d, i)=> {
                        return this.figure().scales.y(d[this.figure().id].y )- rect_height/2
                    }) // 100 is where the first dot appears. 25 is the distance between dots
                    .attrs(this._attrs)
                    .each((d,i,n)=>{
                        const element = select(n[i]);
                        for( const [key,func] of Object.entries(this._interactions)){
                            element.on(key,(d,i,n)=>func(d,i,n))
                        }
                    }),
                )
        );
    }


}
export function traitBar(){
    return new TraitBar();
}