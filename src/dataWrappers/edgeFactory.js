import ElementFactory from "./elementFactory";
import {isFunction} from "../utilities";
import {Branch} from "../baubles/branch";

class EdgeFactory extends ElementFactory{
    constructor(figure){
        super(figure);
        this.elementMaker=Branch;
    }
}

export default EdgeFactory;