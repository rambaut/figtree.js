/** @module layout */

/**
 * Lays out the tree in a standard rectangular format
 */
export function rectangularLayout(tree) {

    // get the nodes in post-order
    const nodes = [...tree.postorder()];

    // first set the 'width' of the external nodes
    nodes.filter(n => !n.children).forEach((node, index) => (node.width = index));

    nodes.forEach((node, index) => {
        //adding string id so we can id the nodes and branches and keep them consistent during transitions
        node.id = `node_${index}`;
        node.height = this.tree.rootToTipLength(node); //Node height

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
 * Lays out the tree in a directional transmission tree format
 */
export function transmissionLayout(tree) {

    // get the nodes in post-order
    const nodes = [...tree.postorder()];

    // first set the 'width' of the external nodes
    nodes.filter(n => !n.children).forEach((node, index) => (node.width = index));

    nodes.forEach((node, index) => {
        //adding string id so we can id the nodes and branches and keep them consistent during transitions
        node.id = `node_${index}`;
        node.height = this.tree.rootToTipLength(node); //Node height

        // internal nodes get the mean width of their children
        if (node.children) {
            node.width = node.children[0].width;
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

