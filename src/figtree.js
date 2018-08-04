'use strict';

class Tree {

    // The constructor takes an object for the root node and then flattens
    // this to an array to allow iteration.
    constructor(rootNode = {}) {
        this.root = rootNode;

        this.nodeList = [];

        // do a pre-order traversal and add nodes to nodeList (external ones first):
        const adopt = function(node, nodeList) {
            if (node.children) {
                node.children.forEach( (node) => adopt(node, nodeList) );
            }
            nodeList.push(node);
        };

        adopt(this.root, this.nodeList);
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

    };

    rotate(node, recursive = false) {

    };

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
                    currentNode.length = token;
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
const newickString = `(((((( " virus 1'(test) " :0.1 ,virus2:0.12):0.08,(virus3:0.011,virus4:0.0087):0.15):0.03,virus5:0.21):0.2,(virus6:0.45,virus7:0.4):0.02):0.1,virus8:0.4):0.1,(virus9:0.04,virus10:0.03):0.6);`;

let tree = Tree.parseNewick(newickString);

const newNewick = tree.toNewick();

console.log(newickString);
console.log(newNewick);
console.log();
console.log(`All nodes: ${tree.nodes.length}`);
console.log();
console.log(`External nodes: ${tree.externalNodes.length}`);
console.log(`External nodes: ${tree.externalNodes.map(node => node.name).join(", ")}`);
console.log();
console.log(`Internal nodes: ${tree.internalNodes.length}`);



