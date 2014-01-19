(function() {

  var dataArray;
  var currItem = 0;
  var hash = null;

  function bindData(obj) {
    $('#seller-info img').attr('src', 'https://graph.facebook.com/' + obj['fbid'] + '/picture?width=150&height=150');
    $('#seller-info .name').html(obj['user_name']);
    $('#loc').html(obj['location']);
    $('#price').html(obj['rate']);
    $('#eat').html(obj['status']);
    $('#message').html(obj['msg']);
    hash = obj['hash'];
  }

  navigator.geolocation.getCurrentPosition(function(position) {
    $.ajax({
      url: "/api/get_listings",
      type: "GET",
      data: {
        "lat" : position.coords.latitude,
        "lng" : position.coords.longitude
      },
      success: function(results) {
        dataArray = results;
        bindData(results[currItem]);
      }
    });
  });

  $('#page-buy .no').click(function() {
    currItem++;
    if (currItem >= dataArray.length)  currItem = 0;
    bindData(dataArray[currItem]);
  });

  $('#page-buy .yes').click(function() {
    Backbone.history.navigate('/buy/' + hash, {trigger: true});
  });
})();