(function () {
  'use strict';
  window.App = window.App || {Collections: {}, Models: {}, Views: {}};
  App.Views.BuyListingView = Backbone.View.extend({
    initialize: function (options) {

    },
    render: function () {
      this.$el.html(_.template($('#tpl-buyListing').html(), {seller_name: "Timothy Koh", amt: 20}));
      return this;
    }
  });
})();