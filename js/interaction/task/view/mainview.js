/**
 * Created with JetBrains WebStorm.
 * User: johnhoffsis
 * Date: 1/21/15
 * Time: 2:19 PM
 */

/**
 * mainview.js is a backbone ItemView that handles main logic for task
 * contains both a ScreenView and a ConversationView ItemView
 * ScreenView renders all gesture types except for "conversation" gestures, which are rendered by ConversationView
 */

define(["marionette", "jquery", "jquery-ui", "tweenmax", "shell/vent", "interaction/task/view/screenview", "interaction/task/view/conversationview", "text!templates/interaction/task/mainview.html"], function (Marionette, $, jqueryui, TweenMax, vent, ScreenView, ConversationView, text) {

    return Marionette.ItemView.extend({

        template: text,

        // event hash
        events : {
            "click #task-startButton": "onStartClicked",
            "click #task-conclusionButton": "onConclusionClicked"
        },

        // cache jQuery selectors
        ui: {
            startButton: "#task-startButton",
            backgroundImage: ".background-image",
            feedbackBox: "#task-feedbackBox",
            screenContainer: "#task-screenview",
            conversationContainer: "#task-conversationview"
        },

        initialize: function (options) {
            // set model
            this.model = options.model;

            // create new ScreenView and ConversationView, and pass them models
            this.screenView = new ScreenView({model: this.model});
            this.conversationView = new ConversationView({model: this.model});

            // listen for 'valid-gesture' event, which is broadcast by Screen and Conversation Views when a
            // gesture has been completed in a valid manner
            this.listenTo(this.screenView, "task:valid-gesture", this.onValidGesture);
            this.listenTo(this.conversationView, "task:valid-gesture", this.onValidGesture);

            //initialize any instance vars


        },

        onRender: function() {

            // add screenView and conversationView to DOM
            this.ui.screenContainer.append(this.screenView.render().el);
            this.ui.conversationContainer.append(this.conversationView.render().el);

            //hide views
            this.ui.screenContainer.hide();
            this.ui.conversationContainer.hide();
            this.ui.feedbackBox.hide();
            this.ui.startButton.hide();

            //views have been rendered, so now it's safe to listen to model changes
            this.listenTo(this.model, "task-model:gesture-created", this.onGestureCreated);
            this.listenTo(this.model, "task-model:gesture-complete", this.onGestureComplete);
            this.listenTo(this.model, "task-model:step-complete", this.onStepComplete);
            this.listenTo(this.model, "task-model:task-complete", this.onTaskComplete);

            // fade in start button, which will kick off interaction
            this.ui.startButton.fadeIn();
        },

        // kick things off when Start button clicked
        onStartClicked: function() {
            this.ui.startButton.fadeOut();
            this.ui.backgroundImage.fadeOut();

            this.model.nextStep();
        },

        // broadcast by screenView and conversationView when a gesture has been completed
        onValidGesture: function (e) {
            this.model.nextGesture();
        },

        //shows/hides appropriate itemviews based on gesture type
        onGestureCreated: function(e) {

            //valid types are:
            // click|input|inputarea|keyword|keyentry|info|conversation

            var type = this.model.get("curGesture").get("type");
            switch(type) {
                case "conversation":
                    this.ui.screenContainer.fadeOut();
                    this.ui.conversationContainer.fadeIn();
                    break;
                case "click":
                case "input":
                case "inputarea":
                case "keyword":
                case "keyentry":
                case "info":
                    this.ui.screenContainer.fadeIn();
                    this.ui.conversationContainer.fadeOut();
                    break;
            }

        },

        onStepComplete: function () {
            this.model.nextStep();
        },

        onTaskComplete: function() {
            // display "completion" dialog with conclusionButton
            this.showConclusion();
        },

        showConclusion: function() {
            var completeMessage = this.model.get("general").activityCompleteMessage;

            // add conclusion message and show dialog
            this.ui.feedbackBox.find(".content").html(completeMessage);
            this.ui.feedbackBox.fadeIn();
        },

        //handler for Conclusion button, which is displayed when task has been completed
        onConclusionClicked: function () {
            this.moduleComplete();
        },

        // module is complete, show conclusion
        moduleComplete: function () {
            this.screenView.close(); //call close to stop listening to events
            this.conversationView.close(); //call close to stop listening to events

            // fire completed and ended events, which are handled by application shell
            vent.trigger("interactionmodule:completed", this);
            vent.trigger("interactionmodule:ended", this);
        }

    });

});