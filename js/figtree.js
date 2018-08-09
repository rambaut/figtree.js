/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/figtree.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/figtree.js":
/*!************************!*\
  !*** ./src/figtree.js ***!
  \************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _tree__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tree */ \"./src/tree.mjs\");\n\n\nconst newickString = `((((((virus1:0.1 ,virus2:0.12):0.08,(virus3:0.011,virus4:0.0087):0.15):0.03,virus5:0.21):0.2,(virus6:0.45,virus7:0.4):0.02):0.1,virus8:0.4):0.1,(virus9:0.04,virus10:0.03):0.6);`;\n\nconst tree = _tree__WEBPACK_IMPORTED_MODULE_0__[\"Tree\"].parseNewick(newickString);\n\nconst newNewick = tree.toNewick();\n\nconsole.log(newickString);\nconsole.log(newNewick);\nconsole.log();\nconsole.log(`All nodes: ${tree.nodes.length}`);\nconsole.log(`External nodes: ${tree.externalNodes.length}`);\nconsole.log(`External nodes: ${tree.externalNodes.map(node => node.name).join(\", \")}`);\nconsole.log(`Internal nodes: ${tree.internalNodes.length}`);\n\nconsole.log(`All nodes: ${[...tree.preorder()].map(node => node.name ? node.name : \"node\").join(\", \")}`);\nconsole.log(`All nodes: ${[...tree.postorder()].map(node => node.name ? node.name : \"node\").join(\", \")}`);\n\ntree.rotate(tree.rootNode, true);\nconsole.log(`Rotated: ${tree.toNewick()}`);\n\ntree.order(tree.rootNode, true);\nconsole.log(`Increasing: ${tree.toNewick()}`);\n\ntree.order(tree.rootNode, false);\nconsole.log(`Decreasing: ${tree.toNewick()}`);\n\ntree.reroot(tree.externalNodes[0]);\nconsole.log(`Rerooted: ${tree.toNewick()}`);\n\nconsole.log(\"Root node key: \", tree.rootNode.key, tree.getNode(tree.rootNode.key));\nconsole.log(\"Root parent: \", tree.rootNode.parent);\n\nconsole.log(\"RTT: \" + tree.rootToTipLengths());\n\n//# sourceURL=webpack:///./src/figtree.js?");

/***/ }),

/***/ "./src/tree.mjs":
/*!**********************!*\
  !*** ./src/tree.mjs ***!
  \**********************/
/*! exports provided: Tree */
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Tree\", function() { return Tree; });\n/** @module tree */\n\n/**\n * The Tree class\n */\nclass Tree {\n\n    /**\n     * The constructor takes an object for the root node. The tree structure is\n     * defined as nested node objects.\n     *\n     * @constructor\n     * @param {object} rootNode - The root node of the tree as an object.\n     */\n    constructor(rootNode = {}) {\n        this.root = rootNode;\n\n        this.nodeList = [...this.preorder()];\n        this.nodeList.forEach( (node, index) => node.key = Symbol(`node ${index}`) );\n        this.nodeMap = new Map(\n            this.nodeList.map( (node) => [node.key, node] )\n        );\n    };\n\n    /**\n     * Gets the root node of the Tree\n     *\n     * @returns {Object|*}\n     */\n    get rootNode() {\n        return this.root;\n    };\n\n    /**\n     * Gets an array containing all the node objects\n     *\n     * @returns {*[]}\n     */\n    get nodes() {\n        return [...this.nodeList];\n    };\n\n    /**\n     * Gets an array containing all the external node objects\n     *\n     * @returns {*}\n     */\n    get externalNodes() {\n        return this.nodes.filter((node) => !node.children);\n    };\n\n    /**\n     * Gets an array containing all the internal node objects\n     *\n     * @returns {*}\n     */\n    get internalNodes() {\n        return this.nodes.filter((node) => node.children );\n    };\n\n    /**\n     * Returns a node from its key (a unique Symbol) stored in\n     * the node as poperty 'key'.\n     *\n     * @param key\n     * @returns {*}\n     */\n    getNode(key) {\n        return this.nodeMap.get(key);\n    }\n\n    /**\n     * A generator function that returns the nodes in a pre-order traversal.\n     *\n     * @returns {IterableIterator<IterableIterator<*|*>>}\n     */\n    *preorder() {\n        const traverse = function *(node) {\n            if (node.children) {\n                for (const child of node.children) {\n                    yield* traverse(child);\n                }\n            }\n            yield node;\n        };\n\n        yield* traverse(this.root);\n    }\n\n    /**\n     * A generator function that returns the nodes in a post-order traversal\n     *\n     * @returns {IterableIterator<IterableIterator<*|*>>}\n     */\n    *postorder() {\n        const traverse = function *(node) {\n            yield node;\n            if (node.children) {\n                for (const child of node.children) {\n                    yield* traverse(child);\n                }\n            }\n        };\n\n        yield* traverse(this.root);\n    }\n\n    /**\n     * An instance method to return a Newick format string for the Tree. Can be called without a parameter to\n     * start at the root node. Providing another node will generate a subtree. Labels and branch lengths are\n     * included if available.\n     *\n     * @param {object} node - The node of the tree to be written (defaults as the rootNode).\n     * @returns {string}\n     */\n    toNewick(node = this.rootNode) {\n        return (node.children ? `(${node.children.map(child => this.toNewick(child)).join(\",\")})${node.label ? node.label : \"\"}` : node.name) + (node.length ? `:${node.length}` : \"\");\n    };\n\n    /**\n     * Re-roots the tree at the midway point on the branch above the given node.\n     *\n     * @param {object} node - The node to be rooted on.\n     */\n    reroot(node) {\n        if (!node.parent || !node.parent.parent) {\n            // the node is the root or a child of the root - nothing to do\n            return;\n        }\n\n        const rootLength = this.rootNode.children[0].length + this.rootNode.children[1].length;\n\n        let parent = node.parent;\n        let ancestor = node;\n\n        const rootChild1 = node;\n        const rootChild2 = parent;\n\n        while (parent.parent) {\n            parent.children = parent.children.filter((child) => child !== ancestor);\n            if (parent.parent === this.rootNode) {\n                const sibling = parent.parent.children.find((child) => child !== parent);\n                parent.children.push(sibling);\n                sibling.length = rootLength;\n            } else {\n                [parent.length, parent.parent.length] = [parent.parent.length, parent.length];\n                parent.children.push(parent.parent);\n            }\n            ancestor = parent;\n            parent = parent.parent;\n        }\n\n        // reuse the root node as root\n        this.rootNode.children = [rootChild1, rootChild2];\n        rootChild2.length = rootChild1.length = rootChild1.length * 0.5;\n\n        // connect all the children to their parents\n        this.internalNodes.forEach( (node) => {\n            node.children.forEach( (child) => child.parent = node )\n        } );\n    };\n\n    /**\n     * Reverses the order of the children of the given node. If 'recursive=true' then it will\n     * descend down the subtree reversing all the sub nodes.\n     *\n     * @param node\n     * @param recursive\n     */\n    rotate(node, recursive = false) {\n        if (node.children) {\n            if (recursive) {\n                for (const child of node.children) {\n                    this.rotate(child, recursive);\n                }\n            }\n            node.children.reverse();\n        }\n    };\n\n    /**\n     * Sorts the child branches of each node in order of increasing or decreasing number\n     * of tips. This operates recursively from the node give.\n     *\n     * @param node - the node to start sorting from\n     * @param {boolean} increasing - sorting in increasing node order or decreasing?\n     * @returns {number} - the number of tips below this node\n     */\n    order(node, increasing = true) {\n        const factor = increasing ? 1 : -1;\n        let count = 0;\n        if (node.children) {\n            const counts = new Map();\n            for (const child of node.children) {\n                const value = this.order(child, increasing);\n                counts.set(child, value);\n                count += value;\n            }\n            node.children.sort((a, b) => (counts.get(a) - counts.get(b) * factor));\n        } else {\n            count = 1\n        }\n        return count;\n    };\n\n    /**\n     * Gives the distance from the root to a given tip (external node).\n     * @param tip - the external node\n     * @returns {number}\n     */\n    rootToTipLength(tip) {\n        let length = 0.0;\n        let node = tip;\n        while (node.parent) {\n            length += node.length;\n            node = node.parent;\n        }\n        return length;\n    }\n\n    /**\n     * Returns an array of root-to-tip distances for each tip in the tree.\n     * @returns {*}\n     */\n    rootToTipLengths() {\n        return this.externalNodes.map((tip) => this.rootToTipLength(tip));\n    }\n\n    /**\n     * A class method to create a Tree instance from a Newick format string (potentially with node\n     * labels and branch lengths). Taxon labels should be quoted (either \" or ') if they contain whitespace\n     * or any of the tree definitition characters '(),:;' - the quotes (and any whitespace immediately within)\n     * will be removed.\n     * @param newickString - the Newick format tree as a string\n     * @returns {Tree} - an instance of the Tree class\n     */\n    static parseNewick(newickString) {\n        const tokens = newickString.split(/\\s*('[^']+'|\"[^\"]+\"|;|\\(|\\)|,|:)\\s*/);\n\n        let level = 0;\n        let currentNode = null;\n        let nodeStack = [];\n        let labelNext = false;\n        let lengthNext = false;\n\n        for (const token of tokens.filter(token => token.length > 0)) {\n            // console.log(`Token ${i}: ${token}, level: ${level}`);\n            if (token === '(') {\n                // an internal node\n\n                if (labelNext) {\n                    // if labelNext is set then the last bracket has just closed\n                    // so there shouldn't be an open bracket.\n                    throw new Error(\"expecting a comma\");\n                }\n\n                let node = {\n                    level: level,\n                    parent: currentNode,\n                    children: []\n                };\n                level += 1;\n                if (currentNode) {\n                    nodeStack.push(currentNode);\n                }\n                currentNode = node;\n\n            } else if (token === ',') {\n                // another branch in an internal node\n\n                labelNext = false; // labels are optional\n                if (lengthNext) {\n                    throw new Error(\"branch length missing\");\n                }\n\n                let parent = nodeStack.pop();\n                parent.children.push(currentNode);\n\n                currentNode = parent;\n            } else if (token === ')') {\n                // finished an internal node\n\n                labelNext = false; // labels are optional\n                if (lengthNext) {\n                    throw new Error(\"branch length missing\");\n                }\n\n                // the end of an internal node\n                let parent = nodeStack.pop();\n                parent.children.push(currentNode);\n\n                level -= 1;\n                currentNode = parent;\n\n                labelNext = true;\n            } else if (token === ':') {\n                labelNext = false; // labels are optional\n                lengthNext = true;\n            } else if (token === ';') {\n                // end of the tree, check that we are back at level 0\n                if (level > 0) {\n                    throw new Error(\"unexpected semi-colon in tree\")\n                }\n                break;\n            } else {\n                // not any specific token so may be a label, a length, or an external node name\n                if (lengthNext) {\n                    currentNode.length = parseFloat(token);\n                    lengthNext = false;\n                } else if (labelNext) {\n                    currentNode.label = token;\n                    labelNext = false;\n                } else {\n                    // an external node\n                    if (!currentNode.children) {\n                        currentNode.children = []\n                    }\n\n                    let name = token;\n                    // remove any quoting and then trim whitespace\n                    if (name.startsWith(\"\\\"\") || name.startsWith(\"'\")) {\n                        name = name.substr(1);\n                    }\n                    if (name.endsWith(\"\\\"\") || name.endsWith(\"'\")) {\n                        name = name.substr(0, name.length - 1);\n                    }\n\n                    const externalNode = {\n                        name: name.trim(),\n                        parent: currentNode\n                    };\n\n                    if (currentNode) {\n                        nodeStack.push(currentNode);\n                    }\n                    currentNode = externalNode;\n                }\n            }\n        }\n\n        if (level > 0) {\n            throw new Error(\"the brackets in the newick file are not balanced\")\n        }\n\n        return new Tree(currentNode);\n    };\n}\n\n\n//# sourceURL=webpack:///./src/tree.mjs?");

/***/ })

/******/ });