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

    const externalNodeCount = tree.externalNodes.length
    const maxRootToTip = d3.max([...tree.rootToTipLengths()]);

    // update the scales' domains
    scales.x.domain([0, maxRootToTip]);
    scales.y.domain([0, externalNodeCount - 1]);

    const xAxis = d3.axisBottom(scales.x)
        .tickArguments([5, "d"]);

    svgSelection.select("#x-axis")
        .transition()
        .duration(500)
        .call(xAxis);

    const makeLinePath = d3.line()
        .x(d => scales.x(d.height))
        .y(d => scales.y(d.width))
        .curve(d3.curveStepBefore);


    svgSelection.selectAll('.branch')
        .transition()
        .duration(500)
        .attr("d", edge => makeLinePath(edge.location))

    //update nodes
    svgSelection.selectAll('.node')
        .transition()
        .duration(500)
        .attr("transform", d => {
            d.x = scales.x(d.height);
            d.y = scales.y(d.width);
            return `translate(${scales.x(d.height)}, ${scales.y(d.width)})`;
        });

    //update labels
    svgSelection.selectAll('.support')
        .transition()
        .duration(250)
        .attr("dy", d => {
            if (d.parent && d.parent.children[0] === d)
                return "-8";
            else
                return "8";
        })
        .delay(250)
        .attr("alignment-baseline", d => {
            if (d.parent && d.parent.children[0] === d)
                return "bottom";
            else
                return "hanging";
        });
}

/**
 * Lays out the tree
 * @param tree
 */
function positionNodes(tree){

    // get the nodes in post-order
    const nodes = [...tree.postorder()];

    // first set the 'width' of the external nodes
    nodes.filter(n => !n.children).forEach( (node, index) => (node.width = index) );

    nodes.forEach( (node, index) => {
        //adding string id so we can id the nodes and branches and keep them consistent during transitions
        node.id = `node_${index}`;
        node.height = tree.rootToTipLength(node); //Node height

        // internal nodes get the mean width of their children
        if (node.children) {
            node.width = d3.mean(node.children, child => child.width);
        }
    });

    nodes.filter(n => n.parent)
        .forEach(n => {
            n.location = [{
                    height: n.parent.height,
                    width: n.parent.width
                }, {
                    height: n.height,
                    width: n.width
                }]
        });
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
        .attr("id", d => (d.name ? d.name : d.id) )
        .attr("class", d => `node ${!d.children ? ' external-node' : ' internal-node'}`)
        .attr("transform", d => {
            return `translate(${scales.x(d.height)}, ${scales.y(d.width)})`;
        });

    node.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 6)
        .attr("class", d => 'node-shape unselected');

    node.append("text")
        .attr("class", "node-label")
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle")
        .attr("dx", "12")
        .attr("dy", "0")
        .text(d => d.name );

    node.append("text")
        .attr("class", "node-label support")
        .attr("text-anchor", "end")
        .attr("dx", "-6")
        .attr("dy", d => {
            if (d.parent && d.parent.children[0] === d)
                return "-8";
            else
                return "8";
        })
        .attr("alignment-baseline", d => {
            if (d.parent && d.parent.children[0] === d)
                return "bottom";
            else
                return "hanging";
        })
        .text(d => d.label );
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

    const edges = tree.nodes.filter(n => n.location)

    svgSelection.selectAll('.line')
        .data(edges, n => n.id)
        .enter()
        .append('path')
        .attr('class', 'branch')
        .attr('id', edge => edge.id)
        .attr("d", edge => makeLinePath(edge.location));

}

/**
 * Add axis
 * @param svgSelection
 * @param tree
 * @param scales
 */
function addAxis(svgSelection, tree, scales, margins) {
    const xAxis = d3.axisBottom(scales.x)
        .tickArguments([5, "f"]);

    const xAxisWidth = scales.width - margins.left - margins.right;

    svgSelection.append("g")
        .attr("id", "x-axis")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${scales.height - margins.bottom + 5})`)
        .call(xAxis);

    svgSelection.append("g")
        .attr("id", "x-axis-label")
        .attr("class", "axis-label")
        .attr("transform", `translate(${margins.left}, ${scales.height - margins.bottom})`)
        .append("text")
        .attr("transform", `translate(${xAxisWidth / 2}, 35)`)
        .attr("alignment-baseline", "hanging")
        .style("text-anchor", "middle")
        .text("Divergence");
}

/**
 * Callback for mouseover highlighting of branches
 * @param svgSelection
 */
export function hilightBranch(svgSelection){
    svgSelection.selectAll('.branch').on("mouseover", function(d,i){
        d3.select(this).attr('class', 'branch hovered');
    })
    svgSelection.selectAll('.branch').on("mouseout", function(d,i){
        d3.select(this).attr('class', 'branch');
    });
}

/**
 * Callback for mouseover highlighting of internal nodes
 * @param svgSelection
 */
export function hilightInternalNode(svgSelection){
    svgSelection.selectAll('.internal-node').selectAll('.node-shape').on("mouseover", function(d,i) {
        d3.select(this).attr('class', 'node-shape hovered');
        d3.select(this).attr('r', '8');
    })
    svgSelection.selectAll('.internal-node').selectAll('.node-shape').on("mouseout", function(d,i) {
        d3.select(this).attr('class', 'node-shape');
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
    svgSelection.selectAll('.branch').on('click', function (selectedBranchTarget) {
        const x1 = scales.x(selectedBranchTarget.height);
        const x2 = scales.x(selectedBranchTarget.parent.height);
        const mx = d3.mouse(this)[0];
        const proportion = Math.max(0.0, Math.min(1.0, (mx - x2) / (x1 - x2)));
        tree.reroot(selectedBranchTarget, proportion);
        update(svgSelection,tree,scales);
    })
}

/**
 * Callback to rotate on a click of a node
 * @param svgSelection
 * @param tree
 * @param scales
 */
export function rotateAtNode(svgSelection, tree, scales){
    svgSelection.selectAll('.internal-node').on('click', (selectedNode)=> {
        tree.rotate(selectedNode)
        update(svgSelection, tree, scales);
    })
}

export function addLabels(svg, selection, text ) {
    d3.select(svg).selectAll(selection).on("mouseover", function() {
            let tooltip = document.getElementById("tooltip");
            tooltip.innerHTML = text;
            tooltip.style.display = "block";
            tooltip.style.left = d3.event.pageX + 10 + 'px';
            tooltip.style.top = d3.event.pageY + 10 + 'px';
        }
    );
    d3.select(svg).selectAll(selection).on("mouseout", function() {
        var tooltip = document.getElementById("tooltip");
        tooltip.style.display = "none";
    });
}

export function drawTree(svg, tree, margins, ...callBacks) {

    // get the size of the svg we are drawing on
    const width = svg.getBoundingClientRect().width;
    const height = svg.getBoundingClientRect().height;

    //Assign the node positions on a scale of 0-1
    positionNodes(tree);

    //remove the tree if it is there already
    d3.select(svg).select('g').remove();

    // add a group which will contain the new tree
    d3.select(svg).append('g')
        .attr('transform',`translate(${margins.left},${margins.top})`);

    //to save on writing later
    const svgSelection = d3.select(svg).select('g');

    const externalNodeCount = tree.externalNodes.length
    const maxRootToTip = d3.max([...tree.rootToTipLengths()]);

    // create the scales
    const xScale = d3.scaleLinear()
        .domain([0, maxRootToTip])
        .range([margins.left, width - margins.right]);

    const yScale = d3.scaleLinear()
        .domain([0, externalNodeCount - 1])
        .range([margins.top + 20, height - margins.bottom - 20]);

    //create otherstuff
    const scales ={x:xScale, y:yScale, width, height};

    addBranches(svgSelection, tree, scales);

    addNodes(svgSelection, tree, scales);

    addAxis(svgSelection, tree, scales, margins);

    // extra parameters are ignored if not required by the callback
    for(const callback of [...callBacks]){
        callback(svgSelection, tree, scales)
    }

    // const internal_node_text="This is an internal node - it is a putitive<br>common ancestor of the viruses to the right";
    // const external_node_text="This is an external or leaf node - it represents<br>a sampled, sequenced virus";
    // const branch_text="This is a branch - it represents an<br>evolutionary lineage joining two nodes";
    // const root_text="The root node - represents the most recent<br>common ancestor of the whole tree";
    //
    // addLabels(svgSelection, '.internal-node .node-shape', internal_node_text )
}
