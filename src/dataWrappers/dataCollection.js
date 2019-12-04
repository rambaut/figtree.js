import {isFunction} from "../utilities";
//TODO refactor into nodes and branches that can act like
// .nodes(circlebauble)
// instead of .nodes().elements()


// also but some case specific helper functions for each style.

export default class DataCollection{
    constructor(data, figure) {

        this.figure = figure;
        this.data = data;
        this.elementMap = new Map();
        this.attrs={};
        this.interactions={};
        this.elementMaker=null;
        this.labelMaker=null

        return new Proxy(this,
            { get : function(target, prop)
                {
                    if(target[prop] === undefined){
                        return figure[prop];
                    }
                    else{

                        return target[prop];
                    }

                }
            });
    }
    updateData(data){
        this.data = data;
        //remake elements
        this.elements(this.elementMaker);
        // update element styles
        for(const [key,value] of Object.entries(this.attrs)){
            this.attr(key,value);
        }
        for(const [key,value] of Object.entries(this.interactions)){
            this.on(key,value);
        }
        this.label(this.labelMaker);
        //set transition attributes to sync elements

    }

    elements(b=null) {
        if(b){
            this.elementMaker=b;
        }
        if(this.elementMaker) {
            if (!isFunction(this.elementMaker)) {
                for (const d of this.data) {
                    this.elementMap.set(d.key, new this.elementMaker())
                }
            } else if (this.elementMaker instanceof Function) {
                for (const d of this.data) {
                    const element = this.elementMaker(d.key);
                    if (element) {
                        this.elementMap.set(d.key, new this.elementMaker(d))
                    }
                }
            }
            for (const el of this.elementMap.values()) {
                el.transitions(this.figure.transitions())
            }
            return this;
        }
        return this.elementMap;
    }
    attr(string, f) {
        this.attrs[string]=f;
        if (f instanceof Function) {
            for (const d of this.data) {
                if (f(d)) {
                    const element = this.elementMap.get(d.key);
                    if (element) {
                        element.attr(string, f(d))
                    }
                }
            }
        } else {
            for (const d of this.data) {
                const element = this.elementMap.get(d.key);
                if (element) {
                    element.attr(string, f)
                }
            }
        }
        return this;
    }

    on(string,f){
        this.interactions[string]=f;
        for (const d of this.data) {
            const element = this.elementMap.get(d.key);
            if (element) {
                element.on(string, f(element))
            }
        }
        return this;
    }

    label(l){
        if(l) {
            this.labelMaker = l;
        }
        if(this.labelMaker) {
            if (this.labelMaker instanceof Function) {
                for (const d of this.data) {
                    if (this.labelMaker(d)) {
                        d.textLabel=this.labelMaker(d)
                    }
                }
            }else{
                for (const d of this.data) {
                    if(d[this.labelMaker]){
                        d.textLabel=d[this.labelMaker]
                    }
                }
            }
        }
        return this;
    }


}


