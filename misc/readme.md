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

# Refactoring graph, wrapper and undo/redo

## Wrapper

    graph = jas.editor.graph();

We create a new object that acts as graph, i.e. `wraph => graph`, but invokes automatically `before` and `after` methods.

    wraph = wrap(graph, view);

The `wrap` function should have inside smth like:

    after(first_function, second_function);
    after(graph.node.add, function () {});

The first function should be accessible either:

    graph.node.add()
    wraph.node.add()

Hence, the graph can't replace its own methods. Instead, the wraph should create new methods which may belong to the wraph itself or to a wraph's prototype.

## Which methods to wrap?

Now, the graph methods do not return any result. Thus, it's impossible to tell if, for instance, a node object has been added to the graph, or not for the reason it already exists in the graph. The methods which deal with arrays of objects can have a deterministic result. If we are interested in the result, then the singular object methods should be checked for it. But the graph's singular object methods are closed. Thus, only the graph can access them. They can be accessed in the same closure they exist. However, there are different closures in the graph: `add`, `remove`, `text` methods in the base object, and `move` method in the node object. That's a problem.

Solutions may be:

1. Leave only single object methods, make them public. For arrays `array.forEach` can be used. The View, actually, do not benefit for multiple objects methods in terms of performance, since it's using `foreach` inside.
2. Each method may know how to be wrapped. It's quite expensive.
3. Do not check results of the methods. Then we may loose internal logic of the graph.

Seems that the first solution is the best.
