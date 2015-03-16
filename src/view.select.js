
/**
 * Creates an instance of Select class
 * Incapsulates the nodes and edges selection functionality
 */
var Select = (function () {
    "use strict";

    function point_in_rectangle(x, y, r) {
        return x > r[0] && x < r[2] && y > r[1] && y < r[3];
    }

    var constructor = function (aView) {
        this.view = aView;
    };

    // Updates graphical appearance of selected_nodes nodes
    constructor.prototype.by_rectangle = function (r) {
        var view = this.view;
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
    };

    return constructor;
}());
