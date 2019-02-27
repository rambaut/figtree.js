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
        const graph = new Graph(nodes,edges);
       
        const node = graph.getNode("node1")
        const postOrder=[...graph.postorder(node)]
         expect(postOrder).to.eql([graph.getNode("node2"),
         graph.getNode("node4"),
         graph.getNode("node3"),
         graph.getNode("node1")]);
    });
    it("should yeild preorder ", () => {
      const nodes=[{id:"node1"},{id:"node2"},{id:"node3"},{id:"node4"}]
      const edges =[{source:"node1",target:"node2"},
                  {source:"node1",target:"node3"},
                  {source:"node3",target:"node4"}
              ];
      const graph = new Graph(nodes,edges);

      const node = graph.getNode("node1");
      const preorder=[...graph.preorder(node)]
       expect(preorder).to.eql([graph.getNode("node1"),
       graph.getNode("node2"),
       graph.getNode("node3"),
       graph.getNode("node4")])
  });

  it("should rotate", ()=>{
    const nodes=[{id:"node1"},{id:"node2"},{id:"node3"},{id:"node4"}]
    const edges =[{source:"node1",target:"node2"},
                {source:"node1",target:"node3"},
                {source:"node3",target:"node4"}
            ];
    const graph = new Graph(nodes,edges);
    const node = graph.getNode("node1");
    console.log(graph.getOutgoingEdges(node).map(e=>e.target.id));
    graph.rotate(node);
    console.log(graph.getOutgoingEdges(node).map(e=>e.target.id));
    const preorder=[...graph.preorder(node)]
    expect(preorder).to.eql([graph.getNode("node1"),
       graph.getNode("node3"),
       graph.getNode("node4"),
       graph.getNode("node2")])
    
  });
  it("should get sub graph")//,()=>{
  //   const nodes=[{id:"node1"},{id:"node2"},{id:"node3"},{id:"node4"}]
  //   const edges =[{source:"node1",target:"node2"},
  //               {source:"node1",target:"node3"},
  //               {source:"node3",target:"node4"}
  //           ];
  //   const graph = new Graph(nodes,edges);

  //   const subgraph=graph.getSubGraph(nodes.map(n=>graph.getNode(n.id)))

  //   expect(graph.nodes).to.eql(subgraph.nodes)
  //   expect(graph.edges).to.eql(subgraph.edges)

  // }
  // )

});
describe("Basic operations",()=>{
  it("should add node",()=>{
    const nodes=[{id:"node1"},{id:"node2"},{id:"node3"},{id:"node4"}]
    const edges =[{source:"node1",target:"node2"},
                  {source:"node1",target:"node3"},
                  {source:"node3",target:"node4"}
              ];
      const graph = new Graph(nodes,edges);

      const node = graph.getNode("node1");
      const edge = graph.getOutgoingEdges(node)[0];
      graph.insertNode({id:"newNode"},edge);
      const preorder=[...graph.preorder(node)]
      expect(preorder).to.eql([graph.getNode("node1"),
      graph.getNode("node3"),
      graph.getNode("node4"),
      graph.getNode("newNode"),
      graph.getNode("node2")])

  });

  it("Should remove node",()=>{
    const nodes=[{id:"node1"},{id:"node2"},{id:"node3"},{id:"node4"}]
    const edges =[{source:"node1",target:"node2"},
                  {source:"node1",target:"node3"},
                  {source:"node3",target:"node4"}
              ];
      const graph = new Graph(nodes,edges);

      graph.removeNode(graph.getNode("node3"))
      expect(graph.nodes.map(n=>n.id)).to.have.all.members(["node1","node2","node4"])
      expect(graph.edges.length).to.equal(1)
  })
  })
