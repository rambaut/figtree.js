import {AbstractLayout} from "./abstractLayout";

export class GeoLayout extends AbstractLayout{

    constructor(tree, projection,settings = {locationKey:"location"}) {
        super(tree,settings);
        this.projection=projection;

    }

    setYPosition(vertex,currentY){

        if(vertex.node.annotations[this.settings.locationKey]){
            vertex.y=this.projection(vertex.node.annotations[this.settings.locationKey])[1];
        }else{
            vertex.y=undefined;
        }

    }
    setXPosition(vertex,currentX){
        if(vertex.node.annotations[this.settings.locationKey]) {
            vertex.x = this.projection(vertex.node.annotations[this.settings.locationKey])[0];
        }else{
            vertex.x=undefined;
        }
    }
    _getTreeNodes() {
        return this.tree.nodeList;
    }

}