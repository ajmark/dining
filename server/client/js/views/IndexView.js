(function () {
  'use strict';
  window.App = window.App || {Collections: {}, Models: {}, Views: {}};
  App.Views.IndexView = Backbone.View.extend({
    initialize: function (options) {

    },
    render: function () {
      this.$el.html(_.template($('#tpl-index').html(), {}));
      return this;
    }
  });
})();