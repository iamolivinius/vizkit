import Ember from 'ember';

export
default Ember.Component.extend({
    nodes: [],
    links: [],
    zones: [],

    force: null,
    svg: null,
    node: null,
    link: null,
    legend: null,

    width: null,
    height: null,

    padding: 0.0, // separation between same-color circles
    clusterPadding: 75.0, // separation between different-color circles
    maxRadius: 30,
    clusters: new Array(2),

    color: null,
    diameter: null,

    tick: function(e) {
        this.link.attr('d', function(d) {
            var mx = (d.source.x + d.target.x) / 2;
            var my = (d.source.y + d.target.y) / 2;
            return 'M' + d.source.x + ',' + d.source.y + 'L' + mx + ',' + my + 'L' + d.target.x + ',' + d.target.y;
        });

        this.node
            .each(this.cluster(0.1 * e.alpha))
            .each(this.collide(0.5 * e.alpha))
            .attr('transform', function(d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });
    },

    update: function() {
        var self = this;

        self.link = self.svg.selectAll('.link')
            .data(self.force.links(), function(d) {
                return d.id;
            });

        self.link.enter()
            .append('path')
            .attr('class', 'link')
            .attr('marker-mid', 'url(#arrow)');

        self.link.exit().remove();

        self.node = self.svg.selectAll('g.node')
            .data(self.force.nodes(), function(d) {
                return d.id;
            });

        self.node.select('.bandwidth-border')
            .attr('stroke', function(d) {
                return d3.rgb(self.color(d.zone)).brighter(2);
            })
            .transition()
            .duration(750)
            .attr('stroke-opacity', 1)
            .attr('r', function(d) {
                return self.diameter(d.bandwidth);
            })
            .transition()
            .delay(750)
            .duration(750)
            .attr('stroke-opacity', 0);

        self.node.select('.bandwidth')
            .transition()
            .duration(1500)
            .attr('r', function(d) {
                return self.diameter(d.bandwidth);
            })
            .attr('fill', function(d) {
                return self.color(d.zone);
            });

        self.node.select('.max-bandwidth')
            .classed('stalling', function(d) {
                return d.isStalling;
            })
            .transition()
            .duration(1500)
            .attr('r', function(d) {
                return self.diameter(d.maxBandwidth);
            })
            .attr('fill', function(d) {
                return self.color(d.zone);
            })
            .attr('fill', function(d) {
                return d.isStalling ? self.desaturate(self.color(d.zone)) : self.color(d.zone);
            });
        // .attr('fill', function (d) {
        //   if (d.isStalling != undefined && d.isStalling) {
        //     var col = d3.hsl(color(d.zone));
        //     col.s = 0;
        //     return col.rgb();
        //   }
        //   return color(d.zone);
        // })
        // .attr('stroke', 'black')
        // .attr('stroke-width', '2px')
        // .attr('stroke-dasharray', '5 5')
        // .attr('stroke-linecap', 'round');

        var nodeEnter = self.node
            .enter()
            .append('g')
            .attr('class', 'node')
            .call(self.force.drag);

        nodeEnter
            .append('circle')
            .attr('class', 'max-bandwidth')
            .attr('r', function(d) {
                return self.diameter(d.maxBandwidth);
            })
            .attr('fill', function(d) {
                return self.color(d.zone);
            })
            .attr('fill-opacity', '0.5');

        nodeEnter
            .append('circle')
            .attr('class', 'bandwidth')
            .attr('r', function(d) {
                return self.diameter(d.bandwidth);
            })
            .attr('fill', function(d) {
                return self.color(d.zone);
            });

        nodeEnter
            .append('circle')
            .attr('class', 'bandwidth-border')
            .attr('fill-opacity', 0)
            .attr('stroke', function(d) {
                return d3.rgb(self.color(d.zone)).brighter(2);
            })
            .attr('stroke-opacity', 0)
            .attr('r', function(d) {
                return self.diameter(d.bandwidth);
            });

        nodeEnter
            .append('text')
            .text(function(d) {
                return d.name;
            });

        self.node.exit().remove();

        self.legend = self.svg.selectAll('.legend')
            .data(self.zones, function(d) {
                return d.id;
            });

        self.legend.select('rect')
            .attr('fill', function(d) {
                return self.color(d.id);
            });

        self.legend.select('text')
            .text(function(d) {
                return d.name;
            });

        var legendEnter = self.legend.enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(20, 70)');

        legendEnter.append('rect')
            .attr('x', 0 + 20)
            .attr('y', function(d, i) {
                return i * 24;
            })
            .attr('width', 16)
            .attr('height', 16)
            .attr('fill', function(d) {
                return self.color(d.id);
            });

        legendEnter.append('text')
            .attr('x', 36 + 8)
            .attr('y', function(d, i) {
                return (i * 24) + 14;
            })
            .text(function(d) {
                return d.name;
            });

        self.legend.exit().remove();

        self.force.start();

        var tmpnodes = document.querySelectorAll('.node');
        _(tmpnodes).forEach(function(n) {
            var parent = n.parentNode;
            parent.appendChild(n);
        });
    },

    cluster: function(alpha) {
        var self = this;

        return function(d) {
            var cluster = self.clusters[d.zone];
            if (cluster === d) {
                return;
            }
            var x = d.x - cluster.x,
                y = d.y - cluster.y,
                l = Math.sqrt(x * x + y * y),
                r = d.maxBandwidth / 10 + cluster.maxBandwidth / 10;
            if (l != r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                cluster.x += x;
                cluster.y += y;
            }
        };
    },

    collide: function(alpha) {
        var self = this;

        var quadtree = d3.geom.quadtree(self.nodes);
        return function(d) {
            var r = d.maxRadius / 10 + self.maxRadius / 10 + Math.max(self.padding, self.clusterPadding),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                    var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.maxBandwidth / 10 + quad.point.maxBandwidth / 10 + (d.zone === quad.point.zone ? self.padding : self.clusterPadding);
                    if (l < r) {
                        l = (l - r) / l * alpha;

                        if (d.x - self.maxRadius > 0 && d.x + self.maxRadius < self.width) {
                            d.x -= x *= l;
                            if (quad.point.x - self.maxRadius > 0 && quad.point.x + self.maxRadius < self.width) {
                                quad.point.x += x;
                            }
                        }

                        if (d.y - self.maxRadius > 0 && d.y + self.maxRadius < self.height) {
                            d.y -= y *= l;
                            if (quad.point.y - self.maxRadius > 0 && quad.point.y + self.maxRadius < self.height) {
                                quad.point.y += y;
                            }
                        }
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    },

    nodesChanged: function() {
        var self = this;

        var zones = _(this.nodes).groupBy('zone').pairs().valueOf();
        _(zones).forEach(function(z) {
            self.clusters[z[0]] = _(z[1]).max('bandwidth').valueOf();
        });

        this.update();
    }.observes('nodes.[]', 'nodes.@each.bandwidth', 'nodes.@each.zone', 'nodes.@each.isStalling'),

    linksChanged: function() {
        var self = this;

        _(self.nodes).forEach(function(node, i) {
            _(self.links).filter({
                source: node.id
            }).forEach(function(link) {
                link.set('source', i);
            });
            _(self.links).filter({
                target: node.id
            }).forEach(function(link) {
                link.set('target', i);
            });
        });

        this.update();
    }.observes('links.[]', 'links.@each.source', 'links.@each.target'),

    desaturate: function(d) {
        var color = d3.hsl(d);
        color.s = 0.35;
        return color;
    },

    resizeGraph: function() {
        this.width = Ember.$(Ember.$('#network-graph').parents(':not(.ember-view)')[0]).width();
        this.height = Ember.$(Ember.$('#network-graph').parents(':not(.ember-view)')[0]).height();
        this.force.size([this.width, this.height]);
        this.svg.attr('width', this.width);
        this.svg.attr('height', this.height);
    },

    didInsertElement: function() {
        window.onresize = this.resizeGraph.bind(this);

        Ember.run.later(this, function() {
            this.width = Ember.$(Ember.$('#network-graph').parents(':not(.ember-view)')[0]).width();
            this.height = Ember.$(Ember.$('#network-graph').parents(':not(.ember-view)')[0]).height();

            console.log(this.width);
            console.log(this.height);

            this.color = d3.scale.category10()
                .domain(['z_1', 'z_2']),

            this.diameter = d3.scale.linear()
                .domain([0, 500])
                .range([0, this.maxRadius]),

            this.force = d3.layout.force()
                .nodes(this.nodes)
                .links(this.links)
                .gravity(0.05)
                .linkDistance(150)
                .charge(-400)
                .friction(0.80)
                .size([this.width, this.height])
                .on('tick', this.tick.bind(this));

            this.svg = d3.select('#network-graph').append('svg')
                .attr('width', this.width)
                .attr('height', this.height);

            this.svg.append("defs").selectAll("marker")
                .data(["arrow"])
                .enter()
                .append("marker")
                .attr("id", function(d) {
                    return d;
                })
                .attr("viewBox", "0 -5 10 10")
                .attr("markerWidth", 8)
                .attr("markerHeight", 8)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M0,-5L10,0L0,5");

            this.svg.append('g')
                .attr('width', 100)
                .attr('height', 100)
                .attr('class', 'legendHeading')
                .attr('transform', 'translate(40, 50)')
                .append('text')
                .text('Zones');

            this.node = this.svg.selectAll('.node');
            this.link = this.svg.selectAll('.link');
            this.legend = this.svg.selectAll('.legend');

            this.nodesChanged();
            this.linksChanged();
            this.update();
        }.bind(this), 500);

        //     // tmpnodes.forEach(function (n) {
        //     //   var parent = n.parentNode;
        //     //   parent.appendChild(n);
        //     // });

        //     // $('.node').each(function (i, o) { var parent = $(o).parent(); parent.append(o); });
        // }
    }
});
