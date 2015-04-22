/**
 * Created with JetBrains WebStorm.
 * User: johnhoffsis
 * Date: 1/21/15
 * Time: 1:40 PM
 * To change this template use File | Settings | File Templates.
 */


define(["backbone", "shell/vent", "interaction/task/model/step"], function (Backbone, vent, Step) {
    var Model;
    Model = Backbone.Model.extend({
        defaults: {
            "assetManifest": [],    //manifest of assets that get loaded by preloadJS
            "instructions": "",
            "general": {},          //map of generic text strings used across tasks
            "task": {},             //contains all steps
            "stepIndex": -1,        //counter
            "gestureIndex": -1,     //counter
            "curStep": {},          //convenience reference to current step
            "curGesture": {},       //convenience reference to current gesture
            "screenAreas": {        //predefined areas correspond to areas in CC&B screen
                "nav": {"x": 2, "y": 5, "width": 984, "height": 51},
                "bottomnav": {"x": 2, "y": 580, "width": 984, "height": 35},
                "context": {"x": 0, "y": 65, "width": 190, "height": 355},
                "controlcentral": {"x": 10, "y": 65, "width": 805, "height": 250},
                "dashboard": {"x": 830, "y": 65, "width": 100, "height": 20},
                "submenu": {"x": 195, "y": 130, "width": 190, "height": 335},
                "menu": {"x": 195, "y": 130, "width": 190, "height": 335},
                "paymentpopup": {"x": 195, "y": 130, "width": 190, "height": 335},
                "sidemenu": {"x": 0, "y": 80, "width": 301, "height": 327},
                "submenu2": {"x": 0, "y": 80, "width": 200, "height": 335},
                "dashboardlarge": {"x": 790, "y": 80, "width": 198, "height": 528},
                "paymentpopup2": {"x": 300, "y": 200, "width": 202, "height": 215},
                "print": {"x": 300, "y": 900, "width": 202, "height": 215},
                "tabs": {"x": 5, "y": 50, "width": 300, "height": 100},
                "receiptpopup": {"x": 163, "y": 288, "width": 425, "height": 347},
                "submenu3": {"x": 100, "y": 80, "width": 200, "height": 335},
                "receiptpopup2": {"x": 293, "y": 120, "width": 425, "height": 247},
                "submenu4": {"x": 185, "y": 180, "width": 200, "height": 335},
                "submenu5": {"x": 195, "y": 130, "width": 200, "height": 335},
                "print2": {"x": 10, "y": 600, "width": 400, "height": 215},
                "print3": {"x": 10, "y": 500, "width": 400, "height": 215},
                "searchResults": {"x": 0, "y": 240, "width": 820, "height": 215},
                "okbutton": {"x": 250, "y": 5000, "width": 200, "height": 215}
            },
            "activityCompleteMessage": "<h2>Great job!</h2><p>You've successfully completed this task.</p>"
        },

        initialize: function () {
            this.stepIndex = -1;

            //throw steps into collection
            var Steps = Backbone.Collection.extend({model:Step});

            this.steps = new Steps(this.get("task").steps);
        },

        /**
         * nextStep, previousStep, nextGesture, previousGesture are
         * methods for stepping through list of gestures
         * previousStep / previousGesture are called explicitly from Task Builder and can be called from the console during development
         * "task-model:task-complete" is triggered when there are no more steps in the task
         * "task-model:step-complete" is triggered when there are no more gestures in a step
         * "task-model:gesture-created" is triggered when a curGesture changes
         */

        nextStep: function () {
            var curStep;
            this.gestureIndex = -1;

            if(this.stepIndex < this.steps.length - 1) {
                this.stepIndex ++;
                //set curStep
                curStep = this.steps.at(this.stepIndex);
                this.set("curStep", curStep);
                //set the first gestured
                this.nextGesture();
            } else {
                // no more steps, so trigger task-complete
                this.trigger("task-model:task-complete");
            }
        },

        previousStep: function () {
            var curStep;
            this.gestureIndex = -1;
            this.stepIndex --;
            curStep = this.steps.at(this.stepIndex);
            this.set("curStep", curStep);
            this.nextGesture();
        },

        nextGesture: function () {
            var curStep = this.get("curStep"),
                curGesture;

            if(this.gestureIndex < curStep.gestures.length - 1) {
                //if there are more gestures, set curGesture then trigger gesture-created
                this.gestureIndex ++;
                curGesture = curStep.gestures.at(this.gestureIndex);
                this.set("curGesture", curGesture);
                this.trigger("task-model:gesture-created");
            } else {
                //no more gestures, trigger step-complete
                this.trigger("task-model:step-complete");
            }
        },

        previousGesture: function () {
            var curStep = this.get("curStep"),
            curGesture;
            this.gestureIndex --;
            curGesture = curStep.gestures.at(this.gestureIndex);
            this.set("curGesture", curGesture);
            this.trigger("task-model:gesture-created");

        },

        //  method for getting unique id to pass to asset manager
        getAssetForID: function(id) {
            var newID = this.get("manifestID") + "_" + id;
            var asset = _.find(this.get("assetManifest"), function(item){ return item.id == newID; });
            return asset;
        },

        // convenience method for locating screen area for hinting
        getScreenArea: function(id) {
            return this.get("screenAreas")[id];
        }

    });

    return Model;

});