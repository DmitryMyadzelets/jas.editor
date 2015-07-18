// Generated by CoffeeScript 1.9.2
(function() {
  describe("The new graph", function() {
    it("is a function of jas.Editor", function() {
      return expect(typeof jas.Editor.graph).toBe('function');
    });
    it("which returns an object", function() {
      var graph;
      graph = jas.Editor.graph();
      return expect(typeof graph).toBe('object');
    });
    describe("The structure of graph", function() {
      var graph;
      graph = jas.Editor.graph();
      it("It has node", function() {
        return expect(typeof graph.node).toBe('object');
      });
      return it("It has edge", function() {
        return expect(typeof graph.edge).toBe('object');
      });
    });
    describe("Adding and removing nodes", function() {
      var a, b, c, graph;
      graph = jas.Editor.graph();
      a = {};
      b = {};
      c = {};
      it("Adds singe node: graph.node.add(a)", function() {
        graph.node.add(a);
        return expect(graph.node.data.length).toBe(1);
      });
      it("graph.node.exists() returns True if the node already exists", function() {
        return expect(graph.node.exists(a)).toBe(true);
      });
      it("graph.node.exists() returns False if the node already exists", function() {
        return expect(graph.node.exists(b)).toBe(false);
      });
      it("Adds second node: graph.node.add(b)", function() {
        graph.node.add(b);
        return expect(graph.node.data.length).toBe(2);
      });
      it("Doesn't add the same node more the once", function() {
        graph.node.add(a);
        return expect(graph.node.data.length).toBe(2);
      });
      it("Removes singe node: graph.node.remove(b)", function() {
        graph.node.remove(b);
        return expect(graph.node.data.length).toBe(1);
      });
      return it("Doesn't remove not existing node", function() {
        graph.node.remove(b);
        return expect(graph.node.data.length).toBe(1);
      });
    });
    describe("Adding and removing edges", function() {
      var a, b, c, e1, e2, graph;
      graph = jas.Editor.graph();
      a = {};
      b = {};
      c = {};
      e1 = {
        source: a,
        target: b
      };
      e2 = {
        source: a,
        target: b
      };
      graph.node.add(a);
      graph.node.add(b);
      it("Adds one edge: graph.edge.add(e1)", function() {
        expect(graph.edge.add(e1)).toBe(true);
        return expect(graph.edge.data.length).toBe(1);
      });
      it("Adds second edge: graph.edge.add(e2)", function() {
        expect(graph.edge.add(e2)).toBe(true);
        return expect(graph.edge.data.length).toBe(2);
      });
      it("Doesn't add the same edge more the once", function() {
        expect(graph.edge.add(e1)).toBe(false);
        return expect(graph.edge.data.length).toBe(2);
      });
      it("Removes singe edge: graph.edge.remove(b)", function() {
        graph.edge.remove(e1);
        return expect(graph.edge.data.length).toBe(1);
      });
      return it("Doesn't remove not existing edge", function() {
        graph.edge.remove(e1);
        return expect(graph.edge.data.length).toBe(1);
      });
    });
    describe("Cleaning graph", function() {
      var a, b, c, e1, graph;
      graph = jas.Editor.graph();
      a = {};
      b = {};
      c = {};
      e1 = {
        source: a,
        target: b
      };
      graph.node.add(a);
      graph.node.add(b);
      graph.edge.add(e1);
      it("There are some nodes and edges", function() {
        expect(graph.node.data.length).not.toBe(0);
        return expect(graph.edge.data.length).not.toBe(0);
      });
      return it("The graph.clear removes all nodes and edges", function() {
        graph.clear();
        expect(graph.node.data.length).toBe(0);
        return expect(graph.edge.data.length).toBe(0);
      });
    });
    describe("Enumeration of nodes and edges", function() {
      var a, b, c, graph;
      graph = jas.Editor.graph();
      a = {};
      b = {};
      c = {};
      return it("Enumerates nodes: graph.node.each()", function() {
        var i;
        graph.node.add(a);
        graph.node.add(b);
        graph.node.add(c);
        i = 0;
        graph.node.each(function() {
          return i++;
        });
        return expect(i).toBe(3);
      });
    });
    describe("One graph doesn't influent another", function() {
      var a, b, graph1, graph2;
      graph1 = jas.Editor.graph();
      graph2 = jas.Editor.graph();
      a = {};
      b = {};
      graph1.node.add(a);
      graph1.node.add(b);
      graph1.edge.add({
        source: a,
        target: b
      });
      return it("When nodes and edges added to one graph, the another one remains unchanged", function() {
        expect(graph1.node.data.length).toBe(2);
        expect(graph1.edge.data.length).toBe(1);
        expect(graph2.node.data.length).toBe(0);
        return expect(graph2.edge.data.length).toBe(0);
      });
    });
    return describe("Structural methods", function() {
      describe("Adjacent edges to a given node", function() {
        var a, b, graph;
        graph = jas.Editor.graph();
        a = {};
        b = {};
        graph.node.add(a);
        graph.node.add(b);
        graph.edge.add({
          source: a,
          target: b
        });
        graph.edge.add({
          source: b,
          target: b
        });
        it("Graph has 2 nodes 'a' and 'b' and 2 edges 'a-b' and 'b-b' ", function() {
          expect(graph.node.data.length).toBe(2);
          return expect(graph.edge.data.length).toBe(2);
        });
        it("graph.edge.adjacent(a) returns array with 1 edge", function() {
          var e;
          e = graph.edge.adjacent(a);
          return expect(e.length).toBe(1);
        });
        it("graph.edge.adjacent(b) returns array with 2 edges", function() {
          var e;
          e = graph.edge.adjacent(b);
          return expect(e.length).toBe(2);
        });
        it("Works also for array of nodes: graph.edge.adjacent([a, b]) gives 2 edges", function() {
          var e;
          e = graph.edge.adjacent([a, b]);
          return expect(e.length).toBe(2);
        });
        return it("Edges are unique: graph.edge.adjacent([a, a]) gives 1 edge", function() {
          var e;
          e = graph.edge.adjacent([a, a]);
          return expect(e.length).toBe(1);
        });
      });
      return describe("Incoming and outgoing edges", function() {
        var a, b, graph;
        graph = jas.Editor.graph();
        a = {};
        b = {};
        graph.node.add(a);
        graph.node.add(b);
        graph.edge.add({
          source: a,
          target: b
        });
        graph.edge.add({
          source: b,
          target: b
        });
        graph.edge.add({
          source: b,
          target: a
        });
        it("Graph has 2 nodes 'a' and 'b' and 3 edges 'a-b', 'b-b' and 'b-a'", function() {
          expect(graph.node.data.length).toBe(2);
          return expect(graph.edge.data.length).toBe(3);
        });
        it("Node 'a' has 1 incoming edge", function() {
          return expect(graph.edge.incoming(a).length).toBe(1);
        });
        it("Node 'b' has 2 incoming edge", function() {
          return expect(graph.edge.incoming(b).length).toBe(2);
        });
        it("Node 'a' has 1 outgoing edge", function() {
          return expect(graph.edge.outgoing(a).length).toBe(1);
        });
        return it("Nodes 'a' and 'b' has 3 outgoing edges: graph.edge.outgoing([a, b])", function() {
          return expect(graph.edge.outgoing([a, b]).length).toBe(3);
        });
      });
    });
  });

}).call(this);
