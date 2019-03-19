"use strict";

/** @module tree */

export const Type = {
    DISCRETE : Symbol("DISCRETE"),
    BOOLEAN : Symbol("BOOLEAN"),
    INTEGER : Symbol("INTEGER"),
    FLOAT: Symbol("FLOAT"),
    PROBABILITIES: Symbol("PROBABILITIES")
};

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
     * @param splitBranches - Whether to split each branch into two
     */
    constructor(rootNode = {}, splitBranches = false) {
        this.root = rootNode;

        if (splitBranches) {
            // split each branch into two, with a node of
            // degree two in the middle. This allows annotation
            // of half a branch.
            [...this.preorder()].forEach((node) => {
                if (node.parent) {
                    let splitNode = {
                        parent: node.parent,
                        children: [node],
                        length: node.length / 2.0,
                        annotations: {
                            midpoint: true
                        }
                    };
                    node.parent.children[node.parent.children.indexOf(node)] = splitNode;
                    node.parent = splitNode;
                    node.length = splitNode.length;
                }
            });
        }

        this.annotations = {};

        this.nodeList = [...this.preorder()];
        this.nodeList.forEach( (node, index) => {
            if (node.label && node.label.startsWith("#")) {
                // an id string has been specified in the newick label.
                node.id = node.label.substring(1);
            } else {
                node.id = `node_${index}`;
            }
            this.addAnnotations(node.annotations);
        });
        this.nodeMap = new Map(this.nodeList.map( (node) => [node.id, node] ));
        this.tipMap = new Map(this.externalNodes.map( (tip) => [tip.name, tip] ));


        // a callback function that is called whenever the tree is changed
        this.treeUpdateCallback = () => {};
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
     * @returns {*}
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
     * Returns the sibling of a node (i.e., the first other child of the parent)
     *
     * @param node
     * @returns {*}
     */
    getSibling(node) {
        if (!node.parent) {
            return null;
        }
        return node.parent.children.find((child) => child !== node);
    }

    /**
     * Returns a node from its id stored.
     *
     * @param id
     * @returns {*}
     */
    getNode(id) {
        return this.nodeMap.get(id);
    }

    /**
     * Returns an external node (tip) from its name.
     *
     * @param name
     * @returns {*}
     */
    getExternalNode(name) {
        return this.tipMap.get(name);
    }

    /**
     * A generator function that returns the nodes in a pre-order traversal.
     *
     * @returns {IterableIterator<IterableIterator<*|*>>}
     */
    *preorder() {
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
     * A generator function that returns the nodes in a post-order traversal
     *
     * @returns {IterableIterator<IterableIterator<*|*>>}
     */
    *postorder() {
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
     * A generator function that returns the nodes in a path to the root
     *
     * @returns {IterableIterator<IterableIterator<*|*>>}
     */
    static* pathToRoot(node) {
        while (node) {
            yield node;
            node = node.parent;
        }
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
     * @param proportion - proportion along the branch to place the root (default 0.5)
     */
    reroot(node, proportion = 0.5) {
        if (node === this.rootNode) {
            // the node is the root - nothing to do
            return;
        }

        const rootLength = this.rootNode.children[0].length + this.rootNode.children[1].length;

        if (node.parent !== this.rootNode) {
            // the node is not a child of the existing root so the root is actually changing

            let node0 = node;
            let parent = node.parent;

            let lineage = [ ];

            // was the node the first child in the parent's children?
            const nodeAtTop = parent.children[0] === node;

            const rootChild1 = node;
            const rootChild2 = parent;

            let oldLength = parent.length;

            while (parent.parent) {

                // remove the node that will becoming the parent from the children
                parent.children = parent.children.filter((child) => child !== node0);

                if (parent.parent === this.rootNode) {
                    const sibling = this.getSibling(parent);
                    parent.children.push(sibling);
                    sibling.length = rootLength;
                } else {
                    // swap the parent and parent's parent's length around
                    [parent.parent.length, oldLength] = [oldLength, parent.parent.length];

                    // add the new child
                    parent.children.push(parent.parent);
                }

                lineage = [parent, ...lineage];

                node0 = parent;
                parent = parent.parent;
            }

            // Reuse the root node as root...

            // Set the order of the children to be the same as for the original parent of the node.
            // This makes for a more visually consistent rerooting graphically.
            this.rootNode.children = nodeAtTop ? [rootChild1, rootChild2] : [rootChild2, rootChild1];

            // connect all the children to their parents
            this.internalNodes
                .forEach((node) => {
                    node.children.forEach((child) => {
                        child.parent = node;
                    })
                });

            const l = rootChild1.length * proportion;
            rootChild2.length = l;
            rootChild1.length = rootChild1.length - l;

        } else {
            // the root is staying the same, just the position of the root changing
            const l = node.length * (1.0 - proportion);
            node.length = l;
            this.getSibling(node).length = rootLength - l;
        }

        this.treeUpdateCallback();
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

        this.treeUpdateCallback();
    };

    /**
     * Sorts the child branches of each node in order of increasing or decreasing number
     * of tips. This operates recursively from the node given.
     *
     * @param node - the node to start sorting from
     * @param {boolean} increasing - sorting in increasing node order or decreasing?
     * @returns {number} - the number of tips below this node
     */
    order(node = this.rootNode, increasing = true) {
        // orderNodes.call(this, node, increasing, this.treeUpdateCallback);
        orderNodes.call(this, node, increasing);
        this.treeUpdateCallback();
    }

    lastCommonAncestor(node1, node2) {

        const path1 = [...Tree.pathToRoot(node1)];
        const path2 = [...Tree.pathToRoot(node2)];
      
        const sharedAncestors = path1.filter(n1=>path2.map(n2=>n2.id).indexOf(n1.id)>-1);
        const lastSharedAncestor = sharedAncestors.reduce((acc,curr)=>acc = acc.level>curr.level?acc:curr);
        return lastSharedAncestor;
      
    }

    pathLength(node1, node2) {

        let sum = 0;
        
        const mrca = this.lastCommonAncestor(node1,node2);
        for(let node of [node1,node2]){
            while(node!=mrca){
              sum+=node.length;
              node=node.parent;
            }
        }
        
        return sum;
    }

    /**
     * Gives the distance from the root to a given tip (external node).
     * @param tip - the external node
     * @returns {number}
     */
    rootToTipLength(tip) {
        let length = 0.0;
        for (const node of Tree.pathToRoot(tip)) {
            if (node.length) {
                length += node.length;
            }
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
     * Set one or more annotations for the tips.
     *
     * See annotateNode for a description of the annotation structure.
     *
     * @param annotations a dictionary of annotations keyed by tip label
     */
    annotateTips(annotations) {
        for (let [key, values] of Object.entries(annotations)) {
            const tip = this.getExternalNode(key);
            if (!tip) {
                throw new Error(`tip with label ${key} not found in tree`);
            }

            this.annotateNode(tip, values);
        }
    }

    /**
     * This is similar to annotateTips but the annotation objects are keyed by node
     * keys (Symbols).
     *
     * @param annotations a dictionary of annotations keyed by node key
     */
    annotateNodes(annotations) {
        for (let [key, values] of Object.entries(annotations)) {
            const node = this.getNode(key);
            if (!node) {
                throw new Error(`tip with key ${key} not found in tree`);
            }

            this.annotateNode(node, values);
        }
    }

    /**
     * Adds the given annotations to a particular node object.
     *
     * The annotations is an object with properties keyed by external node labels each
     * of which is an object with key value pairs for the annotations. The
     * key value pairs will be added to a property called 'annotations' in the node.
     *
     * Boolean or Numerical traits are given as a single value.
     * Sets of values with probabilities should be given as an object.
     * Discrete values should be given as an array (even if containing only one value)
     * or an object with booleans to give the full set of possible trait values.
     *
     * For example:
     *
     * {
     *     'tip_1': {
     *         'trait_1' : true,
     *         'trait_4' : 3.141592,
     *         'trait_2' : [1, 2], // discrete trait
     *         'trait_3' : ["London", "Paris", "New York"], // discrete trait
     *         'trait_3' : {"London" : true, "Paris" : false, "New York": false], // discrete trait with full set of values
     *         'trait_4' : {"London" : 0.75, "Paris" : 0.20, "New York": 0.05} // probability set
     *     },
     *     'tip_2': {...}
     * }
     *
     * The annotation labels, type and possible values are also added to the tree in a property called 'annotations'.
     *
     * A reconstruction method such as annotateNodesFromTips can then be used to provide reconstructed values
     * for internal nodes. Or annotateNodes can provide annotations for any node in the tree.
     *
     * @param node
     * @param annotations a dictionary of annotations keyed by the annotation name.
     */
    annotateNode(node, annotations) {
        this.addAnnotations(annotations);

        // add the annotations to the existing annotations object for the node object
        node.annotations = {...(node.annotations === undefined ? {} : node.annotations), ...annotations};
    }

    /**
     * Adds the annotation information to the tree. This stores the type and possible values
     * for each annotation seen in the nodes of the tree.
     *
     * This methods also checks the values are correct and conform to previous annotations
     * in type.
     *
     * @param annotations
     */
    addAnnotations(annotations) {
        for (let [key, addValues] of Object.entries(annotations)) {
            let annotation = this.annotations[key];
            if (!annotation) {
                annotation = {};
                this.annotations[key] = annotation;
            }

            if (Array.isArray(addValues)) {
                // is a set of discrete values
                const type = Type.DISCRETE;

                if (annotation.type && annotation.type !== type) {
                    throw Error(`existing values of the annotation, ${key}, in the tree is not of the same type`);
                }
                annotation.type = type;
                annotation.values = [...annotation.values, ...addValues];
            } else if (Object.isExtensible(addValues)) {
                // is a set of properties with values
                let type = null;

                let sum = 0.0;
                let keys = [];
                for (let [key, value] of Object.entries(addValues)) {
                    if (keys.includes(key)) {
                        throw Error(`the states of annotation, ${key}, should be unique`);
                    }
                    if (typeof value === typeof 1.0) {
                        // This is a vector of probabilities of different states
                        type = (type === undefined) ? Type.PROBABILITIES : type;

                        if (type === Type.DISCRETE) {
                            throw Error(`the values of annotation, ${key}, should be all boolean or all floats`);
                        }

                        sum += value;
                        if (sum > 1.0) {
                            throw Error(`the values of annotation, ${key}, should be probabilities of states and add to 1.0`);
                        }
                    } else if (typeof value === typeof true) {
                        type = (type === undefined) ? Type.DISCRETE : type;

                        if (type === Type.PROBABILITIES) {
                            throw Error(`the values of annotation, ${key}, should be all boolean or all floats`);
                        }
                    } else {
                        throw Error(`the values of annotation, ${key}, should be all boolean or all floats`);
                    }
                    keys.append(key);
                }

                if (annotation.type && annotation.type !== type) {
                    throw Error(`existing values of the annotation, ${key}, in the tree is not of the same type`);
                }

                annotation.type = type;
                annotation.values = [...annotation.values, ...addValues];
            } else {
                let type = Type.DISCRETE;

                if (typeof addValues === typeof true) {
                    type = Type.BOOLEAN;
                } else if (Number(addValues)) {
                    type = (addValues % 1 === 0 ? Type.INTEGER : Type.FLOAT);
                }

                if (annotation.type && annotation.type !== type) {
                    if ((type === Type.INTEGER && annotation.type === Type.FLOAT) ||
                        (type === Type.FLOAT && annotation.type === Type.INTEGER)) {
                        // upgrade to float
                        type = Type.FLOAT;
                    } else {
                        throw Error(`existing values of the annotation, ${key}, in the tree is not of the same type`);
                    }
                }

                if (type === Type.DISCRETE) {
                    if (!annotation.values) {
                        annotation.values = new Set();
                    }
                    annotation.values.add(addValues);
                }

                annotation.type = type;
            }

            // overwrite the existing annotation property
            this.annotations[key] = annotation;
        }
    }

    /**
     * Uses parsimony to label internal nodes to reconstruct the internal node states
     * for the annotation 'name'.
     *
     * @param name
     * @param acctrans Use acctrans reconstruction if true, deltrans otherwise
     * @param node
     */
    annotateNodesFromTips(name, acctran = true) {
        fitchParsimony(name, this.rootNode);

        reconstructInternalStates(name, [], acctran, this.rootNode);
    }

    /**
     * A class method to create a Tree instance from a Newick format string (potentially with node
     * labels and branch lengths). Taxon labels should be quoted (either " or ') if they contain whitespace
     * or any of the tree definitition characters '(),:;' - the quotes (and any whitespace immediately within)
     * will be removed.
     * @param newickString - the Newick format tree as a string
     * @param labelName
     * @param datePrefix
     * @returns {Tree} - an instance of the Tree class
     */
    static parseNewick(newickString, labelName = "label", datePrefix = undefined, splitBranches = false ) {
        const tokens = newickString.split(/\s*('[^']+'|"[^"]+"|;|\(|\)|,|:)\s*/);

        let level = 0;
        let currentNode = null;
        let nodeStack = [];
        let labelNext = false;
        let lengthNext = false;

        for (const token of tokens.filter(token => token.length > 0)) {
            // console.log(`Token ${i}: ${token}, level: ${level}`);
            if (token === "(") {
                // an internal node

                if (labelNext) {
                    // if labelNext is set then the last bracket has just closed
                    // so there shouldn't be an open bracket.
                    throw new Error("expecting a comma");
                }

                let node = {
                    level: level,
                    parent: currentNode,
                    children: [],
                    annotations: {}
                };
                level += 1;
                if (currentNode) {
                    nodeStack.push(currentNode);
                }
                currentNode = node;

            } else if (token === ",") {
                // another branch in an internal node

                labelNext = false; // labels are optional
                if (lengthNext) {
                    throw new Error("branch length missing");
                }

                let parent = nodeStack.pop();
                parent.children.push(currentNode);

                currentNode = parent;
            } else if (token === ")") {
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
            } else if (token === ":") {
                labelNext = false; // labels are optional
                lengthNext = true;
            } else if (token === ";") {
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
                    if (!currentNode.label.startsWith("#")) {
                        let value = parseFloat(currentNode.label);
                        if (isNaN(value)) {
                            value = currentNode.label;
                        }
                        currentNode.annotations[labelName] = value;
                    }
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
                    name = name.trim();

                    let date = undefined;
                    if (datePrefix) {
                        const parts = name.split(datePrefix);
                        if (parts.length === 0) {
                            throw new Error(`the tip, ${name}, doesn't have a date separated by the prefix, '${datePrefix}'`);
                        }
                        date = parseFloat(parts[parts.length - 1]);
                    }

                    const externalNode = {
                        name: name,
                        date: date,
                        parent: currentNode,
                        annotations: {}
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

        return new Tree(currentNode, splitBranches);
    };
}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

/**
 * A private recursive function that rotates nodes to give an ordering.
 * @param node
 * @param increasing
 * @param callback an optional callback that is called each rotate
 * @returns {number}
 */
function orderNodes(node, increasing, callback = null) {
    const factor = increasing ? 1 : -1;
    let count = 0;
    if (node.children) {
        const counts = new Map();
        for (const child of node.children) {
            const value = orderNodes(child, increasing, callback);
            counts.set(child, value);
            count += value;
        }
        node.children.sort((a, b) => {
            return (counts.get(a) - counts.get(b)) * factor
        });

        if (callback) callback();
    } else {
        count = 1
    }
    return count;
}

/**
 * A private recursive function that uses the Fitch algorithm to assign
 * states to nodes using parsimony. An acctrans or deltrans algorithm can
 * then be used to reconstruct internal node states.
 * @param name
 * @param node
 * @returns {*}
 */
function fitchParsimony(name, node) {

    if (!node.children) {
        if (!node.annotations[name]) {
            return []; // annotation not defined so return an empty set
        }
        return (Array.isArray(node.annotations[name]) ? node.annotations[name] : [node.annotations[name]]);
    }

    let I;
    let U = [];
    node.children.forEach( (child) => {
        const childStates = fitchParsimony(name, child);
        U = [...U, ...childStates.filter( (state) => !U.includes(state) )]; // take the union
        I = (I === undefined ? childStates : childStates.filter( (state) => I.includes(state) )); // take the intersection
    });

    node.annotations = (node.annotations === undefined ? {} : node.annotations);

    // set the node annotation to the intersection if not empty, the union otherwise
    node.annotations[name] = [...(I.length > 0 ? I : U)];

    return node.annotations[name];
}

function reconstructInternalStates(name, parentStates, acctran, node ) {
    let nodeStates = node.annotations[name];
    if (!Array.isArray(nodeStates)) {
        nodeStates = [nodeStates];
    }

    if (node.children) {

        let stateCounts = {};

        nodeStates
            .forEach((state) => stateCounts[state] = (stateCounts[state] ? stateCounts[state] += 1 : 1) );

        parentStates
            .forEach((state) => stateCounts[state] = (stateCounts[state] ? stateCounts[state] += 1 : 1) );

        node.children.forEach((child) => {
            reconstructInternalStates(name, nodeStates, acctran, child)
                .forEach((state) => stateCounts[state] = (stateCounts[state] ? stateCounts[state] += 1 : 1) );
        });

        const max = Object.entries(stateCounts).reduce((prev, current) => (prev[1] > current[1]) ? prev : current)[1];
        nodeStates = Object.entries(stateCounts).filter(([state, count]) => count === max).map(([state, count]) => state );

        node.annotations[name] = (nodeStates.length === 1 ? nodeStates[0] : nodeStates);
    }

    return nodeStates;
}