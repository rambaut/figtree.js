import '@babel/polyfill'
import { expect } from "chai"
import { Graph } from '../src/Graph';



describe("traverse graph", () => {
      it("should yeild postOrder ", () => {
        const nodes=[{id:"node1"},{id:"node2"},{id:"node3"},{id:"node4"}]
        const edges =[{source:"node1",target:"node2"},
                    {source:"node1",target:"node3"},
                    {source:"node3",target:"node4"}
                ];
        const graph = new Graph();
        nodes.forEach(n=>graph.addNode(n));
        edges.forEach(e=>{
          const edge = {source:graph.getNodesFromKeyValuePair("id",e.source)[0],target:graph.getNodesFromKeyValuePair("id",e.target)[0]}
          graph.makeEdge(edge.source,edge.target);
        });
        const node = graph.getNodesFromKeyValuePair("id","node1")[0];
        const postOrder=[...graph.postorder(node)]
         expect(postOrder).to.eql([graph.getNodesFromKeyValuePair('id',"node2")[0],
         graph.getNodesFromKeyValuePair('id',"node4")[0],
         graph.getNodesFromKeyValuePair('id',"node3")[0],
         graph.getNodesFromKeyValuePair('id',"node1")[0]])
    });
    it("should yeild preorder ", () => {
      const nodes=[{id:"node1"},{id:"node2"},{id:"node3"},{id:"node4"}]
      const edges =[{source:"node1",target:"node2"},
                  {source:"node1",target:"node3"},
                  {source:"node3",target:"node4"}
              ];
      const graph = new Graph();
      nodes.forEach(n=>graph.addNode(n));
      edges.forEach(e=>{
        const edge = {source:graph.getNodesFromKeyValuePair("id",e.source)[0],target:graph.getNodesFromKeyValuePair("id",e.target)[0]}
        graph.makeEdge(edge.source,edge.target);
      });
      const node = graph.getNodesFromKeyValuePair("id","node1")[0];
      const preorder=[...graph.preorder(node)]
       expect(preorder).to.eql([graph.getNodesFromKeyValuePair('id',"node1")[0],
       graph.getNodesFromKeyValuePair('id',"node2")[0],
       graph.getNodesFromKeyValuePair('id',"node3")[0],
       graph.getNodesFromKeyValuePair('id',"node4")[0]])
  });
  it("should add node",()=>{
    const nodes=[{id:"node1"},{id:"node2"},{id:"node3"},{id:"node4"}]
    const edges =[{source:"node1",target:"node2"},
                  {source:"node1",target:"node3"},
                  {source:"node3",target:"node4"}
              ];
      const graph = new Graph();
      nodes.forEach(n=>graph.addNode(n));
      edges.forEach(e=>{
        const edge = {source:graph.getNodesFromKeyValuePair("id",e.source)[0],target:graph.getNodesFromKeyValuePair("id",e.target)[0]}
        graph.makeEdge(edge.source,edge.target);
      });
      const node = graph.getNodesFromKeyValuePair("id","node1")[0];
      const edge = graph.getOutgoingEdges(node)[0];
      graph.insertNode({id:"newNode"},edge);
      const preorder=[...graph.preorder(node)]
      expect(preorder).to.eql([graph.getNodesFromKeyValuePair('id',"node1")[0],
      graph.getNodesFromKeyValuePair('id',"node3")[0],
      graph.getNodesFromKeyValuePair('id',"node4")[0],
      graph.getNodesFromKeyValuePair('id',"newNode")[0],
      graph.getNodesFromKeyValuePair('id',"node2")[0]])

  });
  })