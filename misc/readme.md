## Other web-based automata editors to try

http://jointjs.com/demos/fsa


## Editor

Create editor in the body of a HTML document:

    var editor = new jas.Editor();

Create editor in a `div` container:

    var div = document.getElementById('editor_container');
    var editor = new jas.Editor(div);

Each instance of editor creates its own graph object which you can access:

    var graph = editor.graph;

## Graph

The nodes and edges are arrays of objects. Though it is not recommended they can be accessed directly:

    var nodes = graph.node.data;
    var edges = graph.edge.data;

### Nodes

Via `graph.node` namespace the following methods can be used:

Set a node or array of nodes as initial ones, and unset any other initial nodes if any:

    .initial(nodes)

Mark a node or array of nodes:

    .mark(nodes)

Unmark a node or array of nodes:

    .unmark(nodes)

Move nodes to absolute coordinates. For `n` nodes must be provided an array of coordinates `var xy = [x1, y1, ... xn, yn]`.

    .move(nodes, xy)

Move nodes relatively to their current coordinates, `dxy = [dx, dy]`.

    .shift(nodes, dxy)

### Edges

Via `graph.edge` namespace the following methods can be used:

Get array of incoming and outgoing edges of the given nodes:

    .adjacent(nodes)

Get array of incoming edges to the given nodes:

    .incoming(nodes)

Get array of outgoing edges from the given nodes:

    .outgoing(nodes)        

### Nodes and edges

Both nodes and edges have the following methods:

For one and an array of elements:

    .add(nodes)
    .add(edges)
    .remove(nodes)
    .remove(edges)

For one element only:

    .text(node, text)
    .text(edge, text)



### Presence of methods

    graph        wrapper   undo     View    
    node
        add         +       +       +
        remove      +       +       +
        text        +       +       +
        move        +       +       +
        stress      +               +
        shift       +               move
        mark        +       +       +
        unmark      +       +       mark
        initial     +       +       +
    edge
        add         +       +       +
        remove      +       +       +
        text        +       +       +
        nodes       +       +       
        stress      +               +
        adjacent
        incoming
        outgoing
    view
        spring              +


### Problem with `.node.` and `.edge.` namespacing

The `node` and `edge` properties of the graph are created dynamically. Than, they do not access to each other. Though each edge has access to `source` and `target` edges it can't access all of them. The nodes have no access to edges at all. There are some operations when we have a node as the input and edges as the output.  As a solution the reference to the nodes can be passed into the constructor. For example:

    var edges = new Edges(); // nodes can be passed here though
    var nodes = new Nodes(edges);


# View public members

    selection_rectangle() -> prototype.selection_rectangle
    select() -> prototype.select
    spring()
        .on()
        .of()
    node_handler()
    edge_handler()
    plane_handler()
    transform()
    node
    edge
    pan
    svg
    container
    force
## prototype methods
    graph(graph)
    size(width, height)
    update()
    node_text(d, text)
    mark_node(d)
    edge_text(d, text)
    edge_by_data(d)
    select_node(d, val)
    select_edge(d, val)
    selected_nodes()
    selected_edges()
    unselect_all()
    initial(d)
    transform_edge(d)
    stress_node(d)
    stress_edge(d)
    //
    selection_rectangle()
    select()

UML diagram
http://yuml.me/edit/fb7e0266