
describe "The new graph", ->

    it "is a function of jas.Editor", ->
        expect(typeof jas.Editor.graph).toBe('function')

    it "which returns an object", ->
        graph = jas.Editor.graph()
        expect(typeof graph).toBe('object')

    describe "The structure of graph", ->

        graph = jas.Editor.graph()

        it "It has node", ->
            expect(typeof graph.node).toBe('object')

        it "It has edge", ->
            expect(typeof graph.edge).toBe('object')

    describe "Adding and removing nodes", ->

        graph = jas.Editor.graph()
        a = {}
        b = {}
        c = {}

        it "Adds singe node: graph.node.add(a)", ->
            graph.node.add(a)
            expect(graph.node.data.length).toBe(1)

        it "graph.node.exists() returns True if the node already exists", ->
            expect(graph.node.exists(a)).toBe(true)

        it "graph.node.exists() returns False if the node already exists", ->
            expect(graph.node.exists(b)).toBe(false)

        it "Adds second node: graph.node.add(b)", ->
            graph.node.add(b)
            expect(graph.node.data.length).toBe(2)

        it "Doesn't add the same node more the once", ->
            graph.node.add(a)
            expect(graph.node.data.length).toBe(2)

        it "Removes singe node: graph.node.remove(b)", ->
            graph.node.remove(b)
            expect(graph.node.data.length).toBe(1)

        it "Doesn't remove not existing node", ->
            graph.node.remove(b)
            expect(graph.node.data.length).toBe(1)

    describe "Adding and removing edges", ->

        graph = jas.Editor.graph()
        a = {}
        b = {}
        c = {}
        e1 = { source : a, target : b }
        e2 = { source : a, target : b }
        graph.node.add(a)
        graph.node.add(b)

        it "Adds one edge: graph.edge.add(e1)", ->
            expect(graph.edge.add(e1)).toBe(true)
            expect(graph.edge.data.length).toBe(1)

        it "Adds second edge: graph.edge.add(e2)", ->
            expect(graph.edge.add(e2)).toBe(true)
            expect(graph.edge.data.length).toBe(2)

        it "Doesn't add the same edge more the once", ->
            expect(graph.edge.add(e1)).toBe(false)
            expect(graph.edge.data.length).toBe(2)

        it "Removes singe edge: graph.edge.remove(b)", ->
            graph.edge.remove(e1)
            expect(graph.edge.data.length).toBe(1)

        it "Doesn't remove not existing edge", ->
            graph.edge.remove(e1)
            expect(graph.edge.data.length).toBe(1)

    describe "Cleaning graph", ->

        graph = jas.Editor.graph()
        a = {}
        b = {}
        c = {}
        e1 = { source : a, target : b }
        graph.node.add(a)
        graph.node.add(b)
        graph.edge.add(e1)

        it "There are some nodes and edges", ->
            expect(graph.node.data.length).not.toBe(0)
            expect(graph.edge.data.length).not.toBe(0)

        it "The graph.clear removes all nodes and edges", ->
            graph.clear()
            expect(graph.node.data.length).toBe(0)
            expect(graph.edge.data.length).toBe(0)

    describe "Enumeration of nodes and edges", ->

        graph = jas.Editor.graph()
        a = {}
        b = {}
        c = {}

        it "Enumerates nodes: graph.node.each()", ->
            graph.node.add(a)
            graph.node.add(b)
            graph.node.add(c)
            i = 0
            graph.node.each(-> i++)
            expect(i).toBe(3)

    describe "One graph doesn't influent another", ->

        graph1 = jas.Editor.graph();
        graph2 = jas.Editor.graph();
        a = {}
        b = {}
        graph1.node.add(a)
        graph1.node.add(b)
        graph1.edge.add({ source : a, target : b })

        it "When nodes and edges added to one graph, the another one remains unchanged", ->
            expect(graph1.node.data.length).toBe(2)
            expect(graph1.edge.data.length).toBe(1)
            expect(graph2.node.data.length).toBe(0)
            expect(graph2.edge.data.length).toBe(0)

    describe "Structural methods", ->

        describe "Adjacent edges to a given node", ->

            graph = jas.Editor.graph()
            a = {}
            b = {}
            graph.node.add(a)
            graph.node.add(b)
            graph.edge.add({ source : a, target : b })
            graph.edge.add({ source : b, target : b })

            it "Graph has 2 nodes 'a' and 'b' and 2 edges 'a-b' and 'b-b' ", ->
                expect(graph.node.data.length).toBe(2)
                expect(graph.edge.data.length).toBe(2)

            it "graph.edge.adjacent(a) returns array with 1 edge", ->
                e = graph.edge.adjacent(a)
                expect(e.length).toBe(1)

            it "graph.edge.adjacent(b) returns array with 2 edges", ->
                e = graph.edge.adjacent(b)
                expect(e.length).toBe(2)

            it "Works also for array of nodes: graph.edge.adjacent([a, b]) gives 2 edges", ->
                e = graph.edge.adjacent([a, b])
                expect(e.length).toBe(2)

            it "Edges are unique: graph.edge.adjacent([a, a]) gives 1 edge", ->
                e = graph.edge.adjacent([a, a])
                expect(e.length).toBe(1)

        describe "Incoming and outgoing edges", ->

            graph = jas.Editor.graph()
            a = {}
            b = {}
            graph.node.add(a)
            graph.node.add(b)
            graph.edge.add({ source : a, target : b })
            graph.edge.add({ source : b, target : b })
            graph.edge.add({ source : b, target : a })

            it "Graph has 2 nodes 'a' and 'b' and 3 edges 'a-b', 'b-b' and 'b-a'", ->
                expect(graph.node.data.length).toBe(2)
                expect(graph.edge.data.length).toBe(3)

            it "Node 'a' has 1 incoming edge", ->
                expect(graph.edge.incoming(a).length).toBe(1)

            it "Node 'b' has 2 incoming edge", ->
                expect(graph.edge.incoming(b).length).toBe(2)

            it "Node 'a' has 1 outgoing edge", ->
                expect(graph.edge.outgoing(a).length).toBe(1)

            it "Nodes 'a' and 'b' has 3 outgoing edges: graph.edge.outgoing([a, b])", ->
                expect(graph.edge.outgoing([a, b]).length).toBe(3)

