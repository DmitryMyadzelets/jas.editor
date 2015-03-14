# Automata Editor

*Version: 0.1.0*

The automata editor is intended to become:
* A simple and fast hand-drawn-like automata design tool.
* A base for simulators, code generators and any other automata-related project which can come into your mind.

An example of how an automaton may look in the editor:

![Automaton for delayed save](https://github.com/dmitrymyadzelets/jas.editor/blob/master/img/graph_delayed_save.png "Automaton for delayed save of multiple updates")

Try it out: [http://dmitrymyadzelets.github.io/jas.editor/](http://dmitrymyadzelets.github.io/jas.editor/)

<!-- # How to use it in other project

The editor is created such that it can be easily used in other projects related to automata. The core of the editor implements only drawing and undo/redo capabilities. The API allows your to extend its functionality.
 -->

# Usage

## Preparation

Add following scripts into your HTML document:

    ```html
    <script src="http://d3js.org/d3.v3.min.js"></script>
    <script src="./jas.editor.min.js"></script>
    ```

## Creating the editor

Create editor in the body of the document:

    ```javascript
    var editor = new jas.Editor();
    ```

Or create the editor in a `div` container:  

    ```javascript
    var div = document.getElementById('editor_container');
    var editor = new jas.Editor(div);
    ```

That's it. You can create and edit your automata graph.

## Editing the automata graph

Use the mouse and keyboard as follows:

    Mouse:
        Double click on empty space - creates new state
        Click on a state and drag to another - creates new transition
        Click on state or transition - selection
        Ctrl + click - multi-selection
        Hold Shift to move states and transitions
        Double click on a state - edit its label
        Double click on a transition- edit its label

    Keys:
        Delete - deletes selected elements
        M - marks selected states
        Ctrl + M - unmark selected states
        I - make selected states as initial ones (exclusively)
        F - switch on\off force-directed layout mode
        Ctrl + Z - undo a command
        Ctrl + Y - redo a command

## Get and set your automata graph

When your create a graph, you can get it as an object literal:

    var graph = editor.graph.get_json();

Then, for instance, convert it to a string in order to store and use later:

    JSON.stringify(graph);

A new automata graph can be attached to the editor. For example, a graph with two nodes and one edge:

    var graph = {
        nodes: [{
            x: 50,
            y: 50,
            text: '0'
        }, {
            x: 200,
            y: 50,
            text: '1'
        }],
        edges: [{
            source: 0,
            target: 1,
            text: 'A'
        }]
    };

    editor.graph.set_json(graph);

## Size of the editor

    var width = 800, height = 500;
    editor.view.size(width, height);

## Styling

The editor requires some styling to provide a proper visual feedback. Here is a suggested minimal content for your CSS file:

    g.nodes circle {
        cursor: pointer;
    }
    g.nodes circle.marked {
        fill: none;
    }
    .selected, .selection {
        fill: none;
        stroke: black;
        stroke-dasharray: 0.5em, 0.3em;
        stroke-dasharray: 0.6em, 0.2em;
    }
    path.catch {
        fill: none;
        stroke: yellow;
        stroke-width: 0.8em;
        stroke-opacity: 0.0;
        cursor: pointer;
    }
    *.unselectable {
        -moz-user-select: -moz-none;
        -khtml-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

# Dependencies

The editor uses [D3.js](https://github.com/mbostock/d3) for manipulations with SVG.

# License

GNU General Public License v2.0

# Contact

If you have any ideas, feedback, requests or bug reports, you can reach me at [dmitrymyadzelets@gmail.com](mailto:dmitrymyadzelets@gmail.com).