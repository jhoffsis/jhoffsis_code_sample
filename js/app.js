/**
 * Created with IntelliJ IDEA.
 * User: SamBrick
 * Date: 11/04/2013
 * Time: 10:12
 * To change this template use File | Settings | File Templates.
 */
require.config({
    waitSeconds: 250,
    paths : {
        underscore : '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
        jquery : '//cdnjs.cloudflare.com/ajax/libs/jquery/1.9.0/jquery.min',
        'jquery-ui': '//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min',
        'jquery-ui-touch-punch': '//cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.2/jquery.ui.touch-punch.min',
        tweenmax: '//cdnjs.cloudflare.com/ajax/libs/gsap/1.11.8/TweenMax.min',
        backbone : '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
        'backbone.wreqr' : '//cdnjs.cloudflare.com/ajax/libs/backbone.wreqr/0.1.0/backbone.wreqr.min',
        marionette : '//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/1.8.6/backbone.marionette',
        templates : '../templates',
        text : 'lib/text',
        json2 : 'lib/json2',
        apiwrapper : 'tracking/apiwrapper',
        easeljs: '//code.createjs.com/easeljs-0.8.0.min',
        preloadjs: '//code.createjs.com/preloadjs-0.4.1.min'
    },
    shim : {
        jquery : {
            exports : 'jQuery'
        },
        'jquery-ui': {
            deps: ['jquery']
        },
        'jquery-ui-touch-punch': {
            deps: ['jquery', 'jquery-ui']
        },
        tweenmax: {
            deps: ['jquery'],
            exports: 'TweenMax'
        },
        underscore : {
            exports : '_'
        },
        marionette : {
            deps: ['backbone'],
            exports: 'Marionette'
        },
        backbone : {
            deps : ['jquery', 'underscore'],
            exports : 'Backbone'
        },
        'backbone.wreqr' : {
            deps : ['backbone'],
            exports : 'Wreqr'
        },
        'backbone.babysitter' : {
            deps : ['backbone'],
            exports : 'Babysitter'
        },
        easeljs : {exports: 'createjs'},
        preloadjs: {
            deps: ['easeljs'],
            exports: 'createjs.LoadQueue'
        }

    }
});

require(
    ["jquery",
        "jquery-ui",
        "jquery-ui-touch-punch",
        "tweenmax",
        "underscore",
        "backbone",
        "backbone.wreqr",
        "marionette",
        "shell/shellapp",
        "json2",
        "tracking/apiwrapper",
        "easeljs",
        "preloadjs"
    ],
    function($, Jqueryui, Jqueryuitouchpunch, TweenMax, _, Backbone, Wreqr, Marionette, ShellApp, apiwrapper, json2) {
        $(function() {
            //new ShellApp();
            var shell = ShellApp;
            trace("createjs: "+createjs);


            shell.start();
            //createjs.Sound.registerPlugins([createjs.WebAudioPlugin]);
            //createjs.Sound.registerPlugins([createjs.FlashPlugin]);

        });
    }
);
