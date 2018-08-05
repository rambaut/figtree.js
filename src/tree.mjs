/** @module tree */

/**
 * The Tree class
 */
export class Tree {

    /**
     * The constructor takes an object for the root node. The tree structure is
     * defined as nested node objects.
     *
     * @constructor
     * @param {object} rootNode - The root node of the tree as an object.
     */
    constructor(rootNode = {}) {
        this.root = rootNode;

        this.nodeList = [...this.preorder()];
    };

    /**
     * Gets the root node of the Tree
     *
     * @returns {Object|*}
     */
    get rootNode() {
        return this.root;
    };

    /**
     * Gets an array containing all the node objects
     *
     * @returns {*[]}
     */
    get nodes() {
        return [...this.nodeList];
    };

    /**
     * Gets an array containing all the external node objects
     *
     * @returns {*}
     */
    get externalNodes() {
        return this.nodes.filter((node) => !node.children);
    };

    /**
     * Gets an array containing all the internal node objects
     *
     * @returns {*}
     */
    get internalNodes() {
        return this.nodes.filter((node) => node.children );
    };

    /**
     * A generator function that returns the nodes in a pre-order traversal.
     *
     * @returns {IterableIterator<IterableIterator<*|*>>}
     */
    *preorder() {
        const traverse = function *(node) {
            if (node.children) {
                for (const child of node.children) {
                    yield* traverse(child);
                }
            }
            yield node;
        };

        yield* traverse(this.root);
    }

    /**
     * A generator function that returns the nodes in a post-order traversal
     *
     * @returns {IterableIterator<IterableIterator<*|*>>}
     */
    *postorder() {
        const traverse = function *(node) {
            yield node;
            if (node.children) {
                for (const child of node.children) {
                    yield* traverse(child);
                }
            }
        };

        yield* traverse(this.root);
    }

    /**
     * An instance method to return a Newick format string for the Tree. Can be called without a parameter to
     * start at the root node. Providing another node will generate a subtree. Labels and branch lengths are
     * included if available.
     *
     * @param {object} node - The node of the tree to be written (defaults as the rootNode).
     * @returns {string}
     */
    toNewick(node = this.rootNode) {
        return (node.children ? `(${node.children.map(child => this.toNewick(child)).join(",")})${node.label ? node.label : ""}` : node.name) + (node.length ? `:${node.length}` : "");
    };

    /**
     * Re-roots the tree at the midway point on the branch above the given node.
     *
     * @param {object} node - The node to be rooted on.
     */
    reroot(node) {
        if (!node.parent || !node.parent.parent) {
            // the node is the root or a child of the root - nothing to do
            return;
        }

        const rootLength = this.rootNode.children[0].length + this.rootNode.children[1].length;

        let parent = node.parent;
        let ancestor = node;

        const rootChild1 = node;
        const rootChild2 = parent;

        while (parent.parent) {
            parent.children = parent.children.filter((child) => child !== ancestor);
            if (parent.parent === this.rootNode) {
                const sibling = parent.parent.children.find((child) => child !== parent);
                parent.children.push(sibling);
                sibling.length = rootLength;
            } else {
                [parent.length, parent.parent.length] = [parent.parent.length, parent.length];
                parent.children.push(parent.parent);
            }
            ancestor = parent;
            parent = parent.parent;
        }

        // reuse the root node as root
        this.rootNode.children = [rootChild1, rootChild2];
        rootChild2.length = rootChild1.length = rootChild1.length * 0.5;

        // connect all the children to their parents
        this.internalNodes.forEach((node) => {
            node.children.forEach( (child) => child.parent = node );
        })
    };

    /**
     * Reverses the order of the children of the given node. If 'recursive=true' then it will
     * descend down the subtree reversing all the sub nodes.
     *
     * @param node
     * @param recursive
     */
    rotate(node, recursive = false) {
        if (node.children) {
            if (recursive) {
                for (const child of node.children) {
                    this.rotate(child, recursive);
                }
            }
            node.children.reverse();
        }
    };

    /**
     * Sorts the child branches of each node in order of increasing or decreasing number
     * of tips. This operates recursively from the node give.
     *
     * @param node - the node to start sorting from
     * @param {boolean} increasing - sorting in increasing node order or decreasing?
     * @returns {number} - the number of tips below this node
     */
    order(node, increasing = true) {
        const factor = increasing ? 1 : -1;
        let count = 0;
        if (node.children) {
            const counts = new Map();
            for (const child of node.children) {
                const value = this.order(child, increasing);
                counts.set(child, value);
                count += value;
            }
            node.children.sort((a, b) => (counts.get(a) - counts.get(b) * factor));
        } else {
            count = 1
        }
        return count;
    };

    /**
     * Gives the distance from the root to a given tip (external node).
     * @param tip - the external node
     * @returns {number}
     */
    rootToTipLength(tip) {
        let length = 0.0;
        let node = tip;
        while (node.parent) {
            length += node.length;
            node = node.parent;
        }
        return length;
    }

    /**
     * Returns an array of root-to-tip distances for each tip in the tree.
     * @returns {*}
     */
    rootToTipLengths() {
        return this.externalNodes.map((tip) => this.rootToTipLength(tip));
    }

    /**
     * A class method to create a Tree instance from a Newick format string (potentially with node
     * labels and branch lengths). Taxon labels should be quoted (either " or ') if they contain whitespace
     * or any of the tree definitition characters '(),:;' - the quotes (and any whitespace immediately within)
     * will be removed.
     * @param newickString - the Newick format tree as a string
     * @returns {Tree} - an instance of the Tree class
     */
    static parseNewick(newickString) {
        const tokens = newickString.split(/\s*('[^']+'|"[^"]+"|;|\(|\)|,|:)\s*/);

        let level = 0;
        let currentNode = null;
        let nodeStack = [];
        let labelNext = false;
        let lengthNext = false;

        for (const token of tokens.filter(token => token.length > 0)) {
            // console.log(`Token ${i}: ${token}, level: ${level}`);
            if (token === '(') {
                // an internal node

                if (labelNext) {
                    // if labelNext is set then the last bracket has just closed
                    // so there shouldn't be an open bracket.
                    throw new Error("expecting a comma");
                }

                let node = {
                    level: level,
                    parent: currentNode,
                    children: []
                };
                level += 1;
                if (currentNode) {
                    nodeStack.push(currentNode);
                }
                currentNode = node;

            } else if (token === ',') {
                // another branch in an internal node

                labelNext = false; // labels are optional
                if (lengthNext) {
                    throw new Error("branch length missing");
                }

                let parent = nodeStack.pop();
                parent.children.push(currentNode);

                currentNode = parent;
            } else if (token === ')') {
                // finished an internal node

                labelNext = false; // labels are optional
                if (lengthNext) {
                    throw new Error("branch length missing");
                }

                // the end of an internal node
                let parent = nodeStack.pop();
                parent.children.push(currentNode);

                level -= 1;
                currentNode = parent;

                labelNext = true;
            } else if (token === ':') {
                labelNext = false; // labels are optional
                lengthNext = true;
            } else if (token === ';') {
                // end of the tree, check that we are back at level 0
                if (level > 0) {
                    throw new Error("unexpected semi-colon in tree")
                }
                break;
            } else {
                // not any specific token so may be a label, a length, or an external node name
                if (lengthNext) {
                    currentNode.length = parseFloat(token);
                    lengthNext = false;
                } else if (labelNext) {
                    currentNode.label = token;
                    labelNext = false;
                } else {
                    // an external node
                    if (!currentNode.children) {
                        currentNode.children = []
                    }

                    let name = token;
                    // remove any quoting and then trim whitespace
                    if (name.startsWith("\"") || name.startsWith("'")) {
                        name = name.substr(1);
                    }
                    if (name.endsWith("\"") || name.endsWith("'")) {
                        name = name.substr(0, name.length - 1);
                    }

                    const externalNode = {
                        name: name.trim(),
                        parent: currentNode
                    };

                    if (currentNode) {
                        nodeStack.push(currentNode);
                    }
                    currentNode = externalNode;
                }
            }
        }

        if (level > 0) {
            throw new Error("the brackets in the newick file are not balanced")
        }

        return new Tree(currentNode);
    };
}
