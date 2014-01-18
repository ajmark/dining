(function () {
  'use strict';
  window.app = window.app || {collections: {}, models: {}, views: {}};

  // Router
  // ----------
  var Router = Backbone.Router.extend({
    routes: {
      '': 'rte_index',
      'choose': 'rte_choose',
      'sell': 'rte_sell',
      'sell/:id': 'rte_sell_listing',
      'buy': 'rte_buy',
      'buy/:id': 'rte_buy_listing'
    },
    rte_index: function() {
      console.log('index');
      $('.page').hide();
      $('#page-index').show();
    },
    rte_choose: function() {
      console.log('choose');
      $('.page').hide();
      $('#page-choose').show();
    }
  });

  app.Router = new Router();
  Backbone.history.start({pushState: true});
  Backbone.history.navigate('/', {trigger: true});
})();