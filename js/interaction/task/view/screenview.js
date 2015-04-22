/**
 * Created with JetBrains WebStorm.
 * User: johnhoffsis
 * Date: 1/21/15
 * Time: 2:18 PM
 * To change this template use File | Settings | File Templates.
 */

/**
 * screenview.js is a backbone ItemView that renders all gesture types except "conversation"
 * listens for 'gesture-created', then renders the current gesture
 */
define(["marionette", "jquery", "jquery-ui", "tweenmax", "shell/vent", "text!templates/interaction/task/screenview.html"], function (Marionette, $, jqueryui, TweenMax, vent, text) {

    return Marionette.ItemView.extend({

        template: text,

        // event hash
        events : {
            "click .task-gestureHotspot.enabled": "onHotspotClicked", // respond to click gesture
            "focus .task-gestureInput.enabled": "onInputFocus", // respond to input|inputarea gestures
            "blur .task-gestureInput.enabled": "onInputBlur",   //
            "keydown .task-gestureInput.enabled": "onInputClicked",
            "click #task-screenInstructions .standard-button": "onInstruxBoxClicked", // respond to info gesture
            "click #task-screenClick.enabled": "onScreenClicked" // capture incorrect click gesture
        },

        // cache jQuery selectors
        ui: {
            bgContainer: "#task-bgContainer",
            overlayContainer: "#task-overlayContainer",
            hintContainer: "#task-hintContainer",
            hintCallout: "#task-hintCallout",
            arrow_t: "#arrow-top",
            arrow_b: "#arrow-bottom",
            screenClick: "#task-screenClick",
            gestureContainer: "#task-gestureContainer",
            cueContainer: "#task-cueContainer",
            postit: "#task-postit",
            cueImage: "#task-cue-img",
            instruxBox: "#task-screenInstructions",

            scrim: ".scrim-background"
        },

        initialize: function (options) {
            // set model
            this.model = options.model;
            
            // listen to model changes
            this.listenTo(this.model, "task-model:gesture-created", this.onGestureCreated); // kick off page build if new gesture is not "conversation" type
            this.listenTo(this.model, "task-model:task-complete", this.onTaskComplete); // clean up

            //capture keyboard input for "keyentry" gesture
            _.bindAll(this, "onKeyDown");
            $(document).bind("keydown", this.onKeyDown);
            
            //initialize instance vars
            this.numTries = 0;
            this.hints = [];
            this.$currentHint = null;
            this.lan_id = "";

        },

        onRender: function() {
            
            // hide ui elements
            this.ui.instruxBox.hide();
            this.ui.scrim.hide();
            this.ui.hintCallout.hide();
            this.ui.postit.hide();
            this.ui.cueImage.hide();
            
            // make postit cue and cue image draggable so user can reposition at will
            
            this.ui.postit.draggable({
                handle: ".postit-handle"
            });

            this.ui.cueImage.draggable({
            });
            
            return this;
        },
        
        // determine whether gesture is type for us to handle; if not, return
        onGestureCreated: function() {
            var gesture = this.model.get("curGesture"),
                type = gesture.get("type"),
                me = this;

            //if it"s a conversation gesture, then it"s not for us to handle
            if(type === "conversation") {
                return;
            }
            
            // slight delay to prevent flicker
            setTimeout(function () {
                me.buildPage();
            }, 500);
        },
        
        // step through gesture  
        buildPage: function () {
            var me = this,
                gesture = this.model.get("curGesture"),
                type = gesture.get("type"),
                bg = gesture.get("background"),
                asset = this.model.getAssetForID(bg),
                overlayImgs = gesture.get("overlayImages"),
                instrux = gesture.get("instrux"),
                instruxLocation = gesture.get("instruxLocation"),
                hint = gesture.get("hint"), //could be string or object
                hotspot = gesture.get("hotspot"),
                cue = gesture.get("cue");

            //set background image if different than current one
            if(asset !== null && this.ui.bgContainer.attr("src") !== asset.src) {
                this.ui.bgContainer.attr("src", asset.src);
            }

            //add overlay images, if any
            this.ui.overlayContainer.empty();
            if(overlayImgs.length) {
                _.each(overlayImgs, function (overlay, index) {
                    var asset = me.model.getAssetForID(overlay.id),
                        $img = $('<img class="task-overlay-img" id="task-overlay-img-'+index+'" src="'+ asset.src + '" />');
                    $img.css({"left":overlay.coords.x + "px", "top":overlay.coords.y + "px"});
                    me.ui.overlayContainer.append($img);
                });
            }

            //add hints
            this.ui.hintContainer.empty();

            this.hints = [];

            if(typeof hint === "string" && hint !== "") {
                var $hint1 = $("<div id='hint1' class='task-hint'></div>");

                hint = this.model.getScreenArea(hint);

                if(hint !== undefined){
                    $hint1.css({
                        "width":hint.width+"px",
                        "height": hint.height+"px",
                        "left": hint.x+"px",
                        "top": hint.y+"px"
                    });
                    $hint1.css("opacity", 0);
                    this.ui.hintContainer.append($hint1);
                    this.hints.push($hint1);
                }else {
                    alert("Error: No screen area defined for hint: '"+gesture.get("hint") + "'");
                }


            }

            var $hint2 = $('<div id="hint2" class="task-hint"><img class="transparent-bg" src="assets/image/ui/transparent-bg.png"/></div>');
            $hint2.css({
                "width":hotspot.width+"px",
                "height": hotspot.height+"px",
                "left": hotspot.x+"px",
                "top": hotspot.y+"px"
            });
            $hint2.css("opacity", 0);
            this.ui.hintContainer.append($hint2);
            this.hints.push($hint2);

            //add appropriate gesture, based on type
            this.ui.gestureContainer.empty();
            var $gesture;
            switch (type){
                case "click":
                    // add transparent hotspot
                    $gesture = $("<div class='task-gestureHotspot enabled'><img class='transparent-bg' src='assets/image/ui/transparent-bg.png'/></div>");
                    break;
                case "input":
                    // add text input
                    $gesture = $("<input type='text' class='task-gestureInput enabled'>");
                    break;
                case "inputarea":
                    //add textarea input
                    $gesture = $("<textarea class='task-gestureInput textarea enabled'></textarea>");
                    break;
                case "info":
                    // do nothing; info gestures are handled by Continue button in instructions dialog
            }

            // if there is a gesture, give it appropriate dimensions and x/y, then add to DOM
            if($gesture) {
                $gesture.css({
                    "width":hotspot.width+"px",
                    "height": hotspot.height+"px",
                    "left": hotspot.x+"px",
                    "top": hotspot.y+"px"
                });
                this.ui.gestureContainer.append($gesture);
                this.ui.screenClick.addClass("enabled");
            }else {
                // if no gesture, disable the screen click interceptor
                this.ui.screenClick.removeClass("enabled");
            }

            // deal with cue...

            // hide the postit and cue image off left edge
            var xPos = (this.ui.bgContainer.offset().left + 40) + "px";
            this.ui.postit.show();
            this.ui.cueImage.show();
            this.ui.postit.css({"left": "-225px"});
            this.ui.cueImage.css({left: -(this.ui.cueImage.width()+ 50)});


            if(cue !== null) {
                // if cue is type postit...
                if(cue.type === "postit"){
                    // if user has input a personal lan id AND "LAN ID" is part of cue, we need to replace it with user's lan id
                    if(cue.text.indexOf("LAN ID") > -1 && this.lan_id !== "LAN ID") {
                        cue.text = cue.text.replace("LAN ID", this.lan_id);
                    }
                    // split on ':' - first element will be something like "Enter:"
                    //              - second element will be literal string to enter into input field
                    var textAr = cue.text.split(":");
                    var markup;
                    if(textAr.length > 1) {
                        markup = "<h3>" + textAr[0] + "</h3>" + "<h2>" + textAr[1] + "</h2>";
                    }else {
                        // if array is only one element, then cue is just the prompt
                        markup = "<h2>" + textAr[0] + "</h2>";
                    }

                    // in case the cue text needs to be multiline, we need to change css to accommodate longer text
                    if(type == "inputarea"){
                        this.ui.postit.addClass("textarea");
                    }else {
                        this.ui.postit.removeClass("textarea");
                    }

                    // now add the content, and tween in into view
                    this.ui.postit.find(".content").html(markup);
                    TweenMax.to(this.ui.postit, 1.0, {delay: 0.5, ease:Bounce.easeOut, css:{"left": xPos}});
                } else if(cue.type === "image") {
                    // if the cue is an image type...
                    var cuePath;
                    try {
                        cuePath = this.model.getAssetForID(cue.src).src;
                    }catch(e){
                        alert("Error: cue / image:/nCan't find '"+cue.src+"' in assetManifest");
                    }

                    //update the cue image src, then tween it into view
                    this.ui.cueImage.attr("src", cuePath);
                    TweenMax.to(this.ui.cueImage, 1.0, {delay: 0.5, ease:Bounce.easeOut, css:{"left": xPos}});
                }
            }

            //fill instructions
            if(this.ui.instruxBox.length) {
                // if instruxBox has already been created, we have to hide it first before re-creating
                this.ui.instruxBox.hide(300, function () {
                    // make box undraggable before recreating it
                    $(this).draggable("destroy");
                    $(this).remove();
                    me.createInstruxBox(instrux, instruxLocation, type === "info");
                });
            } else {
                this.createInstruxBox(instrux, instruxLocation, type === "info");
            }

            //lastly, if there is a text input or area, give it focus
            if(type === "input" || type === "inputarea") {
                $gesture.focus();
            }



        },

        // method for creating instrux box.
        // @ content - what to put in it
        // @ locationClass - 3x3 grid that can be set in xls; defined in task.scss
        // @ showButton - if gesture type is 'info', show the Continue button, which basically gives user a pass
        createInstruxBox: function (content, locationClass, showButton) {
            var $instruxBox = this.$(".task-screenInstructions").clone(),
                $button = $instruxBox.find(".standard-button");

            // add content
            $instruxBox.removeClass("task-screenInstructions");
            $instruxBox.attr("id", "task-screenInstructions");
            $instruxBox.find(".content").html("<p>" + content + "</p>");

            // make box draggable, so user can reposition it
            $instruxBox.draggable({
                start: function () {$(this).css({"bottom": "auto"})}
            });

            // position it
            $instruxBox.addClass(locationClass);

            // show/hide continue button
            if(showButton) {
                $button.show();
            }else {
                $button.hide();
            }

            // add to DOM, and fade in
            this.$el.append($instruxBox);
            $instruxBox.fadeIn();

            $instruxBox.css({"position": "absolute"});

            this.ui.instruxBox = $instruxBox;
        },

        // click handler for click-type gesture
        onHotspotClicked: function (e) {
            var $gesture = this.$(e.currentTarget);
            // any click on hotspot is automatically correct
            this.onCorrectGesture();
        },

        // keydown handler for input and inputarea gestures
        // if Tab or Enter is clicked on an input, evaluate the input for correctness
        onInputClicked: function (e) {
            var $gesture = this.$(e.currentTarget);
            if(e.which === "13" || e.which === "9") { //Enter key || Tab key
                // stop default behavior
                e.stopImmediatePropagation();
                e.preventDefault();
                var value = $gesture.val(),
                    correctVal = this.model.get("curGesture").get("correctInput"),
                    isCorrect = false;

                // if no correctVal defined in JSON, throw alert to help debugging
                if(correctVal === "" || correctVal === undefined) {
                    alert("There is no 'correctInput' property in the JSON for gesture with ID of '"+this.model.get("curGesture").get("gestureID")+"'");
                    return;
                }

                // strip out any <p> tags that may have been added to JSON by mistake
                if(correctVal.indexOf("<p>") > -1) {
                    correctVal = correctVal.replace("<p>", "").replace("</p>", "");
                }

                if(value.toLowerCase() === correctVal.toLowerCase()){ // evaluation is not case sensitive
                    isCorrect = true;
                }else if(correctVal.indexOf("****")>-1 && correctVal.length > 4) {
                    // if 4 asterisks, user is entering lan id, which must be captured
                    // this will count as a a correct input
                    correctVal = correctVal.replace("****", this.lan_id);
                    if(value.toLowerCase() === correctVal.toLowerCase()){
                        isCorrect = true;
                    }
                } else if (correctVal.charAt(0) === "*"){
                    //accept any input, as long as it matches in length
                    if(correctVal.length === 4){
                        this.lan_id = value;
                    }
                    if (value.length === correctVal.length) {
                        isCorrect = true;
                    }
                }else if(value.toLowerCase().indexOf(correctVal.toLowerCase()) > -1) {
                    isCorrect = true;
                }

                if(isCorrect) {
                    this.onCorrectGesture();
                }

            }
        },

        onInputBlur: function (e) {
            //hook in case need to respond to blur
        },

        // handler for keydown
        // screenview only cares if the gesture type is 'keyentry'
        onKeyDown: function (e) {
            var gesture = this.model.get('curGesture'),
                type = gesture.get('type'),
                corr, key1, key2, keys,
                chrcode;
            if(type === "keyentry") {
                // keyentry gestures can be one key (Enter), or two keys (Ctrl-1)
                corr = gesture.get('correctInput');
                keys = corr.split(':');
                key1 = keys[0];
                key2 = keys[1];
                if(key2 !== undefined && e.which.toString() === key2) {
                    // if two keys, make sure both keys match
                    if (key1 === 'ctrl' && e.ctrlKey) {
                        this.onCorrectGesture();
                    }else if(key1 === 'alt' && e.altKey) {
                        this.onCorrectGesture();
                    }else if(key1 === 'shift' && e.shiftKey) {
                        this.onCorrectGesture();
                    }

                }else if (key2 === undefined && e.which.toString() === key1){
                    //if only one key, just make sure key1 is a match
                    this.onCorrectGesture();
                }
                // stop default behavior
                e.preventDefault();
                e.stopImmediatePropagation();
            }


        },

        // handler for instrux box Continue button
        // this always results in a valid gesture
        onInstruxBoxClicked: function() {
            this.ui.instruxBox.fadeOut();
            this.trigger('task:valid-gesture');
        },

        // when click, input, inputarea, and keyentry resolve to correct
        onCorrectGesture:function () {
            this.ui.hintCallout.hide();
            this.trigger('task:valid-gesture');
        },

        // interceptor for incorrect click gestures
        onScreenClicked: function (e) {
            this.onIncorrectGesture();
        },

        // determines which hint, if any, to show in response to incorrect click
        onIncorrectGesture: function() {
            var len = this.hints.length,
                $hint;

            if (len > 1) {
                // show generic hint, which is screen area that contains the hotspot
                $hint = this.hints.shift();
                this.ui.hintCallout.find('.content').html('<p>Look in this area!</p>');
            }else if (len === 1) {
                // highlight hotspot itself
                this.ui.hintCallout.find('.content').html('<p>Click here!</p>');
                $hint = this.hints[0];
            }else if(len === 0) {
                alert("task-screenview.onIncorrectGesture: array problem");
                return;
            }

            if(this.$currentHint && this.$currentHint !== $hint) {
                // hide previously highlighted hint, if it exists
                this.$currentHint.hide();
            }

            this.$currentHint = $hint;

            // put callouts in correct place
            this.positionHintCallout();

            TweenMax.to($hint, 0.5, {delay: 0.3, css: {'opacity': 1.0}, repeat:4, yoyo:true});
            this.ui.hintCallout.fadeIn();
        },

        // calculates location for callout boxes, based on location and dimensions of current hint in relationship to browser window
        positionHintCallout: function () {
            var $hint = this.$currentHint,
                position = $hint.position(),
                xPos = position.left,
                top = position.top,
                height = this.ui.hintCallout.height(),
                width = this.ui.hintCallout.width(),
                yPos = top - height - 18,
                yOffset;

            // add/remove appropriate css classes based on x & width of hint
            if(xPos + width > this.ui.hintContainer.width() ) {
                xPos  = position.left + $hint.width() - width;
                this.ui.hintCallout.addClass('right-sided').removeClass('left-sided');
            }else {
                this.ui.hintCallout.removeClass('right-sided').addClass('left-sided');
                if($hint.width()/2 < 16 && (xPos - 14 > 0)){
                    xPos -= 14;
                }
            }

            this.ui.hintCallout.css({top:yPos, left:xPos});

            yOffset = this.ui.hintCallout.offset().top;

            // show/hide appropriate pointer based on y & height of hint
            if(yOffset > 90) {
                this.ui.arrow_t.hide();
                this.ui.arrow_b.show();
            }else {
                this.ui.arrow_b.hide();
                this.ui.arrow_t.show();
                yPos = top + $hint.height() + 18;
                this.ui.hintCallout.css({top:yPos, left:xPos});
            }
        },
        
        // clean up: hide instrux box
        onTaskComplete: function () {
            this.ui.instruxBox.fadeOut();
        }
    });

});