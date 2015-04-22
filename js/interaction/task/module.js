/**
 * Created with JetBrains WebStorm.
 * User: johnhoffsis
 * Date: 1/21/15
 * Time: 2:17 PM
 * To change this template use File | Settings | File Templates.
 */


define(["shell/ShellApp", "shell/vent", "interaction/task/model/model", "interaction/task/view/mainview"], function(ShellApp, vent, Model, MainView){

    var currentModuleModel = ShellApp.model.get("currentInteractionModel");         // get module name from menu model
    var Module = ShellApp.module(currentModuleModel.get("moduleName"));             // set application module name from menu model
    var preloader = ShellApp.preloader;

    Module.init = function() {                                                      // init function called by shell
        Module.model = new Model(ShellApp.interactionModuleData);                   // pass in data loaded from JSON file

        Module.mainView = new MainView({model: Module.model, preloader:preloader});
        Module.initMain();
    };

    Module.initMain = function() {
        Module.show();
    };

    Module.show = function() {
        ShellApp.mainRegion.show(Module.mainView);
        vent.trigger("taskmodel:shown", Module)
    };

    Module.addFinalizer(function(){
        vent.trigger("taskmodel:ended");
        Module.model.destroy();
        Module.mainView.remove();
    });

    return Module;
});