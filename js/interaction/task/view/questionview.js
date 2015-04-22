/**
 * Created with JetBrains WebStorm.
 * User: johnhoffsis
 * Date: 9/18/13
 * Time: 3:20 PM
 * To change this template use File | Settings | File Templates.
 */

define(['marionette', 'jquery', 'jquery-ui', 'tweenmax', 'shell/vent', 'text!templates/interaction/task/questionview.html'], function (Marionette, $, jqueryui, TweenMax, vent, text) {

    return Marionette.ItemView.extend({

        template: text,

        // event hash
        events : {
            'click .cnv-choice.enabled': 'onChoiceClicked'
        },

        // cache jQuery selectors
        ui: {
            quesContainer: '#cnv-questionContainer'
        },

        initialize: function (options) {
            // set model
            this.model = options.model;

            // initialize instance vars
            this.$selectedChoice = null;
        },

        onRender: function() {

            // hack for iPad / iPhone to remove selected hover state from carrying over up
            // when html template is re-rendered

            this.isMobile = ('ontouchstart' in document.documentElement);
            if(this.isMobile) {
                $(".cnv-choice").addClass('is-mobile');
            }

            return this;
        },

        onChoiceClicked: function (e) {
            var $choice = this.$(e.currentTarget),
                id = $choice.attr('id'),
                index = Number(id.substr(id.length-1, 1)); // get index from end of id

            this.$selectedChoice = $choice;

            // disable and visually modify selected choice
            $choice.removeClass('enabled');
            $choice.addClass('selected');

            // fire event, which is handled by parent (conversationView)
            this.trigger('choice-clicked', index);
        },

        // gray out currently selected choice
        disableSelectedChoice: function () {
            this.$selectedChoice.removeClass('selected').addClass('disabled');
            this.$selectedChoice = null;
        }
    });

});