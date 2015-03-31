
// JSLint options:
/*global View, after, before*/

// Incapsulates and returns the graph object.
// Overrides methods which change the graph. 
// When the methods are called invokes correspondent View methods.
// Decides how some elements should be viewed.
function wrap(graph, view) {
    "use strict";

    /**
     * Sets the edge as stright, bended or loop
     * @param  {Object} edge
     */
    function stright_bended_loop(edge) {
        if (edge.source === edge.target) {
            view.edge.loop(edge);
        } else {
            var e = graph.edge.exists(edge.target, edge.source);
            if (e) {
                view.edge.bended(e);
                view.edge.bended(edge);
            } else {
                view.edge.stright(edge);
            }
        }
    }

    /**
     * Sets an edge opposite to the given as a stright
     * @param  {Object} edge
     */
    function stright_opposite(edge) {
        var e = graph.edge.exists(edge.target, edge.source);
        if (e) {
            view.edge.stright(e);
        }
    }

    function edge_add(edge) {
        view.edge.add(edge);
        stright_bended_loop(edge);
    }

    function view_edge_add(edge) {
        view.edge.foreach(edge, edge_add);
    }

    function edge_remove(edge) {
        view.edge.remove(edge);
        stright_opposite(edge);
    }

    function view_edge_remove(edges) {
        view.edge.foreach(edges, edge_remove);
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

    after(graph.edge, 'add',        view_edge_add,      view.edge);
    after(graph.edge, 'remove',     view_edge_remove,   view.edge);
    after(graph.edge, 'text',       view.edge.text,     view.edge);
    after(graph.edge, 'move',       view.edge.move,     view.edge);
    after(graph.edge, 'stress',     view.edge.stress,   view.edge);

    before(graph.edge, 'nodes',     stright_opposite);
    after(graph.edge, 'nodes',      stright_bended_loop);

    return graph;
}


