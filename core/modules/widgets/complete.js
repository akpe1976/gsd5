/*\
title: $:/plugins/gsd5/core/modules/widgets/complete.js
type: application/javascript
module-type: widget

Marks an action or project complete and queues the next dependent action.
\*/
(function() {

//jslint node: true, browser: true
//global $tw: false
"use_strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var CompleteWidget = function(parseTreeNode, options) {
  this.initialise(parseTreeNode, options);
};

CompleteWidget.prototype = new Widget();

CompleteWidget.prototype.render = function(parent, nextSibling) {
  var self = this;
  // Save the parent dom node
  this.parentDomNode = parent;
  // Compute our attributes
  this.computeAttributes();
  // Execute our logic
  this.execute();
  // Create our elements
  this.labelDomNode = this.document.createElement("label");
  this.inputDomNode = this.document.createElement("input");
  this.inputDomNode.setAttribute("type","checkbox");
  this.inputDomNode.setAttribute("class","tc-complete-box");
  if(this.getValue()) {
    this.inputDomNode.setAttribute("checked","true");
  }
  this.labelDomNode.appendChild(this.inputDomNode);
  this.spanDomNode = this.document.createElement("span");
  this.labelDomNode.appendChild(this.spanDomNode);
  // Add a click event handler
  this.inputDomNode.addEventListener("change", function() {
    self.handleChangeEvent();
  });
  // Insert the label into the DOM and render any children
  parent.insertBefore(this.labelDomNode,nextSibling);
  this.renderChildren(this.spanDomNode,null);
  this.domNodes.push(this.labelDomNode);
};

CompleteWidget.prototype.getValue = function() {
  var tiddler = this.wiki.getTiddler(this.completeTitle);
  if(tiddler.fields.gsd_complete === "true") {
    return true;
  }
  return false;
};

CompleteWidget.prototype.handleChangeEvent = function() {
  this.wiki.setText(this.completeTitle, "gsd_complete", null, this.inputDomNode.checked.toString());
  var now = new Date();
  this.wiki.setText(this.completeTitle, "gsd_comp_date", null, $tw.utils.stringifyDate(now));
  this.changeDependants();
  $tw.rootWidget.dispatchEvent({type: "tm-auto-save-wiki"});
};

CompleteWidget.prototype.changeDependants = function() {
  var self = this;
  if(this.inputDomNode.checked === true) {
    this.wiki.forEachTiddler(function(title, tiddler) {
      if(tiddler.fields.gsd_status === "future" && tiddler.fields.gsd_prereq === self.completeTitle) {
        this.setText(title, "gsd_status", null, "next");
      }
    });
  }
};

CompleteWidget.prototype.execute = function() {
  this.completeTitle = this.getAttribute("tiddler",this.getVariable("currentTiddler"));
  this.makeChildWidgets();
};

exports.complete = CompleteWidget;

})();
