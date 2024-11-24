/*! JointJS+ v3.7.3 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2023 client IO

 2024-08-26 


This Source Code Form is subject to the terms of the JointJS+ Trial License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at https://www.jointjs.com/license
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


(function(joint, util) {

    // Simplified element view for the navigator.
    // The elements in the navigator are represented by simple rectangles (no labels, no ports, etc.)
    // Note: this is an advanced example of a custom element view that overrides several methods.
    joint.shapes.app.NavigatorElementView = joint.dia.ElementView.extend({

        body: null,

        markup: util.svg/* xml */`
            <rect @selector="body" fill="#31d0c6" />
        `,

        initFlag: ['RENDER', 'UPDATE', 'TRANSFORM'],

        presentationAttributes: {
            size: ['UPDATE'],
            position: ['TRANSFORM'],
            angle: ['TRANSFORM']
        },

        confirmUpdate(flags) {
            if (this.hasFlag(flags, 'RENDER')) this.render();
            if (this.hasFlag(flags, 'UPDATE')) this.update();
            if (this.hasFlag(flags, 'TRANSFORM')) this.updateTransformation();
        },

        render() {
            const { el, markup } = this;
            const doc = util.parseDOMJSON(markup);
            this.body = doc.selectors.body;
            el.appendChild(doc.fragment);
        },

        update() {
            const { model, body } = this;
            const { width, height } = model.size();
            body.setAttribute('width', width);
            body.setAttribute('height', height);
        }
    });

})(joint, joint.util);
