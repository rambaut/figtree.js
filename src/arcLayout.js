"use strict";

/** @module layout */

import { Layout } from "./layout.js";
import { Type } from "./tree.js";
// const d3 = require("d3");
import {format,curveLinear,extent,line,range} from "d3";
import {scaleLinear} from "d3";
/**
 * The ArcLayout class
 * note the function in the settings that placed the nodes on the xaxis a 0,1 range. The horizontal range is always 0->1. it is this funciton's job
 * To map the nodes to that space. the default is the 
 * node's index in the node list.
 */
export class ArcLayout extends Layout {

    static DEFAULT_SETTINGS() {
        return {
            lengthFormat: format(".2f"),
            edgeWidth:2,
            xFunction:(n,i,t)=>i/t.length,
            branchCurve:curveLinear,
            curve:'arc',
            
        };
    }

    /**
     * The constructor.
     * @param graph
     * @param settings
     */
    constructor(graph, settings = { }) {
        super();

        this.graph = graph;
        this.annotations={};
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
        this._horizontalRange = [0,1];
        this._verticalRange = [-this.graph.nodes.length,this.graph.nodes.length];

        // get the nodes in pre-order (starting at first node)
        // const nodes = [...this.graph.preorder(this.graph.nodes[0])];
        const nodes = [...this.graph.nodes];
        nodes.forEach(n=>this.addAnnotations(n));

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
                // console.log(v.x)
                v.classes = [
                    (!this.graph.getOutgoingEdges(v.node).length>0? "external-node" : "internal-node"),
                    (v.node.isSelected ? "selected" : "unselected")];

                // if (v.node.annotations) {
                    v.classes = [
                        ...v.classes,
                        ...this.getAnnotations(v.node)]
                // }

                this.nodeMap.set(v.node, v);
            });

        if (edges.length === 0) {
            this.edgeMap = new Map();

            // create the edges (only done if the array is empty)
            const dataEdges = this.graph.edges;
            dataEdges
                .forEach((e, i) => {
                    const edge = {
                        // The source and targets here are nodes in the graph;
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
                e.v0 = this.nodeMap.get(e.v0.node);
                e.classes = [];


                // if (e.v1.node.annotations) {
                    e.classes = [
                        ...e.classes,
                        ...this.getAnnotations(e.v1.node)]

                // }
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

    /* This methods also checks the values are correct and conform to previous annotations
    * in type.
    *
    * @param annotations
    */
   addAnnotations(datum) {
       for (let [key, addValues] of Object.entries(datum)) {
           if(addValues instanceof Date||  typeof addValues === 'symbol'){
               continue; // don't handel dates yet
           }
            let annotation = this.annotations[key];
           if (!annotation) {
               annotation = {};
               this.annotations[key] = annotation;
           }

           if(typeof addValues === 'string' || addValues instanceof String){
               // fake it as an array
               addValues = [addValues];
           }
           if (Array.isArray(addValues)) {
               // is a set of discrete values or 
               const type = Type.DISCRETE;

               if (annotation.type && annotation.type !== type) {
                   throw Error(`existing values of the annotation, ${key}, in the tree is not of the same type`);
               }
               annotation.type = type;
               annotation.values = annotation.values? [...annotation.values, ...addValues]:[...addValues]
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
               annotation.values = annotation.values? [...annotation.values, ...addValues]:[...addValues]
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

   getAnnotations(datum){
    const annotationClasses=[ ...Object.entries(datum)
                         .filter(([key]) => {
                             if(!this.annotations[key]){
                                 return false;
                             }
                             return this.annotations[key].type === Type.DISCRETE ||
                                 this.annotations[key].type === Type.BOOLEAN ||
                                 this.annotations[key].type === Type.INTEGER;
                         })
                         .map(([key, value]) => `${key}-${value}`)];
     return annotationClasses
 }
// Takes in scales and returns a function that will draw the branch paths given each edge and index as input.
// branches have been translated so 0,0 is the top left hand corner of the group - 
    branchPathGenerator(scales){
            const branchPath =(e,i)=>{
                let points;
            if(this.settings.curve==="bezier"){
                const sign = i%2===0?1:-1;
                
                const startingP = {x:0,
                                    y: scales.y(e.v0.y)-scales.y(e.v1.y)}; // which is 0 in the defualt setting
                const endingP = {x:scales.x(e.v1.x)-scales.x(e.v0.x),
                                y: 0};
                const correctingFactor =  Math.abs(startingP.x-endingP.x)/(scales.x.range()[1]-scales.x.range()[0]); // so the longer the arc the heigher it goes
                const controlPoint = {"x":startingP.x,
                                        "y":sign*scales.y(scales.y.domain()[1])*correctingFactor};
                const controlPoint1 = {"x":startingP.x,//+endingP.x)/3,
                                        "y":sign*scales.y(scales.y.domain()[1])*correctingFactor};
                    
                const controlPoint2 = {"x":endingP.x,//+endingP.x)/3,
                                        "y":sign*scales.y(scales.y.domain()[1])*correctingFactor};
                points = cubicBezier(startingP,controlPoint1,controlPoint2,endingP)
                // points = quadraticBezier(startingP,controlPoint,endingP)
            }else{
                const r = (scales.x(e.v1.x) - scales.x(e.v0.x))/2
                const a = r; // center x position
                const sign = i%2===0?1:-1;
                const x = range(0,scales.x(e.v1.x) - scales.x(e.v0.x),1)//step every pixel
                const y = x.map(x=>circleY(x,r,a,sign));
                points = x.map((x,i)=>{
                    return{x:x,y:y[i]}
                }) 
            }

                const branchLine = line()
                     .x((v) => v.x)
                    .y((v) => v.y)
                    .curve(this.branchCurve);
      
            return(
                branchLine(
                    points
                )
            )
            
        }
        return branchPath;
    }

}


/*
 * Private methods, called by the class using the <function>.call(this) function.
 */
function circleY(x,r,a,sign){
        return  sign*(Math.sqrt(Math.pow(r,2)-Math.pow((x-a),2)))
}

/** Draws a quadraic bezier curve between two points
 * 
 * @param {*} p0 - starting point {x:,y:}
 * @param {*} p1 - control point {x:,y:}
 * @param {*} p2- ending point {x:,y:}
 */
function quadraticBezier(p0,p1,q){
    const points = [];
    for(let t =0; t<=1;t+=0.01){
        const x = Math.pow((1-t),2)*p0.x+2*(1-t)*t*p1.x+Math.pow(t,2)*p2.x;
        const y = Math.pow((1-t),2)*p0.y+2*(1-t)*t*p1.y+Math.pow(t,2)*p2.y;
        points.push({"x":x,"y":y});
    }
    return points;
}
/**
 * Cubic Bezier curves
 * @param {*} p0 -starting point
 * @param {*} p1 - ending point
 * @param {*} q0 control points
 * @param {*} q1 - control point 2
 */
function cubicBezier(p0,p1,p2,p3){

    const points = [];
    for(let t =0; t<=1;t+=0.01){
        const x = Math.pow((1-t),3)*p0.x + 3*Math.pow((1-t),2)*t*p1.x +  3*(1-t)*Math.pow(t,2)*p2.x + Math.pow(t,3)*p3.x;
        const y = Math.pow((1-t),3)*p0.y + 3*Math.pow((1-t),2)*t*p1.y +  3*(1-t)*Math.pow(t,2)*p2.y + Math.pow(t,3)*p3.y;
        points.push({"x":x,"y":y});
    }
    return points;
}

