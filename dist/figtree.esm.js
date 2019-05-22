/** @module tree */

const Type = {
    DISCRETE : Symbol("DISCRETE"),
    BOOLEAN : Symbol("BOOLEAN"),
    INTEGER : Symbol("INTEGER"),
    FLOAT: Symbol("FLOAT"),
    PROBABILITIES: Symbol("PROBABILITIES")
};

/**
 * The Tree class
 */
class Tree {
    /**
     * The constructor takes an object for the root node. The tree structure is
     * defined as nested node objects.
     *
     * @constructor
     * @param {object} rootNode - The root node of the tree as an object.
     */
    constructor(rootNode = {}) {
        this.root = rootNode;

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
                    });
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
     * Splits each branch in multiple segments inserting a new degree 2 nodes. If splitLocations is
     * null then it splits each in two at the mid-point
     * @param splits
     */
    splitBranches(splits = null) {
        // split each branch into sections, with a node of
        // degree two in the middle. This allows annotation
        // of part of a branch.
        [...this.preorder()]
            .filter((node) => node.parent)
            .forEach((node) => {
                if (splits !== null) {
                    if (splits[node.id]) {
                        let splitNode = node;
                        splits[node.id].forEach(([time, id]) => {
                            splitNode = this.splitBranch(splitNode, time);
                            splitNode.id = id;
                        });
                    }
                } else {
                    // if no splitLocations are given then split it in the middle.
                    this.splitBranch(node, node.length / 2.0);
                }
            });
    }

    /**
     * Splits a branch in two inserting a new degree 2 node. The splitLocation should be less than
     * the orginal branch length.
     * @param node
     * @param splitLocation
     */
    splitBranch(node, splitLocation) {
        const oldLength = node.length;

        let splitNode = {
            parent: node.parent,
            children: [node],
            length: oldLength - splitLocation,
            annotations: {
                midpoint: true
            }
        };
        node.parent.children[node.parent.children.indexOf(node)] = splitNode;
        node.parent = splitNode;
        node.length = splitLocation;

        return splitNode;
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
    static parseNewick(newickString, labelName = "label", datePrefix = undefined ) {
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
                    } else {
                        currentNode.id = currentNode.label.substring(1);
                    }
                    labelNext = false;
                } else {
                    // an external node
                    if (!currentNode.children) {
                        currentNode.children = [];
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

        return new Tree(currentNode);
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
        count = 1;
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

/** @module layout */


/**
 * The Layout class
 *
 */
class Layout {

    /**
     * The constructor.
     */
    constructor( ) {

        // default ranges - these should be set in layout()
        this._horizontalRange = [0.0, 1.0];
        this._verticalRange = [0, 1.0];

        // create an empty callback function
        this.updateCallback = () => { };
    }

    /**
     * An abstract base class for a layout class. The aim is to describe the API of the class.
     *
     * @param vertices - objects with an x, y coordinates and a reference to the original node
     * @param edges - objects with v1 (a vertex) and v0 (the parent vertex).
     */
    layout(vertices, edges) { }

    get horizontalRange() {
        return this._horizontalRange;
    }

    get verticalRange() {
        return this._verticalRange;
    }

    /**
     * Updates the tree when it has changed
     */
    update() {
        this.updateCallback();
    }

    /**
     * A utility function for rotating a node
     * @returns {rotate}
     */
    rotate() {
        return (vertex) => {
            this.tree.rotate(vertex.node);
            this.update();
        };
    }

    /**
     * A utility function for ordering a subtree with increasing tip density
     * @returns {orderIncreasing}
     */
    orderIncreasing() {
        return (vertex) => {
            this.tree.rotate(vertex.node);
            this.update();
        };
    }

    /**
     * A utility function for ordering a subtree with decreasing tip density
     * @returns {orderIncreasing}
     */
    orderDecreasing() {
        return (vertex) => {
            this.tree.rotate(vertex.node);
            this.update();
        };
    }

    /**
     * A utility function for rerooting the tree
     * @returns {reroot}
     */
    reroot() {
        return (edge, position) => {
            this.tree.reroot(edge.v1.node, position);
            this.update();
        };
    }

    /**
     * A utility function that will return a HTML string about the node and its
     * annotations. Can be used with the addLabels() method.
     *
     * @param node
     * @returns {string}
     */
    static nodeInfo(node) {
        let text = `${node.name ? node.name : node.id }`;
        Object.entries(node.annotations).forEach(([key, value]) => {
            text += `<p>${key}: ${value}</p>`;
        });
        return text;
    }
}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

// const d3 = require("d3");
/**
 * The Layout class
 *
 */
class RectangularLayout extends Layout {

    static DEFAULT_SETTINGS() {
        return {
            lengthFormat: d3.format(".2f"),
            branchCurve: d3.curveStepBefore
        };
    }

    /**
     * The constructor.
     * @param tree
     * @param settings
     */
    constructor(tree, settings = { }) {
        super();

        this.tree = tree;

        // merge the default settings with the supplied settings
        this.settings = {...RectangularLayout.DEFAULT_SETTINGS(), ...settings};

        this.branchLabelAnnotationName = null;
        this.internalNodeLabelAnnotationName = null;
        this.externalNodeLabelAnnotationName = null;

        // called whenever the tree changes...
        this.tree.treeUpdateCallback = () => {
            this.update();
        };
    }

    /**
     * Lays out the tree in a standard rectangular format.
     *
     * This function is called by the FigTree class and is used to layout the nodes of the tree. It
     * populates the vertices array with vertex objects that wrap the nodes and have coordinates and
     * populates the edges array with edge objects that have two vertices.
     *
     * It encapsulates the tree object to keep it abstract
     *
     * @param vertices - objects with an x, y coordinates and a reference to the original node
     * @param edges - objects with v1 (a vertex) and v0 (the parent vertex).
     */
    layout(vertices, edges) {

        this._horizontalRange = [0.0, d3.max([...this.tree.rootToTipLengths()])];
        this._verticalRange = [0, this.tree.externalNodes.length - 1];

        // get the nodes in post-order
        const nodes = [...this.tree.postorder()];

        let currentY = -1;

        if (vertices.length === 0) {
            this.nodeMap = new Map();

            // create the vertices (only done if the array is empty)
            nodes.forEach((n, i) => {
                const vertex = {
                    node: n,
                    key: n.id
                    // key: Symbol(n.id).toString()
                };
                vertices.push(vertex);
                this.nodeMap.set(n, vertex);
            });
        }

        // update the node locations (vertices)
        nodes
            .forEach((n) => {
                const v = this.nodeMap.get(n);

                v.x = this.tree.rootToTipLength(v.node);
                currentY = this.setYPosition(v, currentY);

                v.degree = (v.node.children ? v.node.children.length + 1: 1); // the number of edges (including stem)

                v.id = n.id;

                v.classes = [
                    (!v.node.children ? "external-node" : "internal-node"),
                    (v.node.isSelected ? "selected" : "unselected")];

                if (v.node.annotations) {
                    v.classes = [
                        ...v.classes,
                        ...Object.entries(v.node.annotations)
                            .filter(([key]) => {
                                return this.tree.annotations[key] &&
                                    (this.tree.annotations[key].type === Type.DISCRETE ||
                                    this.tree.annotations[key].type === Type.BOOLEAN ||
                                    this.tree.annotations[key].type === Type.INTEGER);
                            })
                            .map(([key, value]) => `${key}-${value}`)];
                }

                // either the tip name or the internal node label
                if (v.node.children) {
                    v.leftLabel = (this.internalNodeLabelAnnotationName?
                        v.node.annotations[this.internalNodeLabelAnnotationName]:
                        "");
                    v.rightLabel = "";

                    // should the left node label be above or below the node?
                    v.labelBelow = (!v.node.parent || v.node.parent.children[0] !== v.node);
                } else {
                    v.leftLabel = "";
                    v.rightLabel = (this.externalNodeLabelAnnotationName?
                        v.node.annotations[this.externalNodeLabelAnnotationName]:
                        v.node.name);
                }

                this.nodeMap.set(v.node, v);
            });

        if (edges.length === 0) {
            this.edgeMap = new Map();

            // create the edges (only done if the array is empty)
            nodes
                .filter((n) => n.parent) // exclude the root
                .forEach((n, i) => {
                    const edge = {
                        v0: this.nodeMap.get(n.parent),
                        v1: this.nodeMap.get(n),
                        key: n.id
                        // key: Symbol(n.id).toString()
                    };
                    edges.push(edge);
                    this.edgeMap.set(edge, edge.v1);
                });
        }

        // update the edges
        edges
            .forEach((e) => {
                e.v1 = this.edgeMap.get(e);
                e.v0 = this.nodeMap.get(e.v1.node.parent),
                    e.classes = [];

                if (e.v1.node.annotations) {
                    e.classes = [
                        ...e.classes,
                        ...Object.entries(e.v1.node.annotations)
                            .filter(([key]) => {
                                return this.tree.annotations[key] &&
                                    (this.tree.annotations[key].type === Type.DISCRETE ||
                                    this.tree.annotations[key].type === Type.BOOLEAN ||
                                    this.tree.annotations[key].type === Type.INTEGER);
                            })
                            .map(([key, value]) => `${key}-${value}`)];
                }
                const length = e.v1.x - e.v0.x;
                e.length = length;
                e.label = (this.branchLabelAnnotationName ?
                    (this.branchLabelAnnotationName === 'length' ?
                        this.settings.lengthFormat(length) :
                        e.v1.node.annotations[this.branchLabelAnnotationName]) :
                    null );
                e.labelBelow = e.v1.node.parent.children[0] !== e.v1.node;
            });
    }

    set branchCurve(curve) {
        this.settings.branchCurve = curve;
        this.update();
    }


    get branchCurve() {
        return this.settings.branchCurve;
    }

    /**
     * Sets the annotation to use as the node labels.
     *
     * @param annotationName
     */
    setInternalNodeLabels(annotationName) {
        this.internalNodeLabelAnnotationName = annotationName;
        this.update();
    }

    /**
     * Sets the annotation to use as the node labels.
     *
     * @param annotationName
     */
    setExternalNodeLabels(annotationName) {
        this.externalNodeLabelAnnotationName = annotationName;
        this.update();
    }

    /**
     * Sets the annotation to use as the node labels.
     *
     * @param annotationName
     */
    setBranchLabels(annotationName) {
        this.branchLabelAnnotationName = annotationName;
        this.update();
    }


    /**
     * Updates the tree when it has changed
     */
    update() {
        this.updateCallback();
    }

    setYPosition(vertex, currentY) {
        vertex.y = (vertex.node.children ? d3.mean(vertex.node.children, (child) => this.nodeMap.get(child).y) : currentY += 1);
        return currentY;
    }
    branchPathGenerator(scales){
        const branchPath =(e,i)=>{
            const branchLine = d3.line()
                 .x((v) => v.x)
                .y((v) => v.y)
                .curve(this.branchCurve);
            return(
                branchLine(
                    [{x: 0, y: scales.y(e.v0.y) - scales.y(e.v1.y)},
                    {x: scales.x(e.v1.x) - scales.x(e.v0.x), y: 0}]
                )
            )
            
        };
        return branchPath;
    }
}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

const Direction = {
    UP : Symbol("UP"),
    DOWN : Symbol("DOWN")
};

/**
 * The TransmissionLayout class
 *
 */
class TransmissionLayout extends RectangularLayout {

    /**
     * The constructor.
     * @param tree
     * @param settings
     */
    constructor(tree, settings = { }) {
        super(tree, settings);

        this._direction = Direction.DOWN;
    }

    /**
     * Set the direction to draw transmission (up or down).
     * @param direction
     */
    set direction(direction) {
        this._direction = direction;
        this.update();
    }

    /**
     * Inherited method overwritten to set the y-position of an internal node to the same as its
     * first child which gives a visual directionality to the tree.
     * @param vertex
     * @param currentY
     * @returns {*}
     */
    setYPosition(vertex, currentY) {
        if (this._direction === Direction.UP) {
            throw new Error("Up direction drawing not implemented yet");
        }

        vertex.y = (vertex.node.children ? this.nodeMap.get(vertex.node.children[0]).y : currentY += 1);
        return currentY;
    }

}
/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

// const d3 = require("d3");

/**
 * The Layout class
 *
 */
class ArcLayout extends Layout {

    static DEFAULT_SETTINGS() {
        return {
            lengthFormat: d3.format(".2f"),
            edgeWidth:2,
            xFunction:(n,i)=>i,
            branchCurve:d3.curveLinear
        };
    }

    /**
     * The constructor.
     * @param tree
     * @param settings
     */
    constructor(graph, settings = { }) {
        super();

        this.graph = graph;

        // merge the default settings with the supplied settings
        this.settings = {...ArcLayout.DEFAULT_SETTINGS(), ...settings};

        this.branchLabelAnnotationName = null;
        this.internalNodeLabelAnnotationName = null;
        this.externalNodeLabelAnnotationName = null;

        // called whenever the tree changes...
        // this.tree.treeUpdateCallback = () => {
        //     this.update();
        // };
    }

    /**
     * Lays out the tree in a standard rectangular format.
     *
     * This function is called by the FigTree class and is used to layout the nodes of the tree. It
     * populates the vertices array with vertex objects that wrap the nodes and have coordinates and
     * populates the edges array with edge objects that have two vertices.
     *
     * It encapsulates the tree object to keep it abstract
     *
     * @param vertices - objects with an x, y coordinates and a reference to the original node
     * @param edges - objects with v1 (a vertex) and v0 (the parent vertex).
     */
    layout(vertices, edges) {

        this._horizontalRange = [0.0, d3.max(this.graph.nodes,(n,i)=>this.settings.xFunction(n,i))];
        this._verticalRange = [-this.graph.nodes.length,this.graph.nodes.length];

        // get the nodes in pre-order (starting at first node)
        const nodes = [...this.graph.preorder(this.graph.nodes[0])];


        if (vertices.length === 0) {
            this.nodeMap = new Map();

            // create the vertices (only done if the array is empty)
            nodes.forEach((n, i) => {
                const vertex = {
                    node: n,
                    key: n.id
                    // key: Symbol(n.id).toString()
                };
                vertices.push(vertex);
                this.nodeMap.set(n, vertex);
            });
        }

        // update the node locations (vertices)
        //
        nodes
            .forEach((n,i) => {
                const v = this.nodeMap.get(n);

                v.x = this.settings.xFunction(n,i);
                v.y=0;

                v.degree = this.graph.getEdges(v.node).length ; // the number of edges 

                v.classes = [
                    (!this.graph.getOutgoingEdges(v.node).length>0? "external-node" : "internal-node"),
                    (v.node.isSelected ? "selected" : "unselected")];

                if (v.node.annotations) {
                    v.classes = [
                        ...v.classes,
                        ...Object.entries(v.node.annotations)
                            .filter(([key]) => {
                                return this.tree.annotations[key].type === Type.DISCRETE ||
                                    this.tree.annotations[key].type === Type.BOOLEAN ||
                                    this.tree.annotations[key].type === Type.INTEGER;
                            })
                            .map(([key, value]) => `${key}-${value}`)];
                }

                // either the tip name or the internal node label
                if (v.node.children) {
                    v.leftLabel = (this.internalNodeLabelAnnotationName?
                        v.node.annotations[this.internalNodeLabelAnnotationName]:
                        "");
                    v.rightLabel = "";

                    // should the left node label be above or below the node?
                    v.labelBelow = (!v.node.parent || v.node.parent.children[0] !== v.node);
                } else {
                    v.leftLabel = "";
                    v.rightLabel = (this.externalNodeLabelAnnotationName?
                        v.node.annotations[this.externalNodeLabelAnnotationName]:
                        v.node.name);
                }

                this.nodeMap.set(v.node, v);
            });

        if (edges.length === 0) {
            this.edgeMap = new Map();

            // create the edges (only done if the array is empty)
            const dataEdges = this.graph.edges;
            dataEdges
                .forEach((e, i) => {
                    const edge = {
                        v0: this.nodeMap.get(e.source),
                        v1: this.nodeMap.get(e.target),
                        key: e.id
                        // key: Symbol(n.id).toString()
                    };
                    edges.push(edge);
                    this.edgeMap.set(edge, edge.v1);
                });
        }

        // update the edges


        edges
            .forEach((e) => {
                e.v1 = this.edgeMap.get(e);
                e.v0 = this.nodeMap.get(e.v0.node),
                    e.classes = [];


                if (e.v1.node.annotations) {
                    e.classes = [
                        ...e.classes,
                        ...Object.entries(e.v1.node.annotations)
                            .filter(([key]) => {
                                return this.tree.annotations[key].type === Type.DISCRETE ||
                                    this.tree.annotations[key].type === Type.BOOLEAN ||
                                    this.tree.annotations[key].type === Type.INTEGER;
                            })
                            .map(([key, value]) => `${key}-${value}`)];
                }
                const length = e.v1.x - e.v0.x;
                e.length = length;
                e.label = (this.branchLabelAnnotationName ?
                    (this.branchLabelAnnotationName === 'length' ?
                        this.settings.lengthFormat(length) :
                        e.v1.node.annotations[this.branchLabelAnnotationName]) :
                    null );
                // e.labelBelow = e.v1.node.parent.children[0] !== e.v1.node;
            });
    }

    set branchCurve(curve) {
        this.settings.branchCurve = curve;
        this.update();
    }


    get branchCurve() {
        return this.settings.branchCurve;
    }

    /**
     * Sets the annotation to use as the node labels.
     *
     * @param annotationName
     */
    setInternalNodeLabels(annotationName) {
        this.internalNodeLabelAnnotationName = annotationName;
        this.update();
    }

    /**
     * Sets the annotation to use as the node labels.
     *
     * @param annotationName
     */
    setExternalNodeLabels(annotationName) {
        this.externalNodeLabelAnnotationName = annotationName;
        this.update();
    }

    /**
     * Sets the annotation to use as the node labels.
     *
     * @param annotationName
     */
    setBranchLabels(annotationName) {
        this.branchLabelAnnotationName = annotationName;
        this.update();
    }


    /**
     * Updates the tree when it has changed
     */
    update() {
        this.updateCallback();
    }
// do it with interpelations
    branchPathGenerator(scales){
            const branchPath =(e,i)=>{
                const branchLine = d3.line()
                     .x((v) => v.x)
                    .y((v) => v.y)
                    .curve(this.branchCurve);
            const r = (scales.x(e.v1.x) - scales.x(e.v0.x))/2;
            const a = r; // center x position
            const sign = i%2===0?1:-1;
            const x = d3.range(0,scales.x(e.v1.x) - scales.x(e.v0.x),1);//step every pixel
            const y = x.map(x=>circleY.call(this,x,r,a,sign));
            const points = x.map((x,i)=>{
                return {x:x,y:y[i]}
            });        
            return(
                branchLine(
                    points
                )
            )
            
        };
        return branchPath;
    }

}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */
function circleY(x,r,a,sign){
        return  sign*(Math.sqrt(Math.pow(r,2)-Math.pow((x-a),2)))
}

/** @module bauble */


/**
 * The Bauble class
 *
 * This is a shape or decoration at the node of a tree or graph
 */
class Bauble {
    static DEFAULT_SETTINGS() {
        return {
            vertexFilter: () => true
        };
    }

    /**
     * The constructor.
     */
    constructor(settings = {}) {
        this.settings = {...Bauble.DEFAULT_SETTINGS(), ...settings};
    }

    get vertexFilter() {
        return this.settings.vertexFilter;
    }

    createShapes(selection) {
        throw new Error("don't call the base class methods")
    }

    updateShapes(selection, border = 0) {
        throw new Error("don't call the base class methods")
    }

}

class CircleBauble extends Bauble {
    static DEFAULT_SETTINGS() {
        return {
            radius: 6,
        };
    }

    /**
     * The constructor.
     */
    constructor(settings = {}) {
        super({...CircleBauble.DEFAULT_SETTINGS(), ...settings});
    }

    createShapes(selection) {
        return selection
            .append("circle");
    };

    updateShapes(selection, border = 0) {
        return selection
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", this.settings.radius + border);
    };
}

class RectangularBauble extends Bauble {
    static DEFAULT_SETTINGS() {
        return {
            height: 16,
            width: 6,
            radius: 2,
        };
    }

    /**
     * The constructor.
     */
    constructor(settings = {}) {
        super({...RectangularBauble.DEFAULT_SETTINGS(), ...settings});
    }

    createShapes(selection) {
        return selection
            .append("rect");
    };

    updateShapes(selection, border = 0) {
        const w = this.settings.width + border;
        const h = this.settings.height + border;
        return selection
            .attr("x", - w / 2)
                .attr("width", w)
                .attr("y", - h / 2)
                .attr("height", h)
                .attr("rx", this.settings.radius)
                .attr("ry", this.settings.radius);
    };
}


/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

/** @module figtree */
// const d3 = require("d3");

/**
 * The FigTree class
 *
 * A class that takes a tree and draws it into the the given SVG root element. Has a range of methods
 * for adding interactivity to the tree (e.g., mouse-over labels, rotating nodes and rerooting on branches).
 * The tree is updated with animated transitions.
 */
class FigTree {

    static DEFAULT_SETTINGS() {
        return {
            xAxisTickArguments: [5, "f"],
            xAxisTitle: "Divergence",
            // nodeRadius: 6,
            hoverBorder: 2,
            backgroundBorder: 0,
            baubles: []
        };
    }

    /**
     * The constructor.
     * @param svg
     * @param layout - an instance of class Layout
     * @param margins
     * @param settings
     */
    constructor(svg, layout, margins, settings = {}) {
        this.layout = layout;
        this.margins = margins;

        // merge the default settings with the supplied settings
        this.settings = {...FigTree.DEFAULT_SETTINGS(), ...settings};

        // get the size of the svg we are drawing on
        const width = svg.getBoundingClientRect().width;
        const height = svg.getBoundingClientRect().height;

        //remove the tree if it is there already
        d3.select(svg).select("g").remove();

        // add a group which will contain the new tree
        d3.select(svg).append("g")
            .attr("transform",`translate(${margins.left},${margins.top})`);

        //to selecting every time
        this.svgSelection = d3.select(svg).select("g");

        this.svgSelection.append("g").attr("class", "axes-layer");
        this.svgSelection.append("g").attr("class", "branches-layer");
        if (this.settings.backgroundBorder > 0) {
            this.svgSelection.append("g").attr("class", "nodes-background-layer");
        }
        this.svgSelection.append("g").attr("class", "nodes-layer");

        // create the scales
        const xScale = d3.scaleLinear()
            .domain(this.layout.horizontalRange)
            .range([margins.left, width - margins.right]);

        const yScale = d3.scaleLinear()
            .domain(this.layout.verticalRange)
            .range([margins.top + 20, height - margins.bottom - 20]);

        this.scales = {x:xScale, y:yScale, width, height};

        addAxis.call(this, margins);

        this.vertices = [];
        this.edges = [];

        // Called whenever the layout changes...
        this.layout.updateCallback = () => {
            this.update();
        };

        this.update();
    }

    /**
     * Updates the tree when it has changed
     */
    update() {

        // get new positions
        this.layout.layout(this.vertices, this.edges);

        // update the scales' domains
        this.scales.x.domain(this.layout.horizontalRange);
        this.scales.y.domain(this.layout.verticalRange);

        const xAxis = d3.axisBottom(this.scales.x)
            .tickArguments(this.settings.xAxisTickArguments);

        this.svgSelection.select("#x-axis")
            .transition()
            .duration(500)
            .call(xAxis);


        // call the private methods to create the components of the diagram
        updateBranches.call(this);

        if (this.settings.backgroundBorder > 0) {
            updateNodeBackgrounds.call(this);
        }

        updateNodes.call(this);

    }

    /**
     * set mouseover highlighting of branches
     */
    hilightBranches() {
        // need to use 'function' here so that 'this' refers to the SVG
        // element being hovered over.
        const selected = this.svgSelection.selectAll(".branch").select(".branch-path");
        selected.on("mouseover", function (d, i) {
            d3.select(this).classed("hovered", true);
        });
        selected.on("mouseout", function (d, i) {
            d3.select(this).classed("hovered", false);
        });
    }

    /**
     * Set mouseover highlighting of internal nodes
     */
    hilightInternalNodes() {
        this.hilightNodes(".internal-node");
    }

    /**
     * Set mouseover highlighting of internal nodes
     */
    hilightExternalNodes() {
        this.hilightNodes(".external-node");
    }

    /**
     * Set mouseover highlighting of nodes
     */
    hilightNodes(selection) {
        // need to use 'function' here so that 'this' refers to the SVG
        // element being hovered over.
        const self = this;
        const selected = this.svgSelection.selectAll(selection).select(".node-shape");
        selected.on("mouseover", function (d, i) {
            const node = d3.select(this);

            self.settings.baubles.forEach((bauble) => {
                if (bauble.vertexFilter(node)) {
                    bauble.updateShapes(node, self.settings.hoverBorder);
                }
            });

            node.classed("hovered", true);
        });
        selected.on("mouseout", function (d, i) {
            const node = d3.select(this);

            self.settings.baubles.forEach((bauble) => {
                if (bauble.vertexFilter(node)) {
                    bauble.updateShapes(node, 0);
                }
            });

            node.classed("hovered", false);
        });
    }

    /**
     * Registers action function to be called when an edge is clicked on. The function is passed
     * edge object that was clicked on and the position of the click as a proportion of the edge length.
     *
     * Optionally a selection string can be provided - i.e., to select a particular branch by its id.
     *
     * @param action
     * @param selection
     */
    onClickBranch(action, selection = null) {
        // We need to use the "function" keyword here (rather than an arrow) so that "this"
        // points to the actual SVG element (so we can use d3.mouse(this)). We therefore need
        // to store a reference to the object in "self".
        const self = this;
        const selected = this.svgSelection.selectAll(`${selection ? selection : ".branch"}`);
        selected.on("click", function (edge) {
            const x1 = self.scales.x(edge.v1.x);
            const x2 = self.scales.x(edge.v0.x);
            const mx = d3.mouse(this)[0];
            const proportion = Math.max(0.0, Math.min(1.0, (mx - x2) / (x1 - x2)));
            action(edge, proportion);
        });
    }

    /**
     * Registers action function to be called when an internal node is clicked on. The function should
     * take the tree and the node that was clicked on.
     *
     * A static method - Tree.rotate() is available for rotating the node order at the clicked node.
     *
     * @param action
     */
    onClickInternalNode(action) {
        this.onClickNode(action, ".internal-node");
    }

    /**
     * Registers action function to be called when an external node is clicked on. The function should
     * take the tree and the node that was clicked on.
     *
     * @param action
     */
    onClickExternalNode(action) {
        this.onClickNode(action, ".external-node");
    }

    /**
     * Registers action function to be called when a vertex is clicked on. The function is passed
     * the vertex object.
     *
     * Optionally a selection string can be provided - i.e., to select a particular node by its id.
     *
     * @param action
     * @param selection
     */
    onClickNode(action, selection = null) {
        const selected = this.svgSelection.selectAll(`${selection ? selection : ".node"}`).select(".node-shape");
        selected.on("click", (vertex) => {
            action(vertex);
        });
    }

    /**
     * Registers some text to appear in a popup box when the mouse hovers over the selection.
     *
     * @param selection
     * @param text
     */
    addToolTip(selection, text) {
        this.svgSelection.selectAll(selection).on("mouseover",
            function (selected) {
                let tooltip = document.getElementById("tooltip");
                if (typeof text === typeof "") {
                    tooltip.innerHTML = text;
                } else {
                    tooltip.innerHTML = text(selected.node);
                }
                tooltip.style.display = "block";
                tooltip.style.left = d3.event.pageX + 10 + "px";
                tooltip.style.top = d3.event.pageY + 10 + "px";
            }
        );
        this.svgSelection.selectAll(selection).on("mouseout", function () {
            let tooltip = document.getElementById("tooltip");
            tooltip.style.display = "none";
        });
    }

    set treeLayout(layout) {
        this.layout = layout;
        this.update();
    }
}

/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

/**
 * Adds or updates nodes
 */
function updateNodes() {

    const nodesLayer = this.svgSelection.select(".nodes-layer");

    // DATA JOIN
    // Join new data with old elements, if any.
    const nodes = nodesLayer.selectAll(".node")
        .data(this.vertices, (v) => `n_${v.key}`);

    // ENTER
    // Create new elements as needed.
    const newNodes = nodes.enter().append("g")
        .attr("id", (v) => v.id)
        .attr("class", (v) => ["node", ...v.classes].join(" "))
        .attr("transform", (v) => {
            return `translate(${this.scales.x(v.x)}, ${this.scales.y(v.y)})`;
        });

    // add the specific node shapes or 'baubles'
    this.settings.baubles.forEach((bauble) => {
        const d = bauble
            .createShapes(newNodes.filter(bauble.vertexFilter))
            .attr("class", "node-shape");
        bauble.updateShapes(d);
    });

    newNodes.append("text")
        .attr("class", "node-label name")
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle")
        .attr("dx", "12")
        .attr("dy", "0")
        .text((d) => d.rightLabel);

    newNodes.append("text")
        .attr("class", "node-label support")
        .attr("text-anchor", "end")
        .attr("dx", "-6")
        .attr("dy", d => (d.labelBelow ? -8 : +8))
        .attr("alignment-baseline", d => (d.labelBelow ? "bottom": "hanging" ))
        .text((d) => d.leftLabel);

    // update the existing elements
    nodes
        .transition()
        .duration(500)
        .attr("class", (v) => ["node", ...v.classes].join(" "))
        .attr("transform", (v) => {
            return `translate(${this.scales.x(v.x)}, ${this.scales.y(v.y)})`;
        });

    // update all the baubles
    this.settings.baubles.forEach((bauble) => {
        const d = nodes.select(".node-shape")
            .filter(bauble.vertexFilter)
            .transition()
            .duration(500);
        bauble.updateShapes(d);
    });

    nodes.select("text .node-label .name")
        .transition()
        .duration(500)
        .attr("class", "node-label name")
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle")
        .attr("dx", "12")
        .attr("dy", "0")
        .text((d) => d.rightLabel);

    nodes.select("text .node-label .support")
        .transition()
        .duration(500)
        .attr("alignment-baseline", d => (d.labelBelow ? "bottom": "hanging" ))
        .attr("class", "node-label support")
        .attr("text-anchor", "end")
        .attr("dx", "-6")
        .attr("dy", d => (d.labelBelow ? -8 : +8))
        .text((d) => d.leftLabel);

    // EXIT
    // Remove old elements as needed.
    nodes.exit().remove();

}

function updateNodeBackgrounds() {

    const nodesBackgroundLayer = this.svgSelection.select(".nodes-background-layer");

    // DATA JOIN
    // Join new data with old elements, if any.
    const nodes = nodesBackgroundLayer.selectAll(".node-background")
        .data(this.vertices, (v) => `nb_${v.key}`);

    // ENTER
    // Create new elements as needed.
    const newNodes = nodes.enter();

    // add the specific node shapes or 'baubles'
    this.settings.baubles.forEach((bauble) => {
        const d = bauble
            .createShapes(newNodes.filter(bauble.vertexFilter))
            .attr("class", "node-background")
            .attr("transform", (v) => {
                return `translate(${this.scales.x(v.x)}, ${this.scales.y(v.y)})`;
            });

        bauble.updateShapes(d, this.settings.backgroundBorder);
    });

    // update all the existing elements
    this.settings.baubles.forEach((bauble) => {
        const d = nodes
            .filter(bauble.vertexFilter)
            .transition()
            .duration(500)
            .attr("transform", (v) => {
                return `translate(${this.scales.x(v.x)}, ${this.scales.y(v.y)})`;
            });
        bauble.updateShapes(d, this.settings.backgroundBorder);
    });

    // EXIT
    // Remove old elements as needed.
    nodes.exit().remove();

}


/**
 * Adds or updates branch lines
 */
function updateBranches() {

    const branchesLayer = this.svgSelection.select(".branches-layer");

    // a function to create a line path
    // const branchPath = d3.line()
    //     .x((v) => v.x)
    //     .y((v) => v.y)
    //     .curve(this.layout.branchCurve);
    const branchPath = this.layout.branchPathGenerator(this.scales);

    // DATA JOIN
    // Join new data with old elements, if any.
    const branches = branchesLayer.selectAll("g .branch")
        .data(this.edges, (e) => `b_${e.key}`);

    // ENTER
    // Create new elements as needed.
    const newBranches = branches.enter().append("g")
        .attr("id", (e) => e.id)
        .attr("class", (e) => ["branch", ...e.classes].join(" "))
        .attr("transform", (e) => {
            return `translate(${this.scales.x(e.v0.x)}, ${this.scales.y(e.v1.y)})`;
        });

    newBranches.append("path")
        .attr("class", "branch-path")
        .attr("d", (e,i) => branchPath(e,i));

    newBranches.append("text")
        .attr("class", "branch-label length")
        .attr("dx", (e) => ((this.scales.x(e.v1.x) - this.scales.x(e.v0.x)) / 2))
        .attr("dy", (e) => (e.labelBelow ? +6 : -6))
        .attr("alignment-baseline", (e) => (e.labelBelow ? "hanging" : "bottom"))
        .attr("text-anchor", "middle")
        .text((e) => e.label);

    // update the existing elements
    branches
        .transition()
        .duration(500)
        .attr("class", (e) => ["branch", ...e.classes].join(" "))
        .attr("transform", (e) => {
            return `translate(${this.scales.x(e.v0.x)}, ${this.scales.y(e.v1.y)})`;
        })

        .select("path")
        .attr("d", (e,i) => branchPath(e,i))

        .select("text .branch-label .length")
        .attr("class", "branch-label length")
        .attr("dx", (e) => ((this.scales.x(e.v1.x) - this.scales.x(e.v0.x)) / 2))
        .attr("dy", (e) => (e.labelBelow ? +6 : -6))
        .attr("alignment-baseline", (e) => (e.labelBelow ? "hanging" : "bottom"))
        .attr("text-anchor", "middle")
        .text((e) => e.label);

    // EXIT
    // Remove old elements as needed.
    branches
        .exit().remove();
}

/**
 * Add axis
 */
function addAxis() {
    const xAxis = d3.axisBottom(this.scales.x)
        .tickArguments(this.settings.xAxisTickArguments);

    const xAxisWidth = this.scales.width - this.margins.left - this.margins.right;

    const axesLayer = this.svgSelection.select(".axes-layer");

    axesLayer
        .append("g")
        .attr("id", "x-axis")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${this.scales.height - this.margins.bottom + 5})`)
        .call(xAxis);

    axesLayer
        .append("g")
        .attr("id", "x-axis-label")
        .attr("class", "axis-label")
        .attr("transform", `translate(${this.margins.left}, ${this.scales.height - this.margins.bottom})`)
        .append("text")
        .attr("transform", `translate(${xAxisWidth / 2}, 35)`)
        .attr("alignment-baseline", "hanging")
        .style("text-anchor", "middle")
        .text(this.settings.xAxisTitle);
}

/** @module Graph */

// import {Type} from 'figtree';
/**
 * The graph class
 *
 * A class that takes an arrary of nodes and edges and provides a number of methods
 * for manipulating the graph.
 * @param nodes - an array of nodes. Should contain a unique id identifier
 * @param edges - an array of edges linking the nodes {source:node.id,target:node.id}
 */
class Graph{
    constructor(nodes=[],edges=[],settings={acyclicSelector:(e)=>true}) {
        
        this.nodeList = [];
        this.nodeMap = new Map();
        this.outGoingEdgeMap = new Map();
        this.incomingEdgeMap= new Map();
        this.edgeList = [];
        this.edgeMap = new Map();  
        this.acyclicSelector=settings.acyclicSelector;


        nodes.forEach(node=>this.addNode(node));
        edges.forEach(edge=>this.drawEdge(edge.source,edge.target));
        // This is used in identifying terminal tips  
    };
    /**
     * A static function to make a graph out of a tree
     * @param {*} tree 
     * @returns {Graph}
     */
    static fromPhylogeny(tree){
        const nodes = tree.externalNodes;
        // links inferred from the transmission layout
        // will also need a call back somewhere to update the links
        
    }
    /**
     * @returns {*}
     */
    get nodes(){
        return this.nodeList;
    }
    /**
     * @returns {*}
     */
    get externalNodes(){
        return this.nodeList.filter(d=>this.getOutgoingEdges().length===0);
    }
    /**
     * Adds a node to the graph.
     * @param {*} node 
     */
    addNode(node){
        if(!node.id){
            throw new Error(`All node's must contain an 'id' key ${node}`)
        }
        this.nodeList.push(node);
        if(this.nodeMap.has(node.id)){
            throw new Error(`All node's must have unique id values ${node.id} seen twice`)
        }
        this.nodeMap.set(node.id,node);

        this.outGoingEdgeMap.set(node,[]);
        this.incomingEdgeMap.set(node,[]);
    }
   
   /**
    * return a node given the key
    * @param {*} id the node id value 
    */
    getNode(id){
        return this.nodeMap.get(id);
    }
    
    /**
     * Get the edges entering a node
     * @param {*} node 
     * @returns {array} array of edges that end with the node
     */
    getIncomingEdges(node){
        return this.incomingEdgeMap.get(node)
     }
     /**
      * Get the edges leaving a node
      * @param {*} node 
      * @returns {array} array of edges that begin with the node
      */
 
     getOutgoingEdges(node){
         return this.outGoingEdgeMap.get(node)
     }
     /**
      * Get all the edges leaving and entering a node
      * @param {*} node
      * @returns {array} array of edges that touch node
      */
     getEdges(node){
         return (this.getOutgoingEdges(node).concat(this.getIncomingEdges(node)));
     }

    getNodeInfo(node){
        // const formatDate=d3.timeFormat("%Y-%m-%d")
        // let outString = `${node.id} </br>`
        // // for(const key of Object.keys(node)){
        // //     if(node[key]){
        // //         if(key!=="id"&& key!=="metaData"&&key!=="key"){
        // //             if(key.toLowerCase().indexOf("date")>-1){
        // //                 outString = `${outString}${key}: ${node[key].toISOString().substring(0, 10)}</br>`;
        // //                 }else{
        // //                 outString = `${outString}${key}: ${node[key]}</br>`;
        // //                 }            
        // //             }
        // //     }
        // // }
    
        // for(const key of Object.keys(node.metaData)){
        //     if(key.toLowerCase().indexOf("date")>-1){
        //     outString = `${outString}${key}: ${node.metaData[key].toISOString().substring(0, 10)}</br>`;
        //     }else{
        //     outString = `${outString}${key}: ${node.metaData[key]}</br>`;
        //     }
        // }
        // return outString;
    }

    /**
     * removes the node and incoming/outgoing edges
     * @param {object} node 
     */
   
    removeNode(node){
        //remove edges
        const edges = this.getEdges(node);
        edges.forEach(edge=>this.removeEdge(edge));

        const id=node.id;
        this.nodeList=this.nodeList.filter(node=>node.id!==id);
        this.nodeMap.delete(id);
        this.incomingEdgeMap.delete(node);
        this.outGoingEdgeMap.delete(node);
    }

    /**
    * @returns {*} 
    */
    get edges(){
    return this.edgeList;
    }
    
    /**
     * returns the edge
     * @param {Symbol()} id - symbol key of the edge
     * @returns {*} edge
     */
    getEdge(id){
        return this.edgeMap.get(id);
    }
    getEdgeInfo(edge){
        // // const formatDate=d3.timeFormat("%Y-%m-%d")
        // let outString = `Source:${edge.source.id} </br> Target: ${edge.target.id}</br>`;
        // for(const key of Object.keys(edge.metaData)){
        //     if(key.toLowerCase().indexOf("date")>-1){
        //     outString = `${outString}${key}: ${edge.metaData[key].toISOString().substring(0, 10)}</br>`;
        //     }else{
        //     outString = `${outString}${key}: ${edge.metaData[key]}</br>`;
        //     }
        // }
        // return outString;
    }
     /**
     * Adds an edge between the provide source and target nodes. It the nodes are not part of the graph they are added.
     * @param {String} sourceNode Id
     * @param {String} targetNode Id
     */
    drawEdge(sourceNodeId,targetNodeId){
        if(!this.nodeMap.has(sourceNodeId)){
            throw new Error(`${sourceNodeId} not found in graph`)
        }
        if(!this.nodeMap.has(targetNodeId)){
            throw new Error(`${targetNodeId} not found in graph`)
        }
        const index = this.edgeList.legnth;
        const edge = {source:this.getNode(sourceNodeId),target:this.getNode(targetNodeId),id:`edge_${index}`};
        this.addEdge(edge);
    }
    /**
     * Adds an premade edge which between the provide source and target nodes. It the nodes are not part of the graph they are added.
     * @param {*} {source:node, targe:node} 
     */
    addEdge(edge){
        this.edgeList.push(edge);
        this.edgeMap.set(edge.id,edge);
        this.outGoingEdgeMap.get(edge.source).push(edge);
        this.incomingEdgeMap.get(edge.target).push(edge);
    }
    

    /**
     * removes an edge from the graph
     * @param {*} edge 
     */
    removeEdge(edge){
        const id=edge.id;
        this.edgeList=this.edgeList.filter(edge=>edge.id!==id);

        // update edgemaps
        this.edgeMap.delete(id);
        // new outgoing
        const newOutgoing = this.getOutgoingEdges(edge.source).filter(e=>e!==edge);
        this.outGoingEdgeMap.set(edge.source,newOutgoing);
        const newIncoming = this.getIncomingEdges(edge.target).filter(e=>e!==edge);
        this.incomingEdgeMap.set(edge.target,newIncoming);

    }


    /**
     * Inserts a node into an edge. This replaced the edge with two new edges which pass through the node.
     * @param {*} node 
     * @param {*} edge 
     */
    insertNode(node,edge){
        if(!this.nodeMap.has(node.id)){
            this.addNode(node);
        }
        this.drawEdge(edge.source.id,node.id);
        this.drawEdge(node.id,edge.target.id);
        this.removeEdge(edge);
    }

    /**
     * A function to return a sub graph given an arrary of nodes.
     * @param {array} nodes - An array of nodes
     * @param {*} options - an optional object with filterEdges:function() that filters the edges used in the traversal
     * @returns {*} A graph object including the provided nodes and edges linking the node. If there is no path between all nodes the 
     * object will be empty 
     */
    getSubGraph(nodes,options={filterEdges:(e)=>true}){
        // check there is a path between all nodes
        // const preorder= [...this.preorder(nodes[0])];
        // if(nodes.some(n=>preorder.indexOf(n)===-1)){ 
        //     // If there is at least 1 node not hit in the traversal
        //     return new Graph();
        // }
        // const edges = nodes.map(n=>[...this.getOutgoingEdges(n).filter(e=>options.filterEdges(e)).filter(e=>nodes.indexOf(e.target)>-1),
        //                             ...this.getIncomingEdges(n).filter(e=>options.filterEdges(e)).filter(e=>nodes.indexOf(e.source)>-1)]);
        // const uniqueEdges = [...new Set(edges)];
        // const subGraph = new Graph();
        
        
        // return new Graph();

        // nodes,uniqueEdges)
       
    }

        /**
     * A function returning 
     * @param {*} nodes - An array of nodes
     * @param {*} options - an optional object with filterEdges:function() that filters the edges used in the traversal
     * @returns {*} 
     * Not yet implimented. Should each path be a sub-graph?
     */
    getPaths(node1,node2,options={filterEdges:(e)=>true}){
        // check there is a path between all nodes
        throw new Error("Not yet implimented");

       
    }

// -----------  Methods rejigged from figtree.js tree object -----------------------------
    /**
     * Reverses the order of the children of the given node. If 'recursive=true' then it will
     * descend down the subtree reversing all the sub nodes.
     *
     * @param node
     * @param recursive
     */
    // add options with edgeFilter callback
    rotate(node, options={recursive:false}) {
        const nodesToVisit = [...this.preorder(node)];
        const outGoingEdges=this.getOutgoingEdges(node);

            if (options.recursive) {
                for (const n of nodesToVisit) {
                    //Needs to avoid circulare loops 
                    const nOutGoingEdges=this.getOutgoingEdges(n);
                    nOutGoingEdges.reverse();
                }
            }else{
                outGoingEdges.reverse();

            }
        };

    /**
     * Sorts the child branches of each node in order of increasing or decreasing number
     * of tips. This operates recursively from the node given.
     *
     * @param node - the node to start sorting from
     * @param {boolean} increasing - sorting in increasing node order or decreasing?
     * @returns {number} - the number of tips below this node
     */
    order(node, increasing) {
        // // orderNodes.call(this, node, increasing, this.treeUpdateCallback);
        // orderNodes.call(this, node,increasing);
        // // this.treeUpdateCallback();
    }


    /**
     * A generator function that returns the nodes in a pre-order traversal. Starting at 
     * node. An optional options objects can be used to select which edges are used in the traversal
     * @param {*} node 
     * @param {object} options - an optional object with filterEdges:function() that filters the edges used in the traversal
     * @returns {IterableIterator<IterableIterator<*|*>>}
     */
    *preorder(node) {
        // We have to mark nodes as visited since it is possible to cycle back
        this.edgeList.forEach(e=>e.visited=false);
        this.nodeList.forEach(n => n.visited=false);
        const self = this;
        const traverse = function *(node){
            yield node;
            const edges = self.getEdges(node).filter(e=>self.acyclicSelector(e));
            // don't need all this if using acyclic edges
            if(edges.length>0){
                for(const edge of edges){
                    if(!edge.visited){
                        let nextNode;
                        if(node===edge.source){
                            nextNode = edge.target;
                        }else{
                            nextNode=edge.source;
                        }
                        if(!nextNode.visited){
                            edge.visited=true;
                            yield* traverse(nextNode);
                        }else{
                            edge.visited=true; // technically a back edge
                        }
                    }
                }
            }
        };
        yield* traverse(node);
        this.edgeList.forEach(e=> delete e["visited"]);
        this.nodeList.forEach(n => delete n["visited"]);
    }

    /**
     * A generator function that returns the nodes in a post-order traversal. Starting at 
     * node. An optional options objects can be used to select which edges are used in the traversal
     * @param {*} node 
     * @param {object} options - an optional object with filterEdges:function() that filters the edges used in the traversal
     * @returns {IterableIterator<IterableIterator<*|*>>}
     */
    *postorder(node) {
        // We have to mark nodes as visited since it is possible to cycle back
        this.edgeList.forEach(e=>e.visited=false);
        this.nodeList.forEach(n => n.visited=false);
        const self=this;
        const traverse = function *(node){
            const edges = self.getEdges(node).filter(e=>self.acyclicSelector(e));
            // don't need all this if using acyclic edges
            if(edges.length>0){
                for(const edge of edges){
                    if(!edge.visited){
                        let nextNode;
                        if(node===edge.source){
                            nextNode = edge.target;
                        }else{
                            nextNode=edge.source;
                        }
                        if(!nextNode.visited){
                            edge.visited=true;
                            yield* traverse(nextNode);
                        }else{
                            edge.visited=true; // technically a back edge
                        }
                    }
                }  
            }
            yield node;

        };
        yield* traverse(node);
        this.edgeList.forEach(e=> delete e["visited"]);
        this.nodeList.forEach(n => delete n["visited"]);
    }

}

export { ArcLayout, Bauble, CircleBauble, FigTree, Graph, Layout, RectangularBauble, RectangularLayout, TransmissionLayout, Tree, Type };
