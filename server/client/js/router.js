(function () {
  'use strict';
  window.App = window.App || {Collections: {}, Models: {}, Views: {}};

  // Router
  // ----------
  var Router = Backbone.Router.extend({
    routes: {
      '': 'rte_index',
      'choose': 'rte_choose',
      'sell': 'rte_sell',
      'sell/:id': 'rte_sellListing',
      'buy': 'rte_buy',
      'buy/:id': 'rte_buyListing'
    },
    rte_index: function() {
      this.currentView = new App.Views.IndexView();
      $('#content').html(this.currentView.render().el);
    },
    rte_choose: function() {
      this.currentView = new App.Views.ChooseView();
      $('#content').html(this.currentView.render().el);
    },
    rte_sell: function() {
      this.currentView = new App.Views.SellView();
      $('#content').html(this.currentView.render().el);
    },
    rte_buy: function(id) {
      this.currentView = new App.Views.BuyView();
      $('#content').html(this.currentView.render().el);
      this.currentView.renderMap();
    },
    rte_buyListing: function() {
      this.currentView = new App.Views.BuyListingView();
      $('#content').html(this.currentView.render().el);
    }
  });

  App.Router = new Router();
})();