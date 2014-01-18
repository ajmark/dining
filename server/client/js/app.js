// Click handler, intercepts all links
$(document).on('click', "a[href^='/']", function(event) {
  var href = $(event.currentTarget).attr('href');
  var passThrough = href.indexOf('http://') >= 0 || $(event.currentTarget).attr('rel') == 'nojs';

  if (!passThrough && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    event.preventDefault();

    var url = href.replace(/^\//,'').replace('\#\!\/','');

    Backbone.history.navigate(url, {trigger: true});

    return false;
  }
});