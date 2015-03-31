
// JSLint options:
/*global d3, ed, elements, pan, Select, after, router*/

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

    this.select = new Select(this);


    this.handler = function () { return; };

    function handler() {
        self.handler.apply(this, arguments);
    }

    // Makes current view focused and requests routing of window events (keys) to it
    function focus() {
        router.handle(handler);
    }

    svg.on('mousedown', handler)
        .on('mouseover', focus)
        .on('mouseup', handler)
        .on('mousemove', handler)
        // .on('mouseout', handler)
        .on('dblclick', handler)
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

    var root_group = svg.append('g');

    this.transform = function () {
        self.edge.move(this._graph.edges);
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


    this.node = View.prototype.node.create(root_group);
    this.edge = View.prototype.edge.create(root_group);

    this.container = container;
    this.pan = pan(root_group);
    this.svg = svg;
    this.force = force;

    // Attach graph
    this.graph(aGraph);
}



function view_methods() {

    // Returns a graph attached to the view.
    // If new graph is given, attches it to the view.
    this.graph = function (graph) {
        if (arguments.length > 0) {
            // 
            this._graph = null;
            this._graph = graph || get_empty_graph();
        }
        return this._graph;
    };

    this.clear = function () {
        // Remove old graph elements
        this.edge.clear();
        this.node.clear();
    };

    this.size = function (width, height) {
        if (arguments.length) {
            this.svg.attr('width', width).attr('height', height);
            this.force.size([width, height]);
        }
    };

    // Unselect all graph elements
    this.unselect_all = function () {
        this.svg.selectAll('.selected').classed('selected', false);
    };
}


view_methods.call(View.prototype);


