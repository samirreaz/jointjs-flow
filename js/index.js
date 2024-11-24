/*! JointJS+ v3.7.3 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2023 client IO

 2024-08-26 


This Source Code Form is subject to the terms of the JointJS+ Trial License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at https://www.jointjs.com/license
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


// This ES6 version of Kitchen Sink defines everything
// in the global variable `App`.
var App = window.App || {};

// Set a default theme.
joint.setTheme('modern');

// See `views/main.js` for details.
const app = new App.MainView({ el: '#app' });

// See `views/theme-picker.js` for details.
const themePicker = new App.ThemePicker({ mainView: app });
themePicker.render();
document.body.appendChild(themePicker.el);

// Waiting for all the fonts to load before we render the default canvas content.
window.addEventListener('load', () => {
    let dataObject = {};
    setTimeout(function () {
        app.graph.fromJSON(JSON.parse(App.config.sampleGraphs.emergencyProcedure));
        console.log("Ready", app.paper.model.attributes.cells.models);
        let number_of_models = app.paper.model.attributes.cells.models.length;
        // console.log(number_of_models);
        // console.log("Ready", app.paper.model.attributes.cells.models[0]);

        for (let element of app.paper.model.attributes.cells.models) {
            // console.log(element.id);
            dataObject[element.id] = {};
            dataObject[element.id]['id'] = element.id;
            dataObject[element.id]['name'] = "10";
        }
        console.log(dataObject);
    }, 4000);
    setInterval(function () {
        let number = Math.floor(Math.random() * 10) + 1 //the + 1 makes it so its not 0.
        app.paper.model.attributes.cells.models[0].attr("label/text", " kWh \n" + number + " google");
    }, 1000);
});

// Make the `app` variable available in the console for debugging purposes.
window.app = app;
