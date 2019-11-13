import {AbstractLayout} from "./abstractLayout";
import {geoMercator} from "d3";

export class GeographicLayout extends AbstractLayout{

    constructor(tree, settings = {projection:geoMercator(),locationKey:"location"}) {
        super(tree,settings);
    }

    setYPosition(vertex,currentY){
        console.log(vertex.node.annotations[this.settings.locationKey] );
        vertex.y=this.settings.projection(vertex.node.annotations[this.settings.locationKey])[1];
    }
    setXPosition(vertex,currentX){
        console.log(this.settings.projection(vertex.node.annotations[this.settings.locationKey]));
        vertex.x=this.settings.projection(vertex.node.annotations[this.settings.locationKey])[0];
    }
    _getTreeNodes() {
        return this.tree.nodeList;
    }

}