(function (exports) {
    "use strict";

    exports = exports || window;
    exports.jas = exports.jas || {};

    /**
     * Module 'jas'
     * @exports jas
     * @namespace
     */
    var jas = exports.jas;

    //
    // This module implements an user interface for interacting with 
    // an automata graph.
    // 
    // Look at some examples:
    // http://bl.ocks.org/mbostock/4600693
    // http://bl.ocks.org/MoritzStefaner/1377729
    // http://bl.ocks.org/rkirsling/5001347
    // http://bl.ocks.org/benzguo/4370043
    // http://tutorials.jenkov.com/svg/svg-and-css.html // SVG and CSS



/*jslint bitwise: true */

// Returns a [deep] copy of the given object
function clone(obj, deep) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    var copy = obj.constructor();

    var key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            copy[key] = deep ? clone(obj[key], true) : obj[key];
        }
    }
    return copy;
}



// Converts all numerical values of the object and its properties to integers
function float2int(obj) {
    var key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            switch (typeof obj[key]) {
            case 'number':
                obj[key] |= 0;
                break;
            case 'object':
                float2int(obj[key]);
                break;
            }
        }
    }
}

/**
 * Sets a hook for a method call for the given object. Acts as a simple observer of object's methods.
 * @memberOf jas
 * @param  {Object} object An object.
 * @param  {Function} method A method of the object.
 * @param  {Function} hook A callback function which will be called after the call of object's method.
 * @param  {Function} [context] Context wich will passed to the hook instead of `this`.
 * @return {Function} after Returns itself for chained calls.
 */
function after(object, method, hook, that) {
    var old = object[method];
    if (typeof old !== 'function' || typeof hook !== 'function') {
        throw new Error('the parameters must be functions');
    }
    object[method] = function () {
        that = that || this;
        var ret = old.apply(this, arguments);
        hook.apply(that, arguments);
        return ret;
    };
    return after;
}



//
// 2D Vector Methods
//
var vec = {

    length : function (v) { return Math.sqrt(v[0] * v[0] + v[1] * v[1]); },

    normalize : function (v, out) {
        var len = this.length(v);
        len = 1 / len;
        out[0] = v[0] * len;
        out[1] = v[1] * len;
        return out;
    },

    orthogonal : function (v, out) {
        out[0] =  v[1];
        out[1] = -v[0];
        return out;
    },

    scale : function (a, rate, out) {
        out[0] = a[0] * rate;
        out[1] = a[1] * rate;
        return out;
    },

    add : function (a, b, out) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        return out;
    },

    subtract : function (a, b, out) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        return out;
    },

    copy : function (src, dst) {
        dst[0] = src[0];
        dst[1] = src[1];
        return dst;
    }
};



// This file implements a router object, which routes events to other objects.
// At the core of the router there is a list of target objects. Each target
// object should notify the router when it recieves the user focus.
// Only one object can have the user focus. Objects can notify the router when
// they lost focus. It may happen when no object has focus.

// JSLint options:
/*global d3*/


var router = (function () {
	"use strict";
	// var objects = [];
	var current;

	return {
		// Takes 'handler' and later calls it if events occure
		// Pass 'null' to remove the handler
		handle: function (handler) {
			current = handler;
			// if (objects.indexOf(handler) < 0) {
			// 	objects.push(handler);
			// }
		},
		// Handler for events which will be routed to current handler
		handler: function () {
			if (current && typeof(current) === 'function') {
				current.apply(this, arguments);
			}
		}
	};
}());


d3.select(window)
    .on('keydown', router.handler)
    .on('keyup', router.handler);




// JSLint options:
/*global vec, View, d3 */
/*jslint bitwise: true */

var elements = {};

var NODE_RADIUS = 16;
var INITIAL_LENGTH = NODE_RADIUS * 1.6;
//
// Methods to calculate loop, stright and curved lines for links
// 
elements.make_edge = (function () {
    "use strict";
    var v = [0, 0]; // temporal vector
    // var r = node_radius;
    var norm = [0, 0];
    var r = NODE_RADIUS;
    // Constants for calculating a loop
    var K = (function () {
        var ANGLE_FROM = Math.PI / 3;
        var ANGLE_TO = Math.PI / 12;
        return {
            DX1 : r * Math.cos(ANGLE_FROM),
            DY1 : r * Math.sin(ANGLE_FROM),
            DX2 : r * 4 * Math.cos(ANGLE_FROM),
            DY2 : r * 4 * Math.sin(ANGLE_FROM),
            DX3 : r * 4 * Math.cos(ANGLE_TO),
            DY3 : r * 4 * Math.sin(ANGLE_TO),
            DX4 : r * Math.cos(ANGLE_TO),
            DY4 : r * Math.sin(ANGLE_TO),
            NX : Math.cos(ANGLE_FROM - Math.PI / 24),
            NY : Math.sin(ANGLE_FROM - Math.PI / 24)
        };
    }());


    return {
        r1 : 0, // radiuses
        r2 : 0,
        // Calculates vectors of edge from given vectors 'v1' to 'v2'
        // Substracts radius of nodes 'r' from both vectors
        stright : function (v1, v2) {
            vec.subtract(v2, v1, v);    // v = v2 - v1
            vec.normalize(v, norm);     // norm = normalized v
            vec.scale(norm, this.r1, v);     // v = norm * r
            vec.add(v1, v, v1);         // v1 = v1 + v
            vec.scale(norm, this.r2, v);     // v = norm * r
            vec.subtract(v2, v, v2);    // v2 = v2 - v
            // Middle of the vector
            // cv[0] = (v1[0] + v2[0])/2
            // cv[1] = (v1[1] + v2[1])/2
        },
        // Calculates vectors of a dragged edge
        // Substracts radius of nodes 'r' from the first vector
        // Substracts radius of nodes 'r' from the last vector if to_node is true
        drag : function (v1, v2, to_node) {
            vec.subtract(v2, v1, v);    // v = v2 - v1
            vec.normalize(v, norm);     // v = normalized v
            vec.scale(norm, this.r2, v);     // v = v * r
            vec.add(v1, v, v1);         // v1 = v1 + v
            if (to_node) {
                vec.subtract(v2, v, v2); // if subtract # v2 = v2 - v
            }
        },
        // Calculates vectors of Bezier curve for curved edge
        curve : function (v1, v2, cv) {
            vec.subtract(v2, v1, v);
            vec.normalize(v, norm);
            cv[0] = (v1[0] + v2[0]) * 0.5 + norm[1] * this.r1 * 2;
            cv[1] = (v1[1] + v2[1]) * 0.5 - norm[0] * this.r2 * 2;
            vec.copy(cv, v);
            this.stright(v1, v);
            vec.copy(cv, v);
            this.stright(v2, v);
        },
        loop : function (v1, v2, cv1, cv2) {
            // Some Bazier calc (http://www.moshplant.com/direct-or/bezier/math.html)
            vec.copy(v1, v);
            // Coordinates of the Bazier curve (60 degrees angle)
            v1[0] = v[0] + K.DX1;
            v1[1] = v[1] - K.DY1;
            //
            cv1[0] = v[0] + K.DX2;
            cv1[1] = v[1] - K.DY2;
            //
            cv2[0] = v[0] + K.DX3; // 15 degrees
            cv2[1] = v[1] - K.DY3;
            //
            v2[0] = v[0] + K.DX4;
            v2[1] = v[1] - K.DY4;
        }
    };

}());



// Returns SVG string for a graph edge
elements.get_edge_transformation = (function () {
    "use strict";
    var v1 = [0, 0];
    var v2 = [0, 0];
    var cv = [0, 0];
    var cv2 = [0, 0];
    return function (d) {
        v1[0] = d.source.x;
        v1[1] = d.source.y;
        v2[0] = d.target.x;
        v2[1] = d.target.y;
        elements.make_edge.r1 = d.source.r !== undefined ? d.source.r : 16;
        elements.make_edge.r2 = d.target.r !== undefined ? d.target.r : 16;
        // text coordinates (between the edge's nodes, by default)
        d.tx = (d.source.x + d.target.x) >>> 1;
        d.ty = (d.source.y + d.target.y) >>> 1;
        switch (d.type) {
        case 1:
            elements.make_edge.curve(v1, v2, cv);
            // d.tx = cv[0];
            // d.ty = cv[1];
            d.tx = (cv[0] + v2[0]) >>> 1;
            d.ty = (cv[1] + v2[1]) >>> 1;
            break;
        case 2:
            elements.make_edge.loop(v1, v2, cv, cv2);
            d.tx = (cv[0] + cv2[0]) >>> 1;
            d.ty = (cv[1] + cv2[1]) >>> 1;
            break;
        default:
            elements.make_edge.stright(v1, v2);
        }
        // Keep link points for further use (i.e. link selection)
        d.x1 = v1[0];
        d.y1 = v1[1];
        d.x2 = v2[0];
        d.y2 = v2[1];
        switch (d.type) {
        case 1:
            return 'M' + v1[0] + ',' + v1[1] + 'Q' + cv[0] + ',' + cv[1] + ',' + v2[0] + ',' + v2[1];
        case 2:
            return 'M' + v1[0] + ',' + v1[1] + 'C' + cv[0] + ',' + cv[1] + ',' + cv2[0] + ',' + cv2[1] + ',' + v2[0] + ',' + v2[1];
        default:
            return 'M' + v1[0] + ',' + v1[1] + 'L' + v2[0] + ',' + v2[1];
        }
    };
}());


var b = true;

elements.get_node_transformation = function (d) {
    if (!d || d.x === undefined || d.y === undefined) { return ''; }
    return "translate(" + d.x + "," + d.y + ")";
};



function node_radius(d) {
    if (d && d.r) {
        return d.r;
    }
    return NODE_RADIUS;
}

function node_marked_radius(d) {
    if (d && d.r) {
        return d.r;
    }
    return NODE_RADIUS - 3;
}

elements.mark_node = function (selection) {
    // Mark what is not marked already
    // Note that we don't mark nodes which are marked already
    selection
        .filter(function (d) { return !!d.marked && d3.select(this).select('circle.marked').empty(); })
        .append('circle')
        .attr('r', node_marked_radius)
        .classed('marked', true);
    // Unmark    
    selection.filter(function (d) { return !d.marked; })
        .selectAll('circle.marked')
        .remove();
};


// Adds\removes elements which make a node look as the inital state
elements.initial = function (selection, show) {
    if (arguments.length < 2 || !!show) {
        selection.append('path')
            .attr('class', 'edge')
            .attr('marker-end', 'url(#marker-arrow)')
            .attr('d', function () { return 'M' + (-NODE_RADIUS - INITIAL_LENGTH) + ',0L' + (-NODE_RADIUS) + ',0'; });
        // selection.classed('initial', false);
    } else {
        selection.select('path.edge').remove();
    }
};


// Adds SVG elements representing graph nodes
elements.add_node = function (selection, handler) {
    var g = selection.append('g')
        .attr('transform', elements.get_node_transformation)
        .on('mousedown', handler)
        .on('mouseup', handler)
        .on('mouseover', handler)
        .on('mouseout', handler)
        .on('dblclick', handler);

    g.append('circle')
        .attr('r', node_radius);

    g.call(elements.mark_node);

    g.append('text')
        // .style('text-anchor', 'middle')
        .attr('alignment-baseline', 'center')
        .text(function (d) { return d.text || ''; });

    elements.initial(g.filter(function (d) { return !!d.initial; }));
};



// Adds SVG elements representing graph links/edges
// Returns root of the added elements
elements.add_edge = function (selection, handler) {
    var g = selection.append('g')
        .on('mousedown', handler)
        .on('mouseup', handler)
        .on('mouseover', handler)
        .on('mouseout', handler)
        .on('dblclick', handler);
        // .on('mousemove', handler);

    g.append('path')
        .attr('class', 'edge') // CSS class style
        .attr('marker-end', 'url(#marker-arrow)');

    g.append('path')
        .attr('class', 'catch');

    g.append('text')
        // .style('text-anchor', 'middle')
        .attr('alignment-baseline', 'center')
        .text(function (d) { return d.text || ''; });

    return g;
};


// JSLint options:
/*global window*/

/**
 * Textarea control element with auto-resize.
 * Inspired from:
 * http://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
 * http://jsfiddle.net/CbqFv/
*/


// Creates <input> HTML object with unique ID and attach it to the textarea object
var textarea = (function () {
    var UID = 'c88d9c30-5871-11e4-8ed6-0800200c9a66';
    var editor = null;
    var parent = null;
    var _enter = null;
    var _cancel = null;



    function cancel() {
        if (typeof _cancel === 'function') { _cancel.apply(this, arguments); }
        editor.remove();
    }


    function enter() {
        if (typeof _enter === 'function') { _enter.apply(this, arguments); }
        editor.remove();
    }


    function keydown() {
        switch (d3.event.keyCode) {
        case 13: // Enter
            enter.apply(this, arguments);
            break;
        case 27: // Escape
            cancel.apply(this, arguments);
            break;
        default:
            d3.event.stopPropagation();
            delayedResize();
        }
        return null;
    }

    function resize() {
        editor.each(function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }

    function delayedResize() {
        window.setTimeout(resize, 0);
    }

    return function (d3selection, text, x, y, onEnter, onCancel) {
        if (editor) {
            editor.remove();
        }
        parent = d3selection;
        x = x || 0;
        y = y || 0;
        _enter = onEnter;
        _cancel = onCancel;

        // Get height of 1em symbol 
        // Taken from [http://stackoverflow.com/questions/10463518/converting-em-to-px-in-javascript-and-getting-default-font-size]
        var h = Number(getComputedStyle(document.body, null).fontSize.match(/(\d*(\.\d*)?)px/)[1]);
        // Adjust textarea vertically
        if (!isNaN(h)) {
            h /= 2;
            y -= h;
        }

        editor = parent.append('textarea')
            .attr('id', UID)
            .attr('rows', 1)
            .style('position', 'absolute')
            // .style('width', '4em')
            .style('height', '1em')
            .style('left', x + 'px')
            .style('top', y + 'px')
            .attr('placeholder', 'Type here...');

        editor
            .on('blur', enter)
            .on('change', resize)
            .on('keydown', keydown)
            .on('cut', delayedResize)
            .on('drop', delayedResize)
            .on('paste', delayedResize);

        editor.each(function () {
            this.value = text;
            this.focus();
            this.select();
        });

        resize();
    };
}());


window.textarea = textarea;
// JSLint options:
/*global d3*/


// Return object which implements panoramic behaviour for given container
function pan(container) {
    "use strict";
    var a_xy = [0, 0]; // Absolute coordinates
    var d_xy = [0, 0]; // Delta coordinates
    var p_xy = [0, 0]; // Previous coordinates
    var fnc = function () {
        return [a_xy[0], a_xy[1]];
    };

    fnc.start = function () {
        p_xy[0] = d3.event.pageX;
        p_xy[1] = d3.event.pageY;
    };

    fnc.mouse = function () {
        // return [mouse[0] - a_xy[0], mouse[1] - a_xy[1]];
        return d3.mouse(container[0][0]);
    };

    fnc.to_mouse = function () {
        d_xy[0] = d3.event.pageX - p_xy[0];
        d_xy[1] = d3.event.pageY - p_xy[1];
        p_xy[0] = d3.event.pageX;
        p_xy[1] = d3.event.pageY;
        a_xy[0] += d_xy[0];
        a_xy[1] += d_xy[1];
        container.attr('transform', 'translate(' + a_xy[0] + ',' + a_xy[1] + ')');
    };

    return fnc;
}



// JSLint options:
/*global d3, ed, elements, pan*/

// Structure of SVG tree:
// <svg>
//   <g>
//     <g .nodes>
//       <g>
//         <circle>
//         <circle .marked>
//         <text>
//         <path .edge> // for initial node\state
//     <g .edges>
//       <g>
//         <path .edge>
//         <path .catch>


// Returns new empty graphoo
function get_empty_graph() {
    return {
        nodes: [],
        edges: []
    };
}



// Returns true if link 'a' is counter to link 'b'
function has_counter_edge(d) {
    return (this.target === d.source) && (this.source === d.target);
}



// Set type of the link (0-stright, 1-curved, 2-loop)
function set_edge_type(d) {
    if (d.source === d.target) {
        d.type = 2;
    } else if (this._graph.edges.filter(has_counter_edge, d).length > 0) {
        d.type = 1;
    } else {
        d.type = 0;
    }
}



// Returns text for SVG styling
function embedded_style() {
    // Embedded SVG styling
    var style = [
        'g.nodes circle {',
        'fill: dodgerblue;',
        'stroke: #555;',
        'stroke-width: 0.09em;',
        'fill-opacity: 0.5;',
        '}',

        'path.edge {',
        'fill: none;',
        'stroke: #333;',
        'stroke-width: 0.09em;',
        '}',

        'path.catch {',
        'fill: none;',
        '}',

        ' .nodes text, .edges text {',
        'font-size: small;',
        'font-family: Verdana, sans-serif;',
        'pointer-events: none;',
        'text-anchor: middle;',
        'dominant-baseline: central;',
        '}'
    ].join('');

    return style;
}



function View(aContainer, aGraph) {
    "use strict";
    var self = this;

    // Create SVG elements
    var container = d3.select(aContainer || 'body');

    // Default dimension of SVG element
    var width = 500;
    var height = 300;

    var svg = container.append('svg')
        // .attr('xmlns', 'http://www.w3.org/2000/svg')
        // .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
        .attr('width', width)
        .attr('height', height)
        .classed('unselectable', true)
        // Disable browser popup menu
        .on('contextmenu', function () { d3.event.preventDefault(); });

    // Returns View.prototype.selection_rectangle object with context of 
    // current SVG object
    this.selection_rectangle = function () {
        return View.prototype.selection_rectangle.context(svg);
    };

    // Returns View.prototype.select object with context of current object
    this.select = function () {
        return View.prototype.select.context(self, root_group);
    };

    // Handles nodes events
    this.node_handler = undefined;
    // Handles edge events
    this.edge_handler = undefined;
    // Handles plane (out of other elements) events
    function plane_handler() {
        if (typeof self.plane_handler === 'function') {
            self.plane_handler.apply(this, arguments);
        }
    }

    // Makes current view focused and requests routing of window events (keys) to it
    function focus() {
        router.handle(plane_handler);
    }

    svg.on('mousedown', plane_handler)
        .on('mouseover', focus)
        .on('mouseup', plane_handler)
        .on('mousemove', plane_handler)
        // .on('mouseout', plane_handler)
        .on('dblclick', plane_handler)
        .on('dragstart', function () { d3.event.preventDefault(); });

    // Arrow marker
    var defs = svg.append('svg:defs');

    defs.append('svg:marker')
            .attr('id', 'marker-arrow')
            .attr('orient', 'auto')
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('refX', 6)
            .attr('refY', 3)
        .append('svg:path')
            .attr('d', 'M0,0 L6,3 L0,6');


    defs.append('style').html(embedded_style());

    var root_group = svg.append('g');

    this.transform = function () {
        self.node.attr('transform', elements.get_node_transformation);
        self.edge.each(self.transform_edge);
    };

    var force = d3.layout.force()
        .charge(-800)
        .linkDistance(150)
        .chargeDistance(450)
        .size([width, height])
        .on('tick', this.transform);

    this.spring = (function () {
        var started = false;
        var fn = function (start) {
            if (arguments.length) {
                if (start) {
                    if (started) {
                        force.resume();
                    } else {
                        force.start();
                        started = true;
                    }
                } else {
                    force.stop();
                    started = false;
                }
            }
            return started;
        };
        fn.on = function () { if (started) { force.resume(); } };
        fn.off = function () { if (started) { force.stop(); } };
        return fn;
    }());

    this.node = root_group.append('g').attr('class', 'nodes').selectAll('g');
    this.edge = root_group.append('g').attr('class', 'edges').selectAll('g');

    this.pan = pan(root_group);

    this.svg = svg;
    this.container = container;

    this.force = force;

    // Attach graph
    this.graph(aGraph);
}



function view_methods() {

    // Helpers
    // Calls function 'fun' for a single datum or an array of data
    function foreach(d, fun) {
        if (d instanceof Array) {
            d.forEach(fun);
        } else {
            fun(d);
        }
    }

    // Returns an unique identifier
    var uid = (function () {
        var id = 0;
        return function () {
            return id++;
        };
    }());


    // Returns key of the datum
    function key(d) {
        if (d.uid === undefined) { d.uid = uid(); }
        return d.uid;
    }

    // Returns subselection filtered w.r.t 'd' or [d, ..., d]
    function filter(selection, d) {
        if (d instanceof Array) {
            return selection.filter(function (v) { return d.indexOf(v) >= 0; });
        }
        return selection.filter(function (v) { return v === d; });
    }


    function update_nodes() {
        this.node = this.node.data(this.graph().nodes, key);
        this.node.enter().call(elements.add_node, this.node_handler);
        this.node.exit().remove();
    }


    function update_edges() {
        this.edge = this.edge.data(this.graph().edges, key);
        this.edge.enter().call(elements.add_edge, this.edge_handler);
        this.edge.exit().remove();
    }


    // Return whether graph nodes have coordnates
    function has_no_coordinates(nodes) {
        var ret = false;
        nodes.forEach(function (v, index) {
            if (v.x === undefined) { v.x = index; ret = true; }
            if (v.y === undefined) { v.y = index; ret = true; }
        });
        return ret;
    }

    // Returns whether at least one edge reffers to the nodes by indexe rather then objects
    // function has_indexes(edges) {
    //     var ret = false;
    //     edges.forEach(function (v) { if (typeof v.source === 'number' || typeof v.target === 'number') { ret = true; } });
    //     return ret;
    // }


    // Removes key for each element of the array
    function delete_keys(array, key) {
        array.forEach(function (o) { delete o[key]; });
    }

    // Returns a graph attached to the view.
    // If new graph is given, attches it to the view.
    this.graph = function (graph) {
        if (arguments.length > 0) {
            this._graph = null;
            this._graph = graph || get_empty_graph();
            // Delete old 'uid' keys
            delete_keys(this._graph.nodes, 'uid');
            delete_keys(this._graph.edges, 'uid');

            // Replace indexes by nodes in each edge.[source, target]
            var self = this;
            this._graph.edges.forEach(function (edge) {
                if (typeof edge.source === "number") { edge.source = self._graph.nodes[edge.source]; }
                if (typeof edge.target === "number") { edge.target = self._graph.nodes[edge.target]; }
            });
            if (has_no_coordinates(this._graph.nodes)) { this.spring(true); }
            this.update();
        }
        return this._graph;
    };


    this.size = function (width, height) {
        if (arguments.length) {
            this.svg.attr('width', width).attr('height', height);
            this.force.size([width, height]);
        }
    };


    // Updates SVG structure according to the graph structure
    this.update = function () {
        var is_spring = this.spring();
        if (is_spring) { this.spring(false); }
        update_nodes.call(this);
        update_edges.call(this);
        this.force.nodes(this._graph.nodes).links(this._graph.edges);
        if (is_spring) { this.spring(true); }

        var self = this;
        // Identify type of edge {int} (0-straight, 1-curved, 2-loop)
        this.edge.each(function () {
            set_edge_type.apply(self, arguments);
        });

        this.transform();
    };



    this.node_text = function (d, text) {
        filter(this.node, d).select('text').text(text);
    };

    this.mark_node = function (d) {
        var nodes = filter(this.node, d);
        nodes.call(elements.mark_node);
    };


    this.edge_text = function (d, text) {
        filter(this.edge, d).select('text').text(text);
    };


    this.edge_by_data = function (d) {
        return filter(this.edge, d);
    };

    // Methods for visual selection

    // Adds/removes a CSS class for node[s] to show them selected
    this.select_node = function (d, val) {
        var self = this;
        val = val === undefined ? true : !!val;
        foreach(d, function (v) {
            filter(self.node, v).select('circle').classed('selected', val);
        });
    };


    // Adds/removes a CSS class for edge[s] to show them selected
    this.select_edge = function (d, val) {
        var self = this;
        val = val === undefined ? true : !!val;
        foreach(d, function (v) {
            filter(self.edge, v).select('path.edge').classed('selected', val);
        });
    };


    this.selected_nodes = function () {
        var ret = [];
        var nodes = this.node.select('.selected');
        nodes.each(function (d) { ret.push(d); });
        return ret;
    };


    this.selected_edges = function () {
        var ret = [];
        var edges = this.edge.select('.selected');
        edges.each(function (d) { ret.push(d); });
        return ret;
    };


    // Removes a selection CSS class for all the nodes and edges
    this.unselect_all = function () {
        this.svg.selectAll('.selected').classed('selected', false);
    };


    this.initial = function (d) {
        // Remove all initial states
        this.node.selectAll('path.edge').remove();
        // Add initial states
        elements.initial(filter(this.node, d));
    };


    this.transform_edge = function (d) {
        var str = elements.get_edge_transformation(d);
        var e = d3.select(this);
        e.selectAll('path').attr('d', str);
        e.select('text')
            .attr('x', d.tx)
            .attr('y', d.ty);
    };

    this.stress_node = function (d) {
        var node = this.node;
        node.select('.stressed').classed('stressed', false);
        foreach(d, function (v) {
            filter(node, v).select('circle').classed('stressed', true);
        });
    };

    this.stress_edge = function (d) {
        var edge = this.edge;
        edge.select('.stressed').classed('stressed', false);
        foreach(d, function (v) {
            filter(edge, v).select('path.edge').classed('stressed', true);
        });
    };
}


view_methods.call(View.prototype);



// JSLint options:
/*global d3, View*/


// Creates and returns an object which implements a selection rectangle
View.prototype.selection_rectangle = (function () {
    var x0, y0, x, y, w, h;
    var rc = {};
    var svg_rc; // Reference to a SVG rectangle
    var svg;

    // Returns coordinates [topleft, bottomright] of selection rectangle.
    // Methods of this function: show, update and hide the selection rectange.
    var fnc = function () {
        var ret = [x0, y0, x, y];
        if (x0 > x) { ret[0] = x; ret[2] = x0; }
        if (y0 > y) { ret[1] = y; ret[3] = y0; }
        return ret;
    };

    // Shows a selection rectange (use CSS ot tune its look)
    fnc.show = function (xy) {
        x0 = xy[0];
        y0 = xy[1];
        svg_rc = svg.append('rect').attr({
            x : x0,
            y : y0,
            'class' : 'selection'
        });
    };

    // Updates position of the rectangle wrt the current mouse position
    fnc.update = function (xy) {
        x = xy[0];
        y = xy[1];
        w = x - x0;
        h = y - y0;
        rc.x = x0;
        rc.y = y0;
        if (w < 0) { w = -w; rc.x = x; }
        if (h < 0) { h = -h; rc.y = y; }
        rc.width = w;
        rc.height = h;
        svg_rc.attr(rc);
    };

    // Removes selection rectangle
    fnc.hide = function () {
        svg_rc.remove();
    };

    fnc.context = function (a_svg) {
        svg = a_svg;
        return this;
    };

    return fnc;
}());



// This object contains methods to select nodes and edges of the graph
View.prototype.select = (function () {
    var nodes = [];
    var edges = [];

    function point_in_rectangle(x, y, r) {
        return x > r[0] && x < r[2] && y > r[1] && y < r[3];
    }

    var view;
    var svg;

    return {
        context : function (a_view, a_svg) {
            view = a_view;
            svg = a_svg;
            return this;
        },
        // Updates graphical appearance of selected_nodes nodes
        by_rectangle : function (r) {
            // Correct coordinates according to the current panoram
            var p = view.pan();
            r[0] -=  p[0];
            r[2] -=  p[0];
            r[1] -=  p[1];
            r[3] -=  p[1];
            view.node.each(function (d) {
                // Check if center of the node is in the selection rectange
                if (point_in_rectangle(d.x, d.y, r)) {
                    view.select_node(d);
                }
            });
            view.edge.each(function (d) {
                // Check if both start and and points of edge 
                // are in the selection
                if (point_in_rectangle(d.x1, d.y1, r) &&
                        point_in_rectangle(d.x2, d.y2, r)) {
                    view.select_edge(d);
                }
            });
        }
    };
}());



// JSLint options:
/*global */



var Commands = (function () {
    "use strict";

    var Command = function (redo, undo) {
        if (redo) { this.redo = redo; }
        if (undo) { this.undo = undo; }
    };

    function dummy() { return; }

    Command.prototype.redo = dummy;
    Command.prototype.undo = dummy;


    function prototype_methods() {

        // Starts new macro recording
        this.start = function () {
            if (this.index < this.stack.length) { this.stack.length = this.index; }
            this.macro = [];
            this.stack.push(this.macro);
            this.index = this.stack.length;
            return this;
        };

        this.undo = function () {
            if (this.index > 0) {
                var macro = this.stack[--this.index];
                var i = macro.length;
                while (i-- > 0) {
                    macro[i].undo();
                }
                this.update();
            }
        };

        this.redo = function () {
            if (this.index < this.stack.length) {
                var macro = this.stack[this.index++];
                var i, n = macro.length;
                for (i = 0; i < n; i++) {
                    macro[i].redo();
                }
                this.update();
            }
        };

        // Makes a copy of each item in arguments if it is an array
        function copy_arguments(args) {
            var i = args.length;
            while (i--) {
                if (args[i] instanceof Array) {
                    args[i] = args[i].slice(0);
                }
            }
        }

        // Creates new command-function as the key of a 'Command' instance
        this.create = function (name, fun) {
            if (this[name] && console) {
                console.error('Command', name, 'already exists');
                return;
            }
            if (name && typeof fun === 'function') {
                this[name] = function () {
                    copy_arguments(arguments);
                    var command = new Command();
                    command.graph = this.graph;
                    fun.apply(command, arguments);
                    this.macro.push(command);
                    command.redo();
                    this.update();
                    return this;
                };
            }
        };

        this.clear_history = function () {
            this.stack.length = 0;
            this.macro.length = 0;
        };
    }


    var constructor = function (aGraph) {
        this.graph = aGraph;
        this.stack = [];
        this.macro = [];
        // Index is equal to a number of commands which the user can undo;
        // If index is not equal to the length of stack, it implies
        // that user did "undo". Then new command cancels all the
        // values in stack above the index.
        this.index = 0;
        this.update = dummy;
    };

    prototype_methods.call(constructor.prototype);

    return constructor;
}());



Commands.prototype.create('add_node', function (d) {
    var graph = this.graph;
    this.redo = function () { graph.node.add(d); };
    this.undo = function () { graph.node.remove(d); };
});


Commands.prototype.create('del_node', function (d) {
    var graph = this.graph;
    this.redo = function () { graph.node.remove(d); };
    this.undo = function () { graph.node.add(d); };
});


Commands.prototype.create('add_edge', function (d) {
    var graph = this.graph;
    this.redo = function () { graph.edge.add(d); };
    this.undo = function () { graph.edge.remove(d); };
});


Commands.prototype.create('del_edge', function (d) {
    var graph = this.graph;
    this.redo = function () { graph.edge.remove(d); };
    this.undo = function () { graph.edge.add(d); };
});


Commands.prototype.create('node_text', function (d, text) {
    var graph = this.graph;
    var old_text = d.text;
    this.redo = function () { graph.node.text(d, text); };
    this.undo = function () { graph.node.text(d, old_text); };
});

Commands.prototype.create('edge_text', function (d, text) {
    var graph = this.graph;
    var old_text = d.text;
    this.redo = function () { graph.edge.text(d, text); };
    this.undo = function () { graph.edge.text(d, old_text); };
});

Commands.prototype.create('move_node', function (d, from, to) {
    var graph = this.graph;
    this.redo = function () { graph.node.move(d, to); };
    this.undo = function () { graph.node.move(d, from); };
});

Commands.prototype.create('mark_node', function (d) {
    var graph = this.graph;
    this.redo = function () { graph.node.mark(d); };
    this.undo = function () { graph.node.unmark(d); };
});

Commands.prototype.create('unmark_node', function (d) {
    var graph = this.graph;
    this.redo = function () { graph.node.unmark(d); };
    this.undo = function () { graph.node.mark(d); };
});

Commands.prototype.create('initial', function (from, to) {
    var graph = this.graph;
    this.redo = function () { graph.node.initial(to); };
    this.undo = function () { graph.node.initial(from); };
});

Commands.prototype.create('move_edge', function (d, from, to) {
    var graph = this.graph;
    this.redo = function () { graph.edge.move(d, to[0], to[1]); };
    this.undo = function () { graph.edge.move(d, from[0], from[1]); };
});

Commands.prototype.create('spring', function (view) {
    var graph = this.graph;
    var xy = [];
    var nodes =  graph.object().nodes;
    nodes.forEach(function (d) { xy.push(d.x, d.y); });
    this.redo = function () { view.spring(true); };
    this.undo = function () { view.spring(false); graph.node.move(nodes, xy); };
});



// JSLint options:
/*global d3, View, commands, textarea, vec, elements, set_edge_type*/


// Returns whether the editor is in the ADD mode
function mode_add() {
    return d3.event.ctrlKey;
}


// Returns whether the editor is in the MOVE mode
function mode_move() {
    return d3.event.shiftKey;
}

var commands;       // commands to manipulate the model



// Controller of the selection by rectangle
// Returns itself
// .done implies it is in the initial state
var control_selection = (function () {
    "use strict";

    var mouse, rect;

    // The state machine
    var state, states = {
        init : function () {
            mouse = d3.mouse(this);
            state = states.ready;
        },
        ready : function (view) {
            switch (d3.event.type) {
            case 'mousemove':
                if (!mode_add()) { view.unselect_all(); }
                rect = view.selection_rectangle();
                rect.show(mouse);
                state = states.update;
                break;
            case 'mouseup':
                if (!mode_add()) { view.unselect_all(); }
                state = states.init;
                break;
            default:
                state = states.init;
            }
        },
        update : function (view) {
            switch (d3.event.type) {
            case 'mousemove':
                rect.update(d3.mouse(this));
                break;
            case 'mouseup':
                view.select().by_rectangle(rect());
                rect.hide();
                state = states.init;
                break;
            }
        }
    };
    state = states.init;

    return function loop() {
        state.apply(this, arguments);
        loop.done = state === states.init;
        return loop;
    };
}());



var control_nodes_drag = (function () {
    "use strict";

    var mouse, nodes;
    var from_xy = [], xy, to_xy = [];

    // The state machine
    var state, states = {
        init : function (view) {
            mouse = view.pan.mouse();
            state = states.ready;
        },
        ready : function (view) {
            switch (d3.event.type) {
            case 'mousemove':
                // Remember nodes coordinates for undo the command
                from_xy.length = 0;
                nodes = view.selected_nodes();
                nodes.forEach(function (d) { d.fixed = true; from_xy.push(d.x, d.y); });
                state = states.update;
                break;
            case 'mouseup':
                state = states.init;
                break;
            }
        },
        update : function (view) {
            switch (d3.event.type) {
            case 'mousemove':
                // How far we move the nodes
                xy = mouse;
                mouse = view.pan.mouse();
                xy[0] = mouse[0] - xy[0];
                xy[1] = mouse[1] - xy[1];
                // Change positions of the selected nodes
                commands.graph.node.shift(nodes, xy);
                view.spring.on();
                xy[0] = mouse[0];
                xy[1] = mouse[1];
                break;
            case 'mouseup':
                to_xy.length = 0;
                nodes.forEach(function (d) { delete d.fixed; to_xy.push(d.x, d.y); });
                // Record the command only when the force is not working
                if (view.spring()) {
                    view.spring.on();
                } else {
                    commands.start().move_node(nodes, from_xy, to_xy);
                }
                state = states.init;
                break;
            }
        }
    };
    state = states.init;

    return function loop() {
        state.apply(this, arguments);
        loop.done = state === states.init;
        return loop;
    };
}());



var control_edge_drag = (function () {
    "use strict";

    var mouse, d_source, node_d, edge_d, drag_target, edge_svg, from, exists;

    var state, states = {
        init : function (view, source, d) {
            d_source = d;
            switch (source) {
            case 'node':
                state = states.wait_for_new_edge;
                break;
            case 'edge':
                // What to drag: head or tail of the edge? What is closer to the mouse pointer.
                var head = [], tail = [];
                mouse = view.pan.mouse();
                vec.subtract(mouse, [d.x1, d.y1], tail);
                vec.subtract(mouse, [d.x2, d.y2], head);
                drag_target = vec.length(head) < vec.length(tail);
                state = states.wait_for_edge_dragging;
                break;
            }
        },
        wait_for_new_edge : function (view) {
            switch (d3.event.type) {
            case 'mouseup':
                state = states.init;
                break;
            case 'mouseout':
                mouse = view.pan.mouse();
                // Start dragging the edge
                // Firstly, create new node with zero size
                node_d = { x : mouse[0], y : mouse[1], r : 1 };
                // Create new edge
                edge_d = { source : d_source, target : node_d };
                commands.start().add_edge(edge_d);
                drag_target = true;
                edge_svg = view.edge_by_data(edge_d).selectAll('path');
                view.spring.off();
                state = states.drag_edge;
                break;
            }
        },
        wait_for_edge_dragging : function (view, source, d) {
            switch (source) {
            case 'edge':
                switch (d3.event.type) {
                case 'mouseout':
                    mouse = view.pan.mouse();
                    // Firstly, create new node with zero size
                    node_d = { x : mouse[0], y : mouse[1], r : 1 };
                    edge_d = d;
                    from = [edge_d.source, edge_d.target];
                    if (drag_target) {
                        d.target = node_d;
                    } else {
                        d.source = node_d;
                    }
                    // edge_d.text = d.text;
                    commands.start().move_edge(edge_d, from, [edge_d.source, edge_d.target]);
                    edge_svg = view.edge_by_data(edge_d).selectAll('path');
                    view.unselect_all();
                    view.select_edge(edge_d);
                    view.spring.off();
                    state = states.drag_edge;
                    break;
                default:
                    state = states.init;
                }
                break;
            }
        },
        drag_edge : function (view, source, d) {
            switch (d3.event.type) {
            case 'mousemove':
                mouse = view.pan.mouse();
                node_d.x = mouse[0];
                node_d.y = mouse[1];
                edge_svg.attr('d', elements.get_edge_transformation(edge_d));
                break;
            case 'mouseup':
                delete node_d.r; // in order to use default radius
                commands.add_node(node_d);
                view.unselect_all();
                view.select_edge(edge_d);
                view.select_node(drag_target ? edge_d.target : edge_d.source);
                view.spring.on();
                state = states.init;
                break;
            case 'mouseover':
                switch (source) {
                case 'node':
                    from = [edge_d.source, edge_d.target];
                    if (drag_target) {
                        edge_d.target = d;
                    } else {
                        edge_d.source = d;
                    }
                    commands.move_edge(edge_d, from, [edge_d.source, edge_d.target]);
                    view.spring.off();
                    state = states.drop_edge_or_exit;
                    break;
                }
                break;
            }
        },
        drop_edge_or_exit : function (view, source) {
            switch (source) {
            case 'node':
                switch (d3.event.type) {
                case 'mouseup':
                    // Get existing edges between selected nodes
                    exists = view.graph().edges.filter(function (v) {
                        return ((v.source === edge_d.source) && (v.target === edge_d.target));
                    });
                    if (exists.length > 1) {
                        // Delete edge
                        commands.del_edge(edge_d);
                    }
                    if (!mode_add()) { view.unselect_all(); }
                    if (exists.length <= 1) {
                        view.select_edge(edge_d);
                    }
                    view.spring.on();
                    state = states.init;
                    break;
                case 'mouseout':
                    from = [edge_d.source, edge_d.target];
                    if (drag_target) {
                        edge_d.target = node_d;
                    } else {
                        edge_d.source = node_d;
                    }
                    commands.move_edge(edge_d, from, [edge_d.source, edge_d.target]);
                    view.spring.off();
                    state = states.drag_edge;
                    break;
                }
                break;
            }
        }
    };
    state = states.init;

    // // Give names to the states-functions for debugging
    // var key;
    // for (key in states) {
    //     if (states.hasOwnProperty(key)) {
    //         if (!states[key]._name) {
    //             states[key]._name = key;
    //         }
    //     }
    // }

    // var ost = state;
    return function loop() {
        state.apply(this, arguments);
        // // Debug transitions
        // if (ost !== state) {
        //     console.log(ost._name, state._name);
        //     ost = state;
        // }
        loop.done = state === states.init;
        return loop;
    };
}());


var Controller = (function () {
    "use strict";

    var view;           // a view where the current event occurs
    var old_view;
    var source;         // a SVG element where the current event occurs

    var mouse;          // mouse position
    var nodes;          // array of nodes (data)
    var edges;          // array of edges (data)

    var state;          // Reference to a current state
    var old_state;      // Reference to a previous state

    var pan, x, y;


    // Helper function for text editor control
    function control_text_edit(selection, text, x, y, enter) {
        // Remove old text until the end of editing
        selection.text('');
        textarea(view.container, text || '', x, y,
            function onenter() {
                enter(this.value || '');
            },
            function oncancel() {
                // Restore old text
                selection.text(text);
            });
    }


    var states = {
        init : function (d) {
            if (d3.event.type === 'keydown') {
                switch (d3.event.keyCode) {
                case 46: // Delete
                    nodes = view.selected_nodes();
                    // Get incoming and outgoing edges of deleted nodes, joined with selected edges 
                    edges = view.selected_edges();
                    edges = edges.concat(commands.graph.edge.adjacent(nodes).filter(
                        function (node) { return edges.indexOf(node) < 0; }
                    ));
                    commands.start()
                        .del_edge(edges)
                        .del_node(nodes);
                    state = states.wait_for_keyup;
                    break;
                case 70: // F
                    // On/off spring behaviour
                    if (view.spring()) {
                        view.spring(false);
                    } else {
                        commands.start().spring(view);
                    }
                    break;
                case 73: // I
                    // Mark a selected state as the initial one
                    commands.start().initial(view._graph.nodes.filter(function (d) { return !!d.initial; }),
                        view.selected_nodes());
                    break;
                case 77: // M
                    // Mark selected states
                    nodes = view.selected_nodes();
                    if (mode_add()) {
                        commands.start().unmark_node(nodes);
                    } else {
                        commands.start().mark_node(nodes);
                    }
                    break;
                case 89: // Y
                    if (mode_add()) {
                        commands.redo();
                        view.spring.on();
                    }
                    state = states.wait_for_keyup;
                    break;
                case 90: // Z
                    if (mode_add()) {
                        commands.undo();
                        view.spring.on();
                    }
                    state = states.wait_for_keyup;
                    break;
                // default:
                //     console.log('Key', d3.event.keyCode);
                }
            } else {
                switch (source) {
                case 'plane':
                    switch (d3.event.type) {
                    case 'mousemove':
                        // placed here to prevent the enumeration of other cases
                        break;
                    case 'dblclick':
                        if (!mode_add()) { view.unselect_all(); }
                        mouse = view.pan.mouse();
                        // Create new node
                        var node = { x : mouse[0], y : mouse[1] };
                        commands.start().add_node(node);
                        view.select_node(node);
                        break;
                    case 'mousedown':
                        if (mode_move()) {
                            view.pan.start();
                            state = states.drag_graph;
                        } else {
                            control_selection.call(this, view);
                            state = states.selection;
                        }
                        break;
                    }
                    break;
                case 'node':
                    switch (d3.event.type) {
                    case 'mousedown':
                        // Selection
                        if (mode_move()) {
                            view.select_node(d);
                        } else {
                            // XOR selection mode
                            if (mode_add()) {
                                // Invert selection of the node
                                view.select_node(d, view.selected_nodes().indexOf(d) < 0);
                            } else {
                                // AND selection
                                view.unselect_all();
                                view.select_node(d);
                            }
                        }
                        // Drag the node or create new edge
                        if (mode_move()) {
                            control_nodes_drag.call(this, view);
                            state = states.drag_node;
                        } else {
                            control_edge_drag.call(this, view, source, d);
                            // state = states.wait_for_new_edge;
                            state = states.drag_edge;
                        }
                        break;
                    case 'dblclick':
                        pan = view.pan();
                        x = d.x + pan[0];
                        y = d.y + pan[1];
                        control_text_edit(d3.select(this).select('text'), d.text, x, y, function (text) {
                            commands.start().node_text(d, text);
                        });
                        d3.event.stopPropagation();
                        break;
                    }
                    break;
                case 'edge':
                    switch (d3.event.type) {
                    case 'mousedown':
                        // Conditional selection
                        edges = view.selected_edges();
                        // OR selection
                        if (mode_move()) {
                            view.select_edge(d);
                            edges = view.selected_edges();
                        } else {
                            // XOR selection mode
                            if (mode_add()) {
                                // Invert selection of the node
                                view.select_edge(d, edges.indexOf(d) < 0);
                            } else {
                                // AND selection
                                view.unselect_all();
                                view.select_edge(d);
                            }
                        }
                        control_edge_drag.call(this, view, source, d);
                        state = states.drag_edge;
                        break;
                    case 'dblclick':
                        pan = view.pan();
                        x = d.tx + pan[0];
                        y = d.ty + pan[1];

                        control_text_edit(d3.select(this).select('text'), d.text, x, y, function (text) {
                            commands.start().edge_text(d, text);
                        });
                        d3.event.stopPropagation();
                        break;
                    }
                    break;
                }
            }
        },
        drag_node : function () {
            if (control_nodes_drag.call(this, view).done) {
                state = states.init;
            }
        },
        drag_edge : function (d) {
            if (control_edge_drag.call(this, view, source, d).done) {
                state = states.init;
            }
        },
        drag_graph : function () {
            switch (d3.event.type) {
            case 'mousemove':
                if (!mode_move()) { state = states.init; }
                view.pan.to_mouse();
                break;
            case 'mouseup':
                state = states.init;
                break;
            }
        },
        selection : function () {
            if (control_selection.call(this, view).done) {
                state = states.init;
            }
        },
        wait_for_keyup : function () {
            if (d3.event.type === 'keyup') {
                state = states.init;
            }
        }
    };

    state = states.init;

    // Add 'name' property to the state functions to trace transitions
    var key;
    for (key in states) {
        if (states.hasOwnProperty(key)) {
            states[key]._name = key;
        }
    }

    function context(src) {
        view = this.view;
        commands = this.commands;
        source = src;
    }


    function event() {

        if (!view) { return; }

        // Do not process events if the state is not initial.
        // It is necessary when user drags elements outside of the current view.
        if (old_view !== view) {
            if (state !== states.init) {
                return;
            }
            old_view = view;
        }

        old_state = state;
        state.apply(this, arguments);

        // Clear the context to prevent false process next time
        view = null;
        source = null;

        // If there was a transition from state to state
        if (old_state !== state) {
            // Trace the current transition
            console.log('transition:', old_state._name + ' -> ' + state._name);
        }
    }


    var constructor = function (aView, aCommands) {
        this.view = aView;
        this.commands = aCommands;

        this.event = event;
        this.context = context;

        // Sets event handlers for the given View
        var that = this;
        // Handles nodes events
        this.view.node_handler = function () {
            context.call(that, 'node');
            event.apply(this, arguments);
        };

        // Handles edge events
        this.view.edge_handler = function () {
            context.call(that, 'edge');
            event.apply(this, arguments);
        };

        // Handles plane (out of other elements) events
        this.view.plane_handler = function () {
            context.call(that, 'plane');
            event.apply(this, arguments);
        };
    };

    return constructor;
}());

// JSLint options:
/*global clone, float2int, wrap*/


var Graph = (function () {
    "use strict";

    /**
     * Calls function 'fun' for a single object or an array of objects
     * @param  {Object|Array}
     * @param  {Function}
     * @param  {Object} [context] If provided, will be given instead of `this`
     */
    function foreach(d, fun, that) {
        that = that || this;
        if (d instanceof Array) {
            d.forEach(fun, that);
        } else {
            fun.call(that, d);
        }
    }

    /**
     * Methods for nodes only
     */
    function nodes_methods() {

        function shift(d) {
            d.x += this[0];
            d.y += this[1];
            d.px = d.x;
            d.py = d.y;
        }

        function mark(d) { d.marked = true; }
        function unmark(d) { delete d.marked; }

        function initial(d) { d.initial = true; }
        function uninitial(d) { delete d.initial; }

        /**
         * Changes the position of given node\ndoes equally and relatively to the previous
         * @param  {Object|Array} node|nodes
         * @param  {Array} dxy array of the coordinates chage in form: [dx, dy]
         */
        this.shift = function (d, dxy) {
            foreach(d, shift, dxy);
        };

        /**
         * Moves each given node\nodes to a new position
         * @param  {Object|Array} node|nodes
         * @param  {Array} xy array of coordinates in form: [x1, y1, ... xn, yn]
         */
        this.move = function (d, xy) {
            if (xy instanceof Array) {
                var i = 0;
                foreach(d, function (d) {
                    d.x = xy[i++] || d.x;
                    d.y = xy[i++] || d.y;
                    d.px = d.x;
                    d.py = d.y;
                });
            }
        };

        /**
         * Marks given node\nodes
         * @param  {Object|Array} node|nodes
         */
        this.mark = function (d) { foreach(d, mark); };

        /**
         * Unmarks given node\nodes
         * @param  {Object|Array} node|nodes
         */
        this.unmark = function (d) { foreach(d, unmark); };

        /**
         * Makes given node\nodes (aka state) initial. Other nodes will be made not initial
         * @param  {Object|Array} node|nodes
         */
        this.initial = function (d) {
            foreach(this.data, uninitial);
            foreach(d, initial);
        };
    }

    /**
     * Methods for edges only
     */
    function edges_methods() {

        /**
         * Returns new array of (unique) edges filtered upon the result of the test(edge, node) call for each node.
         * The callback function will be invoked `|nodes| * |edges|` times.
         * 
         * @param  {Array} edges Input array of edges
         * @param  {Object|Array} nodes
         * @param  {Function} test Callback function
         * @return {Array} edges Output array of edges
         */
        function filter(edges, node, test) {
            var out;
            if (node instanceof Array) {
                out = [];
                node.forEach(function (n) {
                    var a = edges.filter(function (e) { return test(e, n) && out.indexOf(e) < 0; });
                    while (a.length) { out.push(a.pop()); }
                });
            } else {
                out = edges.filter(function (e) { return test(e, node); });
            }
            return out;
        }

        /**
         * Returns array of incoming and outgoing edges of the given node\nodess]
         * @param  {Object|Array} node|nodes
         */
        this.adjacent = function (nodes) {
            return filter(this.data, nodes, function (edge, node) {
                return edge.source === node || edge.target === node;
            });
        };

        /**
         * Returns array of incoming edges to the given node\nodes
         * @param  {Object|Array} node|nodes
         */
        this.incoming = function (nodes) {
            return filter(this.data, nodes, function (edge, node) {
                return edge.target === node;
            });
        };

        /**
         * Returns array of outgoing edges from the given node\nodes
         * @param  {Object|Array} node|nodes
         */
        this.outgoing = function (nodes) {
            return filter(this.data, nodes, function (edge, node) {
                return edge.source === node;
            });
        };

        /**
         * Changes edge's nodes to new given nodes
         * @param  {Object} edge
         * @param  {Object} source
         * @param  {Object} target
         */
        this.move = function (d, source, target) {
            d.source = source;
            d.target = target;
        };

    }


    // Methods for both nodes and edges
    function basic_methods() {

        /**
         * Adds a node\edge to the graph.
         * @param {object}
         */
        function add(d) {
            this.push(d);
        }

        function remove(d) {
            var i = this.indexOf(d);
            if (i >= 0) {
                this.splice(i, 1);
            }
        }

        function stress(d) {
            d.stressed = true;
        }

        function unstress(d) {
            delete d.stressed;
        }

        /**
         * Adds a single object or an array of objects into the array
         * @param {Object}
         * @return {Object} Itself
         */
        this.add = function (d) {
            foreach(d, add, this.data);
            return this;
        };

        /**
         * Removes a single object or an array of objects from the array
         * @param {Object}
         * @return {Object} Itself
         */
        this.remove = function (d) {
            foreach(d, remove, this.data);
            return this;
        };

        /**
         * Sets .text paremeter for the given object
         * @param {Object}
         * @param {String}
         * @return {Object} Itself
         */
        this.text = function (d, text) {
            d.text = text;
            return this;
        };

        /**
         * Sets .stressed parameter for the given object
         * @param  {Object}
         * @return {Object} Itsef
         */
        this.stress = function (d) {
            foreach(this.data, unstress);
            foreach(d, stress);
        };

    }


    // The prototype with basic methods
    var basic_prototype = {};
    basic_methods.call(basic_prototype);

    // The prototype with nodes methods
    var nodes_prototype = Object.create(basic_prototype);
    nodes_methods.call(nodes_prototype);

    var edges_prototype = Object.create(basic_prototype);
    edges_methods.call(edges_prototype);

    /**
     * Creates a new instance of Graph
     * @class
     * @alias Graph
     * @memberOf editor
     * @param {object} graph object literal
     * @return {Graph}
     */
    var constructor = function (json_graph) {
        /**
         * A namespace object for manipulation of the graph nodes
         * @type {Object}
         */
        this.node = Object.create(nodes_prototype);
        /**
         * A namespace object for manipulation of the graph edges
         * @type {Object}
         */
        this.edge = Object.create(edges_prototype);

        this.node.data = [];
        this.edge.data = [];

        this.set_json(json_graph);
    };

    /**
     * Returns a simple graph object literal with only nodes and edges (for serialization etc.)
     * @return {Object} graph object literal
     */
    constructor.prototype.object = function () {
        return {
            nodes : this.node.data,
            edges : this.edge.data
        };
    };

    /**
     * Copy nodes and edges from json, validating and deindexing
     * @param {Object} json_graph
     */
    constructor.prototype.set_json = function (json_graph) {
        // Clear old graph data
        this.node.data.length = 0;
        this.edge.data.length = 0;

        if (typeof json_graph === 'object') {
            // Copy nodes which are unique objects
            foreach(json_graph.nodes, function (node) {
                if (typeof node === 'object' && this.indexOf(node) < 0) {
                    this.push(node);
                }
            }, this.node.data);

            // Copy edges which have valid indexes to nodes, and replace indexes to nodes objects
            var self = this, i, j, num_nodes = this.node.data.length;
            foreach(json_graph.edges, function (edge) {
                if (typeof edge === 'object' && this.indexOf(edge) < 0) {
                    i = Number(edge.source);
                    j = Number(edge.target);
                    if (i >= 0 && i < num_nodes && j >= 0 && j < num_nodes) {
                        edge.source = self.node.data[i];
                        edge.target = self.node.data[j];
                        this.push(edge);
                    }
                }
            }, this.edge.data);
        }
    };

    /**
     * Returns graph object in JSON, with the nodes references in edges replaced by indexes.
     * If JSON graph is provided, 
     * @return {Object}
     */
    constructor.prototype.get_json = function () {
        var g = this.object();
        // Copy edges while calculating the indexes to the nodes
        g.edges = g.edges.map(function (edge) {
            var e = clone(edge);
            e.source = g.nodes.indexOf(edge.source);
            e.target = g.nodes.indexOf(edge.target);
            return e;
        });
        // Make deep clone, such that the objects of the copy will have no references to the source
        g = clone(g, true);
        // Convert all the float values to integers
        float2int(g);
        return g;
    };

    return constructor;

}());



// JSLint options:
/*global View, after*/

// Incapsulates and returns the graph object.
//  Overrides methods which change the graph. 
//  When the methods are called invokes correspondent View methods.
function wrap(graph, aView) {
    "use strict";

    var view = aView;

    function update_view() {
        view.update();
    }

    after(graph.node, 'add', update_view);
    after(graph.node, 'remove', update_view);
    after(graph.node, 'text', view.node_text.bind(view));
    after(graph.node, 'shift', view.transform);
    after(graph.node, 'move', view.transform);
    after(graph.node, 'mark', view.mark_node.bind(view));
    after(graph.node, 'unmark', view.mark_node.bind(view));
    after(graph.node, 'initial', view.initial.bind(view));
    after(graph.node, 'stress', view.stress_node.bind(view));

    after(graph.edge, 'add', update_view);
    after(graph.edge, 'remove', update_view);
    after(graph.edge, 'text', view.edge_text.bind(view));
    after(graph.edge, 'move', update_view);
    after(graph.edge, 'stress', view.stress_edge.bind(view));

    return graph;
}


// JSLint options:
/*global View, Graph, Commands, wrap, after, Controller*/

    /**
     * Creates a new instance of Editor
     * @class
     * @param {Object} [container] HTML DOM element. If not given, the document body is used as a container.
     * @example var editor = new jas.editor.Instance(document.getElementById('id_editor'));
     */
    var Editor = function (container) {
        /**
         * The model (in terms of MVC) of the editor
         * @type {Graph}
         */
        this.graph = new Graph();
        /**
         * The view (in terms of MVC) of the editor
         * @type {View}
         */
        this.view = new View(container);
        // Wrap graph methods with new methods which update the view
        wrap(this.graph, this.view);
        /**
         * Commands for undo\redo behaviour
         * @type {Commands}
         */
        this.commands = new Commands(this.graph);
        /**
         * The controller (in terms of MVC) of the editor
         * @type {Controller}
         */
        this.controller = new Controller(this.view, this.commands);

        function update() {
            this.commands.clear_history();
            this.view.graph(this.graph.object());
        }
        update.call(this);

        // Set callback which updates the view and commands when a user sets a new graph
        after(this.graph, 'set_json', update.bind(this));
    };

    jas.Editor = Editor;
    jas.after = after;


}(window));
