// JSLint options:
/*global View*/
/*jslint bitwise: true */


/**
 * Prototype object for view.edge
 */
View.prototype.edge = (function () {
    "use strict";

    var edge = Object.create(View.prototype.element);

    function methods() {
        /**
         * Default geometrical values
         * @type {Number}
         */

         /**
          * Calculates the path for a stright edge
          * @param  {Object} d edge
          */
        function stright(d) {
            // Coordinates of the source and target nodes
            var x1 = d.source.x;
            var y1 = d.source.y;
            var x2 = d.target.x;
            var y2 = d.target.y;
            // text coordinates (between the edge's nodes, by default)
            var tx = (x1 + x2) >>> 1;
            var ty = (y1 + y2) >>> 1;

            var path = 'M' + x1 + ',' + y1 + 'L' + x2 + ',' + y2;

            d.view().selectAll('path').attr('d', path);
            d.view().select('text').attr('x', tx).attr('y', ty);
        }

        function add(d) {
            var g = this.root.append('g')
                .datum(d)
                .on('mousedown', this.handler)
                .on('mouseup', this.handler)
                .on('mouseover', this.handler)
                .on('mouseout', this.handler)
                .on('dblclick', this.handler);
                // .on('mousemove', this.handler);

            d.view = function () { return g; };

            g.append('path')
                .attr('class', 'edge')
                .attr('marker-end', 'url(#marker-arrow)');

            g.append('path')
                .attr('class', 'catch');

            g.append('text').attr('alignment-baseline', 'center');
            this.text(d);

            d.path = stright;
            this.move(d);
        }

        function move(d) {
            d.path.call(this, d);
        }

        /**
         * Factory constructor
         * @param  {Object} root d3 selection
         * @return {Object} node namespace object to work with nodes
         */
        this.create = function (root) {
            var o = Object.create(edge);
            o.root = root.append('g').attr('class', 'edges');
            return o;
        };

        this.add = function (d) {
            this.foreach(d, add);
        };

        this.move = function (d) {
            this.foreach(d, move);
        };

        this.select = function (d, val) {
            val = val === undefined ? true : !!val;
            this.foreach(d, function (d) {
                d.view().select('path.edge').classed('selected', val);
            });
        };

        /**
         * Changes the edge view to a stright one
         * @param  {Object} d edge
         */
        this.stright = function (d) {
            d.path = stright;
        };

        /**
         * Changes the edge view to a bended one
         * @param  {Object} d edge
         */
        this.bended = function (d) {
            d.path = stright;
        };

        /**
         * Changes the edge view to a loop
         * @param  {Object} d edge
         */
        this.loop = function (d) {
            d.path = stright;
        };

    }
    methods.call(edge);

    return edge;
}());
