'use strict';

class Tree {

    // The constructor takes an object for the root node and then flattens
    // this to an array to allow iteration.
    constructor(rootNode = {}) {
        this.root = rootNode;

        this.nodeList = [...this.preorder()];
    };

    get rootNode() {
        return this.root;
    };

    get nodes() {
        return [...this.nodeList];
    };

    get externalNodes() {
        return this.nodes.filter((node) => !node.children);
    };

    get internalNodes() {
        return this.nodes.filter((node) => node.children );
    };

    // A generator function that returns the nodes in a pre-order traversal
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

    // A generator function that returns the nodes in a post-order traversal
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

    // An instant method to return a Newick format string for the Tree. Can be called without a parameter to
    // start at the root node. Providing another node will generate a subtree. Labels and branch lengths are
    // included if available.
    toNewick(node = null) {
        if (node === null) {
            return this.toNewick(this.rootNode);
        }
        return (node.children ? `(${node.children.map(child => this.toNewick(child)).join(",")})${node.label ? node.label : ""}` : node.name) + (node.length ? `:${node.length}` : "");
    };

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

    rootToTipLength(node) {
        let length = 0.0;
        while (node.parent) {
            length += node.length;
            node = node.parent;
        }
        return length;
    }

    rootToTipLengths() {
        return this.externalNodes.map((tip) => this.rootToTipLength(tip));
    }

    // A class method to create a Tree instance from a Newick format string (potentially with node
    // labels and branch lengths). Taxon labels should be quoted (either " or ') if they contain whitespace
    // or any of the tree definitition characters '(),:;' - the quotes (and any whitespace immediately within)
    // will be removed.
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

// some test code (to be moved to a test file)
const newickString = `((((((virus1:0.1 ,virus2:0.12):0.08,(virus3:0.011,virus4:0.0087):0.15):0.03,virus5:0.21):0.2,(virus6:0.45,virus7:0.4):0.02):0.1,virus8:0.4):0.1,(virus9:0.04,virus10:0.03):0.6);`;

const tree = Tree.parseNewick(newickString);

const newNewick = tree.toNewick();

console.log(newickString);
console.log(newNewick);
console.log();
console.log(`All nodes: ${tree.nodes.length}`);
console.log(`External nodes: ${tree.externalNodes.length}`);
console.log(`External nodes: ${tree.externalNodes.map(node => node.name).join(", ")}`);
console.log(`Internal nodes: ${tree.internalNodes.length}`);

console.log(`All nodes: ${[...tree.preorder()].map(node => node.name ? node.name : "node").join(", ")}`);
console.log(`All nodes: ${[...tree.postorder()].map(node => node.name ? node.name : "node").join(", ")}`);

tree.rotate(tree.rootNode, true);
console.log(`Rotated: ${tree.toNewick()}`);

tree.order(tree.rootNode, true);
console.log(`Increasing: ${tree.toNewick()}`);

tree.order(tree.rootNode, false);
console.log(`Decreasing: ${tree.toNewick()}`);

tree.reroot(tree.externalNodes[0]);
console.log(`Rerooted: ${tree.toNewick()}`);

const tree2 = Tree.parseNewick("(((tip1:0.1,tip2:0.2)x:0.3,tip3:0.4)y:0.5,(tip4:0.6,tip5:0.7)z:0.8)r;");
console.log(`OriginL: ${tree2.toNewick()}`);

tree2.reroot(tree2.externalNodes[0]);
console.log(`Rerooted: ${tree2.toNewick()}`);

