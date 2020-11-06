import {Bauble} from "../bauble";
import {select} from "d3"
import p from "../../_privateConstants";
/*
An abstract class for node baubles
 */
export class AbstractNodeBauble extends Bauble{
    constructor()
    {
        super();
    }

    /**
     * Helper function to class the node as 'hovered' and update the radius if provided
     * @param r - optional hover radius
     * @return {AbstractNodeBauble}
     */
    hilightOnHover() {
        super.on("mouseenter",
            (d, i,n) => {
                const parent = select(n[i]).node().parentNode;
                this.update(select(parent));
                select(parent).classed("hovered",true)
                    .raise();

                // move to top

            });
        super.on("mouseleave",
            (d,i,n) => {
                const parent = select(n[i]).node().parentNode;
                select(parent).classed("hovered",false);
                this.update(select(parent));

            });
        return this;
    }

    /**
     * helper method to annotate the underlying tree node as key:true; Useful for linking interactions between figures
     * that share a tree.
     * @param key
     * @return {AbstractNodeBauble}
     */
    annotateOnHover(key){
        super.on("mouseenter",
            (d, i,n) => {
                this.manager().figure()[p.tree].annotateNode(d,{[key]:true});
                this.manager().figure()[p.tree].treeUpdateCallback();
                const parent = select(n[i]).node().parentNode;
                select(parent).raise();
            });
        super.on("mouseleave",
            (d,i,n) => {
                this.manager().figure()[p.tree].annotateNode(d,{[key]:false});
                this.manager().figure()[p.tree].treeUpdateCallback();
            });
        return this;
    }

    /**
     * Rotate a node on click
     * @param recursive - optional default -false;
     * @return {AbstractNodeBauble}
     */
    rotateOnClick(recursive=false){
        super.on("click",(d,n,i)=>{
            this.manager().figure()[p.tree].rotate(d,recursive);
        });
        return this;
    }

    /**
     * helper method to annotate the underlying tree node as key:true; Useful for linking interactions between figures
     * that share a tree.
     * @param key
     * @return {CircleBauble}
     */
    annotateOnClick(key){
        super.on("click",
            (d, i,n) => {
                this.manager().figure()[p.tree].annotateNode(d,{[key]:!node.annotations[key]});
                this.manager().figure()[p.tree].treeUpdateCallback();
                const parent = select(n[i]).node().parentNode;
                select(parent).raise();
            });
        return this;
    }

}
