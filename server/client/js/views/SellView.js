(function () {
  'use strict';
  window.App = window.App || {Collections: {}, Models: {}, Views: {}};
  App.Views.SellView = Backbone.View.extend({
    events: {
      'click #foursquare': 'foursquarePopup'
    },
    initialize: function (options) {

    },
    render: function () {
      this.$el.attr('id', 'page-sell');
      this.$el.html(_.template($('#tpl-sell').html(), {}));
      return this;
    },
    foursquarePopup: function() {
      $('.venue-chooser').fadeIn();

      navigator.geolocation.getCurrentPosition(function(position) {
        $.get('/api/get_coords?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude, function(data) {
          var ul = $('<ul>');

          for (var i in data) {
            var a = $('<a>');
            a.attr('href','#').html(data[i].name + ' <br>' + data[i].addr);
            ul.append($('<li>').append(a));
          }

          $('.venues').append(ul);
          
        });
      });
    }
  });
})();