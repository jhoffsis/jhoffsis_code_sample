/**
 * Created with JetBrains WebStorm.
 * User: johnhoffsis
 * Date: 1/21/15
 * Time: 2:18 PM
 * To change this template use File | Settings | File Templates.
 */

/**
 * conversatonview.js is a backbone ItemView that renders a gesture of type "conversation"
 * contains both a QuestionView ItemView
 * listens for "gesture-created" event
 */

define(["marionette", "jquery", "jquery-ui", "tweenmax", "shell/vent", "interaction/task/view/questionview", "text!templates/interaction/task/conversationview.html"], function (Marionette, $, jqueryui, TweenMax, vent, QuestionView, text) {

    return Marionette.ItemView.extend({

        template: text,

        // event hash
        events : {
            "click #cnv-continueButton": "onCoachContinueClicked"
        },

        // cache jQuery selectors
        ui: {
            bgContainer: "#task-bgContainer",
            scrim: ".scrim-background",
            saysBox: "#cnv-saysBox",
            coachBox: "#cnv-coachBox"
        },

        initialize: function (options) {
            // set model
            this.model = options.model;

            // listen to model changes; if new gesture type is "conversation", kick off page build
            this.listenTo(this.model, "task-model:gesture-created", this.onGestureCreated);

            this.selectedChoice = null;
        },

        onRender: function() {
            // placeholder, in case any manual rendering needs to happen
        },

        // determine whether gesture is type for us to handle; if not, return
        onGestureCreated: function() {

            var gesture = this.model.get("curGesture"),
                type = gesture.get("type");

            //if it"s a conversation gesture, then it"s not for us to handle
            if(type !== "conversation") {
                return;
            }

            this.buildPage();
        },

        buildPage: function () {
            var gesture = this.model.get("curGesture"),
                bg = gesture.get("background"),
                asset = this.model.getAssetForID(bg),
                says = gesture.get("conversation").says, // this is what goes in speech bubble
                choices = gesture.get("conversation").choices;

            //set background image if different than current one
            if(asset !== null && this.ui.bgContainer.attr("src") !== asset.src) {
                this.ui.bgContainer.attr("src", asset.src);
            }

            this.questionView = new QuestionView({model:gesture});

            // add questionView to DOM
            this.$("#cnv-qContainer").append(this.questionView.render().el);

            // listen for "choice-clicked" event
            this.listenTo(this.questionView, "choice-clicked", this.onChoiceClicked);

            // hide ui elements
            this.ui.scrim.hide();
            this.ui.saysBox.hide();
            this.ui.coachBox.hide();
            this.showQuestion(false, 0);

            // fill in says box
            this.ui.saysBox.find(".content").html(says);

            //show questions, then says box
            this.showQuestion(true);
            this.ui.saysBox.delay(500).fadeIn();
        },

        // when a choice is selected, update coach box with feedback and display it;
        // if no feedback, just call updateQuestion to evaluate selected choice
        onChoiceClicked: function (index) {

            // set reference to current choice
            this.selectedChoice = this.model.get("curGesture").get("conversation").choices[index];

            //if there is coach content, update and show coach
            if(this.selectedChoice.feedback != null && this.selectedChoice.feedback != ""){
                this.ui.coachBox.find(".content").html(this.selectedChoice.feedback);
                this.showCoach(true, 1.5);
            }else {
                // otherwise, evaluate selected choice
                this.updateQuestion();
            }
        },

        // when coach is dismissed, if isCorrect, pitch valid-gesture event
        updateQuestion: function () {

            this.numTries ++; // not sure if we will need numTries, but here until we get verification from client

            if(this.selectedChoice.isCorrect) {
                // we"re done, so bail
                this.trigger("task:valid-gesture");
            }else {
                this.questionView.disableSelectedChoice();
            }

        },

        // convenience method for updating says box
        updateSays: function (says, imgPath) {
            var me = this;

            // fade out says box, update content, then fade back in
            this.ui.saysBox.delay(200).fadeOut(400, function () {
                me.ui.saysBox.find(".content").html(says);   //update saysBox, and fade in
                me.ui.saysBox.fadeIn();
            });
        },

        // handler for dismissing coach box
        onCoachContinueClicked: function () {
            this.showCoach(false);
            this.updateQuestion();
        },

        // pass true to show, false to hide
        showCoach: function (bool, delay) {
            var _delay = delay || 0;
            if(bool) {
                this.ui.coachBox.delay(delay).fadeIn();
            } else {
                this.ui.coachBox.delay(delay).fadeOut();
            }
        },

        // pass true to show, false to hide
        showQuestion: function (bool, duration) {
            if(duration !== 0 && duration == null)
            {
                duration = 0.3;
            }
            if(bool) {
                TweenMax.to(this.questionView.ui.quesContainer, duration, {delay: 0.3, css:{right:20}});
            } else {
                TweenMax.to(this.questionView.ui.quesContainer, duration, {css:{right: -350}});
            }
        }



    });

});