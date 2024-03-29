John Hoffsis
Code Sample
4/21/2015

This is a sample of my code, taken from a recent project I developed for Pacific Gas and Electric company. 

I built the training as a Single Page Application that utilizes RequireJS, Backbone, Marionette, and jQuery. It uses Underscore's built in templating functionality to dynamically render html pages, and makes use of SASS to preprocess CSS. Content is externalized in JSON format and loaded as needed at runtime.

This code constitutes only a small percentage of the entire training. For example, it doesn't include any of the proprietary application shell framework code, nor does it include the full range of interactions shipped with the courseware.  It includes only the pieces directly related to one interaction type -- a software simulation I refer to as Task Model. 

The Task Model, which I architected and programmed, is a software simulation that teaches users to use PG&E's Customer Relation Management software. Users interact with the training through a variety of "gestures": clicks, inputs, simulated conversations, key presses, etc. The simulation continuously provides users with feedback on selections and choices they make as they work through the training.

To facilitate production, I created a Python script that will iterate through an Excel spreadsheet, which contains content we received from the client, and convert the spreadsheet data directly to formatted JSON.

I've included the following directories and content:
assets/ 		// images used in this instance of the simulation
data/			// the JSON file for this instance of the simulation
js/interactions/
	/model/		// model classes
	/view/		// view classes
	module.js
scss/			// SASS styles that get converted to CSS
css/			// processed .scss styles
templates/		// html templates that get rendered at runtime

Most of the relevant code is in the js/ directory, but I've included the other directories for context.

Please feel free to contact me with any questions at john@jhoffsis.com

Thanks!

John

