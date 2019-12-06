import ElementFactory from "./elementFactory";
import {isFunction} from "../utilities";
import {Branch} from "../baubles/branch";
import {select,curveStepBefore,mouse} from "d3";

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

    hilightOnHover() {
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

    reRootOnClick(){
        super.on("click",
            (branch)=>(d,i,n)=>{

                const x1 = this.figure.scales.x(d.v1.x),
                 x2 = this.figure.scales.x(d.v0.x),
                 mx = mouse(document.getElementById(this.figure.svgId))[0],
                proportion = Math.abs( (mx - x2) / (x1 - x2)),
                    tree = this.figure.tree();
                //TODO add a distance method to layout to handel other cases

                tree.reroot(tree.getNode(d.id),proportion)


            });
        return this;
    }
}

export default EdgeFactory;