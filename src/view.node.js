// JSLint options:
/*global View*/


/**
 * Prototype object for view.node
 */
View.prototype.node = (function () {
    "use strict";

    var node = Object.create(View.prototype.element);

    function methods() {
        /**
         * Default geometrical values
         * @type {Number}
         */
        this.RADIUS = 16;
        this.MARKED_RADIUS = this.RADIUS - 3;
        this.INITIAL_LENGTH = this.RADIUS * 1.6;

        function add(d) {
            var g = this.root.append('g')
                .datum(d)
                .on('mousemove', this.handler)
                .on('mousedown', this.handler)
                .on('mouseup', this.handler)
                .on('mouseover', this.handler)
                .on('mouseout', this.handler)
                .on('dblclick', this.handler);

            g.append('circle').attr('r', d.r || this.RADIUS);

            d.view = function () { return g; };

            g.append('text').attr('alignment-baseline', 'center');
            this.text(d);

            this.move(d);
            this.mark(d);
            this.initial(d);
        }

        function remove(d) {
            d.view().remove();
        }

        function move(d) {
            d.view().attr('transform', "translate(" + d.x + "," + d.y + ")");
        }

        function mark(d) {
            var view = d.view();
            var marked = view.select('circle.marked');
            if (marked.empty()) {
                if (d.marked) {
                    view.append('circle')
                        .attr('r', this.MARKED_RADIUS)
                        .classed('marked', true);
                }
            } else {
                if (!d.marked) {
                    marked.remove();
                }
            }
        }

        function initial(d) {
            var view = d.view();
            var init = view.select('path.edge');
            if (init.empty()) {
                if (d.initial) {
                    view.append('path')
                        .attr('class', 'edge')
                        .attr('marker-end', 'url(#marker-arrow)')
                        .attr('d', 'M' + (-this.RADIUS - this.INITIAL_LENGTH) + ',0L' + (-this.RADIUS) + ',0');
                }
            } else {
                if (!d.initial) {
                    init.remove();
                }
            }
        }

        /**
         * Factory constructor
         * @param  {Object} root d3 selection
         * @return {Object} node namespace object to work with nodes
         */
        this.create = function (root) {
            this.root = root.append('g').attr('class', 'nodes');
            var o = Object.create(node);
            o.root = this.root;
            return o;
        };

        this.each = function (fun) {
            this.root.selectAll('g').each(fun);
        };

        this.add = function (d) {
            this.foreach(d, add);
        };

        this.remove = function (d) {
            this.foreach(d, remove);
        };

        this.move = function (d) {
            this.foreach(d, move);
        };

        this.mark = function (d) {
            this.foreach(d, mark);
        };

        this.initial = function (d) {
            this.foreach(d, initial);
        };
    }
    methods.call(node);

    return node;
}());
