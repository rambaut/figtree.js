import {BaubleManager} from "./baubleManager";
import {CircleBauble} from "../baubles/circlebauble";
import {select} from "d3";
import p from "../privateConstants"
class NodeFactory extends BaubleManager {
    constructor(type) {
        super();
    }
//TODO move onHover to super class and take an _attrs object to update;


}

export const nodes = ()=>{
    return new BaubleManager()
        .class("node")
        .data(d=>d["vertices"])
        .layer("nodes-layer")

};

export const nodeBackground = () =>{
    return new BaubleManager()
        .class("node-background")
        .data(d=>d["vertices"])
        .layer("nodes-background-layer")
};


