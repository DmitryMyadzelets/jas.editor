
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


