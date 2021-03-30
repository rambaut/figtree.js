import {getClassesFromNode} from "./layoutHelpers";
import {max, min} from "d3";

export const rootToTipLayout=(predicate=(n)=>true)=>(figtree)=>{

    const id = figtree.id;
    const tree = figtree.tree();
    if(!tree.annotations.date){
        console.warn("tree must be annotated with dates to use the root to tip layout")
        return [];
    }
    tree.externalNodes.forEach(n=> {
        n[id].x= n.annotations.date;
        n[id].y= n.divergence;
        n[id].classes = getClassesFromNode(n);
        n[id].textLabel={
            labelBelow:false,
            x:"12",
            y:"0",
            alignmentBaseline: "middle",
            textAnchor:"start",
        }
    });
    tree.internalNodes.forEach(n=>{
        n[id].ignore=true;
    })
    figtree.regression = makeTrendlineEdge(predicate,id)(tree.externalNodes);

}
// TODO add edges from tips to parent on trendline to compare outliers.
const makeTrendlineEdge=(predicate,id)=>(vertices)=>{

    const usedVertices = vertices.filter(predicate);
    const regression  = leastSquares(usedVertices,id);

    let x1 = min(vertices, d => d[id].x);
    let x2 = max(vertices, d => d[id].x);
    let y1 = 0.0;
    let y2 = max(usedVertices, d => d[id].y);
    if (usedVertices.length > 1 && regression.slope > 0.0) {
        x1 = regression.xIntercept;
        y2 =regression.y(x2)
    }else if(usedVertices> 1 && regression.slope < 0.0 ){
        x2 = regression.xIntercept;
        y1= regression.y(x1);
        y2=0;
    }

    const startPoint = {[id]:{classes:"trendline",x:x1,y:y1,ignore:false,hidden:true,collapse:false}};
    const endPoint = {[id]:{classes:"trendline",x:x2,y:y2,ignore:false,hidden:true,collapse:false}};

    return {
        points:[startPoint,endPoint],
        ...regression
    }
};



/**
 * returns slope, intercept and r-square of the line
 * @param data
 * @returns {{slope: number, xIntercept: number, yIntercept: number, rSquare: number, y: (function(*): number)}}
 */
function leastSquares(data,id) {

    const xBar = data.reduce((a, b) => (a + b[id].x), 0.0) / data.length;
    const yBar = data.reduce((a, b) => (a + b[id].y), 0.0) / data.length;

    const ssXX = data.map((d) => Math.pow(d[id].x - xBar, 2))
        .reduce((a, b) => a + b, 0.0);

    const ssYY = data.map((d) => Math.pow(d[id].y - yBar, 2))
        .reduce((a, b) => a + b, 0.0);

    const ssXY = data.map((d) => (d[id].x - xBar) * (d[id].y - yBar))
        .reduce((a, b) => a + b, 0.0);

    const slope = ssXY / ssXX;
    const yIntercept = yBar - (xBar * slope);
    const xIntercept = -(yIntercept / slope);
    const rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

    return {
        slope, xIntercept, yIntercept, rSquare, y: function (x) {
            return x * slope + yIntercept
        }
    };
}