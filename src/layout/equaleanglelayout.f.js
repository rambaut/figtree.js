import {mean, min} from "d3-array";
import {layoutFactory, makeVertexFromNode} from "./layoutHelpers";



function * pseudoRerootPreorder(node, visited=[]) {
    const traverse = function* (node) {
        visited.push(node);
        yield node;
        const relatives = [(node.parent&&node.parent)].concat((node.children&&node.children)).filter(n=>n);// to remove null
        let pseudoChildren = relatives.filter(n => !visited.includes(n));
        if (pseudoChildren) {
            for (const child of pseudoChildren) {
                yield* traverse(child);
            }

        }
    };
    yield* traverse(node);
}



export const equalAngleVertices=(tipRank=null)=>tree=>{
    const startNode=tipRank?tree.getExternalNode(tipRank[0]):tree.externalNodes[0];

    function * traverseFromTip(node,visited=[],) {
        const traverse = function* (node) {
            visited.push(node);
            yield node;
            const relatives = [(node.parent && node.parent)].concat((node.children && node.children)).filter(n => n);// to remove null
            let pseudoChildren = relatives.filter(n => !visited.includes(n));
            if (pseudoChildren) {
                if (tipRank) {
                    pseudoChildren = pseudoChildren.sort((a, b) => {

                        const aRank = min([...pseudoRerootPreorder(a, [node])].filter(n => !n.children).map(n=>n.id).map(n => tipRank.indexOf(n)));
                        const bRank = min([...pseudoRerootPreorder(b, [node])].filter(n => !n.children).map(n=>n.id).map(n =>tipRank.indexOf(n)));
                        return bRank - aRank
                    })
                }
                for (const child of pseudoChildren) {
                    yield* traverse(child);
                }

            }
        };
        yield* traverse(node);
    }


    const nodeOrder = [...traverseFromTip(startNode, [],tipRank)];
    function getPseudoChildren(node) {
         const relatives = [(node.parent && node.parent)].concat((node.children && node.children)).filter(n => n);// to remove null
            // the parent will come before the node in question in the preoder traversal
            const pseudoChildren = nodeOrder.slice(nodeOrder.indexOf(node), nodeOrder.length).filter(n => relatives.includes(n))
            return (pseudoChildren.length > 0 ? pseudoChildren : null)
        }

        const totalTips = tree.externalNodes.length;


        function* traverse(node, dataFromParent = null) {
            const vertex = makeVertexFromNode(node);

            if (dataFromParent) {
                const {angle, length, allocatedRadians, parentY, parentX} = dataFromParent;
                vertex.y = Math.cos(angle) * length + parentY;
                vertex.x = Math.sin(angle) * length + parentX;
                vertex.allocatedRadians = allocatedRadians;

            } else {
                vertex.y = 0;
                vertex.x = 0;
                vertex.allocatedRadians = [0, 2 * Math.PI];
            }
            const children = getPseudoChildren(node);
            if (children) {
                let totalRadians = vertex.allocatedRadians[0];
                for (const child of children) {
                    const tips = [...traverseFromTip(child, [node])].filter(n => !n.children).length;
                    const r = 2 * Math.PI * tips / totalTips;
                    const allocatedRadians = [totalRadians, totalRadians + r];
                    const angle = totalRadians + r / 2;
                    const length = Math.abs(child.length);
                    yield* traverse(child, {angle, length, allocatedRadians, parentY: vertex.y, parentX: vertex.x})
                    totalRadians += r;

                }
            }
            yield vertex;
        }


        return [...traverse(startNode)];
}


export const equalAngleLayout=(tipRank) => layoutFactory(equalAngleVertices(tipRank));
