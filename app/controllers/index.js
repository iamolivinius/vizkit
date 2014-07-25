import Ember from 'ember';

export default Ember.Controller.extend({
    nodes: [],
    links: [],
    zones: [],
    pause: false,

    init: function() {
        this.socket = io.connect('http://demonstrator.herokuapp.com:80');
        this.socket.on('links', this.updateLinks.bind(this));
        this.socket.on('node_update', this.updatesNodes.bind(this));

        Ember.$(document).on('recognised', function () {
            Ember.$('paper-dialog').get(0).toggle();
        });
    },

    actions: {
        pause: function() {
            this.set('pause', !this.get('pause'));
        }
    },

    nodesForLineChart: function() {
        var preparedData = [];

        this.nodes.forEach(function(n) {
            var column = [];
            column.pushObject(n.get('name'));
            column.pushObjects(n.get('bandwidthHistory'));
            preparedData.pushObject(column);
        });

        return preparedData;
    }.property('nodes.@each.bandwidth'),

    updatesNodes: function(data) {
        if (this.get('pause')) {
            return;
        }

        data.forEach(function(o) {
            var node = this.nodes.findBy('id', o.id);
            if (node) {
                node.setProperties({
                    name: o.name || node.name,
                    zone: o.zone || node.zone,
                    bandwidth: o.bandwidth || node.bandwidth,
                    maxBandwidth: o.maxBandwidth || node.maxBandwidth
                });
                if (o.bandwidth !== undefined) {
                    node.bandwidthHistory.pushObject(o.bandwidth);
                }
                if (o.isStalling !== undefined) {
                    node.set('isStalling', o.isStalling);
                }
            } else {
                this.nodes.pushObject(Ember.Object.create(o));
            }
        }.bind(this));

        // THE API DOES NOT REFLECT NODE LEAVES
        //
        // for (var i = 0; i < this.nodes.length; i++) {
        //     var node = this.nodes[i];
        //     if (!_(data).find({
        //         id: node.id
        //     })) {
        //         this.nodes.removeObject(node);
        //     }
        // }
    },

    updateLinks: function(data) {
        if (this.get('pause')) {
            return;
        }

        data.forEach(function(o) {
            var link = this.links.findBy('id', o.id);
            if (link) {
                // not needed because API does not send updates for source or target
                // link.setProperties({
                //     source: o.source,
                //     target: o.target
                // });
            } else {
                this.links.pushObject(Ember.Object.create(o));
            }
        }.bind(this));

        for (var i = 0; i < this.links.length; i++) {
            var link = this.links[i];
            if (!_(data).find({
                id: link.id
            })) {
                this.links.removeObject(link);
            }
        }
    },

    nodesChanged: function() {}.observes('nodes.[]'),

    linksChanged: function() {}.observes('links.[]', 'links.@each.source', 'links.@each.target'),
});
