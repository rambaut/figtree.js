import ElementFactory from "./elementFactory";
import {CircleBauble} from "../baubles/circlebauble";
import {select} from "d3";
import p from "../privateConstants"
class NodeFactory extends ElementFactory {
    constructor(figure) {
        super(figure);
        this.elementMaker = CircleBauble;
    }
//TODO move onHover to super class and take an attrs object to update;

    hilightOnHover(r = null) {
        super.on("mouseenter",
            (element) => (d, i,n) => {
            if(r) {
                if (!this.attrs.r) {
                    this.attrs.r = element.attr("r");
                }
                element.attr("r", r);
                element.update();
            }
                const parent = select(n[i]).node().parentNode;
                select(parent).classed("hovered",true);

            });
        super.on("mouseleave",
            (element) => (d,i,n) => {
                if(r) {
                    element.attr("r", this.attr("r"));
                    element.update();
                }
                const parent = select(n[i]).node().parentNode;
                select(parent).classed("hovered",false);

            });
        return this;
    }

    rotateOnClick(recursive=false){
        super.on("click",(element)=>(d,n,i)=>{
            const node = this.figure[p.tree].getNode(d.key);
            this.figure[p.tree].rotate(node,recursive);
        });
        return this;
    }
}

export default NodeFactory