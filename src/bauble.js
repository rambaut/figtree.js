"use strict";

/** @module bauble */


/**
 * The Bauble class
 *
 * This is a shape or decoration at the node of a tree or graph
 */
export class Bauble {
    static DEFAULT_SETTINGS() {
        return {
            vertexFilter: () => true
        };
    }

    /**
     * The constructor.
     */
    constructor(settings = {}) {
        this.settings = {...Bauble.DEFAULT_SETTINGS(), ...settings};
    }

    get vertexFilter() {
        return this.settings.vertexFilter;
    }

    createShapes(selection) {
        throw new Error("don't call the base class methods")
    }

    updateShapes(selection, border = 0) {
        throw new Error("don't call the base class methods")
    }

}

export class CircleBauble extends Bauble {
    static DEFAULT_SETTINGS() {
        return {
            radius: 6,
        };
    }

    /**
     * The constructor.
     */
    constructor(settings = {}) {
        super({...CircleBauble.DEFAULT_SETTINGS(), ...settings});
    }

    createShapes(selection) {
        return selection
            .append("circle");
    };

    updateShapes(selection, border = 0) {
        return selection
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", this.settings.radius + border);
    };
}

export class RectangularBauble extends Bauble {
    static DEFAULT_SETTINGS() {
        return {
            height: 16,
            width: 6,
            radius: 2,
        };
    }

    /**
     * The constructor.
     */
    constructor(settings = {}) {
        super({...RectangularBauble.DEFAULT_SETTINGS(), ...settings});
    }

    createShapes(selection) {
        return selection
            .append("rect");
    };

    updateShapes(selection, border = 0) {
        const w = this.settings.width + border;
        const h = this.settings.height + border;
        return selection
            .attr("x", - w / 2)
                .attr("width", w)
                .attr("y", - h / 2)
                .attr("height", h)
                .attr("rx", this.settings.radius)
                .attr("ry", this.settings.radius);
    };
}


/*
 * Private methods, called by the class using the <function>.call(this) function.
 */

