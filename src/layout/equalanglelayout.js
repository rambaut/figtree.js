import {AbstractLayout} from "./abstractLayout";
import {mean,sum} from "d3"
export class EqualAngleLayout extends AbstractLayout {


    /**
     * The constructor.
     * @param tree
     * @param settings
     */
    constructor(tree, settings = { }) {
        super(tree,settings);
        this.originalOrder=[...this.tree.preorder()];
    }

    _getTreeNodes() {
        if(this.settings.fixOrder){
            return this.originalOrder;
        }
        return [...this.tree.preorder()]
    }

    setYPosition(vertex, currentY) {
        const node = vertex.node;
        if (vertex.node === this.tree.rootNode) {
            vertex.y = 0;
            vertex.angle = 0;
            vertex.allocatedRadians = [0,2*Math.PI]
        } else {
            // set y off of allocated angle
            const deltaY = Math.cos(vertex.angle) * node.length;
            vertex.y = this._nodeMap.get(node.parent).y + deltaY

        }
            //setup angles for children
            if (node.children) {
                // const subtrees = [...node.children, (node.parent&& node.parent)].filter(s=>s);

                const totalTips = this.tree.externalNodes.length;

                let totalRadians = vertex.allocatedRadians[0];
                node.children.forEach(child => {
                    const tips = [...this.tree.postorder(child)].filter(n => !n.children).length;
                    const r = 2 * Math.PI * tips / totalTips;
                    const angle = totalRadians + r / 2;
                    const allocatedRadians =[totalRadians,totalRadians+r];
                    totalRadians += r;
                    // if (s !== node.parent) {
                        const subtreeVertex = this._nodeMap.get(child);
                        subtreeVertex.angle = angle;
                        subtreeVertex.allocatedRadians=allocatedRadians;
                    // }
                });
            }

        return 0
    }

    setXPosition(vertex, currentX) {
        const node = vertex.node;
        if(vertex.node===this.tree.rootNode){
            vertex.x=0;
        }else{
            // set y off of allocated angle
            const deltaX = Math.sin(vertex.angle)*node.length;
            vertex.x = this._nodeMap.get(node.parent).x+deltaX
        }
    }
    setInitialX() {
        return 0;
    }
    setInitialY() {
        return 0;
    }



}