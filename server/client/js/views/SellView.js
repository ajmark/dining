(function () {
  'use strict';
  window.App = window.App || {Collections: {}, Models: {}, Views: {}};
  App.Views.SellView = Backbone.View.extend({
    initialize: function (options) {

    },
    render: function () {
      this.$el.attr('id', 'page-sell');
      this.$el.html(_.template($('#tpl-sell').html(), {}));
      return this;
    }
  });
})();