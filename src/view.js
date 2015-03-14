
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


