import Ember from 'ember';

export default Ember.Component.extend({
    chart: null,
    data: [],

    dataChanged: function() {
        this.chart.load({
            columns: this.data
        });
    }.observes('data.[]'),

    didInsertElement: function() {
        Ember.run.later(this, function() {
            this.chart = c3.generate({
                bindto: '#line-chart',
                data: {
                    columns: this.data,
                    type: 'spline'
                },
                legend: {
                    position: 'right'
                },
                axis: {
                    x: {
                        label: {
                            text: 'Nodes',
                            position: 'inner-right'
                        }
                    },
                    y: {
                        label: {
                            text: 'Bandwidth',
                            position: 'outer-middle'
                        }
                    },
                },
                grid: {
                    x: {
                        show: false
                    },
                    y: {
                        show: true
                    }
                },
                subchart: {
                    show: true
                },
                zoom: {
                    enabled: true
                }
            });
        }, 250);
    }
});
