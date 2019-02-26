import '@babel/polyfill'
import { expect } from "chai"
import { Graph } from '../src/Graph';


beforeEach('Setting up the initial graph', function(){

    const nodes=[{id:"node1"},{id:"node2"},{id:"node3"},{id:"node4"}]
    const edges =[{source:nodes[0],target:nodes[1]},
                {source:nodes[0],target:nodes[2]},
                {source:nodes[2],target:nodes[3]}
            ]
  });

describe("index test", () => {
    describe("read in graphs", () => {
      it("should print all graphs", () => {
        expect("Hello guys!").to.equal("Hello guys!")
      })
    })
  })