
describe "A 'graph'", ->

    editor = null
    graph = null

    it "Is an object property of jas.Editor() instance", ->
        editor = new jas.Editor
        expect(typeof editor).toBe('object')
        graph = editor.graph
        expect(typeof graph).toBe('object')

    it "Has 'graph.node' object", ->
        expect(typeof graph.node).toBe('object')

    it "Has 'graph.edge' object", ->
        expect(typeof graph.edge).toBe('object')

    it "Has 'graph.set_json' function", ->
        expect(typeof graph.set_json).toBe('function')

    it "Has 'graph.get_json' function", ->
        expect(typeof graph.get_json).toBe('function')


describe "A 'graph.node'", ->

    editor = new jas.Editor
    graph = editor.graph
    node = graph.node

    describe "Has methods:", ->

        it "node.add", ->
            expect(typeof node.add).toBe('function')

        it "node.remove", ->
            expect(typeof node.remove).toBe('function')

        it "node.text", ->
            expect(typeof node.text).toBe('function')

        it "node.move", ->
            expect(typeof node.move).toBe('function')

        it "node.mark", ->
            expect(typeof node.mark).toBe('function')

        it "node.unmark", ->
            expect(typeof node.unmark).toBe('function')

        it "node.initial", ->
            expect(typeof node.initial).toBe('function')

        it "node.not_initial", ->
            expect(typeof node.not_initial).toBe('function')

        it "node.stress", ->
            expect(typeof node.stress).toBe('function')

    describe "Has objects:", ->

        it "node.edge as a reference to graph.edge", ->
            expect(node.edge == graph.edge).toBe(true)

        it "node.data is an instance of Array", ->
            expect(node.data instanceof Array).toBe(true)


describe "A 'graph.edge'", ->

    editor = new jas.Editor
    graph = editor.graph
    edge = graph.edge

    describe "Has methods:", ->

        it "edge.add", ->
            expect(typeof edge.add).toBe('function')

        it "edge.remove", ->
            expect(typeof edge.remove).toBe('function')

        it "edge.text", ->
            expect(typeof edge.text).toBe('function')

        it "edge.nodes", ->
            expect(typeof edge.nodes).toBe('function')

        it "edge.stress", ->
            expect(typeof edge.stress).toBe('function')

    describe "Has objects:", ->

        it "edge.data is an instance of Array", ->
            expect(edge.data instanceof Array).toBe(true)


describe "A 'graph.get_json' method", ->

    editor = new jas.Editor
    graph = editor.graph
    o = graph.get_json()

    it "Returns an object { nodes, edges } with empty nodes and edges", ->
        expect(typeof o).toBe('object')
        expect(o.nodes instanceof Array).toBe(true)
        expect(o.edges instanceof Array).toBe(true)
        expect(o.nodes.length).toBe(0)
        expect(o.edges.length).toBe(0)


describe "A 'graph.set_json' method", ->

    editor = new jas.Editor
    graph = editor.graph

    g = {
        nodes : [{}, {}]
        edges : [
            { source : 0, target : 1 },
            { source : 1, target : 0 },
            { source : 1, target : 1 },
        ]
    }

    graph.set_json(g)

    describe "Can attach a graph with 2 nodes and 3 edges", ->
        o = graph.get_json()

        it "And 'graph.get_json' returns an object with 2 nodes and 3 edges", ->
            console.log o
            expect(typeof o).toBe('object')
            expect(o.nodes instanceof Array).toBe(true)
            expect(o.edges instanceof Array).toBe(true)
            expect(o.nodes.length).toBe(2)
            expect(o.edges.length).toBe(3)

    describe "The graph can be modified", ->

        node = {}

        it "graph.node.add(node = {}) adds new 3d node", ->
            graph.node.add(node)
            expect(graph.get_json().nodes.length).toBe(3)

        it "graph.node.remove(node) removes this node", ->
            graph.node.remove(node)
            expect(graph.get_json().nodes.length).toBe(2)

        describe "The same can be done with arrays", ->

            it "graph.node.add([node]) adds new 3d node", ->
                graph.node.add([node])
                expect(graph.get_json().nodes.length).toBe(3)

            it "graph.node.remove([node]) removes this node", ->
                graph.node.remove([node])
                expect(graph.get_json().nodes.length).toBe(2)

        it "graph.node.add([node, node]) adds the same node twice", ->
                graph.node.add([node, node])
                expect(graph.get_json().nodes.length).toBe(4)

        it "graph.node.remove(node) removes one node", ->
                graph.node.remove(node)
                expect(graph.get_json().nodes.length).toBe(3)
                graph.node.remove(node)
                expect(graph.get_json().nodes.length).toBe(2)
