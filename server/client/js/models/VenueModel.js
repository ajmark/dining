(function () {
  "use strict";
  App.Models.VenueModel = Backbone.Model.extend({
    // you can set any defaults you would like here
    defaults: {
      name: "",
      id: 0,
      checkCount: 0,
      hereNow: 0
    }
  });

  App.Collections.VenueCollection = Backbone.Collection.extend({
    // Reference to this collection's model.
    model: App.Models.VenueModel
  });
}());