import uuid from "uuid";

/**
 * The base Decoration class. Decorations are elements in the figure that can update but don't map directly
 * to nodes and branches.
 */


export class Decoration {
    constructor() {
        this._created = false;
        this._title={
            text:"",
            xPadding:0,
            yPadding:0,
            rotation:0
        };
        this._id= `s${uuid.v4()}`;
        this._interactions=[];
        this._x=0;
        this._y=0;
    }
    /**
     * Get or set svg layer elements will be added to.
     * @param l
     * @return {BaubleManager|*}
     */
    figure(f = null) {
        if (f === null) {
            return this._figure;
        } else {
            this._figure = f;
            return this;
        }
    }
    /**
     * Get or set the figtree instance this manager works for. This allows the manager to access the figure's scale ect.
     * @param f
     * @return {BaubleManager|*}
     */
    layer(l=null){
        if(l===null){
            return this._layer
        }else{
            this._layer=l;
            return this
        }
    }

    /**{
     * Getter, setter for Decoration title. The options are below and are passed to the d3 text element.
     * @param options
     * @return {Decoration|{rotation: number, text: string, xPadding: number, yPadding: number}}
     */
    title(options = null) {
        if (!options) {
            return this._title;
        } else {
            this._title = {...this._title, ...options};
            return this;
        }
    }

    /**
     * Set a call back to be fired when the event listener is triggered.
     * @param eventListener - a string that defines the event listener
     * @param value -  call back that will be passed d,i,n
     * @return {Decoration}
     */
    on(string, value) {
        this._interactions[string] = value;
        return this;
    }

    /**
     * Get or set the transition duration and ease. Defualts to the figtree instance.
     * @param t - {Object} [t={tranmsissionDuration: transmissionEase:}]
     * @return {Bauble|BaubleManager|*|Bauble}
     */
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
    /**
     * Get or set the scales used in the element defaults to the figtree instance.
     * @param scales
     * @return {Bauble.scales|*}
     */
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

    /**
     * Decorations have a create method which enters them onto a selection and an updateCycle method
     * that updated the already existing object. These are all handled by the update method in the parent class
     * @param selection
     */
    create(selection) {
        throw new Error("Don't call the base class method")
    };
    /**
     * Decorations have a create method which enters them into a selection and an updateCycle method
     * that updated the already existing object. These are all handled by the update method in the parent class.
     * @param nodes that are in the figure
     */
    update(nodes) {
        if (!this._created) {
            this.create(nodes);
            this._created = true;
        }
        this.updateCycle(nodes);
    }
    /**
     * Decorations have a create method which enters them into a selection and an updateCycle method
     * that updated the already existing object. These are all handled by the update method in the parent class.
     * @param nodes
     */
    updateCycle(nodes) {
        throw new Error("Don't call the base class method")
    }

    /**
     * get or set the x position for the decorations
     * @param d
     * @return {*|Decoration}
     */
    x(d = null) {
        if (d !== null) {
            this._x = d;
            return this;
        } else {
            return this._x;
        }
    }
    /**
     * get or set the y position for the decorations
     * @param d
     * @return {*|Decoration}
     */
    y(d = null) {
        if (d !== null) {
            this._y = d;
            return this;
        } else {
            return this._y;
        }
    }

    scaledY(d = null) {
    if (d !== null) {
        this._y = this.scales().y(d);
        return this;
        } else {
        return this._y;
    }
}

    scaledX(d = null) {
        if (d !== null) {
            this._x = this.scales().x(d);
            return this;
        } else {
            return this._x;
        }
    }

}

