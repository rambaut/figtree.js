import ElementFactory from "./elementFactory";
import {isFunction} from "../utilities";
import {Branch} from "../baubles/branch";
import {select,curveStepBefore} from "d3";

class EdgeFactory extends ElementFactory{
    constructor(figure){
        super(figure);
        this.elementMaker=Branch;
        this._curveRadius=0;
        this._curve =curveStepBefore;
    }
    getElement(d, scales) {
        const element=super.getElement(d, scales);
        if(this._curveRadius instanceof Function){
            element.curveRadius(this._curveRadius(d))
        }else{
            element.curveRadius(this._curveRadius);
        }
        element.curve(this._curve);
        return element;
    }

    curveRadius(f) {
        if(f){
            this._curveRadius=f;
            if(this.figure.drawn){
                this.figure.update();
            }
            return this;
        }
        else{
            return this._curveRadius;
        }
    }

    curve(f) {
        if(f){
            this._curve=f;
            if(this.figure.drawn){
                this.figure.update();
            }
            return this;
        }
        else{
            return this._curve;
        }
    }

    hover() {
        super.on("mouseenter",
            (element) => (d, i,n) => {
                const parent = select(n[i]).node().parentNode;
                select(parent).classed("hovered",true);
            });
        super.on("mouseleave",
            (element) => (d,i,n) => {
                const parent = select(n[i]).node().parentNode;
                select(parent).classed("hovered",false);
            });
        return this;
    }
}

export default EdgeFactory;