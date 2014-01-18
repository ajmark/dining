(function () {
  'use strict';
  window.App = window.App || {Collections: {}, Models: {}, Views: {}};
  App.Views.BuyView = Backbone.View.extend({
    initialize: function (options) {
      // model is passed through
      this.notes = options.notes;
      this.notes.bind('reset', this.addAll, this);
    },
    render: function () {
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

      $('#page-index').show();
      return this;
    },
  });
});