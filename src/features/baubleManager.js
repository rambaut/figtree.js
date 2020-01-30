import {isFunction} from "../utilities";
import {select} from "d3";


// also but some case specific helper functions for each style.

export  class BaubleManager{
    constructor(type=null) {

        this.type = null;
        this._baubleHelpers=[];
        this._filter = ()=>true;

        return this;
    }
    layer(l=null){
        if(l===null){
            return this._layer
        }else{
            this._layer=l;
            return this
        }
    }

    figure(f=null){
        if(f===null) {
            return this._figure;
        }
        else{
            this._figure=f;
            return this;
        }
    }

    element(b){
        b.manager(this);
        this._baubleHelpers=this._baubleHelpers.concat(b);
        return this;
    }
    filter(f=null){
        if(f===null) {
            return this._filter;
        }
        else{
            this._filter=f;
            return this;
        }
    }

    class(c=null){
        if(c===null) {
            return this._class;
        }
        else{
            this._class=c;
            return this;
        }
    }
    data(f=null){
        if(f===null){
            return this._data
        }else{
            this._data = f;
            return this;
        }
    }

    update(data){
        const usedData = this._data(data).filter(this.filter());
        const self=this;
        if(this._figure===null||this._class===null||this._layer===null||this.data()===null){
            console.warn("incomplete element manager");
            return
        }
        let svgLayer;
        svgLayer = this.figure().svgSelection.select(`.${this.layer()}`);
        if(svgLayer.empty()){
            svgLayer = this.figure().svgSelection.append("g").attr("class",this.layer());
        }
        svgLayer.selectAll(`.${this.class()}`)
            .data(usedData, (d) => `${this.class()}_${d.key}`)
            .join(
                enter => enter
                    .append("g")
                    .attr("id", (d) => d.key)
                    .attr("class", (d) => [`${this.class()}`, ...d.classes].join(" "))
                    .attr("transform", (d) => {
                        return `translate(${this.figure().scales.x(d.x)}, ${this.figure().scales.y(d.y)})`;
                    })
                    .each(function (d) {
                       for(const bauble of self._baubleHelpers){
                           bauble.update(select(this));
                       }
                    }),
                update => update
                    .call(update => update.transition()
                        .duration(this.figure().transitions().transitionDuration)
                        .ease(this.figure().transitions().transitionEase)
                        .attr("class", (d) => [`${this.class()}`, ...d.classes].join(" "))
                        .attr("transform", (d) => {
                            return `translate(${this.figure().scales.x(d.x)}, ${this.figure().scales.y(d.y)})`;
                        })
                        .each(function (d) {
                            for(const bauble of self._baubleHelpers){
                                bauble.update(select(this));
                            }
                        })
                    )
            );
    }



}


