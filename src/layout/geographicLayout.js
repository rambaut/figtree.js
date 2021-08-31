import {getClassesFromNode} from "./layoutHelpers";

export const geographicLayout=(projection)=>(figtree)=>{

    const id = figtree.id;
    const tree = figtree.tree();
    figtree.calculateScales(false)
    if(!tree.annotations.longitude){
        console.warn("tree must be annotated with longitude and latitiude")
        return [];
    }
    tree.nodes.forEach(n=> {
        const point =  projection([n.annotations.longitude,n.annotations.latitude])
        n[id].x= point[0] ;
        n[id].y= point[1];
        n[id].classes = getClassesFromNode(n);

        const leftLabel= !!n.children;
        const labelBelow= (!!n.children && (!n.parent || n.parent.children[0] !== n));
        n[id].textLabel={
            labelBelow,
            x:leftLabel?"-6":"12",
            y:leftLabel?(labelBelow ? "-8": "8" ):"0",
            alignmentBaseline: leftLabel?(labelBelow ? "bottom": "hanging" ):"middle",
            textAnchor:leftLabel?"end":"start",
        }
    });
}