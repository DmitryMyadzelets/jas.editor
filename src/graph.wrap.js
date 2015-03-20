
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
    //    object       key          hook function       this
    after(graph.node, 'add',        view.node.add,      view.node);
    after(graph.node, 'remove',     view.node.remove,   view.node);
    after(graph.node, 'text',       view.node.text,     view.node);
    after(graph.node, 'shift',      view.node.move,     view.node);
    after(graph.node, 'move',       view.node.move,     view.node);
    after(graph.node, 'mark',       view.node.mark,     view.node);
    after(graph.node, 'unmark',     view.node.mark,     view.node);
    after(graph.node, 'initial',    view.node.initial,  view.node);
    after(graph.node, 'stress',     view.node.stress,   view.node);

    after(graph.edge, 'add',        view.edge.add,      view.edge);
    after(graph.edge, 'remove',     view.edge.remove,   view.edge);
    after(graph.edge, 'text',       view.edge.text,     view.edge);
    after(graph.edge, 'move',       view.edge.move,     view.edge);
    after(graph.edge, 'stress',     view.edge.stress,   view.edge);

    return graph;
}


