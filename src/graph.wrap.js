
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


