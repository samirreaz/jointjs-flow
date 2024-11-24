/*! JointJS+ v3.7.3 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2023 client IO

 2024-08-26 


This Source Code Form is subject to the terms of the JointJS+ Trial License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at https://www.jointjs.com/license
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


(function(joint, util) {

    'use strict';

    // Custom cells definition. It serves as a template for instantiating elements.
    // The templates are currently used in `config/stencil.js` to define the shapes in the stencil.

    joint.dia.Element.define('app.RectangularModel', {
        // Presentation attributes
        attrs: {
            root: {
                magnet: false
            },
            body: {
                width: 'calc(w)',
                height: 'calc(h)',
                // Default color of the rectangle
                fill: '#ffffff',
                // Default color of the border
                stroke: '#000000',
            },
            label: {
                // The text is centered inside the rectangle.
                x: 'calc(w / 2)',
                y: 'calc(h / 2)',
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
                // Default color of the text
                fill: '#000000'
            }
        },
        // Port groups definition and list of port items (empty by default)
        ports: {
            groups: {
                'in': {
                    markup: [{
                        tagName: 'circle',
                        selector: 'portBody',
                        attributes: {
                            'r': 10
                        }
                    }],
                    attrs: {
                        portBody: {
                            magnet: true,
                            fill: '#61549c',
                            strokeWidth: 0
                        },
                        portLabel: {
                            fontSize: 11,
                            fill: '#61549c',
                            fontWeight: 800
                        }
                    },
                    position: {
                        name: 'left'
                    },
                    label: {
                        position: {
                            name: 'left',
                            args: {
                                y: 0
                            }
                        }
                    }
                },
                'out': {
                    markup: [{
                        tagName: 'circle',
                        selector: 'portBody',
                        attributes: {
                            'r': 10
                        }
                    }],
                    position: {
                        name: 'right'
                    },
                    attrs: {
                        portBody: {
                            magnet: true,
                            fill: '#61549c',
                            strokeWidth: 0
                        },
                        portLabel: {
                            fontSize: 11,
                            fill: '#61549c',
                            fontWeight: 800
                        }
                    },
                    label: {
                        position: {
                            name: 'right',
                            args: {
                                y: 0
                            }
                        }
                    }
                }
            },
            items: []
        }
    }, {

        markup: util.svg/* xml */ `
            <rect @selector="body" />
            <text @selector="label" />
        `,

        portLabelMarkup: util.svg/* xml */ `
            <text @selector="portLabel" />
        `
    });

    joint.dia.Element.define('app.CircularModel', {
        // Presentation attributes
        attrs: {
            root: {
                magnet: false
            },
            body: {
                rx: 'calc(w / 2)',
                ry: 'calc(h / 2)',
                cx: 'calc(w / 2)',
                cy: 'calc(h / 2)',
                // Default color of the ellipse
                fill: '#ffffff',
                // Default color of the border
                stroke: '#000000',
            },
            label: {
                // The text is centered in the ellipse
                x: 'calc(w / 2)',
                y: 'calc(h / 2)',
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
                // Default color of the text
                fill: '#000000'
            }
        },
        // Port groups definition and list of port items (empty by default)
        ports: {
            groups: {
                'in': {
                    markup: [{
                        tagName: 'circle',
                        selector: 'portBody',
                        attributes: {
                            'r': 10
                        }
                    }],
                    attrs: {
                        portBody: {
                            magnet: true,
                            fill: '#61549c',
                            strokeWidth: 0
                        },
                        portLabel: {
                            fontSize: 11,
                            fill: '#61549c',
                            fontWeight: 800
                        }
                    },
                    position: {
                        name: 'ellipse',
                        args: {
                            startAngle: 0,
                            step: 30
                        }
                    },
                    label: {
                        position: {
                            name: 'radial',
                            args: null
                        }
                    }
                },
                'out': {
                    markup: [{
                        tagName: 'circle',
                        selector: 'portBody',
                        attributes: {
                            'r': 10
                        }
                    }],
                    attrs: {
                        portBody: {
                            magnet: true,
                            fill: '#61549c',
                            strokeWidth: 0
                        },
                        portLabel: {
                            fontSize: 11,
                            fill: '#61549c',
                            fontWeight: 800
                        }
                    },
                    position: {
                        name: 'ellipse',
                        args: {
                            startAngle: 180,
                            step: 30
                        }
                    },
                    label: {
                        position: {
                            name: 'radial',
                            args: null
                        }
                    }
                }
            },
            items: []
        }
    }, {

        markup: util.svg/* xml */ `
            <ellipse @selector="body" />
            <text @selector="label" />
        `,

        portLabelMarkup: util.svg/* xml */ `
            <text @selector="portLabel" />
        `
    });

})(joint, joint.util);
