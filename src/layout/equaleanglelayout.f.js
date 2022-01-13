import {min} from "d3";
import {getClassesFromNode} from "./layoutHelpers";


function getRelatives(node){return [(node.parent&&node.parent)].concat((node.children&&node.children)).filter(n=>n)};// to remove null


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



export function equalAngleLayout(startNode=null){


    let tipRank=[];
    if(startNode){
        tipRank=[...pseudoRerootPreorder(startNode,[])].filter(n=>!n.children)
    }
    return function layout(figtree){

        const id = figtree.id;
        const tree = figtree.tree();

        startNode =startNode?startNode:tree.rootNode;
        tipRank=tipRank.length>0?tipRank:[...pseudoRerootPreorder(startNode,[])].filter(n=>!n.children);

        const numberOfTips= tree.externalNodes.length;
        const rPerTip = 2*Math.PI/numberOfTips;

        const positionNode=(node,x,y)=>{
            node[id].x =0;
            node[id].y =0;
            const leftLabel= !!node.children;
            const labelBelow= (!!node.children && (!node.parent || node.parent.children[0] !== node));

            node[id].x = x;
            node[id].y = y;
            node[id].classes = getClassesFromNode(node);

            node[id].textLabel={
                labelBelow,
                    x:leftLabel?"-6":"12",
                    y:leftLabel?(labelBelow ? "-8": "8" ):"0",
                    alignmentBaseline: leftLabel?(labelBelow ? "bottom": "hanging" ):"middle",
                    textAnchor:leftLabel?"end":"start",
            }
        }

        function *traverse(node,start,visited=[],parent={[id]:{x:0,y:0}}){
            // for children pass start and end
            // for children pass start and end
            // set angle as middle
            // call children passing start and end
            if(node===startNode){
                positionNode(node,0,0);
                yield(node);
            }
            let relatives = getRelatives(node).filter(n=>!visited.includes(n));
            // Node order is not really want we want we need to see past the interal nodes to the tips
            if(tipRank.length>0){
                relatives = relatives.sort((a,b)=>{

                    const aRank = min( [...pseudoRerootPreorder(a,[node])].filter(n=>!n.children).map(n=>tipRank.indexOf(n)));
                    const bRank = min ([...pseudoRerootPreorder(b,[node])].filter(n=>!n.children).map(n=>tipRank.indexOf(n)));
                    return bRank-aRank
                })
            }
            for(const relative of relatives){
                const allocation =[...pseudoRerootPreorder(relative,[...visited,...relatives])].filter(n=>!n.children).length*rPerTip;
                const angle = (start+(start+allocation))/2;
                const x = Math.sin(angle)* Math.abs(node.height-relative.height)+parent[id].x;
                const y = Math.cos(angle)* Math.abs(node.height-relative.height)+parent[id].y;
                positionNode(relative,x,y);

                yield relative;
                yield *traverse(relative,start,[node,...relatives],relative);
                start+=allocation;
            }
        }

        return [...traverse(startNode,0)];
    }
}

/**
 * The equal angle layout. This function returns a layout function. It take and optional internal node, which if provided acts
 * as the starting node and fixes the order nodes are visited. This means the tree not update. The root position will
 * still change in response to rerooting.
 * @param startingNode optional
 * @return {function(*=): {vertices: *, edges: *}}
 */
