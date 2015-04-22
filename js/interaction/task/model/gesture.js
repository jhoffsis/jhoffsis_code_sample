/**
 * Created with JetBrains WebStorm.
 * User: johnhoffsis
 * Date: 1/21/15
 * Time: 1:41 PM
 * To change this template use File | Settings | File Templates.
 */

/**
* value object that defines a gesture
*/

define(["backbone"], function (Backbone) {
    var Gesture = Backbone.Model.extend({
        defaults: {

            "id": "",
            "instrux": "",
            "type": "click",        //type can be: click|input|inputarea|keyword|keyentry|info|conversation
            "correctInput": "",     //correct answer for input and keyentry gestures
            "cue": {},              // {"text": "Cue text", "type": can be type postit or image
            "background": "",       //if undefined, gesture will use background of previous gesture
            "overlayImages": [],    //
            "hotspot": {},          //for input and click gestures: {"x": 0, "y": 0, "width": 100, "height": 100}
            "hint": "",             //reference to predefined screen area defined in Model
            "instruxLocation": "bottomcenter" // 3x3 grid of predefined locations: "topleft", "middlecenter", "bottomright", etc
        }

    });
    return Gesture;

});