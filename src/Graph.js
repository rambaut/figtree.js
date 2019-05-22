"use strict"
/** @module Graph */

// import {Type} from 'figtree';
/**
 * The graph class
 *
 * A class that takes an arrary of nodes and edges and provides a number of methods
 * for manipulating the graph.
 * @param nodes - an array of nodes. Should contain a unique id identifier
 * @param edges - an array of edges linking the nodes {source:node.id,target:node.id}
 */
export class Graph{
    constructor(nodes=[],edges=[],settings={acyclicSelector:(e)=>true}) {
        
        this.nodeList = [];
        this.nodeMap = new Map();
        this.outGoingEdgeMap = new Map();
        this.incomingEdgeMap= new Map();
        this.edgeList = [];
        this.edgeMap = new Map();  
        this.acyclicSelector=settings.acyclicSelector;


        nodes.forEach(node=>this.addNode(node));
        edges.forEach(edge=>this.drawEdge(edge.source,edge.target));
        // This is used in identifying terminal tips  
    };
    /**
     * A static function to make a graph out of a tree
     * @param {*} tree 
     * @returns {Graph}
     */
    static fromPhylogeny(tree){
        const nodes = tree.externalNodes;
        // links inferred from the transmission layout
        // will also need a call back somewhere to update the links
        
    }
    /**
     * @returns {*}
     */
    get nodes(){
        return this.nodeList;
    }
    /**
     * @returns {*}
     */
    get externalNodes(){
        return this.nodeList.filter(d=>this.getOutgoingEdges().length===0);
    }
    /**
     * Adds a node to the graph.
     * @param {*} node 
     */
    addNode(node){
        if(!node.id){
            throw new Error(`All node's must contain an 'id' key ${node}`)
        }
        this.nodeList.push(node);
        if(this.nodeMap.has(node.id)){
            throw new Error(`All node's must have unique id values ${node.id} seen twice`)
        }
        this.nodeMap.set(node.id,node);

        this.outGoingEdgeMap.set(node,[]);
        this.incomingEdgeMap.set(node,[]);
    }
   
   /**
    * return a node given the key
    * @param {*} id the node id value 
    */
    getNode(id){
        return this.nodeMap.get(id);
    }
    
    /**
     * Get the edges entering a node
     * @param {*} node 
     * @returns {array} array of edges that end with the node
     */
    getIncomingEdges(node){
        return this.incomingEdgeMap.get(node)
     }
     /**
      * Get the edges leaving a node
      * @param {*} node 
      * @returns {array} array of edges that begin with the node
      */
 
     getOutgoingEdges(node){
         return this.outGoingEdgeMap.get(node)
     }
     /**
      * Get all the edges leaving and entering a node
      * @param {*} node
      * @returns {array} array of edges that touch node
      */
     getEdges(node){
         return (this.getOutgoingEdges(node).concat(this.getIncomingEdges(node)));
     }

    getNodeInfo(node){
        // const formatDate=d3.timeFormat("%Y-%m-%d")
        // let outString = `${node.id} </br>`
        // // for(const key of Object.keys(node)){
        // //     if(node[key]){
        // //         if(key!=="id"&& key!=="metaData"&&key!=="key"){
        // //             if(key.toLowerCase().indexOf("date")>-1){
        // //                 outString = `${outString}${key}: ${node[key].toISOString().substring(0, 10)}</br>`;
        // //                 }else{
        // //                 outString = `${outString}${key}: ${node[key]}</br>`;
        // //                 }            
        // //             }
        // //     }
        // // }
    
        // for(const key of Object.keys(node.metaData)){
        //     if(key.toLowerCase().indexOf("date")>-1){
        //     outString = `${outString}${key}: ${node.metaData[key].toISOString().substring(0, 10)}</br>`;
        //     }else{
        //     outString = `${outString}${key}: ${node.metaData[key]}</br>`;
        //     }
        // }
        // return outString;
    }

    /**
     * removes the node and incoming/outgoing edges
     * @param {object} node 
     */
   
    removeNode(node){
        //remove edges
        const edges = this.getEdges(node);
        edges.forEach(edge=>this.removeEdge(edge))

        const id=node.id
        this.nodeList=this.nodeList.filter(node=>node.id!==id);
        this.nodeMap.delete(id);
        this.incomingEdgeMap.delete(node);
        this.outGoingEdgeMap.delete(node);
    }

    /**
    * @returns {*} 
    */
    get edges(){
    return this.edgeList;
    }
    
    /**
     * returns the edge
     * @param {Symbol()} id - symbol key of the edge
     * @returns {*} edge
     */
    getEdge(id){
        return this.edgeMap.get(id);
    }
    getEdgeInfo(edge){
        // // const formatDate=d3.timeFormat("%Y-%m-%d")
        // let outString = `Source:${edge.source.id} </br> Target: ${edge.target.id}</br>`;
        // for(const key of Object.keys(edge.metaData)){
        //     if(key.toLowerCase().indexOf("date")>-1){
        //     outString = `${outString}${key}: ${edge.metaData[key].toISOString().substring(0, 10)}</br>`;
        //     }else{
        //     outString = `${outString}${key}: ${edge.metaData[key]}</br>`;
        //     }
        // }
        // return outString;
    }
     /**
     * Adds an edge between the provide source and target nodes. It the nodes are not part of the graph they are added.
     * @param {String} sourceNode Id
     * @param {String} targetNode Id
     */
    drawEdge(sourceNodeId,targetNodeId){
        if(!this.nodeMap.has(sourceNodeId)){
            throw new Error(`${sourceNodeId} not found in graph`)
        }
        if(!this.nodeMap.has(targetNodeId)){
            throw new Error(`${targetNodeId} not found in graph`)
        }
        const index = this.edgeList.legnth;
        const edge = {source:this.getNode(sourceNodeId),target:this.getNode(targetNodeId),id:`edge_${index}`};
        this.addEdge(edge);
    }
    /**
     * Adds an premade edge which between the provide source and target nodes. It the nodes are not part of the graph they are added.
     * @param {*} {source:node, targe:node} 
     */
    addEdge(edge){
        this.edgeList.push(edge);
        this.edgeMap.set(edge.id,edge);
        this.outGoingEdgeMap.get(edge.source).push(edge);
        this.incomingEdgeMap.get(edge.target).push(edge);
    }
    

    /**
     * removes an edge from the graph
     * @param {*} edge 
     */
    removeEdge(edge){
        const id=edge.id
        this.edgeList=this.edgeList.filter(edge=>edge.id!==id);

        // update edgemaps
        this.edgeMap.delete(id)
        // new outgoing
        const newOutgoing = this.getOutgoingEdges(edge.source).filter(e=>e!==edge);
        this.outGoingEdgeMap.set(edge.source,newOutgoing);
        const newIncoming = this.getIncomingEdges(edge.target).filter(e=>e!==edge);
        this.incomingEdgeMap.set(edge.target,newIncoming);

    }


    /**
     * Inserts a node into an edge. This replaced the edge with two new edges which pass through the node.
     * @param {*} node 
     * @param {*} edge 
     */
    insertNode(node,edge){
        if(!this.nodeMap.has(node.id)){
            this.addNode(node)
        }
        this.drawEdge(edge.source.id,node.id);
        this.drawEdge(node.id,edge.target.id);
        this.removeEdge(edge)
    }

    /**
     * A function to return a sub graph given an arrary of nodes.
     * @param {array} nodes - An array of nodes
     * @param {*} options - an optional object with filterEdges:function() that filters the edges used in the traversal
     * @returns {*} A graph object including the provided nodes and edges linking the node. If there is no path between all nodes the 
     * object will be empty 
     */
    getSubGraph(nodes,options={filterEdges:(e)=>true}){
        // check there is a path between all nodes
        // const preorder= [...this.preorder(nodes[0])];
        // if(nodes.some(n=>preorder.indexOf(n)===-1)){ 
        //     // If there is at least 1 node not hit in the traversal
        //     return new Graph();
        // }
        // const edges = nodes.map(n=>[...this.getOutgoingEdges(n).filter(e=>options.filterEdges(e)).filter(e=>nodes.indexOf(e.target)>-1),
        //                             ...this.getIncomingEdges(n).filter(e=>options.filterEdges(e)).filter(e=>nodes.indexOf(e.source)>-1)]);
        // const uniqueEdges = [...new Set(edges)];
        // const subGraph = new Graph();
        
        
        // return new Graph();

        // nodes,uniqueEdges)
       
    }

        /**
     * A function returning 
     * @param {*} nodes - An array of nodes
     * @param {*} options - an optional object with filterEdges:function() that filters the edges used in the traversal
     * @returns {*} 
     * Not yet implimented. Should each path be a sub-graph?
     */
    getPaths(node1,node2,options={filterEdges:(e)=>true}){
        // check there is a path between all nodes
        throw new Error("Not yet implimented");

       
    }

// -----------  Methods rejigged from figtree.js tree object -----------------------------
    /**
     * Reverses the order of the children of the given node. If 'recursive=true' then it will
     * descend down the subtree reversing all the sub nodes.
     *
     * @param node
     * @param recursive
     */
    // add options with edgeFilter callback
    rotate(node, options={recursive:false}) {
        const nodesToVisit = [...this.preorder(node)];
        const outGoingEdges=this.getOutgoingEdges(node);

            if (options.recursive) {
                for (const n of nodesToVisit) {
                    //Needs to avoid circulare loops 
                    const nOutGoingEdges=this.getOutgoingEdges(n);
                    nOutGoingEdges.reverse();
                }
            }else{
                outGoingEdges.reverse();

            }
        };

    /**
     * Sorts the child branches of each node in order of increasing or decreasing number
     * of tips. This operates recursively from the node given.
     *
     * @param node - the node to start sorting from
     * @param {boolean} increasing - sorting in increasing node order or decreasing?
     * @returns {number} - the number of tips below this node
     */
    order(node, increasing) {
        // // orderNodes.call(this, node, increasing, this.treeUpdateCallback);
        // orderNodes.call(this, node,increasing);
        // // this.treeUpdateCallback();
    }


    /**
     * A generator function that returns the nodes in a pre-order traversal. Starting at 
     * node. An optional options objects can be used to select which edges are used in the traversal
     * @param {*} node 
     * @param {object} options - an optional object with filterEdges:function() that filters the edges used in the traversal
     * @returns {IterableIterator<IterableIterator<*|*>>}
     */
    *preorder(node) {
        // We have to mark nodes as visited since it is possible to cycle back
        this.edgeList.forEach(e=>e.visited=false);
        this.nodeList.forEach(n => n.visited=false);
        const self = this;
        const traverse = function *(node){
            yield node;
            const edges = self.getEdges(node).filter(e=>self.acyclicSelector(e));
            // don't need all this if using acyclic edges
            if(edges.length>0){
                for(const edge of edges){
                    if(!edge.visited){
                        let nextNode;
                        if(node===edge.source){
                            nextNode = edge.target;
                        }else{
                            nextNode=edge.source;
                        }
                        if(!nextNode.visited){
                            edge.visited=true;
                            yield* traverse(nextNode);
                        }else{
                            edge.visited=true; // technically a back edge
                        }
                    }
                }
            }
        };
        yield* traverse(node);
        this.edgeList.forEach(e=> delete e["visited"]);
        this.nodeList.forEach(n => delete n["visited"]);
    }

    /**
     * A generator function that returns the nodes in a post-order traversal. Starting at 
     * node. An optional options objects can be used to select which edges are used in the traversal
     * @param {*} node 
     * @param {object} options - an optional object with filterEdges:function() that filters the edges used in the traversal
     * @returns {IterableIterator<IterableIterator<*|*>>}
     */
    *postorder(node) {
        // We have to mark nodes as visited since it is possible to cycle back
        this.edgeList.forEach(e=>e.visited=false);
        this.nodeList.forEach(n => n.visited=false);
        const self=this;
        const traverse = function *(node){
            const edges = self.getEdges(node).filter(e=>self.acyclicSelector(e));
            // don't need all this if using acyclic edges
            if(edges.length>0){
                for(const edge of edges){
                    if(!edge.visited){
                        let nextNode;
                        if(node===edge.source){
                            nextNode = edge.target;
                        }else{
                            nextNode=edge.source;
                        }
                        if(!nextNode.visited){
                            edge.visited=true;
                            yield* traverse(nextNode);
                        }else{
                            edge.visited=true; // technically a back edge
                        }
                    }
                }  
            }
            yield node;

        };
        yield* traverse(node);
        this.edgeList.forEach(e=> delete e["visited"]);
        this.nodeList.forEach(n => delete n["visited"]);
    }

}
/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

/**
 * A private recursive function that rotates nodes to give an ordering.
 * @param node
 * @param increasing
 * @param callback an optional callback that is called each rotate
 * @returns {number}
 */
function orderNodes(node, increasing, callback = null) {
    // const factor = increasing ? 1 : -1;
    // let count = 1;
    // const pathsOut=this.getOutgoingEdges(node);
    // if (pathsOut.length>0) {
    //     const counts = new Map();
    //     for (const child of pathsOut.map(e=>e.target) ) {
    //         const value = orderNodes.call(this,child, increasing, callback);
    //         counts.set(child, value);
    //         count += value;
    //     }
    //     console.log(counts)
    //     pathsOut.sort((a, b) => {
    //         return (counts.get(a.target) - counts.get(b.target)) * factor
    //     });

    //     if (callback) callback();
    // } else {
    //     count = 1
    // }
    // return count;
}

