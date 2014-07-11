import Ember from 'ember';

export default Ember.Component.extend({
    values: [],

    valuesString: function() {
        return _(this.values).last(20).join(',');
    }.property('values.[]'),

    valuesChanged: function() {
        Ember.run.schedule('afterRender', function () {
            this.$('#peity-values').change();
        }.bind(this));
    }.observes('valuesString'),

    didInsertElement: function() {
        this.$('#peity-values').peity('line', {
            width: 100,
            fill: 'none'
        });
    }
});
