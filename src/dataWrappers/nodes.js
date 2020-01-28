import ElementFactory from "./elementFactory";
import {CircleBauble} from "../baubles/circlebauble";
import {select} from "d3";
import p from "../privateConstants"
class NodeFactory extends ElementFactory {
    constructor(type) {
        super();
        this.type=type;
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
                select(parent).classed("hovered",true)
                    .raise();
                // move to top


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
    annotateOnHover(key){
        super.on("mouseenter",
            (element) => (d, i,n) => {
                this.figure[p.tree].annotateNode(this.figure[p.tree].getNode(d.id),{[key]:true});
                this.figure[p.tree].treeUpdateCallback();
        const parent = select(n[i]).node().parentNode;
        select(parent).raise();
    });
        super.on("mouseleave",
            (element) => (d,i,n) => {
                this.figure[p.tree].annotateNode(this.figure[p.tree].getNode(d.id),{[key]:false});
                this.figure[p.tree].treeUpdateCallback();
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

export const nodes = ()=>{
    return new NodeFactory(p.node);
};

export const nodeBackground = () =>{
    return new  NodeFactory(p.nodeBackground);
};


