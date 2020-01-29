import {isFunction} from "../utilities";


// also but some case specific helper functions for each style.

export default class Ornament{
    constructor() {

        this.type = null;
        this._layout = ".ornament-layer";
        this._x=0;
        this._y=0;
        return this;
    }

    update(){
        throw(new Error("Don't call methods from the master class"))
    }
    title(options=null){
        if(!options){
            return this._title;
        }else{
            this._title={...this._title,...options};
            return this;
        }
    }
    layer(l=null){
        if(l) {
            this._layer = l;
            return this;
        }
        else{
            return this._layer;
        }
    }
    figure(f=null){
        if(f) {
            this._figure = f;
            return this;
        }
        else{
            return this._figure;
        }
    }


}


