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


