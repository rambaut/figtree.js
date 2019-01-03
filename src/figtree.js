import {Tree} from './tree.js';

/**
 * Updates the tree when it has changed
 * @param svgSelection
 * @param tree
 * @param scales
 */
function update(svgSelection, tree, scales) {

    // get new positions
    positionNodes(tree);

    const makeLinePath = d3.line()
        .x(d => scales.x(d.height))
        .y(d => scales.y(d.width))
        .curve(d3.curveStepBefore);

    // update edges
    svgSelection.selectAll('.branch')
        .data(tree.nodes.filter(n=>n.parent).map(n=> {
                return( {target:n,values:[{height:n.parent.height,width:n.parent.width},
                            {height:n.height,width:n.width}
                        ]}
                )}),
            n => n.target.id)
        .transition()
        .duration(500)
        .attr("d", edge => makeLinePath(edge.values))

    //update nodes
    svgSelection.selectAll('g')
        .data(tree.nodes, node => node.id)
        .transition()
        .duration(500)
        .attr("transform", d => {
            return `translate(${scales.x(d.height)}, ${scales.y(d.width)})`;
        });
}

/**
 * Lays out the tree
 * @param tree
 */
function positionNodes(tree){
    //adding string id so we can id the nodes and branches and keep them consistent during transitions
    tree.nodeList.forEach( (node, index) => node.id = `node ${index}`)

    // external nodes get assigned height in 0-1.
    // external nodes are taken from the nodelist which is preorder traversal
    const externalNodeCount = tree.externalNodes.length
    const maxRootToTip = d3.max([...tree.rootToTipLengths()]);

    // tree.externalNodes relies on the nodeList which is set when the object is constructed and does not update with modifications
    // Here we get the order based on a current traversal
    const externalNodes= tree.externalNodes.sort( (a,b)=> {
        let postOrder = [...tree.postorder()];
        return postOrder.indexOf(a) - postOrder.indexOf(b)
    });

    for(const [i,node] of externalNodes.entries()){
        //  x and y are in [0,1]
        node.height = tree.rootToTipLength(node)/maxRootToTip; //Node height
        node.width = i/externalNodeCount; // Other axis width?
    }

    // internal nodes get the mean height of their children
    for(const node of [...tree.postorder()]){
        if(node.children){
            node.height = tree.rootToTipLength(node) / maxRootToTip;
            node.width = d3.mean(node.children, kid => kid.width);
        }
    }
}

/**
 * Adds node circles
 * @param svgSelection
 * @param tree
 * @param scales
 */
function addNodes(svgSelection, tree, scales) {
    var node = svgSelection.selectAll('g')
        .data(tree.nodes, node => node.id ) // assign the key for continuity during transitions
        .enter().append("g")
        .attr("id", d => d.id )
        .attr("transform", d => {
            return `translate(${scales.x(d.height)}, ${scales.y(d.width)})`;
        });

    node.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 6)
        .attr("class", d => { // assign classes for styling later
            return !d.children ? ' node external-node' : ' node internal-node';
        });

    node.append("text")
        .attr("class", "node-label")
        .attr("text-anchor", "left")
        .attr("dx", 0)
        .attr("dy", 0)
        .text(d => d.name );
}

/**
 * Adds branch lines
 * @param svgSelection
 * @param tree
 * @param scales
 */
function addBranches(svgSelection, tree, scales){
    const makeLinePath = d3.line()
        .x(d => scales.x(d.height))
        .y(d => scales.y(d.width))
        .curve(d3.curveStepBefore);

    svgSelection.selectAll('.line')
        .data(tree.nodes.filter(n=>n.parent).map(n=> {
                return( {target:n,values:[{height:n.parent.height,width:n.parent.width},
                            {height:n.height,width:n.width}
                        ]}
                );
            }),
            n => n.target.id)
        .enter()
        .append('path')
        .attr('class', 'line branch')
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width',2)
        .attr('id',edge=>edge.target.id)
        .attr("d", edge => makeLinePath(edge.values));

}

/**
 * Callback for mouseover highlighting of branches
 * @param svgSelection
 */
export function hilightBranch(svgSelection){
    svgSelection.selectAll('.branch').on("mouseover", function(d,i){
        d3.select(this).attr('stroke-width', 5);
    })
    svgSelection.selectAll('.branch').on("mouseout", function(d,i){
        d3.select(this).attr('stroke-width', 2);
    });
}

/**
 * Callback for mouseover highlighting of internal nodes
 * @param svgSelection
 */
export function hilightInternalNode(svgSelection){
    svgSelection.selectAll('.internal-node').on("mouseover", function(d,i) {
        d3.select(this).attr('r', '8');
    })
    svgSelection.selectAll('.internal-node').on("mouseout", function(d,i) {
        d3.select(this).attr('r', '6');
    });


}

/**
 * Callback to reroot tree on a click of a branch
 * @param svgSelection
 * @param tree
 * @param scales
 */
export function reRootOnBranch(svgSelection, tree, scales){
    svgSelection.selectAll('.branch').on('click', (selectedBranch)=> {
        tree.reroot(selectedBranch.target)
        update(svgSelection,tree,scales);
    })
}

/**
 * Callback to rotate on a click of a node
 * @param svgSelection
 * @param tree
 * @param scales
 */
export function rotateAtNode(svgSelection, tree,scales){
    svgSelection.selectAll('.internal-node').on('click', (selectedNode)=> {
        tree.rotate(selectedNode)
        update(svgSelection,tree,scales);
    })
}

export function drawTree(svg, newickString, margins, ...callBacks) {
    const tree = Tree.parseNewick(newickString);

    // get the size of the svg we are drawing on
    const width = svg.getBoundingClientRect().width;
    const height = svg.getBoundingClientRect().height;

    //Assign the node positions on a scale of 0-1
    positionNodes(tree);
    //remove the tree if it is there already

    d3.select(svg).select('g').remove()
    // add a group which will containt the new tree
    d3.select(svg).append('g')
        .attr('transform',`translate(${margins.left},${margins.top})`);
    //to save on writing later
    const svgSelection = d3.select(svg).select('g')
    // create the scales
    const xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([margins.left, width-margins.right]);

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([margins.bottom, height-margins.top]);
    //create otherstuff
    const scales ={x:xScale,y:yScale};

    addBranches(svgSelection,tree,scales);

    addNodes(svgSelection,tree,scales);

    // extra parameters are ignored if not required by the callback
    for(const callback of [...callBacks]){
        callback(svgSelection,tree,scales)
    }
}
