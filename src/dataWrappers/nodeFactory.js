import ElementFactory from "./elementFactory";
import {CircleBauble} from "../baubles/circlebauble";
import {select} from "d3";
class nodeFactory extends ElementFactory {
    constructor(figure) {
        super(figure);
        this.elementMaker = CircleBauble;
    }

    highlight(r = 1) {
        super.on("mouseenter",
            (element) => (d, i,n) => {
                element.attr("r", element.attr("r") + r);
                select(n[i]).classed("hovered",true);
                element.update()
            });
        super.on("mouseleave",
            (element) => (d,i,n) => {
                element.attr("r", element.attr("r") - r);
                select(n[i]).classed("hovered",false);
                element.update()
            });
        return this;
    }
}

export default nodeFactory