
describe "The graph proxy", ->

    it "is a function of jas.Editor", ->
        expect(typeof jas.Editor.proxy).toBe('function')

    it "which returns an object", ->
        graph = jas.Editor.proxy()
        expect(typeof graph).toBe('object')

    describe "One graph doesn't influent another", ->

        graph1 = jas.Editor.proxy();
        graph2 = jas.Editor.proxy();
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
