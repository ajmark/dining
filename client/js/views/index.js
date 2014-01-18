(function () {
  'use strict';
  window.app = window.app || {collections: {}, models: {}, views: {}};
  app.views.indexView = Backbone.View.extend({
    initialize: function (options) {
      // model is passed through
      this.notes = options.notes;
      this.notes.bind('reset', this.addAll, this);
    },
    render: function () {
      $('#page-index').show();
      return this;
    },
  });
});