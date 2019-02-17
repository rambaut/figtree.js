"use strict";

/** @module layouts */

/**
 * Lays out the tree in a standard rectangular format.
 *
 * This function is passed to the FigTree constructor and is used to layout the nodes of the tree.
 * @param tree
 */
export function rectangularLayout(tree) {

    // get the nodes in post-order
    const nodes = [...tree.postorder()];

    // first set the 'width' of the external nodes
    nodes.filter(n => !n.children).forEach((node, index) => (node.width = index));

    nodes.forEach((node) => {
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
 * Lays out the tree in a directional transmission tree format in which the direction of transmission
 * is shown.
 *
 * This function is passed to the FigTree constructor and is used to layout the nodes of the tree.
 * @param tree The tree passed by FigTree when this function is called.
 */
export function transmissionLayout(tree) {

    // get the nodes in post-order
    const nodes = [...tree.postorder()];

    // first set the 'width' of the external nodes
    nodes.filter(n => !n.children).forEach((node, index) => (node.width = index));

    nodes.forEach((node) => {
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

