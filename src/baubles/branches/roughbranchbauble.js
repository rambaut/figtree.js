import {Bauble} from "../bauble";
import {mergeDeep} from "../../utilities";
import {Branch, branchPathGenerator} from "./branch";
import {roughFactory} from "../nodes/roughcirclebauble";
import {curveStepBefore} from "d3"
/** @module bauble */

export class RoughBranchBauble extends Branch {

    constructor(settings) {
        super()
        this._roughSettings={}

    }
    /**
     * settings passed to roughjs
     * @param string
     * @param value
     * @returns {RoughCircleBauble|*}
     */
    roughSetting(string,value=null){
        if(value){
            this._roughSettings[string] = value;
            return this
        }else{
            return this._roughSettings[string]
        }
    }

    branchPathGenerator() {
        const basicPathGenerator =  super.branchPathGenerator(this.manager()._figureId);
       const branchPath = edge=>{
            const basicPath=basicPathGenerator(edge);
            return [...roughFactory.path(basicPath,this._roughSettings).childNodes].map(d=>d.getAttribute("d"))[0]
        }
        return branchPath
    }

}

/**
 * branch is a helper function that returns a new branch instance.
 * @returns {BaubleManager|*}
 */
export function roughBranch(){
    return new RoughBranchBauble();
}