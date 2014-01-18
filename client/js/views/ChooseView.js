(function () {
  'use strict';
  window.App = window.App || {Collections: {}, Models: {}, Views: {}};
  App.Views.ChooseView = Backbone.View.extend({
    initialize: function (options) {

    },
    render: function () {
      this.$el.html(_.template($('#tpl-choose').html(), {}));
      return this;
    }
  });
})();