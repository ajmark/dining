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
    rte_buy: function() {
      $('.page').hide();
      $('#page-buy').show();
      var currentLoc = [40.4433,-79.9436];
    var sellers = [
        [40,-80],
        [41,-81],
        [35,-79],
        [38,82]
    ];

        var mapOptions = {
          center: new google.maps.LatLng(currentLoc[0], currentLoc[1]),
          zoom: 8
        };
        var map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);
        var myLatlng = new google.maps.LatLng(currentLoc[0], currentLoc[1]);

        var marker = new google.maps.Marker({
            position: myLatlng,
            title:"My Current Location"
        });

        // To add the marker to the map, call setMap();
        marker.setMap(map);

        for (var i=0;i<sellers.length;i++)
        {
            var sMarker = new google.maps.Marker({
                position: new google.maps.LatLng(sellers[i][0], sellers[i][1]),
                title: "A Seller",
                icon: new google.maps.MarkerImage('http://www.clker.com/cliparts/B/B/1/E/y/r/marker-pin-google-hi.png' , undefined, undefined, undefined, new google.maps.Size(20, 35)),
                map:map
            });
            sMarker.setMap(map);
        }
      }
  });

  app.Router = new Router();
  Backbone.history.start({pushState: true});
  Backbone.history.navigate('/', {trigger: true});
})();