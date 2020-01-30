import {BaubleManager} from "../features/baubleManager";
import p from "../privateConstants";
import {Axis} from "../baubles/axes";
import uuid from "uuid";
import {mergeDeep} from "../utilities";
import {axisBottom, axisLeft, axisRight, axisTop} from "d3";

export class decoration {
    constructor() {
        this._created = false;
        this._title={
            text:"",
            xPadding:0,
            yPadding:0,
            rotation:0
        };
        this._id= `s${uuid.v4()}`;
    }

    figure(f = null) {
        if (f === null) {
            return this._figure;
        } else {
            this._figure = f;
            return this;
        }
    }
    layer(l=null){
        if(l===null){
            return this._layer
        }else{
            this._layer=l;
            return this
        }
    }

    title(options = null) {
        if (!options) {
            return this._title;
        } else {
            this._title = {...this._title, ...options};
            return this;
        }
    }


    on(string, value) {
        this._interactions[string] = value;
        return this;
    }

    transitions(t = null) {
        if (t === null) {
            if (this._transitions) {
                return this._transitions;
            } else {
                return this.figure().transitions();
            }

        } else {
            this._transitions = t;
            return this;
        }
    }

    scales(scales = null) {
        if (scales) {
            this._scales = scales
        } else {
            if (this._scales) {
                return this._scales;
            } else {
                return this.figure().scales
            }
        }
    }


    create(selection) {
        throw new Error("Don't call the base class method")
    };

    update(selection) {
        if (!this._created) {
            this.create(selection);
            this._created = true;
        }
        this.updateCycle();
    }

    updateCycle(selection) {
        throw new Error("Don't call the base class method")
    }

    x(d = null) {
        if (d !== null) {
            this._x = d;
            return this;
        } else {
            return this._x;
        }
    }

    y(d = null) {
        if (d !== null) {
            this._y = d;
            return this;
        } else {
            return this._y;
        }
    }
}

