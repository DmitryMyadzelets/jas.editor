// JSLint options:
/*global View, Graph, Commands, wrap, after, Controller*/

    /**
     * Creates a new instance of Editor
     * @class
     * @param {Object} [container] HTML DOM element. If not given, the document body is used as a container.
     * @example var editor = new jas.editor.Instance(document.getElementById('id_editor'));
     */
    var Editor = function (container) {
        /**
         * The model (in terms of MVC) of the editor
         * @type {Graph}
         */
        this.graph = new Graph();
        /**
         * The view (in terms of MVC) of the editor
         * @type {View}
         */
        this.view = new View(container);
        // Wrap graph methods with new methods which update the view
        wrap(this.graph, this.view);
        /**
         * Commands for undo\redo behaviour
         * @type {Commands}
         */
        this.commands = new Commands(this.graph);
        /**
         * The controller (in terms of MVC) of the editor
         * @type {Controller}
         */
        this.controller = new Controller(this.view, this.commands);

        function update() {
            this.commands.clear_history();
            this.view.graph(this.graph.object());
        }
        update.call(this);

        // Set callback which updates the view and commands when a user sets a new graph
        after(this.graph, 'set_json', update.bind(this));
    };

    jas.Editor = Editor;
    jas.after = after;


}(window));
