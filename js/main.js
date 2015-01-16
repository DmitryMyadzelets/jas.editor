// JSLint options:
/*global jA*/

(function app () {

    var container = document.getElementById('svg_container');
    var editor = jA.editor.instance(container);


    function resize() {
        editor.view.size(container.offsetWidth, container.offsetHeight);
    }

    resize();

    new ResizeSensor(container, resize);


    function load_graph (name) {
        if ($ && $.jStorage && $.jStorage.storageAvailable()) {
            // $.jStorage.flush();
            return JSON.parse($.jStorage.get(name));
        }
        return null;
    }


    function save_graph (graph, name) {
        if ($ && $.jStorage && $.jStorage.storageAvailable()) {
            var s = JSON.stringify(graph);
            // console.log(s);
            $.jStorage.set(name, s);
        }
    }

    jA.editor.commands.on['update'] = function () {
        var graph = editor.graph.storable();
        save_graph(graph, 'graph');
    };


    (function init () {
        var graph = load_graph('graph');
        if (typeof graph === 'object') {
            editor.set_graph(graph);
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

}());