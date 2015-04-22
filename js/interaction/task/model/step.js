/**
 * Created with JetBrains WebStorm.
 * User: johnhoffsis
 * Date: 1/21/15
 * Time: 1:41 PM
 * To change this template use File | Settings | File Templates.
 */

/**
 * value object that defines a step, which holds an array of gestures
 */

define(["backbone", "shell/vent", "interaction/task/model/gesture"], function (Backbone, vent, Gesture) {
    var Step = Backbone.Model.extend({
        defaults: {
            "id": "",
            "isScored": false,  // steps for PG&E are not scored, but could be in the future
            "instructions": "",
            "gestures": []
        },

        initialize: function () {
            //throw gestures into collection
            var Gestures = Backbone.Collection.extend({model:Gesture});
            this.gestures = new Gestures(this.get('gestures'));
        }

    });
    return Step;

});