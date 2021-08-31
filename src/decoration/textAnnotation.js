import {Decoration} from "./decoration";

class TextAnnotation extends Decoration{
    constructor() {
        super();
        super.layer("top-annotation-layer");
        this._text=null;
        this._attrs={};
        this.selection=null;
    }

    text(t=null){
        if(t==null){
            return this._text;
        }
        this._text=t;
        return this;
    }

    create(){
        const selection = this.figure().svgSelection.select(`.${this.layer()}`);
        this.selection =   selection
            .append("g")
            .attr("id", this._id)
            .attr("class", `text-annotation ${this._classes}`)

        this.updateCycle();
    }
    updateCycle(selection) {
        const text = typeof this._text==='function'?this._text():this._text;
        console.log(text)
        this.selection
            .attr("transform", `translate(${this._x}, ${this._y})`)
            .selectAll("text")
            .data([text])
            .join("text")
                .attrs(this._attrs)
                .text(d=>{return d});
    }
}

export function textAnnotation(){
    return new TextAnnotation();
}