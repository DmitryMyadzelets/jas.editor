# Automata Editor

The automata editor is intended to become:
* A simple and fast hand-drawn-like automata design tool.
* A base for simulators, code generators and any other automata-related project which can come into your mind.

An example of how an automaton may look in the editor:

![Automaton for delayed save](https://github.com/dmitrymyadzelets/jas.editor/blob/master/img/graph_delayed_save.png "Automaton for delayed save of multiple updates")

Try it out: [http://dmitrymyadzelets.github.io/jas.editor/](http://dmitrymyadzelets.github.io/jas.editor/)

# How to use it in other project

The editor is created such that it can be easily used in other projects related to automata. The core of the editor implements only drawing and undo/redo capabilities. The API (will be described later) allows your to extend its functionality.

# Dependencies

The editor uses [D3.js](https://github.com/mbostock/d3) for manipulations with SVG.

# License

GNU General Public License v2.0

# Contact

If you have any ideas, feedback, requests or bug reports, you can reach me at [dmitrymyadzelets@gmail.com](mailto:dmitrymyadzelets@gmail.com).