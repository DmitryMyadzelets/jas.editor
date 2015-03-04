// JSLint options:
/*global d3, jas, ResizeSensor, Blob, saveAs*/

(function app() {

    var container = document.getElementById('svg_container');
    var editor = new jas.editor.Instance(container);


    function resize() {
        editor.view.size(container.offsetWidth, container.offsetHeight);
    }

    resize();

    new ResizeSensor(container, resize);


    function load_graph(name) {
        if ($ && $.jStorage && $.jStorage.storageAvailable()) {
            // $.jStorage.flush();
            return JSON.parse($.jStorage.get(name));
        }
        return null;
    }


    function save_graph(graph, name) {
        if ($ && $.jStorage && $.jStorage.storageAvailable()) {
            var s = JSON.stringify(graph);
            // console.log(s);
            $.jStorage.set(name, s);
        }
    }

    /**
     * State machine which calls save method after the last change when its timer expires.
     * It accepts two events: 
     * 1. 'update' from an editor.
     * 2. Timer event (the timer is set by the machine itslef).
     */
    var save_controller = (function () {
        "use strict";
        var timer, counter;

        function tout() { state(); }

        var state, states = {
            init : function () {
                counter = 0;
                timer = setInterval(tout, 500);
                state = states.wait_for_tout;
            },
            wait_for_tout : function (event) {
                if (event === 'update') {
                    counter = 0;
                } else {
                    // Wait for at least 2 consiquent timer events
                    if (++counter > 1) {
                        clearInterval(timer);
                        save_graph(editor.graph.get_json(), 'graph');
                        state = states.init;
                    }
                }
            }
        };
        state = states.init;

        return function loop() {
            state.apply(this, arguments);
            return loop;
        };
    }());


    jas.after(editor.commands, 'update', function () {
        save_controller('update');
    });


    (function init() {
        var graph = load_graph('graph');
        if (graph && graph.nodes) {
            editor.graph.set_json(graph);
        } else {
            var x = container.offsetWidth / 4;
            var y = container.offsetHeight / 3;
            editor.graph.set_json({
                nodes : [
                    { x : x, y : y, initial : true, text : 'off' },
                    { x : x + 150, y : y, text : 'on' },
                    { x : x + 150, y : y + 100, marked : true}
                ],
                edges : [
                    {source : 0, target : 1, text : 'up'},
                    {source : 1, target : 1, text : '*'},
                    {source : 1, target : 0, text : 'down'},
                    {source : 1, target : 2, text : 'hello world'}
                ]
            });
        }
    }());


    // SaveAs functionality
    d3.select('#btn_save').on('click', function () {
        // A separate SVG document must have its styling included into a CDATA section.
        // The below code does it.

        // Get SVG document, make a copy, and set namespace explicitly
        var svg = container.getElementsByTagName('svg')[0];
        if (!svg) { return; }
        svg = svg.cloneNode(true);
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        // Make a fake parent node in oder do delete copy of SVG late
        var foo = document.createElement('foo');
        foo.appendChild(svg);

        var defs = foo.getElementsByTagName('defs')[0];
        if (defs) {
            var style = defs.getElementsByTagName('style')[0];
            if (style) {
                var cdata = document.createTextNode('<![CDATA[' + style.innerHTML + ' ]]>');

                style.parentNode.removeChild(style);
                style = document.createElement('style');
                style.appendChild(cdata);
                defs.appendChild(style);
            }
        }

        // Save the SVG into a file
        var blob = new Blob(
            // [(new XMLSerializer).serializeToString(doc)],
            [foo.innerHTML],
            {type: 'image/svg+xml'}
        );
        saveAs(blob, 'graph' + '.svg');

        // Delete the copy of SVG
        svg.parentNode.removeChild(svg);
    });


    d3.select('#btn_undo').on('click', function () {
        editor.commands.undo();
    });


    d3.select('#btn_redo').on('click', function () {
        editor.commands.redo();
    });

}());