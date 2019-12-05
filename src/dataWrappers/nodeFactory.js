import ElementFactory from "./elementFactory";
import {CircleBauble} from "../baubles/circlebauble";
import {select} from "d3";
import p from "../privateConstants"
class NodeFactory extends ElementFactory {
    constructor(figure) {
        super(figure);
        this.elementMaker = CircleBauble;
    }

    hover(r = 1) {
        super.on("mouseenter",
            (element) => (d, i,n) => {
            if(!this.attrs.r){
                this.attrs.r = element.attr("r");
            }
                element.attr("r", r);

                const parent = select(n[i]).node().parentNode;
                select(parent).classed("hovered",true);

                element.update();
            });
        super.on("mouseleave",
            (element) => (d,i,n) => {
                element.attr("r", this.attr("r"));

                const parent = select(n[i]).node().parentNode;
                select(parent).classed("hovered",false);

                element.update();
            });
        return this;
    }

    rotate(recursive=false){
        super.on("click",(element)=>(d,n,i)=>{
            const node = this.figure[p.tree].getNode(d.key);
            this.figure[p.tree].rotate(node,recursive);
        });
        return this;
    }
}

export default NodeFactory