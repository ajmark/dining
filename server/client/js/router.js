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
      'buy/:id': 'rte_buyListing',
      'chat': 'rte_chat'
    },
    rte_index: function() {
      $('.page').hide();
      $('#page-index').show();
    },
    rte_choose: function() {
      $('.page').hide();
      $('#page-choose').show();
    },
    rte_sell: function() {
      $('.page').hide();
      $('#page-sell').show();
    },
    rte_buy: function(id) {
      $('.page').hide();
      $('#page-buy').show();
    },
    rte_buyListing: function(id) {
      $('.page').hide();
      $('#page-buyListing').show();
    },
    rte_chat: function(){
      $('.page').hide();
      $("#page-chat").show();
    }
  });

  App.Router = new Router();
})();