"use strict";

/** @module tree */

import uuid from "uuid";
// for unique node ids
export const Type = {
    DISCRETE : Symbol("DISCRETE"),
    BOOLEAN : Symbol("BOOLEAN"),
    INTEGER : Symbol("INTEGER"),
    FLOAT: Symbol("FLOAT"),
    PROBABILITIES: Symbol("PROBABILITIES"),
};

export const CollapseStyles = {
    TRIANGLE : Symbol("TRIANGLE"),
    BRANCH : Symbol("BRANCH"),
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
     */
    constructor(rootNode = {}) {
        this.heightsKnown = false;
        this.lengthsKnown = true;
        this.root = makeNode.call(this,{...rootNode});
        // This converts all the json objects to Node instances
        setUpNodes.call(this,this.root);

        this.origin = 0;
        this.annotations = {};
        this._nodeList = [...this.preorder()];
        this._nodeList.forEach( (node) => {
            if (node.label && node.label.startsWith("#")) {
                // an id string has been specified in the newick label.
                node.id = node.label.substring(1);
            }
            if(node.annotations){
            this.addAnnotations(node.annotations);
            }
        });
        this._nodeMap = new Map(this.nodeList.map( (node) => [node.id, node] ));
        this._tipMap = new Map(this.externalNodes.map( (tip) => [tip.name, tip] ));

        this.nodesUpdated = false;
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
        if(this.nodesUpdated){
            setUpArraysAndMaps.call(this);
        }
        return [...this.preorder()];
    };
    get nodeList(){
        if(this.nodesUpdated){
            setUpArraysAndMaps.call(this);

        }
        return this.nodes
    }

    /**
     * Gets an array containing all the external node objects
     *
     * @returns {*}
     */
    get externalNodes() {
        if(this.nodesUpdated){
            setUpArraysAndMaps.call(this);
        }
        return this.nodes.filter((node) => !node.children);
    };



    /**
     * Gets an array containing all the internal node objects
     *
     * @returns {*}
     */
    get internalNodes() {
        if(this.nodesUpdated){
            setUpArraysAndMaps.call(this);
        }
        return this.nodes.filter((node) => node.children );
    };

    get nodeMap(){
        if(this.nodesUpdated){
            setUpArraysAndMaps.call(this);
        }
        return this._nodeMap ;
    }
    get tipMap(){
        if(this.nodesUpdated){
            setUpArraysAndMaps.call(this);
        }
        return this._tipMap ;
    }

    /**
     * Returns the sibling of a node (i.e., the first other child of the parent)
     *
     * @param node
     * @returns {object}
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
     * @returns {object}
     */
    getNode(id) {
        return this.nodeMap.get(id);
    }

    /**
     * Returns an external node (tip) from its name.
     *
     * @param name
     * @returns {object}
     */
    getExternalNode(name) {
        return this.tipMap.get(name);
    }

    /**
     * If heights are not currently known then calculate heights for all nodes
     * then return the height of the specified node.
     * @param node
     * @returns {number}
     */
    getHeight(node) {
        return node.height;
    }

    setOrigin(origin){
        this.origin = origin;
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
                    sibling._length = rootLength;
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
            rootChild2._length = l;
            rootChild1._length = rootChild1.length - l;

        } else {
            // the root is staying the same, just the position of the root changing
            const l = node.length * (1.0 - proportion);
            node._length = l;
            this.getSibling(node)._length = rootLength - l;
        }

        this.heightsKnown = false;


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
    orderByNodeDensity(increasing = true, node = this.rootNode) {
        const factor = increasing ? 1 : -1;
        orderNodes.call(this, node, (nodeA, countA, nodeB, countB) => {
            return (countA - countB) * factor;
        }, callback);
        this.treeUpdateCallback();
    }

    /**
     * Sorts the child branches of each node in order given by the function. This operates
     * recursively from the node given.
     *
     * @param node - the node to start sorting from
     * @param {function} ordering - provides a pairwise sorting order.
     *  Function signature: (nodeA, childCountNodeA, nodeB, childCountNodeB)
     * @returns {number} - the number of tips below this node
     */
    order(ordering, node = this.rootNode) {

        orderNodes.call(this, node, ordering);

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
     * Adds a collapse flag to the node whose dependents will be collapsed by the layout. How the clade is collapsed depends on the the
     * style.
     * @param node - the mrca of the clade that is to be collapsed
     * @param style -  The style in which to collapse the clade. Can be one of the CollapseStyles. TRIANGLE - returns a triangle,
     * BRANCH reduces the clade to a single branch which extends to the most recent tip.
     */
    collapse(node,style){
        node.collapse = style;
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
                        })
                    }
                } else {
                    // if no splitLocations are given then split it in the middle.
                    this.splitBranch(node, 0.5);
                }
            });
        this.treeUpdateCallback();

    }

    /**
     * Splits a branch in two inserting a new degree 2 node. The splitLocation should be less than
     * the orginal branch length.
     * @param node
     * @param splitLocation - proportion of branch to split at.
     */
    splitBranch(node, splitLocation=0.5) {
        const oldLength = node.length;

        const splitNode = makeNode.call(this,
            {
            parent: node.parent,
            children: [node],
            length: oldLength*splitLocation,
            annotations: {
                insertedNode: true
            }
        });
        if (node.parent) {
            node.parent.children[node.parent.children.indexOf(node)] = splitNode;
        } else {
            // node is the root so make splitNode the root
            this.root = splitNode;
        }
        node.parent = splitNode;
        node._length = oldLength-splitNode.length;
        this.nodesUpdated=true;
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
                // is a set of  values
                let type;
                if(addValues.map(v=>isNaN(v)).reduce((acc,curr)=>acc&&curr,true)) {
                    type = Type.DISCRETE;
                    annotation.type = type;
                    if (!annotation.values) {
                        annotation.values = new Set();
                    }
                    annotation.values.add(...addValues);
                }else if(addValues.map(v=>parseFloat(v)).reduce((acc,curr)=>acc&&Number.isInteger(curr),true)){
                    type =Type.INTEGER;
                }else if(addValues.map(v=>parseFloat(v)).reduce((acc,curr)=>acc&&!Number.isInteger(curr),true)){
                    type = Type.FLOAT;
                }

                if (annotation.type && annotation.type !== type) {
                    if ((type === Type.INTEGER && annotation.type === Type.FLOAT) ||
                        (type === Type.FLOAT && annotation.type === Type.INTEGER)) {
                        // upgrade to float
                        type = Type.FLOAT;
                        annotation.type = Type.FLOAT;
                        if(annotation.values){
                            delete annotation.values;
                    }else{
                            throw Error(`existing values of the annotation, ${key}, in the tree is discrete.`);
                        }
                    }
                }

                // annotation.values = annotation.values? [...annotation.values, ...addValues]:[...addValues]
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
                        if (sum > 1.01) {
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
                    keys.push(key);
                }

                if (annotation.type && annotation.type !== type) {
                    throw Error(`existing values of the annotation, ${key}, in the tree is not of the same type`);
                }

                annotation.type = type;
                annotation.values = annotation.values? [...annotation.values, addValues]:[addValues]
            } else {
                let type = Type.DISCRETE;

                if (typeof addValues === typeof true) {
                    type = Type.BOOLEAN;
                } else if (!isNaN(addValues)) {
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
        const tokens = newickString.split(/\s*('[^']+'|"[^"]+"|;|\(|\)|,|:|=|\[&|\]|\{|\})\s*/);
        let level = 0;
        let currentNode = null;
        let nodeStack = [];
        let labelNext = false;
        let lengthNext = false;
        let inAnnotation = false;
        let annotationKeyNext = true;
        let annotationKey;
        let isAnnotationARange=false;

        for (const token of tokens.filter(token => token.length > 0)) {
            // console.log(`Token ${i}: ${token}, level: ${level}`);
            if(inAnnotation){
                if(token==="="){
                    annotationKeyNext=false;
                }else if(token===","){
                    if(!isAnnotationARange){
                        annotationKeyNext=true;
                    }
                }else if (token==="{"){
                    isAnnotationARange=true
                    currentNode.annotations[annotationKey]=[];
                }else if (token==="}"){
                    isAnnotationARange=false
                }
                else if(token ==="]"){
                    // close BEAST annotation
                    inAnnotation = false;
                    annotationKeyNext = true;
                } else{
                    // must be annotation
                    // remove any quoting and then trim whitespace
                    let annotationToken = token;
                    if (annotationToken.startsWith("\"") || annotationToken.startsWith("'")) {
                        annotationToken = annotationToken.substr(1);
                    }
                    if (annotationToken.endsWith("\"") || annotationToken.endsWith("'")) {
                        annotationToken = annotationToken.substr(0, annotationToken.length - 1);
                    }
                    if(annotationKeyNext) {
                        annotationKey = annotationToken.replace(".","_");
                    }else{
                        if(isAnnotationARange){
                            currentNode.annotations[annotationKey].push(annotationToken);
                        }else{
                            if(isNaN(annotationToken)){
                                currentNode.annotations[annotationKey]=annotationToken;

                            }else{
                                currentNode.annotations[annotationKey] = parseFloat((annotationToken));
                            }
                        }
                    }
                }

            } else if (token === "(") {
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
            } else if(token ==="[&") {
                inAnnotation=true;
            }
            else {
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
                        parent: currentNode,
                        annotations: { date: date }
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
 * A private recursive function that rotates nodes to give an ordering provided
 * by a function.
 * @param node
 * @param ordering
 * @param callback an optional callback that is called each rotate
 * @returns {number}
 */
function orderNodes(node, ordering, callback = null) {
    let count = 0;
    if (node.children) {
        // count the number of descendents for each child
        const counts = new Map();
        for (const child of node.children) {
            const value = orderNodes(child, ordering, callback);
            counts.set(child, value);
            count += value;
        }

        // sort the children using the provided function
        node.children.sort((a, b) => {
            return ordering(a, counts.get(a), b, counts.get(b))
        });

        if (callback) callback();
    } else {
        count = 1
    }
    return count;
}

/**
 * A private recursive function that calculates the height of each node (with the most
 * diverged tip from the root having height given by origin).
 * @param origin
 */
function calculateHeights(origin=this.origin) {
    this.setOrigin(origin);
    let maxDivergence = [ 0.0 ];
    calculateDivergence(this.root, this.origin, maxDivergence);

    this.nodeList.forEach((node) => node._height = maxDivergence[0] - node.divergence );
    this.heightsKnown = true;
}

/**
 * A private recursive function that calculates the length of the branch below each node
 */
function calculateLengths(){

    this.nodeList.forEach((node)=> node.length =node.parent? node.height - node.parent.height:0);

    this.lengthsKnown=true;
    this.treeUpdateCallback();

}

function calculateDivergence(node, divergence, maxDivergence) {
    let d = divergence + node.length;
    if (node.children) {
        // count the number of descendents for each child
        for (const child of node.children) {
            calculateDivergence(child, d, maxDivergence);
        }
    }
    if (d > maxDivergence[0]) {
        maxDivergence[0] = d;
    }
    node.divergence = d;
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
function makeNode(nodeData){
    return new Node({...nodeData, tree:this});
}

/**
 * A private function that sets up the tree by traversing from the root Node and sets all heights and lenghts
 * @param node
 */
function setUpNodes(node){
    if(node.children){
        const childrenNodes=[]
        for(const child of node.children){
            const childNode = makeNode.call(this,{...child,parent:node})
            childrenNodes.push(childNode);
            setUpNodes.call(this,childNode);
        }
        node.children = childrenNodes;
    }
}

function setUpArraysAndMaps() {
    this._nodeList = [...this.preorder()];
    this.nodesUpdated=false;
    this._nodeList.forEach((node) => {
        if (node.label && node.label.startsWith("#")) {
            // an id string has been specified in the newick label.
            node.id = node.label.substring(1);
        }
        if (node.annotations) {
            this.addAnnotations(node.annotations);
        }
    });
    this._nodeMap = new Map(this.nodeList.map((node) => [node.id, node]));
    this._tipMap = new Map(this.externalNodes.map((tip) => [tip.name, tip]));
}

class Node{



    static DEFAULT_NODE(){
        return{
            height:undefined,
            length:undefined,
            name:null,
            annotations:{},
            parent:undefined,
            children:null,
            label:undefined,
            level:undefined,
        }


    }
    constructor(nodeData ={}){
        const data = {...Node.DEFAULT_NODE(),...nodeData};

        this._id = `node-${uuid.v4()}`;
        this._height = data.height;
        this._length = data.length;
        this._name = data.name;
        this._annotations= data.annotations;
        this._parent = data.parent;
        this._children = data.children;
        this._tree = data.tree;
        this._label = data.label;
        this._level = data.level;

    }
    get level() {
        return this._level;
    }
    get name() {
        return this._name;
    }

    set level(value) {
        this._level = value;
    }
    get label() {
        return this._label;
    }

    set label(value) {
        this._label = value;
    }
    get height() {
        if(!this._tree.heightsKnown){
            calculateHeights.call(this._tree);
        }
        return this._height;
    }

    set height(value) {
        this._height = value;
        this._tree.lengthsKnown=false;
        this._tree.treeUpdateCallback();
    }

    get length() {
        if(!this._tree.lengthsKnown){
            calculateLengths.call(this._tree);
        }
        return this._length;
    }

    set length(value) {
        this._length = value;
        this._tree.heightsKnown = false;
        this._tree.treeUpdateCallback();
    }

    get annotations() {
        return this._annotations;
    }

    set annotations(value) {
        this._annotations = value;
    }

    get children() {
        return this._children;
    }

    set children(value) {
        this._children = value;
        for(const child of this._children){
            child.parent=this;
        }
    }
    get parent() {
        return this._parent;
    }
    set parent(node) {
        this._parent = node;
        if(this._parent.children.filter(c=>c===this).length===0){
            this._parent.children.append(this)
        }
    }
    get id(){
        return this._id;
    }
    set id(value){
        this._id = value;
    }


}
