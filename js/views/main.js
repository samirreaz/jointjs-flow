/*! JointJS+ v3.7.3 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2023 client IO

 2024-08-26 


This Source Code Form is subject to the terms of the JointJS+ Trial License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at https://www.jointjs.com/license
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


var App = window.App || {};

(function (joint, config) {

    'use strict';

    App.MainView = joint.mvc.View.extend({

        className: 'app',

        events: {
            'mouseup input[type="range"]': 'removeTargetFocus',
            'mousedown': 'removeFocus',
            'touchstart': 'removeFocus'
        },

        init() {
            this.initializePaper();
            this.initializeStencil();
            this.initializeNavigator();
            this.initializeSelection();
            this.initializeToolbar();
            this.initializeKeyboardShortcuts();
            this.initializeTooltips();
            this.initializeContextMenu();
            this.initializeLinkTools();
        },

        // Create a graph, paper and wrap the paper in a PaperScroller.
        initializePaper() {

            const graph = this.graph = new joint.dia.Graph;

            this.commandManager = new joint.dia.CommandManager({ graph });

            const paper = this.paper = new joint.dia.Paper({
                gridSize: 10,
                drawGrid: true,
                model: graph,
                defaultLink: new joint.shapes.app.Link,
                defaultConnectionPoint: joint.shapes.app.Link.connectionPoint,
                interactive: { linkMove: false },
                async: true,
                sorting: joint.dia.Paper.sorting.APPROX
            });

            this.snaplines = new joint.ui.Snaplines({ paper: paper });

            const paperScroller = this.paperScroller = new joint.ui.PaperScroller({
                baseWidth: 1000,
                baseHeight: 1000,
                paper,
                autoResizePaper: true,
                scrollWhileDragging: true,
                cursor: 'grab'
            });

            this.el.querySelector('.paper-container').appendChild(paperScroller.el);
            paperScroller.render().adjustPaper().center();

            paper.on('paper:pan', (evt, tx, ty) => {
                evt.preventDefault();
                paperScroller.el.scrollLeft += tx;
                paperScroller.el.scrollTop += ty;
            });

            paper.on('paper:pinch', (evt, ox, oy, scale) => {
                // the default is already prevented
                const zoom = paperScroller.zoom();
                paperScroller.zoom(zoom * scale, { min: 0.2, max: 5, ox, oy, absolute: true });
            });
        },

        // Create and populate stencil.
        initializeStencil() {

            const stencil = this.stencil = new joint.ui.Stencil({
                paper: this.paperScroller,
                snaplines: this.snaplines,
                scaleClones: true,
                width: 240,
                dropAnimation: true,
                groupsToggleButtons: true,
                search: {
                    '*': ['type', 'attrs/text/text', 'attrs/root/dataTooltip', 'attrs/label/text'],
                    'org.Member': ['attrs/.rank/text', 'attrs/root/dataTooltip', 'attrs/.name/text']
                },
                layout: {
                    columns: 2,
                    marginX: 10,
                    marginY: 10,
                    columnGap: 10,
                    columnWidth: 100,
                    // reset defaults
                    resizeToFit: false,
                    dx: 0,
                    dy: 0
                },
                // Remove tooltip definition from clone
                dragStartClone: (cell) => cell.clone().removeAttr('root/dataTooltip')
            });

            this.el.querySelector('.stencil-container').appendChild(stencil.el);

            // Define groups and populate stencil with elements
            // Edit `js/config/stencil.js` in order to change stencil groups and shapes
            stencil.options.groups = config.stencil.groups;
            stencil.render()
            stencil.load(config.stencil.shapes);
        },

        initializeSelection() {

            this.clipboard = new joint.ui.Clipboard();

            // Edit `config/selection.js` to add/remove selection handles
            this.selection = new joint.ui.Selection({
                paper: this.paperScroller,
                handles: config.selection.handles,
                useModelGeometry: true,
                allowCellInteraction: true,
                translateConnectedLinks: joint.ui.Selection.ConnectedLinksTranslation.SUBGRAPH
            });

            this.selection.collection.on('reset add remove', () => this.onSelectionChange());

            this.graph.on('remove', (cell) => {
                const { selection } = this;
                // If element is removed from the graph, remove from the selection too.
                if (!selection.collection.has(cell)) return;
                selection.collection.reset(selection.collection.toArray().filter(c => c !== cell));
            });

            this.paper.on('blank:pointerdown', (evt, x, y) => {
                const { selection, keyboard, paper, paperScroller } = this;
                // Initiate selecting when the user grabs the blank area of the paper while the Shift key is pressed.
                // Otherwise, initiate paper pan.
                if (keyboard.isActive('shift', evt)) {
                    selection.startSelecting(evt);
                } else {
                    selection.collection.reset([]);
                    paperScroller.startPanning(evt, x, y);
                    paper.removeTools();
                }
            });

            this.paper.on('cell:pointerdown element:magnet:pointerdown', (cellView, evt) => {
                const { selection, keyboard } = this;
                // Initiate selecting when the user grabs a cell while shift is pressed.
                if (!keyboard.isActive('shift', evt)) return;
                cellView.preventDefaultInteraction(evt);
                selection.startSelecting(evt);
            });

            this.paper.on('element:pointerdown', (elementView, evt) => {
                const { selection, keyboard } = this;
                const element = elementView.model;
                // Cherry-pick elements while CTRL/Meta key is pressed.
                if (!keyboard.isActive('ctrl meta', evt)) return;
                // Select an element if CTRL/Meta key is pressed while the element is clicked.
                if (selection.collection.find(cell => cell.isLink())) {
                    // Do not allow mixing links and elements in the selection
                    selection.collection.reset([element]);
                } else {
                    if (selection.collection.includes(element)) {
                        selection.collection.remove(element);
                    } else {
                        selection.collection.add(element);
                    }
                }
            });

            this.paper.on('cell:pointerup', (cellView, evt) => {
                const { selection } = this;
                const cell = cellView.model;
                // Select a single cell when the user clicks on it
                // unless the cell is already part of the selection.
                if (this.keyboard.isActive('ctrl meta', evt)) return;
                if (selection.collection.includes(cell)) return;
                selection.collection.reset([cell]);
            });

            this.stencil.on('element:drop', (elementView) => {
                const { selection } = this;
                // Select the element when dropped into paper
                selection.collection.reset([elementView.model]);
            });
        },

        initializeNavigator() {

            const navigator = this.navigator = new joint.ui.Navigator({
                width: 240,
                height: 115,
                paperScroller: this.paperScroller,
                zoom: {
                    grid: 0.2,
                    min: 0.2,
                    max: 5
                },
                paperOptions: {
                    async: true,
                    autoFreeze: true,
                    sorting: joint.dia.Paper.sorting.NONE,
                    elementView: joint.shapes.app.NavigatorElementView,
                    // Do not display links in the navigator
                    viewport: (view) => view.model.isElement(),
                    cellViewNamespace: { /* no other views are accessible in the navigator */ }
                }
            });

            this.el.querySelector('.navigator-container').appendChild(navigator.el);
            navigator.render();
        },

        initializeToolbar() {
            // See `config/toolbars.js` in order to add/remove toolbar buttons
            // The button actions are defined later in this method.
            const toolbar = this.toolbar = new joint.ui.Toolbar({
                autoToggle: true,
                groups: config.toolbar.groups,
                tools: config.toolbar.tools,
                references: {
                    paperScroller: this.paperScroller,
                    commandManager: this.commandManager
                }
            });

            toolbar.on({
                'svg:pointerclick': () => this.openAsSVG(),
                'png:pointerclick': () => this.openAsPNG(),
                'json:pointerclick': () => this.openAsJSON(),
                'to-front:pointerclick': () => this.sendToFront(),
                'to-back:pointerclick': () => this.sendToBack(),
                'layout:pointerclick': () => this.layoutDirectedGraph(),
                'clear:pointerclick': () => this.graph.clear(),
                'print:pointerclick': () => joint.format.print(this.paper),
                'snapline:change': (enabled) => this.toggleSnaplines(enabled),
                'grid-size:change': (gridSize) => this.paper.setGridSize(gridSize)
            });

            this.el.querySelector('.toolbar-container').appendChild(toolbar.el);
            toolbar.render();
        },

        initializeKeyboardShortcuts() {

            this.keyboard = new joint.ui.Keyboard();
            this.keyboard.on({

                'ctrl+c': () => {
                    // Copy all selected elements and their associated links.
                    this.clipboard.copyElements(this.selection.collection, this.graph);
                },

                'ctrl+v': () => {
                    const pastedCells = this.clipboard.pasteCells(this.graph);
                    const elements = pastedCells.filter((cell) => cell.isElement());
                    // Make sure pasted elements get selected immediately. This makes the UX better as
                    // the user can immediately manipulate the pasted elements.
                    this.selection.collection.reset(elements);
                },

                'ctrl+x shift+delete': () => {
                    this.clipboard.cutElements(this.selection.collection, this.graph);
                },

                'delete backspace': (evt) => {
                    evt.preventDefault();
                    this.graph.removeCells(this.selection.collection.toArray());
                },

                'ctrl+z': () => {
                    this.commandManager.undo();
                    this.selection.collection.reset([]);
                },

                'ctrl+y': () => {
                    this.commandManager.redo();
                    this.selection.collection.reset([]);
                },

                'ctrl+a': () => {
                    this.selection.collection.reset(this.graph.getElements());
                },

                'ctrl+plus': (evt) => {
                    evt.preventDefault();
                    this.paperScroller.zoom(0.2, { max: 5, grid: 0.2 });
                },

                'ctrl+minus': (evt) => {
                    evt.preventDefault();
                    this.paperScroller.zoom(-0.2, { min: 0.2, grid: 0.2 });
                },

                'keydown:shift': (evt) => {
                    this.paperScroller.setCursor('crosshair');
                },

                'keyup:shift': () => {
                    this.paperScroller.setCursor('grab');
                }
            });
        },

        initializeContextMenu() {

            this.paper.on('blank:contextmenu', (evt) => {
                this.openContextMenu({ x: evt.clientX, y: evt.clientY });
            });

            this.paper.on('cell:contextmenu', (cellView, evt) => {
                this.openContextMenu({ x: evt.clientX, y: evt.clientY }, [cellView.model]);
            });

            this.selection.on('selection-box:pointerup', (elementView, evt) => {
                if (evt.button !== 2) return;
                evt.stopPropagation();
                this.openContextMenu({ x: evt.clientX, y: evt.clientY }, this.selection.collection.toArray());
            });
        },

        initializeTooltips() {

            this.tooltip = new joint.ui.Tooltip({
                rootTarget: document.body,
                target: '[data-tooltip]',
                direction: 'auto',
                padding: 10,
                animation: true
            });
        },

        initializeLinkTools() {

            this.paper.on('link:mouseenter', (linkView) => {
                // Open tool only if there is none yet
                if (linkView.hasTools()) return;
                const ns = joint.linkTools;
                const toolsView = new joint.dia.ToolsView({
                    name: 'link-hover',
                    tools: [
                        new ns.Vertices({ vertexAdding: false }),
                        new ns.SourceArrowhead(),
                        new ns.TargetArrowhead()
                    ]
                });
                linkView.addTools(toolsView);
            });

            this.paper.on('link:mouseleave', (linkView) => {
                // Remove only the hover tool, not the pointerdown tool
                if (!linkView.hasTools('link-hover')) return;
                linkView.removeTools();
            });

            this.graph.on('change', (cell, opt) => {
                // If the selected link is updated through the inspector, we
                // hide all the tools but the `Boundary`,
                if (!cell.isLink() || !opt.inspector) return;
                const ns = joint.linkTools;
                const toolsView = new joint.dia.ToolsView({
                    name: 'link-inspected',
                    tools: [
                        new ns.Boundary({ padding: 15 }),
                    ]
                });
                cell.findView(this.paper).addTools(toolsView);
            });
        },

        // Read the inspector config based on the cell type and display the inspector.
        openInspector(cell) {
            const type = cell.get('type');
            // Edit `config/inspector.js` to adjust the property editor.
            const inspectorConfig = config.inspector[type];
            if (!inspectorConfig) {
                console.warn(`The inspector configuration for '${type}' type should be added to the 'config/inspector.js' file`);
            }
            return joint.ui.Inspector.create('.inspector-container', {
                ...inspectorConfig,
                cell,
            });
        },

        openContextMenu(point, cellsToCopy = []) {
            const { paper, graph, selection, clipboard } = this;

            const contextToolbar = new joint.ui.ContextToolbar({
                target: point,
                root: paper.el,
                padding: 0,
                vertical: true,
                anchor: 'top-left',
                tools: [{
                    action: 'copy',
                    content: 'Copy',
                    attrs: {
                        'disabled': cellsToCopy.length === 0
                    }
                }, {
                    action: 'paste',
                    content: 'Paste',
                    attrs: {
                        'disabled': clipboard.isEmpty()
                    }
                }]
            });

            contextToolbar.on('action:copy', () => {
                contextToolbar.remove();
                clipboard.copyElements(cellsToCopy, this.graph);
            });

            contextToolbar.on('action:paste', () => {
                contextToolbar.remove();
                const pastedCells = clipboard.pasteCellsAtPoint(graph, paper.clientToLocalPoint(point));
                const elements = pastedCells.filter(cell => cell.isElement());
                // Make sure pasted elements get selected immediately. This makes the UX better as
                // the user can immediately manipulate the pasted elements.
                selection.collection.reset(elements);
            });

            contextToolbar.render();
            selection.collection.reset(cellsToCopy);
        },

        onSelectionChange() {
            const { paper, selection } = this;
            const selectedCells = selection.collection.toArray();
            paper.removeTools();
            joint.ui.Halo.clear(paper);
            joint.ui.FreeTransform.clear(paper);
            joint.ui.Inspector.close();
            if (selectedCells.length === 1) {
                const [primaryCell] = selectedCells;
                const primaryCellView = paper.findViewByModel(primaryCell);
                selection.destroySelectionBox(primaryCell);
                this.selectPrimaryCell(primaryCellView);
            } else if (selectedCells.length === 2) {
                selectedCells.forEach((cell) => selection.createSelectionBox(cell));
            }
        },

        selectPrimaryCell(cellView) {
            const cell = cellView.model
            if (cell.isElement()) {
                this.selectPrimaryElement(cellView);
            } else {
                this.selectPrimaryLink(cellView);
            }
            this.openInspector(cell);
        },

        selectPrimaryElement(elementView) {
            const element = elementView.model;
            // Tools to resize & rotate the element
            const freeTransform = new joint.ui.FreeTransform({
                cellView: elementView,
                allowRotation: false,
                preserveAspectRatio: !!element.get('preserveAspectRatio'),
                allowOrthogonalResize: element.get('allowOrthogonalResize') !== false
            });
            freeTransform.render();
            // Other tool buttons spread around the element
            // See `js/config/halo.js`, to add/remove handles.
            const halo = new joint.ui.Halo({
                cellView: elementView,
                handles: config.halo.handles,
                useModelGeometry: true
            });
            halo.render();
        },

        selectPrimaryLink(linkView) {
            const ns = joint.linkTools;
            const toolsView = new joint.dia.ToolsView({
                name: 'link-pointerdown',
                tools: [
                    new ns.Vertices(),
                    new ns.SourceAnchor(),
                    new ns.TargetAnchor(),
                    new ns.SourceArrowhead(),
                    new ns.TargetArrowhead(),
                    new ns.Segments,
                    new ns.Boundary({ padding: 15 }),
                    new ns.Remove({ offset: -20, distance: 40 })
                ]
            });
            linkView.addTools(toolsView);
        },

        sendToFront() {
            this.graph.startBatch('selection');
            this.selection.collection.toArray().forEach(cell => cell.toFront());
            this.graph.stopBatch('selection');
        },

        sendToBack() {
            this.graph.startBatch('selection');
            this.selection.collection.toArray().forEach(cell => cell.toBack());
            this.graph.stopBatch('selection');
        },

        toggleSnaplines(checked) {
            if (checked) {
                this.snaplines.enable();
            } else {
                this.snaplines.disable();
            }
        },

        // backwards compatibility for older shapes
        exportStylesheet: '.scalable * { vector-effect: non-scaling-stroke }',

        openAsSVG() {
            const { paper } = this;
            paper.hideTools().toSVG((svg, error) => {
                if (error) {
                    console.error(error.message);
                }
                const lightbox = new joint.ui.Lightbox({
                    image: 'data:image/svg+xml,' + encodeURIComponent(svg),
                    downloadable: true,
                    fileName: 'Rappid'
                });
                lightbox.open();
                paper.showTools();
            }, {
                preserveDimensions: true,
                convertImagesToDataUris: true,
                useComputedStyles: false,
                stylesheet: this.exportStylesheet
            });
        },

        openAsPNG() {
            const { paper } = this;
            paper.hideTools().toPNG((dataURL, error) => {
                if (error) {
                    console.error(error.message);
                }
                const lightbox = new joint.ui.Lightbox({
                    image: dataURL,
                    downloadable: true,
                    fileName: 'Rappid'
                });
                lightbox.open();
                paper.showTools();
            }, {
                padding: 10,
                useComputedStyles: false,
                stylesheet: this.exportStylesheet
            });
        },

        openAsJSON() {
            console.log("Json Button Clicked", this.graph);
            const str = JSON.stringify(this.graph.toJSON());
            const bytes = new TextEncoder().encode(str);
            const blob = new Blob([bytes], { type: "application/json;charset=utf-8" });
            console.log("json", blob)
            // util.downloadBlob(blob, "joint-plus.json");
            // Replace util.downloadBlob with the following code
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = "joint-plus.json";
            link.click();
        },

        layoutDirectedGraph() {
            // Position the graph elements and links with a directed graph layout algorithm
            joint.layout.DirectedGraph.layout(this.graph, {
                setLinkVertices: true,
                rankDir: 'TB',
                marginX: 100,
                marginY: 100
            });
            // Center the graph content in the viewport
            this.paperScroller.centerContent({ useModelGeometry: true });
        },

        removeTargetFocus(evt) {
            evt.target.blur();
        },

        removeFocus(evt) {
            // do not lose focus on right-click
            if (evt.button === 2) return;
            // do not lose focus if clicking current element for a second time
            const activeElement = document.activeElement;
            const target = evt.target;
            // do not lose focus if clicking an element inside the current element
            if (activeElement.contains(target)) return;
            activeElement.blur();
            window.getSelection().removeAllRanges();
        }
    });

})(joint, App.config);
