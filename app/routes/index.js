import Ember from 'ember';

export default Ember.Route.extend({
    model: function() {
        var RESTUrl = 'http://demonstrator.herokuapp.com/';

        return new Ember.RSVP.hash({
            nodes: Ember.$.ajax({url: RESTUrl + 'nodes', dataType: 'json', type: 'GET'}),
            links: Ember.$.ajax({url: RESTUrl + 'links', dataType: 'json', type: 'GET'}),
            zones: Ember.$.ajax({url: RESTUrl + 'zones', dataType: 'json', type: 'GET'}),
        });
    },

    setupController: function (controller, model) {
        var nodes = [];
        model.nodes.forEach(function (n) {
            n.bandwidthHistory = [0];
            nodes.pushObject(Ember.Object.create(n));
        });

        var links = [];
        model.links.forEach(function (n) {
            links.pushObject(Ember.Object.create(n));
        });

        var zones = [];
        model.zones.forEach(function (n) {
            zones.pushObject(Ember.Object.create(n));
        });
        controller.set('nodes', nodes);
        controller.set('links', links);
        controller.set('zones', zones);
    }
});
